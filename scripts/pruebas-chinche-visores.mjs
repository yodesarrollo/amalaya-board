// La Chinche sobre el mapa y dentro de los visores (Street View 360 y caminata
// 3D), el dictado por voz y el camino círculo → Street View. Sin navegador:
// se ejecutan las funciones reales con dependencias mínimas.
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { readFileSync } from 'node:fs'
import { registrarContextoChinche, contextoChinche, registrarRepintadoChinche, repintarParaChinche, describirToqueMapa, describirVisorRecorrido, rumboLegible } from '../src/chinche-contexto.js'
import { buscarPunto, vecinoRecorrido } from '../src/recorrido-state.js'

const leer = (ruta) => readFileSync(new URL('../' + ruta, import.meta.url), 'utf8')
const chinche = leer('public/chinche.js'), visor = leer('public/recorrido/index.html')
const mapa = leer('src/componentes/Mapa3D.jsx'), panel = leer('src/componentes/RecorridoModelo.jsx'), app = leer('src/App.jsx')
const tramo = (texto, desde, hasta) => {
  const a = texto.indexOf(desde), b = texto.indexOf(hasta, a)
  assert.ok(a >= 0 && b > a, `no encontré el tramo ${desde} … ${hasta}`)
  return texto.slice(a, b)
}
const { rutas } = JSON.parse(leer('public/recorrido/rutas.json'))
const plano = (objeto) => JSON.parse(JSON.stringify(objeto)) // lo que sale de vm vive en otro reino

// ── 1 · un círculo del mapa abre el Street View en su punto ─────────────
const r1 = rutas[0], r2 = rutas[1]
assert.deepEqual(buscarPunto(rutas, r1.id, r1.puntos[5].id), { routeId: r1.id, index: 5 })
assert.deepEqual(buscarPunto(rutas, 'ruta-que-ya-no-existe', r2.puntos[2].id), { routeId: r2.id, index: 2 }, 'si la ruta no coincide, manda el punto')
assert.deepEqual(buscarPunto(rutas, '', r2.puntos[0].id), { routeId: r2.id, index: 0 })
assert.equal(buscarPunto(rutas, r1.id, 'no-existe'), null)
assert.equal(buscarPunto(rutas, r1.id, ''), null)
assert.ok(mapa.includes("new CustomEvent('amalaya:recorrido-abrir'"), 'el clic en un círculo avisa al recorrido')
assert.ok(panel.includes("addEventListener('amalaya:recorrido-abrir'") && panel.includes("removeEventListener('amalaya:recorrido-abrir'"), 'el recorrido escucha (y deja de escuchar) al mapa')
assert.ok(!mapa.includes('pop360') && !mapa.includes('title="Recorrido 360"'), 'ya no hay un segundo visor 360 en pop-up')
assert.equal((panel.match(/<iframe/g) || []).length, 2, 'el recorrido tiene exactamente sus dos visores: caminata y Street View')

// ── 2 · anterior / siguiente dentro de Street View ─────────────────────
assert.equal(vecinoRecorrido(r1, 0, -1), null, 'antes del primer punto no hay nada (no da la vuelta)')
assert.equal(vecinoRecorrido(r1, r1.puntos.length - 1, 1), null, 'después del último tampoco')
assert.deepEqual(vecinoRecorrido(r1, 4, 1), { index: 5, punto: r1.puntos[5], etiqueta: 'P06' })
assert.deepEqual(vecinoRecorrido(r1, 4, -1), { index: 3, punto: r1.puntos[3], etiqueta: 'P04' })
assert.equal(vecinoRecorrido(undefined, 0, 1), null)
const cambiarModo = tramo(panel, 'const cambiarModo = modoNuevo => {', 'const seleccionarRuta')
assert.ok(cambiarModo.indexOf('if (modoNuevo === modo') < cambiarModo.indexOf('streetViewReady.current = false'),
  'volver a tocar la vista activa no olvida que su visor ya estaba listo (dejaba muerto anterior/siguiente)')
assert.ok(panel.includes("render360") && panel.includes('location.origin)') && !/postMessage\([^)]*'\*'\)/.test(panel), 'el render privado solo viaja al visor de este mismo origen')

// ── 3 · lo que el mapa y los visores le dicen a la Chinche ─────────────
assert.equal(rumboLegible(0), '0° (N)'); assert.equal(rumboLegible(-90), '270° (O)'); assert.equal(rumboLegible(359.7), '0° (N)'); assert.equal(rumboLegible(134), '134° (SE)')
const toque = describirToqueMapa({ vista: '3D', lat: 29.0759991, lng: -110.9538071, zoom: 18.55, rumbo: 85.2,
  punto: { id: 'abc', ruta: 'R-001', nombre: 'Guerrero peatonal · punto 9' }, espacio: { id: 'E-003', nombre: 'Foro Amalaya' } })
