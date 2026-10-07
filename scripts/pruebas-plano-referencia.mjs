import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { pixelAGeo, geoAPixel, esquinasReferencia, plano, trazosGeoJSON, montarPlano } from '../src/plano-referencia.js'
import { recuperarCartografia } from '../src/mapa-recuperacion.js'
const reference = JSON.parse(await readFile('public/levantamiento/ground-reference.json','utf8'))
assert.equal(createHash('sha256').update(await readFile('public/levantamiento/ground-reference.jpg')).digest('hex'), plano.reference.imageSha256)
assert.deepEqual(plano.reference.tileBounds, reference.tileBounds)
const [west,south,east,north] = reference.bounds
for (const [point, expected] of [[esquinasReferencia[0],[west,north]],[esquinasReferencia[2],[east,south]]]) {
  assert.ok(point.every((v,i)=>Math.abs(v-expected[i])<1e-10))
}
for (const trace of plano.traces) {
  assert.equal(trace.status,'interpretacion-visual-por-validar')
  assert.ok(trace.pixels.length>=2)
  for (const pixel of trace.pixels) assert.ok(geoAPixel(pixelAGeo(pixel)).every((v,i)=>Math.abs(v-pixel[i])<1e-7))
}
assert.ok(trazosGeoJSON.features.every(f=>f.geometry.type==='LineString'))
const sources={}, layers=[]
montarPlano({addSource:(id,s)=>sources[id]=s,addLayer:l=>layers.push(l)},'/amalaya-board/')
assert.deepEqual(sources['referencia-trazado'].coordinates,esquinasReferencia)
assert.ok(layers.every(l=>l.layout.visibility==='none'),'No aprobar un calco preliminar por defecto')
assert.ok(!layers.some(l=>l.type==='fill-extrusion'),'No generar banquetas 3D de un calco')
function fixture() {
  const events=new Map(),timers=new Map();let seq=0,styles=0,ready=0,fallback=0,failure=0
  const api=recuperarCartografia({on:(k,v)=>events.set(k,v),off:k=>events.delete(k),setStyle:s=>{styles++;assert.equal(s.version,8);assert.deepEqual(s.sources,{})}},{schedule:fn=>{timers.set(++seq,fn);return seq},cancel:id=>timers.delete(id),onFallback:()=>fallback++,onReady:()=>ready++,onFailure:()=>failure++})
  return {api,events,timers,counts:()=>({styles,ready,fallback,failure}),error:()=>events.get('error')?.({error:new Error('Failed to fetch style')}),tick:()=>{const [id,fn]=timers.entries().next().value;timers.delete(id);fn()}}
}
// Failure of the remote style recovers once, without poisoning the mounted canvas.
const f=fixture();f.error();f.error();assert.equal(f.counts().styles,1);f.api.ready();f.error();assert.equal(f.counts().failure,0);assert.equal(f.timers.size,0);f.api.dispose();assert.equal(f.events.size,0)
// Slow load and cleanup don't leave retry loops or late failures after unmount.
const g=fixture();g.tick();assert.equal(g.counts().fallback,1);g.api.dispose();assert.equal(g.timers.size,0);g.api.ready();assert.equal(g.counts().ready,0)
const h=fixture();h.api.ready();h.error();assert.equal(h.counts().styles,0)
const k=fixture();k.tick();k.tick();assert.equal(k.counts().failure,1);k.api.dispose()
console.log('OK: georreferencia exacta de imagen, trazos sin cierre inventado y recuperación sin bucles.')
// A block review never silently promotes legacy lines or closes an occluded side.
assert.equal(new Set(plano.traces.map(t=>t.id)).size,plano.traces.length)
for (const b of plano.blocks) {
  assert.deepEqual(b.sides.map(s=>s.side).sort(),['este','norte','oeste','sur'])
  const [left,top,right,bottom]=b.reviewBoundsPixels
  for(const t of plano.traces.filter(t=>t.block===b.id)) {
    assert(b.sides.some(s=>s.side===t.side && s.status!=='pendiente'))
    assert(t.pixels.every(([x,y])=>x>=left&&x<=right&&y>=top&&y<=bottom))
  }
}
assert(!plano.retiredTraces.some(t=>plano.traces.some(n=>n.id===t.id)))
assert(plano.retiredTraces.every(t=>plano.previousTraces.some(n=>n.id===t.id)))
assert(plano.traces.every(t=>plano.blocks.some(b=>b.id===t.block)))
