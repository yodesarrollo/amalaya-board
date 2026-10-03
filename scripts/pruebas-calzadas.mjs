import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {applyIsc58} from '../public/levantamiento/isc58-refinement.js';
import {applyEbSw} from '../public/levantamiento/ebsw-refinement.js';
import {applyPlanRound} from '../public/levantamiento/plantas-refinement.js';
import {applyStreetRound,STREET_TARGETS,STREET_ADDITIONS} from '../public/levantamiento/calzadas-refinement.js';
import {removeStreetRoundHook,refineStreets,streetHash,STREET_BASE_WORLD,STREET_BASE_VISOR} from './preparar-calzadas.mjs';
const root='public/levantamiento',source=await readFile(root+'/world.js','utf8'),visor=await readFile(root+'/visor/assets/index-RoPA5goG.js','utf8'),runtime=await readFile(root+'/calzadas-refinement.js','utf8'),provenance=JSON.parse(await readFile(root+'/calzadas-provenance.json'));
assert.equal(streetHash(removeStreetRoundHook(source)),STREET_BASE_WORLD);assert.equal(streetHash(removeStreetRoundHook(visor,'visor')),STREET_BASE_VISOR);
assert.equal(refineStreets(source,'world',streetHash(runtime)),source);assert.equal(refineStreets(visor,'visor',streetHash(runtime)),visor);
assert.equal(provenance.worldSha256,streetHash(source));assert.equal(provenance.visorSha256,streetHash(visor));assert.equal(provenance.runtimeModuleSha256,streetHash(runtime));
assert.throws(()=>refineStreets(source+'\n// drift','world',streetHash(runtime)),/unknown|differs/);
function compiled(code){return code.replace(/^import[^\n]*\n/gm,'').replace(/\nimport[^\n]*\n/gm,'').replace(/export \{[^\n]+\};/,'');}
const raw=compiled(removeStreetRoundHook(source)).replace('Up(c), c;','c;');
const R=new Function('applyIsc58Refinement','applyEbSwRefinement','applyPlanRoundRefinement',raw+'\nreturn {createWorld:Fp,Vector3:U,Box3:Zt,Mesh:Y,BufferGeometry:An,Float32BufferAttribute:J,prepare:Ip,optimize:Up};')(applyIsc58,applyEbSw,applyPlanRound);
const originalFetch=globalThis.fetch;globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await readFile(root+'/'+url))});
const world=await R.createWorld('',undefined,'pilot');globalThis.fetch=originalFetch;
world.updateMatrixWorld(true);const before=[];world.traverse(m=>before.push([m,m.geometry,m.matrixWorld.clone(),m.material]));const colliders=[...world.userData.navigationColliders];
const result=applyStreetRound(world,world.userData.navigationColliders,R);assert.equal(applyStreetRound(world,world.userData.navigationColliders,R),result);
assert.deepEqual(world.userData.navigationColliders,colliders,'Street widths do not change building collisions');
for(const [m,geometry,matrix,material] of before){assert(m.matrixWorld.equals(matrix),'No building or paving transform changed');assert.equal(m.material,material);if(!m.userData.streetRound)assert.equal(m.geometry,geometry,'Unselected geometry unchanged');}
for(const t of STREET_TARGETS){
 const entry=result.entries.find(e=>e.id===t.id);assert(entry);assert(entry.sections.filter(s=>Math.abs(s.afterMeters-t.widthMeters)<1e-7).length>20,'Measured width must hold through the interior, not taper for the whole block');
 assert(Math.abs(entry.sections[0].beforeMeters-entry.sections[0].afterMeters)<1e-7);assert(Math.abs(entry.sections.at(-1).beforeMeters-entry.sections.at(-1).afterMeters)<1e-7);
}
for(const t of STREET_ADDITIONS){
 const mesh=world.getObjectByName('Ronda 02 · '+t.name);assert(mesh);const p=mesh.geometry.attributes.position;
 assert(p.count>20&&p.count%4===0);for(let i=0;i<p.count;i++)assert(Math.abs(p.getY(i)-.032)<1e-7);
 if(t.connectTo){const entry=result.entries.find(e=>e.id===t.id),end=entry.points.at(-1);assert(Math.hypot((p.getX(p.count-2)+p.getX(p.count-1))/2-end.x,(p.getZ(p.count-2)+p.getZ(p.count-1))/2-end.z)<1e-5);}
 const normal=mesh.geometry.attributes.normal;for(let i=0;i<normal.count;i++)assert(normal.getY(i)>.999,'Asphalt faces upwards for both viewers');
}
assert(!world.getObjectByName('Ronda 02 · Chihuahua · Yáñez–Garmendia · calzada faltante, eje aproximado'),'Do not bridge southern BBVA paving through the ISC footprint');
R.prepare(world,'pilot');R.optimize(world);world.updateMatrixWorld(true);
assert(new R.Box3().setFromObject(world).getSize(new R.Vector3()).toArray().every(Number.isFinite),'Production mesh merge accepts the extension');
// Run the actual viewer's assembly boundary with explicit runtime aliases.
const viewerAssembly=visor.match(/async function mv\(\)[\s\S]*?(?=(?:async )?function [\w$]+\()/)?.[0];
assert(viewerAssembly?.includes('BufferGeometry:Er,Float32BufferAttribute:q,Mesh:J'),'Standalone viewer must pass its exact geometry constructors');
assert(visor.indexOf('applyStreetRoundRefinement(Ng,Hg')>visor.indexOf('applyPlanRoundRefinement(Ng,Hg'),'Street overlay follows the footprint overlay in the viewer');
const tracking=JSON.parse(await readFile('public/seguimiento-3d.json'));
assert.equal(tracking.workflow.photoRequiredAfterEveryAction,true);
const buildings=tracking.blocks.flatMap(b=>b.buildings);
for(const b of buildings){
 const progress=b.visualProgress;assert(progress?.current?.url&&progress.manifest,`${b.id}: missing mandatory image/record`);
 const record=JSON.parse(await readFile('public/'+progress.manifest));assert.equal(record.building,b.id);assert.equal(record.action,2);assert.equal(record.status,'done');assert.equal(progress.current.url,record.current.url);assert.equal(progress.current.worldSha256,record.worldSha256);assert.equal(record.camera.id,progress.cameraId);assert(record.triangles>0);
 for(const image of [record.baseline,record.current]){const bytes=await readFile('public/'+image.url);assert.equal(streetHash(bytes),image.sha256);assert.equal(bytes.readUInt32BE(16),960);assert.equal(bytes.readUInt32BE(20),600);}
 assert(record.renderMethod.includes('Software rasterization')&&record.renderMethod.includes('Not WebGL'),'Capture method stays explicit');
 assert.equal(b.tasks.street,'done');
}
assert.equal(buildings.length,12);assert.equal(tracking.workflow.round,2);assert.equal(tracking.workflow.closedBuildings.length,12);
console.log('Round 02: both reversible viewers, widths and joins, unchanged buildings/sidewalks, production merge, 12 mandatory progress images and records checked.');
