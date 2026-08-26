<script setup lang="ts">
import {
  chineseSupportLabels,
  pricingModeLabels,
  type CategoryFilter,
  type ChineseSupportFilter,
  type PricingFilter,
  type ToolCategory
} from '../domain/aiTools'

interface DirectoryCategory {
  readonly value: ToolCategory
  readonly label: string
  readonly count: number
}

const { categories, category, pricingMode, chineseSupport } = defineProps<{
  categories: readonly DirectoryCategory[]
  category: CategoryFilter
  pricingMode: PricingFilter
  chineseSupport: ChineseSupportFilter
}>()

const emit = defineEmits<{
  'update:category': [value: CategoryFilter]
  'update:pricingMode': [value: PricingFilter]
  'update:chineseSupport': [value: ChineseSupportFilter]
  'reset': []
}>()

const pricingModes = ['free', 'freemium', 'paid', 'contact'] as const
const chineseSupportModes = ['native', 'partial', 'none'] as const

function selectedValue(event: Event): string | undefined {
  const select = event.currentTarget
  return select instanceof HTMLSelectElement ? select.value : undefined
}

function isCategoryFilter(value: string): value is CategoryFilter {
  return value === 'all' || categories.some((option) => option.value === value)
}

function isPricingFilter(value: string): value is PricingFilter {
  return value === 'all' || (pricingModes as readonly string[]).includes(value)
}

function isChineseSupportFilter(value: string): value is ChineseSupportFilter {
  return value === 'all' || (chineseSupportModes as readonly string[]).includes(value)
}

function updateCategory(event: Event) {
  const value = selectedValue(event)
  if (value !== undefined && isCategoryFilter(value)) emit('update:category', value)
}

function updatePricingMode(event: Event) {
  const value = selectedValue(event)
  if (value !== undefined && isPricingFilter(value)) emit('update:pricingMode', value)
}

function updateChineseSupport(event: Event) {
  const value = selectedValue(event)
  if (value !== undefined && isChineseSupportFilter(value)) {
    emit('update:chineseSupport', value)
  }
}
</script>

<template>
  <div class="directory-filters">
    <div class="directory-filter">
      <label for="directory-category-filter">工具分类</label>
      <select id="directory-category-filter" :value="category" @change="updateCategory">
        <option value="all">全部分类</option>
        <option v-for="option in categories" :key="option.value" :value="option.value">
          {{ option.label }}（{{ option.count }}）
        </option>
      </select>
    </div>

    <div class="directory-filter">
      <label for="directory-pricing-filter">价格模式</label>
      <select id="directory-pricing-filter" :value="pricingMode" @change="updatePricingMode">
        <option value="all">全部价格</option>
        <option v-for="mode in pricingModes" :key="mode" :value="mode">
          {{ pricingModeLabels[mode] }}
        </option>
      </select>
    </div>

    <div class="directory-filter">
      <label for="directory-chinese-filter">中文支持</label>
      <select
        id="directory-chinese-filter"
        :value="chineseSupport"
        @change="updateChineseSupport"
      >
        <option value="all">全部支持情况</option>
        <option v-for="mode in chineseSupportModes" :key="mode" :value="mode">
          {{ chineseSupportLabels[mode] }}
        </option>
      </select>
    </div>

    <button type="button" @click="emit('reset')">重置筛选</button>
  </div>
</template>
