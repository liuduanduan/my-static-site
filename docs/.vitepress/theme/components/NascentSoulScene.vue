<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const isEn = computed(() => route.path.startsWith('/en/'))

const copy = computed(() => {
  if (isEn.value) {
    return {
      kicker: 'RMJI Mortal Realm highlight',
      title: 'Han Li Forms His Nascent Soul',
      subtitle: 'A visual reading scene for the Heavenly South seclusion arc: core shattered, soul born, storm and inner demon crossing at the same threshold.',
      facts: [
        ['Stage', 'Middle-late Mortal Realm'],
        ['Age estimate', 'about 217'],
        ['Thread', 'Core to Nascent Soul']
      ],
      links: [
        ['Breakthrough thread', '/en/rmji/timeline/nascent-soul-breakthrough-thread'],
        ['Nascent Soul stage', '/en/rmji/laws/nascent-soul-stage'],
        ['Han Li', '/en/rmji/characters/han-li']
      ]
    }
  }

  return {
    kicker: '凡人修仙传 · 人界高光',
    title: '韩立结婴天象',
    subtitle: '天南闭关段的原创视觉场景：金丹碎，元婴成，雷光、心魔与灵气漩涡一同压到门槛上。',
    facts: [
      ['阶段', '人界中后期'],
      ['年龄估算', '约217岁'],
      ['线索', '金丹化婴']
    ],
    links: [
      ['结婴突破线', '/rmji/timeline/nascent-soul-breakthrough-thread'],
      ['元婴期', '/rmji/laws/nascent-soul-stage'],
      ['韩立词条', '/rmji/characters/han-li']
    ]
  }
})

const runes = [
  { glyph: '雷', angle: 0, delay: -0.3 },
  { glyph: '木', angle: 30, delay: -1.2 },
  { glyph: '水', angle: 60, delay: -2.5 },
  { glyph: '火', angle: 90, delay: -0.8 },
  { glyph: '土', angle: 120, delay: -1.7 },
  { glyph: '金', angle: 150, delay: -2.9 },
  { glyph: '坎', angle: 180, delay: -0.4 },
  { glyph: '离', angle: 210, delay: -1.5 },
  { glyph: '震', angle: 240, delay: -2.2 },
  { glyph: '巽', angle: 270, delay: -0.9 },
  { glyph: '艮', angle: 300, delay: -1.9 },
  { glyph: '兑', angle: 330, delay: -2.7 }
]
</script>

