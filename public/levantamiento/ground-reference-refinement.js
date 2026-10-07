import { GROUND_REFERENCE, RETIRED_COLLIDERS } from './ground-reference-data.js?v=7c61c41bf114';

// The map imagery owns public ground. Old procedural widths are historical
// hypotheses, not independently surveyed pavement/sidewalk boundaries.
export function applyGroundReference(world, colliders, R) {
  if (world.userData.groundReference) return world.userData.groundReference;
  world.updateMatrixWorld(true);
  const retired = [], kept = [];
  function retire(o, reason) {
    let meshes = 0; o.traverse(c => { if (c.isMesh) meshes++; });
    const b = new R.Box3().setFromObject(o);
    retired.push({owner:o.name || '(unnamed procedural object)', reason, meshes,
      bounds:b.isEmpty()?null:{min:b.min.toArray(),max:b.max.toArray()}});
    o.removeFromParent();
  }
  for (const o of [...world.children]) {
    if (/^(PH-01 ↔ PH-02|Cuadra sur de Obregón|Recorridos Amalaya · calzadas|Calzadas · lote de 50)/.test(o.name)) {
      retire(o,'Unverified procedural street/sidewalk widths or hypothetical furniture');
    } else if (o.name.startsWith('Plaza Hidalgo · PH-01')) {
      for (const c of [...o.children]) {
        if (/^(Huella del Instituto|PH-01 · Instituto)/.test(c.name)) kept.push(c);
        else retire(c,'Plaza ground and objects use interpreted dimensions/positions');
      }
    } else if (o.name.startsWith('Bloque oriental')) {
      for (const c of [...o.children]) {
        if (/^(La Barra Hidalgo|Club Obregón|21 Av\. Obregón|ESQUINA |EB-01 · punto|Punto contextual)/.test(c.name)) kept.push(c);
        else retire(c,'Generated eastern-block street, sidewalk or furniture lacks a traced ground boundary');
      }
    } else if (/^(PH-01 · (banqueta|paseo|borde)|Ronda 02 ·|Ronda 03 ·)/.test(o.name)) {
      retire(o,'Legacy pavement patch derived from provisional road/sidewalk geometry');
    } else if (/^(Sector Amalaya|OB-01 · cubierta|OB-02 · fachada|Lámina completa)/.test(o.name)) kept.push(o);
  }
  // Standalone walker also has a broad, flat OSM context-street overlay.
  const contextRoads=[];
  world.traverse(o=>{if(o.name.startsWith('Ejes y calles de contexto'))contextRoads.push(o)});
  for(const o of contextRoads)retire(o,'OSM centerlines are not pavement polygons');
  const colliderKey=b=>[...b.min.toArray(),...b.max.toArray()].map(n=>n.toFixed(5)).join(',');
  const keys=new Set(RETIRED_COLLIDERS);let removedColliders=0;
  for(let i=colliders.length-1;i>=0;i--)if(keys.has(colliderKey(colliders[i]))){colliders.splice(i,1);removedColliders++;}
  const result={version:GROUND_REFERENCE.version,ground:'georeferenced imagery',retired,removedColliders,
    boundaryStatus:'Not surveyed; unverified procedural public ground retired',mapOwnsGround:false};
  world.userData.groundReference=result;
  // Map mode already has this exact imagery below its buildings. Only the
  // standalone walking viewer needs a textured ground surface.
  if(typeof Image!=='undefined') installWalkingGround(world,kept,R,result);
  world.updateMatrixWorld(true);
  return result;
}

function installWalkingGround(world,kept,R,status){
  let template;
  for(const root of kept)root.traverse(o=>{if(!template&&o.isMesh&&!o.isInstancedMesh&&!Array.isArray(o.material)&&o.material.map)template=o});
  if(!template)throw Error('Ground reference: missing native texture/mesh template');
  const image=new Image();image.decoding='async';
  image.onload=()=>{
    if(status.mapOwnsGround||status.disposed)return;
    // Native constructors from this viewer's own Three runtime, never a second engine.
    let geometryPrototype=Object.getPrototypeOf(template.geometry);
    while(geometryPrototype&&!Object.hasOwn(geometryPrototype,'setAttribute'))geometryPrototype=Object.getPrototypeOf(geometryPrototype);
    if(!geometryPrototype)throw Error('Ground reference: native BufferGeometry missing');
    const geometry=new geometryPrototype.constructor(),Attr=template.geometry.attributes.position.constructor;
    const [west,south,east,north]=GROUND_REFERENCE.bounds;
    const x=lng=>(lng-GROUND_REFERENCE.origin.lon)*97200;
    const z=lat=>(GROUND_REFERENCE.origin.lat-lat)*110950;
    geometry.setAttribute('position',new Attr([x(west),-.025,z(north),x(west),-.025,z(south),x(east),-.025,z(south),x(east),-.025,z(north)],3));
    geometry.setAttribute('uv',new Attr([0,1,0,0,1,0,1,1],2));
    geometry.setIndex([0,1,2,0,2,3]);geometry.computeVertexNormals();
    let Texture=template.material.map.constructor;
    if(template.material.map.isDataTexture||template.material.map.isCanvasTexture)Texture=Object.getPrototypeOf(Texture.prototype).constructor;
    const texture=new Texture(image);texture.colorSpace='srgb';texture.needsUpdate=true;
    const material=template.material.clone();
    for(const key of Object.keys(material))if(material[key]?.isTexture)material[key]=null;
    material.userData={source:'Esri World Imagery',surface:'georeferenced-ground'};
    material.color.set('#000000');material.emissive.set('#ffffff');material.emissiveMap=texture;
    material.emissiveIntensity=1;material.toneMapped=false;material.transparent=false;material.opacity=1;
    const mesh=new template.constructor(geometry,material);mesh.name='Suelo de referencia · Esri World Imagery';
    mesh.userData.groundReference=true;mesh.castShadow=mesh.receiveShadow=false;
    // Adding only once loaded also invalidates the walker's static render cache.
    world.add(mesh);status.loaded=true;
  };
  image.onerror=()=>{status.imageError=true};
  // Let the map adapter claim its own ground before requesting the walker's image.
  queueMicrotask(()=>{setTimeout(()=>{if(!status.mapOwnsGround&&!status.disposed)image.src=new URL(GROUND_REFERENCE.image,import.meta.url).href+'?v='+GROUND_REFERENCE.imageSha256.slice(0,12)},0)});
}
