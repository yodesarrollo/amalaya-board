import { readdir, readFile, stat } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
const root='public/levantamiento'
const approved=new Set(['amalaya-observations.json','amalaya-routes.json','cerro-elevation.json','osm-context.json','osm-plaza-hidalgo.json','sector-survey.json'])
const ob01EvidenceFiles=new Set(['01-planta.png','02-calzada.png','03-banqueta-sur.png','04-banqueta-norte.png','05-esquinas.png','06-identidad.png','07-volumen.png','08-fachada.png','09-materiales.png','10-equipamiento.png','11a-planta.png','11b-bloque.png','11c-peaton.png','manifest.json'])
const ob02EvidenceFiles=new Set(['01-fachada-p03.png','02-conjunto-p03.png','03-edificio-aislado-p03.png','04-retorno-oblicuo-p04.png','manifest.json'])
async function check(dir){
  for(const item of await readdir(dir,{withFileTypes:true})){
    const path=`${dir}/${item.name}`
    assert(!item.isSymbolicLink(),`No se permiten enlaces: ${path}`)
    if(item.isDirectory()){const allowed=['data','visor','assets','fonts','evidence'].includes(item.name)||(dir===`${root}/evidence`&&['OB-01','OB-02'].includes(item.name));assert(allowed,`Carpeta inesperada: ${path}`);await check(path);continue}
    if(path.includes('/evidence/OB-01/'))assert(ob01EvidenceFiles.has(item.name),`Evidencia fuera del alcance OB-01: ${path}`)
    if(path.includes('/evidence/OB-02/'))assert(ob02EvidenceFiles.has(item.name),`Evidencia fuera del alcance OB-02: ${path}`)
    assert(!/\.(map|env|csv|zip|bundle)$/i.test(item.name),`Archivo no publicable: ${path}`)
    if(path.includes('/data/'))assert(approved.has(item.name),`Datos no revisados: ${path}`)
    assert((await stat(path)).size<25000000,`Activo demasiado grande: ${path}`)
    if(/\.(json|html|js)$/.test(path)){
      const text=await readFile(path,'utf8')
      assert(!/(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}|-----BEGIN .*PRIVATE KEY-----)/.test(text),`Credencial detectada: ${path}`)
    }
  }
}
await check(root)
const evidence=JSON.parse(await readFile(`${root}/evidence/OB-01/manifest.json`,'utf8'))
assert(evidence.render?.includes('Three.js production OB-01 and street geometry through WebGLRenderer'),'La evidencia debe provenir del modelo OB-01 con el render auditado.')
assert(evidence.limits?.includes('not cadastral survey or site photography'),'La evidencia debe declarar que no es foto del sitio ni levantamiento catastral.')
assert(evidence.captures?.length===13 && evidence.captures.every(item=>ob01EvidenceFiles.has(item.file)),'Faltan capturas requeridas de los puntos 1–11.')
assert(evidence.states?.length===13 && evidence.states.every(s=>s.triangles>0 && s.renderer.includes('WebGL 2.0')),'Falta comprobación de render WebGL por captura.')
for(const name of [...ob01EvidenceFiles].filter(name=>name.endsWith('.png'))){const bytes=await readFile(`${root}/evidence/OB-01/${name}`);assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),`PNG inválido: ${name}`);assert(bytes.readUInt32BE(16)===1280 && bytes.readUInt32BE(20)===800,`Dimensiones de evidencia inesperadas: ${name}`)}
for(const file of ['world.js','visor/index.html',...Array.from(approved,n=>`data/${n}`)])await stat(`${root}/${file}`)
const worldHash=createHash('sha256').update(await readFile(`${root}/world.js`)).digest('hex').slice(0,12)
assert((await readFile('src/levantamiento-version.js','utf8')).includes(`'${worldHash}'`),'El hash de caché debe corresponder al modelo publicado.')
const page=await readFile(`${root}/visor/index.html`,'utf8')
for(const [,asset] of page.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g))await stat(`${root}/visor/${asset}`)
assert(!(await readFile('src/preview-recorrido.jsx','utf8')).includes('datos.jsx'),'El portal público no carga el proveedor de negocio')
console.log('Publicación: activos visuales presentes, datos geográficos autorizados y sin credenciales reconocibles. El acceso al negocio se conserva.')

