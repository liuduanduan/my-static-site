<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  getAllTools,
  getCategories,
  getCategoryLabel,
  getFeaturedTools,
  searchTools,
  type CategoryFilter,
  type ToolCategory
} from '../domain/aiTools'
import {
  categoryVisuals,
  formatPlatformEyebrow,
  platformHero
} from '../domain/directoryPresentation'
import ToolCard from './ToolCard.vue'

const query = ref('')
const activeCategory = ref<CategoryFilter>('all')
const showAll = ref(false)
const categories = getCategories()
const heroEyebrow = formatPlatformEyebrow(getAllTools().length, categories.length)

const filteredTools = computed(() => searchTools(query.value, activeCategory.value))
const isFiltered = computed(() => Boolean(query.value.trim()) || activeCategory.value !== 'all')
const isBrowsingAll = computed(() => showAll.value && !query.value.trim() && activeCategory.value === 'all')
const isInitialView = computed(() => !isFiltered.value && !isBrowsingAll.value)
const displayedTools = computed(() =>
  isFiltered.value || isBrowsingAll.value ? filteredTools.value : getFeaturedTools(6)
)
const sectionKicker = computed(() => {
  if (query.value.trim()) return 'SEARCH RESULTS'
  if (isInitialView.value) return 'FEATURED TOOLS'
  return 'BROWSE DIRECTORY'
})
const sectionTitle = computed(() => {
  if (query.value.trim()) return '为你找到这些工具'
  if (isBrowsingAll.value) return '探索全部 AI 工具'
  if (activeCategory.value !== 'all') return `${getCategoryLabel(activeCategory.value)}工具`
  return '本周精选工具'
})

function chooseCategory(category: CategoryFilter) {
  activeCategory.value = category
  showAll.value = category === 'all'
}

function browseAll() {
  query.value = ''
  activeCategory.value = 'all'
  showAll.value = true
}

function clearSearch() {
  query.value = ''
  activeCategory.value = 'all'
  showAll.value = false
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
          <span>✓ 直达官网</span>
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
            @keyup.esc="clearSearch"
          />
          <button
            v-if="query"
            class="search-clear"
            type="button"
            aria-label="清除搜索"
            @click="clearSearch"
          >
            清除
          </button>
          <span class="search-shortcut" aria-hidden="true">⌘ K</span>
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
            查看全部 24 个工具 <span aria-hidden="true">→</span>
          </button>
        </header>

        <div class="category-grid" role="group" aria-label="工具分类">
          <button
            v-for="category in categories"
            :key="category.value"
            class="category-card"
            :class="{ active: activeCategory === category.value }"
            :style="{
              '--category-accent': categoryVisuals[category.value].accent,
              '--category-soft': categoryVisuals[category.value].soft
            }"
            type="button"
            :aria-pressed="activeCategory === category.value"
            @click="chooseCategory(category.value as ToolCategory)"
          >
            <span class="category-icon" aria-hidden="true">
              {{ categoryVisuals[category.value].icon }}
            </span>
            <span class="category-copy">
              <strong>{{ category.label }}</strong>
              <small>{{ categoryVisuals[category.value].summary }}</small>
            </span>
            <span class="category-count">{{ category.count }}</span>
          </button>
        </div>
      </section>

      <section id="tool-directory" class="tool-section" aria-labelledby="tool-list-title">
        <header class="platform-section-heading tool-section-heading">
          <div>
            <p class="platform-kicker">{{ sectionKicker }}</p>
            <h2 id="tool-list-title">{{ sectionTitle }}</h2>
            <p>
              {{ isInitialView
                ? '从每个热门场景中选出一个值得先试的工具。'
                : `当前共有 ${displayedTools.length} 个匹配结果。` }}
            </p>
          </div>
          <div class="tool-heading-actions">
            <button v-if="!isInitialView" class="section-link" type="button" @click="clearSearch">
              重置筛选
            </button>
            <button v-else class="section-link" type="button" @click="browseAll">
              浏览全部 <span aria-hidden="true">→</span>
            </button>
          </div>
        </header>

        <div v-if="displayedTools.length" class="tool-grid">
          <ToolCard v-for="tool in displayedTools" :key="tool.slug" :tool="tool" />
        </div>

        <div v-else class="tool-empty" role="status">
          <span class="empty-icon" aria-hidden="true">⌕</span>
          <p class="platform-kicker">NO MATCHES</p>
          <h3>暂时没找到相关工具</h3>
          <p>换个更简单的关键词，或者先看看全部精选工具。</p>
          <button class="empty-reset" type="button" @click="clearSearch">查看精选工具</button>
        </div>
      </section>

      <section class="directory-note" aria-label="目录说明">
        <div class="note-icon" aria-hidden="true">✓</div>
        <div>
          <strong>我们先替你筛一遍</strong>
          <p>工具信息由人工整理，价格、功能和授权可能变化，使用前请以工具官网为准。</p>
        </div>
        <a href="/about">了解收录标准 <span aria-hidden="true">→</span></a>
      </section>
    </div>
  </main>
</template>
