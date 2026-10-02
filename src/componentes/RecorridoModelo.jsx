import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Footprints, Images, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { BASE } from '../config.js'

const REFERENCIAS = {
  'OB-01': { nombre: 'Cubierta de estacionamiento', captura: 'XLuGJnj_XmtAuKd4eXeTDw', waypoint: 2 },
  'OB-02': { nombre: 'Fachada gris de arcos y rejas', captura: 'Apyr0uKeZr_XWmfLfLeBjQ', waypoint: 3 },
}
const REF_P03 = 'Apyr0uKeZr_XWmfLfLeBjQ'
const REF_P02 = 'XLuGJnj_XmtAuKd4eXeTDw'

export default function RecorridoModelo() {
  const [modo, setModo] = useState('inicio')
  const [estudio, setEstudio] = useState('OB-02')
  const [version, setVersion] = useState('actual')
  const [puntos, setPuntos] = useState([])
  const [indice, setIndice] = useState(2)
  const foto = useRef(null)
  const modelo = useRef(null)
  const inicio = useRef(null)
  const puntosRef = useRef(puntos)
  puntosRef.current = puntos

  useEffect(() => {
    let vigente = true
    fetch(`${BASE}recorrido/rutas.json`).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    }).then(data => {
      const ruta = data.rutas?.find(item => item.id === 'R-001')
      if (!vigente || !ruta?.puntos?.length) return
      setPuntos(ruta.puntos)
      const posicion = ruta.puntos.findIndex(p => p.id === REF_P03)
      if (posicion >= 0) setIndice(posicion)
    }).catch(() => {})
    const enfocado = event => {
      if (!REFERENCIAS[event.detail?.id]) return
      setEstudio(event.detail.id)
      const target = REFERENCIAS[event.detail.id].captura
      const index = puntosRef.current.findIndex(point => point.id === target)
      if (index >= 0) setIndice(index)
    }
    const cambiarEscenario = event => {
      if (event.detail?.version === 'actual' || event.detail?.version === 'amalaya') setVersion(event.detail.version)
    }
    window.addEventListener('amalaya:study-focused', enfocado)
    window.addEventListener('amalaya:scenario', cambiarEscenario)
    return () => { vigente = false; window.removeEventListener('amalaya:study-focused', enfocado); window.removeEventListener('amalaya:scenario', cambiarEscenario) }
  }, [])

  const enviarPunto = useCallback((punto) => {
    if (!punto) return
    modelo.current?.contentWindow?.postMessage({
      type: 'amalaya:navigate', lat: punto.lat, lng: punto.lng, heading: 185, version: 'actual',
    }, location.origin)
    foto.current?.contentWindow?.postMessage({ tipo: 'ir360', ruta: 'R-001', punto: punto.id }, location.origin)
  }, [])

  const enviarVersion = useCallback(() => {
    window.dispatchEvent(new CustomEvent('amalaya:scenario', { detail: { version } }))
    modelo.current?.contentWindow?.postMessage({ type: 'amalaya:version', version }, location.origin)
  }, [version])

  useEffect(() => { enviarPunto(puntos[indice]) }, [indice, puntos, enviarPunto])
  useEffect(() => { enviarVersion() }, [version, enviarVersion])

  useEffect(() => {
    const sync = event => {
      if (event.origin !== location.origin || event.source !== foto.current?.contentWindow) return
      const data = event.data
      if (data?.tipo !== 'recorrido360' || data.ruta !== 'R-001') return
      const index = puntosRef.current.findIndex(point => point.id === data.punto)
      if (index >= 0) setIndice(index)
    }
    window.addEventListener('message', sync)
    return () => window.removeEventListener('message', sync)
  }, [])

  const referencia = REFERENCIAS[estudio]
  const punto = puntos[indice]
  const waypoint = indice + 1
  const urlModelo = `${BASE}levantamiento/visor/?embed=1${modo === 'caminar' ? '&character=sonora' : ''}&route=R-001&waypoint=${referencia.waypoint}&view=street&movement=walk&clean=1&heading=185`
  const urlFoto = `${BASE}recorrido/?embed=1&r=R-001&p=${punto?.id || referencia.captura}`
  const enfocarMapa = id => {
    setEstudio(id)
    const ref = REFERENCIAS[id]
    const index = puntos.findIndex(item => item.id === ref.captura)
    if (index >= 0) setIndice(index)
    window.dispatchEvent(new CustomEvent('amalaya:focus-study', { detail: { id } }))
  }
  const seleccionar = id => {
    setEstudio(id)
    const index = puntos.findIndex(item => item.id === REFERENCIAS[id].captura)
    if (index >= 0) setIndice(index)
  }
  const mover = paso => setIndice(actual => Math.max(0, Math.min(puntos.length - 1, actual + paso)))
  const irVista = vista => {
    setModo(vista)
    requestAnimationFrame(() => inicio.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
  const ajustarRumbo360 = () => {
    const mandar = () => foto.current?.contentWindow?.postMessage({ tipo: 'version360', heading: 185 }, location.origin)
    mandar(); window.setTimeout(mandar, 500); window.setTimeout(mandar, 1300)
  }

  return (
    <section ref={inicio} className="mx-2 mb-8 scroll-mt-4 overflow-hidden rounded-2xl border border-linea bg-[#171614] text-marfil shadow-xl" aria-labelledby="titulo-recorrido-modelo">
      <div className="border-b border-linea bg-gradient-to-r from-[#262118] via-[#1b1a17] to-[#171614] px-4 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[.22em] text-oro"><span>AMALAYA · RECORRIDO DE OBREGÓN</span><span className="rounded-full border border-oro/40 px-2 py-1 tracking-wider">2 inmuebles integrados</span></div>
        <h2 id="titulo-recorrido-modelo" className="mt-2 font-cartel text-2xl font-normal uppercase tracking-wide sm:text-3xl">La calle, como se vive</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-arena">El mapa principal conserva sus rutas, fichas y puntos. En este mismo recorrido puedes ubicar la maqueta, caminarla con un vaquero sonorense y contrastar un punto 360 original con el modelo desde el mismo lugar.</p>
        <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Escenario visible en el modelo 3D">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[.15em] text-terciario">Escenario</span>
          {[["actual", 'Estado actual'], ['amalaya', 'Visión Amalaya · concepto']].map(([id, label]) => <button key={id} type="button" aria-pressed={version === id} onClick={() => setVersion(id)} className={`min-h-10 rounded-lg px-3 text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-oro ${version === id ? 'bg-oro text-noche' : 'border border-linea text-arena hover:border-oro/60 hover:text-marfil'}`}>{label}</button>)}
          {version === 'amalaya' && <span className="w-full text-[11px] text-terciario sm:w-auto">Estudio de sombra y estancia; conceptual, pendiente de aprobación.</span>}
        </div>
      </div>

      <div className="grid gap-3 border-b border-linea px-4 py-4 sm:grid-cols-2 sm:px-6">
        {Object.entries(REFERENCIAS).map(([id, item]) => (
          <article key={id} className={`rounded-xl border p-4 transition-colors ${estudio === id ? 'border-oro/70 bg-[#262118]' : 'border-linea bg-white/[.025]'}`}>
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-oro/40 bg-oro/10 text-sm font-bold text-oro">{id.slice(-2)}</span>
              <div className="min-w-0 flex-1"><div className="text-[10px] font-semibold uppercase tracking-[.16em] text-oro">{id} · R-001 / P{String(item.waypoint).padStart(2, '0')}</div><h3 className="mt-1 text-sm font-semibold text-marfil">{item.nombre}</h3><p className="mt-1 text-xs leading-relaxed text-terciario">{id === 'OB-02' ? 'Fachada gris con cinco vanos en arco, rejas y balaustrada.' : 'Cubierta abierta de estacionamiento y su cerramiento frontal.'}</p></div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => enfocarMapa(id)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-linea px-3 text-xs text-arena transition hover:border-oro hover:text-marfil focus-visible:outline focus-visible:outline-2 focus-visible:outline-oro"><MapPin size={15} /> Ver en el mapa</button>
              <button type="button" onClick={() => { seleccionar(id); irVista('caminar') }} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-oro px-3 text-xs font-semibold text-noche transition hover:bg-[#e8cb8b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-marfil"><Footprints size={15} /> Caminar</button>
              <button type="button" onClick={() => { seleccionar(id); irVista('comparar') }} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-oro/60 px-3 text-xs text-oro transition hover:bg-oro/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-marfil"><Images size={15} /> Comparar 360</button>
            </div>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-linea px-4 py-3 sm:px-6" role="tablist" aria-label="Modo del recorrido">
        {[
          ['inicio', Box, 'Maqueta en el mapa'],
          ['caminar', Footprints, 'Caminar en 3D'],
          ['comparar', Images, 'Comparar con 360'],
        ].map(([id, Icon, label]) => (
          <button key={id} type="button" role="tab" aria-selected={modo === id} onClick={() => setModo(id)} className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-oro ${modo === id ? 'bg-oro text-noche' : 'border border-linea text-arena hover:border-oro/60 hover:text-marfil'}`}><Icon size={15} />{label}</button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="punto-ruta-amalaya" className="hidden text-xs text-terciario sm:block">Punto 360</label>
          <select id="punto-ruta-amalaya" aria-label="Elegir punto del recorrido 360" disabled={!puntos.length} value={puntos[indice]?.id || ''} onChange={event => { const index = puntos.findIndex(item => item.id === event.target.value); if (index >= 0) setIndice(index) }} className="min-h-10 max-w-[210px] rounded-lg border border-linea bg-[#211f1b] px-2 text-xs text-marfil focus-visible:outline focus-visible:outline-2 focus-visible:outline-oro">
            {puntos.length ? puntos.map((item, index) => <option key={item.id} value={item.id}>R-001 · P{String(index + 1).padStart(2, '0')}</option>) : <option>Cargando puntos…</option>}
          </select>
        </div>
      </div>

      {modo === 'inicio' && (
        <div className="grid gap-4 p-4 sm:grid-cols-[1.4fr_1fr] sm:p-6">
          <div><div className="text-[10px] font-semibold uppercase tracking-[.18em] text-oro">UNA SOLA CIUDAD · TRES FORMAS DE EXPLORAR</div><p className="mt-2 max-w-2xl text-sm leading-relaxed text-arena">Los marcadores 01 y 02 en el mapa saltan a estos modelos. La ruta peatonal original permanece activa arriba; el selector de punto de cámara enlaza el 360 existente con la posición del modelo.</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => enfocarMapa(estudio)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-oro/60 px-3 text-xs text-oro hover:bg-oro/10"><MapPin size={15} /> Enfocar {estudio} en el mapa</button><button type="button" onClick={() => irVista('caminar')} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-oro px-3 text-xs font-semibold text-noche hover:bg-[#e8cb8b]"><Footprints size={15} /> Entrar al recorrido</button></div></div>
          <div className="rounded-xl border border-linea bg-black/20 p-4"><div className="text-xs font-semibold text-marfil">Estado del levantamiento</div><ul className="mt-3 grid gap-2 text-xs text-arena"><li><span className="mr-2 text-oro">●</span>OB-01 · cubierta, referencia P01/P02</li><li><span className="mr-2 text-oro">●</span>OB-02 · arcos y rejas, referencia P03/P04</li><li><span className="mr-2 text-terciario">○</span>Medidas, profundidad y detalle ornamental estimados</li></ul><p className="mt-3 border-t border-linea pt-3 text-[11px] leading-relaxed text-terciario">No hay polígono OSM verificado para OB-02. La fecha de captura de estas panorámicas no se confirmó en esta ficha. La fotografía vive en el visor original; nunca se usa como textura.</p></div>
        </div>
      )}

      {modo === 'caminar' && (
        <div className="p-3 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div><div className="text-[10px] font-semibold uppercase tracking-[.17em] text-oro">RECORRIDO CAMINABLE · {estudio} · P{String(waypoint).padStart(2, '0')}</div><p className="mt-1 text-xs text-terciario">WASD o flechas para avanzar · clic + ratón para mirar (en móvil, arrastra) · alterna entre POV y cámara detrás del vaquero.</p></div>
            <div className="flex gap-2"><button type="button" onClick={() => mover(-1)} disabled={indice <= 0} aria-label="Punto 360 anterior" className="grid h-10 w-10 place-items-center rounded-lg border border-linea text-marfil hover:border-oro disabled:opacity-40"><ChevronLeft size={18}/></button><button type="button" onClick={() => mover(1)} disabled={indice >= puntos.length - 1} aria-label="Punto 360 siguiente" className="grid h-10 w-10 place-items-center rounded-lg border border-linea text-marfil hover:border-oro disabled:opacity-40"><ChevronRight size={18}/></button></div>
          </div>
          <iframe ref={modelo} title="Recorrido 3D caminable de Amalaya con vaquero sonorense" src={urlModelo} className="h-[min(72vh,720px)] min-h-[470px] w-full rounded-xl border border-linea bg-[#b7d0de]" allow="fullscreen; pointer-lock" loading="lazy" onLoad={() => { enviarPunto(puntos[indice]); enviarVersion() }} />
          <p className="mt-3 text-xs text-terciario">El modelo y el personaje son representación 3D original. Los vanos y la ornamentación se infieren desde P03/P04; no equivalen a una medición constructiva.</p>
        </div>
      )}

      {modo === 'comparar' && (
        <div className="p-3 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><div className="text-[10px] font-semibold uppercase tracking-[.17em] text-oro">MISMO PUNTO · MISMO RUMBO · {punto ? `P${String(waypoint).padStart(2, '0')}` : 'CARGANDO'}</div><p className="mt-1 text-xs text-terciario">Izquierda: panorama del visor de Amalaya. Derecha: render en vivo del modelo georreferenciado, rumbo de consulta 185°.</p></div><div className="flex gap-2"><button type="button" onClick={() => mover(-1)} disabled={indice <= 0} aria-label="Punto 360 anterior" className="grid h-10 w-10 place-items-center rounded-lg border border-linea text-marfil hover:border-oro disabled:opacity-40"><ChevronLeft size={18}/></button><button type="button" onClick={() => mover(1)} disabled={indice >= puntos.length - 1} aria-label="Punto 360 siguiente" className="grid h-10 w-10 place-items-center rounded-lg border border-linea text-marfil hover:border-oro disabled:opacity-40"><ChevronRight size={18}/></button></div></div>
          <div className="grid gap-3 lg:grid-cols-2">
            <figure className="overflow-hidden rounded-xl border border-linea bg-black/30"><figcaption className="flex min-h-10 items-center justify-between gap-2 px-3 text-xs text-marfil"><span>REFERENCIA FOTOGRÁFICA · 360 ORIGINAL</span><span className="text-terciario">{punto ? `P${String(waypoint).padStart(2, '0')}` : '—'}</span></figcaption><iframe ref={foto} title="Panorámica original del recorrido R-001" src={urlFoto} className="h-[min(54vh,520px)] min-h-[360px] w-full bg-[#171614]" allow="fullscreen" loading="lazy" onLoad={ajustarRumbo360}/></figure>
            <figure className="overflow-hidden rounded-xl border border-linea bg-black/30"><figcaption className="flex min-h-10 items-center justify-between gap-2 px-3 text-xs text-marfil"><span>{version === 'amalaya' ? 'VISIÓN AMALAYA · CONCEPTO' : 'ESTADO ACTUAL · MODELO 3D'}</span><span className="text-terciario">{punto ? `R-001 · P${String(waypoint).padStart(2, '0')}` : '—'}</span></figcaption><iframe ref={modelo} title="Modelo tridimensional desde el punto del panorama" src={urlModelo} className="h-[min(54vh,520px)] min-h-[360px] w-full bg-[#b7d0de]" allow="fullscreen; pointer-lock" loading="lazy" onLoad={() => { enviarPunto(puntos[indice]); enviarVersion() }}/></figure>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-terciario">La imagen abre el recurso original del recorrido y conserva su contexto. La fecha exacta no está verificada aquí. Es una comparación visual orientativa; la profundidad y las cotas del modelo OB-02 siguen estimadas.</p>
        </div>
      )}
    </section>
  )
}
