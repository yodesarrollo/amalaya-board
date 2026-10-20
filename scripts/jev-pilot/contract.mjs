import {createHash} from 'node:crypto';

const HASH = /^[a-f0-9]{64}$/;
const MODES = new Set(['live', 'fixture', 'dry_run']);
const STATUSES = new Set(['blocked', 'provider_error', 'timeout', 'invalid_output', 'completed', 'cancelled', 'fixture', 'dry_run']);
const FAILURE_STATUSES = new Set(['provider_error', 'timeout', 'invalid_output', 'cancelled']);
const COUNT_FIELDS = ['tp', 'fp', 'tn', 'fn', 'abstentions', 'required_abstentions', 'correct_abstentions', 'inappropriate_abstentions', 'evidence_violations', 'critical_misses', 'category_correct', 'category_evaluated', 'localization_applicable', 'missed_localizations'];

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

function nonempty(value, label) {
  invariant(typeof value === 'string' && value.trim().length > 0, `invalid_${label}`);
}

/** Canonical JSON only: unsupported values, cycles and sparse arrays are rejected. */
export function canonicalStringify(value) {
  const stack = new Set();
  function encode(item) {
    if (item === null) return 'null';
    if (typeof item === 'string' || typeof item === 'boolean') return JSON.stringify(item);
    if (typeof item === 'number') {
      invariant(Number.isFinite(item), 'non_finite_json_number');
      return JSON.stringify(item);
    }
    invariant(typeof item === 'object', 'unsupported_json_value');
    invariant(!stack.has(item), 'cyclic_json_value');
    stack.add(item);
    try {
      if (Array.isArray(item)) {
        for (let i = 0; i < item.length; i++) invariant(Object.hasOwn(item, i), 'sparse_json_array');
        return `[${item.map(encode).join(',')}]`;
      }
      const prototype = Object.getPrototypeOf(item);
      invariant(prototype === Object.prototype || prototype === null, 'unsupported_json_object');
      invariant(Object.getOwnPropertySymbols(item).length === 0, 'symbol_json_key');
      return `{${Object.keys(item).sort().map(key => `${JSON.stringify(key)}:${encode(item[key])}`).join(',')}}`;
    } finally {
      stack.delete(item);
    }
  }
  return encode(value);
}

export function hashCanonical(value) {
  return createHash('sha256').update(canonicalStringify(value)).digest('hex');
}

/** The four inputs must include source versions/assets and private evaluation labels. */
export function freezeStudy({config, dataset, questions, scorer} = {}) {
  const parts = {config, dataset, questions, scorer};
  for (const [key, value] of Object.entries(parts)) invariant(value !== undefined && value !== null, `missing_study_${key}`);
  const hashes = Object.fromEntries(Object.entries(parts).map(([key, value]) => [key, hashCanonical(value)]));
  const identity = {schema_version: 1, algorithm: 'sha256', hashes};
  return Object.freeze({...identity, hashes: Object.freeze(hashes), sha256: hashCanonical(identity)});
}

/** Never silently re-freeze after a run: a changed input requires a new study. */
export function assertFrozenStudy(frozen, current) {
  invariant(frozen?.schema_version === 1 && frozen.algorithm === 'sha256' && frozen.hashes, 'invalid_study_freeze');
  invariant(hashCanonical({schema_version: 1, algorithm: 'sha256', hashes: frozen.hashes}) === frozen.sha256, 'tampered_study_freeze');
  const next = freezeStudy(current);
  const changed = Object.keys(next.hashes).filter(key => next.hashes[key] !== frozen.hashes[key]);
  invariant(changed.length === 0, `study_changed:${changed.join(',')}`);
  return true;
}

