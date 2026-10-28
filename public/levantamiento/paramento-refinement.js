import {FRONT_BUILDINGS,ROUND2_BUILDINGS,HEIGHT_REVIEWS,COURTYARD_REVIEWS,JOIN_REVIEWS,PARAMENTO_VERSION} from './paramento-data.js?v=5cc1cd6d1d7a';
import {PARAMENTO_SIDEWALKS} from './paramento-sidewalks.js?v=8ee470fed0ad';
import {footprintColliderCells} from './isc58-refinement.js?v=76eca0365d35';
import {CUADRA_DETAILS} from './cuadra-detail-data.js?v=a56d6801707b';
import {applyObregonApprox} from './obregon-aproximado-data.js?v=9a20c956e9de';

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
 const ring=s=>{const pts=s.getPoints().map(v=>[v.x,-v.y]);if(pts.length>1&&Math.hypot(pts[0][0]-pts.at(-1)[0],pts[0][1]-pts.at(-1)[1])<1e-7)pts.pop();return pts;};
 function solidCells(points,holes=[]){
  let cells=footprintColliderCells(points.map(([x,z])=>({x,z})),.2);
  for(const h of holes)for(const cut of footprintColliderCells(h.map(([x,z])=>({x,z})),.2))cells=cells.flatMap(a=>{
   const x0=Math.max(a.minX,cut.minX),x1=Math.min(a.maxX,cut.maxX),z0=Math.max(a.minZ,cut.minZ),z1=Math.min(a.maxZ,cut.maxZ);
   if(x1<=x0||z1<=z0)return[a];const out=[];
   if(a.minZ<z0)out.push({...a,maxZ:z0});if(z1<a.maxZ)out.push({...a,minZ:z1});
   if(a.minX<x0)out.push({...a,maxX:x0,minZ:z0,maxZ:z1});if(x1<a.maxX)out.push({...a,minX:x1,minZ:z0,maxZ:z1});return out;
  });return cells;
 }
 function mesh(g,m,parent,name){const o=new Mesh(g,mat(m));o.name=name;o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function block(parent,x,y,z,w,h,d,color,name){const m=mesh(new Box(w,h,d),color,parent,name);m.position.set(x,y,z);return m;}
 function arch(x,w,h,b=0){const r=w/2,s=new Shape();s.moveTo(x-r,b);s.lineTo(x+r,b);s.lineTo(x+r,b+h-r);s.absarc(x,b+h-r,r,0,Math.PI,false);s.closePath();return s;}
 function wall(parent,a,b,height,color,bays=[],ornament=false,details={}){
  const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),g=new Group();g.position.set(a[0],.05,a[1]);g.rotation.y=Math.atan2(-dz,dx);parent.add(g);
  const face=shape([[0,0],[length,0],[length,height],[0,height]]);
  const opening=bay=>bay.rect?shape([[bay.x-bay.w/2,bay.b],[bay.x+bay.w/2,bay.b],[bay.x+bay.w/2,bay.b+bay.h],[bay.x-bay.w/2,bay.b+bay.h]]):arch(bay.x,bay.w,bay.h,bay.b);
  for(const bay of bays)face.holes.push(opening(bay));
  const shell=mesh(extrude(face,.22),color,g,'Paramento · muro con vanos reales');shell.position.z=-.22;
  for(const bay of bays){
   if(bay.portico){
    // Street View shows a recessed ground-floor frontage behind the columns.
    // Keep the setback as geometry, including the darker opening at the back.
    const back=mesh(extrude(opening(bay),.045),bay.fillColor||color,g,'Paramento · cierre del pórtico');back.position.z=-1.05;
    block(g,bay.x,bay.b+1.25,-.98,bay.w*.68,1.45,.055,'#465151','Paramento · cierre de ventana del pórtico');
   }else if(!bay.open){const fill=mesh(extrude(opening(bay),.045),bay.fillColor||(bay.blind?color:bay.wood?'#59472f':'#262e32'),g,'Paramento · cierre retranqueado');fill.position.z=-.17;}
   if(bay.rect&&bay.frameColor){const trim=shape([[bay.x-bay.w/2-.10,Math.max(0,bay.b-.1)],[bay.x+bay.w/2+.10,Math.max(0,bay.b-.1)],[bay.x+bay.w/2+.10,bay.b+bay.h+.1],[bay.x-bay.w/2-.10,bay.b+bay.h+.1]]);trim.holes.push(opening(bay));const frame=mesh(extrude(trim,.085),bay.frameColor,g,'Paramento · marco rectangular');frame.position.z=.005;}
   if(bay.lintel){block(g,bay.x,bay.b+bay.h+.20,.05,bay.w+.52,.18,.22,bay.frameColor,'Paramento · banda de fachada dintel');block(g,bay.x,bay.b+bay.h+.33,.04,bay.w+.65,.08,.28,bay.frameColor,'Paramento · banda de fachada remate');}
   if(bay.panels)for(const dx of [-.55,.55])for(const y of [.65,1.75,2.85])block(g,bay.x+dx,y,-.10,.86,.86,.05,'#776345','Paramento · cierre panel de madera');
   if(bay.shutter)for(let y=bay.b+.16;y<bay.b+bay.h-.08;y+=.16)block(g,bay.x,y,-.10,bay.w,.018,.025,'#bdc1bb','Paramento · lama de portón');
   if(!bay.rect){const trim=arch(bay.x,bay.w+.34,bay.h+.22,Math.max(0,bay.b-.08));trim.holes.push(opening(bay));
    const surround=mesh(extrude(trim,.09),'#e3dfcf',g,'Paramento · moldura de arco');surround.position.z=.005;}
   if(!bay.portico&&!bay.blind&&!bay.noBars){
    const barHeight=bay.fullBars?bay.h:bay.h-bay.w/2;
    for(let x=bay.x-bay.w/2+.13;x<bay.x+bay.w/2;x+=.23)block(g,x,bay.b+barHeight/2,-.08,.025,barHeight,.025,bay.barColor||'#131c22','Paramento · reja');
    if(bay.fullBars)for(let y=bay.b+.4;y<bay.b+bay.h;y+=.45)block(g,bay.x,y,-.065,bay.w,.022,.022,bay.barColor||'#131c22','Paramento · travesaño de reja');
    if(bay.door)block(g,bay.x,bay.h/2,-.04,.04,bay.h,.04,'#8e8a74','Paramento · encuentro de hojas');
   }
  }
  if(ornament){
   const bands=ornament==='low'?[[height-.1,.18,.19]]:[[height-.85,.13,.17],[height-.69,.15,.23],[height-.50,.08,.18],[height-.10,.14,.19]];
   for(const [y,h,d] of bands)block(g,length/2,y,-.01,length,h,d,'#e3dfcf','Paramento · cornisa continua');
   for(const x of [.09,length-.09])block(g,x,(height-.82)/2,0,.18,height-.82,.08,'#e3dfcf','Paramento · pilastra de encuentro');
  }
  for(const band of details.bands||[]){
   let spans=[[(band.x??length/2)-(band.w??length)/2,(band.x??length/2)+(band.w??length)/2]];
   if(details.clipBands)for(const bay of bays){
    if(band.y+band.h/2<=bay.b||band.y-band.h/2>=bay.b+bay.h)continue;
    const lo=bay.x-bay.w/2-.02,hi=bay.x+bay.w/2+.02;
    spans=spans.flatMap(([a,b])=>hi<=a||lo>=b?[[a,b]]:[[a,Math.max(a,lo)],[Math.min(b,hi),b]].filter(([x,y])=>y-x>.02));
   }
   for(const [a,b] of spans)block(g,(a+b)/2,band.y,.02,b-a,band.h,band.d,band.color,'Paramento · banda de fachada');
  }
  for(const fin of details.fins||[])block(g,fin.x,fin.b+fin.h/2,fin.d/2,fin.w,fin.h,fin.d,fin.color,'Paramento · parasol vertical');
  // Opt-in historical frontage. Fractions are symmetric so winding reversal
  // cannot move a pier into an opening; dimensions remain visual estimates.
  for(const t of details.pilasters||[])block(g,length*t,2.55,.06,.32,5.1,.18,details.trimColor,'Paramento · banda de fachada pilastra');
  if(details.balustrade){
   const r=details.balustrade,base=height+.06;
   block(g,length/2,base+.06,-.1,length,.12,.3,r.trim,'Paramento · cubierta balaustrada base');
   block(g,length/2,base+.84,-.1,length,.14,.34,r.trim,'Paramento · cubierta balaustrada pasamanos');
   const bays=5;
   for(let j=0;j<=bays;j++)block(g,length*j/bays,base+.47,-.1,.36,.94,.36,r.trim,'Paramento · cubierta balaustrada pilar');
   for(let j=0;j<bays;j++)for(let k=1;k<10;k++){
    const x=length*(j+k/10)/bays;
    block(g,x,base+.43,-.1,.10,.64,.14,r.color,'Paramento · detalle balaustre');
    block(g,x,base+.35,-.1,.19,.23,.19,r.color,'Paramento · detalle balaustre vientre');
    block(g,x,base+.68,-.1,.17,.10,.18,r.color,'Paramento · detalle balaustre capitel');
   }
  }
  if(details.canopy){const c=details.canopy,m=block(g,length/2,c.y,c.depth/2-.1,length+.15,.12,c.depth,c.color,'Paramento · marquesina inclinada');m.rotation.x=Math.atan(.25/c.depth);}
  return g;
 }
 const result={version:PARAMENTO_VERSION,landSurvey:false,positionStatus:'visual estimate; no certified metric tolerance',removedOwners:[],replacedColliderCount:0,frontages:[],heightReviews:[],courtyards:[]};
 world.updateMatrixWorld(true);
 const removals=[{prefix:'La Barra Hidalgo',id:'EB-SW'},{prefix:'Club Obregón',id:'EB-SW'},...FRONT_BUILDINGS.filter(p=>p.replace||p.replacePrefix).map(p=>({prefix:p.replace||p.replacePrefix,id:p.id}))];
 function removeOwner(prefix,id){
  let owner;world.traverse(o=>{if(!owner&&o.name.startsWith(prefix))owner=o});if(!owner)throw Error('Paramento: owner missing '+prefix);
  const b=new R.Box3().setFromObject(owner);
  for(let i=colliders.length-1;i>=0;i--){const c=colliders[i];if((!c.buildingId||c.buildingId===id)&&c.min.x>=b.min.x-.2&&c.max.x<=b.max.x+.2&&c.min.z>=b.min.z-.2&&c.max.z<=b.max.z+.2){colliders.splice(i,1);result.replacedColliderCount++;}}
  result.removedOwners.push(owner.name);owner.parent.remove(owner);
 }
 for(const {prefix,id} of removals)removeOwner(prefix,id);
 function addFront(p){
  const g=new Group();g.name=p.owner;g.userData={buildingId:p.id,frontageId:p.part,photoEvidence:p.evidence,heightMeters:p.height,fittedPlan:{points:p.points,holes:[]},heightStatus:'visual estimate, unmeasured'};world.add(g);
  let colliderCount=0;
  for(const section of p.sections||[p]){
   const roof=shape(section.points.map(([x,z])=>[x,-z])),geom=extrude(roof,.12);geom.rotateX(-Math.PI/2);
   const cap=mesh(geom,section.roofColor||p.roofColor||'#c2b9a4',g,'Paramento · cubierta '+section.part);cap.position.y=section.height-.07;
   const floor=mesh(geom.clone(),section.color,g,'Paramento · base '+section.part);floor.position.y=.05;
   for(let i=0;i<section.points.length;i++){const f=section.facades.find(f=>f.edge===i);wall(g,section.points[i],section.points[(i+1)%section.points.length],section.height,section.color,f?.bays||[],f&&!f.plain?(f.cornice||true):false,f||{});}
   // Low parapets and rooftop equipment are opt-in, interpreted from the
   // corresponding aerial image. They remain small actual meshes in both views.
   if(section.parapet||p.parapet){
    const center=section.points.reduce((s,v)=>[s[0]+v[0]/section.points.length,s[1]+v[1]/section.points.length],[0,0]);
    const inset=section.points.map(([x,z])=>{const dx=center[0]-x,dz=center[1]-z,l=Math.hypot(dx,dz)||1;return [x+dx*.20/l,z+dz*.20/l]});
    for(let i=0;i<inset.length;i++){const a=inset[i],b=inset[(i+1)%inset.length],dx=b[0]-a[0],dz=b[1]-a[1];const rim=block(g,(a[0]+b[0])/2,section.height+.13,(a[1]+b[1])/2,Math.hypot(dx,dz),.26,.14,section.parapetColor||section.color,'Paramento · cubierta pretil');rim.rotation.y=Math.atan2(-dz,dx);}
   }
   for(const d of section.roofDetails||p.roofDetails||[])block(g,d.x,section.height+(d.h||.2)/2,d.z,d.w,d.h||.2,d.d,d.color||'#aaa9a0','Paramento · cubierta detalle');
   const cells=solidCells(section.points);colliderCount+=cells.length;
   for(const c of cells){const b=new R.Box3(new R.Vector3(c.minX,.05,c.minZ),new R.Vector3(c.maxX,section.height+.05,c.maxZ));b.buildingId=p.id;b.frontageId=p.part;colliders.push(b);}
  }
  for(const w of p.lowWalls||[]){wall(g,w.a,w.b,w.height,w.color);const b=new R.Box3(new R.Vector3(Math.min(w.a[0],w.b[0])-.1,.05,Math.min(w.a[1],w.b[1])-.1),new R.Vector3(Math.max(w.a[0],w.b[0])+.1,w.height+.05,Math.max(w.a[1],w.b[1])+.1));b.buildingId=p.id;b.frontageId=p.part;colliders.push(b);}
  result.frontages.push({id:p.id,part:p.part,points:p.points,heightMeters:p.height,colliders:colliderCount,round:p.round||1,sections:p.sections?.map(s=>({part:s.part,points:s.points,height:s.height}))});
 }
 for(const p of FRONT_BUILDINGS)addFront(p);
 for(const p of COURTYARD_REVIEWS){
  const m=world.getObjectByName('Planta física · '+p.id);if(!m?.geometry)throw Error('Paramento: courtyard owner missing '+p.id);
  const source=m.geometry.parameters.shapes,points=source.getPoints().map(v=>[v.x,-v.y]);
  const s=shape(points.map(([x,z])=>[x,-z]));for(const h of p.holes)s.holes.push(shape(h.map(([x,z])=>[x,-z])));
  const geom=extrude(s,m.userData.heightMeters);geom.rotateX(-Math.PI/2);m.geometry.dispose();m.geometry=geom;m.userData.fittedPlan={points,holes:p.holes};
  for(let i=colliders.length-1;i>=0;i--)if(colliders[i].buildingId===p.id)colliders.splice(i,1);
  const cells=solidCells(points,p.holes);
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
  const m=world.getObjectByName('Planta física · '+p.id),source=m.geometry.parameters.shapes,points=ring(source),holes=source.holes.map(ring);
  for(const v of p.vertices)points[v.index]=v.point;
  const s=shape(points.map(([x,z])=>[x,-z]));for(const h of holes)s.holes.push(shape(h.map(([x,z])=>[x,-z])));
  const g=extrude(s,m.userData.heightMeters);g.rotateX(-Math.PI/2);m.geometry.dispose();m.geometry=g;m.userData.fittedPlan={points,holes};
  for(let i=colliders.length-1;i>=0;i--)if(colliders[i].buildingId===p.id)colliders.splice(i,1);
  for(const a of solidCells(points,holes)){const b=new R.Box3(new R.Vector3(a.minX,.05,a.minZ),new R.Vector3(a.maxX,m.userData.heightMeters+.05,a.maxZ));b.buildingId=p.id;colliders.push(b);}
  result.joins.push({id:p.id,points,holes,reason:p.reason});
 }
 for(const p of ROUND2_BUILDINGS){removeOwner(p.replace,p.id);addFront({...p,round:2});}
 // A small data packet adds only the active block's visible detail. Reuse native
 // geometry/materials and merge by material to avoid one draw call per fence bar.
 result.blockDetails=[];
 function compact(group,keepDetails=false){
  group.updateMatrixWorld(true);const buckets=new Map();let count=0;
  group.traverse(m=>{if(!m.isMesh||Array.isArray(m.material))return;count++;const structural=/^Paramento · (muro|cubierta|base|cierre)/.test(m.name)||(keepDetails&&/^Paramento · (marco rectangular|banda de fachada)/.test(m.name))||m.name==='Cuadra · cubierta del segundo nivel',key=m.material.uuid+'-'+structural;
   if(!buckets.has(key))buckets.set(key,{material:m.material,structural,positions:[],normals:[]});
   const b=buckets.get(key),g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(m.matrixWorld);
   b.positions.push(...g.attributes.position.array);b.normals.push(...g.attributes.normal.array);g.dispose();
  });
  let base;world.traverse(m=>{if(!base&&m.geometry?.type==='BufferGeometry')base=m.geometry});
  if(!base)return {before:count,after:count};
  const Attribute=base.attributes.position.constructor;
  for(const child of [...group.children])group.remove(child);
  for(const b of buckets.values()){const geo=new base.constructor();geo.setAttribute('position',new Attribute(b.positions,3));geo.setAttribute('normal',new Attribute(b.normals,3));const m=new Mesh(geo,b.material);m.name=b.structural?'Paramento · muro y cubierta agrupados':'Cuadra · detalle agrupado';m.userData.liteStructural=b.structural;m.castShadow=m.receiveShadow=true;group.add(m)}
  return {before:count,after:buckets.size};
 }
 function wallColliders(a,b,height,owner,bays=[]){
  const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),ux=dx/length,uz=dz/length;
  let spans=[[0,length]];for(const bay of bays.filter(v=>v.open))spans=spans.flatMap(([x,y])=>{const lo=bay.x-bay.w/2,hi=bay.x+bay.w/2;return hi<=x||lo>=y?[[x,y]]:[[x,Math.max(x,lo)],[Math.min(y,hi),y]].filter(([l,r])=>r-l>.02)});
  for(const [lo,hi] of spans){const p=[a[0]+ux*lo,a[1]+uz*lo],q=[a[0]+ux*hi,a[1]+uz*hi],poly=[p,q,[q[0]+uz*.22,q[1]-ux*.22],[p[0]+uz*.22,p[1]-ux*.22]];
   for(const c of solidCells(poly)){const box=new R.Box3(new R.Vector3(c.minX,.05,c.minZ),new R.Vector3(c.maxX,height+.05,c.maxZ));box.blockDetail=owner;colliders.push(box)}
  }
 }
 for(const packet of CUADRA_DETAILS){
  const entry={block:packet.block,buildings:[],equipment:[],batches:[]};
  for(const p of packet.buildings){
   const prefix=p.ownerPrefix||'Planta física · '+p.id;let owner;world.traverse(o=>{if(!owner&&o.name.startsWith(prefix))owner=o});if(!owner)throw Error('Cuadra: missing '+p.id);
   const ownerName=owner.name,plan=p.points?{points:p.points,holes:[]}:owner.userData.fittedPlan||{points:ring(owner.geometry.parameters.shapes),holes:owner.geometry.parameters.shapes.holes.map(ring)};
   if(plan.holes?.length)throw Error('Cuadra: courtyard detail requires explicit hole support '+p.id);
   const n=plan.points.length,reverse=plan.points.reduce((a,p,i)=>a+p[0]*plan.points[(i+1)%n][1]-plan.points[(i+1)%n][0]*p[1],0)>0,points=reverse?[plan.points[0],...plan.points.slice(1).reverse()]:plan.points;
   const facades=p.facades.map(f=>{const a=plan.points[f.edge],b=plan.points[(f.edge+1)%n],length=Math.hypot(b[0]-a[0],b[1]-a[1]);return {...f,edge:reverse?n-1-f.edge:f.edge,clipBands:true,bays:(f.bays||[]).map(v=>({...v,fullBars:!!v.rect,barColor:p.id==='B2-01'||p.id==='B2-02'?'#bcaa62':undefined,x:reverse?length-v.x:v.x}))}});
   removeOwner(prefix,p.id);addFront({...p,part:'cuadra-'+p.id,owner:ownerName,points,facades,evidence:p.sources});
   const added=world.getObjectByName(ownerName);added.userData.fittedPlan=plan;added.userData.blockReview=packet.block;
   entry.batches.push({id:p.id,...compact(added,!!p.keepDetails)});entry.buildings.push({id:p.id,height:p.height,uncertainty:p.uncertainty,sources:p.sources,note:p.note});
  }
  for(const lot of packet.openLots||[]){
   removeOwner(lot.ownerPrefix,lot.id);
   const group=new Group();group.name=lot.ownerPrefix+' · recinto abierto';group.userData={buildingId:lot.id,frontageId:'cuadra-'+lot.id,openLot:true,fittedPlan:{points:lot.points,holes:[]}};world.add(group);
   const floor=extrude(shape(lot.points.map(([x,z])=>[x,-z])),.06);floor.rotateX(-Math.PI/2);
   mesh(floor,'#aaa49a',group,'Paramento · base del recinto').position.y=.05;
   for(const side of lot.walls){const a=lot.points[side.edge],b=lot.points[(side.edge+1)%lot.points.length];wall(group,a,b,lot.height,lot.color,side.bays,false,{clipBands:true});wallColliders(a,b,lot.height,lot.id);}
   entry.batches.push({id:lot.id,...compact(group)});entry.buildings.push({id:lot.id,height:lot.height,sources:lot.sources,note:lot.note,openLot:true});
  }
  const equipment=new Group();equipment.name='Cuadra · equipamiento · '+packet.block;world.add(equipment);
  const line=(a,b,y,h,d,color,name)=>{const dx=b[0]-a[0],dz=b[1]-a[1],m=block(equipment,(a[0]+b[0])/2,y,(a[1]+b[1])/2,Math.hypot(dx,dz),h,d,color,name);m.rotation.y=Math.atan2(-dz,dx);return m};
  if(packet.access){const e=packet.access,p=packet.buildings.find(p=>p.id===e.building),a=p.points[e.edge],b=p.points[(e.edge+1)%p.points.length],length=Math.hypot(b[0]-a[0],b[1]-a[1]),u=[(b[0]-a[0])/length,(b[1]-a[1])/length],normal=[-u[1],u[0]],at=(t,d)=>[a[0]+u[0]*t+normal[0]*d,a[1]+u[1]*t+normal[1]*d];
   for(let i=0;i<e.steps;i++){const y=(e.steps-i)*e.rise,d=(i+.5)*e.tread;line(at(e.center-e.width/2,d),at(e.center+e.width/2,d),.05+y/2,y,e.tread,'#a9aca4','Cuadra · peldaño de acceso')}
   const low=at(e.center-e.width/2,e.steps*e.tread),high=at(e.center-e.width/2,0);
   for(const [pt,base] of [[low,.05],[high,.05+e.steps*e.rise]])block(equipment,pt[0],base+.45,pt[1],.035,.9,.035,'#4d5960','Cuadra · apoyo de acceso');
   const rail=line(high,low,.95+e.steps*e.rise/2,.035,.035,'#4d5960','Cuadra · barandal de acceso');rail.rotation.z=-Math.atan(e.rise/e.tread);
   entry.equipment.push({id:'acceso-banco',steps:e.steps,source:e.source,dimensions:'visual estimate'});
  }
  if(packet.rail){const r=packet.rail,dx=r.b[0]-r.a[0],dz=r.b[1]-r.a[1],length=Math.hypot(dx,dz),a=[r.a[0]+dz/length*r.offset,r.a[1]-dx/length*r.offset],b=[r.b[0]+dz/length*r.offset,r.b[1]-dx/length*r.offset];
   for(const level of [.48,r.height]){const m=line(a,b,.195+level,.035,.035,r.color,'Cuadra · pasamanos');m.rotation.z=-Math.atan(.21/length)}
   for(let i=0;i<=6;i++){const t=i/6,x=a[0]+dx*t,z=a[1]+dz*t,base=.30-.21*t;block(equipment,x,base+r.height/2,z,.045,r.height,.045,r.color,'Cuadra · apoyo barandal')}
   // Closed at the upper landing only; the lower ramp approach stays open.
   line(r.a,a,.30+r.height,.035,.035,r.color,'Cuadra · retorno alto barandal');
   entry.equipment.push({id:'barandal-rampa',a,b,source:'c08-ne-foto.jpg',lowerEndOpen:true});
  }
  if(packet.fence){const f=packet.fence;
   for(let i=0;i<f.points.length-1;i++){const a=f.points[i],b=f.points[i+1],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    line(a,b,f.baseHeight/2,f.baseHeight,.16,'#c3bca5','Cuadra · murete');wallColliders(a,b,f.height,f.id);
    for(let d=0;d<=length;d+=2.4){const t=d/length;block(equipment,a[0]+(b[0]-a[0])*t,(f.height+f.baseHeight)/2,a[1]+(b[1]-a[1])*t,.045,f.height-f.baseHeight,.045,f.color,'Cuadra · poste de malla')}
    for(let y=f.baseHeight+.14;y<=f.height;y+=.20)line(a,b,y,.014,.014,f.color,'Cuadra · alambre horizontal');
    for(let d=.2;d<length;d+=.24){const t=d/length;block(equipment,a[0]+(b[0]-a[0])*t,(f.height+f.baseHeight)/2,a[1]+(b[1]-a[1])*t,.014,f.height-f.baseHeight,.014,f.color,'Cuadra · alambre vertical')}
   }entry.equipment.push({id:f.id,sources:f.sources});
  }
  for(const w of packet.walls||[]){const length=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]),bays=(w.bays||[]).map(v=>({...v,x:length-v.x}));wall(equipment,w.b,w.a,w.height,w.color,bays,false,{...w,clipBands:true});wallColliders(w.a,w.b,w.height,w.id,w.bays);entry.equipment.push({id:w.id,sources:w.sources,openings:w.bays?.filter(b=>b.open).length||0});}
  if(packet.heritage){const h=packet.heritage;removeOwner(h.ownerPrefix,'ISC-58');
   const z=x=>h.a[1]+(x-h.a[0])*(h.b[1]-h.a[1])/(h.b[0]-h.a[0]),point=x=>[x,z(x)];
   const sections=[{a:h.a,b:point(h.westEndX),height:h.westHeight,color:'#c9967a',type:'west'},{a:point(h.westEndX),b:point(h.redStartX),height:h.height,color:'#c4b99e',type:'center'},{a:point(h.redStartX),b:h.b,height:h.height,color:'#aa5256',type:'red'}];
   // The facade proportions and architectural features below are interpreted from
   // c30-obregon-isc-20261008.jpg (Street View, December 2023); not measured.
   for(const s of sections){
    const length=Math.hypot(s.b[0]-s.a[0],s.b[1]-s.a[1]);
    const count=s.type==='center'?4:5;
    const bays=Array.from({length:count},(_,i)=>({x:length*(i+.5)/count,
     w:s.type==='center'?3.7:s.type==='west'?3.4:3.15,
     h:s.type==='center'?5.2:4.1,b:.2,open:s.type==='center',noBars:s.type==='center',
     ...(s.type==='red'?{rect:true,frameColor:'#e3dfcf'}:{})}));
    if(s.type==='red')Object.assign(bays[2],{w:3.8,h:5.1,door:true});
    if(s.type==='west')bays.push(...Array.from({length:5},(_,i)=>({x:length*(i+.5)/5,w:3.4,h:2.3,b:6.6})));
    const details={clipBands:true,bands:[],fins:[]};
    if(s.type==='west'){
     details.bands.push({y:5.65,h:.22,d:.26,color:'#e0dac5'},{y:6.05,h:.12,d:.24,color:'#e0dac5'},
      {y:7.12,h:.08,d:.28,color:'#e0dac5'});
     // The upper balcony rail is in front of, not a substitute for, the arches.
     for(let x=.25;x<length;x+=.42)details.fins.push({x,b:6.64,h:.48,w:.055,d:.28,color:'#ded6c0'});
    }
    if(s.type==='red'){
     // White vertical pilasters, individual surrounds and the low roof parapet
     // distinguish the red wing from a generic row of arched openings.
     for(let i=0;i<=count;i++)details.fins.push({x:length*i/count,b:.25,h:6.35,w:.28,d:.18,color:'#e5e2d8'});
     details.bands.push({y:6.5,h:.2,d:.28,color:'#e4e0d7'},{y:7.15,h:.17,d:.32,color:'#e4e0d7'});
    }
    if(s.type==='center'){
     details.bands.push({y:6.62,h:.17,d:.3,color:'#e0dac8'},{y:7.08,h:.18,d:.34,color:'#e0dac8'});
     for(let x=.35;x<length;x+=.62)details.fins.push({x,b:7.08,h:.36,w:.08,d:.19,color:'#e0dac8'});
    }
    wall(equipment,s.a,s.b,s.height,s.color,bays,true,details);
    wallColliders(s.a,s.b,s.height,'C30-ISC-'+s.type,bays);
    if(s.type==='west'){
     const backA=[s.a[0],s.a[1]-8],backB=[s.b[0],s.b[1]-8],roof=shape([s.a,s.b,backB,backA].map(([x,z])=>[x,-z])),g=extrude(roof,.12);g.rotateX(-Math.PI/2);const cap=mesh(g,'#c0b49e',equipment,'Cuadra · cubierta del segundo nivel');cap.position.y=s.height;
     wall(equipment,s.b,backB,s.height,s.color);wall(equipment,backB,backA,s.height,s.color);wall(equipment,backA,s.a,s.height,s.color);
    }
   }entry.buildings.push({id:'ISC-58',sources:[h.source],frontHeights:[h.westHeight,h.height,h.height],note:h.note});
  }
  entry.batches.push({id:'equipamiento',...compact(equipment)});result.blockDetails.push(entry);
 }
 for(const cut of PARAMENTO_SIDEWALKS){
  const m=world.getObjectByName('Ajuste visual · sidewalk · '+cut.id);if(!m)throw Error('Paramento: sidewalk missing '+cut.id);
  const old=m.geometry,g=new old.constructor(),a=old.attributes.position,positions=[];
  for(let i=0;i<cut.triangles.length;i+=2)positions.push(cut.triangles[i],.09,cut.triangles[i+1]);
  g.setAttribute('position',new a.constructor(positions,3));g.computeVertexNormals();m.geometry=g;old.dispose();
 }
 result.obregonAprox=applyObregonApprox(world);
 // Surface details for Chihuahua 66: preserve the original roof and courtyard.
 // The panels are visual approximations, not measured openings.
 const chihuahua=world.getObjectByName('Planta física · A3-08');
 if(!chihuahua?.geometry?.parameters?.shapes)throw Error('Chihuahua: falta huella A3-08');
 const points=ring(chihuahua.geometry.parameters.shapes),a=points[2],b=points[3],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),ux=dx/length,uz=dz/length,n=[uz,-ux];
 for(const q of [{x:3.8,w:4.2,b:.05,h:2.75,c:'#99836a'},{x:8.9,w:1.6,b:.05,h:2.65,c:'#303638'},{x:13.5,w:3.4,b:.05,h:2.8,c:'#343b38'},{x:19,w:1.3,b:.3,h:2.1,c:'#424948'},{x:23,w:2.3,b:1.85,h:1.25,c:'#3b4340'}]){
  if(q.x-q.w/2<0||q.x+q.w/2>length||q.b+q.h>chihuahua.userData.heightMeters)throw Error('Chihuahua: vano fuera del frente');
  const m=block(world,a[0]+ux*q.x+n[0]*.10,q.b+q.h/2+.05,a[1]+uz*q.x+n[1]*.10,q.w,q.h,.13,q.c,'Paramento · cierre aproximado de Chihuahua 66');m.rotation.y=Math.atan2(-dz,dx);m.userData.liteStructural=true;
 }
 result.chihuahuaAprox={id:'A3-08',source:'recorrido/77G-ooH2G6Dx2QbnJ20OAQ.jpg',courtPreserved:true,note:'Vanos y altura estimados desde panorama; calle y número visibles en fachada.'};
 world.updateMatrixWorld(true);world.userData.paramento=result;return result;
}
