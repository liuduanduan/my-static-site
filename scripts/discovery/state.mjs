const MAX_OUTCOMES = 500
const OUTCOME_STATUSES = new Set(['failed', 'published', 'review'])
const TERMINAL_STATUSES = new Set(['published', 'review'])
const ERROR_CODES = new Set([
  'source_unavailable',
  'source_invalid',
  'source_rejected',
  'official_fetch_rejected',
  'official_fetch_failed',
  'duplicate_catalog_entry',
  'insufficient_official_evidence',
  'non_product_page',
  'prohibited_candidate',
  'discovery_enricher_invalid_output',
  'discovery_enricher_failed',
  'enricher_unconfigured',
  'catalog_validation_failed',
  'catalog_maximum_reached',
  'publish_limit_reached'
])
const DEFERRAL_ERROR_CODES = new Set([
  'enricher_unconfigured',
  'catalog_maximum_reached',
  'publish_limit_reached'
])
const SAFE_KEY = /^[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?$/
const SHA256_HEX = /^[a-f0-9]{64}$/
const COOLDOWN_MILLISECONDS = 30 * 24 * 60 * 60 * 1000

function invalidState() {
  throw new Error('invalid_discovery_state')
}

function invalidOutcome() {
  throw new Error('invalid_discovery_outcome')
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function parseTimestamp(value, onInvalid) {
  const match = typeof value === 'string'
    && /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(?:\.(\d{3}))?Z$/.exec(value)
  if (!match) onInvalid()
  const timestamp = new Date(value)
  const expected = `${match[1]}.${match[2] ?? '000'}Z`
  if (Number.isNaN(timestamp.valueOf()) || timestamp.toISOString() !== expected) onInvalid()
  return timestamp
}

function isSafeShortText(value, maximum) {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= maximum
    && !/[\u0000-\u001f\u007f]/.test(value)
}

function normalizeOutcome(value, onInvalid) {
  if (!isPlainObject(value)
    || !Object.keys(value).every((key) => ['key', 'status', 'errorCode', 'processedAt', 'fingerprint'].includes(key))
    || !['key', 'status', 'errorCode', 'processedAt', 'fingerprint'].every((key) => Object.hasOwn(value, key))
    || !isSafeShortText(value.key, 253)
    || !SAFE_KEY.test(value.key)
    || !OUTCOME_STATUSES.has(value.status)
    || !(value.status === 'failed' ? ERROR_CODES.has(value.errorCode) : value.errorCode === null)
    || typeof value.fingerprint !== 'string'
    || !SHA256_HEX.test(value.fingerprint)) onInvalid()

  const processedAt = parseTimestamp(value.processedAt, onInvalid)
  return Object.freeze({
    key: value.key,
    status: value.status,
    errorCode: value.errorCode,
    processedAt: processedAt.toISOString(),
    fingerprint: value.fingerprint
  })
}

function newestFirst(outcomes) {
  return [...outcomes].sort((left, right) => new Date(right.processedAt) - new Date(left.processedAt))
}

function freezeState(outcomes) {
  return Object.freeze({ version: 1, outcomes: Object.freeze(newestFirst(outcomes).slice(0, MAX_OUTCOMES)) })
}

export function parseDiscoveryState(value) {
  if (!isPlainObject(value)
    || !Object.keys(value).every((key) => ['version', 'outcomes'].includes(key))
    || value.version !== 1
    || !Array.isArray(value.outcomes)) invalidState()

  return freezeState(value.outcomes.map((outcome) => normalizeOutcome(outcome, invalidState)))
}

export function shouldCoolDown(state, key, now = new Date()) {
  const parsed = parseDiscoveryState(state)
  if (typeof key !== 'string' || !SAFE_KEY.test(key) || !(now instanceof Date) || Number.isNaN(now.valueOf())) {
    return false
  }

  const relevant = parsed.outcomes.filter((outcome) => outcome.key === key)
  if (relevant.length === 0
    || relevant[0].status !== 'failed'
    || DEFERRAL_ERROR_CODES.has(relevant[0].errorCode)) return false

  const fingerprint = relevant[0].fingerprint
  const errorCode = relevant[0].errorCode
  const failures = relevant.slice(0, 3)
  if (failures.length !== 3 || failures.some((outcome) => outcome.status !== 'failed'
    || outcome.fingerprint !== fingerprint
    || outcome.errorCode !== errorCode)) {
    return false
  }

  const lastFailure = new Date(relevant[0].processedAt)
  return now.valueOf() < lastFailure.valueOf() + COOLDOWN_MILLISECONDS
}

export function recordOutcome(state, outcome) {
  const parsed = parseDiscoveryState(state)
  const normalized = normalizeOutcome(outcome, invalidOutcome)
  const retained = TERMINAL_STATUSES.has(normalized.status)
    ? parsed.outcomes.filter((existing) => existing.key !== normalized.key)
    : parsed.outcomes

  return freezeState([...retained, normalized])
}
