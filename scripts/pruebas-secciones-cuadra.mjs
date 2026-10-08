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
assert(sections.slice(1).every(s=>s.state==='pending'),'Cerrar punto 1 no aprueba los otros cuatro')
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
console.log('Cinco secciones: C08 punto 1 acreditado, evidencia íntegra; puntos 2–5 e historial conservados.')
