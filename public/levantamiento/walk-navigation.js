// Navigation works in model metres; the same routines are tested without a GPU.
export function createCollisionIndex(boxes, cellSize = 8) {
  const cells = new Map();
  for (const box of boxes) {
    for (let x = Math.floor(box.min.x / cellSize); x <= Math.floor(box.max.x / cellSize); x++)
      for (let z = Math.floor(box.min.z / cellSize); z <= Math.floor(box.max.z / cellSize); z++) {
        const key = `${x},${z}`;
        if (!cells.has(key)) cells.set(key, []);
        cells.get(key).push(box);
      }
  }
  return { boxes, query(minX, minZ, maxX, maxZ) {
    const result = new Set();
    for (let x = Math.floor(minX / cellSize); x <= Math.floor(maxX / cellSize); x++)
      for (let z = Math.floor(minZ / cellSize); z <= Math.floor(maxZ / cellSize); z++)
        for (const b of cells.get(`${x},${z}`) || []) result.add(b);
    return result;
  }};
}
export function blocked(index, p, radius = .23) {
  for (const b of index.query(p.x-radius,p.z-radius,p.x+radius,p.z+radius))
    if (b.max.y >= p.y+.17 && b.min.y <= p.y+1.74 &&
        b.min.x <= p.x+radius && b.max.x >= p.x-radius &&
        b.min.z <= p.z+radius && b.max.z >= p.z-radius) return true;
  return false;
}
export function safeSpawn(index, point, bounds, maxDistance = 12) {
  const valid = p => (!bounds || (p.x >= bounds.minX && p.x <= bounds.maxX && p.z >= bounds.minZ && p.z <= bounds.maxZ)) && !blocked(index,p);
  if (valid(point)) return {...point};
  for (let radius = .25; radius <= maxDistance; radius += .25) {
    const count = Math.ceil(Math.PI*2*radius/.25);
    for (let i=0; i<count; i++) {
      const p={x:point.x+Math.cos(i/count*Math.PI*2)*radius,y:point.y,z:point.z+Math.sin(i/count*Math.PI*2)*radius};
      if (valid(p)) return p;
    }
  }
  return null;
}
// A swept segment catches thin walls even when both endpoints are outside.
export function clipCamera(index, origin, destination, radius = .16) {
  let fraction=1;
  for (const b of index.query(Math.min(origin.x,destination.x)-radius,Math.min(origin.z,destination.z)-radius,Math.max(origin.x,destination.x)+radius,Math.max(origin.z,destination.z)+radius)) {
    let near=0,far=1,hit=true;
    for(const axis of ['x','y','z']) {
      const d=destination[axis]-origin[axis],lo=b.min[axis]-radius,hi=b.max[axis]+radius;
      if(Math.abs(d)<1e-10) {if(origin[axis]<lo||origin[axis]>hi){hit=false;break;}}
      else {let a=(lo-origin[axis])/d,c=(hi-origin[axis])/d;if(a>c)[a,c]=[c,a];near=Math.max(near,a);far=Math.min(far,c);if(near>far){hit=false;break;}}
    }
    if(hit) fraction=Math.min(fraction,Math.max(0,near-.01));
  }
  return Object.fromEntries(['x','y','z'].map(a=>[a,origin[a]+(destination[a]-origin[a])*fraction]));
}
export function moveSafely(index, start, dx, dz, bounds) {
  const p={...start},steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.1));
  for(let i=0;i<steps;i++) {
    const next={...p,x:p.x+dx/steps,z:p.z+dz/steps};
    if(bounds){next.x=Math.max(bounds.minX,Math.min(bounds.maxX,next.x));next.z=Math.max(bounds.minZ,Math.min(bounds.maxZ,next.z));}
    if(!blocked(index,next)) Object.assign(p,next);
    else {const x={...p,x:next.x};if(!blocked(index,x))p.x=x.x;const z={...p,z:next.z};if(!blocked(index,z))p.z=z.z;}
  }
  return p;
}
export function installWalkingNavigation(Character,{colliders,bounds,notify=()=>{}}) {
  if(Character.prototype.navigationSafe)return;
  const index=createCollisionIndex(colliders),proto=Character.prototype;
  const originalEnter=proto.enter,originalMove=proto.move;
  proto.navigationSafe=true;
  proto.blocked=function(p){return blocked(index,p)};
  proto.enter=function(p,yaw){
    const safe=safeSpawn(index,{x:p.x,y:p.y,z:p.z},bounds);
    if(!safe){notify('No hay paso libre cerca de este punto. Conservamos tu posición anterior.');return false;}
    if(Math.hypot(p.x-safe.x,p.z-safe.z)>.1)notify('Punto ajustado al paso libre más cercano.');
    const position=p.clone().set(safe.x,safe.y,safe.z);
    originalEnter.call(this,position,yaw);
    if(!this.firstPerson){this.camera.position.copy(this.cameraWanted);this.camera.lookAt(this.cameraTarget);}
    this._lastGround=this.actor.position.clone();
    return true;
  };
  // Keep the existing character and gait; constrain each real movement step.
  proto.move=function(dt,input,yaw,pitch){
    if(!this.ready)return;
    const start=this.actor.position.clone(),length=Math.hypot(input.movement,input.strafe);
    const distance=(input.fast?3.2:1.75)*Math.min(Math.max(dt,0),.1);
    const dx=length?(Math.sin(yaw)*input.movement+Math.cos(yaw)*input.strafe)/length*distance:0;
    const dz=length?(-Math.cos(yaw)*input.movement+Math.sin(yaw)*input.strafe)/length*distance:0;
    const next=moveSafely(index,start,dx,dz,bounds);
    // The original implementation animates based on travelled distance.
    originalMove.call(this,Math.min(Math.max(dt,0),.1),input,yaw,pitch);
    this.actor.position.set(next.x,start.y,next.z);
    if(!this._lastGround||Math.hypot(next.x-this._lastGround.x,next.z-this._lastGround.z)>.4) {
      const height=this.groundHeight(this.actor.position);
      if(Math.abs(height-start.y)<=.28)this.actor.position.y=height;
      this._lastGround=this.actor.position.clone();
    }
    this.shadow.position.set(next.x,this.actor.position.y+.105,next.z);
    this.updateCamera(yaw,pitch,dt);
  };
  proto.updateCamera=function(yaw,pitch,dt){
    const p=this.actor.position;
    if(this.firstPerson){this.camera.position.set(p.x,p.y+1.7,p.z);this.camera.rotation.set(pitch,yaw,0);return;}
    this.cameraTarget.set(p.x,p.y+1.24,p.z);
    const origin={x:p.x,y:p.y+1.45,z:p.z};
    const wanted={x:p.x-Math.sin(yaw)*4.1+Math.cos(yaw)*.48,y:p.y+2.38+Math.max(-.5,pitch)*1.1,z:p.z+Math.cos(yaw)*4.1+Math.sin(yaw)*.48};
    const safe=clipCamera(index,origin,wanted);
    this.cameraWanted.set(safe.x,safe.y,safe.z);
    this.camera.position.lerp(this.cameraWanted,Math.min(1,Math.max(0,dt)*6));
    const final=clipCamera(index,origin,this.camera.position);
    this.camera.position.set(final.x,final.y,final.z);this.camera.lookAt(this.cameraTarget);
  };
}
