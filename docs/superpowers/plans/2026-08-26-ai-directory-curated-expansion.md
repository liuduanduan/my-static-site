# AI Directory Curated Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将“寻器”从 24 款、6 分类扩展为 63 款、9 分类的中文精选 AI 工具目录，并加入可解释的精选/最新/免费发现入口、三项组合筛选、增强搜索与完整详情事实。

**Architecture:** 继续以 `ai-tools.json` 作为唯一事实源，由 `aiTools.ts` 负责类型、运行时校验、搜索、排序、筛选和发现集合；Vue 组件只管理页面状态和渲染。生成脚本从同一数据源生成 63 个详情页、9 个分类页、索引和 sitemap，保持 VitePress 静态部署，不增加数据库、账号或客户端依赖。

**Tech Stack:** VitePress 1.6、Vue 3、TypeScript、Vitest 4、Node.js ESM、原生 CSS、静态 JSON。

---

## File map

- `docs/.vitepress/theme/domain/ai-tools.json`: 63 款工具的唯一事实数据。
- `docs/.vitepress/theme/domain/aiTools.ts`: 数据类型、运行时约束、中文标签、搜索评分、组合筛选、发现集合和分页切片。
- `docs/.vitepress/theme/domain/directoryPresentation.ts`: 首屏文案、动态规模文案、九分类视觉和代码内品牌标记。
- `docs/.vitepress/theme/components/DirectoryFilters.vue`: 分类、价格模式、中文支持三个筛选器及重置事件。
- `docs/.vitepress/theme/components/ToolCard.vue`: 首页发现栏和完整目录共用的工具卡。
- `docs/.vitepress/theme/components/AiDirectory.vue`: 首页状态、发现栏、筛选结果和“加载更多”编排。
- `docs/.vitepress/theme/components/ToolDetail.vue`: 工具详情与四项事实栏。
- `docs/.vitepress/theme/custom.css`: 现有蓝色平台视觉的扩展、响应式和可访问性样式。
- `scripts/generate-ai-pages.mjs`: 数据二次校验、详情页/分类页/索引/manifest 生成。
- `tests/aiTools.test.ts`: 数据完整性、搜索、排序、筛选、发现集合和分页测试。
- `tests/directoryPresentation.test.ts`: 动态规模文案、九分类视觉和品牌标记测试。
- `tests/aiPageGeneration.test.ts`: 生成产物数量、路径和旧分类清理测试。
- `tests/accessibilityStyles.test.ts`: 新控件、标签和事实栏的颜色对比度约束。
- `docs/tools/*.md`, `docs/ai-categories/*.md`, `docs/.vitepress/ai-pages-manifest.json`: 由生成脚本确定性更新的静态产物。

### Task 1: Expand the catalog contract and seed data

**Files:**
- Modify: `tests/aiTools.test.ts`
- Modify: `docs/.vitepress/theme/domain/aiTools.ts`
- Modify: `docs/.vitepress/theme/domain/ai-tools.json`

- [ ] **Step 1: Replace the six-category seed assertions with failing 63-tool contract tests**

Add these imports and assertions to `tests/aiTools.test.ts` before changing production data:

```ts
import {
  categoryLabels,
  chineseSupportLabels,
  getAllTools,
  getCategories,
  pricingModeLabels,
  validateToolCollection
} from '../docs/.vitepress/theme/domain/aiTools'

const requiredCategories = [
  'chat',
  'writing',
  'image',
  'video',
  'coding',
  'audio',
  'research',
  'marketing',
  'automation'
] as const

it('contains 63 curated tools across nine durable categories', () => {
  expect(getAllTools()).toHaveLength(63)
  expect(Object.keys(categoryLabels)).toEqual(requiredCategories)
  expect(getCategories()).toHaveLength(9)
  expect(getCategories().every(({ count }) => count >= 5)).toBe(true)
})

it('keeps every catalog record complete and conservative', () => {
  const tools = getAllTools()
  const slugs = new Set(tools.map(({ slug }) => slug))

  expect(() => validateToolCollection(tools)).not.toThrow()
  expect(slugs.size).toBe(tools.length)
  expect(tools.every(({ url }) => url.startsWith('https://'))).toBe(true)
  expect(tools.every(({ pricingMode }) => pricingMode in pricingModeLabels)).toBe(true)
  expect(tools.every(({ chineseSupport }) => chineseSupport in chineseSupportLabels)).toBe(true)
  expect(tools.every(({ tags, searchTerms }) => tags.length >= 2 && searchTerms.length >= 2)).toBe(true)
  expect(tools.every(({ alternatives }) => alternatives.every((slug) => slugs.has(slug)))).toBe(true)
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
npm.cmd test -- tests/aiTools.test.ts
```

