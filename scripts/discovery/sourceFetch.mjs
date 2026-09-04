const MAX_SOURCE_BYTES = 1024 * 1024
const SOURCE_TIMEOUT_MILLISECONDS = 10_000
const SOURCE_USER_AGENT = 'Xunqi-AI-Directory-Discovery/1.0 (+https://no996noicu.com)'
const ACCEPTED_CONTENT_TYPES = new Set([
  'application/json',
  'application/feed+json',
  'application/rss+xml',
  'application/atom+xml',
  'application/xml',
  'text/xml',
  'text/plain'
])

class SourceError extends Error {
  constructor(code) {
    super(code)
    this.code = code
  }
}

function rejected() {
  return new SourceError('source_rejected')
}

function unavailable() {
  return new SourceError('source_unavailable')
}

function sourceUrl(value) {
  let parsed
  try {
    parsed = new URL(value)
  } catch {
    throw rejected()
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.port) throw rejected()
  return parsed.toString()
}

function contentType(headers) {
  const value = headers.get('content-type')
  if (!value) throw rejected()
  const [typePart, ...parameters] = value.split(';')
  const type = typePart.trim().toLowerCase()
  if (!ACCEPTED_CONTENT_TYPES.has(type)) throw rejected()

  const charset = parameters
    .map((parameter) => parameter.trim().split('='))
    .find(([name]) => name.toLowerCase() === 'charset')?.[1]?.trim().replace(/^"|"$/g, '').toLowerCase()
  if ((type.startsWith('text/') || charset) && charset && charset !== 'utf-8' && charset !== 'utf8') throw rejected()
  return type
}

async function boundedBytes(body) {
  if (!body) return new Uint8Array()
  const reader = body.getReader()
  const chunks = []
  let length = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > MAX_SOURCE_BYTES) {
        await reader.cancel()
        throw rejected()
      }
      chunks.push(value)
    }
  } catch (error) {
    if (error instanceof SourceError) throw error
    throw unavailable()
  } finally {
    reader.releaseLock()
  }

  const bytes = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return bytes
}

export async function fetchBoundedSource(url, options = {}) {
  const safeUrl = sourceUrl(url)
  if (typeof options.fetch !== 'function') throw unavailable()
  const headers = {
    accept: 'application/json, application/feed+json, application/rss+xml, application/atom+xml, application/xml, text/xml, text/plain',
    'user-agent': SOURCE_USER_AGENT
  }
  if (options.authorizationToken !== undefined) {
    if (new URL(safeUrl).hostname !== 'api.github.com'
      || typeof options.authorizationToken !== 'string'
      || !/^[A-Za-z0-9_]{1,255}$/u.test(options.authorizationToken)) throw rejected()
    headers.authorization = `Bearer ${options.authorizationToken}`
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), SOURCE_TIMEOUT_MILLISECONDS)
  try {
    let response
    try {
      response = await options.fetch(safeUrl, {
        method: 'GET',
        redirect: 'error',
        signal: controller.signal,
        headers
      })
    } catch (error) {
      if (/redirect/i.test(String(error?.message ?? ''))) throw rejected()
      throw unavailable()
    }

    if (!response || typeof response.status !== 'number' || !response.headers || !response.body) throw unavailable()
    if (response.status >= 300 && response.status < 400) throw rejected()
    if (response.status < 200 || response.status >= 300) throw unavailable()
    const type = contentType(response.headers)
    const length = Number(response.headers.get('content-length'))
    if (Number.isFinite(length) && (length < 0 || length > MAX_SOURCE_BYTES)) throw rejected()

    const bytes = await boundedBytes(response.body)
    let text
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    } catch {
      throw rejected()
    }
    return Object.freeze({ url: safeUrl, contentType: type, text })
  } finally {
    clearTimeout(timeout)
  }
}

export const sourceFetchLimits = Object.freeze({
  timeoutMilliseconds: SOURCE_TIMEOUT_MILLISECONDS,
  maximumBytes: MAX_SOURCE_BYTES,
  userAgent: SOURCE_USER_AGENT
})
