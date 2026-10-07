import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {VISUAL_FIT} from '../public/levantamiento/ajuste-visual-data.js';
import {applyVisualFit} from '../public/levantamiento/ajuste-visual-refinement.js';
import {SHEET_PLANS} from '../public/levantamiento/sheet-plan-data.js';
import {footprintColliderCells,applyIsc58} from '../public/levantamiento/isc58-refinement.js';
import {applyGroundReference} from '../public/levantamiento/ground-reference-refinement.js';
import {applyStreetBatch50} from '../public/levantamiento/street-batch50-refinement.js';
import {applyEbSw} from '../public/levantamiento/ebsw-refinement.js';
import {applyPlanRound} from '../public/levantamiento/plantas-refinement.js';
import {applyStreetRound} from '../public/levantamiento/calzadas-refinement.js';
import {applySidewalkRound} from '../public/levantamiento/banquetas-refinement.js';
import {applyPlanReview} from '../public/levantamiento/plan-review-refinement.js';
const root='public/levantamiento',strip=s=>s.replace(/^import[^\n]*\n/gm,'').replace(/\nimport[^\n]*\n/gm,'').replace(/export \{[^\n]+\};/,'');
const sheet=strip(await readFile(root+'/sheet-plan-refinement.js','utf8')).replace('export function applySheetPlan','function applySheetPlan').replace('applyVisualFit(world, colliders, R);','');
const baseSheet=new Function('SHEET_PLANS','footprintColliderCells','applyStreetBatch50','applyGroundReference',sheet+';return applySheetPlan;')(SHEET_PLANS,footprintColliderCells,applyStreetBatch50,applyGroundReference);
const runtime=new Function('applyIsc58Refinement','applyEbSwRefinement','applyPlanRoundRefinement','applyStreetRoundRefinement','applySidewalkRoundRefinement','applyPlanReviewRefinement','applySheetPlanRefinement',strip(await readFile(root+'/world.js','utf8'))+';return {createWorld:Fp,Vector3:U,Box3:Zt};')(applyIsc58,applyEbSw,applyPlanRound,applyStreetRound,applySidewalkRound,applyPlanReview,baseSheet);
let world;const oldFetch=globalThis.fetch;
try{globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await readFile(root+'/'+url))});world=await runtime.createWorld('',undefined,'pilot',{overview:true});}finally{globalThis.fetch=oldFetch;}
world.updateMatrixWorld(true);
const changes=new Set(VISUAL_FIT.adjustments.flatMap(a=>a.owners));
const original=[];world.traverse(o=>original.push({o,matrix:o.matrixWorld.clone(),geometry:o.geometry}));
const colliders=world.userData.navigationColliders,beforeColliders=colliders.map(c=>c.clone());
const result=applyVisualFit(world,colliders,runtime);
assert.equal(applyVisualFit(world,colliders,runtime),result,'idempotencia');
assert(result.corrections.every(c=>c.colliders>0),'El ajuste de edificios actualiza también las colisiones');
assert.equal(colliders.length,beforeColliders.length,'no se borran paredes ni se añaden bloqueos');
for(const e of original){let adjusted=false;for(let p=e.o;p;p=p.parent)if(changes.has(p.name))adjusted=true;if(!adjusted)assert(e.o.matrixWorld.equals(e.matrix),'Se conserva '+e.o.name);assert.equal(e.geometry,e.o.geometry,'sin pérdida de detalle');}
const changedColliders=colliders.filter((c,i)=>!c.equals(beforeColliders[i]));
assert.equal(changedColliders.length,result.corrections.reduce((n,c)=>n+c.colliders,0));
for(const c of colliders)assert(c.min.x<=c.max.x&&c.min.z<=c.max.z&&c.min.y<=c.max.y);
const group=world.getObjectByName('Cuadras · calles y banquetas · ajuste visual');
assert.equal(group.children.length,VISUAL_FIT.surfaces.length);
const hashes=new Set(),actual=[];
for(const entry of VISUAL_FIT.surfaces){
 const mesh=group.children.find(m=>m.userData.visualFit.id===entry.id),p=mesh.geometry.attributes.position;
 assert(mesh?.isMesh&&mesh.visible&&mesh.material.visible);assert.equal(mesh.material.opacity,1);assert.equal(p.count,entry.triangles.length/2);
 const tris=[];
 for(let i=0;i<p.count;i+=3){const pts=[0,1,2].map(j=>[p.getX(i+j),p.getZ(i+j)]);assert(pts.flat().every(Number.isFinite));
  assert.equal(p.getY(i),Math.fround(entry.elevation));
  const key=pts.map(v=>v.map(n=>n.toFixed(4)).join(',')).sort().join(';');assert(!hashes.has(key),'No duplicate surfaces');hashes.add(key);tris.push(pts);
 }
 actual.push({id:entry.id,kind:entry.kind,triangles:tris});
}
const registry=JSON.parse(await readFile(root+'/cuadras.json')),drawing=JSON.parse(await readFile(root+'/ajuste-visual/cuadras.json'));
assert.equal(drawing.reviews.length,registry.blocks.length);assert.equal(drawing.summary.blocks,33);assert.equal(drawing.summary.buildings,139);
assert(registry.blocks.every(b=>b.visualFit?.steps.join(',')==='2,3'&&drawing.traces.some(t=>t.blockId===b.id)));
for(const b of registry.blocks)await readFile('public/'+b.visualFit.evidence);
assert.equal(drawing.summary.checks.roadBuildingOverlap,0);assert.equal(drawing.summary.checks.sidewalkBuildingOverlap,0);assert.equal(drawing.summary.checks.roadSidewalkOverlap,0);
for(const t of drawing.traces)assert(t.pixels.every(p=>p.every(Number.isFinite)));
if(process.argv.includes('--export'))await writeFile('/tmp/amalaya-visual-runtime.json',JSON.stringify({surfaces:actual,corrections:result.corrections,colliders:colliders.map(c=>({min:c.min.toArray(),max:c.max.toArray()}))}));
console.log(JSON.stringify({blocks:33,buildings:139,surfaces:group.children.length,triangles:hashes.size,corrections:result.corrections}));
