import { useState, useRef } from 'react'
import { X, Upload, FileText, Download, Plus, Check, Share2, ChevronLeft, ChevronRight, History, ArrowRight } from 'lucide-react'
import { usarDatos } from '../datos.jsx'
import { puedeEditarRol } from '../roles.js'
import { nombreTipo } from '../tipos.js'
import Factores, { EstadoGuardado } from './Factores.jsx'
import ImagenDrive from './ImagenDrive.jsx'
import { GLIFO_TIPO } from './Glifos.jsx'
import { m2Construidos, resumenEspacio } from '../calc.js'
import { nivelAvance } from '../avance.js'
import { moneda, fechaHora } from '../formato.js'
import { compartirCard } from '../compartir.js'

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
  { clave: 'historial', titulo: 'Historial', requiere: 'Historial' },
]

// ------------------------------------------------------------
// Representante: el artista de música regional que le pone cara
// al espacio. Vive como fila de `Archivos` con tipo='cara'
// (nombre = artista, file_id = su cara recortada en Drive), así
// que NO toca el contrato del Apps Script desplegado.
// ------------------------------------------------------------

// Candidatos iniciales (regional mexicano con raíz sonorense).
// Es solo el arranque de la lista: se puede escribir cualquier otro.
export const ARTISTAS_SEMILLA = [
  'Carin León',
  'Christian Nodal',
  'Natanael Cano',
  'Alfredo Olivas',
  'Luis R Conriquez',
  'Grupo Firme',
  'Banda MS',
  'Julión Álvarez',
  'Alfonso Ortiz Tirado (homenaje)',
]

// Caras recortadas ya empacadas con la careta (fotos libres de
// Wikimedia Commons; créditos en public/caras/CREDITOS.md). Al
// elegir uno de estos artistas su cara sale de inmediato; subir
// una foto propia desde la ficha la reemplaza.
export const CARAS_SEMILLA = {
  'Carin León': 'local:carin-leon.jpg',
  'Christian Nodal': 'local:christian-nodal.jpg',
  'Natanael Cano': 'local:natanael-cano.jpg',
  'Alfredo Olivas': 'local:alfredo-olivas.jpg',
  'Luis R Conriquez': 'local:luis-r-conriquez.jpg',
  'Grupo Firme': 'local:grupo-firme.jpg',
  'Julión Álvarez': 'local:julion-alvarez.jpg',
}

// La cara vigente de un espacio: la última fila tipo='cara'.
export function caraDeEspacio(datos, espacioId) {
  const caras = (datos?.Archivos || []).filter(
    (a) => String(a.espacio_id) === String(espacioId) && String(a.tipo) === 'cara'
  )
  return caras.length ? caras[caras.length - 1] : null
}

