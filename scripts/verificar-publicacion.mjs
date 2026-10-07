import {removePlanRoundHook} from './preparar-plantas.mjs'
import {removeEbSwHook,refineEbSw,EB_BASE_WORLD,EB_BASE_VISOR} from './preparar-ebsw.mjs'
import { readdir, readFile, stat } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { BASE_WORLD_SHA256, BASE_VISOR_SHA256, removeIsc58Hook, removeIsc58VisorHook, regionHashes, sha256 } from './preparar-isc58.mjs'
const root='public/levantamiento'
const streetBatch50=JSON.parse(await readFile(`${root}/street-batch50-provenance.json`,'utf8'))
assert.equal(streetBatch50.count,50)
const streetBatch50Files=new Set(streetBatch50.results.flatMap(e=>['20261006-02-antes.png','20261006-02-calzada.png','20261006-02-registro.json'].map(name=>`${root}/evidence/${e.id}/${name}`)))
assert.equal(streetBatch50Files.size,150,'El lote tiene exactamente 100 imágenes y 50 registros')
const approved=new Set(['amalaya-observations.json','amalaya-routes.json','cerro-elevation.json','osm-context.json','osm-plaza-hidalgo.json','sector-survey.json'])
const roundProgressFiles=new Set(['20261006-01-cierre.png','20261006-01-cierre.json','02-inicio-ronda.png','02-avance-calzada.png','02-record-calzada.json','03-inicio-ronda.png','03-avance-banqueta-a.png','03-record-banqueta-a.json','20261006-01-antes.png','20261006-01-planta.png','20261006-01-record.json']);
function historicalOwner(building,cameraId){const progress=building.visualProgress?.cameraId===cameraId?building.visualProgress:building.visualProgress?.history?.find(p=>p.cameraId===cameraId);assert(progress,'Missing preserved progress checkpoint '+building.id+' '+cameraId);const previous=building.action1PreviousState;return {...building,tasks:{...building.tasks,...(previous?{plan:previous.state}:{})},issues:{...building.issues,...(previous?.issue?{plan:previous.issue}:{})},visualProgress:progress};}
const ob01EvidenceFiles=new Set(['01-planta.png','02-calzada.png','03-banqueta-sur.png','04-banqueta-norte.png','05-esquinas.png','06-identidad.png','07-volumen.png','08-fachada.png','09-materiales.png','10-equipamiento.png','11a-planta.png','11b-bloque.png','11c-peaton.png','manifest.json'])
const isc58EvidenceFiles=new Set(['00-inicio-webgl-raw.png','00-inicio-seguimiento.png','plan-manifest.json','plan-record.json','progress-baseline.json','06-avance-punto11.png','07-banqueta-sur.png','08-paseo-norte.png','00-inicio-bloque.png','01-planta.png','02-bloque.png','03-peaton.png','04-fachada-detalle.png','05-visor-p05.png','manifest.json','identity-plan-record.json','review-record.json'])
for(const file of ['09-banqueta-sur-reparada.png','10-avance-banqueta-sur.png','11-paseo-norte-reparado.png','12-avance-paseo-norte.png','sidewalkA-repair-manifest.json','sidewalkB-repair-manifest.json'])isc58EvidenceFiles.add(file)
isc58EvidenceFiles.add('identity-record.json')
const ob02EvidenceFiles=new Set(['01-fachada-p03.png','02-conjunto-p03.png','03-edificio-aislado-p03.png','04-retorno-oblicuo-p04.png','manifest.json','05-planta-ob02.png','plan-manifest.json','06-calzada-ob02.png','street-manifest.json','07-inicio-seguimiento.png','progress-baseline.json','08-avance-punto03.png','09-banqueta-sur-planta.png','10-banqueta-sur-peaton.png','sidewalkA-manifest.json','11-avance-punto04.png','12-banqueta-norte-planta.png','13-banqueta-norte-peaton.png','sidewalkB-manifest.json','14-avance-punto05.png','15-guarniciones-planta.png','16-guarnicion-detalle.png','corners-manifest.json','17-avance-punto06.png','identity-manifest.json','identity-record.json'])
for(const file of ['18-avance-punto07.png','19-envolvente-antes.png','20-envolvente-despues.png','21-cubierta-planta.png','volume-before-manifest.json','volume-manifest.json'])ob02EvidenceFiles.add(file)
for(const file of ['22-avance-punto08.png','23-fachada-siete-vanos.png','24-coronamiento.png','facade-manifest.json','facade-record.json'])ob02EvidenceFiles.add(file)
for(const file of ['25-avance-punto09.png','26-materiales-detalle.png','27-fachada-acabados.png','finish-manifest.json'])ob02EvidenceFiles.add(file)
for(const file of ['31-avance-punto11.png','32-comparacion-planta.png','33-comparacion-bloque.png','34-comparacion-peaton.png','35-edificio-limpio-p03.png','qa-manifest.json','qa-record.json'])ob02EvidenceFiles.add(file)
for(const file of ['28-avance-punto10.png','29-equipamiento-planta.png','30-bolardo-detalle.png','equipment-manifest.json','equipment-record.json'])ob02EvidenceFiles.add(file)
async function check(dir){
  for(const item of await readdir(dir,{withFileTypes:true})){
    const path=`${dir}/${item.name}`
    assert(!item.isSymbolicLink(),`No se permiten enlaces: ${path}`)
    if(item.isDirectory()){const allowed=['data','visor','assets','fonts','evidence'].includes(item.name)||(dir===`${root}/evidence`&&(['OB-01','OB-02','ISC-58','EB-SW','EB-NW','EB-NE','EB-SE','CH-YG-BBVA','CH-GA-OXXO','CH-YG-BIB','SER-BLEY','SER-HSBC','OB-21','SER-SANT','PL-GA'].includes(item.name)||/^[ABCD][123]-\d{2}$/.test(item.name)));assert(allowed,`Carpeta inesperada: ${path}`);await check(path);continue}
    if(['/evidence/CH-GA-OXXO/','/evidence/CH-YG-BIB/','/evidence/SER-BLEY/','/evidence/SER-HSBC/'].some(p=>path.includes(p)))assert(roundProgressFiles.has(item.name),'Unexpected round evidence: '+path)
    if(['/evidence/EB-NW/','/evidence/EB-NE/','/evidence/EB-SE/','/evidence/CH-YG-BBVA/'].some(p=>path.includes(p)))assert(roundProgressFiles.has(item.name)||/^(?:sequence\.json|plan-record\.json|01-planta-geometria\.png)$/.test(item.name),'Evidencia fuera del alcance EB-NW: '+path)
    if(/\/evidence\/(?:[ABCD][123]-\d{2}|OB-21|SER-SANT|PL-GA)\//.test(path))assert(roundProgressFiles.has(item.name)||streetBatch50Files.has(path),'Unexpected sheet evidence: '+path)
    if(path.includes('/evidence/EB-SW/'))assert(roundProgressFiles.has(item.name)||/^(?:\d{2}-(?:general|plan|block|pedestrian|south|north)\.png|manifest\.json|sequence\.json|survey\.json)$/.test(item.name),`Evidencia fuera del alcance EB-SW: ${path}`)
    if(path.includes('/evidence/ISC-58/'))assert(roundProgressFiles.has(item.name)||isc58EvidenceFiles.has(item.name),`Evidencia fuera del alcance ISC-58: ${path}`)
    if(path.includes('/evidence/OB-01/'))assert(roundProgressFiles.has(item.name)||ob01EvidenceFiles.has(item.name),`Evidencia fuera del alcance OB-01: ${path}`)
    if(path.includes('/evidence/OB-02/'))assert(roundProgressFiles.has(item.name)||ob02EvidenceFiles.has(item.name),`Evidencia fuera del alcance OB-02: ${path}`)
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
for(const [,asset] of page.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g))await stat(`${root}/visor/${asset.split('?')[0]}`)
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

// Point 1/2 evidence retains its historical checkpoint; point 3 has separate captures.
const currentWorldHash=sha256(removeEbSwHook(removePlanRoundHook(await readFile(`${root}/world.js`,'utf8'))))
// OB-02 retains its immutable published checkpoint when a later building is refined.
const ob02CheckpointHash=BASE_WORLD_SHA256
const provenance=JSON.parse(await readFile(`${root}/isc58-provenance.json`,'utf8'))
const worldSource=removeEbSwHook(removePlanRoundHook(await readFile(`${root}/world.js`,'utf8')))
assert.equal(sha256(removeIsc58Hook(worldSource)),ob02CheckpointHash,'El mundo base debe conservar todos los avances previos byte por byte.')
assert.equal(provenance.baseWorldSha256,ob02CheckpointHash)
assert.equal(provenance.worldSha256,currentWorldHash)
assert.deepEqual(provenance.preservedRegions,regionHashes(worldSource))
const runtimeSource=await readFile(`${root}/isc58-refinement.js`,'utf8')
assert(!runtimeSource.includes('sourceMappingURL'),'El activo público no debe enlazar código fuente privado.')
assert.equal(provenance.runtimeModuleSha256,sha256(runtimeSource))
const visorSource=removeEbSwHook(removePlanRoundHook(await readFile(`${root}/visor/assets/index-RoPA5goG.js`,'utf8'),'visor'),'visor')
assert.equal(sha256(removeIsc58VisorHook(visorSource)),BASE_VISOR_SHA256,'El visor base debe conservarse byte por byte.')
assert.equal(provenance.visorSha256,sha256(visorSource))
assert.equal(provenance.baseVisorSha256,BASE_VISOR_SHA256)
for(const [view,file] of [['plan','05-planta-ob02.png'],['street','06-calzada-ob02.png']]){
  const state=JSON.parse(await readFile(`${root}/evidence/OB-02/${view}-manifest.json`,'utf8'))
  assert(state.building==='OB-02'&&state.view===view&&state.file===file,'Evidencia de tarea OB-02 incorrecta.')
  assert(state.worldSha256==='4bdf262926cfd58d9d7dabf110a757e748e982797af2c4879e49265fad6d1fb3','No se debe reasignar el checkpoint histórico de planta/calzada.')
  assert(state.triangles>0&&state.calls>0&&state.renderer?.includes('WebGL 2.0'),'Falta render WebGL real.')
  assert(state.northUp===true&&state.projection?.includes('orthographic'),'La planta debe mostrar norte arriba.')
  assert(state.source?.includes('production builders')&&state.limits?.includes('not site photography or cadastral survey'),'Faltan fuente o límites.')
  assert(Math.abs(state.correctionMeters-1.4649078853)<.000001&&state.uncertainty?.positionMeters===5,'La corrección conserva incertidumbre y desplazamiento auditado.')
  assert(state.cameraPosition?.length===3&&state.cameraPosition.every(Number.isFinite),'Cámara de planta inválida.')
  const bytes=await readFile(`${root}/evidence/OB-02/${file}`)
  assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&bytes.readUInt32BE(16)===1280&&bytes.readUInt32BE(20)===800,`PNG de planta inválido: ${file}`)
  if(view==='street')assert(state.sections?.length===3&&state.sections.every(s=>Math.abs(s.widthMeters-5.6)<.01&&Math.abs(s.centerOffsetMeters)<1.1),'Faltan las tres secciones verificadas de la calzada.')
}
console.log('OB-02: planta y calzada con capturas independientes del checkpoint actual.')

const visualBaseline=JSON.parse(await readFile(`${root}/evidence/OB-02/progress-baseline.json`,'utf8'))
assert(visualBaseline.building==='OB-02'&&visualBaseline.task==='visual-baseline-before-point3'&&visualBaseline.captures?.length===1,'Falta la captura inicial anterior al punto 3.')
const initialView=visualBaseline.captures[0]
assert(initialView.cameraId==='OB-02-fixed-v1'&&initialView.file==='07-inicio-seguimiento.png'&&initialView.triangles>0&&initialView.renderer?.includes('WebGL 2.0'),'La cabecera debe usar un render inicial con cámara fija.')
const tracking=JSON.parse(await readFile('public/seguimiento-3d.json','utf8'))
const ob02Tracking=historicalOwner(tracking.blocks.flatMap(b=>b.buildings).find(b=>b.id==='OB-02'),'OB-02-fixed-v1')
assert(ob02Tracking.visualProgress?.cameraId===initialView.cameraId&&ob02Tracking.visualProgress.baseline.url===`levantamiento/evidence/OB-02/${initialView.file}`,'La matriz debe enlazar la captura inicial auditada.')

assert(visualBaseline.worldSha256==='4bdf262926cfd58d9d7dabf110a757e748e982797af2c4879e49265fad6d1fb3','La imagen inicial conserva el modelo previo al punto 3.')
const sidewalkA=JSON.parse(await readFile(`${root}/evidence/OB-02/sidewalkA-manifest.json`,'utf8'))
assert(sidewalkA.building==='OB-02'&&sidewalkA.task==='sidewalkA'&&sidewalkA.worldSha256==='7e5055049e02d22683548df7252674eec8248da16e9288c0f4257e816154d0b9','El punto 3 conserva su checkpoint histórico.')
assert(sidewalkA.captures?.length===3&&['progress','plan','pedestrian'].every(view=>sidewalkA.captures.some(s=>s.view===view)),'Se requieren avance de cabecera, planta y peatón.')
const progressView=sidewalkA.captures.find(s=>s.view==='progress')
for(const field of ['cameraId','cameraPosition','cameraTarget','cameraUp','projection','viewport','textureSize'])assert.deepEqual(progressView[field],initialView[field],`La toma de inicio/avance cambió: ${field}`)
// Earlier views retain their immutable checkpoints; point 8 is the current header.
for(const state of [initialView,...sidewalkA.captures]){
  assert(ob02EvidenceFiles.has(state.file)&&state.triangles>0&&state.calls>0&&state.renderer?.includes('WebGL 2.0'),'Captura de seguimiento inválida.')
  assert(state.sidewalkWidthMeters===1.2&&state.sidewalkUncertaintyMeters===.8&&state.source?.includes('production builders'),'Faltan perfil e incertidumbre de la banqueta.')
  const bytes=await readFile(`${root}/evidence/OB-02/${state.file}`)
  assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&bytes.readUInt32BE(16)===1280&&bytes.readUInt32BE(20)===800,`PNG de seguimiento inválido: ${state.file}`)
}
console.log('OB-02: punto 3 con planta/peatón y cabecera de inicio/avance desde idéntica cámara.')

