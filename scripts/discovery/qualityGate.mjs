import { candidateKey } from './contracts.mjs'

const CATEGORIES = Object.freeze([
  'chat',
  'writing',
  'image',
  'video',
  'coding',
  'audio',
  'research',
  'marketing',
  'automation'
])
const CATEGORY_SET = new Set(CATEGORIES)
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MINIMUM_VISIBLE_CHARACTERS = 200
const MAXIMUM_TITLE_CHARACTERS = 300
const MAXIMUM_META_CHARACTERS = 1_000
const MAXIMUM_VISIBLE_CHARACTERS = 40_000

const PRODUCT_CUES = Object.freeze([
  'ai',
  'artificial intelligence',
  'machine learning',
  'generative',
  'llm',
  'large language model',
  'assistant',
  'agent',
  'tool',
  'platform',
  'software',
  'application',
  'api',
  'workflow',
  '人工智能',
  '机器学习',
  '生成式',
  '大模型',
  '智能体',
  '助手',
  '工具',
  '平台',
  '软件',
  '应用',
  '工作流'
])

const NON_PRODUCT_PATTERNS = Object.freeze([
  /\bdomain (?:is )?for sale\b/iu,
  /\bbuy this domain\b/iu,
  /\bparked domain\b/iu,
  /\bcoming soon\b/iu,
  /\bunder construction\b/iu,
  /\b(?:404|403|500|502|503)\s+(?:error|not found|forbidden|server error)\b/iu,
  /\bpage not found\b/iu,
  /\bservice unavailable\b/iu,
  /域名(?:出售|停放)/u,
  /即将上线|敬请期待|网站建设中|页面不存在|服务不可用/u
])

const PROHIBITED_PATTERNS = Object.freeze([
  /\b(?:casino|betting|gambling|sportsbook|porn(?:ography)?|adult content|malware|ransomware|phishing|credential theft|token speculation)\b/iu,
  /博彩|赌博|赌场|色情|成人视频|恶意软件|勒索软件|网络钓鱼|仿冒|窃取凭据|代币投机/u
])

function gateError(code) {
  const error = new Error(code)
  error.code = code
  throw error
}

function normalizeText(value, maximum = Infinity) {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/\s+/gu, ' ').slice(0, maximum)
}

function normalizedName(value) {
  return normalizeText(value).normalize('NFKC').toLocaleLowerCase('en-US')
}

function normalizedSlugFromName(value) {
  return normalizeText(value).normalize('NFKC')
    .toLocaleLowerCase('en-US')
    .replace(/['’]/gu, '')
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
}

function normalizedUrl(value) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return ''
    url.hash = ''
    return url.toString()
  } catch {
    return ''
  }
}

function normalizedDomain(value) {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./u, '')
  } catch {
    return ''
  }
}

function safeAlternative(tool) {
  if (!tool || typeof tool !== 'object') return null
  const slug = typeof tool.slug === 'string' ? tool.slug.trim() : ''
  const name = normalizeText(tool.name, 160)
  const category = tool.category
  if (!SLUG.test(slug) || !name || !CATEGORY_SET.has(category)) return null
  return Object.freeze({ slug, name, category })
}

export function catalogDiscoveryIndex(tools) {
  if (!Array.isArray(tools)) gateError('duplicate_catalog_entry')

  const urls = []
  const domains = []
  const names = []
  const slugs = []
  const alternatives = []
  const categoryCounts = Object.fromEntries(CATEGORIES.map((category) => [category, 0]))

  for (const tool of tools) {
    if (!tool || typeof tool !== 'object') gateError('duplicate_catalog_entry')
    const url = normalizedUrl(tool.url)
    const domain = normalizedDomain(tool.url)
    const name = normalizedName(tool.name)
    const slug = typeof tool.slug === 'string' ? tool.slug.trim() : ''
    const alternative = safeAlternative(tool)
    if (!url || !domain || !name || !SLUG.test(slug) || !alternative) {
      gateError('duplicate_catalog_entry')
    }
    urls.push(url)
    domains.push(domain)
    names.push(name)
    slugs.push(slug)
    alternatives.push(alternative)
    categoryCounts[alternative.category] += 1
  }

  return Object.freeze({
    urls: Object.freeze(urls),
    domains: Object.freeze(domains),
    names: Object.freeze(names),
    slugs: Object.freeze(slugs),
    categoryCounts: Object.freeze(categoryCounts),
    alternatives: Object.freeze(alternatives)
  })
}

function assertIndex(index) {
  if (!index || typeof index !== 'object'
    || !Array.isArray(index.urls)
    || !Array.isArray(index.domains)
    || !Array.isArray(index.names)
    || !Array.isArray(index.slugs)
    || !Array.isArray(index.alternatives)
    || !index.categoryCounts) gateError('duplicate_catalog_entry')
}

