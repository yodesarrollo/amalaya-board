import { useState, useRef, useCallback } from 'react'
import { X, Plus, Undo2, Upload, ChevronLeft, ChevronRight, MapPin, Share2 } from 'lucide-react'
import { usarDatos } from '../datos.jsx'
import ImagenDrive from './ImagenDrive.jsx'
import { compartirCard } from '../compartir.js'

// ============================================================
// Rutas temáticas: polilíneas de color sobre el mapa, paradas
// con antes/después (Hoy / Visión) y elementos deseados cuyo
// estado alimenta "Peticiones al municipio".
//
// - `puntos` de la ruta: JSON [[x,y],...] en porcentajes.
// - `elementos` de la parada: JSON [{texto, estado}] con estado
//   pendiente | gestionado | logrado.
// ============================================================

// Catálogo cerrado de colores de ruta (legibles sobre la foto aérea).
// Si alguien teclea otro hex a mano en el Sheet, se respeta tal cual.
export const COLORES_RUTA = [
  { hex: '#2E7D32', nombre: 'verde' },
  { hex: '#1565C0', nombre: 'azul' },
  { hex: '#C62828', nombre: 'roja' },
  { hex: '#C9A45C', nombre: 'dorada' },
  { hex: '#6A1B9A', nombre: 'morada' },
  { hex: '#00838F', nombre: 'turquesa' },
]

export function leerPuntos(ruta) {
  try {
    const p = JSON.parse(ruta.puntos || '[]')
    return Array.isArray(p) ? p.filter((q) => Array.isArray(q) && q.length === 2) : []
  } catch {
    return []
  }
}

export function leerElementos(parada) {
  try {
    const e = JSON.parse(parada.elementos || '[]')
    return Array.isArray(e) ? e.filter((x) => x && typeof x.texto === 'string') : []
  } catch {
    return []
  }
}

function num(v, d) {
  const n = parseFloat(v)
  return Number.isFinite(n) ? n : d
}

// ------------------------------------------------------------
// La capa SVG con las polilíneas (vive dentro del lienzo con zoom).
// ------------------------------------------------------------
export function RutasCapa({ rutas, paradas, interactivas, rutaSel, recorriendo, onElegirRuta }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ pointerEvents: 'none' }}
    >
      {rutas.map((r) => {
        const pts = leerPuntos(r)
        if (pts.length < 2) return null
        const d = pts.map((p) => p.join(',')).join(' ')
        const esLaActiva = recorriendo === r.id
        const apagada = recorriendo && !esLaActiva
        return (
          <g key={r.id} opacity={apagada ? 0.15 : rutaSel && rutaSel !== r.id ? 0.35 : 1}
             className="transition-opacity duration-panel ease-casa">
            {/* Trazo ancho invisible: el blanco fácil para el dedo */}
            {interactivas && (
              <polyline
                points={d}
                fill="none"
                stroke="#000"
                strokeOpacity="0"
                strokeWidth="4"
                style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                onClick={(ev) => { ev.stopPropagation(); onElegirRuta?.(r.id) }}
              />
            )}
            <polyline
              points={d}
              fill="none"
              stroke={r.color || '#C9A45C'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              pathLength="100"
              className={esLaActiva ? 'ruta-trazandose' : ''}
              style={{ pointerEvents: 'none' }}
            />
            {/* Paradas de la ruta como puntos */}
            {paradas
              .filter((p) => String(p.ruta_id) === String(r.id))
              .map((p) => (
                <circle
                  key={p.id}
                  cx={num(p.pos_x, 50)}
                  cy={num(p.pos_y, 50)}
                  r="1.1"
                  fill={r.color || '#C9A45C'}
                  stroke="#F2EAD9"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
          </g>
        )
      })}
    </svg>
  )
}

// Puntos editables de la ruta seleccionada (capa aparte, encima).
export function PuntosEdicion({ ruta }) {
  const pts = leerPuntos(ruta)
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="0.9" fill="#F2EAD9" stroke={ruta.color || '#C9A45C'} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  )
}

// ------------------------------------------------------------
// Barra de control de rutas (chips + acciones de edición).
// ------------------------------------------------------------
export function BarraRutas({
  rutas, editable, rutaSel, setRutaSel,
  editandoPuntos, setEditandoPuntos,
  agregandoParada, setAgregandoParada,
  onCrearRuta, onDeshacerPunto,
}) {
  const [creando, setCreando] = useState(false)

  return (
    <div className="max-w-6xl mx-auto px-4 pb-2 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {rutas.length === 0 && (
          <p className="text-terciario text-sm">
            Aún no hay rutas.{editable ? ' Crea la primera y ve tocando el mapa para trazarla.' : ''}
          </p>
        )}
        {rutas.map((r) => (
          <button
            key={r.id}
            className={`flex items-center gap-1.5 text-sm rounded-full border px-3 py-1.5 transition-colors duration-micro ease-casa
              ${rutaSel === r.id ? 'border-marfil text-marfil' : 'border-linea text-arena hover:text-marfil'}`}
            onClick={() => {
              setRutaSel(rutaSel === r.id ? null : r.id)
              setEditandoPuntos(false)
              setAgregandoParada(false)
            }}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: r.color || '#C9A45C' }} />
            {r.nombre}
          </button>
        ))}
        {editable && !creando && (
          <button className="boton-secundario !px-3 !py-1.5 text-sm" onClick={() => setCreando(true)}>
            <span className="flex items-center gap-1"><Plus size={14} /> Ruta</span>
          </button>
        )}
      </div>

      {editable && rutaSel && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            className={`${editandoPuntos ? 'boton-primario' : 'boton-secundario'} !px-3 !py-1.5 text-sm`}
            onClick={() => { setEditandoPuntos(!editandoPuntos); setAgregandoParada(false) }}
          >
            {editandoPuntos ? 'Listo con el trazo' : 'Trazar (toca el mapa)'}
          </button>
          {editandoPuntos && (
            <button className="boton-secundario !px-3 !py-1.5 text-sm" onClick={onDeshacerPunto}>
              <span className="flex items-center gap-1"><Undo2 size={14} /> Deshacer punto</span>
            </button>
          )}
          <button
            className={`${agregandoParada ? 'boton-primario' : 'boton-secundario'} !px-3 !py-1.5 text-sm`}
            onClick={() => { setAgregandoParada(!agregandoParada); setEditandoPuntos(false) }}
          >
            <span className="flex items-center gap-1"><MapPin size={14} /> {agregandoParada ? 'Toca el mapa…' : 'Agregar parada'}</span>
          </button>
        </div>
      )}

      {creando && (
        <FormaNuevaRuta
          orden={rutas.length + 1}
          onCrear={async (fila) => { const r = await onCrearRuta(fila); setCreando(false); setRutaSel(r.id); setEditandoPuntos(true) }}
          onCerrar={() => setCreando(false)}
        />
      )}
    </div>
  )
}