Expected: FAIL because the catalog still has 24 tools, six categories, and none of the new structured fields or validators.

- [ ] **Step 3: Define the nine-category schema and strict runtime contract**

Replace the old unions in `aiTools.ts` with these exact public types and labels:

```ts
export type ToolCategory =
  | 'chat'
  | 'writing'
  | 'image'
  | 'video'
  | 'coding'
  | 'audio'
  | 'research'
  | 'marketing'
  | 'automation'

export type PricingMode = 'free' | 'freemium' | 'paid' | 'contact'
export type ChineseSupport = 'native' | 'partial' | 'none'
export type AccessMode = 'web' | 'desktop' | 'mobile' | 'api' | 'extension'

export interface AiTool {
  slug: string
  name: string
  category: ToolCategory
  tagline: string
  description: string
  bestFor: string[]
  features: string[]
  pricing: string
  pricingMode: PricingMode
  chineseSupport: ChineseSupport
  accessModes: AccessMode[]
  requiresAccount: boolean
  tags: string[]
  searchTerms: string[]
  pros: string[]
  cons: string[]
  url: string
  addedAt: string
  updatedAt: string
  featuredOrder?: number
  alternatives: string[]
}

export const categoryLabels: Record<ToolCategory, string> = {
  chat: '对话与模型',
  writing: '写作与办公',
  image: '图像与设计',
  video: '视频与数字人',
  coding: '编程与建站',
  audio: '音频与音乐',
  research: '搜索与研究',
  marketing: '营销与社媒',
  automation: '自动化与数据'
}

export const pricingModeLabels: Record<PricingMode, string> = {
  free: '免费',
  freemium: '免费增值',
  paid: '付费',
  contact: '联系询价'
}

export const chineseSupportLabels: Record<ChineseSupport, string> = {
  native: '原生中文',
  partial: '部分支持',
  none: '暂不支持'
}

export const accessModeLabels: Record<AccessMode, string> = {
  web: '网页',
  desktop: '桌面端',
  mobile: '移动端',
  api: 'API',
  extension: '浏览器扩展'
}
```

Implement `validateToolCollection(value: unknown): AiTool[]` with these explicit failures: non-array input; total below 60; unsafe or duplicate slug; unknown enum; missing/empty string or list; non-HTTPS URL; invalid `YYYY-MM-DD` dates; duplicate/non-positive `featuredOrder`; unknown alternative; fewer than five entries in any category. Call it once at module load:

```ts
const tools = validateToolCollection(rawTools)
```

Do not silently drop malformed records.

- [ ] **Step 4: Expand `ai-tools.json` to the exact 63-tool launch roster**

Keep all 24 existing tools, reclassify them where indicated, and add the remaining tools so every category has seven entries:

| Category | Seven launch tools |
| --- | --- |
| `chat` | ChatGPT (`chatgpt`), Claude (`claude`), DeepSeek (`deepseek`), Kimi (`kimi`), Gemini (`gemini`), Microsoft Copilot (`microsoft-copilot`), 豆包 (`doubao`) |
| `writing` | Notion (`notion`), Gamma (`gamma`), Napkin AI (`napkin`), Otter.ai (`otter`), Grammarly (`grammarly`), QuillBot (`quillbot`), WPS AI (`wps-ai`) |
| `image` | Midjourney (`midjourney`), Canva (`canva`), Adobe Firefly (`firefly`), Leonardo AI (`leonardo-ai`), Ideogram (`ideogram`), Stable Diffusion (`stable-diffusion`), remove.bg (`remove-bg`) |
| `video` | Runway (`runway`), CapCut (`capcut`), 可灵 Kling (`kling`), Pika (`pika`), HeyGen (`heygen`), Synthesia (`synthesia`), Luma Dream Machine (`luma-dream-machine`) |
| `coding` | Cursor (`cursor`), GitHub Copilot (`github-copilot`), v0 (`v0`), Lovable (`lovable`), Replit (`replit`), Bolt.new (`bolt-new`), Windsurf (`windsurf`) |
| `audio` | ElevenLabs (`elevenlabs`), Suno (`suno`), Udio (`udio`), Descript (`descript`), Adobe Podcast (`adobe-podcast`), AIVA (`aiva`), Murf (`murf`) |
| `research` | Perplexity (`perplexity`), Elicit (`elicit`), Consensus (`consensus`), Scite (`scite`), NotebookLM (`notebooklm`), You.com (`you-com`), Semantic Scholar (`semantic-scholar`) |
| `marketing` | Jasper (`jasper`), Copy.ai (`copy-ai`), HubSpot AI (`hubspot-ai`), Predis.ai (`predis-ai`), Buffer AI Assistant (`buffer-ai`), AdCreative.ai (`adcreative-ai`), Ocoya (`ocoya`) |
| `automation` | Zapier (`zapier`), Make (`make`), n8n (`n8n`), Airtable (`airtable`), Bardeen (`bardeen`), Rows (`rows`), Julius AI (`julius-ai`) |

Every record must contain every required field from `AiTool`. Use official HTTPS homepages; describe pricing as a conservative mode plus a sentence ending with “以官网为准”; set `chineseSupport` to `native` only when the product has an actual Chinese interface or documented Chinese product experience; use `partial` for products that accept Chinese input but do not provide a complete Chinese interface; use `none` when Chinese support cannot be confirmed. `addedAt` records the actual catalog inclusion date, while `updatedAt` is the human verification date.

Assign `featuredOrder` only to this explainable editorial set:

```json
{
  "chatgpt": 1,
  "claude": 2,
  "midjourney": 3,
  "runway": 4,
  "cursor": 5,
  "perplexity": 6
}
```

For each record, add two to five concise visible `tags` and at least two non-visible Chinese `searchTerms` representing realistic tasks such as “做PPT”, “会议纪要”, “去背景”, “论文检索”, “自动发邮件” or “数字人讲解”。Do not add ratings, user counts, popularity claims, affiliate status, or unverified “完全免费” language.

- [ ] **Step 5: Run the data tests and verify GREEN**

Run:

```powershell
npm.cmd test -- tests/aiTools.test.ts
```

Expected: all catalog contract tests PASS with `63` tools, `9` categories, and `7` tools per category.

- [ ] **Step 6: Commit the schema and catalog**

```powershell
git add -- tests/aiTools.test.ts docs/.vitepress/theme/domain/aiTools.ts docs/.vitepress/theme/domain/ai-tools.json
git commit -m "feat: expand curated ai tool catalog"
```

### Task 2: Add ranked search, combined filters, discovery sets, and pagination

**Files:**
- Modify: `tests/aiTools.test.ts`
- Modify: `docs/.vitepress/theme/domain/aiTools.ts`

- [ ] **Step 1: Write failing behavior tests**

Add tests covering priority, natural-language aliases, combined filters, deterministic discovery and 12-item slicing:

