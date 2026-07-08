<script setup lang="ts">
import { computed, ref } from 'vue'

type Locale = 'zh' | 'en'
type RealmKey = 'mortal' | 'spirit' | 'immortal'
type PlaceKind = 'route' | 'faction' | 'danger' | 'gate' | 'resource'

type MapPlace = {
  id: string
  order: string
  x: number
  y: number
  kind: PlaceKind
  zh: string
  en: string
  noteZh: string
  noteEn: string
  link: string
}

type RealmMap = {
  key: RealmKey
  zh: string
  en: string
  subtitleZh: string
  subtitleEn: string
  places: MapPlace[]
  routes: Array<{ from: string, to: string, bend?: number }>
}

const props = defineProps<{
  locale?: Locale
}>()

const active = ref<RealmKey>('mortal')

const realmMaps: RealmMap[] = [
  {
    key: 'mortal',
    zh: '人界地图',
    en: 'Mortal Realm Map',
    subtitleZh: '从山村、越国宗门、乱星海到大晋和空间节点的路线示意。',
    subtitleEn: 'A route sketch from the village and Yue sects through the Chaotic Star Sea, Great Jin, and spatial nodes.',
    places: [
      { id: 'green-ox', order: '01', x: 120, y: 420, kind: 'route', zh: '青牛镇 / 七玄门', en: 'Green Ox Town / Qixuanmen', noteZh: '凡俗出身和开篇江湖门派入口。', noteEn: 'Mortal origin and the opening martial-sect gateway.', link: 'regions/mundane-world' },
      { id: 'yue', order: '02', x: 230, y: 340, kind: 'faction', zh: '越国 / 黄枫谷', en: 'Yue State / Yellow Maple Valley', noteZh: '正式进入修仙宗门制度。', noteEn: 'Entry into formal sect cultivation.', link: 'regions/yue-state' },
      { id: 'forbidden', order: '03', x: 340, y: 395, kind: 'danger', zh: '血色禁地', en: 'Blood Forbidden Land', noteZh: '筑基资源和低阶秘境争夺。', noteEn: 'Foundation resources and low-level secret-realm contest.', link: 'regions/blood-forbidden-land' },
      { id: 'tiannan', order: '04', x: 455, y: 285, kind: 'faction', zh: '天南 / 慕兰草原', en: 'Heavenly South / Mulan Grassland', noteZh: '正魔压力、区域大战和回归后的身份变化。', noteEn: 'Righteous-demonic pressure, regional war, and changed status after return.', link: 'regions/heavenly-south-region' },
      { id: 'star-sea', order: '05', x: 610, y: 415, kind: 'resource', zh: '乱星海', en: 'Chaotic Star Sea', noteZh: '海域散修、猎妖、妖丹和虚天殿线。', noteEn: 'Maritime rogue cultivation, beast hunting, demon cores, and Void Heaven Hall.', link: 'regions/chaotic-star-sea' },
      { id: 'outer-sea', order: '06', x: 770, y: 455, kind: 'resource', zh: '外星海', en: 'Outer Star Sea', noteZh: '妖兽材料和海域经济循环。', noteEn: 'Demon-beast materials and the sea-resource economy.', link: 'regions/outer-star-sea' },
      { id: 'great-jin', order: '07', x: 560, y: 175, kind: 'faction', zh: '大晋', en: 'Great Jin', noteZh: '人界后期更大的宗门、家族和老怪舞台。', noteEn: 'Late Mortal Realm stage for stronger sects, clans, and old monsters.', link: 'regions/great-jin-region' },
      { id: 'ruins', order: '08', x: 710, y: 155, kind: 'danger', zh: '昆吾山 / 坠魔谷', en: 'Kunwu Mountain / Demonfall Valley', noteZh: '古修遗迹、古魔和高阶修士博弈。', noteEn: 'Ancient ruins, ancient devils, and high-level schemes.', link: 'regions/kunwu-mountain' },
      { id: 'node', order: '09', x: 825, y: 80, kind: 'gate', zh: '空间节点', en: 'Spatial Node', noteZh: '人界进入灵界的跨界风险入口。', noteEn: 'Risky cross-realm gateway from Mortal Realm to Spirit Realm.', link: 'regions/spatial-rifts' }
    ],
    routes: [
      { from: 'green-ox', to: 'yue', bend: -40 },
      { from: 'yue', to: 'forbidden', bend: 45 },
      { from: 'forbidden', to: 'star-sea', bend: 90 },
      { from: 'star-sea', to: 'outer-sea', bend: 35 },
      { from: 'star-sea', to: 'tiannan', bend: -80 },
      { from: 'tiannan', to: 'great-jin', bend: -70 },
      { from: 'great-jin', to: 'ruins', bend: 20 },
      { from: 'ruins', to: 'node', bend: -50 }
    ]
  },
  {
    key: 'spirit',
    zh: '灵界地图',
    en: 'Spirit Realm Map',
    subtitleZh: '飞升后的人妖两族、防线、多族地域、秘境和魔劫压力示意。',
    subtitleEn: 'A sketch of post-ascension human-demon defenses, race regions, special spaces, and devil-calamity pressure.',
    places: [
      { id: 'arrival', order: '01', x: 130, y: 430, kind: 'gate', zh: '飞升落点', en: 'Ascension Landing', noteZh: '韩立进入更高界面的落脚阶段。', noteEn: 'Han Li foothold after entering a higher realm.', link: 'regions/spirit-realm' },
      { id: 'abyss', order: '02', x: 275, y: 345, kind: 'faction', zh: '天渊城', en: 'Heavenly Abyss City', noteZh: '人妖两族防线和灵界秩序入口。', noteEn: 'Human-demon defenses and the gateway into Spirit Realm order.', link: 'regions/heavenly-abyss-city-region' },
      { id: 'flying', order: '03', x: 430, y: 285, kind: 'faction', zh: '飞灵族地域', en: 'Flying Spirit Region', noteZh: '多族身份、圣子圣女和真灵血脉线。', noteEn: 'Race identity, holy-candidate roles, and true-spirit bloodlines.', link: 'regions/flying-spirit-region' },
      { id: 'broad-cold', order: '04', x: 565, y: 145, kind: 'resource', zh: '广寒界', en: 'Broad Cold Realm', noteZh: '灵界特殊空间和多族机缘争夺。', noteEn: 'Special Spirit Realm space and multi-race opportunity contest.', link: 'regions/broad-cold-realm' },
      { id: 'nether', order: '05', x: 615, y: 395, kind: 'danger', zh: '冥河之地', en: 'Nether River Land', noteZh: '阴冥、魂魄和特殊材料相关险地。', noteEn: 'Danger zone tied to souls, yin-underworld motifs, and special materials.', link: 'regions/nether-river-land' },
      { id: 'wild', order: '06', x: 760, y: 290, kind: 'danger', zh: '蛮荒世界', en: 'Wild World', noteZh: '异族、真灵和灵界荒野压力。', noteEn: 'Alien peoples, true spirits, and wilderness pressure.', link: 'regions/wild-world' },
      { id: 'devil-pressure', order: '07', x: 780, y: 465, kind: 'danger', zh: '魔界压力线', en: 'Devil-Realm Pressure', noteZh: '魔劫前奏、跨界战争和魔族资源线。', noteEn: 'Devil-calamity prelude, cross-realm war, and devil resources.', link: 'regions/demon-realm' },
      { id: 'immortal-gate', order: '08', x: 830, y: 80, kind: 'gate', zh: '飞升仙界入口', en: 'Immortal Ascension Gate', noteZh: '从灵界修炼推进到仙界篇的门槛。', noteEn: 'Threshold from Spirit Realm progression into the Immortal World Arc.', link: 'regions/spatial-rifts' }
    ],
    routes: [
      { from: 'arrival', to: 'abyss', bend: -40 },
      { from: 'abyss', to: 'flying', bend: -30 },
      { from: 'flying', to: 'broad-cold', bend: -80 },
      { from: 'flying', to: 'nether', bend: 65 },
      { from: 'nether', to: 'wild', bend: -25 },
      { from: 'wild', to: 'devil-pressure', bend: 70 },
      { from: 'wild', to: 'immortal-gate', bend: -100 }
    ]
  },
  {
    key: 'immortal',
    zh: '仙界地图',
    en: 'Immortal World Map',
    subtitleZh: '黑风海、北寒仙域、烛龙道、真言门、轮回殿、天庭与灰界的行动路线示意。',
    subtitleEn: 'A route sketch linking Black Wind Sea, North Cold domain, Candle Dragon Dao, True Word Sect, Reincarnation Palace, Heavenly Court, and Gray Realm.',
    places: [
      { id: 'black-wind', order: '01', x: 115, y: 430, kind: 'route', zh: '黑风海域 / 黑风岛', en: 'Black Wind Sea / Island', noteZh: '仙界篇低处重启、恢复实力和地方身份。', noteEn: 'Low-foothold restart, recovery, and local identity in the sequel.', link: 'regions/black-wind-sea' },
      { id: 'north-cold', order: '02', x: 265, y: 340, kind: 'faction', zh: '北寒仙域', en: 'North Cold Immortal Domain', noteZh: '仙宫秩序、追逃压力和早期仙界地图。', noteEn: 'Immortal-palace order, pursuit pressure, and early immortal-world map.', link: 'regions/north-cold-immortal-domain' },
      { id: 'candle', order: '03', x: 420, y: 300, kind: 'faction', zh: '烛龙道', en: 'Candle Dragon Dao', noteZh: '仙界组织生态、任务和功法传承入口。', noteEn: 'Organizational ecology, missions, and art-inheritance gateway.', link: 'regions/candle-dragon-dao-region' },
      { id: 'true-word', order: '04', x: 570, y: 205, kind: 'resource', zh: '真言门遗迹', en: 'True Word Sect Ruins', noteZh: '时间法则、旧史和掌天瓶秘密的交汇。', noteEn: 'Intersection of time law, old history, and Heavenly Bottle secrets.', link: 'regions/mantra-sect-ruins' },
      { id: 'reincarnation', order: '05', x: 685, y: 365, kind: 'faction', zh: '轮回殿据点', en: 'Reincarnation Palace Bases', noteZh: '身份伪装、任务路线和反天庭暗线。', noteEn: 'Disguised identity, mission routes, and anti-Heavenly-Court undercurrent.', link: 'regions/reincarnation-palace-strongholds' },
      { id: 'heavenly-court', order: '06', x: 760, y: 120, kind: 'faction', zh: '天庭疆域', en: 'Heavenly Court Territory', noteZh: '仙界秩序、追索和道祖级压力。', noteEn: 'Immortal order, pursuit, and Dao-Ancestor-level pressure.', link: 'regions/heavenly-court-territory' },
      { id: 'gray', order: '07', x: 515, y: 465, kind: 'danger', zh: '灰界入口 / 灰界', en: 'Gray Realm Gate / Gray Realm', noteZh: '异质生态、灰界材料和生存规则差异。', noteEn: 'Alien ecology, gray-realm materials, and different survival rules.', link: 'regions/gray-realm' },
      { id: 'endgame', order: '08', x: 830, y: 255, kind: 'gate', zh: '道祖终局线', en: 'Dao Ancestor Endgame', noteZh: '时间、轮回、天庭和最高层因果收束。', noteEn: 'Time, reincarnation, Heavenly Court, and highest-level karma converge.', link: 'timeline/dao-ancestor-endgame-thread' }
    ],
    routes: [
      { from: 'black-wind', to: 'north-cold', bend: -35 },
      { from: 'north-cold', to: 'candle', bend: -25 },
      { from: 'candle', to: 'true-word', bend: -75 },
      { from: 'true-word', to: 'heavenly-court', bend: -20 },
      { from: 'true-word', to: 'reincarnation', bend: 75 },
      { from: 'reincarnation', to: 'gray', bend: 90 },
      { from: 'reincarnation', to: 'endgame', bend: -15 },
      { from: 'heavenly-court', to: 'endgame', bend: 60 }
    ]
  }
]

