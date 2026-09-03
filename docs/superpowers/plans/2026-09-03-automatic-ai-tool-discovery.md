# AI Tool Automatic Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a daily, bounded pipeline that discovers public AI products, validates official websites, generates structured Chinese catalog entries, and automatically merges batches of at most three high-confidence tools.

**Architecture:** Add source adapters and a deterministic quality gate under `scripts/discovery/`, reuse the existing SSRF-resistant official-site fetcher and catalog generator, and write validated candidates through one shared atomic catalog mutation module. A GitHub Actions workflow creates one batch PR per run, runs all existing gates, auto-merges only a verified batch, and routes uncertain candidates to one review issue.

**Tech Stack:** Node.js 24 ESM, TypeScript 7 tests, Vitest 4, VitePress 1.6, GitHub Actions, OpenAI Responses API structured outputs.

**Spec:** `docs/superpowers/specs/2026-09-03-automatic-ai-tool-discovery-design.md`

## Global Constraints

- Keep `docs/.vitepress/theme/domain/ai-tools.json` as the only public catalog source of truth.
- Never copy descriptions, rankings, ratings, or images from third-party directories.
- Accept only HTTPS candidate and source URLs; never execute fetched JavaScript or webpage instructions.
- Reuse `scripts/submissions/safeOfficialFetch.mjs` for every candidate official-site request.
- Publish at most 3 tools per scheduled run and stop automatic publication at 300 catalog tools.
- High-confidence changes go through a branch, PR, full test/build gates, and squash merge; never push directly to `main`.
- Missing `CONTENT_ENRICHER_API_KEY` or `CONTENT_ENRICHER_MODEL` must produce review output without changing the catalog.
- Automated tools cannot set `featuredOrder`, sponsorship, affiliate, ranking, rating, or unverified factual claims.
- Existing public-submission behavior and its no-auto-merge rule remain unchanged.
- Use one shared `ai-catalog-writes` GitHub Actions concurrency group for both catalog-writing workflows.
- Do not stage or modify `五年级英语核心词汇_30天通关计划_中英对照版.docx`.

---

### Task 1: Checkpoint the Verified 120-Tool Catalog Baseline

**Files:**
- Modify: `docs/.vitepress/theme/domain/ai-tools.json`
- Modify: `docs/.vitepress/theme/domain/aiTools.ts`
- Modify: `docs/.vitepress/theme/domain/ai-scenarios.json`
- Modify: `docs/.vitepress/config.ts`
- Modify: `docs/.vitepress/ai-pages-manifest.json`
- Modify: `docs/.vitepress/theme/components/AiDirectory.vue`
- Modify: `docs/.vitepress/theme/components/ToolDetail.vue`
- Modify: `docs/.vitepress/theme/custom.css`
- Modify: `scripts/generate-ai-pages.mjs`
- Modify: `scripts/submissions/curateToolSubmission.mjs`
- Modify: `scripts/verify-ai-build.mjs`
- Modify: `tests/aiPageGeneration.test.ts`
- Modify: `tests/aiTools.test.ts`
- Modify: `tests/curateToolSubmission.test.ts`
- Modify: `tests/directoryComponents.test.ts`
- Generated: `docs/tools/*.md`
- Generated: `docs/ai-categories/*.md`
- Generated: `docs/ai-scenarios/*.md`

**Interfaces:**
- Consumes: Current working-tree catalog expansion already validated in the prior session.
- Produces: A clean Git checkpoint containing exactly 120 catalog records and all generated pages, independent of the discovery subsystem.

- [ ] **Step 1: Re-run the catalog-focused tests**

Run:

```powershell
npx vitest run tests/aiTools.test.ts tests/aiPageGeneration.test.ts tests/curateToolSubmission.test.ts tests/directoryComponents.test.ts
```

Expected: all selected tests pass and the catalog count assertion reports 120 tools.

- [ ] **Step 2: Rebuild and verify the generated site**

Run:

```powershell
npm run verify:build
git diff --check
```

Expected: VitePress build and `verify-ai-build.mjs` pass; `git diff --check` prints no errors.

- [ ] **Step 3: Confirm only expected files are staged**

Run:

