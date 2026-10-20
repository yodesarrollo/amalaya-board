import {createHash, randomUUID} from 'node:crypto';
import {setTimeout as wait} from 'node:timers/promises';

const HASH = /^[a-f0-9]{64}$/;
const CATEGORIES = new Set(['none', 'missing_feature', 'displacement', 'scale', 'insufficient_evidence']);
const TERMINAL = new Set(['complete', 'provider_error', 'timeout', 'invalid_output']);
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = value => typeof value === 'string' && value.length > 0;
const finite = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const sha = value => createHash('sha256').update(value).digest('hex');

export class MCPTransportError extends Error {
  constructor(code, details = {}) {super(code); this.name = 'MCPTransportError'; this.code = code; Object.assign(this, details);}
}
export class ConnectorRateLimit extends MCPTransportError {
  constructor(details = {}) {super('connector_rate_limit', details); this.name = 'ConnectorRateLimit';}
}
export class MalformedReceipt extends MCPTransportError {
  constructor(code = 'malformed_receipt', details = {}) {super(code, details); this.name = 'MalformedReceipt';}
}
const requireValue = (condition, code) => {if (!condition) throw new MalformedReceipt(code);};

/** A rejection or an unfinished reservation is never a completed study slot. */
export function assertPilotOutcome(data, {args, manifestSha256, models, modelResolution, assets} = {}) {
  requireValue(plain(data) && TERMINAL.has(data.status), 'not_a_terminal_pilot_outcome');
  requireValue(data.study_id === 'amalaya-ebsw-visual-v1' && nonempty(data.case_id) && ['A','B','C'].includes(data.arm)
    && Number.isInteger(data.repeat) && data.repeat >= 0 && data.repeat <= 2
    && data.run_id === `${data.case_id}--${data.arm}--${data.repeat}`
    && HASH.test(data.manifest_sha256 ?? '') && finite(data.elapsed_ms), 'invalid_outcome_binding');
  if (args) requireValue(data.case_id === args.case_id && data.arm === args.arm && data.repeat === args.repeat, 'outcome_slot_mismatch');
  if (manifestSha256) requireValue(data.manifest_sha256 === manifestSha256, 'outcome_manifest_mismatch');
  if (data.status !== 'complete') return data;
  const n = data.normalized, r = data.provider_receipt;
  requireValue(plain(n) && [true,false,null].includes(n.presence) && typeof n.abstain === 'boolean'
    && CATEGORIES.has(n.category) && Object.hasOwn(n, 'box'), 'invalid_completed_normalized');
  requireValue(n.presence !== null || n.abstain, 'invalid_completed_presence');
  requireValue(n.abstain === (n.category === 'insufficient_evidence')
    && (n.abstain || n.presence !== false || n.category === 'none')
    && (n.abstain || n.presence !== true || n.category !== 'none'), 'inconsistent_completed_normalized');
  if (n.box !== null) requireValue(n.presence === true && !n.abstain && plain(n.box)
    && ['top','bottom','left','right'].every(key => finite(n.box[key]) && n.box[key] <= 1)
    && n.box.top < n.box.bottom && n.box.left < n.box.right, 'invalid_completed_box');
  requireValue(plain(r) && r.provider === (data.arm === 'B' ? 'typesafe' : 'openai')
    && nonempty(r.requested_model) && nonempty(r.real_model) && Number.isInteger(r.http_status) && r.http_status >= 200 && r.http_status < 300
    && HASH.test(r.response_sha256 ?? '') && nonempty(r.started_at) && Number.isFinite(Date.parse(r.started_at))
    && nonempty(r.received_at) && Number.isFinite(Date.parse(r.received_at)), 'invalid_completed_provider_receipt');
  if (models) requireValue(r.requested_model === models[data.arm], 'outcome_requested_model_mismatch');
  if (modelResolution) requireValue(r.real_model === (modelResolution[r.requested_model] ?? r.requested_model), 'outcome_returned_model_mismatch');
  requireValue(plain(data.trace) && HASH.test(data.trace.request_sha256 ?? '') && HASH.test(data.trace.prompt_sha256 ?? '')
    && Array.isArray(data.trace.assets) && data.trace.assets.length === 2
    && ['reference','candidate'].every(role => data.trace.assets.filter(asset => asset.role === role && HASH.test(asset.sha256 ?? '')).length === 1), 'invalid_completed_trace');
  if (assets) requireValue(['reference','candidate'].every(role => data.trace.assets.find(asset => asset.role === role).sha256 === assets[role].sha256), 'outcome_asset_mismatch');
  requireValue(plain(data.raw) && data.raw.model === r.real_model, 'invalid_completed_raw_response');
  return data;
}

export function isPilotOutcome(data, options) {try {assertPilotOutcome(data, options); return true;} catch {return false;}}

