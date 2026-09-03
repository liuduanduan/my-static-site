export const discoveryCategories = Object.freeze([
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
export const discoveryPricingModes = Object.freeze(['free', 'freemium', 'paid', 'contact'])
export const discoveryChineseSupportModes = Object.freeze(['native', 'partial', 'none'])
export const discoveryAccessModes = Object.freeze(['web', 'desktop', 'mobile', 'api', 'extension'])

const listSchema = (minimum, maximum, itemMaximum = 100, extra = {}) => ({
  type: 'array',
  minItems: minimum,
  maxItems: maximum,
  items: { type: 'string', minLength: 2, maxLength: itemMaximum },
  ...extra
})

const required = Object.freeze([
  'slug',
  'name',
  'category',
  'tagline',
  'description',
  'bestFor',
  'features',
  'pricing',
  'pricingMode',
  'chineseSupport',
  'accessModes',
  'requiresAccount',
  'tags',
  'searchTerms',
  'pros',
  'cons'
])

export const discoveryDraftJsonSchema = Object.freeze({
  type: 'object',
  additionalProperties: false,
  required,
  properties: {
    slug: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', minLength: 1, maxLength: 80 },
    name: { type: 'string', minLength: 1, maxLength: 160 },
    category: { type: 'string', enum: discoveryCategories },
    tagline: { type: 'string', minLength: 8, maxLength: 120 },
    description: { type: 'string', minLength: 20, maxLength: 500 },
    bestFor: listSchema(3, 3, 80),
    features: listSchema(3, 3, 80),
    pricing: { type: 'string', minLength: 8, maxLength: 160 },
    pricingMode: { type: 'string', enum: discoveryPricingModes },
    chineseSupport: { type: 'string', enum: discoveryChineseSupportModes },
    accessModes: { type: 'array', minItems: 1, maxItems: 5, uniqueItems: true, items: { type: 'string', enum: discoveryAccessModes } },
    requiresAccount: { type: 'boolean' },
    tags: listSchema(2, 5, 30),
    searchTerms: listSchema(2, 8, 40),
    pros: listSchema(2, 4, 100),
    cons: listSchema(2, 4, 100)
  }
})

const categories = new Set(discoveryCategories)
const pricingModes = new Set(discoveryPricingModes)
const chineseSupportModes = new Set(discoveryChineseSupportModes)
const accessModes = new Set(discoveryAccessModes)
const requiredKeys = new Set(required)
const chineseCharacterPattern = /[\u3400-\u4DBF\u4E00-\u9FFF]/u
const disallowedClaimPatterns = Object.freeze([
  /(?:全球|行业|市场|国内|世界)(?:第一|领先|最佳|最强|排名)/iu,
  /排名\s*(?:第?一|top\s*\d+)/iu,
  /(?:百万|千万|亿万|\d+(?:\.\d+)?\s*(?:万|亿))\s*(?:用户|客户|团队|公司)/iu,
  /(?:100%|百分之百)\s*(?:准确|可靠|安全|保证)/iu,
  /(?:保证|承诺)\s*(?:收录|效果|准确|收益)/iu,
  /(?:永久|完全|全部)免费/iu,
  /无限(?:额度|次数|使用)/iu,
  /官方(?:授权|合作伙伴|认证)/iu,
  /评分\s*[:：]?\s*\d/iu,
  /\b(?:best|number one|no\.?\s*1|top\s*\d+)\b/iu,
  /\b\d+(?:\.\d+)?\s*(?:million|billion)\s+(?:users|customers|teams|companies)\b/iu
])

function invalid() {
  throw new Error('discovery_enricher_invalid_output')
}

function normalizedString(value, minimum, maximum) {
  if (typeof value !== 'string') return invalid()
  const normalized = value.trim().replace(/\s+/gu, ' ')
  if (normalized.length < minimum || normalized.length > maximum || /[\u0000-\u001f\u007f]/u.test(normalized)) {
    return invalid()
  }
  return normalized
}

function normalizedList(value, minimum, maximum, itemMaximum) {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) return invalid()
  const normalized = value.map((entry) => normalizedString(entry, 2, itemMaximum))
  if (new Set(normalized).size !== normalized.length) return invalid()
  return Object.freeze(normalized)
}

function assertNoUnsupportedClaims(draft) {
  const allText = [
    draft.name,
    draft.tagline,
    draft.description,
    draft.pricing,
    ...draft.bestFor,
    ...draft.features,
    ...draft.tags,
    ...draft.searchTerms,
    ...draft.pros,
    ...draft.cons
  ].join('\n')
  if (disallowedClaimPatterns.some((pattern) => pattern.test(allText))) return invalid()
  if (!/以官网为准[。！!]?$/u.test(draft.pricing)) return invalid()
}

export function parseDiscoveryDraft(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).length !== required.length
    || Object.keys(value).some((key) => !requiredKeys.has(key))) return invalid()

  const slug = normalizedString(value.slug, 1, 80)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)
    || !categories.has(value.category)
    || !pricingModes.has(value.pricingMode)
    || !chineseSupportModes.has(value.chineseSupport)
    || typeof value.requiresAccount !== 'boolean') return invalid()

  const access = normalizedList(value.accessModes, 1, 5, 20)
  if (access.some((mode) => !accessModes.has(mode))) return invalid()

  const draft = {
    slug,
    name: normalizedString(value.name, 1, 160),
    category: value.category,
    tagline: normalizedString(value.tagline, 8, 120),
    description: normalizedString(value.description, 20, 500),
    bestFor: normalizedList(value.bestFor, 3, 3, 80),
    features: normalizedList(value.features, 3, 3, 80),
    pricing: normalizedString(value.pricing, 8, 160),
    pricingMode: value.pricingMode,
    chineseSupport: value.chineseSupport,
    accessModes: access,
    requiresAccount: value.requiresAccount,
    tags: normalizedList(value.tags, 2, 5, 30),
    searchTerms: normalizedList(value.searchTerms, 2, 8, 40),
    pros: normalizedList(value.pros, 2, 4, 100),
    cons: normalizedList(value.cons, 2, 4, 100)
  }
  if (draft.searchTerms.some((term) => !chineseCharacterPattern.test(term))) return invalid()
  assertNoUnsupportedClaims(draft)
  return Object.freeze(draft)
}