const sidewalkB=JSON.parse(await readFile(`${root}/evidence/OB-02/sidewalkB-manifest.json`,'utf8'))
assert(sidewalkB.building==='OB-02'&&sidewalkB.task==='sidewalkB'&&sidewalkB.worldSha256==='d060f6f46e0952acd9230105bd90d1614b0bde55d2fb9b34394613c4c85b4001','El punto 4 conserva su checkpoint histórico.')
assert(sidewalkB.captures?.length===3&&['progress','plan','pedestrian'].every(view=>sidewalkB.captures.some(s=>s.view===view)),'Se requieren avance 04, planta y peatón norte.')
const progressB=sidewalkB.captures.find(s=>s.view==='progress')
for(const field of ['cameraId','cameraPosition','cameraTarget','cameraUp','projection','viewport','textureSize'])assert.deepEqual(progressB[field],initialView[field],`La toma de inicio/avance 04 cambió: ${field}`)
for(const state of sidewalkB.captures){
  assert(ob02EvidenceFiles.has(state.file)&&state.triangles>0&&state.calls>0&&state.renderer?.includes('WebGL 2.0'),'Captura norte inválida.')
  if(state.view==='pedestrian')assert(state.cameraFootwayHeight>=.09999&&state.cameraFootwayHeight<=.11751,'La cámara peatonal debe estar sobre la banqueta del modelo.')
  assert(state.sidewalkSide==='north'&&state.sidewalkWidthMeters===2&&state.sidewalkUncertaintyMeters===.8&&state.source?.includes('production builders'),'El norte conserva su ancho independiente de 2 m, con incertidumbre.')
  const bytes=await readFile(`${root}/evidence/OB-02/${state.file}`)
  assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&bytes.readUInt32BE(16)===1280&&bytes.readUInt32BE(20)===800,`PNG norte inválido: ${state.file}`)
}
console.log('OB-02: punto 4 norte y Avance 04 desde la cámara fija; evidencias anteriores conservadas.')