<template>
  <section class="nascent-scene" aria-labelledby="nascent-scene-title">
    <div class="nascent-scene__stage">
      <div class="nascent-scene__copy">
        <p class="nascent-scene__kicker">{{ copy.kicker }}</p>
        <h2 id="nascent-scene-title">{{ copy.title }}</h2>
        <p>{{ copy.subtitle }}</p>

        <div class="nascent-scene__actions" aria-label="RMJI quick links">
          <a v-for="link in copy.links" :key="link[1]" :href="link[1]">{{ link[0] }}</a>
        </div>
      </div>

      <div class="nascent-visual" aria-hidden="true">
        <div class="nascent-visual__rain"></div>
        <div class="nascent-visual__runes">
          <span
            v-for="rune in runes"
            :key="rune.glyph"
            :style="`transform: rotate(${rune.angle}deg) translateY(-142px) rotate(-${rune.angle}deg); animation-delay: ${rune.delay}s;`"
          >
            {{ rune.glyph }}
          </span>
        </div>

        <svg class="nascent-visual__svg" viewBox="0 0 640 420" focusable="false">
          <defs>
            <filter id="nascent-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="nascent-stream" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#8ef7df" />
              <stop offset="45%" stop-color="#f2c75a" />
              <stop offset="100%" stop-color="#d66b70" />
            </linearGradient>
          </defs>

          <path class="cloud-line cloud-line-a" d="M35 288 C126 236 187 326 271 271 C347 221 413 263 471 226 C536 184 584 222 620 188" />
          <path class="cloud-line cloud-line-b" d="M24 335 C111 299 186 359 282 314 C363 276 446 330 529 282 C571 258 601 260 626 246" />

          <g class="formation-rings">
            <ellipse class="formation-ring ring-a" cx="338" cy="214" rx="176" ry="54" />
            <ellipse class="formation-ring ring-b" cx="338" cy="214" rx="128" ry="104" />
            <ellipse class="formation-ring ring-c" cx="338" cy="214" rx="218" ry="86" />
          </g>

          <path class="spirit-stream stream-a" d="M54 250 C162 151 263 182 327 214 C409 255 492 230 598 128" />
          <path class="spirit-stream stream-b" d="M85 132 C166 206 239 210 316 190 C415 164 509 196 588 305" />
          <path class="spirit-stream stream-c" d="M120 355 C205 278 276 262 344 300 C429 348 506 326 584 251" />

          <g class="seal-lines">
            <path d="M338 62 L384 180 L512 192 L410 262 L438 382 L338 314 L238 382 L266 262 L164 192 L292 180 Z" />
            <path d="M222 104 L454 324" />
            <path d="M456 104 L220 324" />
          </g>

          <g class="lightning">
            <path class="bolt bolt-a" d="M475 25 L430 104 L466 104 L402 214" />
            <path class="bolt bolt-b" d="M154 54 L199 139 L166 139 L232 248" />
            <path class="bolt bolt-c" d="M553 154 L513 210 L543 214 L486 302" />
          </g>

          <g class="soul-figure" filter="url(#nascent-glow)">
            <circle class="soul-halo" cx="338" cy="214" r="72" />
            <path class="soul-body" d="M338 167 C297 170 276 203 289 241 C299 272 324 286 338 314 C352 286 377 272 387 241 C400 203 379 170 338 167 Z" />
            <circle class="soul-head" cx="338" cy="146" r="27" />
            <path class="soul-breath" d="M306 229 C327 244 351 244 373 229" />
          </g>
        </svg>

        <div class="nascent-core"></div>
        <span v-for="spark in 22" :key="spark" class="nascent-spark"></span>
      </div>

      <dl class="nascent-scene__facts">
        <div v-for="fact in copy.facts" :key="fact[0]">
          <dt>{{ fact[0] }}</dt>
          <dd>{{ fact[1] }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.nascent-scene {
  position: relative;
  overflow: hidden;
  margin: -18px 0 34px;
  border-block: 1px solid rgba(242, 199, 90, 0.2);
  background:
    linear-gradient(115deg, #071611 0%, #102439 48%, #241320 100%),
    #071611;
  color: #f7efe0;
}

.nascent-scene::before {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(90deg, rgba(142, 247, 223, 0.05) 0, rgba(142, 247, 223, 0.05) 1px, transparent 1px, transparent 42px),
    repeating-linear-gradient(0deg, rgba(242, 199, 90, 0.035) 0, rgba(242, 199, 90, 0.035) 1px, transparent 1px, transparent 34px);
  content: "";
  opacity: 0.75;
  pointer-events: none;
}

.nascent-scene__stage {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(260px, 0.68fr) minmax(460px, 1fr);
  grid-template-areas:
    "copy visual"
    "facts visual";
  gap: 18px 34px;
  align-items: center;
  max-width: 1152px;
  min-height: 430px;
  margin: 0 auto;
  padding: 34px 24px;
}

.nascent-scene__copy {
  grid-area: copy;
  max-width: 500px;
}

.nascent-scene__kicker {
  margin: 0 0 10px;
  color: #8ef7df;
  font-size: 14px;
  font-weight: 800;
}

.nascent-scene h2 {
  margin: 0;
  color: #fff7df;
  font-size: 42px;
  line-height: 1.12;
  letter-spacing: 0;
}

.nascent-scene__copy p:not(.nascent-scene__kicker) {
  max-width: 460px;
  margin: 16px 0 0;
  color: rgba(247, 239, 224, 0.8);
  font-size: 16px;
  line-height: 1.75;
}

.nascent-scene__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.nascent-scene__actions a {
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  border: 1px solid rgba(142, 247, 223, 0.38);
  border-radius: 8px;
  background: rgba(5, 14, 13, 0.45);
  color: #f7efe0;
  padding: 0 13px;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}

.nascent-scene__actions a:hover {
  border-color: #f2c75a;
  background: rgba(242, 199, 90, 0.16);
  transform: translateY(-1px);
}

.nascent-scene__facts {
  grid-area: facts;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  max-width: 520px;
  margin: 2px 0 0;
}

.nascent-scene__facts div {
  min-width: 0;
  border-top: 1px solid rgba(242, 199, 90, 0.3);
  padding-top: 10px;
}

.nascent-scene__facts dt {
  color: rgba(247, 239, 224, 0.62);
  font-size: 12px;
  font-weight: 800;
}

.nascent-scene__facts dd {
  margin: 3px 0 0;
  color: #fff7df;
  font-size: 15px;
  font-weight: 800;
}

.nascent-visual {
  position: relative;
  grid-area: visual;
  min-height: 368px;
  overflow: hidden;
}

.nascent-visual__rain {
  position: absolute;
  inset: 6% 3%;
  background-image:
    linear-gradient(112deg, transparent 0 42%, rgba(142, 247, 223, 0.45) 44%, transparent 47%),
    linear-gradient(112deg, transparent 0 52%, rgba(214, 107, 112, 0.34) 54%, transparent 57%);
  background-size: 112px 180px, 170px 210px;
  opacity: 0.35;
  animation: nascentRain 7s linear infinite;
}

.nascent-visual__svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.cloud-line {
  fill: none;
  stroke: rgba(247, 239, 224, 0.23);
  stroke-linecap: round;
  stroke-width: 2;
}

.cloud-line-a {
  animation: nascentDrift 10s ease-in-out infinite;
}

.cloud-line-b {
  animation: nascentDrift 13s ease-in-out infinite reverse;
}

.formation-rings {
  transform-origin: 338px 214px;
  animation: nascentTurn 24s linear infinite;
}

.formation-ring {
  fill: none;
  stroke-linecap: round;
  stroke-width: 3;
  transform-origin: 338px 214px;
}

.ring-a {
  stroke: rgba(142, 247, 223, 0.74);
  stroke-dasharray: 36 18;
  animation: nascentDash 5.5s linear infinite;
}

.ring-b {
  stroke: rgba(242, 199, 90, 0.78);
  stroke-dasharray: 16 12;
  transform: rotate(62deg);
  animation: nascentDash 7s linear infinite reverse;
}

.ring-c {
  stroke: rgba(214, 107, 112, 0.55);
  stroke-dasharray: 6 14;
  transform: rotate(-18deg);
  animation: nascentDash 9s linear infinite;
}

.spirit-stream {
  fill: none;
  stroke: url("#nascent-stream");
  stroke-linecap: round;
  stroke-width: 4;
  stroke-dasharray: 78 28;
  filter: drop-shadow(0 0 8px rgba(142, 247, 223, 0.42));
  opacity: 0.82;
  animation: nascentFlow 4.6s linear infinite;
}

.stream-b {
  animation-duration: 5.4s;
  animation-direction: reverse;
}

.stream-c {
  animation-duration: 6.4s;
  opacity: 0.62;
}

.seal-lines path {
  fill: none;
  stroke: rgba(247, 239, 224, 0.18);
  stroke-width: 2;
  stroke-dasharray: 12 10;
  animation: nascentSeal 9s linear infinite;
}

.lightning path {
  fill: none;
  stroke: #f4efb7;
  stroke-linejoin: round;
  stroke-width: 4;
  opacity: 0;
  filter: drop-shadow(0 0 8px rgba(244, 239, 183, 0.75));
  animation: nascentFlash 4.8s steps(1, end) infinite;
}

.bolt-b {
  animation-delay: 1.4s;
}

.bolt-c {
  animation-delay: 2.7s;
}

.soul-halo {
  fill: rgba(142, 247, 223, 0.1);
  stroke: rgba(242, 199, 90, 0.66);
  stroke-width: 2;
  animation: nascentPulse 3s ease-in-out infinite;
}

.soul-body {
  fill: rgba(247, 239, 224, 0.88);
  stroke: rgba(142, 247, 223, 0.78);
  stroke-width: 2;
  animation: nascentFloat 4s ease-in-out infinite;
}

.soul-head {
  fill: rgba(247, 239, 224, 0.95);
  stroke: rgba(242, 199, 90, 0.78);
  stroke-width: 2;
  animation: nascentFloat 4s ease-in-out infinite;
}

.soul-breath {
  fill: none;
  stroke: rgba(16, 36, 57, 0.76);
  stroke-linecap: round;
  stroke-width: 4;
}

.nascent-core {
  position: absolute;
  left: calc(52.8% - 76px);
  top: calc(51% - 76px);
  width: 152px;
  height: 152px;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(255, 255, 235, 0.9) 0 8%, rgba(242, 199, 90, 0.34) 16%, rgba(142, 247, 223, 0.14) 35%, transparent 66%);
  mix-blend-mode: screen;
  pointer-events: none;
  animation: nascentCore 2.8s ease-in-out infinite;
}

.nascent-visual__runes {
  position: absolute;
  left: 52.8%;
  top: 51%;
  z-index: 2;
  width: 0;
  height: 0;
  animation: nascentTurn 30s linear infinite reverse;
}

.nascent-visual__runes span {
  position: absolute;
  left: -12px;
  top: -12px;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  color: rgba(255, 247, 223, 0.82);
  font-size: 14px;
  font-weight: 800;
  text-shadow: 0 0 8px rgba(242, 199, 90, 0.7);
  animation: nascentRune 3s ease-in-out infinite;
}

.nascent-spark {
  position: absolute;
  left: 52.8%;
  top: 51%;
  width: 4px;
  height: 28px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(142, 247, 223, 0), rgba(142, 247, 223, 0.95), rgba(242, 199, 90, 0));
  opacity: 0;
  transform-origin: center 142px;
  animation: nascentSpark 3.8s ease-out infinite;
}