assert.equal(toque.vista, 'mapa · 3D')
assert.equal(toque.texto, 'Mapa en 3D · sobre el punto del recorrido «Guerrero peatonal · punto 9» (R-001) y el espacio «Foro Amalaya» · 29.075999, -110.953807')
assert.deepEqual(toque.valores, { vista: '3D', coordenadas: '29.075999, -110.953807', zoom: '18.6', rumbo: '85° (E)', espacio: 'E-003 · Foro Amalaya', punto: 'R-001 · Guerrero peatonal · punto 9', punto_id: 'abc' })
assert.ok(describirToqueMapa({ vista: 'Planta', lat: 29, lng: -110, zoom: 16, rumbo: 0 }).texto.includes('sin espacio ni punto del recorrido bajo el toque'))
const sv = describirVisorRecorrido({ modo: 'streetview', ruta: r1, indice: 5, version: 'amalaya' })
assert.equal(sv.vista, `mapa · Street View · ${r1.id} P06`); assert.deepEqual(sv.valores, { modo: 'Street View', escenario: 'Amalaya' }); assert.equal(sv.texto, undefined, 'el detalle del toque lo da el visor 360')
const cam = describirVisorRecorrido({ modo: 'caminar', ruta: r1, indice: 2, version: 'actual' })
assert.equal(cam.vista, `mapa · Caminar · ${r1.id} P03`); assert.equal(cam.valores.punto_id, r1.puntos[2].id); assert.ok(cam.texto.startsWith('Caminata 3D'))
assert.equal(describirVisorRecorrido({ modo: 'streetview', ruta: r1, indice: 99, version: 'actual' }), null)
// el registro: responde quien reconoce el elemento; uno roto no impide clavar
const lienzo = {}, marco = {}, pintados = []
const quitar = [
  registrarContextoChinche(() => { throw new Error('proveedor roto') }),
  registrarContextoChinche(({ el }) => (el === lienzo ? { texto: 'mapa' } : null)),
  registrarContextoChinche(({ el }) => (el === marco ? { texto: 'visor' } : null)),
  registrarRepintadoChinche(() => { throw new Error('repintor roto') }),
  registrarRepintadoChinche((m) => pintados.push(m)),
]
assert.deepEqual(contextoChinche({ el: lienzo }), { texto: 'mapa' }); assert.deepEqual(contextoChinche({ el: marco }), { texto: 'visor' }); assert.equal(contextoChinche({ el: {} }), null)
repintarParaChinche(marco); assert.deepEqual(pintados, [marco])
quitar.forEach((q) => q()); assert.equal(contextoChinche({ el: lienzo }), null, 'al desmontar, el componente deja de responder')
assert.ok(app.includes('contexto: (toque) => contextoChinche(toque)') && app.includes('repintar: (marco) => repintarParaChinche(marco)'), 'el board le pasa ambos ganchos a la Chinche')

