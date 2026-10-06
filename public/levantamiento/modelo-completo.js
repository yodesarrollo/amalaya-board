import {createWorld} from './world.js?v=ffbcdba9a0dd';

const $=id=>document.getElementById(id),canvas=$('model'),ctx=canvas.getContext('2d');
let yaw=.35,tilt=.82,span=510,target=[-24,0,20],triangles=[],board,buildings=[],world,width=1,height=1,drag;
const selected=new URLSearchParams(location.search).get('edificio')||'';
const colorCache=new Map();
function color(hex,shade){const key=hex+':'+shade.toFixed(2);if(!colorCache.has(key)){const n=parseInt(hex,16);colorCache.set(key,`rgb(${Math.round((n>>16)*shade)},${Math.round(((n>>8)&255)*shade)},${Math.round((n&255)*shade)})`);}return colorCache.get(key);}
function render(){
 if(!ctx)return;const rect=canvas.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);const ratio=Math.min(2,devicePixelRatio||1);canvas.width=width*ratio;canvas.height=height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.fillStyle='#e7eade';ctx.fillRect(0,0,width,height);
 const scale=Math.min(width,height*1.4)/span,cs=Math.cos(yaw),sn=Math.sin(yaw),ct=Math.cos(tilt),st=Math.sin(tilt);
 const project=p=>{const x=p[0]-target[0],y=p[1]-target[1],z=p[2]-target[2],r=sn*x+cs*z;return[(cs*x-sn*z)*scale+width/2,(ct*r-st*y)*scale+height/2,st*r+ct*y];};
 ctx.strokeStyle='#cdd5c5';ctx.lineWidth=.6;
 for(let i=-400;i<=400;i+=20){for(const line of [[[i,0,-350],[i,0,400]],[[-400,0,i],[400,0,i]]]){const a=project(line[0]),b=project(line[1]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}}
 const visible=[];
 for(const t of triangles){const a=project(t[0]),b=project(t[1]),c=project(t[2]);if(Math.max(a[0],b[0],c[0])<0||Math.min(a[0],b[0],c[0])>width||Math.max(a[1],b[1],c[1])<0||Math.min(a[1],b[1],c[1])>height)continue;visible.push([a,b,c,t[3],(a[2]+b[2]+c[2])/3]);}
 visible.sort((a,b)=>a[4]-b[4]);
 for(const[a,b,c,fill]of visible){ctx.fillStyle=fill;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.closePath();ctx.fill();}
 ctx.fillStyle='#143c34';ctx.font='12px system-ui';ctx.fillText(`Escala aproximada · ${Math.round(100/scale)} m por 100 px`,18,25);
}
function extract(){
 const Vector3=world.position.constructor,Matrix4=world.matrix.constructor;
 world.updateMatrixWorld(true);
 world.traverse(m=>{
  if(!m.isMesh||!m.visible||!m.geometry?.attributes.position)return;
  // Keep the actual architectural and ground meshes; omit tiny repeated foliage and furniture in this overview.
  if(/Icosahedron|Sphere|Torus|Tube|Cylinder/.test(m.geometry.type))return;
  const p=m.geometry.attributes.position;if(p.count>15000)return;
  const idx=m.geometry.index?.array||Array.from({length:p.count},(_,i)=>i),mats=Array.isArray(m.material)?m.material:[m.material];
  const matrix=new Matrix4(),instance=new Matrix4();
  for(let k=0;k<(m.isInstancedMesh?m.count:1);k++){
   if(m.isInstancedMesh){m.getMatrixAt(k,instance);matrix.multiplyMatrices(m.matrixWorld,instance);}else matrix.copy(m.matrixWorld);
   const pts=[];for(let i=0;i<p.count;i++)pts.push(new Vector3().fromBufferAttribute(p,i).applyMatrix4(matrix).toArray());
   for(let i=0;i<idx.length;i+=3){const vs=[pts[idx[i]],pts[idx[i+1]],pts[idx[i+2]]];if(vs.some(p=>!p.every(Number.isFinite))||vs.every(p=>p[1]>35)||vs.every(p=>p[1]<-.2))continue;
    const [a,b,c]=vs,u=b.map((x,j)=>x-a[j]),v=c.map((x,j)=>x-a[j]),normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],size=Math.hypot(...normal);if(size<.005)continue;
    const group=m.geometry.groups.find(g=>i>=g.start&&i<g.start+g.count),mat=mats[group?.materialIndex||0];if(mat?.visible===false)continue;
    triangles.push([...vs,color(mat?.color?.getHexString()||'c3bcab',.68+.32*Math.abs((normal[0]*-.3+normal[1]+normal[2]*.25)/(size*1.074)))]);
   }
  }
 });
}
async function choose(id){
 $('building').value=id;const b=buildings.find(b=>b.id===id);
 if(!b){target=[-24,0,20];span=510;history.replaceState(null,'',location.pathname);$('detail').textContent='Toda la lámina. Selecciona una columna para consultar su planta e imagen.';render();return;}
 $('detail').replaceChildren();const title=document.createElement('strong');title.textContent=b.id+' · '+b.name;const p=document.createElement('p');p.textContent=b.reviewDetails?.plan||b.taskDetails?.plan||'';$('detail').append(title,p);
 const progress=b.visualProgress;if(progress?.current){const im=document.createElement('img');im.src=progress.current.url;im.alt='Modelo de '+b.id;const a=document.createElement('a');a.href=progress.manifest;a.textContent='Abrir registro de la acción 1';a.target='_blank';$('detail').append(a,im);}
 try{const rec=await fetch(progress.manifest).then(r=>r.json());target=rec.camera?.target||rec.camera?.center||rec.current?.camera?.target||target;span=rec.camera?.span||75;}catch{/* Keep full view if an older record does not provide a camera. */}
 history.replaceState(null,'',id?'?edificio='+encodeURIComponent(id):location.pathname);render();
}
$('all').onclick=()=>choose('');$('building').onchange=e=>choose(e.target.value);$('plan').onclick=()=>{tilt=0;yaw=0;render();};$('iso').onclick=()=>{tilt=.82;render();};$('rotate').onclick=()=>{yaw+=Math.PI/4;render();};$('plus').onclick=()=>{span=Math.max(15,span*.8);render();};$('minus').onclick=()=>{span=Math.min(1400,span/ .8);render();};
canvas.addEventListener('wheel',e=>{e.preventDefault();span=Math.max(15,Math.min(1400,span*Math.exp(e.deltaY*.001)));render();},{passive:false});
canvas.onpointerdown=e=>{drag=[e.clientX,e.clientY,...target];canvas.setPointerCapture(e.pointerId);};canvas.onpointerup=()=>drag=null;canvas.onpointermove=e=>{if(!drag)return;const scale=Math.min(width,height*1.4)/span,dx=(e.clientX-drag[0])/scale,dz=(e.clientY-drag[1])/scale;target=[drag[2]-Math.cos(yaw)*dx-Math.sin(yaw)*dz,0,drag[4]+Math.sin(yaw)*dx-Math.cos(yaw)*dz];render();};new ResizeObserver(()=>render()).observe(canvas.parentElement);
try{
 board=await fetch('seguimiento-3d.json',{cache:'no-store'}).then(r=>r.json());buildings=board.blocks.flatMap(b=>b.buildings.length?b.buildings:[{...b,taskDetails:b.taskDetails}]);$('count').textContent=(buildings.length-1)+' edificios + plaza';for(const b of buildings){const o=document.createElement('option');o.value=b.id;o.textContent=b.id+' · '+b.name;$('building').append(o);}
 world=await createWorld('levantamiento/',undefined,'pilot',{overview:true});extract();if(!triangles.length)throw Error('No se recibió geometría visible.');
 $('status').textContent='Vista general del modelo · materiales simplificados. El recorrido detallado conserva materiales y equipamiento.';await choose(selected);
}catch(e){$('error').textContent='No se pudo cargar el modelo: '+e.message;$('status').textContent='Carga incompleta. Puedes abrir el recorrido 3D detallado o volver al tablero.';}
