import {readFile,writeFile} from 'node:fs/promises';
import {guardReview,canApplyGeometry,planReview} from '../../public/levantamiento/sidewalk-real-v1/evidence-policy.mjs';
const root='public/levantamiento/sidewalk-real-v1';
const review=JSON.parse(await readFile(root+'/review.json','utf8'));
const measured=JSON.parse(await readFile(root+'/workflow-results.json','utf8'));
const selected=measured.runs.find(r=>r.arm==='A'&&r.repeat===0);
if(!selected)throw Error('Missing complete workflow receipt');
const evidence={photo:true,sameFront:true,measuredScale:false,calibratedPose:false,measuredLevels:false,measuredSlope:false,measuredClearWidth:false,bothCorners:false,continuousCoverage:false};
review.nextReviewPlan=planReview({evidence});
review.operationalReview=selected.values.map(result=>{
 const decision=guardReview({criterion:result.criterion_id,result,evidence});
 return {...decision,geometryApplicationAllowed:canApplyGeometry({review:decision,placement:{verifiedAnchor:false,verifiedDimensions:false}})};
});
review.benchmarkNote='The operational evidence guard was added after the per-criterion trial; it does not rewrite frozen scores or provider answers.';
review.criterionAudit='Accessibility question mixed visible obstacles with measured compliance. These are separate decisions; measurements remain absent.';
await writeFile(root+'/review.json',JSON.stringify(review,null,2)+'\n');
console.log(JSON.stringify({criteria:review.operationalReview.length,blockedByMissingEvidence:review.operationalReview.filter(r=>r.state==='needs_evidence').map(r=>r.criterion),geometricWrites:0}));
