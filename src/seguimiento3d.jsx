import {lazy,Suspense,useCallback,useEffect,useRef,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {STATES,columns,cellInfo} from './seguimiento3d-model'
import {blockIndex,blockSelection} from './seguimiento3d-cuadras'
import './seguimiento3d.css'
const CellDialog=lazy(()=>import('./seguimiento3d-dialog'))
const BASE=import.meta.env.BASE_URL
const NAMES={plan:'Plantas',street:'Calles',sidewalkA:'Banqueta A',sidewalkB:'Banqueta B',corners:'Esquinas',identity:'Identidad',volume:'Volumen',facade:'Fachadas',finish:'Acabados',equipment:'Equipamiento',qa:'Revisión final'}
const PAGE_SIZE=12
const clean=t=>t.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
const stateName=s=>s==='blocked'?'Necesita atención':s==='partial'?'Por verificar':STATES[s]?.label||'Pendiente'
function BuildingDialog({building:b,task,tasks,onClose,onAction}){
 const ref=useRef(null)
 useEffect(()=>{ref.current.showModal()},[])
 return <dialog ref={ref} className="building-dialog" onCancel={onClose} onClick={e=>{if(e.target===ref.current)onClose()}} aria-labelledby="building-title">
  <button className="simple-close" onClick={onClose} aria-label="Cerrar edificio">×</button>
  <span className="eyebrow">{b.id} · {b.publicSpace?'Espacio público':b.block}</span><h2 id="building-title">{b.name}</h2>
  {b.image&&<img className="focus-photo" src={BASE+b.image} alt={`Última imagen de ${b.id}`} decoding="async"/>}
  <p className="focus-caption">Última imagen registrada. El avance de cada etapa se muestra debajo.</p>
  <div className="focus-current"><div><span className="eyebrow">Etapa seleccionada</span><h3>{NAMES[task]}</h3><span className={'status-pill s-'+b.states[task]}>{stateName(b.states[task])}</span></div><button className="primary" onClick={()=>onAction(b,task)}>Ver detalle / dejar indicación</button></div>
  <a className="secondary-link" href={`${BASE}modelo-completo.html?edificio=${encodeURIComponent(b.id)}`}>Ubicar en el modelo ↗</a>
  <details className="history"><summary>Historial y otras etapas</summary><div className="task-list">{Object.keys(tasks).map((key,i)=><button key={key} onClick={()=>onAction(b,key)}><span>{String(i+1).padStart(2,'0')} · {NAMES[key]||tasks[key]}</span><span className={'status-pill s-'+b.states[key]}>{stateName(b.states[key])}</span></button>)}</div>{b.record&&<a href={BASE+b.record} target="_blank" rel="noreferrer">Registro de la última imagen ↗</a>}</details>
 </dialog>
}
function BlockDialog({block:b,task,tasks,onClose,onTask,onBuilding}){
 const ref=useRef(null)
 useEffect(()=>{ref.current.showModal()},[])
 const sides={norte:'Norte',este:'Este',sur:'Sur',oeste:'Oeste'}
 return <dialog ref={ref} className="building-dialog block-dialog" onCancel={onClose} onClick={e=>{if(e.target===ref.current)onClose()}} aria-labelledby="block-title">
  <button className="simple-close" onClick={onClose} aria-label="Cerrar cuadra">×</button>
  <span className="eyebrow">CUADRA {b.id}</span><h2 id="block-title">{b.name}</h2>
  {b.inventoryEvidence&&<img className="focus-photo" src={BASE+b.inventoryEvidence} alt={`${b.id}: límite de manzana en verde y huellas del modelo superpuestas`}/>}
  {b.inventoryEvidence&&<p className="focus-caption">Límite de inventario INEGI, diciembre de 2025. Huellas en amarillo; las señaladas para revisión, en naranja. Referencia de ubicación, no aprobación de banquetas.</p>}
  {b.nearbyStreets?.length>0&&<p><strong>Calles de referencia:</strong> {b.nearbyStreets.join(' · ')}</p>}
  {b.geometryReviewIds?.length>0&&<p className="inventory-warning">Revisar huellas: {b.geometryReviewIds.join(', ')}. Su pertenencia está registrada; su geometría sigue pendiente.</p>}
  {b.evidence&&<details className="history"><summary>Comparación anterior conservada</summary><a href={BASE+b.evidence} target="_blank" rel="noreferrer"><img className="focus-photo" src={BASE+b.evidence} alt={`Comparación de la cuadra ${b.id}: fotografía, trazado anterior y retrazado parcial`}/><span className="secondary-link">Ampliar comparación ↗</span></a></details>}
  <p className="focus-caption">{b.members.length} edificios vinculados. {b.membershipComplete?'Inventario delimitado.':'Falta completar la asignación y comprobar el perímetro.'}</p>
  <div className="block-sides">{b.sides?.map(s=><div key={s.side}><strong>{sides[s.side]||s.side}</strong><span>{s.status==='parcial'?'Por verificar':'Pendiente'}</span><p>{s.reason}</p></div>)}</div>
  <div className="focus-current"><div><span className="eyebrow">Etapa de la cuadra</span><h3>{NAMES[task]}</h3><span className={'status-pill s-'+b.states[task]}>{stateName(b.states[task])}</span></div><button className="primary" onClick={()=>onTask(b,task)}>Revisar / dejar indicación</button></div>
  <details className="history"><summary>Las 11 etapas de la cuadra</summary><div className="task-list">{Object.keys(tasks).map((t,i)=><button key={t} onClick={()=>onTask(b,t)}><span>{i+1}. {NAMES[t]||tasks[t]}</span><span className={'status-pill s-'+b.states[t]}>{stateName(b.states[t])}</span></button>)}</div></details>
  <details className="history"><summary>Edificios e historial conservado ({b.members.length})</summary><div className="task-list">{b.members.map(m=><button key={m.id} onClick={()=>onBuilding(m)}><span>{m.id} · {m.name}</span><span className={'status-pill s-'+m.states[task]}>{stateName(m.states[task])}</span></button>)}</div></details>
 </dialog>
}
function InventoryMap({registry,onSelect}){
 const [open,setOpen]=useState(false)
 return <section className="inventory-map"><button className="quiet" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'Ocultar':'Ver'} mapa de las {registry.totalPhysicalBlocks} cuadras</button>{open&&<><p>Selecciona una cuadra. Verde: límite de inventario INEGI; no representa el borde medido de la banqueta.</p><svg viewBox={`0 0 ${registry.map.width} ${registry.map.height}`} role="group" aria-label="Mapa de cuadras Amalaya"><image href={BASE+registry.map.image} width={registry.map.width} height={registry.map.height}/>{registry.blocks.map(b=><g key={b.id} tabIndex="0" role="button" aria-label={`Abrir ${b.id}`} onClick={()=>onSelect(b.id)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(b.id)}}}><path d={b.mapRings.map(r=>'M'+r.map(p=>p.join(',')).join('L')+'Z').join(' ')} fillRule="evenodd"/><text x={b.mapLabel[0]} y={b.mapLabel[1]}>{b.id}</text></g>)}</svg><small>Manzanas: INEGI, diciembre de 2025. Imagen: Esri World Imagery. Alcance: edificios registrados en el modelo.</small></>}</section>
}
function Seguimiento(){
 const[data,setData]=useState(null),[registry,setRegistry]=useState(null),[error,setError]=useState(''),[refreshing,setRefreshing]=useState(false)
 const[task,setTask]=useState('street'),[filter,setFilter]=useState('pending'),[query,setQuery]=useState(''),[page,setPage]=useState(0),[focus,setFocus]=useState(null),[blockFocus,setBlockFocus]=useState(null),[selected,setSelected]=useState(null),[opening,setOpening]=useState(false),[matrix,setMatrix]=useState(false)
 const full=useRef(null),request=useRef(0)
 const refresh=useCallback(async()=>{
  setRefreshing(true);const control=new AbortController(),timeout=setTimeout(()=>control.abort(),12000)
  try{
   const responses=await Promise.all(['seguimiento-ligero.json','levantamiento/cuadras.json'].map(path=>fetch(BASE+path,{cache:'no-cache',signal:control.signal})))
   if(responses.some(r=>!r.ok))throw Error()
   const [d,r]=await Promise.all(responses.map(r=>r.json()));blockIndex(d,r)
   setData(d);setRegistry(r);full.current=null;setError('')
  }catch{setError('No pudimos actualizar. Puedes reintentar; el avance visible se conserva.')}
  finally{clearTimeout(timeout);setRefreshing(false)}
 },[])
 useEffect(()=>{refresh();const timer=setInterval(()=>{if(document.visibilityState==='visible')refresh()},120000);return()=>clearInterval(timer)},[refresh])
 useEffect(()=>setPage(0),[task,filter,query])
 async function openAction(b,key){
  const n=++request.current;setOpening(true);setError('');const control=new AbortController(),timeout=setTimeout(()=>control.abort(),12000)
  try{if(!full.current){const r=await fetch(`${BASE}seguimiento-3d.json`,{cache:'no-cache',signal:control.signal});if(!r.ok)throw Error();full.current=await r.json()};if(n!==request.current)return;const column=columns(full.current).find(c=>c.building.id===b.id);if(!column)throw Error();setFocus(null);setSelected({column,cell:cellInfo(column,key),label:full.current.taskDefinitions[key]})}
  catch{setError('No cargó el detalle. Intenta abrirlo otra vez.');setFocus(null)}finally{clearTimeout(timeout);if(n===request.current)setOpening(false)}
 }
 function openBlockAction(b,key){setBlockFocus(null);setSelected(blockSelection(b,key,data.taskDefinitions[key]))}
 const index=data?blockIndex(data,registry):{blocks:[],unassigned:[],publicSpaces:[],totalPhysicalBlocks:null}
 const {blocks,unassigned,publicSpaces}=index,total=blocks.length,done=blocks.filter(b=>b.states[task]==='done').length
 const filtered=blocks.filter(b=>(!query||clean(b.id+' '+b.name+' '+(b.nearbyStreets||[]).join(' ')+' '+b.members.map(m=>m.id+' '+m.name).join(' ')).includes(clean(query)))&&(filter==='all'||(filter==='pending'?b.states[task]!=='done':filter==='blocked'?b.states[task]==='blocked':b.states[task]==='done')))
 const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE)),actualPage=Math.min(page,pages-1),visible=filtered.slice(actualPage*PAGE_SIZE,(actualPage+1)*PAGE_SIZE)
 const legacyGroups=[...new Set(unassigned.map(b=>b.block))].map(id=>({id,name:unassigned.find(b=>b.block===id).zone,members:unassigned.filter(b=>b.block===id&&(!query||clean(b.id+' '+b.name+' '+b.zone).includes(clean(query))))})).filter(g=>g.members.length)
 return <main className="flow-page">
  <header className="flow-header"><a href={`${BASE}explorar.html`} className="brand">Amalaya<span>Revisión por cuadras</span></a><nav><a className="model-link" href={`${BASE}modelo-completo.html`}>Ver conjunto ↗</a><button className="quiet" onClick={refresh} disabled={refreshing} aria-label="Actualizar estados">{refreshing?'Actualizando…':'↻ Actualizar'}</button></nav></header>
  <section className="flow-hero"><div><span className="eyebrow">UNA CUADRA A LA VEZ</span><h1>Revisamos el conjunto.<br/><span>Cuadra por cuadra.</span></h1><p>Calles, banquetas y esquinas en una misma revisión. Los edificios y su historial permanecen dentro de cada cuadra.</p><button className="primary" onClick={()=>{setTask('street');setFilter('pending');setQuery('');document.getElementById('work-area')?.scrollIntoView({behavior:'smooth'})}}>Continuar con calles →</button></div><a className="overview-card" href={`${BASE}modelo-completo.html`}><span className="overview-icon" aria-hidden="true">▦</span><strong>Todo Amalaya</strong><span>{data?`${total} cuadra${total===1?'':'s'} identificada${total===1?'':'s'}`:'Vista del conjunto'}</span><b>Abrir vista ligera ↗</b></a></section>
  {data&&<aside className="block-inventory" aria-label="Estado del inventario"><strong>{index.totalPhysicalBlocks===null?'Total de cuadras por confirmar':`${index.totalPhysicalBlocks} cuadras · inventario completo`}</strong><p>{blocks.reduce((n,b)=>n+b.members.length,0)} edificios vinculados · {unassigned.length} edificios pendientes de asignación · {publicSpaces.length} espacio{publicSpaces.length===1?'':'s'} público{publicSpaces.length===1?'':'s'}. Alcance: edificios del modelo actual. Calles y banquetas conservan sus pendientes.</p></aside>}
  {registry?.inventoryComplete&&<InventoryMap registry={registry} onSelect={id=>setBlockFocus(blocks.find(b=>b.id===id))}/> }
  <section id="work-area" className="work-area" aria-label="Cuadras por etapa">
   <div className="stage-heading"><div><label htmlFor="stage">¿Qué estamos trabajando?</label><select id="stage" value={task} onChange={e=>{setTask(e.target.value);setFilter('all')}}>{Object.entries(data?.taskDefinitions||NAMES).map(([key],i)=><option key={key} value={key}>{i+1}. {NAMES[key]||key}</option>)}</select></div><div className="stage-count"><strong>{done}<span> / {total}</span></strong><span>cuadras identificadas listas en esta etapa</span><progress max={total||1} value={done} aria-label="Avance de las cuadras identificadas"/></div></div>
   <div className="flow-filters"><label className="search"><span className="sr-only">Buscar cuadra o edificio</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar cuadra, edificio o código…"/></label></div>
   <div className="filter-tabs" role="group" aria-label="Filtrar estado">{[['pending','Por hacer'],['all','Todas'],['blocked','Con problema'],['done','Listas']].map(([key,label])=><button key={key} aria-pressed={filter===key} onClick={()=>setFilter(key)}>{label}</button>)}<span aria-live="polite">{filtered.length} cuadras</span></div>
   {error&&<p className="flow-error" role="alert">{error} <button onClick={refresh}>Reintentar</button></p>}
   {opening&&<p role="status">Abriendo detalle…</p>}
   {!data&&<div className="loading-cards" role="status"><p>{error?'Reintenta la carga con el botón de arriba.':'Cargando cuadras y avances…'}</p>{!error&&[0,1,2].map(n=><div key={n}/>)}</div>}
   {data&&!filtered.length&&<div className="empty"><h2>No hay cuadras identificadas en esta selección.</h2><button onClick={()=>{setQuery('');setFilter('all')}}>Ver todas</button></div>}
   <div className="building-grid">{visible.map((b,i)=><button className="building-card block-card" key={b.id} onClick={()=>setBlockFocus(b)} aria-label={`Abrir cuadra ${b.id}: ${b.name}`}><div className="card-image">{(b.inventoryEvidence||b.evidence)?<img src={BASE+(b.inventoryEvidence||b.evidence)} alt="" loading={i<3?'eager':'lazy'} decoding="async" width="320" height="180"/>:<span aria-hidden="true">▦</span>}<span className={'status-pill s-'+b.states[task]}>{stateName(b.states[task])}</span></div><div className="card-body"><span className="eyebrow">CUADRA {b.id} · {b.members.length} EDIFICIOS VINCULADOS</span><h3>{b.name}</h3><p className="membership-note">{b.membershipComplete?'Asignación completa':'Asignación y perímetro por completar'}</p><span className="card-action">Revisar {NAMES[task]?.toLowerCase()} <b>→</b></span></div></button>)}</div>
   {data&&filtered.length>0&&<div className="pagination"><button disabled={actualPage===0} onClick={()=>setPage(actualPage-1)}>← Anterior</button><span>Página {actualPage+1} de {pages}</span><button disabled={actualPage>=pages-1} onClick={()=>setPage(actualPage+1)}>Siguiente →</button></div>}
  </section>
  {data&&<section className="advanced"><button className="quiet" aria-expanded={matrix} onClick={()=>setMatrix(!matrix)}>{matrix?'Ocultar':'Mostrar'} las 11 etapas por cuadra</button>{matrix&&<div className="tracker-table-scroll"><table className="tracker-matrix"><thead><tr><th>Etapa</th>{visible.map(b=><th key={b.id}>Cuadra {b.id}</th>)}</tr></thead><tbody>{Object.keys(data.taskDefinitions).map(t=><tr key={t}><th>{NAMES[t]}</th>{visible.map(b=><td key={b.id}><button className={'tracker-cell state-'+b.states[t]} aria-label={`Cuadra ${b.id}: ${NAMES[t]} — ${stateName(b.states[t])}`} onClick={()=>openBlockAction(b,t)}>{STATES[b.states[t]]?.symbol||'·'}</button></td>)}</tr>)}</tbody></table></div>}</section>}
  {data&&<section className="unassigned-area" aria-label="Inventario por asignar"><details open={!!query}><summary>Edificios pendientes de asignar a una cuadra ({unassigned.length})</summary><p>Su avance, fotos e indicaciones se conservan. Estas agrupaciones históricas son referencias de búsqueda; no equivalen a cuadras físicas.</p>{legacyGroups.map(g=><details key={g.id} className="history" open={!!query}><summary>{g.name} · {g.members.length} edificios</summary><div className="task-list">{g.members.map(b=><button key={b.id} onClick={()=>setFocus(b)}><span>{b.id} · {b.name}</span><span className={'status-pill s-'+b.states[task]}>{stateName(b.states[task])}</span></button>)}</div></details>)}</details>{publicSpaces.length>0&&<details className="history"><summary>Espacios públicos ({publicSpaces.length})</summary><div className="task-list">{publicSpaces.map(b=><button key={b.id} onClick={()=>setFocus(b)}>{b.name}</button>)}</div></details>}</section>}
  <footer className="flow-footer"><span>El avance de un edificio no valida por sí solo una cuadra. Inventario cerrado: 33 cuadras y 139 edificios; los límites cartográficos no certifican guarniciones.</span>{data&&<span>Datos del {new Intl.DateTimeFormat('es-MX',{dateStyle:'short',timeZone:'America/Hermosillo'}).format(new Date(data.updatedAt))} · Actualización ligera cada 2 min</span>}<a href={`${BASE}seguimiento-3d.md`} target="_blank" rel="noreferrer">Historial por edificio ↗</a></footer>
  {blockFocus&&<BlockDialog block={blockFocus} task={task} tasks={data.taskDefinitions} onClose={()=>setBlockFocus(null)} onTask={openBlockAction} onBuilding={b=>{setBlockFocus(null);setFocus(b)}}/>}
  {focus&&<BuildingDialog building={focus} task={task} tasks={data.taskDefinitions} onClose={()=>{request.current++;setOpening(false);setFocus(null)}} onAction={openAction}/>}
  {selected&&<Suspense fallback={<p className="detail-loading" role="status">Abriendo indicación…</p>}><CellDialog key={selected.cell.key} selected={selected} onClose={()=>setSelected(null)}/></Suspense>}
 </main>
}
createRoot(document.getElementById('root')).render(<Seguimiento/> )
