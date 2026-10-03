import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { applyIsc58, footprintColliderCells } from '../public/levantamiento/isc58-refinement.js'
import { BASE_WORLD_SHA256, BASE_VISOR_SHA256, refineBundle, refineVisorBundle, removeIsc58Hook, removeIsc58VisorHook, regionHashes, sha256 } from './preparar-isc58.mjs'

const published = await readFile('public/levantamiento/world.js', 'utf8')
const base = removeIsc58Hook(published)
const visor = await readFile('public/levantamiento/visor/assets/index-RoPA5goG.js', 'utf8')
const moduleSource = await readFile('public/levantamiento/isc58-refinement.js', 'utf8')
const moduleHash = sha256(moduleSource)
assert.equal(sha256(base), BASE_WORLD_SHA256)
assert.equal(sha256(removeIsc58VisorHook(visor)), BASE_VISOR_SHA256)
assert.equal(published, refineBundle(published, moduleHash).code)
assert.equal(visor, refineVisorBundle(visor, moduleHash).code)
assert.equal(refineBundle(published, moduleHash).code, refineBundle(base, moduleHash).code)
assert.deepEqual(regionHashes(base), regionHashes(published))
assert.throws(() => refineBundle(base + '\n// unreviewed mutation'), /no coincide/)
assert.throws(() => refineVisorBundle(removeIsc58VisorHook(visor) + '\n// unreviewed mutation'), /no coincide/)
assert.throws(() => refineBundle(base, 'invalid-hash'), /inválido/)
const nextHash = sha256(moduleSource + '\n// new editable revision')
assert.notEqual(refineBundle(published, moduleHash).worldSha256, refineBundle(published, nextHash).worldSha256)
assert.notEqual(refineVisorBundle(visor, moduleHash).visorSha256, refineVisorBundle(visor, nextHash).visorSha256)
assert.equal(sha256(moduleSource), JSON.parse(await readFile('public/levantamiento/isc58-provenance.json','utf8')).runtimeModuleSha256)

// Use the exact bundled constructors, without importing a second Three.js version.
const executable = base.replace(/export \{[^\n]+\};\s*$/, '')
const runtime = new Function(executable + '\nreturn {Group:Ot,Mesh:Y,Shape:$r,Path:Qr,ShapeGeometry:Wi,BoxGeometry:X,BufferGeometry:An,Float32BufferAttribute:J,Box3:Zt,Vector3:U,createProceduralMaterial:$,addArchedWindow:pu,buildDetail:hu,buildOb01:Ap,buildOb02:Pp};')()
const osm = JSON.parse(await readFile('public/levantamiento/data/osm-plaza-hidalgo.json', 'utf8'))
const detail = runtime.buildDetail(osm)
const ob01 = runtime.buildOb01(64)
const ob02 = runtime.buildOb02(64)
const world = new runtime.Group()
world.add(detail.group, ob01.group, ob02.group)
const colliders = [...detail.colliders, ...ob01.colliders, ...ob02.colliders]
const oldIscColliders = [...detail.colliders]
const inheritedColliderCount = colliders.length
const inheritedOb01Meshes = []
const inheritedOb02Meshes = []
ob01.group.traverse(object => inheritedOb01Meshes.push([object, object.geometry, object.material]))
ob02.group.traverse(object => inheritedOb02Meshes.push([object, object.geometry, object.material]))
const paving = detail.group.getObjectByName('Pavimento peatonal · losa modular geométrica, sin imagen')
const statue = detail.group.getObjectByName('Silueta propia de estatua de pie · morfología, no reproducción de imagen')
const body = detail.group.getObjectByName('Huella del Instituto Sonorense de Cultura · OpenStreetMap')
body.geometry.computeBoundingBox()
const originalRoofY = body.geometry.boundingBox.max.y + body.position.y
assert(oldIscColliders.some(box => box.containsPoint(new runtime.Vector3(30, 1.7, -45))))
const stats = applyIsc58(world, osm, detail, colliders, runtime)
assert.equal(stats.redOpenings, 3)
assert.equal(stats.photographic, false)
assert.equal(stats.inheritedHeightMeters, 7.45)
assert.equal(stats.removedFrontTriangles, 2)
assert(stats.colliderCells >= 60 && stats.colliderCells <= 90)
assert.equal(colliders.length, inheritedColliderCount - oldIscColliders.length + stats.colliderCells)
assert(!colliders.some(box => oldIscColliders.includes(box)))
assert(!detail.colliders.some(box => box.containsPoint(new runtime.Vector3(30, 1.7, -45))))
body.geometry.computeBoundingBox()
assert.equal(body.geometry.boundingBox.max.y + body.position.y, originalRoofY)
assert.equal(detail.group.getObjectByName(paving.name), paving)
assert.equal(detail.group.getObjectByName(statue.name), statue)
for (const [object, geometry, material] of [...inheritedOb01Meshes, ...inheritedOb02Meshes]) {
  assert.equal(object.geometry, geometry)
  assert.equal(object.material, material)
}
for (const collider of [...ob01.colliders, ...ob02.colliders]) assert(colliders.includes(collider))
const countAfter = colliders.length
assert.equal(applyIsc58(world, osm, detail, colliders, runtime), stats)
assert.equal(colliders.length, countAfter)

