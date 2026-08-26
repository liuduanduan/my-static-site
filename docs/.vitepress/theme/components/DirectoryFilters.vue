<script setup lang="ts">
import { useId } from 'vue'
import {
  chineseSupportLabels,
  pricingModeLabels,
  type CategoryFilter,
  type ChineseSupportFilter,
  type PricingFilter,
  type ToolCategory
} from '../domain/aiTools'
import {
  chineseSupportModes,
  handleCategoryFilterValue,
  handleChineseSupportFilterValue,
  handlePricingFilterValue,
  pricingModes
} from './directoryFilterValues'

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

const filterId = useId()
const categoryId = `${filterId}-category`
const pricingId = `${filterId}-pricing`
const chineseSupportId = `${filterId}-chinese-support`

function selectedValue(event: Event): string | undefined {
  const select = event.currentTarget
  return select instanceof HTMLSelectElement ? select.value : undefined
}

function updateCategory(event: Event) {
  const value = selectedValue(event)
  if (value !== undefined) {
    handleCategoryFilterValue(value, categories, (resolved) => emit('update:category', resolved))
  }
}

function updatePricingMode(event: Event) {
  const value = selectedValue(event)
  if (value !== undefined) {
    handlePricingFilterValue(value, (resolved) => emit('update:pricingMode', resolved))
  }
}

function updateChineseSupport(event: Event) {
  const value = selectedValue(event)
  if (value !== undefined) {
    handleChineseSupportFilterValue(value, (resolved) => {
      emit('update:chineseSupport', resolved)
    })
  }
}
</script>

<template>
  <div class="directory-filters">
    <div class="directory-filter">
      <label :for="categoryId">工具分类</label>
      <select :id="categoryId" :value="category" @change="updateCategory">
        <option value="all">全部分类</option>
        <option v-for="option in categories" :key="option.value" :value="option.value">
          {{ option.label }}（{{ option.count }}）
        </option>
      </select>
    </div>

    <div class="directory-filter">
      <label :for="pricingId">价格模式</label>
      <select :id="pricingId" :value="pricingMode" @change="updatePricingMode">
        <option value="all">全部价格</option>
        <option v-for="mode in pricingModes" :key="mode" :value="mode">
          {{ pricingModeLabels[mode] }}
        </option>
      </select>
    </div>

    <div class="directory-filter">
      <label :for="chineseSupportId">中文支持</label>
      <select
        :id="chineseSupportId"
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