```powershell
git add -- docs/.vitepress/ai-pages-manifest.json docs/.vitepress/config.ts docs/.vitepress/theme/components/AiDirectory.vue docs/.vitepress/theme/components/ToolDetail.vue docs/.vitepress/theme/custom.css docs/.vitepress/theme/domain/ai-tools.json docs/.vitepress/theme/domain/aiTools.ts docs/.vitepress/theme/domain/ai-scenarios.json docs/ai-categories docs/ai-scenarios docs/tools scripts/generate-ai-pages.mjs scripts/submissions/curateToolSubmission.mjs scripts/verify-ai-build.mjs tests/aiPageGeneration.test.ts tests/aiTools.test.ts tests/curateToolSubmission.test.ts tests/directoryComponents.test.ts
git status --short
```

Expected: the Word document remains untracked and is not present in `git diff --cached --name-only`.

- [ ] **Step 4: Commit the catalog baseline**

Run:

```powershell
git commit -m "feat: expand AI catalog to 120 tools"
```

Expected: one commit containing only the catalog, presentation, generator, tests, and generated pages listed above.

---

### Task 2: Shared Atomic Catalog Mutation Module

**Files:**
- Create: `scripts/catalog/catalogMutation.mjs`
- Modify: `scripts/submissions/curateToolSubmission.mjs`
- Create: `tests/catalogMutation.test.ts`
- Test: `tests/curateToolSubmission.test.ts`

**Interfaces:**
- Consumes: `generateAiPages(options)` and `validateTools(items)` from `scripts/generate-ai-pages.mjs`.
- Produces: `loadCatalog({ projectRoot, catalogPath })`, `domainKey(url)`, `dateOnly(value)`, `alternativesFor(tools, category, slug)`, and `appendCatalogTools({ context, tools })`.

- [ ] **Step 1: Write failing tests for shared catalog loading and batch mutation**

Add tests with this behavior:

```ts
import {
  alternativesFor,
  appendCatalogTools,
  domainKey,
  loadCatalog
} from '../scripts/catalog/catalogMutation.mjs'

it('normalizes www domains and selects two deterministic same-category alternatives', () => {
  expect(domainKey('https://www.Example.com/product')).toBe('example.com')
  expect(alternativesFor([
    { slug: 'alpha', category: 'chat' },
    { slug: 'beta', category: 'chat' },
    { slug: 'gamma', category: 'writing' }
  ], 'chat', 'new-tool')).toEqual(['alpha', 'beta'])
})

it('atomically appends a valid batch and restores the original catalog on generation failure', () => {
  const context = loadCatalog({ projectRoot, catalogPath })
  const before = readFileSync(catalogPath, 'utf8')
  expect(() => appendCatalogTools({
    context,
    tools: [validTool, { ...validTool, slug: 'broken duplicate' }]
  })).toThrow('catalog_validation_failed')
  expect(readFileSync(catalogPath, 'utf8')).toBe(before)
})
```

- [ ] **Step 2: Run the focused test and verify the missing-module failure**

Run:

```powershell
npx vitest run tests/catalogMutation.test.ts
```

Expected: FAIL because `scripts/catalog/catalogMutation.mjs` does not exist.

- [ ] **Step 3: Implement the shared mutation module**

Implement these exact exports:

```js
export function domainKey(value) {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function dateOnly(value) {
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) throw catalogError()
  return parsed.toISOString().slice(0, 10)
}

export function alternativesFor(tools, category, slug) {
  const matches = tools
    .filter((tool) => tool.category === category && tool.slug !== slug)
    .map((tool) => tool.slug)
    .slice(0, 2)
  if (matches.length !== 2) throw catalogError()
  return matches
}

export function loadCatalog({ projectRoot, catalogPath }) {
  const paths = catalogPaths(projectRoot, catalogPath)
  try {
    const tools = validateTools(JSON.parse(readFileSync(paths.catalog, 'utf8')))
    return Object.freeze({
      ...paths,
      scenarioPath: join(paths.domainRoot, 'ai-scenarios.json'),
      tools: Object.freeze([...tools])
    })
  } catch (error) {
    if (error?.code === 'catalog_validation_failed') throw error
    throw catalogError()
  }
}

export function appendCatalogTools({ context, tools }) {
  if (!Array.isArray(tools) || tools.length === 0) throw catalogError()
  const candidate = [...context.tools, ...tools]
  validateTools(candidate)
  validateCandidateInTemporaryProject(candidate, context.scenarioPath)
  replaceCatalogAndGenerate(candidate, context)
  return Object.freeze(candidate)
}
```