const corners=JSON.parse(await readFile(`${root}/evidence/OB-02/corners-manifest.json`,'utf8'))
assert(corners.building==='OB-02'&&corners.task==='corners'&&corners.worldSha256==='72a3b71f904a22ea6cd2c68bd534e93ddee90e49520d4826cc655f279e5a0225','El punto 5 conserva su checkpoint histórico.')
assert(corners.captures?.length===3&&['progress','plan','pedestrian'].every(view=>corners.captures.some(s=>s.view===view)),'Se requieren avance 05, planta y detalle de guarnición.')
const progressC=corners.captures.find(s=>s.view==='progress')
for(const field of ['cameraId','cameraPosition','cameraTarget','cameraUp','projection','viewport','textureSize'])assert.deepEqual(progressC[field],initialView[field],`La toma de inicio/avance 05 cambió: ${field}`)
assert(ob02Tracking.tasks.corners==='blocked'&&ob02Tracking.issues.corners?.detail,'El rebaje sin evidencia debe conservar su problema visible.')
for(const state of corners.captures){
  assert(ob02EvidenceFiles.has(state.file)&&state.triangles>0&&state.calls>0&&state.renderer?.includes('WebGL 2.0'),'Captura de guarnición inválida.')
  assert(state.ramps==='unverified'&&state.rampsAdded===0&&state.scope?.includes('midblock'),'No se debe atribuir una esquina o rampa inventada a OB-02.')
  if(state.view==='pedestrian')assert(state.cameraFootwayHeight>=.09999&&state.cameraFootwayHeight<=.11751,'El detalle debe capturarse desde la banqueta del modelo.')
  const bytes=await readFile(`${root}/evidence/OB-02/${state.file}`)
  assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&bytes.readUInt32BE(16)===1280&&bytes.readUInt32BE(20)===800,`PNG de guarnición inválido: ${state.file}`)
}
console.log('OB-02: guarnición continua, Avance 05 desde cámara fija y bloqueo de rampas explícito.')

const identity=JSON.parse(await readFile(`${root}/evidence/OB-02/identity-manifest.json`,'utf8'))
assert(identity.building==='OB-02'&&identity.task==='identity'&&identity.worldSha256==='72a3b71f904a22ea6cd2c68bd534e93ddee90e49520d4826cc655f279e5a0225','El punto 6 conserva su checkpoint histórico sin cambio de geometría.')
assert(identity.captures?.length===1,'Se requiere una captura de Avance 06.')
const progressI=identity.captures[0]
assert(progressI.file==='17-avance-punto06.png'&&progressI.view==='progress'&&progressI.triangles>0&&progressI.calls>0&&progressI.renderer?.includes('WebGL 2.0'),'Avance 06 debe ser un render real.')
for(const field of ['cameraId','cameraPosition','cameraTarget','cameraUp','projection','viewport','textureSize'])assert.deepEqual(progressI[field],initialView[field],`La toma de inicio/avance 06 cambió: ${field}`)
const identityPng=await readFile(`${root}/evidence/OB-02/${progressI.file}`)
assert(identityPng.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&identityPng.readUInt32BE(16)===1280&&identityPng.readUInt32BE(20)===800,'PNG de identidad inválido.')
const record=JSON.parse(await readFile(`${root}/evidence/OB-02/identity-record.json`,'utf8'))
assert(record.building==='OB-02'&&record.task==='identity'&&record.side==='south'&&record.references.length===4,'Falta el vínculo de identidad con los puntos y su contexto.')
assert(record.commercialAttribution.status==='unconfirmed for this facade'&&record.commercialAttribution.addressSource==='https://www.notariadomexicano.org.mx/directorio-colegios-nacionales/','El domicilio de un directorio no confirma por sí solo la fachada.')
const facadeRecord=JSON.parse(await readFile(`${root}/evidence/OB-02/facade-record.json`,'utf8'))
assert(ob02Tracking.tasks.identity==='done'&&ob02Tracking.name===facadeRecord.descriptiveName,'El nombre actual debe reflejar el recuento revisado de fachada.')
assert(facadeRecord.building==='OB-02'&&facadeRecord.task==='facade'&&facadeRecord.supersedes.file==='identity-record.json'&&facadeRecord.supersedes.previousCount===5,'La corrección de recuento debe conservar el registro anterior como histórico.')
const normalized=JSON.parse(await readFile(`${root}/data/amalaya-routes.json`,'utf8')).routes.find(r=>r.id==='R-001')
const routePhotos=JSON.parse(await readFile('public/recorrido/rutas.json','utf8')).rutas.find(r=>r.id==='R-001')
assert.deepEqual(record.references.map(r=>r.order),[2,3,4,5],'Se requieren dos vistas y contexto anterior/posterior.')
assert(record.references.find(r=>r.order===3).role==='primary-anchor'&&record.references.find(r=>r.order===4).role==='secondary-oblique-view','P03 es el ancla; P04 no es el centro del edificio.')
for(const ref of record.references){
 const point=normalized.points.find(p=>p.id===ref.routePointId),photo=routePhotos.puntos.find(p=>p.orden===ref.order)
 assert(point&&photo&&point.lat===ref.lat&&point.lng===ref.lng&&photo.lat===ref.lat&&photo.lng===ref.lng&&photo.id===ref.panoramaId,'La imagen debe estar ligada a las coordenadas originales correctas.')
 assert(ref.imagePath===`recorrido/${photo.id}.jpg`&&ref.imageHeadingDegrees===null&&ref.imageCaptureDate===null,'No se inventan orientación ni fecha de captura.')
 assert(createHash('sha256').update(await readFile(`public/${ref.imagePath}`)).digest('hex')===ref.imageSha256,'La referencia debe ser el panorama original, sin reemplazo.')
 const next=normalized.points.find(p=>p.order===point.order+1)
 const bearing=(Math.atan2((next.lng-point.lng)*97200,(next.lat-point.lat)*110950)*180/Math.PI+360)%360
 assert(Math.abs(bearing-ref.travelBearingDegrees)<.011,'El rumbo de marcha se calcula desde coordenadas consecutivas, no desde la imagen.')
}
assert.deepEqual(record.frontEstimate.start,JSON.parse(await readFile(`${root}/evidence/OB-02/plan-manifest.json`,'utf8')).frontStart,'Se conserva el frente alineado de OB-02.')
console.log('OB-02: identidad visual con P03/P04 y contexto P02/P05, rutas originales y Avance 06 desde cámara fija.')

