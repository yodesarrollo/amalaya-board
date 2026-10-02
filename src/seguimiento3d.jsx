import { useCallback, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowLeft, ArrowUpRight, Building2, Check, Circle, CircleDot, Clock3,
  Compass, RefreshCw, Ruler, Trees,
} from 'lucide-react'
import './index.css'
import './seguimiento3d.css'

const BASE = import.meta.env.BASE_URL
const INTERVAL_DEFAULT = 30
const STATUS = {
  done: { label: 'Cerrado', Icon: Check, className: 'tracker-done' },
  partial: { label: 'Provisional', Icon: CircleDot, className: 'tracker-partial' },
  active: { label: 'En curso', Icon: Clock3, className: 'tracker-active' },
  waiting: { label: 'En espera', Icon: Clock3, className: 'tracker-waiting' },
  pending: { label: 'Pendiente', Icon: Circle, className: 'tracker-pending' },
}
const TASKS = [
  { id: 'plan', label: 'Planta y cartografía', Icon: Compass, shared: true },
  { id: 'street', label: 'Calzada y cruces', Icon: Ruler, shared: true },
  { id: 'sidewalkA', label: 'Banqueta lado A', Icon: Ruler, shared: true },
  { id: 'sidewalkB', label: 'Banqueta lado B', Icon: Ruler, shared: true },
  { id: 'corners', label: 'Esquinas, guarniciones y rampas', Icon: Compass, shared: true },
  { id: 'identity', label: 'Nombre, ubicación y estación 360', Icon: Building2 },
  { id: 'volume', label: 'Huella, volumen, altura y cubierta', Icon: Building2 },
  { id: 'facade', label: 'Fachada según Street View/referencia', Icon: Building2 },
  { id: 'finish', label: 'Materiales, vanos y detalle visual', Icon: Ruler },
  { id: 'equipment', label: 'Equipamiento urbano documentado', Icon: Trees },
  { id: 'qa', label: 'Comparación de vistas y cierre', Icon: Check },
]

function formatoHoras(rango) {
  if (!rango) return 'Por estimar'
  return `${rango.min}–${rango.max} h`
}

function Estado({ value }) {
  const config = STATUS[value] || STATUS.pending
  const Icon = config.Icon
  return <span className={`tracker-state ${config.className}`} title={config.label} aria-label={config.label}><Icon size={14} aria-hidden="true" /><span>{config.label}</span></span>
}

function TableBlock({ block, definitions }) {
  const targets = block.buildings || []
  if (block.kind === 'public-space' || targets.length === 0) {
    return <section className="tracker-block" aria-labelledby={`block-${block.id}`}>
      <header className="tracker-block-head">
        <div><p className="tracker-eyebrow">Espacio público · {block.route}</p><h2 id={`block-${block.id}`}>{block.name}</h2></div>
        <div className="tracker-block-aside"><strong>{formatoHoras(block.estimateHours)}</strong><a href={block.mapUrl} target="_blank" rel="noreferrer">Abrir planta <ArrowUpRight size={14} /></a></div>
      </header>
      <p className="tracker-note">{block.estimateBasis}</p>
      <div className="tracker-next"><span>Siguiente paso</span><p>{block.next}</p></div>
      <div className="tracker-shared-list">
        {TASKS.filter(task => task.shared).map(task => {
          const Icon = task.Icon
          return <div className="tracker-shared-row" key={task.id}><span><Icon size={16} />{task.label}</span><Estado value={block.sharedTasks?.[task.id]} /></div>
        })}
        <div className="tracker-shared-row"><span><Trees size={16} />Equipamiento urbano y validación del borde</span><Estado value="pending" /></div>
      </div>
    </section>
  }

  return <section className="tracker-block" aria-labelledby={`block-${block.id}`}>
    <header className="tracker-block-head">
      <div><p className="tracker-eyebrow">{block.route}{block.testRoute ? ' · Ruta de prueba' : ''}</p><h2 id={`block-${block.id}`}>{block.name}</h2></div>
      <div className="tracker-block-aside"><strong>{formatoHoras(block.estimateHours)}</strong><a href={block.mapUrl} target="_blank" rel="noreferrer">Abrir planta <ArrowUpRight size={14} /></a></div>
    </header>
    <p className="tracker-note">{block.estimateBasis}</p>
    <div className="tracker-next"><span>Siguiente paso</span><p>{block.next}</p></div>
    <div className="tracker-table-scroll" role="region" aria-label={`Matriz de ${block.name}`} tabIndex="0">
      <table className="tracker-matrix">
        <thead>
          <tr>
            <th scope="col" className="tracker-sticky-col">Trabajo por cerrar</th>
            {targets.map(target => <th scope="col" key={target.id}>
              <span className="tracker-building-id">{target.id}</span>
              <span className="tracker-building-name">{target.name}</span>
              <span className="tracker-building-time">{formatoHoras(target.estimateHours)} restantes</span>
            </th>)}
          </tr>
        </thead>
        <tbody>
          {TASKS.map(task => {
            const Icon = task.Icon
            return <tr key={task.id}>
              <th scope="row" className="tracker-sticky-col"><span className="tracker-task-label"><Icon size={15} /><span>{task.label}</span></span></th>
              {targets.map(target => <td key={target.id}>
                <Estado value={task.shared ? block.sharedTasks?.[task.id] : target.tasks?.[task.id]} />
              </td>)}
            </tr>
          })}
        </tbody>
      </table>
    </div>
    <p className="tracker-note tracker-confidence"><strong>Confianza / pendiente de cotejo:</strong> {targets.map(target => `${target.id}: ${target.confidence}`).join(' ')}</p>
    <p className="tracker-open-fronts"><strong>Frentes todavía sin nombre:</strong> {block.unnamedFronts}</p>
  </section>
}

