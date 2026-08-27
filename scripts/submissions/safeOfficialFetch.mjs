import { lookup } from 'node:dns/promises'
import { request as httpsRequest } from 'node:https'
import { isIP } from 'node:net'

const MAX_RESPONSE_BYTES = 1024 * 1024
const MAX_VISIBLE_TEXT = 40_000
const TOTAL_TIMEOUT_MS = 8_000
const MAX_REDIRECTS = 3
const redirectStatuses = new Set([301, 302, 303, 307, 308])

export class OfficialFetchError extends Error {
  constructor(code) {
    super(code)
    this.name = 'OfficialFetchError'
    this.code = code
  }
}

function rejected() {
  return new OfficialFetchError('official_fetch_rejected')
}

function failed() {
  return new OfficialFetchError('official_fetch_failed')
}

function parseIpv4(value) {
  const parts = value.split('.')
  if (parts.length !== 4) return null
  const octets = parts.map((part) => Number(part))
  if (
    octets.some(
      (octet, index) =>
        !/^\d{1,3}$/.test(parts[index]) ||
        !Number.isInteger(octet) ||
        octet < 0 ||
        octet > 255
    )
  ) return null
  return octets
}

function isPublicIpv4(value) {
  const octets = parseIpv4(value)
  if (!octets) return false
  const [a, b, c] = octets
  return !(
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 192 && b === 0 && c === 2) ||
    (a === 192 && b === 88 && c === 99) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  )
}

function ipv6ToBigInt(input) {
  let value = input.toLowerCase()
  if (value.includes('%')) return null

  const dottedIndex = value.lastIndexOf(':')
  if (value.includes('.') && dottedIndex >= 0) {
    const ipv4 = parseIpv4(value.slice(dottedIndex + 1))
    if (!ipv4) return null
    const high = ((ipv4[0] << 8) | ipv4[1]).toString(16)
    const low = ((ipv4[2] << 8) | ipv4[3]).toString(16)
    value = `${value.slice(0, dottedIndex)}:${high}:${low}`
  }

  if ((value.match(/::/g) ?? []).length > 1) return null
  const [leftValue, rightValue] = value.split('::')
  const left = leftValue ? leftValue.split(':') : []
  const right = rightValue ? rightValue.split(':') : []
  if (value.includes('::')) {
    const missing = 8 - left.length - right.length
    if (missing < 1) return null
    left.push(...Array(missing).fill('0'))
  }
  const groups = [...left, ...right]
  if (groups.length !== 8 || groups.some((group) => !/^[0-9a-f]{1,4}$/.test(group))) {
    return null
  }
  return groups.reduce((result, group) => (result << 16n) | BigInt(`0x${group}`), 0n)
}

function isPublicIpv6(value) {
  const parsed = ipv6ToBigInt(value)
  if (parsed === null) return false

  const mappedPrefix = 0xffffn << 32n
  if ((parsed >> 32n) === 0xffffn) {
    const ipv4 = [24n, 16n, 8n, 0n]
      .map((shift) => Number((parsed >> shift) & 0xffn))
      .join('.')
    return isPublicIpv4(ipv4)
  }

  if ((parsed >> 125n) !== 1n) return false
  const documentationPrefix = BigInt('0x20010db8000000000000000000000000')
  if ((parsed >> 96n) === (documentationPrefix >> 96n)) return false
  const teredoPrefix = BigInt('0x20010000000000000000000000000000')
  if ((parsed >> 96n) === (teredoPrefix >> 96n)) return false
  const sixToFourPrefix = BigInt('0x20020000000000000000000000000000')
  if ((parsed >> 112n) === (sixToFourPrefix >> 112n)) return false
  return true
}

function isPublicAddress(address, family) {
  if (family === 4 && isIP(address) === 4) return isPublicIpv4(address)
  if (family === 6 && isIP(address) === 6) return isPublicIpv6(address)
  return false
}

function normalizedHostname(url) {
  return url.hostname.toLowerCase().replace(/^\[|\]$/g, '')
}

function assertSafeUrl(value) {
  let url
  try {
    url = value instanceof URL ? new URL(value.toString()) : new URL(value)
  } catch {
    throw rejected()
  }
  const hostname = normalizedHostname(url)
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    !hostname ||
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) throw rejected()

  const literalFamily = isIP(hostname)
  if (literalFamily && !isPublicAddress(hostname, literalFamily)) throw rejected()
  url.hash = ''
  return url
}

function headerValue(headers, name) {
  const expected = name.toLowerCase()
  for (const [key, value] of Object.entries(headers ?? {})) {
    if (key.toLowerCase() === expected && typeof value === 'string') return value.trim()
  }
  return undefined
}

function decodeEntities(value) {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"'
  }
  return value.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi, (match, decimal, hex, name) => {
    try {
      if (decimal) return String.fromCodePoint(Number(decimal))
      if (hex) return String.fromCodePoint(Number.parseInt(hex, 16))
      return named[String(name).toLowerCase()] ?? match
    } catch {
      return match
    }
  })
}

function normalizeText(value, maximum) {
  return decodeEntities(value).replace(/\s+/g, ' ').trim().slice(0, maximum)
}