function decode(raw, response, id, name, args, validation) {
  if (response.status === 429) throw new ConnectorRateLimit();
  if (!response.ok) throw new MCPTransportError('mcp_http_error', {http_status: response.status});
  let envelope; try {envelope = JSON.parse(raw);} catch {throw new MCPTransportError('mcp_invalid_json');}
  if (!plain(envelope) || envelope.jsonrpc !== '2.0' || envelope.id !== id) throw new MCPTransportError('mcp_invalid_envelope');
  if (envelope.error) throw new MCPTransportError('mcp_rpc_error', {rpc_error: envelope.error});
  const result = envelope.result;
  if (!plain(result)) throw new MCPTransportError('mcp_missing_result');
  let data = result.structuredContent;
  if (!plain(data)) {
    const texts = Array.isArray(result.content) ? result.content.filter(item => item?.type === 'text' && typeof item.text === 'string') : [];
    if (texts.length !== 1) throw new MCPTransportError('mcp_invalid_content');
    try {data = JSON.parse(texts[0].text);} catch {throw new MCPTransportError('mcp_content_not_json');}
  }
  if (data?.error === 'limite_de_uso') throw new ConnectorRateLimit({payload: data});
  if (result.isError === true && ['complete','ready','not_run'].includes(data?.status)) throw new MalformedReceipt('mcp_error_claims_success');
  if (name === 'amalaya_pilot_run') return assertPilotOutcome(data, {args, ...validation});
  if (name !== 'amalaya_pilot_status' || !plain(data) || data.study_id !== 'amalaya-ebsw-visual-v1'
    || !['ready','not_run','complete','blocked','provider_error','timeout','invalid_output'].includes(data.status)
    || !plain(data.preflight)) throw new MCPTransportError('mcp_invalid_status_result');
  if (data.status === 'complete') assertPilotOutcome(data.record, {args: Object.keys(args).length ? args : undefined, ...validation});
  return data;
}

/** Every response is logged before retry/return. IDs link rejections to their later outcome. */
export function createPilotTransport({endpoint, runToken, fetchImpl = globalThis.fetch, now = () => performance.now(), sleep = wait,
  logAttempt = async () => {}, maxRetries = 2, backoffMs = 15000, timeoutMs = 60000} = {}) {
  if (!Number.isInteger(maxRetries) || maxRetries < 0 || maxRetries > 2 || !finite(backoffMs) || timeoutMs <= 0 || timeoutMs > 60000) throw Error('invalid_transport_limits');
  let lastRequestStart = -Infinity, pacing = Promise.resolve();
  function pace() {
    const next = pacing.then(async () => {
      const delay = Math.max(0, 1200 - (now() - lastRequestStart));
      if (delay) await sleep(delay);
      lastRequestStart = now();
    });
    pacing = next.catch(() => {});
    return next;
  }
  return async function rpc(name, args = {}, {context = {}, validation = {}, linkedOperationId = null} = {}) {
    const operationId = randomUUID(), operationStart = now(), attempts = [];
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const attemptId = `${operationId}:${attempt + 1}`;
      await pace();
      const started = now();
      let raw = null, response = null, data, failure;
      try {
        response = await fetchImpl(endpoint, {method: 'POST', redirect: 'error', signal: AbortSignal.timeout(timeoutMs),
          headers: {'Content-Type':'application/json', Accept:'application/json',
            ...(name === 'amalaya_pilot_run' && runToken ? {'x-amalaya-pilot-token': runToken} : {})},
          body: JSON.stringify({jsonrpc:'2.0', id:attemptId, method:'tools/call', params:{name, arguments:args}})});
        // Backend caps its provider body. Bound this envelope independently, including nested JSON escaping.
        const chunks = []; let size = 0;
        for await (const chunk of response.body) {
          size += chunk.length; if (size > 4 * 1024 * 1024) throw new MCPTransportError('mcp_response_too_large');
          chunks.push(Buffer.from(chunk));
        }
        raw = Buffer.concat(chunks).toString('utf8');
        data = decode(raw, response, attemptId, name, args, validation);
      } catch (error) {failure = error instanceof MCPTransportError ? error : new MCPTransportError(error.name === 'TimeoutError' ? 'mcp_timeout' : 'mcp_network_error');}
      const record = {operation_id: operationId, attempt_id: attemptId, linked_operation_id: linkedOperationId, attempt: attempt + 1,
        at: new Date().toISOString(), tool: name, args, context, http_status: response?.status ?? null,
        client_elapsed_ms: Math.max(0, now() - started), mcp_response_sha256: raw === null ? null : sha(raw),
        outcome: failure ? failure.code : 'validated', raw_response: raw === null ? null : runToken ? raw.split(runToken).join('[REDACTED]') : raw};
      attempts.push({attempt_id: attemptId, outcome: record.outcome, client_elapsed_ms: record.client_elapsed_ms, mcp_response_sha256: record.mcp_response_sha256});
      await logAttempt(record); // Persistence failure stops the run; it never silently drops an attempt.
      if (!failure) return {data, client_elapsed_ms: Math.max(0, now() - operationStart), mcp_response_sha256: record.mcp_response_sha256,
        transport: {operation_id: operationId, linked_operation_id: linkedOperationId, attempts}};
      if (failure instanceof ConnectorRateLimit && attempt < maxRetries) {
        const delay = Math.min(30000, backoffMs * 2 ** attempt);
        await sleep(delay); continue;
      }
      Object.assign(failure, {operation_id: operationId, attempts, client_elapsed_ms: Math.max(0, now() - operationStart)});
      throw failure;
    }
  };
}
