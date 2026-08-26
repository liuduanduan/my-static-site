import rawTools from './ai-tools.json'

export type ToolCategory =
  | 'chat'
  | 'writing'
  | 'image'
  | 'video'
  | 'coding'
  | 'audio'
  | 'research'
  | 'marketing'
  | 'automation'

export type PricingMode = 'free' | 'freemium' | 'paid' | 'contact'
export type ChineseSupport = 'native' | 'partial' | 'none'
export type AccessMode = 'web' | 'desktop' | 'mobile' | 'api' | 'extension'

export interface AiTool {
  slug: string
  name: string
  category: ToolCategory
  tagline: string
  description: string
  bestFor: string[]
  features: string[]
  pricing: string
  pricingMode: PricingMode
  chineseSupport: ChineseSupport
  accessModes: AccessMode[]
  requiresAccount: boolean
  tags: string[]
  searchTerms: string[]
  pros: string[]
  cons: string[]
  url: string
  addedAt: string
  updatedAt: string
  featuredOrder?: number
  alternatives: string[]
}

export type ReadonlyAiTool = {
  readonly [Field in keyof AiTool]: AiTool[Field] extends Array<infer Item>
    ? readonly Item[]
    : AiTool[Field]
}

export type CategoryFilter = ToolCategory | 'all'

export const categoryLabels: Record<ToolCategory, string> = {
  chat: '对话与模型',
  writing: '写作与办公',
  image: '图像与设计',
  video: '视频与数字人',
  coding: '编程与建站',
  audio: '音频与音乐',
  research: '搜索与研究',
  marketing: '营销与社媒',
  automation: '自动化与数据'
}

export const pricingModeLabels: Record<PricingMode, string> = {
  free: '免费',
  freemium: '免费增值',
  paid: '付费',
  contact: '联系询价'
}

export const chineseSupportLabels: Record<ChineseSupport, string> = {
  native: '原生中文',
  partial: '部分支持',
  none: '暂不支持'
}

export const accessModeLabels: Record<AccessMode, string> = {
  web: '网页',
  desktop: '桌面端',
  mobile: '移动端',
  api: 'API',
  extension: '浏览器扩展'
}

const requiredCategories = Object.keys(categoryLabels) as ToolCategory[]
const pricingModes = Object.keys(pricingModeLabels) as PricingMode[]
const chineseSupportModes = Object.keys(chineseSupportLabels) as ChineseSupport[]
const accessModes = Object.keys(accessModeLabels) as AccessMode[]
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const datePattern = /^\d{4}-\d{2}-\d{2}$/
const chineseCharacterPattern = /[\u3400-\u4DBF\u4E00-\u9FFF]/u

function fail(message: string): never {
  throw new Error(`Invalid AI tool collection: ${message}`)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requireString(record: Record<string, unknown>, field: string, context: string): string {
  const value = record[field]
  if (typeof value !== 'string' || value.trim() === '') {
    fail(`${context}.${field} must be a non-empty string`)
  }
  return value
}

function requireStringList(
  record: Record<string, unknown>,
  field: string,
  context: string,
  minimum = 1
): string[] {
  const value = record[field]
  if (
    !Array.isArray(value) ||
    value.length < minimum ||
    value.some((item) => typeof item !== 'string' || item.trim() === '')
  ) {
    fail(`${context}.${field} must contain at least ${minimum} non-empty string(s)`)
  }
  return value as string[]
}

function requireEnum<T extends string>(
  value: unknown,
  allowed: readonly T[],
  field: string,
  context: string
): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    fail(`${context}.${field} contains unknown value ${String(value)}`)
  }
  return value as T
}

function requireDate(record: Record<string, unknown>, field: string, context: string): string {
  const value = requireString(record, field, context)
  if (!datePattern.test(value)) fail(`${context}.${field} must use YYYY-MM-DD`)

  const parsed = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    fail(`${context}.${field} is not a valid calendar date`)
  }
  return value
}