Move the already-tested path containment, temporary validation, backup, restore, and generation code from `curateToolSubmission.mjs` into this module without loosening checks.

- [ ] **Step 4: Refactor submission curation to use the shared module**

Replace its private catalog helpers with:

```js
const context = loadCatalog({
  projectRoot: deps.projectRoot,
  catalogPath: deps.catalogPath
})
const alternatives = alternativesFor(context.tools, submission.category, draft.slug)
appendCatalogTools({ context, tools: [tool] })
```

Keep its `submission/<public-ref>-<slug>` branch name, human review PR body, status transitions, and no-auto-merge workflow unchanged.

- [ ] **Step 5: Run focused regression tests**

Run:

```powershell
npx vitest run tests/catalogMutation.test.ts tests/curateToolSubmission.test.ts
```

Expected: both suites pass, including atomic restoration and idempotency cases.

- [ ] **Step 6: Commit**

Run:

```powershell
git add scripts/catalog/catalogMutation.mjs scripts/submissions/curateToolSubmission.mjs tests/catalogMutation.test.ts tests/curateToolSubmission.test.ts
git commit -m "refactor: share atomic AI catalog mutation"
```

---

### Task 3: Discovery Contracts, Configuration, and State

**Files:**
- Create: `config/ai-discovery-sources.json`
- Create: `scripts/discovery/contracts.mjs`
- Create: `scripts/discovery/state.mjs`
- Create: `tests/aiDiscoveryContracts.test.ts`

**Interfaces:**
- Produces: `parseDiscoveryConfig(value)`, `normalizeCandidate(value, source)`, `candidateKey(candidate)`, `parseDiscoveryState(value)`, `shouldCoolDown(state, key, now)`, and `recordOutcome(state, outcome)`.
- Candidate shape: `{ name, url, sourceId, sourceKind, discoveredAt, sourceScore }`.
- State outcome shape: `{ key, status, errorCode, processedAt, fingerprint }`.

- [ ] **Step 1: Write failing contract and state tests**

Use concrete cases:

```ts
it('accepts the three configured source kinds and rejects unknown keys', () => {
  expect(parseDiscoveryConfig(validConfig).sources.map(({ kind }) => kind)).toEqual([
    'github-search', 'hacker-news', 'feed'
  ])
  expect(() => parseDiscoveryConfig({
    ...validConfig,
    sources: [{ ...validConfig.sources[0], executable: 'curl bad.example' }]
  })).toThrow('invalid_discovery_config')
})

it('normalizes tracking parameters and produces a stable candidate key', () => {
  const candidate = normalizeCandidate({
    name: ' Example AI ',
    url: 'https://www.Example.com/?utm_source=feed#top'
  }, { id: 'feed-one', kind: 'feed', score: 40 }, new Date('2026-09-03T00:00:00Z'))
  expect(candidate.url).toBe('https://www.example.com/')
  expect(candidateKey(candidate)).toBe('example.com')
})

it('cools down three identical failures for exactly 30 days', () => {
  const state = parseDiscoveryState({ version: 1, outcomes: threeFailures })
  expect(shouldCoolDown(state, 'example.com', new Date('2026-09-20'))).toBe(true)
  expect(shouldCoolDown(state, 'example.com', new Date('2026-10-04'))).toBe(false)
})
```

- [ ] **Step 2: Run the tests and verify they fail**

Run:

```powershell
npx vitest run tests/aiDiscoveryContracts.test.ts
```

Expected: FAIL with missing discovery modules.

- [ ] **Step 3: Add the strict source configuration**

Create a versioned configuration containing these bounded defaults:

```json
{
  "version": 1,
  "limits": {
    "sourceRecords": 50,
    "newDomains": 15,
    "publishPerRun": 3,
    "catalogMaximum": 300
  },
  "sources": [
    {
      "id": "github-ai-products",
      "kind": "github-search",
      "enabled": true,
      "query": "topic:ai-tool stars:>=200 archived:false",
      "minimumStars": 200,
      "score": 50
    },
    {
      "id": "show-hn-ai",
      "kind": "hacker-news",
      "enabled": true,
      "query": "Show HN AI",
      "minimumPoints": 20,
      "lookbackDays": 30,
      "score": 40
    }
  ]
}
```

