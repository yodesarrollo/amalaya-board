// Real binary check: eligibility alone cannot prove that 87 was exported.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Vector3} from 'three';
import {createWorld} from '../public/levantamiento/world.js';
const root='public/levantamiento/';
const bytes=await readFile(process.argv[2]||root+'modelo-ligero.bin');
const meta=JSON.parse(await readFile(process.argv[3]||root+'modelo-ligero.json'));
const key=(v,color)=>[v.slice(0,3).join(','),v.slice(3,6).join(','),v.slice(6,9).join(',')].sort().join(';')+';'+color;
const actual=new Set();
for(let i=0;i<bytes.length;i+=20)actual.add(key(Array.from({length:9},(_,j)=>bytes.readInt16LE(i+j*2)),meta.palette[bytes.readUInt16LE(i+18)]));
const oldFetch=globalThis.fetch;
globalThis.fetch=async u=>({ok:true,json:async()=>JSON.parse(await readFile(root+u,'utf8'))});
try{
 const world=await createWorld('',undefined,'pilot');world.updateMatrixWorld(true);
 const owner=world.getObjectByName('Planta física · D2-01');assert(owner,'87 owner');
 let small=0,collapsed=0;const expected=new Set(),sourceCounts={},survivingCounts={};
 owner.traverse(m=>{
  if(!m.isMesh)return;
  assert(m.userData.liteStructural,'87 structural classification');
  const p=m.geometry.attributes.position,idx=m.geometry.index?.array||Array.from({length:p.count},(_,i)=>i);
  for(let i=0;i<idx.length;i+=3){
   const vs=[0,1,2].map(j=>new Vector3().fromBufferAttribute(p,idx[i+j]).applyMatrix4(m.matrixWorld));
   const material=m.material.color.getHexString();sourceCounts[material]=(sourceCounts[material]||0)+1;
   const n=vs[1].clone().sub(vs[0]).cross(vs[2].clone().sub(vs[0])),size=n.length();if(size<.005){small++;continue;}
   const c=m.material.color.getHex(),shade=.68+.32*Math.abs((n.x*-.3+n.y+n.z*.25)/(size*1.074));
   const color='#'+[((c>>16)&255),(c>>8)&255,c&255].map(v=>Math.round(v*shade).toString(16).padStart(2,'0')).join('');
   const v=vs.flatMap(p=>p.toArray().map(x=>Math.round(x/.05))),a=[0,1,2].map(j=>v[3+j]-v[j]),b=[0,1,2].map(j=>v[6+j]-v[j]);
   if(a[1]*b[2]===a[2]*b[1]&&a[2]*b[0]===a[0]*b[2]&&a[0]*b[1]===a[1]*b[0]){collapsed++;continue;}
   const k=key(v,color);expected.add(k);
   assert(actual.has(k),'87 triangle/color absent from generated binary: '+m.name);
   survivingCounts[material]=(survivingCounts[material]||0)+1;
  }
 });
 // The full scene merges meshes by material. Count source geometry, not parentage.
 assert.deepEqual(sourceCounts,{'c1b7a5':20,'aaa99f':36,'b5b3a8':12},'20 native +36 panel +12 trim triangles');
 // The existing exporter drops tiny/zero-area faces at its 5cm quantization.
 // Require every nondegenerate triangle AND all three materials, not a guessed floor.
 assert.equal(small,4,'Only four sub-threshold trim sides');assert.equal(collapsed,14,'Only fourteen quantized zero-area faces');
 assert.equal(expected.size,50,'All fifty distinct quantized surfaces must survive');
 for(const color of Object.keys(sourceCounts))assert(survivingCounts[color]>=2,'Visible surfaces for '+color);
 console.log(JSON.stringify({pass:true,id:'D2-01',sourceCounts,survivingCounts,small,collapsed,expectedUniqueTriangles:expected.size,matched:expected.size,binaryBytes:bytes.length,limits:'Binary containment, not visual fidelity, WebGL walk or device performance.'}));
}finally{globalThis.fetch=oldFetch;}
