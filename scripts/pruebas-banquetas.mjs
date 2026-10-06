import {removePlanReviewHook} from './preparar-revision-plantas.mjs';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {applyIsc58} from '../public/levantamiento/isc58-refinement.js';
import {applyEbSw} from '../public/levantamiento/ebsw-refinement.js';
import {applyPlanRound} from '../public/levantamiento/plantas-refinement.js';
import {applyStreetRound} from '../public/levantamiento/calzadas-refinement.js';
import {applySidewalkRound,WALK_TARGETS,WALK_ADDITIONS} from '../public/levantamiento/banquetas-refinement.js';
import {removeSidewalkRoundHook,refineWalks,walkHash,WALK_BASE_WORLD,WALK_BASE_VISOR} from './preparar-banquetas.mjs';
const root='public/levantamiento',source=removePlanReviewHook(await readFile(root+'/world.js','utf8')),visor=removePlanReviewHook(await readFile(root+'/visor/assets/index-RoPA5goG.js','utf8'),'visor'),runtime=await readFile(root+'/banquetas-refinement.js','utf8'),provenance=JSON.parse(await readFile(root+'/banquetas-provenance.json'));
assert.equal(walkHash(removeSidewalkRoundHook(source)),WALK_BASE_WORLD);assert.equal(walkHash(removeSidewalkRoundHook(visor,'visor')),WALK_BASE_VISOR);
assert.equal(refineWalks(source,'world',walkHash(runtime)),source);assert.equal(refineWalks(visor,'visor',walkHash(runtime)),visor);
assert.equal(provenance.worldSha256,walkHash(source));assert.equal(provenance.visorSha256,walkHash(visor));assert.equal(provenance.runtimeModuleSha256,walkHash(runtime));
assert.throws(()=>refineWalks(source+'\n// drift','world',walkHash(runtime)),/unknown|differs/);
const raw=removeSidewalkRoundHook(source).replace(/^import[^\n]*\n/gm,'').replace(/\nimport[^\n]*\n/gm,'').replace(/export \{[^\n]+\};/,'').replace('Up(c), c;','c;');
const R=new Function('applyIsc58Refinement','applyEbSwRefinement','applyPlanRoundRefinement','applyStreetRoundRefinement',raw+'\nreturn {createWorld:Fp,Vector3:U,Box3:Zt,Mesh:Y,BufferGeometry:An,Float32BufferAttribute:J,prepare:Ip,optimize:Up};')(applyIsc58,applyEbSw,applyPlanRound,applyStreetRound);
const originalFetch=globalThis.fetch;let world;try{globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await readFile(root+'/'+url))});world=await R.createWorld('',undefined,'pilot');}finally{globalThis.fetch=originalFetch;}
world.updateMatrixWorld(true);const bodies=[];
function triangles(mesh){const p=mesh.geometry.attributes.position,index=mesh.geometry.index?.array||Array.from({length:p.count},(_,i)=>i),b=new R.Box3().setFromObject(mesh),out=[];for(let i=0;i<index.length;i+=3){const t=Array.from(index.slice(i,i+3),j=>new R.Vector3().fromBufferAttribute(p,j).applyMatrix4(mesh.matrixWorld));if(t.every(v=>Math.abs(v.y-b.min.y)<.002))out.push(t);}return out;}
world.traverse(o=>{if(o.isMesh&&o.geometry?.type==='ExtrudeGeometry'&&new R.Box3().setFromObject(o).getSize(new R.Vector3()).y>3)bodies.push({mesh:o,before:triangles(o),box:new R.Box3().setFromObject(o)});});
function area(p){return Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a.x*b.z-b.x*a.z;},0))/2;}
function clip(poly,triangle){const signed=triangle.reduce((s,a,i)=>{const b=triangle[(i+1)%3];return s+a.x*b.z-b.x*a.z;},0),sign=signed>=0?1:-1;let out=poly;for(let k=0;k<3&&out.length;k++){const a=triangle[k],b=triangle[(k+1)%3],side=p=>sign*((b.x-a.x)*(p.z-a.z)-(b.z-a.z)*(p.x-a.x)),input=out;out=[];for(let i=0;i<input.length;i++){const p=input[i],q=input[(i+1)%input.length],dp=side(p),dq=side(q);if(dp>=-1e-8)out.push(p);if((dp>=0)!==(dq>=0)){const u=dp/(dp-dq);out.push({x:p.x+(q.x-p.x)*u,z:p.z+(q.z-p.z)*u});}}}return out;}
const overlap=(as,bs)=>as.reduce((sum,a)=>sum+bs.reduce((s,b)=>s+area(clip(a,b)),0),0);

