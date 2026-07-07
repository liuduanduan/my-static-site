<script setup lang="ts">
type Locale = 'zh' | 'en'

const props = defineProps<{
  locale?: Locale
}>()

const entries = [
  '/glossary/qi',
  '/glossary/golden-core',
  '/glossary/nascent-soul',
  '/glossary/ascension',
  '/glossary/heavenly-tribulation',
  '/glossary/tribulation-transcendence',
  '/cultivation-system/dao-ancestor',
  '/classic-works/mortal-journey',
  '/culture/inner-alchemy'
]

function explore() {
  const prefix = props.locale === 'en' ? '/en' : ''
  const target = entries[Math.floor(Math.random() * entries.length)]
  window.location.href = `${prefix}${target}`
}
</script>

<template>
  <div class="random-entry">
    <button type="button" @click="explore">
      {{ locale === 'en' ? 'Random Exploration' : '随机探索' }}
    </button>
  </div>
</template>
