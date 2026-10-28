import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {FRONT_BUILDINGS} from '../public/levantamiento/paramento-data.js';
import {labelAtPoint,createLabelTap} from '../public/levantamiento/label-interaction.js';

// Selecting a visible label must not turn a pan, cancellation or pinch into a tap.
const label={id:'B1-03'}, hits=[{x:40,y:60,radius:15,value:label}], tap=createLabelTap();
assert.equal(labelAtPoint(hits,40,60),label);
assert.equal(labelAtPoint(hits,56,60),null);
tap.down(1,40,60);assert.equal(tap.up(1,42,61),true);
tap.down(1,40,60);tap.move(1,55,60);assert.equal(tap.up(1,55,60),false);
tap.down(1,40,60);tap.down(2,50,60);assert.equal(tap.up(1,40,60),false);assert.equal(tap.up(2,50,60),false);
tap.down(1,40,60);tap.cancel(1);assert.equal(tap.up(1,40,60),false);
tap.down(1,40,60);assert.equal(tap.up(1,40,60),true);

const root='public/levantamiento/';
const json=async p=>JSON.parse(await readFile(root+p,'utf8'));
const [registry,assignments,serials,anchors,meta,addresses]=await Promise.all(
  ['cuadras.json','cuadras/asignaciones.json','identificadores-provisionales.json','anclas-geometria-actual.json','modelo-ligero.json','direcciones-referencias.json'].map(json)
);
const ids=registry.blocks.flatMap(b=>b.buildingIds);
const numbers=[...ids.map(id=>serials.numbers[id]),serials.numbers['EB-SW-CLUB'],serials.numbers['EB-SW-COLEGIO']];
assert.equal(registry.blocks.length,33);
assert.equal(ids.length,139);
assert.equal(new Set(ids).size,139);
assert.deepEqual([...numbers].sort((a,b)=>a-b),Array.from({length:141},(_,i)=>i+1));
for(const [id,n] of [['C08',1],['C02',4],['C30',8],['C20',9],['C21',10]])assert.equal(registry.blocks.find(b=>b.id===id).displayNumber,n);
assert.deepEqual(registry.blocks.find(b=>b.id==='C02').buildingIds,['B1-01','B1-02','B1-03','B1-04']);
assert.deepEqual(['B1-01','B1-02','B1-03','B1-04'].map(id=>serials.numbers[id]),[10,11,12,13]);
assert.equal(serials.numbers['EB-SW'],42);
assert.equal(serials.numbers['EB-SW-CLUB'],140);
assert.equal(serials.numbers['EB-SW-COLEGIO'],141);

const data=await readFile('public/'+meta.url.split('?')[0]);
const triangles=[];
for(let i=0;i<meta.actualTriangles;i++){
  const points=[];
  for(let v=0;v<3;v++)points.push([0,1,2].map(c=>data.readInt16LE(i*20+(v*3+c)*2)*meta.scale));
  triangles.push(points);
}
function roofHeight([x,z]){
  let top=-Infinity;
  for(const [p,q,r] of triangles){
    const det=(q[2]-r[2])*(p[0]-r[0])+(r[0]-q[0])*(p[2]-r[2]);
    if(Math.abs(det)<1e-6)continue;
    const u=((q[2]-r[2])*(x-r[0])+(r[0]-q[0])*(z-r[2]))/det;
    const v=((r[2]-p[2])*(x-r[0])+(p[0]-r[0])*(z-r[2]))/det;
    if(u>=-1e-6&&v>=-1e-6&&u+v<=1.000001)top=Math.max(top,u*p[1]+v*q[1]+(1-u-v)*r[1]);
  }
  return top;
}
function insideRing([x,z],ring){
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const [xi,zi]=ring[i],[xj,zj]=ring[j];
    if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)inside=!inside;
  }
  return inside;
}
function insideBoundary(point,boundary){
  const polygons=boundary.type==='MultiPolygon'?boundary.coordinates:[boundary.coordinates];
  return polygons.some(([outer,...holes])=>insideRing(point,outer)&&!holes.some(hole=>insideRing(point,hole)));
}

// Check the roofs in the generated, actual mesh. A hit establishes only a visual
// anchor; it does not establish legal boundaries, ownership or current condition.
const missing=[];
for(const a of assignments.assignments){
  if(a.buildingId==='EB-SW')continue;
  const point=anchors.points[a.buildingId]||a.pointLocal;
  const minHeight=addresses.registros[a.buildingId]?.tipo==='recinto_abierto' ? .04 : .5;
  if(!(roofHeight(point)>minHeight))missing.push(a.buildingId);
}
assert.deepEqual(missing,[]);
const block21=registry.blocks.find(b=>b.id==='C21');
assert.ok(block21.buildingIds.includes('EB-SW'));
for(const name of ['barra','club','colegio']){
  const part=FRONT_BUILDINGS.find(b=>b.id==='EB-SW'&&b.part===name);
  assert.ok(part,`Falta el frente ${name}`);
  const center=part.points.reduce((sum,p)=>[sum[0]+p[0]/part.points.length,sum[1]+p[1]/part.points.length],[0,0]);
  assert.ok(insideRing(center,part.points),`${name}: ancla fuera de su frente`);
  assert.ok(insideBoundary(center,block21.boundaryLocal),`${name}: ancla fuera de su cuadra`);
  assert.ok(Math.abs(roofHeight(center)-part.height)<.15,`${name}: ancla fuera de su techo`);
}
for(const id of ['SER-HSBC','A3-01','A3-08','EB-NE','B2-02','C2-04','EB-SW-COLEGIO']){
 const item=addresses.registros[id];assert(item?.nombre&&item.direccion&&/^https:\/\//.test(item.fuente),`${id}: identidad sin referencia`);
}
assert.match(addresses.registros['EB-SW-COLEGIO'].direccion,/22/);
assert.doesNotMatch(addresses.registros['EB-SW-CLUB'].direccion,/22/,'No asignar el número de posgrado al Club');
console.log('33 cuadras, 139 registros y 141 referencias visuales únicas con anclas en superficies del modelo.');
