import {lazy,Suspense,useCallback,useEffect,useRef,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {STATES,columns,cellInfo} from './seguimiento3d-model'
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
function Seguimiento(){
 const[data,setData]=useState(null),[error,setError]=useState(''),[refreshing,setRefreshing]=useState(false)
 const[task,setTask]=useState('street'),[filter,setFilter]=useState('pending'),[query,setQuery]=useState(''),[zone,setZone]=useState(''),[page,setPage]=useState(0),[focus,setFocus]=useState(null),[selected,setSelected]=useState(null),[opening,setOpening]=useState(false),[matrix,setMatrix]=useState(false)
 const full=useRef(null),initialized=useRef(false),request=useRef(0)
 const refresh=useCallback(async()=>{
  setRefreshing(true);const control=new AbortController(),timeout=setTimeout(()=>control.abort(),12000)
  try{const r=await fetch(`${BASE}seguimiento-ligero.json`,{cache:'no-cache',signal:control.signal});if(!r.ok)throw Error();const d=await r.json();setData(d);full.current=null;setError('');if(!initialized.current){initialized.current=true;const next=Object.keys(d.taskDefinitions).find(t=>d.buildings.some(b=>!b.publicSpace&&b.states[t]!=='done'));if(next)setTask(next)}}
  catch{setError('No pudimos actualizar. Puedes reintentar; el avance visible se conserva.')}
  finally{clearTimeout(timeout);setRefreshing(false)}
 },[])
 useEffect(()=>{refresh();const timer=setInterval(()=>{if(document.visibilityState==='visible')refresh()},120000);return()=>clearInterval(timer)},[refresh])
 useEffect(()=>setPage(0),[task,filter,query,zone])
 async function openAction(b,key){
  const n=++request.current;setOpening(true);setError('');const control=new AbortController(),timeout=setTimeout(()=>control.abort(),12000)
  try{if(!full.current){const r=await fetch(`${BASE}seguimiento-3d.json`,{cache:'no-cache',signal:control.signal});if(!r.ok)throw Error();full.current=await r.json()};if(n!==request.current)return;const column=columns(full.current).find(c=>c.building.id===b.id);if(!column)throw Error();setFocus(null);setSelected({column,cell:cellInfo(column,key),label:full.current.taskDefinitions[key]})}
  catch{setError('No cargó el detalle. Intenta abrirlo otra vez.');setFocus(null)}finally{clearTimeout(timeout);if(n===request.current)setOpening(false)}
 }
 const buildings=data?.buildings||[],physical=buildings.filter(b=>!b.publicSpace),total=physical.length,done=physical.filter(b=>b.states[task]==='done').length
 const filtered=buildings.filter(b=>(!zone||b.block===zone)&&(!query||clean(b.id+' '+b.name+' '+b.zone).includes(clean(query)))&&(filter==='all'||(filter==='pending'?b.states[task]!=='done':filter==='blocked'?b.states[task]==='blocked':b.states[task]==='done')))
 const pages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE)),actualPage=Math.min(page,pages-1),visible=filtered.slice(actualPage*PAGE_SIZE,(actualPage+1)*PAGE_SIZE)
 const planned=physical.filter(b=>b.states.plan==='done').length
 return <main className="flow-page">
  <header className="flow-header"><a href={`${BASE}explorar.html`} className="brand">Amalaya<span>Avance del levantamiento</span></a><nav><a className="model-link" href={`${BASE}modelo-completo.html`}>Ver conjunto ↗</a><button className="quiet" onClick={refresh} disabled={refreshing} aria-label="Actualizar estados">{refreshing?'Actualizando…':'↻ Actualizar'}</button></nav></header>
  <section className="flow-hero"><div><span className="eyebrow">UN PASO A LA VEZ</span><h1>{data?`${planned} plantas listas.`:'Tu proyecto, más claro.'}<br/><span>{data&&planned===total?'Sigamos con las calles.':'Avanzamos edificio por edificio.'}</span></h1><p>Elige una etapa y un edificio. Revisa el avance o deja una indicación en ese punto.</p><button className="primary" onClick={()=>{setTask('street');setFilter('pending');setQuery('');setZone('');document.getElementById('work-area')?.scrollIntoView({behavior:'smooth'})}}>Continuar con calles →</button></div><a className="overview-card" href={`${BASE}modelo-completo.html`}><span className="overview-icon" aria-hidden="true">▦</span><strong>Todo Amalaya</strong><span>{data?`${total} edificios y la plaza`:'Vista del conjunto'}</span><b>Abrir vista ligera ↗</b></a></section>
  <section id="work-area" className="work-area" aria-label="Edificios por etapa">
   <div className="stage-heading"><div><label htmlFor="stage">¿Qué estamos trabajando?</label><select id="stage" value={task} onChange={e=>{setTask(e.target.value);setFilter('all')}}>{Object.entries(data?.taskDefinitions||NAMES).map(([key],i)=><option key={key} value={key}>{i+1}. {NAMES[key]||key}</option>)}</select></div><div className="stage-count"><strong>{done}<span> / {total}</span></strong><span>edificios listos en esta etapa</span><progress max={total||1} value={done} aria-label="Avance de la etapa"/></div></div>
   <div className="flow-filters"><label className="search"><span className="sr-only">Buscar edificio</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar nombre o código…"/></label><label><span className="sr-only">Filtrar zona</span><select aria-label="Filtrar zona" value={zone} onChange={e=>setZone(e.target.value)}><option value="">Todas las zonas</option>{[...new Map(buildings.map(b=>[b.block,b.zone])).entries()].map(([id,name])=><option key={id} value={id}>{id} · {name}</option>)}</select></label></div>
   <div className="filter-tabs" role="group" aria-label="Filtrar estado">{[['pending','Por hacer'],['all','Todos'],['blocked','Con problema'],['done','Listos']].map(([key,label])=><button key={key} aria-pressed={filter===key} onClick={()=>setFilter(key)}>{label}</button>)}<span aria-live="polite">{filtered.length} resultados</span></div>
   {error&&<p className="flow-error" role="alert">{error} <button onClick={refresh}>Reintentar</button></p>}
   {opening&&<p role="status">Abriendo detalle…</p>}
   {!data&&<div className="loading-cards" role="status"><p>{error?'Reintenta la carga con el botón de arriba.':'Cargando el resumen del proyecto…'}</p>{!error&&[0,1,2].map(n=><div key={n}/>)}</div>}
   {data&&!filtered.length&&<div className="empty"><h2>{filter==='pending'?'No hay pendientes en esta selección.':'No encontramos edificios.'}</h2><button onClick={()=>{setQuery('');setZone('');setFilter('all')}}>Ver todos</button></div>}
   <div className="building-grid">{visible.map((b,i)=><button className="building-card" key={b.id} onClick={()=>setFocus(b)} aria-label={`Abrir ${b.id}: ${b.name}`}><div className="card-image">{b.image?<img src={BASE+b.image} alt="" loading={i<3?'eager':'lazy'} decoding="async" width="320" height="180"/>:<span aria-hidden="true">▦</span>}<span className={'status-pill s-'+b.states[task]}>{stateName(b.states[task])}</span></div><div className="card-body"><span className="eyebrow">{b.id}</span><h3>{b.name}</h3><span className="card-action">Ver {NAMES[task]?.toLowerCase()} <b>→</b></span></div></button>)}</div>
   {data&&filtered.length>0&&<div className="pagination"><button disabled={actualPage===0} onClick={()=>setPage(actualPage-1)}>← Anterior</button><span>Página {actualPage+1} de {pages}</span><button disabled={actualPage>=pages-1} onClick={()=>setPage(actualPage+1)}>Siguiente →</button></div>}
  </section>
  {data&&<section className="advanced"><button className="quiet" aria-expanded={matrix} onClick={()=>setMatrix(!matrix)}>{matrix?'Ocultar':'Mostrar'} matriz avanzada de esta página</button>{matrix&&<div className="tracker-table-scroll"><table className="tracker-matrix"><thead><tr><th>Etapa</th>{visible.map(b=><th key={b.id}>{b.id}</th>)}</tr></thead><tbody>{Object.keys(data.taskDefinitions).map(t=><tr key={t}><th>{NAMES[t]}</th>{visible.map(b=><td key={b.id}><button className={'tracker-cell state-'+b.states[t]} aria-label={`${b.id}: ${NAMES[t]} — ${stateName(b.states[t])}`} onClick={()=>openAction(b,t)}>{STATES[b.states[t]]?.symbol||'·'}</button></td>)}</tr>)}</tbody></table></div>}</section>}
  <footer className="flow-footer"><span>Las plantas son aproximaciones visuales. Alturas y fachadas siguen su propia etapa.</span>{data&&<span>Datos del {new Intl.DateTimeFormat('es-MX',{dateStyle:'short',timeZone:'America/Hermosillo'}).format(new Date(data.updatedAt))} · Actualización ligera cada 2 min</span>}<a href={`${BASE}seguimiento-3d.md`} target="_blank" rel="noreferrer">Registro completo ↗</a></footer>
  {focus&&<BuildingDialog building={focus} task={task} tasks={data.taskDefinitions} onClose={()=>{request.current++;setOpening(false);setFocus(null)}} onAction={openAction}/>}
  {selected&&<Suspense fallback={<p className="detail-loading" role="status">Abriendo indicación…</p>}><CellDialog key={selected.cell.key} selected={selected} onClose={()=>setSelected(null)}/></Suspense>}
 </main>
}
createRoot(document.getElementById('root')).render(<Seguimiento/> )
