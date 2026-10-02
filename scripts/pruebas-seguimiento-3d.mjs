import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const data = JSON.parse(await readFile(new URL('../public/seguimiento-3d.json', import.meta.url), 'utf8'))
const validStates = new Set(['done', 'partial', 'active', 'waiting', 'pending'])
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
    assert.ok(building.estimateHours.min <= building.estimateHours.max, `rango invertido en ${building.id}`)
    for (const state of Object.values(building.tasks)) assert.ok(validStates.has(state), `${building.id}: estado ${state}`)
  }
}

assert.equal(buildingCount, 12, 'las anclas conocidas deben seguir contadas explícitamente')
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
