import { existsSync, readFileSync } from 'node:fs'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import { describe, expect, it } from 'vitest'
import {
  chineseSupportLabels,
  pricingModeLabels
} from '../docs/.vitepress/theme/domain/aiTools'

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

async function filterValuesModule() {
  const url = new URL(
    '../docs/.vitepress/theme/components/directoryFilterValues.ts',
    import.meta.url
  )
  if (!existsSync(url)) return undefined
  return import(url.href)
}

function compileSfc(filename: string, source: string): string[] {
  const parsed = parse(source, { filename })
  const errors = parsed.errors.map(String)
  const { descriptor } = parsed

  try {
    if (descriptor.script || descriptor.scriptSetup) {
      compileScript(descriptor, { id: filename })
    }
  } catch (error) {
    errors.push(String(error))
  }

  if (descriptor.template) {
    const template = compileTemplate({
      id: filename,
      filename,
      source: descriptor.template.content
    })
    errors.push(...template.errors.map(String))
  }

  return errors
}

describe('directory component compilation', () => {
  it.each(['DirectoryFilters.vue', 'ToolCard.vue'])('compiles %s directly', (name) => {
    expect(compileSfc(name, componentSource(name))).toEqual([])
  })

  it('reports invalid script and template syntax', () => {
    expect(compileSfc('InvalidScript.vue', '<script setup lang="ts">const =</script>')).not.toEqual([])
    expect(compileSfc('InvalidTemplate.vue', '<template><div></template>')).not.toEqual([])
  })
})

describe('directory filter change values', () => {
  it('derives pricing and Chinese-support options from the canonical labels', async () => {
    const values = await filterValuesModule()

    expect(values).toBeDefined()
    if (!values) return
    expect(values.pricingModes).toEqual(Object.keys(pricingModeLabels))
    expect(values.chineseSupportModes).toEqual(Object.keys(chineseSupportLabels))
  })

  it('emits valid category DOM values and ignores invalid values', async () => {
    const values = await filterValuesModule()
    const emitted: string[] = []

    expect(values).toBeDefined()
    if (!values) return
    const categories = [{ value: 'image' }, { value: 'coding' }] as const
    values.handleCategoryFilterValue('image', categories, (value: string) => emitted.push(value))
    values.handleCategoryFilterValue('all', categories, (value: string) => emitted.push(value))
    values.handleCategoryFilterValue('unknown', categories, (value: string) => emitted.push(value))

    expect(emitted).toEqual(['image', 'all'])
  })

  it('emits valid pricing DOM values and ignores invalid values', async () => {
    const values = await filterValuesModule()
    const emitted: string[] = []

    expect(values).toBeDefined()
    if (!values) return
    values.handlePricingFilterValue('freemium', (value: string) => emitted.push(value))
    values.handlePricingFilterValue('all', (value: string) => emitted.push(value))
    values.handlePricingFilterValue('trial', (value: string) => emitted.push(value))

    expect(emitted).toEqual(['freemium', 'all'])
  })

  it('emits valid Chinese-support DOM values and ignores invalid values', async () => {
    const values = await filterValuesModule()
    const emitted: string[] = []

    expect(values).toBeDefined()
    if (!values) return
    values.handleChineseSupportFilterValue('native', (value: string) => emitted.push(value))
    values.handleChineseSupportFilterValue('all', (value: string) => emitted.push(value))
    values.handleChineseSupportFilterValue('full', (value: string) => emitted.push(value))

    expect(emitted).toEqual(['native', 'all'])
  })
})

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
    expect(source).toContain("import { useId } from 'vue'")
    expect(source).toContain('const filterId = useId()')
    expect(source).toContain('<label :for="categoryId">工具分类</label>')
    expect(source).toContain('<label :for="pricingId">价格模式</label>')
    expect(source).toContain('<label :for="chineseSupportId">中文支持</label>')
    expect(source).toContain(':id="categoryId"')
    expect(source).toContain(':id="pricingId"')
    expect(source).toContain(':id="chineseSupportId"')

    expect(source).toContain('<option value="all">全部分类</option>')
    expect(source).toContain('v-for="option in categories"')
    expect(source).toContain("from './directoryFilterValues'")
    expect(source).toContain('v-for="mode in pricingModes"')
    expect(source).toContain('v-for="mode in chineseSupportModes"')
    expect(source).toContain('pricingModeLabels[mode]')
    expect(source).toContain('chineseSupportLabels[mode]')
  })

  it('emits changes without mutating or persisting prop state', () => {
    const source = componentSource('DirectoryFilters.vue')

    expect(source).toContain("emit('update:category'")
    expect(source).toContain("emit('update:pricingMode'")
    expect(source).toContain("emit('update:chineseSupport'")
    expect(source).toContain('handleCategoryFilterValue(value, categories')
    expect(source).toContain('handlePricingFilterValue(value')
    expect(source).toContain('handleChineseSupportFilterValue(value')
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
    expect(occurrences(source, 'class="tool-fact-badge"')).toBe(2)
    expect(source).toContain('pricingModeLabels[tool.pricingMode]')
    expect(source).toContain('chineseSupportLabels[tool.chineseSupport]')
    expect(source).toContain(':aria-label="`价格模式：${pricingModeLabels[tool.pricingMode]}`"')
    expect(source).toContain(':aria-label="`中文支持：${chineseSupportLabels[tool.chineseSupport]}`"')

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
