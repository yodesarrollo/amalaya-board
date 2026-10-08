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

world.updateMatrixWorld(true);
const triangles=[];
world.traverse(m=>{
 if(!m.isMesh||!m.visible||!m.geometry?.attributes.position)return;
 const p=m.geometry.attributes.position, idx=m.geometry.index?.array||Array.from({length:p.count},(_,i)=>i);
 const matrices=[];
 if(m.isInstancedMesh){for(let i=0;i<m.count;i++){const mat=m.matrixWorld.clone();m.getMatrixAt(i,mat);mat.premultiply(m.matrixWorld);matrices.push(mat)}}else matrices.push(m.matrixWorld);
 for(const mat of matrices)for(let i=0;i<idx.length;i+=3){
  const v=[0,1,2].map(j=>new R.Vector3().fromBufferAttribute(p,idx[i+j]).applyMatrix4(mat));
  if(v.every(q=>q.x < -150 || q.x > 30 || q.z < -10 || q.z > 125))continue;
  let material=m.material;
  if(Array.isArray(material)){const g=m.geometry.groups.find(g=>i>=g.start&&i<g.start+g.count);material=material[g?.materialIndex||0]}
  triangles.push([...v.flatMap(q=>q.toArray()),material.color?.getHexString()||'bbbbbb']);
 }
});
const {writeFile}=await import('node:fs/promises');
await writeFile(process.argv[2],JSON.stringify({worldSha256:sheetHash(source),triangles,colliders:world.userData.navigationColliders.map(c=>({min:c.min.toArray(),max:c.max.toArray(),buildingId:c.buildingId}))}));
console.log('Escena C08: '+triangles.length+' triángulos reales');
