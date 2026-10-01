const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{const b=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});try{
const data=JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'../../public/data.json'))).datos;
data.Archivos=[];data.Historial=[];data.Conocimientos=[];data.Tareas=[];
const name=data.Espacios[0].nombre;const firstId=data.Espacios[0].id;
for(const role of ['editor','visor','inversionista']){
const p=await b.newPage({viewport:{width:1280,height:900}});p.setDefaultTimeout(90000);const errors=[],writes=[];p.on('pageerror',e=>errors.push(e.message));
await p.addInitScript(({role})=>{localStorage.setItem('amalaya_sesion',JSON.stringify({codigo:'fixture-local',rol:role,nombre:'Prueba local',ts:Date.now()}));localStorage.setItem('amalaya_bato_off','si')},{role});
await p.route('**/chinche.js*',r=>r.fulfill({contentType:'text/javascript',body:''}));
await p.route('https://script.google.com/**',async r=>{const d=JSON.parse(r.request().postData()||'{}');let body={ok:true};if(d.action==='login')body={ok:true,rol:role,nombre:'Prueba local'};if(d.action==='getAll')body={ok:true,datos:role==='inversionista'?{...data,Espacios:undefined}:data,v:1};if(d.action==='guardar')writes.push(d);await r.fulfill({contentType:'application/json',body:JSON.stringify(body)})});
if(role!=='editor')await p.route('**/levantamiento/world.js',r=>r.abort());
await p.goto(process.env.REVIEW_URL||'http://127.0.0.1:5174/amalaya-board/',{waitUntil:'domcontentloaded'});
if(role==='inversionista'){await p.getByRole('button',{name:'Actualizar',exact:true}).waitFor();assert.equal(await p.locator('.tour-workspace').count(),0);assert.equal(await p.getByRole('button',{name:'Mover espacios',exact:true}).count(),0)}else{
 await p.locator('.tour-space-results button').first().waitFor();
 if(role==='editor'){
  await p.locator('.tour-space-pin').first().waitFor({timeout:180000});assert.equal(await p.locator('.tour-space-pin').count(),data.Espacios.length);
  await p.getByRole('button',{name:`Abrir ficha: ${name}`,exact:true}).click();
 }else await p.locator('.tour-space-results button').first().click();
 const ficha=p.getByRole('dialog',{name:`Ficha: ${name}`,exact:true});await ficha.waitFor();
 for(const tab of ['Fotos','Documentos','Tareas','Historial'])assert(await ficha.getByRole('tab',{name:tab,exact:true}).isVisible());
 assert.equal(await ficha.locator('#campo-m2').isDisabled(),role==='visor');
 if(role==='editor'){
 const saving=p.waitForRequest(req=>{try{const d=JSON.parse(req.postData()||'{}');return d.action==='guardar' && d.tab==='Espacios' && String(d.key)===String(firstId) && String(d.patch?.m2)==='222'}catch{return false}},{timeout:30000});await ficha.locator('#campo-m2').fill('222');await saving;console.log('PASS editor patch to original space ID');
 await ficha.getByRole('tab',{name:'Documentos',exact:true}).click();assert.equal(await ficha.locator('input[type=file]').count(),1);
 }
 await p.keyboard.press('Escape');await ficha.waitFor({state:'hidden'});
 await p.getByRole('button',{name:'Puntos 360',exact:true}).click();await p.locator('iframe').waitFor();await p.locator('.tour-space-results button').first().click();await ficha.waitFor();await p.keyboard.press('Escape');
 if(role==='editor'){
 await p.getByRole('button',{name:'Caminar 3D',exact:true}).click();assert((await p.locator('iframe').getAttribute('src')).includes('levantamiento/visor'));

 }else assert.equal(writes.length,0);
 await p.setViewportSize({width:390,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 if(role==='editor'){await p.getByRole('button',{name:'Ver reporte',exact:true}).click();assert.equal(await p.locator('.tour-workspace').count(),0)}
 }
 if(process.env.CAPTURE_DIR && role==='visor')await p.screenshot({path:require('node:path').join(process.env.CAPTURE_DIR,'board-integrado-movil.png'),fullPage:true,timeout:90000});
 assert.deepEqual(errors,[]);console.log('PASS',role,'same ficha, role gating, retained modules');await p.close();
}
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
