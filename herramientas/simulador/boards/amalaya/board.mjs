// Amalaya (repo yodesarrollo/amalaya-board). El Apps Script real está en
// apps-script/Code.gs de ese repo; esto imita sus acciones con datos inventados.
import { datos } from './datos.mjs'
import { renderPrueba } from '../../mosaicos.mjs'

export const base = '/amalaya-board/'

// Credenciales que acepta el servidor falso. SIMULADOR entra como admin;
// EDITOR1 como editor (para ver lo que un editor NO ve, como el ⚙️).
export const CODIGO = 'SIMULADOR'
const QUIENES = {
  SIMULADOR: { rol: 'admin', nombre: 'Alejandro Puebla' },
  EDITOR1: { rol: 'editor', nombre: 'Luis Puebla' },
}
// Graba el recorrido completo (la entrada del mapa se revisa en video).
export const video = true

// La entrada del mapa dura ~4 s; en el simulador va 4× más lenta para que
// cada etapa alcance su captura (en el video también se ve completa).
export const antes = () => { window.__amalayaEntradaX = 4 }

// Google falso: el botón del simulador entrega este id_token.
const TOKEN_GOOGLE = 'SIM-GOOGLE-ID-TOKEN-0123456789'

// Google Identity Services falso (se sirve en lugar de accounts.google.com).
export const locales = [[/accounts\.google\.com\/gsi\/client/, new URL('./gsi-falso.js', import.meta.url).pathname]]

const db = structuredClone(datos)
// Historial vacío al arrancar; lo llena el servidor falso como el real.
db.Historial = []
// Un render 360 de prueba en el primer punto del recorrido.
export const PUNTO_CON_RENDER = 'G5UapkZfu_gIeRoydqjPBw'
db.Archivos.push({ id: 'A-900', espacio_id: PUNTO_CON_RENDER, tipo: 'render360', nombre: 'render-prueba.png', file_id: 'SIM-RENDER', privado: 'si', fecha: '2026-09-24' })
const anotar = (quien, tab, llave, campo, antes, despues) =>
  db.Historial.push({ fecha: new Date().toISOString(), usuario: quien.nombre, tab, llave, campo, antes: String(antes ?? ''), despues: String(despues ?? '') })
let v = 1
const prefijo = { Espacios: 'E-', Factores: 'F-', Finanzas_Lineas: 'L-', Rutas: 'R-', Paradas: 'P-', Tareas: 'T-', Conocimientos: 'C-', Archivos: 'A-', Escenarios: 'ESC-', Usuarios: 'U-' }
const llave = (fila) => fila.id ?? fila.clave

export function servidor(accion, b) {
  if (accion === 'ping') return { ok: true, servicio: 'amalaya-board (simulado)', google_client_id: 'simulador.apps.googleusercontent.com' }
  if (accion === 'google') {
    return b.id_token === TOKEN_GOOGLE
      ? { ok: true, codigo: CODIGO, rol: 'admin', nombre: 'Alejandro Puebla' }
      : { ok: false, error: 'Tu cuenta de Google no tiene acceso a Amalaya. Pídeselo a Alejandro.' }
  }
  if (accion === 'peticiones') return { ok: true, rutas: db.Rutas, paradas: db.Paradas }
  if (accion === 'ligaPorCorreo') return { ok: true, mensaje: '(simulado) Si tu correo está registrado, tu liga va en camino.' }
  const quien = QUIENES[b.codigo]
  if (!quien) return { ok: false, error: 'El código no es válido. Revísalo o pide uno nuevo.' }
  const esAdmin = quien.rol === 'admin'
  switch (accion) {
    case 'login': return { ok: true, ...quien }
    case 'getAll': {
      if (esAdmin) return { ok: true, v, datos: db, rol: quien.rol }
      const { Usuarios, ...resto } = db
      return { ok: true, v, datos: resto, rol: quien.rol }
    }
    case 'guardar': {
      const fila = db[b.tab]?.find((x) => llave(x) === b.key)
      if (!fila) return { ok: false, error: 'No se encontró la fila.' }
      for (const [k, val] of Object.entries(b.patch)) if (String(fila[k]) !== String(val)) anotar(quien, b.tab, b.key, k, fila[k], val)
      Object.assign(fila, b.patch); return { ok: true, key: b.key, v: ++v }
    }
    case 'crear': {
      const fila = { id: prefijo[b.tab] + String(db[b.tab].length + 1).padStart(3, '0'), ...b.fila }
      db[b.tab].push(fila); anotar(quien, b.tab, fila.id, '(fila nueva)', '', JSON.stringify(fila)); return { ok: true, fila, v: ++v }
    }
    case 'borrar': {
      const previa = db[b.tab].find((x) => llave(x) === b.key)
      db[b.tab] = db[b.tab].filter((x) => llave(x) !== b.key)
      anotar(quien, b.tab, b.key, '(fila borrada)', JSON.stringify(previa || {}), ''); return { ok: true, v: ++v }
    }
    case 'nuevoCodigo': return { ok: true, codigo: 'SIM-NUEVO1', v: ++v }
    case 'generarLiga': return { ok: true, liga: 'https://yodesarrollo.github.io/amalaya-board/?t=SIMULADOR', v: ++v }
    case 'revocarLiga': case 'respaldoAhora': case 'instalarRespaldo': return { ok: true, v }
    case 'verArchivo':
      if (b.file_id === 'SIM-RENDER') return { ok: true, nombre: 'render-prueba.png', mime: 'image/png', base64: renderPrueba().toString('base64') }
      return { ok: false, error: '(simulado) Ese archivo de Drive no existe en el simulador.' }
    case 'subirArchivo': return { ok: false, error: '(simulado) Los archivos de Drive no existen en el simulador.' }
    default: return { ok: false, error: 'Acción no reconocida: ' + accion }
  }
}

