import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { moduloDeEspacio, urlActivo } from '../src/modelos3d.js'
import { validarColocacion } from '../src/CapaModelos3D.js'
const fila = {espacio_id:'E-TEST',modulo_id:'01',activo:'si',estado:'validado',longitud:-110.95477,latitud:29.07606,altitud_m:0,giro_y_deg:0,escala_m_por_unidad:1,ancla_local_x:0,ancla_local_z:0}
assert.equal(moduloDeEspacio([fila],'E-TEST'),'01')
assert.equal(moduloDeEspacio([fila],'E-OTRO'),null)
assert.equal(moduloDeEspacio([fila,fila],'E-TEST'),null)
assert.equal(moduloDeEspacio([{...fila,estado:'pendiente'}],'E-TEST'),null)
assert.equal(moduloDeEspacio([{...fila,activo:'no'}],'E-TEST'),null)
assert.equal(validarColocacion(fila).escala_m_por_unidad,1)
for (const f of [{...fila,longitud:''},{...fila,escala_m_por_unidad:0},{...fila,latitud:120},{...fila,estado:'pendiente'}]) assert.throws(()=>validarColocacion(f))
assert.equal(urlActivo('/amalaya-board/','modulos/01/modelo.glb'),'/amalaya-board/activos3d/modulos/01/modelo.glb')
for(const path of ['../secret','https://otro.test/x','/otra/ruta','%2e%2e/a'])assert.throws(()=>urlActivo('/amalaya-board/',path))
// Ejecutar la función real irA con dependencias mínimas; regresión del render
// almacenado en RENDERS (antes intentaba reasignar una constante).
const html=fs.readFileSync('public/recorrido/index.html','utf8')
const body=html.slice(html.indexOf('async function irA('),html.indexOf("document.getElementById('mezcla').oninput"))
const script=`let idx=0,yaw=0; const DATA={id:'R-TEST',nombre:'Prueba',puntos:[{id:'P-TEST',nombre:'Punto',orden:1}]};const modoAccion=false,EMBED=false;const document={getElementById:()=>({firstChild:{},textContent:''})};const history={replaceState(){}};const RENDERS={'P-TEST':{tipo:'textura-privada-simulada'}};const matA={color:{set(){}}};const cargarTex=async()=>null;const nivelar=()=>{},encuadrar=()=>{},pintarUI=()=>{},pintarMini=()=>{};let resultado;const pintarDespues=x=>{resultado=x};${body};irA(0).then(()=>resultado)`
const resultado=await vm.runInNewContext(script,{},{timeout:1000})
assert.equal(resultado.tipo,'textura-privada-simulada')
console.log('OK: vínculos inequívocos, estado validado, escala/coordenadas, rutas de activos y regresión render360.')
