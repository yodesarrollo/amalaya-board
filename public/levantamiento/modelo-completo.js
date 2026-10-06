// Lightweight, precomputed geometry. The detailed world is only loaded through its explicit link.
const $=id=>document.getElementById(id),canvas=$('model'),ctx=canvas.getContext('2d');
let yaw=0,tilt=0,span=620,target=[-24,0,20],triangles=[],buildings=[],width=1,height=1,drag,frame=0,loadId=0;
const params=new URLSearchParams(location.search),requested=params.get('edificio')||'';
function updateSelection(id){const url=new URL(location.href);if(id)url.searchParams.set('edificio',id);else url.searchParams.delete('edificio');history.replaceState(null,'',url.pathname+url.search)}
function schedule(){if(!frame)frame=requestAnimationFrame(()=>{frame=0;render()})}
function render(){
 if(!ctx)return;const rect=canvas.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);const ratio=Math.min(1.5,devicePixelRatio||1),w=Math.round(width*ratio),h=Math.round(height*ratio);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}ctx.setTransform(ratio,0,0,ratio,0,0);ctx.fillStyle='#edf0e7';ctx.fillRect(0,0,width,height);
 const scale=Math.min(width,height)/span,cs=Math.cos(yaw),sn=Math.sin(yaw),ct=Math.cos(tilt),st=Math.sin(tilt);
 const project=p=>{const x=p[0]-target[0],y=p[1]-target[1],z=p[2]-target[2],r=sn*x+cs*z;return[(cs*x-sn*z)*scale+width/2,(ct*r-st*y)*scale+height/2,st*r+ct*y]};
 const visible=[];for(const t of triangles){const a=project(t[0]),b=project(t[1]),c=project(t[2]);if(Math.max(a[0],b[0],c[0])<0||Math.min(a[0],b[0],c[0])>width||Math.max(a[1],b[1],c[1])<0||Math.min(a[1],b[1],c[1])>height)continue;visible.push([a,b,c,t[3],(a[2]+b[2]+c[2])/3])}visible.sort((a,b)=>a[4]-b[4]);
 for(const[a,b,c,fill]of visible){ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.closePath();ctx.fill()}
 ctx.fillStyle='#3c5b48';ctx.font='11px system-ui';ctx.fillText(`Vista simplificada · ${Math.round(100/scale)} m por 100 px`,16,24);
}
function choose(id){
 $('building').value=id;const b=buildings.find(b=>b.id===id);$('detail').replaceChildren();
 if(!b){target=[-24,0,20];span=620;$('detail').textContent='Elige un edificio para ubicarlo y ver su imagen.';updateSelection('');schedule();return}
 const title=document.createElement('strong');title.textContent=b.id+' · '+b.name;const link=document.createElement('a');link.href='./';link.textContent='Volver al board Amalaya ↗';$('detail').append(title,link);
 if(b.image){const im=document.createElement('img');im.src=b.image;im.alt='Última imagen de '+b.id;im.loading='lazy';im.decoding='async';$('detail').append(im)}
 if(b.camera?.target){target=b.camera.target;span=Math.max(45,b.camera.span||85)}else{target=[-24,0,20];span=620}
 updateSelection(id);schedule();
}
function mode(plan){tilt=plan?0:.82;if(plan)yaw=0;$('plan').setAttribute('aria-pressed',String(plan));$('iso').setAttribute('aria-pressed',String(!plan));schedule()}
$('all').onclick=()=>choose('');$('building').onchange=e=>choose(e.target.value);$('plan').onclick=()=>mode(true);$('iso').onclick=()=>mode(false);$('rotate').onclick=()=>{yaw+=Math.PI/4;schedule()};$('plus').onclick=()=>{span=Math.max(15,span*.8);schedule()};$('minus').onclick=()=>{span=Math.min(1400,span/.8);schedule()};
canvas.addEventListener('wheel',e=>{e.preventDefault();span=Math.max(15,Math.min(1400,span*Math.exp(e.deltaY*.001)));schedule()},{passive:false});
canvas.onpointerdown=e=>{drag=[e.clientX,e.clientY,...target];canvas.setPointerCapture(e.pointerId)};canvas.onpointerup=canvas.onpointercancel=()=>drag=null;canvas.onlostpointercapture=()=>drag=null;
canvas.onpointermove=e=>{if(!drag)return;const scale=Math.min(width,height)/span,dx=(e.clientX-drag[0])/scale,dz=(e.clientY-drag[1])/scale/Math.max(.4,Math.cos(tilt));target=[drag[2]-Math.cos(yaw)*dx-Math.sin(yaw)*dz,drag[3],drag[4]+Math.sin(yaw)*dx-Math.cos(yaw)*dz];schedule()};
new ResizeObserver(schedule).observe(canvas.parentElement);
async function load(){
 const id=++loadId,control=new AbortController(),timeout=setTimeout(()=>control.abort(),15000);$('retry').hidden=true;$('error').textContent='';$('status').textContent='Abriendo vista ligera…';
 try{
  if(!ctx)throw Error('Este navegador no permite mostrar el plano.');
  const get=async(url,type='json')=>{const r=await fetch(url,{signal:control.signal,cache:type==='arrayBuffer'?'force-cache':'no-cache'});if(!r.ok)throw Error('La conexión no completó la descarga.');return r[type]()};
  const [board,meta]=await Promise.all([get('seguimiento-ligero.json'),get('levantamiento/modelo-ligero.json')]);
  const buffer=await get(meta.url,'arrayBuffer');if(id!==loadId)return;if(buffer.byteLength!==meta.triangles*20)throw Error('La vista llegó incompleta.');
  const view=new DataView(buffer);triangles=[];for(let i=0;i<meta.triangles;i++){const p=[];for(let v=0;v<3;v++)p.push([0,1,2].map(c=>view.getInt16(i*20+(v*3+c)*2,true)*meta.scale));triangles.push([...p,meta.palette[view.getUint16(i*20+18,true)]])}
  buildings=board.buildings;$('count').textContent=buildings.filter(b=>!b.publicSpace).length+' edificios';$('building').replaceChildren(new Option('Todo el conjunto',''));for(const b of buildings)$('building').add(new Option(b.id+' · '+b.name,b.id));
  $('status').textContent='Vista ligera lista · arrastra para mover y usa + / − para acercar.';choose(requested);
 }catch(e){if(id!==loadId)return;$('error').textContent=e.name==='AbortError'?'La conexión está tardando. Reintenta o vuelve al tablero; tus avances están guardados.':e.message;$('status').textContent='No se completó la carga.';$('retry').hidden=false}
 finally{clearTimeout(timeout)}
}
if(params.get('vista')==='volumen')mode(false);
$('retry').onclick=load;load();