function Seguimiento() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [lastCheck, setLastCheck] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const refresh = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true)
    try {
      const response = await fetch(`${BASE}seguimiento-3d.json?v=${Date.now()}`, { cache: 'no-store' })
      if (!response.ok) throw new Error('No se pudo actualizar el tablero.')
      const next = await response.json()
      setData(next)
      setError('')
      setLastCheck(new Date())
    } catch {
      setError('No se pudo sincronizar. Se conserva en pantalla la última versión cargada.')
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { refresh(); }, [refresh])
  useEffect(() => {
    const interval = window.setInterval(() => refresh(), Math.max(10, data?.refreshSeconds || INTERVAL_DEFAULT) * 1000)
    return () => window.clearInterval(interval)
  }, [data?.refreshSeconds, refresh])

  const summary = useMemo(() => {
    if (!data) return null
    const blocks = data.blocks || []
    const buildings = blocks.flatMap(block => block.buildings || [])
    const estimate = blocks.reduce((sum, block) => ({ min: sum.min + block.estimateHours.min, max: sum.max + block.estimateHours.max }), { min: 0, max: 0 })
    const closed = buildings.filter(building => Object.values(building.tasks || {}).every(value => value === 'done')).length
    const partialTasks = blocks.flatMap(block => [...Object.values(block.sharedTasks || {}), ...(block.buildings || []).flatMap(building => Object.values(building.tasks || {}))]).filter(value => value === 'partial').length
    return { blocks: blocks.length, buildings: buildings.length, estimate, closed, partialTasks }
  }, [data])

  const updatedAt = data?.updatedAt ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(data.updatedAt)) : 'Cargando'
  const days = summary ? `${Math.ceil(summary.estimate.min / data.schedule.hoursPerFocusDay)}–${Math.ceil(summary.estimate.max / data.schedule.hoursPerFocusDay)} días de foco` : '—'

  return <div className="tracker-page">
    <nav className="tracker-nav" aria-label="Navegación">
      <a href={`${BASE}explorar.html`}><ArrowLeft size={16} />Volver al recorrido</a>
      <a className="tracker-markdown-link" href={`${BASE}seguimiento-3d.md`} target="_blank" rel="noreferrer">Abrir Markdown <ArrowUpRight size={14} /></a>
    </nav>
    <main className="tracker-main">
      <header className="tracker-hero">
        <p className="tracker-eyebrow">AMALAYA · HERMOSILLO · CONTROL DE AVANCE</p>
        <h1>Levantamiento <em>3D</em></h1>
        <p className="tracker-lead">Cuadra por cuadra, edificio por edificio. Aquí quedan el estado, las referencias pendientes y el tiempo de trabajo estimado hasta cerrar cada frente.</p>
      </header>

      {error && <p className="tracker-error" role="status">{error}</p>}
      {!data ? <div className="tracker-loading" role="status">Conectando el tablero de seguimiento…</div> : <>
        <section className="tracker-live" aria-labelledby="live-title">
          <div className="tracker-live-icon"><Clock3 size={20} /></div>
          <div className="tracker-live-copy">
            <p className="tracker-eyebrow">ESTADO ACTUAL · {data.live.phase}</p>
            <h2 id="live-title">{data.live.title}</h2>
            <p>{data.live.detail}</p>
          </div>
          <div className="tracker-live-meta">
            <span className="tracker-live-status"><i />{STATUS[data.live.status]?.label || 'En espera'}</span>
            <span>Actualizado: {updatedAt}</span>
            <span>Se sincroniza cada {data.refreshSeconds} s</span>
          </div>
        </section>

        <section className="tracker-stats" aria-label="Resumen del levantamiento">
          <article><span>Cuadras y espacios</span><strong>{summary.blocks}</strong><small>tramos diferenciados</small></article>
          <article><span>Anclas de edificio</span><strong>{summary.buildings}</strong><small>frentes conocidos; no es el total final</small></article>
          <article><span>Cierres verificados</span><strong>{summary.closed} / {summary.buildings}</strong><small>sin cerrar por apariencia solamente</small></article>
          <article><span>Trabajo pendiente estimado</span><strong>{summary.estimate.min}–{summary.estimate.max} h</strong><small>aprox. {days}; frentes anónimos excluidos</small></article>
        </section>

        <section className="tracker-estimate" aria-label="Base de estimación">
          <div><Ruler size={18} /><strong>Cómo leer el tiempo</strong></div>
          <p>{data.schedule.basis} Son horas activas, calculadas a {data.schedule.hoursPerFocusDay} h de foco por día. Se excluyen: {data.schedule.excludes}</p>
          <p className="tracker-estimate-caution">{data.schedule.estimationCaution} Cada frente sin nombre podría sumar {formatoHoras(data.schedule.unnamedFrontHours)} {data.schedule.unnamedFrontUnit}.</p>
        </section>

        <section className="tracker-phases" aria-labelledby="phases-title">
          <div className="tracker-section-heading"><div><p className="tracker-eyebrow">RUTA DE TRABAJO</p><h2 id="phases-title">De la planta al cierre visual</h2></div><span>Los tiempos por edificio aparecen dentro de cada cuadra</span></div>
          <ol className="tracker-phase-list">
            {data.phases.map((phase, index) => <li key={phase.id} className={`tracker-phase tracker-phase-${phase.status}`}>
              <span className="tracker-phase-number">0{index + 1}</span>
              <div><div className="tracker-phase-heading"><strong>{phase.name}</strong><Estado value={phase.status} /></div><p>{phase.detail}</p></div>
              <span className="tracker-phase-time">{phase.time}</span>
            </li>)}
          </ol>
        </section>

        <section className="tracker-blocks" aria-labelledby="blocks-title">
          <div className="tracker-section-heading"><div><p className="tracker-eyebrow">MATRIZ DE SEGUIMIENTO</p><h2 id="blocks-title">Cada frente, con evidencia</h2></div><div className="tracker-legend"><Estado value="done" /><Estado value="partial" /><Estado value="pending" /></div></div>
          <p className="tracker-blocks-intro">En teléfono puedes deslizar horizontalmente cada matriz para recorrer los edificios. Las tareas de vialidad se muestran por edificio para que no se pierda qué frente comparte cada banqueta o esquina.</p>
          {data.blocks.map(block => <TableBlock key={block.id} block={block} definitions={data.taskDefinitions} />)}
        </section>
        <footer className="tracker-footer">
          <span>Amalaya · Seguimiento del levantamiento 3D</span>
          <span>Las marcas cambian al guardar y publicar un checkpoint. No se publican modelos ni datos privados en esta página.</span>
          <button type="button" onClick={() => refresh(true)} disabled={refreshing}><RefreshCw size={15} className={refreshing ? 'tracker-spinning' : ''} />Actualizar ahora</button>
        </footer>
      </>}
    </main>
  </div>
}

createRoot(document.getElementById('root')).render(<Seguimiento />)
