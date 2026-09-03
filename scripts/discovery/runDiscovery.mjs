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

function reviewItem(candidate, errorCode) {
  return Object.freeze({
    key: candidateKey(candidate),
    sourceId: candidate.sourceId,
    errorCode
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
      nextState = recordFailed(nextState, candidate, 'catalog_maximum_reached', processedAt)
    }
  } else if (!deps.enricher) {
    for (const candidate of inspected) {
      review.push(reviewItem(candidate, 'enricher_unconfigured'))
      nextState = recordFailed(nextState, candidate, 'enricher_unconfigured', processedAt)
    }
  } else {
    for (const candidate of inspected) {
      try {
        const evidence = await deps.fetchOfficialPage(candidate.url)
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
        nextState = recordFailed(nextState, candidate, 'publish_limit_reached', processedAt)
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
