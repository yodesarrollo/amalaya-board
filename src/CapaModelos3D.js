// Adaptador preparado para MapLibre 4.7.x + Three 0.160.0.
// No se monta automáticamente: requiere correspondencias y escala validadas.
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export function validarColocacion(f) {
  if (f.estado !== 'validado' || String(f.activo).toLowerCase() !== 'si') throw new Error('Colocación no validada.')
  const campos = ['longitud', 'latitud', 'altitud_m', 'giro_y_deg', 'escala_m_por_unidad', 'ancla_local_x', 'ancla_local_z']
  const n = Object.fromEntries(campos.map((k) => {
    if (f[k] === '' || f[k] == null || !Number.isFinite(Number(f[k]))) throw new Error(`Falta ${k}.`)
    return [k, Number(f[k])]
  }))
  if (Math.abs(n.longitud) > 180 || Math.abs(n.latitud) >= 85 || n.escala_m_por_unidad <= 0) throw new Error('Coordenadas o escala fuera de rango.')
  if (!f.espacio_id || !/^[0-9]{2}$/.test(String(f.modulo_id))) throw new Error('Vínculo incompleto.')
  return { ...f, ...n }
}

function liberar(objeto) {
  objeto.traverse((o) => {
    o.geometry?.dispose()
    for (const m of (Array.isArray(o.material) ? o.material : o.material ? [o.material] : [])) {
      for (const v of Object.values(m)) if (v?.isTexture) v.dispose()
      m.dispose()
    }
  })
}

// `mercator` = maplibregl.MercatorCoordinate. Origen [lng,lat], jamás [lat,lng].
// filas = [{...filaModelos3D, url: URL del GLB autorizado}].
// onEstado({espacio_id,estado:'cargado'|'error',error?}) conserva el bloque
// de reserva hasta confirmar que el GLB de ESE espacio cargó.
export function crearCapaModelos3D({ mercator, filas, origen = [-110.95477, 29.07606], onEstado = () => {} }) {
  const validas = filas.map(validarColocacion)
  const ids = validas.map((f) => String(f.espacio_id))
  if (new Set(ids).size !== ids.length) throw new Error('Más de un modelo activo para un espacio.')
  const ref = mercator.fromLngLat(origen, 0)
  const unidad = ref.meterInMercatorCoordinateUnits()
  const base = new THREE.Matrix4().makeTranslation(ref.x, ref.y, ref.z)
    .scale(new THREE.Vector3(unidad, -unidad, unidad))
    .multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2))
  let viva = false, renderer, camera, scene, mapa
  return {
    id: 'amalaya-modelos-glb', type: 'custom', renderingMode: '3d',
    onAdd(map, gl) {
      viva = true; mapa = map; camera = new THREE.Camera(); scene = new THREE.Scene()
      scene.add(new THREE.HemisphereLight(0xffffff, 0x6b6258, 1.1))
      const luz = new THREE.DirectionalLight(0xfff4e0, 1.6); luz.position.set(-120, 200, 90); scene.add(luz)
      renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl, antialias: true })
      renderer.autoClear = false
      const loader = new GLTFLoader()
      for (const f of validas) {
        loader.load(f.url, (gltf) => {
          if (!viva) { liberar(gltf.scene); return }
          const m = mercator.fromLngLat([f.longitud, f.latitud], f.altitud_m)
          const grupo = new THREE.Group()
          grupo.position.set((m.x - ref.x) / unidad, (m.z - ref.z) / unidad, (m.y - ref.y) / unidad)
          grupo.rotation.y = THREE.MathUtils.degToRad(f.giro_y_deg)
          grupo.scale.setScalar(m.meterInMercatorCoordinateUnits() / unidad * f.escala_m_por_unidad)
          gltf.scene.position.x -= f.ancla_local_x
          gltf.scene.position.z -= f.ancla_local_z
          grupo.add(gltf.scene); grupo.userData.espacio_id = f.espacio_id; scene.add(grupo)
          onEstado({ espacio_id: f.espacio_id, estado: 'cargado' }); map.triggerRepaint()
        }, undefined, (e) => { if (viva) onEstado({ espacio_id: f.espacio_id, estado: 'error', error: String(e.message || e) }) })
      }
    },
    render(gl, matrix) {
      if (!viva) return
      camera.projectionMatrix.fromArray(matrix).multiply(base)
      camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert()
      renderer.resetState(); renderer.render(scene, camera)
      // La escena es estática: repintar continuamente gastaría batería sin necesidad.
    },
    onRemove() {
      viva = false
      if (scene) liberar(scene)
      renderer?.dispose()
      // No forceContextLoss(): el contexto pertenece a MapLibre.
      mapa = null
    },
  }
}
