import { estiloRespaldo } from './plano-referencia.js'
export function recuperarCartografia(map, { onFallback = () => {}, onReady = () => {}, onFailure = () => {}, schedule = setTimeout, cancel = clearTimeout } = {}) {
  let ready = false, fallback = false, disposed = false, timer
  const recover = () => {
    if (ready || disposed || fallback) return
    fallback = true; cancel(timer)
    onFallback()
    map.setStyle(estiloRespaldo())
    timer = schedule(() => { if (!ready && !disposed) onFailure() }, 15000)
  }
  const onError = event => {
    if (!ready && /style|fetch|Failed|NetworkError|AJAXError/i.test(String(event?.error?.message || event?.error || ''))) recover()
  }
  timer = schedule(recover, 15000)
  map.on('error', onError)
  return {
    ready() { if (disposed) return; ready = true; cancel(timer); onReady() },
    dispose() { disposed = true; cancel(timer); map.off('error', onError) },
  }
}
