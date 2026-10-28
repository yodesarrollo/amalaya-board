// Frentes sobre Obregón interpretados con panoramas de la ruta R-001.
// Dimensiones y número de vanos son estimaciones visuales, no mediciones.
// Los paños se añaden a las mallas existentes: sus patios no se rellenan.
export const OBREGON_APROXIMADO = [
 {id:'C2-06',edge:0,source:'recorrido/rgjklAAPPcOxEB4RX95K1w.jpg',note:'Paño claro con portón blanco junto al edificio clásico; proporciones estimadas.',
  panels:[{x:4,w:3.4,b:.2,h:2.4,c:'#bbc4c4'},{x:10,w:4.0,b:0,h:2.85,c:'#d3d6cf'},{x:16,w:2.4,b:.25,h:2.2,c:'#8c9695'}],
  bands:[{y:3.35,h:.13,c:'#a6aeaa'}]},
 {id:'C2-07',edge:0,source:'recorrido/kvThuvZHnPY0bB-quNNqWg.jpg',note:'Frente cálido, ingreso oscuro y ventanal visto al poniente del corredor; proporciones estimadas.',
  panels:[{x:4,w:2,b:0,h:3,c:'#313838'},{x:8,w:2.3,b:.2,h:2.4,c:'#303a39'},{x:14,w:1.7,b:.2,h:2.6,c:'#343c3c'},{x:20,w:1.7,b:.2,h:2.6,c:'#343c3c'}],
  bands:[{y:4.28,h:.16,c:'#886b5f'}]}
];

export function applyObregonApprox(world){
 if(world.userData.obregonAprox)return world.userData.obregonAprox;
 let template;world.traverse(o=>{if(!template&&o.isMesh&&o.geometry?.type==='BoxGeometry'&&!Array.isArray(o.material))template=o;});
 if(!template)throw Error('Obregón: falta plantilla de geometría');
 const Mesh=template.constructor,Box=template.geometry.constructor,report=[];
 const mats=new Map();const mat=c=>{if(!mats.has(c)){const m=template.material.clone();for(const k of Object.keys(m))if(m[k]?.isTexture)m[k]=null;m.color.set(c);m.transparent=false;m.opacity=1;m.side=2;mats.set(c,m);}return mats.get(c)};
 for(const p of OBREGON_APROXIMADO){
  const owner=world.getObjectByName('Planta física · '+p.id);if(!owner?.geometry?.parameters?.shapes)throw Error('Obregón: falta huella '+p.id);
  const ring=owner.geometry.parameters.shapes.getPoints().map(v=>[v.x,-v.y]);if(ring.length>1&&Math.hypot(ring[0][0]-ring.at(-1)[0],ring[0][1]-ring.at(-1)[1])<1e-6)ring.pop();
  const a=ring[p.edge],b=ring[(p.edge+1)%ring.length],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len;
  // The exterior normal is chosen by pointing from the building centroid toward the street (north).
  const n1=[uz,-ux],normal=n1[1]<0?n1:[-n1[0],-n1[1]],height=owner.userData.heightMeters;
  const add=(x,w,y,h,color,label,depth=.12)=>{
   if(x-w/2<0||x+w/2>len||y-h/2<0||y+h/2>height+.1)throw Error('Obregón: elemento fuera de fachada '+p.id);
   const m=new Mesh(new Box(w,h,depth),mat(color));m.position.set(a[0]+ux*x+normal[0]*.09,y+.05,a[1]+uz*x+normal[1]*.09);m.rotation.y=Math.atan2(-dz,dx);m.name='Frente aproximado · '+label;m.userData.liteStructural=true;world.add(m);
  };
  for(const q of p.panels)add(q.x,q.w,q.b+q.h/2,q.h,q.c,'vano');
  for(const q of p.bands)add(len/2,len-.05,q.y,q.h,q.c,'cornisa');
  report.push({id:p.id,source:p.source,edge:p.edge,height,approximate:true,note:p.note});
 }
 world.userData.obregonAprox={buildings:report,method:'Elementos visuales sobre la huella existente; patios preservados',landSurvey:false};
 return world.userData.obregonAprox;
}
