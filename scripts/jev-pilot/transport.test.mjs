// Transport fixtures only. No provider calls and no performance conclusions.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createPilotTransport, ConnectorRateLimit, MalformedReceipt, isPilotOutcome} from './transport.mjs';

const args = {case_id:'test01', arm:'A', repeat:0};
const H = 'a'.repeat(64);
const rejection = {error:'limite_de_uso', nota:'Sigue sin Jev'};
function receipt() {
  return {study_id:'amalaya-ebsw-visual-v1', ...args, run_id:'test01--A--0', manifest_sha256:H, status:'complete', elapsed_ms:100,
    normalized:{presence:false, abstain:false, category:'none', box:null},
    provider_receipt:{provider:'openai', requested_model:'gpt-5.4', real_model:'gpt-5.4', http_status:200, response_sha256:H,
      started_at:'2026-10-20T00:00:00.000Z', received_at:'2026-10-20T00:00:00.100Z'},
    trace:{request_sha256:H, prompt_sha256:H, assets:[{role:'reference',sha256:H},{role:'candidate',sha256:H}]},
    raw:{model:'gpt-5.4'}};
}
function envelope(options, data, isError = false) {
  const request = JSON.parse(options.body);
  return new Response(JSON.stringify({jsonrpc:'2.0', id:request.id,
    result:{content:[{type:'text',text:JSON.stringify(data)}], ...(isError?{isError:true}:{})}}));
}

test('observed HTTP200 connector rejection is an exception, never an outcome or a completed resume slot', async () => {
  const logs=[];
  const rpc=createPilotTransport({endpoint:'https://fixture.invalid/jev-mcp', maxRetries:0,
    fetchImpl:async(_url,options)=>envelope(options,rejection,true), logAttempt:async record=>logs.push(record)});
  await assert.rejects(rpc('amalaya_pilot_run',args),ConnectorRateLimit);
  assert.equal(logs.length,1); assert.equal(logs[0].outcome,'connector_rate_limit');
  assert.deepEqual(JSON.parse(JSON.parse(logs[0].raw_response).result.content[0].text),rejection);
  const legacyRows=[receipt(),...Array.from({length:32},()=>rejection)];
  const done=legacyRows.filter(data=>isPilotOutcome(data));
  assert.equal(done.length,1); assert.equal(done.length===33,false);
});

test('status complete with a malformed provider receipt cannot return a successful outcome', async () => {
  const malformed={...receipt(),provider_receipt:{http_status:200}}; const logs=[];
  const rpc=createPilotTransport({endpoint:'https://fixture.invalid/jev-mcp',
    fetchImpl:async(_url,options)=>envelope(options,malformed), logAttempt:async record=>logs.push(record)});
  await assert.rejects(rpc('amalaya_pilot_run',args),MalformedReceipt);
  assert.equal(isPilotOutcome(malformed),false); assert.equal(logs.length,1);
  assert.equal(logs[0].outcome,'invalid_completed_provider_receipt'); assert.ok(logs[0].raw_response.includes('complete'));
  const flagged=createPilotTransport({endpoint:'https://fixture.invalid/jev-mcp',
    fetchImpl:async(_url,options)=>envelope(options,receipt(),true)});
  await assert.rejects(flagged('amalaya_pilot_run',args),error=>error.code==='mcp_error_claims_success');
});

test('rejection, bounded backoff and retry success retain linked attempts, raw responses and hashes', async () => {
  const logs=[],delays=[]; let calls=0,clock=0;
  const rpc=createPilotTransport({endpoint:'https://fixture.invalid/jev-mcp',runToken:'fixture-private-token',now:()=>clock,
    sleep:async ms=>{delays.push(ms);clock+=ms;},logAttempt:async record=>logs.push(record),
    fetchImpl:async(_url,options)=>{clock+=10;calls++;return envelope(options,calls===1?rejection:receipt(),calls===1);}});
  const result=await rpc('amalaya_pilot_run',args,{context:{slot:'test01:A:1'}});
  assert.equal(result.data.status,'complete'); assert.equal(calls,2); assert.deepEqual(delays,[15000]);
  assert.equal(logs.length,2); assert.equal(logs[0].operation_id,logs[1].operation_id);
  assert.notEqual(logs[0].attempt_id,logs[1].attempt_id);
  assert.deepEqual(result.transport.attempts.map(attempt=>attempt.outcome),['connector_rate_limit','validated']);
  assert.ok(logs.every(record=>/^[a-f0-9]{64}$/.test(record.mcp_response_sha256)&&record.raw_response));
  assert.equal(result.transport.operation_id,logs[0].operation_id); assert.equal(result.client_elapsed_ms,15020);
  assert.equal(JSON.stringify(logs).includes('fixture-private-token'),false);
  await rpc('amalaya_pilot_run',args);
  assert.equal(delays.at(-1),1190); // New slots share a minimum 1.2 s request cadence.
});
