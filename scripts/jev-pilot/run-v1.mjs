import {readFile, writeFile, mkdir, appendFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {freezeStudy, assertFrozenStudy, createSchedule, scoreDiagnostic, summarizeRuns, hashCanonical} from './contract.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const ENDPOINT = 'https://yod-cloud-room.onrender.com/jev-mcp';
const DATA = resolve(ROOT, 'public/levantamiento/jev-pilot-v1');
const OUT = resolve(process.env.AMALAYA_PILOT_OUTPUT || resolve(ROOT, 'tmp/jev-pilot'));
const sha = value => createHash('sha256').update(value).digest('hex');
const json = async path => JSON.parse(await readFile(path, 'utf8'));
const save = async (name, value) => writeFile(resolve(OUT, name), JSON.stringify(value, null, 2) + '\n');
await mkdir(OUT, {recursive:true});
const [action = 'preflight', limitArg] = process.argv.slice(2);

async function rpc(name, args = {}) {
  const start = performance.now();
  const response = await fetch(ENDPOINT, {
    method:'POST', redirect:'error', signal:AbortSignal.timeout(100000),
    headers:{'Content-Type':'application/json','Accept':'application/json',
      ...(name==='amalaya_pilot_run' && process.env.AMALAYA_PILOT_RUN_TOKEN ? {'x-amalaya-pilot-token':process.env.AMALAYA_PILOT_RUN_TOKEN}:{})},
    body:JSON.stringify({jsonrpc:'2.0',id:1,method:'tools/call',params:{name,arguments:args}})
  });
  const raw = await response.text();
  if (!response.ok) throw Error(`MCP HTTP ${response.status}`);
  const envelope = JSON.parse(raw);
  if (envelope.error) throw Error(`MCP ${JSON.stringify(envelope.error)}`);
  const result = envelope.result;
  const data = result.structuredContent ?? JSON.parse(result.content.find(x=>x.type === 'text').text);
  return {data, client_elapsed_ms:performance.now()-start, mcp_response_sha256:sha(raw)};
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
  const existing=(await readFile(rawPath,'utf8').catch(()=>'' )).split('\n').filter(Boolean).map(JSON.parse);
  const done=new Set(existing.map(x=>`${x.slot.case_id}:${x.slot.arm}:${x.slot.repeat}`));
  let count=0;
  for (const slot of schedule) {
    if (done.has(`${slot.case_id}:${slot.arm}:${slot.repeat}`)) continue;
    if (count++>=limit) break;
    if (frozen) assertFrozenStudy(frozen,await inputs());
    let result;
    try {result=await rpc('amalaya_pilot_run',{case_id:slot.case_id,arm:slot.arm,repeat:slot.repeat-1});}
    catch(error) {
      await appendFile(resolve(OUT,'transport-errors.jsonl'),JSON.stringify({slot,at:new Date().toISOString(),reason:String(error.message).slice(0,200)})+'\n');
      const recovered=await rpc('amalaya_pilot_status',{case_id:slot.case_id,arm:slot.arm,repeat:slot.repeat-1});
      if (!recovered.data.record || ['pending','blocked'].includes(recovered.data.record.status)) throw error;
      result={...recovered,data:recovered.data.record,recovered_after_transport_error:true};
    }
    await appendFile(rawPath,JSON.stringify({slot,study_sha256:frozen?.sha256 ?? null,...result})+'\n');
    console.log(`${slot.case_id} ${slot.arm} r${slot.repeat}: ${result.data.status} ${result.data.elapsed_ms ?? '-'}ms`);
    if (result.data.status === 'blocked') throw Error(`blocked:${result.data.reason}`);
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
  const raw=(await readFile(resolve(OUT,'raw.jsonl'),'utf8')).split('\n').filter(Boolean).map(JSON.parse);
  const schedule=await json(resolve(OUT,'schedule.json'));
  if (hashCanonical(schedule)!==current.config.schedule_sha256) throw Error('schedule_changed');
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
  report.coverage={expected_slots:schedule.length,observed_slots:runs.length,complete:runs.length===schedule.length};
  await save('results.json',report);console.log(JSON.stringify(report.arms,null,2));
} else throw Error('Use preflight|calibrate [limit]|freeze|run [limit]|report');
