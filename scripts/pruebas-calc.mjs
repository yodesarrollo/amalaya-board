#!/usr/bin/env node
// Pruebas del motor financiero — se corren con `node scripts/pruebas-calc.mjs`
// (sin navegador, sin dependencias). Si algo falla, el proceso sale con 1.

import {
  normalizarId,
  interpretar,
  montoLinea,
  lineasVigentes,
  resumenEspacio,
  mapaConfig,
  configNum,
  resumenGlobal,
} from '../src/calc.js'

let fallas = 0
function prueba(nombre, fn) {
  try {
    fn()
    console.log(`  ✓ ${nombre}`)
  } catch (e) {
    fallas++
    console.error(`  ✗ ${nombre}\n      ${e.message}`)
  }
}
function igual(a, b, msg = '') {
  const ja = JSON.stringify(a)
  const jb = JSON.stringify(b)
  if (ja !== jb) throw new Error(`${msg} esperaba ${jb}, salió ${ja}`)
}
function casi(a, b, msg = '') {
  if (Math.abs(a - b) > 1e-9) throw new Error(`${msg} esperaba ~${b}, salió ${a}`)
}

console.log('normalizarId')
prueba('quita acentos, minúsculas, espacios a _', () => {
  igual(normalizarId('Núm de Alumnos'), 'num_de_alumnos')
  igual(normalizarId('  Mensualidad  '), 'mensualidad')
})

console.log('interpretar — casos válidos')
prueba('aritmética con precedencia', () => {
  casi(interpretar('2 + 3 * 4').valor, 14)
  casi(interpretar('(2 + 3) * 4').valor, 20)
  casi(interpretar('10 / 4').valor, 2.5)
  casi(interpretar('-5 + 3').valor, -2)
})
prueba('variables normalizadas (con acento y mayúsculas)', () => {
  const r = interpretar('Alumnos * Mensualidad * 12', { alumnos: 20, mensualidad: 2500 })
  casi(r.valor, 600000)
  igual(r.error, null)
})

console.log('interpretar — errores con texto en español, nunca 0 silencioso')
prueba('factor inexistente', () => {
  const r = interpretar('alumnos * 12', {})
  igual(r.valor, null)
  if (!/no existe/.test(r.error)) throw new Error(`error raro: ${r.error}`)
})
prueba('división entre cero', () => {
  const r = interpretar('10 / 0')
  igual(r.valor, null)
  if (!/cero/.test(r.error)) throw new Error(`error raro: ${r.error}`)
})
prueba('paréntesis desbalanceados', () => {
  igual(interpretar('(2 + 3').valor, null)
  igual(interpretar('2 + 3)').valor, null)
})
prueba('batería maliciosa: nada se ejecuta, todo da error', () => {
  const maliciosas = [
    'constructor',
    '__proto__',
    '() => 1',
    'window.alert(1)',
    '=IMPORTRANGE("x")',
    'a; b',
    '1e999',           // notación científica no está en la gramática
    'x'.repeat(300),   // demasiado larga
    '2 ** 10',         // operador no permitido (se parsea como * y falla al sobrar)
  ]
  for (const m of maliciosas) {
    const r = interpretar(m, {})
    if (r.error === null) throw new Error(`«${m.slice(0, 30)}» no dio error`)
  }
})
prueba('el resultado no finito da error', () => {
  // 9999999 * ... hasta desbordar no es alcanzable con la gramática sin
  // exponentes, pero la división que produce Infinity vía subexpresión sí:
  const r = interpretar('1 / (1 - 1)')
  igual(r.valor, null)
})

console.log('montoLinea')
prueba('número directo, con formato de moneda', () => {
  casi(montoLinea({ monto_anual: '1,250,000' }).valor, 1250000)
  casi(montoLinea({ monto_anual: 500 }).valor, 500)
})
prueba('fórmula con factores del espacio', () => {
  const factores = [
    { etiqueta: 'Alumnos', valor: 50 },
    { etiqueta: 'Mensualidad', valor: 2500 },
  ]
  casi(montoLinea({ monto_anual: '=alumnos * mensualidad * 12' }, factores).valor, 1500000)
})
prueba('monto vacío o no numérico da error', () => {
  igual(montoLinea({ monto_anual: '' }).valor, null)
  igual(montoLinea({ monto_anual: 'diez' }).valor, null)
})

console.log('escenarios')
prueba('las líneas sin escenario aplican siempre; las de escenario, solo si está activo', () => {
  const lineas = [
    { id: 'L1', escenario_id: '' },
    { id: 'L2', escenario_id: 'ESC-1' },
    { id: 'L3', escenario_id: 'ESC-2' },
  ]
  const escenarios = [
    { id: 'ESC-1', activo: 'si' },
    { id: 'ESC-2', activo: 'no' },
  ]
  igual(lineasVigentes(lineas, escenarios).map((l) => l.id), ['L1', 'L2'])
})

