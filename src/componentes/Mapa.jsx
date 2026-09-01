import { useState, useRef, useCallback } from 'react'
import { Plus, Pencil, Check, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ClipboardList } from 'lucide-react'
import { usarDatos } from '../datos.jsx'
import { BASE } from '../config.js'
import FichaEspacio, { caraDeEspacio } from './FichaEspacio.jsx'
import ImagenDrive from './ImagenDrive.jsx'
import ManijaSheet from './ManijaSheet.jsx'
import Peticiones from './Peticiones.jsx'
import { RutasCapa, PuntosEdicion, BarraRutas, Recorrido, leerPuntos, guardarRuta } from './Rutas.jsx'

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

const TIPOS = ['venue', 'comercial', 'mixto', 'museo', 'escuela', 'estudio', 'estacionamiento', 'departamento', 'restaurante', 'otro']
const UMBRAL_ARRASTRE = 8

// ------------------------------------------------------------
// Iconografía propia de los pines (petición: que cada punto se
// entienda de un vistazo). Glifos arquitectónicos dibujados a
// mano — nada de cactus/sombrero/mariachi ni notas musicales
// (lista negra del proyecto): el foro es un proscenio, el
// comercio un toldo, el estacionamiento un edificio por niveles.
// ------------------------------------------------------------
const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }

function GlifoBase({ size = 22, children }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} {...trazo}>{children}</svg>
}
const GLIFO_TIPO = {
  // Foro / venue: el proscenio (arco de escenario sobre el piso).
  venue: (p) => (
    <GlifoBase {...p}>
      <path d="M2.5 21h19" />
      <path d="M4.5 21V10a7.5 7.5 0 0 1 15 0v11" />
      <path d="M8 21v-7.5a4 4 0 0 1 8 0V21" />
    </GlifoBase>
  ),
  // Área comercial: local con toldo de tres ondas.
  comercial: (p) => (
    <GlifoBase {...p}>
      <path d="M4.5 9.5 6 4.5h12l1.5 5" />
      <path d="M4.5 9.5a2.1 2.1 0 0 0 4.2 0 2.1 2.1 0 0 0 4.2 0 2.1 2.1 0 0 0 4.2 0 2.1 2.1 0 0 0 2.4 0" />
      <path d="M5.5 12.5V21h13v-8.5" />
      <path d="M10 21v-5h4v5" />
    </GlifoBase>
  ),
  // Uso mixto: dos torres traslapadas de distinta altura.
  mixto: (p) => (
    <GlifoBase {...p}>
      <path d="M2.5 21h19" />
      <path d="M4.5 21V10h6.5v11" />
      <path d="M11 21V3.5h8V21" />
      <path d="M14 7.5h2M14 11h2M14 14.5h2M7 13.5h1.5M7 17h1.5" />
    </GlifoBase>
  ),
  // Museo: pórtico con frontón y columnas.
  museo: (p) => (
    <GlifoBase {...p}>
      <path d="M3 9.5 12 3l9 6.5" />
      <path d="M4 21h16" />
      <path d="M6.5 21v-9M12 21v-9M17.5 21v-9" />
    </GlifoBase>
  ),
  // Escuela-estudio: libro abierto (formación).
  escuela: (p) => (
    <GlifoBase {...p}>
      <path d="M12 6.5C10 4.8 7 4.3 3.5 4.7V19c3.5-.4 6.5.1 8.5 1.8 2-1.7 5-2.2 8.5-1.8V4.7C17 4.3 14 4.8 12 6.5Z" />
      <path d="M12 6.5V20.8" />
    </GlifoBase>
  ),
  // Estudio de grabación: micrófono de cápsula.
  estudio: (p) => (
    <GlifoBase {...p}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
      <path d="M12 18v3.5M8.5 21.5h7" />
    </GlifoBase>
  ),
  // Estacionamiento multinivel: edificio de niveles con la P.
  estacionamiento: (p) => (
    <GlifoBase {...p}>
      <path d="M4 21V5.5h16V21M2.5 21h19" />
      <path d="M4 10h16M4 15.5h16" />
      <path d="M10.5 20.5v-3.7h2.2a1.6 1.6 0 0 1 0 3.2h-2.2" transform="translate(0,-1.2)" />
    </GlifoBase>
  ),
  // Departamento: fachada con ventanas y puerta.
  departamento: (p) => (
    <GlifoBase {...p}>
      <path d="M5 21V4.5h14V21M3.5 21h17" />
      <path d="M8.5 8h2.2M13.3 8h2.2M8.5 12h2.2M13.3 12h2.2" />
      <path d="M10.5 21v-4.5h3V21" />
    </GlifoBase>
  ),
  // Restaurante: cubierto y copa.
  restaurante: (p) => (
    <GlifoBase {...p}>
      <path d="M7 3.5v5a2 2 0 0 0 4 0v-5M9 3.5V21" />
      <path d="M15 3.5h4l-1 7h-2l-1-7ZM17 10.5V21" />
    </GlifoBase>
  ),
  // Otro: hito sencillo.
  otro: (p) => (
    <GlifoBase {...p}>
      <path d="M12 21V6" />
      <path d="M12 6l6 2.5L12 11" />
      <path d="M8.5 21h7" />
    </GlifoBase>
  ),
}

