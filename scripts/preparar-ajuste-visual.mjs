import {readFile,writeFile} from 'node:fs/promises';
import {sheetHash} from './preparar-lamina.mjs';
const root='public/levantamiento';
let runtime=await readFile(root+'/ajuste-visual-refinement.js','utf8');
runtime=runtime.replace(/ajuste-visual-data\.js(?:\?v=[a-f0-9]{12})?/,'ajuste-visual-data.js?v='+sheetHash(await readFile(root+'/ajuste-visual-data.js')).slice(0,12));
await writeFile(root+'/ajuste-visual-refinement.js',runtime);
let sheet=await readFile(root+'/sheet-plan-refinement.js','utf8');
sheet=sheet.replace(/ajuste-visual-refinement\.js(?:\?v=[a-f0-9]{12})?/,'ajuste-visual-refinement.js?v='+sheetHash(runtime).slice(0,12));
await writeFile(root+'/sheet-plan-refinement.js',sheet);
await import('./preparar-suelo.mjs');
const hash=sheetHash(await readFile(root+'/world.js'));
for(const [path,key] of [['cuadras/asignaciones.json','currentWorldSha256'],['ground-audit.json','worldSha256']]){
 const data=JSON.parse(await readFile(root+'/'+path));data[key]=hash;await writeFile(root+'/'+path,JSON.stringify(data,null,path==='ground-audit.json'?2:0)+'\n');
}