.nascent-spark:nth-of-type(1) { transform: rotate(9deg) translateY(-132px); animation-delay: -0.1s; }
.nascent-spark:nth-of-type(2) { transform: rotate(24deg) translateY(-118px); animation-delay: -1.2s; }
.nascent-spark:nth-of-type(3) { transform: rotate(43deg) translateY(-148px); animation-delay: -2.2s; }
.nascent-spark:nth-of-type(4) { transform: rotate(71deg) translateY(-128px); animation-delay: -0.8s; }
.nascent-spark:nth-of-type(5) { transform: rotate(96deg) translateY(-152px); animation-delay: -1.8s; }
.nascent-spark:nth-of-type(6) { transform: rotate(118deg) translateY(-124px); animation-delay: -2.9s; }
.nascent-spark:nth-of-type(7) { transform: rotate(139deg) translateY(-145px); animation-delay: -0.5s; }
.nascent-spark:nth-of-type(8) { transform: rotate(156deg) translateY(-116px); animation-delay: -1.5s; }
.nascent-spark:nth-of-type(9) { transform: rotate(182deg) translateY(-154px); animation-delay: -2.6s; }
.nascent-spark:nth-of-type(10) { transform: rotate(204deg) translateY(-126px); animation-delay: -0.3s; }
.nascent-spark:nth-of-type(11) { transform: rotate(229deg) translateY(-144px); animation-delay: -1.1s; }
.nascent-spark:nth-of-type(12) { transform: rotate(247deg) translateY(-120px); animation-delay: -2.1s; }
.nascent-spark:nth-of-type(13) { transform: rotate(269deg) translateY(-150px); animation-delay: -0.7s; }
.nascent-spark:nth-of-type(14) { transform: rotate(288deg) translateY(-122px); animation-delay: -1.7s; }
.nascent-spark:nth-of-type(15) { transform: rotate(311deg) translateY(-138px); animation-delay: -2.7s; }
.nascent-spark:nth-of-type(16) { transform: rotate(333deg) translateY(-130px); animation-delay: -0.9s; }
.nascent-spark:nth-of-type(17) { transform: rotate(351deg) translateY(-146px); animation-delay: -1.9s; }
.nascent-spark:nth-of-type(18) { transform: rotate(38deg) translateY(-104px); animation-delay: -2.4s; }
.nascent-spark:nth-of-type(19) { transform: rotate(128deg) translateY(-110px); animation-delay: -0.4s; }
.nascent-spark:nth-of-type(20) { transform: rotate(218deg) translateY(-106px); animation-delay: -1.4s; }
.nascent-spark:nth-of-type(21) { transform: rotate(302deg) translateY(-112px); animation-delay: -2.4s; }
.nascent-spark:nth-of-type(22) { transform: rotate(342deg) translateY(-100px); animation-delay: -3.1s; }

