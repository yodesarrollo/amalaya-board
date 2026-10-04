import {removeSidewalkRoundHook} from './preparar-banquetas.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
export const STREET_BASE_WORLD='2b84f6601ee387c40122cc2f5b10be71b03e3444de679b23eb341c5fed1b2a70';
export const STREET_BASE_VISOR='298f3b2dafdc0da690583056f6eba78211ebbf86a33d9dd2e7e458122809c03c';
export const streetHash=value=>createHash('sha256').update(value).digest('hex');
const anchors={world:'Ip(c, n), Up(c), c;',visor:'Ig&&(Ug=new Eg(Ng,$,Hg)'};
const calls={world:'applyStreetRoundRefinement(c,f,{BufferGeometry:An,Float32BufferAttribute:J,Mesh:Y}), ',visor:'applyStreetRoundRefinement(Ng,Hg,{BufferGeometry:Er,Float32BufferAttribute:q,Mesh:J});'};
export function removeStreetRoundHook(source,kind='world'){
 source=removeSidewalkRoundHook(source,kind);
 if(!source.includes('applyStreetRoundRefinement'))return source;
 const match=source.match(/\nimport \{ applyStreetRound as applyStreetRoundRefinement \} from "(?:\.\/|\.\.\/\.\.\/)calzadas-refinement\.js\?v=[a-f0-9]{12}";\n$/);
 const call=calls[kind],anchor=anchors[kind];
 if(!match||source.split(call+anchor).length!==2)throw Error('Round 02: unknown or duplicate hook');
 const base=source.slice(0,-match[0].length).replace(call+anchor,anchor);
 if(streetHash(base)!==(kind==='world'?STREET_BASE_WORLD:STREET_BASE_VISOR))throw Error('Round 02: preceding checkpoint differs');return base;
}
export function refineStreets(source,kind,moduleHash){
 if(!/^[a-f0-9]{64}$/.test(moduleHash))throw Error('Round 02: invalid hash');
 const base=removeStreetRoundHook(source,kind),anchor=anchors[kind];
 if(streetHash(base)!==(kind==='world'?STREET_BASE_WORLD:STREET_BASE_VISOR)||base.split(anchor).length!==2)throw Error('Round 02: unknown baseline');
 const result=base.replace(anchor,calls[kind]+anchor)+`\nimport { applyStreetRound as applyStreetRoundRefinement } from "${kind==='world'?'./':'../../'}calzadas-refinement.js?v=${moduleHash.slice(0,12)}";\n`;
 if(removeStreetRoundHook(result,kind)!==base)throw Error('Round 02: nonreversible hook');return result;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root='public/levantamiento',editable=await readFile(resolve(process.env.STREET_SOURCE||'../amalaya-continuation/src/calzadas-refinement.js'),'utf8');
 const code=process.env.STREET_RUNTIME?await readFile(resolve(process.env.STREET_RUNTIME),'utf8'):(await (await import('esbuild')).transform(editable,{minify:true,format:'esm',target:'es2022',legalComments:'none'})).code;
 const moduleHash=streetHash(code),world=refineStreets(await readFile(`${root}/world.js`,'utf8'),'world',moduleHash),visor=refineStreets(await readFile(`${root}/visor/assets/index-RoPA5goG.js`,'utf8'),'visor',moduleHash);
 await writeFile(`${root}/calzadas-refinement.js`,code);await writeFile(`${root}/world.js`,world);await writeFile(`${root}/visor/assets/index-RoPA5goG.js`,visor);
 const html=await readFile(`${root}/visor/index.html`,'utf8');await writeFile(`${root}/visor/index.html`,html.replace(/index-RoPA5goG\.js(?:\?v=[a-f0-9]{12})?/g,`index-RoPA5goG.js?v=${streetHash(visor).slice(0,12)}`));
 await writeFile('src/levantamiento-version.js',`// Generated from the preserved visual bundle and ordered refinements.\nexport const VERSION_LEVANTAMIENTO = '${streetHash(world).slice(0,12)}'\n`);
 await writeFile(`${root}/calzadas-provenance.json`,JSON.stringify({round:2,task:'street',baseWorldSha256:STREET_BASE_WORLD,baseVisorSha256:STREET_BASE_VISOR,worldSha256:streetHash(world),visorSha256:streetHash(visor),runtimeModuleSha256:moduleHash,editableSourceSha256:streetHash(editable),sourceStatus:'Both prior October checkpoints preserved exactly by reversible street hook'},null,2)+'\n');console.log('Round 02 prepared',streetHash(world));
}
