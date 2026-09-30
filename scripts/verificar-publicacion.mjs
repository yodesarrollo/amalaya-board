import { readdir, readFile, stat } from 'node:fs/promises'
import assert from 'node:assert/strict'
const root='public/levantamiento'
const approved=new Set(['amalaya-observations.json','amalaya-routes.json','cerro-elevation.json','osm-context.json','osm-plaza-hidalgo.json'])
async function check(dir){
  for(const item of await readdir(dir,{withFileTypes:true})){
    const path=`${dir}/${item.name}`
    assert(!item.isSymbolicLink(),`No se permiten enlaces: ${path}`)
    if(item.isDirectory()){assert(['data','visor','assets','fonts'].includes(item.name),`Carpeta inesperada: ${path}`);await check(path);continue}
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
for(const file of ['world.js','visor/index.html',...Array.from(approved,n=>`data/${n}`)])await stat(`${root}/${file}`)
const page=await readFile(`${root}/visor/index.html`,'utf8')
for(const [,asset] of page.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g))await stat(`${root}/visor/${asset}`)
assert(!(await readFile('src/preview-recorrido.jsx','utf8')).includes('datos.jsx'),'El portal público no carga el proveedor de negocio')
console.log('Publicación: activos visuales presentes, datos geográficos autorizados y sin credenciales reconocibles. El acceso al negocio se conserva.')
