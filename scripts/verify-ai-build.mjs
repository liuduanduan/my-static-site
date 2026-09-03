import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inflateSync } from 'node:zlib'

const scriptPath = fileURLToPath(import.meta.url)
const defaultRoot = resolve(dirname(scriptPath), '..')
const socialImageUrl = 'https://no996noicu.com/social-card.png'
const siteOrigin = 'https://no996noicu.com'
const categoryLabels = {
  chat: '对话与模型',
  writing: '写作与办公',
  image: '图像与设计',
  video: '视频与数字人',
  coding: '编程与建站',
  audio: '音频与音乐',
  research: '搜索与研究',
  marketing: '营销与社媒',
  automation: '自动化与数据'
}
const accessModeLabels = {
  web: '网页',
  desktop: '桌面端',
  mobile: '移动端',
  api: 'API',
  extension: '浏览器扩展'
}
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const launchToolSlugs = [
  'chatgpt', 'claude', 'deepseek', 'kimi', 'gemini', 'microsoft-copilot', 'doubao',
  'notion', 'gamma', 'napkin', 'otter', 'grammarly', 'quillbot', 'wps-ai',
  'midjourney', 'canva', 'firefly', 'leonardo-ai', 'ideogram', 'stable-diffusion', 'remove-bg',
  'runway', 'capcut', 'kling', 'pika', 'heygen', 'synthesia', 'luma-dream-machine',
  'cursor', 'github-copilot', 'v0', 'lovable', 'replit', 'bolt-new', 'windsurf',
  'elevenlabs', 'suno', 'udio', 'descript', 'adobe-podcast', 'aiva', 'murf',
  'perplexity', 'elicit', 'consensus', 'scite', 'notebooklm', 'you-com', 'semantic-scholar',
  'jasper', 'copy-ai', 'hubspot-ai', 'predis-ai', 'buffer-ai', 'adcreative-ai', 'ocoya',
  'zapier', 'make', 'n8n', 'airtable', 'bardeen', 'rows', 'julius-ai'
]

function pathsEqual(left, right) {
  const normalizedLeft = resolve(left)
  const normalizedRight = resolve(right)
  return process.platform === 'win32'
    ? normalizedLeft.toLowerCase() === normalizedRight.toLowerCase()
    : normalizedLeft === normalizedRight
}

function walkFiles(directory) {
  if (!existsSync(directory)) return []

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? walkFiles(path) : [path]
  })
}

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right, 'en'))
}

export function assertExactSet(actual, expected, label) {
  const missing = sorted([...expected].filter((value) => !actual.has(value)))
  const extra = sorted([...actual].filter((value) => !expected.has(value)))
  assert.deepEqual(
    { missing, extra },
    { missing: [], extra: [] },
    `${label} mismatch; missing: ${missing.join(', ') || '(none)'}; extra: ${extra.join(', ') || '(none)'}`
  )
}

export function assertCatalogGrowthPolicy(tools, requiredSlugs = launchToolSlugs) {
  assert.ok(Array.isArray(tools), 'production data must be an array')
  assert.ok(
    tools.length >= requiredSlugs.length,
    `production data must contain at least ${requiredSlugs.length} tools`
  )
  const actualSlugs = new Set(tools.map((tool) => tool?.slug))
  const missing = requiredSlugs.filter((slug) => !actualSlugs.has(slug))
  assert.deepEqual(missing, [], `production data is missing launch tools: ${missing.join(', ')}`)
}

export function artifactRouteSet(directory, routePrefix) {
  const routes = new Set()
  const htmlFiles = walkFiles(directory).filter((path) => path.toLowerCase().endsWith('.html'))

  for (const path of htmlFiles) {
    const relativePath = relative(directory, path).split(sep).join('/')
    let suffix = relativePath.replace(/\.html$/i, '')
    if (suffix === 'index') suffix = ''
    else if (suffix.endsWith('/index')) suffix = suffix.slice(0, -'/index'.length)
    const route = `${routePrefix}${suffix ? `/${suffix}` : ''}`
    assert.ok(!routes.has(route), `duplicate HTML artifacts map to ${route}`)
    routes.add(route)
  }

  return routes
}

