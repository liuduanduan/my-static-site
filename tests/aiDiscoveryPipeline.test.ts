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
import { parseGroundedDiscoveryDraft } from '../scripts/discovery/discoveryDraft.mjs'
import { runDiscovery } from '../scripts/discovery/runDiscovery.mjs'
import { runDiscoveryFromEnvironment } from '../scripts/run-ai-discovery.mjs'

const sourceCatalog = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/.vitepress/theme/domain/ai-tools.json')
const sourceScenarios = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/.vitepress/theme/domain/ai-scenarios.json')
const sourceConfig = resolve(dirname(fileURLToPath(import.meta.url)), '../config/ai-discovery-sources.json')
const now = () => new Date('2026-09-03T00:00:00.000Z')

function config(overrides: Record<string, number> = {}) {
  return {
    version: 1,
    limits: { sourceRecords: 50, newDomains: 15, publishPerRun: 3, catalogMaximum: 300, ...overrides },
    sources: [{ id: 'fixture-feed', kind: 'feed', enabled: true, url: 'https://feed.example.com/discovery.json', score: 50 }]
  }
}

function candidate(name: string, url: string, sourceScore = 50) {
  return {
    name,
    url,
    sourceId: 'fixture-feed',
    sourceKind: 'feed',
    discoveredAt: '2026-09-02T00:00:00.000Z',
    sourceScore
  }
}

function evidence(url: string, name = 'Useful AI') {
  return {
    finalUrl: url,
    selectedOfficialUrl: url,
    title: `${name} AI web app`,
    metaDescription: 'An artificial intelligence product for research teams.',
    visibleText: `${name} is an artificial intelligence web app for research teams. It organizes public sources, creates structured notes, and helps trace source evidence. It has a free plan and paid plans. It supports Chinese translation. Sign up is required. ${'Public product information for research workflows. '.repeat(8)}`
  }
}

function draft(slug = 'useful-ai', name = 'Useful AI') {
  return {
    slug,
    name,
    category: 'research',
    tagline: '帮助研究团队整理公开资料和可核验结论',
    description: '这是一款面向研究团队的 AI 工具，可帮助整理公开资料、形成结构化笔记并保留人工核验流程。',
    bestFor: ['整理公开资料', '构建研究笔记', '核对资料来源'],
    features: ['研究资料整理', '结构化笔记', '来源回溯'],
    pricing: '提供免费和付费方案；具体套餐以官网为准',
    pricingMode: 'freemium',
    chineseSupport: 'partial',
    accessModes: ['web'],
    requiresAccount: true,
    tags: ['资料整理', '研究笔记'],
    searchTerms: ['研究资料整理', '公开资料笔记'],
    pros: ['公开资料整理流程直接', '方便回到来源人工核验'],
    cons: ['关键事实仍需人工核验', '完整能力依赖账户方案']
  }
}

function groundedDraft(value: ReturnType<typeof draft>, proof: ReturnType<typeof evidence>) {
  const citation = proof.visibleText.slice(0, 390).trim()
  return parseGroundedDiscoveryDraft({
    draft: value,
    citations: {
      name: proof.title,
      tagline: citation,
      description: citation,
      bestFor: value.bestFor.map(() => citation),
      features: value.features.map(() => citation),
      pricing: citation,
      tags: value.tags.map(() => citation),
      searchTerms: value.searchTerms.map(() => citation),
      pros: value.pros.map(() => citation),
      cons: value.cons.map(() => citation)
    }
  }, proof)
}

function emptyState() {
  return { version: 1, outcomes: [] }
}

