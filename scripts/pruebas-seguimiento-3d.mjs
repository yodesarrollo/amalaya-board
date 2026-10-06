import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const data = JSON.parse(await readFile(new URL('../public/seguimiento-3d.json', import.meta.url), 'utf8'))
const validStates = new Set(['done', 'partial', 'active', 'waiting', 'pending', 'blocked'])
const ids = new Set()
let totalMin = 0
let totalMax = 0
let buildingCount = 0

assert.equal(data.schemaVersion, 1)
assert.equal(data.refreshSeconds, 30)
assert.ok(data.live.title && data.live.detail)

for (const block of data.blocks) {
  assert.ok(block.id && block.name && block.next, `falta contexto en ${block.id || 'cuadra'}`)
  assert.ok(block.estimateHours.min <= block.estimateHours.max, `rango invertido en ${block.id}`)
  totalMin += block.estimateHours.min
  totalMax += block.estimateHours.max
  for (const state of Object.values(block.sharedTasks)) assert.ok(validStates.has(state), `${block.id}: estado compartido ${state}`)
  for (const building of block.buildings) {
    assert.ok(!ids.has(building.id), `ID de edificio duplicado: ${building.id}`)
    ids.add(building.id)
    buildingCount++
    assert.ok(building.estimateHours === null || building.estimateHours.min <= building.estimateHours.max, `rango invertido en ${building.id}`)
    for (const state of Object.values(building.tasks)) assert.ok(validStates.has(state), `${building.id}: estado ${state}`)
  }
}

assert.equal(buildingCount, 14, 'las anclas conocidas deben seguir contadas explícitamente')
assert.equal(totalMin, 81, 'el mínimo del resumen debe coincidir con los bloques')
assert.equal(totalMax, 152, 'el máximo del resumen debe coincidir con los bloques')
assert.equal(data.blocks.find(block => block.id === 'SER-GG')?.testRoute, true, 'R-000 debe seguir marcada como prueba')
assert.ok(data.blocks.every(block => typeof block.unnamedFronts === 'string'), 'los frentes anónimos deben quedar fuera de conteos inventados')

const page = await readFile(new URL('../seguimiento-3d.html', import.meta.url), 'utf8')
const app = await readFile(new URL('../src/seguimiento3d.jsx', import.meta.url), 'utf8')
const exploration = await readFile(new URL('../src/preview-recorrido.jsx', import.meta.url), 'utf8')
const access = await readFile(new URL('../src/componentes/Acceso.jsx', import.meta.url), 'utf8')
assert.ok(page.includes('src/seguimiento3d.jsx'))
assert.ok(app.includes('seguimiento-3d.json'))
assert.ok(!app.includes('usarDatos') && !app.includes('APPS_SCRIPT_URL'), 'el tablero público no debe cargar datos del negocio')
assert.ok(exploration.includes('./seguimiento-3d.html'), 'el recorrido público debe enlazar el seguimiento')
assert.ok(access.includes('./seguimiento-3d.html'), 'la entrada del board debe permitir abrir el seguimiento público')

const markdown = await readFile(new URL('../public/seguimiento-3d.md', import.meta.url), 'utf8')
assert.ok(markdown.includes('OB-YG · Obregón'))
assert.ok(markdown.includes('CH-YG · Yáñez'))
assert.ok(markdown.includes('SER-GG · Serdán'))
console.log(`Seguimiento 3D: ${data.blocks.length} tramos, ${buildingCount} anclas; estimación ${totalMin}–${totalMax} h; Markdown sincronizado.`)

const { columns, cellInfo, report, STATES } = await import('../src/seguimiento3d-model.js')
const targets = columns(data)
assert.equal(targets.length, 15, '14 edificios registrados y un espacio público; inventario abierto')
const ob = targets.find(c => c.building.id === 'OB-02')
const sharedOb = { ...ob, building: { ...ob.building, tasks: { identity: 'partial' } } }
assert.equal(cellInfo(sharedOb, 'plan').key, 'OB-YG:plan', 'sin revisión propia se conserva la tarea compartida de cuadra')
assert.equal(cellInfo(ob, 'plan').key, 'OB-02:plan', 'la revisión seleccionada de OB-02 tiene seguimiento independiente')
assert.equal(cellInfo(ob, 'identity').key, 'OB-02:identity')
assert.notEqual(STATES.partial.label, STATES.active.label, 'provisional no significa en proceso')
const fixture = { ...ob, building: { ...ob.building, tasks: { identity: 'blocked' }, issues: { identity: { title: 'Identificación', detail: 'Falta evidencia' } } } }
const cell = cellInfo(fixture, 'identity')
assert.equal(cell.state, 'blocked')
assert.equal(cell.issue.detail, 'Falta evidencia')
const payload = report(cell, ' Revisar foto ', 'test-report-id', 'https://example.com')
assert.equal(payload.id, 'test-report-id', 'reintentos usan el mismo ID')
assert.equal(payload.elemento.valores.building, 'OB-02')
assert.ok(payload.texto.includes('Falta evidencia') && payload.texto.includes('Revisar foto'))
assert.ok(app.includes("apiCall('chinche'") && !app.includes("apiCall('getAll'"), 'envía instrucciones sin leer datos privados')
assert.equal((app.match(/<table /g) || []).length, 1, 'una sola matriz')
for (const block of data.blocks) for (const owner of [block, ...block.buildings]) {
  for (const [task, state] of Object.entries(owner.tasks || owner.sharedTasks || {}))
    if (state === 'blocked') assert.ok(owner.issues?.[task]?.detail, 'cada rojo debe documentar el problema')
}
console.log('Matriz XY: estados, problemas, contexto de indicaciones y envío verificados.')

const scoped = targets.find(c => c.building.id === 'OB-01')
assert.equal(cellInfo(scoped, 'plan').shared, false, 'la revisión de un frente no cierra toda la cuadra')
assert.equal(cellInfo(sharedOb, 'plan').shared, true, 'un edificio sin revisión conserva el estado compartido')
assert.equal(cellInfo(ob, 'plan').shared, false, 'OB-02 seleccionado no altera el avance compartido ni OB-01')

const { validarFoto, uploadPayload, adjuntarFotos } = await import('../src/seguimiento3d-fotos.js')
assert.throws(() => validarFoto({ type: 'text/html', size: 10 }))
assert.throws(() => validarFoto({ type: 'image/jpeg', size: 21 * 1024 * 1024 }))
validarFoto({ type: 'image/jpeg', size: 100 })
const photo = { id: 'synthetic-photo', data: 'data:image/jpeg;base64,YQ==', file_id: 'private-fixture', nombre: 'private-name.jpg' }
assert.equal(uploadPayload(cell, photo, 'synthetic').privado, true)
assert.equal(uploadPayload(cell, photo, 'synthetic').espacio_id, `levantamiento-${cell.key}`)
const withPhotos = adjuntarFotos(report(cell, 'Revisar', 'synthetic', 'https://example.com'), [photo])
assert.equal(withPhotos.elemento.valores.fotos[0].file_id, 'private-fixture')
assert.ok(!withPhotos.texto.includes('private-fixture') && !withPhotos.texto.includes('private-name'))
assert.throws(() => adjuntarFotos(report(cell, 'Revisar', 'synthetic', ''), [{ id: 'not-uploaded' }]))
console.log('Fotos 3D: formato, límite, asociación privada y ausencia de IDs/nombres en texto público verificados.')
