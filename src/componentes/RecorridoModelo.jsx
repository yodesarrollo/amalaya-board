import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, ChevronLeft, ChevronRight, Footprints, Images, Map } from 'lucide-react'
import { BASE } from '../config.js'
import { mensajeRecorrido, rumboConsulta } from '../recorrido-state.js'

const REFERENCIAS = {
  'OB-01': { routeId: 'R-001', pointId: 'XLuGJnj_XmtAuKd4eXeTDw' },
  'OB-02': { routeId: 'R-001', pointId: 'Apyr0uKeZr_XWmfLfLeBjQ' },
}
const PUNTO_INICIAL = REFERENCIAS['OB-02'].pointId
const URL_CAMINATA = `${BASE}levantamiento/visor/?embed=1&character=sonora&route=R-001&waypoint=3&view=street&movement=walk&clean=1&heading=185`
const URL_STREET_VIEW = `${BASE}recorrido/?embed=1&portal=1&r=R-001&p=${PUNTO_INICIAL}`

const MODOS = [
  ['planta', Map, 'Planta'],
  ['modelo', Box, '3D'],
  ['caminar', Footprints, 'Caminar'],
  ['streetview', Images, 'Street View'],
]

const focoCoordenada = (point, heading, view) => {
  if (!point) return
  window.dispatchEvent(new CustomEvent('amalaya:focus-coordinate', {
    detail: { lat: point.lat, lng: point.lng, heading, view },
  }))
}