const volumeBefore=JSON.parse(await readFile(`${root}/evidence/OB-02/volume-before-manifest.json`,'utf8'))
const volume=JSON.parse(await readFile(`${root}/evidence/OB-02/volume-manifest.json`,'utf8'))
assert(volumeBefore.building==='OB-02'&&volumeBefore.task==='volume-before'&&volumeBefore.worldSha256===identity.worldSha256,'El antes del punto 7 debe conservar el modelo anterior.')
assert(volume.building==='OB-02'&&volume.task==='volume'&&volume.worldSha256==='d42c8b38335695af1c87f22e9b264316adfc78252d8eaa76f2b9540bc1d72506','El punto 7 conserva su checkpoint histórico.')
assert(volumeBefore.captures?.length===1&&volumeBefore.captures[0].file==='19-envolvente-antes.png','Falta la captura anterior al cambio de envolvente.')
assert(volume.captures?.length===3&&['progress','volume','roof'].every(view=>volume.captures.some(s=>s.view===view)),'Se requieren Avance 07, detalle y planta de cubierta.')
const envelopeBefore=volumeBefore.captures[0],envelopeAfter=volume.captures.find(s=>s.view==='volume'),progressV=volume.captures.find(s=>s.view==='progress'),roofView=volume.captures.find(s=>s.view==='roof')
assert(Math.abs(envelopeBefore.envelope?.roofGapMeters-.16)<1e-6&&envelopeBefore.envelope.lateralReturns===0,'El antes registra el hueco real del modelo, sin encuentros laterales.')
assert(envelopeAfter.file==='20-envolvente-despues.png'&&roofView.file==='21-cubierta-planta.png'&&progressV.file==='18-avance-punto07.png','Archivos de volumen incorrectos.')
for(const field of ['cameraId','cameraPosition','cameraTarget','cameraUp','projection','viewport','textureSize']){
 assert.deepEqual(progressV[field],initialView[field],`La toma de inicio/avance 07 cambió: ${field}`)
 assert.deepEqual(envelopeAfter[field],envelopeBefore[field],`La toma antes/después de cubierta cambió: ${field}`)
}
assert.deepEqual(roofView.cameraUp,[0,0,-1],'La cubierta debe verse en planta con norte arriba.')
assert(roofView.cameraPosition[0]===roofView.cameraTarget[0]&&roofView.cameraPosition[2]===roofView.cameraTarget[2]&&roofView.cameraPosition[1]>roofView.cameraTarget[1],'La planta de cubierta debe ser vertical.')
for(const state of [...volumeBefore.captures,...volume.captures]){
 assert(ob02EvidenceFiles.has(state.file)&&state.triangles>0&&state.calls>0&&state.renderer?.includes('WebGL 2.0'),'Captura de volumen sin render real.')
 assert(state.envelope?.roofStatus==='interpreted flat envelope; rear and roof plane unverified','No se debe certificar la cubierta oculta.')
 assert.deepEqual(state.envelope.uncertainty,{positionMeters:5,lengthMeters:2,depthMeters:3,heightMeters:.6},'Las incertidumbres del volumen se conservan.')
 assert(Math.abs(state.envelope.frontMeters-16.60719146762562)<1e-6&&state.envelope.depthMeters===9,'El ajuste no modifica la huella provisional.')
 if(state!==envelopeBefore)assert(Math.abs(state.envelope.roofGapMeters)<1e-6&&state.envelope.lateralReturns===2,'La cubierta debe apoyarse y cerrar ambos encuentros laterales.')
 if(state.view!=='progress')assert(state.isolated===true&&state.source.includes('neutral ground'),'El detalle aislado debe declararse como auditoría, no ciudad completa.')
 const bytes=await readFile(`${root}/evidence/OB-02/${state.file}`)
 assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&bytes.readUInt32BE(16)===1280&&bytes.readUInt32BE(20)===800,`PNG de volumen inválido: ${state.file}`)
}
assert(ob02Tracking.tasks.volume==='blocked'&&ob02Tracking.issues.volume?.detail,'La verificación métrica de fondo/cubierta requiere evidencia explícita.')
console.log('OB-02: punto 7 con apoyo de cubierta, dos encuentros laterales, antes/después equivalente y medidas pendientes visibles.')

