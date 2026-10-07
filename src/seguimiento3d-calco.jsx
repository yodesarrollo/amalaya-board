import {useEffect,useState} from 'react'
import {blockViewBox} from './calco2d-model'
const BASE=import.meta.env.BASE_URL
let cached
function load(){
 if(!cached)cached=(async()=>{const control=new AbortController(),timer=setTimeout(()=>control.abort(),12000);try{const r=await fetch(BASE+'levantamiento/calco/cuadras-2d.json',{signal:control.signal,cache:'no-cache'});if(!r.ok)throw Error();return await r.json()}catch(e){cached=null;throw e}finally{clearTimeout(timer)}})()
 return cached
}
export default function Calco({block}){
 const [data,setData]=useState(null),[error,setError]=useState(false),[attempt,setAttempt]=useState(0),[photo,setPhoto]=useState(true),[lines,setLines]=useState(true),[selected,setSelected]=useState(null),[zoom,setZoom]=useState(false),[imageError,setImageError]=useState(false)
 useEffect(()=>{let live=true;setError(false);load().then(d=>{if(live)setData(d)}).catch(()=>{if(live)setError(true)});return()=>{live=false}},[attempt])
 if(error)return <p role="alert">No cargó el calco. <button onClick={()=>setAttempt(n=>n+1)}>Reintentar</button></p>
 if(!data)return <p role="status">Cargando calco 2D…</p>
 const ref=data.reference,review=data.reviews.find(r=>r.blockId===block.id),traces=data.traces.filter(t=>t.blockId===block.id),box=blockViewBox(block,ref)
 const view=zoom?[box[0]+box[2]/4,box[1]+box[3]/4,box[2]/2,box[3]/2]:box
 return <section className="calco-panel" aria-label={`Calco 2D de ${block.id}`}>
  <div className="calco-tools" role="group" aria-label="Vista del calco"><button aria-pressed={photo} onClick={()=>setPhoto(!photo)}>{photo?'Foto visible':'Plano sin foto'}</button><button aria-pressed={lines} onClick={()=>setLines(!lines)}>{lines?'Trazos visibles':'Trazos ocultos'}</button><button aria-pressed={zoom} onClick={()=>setZoom(!zoom)}>{zoom?'Ver cuadra completa':'Acercar centro'}</button></div>
  <svg className="calco-sheet" viewBox={view.join(' ')} role="group" aria-label={`Foto y trazos de ${block.id}`}>
   <rect x="0" y="0" width={ref.width} height={ref.height} fill="#faf8f1"/>
   {photo&&!imageError&&<image href={BASE+ref.image} width={ref.width} height={ref.height} onError={()=>setImageError(true)}/>}
   {lines&&traces.map(t=><g key={t.id} role="button" tabIndex="0" aria-label={`${t.id}: ${t.type}`} onClick={()=>setSelected(t)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(t)}}}><polyline points={t.pixels.map(p=>p.join(',')).join(' ')} className="calco-hit"/><polyline points={t.pixels.map(p=>p.join(',')).join(' ')} className={'calco-line '+(t.type==='borde-calzada'?'road':'walk')}/></g>)}
  </svg>
  {imageError&&<p role="alert">La foto no cargó; el plano conserva sus coordenadas. <button onClick={()=>setImageError(false)}>Reintentar foto</button></p>}
  <p className="calco-legend"><span>Azul: borde vial</span> · <span>Naranja: borde peatonal interior</span></p>
  <p><strong>{traces.length?`${traces.length} fragmentos · calco parcial`:'Sin trazos fiables con esta foto'}</strong>. Ninguna cuadra tiene el perímetro completo aprobado.</p>
  {selected&&<p role="status">{selected.id} · {selected.type==='borde-calzada'?'Borde vial':'Borde peatonal interior'} · Interpretación visual por contrastar.</p>}
  <details open={!traces.length}><summary>Qué falta en esta cuadra</summary><p>{review.gaps}</p><p>{review.requiredEvidence}</p></details>
  <p className="focus-caption">Esri / Vantor · capturas del 13 y 16 de enero de 2024 en el área. No acredita cambios posteriores. Los huecos quedan abiertos; este calco no genera superficies 3D.</p>
  <a className="secondary-link" href={BASE+'levantamiento/calco/cuadras-2d.geojson'} download>Descargar líneas 2D del conjunto ↗</a>
 </section>
}
