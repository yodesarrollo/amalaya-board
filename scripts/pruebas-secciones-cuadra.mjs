import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {BLOCK_SECTIONS,blockSections} from '../src/seguimiento3d-secciones.js'
import {blockIndex} from '../src/seguimiento3d-cuadras.js'
import {VISUAL_FIT} from '../public/levantamiento/ajuste-visual-data.js'
const read=async path=>JSON.parse(await readFile(path,'utf8'))
const registry=await read('public/levantamiento/cuadras.json'),data=await read('public/seguimiento-ligero.json')
const index=blockIndex(data,registry),b=index.blocks.find(b=>b.id==='C08'),sections=blockSections(b)
assert.deepEqual(BLOCK_SECTIONS.flatMap(s=>s.tasks),Object.keys(data.taskDefinitions),'Las once acciones se conservan una sola vez')
assert.equal(sections.length,5)
assert.equal(sections[0].state,'done')
assert.equal(sections[1].state,'done','Punto 2 tiene su propio cierre por cuadra')
assert(sections.every(s=>s.state==='done'),'C08 tiene evidencia propia de las cinco etapas')
assert.equal(sections[1].inherited,3,'El avance previo de banquetas y esquinas se conserva')
assert(blockSections({...b,sectionReviews:{}}).every(s=>s.state==='pending'),'Un agregado sin evidencia no certifica una sección')
const r=await read('public/'+b.sectionReviews['1'].record)
assert.equal(r.scope,'block');assert.equal(r.building,null);assert.equal(r.section,1)
assert.deepEqual(r.members,b.buildingIds)
assert.deepEqual(r.changedBuildingIds,['C2-03'])
assert.equal(r.retainedBuildingIds.length,4)
assert.equal(r.checks.unchangedBuildings,138)
assert.equal(r.checks.roadOverlapArea,0);assert.equal(r.checks.parkingSamplesFree,true)
assert.deepEqual(r.next,{block:'C08',section:2,name:'Banquetas y esquinas',status:'pending'})
for(const image of Object.values(r.images))assert.equal(createHash('sha256').update(await readFile('public/'+image.url)).digest('hex'),image.sha256)
const correction=VISUAL_FIT.planCorrections.find(c=>c.id==='C2-03')
assert.deepEqual(r.geometry.after['C2-03'].coordinates[0].slice(0,-1),correction.points)
assert.equal(correction.sourceImageSha256,r.reference.imageSha256)
assert.equal(r.camera.sameBeforeAfter,true)
const r2=await read('public/'+b.sectionReviews['2'].record)
assert.equal(r2.section,2);assert.equal(r2.scope,'block');assert.equal(r2.building,null)
assert.deepEqual(r2.members,b.buildingIds)
assert.equal(r2.checks.unchangedBuildings,139)
assert.deepEqual(r2.checks.changedBuildings,[])
assert.equal(r2.checks.buildingCollidersUnchanged,true)
assert.equal(r2.checks.roadSidewalkOverlap,0)
assert.equal(r2.checks.buildingSidewalkOverlap,0)
assert.equal(r2.checks.parkingSamplesFree,true)
assert.equal(r2.next.section,3)
assert.equal(registry.workPlan.nextSection,1);assert.equal(registry.workPlan.activeBlock,'C20');assert.equal(registry.workPlan.activeNumber,9)
const evidenceBase='public/levantamiento/evidence/c08-punto2-20261008/'
for(const [file,hash] of Object.entries(r2.files))assert.equal(createHash('sha256').update(await readFile(evidenceBase+file)).digest('hex'),hash)
for(const id of ['C08','C08-peatonal','C08-rampa']){
 const recorded=r2.geometry.after.find(s=>s.id===id),current=VISUAL_FIT.surfaces.find(s=>s.id===id)
 assert.deepEqual(current,recorded,'La evidencia corresponde al suelo publicado '+id)
}
const ramp=VISUAL_FIT.surfaces.find(s=>s.id==='C08-rampa')
assert.equal(ramp.elevations.length,ramp.triangles.length/2)
assert(Math.max(...ramp.elevations)-Math.min(...ramp.elevations)>.20,'La rampa tiene pendiente, no una losa plana')
assert(VISUAL_FIT.surfaces.find(s=>s.id==='C08').curbEdges.length>4,'Guarniciones con retorno y sin barrera oriental')
assert.equal(r2.streetView.length,7)
const currentWorld=createHash('sha256').update(await readFile('public/levantamiento/world.js')).digest('hex');
for(const [id,num,first] of [['C08',1,3],['C30',8,1]]){
 const block=index.blocks.find(b=>b.id===id);assert.equal(block.displayNumber,num);assert(blockSections(block).every(s=>s.state==='done'));
 for(let n=first;n<=5;n++){
  const record=await read('public/'+block.sectionReviews[n].record);assert.equal(record.section,n);assert.deepEqual(record.members,block.buildingIds);assert.equal(record.worldSha256,currentWorld);assert.equal(record.approval,'visual-approximate');
  const base='public/'+block.sectionReviews[n].record.replace(/[^/]+$/,'');
  for(const [file,hash] of Object.entries(record.files))assert.equal(createHash('sha256').update(await readFile(base+file)).digest('hex'),hash);
  assert.equal(record.checks.streetIntrusions,0);assert.equal(record.checks.streetColliderIntrusions,0);assert.equal(record.checks.sheetFootprintsUnchanged,true);
 }
}
assert.deepEqual(registry.workPlan.sequence.map(s=>s.block),['C08','C30','C20','C21','C22','C23','C28','C29']);
assert.equal(new Set(registry.blocks.map(b=>b.displayNumber)).size,33);
assert(index.blocks.filter(b=>!['C08','C30'].includes(b.id)).every(b=>blockSections(b).every(s=>s.state==='pending')),'Ninguna cuadra futura se cierra por herencia');
console.log('Cuadras 1 y 8: cinco etapas con evidencia íntegra; historial preservado; siguiente cuadra 9.');
