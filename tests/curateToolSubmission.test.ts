import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  AdminStatusUpdate,
  ClaimedSubmission,
  ContentDraft
} from '../shared/submissions/contracts'
import {
  CurationError,
  curateToolSubmission,
  runCurationOnce
} from '../scripts/submissions/curateToolSubmission.mjs'
import { createSubmissionClient } from '../scripts/submissions/submissionClient.mjs'

const sourceCatalog = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../docs/.vitepress/theme/domain/ai-tools.json'
)

const submission: ClaimedSubmission = {
  id: '0191f271-d0d1-7f15-80bb-9f7abf778999',
  publicRef: 'abcdefghijklm',
  name: 'Example Evidence AI',
  officialUrl: 'https://submitted.example/product',
  normalizedDomain: 'submitted.example',
  tagline: '把公开资料整理成可核验答案',
  description: '面向需要整理公开资料的研究团队。',
  category: 'research',
  bestFor: ['资料整理', '事实核验', '研究简报'],
  features: ['来源提取', '结构化摘要', '链接回溯'],
  pricingMode: 'freemium',
  chineseSupport: 'partial',
  accessModes: ['web'],
  status: 'processing',
  attemptCount: 1
}

const evidence = {
  finalUrl: submission.officialUrl,
  title: submission.name,
  metaDescription: 'Organize official evidence.',
  canonicalUrl: submission.officialUrl,
  visibleText: 'The product organizes public sources and keeps traceable links.'
}

const draft: ContentDraft = {
  slug: 'example-evidence-ai',
  description: '适合需要整理公开资料并回溯来源的团队，关键事实仍需人工核验。',
  bestFor: ['整理公开资料', '核对来源依据', '制作研究简报'],
  features: ['提取公开来源', '生成结构化摘要', '保留链接回溯'],
  pricing: '提供免费增值方案，具体额度和价格以官网为准',
  requiresAccount: true,
  tags: ['资料整理', '来源核验'],
  searchTerms: ['公开资料整理', '来源核验工具'],
  pros: ['来源脉络较清楚', '整理流程较直接'],
  cons: ['关键事实仍需人工核验', '高级额度可能收费']
}

function cloneDraft(overrides: Partial<ContentDraft> = {}): ContentDraft {
  return structuredClone({ ...draft, ...overrides })
}

function curationDeps(projectRoot: string, overrides: Record<string, unknown> = {}) {
  return {
    fetchOfficialPage: vi.fn(async () => evidence),
    enricher: { enrich: vi.fn(async () => cloneDraft()) },
    catalogPath: join(projectRoot, 'docs/.vitepress/theme/domain/ai-tools.json'),
    projectRoot,
    now: () => new Date('2026-08-27T09:30:00.000Z'),
    ...overrides
  }
}

function clientDouble(claimed: ClaimedSubmission | null = submission) {
  return {
    claimOne: vi.fn(async () => claimed),
    updateSubmission: vi.fn(async (_id: string, _update: AdminStatusUpdate) => undefined)
  }
}

