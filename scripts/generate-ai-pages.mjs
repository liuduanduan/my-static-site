import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptPath = fileURLToPath(import.meta.url)
const root = resolve(dirname(scriptPath), '..')
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
const requiredCategories = Object.keys(categoryLabels)
const pricingModes = ['free', 'freemium', 'paid', 'contact']
const chineseSupportModes = ['native', 'partial', 'none']
const accessModes = ['web', 'desktop', 'mobile', 'api', 'extension']
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const datePattern = /^\d{4}-\d{2}-\d{2}$/
const chineseCharacterPattern = /[\u3400-\u4DBF\u4E00-\u9FFF]/u

function fail(message) {
  throw new Error(`Invalid AI tool collection: ${message}`)
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requireString(record, field, context) {
  const value = record[field]
  if (typeof value !== 'string' || value.trim() === '') {
    fail(`${context}.${field} must be a non-empty string`)
  }
  return value
}

function requireStringList(record, field, context, minimum = 1) {
  const value = record[field]
  if (
    !Array.isArray(value) ||
    value.length < minimum ||
    value.some((item) => typeof item !== 'string' || item.trim() === '')
  ) {
    fail(`${context}.${field} must contain at least ${minimum} non-empty string(s)`)
  }
  return value
}

function requireEnum(value, allowed, field, context) {
  if (typeof value !== 'string' || !allowed.includes(value)) {
    fail(`${context}.${field} contains unknown value ${String(value)}`)
  }
  return value
}

function requireDate(record, field, context) {
  const value = requireString(record, field, context)
  if (!datePattern.test(value)) fail(`${context}.${field} must use YYYY-MM-DD`)

  const parsed = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    fail(`${context}.${field} is not a valid calendar date`)
  }
  return value
}

export function isWithin(path, parent) {
  const resolvedPath = resolve(path)
  const resolvedParent = resolve(parent)
  return resolvedPath === resolvedParent || resolvedPath.startsWith(`${resolvedParent}${sep}`)
}

export function validateTools(items) {
  if (!Array.isArray(items)) fail('expected an array')
  if (items.length < 60) fail('must contain at least 60 tools')

  const seenSlugs = new Set()
  const seenFeaturedOrders = new Set()
  const categoryCounts = new Map(requiredCategories.map((category) => [category, 0]))

  items.forEach((candidate, index) => {
    const context = `tool[${index}]`
    if (!isRecord(candidate)) fail(`${context} must be an object`)

    const slug = requireString(candidate, 'slug', context)
    if (!slugPattern.test(slug)) fail(`${context}.slug is unsafe`)
    if (seenSlugs.has(slug)) fail(`duplicate slug ${slug}`)
    seenSlugs.add(slug)

    requireString(candidate, 'name', context)
    const category = requireEnum(candidate.category, requiredCategories, 'category', context)
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1)
    requireString(candidate, 'tagline', context)
    requireString(candidate, 'description', context)
    requireStringList(candidate, 'bestFor', context)
    requireStringList(candidate, 'features', context)
    requireString(candidate, 'pricing', context)
    requireEnum(candidate.pricingMode, pricingModes, 'pricingMode', context)
    requireEnum(candidate.chineseSupport, chineseSupportModes, 'chineseSupport', context)

    const toolAccessModes = requireStringList(candidate, 'accessModes', context)
    toolAccessModes.forEach((mode) => requireEnum(mode, accessModes, 'accessModes', context))
    if (new Set(toolAccessModes).size !== toolAccessModes.length) {
      fail(`${context}.accessModes must not contain duplicates`)
    }

    if (typeof candidate.requiresAccount !== 'boolean') {
      fail(`${context}.requiresAccount must be a boolean`)
    }

    const tags = requireStringList(candidate, 'tags', context, 2)
    if (tags.length > 5) fail(`${context}.tags must contain at most 5 strings`)

    const searchTerms = requireStringList(candidate, 'searchTerms', context, 2)
    if (searchTerms.some((term) => !chineseCharacterPattern.test(term))) {
      fail(`${context}.searchTerms entries must contain Chinese characters`)
    }

    requireStringList(candidate, 'pros', context)
    requireStringList(candidate, 'cons', context)

    const url = requireString(candidate, 'url', context)
    let parsedUrl
    try {
      parsedUrl = new URL(url)
    } catch {
      fail(`${context}.url must be a valid HTTPS URL`)
    }
    if (parsedUrl.protocol !== 'https:') fail(`${context}.url must use HTTPS`)

    requireDate(candidate, 'addedAt', context)
    requireDate(candidate, 'updatedAt', context)

    const alternatives = requireStringList(candidate, 'alternatives', context)
    if (alternatives.includes(slug)) {
      fail(`${context}.alternatives must not reference the tool itself`)
    }
    if (new Set(alternatives).size !== alternatives.length) {
      fail(`${context}.alternatives must not contain duplicates`)
    }

    if (candidate.featuredOrder !== undefined) {
      const order = candidate.featuredOrder
      if (typeof order !== 'number' || !Number.isInteger(order) || order <= 0) {
        fail(`${context}.featuredOrder must be a positive integer`)
      }
      if (seenFeaturedOrders.has(order)) fail(`duplicate featuredOrder ${order}`)
      seenFeaturedOrders.add(order)
    }
  })

  items.forEach((candidate, index) => {
    candidate.alternatives.forEach((alternative) => {
      if (!slugPattern.test(alternative) || !seenSlugs.has(alternative)) {
        fail(`tool[${index}].alternatives references unknown slug ${alternative}`)
      }
    })
  })

  requiredCategories.forEach((category) => {
    if ((categoryCounts.get(category) ?? 0) < 5) {
      fail(`category ${category} must contain at least five tools`)
    }
  })

  return items
}

