import assert from 'node:assert/strict'
import fs from 'node:fs'
import {mergePublications,parseImport,ordered,buildGraph,engagement,validatePublication,hasMetrics,safeUrl,actorName} from '../src/observatorio-model.js'
const dataset=JSON.parse(fs.readFileSync('public/observatorio/publicaciones.json','utf8'))
const pubs=parseImport(JSON.stringify(dataset))
assert.ok(pubs.length>0)
assert.equal(new Set(pubs.map(p=>p.id)).size,pubs.length)
for(const p of pubs){assert.ok(p.url.startsWith('https://'));if(p.image&&!safeUrl(p.image))assert.ok(fs.existsSync('public/observatorio/portadas/'+p.image));assert.equal(hasMetrics(p),false)}
const sample=pubs[0],old={...sample,date:'2026-01-02'},undated={...pubs[1],date:null},recent={...pubs[2],date:'2026-10-20'}
assert.deepEqual(ordered([undated,recent,old]).map(p=>p.date),['2026-01-02','2026-10-20',null])
assert.deepEqual(ordered([undated,recent,old],'new').map(p=>p.date),['2026-10-20','2026-01-02',null])
const merged=mergePublications([sample],[{...sample,id:'capture',url:sample.url+'?utm_source=test',title:'Updated'}]);assert.equal(merged.length,1);assert.equal(merged[0].id,sample.id);assert.equal(merged[0].title,'Updated')
assert.equal(engagement(sample),null)
assert.equal(engagement({...sample,metrics:{views:100,likes:0,comments:0,shares:0}}),0)
assert.equal(engagement({...sample,metrics:{views:100,likes:2,comments:null,shares:0}}),null)
assert.equal(hasMetrics({...sample,metrics:{likes:0}}),true)
assert.equal(safeUrl('javascript:alert(1)'), '')
assert.throws(()=>parseImport('{"publications":[{"title":"Invalid","url":"javascript:x"}]}'))
assert.throws(()=>parseImport('{"publications":[null]}'))
const graph=buildGraph(pubs), ids=new Set(graph.nodes.map(n=>n.id));for(const e of graph.edges){assert.ok(ids.has(e.source));assert.ok(ids.has(e.target));assert.ok(pubs.some(p=>p.id===e.publicationId))}
const normalized=validatePublication({...sample,metrics:{views:-2,likes:null,shares:0}});assert.equal(normalized.metrics.views,null);assert.equal(normalized.metrics.shares,0)
console.log(`Observatorio: ${pubs.length} registros, portadas presentes, importación segura, deduplicación, fechas, métricas y ${graph.edges.length} relaciones con fuente verificados.`)

const first={...sample,metrics:{views:100,likes:0,comments:null,shares:null,observedAt:'2026-10-20T12:00:00Z'}};const second={...sample,metrics:{views:200,likes:4,comments:null,shares:null,observedAt:'2026-10-21T12:00:00Z'}};const tracked=mergePublications([first],[second])[0];assert.equal(tracked.metricHistory.length,2);assert.equal(tracked.metrics.views,200);assert.equal(mergePublications([tracked],[sample])[0].metricHistory.length,2);
assert.equal(actorName('Eter Ayvar'),'Etel Ayvar');assert.notEqual(actorName('Florencio Díaz Romero'),actorName('Carlos Díaz Romero'));
