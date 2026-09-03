import { describe, expect, it } from 'vitest'
import { normalizeCandidate } from '../scripts/discovery/contracts.mjs'
import {
  catalogDiscoveryIndex,
  compareCandidatesForEnrichment,
  evaluateCandidate,
  scoreCandidate,
  selectDiscoveryAlternatives,
  validateCandidateForDiscovery,
  validateDraftAgainstEvidence
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
  visibleText: `Example Evidence AI is a web app for research teams. It requires account registration, offers a free plan and paid plans, and provides multilingual support including Chinese translation. ${'It organizes public sources, creates structured summaries, and helps users trace evidence. '.repeat(4)}`,
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

  it.each([
    'owner@example.com AI',
    'Example AI secret=private-value',
    'Example authorization: Bearer private-token',
    'Example AI Bearer standalone-private-token'
  ])('rejects a sensitive candidate name during the pre-fetch validation step: %s', (name) => {
    expect(() => validateCandidateForDiscovery({ ...candidate, name }))
      .toThrow('insufficient_official_evidence')
  })

  it('returns only a frozen bounded evidence summary after all hard gates pass', () => {
    const summary = evaluateCandidate(candidate, evidence, catalogDiscoveryIndex(catalog))

    expect(summary).toEqual({
      selectedOfficialUrl: 'https://new.example.ai/product',
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

  it('rejects duplicate redirected and canonical destinations, including trailing-dot hosts', () => {
    const existing = catalogDiscoveryIndex(catalog)
    const trailingDot = normalizeCandidate(
      { name: 'Trailing Dot AI', url: 'https://research-1.example.com./new' },
      { id: 'feed-one', kind: 'feed', score: 40 },
      new Date('2026-09-03T02:00:00.000Z')
    )

    expect(() => evaluateCandidate(candidate, {
      ...evidence,
      finalUrl: 'https://research-1.example.com/redirected'
    }, existing)).toThrow('duplicate_catalog_entry')
    expect(() => evaluateCandidate(candidate, {
      ...evidence,
      finalUrl: 'https://new.example.ai/landing',
      canonicalUrl: 'https://new.example.ai/product'
    }, catalogDiscoveryIndex([
      ...catalog,
      { slug: 'existing-canonical', name: 'Existing Canonical', category: 'research', url: 'https://new.example.ai/product' }
    ]))).toThrow('duplicate_catalog_entry')
    expect(() => evaluateCandidate(trailingDot, {
      ...evidence,
      finalUrl: 'https://research-1.example.com./new',
      canonicalUrl: undefined
    }, existing)).toThrow('duplicate_catalog_entry')
  })

  it('ignores a cross-domain canonical and strips query and hash from the selected final URL', () => {
    const summary = evaluateCandidate(candidate, {
      ...evidence,
      finalUrl: 'https://new.example.ai/landing?session=remove#top',
      canonicalUrl: 'https://research-1.example.com/product?tracking=remove#canonical'
    }, catalogDiscoveryIndex(catalog))

    expect(summary.selectedOfficialUrl).toBe('https://new.example.ai/landing')
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

  it.each([
    ['zero-width padding', `AI product${'\u200B'.repeat(300)}`],
    ['bidi padding', `AI product${'\u202E'.repeat(300)}`]
  ])('does not count %s as visible evidence', (_label, visibleText) => {
    expect(() => evaluateCandidate(candidate, { ...evidence, visibleText }, catalogDiscoveryIndex(catalog)))
      .toThrow('insufficient_official_evidence')
  })

  it('counts Unicode code points rather than UTF-16 units at the 200-character boundary', () => {
    const visibleText = `AI ${'😀'.repeat(197)}`
    const summary = evaluateCandidate(candidate, { ...evidence, visibleText }, catalogDiscoveryIndex(catalog))

    expect(summary.visibleCharacterCount).toBe(200)
  })

  it.each([
    'Error 404',
    '404: Not Found',
    '403 — Forbidden',
    'Error: 410 Gone',
    'HTTP 500: Internal Server Error',
    '502 / Bad Gateway',
    'Service Error 503'
  ])('rejects punctuation- and order-varied error page wording: %s', (title) => {
    expect(() => evaluateCandidate(candidate, { ...evidence, title }, catalogDiscoveryIndex(catalog)))
      .toThrow('non_product_page')
  })

  it.each([
    'AI casino betting assistant',
    'AI adult deepfake face generator',
    'AI deepfake generator offered for security training',
    'AI voice impersonation tool for fraud',
    '生成仿冒人脸的 AI 换脸诈骗工具',
    '生成钓鱼邮件并窃取凭据的人工智能平台',
    'offensive AI malware generator',
    '用于冒充他人声音实施欺诈的人工智能工具'
  ])('rejects prohibited offensive use: %s', (phrase) => {
    const visibleText = `${phrase}. ${'Detailed product capability evidence. '.repeat(8)}`
    expect(() => evaluateCandidate(candidate, { ...evidence, visibleText }, catalogDiscoveryIndex(catalog)))
      .toThrow('prohibited_candidate')
  })

  it.each([
    'AI anti-malware scanner protects endpoints and blocks ransomware attacks',
    'AI anti-phishing defense detects fraudulent emails and protects users',
    'AI phishing simulation and security awareness training platform',
    'AI malware analysis sandbox for security researchers',
    'AI deepfake detector prevents voice impersonation fraud',
    '人工智能恶意软件检测与防御平台，可阻止勒索软件攻击',
    '人工智能反钓鱼安全工具，用于检测并拦截欺诈邮件'
  ])('allows clearly defensive security products: %s', (phrase) => {
    const visibleText = `${phrase}. ${'Security teams review detected threats and protection reports. '.repeat(6)}`
    expect(() => evaluateCandidate(candidate, { ...evidence, visibleText }, catalogDiscoveryIndex(catalog)))
      .not.toThrow()
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

  it.each([
    ['native Chinese', { chineseSupport: 'native' }],
    ['free pricing', { pricingMode: 'free' }],
    ['desktop access', { accessModes: ['web', 'desktop'] }],
    ['API access', { accessModes: ['web', 'api'] }],
    ['no-account access', { requiresAccount: false }],
    ['offline capability', { features: ['提取公开来源', '支持离线处理', '保留链接回溯'] }],
    ['local capability', { features: ['提取公开来源', 'Runs locally on your computer', '保留链接回溯'] }]
  ])('rejects an unsupported evidence claim for %s', (_label, changes) => {
    const accepted = evaluateCandidate(candidate, evidence, catalogDiscoveryIndex(catalog))
    expect(() => validateDraftAgainstEvidence({ ...draft, ...changes }, accepted))
      .toThrow('insufficient_official_evidence')
  })

  it.each([
    ['free pricing', { pricingMode: 'free' }, 'This AI web app is completely free with no paid plans. It requires an account and supports multiple languages including Chinese.'],
    ['paid pricing', { pricingMode: 'paid' }, 'This AI web app requires an account. Paid subscriptions start at $10 per month. It supports multiple languages including Chinese.'],
    ['contact pricing', { pricingMode: 'contact' }, 'This AI web app requires an account. Contact sales for pricing. It supports multiple languages including Chinese.'],
    ['native Chinese', { chineseSupport: 'native' }, 'This AI web app requires an account and has free and paid plans. It is built for Chinese users with a native Chinese interface.'],
    ['no Chinese', { chineseSupport: 'none' }, 'This AI web app requires an account and has free and paid plans. The interface is English only with no Chinese support.'],
    ['desktop and API', { accessModes: ['desktop', 'api'] }, 'This AI product requires an account, offers free and paid plans, supports Chinese translation, and provides a Windows desktop app plus developer API.'],
    ['mobile and extension', { accessModes: ['mobile', 'extension'] }, 'This AI product requires an account, offers free and paid plans, supports Chinese translation, and provides iOS mobile apps plus a browser extension.'],
    ['no account', { requiresAccount: false }, 'This AI web app works without signup and requires no account. It offers free and paid plans and supports Chinese translation.'],
    ['offline local', { features: ['提取公开来源', '支持离线本地处理', '保留链接回溯'] }, 'This AI web app requires an account, offers free and paid plans, supports Chinese translation, and provides offline local on-device processing.']
  ])('accepts explicitly grounded evidence for %s', (_label, changes, claim) => {
    const proof = {
      ...evidence,
      visibleText: `${claim} ${'Detailed capability and workflow evidence. '.repeat(8)}`
    }
    const accepted = evaluateCandidate(candidate, proof, catalogDiscoveryIndex(catalog))
    expect(validateDraftAgainstEvidence({ ...draft, ...changes }, accepted)).toBe(accepted)
  })

  it('accepts practical Chinese-language evidence cues for every base operational field', () => {
    const accepted = evaluateCandidate(candidate, {
      ...evidence,
      visibleText: `这是一个人工智能网页应用，需要注册账户，提供免费方案与付费套餐，并支持中文翻译。${'官网详细介绍产品能力和使用流程。'.repeat(20)}`
    }, catalogDiscoveryIndex(catalog))

    expect(validateDraftAgainstEvidence(draft, accepted)).toBe(accepted)
  })

  it.each([
    ['contradictory account evidence', draft, 'This AI web app says account required but also says no account required. It has free and paid plans and supports Chinese translation.'],
    ['contradictory language evidence', draft, 'This AI web app requires an account and has free and paid plans. It claims native Chinese but also says English only with no Chinese support.'],
    ['mixed paid and contact pricing evidence', { ...draft, pricingMode: 'contact' }, 'This AI web app requires an account and supports Chinese translation. Paid subscriptions start at $10, while enterprise buyers must contact sales for pricing.']
  ])('rejects %s as ambiguous', (_label, proposedDraft, claim) => {
    const accepted = evaluateCandidate(candidate, {
      ...evidence,
      visibleText: `${claim} ${'Detailed product evidence. '.repeat(10)}`
    }, catalogDiscoveryIndex(catalog))

    expect(() => validateDraftAgainstEvidence(proposedDraft, accepted))
      .toThrow('insufficient_official_evidence')
  })
})
