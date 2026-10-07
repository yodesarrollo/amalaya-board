import assert from 'node:assert/strict';
const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
const signed=pts=>pts.reduce((s,p,i)=>{const q=pts[(i+1)%pts.length];return s+p[0]*q[1]-p[1]*q[0]},0)/2;
export function intersectionArea(subject,clip){
 let output=subject;const sign=Math.sign(signed(clip));
 for(let i=0;i<clip.length&&output.length;i++){
  const a=clip[i],b=clip[(i+1)%clip.length],input=output;output=[];
  for(let j=0;j<input.length;j++){
   const p=input[j],q=input[(j+1)%input.length],u=cross(a,b,p)*sign,v=cross(a,b,q)*sign;
   if(u>=0)output.push(p);
   if((u>=0)!==(v>=0)){const t=u/(u-v);output.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}
  }
 }
 return Math.abs(signed(output));
}
export function verifyRoadClearance(world,colliders,R,roads){
 const grid=new Map(),size=12,keys=pts=>{const xs=pts.map(p=>p[0]),zs=pts.map(p=>p[1]),out=[];for(let x=Math.floor(Math.min(...xs)/size);x<=Math.floor(Math.max(...xs)/size);x++)for(let z=Math.floor(Math.min(...zs)/size);z<=Math.floor(Math.max(...zs)/size);z++)out.push(x+','+z);return out;};
 for(const road of roads)for(const t of road.triangles)for(const k of keys(t)){if(!grid.has(k))grid.set(k,[]);grid.get(k).push(t);}
 const overlap=pts=>{const seen=new Set();let area=0;for(const k of keys(pts))for(const r of grid.get(k)||[])if(!seen.has(r)){seen.add(r);area+=intersectionArea(pts,r);}return area;};
 const failures=[];let checked=0;
 world.traverse(m=>{
  if(!m.isMesh||!m.geometry?.attributes.position)return;
  for(let p=m;p;p=p.parent)if(!p.visible||p.userData.visualFit?.kind||p.userData.groundReference===true)return;
  if(m.material?.visible===false)return;
  const p=m.geometry.attributes.position,idx=m.geometry.index?.array||Array.from({length:p.count},(_,i)=>i),mat=m.matrixWorld.clone(),instance=mat.clone();let invaded=0;
  for(let k=0;k<(m.isInstancedMesh?m.count:1);k++){
   if(m.isInstancedMesh){m.getMatrixAt(k,instance);mat.multiplyMatrices(m.matrixWorld,instance);}else mat.copy(m.matrixWorld);
   for(let i=0;i<idx.length;i+=3){const v=[0,1,2].map(j=>new R.Vector3().fromBufferAttribute(p,idx[i+j]).applyMatrix4(mat));if(v.every(p=>p.y<.2))continue;const pts=v.map(p=>[p.x,p.z]);if(Math.abs(signed(pts))<1e-6)continue;checked++;invaded+=overlap(pts);}
  }
  if(invaded>.01)failures.push({object:m.name,owner:m.parent?.name,area:invaded});
 });
 const blocked=[];
 for(const c of colliders){if(c.max.y<.3)continue;const area=overlap([[c.min.x,c.min.z],[c.max.x,c.min.z],[c.max.x,c.max.z],[c.min.x,c.max.z]]);if(area>.01)blocked.push({building:c.buildingId,area,min:c.min.toArray(),max:c.max.toArray()});}
 assert(checked>1000,'La prueba debe inspeccionar geometría real, no una escena vacía');
 assert.deepEqual(failures,[],'La geometría 3D realmente dibujada no debe ocupar la calzada');
 assert.deepEqual(blocked,[],'Las colisiones no deben bloquear una calle libre');
 return {trianglesChecked:checked,collidersChecked:colliders.length,roadMeshIntrusions:failures.length,roadColliderIntrusions:blocked.length};
}
