import { describe, expect, it } from 'vitest'
import { normalizeCandidate } from '../scripts/discovery/contracts.mjs'
import {
  catalogDiscoveryIndex,
  compareCandidatesForEnrichment,
  evaluateCandidate,
  scoreCandidate,
  selectDiscoveryAlternatives
} from '../scripts/discovery/qualityGate.mjs'

const categories = [
  'chat',
  'writing',
  'image',
  'video',
  'coding',
  'audio',
  'research',
  'marketing',
  'automation'
]

const catalog = categories.flatMap((category, categoryIndex) =>
  Array.from({ length: 2 }, (_, index) => ({
    slug: `${category}-tool-${index + 1}`,
    name: `${category} Tool ${index + 1}`,
    category,
    url: `https://${category}-${index + 1}.example.com/product`,
    description: `private catalog description ${categoryIndex}-${index}`
  }))
)

const candidate = normalizeCandidate(
  { name: 'Example Evidence AI', url: 'https://new.example.ai/product' },
  { id: 'feed-one', kind: 'feed', score: 40 },
  new Date('2026-09-03T02:00:00.000Z')
)

const evidence = {
  finalUrl: 'https://new.example.ai/product',
  statusCode: 200,
  title: 'Example Evidence AI research assistant',
  metaDescription: 'An AI product for organizing and checking public research.',
  canonicalUrl: 'https://new.example.ai/product',
  pricingLinks: ['https://new.example.ai/pricing'],
  visibleText: `Example Evidence AI is a research product for teams. ${'It organizes public sources, creates structured summaries, and helps users trace evidence. '.repeat(4)}`,
  html: '<script>secret instructions</script>'
}

const draft = {
  slug: 'example-evidence-ai',
  name: 'Example Evidence AI',
  category: 'research',
  tagline: '整理公开资料并保留来源线索的 AI 研究助手',
  description: '适合需要整理公开资料、生成结构化摘要并回溯来源的团队，关键事实仍需人工核验。',
  bestFor: ['整理公开资料', '核对来源依据', '制作研究简报'],
  features: ['提取公开来源', '生成结构化摘要', '保留链接回溯'],
  pricing: '官网展示可用方案，具体额度与价格以官网为准',
  pricingMode: 'freemium',
  chineseSupport: 'partial',
  accessModes: ['web'],
  requiresAccount: true,
  tags: ['资料整理', '来源核验'],
  searchTerms: ['公开资料整理', '来源核验工具'],
  pros: ['来源脉络较清楚', '整理流程较直接'],
  cons: ['关键事实仍需人工核验', '高级额度可能收费']
}

