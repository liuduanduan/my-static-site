<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { CampaignPublic } from '../../../../shared/submissions/contracts'
import { parseCampaignPublic } from '../../../../shared/submissions/validation'
import { getToolBySlug } from '../domain/aiTools'

const campaigns = ref<CampaignPublic[]>([])
const sponsoredTools = computed(() =>
  campaigns.value
    .filter((campaign) => campaign.type === 'sponsored_card')
    .map((campaign) => {
      const tool = getToolBySlug(campaign.toolSlug)
      return tool ? { campaign, tool } : null
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
)

onMounted(async () => {
  try {
    const response = await fetch('/api/campaigns', {
      headers: { Accept: 'application/json' }
    })
    if (!response.ok) throw new Error('campaigns_unavailable')
    const payload = await response.json() as { campaigns?: unknown }
    if (!Array.isArray(payload.campaigns)) throw new Error('campaigns_invalid')
    campaigns.value = payload.campaigns.map((campaign) =>
      parseCampaignPublic(campaign) as CampaignPublic
    )
  } catch {
    campaigns.value = []
  }
})
</script>

<template>
  <section
    v-if="sponsoredTools.length"
    class="sponsored-tools"
    aria-labelledby="sponsored-tools-title"
  >
    <header class="sponsored-tools__heading">
      <div>
        <p class="platform-kicker">SPONSORED</p>
        <h2 id="sponsored-tools-title">赞助工具</h2>
      </div>
      <p>以下为付费展示，不属于编辑精选，也不影响自然搜索与分类排序。</p>
    </header>
    <div class="sponsored-tools__grid">
      <article v-for="item in sponsoredTools" :key="item.tool.slug" class="sponsored-tool-card">
        <span class="commercial-label">赞助</span>
        <a
          :href="item.campaign.destinationUrl"
          target="_blank"
          rel="sponsored noreferrer noopener"
        >
          <strong>{{ item.tool.name }}</strong>
          <span>{{ item.tool.tagline }}</span>
          <small>了解合作页面 <span aria-hidden="true">↗</span></small>
        </a>
      </article>
    </div>
  </section>
</template>
