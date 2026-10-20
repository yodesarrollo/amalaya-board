# Real sidewalk replay — 20 October 2026

Photo P10, south side of Obregón, number-21 frontage, Garmendia–Abasolo.
The actual current scene is reconstructed with its complete ordered refinements.
This is a different study and durable store from `amalaya-ebsw-visual-v1`.
No artificial defect was inserted.

`public/levantamiento/sidewalk-real-v1/study.json`, `truth.json` and `freeze.json`
were frozen before the first provider call. The published initial photo upload
was truncated; asset hashing blocked it before either provider was invoked.
The exact original photo bytes were republished without changing the manifest.
Its one blocked slot remains intact; logical surface/B/repetition1 uses physical
repetition2, recorded explicitly in `run.py`. Failed rollout and HTTP502 events
are preserved in the transport ledger; they are not model results.

Methods: A=GPT conventional per criterion, B=Jev atomic, C=independent GPT fallback
for90%, D=independent GPT fallback for95%. A/C/D use the same prompt, snapshot,
images and medium effort. The two thresholds share the same Jev output but use
separate actual GPT calls. They are paired routing counterfactuals, not two new
Jev experiments. Every result preserves HTTP receipts and input hashes.

The automatic route requires both confident evidence sufficiency and a confident
yes/no answer, plus a coherent category. Other cases require GPT. A Noul value
is an uncalibrated model score, not demonstrated accuracy. Unknown metric width,
height, accessibility and full-block continuity are explicitly scored unknown.

The timing endpoint is the diagnostic decision, including image fetch, API,
client pacing and fallback. It is NOT accepted 3D correction time. There is no
surveyed optical pose or verified metric anchor, so cross-image IoU and metric
claims are excluded. Corrections are an evidence-linked review record and
queue, not invented physical placements or a declaration of completion.

Run from repository root:

```bash
node scripts/sidewalk-real/export.mjs tmp/sidewalk-real-scene.json
python scripts/sidewalk-real/run.py preflight
python scripts/sidewalk-real/run.py
python scripts/sidewalk-real/analyze.py
```

The finite backend requires a private run token, configured in server storage.
The local runner reads its existing private task file outside the repository.
Do not copy provider keys or run tokens into this repository or the results.
Do not repeat a paid call to replace an unwanted result: the backend slots are
durable and idempotent. Rate rejections and failures remain in the ledger.

Nine correlated criteria in one frontage with two repetitions demonstrate this
case only. The reference labels were reviewed by ChatGPT against the photograph
and scene graph; this is not independent, blinded field truth.