The `feed` adapter remains available for explicitly configured fixed HTTPS feeds; no third-party directory feed is enabled by default.

- [ ] **Step 4: Implement exact-key parsing and immutable normalized records**

The parser must reject unknown top-level, limits, and source keys; unknown kinds; duplicate IDs; non-HTTPS feed URLs; limits above the design caps; unsafe names; and source records without a usable product URL.

`normalizeCandidate` must remove `utm_*`, `ref`, `source`, `fbclid`, and fragments, lowercase the host, reject credentials and nonstandard ports, and freeze the returned record.

- [ ] **Step 5: Implement bounded state history**

Keep only the newest 500 outcomes, never store webpage text, and count consecutive failures only when the candidate fingerprint is unchanged. `published` and `review` outcomes replace older outcomes for the same key rather than growing without bound.

- [ ] **Step 6: Run tests and commit**

Run:

```powershell
npx vitest run tests/aiDiscoveryContracts.test.ts
git add config/ai-discovery-sources.json scripts/discovery/contracts.mjs scripts/discovery/state.mjs tests/aiDiscoveryContracts.test.ts
git commit -m "feat: define AI discovery contracts"
```

Expected: tests pass and the commit contains no fetched content or state artifact.

---

### Task 4: Bounded Public Source Adapters

**Files:**
- Create: `scripts/discovery/sourceFetch.mjs`
- Create: `scripts/discovery/sources.mjs`
- Create: `tests/aiDiscoverySources.test.ts`

**Interfaces:**
- Consumes: parsed source config and `normalizeCandidate` from Task 3.
- Produces: `fetchBoundedSource(url, options)`, `discoverFromGitHub(source, deps)`, `discoverFromHackerNews(source, deps)`, `discoverFromFeed(source, deps)`, and `discoverFromSources(config, deps)`.

- [ ] **Step 1: Write failing bounded-fetch tests**

Cover exact behavior:

```ts
it('rejects redirects, non-HTTPS URLs, oversized bodies, and unexpected content types', async () => {
  await expect(fetchBoundedSource('http://api.example/data', deps)).rejects.toThrow('source_rejected')
  await expect(fetchBoundedSource('https://api.example/redirect', redirectDeps)).rejects.toThrow('source_rejected')
  await expect(fetchBoundedSource('https://api.example/large', oversizedDeps)).rejects.toThrow('source_rejected')
  await expect(fetchBoundedSource('https://api.example/image', imageDeps)).rejects.toThrow('source_rejected')
})
```

Assert a 10-second total timeout, 1 MiB body limit, `redirect: 'error'`, and accepted content types limited to JSON, RSS, Atom, XML, and UTF-8 text.

- [ ] **Step 2: Write failing adapter tests with local response doubles**

Use fixtures that prove:

```ts
expect(await discoverFromGitHub(githubSource, deps)).toEqual([
  expect.objectContaining({ name: 'Useful AI', url: 'https://useful.example/', sourceScore: 50 })
])
expect(await discoverFromHackerNews(hnSource, deps)).toHaveLength(1)
expect(await discoverFromFeed(jsonFeedSource, deps)).toHaveLength(1)
expect(await discoverFromFeed(atomSource, deps)).toHaveLength(1)
expect(await discoverFromFeed(rssSource, deps)).toHaveLength(1)
```

GitHub results must require `stargazers_count >= minimumStars`, `archived === false`, and a public HTTPS `homepage`. HN results must require the configured points, time window, `Show HN` title, and an external HTTPS URL.

- [ ] **Step 3: Run tests and verify the missing implementations fail**

Run:

```powershell
npx vitest run tests/aiDiscoverySources.test.ts
```

Expected: FAIL because the source modules are absent.

- [ ] **Step 4: Implement the bounded transport and adapters**

