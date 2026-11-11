import {readFile,writeFile} from 'node:fs/promises';
import {sheetHash} from './preparar-lamina.mjs';
const root='public/levantamiento';
// The block packet is a separate browser module; invalidate it before hashing
// the parent module so visitors do not keep an older C02 reconstruction.
let details=await readFile(root+'/cuadra-detail-data.js','utf8');
details=details.replace(/cuadra-c02-aproximada\.js(?:\?v=[a-f0-9]{12})?/,'cuadra-c02-aproximada.js?v='+sheetHash(await readFile(root+'/cuadra-c02-aproximada.js')).slice(0,12));
// Every per-building packet (c10-84-data.js, c11-89-data.js, …) is invalidated by
// its own content hash, so a new building never needs another list edit here.
// Shared facade factory: version it inside each packet first, so a factory change
// also changes the packet hash and therefore the import chain above it.
const factoryVersion='fabrica-fachadas.js?v='+sheetHash(await readFile(root+'/fabrica-fachadas.js')).slice(0,12);
for(const file of new Set([...details.matchAll(/'\.\/(c\d{2}-\d{2,3}-data\.js)/g)].map(m=>m[1]))){
 const packet=await readFile(root+'/'+file,'utf8'),versioned=packet.replace(/'\.\/fabrica-fachadas\.js(?:\?v=[a-f0-9]{12})?'/g,"'./"+factoryVersion+"'");
 if(versioned!==packet)await writeFile(root+'/'+file,versioned);
}
for(const file of new Set([...details.matchAll(/'\.\/(c\d{2}-\d{2,3}-data\.js)/g)].map(m=>m[1]))){
 const pattern=new RegExp(file.replaceAll('.','\\.')+'(?:\\?v=[a-f0-9]{12})?');
 details=details.replace(pattern,file+'?v='+sheetHash(await readFile(root+'/'+file)).slice(0,12));
}
await writeFile(root+'/cuadra-detail-data.js',details);
let runtime=await readFile(root+'/paramento-refinement.js','utf8');
for(const file of ['paramento-data.js','paramento-sidewalks.js','cuadra-detail-data.js','fabrica-fachadas.js'])runtime=runtime.replace(new RegExp(file.replaceAll('.','\\.')+'(?:\\?v=[a-f0-9]{12})?'),file+'?v='+sheetHash(await readFile(root+'/'+file)).slice(0,12));
await writeFile(root+'/paramento-refinement.js',runtime);
let sheet=await readFile(root+'/sheet-plan-refinement.js','utf8');
sheet=sheet.replace(/sheet-plan-data\.js(?:\?v=[a-f0-9]{12})?/,'sheet-plan-data.js?v='+sheetHash(await readFile(root+'/sheet-plan-data.js')).slice(0,12));
sheet=sheet.replace(/paramento-refinement\.js(?:\?v=[a-f0-9]{12})?/,'paramento-refinement.js?v='+sheetHash(runtime).slice(0,12));
await writeFile(root+'/sheet-plan-refinement.js',sheet);
await import('./preparar-ajuste-visual.mjs');

// Invalidate the iframe HTML as well as its nested model modules.
const {prepareNavigation}=await import('./preparar-navegacion.mjs');
await prepareNavigation();
