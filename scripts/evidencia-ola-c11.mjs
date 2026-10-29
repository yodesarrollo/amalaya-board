// Exporta el mundo real de C11 y reproduce tres vistas de diagnóstico.
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
const out=resolve(process.argv[2]||'/tmp/amalaya-ola-c11');
await mkdir(out,{recursive:true});
const camera=(name,x,z,heading,fov,pitch,eye)=>[name,29.076115-z/110950,-110.9547151+x/97200,heading,fov,pitch,eye];
const cameras=[camera('calle',-100,239,0,90,0,2.5),camera('esquina',-59,239,315,85,-4,4),camera('aerea',-100,206,180,70,-89,100)];
const scene=join(out,'escena.json'),cam=join(out,'camaras.json');
await writeFile(cam,JSON.stringify(cameras,null,2)+'\n');
execFileSync(process.execPath,['scripts/exportar-escena-c08.mjs',scene,'C11'],{stdio:'inherit'});
execFileSync(process.env.CODEX_PRIMARY_RUNTIME_PYTHON||'python',['scripts/renderizar-evidencia-paramento.py',scene,out,cam],{stdio:'inherit'});