Use dependency-injected `fetch`, `now`, and logger values. Return a finite `source_unavailable`, `source_invalid`, or `source_rejected` error code without including response bodies. Parse JSON Feed through `JSON.parse`; parse only bounded `<item>`/`<entry>`, `<title>`, and `<link>` elements for RSS/Atom and decode XML entities without executing markup.

The aggregate function must isolate failures:

```js
export async function discoverFromSources(config, deps) {
  const candidates = []
  const errors = []
  for (const source of config.sources.filter(({ enabled }) => enabled)) {
    try {
      candidates.push(...await adapterFor(source.kind)(source, deps))
    } catch (error) {
      errors.push({ sourceId: source.id, errorCode: publicSourceError(error) })
    }
    if (candidates.length >= config.limits.sourceRecords) break
  }
  return Object.freeze({
    candidates: Object.freeze(candidates.slice(0, config.limits.sourceRecords)),
    errors: Object.freeze(errors)
  })
}
```

- [ ] **Step 5: Run tests and commit**

Run:

```powershell
npx vitest run tests/aiDiscoverySources.test.ts tests/aiDiscoveryContracts.test.ts
git add scripts/discovery/sourceFetch.mjs scripts/discovery/sources.mjs tests/aiDiscoverySources.test.ts
git commit -m "feat: discover tools from bounded public sources"
```

---

### Task 5: Deterministic Quality Gate and Structured Discovery Enrichment

**Files:**
- Create: `scripts/discovery/qualityGate.mjs`
- Create: `scripts/discovery/discoveryDraft.mjs`
- Create: `scripts/discovery/discoveryEnricher.mjs`
- Create: `tests/aiDiscoveryQuality.test.ts`
- Create: `tests/aiDiscoveryEnricher.test.ts`

**Interfaces:**
- Consumes: catalog records, normalized candidates, official evidence from `safeFetchOfficialPage`, and the existing content enums.
- Produces: `catalogDiscoveryIndex(tools)`, `evaluateCandidate(candidate, evidence, index)`, `scoreCandidate(candidate, evidence, index, draft)`, `parseDiscoveryDraft(value)`, and `createDiscoveryEnricher(config)`.
- Discovery draft includes every `AiTool` field except `url`, `addedAt`, `updatedAt`, `alternatives`, and `featuredOrder`.

- [ ] **Step 1: Write failing hard-gate tests**

Include these cases:

```ts
it.each([
  ['duplicate domain', candidate, evidence, catalogWithSameDomain, 'duplicate_catalog_entry'],
  ['thin landing page', candidate, { ...evidence, visibleText: 'AI' }, catalog, 'insufficient_official_evidence'],
  ['parked domain', candidate, { ...evidence, title: 'Domain for sale' }, catalog, 'non_product_page'],
  ['prohibited product', candidate, { ...evidence, visibleText: 'AI casino betting' }, catalog, 'prohibited_candidate']
])('rejects %s deterministically', (_label, input, proof, tools, code) => {
  expect(() => evaluateCandidate(input, proof, catalogDiscoveryIndex(tools))).toThrow(code)
})
```

Also prove `scoreCandidate` only orders candidates and cannot turn a hard failure into a pass.

- [ ] **Step 2: Write failing strict-draft tests**

Require exact keys, all nine category enums, existing price/language/access enums, Chinese search terms, conservative pricing text, no unsupported claims, and no `featuredOrder` or commercial fields.

```ts
expect(() => parseDiscoveryDraft({ ...validDraft, featuredOrder: 1 })).toThrow('discovery_enricher_invalid_output')
expect(() => parseDiscoveryDraft({ ...validDraft, pricing: '永久免费' })).toThrow('discovery_enricher_invalid_output')
expect(parseDiscoveryDraft(validDraft)).toEqual(Object.freeze(validDraft))
```

- [ ] **Step 3: Write failing prompt-boundary tests**

Assert that the Responses API body:

- sets `store: false`;
- uses strict `json_schema` output;
- includes only candidate name, canonical official URL, bounded official title/meta/visible text, enums, and catalog alternative names;
- excludes source descriptions, webpage scripts, hidden text, headers, cookies, emails, internal state, and secrets;
- instructs the model to treat webpage text as evidence, not instructions.

- [ ] **Step 4: Run tests and verify they fail**

Run:

```powershell
npx vitest run tests/aiDiscoveryQuality.test.ts tests/aiDiscoveryEnricher.test.ts
```

