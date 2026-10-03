import {removeEbSwHook} from './preparar-ebsw.mjs'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { applyIsc58, footprintColliderCells, repairSouthWalk, repairNorthWalk } from '../public/levantamiento/isc58-refinement.js'
import { BASE_WORLD_SHA256, BASE_VISOR_SHA256, refineBundle, refineVisorBundle, removeIsc58Hook, removeIsc58VisorHook, regionHashes, sha256 } from './preparar-isc58.mjs'

const published = removeEbSwHook(await readFile('public/levantamiento/world.js', 'utf8'))
const base = removeIsc58Hook(published)
const visor = removeEbSwHook(await readFile('public/levantamiento/visor/assets/index-RoPA5goG.js', 'utf8'), 'visor')
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
const runtime = new Function(executable + '\nreturn {Group:Ot,Mesh:Y,Shape:$r,Path:Qr,ShapeGeometry:Wi,BoxGeometry:X,BufferGeometry:An,Float32BufferAttribute:J,Box3:Zt,Vector3:U,Ray:Vn,createProceduralMaterial:$,addArchedWindow:pu,buildDetail:hu,buildOb01:Ap,buildOb02:Pp,buildStreet:of,buildParallel:gf};')()
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

// Phase 03: regression rays against the actual inherited neighbouring walk.
// These points were voids/road overlaps in the published model, not field measurements.
const walkWorld = new runtime.Group()
const walkDetail = runtime.buildDetail(osm)
const walkStreet = runtime.buildStreet(osm, { ob01: true })
const walkParallel = runtime.buildParallel()
walkWorld.add(walkDetail.group, walkStreet.group, walkParallel.group, ob01.group, ob02.group)
walkWorld.updateMatrixWorld(true)
const walkColliders = [...walkDetail.colliders, ...walkStreet.colliders, ...walkParallel.colliders, ...ob01.colliders, ...ob02.colliders]
const northPlaza = walkDetail.group.getObjectByName('Pavimento peatonal · losa modular geométrica, sin imagen')
const northGeometry = northPlaza.geometry
const northMatrix = northPlaza.instanceMatrix.array.slice()
const transition = walkParallel.group.children.find(object => object.name.startsWith('Banda de transición aérea'))
const transitionGeometry = transition.geometry
const transitionTransform = transition.matrix.clone()
const tiles = walkParallel.group.children.find(object => object.isInstancedMesh)
const originalTileMatrices = tiles.instanceMatrix.array.slice()
const originalTileColors = tiles.instanceColor.array.slice()
const originalWalkColliders = [...walkColliders]
function rayAt(world, x, z, originY = 0.8, direction = new runtime.Vector3(0, -1, 0)) {
  world.updateMatrixWorld(true)
  const raycaster = { ray: new runtime.Ray(new runtime.Vector3(x, originY, z), direction), near: 0, far: 2, params: { Mesh: {} } }
  const hits = []
  world.traverse(object => { if (object.isMesh && object.visible) object.raycast(raycaster, hits) })
  return hits.sort((a, b) => a.distance - b.distance)
}
const voidPoints = [[5.70564, 22.60], [5.70564, 23.42], [6.62, 23.0075]]
for (const [x, z] of voidPoints) assert.equal(rayAt(walkWorld, x, z).length, 0, 'el caso previo debe acreditar una junta o borde sin base')
const west = [-11.05, 22.70]
assert(rayAt(walkWorld, ...west).some(hit => hit.object === tiles), 'antes debe existir una loseta sobre calzada')
const interiorBefore = rayAt(walkWorld, 5.70564, 23.0075)[0]
const stage03 = repairSouthWalk(walkWorld, walkColliders, runtime)
assert.equal(stage03.status, 'technical-only')
assert.equal(stage03.measured, false)
assert.equal(stage03.transitionGap, 'retained; unresolved')
assert.equal(stage03.accessibility, 'not established')
assert.equal(stage03.pilasterColliders, 12)
assert(stage03.clippedTiles > 0 && stage03.clippedTiles < tiles.count)
assert.equal(walkWorld.userData.southWalkRepair, stage03)
const walkBase = walkWorld.getObjectByName('PH-01 · banqueta A sur · base continua recortada por calzada · cota heredada provisional')
assert(walkBase)
for (const [x, z] of voidPoints) {
  const hit = rayAt(walkWorld, x, z)[0]
  assert.equal(hit.object, walkBase, 'la junta o borde debe tener base propia')
  assert(Math.abs(hit.point.y - (interiorBefore.point.y - 0.002)) < 1e-6, 'la base debe quedar debajo de la cota heredada, sin superficies coplanares')
}
const westAfter = rayAt(walkWorld, ...west)
assert(westAfter.length > 0)
assert(westAfter.every(hit => hit.object !== tiles && !hit.object.name.includes('banqueta A sur')), 'el asfalto debe quedar libre de base, loseta y laterales')
assert(westAfter.some(hit => Math.abs(hit.point.y - 0.032) < 1e-6), 'debe conservarse el asfalto; el canal heredado puede quedar encima')
const interiorAfter = rayAt(walkWorld, 5.70564, 23.0075)[0]
assert.equal(interiorAfter.object, tiles)
assert.equal(interiorAfter.instanceId, interiorBefore.instanceId)
assert.equal(interiorAfter.point.y, interiorBefore.point.y)
for (let i = 0; i < 16; i++) assert.equal(tiles.instanceMatrix.array[interiorBefore.instanceId * 16 + i], originalTileMatrices[interiorBefore.instanceId * 16 + i])
assert.deepEqual(tiles.instanceColor.array, originalTileColors)
assert.equal(northPlaza.geometry, northGeometry, '03 no debe intervenir pavimento norte')
assert.deepEqual(northPlaza.instanceMatrix.array, northMatrix)
assert.equal(transition.geometry, transitionGeometry, 'la banda desconectada no debe ampliarse ni conectarse')
assert.deepEqual(transition.matrix.elements, transitionTransform.elements)
for (const collider of [...walkStreet.colliders, ...walkParallel.colliders, ...ob01.colliders, ...ob02.colliders]) assert(walkColliders.includes(collider))
for (const [object, geometry, material] of [...inheritedOb01Meshes, ...inheritedOb02Meshes]) {
  assert.equal(object.geometry, geometry)
  assert.equal(object.material, material)
}