function FormaNuevaRuta({ orden, onCrear, onCerrar }) {
  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState(COLORES_RUTA[0].hex)
  const [homenaje, setHomenaje] = useState('')
  const [artista, setArtista] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)

  async function enviar(ev) {
    ev.preventDefault()
    if (!nombre.trim()) return
    setOcupado(true)
    setError(null)
    try {
      await onCrear({
        nombre: nombre.trim(),
        color,
        homenaje_a: homenaje.trim(),
        artista_mural: artista.trim(),
        puntos: '[]',
        orden: String(orden),
      })
    } catch (e) {
      setError(e.message)
      setOcupado(false)
    }
  }

  return (
    <form className="tarjeta bg-elevada p-4 max-w-md space-y-3" onSubmit={enviar}>
      <div className="text-sm text-marfil font-medium">Nueva ruta temática</div>
      <label className="block">
        <span className="text-xs text-arena">Nombre</span>
        <input className="campo !py-2 mt-1" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Ruta verde" autoFocus disabled={ocupado} />
      </label>
      <div>
        <span className="text-xs text-arena">Color</span>
        <div className="flex gap-2 mt-1.5">
          {COLORES_RUTA.map((c) => (
            <button
              key={c.hex}
              type="button"
              className={`w-8 h-8 rounded-full border-2 transition-transform duration-micro ease-casa
                ${color === c.hex ? 'border-marfil scale-110' : 'border-transparent'}`}
              style={{ background: c.hex }}
              onClick={() => setColor(c.hex)}
              title={c.nombre}
              disabled={ocupado}
            />
          ))}
        </div>
      </div>
      <label className="block">
        <span className="text-xs text-arena">Homenaje a (figura de la música o el arte)</span>
        <input className="campo !py-2 mt-1" value={homenaje} onChange={(e) => setHomenaje(e.target.value)} disabled={ocupado} />
      </label>
      <label className="block">
        <span className="text-xs text-arena">Artista del mural</span>
        <input className="campo !py-2 mt-1" value={artista} onChange={(e) => setArtista(e.target.value)} disabled={ocupado} />
      </label>
      {error && <p className="text-ladrillo text-xs" role="alert">{error}</p>}
      <div className="flex gap-2">
        <button type="button" className="boton-secundario flex-1 !py-2 text-sm" onClick={onCerrar} disabled={ocupado}>Cancelar</button>
        <button type="submit" className="boton-primario flex-1 !py-2 text-sm" disabled={ocupado || !nombre.trim()}>
          {ocupado ? 'Creando…' : 'Crear y trazar'}
        </button>
      </div>
    </form>
  )
}

