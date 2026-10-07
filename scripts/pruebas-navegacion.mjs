import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createCollisionIndex,blocked,safeSpawn,clipCamera,moveSafely,installWalkingNavigation} from '../public/levantamiento/walk-navigation.js';
import {removeNavigationHook} from './preparar-navegacion.mjs';
const box=(x,z,w,d,y=6)=>({min:{x,y:0,z},max:{x:x+w,y,z:z+d}});
const wall=createCollisionIndex([box(1,-20,.04,40)]);
assert(clipCamera(wall,{x:0,y:1.5,z:0},{x:4,y:2,z:0}).x<1,'camera cannot cross a thin wall with a free endpoint');
const movement=moveSafely(wall,{x:0,y:.08,z:0},5,3);
assert(movement.x<1 && movement.z>2.9,'fast diagonal movement slides along wall without tunnelling');
assert.deepEqual(safeSpawn(wall,{x:0,y:.08,z:0}),{x:0,y:.08,z:0},'free destination stays exactly anchored');
const inside=safeSpawn(wall,{x:1,y:.08,z:0});assert(inside&&!blocked(wall,inside));
assert.equal(safeSpawn(createCollisionIndex([box(-20,-20,40,40)]),{x:0,y:.08,z:0},null,1),null,'no arbitrary far relocation');
const floor=createCollisionIndex([box(-20,-20,40,40,.1)]);assert(!blocked(floor,{x:0,y:.08,z:0}),'ground does not block walking');
const bounded=moveSafely(createCollisionIndex([]),{x:0,y:.08,z:0},10,10,{minX:-1,maxX:1,minZ:-1,maxZ:1});assert.equal(bounded.x,1);assert.equal(bounded.z,1);
// Scene actually published in the map, including the latest footprint corrections.
const oldFetch=globalThis.fetch;let world;
try {globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await readFile('public/levantamiento/'+url))});world=await (await import('../public/levantamiento/world.js')).createWorld('',undefined,'pilot',{overview:true});}
finally {globalThis.fetch=oldFetch;}
const colliders=world.userData.navigationColliders;assert(colliders.length>10000);
const index=createCollisionIndex(colliders),routes=JSON.parse(await readFile('public/recorrido/rutas.json')).rutas;
let adjusted=0,maxAdjustment=0,points=0;
for(const route of routes)for(const point of route.puntos){
 const start={x:(point.lng+110.9547151)*97200,y:.08,z:(29.076115-point.lat)*110950};
 const safe=safeSpawn(index,start);assert(safe,route.id+' '+point.id+' has a free start within 12m');assert(!blocked(index,safe));
 const delta=Math.hypot(safe.x-start.x,safe.z-start.z);if(delta>.01)adjusted++;maxAdjustment=Math.max(maxAdjustment,delta);points++;
 for(const angle of [0,Math.PI/2,Math.PI,3*Math.PI/2]){
  const target={x:safe.x,y:1.53,z:safe.z},desired={x:safe.x+Math.cos(angle)*4.1,y:2.46,z:safe.z+Math.sin(angle)*4.1};
  const camera=clipCamera(index,target,desired);assert(Object.values(camera).every(Number.isFinite));
  assert.deepEqual(clipCamera(index,target,camera),camera,'clipped camera has a clear sight line');
 }
}
assert.equal(points,37);
const source=await readFile('public/levantamiento/visor/assets/index-RoPA5goG.js','utf8');assert.notEqual(removeNavigationHook(source),source);assert(source.includes('installWalkingNavigation(Eg,{colliders:Hg,bounds:H_,notify:xv})'));
// Exercise the real character class shipped in the viewer, without needing GPU.
const THREE=await import('three');
const from=source.indexOf('var Eg=class'),to=source.indexOf(',Dg=',from);
assert(from>0&&to>from);
const Class=new Function('Tg','xs','U','Qr','w','Ie','Rr','J','eo','Jn',source.slice(from,to)+';return Eg;')(
 ()=>{const actor=new THREE.Group();actor.userData.gait={legs:[],arms:[]};return actor;},THREE.Raycaster,THREE.Vector3,THREE.DataTexture,THREE.RGBAFormat,THREE.SRGBColorSpace,THREE.MeshBasicMaterial,THREE.Mesh,THREE.PlaneGeometry,THREE.Box3);
