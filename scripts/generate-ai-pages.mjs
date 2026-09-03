import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
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

function normalizePathForComparison(path) {
  const normalized = resolve(path)
  return process.platform === 'win32' ? normalized.toLowerCase() : normalized
}

function pathsEqual(left, right) {
  return normalizePathForComparison(left) === normalizePathForComparison(right)
}

function isPhysicallyWithin(path, parent) {
  const relativePath = relative(parent, path)
  return (
    relativePath === '' ||
    (relativePath !== '..' &&
      !relativePath.startsWith(`..${sep}`) &&
      !isAbsolute(relativePath))
  )
}

function unsafePhysicalPath(path, reason) {
  throw new Error(`Unsafe generated physical path ${path}: ${reason}`)
}

function lstatIfPresent(path) {
  try {
    return lstatSync(path)
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') return undefined
    throw error
  }
}

export function assertSafePhysicalPath(path, allowedRoot, projectRoot) {
  const resolvedPath = resolve(path)
  const resolvedAllowedRoot = resolve(allowedRoot)
  const resolvedProjectRoot = resolve(projectRoot)

  if (!isWithin(resolvedPath, resolvedAllowedRoot)) {
    unsafePhysicalPath(resolvedPath, `outside allowed root ${resolvedAllowedRoot}`)
  }
  if (!isWithin(resolvedAllowedRoot, resolvedProjectRoot)) {
    unsafePhysicalPath(resolvedAllowedRoot, `outside project root ${resolvedProjectRoot}`)
  }
  if (!existsSync(resolvedProjectRoot)) {
    unsafePhysicalPath(resolvedProjectRoot, 'project root does not exist')
  }

  const projectRootStats = lstatSync(resolvedProjectRoot)
  if (projectRootStats.isSymbolicLink()) {
    unsafePhysicalPath(resolvedProjectRoot, 'project root is a symbolic link or junction')
  }
  if (!projectRootStats.isDirectory()) {
    unsafePhysicalPath(resolvedProjectRoot, 'project root is not a directory')
  }

  const canonicalProjectRoot = realpathSync.native(resolvedProjectRoot)
  const relativeTarget = relative(resolvedProjectRoot, resolvedPath)
  const segments = relativeTarget === '' ? [] : relativeTarget.split(sep)
  let current = resolvedProjectRoot
  let canonicalAllowedRoot = pathsEqual(current, resolvedAllowedRoot)
    ? canonicalProjectRoot
    : undefined

  for (const [index, segment] of segments.entries()) {
    current = join(current, segment)
    const stats = lstatIfPresent(current)
    if (!stats) break

    if (stats.isSymbolicLink()) {
      unsafePhysicalPath(current, 'component is a symbolic link or junction')
    }
    if (index < segments.length - 1 && !stats.isDirectory()) {
      unsafePhysicalPath(current, 'ancestor component is not a directory')
    }

    const canonicalCurrent = realpathSync.native(current)
    const expectedCanonical = resolve(
      canonicalProjectRoot,
      relative(resolvedProjectRoot, current)
    )
    if (!pathsEqual(canonicalCurrent, expectedCanonical)) {
      unsafePhysicalPath(current, `real path resolves to ${canonicalCurrent}`)
    }

    if (pathsEqual(current, resolvedAllowedRoot)) {
      canonicalAllowedRoot = canonicalCurrent
    }
    if (
      canonicalAllowedRoot &&
      isWithin(current, resolvedAllowedRoot) &&
      !isPhysicallyWithin(canonicalCurrent, canonicalAllowedRoot)
    ) {
      unsafePhysicalPath(current, `real path leaves allowed root ${canonicalAllowedRoot}`)
    }
  }
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

function frontmatterScalar(value) {
  return JSON.stringify(String(value))
}

function jsonLd(value) {
  return JSON.stringify(value).replaceAll('<', '\\u003c')
}

function scenarioMatches(tool, scenario) {
  const content = [
    tool.name,
    tool.tagline,
    tool.description,
    ...tool.bestFor,
    ...tool.features,
    ...tool.tags,
    ...tool.searchTerms
  ]
    .join(' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')

  return scenario.keywords.some((keyword) => content.includes(String(keyword).toLowerCase()))
}

function validateScenarios(scenarios) {
  if (!Array.isArray(scenarios) || scenarios.length < 1) {
    throw new Error('Invalid AI scenario collection: expected a non-empty array')
  }

  const slugs = new Set()
  scenarios.forEach((scenario, index) => {
    const context = `scenario[${index}]`
    if (!isRecord(scenario)) throw new Error(`Invalid AI scenario collection: ${context} must be an object`)
    for (const field of ['slug', 'name', 'description', 'guide']) {
      requireString(scenario, field, context)
    }
    if (!slugPattern.test(scenario.slug)) throw new Error(`Invalid AI scenario collection: ${context}.slug is unsafe`)
    if (slugs.has(scenario.slug)) throw new Error(`Invalid AI scenario collection: duplicate slug ${scenario.slug}`)
    slugs.add(scenario.slug)
    requireStringList(scenario, 'keywords', context, 1)
  })

  return scenarios
}

function ensureDirectory(path) {
  mkdirSync(path, { recursive: true })
}

function detailPage(tool) {
  return `---\ntitle: ${frontmatterScalar(`${tool.name} - AI 工具介绍`)}\ndescription: ${frontmatterScalar(tool.description)}\npageClass: ai-detail-page\n---\n\n<ToolDetail slug="${tool.slug}" />\n`
}

function categoryPage(category, items, scenarios) {
  const label = categoryLabels[category]
  const links = items
    .map((tool) => `- [${tool.name}](/tools/${tool.slug})：${tool.tagline}`)
    .join('\n')
  const itemList = jsonLd({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.name,
      url: `https://no996noicu.com/tools/${tool.slug}`
    }))
  })

  const relatedScenarios = scenarios.filter((scenario) =>
    items.some((tool) => scenarioMatches(tool, scenario))
  )
  const scenarioLinks = relatedScenarios
    .map((scenario) => `- [${scenario.name}](/ai-scenarios/${scenario.slug})：${scenario.description}`)
    .join('\n')

  return `---\ntitle: ${frontmatterScalar(`${label} AI 工具`)}\ndescription: ${frontmatterScalar(`寻器整理的${label} AI 工具，按真实使用场景选择合适产品。`)}\npageClass: ai-category-page\nhead:\n  - - script\n    - type: application/ld+json\n    - >-\n      ${itemList}\n---\n\n# ${label} AI 工具\n\n这一页收录适合${label}场景的 AI 工具。先看一句话结论，再进入详情页了解能力、价格和替代选项。\n\n## 工具列表\n\n${links}\n\n## 相关场景\n\n${scenarioLinks}\n\n<p class="generated-page-note"><a href="/">← 返回全部工具</a></p>\n`
}

