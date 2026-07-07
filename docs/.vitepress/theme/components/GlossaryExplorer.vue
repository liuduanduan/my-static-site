<script setup lang="ts">
import { computed, ref } from 'vue'

type Locale = 'zh' | 'en'
type Term = {
  slug: string
  zh: string
  en: string
  pinyin: string
  category: string
  categoryEn: string
  categoryZh: string
  letter: string
  descZh: string
  descEn: string
}

const props = defineProps<{
  locale?: Locale
}>()

const terms: Term[] = [
  { slug: 'cultivation', zh: '修仙', en: 'Cultivation', pinyin: 'Xiūxiān', category: 'core', categoryZh: '核心术语', categoryEn: 'Core Terms', letter: 'C', descZh: '通过修炼追求长生成仙的过程。', descEn: 'The practice of refining body, spirit, and power toward immortality.' },
  { slug: 'xiuzhen', zh: '修真', en: 'Xiuzhen', pinyin: 'Xiūzhēn', category: 'core', categoryZh: '核心术语', categoryEn: 'Core Terms', letter: 'X', descZh: '学道修行，求得真我，去伪存真。', descEn: 'Cultivating truth and Dao realization.' },
  { slug: 'qi', zh: '灵气', en: 'Qi / Spiritual Energy', pinyin: 'Língqì', category: 'core', categoryZh: '核心术语', categoryEn: 'Core Terms', letter: 'Q', descZh: '天地万物中的生命能量。', descEn: 'The fundamental spiritual energy of cultivation worlds.' },
  { slug: 'golden-core', zh: '金丹', en: 'Golden Core', pinyin: 'Jīndān', category: 'core', categoryZh: '核心术语', categoryEn: 'Core Terms', letter: 'G', descZh: '结丹期凝结的能量核心。', descEn: 'A condensed inner core of cultivation power.' },
  { slug: 'nascent-soul', zh: '元婴', en: 'Nascent Soul', pinyin: 'Yuányīng', category: 'core', categoryZh: '核心术语', categoryEn: 'Core Terms', letter: 'N', descZh: '金丹所化的元神形态。', descEn: 'A spiritual infant or second self.' },
  { slug: 'ascension', zh: '飞升', en: 'Ascension', pinyin: 'Fēishēng', category: 'core', categoryZh: '核心术语', categoryEn: 'Core Terms', letter: 'A', descZh: '修炼大成后进入更高层世界。', descEn: 'The passage into a higher realm.' },
  { slug: 'heavenly-tribulation', zh: '天劫', en: 'Tribulation', pinyin: 'Tiānjié', category: 'core', categoryZh: '核心术语', categoryEn: 'Core Terms', letter: 'T', descZh: '突破时面对的天道考验。', descEn: 'A heavenly trial during major breakthroughs.' },
  { slug: 'rogue-cultivator', zh: '散修', en: 'Rogue Cultivator', pinyin: 'Sǎnxiū', category: 'roles', categoryZh: '修仙职业', categoryEn: 'Cultivation Roles', letter: 'R', descZh: '无门无派、独自修行的修仙者。', descEn: 'A cultivator without strong sect backing.' },
  { slug: 'sect', zh: '宗门', en: 'Sect', pinyin: 'Zōngmén', category: 'sects', categoryZh: '修仙门派', categoryEn: 'Sects & Clans', letter: 'S', descZh: '修仙者的门派组织。', descEn: 'A cultivation institution with hierarchy and inheritance.' },
  { slug: 'artifact', zh: '法宝', en: 'Artifact / Dharma Treasure', pinyin: 'Fǎbǎo', category: 'weapons', categoryZh: '神兵利器', categoryEn: 'Divine Weapons', letter: 'A', descZh: '修仙者使用的法器。', descEn: 'A refined magical treasure or tool.' },
  { slug: 'spirit-stone', zh: '灵石', en: 'Spirit Stone', pinyin: 'Língshí', category: 'treasures', categoryZh: '天材地宝', categoryEn: 'Natural Treasures', letter: 'S', descZh: '修仙界的通用货币和能量来源。', descEn: 'A currency and spiritual energy source.' },
  { slug: 'cultivation-technique', zh: '功法', en: 'Cultivation Technique', pinyin: 'Gōngfǎ', category: 'techniques', categoryZh: '功法武学', categoryEn: 'Techniques & Arts', letter: 'C', descZh: '修炼的具体方法。', descEn: 'A method for guiding cultivation.' },
  { slug: 'demonic-cultivator', zh: '魔修', en: 'Demonic Cultivator', pinyin: 'Móxiū', category: 'roles', categoryZh: '修仙职业', categoryEn: 'Cultivation Roles', letter: 'D', descZh: '修魔道的修仙者。', descEn: 'A cultivator following demonic methods.' },
  { slug: 'righteous-cultivator', zh: '正道', en: 'Righteous Cultivator', pinyin: 'Zhèngdào', category: 'roles', categoryZh: '修仙职业', categoryEn: 'Cultivation Roles', letter: 'R', descZh: '修正道或正统体系的修士。', descEn: 'A cultivator aligned with orthodox paths.' },
  { slug: 'immortal', zh: '仙人', en: 'Immortal', pinyin: 'Xiānrén', category: 'realms', categoryZh: '修炼境界', categoryEn: 'Cultivation Realms', letter: 'I', descZh: '修炼有成、长生不死之人。', descEn: 'A transcendent immortal being.' },
  { slug: 'reincarnation', zh: '轮回', en: 'Reincarnation', pinyin: 'Lúnhuí', category: 'core', categoryZh: '核心术语', categoryEn: 'Core Terms', letter: 'R', descZh: '生死循环，转世重生。', descEn: 'The cycle of death and rebirth.' },
  { slug: 'qi-deviation', zh: '走火入魔', en: 'Qi Deviation', pinyin: 'Zǒuhuǒ Rùmó', category: 'core', categoryZh: '核心术语', categoryEn: 'Core Terms', letter: 'Q', descZh: '修炼出偏差而失控。', descEn: 'A dangerous failure of cultivation control.' },
  { slug: 'immortal-arts', zh: '仙术', en: 'Immortal Arts', pinyin: 'Xiānshù', category: 'techniques', categoryZh: '功法武学', categoryEn: 'Techniques & Arts', letter: 'I', descZh: '修炼成仙或奇幻变化之术。', descEn: 'High-level supernatural arts.' },
  { slug: 'inner-alchemy', zh: '内丹', en: 'Inner Alchemy', pinyin: 'Nèidān', category: 'core', categoryZh: '核心术语', categoryEn: 'Core Terms', letter: 'I', descZh: '道教修炼的核心理论。', descEn: 'A Taoist framework for inner refinement.' },
  { slug: 'tribulation-transcendence', zh: '渡劫', en: 'Tribulation Transcendence', pinyin: 'Dùjié', category: 'realms', categoryZh: '修炼境界', categoryEn: 'Cultivation Realms', letter: 'T', descZh: '度过天劫的过程。', descEn: 'The process of surviving tribulation.' }
]

