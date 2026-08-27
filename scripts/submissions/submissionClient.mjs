const claimedKeys = new Set([
  'id',
  'publicRef',
  'name',
  'officialUrl',
  'normalizedDomain',
  'tagline',
  'description',
  'category',
  'bestFor',
  'features',
  'pricingMode',
  'chineseSupport',
  'accessModes',
  'status',
  'attemptCount'
])
const categories = new Set([
  'chat', 'writing', 'image', 'video', 'coding', 'audio', 'research', 'marketing', 'automation'
])
const pricingModes = new Set(['free', 'freemium', 'paid', 'contact'])
const chineseSupportModes = new Set(['native', 'partial', 'none'])
const accessModes = new Set(['web', 'desktop', 'mobile', 'api', 'extension'])
const identifierPattern = /^[A-Za-z0-9-]{1,128}$/

function invalidClaim() {
  throw new Error('invalid_claim_response')
}

function stringValue(value, minimum = 1, maximum = 2_048) {
  if (typeof value !== 'string') return invalidClaim()
  const normalized = value.trim()
  if (normalized.length < minimum || normalized.length > maximum) return invalidClaim()
  return normalized
}

function tuple3(value) {
  if (!Array.isArray(value) || value.length !== 3) return invalidClaim()
  return value.map((item) => stringValue(item, 2, 120))
}

function parseClaim(value) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return invalidClaim()
  if (
    Object.keys(value).length !== claimedKeys.size ||
    Object.keys(value).some((key) => !claimedKeys.has(key))
  ) return invalidClaim()
  if (!categories.has(value.category)) return invalidClaim()
  if (!pricingModes.has(value.pricingMode)) return invalidClaim()
  if (!chineseSupportModes.has(value.chineseSupport)) return invalidClaim()
  if (
    !Array.isArray(value.accessModes) ||
    value.accessModes.some((mode) => !accessModes.has(mode)) ||
    new Set(value.accessModes).size !== value.accessModes.length
  ) return invalidClaim()
  if (value.status !== 'processing') return invalidClaim()
  if (!Number.isInteger(value.attemptCount) || value.attemptCount < 1 || value.attemptCount > 3) {
    return invalidClaim()
  }
  const officialUrl = stringValue(value.officialUrl)
  let parsedUrl
  try {
    parsedUrl = new URL(officialUrl)
  } catch {
    return invalidClaim()
  }
  if (parsedUrl.protocol !== 'https:' || parsedUrl.username || parsedUrl.password || parsedUrl.port) {
    return invalidClaim()
  }
  const publicRef = stringValue(value.publicRef, 13, 13)
  if (!/^[a-z2-7]{13}$/.test(publicRef)) return invalidClaim()

  return Object.freeze({
    id: stringValue(value.id, 1, 128),
    publicRef,
    name: stringValue(value.name, 2, 80),
    officialUrl,
    normalizedDomain: stringValue(value.normalizedDomain, 1, 253).toLowerCase(),
    tagline: stringValue(value.tagline, 6, 120),
    description: typeof value.description === 'string' ? value.description.trim() : invalidClaim(),
    category: value.category,
    bestFor: Object.freeze(tuple3(value.bestFor)),
    features: Object.freeze(tuple3(value.features)),
    pricingMode: value.pricingMode,
    chineseSupport: value.chineseSupport,
    accessModes: Object.freeze([...value.accessModes]),
    status: 'processing',
    attemptCount: value.attemptCount
  })
}

function parseBaseUrl(value) {
  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error('invalid_submission_api_base')
  }
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) throw new Error('invalid_submission_api_base')
  return url.origin
}

async function parseJsonResponse(response, errorCode) {
  if (!response.ok) throw new Error(errorCode)
  try {
    return await response.json()
  } catch {
    throw new Error(errorCode)
  }
}

export function createSubmissionClient(config) {
  const baseUrl = parseBaseUrl(config?.baseUrl)
  const adminToken = typeof config?.adminToken === 'string' ? config.adminToken.trim() : ''
  if (!adminToken) throw new Error('missing_submission_admin_token')
  const fetcher = config.fetch ?? fetch
  const headers = Object.freeze({
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  })

  async function request(path, method, body, errorCode) {
    return parseJsonResponse(await fetcher(`${baseUrl}${path}`, {
      method,
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000)
    }), errorCode)
  }

  return Object.freeze({
    async claimOne() {
      const value = await request(
        '/api/admin/submissions/claim',
        'POST',
        { limit: 1 },
        'claim_request_failed'
      )
      if (
        typeof value !== 'object' ||
        value === null ||
        Array.isArray(value) ||
        Object.keys(value).length !== 1 ||
        !Array.isArray(value.submissions) ||
        value.submissions.length > 1
      ) return invalidClaim()
      return value.submissions.length ? parseClaim(value.submissions[0]) : null
    },
    async updateSubmission(idOrPublicRef, update) {
      if (typeof idOrPublicRef !== 'string' || !identifierPattern.test(idOrPublicRef)) {
        throw new Error('invalid_submission_identifier')
      }
      const value = await request(
        `/api/admin/submissions/${encodeURIComponent(idOrPublicRef)}`,
        'PATCH',
        update,
        'status_update_failed'
      )
      if (
        typeof value !== 'object' ||
        value === null ||
        Array.isArray(value) ||
        Object.keys(value).length !== 1 ||
        value.ok !== true
      ) throw new Error('status_update_failed')
    }
  })
}
