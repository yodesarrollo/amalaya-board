import test from 'node:test';
import assert from 'node:assert/strict';
import {canonicalStringify, hashCanonical, freezeStudy, assertFrozenStudy, createSchedule, intersectionOverUnion, scoreDiagnostic, validateRunReceipt, summarizeRuns} from './contract.mjs';

const HASH = 'a'.repeat(64);
const box = {left: .1, top: .1, right: .5, bottom: .5};
const inputs = () => ({config: {source_commit: 'source-v1', source_world_sha256: HASH, seed: 42}, dataset: [{id: 'd1', expected: {presence: true}}], questions: {presence: 'Is it present?'}, scorer: {version: 1}});
const receipt = (overrides = {}) => ({id: 'r1', case_id: 'd1', defect_family: 'vanos', arm: 'B', repeat: 1, mode: 'live', status: 'completed', study_sha256: HASH, elapsed_ms: 100, input_sha256: HASH, output_sha256: HASH, asset_sha256: [HASH], model_requested: 'jev-1.14.0', model_returned: 'jev-1.14.0', transport: {kind: 'provider_http', provider: 'typesafe', http_status: 200, response_sha256: HASH}, ...overrides});

test('canonical JSON is insensitive to key insertion order but preserves array order', () => {
  assert.equal(hashCanonical({z: 3, a: {b: 2, a: 1}}), hashCanonical({a: {a: 1, b: 2}, z: 3}));
  assert.notEqual(hashCanonical([1, 2]), hashCanonical([2, 1]));
  for (const value of [NaN, Infinity, undefined, new Date(), [undefined], new Array(2)]) assert.throws(() => canonicalStringify(value));
  const cyclic = {};cyclic.self = cyclic;assert.throws(() => canonicalStringify(cyclic), /cyclic/);
});

test('freeze detects every changed component and source checkpoint; tampering cannot reauthorize', () => {
  const study = inputs(), frozen = freezeStudy(study);
  assert.equal(assertFrozenStudy(frozen, structuredClone(study)), true);
  for (const key of ['config', 'dataset', 'questions', 'scorer']) {
    const changed = structuredClone(study);changed[key] = {different: true};
    assert.throws(() => assertFrozenStudy(frozen, changed), new RegExp(`study_changed:${key}`));
  }
  const sourceChanged = inputs();sourceChanged.config.source_commit = 'source-v2';
  assert.throws(() => assertFrozenStudy(frozen, sourceChanged), /study_changed:config/);
  const tampered = {...frozen, hashes: {...frozen.hashes, config: HASH}};
  assert.throws(() => assertFrozenStudy(tampered, study), /tampered/);
});

test('schedule is reproducible, paired and balanced; calibration and labels are not emitted', () => {
  const cases = [...Array.from({length: 14}, (_, i) => ({id: `t${i}`, split: 'test', defect_family: `family${i % 4}`, expected: 'secret'})), {id: 'calibration', split: 'calibration'}];
  const settings = {cases, arms: ['A', 'B'], repetitions: 3, seed: 42};
  const schedule = createSchedule(settings);
  assert.equal(schedule.length, 84);
  assert.deepEqual(schedule, createSchedule(settings));
  assert.notDeepEqual(schedule, createSchedule({...settings, seed: 43}));
  assert.ok(schedule.every(run => run.case_id !== 'calibration' && !('expected' in run)));
  const positions = new Map();
  for (let i = 0; i < schedule.length; i += 2) {
    const pair = schedule.slice(i, i + 2);
    assert.equal(pair[0].block_id, pair[1].block_id);
    assert.deepEqual(pair.map(run => run.arm).sort(), ['A', 'B']);
    for (const run of pair) positions.set(`${run.arm}:${run.arm_position}`, (positions.get(`${run.arm}:${run.arm_position}`) ?? 0) + 1);
  }
  assert.equal(positions.get('A:1'), 21);assert.equal(positions.get('B:1'), 21);
  const three = createSchedule({...settings, arms: ['A', 'B', 'C']});
  assert.equal(three.length, 126);
  for (const arm of ['A', 'B', 'C']) for (let position = 1; position <= 3; position++) assert.equal(three.filter(run => run.arm === arm && run.arm_position === position).length, 14);
  assert.throws(() => createSchedule({...settings, cases: [{id: 'same'}, {id: 'same'}]}), /duplicate_case/);
});

