<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const isEn = computed(() => route.path.startsWith('/en/'))

const copy = computed(() => {
  if (isEn.value) {
    return {
      kicker: 'RMJI Immortal World finale',
      title: 'Han Li Ascends to Dao Ancestor',
      subtitle: 'An original finale scene: the time river breaks open, reincarnation turns back, Heavenly Court order collapses, and three thousand Daos converge around the green bottle light.',
      facts: [
        ['Stage', 'Immortal World finale'],
        ['Age estimate', 'after about 12,500'],
        ['Thread', 'Time, reincarnation, bottle karma']
      ],
      links: [
        ['Dao Ancestor endgame', '/en/rmji/timeline/dao-ancestor-endgame-thread'],
        ['Dao Ancestor status', '/en/rmji/laws/dao-ancestor-position'],
        ['Time law', '/en/rmji/laws/time-law']
      ]
    }
  }

  return {
    kicker: '凡人修仙传仙界篇 · 终局高光',
    title: '韩立突破道祖',
    subtitle: '仙界终局原创视觉：时间长河崩开，轮回门倒转，天庭秩序碎裂，三千大道在掌天瓶青光里收束成一线。',
    facts: [
      ['阶段', '仙界篇终局'],
      ['年龄估算', '约12500岁以后'],
      ['线索', '时间 · 轮回 · 掌天瓶']
    ],
    links: [
      ['道祖终局线', '/rmji/timeline/dao-ancestor-endgame-thread'],
      ['道祖位格', '/rmji/laws/dao-ancestor-position'],
      ['时间法则', '/rmji/laws/time-law']
    ]
  }
})

const daoRunes = [
  { glyph: '时', angle: 0, radius: 184, delay: -0.2 },
  { glyph: '轮', angle: 24, radius: 154, delay: -1.1 },
  { glyph: '法', angle: 48, radius: 206, delay: -2.1 },
  { glyph: '道', angle: 72, radius: 170, delay: -0.7 },
  { glyph: '瓶', angle: 96, radius: 216, delay: -1.8 },
  { glyph: '空', angle: 120, radius: 158, delay: -2.8 },
  { glyph: '因', angle: 144, radius: 204, delay: -0.4 },
  { glyph: '果', angle: 168, radius: 174, delay: -1.4 },
  { glyph: '天', angle: 192, radius: 214, delay: -2.4 },
  { glyph: '庭', angle: 216, radius: 160, delay: -0.9 },
  { glyph: '真', angle: 240, radius: 200, delay: -1.9 },
  { glyph: '言', angle: 264, radius: 172, delay: -2.9 },
  { glyph: '灰', angle: 288, radius: 210, delay: -0.6 },
  { glyph: '界', angle: 312, radius: 156, delay: -1.6 },
  { glyph: '仙', angle: 336, radius: 198, delay: -2.6 }
]
</script>

