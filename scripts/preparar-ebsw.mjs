import {readFile,writeFile} from 'node:fs/promises'
import {resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {transform} from 'esbuild'
import {sha256} from './preparar-isc58.mjs'
export const EB_BASE_WORLD='7f76cb47d6189e2f29681ec2a0f37dd9993d4d1db9788cd10c4fd986e2953e91'
export const EB_BASE_VISOR='ef131babd586f5b273827c05eb02fac7eaa29905c3f44888bca1d5b115b5b678'
const runtime={world:'{Group:Ot,Mesh:Y,Shape:$r,Path:Qr,ShapeGeometry:Wi,BoxGeometry:X,BufferGeometry:An,Float32BufferAttribute:J,Box3:Zt,Vector3:U,createProceduralMaterial:$}',visor:'{Group:G,Mesh:J,Shape:da,Path:ua,ShapeGeometry:no,BoxGeometry:Y,BufferGeometry:Er,Float32BufferAttribute:q,Box3:Jn,Vector3:U,createProceduralMaterial:Q}'}
const anchors={world:'Ip(c, n), Up(c), c;',visor:'Ig&&(Ug=new Eg(Ng,$,Hg)'}
const call=(kind,stage)=>kind==='world'?`applyEbSwRefinement(c,f,${runtime.world},${stage}), `:`applyEbSwRefinement(Ng,Hg,${runtime.visor},${stage});`
const expected=kind=>kind==='world'?EB_BASE_WORLD:EB_BASE_VISOR
export function removeEbSwHook(source,kind='world'){
 if(!source.includes('applyEbSwRefinement'))return source
 const imports=source.match(/\nimport \{ applyEbSw as applyEbSwRefinement \} from "(?:\.\/|\.\.\/\.\.\/)ebsw-refinement\.js\?v=[a-f0-9]{12}";\n$/)
 if(!imports)throw Error('EB-SW: import desconocido; se conserva el bundle.')
 let base=source.slice(0,-imports[0].length),matched=false
 for(const stage of [3,4,7,8,9])if(base.includes(call(kind,stage)+anchors[kind])){if(matched)throw Error('Hook repetido');base=base.replace(call(kind,stage)+anchors[kind],anchors[kind]);matched=true}
 if(!matched||sha256(base)!==expected(kind))throw Error('EB-SW: el checkpoint anterior no coincide.')
 return base
}
export function refineEbSw(source,kind,moduleHash,stage){
 if(![3,4,7,8,9].includes(stage)||!/^[a-f0-9]{64}$/.test(moduleHash))throw Error('Etapa/hash inválidos')
 const base=removeEbSwHook(source,kind),anchor=anchors[kind]
 if(sha256(base)!==expected(kind)||base.split(anchor).length!==2)throw Error('EB-SW: base desconocida; no sobrescribir avances previos.')
 const prefix=kind==='world'?'./':'../../'
 const result=base.replace(anchor,call(kind,stage)+anchor)+`\nimport { applyEbSw as applyEbSwRefinement } from "${prefix}ebsw-refinement.js?v=${moduleHash.slice(0,12)}";\n`
 if(removeEbSwHook(result,kind)!==base)throw Error('Hook no reversible')
 return result
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const stage=Number(process.argv[2]||9),root='public/levantamiento'
 const editable=await readFile(resolve(process.env.EBSW_SOURCE||'../amalaya-3d-continuation/src/ebsw-refinement.js'),'utf8')
 const {code}=await transform(editable,{minify:true,format:'esm',target:'es2022',legalComments:'none'})
 const moduleHash=sha256(code),world=refineEbSw(await readFile(`${root}/world.js`,'utf8'),'world',moduleHash,stage),visor=refineEbSw(await readFile(`${root}/visor/assets/index-RoPA5goG.js`,'utf8'),'visor',moduleHash,stage)
 await writeFile(`${root}/ebsw-refinement.js`,code);await writeFile(`${root}/world.js`,world);await writeFile(`${root}/visor/assets/index-RoPA5goG.js`,visor)
 const html=await readFile(`${root}/visor/index.html`,'utf8');await writeFile(`${root}/visor/index.html`,html.replace(/index-RoPA5goG\.js(?:\?v=[a-f0-9]{12})?/g,`index-RoPA5goG.js?v=${sha256(visor).slice(0,12)}`))
 await writeFile('src/levantamiento-version.js',`// Generated from the preserved visual bundle and ordered refinements.\nexport const VERSION_LEVANTAMIENTO = '${sha256(world).slice(0,12)}'\n`)
 await writeFile(`${root}/ebsw-provenance.json`,JSON.stringify({building:'EB-SW',stage,baseWorldSha256:EB_BASE_WORLD,baseVisorSha256:EB_BASE_VISOR,worldSha256:sha256(world),visorSha256:sha256(visor),runtimeModuleSha256:moduleHash,editableSourceSha256:sha256(editable),generatedFrom:'Private editable extension; compiled ESM without source maps',sourceStatus:'Prior compiled world preserved; full Hidalgo3D source not recovered'},null,2)+'\n')
 console.log(`EB-SW etapa ${stage}: ${sha256(world).slice(0,12)}`)
}
