import { describe, expect, it } from 'vitest'
import {
  type AiTool,
  PAGE_SIZE,
  categoryLabels,
  filterTools,
  getAllTools,
  getCategories,
  getDiscoveryTools,
  getFeaturedTools,
  getToolBySlug,
  paginateTools,
  searchTools,
  validateToolCollection
} from '../docs/.vitepress/theme/domain/aiTools'

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

const pricingModes = ['free', 'freemium', 'paid', 'contact']
const chineseSupport = ['native', 'partial', 'none']

const approvedRoster = {
  chat: ['chatgpt', 'claude', 'deepseek', 'kimi', 'gemini', 'microsoft-copilot', 'doubao'],
  writing: ['notion', 'gamma', 'napkin', 'otter', 'grammarly', 'quillbot', 'wps-ai'],
  image: [
    'midjourney',
    'canva',
    'firefly',
    'leonardo-ai',
    'ideogram',
    'stable-diffusion',
    'remove-bg'
  ],
  video: ['runway', 'capcut', 'kling', 'pika', 'heygen', 'synthesia', 'luma-dream-machine'],
  coding: ['cursor', 'github-copilot', 'v0', 'lovable', 'replit', 'bolt-new', 'windsurf'],
  audio: ['elevenlabs', 'suno', 'udio', 'descript', 'adobe-podcast', 'aiva', 'murf'],
  research: [
    'perplexity',
    'elicit',
    'consensus',
    'scite',
    'notebooklm',
    'you-com',
    'semantic-scholar'
  ],
  marketing: [
    'jasper',
    'copy-ai',
    'hubspot-ai',
    'predis-ai',
    'buffer-ai',
    'adcreative-ai',
    'ocoya'
  ],
  automation: ['zapier', 'make', 'n8n', 'airtable', 'bardeen', 'rows', 'julius-ai']
} as const

const originalSlugs = [
  'chatgpt',
  'claude',
  'deepseek',
  'kimi',
  'midjourney',
  'canva',
  'firefly',
  'leonardo-ai',
  'runway',
  'capcut',
  'kling',
  'pika',
  'cursor',
  'github-copilot',
  'v0',
  'lovable',
  'notion',
  'perplexity',
  'gamma',
  'napkin',
  'elevenlabs',
  'suno',
  'udio',
  'otter'
]

function cloneCatalog(): Array<Record<string, unknown>> {
  return JSON.parse(JSON.stringify(getAllTools()))
}

function expectMutationToThrow(
  mutate: (catalog: Array<Record<string, unknown>>) => unknown,
  message: RegExp
): void {
  const catalog = cloneCatalog()
  const value = mutate(catalog) ?? catalog
  expect(() => validateToolCollection(value)).toThrow(message)
}

function attemptMutation(mutate: () => void): void {
  try {
    mutate()
  } catch {
    // Frozen public data rejects mutation in strict mode; state assertions below are authoritative.
  }
}

function assertReadonlyPublicCatalogTypes(): void {
  const allTool = getAllTools()[0]
  // @ts-expect-error Public catalog fields are readonly.
  allTool.name = 'compile-time mutation'
  // @ts-expect-error Public catalog nested arrays are readonly.
  allTool.tags.push('compile-time mutation')

  const lookupTool = getToolBySlug('cursor')!
  // @ts-expect-error Lookup results expose readonly tool records.
  lookupTool.category = 'chat'
  // @ts-expect-error Lookup result alternatives are readonly.
  lookupTool.alternatives.push('chatgpt')

  // @ts-expect-error Search result tool arrays are readonly.
  searchTools()[0].features.push('compile-time mutation')
  // @ts-expect-error Featured result tool records are readonly.
  getFeaturedTools()[0].tagline = 'compile-time mutation'
}

void assertReadonlyPublicCatalogTypes

