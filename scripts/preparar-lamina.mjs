import {createHash} from 'node:crypto';
export const SHEET_BASE={world:'24df38e516de43dad7cc6bd1b6d8faf56a50caebc3650cb5efd2fdae1b22c614',visor:'a293ff5b0562649401b8449301d289042fcd8ed828e49d7dc8a5f86f277f1099'};
export const sheetHash=v=>createHash('sha256').update(v).digest('hex');
const anchors={world:'Ip(c, n), Up(c), c;',visor:'Ig&&(Ug=new Eg(Ng,$,Hg)'};
const calls={world:'applySheetPlanRefinement(c,f,{Vector3:U,Box3:Zt}), ',visor:'applySheetPlanRefinement(Ng,Hg,{Vector3:U,Box3:Jn});'};
export function removeSheetHook(source,kind='world'){
 if(kind==='world')source=source.replace('Ip(c, n), r.overview || Up(c), c;','Ip(c, n), Up(c), c;');
 if(!source.includes('applySheetPlanRefinement'))return source;
 const match=source.match(/\nimport \{ applySheetPlan as applySheetPlanRefinement \} from "(?:\.\/|\.\.\/\.\.\/)sheet-plan-refinement\.js\?v=[a-f0-9]{12}";\n$/);
 if(!match||source.split(calls[kind]+anchors[kind]).length!==2)throw Error('Sheet plan: unknown hook');
 const base=source.slice(0,-match[0].length).replace(calls[kind]+anchors[kind],anchors[kind]);
 if(sheetHash(base)!==SHEET_BASE[kind])throw Error('Sheet plan: checkpoint changed');return base;
}
export function refineSheet(source,kind,moduleHash){
 const base=removeSheetHook(source,kind),anchor=anchors[kind];
 if(!/^[a-f0-9]{64}$/.test(moduleHash)||sheetHash(base)!==SHEET_BASE[kind]||base.split(anchor).length!==2)throw Error('Sheet plan: invalid baseline');
 let result=base.replace(anchor,calls[kind]+anchor)+`\nimport { applySheetPlan as applySheetPlanRefinement } from "${kind==='world'?'./':'../../'}sheet-plan-refinement.js?v=${moduleHash.slice(0,12)}";\n`;
 if(kind==='world')result=result.replace('Ip(c, n), Up(c), c;','Ip(c, n), r.overview || Up(c), c;');return result;
}
