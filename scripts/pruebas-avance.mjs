// Pruebas del indicador de avance del mapa (5 rayitas por estado_desarrollo).
import assert from 'node:assert/strict'
import { nivelAvance, rayitasHtml, ETAPAS_DESARROLLO, nombreEstado } from '../src/avance.js'

console.log('avance — 5 rayitas por estado_desarrollo')
const casos = [['idea', 1], ['negociación', 2], ['Negociacion', 2], ['proyecto', 3], ['OBRA', 4], ['operando', 5], ['', 0], [undefined, 0], ['otra cosa', 0]]
for (const [estado, n] of casos) {
  assert.equal(nivelAvance(estado), n, `${estado} → ${n}`)
  console.log(`  ✓ ${JSON.stringify(estado)} → ${n}`)
}
assert.equal(ETAPAS_DESARROLLO.length, 5)
assert.equal(nombreEstado(''), 'Por confirmar')
assert.equal(nombreEstado('Negociacion'), 'negociación')
assert.equal((rayitasHtml('').match(/class="lleno"/g) || []).length, 0)
const html = rayitasHtml('obra')
assert.equal((html.match(/class="lleno"/g) || []).length, 4)
assert.equal((html.match(/<i /g) || []).length, 5)
console.log('  ✓ obra pinta 4 llenas de 5')
console.log('\nEl indicador de avance pasa sus pruebas.')