const compared=evidence.states.filter(s=>s.comparison)
assert(compared.length===3,'Se requieren planta, bloque y peatón del mismo punto.')
for(const state of compared){assert(state.comparison.azimuth===185);assert(Math.abs(state.cameraPosition[0]-compared[0].cameraPosition[0])<1e-6);assert(Math.abs(state.cameraPosition[2]-compared[0].cameraPosition[2])<1e-6)}

const ob02=JSON.parse(await readFile(`${root}/evidence/OB-02/manifest.json`,'utf8'))
assert(ob02.building==='OB-02' && ob02.route==='R-001','El manifiesto debe corresponder solo a OB-02 en R-001.')
assert(ob02.references?.some(r=>r.point==='R-001-P03'&&r.id==='Apyr0uKeZr_XWmfLfLeBjQ') && ob02.references?.some(r=>r.point==='R-001-P04'&&r.id==='h45BeWMtTog-TgjPTSYn6g'),'Faltan los IDs exactos de las referencias P03/P04.')
assert(ob02.references.every(r=>r.imageDate==='not verified'),'No debe afirmarse fecha de captura de los panoramas.')
assert(ob02.limits?.some(text=>text.includes('not verified panorama capture metadata')) && ob02.limits?.some(text=>text.includes('Panoramas remain consultation references')),'OB-02 debe documentar rumbo y uso de imagen como referencia, no textura.')
assert(ob02.captures?.length===4 && ob02.captures.every(item=>ob02EvidenceFiles.has(item.file)),'Se requieren las cuatro capturas revisadas de OB-02.')
const ob02States=ob02.captures
for(const state of ob02States){
  assert(state.triangles>0 && state.calls>0 && state.renderer?.includes('WebGL 2.0'),'Cada captura OB-02 debe tener estado real de WebGL.')
  assert(Array.isArray(state.cameraPosition)&&state.cameraPosition.length===3&&Number.isFinite(state.azimuth),'Cada captura OB-02 debe registrar posición y azimut de cámara.')
  const bytes=await readFile(`${root}/evidence/OB-02/${state.file}`)
  assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),`PNG inválido: ${state.file}`)
  assert(bytes.readUInt32BE(16)===1280&&bytes.readUInt32BE(20)===800,`Dimensiones de evidencia inesperadas: ${state.file}`)
}
const integrated=ob02States.find(s=>s.view==='integrated-orthographic')
const isolated=ob02States.find(s=>s.view==='isolated-orthographic')
assert(integrated?.point==='R-001-P03'&&isolated?.point==='R-001-P03','Las vistas integrada y aislada deben partir de P03.')
assert(Math.abs(integrated.azimuth-isolated.azimuth)<1e-6&&integrated.cameraPosition.every((v,i)=>Math.abs(v-isolated.cameraPosition[i])<1e-6),'Las vistas integrada y aislada deben usar la misma posición y rumbo.')
assert(integrated.projection===isolated.projection&&integrated.projection?.includes('orthographic'),'La vista aislada debe conservar la proyección de la integración.')
assert(integrated.occlusion?.includes('shared street builder'),'La oclusión contextual debe declararse en la evidencia.')
assert(ob02States.some(s=>s.view==='perspective-detail'&&s.point==='R-001-P03')&&ob02States.some(s=>s.view==='perspective-oblique'&&s.point==='R-001-P04'),'Faltan el detalle P03 y la vista oblicua P04.')
console.log('OB-02: cuatro capturas WebGL revisadas, referencias identificadas, cámaras registradas y límites conservados.')
