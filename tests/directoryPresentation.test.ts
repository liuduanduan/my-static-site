import { describe, expect, it } from 'vitest'
import {
  categoryVisuals,
  getToolVisual,
  platformHero
} from '../docs/.vitepress/theme/domain/directoryPresentation'
import type { ToolCategory } from '../docs/.vitepress/theme/domain/aiTools'

describe('directory platform presentation', () => {
  it('uses the approved platform hero message and two useful actions', () => {
    expect(platformHero.title).toBe('你需要的 AI 工具，都在这里。')
    expect(platformHero.subtitle).toContain('写作、设计、视频、编程与办公')
    expect(platformHero.actions).toEqual([
      { label: '探索 AI 工具', href: '#tool-directory', tone: 'primary' },
      { label: '按场景查找', href: '#popular-categories', tone: 'secondary' }
    ])
  })

  it('gives all six categories distinct visual identities', () => {
    const categories: ToolCategory[] = [
      'writing',
      'image',
      'video',
      'coding',
      'productivity',
      'audio'
    ]
    const visuals = categories.map((category) => categoryVisuals[category])

    expect(visuals.every((visual) => visual.icon.length > 0)).toBe(true)
    expect(new Set(visuals.map((visual) => visual.accent)).size).toBe(6)
    expect(new Set(visuals.map((visual) => visual.soft)).size).toBe(6)
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
  })
})