// ── 4 · la Chinche limpia lo que recibe (viene de otra ventana) ────────
const utiles = vm.runInNewContext(`const recorteDe = (c, x, y) => (c && c.ok ? { recorte: [x, y] } : null);
${tramo(chinche, 'function corto(', 'function pedirContexto(')}; ({ limpiar, unir, corto })`)
assert.equal(utiles.limpiar(null), null); assert.equal(utiles.limpiar('texto suelto'), null)
const sucio = utiles.limpiar({ texto: 'x'.repeat(500) + '\n\n fin', vista: 'v'.repeat(400), html: '<img onerror=alert(1)>', repintar: () => {}, ax: 0.5, ay: 'no', valores: Object.fromEntries(Array.from({ length: 20 }, (_, i) => ['k' + i, i === 3 ? '   ' : 'v'.repeat(200)])), foto: { dataUrl: 'data:text/html;base64,PHNjcmlwdD4=', x: 1, y: 2 } })
assert.equal(sucio.texto.length, 300); assert.equal(sucio.vista.length, 160); assert.equal(sucio.html, undefined); assert.equal(sucio.repintar, undefined)
assert.equal(sucio.ax, 0.5); assert.equal(sucio.ay, undefined)
assert.equal(Object.keys(sucio.valores).length, 12, 'no más de 12 datos de contexto (el servidor recorta el detalle a 4,000 caracteres)')
assert.ok(Object.values(sucio.valores).every((v) => v.length === 120) && !('k3' in sucio.valores), 'cada dato se recorta y los vacíos no cuentan')
assert.equal(sucio.foto, undefined, 'solo se aceptan fotos data:image/…')
for (const dataUrl of ['javascript:alert(1)', 'https://otro.sitio/foto.jpg', 'data:image/svg+xml;base64,PHN2Zz4=']) assert.equal(utiles.limpiar({ foto: { dataUrl } }).foto, undefined)
assert.deepEqual(plano(utiles.limpiar({ foto: { dataUrl: 'data:image/jpeg;base64,AAAA', x: '12', y: 7 } }).foto), { dataUrl: 'data:image/jpeg;base64,AAAA', x: 12, y: 7 })
assert.deepEqual(plano(utiles.limpiar({ foto: { canvas: { ok: true }, x: 3, y: 4 } }).foto), { lista: { recorte: [3, 4] } }, 'un lienzo se recorta en el acto')
assert.equal(utiles.limpiar({ foto: { canvas: { ok: false }, x: 3, y: 4 } }).foto, undefined, 'un lienzo en blanco no se hace pasar por foto')
const junto = utiles.unir({ css: 'iframe', texto: 'dentro', vista: 'a', valores: { marco: 'm', modo: 'viejo' }, foto: 'fotoVisor', ax: 0.2 }, { css: '', texto: '', vista: 'b', valores: { modo: 'Street View' } })
assert.deepEqual(plano(junto), { valores: { marco: 'm', modo: 'Street View' }, vista: 'b', ax: 0.2, css: 'iframe', texto: 'dentro', foto: 'fotoVisor' })
assert.deepEqual(utiles.unir(null, { texto: 'solo' }), { texto: 'solo' }); assert.equal(utiles.unir(null, null), null)

// ── 5 · el visor 360 contesta qué hay bajo el toque ────────────────────
assert.ok(chinche.includes('chinche: "contexto?"') && visor.includes("d.chinche!=='contexto?'") && visor.includes("chinche:'contexto'") && chinche.includes('d.chinche !== "contexto"'), 'la Chinche y el visor hablan el mismo protocolo')
const oyente = tramo(visor, "addEventListener('message',e=>{ const d=e.data||{}; if(e.origin!==location.origin||window.parent===window", 'function ajustar()')
assert.ok(oyente.includes('e.source!==window.parent') && oyente.includes('},location.origin)'), 'el visor solo le contesta a su tablero, en su mismo origen')
assert.ok(tramo(chinche, 'function preguntarMarco(', 'function mirarMarco(').includes('ev.source !== w || ev.origin !== location.origin'), 'la Chinche solo acepta la respuesta del visor al que le preguntó')
const enVisor = (x, y, extra = '') => vm.runInNewContext(`const THREE = { Vector2: class { constructor(x, y) { this.x = x; this.y = y } } };
const innerWidth = 1000, innerHeight = 600, cam = { fov: 100, aspect: 1000 / 600 }, canvas = { width: 2000, height: 1200 };
let yaw = Math.PI / 2, PITCH = 0, idx = 5, clicables = [], matB = { map: null };
const DATA = ${JSON.stringify(r1)}, ray = { setFromCamera() {}, intersectObjects: () => clicables };
const ren = { render() { throw new Error('sin WebGL en la prueba') } };
const document = { getElementById: () => ({ value: '0' }), createElement: () => ({}) };
${extra}
${tramo(visor, "const CARDINAL=['N'", "addEventListener('message',e=>{ const d=e.data||{}; if(e.origin!==location.origin||window.parent===window")}
contextoChinche(${x}, ${y})`)
const centro = enVisor(500, 300)
assert.equal(centro.vista, `Street View · ${r1.id} P06`)
assert.ok(centro.texto.includes(`P06 «${r1.puntos[5].nombre}»`) && centro.texto.endsWith('tocó hacia 90° (E), a la altura del horizonte'), centro.texto)
assert.equal(centro.valores.punto_id, r1.puntos[5].id); assert.equal(centro.valores.escena, 'foto actual'); assert.equal(centro.foto, null, 'sin lienzo legible no se inventa una foto')
const orilla = enVisor(1000, 600)
assert.equal(orilla.valores.rumbo, '153°'); assert.equal(orilla.valores.elevacion, '-50°'); assert.ok(orilla.texto.includes('(SE), 50° abajo del horizonte'), orilla.texto)
const flecha = enVisor(500, 300, "clicables = [{ object: { userData: { rotulo: 'la flecha «Siguiente»' } } }]; matB.map = {}; document.getElementById = () => ({ value: '65' });")
assert.ok(flecha.texto.endsWith('· sobre la flecha «Siguiente»')); assert.equal(flecha.valores.sobre, 'la flecha «Siguiente»'); assert.equal(flecha.valores.escena, 'render Amalaya al 65%')
assert.equal(enVisor('NaN', 300), null)

