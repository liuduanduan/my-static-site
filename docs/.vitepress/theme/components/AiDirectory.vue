<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  PAGE_SIZE,
  filterTools,
  getAllTools,
  getCategories,
  getDiscoveryTools,
  getScenarioTools,
  getScenarios,
  paginateTools,
  type CategoryFilter,
  type ChineseSupportFilter,
  type DiscoveryKind,
  type PricingFilter,
  type ToolCategory
} from '../domain/aiTools'
import {
  categoryVisuals,
  formatPlatformEyebrow,
  platformHero
} from '../domain/directoryPresentation'
import DirectoryFilters from './DirectoryFilters.vue'
import SponsoredTools from './SponsoredTools.vue'
import ToolCard from './ToolCard.vue'

const query = ref('')
const category = ref<CategoryFilter>('all')
const pricingMode = ref<PricingFilter>('all')
const chineseSupport = ref<ChineseSupportFilter>('all')
const activeDiscovery = ref<DiscoveryKind>('featured')
const visibleCount = ref(PAGE_SIZE)

const categories = getCategories()
const scenarios = getScenarios().map((scenario) => ({
  ...scenario,
  count: getScenarioTools(scenario.slug).length
}))
const toolCount = getAllTools().length
const heroEyebrow = formatPlatformEyebrow(toolCount, categories.length)
const discoveryOptions: readonly { value: DiscoveryKind; label: string }[] = [
  { value: 'featured', label: '编辑精选' },
  { value: 'latest', label: '最近收录' },
  { value: 'free', label: '免费可用' }
]

const filteredTools = computed(() =>
  filterTools({
    query: query.value,
    category: category.value,
    pricingMode: pricingMode.value,
    chineseSupport: chineseSupport.value
  })
)
const displayedTools = computed(() => paginateTools(filteredTools.value, visibleCount.value))
const discoveryTools = computed(() => getDiscoveryTools(activeDiscovery.value))
const hasMore = computed(() => displayedTools.value.length < filteredTools.value.length)
const resultStatus = computed(() => {
  const progress = `共找到 ${filteredTools.value.length} 款工具，当前显示 ${displayedTools.value.length} 款`
  return hasMore.value ? progress : `${progress}，已显示全部`
})

watch([query, category, pricingMode, chineseSupport], () => {
  visibleCount.value = PAGE_SIZE
})

function clearQuery() {
  query.value = ''
}

function resetFilters() {
  query.value = ''
  category.value = 'all'
  pricingMode.value = 'all'
  chineseSupport.value = 'all'
}

function scrollToDirectory() {
  const behavior = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  document.getElementById('tool-directory')?.scrollIntoView({ behavior, block: 'start' })
}

function chooseCategory(selectedCategory: CategoryFilter) {
  category.value = selectedCategory
  scrollToDirectory()
}

function browseAll() {
  resetFilters()
  scrollToDirectory()
}

function loadMore() {
  if (!hasMore.value) return
  visibleCount.value += PAGE_SIZE
}
</script>