function scenarioPage(scenario, items) {
  const links = items
    .map((tool) => `- [${tool.name}](/tools/${tool.slug})：${tool.tagline}`)
    .join('\n')
  const itemList = jsonLd({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.name,
      url: `https://no996noicu.com/tools/${tool.slug}`
    }))
  })

  return `---\ntitle: ${frontmatterScalar(`${scenario.name} AI 工具`)}\ndescription: ${frontmatterScalar(scenario.description)}\npageClass: ai-scenario-page\nhead:\n  - - script\n    - type: application/ld+json\n    - >-\n      ${itemList}\n---\n\n# ${scenario.name} AI 工具\n\n${scenario.description}\n\n## 适合什么时候用\n\n${scenario.guide}\n\n## 推荐工具\n\n${links}\n\n<p class="generated-page-note"><a href="/ai-scenarios/">← 返回全部场景</a> · <a href="/">返回工具目录</a></p>\n`
}

function readPreviousManifest(manifestPath) {
  if (!existsSync(manifestPath)) return []

  const previous = JSON.parse(readFileSync(manifestPath, 'utf8'))
  if (!Array.isArray(previous) || previous.some((path) => typeof path !== 'string')) {
    throw new Error('Invalid AI page manifest: expected an array of file paths')
  }
  return previous
}

function getCleanupTargets(previous, projectRoot, toolsDir, categoriesDir, scenariosDir) {
  return previous.flatMap((relativePath) => {
    const absolutePath = resolve(projectRoot, relativePath)
    if (isWithin(absolutePath, toolsDir) && !pathsEqual(absolutePath, toolsDir)) {
      return [{ absolutePath, allowedRoot: toolsDir }]
    }
    if (isWithin(absolutePath, categoriesDir) && !pathsEqual(absolutePath, categoriesDir)) {
      return [{ absolutePath, allowedRoot: categoriesDir }]
    }
    if (isWithin(absolutePath, scenariosDir) && !pathsEqual(absolutePath, scenariosDir)) {
      return [{ absolutePath, allowedRoot: scenariosDir }]
    }
    return []
  })
}