export default function RecorridoModelo() {
  const [modo, setModo] = useState('modelo')
  const [vistaMapa, setVistaMapa] = useState('modelo')
  const [version, setVersion] = useState('actual')
  const [rutas, setRutas] = useState([])
  const [rutaId, setRutaId] = useState('R-001')
  const [indice, setIndice] = useState(2)
  const caminata = useRef(null)
  const streetView = useRef(null)
  const streetViewReady = useRef(false)
  const destinoStreetView = useRef('')
  const rutasRef = useRef(rutas)
  const puntoInicializado = useRef(false)
  const estado = useRef(null)
  rutasRef.current = rutas

  const ruta = rutas.find(item => item.id === rutaId) || rutas[0]
  const punto = ruta?.puntos?.[indice]
  const rumbo = rumboConsulta(ruta, indice)
  estado.current = { modo, version, ruta, punto, rumbo, vistaMapa }

  const sincronizarVisor = useCallback(() => {
    const s = estado.current
    if (!s?.punto) return
    if (s.modo === 'caminar') {
      caminata.current?.contentWindow?.postMessage({
        type: 'amalaya:navigate', lat: s.punto.lat, lng: s.punto.lng,
        heading: s.rumbo, version: s.version,
      }, location.origin)
    }
    if (s.modo === 'streetview') {
      if (!streetViewReady.current) return
      destinoStreetView.current = s.punto.id
      streetView.current?.contentWindow?.postMessage({
        tipo: 'ir360', ruta: s.ruta.id, punto: s.punto.id,
      }, location.origin)
      streetView.current?.contentWindow?.postMessage({
        tipo: 'version360', version: s.version, heading: s.rumbo,
      }, location.origin)
    }
  }, [])

  useEffect(() => {
    const abort = new AbortController()
    fetch(`${BASE}recorrido/rutas.json`, { signal: abort.signal })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then(data => {
        const disponibles = data.rutas || []
        setRutas(disponibles)
        const principal = disponibles.find(item => item.id === 'R-001') || disponibles[0]
        const inicial = principal?.puntos?.findIndex(item => item.id === PUNTO_INICIAL) ?? -1
        if (principal) {
          setRutaId(principal.id)
          setIndice(inicial >= 0 ? inicial : 0)
        }
      })
      .catch(error => { if (error.name !== 'AbortError') console.warn('No se pudo abrir el índice de recorridos 360.', error) })
    return () => abort.abort()
  }, [])

  useEffect(() => {
    const enfocarEdificio = event => {
      const referencia = REFERENCIAS[event.detail?.id]
      if (!referencia) return
      const seleccionado = rutasRef.current.find(item => item.id === referencia.routeId)
      const posicion = seleccionado?.puntos?.findIndex(item => item.id === referencia.pointId) ?? -1
      if (posicion < 0) return
      setRutaId(referencia.routeId)
      setIndice(posicion)
      setModo('modelo')
      setVistaMapa('modelo')
    }
    const sincronizarEscenario = event => {
      if (event.detail?.version === 'actual' || event.detail?.version === 'amalaya') setVersion(event.detail.version)
    }
    const sincronizarVistaMapa = event => {
      if (event.detail?.view === 'planta' || event.detail?.view === 'modelo') {
        setModo(event.detail.view)
        setVistaMapa(event.detail.view)
      }
    }
    window.addEventListener('amalaya:study-focused', enfocarEdificio)
    window.addEventListener('amalaya:scenario', sincronizarEscenario)
    window.addEventListener('amalaya:map-view-changed', sincronizarVistaMapa)
    return () => {
      window.removeEventListener('amalaya:study-focused', enfocarEdificio)
      window.removeEventListener('amalaya:scenario', sincronizarEscenario)
      window.removeEventListener('amalaya:map-view-changed', sincronizarVistaMapa)
    }
  }, [])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('amalaya:scenario', { detail: { version } }))
    sincronizarVisor()
  }, [version, sincronizarVisor])

  useEffect(() => {
    if (!punto) return
    sincronizarVisor()
    // Al cargar el índice se conserva la vista general. Los cambios que hace
    // el usuario sí llevan el mapa al punto seleccionado.
    if (!puntoInicializado.current) { puntoInicializado.current = true; return }
    focoCoordenada(punto, rumbo, estado.current?.vistaMapa || 'modelo')
  }, [rutaId, punto?.id, rumbo, sincronizarVisor])

  useEffect(() => {
    const recibir = event => {
      if (event.origin !== location.origin) return
      if (event.source === caminata.current?.contentWindow &&
        ['amalaya:ready', 'amalaya:character-ready'].includes(event.data?.type)) {
        sincronizarVisor()
        return
      }
      if (event.source !== streetView.current?.contentWindow) return
      if (event.data?.tipo === 'amalaya:360-ready') {
        streetViewReady.current = true
        sincronizarVisor()
        return
      }
      if (!streetViewReady.current) return
      const siguiente = mensajeRecorrido(event.data, rutasRef.current)
      if (!siguiente) return
      const actual = estado.current
      if (destinoStreetView.current && event.data.punto !== destinoStreetView.current) {
        sincronizarVisor()
        return
      }
      destinoStreetView.current = ''
      if (actual?.ruta?.id === siguiente.routeId && actual?.punto?.id === event.data.punto) return
      setRutaId(siguiente.routeId)
      setIndice(siguiente.index)
    }
    window.addEventListener('message', recibir)
    return () => window.removeEventListener('message', recibir)
  }, [sincronizarVisor])

  const cambiarModo = modoNuevo => {
    streetViewReady.current = false
    destinoStreetView.current = ''
    if (modoNuevo === 'planta' || modoNuevo === 'modelo') {
      setModo(modoNuevo)
      setVistaMapa(modoNuevo)
      window.dispatchEvent(new CustomEvent('amalaya:map-view', {
        detail: { view: modoNuevo, heading: rumbo, ...(punto ? { lat: punto.lat, lng: punto.lng } : {}) },
      }))
      window.dispatchEvent(new CustomEvent('amalaya:recorrido-mode', { detail: { mode: modoNuevo } }))
      return
    }
    if (!punto) return
    setModo(modoNuevo)
    window.dispatchEvent(new CustomEvent('amalaya:recorrido-mode', { detail: { mode: modoNuevo } }))
    focoCoordenada(punto, rumbo, vistaMapa)
  }

  const seleccionarRuta = event => {
    const nuevaRuta = rutas.find(item => item.id === event.target.value)
    if (!nuevaRuta) return
    setRutaId(nuevaRuta.id)
    setIndice(0)
  }
  const avanzar = delta => setIndice(actual => Math.max(0, Math.min((ruta?.puntos?.length || 1) - 1, actual + delta)))

  return (
    <div className="recorrido-unico" aria-label="Controles del mapa y recorrido Amalaya">
      {modo === 'caminar' && (
        <iframe
          ref={caminata}
          key="caminata-amalaya"
          title="Caminar por Amalaya en 3D con vaquero sonorense"
          src={URL_CAMINATA}
          className="recorrido-unico__visor"
          allow="fullscreen; pointer-lock"
          onLoad={sincronizarVisor}
        />
      )}
      {modo === 'streetview' && (
        <iframe
          ref={streetView}
          key="street-view-amalaya"
          title="Street View 360 del punto seleccionado"
          src={URL_STREET_VIEW}
          className="recorrido-unico__visor"
          allow="fullscreen"
        />
      )}

      <div className="recorrido-unico__modos" role="group" aria-label="Vista del territorio">
        {MODOS.map(([id, Icon, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={modo === id}
            disabled={!punto && (id === 'caminar' || id === 'streetview')}
            className={modo === id ? 'activo' : ''}
            onClick={() => cambiarModo(id)}
          >
            <Icon size={15} aria-hidden="true" /><span>{label}</span>
          </button>
        ))}
      </div>

      <div className="recorrido-unico__punto">
        <button type="button" aria-label="Punto anterior" disabled={!punto || indice <= 0} onClick={() => avanzar(-1)}><ChevronLeft size={17} /></button>
        <label className="recorrido-unico__ruta">
          <span>Recorrido</span>
          <select aria-label="Elegir recorrido" value={ruta?.id || ''} onChange={seleccionarRuta} disabled={!rutas.length}>
            {rutas.length ? rutas.map(item => <option key={item.id} value={item.id}>{item.id} · {item.nombre}</option>) : <option>Cargando rutas…</option>}
          </select>
        </label>
        <label className="recorrido-unico__seleccion">
          <span>Punto Street View</span>
          <select aria-label="Elegir punto Street View" value={punto?.id || ''} disabled={!ruta?.puntos?.length} onChange={event => {
            const posicion = ruta.puntos.findIndex(item => item.id === event.target.value)
            if (posicion >= 0) setIndice(posicion)
          }}>
            {ruta?.puntos?.map((item, posicion) => <option key={item.id} value={item.id}>P{String(posicion + 1).padStart(2, '0')} · {item.nombre || `Punto ${posicion + 1}`}</option>)}
          </select>
        </label>
        <button type="button" aria-label="Punto siguiente" disabled={!punto || indice >= ruta.puntos.length - 1} onClick={() => avanzar(1)}><ChevronRight size={17} /></button>
        <div className="recorrido-unico__version" role="group" aria-label="Escenario del modelo">
          {[["actual", 'Actual'], ['amalaya', 'Amalaya']].map(([id, label]) => (
            <button key={id} type="button" aria-pressed={version === id} className={version === id ? 'activo' : ''} onClick={() => setVersion(id)}>{label}</button>
          ))}
        </div>
      </div>
      {(modo === 'caminar' || modo === 'streetview') && (
        <div className="recorrido-unico__ayuda" role="status">
          {modo === 'caminar' ? 'WASD / flechas · Shift para correr · clic y ratón para mirar' : 'Arrastra para mirar · elige cualquier punto del recorrido abajo'}
        </div>
      )}
    </div>
  )
}