export function decodeHtmlEntities(value) {
  const named = { amp: '&', apos: "'", gt: '>', lt: '<', quot: '"' }
  return value.replace(/&(#(?:x[0-9a-f]+|\d+)|amp|apos|gt|lt|quot);/gi, (entity, token) => {
    if (token[0] !== '#') return named[token.toLowerCase()]
    const hexadecimal = token[1].toLowerCase() === 'x'
    const codePoint = Number.parseInt(token.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10)
    return Number.isSafeInteger(codePoint) ? String.fromCodePoint(codePoint) : entity
  })
}

export function parseAttributes(tag) {
  const attributes = {}
  const attributePattern = /\s([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  for (const match of tag.matchAll(attributePattern)) {
    const name = match[1].toLowerCase()
    assert.ok(
      !Object.hasOwn(attributes, name),
      `HTML tag contains duplicate attribute ${name}: ${tag}`
    )
    attributes[name] = decodeHtmlEntities(
      match[2] ?? match[3] ?? match[4] ?? ''
    )
  }
  return attributes
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map((match) => ({
    source: match[0],
    attributes: parseAttributes(match[0])
  }))
}

function exactMeta(html, attribute, key, pageName) {
  const matchingTags = tags(html, 'meta').filter(
    ({ attributes }) => attributes.name === key || attributes.property === key
  )
  assert.equal(
    matchingTags.length,
    1,
    `${pageName} must emit exactly one meta ${attribute}="${key}" tag`
  )
  assert.equal(
    matchingTags[0].attributes[attribute],
    key,
    `${pageName} ${key} meta tag must use the ${attribute} attribute`
  )
  const value = matchingTags[0].attributes.content ?? ''
  assert.ok(value.trim(), `${pageName} ${key} must not be empty`)
  return value
}

export function namedMeta(html, key, pageName) {
  return exactMeta(html, 'name', key, pageName)
}

export function propertyMeta(html, key, pageName) {
  return exactMeta(html, 'property', key, pageName)
}

export function verifyBaiduSiteVerification(html) {
  assert.equal(
    namedMeta(html, 'baidu-site-verification', 'homepage'),
    'codeva-NviX9WP2zz',
    'homepage Baidu verification must equal codeva-NviX9WP2zz'
  )
}

function oneTitle(html, pageName) {
  const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)].map((match) =>
    decodeHtmlEntities(match[1].trim())
  )
  assert.equal(titles.length, 1, `${pageName} must emit exactly one title`)
  assert.ok(titles[0], `${pageName} title must not be empty`)
  return titles[0]
}

function countOpeningTags(html, name) {
  return (html.match(new RegExp(`<${name}(?:\\s|>)`, 'gi')) ?? []).length
}

export function jsonLdDocuments(html, pageName = 'page') {
  const documents = []
  const pattern = /<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi
  for (const match of html.matchAll(pattern)) {
    const openingTag = match[0].slice(0, match[0].indexOf('>') + 1)
    const attributes = parseAttributes(openingTag)
    if ((attributes.type ?? '').toLowerCase() !== 'application/ld+json') continue
    try {
      documents.push(JSON.parse(match[1]))
    } catch (error) {
      throw new Error(`${pageName} contains invalid JSON-LD: ${error.message}`)
    }
  }
  return documents
}

function expectedBreadcrumbItems(tool) {
  const categoryLabel = categoryLabels[tool.category]
  return [
    {
      '@type': 'ListItem',
      position: 1,
      name: '首页',
      item: `${siteOrigin}/`
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: categoryLabel,
      item: `${siteOrigin}/ai-categories/${tool.category}`
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: tool.name,
      item: `${siteOrigin}/tools/${tool.slug}`
    }
  ]
}