describe('ai tool directory data', () => {
  it('contains exactly 63 tools across the nine ordered categories', () => {
    expect(getAllTools()).toHaveLength(63)
    expect(Object.keys(categoryLabels)).toEqual(categories)
    expect(getCategories()).toHaveLength(9)
    expect(getCategories().map(({ value, count }) => [value, count])).toEqual(
      categories.map((category) => [category, 7])
    )
    expect(
      Object.fromEntries(
        categories.map((category) => [
          category,
          getAllTools()
            .filter((tool) => tool.category === category)
            .map((tool) => tool.slug)
        ])
      )
    ).toEqual(approvedRoster)
  })

  it('retains every slug from the original 24-tool catalog', () => {
    const slugs = new Set(getAllTools().map((tool) => tool.slug))
    expect(originalSlugs.every((slug) => slugs.has(slug))).toBe(true)
  })

  it('passes the public collection validator', () => {
    expect(() => validateToolCollection(getAllTools())).not.toThrow()
  })

  it('keeps slugs, URLs, enums, search metadata, and alternatives valid', () => {
    const tools = getAllTools()
    const slugs = tools.map((tool) => tool.slug)
    const slugSet = new Set(slugs)

    expect(slugSet.size).toBe(tools.length)
    expect(tools.every((tool) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tool.slug))).toBe(true)
    expect(tools.every((tool) => tool.url.startsWith('https://'))).toBe(true)
    expect(tools.every((tool) => pricingModes.includes(tool.pricingMode))).toBe(true)
    expect(tools.every((tool) => chineseSupport.includes(tool.chineseSupport))).toBe(true)
    expect(tools.every((tool) => tool.tags.length >= 2 && tool.tags.length <= 5)).toBe(true)
    expect(
      tools.every(
        (tool) =>
          tool.searchTerms.length >= 2 &&
          tool.searchTerms.every((term) => /[\u3400-\u4DBF\u4E00-\u9FFF]/u.test(term))
      )
    ).toBe(true)
    expect(
      tools.every((tool) => tool.alternatives.every((slug) => slugSet.has(slug)))
    ).toBe(true)
  })

  it('looks up a tool by stable slug', () => {
    expect(getToolBySlug('cursor')?.name).toBe('Cursor')
    expect(getToolBySlug('missing-tool')).toBeUndefined()
  })

  it('returns all tools for an empty query and ordered featured tools for the home slice', () => {
    expect(searchTools()).toHaveLength(63)
    expect(getFeaturedTools().map((tool) => tool.slug)).toEqual([
      'chatgpt',
      'claude',
      'midjourney',
      'runway',
      'cursor',
      'perplexity'
    ])
  })

  it('matches names, descriptions, best-for phrases, tags, and search terms', () => {
    expect(searchTools('Cursor')).toHaveLength(1)
    expect(searchTools('会议纪要').map((tool) => tool.slug)).toContain('otter')
    expect(searchTools('中文研究').map((tool) => tool.slug)).toContain('kimi')
    expect(searchTools('自动化工作流').map((tool) => tool.slug)).toContain('zapier')
  })

  it('combines category and text filters', () => {
    expect(searchTools('', 'image')).toHaveLength(7)
    expect(searchTools('代码', 'coding').length).toBeGreaterThan(0)
    expect(searchTools('研究', 'research').length).toBeGreaterThan(0)
  })

  it('returns an empty list for an unknown query', () => {
    expect(searchTools('不存在的工具')).toEqual([])
  })

  it('does not let public API consumers mutate the module catalog', () => {
    const publicTools = getAllTools()
    const cursor = getToolBySlug('cursor')!
    const mutablePublicTools = publicTools as unknown as AiTool[]
    const mutableCursor = cursor as unknown as AiTool
    const originalLength = publicTools.length
    const originalName = cursor.name
    const originalCategory = cursor.category
    const originalTags = [...cursor.tags]
    const originalAlternatives = [...cursor.alternatives]
    let observed: {
      length: number
      name: string | undefined
      pollutedSearchCount: number
      codingCount: number | undefined
      chatCount: number | undefined
      tags: string[]
      alternatives: string[]
    }

    try {
      attemptMutation(() => { mutablePublicTools.push(mutablePublicTools[0]) })
      attemptMutation(() => { mutableCursor.name = 'Polluted Cursor' })
      attemptMutation(() => { mutableCursor.category = 'chat' })
      attemptMutation(() => { mutableCursor.tags.push('污染标签') })
      attemptMutation(() => { mutableCursor.alternatives.push('chatgpt') })

      observed = {
        length: getAllTools().length,
        name: getToolBySlug('cursor')?.name,
        pollutedSearchCount: searchTools('Polluted Cursor').length,
        codingCount: getCategories().find(({ value }) => value === 'coding')?.count,
        chatCount: getCategories().find(({ value }) => value === 'chat')?.count,
        tags: [...getToolBySlug('cursor')!.tags],
        alternatives: [...getToolBySlug('cursor')!.alternatives]
      }
    } finally {
      attemptMutation(() => { mutablePublicTools.splice(originalLength) })
      attemptMutation(() => { mutableCursor.name = originalName })
      attemptMutation(() => { mutableCursor.category = originalCategory })
      attemptMutation(() => {
        mutableCursor.tags.splice(0, mutableCursor.tags.length, ...originalTags)
      })
      attemptMutation(() => {
        mutableCursor.alternatives.splice(
          0,
          mutableCursor.alternatives.length,
          ...originalAlternatives
        )
      })
    }

    expect(observed).toEqual({
      length: originalLength,
      name: originalName,
      pollutedSearchCount: 0,
      codingCount: 7,
      chatCount: 7,
      tags: originalTags,
      alternatives: originalAlternatives
    })
  })
})