const facade = detail.group.getObjectByName('PH-01 · Instituto Sonorense de Cultura · fachada patrimonial interpretada')
const red = facade.getObjectByName('ISC-58 · tramo rojo/blanco de tres vanos · interpretación provisional P05/P06')
const field = red.getObjectByName('ISC-58 · estuco rojo/blanco con tres huecos geométricos')
const upperClosure = facade.getObjectByName('ISC-58 · cierre superior del cuerpo heredado · cota provisional')
assert(upperClosure, 'el cuerpo heredado debe cerrarse entre el paño rojo y su techo')
assert.equal(upperClosure.userData.structuralOnly, true)
assert.equal(upperClosure.userData.measured, false)
assert.equal(upperClosure.userData.confidence, 'provisional')
upperClosure.geometry.computeBoundingBox()
assert(Math.abs(upperClosure.geometry.boundingBox.max.y - originalRoofY) < 1e-6, 'el cierre debe conservar la cota real del techo heredado')
const [redLeft, redRight] = red.userData.boundsLocalX
assert.deepEqual(facade.userData.study.panoramaIds, ['R-001-P05', 'R-001-P06'])
assert.equal(facade.userData.study.parcelCorrespondence, 'unresolved')
assert.equal(facade.userData.study.paleFrontsConfidence, 'baseline generic morphology; unverified')
assert(!facade.getObjectByName('Masa continua de estuco crema · proporción provisional'))
assert(!facade.getObjectByName('Paño terracota contiguo con acceso arqueado · volumen interpretado'))
const creamPanels = facade.children.filter(object => object.name === 'ISC-58 · tramo claro procedural con vanos · límites provisionales')
assert.equal(creamPanels.length, 2)
for (const panel of creamPanels) {
  const [left, right] = panel.userData.boundsLocalX
  assert(right <= redLeft + 1e-6 || left >= redRight - 1e-6)
}
// A bay partly crossed by the colour boundary cannot retain arch/ironwork on a solid panel.
const oldCount = 13
const oldBays = Array.from({ length: oldCount }, (_, index) => ({ x: -stats.frontSpanMeters / 2 + stats.frontSpanMeters * (index + 0.5) / oldCount, width: 3.5 }))
const partialBays = oldBays.filter(bay => (bay.x - bay.width / 2 < redRight && bay.x + bay.width / 2 > redRight)
  || (bay.x - bay.width / 2 < redLeft && bay.x + bay.width / 2 > redLeft))
assert(partialBays.length > 0)
for (const bay of partialBays) {
  assert(!facade.children.some(object => object.name === 'Fondo oscuro de vano · plano retranqueado 24 cm' && Math.abs(object.position.x - bay.x) < 0.01))
  assert(!facade.children.some(object => object.name === 'Arco de medio punto · moldura saliente' && Math.abs(object.position.x - bay.x) < 0.01))
  assert(!facade.children.some(object => object.name === 'Barra vertical de herrería' && Math.abs(object.position.x - bay.x) < bay.width / 2))
}

