import {readFile, writeFile, rename} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertFrozenStudy, createSchedule, hashCanonical, scoreDiagnostic} from './contract.mjs';

const ARMS = ['A', 'B', 'C'];
const COMPARISONS = [['B', 'A'], ['C', 'A'], ['B', 'C']];
const TIME_FIELDS = ['server_total', 'client_round_trip', 'provider_http', 'penalized_server_total'];
const fail = reason => {throw new Error(reason);};
const check = (condition, reason) => {if (!condition) fail(reason);};
const number = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const sum = values => values.reduce((total, value) => total + value, 0);
const percent = (value, count) => count ? 100 * value / count : null;
const median = values => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b), middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const divide = (candidate, baseline) => number(candidate) && number(baseline) && baseline > 0 ? candidate / baseline : null;
const slotKey = value => `${value.case_id}:${value.arm}:${value.repeat}`;

function timingSummary(values, expected) {
  const observed = values.filter(number);
  return {observations: observed.length, expected_observations: expected,
    complete: observed.length === expected, median_ms: median(observed),
    total_ms: observed.length ? sum(observed) : null};
}

function qualitySummary(rows) {
  const count = key => sum(rows.map(row => row.metrics?.[key] ?? 0));
  const conclusive = rows.filter(row => row.expected.sufficient_evidence !== false);
  const positives = conclusive.filter(row => row.expected.presence === true);
  const negatives = conclusive.filter(row => row.expected.presence === false);
  const uncertain = rows.filter(row => row.expected.sufficient_evidence === false);
  const localized = positives.filter(row => row.expected.box);
  // Failure to return an answer gets zero unconditional localization credit.
  const ious = localized.map(row => row.metrics?.iou ?? 0);
  const conditional = rows.map(row => row.metrics?.conditional_iou).filter(number);
  const completed = rows.filter(row => row.status === 'completed').length;
  const tp = count('tp'), fp = count('fp'), fn = count('fn'), tn = count('tn');
  return {
    slots: rows.length, completed, completed_pct: percent(completed, rows.length),
    presence_accuracy_pct: percent(tp + tn, conclusive.length),
    decision_accuracy_pct: percent(count('correct'), rows.length),
    accepted_with_category: rows.filter(row => row.accepted).length,
    accepted_with_category_pct: percent(rows.filter(row => row.accepted).length, rows.length),
    category_accuracy_on_positive_truth_pct: percent(count('category_correct'), positives.length),
    positive_truth_slots: positives.length, negative_truth_slots: negatives.length,
    insufficient_evidence_truth_slots: uncertain.length,
    tp, fp, tn, fn, precision: tp + fp ? tp / (tp + fp) : null,
    recall: tp + fn ? tp / (tp + fn) : null,
    false_alarm_pct: percent(fp, negatives.length), omission_pct: percent(fn, positives.length),
    failed_outputs_on_positive_truth: positives.filter(row => row.status !== 'completed').length,
    abstentions: count('abstentions'), abstention_pct: percent(count('abstentions'), rows.length),
    inappropriate_abstentions: count('inappropriate_abstentions'),
    required_abstention_accuracy_pct: percent(count('correct_abstentions'), uncertain.length),
    evidence_violations: count('evidence_violations'), critical_misses: count('critical_misses'),
    mean_iou_positive_truth: ious.length ? sum(ious) / ious.length : null,
    median_iou_positive_truth: median(ious),
    localization_truth_slots: localized.length,
    conditional_mean_iou: conditional.length ? sum(conditional) / conditional.length : null,
    conditional_localization_answers: conditional.length,
  };
}

function summarizeRows(rows) {
  return {repetitions: rows.length,
    status_counts: Object.fromEntries([...new Set(rows.map(row => row.status))].sort().map(status => [status, rows.filter(row => row.status === status).length])),
    quality: qualitySummary(rows),
    timing: Object.fromEntries(TIME_FIELDS.map(field => [field, timingSummary(rows.map(row => row.timing[field]), rows.length)]))};
}

function pairTiming(candidate, baseline) {
  return Object.fromEntries(TIME_FIELDS.map(field => {
    const a = candidate.timing[field], b = baseline.timing[field];
    const ratio = a.complete && b.complete ? divide(a.median_ms, b.median_ms) : null;
    return [field, {candidate_median_ms: a.median_ms, baseline_median_ms: b.median_ms,
      complete_pair: a.complete && b.complete, ratio, reduction_pct: ratio === null ? null : 100 * (1 - ratio)}];
  }));
}