// ------------------------------------------------------------
// La cortina Hoy / Visión de una parada.
// Una sola ventana: divisor arrastrable (o toque para alternar);
// "Hoy" ligeramente desaturada, "Visión" a color pleno con
// filete dorado. Al abrir hace un barrido de presentación.
// ------------------------------------------------------------
function Cortina({ parada, editable, onSubir }) {
  const [p, setP] = useState(30) // % visible de "Hoy" (arranca mostrando la Visión)
  const [arrastrando, setArrastrando] = useState(false)
  const contRef = useRef(null)

  const hay = { actual: !!parada.foto_actual_id, vision: !!parada.foto_vision_id }

  const alBajar = useCallback((ev) => {
    ev.currentTarget.setPointerCapture(ev.pointerId)
    setArrastrando(true)
  }, [])
  const alMover = useCallback((ev) => {
    if (!arrastrando) return
    const rect = contRef.current?.getBoundingClientRect()
    if (!rect) return
    setP(Math.min(Math.max(((ev.clientX - rect.left) / rect.width) * 100, 0), 100))
  }, [arrastrando])
  const alSoltar = useCallback(() => setArrastrando(false), [])

  if (!hay.actual && !hay.vision) {
    return (
      <div className="tarjeta p-6 text-center">
        <p className="text-marfil text-sm font-medium">Esta parada aún no tiene fotos.</p>
        <p className="text-terciario text-xs mt-1">
          La foto de <b>hoy</b> (Street View) y el render de la <b>visión</b> se
          comparan aquí con una cortina.
        </p>
        {editable && (
          <div className="flex gap-2 mt-4 justify-center">
            <BotonSubir texto="Foto de hoy" onElegir={(f) => onSubir('foto_actual_id', f)} />
            <BotonSubir texto="Render de la visión" onElegir={(f) => onSubir('foto_vision_id', f)} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div
        ref={contRef}
        className="relative aspect-[4/5] sm:aspect-video rounded-xl overflow-hidden border border-linea select-none"
        onClick={() => { if (!arrastrando) setP(p > 50 ? 0 : 100) }}
      >
        {/* Visión: color pleno, filete dorado interior */}
        {hay.vision ? (
          <ImagenDrive fileId={parada.foto_vision_id} sz="w1200" alt="Visión" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <Vacio lado="visión" editable={editable} onElegir={(f) => onSubir('foto_vision_id', f)} />
        )}
        <div className="absolute inset-1 rounded-lg border border-oro/60 pointer-events-none" />

        {/* Hoy: recortada por la cortina, desaturada */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: `inset(0 ${100 - p}% 0 0)`,
            transition: arrastrando ? 'none' : 'clip-path 800ms cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          {hay.actual ? (
            <div className="absolute inset-0" style={{ filter: 'saturate(0.55) contrast(0.95)' }}>
              <ImagenDrive fileId={parada.foto_actual_id} sz="w1200" alt="Hoy" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          ) : (
            <Vacio lado="hoy" editable={editable} onElegir={(f) => onSubir('foto_actual_id', f)} />
          )}
        </div>

        {/* Divisor arrastrable */}
        <div
          className="absolute inset-y-0 w-8 -ml-4 flex items-center justify-center cursor-ew-resize"
          style={{ left: `${p}%`, touchAction: 'none', transition: arrastrando ? 'none' : 'left 800ms cubic-bezier(0.22,1,0.36,1)' }}
          onPointerDown={alBajar}
          onPointerMove={alMover}
          onPointerUp={alSoltar}
          onPointerCancel={alSoltar}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-0.5 h-full bg-marfil/90" />
          <div className="absolute w-6 h-6 rounded-full bg-marfil text-noche flex items-center justify-center text-[10px] font-bold shadow">⇄</div>
        </div>

        <span className="absolute top-2 left-2 text-[10px] uppercase tracking-widest text-marfil bg-noche/70 rounded-full px-2 py-0.5 pointer-events-none">Hoy</span>
        <span className="absolute bottom-2 right-2 text-[10px] uppercase tracking-widest text-marfil bg-noche/70 rounded-full px-2 py-0.5 pointer-events-none">Visión</span>
      </div>

      {editable && (
        <div className="flex gap-2 mt-2">
          <BotonSubir texto={hay.actual ? 'Cambiar foto de hoy' : 'Foto de hoy'} onElegir={(f) => onSubir('foto_actual_id', f)} />
          <BotonSubir texto={hay.vision ? 'Cambiar visión' : 'Render de la visión'} onElegir={(f) => onSubir('foto_vision_id', f)} />
        </div>
      )}
    </div>
  )
}

function Vacio({ lado, editable, onElegir }) {
  return (
    <div className="absolute inset-0 bg-superficie flex items-center justify-center">
      <p className="text-terciario text-xs text-center px-4">
        Falta la foto de {lado === 'hoy' ? 'hoy' : 'la visión'}.
        {editable ? ' Súbela con el botón de abajo.' : ''}
      </p>
    </div>
  )
}

function BotonSubir({ texto, onElegir }) {
  const ref = useRef(null)
  const [ocupado, setOcupado] = useState(false)
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (ev) => {
          const f = ev.target.files?.[0]
          ev.target.value = ''
          if (!f) return
          setOcupado(true)
          try { await onElegir(f) } finally { setOcupado(false) }
        }}
      />
      <button className="boton-secundario !px-3 !py-1.5 text-xs flex-1" onClick={() => ref.current?.click()} disabled={ocupado}>
        <span className="flex items-center justify-center gap-1"><Upload size={12} /> {ocupado ? 'Subiendo…' : texto}</span>
      </button>
    </>
  )
}

