import { useState, useRef, useCallback } from 'react'
import { Plus, Pencil, Check, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'
import { usarDatos } from '../datos.jsx'
import { BASE } from '../config.js'
import FichaEspacio from './FichaEspacio.jsx'

// ============================================================
// Mapa interactivo del polígono — la pantalla principal.
//
// - Las zonas viven en PORCENTAJES relativos a la imagen
//   (pos_x, pos_y, ancho, alto), así se ven igual en cualquier
//   pantalla. El Sheet guarda esos porcentajes como texto.
// - Modo edición (admin/editor): arrastrar mueve, el asa de la
//   esquina redimensiona, las flechas afinan de 1 en 1%.
//   Reglas táctiles: Pointer Events con setPointerCapture,
//   umbral de 8 px para distinguir tocar de arrastrar,
//   touch-action:none SOLO en zonas y SOLO en modo edición
//   (el mapa conserva su scroll normal), se escribe al Sheet
//   únicamente al SOLTAR, y pointercancel revierte.
// - Clic en una zona (modo normal): zoom cinematográfico — velo
//   sobre el resto, la cámara escala hacia la zona (máx 2.2x,
//   curva de la casa, 800 ms) y la ficha entra traslapada.
// ============================================================

const TIPOS = ['venue', 'museo', 'escuela', 'estacionamiento', 'departamento', 'restaurante', 'otro']
const UMBRAL_ARRASTRE = 8 // px antes de considerar que es un arrastre

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
  const puedeEditar = modo !== 'demo' && ['admin', 'editor'].includes(sesion?.rol)

  const [modoEdicion, setModoEdicion] = useState(false)
  const [seleccion, setSeleccion] = useState(null)   // id de zona seleccionada (edición)
  const [abierto, setAbierto] = useState(null)        // id de espacio con ficha abierta (zoom)
  const [creando, setCreando] = useState(false)
  const [tempArrastre, setTempArrastre] = useState(null) // {id, x, y, w, h} mientras se arrastra

  const contRef = useRef(null)
  const gesto = useRef(null) // {id, tipo:'mover'|'tamano', x0px, y0px, zona0, arrastrando}
  const tempRef = useRef(null) // espejo de tempArrastre para leerlo al soltar sin efectos dobles
  // La proporción se mide de la imagen real al cargarla — así el plano se
  // puede reemplazar por otro de cualquier tamaño sin tocar código.
  const [proporcion, setProporcion] = useState('842 / 692')

  // --- gestos de edición ------------------------------------
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

  const alSoltar = useCallback((ev) => {
    const g = gesto.current
    gesto.current = null
    if (!g) return
    if (!g.arrastrando) {
      // Fue un toque, no un arrastre: seleccionar la zona.
      setSeleccion(g.id)
      return
    }
    // Un solo guardado, al soltar (nunca ráfagas por pixel).
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
    // Llamada entrante o gesto del sistema: se revierte sin escribir.
    gesto.current = null
    tempRef.current = null
    setTempArrastre(null)
  }, [])

  // Flechas: ajuste fino de 1% (con el dedo es imposible afinar 1%).
  const empujar = useCallback((dx, dy) => {
    const e = espacios.find((x) => x.id === seleccion)
    if (!e) return
    const z = zonaDeFila(e)
    editarFila('Espacios', e.id, {
      pos_x: acot(z.x + dx, 0, 100 - z.w).toFixed(2),
      pos_y: acot(z.y + dy, 0, 100 - z.h).toFixed(2),
    })
  }, [espacios, seleccion, editarFila])

  // --- crear espacio ----------------------------------------
  async function crearEspacio(nombre, tipo) {
    const fila = await crearFila('Espacios', {
      nombre,
      tipo,
      estado_desarrollo: 'idea',
      descripcion: '',
      m2: '',
      pos_x: '40',
      pos_y: '42',
      ancho: '20',
      alto: '14',
      notas: '',
    })
    setCreando(false)
    setModoEdicion(true)
    setSeleccion(fila.id)
  }

  // --- zoom cinematográfico ---------------------------------
  const espacioAbierto = espacios.find((e) => e.id === abierto)
  let origenZoom = '50% 50%'
  if (espacioAbierto) {
    const z = zonaDeFila(espacioAbierto)
    origenZoom = `${z.x + z.w / 2}% ${z.y + z.h / 2}%`
  }

  return (
    <div className="relative">
      {/* Barra del mapa */}
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-2 flex items-center gap-2">
        <h2 className="font-titulo text-xl flex-1">El polígono</h2>
        {puedeEditar && modoEdicion && seleccion && (
          <div className="flex items-center gap-1 mr-2" aria-label="Ajuste fino de 1%">
            <button className="boton-secundario !px-2 !py-2" onClick={() => empujar(-1, 0)} title="Mover 1% a la izquierda"><ArrowLeft size={14} /></button>
            <button className="boton-secundario !px-2 !py-2" onClick={() => empujar(0, -1)} title="Mover 1% arriba"><ArrowUp size={14} /></button>
            <button className="boton-secundario !px-2 !py-2" onClick={() => empujar(0, 1)} title="Mover 1% abajo"><ArrowDown size={14} /></button>
            <button className="boton-secundario !px-2 !py-2" onClick={() => empujar(1, 0)} title="Mover 1% a la derecha"><ArrowRight size={14} /></button>
          </div>
        )}
        {puedeEditar && (
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

      {modoEdicion && (
        <p className="max-w-6xl mx-auto px-4 pb-2 text-terciario text-sm">
          Arrastra una zona para moverla; el cuadrito de la esquina la redimensiona.
          Cada cambio se guarda al soltar.
        </p>
      )}

      {/* El mapa */}
      <div className="px-2 pb-6">
        <div
          ref={contRef}
          className="relative mx-auto rounded-2xl overflow-hidden border border-linea"
          style={{ aspectRatio: proporcion, maxHeight: 'calc(100dvh - 150px)', maxWidth: '100%' }}
        >
          {/* Capa con zoom cinematográfico: imagen + velo + zonas viajan juntos */}
          <div
            className="absolute inset-0 transition-transform duration-cine ease-casa"
            style={{
              transform: espacioAbierto ? 'scale(2.2)' : 'scale(1)',
              transformOrigin: origenZoom,
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
            {/* Velo: al abrir una ficha, el resto del mapa baja de luz */}
            <div
              className="absolute inset-0 bg-noche transition-opacity duration-micro ease-casa pointer-events-none"
              style={{ opacity: espacioAbierto ? 0.55 : 0 }}
            />

            {espacios.map((e) => {
              const z = tempArrastre?.id === e.id ? tempArrastre : zonaDeFila(e)
              const seleccionada = seleccion === e.id && modoEdicion
              const esLaAbierta = abierto === e.id
              return (
                <div
                  key={e.id}
                  role="button"
                  aria-label={e.nombre}
                  className={`absolute rounded-lg border transition-colors duration-micro ease-casa
                    ${esLaAbierta ? 'border-oro bg-oro/20 z-10' : seleccionada ? 'border-oro bg-oro/25' : 'border-oro/70 bg-oro/10 hover:bg-oro/20'}`}
                  style={{
                    left: `${z.x}%`,
                    top: `${z.y}%`,
                    width: `${z.w}%`,
                    height: `${z.h}%`,
                    touchAction: modoEdicion ? 'none' : 'auto',
                    cursor: modoEdicion ? 'move' : 'pointer',
                  }}
                  onPointerDown={(ev) => alBajar(ev, e, 'mover')}
                  onPointerMove={alMover}
                  onPointerUp={modoEdicion ? alSoltar : undefined}
                  onPointerCancel={alCancelar}
                  onClick={() => { if (!modoEdicion) setAbierto(e.id) }}
                >
                  <span className="absolute -top-6 left-0 text-xs font-medium text-marfil bg-noche/80 rounded px-1.5 py-0.5 whitespace-nowrap max-w-[16rem] overflow-hidden text-ellipsis">
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

          {espacios.length === 0 && (
            <div className="absolute inset-x-4 bottom-4 tarjeta p-4 text-center bg-noche/85">
              <p className="text-marfil text-sm font-medium">Aún no hay espacios en el mapa.</p>
              <p className="text-terciario text-xs mt-1">
                {puedeEditar ? 'Toca “+ Espacio” para crear el primero y arrástralo a su lugar.' : 'Un admin o editor los irá colocando.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* La ficha del espacio: Factores | Fotos | Documentos | Conocimientos | Tareas */}
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

      {/* Fondo clicable para cerrar la ficha */}
      {espacioAbierto && (
        <div className="fixed inset-0 z-40" onClick={() => setAbierto(null)} aria-hidden="true" />
      )}

      {creando && <FormaNuevoEspacio onCrear={crearEspacio} onCerrar={() => setCreando(false)} />}
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
      <form
        className="tarjeta bg-elevada p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
        onSubmit={enviar}
      >
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
            {TIPOS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
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