```ts
import {
  filterTools,
  getDiscoveryTools,
  paginateTools
} from '../docs/.vitepress/theme/domain/aiTools'

it('ranks name matches before tag/search-term and body matches', () => {
  const slugs = filterTools({ query: 'notion' }).map(({ slug }) => slug)
  expect(slugs[0]).toBe('notion')
})

it('matches Chinese aliases and real tasks', () => {
  expect(filterTools({ query: '会议纪要' }).map(({ slug }) => slug)).toContain('otter')
  expect(filterTools({ query: '去背景' }).map(({ slug }) => slug)).toContain('remove-bg')
  expect(filterTools({ query: '论文检索' }).map(({ slug }) => slug)).toContain('semantic-scholar')
})

it('combines category, pricing, and Chinese support', () => {
  const result = filterTools({
    category: 'research',
    pricingMode: 'freemium',
    chineseSupport: 'native'
  })
  expect(result.map(({ slug }) => slug)).toContain('notebooklm')
  expect(result.every(({ category }) => category === 'research')).toBe(true)
})

it('returns explainable discovery slices', () => {
  expect(getDiscoveryTools('featured').map(({ slug }) => slug)).toEqual([
    'chatgpt', 'claude', 'midjourney', 'runway', 'cursor', 'perplexity'
  ])
  expect(getDiscoveryTools('latest')).toHaveLength(6)
  expect(getDiscoveryTools('free').every(({ pricingMode }) =>
    pricingMode === 'free' || pricingMode === 'freemium'
  )).toBe(true)
})

it('reveals filtered results in stable groups of twelve', () => {
  const tools = filterTools({})
  expect(paginateTools(tools, 12)).toHaveLength(12)
  expect(paginateTools(tools, 24)).toHaveLength(24)
  expect(new Set(paginateTools(tools, 24).map(({ slug }) => slug)).size).toBe(24)
})
```

- [ ] **Step 2: Run focused tests and verify RED**

Run `npm.cmd test -- tests/aiTools.test.ts`; expect missing exports and old substring-only behavior.

- [ ] **Step 3: Implement one normalized filter pipeline**

Use these public contracts so the UI does not duplicate domain logic:

```ts
export type CategoryFilter = ToolCategory | 'all'
export type PricingFilter = PricingMode | 'all'
export type ChineseSupportFilter = ChineseSupport | 'all'
export type DiscoveryKind = 'featured' | 'latest' | 'free'

export interface ToolFilters {
  query?: string
  category?: CategoryFilter
  pricingMode?: PricingFilter
  chineseSupport?: ChineseSupportFilter
}

export const PAGE_SIZE = 12

export function filterTools(filters: ToolFilters = {}): AiTool[]
export function getDiscoveryTools(kind: DiscoveryKind, limit?: number): AiTool[]
export function paginateTools(items: AiTool[], visibleCount: number): AiTool[]
```

Normalize with `trim().toLocaleLowerCase()` and collapse internal whitespace. Score a query match by highest matching field: name `300`, `tags`/`searchTerms` `200`, tagline/description/bestFor/features `100`, no match `0`. Sort query results by score descending, then `featuredOrder` ascending, `addedAt` descending, and Chinese name ascending. With no query, use the same stable fallback ordering without a score.

`getDiscoveryTools('featured')` sorts only records with `featuredOrder`; `latest` sorts by `addedAt` descending and name ascending; `free` accepts only `free`/`freemium` and uses the default stable order. All discovery slices default to six.

`paginateTools` must clamp invalid counts to `PAGE_SIZE` and return `items.slice(0, visibleCount)` without mutating its input.

- [ ] **Step 4: Run focused and full tests**

```powershell
npm.cmd test -- tests/aiTools.test.ts
npm.cmd test
```

Expected: search/filter/discovery tests and all pre-existing tests PASS.

- [ ] **Step 5: Commit the domain behavior**

```powershell
git add -- tests/aiTools.test.ts docs/.vitepress/theme/domain/aiTools.ts
git commit -m "feat: add ai directory discovery filters"
```

### Task 3: Generate and verify 63 detail pages and nine category pages

**Files:**
- Create: `tests/aiPageGeneration.test.ts`
- Modify: `scripts/generate-ai-pages.mjs`
- Regenerate: `docs/tools/*.md`
- Regenerate: `docs/ai-categories/*.md`
- Regenerate: `docs/.vitepress/ai-pages-manifest.json`

- [ ] **Step 1: Write a failing generation integration test**

Create `tests/aiPageGeneration.test.ts`:

