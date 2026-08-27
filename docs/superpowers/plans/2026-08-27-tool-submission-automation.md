# Tool Submission Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为寻器增加 Cloudflare 原生的工具提交、私密审核队列、自动生成收录 PR、透明商业合作基础与可选搜索引擎通知，同时保持现有静态目录可独立构建。

**Architecture:** VitePress 继续负责公开目录和 SEO；Cloudflare Pages Functions 接收提交，D1 保存私密审核状态。GitHub Action 定时领取一条申请，使用安全官网抓取器与可选 OpenAI Responses API 内容补全器生成符合现有 `AiTool` Schema 的草稿，通过全部验证后创建人工审核 PR；任何申请都不能自动合并或直接上线。

**Tech Stack:** VitePress 1.6、Vue 3、TypeScript、Vitest、Cloudflare Pages Functions、Cloudflare D1、Turnstile、Node.js 20、GitHub Actions、可选 OpenAI Responses API（HTTP 适配器）

**Spec:** `docs/superpowers/specs/2026-08-27-tool-submission-automation-design.md`

## Global Constraints

- `ai-tools.json` 继续是公开目录唯一事实源；D1 只保存申请、审核与商业活动数据。
- 自动化只创建 PR；不自动合并，不让未经审核的工具上线。
- 普通收录永久保留免费通道；加急意向只影响处理 SLA，不保证收录。
- “编辑精选”不可售卖；赞助和联盟活动不得修改 `featuredOrder`、自然搜索得分、分类计数或替代工具关系。
- 联系邮箱必须加密保存；邮箱、IP、查询码、Authorization、模型密钥和内部审核备注不得进入 Git、公开页面、URL 或日志。
- 只接受 HTTPS 官网；抓取器拒绝凭据、非标准端口、localhost、私网、链路本地地址和危险重定向。
- AI 只接收公开官网文本和非敏感提交字段；没有内容补全密钥或模型名时进入 `needs_enrichment`，不得生成模板垃圾内容。
- 不添加账号、评论、评分、虚假排名、会员或在线支付。
- 未配置 D1、Turnstile、OpenAI、IndexNow、百度或商业活动时，现有目录、搜索、生成和生产构建必须继续通过。
- 保留 `cultivation-archive` 分支；不得添加或修改无关 Word 文档。

---

## File map

### Shared contracts and catalog growth

- `shared/submissions/contracts.ts`: 公开申请、非敏感申请编号、状态、管理领取、商业活动、自动化错误和目录草稿的唯一 TypeScript 类型与枚举。
- `shared/submissions/validation.ts`: 不依赖浏览器或 Cloudflare 的纯验证、规范化和公开错误码。
- `shared/submissions/contentDraft.ts`: 把补全结果转换为无 `featuredOrder` 的 `AiTool` 候选项。
- `tests/submissionContracts.test.ts`: 共享契约、额外字段拒绝、长度和枚举测试。
- `tests/aiTools.test.ts`: 从固定 63 条改成保留 launch roster 且允许增长。
- `scripts/verify-ai-build.mjs`: 产物数量从目录事实源动态派生。
- `docs/public/social-card.svg`: 使用不随工具数量过期的“精选 AI 工具 · 9 大使用场景”。

### Cloudflare Functions and persistence

- `migrations/0001_tool_submissions.sql`: 申请、限流与索引表。
- `migrations/0002_campaigns.sql`: 商业活动表。
- `functions/_lib/env.ts`: Cloudflare binding 与依赖接口。
- `functions/_lib/http.ts`: JSON 响应、body 限制、来源校验和安全错误映射。
- `functions/_lib/crypto.ts`: 查询码、HMAC 和 AES-GCM 邮箱加密。
- `functions/_lib/submissionRepository.ts`: D1 申请仓储、限流、领取和状态迁移。
- `functions/_lib/turnstile.ts`: Turnstile 服务端校验。
- `functions/api/submissions/index.ts`: 公开提交接口。
- `functions/api/submissions/status.ts`: POST 查询公开状态。
- `functions/api/admin/submissions/claim.ts`: 定时任务领取接口。
- `functions/api/admin/submissions/[id].ts`: 受控状态更新接口。
- `functions/api/admin/submissions/purge.ts`: 定时清除到期个人数据并留下匿名汇总。
- `functions/api/campaigns.ts`: 当前有效活动只读接口。
- `tests/cloudflareSubmissionApi.test.ts`: 通过 fake D1/fetch 测试 Functions。

### Public UI

- `docs/.vitepress/theme/components/ToolSubmissionForm.vue`: 可访问提交表单。
- `docs/.vitepress/theme/components/SubmissionStatus.vue`: 查询码状态页。
- `docs/.vitepress/theme/components/SponsoredTools.vue`: 独立且明确披露的赞助区域。
- `docs/.vitepress/theme/components/AffiliateAction.vue`: 详情页独立联盟动作，不替换官方链接。
- `docs/.vitepress/theme/index.ts`: 注册新组件。
- `docs/.vitepress/config.ts`: 导航到 `/submit`，状态页 noindex。
- `docs/.vitepress/theme/custom.css`: 表单、状态、披露和响应式样式。
- `docs/submit.md`, `docs/submit/status.md`, `docs/promote.md`, `docs/privacy.md`: 公开页面。
- `tests/submissionComponents.test.ts`: SFC 编译和契约测试。

### Automated curation and publishing

- `scripts/submissions/safeOfficialFetch.mjs`: Node DNS + 重定向安全抓取。
- `scripts/submissions/openAiContentEnricher.mjs`: 可选 Responses API JSON Schema 适配器。
- `scripts/submissions/submissionClient.mjs`: 管理 API 领取与状态更新客户端。
- `scripts/submissions/curateToolSubmission.mjs`: 单条申请到目录草稿的编排器。
- `scripts/submissions/runCuration.mjs`: CLI 入口与 GitHub outputs。
- `.github/workflows/curate-tool-submission.yml`: 每六小时或手动运行，验证后创建 PR。
- `.github/workflows/sync-tool-submission-pr.yml`: PR 合并或关闭后同步公开状态，不执行 PR 代码。
- `tests/safeOfficialFetch.test.ts`, `tests/contentEnricher.test.ts`, `tests/curateToolSubmission.test.ts`: 离线、确定性的自动化测试。

### SEO, notifications, operations

- `docs/.vitepress/theme/components/ToolStructuredData.vue`: `SoftwareApplication` 与 `BreadcrumbList` JSON-LD。
- `scripts/notify-search-indexes.mjs`: 可选 IndexNow/百度通知。
- `scripts/check-ai-tool-links.mjs`: 每周只读变化检查并输出报告。
- `.github/workflows/check-ai-tool-links.yml`: 定时健康检查。
- `.github/workflows/maintain-tool-submissions.yml`: 每日调用受保护的到期数据清理接口。
- `docs/cloudflare-submissions-setup.md`: D1、Pages binding、secrets 与部署步骤。
- `package.json`, `package-lock.json`: 类型检查、自动化和运维脚本。

---

