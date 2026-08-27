const stringList = (minimum, maximum, itemMaximum = 100) => ({
  type: 'array',
  minItems: minimum,
  maxItems: maximum,
  items: { type: 'string', minLength: 2, maxLength: itemMaximum }
})

export const toolDraftJsonSchema = Object.freeze({
  type: 'object',
  additionalProperties: false,
  required: [
    'slug',
    'description',
    'bestFor',
    'features',
    'pricing',
    'requiresAccount',
    'tags',
    'searchTerms',
    'pros',
    'cons'
  ],
  properties: {
    slug: {
      type: 'string',
      pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
      minLength: 1,
      maxLength: 80
    },
    description: { type: 'string', minLength: 20, maxLength: 500 },
    bestFor: stringList(3, 3, 80),
    features: stringList(3, 3, 80),
    pricing: { type: 'string', minLength: 8, maxLength: 160 },
    requiresAccount: { type: 'boolean' },
    tags: stringList(2, 5, 30),
    searchTerms: stringList(2, 8, 40),
    pros: stringList(2, 4, 100),
    cons: stringList(2, 4, 100)
  }
})

const topLevelKeys = new Set(toolDraftJsonSchema.required)
const chineseCharacterPattern = /[\u3400-\u4DBF\u4E00-\u9FFF]/u
const disallowedClaimPatterns = [
  /(?:全球|行业|市场|国内|世界)(?:第一|领先|最佳|最强|排名)/iu,
  /排名\s*(?:第?一|top\s*\d+)/iu,
  /(?:百万|千万|亿万|\d+(?:\.\d+)?\s*(?:万|亿))\s*(?:用户|客户|团队|公司)/iu,
  /(?:100%|百分之百)\s*(?:准确|可靠|安全|保证)/iu,
  /(?:保证|承诺)\s*(?:收录|效果|准确|收益)/iu,
  /(?:永久|完全|全部)免费/iu,
  /无限(?:额度|次数|使用)/iu,
  /官方(?:授权|合作伙伴|认证)/iu,
  /评分\s*[:：]?\s*\d/iu
]

function invalid() {
  throw new Error('enricher_invalid_output')
}

function normalizedString(value, minimum, maximum) {
  if (typeof value !== 'string') return invalid()
  const normalized = value.trim().replace(/\s+/g, ' ')
  if (normalized.length < minimum || normalized.length > maximum) return invalid()
  return normalized
}

function normalizedList(value, minimum, maximum, itemMaximum) {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) {
    return invalid()
  }
  const normalized = value.map((item) => normalizedString(item, 2, itemMaximum))
  if (new Set(normalized).size !== normalized.length) return invalid()
  return normalized
}

function assertNoDisallowedClaims(value) {
  const allText = [
    value.description,
    value.pricing,
    ...value.bestFor,
    ...value.features,
    ...value.tags,
    ...value.searchTerms,
    ...value.pros,
    ...value.cons
  ].join('\n')
  if (disallowedClaimPatterns.some((pattern) => pattern.test(allText))) return invalid()
  if (!/(?:以官网为准|官网为准)/u.test(value.pricing)) return invalid()
}

export function parseContentDraft(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return invalid()
  const record = value
  if (
    Object.keys(record).length !== topLevelKeys.size ||
    Object.keys(record).some((key) => !topLevelKeys.has(key))
  ) return invalid()

  const slug = normalizedString(record.slug, 1, 80)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return invalid()
  if (typeof record.requiresAccount !== 'boolean') return invalid()

  const draft = {
    slug,
    description: normalizedString(record.description, 20, 500),
    bestFor: normalizedList(record.bestFor, 3, 3, 80),
    features: normalizedList(record.features, 3, 3, 80),
    pricing: normalizedString(record.pricing, 8, 160),
    requiresAccount: record.requiresAccount,
    tags: normalizedList(record.tags, 2, 5, 30),
    searchTerms: normalizedList(record.searchTerms, 2, 8, 40),
    pros: normalizedList(record.pros, 2, 4, 100),
    cons: normalizedList(record.cons, 2, 4, 100)
  }
  if (draft.searchTerms.some((term) => !chineseCharacterPattern.test(term))) return invalid()
  assertNoDisallowedClaims(draft)

  Object.values(draft).forEach((entry) => {
    if (Array.isArray(entry)) Object.freeze(entry)
  })
  return Object.freeze(draft)
}
