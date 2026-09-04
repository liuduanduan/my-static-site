# AI Discovery Residual Safety Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the four load-bearing findings that remained after the first final fix wave so automated discovery cannot publish Vue interpolation, unsupported sensitive claims, mismatched product identities, or false human-only provenance.

**Architecture:** Keep the existing discovery pipeline and protected auto-merge architecture. Strengthen the model-output boundary before public draft construction, add defense-in-depth escaping at generated Markdown sinks, make candidate identity matching token/domain aware, and correct the remaining public copy. Ambiguous content must fail closed into the existing bounded review path.

**Tech Stack:** Node.js 24 ESM, TypeScript 7 tests, Vitest 4, VitePress 1.6, OpenAI Responses structured outputs.

**Spec:** `docs/superpowers/specs/2026-09-03-automatic-ai-tool-discovery-design.md`

## Global Constraints

- Keep `docs/.vitepress/theme/domain/ai-tools.json` as the only public catalog source of truth.
- Preserve the existing high-confidence branch/PR/full-gate/squash-auto-merge path and the human-reviewed public-submission path.
- Treat every model field and official-page value as untrusted data; webpage or model content can never become an instruction or executable Vue/HTML/Markdown structure.
- Any ambiguous or unsupported model claim must produce a finite review outcome and must not change the catalog.
- Citation metadata is private validation state and must never enter the public `AiTool`, generated pages, state, review artifact, PR body, or logs.
- Preserve the 50 source-record, 15 new-domain, 3 publication, and 300 catalog limits.
- Never stage or modify `五年级英语核心词汇_30天通关计划_中英对照版.docx`.
- Do not push, merge, publish, trigger workflows, or notify indexes during implementation.

---

### Task 1: Close Vue Interpolation and Unsupported Sensitive-Claim Paths

**Files:**
- Modify: `scripts/discovery/discoveryDraft.mjs`
- Modify: `scripts/discovery/discoveryEnricher.mjs`
- Modify: `scripts/discovery/qualityGate.mjs`
- Modify: `scripts/generate-ai-pages.mjs`
- Test: `tests/aiDiscoveryEnricher.test.ts`
- Test: `tests/aiDiscoveryQuality.test.ts`
- Test: `tests/aiPageGeneration.test.ts`

**Interfaces:**
- Consumes: the strict grounded discovery response schema, accepted official evidence, and the existing public `AiTool` projection.
- Produces: a public draft that contains no executable Vue/HTML/Markdown structure and whose factual prose is conservatively tied to exact official evidence.

- [ ] **Step 1: Add failing Vue interpolation boundary tests**

Add tests proving:

```ts
expect(() => parseGroundedDiscoveryDraft(
  draftContaining('{{globalThis?.alert?.(1)}}'),
  acceptedEvidence
)).toThrow('discovery_enricher_invalid_output')
```

Cover ordinary and obfuscated Vue mustaches, triple braces, multiline interpolation, and directive/component-like structures. Add a generator regression that inserts a hostile manually curated string at each text/frontmatter/JSON-LD sink, builds the page, and proves the compiled output contains only inert literal text and no Vue expression or executable tag. Existing curated catalog generation must remain byte-stable.

- [ ] **Step 2: Run focused tests and confirm the current bypass**

Run:

```powershell
npx vitest run tests/aiDiscoveryEnricher.test.ts tests/aiPageGeneration.test.ts -t "Vue|mustache|interpolation|generated sink"
```

Expected: FAIL because `{{...}}` currently survives VitePress compilation as Vue interpolation.

- [ ] **Step 3: Implement a fail-closed model boundary and contextual sink defense**

Reject raw or Unicode-obfuscated Vue interpolation and Vue structural syntax in every model-authored string before normalization. Replace the ineffective backslash-brace handling at generated Markdown sinks with a VitePress-safe literal encoding or isolated text-rendering mechanism that is proven by the compiled-output regression. Keep frontmatter scalars and JSON-LD serialized with their own context-specific encoders.

- [ ] **Step 4: Add failing fabricated-claim tests**

Add adversarial cases where benign research evidence is paired with:

- `预测个人癌症风险` / `predicts personal cancer risk`;
- medical diagnosis, treatment, or individualized health advice;
- offensive malware, credential theft, impersonation, or deepfake generation;
- privacy, offline, ranking, user-count, funding, revenue, or price claims absent from the cited evidence;
- same-topic but different-action substitutions such as research → personal prediction.

Each must fail with a finite discovery review error before scoring/publication. Add positive controls for conservative evidence-supported descriptions.

- [ ] **Step 5: Implement comprehensive conservative grounding**

