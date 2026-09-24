// Pruebas del indicador de avance del mapa (5 rayitas por estado_desarrollo).
import assert from 'node:assert/strict'
import { nivelAvance, rayitasHtml, ETAPAS_DESARROLLO } from '../src/avance.js'

console.log('avance — 5 rayitas por estado_desarrollo')
const casos = [['idea', 1], ['negociación', 2], ['Negociacion', 2], ['proyecto', 3], ['OBRA', 4], ['operando', 5], ['', 1], [undefined, 1], ['otra cosa', 1]]
for (const [estado, n] of casos) {
  assert.equal(nivelAvance(estado), n, `${estado} → ${n}`)
  console.log(`  ✓ ${JSON.stringify(estado)} → ${n}`)
}
assert.equal(ETAPAS_DESARROLLO.length, 5)
const html = rayitasHtml('obra')
assert.equal((html.match(/class="lleno"/g) || []).length, 4)
assert.equal((html.match(/<i /g) || []).length, 5)
console.log('  ✓ obra pinta 4 llenas de 5')
console.log('\nEl indicador de avance pasa sus pruebas.')