export function validateToolCollection(value: unknown): AiTool[] {
  if (!Array.isArray(value)) fail('expected an array')
  if (value.length < 60) fail('must contain at least 60 tools')

  const seenSlugs = new Set<string>()
  const seenFeaturedOrders = new Set<number>()
  const categoryCounts = new Map<ToolCategory, number>(
    requiredCategories.map((category) => [category, 0])
  )

  value.forEach((candidate, index) => {
    const context = `tool[${index}]`
    if (!isRecord(candidate)) fail(`${context} must be an object`)

    const slug = requireString(candidate, 'slug', context)
    if (!slugPattern.test(slug)) fail(`${context}.slug is unsafe`)
    if (seenSlugs.has(slug)) fail(`duplicate slug ${slug}`)
    seenSlugs.add(slug)

    requireString(candidate, 'name', context)
    const category = requireEnum(candidate.category, requiredCategories, 'category', context)
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1)
    requireString(candidate, 'tagline', context)
    requireString(candidate, 'description', context)
    requireStringList(candidate, 'bestFor', context)
    requireStringList(candidate, 'features', context)
    requireString(candidate, 'pricing', context)
    requireEnum(candidate.pricingMode, pricingModes, 'pricingMode', context)
    requireEnum(candidate.chineseSupport, chineseSupportModes, 'chineseSupport', context)

    const toolAccessModes = requireStringList(candidate, 'accessModes', context)
    toolAccessModes.forEach((mode) => requireEnum(mode, accessModes, 'accessModes', context))
    if (new Set(toolAccessModes).size !== toolAccessModes.length) {
      fail(`${context}.accessModes must not contain duplicates`)
    }

    if (typeof candidate.requiresAccount !== 'boolean') {
      fail(`${context}.requiresAccount must be a boolean`)
    }

    const tags = requireStringList(candidate, 'tags', context, 2)
    if (tags.length > 5) fail(`${context}.tags must contain at most 5 strings`)

    const searchTerms = requireStringList(candidate, 'searchTerms', context, 2)
    if (searchTerms.some((term) => !chineseCharacterPattern.test(term))) {
      fail(`${context}.searchTerms entries must contain Chinese characters`)
    }
    requireStringList(candidate, 'pros', context)
    requireStringList(candidate, 'cons', context)

    const url = requireString(candidate, 'url', context)
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      fail(`${context}.url must be a valid HTTPS URL`)
    }
    if (parsedUrl.protocol !== 'https:') fail(`${context}.url must use HTTPS`)

    requireDate(candidate, 'addedAt', context)
    requireDate(candidate, 'updatedAt', context)

    const alternatives = requireStringList(candidate, 'alternatives', context)
    if (alternatives.includes(slug)) {
      fail(`${context}.alternatives must not reference the tool itself`)
    }
    if (new Set(alternatives).size !== alternatives.length) {
      fail(`${context}.alternatives must not contain duplicates`)
    }

    if (candidate.featuredOrder !== undefined) {
      const order = candidate.featuredOrder
      if (typeof order !== 'number' || !Number.isInteger(order) || order <= 0) {
        fail(`${context}.featuredOrder must be a positive integer`)
      }
      if (seenFeaturedOrders.has(order)) fail(`duplicate featuredOrder ${order}`)
      seenFeaturedOrders.add(order)
    }
  })

  value.forEach((candidate, index) => {
    const record = candidate as Record<string, unknown>
    const alternatives = record.alternatives as string[]
    alternatives.forEach((alternative) => {
      if (!slugPattern.test(alternative) || !seenSlugs.has(alternative)) {
        fail(`tool[${index}].alternatives references unknown slug ${alternative}`)
      }
    })
  })

  requiredCategories.forEach((category) => {
    if ((categoryCounts.get(category) ?? 0) < 5) {
      fail(`category ${category} must contain at least five tools`)
    }
  })

  return value as AiTool[]
}

function freezeToolCollection(collection: AiTool[]): readonly ReadonlyAiTool[] {
  collection.forEach((tool) => {
    Object.freeze(tool.bestFor)
    Object.freeze(tool.features)
    Object.freeze(tool.accessModes)
    Object.freeze(tool.tags)
    Object.freeze(tool.searchTerms)
    Object.freeze(tool.pros)
    Object.freeze(tool.cons)
    Object.freeze(tool.alternatives)
    Object.freeze(tool)
  })

  return Object.freeze(collection)
}

const tools = freezeToolCollection(validateToolCollection(rawTools))

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase()
}

export function getAllTools(): readonly ReadonlyAiTool[] {
  return tools
}

export function getToolBySlug(slug: string): ReadonlyAiTool | undefined {
  return tools.find((tool) => tool.slug === slug)
}

export function getCategoryLabel(category: ToolCategory): string {
  return categoryLabels[category]
}

export function getCategories(): ReadonlyArray<{
  value: ToolCategory
  label: string
  count: number
}> {
  return requiredCategories.map((value) => ({
    value,
    label: categoryLabels[value],
    count: tools.filter((tool) => tool.category === value).length
  }))
}

export function searchTools(
  query = '',
  category: CategoryFilter = 'all'
): readonly ReadonlyAiTool[] {
  const normalizedQuery = normalize(query)

  return tools.filter((tool) => {
    if (category !== 'all' && tool.category !== category) return false
    if (!normalizedQuery) return true

    const haystack = [
      tool.name,
      tool.tagline,
      tool.description,
      ...tool.bestFor,
      ...tool.features,
      ...tool.tags,
      ...tool.searchTerms
    ]
      .join(' ')
      .toLocaleLowerCase()

    return haystack.includes(normalizedQuery)
  })
}

export function getFeaturedTools(limit = 6): readonly ReadonlyAiTool[] {
  return tools
    .filter((tool) => tool.featuredOrder !== undefined)
    .sort((left, right) => left.featuredOrder! - right.featuredOrder!)
    .slice(0, limit)
}
