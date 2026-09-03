const MAX_OUTCOMES = 500
const OUTCOME_STATUSES = new Set(['failed', 'published', 'review'])
const TERMINAL_STATUSES = new Set(['published', 'review'])
const SAFE_KEY = /^[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?$/
const MAX_FINGERPRINT_LENGTH = 256
const MAX_ERROR_CODE_LENGTH = 80
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
  if (typeof value !== 'string'
    || value.length > 40
    || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) onInvalid()
  const timestamp = new Date(value)
  if (Number.isNaN(timestamp.valueOf())) onInvalid()
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
    || !(value.errorCode === null || isSafeShortText(value.errorCode, MAX_ERROR_CODE_LENGTH))
    || !isSafeShortText(value.fingerprint, MAX_FINGERPRINT_LENGTH)) onInvalid()

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
  if (relevant.length === 0 || relevant[0].status !== 'failed') return false

  const fingerprint = relevant[0].fingerprint
  const failures = relevant.slice(0, 3)
  if (failures.length !== 3 || failures.some((outcome) => outcome.status !== 'failed' || outcome.fingerprint !== fingerprint)) {
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
