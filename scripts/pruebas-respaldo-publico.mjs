import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {webglDisponible} from '../src/webgl-disponible.js';
import {panoramaPixels} from '../public/recorrido/panorama-ligero.js';
assert.equal(webglDisponible(()=>({getContext:()=>null})),false);
assert.equal(webglDisponible(()=>{throw Error('GPU denied')}),false);
let releases=0;assert.equal(webglDisponible(()=>({getContext:()=>({getExtension:()=>({loseContext:()=>releases++})})})),true);assert.equal(releases,1,'The probe releases its context');
const data=new Uint8ClampedArray(360*180*4);for(let y=0;y<180;y++)for(let x=0;x<360;x++){const i=(y*360+x)*4;data[i]=Math.floor(x/90)*60;data[i+1]=y;data[i+2]=17;data[i+3]=255;}
const source={width:360,height:180,data},center=(yaw,pitch=0)=>Array.from(panoramaPixels(source,3,3,yaw,pitch,90).slice(16,20));
assert.deepEqual(center(0),[120,90,17,255],'North at the equirectangular image centre');
assert.deepEqual(center(Math.PI/2),[180,90,17,255],'East quarter-turn');
assert.deepEqual(center(-Math.PI/2),[60,90,17,255],'West quarter-turn');
assert.deepEqual(center(Math.PI),center(-Math.PI),'Continuous wrap at the panorama seam');
assert(center(0,.4)[1]<90,'Looking up samples the upper hemisphere');
assert(center(0,-.4)[1]>90,'Looking down samples the lower hemisphere');
const html=readFileSync('public/recorrido/index.html','utf8');
for(const script of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(script[1]);
const main=html.match(/<script>\n\/\/ =+[\s\S]*?<\/script>/)[0].replace(/^<script>|<\/script>$/g,'');
// Run the real boot script with WebGL denied: it must request the lightweight
// module and avoid starting the WebGL animation or fetching the heavy scene.
let fallback=false;
const boot=new vm.Script(main.replace("import('./panorama-ligero.js')",'loadFallback()'));
await boot.runInNewContext({URLSearchParams,location:{search:'?embed=1&portal=1'},document:{body:{classList:{add(){}}},getElementById:()=>({})},THREE:{WebGLRenderer:class{constructor(){throw Error('no WebGL')}}},loadFallback:()=>Promise.resolve({iniciarPanoramaLigero(){fallback=true}})});
await Promise.resolve();assert(fallback,'Unavailable WebGL starts the panorama fallback');
console.log('Respaldo público: contexto liberado, arranque sin WebGL y perspectiva norte/este/oeste/vertical comprobados.');
