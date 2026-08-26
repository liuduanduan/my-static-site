# AI Directory Platform Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有“寻器”目录改造成文章参考图风格的蓝色 AI 平台首页，同时保留搜索、分类、详情页和 SEO 能力。

**Architecture:** 新增纯 TypeScript 展示模型，集中管理首屏文案、分类图标和工具品牌标记；Vue 组件只负责状态与渲染；CSS 重写为平台视觉体系。数据、搜索逻辑和静态页面生成保持不变。

**Tech Stack:** VitePress、Vue 3、TypeScript、Vitest、原生 CSS。

---

### Task 1: Add the visual presentation model

**Files:**
- Create: `docs/.vitepress/theme/domain/directoryPresentation.ts`
- Create: `tests/directoryPresentation.test.ts`

- [ ] **Step 1: Write failing tests for the platform presentation contract**

Test that the hero contains the approved title and two CTA links, all six categories have distinct icon/color metadata, known tools receive stable brand initials, and unknown tools receive a deterministic fallback.

- [ ] **Step 2: Run the focused test and verify RED**

Run `npm.cmd test -- tests/directoryPresentation.test.ts`; expect module resolution to fail because the presentation model does not exist.

- [ ] **Step 3: Implement the minimal presentation model**

Export `platformHero`, `categoryVisuals`, and `getToolVisual(name, category)` using static code-native values and no external assets.

- [ ] **Step 4: Run focused and full tests**

Run `npm.cmd test -- tests/directoryPresentation.test.ts` followed by `npm.cmd test`; expect all tests to pass.

### Task 2: Rebuild the homepage composition

**Files:**
- Modify: `docs/.vitepress/theme/components/AiDirectory.vue`
- Modify: `docs/.vitepress/config.ts`

- [ ] **Step 1: Consume the presentation model**

Render the approved hero title, subtitle, two CTA links, search field, six category tiles, tool brand marks and use-case chips from the existing tool data.

- [ ] **Step 2: Preserve directory behavior**

Keep initial six featured tools, 24-tool browse-all behavior, query matching, category filtering, reset behavior and all existing accessible names.

- [ ] **Step 3: Add the submission navigation entry**

Add a `提交工具` navigation link to `/about#更新建议`; it must remain a normal link and must not imply a working submission form.

- [ ] **Step 4: Verify rendering behavior in the browser**

Check that the initial view shows six cards, each category shows four, “全部” shows 24, and a search for “会议纪要” shows Otter.ai.

### Task 3: Apply the platform visual system

**Files:**
- Modify: `docs/.vitepress/theme/custom.css`
- Modify: `docs/.vitepress/theme/components/ToolDetail.vue`

- [ ] **Step 1: Replace the homepage visual rules**

Create a full-width blue gradient hero, white navigation treatment, floating search, colored category tiles, white tool cards, responsive grids and accessible focus states.

- [ ] **Step 2: Restyle tool detail pages**

Add the same brand mark and platform color language to the detail header while preserving content, links and a single main landmark.

- [ ] **Step 3: Validate responsive layouts**

At 390x844 and 320x700, verify `document.documentElement.scrollWidth <= window.innerWidth`; check desktop layout at the default viewport.

### Task 4: Verify and commit the redesign

**Files:**
- Modify: `docs/public/social-card.svg`
- Modify: `docs/public/social-card.png`

- [ ] **Step 1: Refresh the social share card**

Match the new blue platform identity while preserving the existing 1200x630 PNG output and per-page dynamic Open Graph title/description.

- [ ] **Step 2: Run all automated verification**

Run `npm.cmd test`, `npm.cmd run docs:build`, validate 25 tool HTML files, 7 category HTML files, one main landmark, unique ChatGPT Open Graph metadata and the social PNG artifact.

- [ ] **Step 3: Run browser verification**

Check the homepage, a filtered category, search result, detail page, desktop viewport, 390px viewport, 320px viewport and browser console.

- [ ] **Step 4: Commit the redesign**

Commit only site files and keep the user's unrelated Word document untracked.
