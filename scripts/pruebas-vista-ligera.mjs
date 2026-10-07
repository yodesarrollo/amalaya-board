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
for(let i=0;i<meta.triangles;i++)assert(bytes.readUInt16LE(i*20+18)<meta.palette.length);
assert.equal(meta.worldSha256,createHash('sha256').update(await readFile('public/levantamiento/world.js')).digest('hex'));
assert((await readFile('public/seguimiento-ligero.json')).length<100000,'resumen bajo 100 KB');
// Retaining small wall/roof faces needs a larger raw budget; compression stays bounded.
assert(bytes.length<600000,'geometría completa bajo 600 KB');
assert(gzipSync(bytes).length<200000,'geometría comprimida bajo 200 KB');
console.log('Vista ligera: todos los IDs y estados conservados; geometría válida y presupuestos de carga cumplidos.');
