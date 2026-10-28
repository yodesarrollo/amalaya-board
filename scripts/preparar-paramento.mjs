import {readFile,writeFile} from 'node:fs/promises';
import {sheetHash} from './preparar-lamina.mjs';
const root='public/levantamiento';
// The block packet is a separate browser module; invalidate it before hashing
// the parent module so visitors do not keep an older C02 reconstruction.
let details=await readFile(root+'/cuadra-detail-data.js','utf8');
details=details.replace(/cuadra-c02-aproximada\.js(?:\?v=[a-f0-9]{12})?/,'cuadra-c02-aproximada.js?v='+sheetHash(await readFile(root+'/cuadra-c02-aproximada.js')).slice(0,12));
await writeFile(root+'/cuadra-detail-data.js',details);
let runtime=await readFile(root+'/paramento-refinement.js','utf8');
for(const file of ['paramento-data.js','paramento-sidewalks.js','cuadra-detail-data.js'])runtime=runtime.replace(new RegExp(file.replaceAll('.','\\.')+'(?:\\?v=[a-f0-9]{12})?'),file+'?v='+sheetHash(await readFile(root+'/'+file)).slice(0,12));
await writeFile(root+'/paramento-refinement.js',runtime);
let sheet=await readFile(root+'/sheet-plan-refinement.js','utf8');
sheet=sheet.replace(/sheet-plan-data\.js(?:\?v=[a-f0-9]{12})?/,'sheet-plan-data.js?v='+sheetHash(await readFile(root+'/sheet-plan-data.js')).slice(0,12));
sheet=sheet.replace(/paramento-refinement\.js(?:\?v=[a-f0-9]{12})?/,'paramento-refinement.js?v='+sheetHash(runtime).slice(0,12));
await writeFile(root+'/sheet-plan-refinement.js',sheet);
await import('./preparar-ajuste-visual.mjs');

// Invalidate the iframe HTML as well as its nested model modules.
const {prepareNavigation}=await import('./preparar-navegacion.mjs');
await prepareNavigation();
