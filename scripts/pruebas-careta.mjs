#!/usr/bin/env node
// Pruebas de la careta: la premisa y el sistema de diseño, verificados
// en cada corrida (`node scripts/pruebas-careta.mjs`).
//
// 1) public/data.json es maqueta: demo:true, sin pestaña Usuarios, sin
//    la palabra codigo_acceso, y sin datos reales conocidos del proyecto.
// 2) La paleta pasa el contraste WCAG 4.5:1 en las combinaciones de texto
//    que el sistema de diseño declara.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
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

// --- 1. La maqueta de demostración --------------------------
console.log('data.json — la premisa')
const crudo = readFileSync(join(raiz, 'public/data.json'), 'utf8')
const demo = JSON.parse(crudo)

prueba('trae la bandera demo: true', () => {
  if (demo.demo !== true) throw new Error('falta "demo": true')
})
prueba('no contiene la pestaña Usuarios ni códigos', () => {
  if (demo.datos.Usuarios) throw new Error('data.json trae la pestaña Usuarios')
  if (/codigo_acceso/i.test(crudo)) throw new Error('data.json menciona codigo_acceso')
})
prueba('no contiene datos reales conocidos del proyecto', () => {
  // Los m² reales de los predios y los nombres de los actores del
  // proyecto jamás pueden aparecer en el repo público.
  const prohibidos = [
    '4269', '4,269', '3351', '3,351', '2929', '2,929', '2681', '2,681', '1484', '1,484',
    'Gilio', 'IMPLAN', 'Ladrillos', 'Ortiz Tirado',
  ]
  for (const p of prohibidos) {
    if (crudo.includes(p)) throw new Error(`data.json contiene el dato real «${p}»`)
  }
})
prueba('todas las pestañas de datos existen (sin Usuarios)', () => {
  const esperadas = ['Config', 'Espacios', 'Factores', 'Finanzas_Lineas', 'Escenarios', 'Rutas', 'Paradas', 'Tareas', 'Conocimientos', 'Archivos']
  for (const t of esperadas) {
    if (!Array.isArray(demo.datos[t])) throw new Error(`falta la pestaña ${t}`)
  }
})

// --- 2. Contraste de la paleta ------------------------------
console.log('paleta — contraste WCAG')
function luminancia(hex) {
  const n = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => {
    let c = parseInt(n.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contraste(a, b) {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}
function exigir(fg, bg, minimo, etiqueta) {
  const c = contraste(fg, bg)
  if (c < minimo) {
    throw new Error(`${etiqueta}: ${c.toFixed(2)}:1 — necesita ${minimo}:1`)
  }
}

const P = {
  noche: '#141010', superficie: '#221B15', elevada: '#2C231C',
  marfil: '#F2EAD9', arena: '#B7A890', terciario: '#9E8D78',
  oro: '#C9A45C', ambar: '#FFB84D', orotinta: '#7A5E2A', terracota: '#B85C38',
  ladrillo: '#E2705A', papel: '#FAF6EE', tinta: '#2B211A',
}

prueba('texto normal sobre los tres fondos (4.5:1)', () => {
  for (const fondo of [P.noche, P.superficie, P.elevada]) {
    exigir(P.marfil, fondo, 4.5, `marfil sobre ${fondo}`)
    exigir(P.arena, fondo, 4.5, `arena sobre ${fondo}`)
    exigir(P.terciario, fondo, 4.5, `terciario sobre ${fondo}`)
    exigir(P.ladrillo, fondo, 4.5, `ladrillo (error) sobre ${fondo}`)
  }
})
prueba('acentos como texto grande (3:1)', () => {
  exigir(P.oro, P.noche, 3, 'oro sobre noche')
  exigir(P.terracota, P.noche, 3, 'terracota sobre noche')
})
prueba('el ámbar neón como texto (4.5:1 — lleva texto chico en la portada)', () => {
  exigir(P.ambar, P.noche, 4.5, 'ámbar sobre noche')
})
prueba('el papel del Reporte (impresión)', () => {
  exigir(P.tinta, P.papel, 4.5, 'tinta sobre papel')
  exigir(P.orotinta, P.papel, 4.5, 'oro de tinta sobre papel')
})
prueba('el oro claro NUNCA como texto sobre papel (comprobación negativa)', () => {
  const c = contraste(P.oro, P.papel)
  if (c >= 4.5) throw new Error('el oro claro ahora pasa: revisar que la regla siga teniendo sentido')
})

// --- 3. Sin secretos en src/ --------------------------------
console.log('repo — sin datos de infraestructura')
prueba('config.js no trae IDs de Sheets ni carpetas de Drive', () => {
  const cfg = readFileSync(join(raiz, 'src/config.js'), 'utf8')
  if (/docs\.google\.com\/spreadsheets|drive\.google\.com\/drive\/folders/.test(cfg)) {
    throw new Error('config.js contiene un ID de Sheet o carpeta')
  }
})

if (fallas > 0) {
  console.error(`\n${fallas} prueba(s) fallaron.`)
  process.exit(1)
}
console.log('\nLa careta pasa todas las pruebas de premisa y diseño.')