describe('ai tool directory filtering and discovery', () => {
  it('ranks a name match ahead of lower-priority field matches', () => {
    expect(filterTools({ query: 'notion' })[0].slug).toBe('notion')
  })

  it('ranks all name-tier matches ahead of lower-tier matches', () => {
    const results = filterTools({ query: 'AI' })
    const nameTierCount = results.filter((tool) => tool.name.toLowerCase().includes('ai')).length
    const firstLowerTierIndex = results.findIndex(
      (tool) => !tool.name.toLowerCase().includes('ai')
    )

    expect(nameTierCount).toBeGreaterThan(0)
    expect(firstLowerTierIndex).toBe(nameTierCount)
    expect(firstLowerTierIndex).toBeLessThan(results.length)
  })

  it.each([
    ['会议纪要', 'otter'],
    ['去背景', 'remove-bg'],
    ['论文检索', 'semantic-scholar']
  ])('finds the real task %s as %s', (query, slug) => {
    expect(filterTools({ query }).map((tool) => tool.slug)).toContain(slug)
  })

  it('normalizes query case and collapses surrounding and internal whitespace', () => {
    expect(filterTools({ query: '  MICROSOFT     COPILOT  ' })[0].slug).toBe(
      'microsoft-copilot'
    )
  })

  it('applies category, pricing, and Chinese-support filters together', () => {
    const results = filterTools({
      category: 'research',
      pricingMode: 'freemium',
      chineseSupport: 'partial'
    })

    expect(results.map((tool) => tool.slug)).toContain('notebooklm')
    expect(results.length).toBeGreaterThan(0)
    expect(
      results.every(
        (tool) =>
          tool.category === 'research' &&
          tool.pricingMode === 'freemium' &&
          tool.chineseSupport === 'partial'
      )
    ).toBe(true)
  })

  it('treats empty queries and explicit all filters like the defaults', () => {
    const defaults = filterTools()
    const explicitAll = filterTools({
      query: '',
      category: 'all',
      pricingMode: 'all',
      chineseSupport: 'all'
    })

    expect(defaults).toHaveLength(63)
    expect(explicitAll.map((tool) => tool.slug)).toEqual(defaults.map((tool) => tool.slug))
    expect(filterTools({ query: '', category: 'image' })).toHaveLength(7)
  })

  it('returns the exact ordered featured discovery set stably', () => {
    const expected = ['chatgpt', 'claude', 'midjourney', 'runway', 'cursor', 'perplexity']

    expect(getDiscoveryTools('featured').map((tool) => tool.slug)).toEqual(expected)
    expect(getDiscoveryTools('featured').map((tool) => tool.slug)).toEqual(expected)
  })

  it('returns the six latest tools by date then Chinese name order stably', () => {
    const expected = [
      'doubao',
      'kling',
      'adcreative-ai',
      'firefly',
      'adobe-podcast',
      'airtable'
    ]

    expect(getDiscoveryTools('latest')).toHaveLength(6)
    expect(getDiscoveryTools('latest').map((tool) => tool.slug)).toEqual(expected)
    expect(getDiscoveryTools('latest').map((tool) => tool.slug)).toEqual(expected)
  })

  it('returns a stable default free discovery set containing only free or freemium tools', () => {
    const first = getDiscoveryTools('free')
    const second = getDiscoveryTools('free')

    expect(first).toHaveLength(6)
    expect(first.length).toBeLessThanOrEqual(6)
    expect(first.every((tool) => ['free', 'freemium'].includes(tool.pricingMode))).toBe(true)
    expect(second.map((tool) => tool.slug)).toEqual(first.map((tool) => tool.slug))
  })

  it('uses the default discovery limit when the requested limit is invalid', () => {
    const expected = getDiscoveryTools('featured').map((tool) => tool.slug)

    expect(getDiscoveryTools('featured', Number.NaN).map((tool) => tool.slug)).toEqual(expected)
    expect(getDiscoveryTools('featured', 0).map((tool) => tool.slug)).toEqual(expected)
    expect(getDiscoveryTools('featured', 1.5).map((tool) => tool.slug)).toEqual(expected)
  })

  it('preserves legacy featured-wrapper limit semantics', () => {
    const featured = ['chatgpt', 'claude', 'midjourney', 'runway', 'cursor', 'perplexity']

    expect(getFeaturedTools().map((tool) => tool.slug)).toEqual(featured)
    expect(getFeaturedTools(2).map((tool) => tool.slug)).toEqual(featured.slice(0, 2))
    expect(getFeaturedTools(0)).toEqual([])
    expect(getFeaturedTools(-1)).toEqual([])
    expect(getFeaturedTools(1.5)).toEqual([])
    expect(getFeaturedTools(Number.POSITIVE_INFINITY)).toEqual([])
  })

  it('paginates the default catalog in non-overlapping 12-tool increments', () => {
    const items = filterTools()
    const firstPage = paginateTools(items, PAGE_SIZE)
    const secondPage = paginateTools(items, PAGE_SIZE * 2)

    expect(PAGE_SIZE).toBe(12)
    expect(firstPage).toEqual(items.slice(0, 12))
    expect(secondPage).toEqual(items.slice(0, 24))
    expect(new Set(secondPage.map((tool) => tool.slug))).toHaveProperty('size', 24)
  })

  it.each([Number.NaN, Number.POSITIVE_INFINITY, 11, 12.5])(
    'clamps invalid visible count %s to PAGE_SIZE',
    (visibleCount) => {
      const items = filterTools()
      expect(paginateTools(items, visibleCount)).toEqual(items.slice(0, PAGE_SIZE))
    }
  )

  it('does not mutate the pagination input', () => {
    const items = [...filterTools()]
    const before = items.map((tool) => tool.slug)
    const page = paginateTools(items, 24)

    expect(items.map((tool) => tool.slug)).toEqual(before)
    expect(page).not.toBe(items)
  })
})