@keyframes nascentTurn {
  to {
    transform: rotate(360deg);
  }
}

@keyframes nascentDash {
  to {
    stroke-dashoffset: -180;
  }
}

@keyframes nascentFlow {
  to {
    stroke-dashoffset: -212;
  }
}

@keyframes nascentSeal {
  50% {
    stroke: rgba(242, 199, 90, 0.3);
  }
  to {
    stroke-dashoffset: -132;
  }
}

@keyframes nascentFlash {
  0%, 78%, 100% {
    opacity: 0;
  }
  79%, 82% {
    opacity: 0.95;
  }
  83% {
    opacity: 0.18;
  }
}

@keyframes nascentPulse {
  50% {
    r: 84;
    stroke: rgba(142, 247, 223, 0.88);
  }
}

@keyframes nascentFloat {
  50% {
    transform: translateY(-8px);
  }
}

@keyframes nascentCore {
  50% {
    transform: scale(1.16);
    opacity: 0.68;
  }
}

@keyframes nascentRain {
  to {
    background-position: 112px 180px, 170px 210px;
  }
}

@keyframes nascentDrift {
  50% {
    transform: translateX(-18px);
    opacity: 0.62;
  }
}

@keyframes nascentRune {
  50% {
    color: #8ef7df;
    transform: translateY(-4px);
  }
}

