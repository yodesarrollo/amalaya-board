import { useState } from 'react'
import { Plus, Target, Flag, CircleAlert, Check } from 'lucide-react'
import { usarDatos } from '../datos.jsx'
import { puedeEditarRol } from '../roles.js'
import { leerElementos } from './Rutas.jsx'
import { semaforo, accionesSinObjetivo, peticionesDe, avanceObjetivo } from '../moac.js'

// ============================================================
// Plan de acción — el mini MOAC de Amalaya (editor en adelante).
// Metas → objetivos → acciones (las Tareas de siempre, con
// objetivo_id). Cada acción lleva responsable, fecha y semáforo, y
// se puede ligar a un espacio o a una petición a la ciudad.
// Regla D.2 del MOAC: toda acción cierra un objetivo — el contador
// «acciones sin objetivo» tiene que llegar a 0.
// ============================================================

const COLOR_SEMAFORO = {
  rojo: 'bg-ladrillo', ambar: 'bg-oro', verde: 'bg-salvia', hecho: 'bg-linea', 'sin-fecha': 'bg-linea',
}
const TITULO_SEMAFORO = {
  rojo: 'Vencida', ambar: 'Vence esta semana', verde: 'A tiempo', hecho: 'Hecha', 'sin-fecha': 'Sin fecha',
}

export default function PlanAccion() {
  const { sesion, datos, modo, crearFila } = usarDatos()
  const editable = modo !== 'demo' && puedeEditarRol(sesion?.rol)
  const metas = datos?.Metas || []
  const objetivos = datos?.Objetivos || []
  const tareas = datos?.Tareas || []
  const sinObjetivo = accionesSinObjetivo(tareas, objetivos)
  const [nuevaMeta, setNuevaMeta] = useState('')

  async function agregarMeta(ev) {
    ev.preventDefault()
    if (!nuevaMeta.trim()) return
    await crearFila('Metas', { texto: nuevaMeta.trim(), responsable: sesion?.nombre || '', fecha: '', estado: 'activa' })
    setNuevaMeta('')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex-1">
          <h2 className="font-cartel font-normal uppercase tracking-wide text-2xl">Plan de acción</h2>
          <p className="text-terciario text-sm">Metas → objetivos → acciones. Toda acción cierra un objetivo.</p>
        </div>
        <div
          className={`tarjeta px-3 py-2 text-sm flex items-center gap-2 ${sinObjetivo.length ? 'border-oro' : 'border-salvia'}`}
          aria-label="Acciones sin objetivo"
          data-sin-objetivo={sinObjetivo.length}
        >
          {sinObjetivo.length ? <CircleAlert size={15} className="text-oro" /> : <Check size={15} className="text-salvia" />}
          <span className="cifra text-marfil">{sinObjetivo.length}</span>
          <span className="text-arena">acciones sin objetivo</span>
        </div>
      </div>

      {metas.length === 0 && (
        <p className="tarjeta p-5 text-terciario text-sm">Todavía no hay metas. Empieza por la meta grande del proyecto.</p>
      )}

      {metas.map((m) => (
        <Meta key={m.id} meta={m} objetivos={objetivos.filter((o) => String(o.meta) === String(m.id))} tareas={tareas} editable={editable} />
      ))}

      {editable && (
        <form className="flex gap-2" onSubmit={agregarMeta}>
          <input className="campo !py-2 flex-1 text-sm" placeholder="Nueva meta (ej. Foro operando en 2028)" value={nuevaMeta} onChange={(e) => setNuevaMeta(e.target.value)} aria-label="Nueva meta" />
          <button type="submit" className="boton-primario !px-3 !py-2 text-sm" disabled={!nuevaMeta.trim()}>
            <span className="flex items-center gap-1.5"><Plus size={14} /> Meta</span>
          </button>
        </form>
      )}

      {sinObjetivo.length > 0 && (
        <section className="tarjeta p-4 border-oro/60">
          <div className="text-xs uppercase tracking-wide text-oro mb-2">Acciones sin objetivo · asígnales uno</div>
          <ul className="space-y-2">
            {sinObjetivo.map((t) => <Accion key={t.id} tarea={t} objetivos={objetivos} editable={editable} mostrarObjetivo />)}
          </ul>
        </section>
      )}
    </div>
  )
}

