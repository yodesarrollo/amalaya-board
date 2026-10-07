import { VISUAL_FIT } from './ajuste-visual-data.js?v=dbb7e1c599a2';

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
    const owned=colliders.filter(c=>bounds.some(b=>c.min.x>=b.min.x-.15&&c.max.x<=b.max.x+.15&&c.min.z>=b.min.z-.15&&c.max.z<=b.max.z+.15));
    // Object-local matrix P^-1 * global fit * P * original local transform.
    for (const owner of owners) {
      const parent=owner.parent.matrixWorld.clone(),fit=parent.clone().identity();
      fit.elements[0]=sx;fit.elements[10]=sz;fit.elements[12]=tx;fit.elements[14]=tz;
      const local=parent.clone().invert().multiply(fit).multiply(parent).multiply(owner.matrix);
      local.decompose(owner.position,owner.quaternion,owner.scale);owner.updateMatrix();
    }
    for(const c of owned){c.min.x=c.min.x*sx+tx;c.max.x=c.max.x*sx+tx;c.min.z=c.min.z*sz+tz;c.max.z=c.max.z*sz+tz;}
    corrections.push({id:change.id,colliders:owned.length,maxDisplacementMeters:change.maxDisplacementMeters});
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
  const result={version:VISUAL_FIT.version,landSurvey:false,summary:VISUAL_FIT.summary,corrections,surfaces:group.children.length};
  world.userData.visualFit=result;return result;
}
