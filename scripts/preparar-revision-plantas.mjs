import {removeSheetHook} from './preparar-lamina.mjs';
import {createHash} from 'node:crypto';
export const REVIEW_BASE_WORLD='44217a1f386bb39e746ee5843d7b789f5f337a7a77379125b0a3431557b1b7d0';
export const REVIEW_BASE_VISOR='7a4dee5cf39ef5be4737545ad91e2e4e449e12e6f01bd931607be805b6f0c59f';
export const reviewHash=value=>createHash('sha256').update(value).digest('hex');
const anchors={world:'Ip(c, n), Up(c), c;',visor:'Ig&&(Ug=new Eg(Ng,$,Hg)'};
const calls={world:'applyPlanReviewRefinement(c,f,{Vector3:U,Box3:Zt}), ',visor:'applyPlanReviewRefinement(Ng,Hg,{Vector3:U,Box3:Jn});'};
export function removePlanReviewHook(source,kind='world'){
 source=removeSheetHook(source,kind);
 if(!source.includes('applyPlanReviewRefinement'))return source;
 const match=source.match(/\nimport \{ applyPlanReview as applyPlanReviewRefinement \} from "(?:\.\/|\.\.\/\.\.\/)plan-review-refinement\.js\?v=[a-f0-9]{12}";\n$/);
 if(!match||source.split(calls[kind]+anchors[kind]).length!==2)throw Error('Plan review: unknown or duplicate hook');
 const base=source.slice(0,-match[0].length).replace(calls[kind]+anchors[kind],anchors[kind]);
 if(reviewHash(base)!==(kind==='world'?REVIEW_BASE_WORLD:REVIEW_BASE_VISOR))throw Error('Plan review: previous checkpoint differs');return base;
}
export function refinePlanReview(source,kind,moduleHash){
 const base=removePlanReviewHook(source,kind),anchor=anchors[kind];
 if(!/^[a-f0-9]{64}$/.test(moduleHash)||reviewHash(base)!==(kind==='world'?REVIEW_BASE_WORLD:REVIEW_BASE_VISOR)||base.split(anchor).length!==2)throw Error('Plan review: unknown baseline');
 return base.replace(anchor,calls[kind]+anchor)+`\nimport { applyPlanReview as applyPlanReviewRefinement } from "${kind==='world'?'./':'../../'}plan-review-refinement.js?v=${moduleHash.slice(0,12)}";\n`;
}
