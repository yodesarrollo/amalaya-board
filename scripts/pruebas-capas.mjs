import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {THEMES,LAYERS,sequence,decode,encode} from '../public/capas/model.js'
import {scene} from '../public/capas/scene.js'
assert.equal(new Set(LAYERS.map(x=>x.id)).size,17)
const svg=scene()
for(const l of LAYERS){assert.ok(THEMES.some(t=>t.id===l.theme));assert.ok(l.note.length>40);assert.equal(svg.split(`data-layer="${l.id}"`).length,2)}
assert.equal(sequence('arte','tema').length,5)
assert.equal(sequence('arte','acumulativo').length,9)
assert.equal(sequence('todo','tema').length,17)
const s={layers:['piso','arboles','piso','evil'],background:'croquis',theme:'urbanismo',mode:'tema'}
assert.deepEqual(decode('#'+encode(s)),{...s,layers:['piso','arboles']})
assert.deepEqual(decode('#capas=<script>,solar,solar&fondo=javascript:alert(1)&tema=bad'),{layers:['solar'],background:'croquis',theme:'todo',mode:'tema'})
const acceso=readFileSync('src/componentes/Acceso.jsx','utf8');assert.match(acceso,/\['mapa','observatorio','seguimiento','capas'\]/)
console.log('Capas: independencia, secuencia por tema/acumulativa, URL segura y entrada pública verificados.')
assert.match(svg, /corte transversal vial/i)
assert.match(svg, /assets\/transversal\/base\.png/)
assert.doesNotMatch(svg, /matrix\(|corte-base\.png|assets\/solar\.png/)
assert.equal((svg.match(/data-guide=/g)||[]).length,3)
assert.ok(svg.includes('data-road-object'))

// Shared public drawing links must not wait for session revalidation.
const {runInNewContext}=await import('node:vm')
const entryHtml=readFileSync('index.html','utf8')
const entryScript=entryHtml.match(/<script>([\s\S]*?)<\/script>/)[1]
for(const [suffix,expected] of [['?seccion=capas','capas/index.html'],['?seccion=capas#capas=solar','capas/index.html#capas=solar'],['?seccion=capas&t=test-only',null],['?seccion=reporte',null],['',null]]){
 let target=null
 runInNewContext(entryScript,{URL,window:{location:{href:'https://example.test/amalaya-board/'+suffix,replace:v=>target=v}}})
 assert.equal(target,expected?'https://example.test/amalaya-board/'+expected:null)
}
const drawingHtml=readFileSync('public/capas/index.html','utf8')
assert.ok(drawingHtml.includes('class="scene-fallback"'))
assert.ok(drawingHtml.includes('href="../?seccion=mapa"'))
assert.ok(entryHtml.includes('href="/amalaya-board/capas/index.html"'))
