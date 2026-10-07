import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {blockIndex,blockSelection,aggregateState} from '../src/seguimiento3d-cuadras.js'
import {report} from '../src/seguimiento3d-model.js'
import {uploadPayload} from '../src/seguimiento3d-fotos.js'
const data=JSON.parse(await readFile('public/seguimiento-ligero.json'))
const registry=JSON.parse(await readFile('public/levantamiento/cuadras.json'))
const snapshot=JSON.stringify(data),index=blockIndex(data,registry)
const ids=[...index.blocks.flatMap(b=>b.members),...index.unassigned,...index.publicSpaces].map(b=>b.id)
assert.equal(ids.length,data.buildings.length)
assert.equal(new Set(ids).size,ids.length,'cada edificio tiene un destino único')
assert.deepEqual(new Set(ids),new Set(data.buildings.map(b=>b.id)))
assert.equal(JSON.stringify(data),snapshot,'no cambia los avances anteriores')
assert.equal(index.totalPhysicalBlocks,33);assert.equal(index.blocks.length,33);assert.equal(index.unassigned.length,0);assert.equal(index.publicSpaces.length,1);assert(index.blocks.every(b=>b.membershipComplete));assert.equal(index.blocks.flatMap(b=>b.members).length,139)
assert.deepEqual(index.blocks[0].members.map(b=>b.id),['B1-05','B1-06','B1-07'])
assert.equal(index.blocks[0].states.plan,'done','montaje visual explícito de la cuadra')
assert.equal(blockIndex(data,{...registry,blocks:registry.blocks.map(({visualFit,...b})=>b)}).blocks[0].states.plan,'partial','sin cierre visual explícito, las plantas no cierran el perímetro')
for(const state of ['active','partial','blocked','pending','waiting'])assert.notEqual(aggregateState(['done',state]),'done')
assert.equal(aggregateState([]),'pending')
assert.equal(aggregateState(['done','done']),'done')
const testRegistry={blocks:[{id:'TEST',buildingIds:[data.buildings[0].id],membershipComplete:false}]}
const testData={taskDefinitions:{plan:'Plantas',volume:'Volumen'},buildings:[{id:data.buildings[0].id,states:{plan:'done',volume:'done'}}]}
assert.equal(blockIndex(testData,testRegistry).blocks[0].states.volume,'partial')
assert.equal(blockIndex(testData,testRegistry).blocks[0].states.plan,'pending')
assert.throws(()=>blockIndex(data,{blocks:[...registry.blocks,{id:'OTHER',buildingIds:['B1-05']}]}))
assert.throws(()=>blockIndex(data,{blocks:[{id:'UNKNOWN',buildingIds:['NO-EXISTE']}]}))
const selection=blockSelection(index.blocks[0],'street','Calles')
const payload=report(selection.cell,'Revisar el lado norte','test','https://example.com')
assert.equal(payload.elemento.valores.scope,'block')
assert.equal(payload.elemento.valores.building,null)
assert.deepEqual(payload.elemento.valores.buildings,['B1-05','B1-06','B1-07'])
assert.notEqual(selection.cell.key,'B1-05:street','borradores independientes de edificios')
assert.equal(uploadPayload(selection.cell,{id:'test',data:'data:image/jpeg;base64,YQ=='},'synthetic').espacio_id,'levantamiento-cuadra:C01:street')
console.log(`Cuadras: ${index.blocks.length} identificada(s), ${index.unassigned.length} edificios por asignar, ${index.publicSpaces.length} espacio(s) público(s); ${ids.length} registros conservados.`)

const proof=JSON.parse(await readFile('public/levantamiento/cuadras/asignaciones.json'))
const source=JSON.parse(await readFile('public/levantamiento/cuadras/manzanas-inegi.geojson'))
const {createHash}=await import('node:crypto')
assert.equal(createHash('sha256').update(await readFile('public/levantamiento/cuadras/manzanas-inegi.geojson')).digest('hex'),registry.source.sha256)
assert.equal(createHash('sha256').update(await readFile('public/levantamiento/world.js')).digest('hex'),(proof.currentWorldSha256||proof.worldSha256))
assert.equal(proof.assignments.length,139)
assert.equal(new Set(proof.assignments.map(a=>a.buildingId)).size,139)
assert.equal(proof.assignments.filter(a=>a.geometryReviewPending).length,8)
function inside([x,y],ring){let yes=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [a,b]=ring[i],[c,d]=ring[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)yes=!yes}return yes}
for(const b of registry.blocks){
 assert(source.features.some(f=>f.properties.cvegeo===b.cvegeo))
 assert(!Object.values(b.taskStates).includes('done'),'el inventario no aprueba etapas físicas')
 const polys=b.boundaryLocal.type==='Polygon'?[b.boundaryLocal.coordinates]:b.boundaryLocal.coordinates
 for(const rings of polys)for(const ring of rings){assert.deepEqual(ring[0],ring.at(-1));assert(ring.every(p=>p.every(Number.isFinite)))}
 await readFile('public/'+b.inventoryEvidence)
 for(const id of b.buildingIds){const a=proof.assignments.find(a=>a.buildingId===id);assert.equal(a.cvegeo,b.cvegeo);assert(a.overlapRatio>a.secondOverlapRatio*2);assert(polys.some(rings=>inside(a.pointLocal,rings[0])&&!rings.slice(1).some(r=>inside(a.pointLocal,r))))}
}
console.log('Inventario completo: límites, pertenencia espacial, fuente y ocho revisiones verificadas.')