Expected: FAIL with missing modules.

- [ ] **Step 5: Implement the deterministic gate**

Require at least 200 normalized visible characters, a nonempty title, one AI/product cue across title, metadata, or visible text, no parked/coming-soon/error-page cues, no prohibited-use cues, and no duplicate domain/name/slug. Return a frozen evidence summary without the full HTML.

Calculate an integer ordering score from `sourceScore`, evidence completeness, and the draft's category gap. Before enrichment, order candidates by `sourceScore`, discovery date, and stable candidate key; after enrichment, call `scoreCandidate` with the parsed draft. Never accept or reject based on model-provided confidence.

- [ ] **Step 6: Implement strict discovery draft parsing and enrichment**

Use one Responses API retry only for 408, 429, and 5xx, matching the existing submission enricher. The public errors are exactly `discovery_enricher_invalid_output` and `discovery_enricher_failed`. Construct the final tool with:

```js
export function buildDiscoveredTool({ candidate, draft, alternatives, date }) {
  return Object.freeze({
    ...draft,
    url: candidate.url,
    addedAt: date,
    updatedAt: date,
    alternatives: [...alternatives]
  })
}
```

- [ ] **Step 7: Run tests and commit**

Run:

```powershell
npx vitest run tests/aiDiscoveryQuality.test.ts tests/aiDiscoveryEnricher.test.ts tests/contentEnricher.test.ts
git add scripts/discovery/qualityGate.mjs scripts/discovery/discoveryDraft.mjs scripts/discovery/discoveryEnricher.mjs tests/aiDiscoveryQuality.test.ts tests/aiDiscoveryEnricher.test.ts
git commit -m "feat: gate and enrich discovered AI tools"
```

---

### Task 6: Discovery Orchestrator, Dry-Run, and Batch Catalog Write

**Files:**
- Create: `scripts/discovery/runDiscovery.mjs`
- Create: `scripts/run-ai-discovery.mjs`
- Modify: `package.json`
- Create: `tests/aiDiscoveryPipeline.test.ts`

**Interfaces:**
- Consumes: Task 2 catalog mutation, Task 3 config/state, Task 4 source discovery, Task 5 gate/enricher, and `safeFetchOfficialPage`.
- Produces: `runDiscovery(options)` and CLI outputs `has_changes`, `slugs`, `branch`, `pr_title`, `pr_body`, `review_path`, `state_path`, and `changed_urls_path`.

- [ ] **Step 1: Write a failing end-to-end pipeline test with dependency doubles**

Use three candidates: one valid, one duplicate, and one thin page. Assert:

```ts
const result = await runDiscovery({
  config,
  state: emptyState,
  catalogPath,
  projectRoot,
  discoverFromSources: vi.fn(async () => ({ candidates, errors: [] })),
  fetchOfficialPage,
  enricher,
  dryRun: false,
  now: () => new Date('2026-09-03T00:00:00Z')
})

expect(result.published.map(({ slug }) => slug)).toEqual(['useful-ai'])
expect(result.review.map(({ errorCode }) => errorCode)).toEqual([
  'duplicate_catalog_entry', 'insufficient_official_evidence'
])
expect(JSON.parse(readFileSync(catalogPath, 'utf8'))).toHaveLength(121)
```

Add a dry-run assertion that the same inputs produce candidate and review reports while leaving the catalog byte-for-byte unchanged.

- [ ] **Step 2: Add limit, idempotency, and missing-enricher tests**

Prove that:

- only the first 15 new domains are fetched;
- at most 3 valid candidates are written;
- a 300-tool catalog writes none;
- a previously published key is skipped;
- three unchanged failures are cooled down;
- a missing enricher creates review items with `enricher_unconfigured` and does not write;
- a failed batch mutation leaves the catalog unchanged.

- [ ] **Step 3: Run tests and verify they fail**

Run:

```powershell
npx vitest run tests/aiDiscoveryPipeline.test.ts
```

Expected: FAIL with missing orchestrator.

- [ ] **Step 4: Implement the orchestrator**

Use this order exactly:

