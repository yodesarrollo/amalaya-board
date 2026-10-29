import {createCollisionIndex,safeSpawn} from './walk-navigation.js';
// Restore the sector omitted by the preserved viewer using its already loaded OSM context.
const local=p=>({x:(p.lon+110.9547151)*97200,z:(29.076115-p.lat)*110950});
export function ensureViewerSector(world,R){if(world.children.some(o=>o.name.startsWith('Sector Amalaya')))return;let template;world.traverse(o=>{if(!template&&o.geometry?.type==='ExtrudeGeometry'&&o.geometry.parameters.shapes?.getPoints)template=o});if(!template)throw Error('Round 01: sector source template missing');const sector=new (world.children.find(o=>o.name.startsWith('Bloque oriental')).constructor)();sector.name='Sector Amalaya · huellas OSM conservadas, alturas pendientes';sector.userData.catalog=[];for(const [i,id] of [499759728,499760720,1533334038].entries()){const way=R.osmContext?.elements.find(v=>v.type==='way'&&v.id===id&&v.tags?.building);if(!way||way.geometry.length<4)throw Error('Round 01: sector OSM source missing '+id);const pts=way.geometry.slice(0,-1).map(local),height=id===1533334038?8.5:6.2,shape=new R.Shape();shape.moveTo(pts[0].x,-pts[0].z);for(const p of pts.slice(1))shape.lineTo(p.x,-p.z);shape.closePath();const geometry=new template.geometry.constructor(shape,{depth:height,bevelEnabled:false});geometry.rotateX(-Math.PI/2);const mats=[R.createProceduralMaterial('#a49e90','concrete',{roughness:1}),R.createProceduralMaterial(['#b6aa94','#d2c5ae','#c3beae'][i],'stucco',{roughness:.98})];const body=new R.Mesh(geometry,mats);body.name='Huella OSM '+id+' · altura provisional, sin fachada restituida';body.position.y=.04;body.castShadow=body.receiveShadow=true;body.userData={osmWayId:id,footprintStatus:'OSM',heightStatus:'provisional',heightMeters:height};sector.add(body);sector.userData.catalog.push({wayId:id,footprintStatus:'OSM',heightStatus:'provisional',heightMeters:height});}world.add(sector);}

// Preserve the photo anchor, but enter walking mode at the nearest free point.
export function enterBoardPoint({camera,character,point,previous,yaw,mode,colliders,bounds,notify}) {
 if(mode!=='walk')return;
 const original={x:point.x,y:.08,z:point.z};
 const safe=safeSpawn(createCollisionIndex(colliders),original,bounds);
 if(!safe){camera.position.copy(previous);notify('No hay paso libre cerca de este punto. Conservamos tu posición anterior.');return;}
 if(character)character.enter(camera.position.clone().set(safe.x,safe.y,safe.z),yaw);
 else camera.position.set(safe.x,camera.position.y,safe.z);
 if(Math.hypot(safe.x-original.x,safe.z-original.z)>.1)notify('Punto de caminata ajustado al paso libre más cercano; la referencia fotográfica conserva su posición.');
}
