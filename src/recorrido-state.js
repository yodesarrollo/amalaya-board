export function rumboRuta(points, index) {
  const a = points[index === points.length - 1 ? index - 1 : index]
  const b = points[index === points.length - 1 ? index : index + 1]
  if (!a || !b) return 0
  return (Math.atan2((b.lng-a.lng)*97200, (b.lat-a.lat)*110950)*180/Math.PI+360)%360
}
export function mensajeRecorrido(data, routes) {
  if (data?.tipo !== 'recorrido360') return null
  const ruta = routes.find(r => r.id === data.ruta)
  const index = ruta?.puntos.findIndex(p => p.id === data.punto)
  return index >= 0 ? { routeId: ruta.id, index } : null
}
export function urlPanorama(base, route, point) {
  const q = new URLSearchParams({ embed:'1', portal:'1', r:route.id, p:point.id })
  return `${base}recorrido/?${q}`
}
export const PLAN = [
  ['01', 'Medir el territorio', 'Chihuahua y Garmendia, dentro de las rutas Amalaya. Sección por lado, cruces y alturas; aprobar una cuadra a la vez.'],
  ['02', 'Definir la transformación', 'Acordar el proyecto de espacio público y los volúmenes. Sustituir el ensayo de sombra por elementos aprobados.'],
  ['03', 'Producir los pares 360', 'Misma posición, rumbo y horizonte para actual y propuesta. Vincular cada render con su ID original y registrar su revisión.'],
  ['04', 'Afinar la experiencia', 'Materiales y sombras, navegación táctil, colisiones y carga por cercanía. Medir fluidez y memoria en móvil antes de ampliar.'],
]
