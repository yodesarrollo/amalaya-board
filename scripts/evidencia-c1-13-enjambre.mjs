import {mkdir,readFile,writeFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';

// Cada etapa se escribe una sola vez: evita reemplazar una captura histórica.
const stage=process.argv[2];
if(!['antes','despues'].includes(stage)) throw new Error('Uso: node scripts/evidencia-c1-13-enjambre.mjs antes|despues [directorio padre]');
const root=resolve(process.argv[3]||'public/levantamiento/evidence/C1-13/20261029-enjambre');
const out=join(root,stage);
await mkdir(root,{recursive:true});
await mkdir(out); // falla si ya existe
const historical=JSON.parse(await readFile('public/levantamiento/evidence/C1-13/20261029-ola1/camaras.json','utf8'));
// Vista complementaria oriental: no sustituye ni mueve las tres cámaras históricas.
const cameras=JSON.stringify([...historical,['82-este-detalle',29.07525,-110.95566,300,65,0,3]],null,2)+'\n';
await writeFile(join(out,'camaras.json'),cameras);
const temp=await mkdtemp(join(tmpdir(),'amalaya-c1-13-'));
const scene=join(temp,'escena.json');
try {
  execFileSync(process.execPath,['scripts/exportar-escena-c08.mjs',scene,'C06'],{stdio:'inherit'});
  execFileSync(process.env.CODEX_PRIMARY_RUNTIME_PYTHON||'python',['scripts/renderizar-evidencia-paramento.py',scene,out,join(out,'camaras.json')],{stdio:'inherit'});
  const sha=data=>createHash('sha256').update(data).digest('hex');
  const files={};
  for(const name of ['camaras.json','82-calle-3d.jpg','82-esquina-3d.jpg','82-aerea-3d.jpg','82-este-detalle-3d.jpg']) files[name]=sha(await readFile(join(out,name)));
  const sceneData=JSON.parse(await readFile(scene,'utf8'));
  const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  const status=execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim();
  await writeFile(join(out,'recibo.json'),JSON.stringify({stage,commit,status,worldSha256:sceneData.worldSha256,block:sceneData.block,triangles:sceneData.triangles.length,files,limite:'Render de triángulos con iluminación simplificada; no prueba WebGL ni cámara calibrada.'},null,2)+'\n');
} finally {await rm(temp,{recursive:true,force:true});}
