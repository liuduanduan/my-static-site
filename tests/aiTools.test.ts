import { describe, expect, it } from 'vitest'
import {
  categoryLabels,
  getAllTools,
  getCategories,
  getFeaturedTools,
  getToolBySlug,
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

describe('ai tool directory data', () => {
  it('contains exactly 63 tools across the nine ordered categories', () => {
    expect(getAllTools()).toHaveLength(63)
    expect(Object.keys(categoryLabels)).toEqual(categories)
    expect(getCategories()).toHaveLength(9)
    expect(getCategories().every((category) => category.count >= 5)).toBe(true)
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
    expect(tools.every((tool) => tool.tags.length >= 2 && tool.searchTerms.length >= 2)).toBe(true)
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
})