const mapAuditNotes = {
  mortal: {
    'green-ox': { chapterZh: '开篇至七玄门选拔段', chapterEn: 'Opening through Qixuanmen selection', eventZh: '离家入门，凡俗起点确立。', eventEn: 'Departure and entry establish the mortal origin.' },
    yue: { chapterZh: '太南小会至黄枫谷入门段', chapterEn: 'Tainan gathering through Yellow Maple Valley entry', eventZh: '进入越国七派制度。', eventEn: 'Entry into the Yue Seven Sects system.' },
    forbidden: { chapterZh: '血色禁地试炼段', chapterEn: 'Blood Forbidden Land trial segment', eventZh: '争夺筑基灵药。', eventEn: 'Contest for Foundation Establishment herbs.' },
    tiannan: { chapterZh: '越国正魔战争与返回天南段', chapterEn: 'Yue war and return to Heavenly South segments', eventZh: '区域战争和旧地关系重组。', eventEn: 'Regional war and reshaped old ties.' },
    'star-sea': { chapterZh: '乱星海立足与虚天殿前后', chapterEn: 'Chaotic Star Sea foothold around Void Heaven Hall', eventZh: '海域资源循环和高阶势力博弈。', eventEn: 'Maritime resource loop and high-level faction games.' },
    'outer-sea': { chapterZh: '外星海猎妖经营段', chapterEn: 'Outer Star Sea beast-hunting segment', eventZh: '妖丹、材料和交易资源积累。', eventEn: 'Demon cores, materials, and trade resources accumulate.' },
    'great-jin': { chapterZh: '大晋游历段', chapterEn: 'Great Jin journey segment', eventZh: '人界后期地图扩张。', eventEn: 'Late Mortal Realm map expansion.' },
    ruins: { chapterZh: '坠魔谷与昆吾山遗迹段', chapterEn: 'Demonfall Valley and Kunwu Mountain ruins segments', eventZh: '古魔、古宝和老怪博弈集中。', eventEn: 'Ancient devils, treasures, and old-monster games converge.' },
    node: { chapterZh: '化神后空间节点飞升段', chapterEn: 'Post-Spirit-Transformation spatial-node ascension segment', eventZh: '人界进入跨界风险。', eventEn: 'Mortal Realm story enters cross-realm risk.' }
  },
  spirit: {
    arrival: { chapterZh: '灵界开局飞升落点段', chapterEn: 'Spirit Realm opening ascension landing', eventZh: '身份和高界面规则重建。', eventEn: 'Identity and higher-realm rules are rebuilt.' },
    abyss: { chapterZh: '天渊城与人妖两族防线段', chapterEn: 'Heavenly Abyss City and human-demon defense segment', eventZh: '个人修炼进入族群防线背景。', eventEn: 'Personal cultivation enters racial-defense context.' },
    flying: { chapterZh: '飞灵族地域与真灵血脉段', chapterEn: 'Flying Spirit region and true-spirit bloodline segment', eventZh: '多族身份和血脉资源线展开。', eventEn: 'Multi-race identity and bloodline resources unfold.' },
    'broad-cold': { chapterZh: '广寒界机缘段', chapterEn: 'Broad Cold Realm opportunity segment', eventZh: '多族秘境争夺升级。', eventEn: 'Multi-race secret-space competition escalates.' },
    nether: { chapterZh: '冥河/阴冥险地相关段', chapterEn: 'Nether / yin-danger segment', eventZh: '魂魄、阴冥和特殊材料风险。', eventEn: 'Soul, yin, and special-material risks.' },
    wild: { chapterZh: '蛮荒与异族压力段', chapterEn: 'Wilderness and alien-pressure segment', eventZh: '灵界荒野和异族资源扩图。', eventEn: 'Spirit Realm wilderness and alien resources expand the map.' },
    'devil-pressure': { chapterZh: '魔劫前奏至魔界远行段', chapterEn: 'Devil Calamity prelude through Devil Realm journey', eventZh: '魔族压力升级为跨界战争。', eventEn: 'Devil pressure escalates into cross-realm war.' },
    'immortal-gate': { chapterZh: '大乘后飞升仙界段', chapterEn: 'Post-Great-Ascension immortal ascension segment', eventZh: '灵界线转入仙界篇。', eventEn: 'Spirit Realm thread turns into the sequel.' }
  },
  immortal: {
    'black-wind': { chapterZh: '仙界篇黑风海开局段', chapterEn: 'Sequel Black Wind Sea opening segment', eventZh: '低处重启和恢复身份。', eventEn: 'Low-foothold restart and identity recovery.' },
    'north-cold': { chapterZh: '北寒仙域冲突段', chapterEn: 'North Cold domain conflict segment', eventZh: '仙宫秩序与追逃压力。', eventEn: 'Immortal-palace order and pursuit pressure.' },
    candle: { chapterZh: '烛龙道入门与任务段', chapterEn: 'Candle Dragon Dao entry and mission segment', eventZh: '仙界组织生态展开。', eventEn: 'Immortal organization ecology unfolds.' },
    'true-word': { chapterZh: '真言门遗迹与时间法则段', chapterEn: 'True Word Sect ruins and time-law segment', eventZh: '时间大道和旧史线索汇合。', eventEn: 'Time Dao and old-history clues converge.' },
    reincarnation: { chapterZh: '轮回殿任务与据点段', chapterEn: 'Reincarnation Palace mission and base segment', eventZh: '反天庭暗线和身份切换。', eventEn: 'Anti-Heavenly-Court undercurrent and identity switches.' },
    'heavenly-court': { chapterZh: '天庭追索与秩序压力段', chapterEn: 'Heavenly Court pursuit and order-pressure segment', eventZh: '道祖级秩序压力显现。', eventEn: 'Dao-Ancestor-level order pressure appears.' },
    gray: { chapterZh: '灰界城池与荒域求生段', chapterEn: 'Gray Realm cities and wilderness survival segment', eventZh: '异质生态、灰晶和生存规则。', eventEn: 'Alien ecology, gray crystals, and survival rules.' },
    endgame: { chapterZh: '仙界篇终局道祖冲突段', chapterEn: 'Sequel finale Dao Ancestor conflict segment', eventZh: '时间、轮回、天庭和最高因果收束。', eventEn: 'Time, reincarnation, Heavenly Court, and top karma converge.' }
  }
} as const

