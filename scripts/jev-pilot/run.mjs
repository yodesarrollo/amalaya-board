import {readFile, writeFile, mkdir, appendFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {freezeStudy, assertFrozenStudy, createSchedule, scoreDiagnostic, summarizeRuns, hashCanonical} from './contract.mjs';
import {createPilotTransport, assertPilotOutcome, ConnectorRateLimit} from './transport.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const ENDPOINT = 'https://yod-cloud-room.onrender.com/jev-mcp';
const DATA = resolve(ROOT, 'public/levantamiento/jev-pilot-v1');
// A new freeze/output location keeps the original experiment and its runner immutable.
const OUT = resolve(process.env.AMALAYA_PILOT_OUTPUT || resolve(ROOT, 'tmp/jev-pilot-next'));
const sha = value => createHash('sha256').update(value).digest('hex');
const json = async path => JSON.parse(await readFile(path, 'utf8'));
const save = async (name, value) => writeFile(resolve(OUT, name), JSON.stringify(value, null, 2) + '\n');
await mkdir(OUT, {recursive:true});
const [action = 'preflight', limitArg] = process.argv.slice(2);

const rpc = createPilotTransport({endpoint: ENDPOINT, runToken: process.env.AMALAYA_PILOT_RUN_TOKEN,
  logAttempt: record => appendFile(resolve(OUT, 'transport-attempts.jsonl'), JSON.stringify(record) + '\n')});
const keyOf = slot => `${slot.case_id}:${slot.arm}:${slot.repeat}`;
function validationFor(slot, current) {
  return {args: {case_id:slot.case_id, arm:slot.arm, repeat:slot.repeat-1}, manifestSha256:current.config.manifest_sha256,
    models:current.config.models, ...(action==='run'||action==='report'?{modelResolution:current.config.modelResolution}:{}),
    assets:current.dataset.manifest.cases.find(item=>item.case_id===slot.case_id)};
}
async function validExisting(path, {current, frozen = null, schedule}) {
  const allowed = new Map(schedule.map(slot => [keyOf(slot), slot]));
  const valid = new Map(), rejected = [];
  const lines = (await readFile(path,'utf8').catch(error=>{if(error.code==='ENOENT')return '';throw error;})).split('\n').filter(Boolean);
  for (const [index,line] of lines.entries()) {
    try {
      const row = JSON.parse(line), slot = row.slot, scheduled = allowed.get(keyOf(slot ?? {}));
      if (!scheduled || hashCanonical(scheduled)!==hashCanonical(slot) || row.study_sha256!==(frozen?.sha256??null)) throw Error('raw_study_or_slot_binding_mismatch');
      assertPilotOutcome(row.data, validationFor(slot,current));
      const previous=valid.get(keyOf(slot));
      if(previous&&hashCanonical(previous.data)!==hashCanonical(row.data)) throw Error('conflicting_duplicate_outcome');
      valid.set(keyOf(slot),row);
    } catch(error) {rejected.push({at:new Date().toISOString(),file:path,line:index+1,reason:error.code??error.message,original_line:line});}
  }
  // Preserve every rejected legacy row separately; never rewrite the source JSONL.
  for(const record of rejected) await appendFile(resolve(OUT,'transport-invalid-records.jsonl'),JSON.stringify(record)+'\n');
  if(rejected.some(record=>record.reason==='conflicting_duplicate_outcome')) throw Error('conflicting_duplicate_outcome');
  return {rows:[...valid.values()],rejected};
}

async function inputs() {
  const manifestBytes = await readFile(resolve(DATA,'study.json'));
  const manifest = JSON.parse(manifestBytes);
  const truth = await json(resolve(ROOT,'scripts/jev-pilot/truth.json'));
  const cases=manifest.cases.map(c=>({...c,defect_family:truth[c.case_id]?.family ?? c.case_id}));
  const schedule=createSchedule({cases,arms:['A','B','C'],repetitions:3,seed:20261020});
  for (const entry of manifest.cases) for (const role of ['reference','candidate']) {
    if (sha(await readFile(resolve(DATA,entry[role].path))) !== entry[role].sha256) throw Error('asset_changed');
  }
  const config = {
    study_id:manifest.study_id, manifest_sha256:sha(manifestBytes), seed:20261020,
    arms:['A','B','C'], repetitions:3, timeout_ms:120000, provider_http_timeout_ms:30000,
    models:{A:manifest.openai_model,B:'jev-1.14.0',C:manifest.openai_model},
    modelResolution:await json(resolve(OUT,'model-resolution.json')).catch(()=>({})),
    endpoint:ENDPOINT, measurement:'diagnosis only; HTTP wall time includes provider and network; no inferred model-only time',
    implementation_sha256:sha(await readFile(fileURLToPath(import.meta.url))),
    transport_sha256:sha(await readFile(resolve(ROOT,'scripts/jev-pilot/transport.mjs'))),
    backend_sha256:'fd2a91368c20dcccfc4ca8ad2ca39d5373bf14b4032c557bc0ab89cf7d17d1e2',
    reasoning_effort:{A:'none',C:'none'},
    generator_sha256:sha(await readFile(resolve(ROOT,'scripts/jev-pilot/prepare-dataset.mjs'))),
    renderer_sha256:sha(await readFile(resolve(ROOT,'scripts/jev-pilot/render-dataset.py')))
  };
  config.schedule_sha256=hashCanonical(schedule);
  return {config,dataset:{manifest,truth},questions:manifest.criteria,
    scorer:{file_sha256:sha(await readFile(resolve(ROOT,'scripts/jev-pilot/contract.mjs'))),acceptance:'correct presence/abstention and correct category for visible defects; IoU reported separately'}};
}

if (action === 'preflight') {
  const result = await rpc('amalaya_pilot_status');
  await save('preflight.json',result);console.log(JSON.stringify(result.data,null,2));
} else if (action === 'freeze') {
  const current=await inputs(), frozen=freezeStudy(current);
  await save('freeze.json',frozen);
  await save('inputs.json',current);
  const cases=current.dataset.manifest.cases.map(c=>({...c,defect_family:current.dataset.truth[c.case_id]?.family ?? c.case_id}));
  await save('schedule.json',createSchedule({cases,arms:['A','B','C'],repetitions:3,seed:20261020}));
  console.log(`Frozen ${frozen.sha256}`);
} else if (action === 'calibrate' || action === 'run') {
  const current=await inputs();
  const limit=limitArg === undefined ? Infinity : Number(limitArg);
  if (!(limit>0)) throw Error('invalid_limit');
  const frozen=action === 'run' ? await json(resolve(OUT,'freeze.json')) : null;
  if (frozen) assertFrozenStudy(frozen,current);
  const schedule=action === 'run' ? await json(resolve(OUT,'schedule.json')) : current.dataset.manifest.cases.filter(c=>c.split==='calibration').flatMap(c=>['A','B','C'].map(arm=>({case_id:c.case_id,arm,repeat:1})));
  if (action==='run' && hashCanonical(schedule)!==current.config.schedule_sha256) throw Error('schedule_changed');
  const rawPath=resolve(OUT,action==='run'?'raw.jsonl':'calibration.jsonl');
  const existing=await validExisting(rawPath,{current,frozen,schedule});
  const done=new Set(existing.rows.map(x=>keyOf(x.slot)));
  let count=0;
  for (const slot of schedule) {
    if (done.has(keyOf(slot))) continue;
    if (count++>=limit) break;
    if (frozen) assertFrozenStudy(frozen,await inputs());
    let result;
    const args={case_id:slot.case_id,arm:slot.arm,repeat:slot.repeat-1};
    const validation=validationFor(slot,current);
    try {result=await rpc('amalaya_pilot_run',args,{context:{action,slot},validation});}
    catch(error) {
      await appendFile(resolve(OUT,'transport-errors.jsonl'),JSON.stringify({slot,at:new Date().toISOString(),reason:error.code??String(error.message).slice(0,200),operation_id:error.operation_id,attempts:error.attempts})+'\n');
      if(error instanceof ConnectorRateLimit) throw error; // No provider slot was accepted; a status call would consume another connector request.
      const recovered=await rpc('amalaya_pilot_status',args,{context:{action,slot,recovery:true},validation,linkedOperationId:error.operation_id??null});
      assertPilotOutcome(recovered.data.record,validation);
      result={...recovered,data:recovered.data.record,recovered_after_transport_error:true,recovery_of_operation_id:error.operation_id??null};
    }
    assertPilotOutcome(result.data,validation);
    await appendFile(rawPath,JSON.stringify({slot,study_sha256:frozen?.sha256 ?? null,...result})+'\n');
    console.log(`${slot.case_id} ${slot.arm} r${slot.repeat}: ${result.data.status} ${result.data.elapsed_ms ?? '-'}ms`);
    done.add(keyOf(slot));
    if (frozen && result.data.provider_receipt?.real_model) {
      const p=result.data.provider_receipt;
      if(p.requested_model!==current.config.models[slot.arm] || p.provider!==(slot.arm==='B'?'typesafe':'openai')) throw Error('provider_or_requested_model_changed');
      const expected=current.config.modelResolution[p.requested_model] ?? p.requested_model;
      if (p.real_model!==expected) throw Error('model_changed_during_heldout');
    }
  }
} else if (action === 'report') {
  const current=await inputs(), frozen=await json(resolve(OUT,'freeze.json'));
  assertFrozenStudy(frozen,current);
  const schedule=await json(resolve(OUT,'schedule.json'));
  if (hashCanonical(schedule)!==current.config.schedule_sha256) throw Error('schedule_changed');
  const existing=await validExisting(resolve(OUT,'raw.jsonl'),{current,frozen,schedule});
  const raw=existing.rows;
  const allowed=new Map(schedule.map(s=>[`${s.case_id}:${s.arm}:${s.repeat}`,s]));
  const runs=raw.map(({slot,data:d,client_elapsed_ms,mcp_response_sha256,study_sha256})=>{
    if (study_sha256!==frozen.sha256 || d.manifest_sha256!==current.config.manifest_sha256) throw Error('raw_study_binding_mismatch');
    const scheduled=allowed.get(`${slot.case_id}:${slot.arm}:${slot.repeat}`);
    if (!scheduled || hashCanonical(scheduled)!==hashCanonical(slot)
      || d.case_id!==slot.case_id || d.arm!==slot.arm || d.repeat!==slot.repeat-1
      || d.run_id!==`${slot.case_id}--${slot.arm}--${slot.repeat-1}`) throw Error('raw_slot_binding_mismatch');
    const item=current.dataset.manifest.cases.find(c=>c.case_id===slot.case_id);
    if (d.trace?.assets && (d.trace.assets.length!==2 || ['reference','candidate'].some(role=>d.trace.assets.find(a=>a.role===role)?.sha256!==item[role].sha256))) throw Error('raw_asset_binding_mismatch');
    const receipt=d.provider_receipt ?? {};
    if(receipt.requested_model && (receipt.requested_model!==current.config.models[slot.arm]
      || receipt.provider!==(slot.arm==='B'?'typesafe':'openai'))) throw Error('provider_or_requested_model_changed');
    const expected=current.dataset.truth[slot.case_id]?.expected ?? current.dataset.truth[slot.case_id];
    const metrics=d.status==='complete' ? scoreDiagnostic({expected,actual:d.normalized}) : null;
    return {id:d.run_id,mode:'live',phase:'heldout_diagnosis',case_id:slot.case_id,arm:slot.arm,repeat:slot.repeat,
      defect_family:current.dataset.truth[slot.case_id]?.family ?? slot.case_id,
      status:d.status==='complete'?'completed':d.status,study_sha256:frozen.sha256,
      elapsed_ms:d.status==='blocked'?null:d.elapsed_ms,client_elapsed_ms,model_only_ms:null,
      model_requested:receipt.requested_model,model_returned:receipt.real_model,
      input_sha256:d.trace?.request_sha256,output_sha256:receipt.response_sha256,
      asset_sha256:d.trace?.assets?.map(a=>a.sha256),
      transport:{kind:'provider_http',provider:receipt.provider,http_status:receipt.http_status,response_sha256:receipt.response_sha256,request_id:receipt.request_id},
      mcp_response_sha256,actual:d.normalized ?? null,expected,metrics,
      accepted:metrics ? metrics.correct===1 && (!expected.presence || metrics.category_correct===1):false};
  });
  const report=summarizeRuns(runs,{timeoutMs:current.config.timeout_ms,studySha256:frozen.sha256,modelResolution:current.config.modelResolution});
  const completed=runs.filter(run=>run.status==='completed').length;
  report.coverage={expected_slots:schedule.length,observed_slots:runs.length,terminal_outcomes:runs.length,completed_provider_evaluations:completed,
    missing_slots:schedule.length-runs.length,rejected_records:existing.rejected.length,
    complete:runs.length===schedule.length};
  await save('results.json',report);console.log(JSON.stringify(report.arms,null,2));
} else throw Error('Use preflight|calibrate [limit]|freeze|run [limit]|report');