// Iniciales para el medallón mientras no hay foto.
export function inicialesDe(nombre) {
  return String(nombre || '')
    .split(/\s+/)
    .filter((p) => p && !/^\(/.test(p))
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}

export default function FichaEspacio({ espacio, onCerrar, onAnterior, onSiguiente, posicion }) {
  const { sesion, datos, modo, editarFila } = usarDatos()
  const editable = modo !== 'demo' && puedeEditarRol(sesion?.rol)
  const [pestana, setPestana] = useState('factores')

  const visibles = PESTANAS.filter((p) => Array.isArray(datos?.[p.requiere]))
  const activa = visibles.some((p) => p.clave === pestana) ? pestana : visibles[0]?.clave

  return (
    <div className="p-5 sm:p-6">
      {/* Encabezado de la ficha */}
      <div className="flex items-start gap-3">
        {onAnterior && (
          <button className="text-arena hover:text-marfil p-2 -m-1 mt-3" onClick={onAnterior} aria-label="Espacio anterior" title="Espacio anterior">
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-wide text-terciario">{nombreTipo(espacio.tipo)}</div>
          <h3 className="font-titulo text-2xl mt-0.5 truncate">{espacio.nombre}</h3>
          {posicion && <div className="text-[11px] text-terciario">{posicion}</div>}
        </div>
        {onSiguiente && (
          <button className="text-arena hover:text-marfil p-2 -m-1" onClick={onSiguiente} aria-label="Espacio siguiente" title="Espacio siguiente">
            <ChevronRight size={20} />
          </button>
        )}
        <button
          className="text-arena hover:text-marfil p-2 -m-1 transition-colors duration-micro ease-casa"
          onClick={() => compartirCard({ titulo: espacio.nombre, subtitulo: nombreTipo(espacio.tipo), detalle: espacio.descripcion || '' })}
          aria-label="Compartir"
          title="Genera la card para tu historia"
        >
          <Share2 size={18} />
        </button>
        <button className="text-arena hover:text-marfil p-2 -m-2 transition-colors duration-micro ease-casa" onClick={onCerrar} aria-label="Cerrar">
          <X size={20} />
        </button>
      </div>

      <ResumenArriba espacio={espacio} />

      {/* Datos base editables (los m² alimentan el valor por acción) */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <label className="block">
          <span className="text-xs text-arena">Superficie (m²)</span>
          <input
            id="campo-m2"
            type="number"
            className="campo !py-2 mt-1 cifra"
            value={espacio.m2 ?? ''}
            onChange={(e) => editarFila('Espacios', espacio.id, { m2: e.target.value })}
            disabled={!editable}
            placeholder="—"
          />
          <span className="block min-h-[1rem] mt-0.5"><EstadoGuardado tab="Espacios" id={espacio.id} /></span>
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
          id="campo-descripcion"
          className="campo !py-2 mt-1 resize-none"
          rows={2}
          value={espacio.descripcion || ''}
          onChange={(e) => editarFila('Espacios', espacio.id, { descripcion: e.target.value })}
          disabled={!editable}
          placeholder={editable ? 'Qué es este espacio dentro de Amalaya…' : '—'}
        />
      </label>

      <M2Construidos espacio={espacio} />
      <Llenado espacio={espacio} editable={editable} onIr={setPestana} />

      <Representante espacio={espacio} editable={editable} />

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
        {activa === 'historial' && <Historial espacio={espacio} />}
      </div>
    </div>
  )
}

// ------------------------------------------------------------
// m² construidos: la superficie que de verdad vale y cuesta
// (m² × COS × pisos, con los factores del espacio). El motor
// financiero usa este mismo número.
// ------------------------------------------------------------
function M2Construidos({ espacio }) {
  const { datos } = usarDatos()
  const { m2c, cos, pisos } = m2Construidos(espacio, datos?.Factores || [])
  if (cos === null && pisos === null) return null
  const partes = []
  if (cos !== null) partes.push(`COS ${cos}%`)
  if (pisos !== null) partes.push(`${pisos} pisos`)
  return (
    <p className="text-arena text-xs mt-2">
      ≈ <span className="cifra text-marfil">{Math.round(m2c).toLocaleString('es-MX')} m² construidos</span>
      {' '}({partes.join(' × ')}) — con esto se calculan valor y costo.
    </p>
  )
}

// ------------------------------------------------------------
// Termómetro de llenado: qué ya está capturado y qué falta para
// que este espacio cuente completo en el reporte.
// ------------------------------------------------------------
function Llenado({ espacio, editable, onIr }) {
  const { datos } = usarDatos()
  const id = String(espacio.id)
  const lineas = (datos?.Finanzas_Lineas || []).filter((l) => String(l.espacio_id) === id)
  // [nombre, hecho, adónde lleva el botón del «siguiente paso»]
  const pasos = [
    ['m²', Number(espacio.m2) > 0, 'campo-m2'],
    ['descripción', String(espacio.descripcion || '').trim() !== '', 'campo-descripcion'],
    ['factores', (datos?.Factores || []).some((f) => String(f.espacio_id) === id), 'factores'],
    ['un ingreso', lineas.some((l) => String(l.tipo).toLowerCase() === 'ingreso'), 'finanzas'],
    ['un costo', lineas.some((l) => String(l.tipo).toLowerCase() === 'costo'), 'finanzas'],
    ['una foto', (datos?.Archivos || []).some((a) => String(a.espacio_id) === id && a.tipo === 'foto'), 'fotos'],
  ]
  const siguiente = pasos.find(([, ok]) => !ok)
  const TEXTO_PASO = {
    'campo-m2': 'Captura los m² del espacio', 'campo-descripcion': 'Escribe qué es este espacio',
    factores: 'Agrega sus factores', finanzas: 'Captura sus líneas en Finanzas', fotos: 'Sube una foto',
  }
  function irAlPaso() {
    const destino = siguiente?.[2]
    if (!destino) return
    if (destino.startsWith('campo-')) document.getElementById(destino)?.focus()
    else if (destino === 'finanzas') onIr?.('factores')
    else onIr?.(destino)
  }
  const hechos = pasos.filter(([, ok]) => ok).length
  const faltan = pasos.filter(([, ok]) => !ok).map(([n]) => n)
  const completo = hechos === pasos.length
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs">
        <span className="uppercase tracking-wide text-terciario">Llenado del espacio</span>
        <span className={`cifra ${completo ? 'text-salvia' : 'text-arena'}`}>{hechos} de {pasos.length}</span>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-superficie overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-panel ease-casa ${completo ? 'bg-salvia' : 'bg-oro'}`}
          style={{ width: `${(hechos / pasos.length) * 100}%` }}
        />
      </div>
      {!completo && (
        <p className="text-terciario text-xs mt-1.5">Falta: {faltan.join(' · ')}.</p>
      )}
      {!completo && editable && siguiente && (
        <p className="text-xs mt-1 flex items-center gap-1.5">
          <span className="text-arena">Siguiente paso:</span>
          <button className="text-oro hover:text-ambar flex items-center gap-1" onClick={irAlPaso}>
            {TEXTO_PASO[siguiente[2]]} <ArrowRight size={12} />
          </button>
        </p>
      )}
    </div>
  )
}

// ------------------------------------------------------------
// Representante del espacio: elegir artista + subir su cara
// recortada. La cara elegida es el ícono del pin en el mapa.
// ------------------------------------------------------------
function Representante({ espacio, editable }) {
  const { datos, crearFila, editarFila, borrarFila, subirArchivo } = usarDatos()
  const cara = caraDeEspacio(datos, espacio.id)
  const [eligiendoOtro, setEligiendoOtro] = useState(false)
  const [nombreOtro, setNombreOtro] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const opciones = [...ARTISTAS_SEMILLA]
  if (cara?.nombre && !opciones.includes(cara.nombre)) opciones.unshift(cara.nombre)

  async function asignar(nombre) {
    setError(null)
    setEligiendoOtro(false)
    try {
      if (!nombre) {
        if (cara) await borrarFila('Archivos', cara.id)
        return
      }
      // Si el artista viene con cara empacada, sale de inmediato;
      // un nombre libre queda sin cara hasta que se suba una.
      const file_id = CARAS_SEMILLA[nombre] || ''
      if (cara) {
        editarFila('Archivos', cara.id, { nombre, file_id: file_id || cara.file_id })
      } else {
        await crearFila('Archivos', {
          espacio_id: espacio.id,
          tipo: 'cara',
          nombre,
          file_id,
          privado: 'no',
          fecha: new Date().toISOString().slice(0, 10),
        })
      }
    } catch (e) {
      setError(e.message)
    }
  }

  async function subirCara(ev) {
    const file = ev.target.files?.[0]
    ev.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('La cara debe ser una imagen (PNG o JPG ya recortada).')
      return
    }
    setOcupado(true)
    setError(null)
    try {
      // Sube como foto normal y se reclasifica a 'cara' con el nombre
      // del artista; la cara anterior (si había) se retira para que
      // solo quede una vigente.
      const fila = await subirArchivo(espacio.id, file, false)
      editarFila('Archivos', fila.id, { tipo: 'cara', nombre: cara?.nombre || '' })
      if (cara) await borrarFila('Archivos', cara.id)
    } catch (e) {
      setError(e.message)
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className="tarjeta p-3 mt-3">
      <div className="text-xs uppercase tracking-wide text-terciario">Representante · música regional</div>
      <div className="flex items-center gap-3 mt-2">
        {/* El medallón: cara recortada (con la insignia del tipo de
            espacio encima), o iniciales mientras no hay foto */}
        {cara?.file_id ? (
          <span className="relative shrink-0">
            <span className="block w-14 h-14 rounded-full overflow-hidden border-2 border-oro bg-noche">
              <ImagenDrive fileId={cara.file_id} sz="w200" alt={cara.nombre} className="w-full h-full object-cover" />
            </span>
            {(() => {
              const Glifo = GLIFO_TIPO[String(espacio.tipo).toLowerCase()] || GLIFO_TIPO.otro
              return (
                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center bg-oro border border-noche/60 shadow">
                  <span className="text-noche"><Glifo size={13} /></span>
                </span>
              )
            })()}
          </span>
        ) : (
          <span className="w-14 h-14 rounded-full border-2 border-dashed border-oro/60 shrink-0 flex items-center justify-center bg-superficie">
            <span className="font-cartel text-oro text-lg tracking-wide">{cara ? inicialesDe(cara.nombre) : '?'}</span>
          </span>
        )}

        <div className="flex-1 min-w-0 space-y-2">
          {!eligiendoOtro ? (
            <select
              className="campo !py-2"
              value={cara?.nombre || ''}
              disabled={!editable || ocupado}
              onChange={(e) => {
                const v = e.target.value
                if (v === '__otro') { setEligiendoOtro(true); setNombreOtro('') } else asignar(v)
              }}
            >
              <option value="">— sin representante todavía —</option>
              {opciones.map((n) => <option key={n} value={n}>{n}</option>)}
              <option value="__otro">Otro artista…</option>
            </select>
          ) : (
            <form
              className="flex gap-2"
              onSubmit={(ev) => { ev.preventDefault(); if (nombreOtro.trim()) asignar(nombreOtro.trim()) }}
            >
              <input
                className="campo !py-2 flex-1"
                value={nombreOtro}
                onChange={(e) => setNombreOtro(e.target.value)}
                placeholder="Nombre del artista…"
                autoFocus
              />
              <button type="submit" className="boton-primario !px-3 !py-2" disabled={!nombreOtro.trim()} aria-label="Asignar">
                <Check size={14} />
              </button>
              <button type="button" className="boton-secundario !px-3 !py-2" onClick={() => setEligiendoOtro(false)} aria-label="Cancelar">
                <X size={14} />
              </button>
            </form>
          )}

          {editable && cara && (
            <>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={subirCara} />
              <button className="boton-secundario !px-3 !py-1.5 text-xs" onClick={() => inputRef.current?.click()} disabled={ocupado}>
                <span className="flex items-center gap-1.5">
                  <Upload size={12} /> {ocupado ? 'Subiendo…' : cara.file_id ? 'Cambiar la cara' : 'Subir cara recortada'}
                </span>
              </button>
            </>
          )}
        </div>
      </div>
      <p className="text-terciario text-[11px] mt-2 leading-snug">
        La cara recortada del artista se vuelve el ícono de este espacio en el mapa.
      </p>
      {error && <p className="text-ladrillo text-xs mt-1" role="alert">{error}</p>}
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

// ------------------------------------------------------------
// Resumen arriba: m² construidos, utilidad anual y estado.
// ------------------------------------------------------------
function ResumenArriba({ espacio }) {
  const { datos } = usarDatos()
  const { m2c } = m2Construidos(espacio, datos?.Factores || [])
  const r = resumenEspacio(espacio, datos?.Finanzas_Lineas || [], datos?.Factores || [], datos?.Escenarios || [])
  const hayFinanzas = Array.isArray(datos?.Finanzas_Lineas)
  const n = nivelAvance(espacio.estado_desarrollo)
  return (
    <div className="grid grid-cols-3 gap-2 mt-4" aria-label="Resumen del espacio">
      <div className="tarjeta p-2.5">
        <div className="text-[10px] uppercase tracking-wide text-terciario">m² construidos</div>
        <div className="cifra text-marfil text-lg">{m2c > 0 ? Math.round(m2c).toLocaleString('es-MX') : '—'}</div>
      </div>
      <div className="tarjeta p-2.5">
        <div className="text-[10px] uppercase tracking-wide text-terciario">Utilidad anual</div>
        <div className={`cifra text-lg ${r.utilidad < 0 ? 'text-ladrillo' : 'text-marfil'}`}>{hayFinanzas ? moneda(r.utilidad) : '—'}</div>
      </div>
      <div className="tarjeta p-2.5">
        <div className="text-[10px] uppercase tracking-wide text-terciario">Estado</div>
        <div className="text-marfil text-sm capitalize mt-0.5">{espacio.estado_desarrollo || 'idea'}</div>
        <div className="flex gap-0.5 mt-1" title={`Avance: ${n} de 5`}>
          {[1, 2, 3, 4, 5].map((k) => <i key={k} className={`h-[3px] flex-1 rounded ${k <= n ? 'bg-oro' : 'bg-linea'}`} />)}
        </div>
      </div>
    </div>
  )
}

// ------------------------------------------------------------
// Historial: los últimos 20 cambios de este espacio y de sus filas
// ligadas (factores, líneas, tareas…). Lo escribe el servidor.
// ------------------------------------------------------------
const TABS_LIGADAS = ['Factores', 'Finanzas_Lineas', 'Escenarios', 'Tareas', 'Conocimientos', 'Archivos']
export function historialDeEspacio(datos, espacioId) {
  const id = String(espacioId)
  const ligadas = new Set()
  for (const tab of TABS_LIGADAS) {
    for (const f of datos?.[tab] || []) if (String(f.espacio_id) === id) ligadas.add(`${tab}|${f.id}`)
  }
  return (datos?.Historial || [])
    .filter((h) => (h.tab === 'Espacios' && String(h.llave) === id) || ligadas.has(`${h.tab}|${h.llave}`) ||
      (String(h.antes || '').includes(`"espacio_id":"${id}"`)) || (String(h.despues || '').includes(`"espacio_id":"${id}"`)))
    .slice(-20)
    .reverse()
}

const NOMBRE_TAB = { Espacios: 'espacio', Factores: 'factor', Finanzas_Lineas: 'finanzas', Escenarios: 'escenario', Tareas: 'tarea', Conocimientos: 'conocimiento', Archivos: 'archivo' }
function corto(v) {
  const t = String(v ?? '')
  if (t.startsWith('{')) return 'fila completa'
  return t.length > 40 ? t.slice(0, 38) + '…' : t || '—'
}

function Historial({ espacio }) {
  const { datos } = usarDatos()
  const filas = historialDeEspacio(datos, espacio.id)
  if (filas.length === 0) {
    return <p className="text-terciario text-sm">Todavía no hay cambios anotados. Cada cambio que se guarde aparecerá aquí.</p>
  }
  return (
    <ul className="space-y-2" aria-label="Historial de cambios">
      {filas.map((h, i) => (
        <li key={`${h.fecha}-${i}`} className="text-xs flex gap-2">
          <History size={12} className="text-terciario mt-0.5 shrink-0" />
          <div className="min-w-0">
            <div className="text-arena">
              <b className="text-marfil font-medium">{h.usuario}</b> · {NOMBRE_TAB[h.tab] || h.tab} · {h.campo}
            </div>
            <div className="text-terciario">
              {h.campo === '(fila nueva)' ? 'creó la fila' : h.campo === '(fila borrada)' ? 'borró la fila' : <>{corto(h.antes)} → <span className="text-marfil">{corto(h.despues)}</span></>}
              {' · '}{h.fecha ? fechaHora(new Date(h.fecha)) : ''}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