describe('automatic AI discovery pipeline', () => {
  let projectRoot: string
  let catalogPath: string

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), 'xunqi-discovery-pipeline-'))
    catalogPath = join(projectRoot, 'docs/.vitepress/theme/domain/ai-tools.json')
    mkdirSync(dirname(catalogPath), { recursive: true })
    copyFileSync(sourceCatalog, catalogPath)
    copyFileSync(sourceScenarios, join(dirname(catalogPath), 'ai-scenarios.json'))
  })

  afterEach(() => rmSync(projectRoot, { recursive: true, force: true }))

  it('publishes only accepted candidates and dry runs without changing the catalog', async () => {
    const candidates = [
      candidate('Useful AI', 'https://useful-ai.com/'),
      candidate('Duplicate', 'https://chatgpt.com/'),
      candidate('Thin page', 'https://thin-page.com/')
    ]
    const discoverFromSources = vi.fn(async () => ({ candidates, errors: [] }))
    const fetchOfficialPage = vi.fn(async (url: string) => url.includes('thin-page')
      ? { ...evidence(url, 'Thin page'), visibleText: 'AI' }
      : evidence(`${url.replace(/\/$/u, '')}/product`, url.includes('useful') ? 'Useful AI' : 'Duplicate'))
    const enricher = { enrich: vi.fn(async (_input, proof) => groundedDraft(draft(), proof)) }
    const before = readFileSync(catalogPath, 'utf8')

    const dryRun = await runDiscovery({
      config: config(), state: emptyState(), catalogPath, projectRoot,
      discoverFromSources, fetchOfficialPage, enricher, dryRun: true, now
    })

    expect(dryRun.published.map(({ slug }) => slug)).toEqual(['useful-ai'])
    expect(dryRun.review.map(({ errorCode }) => errorCode)).toEqual([
      'duplicate_catalog_entry', 'insufficient_official_evidence'
    ])
    expect(readFileSync(catalogPath, 'utf8')).toBe(before)

    const result = await runDiscovery({
      config: config(), state: emptyState(), catalogPath, projectRoot,
      discoverFromSources, fetchOfficialPage, enricher, dryRun: false, now
    })

    expect(result.published.map(({ slug }) => slug)).toEqual(['useful-ai'])
    expect(result.review.map(({ errorCode }) => errorCode)).toEqual([
      'duplicate_catalog_entry', 'insufficient_official_evidence'
    ])
    expect(dryRun.changedUrls).toEqual(['https://no996noicu.com/tools/useful-ai'])
    expect(result.changedUrls).toEqual(['https://no996noicu.com/tools/useful-ai'])
    expect(JSON.parse(readFileSync(catalogPath, 'utf8'))).toHaveLength(121)
  })

  it('bounds fetches and publications, skips terminal and cooled candidates, and handles an unconfigured enricher', async () => {
    const candidates = Array.from({ length: 16 }, (_, index) => candidate(
      `Useful ${index}`,
      `https://useful-${index}.com/`,
      100 - index
    ))
    const fetchOfficialPage = vi.fn(async (url: string) => {
      const suffix = /useful-(\d+)\.com/u.exec(url)?.[1]
      return evidence(`${url.replace(/\/$/u, '')}/product`, suffix === undefined ? 'Useful AI' : `Useful ${suffix}`)
    })
    const enricher = { enrich: vi.fn(async (input: { name: string }, proof) => {
      const suffix = input.name.replace(/^Useful\s+/u, '')
      return groundedDraft(draft(`useful-${suffix}`, input.name), proof)
    }) }

    const limited = await runDiscovery({
      config: config(), state: emptyState(), catalogPath, projectRoot,
      discoverFromSources: async () => ({ candidates, errors: [] }), fetchOfficialPage, enricher, now
    })
    expect(fetchOfficialPage).toHaveBeenCalledTimes(15)
    expect(limited.published).toHaveLength(3)
    expect(limited.nextState.outcomes.filter(({ errorCode }) => errorCode === 'publish_limit_reached')).toEqual([])

    const before = readFileSync(catalogPath, 'utf8')
    const publishedState = {
      version: 1,
      outcomes: [{
        key: 'already-published.com', status: 'published', errorCode: null,
        processedAt: '2026-09-02T00:00:00.000Z', fingerprint: 'a'.repeat(64)
      }]
    }
    const skippedFetch = vi.fn(async (url: string) => evidence(url))
    const skipped = await runDiscovery({
      config: config(), state: publishedState, catalogPath, projectRoot,
      discoverFromSources: async () => ({ candidates: [candidate('Already published', 'https://already-published.com/')], errors: [] }),
      fetchOfficialPage: skippedFetch, enricher: null, now
    })
    expect(skippedFetch).not.toHaveBeenCalled()
    expect(skipped.published).toEqual([])
    expect(skipped.changedUrls).toEqual([])
    expect(readFileSync(catalogPath, 'utf8')).toBe(before)

    const cooledState = {
      version: 1,
      outcomes: [0, 1, 2].map((day) => ({
        key: 'cooled.com', status: 'failed', errorCode: 'official_fetch_failed',
        processedAt: `2026-09-0${day + 1}T00:00:00.000Z`, fingerprint: 'b'.repeat(64)
      }))
    }
    const cooledFetch = vi.fn(async (url: string) => evidence(url))
    await runDiscovery({
      config: config(), state: cooledState, catalogPath, projectRoot,
      discoverFromSources: async () => ({ candidates: [candidate('Cooled', 'https://cooled.com/')], errors: [] }),
      fetchOfficialPage: cooledFetch, enricher: { enrich: vi.fn() }, now
    })
    expect(cooledFetch).not.toHaveBeenCalled()

    const unconfigured = await runDiscovery({
      config: config(), state: emptyState(), catalogPath, projectRoot,
      discoverFromSources: async () => ({ candidates: [candidate('Needs enrichment', 'https://needs-enrichment.com/')], errors: [] }),
      fetchOfficialPage: vi.fn(), enricher: null, now
    })
    expect(unconfigured.review).toEqual([expect.objectContaining({ errorCode: 'enricher_unconfigured' })])
    expect(unconfigured.published).toEqual([])
    expect(unconfigured.nextState.outcomes).toEqual([])
  })

  it('excludes catalog-known domains before the 15-domain inspection limit', async () => {
    const catalogDomains = (JSON.parse(readFileSync(catalogPath, 'utf8')) as Array<{ url: string }>)
      .slice(0, 16)
      .map(({ url }, index) => candidate(`Catalog duplicate ${index}`, url))
    const newCandidate = candidate('Actually new', 'https://zzzz-new.com/')
    const fetchOfficialPage = vi.fn(async (url: string) => evidence(
      `${url.replace(/\/$/u, '')}/product`,
      'Actually new'
    ))
    const enricher = {
      enrich: vi.fn(async (_input, proof) => groundedDraft(draft('actually-new', 'Actually new'), proof))
    }

    const result = await runDiscovery({
      config: config(), state: emptyState(), catalogPath, projectRoot,
      discoverFromSources: async () => ({ candidates: [...catalogDomains, newCandidate], errors: [] }),
      fetchOfficialPage, enricher, now
    })

    expect(fetchOfficialPage).toHaveBeenCalledTimes(1)
    expect(fetchOfficialPage).toHaveBeenCalledWith('https://zzzz-new.com/')
    expect(fetchOfficialPage.mock.calls.flat()).not.toEqual(expect.arrayContaining(catalogDomains.map(({ url }) => url)))
    expect(result.published.map(({ slug }) => slug)).toEqual(['actually-new'])
  })

  it('does not publish at the catalog maximum and preserves the catalog when batch mutation fails', async () => {
    const candidateInput = candidate('Useful AI', 'https://maximum.com/')
    const before = readFileSync(catalogPath, 'utf8')
    const maximum = await runDiscovery({
      config: config({ catalogMaximum: 120 }), state: emptyState(), catalogPath, projectRoot,
      discoverFromSources: async () => ({ candidates: [candidateInput], errors: [] }),
      fetchOfficialPage: vi.fn(), enricher: null, now
    })
    expect(maximum.published).toEqual([])
    expect(maximum.review).toEqual([expect.objectContaining({ errorCode: 'catalog_maximum_reached' })])
    expect(maximum.nextState.outcomes).toEqual([])
    expect(readFileSync(catalogPath, 'utf8')).toBe(before)

    await expect(runDiscovery({
      config: config(), state: emptyState(), catalogPath, projectRoot,
      discoverFromSources: async () => ({ candidates: [candidateInput], errors: [] }),
      fetchOfficialPage: async (url: string) => evidence(`${url.replace(/\/$/u, '')}/product`),
      enricher: { enrich: async (_input, proof) => groundedDraft(draft(), proof) },
      appendCatalogTools: () => { throw Object.assign(new Error('catalog_validation_failed'), { code: 'catalog_validation_failed' }) },
      now
    })).rejects.toThrow('catalog_validation_failed')
    expect(readFileSync(catalogPath, 'utf8')).toBe(before)
  })

  it('retries transient official fetch failures twice with deterministic exponential backoff', async () => {
    const input = candidate('Retry AI', 'https://retry-ai.com/')
    const transient = () => Object.assign(new Error('private transport detail'), {
      code: 'official_fetch_failed'
    })
    const fetchOfficialPage = vi.fn()
      .mockRejectedValueOnce(transient())
      .mockRejectedValueOnce(transient())
      .mockResolvedValueOnce(evidence('https://retry-ai.com/product', 'Retry AI'))
    const sleep = vi.fn(async () => undefined)

    const result = await runDiscovery({
      config: config(), state: emptyState(), catalogPath, projectRoot,
      discoverFromSources: async () => ({ candidates: [input], errors: [] }),
      fetchOfficialPage,
      enricher: {
        enrich: async (_input, proof) => groundedDraft(draft('retry-ai', 'Retry AI'), proof)
      },
      sleep,
      now
    })

    expect(result.published.map(({ slug }) => slug)).toEqual(['retry-ai'])
    expect(fetchOfficialPage).toHaveBeenCalledTimes(3)
    expect(sleep.mock.calls).toEqual([[250], [500]])
  })

  it('stops transient official fetch retries after three total attempts', async () => {
    const input = candidate('Exhausted AI', 'https://exhausted-ai.com/')
    const fetchOfficialPage = vi.fn(async () => {
      throw Object.assign(new Error('private transport detail'), { code: 'official_fetch_failed' })
    })
    const sleep = vi.fn(async () => undefined)

    const result = await runDiscovery({
      config: config(), state: emptyState(), catalogPath, projectRoot,
      discoverFromSources: async () => ({ candidates: [input], errors: [] }),
      fetchOfficialPage, enricher: { enrich: vi.fn() }, sleep, now
    })

    expect(result.review.map(({ errorCode }) => errorCode)).toEqual(['official_fetch_failed'])
    expect(fetchOfficialPage).toHaveBeenCalledTimes(3)
    expect(sleep.mock.calls).toEqual([[250], [500]])
  })

  it('never retries rejected official fetches or deterministic evidence-gate failures', async () => {
    const rejectedUrl = 'https://rejected-ai.com/'
    const thinUrl = 'https://thin-evidence-ai.com/'
    const fetchOfficialPage = vi.fn(async (url: string) => {
      if (url === rejectedUrl) {
        throw Object.assign(new Error('private rejection detail'), { code: 'official_fetch_rejected' })
      }
      return { ...evidence(url, 'Thin Evidence AI'), visibleText: 'AI' }
    })
    const sleep = vi.fn(async () => undefined)

    const result = await runDiscovery({
      config: config(), state: emptyState(), catalogPath, projectRoot,
      discoverFromSources: async () => ({
        candidates: [
          candidate('Rejected AI', rejectedUrl, 60),
          candidate('Thin Evidence AI', thinUrl, 50)
        ],
        errors: []
      }),
      fetchOfficialPage, enricher: { enrich: vi.fn() }, sleep, now
    })

    expect(result.review.map(({ errorCode }) => errorCode)).toEqual([
      'official_fetch_rejected',
      'insufficient_official_evidence'
    ])
    expect(fetchOfficialPage.mock.calls.map(([url]) => url)).toEqual([rejectedUrl, thinUrl])
    expect(sleep).not.toHaveBeenCalled()
  })

  it('propagates injected fetch and time through the default source adapters without inventing source errors', async () => {
    const result = await runDiscovery({
      config: {
        version: 1,
        limits: { sourceRecords: 50, newDomains: 15, publishPerRun: 3, catalogMaximum: 300 },
        sources: [{
          id: 'default-github', kind: 'github-search', enabled: true,
          query: 'topic:ai-tool stars:>=200 archived:false', minimumStars: 200, score: 50
        }]
      },
      state: emptyState(), catalogPath, projectRoot, dryRun: true, enricher: null, now,
      fetch: async () => new Response(JSON.stringify({
        items: [{ name: 'Default Source AI', homepage: 'https://default-source.com/', stargazers_count: 200, archived: false }]
      }), { status: 200, headers: { 'content-type': 'application/json' } })
    })

    expect(result.candidates).toEqual([{ key: 'default-source.com', sourceId: 'default-github' }])
    expect(result.sourceErrors).toEqual([])
    expect(result.sourceSummaries).toEqual([{
      sourceId: 'default-github', candidateCount: 1, errorCode: null
    }])
  })

  it('writes bounded default-source failures to the CLI review output without request details', async () => {
    mkdirSync(join(projectRoot, 'config'), { recursive: true })
    writeFileSync(join(projectRoot, 'config/ai-discovery-sources.json'), JSON.stringify({
      version: 1,
      limits: { sourceRecords: 50, newDomains: 15, publishPerRun: 3, catalogMaximum: 300 },
      sources: [{ id: 'default-feed', kind: 'feed', enabled: true, url: 'https://feed.example.com/discovery.json', score: 50 }]
    }), 'utf8')

    const githubOutput = join(projectRoot, 'github-output.txt')
    writeFileSync(githubOutput, '', 'utf8')
    const result = await runDiscoveryFromEnvironment({}, {
      projectRoot,
      argv: ['--dry-run'],
      enricher: null,
      now,
      fetch: async () => { throw new Error('socket details must not escape') },
      githubOutput
    })
    const review = readFileSync(join(projectRoot, 'ai-discovery-review.md'), 'utf8')

    expect(result.sourceErrors).toEqual([{ sourceId: 'default-feed', errorCode: 'source_unavailable' }])
    expect(result.sourceSummaries).toEqual([{
      sourceId: 'default-feed', candidateCount: 0, errorCode: 'source_unavailable'
    }])
    expect(result.needsReview).toBe(true)
    expect(readFileSync(githubOutput, 'utf8')).toMatch(/needs_review<<[^\n]+\ntrue\n/u)
    expect(review).toContain('`source_unavailable` — default-feed')
    expect(review).not.toContain('socket details')
    expect(review).not.toContain('https://feed.example.com')
  })

  it('writes actionable sanitized candidate context without query data or injected Markdown', async () => {
    mkdirSync(join(projectRoot, 'config'), { recursive: true })
    writeFileSync(join(projectRoot, 'config/ai-discovery-sources.json'), JSON.stringify(config()), 'utf8')
    const rawName = '@ops [unsafe](https://evil.example/) `code` # heading'
    const input = candidate(
      rawName,
      'https://review-context.com/product/path?keyboard=private-query-detail#private-fragment'
    )

    const result = await runDiscoveryFromEnvironment({}, {
      projectRoot,
      argv: ['--dry-run'],
      discoverFromSources: async () => ({ candidates: [input], errors: [], sourceSummaries: [] }),
      fetchOfficialPage: async () => {
        throw Object.assign(new Error('private socket and response body'), {
          code: 'official_fetch_rejected'
        })
      },
      enricher: { enrich: vi.fn() },
      now
    })
    const [item] = result.review
    const report = readFileSync(join(projectRoot, 'ai-discovery-review.md'), 'utf8')

    expect(item).toMatchObject({
      key: 'review-context.com',
      sourceId: 'fixture-feed',
      errorCode: 'official_fetch_rejected',
      officialUrl: 'https://review-context.com/product/path'
    })
    expect(item.name).not.toMatch(/[@`\[\]()<>#*_!|:/\\]/u)
    expect(Array.from(item.name).length).toBeLessThanOrEqual(120)
    expect(item.explanation.length).toBeGreaterThan(0)
    expect(item.explanation.length).toBeLessThanOrEqual(160)
    expect(item.suggestedAction.length).toBeGreaterThan(0)
    expect(item.suggestedAction.length).toBeLessThanOrEqual(160)
    expect(report).toContain('工具：')
    expect(report).toContain('官网：<https://review-context.com/product/path>')
    expect(report).toContain('原因：')
    expect(report).toContain('建议：')
    expect(report).not.toMatch(/@ops|\[unsafe\]\(|evil\.example|private-query-detail|private-fragment|private socket|response body/u)
  })

  it('uses a nonempty bounded fallback when sanitization removes the whole candidate name', async () => {
    const result = await runDiscovery({
      config: config(), state: emptyState(), catalogPath, projectRoot,
      discoverFromSources: async () => ({
        candidates: [candidate('https://name-only.invalid/path', 'https://review-context.com/product')],
        errors: [],
        sourceSummaries: []
      }),
      enricher: null,
      now
    })

    expect(result.review[0].name).toBe('未命名候选')
  })

  it('keeps healthy zero-candidate source health in the artifact without requesting issue review', async () => {
    mkdirSync(join(projectRoot, 'config'), { recursive: true })
    writeFileSync(join(projectRoot, 'config/ai-discovery-sources.json'), JSON.stringify({
      version: 1,
      limits: { sourceRecords: 50, newDomains: 15, publishPerRun: 3, catalogMaximum: 300 },
      sources: [{ id: 'healthy-feed', kind: 'feed', enabled: true, url: 'https://feed.example.com/discovery.json', score: 50 }]
    }), 'utf8')
    const githubOutput = join(projectRoot, 'github-output.txt')
    writeFileSync(githubOutput, '', 'utf8')

    const result = await runDiscoveryFromEnvironment({}, {
      projectRoot,
      argv: ['--dry-run'],
      enricher: null,
      now,
      fetch: async () => new Response(JSON.stringify({
        version: 'https://jsonfeed.org/version/1.1', items: []
      }), { status: 200, headers: { 'content-type': 'application/feed+json' } }),
      githubOutput
    })

    expect(result.sourceSummaries).toEqual([{
      sourceId: 'healthy-feed', candidateCount: 0, errorCode: null
    }])
    expect(result.needsReview).toBe(false)
    expect(readFileSync(join(projectRoot, 'ai-discovery-review.md'), 'utf8')).toContain('`source_checked` — healthy-feed — candidates: 0')
    expect(readFileSync(githubOutput, 'utf8')).toMatch(/needs_review<<[^\n]+\nfalse\n/u)
  })

  it('marks candidate review as actionable while preserving source health', async () => {
    mkdirSync(join(projectRoot, 'config'), { recursive: true })
    writeFileSync(join(projectRoot, 'config/ai-discovery-sources.json'), JSON.stringify({
      version: 1,
      limits: { sourceRecords: 50, newDomains: 15, publishPerRun: 3, catalogMaximum: 300 },
      sources: [{
        id: 'candidate-github', kind: 'github-search', enabled: true,
        query: 'topic:ai-tool stars:>=200 archived:false', minimumStars: 200, score: 50
      }]
    }), 'utf8')

    const githubOutput = join(projectRoot, 'github-output.txt')
    writeFileSync(githubOutput, '', 'utf8')
    const result = await runDiscoveryFromEnvironment({}, {
      projectRoot,
      argv: ['--dry-run'],
      enricher: null,
      now,
      fetch: async () => new Response(JSON.stringify({
        items: [{ name: 'Candidate AI', homepage: 'https://candidate-example.com/', stargazers_count: 200, archived: false }]
      }), { status: 200, headers: { 'content-type': 'application/json' } }),
      githubOutput
    })

    expect(result.needsReview).toBe(true)
    expect(readFileSync(githubOutput, 'utf8')).toMatch(/needs_review<<[^\n]+\ntrue\n/u)
    expect(readFileSync(join(projectRoot, 'ai-discovery-review.md'), 'utf8')).toContain('`enricher_unconfigured` — `candidate-github` — `candidate-example.com`')
  })

  it('writes canonical catalog detail URLs to the discovery notification allowlist', async () => {
    mkdirSync(join(projectRoot, 'config'), { recursive: true })
    copyFileSync(sourceConfig, join(projectRoot, 'config/ai-discovery-sources.json'))
    const githubOutput = join(projectRoot, 'github-output.txt')
    writeFileSync(githubOutput, '', 'utf8')

    const result = await runDiscoveryFromEnvironment({}, {
      projectRoot,
      argv: ['--dry-run'],
      githubOutput,
      discoverFromSources: async () => ({
        candidates: [candidate('Useful AI', 'https://useful-ai.com/')],
        errors: []
      }),
      fetchOfficialPage: async (url: string) => evidence(`${url.replace(/\/$/u, '')}/product`),
      enricher: { enrich: async (_input, proof) => groundedDraft(draft(), proof) },
      now
    })

    expect(result.changedUrls).toEqual(['https://no996noicu.com/tools/useful-ai'])
    expect(readFileSync(join(projectRoot, 'discovered-urls.txt'), 'utf8'))
      .toBe('https://no996noicu.com/tools/useful-ai\n')
    expect(readFileSync(githubOutput, 'utf8')).toContain('changed_urls_path')
  })

  it('states that verified automatic discovery auto-merges while visitor submissions remain human reviewed', async () => {
    mkdirSync(join(projectRoot, 'config'), { recursive: true })
    copyFileSync(sourceConfig, join(projectRoot, 'config/ai-discovery-sources.json'))
    const githubOutput = join(projectRoot, 'github-output.txt')
    writeFileSync(githubOutput, '', 'utf8')

    const result = await runDiscoveryFromEnvironment({}, {
      projectRoot,
      argv: [],
      githubOutput,
      discoverFromSources: async () => ({
        candidates: [candidate('Useful AI', 'https://useful-ai.com/')],
        errors: [],
        sourceSummaries: []
      }),
      fetchOfficialPage: async (url: string) => evidence(`${url.replace(/\/$/u, '')}/product`),
      enricher: { enrich: async (_input, proof) => groundedDraft(draft(), proof) },
      now
    })

    expect(result.prBody).toMatch(/确定性门槛[\s\S]*自动合并/u)
    expect(result.prBody).toContain('不代表人工审核')
    expect(result.prBody).toMatch(/公开提交[\s\S]*人工审核/u)
    expect(result.prBody).not.toContain('必须经过人工审核才可合并')
  })
})
