<script lang="ts">
import { computed, defineComponent, h } from 'vue'
import {
  accessModeLabels,
  getCategoryLabel,
  getToolBySlug
} from '../domain/aiTools'

export default defineComponent({
  name: 'ToolStructuredData',
  props: {
    slug: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const structuredData = computed(() => {
      const tool = getToolBySlug(props.slug)
      if (!tool) return ''

      const categoryLabel = getCategoryLabel(tool.category)
      const canonicalUrl = `https://no996noicu.com/tools/${tool.slug}`
      const application: Record<string, unknown> = {
        '@type': 'SoftwareApplication',
        name: tool.name,
        url: canonicalUrl,
        sameAs: tool.url,
        description: tool.description,
        applicationCategory: categoryLabel,
        operatingSystem: tool.accessModes.map((mode) => accessModeLabels[mode])
      }

      if (tool.pricingMode === 'free') {
        application.offers = {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        }
      }

      return JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          application,
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: '首页',
                item: 'https://no996noicu.com/'
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: categoryLabel,
                item: `https://no996noicu.com/ai-categories/${tool.category}`
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: tool.name,
                item: canonicalUrl
              }
            ]
          }
        ]
      }).replaceAll('<', '\\u003c')
    })

    return () => structuredData.value
      ? h('script', {
          type: 'application/ld+json',
          innerHTML: structuredData.value
        })
      : null
  }
})
</script>
