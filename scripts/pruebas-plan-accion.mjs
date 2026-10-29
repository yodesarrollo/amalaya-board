import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const [data,source,blocks,serials]=await Promise.all(['public/levantamiento/plan-accion-data.json','public/seguimiento-3d.json','public/levantamiento/cuadras.json','public/levantamiento/identificadores-provisionales.json'].map(read));
const input=source.blocks.flatMap(b=>b.buildings.map(x=>x.id));
assert.equal(data.buildings.length,input.length); assert.equal(new Set(data.buildings.map(b=>b.id)).size,input.length);
assert.deepEqual([...data.buildings.map(b=>b.id)].sort(),[...input].sort());
for(const b of data.buildings){
 const physical=blocks.blocks.find(x=>x.buildingIds.includes(b.id));assert(physical, b.id);assert.equal(b.block.id,physical.id);assert.equal(b.block.displayNumber,physical.displayNumber);assert.equal(b.number,serials.numbers[b.id]);
 assert.deepEqual(b.steps.map(x=>x.id),['P1','P2','P3','P4','P5','P6']); const p6=b.steps.find(s=>s.id==='P6');
 for(const step of b.steps){assert(step.criterion);assert(['PENDIENTE','PASA','NO PASA','BLOQUEADO'].includes(step.audit.result));assert(step.audit.reason);if(step.audit.result!=='PENDIENTE')assert(step.audit.auditor&&step.audit.date);}
 const audits=b.steps.flatMap(s=>[s.audit,...Object.values(s.subgates||{}).map(g=>g.audit)]);for(const audit of audits.filter(a=>a&&a.result!=='PENDIENTE')){assert.match(audit.auditor||'',/Astra/,'El dictamen debe identificar auditor independiente Astra');assert.notEqual(audit.auditor,b.productionPackage.responsible,'Productor no se autoaprueba');assert(audit.revision||b.auditReceipt?.producerCommit,'Dictamen sin revisión exacta');assert.match(b.productionPackage.manifestHash||'',/^[a-f0-9]{64}$/,'Dictamen sin hash de paquete');}
 if(b.integration.status==='APROBADO PARA INTEGRAR'){assert(b.steps.filter(s=>s.id!=='P6').every(s=>s.audit.result==='PASA'));assert.equal(p6.subgates?.prepublication?.audit?.result,'PASA',`${b.id}: P6a previo a publicar debe pasar`);}
 if(b.publication.status==='PUBLICADO VERIFICADO'){assert(b.publication.receipt && b.integration.status==='APROBADO PARA INTEGRAR');assert.equal(p6.subgates?.publication?.audit?.result,'PASA');}
}
assert.equal(new Set(data.buildings.map(b=>b.block.id)).size,33);
assert.equal(data.buildings.find(b=>b.id==='C1-13').number,82);assert.equal(data.buildings.find(b=>b.id==='C1-13').block.id,'C06');
for(const id of ['D1-03','D1-04','C1-12'])assert.equal(data.buildings.find(b=>b.id===id).history.publishedVerified,'2026-10-28');
console.log('Inventario, numeración, cuadras, criterios y separación de hitos verificados.');

// Every locally linked historical evidence and log entry must exist; do not invent
// a quality-r2 file merely because a record has a published antecedent.
for(const b of data.buildings){
 for(const ref of b.history.references||[]){assert.match(ref,/^levantamiento\/evidence\/[A-Za-z0-9-]+\/20261028-[a-z0-9-]+\.json$/);await readFile('public/'+ref);}
}
for(const entry of data.agentLog){if(entry.evidence){if(entry.evidence.startsWith('https://github.com/yodesarrollo/amalaya-board/blob/main/'))await readFile(entry.evidence.split('/blob/main/')[1]);else await readFile('public/'+entry.evidence);}}
for(const path of ['public/seguimiento-3d.json','public/levantamiento/cuadras.json','public/levantamiento/identificadores-provisionales.json','docs/EDIFICIO-76-SEIS-PASOS.md','docs/EDIFICIO-77-SEIS-PASOS.md','docs/EDIFICIOS-78-83-SEIS-PASOS.md','docs/EDIFICIOS-79-81-SEIS-PASOS.md','docs/PROCESO-CALIDAD-EDIFICIO-3D.md'])await readFile(path);
for(const id of ['D1-05','D1-06','D1-07','D1-08'])assert(!(data.buildings.find(b=>b.id===id).history.references||[]).some(ref=>ref.includes('calidad-r2')));
const html=await readFile('public/plan-accion-amalaya.html','utf8');assert(!html.includes('encodeURIComponent(b.id)}/20261028-calidad-r2.json'));assert(html.includes("params.get('cuadra')"));
console.log('Fuentes históricas locales y navegación declarada verificadas.');

if(data.updatedAtISO!==undefined)assert(Number.isFinite(Date.parse(data.updatedAtISO))&&/T.*(Z|[+-]\d\d:\d\d)$/.test(data.updatedAtISO),'updatedAtISO requiere hora y zona');
if(data.agents!==undefined)assert(Array.isArray(data.agents));
