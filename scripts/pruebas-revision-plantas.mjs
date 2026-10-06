import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {applyPlanReview,REVIEW_OB01} from '../public/levantamiento/plan-review-refinement.js';
import {applyIsc58} from '../public/levantamiento/isc58-refinement.js';
import {applyEbSw} from '../public/levantamiento/ebsw-refinement.js';
import {applyPlanRound} from '../public/levantamiento/plantas-refinement.js';
import {applyStreetRound} from '../public/levantamiento/calzadas-refinement.js';
import {applySidewalkRound} from '../public/levantamiento/banquetas-refinement.js';
import {removePlanReviewHook,refinePlanReview,reviewHash,REVIEW_BASE_WORLD,REVIEW_BASE_VISOR} from './preparar-revision-plantas.mjs';
const root='public/levantamiento',source=await readFile(root+'/world.js','utf8'),visor=await readFile(root+'/visor/assets/index-RoPA5goG.js','utf8');
const runtime=await readFile(root+'/plan-review-refinement.js');
assert.equal(reviewHash(removePlanReviewHook(source)),REVIEW_BASE_WORLD);assert.equal(reviewHash(removePlanReviewHook(visor,'visor')),REVIEW_BASE_VISOR);
assert.equal(refinePlanReview(source,'world',reviewHash(runtime)),source);assert.equal(refinePlanReview(visor,'visor',reviewHash(runtime)),visor);
const raw=removePlanReviewHook(source).replace(/^import[^\n]*\n/gm,'').replace(/\nimport[^\n]*\n/gm,'').replace(/export \{[^\n]+\};/,'').replace('Up(c), c;','c;');
const R=new Function('applyIsc58Refinement','applyEbSwRefinement','applyPlanRoundRefinement','applyStreetRoundRefinement','applySidewalkRoundRefinement',raw+'\nreturn {createWorld:Fp,Vector3:U,Box3:Zt,optimize:Up};')(applyIsc58,applyEbSw,applyPlanRound,applyStreetRound,applySidewalkRound);
const oldFetch=globalThis.fetch;let world;try{globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await readFile(root+'/'+url))});world=await R.createWorld('',undefined,'pilot');}finally{globalThis.fetch=oldFetch;}
world.updateMatrixWorld(true);const owner=world.getObjectByName('OB-01 · cubierta del estacionamiento · piloto de detalle');
const before=[];world.traverse(o=>before.push({o,matrix:o.matrixWorld.clone(),geometry:o.geometry,material:o.material,box:o.isMesh?new R.Box3().setFromObject(o):null}));
const colliders=world.userData.navigationColliders,priorColliders=colliders.map(c=>c.clone()),result=applyPlanReview(world,colliders,R),rec=result.entries[0];
assert.equal(applyPlanReview(world,colliders,R),result);assert.equal(colliders.length,priorColliders.length);
let changed=0;for(const p of before){assert.equal(p.o.geometry,p.geometry);assert.equal(p.o.material,p.material);if(!p.matrix.equals(p.o.matrixWorld)){assert.equal(p.o.parent,owner,'Only OB-01 structural children may change');changed++;const box=new R.Box3().setFromObject(p.o);assert(Math.abs(box.min.y-p.box.min.y)<1e-7);assert(Math.abs(box.max.y-p.box.max.y)<1e-7);}}
assert.equal(changed,99);assert.equal(colliders.filter((c,i)=>!c.equals(priorColliders[i])).length,14);assert.equal(rec.updatedSupportColliders,14);
for(const m of owner.children.filter(o=>o.name.startsWith('Apoyo de perfil tubular'))){const box=new R.Box3().setFromObject(m);assert.equal(colliders.filter(c=>c.equals(box)).length,1);}
const [a,b,,d]=rec.after;assert(Math.abs(Math.hypot(b.x-a.x,b.z-a.z)-23.42)<1e-8);assert(Math.abs(Math.hypot(d.x-a.x,d.z-a.z)-6.11)<1e-8);assert(REVIEW_OB01.registrationWestMeters<=REVIEW_OB01.positionUncertaintyMeters);
const roof=owner.children.find(o=>o.name.startsWith('Lámina acanalada')),roofBox=new R.Box3().setFromObject(roof),neighbor=world.getObjectByName('OB-02 · fachada gris con arcos y rejas · exterior interpretado');
assert(neighbor);assert(!roofBox.intersectsBox(new R.Box3().setFromObject(neighbor)),'Revised roof cannot intersect OB-02');
R.optimize(world);world.updateMatrixWorld(true);assert(new R.Box3().setFromObject(world).getSize(new R.Vector3()).toArray().every(Number.isFinite));
const tracking=JSON.parse(await readFile('public/seguimiento-3d.json')),buildings=tracking.blocks.flatMap(b=>b.buildings),revision=tracking.activeReview;
assert.equal(revision.round,1);assert.equal(revision.scope,'full-sheet');assert.equal(revision.readyForNextRound,false);assert.equal(revision.inventoryComplete,false);
assert.equal(new Set(buildings.map(b=>b.id)).size,buildings.length);assert.equal(buildings.length,14);
assert.deepEqual(revision.closedBuildings,['OB-01']);assert.equal(revision.nextBuilding,'OB-02');assert.equal(revision.coverageSectors.length,12);
assert(buildings.some(b=>b.id==='SER-SANT'&&b.modelReference.osmWayId===499759073));assert(buildings.some(b=>b.id==='OB-21'));
const ob=buildings.find(b=>b.id==='OB-01'),progress=ob.visualProgress,record=JSON.parse(await readFile('public/'+progress.manifest));
assert.equal(record.action,1);assert.equal(record.worldSha256,reviewHash(source));assert.deepEqual(record.measured,{frontMeters:23.42,depthMeters:6.11,uncertaintyMeters:1.5,positionUncertaintyMeters:5});
for(const im of [record.baseline,record.current]){const bytes=await readFile('public/'+im.url);assert.equal(reviewHash(bytes),im.sha256);assert.equal(bytes.readUInt32BE(16),960);assert.equal(bytes.readUInt32BE(20),600);}
assert(progress.history.some(p=>p.manifest?.endsWith('03-record-banqueta-a.json')));
console.log('Revisión 01: cubierta 23.42 × 6.11; 14 colisiones propias; alturas, patio, acceso y vecinos conservados; historial e inventario abierto comprobados.');
