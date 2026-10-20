// Operational guard added after the trial. It does not rewrite experimental scores.
export const CRITERIA_REQUIREMENTS={
 surface:{kind:'visual',requires:['photo','sameFront']},
 bollard:{kind:'visual',requires:['photo','sameFront']},
 rail:{kind:'visual',requires:['photo','sameFront']},
 paving:{kind:'visual',requires:['photo','sameFront']},
 curb:{kind:'visual',requires:['photo','sameFront']},
 width:{kind:'metric',requires:['measuredScale','calibratedPose']},
 height:{kind:'metric',requires:['measuredLevels']},
 ramp:{kind:'measured-accessibility',requires:['measuredSlope','measuredClearWidth']},
 ends:{kind:'full-segment',requires:['bothCorners','continuousCoverage']}
};
export function planReview({evidence={},criteria=Object.keys(CRITERIA_REQUIREMENTS)}={}){
 const ready=[],deferred=[];
 for(const criterion of criteria){
  const spec=CRITERIA_REQUIREMENTS[criterion];if(!spec)throw Error('Unknown review criterion');
  const missing=spec.requires.filter(key=>evidence[key]!==true);
  if(missing.length)deferred.push({criterion,missing});else ready.push(criterion);
 }
 return {ready,deferred};
}
export function guardReview({criterion,result,evidence={}}){
 const spec=CRITERIA_REQUIREMENTS[criterion];if(!spec)throw Error('Unknown review criterion');
 const missing=spec.requires.filter(key=>evidence[key]!==true);
 if(missing.length)return {criterion,state:'needs_evidence',decision:null,missing,modelResult:result};
 if(!result||result.abstain||result.presence===null)return {criterion,state:'needs_review',decision:null,missing:[],modelResult:result};
 if(typeof result.presence!=='boolean')throw Error('Invalid review result');
 return {criterion,state:result.presence?'observed_discrepancy':'visually_consistent',decision:result.presence,missing:[],modelResult:result};
}
export function canApplyGeometry({review,placement={}}){
 return review?.state==='observed_discrepancy'&&placement.verifiedAnchor===true&&placement.verifiedDimensions===true;
}
