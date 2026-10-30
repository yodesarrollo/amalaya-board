// Plan polygons and exported collision AABBs: model diagnostics, not field measurements.
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {SHEET_PLANS} from '../public/levantamiento/sheet-plan-data.js';
const scene=JSON.parse(await readFile(process.argv[2]));
const reg=JSON.parse(await readFile('public/levantamiento/cuadras.json'));
const boundary=reg.blocks.find(x=>x.id==='C10').boundaryLocal.coordinates[0][0].slice(0,-1);
const plan=id=>SHEET_PLANS.find(x=>x.id===id).points;
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const area=p=>Math.abs(p.reduce((s,a,i)=>{let b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0]},0))/2;
function clip(poly,mask){let sign=Math.sign(mask.reduce((s,a,i)=>{let b=mask[(i+1)%mask.length];return s+a[0]*b[1]-a[1]*b[0]},0));for(let j=0;j<mask.length;j++){let a=mask[j],b=mask[(j+1)%mask.length],out=[];for(let i=0;i<poly.length;i++){let p=poly[i],q=poly[(i+1)%poly.length],cp=cross(a,b,p)*sign,cq=cross(a,b,q)*sign;if(cp>=-1e-9)out.push(p);if((cp<0&&cq>0)||(cp>0&&cq<0)){let t=cp/(cp-cq);out.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])])}}poly=out;if(!poly.length)break}return poly}
const dist=(q,a,b)=>{let x=b[0]-a[0],y=b[1]-a[1],t=Math.max(0,Math.min(1,((q[0]-a[0])*x+(q[1]-a[1])*y)/(x*x+y*y)));return Math.hypot(q[0]-a[0]-t*x,q[1]-a[1]-t*y)};
function separation(a,b){let d=Infinity;for(let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)d=Math.min(d,dist(a[i],b[j],b[(j+1)%b.length]),dist(b[j],a[i],a[(i+1)%a.length]));return d}
const pairs=[['D2-01','D1-11'],['D2-02','D1-11'],['D2-01','D2-02']].map(([a,b])=>({a,b,intersectionArea:area(clip(plan(a),plan(b))),edgeDistance:separation(plan(a),plan(b))}));
const outside=['D2-01','D2-02','D1-11'].map(id=>({id,area:area(plan(id)),outsideBoundary:area(plan(id))-area(clip(plan(id),boundary))}));
const samples=[[-100,150],[-90,150],[-80,150],[-70,150]];const solar=samples.map(([x,z])=>({x,z,collisionIds:[...new Set(scene.colliders.filter(c=>c.min[0]<=x&&c.max[0]>=x&&c.min[2]<=z&&c.max[2]>=z&&c.min[1]<=1.2&&c.max[1]>=1.2).map(c=>c.buildingId||c.blockDetail||'sin id'))]}));
console.log(JSON.stringify({worldSha256:scene.worldSha256,sceneSha256:createHash('sha256').update(await readFile(process.argv[2])).digest('hex'),pairs,outside,solar,note:'Intersecciones sobre SHEET_PLANS originales; no acreditan geometría refinada. Distancia es entre bordes, incluso si existe intersección. Muestras aisladas de AABB a y=1.2 m; no prueban recorrido ni todo el solar. Borde INEGI sólo inventario.'},null,2));
