import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

function decodeXml(value) {
  return value.replace(/&(?:amp|apos|gt|lt|quot);/g, (entity) => ({
    '&amp;': '&',
    '&apos;': "'",
    '&gt;': '>',
    '&lt;': '<',
    '&quot;': '"'
  })[entity])
}

function canonicalUrl(value, expectedOrigin) {
  const url = new URL(value)
  if (
    url.protocol !== 'https:' ||
    url.origin !== expectedOrigin ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) return undefined
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1)
  }
  return url.toString()
}

function readSitemap(path) {
  const xml = readFileSync(path, 'utf8')
  const rawLocations = [...xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)]
    .map((match) => decodeXml(match[1].trim()))
  if (rawLocations.length === 0) throw new Error('Sitemap contains no URLs')

  const first = new URL(rawLocations[0])
  if (first.protocol !== 'https:' || first.username || first.password || first.search || first.hash) {
    throw new Error('Sitemap must contain canonical HTTPS URLs')
  }
  const origin = first.origin
  const urls = new Set()
  for (const value of rawLocations) {
    const canonical = canonicalUrl(value, origin)
    if (!canonical) throw new Error('Sitemap contains a non-canonical or cross-origin URL')
    urls.add(canonical)
  }
  return { origin, urls }
}

function excludedPath(pathname) {
  return (
    /^\/(?:api|admin)(?:\/|$)/i.test(pathname) ||
    /(?:^|\/)status(?:\/|$)/i.test(pathname) ||
    /^\/privacy(?:\/|$)/i.test(pathname)
  )
}

function allowedUrls(path, sitemap) {
  const seen = new Set()
  const result = []
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const value = line.trim()
    if (!value) continue
    let canonical
    try {
      canonical = canonicalUrl(value, sitemap.origin)
    } catch {
      canonical = undefined
    }
    if (!canonical || !sitemap.urls.has(canonical)) continue
    const url = new URL(canonical)
    if (excludedPath(url.pathname) || seen.has(canonical)) continue
    seen.add(canonical)
    result.push(canonical)
  }
  return result
}

async function sendIndexNow(urls, origin, key, fetchImpl) {
  const site = new URL(origin)
  return fetchImpl('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: site.host,
      key,
      keyLocation: `${origin}/${encodeURIComponent(key)}.txt`,
      urlList: urls
    })
  })
}

async function sendBaidu(urls, origin, token, fetchImpl) {
  const endpoint = new URL('https://data.zz.baidu.com/urls')
  endpoint.searchParams.set('site', origin)
  endpoint.searchParams.set('token', token)
  return fetchImpl(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    body: urls.join('\n')
  })
}

export async function notifySearchIndexes({
  sitemapPath,
  urlListPath,
  fetch: fetchImpl = globalThis.fetch,
  env = process.env,
  logger = console
}) {
  if (!sitemapPath || !urlListPath) throw new Error('Both sitemapPath and urlListPath are required')
  if (typeof fetchImpl !== 'function') throw new Error('A fetch implementation is required')

  const sitemap = readSitemap(sitemapPath)
  const urls = allowedUrls(urlListPath, sitemap)
  const providers = []
  if (typeof env.INDEXNOW_KEY === 'string' && env.INDEXNOW_KEY.trim()) {
    providers.push({
      name: 'IndexNow',
      send: () => sendIndexNow(urls, sitemap.origin, env.INDEXNOW_KEY.trim(), fetchImpl)
    })
  }
  if (typeof env.BAIDU_TOKEN === 'string' && env.BAIDU_TOKEN.trim()) {
    providers.push({
      name: 'Baidu',
      send: () => sendBaidu(urls, sitemap.origin, env.BAIDU_TOKEN.trim(), fetchImpl)
    })
  }

  if (providers.length === 0) {
    logger.info('Search notification skipped: no provider credentials configured.')
    return 0
  }
  if (urls.length === 0) {
    logger.info('Search notification skipped: allow-list contains no eligible sitemap URLs.')
    return 0
  }

  let failed = false
  for (const provider of providers) {
    try {
      const response = await provider.send()
      if (!response || response.status < 200 || response.status >= 300) {
        failed = true
        logger.error(`${provider.name} notification failed with HTTP ${response?.status ?? 'unknown'}.`)
      } else {
        logger.info(`${provider.name} accepted ${urls.length} URL(s).`)
      }
    } catch {
      failed = true
      logger.error(`${provider.name} notification failed before receiving a response.`)
    }
  }
  return failed ? 1 : 0
}

function parseArguments(argv) {
  const values = {}
  for (let index = 0; index < argv.length; index += 1) {
    const name = argv[index]
    if (name !== '--sitemap' && name !== '--urls') throw new Error(`Unknown argument: ${name}`)
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${name}`)
    values[name.slice(2)] = value
    index += 1
  }
  if (!values.sitemap || !values.urls) {
    throw new Error('Usage: node scripts/notify-search-indexes.mjs --sitemap <path> --urls <path>')
  }
  return values
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    const args = parseArguments(process.argv.slice(2))
    process.exitCode = await notifySearchIndexes({
      sitemapPath: args.sitemap,
      urlListPath: args.urls
    })
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Search notification failed.')
    process.exitCode = 1
  }
}