// ------------------------------------------------------------
// El recorrido: tarjeta de la parada activa + navegación.
// La "cámara" del mapa la controla Mapa.jsx con la posición de
// la parada; esto es el contenido del pie.
// ------------------------------------------------------------
const ESTADOS_ELEMENTO = ['pendiente', 'gestionado', 'logrado']
const COLOR_ESTADO = {
  pendiente: 'border-oro text-oro',
  gestionado: 'border-arena text-arena',
  logrado: 'border-salvia text-salvia',
}

export function Recorrido({ ruta, paradas, idx, setIdx, onCerrar }) {
  const { sesion, modo, editarFila, subirArchivo } = usarDatos()
  const editable = modo !== 'demo' && ['admin', 'editor'].includes(sesion?.rol)
  const [nuevoElemento, setNuevoElemento] = useState('')
  const [error, setError] = useState(null)
  const swipe = useRef(null)

  const lista = paradas
    .filter((p) => String(p.ruta_id) === String(ruta.id))
    .sort((a, b) => num(a.orden, 999) - num(b.orden, 999))
  const parada = lista[idx]

  // Deslizar entre paradas con el dedo (la cortina y los controles capturan
  // sus propios gestos, así que aquí solo llega el swipe del fondo).
  const alIniciarSwipe = useCallback((ev) => {
    swipe.current = { x: ev.clientX, y: ev.clientY }
  }, [])
  const alTerminarSwipe = useCallback((ev) => {
    const s = swipe.current
    swipe.current = null
    if (!s) return
    const dx = ev.clientX - s.x
    const dy = ev.clientY - s.y
    if (Math.abs(dx) < 60 || Math.abs(dy) > 50) return
    if (dx < 0 && idx < lista.length - 1) setIdx(idx + 1)
    if (dx > 0 && idx > 0) setIdx(idx - 1)
  }, [idx, lista.length, setIdx])

  async function subirFoto(campo, file) {
    setError(null)
    try {
      const fila = await subirArchivo('', file, false)
      editarFila('Paradas', parada.id, { [campo]: fila.file_id })
    } catch (e) {
      setError(e.message)
    }
  }

  function cambiarElementos(nuevos) {
    editarFila('Paradas', parada.id, { elementos: JSON.stringify(nuevos) })
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 bg-elevada border-t border-linea rounded-t-2xl shadow-2xl max-h-[75dvh] overflow-y-auto"
      onPointerDown={alIniciarSwipe}
      onPointerUp={alTerminarSwipe}
      onPointerCancel={() => { swipe.current = null }}
    >
      <div className="sm:hidden sticky top-0 z-10 flex justify-center py-2 bg-elevada" aria-hidden="true">
        <span className="w-10 h-1.5 rounded-full bg-linea" />
      </div>
      <div className="max-w-2xl mx-auto p-5 pt-2 sm:pt-5">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: ruta.color || '#C9A45C' }} />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-terciario">
              {ruta.nombre}
              {ruta.homenaje_a ? ` · homenaje a ${ruta.homenaje_a}` : ''}
              {ruta.artista_mural ? ` · mural de ${ruta.artista_mural}` : ''}
            </div>
            <h3 className="font-titulo text-xl truncate">
              {parada ? parada.nombre : 'Sin paradas todavía'}
            </h3>
          </div>
          {parada && (
            <button
              className="text-arena hover:text-marfil p-2 -m-1 transition-colors duration-micro ease-casa"
              onClick={() => compartirCard({
                titulo: parada.nombre,
                subtitulo: ruta.nombre,
                detalle: ruta.homenaje_a ? `Homenaje a ${ruta.homenaje_a}` : '',
              })}
              aria-label="Compartir esta esquina"
              title="Genera la card para tu historia"
            >
              <Share2 size={18} />
            </button>
          )}
          <button className="text-arena hover:text-marfil p-2 -m-2 transition-colors duration-micro ease-casa" onClick={onCerrar} aria-label="Cerrar recorrido">
            <X size={20} />
          </button>
        </div>

        {parada ? (
          <div className="mt-4 space-y-4">
            <Cortina parada={parada} editable={editable} onSubir={subirFoto} />

            <div>
              <div className="text-xs uppercase tracking-wide text-terciario mb-2">
                Elementos deseados (alimentan Peticiones al municipio)
              </div>
              <div className="space-y-1.5">
                {leerElementos(parada).map((el, i) => {
                  const estado = ESTADOS_ELEMENTO.includes(el.estado) ? el.estado : 'pendiente'
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        className={`shrink-0 text-xs rounded-full border px-2 py-0.5 transition-colors duration-micro ease-casa ${COLOR_ESTADO[estado]} ${editable ? '' : 'pointer-events-none'}`}
                        onClick={() => {
                          const nuevos = leerElementos(parada)
                          const sig = ESTADOS_ELEMENTO[(ESTADOS_ELEMENTO.indexOf(estado) + 1) % ESTADOS_ELEMENTO.length]
                          nuevos[i] = { ...nuevos[i], estado: sig }
                          cambiarElementos(nuevos)
                        }}
                        title={editable ? 'Cambiar estado' : undefined}
                      >
                        {estado}
                      </button>
                      <span className="text-sm text-marfil flex-1">{el.texto}</span>
                      {editable && (
                        <button
                          className="text-terciario hover:text-ladrillo p-1"
                          onClick={() => cambiarElementos(leerElementos(parada).filter((_, j) => j !== i))}
                          aria-label="Quitar"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  )
                })}
                {leerElementos(parada).length === 0 && (
                  <p className="text-terciario text-xs">
                    Ej. banquetas, arbolado, alumbrado, bocinas, mural, plantas…
                  </p>
                )}
              </div>
              {editable && (
                <form
                  className="flex gap-2 mt-2"
                  onSubmit={(ev) => {
                    ev.preventDefault()
                    if (!nuevoElemento.trim()) return
                    cambiarElementos([...leerElementos(parada), { texto: nuevoElemento.trim(), estado: 'pendiente' }])
                    setNuevoElemento('')
                  }}
                >
                  <input className="campo !py-1.5 flex-1 text-sm" value={nuevoElemento} onChange={(e) => setNuevoElemento(e.target.value)} placeholder="Elemento deseado…" />
                  <button type="submit" className="boton-primario !px-3 !py-1.5" disabled={!nuevoElemento.trim()} aria-label="Agregar">
                    <Plus size={14} />
                  </button>
                </form>
              )}
            </div>

            {error && <p className="text-ladrillo text-sm" role="alert">{error}</p>}

            <div className="flex items-center justify-between">
              <button
                className="boton-secundario !px-3 !py-2 text-sm"
                onClick={() => setIdx(Math.max(idx - 1, 0))}
                disabled={idx === 0}
              >
                <span className="flex items-center gap-1"><ChevronLeft size={14} /> Anterior</span>
              </button>
              <span className="cifra text-terciario text-sm">{idx + 1} / {lista.length}</span>
              <button
                className="boton-secundario !px-3 !py-2 text-sm"
                onClick={() => setIdx(Math.min(idx + 1, lista.length - 1))}
                disabled={idx >= lista.length - 1}
              >
                <span className="flex items-center gap-1">Siguiente <ChevronRight size={14} /></span>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-terciario text-sm mt-3">
            Esta ruta aún no tiene paradas. Con la ruta elegida, toca
            "Agregar parada" y luego el punto del mapa donde va.
          </p>
        )}
      </div>
    </div>
  )
}
