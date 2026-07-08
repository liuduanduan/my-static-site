<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const isEn = computed(() => route.path.startsWith('/en/'))
</script>

<template>
  <a
    class="nascent-hero-image"
    :href="isEn ? '/en/rmji/timeline/nascent-soul-breakthrough-thread' : '/rmji/timeline/nascent-soul-breakthrough-thread'"
    :aria-label="isEn ? 'Han Li Nascent Soul breakthrough thread' : '韩立结婴突破线'"
  >
    <svg class="nascent-hero-image__svg" viewBox="0 0 360 360" focusable="false" aria-hidden="true">
      <defs>
        <filter id="hero-soul-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="hero-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#8ef7df" />
          <stop offset="52%" stop-color="#f2c75a" />
          <stop offset="100%" stop-color="#d66b70" />
        </linearGradient>
      </defs>

      <circle class="hero-field field-a" cx="180" cy="180" r="142" />
      <circle class="hero-field field-b" cx="180" cy="180" r="108" />
      <ellipse class="hero-ring ring-a" cx="180" cy="180" rx="142" ry="42" />
      <ellipse class="hero-ring ring-b" cx="180" cy="180" rx="98" ry="132" />
      <ellipse class="hero-ring ring-c" cx="180" cy="180" rx="154" ry="78" />

      <path class="hero-stream stream-a" d="M36 205 C91 104 142 139 180 180 C227 231 269 206 326 82" />
      <path class="hero-stream stream-b" d="M50 114 C97 187 145 193 184 171 C245 137 291 176 326 260" />
      <path class="hero-stream stream-c" d="M58 276 C112 221 158 219 196 240 C240 264 283 260 326 217" />

      <g class="hero-seal">
        <path d="M180 44 L219 143 L326 151 L241 213 L266 316 L180 258 L94 316 L119 213 L34 151 L141 143 Z" />
        <path d="M96 88 L264 272" />
        <path d="M264 88 L96 272" />
      </g>

      <g class="hero-lightning">
        <path d="M261 18 L228 84 L254 84 L210 164" />
        <path d="M82 54 L118 120 L93 120 L144 202" />
        <path d="M317 138 L285 184 L308 186 L266 252" />
      </g>

      <g class="hero-soul" filter="url(#hero-soul-glow)">
        <circle class="hero-soul__halo" cx="180" cy="180" r="58" />
        <path class="hero-soul__body" d="M180 143 C148 146 133 172 143 202 C151 226 169 239 180 262 C191 239 209 226 217 202 C227 172 212 146 180 143 Z" />
        <circle class="hero-soul__head" cx="180" cy="125" r="22" />
      </g>
    </svg>

    <span class="nascent-hero-image__label">
      <strong>{{ isEn ? 'Nascent Soul' : '韩立结婴' }}</strong>
      <span>{{ isEn ? 'about age 217' : '约217岁' }}</span>
    </span>
  </a>
</template>

<style scoped>
.nascent-hero-image {
  position: absolute;
  inset: 50% auto auto 50%;
  display: grid;
  place-items: center;
  width: min(340px, 92vw);
  aspect-ratio: 1;
  overflow: hidden;
  border: 1px solid rgba(242, 199, 90, 0.28);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(7, 22, 17, 0.95), rgba(16, 36, 57, 0.95) 48%, rgba(36, 19, 32, 0.95)),
    #071611;
  box-shadow: 0 20px 60px rgba(16, 34, 28, 0.24);
  color: #f7efe0;
  text-decoration: none;
  transform: translate(-50%, -50%);
}

.nascent-hero-image::before {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(90deg, rgba(142, 247, 223, 0.06) 0, rgba(142, 247, 223, 0.06) 1px, transparent 1px, transparent 34px),
    repeating-linear-gradient(0deg, rgba(242, 199, 90, 0.04) 0, rgba(242, 199, 90, 0.04) 1px, transparent 1px, transparent 30px);
  content: "";
}

.nascent-hero-image__svg {
  position: relative;
  width: 100%;
  height: 100%;
}

.hero-field {
  fill: none;
  stroke-width: 1.5;
  transform-origin: 180px 180px;
}

.field-a {
  stroke: rgba(142, 247, 223, 0.2);
  stroke-dasharray: 5 12;
  animation: heroTurn 34s linear infinite;
}

.field-b {
  stroke: rgba(242, 199, 90, 0.22);
  stroke-dasharray: 18 16;
  animation: heroTurn 24s linear infinite reverse;
}

