// Seal a NEW technical generation. No audits, photos or publication are invented.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,readdir,lstat,rename} from 'node:fs/promises';
import {basename,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {C10_ROOT,ACTUAL,digest,sourcePaths,safeRead,safePath,manifestPath,evidencePath,loadC10Chain,verifyC10Generations} from './c10-generaciones.mjs';
const options={evidence:[]};
for(let i=2;i<process.argv.length;i+=2){
 const key=process.argv[i],value=process.argv[i+1];assert(value,'Falta valor para '+key);
 if(key==='--evidencia')options.evidence.push(value);
 else {assert(['--etapa','--nombre','--anterior-ref','--historico-repo'].includes(key),'Opción desconocida '+key);assert(!(key in options),'Opción repetida '+key);options[key]=value;}
}
const stage=Number(options['--etapa']);assert([85,86].includes(stage),'--etapa 85|86');
const path=manifestPath(C10_ROOT+'/'+options['--nombre']+'/manifest.json');
assert(path.startsWith(C10_ROOT+'/20261030-practico'+stage),'Nombre y etapa deben coincidir');
if(options['--anterior-ref'])assert.match(options['--anterior-ref'],/^[a-f0-9]{40}$/,'Usar SHA completo de las fuentes anteriores');
const {chain}=await loadC10Chain(),previous=chain.at(-1);
assert(!chain.some(e=>e.path===path),'No reescribir una generación anterior');
const receipt=dirname(path)+'/recibo-trazabilidad.json';
for(const target of [path,receipt]){
 try{await lstat(target);assert.fail('No reescribir '+target);}catch(error){if(error.code!=='ENOENT')throw error;}
}
const sourceHashes={};
for(const source of sourcePaths(stage))sourceHashes[source]=digest(await safeRead(source));
const historicalC10Snapshots={};
for(const [source,hash] of Object.entries(previous.manifest.sourceHashes)){
 const snapshot='docs/historico-c10/'+hash+'-'+basename(source);
 let bytes;
 try{bytes=await safeRead(snapshot);}catch(error){if(error.code!=='ENOENT')throw error;}
 if(bytes)assert.equal(digest(bytes),hash,'Snapshot existente alterado '+snapshot);
 else {
  const current=await safeRead(source);
  if(digest(current)===hash)bytes=current;
  else{
   assert(options['--anterior-ref'],'Faltan bytes anteriores exactos: '+source+'; use --anterior-ref SHA');
   bytes=execFileSync('git',['-C',options['--historico-repo']||'.','show',options['--anterior-ref']+':'+source],{maxBuffer:64*1024*1024});
  }
  assert.equal(digest(bytes),hash,'Fuente Git anterior no coincide con manifiesto '+source);
  await mkdir(dirname(snapshot),{recursive:true});await safePath(dirname(snapshot));
  await writeFile(snapshot,bytes,{flag:'wx'});
 }
 historicalC10Snapshots[source+'@'+hash]=snapshot;
}
const evidenceFiles={},oldEvidence=new Set(chain.flatMap(e=>[e.path,...Object.keys(e.manifest.evidenceFiles)]));
async function receive(source){
 evidencePath(source);await safePath(source);
 if((await lstat(source)).isDirectory()){
  for(const name of (await readdir(source)).sort())await receive(source+'/'+name);
 }else{
  assert(source!==path&&source!==receipt&&!oldEvidence.has(source),'Sólo recibir evidencia nueva: '+source);
  evidenceFiles[source]=digest(await safeRead(source));
 }
}
for(const source of options.evidence)await receive(source);
const technical={
 kind:'recibo-tecnico-trazabilidad',stage,publication:false,
 scope:'Sellado de bytes y sucesión de fuentes; no acredita auditoría, fotos, fidelidad ni publicación.',
 previousManifestPath:previous.path,previousManifestSha256:previous.hash,
 sourceHashes,
 preserved:'P1–P6 y dictámenes anteriores se conservan; PRACTICO-2 no convierte fidelidad en PASA.'
};
await mkdir(dirname(path),{recursive:true});await safePath(dirname(path));
await writeFile(receipt,JSON.stringify(technical,null,2)+'\n',{flag:'wx'});
evidenceFiles[receipt]=digest(await safeRead(receipt));
const manifest={schemaVersion:1,stage,publication:false,
 scope:'PRACTICO-2; trazabilidad técnica, no dictamen de fidelidad ni recibo de publicación.',
 previousManifestPath:previous.path,previousManifestSha256:previous.hash,
 sourceHashes,historicalC10Snapshots,evidenceFiles,
 limits:['P1–P6 y dictámenes históricos sin cambio.','Evidencia externa recibida por hash; su auditoría semántica corresponde al integrador.']};
// Validate the complete proposed chain (including current sources) BEFORE activation.
await verifyC10Generations({candidate:{path,manifest}});
await writeFile(path,JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
const pointer={schemaVersion:1,manifestPath:path,sha256:digest(await safeRead(path))};
// Guard concurrent writers. Immutable files above use exclusive creation.
const now=await loadC10Chain();assert.equal(now.chain.at(-1).hash,previous.hash,'La generación actual cambió durante el sellado');
await writeFile(ACTUAL+'.tmp',JSON.stringify(pointer,null,2)+'\n',{flag:'wx'});
await rename(ACTUAL+'.tmp',ACTUAL);
await verifyC10Generations();
console.log(JSON.stringify({manifestPath:path,sha256:pointer.sha256,stage,publication:false},null,2));