export function verifyToolStructuredData(html, tool) {
  const pageName = tool.name
  const documents = jsonLdDocuments(html, pageName)
  assert.equal(documents.length, 1, `${pageName} must emit exactly one JSON-LD document`)
  const document = documents[0]
  assert.equal(document?.['@context'], 'https://schema.org', `${pageName} JSON-LD context is invalid`)
  assert.ok(Array.isArray(document?.['@graph']), `${pageName} JSON-LD must contain an @graph`)
  const applications = document['@graph'].filter((item) => item?.['@type'] === 'SoftwareApplication')
  const breadcrumbGraphs = document['@graph'].filter((item) => item?.['@type'] === 'BreadcrumbList')
  assert.equal(applications.length, 1, `${pageName} must emit exactly one SoftwareApplication`)
  assert.equal(breadcrumbGraphs.length, 1, `${pageName} must emit exactly one BreadcrumbList`)

  const application = applications[0]
  assert.equal(application.name, tool.name, `${pageName} structured name must match the catalog`)
  assert.equal(
    application.url,
    `${siteOrigin}/tools/${tool.slug}`,
    `${pageName} structured canonical URL must match its route`
  )
  assert.equal(
    application.applicationCategory,
    categoryLabels[tool.category],
    `${pageName} structured application category must match the catalog`
  )
  assert.deepEqual(
    application.operatingSystem,
    tool.accessModes.map((mode) => accessModeLabels[mode]),
    `${pageName} structured operating-system labels must match access modes`
  )
  if (tool.pricingMode === 'free') {
    assert.deepEqual(
      application.offers,
      { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      `${pageName} free offer must declare only a zero USD price`
    )
  } else {
    assert.ok(!Object.hasOwn(application, 'offers'), `${pageName} must not invent an offer or price`)
  }

  const breadcrumbs = breadcrumbGraphs[0]
  assert.deepEqual(
    breadcrumbs.itemListElement,
    expectedBreadcrumbItems(tool),
    `${pageName} structured breadcrumbs must match the tool route`
  )
  return { application, breadcrumbs }
}

export function verifyCategoryStructuredData(html, category, tools) {
  const pageName = `${category} category`
  const itemLists = jsonLdDocuments(html, pageName).filter((item) => item?.['@type'] === 'ItemList')
  assert.equal(itemLists.length, 1, `${pageName} must emit exactly one ItemList`)
  const expected = tools.map((tool, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: tool.name,
    url: `${siteOrigin}/tools/${tool.slug}`
  }))
  assert.deepEqual(
    itemLists[0].itemListElement,
    expected,
    `${pageName} ItemList positions and order must match the rendered catalog order`
  )
  return itemLists[0]
}

