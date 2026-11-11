// Facade factory (fabrica-fachadas.js): generic checks for every CUADRA_DETAILS
// building that declares `fabrica`. Street-facing edges carry real openings, sections
// stay inside their lot without overlapping, colliders follow each section height,
// every opening is hit from the street, and the record says what was estimated.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Raycaster,Vector3} from 'three';
import {CUADRA_DETAILS} from '../public/levantamiento/cuadra-detail-data.js';
import {fachada} from '../public/levantamiento/fabrica-fachadas.js';
import {frentesDeCalle,lineaDeFachada,loteDeCuadra,signedArea} from './frentes-calle-lib.mjs';
import {crearMundoLigero} from './mundo-ligero.mjs';
const root='public/levantamiento';
const av=JSON.parse(await readFile(root+'/ajuste-visual/cuadras.json','utf8')),cuadras=JSON.parse(await readFile(root+'/cuadras.json','utf8'));
const factory=CUADRA_DETAILS.flatMap(k=>k.buildings.map(b=>({block:k.block,b}))).filter(({b})=>b.fabrica);
assert(factory.length>=5,'La fábrica registra al menos los cinco edificios de C14');
const inside=(x,z,pts)=>{let ok=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,zi]=pts[i],[xj,zj]=pts[j];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)ok=!ok;}return ok;};
const segDist=(p,a,b)=>{const ab=[b[0]-a[0],b[1]-a[1]],t=Math.max(0,Math.min(1,((p[0]-a[0])*ab[0]+(p[1]-a[1])*ab[1])/(ab[0]**2+ab[1]**2||1)));return Math.hypot(p[0]-a[0]-ab[0]*t,p[1]-a[1]-ab[1]*t);};
const ringDist=(p,r)=>Math.min(...r.map((a,i)=>segDist(p,a,r[(i+1)%r.length])));
// Raster overlap (0.1 m grid) works for concave sections, unlike convex clipping.
function overlap(P,Q){const xs=[...P,...Q].map(p=>p[0]),zs=[...P,...Q].map(p=>p[1]);
 const x0=Math.max(Math.min(...P.map(p=>p[0])),Math.min(...Q.map(p=>p[0]))),x1=Math.min(Math.max(...P.map(p=>p[0])),Math.max(...Q.map(p=>p[0])));
 const z0=Math.max(Math.min(...P.map(p=>p[1])),Math.min(...Q.map(p=>p[1]))),z1=Math.min(Math.max(...P.map(p=>p[1])),Math.max(...Q.map(p=>p[1])));
 let n=0;for(let x=x0+.05;x<x1;x+=.1)for(let z=z0+.05;z<z1;z+=.1)if(inside(x,z,P)&&inside(x,z,Q))n++;return n*.01;}
