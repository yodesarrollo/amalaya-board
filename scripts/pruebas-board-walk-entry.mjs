import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Vector3} from 'three';
import {enterBoardPoint} from '../public/levantamiento/sector-visor.js';
import {createCollisionIndex,blocked,moveSafely} from '../public/levantamiento/walk-navigation.js';
import {createWorld} from '../public/levantamiento/world.js';
const oldFetch=globalThis.fetch;let world;try{globalThis.fetch=async url=>({ok:true,json:async()=>JSON.parse(await readFile('public/levantamiento/'+url))});world=await createWorld('',undefined,'pilot',{overview:true});}finally{globalThis.fetch=oldFetch;}
const colliders=world.userData.navigationColliders,index=createCollisionIndex(colliders),point={x:(-110.9556997+110.9547151)*97200,z:(29.076115-29.0751079)*110950},camera={position:new Vector3(point.x,1.74,point.z)},previous=new Vector3(0,1.74,0),messages=[];
assert(blocked(index,{...point,y:.08}),'P111 se encuentra en colisión real de D1-09');
enterBoardPoint({camera,character:null,point,previous,yaw:0,mode:'walk',colliders,notify:x=>messages.push(x)});
const position={x:camera.position.x,y:.08,z:camera.position.z};assert(!blocked(index,position));assert(Math.hypot(position.x-point.x,position.z-point.z)>0.1);assert(messages.at(-1).includes('referencia fotográfica'));assert.notDeepEqual(moveSafely(index,position,1,0),position,'El punto permite caminar');
camera.position.set(point.x,8,point.z);enterBoardPoint({camera,character:null,point,previous,yaw:0,mode:'fly',colliders,notify:()=>{}});assert.equal(camera.position.x,point.x);assert.equal(camera.position.z,point.z);
let flightCalls=0;enterBoardPoint({camera,character:{enter:()=>flightCalls++},point,previous,yaw:0,mode:'fly',colliders,notify:()=>{}});assert.equal(flightCalls,0,'El vuelo no ajusta personaje ni cámara');
let actorPoint;camera.position.set(point.x,1.74,point.z);enterBoardPoint({camera,character:{enter:p=>{actorPoint=p.clone()}},point,previous,yaw:0,mode:'walk',colliders,notify:()=>{}});assert(actorPoint&&!blocked(index,actorPoint),'El personaje entra en posición libre');
console.log('P111: entrada caminable, referencia intacta en vuelo, aviso y personaje sincronizado.');
