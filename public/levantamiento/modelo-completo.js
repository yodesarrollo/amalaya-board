import {createDepthFrame,drawDepthFrame} from './depth-raster.js?v=20261007a';
import { GROUND_REFERENCE } from './ground-reference-data.js';
import { FRONT_BUILDINGS } from './paramento-data.js';
import { labelAtPoint, createLabelTap } from './label-interaction.js';
// Lightweight, precomputed geometry. The detailed world is only loaded through its explicit link.
const $=id=>document.getElementById(id),canvas=$('model'),ctx=canvas.getContext('2d');
let groundImage=null,depthFrame=null,depthImage=null,scenario="actual",actualTriangles=0;
const faceCanvas=document.createElement('canvas'),faceContext=faceCanvas.getContext('2d');
let yaw=-.314,tilt=0,span=620,target=[-24,0,20],triangles=[],buildings=[],width=1,height=1,drag,frame=0,loadId=0;
let identification=null,visibleLabelHits=[];
const labelTap=createLabelTap();
const palette=['#db594c','#e39c36','#a68d36','#5e9b70','#348e97','#4c83b7','#7969ae','#bd6f9e','#bd7650','#758f49','#468f80','#a75a70'];
// Split only clearly distinguishable visual frontages already modelled and photographed.
// The parent ID remains linked to its original record; numbers do not imply ownership.
const EB_SW_PARTS=[
 {id:'EB-SW',part:'barra',name:'La Barra Hidalgo'},
 {id:'EB-SW-CLUB',part:'club',name:'Club Obregón'},
 {id:'EB-SW-COLEGIO',part:'colegio',name:'El Colegio'},
];
function roofPoint(part){const b=FRONT_BUILDINGS.find(v=>v.id==='EB-SW'&&v.part===part);if(!b)return null;return b.points.reduce((acc,p)=>[acc[0]+p[0]/b.points.length,acc[1]+p[1]/b.points.length],[0,0]);}
function makeIdentification(registry,assignments,serials,anchors,addresses) {
 const blocks=[...registry.blocks].sort((a,b)=>a.displayNumber-b.displayNumber);
 const byId=new Map(assignments.assignments.map(a=>[a.buildingId,a])),colors=new Map();
 for(const block of blocks){const used=new Set((block.adjacentBlocks||[]).map(id=>colors.get(id)));colors.set(block.id,palette.find(color=>!used.has(color))||palette[0]);}
 return blocks.map(block=>({...block,color:colors.get(block.id),labels:[...block.buildingIds].sort().flatMap(id=>{
  const parent=byId.get(id);const variants=id==='EB-SW'?EB_SW_PARTS:[{id,name:buildings.find(item=>item.id===id)?.name||id}];
  return variants.map(variant=>{
   const n=serials.numbers[variant.id],point=variant.part?roofPoint(variant.part):(anchors.points[id]||parent?.pointLocal);
   if(!n||!point)return {id:variant.id,n:n||'?',name:variant.name,unlocated:true};
   const [x,z]=point;let top=-Infinity;
   for(const [p,q,r] of triangles.slice(0,actualTriangles)){
    const det=(q[2]-r[2])*(p[0]-r[0])+(r[0]-q[0])*(p[2]-r[2]);if(Math.abs(det)<1e-6)continue;
    const u=((q[2]-r[2])*(x-r[0])+(r[0]-q[0])*(z-r[2]))/det,v=((r[2]-p[2])*(x-r[0])+(p[0]-r[0])*(z-r[2]))/det;
    if(u>=-1e-6&&v>=-1e-6&&u+v<=1.000001){const y=u*p[1]+v*q[1]+(1-u-v)*r[1];if(y>top)top=y;}
   }
   const address=addresses.registros[variant.id]||null;
   return {id:variant.id,parentId:id,n,name:address?.nombre||variant.name,address,x,z,y:top>0.5||(address?.tipo==='recinto_abierto'&&top>=0)?top:null,review:parent?.geometryReviewPending};
  });
 })}));
}
function focusBlock(block){
 const pts=block.boundaryLocal.coordinates.flat(block.boundaryLocal.type==='MultiPolygon'?2:1),xs=pts.map(p=>p[0]),zs=pts.map(p=>p[1]);
 if(!pts.length)return;target=[(Math.min(...xs)+Math.max(...xs))/2,0,(Math.min(...zs)+Math.max(...zs))/2];span=Math.max(45,Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...zs)-Math.min(...zs))*1.35);canvas.dataset.focusBlock=block.id;
 $('detail').textContent=`Cuadra ${block.displayNumber} · ${block.name}`;schedule();
}
function historicalNotice(id){
 if(id!=='B1-03')return;
 const note=document.createElement('span');note.className='identify-alert';note.style.display='block';
 note.textContent='Reconstrucción histórica aproximada: se reportó una demolición en 2026. El estado actual y la correspondencia del edificio requieren verificación.';
 $('detail').append(note);
}
function focusLabel(label){if(label.unlocated||label.y===null)return;target=[label.x,0,label.z];span=55;canvas.dataset.focusLabel=label.id;$('detail').textContent=`${label.n} · ${label.name} · ${label.address?.direccion||'Dirección por verificar'}`;historicalNotice(label.id);schedule();}
function showBlockEntry(block){
 const entry=document.querySelector(`[data-block="${block.id}"]`);if(!entry)return;
 document.querySelector('#building-panel').open=true;entry.open=true;entry.querySelector('summary')?.scrollIntoView({block:'start'});
}