describe('one-submission catalog curation', () => {
  let projectRoot: string
  let catalogPath: string

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), 'xunqi-curation-'))
    catalogPath = join(projectRoot, 'docs/.vitepress/theme/domain/ai-tools.json')
    mkdirSync(dirname(catalogPath), { recursive: true })
    copyFileSync(sourceCatalog, catalogPath)
  })

  afterEach(() => rmSync(projectRoot, { recursive: true, force: true }))

  it('exits cleanly without writes when the queue is empty', async () => {
    const client = clientDouble(null)
    const before = readFileSync(catalogPath, 'utf8')

    await expect(
      runCurationOnce({ client, ...curationDeps(projectRoot) })
    ).resolves.toEqual({ hasChanges: false })
    expect(client.claimOne).toHaveBeenCalledTimes(1)
    expect(client.updateSubmission).not.toHaveBeenCalled()
    expect(readFileSync(catalogPath, 'utf8')).toBe(before)
  })

  it('marks the row for enrichment and performs no fetch or write when AI is unconfigured', async () => {
    const client = clientDouble()
    const deps = curationDeps(projectRoot, { enricher: null })
    const before = readFileSync(catalogPath, 'utf8')

    await expect(runCurationOnce({ client, ...deps })).resolves.toEqual({
      hasChanges: false,
      submissionId: submission.id,
      submissionRef: submission.publicRef
    })
    expect(client.updateSubmission).toHaveBeenCalledWith(submission.id, {
      status: 'needs_enrichment',
      errorCode: 'enricher_unconfigured'
    })
    expect(deps.fetchOfficialPage).not.toHaveBeenCalled()
    expect(readFileSync(catalogPath, 'utf8')).toBe(before)
  })

  it.each([
    ['domain', { officialUrl: 'https://chatgpt.com/new', normalizedDomain: 'chatgpt.com' }, cloneDraft()],
    ['slug', {}, cloneDraft({ slug: 'chatgpt' })]
  ])('rejects a duplicate %s before changing the catalog', async (_kind, inputChanges, content) => {
    const before = readFileSync(catalogPath, 'utf8')
    const deps = curationDeps(projectRoot, {
      enricher: { enrich: vi.fn(async () => content) }
    })

    await expect(
      curateToolSubmission({ ...submission, ...inputChanges }, deps)
    ).rejects.toMatchObject({
      name: 'CurationError',
      code: 'duplicate_catalog_entry',
      statusUpdate: {
        status: 'needs_info',
        publicMessage: '官网或工具标识与现有目录重复，请补充说明。'
      }
    })
    expect(readFileSync(catalogPath, 'utf8')).toBe(before)
  })

  it('records a finite official-fetch error and leaves the catalog unchanged', async () => {
    const client = clientDouble()
    const fetchError = Object.assign(new Error('private socket detail'), {
      code: 'official_fetch_rejected'
    })
    const before = readFileSync(catalogPath, 'utf8')

    await expect(
      runCurationOnce({
        client,
        ...curationDeps(projectRoot, {
          fetchOfficialPage: vi.fn(async () => { throw fetchError })
        })
      })
    ).rejects.toBe(fetchError)
    expect(client.updateSubmission).toHaveBeenCalledWith(submission.id, {
      status: 'error',
      errorCode: 'official_fetch_rejected'
    })
    expect(readFileSync(catalogPath, 'utf8')).toBe(before)
  })

  it('validates and atomically adds one non-featured tool with two same-category alternatives', async () => {
    const before = JSON.parse(readFileSync(catalogPath, 'utf8')) as Array<Record<string, unknown>>

    const result = await curateToolSubmission(submission, curationDeps(projectRoot))
    const after = JSON.parse(readFileSync(catalogPath, 'utf8')) as Array<Record<string, unknown>>
    const added = after.find(({ slug }) => slug === draft.slug)!

    expect(result).toMatchObject({
      hasChanges: true,
      submissionId: submission.id,
      submissionRef: submission.publicRef,
      slug: draft.slug,
      branch: `submission/${submission.publicRef}-${draft.slug}`,
      prTitle: `收录 ${submission.name}`,
      prBody: expect.any(String)
    })
    expect(after).toHaveLength(before.length + 1)
    expect(added).toMatchObject({
      ...draft,
      name: submission.name,
      category: submission.category,
      tagline: submission.tagline,
      pricingMode: submission.pricingMode,
      chineseSupport: submission.chineseSupport,
      accessModes: submission.accessModes,
      url: submission.officialUrl,
      addedAt: '2026-08-27',
      updatedAt: '2026-08-27',
      alternatives: expect.any(Array)
    })
    expect(added).not.toHaveProperty('featuredOrder')
    expect(added.alternatives).toHaveLength(2)
    expect(new Set(added.alternatives as string[]).size).toBe(2)
    const alternatives = after.filter(({ slug }) =>
      (added.alternatives as string[]).includes(slug as string)
    )
    expect(alternatives.every(({ category }) => category === submission.category)).toBe(true)
    expect(added.alternatives).not.toContain(draft.slug)
    expect(readFileSync(join(projectRoot, `docs/tools/${draft.slug}.md`), 'utf8')).toContain(
      `<ToolDetail slug="${draft.slug}" />`
    )
  })

  it('does not append a second tool when the same claimed submission is rerun', async () => {
    await curateToolSubmission(submission, curationDeps(projectRoot))
    const once = readFileSync(catalogPath, 'utf8')

    await expect(
      curateToolSubmission(submission, curationDeps(projectRoot))
    ).rejects.toBeInstanceOf(CurationError)
    expect(readFileSync(catalogPath, 'utf8')).toBe(once)
    const tools = JSON.parse(once) as Array<{ slug: string }>
    expect(tools.filter(({ slug }) => slug === draft.slug)).toHaveLength(1)
  })

  it('keeps secrets and raw model data out of outputs while naming every human check', async () => {
    const sensitiveInput = {
      ...submission,
      publicCode: 'private-query-code',
      publicCodeHash: 'private-code-hash',
      contactEmail: 'owner@example.com',
      ipHash: 'private-ip-hash',
      adminToken: 'private-admin-token',
      rawModelResponse: 'private-model-output'
    }

    const result = await curateToolSubmission(sensitiveInput as never, curationDeps(projectRoot))
    const output = JSON.stringify(result)

    expect(result.prBody).toContain(submission.publicRef)
    expect(result.prBody).toContain('人工核验清单')
    for (const item of [
      '官方域名',
      '定价措辞',
      '中文支持',
      'Logo / 品牌素材使用权',
      '分类',
      '使用场景',
      '核心能力',
      '优点 / 限制',
      '两个替代工具',
      '商业标注隔离',
      '目录校验、测试与生产构建'
    ]) expect(result.prBody).toContain(item)
    expect(output).not.toMatch(
      /private-query-code|private-code-hash|owner@example\.com|private-ip-hash|private-admin-token|private-model-output/
    )
  })

  it('does not touch the real catalog when candidate generation rejects the draft', async () => {
    const before = readFileSync(catalogPath, 'utf8')
    const invalidDraft = cloneDraft({ searchTerms: ['english only', 'also english'] })

    await expect(
      curateToolSubmission(
        submission,
        curationDeps(projectRoot, {
          enricher: { enrich: vi.fn(async () => invalidDraft) }
        })
      )
    ).rejects.toMatchObject({ code: 'catalog_validation_failed' })
    expect(readFileSync(catalogPath, 'utf8')).toBe(before)
  })
})

