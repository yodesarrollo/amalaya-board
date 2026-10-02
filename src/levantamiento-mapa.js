// Adapter only: the original map owns camera, routes, pins, records and editing.
import { VERSION_LEVANTAMIENTO } from './levantamiento-version.js'
export function montarLevantamiento({ map, mercator, base, onReady, onError, load = () => import(/* @vite-ignore */ `${base}world.js?v=${VERSION_LEVANTAMIENTO}`) }) {
  const abort = new AbortController()
  let active = true, api, world, attached = false
  ;(async () => {
    try {
      api = await load()
      if (!active) return
      world = await api.createWorld(base, abort.signal)
      if (!active) { api.disposeWorld(world); return }
      const layer = api.createMapLayer({ mercator, world })
      layer.setScenario('actual')
      map.addLayer(layer, 'rutas-halo')
      attached = true
      onReady()
      map.triggerRepaint()
    } catch (error) {
      if (!attached && world && active) api.disposeWorld(world)
      if (active && error.name !== 'AbortError') onError(error)
    }
  })()
  return () => {
    active = false
    abort.abort()
    if (attached && map.getLayer('amalaya-levantamiento')) map.removeLayer('amalaya-levantamiento')
  }
}