function preflightGenerationPaths({
  projectRoot,
  toolsDir,
  categoriesDir,
  scenariosDir,
  manifestPath,
  cleanupTargets,
  pageWrites
}) {
  assertSafePhysicalPath(toolsDir, toolsDir, projectRoot)
  assertSafePhysicalPath(categoriesDir, categoriesDir, projectRoot)
  assertSafePhysicalPath(scenariosDir, scenariosDir, projectRoot)

  cleanupTargets.forEach(({ absolutePath, allowedRoot }) => {
    assertSafePhysicalPath(absolutePath, allowedRoot, projectRoot)
  })
  pageWrites.forEach(({ absolutePath, allowedRoot }) => {
    assertSafePhysicalPath(absolutePath, allowedRoot, projectRoot)
  })
  assertSafePhysicalPath(manifestPath, dirname(manifestPath), projectRoot)
}

function removePreviouslyGeneratedFiles(cleanupTargets, projectRoot) {
  for (const { absolutePath, allowedRoot } of cleanupTargets) {
    assertSafePhysicalPath(absolutePath, allowedRoot, projectRoot)
    if (lstatIfPresent(absolutePath)?.isFile()) {
      rmSync(absolutePath, { force: true })
    }
  }
}

function ensureSafeDirectory(path, allowedRoot, projectRoot) {
  assertSafePhysicalPath(path, allowedRoot, projectRoot)
  ensureDirectory(path)
  assertSafePhysicalPath(path, allowedRoot, projectRoot)
}

function writeSafePage({ absolutePath, allowedRoot, content }, projectRoot) {
  assertSafePhysicalPath(absolutePath, allowedRoot, projectRoot)
  ensureSafeDirectory(dirname(absolutePath), allowedRoot, projectRoot)
  assertSafePhysicalPath(absolutePath, allowedRoot, projectRoot)
  writeFileSync(absolutePath, content, 'utf8')
}

