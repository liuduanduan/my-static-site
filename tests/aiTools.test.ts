import { describe, expect, it } from 'vitest'
import {
  getAllTools,
  getCategories,
  getFeaturedTools,
  getToolBySlug,
  searchTools
} from '../docs/.vitepress/theme/domain/aiTools'

describe('ai tool directory data', () => {
  it('contains a curated seed set across six categories', () => {
    expect(getAllTools()).toHaveLength(24)
    expect(getCategories()).toHaveLength(6)
    expect(getCategories().every((category) => category.count === 4)).toBe(true)
  })

  it('looks up a tool by stable slug', () => {
    expect(getToolBySlug('cursor')?.name).toBe('Cursor')
    expect(getToolBySlug('missing-tool')).toBeUndefined()
  })

  it('returns all tools for an empty query and featured tools for the home slice', () => {
    expect(searchTools()).toHaveLength(24)
    expect(getFeaturedTools()).toHaveLength(6)
  })

  it('matches names, descriptions, and best-for phrases', () => {
    expect(searchTools('Cursor')).toHaveLength(1)
    expect(searchTools('会议纪要').map((tool) => tool.slug)).toContain('otter')
    expect(searchTools('中文研究').map((tool) => tool.slug)).toContain('kimi')
  })

  it('combines category and text filters', () => {
    expect(searchTools('', 'image')).toHaveLength(4)
    expect(searchTools('免费', 'coding')).toHaveLength(0)
    expect(searchTools('快速', 'productivity').length).toBeGreaterThan(0)
  })

  it('returns an empty list for an unknown query', () => {
    expect(searchTools('不存在的工具')).toEqual([])
  })
})