describe('validateToolCollection', () => {
  it('leaves a caller-owned valid collection mutable', () => {
    const catalog = cloneCatalog()
    const validated = validateToolCollection(catalog)

    validated[0].name = 'Caller-owned mutation'
    validated[0].tags.push('调用方标签')

    expect(catalog[0].name).toBe('Caller-owned mutation')
    expect(catalog[0].tags).toContain('调用方标签')
  })

  it('rejects a non-array value and a collection below 60 tools', () => {
    expect(() => validateToolCollection({})).toThrow(/expected an array/)
    expect(() => validateToolCollection(cloneCatalog().slice(0, 59))).toThrow(/at least 60 tools/)
  })

  it('rejects unsafe and duplicate slugs', () => {
    expectMutationToThrow((catalog) => { catalog[0].slug = '../unsafe' }, /slug is unsafe/)
    expectMutationToThrow((catalog) => { catalog[1].slug = catalog[0].slug }, /duplicate slug/)
  })

  it('rejects unknown enum values', () => {
    expectMutationToThrow((catalog) => { catalog[0].category = 'unknown' }, /category contains unknown/)
    expectMutationToThrow((catalog) => { catalog[0].pricingMode = 'unknown' }, /pricingMode contains unknown/)
    expectMutationToThrow((catalog) => { catalog[0].chineseSupport = 'unknown' }, /chineseSupport contains unknown/)
    expectMutationToThrow((catalog) => { catalog[0].accessModes = ['terminal'] }, /accessModes contains unknown/)
  })

  it('rejects empty required strings and invalid required lists', () => {
    expectMutationToThrow((catalog) => { catalog[0].name = '  ' }, /name must be a non-empty string/)
    expectMutationToThrow((catalog) => { catalog[0].features = [] }, /features must contain at least 1/)
    expectMutationToThrow((catalog) => { catalog[0].bestFor = [''] }, /bestFor must contain at least 1/)
  })

  it('rejects non-HTTPS and invalid URLs', () => {
    expectMutationToThrow((catalog) => { catalog[0].url = 'http://example.com' }, /url must use HTTPS/)
    expectMutationToThrow((catalog) => { catalog[0].url = 'not a url' }, /url must be a valid HTTPS URL/)
  })

  it('rejects malformed and impossible dates', () => {
    expectMutationToThrow((catalog) => { catalog[0].addedAt = '2026-8-26' }, /addedAt must use YYYY-MM-DD/)
    expectMutationToThrow((catalog) => { catalog[0].updatedAt = '2026-02-30' }, /updatedAt is not a valid calendar date/)
  })

  it('rejects duplicate, non-positive, and non-integer featured orders', () => {
    expectMutationToThrow((catalog) => { catalog[1].featuredOrder = catalog[0].featuredOrder }, /duplicate featuredOrder/)
    expectMutationToThrow((catalog) => { catalog[0].featuredOrder = 0 }, /featuredOrder must be a positive integer/)
    expectMutationToThrow((catalog) => { catalog[0].featuredOrder = 1.5 }, /featuredOrder must be a positive integer/)
  })

  it('rejects unknown alternatives and underfilled required categories', () => {
    expectMutationToThrow((catalog) => { catalog[0].alternatives = ['missing-tool'] }, /alternatives references unknown slug/)
    expectMutationToThrow((catalog) => {
      catalog.filter((tool) => tool.category === 'chat').slice(0, 3).forEach((tool) => {
        tool.category = 'writing'
      })
    }, /category chat must contain at least five tools/)
  })

  it('rejects self-referential and duplicate alternatives', () => {
    expectMutationToThrow(
      (catalog) => { catalog[0].alternatives = [catalog[0].slug] },
      /alternatives must not reference the tool itself/
    )
    expectMutationToThrow(
      (catalog) => { catalog[0].alternatives = [catalog[1].slug, catalog[1].slug] },
      /alternatives must not contain duplicates/
    )
  })

  it('rejects a non-boolean requiresAccount', () => {
    expectMutationToThrow((catalog) => { catalog[0].requiresAccount = 'yes' }, /requiresAccount must be a boolean/)
  })

  it('requires two to five tags', () => {
    expectMutationToThrow((catalog) => { catalog[0].tags = ['对话'] }, /tags must contain at least 2/)
    expectMutationToThrow(
      (catalog) => { catalog[0].tags = ['一', '二', '三', '四', '五', '六'] },
      /tags must contain at most 5/
    )
  })

  it('requires at least two non-empty Chinese search terms', () => {
    expectMutationToThrow((catalog) => { catalog[0].searchTerms = ['中文问答'] }, /searchTerms must contain at least 2/)
    expectMutationToThrow((catalog) => { catalog[0].searchTerms = ['中文问答', ''] }, /searchTerms must contain at least 2/)
    expectMutationToThrow(
      (catalog) => { catalog[0].searchTerms = ['中文问答', 'document analysis'] },
      /searchTerms entries must contain Chinese characters/
    )
  })
})
