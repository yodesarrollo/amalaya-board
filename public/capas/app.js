import {THEMES,LAYERS,sequence,decode,encode} from './model.js'
import {scene} from './scene.js'
const $=s=>document.querySelector(s)
let state=decode(location.hash),selected=new Set(state.layers),comparing=false,step=0
$('#scene').innerHTML=scene()
$('#themes').innerHTML=THEMES.map(t=>`<button data-theme="${t.id}" aria-pressed="false">${t.label}</button>`).join('')+'<button data-theme="todo" aria-pressed="false">Todo el proyecto</button>'
$('#controls').innerHTML=THEMES.map(t=>`<details class="layer-group" data-group="${t.id}" open><summary>${t.label}</summary>${LAYERS.filter(l=>l.theme===t.id).map(l=>`<label class="layer-row"><input type="checkbox" value="${l.id}" aria-label="${l.label}"><span>${l.label}</span><small>${String(LAYERS.indexOf(l)+1).padStart(2,'0')}</small></label>`).join('')}</details>`).join('')
const list=()=>sequence(state.theme,state.mode)
function persist(){state.layers=[...selected];history.replaceState(null,'','#'+encode(state))}
function render(note=null){
 const shown=comparing?new Set():selected
 document.querySelectorAll('[data-layer]').forEach(g=>g.toggleAttribute('hidden',!shown.has(g.dataset.layer)))
 document.querySelectorAll('#scene [data-background]').forEach(g=>g.toggleAttribute('hidden',g.dataset.background!==(comparing?'foto':state.background)))
 document.querySelectorAll('input[type=checkbox]').forEach(c=>c.checked=selected.has(c.value))
 document.querySelectorAll('button[data-theme]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.theme===state.theme))
 document.querySelectorAll('button[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===state.mode))
 document.querySelectorAll('button[data-background]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.background===state.background))
 $('#compare').setAttribute('aria-pressed',comparing);$('#compare').textContent=comparing?'Regresar a mi propuesta':'Comparar original'
 $('#count').textContent=`${shown.size} ${shown.size===1?'capa':'capas'} visibles`
 $('#selected').textContent=`${selected.size} / ${LAYERS.length}`
 $('#scene-label').textContent=comparing||(!selected.size&&state.background==='foto')?'Foto de referencia · Obregón, frente 21':`${state.background==='foto'?'Sobre foto real':'Croquis de referencia'} · propuesta conceptual, sin escala`
 const seq=list(),isPrefix=selected.size===step&&seq.slice(0,step).every(id=>selected.has(id))
 $('#prev').disabled=selected.size===0
 $('#next').disabled=isPrefix&&step===seq.length
 $('#step-count').textContent=comparing?'Comparación temporal':isPrefix?`Paso ${step} de ${seq.length}`:'Combinación libre'
 $('#step-title').textContent=comparing?'La foto original, sin propuestas':!selected.size?'La calle antes de sumar propuestas':note?.label|| (isPrefix?LAYERS.find(x=>x.id===seq[step-1])?.label:'Tu combinación de capas')
 $('#step-note').textContent=comparing?'Tu selección se conserva. Pulsa «Regresar a mi propuesta» para recuperarla.':note?.note||(!selected.size?'Referencia del levantamiento. Fecha de captura no confirmada. Usa Siguiente para agregar la primera mejora.':isPrefix?LAYERS.find(x=>x.id===seq[step-1])?.note:'Puedes activar o retirar cualquier elemento. Las capas son propuestas conceptuales, no obra autorizada.')
 persist()
}
function applyStep(n){const seq=list();step=Math.max(0,Math.min(seq.length,n));selected=new Set(seq.slice(0,step));comparing=false;render()}
function openGroup(){document.querySelectorAll('[data-group]').forEach(d=>d.open=state.theme==='todo'||d.dataset.group===state.theme||state.mode==='acumulativo')}
function chooseTheme(theme){state.theme=theme;openGroup();applyStep(list().length)}
document.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>chooseTheme(b.dataset.theme))
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;openGroup();applyStep(list().length)})
document.querySelectorAll('button[data-background]').forEach(b=>b.onclick=()=>{state.background=b.dataset.background;comparing=false;render()})
$('#controls').addEventListener('change',e=>{if(e.target.type!=='checkbox')return;const id=e.target.value;e.target.checked?selected.add(id):selected.delete(id);comparing=false;const l=LAYERS.find(l=>l.id===id);render({label:(e.target.checked?'Añadido: ':'Retirado: ')+l.label,note:l.note})})
$('#prev').onclick=()=>applyStep(Math.min(step||selected.size,list().length)-1)
$('#next').onclick=()=>applyStep(Math.min(step,list().length)+1)
$('#original').onclick=()=>{state.background='foto';applyStep(0)}
$('#compare').onclick=()=>{comparing=!comparing;render()}
$('#all').onclick=()=>{state.theme='todo';openGroup();applyStep(LAYERS.length)}
$('#expand').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('.viewer').requestFullscreen()}catch{$('#notice').textContent='Este navegador no permite pantalla completa. Puedes ampliar la página con los controles del navegador.'}}
$('#share').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('#notice').textContent='Liga copiada. Conserva tu fondo, recorrido y capas.'}catch{$('#notice').textContent='La barra de direcciones ya contiene tu vista. Copia esa liga para compartirla.'}}
$('#print').onclick=()=>window.print()
$('#scene').addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();$('#next').click()}if(e.key==='ArrowLeft'){e.preventDefault();$('#prev').click()}})
window.addEventListener('hashchange',()=>{state=decode(location.hash);selected=new Set(state.layers);step=0;comparing=false;openGroup();render()})
$('#export').onclick=async()=>{
 const button=$('#export');button.disabled=true;$('#notice').textContent='Preparando la lámina…'
 try{
  const svg=$('#scene svg').cloneNode(true);svg.querySelectorAll('[hidden]').forEach(n=>n.remove());
  const im=svg.querySelector('image');if(im){const response=await fetch(im.getAttribute('href'));if(!response.ok)throw new Error('foto');const blob=await response.blob();const data=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob)});im.setAttribute('href',data)}
  svg.setAttribute('width','1120');svg.setAttribute('height','800');
  const blob=new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}),url=URL.createObjectURL(blob),image=new Image()
  try{await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url});const canvas=document.createElement('canvas');canvas.width=1680;canvas.height=1320;const ctx=canvas.getContext('2d');ctx.fillStyle='#f5f1e7';ctx.fillRect(0,0,1680,1320);ctx.drawImage(image,0,0,1680,1200);ctx.fillStyle='#294638';ctx.font='25px Arial';ctx.fillText('Amalaya · '+(comparing?'Fotografía original':'Estudio por capas'),32,1240);ctx.font='18px Arial';ctx.fillText('Frente 21 · Propuesta conceptual sin escala. No representa obra aprobada.',32,1277);const png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!png)throw new Error('png');const download=URL.createObjectURL(png),a=document.createElement('a');a.href=download;a.download='amalaya-capas.png';a.click();setTimeout(()=>URL.revokeObjectURL(download),10000);$('#notice').textContent='Lámina descargada con las capas visibles.'}finally{URL.revokeObjectURL(url)}
 }catch{$('#notice').textContent='No se pudo descargar la lámina. Puedes usar Imprimir o compartir esta vista.'}finally{button.disabled=false}
}
if(window.innerWidth<701)openGroup()
const initialSeq=list();for(let n=0;n<=initialSeq.length;n++)if(selected.size===n&&initialSeq.slice(0,n).every(id=>selected.has(id)))step=n
render()

function layersOpen(open){document.body.classList.toggle("layers-open",open);$("#toggle-layers").setAttribute("aria-expanded",open);if(open)$("#scene").scrollIntoView({block:"start"});else $("#toggle-layers").focus()}
$("#toggle-layers").onclick=()=>layersOpen(!document.body.classList.contains("layers-open"));$("#close-layers").onclick=()=>layersOpen(false);document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.body.classList.contains("layers-open"))layersOpen(false)});
