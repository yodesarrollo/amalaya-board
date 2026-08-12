import { useState, useRef } from 'react'
import { X, Upload, FileText, Download, Plus, Check } from 'lucide-react'
import { usarDatos } from '../datos.jsx'
import Factores from './Factores.jsx'
import ImagenDrive from './ImagenDrive.jsx'

// ============================================================
// La ficha de un espacio: Factores | Fotos | Documentos |
// Conocimientos | Tareas. Se abre con el zoom del mapa.
// Solo se muestran las pestañas cuyos datos el servidor entregó
// al rol de la sesión (el filtrado real pasa en el servidor).
// ============================================================

const PESTANAS = [
  { clave: 'factores', titulo: 'Factores', requiere: 'Factores' },
  { clave: 'fotos', titulo: 'Fotos', requiere: 'Archivos' },
  { clave: 'documentos', titulo: 'Documentos', requiere: 'Archivos' },
  { clave: 'conocimientos', titulo: 'Conocimientos', requiere: 'Conocimientos' },
  { clave: 'tareas', titulo: 'Tareas', requiere: 'Tareas' },
]

export default function FichaEspacio({ espacio, onCerrar }) {
  const { sesion, datos, modo, editarFila } = usarDatos()
  const editable = modo !== 'demo' && ['admin', 'editor'].includes(sesion?.rol)
  const [pestana, setPestana] = useState('factores')

  const visibles = PESTANAS.filter((p) => Array.isArray(datos?.[p.requiere]))
  const activa = visibles.some((p) => p.clave === pestana) ? pestana : visibles[0]?.clave

  return (
    <div className="p-5 sm:p-6">
      {/* Encabezado de la ficha */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-wide text-terciario">{espacio.tipo}</div>
          <h3 className="font-titulo text-2xl mt-0.5 truncate">{espacio.nombre}</h3>
        </div>
        <button className="text-arena hover:text-marfil p-2 -m-2 transition-colors duration-micro ease-casa" onClick={onCerrar} aria-label="Cerrar">
          <X size={20} />
        </button>
      </div>

      {/* Datos base editables (los m² alimentan el valor por acción) */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <label className="block">
          <span className="text-xs text-arena">Superficie (m²)</span>
          <input
            type="number"
            className="campo !py-2 mt-1 cifra"
            value={espacio.m2 ?? ''}
            onChange={(e) => editarFila('Espacios', espacio.id, { m2: e.target.value })}
            disabled={!editable}
            placeholder="—"
          />
        </label>
        <label className="block">
          <span className="text-xs text-arena">Estado</span>
          <select
            className="campo !py-2 mt-1"
            value={espacio.estado_desarrollo || 'idea'}
            onChange={(e) => editarFila('Espacios', espacio.id, { estado_desarrollo: e.target.value })}
            disabled={!editable}
          >
            {['idea', 'negociación', 'proyecto', 'obra', 'operando'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block mt-2">
        <span className="text-xs text-arena">Descripción</span>
        <textarea
          className="campo !py-2 mt-1 resize-none"
          rows={2}
          value={espacio.descripcion || ''}
          onChange={(e) => editarFila('Espacios', espacio.id, { descripcion: e.target.value })}
          disabled={!editable}
          placeholder={editable ? 'Qué es este espacio dentro de Amalaya…' : '—'}
        />
      </label>

      {/* Pestañas */}
      <div className="flex gap-1 mt-5 border-b border-linea overflow-x-auto" role="tablist">
        {visibles.map((p) => (
          <button
            key={p.clave}
            role="tab"
            aria-selected={activa === p.clave}
            className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors duration-micro ease-casa
              ${activa === p.clave ? 'border-oro text-marfil' : 'border-transparent text-terciario hover:text-arena'}`}
            onClick={() => setPestana(p.clave)}
          >
            {p.titulo}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activa === 'factores' && <Factores espacio={espacio} />}
        {activa === 'fotos' && <Fotos espacio={espacio} editable={editable} />}
        {activa === 'documentos' && <Documentos espacio={espacio} editable={editable} />}
        {activa === 'conocimientos' && <Conocimientos espacio={espacio} editable={editable} />}
        {activa === 'tareas' && <Tareas espacio={espacio} editable={editable} />}
      </div>
    </div>
  )
}

// ------------------------------------------------------------
// Fotos: con enlace público (el board las pinta directo).
// ------------------------------------------------------------
function Fotos({ espacio, editable }) {
  const { datos, subirArchivo } = usarDatos()
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const fotos = (datos?.Archivos || []).filter(
    (a) => String(a.espacio_id) === String(espacio.id) && a.tipo === 'foto'
  )

  async function alElegir(ev) {
    const file = ev.target.files?.[0]
    ev.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Ese archivo no es una imagen. Para PDFs y documentos usa la pestaña Documentos.')
      return
    }
    setSubiendo(true)
    setError(null)
    try {
      await subirArchivo(espacio.id, file, false)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="space-y-3">
      {fotos.length === 0 && (
        <p className="text-terciario text-sm">
          Aún no hay fotos de este espacio.{editable ? ' Sube la primera.' : ''}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {fotos.map((a) => (
          <ImagenDrive
            key={a.id}
            fileId={a.file_id}
            sz="w400"
            alt={a.nombre}
            className="w-full aspect-square object-cover rounded-xl border border-linea"
          />
        ))}
      </div>
      {editable && (
        <>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={alElegir} />
          <button className="boton-secundario w-full text-sm" onClick={() => inputRef.current?.click()} disabled={subiendo}>
            <span className="flex items-center justify-center gap-1.5">
              <Upload size={14} /> {subiendo ? 'Subiendo…' : 'Subir foto'}
            </span>
          </button>
        </>
      )}
      {error && <p className="text-ladrillo text-sm" role="alert">{error}</p>}
      <p className="text-terciario text-xs leading-relaxed">
        Las fotos quedan en Drive → AMALAYA → Espacio {espacio.id}, con enlace
        para que el board pueda mostrarlas.
      </p>
    </div>
  )
}

// ------------------------------------------------------------
// Documentos: privados en Drive; el servidor los entrega solo a
// roles de trabajo, como base64 (jamás un enlace público).
// ------------------------------------------------------------
function Documentos({ espacio, editable }) {
  const { datos, subirArchivo, verArchivo } = usarDatos()
  const [subiendo, setSubiendo] = useState(false)
  const [abriendo, setAbriendo] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const docs = (datos?.Archivos || []).filter(
    (a) => String(a.espacio_id) === String(espacio.id) && a.tipo === 'documento'
  )

  async function alElegir(ev) {
    const file = ev.target.files?.[0]
    ev.target.value = ''
    if (!file) return
    setSubiendo(true)
    setError(null)
    try {
      await subirArchivo(espacio.id, file, true)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubiendo(false)
    }
  }

  async function abrir(a) {
    setAbriendo(a.id)
    setError(null)
    try {
      const r = await verArchivo(a.file_id)
      const bytes = Uint8Array.from(atob(r.base64), (c) => c.charCodeAt(0))
      const blob = new Blob([bytes], { type: r.mime })
      const url = URL.createObjectURL(blob)
      const liga = document.createElement('a')
      liga.href = url
      liga.download = r.nombre
      liga.click()
      setTimeout(() => URL.revokeObjectURL(url), 30000)
    } catch (e) {
      setError(e.message)
    } finally {
      setAbriendo(null)
    }
  }

  return (
    <div className="space-y-3">
      {docs.length === 0 && (
        <p className="text-terciario text-sm">
          Aún no hay documentos.{editable ? ' Sube el primero (PDF, plano, contrato…).' : ''}
        </p>
      )}
      {docs.map((a) => (
        <div key={a.id} className="tarjeta p-3 flex items-center gap-3">
          <FileText size={18} className="text-oro shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-marfil truncate">{a.nombre}</div>
            <div className="text-xs text-terciario">{a.fecha}</div>
          </div>
          <button
            className="text-arena hover:text-marfil p-2 transition-colors duration-micro ease-casa"
            onClick={() => abrir(a)}
            disabled={abriendo === a.id}
            title="Descargar"
          >
            <Download size={16} className={abriendo === a.id ? 'animate-pulse' : ''} />
          </button>
        </div>
      ))}
      {editable && (
        <>
          <input ref={inputRef} type="file" className="hidden" onChange={alElegir} />
          <button className="boton-secundario w-full text-sm" onClick={() => inputRef.current?.click()} disabled={subiendo}>
            <span className="flex items-center justify-center gap-1.5">
              <Upload size={14} /> {subiendo ? 'Subiendo…' : 'Subir documento'}
            </span>
          </button>
        </>
      )}
      {error && <p className="text-ladrillo text-sm" role="alert">{error}</p>}
      <p className="text-terciario text-xs leading-relaxed">
        Los documentos quedan SIN compartir en Drive: solo se entregan aquí,
        con código válido y rol de trabajo.
      </p>
    </div>
  )
}

// ------------------------------------------------------------
// Conocimientos: lo que sabemos / lo que nos falta.
// ------------------------------------------------------------
function Conocimientos({ espacio, editable }) {
  const { datos, crearFila, editarFila, borrarFila } = usarDatos()
  const [texto, setTexto] = useState('')
  const [estado, setEstado] = useState('nos falta')
  const [error, setError] = useState(null)

  const filas = (datos?.Conocimientos || []).filter(
    (c) => String(c.espacio_id) === String(espacio.id)
  )

  async function agregar(ev) {
    ev.preventDefault()
    if (!texto.trim()) return
    setError(null)
    try {
      await crearFila('Conocimientos', {
        espacio_id: espacio.id,
        texto: texto.trim(),
        estado,
        fuente: '',
      })
      setTexto('')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-3">
      {filas.length === 0 && (
        <p className="text-terciario text-sm">
          Aquí se apunta lo que ya sabemos de este espacio y lo que nos falta averiguar.
        </p>
      )}
      {filas.map((c) => {
        const sabemos = String(c.estado).toLowerCase().includes('sabemos')
        return (
          <div key={c.id} className="tarjeta p-3 flex items-start gap-3">
            <button
              className={`shrink-0 text-xs rounded-full px-2 py-0.5 border transition-colors duration-micro ease-casa
                ${sabemos ? 'border-salvia text-salvia' : 'border-oro text-oro'}
                ${editable ? '' : 'pointer-events-none'}`}
              onClick={() => editable && editarFila('Conocimientos', c.id, { estado: sabemos ? 'nos falta' : 'lo sabemos' })}
              title={editable ? 'Cambiar estado' : undefined}
            >
              {sabemos ? 'lo sabemos' : 'nos falta'}
            </button>
            <p className="flex-1 text-sm text-marfil leading-relaxed">{c.texto}</p>
            {editable && (
              <button className="text-terciario hover:text-ladrillo p-1 transition-colors duration-micro ease-casa" onClick={() => borrarFila('Conocimientos', c.id).catch((e) => setError(e.message))} aria-label="Borrar">
                <X size={14} />
              </button>
            )}
          </div>
        )
      })}
      {editable && (
        <form className="flex gap-2" onSubmit={agregar}>
          <select className="campo !py-2 !w-auto" value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="nos falta">nos falta</option>
            <option value="lo sabemos">lo sabemos</option>
          </select>
          <input className="campo !py-2 flex-1" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Ej. planos y medidas del local" />
          <button type="submit" className="boton-primario !px-3 !py-2" disabled={!texto.trim()} aria-label="Agregar">
            <Plus size={16} />
          </button>
        </form>
      )}
      {error && <p className="text-ladrillo text-sm" role="alert">{error}</p>}
    </div>
  )
}

// ------------------------------------------------------------
// Tareas del espacio, con palomita.
// ------------------------------------------------------------
function Tareas({ espacio, editable }) {
  const { datos, crearFila, editarFila, borrarFila } = usarDatos()
  const [texto, setTexto] = useState('')
  const [responsable, setResponsable] = useState('')
  const [error, setError] = useState(null)

  const filas = (datos?.Tareas || []).filter(
    (t) => String(t.espacio_id) === String(espacio.id)
  )
  const pendientes = filas.filter((t) => String(t.hecho).toLowerCase() !== 'si')
  const hechas = filas.filter((t) => String(t.hecho).toLowerCase() === 'si')

  async function agregar(ev) {
    ev.preventDefault()
    if (!texto.trim()) return
    setError(null)
    try {
      await crearFila('Tareas', {
        espacio_id: espacio.id,
        texto: texto.trim(),
        responsable: responsable.trim(),
        fecha: new Date().toISOString().slice(0, 10),
        hecho: 'no',
      })
      setTexto('')
    } catch (e) {
      setError(e.message)
    }
  }

  function Fila({ t }) {
    const hecha = String(t.hecho).toLowerCase() === 'si'
    return (
      <div className="tarjeta p-3 flex items-center gap-3">
        <button
          className={`shrink-0 w-6 h-6 rounded-md border flex items-center justify-center transition-colors duration-micro ease-casa
            ${hecha ? 'bg-salvia border-salvia text-noche' : 'border-linea hover:border-arena'}
            ${editable ? '' : 'pointer-events-none'}`}
          onClick={() => editable && editarFila('Tareas', t.id, { hecho: hecha ? 'no' : 'si' })}
          aria-label={hecha ? 'Marcar pendiente' : 'Marcar hecha'}
        >
          {hecha && <Check size={14} />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-snug ${hecha ? 'text-terciario line-through' : 'text-marfil'}`}>{t.texto}</p>
          <p className="text-xs text-terciario mt-0.5">
            {t.responsable || 'sin responsable'}{t.fecha ? ` · ${t.fecha}` : ''}
          </p>
        </div>
        {editable && (
          <button className="text-terciario hover:text-ladrillo p-1 transition-colors duration-micro ease-casa" onClick={() => borrarFila('Tareas', t.id).catch((e) => setError(e.message))} aria-label="Borrar">
            <X size={14} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {filas.length === 0 && (
        <p className="text-terciario text-sm">
          Sin tareas para este espacio.{editable ? ' Agrega la primera.' : ''}
        </p>
      )}
      {pendientes.map((t) => <Fila key={t.id} t={t} />)}
      {hechas.length > 0 && (
        <details>
          <summary className="text-terciario text-xs cursor-pointer">{hechas.length} hecha(s)</summary>
          <div className="space-y-2 mt-2">{hechas.map((t) => <Fila key={t.id} t={t} />)}</div>
        </details>
      )}
      {editable && (
        <form className="space-y-2" onSubmit={agregar}>
          <input className="campo !py-2" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Qué hay que hacer…" />
          <div className="flex gap-2">
            <input className="campo !py-2 flex-1" value={responsable} onChange={(e) => setResponsable(e.target.value)} placeholder="Responsable" />
            <button type="submit" className="boton-primario !px-4 !py-2 text-sm" disabled={!texto.trim()}>Agregar</button>
          </div>
        </form>
      )}
      {error && <p className="text-ladrillo text-sm" role="alert">{error}</p>}
    </div>
  )
}
