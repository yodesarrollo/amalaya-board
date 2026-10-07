import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sheetHash} from './preparar-lamina.mjs';
import {SHEET_PLANS} from '../public/levantamiento/sheet-plan-data.js';
import {STREET_BATCH50} from '../public/levantamiento/street-batch50-data.js';
import {applyStreetBatch50} from '../public/levantamiento/street-batch50-refinement.js';
import {footprintColliderCells,applyIsc58} from '../public/levantamiento/isc58-refinement.js';
import {applyEbSw} from '../public/levantamiento/ebsw-refinement.js';
import {applyPlanRound} from '../public/levantamiento/plantas-refinement.js';
import {applyStreetRound} from '../public/levantamiento/calzadas-refinement.js';
import {applySidewalkRound} from '../public/levantamiento/banquetas-refinement.js';
import {applyPlanReview} from '../public/levantamiento/plan-review-refinement.js';
const root='public/levantamiento',source=await readFile(root+'/world.js','utf8');
const stripped=s=>s.replace(/^import[^\n]*\n/gm,'').replace(/\nimport[^\n]*\n/gm,'').replace(/export \{[^\n]+\};/,'');
const sheet=stripped(await readFile(root+'/sheet-plan-refinement.js','utf8')).replace('export function applySheetPlan','function applySheetPlan').replace('applyStreetBatch50(world);','').replace('applyGroundReference(world, colliders, R);','');
const baseSheet=new Function('SHEET_PLANS','footprintColliderCells',sheet+';return applySheetPlan;')(SHEET_PLANS,footprintColliderCells);
const R=new Function('applyIsc58Refinement','applyEbSwRefinement','applyPlanRoundRefinement','applyStreetRoundRefinement','applySidewalkRoundRefinement','applyPlanReviewRefinement','applySheetPlanRefinement',stripped(source)+';return {createWorld:Fp,Vector3:U,Box3:Zt,prepare:Ip,optimize:Up};')(applyIsc58,applyEbSw,applyPlanRound,applyStreetRound,applySidewalkRound,applyPlanReview,baseSheet);
let world;const oldFetch=globalThis.fetch;try{globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await readFile(root+'/'+url))});world=await R.createWorld('',undefined,'pilot',{overview:true});}finally{globalThis.fetch=oldFetch;}
world.updateMatrixWorld(true);const before=[];world.traverse(m=>before.push({object:m,geometry:m.geometry,matrix:m.matrixWorld.clone(),material:m.material}));const colliders=[...world.userData.navigationColliders];
const result=applyStreetBatch50(world);world.updateMatrixWorld(true);assert.equal(applyStreetBatch50(world),result);assert.equal(result.segments,20);
assert.deepEqual(world.userData.navigationColliders,colliders,'Building collisions retained');
const replacementNames=new Set(STREET_BATCH50.replacements.map(e=>e.owner));
for(const b of before){if(replacementNames.has(b.object.name)){assert.notEqual(world.getObjectByName(b.object.name),b.object);continue;}assert.equal(b.object.geometry,b.geometry);assert.equal(b.object.material,b.material);assert(b.object.matrixWorld.equals(b.matrix),'No inherited object transform changes');}
let faces=0,area=0;const all=[];
for(const entry of [...STREET_BATCH50.entries,...STREET_BATCH50.replacements]){
 const mesh=world.getObjectByName(entry.owner||'Lote 50 · '+entry.id+' · '+entry.name);assert(mesh);const p=mesh.geometry.attributes.position,n=mesh.geometry.attributes.normal;assert.equal(p.count,entry.triangles.length/2);
 for(let i=0;i<p.count;i++){assert(Math.abs(p.getY(i)-.032)<1e-6);assert(n.getY(i)>.999);}
 for(let i=0;i<p.count;i+=3){const pts=[0,1,2].map(j=>[p.getX(i+j),p.getZ(i+j)]);const a=Math.abs(cross(pts[0],pts[1],pts[2]))/2;assert(a>0);all.push(pts);if(!entry.owner)area+=a;faces++;}
}
const report=JSON.parse(await readFile(root+'/street-batch50-geometry-report.json'));assert(Math.abs(area-report.newAreaMeters2)<.03);assert(report.replacements[0].removedAreaMeters2>8,'The inherited B3-04 corner is trimmed');
function cross(a,b,p){return (b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);}
function inside(p,poly){let v=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])v=!v;}return v;}
for(const tri of all){const mid=[tri.reduce((s,p)=>s+p[0],0)/3,tri.reduce((s,p)=>s+p[1],0)/3];for(const plan of SHEET_PLANS){assert(!inside(mid,plan.points)||(plan.holes||[]).some(h=>inside(mid,h)),'Asphalt triangle inside roof '+plan.id);}}
const tracking=JSON.parse(await readFile('public/seguimiento-3d.json')),batch=JSON.parse(await readFile(root+'/street-batch50-provenance.json')),buildings=tracking.blocks.flatMap(b=>b.buildings);
const original12=new Set(tracking.workflowHistory.find(w=>w.task==='sidewalkA').buildingOrder);
assert.deepEqual(batch.results.map(e=>e.id),tracking.activeReview.buildingOrder.filter(id=>!original12.has(id)).slice(0,50));
assert.equal(batch.results.length,50);assert.equal(new Set(batch.results.map(e=>e.id)).size,50);assert.equal(batch.worldSha256,JSON.parse(await readFile(root+'/ground-audit.json')).previousWorldSha256,'Lote 50 preserves its historical world checkpoint');
for(const [i,e] of batch.results.entries()){
 const b=buildings.find(b=>b.id===e.id);assert.equal(e.order,i+1);assert.equal(b.tasks.street,'done');const rec=JSON.parse(await readFile('public/'+e.manifest));assert.equal(rec.camera.id,rec.baseline.cameraId);assert.equal(rec.current.cameraId,rec.camera.id);assert(rec.streetSegments.length);assert.equal(rec.action,2);assert.equal(rec.heightMeasured,false);
 for(const pic of [rec.baseline,rec.current]){const bytes=await readFile('public/'+pic.url);assert.equal(sheetHash(bytes),pic.sha256);assert.equal(bytes.readUInt32BE(16),960);assert.equal(bytes.readUInt32BE(20),600);}
}
assert.equal(tracking.workflow.closedBuildings.length,62);assert.equal(tracking.workflow.unresolvedBuildings.length,77);assert.equal(tracking.workflow.readyForNextRound,false);
R.prepare(world,'pilot');R.optimize(world);world.updateMatrixWorld(true);assert(new R.Box3().setFromObject(world).getSize(new R.Vector3()).toArray().every(Number.isFinite),'Production merge accepts new road geometry');
console.log(`Lote 50: ${faces} caras viales; 20 tramos y reparación B3-04; edificios/colisiones preservados; 50 comparaciones y registros válidos; 77 calzadas pendientes.`);
