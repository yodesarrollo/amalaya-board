import {test} from 'node:test';
import assert from 'node:assert/strict';
import {addC113SouthRail} from '../../public/levantamiento/c1-13-barandal.js';

test('barandal sur se apoya en cornisa y queda en el tramo recto de la huella',()=>{
 const points=[[-115.258,75.859],[-100.137,72.219],[-96.226,90.421],[-111.347,94.322]], calls=[];
 const block=(parent,x,y,z,w,h,d,color,name)=>{const o={x,y,z,w,h,d,color,name,rotation:{}};calls.push(o);return o};
 const r=addC113SouthRail({},points,6.2,block);
 assert.equal(r.edge,2); assert.equal(r.start,1.4); assert.ok(r.end>r.start);
 assert.equal(calls.filter(c=>c.name.endsWith('riel')).length,2);
 assert.equal(calls.filter(c=>c.name.endsWith('barrotes')).length,r.intervals+1);
 assert.equal(calls.filter(c=>c.name.endsWith('riel curvo')).length,16);
 assert.equal(calls.filter(c=>c.name.endsWith('barrote curvo')).length,8);
 const curved=calls.filter(c=>c.name.endsWith('riel curvo')).at(-1), straight=calls.find(c=>c.name.endsWith('riel'));
 assert.ok(Math.hypot(curved.x-straight.x,curved.z-straight.z)<(curved.w+straight.w)/2+.03);
 assert.ok(calls.every(c=>c.y-c.h/2>=6.25-1e-9));
 const [a,b]=[points[2],points[3]],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);
 for(const c of calls.filter(c=>c.name.endsWith('barrotes'))){
  const t=((c.x-a[0])*dx+(c.z-a[1])*dz)/L;
  assert.ok(t>=r.start-.12 && t<=r.end+.12);
 }
});