test('IoU uses normalized spatial overlap and rejects impossible boxes', () => {
  assert.equal(intersectionOverUnion(box, box), 1);
  assert.equal(intersectionOverUnion(box, {left: .6, top: .6, right: .9, bottom: .9}), 0);
  assert.ok(Math.abs(intersectionOverUnion([0, 0, .5, .5], [.25, .25, .75, .75]) - 1 / 7) < 1e-10);
  assert.equal(intersectionOverUnion(null, box), 0);
  assert.throws(() => intersectionOverUnion({left: -.1, top: 0, right: 1, bottom: 1}, box), /invalid_box/);
  assert.throws(() => intersectionOverUnion({left: .5, top: .1, right: .2, bottom: .5}, box), /edges/);
});

test('presence gates Box; a box returned for an absent target earns no localization credit', () => {
  const absent = scoreDiagnostic({expected: {presence: false}, actual: {presence: false, abstain: false, box}});
  assert.equal(absent.tn, 1);assert.equal(absent.iou, null);assert.equal(absent.negative_box_ignored, true);
  const hallucinated = scoreDiagnostic({expected: {presence: false}, actual: {presence: true, abstain: false, box}});
  assert.equal(hallucinated.fp, 1);assert.equal(hallucinated.localization_applicable, 0);
  const missed = scoreDiagnostic({expected: {presence: true, box, critical: true}, actual: {presence: false, abstain: false, box}});
  assert.equal(missed.fn, 1);assert.equal(missed.iou, 0);assert.equal(missed.critical_misses, 1);
  assert.equal(missed.conditional_iou, null);
});

test('uncertainty is scored explicitly and inappropriate abstention does not become a true negative', () => {
  const expected = {presence: null, sufficient_evidence: false};
  const correct = scoreDiagnostic({expected, actual: {presence: null, abstain: true}});
  assert.equal(correct.correct_abstentions, 1);assert.equal(correct.correct, 1);assert.equal(correct.tn, 0);
  const guessing = scoreDiagnostic({expected, actual: {presence: false, abstain: false}});
  assert.equal(guessing.evidence_violations, 1);assert.equal(guessing.correct, 0);
  const wrongAbstention = scoreDiagnostic({expected: {presence: true}, actual: {presence: null, abstain: true}});
  assert.equal(wrongAbstention.fn, 1);assert.equal(wrongAbstention.inappropriate_abstentions, 1);
  assert.throws(() => scoreDiagnostic({expected: {presence: null}, actual: {presence: null, abstain: false}}), /unknown_reference/);
});

test('live receipts reject fixture impersonation, wrong models and missing source binding', () => {
  assert.equal(validateRunReceipt(receipt(), {studySha256: HASH, model: 'jev-1.14.0', provider: 'typesafe'}), true);
  assert.throws(() => validateRunReceipt(receipt({transport: {kind: 'fixture'}})), /fixture_transport/);
  assert.throws(() => validateRunReceipt(receipt({mode: 'fixture'})), /fixture_claims_live_transport/);
  assert.throws(() => validateRunReceipt(receipt({model_returned: 'other-model'})), /substitution/);
  assert.throws(() => validateRunReceipt(receipt({asset_sha256: []})), /asset_hashes/);
  assert.throws(() => validateRunReceipt(receipt({study_sha256: 'b'.repeat(64)}), {studySha256: HASH}), /study_changed/);
  assert.throws(() => validateRunReceipt(receipt({transport: {kind: 'provider_http', http_status: 500, response_sha256: HASH}})), /http_failed/);
  assert.throws(() => validateRunReceipt(receipt({status: 'blocked', elapsed_ms: 0})), /invented_time/);
  assert.equal(validateRunReceipt(receipt({status: 'blocked', elapsed_ms: null, transport: {kind: 'none'}})), true);
});

test('model aliases require exact resolution from frozen caller config and cannot self-certify', () => {
  const snapshot = 'gpt-5.4-2026-03-05';
  const modelResolution = {'gpt-5.4': snapshot};
  const aliased = receipt({model_requested: 'gpt-5.4', model_returned: snapshot});
  assert.throws(() => validateRunReceipt(aliased), /substitution/);
  assert.equal(validateRunReceipt(aliased, {modelResolution, model: snapshot}), true);
  assert.throws(() => validateRunReceipt(aliased, {modelResolution: {'gpt-5.4': 'gpt-5.4-2026-04-01'}}), /substitution/);
  assert.throws(() => validateRunReceipt({...aliased, model_returned: 'gpt-5.4-2026-03-06'}, {modelResolution}), /substitution/);
  assert.throws(() => validateRunReceipt({...aliased, model_resolution: modelResolution, model_resolution_sha256: hashCanonical(modelResolution)}), /substitution/);
  assert.throws(() => validateRunReceipt(receipt({model_returned: 'jev-1.14.1'})), /substitution/);
  assert.throws(() => validateRunReceipt(aliased, {modelResolution: Object.create(modelResolution)}), /invalid_model_resolution/);
  assert.throws(() => validateRunReceipt(aliased, {modelResolution: {'gpt-5.4': null}}), /resolution_returned_model/);
  assert.throws(() => summarizeRuns([aliased]), /substitution/);
  assert.equal(summarizeRuns([aliased], {modelResolution}).live_records, 1);
});

