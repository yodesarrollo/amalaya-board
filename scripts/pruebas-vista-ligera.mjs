import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {columns,cellInfo} from '../src/seguimiento3d-model.js';
const full=JSON.parse(await readFile('public/seguimiento-3d.json')),small=JSON.parse(await readFile('public/seguimiento-ligero.json'));
assert.equal(small.buildings.length,columns(full).length);
for(const c of columns(full)){const b=small.buildings.find(b=>b.id===c.building.id);assert(b);for(const task of Object.keys(full.taskDefinitions))assert.equal(b.states[task],cellInfo(c,task).state,c.building.id+':'+task);if(b.camera?.target)assert(b.camera.target.length===3&&b.camera.target.every(Number.isFinite));}
const meta=JSON.parse(await readFile('public/levantamiento/modelo-ligero.json')),bytes=await readFile('public/levantamiento/modelo-ligero.bin');
assert.equal(bytes.length,meta.triangles*20);assert(meta.triangles>0&&meta.triangles<meta.originalTriangles,'la vista debe simplificar la escena sin eliminar caras estructurales');
assert.equal(createHash('sha256').update(bytes).digest('hex').slice(0,12),meta.version);
for(let i=0;i<meta.triangles;i++){
 assert(bytes.readUInt16LE(i*20+18)<meta.palette.length);
 const v=Array.from({length:9},(_,j)=>bytes.readInt16LE(i*20+j*2)),a=[0,1,2].map(j=>v[3+j]-v[j]),b=[0,1,2].map(j=>v[6+j]-v[j]);
 assert(a[1]*b[2]!==a[2]*b[1]||a[2]*b[0]!==a[0]*b[2]||a[0]*b[1]!==a[1]*b[0],'No zero-area faces after quantization');
}
assert.equal(meta.worldSha256,createHash('sha256').update(await readFile('public/levantamiento/world.js')).digest('hex'));
assert((await readFile('public/seguimiento-ligero.json')).length<100000,'resumen bajo 100 KB');
// Revision quality79–81 retains curved glazing, deep reveals and steel/diamond mesh.
// C1-13 candidate: 949,160 bytes / 305,749 gzip, 47,458 triangles.
// Baseline ef89166: 886,700 bytes / 282,310 gzip. Preserve structural details;
// the 960 KB / 310 KB ceilings leave a small measured margin, not a visual approval.
// 89/D1-12 (10-nov-2026): modelado con vanos reales en 4 frentes (72 vanos, dos patios):
// 1,006,880 bytes / 324,941 gzip (antes 959,920 / 309,043), 50,344 triángulos.
// LOD de vista ligera (D3, 10-nov-2026; scripts/lod-ligero.mjs, pruebas-lod-ligero.mjs): el 89
// pasa de 2,348 a 456 triángulos; total 969,040 bytes / 312,329 gzip, 48,452 triángulos.
// Techo de 1 MB / 325 KB: deja lugar a las cuadras siguientes si cada edificio nuevo usa liteLod.
// C09 (cuadra 28) y LOD en los paquetes anteriores salvo 76–83 y 87 (firmas auditadas):
// 880,420 bytes / 289,571 gzip, 44,021 triángulos.
// Presupuesto por edificio de fábrica (oleadas de cuadras 4–21, 10-nov-2026): cada edificio
// con `fabrica` suma 3.5 KB / 1.25 KB comprimidos al techo, que nunca baja del 1 MB / 325 KB
// anterior ni pasa de 1.35 MB / 450 KB. Medido: 15 edificios de C15, C19 y C16 costaron
// 2.9 KB / 0.96 KB cada uno; con los 139 edificios el techo previsto es ~1.28 MB / 433 KB.
// Main 73f9658: 924,060 bytes / 305,831 gzip con 28 edificios de fábrica; main 202d4d6 (con C18):
// 949,520 bytes / 317,524 gzip con 49 (C18 costó 25,460 / 11,693 por 21 edificios).
// Si una cuadra se pasa, se simplifica la cuadra (vanos en caras cortas, secciones); no se sube el techo.
const {CUADRA_DETAILS}=await import('../public/levantamiento/cuadra-detail-data.js');
const fabrica=CUADRA_DETAILS.flatMap(k=>k.buildings).filter(b=>b.fabrica).length;
const techo=Math.min(1350000,Math.max(1000000,846000+3500*fabrica)),techoGzip=Math.min(450000,Math.max(325000,277000+1250*fabrica)),gz=gzipSync(bytes).length;
assert(bytes.length<techo,`geometría completa ${bytes.length} bajo ${techo} (${fabrica} edificios de fábrica)`);
assert(gz<techoGzip,`geometría comprimida ${gz} bajo ${techoGzip} (${fabrica} edificios de fábrica)`);
console.log(`Vista ligera: ${bytes.length}/${techo} bytes, ${gz}/${techoGzip} gzip, ${fabrica} edificios de fábrica.`);
console.log('Vista ligera: todos los IDs y estados conservados; geometría válida y presupuestos de carga cumplidos.');
