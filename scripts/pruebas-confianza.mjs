import assert from 'node:assert/strict'
import { haySupuestosFinancieros } from '../src/confianza.js'

const espacio = { id: 'DEMO-1', tipo: 'venue' }
const config = { clave: 'acciones_emitidas', valor: '100', notas: 'ESTIMADO · prueba inventada' }
assert.equal(haySupuestosFinancieros({ Espacios: [espacio], Config: [config] }), true)
assert.equal(haySupuestosFinancieros({ Espacios: [espacio], Config: [{ ...config, valor: '0' }] }), false)
assert.equal(haySupuestosFinancieros({ Espacios: [espacio], Config: [{ ...config, clave: 'costo_m2_museo' }] }), false)
const linea = { espacio_id: espacio.id, escenario_id: 'DEMO-ESC', supuesto: 'Supuesto de renta inventado' }
assert.equal(haySupuestosFinancieros({ Espacios: [espacio], Finanzas_Lineas: [linea] }), false)
assert.equal(haySupuestosFinancieros({ Espacios: [espacio], Finanzas_Lineas: [linea], Escenarios: [{ id: 'DEMO-ESC', activo: 'si' }] }), true)
assert.equal(haySupuestosFinancieros({ Finanzas_Lineas: [{ ...linea, escenario_id: '' }] }), false)
assert.equal(haySupuestosFinancieros({}), false)
console.log('Confianza financiera: estimaciones vigentes visibles; filas sin uso y escenarios inactivos excluidos.')
