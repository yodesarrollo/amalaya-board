import { useEffect, useRef, useState, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Layers, Box, Map as MapIcon, Image as ImageIcon, Crosshair, Check, X, RotateCw, PersonStanding, ExternalLink, Footprints, Search, List } from 'lucide-react'
import { usarDatos } from '../datos.jsx'
import { puedeEditarRol } from '../roles.js'
import { BASE } from '../config.js'
import { leerRuta } from './Rutas.jsx'
import { NOMBRE_TIPO } from './Glifos.jsx'
import { rayitasHtml, nivelAvance, ETAPAS_DESARROLLO } from '../avance.js'
import { COLOR_TIPO, TIPOS, claveTipo } from '../tipos.js'
import { m2Construidos } from '../calc.js'
import { ZONAS, MODULOS, zonasDeEspacio, centroDeZonas, filasModelos } from '../territorio.js'

// ============================================================
// Mapa 3D — el corazón de Amalaya sobre la ciudad real.
//
// - Base: mapa vectorial de la ciudad (OpenFreeMap, sin llave) o
//   satélite (Esri World Imagery, sin llave). Cámara inclinada.
// - Los EDIFICIOS de la ciudad se extruyen con su altura real.
// - Los ESPACIOS del Sheet se vuelven volúmenes con el lenguaje de la
//   lámina "Zona Núcleo" (foro rosa, comercial naranja, mixto amarillo,
//   estacionamiento gris con azotea azul). La altura sale de los pisos.
// - Las RUTAS y PARADAS del Sheet se pintan sobre las calles.
// - Todo lo que el Sheet guarda en PORCENTAJES del plano se convierte a
//   coordenadas con la CALIBRACIÓN del plano (4 esquinas), que vive en
//   Config → clave `mapa_geo`. El admin la ajusta arrastrando esquinas.
//
// No cambia ningún dato: es otra manera de mirar el mismo Sheet. La
// edición fina (arrastrar zonas, trazar rutas) sigue en la vista Plano.
// ============================================================

const ESTILO_CIUDAD = 'https://tiles.openfreemap.org/styles/fiord'
const SATELITE = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'

// Esquinas por defecto del plano (TL, TR, BR, BL) — centro histórico de
// Hermosillo, alrededor de Serdán / Garmendia / Chihuahua. Se afinan con
// "Calibrar plano" y quedan guardadas en el Sheet.
const GEO_DEF = [
  // Calibrado 12-sep-2026 por correlación de la red vial (OSM) contra la
  // foto: 421 × 346 m, norte arriba, coincidencia 0.67. Se afina en el board.
  [-110.957125, 29.07749],
  [-110.952798, 29.07749],
  [-110.952798, 29.074361],
  [-110.957125, 29.074361],
]

// Colores y nombres: catálogo único en src/tipos.js (chinche #17).
// Altura por tipo cuando el Sheet no trae pisos. Mínimo 9 m (3 niveles):
// por debajo de eso un volumen se lee como losa y desaparece junto a la ciudad.
const ALTURA_TIPO = { venue: 18, estacionamiento: 15, comercial: 11, mixto: 13, museo: 10, escuela: 9, estudio: 9, departamento: 10, restaurante: 9, otro: 9 }

const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d }

// Entrada animada por capas (una sola vez al cargar, ~4 s, se salta tocando):
// 0 satélite → 1 lámina de colores → 2 rutas trazándose → 3 puntos → 4 vuelo/fin.
// (El simulador la puede alentar con window.__amalayaEntradaX para capturar cada etapa.)
const ENTRADA_BASE = { lamina: 600, rutas: 1500, trazo: 1300, puntos: 2900, vuelo: 3400, vueloDur: 2400 }
const ENTRADA_MS = new Proxy(ENTRADA_BASE, { get: (o, k) => o[k] * ((typeof window !== 'undefined' && window.__amalayaEntradaX) || 1) })
const GUIA_LLAVE = 'amalaya_guia_mapa_v1'
const GUIA = [
  'Gira la maqueta: arrastra con clic derecho (o con dos dedos) o usa ↺ ↻.',
  'Acerca y aleja con la rueda, pellizcando o con + y −.',
  'Toca un espacio para abrir su ficha.',
]
const leerGuiaVista = () => { try { return localStorage.getItem(GUIA_LLAVE) === 'si' } catch { return false } }
const marcarGuiaVista = () => { try { localStorage.setItem(GUIA_LLAVE, 'si') } catch { /* modo privado */ } }

export function leerGeo(config) {
  const fila = (config || []).find((c) => String(c.clave) === 'mapa_geo')
  try {
    const j = JSON.parse(fila?.valor || '')
    if (Array.isArray(j) && j.length === 4 && j.every((p) => Array.isArray(p) && p.length === 2)) return j
  } catch { /* sin calibrar */ }
  return GEO_DEF
}

// Porcentaje del plano → [lng, lat] con las 4 esquinas (afín: soporta giro).
export function pctAGeo(geo, x, y) {
  const [tl, tr, , bl] = geo
  const u = x / 100, v = y / 100
  return [
    tl[0] + u * (tr[0] - tl[0]) + v * (bl[0] - tl[0]),
    tl[1] + u * (tr[1] - tl[1]) + v * (bl[1] - tl[1]),
  ]
}

// [lng, lat] → porcentaje del plano (inversa de pctAGeo).
export function geoAPct(geo, lng, lat) {
  const [tl, tr, , bl] = geo
  const a = tr[0] - tl[0], b = bl[0] - tl[0], c = tr[1] - tl[1], d = bl[1] - tl[1]
  const det = a * d - b * c || 1e-12
  const dx = lng - tl[0], dy = lat - tl[1]
  const u = (dx * d - b * dy) / det, v = (a * dy - c * dx) / det
  return [Number((u * 100).toFixed(2)), Number((v * 100).toFixed(2))]
}

// Caja que envuelve las 4 esquinas del plano, para encuadrar siempre el polígono.
const BBOX_LAMINA = (() => { const p = Object.values(ZONAS).flatMap((z) => z.anillo); const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]); return [[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]] })()
const ENCUADRE = { top: 70, bottom: 96, left: 120, right: 120 }
export function bboxDe(geo) {
  const xs = geo.map((p) => p[0]); const ys = geo.map((p) => p[1])
  return [[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]]
}

function centroGeo(geo) {
  return [(geo[0][0] + geo[2][0]) / 2, (geo[0][1] + geo[2][1]) / 2]
}

function alturaEspacio(e, factores) {
  const propios = (factores || []).filter((f) => String(f.espacio_id) === String(e.id))
  const pisos = propios.find((f) => /piso/i.test(f.etiqueta || ''))
  const n = pisos ? num(pisos.valor, 0) : 0
  if (n > 0) return Math.max(n * 3.6, 9)
  return ALTURA_TIPO[String(e.tipo).toLowerCase()] || 9
}

function geojsonEspacios(espacios, factores, geo) {
  return {
    type: 'FeatureCollection',
    features: espacios.flatMap((e) => {
      const zonas = zonasDeEspacio(e)
      const tipoZ = claveTipo(e.tipo)
      if (zonas.length) {
        // La lámina puesta en su sitio: cada zona es su contorno real. Donde hay
        // modelo 3D, el volumen es solo una plataforma baja y el GLB va encima.
        return zonas.map((z) => ({
          type: 'Feature',
          properties: {
            id: e.id, nombre: e.nombre, tipo: tipoZ, zona: z,
            color: COLOR_TIPO[tipoZ] || COLOR_TIPO.otro,
            altura: MODULOS.some((mo) => mo.zona === z) ? 0.6 : alturaEspacio(e, factores),
            techo: COLOR_TIPO[tipoZ] || COLOR_TIPO.otro,
          },
          geometry: { type: 'Polygon', coordinates: [ZONAS[z].anillo] },
        }))
      }
      const x = num(e.pos_x, 40), y = num(e.pos_y, 40)
      const w = Math.max(num(e.ancho, 18), 3), h = Math.max(num(e.alto, 12), 3)
      const anillo = [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]].map(([px, py]) => pctAGeo(geo, px, py))
      const tipo = claveTipo(e.tipo)
      return {
        type: 'Feature',
        id: e.id,
        properties: {
          id: e.id,
          nombre: e.nombre,
          tipo,
          color: COLOR_TIPO[tipo] || COLOR_TIPO.otro,
          altura: alturaEspacio(e, factores),
          techo: tipo === 'estacionamiento' ? '#3D6FB5' : COLOR_TIPO[tipo] || COLOR_TIPO.otro,
        },
        geometry: { type: 'Polygon', coordinates: [anillo] },
      }
    }),
  }
}

function geojsonRutas(rutas, geo) {
  return {
    type: 'FeatureCollection',
    features: rutas.map((r) => {
      const { puntos, grosor, opacidad } = leerRuta(r)
      return {
        type: 'Feature',
        properties: { id: r.id, nombre: r.nombre, color: r.color || '#C9A45C', grosor: grosor * 2.2, opacidad },
        geometry: { type: 'LineString', coordinates: puntos.map(([px, py]) => pctAGeo(geo, px, py)) },
      }
    }).filter((f) => f.geometry.coordinates.length >= 2),
  }
}

