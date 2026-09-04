import { createHash } from 'node:crypto'
import {
  appendCatalogTools as appendCatalogToolsToCatalog,
  dateOnly,
  loadCatalog
} from '../catalog/catalogMutation.mjs'
import { candidateKey, parseDiscoveryConfig } from './contracts.mjs'
import { buildDiscoveredTool } from './discoveryEnricher.mjs'
import {
  catalogDiscoveryIndex,
  compareCandidatesForEnrichment,
  evaluateCandidate,
  scoreCandidate,
  selectDiscoveryAlternatives,
  validateCandidateForDiscovery
} from './qualityGate.mjs'
import { discoverFromSources as discoverFromConfiguredSources } from './sources.mjs'
import { parseDiscoveryState, recordOutcome, shouldCoolDown } from './state.mjs'
import { safeFetchOfficialPage } from '../submissions/safeOfficialFetch.mjs'

const CANDIDATE_ERROR_CODES = new Set([
  'official_fetch_rejected',
  'official_fetch_failed',
  'duplicate_catalog_entry',
  'insufficient_official_evidence',
  'non_product_page',
  'prohibited_candidate',
  'discovery_enricher_invalid_output',
  'discovery_enricher_failed',
  'enricher_unconfigured',
  'catalog_maximum_reached',
  'publish_limit_reached'
])
const CATALOG_DETAIL_ORIGIN = 'https://no996noicu.com'
const CATALOG_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const OFFICIAL_FETCH_BACKOFF_MILLISECONDS = Object.freeze([250, 500])
const REVIEW_GUIDANCE = Object.freeze({
  official_fetch_rejected: Object.freeze({
    explanation: '官网请求被安全策略拒绝。',
    suggestedAction: '确认公开 HTTPS 官网未指向受限网络，并重新提交候选。'
  }),
  official_fetch_failed: Object.freeze({
    explanation: '官网在三次受限请求后仍不可用。',
    suggestedAction: '检查官网可用性与证书，恢复后重新运行发现任务。'
  }),
  duplicate_catalog_entry: Object.freeze({
    explanation: '候选与现有目录使用同一注册域名、名称、地址或标识。',
    suggestedAction: '核对现有条目；仅在确认独立产品后人工处理。'
  }),
  insufficient_official_evidence: Object.freeze({
    explanation: '官网证据不足、身份不一致或无法支持候选文案。',
    suggestedAction: '核对产品身份并补充可公开验证的官网证据。'
  }),
  non_product_page: Object.freeze({
    explanation: '官网页面未表现为可收录的 AI 产品页面。',
    suggestedAction: '确认落地页正确且已公开产品信息后重新提交。'
  }),
  prohibited_candidate: Object.freeze({
    explanation: '候选或草稿触发目录禁止内容规则。',
    suggestedAction: '人工核对用途与文案；禁止内容不得收录。'
  }),
  discovery_enricher_invalid_output: Object.freeze({
    explanation: '内容补全结果未通过严格结构或证据校验。',
    suggestedAction: '核对官网证据与字段约束后重新生成草稿。'
  }),
  discovery_enricher_failed: Object.freeze({
    explanation: '内容补全服务在有限重试后失败。',
    suggestedAction: '检查补全服务状态，恢复后重新运行发现任务。'
  }),
  enricher_unconfigured: Object.freeze({
    explanation: '内容补全服务尚未配置，本次候选已延期。',
    suggestedAction: '配置补全服务后重新运行；不要手工绕过质量门槛。'
  }),
  catalog_maximum_reached: Object.freeze({
    explanation: '公开目录已达到配置的容量上限，本次候选已延期。',
    suggestedAction: '评估目录容量策略后重新运行，不要删除候选状态。'
  }),
  publish_limit_reached: Object.freeze({
    explanation: '本次发布名额已用完，候选留待后续运行。',
    suggestedAction: '等待下一次计划任务，无需修改候选。'
  })
})
const REVIEW_NAME_REPLACEMENTS = Object.freeze({
  '@': '＠', '`': '｀', '[': '［', ']': '］', '(': '（', ')': '）',
  '<': '＜', '>': '＞', '#': '＃', '*': '＊', '_': '＿', '!': '！',
  '|': '｜', ':': '：', '/': '／', '\\': '＼'
})

function frozenList(values) {
  return Object.freeze(values.map((value) => Object.freeze({ ...value })))
}

