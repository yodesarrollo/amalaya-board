import { readdir, readFile, stat } from 'node:fs/promises'
import assert from 'node:assert/strict'
const root='public/levantamiento'
const approved=new Set(['amalaya-observations.json','amalaya-routes.json','cerro-elevation.json','osm-context.json','osm-plaza-hidalgo.json','sector-survey.json'])
const evidenceFiles=new Set(['01-planta.png','02-calzada.png','03-banqueta-sur.png','04-banqueta-norte.png','manifest.json'])
async function check(dir){
  for(const item of await readdir(dir,{withFileTypes:true})){
    const path=`${dir}/${item.name}`
    assert(!item.isSymbolicLink(),`No se permiten enlaces: ${path}`)
    if(item.isDirectory()){const allowed=['data','visor','assets','fonts','evidence'].includes(item.name)||(dir===`${root}/evidence`&&item.name==='OB-01');assert(allowed,`Carpeta inesperada: ${path}`);await check(path);continue}
    if(path.includes('/evidence/'))assert(evidenceFiles.has(item.name),`Evidencia fuera del alcance OB-01: ${path}`)
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
assert(evidence.render?.includes('Three.js original OB-01 geometry through SVGRenderer'),'La evidencia debe provenir del modelo OB-01 con el render auditado.')
assert(evidence.limits?.includes('not cadastral survey or site photography'),'La evidencia debe declarar que no es foto del sitio ni levantamiento catastral.')
assert(evidence.captures?.length===4 && evidence.captures.every(item=>evidenceFiles.has(item.file)),'Faltan capturas requeridas de los puntos 1–4.')
for(const name of [...evidenceFiles].filter(name=>name.endsWith('.png'))){const bytes=await readFile(`${root}/evidence/OB-01/${name}`);assert(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),`PNG inválido: ${name}`);assert(bytes.readUInt32BE(16)===1280 && bytes.readUInt32BE(20)===800,`Dimensiones de evidencia inesperadas: ${name}`)}
for(const file of ['world.js','visor/index.html',...Array.from(approved,n=>`data/${n}`)])await stat(`${root}/${file}`)
const page=await readFile(`${root}/visor/index.html`,'utf8')
for(const [,asset] of page.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g))await stat(`${root}/visor/${asset}`)
assert(!(await readFile('src/preview-recorrido.jsx','utf8')).includes('datos.jsx'),'El portal público no carga el proveedor de negocio')
console.log('Publicación: activos visuales presentes, datos geográficos autorizados y sin credenciales reconocibles. El acceso al negocio se conserva.')
