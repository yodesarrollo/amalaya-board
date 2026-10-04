import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
export const WALK_BASE_WORLD='cb3fa2b4bfc722f06eddb733b655b6ce264af9489ff2e32e962c21bc4521d41c';
export const WALK_BASE_VISOR='4bccd68214b58a5679e8a562287dcec38a7ea63d3be8b144dc6299d793f813b8';
export const walkHash=value=>createHash('sha256').update(value).digest('hex');
const anchors={world:'Ip(c, n), Up(c), c;',visor:'Ig&&(Ug=new Eg(Ng,$,Hg)'};
const calls={world:'applySidewalkRoundRefinement(c,f,{BufferGeometry:An,Float32BufferAttribute:J,Mesh:Y,Vector3:U,Box3:Zt}), ',visor:'applySidewalkRoundRefinement(Ng,Hg,{BufferGeometry:Er,Float32BufferAttribute:q,Mesh:J,Vector3:U,Box3:Jn});'};
export function removeSidewalkRoundHook(source,kind='world'){
 if(!source.includes('applySidewalkRoundRefinement'))return source;
 const match=source.match(/\nimport \{ applySidewalkRound as applySidewalkRoundRefinement \} from "(?:\.\/|\.\.\/\.\.\/)banquetas-refinement\.js\?v=[a-f0-9]{12}";\n$/),call=calls[kind],anchor=anchors[kind];
 if(!match||source.split(call+anchor).length!==2)throw Error('Round 03: unknown or duplicate hook');
 const base=source.slice(0,-match[0].length).replace(call+anchor,anchor);
 if(walkHash(base)!==(kind==='world'?WALK_BASE_WORLD:WALK_BASE_VISOR))throw Error('Round 03: preceding checkpoint differs');return base;
}
export function refineWalks(source,kind,moduleHash){
 if(!/^[a-f0-9]{64}$/.test(moduleHash))throw Error('Round 03: invalid hash');const base=removeSidewalkRoundHook(source,kind),anchor=anchors[kind];
 if(walkHash(base)!==(kind==='world'?WALK_BASE_WORLD:WALK_BASE_VISOR)||base.split(anchor).length!==2)throw Error('Round 03: unknown baseline');
 return base.replace(anchor,calls[kind]+anchor)+`\nimport { applySidewalkRound as applySidewalkRoundRefinement } from "${kind==='world'?'./':'../../'}banquetas-refinement.js?v=${moduleHash.slice(0,12)}";\n`;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root='public/levantamiento',editable=await readFile(resolve(process.env.WALK_SOURCE||'../amalaya-continuation/src/banquetas-refinement.js'),'utf8'),code=process.env.WALK_RUNTIME?await readFile(resolve(process.env.WALK_RUNTIME),'utf8'):(await (await import('esbuild')).transform(editable,{minify:true,format:'esm',target:'es2022',legalComments:'none'})).code;
 const moduleHash=walkHash(code),world=refineWalks(await readFile(`${root}/world.js`,'utf8'),'world',moduleHash),visor=refineWalks(await readFile(`${root}/visor/assets/index-RoPA5goG.js`,'utf8'),'visor',moduleHash);
 await writeFile(`${root}/banquetas-refinement.js`,code);await writeFile(`${root}/world.js`,world);await writeFile(`${root}/visor/assets/index-RoPA5goG.js`,visor);
 const html=await readFile(`${root}/visor/index.html`,'utf8');await writeFile(`${root}/visor/index.html`,html.replace(/index-RoPA5goG\.js(?:\?v=[a-f0-9]{12})?/g,`index-RoPA5goG.js?v=${walkHash(visor).slice(0,12)}`));
 await writeFile('src/levantamiento-version.js',`// Ordered reversible model refinements.\nexport const VERSION_LEVANTAMIENTO = '${walkHash(world).slice(0,12)}'\n`);
 await writeFile(`${root}/banquetas-provenance.json`,JSON.stringify({round:3,task:'sidewalkA',baseWorldSha256:WALK_BASE_WORLD,baseVisorSha256:WALK_BASE_VISOR,worldSha256:walkHash(world),visorSha256:walkHash(visor),runtimeModuleSha256:moduleHash,editableSourceSha256:walkHash(editable),sourceStatus:'Both round 02 checkpoints preserved by reversible sidewalk hook'},null,2)+'\n');console.log('Round 03 prepared',walkHash(world));
}
