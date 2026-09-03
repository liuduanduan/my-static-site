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
import { runDiscovery } from '../scripts/discovery/runDiscovery.mjs'

const sourceCatalog = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/.vitepress/theme/domain/ai-tools.json')
const sourceScenarios = resolve(dirname(fileURLToPath(import.meta.url)), '../docs/.vitepress/theme/domain/ai-scenarios.json')
const now = () => new Date('2026-09-03T00:00:00.000Z')

function config(overrides: Record<string, number> = {}) {
  return {
    version: 1,
    limits: { sourceRecords: 50, newDomains: 15, publishPerRun: 3, catalogMaximum: 300, ...overrides },
    sources: [{ id: 'fixture-feed', kind: 'feed', enabled: true, url: 'https://feed.example/discovery.json', score: 50 }]
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
    visibleText: `${name} is an artificial intelligence web app. It has a free plan and paid plans. It supports Chinese translation. Sign up is required. ${'Public product information for research workflows. '.repeat(8)}`
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
    cons: ['关键结论仍需人工判断', '完整能力依赖账户方案']
  }
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
      candidate('Useful AI', 'https://useful-ai.example/'),
      candidate('Duplicate', 'https://chatgpt.com/'),
      candidate('Thin page', 'https://thin-page.example/')
    ]
    const discoverFromSources = vi.fn(async () => ({ candidates, errors: [] }))
    const fetchOfficialPage = vi.fn(async (url: string) => url.includes('thin-page')
      ? { ...evidence(url, 'Thin page'), visibleText: 'AI' }
      : evidence(`${url.replace(/\/$/u, '')}/product`, url.includes('useful') ? 'Useful AI' : 'Duplicate'))
    const enricher = { enrich: vi.fn(async () => draft()) }
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
    expect(JSON.parse(readFileSync(catalogPath, 'utf8'))).toHaveLength(121)
  })

  it('bounds fetches and publications, skips terminal and cooled candidates, and handles an unconfigured enricher', async () => {
    const candidates = Array.from({ length: 16 }, (_, index) => candidate(
      `Useful ${index}`,
      `https://useful-${index}.example/`,
      100 - index
    ))
    const fetchOfficialPage = vi.fn(async (url: string) => evidence(`${url.replace(/\/$/u, '')}/product`))
    const enricher = { enrich: vi.fn(async (input: { name: string }) => {
      const suffix = input.name.replace(/^Useful\s+/u, '')
      return draft(`useful-${suffix}`, input.name)
    }) }

    const limited = await runDiscovery({
      config: config(), state: emptyState(), catalogPath, projectRoot,
      discoverFromSources: async () => ({ candidates, errors: [] }), fetchOfficialPage, enricher, now
    })
    expect(fetchOfficialPage).toHaveBeenCalledTimes(15)
    expect(limited.published).toHaveLength(3)

    const before = readFileSync(catalogPath, 'utf8')
    const publishedState = {
      version: 1,
      outcomes: [{
        key: 'already-published.example', status: 'published', errorCode: null,
        processedAt: '2026-09-02T00:00:00.000Z', fingerprint: 'a'.repeat(64)
      }]
    }
    const skippedFetch = vi.fn(async (url: string) => evidence(url))
    const skipped = await runDiscovery({
      config: config(), state: publishedState, catalogPath, projectRoot,
      discoverFromSources: async () => ({ candidates: [candidate('Already published', 'https://already-published.example/')], errors: [] }),
      fetchOfficialPage: skippedFetch, enricher: null, now
    })
    expect(skippedFetch).not.toHaveBeenCalled()
    expect(skipped.published).toEqual([])
    expect(readFileSync(catalogPath, 'utf8')).toBe(before)

    const cooledState = {
      version: 1,
      outcomes: [0, 1, 2].map((day) => ({
        key: 'cooled.example', status: 'failed', errorCode: 'official_fetch_failed',
        processedAt: `2026-09-0${day + 1}T00:00:00.000Z`, fingerprint: 'b'.repeat(64)
      }))
    }
    const cooledFetch = vi.fn(async (url: string) => evidence(url))
    await runDiscovery({
      config: config(), state: cooledState, catalogPath, projectRoot,
      discoverFromSources: async () => ({ candidates: [candidate('Cooled', 'https://cooled.example/')], errors: [] }),
      fetchOfficialPage: cooledFetch, enricher: { enrich: vi.fn() }, now
    })
    expect(cooledFetch).not.toHaveBeenCalled()

    const unconfigured = await runDiscovery({
      config: config(), state: emptyState(), catalogPath, projectRoot,
      discoverFromSources: async () => ({ candidates: [candidate('Needs enrichment', 'https://needs-enrichment.example/')], errors: [] }),
      fetchOfficialPage: vi.fn(), enricher: null, now
    })
    expect(unconfigured.review).toEqual([expect.objectContaining({ errorCode: 'enricher_unconfigured' })])
    expect(unconfigured.published).toEqual([])
  })

  it('does not publish at the catalog maximum and preserves the catalog when batch mutation fails', async () => {
    const candidateInput = candidate('Useful AI', 'https://maximum.example/')
    const before = readFileSync(catalogPath, 'utf8')
    const maximum = await runDiscovery({
      config: config({ catalogMaximum: 120 }), state: emptyState(), catalogPath, projectRoot,
      discoverFromSources: async () => ({ candidates: [candidateInput], errors: [] }),
      fetchOfficialPage: vi.fn(), enricher: null, now
    })
    expect(maximum.published).toEqual([])
    expect(maximum.review).toEqual([expect.objectContaining({ errorCode: 'catalog_maximum_reached' })])
    expect(readFileSync(catalogPath, 'utf8')).toBe(before)

    await expect(runDiscovery({
      config: config(), state: emptyState(), catalogPath, projectRoot,
      discoverFromSources: async () => ({ candidates: [candidateInput], errors: [] }),
      fetchOfficialPage: async (url: string) => evidence(`${url.replace(/\/$/u, '')}/product`),
      enricher: { enrich: async () => draft() },
      appendCatalogTools: () => { throw Object.assign(new Error('catalog_validation_failed'), { code: 'catalog_validation_failed' }) },
      now
    })).rejects.toThrow('catalog_validation_failed')
    expect(readFileSync(catalogPath, 'utf8')).toBe(before)
  })
})
