import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {sheetHash} from './preparar-lamina.mjs';
import {SHEET_PLANS} from '../public/levantamiento/sheet-plan-data.js';
import {applySheetPlan} from '../public/levantamiento/sheet-plan-refinement.js';
import {applyGroundReference} from '../public/levantamiento/ground-reference-refinement.js';
import {GROUND_REFERENCE,RETIRED_COLLIDERS} from '../public/levantamiento/ground-reference-data.js';
import {STREET_BATCH50} from '../public/levantamiento/street-batch50-data.js';
import {applyStreetBatch50} from '../public/levantamiento/street-batch50-refinement.js';
import {applyIsc58,footprintColliderCells} from '../public/levantamiento/isc58-refinement.js';
import {applyEbSw} from '../public/levantamiento/ebsw-refinement.js';
import {applyPlanRound} from '../public/levantamiento/plantas-refinement.js';
import {applyStreetRound} from '../public/levantamiento/calzadas-refinement.js';
import {applySidewalkRound} from '../public/levantamiento/banquetas-refinement.js';
import {applyPlanReview} from '../public/levantamiento/plan-review-refinement.js';
const root='public/levantamiento';
const strip=s=>s.replace(/^import[^\n]*\n/gm,'').replace(/\nimport[^\n]*\n/gm,'').replace(/export \{[^\n]+\};/,'');
const sheet=strip(await readFile(root+'/sheet-plan-refinement.js','utf8')).replace('export function applySheetPlan','function applySheetPlan').replace('applyGroundReference(world, colliders, R);','').replace('applyVisualFit(world, colliders, R);','').replace('applyParamento(world, colliders, R);','');
const baseSheet=new Function('SHEET_PLANS','footprintColliderCells','applyStreetBatch50',sheet+';return applySheetPlan;')(SHEET_PLANS,footprintColliderCells,applyStreetBatch50);
const source=await readFile(root+'/world.js','utf8');
const R=new Function('applyIsc58Refinement','applyEbSwRefinement','applyPlanRoundRefinement','applyStreetRoundRefinement','applySidewalkRoundRefinement','applyPlanReviewRefinement','applySheetPlanRefinement',strip(source)+';return {createWorld:Fp,Vector3:U,Box3:Zt,prepare:Ip,optimize:Up};')(applyIsc58,applyEbSw,applyPlanRound,applyStreetRound,applySidewalkRound,applyPlanReview,baseSheet);
const oldFetch=globalThis.fetch;let world;
try{globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await readFile(root+'/'+url))});world=await R.createWorld('',undefined,'pilot',{overview:true});}finally{globalThis.fetch=oldFetch;}
world.updateMatrixWorld(true);
const before=[];let beforeMeshes=0,beforeInstances=0;
world.traverse(o=>{if(o.isMesh){beforeMeshes++;beforeInstances+=o.isInstancedMesh?o.count:1;}before.push({o,geometry:o.geometry,material:o.material,matrix:o.matrixWorld.clone()})});
const colliderKey=b=>[...b.min.toArray(),...b.max.toArray()].map(n=>n.toFixed(5)).join(',');
const keys=new Set(RETIRED_COLLIDERS),beforeColliders=[...world.userData.navigationColliders];
const roadSegments=[];
world.traverse(o=>{if(o.isMesh&&/calzada|^Lote 50 ·|^Calle Obregón · perfil/i.test(o.name)&&!/no es una calzada|Canal de escurrimiento|Banda de transición|^PH-01/i.test(o.name)){
 const box=new R.Box3().setFromObject(o);
 roadSegments.push({id:o.userData.streetRound?.id||o.userData.streetBatch50?.id||'G'+String(roadSegments.length+1).padStart(2,'0'),owner:o.name,bounds:{min:box.min.toArray(),max:box.max.toArray()},source:o.userData.streetRound||(o.userData.streetBatch50?{...Object.fromEntries(Object.entries(STREET_BATCH50.entries.find(e=>e.id===o.userData.streetBatch50)||{}).filter(([k])=>['id','widthMeters','uncertaintyMeters','reference','samplePixels'].includes(k))),method:STREET_BATCH50.method}:null)||{method:'Inherited procedural strip, road centerline and assumed width; no independent pavement boundary'},discrepancy:'No independently traced boundary registered against the board imagery',action:'Retired model overlay; use the existing map ground'});
}});
const result=applyGroundReference(world,world.userData.navigationColliders,R);
assert.equal(applyGroundReference(world,world.userData.navigationColliders,R),result,'idempotent cleanup');
world.updateMatrixWorld(true);const remaining=new Set();let afterMeshes=0,afterInstances=0;
world.traverse(o=>{remaining.add(o);if(o.isMesh){afterMeshes++;afterInstances+=o.isInstancedMesh?o.count:1;}});
for(const old of before)if(remaining.has(old.o)){assert.equal(old.o.geometry,old.geometry);assert.equal(old.o.material,old.material);assert(old.o.matrixWorld.equals(old.matrix),'No building or landmark transform changes');}
for(const plan of SHEET_PLANS)assert(world.getObjectByName('Planta física · '+plan.id),'Building retained '+plan.id);
for(const name of ['OB-01 · cubierta','OB-02 · fachada','La Barra Hidalgo','Club Obregón','21 Av. Obregón','ESQUINA NOROESTE','ESQUINA NORESTE','ESQUINA SURESTE','Huella del Instituto'])assert(before.some(x=>remaining.has(x.o)&&x.o.name.startsWith(name)),name+' preserved');
for(const segment of roadSegments)assert(!world.getObjectByName(segment.owner),'Retire each road owner, not only one overlapping layer');
assert.equal(world.userData.navigationColliders.length,beforeColliders.filter(b=>!keys.has(colliderKey(b))).length);
assert.deepEqual(world.userData.navigationColliders,beforeColliders.filter(b=>!keys.has(colliderKey(b))),'Only identified hypothetical street-furniture colliders removed');
assert.equal(result.removedColliders,17);
assert.equal(sheetHash(await readFile(root+'/'+GROUND_REFERENCE.image)),GROUND_REFERENCE.imageSha256);
// Geographic correspondence: the map transform uses the same WGS84 origin and scale.
const [west,south,east,north]=GROUND_REFERENCE.bounds,n=2**GROUND_REFERENCE.tileZoom;
const tileX=lon=>(lon+180)/360*n;
const tileY=lat=>(1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*n;
const expected=GROUND_REFERENCE.tileBounds;
for(const [actual,want] of [[tileX(west),expected[0]],[tileY(north),expected[1]],[tileX(east),expected[2]],[tileY(south),expected[3]]])assert(Math.abs(actual-want)<1e-8,'Exact map tile coordinate');
const audit={version:result.version,previousWorldSha256:'b589e6acf74ad7ebc55658df314d14b3ee6ecd7527e5261db0ae427cd8134386',worldSha256:sheetHash(source),reference:'ground-reference.json',source:'Esri World Imagery — same tile provider as the main board',scope:'All public-ground generators in the assembled board model; historic hypotheses retained in source, not drawn as surveyed boundaries',roadSegments,beforeMeshes,afterMeshes,beforeInstances,afterInstances,removedColliders:result.removedColliders,buildingsPreserved:139,retiredGroups:Object.entries(result.retired.reduce((groups,e)=>{(groups[e.reason]??=[]).push(e);return groups;},{})).map(([reason,items])=>({reason,objects:items.length,meshes:items.reduce((n,e)=>n+e.meshes,0)})),limits:['No ground survey or independent curb-height measurements.','Retiring unsupported model strips is not confirmation of old measured-width claims.','Building geometry remains unchanged, including its previously declared uncertainty.']};
if(process.argv.includes('--write'))await writeFile(root+'/ground-audit.json',JSON.stringify(audit,null,2)+'\n');
else {const saved=JSON.parse(await readFile(root+'/ground-audit.json'));assert.equal(saved.worldSha256,audit.worldSha256);assert.deepEqual(saved.roadSegments,audit.roadSegments);}
R.prepare(world,'pilot');R.optimize(world);world.updateMatrixWorld(true);assert(new R.Box3().setFromObject(world).getSize(new R.Vector3()).toArray().every(Number.isFinite));
// Exercise the actual native constructors used by the walker's asynchronous image path.
let image;const savedImage=globalThis.Image;
globalThis.Image=class {constructor(){image=this;this.width=1792;this.height=1792;}};
let walking;try{globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await readFile(root+'/'+url))});walking=await R.createWorld('',undefined,'pilot',{overview:true});}finally{globalThis.fetch=oldFetch;}
const walkStatus=applyGroundReference(walking,walking.userData.navigationColliders,R);
image.onload();
const ground=walking.getObjectByName('Suelo de referencia · Esri World Imagery');
assert(ground?.isMesh&&ground.geometry.isBufferGeometry);assert(ground.material.emissiveMap.isTexture&&!ground.material.emissiveMap.isDataTexture);
assert.equal(ground.geometry.attributes.position.count,4);assert.equal(ground.geometry.attributes.uv.count,4);
assert.equal(ground.material.emissiveMap.image,image);assert.equal(walkStatus.loaded,true);
const pos=ground.geometry.attributes.position;
assert(Math.abs((pos.getX(0)/97200+GROUND_REFERENCE.origin.lon)-west)<1e-8);
assert(Math.abs((GROUND_REFERENCE.origin.lat-pos.getZ(0)/110950)-north)<1e-8);
walkStatus.disposed=true;globalThis.Image=savedImage;
console.log(JSON.stringify({roadOwners:roadSegments.length,beforeMeshes,afterMeshes,beforeInstances,afterInstances,removedColliders:result.removedColliders,buildings:139}));