// ── 6 · dictado por voz ────────────────────────────────────────────────
function hoja(Reconocimiento) {
  const oyentes = {}
  const ta = { value: '', focus() {}, addEventListener: (t, f) => { oyentes[t] = f }, escribir(v) { this.value = v; oyentes.input() } }
  const clases = new Set()
  const boton = { textContent: '', atributos: {}, classList: { toggle: (c, on) => (on ? clases.add(c) : clases.delete(c)) }, setAttribute(k, v) { this.atributos[k] = v } }
  const estado = { textContent: '' }
  const ctx = vm.createContext({ window: { webkitSpeechRecognition: Reconocimiento }, ta, boton, estado })
  const parar = vm.runInContext(`${tramo(chinche, 'function Reconocedor()', '/* anotar() lo llama el tablero')}; dictado(ta, boton, estado)`, ctx)
  return { ta, boton, estado, parar, hay: vm.runInContext('!!Reconocedor()', ctx) }
}
let voz = null
class Falso { constructor() { voz = this; this.activo = false; this.paros = 0 } start() { this.activo = true } stop() { this.activo = false; this.paros++ }
  decir(...frases) { this.onresult({ results: frases.map((f) => [{ transcript: f }]) }) } }
assert.equal(hoja(undefined).hay, false, 'sin reconocimiento de voz no se ofrece el botón')
const h = hoja(Falso)
assert.equal(h.boton.textContent, '🎙 Dictar'); assert.equal(h.boton.atributos['aria-pressed'], 'false')
h.ta.value = 'Cambiar '; h.boton.onclick()
assert.ok(voz.activo && voz.lang === 'es-MX' && voz.continuous && voz.interimResults); assert.equal(h.boton.atributos['aria-pressed'], 'true'); assert.ok(h.estado.textContent.startsWith('Escuchando'))
voz.decir('el color'); assert.equal(h.ta.value, 'Cambiar el color')
voz.decir('el color de', ' este botón'); assert.equal(h.ta.value, 'Cambiar el color de este botón', 'los parciales se sustituyen, no se acumulan')
h.ta.escribir('Cambiar el color de este botón a dorado.')
voz.decir('el color de', ' este botón', 'y más grande'); assert.equal(h.ta.value, 'Cambiar el color de este botón a dorado. y más grande', 'lo corregido a mano se respeta')
const primero = voz; h.boton.onclick()
assert.equal(primero.paros, 1); assert.equal(h.boton.atributos['aria-pressed'], 'false'); assert.equal(primero.onresult, null, 'un resultado tardío ya no escribe')
h.boton.onclick(); assert.notEqual(voz, primero); voz.decir('gracias'); assert.equal(h.ta.value, 'Cambiar el color de este botón a dorado. y más grande gracias')
voz.onerror({ error: 'no-speech' }); assert.equal(h.boton.atributos['aria-pressed'], 'true', 'un silencio no apaga el dictado')
voz.onerror({ error: 'not-allowed' }); assert.equal(h.boton.atributos['aria-pressed'], 'false'); assert.ok(h.estado.textContent.includes('permiso'))
h.boton.onclick(); const tercero = voz; h.parar(); assert.equal(tercero.paros, 1, 'cerrar la hoja apaga el micrófono')
h.boton.onclick(); voz.onend(); assert.equal(h.boton.atributos['aria-pressed'], 'false', 'si el navegador lo corta por silencio, el botón lo refleja')
class SinPermiso { constructor() { throw new Error('bloqueado') } }
const b = hoja(SinPermiso); b.boton.onclick(); assert.equal(b.boton.atributos['aria-pressed'], 'false'); assert.ok(b.estado.textContent.includes('escríbelo'))

// ── 7 · todas las pantallas cargan la misma versión de la Chinche ──────
const versiones = [app, visor, leer('public/modelo/serdan-garmendia.html')].map((t) => t.match(/chinche\.js\?v=(\w+)/)?.[1])
assert.ok(versiones[0] && versiones.every((v) => v === versiones[0]), `versiones de chinche.js: ${versiones.join(', ')}`)

console.log('Chinche en mapa y visores: círculo → Street View, anterior/siguiente, contexto del toque, protocolo con el visor 360, limpieza de datos y dictado por voz verificados sin navegador.')