```js
const sourceResult = await deps.discoverFromSources(config, deps)
const unique = dedupeAndSort(sourceResult.candidates, catalog, state)
const inspected = await inspectAtMost(unique, config.limits.newDomains)
const accepted = await enrichAtMost(inspected, remainingPublicationSlots)
if (!dryRun && accepted.length) appendCatalogTools({ context, tools: accepted })
return freezeResult({ sourceResult, accepted, review, nextState })
```

Process candidates sequentially to respect rate limits and make output deterministic. Catch only known finite error codes per candidate; programming and catalog write errors fail the whole run.

- [ ] **Step 5: Implement reports and safe GitHub outputs**

`run-ai-discovery.mjs` must write:

- `ai-discovery-state.json` with bounded state;
- `ai-discovery-review.md` only when review items exist;
- `discovered-urls.txt` with one newly generated canonical page URL per line;
- multiline GitHub outputs using a random delimiter, never shell interpolation.

The PR body lists each published name, official URL, source ID, deterministic gate result, and verification checklist. It contains no webpage body or model response.

- [ ] **Step 6: Add the package command**

Modify `package.json`:

```json
"tools:discover": "node scripts/run-ai-discovery.mjs"
```

Support:

```text
npm run tools:discover -- --config config/ai-discovery-sources.json --state .baseline/ai-discovery-state.json --output ai-discovery-state.json --review ai-discovery-review.md --urls discovered-urls.txt --dry-run
```

Reject unknown CLI flags and paths outside the repository output allowlist.

- [ ] **Step 7: Run focused and full tests**

Run:

```powershell
npx vitest run tests/aiDiscoveryPipeline.test.ts tests/catalogMutation.test.ts tests/curateToolSubmission.test.ts
npm test
```

Expected: all suites pass and no real network requests occur in tests.

- [ ] **Step 8: Commit**

Run:

```powershell
git add scripts/discovery/runDiscovery.mjs scripts/run-ai-discovery.mjs tests/aiDiscoveryPipeline.test.ts package.json
git commit -m "feat: add automatic AI discovery pipeline"
```

---

### Task 7: Trusted Daily Workflow and Review Issue

**Files:**
- Create: `.github/workflows/discover-ai-tools.yml`
- Modify: `.github/workflows/curate-tool-submission.yml`
- Create: `tests/aiDiscoveryWorkflow.test.ts`

**Interfaces:**
- Consumes: `npm run tools:discover`, CLI outputs from Task 6, existing test/build commands, and existing `npm run search:notify`.
- Produces: daily batch PR, optional squash merge, bounded state artifact, one review issue, and optional index notifications.

- [ ] **Step 1: Write failing workflow contract tests**

Assert exact safety properties:

```ts
expect(workflow).toContain("cron: '47 1 * * *'")
expect(workflow).toContain('group: ai-catalog-writes')
expect(submissionWorkflow).toContain('group: ai-catalog-writes')
expect(workflow).toContain('npm run tools:discover')
expect(workflow).toContain('npm test')
expect(workflow).toContain('npm run verify:build')
expect(workflow).toContain('git diff --check')
expect(workflow).toContain('gh pr create')
expect(workflow).toContain('gh pr merge "$pr_url" --squash --delete-branch')
expect(workflow).not.toMatch(/push[^\n]*\bmain\b/)
expect(workflow).not.toContain('pull_request_target')
expect(workflow).not.toMatch(/curl[^\n]*\$\{\{.*candidate/i)
```

Also require checkout, setup-node, and upload-artifact actions to use full commit SHAs.

- [ ] **Step 2: Run the test and verify it fails**

Run:

```powershell
npx vitest run tests/aiDiscoveryWorkflow.test.ts
```

Expected: FAIL because the workflow does not exist and the submission workflow uses its old concurrency group.

- [ ] **Step 3: Create the daily workflow**

Implement jobs in this order:

1. Checkout trusted `main` with full history.
2. Set up Node 24 and run `npm ci`.
3. Download the latest successful `ai-discovery-state` artifact when available.
4. Run the discovery CLI with the configured 3-tool cap.
5. If changed, run `npm test`, `npm run verify:build`, and `git diff --check`.
6. Create or reuse `discovery/<date>-<run-id>` without force-push.
7. Create one batch PR, verify its changed paths, squash merge it, and delete its branch.
8. Create or comment on the single `AI 工具自动发现审核` issue from the review file.
9. Upload the current state and review files as a 90-day artifact even when no tool is published.
10. If index secrets are configured and URLs were added, call `npm run search:notify` with the built sitemap and exact changed URL allowlist; notification failure must not undo the merge.

