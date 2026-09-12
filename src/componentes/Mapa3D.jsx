import { useEffect, useRef, useState, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Layers, Box, Map as MapIcon, Image as ImageIcon, Crosshair, Check, X, RotateCw, PersonStanding, ExternalLink, Footprints } from 'lucide-react'
import { usarDatos } from '../datos.jsx'
import { BASE } from '../config.js'
import { leerRuta } from './Rutas.jsx'
import { NOMBRE_TIPO } from './Glifos.jsx'

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

// Colores de la lámina "Zona Núcleo" (presentación Foro Amalaya).
const COLOR_TIPO = {
  venue: '#D98FA3',
  museo: '#8FB8D9',
  escuela: '#E9D36A',
  estudio: '#E9D36A',
  comercial: '#E8923A',
  mixto: '#E9D36A',
  estacionamiento: '#8A8F99',
  departamento: '#E9D36A',
  restaurante: '#E8923A',
  otro: '#C9A45C',
}
const ALTURA_TIPO = { venue: 16, estacionamiento: 14, comercial: 10, mixto: 12, museo: 9, escuela: 8, estudio: 8, departamento: 9, restaurante: 5, otro: 6 }

const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d }

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

function centroGeo(geo) {
  return [(geo[0][0] + geo[2][0]) / 2, (geo[0][1] + geo[2][1]) / 2]
}

function alturaEspacio(e, factores) {
  const propios = (factores || []).filter((f) => String(f.espacio_id) === String(e.id))
  const pisos = propios.find((f) => /piso/i.test(f.etiqueta || ''))
  const n = pisos ? num(pisos.valor, 0) : 0
  if (n > 0) return n * 3.6
  return ALTURA_TIPO[String(e.tipo).toLowerCase()] || 6
}

