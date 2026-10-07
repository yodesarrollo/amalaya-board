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
assert.equal(index.totalPhysicalBlocks,null,'no confunde sectores con cuadras')
assert.deepEqual(index.blocks[0].members.map(b=>b.id),['B1-05','B1-06','B1-07'])
assert.equal(index.blocks[0].states.plan,'partial','plantas aprobadas no cierran el perímetro')
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
