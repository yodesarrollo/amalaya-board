import { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowLeft, RefreshCw, X } from 'lucide-react'
import { apiCall } from './api'
import { STATES, columns, cellInfo, report } from './seguimiento3d-model'
import { MAX_FOTOS, prepararFoto, fotoStore, uploadPayload, adjuntarFotos } from './seguimiento3d-fotos'
import './index.css'
import './seguimiento3d.css'

const BASE = import.meta.env.BASE_URL
function BuildingPreview({ building }) {
  const progress = building.visualProgress
  if (!progress) return null
  const current = progress.current || progress.baseline
  const comparison = progress.comparisonBaseline || progress.baseline
  return <div className="tracker-building-preview">
    <a href={`${BASE}${current.url}`} target="_blank" rel="noreferrer" aria-label={`Ampliar avance de ${building.id}: ${current.title}`}>
      <img src={`${BASE}${current.url}`} alt={`${building.id} · ${current.title} · imagen del modelo`} width="160" height="100" decoding="async" />
    </a>
    <div><a href={`${BASE}modelo-completo.html?edificio=${encodeURIComponent(building.id)}`}>Ver en modelo</a>{comparison && <a href={`${BASE}${comparison.url}`} target="_blank" rel="noreferrer" title={comparison.title}>Inicio</a>}<a href={`${BASE}${current.url}`} target="_blank" rel="noreferrer">{current.label || 'Avance'}</a>{progress.manifest && <a href={`${BASE}${progress.manifest}`} target="_blank" rel="noreferrer">Registro</a>}</div>
  </div>
}
function CellDialog({ selected, onClose }) {
  const dialog = useRef(null)
  const storageKey = `amalaya-3d-instruccion:${selected.cell.key}`
  const [draft, setDraft] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || { text: '', id: crypto.randomUUID() } }
    catch { return { text: '', id: crypto.randomUUID() } }
  })
  const camera = useRef(null)
  const gallery = useRef(null)
  const [session] = useState(() => { try { return JSON.parse(localStorage.getItem('amalaya_sesion')) } catch { return null } })
  const photoKey = `${storageKey}:${session?.nombre || 'sin-sesion'}:${session?.ts || ''}`
  const [photos, setPhotos] = useState([])
  const [loadingPhotos, setLoadingPhotos] = useState(true)
  const [preparing, setPreparing] = useState(false)
  const canUpload = session?.codigo && ['admin', 'master', 'editor'].includes(session.rol)
  const busyRef = useRef(false)
  useEffect(() => {
    let active = true
    fotoStore(photoKey).then(saved => { if (active) setPhotos(saved || []) })
      .catch(error => { if (active) setNotice(error.message) })
      .finally(() => { if (active) setLoadingPhotos(false) })
    return () => { active = false }
  }, [photoKey])
  async function keepPhotos(next) {
    await fotoStore(photoKey, next)
    setPhotos(next)
  }
  async function selectPhotos(event) {
    const files = [...event.target.files]; event.target.value = ''
    if (!files.length || busyRef.current) return
    if (photos.length + files.length > MAX_FOTOS) { setNotice(`Puedes adjuntar hasta ${MAX_FOTOS} fotos por indicación.`); return }
    busyRef.current = true; setPreparing(true); setNotice('Preparando fotos…')
    try {
      const prepared = []
      for (const file of files) prepared.push(await prepararFoto(file))
      await keepPhotos([...photos, ...prepared])
      setNotice('Fotos guardadas en este navegador. Falta enviar la indicación.')
    } catch (error) { setNotice(error.message) }
    finally { busyRef.current = false; setPreparing(false) }
  }
  async function removePhoto(id) {
    try { await keepPhotos(photos.filter(p => p.id !== id)) }
    catch (error) { setNotice(error.message) }
  }
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState('')
  const [sent, setSent] = useState(false)
  const { cell, label, column } = selected
  const state = STATES[cell.state] || STATES.pending
  useEffect(() => { dialog.current.showModal() }, [])
  function change(text) {
    const next = { ...draft, text }
    setDraft(next)
    try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* el texto permanece en pantalla */ }
  }
  async function submit(event) {
    event.preventDefault()
    if (busyRef.current) return
    let currentSession
    try { currentSession = JSON.parse(localStorage.getItem('amalaya_sesion')) } catch { /* sin sesión */ }
    if (!currentSession?.codigo) { setNotice('Inicia sesión en Amalaya para enviar. Tu texto queda guardado en este navegador.'); return }
    if (photos.length && currentSession.codigo !== session?.codigo) { setNotice('La sesión cambió. Cierra este detalle y vuelve a abrirlo para enviar fotos.'); return }
    if (photos.some(p => p.state === 'uploading')) { setNotice('Una subida quedó sin confirmar. Puedes preparar un reintento debajo de esa foto; podría existir una copia en Drive. No se reintenta automáticamente.'); return }
    busyRef.current = true; setSending(true); setNotice('')
    try {
      let confirmed = [...photos]
      for (let i = 0; i < confirmed.length; i++) {
        if (confirmed[i].file_id) continue
        confirmed[i] = { ...confirmed[i], state: 'uploading' }
        await keepPhotos(confirmed)
        setNotice(`Guardando foto ${i + 1} de ${confirmed.length}…`)
        const result = await apiCall('subirArchivo', uploadPayload(cell, confirmed[i], currentSession.codigo))
        if (!result.fila?.file_id) throw new Error('El servidor no confirmó el archivo')
        confirmed[i] = { ...confirmed[i], file_id: result.fila.file_id, nombre: result.fila.nombre, state: 'uploaded' }
        await keepPhotos(confirmed)
      }
      const payload = adjuntarFotos(report(cell, draft.text || 'Evidencia fotográfica del sitio.', draft.id, location.href.split('?')[0]), confirmed)
      const locked = { ...draft, submitted: true }
      localStorage.setItem(storageKey, JSON.stringify(locked))
      setDraft(locked)
      await apiCall('chinche', { codigo: currentSession.codigo, chinche: payload })
      setSent(true); setNotice('Indicación enviada al canal de reportes de Amalaya.')
      try { await keepPhotos([]) } catch { setNotice('Indicación enviada. No se pudo limpiar la copia local de las fotos.') }
      try { localStorage.removeItem(storageKey) } catch { /* envío confirmado */ }
    } catch (error) { setNotice(`No se confirmó el envío: ${error.message}. Puedes reintentar; conservamos tu borrador. Si ya se intentó enviar la indicación, su contenido queda fijo para evitar duplicados.`) }
    finally { busyRef.current = false; setSending(false) }
  }
  return <dialog ref={dialog} className="tracker-dialog" aria-labelledby="cell-title" onCancel={event => { if (sending || preparing) event.preventDefault(); else onClose() }} onClick={event => { if (event.target === dialog.current && !sending && !preparing) onClose() }}>
    <button className="tracker-close" disabled={sending || preparing} onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
    <p className={`tracker-dialog-state state-${cell.state}`}>{state.label}</p>
    <h2 id="cell-title">{column.building.id} · {label}</h2>
    <p>{column.building.name}</p>
    {cell.shared && <p className="tracker-muted">Compartido por la cuadra {column.block.id}.</p>}
    {cell.state === 'blocked' ? <div className="tracker-problem"><strong>{cell.issue?.title || 'Problema pendiente de documentar'}</strong><p>{cell.issue?.detail || 'Todavía no hay detalle registrado para esta celda.'}</p></div>
      : <p className="tracker-muted">{cell.state === 'partial' ? 'Existe una base provisional; falta verificarla para marcar terminado.' : state.label}</p>}
    {cell.detail && <p className="tracker-muted">{cell.detail}</p>}
    {cell.evidence.map(item => <a className="tracker-evidence" key={item.url} href={`${BASE}${item.url}`} target="_blank" rel="noreferrer"><img src={`${BASE}${item.url}`} alt={item.title} /><span>{item.title}</span></a>)}
    <form onSubmit={submit}>
      <label htmlFor="instruction">Tu indicación</label>
      <textarea id="instruction" value={draft.text} onChange={event => change(event.target.value)} maxLength={1800} required={!photos.length} disabled={sent || sending || draft.submitted} placeholder="Escribe qué hacemos en este punto…" />
      <section className="tracker-photos" aria-label="Fotos del sitio">
        <p>Fotos de este punto · hasta {MAX_FOTOS}</p>
        <p className="tracker-muted">Se guardan de forma privada en Amalaya. Puedes enviar fotos con o sin texto.</p>
        <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={selectPhotos} />
        <input ref={gallery} type="file" accept="image/*" multiple hidden onChange={selectPhotos} />
        <div className="tracker-photo-actions">
          <button type="button" disabled={!canUpload || loadingPhotos || preparing || sending || sent || draft.submitted || photos.length >= MAX_FOTOS} onClick={() => camera.current.click()}>Tomar foto</button>
          <button type="button" disabled={!canUpload || loadingPhotos || preparing || sending || sent || draft.submitted || photos.length >= MAX_FOTOS} onClick={() => gallery.current.click()}>Elegir fotos</button>
        </div>
        {!canUpload && <p>Entra a Amalaya con una cuenta de edición y vuelve a abrir este detalle para adjuntar fotos.</p>}
        <div className="tracker-photo-grid">{photos.map((photo, index) => <figure key={photo.id}>
          <img src={photo.data} alt={`Foto ${index + 1} de ${cell.buildingId}`} />
          <figcaption>{photo.file_id ? 'Guardada en Amalaya' : photo.state === 'uploading' ? 'Subida sin confirmar' : 'Lista para enviar'}</figcaption>
          {photo.state === 'uploading' && !sending && <p>La conexión no confirmó esta subida. Puede existir una copia en Drive.</p>}
          {photo.state === 'uploading' && !sending && <button type="button" disabled={preparing || sent || draft.submitted} onClick={() => keepPhotos(photos.map(p => p.id === photo.id ? { ...p, state: 'pending' } : p)).catch(e => setNotice(e.message))}>Preparar reintento (puede crear copia)</button>}
          <button type="button" disabled={sending || preparing || sent || draft.submitted} onClick={() => removePhoto(photo.id)}>Quitar foto {index + 1}</button>
        </figure>)}</div>
        {!!photos.length && <p className="tracker-muted">El borrador queda en este dispositivo. Quitar una foto no borra archivos ya guardados en Amalaya.</p>}
      </section>
      <div className="tracker-dialog-actions"><a href={BASE} target="_blank" rel="noreferrer">Entrar a Amalaya</a><button disabled={loadingPhotos || preparing || sending || sent || (!draft.text.trim() && !photos.length)}>{sending ? 'Enviando…' : sent ? 'Enviada' : 'Enviar indicación'}</button></div>
      {notice && <p role="status">{notice}</p>}
    </form>
  </dialog>
}
function Seguimiento() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const response = await fetch(`${BASE}seguimiento-3d.json?v=${Date.now()}`, { cache: 'no-store' })
      if (!response.ok) throw new Error()
      setData(await response.json()); setError('')
    } catch { setError('Sin conexión. Se conserva el último estado cargado.') }
    finally { setRefreshing(false) }
  }, [])
  useEffect(() => { refresh() }, [refresh])
  useEffect(() => {
    const timer = setInterval(refresh, Math.max(10, data?.refreshSeconds || 30) * 1000)
    return () => clearInterval(timer)
  }, [data?.refreshSeconds, refresh])
  const workflow = data?.activeReview || data?.workflow
  const targets = data ? columns(data) : []
  if (data?.activeReview) targets.sort((a,b) => (workflow.buildingOrder.indexOf(a.building.id) < 0 ? 999 : workflow.buildingOrder.indexOf(a.building.id)) - (workflow.buildingOrder.indexOf(b.building.id) < 0 ? 999 : workflow.buildingOrder.indexOf(b.building.id)))
  return <main className="tracker-page">
    <header className="tracker-toolbar">
      <a href={`${BASE}explorar.html`} aria-label="Volver al recorrido"><ArrowLeft size={20} /></a>
      <h1>Amalaya <span>/ Levantamiento 3D</span></h1>
      <a href={`${BASE}modelo-completo.html`}>Abrir modelo completo</a>
      <a href={`${BASE}seguimiento-3d.md`} target="_blank" rel="noreferrer">Markdown</a>
      <button onClick={refresh} disabled={refreshing} aria-label="Actualizar estados"><RefreshCw size={17} /></button>
    </header>
    <div className="tracker-statusbar">
      <div className="tracker-legend">{['active', 'done', 'blocked', 'pending', 'partial'].map(value => <span key={value}><i className={`state-${value}`}>{STATES[value].symbol}</i>{STATES[value].label}</span>)}</div>
      <small>{data ? `Actualizado ${new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Hermosillo' }).format(new Date(data.updatedAt))}` : 'Cargando…'}</small>
    </div>
    {workflow?.mode === 'phase-rounds' && <section className="tracker-round" aria-label="Trabajo por etapas">
      <strong>Paso {workflow.round} · {workflow.actionLabel || data.taskDefinitions[workflow.task]} en todos los edificios</strong>
      <p>{(workflow.reviewedBuildings || workflow.closedBuildings).length} de {workflow.buildingOrder.length} revisados · {workflow.closedBuildings.length} resueltos · Medir → editar → verificar → actualizar imagen y registro antes del siguiente.</p>
      {workflow.unresolvedBuildings.length > 0 && <p>Pendientes de esta ronda: {workflow.unresolvedBuildings.join(', ')}.</p>}
      {workflow.previousUnresolvedBuildings?.length > 0 && <p>El paso 1 conserva contornos pendientes: {workflow.previousUnresolvedBuildings.join(', ')}. Esta ronda continúa por tu indicación.</p>}
    </section>}
    {data?.activeReview && <section className="tracker-round" aria-label="Cobertura del inventario">
      <strong>{workflow.inventoryComplete ? "Inventario revisado · toda la lámina" : "Inventario abierto · toda la lámina"}</strong>
      <p>{workflow.buildingOrder.length} columnas físicas · {workflow.addedBuildings.length} incorporadas al inventario. {workflow.inventoryComplete ? "Recorrido visual de las 12 zonas de la lámina completado, incluidos cuerpos que cruzan sus bordes." : "Continúa la revisión de cubiertas faltantes."}</p>
      <p>{workflow.readyForNextRound ? "Acción 1 terminada en todas las columnas. Los pasos 2–11 conservan su estado propio." : `Siguiente: ${workflow.nextBuilding || "enumeración de cuerpos faltantes"}, paso 1.`} Los cierres válidos anteriores se conservan; cada imagen y registro permite revisar el alcance de la planta.</p>
      <details><summary>Recorrido para enumerar los edificios faltantes</summary><p>12 sectores de búsqueda, de norte a sur y de oeste a este. Cada cuerpo confirmado recibe su propia columna; un patio o un predio no equivale automáticamente a un edificio.</p><div className="tracker-coverage">{workflow.coverageSectors.map(sector => <a key={sector.id} href={sector.mapUrl} target="_blank" rel="noreferrer">{sector.id} · {sector.state === 'done' ? 'Revisado' : 'En revisión'}</a>)}</div><p><a href={`${BASE}${workflow.mapUrl}`} target="_blank" rel="noreferrer">Ver lámina completa</a> · Plantas visuales aproximadas, sin equivalencia catastral.</p></details>
    </section>}
    {error && <p className="tracker-error" role="status">{error}</p>}
    {data && <div className="tracker-table-scroll" tabIndex="0" role="region" aria-label="Matriz de acciones por edificio">
      <table className="tracker-matrix">
        <thead><tr><th scope="col" className="tracker-sticky-col">Acciones ↓ / Edificios →</th>{targets.map(column => <th scope="col" key={column.building.id} title={`${column.block.name} · ${column.building.name}`}><BuildingPreview building={column.building} /><strong>{column.building.id}</strong><span>{column.building.publicSpace ? 'Espacio público' : column.building.name}</span><small>{column.block.id}{column.block.testRoute ? ' · prueba' : ''}</small></th>)}</tr></thead>
        <tbody>{Object.entries(data.taskDefinitions).map(([task, label], index) => <tr key={task}><th scope="row" className="tracker-sticky-col"><small>{String(index + 1).padStart(2, '0')}</small>{label}</th>{targets.map(column => {
          const cell = cellInfo(column, task)
          const state = STATES[cell.state] || STATES.pending
          return <td key={column.building.id}><button className={`tracker-cell state-${cell.state}`} aria-label={`${column.building.id}: ${label} — ${state.label}`} title={state.label} onClick={() => setSelected({ cell, label, column })}>{state.symbol}</button></td>
        })}</tr>)}</tbody>
      </table>
    </div>}
    <footer>Consulta automática cada {data?.refreshSeconds || 30} s · Estados publicados al guardar avances · Pulsa una celda para ver detalle o dejar una indicación.</footer>
    {selected && <CellDialog key={selected.cell.key} selected={selected} onClose={() => setSelected(null)} />}
  </main>
}
createRoot(document.getElementById('root')).render(<Seguimiento />)
