// Visual release only: no repository history, credentials or business records.
import { cp, mkdir, access, rm, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve, join } from 'node:path'
const source=resolve(process.env.HIDALGO_SOURCE || '../Hidalgo3D')
const target=resolve('public/levantamiento')
await Promise.all(['dist/index.html','dist-world/world.js'].map(p=>access(join(source,p))))
await rm(target,{recursive:true,force:true})
await mkdir(target,{recursive:true})
await cp(join(source,'dist-world/world.js'),join(target,'world.js'))
const version=createHash('sha256').update(await readFile(join(target,'world.js'))).digest('hex').slice(0,12)
await writeFile('src/levantamiento-version.js',`// Generated from the published visual bundle by preparar:3d.\nexport const VERSION_LEVANTAMIENTO = '${version}'\n`)
await cp(join(source,'public/data'),join(target,'data'),{recursive:true})
await cp(join(source,'dist'),join(target,'visor'),{recursive:true})
console.log('Paquete visual preparado. Ejecutar verificar:publicacion antes de publicar.')