.hero-ring {
  fill: none;
  stroke-linecap: round;
  stroke-width: 3;
  transform-origin: 180px 180px;
}

.ring-a {
  stroke: rgba(142, 247, 223, 0.82);
  stroke-dasharray: 28 14;
  animation: heroDash 5s linear infinite;
}

.ring-b {
  stroke: rgba(242, 199, 90, 0.86);
  stroke-dasharray: 14 12;
  transform: rotate(58deg);
  animation: heroDash 6.2s linear infinite reverse;
}

.ring-c {
  stroke: rgba(214, 107, 112, 0.6);
  stroke-dasharray: 7 14;
  transform: rotate(-18deg);
  animation: heroDash 7.5s linear infinite;
}

.hero-stream {
  fill: none;
  stroke: url("#hero-stroke");
  stroke-linecap: round;
  stroke-width: 4;
  stroke-dasharray: 54 24;
  filter: drop-shadow(0 0 8px rgba(142, 247, 223, 0.45));
  opacity: 0.84;
  animation: heroFlow 4.2s linear infinite;
}

.stream-b {
  animation-direction: reverse;
  animation-duration: 5s;
}

.stream-c {
  animation-duration: 5.8s;
  opacity: 0.62;
}

.hero-seal path {
  fill: none;
  stroke: rgba(247, 239, 224, 0.2);
  stroke-width: 2;
  stroke-dasharray: 10 10;
  animation: heroSeal 8s linear infinite;
}

.hero-lightning path {
  fill: none;
  stroke: #f4efb7;
  stroke-linejoin: round;
  stroke-width: 4;
  opacity: 0;
  filter: drop-shadow(0 0 8px rgba(244, 239, 183, 0.72));
  animation: heroFlash 4.2s steps(1, end) infinite;
}

.hero-lightning path:nth-child(2) {
  animation-delay: 1.2s;
}

.hero-lightning path:nth-child(3) {
  animation-delay: 2.4s;
}

.hero-soul__halo {
  fill: rgba(142, 247, 223, 0.12);
  stroke: rgba(242, 199, 90, 0.7);
  stroke-width: 2;
  animation: heroPulse 3s ease-in-out infinite;
}

.hero-soul__body,
.hero-soul__head {
  fill: rgba(247, 239, 224, 0.92);
  stroke: rgba(142, 247, 223, 0.8);
  stroke-width: 2;
  animation: heroFloat 4s ease-in-out infinite;
}

.hero-soul__head {
  stroke: rgba(242, 199, 90, 0.8);
}

.nascent-hero-image__label {
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: grid;
  gap: 2px;
  border: 1px solid rgba(142, 247, 223, 0.28);
  border-radius: 8px;
  background: rgba(5, 14, 13, 0.7);
  padding: 9px 11px;
  text-align: right;
}

.nascent-hero-image__label strong {
  color: #fff7df;
  font-size: 14px;
  line-height: 1.1;
}

.nascent-hero-image__label span {
  color: rgba(247, 239, 224, 0.72);
  font-size: 12px;
  font-weight: 800;
}

@keyframes heroTurn {
  to {
    transform: rotate(360deg);
  }
}

@keyframes heroDash {
  to {
    stroke-dashoffset: -160;
  }
}

@keyframes heroFlow {
  to {
    stroke-dashoffset: -156;
  }
}

@keyframes heroSeal {
  50% {
    stroke: rgba(242, 199, 90, 0.34);
  }
  to {
    stroke-dashoffset: -120;
  }
}

@keyframes heroFlash {
  0%, 76%, 100% {
    opacity: 0;
  }
  77%, 81% {
    opacity: 0.95;
  }
  82% {
    opacity: 0.18;
  }
}

@keyframes heroPulse {
  50% {
    r: 68;
    stroke: rgba(142, 247, 223, 0.9);
  }
}

@keyframes heroFloat {
  50% {
    transform: translateY(-7px);
  }
}

@media (max-width: 640px) {
  .nascent-hero-image {
    width: min(300px, 88vw);
  }
}

@media (prefers-reduced-motion: reduce) {
  .nascent-hero-image *,
  .nascent-hero-image *::before,
  .nascent-hero-image *::after {
    animation: none !important;
    transition: none !important;
  }

  .hero-lightning path {
    opacity: 0.25;
  }
}
</style>
