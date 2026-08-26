import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const docsDir = join(root, 'docs')
const distDir = join(docsDir, '.vitepress', 'dist')
const socialImageUrl = 'https://no996noicu.com/social-card.png'
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

function walkFiles(directory) {
  if (!existsSync(directory)) return []

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? walkFiles(path) : [path]
  })
}

function htmlArtifacts(directory) {
  return walkFiles(directory).filter((path) => path.toLowerCase().endsWith('.html'))
}

function artifactPath(route) {
  const directFile = join(distDir, `${route}.html`)
  const indexFile = join(distDir, route, 'index.html')
  if (existsSync(directFile)) return directFile
  if (existsSync(indexFile)) return indexFile
  throw new Error(`missing HTML artifact for /${route}`)
}

function parseAttributes(tag) {
  const attributes = {}
  const attributePattern = /\s([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  for (const match of tag.matchAll(attributePattern)) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? ''
  }
  return attributes
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map((match) => ({
    source: match[0],
    attributes: parseAttributes(match[0])
  }))
}

function metaValues(html, key) {
  return tags(html, 'meta')
    .filter(({ attributes }) => attributes.name === key || attributes.property === key)
    .map(({ attributes }) => attributes.content ?? '')
}

function oneMeta(html, key, pageName) {
  const values = metaValues(html, key)
  assert.equal(values.length, 1, `${pageName} must emit exactly one ${key} meta tag`)
  assert.ok(values[0].trim(), `${pageName} ${key} must not be empty`)
  return values[0]
}

function oneTitle(html, pageName) {
  const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)].map((match) => match[1].trim())
  assert.equal(titles.length, 1, `${pageName} must emit exactly one title`)
  assert.ok(titles[0], `${pageName} title must not be empty`)
  return titles[0]
}

function countOpeningTags(html, name) {
  return (html.match(new RegExp(`<${name}(?:\\s|>)`, 'gi')) ?? []).length
}

function verifyToolPage(route, toolName) {
  const html = readFileSync(artifactPath(route), 'utf8')
  assert.equal(countOpeningTags(html, 'main'), 1, `${toolName} must contain exactly one <main>`)
  assert.equal(countOpeningTags(html, 'h1'), 1, `${toolName} must contain exactly one <h1>`)

  const title = oneTitle(html, toolName)
  assert.ok(title.includes(toolName), `${toolName} title must identify the tool`)

  const description = oneMeta(html, 'description', toolName)
  const ogTitle = oneMeta(html, 'og:title', toolName)
  const ogDescription = oneMeta(html, 'og:description', toolName)
  const twitterTitle = oneMeta(html, 'twitter:title', toolName)
  const twitterDescription = oneMeta(html, 'twitter:description', toolName)
  assert.equal(ogTitle, title, `${toolName} og:title must match the page title`)
  assert.equal(twitterTitle, title, `${toolName} twitter:title must match the page title`)
  assert.equal(ogDescription, description, `${toolName} og:description must match the page description`)
  assert.equal(
    twitterDescription,
    description,
    `${toolName} twitter:description must match the page description`
  )
  assert.equal(oneMeta(html, 'og:image', toolName), socialImageUrl)
  assert.equal(oneMeta(html, 'twitter:image', toolName), socialImageUrl)

  const officialLinks = tags(html, 'a').filter(({ attributes }) =>
    (attributes.class ?? '').split(/\s+/).includes('official-link')
  )
  assert.equal(officialLinks.length, 1, `${toolName} must contain exactly one official link`)
  const officialAttributes = officialLinks[0].attributes
  assert.match(officialAttributes.href ?? '', /^https:\/\//, `${toolName} official link must use HTTPS`)
  assert.equal(officialAttributes.target, '_blank', `${toolName} official link must open in a new tab`)
  const relTokens = new Set((officialAttributes.rel ?? '').split(/\s+/))
  assert.ok(relTokens.has('noopener'), `${toolName} official link rel must include noopener`)
  assert.ok(relTokens.has('noreferrer'), `${toolName} official link rel must include noreferrer`)

  assert.match(html, /class="tool-facts"/, `${toolName} must render its fact panel`)
  assert.match(html, /最后核验\s*\d{4}\.\d{2}\.\d{2}/, `${toolName} must render its verification date`)

  return { title, description }
}

function verifyPng(path) {
  const png = readFileSync(path)
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  assert.ok(png.subarray(0, 8).equals(signature), `${relative(root, path)} has an invalid PNG signature`)
  assert.equal(png.subarray(12, 16).toString('ascii'), 'IHDR', 'PNG must begin with an IHDR chunk')
  assert.equal(png.readUInt32BE(16), 1200, 'PNG width must be 1200 pixels')
  assert.equal(png.readUInt32BE(20), 630, 'PNG height must be 630 pixels')
  return png
}

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right, 'en'))
}

