// Verify real referenced capture bytes; embedded PNGs alone hide broken source links.
import assert from 'node:assert/strict';
import {readFile,realpath} from 'node:fs/promises';
import {resolve,dirname,sep} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve('public/levantamiento/evidence/C10');
const pointer=JSON.parse(await readFile(root+'/actual.json','utf8'));
// The 87 r3 review packet is immutable history; later generations (88+) do not carry it.
const R3='public/levantamiento/evidence/C10/20261030-practico87-20261105-r3/revision/lista-dudas.json';
const file=resolve(process.argv[2]||(pointer.manifestPath.includes('practico87')?dirname(pointer.manifestPath)+'/revision/lista-dudas.json':R3));
const packet=JSON.parse(await readFile(file,'utf8'));
assert.equal(packet.schema,'amalaya-hipotesis-review-v2');assert.equal(packet.cases.length,1);
let checked=0;
for(const c of packet.cases){
 assert.equal(c.id,'AMALAYA-DUDA-0087-MINA');assert.equal(c.status,'pendiente');assert.equal(c.owner_decision,null);
 for(const key of ['source_capture','source_oblique']){
  const ref=c[key],target=await realpath(resolve(dirname(file),ref.path));
  assert(target.startsWith(root+sep),'Capture must remain inside C10 evidence');
  assert.equal(createHash('sha256').update(await readFile(target)).digest('hex'),ref.sha256,'Exact original capture '+key);checked++;
 }
}
assert.equal(checked,2);console.log(JSON.stringify({pass:true,referencedCaptures:checked,publication:false,scope:'Reference integrity, not new captures or visual acceptance.'}));