const facade=JSON.parse(await readFile(`${root}/evidence/OB-02/facade-manifest.json`,'utf8'))
assert(facade.building==='OB-02'&&facade.task==='facade'&&facade.worldSha256==='a321271639c3428048e69ff9ebeaf2ac334a605d9c083d6cf6969f89c8e130a5','La fachada conserva su checkpoint histórico del punto 8.')
assert(facade.captures?.length===3&&['progress','facade','facade-detail'].every(view=>facade.captures.some(s=>s.view===view)),'Faltan Avance 08, fachada completa o coronamiento.')
assert(facadeRecord.observations.openingCount===7&&facadeRecord.observations.pilasterCount===8&&facadeRecord.observations.primaryImageInspection.wrapsAcrossSeam===true,'El recuento debe revisar el frente completo, incluida la unión del panorama.')
assert.deepEqual(facadeRecord.observations.fromWestToEast,['narrow','wide','narrow','central portal','narrow','wide','narrow'])
for(const ref of facadeRecord.references){
 assert(record.references.some(r=>r.order===ref.order&&r.panoramaId===ref.panoramaId&&r.imageSha256===ref.imageSha256),'La fachada debe usar las referencias originales de identidad.')
 assert(createHash('sha256').update(await readFile(`public/${ref.imagePath}`)).digest('hex')===ref.imageSha256,'La fotografía de consulta debe permanecer intacta.')
}
const progressF=facade.captures.find(s=>s.view==='progress')
for(const field of ['cameraId','cameraPosition','cameraTarget','cameraUp','projection','viewport','textureSize'])assert.deepEqual(progressF[field],initialView[field],`La toma de inicio/avance 08 cambió: ${field}`)
for(const state of facade.captures){
 assert(ob02EvidenceFiles.has(state.file)&&state.triangles>0&&state.calls>0&&state.renderer?.includes('WebGL 2.0'),'La fachada requiere renders WebGL reales.')
 assert(state.facade?.bays===7&&state.facade.continuousPlinth===true&&state.facade.volutes===16,'Faltan los siete vanos, el zócalo o los capiteles revisados.')
 assert.deepEqual(state.facade.bayWidthsMeters,facadeRecord.modelEstimates.openingWidthsMeters,'El modelo debe conservar el ritmo de vanos registrado, con anchuras estimadas.')
 assert(state.facade.pilasterCentersMeters.length===8,'Se requieren ocho pilastras.')
 const bytes=await readFile(`${root}/evidence/OB-02/${state.file}`)
 assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&bytes.readUInt32BE(16)===1280&&bytes.readUInt32BE(20)===800,`PNG de fachada inválido: ${state.file}`)
 if(state.view!=='progress')assert(state.isolated===true&&state.source.includes('neutral ground'),'La vista aislada de fachada debe declarar su alcance.')
}
assert(ob02Tracking.tasks.facade==='blocked'&&ob02Tracking.issues.facade?.detail,'La verificación métrica de proporciones conserva su problema explícito.')
console.log('OB-02: siete vanos documentados, ocho pilastras, zócalo continuo y Avance 08 desde cámara fija.')

const finish=JSON.parse(await readFile(`${root}/evidence/OB-02/finish-manifest.json`,'utf8'))
assert(finish.building==='OB-02'&&finish.task==='finish'&&finish.worldSha256==='70a5df5768f25a99ea408b5885cabcf50b4e79927287745136aa7e4647821428','Los acabados conservan su checkpoint histórico del punto 9.')
assert(finish.captures?.length===3&&['progress','finish-detail','facade'].every(view=>finish.captures.some(s=>s.view===view)),'Faltan Avance 09, detalle y fachada de acabados.')
const progressM=finish.captures.find(s=>s.view==='progress')
for(const field of ['cameraId','cameraPosition','cameraTarget','cameraUp','projection','viewport','textureSize'])assert.deepEqual(progressM[field],initialView[field],`La toma de inicio/avance 09 cambió: ${field}`)
for(const state of finish.captures){
 assert(state.triangles>0&&state.calls>0&&state.renderer?.includes('WebGL 2.0'),'Acabados sin render real.')
 assert(state.facade.bays===7&&state.finish.verticalStoneJoints>20&&state.finish.portalFrames===8,'Faltan juntas o marcos ornamentales de portal.')
 assert(state.finish.materials.length>=3&&state.finish.materials.every(m=>m.source==='procedural'&&m.photographic===false&&m.resolution===512&&m.tileMeters===1&&m.normalMap&&m.roughnessMap&&m.metalnessMap),'Los materiales deben ser PBR originales con UV métricas.')
 const bytes=await readFile(`${root}/evidence/OB-02/${state.file}`)
 assert(ob02EvidenceFiles.has(state.file)&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&bytes.readUInt32BE(16)===1280&&bytes.readUInt32BE(20)===800,`PNG de acabados inválido: ${state.file}`)
}
assert(ob02Tracking.tasks.finish==='done','Acabados debe registrar su entrega visual verificada.')
console.log('OB-02: acabados originales, juntas en paños sólidos y Avance 09 desde cámara fija.')

const equipment=JSON.parse(await readFile(`${root}/evidence/OB-02/equipment-manifest.json`,'utf8'))
const equipmentRecord=JSON.parse(await readFile(`${root}/evidence/OB-02/equipment-record.json`,'utf8'))
assert(equipment.building==='OB-02'&&equipment.task==='equipment'&&equipment.worldSha256===ob02CheckpointHash,'Equipamiento OB-02 conserva el checkpoint previo a ISC-58.')
assert(equipment.captures?.length===3&&['progress','equipment-plan','equipment-detail'].every(view=>equipment.captures.some(s=>s.view===view)),'Faltan avance, planta o detalle de bolardo.')
const progressE=equipment.captures.find(s=>s.view==='progress')
for(const field of ['cameraId','cameraPosition','cameraTarget','cameraUp','projection','viewport','textureSize'])assert.deepEqual(progressE[field],initialView[field],`La toma de inicio/avance 10 cambió: ${field}`)
for(const state of equipment.captures){
 assert(state.triangles>0&&state.calls>0&&state.renderer?.includes('WebGL 2.0'),'Equipamiento sin render WebGL.')
 assert(state.equipment.updatedBollards===1&&state.equipment.newAnchors===0&&state.equipment.addedCables===0&&state.equipment.addedVehicles===0,'No se inventan anclas, cables o vehículos.')
 assert(state.equipment.survey.position.includes('not surveyed')&&Math.abs(state.equipment.bounds.min[1]-.1175)<1e-7,'El bolardo debe declarar ancla aproximada y apoyo real en el pavimento del modelo.')
 const bytes=await readFile(`${root}/evidence/OB-02/${state.file}`)
 assert(ob02EvidenceFiles.has(state.file)&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&bytes.readUInt32BE(16)===1280&&bytes.readUInt32BE(20)===800,`PNG de equipamiento inválido: ${state.file}`)
}
assert(equipmentRecord.inventory.length===6&&equipmentRecord.openRequirements.length===3,'Falta inventario o pendientes de localización.')
for(const ref of equipmentRecord.references)assert(record.references.some(r=>r.panoramaId===ref.panoramaId&&r.imageSha256===ref.imageSha256),'Inventario sin referencias originales.')
assert(ob02Tracking.tasks.equipment==='blocked'&&ob02Tracking.issues.equipment?.detail,'No se cierra ubicación exacta sin anclas verificadas.')

console.log('OB-02: inventario documentado, bolardo apoyado y Avance 10 desde cámara fija; posiciones pendientes visibles.')

