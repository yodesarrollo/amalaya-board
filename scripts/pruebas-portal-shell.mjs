import assert from 'node:assert/strict'
import {AREAS,STATUS,SECTIONS,availableSections,resolveSection,PUBLIC_SECTIONS} from '../src/portal-model.js'
const data={Conocimientos:[],Finanzas_Lineas:[],Metas:[]}
const ids=x=>x.map(s=>s.id)
assert.deepEqual(ids(availableSections({role:'inversionista',data,models:true})),['reporte'],'El inversionista conserva sólo Reporte')
for(const role of ['admin','master','editor'])assert.ok(ids(availableSections({role,data})).includes('plan'))
for(const role of ['visor','demo'])assert.ok(!ids(availableSections({role,data})).includes('plan'))
assert.ok(!ids(availableSections({role:'admin',data})).includes('modelos'))
assert.ok(ids(availableSections({role:'admin',data,models:true})).includes('modelos'))
for(const id of ['recintos','finanzas','plan'])assert.ok(!ids(availableSections({role:'admin',data:{}})).includes(id),'No ofrece una vista sin su contrato de datos')
const publicSections=availableSections({publicMode:true});assert.deepEqual(ids(publicSections),PUBLIC_SECTIONS)
assert.ok(!ids(publicSections).includes('finanzas'));assert.ok(!ids(publicSections).includes('reporte'))
for(const id of ids(publicSections))assert.equal(resolveSection(id,publicSections),id)
assert.equal(resolveSection('recintos',publicSections),'mapa');assert.equal(resolveSection('javascript:alert(1)',publicSections),'mapa')
assert.equal(new Set(AREAS.map(a=>a.id)).size,AREAS.length)
for(const a of AREAS){assert.ok(STATUS[a.status]);assert.ok(a.data.length>0);assert.ok(a.ready.length>0);assert.ok(a.next.length>0);assert.ok(SECTIONS.some(s=>s.id===a.section));for(const id of a.connects)assert.ok(AREAS.some(x=>x.id===id))}
assert.equal(AREAS.find(a=>a.id==='conexiones').status,'pending')
console.log('Portal: roles, disponibilidad por datos/flag, rutas públicas, resolución segura y mapa con dependencias verificadas.')
