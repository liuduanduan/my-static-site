<script setup lang="ts">
import { computed, ref } from 'vue'

type Locale = 'zh' | 'en'
type Work = {
  slug: string
  zh: string
  en: string
  author: string
  authorEn: string
  genre: string
  genreEn: string
  status: 'completed' | 'ongoing'
  descZh: string
  descEn: string
}

const props = defineProps<{
  locale?: Locale
}>()

const works: Work[] = [
  { slug: 'piao-miao-journey', zh: '飘邈之旅', en: 'Stellar Travel', author: '萧潜', authorEn: 'Xiao Qian', genre: '星际仙侠流', genreEn: 'Interstellar Xianxia', status: 'completed', descZh: '星际仙侠流的早期代表作。', descEn: 'An early reference for interstellar xianxia.' },
  { slug: 'buddha-is-the-tao', zh: '佛本是道', en: 'Buddha Is The Way', author: '梦入神机', authorEn: 'Meng Ru Shen Ji', genre: '洪荒流', genreEn: 'Primordial Myth', status: 'completed', descZh: '洪荒流网络小说的重要开创作品。', descEn: 'A formative work for primordial myth cultivation fiction.' },
  { slug: 'mortal-journey', zh: '凡人修仙传', en: "A Record of a Mortal's Journey to Immortality", author: '忘语', authorEn: 'Wang Yu', genre: '凡人流', genreEn: 'Mortal Flow', status: 'completed', descZh: '凡人流开山之作，体系严谨。', descEn: 'A foundational mortal-flow novel with a rigorous system.' },
  { slug: 'sect-leader', zh: '修真门派掌门路', en: 'The Path of a Sect Leader', author: '齐可休', authorEn: 'Qi Kexiu', genre: '宗门流', genreEn: 'Sect Management', status: 'ongoing', descZh: '宗门经营与修真生态的代表作品。', descEn: 'A representative sect-management cultivation work.' },
  { slug: 'zhu-xian', zh: '诛仙', en: 'Zhu Xian', author: '萧鼎', authorEn: 'Xiao Ding', genre: '古典仙侠', genreEn: 'Classical Xianxia', status: 'completed', descZh: '古典仙侠、正魔冲突与情感悲剧。', descEn: 'A classic tale of orthodox and demonic conflict.' },
  { slug: 'renegade-immortal', zh: '仙逆', en: 'Xian Ni / Reverse Immortal', author: '耳根', authorEn: 'Er Gen', genre: '仙侠', genreEn: 'Xianxia', status: 'completed', descZh: '以求道、执念和逆天叙事著称。', descEn: 'Known for Dao-seeking, obsession, and defying fate.' },
  { slug: 'shrouding-the-heavens', zh: '遮天', en: 'Shrouding the Heavens', author: '辰东', authorEn: 'Chen Dong', genre: '玄幻仙侠', genreEn: 'Fantasy Xianxia', status: 'completed', descZh: '宏大世界观与遮天体系的代表作。', descEn: 'A vast fantasy-xianxia work with large-scale worldbuilding.' },
  { slug: 'stellar-transformations', zh: '星辰变', en: 'Stellar Transformations', author: '我吃西红柿', authorEn: 'I Eat Tomatoes', genre: '修真', genreEn: 'Cultivation', status: 'completed', descZh: '以星辰之力和修真进阶为核心。', descEn: 'A classic cultivation novel centered on stellar power.' },
  { slug: 'hundred-refinements', zh: '百炼成仙', en: 'A Hundred Refinements to Immortality', author: '幻雨', authorEn: 'Huanyu', genre: '废品修仙流', genreEn: 'Underdog Cultivation', status: 'completed', descZh: '长篇废品修仙流代表作品。', descEn: 'A long underdog-cultivation reference.' },
  { slug: 'i-shall-seal-the-heavens', zh: '我欲封天', en: 'I Shall Seal the Heavens', author: '耳根', authorEn: 'Er Gen', genre: '仙侠', genreEn: 'Xianxia', status: 'completed', descZh: '耳根代表作之一，兼具热血与宿命感。', descEn: 'A major Er Gen cultivation adventure.' }
]

const query = ref('')
const genre = ref('all')
const status = ref('all')
const isEn = computed(() => props.locale === 'en')
const prefix = computed(() => isEn.value ? '/en' : '')
const genres = computed(() => ['all', ...Array.from(new Set(works.map((work) => work.genre)))])
const genreOptions = computed(() => genres.value.filter((item) => item !== 'all'))

const filteredWorks = computed(() => {
  const q = query.value.trim().toLowerCase()
  return works.filter((work) => {
    const inQuery = !q || [work.zh, work.en, work.author, work.authorEn, work.genre, work.genreEn].join(' ').toLowerCase().includes(q)
    const inGenre = genre.value === 'all' || work.genre === genre.value
    const inStatus = status.value === 'all' || work.status === status.value
    return inQuery && inGenre && inStatus
  })
})
</script>

<template>
  <section class="explorer">
    <div class="explorer-toolbar">
      <input v-model="query" type="search" :placeholder="isEn ? 'Search novels...' : '搜索小说...'" />
      <select v-model="genre">
        <option value="all">{{ isEn ? 'All Genres' : '全部流派' }}</option>
        <option v-for="item in genreOptions" :key="item" :value="item">{{ item }}</option>
      </select>
      <select v-model="status">
        <option value="all">{{ isEn ? 'All Status' : '全部状态' }}</option>
        <option value="completed">{{ isEn ? 'Completed' : '已完结' }}</option>
        <option value="ongoing">{{ isEn ? 'Ongoing' : '连载中' }}</option>
      </select>
    </div>
    <p class="muted">{{ isEn ? `${filteredWorks.length} works` : `共 ${filteredWorks.length} 部作品` }}</p>
    <div class="works-grid">
      <a v-for="work in filteredWorks" :key="work.slug" class="work-card" :href="`${prefix}/classic-works/${work.slug}`">
        <h3>{{ isEn ? work.en : work.zh }}</h3>
        <p class="muted">{{ work.zh }} · {{ work.author }} / {{ work.authorEn }}</p>
        <span class="tag">{{ work.status === 'completed' ? (isEn ? 'Completed' : '已完结') : (isEn ? 'Ongoing' : '连载中') }}</span>
        <span class="tag">{{ isEn ? work.genreEn : work.genre }}</span>
        <p>{{ isEn ? work.descEn : work.descZh }}</p>
        <span class="read-more">{{ isEn ? 'View details' : '查看详情' }}</span>
      </a>
    </div>
  </section>
</template>