export function verifyToolHtml(html, tool, imageUrl = socialImageUrl) {
  const pageName = tool.name
  assert.equal(countOpeningTags(html, 'main'), 1, `${pageName} must contain exactly one <main>`)
  assert.equal(countOpeningTags(html, 'h1'), 1, `${pageName} must contain exactly one <h1>`)

  const title = oneTitle(html, pageName)
  assert.ok(title.includes(pageName), `${pageName} title must identify the tool`)
  const description = namedMeta(html, 'description', pageName)
  assert.equal(description, tool.description, `${pageName} description must match the catalog`)

  assert.equal(propertyMeta(html, 'og:title', pageName), title)
  assert.equal(propertyMeta(html, 'og:description', pageName), description)
  assert.equal(namedMeta(html, 'twitter:title', pageName), title)
  assert.equal(namedMeta(html, 'twitter:description', pageName), description)
  assert.equal(propertyMeta(html, 'og:image', pageName), imageUrl)
  assert.equal(namedMeta(html, 'twitter:image', pageName), imageUrl)

  const officialLinks = tags(html, 'a').filter(({ attributes }) =>
    (attributes.class ?? '').split(/\s+/).includes('official-link')
  )
  assert.equal(officialLinks.length, 1, `${pageName} must contain exactly one official link`)
  const officialAttributes = officialLinks[0].attributes
  assert.equal(officialAttributes.href, tool.url, `${pageName} official link must match the catalog`)
  assert.match(officialAttributes.href, /^https:\/\//, `${pageName} official link must use HTTPS`)
  assert.equal(officialAttributes.target, '_blank', `${pageName} official link must open in a new tab`)
  const relTokens = new Set((officialAttributes.rel ?? '').split(/\s+/))
  assert.ok(relTokens.has('noopener'), `${pageName} official link rel must include noopener`)
  assert.ok(relTokens.has('noreferrer'), `${pageName} official link rel must include noreferrer`)

  const factsSection = html.match(
    /<section\b(?=[^>]*\bclass=(?:"[^"]*\btool-facts\b[^"]*"|'[^']*\btool-facts\b[^']*'))[^>]*>([\s\S]*?)<\/section>/i
  )
  assert.ok(factsSection, `${pageName} must render its fact panel`)
  assert.equal(
    countOpeningTags(factsSection[1], 'div'),
    4,
    `${pageName} fact panel must contain exactly four facts`
  )
  const verificationDate = tool.updatedAt.replaceAll('-', '.')
  assert.ok(
    html.includes(`最后核验 ${verificationDate}`),
    `${pageName} must render 最后核验 ${verificationDate}`
  )

  verifyToolStructuredData(html, tool)

  return { title, description }
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
  }
  return value >>> 0
})

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

