import { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowLeft, RefreshCw, X } from 'lucide-react'
import { apiCall } from './api'
import { STATES, columns, cellInfo, report } from './seguimiento3d-model'
import './index.css'
import './seguimiento3d.css'

const BASE = import.meta.env.BASE_URL
function CellDialog({ selected, onClose }) {
  const dialog = useRef(null)
  const storageKey = `amalaya-3d-instruccion:${selected.cell.key}`
  const [draft, setDraft] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || { text: '', id: crypto.randomUUID() } }
    catch { return { text: '', id: crypto.randomUUID() } }
  })
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
    let session
    try { session = JSON.parse(localStorage.getItem('amalaya_sesion')) } catch { /* sin sesión */ }
    if (!session?.codigo) { setNotice('Inicia sesión en Amalaya para enviar. Tu texto queda guardado en este navegador.'); return }
    setSending(true); setNotice('')
    try {
      await apiCall('chinche', { codigo: session.codigo, chinche: report(cell, draft.text, draft.id, location.href.split('?')[0]) })
      setSent(true); setNotice('Indicación enviada al canal de reportes de Amalaya.')
      try { localStorage.removeItem(storageKey) } catch { /* envío confirmado */ }
    } catch (error) { setNotice(`No se confirmó el envío: ${error.message}. Puedes reintentar; conservamos tu texto.`) }
    finally { setSending(false) }
  }
  return <dialog ref={dialog} className="tracker-dialog" aria-labelledby="cell-title" onCancel={onClose} onClick={event => { if (event.target === dialog.current) onClose() }}>
    <button className="tracker-close" onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
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
      <textarea id="instruction" value={draft.text} onChange={event => change(event.target.value)} maxLength={1800} required disabled={sent || sending} placeholder="Escribe qué hacemos en este punto…" />
      <div className="tracker-dialog-actions"><a href={BASE} target="_blank" rel="noreferrer">Entrar a Amalaya</a><button disabled={sending || sent || !draft.text.trim()}>{sending ? 'Enviando…' : sent ? 'Enviada' : 'Enviar indicación'}</button></div>
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
  const targets = data ? columns(data) : []
  return <main className="tracker-page">
    <header className="tracker-toolbar">
      <a href={`${BASE}explorar.html`} aria-label="Volver al recorrido"><ArrowLeft size={20} /></a>
      <h1>Amalaya <span>/ Levantamiento 3D</span></h1>
      <a href={`${BASE}seguimiento-3d.md`} target="_blank" rel="noreferrer">Markdown</a>
      <button onClick={refresh} disabled={refreshing} aria-label="Actualizar estados"><RefreshCw size={17} /></button>
    </header>
    <div className="tracker-statusbar">
      <div className="tracker-legend">{['active', 'done', 'blocked', 'pending', 'partial'].map(value => <span key={value}><i className={`state-${value}`}>{STATES[value].symbol}</i>{STATES[value].label}</span>)}</div>
      <small>{data ? `Actualizado ${new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Hermosillo' }).format(new Date(data.updatedAt))}` : 'Cargando…'}</small>
    </div>
    {error && <p className="tracker-error" role="status">{error}</p>}
    {data && <div className="tracker-table-scroll" tabIndex="0" role="region" aria-label="Matriz de acciones por edificio">
      <table className="tracker-matrix">
        <thead><tr><th scope="col" className="tracker-sticky-col">Acciones ↓ / Edificios →</th>{targets.map(column => <th scope="col" key={column.building.id} title={`${column.block.name} · ${column.building.name}`}><strong>{column.building.id}</strong><span>{column.building.publicSpace ? 'Espacio público' : column.building.name}</span><small>{column.block.id}{column.block.testRoute ? ' · prueba' : ''}</small></th>)}</tr></thead>
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
