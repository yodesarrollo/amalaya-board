// Regresión del visor 360: con un render «después» ya guardado en RENDERS,
// irA() no debe tronar (antes reasignaba una constante: «Assignment to constant variable»).
import fs from 'node:fs'
import vm from 'node:vm'
import assert from 'node:assert/strict'

console.log('recorrido 360 — render «después» desde Drive')
const html = fs.readFileSync('public/recorrido/index.html', 'utf8')
const cuerpo = html.slice(html.indexOf('async function irA('), html.indexOf("document.getElementById('mezcla').oninput"))
const guion = `let idx=0,yaw=0; const DATA={id:'R-T',nombre:'Prueba',puntos:[{id:'P-T',nombre:'Punto',orden:1}]};
const modoAccion=false,EMBED=false; const document={getElementById:()=>({firstChild:{},textContent:''})};
const history={replaceState(){}}; const RENDERS={'P-T':{tipo:'render-simulado'}}; const matA={color:{set(){}}};
const cargarTex=async()=>null; const nivelar=()=>{},encuadrar=()=>{},pintarUI=()=>{},pintarMini=()=>{};
let resultado; const pintarDespues=x=>{resultado=x}; ${cuerpo}; irA(0).then(()=>resultado)`
const r = await vm.runInNewContext(guion, {}, { timeout: 1000 })
assert.equal(r?.tipo, 'render-simulado')
console.log('  ✓ irA usa el render guardado sin error')
console.log('\nEl visor 360 pasa su prueba.')