check('VitePress production output exists', () => {
  assert.ok(existsSync(distDir), 'run npm run docs:build before this verifier')
  assert.ok(statSync(distDir).isDirectory(), 'VitePress dist path is not a directory')
})

check('production output contains 64 tool HTML artifacts', () => {
  results.toolArtifacts = htmlArtifacts(join(distDir, 'tools')).length
  assert.equal(results.toolArtifacts, 64)
})

check('production output contains 10 category HTML artifacts', () => {
  results.categoryArtifacts = htmlArtifacts(join(distDir, 'ai-categories')).length
  assert.equal(results.categoryArtifacts, 10)
})

check('sitemap contains launch routes and excludes archived content', () => {
  const sitemap = readFileSync(join(distDir, 'sitemap.xml'), 'utf8')
  const requiredRoutes = [
    '/tools/chatgpt',
    '/tools/julius-ai',
    '/ai-categories/marketing',
    '/ai-categories/automation'
  ]
  requiredRoutes.forEach((route) => assert.ok(sitemap.includes(route), `sitemap is missing ${route}`))

  const excludedRoutes = [
    '/categories/',
    '/classic-works/',
    '/cultivation-system/',
    '/culture/',
    '/en/',
    '/glossary/',
    '/rmji/'
  ]
  excludedRoutes.forEach((route) =>
    assert.ok(!sitemap.includes(route), `sitemap contains excluded route ${route}`)
  )
  assert.doesNotMatch(sitemap, /cultivation|archive/i, 'sitemap contains an excluded keyword')
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

check('social-card.png is a copied 1200×630 PNG', () => {
  const source = verifyPng(join(docsDir, 'public', 'social-card.png'))
  const built = verifyPng(join(distDir, 'social-card.png'))
  assert.ok(source.equals(built), 'built social-card.png differs from the public source asset')
})

check('social-card.svg advertises 63+ tools and 9 scenarios', () => {
  const svg = readFileSync(join(docsDir, 'public', 'social-card.svg'), 'utf8')
  assert.match(svg, /63\+\s*款工具\s*·\s*9\s*大使用场景/)
  assert.doesNotMatch(svg, /24\+\s*款工具|6\s*大使用场景/)
})

check('ChatGPT and Claude emit unique, tool-specific SEO and safe official links', () => {
  const chatgpt = verifyToolPage('tools/chatgpt', 'ChatGPT')
  const claude = verifyToolPage('tools/claude', 'Claude')
  assert.notEqual(chatgpt.title, claude.title, 'tool page titles must be unique')
  assert.notEqual(chatgpt.description, claude.description, 'tool descriptions must be unique')
})

check('homepage SSR reflects launch scale and emitted CSS', () => {
  const html = readFileSync(artifactPath('index'), 'utf8')
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
  const tools = JSON.parse(
    readFileSync(join(docsDir, '.vitepress', 'theme', 'domain', 'ai-tools.json'), 'utf8')
  )
  assert.equal(tools.length, 63, 'production data must contain 63 tools')
  const categories = [...new Set(tools.map((tool) => tool.category))]
  assert.equal(categories.length, 9, 'production data must contain 9 categories')

  const expected = [
    ...tools.map((tool) => `docs/tools/${tool.slug}.md`),
    ...categories.map((category) => `docs/ai-categories/${category}.md`),
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
  `Artifact counts: tools=${results.toolArtifacts ?? 'unknown'}, categories=${results.categoryArtifacts ?? 'unknown'}`
)

if (failures.length > 0) {
  console.error(`\nAI production artifact verification failed (${failures.length} check(s)).`)
  process.exitCode = 1
} else {
  console.log('\nAI production artifact verification passed.')
}
