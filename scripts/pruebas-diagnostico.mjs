import assert from 'node:assert/strict'
import {snapshot,validateSnapshot,AXES} from '../src/diagnostico-model.js'
const d=snapshot();assert.equal(validateSnapshot(d).axes.length,8)
assert.equal(d.axes.find(a=>a.id==='finanzas').score,null,'La falta de evidencia pública no es cero')
for(const a of AXES)for(const id of a.connects)assert.ok(AXES.some(x=>x.id===id))
for(const score of [-1,6,2.5,'4']){const bad=structuredClone(d);bad.axes[0].score=score;assert.throws(()=>validateSnapshot(bad))}
const missing=structuredClone(d);missing.axes.pop();assert.throws(()=>validateSnapshot(missing))
const bad=structuredClone(d);bad.axes[0].sources=[{title:'x',url:'javascript:alert(1)'}];assert.throws(()=>validateSnapshot(bad))
const duplicate=structuredClone(d);duplicate.axes[1].id=duplicate.axes[0].id;assert.throws(()=>validateSnapshot(duplicate))
console.log('Diagnóstico: ausencias no convertidas a cero, escala, aristas y fuentes de importación verificadas.')