const isEn = computed(() => props.locale === 'en')
const prefix = computed(() => isEn.value ? '/en' : '')
const currentMap = computed(() => realmMaps.find((map) => map.key === active.value) ?? realmMaps[0])

function label(place: MapPlace) {
  return isEn.value ? place.en : place.zh
}

function note(place: MapPlace) {
  return isEn.value ? place.noteEn : place.noteZh
}

function auditNote(place: MapPlace) {
  const notesForMap = mapAuditNotes[currentMap.value.key] as Record<string, {
    chapterZh: string
    chapterEn: string
    eventZh: string
    eventEn: string
  }> | undefined
  return notesForMap?.[place.id]
}

function chapter(place: MapPlace) {
  const item = auditNote(place)
  return item ? (isEn.value ? item.chapterEn : item.chapterZh) : ''
}

function event(place: MapPlace) {
  const item = auditNote(place)
  return item ? (isEn.value ? item.eventEn : item.eventZh) : ''
}

function linkFor(place: MapPlace) {
  return `${prefix.value}/rmji/${place.link}`
}

function nodeById(id: string) {
  return currentMap.value.places.find((place) => place.id === id)
}

function routePath(route: { from: string, to: string, bend?: number }) {
  const from = nodeById(route.from)
  const to = nodeById(route.to)
  if (!from || !to) return ''
  const bend = route.bend ?? 0
  const midX = (from.x + to.x) / 2
  const midY = (from.y + to.y) / 2 + bend
  return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`
}
</script>

<template>
  <section class="realm-map-shell" aria-live="polite">
    <div class="realm-map-tabs" role="tablist" :aria-label="isEn ? 'Realm maps' : '界域地图'">
      <button
        v-for="map in realmMaps"
        :key="map.key"
        type="button"
        role="tab"
        :aria-selected="active === map.key"
        :class="{ active: active === map.key }"
        @click="active = map.key"
      >
        {{ isEn ? map.en : map.zh }}
      </button>
    </div>

    <div class="realm-map-panel">
      <div class="realm-map-visual">
        <svg viewBox="0 0 900 540" role="img" :aria-label="isEn ? currentMap.en : currentMap.zh">
          <rect class="map-bg" x="10" y="10" width="880" height="520" rx="8" />
          <path class="map-current current-one" d="M 45 460 C 180 360 260 500 405 410 S 610 215 855 80" />
          <path class="map-current current-two" d="M 75 120 C 240 210 370 120 520 255 S 745 410 850 245" />
          <path
            v-for="route in currentMap.routes"
            :key="`${route.from}-${route.to}`"
            class="map-route"
            :d="routePath(route)"
          />
          <a v-for="place in currentMap.places" :key="place.id" :href="linkFor(place)" class="map-node-link">
            <circle :class="['map-node', place.kind]" :cx="place.x" :cy="place.y" r="22" />
            <text class="map-node-number" :x="place.x" :y="place.y + 5" text-anchor="middle">{{ place.order }}</text>
          </a>
        </svg>
      </div>

      <div class="realm-map-legend">
        <p class="eyebrow">{{ isEn ? currentMap.en : currentMap.zh }}</p>
        <h3>{{ isEn ? currentMap.subtitleEn : currentMap.subtitleZh }}</h3>
        <ol>
          <li v-for="place in currentMap.places" :key="place.id">
            <a :href="linkFor(place)">
              <span class="place-order">{{ place.order }}</span>
              <strong>{{ label(place) }}</strong>
            </a>
            <p>{{ note(place) }}</p>
            <p v-if="chapter(place) || event(place)" class="map-node-meta">
              <span>{{ chapter(place) }}</span>
              <span>{{ event(place) }}</span>
            </p>
          </li>
        </ol>
      </div>
    </div>

    <p class="realm-map-note">
      {{ isEn
        ? 'Schematic reading maps only: positions show narrative sequence and regional relationship, not official scale or exact geography.'
        : '本图是阅读路线示意：位置表示剧情顺序和区域关系，不代表官方比例或精确地理。' }}
    </p>
  </section>
</template>

<style scoped>
.realm-map-shell {
  margin: 20px 0 30px;
}

.realm-map-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.realm-map-tabs button {
  min-height: 38px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  padding: 0 14px;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.realm-map-tabs button.active,
.realm-map-tabs button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.realm-map-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.8fr);
  gap: 18px;
  align-items: stretch;
}

.realm-map-visual,
.realm-map-legend {
  min-width: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 92%, white 8%);
}

.dark .realm-map-visual,
.dark .realm-map-legend {
  background: color-mix(in srgb, var(--vp-c-bg-soft) 92%, black 8%);
}

.realm-map-visual {
  overflow: hidden;
  aspect-ratio: 5 / 3;
}

.realm-map-visual svg {
  display: block;
  width: 100%;
  height: 100%;
}

.map-bg {
  fill: color-mix(in srgb, var(--vp-c-bg) 74%, white 26%);
  stroke: var(--vp-c-divider);
}

.dark .map-bg {
  fill: color-mix(in srgb, var(--vp-c-bg) 74%, black 26%);
}

.map-current {
  fill: none;
  stroke-width: 34;
  stroke-linecap: round;
  opacity: 0.16;
}

.current-one {
  stroke: #2d8c6f;
}

.current-two {
  stroke: #c9a84c;
}

.map-route {
  fill: none;
  stroke: var(--vp-c-brand-1);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 10 8;
}

.map-node {
  stroke: var(--vp-c-bg-soft);
  stroke-width: 4;
  transition: r 0.18s ease, stroke-width 0.18s ease;
}

.map-node-link:hover .map-node {
  r: 26;
  stroke-width: 5;
}

.map-node.route {
  fill: #2d8c6f;
}

.map-node.faction {
  fill: #6f65d8;
}

.map-node.danger {
  fill: #bd5b4d;
}

.map-node.gate {
  fill: #c08a2d;
}

.map-node.resource {
  fill: #3f9a63;
}

.map-node-number {
  fill: white;
  font-size: 15px;
  font-weight: 800;
  pointer-events: none;
}

.realm-map-legend {
  padding: 18px;
}

.realm-map-legend h3 {
  margin: -4px 0 14px;
  font-size: 18px;
  line-height: 1.4;
}

.realm-map-legend ol {
  display: grid;
  gap: 9px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.realm-map-legend li {
  min-width: 0;
}

.realm-map-legend a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: inherit;
  text-decoration: none;
}

.realm-map-legend a:hover {
  color: var(--vp-c-brand-1);
}

.place-order {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 24px;
  border-radius: 6px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 800;
}

.realm-map-legend p {
  margin: 4px 0 0 36px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.45;
}

.realm-map-legend .map-node-meta {
  display: grid;
  gap: 2px;
  margin-top: 5px;
  font-size: 12px;
  line-height: 1.35;
}

.map-node-meta span:first-child {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.realm-map-note {
  margin: 10px 0 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

@media (max-width: 920px) {
  .realm-map-panel {
    grid-template-columns: 1fr;
  }

  .realm-map-visual {
    aspect-ratio: 4 / 3;
  }
}

@media (max-width: 560px) {
  .realm-map-tabs button {
    flex: 1 1 100%;
  }
}
</style>