function identificationDraw(project){
 visibleLabelHits=[];if(!identification)return;
 for(const b of identification){const polygons=b.boundaryLocal.type==='MultiPolygon'?b.boundaryLocal.coordinates:[b.boundaryLocal.coordinates];ctx.beginPath();for(const polygon of polygons)for(const ring of polygon){ring.forEach(([x,z],i)=>{const p=project([x,.1,z]);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])});ctx.closePath()}ctx.fillStyle=b.color;ctx.globalAlpha=.06;ctx.fill('evenodd');ctx.globalAlpha=.9;ctx.strokeStyle=b.color;ctx.lineWidth=2;ctx.stroke();}
 ctx.globalAlpha=1;const shown=[];ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 11px system-ui';
 for(const b of identification)for(const a of b.labels){if(a.y===null||a.unlocated)continue;const [x,y]=project([a.x,a.y+1,a.z]);if(x<0||y<0||x>width||y>height||shown.some(p=>Math.abs(x-p[0])<24&&Math.abs(y-p[1])<20))continue;shown.push([x,y]);const label=String(a.n),r=Math.max(11,ctx.measureText(label).width/2+5);visibleLabelHits.push({x,y,radius:r+4,value:a});ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=b.color;ctx.fill();ctx.strokeStyle='white';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='white';ctx.fillText(label,x,y+.5);}
 canvas.dataset.visibleLabels=String(shown.length);
}
function identificationPanel(){
 const panel=document.getElementById('identification-list');if(!panel||!identification)return;
 panel.replaceChildren();for(const b of identification){
  const d=document.createElement('details');d.dataset.block=b.id;const summary=document.createElement('summary');summary.textContent=`Cuadra ${b.displayNumber} (${b.id})`;summary.style.borderLeft=`10px solid ${b.color}`;summary.style.paddingLeft='7px';d.append(summary);
  const streets=(b.nearbyStreets||[]).filter(s=>s.toLowerCase()!=='centro').map(s=>s.replace(/Surfragio/gi,'Sufragio').replace(/No Releccion/gi,'No Reelección'));
  if(streets.length){const nearby=document.createElement('p');nearby.className='identify-address';nearby.textContent=`Calles de referencia cercanas: ${streets.join(' · ')}. No indican el frente ni el número de cada edificio.`;d.append(nearby);}
  if(b.inventoryEvidence){const reference=document.createElement('a');reference.href=b.inventoryEvidence;reference.target='_blank';reference.rel='noreferrer';reference.className='identify-address';reference.textContent='Ver imagen aérea de referencia ↗';d.append(reference);}
  const zoom=document.createElement('button');zoom.type='button';zoom.className='identify-focus';zoom.textContent=`Ver cuadra ${b.displayNumber}`;zoom.onclick=()=>focusBlock(b);d.append(zoom);
  if(b.id==='C02'){
   const note=document.createElement('p');note.className='identify-alert';note.textContent='Cuadra 4: reconstrucción visual aproximada. El cuerpo de Rosales y Obregón se representa con referencia histórica; se reportó una demolición en 2026 y su estado actual requiere verificación.';
   const link=document.createElement('a');link.href='https://www.radiosonora.com.mx/derribo-de-inmueble-dara-paso-a-ampliacion-del-bulevar-hidalgo/';link.target='_blank';link.rel='noreferrer';link.textContent='Ver reporte del 30 de agosto de 2026';note.append(document.createElement('br'),link);d.append(note);
  }
  const list=document.createElement('div');list.className='identify-rows';for(const a of b.labels){const row=document.createElement('div');row.className='identify-row';const btn=document.createElement('button');btn.type='button';btn.dataset.building=a.id;btn.disabled=a.unlocated||a.y===null;btn.textContent=`${a.n} · ${a.name}${a.review?' ⚠':''}${btn.disabled?' · ubicación por confirmar':''}`;btn.onclick=()=>focusLabel(a);row.append(btn);const info=document.createElement('p');info.className='identify-address';if(a.address){info.textContent=`${a.address.direccion} · ${a.address.estado}. `;const source=document.createElement('a');source.href=a.address.fuente;source.target='_blank';source.rel='noreferrer';source.textContent='Fuente';info.append(source)}else info.textContent='Dirección por verificar';row.append(info);list.append(row)}d.append(list);panel.append(d);
 }
}

