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
const themeDirectory = new URL('../docs/.vitepress/theme/', import.meta.url)

function componentSource(name: string): string {
  const url = new URL(name, componentsDirectory)
  expect(existsSync(url), `${name} should exist`).toBe(true)
  return existsSync(url) ? readFileSync(url, 'utf8') : ''
}

function occurrences(source: string, value: string): number {
  return source.split(value).length - 1
}

function themeSource(name: string): string {
  const url = new URL(name, themeDirectory)
  expect(existsSync(url), `${name} should exist`).toBe(true)
  return existsSync(url) ? readFileSync(url, 'utf8') : ''
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
  it.each(['AiDirectory.vue', 'DirectoryFilters.vue', 'ToolCard.vue', 'ToolDetail.vue'])('compiles %s directly', (name) => {
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
    expect(source).toContain('<span class="sr-only">价格模式：</span>')
    expect(source).toContain('<span class="sr-only">中文支持：</span>')
    expect(source).not.toMatch(/class="tool-fact-badge"[^>]*aria-label/)

    expect(source).not.toMatch(/bestFor|features|verified|rating|votes|users|popularity|promotion/)
  })

  it('uses internal detail links and never links directly to the official URL', () => {
    const source = componentSource('ToolCard.vue')

    expect(source).toContain(':href="`/tools/${tool.slug}`"')
    expect(source).not.toContain('tool.url')
    expect(source).not.toContain('target="_blank"')
  })
})

describe('ToolDetail source contract', () => {
  it('renders four labelled facts from the canonical tool fields', () => {
    const source = componentSource('ToolDetail.vue')
    const facts = source.match(
      /<div class="tool-detail-body">\s*<section class="tool-facts" aria-label="工具基本信息">([\s\S]*?)<\/section>/
    )?.[1] ?? ''

    expect(facts).not.toBe('')
    expect(occurrences(facts, '<div>')).toBe(4)
    expect(facts).toContain('<span>价格模式</span>')
    expect(facts).toContain('<strong>{{ pricingModeLabels[tool.pricingMode] }}</strong>')
    expect(facts).toContain('<span>中文支持</span>')
    expect(facts).toContain('<strong>{{ chineseSupportLabels[tool.chineseSupport] }}</strong>')
    expect(facts).toContain('<span>使用平台</span>')
    expect(facts).toContain("<strong>{{ tool.accessModes.map((mode) => accessModeLabels[mode]).join('、') }}</strong>")
    expect(facts).toContain('<span>是否注册</span>')
    expect(facts).toContain("<strong>{{ tool.requiresAccount ? '需要注册' : '无需注册' }}</strong>")
  })

  it('labels updatedAt as a last verification and keeps the official link safe and dormant', () => {
    const source = componentSource('ToolDetail.vue')

    expect(source).toContain('<span class="detail-updated">最后核验 {{ formatDate(tool.updatedAt) }}</span>')
    expect(source).not.toContain('更新于')
    expect(source).not.toContain('发布于')
    expect(source).toMatch(
      /<a\s+class="official-link"\s+:href="tool\.url"\s+target="_blank"\s+rel="noreferrer noopener"\s+data-affiliate-slot="tool-directory"/
    )
    expect(source).not.toMatch(/推广|赞助|返佣|affiliate link/i)
  })

  it('does not add a second main landmark and retains alternatives and the friendly empty state', () => {
    const source = componentSource('ToolDetail.vue')

    expect(source).not.toMatch(/<main\b/i)
    expect(source).toContain('v-if="alternatives.length"')
    expect(source).toContain('这个工具暂时不在目录里')
    expect(source).toContain('返回首页看看其他精选工具。')
  })
})

