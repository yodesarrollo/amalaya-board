// Reproduce two views of the fitted D1-10 courtyard. Optional neutral packet is
// a test of the real plan, not a proposed exterior or a completed building.
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const runtime=await readFile('public/levantamiento/paramento-refinement.js','utf8');
const {CUADRA_DETAILS}=await import('../public/levantamiento/'+runtime.match(/from '\.\/(cuadra-detail-data\.js[^']*)'/)[1]);
const out=resolve(process.argv[2]||'/tmp/c10-patio85');
const testPacket=process.argv.includes('--prueba-patio');
await mkdir(out);
if(testPacket)CUADRA_DETAILS.push({block:'C10',evidence:'real-courtyard-regression',buildings:[{id:'D1-10',height:6.2,color:'#c6c3b8',uncertainty:3,sources:[],facades:[],note:'Paquete neutro de prueba; no es propuesta de fachada.'}]});
const scene=join(out,'escena.json');process.argv[2]=scene;process.argv[3]='C10';
await import('./exportar-escena-c08.mjs');
if(testPacket){const data=JSON.parse(await readFile(scene,'utf8'));assert(data.blockDetails.some(d=>d.buildings.some(b=>b.id==='D1-10'&&b.note?.startsWith('Paquete neutro de prueba'))),'El paquete de prueba debe estar activo en la escena');}
const cameras=[['85-aerea',29.07458,-110.95590,180,70,-80,65],['85-patio',29.074601,-110.955939,0,100,45,1.7]];
const cam=join(out,'camaras.json');await writeFile(cam,JSON.stringify(cameras,null,2));
execFileSync(process.env.CODEX_PRIMARY_RUNTIME_PYTHON||'python',['scripts/renderizar-evidencia-paramento.py',scene,out,cam],{stdio:'inherit'});
