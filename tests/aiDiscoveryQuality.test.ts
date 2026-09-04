import { describe, expect, it } from 'vitest'
import { normalizeCandidate } from '../scripts/discovery/contracts.mjs'
import { parseGroundedDiscoveryDraft } from '../scripts/discovery/discoveryDraft.mjs'
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
  features: ['整理公开来源', '生成结构化摘要', '保留链接回溯'],
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

function groundedDraft(value = draft, proof = evidence) {
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

describe('AI discovery deterministic quality gate', () => {
  it('builds an immutable safe catalog index without source descriptions', () => {
    const index = catalogDiscoveryIndex(catalog)

    expect(index.urls).toContain('https://research-1.example.com/product')
    expect(index.domains).toContain('example.com')
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
      { slug: 'other-slug', name: '  EXAMPLE   EVIDENCE AI ', category: 'research', url: 'https://other-example.net/' }
    ])
    expect(() => evaluateCandidate(candidate, evidence, index)).toThrow('duplicate_catalog_entry')

    const slugIndex = catalogDiscoveryIndex([
      ...catalog,
      { slug: 'example-evidence-ai', name: 'Other Name', category: 'research', url: 'https://other-example.net/' }
    ])
    expect(() => evaluateCandidate(candidate, evidence, slugIndex)).toThrow('duplicate_catalog_entry')
  })

  it('routes a candidate whose product identity conflicts with the official title to review', () => {
    const mismatched = normalizeCandidate(
      { name: 'Alpha Research AI', url: 'https://alpha-research.com/product' },
      { id: 'feed-one', kind: 'feed', score: 40 },
      new Date('2026-09-03T02:00:00.000Z')
    )
    const proof = {
      ...evidence,
      finalUrl: mismatched.url,
      canonicalUrl: mismatched.url,
      title: 'Completely Different Beta AI Platform',
      visibleText: `Completely Different Beta is an AI web app. ${'It provides documented research workflows. '.repeat(8)}`
    }

    expect(() => evaluateCandidate(mismatched, proof, catalogDiscoveryIndex(catalog)))
      .toThrow('insufficient_official_evidence')
  })

  it('routes a generic-only candidate name with no distinctive product identity to review', () => {
    const ambiguous = normalizeCandidate(
      { name: 'Research AI', url: 'https://research-ai.com/product' },
      { id: 'feed-one', kind: 'feed', score: 40 },
      new Date('2026-09-03T02:00:00.000Z')
    )
    const proof = {
      ...evidence,
      finalUrl: ambiguous.url,
      canonicalUrl: ambiguous.url,
      title: 'AI research assistant for teams',
      visibleText: `This is an artificial intelligence research app. ${'Documented research workflow details. '.repeat(10)}`
    }

    expect(() => evaluateCandidate(ambiguous, proof, catalogDiscoveryIndex(catalog)))
      .toThrow('insufficient_official_evidence')
  })

  it.each([
    ['title punctuation variant', 'Example-Evidence.AI — Research Assistant', 'https://new.example.ai/product'],
    ['domain-backed compact brand', 'AI research assistant for teams', 'https://example-evidence.ai/product']
  ])('accepts legitimate product identity variant: %s', (_label, title, finalUrl) => {
    const input = normalizeCandidate(
      { name: 'Example Evidence AI', url: finalUrl },
      { id: 'feed-one', kind: 'feed', score: 40 },
      new Date('2026-09-03T02:00:00.000Z')
    )
    const proof = {
      ...evidence,
      finalUrl,
      canonicalUrl: finalUrl,
      title,
      visibleText: `${title}. ${'Artificial intelligence research workflow details. '.repeat(8)}`
    }

    expect(() => evaluateCandidate(input, proof, catalogDiscoveryIndex(catalog))).not.toThrow()
  })

  it('treats sibling subdomains and multi-level public suffix variants as catalog collisions', () => {
    const sibling = normalizeCandidate(
      { name: 'Sibling Product AI', url: 'https://app.same-company.co.uk/product' },
      { id: 'feed-one', kind: 'feed', score: 40 },
      new Date('2026-09-03T02:00:00.000Z')
    )
    const proof = {
      ...evidence,
      finalUrl: sibling.url,
      canonicalUrl: sibling.url,
      title: 'Sibling Product AI research assistant',
      visibleText: `Sibling Product AI is an artificial intelligence research app. ${'Documented workflow evidence. '.repeat(10)}`
    }
    const index = catalogDiscoveryIndex([
      ...catalog,
      { slug: 'same-company', name: 'Same Company', category: 'research', url: 'https://www.same-company.co.uk/' }
    ])

    expect(() => evaluateCandidate(sibling, proof, index)).toThrow('duplicate_catalog_entry')
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
      title: 'Example Evidence AI capability',
      metaDescription: '',
      visibleText: `Artificial intelligence transforms inputs into useful results. ${'Detailed public capability evidence. '.repeat(6)}`
    }

    expect(evaluateCandidate(candidate, proof, catalogDiscoveryIndex(catalog))).toMatchObject({
      title: 'Example Evidence AI capability'
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
    'AI research product that steals account passwords',
    'AI security research product that stole account passwords',
    '窃取用户账号密码的人工智能研究工具',
    '提供盗号功能的人工智能安全研究工具',
    '用于冒充他人声音实施欺诈的人工智能工具'
  ])('rejects prohibited offensive use: %s', (phrase) => {
    const visibleText = `${phrase}. ${'Detailed product capability evidence. '.repeat(8)}`
    expect(() => evaluateCandidate(candidate, { ...evidence, visibleText }, catalogDiscoveryIndex(catalog)))
      .toThrow('prohibited_candidate')
  })

  it.each([
    'AI impersonation and deepfake voice product',
    'AI voice impersonation product',
    '人工智能声音冒充产品',
    '人工智能深度伪造语音工具',
    'AI 声音克隆和冒充工具'
  ])('rejects plain impersonation or deepfake terminology without defensive context: %s', (phrase) => {
    const visibleText = `${phrase}. ${'Detailed product capability evidence. '.repeat(8)}`
    expect(() => evaluateCandidate(candidate, { ...evidence, visibleText }, catalogDiscoveryIndex(catalog)))
      .toThrow('prohibited_candidate')
  })

  it.each([
    'AI deepfake synthesis platform',
    'AI deepfake generation platform for security training and detection',
    'AI voice impersonation system designed to bypass identity verification',
    'AI voice impersonation product, alongside a separate identity verification service',
    '用于安全培训和检测的人工智能深度伪造合成平台',
    '用于绕过身份核验的人工智能声音冒充系统',
    '人工智能声音冒充产品，另提供身份核验服务'
  ])('rejects deceptive-media generation or bypass despite defensive wording: %s', (phrase) => {
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
    'AI voice impersonation detector for identity verification',
    'AI security service detects deepfake generation before publication',
    'AI deepfake generation detector for security teams',
    'AI deepfake detection platform for identity verification',
    'AI deepfake synthesis detection platform for identity verification',
    '人工智能深度伪造语音检测与身份核验工具',
    '人工智能平台检测深度伪造生成内容并执行身份核验',
    '人工智能深度伪造合成检测平台，用于身份核验',
    '人工智能声音冒充识别和欺诈防御平台',
    '人工智能恶意软件检测与防御平台，可阻止勒索软件攻击',
    '人工智能反钓鱼安全工具，用于检测并拦截欺诈邮件'
  ])('allows clearly defensive security products: %s', (phrase) => {
    const visibleText = `${phrase}. ${'Security teams review detected threats and protection reports. '.repeat(6)}`
    expect(() => evaluateCandidate(candidate, { ...evidence, visibleText }, catalogDiscoveryIndex(catalog)))
      .not.toThrow()
  })

  it('uses scoring only for integer ordering and never turns a hard failure into a pass', () => {
    const index = catalogDiscoveryIndex(catalog)
    const grounded = groundedDraft()
    const score = scoreCandidate(candidate, evidence, index, grounded)
    const acceptedEvidence = evaluateCandidate(candidate, evidence, index)

    expect(Number.isInteger(score)).toBe(true)
    expect(score).toBeGreaterThan(candidate.sourceScore)
    expect(scoreCandidate(candidate, acceptedEvidence, index, grounded)).toBe(score)
    expect(() => scoreCandidate(candidate, { ...evidence, visibleText: 'AI' }, index, grounded))
      .toThrow('insufficient_official_evidence')
    expect(() => scoreCandidate(candidate, evidence, index, groundedDraft({ ...draft, slug: 'research-tool-1' })))
      .toThrow('duplicate_catalog_entry')
    expect(() => scoreCandidate(candidate, evidence, index, draft))
      .toThrow('discovery_enricher_invalid_output')
  })

  it('rejects a grounded draft when its private exact citations do not belong to the scored evidence', () => {
    const index = catalogDiscoveryIndex(catalog)
    const grounded = groundedDraft()
    const differentEvidence = {
      ...evidence,
      visibleText: `Example Evidence AI is a web app for research teams. It requires account registration, offers a free plan and paid plans, and provides multilingual support including Chinese translation. ${'This official page documents an AI research product. '.repeat(8)}`
    }

    expect(() => scoreCandidate(candidate, differentEvidence, index, grounded))
      .toThrow('discovery_enricher_invalid_output')
  })

  it.each([
    ['medical', { description: '可自动诊断癌症并给出治疗处方的人工智能医疗助手。' }],
    ['medical advice', { description: '提供个性化医疗建议并评估症状的人工智能助手。' }],
    ['personal cancer-risk prediction', { description: 'Example Evidence AI predicts personal cancer risk for individual users.' }],
    ['reordered English personal cancer-risk prediction', { description: 'This AI research assistant provides cancer risk predictions for individual users.' }],
    ['reordered Chinese personal cancer-risk prediction', { description: '这款人工智能研究助手面向个人用户提供癌症风险预测并整理公开资料。' }],
    ['obfuscated medical advice', { description: '提供个性化医\u200b疗建议并评估症状的人工智能助手。' }],
    ['malware', { features: ['提取公开来源', '生成恶意软件载荷', '保留链接回溯'] }],
    ['Trojan malware', { features: ['提取公开来源', '生成木马程序并窃取账户', '保留链接回溯'] }],
    ['impersonation', { tagline: '用于声音克隆和冒充他人的 AI 工具' }],
    ['ranking', { pros: ['全球排名第一', '整理流程较直接'] }],
    ['user count', { description: '拥有一百万用户的人工智能研究平台，可整理公开资料与来源。' }],
    ['financial', { pros: ['已融资一亿美元', '整理流程较直接'] }]
  ])('rejects a prohibited model-authored %s claim even with benign official evidence', (_label, changes) => {
    const accepted = evaluateCandidate(candidate, evidence, catalogDiscoveryIndex(catalog))
    expect(() => validateDraftAgainstEvidence({ ...draft, ...changes }, accepted))
      .toThrow(/prohibited_candidate|insufficient_official_evidence/u)
  })

  it('orders pre-enrichment candidates by source score, discovery date, then stable key', () => {
    const makeCandidate = (name: string, url: string, score: number, date: string) => normalizeCandidate(
      { name, url },
      { id: 'feed-one', kind: 'feed', score },
      new Date(date)
    )
    const inputs = [
      makeCandidate('Zulu', 'https://z-example.com/', 40, '2026-09-03T01:00:00Z'),
      makeCandidate('Alpha', 'https://a-example.com/', 50, '2026-09-03T02:00:00Z'),
      makeCandidate('Beta', 'https://b-example.com/', 50, '2026-09-03T01:00:00Z'),
      makeCandidate('Able', 'https://aa-example.com/', 50, '2026-09-03T01:00:00Z')
    ]

    expect([...inputs].sort(compareCandidatesForEnrichment).map(({ name }) => name)).toEqual([
      'Able',
      'Beta',
      'Alpha',
      'Zulu'
    ])

    const originalLocaleCompare = String.prototype.localeCompare
    String.prototype.localeCompare = () => { throw new Error('ambient locale must not be consulted') }
    try {
      expect([...inputs].sort(compareCandidatesForEnrichment).map(({ name }) => name)).toEqual([
        'Able', 'Beta', 'Alpha', 'Zulu'
      ])
    } finally {
      String.prototype.localeCompare = originalLocaleCompare
    }
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
    ['does not support Chinese', { chineseSupport: 'none' }, 'This AI web app requires an account and has free and paid plans. It does not support Chinese.'],
    ['desktop and API', { accessModes: ['desktop', 'api'] }, 'This AI product requires an account, offers free and paid plans, supports Chinese translation, and provides a Windows desktop app plus developer API.'],
    ['mobile and extension', { accessModes: ['mobile', 'extension'] }, 'This AI product requires an account, offers free and paid plans, supports Chinese translation, and provides iOS mobile apps plus a browser extension.'],
    ['no account', { requiresAccount: false }, 'This AI web app works without signup and requires no account. It offers free and paid plans and supports Chinese translation.'],
    ['no account required', { requiresAccount: false }, 'This AI web app says no account required. It offers free and paid plans and supports Chinese translation.'],
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

  it.each([
    [
      'no paid plans cannot support paid pricing',
      { ...draft, pricingMode: 'paid', pricing: '每月订阅 10 美元，具体价格以官网为准' },
      'This AI web app requires an account and supports Chinese translation. It has no paid plans and is completely free.'
    ],
    [
      'does not support Chinese cannot support partial Chinese',
      draft,
      'This AI web app requires an account, has free and paid plans, and does not support Chinese.'
    ],
    [
      'no API access cannot support API access',
      { ...draft, accessModes: ['web', 'api'] },
      'This AI web app requires an account, has free and paid plans, supports Chinese translation, and has no API access.'
    ]
  ])('rejects explicit polarity contradiction: %s', (_label, proposedDraft, claim) => {
    const accepted = evaluateCandidate(candidate, {
      ...evidence,
      visibleText: `${claim} ${'Detailed product evidence. '.repeat(10)}`
    }, catalogDiscoveryIndex(catalog))

    expect(() => validateDraftAgainstEvidence(proposedDraft, accepted))
      .toThrow('insufficient_official_evidence')
  })

  it.each([
    [
      'desktop app is unavailable',
      { ...draft, accessModes: ['desktop'] },
      'The desktop app is unavailable. It requires account registration, offers free and paid plans, and supports Chinese translation.'
    ],
    [
      'it is not a web app',
      draft,
      'It is not a web app. It requires account registration, offers free and paid plans, and supports Chinese translation.'
    ],
    [
      'not a native Chinese interface',
      { ...draft, chineseSupport: 'native' },
      'It is not a native Chinese interface. This AI product requires account registration, offers free and paid plans, and has a web app.'
    ],
    [
      'paid plans are unavailable',
      { ...draft, pricingMode: 'paid' },
      'Paid plans are unavailable. This AI web app requires account registration and supports Chinese translation.'
    ],
    [
      '未提供桌面应用',
      { ...draft, accessModes: ['desktop'] },
      '未提供桌面应用。这款人工智能产品需要注册账户，提供免费方案与付费套餐，并支持中文翻译。'
    ],
    [
      '这不是网页应用',
      draft,
      '这不是网页应用。这款人工智能产品需要注册账户，提供免费方案与付费套餐，并支持中文翻译。'
    ],
    [
      '没有原生中文界面',
      { ...draft, chineseSupport: 'native' },
      '没有原生中文界面。这款人工智能网页应用需要注册账户，并提供免费方案与付费套餐。'
    ],
    [
      '付费方案不可用',
      { ...draft, pricingMode: 'paid' },
      '付费方案不可用。这款人工智能网页应用需要注册账户，并支持中文翻译。'
    ]
  ])('rejects predicate-style negative evidence for a claimed enum: %s', (_label, proposedDraft, claim) => {
    const accepted = evaluateCandidate(candidate, {
      ...evidence,
      visibleText: `${claim} ${'Detailed product evidence and workflow documentation. '.repeat(10)}`
    }, catalogDiscoveryIndex(catalog))

    expect(() => validateDraftAgainstEvidence(proposedDraft, accepted))
      .toThrow('insufficient_official_evidence')
  })

  it.each([
    ['slug', { slug: 'offline-example-ai' }],
    ['bestFor', { bestFor: ['离线处理资料', '核对来源依据', '制作研究简报'] }],
    ['name', { name: 'Example Offline AI' }],
    ['tagline', { tagline: '支持离线处理的 AI 研究助手' }],
    ['description', { description: '这是一款支持离线处理公开资料并生成结构化摘要的人工智能研究产品。' }],
    ['feature', { features: ['提取公开来源', '支持离线处理', '保留链接回溯'] }],
    ['tag', { tags: ['离线处理', '来源核验'] }],
    ['search term', { searchTerms: ['离线资料整理', '来源核验工具'] }],
    ['pricing', { pricing: '支持本地离线使用，具体价格以官网为准' }],
    ['pro', { pros: ['支持离线处理', '整理流程较直接'] }],
    ['bare Chinese capability', { cons: ['离线处理', '高级额度可能收费'] }]
  ])('rejects unsupported risky capability in %s', (_label, changes) => {
    const accepted = evaluateCandidate(candidate, evidence, catalogDiscoveryIndex(catalog))
    expect(() => validateDraftAgainstEvidence({ ...draft, ...changes }, accepted))
      .toThrow('insufficient_official_evidence')
  })

  it.each([
    [
      'Chinese monthly amount',
      { ...draft, pricingMode: 'paid', pricing: '每月仅需 10 元，具体价格以官网为准' },
      '这是一个人工智能网页应用，需要注册账户，支持中文翻译，并提供付费订阅方案，但官网未公开具体金额。'
    ],
    [
      'English monthly amount',
      { ...draft, pricingMode: 'paid', pricing: '$10 per month，具体价格以官网为准' },
      'This AI web app requires an account, supports Chinese translation, and offers paid subscriptions without a public amount.'
    ]
  ])('rejects unsupported factual pricing text: %s', (_label, proposedDraft, claim) => {
    const accepted = evaluateCandidate(candidate, {
      ...evidence,
      visibleText: `${claim} ${'Detailed product evidence. '.repeat(10)}`
    }, catalogDiscoveryIndex(catalog))
    expect(() => validateDraftAgainstEvidence(proposedDraft, accepted))
      .toThrow('insufficient_official_evidence')
  })

  it.each([
    ['Chinese discount', '现提供五折优惠，具体价格以官网为准', ''],
    ['percentage', '现提供 50% 优惠，具体价格以官网为准', ''],
    ['trial duration', '提供 14 天免费试用，具体价格以官网为准', 'A free trial is available.'],
    ['discount wording', '官网提供优惠活动，具体价格以官网为准', ''],
    ['limited-time condition', '限时提供 50% 优惠，具体价格以官网为准', 'A 50% discount is available.'],
    ['new-user condition', '新用户可享 50% 优惠，具体价格以官网为准', 'A 50% discount is available.'],
    ['first-month condition', '首月可享 50% 优惠，具体价格以官网为准', 'A 50% discount is available.']
  ])('rejects unsupported promotional pricing fact: %s', (_label, pricing, pricingEvidence) => {
    const accepted = evaluateCandidate(candidate, {
      ...evidence,
      visibleText: `This AI web app requires an account, supports Chinese translation, and offers free and paid plans. ${pricingEvidence} ${'Detailed product evidence. '.repeat(10)}`
    }, catalogDiscoveryIndex(catalog))

    expect(() => validateDraftAgainstEvidence({ ...draft, pricing }, accepted))
      .toThrow('insufficient_official_evidence')
  })

  it.each([
    ['percentage', '现提供 50% 优惠，具体价格以官网为准', 'A 20% discount is available.'],
    ['Chinese discount', '现提供五折优惠，具体价格以官网为准', '官网现提供八折优惠。'],
    ['trial duration', '提供 14 天免费试用，具体价格以官网为准', 'A 7-day free trial is available.'],
    ['promotional condition', '限时提供 50% 优惠，具体价格以官网为准', 'New users receive a 50% discount.']
  ])('rejects different promotional pricing evidence: %s', (_label, pricing, pricingEvidence) => {
    const accepted = evaluateCandidate(candidate, {
      ...evidence,
      visibleText: `This AI web app requires an account, supports Chinese translation, and offers free and paid plans. ${pricingEvidence} ${'Detailed product evidence. '.repeat(10)}`
    }, catalogDiscoveryIndex(catalog))

    expect(() => validateDraftAgainstEvidence({ ...draft, pricing }, accepted))
      .toThrow('insufficient_official_evidence')
  })

  it.each([
    [
      'Chinese monthly amount',
      { ...draft, pricingMode: 'paid', pricing: '每月仅需 10 元，具体价格以官网为准' },
      '这是一个人工智能网页应用，需要注册账户，支持中文翻译。付费订阅每月 10 元。'
    ],
    [
      'English monthly amount',
      { ...draft, pricingMode: 'paid', pricing: '$10 per month，具体价格以官网为准' },
      'This AI web app requires an account, supports Chinese translation, and costs $10 per month as a paid subscription.'
    ],
    [
      'contact-sales wording',
      { ...draft, pricingMode: 'contact', pricing: '需要联系销售获取报价，具体价格以官网为准' },
      'This AI web app requires an account, supports Chinese translation, and asks customers to contact sales for pricing and a quote.'
    ]
  ])('accepts grounded factual pricing text: %s', (_label, proposedDraft, claim) => {
    const accepted = evaluateCandidate(candidate, {
      ...evidence,
      visibleText: `${claim} ${'Detailed product evidence. '.repeat(10)}`
    }, catalogDiscoveryIndex(catalog))

    expect(validateDraftAgainstEvidence(proposedDraft, accepted)).toBe(accepted)
  })

  it.each([
    [
      'Chinese discount',
      '现提供五折优惠，具体价格以官网为准',
      'The official offer is a 五折优惠.'
    ],
    [
      'percentage discount',
      '现提供 50% 优惠，具体价格以官网为准',
      'The official offer is a 50% discount.'
    ],
    [
      'trial duration',
      '提供 14 天免费试用，具体价格以官网为准',
      'The official site offers a 14-day free trial.'
    ],
    [
      'promotional conditions',
      '限时面向新用户提供首月 50% 优惠，具体价格以官网为准',
      'For a limited time, new users receive a 50% discount for the first month.'
    ]
  ])('accepts matching promotional pricing evidence: %s', (_label, pricing, pricingEvidence) => {
    const accepted = evaluateCandidate(candidate, {
      ...evidence,
      visibleText: `This AI web app requires an account, supports Chinese translation, and offers free and paid plans. ${pricingEvidence} ${'Detailed product evidence. '.repeat(10)}`
    }, catalogDiscoveryIndex(catalog))

    expect(validateDraftAgainstEvidence({ ...draft, pricing }, accepted)).toBe(accepted)
  })

  it('keeps conservative generic pricing valid without promotional evidence', () => {
    const accepted = evaluateCandidate(candidate, evidence, catalogDiscoveryIndex(catalog))

    expect(validateDraftAgainstEvidence(draft, accepted)).toBe(accepted)
  })

  it('rejects a different price even when currency and billing period are both present', () => {
    const proposedDraft = { ...draft, pricingMode: 'paid', pricing: '每月仅需 10 元，具体价格以官网为准' }
    const accepted = evaluateCandidate(candidate, {
      ...evidence,
      visibleText: `这是一个人工智能网页应用，需要注册账户，支持中文翻译，付费订阅每月 20 元。${'官网详细介绍产品能力。'.repeat(20)}`
    }, catalogDiscoveryIndex(catalog))

    expect(() => validateDraftAgainstEvidence(proposedDraft, accepted))
      .toThrow('insufficient_official_evidence')
  })

  it.each([
    ['free', { ...draft, pricingMode: 'free' }, 'This AI web app requires an account, supports Chinese translation, has no free plan, and is paid-only.'],
    ['freemium', draft, 'This AI web app requires an account, supports Chinese translation, has a free plan but no paid plans.'],
    ['paid', { ...draft, pricingMode: 'paid' }, 'This AI web app requires an account, supports Chinese translation, has no paid plans, and is completely free.'],
    ['contact', { ...draft, pricingMode: 'contact' }, 'This AI web app requires an account, supports Chinese translation, and has public self-service pricing with no sales contact.']
  ])('rejects contradictory %s pricing-mode evidence', (_mode, proposedDraft, claim) => {
    const accepted = evaluateCandidate(candidate, { ...evidence, visibleText: `${claim} ${'Product details. '.repeat(15)}` }, catalogDiscoveryIndex(catalog))
    expect(() => validateDraftAgainstEvidence(proposedDraft, accepted)).toThrow('insufficient_official_evidence')
  })

  it.each([
    ['native', { ...draft, chineseSupport: 'native' }, 'This AI web app requires an account, has free and paid plans, and does not support Chinese.'],
    ['partial', draft, 'This AI web app requires an account, has free and paid plans, and has no Chinese support.'],
    ['none', { ...draft, chineseSupport: 'none' }, 'This AI web app requires an account, has free and paid plans, and supports Chinese translation.']
  ])('rejects contradictory %s Chinese-support evidence', (_mode, proposedDraft, claim) => {
    const accepted = evaluateCandidate(candidate, { ...evidence, visibleText: `${claim} ${'Product details. '.repeat(15)}` }, catalogDiscoveryIndex(catalog))
    expect(() => validateDraftAgainstEvidence(proposedDraft, accepted)).toThrow('insufficient_official_evidence')
  })

  it.each([
    ['web', 'This AI product has no web app or web access.'],
    ['desktop', 'This AI product has no desktop app.'],
    ['mobile', 'This AI product has no mobile app.'],
    ['api', 'This AI product has no API access.'],
    ['extension', 'This AI product has no browser extension.']
  ])('rejects explicit negative evidence for claimed %s access', (accessMode, accessClaim) => {
    const accepted = evaluateCandidate(candidate, {
      ...evidence,
      visibleText: `${accessClaim} It requires an account, has free and paid plans, and supports Chinese translation. ${'Product details. '.repeat(15)}`
    }, catalogDiscoveryIndex(catalog))
    expect(() => validateDraftAgainstEvidence({ ...draft, accessModes: [accessMode] }, accepted))
      .toThrow('insufficient_official_evidence')
  })

  it.each([
    [true, 'This AI web app requires no account and works without signup.'],
    [false, 'This AI web app requires an account and signup is required.']
  ])('rejects contradictory requiresAccount=%s evidence', (requiresAccount, accountClaim) => {
    const accepted = evaluateCandidate(candidate, {
      ...evidence,
      visibleText: `${accountClaim} It has free and paid plans and supports Chinese translation. ${'Product details. '.repeat(15)}`
    }, catalogDiscoveryIndex(catalog))
    expect(() => validateDraftAgainstEvidence({ ...draft, requiresAccount }, accepted))
      .toThrow('insufficient_official_evidence')
  })
})
