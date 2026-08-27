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
    expect(formatPlatformEyebrow(-3, -2)).toBe('0+ 款工具 · 0 大使用场景 · 持续维护')
    expect(formatPlatformEyebrow(12.9, 4.8)).toBe('12+ 款工具 · 4 大使用场景 · 持续维护')
    expect(formatPlatformEyebrow(Number.NaN, Number.POSITIVE_INFINITY)).toBe(
      '0+ 款工具 · 0 大使用场景 · 持续维护'
    )
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

  it('uses the approved metadata for every category visual', () => {
    expect(categoryVisuals).toEqual({
      chat: {
        icon: '•••',
        accent: '#2563eb',
        soft: '#eaf2ff',
        summary: '模型对话、问答与灵感助手'
      },
      writing: {
        icon: '✦',
        accent: '#7758f6',
        soft: '#f1edff',
        summary: '对话、写作与资料整理'
      },
      image: {
        icon: '◫',
        accent: '#db4f83',
        soft: '#fff0f5',
        summary: '绘图、设计与视觉创意'
      },
      video: {
        icon: '▶',
        accent: '#e7653b',
        soft: '#fff1ec',
        summary: '视频生成、剪辑与动效'
      },
      coding: {
        icon: '</>',
        accent: '#1670d2',
        soft: '#eaf3ff',
        summary: '编程、原型与应用开发'
      },
      audio: {
        icon: '∿',
        accent: '#c8890e',
        soft: '#fff7df',
        summary: '语音、音乐与会议记录'
      },
      research: {
        icon: '◉',
        accent: '#13899a',
        soft: '#e8f8fa',
        summary: '搜索、分析与深度研究'
      },
      marketing: {
        icon: '↗',
        accent: '#d4514c',
        soft: '#ffefee',
        summary: '营销内容、推广与社媒运营'
      },
      automation: {
        icon: '⌘',
        accent: '#17845f',
        soft: '#e8f7f1',
        summary: '工作流、集成与数据自动化'
      }
    })
  })

  it('keeps all nine category color pairs distinct', () => {
    const visuals = Object.values(categoryVisuals)

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

  it('builds deterministic Unicode-safe marks for unknown tools', () => {
    const emojiLed = getToolVisual('🚀 𠮷野 AI', 'automation').mark
    const chinese = getToolVisual('智研助手', 'research').mark
    const loneSurrogate = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/

    expect(emojiLed).toBe('𠮷A')
    expect(chinese).toBe('智研')
    expect(getToolVisual('🚀 𠮷野 AI', 'automation').mark).toBe(emojiLed)
    expect(getToolVisual('智研助手', 'research').mark).toBe(chinese)
    expect(loneSurrogate.test(emojiLed)).toBe(false)
    expect(loneSurrogate.test(chinese)).toBe(false)
  })
})
