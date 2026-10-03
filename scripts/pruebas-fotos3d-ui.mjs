import { chromium } from '../herramientas/simulador/node_modules/playwright/index.mjs'
import http from 'node:http'
import { tmpdir } from 'node:os'
import { readFileSync,existsSync,statSync,mkdirSync,writeFileSync,mkdtempSync } from 'node:fs'
import { join,extname } from 'node:path'
import assert from 'node:assert/strict'
const dir=new URL('../dist/',import.meta.url).pathname
const captures=mkdtempSync(join(tmpdir(),'amalaya-fotos3d-'))+'/'
mkdirSync(captures,{recursive:true})
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg'}
const web=http.createServer((req,res)=>{
 let path=new URL(req.url,'http://x').pathname.replace(/^\/amalaya-board\//,'/');let file=join(dir,path)
 if(existsSync(file)&&statSync(file).isDirectory())file=join(file,'index.html')
 if(!existsSync(file)){res.writeHead(404);return res.end()}
 res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream'});res.end(readFileSync(file))
})
await new Promise(r=>web.listen(0,'127.0.0.1',r))
const origin=`http://127.0.0.1:${web.address().port}`
const browser=await chromium.launch({...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE} : {})})
let uploads=0,reports=[],failReport=true,failUpload=false;const errors=[]
const context=await browser.newContext({viewport:{width:390,height:844}})
await context.route('**/*',async r=>{
 if(r.request().url().startsWith(origin))return r.continue()
 if(r.request().url().startsWith('https://script.google.com/')){
  const b=JSON.parse(r.request().postData());assert.equal(b.codigo,'SYNTHETIC')
  if(b.action==='subirArchivo'){
   uploads++;assert.equal(b.privado,true);assert.match(b.espacio_id,/^levantamiento-/);assert.equal(b.mime,'image/jpeg');assert.ok(b.base64.length>0)
   if(failUpload)return r.abort('failed')
   return r.fulfill({json:{ok:true,fila:{file_id:`private-synthetic-${uploads}`,nombre:b.nombre}}})
  }
  assert.equal(b.action,'chinche');reports.push(b.chinche)
  if(failReport){failReport=false;return r.abort('failed')}
  return r.fulfill({json:{ok:true,id:b.chinche.id}})
 }
 return r.abort()
})
await context.addInitScript(()=>{if(!localStorage.getItem('amalaya_sesion'))localStorage.setItem('amalaya_sesion',JSON.stringify({codigo:'SYNTHETIC',rol:'admin',nombre:'QA',ts:1}))})
const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(60000)
const open=()=>page.getByRole('button',{name:'OB-01: Corregir esquinas, guarniciones y rampas — Problema',exact:true}).click()
try{
 await page.goto(origin+'/amalaya-board/seguimiento-3d.html',{waitUntil:'domcontentloaded',timeout:60000});await open()
 assert.equal(await page.locator('input[capture]').getAttribute('capture'),'environment')
 const data=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=100;c.height=80;const x=c.getContext('2d');x.fillStyle='#cc8855';x.fillRect(0,0,100,80);return c.toDataURL().split(',')[1]})
 const file={name:'synthetic.png',mimeType:'image/png',buffer:Buffer.from(data,'base64')}
 await page.locator('input[multiple]').setInputFiles([file,file])
 await page.getByText('Fotos guardadas en este navegador. Falta enviar la indicación.',{exact:true}).waitFor()
 await page.getByLabel('Tu indicación').fill('Medidas sintéticas para prueba')
 await page.screenshot({path:captures+'movil-fotos.png'})
 await page.reload();await open();await page.locator('.tracker-photo-grid img').nth(1).waitFor()
 assert.equal(await page.getByLabel('Tu indicación').inputValue(),'Medidas sintéticas para prueba')
 await page.getByRole('button',{name:'Enviar indicación',exact:true}).click()
 await page.getByText(/No se confirmó el envío:/).waitFor()
 assert.equal(uploads,2);assert.equal(reports.length,1)
 assert.equal(await page.getByLabel('Tu indicación').isDisabled(),true)
 assert.equal(reports[0].elemento.valores.fotos.length,2)
 assert.ok(!reports[0].texto.includes('private-synthetic'))
 await page.getByRole('button',{name:'Enviar indicación',exact:true}).click()
 await page.getByText('Indicación enviada al canal de reportes de Amalaya.',{exact:true}).waitFor()
 assert.equal(uploads,2);assert.equal(reports[0].id,reports[1].id)
 await page.getByRole('button',{name:'Cerrar',exact:true}).click();await open()
 assert.equal(await page.locator('.tracker-photo-grid img').count(),0)
 // Upload failure: persistent uncertainty; no silent automatic duplicate.
 failUpload=true
 await page.locator('input[multiple]').setInputFiles(file)
 await page.getByText('Fotos guardadas en este navegador. Falta enviar la indicación.',{exact:true}).waitFor()
 await page.getByRole('button',{name:'Enviar indicación',exact:true}).click()
 await page.getByText(/No se confirmó el envío:/).waitFor()
 assert.equal(uploads,3)
 await page.reload();await open()
 await page.getByText('Subida sin confirmar',{exact:true}).waitFor()
 await page.getByRole('button',{name:'Enviar indicación',exact:true}).click()
 await page.getByText(/Una subida quedó sin confirmar/).waitFor();assert.equal(uploads,3)
 failUpload=false
 await page.getByRole('button',{name:'Preparar reintento (puede crear copia)',exact:true}).click()
 await page.getByText('Lista para enviar',{exact:true}).waitFor()
 await page.getByRole('button',{name:'Enviar indicación',exact:true}).click()
 await page.getByText('Indicación enviada al canal de reportes de Amalaya.',{exact:true}).waitFor()
 assert.equal(uploads,4)
 await page.setViewportSize({width:1440,height:1000})
 await page.screenshot({path:captures+'escritorio-enviado.png'})
 assert.equal(errors.length,0)
 console.log(JSON.stringify({passed:true,synthetic:true,realBackendRequests:0,uploads,reports:reports.length,cameraAttribute:true,reloadDraft:true,lostReportAckReusesFiles:true,uncertainUploadNoAutoRetry:true,pageErrors:errors}))
}finally{await browser.close();await new Promise(r=>web.close(r))}