const qa=JSON.parse(await readFile(`${root}/evidence/OB-02/qa-manifest.json`,'utf8'))
const qaRecord=JSON.parse(await readFile(`${root}/evidence/OB-02/qa-record.json`,'utf8'))
assert(qa.building==='OB-02'&&qa.task==='qa'&&qa.worldSha256===ob02CheckpointHash,'QA de OB-02 conserva el checkpoint auditado previo a ISC-58.')
assert(qa.captures?.length===5&&['progress','qa-plan','qa-block','qa-pedestrian','qa-isolated'].every(v=>qa.captures.some(s=>s.view===v)),'Faltan las cinco capturas de QA.')
const progressQ=qa.captures.find(s=>s.view==='progress')
for(const field of ['cameraId','cameraPosition','cameraTarget','cameraUp','projection','viewport','textureSize'])assert.deepEqual(progressQ[field],initialView[field],`La toma de inicio/avance 11 cambió: ${field}`)
const qaViews=qa.captures.filter(s=>s.comparison),qaPed=qaViews.find(s=>s.view==='qa-pedestrian'),qaBlock=qaViews.find(s=>s.view==='qa-block'),qaIsolated=qaViews.find(s=>s.view==='qa-isolated')
const aligned=JSON.parse(await readFile(`${root}/evidence/OB-02/plan-manifest.json`,'utf8'))
const p03=normalized.points.find(p=>p.order===3)
const qaHeading=(Math.atan2(((aligned.frontStart.lon+aligned.frontEnd.lon)/2-p03.lng)*97200,((aligned.frontStart.lat+aligned.frontEnd.lat)/2-p03.lat)*110950)*180/Math.PI+360)%360
for(const s of qaViews){
 assert(s.comparison.point==='R-001-P03'&&s.comparison.lat===p03.lat&&s.comparison.lon===p03.lng,'Ancla de comparación incorrecta.')
 assert(Math.abs(s.comparison.azimuth-qaHeading)<1e-6&&s.cameraPosition[0]===qaPed.cameraPosition[0]&&s.cameraPosition[2]===qaPed.cameraPosition[2],'Las vistas deben compartir ancla X/Z y rumbo del frente alineado.')
 assert(s.overlayGeometryOcclusion===false,'La nueva comparación no lleva etiquetas sobre geometría.')
}
assert(qaPed.cameraPosition[1]===1.68&&qaBlock.cameraPosition[1]===12&&qaPed.projection.fov===85&&qaBlock.projection.fov===85,'Alturas/FOV de comparación incorrectos.')
assert(qaViews.find(s=>s.view==='qa-plan').comparison.planUpIsAzimuth===true,'La planta orienta la parte superior por el azimut, no afirma norte arriba.')
for(const field of ['cameraPosition','cameraTarget','projection','cameraUp'])assert.deepEqual(qaIsolated[field],qaBlock[field],'Vista limpia debe usar la cámara de bloque.')
const consultation=qa.referenceConsultation
assert(consultation.triangles>0&&consultation.calls>0&&consultation.renderer.includes('WebGL 2.0'),'La referencia debe consultarse en render real.')
assert.deepEqual(consultation.cameraPosition,qaPed.cameraPosition);assert.deepEqual(consultation.projection,qaPed.projection)
assert(consultation.reference.captureHeadingDegrees===null&&consultation.reference.captureDate===null&&consultation.reference.northRegistration.includes('unverified'),'No se inventa el norte o fecha del panorama.')
assert(consultation.reference.imageSha256===record.references.find(r=>r.order===3).imageSha256,'La consulta usa el JPG original de P03.')
for(const s of qa.captures){
 assert(s.triangles>0&&s.calls>0&&s.renderer?.includes('WebGL 2.0'),'QA requiere renders reales.')
 const bytes=await readFile(`${root}/evidence/OB-02/${s.file}`)
 assert(ob02EvidenceFiles.has(s.file)&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&bytes.readUInt32BE(16)===1280&&bytes.readUInt32BE(20)===800,`PNG de QA inválido: ${s.file}`)
}
assert(qaRecord.resolved.includes('overlay obstruction')&&qaRecord.open.includes('absolute panorama north registration')&&qaRecord.discrepancies.length>=3,'Faltan resultados reales y discrepancias del QA.')
assert(ob02Tracking.tasks.qa==='blocked'&&ob02Tracking.issues.qa?.detail,'La orientación no verificada sigue siendo un problema explícito.')
assert(ob02Tracking.visualProgress.current.url===`levantamiento/evidence/OB-02/${progressQ.file}`&&ob02Tracking.visualProgress.current.worldSha256===ob02CheckpointHash,'La cabecera OB-02 conserva Avance 11 de su checkpoint.')
console.log('OB-02: planta/bloque/peatón desde P03, captura limpia y consulta original reproducible; norte de panorama pendiente.')

