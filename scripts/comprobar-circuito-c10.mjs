// Requires Chromium already running with --remote-debugging-port=9222.
// Reads the built artifact over HTTP; evidence is written only to a new directory.
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const [url,out,revision]=process.argv.slice(2);
assert(url&&out&&revision,'Uso: node scripts/comprobar-circuito-c10.mjs <URL visor> <directorio nuevo> <commit>');
await mkdir(out);
const tabs=await(await fetch('http://127.0.0.1:9222/json/list')).json();
const tab=tabs.find(t=>t.type==='page');assert(tab,'No hay pestaña Chromium CDP');
const ws=new WebSocket(tab.webSocketDebuggerUrl),pending=new Map(),events=[];let seq=0;
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
ws.addEventListener('message',e=>{const p=JSON.parse(e.data);if(p.id){pending.get(p.id)?.(p);pending.delete(p.id)}else events.push(p)});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,p=>p.error?reject(p.error):resolve(p.result));ws.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const waitFor=async expression=>{const end=Date.now()+60000;while(Date.now()<end){const r=await evaluate(expression);if(r)return r;await pause(500);}throw Error('Tiempo agotado: '+expression);};
const capture=async name=>writeFile(out+'/'+name,Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
try{
 await send('Runtime.enable');await send('Page.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
 await send('Emulation.setDeviceMetricsOverride',{width:1365,height:900,deviceScaleFactor:1,mobile:false});
 await send('Page.addScriptToEvaluateOnNewDocument',{source:"window.__c10Events=[];for(const type of ['amalaya:world-ready','amalaya:world-error'])addEventListener(type,()=>__c10Events.push({type,time:Date.now()}));"});
 events.length=0;const startedAt=new Date().toISOString();
 await send('Page.navigate',{url});
 await waitFor("document.querySelector('#walk-load-state')?.style.display==='none'&&!document.querySelector('#board-point-select')?.disabled");
 const load=await evaluate("(()=>{const gl=document.querySelector('#game').getContext('webgl2'),d=gl.getExtension('WEBGL_debug_renderer_info');return{url:location.href,events:__c10Events,loaderDisplay:document.querySelector('#walk-load-state').style.display,webgl:!!gl,renderer:d&&gl.getParameter(d.UNMASKED_RENDERER_WEBGL),points:document.querySelector('#board-point-select').options.length}})()");
 assert(load.webgl&&load.events.some(x=>x.type==='amalaya:world-ready'));
 await evaluate("(()=>{const s=document.querySelector('#board-point-select');s.value='P113';s.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('#visit-board-point').click();document.querySelector('#close-evidence').click();document.activeElement?.blur();document.querySelector('#game').focus()})()");
 await pause(700);
 const position=()=>evaluate("({url:location.href,point:document.querySelector('#board-point-select').value,summary:document.querySelector('#board-point-summary').innerText,coordinates:document.querySelector('#geo-coordinates').innerText,mode:document.querySelector('#movement-mode-status').innerText,notice:document.querySelector('#toast')?.innerText})");
 const arrival=await position();await capture('p113-llegada.png');
 // The selected photo point is beside a wall. Back away before checking the
 // lateral walk so the camera has room to display the actual exterior.
 await send('Input.dispatchKeyEvent',{type:'keyDown',code:'KeyS',key:'s',windowsVirtualKeyCode:83});await pause(3000);
 await send('Input.dispatchKeyEvent',{type:'keyUp',code:'KeyS',key:'s',windowsVirtualKeyCode:83});
 const before=await position();await capture('p113-antes.png');
 await send('Input.dispatchKeyEvent',{type:'keyDown',code:'KeyA',key:'a',windowsVirtualKeyCode:65});await pause(3000);
 await send('Input.dispatchKeyEvent',{type:'keyUp',code:'KeyA',key:'a',windowsVirtualKeyCode:65});
 const after=await position();await capture('p113-despues.png');assert.notEqual(after.coordinates,before.coordinates,'El teclado debe producir desplazamiento real');
 const lightUrl=new URL('../../../modelo-completo.html?cuadra=C10&identificar=1',url).href;
 await send('Page.navigate',{url:lightUrl});await waitFor("Number(document.querySelector('#model')?.dataset.faces)>0");
 await evaluate("(()=>{document.querySelector('#building-panel').open=true;const s=document.querySelector('#building');s.value='D1-09';s.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('#iso').click();document.querySelector('#plus').click();document.querySelector('#rotate').click()})()");
 await pause(700);await capture('ligera84.png');
 const light=await evaluate("({url:location.href,status:document.querySelector('#status').innerText,selected:document.querySelector('#building').value,canvas:{...document.querySelector('#model').dataset}})");assert.equal(light.selected,'D1-09');
 const receipt={revision,startedAt,finishedAt:new Date().toISOString(),browser:'Chromium 151 headless, ANGLE SwiftShader; viewport1365x900',load,input:'Seleccionar P113, VER PUNTO EN MODELO, cerrar panel y desenfocar; S durante3segundos para separarse del muro, luego A durante3segundos',arrival,before,after,light,limits:'Circuito local de carga, selección, retroceso, teclado lateral y ligera. Llegada próxima al muro; no certifica fidelidad de fachada, ratón, iPhone físico ni recorrido completo.'};
 await writeFile(out+'/recibo.json',JSON.stringify(receipt,null,2)+'\n');await writeFile(out+'/cdp.json',JSON.stringify(events,null,2)+'\n');
 console.log(JSON.stringify({revision,load,coordinates:[before.coordinates,after.coordinates],light}));
}finally{ws.close();}
