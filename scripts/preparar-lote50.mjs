import {readFile,writeFile} from 'node:fs/promises';
import {refineSheet,sheetHash} from './preparar-lamina.mjs';
const root='public/levantamiento';
const dataHash=sheetHash(await readFile(root+'/street-batch50-data.js'));
let module=await readFile(root+'/street-batch50-refinement.js','utf8');
module=module.replace(/street-batch50-data\.js(?:\?v=[a-f0-9]{12})?/, 'street-batch50-data.js?v='+dataHash.slice(0,12));
await writeFile(root+'/street-batch50-refinement.js',module);
let sheet=await readFile(root+'/sheet-plan-refinement.js','utf8');
sheet=sheet.replace(/street-batch50-refinement\.js\?v=[a-f0-9]{12}/,'street-batch50-refinement.js?v='+sheetHash(module).slice(0,12));
await writeFile(root+'/sheet-plan-refinement.js',sheet);
const hashes={};
for(const [kind,p] of [['world','world.js'],['visor','visor/assets/index-RoPA5goG.js']]){
 const v=refineSheet(await readFile(root+'/'+p,'utf8'),kind,sheetHash(sheet));await writeFile(root+'/'+p,v);hashes[kind]=sheetHash(v);
}
const prov=JSON.parse(await readFile(root+'/sheet-plan-provenance.json'));
prov.hashes=hashes;prov.moduleSha256=sheetHash(sheet);prov.streetBatch50={module:'street-batch50-refinement.js',moduleSha256:sheetHash(module),dataSha256:dataHash,task:'street',buildingCount:50};
await writeFile(root+'/sheet-plan-provenance.json',JSON.stringify(prov,null,2)+'\n');
await writeFile('src/levantamiento-version.js',`// Cache version of the actual 3D world.\nexport const VERSION_LEVANTAMIENTO = '${hashes.world.slice(0,12)}';\n`);
const p=root+'/visor/index.html';await writeFile(p,(await readFile(p,'utf8')).replace(/index-RoPA5goG.js\?v=[a-f0-9]{12}/g,'index-RoPA5goG.js?v='+hashes.visor.slice(0,12)));
console.log(hashes);
