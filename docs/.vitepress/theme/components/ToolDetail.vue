<script setup lang="ts">
import { computed } from 'vue'
import {
  accessModeLabels,
  chineseSupportLabels,
  getCategoryLabel,
  getToolBySlug,
  pricingModeLabels
} from '../domain/aiTools'
import { getToolVisual } from '../domain/directoryPresentation'

const props = defineProps<{
  slug: string
}>()

const tool = computed(() => getToolBySlug(props.slug))
const visual = computed(() => tool.value
  ? getToolVisual(tool.value.name, tool.value.category)
  : null
)
const alternatives = computed(() =>
  tool.value?.alternatives
    .map((slug) => getToolBySlug(slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item)) ?? []
)

function formatDate(value: string): string {
  return value.replaceAll('-', '.')
}
</script>

<template>
  <div v-if="tool" class="tool-detail-shell">
    <a class="back-link" href="/">← 返回工具目录</a>

    <article class="tool-detail-card">
      <header class="tool-detail-hero">
        <div class="detail-brand-row">
          <span
            v-if="visual"
            class="tool-brand-mark tool-brand-mark--large"
            :style="{
              '--tool-accent': visual.accent,
              '--tool-soft': visual.soft
            }"
            aria-hidden="true"
          >
            {{ visual.mark }}
          </span>
          <div>
            <div class="detail-kicker">{{ getCategoryLabel(tool.category) }} / VERIFIED TOOL</div>
            <span class="detail-curated">✓ 人工整理</span>
          </div>
        </div>
        <h1>{{ tool.name }}</h1>
        <p class="tool-detail-tagline">{{ tool.tagline }}</p>
        <p class="tool-detail-description">{{ tool.description }}</p>
        <div class="tool-detail-actions">
          <a
            class="official-link"
            :href="tool.url"
            target="_blank"
            rel="noreferrer noopener"
            data-affiliate-slot="tool-directory"
          >
            访问官方网站 <span aria-hidden="true">↗</span>
          </a>
          <span class="detail-updated">最后核验 {{ formatDate(tool.updatedAt) }}</span>
        </div>
      </header>

      <div class="tool-detail-body">
        <section class="tool-facts" aria-label="工具基本信息">
          <div>
            <span>价格模式</span>
            <strong>{{ pricingModeLabels[tool.pricingMode] }}</strong>
          </div>
          <div>
            <span>中文支持</span>
            <strong>{{ chineseSupportLabels[tool.chineseSupport] }}</strong>
          </div>
          <div>
            <span>使用平台</span>
            <strong>{{ tool.accessModes.map((mode) => accessModeLabels[mode]).join('、') }}</strong>
          </div>
          <div>
            <span>是否注册</span>
            <strong>{{ tool.requiresAccount ? '需要注册' : '无需注册' }}</strong>
          </div>
        </section>

        <section class="detail-section">
          <p class="detail-label">适合谁</p>
          <ul class="detail-list detail-list--plain">
            <li v-for="item in tool.bestFor" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section class="detail-section">
          <p class="detail-label">能做什么</p>
          <ul class="detail-list detail-list--plain">
            <li v-for="item in tool.features" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section class="detail-section detail-section--wide">
          <p class="detail-label">价格概览</p>
          <p class="detail-copy">{{ tool.pricing }}</p>
        </section>

        <section class="detail-section detail-section--wide detail-pros-cons">
          <div>
            <p class="detail-label">值得肯定</p>
            <ul class="detail-list detail-list--check">
              <li v-for="item in tool.pros" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div>
            <p class="detail-label">需要留意</p>
            <ul class="detail-list detail-list--watch">
              <li v-for="item in tool.cons" :key="item">{{ item }}</li>
            </ul>
          </div>
        </section>

        <section v-if="alternatives.length" class="detail-section detail-section--wide">
          <p class="detail-label">你也可以看看</p>
          <div class="alternative-list">
            <a v-for="alternative in alternatives" :key="alternative.slug" :href="`/tools/${alternative.slug}`">
              <span>{{ alternative.name }}</span>
              <small>{{ alternative.tagline }}</small>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </div>

      <footer class="tool-detail-disclosure">
        我们只提供信息整理。价格、功能、数据处理和商用授权请以 {{ tool.name }} 官方说明为准。
      </footer>
    </article>
  </div>

  <section v-else class="tool-empty tool-empty--detail" role="status">
    <p class="directory-kicker">TOOL NOT FOUND</p>
    <h1>这个工具暂时不在目录里</h1>
    <p>返回首页看看其他精选工具。</p>
    <a class="empty-reset" href="/">返回工具目录</a>
  </section>
</template>