const boxes=[new THREE.Box3(new THREE.Vector3(1,0,-20),new THREE.Vector3(1.04,6,20))];
installWalkingNavigation(Class,{colliders:boxes,bounds:{minX:-10,maxX:10,minZ:-10,maxZ:10}});
const camera=new THREE.PerspectiveCamera(),actor=new Class(new THREE.Group(),camera,boxes);actor.attach(actor.world);
actor.enter(new THREE.Vector3(0,.08,0),0);actor.setFirstPerson(true);
for(let i=0;i<100;i++)actor.move(.1,{movement:0,strafe:1,fast:true},0,0);
assert(actor.position.x<.78,'real character cannot walk through wall');assert.equal(camera.position.x,actor.position.x,'POV stays on actor, not behind wall');
actor.setFirstPerson(false);actor.updateCamera(-Math.PI/2,0,1);assert(camera.position.x<1,'third-person camera remains before wall');
actor.enter(new THREE.Vector3(1,.08,0),0);assert(!actor.blocked(actor.position),'real enter resolves blocked waypoint');
console.log(JSON.stringify({points,colliders:colliders.length,adjusted,maxAdjustment:Number(maxAdjustment.toFixed(2)),checks:'thin walls, wall sliding, boundaries, spawn, four camera bearings, real character/POV'}));
// Loader lifecycle: HTML load/boot isn't readiness; failed contexts never report ready.
const {runInNewContext}=await import('node:vm');
const loader=await readFile('public/levantamiento/visor-loader.js','utf8');
function loadFixture(reject=false){
 const make=()=>({style:{},children:[],events:{},setAttribute(){},append(...n){this.children.push(...n)},replaceChildren(){this.children=[]},addEventListener(k,fn){this.events[k]=fn}});
 const canvas=make(),body=make(),listeners={},messages=[],tasks=[];
 const win={parent:{postMessage:m=>messages.push(m)},addEventListener:(name,fn)=>listeners[name]=fn};
 const doc={body,querySelector:q=>q==='#game'?canvas:{dataset:{walkEntry:'./visor/assets/index-RoPA5goG.js?v=test'}},createElement:make};
 runInNewContext(loader.replace('import(script.dataset.walkEntry)','loadModule(script.dataset.walkEntry)'),{window:win,document:doc,location:{origin:'https://example.test',reload(){}},console:{error(){}},setTimeout:fn=>(tasks.push(fn),tasks.length),clearTimeout(){},requestAnimationFrame:fn=>fn(),loadModule:()=>reject?Promise.reject(Error('WebGL context unavailable')):Promise.resolve()});
 return {listeners,messages,canvas,body,tasks};
}
const ready=loadFixture();assert.equal(ready.messages.length,0);ready.listeners['amalaya:world-ready']();assert.equal(ready.messages[0].type,'amalaya:scene-ready');ready.canvas.events.webglcontextlost();assert.equal(ready.messages.at(-1).type,'amalaya:failed');
const failed=loadFixture(true);await new Promise(resolve=>setImmediate(resolve));assert.equal(failed.messages[0].reason,'webgl');failed.listeners['amalaya:world-ready']();assert.equal(failed.messages.length,1,'late ready cannot hide failure');
const timeout=loadFixture();timeout.tasks[0]();assert.equal(timeout.messages[0].reason,'timeout');
const html=await readFile('public/levantamiento/visor/index.html','utf8');const entry=html.match(/data-walk-entry="([^"]+)"/)[1];assert(new URL(entry,'https://example.test/amalaya-board/levantamiento/visor-loader.js').pathname.endsWith('/levantamiento/visor/assets/index-RoPA5goG.js'));
console.log('Carga: espera escena real, fallo WebGL, pérdida de contexto, timeout y llegada tardía verificados.');