function candidateFingerprint(candidate) {
  return createHash('sha256')
    .update(JSON.stringify({
      name: candidate.name,
      url: candidate.url,
      sourceId: candidate.sourceId,
      sourceKind: candidate.sourceKind,
      sourceScore: candidate.sourceScore
    }))
    .digest('hex')
}

function knownCandidateError(error) {
  return CANDIDATE_ERROR_CODES.has(error?.code) ? error.code : null
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds))
}

async function fetchOfficialPageWithRetry(url, fetchOfficialPage, sleep) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await fetchOfficialPage(url)
    } catch (error) {
      const backoff = OFFICIAL_FETCH_BACKOFF_MILLISECONDS[attempt]
      if (error?.code !== 'official_fetch_failed' || backoff === undefined) throw error
      await sleep(backoff)
    }
  }
}

function reviewItem(candidate, errorCode) {
  const guidance = REVIEW_GUIDANCE[errorCode]
  if (!guidance) throw new Error('invalid_discovery_review_code')
  const sanitizedName = Array.from(String(candidate.name).normalize('NFKC')
    .replace(/[\p{Cc}\p{Cf}\p{Default_Ignorable_Code_Point}]/gu, ' ')
    .replace(/\b(?:https?:\/\/|www\.)\S+/giu, ' ')
    .replace(/[@`\[\]()<>#*_!|:/\\]/gu, (character) => REVIEW_NAME_REPLACEMENTS[character])
    .replace(/\s+/gu, ' ')
    .trim()).slice(0, 120).join('')
  const name = sanitizedName || '未命名候选'
  const officialUrl = new URL(candidate.url)
  officialUrl.search = ''
  officialUrl.hash = ''
  return Object.freeze({
    key: candidateKey(candidate),
    sourceId: candidate.sourceId,
    errorCode,
    name,
    officialUrl: officialUrl.toString(),
    explanation: guidance.explanation,
    suggestedAction: guidance.suggestedAction
  })
}

function recordFailed(state, candidate, errorCode, processedAt) {
  return recordOutcome(state, {
    key: candidateKey(candidate),
    status: 'failed',
    errorCode,
    processedAt,
    fingerprint: candidateFingerprint(candidate)
  })
}

function recordTerminal(state, candidate, status, processedAt) {
  return recordOutcome(state, {
    key: candidateKey(candidate),
    status,
    errorCode: null,
    processedAt,
    fingerprint: candidateFingerprint(candidate)
  })
}

function hasPublishedOutcome(state, key) {
  return state.outcomes.some((outcome) => outcome.key === key && outcome.status === 'published')
}

function dedupeAndSort(candidates, catalogIndex, state, now) {
  const unique = new Map()
  const catalogDuplicates = new Map()
  for (const candidate of candidates) {
    validateCandidateForDiscovery(candidate)
    const key = candidateKey(candidate)
    if (hasPublishedOutcome(state, key) || shouldCoolDown(state, key, now)) continue
    if (catalogIndex.domains.includes(key)) {
      const existingDuplicate = catalogDuplicates.get(key)
      if (!existingDuplicate || compareCandidatesForEnrichment(candidate, existingDuplicate) < 0) {
        catalogDuplicates.set(key, candidate)
      }
      continue
    }
    const existing = unique.get(key)
    if (!existing || compareCandidatesForEnrichment(candidate, existing) < 0) unique.set(key, candidate)
  }
  return Object.freeze({
    candidates: Object.freeze([...unique.values()].sort(compareCandidatesForEnrichment)),
    catalogDuplicates: Object.freeze([...catalogDuplicates.values()].sort(compareCandidatesForEnrichment))
  })
}

function publishedItem(candidate, tool, evidence, score) {
  return Object.freeze({
    slug: tool.slug,
    name: tool.name,
    officialUrl: evidence.selectedOfficialUrl,
    sourceId: candidate.sourceId,
    gateScore: score
  })
}

function catalogDetailUrl(slug) {
  if (typeof slug !== 'string' || !CATALOG_SLUG.test(slug)) {
    throw new Error('invalid_discovery_slug')
  }
  return `${CATALOG_DETAIL_ORIGIN}/tools/${slug}`
}

/**
 * Runs one bounded, deterministic discovery pass. Dependencies are injectable
 * for tests; production defaults always use the safe official-page fetcher.
 */
export async function runDiscovery(options) {
  const config = parseDiscoveryConfig(options?.config)
  const nowValue = typeof options?.now === 'function' ? options.now() : new Date()
  if (!(nowValue instanceof Date) || Number.isNaN(nowValue.valueOf())) throw new Error('invalid_discovery_now')
  const processedAt = nowValue.toISOString()
  const dryRun = options?.dryRun === true
  const deps = {
    discoverFromSources: options?.discoverFromSources ?? discoverFromConfiguredSources,
    fetchOfficialPage: options?.fetchOfficialPage ?? safeFetchOfficialPage,
    enricher: options?.enricher ?? null,
    appendCatalogTools: options?.appendCatalogTools ?? appendCatalogToolsToCatalog,
    fetch: options?.fetch ?? globalThis.fetch,
    githubToken: options?.githubToken,
    sleep: options?.sleep ?? delay,
    now: () => nowValue
  }
  const context = loadCatalog({ projectRoot: options?.projectRoot, catalogPath: options?.catalogPath })
  let nextState = parseDiscoveryState(options?.state)
  const sourceResult = await deps.discoverFromSources(config, deps)
  const deduped = dedupeAndSort(sourceResult.candidates, catalogDiscoveryIndex(context.tools), nextState, nowValue)
  const inspected = deduped.candidates.slice(0, config.limits.newDomains)
  const review = []
  const accepted = []
  const validEvidence = []
  const availableSlots = Math.max(0, Math.min(
    config.limits.publishPerRun,
    config.limits.catalogMaximum - context.tools.length
  ))

  for (const candidate of deduped.catalogDuplicates) {
    review.push(reviewItem(candidate, 'duplicate_catalog_entry'))
    nextState = recordFailed(nextState, candidate, 'duplicate_catalog_entry', processedAt)
  }

  if (availableSlots === 0) {
    for (const candidate of inspected) {
      review.push(reviewItem(candidate, 'catalog_maximum_reached'))
    }
  } else if (!deps.enricher) {
    for (const candidate of inspected) {
      review.push(reviewItem(candidate, 'enricher_unconfigured'))
    }
  } else {
    for (const candidate of inspected) {
      try {
        const evidence = await fetchOfficialPageWithRetry(
          candidate.url,
          deps.fetchOfficialPage,
          deps.sleep
        )
        const acceptedEvidence = evaluateCandidate(candidate, evidence, catalogDiscoveryIndex(context.tools))
        validEvidence.push(Object.freeze({ candidate, evidence: acceptedEvidence }))
      } catch (error) {
        const errorCode = knownCandidateError(error)
        if (!errorCode) throw error
        review.push(reviewItem(candidate, errorCode))
        nextState = recordFailed(nextState, candidate, errorCode, processedAt)
      }
    }

    for (const { candidate, evidence } of validEvidence) {
      if (accepted.length >= availableSlots) {
        review.push(reviewItem(candidate, 'publish_limit_reached'))
        continue
      }
      try {
        const index = catalogDiscoveryIndex([...context.tools, ...accepted.map(({ tool }) => tool)])
        const draft = await deps.enricher.enrich(candidate, evidence, index)
        const score = scoreCandidate(candidate, evidence, index, draft)
        const alternatives = selectDiscoveryAlternatives(index, draft.category, draft.slug)
        const tool = buildDiscoveredTool({
          evidence,
          draft,
          alternatives,
          date: dateOnly(nowValue)
        })
        accepted.push(Object.freeze({ candidate, evidence, tool, score }))
      } catch (error) {
        const errorCode = knownCandidateError(error)
        if (!errorCode) throw error
        review.push(reviewItem(candidate, errorCode))
        nextState = recordFailed(nextState, candidate, errorCode, processedAt)
      }
    }
  }

  if (!dryRun && accepted.length > 0) {
    deps.appendCatalogTools({ context, tools: accepted.map(({ tool }) => tool) })
  }
  for (const { candidate } of accepted) {
    nextState = recordTerminal(nextState, candidate, dryRun ? 'review' : 'published', processedAt)
  }

  const published = accepted.map(({ candidate, tool, evidence, score }) => publishedItem(candidate, tool, evidence, score))
  const needsReview = review.length > 0 || sourceResult.errors.length > 0
  return Object.freeze({
    hasChanges: !dryRun && published.length > 0,
    needsReview,
    sourceErrors: frozenList(sourceResult.errors),
    sourceSummaries: frozenList(sourceResult.sourceSummaries ?? []),
    candidates: frozenList(inspected.map((candidate) => ({
      key: candidateKey(candidate), sourceId: candidate.sourceId
    }))),
    published: frozenList(published),
    review: frozenList(review),
    nextState,
    changedUrls: Object.freeze(published.map(({ slug }) => catalogDetailUrl(slug)))
  })
}
