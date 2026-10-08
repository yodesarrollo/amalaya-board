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
const registry=JSON.parse(await readFile(root+'/cuadras.json','utf8'));
const block=registry.blocks.find(b=>b.id===(process.argv[3]||'C08'));
assert(block,'Cuadra desconocida');
const vertices=block.boundaryLocal.coordinates.flat(2),xs=vertices.map(p=>p[0]),zs=vertices.map(p=>p[1]);
const bounds=[Math.min(...xs)-35,Math.min(...zs)-35,Math.max(...xs)+35,Math.max(...zs)+35];
const triangles=[];
world.traverse(m=>{
 if(!m.isMesh||!m.visible||!m.geometry?.attributes.position)return;
 const p=m.geometry.attributes.position, idx=m.geometry.index?.array||Array.from({length:p.count},(_,i)=>i);
 const matrices=[];
 if(m.isInstancedMesh){for(let i=0;i<m.count;i++){const mat=m.matrixWorld.clone();m.getMatrixAt(i,mat);mat.premultiply(m.matrixWorld);matrices.push(mat)}}else matrices.push(m.matrixWorld);
 for(const mat of matrices)for(let i=0;i<idx.length;i+=3){
  const v=[0,1,2].map(j=>new R.Vector3().fromBufferAttribute(p,idx[i+j]).applyMatrix4(mat));
  if(v.every(q=>q.x<bounds[0])||v.every(q=>q.x>bounds[2])||v.every(q=>q.z<bounds[1])||v.every(q=>q.z>bounds[3]))continue;
  let material=m.material;
  if(Array.isArray(material)){const g=m.geometry.groups.find(g=>i>=g.start&&i<g.start+g.count);material=material[g?.materialIndex||0]}
  triangles.push([...v.flatMap(q=>q.toArray()),material.color?.getHexString()||'bbbbbb']);
 }
});
const {writeFile}=await import('node:fs/promises');
const tracking=JSON.parse(await readFile('public/seguimiento-3d.json','utf8'));
const buildings=tracking.blocks.flatMap(b=>b.buildings).filter(b=>block.buildingIds.includes(b.id)).map(b=>{
 let owner;world.traverse(o=>{if(!owner&&o.name.startsWith(b.modelReference.owner))owner=o});
 if(!owner)return {id:b.id,owner:b.modelReference.owner,missing:true};const box=new R.Box3().setFromObject(owner);
 return {id:b.id,owner:owner.name,min:box.min.toArray(),max:box.max.toArray(),height:box.max.y-box.min.y};
});
await writeFile(process.argv[2],JSON.stringify({block:block.id,worldSha256:sheetHash(source),bounds,buildings,blockDetails:world.userData.paramento.blockDetails,triangles,colliders:world.userData.navigationColliders.map(c=>({min:c.min.toArray(),max:c.max.toArray(),buildingId:c.buildingId,blockDetail:c.blockDetail}))}));
console.log('Escena '+block.id+': '+triangles.length+' triángulos reales');