export function validatePng(png, expectedWidth = 1200, expectedHeight = 630) {
  assert.ok(Buffer.isBuffer(png), 'PNG input must be a Buffer')
  assert.ok(png.length >= pngSignature.length, 'PNG is truncated before its signature')
  assert.ok(png.subarray(0, 8).equals(pngSignature), 'PNG has an invalid signature')

  let offset = 8
  let chunkIndex = 0
  let foundIend = false
  let image
  const idatParts = []
  let idatSequenceEnded = false

  while (offset < png.length) {
    assert.ok(offset + 8 <= png.length, `PNG has a truncated chunk header at byte ${offset}`)
    const length = png.readUInt32BE(offset)
    const typeStart = offset + 4
    const dataStart = offset + 8
    const crcOffset = dataStart + length
    const chunkEnd = crcOffset + 4
    assert.ok(chunkEnd <= png.length, `PNG chunk at byte ${offset} is truncated`)

    const type = png.subarray(typeStart, dataStart).toString('ascii')
    assert.match(type, /^[A-Za-z]{4}$/, `PNG has an invalid chunk type at byte ${offset}`)
    const expectedCrc = png.readUInt32BE(crcOffset)
    const actualCrc = crc32(png.subarray(typeStart, crcOffset))
    assert.equal(actualCrc, expectedCrc, `PNG ${type} chunk has an invalid CRC`)

    if (chunkIndex === 0) {
      assert.equal(type, 'IHDR', 'PNG first chunk must be IHDR')
      assert.equal(length, 13, 'PNG IHDR chunk must contain 13 bytes')
      const width = png.readUInt32BE(dataStart)
      const height = png.readUInt32BE(dataStart + 4)
      const bitDepth = png[dataStart + 8]
      const colorType = png[dataStart + 9]
      const interlace = png[dataStart + 12]
      const validDepths = {
        0: [1, 2, 4, 8, 16],
        2: [8, 16],
        4: [8, 16],
        6: [8, 16]
      }
      const channelsByColorType = { 0: 1, 2: 3, 4: 2, 6: 4 }
      assert.ok(width > 0 && height > 0, 'PNG dimensions must be positive')
      assert.equal(width, expectedWidth, `PNG width must be ${expectedWidth} pixels`)
      assert.equal(height, expectedHeight, `PNG height must be ${expectedHeight} pixels`)
      assert.ok(
        Object.hasOwn(channelsByColorType, colorType),
        `PNG color type ${colorType} is unsupported for scanline verification`
      )
      assert.ok(validDepths[colorType]?.includes(bitDepth), 'PNG bit depth/color type is invalid')
      assert.equal(png[dataStart + 10], 0, 'PNG compression method must be 0')
      assert.equal(png[dataStart + 11], 0, 'PNG filter method must be 0')
      assert.equal(interlace, 0, 'PNG must be non-interlaced for scanline verification')
      const channels = channelsByColorType[colorType]
      const bitsPerPixel = channels * bitDepth
      const bytesPerPixel = Math.max(1, Math.ceil(bitsPerPixel / 8))
      const rowBytes = Math.ceil((width * bitsPerPixel) / 8)
      image = { width, height, bitDepth, colorType, channels, bytesPerPixel, rowBytes }
    } else {
      assert.notEqual(type, 'IHDR', 'PNG must contain exactly one IHDR chunk')
    }

    const knownCriticalChunks = new Set(['IHDR', 'PLTE', 'IDAT', 'IEND'])
    if (type[0] === type[0].toUpperCase()) {
      assert.ok(knownCriticalChunks.has(type), `PNG contains unknown critical chunk ${type}`)
    }
    if (type === 'PLTE') {
      assert.equal(idatParts.length, 0, 'PNG PLTE chunk must precede IDAT chunks')
    }
    if (type === 'IDAT') {
      assert.ok(!idatSequenceEnded, 'PNG IDAT chunks must be consecutive')
      idatParts.push(png.subarray(dataStart, crcOffset))
    } else if (idatParts.length > 0) {
      idatSequenceEnded = true
    }
    if (type === 'IEND') {
      assert.ok(idatParts.length > 0, 'PNG IEND chunk must follow IDAT chunks')
      assert.equal(length, 0, 'PNG IEND chunk must be empty')
      assert.equal(chunkEnd, png.length, 'PNG must end exactly after IEND')
      foundIend = true
    }

    offset = chunkEnd
    chunkIndex += 1
  }

  assert.ok(image, 'PNG is missing IHDR')
  assert.ok(idatParts.length > 0, 'PNG is missing IDAT')
  assert.ok(foundIend, 'PNG is missing IEND')
  const compressedImage = Buffer.concat(idatParts)
  assert.ok(compressedImage.length > 0, 'PNG IDAT payload must not be empty')
  const expectedScanlineLength = image.height * (1 + image.rowBytes)
  let inflation
  try {
    inflation = inflateSync(compressedImage, {
      maxOutputLength: expectedScanlineLength + 1,
      info: true
    })
  } catch (error) {
    throw new Error(`PNG IDAT zlib stream could not be inflated: ${error.message}`)
  }
  assert.equal(
    inflation.engine.bytesWritten,
    compressedImage.length,
    'PNG IDAT payload must contain exactly one fully consumed zlib stream with no trailing data'
  )
  const scanlines = inflation.buffer
  assert.equal(
    scanlines.length,
    expectedScanlineLength,
    `PNG decompressed scanlines must contain exactly ${expectedScanlineLength} bytes`
  )
  for (let row = 0; row < image.height; row += 1) {
    const filter = scanlines[row * (image.rowBytes + 1)]
    assert.ok(filter <= 4, `PNG scanline ${row} has invalid filter byte ${filter}`)
  }
  return image
}

