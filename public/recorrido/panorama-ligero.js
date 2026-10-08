// Perspective sampling of the existing equirectangular photographs, without WebGL.
export function panoramaPixels(source,width,height,yaw=0,pitch=-.16,fov=100){
 const out=new Uint8ClampedArray(width*height*4),f=width/(2*Math.tan(fov*Math.PI/360)),cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const vx=(x+.5-width/2)/f,vy=(height/2-y-.5)/f,py=vy*cp+sp,pz=vy*sp-cp;
  const px=vx*cy-pz*sy,pzz=vx*sy+pz*cy,n=Math.hypot(vx,vy,1);
  const u=((.5+Math.atan2(px,-pzz)/(2*Math.PI))%1+1)%1,v=Math.max(0,Math.min(.999999,.5-Math.asin(py/n)/Math.PI));
  const i=(Math.floor(v*source.height)*source.width+Math.floor(u*source.width))*4,j=(y*width+x)*4;
  out[j]=source.data[i];out[j+1]=source.data[i+1];out[j+2]=source.data[i+2];out[j+3]=255;
 }
 return out;
}
export async function iniciarPanoramaLigero(){
 const old=document.getElementById('c'),canvas=old.cloneNode();old.replaceWith(canvas);canvas.style.cssText='width:100%;height:100%;touch-action:none';
 const ctx=canvas.getContext('2d'),params=new URLSearchParams(location.search),slider=document.getElementById('mezcla'),estado=document.getElementById('estado');
 document.querySelector('.mini').hidden=true;document.querySelector('.brujula').style.display='none';
 for(const id of ['bAuto','bAccion','bExportar'])document.getElementById(id).style.display='none';
 const bar=document.createElement('div');bar.style.cssText='position:fixed;left:12px;right:12px;bottom:80px;z-index:7;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap';
 const previous=document.createElement('button'),next=document.createElement('button'),label=document.createElement('span'),google=document.createElement('a');
 previous.textContent='← Anterior';next.textContent='Siguiente →';google.textContent='Abrir Street View ↗';google.className='b';google.target='_blank';google.rel='noreferrer';label.style.cssText='font:12px system-ui;background:#141010db;padding:9px;border-radius:8px';
 bar.append(previous,label,next,google);document.body.append(bar);
 let routes=[],route,index=0,yaw=0,pitch=-.16,fov=100,before,after,request=0,queued=false,drag=null;
 const renders=new Map();slider.disabled=true;estado.textContent='Cargando panorama…';
 function draw(){queued=false;if(!before||!ctx)return;const w=Math.min(640,Math.max(160,canvas.clientWidth)),h=Math.min(640,Math.max(120,Math.round(w*canvas.clientHeight/Math.max(1,canvas.clientWidth))));canvas.width=w;canvas.height=h;
  const a=panoramaPixels(before,w,h,yaw,pitch,fov),mix=Number(slider.value)/100;
  if(after&&mix){const b=panoramaPixels(after,w,h,yaw,pitch,fov);for(let i=0;i<a.length;i++)a[i]=Math.round(a[i]*(1-mix)+b[i]*mix);}
  ctx.putImageData(new ImageData(a,w,h),0,0);
 }
 const paint=()=>{if(!queued){queued=true;requestAnimationFrame(draw)}};
 function imageData(url){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{try{const c=document.createElement('canvas');c.width=2048;c.height=1024;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0,c.width,c.height);resolve(g.getImageData(0,0,c.width,c.height));}catch(e){reject(e)}};img.onerror=()=>reject(Error('No se pudo abrir la fotografía.'));img.src=url;});}
 function sourceLink(){const p=route.puntos[index],u=new URL('https://www.google.com/maps/');u.search=new URLSearchParams({api:'1',map_action:'pano',viewpoint:`${p.lat},${p.lng}`,heading:String((yaw*180/Math.PI+360)%360)});google.href=u.href;}
 function updateAfter(data){after=data;slider.disabled=!after;slider.value=after&&window.amalayaVersion==='amalaya'?100:0;estado.textContent=after?'Panorama ligero · antes y después':'Panorama ligero · arrastra para mirar';paint();}
 async function go(i,orient=true){
  const token=++request;index=Math.max(0,Math.min(route.puntos.length-1,i));const p=route.puntos[index],q=route.puntos[index+1]||route.puntos[index-1];
  if(orient&&q)yaw=Math.atan2((q.lng-p.lng)*97200,(q.lat-p.lat)*110950);
  previous.disabled=index===0;next.disabled=index===route.puntos.length-1;label.textContent=`${route.nombre} · ${index+1}/${route.puntos.length}`;sourceLink();
  document.getElementById('titulo').firstChild.textContent=p.nombre;document.getElementById('sub').textContent=label.textContent;estado.textContent='Cargando panorama…';
  const url=new URL(location.href);url.searchParams.set('r',route.id);url.searchParams.set('p',p.id);history.replaceState(null,'',url);
  if(parent!==window)parent.postMessage({tipo:'recorrido360',ruta:route.id,punto:p.id,lat:p.lat,lng:p.lng,orden:p.orden},location.origin);
  // Clear the preceding point immediately so a late/failed load cannot display the wrong street.
  before=null;after=null;ctx?.clearRect(0,0,canvas.width,canvas.height);slider.disabled=true;
  try{const data=await imageData(encodeURIComponent(p.id)+'.jpg');if(token!==request)return;before=data;updateAfter(renders.get(p.id));
   if(!after){const response=await fetch('despues/'+encodeURIComponent(p.id)+'.jpg');if(response.ok){const blob=URL.createObjectURL(await response.blob());try{const data=await imageData(blob);if(token===request)updateAfter(data)}finally{URL.revokeObjectURL(blob)}}}
  }catch{if(token===request)estado.textContent=before?'Panorama ligero · arrastra para mirar':'Fotografía no disponible · abre Street View';}
 }
 previous.onclick=()=>go(index-1);next.onclick=()=>go(index+1);slider.oninput=paint;
 canvas.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY,yaw,pitch};canvas.setPointerCapture(e.pointerId)};
 canvas.onpointermove=e=>{if(!drag)return;yaw=drag.yaw-(e.clientX-drag.x)*.004;pitch=Math.max(-1.2,Math.min(1.2,drag.pitch+(e.clientY-drag.y)*.003));paint();};
 canvas.onpointerup=canvas.onpointercancel=()=>{drag=null;if(route)sourceLink()};
 canvas.addEventListener('wheel',e=>{e.preventDefault();fov=Math.max(55,Math.min(110,fov+e.deltaY*.03));paint()},{passive:false});addEventListener('resize',paint);
 addEventListener('message',async e=>{
  if(e.origin!==location.origin||e.source!==parent)return;const d=e.data||{};
  if(d.tipo==='ir360'){const r=routes.find(r=>r.id===d.ruta&&r.puntos.some(p=>p.id===d.punto));if(r){route=r;document.getElementById('selRuta').value=r.id;go(r.puntos.findIndex(p=>p.id===d.punto));}}
  if(d.tipo==='version360'){if(Number.isFinite(d.heading))yaw=d.heading*Math.PI/180;if(['actual','amalaya'].includes(d.version))window.amalayaVersion=d.version;slider.value=after&&window.amalayaVersion==='amalaya'?100:0;paint();if(route)sourceLink();}
  if(d.tipo==='render360'&&typeof d.dataUrl==='string'&&d.dataUrl.startsWith('data:image/')){try{const data=await imageData(d.dataUrl);renders.set(d.punto,data);if(route?.puntos[index]?.id===d.punto)updateAfter(data)}catch{}}
 });
 try{const response=await fetch('rutas.json');if(!response.ok)throw Error();routes=(await response.json()).rutas;route=routes.find(r=>r.id===params.get('r'))||routes.find(r=>r.puntos.some(p=>p.id===params.get('p')))||routes[0];
  const select=document.getElementById('selRuta');select.replaceChildren(...routes.map(r=>new Option(r.nombre,r.id)));select.value=route.id;select.onchange=()=>{route=routes.find(r=>r.id===select.value);go(0)};
  await go(Math.max(0,route.puntos.findIndex(p=>p.id===params.get('p'))));if(parent!==window)parent.postMessage({tipo:'amalaya:360-ready'},location.origin);
 }catch{estado.textContent='No se pudo abrir el recorrido. Recarga para reintentar.';previous.disabled=next.disabled=true;google.style.display='none';}
}