Use `permissions: contents: write`, `pull-requests: write`, `issues: write`, and `actions: read`. Never place fetched values directly into shell commands; pass only validated CLI outputs through environment variables and validate branch names before Git operations.

- [ ] **Step 4: Share the catalog-write concurrency group**

Change the existing submission workflow from:

```yaml
concurrency:
  group: curate-tool-submission
```

to:

```yaml
concurrency:
  group: ai-catalog-writes
  cancel-in-progress: false
```

Do not add auto-merge to the submission workflow.

- [ ] **Step 5: Run workflow and submission regression tests**

Run:

```powershell
npx vitest run tests/aiDiscoveryWorkflow.test.ts tests/curateToolSubmission.test.ts
```

Expected: new workflow tests pass and the existing test still proves visitor submissions cannot auto-merge.

- [ ] **Step 6: Commit**

Run:

```powershell
git add .github/workflows/discover-ai-tools.yml .github/workflows/curate-tool-submission.yml tests/aiDiscoveryWorkflow.test.ts
git commit -m "ci: automate verified AI tool discovery"
```

---

### Task 8: Real Dry-Run, Documentation, and Final Verification

**Files:**
- Modify: `docs/cloudflare-submissions-setup.md`
- Runtime output only: `ai-discovery-state.json`
- Runtime output only: `ai-discovery-review.md`
- Runtime output only: `discovered-urls.txt`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: complete pipeline and workflow.
- Produces: operator instructions, a reviewed real-source dry-run report, and final verification evidence.

- [ ] **Step 1: Ignore local runtime artifacts**

Add exactly:

```gitignore
ai-discovery-state.json
ai-discovery-review.md
discovered-urls.txt
.baseline/
```

Keep GitHub artifacts available without committing runtime state to the public repository.

- [ ] **Step 2: Document setup and operations**

Add commands and explanations for:

```powershell
npm run tools:discover -- --config config/ai-discovery-sources.json --output ai-discovery-state.json --review ai-discovery-review.md --urls discovered-urls.txt --dry-run
```

Document the two required content-enricher secrets, optional index-notification secrets, the 3-per-day and 300-total limits, the review Issue, manual `workflow_dispatch`, rollback by reverting the squash commit, and the rule that the public submission workflow remains human-reviewed.

- [ ] **Step 3: Run a real-source dry-run without writing the catalog**

Run the command above with content enrichment disabled first.

Expected:

- GitHub and HN adapters return bounded candidates or finite source errors.
- `ai-tools.json` remains byte-for-byte unchanged.
- candidates requiring enrichment appear in `ai-discovery-review.md`.
- logs contain no response body, token, Authorization header, or model output.

- [ ] **Step 4: Inspect the real-source report**

Confirm every reported URL is HTTPS, no candidate duplicates an existing catalog domain, all source IDs are configured, and no third-party directory description appears in the report. Delete local runtime outputs after inspection only if they are no longer needed; they are ignored by Git.

- [ ] **Step 5: Run the complete verification suite**

Run:

```powershell
npm test
npm run verify:build
npm run typecheck:functions
git diff --check
```

Expected: all tests pass, VitePress production build succeeds, functions typecheck succeeds, and no whitespace errors remain.

- [ ] **Step 6: Review the branch diff**

Run:

```powershell
git status --short
git diff --stat 3de666d..HEAD
git diff --name-only 3de666d..HEAD
```

Expected: only catalog baseline, discovery implementation, workflow, tests, docs, and the approved design/plan are present. The Word document is absent from all commits.

- [ ] **Step 7: Commit operator documentation**

Run:

```powershell
git add .gitignore docs/cloudflare-submissions-setup.md
git commit -m "docs: explain automatic tool discovery"
```

- [ ] **Step 8: Perform completion verification**

Run the verification commands again after the final commit and record their exit codes and test counts in the task handoff. Do not claim the scheduled workflow is live until the branch containing it is pushed to GitHub and the required repository secrets are configured.