function compareQuality(candidate, baseline) {
  const higher = ['completed_pct', 'presence_accuracy_pct', 'decision_accuracy_pct', 'accepted_with_category_pct',
    'category_accuracy_on_positive_truth_pct', 'required_abstention_accuracy_pct', 'mean_iou_positive_truth'];
  const lower = ['false_alarm_pct', 'omission_pct', 'inappropriate_abstentions', 'evidence_violations', 'critical_misses', 'failed_outputs_on_positive_truth'];
  const dimensions = [...higher.map(key => [key, 'higher']), ...lower.map(key => [key, 'lower'])].map(([key, direction]) => {
    const a = candidate[key], b = baseline[key];
    const applicable = a !== null || b !== null;
    const comparable = a !== null && b !== null;
    const noWorse = comparable ? direction === 'higher' ? a + 1e-12 >= b : a <= b + 1e-12 : null;
    return {metric: key, direction, candidate: a, baseline: b,
      delta: comparable ? a - b : null, applicable, no_worse: noWorse};
  });
  return {dimensions, no_worse: dimensions.filter(row => row.applicable).every(row => row.no_worse === true)};
}

/** Descriptive analysis only. It cannot certify a building repair or statistical generalization. */
export function analyzeReport(report, {inputs, frozen, raw = []}) {
  check(report.coverage?.complete === true, 'incomplete_results_no_final_analysis');
  assertFrozenStudy(frozen, inputs);
  const cases = inputs.dataset.manifest.cases.map(item => ({...item, defect_family: inputs.dataset.truth[item.case_id]?.family ?? item.case_id}));
  const schedule = createSchedule({cases, arms: ARMS, repetitions: inputs.config.repetitions, seed: inputs.config.seed});
  check(hashCanonical(schedule) === inputs.config.schedule_sha256, 'analysis_schedule_changed');
  check(report.coverage.expected_slots === schedule.length && report.coverage.observed_slots === schedule.length
    && report.records?.length === schedule.length && report.live_records === schedule.length, 'analysis_coverage_mismatch');
  const expectedSlots = new Map(schedule.map(slot => [slotKey(slot), slot])), seen = new Set();
  const rawById = new Map();
  for (const entry of raw) {
    check(!rawById.has(entry.data?.run_id), 'analysis_duplicate_raw_receipt');
    rawById.set(entry.data?.run_id, entry);
  }
  let enriched = 0, recoveredClients = 0;
  const rows = report.records.map(run => {
    check(run.mode === 'live' && run.study_sha256 === frozen.sha256, 'analysis_record_study_mismatch');
    const key = slotKey(run), scheduled = expectedSlots.get(key);
    check(scheduled && !seen.has(key), 'analysis_unexpected_or_duplicate_slot');seen.add(key);
    check(run.id === `${run.case_id}--${run.arm}--${run.repeat - 1}`, 'analysis_run_id_mismatch');
    const truth = inputs.dataset.truth[run.case_id]?.expected ?? inputs.dataset.truth[run.case_id];
    check(hashCanonical(run.expected) === hashCanonical(truth), 'analysis_truth_changed');
    const metrics = run.status === 'completed' ? scoreDiagnostic({expected: truth, actual: run.actual}) : null;
    if (metrics) {
      check(hashCanonical(run.metrics) === hashCanonical(metrics), 'analysis_score_mismatch');
      const accepted = metrics.correct === 1 && (!truth.presence || metrics.category_correct === 1);
      check(run.accepted === accepted, 'analysis_acceptance_mismatch');
    } else check(run.accepted !== true, 'analysis_failed_output_accepted');
    const entry = rawById.get(run.id);
    let providerTime = null, recovered = false;
    if (entry) {
      const d = entry.data, receipt = d.provider_receipt ?? {};
      check(entry.study_sha256 === frozen.sha256 && slotKey(entry.slot) === key
        && d.manifest_sha256 === inputs.config.manifest_sha256 && d.case_id === run.case_id
        && d.arm === run.arm && d.repeat === run.repeat - 1
        && entry.mcp_response_sha256 === run.mcp_response_sha256
        && receipt.response_sha256 === run.output_sha256, 'analysis_raw_receipt_mismatch');
      const start = Date.parse(receipt.started_at), end = Date.parse(receipt.received_at);
      if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {providerTime = end - start;enriched++;}
      recovered = entry.recovered_after_transport_error === true;
      if (recovered) recoveredClients++;
    }
    const total = number(run.elapsed_ms) ? run.elapsed_ms : null;
    const penalized = run.status === 'blocked' ? null
      : run.status === 'completed' && run.accepted && total !== null && total <= inputs.config.timeout_ms
        ? total : inputs.config.timeout_ms;
    return {...run, expected: truth, metrics, timing: {
      server_total: total,
      // A status-recovery request is not the elapsed round trip of the original execution.
      client_round_trip: !recovered && number(run.client_elapsed_ms) ? run.client_elapsed_ms : null,
      provider_http: providerTime, penalized_server_total: penalized,
    }};
  });
  check(seen.size === expectedSlots.size, 'analysis_missing_slots');
  const byArm = Object.fromEntries(ARMS.map(arm => [arm, summarizeRows(rows.filter(row => row.arm === arm))]));
  const caseIds = [...new Set(schedule.map(slot => slot.case_id))].sort();
  const pairedCases = caseIds.map(caseId => {
    const caseRows = rows.filter(row => row.case_id === caseId);
    const arms = Object.fromEntries(ARMS.map(arm => [arm, summarizeRows(caseRows.filter(row => row.arm === arm))]));
    return {case_id: caseId, family: caseRows[0].defect_family, expected: caseRows[0].expected,
      arms, comparisons: Object.fromEntries(COMPARISONS.map(([candidate, baseline]) => [`${candidate}_vs_${baseline}`, pairTiming(arms[candidate], arms[baseline])]))};
  });
  const comparisons = Object.fromEntries(COMPARISONS.map(([candidate, baseline]) => {
    const label = `${candidate}_vs_${baseline}`;
    const pairedTiming = Object.fromEntries(TIME_FIELDS.map(field => {
      const pairs = pairedCases.map(row => row.comparisons[label][field]).filter(row => row.ratio !== null);
      const ratio = median(pairs.map(row => row.ratio));
      return [field, {paired_cases: pairs.length, expected_cases: caseIds.length,
        complete: pairs.length === caseIds.length, median_of_case_ratios: ratio,
        reduction_pct: ratio === null ? null : 100 * (1 - ratio),
        candidate_faster_cases: pairs.filter(row => row.ratio < 1).length,
        tied_cases: pairs.filter(row => row.ratio === 1).length}];
    }));
    const quality = compareQuality(byArm[candidate].quality, byArm[baseline].quality);
    const primary = pairedTiming.server_total;
    const speedMet = primary.complete && primary.reduction_pct !== null && primary.reduction_pct + 1e-12 >= 20;
    return [label, {candidate, baseline, paired_timing: pairedTiming, quality_comparison: quality,
      extension_gate: {minimum_time_reduction_pct: 20, primary_measure: 'median of paired case ratios of raw server total wall time',
        speed_met: speedMet, quality_no_worse_in_all_applicable_dimensions: quality.no_worse,
        descriptively_met: speedMet && quality.no_worse,
        interpretation: 'Eligibility for another controlled diagnostic test only; not approval to deploy or evidence of repair speed.'}}];
  }));
  return {schema_version: 1, study_sha256: frozen.sha256, generated_at: new Date().toISOString(),
    source_results_sha256: hashCanonical(report), coverage: report.coverage,
    units: {case_variants: caseIds.length, repetitions_per_case_arm: inputs.config.repetitions,
      microzone_families: [...new Set(rows.map(row => row.defect_family))], independent_buildings: null},
    measurement: {total_budget_ms: inputs.config.timeout_ms, provider_http_observations: enriched,
      recovered_client_times_excluded: recoveredClients, model_only_time_ms: null,
      ratios: 'candidate / baseline; a ratio of 0.8 means 20% less wall time',
      primary_time: 'Server slot wall time including image download, provider request and normalization; excludes manifest load.',
      provider_time: 'Provider HTTP wall time from recorded timestamps, including network and response-body transfer; not model-only inference.',
      penalized_time: 'Accepted within budget: observed server time; failed or unaccepted output: frozen total budget.',
      quality: 'Presence and category acceptance are separate; acceptance does not require a minimum IoU. Output failures stay in slot-based accuracy denominators; unconditional IoU assigns them zero.'},
    by_arm: byArm, paired_cases: pairedCases, comparisons,
    limitations: ['One microzone/family with engineered variants; repetitions and views are not independent buildings.',
      'No confidence intervals, significance tests or generalization claim.',
      'This is visual diagnosis. No repair loop or 30-minute building-correction experiment was performed.',
      'A/B compares the whole method and provider; B/C is the structured-provider comparison, still including their different output normalization.',
      'Quality no worse is an observed descriptive comparison, not a statistical non-inferiority result.'],
  };
}

async function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const out = resolve(process.env.AMALAYA_PILOT_OUTPUT || resolve(root, 'tmp/jev-pilot'));
  const json = async name => JSON.parse(await readFile(resolve(out, name), 'utf8'));
  const report = await json('results.json');
  check(report.coverage?.complete === true, 'incomplete_results_no_final_analysis');
  const [inputs, frozen] = await Promise.all([json('inputs.json'), json('freeze.json')]);
  let raw = [];
  try {raw = (await readFile(resolve(out, 'raw.jsonl'), 'utf8')).split('\n').filter(Boolean).map(JSON.parse);}
  catch (error) {if (error.code !== 'ENOENT') throw error;}
  const analysis = analyzeReport(report, {inputs, frozen, raw});
  const temporary = resolve(out, 'analysis.json.tmp');
  await writeFile(temporary, JSON.stringify(analysis, null, 2) + '\n');
  await rename(temporary, resolve(out, 'analysis.json'));
  console.log(JSON.stringify({study_sha256: analysis.study_sha256, coverage: analysis.coverage,
    comparisons: Object.fromEntries(Object.entries(analysis.comparisons).map(([key, value]) => [key, value.extension_gate]))}, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