// Independently sample cap interiors against real road triangles, rather than
// comparing output with the clipping algorithm that produced it.
const road = walkWorld.getObjectByName('Calle Obregón · perfil aéreo PH-01 6.71 m · eje corregido vs OSM 28788558')
const roadPosition = road.geometry.getAttribute('position')
const roadIndices = road.geometry.index.array
const roadTriangles = []
for (let t = 0; t < roadIndices.length; t += 3) roadTriangles.push(Array.from(roadIndices.slice(t, t + 3), index => new runtime.Vector3(roadPosition.getX(index), roadPosition.getY(index), roadPosition.getZ(index)).applyMatrix4(road.matrixWorld)))
function strictlyOnRoad(point) {
  return roadTriangles.some(([a, b, c]) => {
    const cross = (p, q) => (q.x - p.x) * (point.z - p.z) - (q.z - p.z) * (point.x - p.x)
    const signs = [cross(a, b), cross(b, c), cross(c, a)]
    return signs.every(value => value > 1e-5) || signs.every(value => value < -1e-5)
  })
}
// Independent convex intersection from contained vertices and edge crossings.
function overlapArea(a, b) {
  const contained = (point, triangle) => {
    const signs = triangle.map((p, i) => {
      const q = triangle[(i + 1) % 3]
      return (q.x - p.x) * (point.z - p.z) - (q.z - p.z) * (point.x - p.x)
    })
    return signs.every(s => s >= -1e-7) || signs.every(s => s <= 1e-7)
  }
  const candidates = [...a.filter(p => contained(p, b)), ...b.filter(p => contained(p, a))]
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const p = a[i], q = a[(i + 1) % 3], r = b[j], s = b[(j + 1) % 3]
    const dx = q.x - p.x, dz = q.z - p.z, ex = s.x - r.x, ez = s.z - r.z
    const denominator = dx * ez - dz * ex
    if (Math.abs(denominator) < 1e-10) continue
    const t = ((r.x - p.x) * ez - (r.z - p.z) * ex) / denominator
    const u = ((r.x - p.x) * dz - (r.z - p.z) * dx) / denominator
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) candidates.push({ x: p.x + t * dx, z: p.z + t * dz })
  }
  const points = candidates.filter((p, i) => !candidates.slice(0, i).some(q => Math.hypot(p.x - q.x, p.z - q.z) < 1e-7))
  if (points.length < 3) return 0
  const center = points.reduce((sum, p) => ({ x: sum.x + p.x / points.length, z: sum.z + p.z / points.length }), { x: 0, z: 0 })
  points.sort((p, q) => Math.atan2(p.z - center.z, p.x - center.x) - Math.atan2(q.z - center.z, q.x - center.x))
  return Math.abs(points.reduce((area, p, i) => {
    const q = points[(i + 1) % points.length]
    return area + p.x * q.z - q.x * p.z
  }, 0)) / 2
}
const repairedMeshes = [walkBase, ...walkWorld.children.filter(object => object.name === 'PH-01 · banqueta A sur · loseta recortada por calzada · pieza heredada')]
let sampledCaps = 0
let texturedSides = 0
for (const mesh of repairedMeshes) {
  const p = mesh.geometry.getAttribute('position')
  const n = mesh.geometry.getAttribute('normal')
  const uv = mesh.geometry.getAttribute('uv')
  for (let t = 0; t < p.count; t += 3) {
    if (Math.abs(n.getY(t)) < 0.1) {
      const uvArea = Math.abs((uv.getX(t+1) - uv.getX(t)) * (uv.getY(t+2) - uv.getY(t)) - (uv.getY(t+1) - uv.getY(t)) * (uv.getX(t+2) - uv.getX(t))) / 2
      assert(uvArea > 1e-10, 'los laterales verticales deben tener UV con área, no textura colapsada')
      texturedSides++
    }
    if (n.getY(t) < 0.99) continue
    const vertices = [t, t + 1, t + 2].map(i => new runtime.Vector3(p.getX(i), p.getY(i), p.getZ(i)))
    for (const triangle of roadTriangles) assert(overlapArea(vertices, triangle) < 3e-5, 'un triángulo reparado no debe atravesar asfalto entre sus vértices; tolerancia Float32')
    for (const weights of [[1/3, 1/3, 1/3], [0.8, 0.1, 0.1], [0.1, 0.8, 0.1], [0.1, 0.1, 0.8]]) {
      const point = new runtime.Vector3()
      vertices.forEach((v, index) => point.addScaledVector(v, weights[index]))
      assert(!strictlyOnRoad(point), 'ninguna superficie reparada debe pisar la calzada publicada')
      assert(point.x >= -11.60001 && point.x <= 64.88001 && point.z >= 22.54199 && point.z <= 23.47301, 'la reparación no debe ensanchar el paso heredado')
      sampledCaps++
    }
  }
}
assert(sampledCaps > 100)
assert(texturedSides > 50)
// The retained portion of the clipped western tile must still have its original top.
const clippedHit = rayAt(walkWorld, -11.05, 23.20)[0]
assert(clippedHit.object.name.includes('loseta recortada'))
assert(Math.abs(clippedHit.point.y - interiorBefore.point.y) < 1e-6)
const pilasters = walkParallel.group.children.filter(object => object.isMesh && object.geometry.parameters?.width === 0.34 && object.geometry.parameters.height === 7.6 && object.geometry.parameters.depth === 0.44)
const addedColliders = walkColliders.filter(box => !originalWalkColliders.includes(box) && !walkDetail.colliders.includes(box))
assert.equal(addedColliders.length, pilasters.length)
for (const mesh of pilasters) {
  const expected = new runtime.Box3().setFromObject(mesh)
  assert(addedColliders.some(box => box.equals(expected)), 'cada collider nuevo debe coincidir exactamente con una pilastra visible')
}
const blockedAt = (x, z) => {
  const actor = new runtime.Box3(new runtime.Vector3(x - 0.21, 0.25, z - 0.21), new runtime.Vector3(x + 0.21, 1.82, z + 0.21))
  return addedColliders.some(box => box.intersectsBox(actor))
}
assert.equal(blockedAt(7.52, 23.05), true, 'el avatar no debe atravesar la pilastra visible')
assert.equal(blockedAt(6.62, 23.0075), false, 'los colliders no deben extenderse por toda la hilada')
assert.equal(blockedAt(-11.6, 22.965), true, 'la estrechez occidental debe permanecer visible como limitación, sin inventar accesibilidad')
const walkColliderCountAfter = walkColliders.length
const walkMeshCountAfter = walkWorld.children.length
assert.equal(repairSouthWalk(walkWorld, walkColliders, runtime), stage03)
assert.equal(walkColliders.length, walkColliderCountAfter)
assert.equal(walkWorld.children.length, walkMeshCountAfter)

