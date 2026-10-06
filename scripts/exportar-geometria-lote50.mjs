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


const triangles=[];world.updateMatrixWorld(true);
world.traverse(m=>{if(!m.isMesh||!m.geometry?.attributes.position)return;for(let p=m;p;p=p.parent)if(!p.visible)return;const p=m.geometry.attributes.position,idx=m.geometry.index?.array||Array.from({length:p.count},(_,i)=>i),mat=m.matrixWorld.clone(),instance=mat.clone();
for(let k=0;k<(m.isInstancedMesh?m.count:1);k++){if(m.isInstancedMesh){m.getMatrixAt(k,instance);mat.multiplyMatrices(m.matrixWorld,instance);}else mat.copy(m.matrixWorld);const pts=[];for(let i=0;i<p.count;i++)pts.push(new R.Vector3().fromBufferAttribute(p,i).applyMatrix4(mat));for(let i=0;i<idx.length;i+=3){const vs=[pts[idx[i]],pts[idx[i+1]],pts[idx[i+2]]];if(vs.some(v=>!v.toArray().every(Number.isFinite)))continue;const group=m.geometry.groups.find(g=>i>=g.start&&i<g.start+g.count),material=Array.isArray(m.material)?m.material[group?.materialIndex||0]:m.material;if(!material||material.visible===false)continue;triangles.push([...vs.flatMap(v=>v.toArray()),material.color?.getHexString()||'c3bcab',m.name]);}}});
const {writeFile}=await import('node:fs/promises');await writeFile(process.argv[2]||'/tmp/amalaya-geometry.json',JSON.stringify({triangles,plans:SHEET_PLANS,colliders:world.userData.navigationColliders,streetBatch:world.userData.streetBatch50}));console.log(triangles.length+' triangles exported');
