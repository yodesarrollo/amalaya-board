// C10 lineage: immutable historical bytes, current sources, evidence checked separately.
import assert from 'node:assert/strict';
import {readFile,lstat,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
export const C10_ROOT='public/levantamiento/evidence/C10';
export const EQUIPO=C10_ROOT+'/20261030-equipo/manifest.json';
export const CONTINUACION=C10_ROOT+'/20261030-continuacion/manifest.json';
export const ACTUAL=C10_ROOT+'/actual.json';
const ANCHORS={
 [EQUIPO]:'8b84d971ba28bc32f4ead25cfa756f6a0e9ab91378e145a8936e21b6884c59b5',
 [CONTINUACION]:'aa1b91295183b9cba85107ba25021b6ef0c46222cbb1f703d03877deb8d43a23'
};
const BASE_SOURCES=['c10-84-data.js','cuadra-detail-data.js','paramento-refinement.js','sheet-plan-refinement.js','world.js','visor/assets/index-RoPA5goG.js','visor/index.html','modelo-ligero.bin','modelo-ligero.json'].map(p=>'public/levantamiento/'+p);
export const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
export const sourcePaths=stage=>[...BASE_SOURCES,...(stage>=85?['public/levantamiento/c10-85-data.js']:[]),...(stage>=86?['public/levantamiento/c10-86-data.js']:[])];
function relative(path){
 assert(typeof path==='string'&&path.split('/').every(s=>/^[A-Za-z0-9_][A-Za-z0-9_.-]*$/.test(s)&&!s.includes('..')&&s.toLowerCase()!=='privado'),'C10: ruta fuera de alcance '+path);
}
export async function safePath(path){
 relative(path);
 let prefix='';
 for(const part of path.split('/')){prefix+=(prefix?'/':'')+part;assert(!(await lstat(prefix)).isSymbolicLink(),'C10: enlace no permitido '+prefix);}
 return path;
}
export async function safeRead(path){return readFile(await safePath(path));}
export function manifestPath(path){
 assert(typeof path==='string'&&/^public\/levantamiento\/evidence\/C10\/20261030-practico(?:85|86)(?:-[a-z0-9]+)*\/manifest\.json$/.test(path),'C10: ruta de manifiesto fuera de alcance '+path);
 return path;
}
export function evidencePath(path){
 assert(typeof path==='string'&&(/^public\/levantamiento\/evidence\/(?:D1-09|D1-10|D1-11|D2-01|D2-02|C10)\/20261030-[A-Za-z0-9-]+\/[A-Za-z0-9_./-]+$/.test(path)||/^public\/levantamiento\/revision-practica(?:\/[A-Za-z0-9_./-]+)?$/.test(path)),'C10: ruta de evidencia fuera de alcance '+path);
 relative(path);return path;
}
function hashMap(map,label){
 assert(map&&typeof map==='object'&&!Array.isArray(map)&&Object.keys(map).length>0,label);
 for(const hash of Object.values(map))assert.match(hash,/^[a-f0-9]{64}$/,label);
}
async function record(path){const bytes=await safeRead(path);return {path,hash:digest(bytes),manifest:JSON.parse(bytes)};}
export async function loadC10Chain(){
 const chain=[await record(EQUIPO),await record(CONTINUACION)];
 let pointer;
 try{pointer=JSON.parse(await safeRead(ACTUAL));}catch(error){if(error.code!=='ENOENT')throw error;}
 if(pointer){
  assert.equal(pointer.schemaVersion,1,'C10: versión de puntero');
  manifestPath(pointer.manifestPath);assert.match(pointer.sha256,/^[a-f0-9]{64}$/);
  const tail=[],seen=new Set();let path=pointer.manifestPath;
  while(path!==CONTINUACION){
   manifestPath(path);assert(!seen.has(path)&&seen.size<64,'C10: ciclo o cadena excesiva');seen.add(path);
   const entry=await record(path);tail.push(entry);path=entry.manifest.previousManifestPath;
  }
  chain.push(...tail.reverse());
 }
 return {chain,pointer};
}
export async function verifyC10Generations({candidate}={}){
 const {chain,pointer}=await loadC10Chain();
 const pointed=chain.at(-1);
 if(candidate){
  manifestPath(candidate.path);
  assert.equal(candidate.manifest.previousManifestPath,pointed.path,'C10: sucesión sin saltar generaciones');
  assert(!chain.some(e=>e.path===candidate.path),'C10: generación ya existente');
  chain.push(candidate);
 }
 for(let i=0;i<chain.length;i++){
  const {manifest:m,path}=chain[i];
  hashMap(m.sourceHashes,'C10: mapa de fuentes inválido');
  if(i>=2){
   assert.equal(m.schemaVersion,1);assert([85,86].includes(m.stage),'C10: etapa inválida');
   assert(path.startsWith(C10_ROOT+'/20261030-practico'+m.stage),'C10: etapa/ruta inconsistente');
   assert.equal(m.publication,false,'C10: recibo técnico, no acredita publicación');
   const prior=chain[i-1].manifest.stage;
   assert(prior?m.stage>=prior:m.stage===85,'C10: orden obligatorio 85 antes de86');
  }
  assert.deepEqual(Object.keys(m.sourceHashes).sort(),sourcePaths(i>=2?m.stage:84).sort(),'C10: conservar cobertura de fuentes actuales');
 }
 const latest=chain.at(-1).manifest;
 for(const [path,hash] of Object.entries(latest.sourceHashes))assert.equal(digest(await safeRead(path)),hash,'C10: artefacto actual '+path);
 if(latest.stage===85){
  assert(!(await readdir('public/levantamiento')).includes('c10-86-data.js'),'C10: etapa85 exige módulo86 AUSENTE');
  assert(!(await safeRead('public/levantamiento/cuadra-detail-data.js')).includes('c10-86-data.js'),'C10: etapa85 exige import86 AUSENTE');
 }
 // No spread/merge: every occurrence of every evidence key is verified.
 for(const {manifest:m} of chain){
  hashMap(m.evidenceFiles,'C10: mapa de evidencia inválido');
  for(const [path,hash] of Object.entries(m.evidenceFiles)){
   evidencePath(path);assert.equal(digest(await safeRead(path)),hash,'C10: evidencia exacta '+path);
  }
 }
 for(let i=1;i<chain.length;i++){
  const prior=chain[i-1],m=chain[i].manifest;
  assert.equal(m.previousManifestSha256,prior.hash,'C10: manifiesto anterior inmutable '+prior.path);
  if(i>=2)assert.equal(m.previousManifestPath,prior.path,'C10: enlace al manifiesto anterior');
  const snapshots=m.historicalC10Snapshots;
  assert.deepEqual(Object.keys(snapshots||{}).sort(),Object.entries(prior.manifest.sourceHashes).map(([p,h])=>p+'@'+h).sort(),'C10: cobertura de snapshots anteriores');
  for(const [path,hash] of Object.entries(prior.manifest.sourceHashes)){
   const snapshot=snapshots[path+'@'+hash];
   assert.match(snapshot,new RegExp('^docs/historico-c10/'+hash+'-[A-Za-z0-9_.-]+$'),'C10: ruta de snapshot fuera de alcance');
   assert.equal(digest(await safeRead(snapshot)),hash,'C10: fuente anterior exacta '+path);
  }
 }
 for(const {path,hash} of chain.slice(0,2))assert.equal(hash,ANCHORS[path],'C10: manifiesto histórico inmutable '+path);
 if(pointer)assert.equal(pointer.sha256,pointed.hash,'C10: hash del puntero actual');
 // Retain 82 snapshots as an independent historical generation, not current sources.
 for(const [key,path] of Object.entries(chain[0].manifest.historical82Snapshots)){
  const hash=key.slice(key.lastIndexOf('@')+1);
  assert.match(path,new RegExp('^docs/historico82/'+hash+'-[A-Za-z0-9_.-]+$'));
  assert.equal(digest(await safeRead(path)),hash,'82: snapshot histórico exacto '+path);
 }
 return {chain,publicPaths:[...chain.flatMap(e=>[e.path,...Object.keys(e.manifest.evidenceFiles)]),...(pointer?[ACTUAL]:[])]};
}
