import { useState, useRef, useCallback } from 'react'
import { Plus, Pencil, Check, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ClipboardList, Music, Landmark, GraduationCap, SquareParking, Home, UtensilsCrossed, MapPin, Mic2 } from 'lucide-react'
import { usarDatos } from '../datos.jsx'
import { BASE } from '../config.js'
import FichaEspacio from './FichaEspacio.jsx'
import Peticiones from './Peticiones.jsx'
import { RutasCapa, PuntosEdicion, BarraRutas, Recorrido, leerPuntos } from './Rutas.jsx'

// ============================================================
// Mapa interactivo del polígono — la pantalla principal.
// Dos capas sobre el plano: ESPACIOS (zonas) y RUTAS (polilíneas).
//
// - Todo vive en PORCENTAJES relativos a la imagen.
// - La "cámara" (zoom cinematográfico) es una sola: viaja al
//   espacio abierto o a la parada activa del recorrido.
// - Reglas táctiles de edición: Pointer Events + setPointerCapture,
//   umbral de 8 px tocar-vs-arrastrar, touch-action:none solo en
//   zonas y solo en edición, escritura únicamente al soltar,
//   pointercancel revierte.
// ============================================================

const TIPOS = ['venue', 'museo', 'escuela', 'estudio', 'estacionamiento', 'departamento', 'restaurante', 'otro']
const UMBRAL_ARRASTRE = 8

// El ícono de cada tipo de espacio (los pines del mapa; petición 6/6 del panel).
const ICONO_TIPO = {
  venue: Music,
  museo: Landmark,
  escuela: GraduationCap,
  estudio: Mic2,
  estacionamiento: SquareParking,
  departamento: Home,
  restaurante: UtensilsCrossed,
  otro: MapPin,
}

function num(v, porDefecto) {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : porDefecto
}

function zonaDeFila(e) {
  return {
    x: num(e.pos_x, 40),
    y: num(e.pos_y, 40),
    w: Math.max(num(e.ancho, 18), 3),
    h: Math.max(num(e.alto, 12), 3),
  }
}

const acot = (v, min, max) => Math.min(Math.max(v, min), max)