// Phase 04 operates on the same real assembly after the isolated 03 checkpoint.
const northVoids = [[-0.105, -0.24], [0, 0.005], [10, 0.005]]
for (const [x,z] of northVoids) assert.equal(rayAt(walkWorld,x,z).length,0,'debe acreditarse una junta norte sin superficie antes del arreglo')
const northInteriorBefore = rayAt(walkWorld,-0.47,-0.24)[0]
assert.equal(northInteriorBefore.object,northPlaza)
assert(rayAt(walkWorld,50.63,11.52).some(hit=>hit.object===northPlaza),'antes debe acreditarse pavimento sobre calzada')
const generic = walkStreet.group.children.filter(object=>object.isInstancedMesh&&object.name==='Banqueta · losas de concreto modulares, variación tonal propia')
const genericMatricesBefore = generic.map(object=>object.instanceMatrix.array.slice())
const genericColorsBefore = generic.map(object=>object.instanceColor.array.slice())
const transitionNorth = walkStreet.group.getObjectByName('Transición de plaza a banqueta · paño provisional, sin cruce inventado')
const transitionNorthGeometry = transitionNorth.geometry
const southGeometry = walkBase.geometry
const southPositions = southGeometry.getAttribute('position').array.slice()
const southTilesAfter03 = tiles.instanceMatrix.array.slice()
const southRepairStats = JSON.stringify(stage03)
const collidersAfter03 = [...walkColliders]
const stage04 = repairNorthWalk(walkWorld,runtime)
assert.equal(stage04.status,'technical-only')
assert.equal(stage04.measured,false)
assert.equal(stage04.accessibility,'not established')
assert.equal(stage04.parcelAttribution,'unresolved')
assert(stage04.clippedPlazaTiles>0&&stage04.clippedPlazaTiles<northPlaza.count)
assert(stage04.removedPlazaTiles>0&&stage04.removedPlazaTiles<stage04.clippedPlazaTiles)
assert(stage04.genericChanged>0&&stage04.genericChanged<generic[0].count)
const northBase=walkWorld.getObjectByName('PH-01 · paseo B norte · base bajo juntas recortada por calzada · cota heredada provisional')
assert(northBase)
for (const [x,z] of northVoids) {
  const hit=rayAt(walkWorld,x,z)[0]
  assert.equal(hit.object,northBase,'la junta debe encontrar la base PH01, no el terreno ni otra banqueta')
  assert(Math.abs(hit.point.y-stage04.inheritedMinTileTopMeters+0.002)<1e-6)
}
for (const [x,z] of [[0,11.78],[-46,0]]) assert(rayAt(walkWorld,x,z).every(hit=>hit.object!==northBase),'la base no debe extender la envolvente heredada')
const invasionAfter=rayAt(walkWorld,50.63,11.52)
assert(invasionAfter.some(hit=>hit.object===road),'el asfalto original debe conservarse')
assert(invasionAfter.every(hit=>hit.object!==northPlaza&&hit.object!==northBase&&!hit.object.name.includes('paseo B norte')),'el punto invasor debe quedar libre de todos los componentes reparados')
const northInteriorAfter=rayAt(walkWorld,-0.47,-0.24)[0]
assert.equal(northInteriorAfter.object,northPlaza)
assert.equal(northInteriorAfter.instanceId,northInteriorBefore.instanceId)
assert.equal(northInteriorAfter.point.y,northInteriorBefore.point.y)
for(let i=0;i<16;i++) assert.equal(northPlaza.instanceMatrix.array[northInteriorBefore.instanceId*16+i],northMatrix[northInteriorBefore.instanceId*16+i])
assert.equal(northPlaza.geometry,northGeometry,'la geometría biselada compartida debe mantenerse intacta')
assert.equal(transitionNorth.geometry,transitionNorthGeometry)
assert.equal(walkBase.geometry,southGeometry)
assert.deepEqual(walkBase.geometry.getAttribute('position').array,southPositions)
assert.deepEqual(tiles.instanceMatrix.array,southTilesAfter03)
assert.equal(JSON.stringify(walkWorld.userData.southWalkRepair),southRepairStats)
assert.deepEqual(walkColliders,collidersAfter03,'04 no debe cambiar ningún collider de03niotros edificios')
for(const [object,geometry,material] of [...inheritedOb01Meshes,...inheritedOb02Meshes]) {
  assert.equal(object.geometry,geometry)
  assert.equal(object.material,material)
}
generic.forEach((object,index)=>assert.deepEqual(object.instanceColor.array,genericColorsBefore[index]))
assert.deepEqual(generic[1].instanceMatrix.array,genericMatricesBefore[1],'Juan Álvarez debe conservarse fuera de la huella PH01')
const northMeshes=[northBase,...walkWorld.children.filter(object=>object.name==='PH-01 · paseo B norte · loseta original biselada recortada por calzada')]
let northCaps=0
for(const mesh of northMeshes) {
  const p=mesh.geometry.getAttribute('position'),n=mesh.geometry.getAttribute('normal')
  for(let t=0;t<p.count;t+=3) {
    if(n.getY(t)<0.99)continue
    const triangle=[t,t+1,t+2].map(i=>new runtime.Vector3(p.getX(i),p.getY(i),p.getZ(i)))
    for(const roadTriangle of roadTriangles)assert(overlapArea(triangle,roadTriangle)<3e-5,'tampoco los biseles o fragmentos norte deben cubrir calzada')
    northCaps++
  }
}
assert(northCaps>50)
// Hidden rotated instances must have zero extent, not a residual yaw-sized sliver.
for(let index=0;index<northPlaza.count;index++) {
  if(northPlaza.instanceMatrix.array[index*16+5]!==0)continue
  for(const component of [0,1,2,4,5,6,8,9,10]) assert.equal(northPlaza.instanceMatrix.array[index*16+component],0)
}
// The new vertical road cuts must close the tile at its actual inherited bevel.
const cutRay=rayAt(walkWorld,40.41,11.95,0.14,new runtime.Vector3(0,0,-1)).filter(hit=>hit.object.name==='PH-01 · paseo B norte · loseta original biselada recortada por calzada')[0]
assert(cutRay,'un rayo horizontal debe encontrar el cierre del corte, no atravesar una loseta abierta')
assert(cutRay.point.z>11.60&&cutRay.point.z<11.75,'el cierre debe coincidir con el nuevo borde junto a calzada, no con la cara lejana original')
const keptMesh=northMeshes.find(mesh=>mesh!==northBase)
const colorIndex=keptMesh.userData.originalInstance
const expectedColor=northPlaza.material.color.clone().multiply(northPlaza.material.color.clone().fromArray(northPlaza.instanceColor.array,colorIndex*3))
assert(keptMesh.material.color.equals(expectedColor),'el tono debe combinar material original y color de instancia')
const after04Count=walkWorld.children.length
assert.equal(repairNorthWalk(walkWorld,runtime),stage04)
assert.equal(walkWorld.children.length,after04Count)
console.log(`ISC-58: UV métricas, tres vanos, ${stats.colliderCells} celdas interiores (${stats.colliderAreaMeters2.toFixed(1)} m²), altura heredada, preservación OB-01/OB-02 e hooks invertibles comprobados.`)
console.log(`PH-01 A: base bajo juntas, ${stage03.clippedTiles} losetas recortadas sin pisar calzada, ${stage03.pilasterColliders} colliders de sólidos visibles; cotas, transición y norte conservados.`)
console.log(`PH-01 B: juntas con base, ${stage04.clippedPlazaTiles} losetas retiradas/recortadas con bisel y cierres, ${stage04.genericChanged} genéricas recortadas por ownership;03,OBytransición conservados.`)