### Task 1: Make the catalog growth-safe and define shared submission contracts

**Files:**
- Create: `shared/submissions/contracts.ts`
- Create: `shared/submissions/validation.ts`
- Create: `tests/submissionContracts.test.ts`
- Modify: `tests/aiTools.test.ts`
- Modify: `tests/aiPageGeneration.test.ts`
- Modify: `scripts/verify-ai-build.mjs`
- Modify: `docs/public/social-card.svg`
- Test: `tests/buildVerifier.test.ts`

**Interfaces:**
- Produces: `SubmissionInput`, `SubmissionIntent`, `SubmissionStatus`, `PublicSubmissionStatus`, `ClaimedSubmission`, `ContentDraft`, `CampaignPublic`, `AllowedAutomationError`, `AdminStatusUpdate`, `parseSubmissionInput(value)`, `parseCampaignPublic(value)`, `normalizeOfficialUrl(value)`, `toDomainKey(url)`.
- Later tasks must import these values instead of duplicating enums or public response shapes.

- [ ] **Step 1: Add failing growth and contract tests**

Create tests that prove the original 63 slugs remain a required subset while extra valid tools are allowed:

```ts
const launchSlugs = [
  'chatgpt', 'claude', 'deepseek', 'kimi', 'gemini', 'microsoft-copilot', 'doubao',
  'notion', 'gamma', 'napkin', 'otter', 'grammarly', 'quillbot', 'wps-ai',
  'midjourney', 'canva', 'firefly', 'leonardo-ai', 'ideogram', 'stable-diffusion', 'remove-bg',
  'runway', 'capcut', 'kling', 'pika', 'heygen', 'synthesia', 'luma-dream-machine',
  'cursor', 'github-copilot', 'v0', 'lovable', 'replit', 'bolt-new', 'windsurf',
  'elevenlabs', 'suno', 'udio', 'descript', 'adobe-podcast', 'aiva', 'murf',
  'perplexity', 'elicit', 'consensus', 'scite', 'notebooklm', 'you-com', 'semantic-scholar',
  'jasper', 'copy-ai', 'hubspot-ai', 'predis-ai', 'buffer-ai', 'adcreative-ai', 'ocoya',
  'zapier', 'make', 'n8n', 'airtable', 'bardeen', 'rows', 'julius-ai'
] as const

it('preserves the launch catalog while allowing reviewed additions', () => {
  const tools = getAllTools()
  const slugs = new Set(tools.map((tool) => tool.slug))
  expect(tools.length).toBeGreaterThanOrEqual(launchSlugs.length)
  expect(launchSlugs.every((slug) => slugs.has(slug))).toBe(true)
  expect(getCategories()).toHaveLength(9)
  expect(getCategories().every(({ count }) => count >= 7)).toBe(true)
})
```

Change uniqueness assertions to compare against `tools.length`; change search/filter default counts to derive from `getAllTools()` and category data. In generator/verifier tests, create a fixture with a 64th valid tool and assert routes/counts derive from the JSON rather than `63`.

Add `tests/submissionContracts.test.ts` cases for:

```ts
const valid = {
  name: 'Example AI',
  officialUrl: 'https://example.com/product?utm_source=test',
  tagline: '把公开资料整理成可核验答案',
  description: '面向需要整理官方资料的团队。',
  category: 'research',
  bestFor: ['资料整理', '事实核验', '研究简报'],
  features: ['来源提取', '结构化摘要', '链接回溯'],
  pricingMode: 'freemium',
  chineseSupport: 'partial',
  accessModes: ['web'],
  pros: ['来源清晰', '流程直接'],
  cons: ['仍需人工核验', '高级额度可能收费'],
  contactEmail: 'owner@example.com',
  submitterRelationship: 'founder',
  intent: 'standard',
  acceptedTerms: true,
  turnstileToken: 'token-value',
  website: ''
}
```

Assert unknown fields, non-HTTPS, credentials, non-standard ports, invalid enums, arrays with other than exactly three `bestFor`/`features` entries, unchecked terms and non-empty honeypot are rejected. Assert omitting `description`, `accessModes`, `pros`, `cons`, and `logoUrl` is accepted, and URL normalization produces `https://example.com/product`.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```powershell
npm.cmd test -- tests/submissionContracts.test.ts tests/aiTools.test.ts tests/aiPageGeneration.test.ts tests/buildVerifier.test.ts
```

Expected: missing modules and current fixed-63 assertions fail.

- [ ] **Step 3: Implement exact shared contracts**

In `contracts.ts`, export these unions and shapes:

```ts
export type SubmissionIntent = 'standard' | 'priority_interest' | 'commercial_interest'
export type SubmitterRelationship = 'founder' | 'user' | 'partner' | 'other'
export type SubmissionStatus =
  | 'pending' | 'processing' | 'needs_info' | 'needs_enrichment'
  | 'pr_open' | 'published' | 'rejected' | 'error'
export type PublicSubmissionState = Exclude<SubmissionStatus, 'needs_enrichment'>

export interface SubmissionInput {
  name: string
  officialUrl: string
  tagline: string
  description?: string
  category: ToolCategory
  bestFor: [string, string, string]
  features: [string, string, string]
  pricingMode: PricingMode
  chineseSupport: ChineseSupport
  accessModes?: AccessMode[]
  pros?: [string, string]
  cons?: [string, string]
  contactEmail: string
  submitterRelationship: SubmitterRelationship
  intent: SubmissionIntent
  logoUrl?: string
  acceptedTerms: true
  turnstileToken: string
  website: ''
}

export interface PublicSubmissionStatus {
  status: PublicSubmissionState
  message: string
  prUrl?: string
  publishedAt?: string
}

export type AllowedAutomationError =
  | 'official_fetch_rejected' | 'official_fetch_failed'
  | 'enricher_invalid_output' | 'catalog_validation_failed'
  | 'build_failed' | 'github_pr_failed'

export type AdminStatusUpdate =
  | { status: 'needs_enrichment'; errorCode: 'enricher_unconfigured' | 'enricher_invalid_output' }
  | { status: 'needs_info'; publicMessage: string }
  | { status: 'pr_open'; prUrl: string }
  | { status: 'published'; prUrl: string; publishedAt: string }
  | { status: 'rejected'; publicMessage: string }
  | { status: 'error'; errorCode: AllowedAutomationError }

export interface ContentDraft {
  slug: string
  description: string
  bestFor: [string, string, string]
  features: [string, string, string]
  pricing: string
  requiresAccount: boolean
  tags: string[]
  searchTerms: string[]
  pros: string[]
  cons: string[]
}

export interface CampaignPublic {
  toolSlug: string
  type: 'sponsored_card' | 'affiliate_link'
  label: '赞助' | '联盟链接'
  destinationUrl: string
}
```