test('summary retains every failure, excludes fixtures, penalizes failures and counts cases/families', () => {
  const correct = scoreDiagnostic({expected: {presence: true, box}, actual: {presence: true, abstain: false, box}});
  const records = [
    receipt({accepted: true, metrics: correct}),
    receipt({id: 'timeout', repeat: 2, status: 'timeout', elapsed_ms: 500, transport: {kind: 'provider_http'}}),
    receipt({id: 'provider-error', repeat: 3, status: 'provider_error', elapsed_ms: 50, transport: {kind: 'provider_http'}}),
    receipt({id: 'unaccepted', case_id: 'd2', accepted: false, elapsed_ms: 20}),
    receipt({id: 'blocked', case_id: 'd3', status: 'blocked', elapsed_ms: null, transport: {kind: 'none'}}),
    receipt({id: 'fixture', mode: 'fixture', status: 'fixture', accepted: true, elapsed_ms: 1, transport: {kind: 'fixture'}, metrics: {...correct, tp: 999}}),
  ];
  const result = summarizeRuns(records, {timeoutMs: 1800000, studySha256: HASH});
  assert.equal(result.total_records, 6);assert.equal(result.live_records, 5);
  assert.equal(result.excluded.fixture, 1);assert.equal(result.records.length, 6);
  assert.equal(result.arms.B.metrics.tp, 1);assert.equal(result.arms.B.metrics.precision, 1);
  assert.equal(result.arms.B.failed, 3);assert.equal(result.arms.B.accepted, 1);
  assert.equal(result.arms.B.penalized_time_total_ms, 100 + 3 * 1800000);
  assert.equal(result.arms.B.status_counts.blocked, 1);
  assert.equal(result.units.case_ids.length, 3);assert.equal(result.units.defect_families.length, 1);
  assert.equal(result.units.independent_buildings, null);
  assert.equal(result.by_case.d1.B.records, 3);
  records[0].elapsed_ms = 999;assert.equal(result.records[0].elapsed_ms, 100);
});

test('undefined precision stays null and unknown acceptance does not invent a successful correction', () => {
  const metrics = scoreDiagnostic({expected: {presence: false}, actual: {presence: false, abstain: false}});
  const result = summarizeRuns([receipt({metrics})]);
  assert.equal(result.arms.B.metrics.precision, null);assert.equal(result.arms.B.metrics.recall, null);
  assert.equal(result.arms.B.metrics.f1, null);assert.equal(result.arms.B.unknown_acceptance, 1);
  assert.equal(result.arms.B.penalized_time_observations, 0);
  assert.throws(() => summarizeRuns([receipt(), receipt()]), /duplicate_run/);
  assert.throws(() => summarizeRuns([receipt(), receipt({id: 'new-id'})]), /duplicate_scheduled_run/);
});

test('a missed positive has F1 zero and late acceptance cannot manufacture a time win', () => {
  const missed = scoreDiagnostic({expected: {presence: true, box}, actual: {presence: false, abstain: false}});
  const result = summarizeRuns([receipt({accepted: true, elapsed_ms: 1800001, metrics: missed})]);
  assert.equal(result.arms.B.metrics.precision, null);assert.equal(result.arms.B.metrics.recall, 0);
  assert.equal(result.arms.B.metrics.f1, 0);
  assert.equal(result.arms.B.accepted, 0);assert.equal(result.arms.B.failed, 1);
  assert.equal(result.arms.B.budget_overruns, 1);
  assert.equal(result.arms.B.penalized_time_total_ms, 1800000);
  assert.throws(() => summarizeRuns([receipt({metrics: {...missed, iou: NaN}})]), /invalid_metric_iou/);
  assert.throws(() => summarizeRuns([receipt({metrics: {...missed, tp: 100}})]), /invalid_metric_tp/);
});
