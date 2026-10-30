// A valid positive fixture must pass the REAL verifier before each negative.
// Never mutate the repository, even indirectly through a directory symlink.
import assert from 'node:assert/strict';
import {mkdtemp,cp,symlink,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd(),temp=await mkdtemp(join(tmpdir(),'amalaya-c10-source-'));
const current='public/levantamiento/evidence/C10/actual.json';
const continuation='public/levantamiento/evidence/C10/20261030-continuacion/manifest.json';
const equipo='public/levantamiento/evidence/C10/20261030-equipo/manifest.json';
const run=()=>spawnSync(process.execPath,['scripts/verificar-publicacion.mjs'],{cwd:temp,encoding:'utf8',maxBuffer:8*1024*1024});
async function negative(label,path,change,expected){
 const bytes=await readFile(join(temp,path));
 try{
  await writeFile(join(temp,path),await change(bytes));
  const result=run();
  assert.equal(result.status,1,label+' must fail');
  assert(result.stderr.includes(expected),label+' must identify its own failure:\n'+result.stderr);
  console.log('C10 negativo OK: '+label+' -> '+expected);
 }finally{await writeFile(join(temp,path),bytes);}
}
try{
 for(const name of ['scripts','public','docs','src','package.json'])await cp(resolve(root,name),join(temp,name),{recursive:true,dereference:true});
 await symlink(resolve(root,'node_modules'),join(temp,'node_modules'));
 const positive=run();
 assert.equal(positive.status,0,'Valid fixture must pass full publication verifier BEFORE negatives:\n'+positive.stderr);
 console.log('C10 positivo OK: verificador completo, sin omitir prerrequisitos.');
 for(const source of ['public/levantamiento/c10-84-data.js','public/levantamiento/c10-85-data.js']){
  await negative('fuente actual '+source,source,b=>Buffer.concat([b,Buffer.from('\n// negative test only\n')]),'C10: artefacto actual '+source);
 }
 const old=JSON.parse(await readFile(join(temp,equipo),'utf8'));
 const historicalPath=Object.keys(old.evidenceFiles)[0];
 await negative('colisión evidencia histórica',continuation,b=>{
  const m=JSON.parse(b);m.evidenceFiles[historicalPath]='0'.repeat(64);return JSON.stringify(m);
 },'C10: evidencia exacta '+historicalPath);
 const pointer=JSON.parse(await readFile(join(temp,current),'utf8'));
 const manifest=JSON.parse(await readFile(join(temp,pointer.manifestPath),'utf8'));
 const snapshot=Object.values(manifest.historicalC10Snapshots)[0];
 await negative('snapshot anterior',snapshot,b=>Buffer.concat([b,Buffer.from('\n// corrupted snapshot\n')]),'C10: fuente anterior exacta ');
 const snapshot82=Object.values(old.historical82Snapshots)[0];
 await negative('snapshot82',snapshot82,b=>Buffer.concat([b,Buffer.from('\n// corrupted snapshot82\n')]),'82: snapshot histórico exacto ');
 await negative('hash del padre',pointer.manifestPath,b=>{
  const m=JSON.parse(b);m.previousManifestSha256='0'.repeat(64);return JSON.stringify(m);
 },'C10: manifiesto anterior inmutable');
 await negative('ruta fuera de alcance',current,b=>{
  const p=JSON.parse(b);p.manifestPath='public/levantamiento/evidence/C10/../../../../package.json';return JSON.stringify(p);
 },'C10: ruta de manifiesto fuera de alcance');
 await negative('cobertura de fuentes',pointer.manifestPath,b=>{
  const m=JSON.parse(b);delete m.sourceHashes['public/levantamiento/c10-85-data.js'];return JSON.stringify(m);
 },'C10: conservar cobertura de fuentes actuales');
 const final=run();assert.equal(final.status,0,'Fixture must be restored:\n'+final.stderr);
 console.log('C10: positivos completos y negativos causales; originales e históricos intactos.');
}finally{await rm(temp,{recursive:true,force:true});}
