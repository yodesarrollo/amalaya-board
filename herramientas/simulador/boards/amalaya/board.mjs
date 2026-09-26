// Amalaya (repo yodesarrollo/amalaya-board). El Apps Script real está en
// apps-script/Code.gs de ese repo; esto imita sus acciones con datos inventados.
import { datos } from './datos.mjs'
import { renderPrueba } from '../../mosaicos.mjs'

export const base = '/amalaya-board/'

// Credenciales que acepta el servidor falso. SIMULADOR entra como admin;
// EDITOR1 como editor (para ver lo que un editor NO ve, como el ⚙️).
export const CODIGO = 'SIMULADOR'
const QUIENES = {
  SIMULADOR: { id: 'U-001', rol: 'admin', nombre: 'Alejandro Puebla' },
  EDITOR1: { rol: 'editor', nombre: 'Luis Puebla' },
  INVERSOR1: { rol: 'inversionista', nombre: 'Inversionista de prueba' },
}
const TABS_INVERSIONISTA = ['Config', 'Espacios', 'Factores', 'Finanzas_Lineas', 'Escenarios', 'Rutas', 'Paradas']
let caidaRed = false
let escriturasPos = 0 // UX-02: cuántas veces se escribió una posición // UX-01: simula que el guardado no llega
const congeladas = [] // [{fila, foto}] — lo que el servidor real guarda en Drive/Reportes
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
db.Versiones = []
db.Metas = []
db.Chinches = []
db.Objetivos = []
// Un render 360 de prueba en el primer punto del recorrido.
export const PUNTO_CON_RENDER = 'G5UapkZfu_gIeRoydqjPBw'
db.Archivos.push({ id: 'A-900', espacio_id: PUNTO_CON_RENDER, tipo: 'render360', nombre: 'render-prueba.png', file_id: 'SIM-RENDER', privado: 'si', fecha: '2026-09-24' })
// Antifallos (espejo de vetoUsuarios en Code.gs). La maestra del simulador
// vive «fuera del Sheet», como la Propiedad CUENTAS_MAESTRAS del real.
const MAESTRAS = ['admin@ejemplo.mx']
const esMaestra = (c) => MAESTRAS.includes(String(c || '').trim().toLowerCase())
function vetoUsuarios(quien, key, patch, borrando) {
  if ('codigo_acceso' in patch || 'liga_token' in patch) return 'Los códigos y ligas solo se cambian con sus botones.'
  const fila = db.Usuarios.find((u) => u.id === key)
  if (!fila) return null
  const apaga = borrando || ('activo' in patch && String(patch.activo).toLowerCase() !== 'si')
  const degrada = borrando || ('rol' in patch && String(patch.rol).toLowerCase() !== 'admin')
  const cambiaCorreo = 'correo' in patch && String(patch.correo).trim().toLowerCase() !== String(fila.correo || '').trim().toLowerCase()
  if (esMaestra(fila.correo) && (apaga || degrada || cambiaCorreo)) return 'Es una cuenta maestra de recuperación.'
  if (fila.id === quien.id && (apaga || degrada)) return 'No puedes quitarte tu propio acceso de admin.'
  const adminActivo = (u) => u.rol === 'admin' && u.activo === 'si'
  if (adminActivo(fila) && (apaga || degrada) && !db.Usuarios.some((u) => u.id !== key && adminActivo(u))) return 'Es el último admin activo.'
  return null
}
const anotar = (quien, tab, llave, campo, antes, despues) =>
  db.Historial.push({ fecha: new Date().toISOString(), usuario: quien.nombre, tab, llave, campo, antes: String(antes ?? ''), despues: String(despues ?? '') })