```ts
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

describe('AI page generation', () => {
  it('generates the complete static directory from the catalog', () => {
    execFileSync(process.execPath, ['scripts/generate-ai-pages.mjs'], {
      cwd: root,
      stdio: 'pipe'
    })

    const manifest = JSON.parse(readFileSync(
      resolve(root, 'docs/.vitepress/ai-pages-manifest.json'),
      'utf8'
    )) as string[]

    expect(manifest).toHaveLength(74)
    expect(manifest).toContain('docs/tools/chatgpt.md')
    expect(manifest).toContain('docs/tools/julius-ai.md')
    expect(manifest).toContain('docs/ai-categories/marketing.md')
    expect(manifest).toContain('docs/ai-categories/automation.md')
    expect(existsSync(resolve(root, 'docs/ai-categories/productivity.md'))).toBe(false)
  })
})
```

- [ ] **Step 2: Run the generator test and verify RED**

Run `npm.cmd test -- tests/aiPageGeneration.test.ts`; expect the old six-category manifest and incorrect count.

- [ ] **Step 3: Update generator labels and fail-fast validation**

Use the same nine category keys and Chinese labels as `aiTools.ts`. Extend `validateTools` to check every required field, allowed enum, HTTPS URL, safe/unique slug, valid alternatives, valid dates, unique positive `featuredOrder`, total `>= 60`, and at least five entries per category. Keep manifest-based deletion confined to resolved paths under `docs/tools` and `docs/ai-categories`.

Update generated copy so:

- Detail frontmatter remains unique and uses the tool description.
- Category index copy describes all nine scenes.
- Generated detail pages continue to contain exactly one `<ToolDetail slug="..." />`.
- Old `productivity.md` is removed through the previous manifest, not by broad filesystem deletion.
- Console output reports `Generated 63 tool pages and 9 category pages.`

- [ ] **Step 4: Regenerate the static source pages**

Run:

```powershell
npm.cmd run content:ai
```

Expected: `63` detail pages, `9` category pages, two index pages, and a 74-entry manifest.

- [ ] **Step 5: Run focused and full tests**

```powershell
npm.cmd test -- tests/aiPageGeneration.test.ts
npm.cmd test
```

Expected: generation and catalog tests PASS; `docs/ai-categories/productivity.md` remains absent.

- [ ] **Step 6: Commit generator and deterministic outputs**

```powershell
git add -- scripts/generate-ai-pages.mjs tests/aiPageGeneration.test.ts docs/tools docs/ai-categories docs/.vitepress/ai-pages-manifest.json
git commit -m "feat: generate expanded ai directory pages"
```

### Task 4: Extend the platform presentation model to nine categories

**Files:**
- Modify: `tests/directoryPresentation.test.ts`
- Modify: `docs/.vitepress/theme/domain/directoryPresentation.ts`

- [ ] **Step 1: Write failing presentation tests**

Replace the six-category expectation with all nine keys and add a dynamic scale assertion:

```ts
import {
  categoryVisuals,
  formatPlatformEyebrow,
  getToolVisual,
  platformHero
} from '../docs/.vitepress/theme/domain/directoryPresentation'

it('formats catalog scale from live data instead of fixed copy', () => {
  expect(formatPlatformEyebrow(63, 9)).toBe('63+ 款工具 · 9 大使用场景 · 持续维护')
})

it('gives all nine categories a complete visual identity', () => {
  const keys = [
    'chat', 'writing', 'image', 'video', 'coding',
    'audio', 'research', 'marketing', 'automation'
  ] as const
  expect(Object.keys(categoryVisuals)).toEqual(keys)
  expect(keys.every((key) => categoryVisuals[key].summary.length > 0)).toBe(true)
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run `npm.cmd test -- tests/directoryPresentation.test.ts`; expect missing categories and formatter.

- [ ] **Step 3: Implement dynamic copy and nine category visuals**

Keep the approved title, subtitle and two CTA actions. Remove the fixed `24+ / 6` eyebrow string and export:

```ts
export function formatPlatformEyebrow(toolCount: number, categoryCount: number): string {
  return `${toolCount}+ 款工具 · ${categoryCount} 大使用场景 · 持续维护`
}
```

Add nine complete `categoryVisuals` entries, reusing the current blue platform palette with distinct accent/soft pairs. Keep `getToolVisual` deterministic and code-native; unknown/new brands use initials plus their category palette, so no external logo request is introduced.

- [ ] **Step 4: Run the presentation and full tests**

```powershell
npm.cmd test -- tests/directoryPresentation.test.ts
npm.cmd test
```

Expected: all tests PASS.

- [ ] **Step 5: Commit the presentation model**

```powershell
git add -- tests/directoryPresentation.test.ts docs/.vitepress/theme/domain/directoryPresentation.ts
git commit -m "feat: extend ai category presentation"
```

### Task 5: Extract reusable filters and tool cards

**Files:**
- Create: `docs/.vitepress/theme/components/DirectoryFilters.vue`
- Create: `docs/.vitepress/theme/components/ToolCard.vue`
- Modify: `docs/.vitepress/theme/components/AiDirectory.vue`

- [ ] **Step 1: Create the exact `DirectoryFilters` component contract**

The component accepts `categories`, `category`, `pricingMode`, and `chineseSupport`. It emits `update:category`, `update:pricingMode`, `update:chineseSupport`, and `reset`. Render three native `<select>` controls, each with a visible `<label>`, plus one reset `<button type="button">`.

Use exported label maps rather than duplicating display strings. The option values are:

```ts
category: ['all', ...nine category keys]
pricingMode: ['all', 'free', 'freemium', 'paid', 'contact']
chineseSupport: ['all', 'native', 'partial', 'none']
```

Do not persist state or write it into the URL.

- [ ] **Step 2: Create the exact `ToolCard` component contract**

Accept a single required `tool: AiTool` prop. Render the code-native brand mark, name, category, tagline, short description, and only these two fact badges:

```vue
<span class="tool-fact-badge">{{ pricingModeLabels[tool.pricingMode] }}</span>
<span class="tool-fact-badge">{{ chineseSupportLabels[tool.chineseSupport] }}</span>
```

The card must link internally to `/tools/${tool.slug}` and must not open the official external URL, show ratings, or display more capability chips.

- [ ] **Step 3: Replace the inline card loop in `AiDirectory.vue`**

Import both new components, temporarily render `ToolCard` for the existing list, and leave filter orchestration for Task 6. This is a mechanical extraction: names, destinations and current results must remain unchanged.

- [ ] **Step 4: Verify compilation and current behavior**

Run:

```powershell
npm.cmd test
npm.cmd run docs:build
```

Expected: tests and build PASS; there are no Vue template/type errors.

- [ ] **Step 5: Commit the reusable components**

```powershell
git add -- docs/.vitepress/theme/components/DirectoryFilters.vue docs/.vitepress/theme/components/ToolCard.vue docs/.vitepress/theme/components/AiDirectory.vue
git commit -m "refactor: extract ai directory controls"
```

### Task 6: Recompose the homepage around discovery and a complete directory

**Files:**
- Modify: `docs/.vitepress/theme/components/AiDirectory.vue`

- [ ] **Step 1: Replace old `showAll` state with one filter state and one discovery state**

Use these state values and computed results:

```ts
const query = ref('')
const category = ref<CategoryFilter>('all')
const pricingMode = ref<PricingFilter>('all')
const chineseSupport = ref<ChineseSupportFilter>('all')
const activeDiscovery = ref<DiscoveryKind>('featured')
const visibleCount = ref(PAGE_SIZE)

const filteredTools = computed(() => filterTools({
  query: query.value,
  category: category.value,
  pricingMode: pricingMode.value,
  chineseSupport: chineseSupport.value
}))
const displayedTools = computed(() => paginateTools(filteredTools.value, visibleCount.value))
const discoveryTools = computed(() => getDiscoveryTools(activeDiscovery.value))
const hasMore = computed(() => displayedTools.value.length < filteredTools.value.length)
```

Watch all four search/filter refs and reset `visibleCount` to `PAGE_SIZE`. `resetFilters()` clears all four conditions. `loadMore()` adds exactly `PAGE_SIZE`.

- [ ] **Step 2: Render all three discovery routes**

Between the nine category grid and complete directory, add a light discovery section with exactly three button tabs:

```ts
[
  { value: 'featured', label: '编辑精选' },
  { value: 'latest', label: '最近收录' },
  { value: 'free', label: '免费可用' }
]
```

Use `aria-pressed` for active state and render six shared `ToolCard` instances. The free tab includes “免费版或免费额度以官网为准”。Do not call any tab “热门榜单” or show votes, stars or traffic.

- [ ] **Step 3: Render the complete directory and filters**

Always show `DirectoryFilters` above the directory grid. Display `共找到 ${filteredTools.length} 款工具`; render the first 12 with `ToolCard`; show “加载更多” only while `hasMore`; show a one-click reset in both the filter bar and empty state.

Clicking a category tile sets the category and scrolls to `#tool-directory` inside the click handler. Search remains local and covers the domain fields from Task 2. Escape in the search box clears the query only; the explicit reset clears all conditions.

