import assert from 'node:assert/strict';
import {createDepthFrame,drawDepthFrame} from '../public/levantamiento/depth-raster.js';
const project=p=>p,paint=tris=>drawDepthFrame(createDepthFrame(20,20),tris,project);
const pixel=(f,x,y)=>Array.from(f.pixels.slice((y*f.width+x)*4,(y*f.width+x)*4+4));
// Same projected footprint, but the surfaces intersect: no whole-triangle sort
// can display both correctly. The near face must change across the triangle.
const ramp=[[0,0,0],[20,0,20],[0,20,0],0xff0000];
const flat=[[0,0,6],[20,0,6],[0,20,6],0x0000ff];
const a=paint([ramp,flat]),b=paint([flat,ramp]);
assert.deepEqual(a.pixels,b.pixels,'occlusion independent of triangle order');
assert.deepEqual(pixel(a,2,2),[0,0,255,255]);
assert.deepEqual(pixel(a,12,2),[255,0,0,255]);
// A facade split into triangles covers every pixel without diagonal cracks.
const quad=paint([[[0,0,1],[20,0,1],[20,20,1],0xaabbcc],[[0,0,1],[20,20,1],[0,20,1],0xaabbcc]]);
for(let i=3;i<quad.pixels.length;i+=4)assert.equal(quad.pixels[i],255);
assert.deepEqual(paint([[ramp[2],ramp[1],ramp[0],ramp[3]],flat]).pixels,a.pixels,'both windings');
// A large road triangle behind the facade must never cut through it.
const withRoad=paint([[[0,0,-1],[40,0,-1],[0,40,-1],0x666666],...[[[0,0,1],[20,0,1],[20,20,1],0xaabbcc],[[0,0,1],[20,20,1],[0,20,1],0xaabbcc]]]);
assert.deepEqual(withRoad.pixels,quad.pixels);
assert.deepEqual(paint([[[NaN,0,0],[0,0,0],[1,1,1],0]]).pixels,new Uint8ClampedArray(1600));
console.log('Profundidad por píxel: caras cruzadas, suelo/fachada, doble orientación y juntas sin grietas.');