function geojsonEspacios(espacios, factores, geo) {
  return {
    type: 'FeatureCollection',
    features: espacios.map((e) => {
      const x = num(e.pos_x, 40), y = num(e.pos_y, 40)
      const w = Math.max(num(e.ancho, 18), 3), h = Math.max(num(e.alto, 12), 3)
      const anillo = [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y]].map(([px, py]) => pctAGeo(geo, px, py))
      const tipo = String(e.tipo || 'otro').toLowerCase()
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

const CAPAS_DEF = { satelite: false, ciudad: true, espacios: true, rutas: true, calco: false, lamina: false }

export default function Mapa3D({ espacios, rutas, paradas, onAbrir, onRecorrer }) {
  const { datos, sesion, modo, editarFila, crearFila } = usarDatos()
  const puedeEditar = modo !== 'demo' && ['admin', 'editor'].includes(sesion?.rol)
  const geoSheet = useMemo(() => leerGeo(datos?.Config), [datos?.Config])
  const puedeCalibrar = modo !== 'demo' && sesion?.rol === 'admin'

  const cont = useRef(null)
  const mapa = useRef(null)
  const onRecorrerRef = useRef(onRecorrer)
  useEffect(() => { onRecorrerRef.current = onRecorrer }, [onRecorrer])
  const marcadores = useRef([])
  const esquinas = useRef([])
  const [listo, setListo] = useState(false)
  const [capas, setCapas] = useState(CAPAS_DEF)
  const [opacidadCalco, setOpacidadCalco] = useState(0.55)
  const [inclinado, setInclinado] = useState(true)
  const [panel, setPanel] = useState(false)
  const [calibrando, setCalibrando] = useState(false)
  const [geoTemp, setGeoTemp] = useState(null)
  const geo = geoTemp || geoSheet
  // El monito: soltarlo en una calle abre el Street View de ese punto.
  const [monito, setMonito] = useState(false)          // esperando el clic
  const [punto, setPunto] = useState(null)              // {lng, lat, heading}
  const monitoRef = useRef(null)
  const monitoActivo = useRef(false)
  useEffect(() => { monitoActivo.current = monito }, [monito])

  // --- crear el mapa una sola vez ------------------------------
  useEffect(() => {
    if (!cont.current || mapa.current) return
    const centro = centroGeo(geoSheet)
    const m = new maplibregl.Map({
      container: cont.current,
      style: ESTILO_CIUDAD,
      center: centro,
      zoom: 15.2,
      pitch: 0,
      bearing: 0,
      antialias: true,
      attributionControl: { compact: true },
    })
    m.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')
    window.__amalayaMapa = m
    m.on('error', (e) => console.warn('mapa3d', e?.error?.message || e))
    m.on('load', () => {
      console.info('mapa3d load', m.getStyle().layers.length, Object.keys(m.getStyle().sources))
      // La cartografía base se viste de "desierto de noche": tierra
      // cálida oscura, calles en oro apagado, agua noche, letras arena.
      for (const capa of m.getStyle().layers) {
        try {
          if (capa.type === 'background') m.setPaintProperty(capa.id, 'background-color', '#151110')
          else if (capa.type === 'fill') m.setPaintProperty(capa.id, 'fill-color', /water|ocean|river|lake/i.test(capa.id) ? '#10141A' : (/park|grass|wood|green|garden/i.test(capa.id) ? '#1B1A13' : '#1C1613'))
          else if (capa.type === 'line') m.setPaintProperty(capa.id, 'line-color', /water|river|boundary|admin|rail|ferry/i.test(capa.id) ? '#26201A' : '#4A3D30')
          else if (capa.type === 'symbol') {
            m.setPaintProperty(capa.id, 'text-color', '#B7A890')
            m.setPaintProperty(capa.id, 'text-halo-color', '#141010')
            m.setPaintProperty(capa.id, 'text-halo-width', 1.2)
          }
        } catch { /* alguna capa no admite la propiedad: se deja como viene */ }
      }
      // Satélite (apagado por defecto)
      m.addSource('satelite', { type: 'raster', tiles: [SATELITE], tileSize: 256, attribution: 'Esri World Imagery' })
      const primeraEtiqueta = m.getStyle().layers.find((l) => l.type === 'symbol')?.id
      m.addLayer({ id: 'satelite', type: 'raster', source: 'satelite', layout: { visibility: 'none' }, paint: { 'raster-opacity': 0.9, 'raster-saturation': -0.35, 'raster-brightness-max': 0.85 } }, primeraEtiqueta)

      // Edificios de la ciudad en 3D (los que trae el mapa base)
      m.addLayer({
        id: 'ciudad-3d', type: 'fill-extrusion', source: 'openmaptiles', 'source-layer': 'building', minzoom: 14,
        paint: {
          'fill-extrusion-color': '#2C231C',
          'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 6],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
          'fill-extrusion-opacity': 0.85,
        },
      }, primeraEtiqueta)

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
          'fill-extrusion-opacity': 0.92,
          'fill-extrusion-vertical-gradient': true,
        },
      })
      m.addLayer({ id: 'espacios-borde', type: 'line', source: 'espacios', paint: { 'line-color': '#F2EAD9', 'line-width': 1.2, 'line-opacity': 0.55 } })

      // Rutas peatonales
      m.addSource('rutas', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      m.addLayer({ id: 'rutas-halo', type: 'line', source: 'rutas', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#141010', 'line-width': ['+', ['get', 'grosor'], 4], 'line-opacity': 0.5 } })
      m.addLayer({ id: 'rutas', type: 'line', source: 'rutas', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['get', 'color'], 'line-width': ['get', 'grosor'], 'line-opacity': ['get', 'opacidad'] } })
      m.addSource('paradas', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      m.addLayer({ id: 'paradas', type: 'circle', source: 'paradas', paint: { 'circle-radius': 5, 'circle-color': '#141010', 'circle-stroke-color': '#C9A45C', 'circle-stroke-width': 2 } })

      m.on('click', (ev) => {
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

      setListo(true)
      // La única entrada cinematográfica: de arriba a la vista inclinada.
      m.easeTo({ pitch: 58, bearing: -18, zoom: 16.4, duration: 1800, easing: (t) => 1 - Math.pow(1 - t, 3) })
    })
    mapa.current = m
    return () => { m.remove(); mapa.current = null }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // --- datos → capas ----------------------------------------------
  useEffect(() => {
    const m = mapa.current
    if (!m || !listo) return
    m.getSource('espacios')?.setData(geojsonEspacios(espacios, datos?.Factores, geo))
    m.getSource('rutas')?.setData(geojsonRutas(rutas, geo))
    m.getSource('paradas')?.setData(geojsonParadas(paradas, geo))
    m.getSource('calco')?.setCoordinates(geo)

    // Pines con nombre (marcadores DOM, tocables)
    marcadores.current.forEach((mk) => mk.remove())
    marcadores.current = espacios.map((e) => {
      const x = num(e.pos_x, 40) + Math.max(num(e.ancho, 18), 3) / 2
      const y = num(e.pos_y, 40) + Math.max(num(e.alto, 12), 3) / 2
      const el = document.createElement('button')
      const tipo = NOMBRE_TIPO[String(e.tipo).toLowerCase()] || ''
      el.className = 'pin3d'
      el.innerHTML = `<span class="pin3d-nombre">${escapar(e.nombre || '')}</span>${tipo ? `<span class="pin3d-tipo">${escapar(tipo)}</span>` : ''}`
      el.addEventListener('click', (ev) => { ev.stopPropagation(); onAbrir?.(e.id) })
      return new maplibregl.Marker({ element: el, anchor: 'bottom', offset: [0, -6] }).setLngLat(pctAGeo(geo, x, y)).addTo(m)
    })
  }, [listo, espacios, rutas, paradas, datos?.Factores, geo, onAbrir])

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
    m.getCanvas().style.cursor = monito ? 'crosshair' : ''
  }, [monito])

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

  // --- visibilidad de capas ---------------------------------------
  useEffect(() => {
    const m = mapa.current
    if (!m || !listo) return
    const vis = (id, on) => m.getLayer(id) && m.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none')
    vis('satelite', capas.satelite)
    vis('ciudad-3d', capas.ciudad)
    vis('espacios-3d', capas.espacios); vis('espacios-borde', capas.espacios)
    vis('rutas', capas.rutas); vis('rutas-halo', capas.rutas); vis('paradas', capas.rutas)
    vis('calco', capas.calco || calibrando)
    marcadores.current.forEach((mk) => { mk.getElement().style.display = capas.espacios ? '' : 'none' })
    if (m.getLayer('calco')) m.setPaintProperty('calco', 'raster-opacity', calibrando ? 0.7 : opacidadCalco)
  }, [listo, capas, opacidadCalco, calibrando])

  // --- inclinación -------------------------------------------------
  function alternarInclinacion() {
    const m = mapa.current
    if (!m) return
    const a = !inclinado
    setInclinado(a)
    m.easeTo({ pitch: a ? 58 : 0, bearing: a ? -18 : 0, duration: 800 })
  }
  function centrar() {
    mapa.current?.easeTo({ center: centroGeo(geo), zoom: 16.4, pitch: inclinado ? 58 : 0, bearing: inclinado ? -18 : 0, duration: 800 })
  }

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

  return (
    <div className="relative w-full h-full">
      <div ref={cont} className="absolute inset-0" />

      {/* Barra de capas */}
      <div className="absolute left-3 top-3 flex flex-col gap-2 items-start">
        <button className="boton-secundario !px-3 !py-2 text-sm bg-noche/80" onClick={() => setPanel(!panel)}>
          <span className="flex items-center gap-1.5"><Layers size={14} /> Capas</span>
        </button>
        {panel && (
          <div className="bg-elevada border border-linea rounded-xl p-3 w-60 text-sm space-y-2 shadow-2xl">
            {[
              ['satelite', 'Satélite', <ImageIcon size={13} key="s" />],
              ['ciudad', 'Edificios de la ciudad', <Box size={13} key="c" />],
              ['espacios', 'Espacios de Amalaya', <Box size={13} key="e" />],
              ['rutas', 'Rutas peatonales', <MapIcon size={13} key="r" />],
              ['calco', 'Calco del plano', <Crosshair size={13} key="k" />],
            ].map(([k, titulo, icono]) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer text-arena hover:text-marfil">
                <input type="checkbox" className="accent-[#C9A45C]" checked={!!capas[k]} onChange={() => setCapas({ ...capas, [k]: !capas[k] })} />
                <span className="text-oro">{icono}</span>{titulo}
              </label>
            ))}
            {capas.calco && (
              <input type="range" min="0.1" max="1" step="0.05" value={opacidadCalco} onChange={(e) => setOpacidadCalco(parseFloat(e.target.value))} className="w-full accent-[#C9A45C]" aria-label="Opacidad del calco" />
            )}
            <label className="flex items-center gap-2 cursor-pointer text-arena hover:text-marfil border-t border-linea pt-2">
              <input type="checkbox" className="accent-[#C9A45C]" checked={capas.lamina} onChange={() => setCapas({ ...capas, lamina: !capas.lamina })} />
              <span className="text-oro"><ImageIcon size={13} /></span>Lámina «Zona Núcleo»
            </label>
            {puedeCalibrar && !calibrando && (
              <button className="boton-secundario w-full !py-1.5 text-xs" onClick={() => { setCalibrando(true); setGeoTemp(null) }}>
                Calibrar plano
              </button>
            )}
          </div>
        )}
      </div>

      {/* El monito (Street View) */}
      <div className="absolute right-3 top-3 sm:right-14 flex gap-2">
        <button
          className={`${monito ? 'boton-primario' : 'boton-secundario'} !px-3 !py-2 text-sm bg-noche/80`}
          onClick={() => { setMonito(!monito); if (monito) setPunto(null) }}
          title="Suelta al monito en una calle para ver el Street View"
        >
          <span className="flex items-center gap-1.5"><PersonStanding size={15} /> {monito ? 'Toca una calle…' : 'Monito'}</span>
        </button>
      </div>

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

      {/* Cámara */}
      <div className="absolute right-3 bottom-3 flex gap-2">
        <button className="boton-secundario !px-3 !py-2 text-sm bg-noche/80" onClick={centrar} title="Centrar en el polígono"><Crosshair size={14} /></button>
        <button className="boton-secundario !px-3 !py-2 text-sm bg-noche/80" onClick={alternarInclinacion}>
          <span className="flex items-center gap-1.5"><RotateCw size={14} /> {inclinado ? 'Ver en planta' : 'Ver en 3D'}</span>
        </button>
      </div>

      {/* Leyenda con los colores de la lámina */}
      <div className="absolute left-3 bottom-3 bg-noche/85 border border-linea rounded-xl px-3 py-2 text-[11px] text-arena leading-relaxed pointer-events-none flex flex-wrap gap-x-3 gap-y-1 max-w-[70%]">
        {[['venue', 'Foro'], ['comercial', 'Comercial'], ['mixto', 'Mixto'], ['estacionamiento', 'Estacionamiento']].map(([t, n]) => (
          <span key={t} className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block" style={{ background: COLOR_TIPO[t] }} />{n}</span>
        ))}
        <span className="inline-flex items-center gap-1.5"><span className="w-5 h-0.5 bg-oro inline-block rounded" /> ruta</span>
      </div>

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
