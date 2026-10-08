import {FRONT_BUILDINGS,HEIGHT_REVIEWS,COURTYARD_REVIEWS,JOIN_REVIEWS,PARAMENTO_VERSION} from './paramento-data.js?v=15a0a4c255ae';
import {PARAMENTO_SIDEWALKS} from './paramento-sidewalks.js?v=8ee470fed0ad';
import {footprintColliderCells} from './isc58-refinement.js?v=76eca0365d35';

// Uses the scene's own constructors, including in the preserved compiled viewer.
export function applyParamento(world,colliders,R){
 if(world.userData.paramento)return world.userData.paramento;
 let template,boxTemplate;
 world.traverse(o=>{if(!template&&o.geometry?.type==='ExtrudeGeometry'&&o.geometry.parameters.shapes?.getPoints)template=o;if(!boxTemplate&&o.geometry?.type==='BoxGeometry')boxTemplate=o;});
 if(!template||!boxTemplate)throw Error('Paramento: missing native geometry templates');
 const Shape=template.geometry.parameters.shapes.constructor,Extrude=template.geometry.constructor,Box=boxTemplate.geometry.constructor,Mesh=template.constructor,Group=world.constructor;
 const material=(color)=>{const m=(Array.isArray(template.material)?template.material[0]:template.material).clone();for(const k of Object.keys(m))if(m[k]?.isTexture)m[k]=null;m.color.set(color);m.side=2;m.transparent=false;m.opacity=1;return m;};
 const mats=new Map();const mat=c=>{if(!mats.has(c))mats.set(c,material(c));return mats.get(c)};
 const shape=pts=>{const s=new Shape();s.moveTo(...pts[0]);for(const p of pts.slice(1))s.lineTo(...p);s.closePath();return s;};
 const extrude=(s,depth)=>new Extrude(s,{depth,bevelEnabled:false,curveSegments:14});
 function mesh(g,m,parent,name){const o=new Mesh(g,mat(m));o.name=name;o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function block(parent,x,y,z,w,h,d,color,name){const m=mesh(new Box(w,h,d),color,parent,name);m.position.set(x,y,z);return m;}
 function arch(x,w,h,b=0){const r=w/2,s=new Shape();s.moveTo(x-r,b);s.lineTo(x+r,b);s.lineTo(x+r,b+h-r);s.absarc(x,b+h-r,r,0,Math.PI,false);s.closePath();return s;}
 function wall(parent,a,b,height,color,bays=[],ornament=false){
  const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),g=new Group();g.position.set(a[0],.05,a[1]);g.rotation.y=Math.atan2(-dz,dx);parent.add(g);
  const face=shape([[0,0],[length,0],[length,height],[0,height]]);
  const opening=bay=>bay.rect?shape([[bay.x-bay.w/2,bay.b],[bay.x+bay.w/2,bay.b],[bay.x+bay.w/2,bay.b+bay.h],[bay.x-bay.w/2,bay.b+bay.h]]):arch(bay.x,bay.w,bay.h,bay.b);
  for(const bay of bays)face.holes.push(opening(bay));
  const shell=mesh(extrude(face,.22),color,g,'Paramento · muro con vanos reales');shell.position.z=-.22;
  for(const bay of bays){
   if(!bay.open){const fill=mesh(extrude(opening(bay),.045),bay.blind?color:bay.wood?'#59472f':'#262e32',g,'Paramento · cierre retranqueado');fill.position.z=-.17;}
   if(!bay.rect){const trim=arch(bay.x,bay.w+.34,bay.h+.22,Math.max(0,bay.b-.08));trim.holes.push(opening(bay));
    const surround=mesh(extrude(trim,.09),'#e3dfcf',g,'Paramento · moldura de arco');surround.position.z=.005;}
   if(!bay.blind&&!bay.noBars){
    for(let x=bay.x-bay.w/2+.13;x<bay.x+bay.w/2;x+=.23)block(g,x,bay.b+(bay.h-bay.w/2)/2,-.08,.025,bay.h-bay.w/2,.025,'#131c22','Paramento · reja');
    if(bay.door)block(g,bay.x,bay.h/2,-.04,.04,bay.h,.04,'#8e8a74','Paramento · encuentro de hojas');
   }
  }
  if(ornament){
   const bands=ornament==='low'?[[height-.1,.18,.19]]:[[height-.85,.13,.17],[height-.69,.15,.23],[height-.50,.08,.18],[height-.10,.14,.19]];
   for(const [y,h,d] of bands)block(g,length/2,y,-.01,length,h,d,'#e3dfcf','Paramento · cornisa continua');
   for(const x of [.09,length-.09])block(g,x,(height-.82)/2,0,.18,height-.82,.08,'#e3dfcf','Paramento · pilastra de encuentro');
  }
 }
 const result={version:PARAMENTO_VERSION,landSurvey:false,positionStatus:'visual estimate; no certified metric tolerance',removedOwners:[],replacedColliderCount:0,frontages:[],heightReviews:[],courtyards:[]};
 world.updateMatrixWorld(true);
 const removals=[{prefix:'La Barra Hidalgo',id:'EB-SW'},{prefix:'Club Obregón',id:'EB-SW'},...FRONT_BUILDINGS.filter(p=>p.replace||p.replacePrefix).map(p=>({prefix:p.replace||p.replacePrefix,id:p.id}))];
 for(const {prefix,id} of removals){
  let owner;world.traverse(o=>{if(!owner&&o.name.startsWith(prefix))owner=o});if(!owner)throw Error('Paramento: owner missing '+prefix);
  const b=new R.Box3().setFromObject(owner);
  for(let i=colliders.length-1;i>=0;i--){const c=colliders[i];if((!c.buildingId||c.buildingId===id)&&c.min.x>=b.min.x-.2&&c.max.x<=b.max.x+.2&&c.min.z>=b.min.z-.2&&c.max.z<=b.max.z+.2){colliders.splice(i,1);result.replacedColliderCount++;}}
  result.removedOwners.push(owner.name);owner.parent.remove(owner);
 }
 for(const p of FRONT_BUILDINGS){
  const g=new Group();g.name=p.owner;g.userData={buildingId:p.id,frontageId:p.part,photoEvidence:p.evidence,heightMeters:p.height,fittedPlan:{points:p.points,holes:[]},heightStatus:'visual estimate, unmeasured'};world.add(g);
  const roof=shape(p.points.map(([x,z])=>[x,-z])),geom=extrude(roof,.12);geom.rotateX(-Math.PI/2);
  const cap=mesh(geom,'#c2b9a4',g,'Paramento · cubierta '+p.part);cap.position.y=p.height-.07;
  const floor=mesh(geom.clone(),p.color,g,'Paramento · base '+p.part);floor.position.y=.05;
  for(let i=0;i<p.points.length;i++){const f=p.facades.find(f=>f.edge===i);wall(g,p.points[i],p.points[(i+1)%p.points.length],p.height,p.color,f?.bays||[],f&&!f.plain?(f.cornice||true):false);}
  const cells=footprintColliderCells(p.points.map(([x,z])=>({x,z})),.2);
  for(const c of cells){const b=new R.Box3(new R.Vector3(c.minX,.05,c.minZ),new R.Vector3(c.maxX,p.height+.05,c.maxZ));b.buildingId=p.id;b.frontageId=p.part;colliders.push(b);}
  result.frontages.push({id:p.id,part:p.part,points:p.points,heightMeters:p.height,colliders:cells.length});
 }
 for(const p of COURTYARD_REVIEWS){
  const m=world.getObjectByName('Planta física · '+p.id);if(!m?.geometry)throw Error('Paramento: courtyard owner missing '+p.id);
  const source=m.geometry.parameters.shapes,points=source.getPoints().map(v=>[v.x,-v.y]);
  const s=shape(points.map(([x,z])=>[x,-z]));for(const h of p.holes)s.holes.push(shape(h.map(([x,z])=>[x,-z])));
  const geom=extrude(s,m.userData.heightMeters);geom.rotateX(-Math.PI/2);m.geometry.dispose();m.geometry=geom;m.userData.fittedPlan={points,holes:p.holes};
  for(let i=colliders.length-1;i>=0;i--)if(colliders[i].buildingId===p.id)colliders.splice(i,1);
  let cells=footprintColliderCells(points.map(([x,z])=>({x,z})),.2);
  for(const h of p.holes)for(const hole of footprintColliderCells(h.map(([x,z])=>({x,z})),.2))cells=cells.flatMap(a=>{if(a.maxZ<=hole.minZ||a.minZ>=hole.maxZ||a.maxX<=hole.minX||a.minX>=hole.maxX)return[a];const parts=[];if(a.minX<hole.minX)parts.push({...a,maxX:hole.minX});if(a.maxX>hole.maxX)parts.push({...a,minX:hole.maxX});return parts;});
  for(const a of cells){const b=new R.Box3(new R.Vector3(a.minX,.05,a.minZ),new R.Vector3(a.maxX,m.userData.heightMeters+.05,a.maxZ));b.buildingId=p.id;colliders.push(b);}
  result.courtyards.push({id:p.id,holes:p.holes,reason:p.reason});
 }
 for(const p of HEIGHT_REVIEWS){
  const m=world.getObjectByName('Planta física · '+p.id);if(!m)throw Error('Paramento: height owner missing '+p.id);
  const previous=m.userData.heightMeters;
  m.geometry.scale(1,p.height/previous,1);m.userData.heightMeters=p.height;m.userData.heightStatus='visual estimate from Street View, unmeasured';m.material.color.set(p.color);
  for(const c of colliders)if(c.buildingId===p.id)c.max.y=p.height+.05;
  result.heightReviews.push({id:p.id,before:previous,after:p.height,reason:p.reason});
 }
 result.joins=[];
 for(const p of JOIN_REVIEWS){
  const m=world.getObjectByName('Planta física · '+p.id),points=m.geometry.parameters.shapes.getPoints().map(v=>[v.x,-v.y]);
  if(points.length>1&&Math.hypot(points[0][0]-points.at(-1)[0],points[0][1]-points.at(-1)[1])<1e-7)points.pop();
  for(const v of p.vertices)points[v.index]=v.point;
  const g=extrude(shape(points.map(([x,z])=>[x,-z])),m.userData.heightMeters);g.rotateX(-Math.PI/2);m.geometry.dispose();m.geometry=g;m.userData.fittedPlan={points,holes:[]};
  for(let i=colliders.length-1;i>=0;i--)if(colliders[i].buildingId===p.id)colliders.splice(i,1);
  for(const a of footprintColliderCells(points.map(([x,z])=>({x,z})),.2)){const b=new R.Box3(new R.Vector3(a.minX,.05,a.minZ),new R.Vector3(a.maxX,m.userData.heightMeters+.05,a.maxZ));b.buildingId=p.id;colliders.push(b);}
  result.joins.push({id:p.id,points,reason:p.reason});
 }
 for(const cut of PARAMENTO_SIDEWALKS){
  const m=world.getObjectByName('Ajuste visual · sidewalk · '+cut.id);if(!m)throw Error('Paramento: sidewalk missing '+cut.id);
  const old=m.geometry,g=new old.constructor(),a=old.attributes.position,positions=[];
  for(let i=0;i<cut.triangles.length;i+=2)positions.push(cut.triangles[i],.09,cut.triangles[i+1]);
  g.setAttribute('position',new a.constructor(positions,3));g.computeVertexNormals();m.geometry=g;old.dispose();
 }
 world.updateMatrixWorld(true);world.userData.paramento=result;return result;
}
