// Calibración compartida por el mapa de trabajo y el levantamiento.
export const GEO_DEF = [
  // Calibrado 12-sep-2026 por correlación de la red vial (OSM) contra la
  // foto: 421 × 346 m, norte arriba, coincidencia 0.67. Se afina en el board.
  [-110.957125, 29.07749],
  [-110.952798, 29.07749],
  [-110.952798, 29.074361],
  [-110.957125, 29.074361],
]

export function leerGeo(config) {
  const fila = (config || []).find((c) => String(c.clave) === 'mapa_geo')
  try {
    const j = JSON.parse(fila?.valor || '')
    if (Array.isArray(j) && j.length === 4 && j.every((p) => Array.isArray(p) && p.length === 2)) return j
  } catch { /* sin calibrar */ }
  return GEO_DEF
}

// Porcentaje del plano → [lng, lat] con las 4 esquinas (afín: soporta giro).
export function pctAGeo(geo, x, y) {
  const [tl, tr, , bl] = geo
  const u = x / 100, v = y / 100
  return [
    tl[0] + u * (tr[0] - tl[0]) + v * (bl[0] - tl[0]),
    tl[1] + u * (tr[1] - tl[1]) + v * (bl[1] - tl[1]),
  ]
}

// [lng, lat] → porcentaje del plano (inversa de pctAGeo).
export function geoAPct(geo, lng, lat) {
  const [tl, tr, , bl] = geo
  const a = tr[0] - tl[0], b = bl[0] - tl[0], c = tr[1] - tl[1], d = bl[1] - tl[1]
  const det = a * d - b * c || 1e-12
  const dx = lng - tl[0], dy = lat - tl[1]
  const u = (dx * d - b * dy) / det, v = (a * dy - c * dx) / det
  return [Number((u * 100).toFixed(2)), Number((v * 100).toFixed(2))]
}
