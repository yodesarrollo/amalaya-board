import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {applyPlanRound,PLAN_TARGETS,OSM_ADDITIONS,targetPolygon} from '../public/levantamiento/plantas-refinement.js';
import {removePlanRoundHook,refinePlans,planHash,PLAN_BASE_WORLD,PLAN_BASE_VISOR} from './preparar-plantas.mjs';
import {removeEbSwHook} from './preparar-ebsw.mjs';
import {removeIsc58Hook} from './preparar-isc58.mjs';
import {applyEbSw} from '../public/levantamiento/ebsw-refinement.js';
const source=await readFile('public/levantamiento/world.js','utf8'),visor=await readFile('public/levantamiento/visor/assets/index-RoPA5goG.js','utf8'),provenance=JSON.parse(await readFile('public/levantamiento/plantas-provenance.json'));
const hash=planHash(await readFile('public/levantamiento/plantas-refinement.js'));
assert.equal(planHash(removePlanRoundHook(source)),PLAN_BASE_WORLD);assert.equal(planHash(removePlanRoundHook(visor,'visor')),PLAN_BASE_VISOR);
assert.equal(source,refinePlans(source,'world',hash));assert.equal(visor,refinePlans(visor,'visor',hash));
assert.equal(provenance.worldSha256,planHash(source));assert.equal(provenance.visorSha256,planHash(visor));assert.equal(provenance.runtimeModuleSha256,hash);
assert.throws(()=>refinePlans(source+'\n// drift','world',hash),/unknown|differs/);
const raw=removeIsc58Hook(removeEbSwHook(removePlanRoundHook(source))).replace(/export \{[^\n]+\};\s*$/,'');
const R=new Function(raw+'\nreturn {Group:Ot,Mesh:Y,Shape:$r,Path:Qr,ShapeGeometry:Wi,BoxGeometry:X,BufferGeometry:An,Float32BufferAttribute:J,Box3:Zt,Vector3:U,createProceduralMaterial:$,buildEast:Tp,buildSector:sf,prepare:Ip,optimize:Up};')();
const east=R.buildEast(JSON.parse(await readFile('public/levantamiento/data/osm-context.json')),JSON.parse(await readFile('public/levantamiento/data/osm-plaza-hidalgo.json'))),world=new R.Group();world.add(east.group,R.buildSector(JSON.parse(await readFile('public/levantamiento/data/osm-context.json'))).group);const colliders=[...east.colliders];applyEbSw(world,colliders,R,9);world.updateMatrixWorld(true);
const owners=PLAN_TARGETS.map(t=>east.group.children.find(o=>o.name.startsWith(t.owner))),oldColliders=[...colliders],unchanged=[];
for(const g of east.group.children.filter(g=>!owners.includes(g)))g.traverse(m=>unchanged.push([m,m.matrixWorld.clone(),m.geometry,m.material]));
const bodyRecords=owners.map(owner=>{const body=owner.children.find(o=>o.geometry?.type==='ExtrudeGeometry');return{owner,body,geometry:body.geometry,material:body.material,vertices:Array.from(body.geometry.attributes.position.array),height:body.geometry.parameters.options.depth};});
const result=applyPlanRound(world,colliders,R);assert.equal(applyPlanRound(world,colliders,R),result);
for(const [m,matrix,geometry,material] of unchanged){assert(m.matrixWorld.equals(matrix),'Only the selected owner may move');assert.equal(m.geometry,geometry);assert.equal(m.material,material);}
assert.equal(oldColliders.filter(b=>!colliders.includes(b)).length,PLAN_TARGETS.length,'Exactly one inherited collision box replaced per owner');
for(const [index,target] of PLAN_TARGETS.entries()){
 const rec=bodyRecords[index],entry=result.entries[index],points=targetPolygon(target);
 assert.equal(rec.body.geometry,rec.geometry);assert.equal(rec.body.material,rec.material);assert.deepEqual(Array.from(rec.body.geometry.attributes.position.array),rec.vertices);assert.equal(rec.body.geometry.parameters.options.depth,rec.height);
 for(const [i,p] of entry.before.entries()){const q=new R.Vector3(p.x,0,p.z).applyMatrix4(rec.owner.matrixWorld);assert(Math.hypot(q.x-points[i].x,q.z-points[i].z)<1e-8);assert.equal(q.y,0);}
 const cells=colliders.filter(b=>!oldColliders.includes(b));const inside=(x,z)=>{let hit=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)hit=!hit;}return hit;};
 const ownCells=cells.filter(c=>inside((c.min.x+c.max.x)/2,(c.min.z+c.max.z)/2));assert.equal(ownCells.length,entry.addedColliderCells);
 for(const c of ownCells)for(const x of [c.min.x+1e-7,c.max.x-1e-7])for(const z of [c.min.z+1e-7,c.max.z-1e-7])assert(inside(x,z),'Navigational cells must fit the changed footprint');
 assert(ownCells.some(c=>c.containsPoint(new R.Vector3(points.reduce((s,p)=>s+p.x,0)/4,1,points.reduce((s,p)=>s+p.z,0)/4))));
 console.log(`${target.id}: plant ${entry.widthMeters.toFixed(2)} x ${entry.depthMeters.toFixed(2)} m; ${entry.addedColliderCells} collider rows, unchanged height and neighbours.`);
}
for(const target of OSM_ADDITIONS){const body=world.getObjectByName('Huella OSM '+target.osmWayId+' · altura provisional, sin fachada restituida');assert(body);assert.equal(body.geometry.parameters.options.depth,target.heightMeters);assert.equal(body.userData.heightStatus,'provisional');assert.equal(body.geometry.parameters.shapes.getPoints().length,target.anchors.length+1);assert.equal(result.entries.filter(e=>e.id===target.id).length,1);console.log(target.id+': unique OSM footprint added; unmeasured height default explicitly retained');}
if(process.env.PLAN_AUDIT_OUTPUT){
 const allBodies=[...bodyRecords,...OSM_ADDITIONS.map(t=>({body:world.getObjectByName('Huella OSM '+t.osmWayId+' · altura provisional, sin fachada restituida')}))];
 const records=allBodies.map(({body,owner},index)=>{const p=body.geometry.attributes.position,idx=body.geometry.index,vertices=[];for(let i=0;i<p.count;i++){const v=new R.Vector3().fromBufferAttribute(p,i).applyMatrix4(body.matrixWorld);vertices.push(v.toArray());}return{...result.entries[index],vertices,indices:idx?Array.from(idx.array):Array.from({length:p.count},(_,i)=>i)};});
 await writeFile(process.env.PLAN_AUDIT_OUTPUT,JSON.stringify({records,worldSha256:provenance.worldSha256,renderer:'Software projection of the current compiled model vertices; not WebGL capture',checkedAt:new Date().toISOString()},null,2)+'\n');
}
// Exercise production surface preparation after the new owner matrices are installed.
R.prepare(world,'pilot');R.optimize(world);world.updateMatrixWorld(true);
for(const rec of bodyRecords){const box=new R.Box3().setFromObject(rec.body);assert(Number.isFinite(box.min.x)&&Number.isFinite(box.max.z));assert(Math.abs(box.max.y-box.min.y-rec.height)<1e-5);}
console.log('Round 01: reversible October checkpoints, both viewer hooks, geometry, collision ownership and production preparation checked.');
