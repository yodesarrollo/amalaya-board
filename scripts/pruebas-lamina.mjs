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
const area=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0]},0)/2);
function inside(p,poly){let v=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])v=!v;}return v;}
assert.equal(new Set(SHEET_PLANS.map(p=>p.id)).size,SHEET_PLANS.length);
assert.equal(world.userData.sheetPlan.entries.length,SHEET_PLANS.length);assert.equal(world.userData.sheetPlan.replacedGenericFront.removedColliders,1);
assert.equal(applySheetPlan(world,world.userData.navigationColliders,R),world.userData.sheetPlan);
const data=JSON.parse(await readFile('public/seguimiento-3d.json')),buildings=data.blocks.flatMap(b=>b.buildings);
assert(data.activeReview.inventoryComplete&&data.activeReview.readyForNextRound);assert.equal(data.activeReview.coverageSectors.filter(s=>s.state==='done').length,12);assert.deepEqual(data.activeReview.pendingBuildings,[]);
for(const p of SHEET_PLANS){
 assert(p.points.flat().every(Number.isFinite));assert(area(p.points)>1);for(const h of p.holes||[])assert(h.every(pt=>inside(pt,p.points)),p.id+' patio contenido');
 const mesh=world.getObjectByName('Planta física · '+p.id);assert(mesh?.isMesh&&!mesh.isInstancedMesh);const pos=mesh.geometry.attributes.position;let roof=0;
 for(let i=0;i<pos.count;i+=3){const v=[i,i+1,i+2].map(k=>new R.Vector3().fromBufferAttribute(pos,k).applyMatrix4(mesh.matrixWorld));if(v.every(q=>Math.abs(q.y-(p.heightMeters+.05))<.001))roof+=area(v.map(q=>[q.x,q.z]));}
 assert(Math.abs(roof-(area(p.points)-(p.holes||[]).reduce((s,h)=>s+area(h),0)))<.1,p.id+' área de cubierta real');
 const b=buildings.find(b=>b.id===p.id);assert(b);const rec=JSON.parse(await readFile('public/'+b.visualProgress.manifest));assert.deepEqual(rec.source.points,p.points);assert.deepEqual(rec.source.holes,p.holes);assert.equal(rec.heightMeasured,false);assert(rec.triangles>0);
}
for(const b of buildings){assert.equal(b.tasks.plan,'done',b.id);assert.equal(b.reviewTasks?.plan||'done','done');assert(b.visualProgress?.manifest);const p=b.visualProgress.current,bytes=await readFile('public/'+p.url);assert.equal(sheetHash(bytes),p.sha256,b.id+' imagen actual');assert.equal(bytes.readUInt32BE(16),960);assert.equal(bytes.readUInt32BE(20),600);assert(b.modelReference?.modelUrl?.includes('modelo-completo.html'));}
for(const name of ['OB-01 · cubierta del estacionamiento · piloto de detalle','OB-02 · fachada gris con arcos y rejas · exterior interpretado'])assert(world.getObjectByName(name));
console.log(`Lámina: ${buildings.length} plantas cerradas; ${SHEET_PLANS.length} contornos individualizados; 12 sectores; geometría, patios, imágenes, registros y reversibilidad verificados.`);
