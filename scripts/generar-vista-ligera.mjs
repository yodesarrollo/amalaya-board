// Precompute the overview once at publication; phones never construct the detailed world.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {columns,cellInfo} from '../src/seguimiento3d-model.js';
import {applySheetPlan} from '../public/levantamiento/sheet-plan-refinement.js';
import {applyPlanReview} from '../public/levantamiento/plan-review-refinement.js';
import {applyIsc58} from '../public/levantamiento/isc58-refinement.js';
import {applyEbSw} from '../public/levantamiento/ebsw-refinement.js';
import {applyPlanRound} from '../public/levantamiento/plantas-refinement.js';
import {applySidewalkRound} from '../public/levantamiento/banquetas-refinement.js';
import {applyStreetRound} from '../public/levantamiento/calzadas-refinement.js';
const root='public/levantamiento',source=await readFile(root+'/world.js','utf8');
const raw=source.replace(/^import[^\n]*\n/gm,'').replace(/\nimport[^\n]*\n/gm,'').replace(/export \{[^\n]+\};/,'').replace('Up(c), c;','c;');
const R=new Function('applyIsc58Refinement','applyEbSwRefinement','applyPlanRoundRefinement','applyStreetRoundRefinement','applySidewalkRoundRefinement','applyPlanReviewRefinement','applySheetPlanRefinement',raw+'\nreturn {createWorld:Fp,Vector3:U};')(applyIsc58,applyEbSw,applyPlanRound,applyStreetRound,applySidewalkRound,applyPlanReview,applySheetPlan);
const originalFetch=globalThis.fetch;let world;try{globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await readFile(root+'/'+url))});world=await R.createWorld('',undefined,'pilot');}finally{globalThis.fetch=originalFetch;}
world.updateMatrixWorld(true);const faces=[],palette=[],colors=new Map();let originalTriangles=0;
world.traverse(m=>{
 if(!m.isMesh||!m.geometry?.attributes.position||/Icosahedron|Sphere|Torus|Tube|Cylinder/.test(m.geometry.type))return;
 for(let p=m;p;p=p.parent)if(!p.visible)return;
 const p=m.geometry.attributes.position;if(p.count>15000)return;
 const idx=m.geometry.index?.array||Array.from({length:p.count},(_,i)=>i),mats=Array.isArray(m.material)?m.material:[m.material],mat=m.matrixWorld.clone(),instance=mat.clone();
 for(let k=0;k<(m.isInstancedMesh?m.count:1);k++){
  if(m.isInstancedMesh){m.getMatrixAt(k,instance);mat.multiplyMatrices(m.matrixWorld,instance);}else mat.copy(m.matrixWorld);
  const pts=[];for(let i=0;i<p.count;i++)pts.push(new R.Vector3().fromBufferAttribute(p,i).applyMatrix4(mat));
  for(let i=0;i<idx.length;i+=3){const vs=[pts[idx[i]],pts[idx[i+1]],pts[idx[i+2]]];if(vs.some(v=>!v.toArray().every(Number.isFinite))||vs.every(v=>v.y>35)||vs.every(v=>v.y<-.2))continue;
   const n=vs[1].clone().sub(vs[0]).cross(vs[2].clone().sub(vs[0])),size=n.length();if(size<.005)continue;originalTriangles++;
   // Keep every face of the surveyed footprints, including courtyard edges. Omit only small decorative faces elsewhere.
   if(!m.name.startsWith('Planta física · ')&&!m.userData.visualFit&&size<1)continue;
   const group=m.geometry.groups.find(g=>i>=g.start&&i<g.start+g.count),material=mats[group?.materialIndex||0];if(material?.visible===false)continue;
   const c=material?.color?.getHex()??0xc3bcab,shade=.68+.32*Math.abs((n.x*-.3+n.y+n.z*.25)/(size*1.074));
   const hex='#'+[((c>>16)&255),(c>>8)&255,c&255].map(v=>Math.round(v*shade).toString(16).padStart(2,'0')).join('');
   if(!colors.has(hex)){colors.set(hex,palette.length);palette.push(hex);}
   const xyz=vs.flatMap(v=>v.toArray().map(x=>Math.round(x/.05)));if(xyz.some(x=>x<-32768||x>32767))throw Error('Overview coordinate out of bounds');
   faces.push([...xyz,colors.get(hex)]);
  }
 }
});
const bytes=Buffer.alloc(faces.length*20);for(let i=0;i<faces.length;i++){for(let j=0;j<9;j++)bytes.writeInt16LE(faces[i][j],i*20+j*2);bytes.writeUInt16LE(faces[i][9],i*20+18);}
const version=createHash('sha256').update(bytes).digest('hex').slice(0,12);
await writeFile(root+'/modelo-ligero.bin',bytes);
await writeFile(root+'/modelo-ligero.json',JSON.stringify({version,scale:.05,triangles:faces.length,originalTriangles,palette,url:'levantamiento/modelo-ligero.bin?v='+version,worldSha256:createHash('sha256').update(source).digest('hex'),limits:'Vista simplificada; las plantas y sus patios se conservan. El detalle permanece en el recorrido 3D.'}));
const data=JSON.parse(await readFile('public/seguimiento-3d.json','utf8'));
const buildings=[];for(const col of columns(data)){
 const b=col.building,progress=b.visualProgress;let camera=null;
 if(progress?.manifest){const rec=JSON.parse(await readFile('public/'+progress.manifest));const cam=rec.camera||rec.current?.camera;camera=cam?{target:cam.target||cam.center,span:cam.span}:null;}
 buildings.push({id:b.id,name:b.name,block:col.block.id,zone:col.block.name,publicSpace:!!b.publicSpace,states:Object.fromEntries(Object.keys(data.taskDefinitions).map(t=>[t,cellInfo(col,t).state])),image:progress?.current?.url||progress?.baseline?.url,record:progress?.manifest,camera});
}
const compact={updatedAt:data.updatedAt,taskDefinitions:data.taskDefinitions,buildings};
await writeFile('public/seguimiento-ligero.json',JSON.stringify(compact));
console.log(`Vista ligera: ${faces.length}/${originalTriangles} caras, ${bytes.length} bytes; índice ${Buffer.byteLength(JSON.stringify(compact))} bytes, ${buildings.length} entradas.`);