export function generateAiPages(options = {}) {
  if (!isRecord(options)) {
    throw new Error('Invalid AI page generator options: expected an object')
  }
  if (options.root !== undefined && (typeof options.root !== 'string' || !options.root.trim())) {
    throw new Error('Invalid AI page generator options: root must be a non-empty string')
  }
  if (
    options.dataPath !== undefined &&
    (typeof options.dataPath !== 'string' || !options.dataPath.trim())
  ) {
    throw new Error('Invalid AI page generator options: dataPath must be a non-empty string')
  }

  const projectRoot = resolve(options.root ?? root)
  const dataPath = resolve(
    options.dataPath ??
      join(projectRoot, 'docs', '.vitepress', 'theme', 'domain', 'ai-tools.json')
  )
  const toolsDir = join(projectRoot, 'docs', 'tools')
  const categoriesDir = join(projectRoot, 'docs', 'ai-categories')
  const scenariosDir = join(projectRoot, 'docs', 'ai-scenarios')
  const manifestPath = join(projectRoot, 'docs', '.vitepress', 'ai-pages-manifest.json')
  const requestedScenarioPath = options.scenarioPath ?? join(projectRoot, 'docs', '.vitepress', 'theme', 'domain', 'ai-scenarios.json')
  const scenarioPath = resolve(requestedScenarioPath)
  const logger = options.logger ?? console.log
  if (typeof logger !== 'function') {
    throw new Error('Invalid AI page generator options: logger must be a function')
  }

  const tools = JSON.parse(readFileSync(dataPath, 'utf8'))
  validateTools(tools)
  const scenarios = validateScenarios(JSON.parse(readFileSync(scenarioPath, 'utf8')))

  const previous = readPreviousManifest(manifestPath)
  const generated = []
  const pageWrites = []

  for (const tool of tools) {
    const relativePath = `docs/tools/${tool.slug}.md`
    pageWrites.push({
      absolutePath: resolve(projectRoot, relativePath),
      allowedRoot: toolsDir,
      content: detailPage(tool)
    })
    generated.push(relativePath)
  }

  for (const category of requiredCategories) {
    const items = tools.filter((tool) => tool.category === category)
    const relativePath = `docs/ai-categories/${category}.md`
    pageWrites.push({
      absolutePath: resolve(projectRoot, relativePath),
      allowedRoot: categoriesDir,
      content: categoryPage(category, items, scenarios)
    })
    generated.push(relativePath)
  }

  for (const scenario of scenarios) {
    const items = tools.filter((tool) => scenarioMatches(tool, scenario))
    const relativePath = `docs/ai-scenarios/${scenario.slug}.md`
    pageWrites.push({
      absolutePath: resolve(projectRoot, relativePath),
      allowedRoot: scenariosDir,
      content: scenarioPage(scenario, items)
    })
    generated.push(relativePath)
  }

  const toolLinks = tools
    .map((tool) => `- [${tool.name}](/tools/${tool.slug})：${tool.tagline}`)
    .join('\n')
  pageWrites.push({
    absolutePath: join(toolsDir, 'index.md'),
    allowedRoot: toolsDir,
    content: `---\ntitle: AI 工具目录\ndescription: 寻器收录的 AI 工具列表。\npageClass: ai-index-page\n---\n\n# AI 工具目录\n\n${toolLinks}\n\n<p class="generated-page-note"><a href="/">← 返回首页搜索</a></p>\n`
  })
  generated.push('docs/tools/index.md')

  const categoryLinks = requiredCategories
    .map((category) => `- [${categoryLabels[category]}](/ai-categories/${category})`)
    .join('\n')
  pageWrites.push({
    absolutePath: join(categoriesDir, 'index.md'),
    allowedRoot: categoriesDir,
    content: `---\ntitle: 按场景浏览 AI 工具\ndescription: 按对话、写作、图像、视频、编程、音频、研究、营销和自动化九类场景浏览 AI 工具。\npageClass: ai-index-page\n---\n\n# 按场景浏览\n\n${categoryLinks}\n\n<p class="generated-page-note"><a href="/">← 返回首页搜索</a></p>\n`
  })
  generated.push('docs/ai-categories/index.md')

  const scenarioLinks = scenarios
    .map((scenario) => `- [${scenario.name}](/ai-scenarios/${scenario.slug})：${scenario.description}`)
    .join('\n')
  pageWrites.push({
    absolutePath: join(scenariosDir, 'index.md'),
    allowedRoot: scenariosDir,
    content: `---\ntitle: 按事情找 AI 工具\ndescription: 按学生学习、内容创作、职场办公、营销增长、开发建站、个人效率、设计视觉、数据分析和音频播客等 ${scenarios.length} 个真实任务场景浏览 AI 工具。\npageClass: ai-index-page\n---\n\n# 按事情找 AI 工具\n\n${scenarioLinks}\n\n<p class="generated-page-note"><a href="/">← 返回首页搜索</a> · <a href="/ai-categories/">按九大分类浏览</a></p>\n`
  })
  generated.push('docs/ai-scenarios/index.md')

  const cleanupTargets = getCleanupTargets(previous, projectRoot, toolsDir, categoriesDir, scenariosDir)
  preflightGenerationPaths({
    projectRoot,
    toolsDir,
    categoriesDir,
    scenariosDir,
    manifestPath,
    cleanupTargets,
    pageWrites
  })

  removePreviouslyGeneratedFiles(cleanupTargets, projectRoot)
  ensureSafeDirectory(toolsDir, toolsDir, projectRoot)
  ensureSafeDirectory(categoriesDir, categoriesDir, projectRoot)
  ensureSafeDirectory(scenariosDir, scenariosDir, projectRoot)
  pageWrites.forEach((pageWrite) => writeSafePage(pageWrite, projectRoot))
  writeSafePage(
    {
      absolutePath: manifestPath,
      allowedRoot: dirname(manifestPath),
      content: `${JSON.stringify(generated, null, 2)}\n`
    },
    projectRoot
  )

  logger(`Generated ${tools.length} tool pages, ${requiredCategories.length} category pages, and ${scenarios.length} scenario pages.`)
  return generated
}

if (process.argv[1] && pathsEqual(resolve(process.argv[1]), resolve(scriptPath))) {
  generateAiPages()
}