export default function Mapa() {
  const { sesion, datos, modo, editarFila, crearFila } = usarDatos()
  const espacios = datos?.Espacios || []
  const rutas = (datos?.Rutas || []).slice().sort((a, b) => num(a.orden, 999) - num(b.orden, 999))
  const paradas = datos?.Paradas || []
  const puedeEditar = modo !== 'demo' && ['admin', 'editor'].includes(sesion?.rol)

  // Capa activa
  const [vista, setVista] = useState('espacios') // 'espacios' | 'rutas'

  // Espacios
  const [modoEdicion, setModoEdicion] = useState(false)
  const [seleccion, setSeleccion] = useState(null)
  const [abierto, setAbierto] = useState(null)
  const [creando, setCreando] = useState(false)
  const [tempArrastre, setTempArrastre] = useState(null)

  // Rutas
  const [rutaSel, setRutaSel] = useState(null)
  const [editandoPuntos, setEditandoPuntos] = useState(false)
  const [agregandoParada, setAgregandoParada] = useState(false)
  const [paradaPendiente, setParadaPendiente] = useState(null) // {x,y} esperando nombre
  const [recorrido, setRecorrido] = useState(null) // {rutaId, idx}
  const [verPeticiones, setVerPeticiones] = useState(false)

  const contRef = useRef(null)
  const gesto = useRef(null)
  const tempRef = useRef(null)
  const [proporcion, setProporcion] = useState('842 / 692')

  // --- gestos de edición de zonas ---------------------------
  const alBajar = useCallback((ev, espacio, tipo) => {
    if (!modoEdicion) return
    ev.preventDefault()
    ev.stopPropagation()
    ev.currentTarget.setPointerCapture(ev.pointerId)
    gesto.current = {
      id: espacio.id,
      tipo,
      x0px: ev.clientX,
      y0px: ev.clientY,
      zona0: zonaDeFila(espacio),
      arrastrando: false,
    }
  }, [modoEdicion])

  const alMover = useCallback((ev) => {
    const g = gesto.current
    if (!g) return
    const dx = ev.clientX - g.x0px
    const dy = ev.clientY - g.y0px
    if (!g.arrastrando && Math.hypot(dx, dy) < UMBRAL_ARRASTRE) return
    g.arrastrando = true

    const rect = contRef.current?.getBoundingClientRect()
    if (!rect) return
    const dxp = (dx / rect.width) * 100
    const dyp = (dy / rect.height) * 100
    const z = g.zona0

    const t = g.tipo === 'mover'
      ? { id: g.id, x: acot(z.x + dxp, 0, 100 - z.w), y: acot(z.y + dyp, 0, 100 - z.h), w: z.w, h: z.h }
      : { id: g.id, x: z.x, y: z.y, w: acot(z.w + dxp, 3, 100 - z.x), h: acot(z.h + dyp, 3, 100 - z.y) }
    tempRef.current = t
    setTempArrastre(t)
  }, [])

  const alSoltar = useCallback(() => {
    const g = gesto.current
    gesto.current = null
    if (!g) return
    if (!g.arrastrando) {
      setSeleccion(g.id)
      return
    }
    const t = tempRef.current
    if (t && t.id === g.id) {
      editarFila('Espacios', g.id, {
        pos_x: t.x.toFixed(2),
        pos_y: t.y.toFixed(2),
        ancho: t.w.toFixed(2),
        alto: t.h.toFixed(2),
      })
    }
    tempRef.current = null
    setTempArrastre(null)
    setSeleccion(g.id)
  }, [editarFila])

  const alCancelar = useCallback(() => {
    gesto.current = null
    tempRef.current = null
    setTempArrastre(null)
  }, [])

  const empujar = useCallback((dx, dy) => {
    const e = espacios.find((x) => x.id === seleccion)
    if (!e) return
    const z = zonaDeFila(e)
    editarFila('Espacios', e.id, {
      pos_x: acot(z.x + dx, 0, 100 - z.w).toFixed(2),
      pos_y: acot(z.y + dy, 0, 100 - z.h).toFixed(2),
    })
  }, [espacios, seleccion, editarFila])

  async function crearEspacio(nombre, tipo) {
    const fila = await crearFila('Espacios', {
      nombre, tipo,
      estado_desarrollo: 'idea', descripcion: '', m2: '',
      pos_x: '40', pos_y: '42', ancho: '20', alto: '14', notas: '',
    })
    setCreando(false)
    setModoEdicion(true)
    setSeleccion(fila.id)
  }

  // --- toques al mapa para trazar rutas y colocar paradas ----
  const alTocarMapa = useCallback((ev) => {
    if (!editandoPuntos && !agregandoParada) return
    const rect = contRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = acot(((ev.clientX - rect.left) / rect.width) * 100, 0, 100)
    const y = acot(((ev.clientY - rect.top) / rect.height) * 100, 0, 100)

    if (editandoPuntos && rutaSel) {
      const ruta = rutas.find((r) => r.id === rutaSel)
      if (!ruta) return
      const pts = leerPuntos(ruta)
      editarFila('Rutas', rutaSel, {
        puntos: JSON.stringify([...pts, [Number(x.toFixed(2)), Number(y.toFixed(2))]]),
      })
    } else if (agregandoParada && rutaSel) {
      setParadaPendiente({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) })
    }
  }, [editandoPuntos, agregandoParada, rutaSel, rutas, editarFila])

  const deshacerPunto = useCallback(() => {
    const ruta = rutas.find((r) => r.id === rutaSel)
    if (!ruta) return
    const pts = leerPuntos(ruta)
    editarFila('Rutas', rutaSel, { puntos: JSON.stringify(pts.slice(0, -1)) })
  }, [rutas, rutaSel, editarFila])

  // --- la cámara (una sola, para espacios y recorridos) ------
  const espacioAbierto = espacios.find((e) => e.id === abierto)
  const rutaRecorrida = recorrido ? rutas.find((r) => r.id === recorrido.rutaId) : null
  const paradasDeRuta = rutaRecorrida
    ? paradas
        .filter((p) => String(p.ruta_id) === String(rutaRecorrida.id))
        .sort((a, b) => num(a.orden, 999) - num(b.orden, 999))
    : []
  const paradaActiva = rutaRecorrida ? paradasDeRuta[recorrido.idx] : null

  let camara = null
  if (paradaActiva) {
    camara = { escala: 1.7, origen: `${num(paradaActiva.pos_x, 50)}% ${num(paradaActiva.pos_y, 50)}%` }
  } else if (espacioAbierto) {
    const z = zonaDeFila(espacioAbierto)
    camara = { escala: 2.2, origen: `${z.x + z.w / 2}% ${z.y + z.h / 2}%` }
  }

  const enRutas = vista === 'rutas'

  return (
    <div className="relative">
      {/* Barra del mapa */}
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-2 flex items-center gap-2 flex-wrap">
        <h2 className="font-cartel font-normal uppercase tracking-wide text-2xl">El polígono</h2>

        {/* Selector de capa */}
        <div className="flex rounded-xl border border-linea overflow-hidden ml-2">
          {[['espacios', 'Espacios'], ['rutas', 'Rutas']].map(([v, titulo]) => (
            <button
              key={v}
              className={`px-3 py-1.5 text-sm transition-colors duration-micro ease-casa
                ${vista === v ? 'bg-oro text-noche font-medium' : 'text-arena hover:text-marfil'}`}
              onClick={() => {
                setVista(v)
                setAbierto(null); setRecorrido(null)
                setModoEdicion(false); setSeleccion(null)
                setEditandoPuntos(false); setAgregandoParada(false)
              }}
            >
              {titulo}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {enRutas && (
          <button className="boton-secundario !px-3 !py-2 text-sm" onClick={() => setVerPeticiones(true)}>
            <span className="flex items-center gap-1.5"><ClipboardList size={14} /> Peticiones</span>
          </button>
        )}

        {!enRutas && puedeEditar && modoEdicion && seleccion && (
          <div className="flex items-center gap-1" aria-label="Ajuste fino de 1%">
            <button className="boton-secundario !px-2 !py-2" onClick={() => empujar(-1, 0)} title="1% a la izquierda"><ArrowLeft size={14} /></button>
            <button className="boton-secundario !px-2 !py-2" onClick={() => empujar(0, -1)} title="1% arriba"><ArrowUp size={14} /></button>
            <button className="boton-secundario !px-2 !py-2" onClick={() => empujar(0, 1)} title="1% abajo"><ArrowDown size={14} /></button>
            <button className="boton-secundario !px-2 !py-2" onClick={() => empujar(1, 0)} title="1% a la derecha"><ArrowRight size={14} /></button>
          </div>
        )}
        {!enRutas && puedeEditar && (
          <>
            <button
              className={modoEdicion ? 'boton-primario !px-3 !py-2 text-sm' : 'boton-secundario !px-3 !py-2 text-sm'}
              onClick={() => { setModoEdicion(!modoEdicion); setSeleccion(null); setAbierto(null) }}
            >
              {modoEdicion ? (<span className="flex items-center gap-1.5"><Check size={14} /> Terminar</span>) : (<span className="flex items-center gap-1.5"><Pencil size={14} /> Editar mapa</span>)}
            </button>
            <button className="boton-primario !px-3 !py-2 text-sm" onClick={() => setCreando(true)} title="Crear espacio">
              <span className="flex items-center gap-1.5"><Plus size={16} /> Espacio</span>
            </button>
          </>
        )}
      </div>

      {!enRutas && modoEdicion && (
        <p className="max-w-6xl mx-auto px-4 pb-2 text-terciario text-sm">
          Arrastra una zona para moverla; el cuadrito de la esquina la
          redimensiona. Cada cambio se guarda al soltar.
        </p>
      )}

      {enRutas && (
        <BarraRutas
          rutas={rutas}
          editable={puedeEditar}
          rutaSel={rutaSel}
          setRutaSel={setRutaSel}
          editandoPuntos={editandoPuntos}
          setEditandoPuntos={setEditandoPuntos}
          agregandoParada={agregandoParada}
          setAgregandoParada={setAgregandoParada}
          onCrearRuta={(fila) => crearFila('Rutas', fila)}
          onDeshacerPunto={deshacerPunto}
        />
      )}

      {/* El mapa */}
      <div className="px-2 pb-6">
        <div
          ref={contRef}
          className="relative mx-auto rounded-2xl overflow-hidden border border-linea"
          style={{
            aspectRatio: proporcion,
            maxHeight: 'calc(100dvh - 150px)',
            maxWidth: '100%',
            cursor: editandoPuntos || agregandoParada ? 'crosshair' : 'default',
          }}
          onClick={alTocarMapa}
        >
          {/* Lienzo con zoom cinematográfico: todo viaja junto */}
          <div
            className="absolute inset-0 transition-transform duration-cine ease-casa"
            style={{
              transform: camara ? `scale(${camara.escala})` : 'scale(1)',
              transformOrigin: camara ? camara.origen : '50% 50%',
            }}
          >
            <img
              src={`${BASE}mapa-poligono.jpg`}
              alt="Plano del polígono de Amalaya"
              className="absolute inset-0 w-full h-full object-cover select-none"
              draggable={false}
              onLoad={(ev) => {
                const im = ev.currentTarget
                if (im.naturalWidth && im.naturalHeight) {
                  setProporcion(`${im.naturalWidth} / ${im.naturalHeight}`)
                }
              }}
            />

            {/* Duotono noche-oro sobre el plano (el "óleo crudo"). La capa
                extra atenúa el catastro (números y colores técnicos del plano),
                que el panel leyó como ruido: los pines son los protagonistas. */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(201,164,92,0.12), rgba(20,16,16,0.35))',
                mixBlendMode: 'overlay',
              }}
            />
            {!modoEdicion && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'rgba(20,16,16,0.30)' }}
              />
            )}

            {/* Velo al abrir ficha o recorrido */}
            <div
              className="absolute inset-0 bg-noche transition-opacity duration-micro ease-casa pointer-events-none"
              style={{ opacity: camara ? 0.55 : 0 }}
            />

            {/* Rutas: siempre visibles como contexto; interactivas en su capa */}
            <RutasCapa
              rutas={rutas}
              paradas={paradas}
              interactivas={enRutas && !editandoPuntos && !agregandoParada}
              rutaSel={rutaSel}
              recorriendo={rutaRecorrida?.id || null}
              onElegirRuta={(id) => {
                setRutaSel(id)
                setRecorrido({ rutaId: id, idx: 0 })
              }}
            />
            {editandoPuntos && rutaSel && (
              <PuntosEdicion ruta={rutas.find((r) => r.id === rutaSel) || { puntos: '[]' }} />
            )}

            {/* Espacios. En modo normal: PINES con ícono, grandes y tocables
                (petición 6/6 del panel). En modo edición: las zonas
                rectangulares de siempre, para posicionar con precisión. */}
            {espacios.map((e) => {
              const z = tempArrastre?.id === e.id ? tempArrastre : zonaDeFila(e)
              const seleccionada = seleccion === e.id && modoEdicion
              const esLaAbierta = abierto === e.id

              if (!modoEdicion) {
                const Icono = ICONO_TIPO[String(e.tipo).toLowerCase()] || MapPin
                return (
                  <button
                    key={e.id}
                    aria-label={e.nombre}
                    className={`absolute flex flex-col items-center transition-transform duration-micro ease-casa
                      ${enRutas ? 'opacity-30 pointer-events-none' : 'hover:scale-110'}
                      ${esLaAbierta ? 'z-10 scale-110' : ''}`}
                    style={{
                      left: `${z.x + z.w / 2}%`,
                      top: `${z.y + z.h / 2}%`,
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer',
                    }}
                    onClick={(ev) => { ev.stopPropagation(); if (!enRutas) setAbierto(e.id) }}
                  >
                    <span className={`w-11 h-11 rounded-full flex items-center justify-center border-2 shadow-lg
                      ${esLaAbierta ? 'bg-ambar border-marfil' : 'bg-oro border-noche/60'}`}>
                      <Icono size={20} className="text-noche" />
                    </span>
                    <span className="mt-1 font-cartel font-normal uppercase tracking-wider text-[11px] text-marfil bg-noche/85 rounded px-1.5 py-0.5 whitespace-nowrap max-w-[9rem] overflow-hidden text-ellipsis">
                      {e.nombre}
                    </span>
                  </button>
                )
              }

              return (
                <div
                  key={e.id}
                  role="button"
                  aria-label={e.nombre}
                  className={`absolute rounded-lg border transition-all duration-micro ease-casa
                    ${esLaAbierta ? 'border-oro bg-oro/20 z-10' : seleccionada ? 'border-oro bg-oro/25' : 'border-oro/70 bg-oro/10 hover:bg-oro/20'}`}
                  style={{
                    left: `${z.x}%`,
                    top: `${z.y}%`,
                    width: `${z.w}%`,
                    height: `${z.h}%`,
                    touchAction: 'none',
                    cursor: 'move',
                  }}
                  onPointerDown={(ev) => alBajar(ev, e, 'mover')}
                  onPointerMove={alMover}
                  onPointerUp={alSoltar}
                  onPointerCancel={alCancelar}
                >
                  <span className="absolute -top-6 left-0 font-cartel font-normal uppercase tracking-wider text-xs text-marfil bg-noche/85 border-l-2 border-l-ambar rounded px-2 py-0.5 whitespace-nowrap max-w-[16rem] overflow-hidden text-ellipsis">
                    {e.nombre}
                  </span>
                  {seleccionada && (
                    <span
                      className="absolute -bottom-3 -right-3 w-6 h-6 rounded-md bg-oro border-2 border-noche"
                      style={{ touchAction: 'none', cursor: 'nwse-resize' }}
                      aria-label="Redimensionar"
                      onPointerDown={(ev) => alBajar(ev, e, 'tamano')}
                      onPointerMove={alMover}
                      onPointerUp={alSoltar}
                      onPointerCancel={alCancelar}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {espacios.length === 0 && !enRutas && (
            <div className="absolute inset-x-4 bottom-4 tarjeta p-4 text-center bg-noche/85">
              <p className="text-marfil text-sm font-medium">Aún no hay espacios en el mapa.</p>
              <p className="text-terciario text-xs mt-1">
                {puedeEditar ? 'Toca “+ Espacio” para crear el primero y arrástralo a su lugar.' : 'Un admin o editor los irá colocando.'}
              </p>
            </div>
          )}
          {enRutas && (editandoPuntos || agregandoParada) && (
            <div className="absolute inset-x-4 top-3 text-center pointer-events-none">
              <span className="text-xs text-noche bg-oro rounded-full px-3 py-1 font-medium">
                {editandoPuntos ? 'Toca el mapa para agregar puntos a la ruta' : 'Toca el punto del mapa donde va la parada'}
              </span>
            </div>
          )}

          {/* La leyenda del mapa (petición 6/6: que se explique solo) */}
          {espacios.length > 0 && !modoEdicion && (
            <div className="absolute left-3 bottom-3 bg-noche/85 border border-linea rounded-xl px-3 py-2 text-[11px] text-arena leading-relaxed pointer-events-none">
              <span className="inline-flex items-center gap-1.5 mr-3">
                <span className="w-3.5 h-3.5 rounded-full bg-oro inline-block" /> espacios del proyecto
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-5 h-0.5 bg-oro inline-block rounded" /> rutas temáticas
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Ficha del espacio */}
      <aside
        className={`fixed z-50 bg-elevada border-linea shadow-2xl
          inset-x-0 bottom-0 rounded-t-2xl border-t max-h-[85dvh]
          sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[28rem] sm:rounded-none sm:border-t-0 sm:border-l sm:max-h-none
          transition-transform duration-panel ease-casa overflow-y-auto
          ${espacioAbierto ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-y-0 sm:translate-x-full'}`}
        aria-hidden={!espacioAbierto}
      >
        {espacioAbierto && <FichaEspacio espacio={espacioAbierto} onCerrar={() => setAbierto(null)} />}
      </aside>
      {espacioAbierto && (
        <div className="fixed inset-0 z-40" onClick={() => setAbierto(null)} aria-hidden="true" />
      )}

      {/* Recorrido de la ruta activa */}
      {rutaRecorrida && (
        <Recorrido
          ruta={rutaRecorrida}
          paradas={paradas}
          idx={recorrido.idx}
          setIdx={(i) => setRecorrido({ ...recorrido, idx: i })}
          onCerrar={() => setRecorrido(null)}
        />
      )}

      {verPeticiones && <Peticiones onCerrar={() => setVerPeticiones(false)} />}

      {creando && <FormaNuevoEspacio onCrear={crearEspacio} onCerrar={() => setCreando(false)} />}
      {paradaPendiente && rutaSel && (
        <FormaNuevaParada
          coords={paradaPendiente}
          orden={paradas.filter((p) => String(p.ruta_id) === String(rutaSel)).length + 1}
          onCrear={async (nombre) => {
            await crearFila('Paradas', {
              ruta_id: rutaSel,
              nombre,
              foto_actual_id: '',
              foto_vision_id: '',
              elementos: '[]',
              notas: '',
              orden: String(paradas.filter((p) => String(p.ruta_id) === String(rutaSel)).length + 1),
              pos_x: String(paradaPendiente.x),
              pos_y: String(paradaPendiente.y),
            })
            setParadaPendiente(null)
            setAgregandoParada(false)
          }}
          onCerrar={() => setParadaPendiente(null)}
        />
      )}
    </div>
  )
}

function FormaNuevoEspacio({ onCrear, onCerrar }) {
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState('venue')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)

  async function enviar(ev) {
    ev.preventDefault()
    if (!nombre.trim()) return
    setOcupado(true)
    setError(null)
    try {
      await onCrear(nombre.trim(), tipo)
    } catch (e) {
      setError(e.message)
      setOcupado(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-noche/70 flex items-end sm:items-center justify-center p-4" onClick={onCerrar}>
      <form className="tarjeta bg-elevada p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()} onSubmit={enviar}>
        <h3 className="font-titulo text-xl">Nuevo espacio</h3>
        <p className="text-terciario text-sm mt-1">
          Se coloca al centro del mapa; después lo arrastras a su lugar.
        </p>
        <label className="block mt-4">
          <span className="text-sm text-arena">Nombre</span>
          <input className="campo mt-1.5" value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus disabled={ocupado} placeholder="Ej. Venue principal" />
        </label>
        <label className="block mt-3">
          <span className="text-sm text-arena">Tipo</span>
          <select className="campo mt-1.5" value={tipo} onChange={(e) => setTipo(e.target.value)} disabled={ocupado}>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        {error && <p className="text-ladrillo text-sm mt-3" role="alert">{error}</p>}
        <div className="flex gap-2 mt-5">
          <button type="button" className="boton-secundario flex-1" onClick={onCerrar} disabled={ocupado}>Cancelar</button>
          <button type="submit" className="boton-primario flex-1" disabled={ocupado || !nombre.trim()}>
            {ocupado ? 'Creando…' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  )
}

function FormaNuevaParada({ coords, onCrear, onCerrar }) {
  const [nombre, setNombre] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)

  async function enviar(ev) {
    ev.preventDefault()
    if (!nombre.trim()) return
    setOcupado(true)
    setError(null)
    try {
      await onCrear(nombre.trim())
    } catch (e) {
      setError(e.message)
      setOcupado(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-noche/70 flex items-end sm:items-center justify-center p-4" onClick={onCerrar}>
      <form className="tarjeta bg-elevada p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()} onSubmit={enviar}>
        <h3 className="font-titulo text-xl">Nueva parada</h3>
        <p className="text-terciario text-sm mt-1">
          Quedará en el punto que tocaste ({coords.x.toFixed(0)}%, {coords.y.toFixed(0)}%).
        </p>
        <label className="block mt-4">
          <span className="text-sm text-arena">Nombre</span>
          <input className="campo mt-1.5" value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus disabled={ocupado} placeholder="Ej. Plaza Hidalgo" />
        </label>
        {error && <p className="text-ladrillo text-sm mt-3" role="alert">{error}</p>}
        <div className="flex gap-2 mt-5">
          <button type="button" className="boton-secundario flex-1" onClick={onCerrar} disabled={ocupado}>Cancelar</button>
          <button type="submit" className="boton-primario flex-1" disabled={ocupado || !nombre.trim()}>
            {ocupado ? 'Creando…' : 'Crear parada'}
          </button>
        </div>
      </form>
    </div>
  )
}
