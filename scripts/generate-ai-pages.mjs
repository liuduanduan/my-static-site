import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dataPath = join(root, 'docs', '.vitepress', 'theme', 'domain', 'ai-tools.json')
const toolsDir = join(root, 'docs', 'tools')
const categoriesDir = join(root, 'docs', 'ai-categories')
const manifestPath = join(root, 'docs', '.vitepress', 'ai-pages-manifest.json')
const tools = JSON.parse(readFileSync(dataPath, 'utf8'))
const categoryLabels = {
  writing: '写作与对话',
  image: '图像设计',
  video: '视频创作',
  coding: '编程开发',
  productivity: '办公效率',
  audio: '音频音乐'
}
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

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

function isWithin(path, parent) {
  const resolvedPath = resolve(path)
  const resolvedParent = resolve(parent)
  return resolvedPath === resolvedParent || resolvedPath.startsWith(`${resolvedParent}${sep}`)
}

function validateTools(items) {
  const seen = new Set()

  for (const tool of items) {
    if (!slugPattern.test(tool.slug)) {
      throw new Error(`Unsafe tool slug: ${tool.slug}`)
    }
    if (seen.has(tool.slug)) {
      throw new Error(`Duplicate tool slug: ${tool.slug}`)
    }
    if (!(tool.category in categoryLabels)) {
      throw new Error(`Unknown category for ${tool.slug}: ${tool.category}`)
    }
    seen.add(tool.slug)
  }

  for (const tool of items) {
    for (const alternative of tool.alternatives) {
      if (!seen.has(alternative)) {
        throw new Error(`Unknown alternative for ${tool.slug}: ${alternative}`)
      }
    }
  }
}

function detailPage(tool) {
  return `---\ntitle: "${escapeFrontmatter(tool.name)} - AI 工具介绍"\ndescription: "${escapeFrontmatter(tool.description)}"\npageClass: ai-detail-page\n---\n\n<ToolDetail slug="${tool.slug}" />\n`
}

function categoryPage(category, items) {
  const label = categoryLabels[category]
  const links = items
    .map((tool) => `- [${tool.name}](/tools/${tool.slug})：${tool.tagline}`)
    .join(String.fromCharCode(10))

  return `---\ntitle: "${label} AI 工具"\ndescription: "寻器整理的${label} AI 工具，按真实使用场景选择合适产品。"\npageClass: ai-category-page\n---\n\n# ${label} AI 工具\n\n这一页收录适合${label}场景的 AI 工具。先看一句话结论，再进入详情页了解能力、价格和替代选项。\n\n## 工具列表\n\n${links}\n\n<p class="generated-page-note"><a href="/">← 返回全部工具</a></p>\n`
}

const previous = existsSync(manifestPath)
  ? JSON.parse(readFileSync(manifestPath, 'utf8'))
  : []

validateTools(tools)

for (const relativePath of previous) {
  const absolutePath = join(root, relativePath)
  const safeToolsRoot = join(root, 'docs', 'tools')
  const safeCategoriesRoot = join(root, 'docs', 'ai-categories')
  if (isWithin(absolutePath, safeToolsRoot) || isWithin(absolutePath, safeCategoriesRoot)) {
    rmSync(absolutePath, { force: true })
  }
}

ensureDirectory(toolsDir)
ensureDirectory(categoriesDir)

const generated = []
for (const tool of tools) {
  const relativePath = `docs/tools/${tool.slug}.md`
  writePage(join(root, relativePath), detailPage(tool))
  generated.push(relativePath)
}

const categories = Object.keys(categoryLabels)
for (const category of categories) {
  const items = tools.filter((tool) => tool.category === category)
  const relativePath = `docs/ai-categories/${category}.md`
  writePage(join(root, relativePath), categoryPage(category, items))
  generated.push(relativePath)
}

const toolLinks = tools
  .map((tool) => `- [${tool.name}](/tools/${tool.slug})：${tool.tagline}`)
  .join(String.fromCharCode(10))
writePage(
  join(toolsDir, 'index.md'),
  `---\ntitle: AI 工具目录\ndescription: 寻器收录的 AI 工具列表。\npageClass: ai-index-page\n---\n\n# AI 工具目录\n\n${toolLinks}\n\n<p class="generated-page-note"><a href="/">← 返回首页搜索</a></p>\n`
)
generated.push('docs/tools/index.md')

const categoryLinks = categories
  .map((category) => `- [${categoryLabels[category]}](/ai-categories/${category})`)
  .join(String.fromCharCode(10))
writePage(
  join(categoriesDir, 'index.md'),
  `---\ntitle: 按场景浏览 AI 工具\ndescription: 按写作、图像、视频、编程、办公和音频场景浏览 AI 工具。\npageClass: ai-index-page\n---\n\n# 按场景浏览\n\n${categoryLinks}\n\n<p class="generated-page-note"><a href="/">← 返回首页搜索</a></p>\n`
)
generated.push('docs/ai-categories/index.md')

writeFileSync(manifestPath, `${JSON.stringify(generated, null, 2)}${String.fromCharCode(10)}`, 'utf8')
console.log(`Generated ${tools.length} tool pages and ${categories.length} category pages.`)