world.updateMatrixWorld(true);const before=[];world.traverse(m=>before.push([m,m.geometry,m.matrixWorld.clone(),m.material]));const colliders=world.userData.navigationColliders.map(c=>c.clone());
const result=applySidewalkRound(world,world.userData.navigationColliders,R);assert.equal(applySidewalkRound(world,world.userData.navigationColliders,R),result);assert.equal(colliders.length+result.entries.reduce((sum,e)=>sum+(e.registration?.addedColliderCells||0),0),world.userData.navigationColliders.length);
for(const [m,geometry,matrix,material] of before){
 const selectedOwner=[...WALK_TARGETS,...WALK_ADDITIONS].some(t=>t.owner&&(()=>{for(let p=m;p;p=p.parent)if(p.name.startsWith(t.owner))return true;return false;})());
 if(!m.userData.sidewalkRound&&!selectedOwner){assert.equal(m.geometry,geometry,m.name+' geometry');assert(m.matrixWorld.equals(matrix),m.name+' transform');}assert.equal(m.material,material,m.name+' material');
}
const checks=[];
for(const t of WALK_TARGETS){
 const entry=result.entries.find(e=>e.id===t.id);assert(entry);assert(Math.abs(t.edgeToFacadeMeters-t.measuredWidthMeters)<=t.uncertaintyMeters,'Model within the image-reading margin');
 const base=world.getObjectByName(t.base),p=base.geometry.attributes.position;let measured=0;
 for(let i=0;i<p.count;i+=2){const coordinate=(p.getX(i)+p.getX(i+1))/2;if(coordinate<t.range[0]+t.blendMeters+.2||coordinate>t.range[1]-t.blendMeters-.2)continue;const width=Math.hypot(p.getX(i)-p.getX(i+1),p.getZ(i)-p.getZ(i+1));assert(Math.abs(width-t.widthMeters)<.003,'Measured width must hold through this frontage');measured++;}
 assert(measured>5,'At least five real cross sections');
 if(entry.registration){assert(entry.registration.distanceMeters<=entry.registration.declaredUncertaintyMeters);const body=(()=>{let owner;world.traverse(o=>{if(!o.isMesh&&o.name.startsWith(t.owner))owner=o;});return owner.children.find(o=>o.geometry?.type==='ExtrudeGeometry');})();assert(Math.abs(new R.Box3().setFromObject(body).getSize(new R.Vector3()).y-body.geometry.parameters.options.depth)<1e-4);}
 checks.push({id:t.id,actualSections:measured,baseWidthMeters:t.widthMeters,totalVisibleWidthMeters:t.edgeToFacadeMeters,changedInstances:entry.changedInstances,registration:entry.registration});
}
for(const t of WALK_ADDITIONS){
 const entry=result.entries.find(e=>e.id===t.id);assert(entry);assert(Math.abs(t.edgeToFacadeMeters-t.measuredWidthMeters)<=t.uncertaintyMeters);
 const mesh=world.getObjectByName('Ronda 03 · '+t.id+' · franja continua A'),p=mesh.geometry.attributes.position;const poly=entry.registration?.after||t.ownerPolygon;
 const inside=(p,poly)=>{let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.z>p.z)!==(b.z>p.z)&&p.x<(b.x-a.x)*(p.z-a.z)/(b.z-a.z)+a.x)hit=!hit;}return hit;};
 for(let i=0;i<p.count;i+=2){const width=Math.hypot(p.getX(i)-p.getX(i+1),p.getZ(i)-p.getZ(i+1));assert(Math.abs(width-(t.edgeToFacadeMeters-t.curbMeters))<.001);if(poly)for(const j of [i,i+1])assert(!inside({x:p.getX(j),z:p.getZ(j)},poly),'New walk outside registered body '+t.id);}
 if(entry.registration)assert(entry.registration.distanceMeters<=entry.registration.declaredUncertaintyMeters);
 checks.push({...entry,actualSections:p.count/2});
}

