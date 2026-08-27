<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  createSubmissionFormState,
  submitToolSubmission
} from './submissionFormState'

declare global {
  interface Window {
    turnstile?: {
      render(element: HTMLElement, options: Record<string, unknown>): string
      reset(widgetId: string): void
      remove(widgetId: string): void
    }
  }
}

const form = reactive(createSubmissionFormState())
const submitting = ref(false)
const message = ref('')
const publicCode = ref('')
const turnstileHost = ref<HTMLElement>()
const widgetId = ref('')
const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
const serviceConfigured = Boolean(siteKey)
const commercialIntent = computed(() => form.intent === 'commercial_interest')

const intentChoices = [
  { value: 'standard', label: '普通收录（免费）' },
  { value: 'priority_interest', label: '希望了解加急审核' },
  { value: 'commercial_interest', label: '希望了解商业合作' }
] as const

function lineCount(value: string): number {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).length
}

function validateForm(): string {
  if (lineCount(form.bestForText) !== 3) return '请填写恰好 3 个使用场景，每行一个。'
  if (lineCount(form.featuresText) !== 3) return '请填写恰好 3 个核心能力，每行一个。'
  if (!form.acceptedTerms) return '请先同意隐私说明与“提交不保证收录”。'
  if (!form.turnstileToken) return '请完成人机验证。'
  return ''
}

async function handleSubmit() {
  message.value = validateForm()
  if (message.value || submitting.value) return
  submitting.value = true
  publicCode.value = ''
  const result = await submitToolSubmission(form)
  submitting.value = false
  if (result.ok) {
    publicCode.value = result.code
    message.value = '申请已进入审核队列。请立即保存下方查询码；本站不会再次显示它。'
  } else {
    message.value = result.message
  }
  if (widgetId.value) window.turnstile?.reset(widgetId.value)
}

function preselectIntent() {
  const value = new URLSearchParams(window.location.search).get('intent')
  if (value === 'standard' || value === 'priority_interest' || value === 'commercial_interest') {
    form.intent = value
  }
}

function renderTurnstile() {
  if (!siteKey || !turnstileHost.value || !window.turnstile || widgetId.value) return
  widgetId.value = window.turnstile.render(turnstileHost.value, {
    sitekey: siteKey,
    callback: (token: string) => {
      form.turnstileToken = token
    },
    'expired-callback': () => {
      form.turnstileToken = ''
    },
    'error-callback': () => {
      form.turnstileToken = ''
      message.value = '人机验证暂时不可用，请稍后重试。'
    }
  })
}

onMounted(async () => {
  preselectIntent()
  if (!siteKey) return
  if (!document.querySelector('script[data-xunqi-turnstile]')) {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.dataset.xunqiTurnstile = 'true'
    script.addEventListener('load', renderTurnstile, { once: true })
    document.head.append(script)
  }
  await nextTick()
  renderTurnstile()
})

onBeforeUnmount(() => {
  if (widgetId.value) window.turnstile?.remove(widgetId.value)
})
</script>

