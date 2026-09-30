// Local-only materialization. Private source and builds stay outside Git.
import { cp, mkdir, access } from 'node:fs/promises'
import { resolve, join } from 'node:path'
const source=resolve(process.env.HIDALGO_SOURCE || '../Hidalgo3D')
const target=resolve('public/levantamiento')
await Promise.all(['dist/index.html','dist-world/world.js'].map(p=>access(join(source,p))))
await mkdir(target,{recursive:true})
await cp(join(source,'dist-world/world.js'),join(target,'world.js'))
await cp(join(source,'public/data'),join(target,'data'),{recursive:true})
await cp(join(source,'dist'),join(target,'visor'),{recursive:true})
console.log('Levantamiento preparado para revisión local. No publicar public/levantamiento ni dist en Pages.')
