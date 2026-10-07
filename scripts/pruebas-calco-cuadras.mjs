import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {pixelToGeo,geoToPixel,blockViewBox} from '../src/calco2d-model.js'
const read=async p=>JSON.parse(await readFile(p)),root='public/levantamiento/'
const data=await read(root+'calco/cuadras-2d.json'),registry=await read(root+'cuadras.json'),geo=await read(root+'calco/cuadras-2d.geojson')
assert.equal(createHash('sha256').update(await readFile('public/'+data.reference.image)).digest('hex'),data.reference.imageSha256)
assert.equal(data.status,'partial');assert.equal(data.summary.completeBlocks,0)
assert.equal(data.reviews.length,33);assert.equal(new Set(data.reviews.map(r=>r.blockId)).size,33)
assert.equal(data.traces.length,25);assert.equal(new Set(data.traces.map(t=>t.id)).size,25)
assert.equal(data.traces.filter(t=>t.type==='borde-calzada').length,20)
assert.equal(data.traces.filter(t=>t.type==='borde-interior-peatonal').length,5)
assert.equal(data.reviews.filter(r=>r.traceIds.length).length,17)
assert.deepEqual(data.summary,registry.tracingSummary)
const {width,height}=data.reference
for(const point of [[0,0],[width,0],[width,height],[0,height],[817.5,923.75]]){
 const back=geoToPixel(pixelToGeo(point,data.reference),data.reference)
 assert(back.every((v,i)=>Math.abs(v-point[i])<1e-6),'ida/vuelta exacta de referencia')
}
// Same geographic point in both z18 inventory and cropped z19 drawing.
const inv=await read(root+'ground-reference.json')
for(const b of registry.blocks){
 const review=data.reviews.find(r=>r.blockId===b.id);assert(review?.reviewed&&review.gaps.length>30)
 assert.equal(review.status,review.traceIds.length?'partial':'needs-evidence')
 assert.equal(b.tracing.traceCount,review.traceIds.length)
 const box=blockViewBox(b,data.reference);assert(box.every(Number.isFinite)&&box[2]>0&&box[3]>0)
 for(const p of b.mapRings.flat()){
  const a=pixelToGeo(p,inv),q=[(p[0]-256)*2,(p[1]-384)*2],c=pixelToGeo(q,data.reference)
  assert(a.every((v,i)=>Math.abs(v-c[i])<1e-9),'calco e inventario comparten ubicación')
 }
}
for(const t of data.traces){
 assert.equal(t.status,'interpretacion-visual-por-contrastar')
 assert(t.pixels.length>=2);assert.notDeepEqual(t.pixels[0],t.pixels.at(-1),'sin cierres ficticios')
 assert(t.pixels.every(([x,y])=>Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<=width&&y>=0&&y<=height))
 assert(data.reviews.find(r=>r.blockId===t.blockId).traceIds.includes(t.id))
 const f=geo.features.find(f=>f.id===t.id);assert.equal(f.geometry.type,'LineString');assert.equal(f.geometry.coordinates.length,t.pixels.length);f.geometry.coordinates.forEach((p,i)=>assert(p.every((v,j)=>Math.abs(v-pixelToGeo(t.pixels[i],data.reference)[j])<1e-10)))
}
assert.equal(geo.features.length,25)
const audit=await read('docs/calco-cuadras-control.json')
assert.equal(audit.initialCandidates,75);assert.equal(audit.retained,25);assert.equal(audit.discarded,50)
console.log('Calco 2D: 33 revisiones, 25 fragmentos abiertos, transformación exacta y ninguna aprobación física.')