describe('AI discovery deterministic quality gate', () => {
  it('builds an immutable safe catalog index without source descriptions', () => {
    const index = catalogDiscoveryIndex(catalog)

    expect(index.urls).toContain('https://research-1.example.com/product')
    expect(index.domains).toContain('research-1.example.com')
    expect(index.names).toContain('research tool 1')
    expect(index.slugs).toContain('research-tool-1')
    expect(index.categoryCounts).toEqual(Object.fromEntries(categories.map((key) => [key, 2])))
    expect(index.alternatives).toContainEqual({
      slug: 'research-tool-1',
      name: 'research Tool 1',
      category: 'research'
    })
    expect(JSON.stringify(index)).not.toContain('private catalog description')
    expect(Object.isFrozen(index)).toBe(true)
    expect(Object.isFrozen(index.alternatives)).toBe(true)
    expect(Object.isFrozen(index.alternatives[0])).toBe(true)
  })

  it.each([
    [
      'duplicate domain',
      candidate,
      evidence,
      [...catalog, { slug: 'existing-example', name: 'Existing Example', category: 'research', url: 'https://www.new.example.ai/' }],
      'duplicate_catalog_entry'
    ],
    ['thin landing page', candidate, { ...evidence, visibleText: 'AI' }, catalog, 'insufficient_official_evidence'],
    ['missing title', candidate, { ...evidence, title: '  ' }, catalog, 'insufficient_official_evidence'],
    ['no product cue', candidate, { ...evidence, title: 'Example', metaDescription: '', visibleText: 'A neutral sentence. '.repeat(20) }, catalog, 'non_product_page'],
    ['parked domain', candidate, { ...evidence, title: 'Domain for sale' }, catalog, 'non_product_page'],
    ['prohibited product', candidate, { ...evidence, visibleText: `AI casino betting ${'product details '.repeat(20)}` }, catalog, 'prohibited_candidate']
  ])('rejects %s deterministically', (_label, input, proof, tools, code) => {
    expect(() => evaluateCandidate(input, proof, catalogDiscoveryIndex(tools))).toThrow(code)
  })

  it('rejects normalized duplicate names and candidate-derived slugs', () => {
    const index = catalogDiscoveryIndex([
      ...catalog,
      { slug: 'other-slug', name: '  EXAMPLE   EVIDENCE AI ', category: 'research', url: 'https://other.example/' }
    ])
    expect(() => evaluateCandidate(candidate, evidence, index)).toThrow('duplicate_catalog_entry')

    const slugIndex = catalogDiscoveryIndex([
      ...catalog,
      { slug: 'example-evidence-ai', name: 'Other Name', category: 'research', url: 'https://other.example/' }
    ])
    expect(() => evaluateCandidate(candidate, evidence, slugIndex)).toThrow('duplicate_catalog_entry')
  })

  it('returns only a frozen bounded evidence summary after all hard gates pass', () => {
    const summary = evaluateCandidate(candidate, evidence, catalogDiscoveryIndex(catalog))

    expect(summary).toEqual({
      title: evidence.title,
      metaDescription: evidence.metaDescription,
      visibleText: evidence.visibleText.replace(/\s+/g, ' ').trim(),
      visibleCharacterCount: evidence.visibleText.replace(/\s+/g, ' ').trim().length,
      hasCanonicalUrl: true,
      hasPricingLink: true
    })
    expect(Object.isFrozen(summary)).toBe(true)
    expect(summary).not.toHaveProperty('html')
    expect(summary).not.toHaveProperty('pricingLinks')
  })

  it('recognizes an explicit multi-word AI cue without relying on a generic product token', () => {
    const proof = {
      ...evidence,
      title: 'Example capability',
      metaDescription: '',
      visibleText: `Artificial intelligence transforms inputs into useful results. ${'Detailed public capability evidence. '.repeat(6)}`
    }

    expect(evaluateCandidate(candidate, proof, catalogDiscoveryIndex(catalog))).toMatchObject({
      title: 'Example capability'
    })
  })

  it('measures the 200-character minimum after trim and whitespace collapse', () => {
    const index = catalogDiscoveryIndex(catalog)
    const exactlyTwoHundred = { ...evidence, visibleText: `AI ${'x'.repeat(197)}` }
    const oneHundredNinetyNine = { ...evidence, visibleText: `AI ${'x'.repeat(196)}` }

    expect(evaluateCandidate(candidate, exactlyTwoHundred, index).visibleCharacterCount).toBe(200)
    expect(() => evaluateCandidate(candidate, oneHundredNinetyNine, index))
      .toThrow('insufficient_official_evidence')
  })

  it('uses scoring only for integer ordering and never turns a hard failure into a pass', () => {
    const index = catalogDiscoveryIndex(catalog)
    const score = scoreCandidate(candidate, evidence, index, draft)
    const acceptedEvidence = evaluateCandidate(candidate, evidence, index)

    expect(Number.isInteger(score)).toBe(true)
    expect(score).toBeGreaterThan(candidate.sourceScore)
    expect(scoreCandidate(candidate, acceptedEvidence, index, draft)).toBe(score)
    expect(() => scoreCandidate(candidate, { ...evidence, visibleText: 'AI' }, index, draft))
      .toThrow('insufficient_official_evidence')
    expect(() => scoreCandidate(candidate, evidence, index, { ...draft, slug: 'research-tool-1' }))
      .toThrow('duplicate_catalog_entry')
  })

  it('orders pre-enrichment candidates by source score, discovery date, then stable key', () => {
    const makeCandidate = (name: string, url: string, score: number, date: string) => normalizeCandidate(
      { name, url },
      { id: 'feed-one', kind: 'feed', score },
      new Date(date)
    )
    const inputs = [
      makeCandidate('Zulu', 'https://z.example/', 40, '2026-09-03T01:00:00Z'),
      makeCandidate('Alpha', 'https://a.example/', 50, '2026-09-03T02:00:00Z'),
      makeCandidate('Beta', 'https://b.example/', 50, '2026-09-03T01:00:00Z'),
      makeCandidate('Able', 'https://aa.example/', 50, '2026-09-03T01:00:00Z')
    ]

    expect([...inputs].sort(compareCandidatesForEnrichment).map(({ name }) => name)).toEqual([
      'Able',
      'Beta',
      'Alpha',
      'Zulu'
    ])
  })

  it('selects two safe deterministic alternatives only after the returned category is known', () => {
    const index = catalogDiscoveryIndex(catalog)

    expect(selectDiscoveryAlternatives(index, 'research', draft.slug)).toEqual([
      'research-tool-1',
      'research-tool-2'
    ])
    expect(() => selectDiscoveryAlternatives(index, 'unknown', draft.slug))
      .toThrow('discovery_enricher_invalid_output')
  })
})
