import {VERSION_CAMINATA} from '../caminata-version.js'
import {usarEstadoCaminata} from '../usarEstadoCaminata.js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, ChevronLeft, ChevronRight, Footprints, Images, Map, Maximize2, Upload } from 'lucide-react'
import { BASE } from '../config.js'
import { usarDatos } from '../datos.jsx'
import { puedeEditarRol } from '../roles.js'
import { buscarPunto, mensajeRecorrido, rumboConsulta, urlPanorama, vecinoRecorrido } from '../recorrido-state.js'
import { registrarContextoChinche, registrarRepintadoChinche, describirVisorRecorrido } from '../chinche-contexto.js'

const REFERENCIAS = {
  'OB-01': { routeId: 'R-001', pointId: 'XLuGJnj_XmtAuKd4eXeTDw' },
  'OB-02': { routeId: 'R-001', pointId: 'Apyr0uKeZr_XWmfLfLeBjQ' },
}
const PUNTO_INICIAL = REFERENCIAS['OB-02'].pointId
const URL_CAMINATA = `${BASE}levantamiento/visor/?embed=1&character=sonora&route=R-001&waypoint=3&view=street&movement=walk&clean=1&heading=185&v=${VERSION_CAMINATA}`
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
  const { datos, sesion, modo: modoDatos, verArchivo, subirArchivo } = usarDatos()
  const puedeEditar = modoDatos !== 'demo' && puedeEditarRol(sesion?.rol)
  const [modo, setModo] = useState('modelo')
  const [vistaMapa, setVistaMapa] = useState('modelo')
  const [version, setVersion] = useState('actual')
  const [rutas, setRutas] = useState([])
  const [rutaId, setRutaId] = useState('R-001')
  const [indice, setIndice] = useState(2)
  const caminata = useRef(null)
  const [intentoCaminata,setIntentoCaminata] = useState(0)
  const estadoCaminata = usarEstadoCaminata(caminata,modo === 'caminar',intentoCaminata)
  const streetView = useRef(null)
  const streetViewReady = useRef(false)
  const destinoStreetView = useRef('')
  const rutasRef = useRef(rutas)
  const puntoInicializado = useRef(false)
  const estado = useRef(null)
  const [subiendoRender, setSubiendoRender] = useState(false)
  // El visor 360 nace ya en el punto elegido (no en el inicial para luego saltar).
  const [urlStreetView, setUrlStreetView] = useState(URL_STREET_VIEW)
  rutasRef.current = rutas

  const ruta = rutas.find(item => item.id === rutaId) || rutas[0]
  const punto = ruta?.puntos?.[indice]
  const rumbo = rumboConsulta(ruta, indice)
  estado.current = { modo, version, ruta, punto, rumbo, vistaMapa, indice }

  // La Chinche dentro de los visores: qué recorrido y punto se estaba viendo.
  useEffect(() => registrarContextoChinche(({ el }) => {
    if (!el || (el !== caminata.current && el !== streetView.current)) return null
    return describirVisorRecorrido(estado.current)
  }), [])
  // La caminata solo dibuja cuando algo cambia: repetirle el escenario que ya
  // tiene la hace pintar un cuadro, y en ese cuadro la Chinche toma su foto.
  useEffect(() => registrarRepintadoChinche(marco => {
    if (!marco || marco !== caminata.current) return
    marco.contentWindow?.postMessage({ type: 'amalaya:version', version: estado.current?.version || 'actual' }, location.origin)
  }), [])

  // --- render 360 «después» (Drive, privado) ------------------------
  // Cada punto acepta un render: fila de Archivos con tipo='render360' y
  // espacio_id = id del punto. Cuando el visor llega a un punto se le pasa
  // como data URL, únicamente a su ventana y a este mismo origen.
  const renderDe = puntoId => (datos?.Archivos || [])
    .filter(a => String(a.tipo) === 'render360' && String(a.espacio_id) === String(puntoId)).pop()
  const render = punto ? renderDe(punto.id) : null
  const renderRef = useRef(null)
  renderRef.current = { renderDe, verArchivo, demo: modoDatos === 'demo' }
  const mandarRender = useCallback(async puntoId => {
    const { renderDe: buscar, verArchivo: ver, demo } = renderRef.current
    const fila = buscar(puntoId)
    const responder = (dataUrl, situacion) => streetView.current?.contentWindow?.postMessage(
      { tipo: 'render360', punto: puntoId, dataUrl, estado: situacion }, location.origin)
    if (!fila || demo) return responder(null, 'en-camino')
    try {
      const r = await ver(fila.file_id)
      responder(`data:${r.mime || 'image/jpeg'};base64,${r.base64}`, 'listo')
    } catch {
      responder(null, 'error')
    }
  }, [])
  // Un render recién subido (o cambiado) llega al visor sin recargarlo.
  useEffect(() => {
    if (modo === 'streetview' && streetViewReady.current && punto && render) mandarRender(punto.id)
  }, [render?.file_id]) // eslint-disable-line react-hooks/exhaustive-deps
  async function subirRender(file) {
    if (!file || !punto) return
    setSubiendoRender(true)
    try { await subirArchivo(punto.id, file, true, 'render360') }
    catch (error) { alert(error.message) }
    finally { setSubiendoRender(false) }
  }

  const sincronizarVisor = useCallback(({versionOnly=false} = {}) => {
    const s = estado.current
    if (!s?.punto) return
    if (s.modo === 'caminar') {
      caminata.current?.contentWindow?.postMessage({
        type: versionOnly ? 'amalaya:version' : 'amalaya:navigate', lat: s.punto.lat, lng: s.punto.lng,
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
    // Un círculo del recorrido en el mapa abre su Street View directamente.
    const abrirPunto = event => {
      const destino = buscarPunto(rutasRef.current, event.detail?.ruta, event.detail?.punto)
      if (!destino) return
      setRutaId(destino.routeId)
      setIndice(destino.index)
      if (estado.current?.modo !== 'streetview') {
        const rutaDestino = rutasRef.current.find(item => item.id === destino.routeId)
        streetViewReady.current = false
        destinoStreetView.current = ''
        setUrlStreetView(urlPanorama(BASE, rutaDestino, rutaDestino.puntos[destino.index]))
        setModo('streetview')
        window.dispatchEvent(new CustomEvent('amalaya:recorrido-mode', { detail: { mode: 'streetview' } }))
      }
    }
    window.addEventListener('amalaya:study-focused', enfocarEdificio)
    window.addEventListener('amalaya:scenario', sincronizarEscenario)
    window.addEventListener('amalaya:map-view-changed', sincronizarVistaMapa)
    window.addEventListener('amalaya:recorrido-abrir', abrirPunto)
    return () => {
      window.removeEventListener('amalaya:study-focused', enfocarEdificio)
      window.removeEventListener('amalaya:scenario', sincronizarEscenario)
      window.removeEventListener('amalaya:map-view-changed', sincronizarVistaMapa)
      window.removeEventListener('amalaya:recorrido-abrir', abrirPunto)
    }
  }, [])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('amalaya:scenario', { detail: { version } }))
    sincronizarVisor({versionOnly:true})
  }, [version, sincronizarVisor])

  useEffect(() => {
    if (!punto) return
    // El mapa marca cuál de sus círculos es el punto elegido.
    window.dispatchEvent(new CustomEvent('amalaya:recorrido-punto', { detail: { id: punto.id, lat: punto.lat, lng: punto.lng } }))
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
        event.data?.type === 'amalaya:scene-ready') {
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
      mandarRender(event.data.punto)
      if (actual?.ruta?.id === siguiente.routeId && actual?.punto?.id === event.data.punto) return
      setRutaId(siguiente.routeId)
      setIndice(siguiente.index)
    }
    window.addEventListener('message', recibir)
    return () => window.removeEventListener('message', recibir)
  }, [sincronizarVisor, mandarRender])

  const cambiarModo = modoNuevo => {
    // Volver a tocar la vista en la que ya estás no desmonta su visor: si aquí
    // se olvidara que ya está listo, dejaría de obedecer anterior/siguiente.
    if (modoNuevo === modo && (modoNuevo === 'caminar' || modoNuevo === 'streetview')) return
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
    if (modoNuevo === 'streetview') setUrlStreetView(urlPanorama(BASE, ruta, punto))
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
  const anterior = vecinoRecorrido(ruta, indice, -1)
  const siguiente = vecinoRecorrido(ruta, indice, 1)

  // En Street View las flechas del teclado pasan de punto (si no se está
  // escribiendo ni eligiendo en una lista).
  useEffect(() => {
    if (modo !== 'streetview') return
    const tecla = event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      if (event.target?.closest?.('input, textarea, select, [contenteditable], .chn-velo')) return
      if (event.key === 'ArrowRight') avanzar(1)
      else if (event.key === 'ArrowLeft') avanzar(-1)
      else return
      event.preventDefault()
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [modo, ruta?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="recorrido-unico" aria-label="Controles del mapa y recorrido Amalaya">
      {modo === 'caminar' && (
        <iframe
          ref={caminata}
          key={`caminata-amalaya-${intentoCaminata}`}
          title="Caminar por Amalaya en 3D con vaquero sonorense"
          src={URL_CAMINATA}
          className="recorrido-unico__visor"
          allow="fullscreen; pointer-lock"
        />
      )}
      {modo === 'caminar' && ['loading','timeout'].includes(estadoCaminata) && <div className="recorrido-carga" role={estadoCaminata==='timeout'?'alert':'status'}>
        <p>{estadoCaminata==='timeout'?'El recorrido tardó demasiado en responder.':'Preparando tu recorrido…'}</p>
        {estadoCaminata==='timeout' && <button onClick={()=>setIntentoCaminata(n=>n+1)}>Reintentar</button>}
      </div>}
      {modo === 'streetview' && (
        <iframe
          ref={streetView}
          key="street-view-amalaya"
          title="Street View 360 del punto seleccionado"
          src={urlStreetView}
          className="recorrido-unico__visor"
          allow="fullscreen"
        />
      )}
      {modo === 'streetview' && punto && (
        <div className="recorrido-unico__pasos" role="group" aria-label="Pasar de punto en Street View">
          <button type="button" className="recorrido-unico__paso" disabled={!anterior} onClick={() => avanzar(-1)}
            title="Punto anterior (también con la flecha ← del teclado)"
            aria-label={anterior ? `Ir al punto anterior, ${anterior.etiqueta}` : 'No hay punto anterior'}>
            <ChevronLeft size={22} aria-hidden="true" />
            <span><b>Anterior</b><small>{anterior ? anterior.etiqueta : 'inicio'}</small></span>
          </button>
          <button type="button" className="recorrido-unico__paso" disabled={!siguiente} onClick={() => avanzar(1)}
            title="Punto siguiente (también con la flecha → del teclado)"
            aria-label={siguiente ? `Ir al punto siguiente, ${siguiente.etiqueta}` : 'No hay punto siguiente'}>
            <span><b>Siguiente</b><small>{siguiente ? siguiente.etiqueta : 'fin'}</small></span>
            <ChevronRight size={22} aria-hidden="true" />
          </button>
        </div>
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
        {modo === 'streetview' && punto && (
          <div className="recorrido-unico__extras">
            {puedeEditar && (
              <label className={subiendoRender ? 'ocupado' : ''} title="Sube el render «después» de este punto (se guarda privado en Drive)">
                <Upload size={13} aria-hidden="true" />
                <span>{subiendoRender ? 'Subiendo render…' : render ? 'Cambiar render' : 'Subir render'}</span>
                <input type="file" accept="image/*" disabled={subiendoRender} onChange={event => { subirRender(event.target.files?.[0]); event.target.value = '' }} />
              </label>
            )}
            <a href={`${BASE}recorrido/?r=${encodeURIComponent(ruta.id)}&p=${encodeURIComponent(punto.id)}`} target="_blank" rel="noreferrer"
              aria-label="Pantalla completa"
              title="Abre este punto en el visor completo: girar solo, marcar y copiar acciones">
              <Maximize2 size={13} aria-hidden="true" /><span>Pantalla completa</span>
            </a>
          </div>
        )}
      </div>
      {(modo === 'caminar' || modo === 'streetview') && (
        <div className={`recorrido-unico__ayuda recorrido-unico__ayuda--${modo}`} role="status">
          {modo === 'caminar' ? 'WASD / flechas · Shift para correr · clic y ratón para mirar' : `Punto ${indice + 1} de ${ruta?.puntos?.length || 1} · arrastra para mirar`}
        </div>
      )}
    </div>
  )
}