<template>
  <main class="directory-shell">
    <section class="directory-hero" aria-labelledby="directory-title">
      <div class="hero-orbit hero-orbit--one" aria-hidden="true"></div>
      <div class="hero-orbit hero-orbit--two" aria-hidden="true"></div>

      <div class="directory-hero-inner">
        <p class="hero-eyebrow">
          <span aria-hidden="true">✦</span>
          {{ heroEyebrow }}
        </p>
        <h1 id="directory-title">{{ platformHero.title }}</h1>
        <p class="directory-lede">{{ platformHero.subtitle }}</p>

        <div class="hero-actions" aria-label="快速开始">
          <a
            v-for="action in platformHero.actions"
            :key="action.href"
            class="hero-action"
            :class="`hero-action--${action.tone}`"
            :href="action.href"
          >
            {{ action.label }}
            <span aria-hidden="true">{{ action.tone === 'primary' ? '→' : '↓' }}</span>
          </a>
        </div>

        <div class="hero-trust" aria-label="目录特点">
          <span>✓ 人工精选</span>
          <span>✓ 中文说明</span>
          <span>✓ 持续维护</span>
        </div>

        <div class="directory-search-card">
          <div class="search-icon" aria-hidden="true"></div>
          <label for="tool-search" class="sr-only">搜索 AI 工具、用途或场景</label>
          <input
            id="tool-search"
            v-model="query"
            type="search"
            autocomplete="off"
            placeholder="搜索工具或你想完成的事情，例如：做 PPT、写代码、生成视频"
            @keyup.esc="clearQuery"
          />
          <button
            v-if="query"
            class="search-clear"
            type="button"
            aria-label="清除搜索"
            @click="clearQuery"
          >
            清除
          </button>
        </div>
      </div>
    </section>

    <div class="platform-content">
      <section id="popular-categories" class="category-section" aria-labelledby="category-title">
        <header class="platform-section-heading">
          <div>
            <p class="platform-kicker">POPULAR CATEGORIES</p>
            <h2 id="category-title">你想用 AI 做什么？</h2>
            <p>从真实使用场景出发，快速缩小选择范围。</p>
          </div>
          <button class="section-link" type="button" @click="browseAll">
            查看全部 {{ toolCount }} 款工具 <span aria-hidden="true">→</span>
          </button>
        </header>

        <div class="category-grid" role="group" aria-label="工具分类">
          <button
            v-for="categoryOption in categories"
            :key="categoryOption.value"
            class="category-card"
            :class="{ active: category === categoryOption.value }"
            :style="{
              '--category-accent': categoryVisuals[categoryOption.value].accent,
              '--category-soft': categoryVisuals[categoryOption.value].soft
            }"
            type="button"
            :aria-pressed="category === categoryOption.value"
            @click="chooseCategory(categoryOption.value as ToolCategory)"
          >
            <span class="category-icon" aria-hidden="true">
              {{ categoryVisuals[categoryOption.value].icon }}
            </span>
            <span class="category-copy">
              <strong>{{ categoryOption.label }}</strong>
              <small>{{ categoryVisuals[categoryOption.value].summary }}</small>
            </span>
            <span class="category-count">{{ categoryOption.count }}</span>
          </button>
        </div>
      </section>

      <section id="task-scenarios" class="scenario-section" aria-labelledby="scenario-title">
        <header class="platform-section-heading">
          <div>
            <p class="platform-kicker">TASK SCENARIOS</p>
            <h2 id="scenario-title">按事情找工具</h2>
            <p>先说清楚要完成什么，再进入合适的工具集合。</p>
          </div>
          <a class="section-link" href="/ai-scenarios/">
            查看全部场景 <span aria-hidden="true">→</span>
          </a>
        </header>

        <div class="scenario-grid" role="list" aria-label="任务场景入口">
          <a
            v-for="scenario in scenarios"
            :key="scenario.slug"
            class="scenario-card"
            :href="`/ai-scenarios/${scenario.slug}`"
            role="listitem"
          >
            <span class="scenario-card__index" aria-hidden="true">0{{ scenarios.indexOf(scenario) + 1 }}</span>
            <span class="scenario-card__copy">
              <strong>{{ scenario.name }}</strong>
              <small>{{ scenario.description }}</small>
            </span>
            <span class="scenario-card__count">{{ scenario.count }} 款 <span aria-hidden="true">→</span></span>
          </a>
        </div>
      </section>

      <section class="discovery-section" aria-labelledby="discovery-title">
        <header class="platform-section-heading">
          <div>
            <p class="platform-kicker">DISCOVER</p>
            <h2 id="discovery-title">发现值得尝试的 AI 工具</h2>
            <p>从编辑精选、最近收录和免费可用三个角度开始探索。</p>
          </div>
        </header>

        <div class="discovery-tabs" role="group" aria-label="发现方式">
          <button
            v-for="option in discoveryOptions"
            :key="option.value"
            class="discovery-tab"
            :class="{ active: activeDiscovery === option.value }"
            type="button"
            :aria-pressed="activeDiscovery === option.value"
            @click="activeDiscovery = option.value"
          >
            {{ option.label }}
          </button>
        </div>

        <p v-if="activeDiscovery === 'free'" class="discovery-disclaimer">
          免费版或免费额度以官网为准
        </p>

        <div class="tool-grid discovery-grid">
          <ToolCard v-for="tool in discoveryTools" :key="tool.slug" :tool="tool" />
        </div>
      </section>

      <SponsoredTools />

      <section id="tool-directory" class="tool-section" aria-labelledby="tool-list-title">
        <header class="platform-section-heading tool-section-heading">
          <div>
            <p class="platform-kicker">COMPLETE DIRECTORY</p>
            <h2 id="tool-list-title">完整工具目录</h2>
            <p>使用搜索和筛选条件，找到适合当前任务的工具。</p>
          </div>
        </header>

        <DirectoryFilters
          :categories="categories"
          :category="category"
          @update:category="category = $event"
          :pricing-mode="pricingMode"
          @update:pricing-mode="pricingMode = $event"
          :chinese-support="chineseSupport"
          @update:chinese-support="chineseSupport = $event"
          @reset="resetFilters"
        />

        <p class="directory-result-count" aria-live="polite">
          {{ resultStatus }}
        </p>

        <div v-if="displayedTools.length" class="tool-grid">
          <ToolCard v-for="tool in displayedTools" :key="tool.slug" :tool="tool" />
        </div>

        <div v-else class="tool-empty" role="status">
          <span class="empty-icon" aria-hidden="true">⌕</span>
          <p class="platform-kicker">NO MATCHES</p>
          <h3>没有符合当前条件的工具</h3>
          <p>试试更换关键词，或清除当前筛选条件。</p>
          <button class="empty-reset" type="button" @click="resetFilters">清除全部条件</button>
        </div>

        <div v-if="hasMore" class="directory-load-more">
          <button
            class="section-link"
            type="button"
            @click="loadMore"
          >
            加载更多
          </button>
        </div>
      </section>

      <section class="directory-note" aria-labelledby="directory-note-title">
        <div class="note-icon" aria-hidden="true">✓</div>
        <div>
          <strong id="directory-note-title">我们先替你筛一遍</strong>
          <p>工具信息由人工整理，价格、功能和授权可能变化，使用前请以工具官网为准。</p>
        </div>
        <a href="/about">了解收录标准 <span aria-hidden="true">→</span></a>
      </section>
    </div>
  </main>
</template>