const params=new URLSearchParams(location.search),requested=params.get('edificio')||'',requestedBlock=params.get('cuadra')||'';
if(params.get('host')==='1'){
 const panel=$('building-panel');const reportPanel=()=>parent.postMessage({type:'amalaya:panel',open:panel.open},location.origin);
 panel.addEventListener('toggle',reportPanel);reportPanel();
}
function updateSelection(id){const url=new URL(location.href);if(id)url.searchParams.delete('cuadra');if(id)url.searchParams.set('edificio',id);else url.searchParams.delete('edificio');history.replaceState(null,'',url.pathname+url.search)}
function report(){canvas.dataset.yaw=yaw.toFixed(4);canvas.dataset.tilt=tilt.toFixed(4);canvas.dataset.span=span.toFixed(2);canvas.dataset.center=target.join(',');canvas.dataset.faces=String(triangles.length)}
function schedule(){report();if(!frame)frame=requestAnimationFrame(()=>{frame=0;render()})}
function render(){
 if(!ctx)return;const rect=canvas.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);const ratio=Math.min(1.5,devicePixelRatio||1,Math.sqrt(1200000/(width*height))),w=Math.round(width*ratio),h=Math.round(height*ratio);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}ctx.setTransform(ratio,0,0,ratio,0,0);ctx.fillStyle='#edf0e7';ctx.fillRect(0,0,width,height);
 const scale=Math.min(width,height)/span,cs=Math.cos(yaw),sn=Math.sin(yaw),ct=Math.cos(tilt),st=Math.sin(tilt);
 const project=p=>{const x=p[0]-target[0],y=p[1]-target[1],z=p[2]-target[2],r=sn*x+cs*z;return[(cs*x-sn*z)*scale+width/2,(ct*r-st*y)*scale+height/2,st*r+ct*y]};
 if(groundImage){
  const [west,south,east,north]=GROUND_REFERENCE.bounds,local=(lng,lat)=>[(lng-GROUND_REFERENCE.origin.lon)*97200,-.025,(GROUND_REFERENCE.origin.lat-lat)*110950];
  const a=project(local(west,north)),b=project(local(east,north)),c=project(local(west,south));
  ctx.save();ctx.transform((b[0]-a[0])/groundImage.width,(b[1]-a[1])/groundImage.width,(c[0]-a[0])/groundImage.height,(c[1]-a[1])/groundImage.height,a[0],a[1]);ctx.drawImage(groundImage,0,0);ctx.restore();
 }
 if(!depthFrame||depthFrame.width!==w||depthFrame.height!==h){depthFrame=createDepthFrame(w,h);depthImage=new ImageData(depthFrame.pixels,w,h);faceCanvas.width=w;faceCanvas.height=h;}
 drawDepthFrame(depthFrame,scenario==="amalaya"?triangles:triangles.slice(0,actualTriangles||triangles.length),p=>{const v=project(p);return[v[0]*ratio,v[1]*ratio,v[2]]});
 faceContext.putImageData(depthImage,0,0);ctx.drawImage(faceCanvas,0,0,w,h,0,0,width,height);
 identificationDraw(project);
 ctx.fillStyle='#3c5b48';ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.font='11px system-ui';ctx.fillText(`Esri World Imagery · Vista simplificada · ${Math.round(100/scale)} m por 100 px`,16,24);
}
function overviewSpan(){const rect=canvas.getBoundingClientRect();return rect.height<400&&rect.width>rect.height?340:500;}
function choose(id){
 $('building').value=id;const b=buildings.find(b=>b.id===id);$('detail').replaceChildren();
 if(!b){target=[-24,0,20];span=overviewSpan();$('detail').textContent='Elige un edificio para ubicarlo y ver su imagen.';updateSelection('');schedule();return}
 const title=document.createElement('strong');title.textContent=b.id+' · '+b.name;const link=document.createElement('a');link.href='./';link.textContent='Volver al board Amalaya ↗';$('detail').append(title,link);
 historicalNotice(b.id);
 if(b.address){const info=document.createElement('p');info.textContent=[b.address.direccion,b.address.estado].filter(Boolean).join(' · ');$('detail').append(info);if(b.address.fuente){const source=document.createElement('a');source.href=b.address.fuente;source.target='_blank';source.rel='noreferrer';source.textContent='Consultar fuente de la dirección ↗';$('detail').append(source)}}
 if(b.image){const im=document.createElement('img');im.src=b.image;im.alt='Última imagen de '+b.id;im.loading='lazy';im.decoding='async';$('detail').append(im)}
 if(b.camera?.target){target=b.camera.target;span=Math.max(45,b.camera.span||85)}else{target=[-24,0,20];span=620}
 updateSelection(id);schedule();
}
function mode(plan){tilt=plan?0:.82;if(plan)yaw=0;$('plan').setAttribute('aria-pressed',String(plan));$('iso').setAttribute('aria-pressed',String(!plan));schedule()}
$('all').onclick=()=>choose('');$('building').onchange=e=>choose(e.target.value);$('plan').onclick=()=>mode(true);$('iso').onclick=()=>mode(false);$('rotate').onclick=()=>{yaw+=Math.PI/4;schedule()};$('plus').onclick=()=>{span=Math.max(15,span*.8);schedule()};$('minus').onclick=()=>{span=Math.min(1400,span/.8);schedule()};
canvas.addEventListener('wheel',e=>{e.preventDefault();span=Math.max(15,Math.min(1400,span*Math.exp(e.deltaY*.001)));schedule()},{passive:false});
const touches=new Map();let pinch=null;
canvas.oncontextmenu=e=>e.preventDefault();
canvas.onpointerdown=e=>{if(e.button===0)labelTap.down(e.pointerId,e.clientX,e.clientY);touches.set(e.pointerId,[e.clientX,e.clientY]);if(touches.size===2){const [a,b]=[...touches.values()];pinch={distance:Math.hypot(a[0]-b[0],a[1]-b[1]),angle:Math.atan2(b[1]-a[1],b[0]-a[0]),span,yaw};}drag=[e.clientX,e.clientY,...target,e.button,yaw,tilt];canvas.setPointerCapture(e.pointerId)};
canvas.onpointerup=e=>{const tap=labelTap.up(e.pointerId,e.clientX,e.clientY);touches.delete(e.pointerId);pinch=null;drag=null;if(tap){const rect=canvas.getBoundingClientRect(),label=labelAtPoint(visibleLabelHits,e.clientX-rect.left,e.clientY-rect.top);if(label)focusLabel(label)}};
canvas.onpointercancel=e=>{labelTap.cancel(e.pointerId);touches.delete(e.pointerId);pinch=null;drag=null};canvas.onlostpointercapture=e=>{labelTap.cancel(e.pointerId);drag=null};
canvas.onpointermove=e=>{labelTap.move(e.pointerId,e.clientX,e.clientY);if(touches.has(e.pointerId))touches.set(e.pointerId,[e.clientX,e.clientY]);if(pinch&&touches.size===2){const [a,b]=[...touches.values()];const distance=Math.max(1,Math.hypot(a[0]-b[0],a[1]-b[1]));span=Math.max(15,Math.min(1400,pinch.span*pinch.distance/distance));yaw=pinch.yaw+Math.atan2(b[1]-a[1],b[0]-a[0])-pinch.angle;schedule();return;}if(!drag)return;if(drag[5]===2){yaw=drag[6]+(e.clientX-drag[0])*.006;tilt=Math.max(0,Math.min(1.3,drag[7]-(e.clientY-drag[1])*.004));schedule();return;}const scale=Math.min(width,height)/span,dx=(e.clientX-drag[0])/scale,dz=(e.clientY-drag[1])/scale/Math.max(.4,Math.cos(tilt));target=[drag[2]-Math.cos(yaw)*dx-Math.sin(yaw)*dz,drag[3],drag[4]+Math.sin(yaw)*dx-Math.cos(yaw)*dz];schedule()};
new ResizeObserver(schedule).observe(canvas.parentElement);
async function load(){
 const id=++loadId,control=new AbortController(),timeout=setTimeout(()=>control.abort(),15000);$('retry').hidden=true;$('error').textContent='';$('status').textContent='Abriendo vista ligera…';
 try{
  if(!ctx)throw Error('Este navegador no permite mostrar el plano.');
  const get=async(url,type='json')=>{const r=await fetch(url,{signal:control.signal,cache:type==='arrayBuffer'?'force-cache':'no-cache'});if(!r.ok)throw Error('La conexión no completó la descarga.');return r[type]()};
  const identify=params.get('identificar')==='1';const [board,meta,registry,assignments,serials,anchors,addresses]=await Promise.all([get('seguimiento-ligero.json'),get('levantamiento/modelo-ligero.json'),(requestedBlock||identify)?get('levantamiento/cuadras.json'):Promise.resolve(null),identify?get('levantamiento/cuadras/asignaciones.json'):Promise.resolve(null),identify?get('levantamiento/identificadores-provisionales.json'):Promise.resolve(null),identify?get('levantamiento/anclas-geometria-actual.json'):Promise.resolve(null),get('levantamiento/direcciones-referencias.json')]);
  const buffer=await get(meta.url,'arrayBuffer');if(id!==loadId)return;if(buffer.byteLength!==meta.triangles*20)throw Error('La vista llegó incompleta.');
  actualTriangles=meta.actualTriangles||meta.triangles;const view=new DataView(buffer);triangles=[];for(let i=0;i<meta.triangles;i++){const p=[];for(let v=0;v<3;v++)p.push([0,1,2].map(c=>view.getInt16(i*20+(v*3+c)*2,true)*meta.scale));triangles.push([...p,meta.palette[view.getUint16(i*20+18,true)]])}
  buildings=board.buildings.map(b=>({...b,name:addresses.registros[b.id]?.nombre||b.name,address:addresses.registros[b.id]||null}));if(identify){identification=makeIdentification(registry,assignments,serials,anchors,addresses);identificationPanel();document.body.dataset.identification='1';}$('count').textContent=buildings.filter(b=>!b.publicSpace).length+(identify?' registros':' edificios');$('building').replaceChildren(new Option('Todo el conjunto',''));for(const b of buildings)$('building').add(new Option(b.id+' · '+b.name,b.id));
  if(params.get('host')==='1')parent.postMessage({type:'amalaya:compatible-ready',faces:triangles.length},location.origin);
  $('status').textContent='Vista ligera lista · arrastra para mover y usa + / − para acercar.';choose(requested);
  if(requestedBlock&&registry){const block=registry.blocks.find(b=>b.id===requestedBlock);if(block){focusBlock(block);showBlockEntry(block);}}
 }catch(e){if(id!==loadId)return;$('error').textContent=e.name==='AbortError'?'La conexión está tardando. Reintenta o vuelve al tablero; tus avances están guardados.':e.message;$('status').textContent='No se completó la carga.';$('retry').hidden=false}
 finally{clearTimeout(timeout)}
}
if(params.get('vista')==='volumen')mode(false);
window.addEventListener('message',event=>{
 if(event.origin!==location.origin || event.source!==parent)return;
 const d=event.data;
 if(d?.type==='amalaya:focus-block'&&identification){const block=identification.find(b=>b.id===d.block);if(block){focusBlock(block);showBlockEntry(block);}}
 if(d?.type==='amalaya:camera'){
  if(d.action==='left')yaw-=Math.PI/8;
  if(d.action==='right')yaw+=Math.PI/8;
  if(d.action==='in')span=Math.max(15,span*.8);
  if(d.action==='out')span=Math.min(1400,span/.8);
  if(d.action==='center'){target=[-24,0,20];span=overviewSpan();yaw=-.314;}
  schedule();
 }
 if(d?.type==='amalaya:scenario'){scenario=d.version;canvas.dataset.scenario=scenario;$('status').textContent=scenario==='amalaya'?'Visión Amalaya · ensayo conceptual de sombra y estancia, pendiente de aprobación.':'Modelo compatible listo · arrastra para mover · + / − para acercar.';schedule();}
 if(d?.type==='amalaya:view'){mode(d.view==='planta');}
 if(d?.type==='amalaya:focus' && Number.isFinite(d.lat) && Number.isFinite(d.lng)){
  target=[(d.lng-GROUND_REFERENCE.origin.lon)*97200,0,(GROUND_REFERENCE.origin.lat-d.lat)*110950];span=140;if(Number.isFinite(d.heading))yaw=d.heading*Math.PI/180;mode(d.view==='planta');schedule();
 }
});

$('retry').onclick=load;load();

const ground=new Image();ground.decoding='async';ground.onload=()=>{groundImage=ground;schedule()};ground.src=new URL(GROUND_REFERENCE.image,import.meta.url).href+'?v='+GROUND_REFERENCE.imageSha256.slice(0,12);