Every factual prose item must carry a bounded exact official-evidence citation. Runtime validation must:

- confirm the citation is an exact normalized substring of accepted official evidence;
- reject all sensitive/prohibited claim families in the completed draft when the product type is prohibited;
- require action, subject, qualifier, and numeric/promotion anchors from the public claim to be supported by the same citation rather than by unrelated page-wide text;
- reject low-overlap or semantically ambiguous paraphrases, including the exact cancer-risk bypass;
- preserve private citation provenance so look-alike plain objects cannot be scored and citation fields cannot be spread into public output.

It is acceptable for conservative validation to route more English-only or weakly grounded candidates to human review. It is not acceptable to guess or use model confidence as evidence.

- [ ] **Step 6: Run Task 1 verification**

Run:

```powershell
npx vitest run tests/aiDiscoveryEnricher.test.ts tests/aiDiscoveryQuality.test.ts tests/aiPageGeneration.test.ts tests/contentEnricher.test.ts
npm test
npm run verify:build
git diff --check
```

Expected: all tests/build checks pass; the hostile Vue/cancer-risk probes are rejected; generated catalog artifacts remain synchronized.

- [ ] **Step 7: Commit**

Commit only Task 1 code/tests with:

```text
fix: close automated content safety gaps
```

---

### Task 2: Make Product Identity and Public Provenance Unambiguous

**Files:**
- Modify: `scripts/discovery/qualityGate.mjs`
- Modify: `docs/about.md`
- Test: `tests/aiDiscoveryQuality.test.ts`
- Test: `tests/directoryComponents.test.ts` or the closest existing public-copy contract test

**Interfaces:**
- Consumes: normalized candidate name, accepted official title/URL/domain, and the existing verified-automation provenance language.
- Produces: fail-closed candidate/official identity matching and accurate public mixed-provenance copy.

- [ ] **Step 1: Add failing identity regressions**

Add tests proving these are rejected with `insufficient_official_evidence`:

```text
candidate: Pro AI
official title: Completely Different Product AI Platform
official domain: unrelated.example
```

```text
candidate: Alpha Research AI
official title: Completely Different Beta AI Platform
```

Also cover short/generic-only identities, substring collisions inside longer words, and unrelated domains. Add positive controls for punctuation, spacing, case, compact name variants, and a distinctive name supported by the registrable domain.

- [ ] **Step 2: Implement token/domain-aware identity matching**

Use normalized token or compact equality for distinctive product identity, not arbitrary substring containment. Generic words such as `AI`, `Pro`, `App`, `Tool`, `Research`, and `Platform` cannot establish identity alone. Short identities require exact token and registrable-domain support; ambiguous company/product relationships route to review.

- [ ] **Step 3: Add and fix the remaining provenance-copy contract**

Add a failing copy test for `docs/about.md`, then change the catalog-admission statement so it truthfully distinguishes:

- verified automatic discoveries that passed deterministic evidence, schema, build, and PR gates;
- visitor submissions that always require human review and never auto-merge.

Remove any blanket statement that every catalog entry is manually curated.

- [ ] **Step 4: Run Task 2 and full verification**

Run:

```powershell
npx vitest run tests/aiDiscoveryQuality.test.ts tests/directoryComponents.test.ts tests/submissionComponents.test.ts
npm test
npm run verify:build
npm run typecheck:functions
git diff --check
```

Then run a content-enrichment-disabled real dry-run only if Task 1 or Task 2 changed runtime source/orchestration behavior. If run, prove the catalog SHA-256 is byte-identical and inspect state/review/URL artifacts for secrets, bodies, model output, and executable markup.

- [ ] **Step 5: Review branch scope and commit**

Confirm the Word document is absent, generated files contain no unexplained churn, and commit Task 2 with:

```text
fix: verify discovery identity and provenance
```

---

### Task 3: Final Branch Review and Completion Evidence

**Files:**
- Runtime/report only: the SDD workspace for this plan

**Interfaces:**
- Consumes: Task 1 and Task 2 reviewed commits.
- Produces: one complete whole-branch review and fresh completion evidence.

- [ ] **Step 1: Generate a review package from the original branch fork point to HEAD**

- [ ] **Step 2: Dispatch a final reviewer with the four original residual findings and all rulings/deferred notes**

- [ ] **Step 3: If the review is clean, run fresh completion verification**

```powershell
npm test
npm run verify:build
npm run typecheck:functions
git diff --check
```

- [ ] **Step 4: Preserve the worktree and present integration choices**

Do not push, merge, or deploy without the user's separate integration choice.
