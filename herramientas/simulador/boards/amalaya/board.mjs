// Amalaya (repo yodesarrollo/amalaya-board). El Apps Script real está en
// apps-script/Code.gs de ese repo; esto imita sus acciones con datos inventados.
import { datos } from './datos.mjs'

export const base = '/amalaya-board/'

// Credenciales que acepta el servidor falso. SIMULADOR entra como admin;
// EDITOR1 como editor (para ver lo que un editor NO ve, como el ⚙️).
export const CODIGO = 'SIMULADOR'
const QUIENES = {
  SIMULADOR: { rol: 'admin', nombre: 'Alejandro Puebla' },
  EDITOR1: { rol: 'editor', nombre: 'Luis Puebla' },
}
// Google falso: el botón del simulador entrega este id_token.
const TOKEN_GOOGLE = 'SIM-GOOGLE-ID-TOKEN-0123456789'

// Google Identity Services falso (se sirve en lugar de accounts.google.com).
export const locales = [[/accounts\.google\.com\/gsi\/client/, new URL('./gsi-falso.js', import.meta.url).pathname]]

const db = structuredClone(datos)
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
      Object.assign(fila, b.patch); return { ok: true, key: b.key, v: ++v }
    }
    case 'crear': {
      const fila = { id: prefijo[b.tab] + String(db[b.tab].length + 1).padStart(3, '0'), ...b.fila }
      db[b.tab].push(fila); return { ok: true, fila, v: ++v }
    }
    case 'borrar': db[b.tab] = db[b.tab].filter((x) => llave(x) !== b.key); return { ok: true, v: ++v }
    case 'nuevoCodigo': return { ok: true, codigo: 'SIM-NUEVO1', v: ++v }
    case 'generarLiga': return { ok: true, liga: 'https://yodesarrollo.github.io/amalaya-board/?t=SIMULADOR', v: ++v }
    case 'revocarLiga': case 'respaldoAhora': case 'instalarRespaldo': return { ok: true, v }
    case 'subirArchivo': case 'verArchivo': return { ok: false, error: '(simulado) Los archivos de Drive no existen en el simulador.' }
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
  await clic('#gsi-falso'); await foto('03-mapa', 4000)
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
  await clic('button[type=submit]:has-text("Entrar")'); await foto('03c-editor-sin-engrane', 4000)
  await salir()

  // 5 · El admin entra con código y abre el ⚙️
  await clic('text=Tengo un código'); await pagina.waitForTimeout(300)
  await pagina.locator('input[type=password]').first().fill(CODIGO)
  await clic('button[type=submit]:has-text("Entrar")'); await pagina.waitForTimeout(4000)
  await clic('button[aria-label="Accesos"]'); await foto('07-accesos')
  await clic('button:has-text("Apagar acceso")'); await foto('07b-confirmar-apagar', 600)
  await clic('button:has-text("Cancelar")'); await clic('aside button:has-text("Cerrar")')

  await clic('button:has-text("Capas")'); await clic('.fila-capa:has-text("Satélite")')
  await foto('03b-mapa-satelite', 3000); await clic('button:has-text("Capas")')
  await clic('button:has-text("Rutas")'); await foto('04-mapa-rutas')
  for (const [seccion, archivo] of [['Finanzas', '05-finanzas'], ['Reporte', '06-reporte'], ['Ayuda', '08-ayuda']]) {
    await clic(`nav button:has-text("${seccion}")`); await foto(archivo)
    if (seccion === 'Finanzas') { await clic('text=¿qué significa?'); await foto('05b-que-significa'); await clic('text=Entendido') }
  }
  await pagina.goto(base + 'recorrido/'); await foto('09-recorrido-360', 4000)
  await pagina.goto(base + 'modelo/serdan-garmendia.html'); await foto('10-modelo-esquina', 5000)
}
