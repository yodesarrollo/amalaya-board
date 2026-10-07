// One reference for the 2D drawing and its overlay on the 3D map.
// Pixel coordinates refer to the unchanged, hashed image; never to screen pixels.
import plano from './plano-trazos.json' with { type: 'json' }
export { plano }
export function pixelAGeo([x, y]) {
  const { tileZoom, tileBounds } = plano.reference
  const n = 2 ** tileZoom
  const tx = tileBounds[0] + x / 256
  const ty = tileBounds[1] + y / 256
  return [tx / n * 360 - 180, Math.atan(Math.sinh(Math.PI * (1 - 2 * ty / n))) * 180 / Math.PI]
}
export function geoAPixel([lng, lat]) {
  const { tileZoom, tileBounds } = plano.reference
  const n = 2 ** tileZoom, rad = lat * Math.PI / 180
  return [((lng + 180) / 360 * n - tileBounds[0]) * 256,
    ((1 - Math.asinh(Math.tan(rad)) / Math.PI) / 2 * n - tileBounds[1]) * 256]
}
export const esquinasReferencia = [[0,0],[1792,0],[1792,1792],[0,1792]].map(pixelAGeo)
export const trazosGeoJSON = { type: 'FeatureCollection', features: plano.traces.map(t => ({
  type: 'Feature', id: t.id, properties: { id:t.id, tipo:t.type, estado:t.status, cuadra:t.block, lado:t.side, fuente:plano.reference.imageSha256 },
  geometry: { type:'LineString', coordinates:t.pixels.map(pixelAGeo) },
})) }
export const anterioresGeoJSON = { type: 'FeatureCollection', features: (plano.previousTraces || []).map(t => ({
  type:'Feature', id:t.id, properties:{id:t.id,estado:'historico-sin-validar'},
  geometry:{type:'LineString',coordinates:t.pixels.map(pixelAGeo)},
})) }
export function encuadreCuadra(id) {
  const b = plano.blocks?.find(b => b.id === id)
  if (!b) return null
  const [left,top,right,bottom] = b.reviewBoundsPixels
  return [pixelAGeo([left,bottom]),pixelAGeo([right,top])]
}
export function estiloRespaldo() {
  // Local style lets the map recover even if the external vector style fails.
  return { version:8, sources:{}, layers:[{id:'fondo-respaldo',type:'background',paint:{'background-color':'#f6f4ee'}}] }
}
export function montarPlano(m, base, before) {
  m.addSource('referencia-trazado', {type:'image', url:`${base}levantamiento/ground-reference.jpg?v=${plano.reference.imageSha256.slice(0,12)}`,coordinates:esquinasReferencia})
  m.addLayer({id:'referencia-trazado',type:'raster',source:'referencia-trazado',layout:{visibility:'none'},paint:{'raster-opacity':1,'raster-fade-duration':0}},before)
  m.addSource('plano-ambito', {type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'Polygon',coordinates:[[...esquinasReferencia,esquinasReferencia[0]]]}}})
  m.addLayer({id:'plano-papel',type:'fill',source:'plano-ambito',layout:{visibility:'none'},paint:{'fill-color':'#fffdf7','fill-opacity':1}},before)
  m.addSource('plano-anterior', {type:'geojson',data:anterioresGeoJSON})
  m.addLayer({id:'plano-anterior',type:'line',source:'plano-anterior',layout:{visibility:'none'},paint:{'line-color':'#d228a7','line-width':1.6,'line-dasharray':[3,2],'line-opacity':0.9}},before)
  m.addSource('plano-trazos', {type:'geojson', data:trazosGeoJSON})
  m.addLayer({id:'plano-trazos-halo',type:'line',source:'plano-trazos',layout:{visibility:'none'},paint:{'line-color':'#fffdf7','line-width':4,'line-opacity':0.85}},before)
  m.addLayer({id:'plano-trazos',type:'line',source:'plano-trazos',layout:{visibility:'none'},paint:{'line-color':['match',['get','tipo'],'borde-banqueta','#b26513','#167d9a'],'line-width':1.7}},before)
}
