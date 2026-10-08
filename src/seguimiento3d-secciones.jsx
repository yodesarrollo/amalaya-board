import {blockSections} from './seguimiento3d-secciones.js'
import {useState} from 'react'
const BASE=import.meta.env.BASE_URL
export default function BlockSections({block}) {
 const sections=blockSections(block),[selected,setSelected]=useState(null)
 const first=sections.find(s=>s.id===selected&&s.state==='done')||sections.filter(s=>s.state==='done').at(-1)
 return <section className="block-sections" aria-label={`Cinco etapas de la cuadra ${block.displayNumber??block.id}`}>
  <h3>Etapas de esta cuadra</h3>
  <p>Verde: etapa cerrada con evidencia. Rojo: pendiente de cierre por cuadra; los avances anteriores se conservan.</p>
  <ol>{sections.map(s=><li key={s.id} className={s.state==='done'?'section-done':'section-pending'}><span aria-hidden="true">{s.state==='done'?'●':'○'}</span><strong>{s.id}. {s.name}</strong><small>{s.label}</small>{s.state==='done'&&<button type="button" aria-pressed={first?.id===s.id} onClick={()=>setSelected(s.id)}>Ver evidencia de la etapa {s.id}</button>}</li>)}</ol>
  {first&&<div className="section-proof">
   <p>{first.review.summary}</p>
   <div className="section-photos">{[['before','Antes'],['reference','Referencia real'],['after','Después']].map(([key,label])=><a key={key} href={BASE+first.review.evidence[key]} target="_blank" rel="noreferrer"><img src={BASE+first.review.evidence[key]} alt={`${block.id} · ${label} · ${first.name}`} loading="lazy"/><span>{label}</span></a>)}</div>
   <a className="secondary-link" href={BASE+first.review.comparison} target="_blank" rel="noreferrer">Abrir comparación y registro de la etapa {first.id} ↗</a>
   <p className="focus-caption">Cierre visual aproximado. Alturas y partes ocultas conservan sus limitaciones.</p>
  </div>}
 </section>
}