- [ ] **Step 4: Replace every fixed catalog count**

Use `getAllTools().length`, `categories.length`, and `formatPlatformEyebrow(...)` for the hero and “查看全部” copy. No `24`, `6 categories`, or hard-coded result count may remain in `AiDirectory.vue`.

- [ ] **Step 5: Build and run a local smoke check**

Run:

```powershell
npm.cmd test
npm.cmd run docs:build
```

Expected: all tests and production build PASS. In local preview, the initial complete directory shows 12 of 63 while the discovery section shows six editorial picks.

- [ ] **Step 6: Commit homepage behavior**

```powershell
git add -- docs/.vitepress/theme/components/AiDirectory.vue
git commit -m "feat: add ai tool discovery experience"
```

### Task 7: Add complete structured facts to tool detail pages

**Files:**
- Modify: `docs/.vitepress/theme/components/ToolDetail.vue`

- [ ] **Step 1: Import and render the four fact groups**

Import `accessModeLabels`, `chineseSupportLabels`, and `pricingModeLabels`. Insert a four-item fact grid at the top of `.tool-detail-body`:

```vue
<section class="tool-facts" aria-label="工具基本信息">
  <div><span>价格模式</span><strong>{{ pricingModeLabels[tool.pricingMode] }}</strong></div>
  <div><span>中文支持</span><strong>{{ chineseSupportLabels[tool.chineseSupport] }}</strong></div>
  <div>
    <span>使用平台</span>
    <strong>{{ tool.accessModes.map((mode) => accessModeLabels[mode]).join('、') }}</strong>
  </div>
  <div><span>是否注册</span><strong>{{ tool.requiresAccount ? '需要注册' : '无需注册' }}</strong></div>
</section>
```

- [ ] **Step 2: Clarify verification language and retain link safety**

Change “更新于” to “最后核验”，retain the official-link `target="_blank" rel="noreferrer noopener"`, and keep the affiliate data slot dormant without any visible promotion claim. Do not create a second `<main>` landmark.

- [ ] **Step 3: Verify detail compilation and data flow**

Run:

```powershell
npm.cmd test
npm.cmd run docs:build
```

Expected: all 63 tool pages build; a detail page renders price, Chinese support, platform and registration without a duplicate data source.

- [ ] **Step 4: Commit detail facts**

```powershell
git add -- docs/.vitepress/theme/components/ToolDetail.vue
git commit -m "feat: enrich ai tool detail facts"
```

### Task 8: Extend the blue platform styles and accessibility checks

**Files:**
- Modify: `tests/accessibilityStyles.test.ts`
- Modify: `docs/.vitepress/theme/custom.css`

- [ ] **Step 1: Add failing contrast/style contract assertions**

Extend the existing CSS test so it requires the new controls and fact badges to use existing AA-safe tokens:

```ts
it('keeps new directory controls readable on light surfaces', () => {
  expect(rule('.directory-filter label')).toContain('color: var(--platform-muted-strong)')
  expect(rule('.directory-filter select')).toContain('color: var(--platform-ink)')
  expect(rule('.tool-fact-badge')).toContain('color: var(--platform-muted-strong)')
  expect(rule('.tool-facts strong')).toContain('color: var(--platform-ink)')
})
```

- [ ] **Step 2: Run the focused CSS test and verify RED**

Run `npm.cmd test -- tests/accessibilityStyles.test.ts`; expect missing selectors.