`ClaimedSubmission` contains the D1 row ID, a random non-secret `publicRef`, normalized public product fields, status and attempt count; it explicitly excludes the secret query code/hash, email ciphertext, IP/domain/content hashes and internal notes. Use an explicit allowed-key set. `parseSubmissionInput` returns a deeply frozen normalized value or throws `SubmissionValidationError` with stable codes such as `invalid_body`, `unknown_field`, `invalid_url`, `invalid_enum`, `invalid_length`, `terms_required`, and `spam_detected`. `parseCampaignPublic` rejects extra fields, unknown labels/types and unsafe destinations. Public status mapping converts internal `needs_enrichment` to the generic `processing` state rather than exposing the automation configuration.

- [ ] **Step 4: Replace fixed production counts with data-derived checks**

Keep the 63-slug baseline, but make production verification calculate:

```js
const expectedToolRoutes = new Set([
  '/tools/',
  ...tools.map((tool) => `/tools/${tool.slug}`)
])
assert.ok(tools.length >= 63, 'production data must preserve the launch catalog')
```

Change the SVG copy and assertions from `63+ 款工具 · 9 大使用场景` to `精选 AI 工具 · 9 大使用场景`. Keep the homepage eyebrow dynamic and continue verifying that it equals `${tools.length}+ 款工具 · 9 大使用场景 · 持续维护`.

- [ ] **Step 5: Run focused and full verification**

```powershell
npm.cmd test -- tests/submissionContracts.test.ts tests/aiTools.test.ts tests/aiPageGeneration.test.ts tests/buildVerifier.test.ts
npm.cmd test
npm.cmd run verify:build
git diff --check
```

Expected: all pass with the current 63 tools and the 64-tool fixture.

- [ ] **Step 6: Commit**

```powershell
git add -- shared/submissions tests/submissionContracts.test.ts tests/aiTools.test.ts tests/aiPageGeneration.test.ts tests/buildVerifier.test.ts scripts/verify-ai-build.mjs docs/public/social-card.svg
git commit -m "refactor: prepare ai catalog for reviewed growth"
```

### Task 2: Add D1 persistence, cryptography, and URL safety primitives

**Files:**
- Create: `migrations/0001_tool_submissions.sql`
- Create: `migrations/0002_campaigns.sql`
- Create: `functions/_lib/env.ts`
- Create: `functions/_lib/crypto.ts`
- Create: `functions/_lib/urlPolicy.ts`
- Create: `functions/_lib/submissionRepository.ts`
- Create: `tests/submissionPersistence.test.ts`
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `tsconfig.functions.json`

**Interfaces:**
- Consumes: `SubmissionInput`, `SubmissionStatus`, `CampaignPublic` from Task 1.
- Produces: `createSubmissionSecurity(env)`, `assertPublicHttpsUrl(url)`, `SubmissionRepository`, `CampaignRepository`, and Cloudflare `Env`.

```ts
export interface Env {
  SUBMISSIONS_DB: D1DatabaseLike
  TURNSTILE_SECRET_KEY: string
  PUBLIC_CODE_PEPPER: string
  SUBMISSIONS_ADMIN_TOKEN: string
  CONTACT_EMAIL_ENCRYPTION_KEY: string
}
```

Every required string binding is validated as non-empty at the route boundary; a missing binding returns the documented safe `503` and never substitutes a development default.

- [ ] **Step 1: Add dependencies and failing persistence tests**

Install pinned project-local Cloudflare/type tooling (record the resolved versions in `package-lock.json`):

```powershell
npm.cmd install --save-dev typescript @cloudflare/workers-types wrangler
```

Add scripts:

```json
{
  "typecheck:functions": "tsc --noEmit -p tsconfig.functions.json",
  "test:submissions": "vitest run tests/submissionContracts.test.ts tests/submissionPersistence.test.ts tests/cloudflareSubmissionApi.test.ts"
}
```

Use a fake D1 prepared-statement implementation to test observable repository behavior. Tests must assert:

- public code plaintext is returned once but only its HMAC hash is persisted;
- a separate random `public_ref` is persisted for branch/PR/status synchronization, and never authorizes status lookup;
- email ciphertext does not contain the plaintext email and decrypts with the same key;
- domain/content/IP hashes are deterministic with the same pepper;
- active duplicate domain statuses are rejected, while a previous `rejected` record can be resubmitted;
- rate window number 6 returns `rate_limited` when the limit is 5;
- claim transitions only `pending -> processing` and never claims the same row twice;
- invalid transitions such as `published -> pending` are rejected;
- stale `processing` leases and retryable `error` rows can be reclaimed only while `attempt_count < 3`, with `attempt_count` incremented atomically and exponential next-attempt times;
- rows whose `retention_until` has passed are aggregated by day/source/intent/outcome and deleted together with old rate-limit buckets;
- active campaigns require a published tool slug, valid dates and an approved fixed label.

- [ ] **Step 2: Run tests and verify RED**

```powershell
npm.cmd test -- tests/submissionPersistence.test.ts
```

Expected: missing migration and repository modules.

- [ ] **Step 3: Create exact D1 schema**

`0001_tool_submissions.sql` must create:

```sql
CREATE TABLE tool_submissions (
  id TEXT PRIMARY KEY,
  public_ref TEXT NOT NULL UNIQUE,
  public_code_hash TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  official_url TEXT NOT NULL,
  normalized_domain TEXT NOT NULL,
  category TEXT NOT NULL,
  pricing_mode TEXT NOT NULL,
  chinese_support TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  best_for_json TEXT NOT NULL,
  features_json TEXT NOT NULL,
  pros_json TEXT NOT NULL,
  cons_json TEXT NOT NULL,
  access_modes_json TEXT NOT NULL,
  logo_url TEXT,
  contact_email_ciphertext TEXT NOT NULL,
  submitter_relationship TEXT NOT NULL,
  intent TEXT NOT NULL,
  status TEXT NOT NULL,
  source TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  domain_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error_code TEXT,
  next_attempt_at TEXT,
  claim_expires_at TEXT,
  github_pr_url TEXT,
  public_message TEXT NOT NULL,
  published_at TEXT,
  retention_until TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_tool_submissions_status_created
  ON tool_submissions(status, created_at);
CREATE INDEX idx_tool_submissions_domain_status
  ON tool_submissions(normalized_domain, status);

CREATE TABLE submission_rate_limits (
  key_hash TEXT NOT NULL,
  window_start TEXT NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (key_hash, window_start)
);

CREATE TABLE submission_daily_stats (
  day TEXT NOT NULL,
  source TEXT NOT NULL,
  intent TEXT NOT NULL,
  outcome TEXT NOT NULL,
  count INTEGER NOT NULL,
  PRIMARY KEY (day, source, intent, outcome)
);
```

`0002_campaigns.sql` creates `campaigns` with `campaign_type`, fixed `label`, destination URL, dates and status, plus an index over `status, starts_at, ends_at`.

- [ ] **Step 4: Implement Worker-safe security helpers**

Use Web Crypto only. Accept a base64 32-byte `CONTACT_EMAIL_ENCRYPTION_KEY`, encrypt with AES-GCM and store `v1.<iv-base64url>.<cipher-base64url>`. Generate a 128-bit secret query code with `crypto.getRandomValues`, return its base64url plaintext once, and persist only `HMAC-SHA-256(PUBLIC_CODE_PEPPER, code)`. Independently generate a 64-bit base32 `publicRef`; it may appear in a branch or PR but cannot be used to read status.

