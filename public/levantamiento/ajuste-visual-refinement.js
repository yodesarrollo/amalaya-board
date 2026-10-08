import { footprintColliderCells } from './isc58-refinement.js?v=76eca0365d35';
import { VISUAL_FIT } from './ajuste-visual-data.js?v=4326fda722f4';

// Same native constructors as the assembled world; no second Three runtime.
export function applyVisualFit(world, colliders, R) {
  if (world.userData.visualFit) return world.userData.visualFit;
  world.updateMatrixWorld(true);
  const corrections=[];
  for (const change of VISUAL_FIT.adjustments) {
    const owners=change.owners.map(name=>world.getObjectByName(name));
    if(owners.some(o=>!o))throw Error('Ajuste visual: falta el edificio '+change.id);
    const [sx,, ,sz,tx,tz]=change.affine;
    const bounds=owners.map(o=>new R.Box3().setFromObject(o));
    const owned=colliders.filter(c=>(!c.buildingId||c.buildingId===change.id)&&bounds.some(b=>c.min.x>=b.min.x-.15&&c.max.x<=b.max.x+.15&&c.min.z>=b.min.z-.15&&c.max.z<=b.max.z+.15));
    // Object-local matrix P^-1 * global fit * P * original local transform.
    for (const owner of owners) {
      const parent=owner.parent.matrixWorld.clone(),fit=parent.clone().identity();
      fit.elements[0]=sx;fit.elements[10]=sz;fit.elements[12]=tx;fit.elements[14]=tz;
      const local=parent.clone().invert().multiply(fit).multiply(parent).multiply(owner.matrix);
      // Preserve the full affine matrix: decomposing a world-axis fit under a rotated
      // parent loses shear and can move whole facade groups off their footprints.
      owner.matrixAutoUpdate=false;owner.matrix.copy(local);owner.matrixWorldNeedsUpdate=true;
    }
    for(const c of owned){c.min.x=c.min.x*sx+tx;c.max.x=c.max.x*sx+tx;c.min.z=c.min.z*sz+tz;c.max.z=c.max.z*sz+tz;}
    corrections.push({id:change.id,colliders:owned.length,maxDisplacementMeters:change.maxDisplacementMeters});
  }
  // Rebuild closed solids for corrected simple footprints; clipping rendered faces
  // would leave open walls. Keep heights/materials and rebuild their walk collisions.
  const contourCorrections=[];
  for(const change of VISUAL_FIT.planCorrections||[]){
    const mesh=world.getObjectByName('Planta física · '+change.id);
    if(!mesh)throw Error('Encaje: falta el edificio '+change.id);
    const shape=new mesh.geometry.parameters.shapes.constructor();
    const addRing=(target,pts)=>{target.moveTo(pts[0][0],-pts[0][1]);for(const p of pts.slice(1))target.lineTo(p[0],-p[1]);target.closePath();};
    addRing(shape,change.points);
    for(const points of change.holes||[]){const hole=new shape.constructor();addRing(hole,points);shape.holes.push(hole);}
    const height=mesh.userData.heightMeters,oldGeometry=mesh.geometry;
    mesh.geometry=new oldGeometry.constructor(shape,{depth:height,bevelEnabled:false});mesh.geometry.rotateX(-Math.PI/2);oldGeometry.dispose();
    mesh.userData.fittedPlan={points:change.points,holes:change.holes||[],reason:change.reason};
    let removed=0;
    for(let i=colliders.length-1;i>=0;i--)if(colliders[i].buildingId===change.id){colliders.splice(i,1);removed++;}
    if(!removed)throw Error('Encaje: colisiones sin identificar '+change.id);
    // Exact horizontal scan cells preserve the actual polygon and its courtyard holes.
    let cells=footprintColliderCells(change.points.map(p=>({x:p[0],z:p[1]})),.25);
    for(const hole of change.holes||[]){
      const holes=footprintColliderCells(hole.map(p=>({x:p[0],z:p[1]})),.25);
      for(const h of holes)cells=cells.flatMap(c=>{
        if(c.maxX<=h.minX||c.minX>=h.maxX||c.maxZ<=h.minZ||c.minZ>=h.maxZ)return[c];
        const result=[];const low=Math.max(c.minZ,h.minZ),high=Math.min(c.maxZ,h.maxZ);
        if(c.minZ<low)result.push({...c,maxZ:low});if(c.maxZ>high)result.push({...c,minZ:high});
        if(c.minX<h.minX)result.push({...c,minZ:low,maxZ:high,maxX:h.minX});
        if(c.maxX>h.maxX)result.push({...c,minZ:low,maxZ:high,minX:h.maxX});return result;
      });
    }
    for(const c of cells){const box=new R.Box3(new R.Vector3(c.minX,.05,c.minZ),new R.Vector3(c.maxX,height+.05,c.maxZ));box.buildingId=change.id;colliders.push(box);}
    contourCorrections.push({id:change.id,removedColliders:removed,colliders:cells.length});
  }
  const collisionCorrections=[];
  for(const change of VISUAL_FIT.collisionRepairs||[]){
    const index=colliders.findIndex(c=>c.min.toArray().every((v,i)=>Math.abs(v-change.before.min[i])<1e-4)&&c.max.toArray().every((v,i)=>Math.abs(v-change.before.max[i])<1e-4));
    if(index<0)throw Error('Encaje: no se identifica la colisión '+change.id);
    colliders.splice(index,1);let count=0;
    for(const polygon of change.polygons){
      if(polygon.holes.length)throw Error('Encaje: colisión con patio no prevista');
      for(const c of footprintColliderCells(polygon.points.map(p=>({x:p[0],z:p[1]})),.25)){
        const box=new R.Box3(new R.Vector3(c.minX,change.before.min[1],c.minZ),new R.Vector3(c.maxX,change.before.max[1],c.maxZ));box.buildingId=change.id;colliders.push(box);count++;
      }
    }
    collisionCorrections.push({id:change.id,removedColliders:1,colliders:count});
  }
  let template;
  world.traverse(o=>{if(!template&&o.isMesh&&!o.isInstancedMesh&&!Array.isArray(o.material)&&o.geometry?.attributes.position)template=o});
  if(!template)throw Error('Ajuste visual: no hay plantilla de superficie');
  let proto=Object.getPrototypeOf(template.geometry);
  while(proto&&!Object.hasOwn(proto,'setAttribute'))proto=Object.getPrototypeOf(proto);
  const Geometry=proto.constructor,Attr=template.geometry.attributes.position.constructor,group=new world.constructor();
  group.name='Cuadras · calles y banquetas · ajuste visual';
  for(const entry of VISUAL_FIT.surfaces){
    const positions=[];
    for(let i=0;i<entry.triangles.length;i+=2)positions.push(entry.triangles[i],entry.elevation,entry.triangles[i+1]);
    const geometry=new Geometry();geometry.setAttribute('position',new Attr(positions,3));geometry.computeVertexNormals();
    const material=template.material.clone();
    for(const key of Object.keys(material))if(material[key]?.isTexture)material[key]=null;
    material.color.set(entry.kind==='road'?'#656867':entry.kind==='sidewalk'?'#cbc3ae':'#ada58e');
    material.emissive?.set('#000000');material.transparent=false;material.opacity=1;material.depthWrite=true;
    const mesh=new template.constructor(geometry,material);mesh.name='Ajuste visual · '+entry.kind+' · '+entry.id;mesh.receiveShadow=true;
    mesh.userData.visualFit={id:entry.id,kind:entry.kind,approximate:true};group.add(mesh);
  }
  world.add(group);world.updateMatrixWorld(true);
  const result={version:VISUAL_FIT.version,landSurvey:false,summary:VISUAL_FIT.summary,corrections,contourCorrections,collisionCorrections,surfaces:group.children.length};
  world.userData.visualFit=result;return result;
}