// ISC-58: the original review remains an immutable historical checkpoint.
const isc=JSON.parse(await readFile(`${root}/evidence/ISC-58/manifest.json`,'utf8'))
assert.equal(isc.building,'ISC-58')
assert.equal(isc.worldSha256,'fa61d9c7aa4f4e651efd55d96bf6f2627b20c8919c06f8465a250d79a190ff39')
assert.deepEqual(isc.errors,[],'La captura ISC-58 debe terminar sin errores de ejecución.')
assert.equal(isc.anchor.point,'R-001-P05')
assert.equal(isc.anchor.lat,29.0759512)
assert.equal(isc.anchor.lon,-110.9546564)
assert(Math.abs(isc.anchor.azimuth-355.06583118825637)<1e-9)
const comparedIsc=isc.captures.filter(c=>['plan','block','pedestrian'].includes(c.view))
assert.equal(comparedIsc.length,3)
for(const c of comparedIsc){
  assert(c.triangles>0&&c.calls>0&&c.renderer.includes('WebGL 2.0'))
  assert.equal(c.cameraPosition[0],isc.anchor.x)
  assert.equal(c.cameraPosition[2],isc.anchor.z)
  assert(Math.abs((c.view==='plan'?c.planScreenUpAzimuth:c.measuredAzimuth)-isc.anchor.azimuth)<1e-8)
}
for(const c of isc.captures){
 assert.equal(sha256(await readFile(`${root}/evidence/ISC-58/${c.file}`)),c.imageSha256,'Cada captura debe conservar sus bytes auditados.')
 assert(c.triangles>0&&c.calls>0&&c.renderer.includes('WebGL 2.0'))
}
assert.equal(isc.runtimeModuleSha256,'aa19477c64ed55e8e5832da886d5f8a051b036ab0e52248c44299f737590ff8c')
assert.equal(isc.visorSha256,'f6f137cab022f5cd5722a41de6f012bd694746edc8e976a4f3752945dc249a1b')
const iscRepairs=[]
for(const [task,file]of [['sidewalkA','sidewalkA-repair-manifest.json'],['sidewalkB','sidewalkB-repair-manifest.json']]){
 let repair
 try{repair=JSON.parse(await readFile(`${root}/evidence/ISC-58/${file}`,'utf8'))}catch(error){if(error.code==='ENOENT')continue;throw error}
 assert.equal(repair.building,'ISC-58')
 assert.equal(repair.task,task)
 assert.deepEqual(repair.errors,[])
 assert.equal(repair.captures.length,2,'Cada reparación tiene vista baja y avance propios.')
 assert(repair.captures.some(c=>c.view==='progress'))
 for(const c of repair.captures){
  assert.equal(sha256(await readFile(`${root}/evidence/ISC-58/${c.file}`)),c.imageSha256)
  assert(c.triangles>0&&c.calls>0&&c.renderer.includes('WebGL 2.0'))
 }
 iscRepairs.push(repair)
}
const iscLatest=iscRepairs.at(-1)||isc
if(iscRepairs.length===2)assert.equal(iscLatest.previousWorldSha256,iscRepairs[0].worldSha256,'04 debe conservar y enlazar el checkpoint real de03.')
assert.equal(iscLatest.worldSha256,currentWorldHash,'El avance actual exige capturas nuevas del modelo actual.')
assert.equal(iscLatest.runtimeModuleSha256,provenance.runtimeModuleSha256)
assert.equal(iscLatest.visorSha256,provenance.visorSha256)
// Historical WebGL images keep their original dimensions. Round 02 software
// projections have separate hash/dimension checks in pruebas-calzadas.mjs.
for(const file of (await readdir(`${root}/evidence/ISC-58`)).filter(f=>f.endsWith('.png')&&!roundProgressFiles.has(f))){
  const bytes=await readFile(`${root}/evidence/ISC-58/${file}`)
  assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))
  assert.equal(bytes.readUInt32BE(16),1280)
  assert.equal(bytes.readUInt32BE(20),800)
}
const identityIsc=JSON.parse(await readFile(`${root}/evidence/ISC-58/identity-plan-record.json`,'utf8'))
assert.equal(identityIsc.cartographicSource.osmWayId,664499024)
assert.equal(identityIsc.footprint.polygonLocalOpen.length,7)
for(const k of ['heightMeters','roofShape','absolutePositionAccuracyMeters','dimensionUncertaintyMeters'])assert.equal(identityIsc.footprint[k],null,'No se inventan cotas ni precisión cartográfica.')
for(const ref of identityIsc.referenceAnchors){
 const name=ref.existingPanoramaReferenceUrl.split('/').at(-1)
 assert.equal(sha256(await readFile(`public/recorrido/${name}`)),ref.existingPanoramaSha256)
 assert.equal(ref.captureHeadingVerified,false)
 assert.equal(ref.captureDateVerified,false)
}
const iscTracking=historicalOwner(tracking.blocks.flatMap(b=>b.buildings).find(b=>b.id==='ISC-58'),'ISC-58-fixed-v1')
assert.deepEqual(Object.keys(iscTracking.tasks),Object.keys(tracking.taskDefinitions),'ISC-58 debe registrar las once acciones en orden.')
for(const task of ['plan','corners','volume','facade','equipment','qa'])assert.equal(iscTracking.tasks[task],'blocked','La revisión técnica conserva los pendientes físicos.')
if(iscTracking.tasks.identity==='done'){
 const identity=JSON.parse(await readFile(`${root}/evidence/ISC-58/identity-record.json`,'utf8'))
 assert.equal(identity.status,'done')
 assert.equal(identity.buildingId,'ISC-58')
 assert.equal(identity.taskId,'identity')
 assert.equal(identity.identity.observedNumber,'58')
 assert.equal(identity.identity.redAdjacentFacadeAdministrativeAttribution,null)
 assert.equal(identity.identity.accessMeasuredWgs84,null)
 assert.equal(identity.panoramaReferences.length,2)
 for(const ref of identity.panoramaReferences){
  assert(/^public\/recorrido\/[A-Za-z0-9_-]+\.jpg$/.test(ref.sourceFile))
  assert.equal(sha256(await readFile(ref.sourceFile)),ref.sha256)
  assert.equal(ref.coordinateSource.file,'public/recorrido/rutas.json')
  assert.equal(sha256(await readFile(ref.coordinateSource.file)),ref.coordinateSource.sha256)
  const routes=JSON.parse(await readFile(ref.coordinateSource.file,'utf8'))
  const waypoint=routes.rutas.find(route=>route.id===ref.routeId)?.puntos.find(point=>point.orden===ref.waypointOrder)
  assert(waypoint,'La ficha debe vincular un punto existente de la ruta canónica.')
  assert.equal(waypoint.id,ref.panoramaId)
  assert.equal(waypoint.lat,ref.routeAnchorWgs84.lat)
  assert.equal(waypoint.lng,ref.routeAnchorWgs84.lng)
  assert.equal(ref.originalByteMatchVerified,true)
  for(const field of ['photoCameraCenterWgs84','photoHeadingDegrees','photoCaptureDate'])assert.equal(ref[field],null)
 }
}else assert.equal(iscTracking.tasks.identity,'blocked')
for(const [task,items]of Object.entries(iscTracking.evidence)){
 assert(iscTracking.taskDetails[task]&&items.length>0)
 for(const item of items)await stat(`public/${item.url}`)
}
const reviewIsc=JSON.parse(await readFile(`${root}/evidence/ISC-58/review-record.json`,'utf8'))
assert.deepEqual(reviewIsc.actions.map(a=>a.task),Object.keys(tracking.taskDefinitions))
assert.equal(reviewIsc.worldSha256,currentWorldHash)
assert.equal(iscTracking.visualProgress.current.worldSha256,currentWorldHash)
console.log('ISC-58: once acciones, referencias originales, cámaras coincidentes y checkpoints anteriores preservados.')

const iscBaseline=JSON.parse(await readFile(`${root}/evidence/ISC-58/progress-baseline.json`,'utf8'))
const iscPlan=JSON.parse(await readFile(`${root}/evidence/ISC-58/plan-manifest.json`,'utf8'))
const iscRecord=JSON.parse(await readFile(`${root}/evidence/ISC-58/plan-record.json`,'utf8'))
const iscHistoricalTracking=historicalOwner(tracking.blocks.flatMap(b=>b.buildings).find(b=>b.id==='ISC-58'),'ISC-58-fixed-v1')
assert(iscBaseline.building==='ISC-58'&&iscBaseline.task==='visual-baseline-before-point01'&&iscBaseline.cameraId==='ISC-58-fixed-v1','Falta la cabecera de inicio fija de ISC-58.')
assert(iscPlan.building==='ISC-58'&&iscPlan.route==='R-001'&&iscPlan.task==='plan'&&iscPlan.captures?.length===2,'Falta el registro de planta y avance 01 de ISC-58.')
assert(iscRecord.status==='blocked'&&iscRecord.issue?.detail?.includes('orientación de consulta'),'El bloqueo de planta debe señalar la evidencia precisa que falta.')
const iscRaw=iscPlan.captures.find(s=>s.file==='00-inicio-webgl-raw.png'),iscCurrent=iscPlan.captures.find(s=>s.file==='00-inicio-seguimiento.png')
assert(iscRaw?.cameraId==='ISC-58-fixed-v1'&&iscCurrent?.cameraId===iscRaw.cameraId,'Inicio y avance deben usar la cámara fija ISC-58.')
assert(iscRaw.triangles===424695&&iscRaw.calls>0&&iscRaw.renderer?.includes('WebGL 2.0'),'La imagen inicial debe corresponder a un render WebGL inspeccionable.')
assert(iscCurrent.sharedBaselineAndCurrent===true&&iscCurrent.annotatedFrom===iscRaw.file,'Las anotaciones deben derivar del frame real preservado.')
assert(iscCurrent.worldSha256===ob02CheckpointHash&&iscRaw.worldSha256===ob02CheckpointHash,'Las capturas históricas del punto 01 deben conservar su checkpoint original.')
assert(iscRaw.route?.some(p=>p.id==='R-001-P03'&&p.panoramaId==='Apyr0uKeZr_XWmfLfLeBjQ')&&iscRaw.route?.some(p=>p.id==='R-001-P04'&&p.panoramaId==='h45BeWMtTog-TgjPTSYn6g'),'Falta la asociación de fuente R-001 P03/P04.')
assert(Math.abs(iscRaw.p03ToP04TravelBearingDegrees-84.115647)<.001&&iscRaw.candidateFootprint?.osmWayId===664499024,'Heading de marcha u OSM candidato incorrecto.')
for(const file of ['00-inicio-webgl-raw.png','00-inicio-seguimiento.png']){
 const bytes=await readFile(`${root}/evidence/ISC-58/${file}`)
 assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&bytes.readUInt32BE(16)===1280&&bytes.readUInt32BE(20)===800,`PNG ISC-58 inválido: ${file}`)
}
assert(iscHistoricalTracking?.tasks.plan==='blocked'&&iscHistoricalTracking.issues?.plan?.detail,'La celda de planta debe conservar su blocker rojo.')
assert(iscHistoricalTracking.visualProgress?.cameraId===iscBaseline.cameraId&&iscHistoricalTracking.visualProgress.baseline.url===`levantamiento/evidence/ISC-58/00-inicio-webgl-raw.png`,'La cabecera pública debe mostrar el estado actual de ISC-58.')
console.log('ISC-58: punto 01 con frame WebGL 2.0, cámara fija, fuente OSM y bloqueo de frente documentado.')