function Meta({ meta, objetivos, tareas, editable }) {
  const { crearFila, sesion } = usarDatos()
  const [nuevo, setNuevo] = useState('')
  async function agregarObjetivo(ev) {
    ev.preventDefault()
    if (!nuevo.trim()) return
    await crearFila('Objetivos', { meta: meta.id, texto: nuevo.trim(), responsable: sesion?.nombre || '', fecha: '', estado: 'activo' })
    setNuevo('')
  }
  return (
    <section className="tarjeta p-4" aria-label={`Meta ${meta.texto}`}>
      <div className="flex items-center gap-2">
        <Flag size={15} className="text-oro" />
        <h3 className="font-titulo text-lg flex-1">{meta.texto}</h3>
        {meta.responsable && <span className="text-xs text-terciario">{meta.responsable}</span>}
      </div>
      <div className="mt-3 space-y-3 pl-5 border-l border-linea">
        {objetivos.map((o) => <Objetivo key={o.id} objetivo={o} tareas={tareas} editable={editable} />)}
        {objetivos.length === 0 && <p className="text-terciario text-xs">Sin objetivos todavía.</p>}
        {editable && (
          <form className="flex gap-2" onSubmit={agregarObjetivo}>
            <input className="campo !py-1.5 flex-1 text-xs" placeholder="Nuevo objetivo de esta meta" value={nuevo} onChange={(e) => setNuevo(e.target.value)} aria-label={`Nuevo objetivo para ${meta.texto}`} />
            <button type="submit" className="boton-secundario !px-2.5 !py-1.5 text-xs" disabled={!nuevo.trim()}>
              <span className="flex items-center gap-1"><Plus size={12} /> Objetivo</span>
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

function Objetivo({ objetivo, tareas, editable }) {
  const { datos } = usarDatos()
  const suyas = tareas.filter((t) => String(t.objetivo_id) === String(objetivo.id))
  const { total, hechas } = avanceObjetivo(objetivo, tareas)
  const [creando, setCreando] = useState(false)
  return (
    <div aria-label={`Objetivo ${objetivo.texto}`}>
      <div className="flex items-center gap-2">
        <Target size={13} className="text-arena" />
        <span className="text-sm text-marfil flex-1">{objetivo.texto}</span>
        <span className="text-xs text-terciario cifra">{hechas}/{total}</span>
      </div>
      <ul className="mt-1.5 space-y-1.5 pl-5">
        {suyas.map((t) => <Accion key={t.id} tarea={t} objetivos={datos?.Objetivos || []} editable={editable} />)}
      </ul>
      {editable && (creando
        ? <FormaAccion objetivo={objetivo} onListo={() => setCreando(false)} />
        : <button className="text-xs text-arena hover:text-marfil mt-1.5 pl-5 flex items-center gap-1" onClick={() => setCreando(true)}><Plus size={12} /> Acción</button>
      )}
    </div>
  )
}

function Accion({ tarea, objetivos, editable, mostrarObjetivo = false }) {
  const { datos, editarFila } = usarDatos()
  const s = semaforo(tarea)
  const espacio = (datos?.Espacios || []).find((e) => String(e.id) === String(tarea.espacio_id))
  const peticion = tarea.peticion_id ? peticionesDe(datos?.Paradas || [], datos?.Rutas || [], leerElementos).find((p) => p.id === tarea.peticion_id) : null
  const hecha = s === 'hecho'
  return (
    <li className="flex items-start gap-2 text-sm">
      <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${COLOR_SEMAFORO[s]}`} title={TITULO_SEMAFORO[s]} aria-label={TITULO_SEMAFORO[s]} />
      <div className="flex-1 min-w-0">
        <div className={hecha ? 'text-terciario line-through' : 'text-marfil'}>{tarea.texto}</div>
        <div className="text-[11px] text-terciario">
          {tarea.responsable || 'sin responsable'} · {tarea.fecha || 'sin fecha'}
          {espacio ? ` · espacio: ${espacio.nombre}` : ''}
          {peticion ? ` · petición: ${peticion.texto}` : ''}
        </div>
        {mostrarObjetivo && editable && (
          <select className="campo !py-1 !px-2 text-xs !w-auto mt-1" value="" onChange={(e) => e.target.value && editarFila('Tareas', tarea.id, { objetivo_id: e.target.value })} aria-label={`Objetivo para ${tarea.texto}`}>
            <option value="">elige su objetivo…</option>
            {objetivos.map((o) => <option key={o.id} value={o.id}>{o.texto}</option>)}
          </select>
        )}
      </div>
      {editable && (
        <button className="text-[11px] text-arena hover:text-marfil shrink-0" onClick={() => editarFila('Tareas', tarea.id, { hecho: hecha ? 'no' : 'si' })}>
          {hecha ? 'Reabrir' : 'Hecha'}
        </button>
      )}
    </li>
  )
}

function FormaAccion({ objetivo, onListo }) {
  const { datos, crearFila, sesion } = usarDatos()
  const [texto, setTexto] = useState('')
  const [responsable, setResponsable] = useState(sesion?.nombre || '')
  const [fecha, setFecha] = useState('')
  const [liga, setLiga] = useState('') // 'e:E-001' | 'p:P-001#0'
  const [ocupado, setOcupado] = useState(false)
  const peticiones = peticionesDe(datos?.Paradas || [], datos?.Rutas || [], leerElementos)

  async function enviar(ev) {
    ev.preventDefault()
    if (!texto.trim()) return
    setOcupado(true)
    try {
      await crearFila('Tareas', {
        texto: texto.trim(), responsable, fecha, hecho: 'no', objetivo_id: objetivo.id,
        espacio_id: liga.startsWith('e:') ? liga.slice(2) : '',
        peticion_id: liga.startsWith('p:') ? liga.slice(2) : '',
      })
      onListo()
    } finally {
      setOcupado(false)
    }
  }
  return (
    <form className="mt-2 ml-5 p-3 rounded-lg border border-linea space-y-2" onSubmit={enviar} aria-label="Nueva acción">
      <input className="campo !py-1.5 text-sm" placeholder="Qué se va a hacer" value={texto} onChange={(e) => setTexto(e.target.value)} autoFocus aria-label="Texto de la acción" />
      <div className="grid grid-cols-2 gap-2">
        <input className="campo !py-1.5 text-xs" placeholder="Responsable" value={responsable} onChange={(e) => setResponsable(e.target.value)} aria-label="Responsable" />
        <input className="campo !py-1.5 text-xs" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} aria-label="Fecha" />
      </div>
      <select className="campo !py-1.5 text-xs" value={liga} onChange={(e) => setLiga(e.target.value)} aria-label="Ligar a">
        <option value="">sin ligar a espacio ni petición</option>
        <optgroup label="Espacio">
          {(datos?.Espacios || []).map((e) => <option key={e.id} value={`e:${e.id}`}>{e.nombre}</option>)}
        </optgroup>
        <optgroup label="Petición a la ciudad">
          {peticiones.map((p) => <option key={p.id} value={`p:${p.id}`}>{p.texto} · {p.parada.nombre}</option>)}
        </optgroup>
      </select>
      <div className="flex gap-2 justify-end">
        <button type="button" className="boton-secundario !px-3 !py-1.5 text-xs" onClick={onListo}>Cancelar</button>
        <button type="submit" className="boton-primario !px-3 !py-1.5 text-xs" disabled={ocupado || !texto.trim()}>{ocupado ? 'Guardando…' : 'Guardar acción'}</button>
      </div>
    </form>
  )
}
