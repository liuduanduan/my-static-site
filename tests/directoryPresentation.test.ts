import { describe, expect, it } from 'vitest'
import {
  categoryVisuals,
  formatPlatformEyebrow,
  getToolVisual,
  platformHero
} from '../docs/.vitepress/theme/domain/directoryPresentation'
import type { ToolCategory } from '../docs/.vitepress/theme/domain/aiTools'

describe('directory platform presentation', () => {
  it('formats the platform eyebrow from live directory totals', () => {
    expect(formatPlatformEyebrow(63, 9)).toBe('63+ 款工具 · 9 大使用场景 · 持续维护')
  })

  it('uses the approved platform hero message and two useful actions', () => {
    expect(platformHero).not.toHaveProperty('eyebrow')
    expect(platformHero.title).toBe('你需要的 AI 工具，都在这里。')
    expect(platformHero.subtitle).toContain('写作、设计、视频、编程与办公')
    expect(platformHero.actions).toEqual([
      { label: '探索 AI 工具', href: '#tool-directory', tone: 'primary' },
      { label: '按场景查找', href: '#popular-categories', tone: 'secondary' }
    ])
  })

  it('defines all nine category visuals in the approved order', () => {
    const categories: ToolCategory[] = [
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

    expect(Object.keys(categoryVisuals)).toEqual(categories)
  })

  it('gives all nine categories complete and distinct visual identities', () => {
    const visuals = Object.values(categoryVisuals)
    const hexColor = /^#[0-9a-f]{6}$/i

    expect(visuals).toHaveLength(9)
    expect(visuals.every((visual) => visual.icon.trim().length > 0)).toBe(true)
    expect(visuals.every((visual) => visual.summary.trim().length > 0)).toBe(true)
    expect(visuals.every((visual) => hexColor.test(visual.accent))).toBe(true)
    expect(visuals.every((visual) => hexColor.test(visual.soft))).toBe(true)
    expect(new Set(visuals.map((visual) => visual.accent)).size).toBe(9)
    expect(new Set(visuals.map((visual) => visual.soft)).size).toBe(9)
    expect(new Set(visuals.map((visual) => `${visual.accent}:${visual.soft}`)).size).toBe(9)
  })

  it('returns stable brand marks and a deterministic fallback', () => {
    expect(getToolVisual('Midjourney', 'image')).toEqual({
      mark: 'MJ',
      accent: '#111827',
      soft: '#eef0f3'
    })
    expect(getToolVisual('ElevenLabs', 'audio').mark).toBe('11')

    const first = getToolVisual('New Tool', 'coding')
    const second = getToolVisual('New Tool', 'coding')
    expect(first).toEqual(second)
    expect(first.mark).toBe('NT')
    expect(first.accent).toBe(categoryVisuals.coding.accent)

    const categories = Object.keys(categoryVisuals) as ToolCategory[]
    for (const category of categories) {
      const fallback = getToolVisual('Unlisted Platform', category)
      expect(fallback).toEqual(getToolVisual('Unlisted Platform', category))
      expect(fallback.mark).toBe('UP')
      expect(fallback.accent).toBe(categoryVisuals[category].accent)
      expect(fallback.soft).toBe(categoryVisuals[category].soft)
    }
  })
})