const pointInside=(p,poly)=>{let hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.z>p.z)!==(b.z>p.z)&&p.x<(b.x-a.x)*(p.z-a.z)/(b.z-a.z)+a.x)hit=!hit;}return hit;};
// Every new paving sample must remain outside its actual road, including all cell segments.
for(const t of WALK_ADDITIONS){
 const road=world.getObjectByName(t.road),mesh=world.getObjectByName('Ronda 03 · '+t.id+' · franja continua A'),p=mesh.geometry.attributes.position,r=road.geometry.attributes.position;
 for(let i=0;i<p.count;i++)assert(mesh.geometry.attributes.normal.getY(i)>.999,'New paving faces upward');
 for(let i=0;i<p.count;i++)for(let j=0;j<r.count;j+=4){const quad=[j,j+1,j+3,j+2].map(k=>new R.Vector3().fromBufferAttribute(r,k).applyMatrix4(road.matrixWorld));assert(!pointInside({x:p.getX(i),z:p.getZ(i)},quad),'Added paving outside asphalt '+t.id);}
 const entry=result.entries.find(e=>e.id===t.id);if(entry.registration?.addedColliderCells){assert(entry.registration.addedColliderCells>0);}
}
// Heights/materials of relocated bodies remain inherited; inscribed cells stay out of new paving.
for(const entry of result.entries.filter(e=>e.registration)){
 const reg=entry.registration;assert(reg.heightsUnchanged);assert(reg.distanceMeters<=reg.declaredUncertaintyMeters);
 const owned=world.userData.navigationColliders.filter(c=>pointInside({x:(c.min.x+c.max.x)/2,z:(c.min.z+c.max.z)/2},reg.after)&&c.max.y>5);
 assert.equal(owned.length,reg.collidersMoved+(reg.addedColliderCells||0),'Exact solid ownership for '+entry.id);
 for(const cell of owned)for(const x of [cell.min.x+.00001,cell.max.x-.00001])for(const z of [cell.min.z+.00001,cell.max.z-.00001])assert(pointInside({x,z},reg.after),'Collision rows remain inscribed');
}
world.updateMatrixWorld(true);
for(const b of bodies){let moved=false;for(let o=b.mesh;o;o=o.parent)if(o.userData.sidewalkRoundRegistration)moved=true;if(!moved)continue;const after=triangles(b.mesh),box=new R.Box3().setFromObject(b.mesh);for(const other of bodies){if(other===b||!box.intersectsBox(other.box))continue;const old=overlap(b.before,other.before),now=overlap(after,triangles(other.mesh));assert(now<=old+.05,'No added footprint overlap: '+b.mesh.name+' / '+other.mesh.name);}}

R.prepare(world,'pilot');R.optimize(world);world.updateMatrixWorld(true);assert(new R.Box3().setFromObject(world).getSize(new R.Vector3()).toArray().every(Number.isFinite),'Production merge accepts paving edits');
assert(visor.includes('applySidewalkRoundRefinement(Ng,Hg,{BufferGeometry:Er,Float32BufferAttribute:q,Mesh:J,Vector3:U,Box3:Jn})'),'Exact standalone runtime aliases');
assert(visor.indexOf('applySidewalkRoundRefinement(Ng,Hg')>visor.indexOf('applyStreetRoundRefinement(Ng,Hg'),'Ordered standalone overlays');
const tracking=JSON.parse(await readFile('public/seguimiento-3d.json')),round=JSON.parse(await readFile(root+'/sidewalk-round.json')),buildings=round.buildingOrder.map(id=>tracking.blocks.flatMap(b=>b.buildings).find(b=>b.id===id));
assert.equal(buildings.length,12);assert.equal(tracking.workflow.round,3);assert.equal(tracking.workflow.task,'sidewalkA');assert.equal(tracking.workflow.photoRequiredAfterEveryAction,true);assert.equal(round.results.length,12);
assert.deepEqual(round.buildingOrder,buildings.map(b=>b.id));assert.deepEqual(round.unresolvedBuildings,['ISC-58','EB-SW','SER-BLEY']);assert.equal(round.readyForNextRound,false);
for(const b of buildings){
 const progress=b.visualProgress.manifest?.endsWith('03-record-banqueta-a.json')?b.visualProgress:b.visualProgress.history.find(p=>p.manifest?.endsWith('03-record-banqueta-a.json')),record=JSON.parse(await readFile('public/'+progress.manifest));assert.equal(record.building,b.id);assert.equal(record.action,3);assert.equal(record.status,b.tasks.sidewalkA);assert.equal(progress.current.url,record.current.url);assert.equal(progress.current.worldSha256,walkHash(source));assert.equal(record.worldSha256,walkHash(source));assert.equal(record.camera.id,progress.cameraId);assert.deepEqual(record.camera.target,record.modelCenter);assert(record.triangles>0);assert(record.measurement);
 assert(record.renderMethod.includes('Software rasterization')&&record.renderMethod.includes('Not WebGL'));assert(/lado A/i.test(record.note)||record.status==='blocked');
 const old=JSON.parse(await readFile('public/levantamiento/evidence/'+b.id+'/02-record-calzada.json'));assert.deepEqual(record.modelCenter,old.modelCenter,'Identical fixed camera target across rounds');
 for(const image of [record.baseline,record.current]){const bytes=await readFile('public/'+image.url);assert.equal(walkHash(bytes),image.sha256);assert.equal(bytes.readUInt32BE(16),960);assert.equal(bytes.readUInt32BE(20),600);assert.equal(image.cameraId,record.camera.id);}
 assert.equal(record.baseline.worldSha256,WALK_BASE_WORLD);assert(b.visualProgress.history.some(p=>p.manifest?.endsWith('02-record-calzada.json')),'Historical round 02 image preserved');
}
console.log('Round 03: exact widths, road/body separation, inherited heights/materials, inscribed registered collisions, reversible viewers, production merge and 12 current column images checked.');
