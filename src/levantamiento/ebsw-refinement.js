/** EB-SW. Existing model dimensions remain hypotheses. P08/P09 govern only observed morphology. */
import {footprintColliderCells} from './isc58-refinement.js?v=76eca0365d35'
const named=(root,prefix)=>root.children.find(o=>o.name.startsWith(prefix))
function supportWalk(east,side,R){
 const positions=[],uv=[],records=[]
 east.updateMatrixWorld(true)
 for(const tiles of east.children.filter(o=>o.isInstancedMesh&&o.name.startsWith('Baldosas de banqueta'))){
  const bounds=new R.Box3().setFromObject(tiles)
  if(!(bounds.min.x<80&&bounds.max.x>180&&bounds.min.z>0&&bounds.max.z<18))continue
  if((bounds.min.z>8?'south':'north')!==side)continue
  const matrix=tiles.matrix.clone()
  for(let i=0;i<tiles.count;i++){
   tiles.getMatrixAt(i,matrix);const center=new R.Vector3(0,0,0).applyMatrix4(matrix)
   if(center.x<72||center.x>124)continue
   const corners=[[-.47,-.47],[.47,-.47],[.47,.47],[-.47,.47]].map(([x,z])=>new R.Vector3(x,.0355,z).applyMatrix4(matrix))
   for(const k of [0,2,1,0,3,2]){const p=corners[k];positions.push(p.x,p.y,p.z);uv.push(p.x/2.2,p.z/2.2)}
   records.push({instance:i,center:center.toArray()})
  }
 }
 if(!records.length)throw Error('EB-SW: no paving found for '+side)
 const geometry=new R.BufferGeometry();geometry.setAttribute('position',new R.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new R.Float32BufferAttribute(uv,2));geometry.computeVertexNormals()
 const material=R.createProceduralMaterial('#aaa494','concrete',{roughness:1});for(const k of ['map','normalMap','roughnessMap'])if(material[k])material[k].repeat.set(1,1)
 const mesh=new R.Mesh(geometry,material);mesh.name=`EB-SW · base bajo juntas · ${side}`;mesh.receiveShadow=true;mesh.userData={status:'technical-only',measured:false,inheritedTileTop:.1475,baseTop:.1455,source:'existing tile grid',scopeX:[72,124]};east.add(mesh)
 return{side,tiles:records.length,baseTop:.1455,tileTop:.1475,physicalContinuity:'unverified',records}
}
function bodyPolygon(body,R){return body.geometry.parameters.shapes.getPoints().slice(0,-1).map(p=>{const v=new R.Vector3(p.x,0,-p.y).applyMatrix4(body.matrixWorld);return{x:v.x,z:v.z}})}
function repairBodyColliders(groups,colliders,R){
 const result={removed:0,added:0}
 for(const group of groups)for(const body of group.children.filter(o=>o.geometry?.type==='ExtrudeGeometry')){
  const points=bodyPolygon(body,R),height=body.geometry.parameters.options.depth,old=new R.Box3(new R.Vector3(Math.min(...points.map(p=>p.x)),0,Math.min(...points.map(p=>p.z))),new R.Vector3(Math.max(...points.map(p=>p.x)),height+.8,Math.max(...points.map(p=>p.z)))).expandByScalar(.35)
  const index=colliders.findIndex(b=>b.min.distanceTo(old.min)<.003&&b.max.distanceTo(old.max)<.003)
  if(index<0)throw Error('EB-SW: inherited collider not found for '+body.name)
  colliders.splice(index,1);result.removed++
  for(const c of footprintColliderCells(points,.25)){colliders.push(new R.Box3(new R.Vector3(c.minX,.06,c.minZ),new R.Vector3(c.maxX,height+.06,c.maxZ)));result.added++}
 }
 return result
}
function arch(path,x,bottom,width,height){const radius=width/2,spring=height-radius;path.moveTo(x-radius,bottom);path.lineTo(x-radius,bottom+spring);path.quadraticCurveTo(x-radius,bottom+height,x,bottom+height);path.quadraticCurveTo(x+radius,bottom+height,x+radius,bottom+spring);path.lineTo(x+radius,bottom);path.closePath()}
function clubFront(club,colliders,R){
 const wings=club.children.filter(o=>o.geometry?.type==='ExtrudeGeometry'),left=bodyPolygon(wings[0],R)[1],right=bodyPolygon(wings[1],R)[0],dx=right.x-left.x,dz=right.z-left.z,length=Math.hypot(dx,dz),height=wings[0].geometry.parameters.options.depth
 const front=new R.Group();front.name='EB-SW · frente Club · interpretación P09 sobre ancho heredado';front.position.set((left.x+right.x)/2,.06,(left.z+right.z)/2);front.rotation.y=Math.atan2(-dz,dx);club.add(front)
 const openings=[{x:-length*.22,bottom:0,width:2.8,height:4.45,role:'closed-portal'},{x:length*.23,bottom:.8,width:1.75,height:3.1,role:'grilled-window'}]
 const shape=new R.Shape();shape.moveTo(-length/2,0);shape.lineTo(length/2,0);shape.lineTo(length/2,height);shape.lineTo(-length/2,height);shape.closePath()
 for(const bay of openings){const hole=new R.Path();arch(hole,bay.x,bay.bottom,bay.width,bay.height);shape.holes.push(hole)}
 const paint=R.createProceduralMaterial('#a34840','stucco',{roughness:.95}),trim=R.createProceduralMaterial('#e6dfc9','stucco',{roughness:.92}),metal=R.createProceduralMaterial('#292d30','concrete',{roughness:.84,metalness:.03})
 paint.side=2;trim.side=2;metal.side=2
 const field=new R.Mesh(new R.ShapeGeometry(shape,24),paint);field.name='EB-SW · muro con dos huecos arqueados reales';field.castShadow=field.receiveShadow=true;front.add(field)
 const addBox=(name,w,h,d,x,y,z,mat)=>{const m=new R.Mesh(new R.BoxGeometry(w,h,d),mat);m.name=name;m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;front.add(m);return m}
 for(const bay of openings){
  const ring=new R.Shape();arch(ring,bay.x,bay.bottom-.04,bay.width+.4,bay.height+.3);const hole=new R.Path();arch(hole,bay.x,bay.bottom,bay.width,bay.height);ring.holes.push(hole)
  const frame=new R.Mesh(new R.ShapeGeometry(ring,24),trim);frame.name='EB-SW · moldura propia alrededor del vano';frame.position.z=.045;front.add(frame)
  const paneShape=new R.Shape();arch(paneShape,bay.x,bay.bottom,bay.width,bay.height);const pane=new R.Mesh(new R.ShapeGeometry(paneShape,24),metal);pane.name='EB-SW · '+bay.role+' · cierre retranqueado';pane.position.z=-.22;front.add(pane)
  const outline=paneShape.getPoints(24),pos=[]
  for(let i=0;i<outline.length-1;i++){const a=outline[i],b=outline[i+1];for(const p of [[a.x,a.y,0],[b.x,b.y,0],[a.x,a.y,-.24],[b.x,b.y,0],[b.x,b.y,-.24],[a.x,a.y,-.24]])pos.push(...p)}
  const g=new R.BufferGeometry();g.setAttribute('position',new R.Float32BufferAttribute(pos,3));g.computeVertexNormals();const reveal=new R.Mesh(g,trim);reveal.name='EB-SW · jambas e intradós con profundidad';front.add(reveal)
  const straight=bay.height-bay.width/2
  if(bay.role==='grilled-window')for(let i=-3;i<=3;i++)addBox('EB-SW · barrotes dentro del vano',.045,straight-.06,.045,bay.x+i*bay.width/8,bay.bottom+straight/2,-.12,metal)
  else{addBox('EB-SW · división del portón cerrado',.065,straight,.06,bay.x,straight/2,-.15,trim)}
 }
 addBox('EB-SW · cornisa del frente interpretado',length,.22,.34,0,height-.16,.02,trim)
 front.updateWorldMatrix(true,true)
 const polygon=[[-length/2,-.24],[length/2,-.24],[length/2,.06],[-length/2,.06]].map(([x,z])=>{const p=new R.Vector3(x,0,z).applyMatrix4(front.matrixWorld);return{x:p.x,z:p.z}})
 for(const c of footprintColliderCells(polygon,.035))colliders.push(new R.Box3(new R.Vector3(c.minX,.06,c.minZ),new R.Vector3(c.maxX,height+.06,c.maxZ)))
 front.userData={observed:'P09: continuous red street elevation, arched closed portal and window',dimensions:'hypotheses fitted to inherited model gap; no parcel measurement',openings,depth:.24,windowRole:'grille closes opening',portalRole:'closed as in reference',adjacentYellowFront:'not attributed to Club Obregon'}
 return{gapClosedMeters:length,openings:2,measured:false,courtyard:'retained open to sky',alignment:'inherited; not verified'}
}
function finish(groups,R){
 let meshes=0,materials=0;const cache=new Map()
 for(const [group,color] of groups){group.traverse(mesh=>{
  if(!mesh.isMesh||Array.isArray(mesh.material))return
  const old=mesh.material,key=old.uuid+color;let mat=cache.get(key)
  if(!mat){mat=old.clone();if(old.userData.surface==='stucco'&&((old.color.g>old.color.r*1.04)||(old.color.r>old.color.g&&old.color.g<.65)))mat.color.set(color)
   for(const k of ['map','normalMap','roughnessMap'])if(old[k]){mat[k]=old[k].clone();mat[k].repeat.set(1,1);mat[k].needsUpdate=true}
   mat.userData={...old.userData,photographic:false,ebSwMetricUv:true,uvPeriodMeters:2.2};cache.set(key,mat);materials++}
  mesh.material=mat;const g=mesh.geometry.clone(),p=g.getAttribute('position'),n=g.getAttribute('normal'),uv=[]
  for(let i=0;i<p.count;i++){const ax=Math.abs(n?.getX(i)||0),ay=Math.abs(n?.getY(i)||0),az=Math.abs(n?.getZ(i)||0);uv.push((ax>az?p.getZ(i):p.getX(i))/2.2,(ay>.7?p.getZ(i):p.getY(i))/2.2)}
  g.setAttribute('uv',new R.Float32BufferAttribute(uv,2));mesh.geometry=g;meshes++
 })}
 return{meshes,materials,uvPeriodMeters:2.2,source:'P08/P09: blue Barra, red street front, pale mouldings',colors:'interpreted from panorama; not field colorimetry'}
}
export function applyEbSw(world,colliders,R,stage=9){
 if(world.userData.ebSwRefinement){if(world.userData.ebSwRefinement.stage!==stage)throw Error('Rebuild world before changing stage');return world.userData.ebSwRefinement}
 const east=named(world,'Bloque oriental'),barra=east&&named(east,'La Barra Hidalgo'),club=east&&named(east,'Club Obregón')
 if(!east||!barra||!club)throw Error('EB-SW: existing owners missing')
 world.updateMatrixWorld(true);const stats={version:'ebsw-technical-1',stage,confidence:'provisional',measured:false,parcelBoundaries:'unverified'}
 if(stage>=3)stats.south=supportWalk(east,'south',R)
 if(stage>=4)stats.north=supportWalk(east,'north',R)
 if(stage>=7)stats.colliders=repairBodyColliders([barra,club],colliders,R)
 if(stage>=8)stats.facade=clubFront(club,colliders,R)
 if(stage>=9)stats.finish=finish([[barra,'#27558e'],[club,'#a34840']],R)
 world.userData.ebSwRefinement=stats;return stats
}