@keyframes nascentSpark {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
  }
}

@media (max-width: 960px) {
  .nascent-scene__stage {
    grid-template-columns: 1fr;
    grid-template-areas:
      "copy"
      "visual"
      "facts";
    min-height: 0;
    padding: 30px 24px 28px;
  }

  .nascent-scene__copy {
    max-width: 720px;
  }

  .nascent-scene__copy p:not(.nascent-scene__kicker) {
    max-width: 680px;
  }

  .nascent-visual {
    min-height: 310px;
  }
}

@media (max-width: 640px) {
  .nascent-scene {
    margin-top: -8px;
  }

  .nascent-scene__stage {
    padding: 26px 18px;
  }

  .nascent-scene h2 {
    font-size: 30px;
    line-height: 1.18;
  }

  .nascent-scene__copy p:not(.nascent-scene__kicker) {
    font-size: 15px;
    line-height: 1.65;
  }

  .nascent-scene__actions a {
    flex: 1 1 auto;
    justify-content: center;
  }

  .nascent-scene__facts {
    grid-template-columns: 1fr;
  }

  .nascent-visual {
    min-height: 270px;
  }

  .nascent-visual__runes,
  .nascent-spark {
    transform: scale(0.86);
  }
}

@media (prefers-reduced-motion: reduce) {
  .nascent-scene *,
  .nascent-scene *::before,
  .nascent-scene *::after {
    animation: none !important;
    transition: none !important;
  }

  .lightning path {
    opacity: 0.25;
  }

  .nascent-spark {
    opacity: 0.35;
  }
}
</style>