function escapeFrontmatter(value) {
  return String(value).replaceAll('"', '\\"')
}

function ensureDirectory(path) {
  mkdirSync(path, { recursive: true })
}

function writePage(path, content) {
  ensureDirectory(dirname(path))
  writeFileSync(path, content, 'utf8')
}

function detailPage(tool) {
  return `---\ntitle: "${escapeFrontmatter(tool.name)} - AI 工具介绍"\ndescription: "${escapeFrontmatter(tool.description)}"\npageClass: ai-detail-page\n---\n\n<ToolDetail slug="${tool.slug}" />\n`
}

function categoryPage(category, items) {
  const label = categoryLabels[category]
  const links = items
    .map((tool) => `- [${tool.name}](/tools/${tool.slug})：${tool.tagline}`)
    .join('\n')

  return `---\ntitle: "${label} AI 工具"\ndescription: "寻器整理的${label} AI 工具，按真实使用场景选择合适产品。"\npageClass: ai-category-page\n---\n\n# ${label} AI 工具\n\n这一页收录适合${label}场景的 AI 工具。先看一句话结论，再进入详情页了解能力、价格和替代选项。\n\n## 工具列表\n\n${links}\n\n<p class="generated-page-note"><a href="/">← 返回全部工具</a></p>\n`
}

function readPreviousManifest(manifestPath) {
  if (!existsSync(manifestPath)) return []

  const previous = JSON.parse(readFileSync(manifestPath, 'utf8'))
  if (!Array.isArray(previous) || previous.some((path) => typeof path !== 'string')) {
    throw new Error('Invalid AI page manifest: expected an array of file paths')
  }
  return previous
}

function removePreviouslyGeneratedFiles(previous, projectRoot, toolsDir, categoriesDir) {
  for (const relativePath of previous) {
    const absolutePath = resolve(projectRoot, relativePath)
    const allowed = isWithin(absolutePath, toolsDir) || isWithin(absolutePath, categoriesDir)

    if (
      allowed &&
      absolutePath !== resolve(toolsDir) &&
      absolutePath !== resolve(categoriesDir) &&
      existsSync(absolutePath) &&
      lstatSync(absolutePath).isFile()
    ) {
      rmSync(absolutePath, { force: true })
    }
  }
}

export function generatePages(projectRoot = root) {
  const dataPath = join(projectRoot, 'docs', '.vitepress', 'theme', 'domain', 'ai-tools.json')
  const toolsDir = join(projectRoot, 'docs', 'tools')
  const categoriesDir = join(projectRoot, 'docs', 'ai-categories')
  const manifestPath = join(projectRoot, 'docs', '.vitepress', 'ai-pages-manifest.json')
  const tools = JSON.parse(readFileSync(dataPath, 'utf8'))

  validateTools(tools)

  const previous = readPreviousManifest(manifestPath)
  removePreviouslyGeneratedFiles(previous, projectRoot, toolsDir, categoriesDir)
  ensureDirectory(toolsDir)
  ensureDirectory(categoriesDir)

  const generated = []
  for (const tool of tools) {
    const relativePath = `docs/tools/${tool.slug}.md`
    writePage(resolve(projectRoot, relativePath), detailPage(tool))
    generated.push(relativePath)
  }

  for (const category of requiredCategories) {
    const items = tools.filter((tool) => tool.category === category)
    const relativePath = `docs/ai-categories/${category}.md`
    writePage(resolve(projectRoot, relativePath), categoryPage(category, items))
    generated.push(relativePath)
  }

  const toolLinks = tools
    .map((tool) => `- [${tool.name}](/tools/${tool.slug})：${tool.tagline}`)
    .join('\n')
  writePage(
    join(toolsDir, 'index.md'),
    `---\ntitle: AI 工具目录\ndescription: 寻器收录的 AI 工具列表。\npageClass: ai-index-page\n---\n\n# AI 工具目录\n\n${toolLinks}\n\n<p class="generated-page-note"><a href="/">← 返回首页搜索</a></p>\n`
  )
  generated.push('docs/tools/index.md')

  const categoryLinks = requiredCategories
    .map((category) => `- [${categoryLabels[category]}](/ai-categories/${category})`)
    .join('\n')
  writePage(
    join(categoriesDir, 'index.md'),
    `---\ntitle: 按场景浏览 AI 工具\ndescription: 按对话、写作、图像、视频、编程、音频、研究、营销和自动化九类场景浏览 AI 工具。\npageClass: ai-index-page\n---\n\n# 按场景浏览\n\n${categoryLinks}\n\n<p class="generated-page-note"><a href="/">← 返回首页搜索</a></p>\n`
  )
  generated.push('docs/ai-categories/index.md')

  writeFileSync(manifestPath, `${JSON.stringify(generated, null, 2)}\n`, 'utf8')
  console.log(`Generated ${tools.length} tool pages and ${requiredCategories.length} category pages.`)
  return generated
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  generatePages()
}
