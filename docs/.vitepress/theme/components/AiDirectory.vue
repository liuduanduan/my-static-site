<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  getCategories,
  getCategoryLabel,
  getFeaturedTools,
  searchTools,
  type CategoryFilter,
  type ToolCategory
} from '../domain/aiTools'

const query = ref('')
const activeCategory = ref<CategoryFilter>('all')
const showAll = ref(false)
const categories = getCategories()

const filteredTools = computed(() => searchTools(query.value, activeCategory.value))
const isFiltered = computed(() => Boolean(query.value.trim()) || activeCategory.value !== 'all')
const isBrowsingAll = computed(() => showAll.value && !query.value.trim() && activeCategory.value === 'all')
const isInitialView = computed(() => !isFiltered.value && !isBrowsingAll.value)
const displayedTools = computed(() =>
  isFiltered.value || isBrowsingAll.value ? filteredTools.value : getFeaturedTools(6)
)
const sectionKicker = computed(() => {
  if (query.value.trim()) return 'SEARCH RESULTS'
  if (isInitialView.value) return 'START HERE'
  return 'BROWSE DIRECTORY'
})
const sectionTitle = computed(() => {
  if (query.value.trim()) return '搜索结果'
  if (isBrowsingAll.value) return '全部工具'
  if (activeCategory.value !== 'all') return getCategoryLabel(activeCategory.value)
  return '从这里开始'
})

function chooseCategory(category: CategoryFilter) {
  activeCategory.value = category
  showAll.value = category === 'all'
}

function clearSearch() {
  query.value = ''
  activeCategory.value = 'all'
  showAll.value = false
}

function formatDate(value: string): string {
  return value.replaceAll('-', '.')
}
</script>

<template>
  <main class="directory-shell">
    <section class="directory-hero" aria-labelledby="directory-title">
      <div class="directory-kicker"><span class="kicker-dot" aria-hidden="true"></span> CURATED AI DIRECTORY</div>
      <h1 id="directory-title">找到真正适合你的 AI 工具</h1>
      <p class="directory-lede">按真实使用场景整理，少一点比较，多一点创造。</p>

      <div class="directory-search">
        <label for="tool-search" class="sr-only">搜索 AI 工具、用途或场景</label>
        <input
          id="tool-search"
          v-model="query"
          type="search"
          autocomplete="off"
          placeholder="搜索工具、用途或场景，例如：做 PPT"
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

      <div class="directory-meta" aria-label="目录概览">
        <span><strong>24</strong> 个精选工具</span>
        <span><strong>6</strong> 个使用场景</span>
        <span>人工整理 · 官方链接</span>
      </div>
    </section>

    <section class="directory-controls" aria-label="按场景筛选">
      <div class="category-tabs" role="group" aria-label="工具分类">
        <button
          class="category-tab"
          :class="{ active: activeCategory === 'all' }"
          type="button"
          :aria-pressed="activeCategory === 'all'"
          @click="chooseCategory('all')"
        >
          全部 <span>24</span>
        </button>
        <button
          v-for="category in categories"
          :key="category.value"
          class="category-tab"
          :class="{ active: activeCategory === category.value }"
          type="button"
          :aria-pressed="activeCategory === category.value"
          @click="chooseCategory(category.value as ToolCategory)"
        >
          {{ category.label }} <span>{{ category.count }}</span>
        </button>
      </div>
      <button v-if="isFiltered" class="control-reset" type="button" @click="clearSearch">
        重置筛选
      </button>
    </section>

    <section class="tool-section" aria-labelledby="tool-list-title">
      <header class="tool-section-heading">
        <div>
          <p class="directory-kicker">{{ sectionKicker }}</p>
          <h2 id="tool-list-title">{{ sectionTitle }}</h2>
        </div>
        <span class="tool-count">
          {{ isInitialView ? `精选 ${displayedTools.length} 个` : `${displayedTools.length} 个工具` }}
        </span>
      </header>

      <div v-if="displayedTools.length" class="tool-grid">
        <article v-for="tool in displayedTools" :key="tool.slug" class="tool-card">
          <div class="tool-card-topline">
            <span class="tool-category">{{ getCategoryLabel(tool.category) }}</span>
            <span class="tool-updated">{{ formatDate(tool.updatedAt) }}</span>
          </div>
          <h3><a :href="`/tools/${tool.slug}`">{{ tool.name }}</a></h3>
          <p class="tool-tagline">{{ tool.tagline }}</p>
          <p class="tool-description">{{ tool.description }}</p>
          <div class="tool-card-footer">
            <span class="tool-pricing">{{ tool.pricing }}</span>
            <a
              class="tool-detail-link"
              :href="`/tools/${tool.slug}`"
            >
              查看详情 <span aria-hidden="true">↗</span>
            </a>
          </div>
        </article>
      </div>

      <div v-else class="tool-empty" role="status">
        <p class="directory-kicker">NO MATCHES</p>
        <h3>没有找到相关工具</h3>
        <p>换个关键词试试，或者先看看全部精选工具。</p>
        <button class="empty-reset" type="button" @click="clearSearch">查看全部工具</button>
      </div>
    </section>

    <section class="directory-note" aria-label="目录说明">
      <span class="note-mark" aria-hidden="true">i</span>
      <p>工具信息由人工整理，价格、功能和授权可能变化，使用前请以工具官网为准。</p>
      <a href="/about">了解收录标准 <span aria-hidden="true">→</span></a>
    </section>
  </main>
</template>