describe('AiDirectory extraction contract', () => {
  it('renders shared ToolCards and uses the live hero totals', () => {
    const source = componentSource('AiDirectory.vue')

    expect(source).toContain("import ToolCard from './ToolCard.vue'")
    expect(source).toContain('const toolCount = getAllTools().length')
    expect(source).toContain('const heroEyebrow = formatPlatformEyebrow(toolCount, categories.length)')
    expect(source).toContain('<ToolCard v-for="tool in displayedTools" :key="tool.slug" :tool="tool" />')
    expect(source).not.toContain('<article v-for="tool in displayedTools"')
    expect(source).not.toContain('platformHero.eyebrow')
  })

  it('owns the complete controlled filter and pagination state', () => {
    const source = componentSource('AiDirectory.vue')

    expect(source).toContain("import DirectoryFilters from './DirectoryFilters.vue'")
    expect(source).toContain("const query = ref('')")
    expect(source).toContain("const category = ref<CategoryFilter>('all')")
    expect(source).toContain("const pricingMode = ref<PricingFilter>('all')")
    expect(source).toContain("const chineseSupport = ref<ChineseSupportFilter>('all')")
    expect(source).toContain("const activeDiscovery = ref<DiscoveryKind>('featured')")
    expect(source).toContain('const visibleCount = ref(PAGE_SIZE)')
    expect(source).toMatch(
      /filterTools\(\{\s*query:\s*query\.value,\s*category:\s*category\.value,\s*pricingMode:\s*pricingMode\.value,\s*chineseSupport:\s*chineseSupport\.value\s*\}\)/
    )
    expect(source).toContain('paginateTools(filteredTools.value, visibleCount.value)')
    expect(source).toContain('getDiscoveryTools(activeDiscovery.value)')
    expect(source).toContain('displayedTools.value.length < filteredTools.value.length')
    expect(source).toMatch(
      /watch\(\s*\[query, category, pricingMode, chineseSupport\],\s*\(\) => \{\s*visibleCount\.value = PAGE_SIZE\s*\}\s*\)/
    )
    expect(source).toMatch(
      /function loadMore\(\) \{\s*if \(!hasMore\.value\) return\s*visibleCount\.value \+= PAGE_SIZE\s*\}/
    )
  })

  it('clears all filters explicitly while Escape clears only the query', () => {
    const source = componentSource('AiDirectory.vue')
    const resetBlock = source.match(/function resetFilters\(\) \{([\s\S]*?)\n\}/)?.[1] ?? ''
    const clearQueryBlock = source.match(/function clearQuery\(\) \{([\s\S]*?)\n\}/)?.[1] ?? ''

    expect(resetBlock).toContain("query.value = ''")
    expect(resetBlock).toContain("category.value = 'all'")
    expect(resetBlock).toContain("pricingMode.value = 'all'")
    expect(resetBlock).toContain("chineseSupport.value = 'all'")
    expect(clearQueryBlock.trim()).toBe("query.value = ''")
    expect(source).toContain('@keyup.esc="clearQuery"')
    expect(source).toContain('@click="clearQuery"')
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams|history\.|account/i)
  })

  it('uses live totals and scrolls category and browse-all choices to the directory', () => {
    const source = componentSource('AiDirectory.vue')

    expect(source).toContain('const toolCount = getAllTools().length')
    expect(source).toContain('formatPlatformEyebrow(toolCount, categories.length)')
    expect(source).toContain('{{ toolCount }}')
    expect(source).not.toMatch(/\b24\b|\b6\b/)
    expect(source).toContain('category.value = selectedCategory')
    expect(source).toContain("window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'")
    expect(source).toContain("document.getElementById('tool-directory')?.scrollIntoView({ behavior, block: 'start' })")
    expect(occurrences(source, '\n  scrollToDirectory()')).toBe(2)
    expect(source).not.toContain("scrollIntoView({ behavior: 'smooth'")
    expect(source).toContain('@click="chooseCategory(categoryOption.value as ToolCategory)"')
    expect(source).toContain('@click="browseAll"')
  })

  it('renders the three discovery choices and six shared tool cards', () => {
    const source = componentSource('AiDirectory.vue')

    expect(source).toContain("{ value: 'featured', label: '编辑精选' }")
    expect(source).toContain("{ value: 'latest', label: '最近收录' }")
    expect(source).toContain("{ value: 'free', label: '免费可用' }")
    expect(source).toContain(':aria-pressed="activeDiscovery === option.value"')
    expect(source).toContain("activeDiscovery = option.value")
    expect(source).toContain('免费版或免费额度以官网为准')
    expect(source).toContain('<ToolCard v-for="tool in discoveryTools" :key="tool.slug" :tool="tool" />')
    expect(source).toContain('<ToolCard v-for="tool in displayedTools" :key="tool.slug" :tool="tool" />')
    expect(occurrences(source, '<ToolCard v-for=')).toBe(2)
    expect(source).not.toMatch(/热门榜单|votes|stars|traffic/i)
  })

  it('always exposes complete filters, result count, pagination, and empty reset', () => {
    const source = componentSource('AiDirectory.vue')

    expect(source).toContain('<DirectoryFilters')
    expect(source).toContain(':categories="categories"')
    expect(source).toContain(':category="category"')
    expect(source).toContain('@update:category="category = $event"')
    expect(source).toContain(':pricing-mode="pricingMode"')
    expect(source).toContain('@update:pricing-mode="pricingMode = $event"')
    expect(source).toContain(':chinese-support="chineseSupport"')
    expect(source).toContain('@update:chinese-support="chineseSupport = $event"')
    expect(source).toContain('@reset="resetFilters"')
    expect(source).toContain('`共找到 ${filteredTools.value.length} 款工具，当前显示 ${displayedTools.value.length} 款`')
    expect(source).toContain("`${progress}，已显示全部`")
    expect(source).toContain('aria-live="polite"')
    expect(source).toContain('{{ resultStatus }}')
    expect(source).toContain('v-if="filteredTools.length"')
    expect(source).toContain(':class="{ complete: !hasMore }"')
    expect(source).toContain(":aria-disabled=\"hasMore ? undefined : 'true'\"")
    expect(source).toContain("{{ hasMore ? '加载更多' : '已显示全部' }}")
    expect(source).toContain('@click="loadMore"')
    expect(source).not.toMatch(/\s(?::)?disabled(?:=|\s|>)/)
    expect(source).not.toMatch(/\.focus\(|autofocus|ref="loadMore/)
    expect(source).toContain('没有符合当前条件的工具')
    expect(source).toContain('<button class="empty-reset" type="button" @click="resetFilters">清除全部条件</button>')
    expect(source).not.toMatch(/showAll|isInitialView|featured-only/)
  })
})

describe('AI directory style contract', () => {
  it('styles every discovery and directory control introduced by the homepage', () => {
    const css = themeSource('custom.css')
    const requiredSelectors = [
      '.discovery-section',
      '.discovery-section .platform-section-heading',
      '.discovery-tabs',
      '.discovery-tab',
      '.discovery-tab.active',
      '.discovery-tab:focus-visible',
      '.discovery-disclaimer',
      '.discovery-grid',
      '.directory-filters',
      '.directory-filter',
      '.directory-filter label',
      '.directory-filter select',
      '.directory-filter select:focus-visible',
      '.directory-filters > button',
      '.directory-result-count',
      '.directory-load-more',
      '.directory-load-more button.complete'
    ]

    for (const selector of requiredSelectors) {
      expect(css, `${selector} should have a CSS rule`).toContain(`${selector} {`)
    }
  })

  it('stacks filters and wraps discovery tabs at the mobile breakpoint', () => {
    const css = themeSource('custom.css')
    const mobile = css.match(/@media \(max-width: 700px\) \{([\s\S]*?)\n\}/)?.[1] ?? ''

    expect(mobile).toMatch(/\.directory-filters\s*\{[\s\S]*?grid-template-columns:\s*1fr/)
    expect(mobile).toMatch(/\.discovery-tabs\s*\{[\s\S]*?flex-wrap:\s*wrap/)
  })
})