function randomGenerator(seed) {
  let state = Number.parseInt(hashCanonical(seed).slice(0, 8), 16) || 0x6d2b79f5;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

function shuffled(values, random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Seeded, paired blocks; each full group of arm-count blocks balances positions. */
export function createSchedule({cases, arms = ['A', 'B'], repetitions = 3, seed = 20261020} = {}) {
  invariant(Array.isArray(cases) && cases.length > 0, 'missing_schedule_cases');
  invariant(Array.isArray(arms) && arms.length >= 2 && new Set(arms).size === arms.length, 'invalid_schedule_arms');
  arms.forEach(arm => nonempty(arm, 'schedule_arm'));
  invariant(Number.isSafeInteger(repetitions) && repetitions >= 1, 'invalid_repetitions');
  const normalized = cases.map(entry => typeof entry === 'string' ? {id: entry} : entry);
  normalized.forEach(entry => nonempty(entry?.id ?? entry?.case_id, 'case_id'));
  const ids = normalized.map(entry => entry.id ?? entry.case_id);
  invariant(new Set(ids).size === ids.length, 'duplicate_case_id');
  const testCases = normalized.filter(entry => entry.split === undefined || entry.split === 'test');
  invariant(testCases.length > 0, 'no_test_cases');
  const random = randomGenerator(seed);
  const blocks = [];
  for (let repeat = 1; repeat <= repetitions; repeat++) {
    for (const entry of shuffled(testCases, random)) blocks.push({entry, repeat});
  }
  const schedule = [];
  let baseOrder, offsets;
  for (let block = 0; block < blocks.length; block++) {
    if (block % arms.length === 0) {
      baseOrder = shuffled(arms, random);
      offsets = shuffled(arms.map((_, i) => i), random);
    }
    const offset = offsets[block % arms.length];
    const order = baseOrder.slice(offset).concat(baseOrder.slice(0, offset));
    const {entry, repeat} = blocks[block];
    const caseId = entry.id ?? entry.case_id;
    order.forEach((arm, position) => schedule.push({
      order: schedule.length + 1,
      block_id: `${repeat}:${caseId}`,
      case_id: caseId,
      defect_family: entry.defect_family ?? entry.family_id ?? caseId,
      split: 'test',
      repeat,
      arm,
      arm_position: position + 1,
    }));
  }
  return schedule;
}

function normalizedBox(box) {
  if (box === null || box === undefined) return null;
  const value = Array.isArray(box) ? {left: box[0], top: box[1], right: box[2], bottom: box[3]} : box;
  invariant(!Array.isArray(box) || box.length === 4, 'invalid_box');
  invariant(value && ['left', 'top', 'right', 'bottom'].every(key => typeof value[key] === 'number' && Number.isFinite(value[key]) && value[key] >= 0 && value[key] <= 1), 'invalid_box');
  invariant(value.left < value.right && value.top < value.bottom, 'invalid_box_edges');
  return value;
}

export function intersectionOverUnion(predicted, reference) {
  const p = normalizedBox(predicted), r = normalizedBox(reference);
  if (!p || !r) return 0;
  const intersection = Math.max(0, Math.min(p.right, r.right) - Math.max(p.left, r.left)) * Math.max(0, Math.min(p.bottom, r.bottom) - Math.max(p.top, r.top));
  const union = (p.right - p.left) * (p.bottom - p.top) + (r.right - r.left) * (r.bottom - r.top) - intersection;
  return intersection / union;
}

/** Score an external reference; presence is a discrete decision, not confidence. */
export function scoreDiagnostic({expected, actual} = {}) {
  invariant(expected && actual, 'missing_diagnostic');
  invariant([true, false, null].includes(expected.presence), 'invalid_reference_presence');
  invariant([true, false, null].includes(actual.presence), 'invalid_actual_presence');
  invariant(typeof actual.abstain === 'boolean', 'missing_abstention_decision');
  const insufficient = expected.sufficient_evidence === false;
  invariant(insufficient || typeof expected.presence === 'boolean', 'unknown_reference_requires_insufficient_evidence');
  invariant(actual.abstain || typeof actual.presence === 'boolean', 'unknown_actual_requires_abstention');
  const referenceBox = normalizedBox(expected.box), predictedBox = normalizedBox(actual.box);
  const result = Object.fromEntries(COUNT_FIELDS.map(key => [key, 0]));
  Object.assign(result, {count: 1, correct: 0, iou: null, conditional_iou: null, negative_box_ignored: false});
  if (actual.abstain) result.abstentions = 1;
  if (insufficient) {
    result.required_abstentions = 1;
    result.correct_abstentions = Number(actual.abstain);
    result.evidence_violations = Number(!actual.abstain);
    result.correct = Number(actual.abstain);
    result.negative_box_ignored = Boolean(predictedBox);
    return result;
  }
  const positive = !actual.abstain && actual.presence;
  result.inappropriate_abstentions = Number(actual.abstain);
  if (expected.presence) {
    result.tp = Number(positive);
    result.fn = Number(!positive);
    result.critical_misses = Number(expected.critical === true && !positive);
  } else {
    result.fp = Number(positive);
    result.tn = Number(!actual.abstain && !positive);
  }
  result.correct = Number(!actual.abstain && actual.presence === expected.presence);
  if (expected.presence && referenceBox) {
    result.localization_applicable = 1;
    result.iou = positive && predictedBox ? intersectionOverUnion(predictedBox, referenceBox) : 0;
    result.missed_localizations = Number(!positive || !predictedBox);
    if (positive && predictedBox) result.conditional_iou = result.iou;
  } else {
    result.negative_box_ignored = Boolean(predictedBox);
  }
  if (expected.presence && typeof expected.category === 'string') {
    result.category_evaluated = 1;
    result.category_correct = Number(positive && actual.category === expected.category);
  }
  return result;
}

/** Structural provenance checks; receipt validation is not cryptographic provider attestation.
 * Alias resolutions must come from the caller's frozen study config, never from a run itself.
 */
export function validateRunReceipt(run, {studySha256, model, provider, modelResolution = {}} = {}) {
  invariant(modelResolution && typeof modelResolution === 'object' && !Array.isArray(modelResolution)
    && [Object.prototype, null].includes(Object.getPrototypeOf(modelResolution)), 'invalid_model_resolution');
  for (const [requested, resolved] of Object.entries(modelResolution)) {
    nonempty(requested, 'resolution_requested_model');nonempty(resolved, 'resolution_returned_model');
  }
  invariant(run && typeof run === 'object', 'missing_run');
  for (const key of ['id', 'case_id', 'arm']) nonempty(run[key], key);
  invariant(MODES.has(run.mode), 'invalid_run_mode');
  invariant(STATUSES.has(run.status), 'invalid_run_status');
  invariant(Number.isSafeInteger(run.repeat) && run.repeat >= 1, 'invalid_run_repeat');
  invariant(HASH.test(run.study_sha256 ?? ''), 'missing_run_study_hash');
  if (studySha256) invariant(run.study_sha256 === studySha256, 'run_study_changed');
  if (run.status === 'blocked') invariant(run.elapsed_ms === null, 'blocked_run_has_invented_time');
  else invariant(typeof run.elapsed_ms === 'number' && Number.isFinite(run.elapsed_ms) && run.elapsed_ms >= 0, 'invalid_elapsed_time');
  if (run.accepted !== undefined) invariant(typeof run.accepted === 'boolean', 'invalid_acceptance');
  if (run.mode !== 'live') {
    invariant(run.transport?.kind !== 'provider_http', 'fixture_claims_live_transport');
    invariant(!['completed'].includes(run.status) || run.transport?.kind === 'fixture', 'fixture_missing_fixture_transport');
    return true;
  }
  invariant(!['fixture', 'dry_run'].includes(run.status), 'live_claims_fixture_status');
  invariant(run.transport?.kind !== 'fixture', 'live_claims_fixture_transport');
  if (run.status !== 'completed') return true;
  invariant(run.transport?.kind === 'provider_http', 'live_missing_provider_transport');
  invariant(Number.isInteger(run.transport.http_status) && run.transport.http_status >= 200 && run.transport.http_status < 300, 'live_provider_http_failed');
  invariant(HASH.test(run.transport.response_sha256 ?? ''), 'live_missing_response_hash');
  nonempty(run.model_requested, 'requested_model');
  nonempty(run.model_returned, 'returned_model');
  invariant(run.model_requested === run.model_returned
    || (Object.hasOwn(modelResolution, run.model_requested)
      && modelResolution[run.model_requested] === run.model_returned), 'live_model_substitution');
  if (model) invariant(run.model_returned === model, 'unexpected_live_model');
  if (provider) invariant(run.transport.provider === provider, 'unexpected_live_provider');
  invariant(HASH.test(run.input_sha256 ?? '') && HASH.test(run.output_sha256 ?? ''), 'live_missing_io_hashes');
  invariant(Array.isArray(run.asset_sha256) && run.asset_sha256.length > 0 && run.asset_sha256.every(value => HASH.test(value)), 'live_missing_asset_hashes');
  return true;
}

function divide(numerator, denominator) {
  return denominator ? numerator / denominator : null;
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b), middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function aggregateMetrics(runs) {
  const results = runs.filter(run => run.status === 'completed' && run.metrics).map(run => run.metrics);
  const counts = Object.fromEntries(COUNT_FIELDS.map(key => [key, 0]));
  let total = 0, correct = 0;
  const ious = [], conditionalIous = [];
  for (const metrics of results) {
    const count = metrics.count ?? 1, correctCount = metrics.correct ?? 0;
    invariant(Number.isSafeInteger(count) && count >= 1, 'invalid_metric_count');
    invariant(Number.isSafeInteger(correctCount) && correctCount >= 0 && correctCount <= count, 'invalid_metric_correct');
    for (const key of COUNT_FIELDS) {
      const value = metrics[key] ?? 0;
      invariant(Number.isSafeInteger(value) && value >= 0 && value <= count, `invalid_metric_${key}`);
      counts[key] += value;
    }
    total += count;
    correct += correctCount;
    for (const key of ['iou', 'conditional_iou']) if (metrics[key] !== null && metrics[key] !== undefined) invariant(Number.isFinite(metrics[key]) && metrics[key] >= 0 && metrics[key] <= 1, `invalid_metric_${key}`);
    if (metrics.iou !== null && metrics.iou !== undefined) ious.push(metrics.iou);
    if (metrics.conditional_iou !== null && metrics.conditional_iou !== undefined) conditionalIous.push(metrics.conditional_iou);
  }
  const precision = divide(counts.tp, counts.tp + counts.fp), recall = divide(counts.tp, counts.tp + counts.fn);
  return {...counts, evaluated_runs: results.length, total, correct,
    accuracy: divide(correct, total), precision, recall,
    f1: divide(2 * counts.tp, 2 * counts.tp + counts.fp + counts.fn),
    abstention_rate: divide(counts.abstentions, total),
    required_abstention_accuracy: divide(counts.correct_abstentions, counts.required_abstentions),
    mean_iou: divide(ious.reduce((sum, value) => sum + value, 0), ious.length),
    median_iou: median(ious),
    conditional_mean_iou: divide(conditionalIous.reduce((sum, value) => sum + value, 0), conditionalIous.length)};
}

function groupedSummary(runs, timeoutMs) {
  const statusCounts = Object.fromEntries([...STATUSES].map(status => [status, 0]));
  const completedTimes = [], penalizedTimes = [];
  let attempted = 0, accepted = 0, failed = 0, unknownAcceptance = 0, budgetOverruns = 0;
  for (const run of runs) {
    statusCounts[run.status]++;
    if (run.status === 'blocked') continue;
    attempted++;
    const overBudget = run.elapsed_ms > timeoutMs;
    if (overBudget) budgetOverruns++;
    if (run.status === 'completed') completedTimes.push(run.elapsed_ms);
    if (run.status === 'completed' && run.accepted === true && !overBudget) {
      accepted++;penalizedTimes.push(Math.min(timeoutMs, run.elapsed_ms));
    } else if (FAILURE_STATUSES.has(run.status) || run.accepted === false || overBudget) {
      failed++;penalizedTimes.push(timeoutMs);
    } else unknownAcceptance++;
  }
  return {records: runs.length, attempted, accepted, failed, unknown_acceptance: unknownAcceptance, budget_overruns: budgetOverruns,
    status_counts: statusCounts, elapsed_ms_total: runs.reduce((sum, run) => sum + (run.elapsed_ms ?? 0), 0),
    completed_elapsed_median_ms: median(completedTimes),
    penalized_time_observations: penalizedTimes.length,
    penalized_time_median_ms: median(penalizedTimes),
    penalized_time_total_ms: penalizedTimes.reduce((sum, value) => sum + value, 0),
    metrics: aggregateMetrics(runs)};
}

/** All records are retained; only validated live runs contribute to comparisons. */
export function summarizeRuns(runs, {timeoutMs = 30 * 60 * 1000, studySha256, modelResolution = {}} = {}) {
  invariant(Array.isArray(runs), 'invalid_runs');
  invariant(Number.isFinite(timeoutMs) && timeoutMs > 0, 'invalid_timeout');
  const ids = new Set(), slots = new Set();
  for (const run of runs) {
    validateRunReceipt(run, {studySha256, modelResolution});
    invariant(!ids.has(run.id), 'duplicate_run_id');ids.add(run.id);
    const slot = canonicalStringify([run.mode, run.phase ?? null, run.case_id, run.arm, run.repeat]);
    invariant(!slots.has(slot), 'duplicate_scheduled_run');slots.add(slot);
  }
  const live = runs.filter(run => run.mode === 'live');
  const arms = [...new Set(live.map(run => run.arm))].sort();
  const caseIds = [...new Set(live.map(run => run.case_id))].sort();
  const familyIds = [...new Set(live.map(run => run.defect_family ?? run.case_id))].sort();
  const byCase = Object.fromEntries(caseIds.map(id => [id, Object.fromEntries(arms.map(arm => [arm, groupedSummary(live.filter(run => run.case_id === id && run.arm === arm), timeoutMs)]))]));
  const byFamily = Object.fromEntries(familyIds.map(id => [id, Object.fromEntries(arms.map(arm => [arm, groupedSummary(live.filter(run => (run.defect_family ?? run.case_id) === id && run.arm === arm), timeoutMs)]))]));
  return {
    total_records: runs.length,
    live_records: live.length,
    excluded: {fixture: runs.filter(run => run.mode === 'fixture').length, dry_run: runs.filter(run => run.mode === 'dry_run').length},
    units: {case_ids: caseIds, defect_families: familyIds, independent_buildings: null, note: 'Repetitions and views are not independent buildings.'},
    arms: Object.fromEntries(arms.map(arm => [arm, groupedSummary(live.filter(run => run.arm === arm), timeoutMs)])),
    by_case: byCase,
    by_family: byFamily,
    records: structuredClone(runs),
  };
}