// Letrero corto de cada tipo (la 2ª línea del pin).
const NOMBRE_TIPO = {
  venue: 'Foro', comercial: 'Comercial', mixto: 'Uso mixto', museo: 'Museo',
  escuela: 'Escuela', estudio: 'Estudio', estacionamiento: 'Estacionamiento',
  departamento: 'Departamento', restaurante: 'Restaurante', otro: '',
}

const fmtMiles = (n) => Number(n).toLocaleString('es-MX')

// "Estacionamiento · 4 pisos · 300 cajones" — con lo que haya en
// los factores del espacio; si no, tipo + m².
function subtituloEspacio(e, factores) {
  const partes = []
  const tipo = NOMBRE_TIPO[String(e.tipo).toLowerCase()]
  if (tipo && tipo.toLowerCase() !== String(e.nombre || '').toLowerCase()) partes.push(tipo)
  const propios = (factores || []).filter((f) => String(f.espacio_id) === String(e.id))
  const pisos = propios.find((f) => /piso/i.test(f.etiqueta || ''))
  const cajones = propios.find((f) => /cajon/i.test(f.etiqueta || ''))
  if (pisos && num(pisos.valor, 0)) partes.push(`${num(pisos.valor, 0)} pisos`)
  if (cajones && num(cajones.valor, 0)) partes.push(`${fmtMiles(num(cajones.valor, 0))} cajones`)
  else if (num(e.m2, 0)) partes.push(`${fmtMiles(num(e.m2, 0))} m²`)
  return partes.join(' · ')
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

  // --- toques al mapa para trazar la ruta peatonal ------------
  // El trazo se guarda con guardarRuta para conservar el estilo
  // (ancho/transparencia) que viaja en la misma columna `puntos`.
  const alTocarMapa = useCallback((ev) => {
    if (!editandoPuntos || !rutaSel) return
    const rect = contRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = acot(((ev.clientX - rect.left) / rect.width) * 100, 0, 100)
    const y = acot(((ev.clientY - rect.top) / rect.height) * 100, 0, 100)
    const ruta = rutas.find((r) => r.id === rutaSel)
    if (!ruta) return
    const pts = leerPuntos(ruta)
    editarFila('Rutas', rutaSel, {
      puntos: guardarRuta(ruta, { puntos: [...pts, [Number(x.toFixed(2)), Number(y.toFixed(2))]] }),
    })
  }, [editandoPuntos, rutaSel, rutas, editarFila])

  const deshacerPunto = useCallback(() => {
    const ruta = rutas.find((r) => r.id === rutaSel)
    if (!ruta) return
    const pts = leerPuntos(ruta)
    editarFila('Rutas', rutaSel, { puntos: guardarRuta(ruta, { puntos: pts.slice(0, -1) }) })
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
                setEditandoPuntos(false)
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
            {/* En pantalla ancha, el alta vive en la barra; en teléfono es el FAB */}
            <button className="boton-primario !px-3 !py-2 text-sm hidden sm:block" onClick={() => setCreando(true)} title="Crear espacio">
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
            cursor: editandoPuntos ? 'crosshair' : 'default',
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
              interactivas={enRutas && !editandoPuntos}
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
                const Glifo = GLIFO_TIPO[String(e.tipo).toLowerCase()] || GLIFO_TIPO.otro
                const cara = caraDeEspacio(datos, e.id)
                const linea2 = cara?.nombre || subtituloEspacio(e, datos?.Factores)
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
                    {cara?.file_id ? (
                      /* La cara recortada del representante ES el ícono */
                      <span className={`w-12 h-12 rounded-full overflow-hidden border-2 shadow-lg bg-noche
                        ${esLaAbierta ? 'border-marfil' : 'border-oro'}`}>
                        <ImagenDrive fileId={cara.file_id} sz="w200" alt={cara.nombre || e.nombre} className="w-full h-full object-cover" />
                      </span>
                    ) : (
                      <span className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-lg
                        ${esLaAbierta ? 'bg-ambar border-marfil' : 'bg-oro border-noche/60'}`}>
                        <span className="text-noche"><Glifo size={23} /></span>
                      </span>
                    )}
                    <span className="mt-1 flex flex-col items-center bg-noche/85 rounded px-1.5 py-0.5 max-w-[10.5rem]">
                      <span className="font-cartel font-normal uppercase tracking-wider text-[11px] text-marfil whitespace-nowrap max-w-full overflow-hidden text-ellipsis leading-tight">
                        {e.nombre}
                      </span>
                      {linea2 && (
                        <span className="text-[9px] text-arena whitespace-nowrap max-w-full overflow-hidden text-ellipsis leading-tight">
                          {linea2}
                        </span>
                      )}
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
          {enRutas && editandoPuntos && (
            <div className="absolute inset-x-4 top-3 text-center pointer-events-none">
              <span className="text-xs text-noche bg-oro rounded-full px-3 py-1 font-medium">
                Toca el mapa para agregar puntos a la ruta
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
                <span className="w-5 h-0.5 bg-oro inline-block rounded" /> rutas peatonales
              </span>
            </div>
          )}
        </div>
      </div>

      {/* FAB de alta en teléfono: al alcance del pulgar, arriba de la nav */}
      {!enRutas && puedeEditar && !espacioAbierto && (
        <button
          className="sm:hidden fixed right-4 bottom-20 z-40 w-14 h-14 rounded-full bg-oro text-noche
            flex items-center justify-center shadow-2xl active:scale-95
            transition-transform duration-micro ease-casa"
          style={{ boxShadow: '0 0 28px rgba(255,184,77,0.35)' }}
          onClick={() => setCreando(true)}
          aria-label="Crear espacio"
        >
          <Plus size={26} />
        </button>
      )}

      {/* Ficha del espacio */}
      <aside
        className={`fixed z-50 bg-elevada border-linea shadow-2xl
          inset-x-0 bottom-0 rounded-t-2xl border-t max-h-[85dvh]
          sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[28rem] sm:rounded-none sm:border-t-0 sm:border-l sm:max-h-none
          transition-transform duration-panel ease-casa overflow-y-auto
          ${espacioAbierto ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-y-0 sm:translate-x-full'}`}
        aria-hidden={!espacioAbierto}
      >
        {espacioAbierto && (
          <>
            <ManijaSheet onCerrar={() => setAbierto(null)} />
            <FichaEspacio espacio={espacioAbierto} onCerrar={() => setAbierto(null)} />
          </>
        )}
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
