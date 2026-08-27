<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { CampaignPublic } from '../../../../shared/submissions/contracts'
import { parseCampaignPublic } from '../../../../shared/submissions/validation'

const props = defineProps<{
  slug: string
}>()

const campaigns = ref<CampaignPublic[]>([])
const affiliate = computed(() =>
  campaigns.value.find((campaign) =>
    campaign.type === 'affiliate_link' && campaign.toolSlug === props.slug
  )
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
  <a
    v-if="affiliate"
    class="affiliate-action"
    :href="affiliate.destinationUrl"
    target="_blank"
    rel="sponsored noreferrer noopener"
  >
    <span class="commercial-label">联盟链接</span>
    通过合作链接访问 <span aria-hidden="true">↗</span>
  </a>
</template>