console.log('resumenEspacio y resumenGlobal — el valor por acción')
const datos = {
  espacios: [
    { id: 'E-001', nombre: 'Escuela demo', tipo: 'escuela', m2: 400 },
    { id: 'E-002', nombre: 'Venue demo', tipo: 'venue', m2: 1200 },
  ],
  factores: [
    { id: 'F-001', espacio_id: 'E-001', etiqueta: 'Alumnos', valor: 20 },
    { id: 'F-002', espacio_id: 'E-001', etiqueta: 'Mensualidad', valor: 2500 },
  ],
  lineas: [
    { id: 'L-001', espacio_id: 'E-001', escenario_id: '', concepto: 'Colegiaturas', tipo: 'ingreso', monto_anual: '=alumnos * mensualidad * 12' },
    { id: 'L-002', espacio_id: 'E-001', escenario_id: '', concepto: 'Regalías de grabaciones', tipo: 'ingreso', monto_anual: '200000' },
    { id: 'L-003', espacio_id: 'E-001', escenario_id: '', concepto: 'Operación', tipo: 'costo', monto_anual: '300000' },
    { id: 'L-004', espacio_id: 'E-002', escenario_id: '', concepto: 'Renta del venue', tipo: 'ingreso', monto_anual: '900000' },
    { id: 'L-005', espacio_id: 'E-002', escenario_id: '', concepto: 'Operación', tipo: 'costo', monto_anual: '400000' },
  ],
  escenarios: [],
  config: mapaConfig([
    { clave: 'valor_m2_escuela', valor: '15000' },
    { clave: 'valor_m2_venue', valor: '18000' },
    { clave: 'costo_m2_escuela', valor: '9000' },
    { clave: 'costo_m2_venue', valor: '12000' },
    { clave: 'gastos_generales', valor: '1,000,000' },
    { clave: 'acciones_emitidas', valor: '10000' },
    { clave: 'multiplo_operativo', valor: '6' },
    { clave: 'multiplo_regalias', valor: '4' },
  ]),
}

prueba('resumen del espacio escuela: 20 alumnos', () => {
  const r = resumenEspacio(datos.espacios[0], datos.lineas, datos.factores, [])
  casi(r.ingreso, 20 * 2500 * 12 + 200000) // 800,000
  casi(r.costo, 300000)
  casi(r.utilidad, 500000)
  casi(r.regalias, 200000)
  igual(r.errores, [])
})

prueba('valor por acción con el desglose de 3 componentes', () => {
  const g = resumenGlobal(datos)
  // inmobiliario: 400×15,000 + 1,200×18,000 = 6,000,000 + 21,600,000
  casi(g.valorPorAccion.inmobiliario, 27600000)
  // utilidad total: 500,000 (escuela) + 500,000 (venue) = 1,000,000
  casi(g.utilidadTotal, 1000000)
  // operativo excluye regalías: (1,000,000 − 200,000) × 6
  casi(g.valorPorAccion.operativo, 4800000)
  // regalías: 200,000 × 4
  casi(g.valorPorAccion.regalias, 800000)
  casi(g.valorPorAccion.total, 33200000)
  casi(g.valorPorAccion.porAccion, 3320)
  // costo: 400×9,000 + 1,200×12,000 + 1,000,000 = 19,000,000
  casi(g.costoConstruccion, 19000000)
  casi(g.aniosRecuperacion, 19)
})

prueba('cambiar la escuela de 20 a 50 alumnos mueve el valor por acción', () => {
  const factores50 = datos.factores.map((f) =>
    f.id === 'F-001' ? { ...f, valor: 50 } : f
  )
  const g = resumenGlobal({ ...datos, factores: factores50 })
  // ingreso escuela: 50×2500×12 = 1,500,000 (+200k regalías) − 300k = 1,400,000
  casi(g.utilidadTotal, 1900000)
  // operativo: (1,900,000 − 200,000) × 6 = 10,200,000
  casi(g.valorPorAccion.operativo, 10200000)
  casi(g.valorPorAccion.porAccion, (27600000 + 10200000 + 800000) / 10000)
})

prueba('una línea con fórmula rota reporta error y NO suma cero en silencio', () => {
  const conRota = {
    ...datos,
    lineas: [
      ...datos.lineas,
      { id: 'L-X', espacio_id: 'E-001', escenario_id: '', concepto: 'Rota', tipo: 'ingreso', monto_anual: '=factor_borrado * 2' },
    ],
  }
  const r = resumenEspacio(conRota.espacios[0], conRota.lineas, conRota.factores, [])
  igual(r.errores.length, 1)
  if (!/no existe/.test(r.errores[0].error)) throw new Error('el error no explica qué pasó')
  casi(r.utilidad, 500000) // el resto del cálculo sigue vivo
})

prueba('sin acciones emitidas, porAccion es null (no división entre cero)', () => {
  const sinAcciones = { ...datos, config: { ...datos.config, acciones_emitidas: '0' } }
  const g = resumenGlobal(sinAcciones)
  igual(g.valorPorAccion.porAccion, null)
})

console.log('configNum')
prueba('lee números con formato y respeta el valor por defecto', () => {
  const c = mapaConfig([{ clave: 'Gastos Generales', valor: '$2,500,000' }])
  casi(configNum(c, 'gastos_generales', 0), 2500000)
  casi(configNum(c, 'no_existe', 42), 42)
})

if (fallas > 0) {
  console.error(`\n${fallas} prueba(s) fallaron.`)
  process.exit(1)
}
console.log('\nTodas las pruebas del motor financiero pasaron.')
