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
// Historical envelopes can be re-exported without the later visual fit.
let sheetForExport=applySheetPlan;
if(process.argv.includes('--baseline')){
 const strip=s=>s.replace(/^import[^\n]*\n/gm,'').replace(/\nimport[^\n]*\n/gm,'');
 const code=strip(await readFile(root+'/sheet-plan-refinement.js','utf8')).replace('export function applySheetPlan','function applySheetPlan').replace('applyVisualFit(world, colliders, R);','').replace('applyParamento(world, colliders, R);','');
 const {footprintColliderCells}=await import('../public/levantamiento/isc58-refinement.js');
 const {applyStreetBatch50}=await import('../public/levantamiento/street-batch50-refinement.js');
 const {applyGroundReference}=await import('../public/levantamiento/ground-reference-refinement.js');
 sheetForExport=new Function('SHEET_PLANS','footprintColliderCells','applyStreetBatch50','applyGroundReference',code+';return applySheetPlan;')(SHEET_PLANS,footprintColliderCells,applyStreetBatch50,applyGroundReference);
}
const raw=source.replace(/^import[^\n]*\n/gm,'').replace(/\nimport[^\n]*\n/gm,'').replace(/export \{[^\n]+\};/,'');
const R=new Function('applyIsc58Refinement','applyEbSwRefinement','applyPlanRoundRefinement','applyStreetRoundRefinement','applySidewalkRoundRefinement','applyPlanReviewRefinement','applySheetPlanRefinement',raw+'\nreturn {createWorld:Fp,Vector3:U,Box3:Zt};')(applyIsc58,applyEbSw,applyPlanRound,applyStreetRound,applySidewalkRound,applyPlanReview,sheetForExport);
const originalFetch=globalThis.fetch;let world;try{globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await readFile(root+'/'+url))});world=await R.createWorld('',undefined,'pilot',{overview:true});}finally{globalThis.fetch=originalFetch;}


const {writeFile}=await import('node:fs/promises');
const tracking=JSON.parse(await readFile('public/seguimiento-3d.json'));
const targets=tracking.blocks.flatMap(b=>b.buildings).filter(b=>!b.publicSpace&&!SHEET_PLANS.some(p=>p.id===b.id));
const entries=[];world.updateMatrixWorld(true);
for(const b of targets){
 const prefixes=b.id==='OB-01'?['OB-01 · cubierta']:b.id==='EB-SW'?['La Barra Hidalgo','Club Obregón',...(world.userData.paramento?['El Colegio · remate','El Colegio · acceso']:[])]:[b.modelReference.owner];
 if(b.id==='ISC-58'&&world.userData.paramento)prefixes.push('ISC-58 · ala este del frente');
 const owners=prefixes.map(prefix=>{let found;world.traverse(o=>{if(!found&&o.name.startsWith(prefix))found=o});return found}).filter(Boolean);
 if(owners.length!==prefixes.length)throw Error('Ambiguous model owners '+b.id);
 const triangles=[],parts=[];
 for(const owner of owners){const ownTriangles=[];owner.traverse(m=>{
  if(!m.isMesh||m.isInstancedMesh||!m.geometry?.attributes.position)return;
  const p=m.geometry.attributes.position,idx=m.geometry.index?.array||Array.from({length:p.count},(_,i)=>i);
  for(let i=0;i<idx.length;i+=3){const vs=[0,1,2].map(j=>new R.Vector3().fromBufferAttribute(p,idx[i+j]).applyMatrix4(m.matrixWorld));
   const area=Math.abs((vs[1].x-vs[0].x)*(vs[2].z-vs[0].z)-(vs[1].z-vs[0].z)*(vs[2].x-vs[0].x));
   if(area>1e-7)ownTriangles.push(vs.map(v=>[v.x,v.z]));
  }
 });triangles.push(...ownTriangles);parts.push({owner:owner.name,triangles:ownTriangles});}
 entries.push({id:b.id,owners:owners.map(o=>o.name),triangles,parts});
}
const plans=SHEET_PLANS.map(p=>{const owner=world.getObjectByName('Planta física · '+p.id),fit=owner.userData.fittedPlan;return {...p,points:fit?.points||p.points,holes:fit?.holes||p.holes,owner:owner.name};});
await writeFile(process.argv[2]||'/tmp/amalaya-inventory-envelopes.json',JSON.stringify({worldSha256:sheetHash(source),plans,entries}));
console.log('Exported '+entries.length+' legacy building envelopes');