`assertPublicHttpsUrl` must reject credentials, ports other than implicit 443, `localhost`, `.local`, `.internal`, IPv4 private/loopback/link-local/multicast ranges, and IPv6 loopback/unique-local/link-local literals. DNS resolution is added in Task 6 for the Node fetcher.

- [ ] **Step 5: Implement repositories with dependency injection**

Define `NormalizedSubmission` as the parsed submission with all optional text/list fields normalized to `''`/`[]`, and `SubmissionWriteContext` as `{ ipHash: string; domainHash: string; contentHash: string; now: string }`. Define a minimal `D1DatabaseLike` interface so tests do not require a live Cloudflare account. Repository methods:

```ts
create(input: NormalizedSubmission, context: SubmissionWriteContext): Promise<{ id: string; publicRef: string; publicCode: string }>
getPublicStatus(codeHash: string): Promise<PublicSubmissionStatus | null>
claimAvailable(limit: number, now: string): Promise<ClaimedSubmission[]>
updateStatus(id: string, update: AdminStatusUpdate): Promise<void>
incrementRateLimit(keyHash: string, windowStart: string): Promise<number>
findActiveByDomain(domain: string): Promise<{ id: string; status: SubmissionStatus } | null>
purgeExpired(now: string): Promise<{ deletedSubmissions: number; deletedRateBuckets: number }>
```

`CampaignRepository.listActive(now: string, publishedSlugs: ReadonlySet<string>): Promise<CampaignPublic[]>` is the only campaign read method; it enforces dates, fixed labels, destination policy and membership in the current catalog snapshot. All SQL arguments must use `.bind`; no interpolated user input. A claim sets a 30-minute lease and increments `attempt_count` in the same conditional update. Retryable failures set `next_attempt_at` to 5, 30, then 180 minutes after attempts 1–3; a third failure remains `error` for human handling. `published` and `rejected` never return to processing. Terminal updates reset `retention_until` to 180 days after the transition; creation also sets a 180-day fallback so abandoned rows cannot live forever.

- [ ] **Step 6: Run tests, typecheck, and commit**

```powershell
npm.cmd test -- tests/submissionPersistence.test.ts
npm.cmd run typecheck:functions
npm.cmd test
git diff --check
git add -- migrations functions/_lib shared/submissions package.json package-lock.json tsconfig.functions.json tests/submissionPersistence.test.ts
git commit -m "feat: add private submission persistence"
```

### Task 3: Implement the public submission and status APIs

**Files:**
- Create: `functions/_lib/http.ts`
- Create: `functions/_lib/turnstile.ts`
- Create: `functions/api/submissions/index.ts`
- Create: `functions/api/submissions/status.ts`
- Create: `tests/cloudflareSubmissionApi.test.ts`

**Interfaces:**
- Consumes: Task 1 parser and Task 2 repository/security helpers.
- Produces: same-origin `POST /api/submissions` and `POST /api/submissions/status` JSON APIs.

- [ ] **Step 1: Write failing API tests**

Create Request-level tests using dependency factories exported from each route:

```ts
export interface SubmissionHandlerDeps {
  repository: SubmissionRepository
  security: ReturnType<typeof createSubmissionSecurity>
  verifyTurnstile(input: TurnstileVerificationInput): Promise<boolean>
  now(): Date
}
export function createSubmissionHandler(deps: SubmissionHandlerDeps) {
  return async (context: PagesContext<Env>) => Response
}
```

Test exact outcomes:

- GET or wrong content type -> `405`/`415`;
- body over 32 KiB -> `413` without calling `request.json()`;
- browser `Origin` not equal to `new URL(request.url).origin` -> `403` (no extra origin secret/configuration);
- invalid schema -> `400` with stable public error code;
- Turnstile failure -> `400 verification_failed`;
- sixth IP/domain submission in one UTC hour -> `429` with `Retry-After`;
- duplicate active domain -> `409 duplicate_submission`;
- D1 failure -> `503 submission_unavailable`, never a false success;
- success -> `202 { code, status: 'pending' }`, `Cache-Control: no-store`;
- status query accepts only JSON body code, never query string;
- the sixth invalid or valid status lookup from one IP in an hour returns `429` without revealing whether a code exists;
- unknown code -> generic `404 submission_not_found`;
- status response never includes email, internal ID, IP hash or internal error.

- [ ] **Step 2: Run and verify RED**

```powershell
npm.cmd test -- tests/cloudflareSubmissionApi.test.ts
```

Expected: route modules missing.

- [ ] **Step 3: Implement Turnstile and HTTP boundaries**

`verifyTurnstile` posts URL-encoded `secret`, `response`, `remoteip`, and a generated `idempotency_key` to `https://challenges.cloudflare.com/turnstile/v0/siteverify`. Treat timeouts, non-2xx, malformed JSON and `success !== true` as failure without logging tokens.

`readJsonBody` checks `Content-Length` when present and also reads the stream with a hard 32 KiB accumulated-byte limit. JSON responses include `Content-Type: application/json; charset=utf-8`, `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, and a request ID.

- [ ] **Step 4: Implement public handlers**

Submission order must be: method/content/origin/body checks -> schema + honeypot -> Turnstile -> independent IP/domain hourly rate limits -> duplicate -> encryption/write. Derive the IP only from Cloudflare `CF-Connecting-IP`; if absent use a constant `unknown` rate key, never trust `X-Forwarded-For`. Hash both rate keys with the deployment pepper and allow at most five attempts per key per UTC hour.

Status messages are mapped by server-owned status constants, including internal `needs_enrichment -> processing`. Rate-limit status lookups using a separate peppered IP bucket before database lookup so enumeration receives the same response timing/order. Reject `prUrl` unless it is an HTTPS GitHub PR URL; reject `publishedAt` unless ISO date-time.

- [ ] **Step 5: Run focused/full tests and commit**

```powershell
npm.cmd test -- tests/cloudflareSubmissionApi.test.ts tests/submissionPersistence.test.ts tests/submissionContracts.test.ts
npm.cmd run typecheck:functions
npm.cmd test
git diff --check
git add -- functions/_lib/http.ts functions/_lib/turnstile.ts functions/api/submissions tests/cloudflareSubmissionApi.test.ts
git commit -m "feat: accept safe ai tool submissions"
```

### Task 4: Build the public submission, status, privacy, and cooperation pages

**Files:**
- Create: `docs/.vitepress/theme/components/ToolSubmissionForm.vue`
- Create: `docs/.vitepress/theme/components/SubmissionStatus.vue`
- Create: `docs/submit.md`
- Create: `docs/submit/status.md`
- Create: `docs/privacy.md`
- Create: `docs/promote.md`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/.vitepress/config.ts`
- Modify: `docs/.vitepress/theme/custom.css`
- Modify: `docs/about.md`
- Create: `tests/submissionComponents.test.ts`

