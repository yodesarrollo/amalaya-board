import { leerGeo, pctAGeo } from './mapa-geo.js'
import { zonasDeEspacio, centroDeZonas } from './territorio.js'
const num = (value, fallback) => Number.isFinite(parseFloat(value)) ? parseFloat(value) : fallback
// IDs del Sheet; nunca asignar inmuebles por proximidad o por nombre.
export function pinesDeEspacios(espacios = [], config = []) {
  const geo = leerGeo(config)
  return espacios.filter(e => e.id != null).map(e => {
    const zonas = zonasDeEspacio(e)
    const coordinates = zonas.length ? centroDeZonas(zonas) : pctAGeo(geo,
      num(e.pos_x,40) + Math.max(num(e.ancho,18),3)/2,
      num(e.pos_y,40) + Math.max(num(e.alto,12),3)/2)
    return { id:e.id, nombre:String(e.nombre || e.id), coordinates, referencia:zonas.length ? 'Ubicación de la lámina · hipótesis por validar' : 'Ubicación del plano de trabajo' }
  }).filter(p => p.coordinates?.every(Number.isFinite))
}
