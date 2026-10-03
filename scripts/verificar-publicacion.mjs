import { readdir, readFile, stat } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
const root='public/levantamiento'
const approved=new Set(['amalaya-observations.json','amalaya-routes.json','cerro-elevation.json','osm-context.json','osm-plaza-hidalgo.json','sector-survey.json'])
const ob01EvidenceFiles=new Set(['01-planta.png','02-calzada.png','03-banqueta-sur.png','04-banqueta-norte.png','05-esquinas.png','06-identidad.png','07-volumen.png','08-fachada.png','09-materiales.png','10-equipamiento.png','11a-planta.png','11b-bloque.png','11c-peaton.png','manifest.json'])
const ob02EvidenceFiles=new Set(['01-fachada-p03.png','02-conjunto-p03.png','03-edificio-aislado-p03.png','04-retorno-oblicuo-p04.png','manifest.json','05-planta-ob02.png','plan-manifest.json','06-calzada-ob02.png','street-manifest.json','07-inicio-seguimiento.png','progress-baseline.json','08-avance-punto03.png','09-banqueta-sur-planta.png','10-banqueta-sur-peaton.png','sidewalkA-manifest.json','11-avance-punto04.png','12-banqueta-norte-planta.png','13-banqueta-norte-peaton.png','sidewalkB-manifest.json','14-avance-punto05.png','15-guarniciones-planta.png','16-guarnicion-detalle.png','corners-manifest.json','17-avance-punto06.png','identity-manifest.json','identity-record.json'])
for(const file of ['18-avance-punto07.png','19-envolvente-antes.png','20-envolvente-despues.png','21-cubierta-planta.png','volume-before-manifest.json','volume-manifest.json'])ob02EvidenceFiles.add(file)
for(const file of ['22-avance-punto08.png','23-fachada-siete-vanos.png','24-coronamiento.png','facade-manifest.json','facade-record.json'])ob02EvidenceFiles.add(file)
for(const file of ['25-avance-punto09.png','26-materiales-detalle.png','27-fachada-acabados.png','finish-manifest.json'])ob02EvidenceFiles.add(file)
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

// Point 1/2 evidence retains its historical checkpoint; point 3 has separate captures.
const currentWorldHash=createHash('sha256').update(await readFile(`${root}/world.js`)).digest('hex')
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
const ob02Tracking=tracking.blocks.flatMap(b=>b.buildings).find(b=>b.id==='OB-02')
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
assert(finish.building==='OB-02'&&finish.task==='finish'&&finish.worldSha256===currentWorldHash,'Los acabados deben corresponder al modelo vigente.')
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
assert(ob02Tracking.visualProgress.current.url===`levantamiento/evidence/OB-02/${progressM.file}`&&ob02Tracking.visualProgress.current.worldSha256===currentWorldHash,'La cabecera debe mostrar Avance 09 vigente.')
console.log('OB-02: acabados originales, juntas en paños sólidos y Avance 09 desde cámara fija.')
