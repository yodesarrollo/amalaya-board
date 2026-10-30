import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root='public/levantamiento',details=await readFile(root+'/cuadra-detail-data.js','utf8');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex').slice(0,12);
const checked=[];
for(const number of [84,85,86]){
 const file=`c10-${number}-data.js`;try{await access(root+'/'+file);}catch{continue;}
 const matches=[...details.matchAll(new RegExp(`from ['"]\\./${file.replaceAll('.','\\.')}(?:\\?v=([a-f0-9]{12}))?['"]`,'g'))];
 assert.equal(matches.length,1,`Un solo import del paquete${number}`);
 assert.equal(matches[0][1],digest(await readFile(root+'/'+file)),`Cache del paquete${number} debe versionarse por contenido`);checked.push(number);
}
const runtime=await readFile(root+'/paramento-refinement.js','utf8');assert(runtime.includes('cuadra-detail-data.js?v='+digest(details)),'El padre debe versionar el registro');
const registry=runtime.match(/from '\.\/(cuadra-detail-data\.js[^']*)'/)[1];const {CUADRA_DETAILS}=await import('../public/levantamiento/'+registry);
for(const number of checked){const id={'84':'D1-09','85':'D1-10','86':'D1-11'}[number];assert.equal(CUADRA_DETAILS.flatMap(p=>p.buildings).filter(b=>b.id===id).length,1,'Registro sin duplicados '+id);}
console.log(JSON.stringify({pass:true,cachePackages:checked,oneOwnerEach:true}));
