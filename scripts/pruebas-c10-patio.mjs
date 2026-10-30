import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createWorld} from '../public/levantamiento/world.js';
import {CUADRA_DETAILS} from '../public/levantamiento/cuadra-detail-data.js';
import {createCollisionIndex,blocked} from '../public/levantamiento/walk-navigation.js';

// Exercise the real D1-10 fitted plan through the same packet path as C10 details.
const originalFetch=globalThis.fetch;
globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await readFile('public/levantamiento/'+url))});
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
function neighbours(world){
 world.updateMatrixWorld(true);const meshes=[];
 world.traverse(m=>{if(!m.isMesh)return;let p=m;while(p&&!p.userData.buildingId)p=p.parent;if(p?.userData.buildingId==='D1-10'||m.name.startsWith('Planta física · D1-10'))return;
  meshes.push([m.name,Array.from(m.geometry.attributes.position.array),m.geometry.index&&Array.from(m.geometry.index.array),m.matrixWorld.elements,(Array.isArray(m.material)?m.material:[m.material]).map(x=>x.color?.getHexString())]);});
 return digest({meshes,colliders:world.userData.navigationColliders.filter(c=>c.buildingId!=='D1-10').map(c=>[c.min.toArray(),c.max.toArray(),c.buildingId])});
}
try{
 const before=await createWorld('',undefined,'pilot',{overview:true}),owner=before.getObjectByName('Planta física · D1-10');
 assert(owner?.userData.fittedPlan?.holes?.length,'Real D1-10 must retain its existing courtyard');
 const plan=structuredClone(owner.userData.fittedPlan),beforeNeighbours=neighbours(before);
 const existing=CUADRA_DETAILS.some(p=>p.buildings.some(b=>b.id==='D1-10'));
 if(!existing)CUADRA_DETAILS.push({block:'C10',evidence:'real-courtyard-regression',buildings:[{id:'D1-10',height:owner.userData.heightMeters,color:'#c6c3b8',uncertainty:3,sources:[],facades:[],note:'Neutral test packet on the real fitted footprint.'}]});
 const after=await createWorld('',undefined,'pilot',{overview:true}),updated=after.getObjectByName('Planta física · D1-10');
 assert.deepEqual(updated.userData.fittedPlan,plan,'The courtyard and outer footprint must remain exact');
 assert.equal(neighbours(after),beforeNeighbours,'All other geometry, materials and colliders must remain exact');
 const hole=plan.holes[0],center=hole.reduce((s,p)=>[s[0]+p[0]/hole.length,s[1]+p[1]/hole.length],[0,0]);
 const index=createCollisionIndex(after.userData.navigationColliders);
 for(const p of [center,...hole.map(p=>[(p[0]+center[0])/2,(p[1]+center[1])/2])]){
  assert(!blocked(index,{x:p[0],y:.08,z:p[1]}),'Courtyard interior must stay clear for navigation');
  updated.updateMatrixWorld(true);updated.traverse(m=>{if(!m.isMesh)return;
   const a=m.geometry.attributes.position,ix=m.geometry.index?.array||Array.from({length:a.count},(_,i)=>i);
   for(let i=0;i<ix.length;i+=3){const v=[0,1,2].map(j=>({x:a.getX(ix[i+j]),z:a.getZ(ix[i+j])})),[u,w,t]=v,den=(w.z-t.z)*(u.x-t.x)+(t.x-w.x)*(u.z-t.z);if(Math.abs(den)<1e-8)continue;
    const b=((w.z-t.z)*(p[0]-t.x)+(t.x-w.x)*(p[1]-t.z))/den,c=((t.z-u.z)*(p[0]-t.x)+(u.x-t.x)*(p[1]-t.z))/den;
    assert(!(b>1e-5&&c>1e-5&&b+c<1-1e-5),'Roof/base triangles must not cover the courtyard');
   }
  });
 }
 console.log(`D1-10: ${plan.holes.length} courtyard preserved, roof/base open, interior clear, all neighbours unchanged (${beforeNeighbours.slice(0,12)}).`);
}finally{globalThis.fetch=originalFetch;}