<template>
  <section class="dao-scene" aria-labelledby="dao-scene-title">
    <div class="dao-scene__stage">
      <div class="dao-scene__copy">
        <p class="dao-scene__kicker">{{ copy.kicker }}</p>
        <h2 id="dao-scene-title">{{ copy.title }}</h2>
        <p>{{ copy.subtitle }}</p>

        <div class="dao-scene__actions" aria-label="RMJI finale links">
          <a v-for="link in copy.links" :key="link[1]" :href="link[1]">{{ link[0] }}</a>
        </div>
      </div>

      <div class="dao-visual" aria-hidden="true">
        <div class="dao-visual__rift"></div>
        <div class="dao-visual__skyfall"></div>
        <div class="dao-visual__runes">
          <span
            v-for="rune in daoRunes"
            :key="rune.glyph"
            :style="`transform: rotate(${rune.angle}deg) translateY(-${rune.radius}px) rotate(-${rune.angle}deg); animation-delay: ${rune.delay}s;`"
          >
            {{ rune.glyph }}
          </span>
        </div>

        <svg class="dao-visual__svg" viewBox="0 0 760 520" focusable="false">
          <defs>
            <filter id="dao-glow" x="-70%" y="-70%" width="240%" height="240%">
              <feGaussianBlur stdDeviation="9" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="dao-stream" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#7ff9df" />
              <stop offset="38%" stop-color="#f5d06d" />
              <stop offset="68%" stop-color="#b277ff" />
              <stop offset="100%" stop-color="#ff6d87" />
            </linearGradient>
            <linearGradient id="bottle-light" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#f6ffe8" />
              <stop offset="48%" stop-color="#7ff9df" />
              <stop offset="100%" stop-color="#34b47f" />
            </linearGradient>
          </defs>

          <g class="dao-back-rings">
            <circle class="dao-ring dao-ring-a" cx="396" cy="260" r="218" />
            <circle class="dao-ring dao-ring-b" cx="396" cy="260" r="168" />
            <circle class="dao-ring dao-ring-c" cx="396" cy="260" r="112" />
            <ellipse class="dao-ring dao-ring-d" cx="396" cy="260" rx="292" ry="82" />
            <ellipse class="dao-ring dao-ring-e" cx="396" cy="260" rx="248" ry="154" />
          </g>

          <g class="heaven-splinters">
            <path d="M94 64 L184 116 L151 145 L62 91 Z" />
            <path d="M592 62 L687 104 L639 144 L553 101 Z" />
            <path d="M611 403 L716 381 L696 450 L593 469 Z" />
            <path d="M68 371 L169 407 L123 465 L37 421 Z" />
            <path d="M345 26 L408 72 L360 103 L308 55 Z" />
          </g>

          <path class="time-river river-a" d="M16 295 C128 130 256 164 374 246 C508 339 606 290 742 96" />
          <path class="time-river river-b" d="M34 126 C152 245 282 226 388 172 C504 111 608 167 728 330" />
          <path class="time-river river-c" d="M22 438 C158 312 262 335 370 384 C494 441 618 390 738 244" />
          <path class="time-river river-d" d="M93 31 C156 163 261 215 394 207 C539 198 623 255 694 486" />

          <g class="dao-gate">
            <path class="gate-outer" d="M396 56 C286 74 229 155 230 257 C231 367 303 445 396 468 C489 445 561 367 562 257 C563 155 506 74 396 56 Z" />
            <path class="gate-inner" d="M396 110 C318 124 277 183 278 260 C279 341 329 400 396 421 C463 400 513 341 514 260 C515 183 474 124 396 110 Z" />
          </g>

          <g class="dao-figure" filter="url(#dao-glow)">
            <path class="dao-body" d="M396 143 C338 174 316 247 344 306 C359 338 382 357 396 394 C410 357 433 338 448 306 C476 247 454 174 396 143 Z" />
            <circle class="dao-head" cx="396" cy="119" r="28" />
            <path class="bottle-sigil" d="M386 195 C386 178 406 178 406 195 L406 260 C406 291 386 291 386 260 Z" />
            <path class="bottle-neck" d="M381 181 C389 171 403 171 411 181" />
          </g>

          <g class="law-cracks">
            <path d="M397 7 L393 96 L407 184 L394 260 L409 350 L397 512" />
            <path d="M17 259 L162 252 L283 265 L396 260 L508 248 L743 261" />
            <path d="M141 77 L252 173 L351 236 L396 260 L489 322 L642 450" />
            <path d="M648 82 L535 172 L449 232 L396 260 L308 329 L133 448" />
          </g>

          <g class="dao-bolts">
            <path class="bolt-a" d="M552 12 L506 100 L546 100 L476 232" />
            <path class="bolt-b" d="M162 20 L218 127 L177 127 L257 263" />
            <path class="bolt-c" d="M687 171 L626 251 L666 258 L574 395" />
            <path class="bolt-d" d="M71 184 L141 247 L103 261 L194 366" />
          </g>
        </svg>

        <div class="dao-core"></div>
        <span v-for="beam in 30" :key="beam" class="dao-beam"></span>
      </div>

      <dl class="dao-scene__facts">
        <div v-for="fact in copy.facts" :key="fact[0]">
          <dt>{{ fact[0] }}</dt>
          <dd>{{ fact[1] }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.dao-scene {
  position: relative;
  overflow: hidden;
  margin: -18px 0 34px;
  border-block: 1px solid rgba(245, 208, 109, 0.24);
  background:
    radial-gradient(ellipse at 74% 50%, rgba(52, 180, 127, 0.22), transparent 32%),
    radial-gradient(ellipse at 50% 50%, rgba(178, 119, 255, 0.2), transparent 36%),
    linear-gradient(115deg, #030806 0%, #071523 43%, #17091d 100%);
  color: #fff8e7;
}

.dao-scene::before {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(90deg, rgba(127, 249, 223, 0.06) 0, rgba(127, 249, 223, 0.06) 1px, transparent 1px, transparent 38px),
    repeating-linear-gradient(0deg, rgba(245, 208, 109, 0.04) 0, rgba(245, 208, 109, 0.04) 1px, transparent 1px, transparent 32px);
  content: "";
  opacity: 0.82;
  pointer-events: none;
}

.dao-scene::after {
  position: absolute;
  inset: -20% -10%;
  background:
    conic-gradient(from 20deg at 72% 50%, transparent 0 14%, rgba(127, 249, 223, 0.2) 15% 17%, transparent 18% 44%, rgba(245, 208, 109, 0.18) 45% 47%, transparent 48% 100%);
  content: "";
  opacity: 0.48;
  transform-origin: 72% 50%;
  animation: daoAperture 18s linear infinite;
  pointer-events: none;
}

.dao-scene__stage {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(285px, 0.58fr) minmax(560px, 1.08fr);
  grid-template-areas:
    "copy visual"
    "facts visual";
  gap: 20px 42px;
  align-items: center;
  max-width: 1220px;
  min-height: 520px;
  margin: 0 auto;
  padding: 42px 24px;
}

.dao-scene__copy {
  grid-area: copy;
  max-width: 520px;
}

.dao-scene__kicker {
  margin: 0 0 10px;
  color: #7ff9df;
  font-size: 14px;
  font-weight: 900;
}

.dao-scene h2 {
  margin: 0;
  color: #fff8e7;
  font-size: 48px;
  line-height: 1.08;
  letter-spacing: 0;
  text-shadow: 0 0 24px rgba(245, 208, 109, 0.24);
}

.dao-scene__copy p:not(.dao-scene__kicker) {
  max-width: 500px;
  margin: 17px 0 0;
  color: rgba(255, 248, 231, 0.82);
  font-size: 16px;
  line-height: 1.78;
}

.dao-scene__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.dao-scene__actions a {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  border: 1px solid rgba(127, 249, 223, 0.42);
  border-radius: 8px;
  background: rgba(3, 8, 6, 0.58);
  color: #fff8e7;
  padding: 0 14px;
  font-size: 14px;
  font-weight: 900;
  text-decoration: none;
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}

.dao-scene__actions a:hover {
  border-color: #f5d06d;
  background: rgba(245, 208, 109, 0.16);
  transform: translateY(-1px);
}

.dao-scene__facts {
  grid-area: facts;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  max-width: 560px;
  margin: 4px 0 0;
}

.dao-scene__facts div {
  min-width: 0;
  border-top: 1px solid rgba(245, 208, 109, 0.32);
  padding-top: 11px;
}

.dao-scene__facts dt {
  color: rgba(255, 248, 231, 0.62);
  font-size: 12px;
  font-weight: 900;
}

.dao-scene__facts dd {
  margin: 3px 0 0;
  color: #fff8e7;
  font-size: 15px;
  font-weight: 900;
}

.dao-visual {
  position: relative;
  grid-area: visual;
  min-height: 452px;
  overflow: hidden;
}

.dao-visual__rift {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(104deg, transparent 0 44%, rgba(255, 248, 231, 0.14) 45%, rgba(127, 249, 223, 0.28) 46%, transparent 49%),
    linear-gradient(70deg, transparent 0 52%, rgba(255, 109, 135, 0.18) 53%, transparent 57%);
  filter: blur(0.2px);
  opacity: 0.8;
  animation: daoRift 5.4s ease-in-out infinite;
}

.dao-visual__skyfall {
  position: absolute;
  inset: 2% 0;
  background-image:
    linear-gradient(112deg, transparent 0 43%, rgba(127, 249, 223, 0.5) 45%, transparent 48%),
    linear-gradient(112deg, transparent 0 55%, rgba(245, 208, 109, 0.46) 56%, transparent 59%),
    linear-gradient(112deg, transparent 0 49%, rgba(178, 119, 255, 0.38) 50%, transparent 53%);
  background-size: 96px 186px, 151px 226px, 210px 270px;
  opacity: 0.5;
  animation: daoSkyfall 6.4s linear infinite;
}

.dao-visual__svg {
  position: absolute;
  inset: -2% -4% 0 -2%;
  width: 108%;
  height: 108%;
  overflow: visible;
}

.dao-back-rings {
  transform-origin: 396px 260px;
  animation: daoTurn 30s linear infinite;
}

.dao-ring {
  fill: none;
  stroke-linecap: round;
  transform-origin: 396px 260px;
}

.dao-ring-a {
  stroke: rgba(127, 249, 223, 0.64);
  stroke-width: 2;
  stroke-dasharray: 10 18;
  animation: daoDash 8s linear infinite;
}

.dao-ring-b {
  stroke: rgba(245, 208, 109, 0.8);
  stroke-width: 3;
  stroke-dasharray: 34 18;
  animation: daoDash 6.5s linear infinite reverse;
}

.dao-ring-c {
  stroke: rgba(255, 109, 135, 0.64);
  stroke-width: 3;
  stroke-dasharray: 7 12;
  animation: daoDash 5s linear infinite;
}

.dao-ring-d {
  stroke: rgba(127, 249, 223, 0.74);
  stroke-width: 4;
  stroke-dasharray: 56 20;
  transform: rotate(-10deg);
  animation: daoDash 4.8s linear infinite;
}

.dao-ring-e {
  stroke: rgba(178, 119, 255, 0.65);
  stroke-width: 3;
  stroke-dasharray: 22 18;
  transform: rotate(58deg);
  animation: daoDash 7.8s linear infinite reverse;
}

.heaven-splinters path {
  fill: rgba(255, 248, 231, 0.08);
  stroke: rgba(245, 208, 109, 0.28);
  stroke-width: 2;
  animation: daoSplinter 4.8s ease-in-out infinite;
}

.heaven-splinters path:nth-child(2n) {
  animation-delay: -1.8s;
}

.time-river {
  fill: none;
  stroke: url("#dao-stream");
  stroke-linecap: round;
  stroke-width: 5;
  stroke-dasharray: 84 28;
  filter: drop-shadow(0 0 10px rgba(127, 249, 223, 0.48));
  opacity: 0.86;
  animation: daoFlow 4.2s linear infinite;
}

.river-b {
  animation-duration: 5.3s;
  animation-direction: reverse;
}

.river-c {
  animation-duration: 6.2s;
  opacity: 0.62;
}

.river-d {
  animation-duration: 7s;
  opacity: 0.5;
}

.dao-gate path {
  fill: rgba(5, 22, 20, 0.22);
  stroke: rgba(245, 208, 109, 0.5);
  stroke-width: 3;
  stroke-dasharray: 18 16;
  animation: daoGate 8s linear infinite;
}

.gate-inner {
  stroke: rgba(127, 249, 223, 0.62);
  stroke-width: 2;
  animation-direction: reverse;
}

.dao-body {
  fill: url("#bottle-light");
  stroke: rgba(255, 248, 231, 0.8);
  stroke-width: 2;
  animation: daoAscend 4s ease-in-out infinite;
}

.dao-head {
  fill: rgba(255, 248, 231, 0.94);
  stroke: rgba(245, 208, 109, 0.86);
  stroke-width: 2;
  animation: daoAscend 4s ease-in-out infinite;
}

.bottle-sigil,
.bottle-neck {
  fill: none;
  stroke: rgba(3, 30, 24, 0.86);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 6;
}

.law-cracks path {
  fill: none;
  stroke: rgba(255, 248, 231, 0.2);
  stroke-width: 2;
  stroke-dasharray: 14 12;
  animation: daoCrack 4.6s linear infinite;
}

.dao-bolts path {
  fill: none;
  stroke: #fff6b8;
  stroke-linejoin: round;
  stroke-width: 5;
  opacity: 0;
  filter: drop-shadow(0 0 12px rgba(255, 246, 184, 0.88));
  animation: daoFlash 3.9s steps(1, end) infinite;
}

.bolt-b {
  animation-delay: 0.9s;
}

.bolt-c {
  animation-delay: 1.8s;
}

.bolt-d {
  animation-delay: 2.8s;
}

.dao-core {
  position: absolute;
  left: calc(52% - 126px);
  top: calc(50% - 126px);
  width: 252px;
  height: 252px;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(255, 255, 235, 0.95) 0 7%, rgba(127, 249, 223, 0.34) 17%, rgba(245, 208, 109, 0.22) 33%, rgba(178, 119, 255, 0.14) 48%, transparent 70%);
  mix-blend-mode: screen;
  pointer-events: none;
  animation: daoCore 2.6s ease-in-out infinite;
}

.dao-visual__runes {
  position: absolute;
  left: 52%;
  top: 50%;
  z-index: 2;
  width: 0;
  height: 0;
  animation: daoTurn 34s linear infinite reverse;
}

.dao-visual__runes span {
  position: absolute;
  left: -13px;
  top: -13px;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  color: rgba(255, 248, 231, 0.88);
  font-size: 15px;
  font-weight: 900;
  text-shadow: 0 0 10px rgba(127, 249, 223, 0.85);
  animation: daoRune 2.8s ease-in-out infinite;
}

.dao-beam {
  position: absolute;
  left: 52%;
  top: 50%;
  width: 5px;
  height: 74px;
  border-radius: 999px;
  background: linear-gradient(180deg, transparent, rgba(127, 249, 223, 0.92), rgba(245, 208, 109, 0.72), transparent);
  opacity: 0;
  transform-origin: center 216px;
  animation: daoBeam 3.2s ease-out infinite;
}

.dao-beam:nth-of-type(1) { transform: rotate(0deg) translateY(-196px); animation-delay: -0.1s; }
.dao-beam:nth-of-type(2) { transform: rotate(12deg) translateY(-216px); animation-delay: -1.1s; }
.dao-beam:nth-of-type(3) { transform: rotate(24deg) translateY(-184px); animation-delay: -2.1s; }
.dao-beam:nth-of-type(4) { transform: rotate(36deg) translateY(-226px); animation-delay: -0.6s; }
.dao-beam:nth-of-type(5) { transform: rotate(48deg) translateY(-194px); animation-delay: -1.6s; }
.dao-beam:nth-of-type(6) { transform: rotate(60deg) translateY(-232px); animation-delay: -2.6s; }
.dao-beam:nth-of-type(7) { transform: rotate(72deg) translateY(-202px); animation-delay: -0.3s; }
.dao-beam:nth-of-type(8) { transform: rotate(84deg) translateY(-220px); animation-delay: -1.3s; }
.dao-beam:nth-of-type(9) { transform: rotate(96deg) translateY(-190px); animation-delay: -2.3s; }
.dao-beam:nth-of-type(10) { transform: rotate(108deg) translateY(-230px); animation-delay: -0.9s; }
.dao-beam:nth-of-type(11) { transform: rotate(120deg) translateY(-198px); animation-delay: -1.9s; }
.dao-beam:nth-of-type(12) { transform: rotate(132deg) translateY(-218px); animation-delay: -2.9s; }
.dao-beam:nth-of-type(13) { transform: rotate(144deg) translateY(-188px); animation-delay: -0.5s; }
.dao-beam:nth-of-type(14) { transform: rotate(156deg) translateY(-226px); animation-delay: -1.5s; }
.dao-beam:nth-of-type(15) { transform: rotate(168deg) translateY(-204px); animation-delay: -2.5s; }
.dao-beam:nth-of-type(16) { transform: rotate(180deg) translateY(-236px); animation-delay: -0.8s; }
.dao-beam:nth-of-type(17) { transform: rotate(192deg) translateY(-196px); animation-delay: -1.8s; }
.dao-beam:nth-of-type(18) { transform: rotate(204deg) translateY(-222px); animation-delay: -2.8s; }
.dao-beam:nth-of-type(19) { transform: rotate(216deg) translateY(-184px); animation-delay: -0.2s; }
.dao-beam:nth-of-type(20) { transform: rotate(228deg) translateY(-230px); animation-delay: -1.2s; }
.dao-beam:nth-of-type(21) { transform: rotate(240deg) translateY(-200px); animation-delay: -2.2s; }
.dao-beam:nth-of-type(22) { transform: rotate(252deg) translateY(-218px); animation-delay: -0.7s; }
.dao-beam:nth-of-type(23) { transform: rotate(264deg) translateY(-192px); animation-delay: -1.7s; }
.dao-beam:nth-of-type(24) { transform: rotate(276deg) translateY(-234px); animation-delay: -2.7s; }
.dao-beam:nth-of-type(25) { transform: rotate(288deg) translateY(-202px); animation-delay: -0.4s; }
.dao-beam:nth-of-type(26) { transform: rotate(300deg) translateY(-226px); animation-delay: -1.4s; }
.dao-beam:nth-of-type(27) { transform: rotate(312deg) translateY(-188px); animation-delay: -2.4s; }
.dao-beam:nth-of-type(28) { transform: rotate(324deg) translateY(-216px); animation-delay: -0.9s; }
.dao-beam:nth-of-type(29) { transform: rotate(336deg) translateY(-198px); animation-delay: -1.9s; }
.dao-beam:nth-of-type(30) { transform: rotate(348deg) translateY(-238px); animation-delay: -2.9s; }

@keyframes daoAperture {
  to {
    transform: rotate(360deg);
  }
}

@keyframes daoTurn {
  to {
    transform: rotate(360deg);
  }
}

@keyframes daoDash {
  to {
    stroke-dashoffset: -220;
  }
}

@keyframes daoFlow {
  to {
    stroke-dashoffset: -224;
  }
}

@keyframes daoGate {
  50% {
    stroke: rgba(127, 249, 223, 0.78);
  }
  to {
    stroke-dashoffset: -190;
  }
}

@keyframes daoCrack {
  50% {
    stroke: rgba(255, 248, 231, 0.42);
  }
  to {
    stroke-dashoffset: -136;
  }
}

@keyframes daoFlash {
  0%, 68%, 100% {
    opacity: 0;
  }
  69%, 74% {
    opacity: 0.96;
  }
  75% {
    opacity: 0.18;
  }
}

@keyframes daoCore {
  50% {
    opacity: 0.72;
    transform: scale(1.18);
  }
}

@keyframes daoAscend {
  50% {
    transform: translateY(-10px);
  }
}

@keyframes daoRift {
  50% {
    opacity: 1;
    transform: skewX(-4deg) scale(1.04);
  }
}

@keyframes daoSkyfall {
  to {
    background-position: 96px 186px, 151px 226px, 210px 270px;
  }
}

@keyframes daoSplinter {
  50% {
    opacity: 0.72;
    transform: translateY(-8px);
  }
}

@keyframes daoRune {
  50% {
    color: #7ff9df;
    transform: translateY(-5px) scale(1.12);
  }
}

@keyframes daoBeam {
  0% {
    opacity: 0;
  }
  18% {
    opacity: 0.95;
  }
  100% {
    opacity: 0;
  }
}

@media (max-width: 1020px) {
  .dao-scene__stage {
    grid-template-columns: 1fr;
    grid-template-areas:
      "copy"
      "visual"
      "facts";
    min-height: 0;
    padding: 34px 24px 30px;
  }

  .dao-scene__copy,
  .dao-scene__copy p:not(.dao-scene__kicker) {
    max-width: 760px;
  }

  .dao-visual {
    min-height: 390px;
  }
}

@media (max-width: 640px) {
  .dao-scene {
    margin-top: -8px;
  }

  .dao-scene__stage {
    padding: 28px 18px;
  }

  .dao-scene h2 {
    font-size: 32px;
    line-height: 1.16;
  }

  .dao-scene__copy p:not(.dao-scene__kicker) {
    font-size: 15px;
    line-height: 1.65;
  }

  .dao-scene__actions a {
    flex: 1 1 100%;
    justify-content: center;
    width: 100%;
  }

  .dao-scene__facts {
    grid-template-columns: 1fr;
  }

  .dao-visual {
    min-height: 300px;
  }

  .dao-visual__runes,
  .dao-beam {
    transform: scale(0.82);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dao-scene *,
  .dao-scene *::before,
  .dao-scene *::after {
    animation: none !important;
    transition: none !important;
  }

  .dao-bolts path {
    opacity: 0.25;
  }

  .dao-beam {
    opacity: 0.32;
  }
}
</style>