**Interfaces:**
- Consumes: Task 1 input/status types and Task 3 public endpoints.
- Produces: accessible `/submit`, `/submit/status`, `/privacy`, and `/promote` experiences.

- [ ] **Step 1: Add failing component/page tests**

Compile both SFCs with `@vue/compiler-sfc`. Assert the form has visible labels, native controls, field-level `aria-describedby`, an `aria-live="polite"` submit status, honeypot hidden from keyboard, terms checkbox, privacy link, and no localStorage/sessionStorage use.

Assert the form sends exactly one JSON POST to `/api/submissions`; it does not put email/token/form data in URL. Assert failed requests preserve the reactive form object, while success clears sensitive fields and displays the returned code.

Assert status uses a password-style or text input with autocomplete off and sends `{ code }` by POST. Assert page frontmatter prevents indexing:

```yaml
head:
  - - meta
    - name: robots
      content: noindex,nofollow
```

Assert navigation uses `/submit`, and `/promote` explicitly says “付费不保证收录”“赞助内容明确标注”“编辑精选不可购买”.

- [ ] **Step 2: Run and verify RED**

```powershell
npm.cmd test -- tests/submissionComponents.test.ts
```

Expected: missing components/pages and old `/about#更新建议` nav.

- [ ] **Step 3: Implement the form without external state libraries**

Use one reactive form and newline-to-array conversion. Load Turnstile only on the client from `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit`; use `VITE_TURNSTILE_SITE_KEY`. When the key is absent, render “提交服务尚未配置，请稍后再试” and disable submission without affecting the rest of the site.

Intent choices:

```ts
[
  { value: 'standard', label: '普通收录（免费）' },
  { value: 'priority_interest', label: '希望了解加急审核' },
  { value: 'commercial_interest', label: '希望了解商业合作' }
]
```

Do not show prices or a payment button.

- [ ] **Step 4: Implement status and content pages**

`SubmissionStatus.vue` maps public statuses to neutral Chinese explanations. It must not infer rejection reasons. `/privacy` documents purpose, encryption, 180-day retention, no marketing without opt-in, and deletion contact channel. `/promote` links to `/submit?intent=commercial_interest` but the form may only preselect the intent; it must not copy arbitrary query values.

- [ ] **Step 5: Add responsive styles and run browser-level contracts**

At <=700px use one column; at <=390px all buttons/inputs/selects are at least 44px tall and no horizontal overflow. Preserve reduced-motion styles. Do not add a modal, carousel or account flow.

Run:

```powershell
npm.cmd test -- tests/submissionComponents.test.ts tests/accessibilityStyles.test.ts
npm.cmd test
npm.cmd run verify:build
git diff --check
```

- [ ] **Step 6: Commit**

```powershell
git add -- docs/.vitepress/theme/components/ToolSubmissionForm.vue docs/.vitepress/theme/components/SubmissionStatus.vue docs/.vitepress/theme/index.ts docs/.vitepress/config.ts docs/.vitepress/theme/custom.css docs/submit.md docs/submit/status.md docs/privacy.md docs/promote.md docs/about.md tests/submissionComponents.test.ts
git commit -m "feat: add public ai tool submission flow"
```

### Task 5: Add authenticated admin claim and status-transition APIs

**Files:**
- Create: `functions/_lib/adminAuth.ts`
- Create: `functions/api/admin/submissions/claim.ts`
- Create: `functions/api/admin/submissions/[id].ts`
- Create: `functions/api/admin/submissions/purge.ts`
- Modify: `tests/cloudflareSubmissionApi.test.ts`

**Interfaces:**
- Consumes: `SubmissionRepository.claimAvailable`, `updateStatus`, and `purgeExpired`.
- Produces: `POST /api/admin/submissions/claim`, `PATCH /api/admin/submissions/:id`, and `POST /api/admin/submissions/purge` for trusted scheduled workflows only.

- [ ] **Step 1: Add failing auth, claim, and transition tests**

Test missing/malformed/wrong bearer token -> uniform `401`; use constant-time byte comparison after SHA-256 hashing. Test `limit` clamps to `1..5`, the workflow requests one, and responses include `id`, `publicRef`, attempt count and required content fields but omit the secret query code/hash, ciphertext and IP/domain/content hashes. Test the purge route aggregates and deletes expired rows, accepts no caller-selected SQL/date cutoff, and returns counts only.

Import and allow only the `AdminStatusUpdate` union defined in Task 1:

```ts
type AdminStatusUpdate =
  | { status: 'needs_enrichment'; errorCode: 'enricher_unconfigured' | 'enricher_invalid_output' }
  | { status: 'needs_info'; publicMessage: string }
  | { status: 'pr_open'; prUrl: string }
  | { status: 'published'; prUrl: string; publishedAt: string }
  | { status: 'rejected'; publicMessage: string }
  | { status: 'error'; errorCode: AllowedAutomationError }
```

Assert arbitrary error strings, non-GitHub PR URLs, extra fields and terminal-to-pending transitions fail.

- [ ] **Step 2: Run RED**

```powershell
npm.cmd test -- tests/cloudflareSubmissionApi.test.ts
```

- [ ] **Step 3: Implement admin boundaries**

Require same-origin only for public APIs; admin APIs authenticate bearer token and do not use browser Origin. Return `Cache-Control: no-store`. Cap claim response at 5 and use repository conditional updates so concurrent invocations cannot claim the same row. The update route accepts either the internal row ID returned by claim or the stored `publicRef` used by trusted PR-close synchronization; both paths remain bearer-protected.

- [ ] **Step 4: Verify and commit**

```powershell
npm.cmd test -- tests/cloudflareSubmissionApi.test.ts tests/submissionPersistence.test.ts
npm.cmd run typecheck:functions
npm.cmd test
git diff --check
git add -- functions/_lib/adminAuth.ts functions/api/admin tests/cloudflareSubmissionApi.test.ts
git commit -m "feat: expose submission review automation api"
```

### Task 6: Implement safe official-site extraction and optional content enrichment

**Files:**
- Create: `scripts/submissions/safeOfficialFetch.mjs`
- Create: `scripts/submissions/openAiContentEnricher.mjs`
- Create: `scripts/submissions/contentSchema.mjs`
- Create: `tests/safeOfficialFetch.test.ts`
- Create: `tests/contentEnricher.test.ts`

**Interfaces:**
- Produces:

```ts
interface OfficialPageEvidence {
  finalUrl: string
  title: string
  metaDescription: string
  canonicalUrl?: string
  visibleText: string
}
interface SafeFetchDeps {
  resolveHost(hostname: string): Promise<readonly { address: string; family: 4 | 6 }[]>
  requestHttps(request: PinnedHttpsRequest): Promise<PinnedHttpsResponse>
  now(): number
}
interface PinnedHttpsRequest {
  url: URL
  address: string
  family: 4 | 6
  headers: Readonly<Record<string, string>>
  timeoutMs: number
}
interface PinnedHttpsResponse {
  status: number
  headers: Readonly<Record<string, string | undefined>>
  body: AsyncIterable<Uint8Array>
}
interface ContentEnricher {
  enrich(submission: ClaimedSubmission, evidence: OfficialPageEvidence): Promise<ContentDraft>
}
safeFetchOfficialPage(url, deps): Promise<OfficialPageEvidence>
createOpenAiContentEnricher(config): ContentEnricher | null
ContentEnricher.enrich(submission, evidence): Promise<ContentDraft>
```

