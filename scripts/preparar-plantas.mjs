import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
export const PLAN_BASE_WORLD='58e389f3cb45279def82c2e0ea79a607e9394f22ab5a7d3eba37dc75642ec924';
export const PLAN_BASE_VISOR='7b2db314cd7b1f361be2a741bd664786bf0f1ad569fc4e5eff7bd20b0e8139a4';
export const planHash=value=>createHash('sha256').update(value).digest('hex');
const anchors={world:'Ip(c, n), Up(c), c;',visor:'Ig&&(Ug=new Eg(Ng,$,Hg)'};
const calls={world:'applyPlanRoundRefinement(c,f,{Box3:Zt,Vector3:U,Shape:$r,Mesh:Y}), ',visor:'applyPlanRoundRefinement(Ng,Hg,{Box3:Jn,Vector3:U,Shape:da,Mesh:J});'};
const expected=kind=>kind==='world'?PLAN_BASE_WORLD:PLAN_BASE_VISOR;
export function removePlanRoundHook(source,kind='world'){
 if(!source.includes('applyPlanRoundRefinement'))return source;
 const match=source.match(/\nimport \{ applyPlanRound as applyPlanRoundRefinement \} from "(?:\.\/|\.\.\/\.\.\/)plantas-refinement\.js\?v=[a-f0-9]{12}";\n$/);
 const variants=[calls[kind],calls[kind].replace(',Shape:$r,Mesh:Y','').replace(',Shape:da,Mesh:J','')],found=variants.filter(c=>source.split(c+anchors[kind]).length===2);
 if(!match||found.length!==1)throw Error('Round 01: unknown or duplicate hook');
 const base=source.slice(0,-match[0].length).replace(found[0]+anchors[kind],anchors[kind]);
 if(planHash(base)!==expected(kind))throw Error('Round 01: previous checkpoint differs');return base;
}
export function refinePlans(source,kind,moduleHash){
 if(!/^[a-f0-9]{64}$/.test(moduleHash))throw Error('Round 01: invalid hash');
 const base=removePlanRoundHook(source,kind),anchor=anchors[kind];
 if(planHash(base)!==expected(kind)||base.split(anchor).length!==2)throw Error('Round 01: unknown baseline; previous work preserved');
 const result=base.replace(anchor,calls[kind]+anchor)+`\nimport { applyPlanRound as applyPlanRoundRefinement } from "${kind==='world'?'./':'../../'}plantas-refinement.js?v=${moduleHash.slice(0,12)}";\n`;
 if(removePlanRoundHook(result,kind)!==base)throw Error('Round 01: nonreversible hook');return result;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const root='public/levantamiento',editable=await readFile(resolve(process.env.PLAN_SOURCE||'../amalaya-continuation/src/plantas-refinement.js'),'utf8');
 // Optional already compacted runtime supports isolated environments; CI uses official esbuild.
 const code=process.env.PLAN_RUNTIME?await readFile(resolve(process.env.PLAN_RUNTIME),'utf8'):(await (await import('esbuild')).transform(editable,{minify:true,format:'esm',target:'es2022',legalComments:'none'})).code;
 const moduleHash=planHash(code),world=refinePlans(await readFile(`${root}/world.js`,'utf8'),'world',moduleHash),visor=refinePlans(await readFile(`${root}/visor/assets/index-RoPA5goG.js`,'utf8'),'visor',moduleHash);
 await writeFile(`${root}/plantas-refinement.js`,code);await writeFile(`${root}/world.js`,world);await writeFile(`${root}/visor/assets/index-RoPA5goG.js`,visor);
 const html=await readFile(`${root}/visor/index.html`,'utf8');await writeFile(`${root}/visor/index.html`,html.replace(/index-RoPA5goG\.js(?:\?v=[a-f0-9]{12})?/g,`index-RoPA5goG.js?v=${planHash(visor).slice(0,12)}`));
 await writeFile('src/levantamiento-version.js',`// Generated from the preserved visual bundle and ordered refinements.\nexport const VERSION_LEVANTAMIENTO = '${planHash(world).slice(0,12)}'\n`);
 await writeFile(`${root}/plantas-provenance.json`,JSON.stringify({round:1,task:'plan',baseWorldSha256:PLAN_BASE_WORLD,baseVisorSha256:PLAN_BASE_VISOR,worldSha256:planHash(world),visorSha256:planHash(visor),runtimeModuleSha256:moduleHash,editableSourceSha256:planHash(editable),generatedFrom:'Private editable extension, compact ESM without source maps',sourceStatus:'October compiled world preserved byte for byte when removing the round hook; full Hidalgo3D source not recovered'},null,2)+'\n');
 console.log(`Round 01 prepared: ${planHash(world).slice(0,12)}`);
}
