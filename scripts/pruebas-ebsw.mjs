import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {applyEbSw} from '../public/levantamiento/ebsw-refinement.js'
import {removeEbSwHook,refineEbSw,EB_BASE_WORLD,EB_BASE_VISOR} from './preparar-ebsw.mjs'
import {removeIsc58Hook,sha256} from './preparar-isc58.mjs'
const source=await readFile('public/levantamiento/world.js','utf8'),visor=await readFile('public/levantamiento/visor/assets/index-RoPA5goG.js','utf8'),moduleHash=sha256(await readFile('public/levantamiento/ebsw-refinement.js'))
const p=JSON.parse(await readFile('public/levantamiento/ebsw-provenance.json','utf8')),stage=Number(process.argv[2]||p.stage)
assert.equal(sha256(removeEbSwHook(source)),EB_BASE_WORLD);assert.equal(sha256(removeEbSwHook(visor,'visor')),EB_BASE_VISOR)
assert.equal(source,refineEbSw(source,'world',moduleHash,p.stage));assert.equal(visor,refineEbSw(visor,'visor',moduleHash,p.stage))
assert.throws(()=>refineEbSw(source+'\n// unknown','world',moduleHash,9),/desconocido|coincide/)
const raw=removeIsc58Hook(removeEbSwHook(source)).replace(/export \{[^\n]+\};\s*$/,'')
const R=new Function(raw+'\nreturn {Group:Ot,Mesh:Y,Shape:$r,Path:Qr,ShapeGeometry:Wi,BoxGeometry:X,BufferGeometry:An,Float32BufferAttribute:J,Box3:Zt,Vector3:U,Ray:Vn,createProceduralMaterial:$,buildEast:Tp,roadWidth:Bu};')()
const osm=JSON.parse(await readFile('public/levantamiento/data/osm-plaza-hidalgo.json')),context=JSON.parse(await readFile('public/levantamiento/data/osm-context.json'))
const ray=(meshes,x,z,y=1)=>{const hits=[],r={ray:new R.Ray(new R.Vector3(x,y,z),new R.Vector3(0,-1,0)),near:0,far:20,params:{Mesh:{}}};for(const m of meshes)m.raycast(r,hits);return hits.sort((a,b)=>a.distance-b.distance)}
const meshList=root=>{const out=[];root.traverse(o=>{if(o.isMesh)out.push(o)});return out}
const geometryHash=m=>sha256(Buffer.from(m.geometry.attributes.position.array.buffer))
const stages=[3,4,7,8,9].filter(s=>s<=stage);let southHash
for(const s of stages){
 const east=R.buildEast(context,osm),world=new R.Group();world.add(east.group);world.updateMatrixWorld(true)
 const colliders=[...east.colliders],oldBoxes=[...colliders],beforeMeshes=meshList(east.group),road=beforeMeshes.filter(m=>m.name.includes('calzada en tramo OSM')),roadHashes=road.map(geometryHash)
 const neighbours=east.group.children.filter(g=>g.name.includes('ESQUINA ')).map(g=>({g,meshes:meshList(g).map(m=>[m,m.geometry,m.material])}))
 const stats=applyEbSw(world,colliders,R,s);world.updateMatrixWorld(true)
 assert.equal(applyEbSw(world,colliders,R,s),stats);assert.deepEqual(road.map(geometryHash),roadHashes)
 for(const n of neighbours)for(const [m,g,mat] of n.meshes){assert.equal(m.geometry,g);assert.equal(m.material,mat)}
 for(const side of s>=4?['south','north']:['south']){
  const rows=stats[side].records;let pair
  for(const a of rows){if(a.center[0]<80||a.center[0]>115)continue;const b=rows.find(b=>b!==a&&Math.abs(Math.hypot(a.center[0]-b.center[0],a.center[2]-b.center[2])-.94)<.001);if(b){const hits=ray(beforeMeshes,(a.center[0]+b.center[0])/2,(a.center[2]+b.center[2])/2);if(!hits.length||hits[0].point.y<.08){pair=[a,b];break}}}
  assert(pair,'Need an actual inherited paving joint');const x=(pair[0].center[0]+pair[1].center[0])/2,z=(pair[0].center[2]+pair[1].center[2])/2
  const before=ray(beforeMeshes,x,z),after=ray(meshList(east.group),x,z)
  assert(!before.length||before[0].point.y<.08,'Before repair: no tile across the sampled joint')
  assert(Math.abs(after[0].point.y-.1455)<1e-6,'After repair: substrate supports the joint')
  const base=east.group.getObjectByName(`EB-SW · base bajo juntas · ${side}`),pos=base.geometry.attributes.position
  for(let i=0;i<pos.count;i++)assert.equal(ray(road,pos.getX(i),pos.getZ(i)).length,0,'Base must not invade the asphalt')
  if(side==='south'){const hash=geometryHash(base);if(southHash)assert.equal(hash,southHash,'04+ must preserve 03');southHash=hash}
 }
 if(s>=7){
  assert.equal(stats.colliders.removed,4)
  const removed=oldBoxes.filter(b=>!colliders.includes(b));assert.equal(removed.length,4)
  let freed=0
  for(const b of removed)for(const x of [b.min.x+.01,b.max.x-.01])for(const z of [b.min.z+.01,b.max.z-.01]){
   const v=new R.Vector3(x,1.6,z);if(!colliders.some(c=>c.containsPoint(v))&&!ray(beforeMeshes,x,z,8).some(h=>h.point.y>1))freed++
  }
  assert(freed>=8,'The old inflated boxes must release demonstrably empty corners')
 }
 if(s>=8){
  const field=east.group.getObjectByName('EB-SW · muro con dos huecos arqueados reales');assert.equal(field.geometry.parameters.shapes.holes.length,2)
  const front=field.parent,normal=new R.Vector3(0,0,-1).transformDirection(front.matrixWorld)
  for(const bay of front.userData.openings){const origin=new R.Vector3(bay.x,bay.bottom+.4,1).applyMatrix4(front.matrixWorld),hits=[],r={ray:new R.Ray(origin,normal),near:0,far:2,params:{Mesh:{}}};field.raycast(r,hits);assert.equal(hits.length,0,'A real arch opening cannot contain a wall triangle');const pane=front.children.find(m=>m.name.includes(bay.role));pane.raycast(r,hits);assert(hits.length>0&&hits[0].distance>1.2,'The observed closed portal/pane is recessed behind the opening')}
 }
 if(s>=9){const meshes=meshList(east.group).filter(m=>m.material.userData.ebSwMetricUv);assert(meshes.length>0);for(const m of meshes)for(const k of ['map','normalMap','roughnessMap'])if(m.material[k])assert.deepEqual(m.material[k].repeat.toArray(),[1,1]);assert.equal(stats.finish.uvPeriodMeters,2.2)}
 console.log(`EB-SW ${s}: bases, calzada/vecinos, colisiones y geometría según alcance comprobados.`)
}