// A ray normal to a panel hits a triangle exactly when its XY projection contains the point.
function rayHitsPanel(mesh, x, y) {
  const position = mesh.geometry.getAttribute('position')
  const indices = mesh.geometry.index?.array ?? Array.from({ length: position.count }, (_, index) => index)
  const sign = (px, py, ax, ay, bx, by) => (px - bx) * (ay - by) - (ax - bx) * (py - by)
  for (let triangle = 0; triangle < indices.length; triangle += 3) {
    const [a, b, c] = Array.from(indices.slice(triangle, triangle + 3))
    const signs = [sign(x, y, position.getX(a), position.getY(a), position.getX(b), position.getY(b)), sign(x, y, position.getX(b), position.getY(b), position.getX(c), position.getY(c)), sign(x, y, position.getX(c), position.getY(c), position.getX(a), position.getY(a))]
    if (!(signs.some(value => value < -1e-6) && signs.some(value => value > 1e-6))) return true
  }
  return false
}
const center = (redLeft + redRight) / 2
for (const x of [center - 21 * 0.30, center, center + 21 * 0.30]) {
  assert.equal(rayHitsPanel(field, x, 2.5), false, 'el vano debe perforar el panel rojo')
  for (const panel of creamPanels) assert.equal(rayHitsPanel(panel, x, 2.5), false, 'no debe quedar estuco crema detrás')
  assert.equal(rayHitsPanel(upperClosure, x, 2.5), false, 'el cierre superior no debe tapar los tres vanos')
  for (const y of [6.30, 6.90, 7.50]) assert.equal(rayHitsPanel(upperClosure, x, y), true, 'un rayo frontal sobre el paño rojo debe encontrar el cuerpo heredado, no cielo')
}
assert.equal(rayHitsPanel(field, redLeft + 0.5, 2.5), true, 'la pared entre vanos debe conservarse')
const redPanes = red.children.filter(object => object.name === 'Fondo oscuro de vano · plano retranqueado 24 cm')
assert.equal(redPanes.length, 3)
assert(redPanes.every(pane => Math.abs(field.position.z - pane.position.z - 0.24) < 1e-6))
for (const mesh of [...creamPanels, field, upperClosure]) for (const key of ['map', 'roughnessMap', 'normalMap']) {
  assert(Math.abs(mesh.material[key].repeat.x - 1 / 2.2) < 1e-12)
  assert(Math.abs(mesh.material[key].repeat.y - 1 / 2.2) < 1e-12)
  const uv = mesh.geometry.getAttribute('uv')
  const position = mesh.geometry.getAttribute('position')
  for (let vertex = 0; vertex < uv.count; vertex += 1) {
    assert(Math.abs(uv.getX(vertex) - position.getX(vertex)) < 1e-5)
    assert(Math.abs(uv.getY(vertex) - position.getY(vertex)) < 1e-5)
  }
}

const element = osm.elements.find(element => element.id === 664499024)
const footprint = element.geometry.slice(0, -1).map(point => ({ x: (point.lon + 110.9547151) * 97200, z: (29.076115 - point.lat) * 110950 }))
const cells = footprintColliderCells(footprint)
const area = Math.abs(footprint.reduce((sum, a, index) => {
  const b = footprint[(index + 1) % footprint.length]
  return sum + a.x * b.z - b.x * a.z
}, 0)) / 2
assert(stats.colliderAreaMeters2 <= area)
assert(stats.colliderAreaMeters2 > area * 0.97)
function inside(point) {
  let result = false
  for (let index = 0; index < footprint.length; index += 1) {
    const a = footprint[index]
    const b = footprint[(index + 1) % footprint.length]
    if ((a.z > point.z) !== (b.z > point.z) && point.x < (b.x - a.x) * (point.z - a.z) / (b.z - a.z) + a.x) result = !result
  }
  return result
}
for (const cell of cells) {
  assert(cell.maxZ - cell.minZ <= 1.000001)
  for (const tx of [0.001, 0.5, 0.999]) for (const tz of [0.001, 0.5, 0.999]) assert(inside({ x: cell.minX + (cell.maxX - cell.minX) * tx, z: cell.minZ + (cell.maxZ - cell.minZ) * tz }))
}
let nonProceduralMaps = 0
detail.group.traverse(object => {
  if (!object.isMesh) return
  for (const material of Array.isArray(object.material) ? object.material : [object.material]) for (const key of ['map', 'roughnessMap', 'normalMap']) {
    if (material[key] && material[key].userData.source !== 'procedural') nonProceduralMaps += 1
  }
})
assert.equal(nonProceduralMaps, 0)
console.log(`ISC-58: UV métricas, tres vanos, ${stats.colliderCells} celdas interiores (${stats.colliderAreaMeters2.toFixed(1)} m²), altura heredada, preservación OB-01/OB-02 e hooks invertibles comprobados.`)
