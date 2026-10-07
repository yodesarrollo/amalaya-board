import {useEffect,useState} from 'react'
import {blockViewBox} from './calco2d-model'
const BASE=import.meta.env.BASE_URL
const cached=new Map()
function load(path){
 if(!cached.has(path))cached.set(path,(async()=>{const control=new AbortController(),timer=setTimeout(()=>control.abort(),12000);try{const r=await fetch(BASE+path,{signal:control.signal,cache:'no-cache'});if(!r.ok)throw Error();return await r.json()}catch(e){cached.delete(path);throw e}finally{clearTimeout(timer)}})())
 return cached.get(path)
}
export default function Calco({block}){
 const [historical,setHistorical]=useState(false)
 const path=!historical&&block.visualFit?block.visualFit.data:'levantamiento/calco/cuadras-2d.json'
 const [data,setData]=useState(null),[error,setError]=useState(false),[attempt,setAttempt]=useState(0),[photo,setPhoto]=useState(true),[lines,setLines]=useState(true),[selected,setSelected]=useState(null),[zoom,setZoom]=useState(false),[imageError,setImageError]=useState(false)
 useEffect(()=>{let live=true;setError(false);setData(null);setSelected(null);load(path).then(d=>{if(live)setData(d)}).catch(()=>{if(live)setError(true)});return()=>{live=false}},[attempt,path])
 if(error)return <p role="alert">No cargó el calco. <button onClick={()=>setAttempt(n=>n+1)}>Reintentar</button></p>
 if(!data)return <p role="status">Cargando calco 2D…</p>
 const fitted=data.status==='ajuste-visual'
 const ref=data.reference,review=data.reviews.find(r=>r.blockId===block.id),traces=data.traces.filter(t=>t.blockId===block.id),box=blockViewBox(block,ref)
 const view=zoom?[box[0]+box[2]/4,box[1]+box[3]/4,box[2]/2,box[3]/2]:box
 return <section className="calco-panel" aria-label={`Calco 2D de ${block.id}`}>
  <div className="calco-tools" role="group" aria-label="Vista del calco"><button aria-pressed={photo} onClick={()=>setPhoto(!photo)}>{photo?'Foto visible':'Plano sin foto'}</button><button aria-pressed={lines} onClick={()=>setLines(!lines)}>{lines?'Trazos visibles':'Trazos ocultos'}</button><button aria-pressed={zoom} onClick={()=>setZoom(!zoom)}>{zoom?'Ver cuadra completa':'Acercar centro'}</button></div>
  {block.visualFit&&<button className="quiet" onClick={()=>setHistorical(!historical)}>{historical?'Volver al ajuste visual':'Ver calco parcial anterior'}</button>}
  <svg className="calco-sheet" viewBox={view.join(' ')} role="group" aria-label={`Foto y trazos de ${block.id}`}>
   <rect x="0" y="0" width={ref.width} height={ref.height} fill="#faf8f1"/>
   {photo&&!imageError&&<image href={BASE+ref.image} width={ref.width} height={ref.height} onError={()=>setImageError(true)}/>}
   {lines&&traces.map(t=><g key={t.id} role="button" tabIndex="0" aria-label={`${t.id}: ${t.type}`} onClick={()=>setSelected(t)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setSelected(t)}}}><polyline points={t.pixels.map(p=>p.join(',')).join(' ')} className="calco-hit"/><polyline points={t.pixels.map(p=>p.join(',')).join(' ')} className={'calco-line '+(['borde-calzada','limite-aproximado'].includes(t.type)?'road':'walk')}/></g>)}
  </svg>
  {imageError&&<p role="alert">La foto no cargó; el plano conserva sus coordenadas. <button onClick={()=>setImageError(false)}>Reintentar foto</button></p>}
  <p className="calco-legend"><span>Azul: {fitted?'contorno aproximado':'borde vial'}</span> · <span>Naranja: borde peatonal</span></p>
  <p><strong>{fitted?'Pasos 2 y 3 · montaje visual aproximado':`${traces.length} fragmentos · calco parcial histórico`}</strong>. {fitted?'Calles y banquetas separadas de los edificios. Los bordes ocultos son estimados.':'Versión anterior, conservada para comparación.'}</p>
  {selected&&<p role="status">{selected.id} · {selected.type} · {fitted?'Estimación para montaje visual; no es una medición.':'Interpretación visual por contrastar.'}</p>}
  {fitted?<details><summary>Criterio y límites del ajuste</summary><p>{review.note}</p><p>Tolerancia visual objetivo: 0.5–1 m; no representa exactitud comprobada. Alturas y relieve conservan sus etapas pendientes.</p><p>Observación original: {review.historicalGaps}</p></details>:<details><summary>Observaciones del calco anterior</summary><p>{review.gaps}</p><p>{review.requiredEvidence}</p></details>}
  {fitted&&<a className="secondary-link" href={BASE+'modelo-completo.html?cuadra='+encodeURIComponent(block.id)+'&vista=volumen'} target="_blank" rel="noreferrer">Abrir {block.id} en 3D ↗</a>}
  {fitted&&block.visualFit?.evidence&&<a href={BASE+block.visualFit.evidence} target="_blank" rel="noreferrer"><img loading="lazy" src={BASE+block.visualFit.evidence} alt={`${block.id}: referencia y superficies aproximadas en el mismo encuadre`} style={{width:'100%',borderRadius:12}}/></a>}
  {fitted&&<details><summary>Antes / después del modelo 3D</summary><a href={BASE+'levantamiento/ajuste-visual/'+block.id+'-modelo.jpg'} target="_blank" rel="noreferrer"><img loading="lazy" src={BASE+'levantamiento/ajuste-visual/'+block.id+'-modelo.jpg'} alt={`${block.id}: modelo anterior y ajustado, misma cámara`} style={{width:'100%',borderRadius:12}}/></a></details>}
  <p className="focus-caption">Esri / Vantor · capturas regionales de enero de 2024. {fitted?'Suelo aproximado incorporado al modelo 3D.':'Calco histórico sin superficies.'}</p>
  <a className="secondary-link" href={BASE+(fitted?'levantamiento/ajuste-visual/superficies.geojson':'levantamiento/calco/cuadras-2d.geojson')} download>Descargar {fitted?'superficies aproximadas':'líneas históricas'} ↗</a>
 </section>
}
