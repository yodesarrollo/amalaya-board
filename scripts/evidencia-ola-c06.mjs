import {mkdir,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
const out=resolve(process.argv[2]||'public/levantamiento/evidence/C1-13/20261029-ola1');
await mkdir(out,{recursive:true});
const cameras=[['82-calle',29.07514,-110.955805,0,75,0,2.5],['82-esquina',29.07512,-110.95561,320,70,-10,8],['82-aerea',29.07512,-110.95558,320,65,-48,42]];
await writeFile(join(out,'camaras.json'),JSON.stringify(cameras,null,2)+'\n');
const temp=await mkdtemp(join(tmpdir(),'amalaya-c06-'));
const scene=join(temp,'escena-c06.json');
execFileSync(process.execPath,['scripts/exportar-escena-c08.mjs',scene,'C06'],{stdio:'inherit'});
try { execFileSync(process.env.CODEX_PRIMARY_RUNTIME_PYTHON||'python',['scripts/renderizar-evidencia-paramento.py',scene,out,join(out,'camaras.json')],{stdio:'inherit'}); } finally { await rm(temp,{recursive:true,force:true}); }
