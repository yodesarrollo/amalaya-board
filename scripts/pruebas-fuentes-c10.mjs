// Exercise the actual publication verifier against a changed current source.
// Only the temporary copy is changed; all other inputs are read-only symlinks.
import assert from 'node:assert/strict';
import {mkdtemp,readdir,mkdir,symlink,readFile,writeFile,rm,unlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd(),temp=await mkdtemp(join(tmpdir(),'amalaya-c10-source-'));
try{
 for(const name of await readdir(root))if(name!=='.git'&&name!=='public')await symlink(resolve(root,name),join(temp,name));
 await mkdir(join(temp,'public'));
 for(const name of await readdir(resolve(root,'public')))if(name!=='levantamiento')await symlink(resolve(root,'public',name),join(temp,'public',name));
 await mkdir(join(temp,'public/levantamiento'));
 for(const name of await readdir(resolve(root,'public/levantamiento'))){
  const source=resolve(root,'public/levantamiento',name),target=join(temp,'public/levantamiento',name);
  if(name==='c10-84-data.js')await writeFile(target,(await readFile(source,'utf8'))+'\n// Deliberate current-source mismatch, temporary test only.\n');
  else await symlink(source,target);
 }
 const result=spawnSync(process.execPath,[resolve(root,'scripts/verificar-publicacion.mjs')],{cwd:temp,encoding:'utf8',maxBuffer:8*1024*1024});
 assert.equal(result.status,1,'Publication verifier must reject the changed current source');
 assert.match(result.stderr,/C10: artefacto actual public\/levantamiento\/c10-84-data\.js/,'Failure must identify the current C10 source, not an unrelated prerequisite');
 console.log('C10: el verificador real rechaza una fuente actual alterada; históricos y original intactos.');
 // A repeated historical key must not replace its previous immutable hash.
 await unlink(join(temp,'public/levantamiento/c10-84-data.js'));
 await symlink(resolve(root,'public/levantamiento/c10-84-data.js'),join(temp,'public/levantamiento/c10-84-data.js'));
 for(const relative of ['public/levantamiento/evidence','public/levantamiento/evidence/C10','public/levantamiento/evidence/C10/20261030-continuacion']){
  await unlink(join(temp,relative));await mkdir(join(temp,relative));
  for(const name of await readdir(resolve(root,relative)))await symlink(resolve(root,relative,name),join(temp,relative,name));
 }
 const old=JSON.parse(await readFile(resolve(root,'public/levantamiento/evidence/C10/20261030-equipo/manifest.json'),'utf8'));
 const relative='public/levantamiento/evidence/C10/20261030-continuacion/manifest.json';
 const current=JSON.parse(await readFile(resolve(root,relative),'utf8'));
 const historicalPath=Object.keys(old.evidenceFiles)[0];
 current.evidenceFiles[historicalPath]='0'.repeat(64);
 await unlink(join(temp,relative));await writeFile(join(temp,relative),JSON.stringify(current));
 const collision=spawnSync(process.execPath,[resolve(root,'scripts/verificar-publicacion.mjs')],{cwd:temp,encoding:'utf8',maxBuffer:8*1024*1024});
 assert.equal(collision.status,1,'A repeated historical key with a different hash must fail');
 assert(collision.stderr.includes('C10: evidencia exacta '+historicalPath),'Failure must identify the repeated historical evidence');
 console.log('C10: una clave histórica repetida con otro hash no puede ocultar la evidencia anterior.');
}finally{await rm(temp,{recursive:true,force:true});}
