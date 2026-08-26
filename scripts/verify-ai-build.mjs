import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptPath = fileURLToPath(import.meta.url)
const defaultRoot = resolve(dirname(scriptPath), '..')
const socialImageUrl = 'https://no996noicu.com/social-card.png'
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

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
    attributes[match[1].toLowerCase()] = decodeHtmlEntities(
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
  let foundIdat = false
  let foundIend = false
  let image

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
      const validDepths = {
        0: [1, 2, 4, 8, 16],
        2: [8, 16],
        3: [1, 2, 4, 8],
        4: [8, 16],
        6: [8, 16]
      }
      assert.ok(width > 0 && height > 0, 'PNG dimensions must be positive')
      assert.equal(width, expectedWidth, `PNG width must be ${expectedWidth} pixels`)
      assert.equal(height, expectedHeight, `PNG height must be ${expectedHeight} pixels`)
      assert.ok(validDepths[colorType]?.includes(bitDepth), 'PNG bit depth/color type is invalid')
      assert.equal(png[dataStart + 10], 0, 'PNG compression method must be 0')
      assert.equal(png[dataStart + 11], 0, 'PNG filter method must be 0')
      assert.ok([0, 1].includes(png[dataStart + 12]), 'PNG interlace method must be 0 or 1')
      image = { width, height, bitDepth, colorType }
    } else {
      assert.notEqual(type, 'IHDR', 'PNG must contain exactly one IHDR chunk')
    }

    if (type === 'IDAT') foundIdat = true
    if (type === 'IEND') {
      assert.equal(length, 0, 'PNG IEND chunk must be empty')
      assert.equal(chunkEnd, png.length, 'PNG must end exactly after IEND')
      foundIend = true
    }

    offset = chunkEnd
    chunkIndex += 1
  }

  assert.ok(image, 'PNG is missing IHDR')
  assert.ok(foundIdat, 'PNG is missing IDAT')
  assert.ok(foundIend, 'PNG is missing IEND')
  return image
}

export function sitemapPathSet(xml) {
  const paths = new Set()
  const locations = [...xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)]
  for (const match of locations) {
    const value = decodeHtmlEntities(match[1].trim())
    const url = new URL(value)
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
  const categorySlugs = [...new Set(tools.map((tool) => tool.category))]
  const expectedToolArtifacts = new Set([
    '/tools',
    ...tools.map((tool) => `/tools/${tool.slug}`)
  ])
  const expectedCategoryArtifacts = new Set([
    '/ai-categories',
    ...categorySlugs.map((slug) => `/ai-categories/${slug}`)
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

  check('sitemap contains exact tool/category route sets and excludes archived content', () => {
    const paths = sitemapPathSet(readFileSync(join(distDir, 'sitemap.xml'), 'utf8'))
    const actualToolPaths = new Set(
      [...paths].filter((path) => path === '/tools/' || path.startsWith('/tools/'))
    )
    const actualCategoryPaths = new Set(
      [...paths].filter(
        (path) => path === '/ai-categories/' || path.startsWith('/ai-categories/')
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

  check('source and built social-card.svg match the launch scale', () => {
    const source = readFileSync(join(docsDir, 'public', 'social-card.svg'), 'utf8')
    const built = readFileSync(join(distDir, 'social-card.svg'), 'utf8')
    assert.equal(built, source, 'built social-card.svg differs from the public source asset')
    assert.match(source, /63\+\s*款工具\s*·\s*9\s*大使用场景/)
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

  check('homepage SSR reflects launch scale and emitted CSS', () => {
    const html = readFileSync(artifactPath(distDir, 'index'), 'utf8')
    assert.match(html, /63\+\s*款工具\s*·\s*9\s*大使用场景/)
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
    assert.equal(tools.length, 63, 'production data must contain 63 tools')
    assert.equal(categorySlugs.length, 9, 'production data must contain 9 categories')
    const expected = [
      ...tools.map((tool) => `docs/tools/${tool.slug}.md`),
      ...categorySlugs.map((category) => `docs/ai-categories/${category}.md`),
      'docs/tools/index.md',
      'docs/ai-categories/index.md'
    ]
    const manifest = JSON.parse(
      readFileSync(join(docsDir, '.vitepress', 'ai-pages-manifest.json'), 'utf8')
    )
    assert.deepEqual(manifest, expected, 'AI page manifest is not synchronized with production data')
    assert.equal(new Set(manifest).size, manifest.length, 'AI page manifest contains duplicates')
    manifest.forEach((path) => assert.ok(existsSync(join(root, path)), `manifest file is missing: ${path}`))

    const generatedMarkdown = [
      ...walkFiles(join(docsDir, 'tools')),
      ...walkFiles(join(docsDir, 'ai-categories'))
    ].map((path) => relative(root, path).split(sep).join('/'))
    assert.deepEqual(sorted(generatedMarkdown), sorted(expected), 'generated Markdown set is out of sync')
  })

  console.log(
    `Artifact counts: tools=${results.toolArtifacts ?? 'unknown'}, categories=${results.categoryArtifacts ?? 'unknown'}; tool pages verified=${results.toolPagesVerified ?? 'unknown'}`
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
