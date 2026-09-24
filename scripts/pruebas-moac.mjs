// Pruebas del mini MOAC (semáforo, acciones sin objetivo, peticiones).
import assert from 'node:assert/strict'
import { semaforo, accionesSinObjetivo, peticionesDe, avanceObjetivo } from '../src/moac.js'

console.log('mini MOAC — semáforo, regla D.2 y peticiones')
const hoy = new Date('2026-09-24T12:00:00')
const casos = [
  [{ fecha: '2026-09-20', hecho: 'no' }, 'rojo'],
  [{ fecha: '2026-09-24', hecho: 'no' }, 'ambar'],
  [{ fecha: '2026-09-30', hecho: 'no' }, 'ambar'],
  [{ fecha: '2026-10-15', hecho: 'no' }, 'verde'],
  [{ fecha: '2026-09-01', hecho: 'si' }, 'hecho'],
  [{ fecha: '', hecho: 'no' }, 'sin-fecha'],
]
for (const [t, esperado] of casos) {
  assert.equal(semaforo(t, hoy), esperado)
  console.log(`  ✓ ${JSON.stringify(t)} → ${esperado}`)
}
const objetivos = [{ id: 'O-001' }]
const tareas = [{ id: 'T-1', objetivo_id: 'O-001' }, { id: 'T-2', objetivo_id: '' }, { id: 'T-3', objetivo_id: 'O-borrado' }]
assert.deepEqual(accionesSinObjetivo(tareas, objetivos).map((t) => t.id), ['T-2', 'T-3'])
console.log('  ✓ acciones sin objetivo (incluye las de un objetivo borrado)')
const leer = (p) => JSON.parse(p.elementos)
const pet = peticionesDe([{ id: 'P-1', ruta_id: 'R-1', elementos: JSON.stringify([{ texto: 'Arbolado', estado: 'raro' }, { texto: 'Bancas', estado: 'logrado' }]) }], [{ id: 'R-1', nombre: 'Ruta' }], leer)
assert.deepEqual(pet.map((x) => [x.id, x.estado]), [['P-1#0', 'pendiente'], ['P-1#1', 'logrado']])
console.log('  ✓ peticiones con id estable y estado normalizado')
assert.deepEqual(avanceObjetivo({ id: 'O-1' }, [{ objetivo_id: 'O-1', hecho: 'si' }, { objetivo_id: 'O-1', hecho: 'no' }]), { total: 2, hechas: 1 })
console.log('  ✓ avance de un objetivo')
console.log('\nEl mini MOAC pasa sus pruebas.')