export async function guion({ pagina, foto, clic, base }) {
  const salir = async () => { await clic('button[title="Salir"]'); await pagina.waitForTimeout(600) }

  // Portada: Google, liga por correo y «tengo un código»
  await pagina.goto(base); await foto('01-portada')
  await clic('text=Peticiones a la ciudad'); await foto('02-peticiones-publicas')

  // 1 · Entrar con Google (falso)
  await pagina.goto(base); await pagina.waitForTimeout(1500)
  await clic('#gsi-falso')
  // La entrada del mapa por capas: una captura por etapa
  for (const [n, archivo] of [[0, '03-entrada-0-satelite'], [1, '03-entrada-1-lamina'], [2, '03-entrada-2-rutas'], [3, '03-entrada-3-puntos'], [4, '03-entrada-4-vuelo']]) {
    await pagina.waitForSelector(`[data-entrada="${n}"]`, { timeout: 15000 }).catch(() => {})
    await foto(archivo, n === 2 ? 2400 : n === 4 ? 4000 : 800)
  }
  await foto('03-mapa', 2000)
  // Cada pin debe mostrar las rayitas de SU estado_desarrollo
  const niveles = await pagina.$$eval('.pin3d', (els) => els.map((el) => [el.querySelector('.pin3d-nombre')?.textContent, Number(el.querySelector('.avance5')?.dataset.nivel)]))
  const esperado = Object.fromEntries(db.Espacios.map((e) => [e.nombre, ['idea', 'negociacion', 'proyecto', 'obra', 'operando'].indexOf(String(e.estado_desarrollo).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()) + 1]))
  for (const [nombre, n] of niveles) {
    console.log(`${n === esperado[nombre] ? '✓' : '✗ NO COINCIDE'} avance ${nombre}: ${n} de 5 (Sheet: ${esperado[nombre]})`)
  }
  // Guía de primera vez (3 globos) y el indicador de avance
  for (const g of ['03g-guia-1', '03g-guia-2', '03g-guia-3']) {
    await foto(g, 300); await clic('.globo-guia button.ctrl-mapa')
  }
  await clic('button[title="Lista y buscador de espacios"]'); await foto('03l-lista-espacios', 500)
  await pagina.locator('.lista-espacios input').fill('foro'); await foto('03m-buscar-foro', 400)
  await clic('.lista-espacios .fila-espacio'); await foto('03n-ficha-desde-lista', 1500)

  // Fase 3 · ficha: resumen, siguiente paso, historial, anterior/siguiente
  await foto('11-ficha-resumen', 400)
  await pagina.locator('#campo-m2').fill('2600'); await pagina.waitForTimeout(1800)
  await clic('[role=tab]:has-text("Historial")'); await foto('11b-ficha-historial', 600)
  const renglones = await pagina.locator('[aria-label="Historial de cambios"] li').count()
  console.log(`${renglones > 0 ? '✓' : '✗ SIN RENGLÓN'} historial: ${renglones} renglón(es) tras cambiar los m²`)
  const oficial = db.Historial.filter((h) => h.campo === 'm2')
  console.log(`${oficial.length ? '✓' : '✗'} servidor: Historial anotó ${oficial.map((h) => `${h.usuario} · ${h.tab} ${h.llave} · m2 ${h.antes} → ${h.despues}`).join('; ') || 'nada'}`)
  await clic('button[aria-label="Espacio siguiente"]'); await foto('11c-ficha-siguiente', 600)
  await clic('button[aria-label="Espacio anterior"]'); await pagina.waitForTimeout(300)
  await pagina.keyboard.press('Escape'); await pagina.goto(base); await pagina.waitForTimeout(2500)
  await salir()

  // 2 · Entrar con la liga (?t=)
  await pagina.goto(base + '?t=' + CODIGO); await foto('03a-entrada-con-liga', 3000)
  await salir()

  // 3 · Pedir la liga por correo
  await pagina.goto(base); await pagina.waitForTimeout(1200)
  await pagina.locator('#correo-liga').fill('admin@ejemplo.mx')
  await clic('button:has-text("Mandar")'); await foto('01b-liga-por-correo', 1200)

  // 4 · Un editor entra con código: no ve el ⚙️
  await clic('text=Tengo un código'); await pagina.waitForTimeout(300)
  await pagina.locator('input[type=password]').first().fill('EDITOR1')
  await clic('button[type=submit]:has-text("Entrar")')
  await pagina.waitForSelector('[data-entrada="4"]', { timeout: 30000 }).catch(() => {}); await foto('03c-editor-sin-engrane', 2500)
  await salir()

  // 5 · El admin entra con código y abre el ⚙️
  await clic('text=Tengo un código'); await pagina.waitForTimeout(300)
  await pagina.locator('input[type=password]').first().fill(CODIGO)
  await clic('button[type=submit]:has-text("Entrar")')
  await pagina.waitForSelector('[data-entrada="4"]', { timeout: 30000 }).catch(() => {}); await pagina.waitForTimeout(2500)
  await clic('button[aria-label="Accesos"]'); await foto('07-accesos')
  await clic('button:has-text("Apagar acceso")'); await foto('07b-confirmar-apagar', 600)
  await clic('button:has-text("Cancelar")'); await clic('aside button:has-text("Cerrar")')

  await clic('button:has-text("Capas")'); await clic('.fila-capa:has-text("Satélite")')
  await foto('03b-mapa-sin-satelite', 3000); await clic('button:has-text("Capas")')
  await clic('button:has-text("Rutas")'); await foto('04-mapa-rutas')
  await clic('button:has-text("Rutas")')

  // Fase 3 · 360 antes/después: tocar el punto que tiene render de prueba
  const xy = await pagina.evaluate((id) => {
    const m = window.__amalayaMapa
    const f = m.querySourceFeatures('recorrido').find((x) => x.properties.id === id)
    if (!f) return null
    m.jumpTo({ center: f.geometry.coordinates, zoom: 18 })
    return true
  }, PUNTO_CON_RENDER)
  if (xy) {
    await pagina.waitForTimeout(1200)
    const p = await pagina.evaluate((id) => {
      const m = window.__amalayaMapa
      const f = m.querySourceFeatures('recorrido').find((x) => x.properties.id === id)
      const r = m.getCanvas().getBoundingClientRect(); const q = m.project(f.geometry.coordinates)
      return { x: r.left + q.x, y: r.top + q.y }
    }, PUNTO_CON_RENDER)
    await pagina.mouse.click(p.x, p.y); await pagina.waitForTimeout(5000)
    const visor = pagina.frameLocator('iframe[title="Recorrido 360"]')
    const apagado = await visor.locator('.slider.apagado').count()
    console.log(`${apagado === 0 ? '✓' : '✗ APAGADO'} slider del punto con render: ${apagado === 0 ? 'encendido' : 'apagado'}`)
    await visor.locator('#mezcla').fill('65'); await foto('12-360-render-slider', 800)
    await visor.locator('canvas').first().click({ position: { x: 5, y: 5 } }).catch(() => {})
    await pagina.keyboard.press('Shift+ArrowRight')
    await foto('12b-360-render-en-camino', 3000)
    await clic('button[aria-label="Cerrar"]')
  } else console.log('✗ no encontré el punto con render en el mapa')
  for (const [seccion, archivo] of [['Finanzas', '05-finanzas'], ['Reporte', '06-reporte'], ['Ayuda', '08-ayuda']]) {
    await clic(`nav button:has-text("${seccion}")`); await foto(archivo)
    if (seccion === 'Finanzas') { await clic('text=¿qué significa?'); await foto('05b-que-significa'); await clic('text=Entendido') }
  }
  await pagina.goto(base + 'recorrido/'); await foto('09-recorrido-360', 4000)
  await pagina.goto(base + 'modelo/serdan-garmendia.html'); await foto('10-modelo-esquina', 5000)
}