let v = 1
const prefijo = { Espacios: 'E-', Factores: 'F-', Finanzas_Lineas: 'L-', Rutas: 'R-', Paradas: 'P-', Tareas: 'T-', Conocimientos: 'C-', Archivos: 'A-', Escenarios: 'ESC-', Usuarios: 'U-', Metas: 'M-', Objetivos: 'O-' }
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
      if (esAdmin) {
        const Usuarios = db.Usuarios.map((u) => ({ ...u, maestra: esMaestra(u.correo) ? 'si' : 'no', yo: u.id === quien.id ? 'si' : 'no' }))
        return { ok: true, v, datos: { ...db, Usuarios }, rol: quien.rol }
      }
      if (quien.rol === 'inversionista') {
        const ultima = congeladas[congeladas.length - 1]
        if (ultima) return { ok: true, v, datos: ultima.foto, rol: quien.rol, congelada: { id: ultima.fila.id, fecha: ultima.fila.fecha, nombre: ultima.fila.nombre, cifras: ultima.cifras } }
        return { ok: true, v, datos: Object.fromEntries(TABS_INVERSIONISTA.map((t) => [t, db[t]])), rol: quien.rol }
      }
      const { Usuarios, Versiones, ...resto } = db
      return { ok: true, v, datos: resto, rol: quien.rol }
    }
    case 'chinche': {
      if (!db.Chinches.some((c) => c.id === b.chinche?.id)) db.Chinches.push({ ...b.chinche, quien: quien.nombre, estado: 'nueva' })
      return { ok: true, id: b.chinche?.id }
    }
    case 'congelarReporte': {
      if (!['admin', 'master'].includes(quien.rol)) return { ok: false, error: 'Solo admin o máster pueden congelar el reporte.' }
      const foto = structuredClone(Object.fromEntries(TABS_INVERSIONISTA.map((t) => [t, db[t]])))
      const fila = { id: 'V-' + String(db.Versiones.length + 1).padStart(3, '0'), fecha: new Date().toISOString(), usuario: quien.nombre, nombre: 'amalaya-reporte-simulado.json', file_id: 'SIM-V' + (db.Versiones.length + 1), notas: '' }
      db.Versiones.push(fila); congeladas.push({ fila, foto, cifras: b.cifras || null })
      return { ok: true, fila, v: ++v }
    }
    case 'verVersion': {
      const c = congeladas.find((x) => x.fila.id === b.id)
      return c ? { ok: true, datos: c.foto, version: { id: c.fila.id, fecha: c.fila.fecha, nombre: c.fila.nombre, cifras: c.cifras } } : { ok: false, error: 'No se encontró esa versión.' }
    }
    case 'guardar': {
      if (caidaRed) return { ok: false, error: 'Sin conexión (simulada).' }
      if (b.tab === 'Espacios' && b.patch && 'pos_x' in b.patch) escriturasPos++
      if (b.tab === 'Usuarios') { const veto = vetoUsuarios(quien, b.key, b.patch || {}, false); if (veto) return { ok: false, error: veto } }
      const fila = db[b.tab]?.find((x) => llave(x) === b.key)
      if (!fila) return { ok: false, error: 'No se encontró la fila.' }
      if (b.esperado) { const d = Object.keys(b.esperado).filter((k) => String(fila[k]) !== String(b.esperado[k])); if (d.length) return { ok: false, conflicto: true, error: 'Alguien más cambió ' + d.join(', ') + ' después de ti; no se deshizo para no pisar su cambio.' } }
      for (const [k, val] of Object.entries(b.patch)) if (String(fila[k]) !== String(val)) anotar(quien, b.tab, b.key, k, fila[k], val)
      Object.assign(fila, b.patch); return { ok: true, key: b.key, v: ++v }
    }
    case 'crear': {
      const fila = { id: prefijo[b.tab] + String(db[b.tab].length + 1).padStart(3, '0'), ...b.fila }
      db[b.tab].push(fila); anotar(quien, b.tab, fila.id, '(fila nueva)', '', JSON.stringify(fila)); return { ok: true, fila, v: ++v }
    }
    case 'borrar': {
      if (b.tab === 'Usuarios') { const veto = vetoUsuarios(quien, b.key, {}, true); if (veto) return { ok: false, error: veto } }
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
  // Fase 6 · detalle de una petición (texto, estado, foto de hoy / visión)
  await clic('button:has-text("Arbolado")'); await foto('02b-detalle-peticion', 800)
  const grupos = await pagina.locator('section[aria-label]').count()
  console.log(`${grupos === db.Rutas.length ? '✓' : '✗'} peticiones agrupadas por ruta: ${grupos} grupo(s)`)

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
  // Chinche #17: leyenda con los tipos presentes, su cuenta, y clicable
  const ley = await pagina.$$eval('.cartela-ley .ley-tipo', (bs) => bs.map((b) => b.textContent.trim()))
  console.log(`${ley.some((t) => /Foro\s*1/.test(t)) && ley.some((t) => /Estacionamiento\s*2/.test(t)) ? '✓' : '✗'} leyenda con cuenta por tipo: ${ley.join(' · ')}`)
  const antesPins = await pagina.locator('.pin3d:visible').count()
  await clic('.cartela-ley .ley-tipo:has-text("Estacionamiento")'); await pagina.waitForTimeout(500)
  const despuesPins = await pagina.locator('.pin3d:visible').count()
  console.log(`${despuesPins === antesPins - 2 ? '✓' : '✗'} apagar «Estacionamiento» oculta sus 2 espacios (${antesPins} → ${despuesPins})`)
  await foto('03k-leyenda-apagada', 300)
  await clic('.cartela-ley .ley-tipo:has-text("Estacionamiento")'); await pagina.waitForTimeout(300)
  // UX-02: mover es previsualización — Cancelar = 0 escrituras, Aplicar confirma
  {
    const posDe = () => { const e = db.Espacios[0]; return `${e.pos_x},${e.pos_y}` }
    const antesPos = posDe(); escriturasPos = 0
    await clic('button:has-text("Mover espacios")'); await pagina.waitForTimeout(600)
    const arrastrar = async () => {
      const pin = pagina.locator('.pin3d:not(.pin3d-tapado)').first(); const bx = await pin.boundingBox()
      await pagina.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await pagina.mouse.down()
      await pagina.mouse.move(bx.x + bx.width / 2 + 40, bx.y + bx.height / 2 + 30, { steps: 8 }); await pagina.mouse.up()
      await pagina.waitForTimeout(1800)
    }
    await arrastrar()
    const aplicarTxt = (await pagina.locator('button:has-text("Aplicar")').textContent()) || ''
    await foto('03p-ux02-previa', 200)
    await clic('button:has-text("Cancelar")'); await pagina.waitForTimeout(1800)
    console.log(`${escriturasPos === 0 && posDe() === antesPos && /\(1\)/.test(aplicarTxt) ? '✓' : '✗'} UX-02 cancelar: «${aplicarTxt.trim()}» y luego Cancelar → ${escriturasPos} escrituras, posición ${posDe()}`)
    await clic('button:has-text("Mover espacios")'); await pagina.waitForTimeout(600)
    await arrastrar()
    await clic('button:has-text("Aplicar")'); await pagina.waitForTimeout(2200)
    console.log(`${escriturasPos === 1 && posDe() !== antesPos ? '✓' : '✗'} UX-02 aplicar: ${escriturasPos} escritura, ${antesPos} → ${posDe()}`)
    await foto('03q-ux02-aplicado', 200)
  }
  // Chinche #15: panel de Capas compacto, sin scroll, y se cierra tocando el mapa
  await clic('button.ctrl-mapa:has-text("Capas")'); await pagina.waitForTimeout(300)
  const sinScroll = await pagina.$eval('.panel-lista', (e) => e.scrollHeight <= e.clientHeight + 1)
  console.log(`${sinScroll ? '✓' : '✗'} panel de Capas cabe sin scroll`)
  await foto('03o-panel-capas', 200)
  await pagina.mouse.click(700, 600); await pagina.waitForTimeout(400)
  const cerrado = (await pagina.locator('.panel-mapa').count()) === 0
  console.log(`${cerrado ? '✓' : '✗'} tocar el mapa cierra el panel de Capas`)
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
  // UX-01: con la red caída nada aparece como guardado y el reintento no pierde el valor
  caidaRed = true
  await pagina.locator('#campo-m2').fill('2700'); await pagina.waitForTimeout(1800)
  const pill = (await pagina.locator('.estado-guardado').textContent().catch(() => '')) || ''
  const valorCampo = await pagina.locator('#campo-m2').inputValue()
  const enServidor = db.Espacios.find((e) => e.id === 'E-001')?.m2
  console.log(`${/sin guardar/.test(pill) && valorCampo === '2700' && String(enServidor) !== '2700' ? '✓' : '✗'} UX-01 caída de red: «${pill.trim()}», el campo conserva ${valorCampo}, el servidor sigue en ${enServidor}`)
  await foto('11d-ux01-sin-guardar', 200)
  caidaRed = false
  await clic('button:has-text("No se guardó · Reintentar")'); await pagina.waitForTimeout(1500)
  const pill2 = (await pagina.locator('.estado-guardado').textContent().catch(() => '')) || ''
  const ya = db.Espacios.find((e) => e.id === 'E-001')?.m2
  console.log(`${/Al día/.test(pill2) && String(ya) === '2700' ? '✓' : '✗'} UX-01 reintento: «${pill2.trim()}», servidor = ${ya}`)
  await foto('11e-ux01-al-dia', 200)
  // UX-03: deshacer detecta el cambio ajeno y no lo pisa; sin conflicto sí deshace
  db.Espacios.find((e) => e.id === 'E-001').m2 = '2800' // «otra persona» cambió los m²
  await clic('.deshacer-propio button:has-text("Deshacer")'); await pagina.waitForTimeout(1500)
  const avisoConf = (await pagina.locator('.deshacer-propio').textContent().catch(() => '')) || ''
  const tras = db.Espacios.find((e) => e.id === 'E-001').m2
  console.log(`${String(tras) === '2800' && /Alguien más/.test(avisoConf) ? '✓' : '✗'} UX-03 conflicto: el servidor sigue en ${tras} · «${avisoConf.trim().slice(0, 90)}»`)
  await foto('11f-ux03-conflicto', 200)
  await pagina.locator('#campo-m2').fill('2900'); await pagina.waitForTimeout(2000)
  await clic('.deshacer-propio button:has-text("Deshacer")'); await pagina.waitForTimeout(1500)
  const tras2 = db.Espacios.find((e) => e.id === 'E-001').m2
  const campo2 = await pagina.locator('#campo-m2').inputValue()
  console.log(`${String(tras2) === '2800' && campo2 === '2800' ? '✓' : '✗'} UX-03 deshacer propio: 2900 → servidor ${tras2}, campo ${campo2}`)
  await foto('11g-ux03-deshecho', 200)
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
  await clic('nav button:has-text("Reporte")'); await pagina.waitForTimeout(800)
  const botonEditor = await pagina.locator('button:has-text("Versiones")').count()
  console.log(`${botonEditor === 0 ? '✓' : '✗'} el editor ${botonEditor === 0 ? 'NO ve' : 'SÍ ve'} el botón de versiones`)
  await foto('06c-reporte-editor-sin-congelar', 200)
  await clic('nav button:has-text("Mapa")')
  await salir()

  // 5 · El admin entra con código y abre el ⚙️
  await clic('text=Tengo un código'); await pagina.waitForTimeout(300)
  await pagina.locator('input[type=password]').first().fill(CODIGO)
  await clic('button[type=submit]:has-text("Entrar")')
  await pagina.waitForSelector('[data-entrada="4"]', { timeout: 30000 }).catch(() => {}); await pagina.waitForTimeout(2500)
  await clic('button[aria-label="Accesos"]'); await foto('07-accesos')
  // Antifallos: la maestra y tu propia cuenta no tienen «Apagar acceso»
  const tarjetaYo = pagina.locator('.tarjeta', { hasText: 'Alejandro Puebla' }).first()
  console.log(`${(await tarjetaYo.locator('button:has-text("Apagar acceso")').count()) === 0 ? '✓' : '✗'} la cuenta maestra / propia no se puede apagar desde el ⚙️`)
  const yo = QUIENES.SIMULADOR
  const intentos = [
    ['apagar a la maestra', servidor('guardar', { codigo: CODIGO, tab: 'Usuarios', key: 'U-001', patch: { activo: 'no' } })],
    ['degradar a la maestra', servidor('guardar', { codigo: CODIGO, tab: 'Usuarios', key: 'U-001', patch: { rol: 'visor' } })],
    ['borrar a la maestra', servidor('borrar', { codigo: CODIGO, tab: 'Usuarios', key: 'U-001' })],
    ['escribir un código a mano', servidor('guardar', { codigo: CODIGO, tab: 'Usuarios', key: 'U-002', patch: { codigo_acceso: 'HACK' } })],
  ]
  for (const [que, r] of intentos) console.log(`${r.ok === false ? '✓' : '✗'} el servidor rechaza ${que}: ${r.error || 'lo permitió'}`)
  void yo
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
    // Regresión: regresar al punto con render (ya en caché) no debe tronar
    const errores360 = []
    const alError = (e) => errores360.push(e.message)
    pagina.on('pageerror', alError)
    await pagina.keyboard.press('Shift+ArrowLeft'); await pagina.waitForTimeout(2500)
    pagina.off('pageerror', alError)
    const apagado2 = await visor.locator('.slider.apagado').count()
    console.log(`${errores360.length === 0 && apagado2 === 0 ? '✓' : '✗'} 360: volver al punto con render sin error (${errores360.join('; ') || 'sin errores'})`)
    await clic('button[aria-label="Cerrar"]')
  } else console.log('✗ no encontré el punto con render en el mapa')
  for (const [seccion, archivo] of [['Finanzas', '05-finanzas'], ['Reporte', '06-reporte'], ['Ayuda', '08-ayuda']]) {
    if (seccion === 'Ayuda') {
      // Fase 5 · reporte: índice, desglose por espacio, supuestos, versión congelada, vista previa
      await pagina.locator('#r-por-espacio').scrollIntoViewIfNeeded(); await foto('06a-reporte-por-espacio', 400)
      await pagina.locator('#r-supuestos').scrollIntoViewIfNeeded(); await foto('06b-reporte-supuestos', 400)
      await pagina.evaluate(() => window.scrollTo(0, 0))
      pagina.once('dialog', (d) => d.accept())
      await clic('button:has-text("Versiones")'); await clic('button:has-text("Congelar esta versión")'); await pagina.waitForTimeout(1500)
      console.log(`${db.Versiones.length === 1 ? '✓' : '✗'} congelar: ${db.Versiones.length} versión(es) en el servidor (${db.Versiones.map((x) => x.id).join(', ')})`)
      await foto('06d-versiones', 300)
      await clic('button:has-text("V-001")'); await foto('06e-viendo-version', 800)
      await clic('button:has-text("Vista previa")'); await foto('06f-vista-previa', 600)
      await clic('button:has-text("Salir de la vista previa")')
    }
    await clic(`nav button:has-text("${seccion}")`); await foto(archivo)
    if (seccion === 'Finanzas') {
      await foto('05-finanzas-cerradas', 300)
      await clic('button[aria-expanded]:has-text("Foro Amalaya")'); await foto('05a-finanzas-foro-abierto', 500)
      // Autocompletar: escribir «=ev» en el monto de una línea
      const monto = pagina.locator('input[aria-autocomplete="list"]').nth(1)
      const previo = await monto.inputValue()
      await monto.fill(''); await monto.type('=ev'); await foto('05c-autocompletar', 500)
      const opciones = await pagina.locator('[aria-label="Factores del espacio"] li').count()
      console.log(`${opciones > 0 ? '✓' : '✗'} autocompletar: ${opciones} sugerencia(s) al escribir «=ev»`)
      await monto.fill(previo)
      // Comparar escenarios
      await clic('text=Comparar dos escenarios'); await foto('05d-comparar-escenarios', 400)
      const comp = await pagina.locator('[aria-label="Comparación de escenarios"]').count()
      console.log(`${comp ? '✓' : '✗'} comparar escenarios lado a lado`)
      // ¿Y si…? — sube precios 20% y vuelve
      const antes = await pagina.locator('.sticky button[title="¿Qué significa este número?"]').first().textContent().catch(() => '')
      await clic('.sticky button:has-text("¿Y si…?")')
      await pagina.locator('.sticky input[aria-label="Precios (%)"]').first().fill('20'); await foto('05e-y-si', 400)
      const despues = await pagina.locator('.sticky button[title="¿Qué significa este número?"]').first().textContent().catch(() => '')
      console.log(`${antes !== despues ? '✓' : '✗'} ¿y si…? +20% precios: ${antes} → ${despues} (no se guarda)`)
      await clic('.sticky button:has-text("volver")')
      await clic('text=¿qué significa?'); await foto('05b-que-significa'); await clic('text=Entendido')
    }
  }
  // Fase 6 · mini MOAC: meta → objetivo → acción ligada a una petición
  await pagina.goto(base); await pagina.waitForSelector('[data-entrada="4"]', { timeout: 30000 }).catch(() => {}); await pagina.waitForTimeout(1500)
  await clic('nav button:has-text("Plan")'); await foto('13-plan-vacio', 600)
  const cuenta = async () => Number(await pagina.locator('[aria-label="Acciones sin objetivo"]').first().getAttribute('data-sin-objetivo'))
  console.log(`  antes: ${await cuenta()} acción(es) sin objetivo`)
  await pagina.locator('input[aria-label="Nueva meta"]').fill('Foro Amalaya operando en 2028'); await clic('button[type=submit]:has-text("Meta")'); await pagina.waitForTimeout(600)
  await pagina.locator('input[aria-label^="Nuevo objetivo para"]').first().fill('Calle Guerrero peatonal'); await clic('button[type=submit]:has-text("Objetivo")'); await pagina.waitForTimeout(600)
  await clic('button:has-text("Acción")'); await pagina.waitForTimeout(300)
  await pagina.locator('input[aria-label="Texto de la acción"]').fill('Llevar la petición de arbolado a Obras Públicas')
  await pagina.locator('input[aria-label="Fecha"]').fill('2026-09-28')
  const valorPeticion = await pagina.locator('select[aria-label="Ligar a"] option', { hasText: 'Arbolado' }).first().getAttribute('value')
  await pagina.locator('select[aria-label="Ligar a"]').selectOption(valorPeticion)
  await foto('13b-nueva-accion', 300)
  await clic('button[type=submit]:has-text("Guardar acción")'); await pagina.waitForTimeout(800)
  await foto('13c-plan-con-accion', 300)
  // La acción vieja (T-001) no tiene objetivo: se le asigna y el contador llega a 0
  const sel = pagina.locator('select[aria-label^="Objetivo para"]').first()
  if (await sel.count()) { const v1 = await sel.locator('option').nth(1).getAttribute('value'); await sel.selectOption(v1); await pagina.waitForTimeout(1500) }
  await foto('13d-plan-contador-cero', 400)
  const final = await cuenta()
  const ligada = db.Tareas.find((t) => t.peticion_id && t.objetivo_id)
  console.log(`${db.Metas.length === 1 && db.Objetivos.length === 1 ? '✓' : '✗'} servidor: ${db.Metas.length} meta, ${db.Objetivos.length} objetivo`)
  console.log(`${ligada ? '✓' : '✗'} acción ligada a la petición ${ligada?.peticion_id || '—'} con objetivo ${ligada?.objetivo_id || '—'}`)
  console.log(`${final === 0 ? '✓' : '✗'} contador «acciones sin objetivo»: ${final}`)
  // El detalle de la petición ya muestra su acción del plan
  await clic('nav button:has-text("Mapa")'); await pagina.waitForTimeout(800)
  await clic('button:has-text("Rutas")'); await pagina.waitForTimeout(400)
  await clic('button:has-text("Peticiones")'); await clic('button:has-text("Arbolado")'); await foto('13e-peticion-con-accion', 800)
  await pagina.goto(base); await pagina.waitForTimeout(2500)

  // Fase 7 · «?» de la sección y La Chinche
  await clic('nav button:has-text("Finanzas")'); await pagina.waitForTimeout(500)
  await clic('button[aria-label="Ayuda de Finanzas"]'); await foto('14-ayuda-finanzas', 1200)
  await clic('button[aria-label="Cerrar ayuda"]')
  await clic('nav button:has-text("Ayuda")'); await foto('14b-ayuda-gifs', 1500)
  // Clavar una chinche de prueba y ver a dónde la manda «Mandar a Claude»
  await pagina.evaluate(() => window.YODChinche.anotar({ texto: 'botón de prueba', css: 'nav' }))
  await pagina.waitForTimeout(600)
  await pagina.locator('.chn-txt').fill('Chinche de prueba del simulador: el título de Ayuda podría ir más chico')
  await clic('.chn-btn[data-ok]'); await pagina.waitForTimeout(2500)
  // Envío automático: sin «Mandar a Claude», la chinche ya está en el servidor
  const llegada = db.Chinches.find((c) => /Chinche de prueba del simulador/.test(c.texto || ''))
  console.log(`${llegada ? '✓' : '✗'} la chinche llegó sola al servidor${llegada ? ` (${llegada.id}, de ${llegada.quien})` : ''}`)
  const enPila = await pagina.evaluate(() => window.YODChinche.cuantas())
  console.log(`${enPila === 0 ? "✓" : "✗"} la pastilla queda en ${enPila} pendientes (no hay que mandar nada a mano)`)
  await foto('14d-chinche-enviada', 300)
  await pagina.goto(base); await pagina.waitForTimeout(2500)

  // El inversionista ve la última versión congelada
  await salir(); await pagina.goto(base); await pagina.waitForTimeout(1200)
  await clic('text=Tengo un código'); await pagina.waitForTimeout(300)
  await pagina.locator('input[type=password]').first().fill('INVERSOR1')
  await clic('button[type=submit]:has-text("Entrar")'); await pagina.waitForTimeout(3000)
  const banda = await pagina.locator('text=Versión congelada').count()
  console.log(`${banda ? '✓' : '✗'} el inversionista ve la versión congelada`)
  await foto('06g-inversionista-congelada', 300)
  await pagina.goto(base + 'recorrido/'); await foto('09-recorrido-360', 4000)
  await pagina.goto(base + 'modelo/serdan-garmendia.html'); await foto('10-modelo-esquina', 5000)
  // La Chinche también en las pantallas sueltas (modelo 3D y recorrido a pantalla completa)
  await pagina.evaluate(() => localStorage.setItem('amalaya_sesion', JSON.stringify({ codigo: 'SIMULADOR', rol: 'admin', nombre: 'Alejandro Puebla', ts: Date.now() })))
  for (const [ruta, nombre] of [['modelo/serdan-garmendia.html', 'modelo'], ['recorrido/', 'recorrido']]) {
    await pagina.goto(base + ruta); await pagina.waitForTimeout(3500)
    const hay = await pagina.locator('button[aria-label="Pendientes de cambio"]').count()
    console.log(`${hay ? '✓' : '✗'} La Chinche en ${nombre}: ${hay ? 'sí' : 'no'} aparece`)
    await foto(`15-chinche-${nombre}`, 300)
  }
  await pagina.goto(base + 'recorrido/?embed=1'); await pagina.waitForTimeout(2500)
  const dentro = await pagina.locator('button[aria-label="Pendientes de cambio"]').count()
  console.log(`${dentro === 0 ? '✓' : '✗'} dentro del mapa (embed) no sale una segunda pastilla`)
}

