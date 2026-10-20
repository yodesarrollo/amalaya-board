import {readFile} from 'node:fs/promises';
import {applyIsc58} from '../../public/levantamiento/isc58-refinement.js';
import {applyEbSw} from '../../public/levantamiento/ebsw-refinement.js';
import {applyPlanRound} from '../../public/levantamiento/plantas-refinement.js';
import {applySidewalkRound} from '../../public/levantamiento/banquetas-refinement.js';
import {applyStreetRound} from '../../public/levantamiento/calzadas-refinement.js';
import {applyPlanReview} from '../../public/levantamiento/plan-review-refinement.js';
import {applySheetPlan} from '../../public/levantamiento/sheet-plan-refinement.js';
import {removePlanReviewHook} from '../preparar-revision-plantas.mjs';

export async function loadWorld({optimized=false,historical=false}={}) {
  const root='public/levantamiento', current=await readFile(root+'/world.js','utf8');
  const source=historical?removePlanReviewHook(current):current;
  let raw=source.replace(/^import[^\n]*\n/gm,'').replace(/\nimport[^\n]*\n/gm,'').replace(/export \{[^\n]+\};/,'');
  if(historical&&!optimized)raw=raw.replace('Up(c), c;','c;');
  const R=new Function('applyIsc58Refinement','applyEbSwRefinement','applyPlanRoundRefinement','applyStreetRoundRefinement','applySidewalkRoundRefinement','applyPlanReviewRefinement','applySheetPlanRefinement',raw+'\nreturn {createWorld:Fp,Group:Ot,Mesh:Y,Vector3:U,Box3:Zt,Matrix4:et,BufferGeometry:An,Float32BufferAttribute:J};')(applyIsc58,applyEbSw,applyPlanRound,applyStreetRound,applySidewalkRound,applyPlanReview,applySheetPlan);
  const originalFetch=globalThis.fetch;let world;
  try {globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await readFile(root+'/'+url))});world=await R.createWorld('',undefined,'pilot',{overview:!optimized});}
  finally {globalThis.fetch=originalFetch;}
  world.updateMatrixWorld(true);return {world,R,source};
}

export function exportTriangles(world,R,bounds=[48,-42,154,48]) {
  const triangles=[],meshes=[];
  world.traverse(m=>{
    if(!m.isMesh||!m.geometry?.attributes.position)return;
    for(let a=m;a;a=a.parent)if(!a.visible)return;
    const box=new R.Box3().setFromObject(m);
    if(box.max.x<bounds[0]||box.min.x>bounds[2]||box.max.z<bounds[1]||box.min.z>bounds[3])return;
    const id=meshes.length;
    meshes.push({id,name:m.name,parent:m.parent?.name,min:box.min.toArray(),max:box.max.toArray(),type:m.geometry.type,count:m.count||1,userData:m.userData});
    const p=m.geometry.attributes.position,idx=m.geometry.index?.array||Array.from({length:p.count},(_,i)=>i);
    const matrices=[];
    if(m.isInstancedMesh){for(let i=0;i<m.count;i++){const mat=new R.Matrix4();m.getMatrixAt(i,mat);mat.premultiply(m.matrixWorld);matrices.push(mat);}}
    else matrices.push(m.matrixWorld);
    for(const mat of matrices)for(let i=0;i<idx.length;i+=3){
      const v=[0,1,2].map(j=>new R.Vector3().fromBufferAttribute(p,idx[i+j]).applyMatrix4(mat));
      if(v.every(q=>q.x<bounds[0])||v.every(q=>q.x>bounds[2])||v.every(q=>q.z<bounds[1])||v.every(q=>q.z>bounds[3]))continue;
      let material=m.material;
      if(Array.isArray(material)){const g=m.geometry.groups.find(g=>i>=g.start&&i<g.start+g.count);material=material[g?.materialIndex||0];}
      triangles.push([...v.flatMap(q=>q.toArray()),material?.color?.getHexString()||'bbbbbb',id]);
    }
  });return {triangles,meshes};
}
