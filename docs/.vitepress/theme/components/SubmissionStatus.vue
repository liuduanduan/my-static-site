<script setup lang="ts">
import { ref } from 'vue'
import type { PublicSubmissionStatus } from '../../../../shared/submissions/contracts'
import { querySubmissionStatus } from './submissionStatusClient'

const code = ref('')
const loading = ref(false)
const error = ref('')
const result = ref<PublicSubmissionStatus>()

async function queryStatus() {
  if (!/^[A-Za-z0-9_-]{22}$/.test(code.value.trim())) {
    error.value = '请输入提交成功后获得的 22 位查询码。'
    result.value = undefined
    return
  }
  loading.value = true
  error.value = ''
  try {
    result.value = await querySubmissionStatus(code.value.trim())
  } catch (caught) {
    result.value = undefined
    error.value = caught instanceof Error ? caught.message : '暂时无法查询，请稍后再试。'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="status-panel" aria-labelledby="status-query-title">
    <p class="platform-kicker">PRIVATE STATUS</p>
    <h2 id="status-query-title">查询审核状态</h2>
    <p>查询码只在你的浏览器与本站 API 之间传输，不会写入网址。</p>
    <form class="status-query" @submit.prevent="queryStatus">
      <label for="submission-code">私密查询码</label>
      <div>
        <input id="submission-code" v-model="code" type="password" autocomplete="off" spellcheck="false" inputmode="text" />
        <button type="submit" :disabled="loading">{{ loading ? '查询中…' : '查询' }}</button>
      </div>
    </form>
    <p class="submission-status" aria-live="polite">{{ error }}</p>
    <article v-if="result" class="status-result" :data-status="result.status">
      <span>{{ result.status }}</span>
      <h3>{{ result.message }}</h3>
      <a v-if="result.prUrl" :href="result.prUrl" target="_blank" rel="noopener noreferrer">查看公开审核 PR →</a>
      <time v-if="result.publishedAt" :datetime="result.publishedAt">发布时间：{{ result.publishedAt.slice(0, 10) }}</time>
    </article>
  </section>
</template>
