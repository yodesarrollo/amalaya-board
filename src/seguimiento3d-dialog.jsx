import {useEffect,useRef,useState} from 'react'
import {X} from 'lucide-react'
import {apiCall} from './api'
import {STATES,report} from './seguimiento3d-model'
import {MAX_FOTOS,prepararFoto,fotoStore,uploadPayload,adjuntarFotos} from './seguimiento3d-fotos'
const BASE=import.meta.env.BASE_URL
export default function CellDialog({ selected, onClose }) {
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