const iscProgress=iscLatest.captures.find(c=>c.view==='progress')
assert.equal(iscProgress.cameraId,iscRaw.cameraId)
for(const field of ['cameraPosition','cameraTarget','cameraUp','projection','viewport'])assert.deepEqual(iscProgress[field],iscRaw[field],`La cabecera ISC conserva cámara fija: ${field}`)
assert.equal(iscTracking.visualProgress.current.url,`levantamiento/evidence/ISC-58/${iscProgress.file}`)

// EB-SW extends the preserved ISC checkpoint; old screenshots retain their original hashes.
const ebRoot=`${root}/evidence/EB-SW`
const eb=JSON.parse(await readFile(`${root}/ebsw-provenance.json`,'utf8'))
const ebModule=await readFile(`${root}/ebsw-refinement.js`,'utf8')
assert.equal(eb.baseWorldSha256,EB_BASE_WORLD);assert.equal(eb.baseVisorSha256,EB_BASE_VISOR)
assert.equal(eb.worldSha256,sha256(removePlanRoundHook(await readFile(`${root}/world.js`,'utf8'))))
assert.equal(eb.visorSha256,sha256(removePlanRoundHook(await readFile(`${root}/visor/assets/index-RoPA5goG.js`,'utf8'),'visor')))
assert.equal(eb.runtimeModuleSha256,sha256(ebModule));assert(!ebModule.includes('sourceMappingURL'))
const ebManifest=JSON.parse(await readFile(`${ebRoot}/manifest.json`,'utf8'))
const ebSequence=JSON.parse(await readFile(`${ebRoot}/sequence.json`,'utf8'))
const ebSurvey=JSON.parse(await readFile(`${ebRoot}/survey.json`,'utf8'))
const ebTracking=historicalOwner(tracking.blocks.flatMap(b=>b.buildings).find(b=>b.id==='EB-SW'),'EB-SW-fixed-v1')
const expectedTasks=Object.keys(tracking.taskDefinitions)
assert.deepEqual(ebSequence.steps.map(s=>s.task),expectedTasks)
assert.equal(ebSequence.events.length,22)
for(let i=0;i<11;i++){
 const [start,end]=ebSequence.events.slice(i*2,i*2+2),step=ebSequence.steps[i],task=expectedTasks[i]
 assert.equal(start.task,task);assert.equal(end.task,task);assert.equal(start.state,'active');assert.equal(end.state,step.state);assert.equal(ebTracking.tasks[task],step.state)
 assert(Date.parse(end.at)>=Date.parse(start.at));if(i)assert(Date.parse(start.at)>=Date.parse(ebSequence.events[i*2-1].at))
 if(step.state==='blocked')assert(ebTracking.issues[task]?.detail)
}
assert.equal(ebSequence.state,'incomplete');assert(!Object.values(ebTracking.tasks).includes('active'))
assert.equal(ebSequence.currentWorldSha256,eb.worldSha256)
const beforeEb=removeEbSwHook(removePlanRoundHook(await readFile(`${root}/world.js`,'utf8')))
for(const c of ebManifest.captures){
 assert(c.renderer.includes('WebGL 2.0')&&c.calls>0&&c.triangles>0&&c.errors.length===0)
 const bytes=await readFile(`${ebRoot}/${c.file}`);assert.equal(sha256(bytes),c.sha256);assert.equal(bytes.readUInt32BE(16),1280);assert.equal(bytes.readUInt32BE(20),800)
 const stage=c.refinement?.stage
 assert.equal(c.worldSha256,stage?sha256(refineEbSw(beforeEb,'world',eb.runtimeModuleSha256,stage)):EB_BASE_WORLD,'Capture checkpoint must be reproducible from its actual stage')
}
const ebStart=ebManifest.captures.find(c=>c.file==='00-general.png'),ebCurrent=ebManifest.captures.find(c=>c.file==='09-general.png')
for(const key of ['cameraPosition','cameraTarget','cameraUp','projection'])assert.deepEqual(ebStart[key],ebCurrent[key])
assert.equal(ebTracking.visualProgress.current.url,`${ebRoot.replace('public/','')}/${ebCurrent.file}`)
assert.equal(ebTracking.visualProgress.current.worldSha256,ebCurrent.worldSha256)
const comparisons=ebManifest.captures.filter(c=>c.file.startsWith('11-'))
assert.equal(comparisons.length,3)
for(const c of comparisons){assert.deepEqual(c.anchor,comparisons[0].anchor);assert.equal(c.cameraPosition[0],comparisons[0].cameraPosition[0]);assert.equal(c.cameraPosition[2],comparisons[0].cameraPosition[2]);assert.equal(c.worldSha256,eb.worldSha256)}
for(const ref of ebSurvey.sources){assert.equal(sha256(await readFile(`public/${ref.file}`)),ref.sha256);assert.equal(ref.captureDate,null);assert.equal(ref.panoramaHeading,null)}
assert.equal(ebSurvey.identity.neighbour.attributedToClub,false)
console.log('EB-SW: once acciones ordenadas, capturas por etapa reproducibles, fuentes y cierre incompleto verificados.')

await import('./pruebas-plantas.mjs')

await import('./pruebas-calzadas.mjs')

await import('./pruebas-banquetas.mjs')

await import('./pruebas-revision-plantas.mjs');

await import('./pruebas-lamina.mjs');
