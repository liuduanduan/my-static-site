import { normalizeCandidate } from './contracts.mjs'
import { fetchBoundedSource } from './sourceFetch.mjs'

const MAX_SOURCE_ITEMS = 50
const HACKER_NEWS_HOSTS = new Set(['news.ycombinator.com', 'ycombinator.com'])

class SourceError extends Error {
  constructor(code) {
    super(code)
    this.code = code
  }
}

function invalid() {
  return new SourceError('source_invalid')
}

function currentDate(deps) {
  const value = typeof deps?.now === 'function' ? deps.now() : deps?.now
  if (!(value instanceof Date) || Number.isNaN(value.valueOf())) throw invalid()
  return value
}

function publicSourceError(error) {
  return ['source_unavailable', 'source_invalid', 'source_rejected'].includes(error?.code)
    ? error.code
    : 'source_unavailable'
}

function json(text) {
  try {
    return JSON.parse(text)
  } catch {
    throw invalid()
  }
}

function records(value, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || !Array.isArray(value[field])) throw invalid()
  return value[field].slice(0, MAX_SOURCE_ITEMS)
}

function candidate(value, source, now) {
  try {
    return normalizeCandidate(value, source, now)
  } catch {
    return null
  }
}

function githubSearchUrl(source) {
  const url = new URL('https://api.github.com/search/repositories')
  url.searchParams.set('q', source.query)
  url.searchParams.set('per_page', String(MAX_SOURCE_ITEMS))
  return url.toString()
}

function hackerNewsSearchUrl(source) {
  const url = new URL('https://hn.algolia.com/api/v1/search')
  url.searchParams.set('query', source.query)
  url.searchParams.set('tags', 'story')
  url.searchParams.set('hitsPerPage', String(MAX_SOURCE_ITEMS))
  return url.toString()
}

function isExternalHackerNewsUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !HACKER_NEWS_HOSTS.has(url.hostname.toLowerCase())
  } catch {
    return false
  }
}

function decodeXmlEntities(value) {
  return value.replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[\da-f]+);/gi, (entity) => {
    const named = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" }
    const lower = entity.toLowerCase()
    if (Object.hasOwn(named, lower)) return named[lower]
    const hexadecimal = lower.startsWith('&#x')
    const codePoint = Number.parseInt(entity.slice(hexadecimal ? 3 : 2, -1), hexadecimal ? 16 : 10)
    if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) {
      return entity
    }
    return String.fromCodePoint(codePoint)
  })
}

function xmlText(value) {
  const cdata = /^<!\[CDATA\[([\s\S]*)\]\]>$/.exec(value.trim())
  const text = cdata ? cdata[1] : value
  return /<[^>]*>/.test(text) ? null : decodeXmlEntities(text).trim()
}

function elementText(record, name) {
  const match = new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i').exec(record)
  return match ? xmlText(match[1]) : null
}

function atomLink(record) {
  for (const match of record.matchAll(/<link\b([^>]*)\/?>(?:<\/link>)?/gi)) {
    const attributes = match[1]
    const href = /\bhref\s*=\s*(["'])(.*?)\1/i.exec(attributes)?.[2]
    const rel = /\brel\s*=\s*(["'])(.*?)\1/i.exec(attributes)?.[2]?.toLowerCase()
    if (href && (!rel || rel === 'alternate')) return decodeXmlEntities(href).trim()
  }
  return null
}

function xmlEntries(text) {
  const isAtom = /<feed\b/i.test(text)
  const entryTag = isAtom ? 'entry' : 'item'
  const expression = new RegExp(`<${entryTag}\\b[^>]*>([\\s\\S]*?)<\\/${entryTag}>`, 'gi')
  const entries = []
  for (const match of text.matchAll(expression)) {
    if (entries.length >= MAX_SOURCE_ITEMS) break
    const record = match[1]
    const name = elementText(record, 'title')
    const url = isAtom ? atomLink(record) : elementText(record, 'link')
    if (name && url) entries.push({ name, url })
  }
  return entries
}

export async function discoverFromGitHub(source, deps) {
  const now = currentDate(deps)
  const response = await fetchBoundedSource(githubSearchUrl(source), deps)
  const items = records(json(response.text), 'items')
  return Object.freeze(items.flatMap((item) => {
    if (!item || typeof item !== 'object'
      || typeof item.name !== 'string'
      || typeof item.homepage !== 'string'
      || !Number.isFinite(item.stargazers_count)
      || item.stargazers_count < source.minimumStars
      || item.archived !== false) return []
    const normalized = candidate({ name: item.name, url: item.homepage }, source, now)
    return normalized ? [normalized] : []
  }))
}

export async function discoverFromHackerNews(source, deps) {
  const now = currentDate(deps)
  const response = await fetchBoundedSource(hackerNewsSearchUrl(source), deps)
  const minimumTimestamp = now.valueOf() - source.lookbackDays * 24 * 60 * 60 * 1000
  const items = records(json(response.text), 'hits')
  return Object.freeze(items.flatMap((item) => {
    if (!item || typeof item !== 'object'
      || typeof item.title !== 'string'
      || !/^show hn\s*:/i.test(item.title)
      || typeof item.url !== 'string'
      || !isExternalHackerNewsUrl(item.url)
      || !Number.isFinite(item.points) || item.points < source.minimumPoints
      || !Number.isFinite(item.created_at_i)
      || item.created_at_i * 1000 < minimumTimestamp
      || item.created_at_i * 1000 > now.valueOf()) return []
    const name = item.title.replace(/^show hn\s*:\s*/i, '').trim()
    const normalized = candidate({ name, url: item.url }, source, now)
    return normalized ? [normalized] : []
  }))
}

export async function discoverFromFeed(source, deps) {
  const now = currentDate(deps)
  const response = await fetchBoundedSource(source.url, deps)
  const entries = response.contentType === 'application/json' || response.contentType === 'application/feed+json'
    ? records(json(response.text), 'items').flatMap((item) => {
      if (!item || typeof item !== 'object' || typeof item.title !== 'string') return []
      const url = typeof item.external_url === 'string' ? item.external_url : item.url
      return typeof url === 'string' ? [{ name: item.title, url }] : []
    })
    : xmlEntries(response.text)
  return Object.freeze(entries.slice(0, MAX_SOURCE_ITEMS).flatMap((entry) => {
    const normalized = candidate(entry, source, now)
    return normalized ? [normalized] : []
  }))
}

function adapterFor(kind) {
  if (kind === 'github-search') return discoverFromGitHub
  if (kind === 'hacker-news') return discoverFromHackerNews
  if (kind === 'feed') return discoverFromFeed
  throw invalid()
}

export async function discoverFromSources(config, deps) {
  const candidates = []
  const errors = []
  for (const source of config.sources.filter(({ enabled }) => enabled)) {
    try {
      candidates.push(...await adapterFor(source.kind)(source, deps))
    } catch (error) {
      const errorCode = publicSourceError(error)
      errors.push(Object.freeze({ sourceId: source.id, errorCode }))
      deps?.logger?.warn?.({ sourceId: source.id, errorCode })
    }
    if (candidates.length >= config.limits.sourceRecords) break
  }
  return Object.freeze({
    candidates: Object.freeze(candidates.slice(0, config.limits.sourceRecords)),
    errors: Object.freeze(errors)
  })
}
