// One bounded packet per block. Shared references and one build/export/render per
// packet; unchanged outputs are reused. No section is approved by this command.
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const [id,outArg]=process.argv.slice(2);
if(!/^C\d{2}$/.test(id||'')||!outArg)throw Error('Uso: node scripts/trabajar-cuadra.mjs C08 carpeta-de-trabajo');
const out=path.resolve(outArg),registry=JSON.parse(await readFile('public/levantamiento/cuadras.json','utf8'));
const block=registry.blocks.find(b=>b.id===id);if(!block)throw Error('Cuadra inexistente');
await mkdir(out,{recursive:true});
const files=['world.js','paramento-refinement.js','paramento-data.js','cuadra-detail-data.js','ajuste-visual-data.js'].map(p=>'public/levantamiento/'+p);
const cameras=path.join(out,'camaras.json');await stat(cameras);
const hash=createHash('sha256');for(const p of [...files,cameras])hash.update(await readFile(p));
hash.update(await readFile('scripts/exportar-escena-c08.mjs'));hash.update(await readFile('scripts/renderizar-evidencia-paramento.py'));
const signature=hash.digest('hex'),checkpoint=path.join(out,'paquete.json');
let prior;try{prior=JSON.parse(await readFile(checkpoint,'utf8'))}catch{}
const run=(exe,args)=>{const r=spawnSync(exe,args,{stdio:'inherit'});if(r.status!==0)throw Error('Falló '+exe+' '+args[0]);};
const start=Date.now();
const outputs=[path.join(out,'escena.json'),...JSON.parse(await readFile(cameras,'utf8')).map(c=>path.join(out,'renders',c[0]+'-3d.jpg'))];
const intact=(await Promise.all(outputs.map(p=>stat(p).then(s=>s.size>0).catch(()=>false)))).every(Boolean);
const reuse=prior?.signature===signature&&intact;
if(!reuse){
 run(process.execPath,['scripts/exportar-escena-c08.mjs',path.join(out,'escena.json'),id]);
 run('python3',['scripts/renderizar-evidencia-paramento.py',path.join(out,'escena.json'),path.join(out,'renders'),cameras]);
}
const scene=JSON.parse(await readFile(path.join(out,'escena.json'),'utf8'));
const packet={block:id,number:block.displayNumber,members:block.buildingIds,signature,reused:reuse,seconds:+((Date.now()-start)/1000).toFixed(2),worldSha256:scene.worldSha256,triangleCount:scene.triangles.length,buildings:scene.buildings,details:scene.blockDetails?.find(b=>b.block===id),sections:['Planta y calle','Banquetas y esquinas','Edificios y volúmenes','Fachadas y acabados','Equipamiento y cierre'].map((name,i)=>({section:i+1,name,state:block.sectionReviews?.[i+1]?.state||'pending'})),note:'Preparar imágenes no cierra las secciones; requieren contraste visual, registro y validación.'};
await writeFile(checkpoint,JSON.stringify(packet,null,2)+'\n');console.log(JSON.stringify({block:id,reused:packet.reused,seconds:packet.seconds,triangles:packet.triangleCount}));
