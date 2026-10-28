import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {transformSync} from 'esbuild';
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
// Execute the real failure JSX without a browser/GPU. This protects the public
// recovery destination and the retained file actions, not the map's internals.
const mapa3dSource=readFileSync('src/componentes/Mapa3D.jsx','utf8');
const failureStart=mapa3dSource.indexOf('  if (falla3d) {');
const failureEnd=mapa3dSource.indexOf('\n  return (',failureStart);
assert(failureStart>=0&&failureEnd>failureStart,'The map keeps a recoverable failure branch');
const element=(type,props,...children)=>({type,props:props||{},children});
const jsxFunction=(code,context)=>vm.runInNewContext(transformSync(code,{loader:'jsx',jsxFactory:'element',jsxFragment:'Fragment'}).code,{element,...context});
const ListaEspacios=()=>null,RecorridoModelo=()=>null;
let opened;
const renderFailure=jsxFunction(`(function(falla3d,identificarCuadras=false){${mapa3dSource.slice(failureStart,failureEnd)}return null;})`,{
 setIdentificarCuadras(){},BASE:'/amalaya-board/',cont:{current:null},espacios:[],busca:'',setBusca(){},onAbrir:id=>{opened=id},onNuevo:undefined,ListaEspacios,
});
assert.equal(renderFailure(null),null,'The lightweight view does not replace a working map');
const tree=renderFailure('WebGL unavailable');
const nodes=node=>node&&typeof node==='object'?[node,...(node.children||[]).flat(Infinity).flatMap(nodes)]:[];
const recoveryNodes=nodes(tree),iframe=recoveryNodes.find(n=>n.type==='iframe');
assert(iframe,'Map failure automatically embeds a viewer');
assert.equal(iframe.props.src,'/amalaya-board/modelo-completo.html?embed=1&vista=volumen');
assert.equal(nodes(renderFailure('WebGL unavailable',true)).find(n=>n.type==='iframe').props.src,'/amalaya-board/modelo-completo.html?embed=1&vista=volumen&identificar=1','Identification remains available in recovery');
assert.equal(new URL(iframe.props.src,'https://example.test').origin,'https://example.test','Recovery stays on the public project origin');
for(const asset of ['lamina-zona-nucleo.jpg','mapa-poligono.jpg'])assert(recoveryNodes.some(n=>n.type==='a'&&n.props.href.endsWith(asset)&&n.props.download===true),asset+' remains downloadable');
const list=recoveryNodes.find(n=>n.type===ListaEspacios);assert(list,'Work records remain available');list.props.onElegir({id:'fixture-space'});assert.equal(opened,'fixture-space','A recovery list item still opens its record');
const mapaSource=readFileSync('src/componentes/Mapa.jsx','utf8');
const controlsExpression=mapaSource.match(/\{([^{}]*<RecorridoModelo\s*\/>[^{}]*)\}/)?.[1];
assert(controlsExpression,'The original controls have a visibility condition');
const renderControls=jsxFunction(`(function(mapaLigero){return (${controlsExpression});})`,{RecorridoModelo});
assert.equal(renderControls(false).type,RecorridoModelo,'Original controls remain available when the map works');
assert(!renderControls(true),'Original controls cannot overlay the automatic recovery viewer');
console.log('Respaldo público: contexto liberado, panorama sin WebGL, visor automático, fichas/descargas y controles sin superposición comprobados.');
