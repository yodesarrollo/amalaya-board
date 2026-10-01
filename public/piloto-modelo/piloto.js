const slider=document.getElementById('comparison-slider'),frame=document.getElementById('frame')
slider.addEventListener('input',()=>{frame.style.setProperty('--split',`${slider.value}%`);document.getElementById('percentage').textContent=`${slider.value}% / ${100-slider.value}%`})
const camera={block:'cuadra: altura 58 m',street:'a pie: altura 1.74 m · FOV 63°',plan:'planta: 140 m de ancho · altura 110 m'}
for(const button of document.querySelectorAll('[data-view]'))button.addEventListener('click',()=>{
 const view=button.dataset.view
 document.getElementById('before').src=`./${view}-baseline.jpg`;document.getElementById('after').src=`./${view}-pilot.jpg`
 for(const tab of document.querySelectorAll('[data-view]'))tab.setAttribute('aria-pressed',String(tab===button))
 document.getElementById('camera').textContent=`R-001 · P10 · 29.0760107, −110.9536147 · rumbo oeste 265.85° · ${camera[view]}`
})
for(const img of document.querySelectorAll('.frame img'))img.addEventListener('error',()=>{document.getElementById('image-error').hidden=false})
