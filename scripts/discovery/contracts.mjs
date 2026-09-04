import { registrableDomain } from '../catalog/registrableDomain.mjs'

const CONFIG_LIMIT_CAPS = Object.freeze({
  sourceRecords: 50,
  newDomains: 15,
  publishPerRun: 3,
  catalogMaximum: 300
})

const SOURCE_FIELDS = Object.freeze({
  'github-search': ['id', 'kind', 'enabled', 'query', 'minimumStars', 'score'],
  'hacker-news': ['id', 'kind', 'enabled', 'query', 'minimumPoints', 'lookbackDays', 'score'],
  feed: ['id', 'kind', 'enabled', 'url', 'score']
})

const SOURCE_KINDS = new Set(Object.keys(SOURCE_FIELDS))
const TRACKING_PARAMETER = /^(utm_.*|ref|source|fbclid)$/i
const SENSITIVE_QUERY_SEGMENTS = new Set([
  'token',
  'secret',
  'password',
  'passwd',
  'auth',
  'authorization',
  'signature',
  'sig',
])
const SENSITIVE_QUERY_NAMES = new Set([
  'key',
  'code',
  'apikey',
  'api_key',
  'access_key',
  'client_key'
])
const MAX_CANDIDATE_URL_LENGTH = 2048
const SAFE_ID = /^[a-z0-9][a-z0-9-]{0,63}$/

function invalidConfig() {
  throw new Error('invalid_discovery_config')
}

function invalidCandidate() {
  throw new Error('invalid_discovery_candidate')
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function hasOnlyKeys(value, allowedKeys) {
  return Object.keys(value).every((key) => allowedKeys.includes(key))
}

function isSafeText(value) {
  return typeof value === 'string'
    && value.trim().length > 0
    && value.trim().length <= 160
    && !/[\u0000-\u001f\u007f]/.test(value)
}

function isSafeName(value) {
  return isSafeText(value) && !/[<>]/.test(value)
}

function isPositiveInteger(value, maximum) {
  return Number.isInteger(value) && value > 0 && value <= maximum
}

function isScore(value) {
  return Number.isInteger(value) && value >= 0 && value <= 100
}

function isSensitiveQueryParameter(key) {
  const normalized = key.normalize('NFKC')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .toLowerCase()
  const segments = normalized.split('_').filter(Boolean)
  if (segments.length === 0) return true
  return SENSITIVE_QUERY_NAMES.has(normalized)
    || segments.some((segment) => SENSITIVE_QUERY_SEGMENTS.has(segment))
}

function normalizeUrl(value, onInvalid, { rejectSensitiveQuery = false, maximumLength = Infinity } = {}) {
  if (typeof value !== 'string' || value.trim().length === 0) onInvalid()

  let parsed
  try {
    parsed = new URL(value.trim())
  } catch {
    onInvalid()
  }

  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.port) onInvalid()
  if (!registrableDomain(parsed.hostname)) onInvalid()

  for (const key of [...parsed.searchParams.keys()]) {
    if (rejectSensitiveQuery && isSensitiveQueryParameter(key)) onInvalid()
    if (TRACKING_PARAMETER.test(key)) parsed.searchParams.delete(key)
  }
  parsed.hash = ''
  const normalized = parsed.toString()
  if (normalized.length > maximumLength) onInvalid()
  return normalized
}

function normalizeSource(source) {
  if (!isPlainObject(source) || typeof source.kind !== 'string' || !SOURCE_KINDS.has(source.kind)) {
    invalidConfig()
  }

  const fields = SOURCE_FIELDS[source.kind]
  if (!hasOnlyKeys(source, fields) || !fields.every((field) => Object.hasOwn(source, field))) invalidConfig()
  if (typeof source.id !== 'string' || !SAFE_ID.test(source.id) || typeof source.enabled !== 'boolean' || !isScore(source.score)) {
    invalidConfig()
  }

  if (source.kind === 'github-search') {
    if (!isSafeText(source.query) || !isPositiveInteger(source.minimumStars, 1_000_000)) invalidConfig()
  }
  if (source.kind === 'hacker-news') {
    if (!isSafeText(source.query)
      || !isPositiveInteger(source.minimumPoints, 1_000_000)
      || !isPositiveInteger(source.lookbackDays, 365)) invalidConfig()
  }
  if (source.kind === 'feed') {
    normalizeUrl(source.url, invalidConfig)
  }

  return Object.freeze({ ...source, ...(source.kind === 'feed' ? { url: normalizeUrl(source.url, invalidConfig) } : {}) })
}

export function parseDiscoveryConfig(value) {
  if (!isPlainObject(value)
    || !hasOnlyKeys(value, ['version', 'limits', 'sources'])
    || value.version !== 1
    || !isPlainObject(value.limits)
    || !hasOnlyKeys(value.limits, Object.keys(CONFIG_LIMIT_CAPS))
    || !Object.keys(CONFIG_LIMIT_CAPS).every((key) => Object.hasOwn(value.limits, key))
    || !Array.isArray(value.sources)) invalidConfig()

  for (const [key, cap] of Object.entries(CONFIG_LIMIT_CAPS)) {
    if (!isPositiveInteger(value.limits[key], cap)) invalidConfig()
  }

  const sources = value.sources.map(normalizeSource)
  if (new Set(sources.map(({ id }) => id)).size !== sources.length) invalidConfig()

  return Object.freeze({
    version: 1,
    limits: Object.freeze({ ...value.limits }),
    sources: Object.freeze(sources)
  })
}

export function normalizeCandidate(value, source, now = new Date()) {
  if (!isPlainObject(value) || !isSafeName(value.name) || !isPlainObject(source)) invalidCandidate()
  if (typeof source.id !== 'string' || !SAFE_ID.test(source.id) || !SOURCE_KINDS.has(source.kind) || !isScore(source.score)) {
    invalidCandidate()
  }
  if (!(now instanceof Date) || Number.isNaN(now.valueOf())) invalidCandidate()

  return Object.freeze({
    name: value.name.trim(),
    url: normalizeUrl(value.url, invalidCandidate, {
      rejectSensitiveQuery: true,
      maximumLength: MAX_CANDIDATE_URL_LENGTH
    }),
    sourceId: source.id,
    sourceKind: source.kind,
    discoveredAt: now.toISOString(),
    sourceScore: source.score
  })
}

export function candidateKey(candidate) {
  if (!isPlainObject(candidate)) invalidCandidate()
  const url = normalizeUrl(candidate.url, invalidCandidate, {
    rejectSensitiveQuery: true,
    maximumLength: MAX_CANDIDATE_URL_LENGTH
  })
  const key = registrableDomain(new URL(url).hostname)
  if (!key) invalidCandidate()
  return key
}