const query = ref('')
const category = ref('all')
const letter = ref('all')
const letters = ['all', ...Array.from(new Set(terms.map((term) => term.letter))).sort()]
const categories = [
  { value: 'all', zh: '全部分类', en: 'All Categories' },
  { value: 'realms', zh: '修炼境界', en: 'Cultivation Realms' },
  { value: 'techniques', zh: '功法武学', en: 'Techniques & Arts' },
  { value: 'weapons', zh: '神兵利器', en: 'Divine Weapons' },
  { value: 'sects', zh: '修仙门派', en: 'Sects & Clans' },
  { value: 'treasures', zh: '天材地宝', en: 'Natural Treasures' },
  { value: 'roles', zh: '修仙职业', en: 'Cultivation Roles' },
  { value: 'core', zh: '核心术语', en: 'Core Terms' }
]

const prefix = computed(() => props.locale === 'en' ? '/en' : '')
const isEn = computed(() => props.locale === 'en')

const filteredTerms = computed(() => {
  const q = query.value.trim().toLowerCase()
  return terms.filter((term) => {
    const inQuery = !q || [term.zh, term.en, term.pinyin, term.descZh, term.descEn].join(' ').toLowerCase().includes(q)
    const inCategory = category.value === 'all' || term.category === category.value
    const inLetter = letter.value === 'all' || term.letter === letter.value
    return inQuery && inCategory && inLetter
  })
})
</script>

<template>
  <section class="explorer">
    <div class="explorer-toolbar">
      <input v-model="query" type="search" :placeholder="isEn ? 'Search terms...' : '搜索术语...'" />
      <select v-model="category">
        <option v-for="item in categories" :key="item.value" :value="item.value">
          {{ isEn ? item.en : item.zh }}
        </option>
      </select>
    </div>
    <div class="alphabet-index" aria-label="Alphabet index">
      <button v-for="item in letters" :key="item" type="button" :class="{ active: letter === item }" @click="letter = item">
        {{ item === 'all' ? (isEn ? 'All' : '全部') : item }}
      </button>
    </div>
    <p class="muted">{{ isEn ? `${filteredTerms.length} entries` : `共 ${filteredTerms.length} 个词条` }}</p>
    <div class="entry-grid">
      <a v-for="term in filteredTerms" :key="term.slug" class="entry-card" :href="`${prefix}/glossary/${term.slug}`">
        <h3>{{ isEn ? term.en : `${term.zh} / ${term.en}` }}</h3>
        <p class="muted">{{ term.zh }} · {{ term.pinyin }}</p>
        <span class="tag">{{ isEn ? term.categoryEn : term.categoryZh }}</span>
        <p>{{ isEn ? term.descEn : term.descZh }}</p>
      </a>
    </div>
  </section>
</template>
