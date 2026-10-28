// Reproduce the reviewed cameras without overwriting historical evidence.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
const out=resolve(process.argv[2]||'/tmp/amalaya-calidad-7981');await mkdir(out,{recursive:true});
for(const [block,ids] of [['C12',['D1-03','D1-04']],['C06',['C1-12']]]){
 const cameras=[];for(const id of ids){const m=JSON.parse(await readFile(`public/levantamiento/evidence/${id}/20261028-calidad-r2.json`));cameras.push(...m.cameras);}
 const scene=join(out,block+'.json'),cam=join(out,block+'-camaras.json');await writeFile(cam,JSON.stringify(cameras));
 execFileSync(process.execPath,['scripts/exportar-escena-c08.mjs',scene,block],{stdio:'inherit'});
 execFileSync(process.env.CODEX_PRIMARY_RUNTIME_PYTHON||'python',['scripts/renderizar-evidencia-paramento.py',scene,out,cam],{stdio:'inherit'});
}
