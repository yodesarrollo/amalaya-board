// Load succeeds only after the scene and navigation colliders are assembled.
const script=document.querySelector('script[data-walk-entry]');
let state='loading',timer;
const panel=document.createElement('section');panel.id='walk-load-state';
panel.style.cssText='position:fixed;inset:0;z-index:100;background:#171c1d;color:#f3eee3;display:grid;place-content:center;text-align:center;padding:24px;font:16px/1.5 system-ui';
panel.setAttribute('role','status');panel.textContent='Preparando tu recorrido…';document.body.append(panel);
function report(type,extra={}){if(window.parent!==window)window.parent.postMessage({type,...extra},location.origin);}
function fail(reason='load'){
 if(state==='failed')return;state='failed';clearTimeout(timer);
 report('amalaya:failed',{reason});panel.replaceChildren();panel.style.display='grid';panel.setAttribute('role','alert');
 const title=document.createElement('h2');title.textContent=reason==='webgl'?'Este navegador no puede iniciar la caminata 3D':'No se pudo abrir el recorrido 3D';
 const text=document.createElement('p');text.textContent=reason==='webgl'?'Puedes seguir revisando los edificios en la vista ligera.':'Reintenta la carga o continúa con la vista ligera.';
 const actions=document.createElement('div');actions.style.cssText='display:flex;gap:12px;justify-content:center;flex-wrap:wrap';
 const retry=document.createElement('button');retry.textContent='Reintentar';retry.onclick=()=>location.reload();
 const light=document.createElement('a');light.textContent='Ver edificios';light.href='../../modelo-completo.html?embed=1&vista=volumen';
 for(const el of [retry,light])el.style.cssText='border:1px solid #bd9b57;border-radius:9px;padding:12px 18px;color:#171c1d;background:#d1b36d;text-decoration:none;font:inherit;cursor:pointer';
 actions.append(retry,light);panel.append(title,text,actions);
}
window.addEventListener('amalaya:world-ready',()=>{if(state==='failed')return;requestAnimationFrame(()=>{if(state==='failed')return;state='ready';clearTimeout(timer);panel.style.display='none';report('amalaya:scene-ready');});});
window.addEventListener('amalaya:world-error',()=>fail());
document.querySelector('#game').addEventListener('webglcontextlost',()=>fail('context'));
timer=setTimeout(()=>fail('timeout'),45000);
import(script.dataset.walkEntry).catch(error=>{console.error('Recorrido Amalaya:',error);fail(/WebGL|context/i.test(error.message)?'webgl':'load');});