function geojsonParadas(paradas, geo) {
  return {
    type: 'FeatureCollection',
    features: paradas.map((p) => ({
      type: 'Feature',
      properties: { id: p.id, nombre: p.nombre },
      geometry: { type: 'Point', coordinates: pctAGeo(geo, num(p.pos_x, 50), num(p.pos_y, 50)) },
    })),
  }
}

// Dos vestidos para la misma cartografía. «Lámina» copia el carácter del
// dibujo "Zona Núcleo" de la presentación: papel blanco, calles como
// dibujo de línea, ciudad en gris claro y los espacios en colores planos.
export const TEMAS = {
  lamina: {
    fondo: '#FFFFFF', tierra: '#F3F1EC', verde: '#EAEDE5', agua: '#DCE6EE',
    calle: '#FFFFFF', calleBorde: '#5A5752', calleAncho: 1.1, texto: '#2B2B2B', halo: '#FFFFFF',
    ciudad: '#EDEBE6', ciudadOp: 1, borde: '#1F1F1F', espacioOp: 1,
    luz: '#FFFFFF', luzInt: 0.35, bruma: '#F3F1EC',
  },
  noche: {
    fondo: '#151110', tierra: '#1C1613', verde: '#1B1A13', agua: '#10141A',
    calle: '#4A3D30', calleBorde: '#4A3D30', calleAncho: 1, texto: '#B7A890', halo: '#141010',
    ciudad: '#2C231C', ciudadOp: 0.85, borde: '#F2EAD9', espacioOp: 0.92,
    luz: '#F2E3C6', luzInt: 0.45, bruma: '#1E1814',
  },
}

function vestir(m, t) {
  for (const capa of m.getStyle().layers) {
    try {
      if (capa.type === 'background') m.setPaintProperty(capa.id, 'background-color', t.fondo)
      else if (capa.type === 'fill') m.setPaintProperty(capa.id, 'fill-color', /water|ocean|river|lake/i.test(capa.id) ? t.agua : (/park|grass|wood|green|garden/i.test(capa.id) ? t.verde : t.tierra))
      else if (capa.type === 'line') {
        const esCasing = /casing|outline/i.test(capa.id)
        const esCalle = /road|highway|street|motorway|trunk|primary|secondary|tertiary|minor|service|path|bridge|tunnel/i.test(capa.id)
        if (esCalle) m.setPaintProperty(capa.id, 'line-color', esCasing ? t.calleBorde : t.calle)
        else m.setPaintProperty(capa.id, 'line-color', /water|river/i.test(capa.id) ? t.agua : t.calleBorde)
      } else if (capa.type === 'symbol') {
        m.setPaintProperty(capa.id, 'text-color', t.texto)
        m.setPaintProperty(capa.id, 'text-halo-color', t.halo)
        m.setPaintProperty(capa.id, 'text-halo-width', 1.2)
      }
    } catch { /* alguna capa no admite la propiedad: se deja como viene */ }
  }
  if (m.getLayer('ciudad-3d')) {
    m.setPaintProperty('ciudad-3d', 'fill-color', t.ciudad)
    m.setPaintProperty('ciudad-3d', 'fill-opacity', t.ciudadOp * 0.6)
  }
  if (m.getLayer('ciudad-borde')) m.setPaintProperty('ciudad-borde', 'line-color', t.borde)
  if (m.getLayer('espacios-borde')) m.setPaintProperty('espacios-borde', 'line-color', t.borde)
  if (m.getLayer('espacios-3d')) m.setPaintProperty('espacios-3d', 'fill-extrusion-opacity', t.espacioOp)
  if (m.getLayer('paradas')) { m.setPaintProperty('paradas', 'circle-color', t.halo); m.setPaintProperty('paradas', 'circle-stroke-color', t.borde) }
  // 24-sep (chinche «que se vea de primer nivel»): luz de maqueta. Una sola fuente cálida y baja,
  // fija al mapa (no a la cámara), para que cada volumen tenga cara iluminada y cara en sombra
  // al girar — la diferencia entre «bloques de color» y una maqueta de despacho.
  try { m.setLight({ anchor: 'map', position: [1.4, 210, 38], color: t.luz || '#F2E3C6', intensity: t.luzInt ?? 0.42 }) } catch { /* motor sin setLight */ }
  // Horizonte al inclinar: bruma del mismo tono del fondo (no un degradado de color), para que el
  // borde del mundo no corte en seco. Sin «sky» en navegadores que no lo tengan.
  try {
    if (m.setSky) m.setSky({ 'sky-color': t.fondo, 'horizon-color': t.bruma || t.fondo, 'fog-color': t.bruma || t.fondo,
      'sky-horizon-blend': 0.6, 'horizon-fog-blend': 0.7, 'fog-ground-blend': 0.85, 'atmosphere-blend': 0 })
  } catch { /* versión sin cielo */ }
}

// --- Cartela técnica (25-sep, chinche #10: «que se vea de primer nivel… que lo vea un profesional
// y entienda»). Tres convenciones de todo plano de despacho que la maqueta no traía: escala gráfica,
// norte y cartela con los datos del polígono. Todo sale del Sheet y de la calibración; nada inventado.
const R_TIERRA = 6371008.8
function distanciaM(a, b) {
  const rad = Math.PI / 180, dLat = (b[1] - a[1]) * rad, dLng = (b[0] - a[0]) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLng / 2) ** 2
  return 2 * R_TIERRA * Math.asin(Math.sqrt(h))
}
// Barra de escala «redonda» (10, 20, 50, 100… m) que quepa en ~96 px al zoom y latitud actuales.
function escalaDe(m) {
  const lat = m.getCenter().lat, mpp = 40075016.686 * Math.cos(lat * Math.PI / 180) / (512 * 2 ** m.getZoom())
  const maxM = mpp * 96
  const pasos = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000]
  const metros = pasos.filter((x) => x <= maxM).pop() || 5
  return { px: Math.round(metros / mpp), etiqueta: metros >= 1000 ? `${metros / 1000} km` : `${metros} m` }
}
const NOMBRE_ETAPA = { idea: 'idea', negociacion: 'negociación', proyecto: 'proyecto', obra: 'obra', operando: 'operando' }

const CAPAS_DEF = { satelite: true, ciudad: false, modelos: true, espacios: true, rutas: true, recorrido: true, calco: false, lamina: false }