- [ ] **Step 1: Write failing SSRF and redirect tests**

Inject `resolveHost` and `requestHttps`. Test direct and DNS-resolved loopback/private/link-local/unique-local addresses, mixed public/private DNS answers, credentials, port 8443, redirect to private IP, fourth redirect, timeout, non-HTML/encoded response and response over 1 MiB are rejected. Assert the transport pins the connection lookup to an already validated address while keeping the original hostname for SNI, certificate validation and `Host`, preventing a DNS check/use race.

Test a safe public page returns only title, meta description, canonical URL and normalized visible text capped at 40,000 characters. It must not return scripts, forms, cookies, response headers, hidden inputs or downloaded files.

- [ ] **Step 2: Write failing content-enricher tests**

Assert missing either `CONTENT_ENRICHER_API_KEY` or `CONTENT_ENRICHER_MODEL` returns `null` without a network call. For configured mode, assert the request goes to `https://api.openai.com/v1/responses`, sends only non-sensitive submission fields and public evidence, and uses a strict JSON Schema under `text.format` named `tool_draft`.

The schema must require `slug`, `description`, `bestFor`, `features`, `pricing`, `requiresAccount`, `tags`, `searchTerms`, `pros`, and `cons`; prohibit additional properties; require an ASCII-safe slug; and exclude rating, user-count, ranking, affiliate, email and submitter identity fields. Treat refusal, missing output text, malformed JSON, schema mismatch or disallowed claims as `enricher_invalid_output`.

