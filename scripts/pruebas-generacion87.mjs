// Technical lineage tests only: fixtures never represent a produced building.
import assert from 'node:assert/strict';
import {manifestPath,sourcePaths} from './c10-generaciones.mjs';
const pathFor=stage=>`public/levantamiento/evidence/C10/20261030-practico${stage}-20261105/manifest.json`;
for(const stage of [85,86,87]){
 assert.equal(manifestPath(pathFor(stage)),pathFor(stage));
 const sources=sourcePaths(stage);
 for(const unit of [85,86,87])assert.equal(sources.includes(`public/levantamiento/c10-${unit}-data.js`),unit<=stage);
}
for(const stage of [84,88,89])assert.throws(()=>manifestPath(pathFor(stage)),/ruta de manifiesto fuera de alcance/);
for(const path of [pathFor(87).replace('/manifest.json','/../manifest.json'),pathFor(87).replace('practico87','practico870'),pathFor(87).replace('/C10/','/privado/')])assert.throws(()=>manifestPath(path),/ruta de manifiesto fuera de alcance/);
console.log('Entrada87 OK:85/86 preservados;87 incluido;88/89 y rutas ajenas rechazadas.');

// Exercise the real CLI/verifier in an isolated, complete lineage fixture.
const {mkdtemp,mkdir,copyFile,readFile,writeFile,rm,symlink}=await import('node:fs/promises');
const {tmpdir}=await import('node:os');
const {join,dirname,resolve}=await import('node:path');
const {spawnSync}=await import('node:child_process');
const {verifyC10Generations,digest,ACTUAL}=await import('./c10-generaciones.mjs');
const baseline=await verifyC10Generations();
assert(baseline.chain.some(e=>e.manifest.stage===85)&&baseline.chain.some(e=>e.manifest.stage===86));
const temp=await mkdtemp(join(tmpdir(),'amalaya-generation87-'));
const run=(script,args=[])=>spawnSync(process.execPath,[script,...args],{cwd:temp,encoding:'utf8',maxBuffer:4*1024*1024});
const verify=()=>run('scripts/check.mjs');
const generate=(stage=87,name=`20261030-practico${stage}-regresion87`)=>run('scripts/generar-generacion-c10.mjs',['--etapa',String(stage),'--nombre',name]);
async function mutate(label,path,change,message){
 const bytes=await readFile(join(temp,path));
 try{await writeFile(join(temp,path),change(bytes));const result=verify();assert.notEqual(result.status,0,label);assert(result.stderr.includes(message),label+' must fail causally: '+result.stderr);console.log('Negativo87 OK: '+label);}
 finally{await writeFile(join(temp,path),bytes);}
 assert.equal(verify().status,0,'positive restored after '+label);
}
try{
 const paths=new Set([ACTUAL,'scripts/c10-generaciones.mjs','scripts/generar-generacion-c10.mjs']);
 for(const e of baseline.chain){paths.add(e.path);for(const p of Object.keys(e.manifest.sourceHashes))paths.add(p);for(const p of Object.keys(e.manifest.evidenceFiles))paths.add(p);for(const p of Object.values(e.manifest.historicalC10Snapshots||{}))paths.add(p);for(const p of Object.values(e.manifest.historical82Snapshots||{}))paths.add(p);}
 for(const p of paths){await mkdir(dirname(join(temp,p)),{recursive:true});await copyFile(resolve(p),join(temp,p));}
 await writeFile(join(temp,'scripts/check.mjs'),"import {verifyC10Generations} from './c10-generaciones.mjs'; await verifyC10Generations();");
 const base86=baseline.chain.filter(e=>e.manifest.stage===86).at(-1);
 // The regression also runs after87 lands: reconstruct exact86 bytes, never
 // relabel today's geometry as an old generation or mutate the repository.
 for(const [source,hash] of Object.entries(base86.manifest.sourceHashes)){
  let bytes=await readFile(resolve(source));
  if(digest(bytes)!==hash){
   const snapshot=baseline.chain.map(e=>e.manifest.historicalC10Snapshots?.[source+'@'+hash]).find(Boolean);
   assert(snapshot,'exact86 snapshot required: '+source);bytes=await readFile(resolve(snapshot));
  }
  assert.equal(digest(bytes),hash);await writeFile(join(temp,source),bytes);
 }
 await writeFile(join(temp,ACTUAL),JSON.stringify({schemaVersion:1,manifestPath:base86.path,sha256:base86.hash}));
 assert.equal(verify().status,0,'real85/86 fixture must pass before87');
 await writeFile(join(temp,'public/levantamiento/c10-87-data.js'),'// TECHNICAL TEST FIXTURE ONLY: no produced building.\nexport const C10_87={buildings:[]};\n');
 const result=generate();assert.equal(result.status,0,'CLI87 must seal real complete chain: '+result.stderr);
 assert.equal(verify().status,0,'generated87 must pass real verifier');
 const pointer=JSON.parse(await readFile(join(temp,ACTUAL)));
 const m=JSON.parse(await readFile(join(temp,pointer.manifestPath)));
 assert.equal(m.stage,87);assert.equal(m.publication,false);assert.equal(m.previousManifestPath,base86.path);
 assert.equal(m.sourceHashes['public/levantamiento/c10-87-data.js'],digest(await readFile(join(temp,'public/levantamiento/c10-87-data.js'))));
 const receipt=JSON.parse(await readFile(join(temp,dirname(pointer.manifestPath)+'/recibo-trazabilidad.json')));assert.equal(receipt.publication,false);
 for(const stage of [88,89]){const r=generate(stage);assert.notEqual(r.status,0);assert(r.stderr.includes('--etapa 85|86|87'));}
 for(const stage of [85,86,87]){const p=`public/levantamiento/c10-${stage}-data.js`;await mutate('source'+stage,p,b=>Buffer.concat([b,Buffer.from('\n// mutation\n')]),'C10: artefacto actual '+p);}
 await mutate('publication cannot be certified',pointer.manifestPath,b=>{const x=JSON.parse(b);x.publication=true;return JSON.stringify(x);},'C10: recibo técnico, no acredita publicación');
 const snapshot=Object.values(m.historicalC10Snapshots)[0];await mutate('historical snapshot',snapshot,b=>Buffer.concat([b,Buffer.from('\n// mutation\n')]),'C10: fuente anterior exacta');
 await mutate('parent immutable',pointer.manifestPath,b=>{const x=JSON.parse(b);x.previousManifestSha256='0'.repeat(64);return JSON.stringify(x);},'C10: manifiesto anterior inmutable');
 await mutate('coverage87 mandatory',pointer.manifestPath,b=>{const x=JSON.parse(b);delete x.sourceHashes['public/levantamiento/c10-87-data.js'];return JSON.stringify(x);},'C10: conservar cobertura de fuentes actuales');
 await symlink(join(temp,'public/levantamiento/c10-87-data.js'),join(temp,'public/levantamiento/test-link87.js'));
 const check=run('--input-type=module',['-e',"import {safeRead} from './scripts/c10-generaciones.mjs'; await safeRead('public/levantamiento/test-link87.js');"]);assert.notEqual(check.status,0);assert(check.stderr.includes('C10: enlace no permitido'));
 const original=await readFile(join(temp,ACTUAL));
 const prior85=baseline.chain.filter(e=>e.manifest.stage===85).at(-1);
 await writeFile(join(temp,ACTUAL),JSON.stringify({schemaVersion:1,manifestPath:prior85.path,sha256:prior85.hash}));
 const skipped=generate(87,'20261030-practico87-salto');assert.notEqual(skipped.status,0,'85→87 must fail');assert(skipped.stderr.includes('C10: orden obligatorio'),skipped.stderr);
 await writeFile(join(temp,ACTUAL),original);assert.equal(verify().status,0);
 console.log('Generación87 OK: CLI, sucesión85→86→87,88/89 denegados, fuentes,publication=false,snapshots,rutas,enlaces y salto85→87.');
}finally{await rm(temp,{recursive:true,force:true});}