- [ ] **Step 3: Style the new layout without changing the visual identity**

Extend, rather than replace, the current blue platform system. Add focused rules for:

- Nine category cards: 3×3 desktop, two columns tablet, one column mobile.
- Discovery header/tabs and a six-card grid.
- Three visible filter labels, native selects, reset button, result count and load-more button.
- Two restrained fact badges per `ToolCard`.
- Four-column detail fact grid collapsing to two and then one column.
- `:focus-visible` outlines for tabs, selects, reset and load-more controls.
- Empty state and free-tier disclaimer.

At `max-width: 700px`, filters and cards become one column. At `max-width: 390px`, reduce padding but keep touch targets at least 44px. Retain the existing `prefers-reduced-motion` block and add no carousel or continuous animation.

- [ ] **Step 4: Run focused tests and build**

```powershell
npm.cmd test -- tests/accessibilityStyles.test.ts
npm.cmd test
npm.cmd run docs:build
```

Expected: contrast contracts, full test suite and production build PASS.

- [ ] **Step 5: Commit the responsive styles**

```powershell
git add -- tests/accessibilityStyles.test.ts docs/.vitepress/theme/custom.css
git commit -m "style: polish expanded ai directory"
```

### Task 9: Verify production artifacts and browser behavior

**Files:**
- Verify only: `docs/.vitepress/dist/**`
- Verify only: `docs/public/social-card.png`
- Modify only if verification exposes a scoped defect in the files above.

- [ ] **Step 1: Run clean automated verification**

```powershell
npm.cmd test
npm.cmd run docs:build
git diff --check
```

Expected: all tests PASS, VitePress build exits `0`, and `git diff --check` prints nothing.

- [ ] **Step 2: Verify exact production counts and SEO artifacts**

Run a read-only Node check over `docs/.vitepress/dist` and assert:

- 64 HTML files under `tools` including the index.
- 10 HTML files under `ai-categories` including the index.
- `/tools/chatgpt`, `/tools/julius-ai`, `/ai-categories/marketing`, and `/ai-categories/automation` occur in sitemap.
- Cultivation/archive routes do not occur in sitemap.
- `social-card.png` remains a 1200×630 PNG.
- ChatGPT detail HTML contains one `<main`, one unique title, description, and Open Graph title/description.

- [ ] **Step 3: Start or reuse the local VitePress server and verify desktop behavior**

In the in-app browser, check `http://127.0.0.1:5173/`:

- Hero reads `63+ 款工具 · 9 大使用场景 · 持续维护`.
- Nine category cards show truthful count `7`.
- Discovery tabs show the expected six items; “最近收录” is date/name deterministic; “免费可用” contains only free/freemium records and its disclaimer.
- Complete directory starts at 12, then 24 after one “加载更多” click.
- “会议纪要” finds Otter.ai; “去背景” finds remove.bg; a nonsense query shows a recoverable empty state.
- Category + price + Chinese filters combine and reset correctly.
- `/tools/claude` shows the four facts, “最后核验”, a safe official link, alternatives and no false rating/promotion.
- Browser console has no errors or warnings.

- [ ] **Step 4: Verify responsive and accessibility behavior**

At 390×844 and 320×700, confirm `document.documentElement.scrollWidth <= window.innerWidth`, filters and cards use one column, all controls remain operable, and no content is hidden behind the VitePress header. Use keyboard navigation to confirm visible focus and active discovery state.

- [ ] **Step 5: Audit git scope**

Run `git status --short --branch`. Expected: only intentional site changes, if any, are present; `五年级英语核心词汇_30天通关计划_中英对照版.docx` remains untracked and untouched; `cultivation-archive` remains intact.

- [ ] **Step 6: Commit only verification fixes, if any**

If browser/build verification required a scoped fix, rerun Steps 1–5 and commit only those files:

```powershell
git add -- docs/.vitepress/theme docs/.vitepress/ai-pages-manifest.json docs/tools docs/ai-categories scripts/generate-ai-pages.mjs tests
git commit -m "fix: complete ai directory verification"
```

Do not add the unrelated Word document and do not amend the cultivation archive branch.