Because the official OpenAI documentation pages returned 403 from this environment on 2026-08-27, keep the HTTP adapter isolated and cover the complete request/response contract with injected-fetch tests. Require `CONTENT_ENRICHER_MODEL` configuration instead of hard-coding a model name. Reconfirm the deployed request shape against [official OpenAI Structured Outputs documentation](https://platform.openai.com/docs/guides/structured-outputs) before enabling the production secret.

- [ ] **Step 3: Run RED**

```powershell
npm.cmd test -- tests/safeOfficialFetch.test.ts tests/contentEnricher.test.ts
```

- [ ] **Step 4: Implement safe fetch and evidence extraction**

Resolve DNS before every request and every redirect, rejecting the host when any answer is non-public. Use `node:https.request` with a pinned custom `lookup`, manual redirects, `Accept-Encoding: identity`, an 8-second total request timeout and at most 3 redirects. Stream at most 1 MiB. Parse text with code-local extraction—do not execute page JavaScript and do not use the page as instructions.

- [ ] **Step 5: Implement the optional Responses adapter**

Use native `fetch` rather than adding the OpenAI SDK. Set `Authorization: Bearer`, `Content-Type: application/json`, a 30-second abort, `store: false`, and configured `model`. Parse the first output text defensively; never log request bodies or raw responses. The adapter may retry once only for network/5xx errors, not for validation/refusal.

- [ ] **Step 6: Verify and commit**

```powershell
npm.cmd test -- tests/safeOfficialFetch.test.ts tests/contentEnricher.test.ts
npm.cmd test
git diff --check
git add -- scripts/submissions/safeOfficialFetch.mjs scripts/submissions/openAiContentEnricher.mjs scripts/submissions/contentSchema.mjs tests/safeOfficialFetch.test.ts tests/contentEnricher.test.ts
git commit -m "feat: prepare safe tool content enrichment"
```

### Task 7: Generate one validated catalog PR from one claimed submission

**Files:**
- Create: `shared/submissions/contentDraft.ts`
- Create: `scripts/submissions/submissionClient.mjs`
- Create: `scripts/submissions/curateToolSubmission.mjs`
- Create: `scripts/submissions/runCuration.mjs`
- Create: `scripts/submissions/syncSubmissionStatus.mjs`
- Create: `.github/workflows/curate-tool-submission.yml`
- Create: `.github/workflows/sync-tool-submission-pr.yml`
- Create: `tests/curateToolSubmission.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: admin API, safe evidence, optional enricher, existing `validateTools`, and `generateAiPages`.
- Produces: a one-submission workspace change and GitHub output fields `submission_id`, `submission_ref`, `slug`, `branch`, `pr_title`, `pr_body`, `has_changes`; the secret status query code never leaves D1/public submit response handling.

```ts
claimOne(): Promise<ClaimedSubmission | null>
updateSubmission(idOrPublicRef: string, update: AdminStatusUpdate): Promise<void>
curateToolSubmission(input: ClaimedSubmission, deps: CurationDeps): Promise<CurationResult>

interface CurationDeps {
  fetchOfficialPage(url: string): Promise<OfficialPageEvidence>
  enricher: ContentEnricher | null
  catalogPath: string
  projectRoot: string
  now(): Date
}
interface CurationResult {
  hasChanges: boolean
  submissionId: string
  submissionRef: string
  slug?: string
  branch?: string
  prTitle?: string
  prBody?: string
}
```

- [ ] **Step 1: Write failing orchestration tests**

Use fixture catalogs and injected dependencies. Assert:

- claim returns none -> clean exit with `has_changes=false`;
- missing enricher -> PATCH `needs_enrichment`, no file write;
- duplicate normalized domain or slug -> `needs_info`, no write;
- unsafe official fetch -> allowed finite error code, no write;
- enriched draft never receives `featuredOrder`;
- alternatives are exactly two existing same-category slugs and never self-reference;
- `addedAt` and `updatedAt` use injected current UTC date;
- catalog parser and generator validate before changing the real working tree;
- rerunning the same claimed ID does not append a second tool;
- output/body contains the non-secret `publicRef` and review checklist but no query code/hash, email, IP, admin token or raw model response.

The PR checklist must name each human verification explicitly: official domain, pricing wording, Chinese support, logo/brand usage rights, category, use cases, features, pros/cons, two alternatives, commercial-label isolation, and successful catalog/tests/build checks.

- [ ] **Step 2: Run RED**

```powershell
npm.cmd test -- tests/curateToolSubmission.test.ts
```

- [ ] **Step 3: Implement draft construction and atomic file update**

Build the candidate in memory against `docs/.vitepress/theme/domain/ai-tools.json`, then call the existing exported `validateTools` and `generateAiPages` from `scripts/generate-ai-pages.mjs` in a temporary project root. Only after that succeeds, write a temporary JSON file beside the real catalog, re-read and validate it, rename it over the catalog, and run the generator in the real root. Never write outside the resolved catalog/generated-page roots. Slugify ASCII names; non-ASCII-only names require the `ContentDraft.slug` to pass the existing slug pattern or transition to `needs_info`.

- [ ] **Step 4: Implement the workflow**

The workflow runs on `schedule: '17 */6 * * *'` and `workflow_dispatch`, with:

```yaml
permissions:
  contents: write
  pull-requests: write
concurrency:
  group: curate-tool-submission
  cancel-in-progress: false
```

Pin the only reusable actions exactly as follows (the SHAs were resolved from their `v4` tags during plan review):

```yaml
- uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
- uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4
```

Steps: checkout `main`; setup Node 20; `npm ci`; run curation with claim limit 1; if no changes stop; run `npm test`, `npm run verify:build`, `git diff --check`; create `submission/<submission-ref>-<slug>` with native `git`, push using `GITHUB_TOKEN`, and use the preinstalled `gh` CLI to find-or-create exactly one PR. PATCH `pr_open` only when GitHub returns a PR URL. On a finite retryable failure, PATCH the allowed `error` code so the repository backoff/three-attempt policy applies, then exit non-zero. Do not use a third-party PR action.

Do not expose secrets to pull-request code. This workflow only runs on schedule/manual in the trusted default-branch workflow context.

`sync-tool-submission-pr.yml` runs on `pull_request.closed`, requires the head branch to belong to the same repository and match `submission/<submission-ref>-<slug>`, checks out or executes no PR code, and uses only the extracted safe `submissionRef` plus the bearer-protected admin API. It sends `published` with merge time/PR URL when merged, otherwise `rejected` with the generic public message “经人工审核暂未收录”. Fork PRs and malformed branch names receive no secrets and perform no call.

- [ ] **Step 5: Add scripts, verify, and commit**

Add:

```json
{
  "submissions:curate": "node scripts/submissions/runCuration.mjs",
  "submissions:sync": "node scripts/submissions/syncSubmissionStatus.mjs"
}
```

Run:

```powershell
npm.cmd test -- tests/curateToolSubmission.test.ts tests/aiTools.test.ts tests/aiPageGeneration.test.ts
npm.cmd test
npm.cmd run verify:build
git diff --check
git add -- shared/submissions/contentDraft.ts scripts/submissions .github/workflows/curate-tool-submission.yml .github/workflows/sync-tool-submission-pr.yml tests/curateToolSubmission.test.ts package.json package-lock.json
git commit -m "feat: automate reviewed tool catalog pull requests"
```

### Task 8: Add explicit campaign isolation and commercial disclosures

**Files:**
- Create: `functions/api/campaigns.ts`
- Create: `docs/.vitepress/theme/components/SponsoredTools.vue`
- Create: `docs/.vitepress/theme/components/AffiliateAction.vue`
- Modify: `docs/.vitepress/theme/components/AiDirectory.vue`
- Modify: `docs/.vitepress/theme/components/ToolDetail.vue`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/.vitepress/theme/custom.css`
- Modify: `tests/directoryComponents.test.ts`
- Modify: `tests/cloudflareSubmissionApi.test.ts`

**Interfaces:**
- Consumes: `GET /api/campaigns` public records and existing tool slugs.
- Produces: separate sponsored section and optional affiliate action; original official links remain unchanged.

- [ ] **Step 1: Add failing isolation tests**

API tests require only `active` campaigns with `starts_at <= now < ends_at`, approved labels exactly `赞助` or `联盟链接`, an HTTPS public destination and a slug present in the published catalog. Response omits campaign IDs and private fields; API failure returns `503`.

Component tests require:

- `SponsoredTools` renders in a separate region labelled `赞助工具`, never inside editor picks or natural directory results;
- every item visibly includes `赞助` before its link;
- `AffiliateAction` says `联盟链接` and renders separately from the unchanged `访问官方网站` link;
- no campaign mutates `featuredOrder`, search/filter arrays or alternatives;
- endpoint failure renders nothing and preserves normal content.

- [ ] **Step 2: Run RED**

```powershell
npm.cmd test -- tests/directoryComponents.test.ts tests/cloudflareSubmissionApi.test.ts
```

- [ ] **Step 3: Implement read-only campaign endpoint and fail-closed UI**

Fetch campaigns only after client mount. Validate the response again in the browser using shared `CampaignPublic` guards. Use `rel="sponsored noreferrer noopener"` for commercial links. Do not replace or decorate ordinary official links when there is no active campaign.

- [ ] **Step 4: Verify and commit**

```powershell
npm.cmd test -- tests/directoryComponents.test.ts tests/cloudflareSubmissionApi.test.ts tests/accessibilityStyles.test.ts
npm.cmd run typecheck:functions
npm.cmd test
npm.cmd run verify:build
git diff --check
git add -- functions/api/campaigns.ts docs/.vitepress/theme/components/SponsoredTools.vue docs/.vitepress/theme/components/AffiliateAction.vue docs/.vitepress/theme/components/AiDirectory.vue docs/.vitepress/theme/components/ToolDetail.vue docs/.vitepress/theme/index.ts docs/.vitepress/theme/custom.css tests/directoryComponents.test.ts tests/cloudflareSubmissionApi.test.ts
git commit -m "feat: disclose ai directory commercial campaigns"
```

### Task 9: Add structured data, optional index notifications, health checks, and deployment docs

**Files:**
- Create: `docs/.vitepress/theme/components/ToolStructuredData.vue`
- Modify: `docs/.vitepress/theme/components/ToolDetail.vue`
- Modify: `docs/.vitepress/config.ts`
- Modify: `scripts/generate-ai-pages.mjs`
- Create: `scripts/notify-search-indexes.mjs`
- Create: `scripts/check-ai-tool-links.mjs`
- Create: `.github/workflows/check-ai-tool-links.yml`
- Create: `.github/workflows/maintain-tool-submissions.yml`
- Create: `tests/searchNotifications.test.ts`
- Modify: `tests/aiPageGeneration.test.ts`
- Modify: `tests/buildVerifier.test.ts`
- Modify: `scripts/verify-ai-build.mjs`
- Create: `docs/cloudflare-submissions-setup.md`
- Modify: `README.md`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Produces valid `SoftwareApplication`, route-appropriate site-wide `BreadcrumbList`, category `ItemList`, optional post-deploy notification, daily private-data cleanup, and weekly read-only link report.

- [ ] **Step 1: Add failing structured-data and notification tests**

Assert every built tool page contains one parseable `application/ld+json` graph with `SoftwareApplication`, name, canonical URL, application category, operating system labels, and an `offers` object only when the pricing mode can be represented without inventing a price. The graph also contains `BreadcrumbList` with homepage, category and tool. `docs/.vitepress/config.ts` adds route-appropriate breadcrumb JSON-LD through `transformHead` for category, submit, status, privacy, promote and ordinary content routes while skipping tool routes handled by `ToolStructuredData`; the status route remains `noindex`.

Category generated pages must contain parseable `ItemList` with positions matching their rendered link order.

Notification tests invoke `notifySearchIndexes({ sitemapPath, urlListPath, fetch, env, logger })` and assert:

- no `INDEXNOW_KEY` and no Baidu token -> exit success with zero network calls;
- IndexNow payload contains only canonical new/changed public URLs from the current sitemap and same host;
- Baidu payload uses newline-separated canonical URLs, never status/admin/privacy URLs;
- non-2xx returns non-zero without affecting the prior build artifacts;
- secrets never appear in logs.

- [ ] **Step 2: Run RED**

```powershell
npm.cmd test -- tests/searchNotifications.test.ts tests/aiPageGeneration.test.ts tests/buildVerifier.test.ts
```

- [ ] **Step 3: Implement structured data and exact artifact verification**

Serialize JSON with `JSON.stringify`, escape `<` as `\u003c`, and never interpolate raw JSON into HTML strings. The verifier parses JSON and checks tool slug/name/category/link against `ai-tools.json`; it must not rely on regex alone.

- [ ] **Step 4: Implement optional notifications and weekly link checks**

`notify-search-indexes.mjs` requires both `--sitemap docs/.vitepress/dist/sitemap.xml` and `--urls <newline-delimited-file>`; it intersects normalized URLs with the same-host sitemap, rejects status/admin/privacy URLs, requires a successful existing build and never edits files. `check-ai-tool-links.mjs` uses the Task 6 safe fetcher with concurrency 3 and produces `ai-tool-link-report.json` as a GitHub artifact; it never modifies catalog data or opens PRs.

The health workflow runs weekly and manually with `contents: read`; it must not receive admin/OpenAI secrets. Pin `actions/checkout` and `actions/setup-node` to the exact SHAs above and `actions/upload-artifact` to `ea165f8d65b6e75b540449e92b4886f43607fa02` (`v4`). `maintain-tool-submissions.yml` runs daily/manual, checks out or executes no repository code, sends only the admin bearer token to `POST /api/admin/submissions/purge`, and fails on non-2xx so retention failures are visible.

- [ ] **Step 5: Write exact Cloudflare setup and retention instructions**

Document these executable commands:

```powershell
npm exec wrangler d1 create xunqi-submissions
npm exec wrangler d1 migrations apply xunqi-submissions --remote
```

Then instruct the operator to bind the created database as `SUBMISSIONS_DB` in the existing Cloudflare Pages project, configure `TURNSTILE_SECRET_KEY`, `PUBLIC_CODE_PEPPER`, `SUBMISSIONS_ADMIN_TOKEN`, `CONTACT_EMAIL_ENCRYPTION_KEY`, and set `VITE_TURNSTILE_SITE_KEY` as a Pages build variable. Provide PowerShell commands using `RandomNumberGenerator.GetBytes(32)` to generate each 256-bit secret; never provide a default value.

Document GitHub secrets, the optional `CONTENT_ENRICHER_API_KEY` + `CONTENT_ENRICHER_MODEL` pair, and the rule that the adapter remains disabled until the deployed request shape has been checked against official OpenAI documentation. Document the authenticated daily purge, the exact D1 verification query for `retention_until`, anonymous aggregate table, manual recovery command, and backup/rollback steps. IndexNow/Baidu instructions must call the notifier only after a successful production deployment and pass an explicit newline-delimited allow-list of new/changed canonical URLs; the notifier intersects that list with the built sitemap and never guesses URLs from untrusted input.

- [ ] **Step 6: Run full verification and browser smoke**

```powershell
npm.cmd run typecheck:functions
npm.cmd test
npm.cmd run verify:build
git diff --check
git status --short --branch
```

In the in-app browser verify desktop, 390×844 and 320×700:

- homepage remains functional when campaign API returns unavailable;
- `/submit` shows safe disabled state without a Turnstile site key;
- with a mocked local endpoint, valid submission shows a query code and API failure preserves values;
- `/submit/status` never puts the code in the URL;
- `/promote` contains all disclosures;
- tool page has official link plus separately labelled affiliate action only when mocked active;
- no horizontal overflow or console error.

- [ ] **Step 7: Commit**

```powershell
git add -- docs/.vitepress/theme/components/ToolStructuredData.vue docs/.vitepress/theme/components/ToolDetail.vue docs/.vitepress/config.ts scripts/generate-ai-pages.mjs scripts/notify-search-indexes.mjs scripts/check-ai-tool-links.mjs .github/workflows/check-ai-tool-links.yml .github/workflows/maintain-tool-submissions.yml tests/searchNotifications.test.ts tests/aiPageGeneration.test.ts tests/buildVerifier.test.ts scripts/verify-ai-build.mjs docs/cloudflare-submissions-setup.md README.md package.json package-lock.json
git commit -m "feat: complete ai directory submission operations"
```

### Task 10: Final security, privacy, and production readiness review

**Files:**
- Verify: all files from Tasks 1–9
- Modify: only files required by review findings

**Interfaces:**
- Consumes the complete submission, automation and commercial disclosure system.
- Produces a reviewed branch that is safe to configure in Cloudflare and GitHub.

- [ ] **Step 1: Run clean automated gates**

```powershell
npm.cmd run typecheck:functions
npm.cmd test
npm.cmd run verify:build
git diff --check
```

- [ ] **Step 2: Run abuse-case review**

Use tests or local mocks to prove: oversized body, extra JSON field, honeypot, invalid Turnstile, sixth hourly request, duplicate domain, credential URL, non-standard port, DNS rebinding-style redirect, query code enumeration, wrong admin token, invalid status transition, malformed AI response, build failure and expired campaign all fail closed.

- [ ] **Step 3: Audit secret and personal-data boundaries**

Run:

```powershell
rg -n "TURNSTILE_SECRET|PUBLIC_CODE_PEPPER|SUBMISSIONS_ADMIN_TOKEN|CONTACT_EMAIL_ENCRYPTION_KEY|CONTENT_ENRICHER_API_KEY" . --glob '!node_modules/**' --glob '!docs/.vitepress/dist/**'
rg -n "contactEmail|contact_email|CF-Connecting-IP|publicCode|turnstileToken" .github scripts docs shared functions tests --glob '!docs/superpowers/**'
```

Expected: only environment-variable names, documentation and deliberate test fixtures; no real value, request-body log or public rendering path.

- [ ] **Step 4: Review workflow supply-chain safety**

Confirm every third-party GitHub Action is pinned to an immutable full commit SHA, workflow permissions are minimal, secrets never run on pull-request code, and no workflow auto-merges or pushes directly to `main`.

- [ ] **Step 5: Validate repository scope**

Confirm the only untracked unrelated file remains the existing Word document, `cultivation-archive` still resolves to `219498d39b2cb21f699989304981d47006fef913`, and no real D1 database ID or secret is committed.

- [ ] **Step 6: Request final whole-branch review**

Review against `docs/superpowers/specs/2026-08-27-tool-submission-automation-design.md`, with explicit verdicts for spec compliance, privacy, SSRF, authentication, automation idempotency, commercial disclosure, SEO and maintainability. Fix all Critical/Important findings, rerun Steps 1–5, and perform one scoped re-review.

- [ ] **Step 7: Commit review fixes if any**

```powershell
git add -- functions shared scripts docs .github migrations tests package.json package-lock.json tsconfig.functions.json
git commit -m "fix: complete tool submission security review"
```

Do not add the unrelated Word document.
