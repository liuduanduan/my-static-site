# AI Tools Directory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有 VitePress 站点改造成一个可搜索、可收录、可预留变现入口的中文 AI 工具目录 MVP。

**Architecture:** 工具数据以 JSON 为单一事实来源；Vue 首页负责搜索、筛选和卡片交互；Node 脚本根据同一数据生成工具详情页和分类页。VitePress 继续负责静态构建，旧内容文件保留但不进入导航和构建范围。

**Tech Stack:** VitePress 1.x、Vue 3、TypeScript、Vitest、原生 CSS、Node.js 脚本。

---

### Task 1: Replace site metadata and home shell

**Files:**
- Modify: `docs/index.md`
- Modify: `docs/.vitepress/config.ts`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/about.md`
- Modify: `docs/privacy.md`

- [ ] **Step 1: Set Chinese AI directory metadata**

Replace the old Yuji frontmatter and navigation with the new title, description, `/about` and `/privacy` links, and keep all legacy directories in `srcExclude`.

- [ ] **Step 2: Register the directory components**

Register `AiDirectory` and `ToolDetail` globally from the VitePress theme entry.

- [ ] **Step 3: Make the home page render only the directory**

Use `layout: page`, `pageClass: ai-home`, and `<AiDirectory />` without legacy Markdown content.

- [ ] **Step 4: Add concise about and privacy pages**

Document manual curation, official links, price disclaimer, future affiliate disclosure, local-only search state, and contact-free operation.

- [ ] **Step 5: Run the static build**

Run `npm run docs:build` and expect a successful VitePress build after the remaining components are added.

### Task 2: Add the tool data model and curated seed data

**Files:**
- Create: `docs/.vitepress/theme/domain/ai-tools.json`
- Create: `docs/.vitepress/theme/domain/aiTools.ts`
- Create: `tests/aiTools.test.ts`

- [ ] **Step 1: Define the JSON schema**

Use fields `slug`, `name`, `category`, `tagline`, `description`, `bestFor`, `features`, `pricing`, `pros`, `cons`, `url`, `updatedAt`, and `alternatives`.

- [ ] **Step 2: Seed 24 tools**

Include four tools each across writing, image, video, coding, productivity, and audio. Use official URLs only, concise manually written descriptions, and pricing wording that ends with “以官网为准”.

- [ ] **Step 3: Add typed selectors**

Implement `getAllTools()`, `getToolBySlug()`, `getCategoryLabel()`, `getCategories()`, and `searchTools(query, category)` with case-insensitive matching over name, tagline, description, bestFor, and feature text.

- [ ] **Step 4: Write failing selector tests first**

Cover category counts, slug lookup, empty query behavior, name matching, description matching, category filtering, and no-result behavior.

- [ ] **Step 5: Run focused tests**

Run `npm test -- tests/aiTools.test.ts`; expect all selector tests to pass.

### Task 3: Build the searchable homepage experience

**Files:**
- Create: `docs/.vitepress/theme/components/AiDirectory.vue`
- Modify: `docs/.vitepress/theme/custom.css`

- [ ] **Step 1: Add accessible search and category controls**

Use a labeled search input, a category button group with `aria-pressed`, result count, and a clear-search action that appears only when filters are active.

- [ ] **Step 2: Render curated and filtered cards**

Show six featured cards before a query and all matching cards after filtering. Each card links to `/tools/<slug>` and includes category, name, tagline, pricing, and a single “查看详情” action.

- [ ] **Step 3: Add an empty state**

When no tools match, show the query and a one-click reset without exposing raw implementation details.

- [ ] **Step 4: Add monetization-safe outbound markers**

Keep official links on cards and include `data-affiliate-slot="tool-directory"` on the outbound action container, without adding unconfirmed affiliate IDs.

- [ ] **Step 5: Add responsive styles**

Implement a restrained editorial layout with a max-width shell, cream background, navy text, cobalt accent, compact cards, and single-column mobile layout at 760px and 390px.

- [ ] **Step 6: Add component tests**

Mount the component and verify initial cards, category filtering, text search, result count, no-result state, and link targets.

### Task 4: Generate SEO detail and category pages

**Files:**
- Create: `scripts/generate-ai-pages.mjs`
- Create: `docs/.vitepress/theme/components/ToolDetail.vue`
- Create: `docs/tools/index.md`
- Create: `docs/ai-categories/index.md`
- Modify: `package.json`

- [ ] **Step 1: Implement deterministic page generation**

Read the JSON file with `fs`, escape Markdown-sensitive values, generate one `docs/tools/<slug>.md` per tool, and generate one `docs/ai-categories/<category>.md` per category. Remove only previously generated files listed by the script manifest; never delete unrelated legacy content.

- [ ] **Step 2: Create the detail component**

Read the route slug from the page-provided prop and render a summary, best-for list, features, pricing notice, pros/cons, alternatives, official link, and a short disclosure.

- [ ] **Step 3: Generate index pages**

Create directory and category index Markdown with links to generated pages, preserving stable ordering by category then name.

- [ ] **Step 4: Wire the generation command**

Add `content:ai: node scripts/generate-ai-pages.mjs` and run it before `docs:build` in the package scripts.

- [ ] **Step 5: Verify generated routes**

Run `npm run content:ai`, inspect generated files for all seed slugs, and run `npm run docs:build` to confirm static output and sitemap generation.

### Task 5: Verify, document, and commit the MVP

**Files:**
- Modify: `README.md`
- Modify: `DEPLOY.md`

- [ ] **Step 1: Document local development and content updates**

Explain `npm run docs:dev`, `npm run content:ai`, the JSON fields, and the requirement to manually review pages before publishing.

- [ ] **Step 2: Run all tests**

Run `npm test` and expect the existing boundary/history tests plus new AI directory tests to pass.

- [ ] **Step 3: Run production build**

Run `npm run docs:build` and verify the generated `docs/.vitepress/dist/tools` and `docs/.vitepress/dist/ai-categories` trees exist.

- [ ] **Step 4: Inspect the local site**

Run `npm run docs:dev`, open the local URL, and check desktop plus 390px mobile layout for overflow, search behavior, detail links, and disclosure text.

- [ ] **Step 5: Commit the finished change**

Run `git add docs scripts tests package.json README.md DEPLOY.md` and commit with `feat: turn site into ai tools directory`.
