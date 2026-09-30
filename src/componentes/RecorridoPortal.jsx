import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { ArrowUpRight, ChevronLeft, ChevronRight, Maximize2, Map, PersonStanding, Scan, X, Compass } from 'lucide-react'
import { rumboRuta, mensajeRecorrido, urlPanorama, PLAN } from '../recorrido-state'
import '../recorrido.css'
const BASE = import.meta.env.BASE_URL
const HOME = [-110.9542, 29.07615]

export default function RecorridoPortal() {
  const [routes, setRoutes] = useState([]), [observations, setObservations] = useState([])
  const [routeId, setRouteId] = useState('R-001'), [index, setIndex] = useState(4)
  const [observationId, setObservationId] = useState('')
  const [mode, setMode] = useState('map'), [version, setVersion] = useState('actual')
  const [status, setStatus] = useState('Preparando el territorio…'), [error, setError] = useState('')
  const [plan, setPlan] = useState(false), [mapReady, setMapReady] = useState(false)
  const root = useRef(), container = useRef(), map = useRef(), layer = useRef(), frame = useRef(), latest = useRef()
  const route = routes.find(r => r.id === routeId) || routes[0]
  const obs = observations.find(p => p.id === observationId)
  const point = obs || route?.puntos[index]
  const heading = obs?.headingDegrees ?? (route ? rumboRuta(route.puntos,index) : 0)
  latest.current = { routes, point, heading, version, mode }
  const send = (versionOnly = false) => {
    const s = latest.current
    if (!s.point || !frame.current) return
    if (s.mode === 'walk') frame.current.contentWindow?.postMessage({ type:versionOnly?'amalaya:version':'amalaya:navigate',lat:s.point.lat,lng:s.point.lng,heading:s.heading,version:s.version }, location.origin)
    else frame.current.contentWindow?.postMessage({ tipo:'version360',version:s.version,...(versionOnly?{}:{heading:s.heading}) }, location.origin)
  }
  useEffect(() => {
    const abort = new AbortController()
    Promise.all([
      fetch(`${BASE}recorrido/rutas.json`,{signal:abort.signal}).then(r=>{if(!r.ok)throw Error('No se pudieron abrir las rutas.');return r.json()}),
      fetch(`${BASE}levantamiento/data/amalaya-observations.json`,{signal:abort.signal}).then(r=>r.ok?r.json():{points:[]}),
    ]).then(([r,o])=>{ setRoutes(r.rutas); setObservations(o.points || []) }).catch(e=>{if(e.name!=='AbortError')setError(e.message)})
    return ()=>abort.abort()
  },[])
  useEffect(() => {
    setMapReady(false)
    if(mode!=='map')return
    let alive = true, world, api, m
    const abort = new AbortController()
    const base = `${BASE}levantamiento/`
    ;(async()=>{
      try {
        api = await import(/* @vite-ignore */ `${base}world.js`)
        world = await api.createWorld(base, abort.signal)
        if (!alive) { api.disposeWorld(world); return }
        // Bundled OSM vector context keeps the map usable without a remote tile service.
        const response = await fetch(`${base}data/osm-context.json`,{signal:abort.signal})
        if(!response.ok) throw Error('No se pudo abrir el mapa de contexto.')
        const osm = await response.json()
        const features = osm.elements.filter(e=>e.tags?.highway && e.geometry?.length>1).map(e=>({type:'Feature',properties:{name:e.tags.name||''},geometry:{type:'LineString',coordinates:e.geometry.map(p=>[p.lon,p.lat])}}))
        m = new maplibregl.Map({container:container.current,center:HOME,zoom:17.5,pitch:58,bearing:-24,maxZoom:21,minZoom:15,
          maxBounds:[[-110.961,29.072],[-110.948,29.082]],antialias:true,
          style:{version:8,sources:{city:{type:'geojson',data:{type:'FeatureCollection',features},attribution:'© OpenStreetMap contributors'}},layers:[
            {id:'ground',type:'background',paint:{'background-color':'#ddd8ca'}},
            {id:'streets-border',type:'line',source:'city',paint:{'line-color':'#bdb6a8','line-width':['interpolate',['linear'],['zoom'],15,3,19,25]}},
            {id:'streets',type:'line',source:'city',paint:{'line-color':'#eeebe3','line-width':['interpolate',['linear'],['zoom'],15,1.5,19,20]}},
          ]}})
        map.current = m
        m.addControl(new maplibregl.NavigationControl({visualizePitch:true}),'bottom-right')
        m.addControl(new maplibregl.ScaleControl(),'bottom-left')
        m.on('style.load',()=>{
          if(!alive)return
          const l = api.createMapLayer({mercator:maplibregl.MercatorCoordinate,world})
          layer.current=l; m.addLayer(l); l.setScenario(latest.current.version)
          setMapReady(true);setStatus('Levantamiento conectado')
        })
        m.on('error',()=>{ if(alive)setError('No se pudo dibujar el mapa. Puedes abrir los puntos 360.') })
      } catch(e) { if(alive && e.name!=='AbortError'){ setError('El levantamiento local no está disponible. Los recorridos 360 siguen accesibles.');setStatus('3D no disponible') } }
    })()
    return ()=>{ alive=false;abort.abort();if(m)m.remove();else if(world)api.disposeWorld(world);map.current=null;layer.current=null }
  },[mode])
  useEffect(()=>{
    if(!mapReady || !map.current || !routes.length)return
    const m=map.current
    const markers=[]
    routes.forEach(r=>r.puntos.forEach((p,i)=>{
      const el=document.createElement('button');el.className='tour-pin';el.title=`${r.nombre} · ${i+1}`;el.setAttribute('aria-label',el.title)
      el.textContent=String(i+1); el.style.setProperty('--route',r.color)
      el.onclick=()=>{setRouteId(r.id);setIndex(i);setObservationId('')}
      markers.push(new maplibregl.Marker({element:el}).setLngLat([p.lng,p.lat]).addTo(m))
    }))
    return ()=>markers.forEach(m=>m.remove())
  },[mapReady,routes])
  useEffect(()=>{
    if(point && map.current && mapReady)map.current.easeTo({center:[point.lng,point.lat],duration:500})
    send()
  },[point?.id,heading,mode,mapReady])
  useEffect(()=>{layer.current?.setScenario(version);map.current?.triggerRepaint();send(true)},[version])
  useEffect(()=>{
    const listener=e=>{
      if(e.origin!==location.origin || e.source!==frame.current?.contentWindow)return
      if(e.data?.type==='amalaya:ready'){send();return}
      const p=mensajeRecorrido(e.data,latest.current.routes)
      if(p){setRouteId(p.routeId);setIndex(p.index);setObservationId('');if(e.data.punto===latest.current.point?.id)send()}
    }
    addEventListener('message',listener);return ()=>removeEventListener('message',listener)
  },[])
  useEffect(()=>{ if(mode==='map')requestAnimationFrame(()=>map.current?.resize()) },[mode])
  useEffect(()=>{
    if(!plan)return
    const previous=document.activeElement
    const key=e=>{
      if(e.key==='Escape'){setPlan(false);return}
      if(e.key!=='Tab')return
      const buttons=[...root.current.querySelectorAll('.tour-modal button')]
      const first=buttons[0],last=buttons.at(-1)
      if(e.shiftKey && document.activeElement===first){e.preventDefault();last?.focus()}
      else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first?.focus()}
    }
    addEventListener('keydown',key)
    return ()=>{removeEventListener('keydown',key);previous?.focus()}
  },[plan])
  const step=d=>{setObservationId('');setIndex(i=>Math.max(0,Math.min((route?.puntos.length||1)-1,i+d)))}
  const streetUrl = point ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${point.lat},${point.lng}&heading=${heading}&pitch=0&fov=80` : ''
  return <section className="tour" ref={root} aria-label="Recorrido Amalaya">
    <header className="tour-heading"><div><p className="tour-kicker">AMALAYA / TERRITORIO VIVO</p><h1>El lugar. <em>Lo que viene.</em></h1><p>Una misma calle, dos maneras de imaginar su futuro.</p></div><button className="tour-outline" onClick={()=>setPlan(true)}>Propuesta y próximos pasos <ArrowUpRight size={16}/></button></header>
    <div className="tour-toolbar">
      <div className="tour-segment" aria-label="Versión del entorno">{[['actual','Actual'],['amalaya','Amalaya']].map(([v,t])=><button key={v} aria-pressed={version===v} onClick={()=>setVersion(v)}>{t}</button>)}</div>
      <span className="tour-version">{version==='actual'?'Levantamiento en desarrollo':'Ensayo conceptual · no aprobado'}</span>
      <div className="tour-segment tour-modes" aria-label="Forma de recorrer">{[['map','Territorio',Map],['walk','Caminar 3D',PersonStanding],['360','Puntos 360',Scan]].map(([v,t,Icon])=><button key={v} aria-pressed={mode===v} onClick={()=>setMode(v)}><Icon size={15}/>{t}</button>)}</div>
    </div>
    <div className="tour-stage">
      <div ref={container} className="tour-map" style={{visibility:mode==='map'?'visible':'hidden'}}/>
      {mode==='walk' && <iframe ref={frame} title="Caminar por Amalaya en 3D" className="tour-frame" src={`${BASE}levantamiento/visor/?embed=1&route=R-001&waypoint=05&clean=1`} allow="fullscreen" onLoad={()=>send()}/>}
      {mode==='360' && point && !obs && <iframe ref={frame} title="Puntos 360 del recorrido Amalaya" className="tour-frame" src={urlPanorama(BASE,route,point)} allow="fullscreen" onLoad={()=>send()}/>}
      {mode==='360' && obs && <div className="tour-empty"><Scan size={36}/><h2>{obs.id} · {obs.name}</h2><p>Esta observación conserva su ubicación y rumbo. Su referencia se consulta en Google Maps.</p><a href={streetUrl} target="_blank" rel="noreferrer">Abrir referencia 360 <ArrowUpRight size={16}/></a></div>}
      <div className="tour-stage-top"><span className="tour-chip"><span className="tour-live"/>{mode==='map'?'Vista de conjunto':mode==='walk'?'A la altura de tus ojos':'La calle en 360°'}</span><button className="tour-square" aria-label="Pantalla completa" onClick={()=>document.fullscreenElement?document.exitFullscreen():root.current.requestFullscreen?.().catch(()=>{})}><Maximize2 size={17}/></button></div>
      {error && mode!=='360' && <div role="alert" className="tour-error">{error} <button onClick={()=>setMode('360')}>Ver puntos 360</button></div>}
      {!mapReady && !error && mode==='map' && <div className="tour-loading" role="status"><Compass size={32}/><p>{status}</p></div>}
      <div className="tour-caption" hidden={mode==='360'}>{version==='amalaya' ? (mode==='360'?'Los puntos sin render Amalaya conservan la vista actual.':'Propuesta de estudio: dos estancias con sombra en Plaza Hidalgo.') : 'Geometría provisional · escala calibrada en dos tramos.'}</div>
    </div>
    <div className="tour-controls">
      <label>RECORRIDO<select value={route?.id||''} onChange={e=>{setRouteId(e.target.value);setIndex(0);setObservationId('')}}>{routes.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}</select></label>
      <div className="tour-step"><button className="tour-square" aria-label="Punto anterior" disabled={!route || (!obs && index===0)} onClick={()=>step(-1)}><ChevronLeft/></button><div><span>{obs?obs.id:`PUNTO ${String(index+1).padStart(2,'0')} / ${route?.puntos.length||'—'}`}</span><strong>{point?.nombre||point?.name||'Cargando recorrido…'}</strong></div><button className="tour-square" aria-label="Punto siguiente" disabled={!route||(!obs && index===route.puntos.length-1)} onClick={()=>step(1)}><ChevronRight/></button></div>
      <label>OBSERVACIONES<select value={observationId} onChange={e=>setObservationId(e.target.value)}><option value="">Ver desde el recorrido</option>{observations.map(p=><option value={p.id} key={p.id}>{p.id} · {p.name}</option>)}</select></label>
    </div>
    <footer className="tour-footer"><span>{point?`${point.lat.toFixed(7)}, ${point.lng.toFixed(7)} · ${heading.toFixed(1)}°`:'WGS84'} · © OpenStreetMap</span><span>{mode==='map'?'Rueda: zoom · arrastra: desplazar · botón derecho: girar':mode==='walk'?'Clic para mirar · WASD para caminar · Esc para salir':'Arrastra para mirar · flechas para avanzar'}</span></footer>
    {plan && <div className="tour-modal" role="dialog" aria-modal="true" aria-label="Propuesta del recorrido"><div><button className="tour-square tour-close" aria-label="Cerrar propuesta" onClick={()=>setPlan(false)} autoFocus><X/></button><p className="tour-kicker">UNA VENTANA AL FUTURO DEL CENTRO</p><h2>Caminar Amalaya<br/><em>antes de construirlo.</em></h2><p>Entrar al territorio, acercarse a una calle y alternar su estado actual con el proyecto. Los mismos puntos conectan la experiencia 3D con el registro 360.</p><div className="tour-plan">{PLAN.map(([n,t,d])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div><p className="tour-note">Esta revisión conecta el levantamiento existente y los 37 puntos de ruta. Las 128 observaciones conservan sus coordenadas; no se les asignan panoramas por proximidad. La versión Amalaya es un ensayo de sombra y estancia, pendiente de diseño aprobado.</p><button className="tour-outline" onClick={()=>setPlan(false)}>Volver al territorio</button></div></div>}
  </section>
}