// GIFs cortos de la Ayuda (npm run gifs): mover un espacio, trazar una
// ruta y escribir una fórmula. Datos inventados del simulador.
export async function gifs({ pagina, clic, base, gif, carpeta }) {
  const entrar = async () => {
    await pagina.goto(base); await pagina.waitForTimeout(1200)
    await clic('text=Tengo un código'); await pagina.waitForTimeout(300)
    await pagina.locator('input[type=password]').first().fill(CODIGO)
    await clic('button[type=submit]:has-text("Entrar")')
    await pagina.waitForSelector('[data-entrada="4"]', { timeout: 30000 }).catch(() => {})
    await pagina.waitForTimeout(2500)
    await clic('text=Saltar guía')
  }
  await entrar()

  // 1 · Mover un espacio
  let g = gif()
  await g.cuadro(600)
  await clic('button:has-text("Mover espacios")'); await pagina.waitForTimeout(500); await g.cuadro(700)
  const pin = pagina.locator('.pin3d', { hasText: 'Uso mixto' }).first()
  const caja = await pin.boundingBox()
  if (caja) {
    const x0 = caja.x + caja.width / 2, y0 = caja.y + caja.height / 2
    await pagina.mouse.move(x0, y0); await pagina.mouse.down(); await g.cuadro(300)
    for (let i = 1; i <= 8; i++) { await pagina.mouse.move(x0 - i * 14, y0 + i * 6, { steps: 3 }); await g.cuadro(110) }
    await pagina.mouse.up(); await pagina.waitForTimeout(400); await g.cuadro(700)
  }
  await clic('button:has-text("Terminar")'); await pagina.waitForTimeout(400); await g.cuadro(1400)
  console.log(`gif mover-espacio: ${g.guardar(`${carpeta}/mover-espacio.gif`)} cuadros`)

  // 2 · Trazar una ruta
  g = gif()
  await clic('button:has-text("Rutas")'); await pagina.waitForTimeout(700); await g.cuadro(600)
  await clic('button:has-text("Ruta Serdán")'); await pagina.waitForTimeout(400); await g.cuadro(500)
  await clic('button:has-text("Trazar (toca el mapa)")'); await pagina.waitForTimeout(400); await g.cuadro(600)
  const lienzo = await pagina.locator('.mapa3d, main [style*="crosshair"]').first().boundingBox()
  const cx = lienzo ? lienzo.x + lienzo.width * 0.3 : 500, cy = lienzo ? lienzo.y + lienzo.height * 0.7 : 600
  for (let i = 0; i < 4; i++) { await pagina.mouse.click(cx + i * 70, cy - i * 25); await pagina.waitForTimeout(350); await g.cuadro(350) }
  await clic('button:has-text("Listo con el trazo")'); await pagina.waitForTimeout(400); await g.cuadro(1400)
  console.log(`gif trazar-ruta: ${g.guardar(`${carpeta}/trazar-ruta.gif`)} cuadros`)
  await clic('button:has-text("Cerrar rutas")')

  // 3 · Escribir una fórmula
  g = gif()
  await clic('nav button:has-text("Finanzas")'); await pagina.waitForTimeout(600)
  await clic('button[aria-expanded]:has-text("Foro Amalaya")'); await pagina.waitForTimeout(500)
  await clic('button:has-text("Ingreso")'); await pagina.waitForTimeout(700)
  const monto = pagina.locator('input[aria-autocomplete="list"]').last()
  await monto.scrollIntoViewIfNeeded(); await pagina.waitForTimeout(300); await g.cuadro(700)
  for (const t of ['=', 'a', 'f']) { await monto.type(t); await g.cuadro(220) }
  await g.cuadro(700)
  await monto.press('Enter'); await g.cuadro(500)
  for (const t of [' ', '*', ' ', 'b', 'o']) { await monto.type(t); await g.cuadro(200) }
  await monto.press('Enter'); await pagina.waitForTimeout(600); await g.cuadro(1600)
  console.log(`gif escribir-formula: ${g.guardar(`${carpeta}/escribir-formula.gif`)} cuadros`)
}