function attributes(tag) {
  const values = {}
  const pattern = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g
  for (const match of tag.matchAll(pattern)) {
    values[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? ''
  }
  return values
}

function firstTag(html, tagName, predicate) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>`, 'gi')
  for (const match of html.matchAll(pattern)) {
    const parsed = attributes(match[0])
    if (predicate(parsed)) return parsed
  }
  return undefined
}

function safeCanonical(html, finalUrl) {
  const tag = firstTag(html, 'link', (value) =>
    typeof value.rel === 'string' && value.rel.toLowerCase().split(/\s+/).includes('canonical')
  )
  if (!tag?.href) return undefined
  try {
    return assertSafeUrl(new URL(tag.href, finalUrl)).toString()
  } catch {
    return undefined
  }
}

function extractEvidence(html, finalUrl) {
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i)
  const descriptionTag = firstTag(html, 'meta', (value) =>
    String(value.name ?? '').toLowerCase() === 'description'
  )
  let visible = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|template|svg|form)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<([a-z][a-z0-9:-]*)\b[^>]*(?:\shidden(?=[\s=>\/])|\saria-hidden\s*=\s*["']?true)[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<head\b[^>]*>[\s\S]*?<\/head\s*>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
  visible = normalizeText(visible, MAX_VISIBLE_TEXT)

  return {
    finalUrl: finalUrl.toString(),
    title: normalizeText(titleMatch?.[1] ?? '', 300),
    metaDescription: normalizeText(descriptionTag?.content ?? '', 1_000),
    ...(safeCanonical(html, finalUrl)
      ? { canonicalUrl: safeCanonical(html, finalUrl) }
      : {}),
    visibleText: visible
  }
}

async function readBody(body, now, deadline) {
  const parts = []
  let total = 0
  try {
    for await (const chunk of body) {
      if (now() >= deadline) throw failed()
      const bytes = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk)
      total += bytes.byteLength
      if (total > MAX_RESPONSE_BYTES) throw rejected()
      parts.push(bytes)
    }
  } catch (error) {
    if (error instanceof OfficialFetchError) throw error
    throw failed()
  }
  const merged = new Uint8Array(total)
  let offset = 0
  for (const part of parts) {
    merged.set(part, offset)
    offset += part.byteLength
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(merged)
  } catch {
    throw rejected()
  }
}

async function validatedAddresses(url, resolveHost) {
  const hostname = normalizedHostname(url)
  const literalFamily = isIP(hostname)
  let answers
  try {
    answers = literalFamily
      ? [{ address: hostname, family: literalFamily }]
      : await resolveHost(hostname)
  } catch {
    throw failed()
  }
  if (
    !Array.isArray(answers) ||
    answers.length === 0 ||
    answers.some(
      (answer) =>
        !answer ||
        (answer.family !== 4 && answer.family !== 6) ||
        typeof answer.address !== 'string' ||
        !isPublicAddress(answer.address, answer.family)
    )
  ) throw rejected()
  return answers
}

export async function safeFetchOfficialPage(value, deps = createNodeSafeFetchDeps()) {
  let url = assertSafeUrl(value)
  const startedAt = deps.now()
  const deadline = startedAt + TOTAL_TIMEOUT_MS

  for (let redirectCount = 0; ; redirectCount += 1) {
    if (deps.now() >= deadline) throw failed()
    const addresses = await validatedAddresses(url, deps.resolveHost)
    const selected = addresses[0]
    let response
    try {
      response = await deps.requestHttps({
        url,
        address: selected.address,
        family: selected.family,
        headers: {
          Host: url.host,
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Encoding': 'identity',
          'User-Agent': 'XunqiDirectoryEvidenceBot/1.0'
        },
        timeoutMs: Math.max(1, deadline - deps.now())
      })
    } catch (error) {
      if (error instanceof OfficialFetchError) throw error
      throw failed()
    }

    if (redirectStatuses.has(response.status)) {
      if (redirectCount >= MAX_REDIRECTS) throw rejected()
      const location = headerValue(response.headers, 'location')
      if (!location) throw rejected()
      try {
        url = assertSafeUrl(new URL(location, url))
      } catch (error) {
        if (error instanceof OfficialFetchError) throw error
        throw rejected()
      }
      continue
    }

    if (response.status < 200 || response.status >= 300) throw failed()
    const contentType = headerValue(response.headers, 'content-type')?.toLowerCase()
    const contentEncoding = headerValue(response.headers, 'content-encoding')?.toLowerCase()
    if (!contentType?.startsWith('text/html')) throw rejected()
    if (contentEncoding && contentEncoding !== 'identity') throw rejected()
    const declaredLength = Number(headerValue(response.headers, 'content-length'))
    if (Number.isFinite(declaredLength) && declaredLength > MAX_RESPONSE_BYTES) throw rejected()

    const html = await readBody(response.body, deps.now, deadline)
    return Object.freeze(extractEvidence(html, url))
  }
}

function requestPinnedHttps({ url, address, family, headers, timeoutMs }) {
  return new Promise((resolve, rejectPromise) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    let responseStarted = false
    const request = httpsRequest(url, {
      method: 'GET',
      headers,
      servername: normalizedHostname(url),
      signal: controller.signal,
      lookup(_hostname, options, callback) {
        const done = typeof options === 'function' ? options : callback
        if (typeof options === 'object' && options?.all) {
          done(null, [{ address, family }])
        } else {
          done(null, address, family)
        }
      }
    }, (response) => {
      responseStarted = true
      const responseHeaders = {}
      for (const [name, value] of Object.entries(response.headers)) {
        responseHeaders[name] = Array.isArray(value) ? value.join(', ') : value
      }
      const body = (async function* streamBody() {
        try {
          for await (const chunk of response) {
            yield chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk)
          }
        } finally {
          clearTimeout(timer)
          response.destroy()
        }
      })()
      resolve({ status: response.statusCode ?? 0, headers: responseHeaders, body })
    })
    request.on('error', (error) => {
      if (!responseStarted) {
        clearTimeout(timer)
        rejectPromise(error)
      }
    })
    request.end()
  })
}

export function createNodeSafeFetchDeps() {
  return {
    resolveHost: (hostname) => lookup(hostname, { all: true, verbatim: true }),
    requestHttps: requestPinnedHttps,
    now: () => Date.now()
  }
}
