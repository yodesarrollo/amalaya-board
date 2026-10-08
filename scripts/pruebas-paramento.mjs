import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {removeSheetHook,refineSheet,sheetHash,SHEET_BASE} from './preparar-lamina.mjs';
import {SHEET_PLANS} from '../public/levantamiento/sheet-plan-data.js';
import {applySheetPlan} from '../public/levantamiento/sheet-plan-refinement.js';
import {applyPlanReview} from '../public/levantamiento/plan-review-refinement.js';
import {applyIsc58} from '../public/levantamiento/isc58-refinement.js';
import {applyEbSw} from '../public/levantamiento/ebsw-refinement.js';
import {applyPlanRound} from '../public/levantamiento/plantas-refinement.js';
import {applySidewalkRound} from '../public/levantamiento/banquetas-refinement.js';
import {applyStreetRound} from '../public/levantamiento/calzadas-refinement.js';
const root='public/levantamiento',source=await readFile(root+'/world.js','utf8'),runtime=await readFile(root+'/sheet-plan-refinement.js');
for(const [kind,path] of [['world','world.js'],['visor','visor/assets/index-RoPA5goG.js']]){const s=await readFile(root+'/'+path,'utf8');assert.equal(sheetHash(removeSheetHook(s,kind)),SHEET_BASE[kind]);assert.equal(refineSheet(s,kind,sheetHash(runtime)),s);}
const raw=source.replace(/^import[^\n]*\n/gm,'').replace(/\nimport[^\n]*\n/gm,'').replace(/export \{[^\n]+\};/,'');
const R=new Function('applyIsc58Refinement','applyEbSwRefinement','applyPlanRoundRefinement','applyStreetRoundRefinement','applySidewalkRoundRefinement','applyPlanReviewRefinement','applySheetPlanRefinement',raw+'\nreturn {createWorld:Fp,Vector3:U,Box3:Zt};')(applyIsc58,applyEbSw,applyPlanRound,applyStreetRound,applySidewalkRound,applyPlanReview,applySheetPlan);
const originalFetch=globalThis.fetch;let world;try{globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await readFile(root+'/'+url))});world=await R.createWorld('',undefined,'pilot',{overview:true});}finally{globalThis.fetch=originalFetch;}
const {applyParamento}=await import('../public/levantamiento/paramento-refinement.js');
const {verifyRoadClearance}=await import('./encaje-geometry-checks.mjs');
const {VISUAL_FIT}=await import('../public/levantamiento/ajuste-visual-data.js');
const result=world.userData.paramento,colliders=world.userData.navigationColliders;
assert(result&&result.landSurvey===false);assert.equal(applyParamento(world,colliders,R),result);
world.updateMatrixWorld(true);
const byPart=id=>{let found;world.traverse(o=>{if(o.userData.frontageId===id)found=o});assert(found,id);return found;};
const roofVertices=id=>{const group=byPart(id),m=group.children.find(m=>m.name.startsWith('Paramento · cubierta')),p=m.geometry.attributes.position;assert(m);return Array.from({length:p.count},(_,i)=>new R.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld));};
// Physical roof geometry, not just registry values, must meet at the observed changes of colour.
for(const [a,b,x,z] of [['barra','club',85.258,5.901],['club','colegio-alto',92.194,4.975],['colegio-alto','colegio',102.1,3.654]]){
 for(const id of [a,b])assert(roofVertices(id).some(p=>Math.hypot(p.x-x,p.z-z)<.025),id+' meets the shared frontage');
 const q=new R.Vector3(x,1.6,z-.45);assert(colliders.some(c=>c.containsPoint(q)),'No walkable fictitious alley between '+a+' and '+b);
}
for(const p of roofVertices('colegio'))assert(Number.isFinite(p.y));
assert(!colliders.some(c=>c.containsPoint(new R.Vector3(135,1.6,-16))),'The visible parking courtyard cannot remain a collision solid');
assert(!colliders.some(c=>c.containsPoint(new R.Vector3(-178,1.6,53))),'W02 open front yard stays clear of the former C1-03 mass');
const parking=world.getObjectByName('Planta física · B3-02');assert.equal(parking.geometry.parameters.shapes.holes.length,1);
assert(world.getObjectByName('Planta física · B1-09').userData.heightMeters>world.getObjectByName('Planta física · B1-08').userData.heightMeters*3,'Tower and low garage are distinct masses');
const points=JSON.parse(await readFile('public/recorrido/rutas.json')).rutas.find(r=>r.id==='R-001').puntos;
const extraStations=[{lat:29.075781,lng:-110.957122},{lat:29.07583,lng:-110.9565574},{lat:29.0757712,lng:-110.9562256}];
for(const p of [...points,...extraStations]){const v=new R.Vector3((p.lng+110.9547151)*97200,1.6,(29.076115-p.lat)*110950);assert(!colliders.some(c=>c.containsPoint(v)),'The inspected street station stays walkable: '+p.id);}
world.traverse(m=>{if(!m.isMesh||!m.geometry?.attributes.position)return;assert(Array.from(m.geometry.attributes.position.array).every(Number.isFinite),'No broken/non-finite model faces');});
const roads=VISUAL_FIT.surfaces.filter(s=>s.kind==='road').map(s=>({triangles:Array.from({length:s.triangles.length/6},(_,i)=>Array.from({length:3},(_,j)=>s.triangles.slice(i*6+j*2,i*6+j*2+2)))}));
console.log('Paramento:',verifyRoadClearance(world,colliders,R,roads));
console.log(JSON.stringify({frontages:result.frontages.length,heightReviews:result.heightReviews.length,courtyards:result.courtyards.length,joins:result.joins.length,streetStations:points.length+extraStations.length}));
