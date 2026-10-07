import {VERSION_CAMINATA} from '../caminata-version.js'
import {usarEstadoCaminata} from '../usarEstadoCaminata.js'
import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { ArrowUpRight, ChevronLeft, ChevronRight, Maximize2, Share2, LocateFixed, Map, PersonStanding, Scan, X, Compass } from 'lucide-react'
import { rumboRuta, mensajeRecorrido, urlPanorama, PLAN } from '../recorrido-state'
import '../recorrido.css'
import { VERSION_LEVANTAMIENTO } from '../levantamiento-version'
const BASE = import.meta.env.BASE_URL
const HOME = [-110.9542, 29.07615]
const INITIAL = new URLSearchParams(location.search)

const EMPTY_SPACES = []
export default function RecorridoPortal({ board = false, espacios = EMPTY_SPACES, onAbrirEspacio, espacioAbierto }) {
  const [routes, setRoutes] = useState([]), [observations, setObservations] = useState([])
  const [routeId, setRouteId] = useState(INITIAL.get('ruta') || 'R-001'), [index, setIndex] = useState(4)
  const [observationId, setObservationId] = useState('')
  const [mode, setMode] = useState(['map','walk','360'].includes(INITIAL.get('vista'))?INITIAL.get('vista'):'map'), [version, setVersion] = useState(INITIAL.get('version')==='amalaya'?'amalaya':'actual')
  const [status, setStatus] = useState('Preparando el territorio…'), [error, setError] = useState('')
  const [plan, setPlan] = useState(false), [mapReady, setMapReady] = useState(false)
  const [spaceSearch,setSpaceSearch] = useState(''), [showSpaces,setShowSpaces] = useState(true), [showRoutes,setShowRoutes] = useState(!board)
  const spacesRef=useRef([])
  const [notice,setNotice] = useState(''), [frameReady,setFrameReady] = useState(false)
  const cameraState = useRef(null), pins = useRef([]), focusedPoint = useRef('')
  const root = useRef(), container = useRef(), map = useRef(), layer = useRef(), frame = useRef(), latest = useRef()
  const [walkAttempt,setWalkAttempt] = useState(0)
  const walkState = usarEstadoCaminata(frame,mode === 'walk',walkAttempt)
  const lightView = mode === 'walk' && walkState === 'light'
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
    ]).then(([r,o])=>{ setRoutes(r.rutas); setObservations(o.points || []); const selected=r.rutas.find(x=>x.id===INITIAL.get('ruta')); if(selected){const i=selected.puntos.findIndex(x=>x.id===INITIAL.get('punto'));setIndex(i>=0?i:0)};if((o.points||[]).some(x=>x.id===INITIAL.get('observacion')))setObservationId(INITIAL.get('observacion')) }).catch(e=>{if(e.name!=='AbortError')setError(e.message)})
    return ()=>abort.abort()
  },[])
  useEffect(() => {
    setMapReady(false)
    setError('')
    setStatus('Preparando el territorio…')
    if(mode!=='map')return
    let alive = true, world, api, m
    const abort = new AbortController()
    const base = `${BASE}levantamiento/`
    ;(async()=>{
      try {
        api = await import(/* @vite-ignore */ `${base}world.js?v=${VERSION_LEVANTAMIENTO}`)
        world = await api.createWorld(base, abort.signal)
        if (!alive) { api.disposeWorld(world); return }
        // Bundled OSM vector context keeps the map usable without a remote tile service.
        const response = await fetch(`${base}data/osm-context.json`,{signal:abort.signal})
        if(!response.ok) throw Error('No se pudo abrir el mapa de contexto.')
        const osm = await response.json()
        const features = osm.elements.filter(e=>e.tags?.highway && e.geometry?.length>1).map(e=>({type:'Feature',properties:{name:e.tags.name||''},geometry:{type:'LineString',coordinates:e.geometry.map(p=>[p.lon,p.lat])}}))
        m = new maplibregl.Map({container:container.current,center:HOME,zoom:17.5,pitch:58,bearing:-24,maxZoom:21,minZoom:15,
          ...(cameraState.current || {}),
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
          const active=latest.current.routes.find(r=>r.puntos.some(p=>p.id===latest.current.point?.id));
          if(active){m.addSource('route',{type:'geojson',data:{type:'Feature',geometry:{type:'LineString',coordinates:active.puntos.map(p=>[p.lng,p.lat])}}});m.addLayer({id:'route-line',type:'line',source:'route',paint:{'line-color':'#b36735','line-width':4,'line-opacity':.8}})}
          setMapReady(true);setStatus('Levantamiento conectado')
        })
        m.on('error',()=>{ if(alive)setError('No se pudo dibujar el mapa. Puedes abrir los puntos 360.') })
      } catch(e) { if(alive && e.name!=='AbortError'){ setError('El modelo no pudo cargarse en este dispositivo. Los recorridos 360 siguen accesibles.');setStatus('3D no disponible') } }
    })()
    return ()=>{ alive=false;abort.abort();if(m){cameraState.current={center:m.getCenter().toArray(),zoom:m.getZoom(),pitch:m.getPitch(),bearing:m.getBearing()};m.remove()}else if(world)api.disposeWorld(world);map.current=null;layer.current=null }
  },[mode])
  useEffect(()=>{
    if(!mapReady || !map.current || !board || !showSpaces)return
    const m=map.current
    const markers=espacios.map(space=>{
      const el=document.createElement('button');el.className='tour-space-pin';el.setAttribute('role','button');el.textContent=space.nombre
      el.setAttribute('aria-label',`Abrir ficha: ${space.nombre}`);el.setAttribute('aria-pressed',String(space.id===espacioAbierto));el.title=space.referencia
      el.onclick=()=>onAbrirEspacio?.(space.id)
      const marker=new maplibregl.Marker({element:el,anchor:'bottom',offset:[0,-10]}).setLngLat(space.coordinates).addTo(m)
      el.setAttribute('aria-label',`Abrir ficha: ${space.nombre}`)
      return marker
    })
    spacesRef.current=markers
    return()=>{markers.forEach(m=>m.remove());spacesRef.current=[]}
  },[mapReady,board,espacios,onAbrirEspacio,espacioAbierto,showSpaces])
  useEffect(()=>{
    const space=espacios.find(s=>s.id===espacioAbierto)
    if(space && mapReady && map.current)map.current.easeTo({center:space.coordinates,duration:400})
  },[espacioAbierto,espacios,mapReady])
  useEffect(()=>{
    if(!mapReady || !map.current || !routes.length || !showRoutes)return
    const m=map.current
    const markers=[]
    routes.forEach(r=>r.puntos.forEach((p,i)=>{
      const el=document.createElement('button');el.className='tour-pin';el.setAttribute('role','button');el.title=`${r.nombre} · ${i+1}`;el.setAttribute('aria-label',el.title)
      el.dataset.point=p.id;el.dataset.route=r.id;el.textContent=String(i+1); el.style.setProperty('--route',r.color)
      el.onclick=()=>{setRouteId(r.id);setIndex(i);setObservationId('')}
      markers.push(new maplibregl.Marker({element:el}).setLngLat([p.lng,p.lat]).addTo(m))
      el.setAttribute('aria-label',el.title)
    }))
    pins.current=markers
    return ()=>{markers.forEach(m=>m.remove());pins.current=[]}
  },[mapReady,routes,showRoutes])
  useEffect(()=>{
    if(point && map.current && mapReady && focusedPoint.current!==point.id){map.current.easeTo({center:[point.lng,point.lat],duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:500});focusedPoint.current=point.id}
    send()
  },[point?.id,heading,mode,mapReady])
  useEffect(()=>{if(mapReady && map.current?.getLayer('route-line'))map.current.setLayoutProperty('route-line','visibility',showRoutes?'visible':'none')},[mapReady,showRoutes])
  useEffect(()=>{
    pins.current.forEach(marker=>{const el=marker.getElement();el.classList.toggle('is-active',el.dataset.point===point?.id);el.classList.toggle('is-muted',el.dataset.route!==route?.id);el.setAttribute('aria-pressed',String(el.dataset.point===point?.id))})
    const source=map.current?.getSource('route');if(source && route)source.setData({type:'Feature',geometry:{type:'LineString',coordinates:route.puntos.map(p=>[p.lng,p.lat])}})
  },[point?.id,route?.id,mapReady,showRoutes])
  useEffect(()=>{setFrameReady(false)},[mode,mode==='360'?point?.id:null])
  useEffect(()=>{if(!notice)return;const timer=setTimeout(()=>setNotice(''),5000);return()=>clearTimeout(timer)},[notice])
  const share=async()=>{
    const url=new URL(`${BASE}explorar.html`,location.origin)
    url.search=new URLSearchParams({ruta:route?.id||'R-001',punto:point?.id||'',vista:mode,version,...(obs?{observacion:obs.id}:{})})
    try{await navigator.clipboard.writeText(url.href);setNotice('Enlace copiado. Abre este mismo punto y versión.')}catch{setNotice(`Enlace para compartir: ${url.href}`)}
  }
  useEffect(()=>{layer.current?.setScenario(version);map.current?.triggerRepaint();send(true)},[version])
  useEffect(()=>{
    const listener=e=>{
      if(e.origin!==location.origin || e.source!==frame.current?.contentWindow)return
      if(e.data?.type==='amalaya:scene-ready'){setFrameReady(true);send();return}
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
  return <section className={`tour ${board?'tour-board':''}`} ref={root} aria-label="Recorrido Amalaya">
    {!board && <header className="tour-heading"><div><p className="tour-kicker">HERMOSILLO, SONORA · DISTRITO CULTURAL Y MUSICAL</p><h1>Aquí empieza <em>Amalaya.</em></h1><p>La memoria del centro. El pulso de lo que viene. Recorre sus calles y descubre el proyecto desde el mismo lugar.</p></div><button className="tour-outline" onClick={()=>setPlan(true)}>Propuesta y próximos pasos <ArrowUpRight size={16}/></button></header>}
    {!board && <div className="tour-intro"><span><b>04</b> recorridos conectados</span><span><b>37</b> puntos del recorrido 360</span><span><b>3D + 360°</b> una misma ubicación</span><button onClick={share}><Share2 size={15}/> Compartir vista</button></div>}
    {board && <div className="tour-workspace"><label className="tour-space-search">Buscar un espacio<input value={spaceSearch} onChange={e=>setSpaceSearch(e.target.value)} placeholder="Nombre del espacio…"/></label><div className="tour-space-results" aria-label="Espacios del tablero">{espacios.filter(s=>s.nombre.toLocaleLowerCase('es').includes(spaceSearch.toLocaleLowerCase('es'))).map(s=><button key={s.id} aria-pressed={s.id===espacioAbierto} onClick={()=>onAbrirEspacio?.(s.id)}>{s.nombre}</button>)}{espacios.length===0 && <p>No hay espacios disponibles para esta sesión.</p>}</div><div className="tour-layer-toggles"><label><input type="checkbox" checked={showSpaces} onChange={e=>setShowSpaces(e.target.checked)}/>Espacios</label><label><input type="checkbox" checked={showRoutes} onChange={e=>setShowRoutes(e.target.checked)}/>Puntos de recorrido</label><button className="tour-outline" onClick={share}>Compartir recorrido público <Share2 size={14}/></button></div></div>}
    <div className="tour-toolbar">
      <div className="tour-segment" hidden={lightView} aria-label="Versión del entorno">{[['actual','Actual'],['amalaya','Amalaya']].map(([v,t])=><button key={v} aria-pressed={version===v} onClick={()=>setVersion(v)}>{t}</button>)}</div>
      <span className="tour-version" hidden={lightView}>{version==='actual'?'Levantamiento en desarrollo':'Ensayo conceptual · no aprobado'}</span>
      <div className="tour-segment tour-modes" aria-label="Forma de recorrer">{[['map','Territorio',Map],['walk','Caminar 3D',PersonStanding],['360','Puntos 360',Scan]].map(([v,t,Icon])=><button key={v} aria-pressed={mode===v} onClick={()=>{if(v==='walk'&&mode===v&&['failed','light','timeout'].includes(walkState))setWalkAttempt(n=>n+1);setMode(v);if(v!=='map')setShowRoutes(true)}}><Icon size={15}/>{t}</button>)}</div>
    </div>
    <div className="tour-stage">
      <div ref={container} className="tour-map" style={{visibility:mode==='map'?'visible':'hidden'}}/>
      {mode==='walk' && <iframe key={walkAttempt} ref={frame} title="Caminar por Amalaya en 3D" className="tour-frame" src={`${BASE}levantamiento/visor/?embed=1&character=sonora&route=R-001&waypoint=05&clean=1&v=${VERSION_CAMINATA}`} allow="fullscreen; pointer-lock"/>}
      {mode==='360' && point && !obs && <iframe ref={frame} title="Puntos 360 del recorrido Amalaya" className="tour-frame" src={urlPanorama(BASE,route,point)} allow="fullscreen" onLoad={()=>{setFrameReady(true);send()}}/>}
      {mode==='360' && obs && <div className="tour-empty"><Scan size={36}/><h2>{obs.id} · {obs.name}</h2><p>Esta observación conserva su ubicación y rumbo. Su referencia se consulta en Google Maps.</p><a href={streetUrl} target="_blank" rel="noreferrer">Abrir referencia 360 <ArrowUpRight size={16}/></a></div>}
      <div className="tour-stage-top" style={lightView?{left:'auto',right:16}:undefined}><span className="tour-chip"><span className="tour-live"/>{mode==='map'?'Vista de conjunto':mode==='walk'?(lightView?'Vista ligera del conjunto':'A la altura de tus ojos'):'La calle en 360°'}</span><div className="tour-tools">{mode==='map' && <button className="tour-square" aria-label="Volver al punto seleccionado" onClick={()=>map.current?.easeTo({center:point?[point.lng,point.lat]:HOME,zoom:18,pitch:58,bearing:heading,duration:600})}><LocateFixed size={17}/></button>}<button className="tour-square" aria-label="Pantalla completa" onClick={()=>document.fullscreenElement?document.exitFullscreen():(board?root.current.closest('[data-territorio-board]'):root.current).requestFullscreen?.().catch(()=>{})}><Maximize2 size={17}/></button></div></div>
      {((mode==='walk' && walkState==='loading') || (mode==='360' && !frameReady)) && !obs && <div className="tour-loading" role="status"><Compass size={32}/><p>{mode==='walk'?'Entrando al modelo 3D…':'Abriendo el panorama…'}</p></div>}
      {mode==='walk' && walkState==='timeout' && <div className="tour-error" role="alert">El recorrido tardó demasiado. <button onClick={()=>{setMode('map')}}>Volver al territorio</button></div>}
      {error && mode!=='360' && <div role="alert" className="tour-error">{error} <button onClick={()=>setMode('360')}>Ver puntos 360</button></div>}
      {!mapReady && !error && mode==='map' && <div className="tour-loading" role="status"><Compass size={32}/><p>{status}</p></div>}
      <div className="tour-caption" hidden={mode==='360'||lightView}>{version==='amalaya' ? (mode==='360'?'Los puntos sin render Amalaya conservan la vista actual.':'Propuesta de estudio: dos estancias con sombra en Plaza Hidalgo.') : 'Geometría provisional · escala calibrada en dos tramos.'}</div>
    </div>
    <div className="tour-progress" hidden={lightView} aria-hidden="true"><i style={{width:`${((index+1)/(route?.puntos.length||1))*100}%`}}/></div>
    {notice && <p className="tour-notice" role="status">{notice}</p>}
    <div className="tour-controls" hidden={lightView}>
      <label>RECORRIDO<select value={route?.id||''} onChange={e=>{setRouteId(e.target.value);setIndex(0);setObservationId('')}}>{routes.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}</select></label>
      <div className="tour-step"><button className="tour-square" aria-label="Punto anterior" disabled={!route || (!obs && index===0)} onClick={()=>step(-1)}><ChevronLeft/></button><div><span>{obs?obs.id:`PUNTO ${String(index+1).padStart(2,'0')} / ${route?.puntos.length||'—'}`}</span><strong>{point?.nombre||point?.name||'Cargando recorrido…'}</strong></div><button className="tour-square" aria-label="Punto siguiente" disabled={!route||(!obs && index===route.puntos.length-1)} onClick={()=>step(1)}><ChevronRight/></button></div>
      <label>OBSERVACIONES<select value={observationId} onChange={e=>setObservationId(e.target.value)}><option value="">Ver desde el recorrido</option>{observations.map(p=><option value={p.id} key={p.id}>{p.id} · {p.name}</option>)}</select></label>
    </div>
    <footer className="tour-footer" hidden={lightView}><span>{point?`${point.lat.toFixed(7)}, ${point.lng.toFixed(7)} · ${heading.toFixed(1)}°`:'WGS84'} · © OpenStreetMap</span><span>{mode==='map'?'Rueda: zoom · arrastra: desplazar · botón derecho: girar':mode==='walk'?'Arrastra para mirar en móvil · controles para caminar · WASD en computadora':'Arrastra para mirar · flechas para avanzar'}</span></footer>
    {!board && <div className="tour-story"><div><p className="tour-kicker">DEL TERRITORIO A LA EXPERIENCIA</p><h2>Un lugar para encontrarse.<br/><em>Una nueva forma de recorrerlo.</em></h2></div><div><p>Empieza desde arriba. Elige una calle, baja al nivel de la banqueta y abre su registro 360. Cambia entre Actual y Amalaya para revisar la propuesta conservando el punto seleccionado.</p><p className="tour-note">Hoy puedes explorar el levantamiento y un ensayo de sombra en Plaza Hidalgo. Las fachadas son provisionales y la transformación completa se incorporará con el proyecto aprobado.</p><button className="tour-outline" onClick={()=>setPlan(true)}>Conocer el plan de evolución <ArrowUpRight size={16}/></button></div></div>}
    {plan && <div className="tour-modal" role="dialog" aria-modal="true" aria-label="Propuesta del recorrido"><div><button className="tour-square tour-close" aria-label="Cerrar propuesta" onClick={()=>setPlan(false)} autoFocus><X/></button><p className="tour-kicker">UNA VENTANA AL FUTURO DEL CENTRO</p><h2>Caminar Amalaya<br/><em>antes de construirlo.</em></h2><p>Entrar al territorio, acercarse a una calle y alternar su estado actual con el proyecto. Los mismos puntos conectan la experiencia 3D con el registro 360.</p><div className="tour-plan">{PLAN.map(([n,t,d])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div><p className="tour-note">Esta revisión conecta el levantamiento existente y los 37 puntos de ruta. Las 128 observaciones conservan sus coordenadas; no se les asignan panoramas por proximidad. La versión Amalaya es un ensayo de sombra y estancia, pendiente de diseño aprobado.</p><button className="tour-outline" onClick={()=>setPlan(false)}>Volver al territorio</button></div></div>}
  </section>
}
