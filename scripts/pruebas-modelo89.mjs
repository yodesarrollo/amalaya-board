// 89/D1-12 · cuadra 26: modelado con foto documentada y formas estimadas.
// Comprueba identidad, planta y patios conservados, vecinos y colisiones ajenas
// intactos, frentes visibles desde la calle y el módulo observado dentro de la toma.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Raycaster,Vector3} from 'three';
import {createWorld} from '../public/levantamiento/world.js';
const root='public/levantamiento/',ID='D1-12';
const hash=x=>createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex');
const dataSource=await readFile(root+'c11-89-data.js','utf8');
const {C11_89,OBSERVADO_89}=await import('../public/levantamiento/c11-89-data.js');
assert.equal(C11_89.block,'C11');assert.equal(C11_89.buildings.length,1);
const item=C11_89.buildings[0];
assert.equal(item.id,ID);assert.equal(item.height,6.2);assert.notEqual(item.facadeOverlayOnly,true,'Modelo con vanos reales, no superposición');
assert.equal(item.hypothesis.generic,false);assert.equal(item.hypothesis.measured,false);assert.equal(item.hypothesis.photoreal,false);
assert.equal(item.hypothesis.decision.date,'2026-11-10');
assert.deepEqual(item.facades.map(f=>f.edge),[0,1,2,3,4,5]);
assert.equal(item.facades[0].bays.length,0,'Colindancia oriente sin vanos inventados');
// Módulo observado: en la arista 5, centrado en 18.92 m y dentro de lo que ve la toma.
assert.equal(OBSERVADO_89.edge,5);assert.equal(OBSERVADO_89.pano,'wCAjZTaNz6Qt4POhDordqw');
const sur=item.facades.find(f=>f.edge===5).bays,observados=sur.filter(v=>Math.abs(v.x-OBSERVADO_89.x)<=OBSERVADO_89.ancho/2);
assert(observados.some(v=>v.frontBars&&v.b<1.5),'Ventana baja con reja saliente en el tramo observado');
assert(observados.some(v=>!v.noBars&&!v.frontBars&&v.b>3),'Vano alto enrejado en el tramo observado');
assert(observados.filter(v=>v.noBars&&v.w===v.h).length>=2,'Nichos cuadrados en el tramo observado');
assert.equal(observados.filter(v=>v.frontBars).length,1,'Una sola ventana baja dentro de los ~7 m vistos');
for(const v of observados)assert(v.b+v.h<4.93,'Todo lo observado cabe en la altura visible de la toma');
for(const f of item.facades)for(const v of f.bays){assert.equal(v.open===true,false,'Sin accesos ni pasos inventados');assert(v.rect);}
// Caché: el paquete y su registro se versionan por contenido.
const detailsSource=await readFile(root+'cuadra-detail-data.js','utf8');
assert(detailsSource.includes('c11-89-data.js?v='+hash(dataSource).slice(0,12)),'Import versionado del paquete89');
const runtime=await readFile(root+'paramento-refinement.js','utf8');
assert(runtime.includes('cuadra-detail-data.js?v='+hash(detailsSource).slice(0,12)),'Import versionado del registro');
const registry=runtime.match(/from '\.\/(cuadra-detail-data\.js[^']*)'/)[1];
const {CUADRA_DETAILS}=await import('../public/levantamiento/'+registry),saved=CUADRA_DETAILS.slice();
assert.equal(saved.flatMap(p=>p.buildings).filter(b=>b.id===ID).length,1,'Un solo paquete para89');
const belongs=m=>{for(let p=m;p;p=p.parent)if(p.userData.buildingId===ID||p.name==='Planta física · '+ID)return true;return false;};
const colisiones=(w,propias)=>w.userData.navigationColliders.filter(c=>(c.buildingId===ID)===propias).map(c=>[c.min.toArray(),c.max.toArray(),c.buildingId,c.frontageId,c.blockDetail]);
function ajeno(w){const rows=[];w.updateMatrixWorld(true);w.traverse(m=>{if(!m.isMesh||belongs(m))return;rows.push([m.name,m.matrixWorld.elements,Object.entries(m.geometry.attributes).map(([k,a])=>[k,Array.from(a.array)]),m.geometry.index&&Array.from(m.geometry.index.array),(Array.isArray(m.material)?m.material:[m.material]).map(t=>[t.color.getHexString(),t.metalness,t.roughness]),m.userData]);});return hash(rows);}
const dentro=(x,z,pts)=>{let ok=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,zi]=pts[i],[xj,zj]=pts[j];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)ok=!ok;}return ok;};
const oldFetch=globalThis.fetch;globalThis.fetch=async u=>({ok:true,json:async()=>JSON.parse(await readFile(root+u,'utf8'))});
try{
 CUADRA_DETAILS.splice(0,CUADRA_DETAILS.length,...saved.filter(p=>!p.buildings.some(b=>b.id===ID)));
 const before=await createWorld('',undefined,'pilot',{overview:true});
 CUADRA_DETAILS.splice(0,CUADRA_DETAILS.length,...saved);
 const after=await createWorld('',undefined,'pilot',{overview:true});
 assert.deepEqual(colisiones(after,false),colisiones(before,false),'Colisiones ajenas idénticas');
 const vecinos=ajeno(before);assert.equal(ajeno(after),vecinos,'Geometría y materiales ajenos idénticos (incluidos 76–88)');
 const prior=before.getObjectByName('Planta física · '+ID),current=after.getObjectByName('Planta física · '+ID);
 assert(prior&&current,'Propietario conservado');
 const plan=current.userData.fittedPlan,base=prior.userData.fittedPlan;
 assert.deepEqual(plan.points,base.points,'Planta efectiva conservada');assert.deepEqual(plan.holes,base.holes,'Dos patios conservados');
 assert.equal(plan.points.length,6);assert.equal(plan.holes.length,2);
 const propias=colisiones(after,true);assert(propias.length>0,'El conjunto sigue siendo sólido');
 for(const [min,max] of propias){assert(Math.abs(max[1]-6.25)<.01,'Altura provisional 6.2 m');}
 // Cada patio queda libre: su centro no está dentro de ninguna caja de colisión.
 for(const hole of plan.holes){const cx=hole.reduce((s,p)=>s+p[0],0)/hole.length,cz=hole.reduce((s,p)=>s+p[1],0)/hole.length;
  assert(dentro(cx,cz,hole));assert(!after.userData.navigationColliders.some(c=>cx>c.min.x&&cx<c.max.x&&cz>c.min.z&&cz<c.max.z),'Patio abierto '+cx.toFixed(1));}
 // Desde la calle, cada frente con vanos muestra el modelo de89 frente a cada vano.
 const area=plan.points.reduce((s,p,i)=>{const q=plan.points[(i+1)%plan.points.length];return s+p[0]*q[1]-q[0]*p[1]},0);let rayos=0;
 for(const f of item.facades.filter(f=>f.bays.length)){
  const a=plan.points[f.edge],b=plan.points[(f.edge+1)%plan.points.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]),u=[(b[0]-a[0])/L,(b[1]-a[1])/L],out=area>0?[u[1],-u[0]]:[-u[1],u[0]];
  for(const v of f.bays){const ray=new Raycaster(new Vector3(a[0]+u[0]*v.x+out[0]*1.2,.05+v.b+v.h/2,a[1]+u[1]*v.x+out[1]*1.2),new Vector3(-out[0],0,-out[1]),0,2.5),hit=ray.intersectObject(after,true)[0];
   assert(hit&&belongs(hit.object),'Vano visible desde la calle en arista '+f.edge+' x='+v.x);rayos++;}
 }
 current.traverse(m=>{if(!m.isMesh)return;assert.equal(m.material.metalness,0);assert.equal(m.material.roughness,.95);for(const attr of Object.values(m.geometry.attributes))assert(Array.from(attr.array).every(Number.isFinite));});
 console.log(JSON.stringify({pass:true,id:ID,vanos:item.facades.reduce((s,f)=>s+f.bays.length,0),observados:observados.length,rayos,colisionesPropias:propias.length,colisionesAjenasSHA:hash(colisiones(after,false)),ajenoSHA:vecinos}));
}finally{CUADRA_DETAILS.splice(0,CUADRA_DETAILS.length,...saved);globalThis.fetch=oldFetch;}
