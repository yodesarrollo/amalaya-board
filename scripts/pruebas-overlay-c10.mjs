// Low-cost closed facade overlays must retain native mass and ALL collision boxes.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Raycaster,Vector3} from 'three';
import {createWorld} from '../public/levantamiento/world.js';
const root='public/levantamiento/',runtime=await readFile(root+'paramento-refinement.js','utf8'),ref=runtime.match(/cuadra-detail-data\.js\?v=[a-f0-9]+/)[0];
const {CUADRA_DETAILS}=await import('../public/levantamiento/'+ref),saved=CUADRA_DETAILS.slice(),oldFetch=globalThis.fetch;
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const belongs=(m,id)=>{for(let p=m;p;p=p.parent)if(p.userData.buildingId===id||p.name==='Planta física · '+id)return true;return false;};
const collisions=w=>w.userData.navigationColliders.map(c=>[c.min.toArray(),c.max.toArray(),c.buildingId,c.frontageId,c.blockDetail]);
function meshes(w,filter){w.updateMatrixWorld(true);const rows=[];w.traverse(m=>{if(!m.isMesh||!filter(m))return;rows.push([m.name,m.matrixWorld.elements,Object.entries(m.geometry.attributes).map(([k,a])=>[k,Array.from(a.array)]),m.geometry.index&&Array.from(m.geometry.index.array),(Array.isArray(m.material)?m.material:[m.material]).map(m=>[m.color.getHexString(),m.metalness,m.roughness]),m.userData]);});return hash(rows);}
function triangleKeys(w,id){const out=[];w.updateMatrixWorld(true);w.traverse(m=>{if(!m.isMesh||!belongs(m,id))return;const p=m.geometry.attributes.position,idx=m.geometry.index?.array||Array.from({length:p.count},(_,i)=>i);for(let i=0;i<idx.length;i+=3)out.push([0,1,2].map(j=>new Vector3().fromBufferAttribute(p,idx[i+j]).applyMatrix4(m.matrixWorld).toArray().map(x=>Math.round(x*1e5))).sort().map(v=>v.join(',')).join('|'));});return out;}
const results=[];globalThis.fetch=async u=>({ok:true,json:async()=>JSON.parse(await readFile(root+u,'utf8'))});
try{for(const id of ['D1-10','D1-11']){const slot=saved.findIndex(p=>p.buildings.some(b=>b.id===id));if(slot<0)continue;const packet=saved[slot],item=packet.buildings.find(b=>b.id===id);assert.equal(packet.buildings.length,1);
CUADRA_DETAILS.splice(0,CUADRA_DETAILS.length,...saved.filter((_,i)=>i!==slot));const before=await createWorld('',undefined,'pilot',{overview:true});CUADRA_DETAILS.splice(0,CUADRA_DETAILS.length,...saved);const after=await createWorld('',undefined,'pilot',{overview:true});
assert.deepEqual(collisions(after),collisions(before),'Overlay debe conservar TODAS las colisiones: '+id);
assert.equal(meshes(after,m=>!belongs(m,id)),meshes(before,m=>!belongs(m,id)),'Vecinos intactos');
const prior=before.getObjectByName('Planta física · '+id),current=after.getObjectByName('Planta física · '+id);assert(current);assert.equal(current.userData.buildingId,id);assert.equal(current.userData.heightMeters,prior.userData.heightMeters);
const baseTriangles=triangleKeys(before,id),newTriangles=triangleKeys(after,id),set=new Set(newTriangles);assert(baseTriangles.every(t=>set.has(t)),'La masa nativa con su patio no se debe reconstruir');assert(newTriangles.length-baseTriangles.length<=100,'Detalle acotado para el presupuesto ligero');
const plan=current.userData.fittedPlan;if(prior.userData.fittedPlan)assert.deepEqual(plan,prior.userData.fittedPlan);const area=plan.points.reduce((s,p,i)=>{const q=plan.points[(i+1)%plan.points.length];return s+p[0]*q[1]-q[0]*p[1];},0);
let rays=0;for(const f of item.facades){const a=plan.points[f.edge],b=plan.points[(f.edge+1)%plan.points.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]),u=[(b[0]-a[0])/L,(b[1]-a[1])/L],out=area>0?[u[1],-u[0]]:[-u[1],u[0]];
const probes=[...(f.bays||[]).map(v=>({x:v.x,y:v.b+v.h/2,color:v.fillColor})),...(f.bands||[]).map(v=>({x:v.x??L/2,y:v.y,color:v.color}))];for(const p of probes){const ray=new Raycaster(new Vector3(a[0]+u[0]*p.x+out[0]*3,.05+p.y,a[1]+u[1]*p.x+out[1]*3),new Vector3(-out[0],0,-out[1]),0,4),hit=ray.intersectObject(after,true)[0];assert(hit&&belongs(hit.object,id),'Detalle visible desde calle sin oclusión');assert.equal(hit.object.material.color.getHexString(),p.color.slice(1));assert(hit.object.userData.liteStructural);rays++;}}
current.traverse(m=>{if(!m.isMesh)return;assert(m.userData.liteStructural);assert.equal(m.material.metalness,0);assert.equal(m.material.roughness,.96);for(const a of Object.values(m.geometry.attributes))assert(Array.from(a.array).every(Number.isFinite));});results.push({id,baseTriangles:baseTriangles.length,triangles:newTriangles.length,extraTriangles:newTriangles.length-baseTriangles.length,allCollisionSHA:hash(collisions(after)),streetRays:rays,nativeMassPreserved:true});}
assert(results.length>0);console.log(JSON.stringify({pass:true,results}));
}finally{CUADRA_DETAILS.splice(0,CUADRA_DETAILS.length,...saved);globalThis.fetch=oldFetch;}
