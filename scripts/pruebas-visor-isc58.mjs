import {removeEbSwHook} from './preparar-ebsw.mjs'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'
import { BASE_VISOR_SHA256, removeIsc58VisorHook, refineVisorBundle, sha256 } from './preparar-isc58.mjs'

const source = removeEbSwHook(await readFile('public/levantamiento/visor/assets/index-RoPA5goG.js', 'utf8'), 'visor')
const runtimeSource = await readFile('public/levantamiento/isc58-refinement.js', 'utf8')
const runtimeHash = sha256(runtimeSource)
const base = removeIsc58VisorHook(source)
assert.equal(sha256(base), BASE_VISOR_SHA256, 'El visor anterior debe conservarse completo al quitar únicamente el hook ISC.')
const regenerated = refineVisorBundle(base, runtimeHash)
assert.equal(removeIsc58VisorHook(regenerated.code), base)
assert.equal(refineVisorBundle(regenerated.code, runtimeHash).code, regenerated.code, 'Preparar dos veces no debe duplicar la geometría ni el import.')
assert.throws(() => refineVisorBundle(`${base}\n`, runtimeHash), /checkpoint|coincide|encuentro/, 'Un visor desconocido debe rechazarse antes de escribir.')
assert.match(regenerated.code, new RegExp(`isc58-refinement\\.js\\?v=${runtimeHash.slice(0, 12)}`), 'El visor debe invalidar la caché cuando cambia la fuente ISC.')
assert.equal(regenerated.code, source, 'El artefacto debe corresponder a la fuente ISC vigente.')
assert.equal(source.split('applyIsc58Refinement(Ng,t,n,Hg,').length, 2, 'Una sola aplicación por carga del visor.')

// Execute the compiled OSM assembly, retaining its real ordering and alias map.
// Geometry itself is covered separately; these doubles test the viewer boundary.
const match = source.match(/async function mv\(\)[\s\S]*?(?=(?:async )?function [\w$]+\()/)
assert.ok(match, 'No se encontró el ensamblado OSM del visor actual.')
const calls = []
const warnings = []
const osm = { elements: [] }
const contextData = { elements: [] }
const detail = { group: { id: 'original-detail' }, colliders: [{ id: 'original-detail-collider' }], stats: { pavingTiles: 1 } }
const layers = Object.fromEntries(['street', 'ob01', 'ob02', 'context', 'routes', 'east'].map(id => [id, {
  group: { id }, colliders: [{ id: `${id}-collider` }],
  stats: { sidewalkTiles: 0, sidewalkPavers: 0, roads: 0, roadRuns: 0, namedBars: 0, benches: 0, planters: 0, lamps: 0 },
  landmarks: [], matchedRoads: [], inspectionPoint: { x: 0, z: 0 },
}]))
const scene = { children: [], add(group) { this.children.push(group); calls.push(`add:${group.id}`) } }
const colliders = []
const tokens = Object.fromEntries(['G', 'J', 'da', 'ua', 'no', 'Y', 'Er', 'q', 'Jn'].map(name => [name, function runtimeToken() {}]))
class Vector3 { constructor(x, y, z) { Object.assign(this, { x, y, z }) } }
const materialFactory = () => {}
const archFactory = () => {}
let applied = false
const expectedRuntime = {
  Group: tokens.G, Mesh: tokens.J, Shape: tokens.da, Path: tokens.ua,
  ShapeGeometry: tokens.no, BoxGeometry: tokens.Y, BufferGeometry: tokens.Er,
  Float32BufferAttribute: tokens.q, Box3: tokens.Jn, Vector3,
  createProceduralMaterial: materialFactory, addArchedWindow: archFactory,
}
const stubWindow = {}
stubWindow.parent = stubWindow
const sandbox = {
  ...tokens, U: Vector3, Q: materialFactory, uf: archFactory,
  Ng: scene, Hg: colliders, $: { position: { x: 0, z: 0 } },
  ff: received => { assert.equal(received, osm); return detail },
  nm: () => layers.street, yg: () => layers.ob01, Cg: () => layers.ob02,
  Um: () => layers.context, tm: () => layers.routes, sg: () => layers.east,
  fetch: async url => ({ ok: true, json: async () => url.includes('osm-plaza-hidalgo') ? osm : contextData }),
  V_: Promise.resolve({ routes: [] }), t_: new Map(), Og: [], Z_: () => {},
  matchMedia: () => ({ matches: true }), E_: 0, Ig: true, Ug: null, M_: null,
  m_: { textContent: '' }, Zg: { textContent: '' },
  document: { getElementById: () => ({ toggleAttribute() {}, removeAttribute() {} }), body: { classList: { add() {} } } },
  window: stubWindow, location: { origin: 'http://localhost' },
  console: { warn: (...items) => warnings.push(items) }, xv: () => {},
  applyIsc58Refinement(receivedScene, receivedOsm, receivedDetail, receivedColliders, runtime) {
    assert.equal(receivedScene, scene)
    assert.equal(receivedOsm, osm)
    assert.equal(receivedDetail, detail, 'Pasar el resultado original de ff preserva la identidad de sus colisiones.')
    assert.equal(receivedColliders, colliders)
    assert.deepEqual(Object.keys(runtime).sort(), Object.keys(expectedRuntime).sort())
    for (const [key, value] of Object.entries(expectedRuntime)) assert.equal(runtime[key], value, `Alias incorrecto: ${key}`)
    assert.ok(scene.children.includes(layers.ob01.group) && scene.children.includes(layers.ob02.group), 'OB-01 y OB-02 deben existir antes de refinar ISC.')
    assert.ok(scene.children.includes(layers.east.group), 'El hook debe ejecutarse después del contexto oriental.')
    assert.ok(colliders.includes(detail.colliders[0]), 'El hook recibe las colisiones originales, no una selección por posición.')
    calls.push('apply-isc')
    applied = true
    scene.add({ id: 'isc-refined' })
    colliders.push({ id: 'isc-refined-collider' })
  },
  Eg: class {
    constructor(receivedScene, camera, receivedColliders) {
      assert.equal(receivedScene, scene)
      assert.equal(receivedColliders, colliders)
      assert.equal(applied, true, 'El avatar debe construirse después del refinamiento y recibir sus colisiones.')
      assert.ok(receivedColliders.some(collider => collider.id === 'isc-refined-collider'))
      calls.push('avatar')
    }
    attach() {}
    enter() {}
  },
}
await vm.runInNewContext(`(${match[0]})()`, sandbox, { timeout: 1000 })
assert.deepEqual(warnings, [], 'No debe ocultarse un fallo del hook en el catch del ensamblado OSM.')
assert.ok(calls.indexOf('apply-isc') >= 0 && calls.indexOf('avatar') > calls.indexOf('apply-isc'))
assert.equal(calls.filter(call => call === 'apply-isc').length, 1)
assert.equal(calls.filter(call => call === 'add:ob01').length, 1)
assert.equal(calls.filter(call => call === 'add:ob02').length, 1)
assert.ok(sandbox.Zg.textContent.startsWith('HIDALGO 3D ·'), 'El visor debe terminar de cargar tras aplicar el hook.')
console.log('ISC-58 visor: checkpoint anterior reversible, caché por fuente, hook único y runtime propio antes del avatar verificados.')