const {world}=await crearMundoLigero(root);world.updateMatrixWorld(true);
const plans=new Map();world.traverse(o=>{if(o.name.startsWith('Planta física · ')&&o.userData.fittedPlan&&!plans.has(o.userData.buildingId))plans.set(o.userData.buildingId,o);});
const report=[];
for(const {block,b} of factory){
 const h=b.hypothesis;
 assert(h&&h.measured===false&&h.generic===false&&h.observed&&h.estimated&&h.unchanged&&h.decision?.by,b.id+': registro de lo observado y lo estimado');
 assert(b.liteLod===true,b.id+': LOD en la vista ligera');assert(typeof b.fabrica.fotoCalle==='boolean'&&b.fabrica.fecha,b.id+': ficha de fábrica');
 const owner=plans.get(b.id);assert(owner?.userData.frontageId,b.id+': edificio construido por el paramento');
 // Open sidewalks (C17, C18): strips as frontage line and the INEGI block as lot.
 const rings=lineaDeFachada(av,block),lot=loteDeCuadra(av,cuadras,block);
 const parts=b.sections?b.sections.map(s=>({part:s.part,points:s.points,height:s.height,facades:s.facades||[]})):[{part:b.id,points:owner.userData.fittedPlan.points,height:b.height,facades:b.facades}];
 const belongs=o=>{for(let p=o;p;p=p.parent)if(p===owner)return true;return false;};
 let vanos=0,rayos=0,frentes=0;
 for(const part of parts){
  const n=part.points.length,ccw=signedArea(part.points)>0;
  // Street frontage of this plan, measured against the block's sidewalk.
  for(const e of frentesDeCalle(part.points,rings).filter(e=>e.calle)){
   const f=part.facades.find(f=>f.edge===e.edge);frentes++;
   assert(f&&(f.ciega||f.tipo||f.bays?.length),`${b.id} ${part.part}: la arista ${e.edge} da a la calle y no tiene fachada`);
  }
  if(b.sections){
   for(const p of part.points){assert(inside(p[0],p[1],lot),`${b.id} ${part.part}: vértice fuera del lote`);assert(ringDist(p,lot)>=.15,`${b.id} ${part.part}: vértice sobre la banqueta`);}
   for(const other of parts)if(other!==part&&other.part<part.part)assert(overlap(part.points,other.points)<=.1,`${b.id}: ${part.part} se encima con ${other.part}`);
   for(const id of cuadras.blocks.find(k=>k.id===block).buildingIds.filter(id=>id!==b.id)){
    const o=CUADRA_DETAILS.flatMap(k=>k.buildings).find(x=>x.id===id),pts=o?.sections?null:plans.get(id)?.userData.fittedPlan?.points;
    for(const q of o?.sections?o.sections.map(s=>s.points):[pts].filter(Boolean))assert(overlap(part.points,q)<=.1,`${b.id} ${part.part} se encima con ${id}`);
   }
  }
  for(const raw of part.facades){
   assert(Number.isInteger(raw.edge)&&raw.edge>=0&&raw.edge<n,`${b.id} ${part.part}: arista inválida ${raw.edge}`);
   const f=raw.tipo&&!raw.bays?fachada(part.points,raw.edge,part.height,raw.tipo,raw):raw;
   const a=part.points[raw.edge],c=part.points[(raw.edge+1)%n],L=Math.hypot(c[0]-a[0],c[1]-a[1]),u=[(c[0]-a[0])/L,(c[1]-a[1])/L],out=ccw?[u[1],-u[0]]:[-u[1],u[0]];
   for(const [i,v] of f.bays.entries()){vanos++;
    assert(v.x-v.w/2>=.25&&v.x+v.w/2<=L-.25&&v.b>=0&&v.b+v.h<=part.height-.3,`${b.id} ${part.part}: vano fuera del paño en arista ${raw.edge}`);
    for(const w of f.bays.slice(i+1))assert(Math.abs(w.x-v.x)>=(w.w+v.w)/2+.15||w.b>=v.b+v.h||v.b>=w.b+w.h,`${b.id} ${part.part}: vanos encimados en arista ${raw.edge}`);
    const ray=new Raycaster(new Vector3(a[0]+u[0]*v.x+out[0]*1.2,.05+v.b+v.h/2,a[1]+u[1]*v.x+out[1]*1.2),new Vector3(-out[0],0,-out[1]),0,2.5),hit=ray.intersectObject(world,true)[0];
    assert(hit&&belongs(hit.object),`${b.id} ${part.part}: vano sin modelo visible desde fuera, arista ${raw.edge} x=${v.x}`);rayos++;
   }
  }
 }
 const own=world.userData.navigationColliders.filter(c=>c.buildingId===b.id);assert(own.length>0,b.id+': sólido para caminar');
 // Patios opened from the aerial (`holes`) stay walkable: no own collider at their centre.
 for(const hole of b.holes||[]){const cx=hole.reduce((t,p)=>t+p[0],0)/hole.length,cz=hole.reduce((t,p)=>t+p[1],0)/hole.length;
  assert(inside(cx,cz,hole)&&!own.some(c=>cx>c.min.x&&cx<c.max.x&&cz>c.min.z&&cz<c.max.z),b.id+': patio abierto en '+cx.toFixed(1)+','+cz.toFixed(1));
  assert(b.holes.every(h=>h.every(p=>inside(p[0],p[1],owner.userData.fittedPlan.points))),b.id+': patio dentro de la planta');}
 const tops=parts.map(p=>p.height+.05);for(const c of own)assert(tops.some(t=>Math.abs(c.max.y-t)<.01),b.id+': colisión a la altura de su sección');
 report.push({id:b.id,secciones:parts.length,frentesCalle:frentes,vanos,rayos,colisiones:own.length});
}
console.log(JSON.stringify({pass:true,edificios:report}));
