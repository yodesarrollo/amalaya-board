// Visual release only: no repository history, credentials or business records.
import { cp, mkdir, access, rm, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve, join } from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { BASE_WORLD_SHA256, BASE_VISOR_SHA256, removeIsc58Hook, removeIsc58VisorHook, sha256, compileEditableIsc58 } from './preparar-isc58.mjs'
const source=resolve(process.env.HIDALGO_SOURCE || '../Hidalgo3D')
const target=resolve('public/levantamiento')
await Promise.all(['dist/index.html','dist-world/world.js'].map(p=>access(join(source,p))))
// Check the selected source before deleting any current visual asset.
// September's backup cannot replace the later OB-01/OB-02 checkpoint.
const selectedWorld=await readFile(join(source,'dist-world/world.js'),'utf8')
if(sha256(removeIsc58Hook(selectedWorld))!==BASE_WORLD_SHA256)throw new Error('La fuente Hidalgo3D no coincide con el checkpoint vigente de OB-01/OB-02. Recuperar la fuente actual; para esta extensión usar preparar:isc58. No se modificó el paquete visual.')
const selectedVisor=await readFile(join(source,'dist/assets/index-RoPA5goG.js'),'utf8')
if(sha256(removeIsc58VisorHook(selectedVisor))!==BASE_VISOR_SHA256)throw new Error('El visor de la fuente seleccionada no corresponde al checkpoint auditado. No se modificó el paquete visual.')
const approvedData=['amalaya-observations.json','amalaya-routes.json','cerro-elevation.json','osm-context.json','osm-plaza-hidalgo.json','sector-survey.json']
for(const file of approvedData){
  if(sha256(await readFile(join(source,'public/data',file)))!==sha256(await readFile(join(target,'data',file))))throw new Error(`Los datos ${file} no corresponden al checkpoint auditado. Revisar el cambio de fuente antes de regenerar; no se modificó el paquete visual.`)
}
await compileEditableIsc58() // Reject malformed private source before any replacement.
// Refresh only generated assets. Evidence belongs to a reviewed checkpoint and must survive.
for(const name of ['world.js','data','visor'])await rm(join(target,name),{recursive:true,force:true})
await mkdir(target,{recursive:true})
await cp(join(source,'dist-world/world.js'),join(target,'world.js'))
const version=createHash('sha256').update(await readFile(join(target,'world.js'))).digest('hex').slice(0,12)
await writeFile('src/levantamiento-version.js',`// Generated from the published visual bundle by preparar:3d.\nexport const VERSION_LEVANTAMIENTO = '${version}'\n`)
await mkdir(join(target,'data'),{recursive:true})
for(const file of approvedData)await cp(join(source,'public/data',file),join(target,'data',file))
await cp(join(source,'dist'),join(target,'visor'),{recursive:true})
await promisify(execFile)(process.execPath,['scripts/preparar-isc58.mjs'])
console.log('Paquete visual preparado. Ejecutar verificar:publicacion antes de publicar.')
