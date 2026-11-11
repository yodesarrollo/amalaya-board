// Per-building collider signatures. A building modelled later (facade factory or a
// reviewed packet) is skipped by name; every other building must keep the exact
// boxes it had at the baseline, without re-freezing one global hash per change.
// Usage: node scripts/firmas-colisiones.mjs [--guardar]  (writes the baseline file)
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {crearMundoLigero} from './mundo-ligero.mjs';
export const BASE_FIRMAS='scripts/firmas-colisiones-base.json';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
export const grupo=c=>c.buildingId??(c.blockDetail?'detalle:'+c.blockDetail:'·');
export function colisiones(world){return world.userData.navigationColliders.map(c=>({min:c.min.toArray(),max:c.max.toArray(),buildingId:c.buildingId,blockDetail:c.blockDetail}));}
export function firmas(list){
 const groups=new Map();for(const c of list){const k=grupo(c);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(c);}
 return Object.fromEntries([...groups].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,v])=>[k,{count:v.length,sha256:hash(v)}]));
}
// Legacy global freeze (99a0490 → 7b68582): all boxes except 82/84/89, in scene order.
export function congelado(list,excluded=['C1-13','D1-09','D1-12']){const kept=list.filter(c=>!excluded.includes(c.buildingId));return {count:kept.length,sha256:hash(kept)};}
if(import.meta.url===`file://${process.argv[1]}`){
 const {world}=await crearMundoLigero('public/levantamiento');const list=colisiones(world);
 const out={generated:new Date().toISOString(),worldSha256:createHash('sha256').update(await readFile('public/levantamiento/world.js')).digest('hex'),legacy:congelado(list),groups:firmas(list)};
 if(process.argv.includes('--guardar'))await writeFile(BASE_FIRMAS,JSON.stringify(out,null,1)+'\n');
 console.log(JSON.stringify({legacy:out.legacy,groups:Object.keys(out.groups).length}));
}
