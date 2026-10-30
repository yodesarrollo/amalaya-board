// Diagnostic browser harness. No source/material mutation is persisted.
// Requires a separate Chromium CDP process and an installed Playwright module.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const [url,out,revision,modulePath='playwright',cdp='http://127.0.0.1:9333']=process.argv.slice(2);
assert(url&&out&&revision,'Uso: node scripts/comprobar-material84-webgl.mjs URL DIRECTORIO_NUEVO REVISION [MODULO_PLAYWRIGHT] [CDP_URL]');
await mkdir(out);
const {chromium}=await import(modulePath);
const browser=await chromium.connectOverCDP(cdp,{timeout:120000});
const page=await browser.contexts()[0].newPage();
const sources={},errors=[];
page.on('pageerror',error=>errors.push(String(error)));
page.on('response',async response=>{if(new URL(response.url()).pathname.endsWith('.js'))try{sources[response.url()]=createHash('sha256').update(await response.body()).digest('hex');}catch{}});
try{
 await page.setViewportSize({width:1365,height:900});
 // Avoid repeatedly uploading/rasterizing the entire world while it loads on
 // software WebGL. The original renderer and scene are retained unchanged.
 await page.addInitScript(()=>{
  const raf=requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>setTimeout(()=>raf(cb),750);
  window.__THREE_DEVTOOLS__=new EventTarget();
  __THREE_DEVTOOLS__.addEventListener('observe',event=>{const renderer=event.detail;if(!renderer.isWebGLRenderer)return;const render=renderer.render;renderer.render=function(scene,camera){window.__material84={renderer,scene,camera,render:()=>render.call(renderer,scene,camera)};};});
 });
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});
 await page.waitForFunction(()=>window.__material84?.scene.userData.sheetPlan&&window.__material84.scene.getObjectByName('Planta física · D1-09')?.children.length===4,null,{timeout:180000});
 const setup=await page.evaluate(()=>{
  const d=window.__material84;d.visibility=new Map();d.materials=[];
  d.scene.traverse(o=>{if(!o.isMesh)return;d.visibility.set(o,o.visible);let p=o,belongs=false;while(p){if(p.userData.buildingId==='D1-09')belongs=true;p=p.parent;}o.visible=belongs;if(belongs){o.material=o.material.clone();d.materials.push(o.material);}});
  return {loaderState:document.querySelector('#walk-load-state')?.innerText,materials:d.materials.map(m=>({metalness:m.metalness,roughness:m.roughness,color:m.color.getHexString(),emissive:m.emissive.getHexString()}))};
 });
 assert(setup.materials.every(m=>m.metalness===0&&m.roughness===.96),'Candidate must explicitly use dielectric PBR before any probe');
 const receipt={revision,startedAt:new Date().toISOString(),setup,captures:[],limits:'Canvas WebGL real del visor compilado. Animación de render suspendida durante carga; cámaras colocadas por el arnés. No acredita recorrido interactivo ni rendimiento. El control metal1 es un contrafactual causal en memoria sobre la revisión candidata, no una captura de un commit anterior.'};
 const cases=[{name:'control-herencia-metal1',metalness:1,roughness:1},{name:'candidato-material-explicito',metalness:0,roughness:.96},{name:'causal-solo-metalness0',metalness:0,roughness:1},{name:'candidato-mundo-p113',full:true},{name:'candidato-mundo-p144',full:true,p144:true}];
 for(const test of cases){
  const data=await page.evaluate(t=>{
   const d=window.__material84;
   if(t.full)for(const [o,visible]of d.visibility)o.visible=visible;
   for(const m of d.materials){m.metalness=t.metalness??0;m.roughness=t.roughness??.96;m.needsUpdate=true;}
   d.camera.position.set(...(t.p144?[-102.4196399999937,1.74,100.84245500026992]:[-95.26899955537965,1.74,107.47572561774476]));
   d.camera.rotation.set(-.035,-(t.p144?144:180)*Math.PI/180,0);
   d.render();const gl=d.renderer.getContext();gl.finish();const pixel=new Uint8Array(4);
   gl.readPixels(500,gl.drawingBufferHeight-300,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);
   // Read before returning to the event loop: preserveDrawingBuffer is false.
   return {png:d.renderer.domElement.toDataURL('image/png'),camera:{position:d.camera.position.toArray(),rotation:d.camera.rotation.toArray()},materials:d.materials.map(m=>({metalness:m.metalness,roughness:m.roughness,color:m.color.getHexString(),emissive:m.emissive.getHexString()})),pixel500_300:[...pixel],render:{...d.renderer.info.render},webgl:gl.getParameter(gl.VERSION),buffer:[gl.drawingBufferWidth,gl.drawingBufferHeight]};
  },test);
  const png=Buffer.from(data.png.split(',')[1],'base64');delete data.png;
  await writeFile(`${out}/${test.name}.png`,png);receipt.captures.push({test,...data,sha256:createHash('sha256').update(png).digest('hex')});
  receipt.sources=sources;receipt.errors=errors;receipt.finishedAt=new Date().toISOString();await writeFile(out+'/recibo.json',JSON.stringify(receipt,null,2)+'\n');
 }
 console.log(JSON.stringify(receipt.captures.map(c=>({name:c.test.name,pixel:c.pixel500_300,triangles:c.render.triangles}))));
}finally{await page.close();await browser.close();}