describe('submission automation API client', () => {
  it('claims exactly one item and sends strict bearer-protected status updates', async () => {
    const fetchStub = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ submissions: [submission] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }))
    const client = createSubmissionClient({
      baseUrl: 'https://directory.example/',
      adminToken: 'admin-token',
      fetch: fetchStub as typeof fetch
    })

    await expect(client.claimOne()).resolves.toEqual(submission)
    await client.updateSubmission(submission.publicRef, {
      status: 'pr_open',
      prUrl: 'https://github.com/example/directory/pull/42'
    })

    expect(fetchStub.mock.calls[0]).toEqual([
      'https://directory.example/api/admin/submissions/claim',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ limit: 1 })
      })
    ])
    expect(fetchStub.mock.calls[1]).toEqual([
      `https://directory.example/api/admin/submissions/${submission.publicRef}`,
      expect.objectContaining({
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer admin-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'pr_open',
          prUrl: 'https://github.com/example/directory/pull/42'
        })
      })
    ])
  })

  it('fails closed on unsafe base URLs and malformed claim responses', async () => {
    expect(() => createSubmissionClient({
      baseUrl: 'http://directory.example',
      adminToken: 'admin-token',
      fetch: vi.fn() as never
    })).toThrow('invalid_submission_api_base')

    const client = createSubmissionClient({
      baseUrl: 'https://directory.example',
      adminToken: 'admin-token',
      fetch: vi.fn(async () => new Response(JSON.stringify({
        submissions: [{ ...submission, contactEmail: 'must-not-pass@example.com' }]
      }), { status: 200 })) as never
    })
    await expect(client.claimOne()).rejects.toThrow('invalid_claim_response')
  })
})

describe('trusted PR workflows', () => {
  it('uses pinned actions, one-at-a-time scheduling, full gates, and no auto-merge', () => {
    const workflow = readFileSync(
      resolve(dirname(sourceCatalog), '../../../../.github/workflows/curate-tool-submission.yml'),
      'utf8'
    )

    expect(workflow).toContain("cron: '17 */6 * * *'")
    expect(workflow).toContain('group: curate-tool-submission')
    expect(workflow).toContain('cancel-in-progress: false')
    expect(workflow).toContain('actions/checkout@11d5960a326750d5838078e36cf38b85af677262')
    expect(workflow).toContain('actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020')
    expect(workflow).toContain('npm ci')
    expect(workflow).toContain('npm test')
    expect(workflow).toContain('npm run verify:build')
    expect(workflow).toContain('git diff --check')
    expect(workflow).toContain('gh pr create')
    expect(workflow).not.toMatch(/auto-merge|gh pr merge|push[^\n]*\bmain\b/)
  })

  it('syncs closed PR status without checking out or executing pull-request code', () => {
    const workflow = readFileSync(
      resolve(dirname(sourceCatalog), '../../../../.github/workflows/sync-tool-submission-pr.yml'),
      'utf8'
    )

    expect(workflow).toContain('pull_request:')
    expect(workflow).toContain('types: [closed]')
    expect(workflow).toContain('github.event.pull_request.head.repo.full_name == github.repository')
    expect(workflow).toContain('submission/')
    expect(workflow).not.toContain('actions/checkout')
    expect(workflow).not.toMatch(/npm |node |\.\//)
    expect(workflow).toContain('经人工审核暂未收录')
  })
})
