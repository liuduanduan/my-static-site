import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const componentsDirectory = new URL(
  '../docs/.vitepress/theme/components/',
  import.meta.url
)

function componentSource(name: string): string {
  const url = new URL(name, componentsDirectory)
  expect(existsSync(url), `${name} should exist`).toBe(true)
  return existsSync(url) ? readFileSync(url, 'utf8') : ''
}

function occurrences(source: string, value: string): number {
  return source.split(value).length - 1
}

describe('DirectoryFilters source contract', () => {
  it('exposes the controlled readonly props and exact update/reset events', () => {
    const source = componentSource('DirectoryFilters.vue')

    expect(source).toMatch(/categories:\s*readonly\s+DirectoryCategory\[\]/)
    expect(source).toContain('category: CategoryFilter')
    expect(source).toContain('pricingMode: PricingFilter')
    expect(source).toContain('chineseSupport: ChineseSupportFilter')

    const emitsBlock = source.match(/defineEmits<\{([\s\S]*?)\}>\(\)/)?.[1] ?? ''
    expect([...emitsBlock.matchAll(/'([^']+)'\s*:/g)].map((match) => match[1])).toEqual([
      'update:category',
      'update:pricingMode',
      'update:chineseSupport',
      'reset'
    ])
  })

  it('renders three visibly labelled native selects with the approved options', () => {
    const source = componentSource('DirectoryFilters.vue')

    expect(occurrences(source, '<select')).toBe(3)
    expect(source).toContain('<label for="directory-category-filter">工具分类</label>')
    expect(source).toContain('<label for="directory-pricing-filter">价格模式</label>')
    expect(source).toContain('<label for="directory-chinese-filter">中文支持</label>')
    expect(source).toContain('id="directory-category-filter"')
    expect(source).toContain('id="directory-pricing-filter"')
    expect(source).toContain('id="directory-chinese-filter"')

    expect(source).toContain('<option value="all">全部分类</option>')
    expect(source).toContain('v-for="option in categories"')
    expect(source).toContain("const pricingModes = ['free', 'freemium', 'paid', 'contact'] as const")
    expect(source).toContain("const chineseSupportModes = ['native', 'partial', 'none'] as const")
    expect(source).toContain('pricingModeLabels[mode]')
    expect(source).toContain('chineseSupportLabels[mode]')
  })

  it('emits changes without mutating or persisting prop state', () => {
    const source = componentSource('DirectoryFilters.vue')

    expect(source).toContain("emit('update:category'")
    expect(source).toContain("emit('update:pricingMode'")
    expect(source).toContain("emit('update:chineseSupport'")
    expect(source).toContain('<button type="button" @click="emit(\'reset\')">重置筛选</button>')
    expect(source).not.toContain('v-model')
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams|history\./)
  })
})

describe('ToolCard source contract', () => {
  it('accepts one required readonly tool and computes its visual once', () => {
    const source = componentSource('ToolCard.vue')

    expect(source).toContain("import type { ReadonlyAiTool }")
    expect(source).toMatch(/defineProps<\{\s*tool:\s*ReadonlyAiTool\s*\}>\(\)/)
    expect(source).toContain('const toolVisual = computed(')
    expect(occurrences(source, 'getToolVisual(')).toBe(1)
  })

  it('renders only the approved summary and two fact badges', () => {
    const source = componentSource('ToolCard.vue')

    expect(source).toContain('<article class="tool-card">')
    expect(source).toContain('getCategoryLabel(tool.category)')
    expect(source).toContain('{{ tool.name }}')
    expect(source).toContain('{{ tool.tagline }}')
    expect(source).toContain('{{ tool.description }}')
    expect(occurrences(source, '<span class="tool-fact-badge">')).toBe(2)
    expect(source).toContain('pricingModeLabels[tool.pricingMode]')
    expect(source).toContain('chineseSupportLabels[tool.chineseSupport]')

    expect(source).not.toMatch(/bestFor|features|verified|rating|votes|users|popularity|promotion/)
  })

  it('uses internal detail links and never links directly to the official URL', () => {
    const source = componentSource('ToolCard.vue')

    expect(source).toContain(':href="`/tools/${tool.slug}`"')
    expect(source).not.toContain('tool.url')
    expect(source).not.toContain('target="_blank"')
  })
})

describe('AiDirectory extraction contract', () => {
  it('renders shared ToolCards and uses the live hero totals', () => {
    const source = componentSource('AiDirectory.vue')

    expect(source).toContain("import ToolCard from './ToolCard.vue'")
    expect(source).toContain('const heroEyebrow = formatPlatformEyebrow(getAllTools().length, categories.length)')
    expect(source).toContain('<ToolCard v-for="tool in displayedTools" :key="tool.slug" :tool="tool" />')
    expect(source).not.toContain('<article v-for="tool in displayedTools"')
    expect(source).not.toContain('platformHero.eyebrow')
  })
})
