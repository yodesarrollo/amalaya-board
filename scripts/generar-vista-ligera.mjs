// Precompute the overview once at publication; phones never construct the detailed world.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {Color} from 'three';
import {lodTriangles} from './lod-ligero.mjs';
import {columns,cellInfo} from '../src/seguimiento3d-model.js';
import {crearMundoLigero} from './mundo-ligero.mjs';
const root='public/levantamiento',{R,world,source}=await crearMundoLigero(root);
const data=JSON.parse(await readFile('public/seguimiento-3d.json','utf8'));
const buildingOwners=data.blocks.flatMap(b=>b.buildings).filter(b=>!b.publicSpace).map(b=>b.modelReference?.owner).filter(Boolean).concat(['OB-01 · cubierta','La Barra Hidalgo']);
world.updateMatrixWorld(true);const faces=[],palette=[],colors=new Map();let originalTriangles=0;const faceKeys=new Set();let collapsedTriangles=0,duplicateTriangles=0;
const visibleChain=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
const collect=m=>{
 if(m.userData.liteLod&&visibleChain(m))lodFaces(m);
 if(m.userData.lite==='skip')return;
 if(!m.isMesh||!m.geometry?.attributes.position||/Icosahedron|Sphere|Torus|Tube|Cylinder/.test(m.geometry.type))return;
 let buildingFace=false,reviewedFrontage=false;
 for(let p=m;p;p=p.parent){if(!p.visible)return;if(p.userData.frontageId)reviewedFrontage=true;if(buildingOwners.some(name=>p.name.startsWith(name)))buildingFace=true;}
 // Structural surfaces keep every triangle; grilles and trim may simplify in the overview.
 if(reviewedFrontage)buildingFace=/^Paramento · (muro|cubierta|base|cierre)/.test(m.name);
 buildingFace=(buildingFace||m.userData.liteStructural===true)&&!m.isInstancedMesh;
 const p=m.geometry.attributes.position;if(p.count>15000)return;
 const idx=m.geometry.index?.array||Array.from({length:p.count},(_,i)=>i),mats=Array.isArray(m.material)?m.material:[m.material],mat=m.matrixWorld.clone(),instance=mat.clone();
 for(let k=0;k<(m.isInstancedMesh?m.count:1);k++){
  if(m.isInstancedMesh){m.getMatrixAt(k,instance);mat.multiplyMatrices(m.matrixWorld,instance);}else mat.copy(m.matrixWorld);
  const pts=[];for(let i=0;i<p.count;i++)pts.push(new R.Vector3().fromBufferAttribute(p,i).applyMatrix4(mat));
  for(let i=0;i<idx.length;i+=3){const vs=[pts[idx[i]],pts[idx[i+1]],pts[idx[i+2]]];if(vs.some(v=>!v.toArray().every(Number.isFinite))||(!buildingFace&&vs.every(v=>v.y>35))||vs.every(v=>v.y<-.2))continue;
   const n=vs[1].clone().sub(vs[0]).cross(vs[2].clone().sub(vs[0])),size=n.length();if(size<.005)continue;originalTriangles++;
   // Overview LOD roof: only the upward cap; its underside and edges hide behind the walls.
   if(m.userData.lite==='top'&&n.y/size<.999)continue;
   // Overview LOD boxes (parapets, rooftop equipment): no underside, no sliver ends.
   if(m.userData.lite==='caras'&&(n.y/size<-.999||size<.05))continue;
   // Keep building wall/roof faces even when small: dropping these opens holes.
   // Only unrelated/instanced decoration may use the area simplification.
   if(!buildingFace&&!m.name.startsWith('Planta física · ')&&!m.userData.visualFit&&size<1)continue;
   const group=m.geometry.groups.find(g=>i>=g.start&&i<g.start+g.count),material=mats[group?.materialIndex||0];if(material?.visible===false)continue;
   store(vs,n,size,material?.color?.getHex()??0xc3bcab);
  }
 }
};
function store(vs,n,size,c){
 const shade=.68+.32*Math.abs((n.x*-.3+n.y+n.z*.25)/(size*1.074));
 const hex='#'+[((c>>16)&255),(c>>8)&255,c&255].map(v=>Math.round(v*shade).toString(16).padStart(2,'0')).join('');
 if(!colors.has(hex)){colors.set(hex,palette.length);palette.push(hex);}
 const xyz=vs.flatMap(v=>v.toArray().map(x=>Math.round(x/.05)));if(xyz.some(x=>x<-32768||x>32767))throw Error('Overview coordinate out of bounds');
 // Quantization can collapse sub-5cm triangles; removing zero-area faces
 // changes no visible surface and avoids paying for invisible geometry.
 const a=[0,1,2].map(j=>xyz[3+j]-xyz[j]),b=[0,1,2].map(j=>xyz[6+j]-xyz[j]);
 if(a[1]*b[2]===a[2]*b[1]&&a[2]*b[0]===a[0]*b[2]&&a[0]*b[1]===a[1]*b[0]){collapsedTriangles++;return;}
 const key=[xyz.slice(0,3).join(','),xyz.slice(3,6).join(','),xyz.slice(6,9).join(',')].sort().join(';')+';'+colors.get(hex);
 if(faceKeys.has(key)){duplicateTriangles++;return;}faceKeys.add(key);
 faces.push([...xyz,colors.get(hex)]);
}
// Opt-in overview LOD (paramento wall() with liteLod): see scripts/lod-ligero.mjs.
let lodWalls=0,lodOpenings=0;
function lodFaces(o){
 for(const w of o.userData.liteLod){
  for(const {vs,color} of lodTriangles(w,R.Vector3)){
   if(vs.some(v=>!v.toArray().every(Number.isFinite)))continue;
   const n=vs[1].clone().sub(vs[0]).cross(vs[2].clone().sub(vs[0])),size=n.length();if(size<.005)continue;
   originalTriangles++;store(vs,n,size,new Color(color).getHex());
  }
  lodWalls++;lodOpenings+=w.bays.length;
 }
}
world.traverse(collect);
const actualTriangles=faces.length,concept=R.createConcept();world.add(concept);world.updateMatrixWorld(true);concept.traverse(collect);
const bytes=Buffer.alloc(faces.length*20);for(let i=0;i<faces.length;i++){for(let j=0;j<9;j++)bytes.writeInt16LE(faces[i][j],i*20+j*2);bytes.writeUInt16LE(faces[i][9],i*20+18);}
const version=createHash('sha256').update(bytes).digest('hex').slice(0,12);
await writeFile(root+'/modelo-ligero.bin',bytes);
await writeFile(root+'/modelo-ligero.json',JSON.stringify({version,scale:.05,triangles:faces.length,actualTriangles,originalTriangles,collapsedTriangles,duplicateTriangles,lod:{walls:lodWalls,openings:lodOpenings},palette,url:'levantamiento/modelo-ligero.bin?v='+version,worldSha256:createHash('sha256').update(source).digest('hex'),limits:'Vista simplificada; las plantas y sus patios se conservan. El detalle permanece en el recorrido 3D.'}));
const buildings=[];for(const col of columns(data)){
 const b=col.building,progress=b.visualProgress;let camera=null;
 if(progress?.manifest){const rec=JSON.parse(await readFile('public/'+progress.manifest));const cam=rec.camera||rec.current?.camera;camera=cam?{target:cam.target||cam.center,span:cam.span}:null;}
 buildings.push({id:b.id,name:b.name,block:col.block.id,zone:col.block.name,publicSpace:!!b.publicSpace,states:Object.fromEntries(Object.keys(data.taskDefinitions).map(t=>[t,cellInfo(col,t).state])),image:progress?.current?.url||progress?.baseline?.url,record:progress?.manifest,camera});
}
const compact={updatedAt:data.updatedAt,taskDefinitions:data.taskDefinitions,buildings};
await writeFile('public/seguimiento-ligero.json',JSON.stringify(compact));
console.log(`Vista ligera: ${faces.length}/${originalTriangles} caras, ${bytes.length} bytes; índice ${Buffer.byteLength(JSON.stringify(compact))} bytes, ${buildings.length} entradas.`);