function evidenceSummary(evidence) {
  const title = normalizeText(evidence?.title, MAXIMUM_TITLE_CHARACTERS)
  const metaDescription = normalizeText(evidence?.metaDescription, MAXIMUM_META_CHARACTERS)
  const visibleText = normalizeText(evidence?.visibleText, MAXIMUM_VISIBLE_CHARACTERS)
  const canonicalUrl = normalizedUrl(evidence?.canonicalUrl)
  const pricingLinks = Array.isArray(evidence?.pricingLinks)
    ? evidence.pricingLinks.filter((value) => normalizedUrl(value))
    : []
  return {
    title,
    metaDescription,
    visibleText,
    visibleCharacterCount: visibleText.length,
    hasCanonicalUrl: evidence?.hasCanonicalUrl === true || Boolean(canonicalUrl),
    hasPricingLink: evidence?.hasPricingLink === true || pricingLinks.length > 0
  }
}

function includesCue(text) {
  const normalized = text.toLocaleLowerCase('en-US')
  return PRODUCT_CUES.some((cue) => {
    if (/^[a-z0-9 ]+$/u.test(cue)) {
      const escaped = cue
        .split(/\s+/u)
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('\\s+')
      return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'u').test(normalized)
    }
    return normalized.includes(cue)
  })
}

function hasPattern(patterns, text) {
  return patterns.some((pattern) => pattern.test(text))
}

function assertNotDuplicate(candidate, index, draft) {
  const url = normalizedUrl(candidate?.url)
  const domain = normalizedDomain(candidate?.url)
  const names = [normalizedName(candidate?.name)]
  const slugs = [normalizedSlugFromName(candidate?.name)]
  if (draft) {
    names.push(normalizedName(draft.name))
    slugs.push(typeof draft.slug === 'string' ? draft.slug.trim() : '')
  }
  if (!url || !domain || !names[0]
    || index.urls.includes(url)
    || index.domains.includes(domain)
    || names.some((name) => name && index.names.includes(name))
    || slugs.some((slug) => slug && index.slugs.includes(slug))) {
    gateError('duplicate_catalog_entry')
  }
}

export function evaluateCandidate(candidate, evidence, index) {
  assertIndex(index)
  assertNotDuplicate(candidate, index)
  const summary = evidenceSummary(evidence)
  if (!summary.title || summary.visibleCharacterCount < MINIMUM_VISIBLE_CHARACTERS) {
    gateError('insufficient_official_evidence')
  }

  const allText = `${summary.title}\n${summary.metaDescription}\n${summary.visibleText}`
  if (hasPattern(PROHIBITED_PATTERNS, allText)) gateError('prohibited_candidate')
  if (hasPattern(NON_PRODUCT_PATTERNS, allText) || !includesCue(allText)) {
    gateError('non_product_page')
  }

  return Object.freeze(summary)
}

export function scoreCandidate(candidate, evidence, index, draft) {
  const summary = evaluateCandidate(candidate, evidence, index)
  assertNotDuplicate(candidate, index, draft)
  if (!draft || !CATEGORY_SET.has(draft.category)) gateError('discovery_enricher_invalid_output')
  const categoryCount = index.categoryCounts[draft.category]
  if (!Number.isInteger(categoryCount) || categoryCount < 2) gateError('discovery_enricher_invalid_output')

  const sourceScore = Number.isInteger(candidate?.sourceScore) ? candidate.sourceScore : 0
  const completeness = 10
    + (summary.metaDescription ? 5 : 0)
    + (summary.hasCanonicalUrl ? 3 : 0)
    + (summary.hasPricingLink ? 2 : 0)
    + Math.min(10, Math.floor(summary.visibleCharacterCount / 1_000))
  const largestCategory = Math.max(...Object.values(index.categoryCounts))
  const categoryGap = Math.max(0, largestCategory - categoryCount)
  return Math.trunc(sourceScore + completeness + categoryGap)
}

export function compareCandidatesForEnrichment(left, right) {
  const sourceDifference = (Number.isInteger(right?.sourceScore) ? right.sourceScore : 0)
    - (Number.isInteger(left?.sourceScore) ? left.sourceScore : 0)
  if (sourceDifference) return sourceDifference
  const dateDifference = String(left?.discoveredAt ?? '').localeCompare(String(right?.discoveredAt ?? ''))
  if (dateDifference) return dateDifference
  return candidateKey(left).localeCompare(candidateKey(right))
}

export function selectDiscoveryAlternatives(index, category, slug) {
  assertIndex(index)
  if (!CATEGORY_SET.has(category) || typeof slug !== 'string' || !SLUG.test(slug)) {
    gateError('discovery_enricher_invalid_output')
  }
  const alternatives = index.alternatives
    .filter((tool) => tool.category === category && tool.slug !== slug)
    .slice(0, 2)
    .map((tool) => tool.slug)
  if (alternatives.length !== 2) gateError('discovery_enricher_invalid_output')
  return Object.freeze(alternatives)
}

export const discoveryQualityGateLimits = Object.freeze({
  minimumVisibleCharacters: MINIMUM_VISIBLE_CHARACTERS,
  maximumTitleCharacters: MAXIMUM_TITLE_CHARACTERS,
  maximumMetaCharacters: MAXIMUM_META_CHARACTERS,
  maximumVisibleCharacters: MAXIMUM_VISIBLE_CHARACTERS
})