export function sitemapPathSet(xml, expectedOrigin = 'https://no996noicu.com') {
  const paths = new Set()
  const locations = [...xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)]
  for (const match of locations) {
    const value = decodeHtmlEntities(match[1].trim())
    const url = new URL(value)
    assert.equal(url.protocol, 'https:', `sitemap location must use HTTPS: ${value}`)
    assert.equal(url.origin, expectedOrigin, `sitemap location has unexpected origin: ${value}`)
    assert.equal(url.search, '', `sitemap location must not contain a query string: ${value}`)
    assert.equal(url.hash, '', `sitemap location must not contain a fragment: ${value}`)
    assert.ok(!paths.has(url.pathname), `sitemap contains duplicate path ${url.pathname}`)
    paths.add(url.pathname)
  }
  return paths
}

function artifactPath(distDir, route) {
  const directFile = join(distDir, `${route}.html`)
  const indexFile = join(distDir, route, 'index.html')
  if (existsSync(directFile)) return directFile
  if (existsSync(indexFile)) return indexFile
  throw new Error(`missing HTML artifact for /${route}`)
}

export function runVerification(root = defaultRoot) {
  const docsDir = join(root, 'docs')
  const distDir = join(docsDir, '.vitepress', 'dist')
  const failures = []
  const results = {}

  function check(label, assertion) {
    try {
      assertion()
      console.log(`✓ ${label}`)
    } catch (error) {
      failures.push({ label, error })
      console.error(`✗ ${label}: ${error.message}`)
    }
  }

  const tools = JSON.parse(
    readFileSync(join(docsDir, '.vitepress', 'theme', 'domain', 'ai-tools.json'), 'utf8')
  )
  const scenarioDefinitions = JSON.parse(
    readFileSync(join(docsDir, '.vitepress', 'theme', 'domain', 'ai-scenarios.json'), 'utf8')
  )
  const categorySlugs = [...new Set(tools.map((tool) => tool.category))]
  const scenarioSlugs = scenarioDefinitions.map((scenario) => scenario.slug)
  const expectedToolArtifacts = new Set([
    '/tools',
    ...tools.map((tool) => `/tools/${tool.slug}`)
  ])
  const expectedCategoryArtifacts = new Set([
    '/ai-categories',
    ...categorySlugs.map((slug) => `/ai-categories/${slug}`)
  ])
  const expectedScenarioArtifacts = new Set([
    '/ai-scenarios',
    ...scenarioSlugs.map((slug) => `/ai-scenarios/${slug}`)
  ])

  check('VitePress production output exists', () => {
    assert.ok(existsSync(distDir), 'run npm run docs:build before this verifier')
    assert.ok(statSync(distDir).isDirectory(), 'VitePress dist path is not a directory')
  })

  check('production output contains the exact tool HTML route set', () => {
    const actual = artifactRouteSet(join(distDir, 'tools'), '/tools')
    assertExactSet(actual, expectedToolArtifacts, 'tool HTML artifacts')
    results.toolArtifacts = actual.size
  })

  check('production output contains the exact category HTML route set', () => {
    const actual = artifactRouteSet(join(distDir, 'ai-categories'), '/ai-categories')
    assertExactSet(actual, expectedCategoryArtifacts, 'category HTML artifacts')
    results.categoryArtifacts = actual.size
  })

  check('production output contains the exact scenario HTML route set', () => {
    const actual = artifactRouteSet(join(distDir, 'ai-scenarios'), '/ai-scenarios')
    assertExactSet(actual, expectedScenarioArtifacts, 'scenario HTML artifacts')
    results.scenarioArtifacts = actual.size
  })

  check('sitemap contains exact tool/category/scenario route sets and excludes archived content', () => {
    const paths = sitemapPathSet(readFileSync(join(distDir, 'sitemap.xml'), 'utf8'))
    const actualToolPaths = new Set(
      [...paths].filter((path) => path === '/tools/' || path.startsWith('/tools/'))
    )
    const actualCategoryPaths = new Set(
      [...paths].filter(
        (path) => path === '/ai-categories/' || path.startsWith('/ai-categories/')
      )
    )
    const actualScenarioPaths = new Set(
      [...paths].filter(
        (path) => path === '/ai-scenarios/' || path.startsWith('/ai-scenarios/')
      )
    )
    assertExactSet(
      actualToolPaths,
      new Set(['/tools/', ...tools.map((tool) => `/tools/${tool.slug}`)]),
      'sitemap tool routes'
    )
    assertExactSet(
      actualCategoryPaths,
      new Set(['/ai-categories/', ...categorySlugs.map((slug) => `/ai-categories/${slug}`)]),
      'sitemap category routes'
    )
    assertExactSet(
      actualScenarioPaths,
      new Set(['/ai-scenarios/', ...scenarioSlugs.map((slug) => `/ai-scenarios/${slug}`)]),
      'sitemap scenario routes'
    )

    const excludedPrefixes = [
      '/categories/',
      '/classic-works/',
      '/cultivation-system/',
      '/culture/',
      '/en/',
      '/glossary/',
      '/rmji/'
    ]
    for (const path of paths) {
      assert.ok(
        !excludedPrefixes.some((prefix) => path === prefix.slice(0, -1) || path.startsWith(prefix)),
        `sitemap contains excluded path ${path}`
      )
      assert.doesNotMatch(path, /cultivation|archive/i, `sitemap contains excluded keyword: ${path}`)
    }
  })

  check('archived content directories are absent from production output', () => {
    const excludedDirectories = [
      'categories',
      'classic-works',
      'cultivation-system',
      'culture',
      'en',
      'glossary',
      'rmji'
    ]
    excludedDirectories.forEach((directory) =>
      assert.ok(!existsSync(join(distDir, directory)), `dist contains excluded directory ${directory}`)
    )
  })

  check('source and built social-card.png are identical valid 1200×630 PNGs', () => {
    const source = readFileSync(join(docsDir, 'public', 'social-card.png'))
    const built = readFileSync(join(distDir, 'social-card.png'))
    validatePng(source)
    validatePng(built)
    assert.ok(source.equals(built), 'built social-card.png differs from the public source asset')
  })

  check('source and built social-card.svg use evergreen directory copy', () => {
    const source = readFileSync(join(docsDir, 'public', 'social-card.svg'), 'utf8')
    const built = readFileSync(join(distDir, 'social-card.svg'), 'utf8')
    assert.equal(built, source, 'built social-card.svg differs from the public source asset')
    assert.match(source, /精选\s*AI\s*工具\s*·\s*9\s*大使用场景/i)
    assert.doesNotMatch(source, /24\+\s*款工具|6\s*大使用场景/)
  })

  check('all tool pages emit unique tool-specific SEO, facts, and safe official links', () => {
    const titles = new Set()
    const descriptions = new Set()
    for (const tool of tools) {
      const html = readFileSync(artifactPath(distDir, `tools/${tool.slug}`), 'utf8')
      const verified = verifyToolHtml(html, tool)
      titles.add(verified.title)
      descriptions.add(verified.description)
    }
    assert.equal(titles.size, tools.length, 'all tool page titles must be globally unique')
    assert.equal(descriptions.size, tools.length, 'all tool descriptions must be globally unique')
    results.toolPagesVerified = tools.length
  })

  check('all category pages emit ordered ItemList structured data', () => {
    for (const category of categorySlugs) {
      const html = readFileSync(artifactPath(distDir, `ai-categories/${category}`), 'utf8')
      verifyCategoryStructuredData(
        html,
        category,
        tools.filter((tool) => tool.category === category)
      )
    }
  })

  check('all scenario pages emit ordered ItemList structured data', () => {
    for (const scenario of scenarioDefinitions) {
      const html = readFileSync(artifactPath(distDir, `ai-scenarios/${scenario.slug}`), 'utf8')
      const scenarioTools = tools.filter((tool) => {
        const content = [
          tool.name,
          tool.tagline,
          tool.description,
          ...tool.bestFor,
          ...tool.features,
          ...tool.tags,
          ...tool.searchTerms
        ].join(' ').toLowerCase()
        return scenario.keywords.some((keyword) => content.includes(keyword.toLowerCase()))
      })
      verifyCategoryStructuredData(html, scenario.slug, scenarioTools)
    }
  })

  check('homepage SSR reflects the current catalog and emitted CSS', () => {
    const html = readFileSync(artifactPath(distDir, 'index'), 'utf8')
    verifyBaiduSiteVerification(html)
    assert.match(html, new RegExp(`${tools.length}\\+\\s*款工具\\s*·\\s*9\\s*大使用场景`))
    assert.doesNotMatch(html, /24\+\s*款工具|6\s*大使用场景/)

    const stylesheets = tags(html, 'link').filter(({ attributes }) =>
      (attributes.rel ?? '').split(/\s+/).includes('stylesheet')
    )
    assert.ok(stylesheets.length > 0, 'homepage must link at least one stylesheet')
    let nonemptyStylesheets = 0
    stylesheets.forEach(({ attributes }) => {
      const href = (attributes.href ?? '').split(/[?#]/, 1)[0]
      assert.ok(href.startsWith('/'), `stylesheet URL must be site-absolute: ${href}`)
      const cssPath = resolve(distDir, href.slice(1))
      assert.ok(cssPath.startsWith(`${distDir}${sep}`), `stylesheet leaves dist: ${href}`)
      assert.ok(existsSync(cssPath), `emitted stylesheet is missing: ${href}`)
      if (statSync(cssPath).size > 0) nonemptyStylesheets += 1
    })
    assert.ok(nonemptyStylesheets > 0, 'homepage must link at least one nonempty emitted stylesheet')
  })

  check('generated Markdown and manifest match the production data set', () => {
    assertCatalogGrowthPolicy(tools)
    assert.equal(categorySlugs.length, 9, 'production data must contain 9 categories')
    const expected = [
      ...tools.map((tool) => `docs/tools/${tool.slug}.md`),
      ...categorySlugs.map((category) => `docs/ai-categories/${category}.md`),
      ...scenarioSlugs.map((scenario) => `docs/ai-scenarios/${scenario}.md`),
      'docs/tools/index.md',
      'docs/ai-categories/index.md',
      'docs/ai-scenarios/index.md'
    ]
    const manifest = JSON.parse(
      readFileSync(join(docsDir, '.vitepress', 'ai-pages-manifest.json'), 'utf8')
    )
    assert.deepEqual(manifest, expected, 'AI page manifest is not synchronized with production data')
    assert.equal(new Set(manifest).size, manifest.length, 'AI page manifest contains duplicates')
    manifest.forEach((path) => assert.ok(existsSync(join(root, path)), `manifest file is missing: ${path}`))

    const generatedMarkdown = [
      ...walkFiles(join(docsDir, 'tools')),
      ...walkFiles(join(docsDir, 'ai-categories')),
      ...walkFiles(join(docsDir, 'ai-scenarios'))
    ].map((path) => relative(root, path).split(sep).join('/'))
    assert.deepEqual(sorted(generatedMarkdown), sorted(expected), 'generated Markdown set is out of sync')
  })

  console.log(
    `Artifact counts: tools=${results.toolArtifacts ?? 'unknown'}, categories=${results.categoryArtifacts ?? 'unknown'}, scenarios=${results.scenarioArtifacts ?? 'unknown'}; tool pages verified=${results.toolPagesVerified ?? 'unknown'}`
  )

  if (failures.length > 0) {
    console.error(`\nAI production artifact verification failed (${failures.length} check(s)).`)
    return false
  }
  console.log('\nAI production artifact verification passed.')
  return true
}

if (process.argv[1] && pathsEqual(process.argv[1], scriptPath)) {
  if (!runVerification()) process.exitCode = 1
}