<template>
  <section class="submission-panel" aria-labelledby="submission-form-title">
    <header class="submission-panel__heading">
      <p class="platform-kicker">SUBMIT A TOOL</p>
      <h2 id="submission-form-title">提交一个值得被找到的工具</h2>
      <p>填写产品事实即可。我们会核对官网、整理草稿，并由人工决定是否收录。</p>
    </header>

    <div v-if="!serviceConfigured" class="submission-notice" role="status">
      提交服务尚未配置，请稍后再试。现有工具目录不受影响。
    </div>

    <form class="submission-form" @submit.prevent="handleSubmit" novalidate>
      <div class="submission-grid">
        <div class="submission-field">
          <label for="submission-name">工具名称 <span>必填</span></label>
          <input id="submission-name" v-model="form.name" name="name" required maxlength="80" aria-describedby="submission-name-help submission-name-error" />
          <small id="submission-name-help">使用官网显示的正式名称。</small>
          <small id="submission-name-error" class="field-error"></small>
        </div>
        <div class="submission-field">
          <label for="submission-url">官方 HTTPS 地址 <span>必填</span></label>
          <input id="submission-url" v-model="form.officialUrl" name="officialUrl" type="url" inputmode="url" required placeholder="https://" />
        </div>
        <div class="submission-field submission-field--wide">
          <label for="submission-tagline">一句话介绍 <span>必填</span></label>
          <input id="submission-tagline" v-model="form.tagline" name="tagline" required maxlength="120" />
        </div>
        <div class="submission-field submission-field--wide">
          <label for="submission-description">更完整的产品介绍 <span>选填</span></label>
          <textarea id="submission-description" v-model="form.description" name="description" rows="4" maxlength="1500"></textarea>
        </div>
        <div class="submission-field">
          <label for="submission-category">主要分类 <span>必填</span></label>
          <select id="submission-category" v-model="form.category" required>
            <option value="" disabled>请选择</option>
            <option value="chat">对话与模型</option><option value="writing">写作与办公</option>
            <option value="image">图像与设计</option><option value="video">视频与数字人</option>
            <option value="coding">编程与建站</option><option value="audio">音频与音乐</option>
            <option value="research">搜索与研究</option><option value="marketing">营销与社媒</option>
            <option value="automation">自动化与数据</option>
          </select>
        </div>
        <div class="submission-field">
          <label for="submission-pricing">价格模式 <span>必填</span></label>
          <select id="submission-pricing" v-model="form.pricingMode" required>
            <option value="" disabled>请选择</option><option value="free">免费</option>
            <option value="freemium">免费增值</option><option value="paid">付费</option>
            <option value="contact">联系询价</option>
          </select>
        </div>
        <div class="submission-field">
          <label for="submission-best-for">3 个具体使用场景 <span>必填</span></label>
          <textarea id="submission-best-for" v-model="form.bestForText" rows="4" required placeholder="每行一个，恰好三行"></textarea>
        </div>
        <div class="submission-field">
          <label for="submission-features">3 个核心能力 <span>必填</span></label>
          <textarea id="submission-features" v-model="form.featuresText" rows="4" required placeholder="每行一个，恰好三行"></textarea>
        </div>
        <div class="submission-field">
          <label for="submission-chinese">中文支持 <span>必填</span></label>
          <select id="submission-chinese" v-model="form.chineseSupport" required>
            <option value="" disabled>请选择</option><option value="native">原生中文</option>
            <option value="partial">部分支持</option><option value="none">暂不支持</option>
          </select>
        </div>
        <fieldset class="submission-field submission-field--checks">
          <legend>使用平台 <span>选填</span></legend>
          <label v-for="mode in ['web','desktop','mobile','api','extension']" :key="mode">
            <input v-model="form.accessModes" type="checkbox" :value="mode" />
            {{ { web: '网页', desktop: '桌面端', mobile: '移动端', api: 'API', extension: '浏览器扩展' }[mode] }}
          </label>
        </fieldset>
        <div class="submission-field">
          <label for="submission-pros">2 个优点 <span>选填</span></label>
          <textarea id="submission-pros" v-model="form.prosText" rows="3" placeholder="每行一个"></textarea>
        </div>
        <div class="submission-field">
          <label for="submission-cons">2 个限制 <span>选填</span></label>
          <textarea id="submission-cons" v-model="form.consText" rows="3" placeholder="每行一个"></textarea>
        </div>
        <div class="submission-field submission-field--wide">
          <label for="submission-logo">官方 Logo / 品牌素材 HTTPS 地址 <span>选填</span></label>
          <input id="submission-logo" v-model="form.logoUrl" type="url" inputmode="url" placeholder="只接受官方素材 URL，不上传文件" />
        </div>
        <div class="submission-field">
          <label for="submission-email">联系邮箱 <span>必填 · 不公开</span></label>
          <input id="submission-email" v-model="form.contactEmail" type="email" autocomplete="email" required />
        </div>
        <div class="submission-field">
          <label for="submission-relationship">你与工具的关系 <span>必填</span></label>
          <select id="submission-relationship" v-model="form.submitterRelationship" required>
            <option value="" disabled>请选择</option><option value="founder">创始团队</option>
            <option value="user">用户</option><option value="partner">代理 / 合作方</option>
            <option value="other">其他</option>
          </select>
        </div>
        <fieldset class="submission-field submission-field--wide submission-intents">
          <legend>提交意向 <span>必填</span></legend>
          <label v-for="choice in intentChoices" :key="choice.value">
            <input v-model="form.intent" type="radio" name="intent" :value="choice.value" />
            <strong>{{ choice.label }}</strong>
          </label>
          <small>加急只影响处理时间，不影响收录判断；本页不收费。</small>
        </fieldset>
        <div v-if="commercialIntent" class="submission-field submission-field--wide">
          <label for="submission-commercial-note">合作说明 <span>选填 · 不公开</span></label>
          <textarea id="submission-commercial-note" v-model="form.commercialNote" rows="3" maxlength="1000"></textarea>
        </div>
      </div>

      <div class="submission-honeypot" aria-hidden="true">
        <label for="submission-website">Website</label>
        <input id="submission-website" v-model="form.website" name="website" tabindex="-1" autocomplete="off" />
      </div>

      <div ref="turnstileHost" class="submission-turnstile" aria-label="人机验证"></div>
      <label class="submission-terms">
        <input v-model="form.acceptedTerms" type="checkbox" required />
        <span>我已阅读<a href="/privacy">隐私说明</a>，并理解提交不保证收录。</span>
      </label>

      <button class="submission-submit" type="submit" :disabled="!serviceConfigured || submitting">
        {{ submitting ? '正在提交…' : '提交审核' }}
      </button>
      <p class="submission-status" aria-live="polite">{{ message }}</p>

      <div v-if="publicCode" class="submission-success" role="status">
        <span>你的私密查询码</span>
        <code>{{ publicCode }}</code>
        <a href="/submit/status">查询审核状态 →</a>
      </div>
    </form>
  </section>
</template>
