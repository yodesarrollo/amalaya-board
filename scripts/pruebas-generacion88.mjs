// Technical lineage tests for stage88: admission, source coverage and real chain.
import assert from 'node:assert/strict';
import {manifestPath,sourcePaths,verifyC10Generations} from './c10-generaciones.mjs';
const pathFor=stage=>`public/levantamiento/evidence/C10/20261030-practico${stage}-20261110/manifest.json`;
for(const stage of [85,86,87,88]){
 assert.equal(manifestPath(pathFor(stage)),pathFor(stage));
 const sources=sourcePaths(stage);
 for(const unit of [85,86,87,88])assert.equal(sources.includes(`public/levantamiento/c10-${unit}-data.js`),unit<=stage);
}
for(const stage of [84,89,90])assert.throws(()=>manifestPath(pathFor(stage)),/ruta de manifiesto fuera de alcance/);
assert.throws(()=>manifestPath(pathFor(88).replace('practico88','practico880')),/ruta de manifiesto fuera de alcance/);
const {chain}=await verifyC10Generations();
const tip=chain.at(-1).manifest;
assert([87,88].includes(tip.stage),'C10: la punta vigente debe ser87 u88');
if(tip.stage===88){
 assert(tip.sourceHashes['public/levantamiento/c10-88-data.js'],'88 sella su módulo');
 assert.equal(tip.publication,false,'El recibo técnico no acredita publicación');
 assert.equal(chain.at(-2).manifest.stage,87,'88 sucede a87 sin saltos');
}
console.log('Generación88 OK: 85→86→87→88 admitidas;89/90 denegadas; cadena real verificada con punta '+tip.stage+'.');