export default function Mapa3D({ espacios, rutas, paradas, onAbrir, onRecorrer, onNuevo, edicion = {}, enfocado = null }) {
  // edicion: { modoEdicion, editandoPuntos, rutaSel, onMoverEspacio(id, pctCentroX, pctCentroY), onAgregarPunto(pctX, pctY) }
  const edRef = useRef(edicion)
  useEffect(() => { edRef.current = edicion }, [edicion])
  const { datos, sesion, modo, editarFila, crearFila, verArchivo, subirArchivo } = usarDatos()
  const puedeEditar = modo !== 'demo' && puedeEditarRol(sesion?.rol)
  const geoSheet = useMemo(() => leerGeo(datos?.Config), [datos?.Config])
  const puedeCalibrar = modo !== 'demo' && sesion?.rol === 'admin'

  const cont = useRef(null)
  const mapa = useRef(null)
  // Los rótulos son elementos de pantalla: sin esto crecen contra el mapa y se encinan.
  const acomodarPines = () => {
    const m = mapa.current
    if (!m) return
    const z = m.getZoom()
    const esc = Math.max(0.74, Math.min(1.1, 0.74 + (z - 14.4) * 0.1))
    const min = z < 15.3
    const puestos = []
    const lista = marcadores.current
      .map((mk) => ({ mk, p: m.project(mk.getLngLat()) }))
      .sort((a, b) => b.p.y - a.p.y) // los de adelante mandan
    for (const { mk, p } of lista) {
      const el = mk.getElement()
      el.style.setProperty('--esc', esc)
      el.classList.toggle('pin3d-min', min)
      // UX-02: al mover espacios ningún pin se esconde (si no, no se podría tomar).
      if (min || el.classList.contains('pin3d-editable')) { el.classList.remove('pin3d-tapado'); continue }
      const aire = 8 // aire entre rótulos: sin esto dos cercanos se ven pegados
      const w = (el.offsetWidth * esc || 140) + aire; const h = (el.offsetHeight * esc || 34) + aire
      const caja = { x1: p.x - w / 2, x2: p.x + w / 2, y1: p.y - h, y2: p.y + aire }
      const choca = puestos.some((q) => !(caja.x2 < q.x1 || caja.x1 > q.x2 || caja.y2 < q.y1 || caja.y1 > q.y2))
      el.classList.toggle('pin3d-tapado', choca)
      if (!choca) puestos.push(caja)
    }
  }
  const onRecorrerRef = useRef(onRecorrer)
  useEffect(() => { onRecorrerRef.current = onRecorrer }, [onRecorrer])
  const marcadores = useRef([])
  const esquinas = useRef([])
  const [listo, setListo] = useState(false)
  // Entrada por capas: 0 satélite · 1 lámina · 2 rutas · 3 puntos · 4 fin
  const reducido = useMemo(() => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false } }, [])
  // La entrada animada corre una vez por sesión; al volver al mapa, directo a la maqueta.
  const [etapa, setEtapa] = useState(() => { try { return reducido || sessionStorage.getItem('amalaya_entrada') ? 4 : 0 } catch { return reducido ? 4 : 0 } })
  useEffect(() => { if (etapa >= 4) { try { sessionStorage.setItem('amalaya_entrada', '1') } catch { /* sin almacenamiento */ } } }, [etapa])
  const etapaRef = useRef(etapa)
  useEffect(() => { etapaRef.current = etapa }, [etapa])
  const relojesEntrada = useRef([])
  const trazo = useRef(null)
  const rutasGeoRef = useRef(null)
  const [guia, setGuia] = useState(-1) // índice del globo, -1 = sin guía
  const [lista, setLista] = useState(false)
  const [busca, setBusca] = useState('')
  const [capas, setCapas] = useState(CAPAS_DEF)
  const [cartelaAbierta, setCartelaAbierta] = useState(() => { try { return localStorage.getItem('amalaya_cartela') === '1' } catch { return false } })
  const [modelosListos, setModelosListos] = useState(false)
  // Leyenda clicable (chinche #17): tipos apagados y cuántos hay de cada uno.
  const [tiposOcultos, setTiposOcultos] = useState([])
  const conteoTipos = useMemo(() => {
    const c = {}
    for (const e of espacios) { const k = claveTipo(e.tipo); c[k] = (c[k] || 0) + 1 }
    return c
  }, [espacios])
  const [tema, setTema] = useState('lamina')
  const temaRef = useRef('lamina')
  useEffect(() => { temaRef.current = tema; if (mapa.current && listo) vestir(mapa.current, TEMAS[tema]) }, [tema, listo])
  const [opacidadCalco, setOpacidadCalco] = useState(0.55)
  const [inclinado, setInclinado] = useState(true)
  const [panel, setPanel] = useState(false)
  const [escala, setEscala] = useState(null)
  const [rumbo, setRumbo] = useState(0)
  const [calibrando, setCalibrando] = useState(false)
  const [geoTemp, setGeoTemp] = useState(null)
  const geo = geoTemp || geoSheet
  const geoRef = useRef(geo)
  const cartela = useMemo(() => {
    const [tl, tr, , bl] = geo
    const ancho = distanciaM(tl, tr), fondo = distanciaM(tl, bl)
    const conteo = Object.fromEntries(ETAPAS_DESARROLLO.map((k) => [k, 0]))
    let m2c = 0
    for (const e of espacios || []) {
      conteo[ETAPAS_DESARROLLO[nivelAvance(e.estado_desarrollo) - 1]]++
      try { m2c += m2Construidos(e, datos?.Factores || []).m2c || 0 } catch { /* espacio sin datos suficientes */ }
    }
    return { ancho, fondo, ha: (ancho * fondo) / 10000, n: (espacios || []).length, m2c, conteo }
  }, [geo, espacios, datos?.Factores])
  useEffect(() => { geoRef.current = geo }, [geo])
  // El monito: soltarlo en una calle abre el Street View de ese punto.
  const [pop360, setPop360] = useState(null)             // {ruta, punto} → pop-up del recorrido 360
  const [monito, setMonito] = useState(false)          // esperando el clic
  const [punto, setPunto] = useState(null)              // {lng, lat, heading}
  const monitoRef = useRef(null)
  const monitoActivo = useRef(false)
  useEffect(() => { monitoActivo.current = monito }, [monito])

  // UX-07: si falla el 3D (sin WebGL o sin cartografía) se sigue trabajando
  // con la lista, las fichas, la lámina y las descargas.
  const [falla3d, setFalla3d] = useState(null)

  // --- crear el mapa una sola vez ------------------------------
  useEffect(() => {
    if (!cont.current || mapa.current) return
    const centro = centroGeo(geoSheet)
    if (!hayWebGL()) { setFalla3d('Este equipo no muestra 3D (WebGL apagado).'); return }
    let m
    try { m = new maplibregl.Map({
      container: cont.current,
      style: ESTILO_CIUDAD,
      center: centro,
      zoom: 15.6,
      pitch: 0,
      bearing: 0,
      antialias: true,
      attributionControl: false,
      clickTolerance: 5,          // un micro-arrastre ya no se come el clic
    }) } catch (err) { setFalla3d('El mapa 3D no arrancó en este equipo.'); return }
    let cargo = false
    m.once('load', () => { cargo = true })
    // Sin cartografía el mapa se queda en blanco: a los 15 s se ofrece el plan B.
    const relojFalla = setTimeout(() => { if (!cargo) setFalla3d('No cargó la cartografía (sin conexión con el servicio de mapas).') }, 15000)
    m.on('error', (e) => { if (!cargo && /style|fetch|Failed|NetworkError|AJAXError/i.test(String(e?.error?.message || e?.error || ''))) setFalla3d('No cargó la cartografía (sin conexión con el servicio de mapas).') })
    m.once('remove', () => clearTimeout(relojFalla))
    m.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left')
    window.__amalayaMapa = m
    m.on('error', (e) => console.warn('mapa3d', e?.error?.message || e))
    // Si el navegador tiene la pestaña dormida, MapLibre no emite ni 'load'
    // ni 'styledata': por eso además se reintenta con reloj hasta que el
    // estilo esté de pie. Así el tablero abierto en segundo plano no se queda
    // colgado en el velo de carga.
    let arrancado = false
    let reloj = null
    const arrancar = () => {
      if (arrancado) return
      if (!m.isStyleLoaded()) { clearTimeout(reloj); reloj = setTimeout(arrancar, 400); return }
      clearTimeout(reloj)
      arrancado = true
      console.info('mapa3d load', m.getStyle().layers.length, Object.keys(m.getStyle().sources))
      vestir(m, TEMAS[temaRef.current])
      // Satélite (apagado por defecto)
      m.addSource('satelite', { type: 'raster', tiles: [SATELITE], tileSize: 256, attribution: 'Esri World Imagery' })
      const primeraEtiqueta = m.getStyle().layers.find((l) => l.type === 'symbol')?.id
      m.addLayer({ id: 'satelite', type: 'raster', source: 'satelite', layout: { visibility: 'none' }, paint: { 'raster-opacity': 0.9, 'raster-saturation': -0.35, 'raster-brightness-max': 0.85 } }, primeraEtiqueta)

      // Edificios de la ciudad: PLANOS. El 3D es solo para los espacios del
      // proyecto (plan UX v2): así la maqueta se lee sin competir con la ciudad.
      m.addLayer({
        id: 'ciudad-3d', type: 'fill', source: 'openmaptiles', 'source-layer': 'building', minzoom: 14,
        paint: { 'fill-color': '#2C231C', 'fill-opacity': 0.5 },
      }, primeraEtiqueta)
      // Contorno de los edificios de la ciudad a nivel de piso (el "dibujo de línea")
      m.addLayer({ id: 'ciudad-borde', type: 'line', source: 'openmaptiles', 'source-layer': 'building', minzoom: 15, paint: { 'line-color': '#1F1F1F', 'line-width': 0.6, 'line-opacity': 0.55 } }, primeraEtiqueta)

      // Calco del plano (la imagen del tablero, georreferenciada)
      m.addSource('calco', { type: 'image', url: `${BASE}mapa-poligono.jpg`, coordinates: geoSheet })
      m.addLayer({ id: 'calco', type: 'raster', source: 'calco', layout: { visibility: 'none' }, paint: { 'raster-opacity': 0.55, 'raster-fade-duration': 0 } }, primeraEtiqueta)

      // Espacios como volúmenes
      m.addSource('espacios', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      m.addLayer({
        id: 'espacios-3d', type: 'fill-extrusion', source: 'espacios',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'altura'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 1,
          'fill-extrusion-vertical-gradient': true,
        },
      })
      // Contexto de la lámina que no es un espacio del proyecto (Plaza Hidalgo, conjunto al fondo)
      m.addSource('contexto', { type: 'geojson', data: { type: 'FeatureCollection', features: Object.entries(ZONAS).filter(([, z]) => !z.espacio).map(([k, z]) => ({ type: 'Feature', properties: { zona: k, nombre: z.nombre, color: z.color }, geometry: { type: 'Polygon', coordinates: [z.anillo] } })) } })
      m.addLayer({ id: 'contexto-piso', type: 'fill', source: 'contexto', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.35 } })
      m.addLayer({ id: 'contexto-borde', type: 'line', source: 'contexto', paint: { 'line-color': ['get', 'color'], 'line-width': 1.2, 'line-dasharray': [2, 2] } })
      m.addLayer({ id: 'espacios-borde', type: 'line', source: 'espacios', layout: { 'line-join': 'round' }, paint: { 'line-color': '#1F1F1F', 'line-width': ['interpolate', ['exponential', 1.6], ['zoom'], 14, 0.8, 16, 1.6, 18.5, 2.6], 'line-opacity': 0.9 } })

      // Rutas peatonales
      m.addSource('rutas', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      m.addLayer({ id: 'rutas-halo', type: 'line', source: 'rutas', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#141010', 'line-width': ['+', ['get', 'grosor'], 4], 'line-opacity': 0.5 } })
      m.addLayer({ id: 'rutas', type: 'line', source: 'rutas', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['get', 'color'], 'line-width': ['get', 'grosor'], 'line-opacity': ['get', 'opacidad'] } })
      m.addSource('paradas', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      m.addLayer({ id: 'paradas', type: 'circle', source: 'paradas', paint: { 'circle-radius': 5, 'circle-color': '#141010', 'circle-stroke-color': '#C9A45C', 'circle-stroke-width': 2 } })

      // Recorrido 360 (borrador): puntos cada ~10 m con panorama propio
      m.addSource('recorrido', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      m.addLayer({ id: 'recorrido-linea', type: 'line', source: 'recorrido', filter: ['==', '$type', 'LineString'], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['coalesce', ['get', 'color'], '#FFB84D'], 'line-width': 3, 'line-opacity': 0.55, 'line-dasharray': [1, 1.5] } })
      // El aro invisible es el que recibe el dedo (44 px de objetivo); el círculo pintado es discreto.
      m.addLayer({ id: 'recorrido-toque', type: 'circle', source: 'recorrido', filter: ['==', '$type', 'Point'], paint: { 'circle-radius': 16, 'circle-color': '#000000', 'circle-opacity': 0 } })
      m.addLayer({ id: 'recorrido-puntos', type: 'circle', source: 'recorrido', filter: ['==', '$type', 'Point'], paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 14, 2.5, 17, 4.5, 19, 7], 'circle-color': ['coalesce', ['get', 'color'], '#FFB84D'], 'circle-stroke-color': '#FFFFFF', 'circle-stroke-width': 1, 'circle-opacity': 0.9 } })
      m.addSource('recorrido-activo', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      m.addLayer({ id: 'recorrido-activo', type: 'circle', source: 'recorrido-activo', paint: { 'circle-radius': 11, 'circle-color': '#FFB84D', 'circle-opacity': 0.35, 'circle-stroke-color': '#FFB84D', 'circle-stroke-width': 3 } })
      fetch(`${BASE}recorrido/rutas.json`).then((r) => r.json()).then((d) => {
        const feats = []
        for (const R of d.rutas || []) {
          const pts = R.puntos || []
          feats.push({ type: 'Feature', properties: { ruta: R.id, color: R.color }, geometry: { type: 'LineString', coordinates: pts.map((q) => [q.lng, q.lat]) } })
          for (const q of pts) feats.push({ type: 'Feature', properties: { id: q.id, ruta: R.id, color: R.color, nombre: q.nombre, orden: q.orden }, geometry: { type: 'Point', coordinates: [q.lng, q.lat] } })
        }
        m.getSource('recorrido')?.setData({ type: 'FeatureCollection', features: feats })
      }).catch(() => {})
      m.on('click', 'recorrido-toque', (ev) => {
        const f = ev.features?.[0]?.properties || {}
        if (f.id) setPop360({ ruta: f.ruta || '', punto: f.id })
      })
      m.on('mouseenter', 'recorrido-toque', () => { m.getCanvas().style.cursor = 'pointer' })
      m.on('mouseleave', 'recorrido-toque', () => { m.getCanvas().style.cursor = '' })

      m.on('click', (ev) => {
        setPanel(false) // chinche #15: tocar el mapa cierra el panel de Capas
        const ed = edRef.current
        if (ed.editandoPuntos && ed.rutaSel && ed.onAgregarPunto) { const [px, py] = geoAPct(geoRef.current, ev.lngLat.lng, ev.lngLat.lat); ed.onAgregarPunto(px, py); return }
        if (!monitoActivo.current) return
        const { lng, lat } = ev.lngLat
        setPunto({ lng: Number(lng.toFixed(6)), lat: Number(lat.toFixed(6)), heading: Math.round(m.getBearing()) })
        setMonito(false)
      })
      m.on('click', 'paradas', (ev) => {
        if (monitoActivo.current) return
        const id = ev.features?.[0]?.properties?.id
        if (id) onRecorrerRef.current?.(id)
      })
      m.on('mouseenter', 'paradas', () => { m.getCanvas().style.cursor = 'pointer' })
      m.on('mouseleave', 'paradas', () => { m.getCanvas().style.cursor = '' })
      m.on('click', 'espacios-3d', (ev) => {
        if (monitoActivo.current) return
        const id = ev.features?.[0]?.properties?.id
        if (id) onAbrir?.(id)
      })
      m.on('mouseenter', 'espacios-3d', () => { m.getCanvas().style.cursor = 'pointer' })
      m.on('mouseleave', 'espacios-3d', () => { m.getCanvas().style.cursor = '' })

      vestir(m, TEMAS[temaRef.current])
      acomodarPines()
      m.on('move', acomodarPines)
      let rafEsc = 0
      const medir = () => { cancelAnimationFrame(rafEsc); rafEsc = requestAnimationFrame(() => { setEscala(escalaDe(m)); setRumbo(m.getBearing()) }) }
      m.on('move', medir); medir()
      m.on('idle', acomodarPines)
      m.setPaintProperty('espacios-3d', 'fill-extrusion-opacity-transition', { duration: 900, delay: 0 })
      m.setPaintProperty('recorrido-puntos', 'circle-opacity-transition', { duration: 600, delay: 0 })
      m.setPaintProperty('recorrido-puntos', 'circle-stroke-opacity-transition', { duration: 600, delay: 0 })
      // Los 8 volúmenes de la lámina, en su sitio (three.js se carga aparte).
      window.__amalayaModelos = 0
      import('../CapaModelos3D.js').then(({ crearCapaModelos3D }) => {
        if (mapa.current !== m) return
        try {
          m.addLayer(crearCapaModelos3D({
            mercator: maplibregl.MercatorCoordinate, filas: filasModelos(BASE),
            onEstado: (e) => { if (e.estado === 'error') console.warn('modelo 3D', e.espacio_id, e.error); else window.__amalayaModelos = (window.__amalayaModelos || 0) + 1 },
          }))
          setModelosListos(true)
        } catch (err) { console.warn('modelos 3D', err) }
      }).catch((err) => console.warn('modelos 3D', err))
      setListo(true)
      // Nace en 2D: vista cenital del polígono sobre satélite.
      m.fitBounds(bboxDe(geoSheet), { padding: ENCUADRE, pitch: 0, bearing: 0, duration: 0 })
      if (etapaRef.current >= 4) { volar(m, 0); return }
      const r = relojesEntrada.current
      r.push(setTimeout(() => setEtapa(1), ENTRADA_MS.lamina))
      r.push(setTimeout(() => { setEtapa(2); trazarRutas(m) }, ENTRADA_MS.rutas))
      r.push(setTimeout(() => setEtapa(3), ENTRADA_MS.puntos))
      r.push(setTimeout(() => { setEtapa(4); volar(m, ENTRADA_MS.vueloDur) }, ENTRADA_MS.vuelo))
    }
    m.on('load', arrancar)
    m.on('styledata', arrancar)
    reloj = setTimeout(arrancar, 600)
    mapa.current = m
    return () => { clearTimeout(reloj); relojesEntrada.current.forEach(clearTimeout); cancelAnimationFrame(trazo.current); m.remove(); mapa.current = null }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // --- entrada por capas ------------------------------------------
  // Vuelo de dron: la cámara se inclina y gira hacia el 3D.
  function volar(m, duracion) {
    // Se mantiene el acercamiento del 2D (fitBounds con inclinación alejaría
    // demasiado la maqueta): solo se inclina, gira y se arrima un poco.
    // Encuadre = la lámina en su sitio (zonas Z01–Z10), no todo el plano.
    const cam = m.cameraForBounds(BBOX_LAMINA, { padding: { top: 90, bottom: 60, left: 60, right: 60 }, bearing: -18 }) || {}
    m.easeTo({
      center: cam.center || m.getCenter(), zoom: (cam.zoom ?? m.getZoom()) + 0.55, pitch: 55, bearing: -18,
      duration: duracion, easing: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    })
    setCara(0)
  }
  // Las rutas se trazan de principio a fin cortando sus coordenadas.
  function trazarRutas(m) {
    const completo = rutasGeoRef.current
    if (!completo) return
    const t0 = performance.now()
    const paso = (ahora) => {
      const f = Math.max(0, Math.min(1, (ahora - t0) / ENTRADA_MS.trazo))
      const parcial = {
        type: 'FeatureCollection',
        features: completo.features.map((ft) => {
          const c = ft.geometry.coordinates
          const pos = (c.length - 1) * f
          const i = Math.floor(pos)
          const resto = pos - i
          const sub = c.slice(0, i + 1)
          if (i < c.length - 1) sub.push([c[i][0] + (c[i + 1][0] - c[i][0]) * resto, c[i][1] + (c[i + 1][1] - c[i][1]) * resto])
          if (sub.length < 2) sub.push(sub[0])
          return { ...ft, geometry: { ...ft.geometry, coordinates: sub } }
        }),
      }
      m.getSource('rutas')?.setData(parcial)
      if (f < 1 && etapaRef.current < 4) trazo.current = requestAnimationFrame(paso)
      else m.getSource('rutas')?.setData(rutasGeoRef.current)
    }
    trazo.current = requestAnimationFrame(paso)
  }
  // Tocar durante la entrada la salta: todo a su estado final.
  function saltarEntrada() {
    const m = mapa.current
    if (etapaRef.current >= 4 || !m) return
    relojesEntrada.current.forEach(clearTimeout)
    relojesEntrada.current = []
    cancelAnimationFrame(trazo.current)
    m.getSource('rutas')?.setData(rutasGeoRef.current || { type: 'FeatureCollection', features: [] })
    m.stop()
    setEtapa(4)
    volar(m, 0)
  }
  // Guía de primera vez: al terminar la entrada, 3 globos que no vuelven.
  useEffect(() => { if (etapa >= 4 && listo && !leerGuiaVista()) setGuia(0) }, [etapa, listo])
  function siguienteGlobo() {
    if (guia >= GUIA.length - 1) { setGuia(-1); marcarGuiaVista() } else setGuia(guia + 1)
  }

  // Al abrir una ficha, el espacio se lleva a la parte visible (el panel tapa la derecha).
  useEffect(() => {
    const m = mapa.current
    if (!m || !listo || !enfocado) return
    const e = espacios.find((x) => x.id === enfocado)
    if (!e) return
    const zonas = zonasDeEspacio(e)
    const centro = zonas.length ? centroDeZonas(zonas) : pctAGeo(geoRef.current, num(e.pos_x, 40) + num(e.ancho, 18) / 2, num(e.pos_y, 40) + num(e.alto, 12) / 2)
    const ancho = m.getContainer().clientWidth
    const derecha = ancho >= 640 ? Math.min(460, ancho * 0.45) : 0
    const abajo = ancho < 640 ? m.getContainer().clientHeight * 0.45 : 0
    m.easeTo({ center: centro, padding: { top: 40, left: 40, right: derecha, bottom: abajo }, duration: 700 })
    return () => { m.easeTo({ padding: { top: 0, left: 0, right: 0, bottom: 0 }, duration: 500 }) }
  }, [enfocado, listo]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- datos → capas ----------------------------------------------
  useEffect(() => {
    const m = mapa.current
    if (!m || !listo) return
    m.getSource('espacios')?.setData(geojsonEspacios(espacios, datos?.Factores, geo))
    rutasGeoRef.current = geojsonRutas(rutas, geo)
    // Durante la entrada el trazo manda; antes de él las rutas no se ven.
    if (etapaRef.current !== 2) m.getSource('rutas')?.setData(rutasGeoRef.current)
    m.getSource('paradas')?.setData(geojsonParadas(paradas, geo))
    m.getSource('calco')?.setCoordinates(geo)

    // Pines con nombre (marcadores DOM, tocables)
    marcadores.current.forEach((mk) => mk.remove())
    marcadores.current = espacios.map((e) => {
      const x = num(e.pos_x, 40) + Math.max(num(e.ancho, 18), 3) / 2
      const y = num(e.pos_y, 40) + Math.max(num(e.alto, 12), 3) / 2
      const zonasE = zonasDeEspacio(e)
      const fijo = zonasE.length > 0 // ubicado por la lámina: no se arrastra
      const lugar = fijo ? centroDeZonas(zonasE) : pctAGeo(geo, x, y)
      const el = document.createElement('button')
      const tipo = NOMBRE_TIPO[String(e.tipo).toLowerCase()] || ''
      el.className = 'pin3d'
      el.style.setProperty('--c', COLOR_TIPO[claveTipo(e.tipo)] || COLOR_TIPO.otro)
      el.innerHTML = `<span class="pin3d-nombre">${escapar(e.nombre || '')}</span>${tipo ? `<span class="pin3d-tipo">${escapar(tipo)}</span>` : ''}${rayitasHtml(e.estado_desarrollo)}`
      el.addEventListener('click', (ev) => { ev.stopPropagation(); if (!edicion.modoEdicion) onAbrir?.(e.id) })
      if (edicion.modoEdicion && !fijo) el.classList.add('pin3d-editable')
      if (fijo) el.title = 'Ubicado según la lámina «Zona Núcleo» (hipótesis por validar)'
      const mk = new maplibregl.Marker({ element: el, anchor: 'bottom', offset: [0, -6], draggable: !!edicion.modoEdicion && !fijo }).setLngLat(lugar).addTo(m)
      if (edicion.modoEdicion && !fijo) {
        // «dragend» de MapLibre no siempre llega con un botón como marcador;
        // al soltar se lee la posición y solo se propone si de verdad cambió.
        let ultimo = mk.getLngLat()
        const soltar = () => {
          const ll = mk.getLngLat()
          if (ll.lng === ultimo.lng && ll.lat === ultimo.lat) return
          ultimo = ll
          const [px, py] = geoAPct(geo, ll.lng, ll.lat)
          edicion.onMoverEspacio?.(e.id, px, py)
        }
        mk.on('dragend', soltar)
        el.addEventListener('pointerup', () => setTimeout(soltar, 0))
      }
      return mk
    })
    acomodarPines()
  }, [listo, espacios, rutas, paradas, datos?.Factores, geo, onAbrir, edicion.modoEdicion])

  // --- el monito en el mapa ----------------------------------------
  useEffect(() => {
    const m = mapa.current
    monitoRef.current?.remove(); monitoRef.current = null
    if (!m || !listo || !punto) return
    const el = document.createElement('div')
    el.className = 'monito3d'
    el.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.5" r="2.5"></circle><path d="M12 7v6l-3 7"></path><path d="M12 13l3 7"></path><path d="M7 10l5-2 5 2"></path></svg>'
    const mk = new maplibregl.Marker({ element: el, anchor: 'bottom', draggable: true }).setLngLat([punto.lng, punto.lat]).addTo(m)
    mk.on('dragend', () => { const { lng, lat } = mk.getLngLat(); setPunto((p) => ({ ...p, lng: Number(lng.toFixed(6)), lat: Number(lat.toFixed(6)) })) })
    monitoRef.current = mk
    return () => { mk.remove() }
  }, [listo, punto?.lng, punto?.lat]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const m = mapa.current
    if (!m) return
    m.getCanvas().style.cursor = (monito || edicion.editandoPuntos) ? 'crosshair' : ''
  }, [monito, edicion.editandoPuntos])

  async function guardarParada(rutaId, nombre) {
    const [px, py] = geoAPct(geo, punto.lng, punto.lat)
    const enRuta = paradas.filter((p) => String(p.ruta_id) === String(rutaId))
    const fila = await crearFila('Paradas', {
      ruta_id: rutaId, nombre, foto_actual_id: '', foto_vision_id: '', elementos: '[]',
      notas: `Street View: ${urlStreetView(punto)}`, orden: String(enRuta.length + 1), pos_x: String(px), pos_y: String(py),
    })
    setPunto(null)
    onRecorrer?.(fila.id)
  }

  // --- el visor 360 avisa en qué punto va: lo marcamos en el mapa --------
  useEffect(() => {
    const alMensaje = (ev) => {
      const d = ev.data || {}
      if (d.tipo !== 'recorrido360' || !mapa.current) return
      mapa.current.getSource('recorrido-activo')?.setData({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [d.lng, d.lat] } }] })
      mapa.current.easeTo({ center: [d.lng, d.lat], duration: 600 })
    }
    window.addEventListener('message', alMensaje)
    return () => window.removeEventListener('message', alMensaje)
  }, [])
  useEffect(() => { if (!pop360 && mapa.current && listo) mapa.current.getSource('recorrido-activo')?.setData({ type: 'FeatureCollection', features: [] }) }, [pop360, listo])

  // --- render 360 «después» (Drive, privado) ------------------------
  // Cada punto del recorrido acepta un render: fila de Archivos con
  // tipo='render360' y espacio_id = id del punto. El visor pregunta por el
  // punto en que va; aquí se pide al servidor y se le pasa como data URL.
  const visor360 = useRef(null)
  const [puntoVisor, setPuntoVisor] = useState(null)
  const [subiendoRender, setSubiendoRender] = useState(false)
  const renderDe = (puntoId) => (datos?.Archivos || []).filter((a) => String(a.tipo) === 'render360' && String(a.espacio_id) === String(puntoId)).pop()
  useEffect(() => {
    const alMensaje = async (ev) => {
      const d = ev.data || {}
      if (d.tipo !== 'recorrido360' || !visor360.current || ev.source !== visor360.current.contentWindow) return
      setPuntoVisor(d.punto)
      const fila = renderDe(d.punto)
      const responder = (dataUrl, estado) => visor360.current?.contentWindow?.postMessage({ tipo: 'render360', punto: d.punto, dataUrl, estado }, '*')
      if (!fila || modo === 'demo') return responder(null, 'en-camino')
      try {
        const r = await verArchivo(fila.file_id)
        responder(`data:${r.mime || 'image/jpeg'};base64,${r.base64}`, 'listo')
      } catch {
        responder(null, 'error')
      }
    }
    window.addEventListener('message', alMensaje)
    return () => window.removeEventListener('message', alMensaje)
  }, [datos?.Archivos, modo]) // eslint-disable-line react-hooks/exhaustive-deps
  async function subirRender(file) {
    if (!file || !puntoVisor) return
    setSubiendoRender(true)
    try {
      await subirArchivo(puntoVisor, file, true, 'render360')
      // Recargar el visor para que pida el render recién subido.
      if (visor360.current) visor360.current.src = visor360.current.src
    } catch (e) {
      alert(e.message)
    } finally {
      setSubiendoRender(false)
    }
  }

  // --- visibilidad de capas ---------------------------------------
  useEffect(() => {
    const m = mapa.current
    if (!m || !listo) return
    const vis = (id, on) => m.getLayer(id) && m.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none')
    // La entrada por capas va encendiendo lo que el usuario tiene prendido.
    vis('satelite', capas.satelite)
    vis('amalaya-modelos-glb', capas.modelos)
    vis('ciudad-3d', capas.ciudad && etapa >= 1); vis('ciudad-borde', capas.ciudad && etapa >= 1)
    vis('espacios-3d', capas.espacios); vis('espacios-borde', capas.espacios && etapa >= 1)
    if (m.getLayer('espacios-3d')) m.setPaintProperty('espacios-3d', 'fill-extrusion-opacity', etapa >= 1 ? TEMAS[tema].espacioOp : 0)
    vis('rutas', capas.rutas && etapa >= 2); vis('rutas-halo', capas.rutas && etapa >= 2); vis('paradas', capas.rutas && etapa >= 3)
    vis('recorrido-puntos', capas.recorrido); vis('recorrido-linea', capas.recorrido && etapa >= 3); vis('recorrido-toque', capas.recorrido && etapa >= 3)
    if (m.getLayer('recorrido-puntos')) {
      m.setPaintProperty('recorrido-puntos', 'circle-opacity', etapa >= 3 ? 0.9 : 0)
      m.setPaintProperty('recorrido-puntos', 'circle-stroke-opacity', etapa >= 3 ? 1 : 0)
    }
    vis('calco', capas.calco || calibrando)
    const filtro = tiposOcultos.length ? ['!', ['in', ['get', 'tipo'], ['literal', tiposOcultos]]] : null
    if (m.getLayer('espacios-3d')) m.setFilter('espacios-3d', filtro)
    if (m.getLayer('espacios-borde')) m.setFilter('espacios-borde', filtro)
    marcadores.current.forEach((mk, i) => {
      const oculto = tiposOcultos.includes(claveTipo(espacios[i]?.tipo))
      mk.getElement().style.display = capas.espacios && etapa >= 4 && !oculto ? '' : 'none'
    })
    if (m.getLayer('calco')) m.setPaintProperty('calco', 'raster-opacity', calibrando ? 0.7 : opacidadCalco)
  }, [listo, capas, opacidadCalco, calibrando, etapa, tema, espacios, tiposOcultos, modelosListos])

  // --- inclinación -------------------------------------------------
  // Una sola maqueta, cuatro caras: el mapa gira 90° por clic y se mira en
  // isométrica; «Planta» lo pone de arriba. Los volúmenes muestran sus 4 lados.
  const [cara, setCara] = useState(0) // 0 N · 1 E · 2 S · 3 O
  function girar(delta) {
    const m = mapa.current
    if (!m) return
    const c = (cara + delta + 4) % 4
    setCara(c); setInclinado(true)
    m.easeTo({ bearing: c * 90, pitch: 58, duration: 700, easing: (t) => 1 - Math.pow(1 - t, 3) })
  }
  function alternarInclinacion() {
    const m = mapa.current
    if (!m) return
    const a = !inclinado
    setInclinado(a)
    m.easeTo({ pitch: a ? 58 : 0, bearing: a ? cara * 90 : 0, duration: 800 })
  }
  // Chinche #18: encuadra el polígono COMPLETO con margen, siempre igual (al abrir, al tocar ⌖
  // y al cerrar el 360 o Street View) — ya no un zoom fijo que lo cortaba.
  function centrar() {
    const m = mapa.current
    if (!m) return
    const bearing = inclinado ? cara * 90 : 0
    const cam = m.cameraForBounds(bboxDe(geo), { padding: ENCUADRE, bearing }) || {}
    m.easeTo({ center: cam.center || centroGeo(geo), zoom: cam.zoom ?? 16.4, pitch: inclinado ? 58 : 0, bearing, duration: reducido ? 0 : 800 })
  }
  const centrarRef = useRef(centrar)
  centrarRef.current = centrar
  const habiaVisor = useRef(false)
  useEffect(() => {
    const hay = !!(pop360 || punto)
    if (habiaVisor.current && !hay) centrarRef.current()
    habiaVisor.current = hay
  }, [pop360, punto])

  // --- calibración del plano (solo admin) ---------------------------
  useEffect(() => {
    const m = mapa.current
    esquinas.current.forEach((mk) => mk.remove())
    esquinas.current = []
    if (!m || !listo || !calibrando) return
    const actual = (geoTemp || geoSheet).map((p) => [...p])
    esquinas.current = actual.map((p, i) => {
      const el = document.createElement('div')
      el.className = 'esquina3d'
      el.textContent = ['1', '2', '3', '4'][i]
      const mk = new maplibregl.Marker({ element: el, draggable: true }).setLngLat(p).addTo(m)
      mk.on('drag', () => {
        const { lng, lat } = mk.getLngLat()
        actual[i] = [Number(lng.toFixed(6)), Number(lat.toFixed(6))]
        m.getSource('calco')?.setCoordinates(actual)
      })
      mk.on('dragend', () => setGeoTemp(actual.map((q) => [...q])))
      return mk
    })
    return () => { esquinas.current.forEach((mk) => mk.remove()); esquinas.current = [] }
  }, [listo, calibrando]) // eslint-disable-line react-hooks/exhaustive-deps

  async function guardarCalibracion() {
    const valor = JSON.stringify(geoTemp || geoSheet)
    const existe = (datos?.Config || []).some((c) => String(c.clave) === 'mapa_geo')
    if (existe) editarFila('Config', 'mapa_geo', { valor })
    else await crearFila('Config', { clave: 'mapa_geo', valor, notas: 'esquinas del plano [TL,TR,BR,BL] en [lng,lat] — se ajusta con "Calibrar plano"' })
    setCalibrando(false)
    setGeoTemp(null)
  }

  if (falla3d) {
    return (
      <div className="relative w-full h-full mapa-plan-b overflow-y-auto p-4" role="region" aria-label="Mapa sin 3D">
        <div ref={cont} className="hidden" />
        <div className="max-w-3xl mx-auto space-y-3">
          <p className="text-marfil font-medium">El mapa 3D no cargó · {falla3d}</p>
          <p className="text-arena text-sm">Puedes seguir trabajando: abre cualquier espacio para ver su ficha, sus documentos y descargarlos.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="ctrl-mapa" onClick={() => window.location.reload()}>Reintentar el 3D</button>
            <a className="ctrl-mapa" href={`${BASE}lamina-zona-nucleo.jpg`} target="_blank" rel="noreferrer" download>Lámina «Zona Núcleo» (JPG)</a>
            <a className="ctrl-mapa" href={`${BASE}mapa-poligono.jpg`} target="_blank" rel="noreferrer" download>Plano del polígono (JPG)</a>
          </div>
          <div className="lista-plan-b">
            <ListaEspacios espacios={espacios} busca={busca} setBusca={setBusca} onElegir={(e) => onAbrir?.(e.id)} onCerrar={() => setBusca('')} onNuevo={onNuevo} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full mapa3d tema-${tema}`} data-entrada={listo ? etapa : ''}>
      <div ref={cont} className="absolute inset-0" />

      {/* Tocar en cualquier parte durante la entrada la salta */}
      {listo && etapa < 4 && (
        <button
          type="button"
          className="absolute inset-0 z-30 flex items-end justify-center pb-6 cursor-pointer"
          onClick={saltarEntrada}
          aria-label="Saltar la entrada"
        >
          <span className="ctrl-mapa pointer-events-none">
            {['Satélite', 'Espacios', 'Rutas', 'Recorrido', ''][etapa]} · toca para saltar
          </span>
        </button>
      )}

      {/* Guía de primera vez */}
      {guia >= 0 && (
        <div className="absolute inset-x-0 bottom-6 z-30 flex justify-center px-4 pointer-events-none">
          <div className="globo-guia pointer-events-auto" role="dialog" aria-label="Guía del mapa">
            <p className="text-sm leading-relaxed">{GUIA[guia]}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-xs opacity-70">{guia + 1} de {GUIA.length}</span>
              <div className="flex-1" />
              <button className="text-xs underline opacity-80" onClick={() => { setGuia(-1); marcarGuiaVista() }}>Saltar guía</button>
              <button className="ctrl-mapa ctrl-on" onClick={siguienteGlobo}>{guia >= GUIA.length - 1 ? 'Entendido' : 'Siguiente'}</button>
            </div>
          </div>
        </div>
      )}

      {!listo && (
        <div className="absolute inset-0 grid place-items-center bg-superficie z-30 pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <span className="w-8 h-8 rounded-full border-2 border-linea border-t-oro animate-spin" />
            <span className="font-cartel uppercase tracking-[0.2em] text-xs text-arena">Levantando la maqueta…</span>
          </div>
        </div>
      )}

      {/* ── Carril superior izquierdo: capas ─────────────────────── */}
      <div className="absolute left-4 top-4 bottom-4 z-20 flex flex-col gap-2 items-start pointer-events-none">
        <button className={`ctrl-mapa pointer-events-auto ${panel ? 'ctrl-on' : ''}`} onClick={() => setPanel(!panel)}>
          <Layers size={15} /> Capas
        </button>
        {panel && (
          <div className="panel-mapa pointer-events-auto">
            <p className="panel-titulo">Fondo del mapa</p>
            <div className="seg">
              {[['lamina', 'Lámina'], ['noche', 'Noche']].map(([k, n]) => (
                <button key={k} className={tema === k ? 'on' : ''} onClick={() => setTema(k)}>{n}</button>
              ))}
            </div>
            <div className="panel-lista">
              {[
                ['modelos', 'Volúmenes de la lámina (3D)'],
                ['espacios', 'Espacios de Amalaya'],
                ['ciudad', 'Edificios de la ciudad'],
                ['rutas', 'Rutas peatonales'],
                ['recorrido', 'Puntos del recorrido 360'],
                ['satelite', 'Satélite'],
                ['calco', 'Calco del plano'],
                ['lamina', 'Lámina «Zona Núcleo» · referencia, sin escala'],
              ].map(([k, titulo]) => (
                <button key={k} type="button" role="switch" aria-checked={!!capas[k]} className="fila-capa" onClick={() => setCapas({ ...capas, [k]: !capas[k] })}>
                  <span className="sw" data-on={!!capas[k]}><i /></span>
                  <span className="txt">{titulo}</span>
                </button>
              ))}
              {capas.calco && (
                <div className="px-1 pt-1">
                  <label className="panel-nota" htmlFor="op-calco">Transparencia del calco · {Math.round((1 - opacidadCalco) * 100)}%</label>
                  <input id="op-calco" type="range" min="0.1" max="1" step="0.05" value={opacidadCalco} onChange={(e) => setOpacidadCalco(parseFloat(e.target.value))} className="w-full accent-[#C9A45C]" aria-label="Opacidad del calco" />
                </div>
              )}
            </div>
            <div className="panel-pie">
              <a className="ctrl-mapa w-full justify-center" href={`${BASE}modelo/serdan-garmendia.html`} target="_blank" rel="noreferrer">
                <Footprints size={13} /> Modelo 3D de la esquina <em className="badge" title="Volumen conceptual: alturas y norte sin validar">conceptual · por validar</em>
              </a>
              {puedeCalibrar && !calibrando && (<>
                <p className="panel-titulo">Herramientas · admin</p>
                <button className="ctrl-mapa w-full justify-center" onClick={() => { setCalibrando(true); setGeoTemp(null) }}>Calibrar plano</button>
              </>)}
            </div>
          </div>
        )}
      </div>

      {/* ── Carril superior derecho: espacios y monito ─────────────── */}
      <div className="absolute right-4 top-4 z-20 flex gap-2">
        <button className={`ctrl-mapa ${lista ? 'ctrl-on' : ''}`} onClick={() => setLista(!lista)} title="Lista y buscador de espacios">
          <List size={15} /> Espacios
        </button>
        <button
          className={`ctrl-mapa ${monito ? 'ctrl-on' : ''}`}
          onClick={() => { setMonito(!monito); if (monito) setPunto(null) }}
          title="Suelta al monito en una calle para ver el Street View"
        >
          <PersonStanding size={15} /> {monito ? 'Toca una calle…' : 'Monito'}
        </button>
      </div>

      {lista && (
        <ListaEspacios
          espacios={espacios}
          busca={busca}
          setBusca={setBusca}
          onElegir={(e) => {
            const x = num(e.pos_x, 40) + Math.max(num(e.ancho, 18), 3) / 2
            const y = num(e.pos_y, 40) + Math.max(num(e.alto, 12), 3) / 2
            mapa.current?.flyTo({ center: pctAGeo(geo, x, y), zoom: 17.2, duration: reducido ? 0 : 900 })
            setLista(false)
            onAbrir?.(e.id)
          }}
          onCerrar={() => setLista(false)}
          onNuevo={onNuevo ? () => { setLista(false); onNuevo() } : undefined}
        />
      )}

      {punto && (
        <PanelStreetView
          punto={punto}
          setPunto={setPunto}
          rutas={rutas}
          puedeEditar={puedeEditar}
          onGuardar={guardarParada}
          onCerrar={() => setPunto(null)}
        />
      )}

      {/* ── Carril inferior derecho: cámara ──────────────────────── */}
      <div className={`absolute right-4 bottom-12 z-20 flex-col items-end gap-2 ${pop360 ? 'hidden' : 'flex'}`}>
        <div className="grupo-ctrl">
          <button onClick={() => mapa.current?.zoomIn({ duration: 300 })} title="Acercar" aria-label="Acercar">+</button>
          <button onClick={() => mapa.current?.zoomOut({ duration: 300 })} title="Alejar" aria-label="Alejar">−</button>
        </div>
        <div className="grupo-ctrl">
          <button onClick={() => girar(-1)} title="Girar a la izquierda" aria-label="Girar a la izquierda">↺</button>
          <span className="cara">{['Norte', 'Este', 'Sur', 'Oeste'][cara]}</span>
          <button onClick={() => girar(1)} title="Girar a la derecha" aria-label="Girar a la derecha">↻</button>
        </div>
        <div className="grupo-ctrl">
          <button onClick={centrar} title="Centrar polígono" aria-label="Centrar polígono"><Crosshair size={14} /></button>
          <button onClick={alternarInclinacion} className="ancho">{inclinado ? 'Planta' : 'Maqueta'}</button>
        </div>
      </div>

      {/* ── Carril inferior izquierdo: cartela técnica (cede el sitio al panel) ── */}
      {!panel && (
        <div className={`absolute left-4 bottom-12 z-10 cartela-mapa ${cartelaAbierta ? '' : 'plegada'}`} aria-label="Cartela del plano">
          <button type="button" className="cartela-cab" aria-expanded={cartelaAbierta} onClick={() => { setCartelaAbierta(!cartelaAbierta); try { localStorage.setItem('amalaya_cartela', cartelaAbierta ? '0' : '1') } catch { /* sin almacenamiento */ } }}>
            <span className="cartela-tit">Amalaya <span className="cartela-flecha">{cartelaAbierta ? '▾' : '▸'}</span></span>
            {cartelaAbierta && <span className="cartela-sub">Polígono de actuación concertada · Hermosillo</span>}
          </button>
          {cartelaAbierta && <>
          <div className="cartela-cifras">
            <span><b>{Math.round(cartela.ancho)} × {Math.round(cartela.fondo)} m</b>plano</span>
            <span><b>{cartela.ha.toLocaleString('es-MX', { maximumFractionDigits: 1 })} ha</b>superficie</span>
            <span><b>{cartela.n}</b>espacios</span>
            {cartela.m2c > 0 && <span><b>{Math.round(cartela.m2c).toLocaleString('es-MX')} m²</b>construidos</span>}
          </div>
          <div className="cartela-avance" title="Las rayitas sobre cada volumen: cuántas etapas lleva ese espacio">
            <span className="avance5 cartela-muestra" data-nivel="3"><i className="lleno" /><i className="lleno" /><i className="lleno" /><i /><i /></span>
            <span className="cartela-etapas">
              {ETAPAS_DESARROLLO.map((k, i) => (
                <span key={k} className={cartela.conteo[k] ? '' : 'cero'}>{i + 1} {NOMBRE_ETAPA[k]} <b>{cartela.conteo[k]}</b></span>
              ))}
            </span>
          </div>
          </>}
          <div className="cartela-ley" aria-label="Leyenda: toca un tipo para prenderlo o apagarlo">
            {TIPOS.filter((t) => conteoTipos[t.clave]).map((t) => (
              <button
                key={t.clave}
                type="button"
                className={`ley-tipo ${tiposOcultos.includes(t.clave) ? 'apagado' : ''}`}
                aria-pressed={!tiposOcultos.includes(t.clave)}
                title={tiposOcultos.includes(t.clave) ? 'Mostrar' : 'Ocultar'}
                onClick={() => setTiposOcultos((o) => (o.includes(t.clave) ? o.filter((x) => x !== t.clave) : [...o, t.clave]))}
              >
                <i style={{ background: t.color }} />{t.nombre} <b>{conteoTipos[t.clave]}</b>
              </button>
            ))}
            <span><i className="linea" />ruta</span>
          </div>
          <div className="cartela-pie">
            {escala && (
              <span className="cartela-escala" aria-label={`Escala ${escala.etiqueta}`}>
                <span className="barra" style={{ width: escala.px }}><i /><i /></span>
                <span>{escala.etiqueta}</span>
              </span>
            )}
            <button
              type="button"
              className="cartela-norte"
              title="Norte · toca para orientar el plano al norte"
              aria-label="Orientar al norte"
              onClick={() => { setCara(0); mapa.current?.easeTo({ bearing: 0, duration: 600 }) }}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" style={{ transform: `rotate(${-rumbo}deg)` }} aria-hidden="true">
                <path d="M12 2 L17 20 L12 16 L7 20 Z" fill="currentColor" />
                <text x="12" y="13.5" textAnchor="middle" fontSize="6" fontWeight="700" fill="var(--cartela-fondo, #141010)">N</text>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Pop-up del recorrido 360 (misma pantalla; el mapa sigue al visor) */}
      {pop360 && (
        <div className="absolute inset-3 sm:inset-x-4 sm:bottom-4 sm:top-auto sm:h-[min(30rem,calc(100%-5rem))] z-30 bg-noche border border-oro rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-linea bg-superficie">
            <PersonStanding size={14} className="text-oro" />
            <span className="font-cartel uppercase tracking-wide text-xs">Recorrido 360 · antes / después</span>
            <span className="flex-1" />
            {puedeEditar && puntoVisor && (
              <label className={`text-xs text-arena hover:text-marfil cursor-pointer mr-3 ${subiendoRender ? 'opacity-60 pointer-events-none' : ''}`} title="Sube el render «después» de este punto (se guarda privado en Drive)">
                {subiendoRender ? 'Subiendo render…' : renderDe(puntoVisor) ? 'Cambiar render' : 'Subir render'}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => subirRender(e.target.files?.[0])} />
              </label>
            )}
            <a className="text-xs text-arena hover:text-marfil" href={`${BASE}recorrido/?r=${encodeURIComponent(pop360.ruta)}&p=${encodeURIComponent(pop360.punto)}`} target="_blank" rel="noreferrer">Pantalla completa</a>
            <button className="text-arena hover:text-marfil ml-2" onClick={() => setPop360(null)} aria-label="Cerrar"><X size={16} /></button>
          </div>
          <iframe ref={visor360} title="Recorrido 360" src={`${BASE}recorrido/?embed=1&r=${encodeURIComponent(pop360.ruta)}&p=${encodeURIComponent(pop360.punto)}`} className="flex-1 w-full border-0 bg-noche" allow="fullscreen" />
        </div>
      )}

      

      {/* Calibración */}
      {calibrando && (
        <div className="absolute inset-x-3 top-3 sm:left-auto sm:right-14 sm:w-80 bg-elevada border border-oro rounded-xl p-3 text-sm shadow-2xl">
          <p className="text-marfil font-medium">Calibrar el plano</p>
          <p className="text-terciario text-xs mt-1">Arrastra las esquinas 1-2-3-4 hasta que el calco coincida con las calles. Al guardar, espacios y rutas se recolocan solos.</p>
          <div className="flex gap-2 mt-3">
            <button className="boton-secundario flex-1 !py-1.5" onClick={() => { setCalibrando(false); setGeoTemp(null); mapa.current?.getSource('calco')?.setCoordinates(geoSheet) }}><span className="flex items-center justify-center gap-1"><X size={14} /> Cancelar</span></button>
            <button className="boton-primario flex-1 !py-1.5" onClick={guardarCalibracion}><span className="flex items-center justify-center gap-1"><Check size={14} /> Guardar</span></button>
          </div>
        </div>
      )}

      {/* Lámina de la presentación */}
      {capas.lamina && (
        <div className="absolute inset-3 sm:inset-auto sm:right-3 sm:top-14 sm:w-[34rem] bg-elevada border border-linea rounded-xl overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-linea">
            <span className="font-cartel uppercase tracking-wide text-sm">Zona Núcleo · lámina de la presentación</span>
            <span className="flex-1" />
            <button className="text-arena hover:text-marfil" onClick={() => setCapas({ ...capas, lamina: false })} aria-label="Cerrar"><X size={16} /></button>
          </div>
          <img src={`${BASE}lamina-zona-nucleo.jpg`} alt="Zona Núcleo — lámina de la presentación Foro Amalaya" className="w-full h-auto block" />
        </div>
      )}
    </div>
  )
}

// Street View de Google embebido sin llave (salida clásica "svembed") y la
// liga oficial para abrirlo a pantalla completa en Google Maps.
export function urlStreetView(p) {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${p.lat},${p.lng}&heading=${p.heading || 0}&pitch=0&fov=80`
}
function urlEmbed(p) {
  return `https://maps.google.com/maps?layer=c&cbll=${p.lat},${p.lng}&cbp=12,${p.heading || 0},0,0,0&output=svembed&hl=es`
}

function PanelStreetView({ punto, setPunto, rutas, puedeEditar, onGuardar, onCerrar }) {
  const [rutaId, setRutaId] = useState(rutas[0]?.id || '')
  const [nombre, setNombre] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)
  const girar = (d) => setPunto({ ...punto, heading: ((punto.heading || 0) + d + 360) % 360 })

  async function guardar(ev) {
    ev.preventDefault()
    if (!rutaId || !nombre.trim()) return
    setOcupado(true); setError(null)
    try { await onGuardar(rutaId, nombre.trim()) } catch (e) { setError(e.message); setOcupado(false) }
  }

  return (
    <div className="absolute inset-x-3 bottom-16 sm:inset-x-auto sm:right-3 sm:top-14 sm:bottom-auto sm:w-[30rem] bg-elevada border border-oro rounded-xl overflow-hidden shadow-2xl z-10">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-linea">
        <PersonStanding size={15} className="text-oro" />
        <span className="font-cartel uppercase tracking-wide text-sm">Street View · la calle hoy</span>
        <span className="flex-1" />
        <button className="text-arena hover:text-marfil" onClick={onCerrar} aria-label="Cerrar"><X size={16} /></button>
      </div>
      <div className="relative bg-noche" style={{ aspectRatio: '16 / 9' }}>
        <iframe
          key={`${punto.lat},${punto.lng},${punto.heading}`}
          title="Street View"
          src={urlEmbed(punto)}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-linea text-xs text-terciario">
        <button className="boton-secundario !px-2 !py-1" onClick={() => girar(-45)} title="Girar a la izquierda">↺ 45°</button>
        <button className="boton-secundario !px-2 !py-1" onClick={() => girar(45)} title="Girar a la derecha">↻ 45°</button>
        <span className="cifra">{punto.lat}, {punto.lng} · {punto.heading || 0}°</span>
        <span className="flex-1" />
        <a className="inline-flex items-center gap-1 text-oro hover:text-ambar" href={urlStreetView(punto)} target="_blank" rel="noreferrer">
          Abrir en Google Maps <ExternalLink size={12} />
        </a>
      </div>
      {puedeEditar ? (
        <form className="p-3 flex flex-col gap-2" onSubmit={guardar}>
          <p className="text-xs text-arena">Guarda esta esquina como parada: su foto de hoy y el render de la visión se suben en el recorrido.</p>
          <div className="flex gap-2">
            <select className="campo !py-2 text-sm flex-1" value={rutaId} onChange={(e) => setRutaId(e.target.value)} disabled={ocupado}>
              {rutas.length === 0 && <option value="">Primero crea una ruta</option>}
              {rutas.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
            <input className="campo !py-2 text-sm flex-1" placeholder="Nombre de la parada" value={nombre} onChange={(e) => setNombre(e.target.value)} disabled={ocupado} />
          </div>
          {error && <p className="text-ladrillo text-xs" role="alert">{error}</p>}
          <button type="submit" className="boton-primario !py-2 text-sm" disabled={ocupado || !rutaId || !nombre.trim()}>
            <span className="flex items-center justify-center gap-1.5"><Footprints size={15} /> {ocupado ? 'Guardando…' : 'Guardar como parada · antes / después'}</span>
          </button>
        </form>
      ) : (
        <p className="p-3 text-xs text-terciario">Un editor puede guardar esta esquina como parada de una ruta.</p>
      )}
    </div>
  )
}

function escapar(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

// Lista y buscador de espacios: panel al costado (en teléfono, hoja de abajo).
function ListaEspacios({ espacios, busca, setBusca, onElegir, onCerrar, onNuevo }) {
  const q = busca.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  const nombreTipo = (e) => NOMBRE_TIPO[String(e.tipo || 'otro').toLowerCase()] || e.tipo || 'Otro'
  const filtrados = espacios.filter((e) => !q || `${e.nombre} ${e.tipo} ${nombreTipo(e)} ${e.estado_desarrollo}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(q))
  // Chinche #16: sin texto se ven TODOS, agrupados por tipo (color, m² y estado).
  const grupos = {}
  for (const e of filtrados) (grupos[nombreTipo(e)] ||= []).push(e)
  return (
    <div className="lista-espacios z-30" role="dialog" aria-label="Espacios">
      <div className="flex items-center gap-2 mb-2">
        <Search size={14} className="opacity-70" />
        <input
          className="campo !py-1.5 text-sm flex-1"
          placeholder="Buscar espacio…"
          value={busca}
          onChange={(ev) => setBusca(ev.target.value)}
          autoFocus
        />
        <button className="p-1.5 opacity-80 hover:opacity-100" onClick={onCerrar} aria-label="Cerrar lista"><X size={16} /></button>
      </div>
      <ul className="space-y-1 overflow-y-auto max-h-[50vh] sm:max-h-[60vh]">
        {Object.keys(grupos).sort().map((g) => (
          <li key={g}>
            <p className="text-[11px] uppercase tracking-wide text-terciario px-2 pt-2 pb-1">{g} · {grupos[g].length}</p>
            <ul className="space-y-1">
              {grupos[g].map((e) => (
                <li key={e.id}>
                  <button className="fila-espacio" onClick={() => onElegir(e)}>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLOR_TIPO[String(e.tipo || 'otro').toLowerCase()] || COLOR_TIPO.otro }} />
                    <span className="flex-1 min-w-0 text-left">
                      <span className="block truncate text-sm">{e.nombre}</span>
                      <span className="block text-[11px] opacity-70">
                        {num(e.m2, 0) > 0 ? `${Math.round(num(e.m2, 0)).toLocaleString('es-MX')} m² · ` : ''}{e.estado_desarrollo || 'idea'}
                      </span>
                    </span>
                    <span dangerouslySetInnerHTML={{ __html: rayitasHtml(e.estado_desarrollo) }} />
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
        {espacios.length === 0 && (
          <li className="text-sm px-2 py-3 space-y-2">
            <p>Aún no hay espacios capturados.{onNuevo ? ' Crea el primero:' : ''}</p>
            {onNuevo && <button className="boton-primario !py-1.5 text-sm" onClick={onNuevo}>+ Espacio</button>}
            <p className="text-[11px] text-terciario">Los lotes de colores del mapa son el calco del plano «Zona Núcleo», no espacios capturados.</p>
          </li>
        )}
        {espacios.length > 0 && filtrados.length === 0 && <li className="text-sm opacity-70 px-2 py-3">Ningún espacio coincide con «{busca}».</li>}
      </ul>
    </div>
  )
}

// UX-07: ¿este navegador puede dibujar WebGL?
function hayWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}
