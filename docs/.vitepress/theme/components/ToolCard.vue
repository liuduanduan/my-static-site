<script setup lang="ts">
import { computed } from 'vue'
import {
  chineseSupportLabels,
  getCategoryLabel,
  pricingModeLabels
} from '../domain/aiTools'
import type { ReadonlyAiTool } from '../domain/aiTools'
import { getToolVisual } from '../domain/directoryPresentation'

const { tool } = defineProps<{
  tool: ReadonlyAiTool
}>()

const toolVisual = computed(() => getToolVisual(tool.name, tool.category))
</script>

<template>
  <article class="tool-card">
    <div class="tool-card-topline">
      <span
        class="tool-brand-mark"
        :style="{
          '--tool-accent': toolVisual.accent,
          '--tool-soft': toolVisual.soft
        }"
        aria-hidden="true"
      >
        {{ toolVisual.mark }}
      </span>
      <span class="tool-category">{{ getCategoryLabel(tool.category) }}</span>
    </div>

    <div class="tool-card-copy">
      <h3><a :href="`/tools/${tool.slug}`">{{ tool.name }}</a></h3>
      <p class="tool-tagline">{{ tool.tagline }}</p>
      <p class="tool-description">{{ tool.description }}</p>
    </div>

    <div class="tool-card-footer">
      <div class="tool-fact-badges" aria-label="工具信息">
        <span
          class="tool-fact-badge"
          :aria-label="`价格模式：${pricingModeLabels[tool.pricingMode]}`"
        >{{ pricingModeLabels[tool.pricingMode] }}</span>
        <span
          class="tool-fact-badge"
          :aria-label="`中文支持：${chineseSupportLabels[tool.chineseSupport]}`"
        >{{ chineseSupportLabels[tool.chineseSupport] }}</span>
      </div>
      <a class="tool-detail-link" :href="`/tools/${tool.slug}`">
        查看工具 <span aria-hidden="true">→</span>
      </a>
    </div>
  </article>
</template>
