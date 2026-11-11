// Overview LOD (opt-in liteLod): the phone binary must carry every LOD wall and
// opening panel, and none of the perforated surfaces it replaces; the walk view
// must keep those real openings. Generic for every building that opts in.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Vector3,Color} from 'three';
import {crearMundoLigero} from './mundo-ligero.mjs';
import {lodTriangles,LOD_OFFSET} from './lod-ligero.mjs';
const root='public/levantamiento/';
const bytes=await readFile(root+'modelo-ligero.bin'),meta=JSON.parse(await readFile(root+'modelo-ligero.json'));
const key=(v,color)=>[v.slice(0,3).join(','),v.slice(3,6).join(','),v.slice(6,9).join(',')].sort().join(';')+';'+color;
const actual=new Set();
for(let i=0;i<bytes.length;i+=20)actual.add(key(Array.from({length:9},(_,j)=>bytes.readInt16LE(i+j*2)),meta.palette[bytes.readUInt16LE(i+18)]));
// Same shading and 5 cm quantization as generar-vista-ligera.mjs.
const quantized=(vs,hex)=>{
 const n=vs[1].clone().sub(vs[0]).cross(vs[2].clone().sub(vs[0])),size=n.length();if(size<.005)return null;
 const shade=.68+.32*Math.abs((n.x*-.3+n.y+n.z*.25)/(size*1.074));
 const color='#'+[(hex>>16)&255,(hex>>8)&255,hex&255].map(v=>Math.round(v*shade).toString(16).padStart(2,'0')).join('');
 const v=vs.flatMap(p=>p.toArray().map(x=>Math.round(x/.05))),a=[0,1,2].map(j=>v[3+j]-v[j]),b=[0,1,2].map(j=>v[6+j]-v[j]);
 if(a[1]*b[2]===a[2]*b[1]&&a[2]*b[0]===a[0]*b[2]&&a[0]*b[1]===a[1]*b[0])return null;
 return key(v,color);
};
{
 // Same world the generator exports (territorial material merge disabled).
 const {world}=await crearMundoLigero('public/levantamiento');world.updateMatrixWorld(true);
 const owners=[];world.traverse(o=>{if(o.userData.liteLod)owners.push(o);});
 assert(owners.length>=1,'Al menos un edificio con LOD de vista ligera');
 const ids=owners.map(o=>o.userData.buildingId);assert(ids.includes('D1-12'),'El 89 (D1-12) usa LOD');
 assert.equal(meta.lod?.walls,owners.reduce((s,o)=>s+o.userData.liteLod.length,0),'Muros LOD declarados en el binario');
 const report=[];
 for(const owner of owners){
  const id=owner.userData.buildingId,lodKeys=new Set();let lodFaces=0,skipped=0,openings=0;
  for(const w of owner.userData.liteLod){
   assert(w.length>0&&w.height>0&&w.matrix.length===16&&w.matrix.every(Number.isFinite),id+': muro LOD válido');
   for(const v of w.bays){openings++;
    assert(v.x-v.w/2>=-1e-6&&v.x+v.w/2<=w.length+1e-6&&v.b>=-1e-6&&v.b+v.h<=w.height+1e-6,id+': vano dentro del muro');
    assert(/^#[0-9a-f]{6}$/i.test(v.color),id+': color del vano');
   }
   // Opening panels stand outside the wall plane: the outward normal is local +z.
   const e=w.matrix,normal=new Vector3(e[8],e[9],e[10]).normalize();
   for(const t of lodTriangles(w,Vector3)){
    if(t.part==='vano'){const origin=new Vector3(e[12],e[13],e[14]);assert(Math.abs(t.vs[0].clone().sub(origin).dot(normal)-LOD_OFFSET)<1e-6,id+': panel 6 cm al frente');}
    const k=quantized(t.vs,new Color(t.color).getHex());if(!k)continue;
    assert(actual.has(k),id+': cara LOD ausente del binario ('+t.part+')');lodFaces++;lodKeys.add(k);
   }
  }
  // Perforated shells, recessed fills and hidden floor slabs stay in the walk, but
  // not in the overview; roofs keep only their upward cap, boxes lose underside/ends.
  const skipMeshes=[],topMeshes=[],boxMeshes=[];owner.traverse(m=>{if(!m.isMesh)return;if(m.userData.lite==='skip')skipMeshes.push(m);if(m.userData.lite==='top')topMeshes.push(m);if(m.userData.lite==='caras')boxMeshes.push(m);});
  assert(skipMeshes.length>0,id+': el recorrido conserva los vanos perforados');
  assert(topMeshes.length>0,id+': cubierta con tapa superior en la vista ligera');
  let roofCap=0,roofKept=0;
  for(const m of topMeshes){const p=m.geometry.attributes.position,hex=m.material.color.getHex();
   for(let i=0;i<p.count;i+=3){const vs=[0,1,2].map(j=>new Vector3().fromBufferAttribute(p,i+j).applyMatrix4(m.matrixWorld)),n=vs[1].clone().sub(vs[0]).cross(vs[2].clone().sub(vs[0])),size=n.length();if(size<.005)continue;
    const k=quantized(vs,hex);if(n.y/size>=.999){roofCap+=size/2;if(k){assert(actual.has(k),id+': tapa de cubierta ausente de la vista ligera');roofKept++;}}
    else if(k)assert(!actual.has(k),id+': canto o fondo de cubierta presente en la vista ligera');}}
  assert(roofCap>1&&roofKept>0,id+': área de cubierta conservada');
  for(const m of boxMeshes){const p=m.geometry.attributes.position,hex=m.material.color.getHex();
   for(let i=0;i<p.count;i+=3){const vs=[0,1,2].map(j=>new Vector3().fromBufferAttribute(p,i+j).applyMatrix4(m.matrixWorld)),n=vs[1].clone().sub(vs[0]).cross(vs[2].clone().sub(vs[0])),size=n.length(),k=quantized(vs,hex);if(!k)continue;
    if(n.y/size<-.999||size<.05)assert(!actual.has(k),id+': fondo de pretil o equipo presente en la vista ligera');}}
  for(const m of skipMeshes){
   const p=m.geometry.attributes.position,hex=m.material.color.getHex();
   for(let i=0;i<p.count;i+=3){
    const vs=[0,1,2].map(j=>new Vector3().fromBufferAttribute(p,i+j).applyMatrix4(m.matrixWorld)),k=quantized(vs,hex);
    // A plain wall's outer face is the same surface as its LOD quad.
    if(!k||lodKeys.has(k))continue;assert(!actual.has(k),id+': superficie perforada presente en la vista ligera');skipped++;
   }
  }
  report.push({id,muros:owner.userData.liteLod.length,vanos:openings,carasLOD:lodFaces,carasReemplazadas:skipped,cubiertaM2:+roofCap.toFixed(1)});
 }
 console.log(JSON.stringify({pass:true,edificios:report}));
}
