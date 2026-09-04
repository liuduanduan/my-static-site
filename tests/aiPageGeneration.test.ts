import { execFileSync } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import * as pageGenerator from '../scripts/generate-ai-pages.mjs'
import vitepressConfig from '../docs/.vitepress/config'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const catalogPath = resolve(root, 'docs/.vitepress/theme/domain/ai-tools.json')
const categories = [
  'chat',
  'writing',
  'image',
  'video',
  'coding',
  'audio',
  'research',
  'marketing',
  'automation'
]
const scenarios = ['study', 'create', 'work', 'marketing', 'build', 'life', 'design', 'data', 'podcast']

function cloneCatalog(): Array<Record<string, unknown>> {
  return JSON.parse(readFileSync(catalogPath, 'utf8')) as Array<Record<string, unknown>>
}

function createFixture(prefix: string): {
  root: string
  dataDirectory: string
  toolsDirectory: string
  categoriesDirectory: string
  scenariosDirectory: string
  manifestPath: string
} {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), prefix))
  const dataDirectory = resolve(fixtureRoot, 'docs/.vitepress/theme/domain')
  const toolsDirectory = resolve(fixtureRoot, 'docs/tools')
  const categoriesDirectory = resolve(fixtureRoot, 'docs/ai-categories')
  const scenariosDirectory = resolve(fixtureRoot, 'docs/ai-scenarios')
  const manifestPath = resolve(fixtureRoot, 'docs/.vitepress/ai-pages-manifest.json')

  mkdirSync(dataDirectory, { recursive: true })
  writeFileSync(
    resolve(dataDirectory, 'ai-tools.json'),
    JSON.stringify(cloneCatalog()),
    'utf8'
  )
  writeFileSync(
    resolve(dataDirectory, 'ai-scenarios.json'),
    readFileSync(resolve(root, 'docs/.vitepress/theme/domain/ai-scenarios.json')),
    'utf8'
  )

  return {
    root: fixtureRoot,
    dataDirectory,
    toolsDirectory,
    categoriesDirectory,
    scenariosDirectory,
    manifestPath
  }
}

function generateFixture(fixtureRoot: string): string[] {
  return pageGenerator.generateAiPages({
    root: fixtureRoot,
    dataPath: resolve(fixtureRoot, 'docs/.vitepress/theme/domain/ai-tools.json'),
    logger: () => undefined
  }) as string[]
}

function assertGeneratedArtifactsMatch(
  generatedRoot: string,
  committedRoot: string,
  relativePaths: readonly string[]
): void {
  relativePaths.forEach((relativePath) => {
    const generatedPath = resolve(generatedRoot, relativePath)
    const committedPath = resolve(committedRoot, relativePath)
    if (!existsSync(generatedPath)) {
      throw new Error(`Missing generated artifact: ${relativePath}`)
    }
    if (!existsSync(committedPath)) {
      throw new Error(`Missing committed artifact: ${relativePath}`)
    }
    if (!readFileSync(generatedPath).equals(readFileSync(committedPath))) {
      throw new Error(`Generated artifact content drift: ${relativePath}`)
    }
  })
}

function createDirectoryLink(target: string, linkPath: string): void {
  symlinkSync(target, linkPath, process.platform === 'win32' ? 'junction' : 'dir')
}

function jsonLdFromMarkdown(source: string): Record<string, unknown> {
  const match = source.match(
    /head:\n  - - script\n    - type: application\/ld\+json\n    - >-\n      (\{[^\n]+\})\n---/
  )
  expect(match, 'generated page frontmatter must contain JSON-LD').not.toBeNull()
  return JSON.parse(match![1]) as Record<string, unknown>
}

function compiledFiles(directory: string, extension: string): string {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return compiledFiles(path, extension)
    return entry.name.endsWith(extension) ? [readFileSync(path, 'utf8')] : []
  }).join('\n')
}

describe('AI page generation', () => {
  it('exposes an explicit-root generator without running the CLI on import', () => {
    expect(pageGenerator.generateAiPages).toBeTypeOf('function')
  })

  it('generates the complete static directory inside an isolated fixture', () => {
    const fixture = createFixture('ai-page-integration-')
    const catalog = cloneCatalog()
    const expectedManifest = [
      ...catalog.map((tool) => `docs/tools/${tool.slug}.md`),
      ...categories.map((category) => `docs/ai-categories/${category}.md`),
      ...scenarios.map((scenario) => `docs/ai-scenarios/${scenario}.md`),
      'docs/tools/index.md',
      'docs/ai-categories/index.md',
      'docs/ai-scenarios/index.md'
    ]
    const oldCategory = resolve(fixture.categoriesDirectory, 'productivity.md')
    const siblingDirectory = resolve(fixture.root, 'docs/tools-archive')
    const siblingFile = resolve(siblingDirectory, 'outside.md')

    try {
      mkdirSync(fixture.categoriesDirectory, { recursive: true })
      mkdirSync(siblingDirectory, { recursive: true })
      writeFileSync(oldCategory, 'old productivity page', 'utf8')
      writeFileSync(siblingFile, 'preserve sibling', 'utf8')
      writeFileSync(
        fixture.manifestPath,
        JSON.stringify([
          'docs/ai-categories/productivity.md',
          'docs/tools-archive/outside.md'
        ]),
        'utf8'
      )

      const generated = generateFixture(fixture.root)
      const manifest = JSON.parse(readFileSync(fixture.manifestPath, 'utf8')) as string[]

      expect(generated).toEqual(expectedManifest)
      expect(manifest).toHaveLength(catalog.length + categories.length + scenarios.length + 3)
      expect(manifest).toEqual(expectedManifest)
      expect(new Set(manifest).size).toBe(manifest.length)
      expect(manifest).toContain('docs/tools/chatgpt.md')
      expect(manifest).toContain('docs/tools/julius-ai.md')
      expect(manifest).toContain('docs/ai-categories/marketing.md')
      expect(manifest).toContain('docs/ai-categories/automation.md')
      expect(manifest).toContain('docs/ai-scenarios/study.md')
      expect(manifest).toContain('docs/ai-scenarios/life.md')
      expect(manifest).not.toContain('docs/ai-categories/productivity.md')
      expect(existsSync(oldCategory)).toBe(false)
      expect(readFileSync(siblingFile, 'utf8')).toBe('preserve sibling')
      expect(manifest.every((path) => existsSync(resolve(fixture.root, path)))).toBe(true)
      expect(
        manifest.every(
          (path) =>
            /^docs\/tools\/(?:[a-z0-9]+(?:-[a-z0-9]+)*|index)\.md$/.test(path) ||
            /^docs\/ai-categories\/(?:[a-z0-9]+(?:-[a-z0-9]+)*|index)\.md$/.test(path) ||
            /^docs\/ai-scenarios\/(?:[a-z0-9]+(?:-[a-z0-9]+)*|index)\.md$/.test(path)
        )
      ).toBe(true)

      catalog.forEach((tool) => {
        const slug = String(tool.slug)
        const source = readFileSync(resolve(fixture.root, `docs/tools/${slug}.md`), 'utf8')
        expect(source.match(/<ToolDetail\b/g)).toHaveLength(1)
        expect(source).toContain(`<ToolDetail slug="${slug}" />`)
      })

      categories.forEach((category) => {
        const categoryTools = catalog.filter((tool) => tool.category === category)
        const source = readFileSync(resolve(fixture.categoriesDirectory, `${category}.md`), 'utf8')
        const structuredData = jsonLdFromMarkdown(source)
        expect(structuredData['@type']).toBe('ItemList')
        expect(structuredData.itemListElement).toEqual(categoryTools.map((tool, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: tool.name,
          url: `https://no996noicu.com/tools/${tool.slug}`
        })))
        const renderedOrder = [...source.matchAll(/\[([^\]]+)\]\(\/tools\/([^)]+)\)/g)]
          .map((match) => match[2])
        expect(renderedOrder).toEqual(categoryTools.map((tool) => tool.slug))
      })

      scenarios.forEach((scenario) => {
        const source = readFileSync(resolve(fixture.root, `docs/ai-scenarios/${scenario}.md`), 'utf8')
        const structuredData = jsonLdFromMarkdown(source)
        expect(structuredData['@type']).toBe('ItemList')
        expect(source).toContain('## 适合什么时候用')
        expect(source).toMatch(/\[.+\]\(\/tools\/.+\)/)
      })
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('adds route-aware breadcrumbs outside tool routes while preserving status noindex', () => {
    const transformHead = vitepressConfig.transformHead
    expect(transformHead).toBeTypeOf('function')

    const headFor = (relativePath: string, title: string) => transformHead!({
      pageData: { relativePath, title, description: '' }
    } as never)
    const graphFor = (relativePath: string, title: string) => {
      const head = headFor(relativePath, title)
      const script = head.find((item) => item[0] === 'script' && item[1]?.type === 'application/ld+json')
      return script ? JSON.parse(String(script[2])) : undefined
    }

    expect(graphFor('ai-categories/chat.md', '对话与模型 AI 工具')).toMatchObject({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { position: 1, item: 'https://no996noicu.com/' },
        { position: 2, item: 'https://no996noicu.com/ai-categories/' },
        { position: 3, item: 'https://no996noicu.com/ai-categories/chat' }
      ]
    })
    expect(graphFor('ai-scenarios/study.md', '学生学习 AI 工具')).toMatchObject({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { position: 1, item: 'https://no996noicu.com/' },
        { position: 2, item: 'https://no996noicu.com/ai-scenarios/' },
        { position: 3, item: 'https://no996noicu.com/ai-scenarios/study' }
      ]
    })
    expect(graphFor('submit.md', '提交工具')).toMatchObject({ '@type': 'BreadcrumbList' })
    expect(graphFor('submit/status.md', '查询收录进度')).toMatchObject({ '@type': 'BreadcrumbList' })
    expect(graphFor('privacy.md', '隐私说明')).toMatchObject({ '@type': 'BreadcrumbList' })
    expect(graphFor('promote.md', '合作说明')).toMatchObject({ '@type': 'BreadcrumbList' })
    expect(graphFor('about.md', '关于寻器')).toMatchObject({ '@type': 'BreadcrumbList' })
    expect(graphFor('tools/chatgpt.md', 'ChatGPT')).toBeUndefined()

  })

  it('keeps CLI execution isolated while reporting generated counts', () => {
    const fixture = createFixture('ai-page-cli-')
    const catalog = cloneCatalog()
    const fixtureScriptsDirectory = resolve(fixture.root, 'scripts')
    const fixtureScript = resolve(fixtureScriptsDirectory, 'generate-ai-pages.mjs')

    try {
      mkdirSync(fixtureScriptsDirectory, { recursive: true })
      copyFileSync(resolve(root, 'scripts/generate-ai-pages.mjs'), fixtureScript)

      const output = execFileSync(process.execPath, [fixtureScript], {
        cwd: fixture.root,
        encoding: 'utf8'
      })
      const manifest = JSON.parse(readFileSync(fixture.manifestPath, 'utf8')) as string[]

      expect(output.replaceAll('\r\n', '\n')).toBe(
        `Generated ${catalog.length} tool pages, ${categories.length} category pages, and ${scenarios.length} scenario pages.\n`
      )
      expect(manifest).toHaveLength(catalog.length + categories.length + scenarios.length + 3)
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('derives generated routes and counts from an additional reviewed tool', () => {
    const fixture = createFixture('ai-page-growth-')
    const catalog = cloneCatalog()
    const extra = {
      ...catalog.find((tool) => tool.slug === 'chatgpt'),
      slug: 'example-ai',
      name: 'Example AI',
      tagline: '为增长测试提供独立工具条目',
      description: 'Example AI 是目录增长测试使用的独立工具条目。',
      bestFor: ['目录增长验证', '静态路由验证', '清单数量验证'],
      features: ['独立详情页', '分类页计数', '动态清单'],
      pros: ['测试事实清晰', '不会修改现有条目'],
      cons: ['仅用于测试', '不代表真实产品'],
      searchTerms: ['目录增长', '工具测试'],
      url: 'https://example-ai.test/',
      featuredOrder: undefined,
      alternatives: ['chatgpt', 'claude']
    }
    catalog.push(extra)

    try {
      writeFileSync(
        resolve(fixture.dataDirectory, 'ai-tools.json'),
        JSON.stringify(catalog),
        'utf8'
      )

      const generated = generateFixture(fixture.root)
      const manifest = JSON.parse(readFileSync(fixture.manifestPath, 'utf8')) as string[]

      expect(generated).toContain('docs/tools/example-ai.md')
      expect(manifest).toHaveLength(catalog.length + categories.length + scenarios.length + 3)
      expect(readFileSync(resolve(fixture.toolsDirectory, 'example-ai.md'), 'utf8')).toContain(
        '<ToolDetail slug="example-ai" />'
      )
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('detects byte drift even when generated and committed paths both exist', () => {
    const generatedRoot = mkdtempSync(resolve(tmpdir(), 'ai-generated-stale-check-'))
    const committedRoot = mkdtempSync(resolve(tmpdir(), 'ai-committed-stale-check-'))
    const relativePath = 'docs/tools/example.md'

    try {
      mkdirSync(resolve(generatedRoot, 'docs/tools'), { recursive: true })
      mkdirSync(resolve(committedRoot, 'docs/tools'), { recursive: true })
      writeFileSync(resolve(generatedRoot, relativePath), 'current\n', 'utf8')
      writeFileSync(resolve(committedRoot, relativePath), 'stale\n', 'utf8')

      expect(() =>
        assertGeneratedArtifactsMatch(generatedRoot, committedRoot, [relativePath])
      ).toThrow(/content drift/i)
    } finally {
      rmSync(generatedRoot, { recursive: true, force: true })
      rmSync(committedRoot, { recursive: true, force: true })
    }
  })

  it('matches all generated fixture bytes to the committed artifacts read-only', () => {
    const fixture = createFixture('ai-page-committed-sync-')

    try {
      const generatedManifest = generateFixture(fixture.root)
      const committedManifest = JSON.parse(
        readFileSync(resolve(root, 'docs/.vitepress/ai-pages-manifest.json'), 'utf8')
      ) as string[]

      expect(generatedManifest).toHaveLength(cloneCatalog().length + categories.length + scenarios.length + 3)
      expect(generatedManifest).toEqual(committedManifest)
      assertGeneratedArtifactsMatch(fixture.root, root, [
        ...generatedManifest,
        'docs/.vitepress/ai-pages-manifest.json'
      ])
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('uses resolved directory boundaries for generated-file cleanup', () => {
    const toolsDirectory = resolve(root, 'docs/tools')

    expect(pageGenerator.isWithin(resolve(toolsDirectory, 'chatgpt.md'), toolsDirectory)).toBe(true)
    expect(pageGenerator.isWithin(resolve(root, 'docs/tools-archive/chatgpt.md'), toolsDirectory)).toBe(false)
  })

  it('rejects every unsafe slug before generation can write files', () => {
    const catalog = cloneCatalog()
    catalog[0].slug = '../outside'

    expect(() => pageGenerator.validateTools(catalog)).toThrow(/slug is unsafe/)
  })

  it('rejects duplicate official URLs after URL normalization before generation', () => {
    const catalog = cloneCatalog()
    catalog[1].url = 'HTTPS://CHATGPT.COM:443'

    expect(() => pageGenerator.validateTools(catalog)).toThrow(
      /duplicate normalized URL https:\/\/chatgpt\.com\//
    )
  })

  it('validates the complete catalog before cleaning prior generated pages', () => {
    const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'ai-page-generation-'))
    const dataDirectory = resolve(fixtureRoot, 'docs/.vitepress/theme/domain')
    const toolsDirectory = resolve(fixtureRoot, 'docs/tools')
    const categoriesDirectory = resolve(fixtureRoot, 'docs/ai-categories')
    const manifestPath = resolve(fixtureRoot, 'docs/.vitepress/ai-pages-manifest.json')
    const sentinelPath = resolve(toolsDirectory, 'sentinel.md')
    const previousManifest = JSON.stringify(['docs/tools/sentinel.md'])
    const catalog = cloneCatalog()
    catalog[0].slug = '../outside'

    try {
      mkdirSync(dataDirectory, { recursive: true })
      mkdirSync(toolsDirectory, { recursive: true })
      writeFileSync(resolve(dataDirectory, 'ai-tools.json'), JSON.stringify(catalog), 'utf8')
      writeFileSync(
        resolve(dataDirectory, 'ai-scenarios.json'),
        readFileSync(resolve(root, 'docs/.vitepress/theme/domain/ai-scenarios.json')),
        'utf8'
      )
      writeFileSync(manifestPath, previousManifest, 'utf8')
      writeFileSync(sentinelPath, 'keep me', 'utf8')

      expect(() => generateFixture(fixtureRoot)).toThrow(/slug is unsafe/)
      expect(readFileSync(sentinelPath, 'utf8')).toBe('keep me')
      expect(readFileSync(manifestPath, 'utf8')).toBe(previousManifest)
      expect(existsSync(categoriesDirectory)).toBe(false)
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true })
    }
  })

  it('cleans only prior manifest files inside generated roots', () => {
    const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'ai-page-cleanup-'))
    const dataDirectory = resolve(fixtureRoot, 'docs/.vitepress/theme/domain')
    const toolsDirectory = resolve(fixtureRoot, 'docs/tools')
    const categoriesDirectory = resolve(fixtureRoot, 'docs/ai-categories')
    const siblingDirectory = resolve(fixtureRoot, 'docs/tools-archive')
    const manifestPath = resolve(fixtureRoot, 'docs/.vitepress/ai-pages-manifest.json')
    const staleCategory = resolve(categoriesDirectory, 'productivity.md')
    const staleTool = resolve(toolsDirectory, 'stale.md')
    const preservedDirectory = resolve(toolsDirectory, 'preserved-directory')
    const siblingFile = resolve(siblingDirectory, 'outside.md')

    try {
      const fixtureDirectories = [
        dataDirectory,
        toolsDirectory,
        categoriesDirectory,
        preservedDirectory,
        siblingDirectory
      ]
      fixtureDirectories.forEach((path) => mkdirSync(path, { recursive: true }))
      writeFileSync(
        resolve(dataDirectory, 'ai-tools.json'),
        JSON.stringify(cloneCatalog()),
        'utf8'
      )
      writeFileSync(
        resolve(dataDirectory, 'ai-scenarios.json'),
        readFileSync(resolve(root, 'docs/.vitepress/theme/domain/ai-scenarios.json')),
        'utf8'
      )
      writeFileSync(staleCategory, 'stale category', 'utf8')
      writeFileSync(staleTool, 'stale tool', 'utf8')
      writeFileSync(siblingFile, 'outside generated roots', 'utf8')
      writeFileSync(
        manifestPath,
        JSON.stringify([
          'docs/ai-categories/productivity.md',
          'docs/tools/stale.md',
          'docs/tools/preserved-directory',
          'docs/tools-archive/outside.md'
        ]),
        'utf8'
      )

      generateFixture(fixtureRoot)

      expect(existsSync(staleCategory)).toBe(false)
      expect(existsSync(staleTool)).toBe(false)
      expect(existsSync(preservedDirectory)).toBe(true)
      expect(readFileSync(siblingFile, 'utf8')).toBe('outside generated roots')
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true })
    }
  })

  it('rejects a linked generated root before cleanup or writes', () => {
    const fixture = createFixture('ai-page-linked-root-')
    const outsideDirectory = resolve(fixture.root, 'outside-tools')
    const outsideMarker = resolve(outsideDirectory, 'marker.txt')
    const cleanupSentinel = resolve(fixture.categoriesDirectory, 'sentinel.md')

    try {
      mkdirSync(outsideDirectory, { recursive: true })
      mkdirSync(fixture.categoriesDirectory, { recursive: true })
      writeFileSync(outsideMarker, 'outside unchanged', 'utf8')
      writeFileSync(cleanupSentinel, 'cleanup unchanged', 'utf8')
      writeFileSync(
        fixture.manifestPath,
        JSON.stringify(['docs/ai-categories/sentinel.md']),
        'utf8'
      )
      createDirectoryLink(outsideDirectory, fixture.toolsDirectory)

      expect(() => generateFixture(fixture.root)).toThrow(/symbolic link|junction|physical path/i)
      expect(readFileSync(cleanupSentinel, 'utf8')).toBe('cleanup unchanged')
      expect(readdirSync(outsideDirectory)).toEqual(['marker.txt'])
      expect(readFileSync(outsideMarker, 'utf8')).toBe('outside unchanged')
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('rejects a dangling linked generated root before cleanup', () => {
    const fixture = createFixture('ai-page-dangling-root-')
    const missingTarget = resolve(fixture.root, 'missing-outside-tools')
    const cleanupSentinel = resolve(fixture.categoriesDirectory, 'sentinel.md')

    try {
      mkdirSync(fixture.categoriesDirectory, { recursive: true })
      writeFileSync(cleanupSentinel, 'cleanup unchanged', 'utf8')
      writeFileSync(
        fixture.manifestPath,
        JSON.stringify(['docs/ai-categories/sentinel.md']),
        'utf8'
      )
      createDirectoryLink(missingTarget, fixture.toolsDirectory)

      expect(() => generateFixture(fixture.root)).toThrow(/symbolic link|junction|physical path/i)
      expect(readFileSync(cleanupSentinel, 'utf8')).toBe('cleanup unchanged')
      expect(existsSync(missingTarget)).toBe(false)
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('rejects an intermediate linked cleanup path before deleting any file', () => {
    const fixture = createFixture('ai-page-linked-cleanup-')
    const outsideDirectory = resolve(fixture.root, 'outside-cleanup')
    const outsideFile = resolve(outsideDirectory, 'outside.md')
    const linkedDirectory = resolve(fixture.toolsDirectory, 'linked')
    const cleanupSentinel = resolve(fixture.categoriesDirectory, 'sentinel.md')

    try {
      mkdirSync(outsideDirectory, { recursive: true })
      mkdirSync(fixture.toolsDirectory, { recursive: true })
      mkdirSync(fixture.categoriesDirectory, { recursive: true })
      writeFileSync(outsideFile, 'outside unchanged', 'utf8')
      writeFileSync(cleanupSentinel, 'cleanup unchanged', 'utf8')
      createDirectoryLink(outsideDirectory, linkedDirectory)
      writeFileSync(
        fixture.manifestPath,
        JSON.stringify([
          'docs/ai-categories/sentinel.md',
          'docs/tools/linked/outside.md'
        ]),
        'utf8'
      )

      expect(() => generateFixture(fixture.root)).toThrow(/symbolic link|junction|physical path/i)
      expect(readFileSync(cleanupSentinel, 'utf8')).toBe('cleanup unchanged')
      expect(readFileSync(outsideFile, 'utf8')).toBe('outside unchanged')
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('serializes dynamic frontmatter as safe JSON-compatible YAML scalars', () => {
    const fixture = createFixture('ai-page-frontmatter-')
    const catalog = cloneCatalog()
    const name = 'Quoted " name \\ path\nnext line'
    const description = 'Description " quote \\ path\nnext line'
    catalog[0].name = name
    catalog[0].description = description

    try {
      writeFileSync(
        resolve(fixture.dataDirectory, 'ai-tools.json'),
        JSON.stringify(catalog),
        'utf8'
      )

      generateFixture(fixture.root)

      const source = readFileSync(resolve(fixture.toolsDirectory, 'chatgpt.md'), 'utf8')
      expect(source).toContain('title: "Quoted &quot; name \\\\ path\\nnext line - AI 工具介绍"\n')
      expect(source).toContain('description: "Description &quot; quote \\\\ path\\nnext line"\n')
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('keeps Vue interpolation inert at every generated sink after VitePress compilation', () => {
    const fixture = createFixture('ai-page-generated-sink-')
    const catalog = cloneCatalog()
    const scenarioPath = resolve(fixture.dataDirectory, 'ai-scenarios.json')
    const scenarioCatalog = JSON.parse(readFileSync(scenarioPath, 'utf8')) as Array<Record<string, unknown>>
    const expression = '{{globalThis?.alert?.(1)}}'
    const hostileTag = '<img src="https://evil.example/x" onerror="globalThis.alert(2)">'
    catalog[0].name = `JSON-LD generated sink ${expression} ${hostileTag}`
    catalog[0].tagline = `Markdown generated sink ${expression} ${hostileTag}`
    catalog[0].description = `Frontmatter generated sink ${expression} ${hostileTag}`
    scenarioCatalog[0].name = `Scenario name generated sink ${expression} ${hostileTag}`
    scenarioCatalog[0].description = `Scenario description generated sink ${expression} ${hostileTag}`
    scenarioCatalog[0].guide = `Scenario guide generated sink ${expression} ${hostileTag}`
    const buildDirectory = resolve(fixture.root, 'dist')

    try {
      writeFileSync(
        resolve(fixture.dataDirectory, 'ai-tools.json'),
        JSON.stringify(catalog),
        'utf8'
      )
      writeFileSync(scenarioPath, JSON.stringify(scenarioCatalog), 'utf8')

      generateFixture(fixture.root)
      rmSync(resolve(fixture.root, 'docs/.vitepress/theme'), { recursive: true, force: true })
      createDirectoryLink(resolve(root, 'node_modules'), resolve(fixture.root, 'node_modules'))
      execFileSync(process.execPath, [
        resolve(root, 'node_modules/vitepress/bin/vitepress.js'),
        'build',
        resolve(fixture.root, 'docs'),
        '--outDir',
        buildDirectory
      ], { cwd: root, encoding: 'utf8' })

      const categoryHtml = readFileSync(resolve(buildDirectory, 'ai-categories/chat.html'), 'utf8')
      const scenarioHtml = readFileSync(resolve(buildDirectory, 'ai-scenarios/study.html'), 'utf8')
      const detailHtml = readFileSync(resolve(buildDirectory, 'tools/chatgpt.html'), 'utf8')
      const indexHtml = readFileSync(resolve(buildDirectory, 'ai-scenarios/index.html'), 'utf8')
      const javascript = compiledFiles(resolve(buildDirectory, 'assets'), '.js')
      expect(categoryHtml).toContain(`Markdown generated sink ${expression} &lt;img`)
      expect(categoryHtml).toContain(`Scenario description generated sink ${expression} &lt;img`)
      expect(scenarioHtml).toContain(`Scenario guide generated sink ${expression} &lt;img`)
      expect(detailHtml).toContain('Frontmatter generated sink &#123;&#123;globalThis?.alert?.(1)&#125;&#125; &lt;img')
      expect(categoryHtml).toContain(`JSON-LD generated sink ${expression}`)
      expect(indexHtml).toContain(`Scenario name generated sink ${expression} &lt;img`)
      expect(`${categoryHtml}\n${scenarioHtml}\n${detailHtml}\n${indexHtml}`)
        .not.toMatch(/<img\s+src=["']?https:\/\/evil\.example\/x[^>]*onerror/iu)
      expect(javascript).toMatch(/<span>[^<]*\{\{globalThis\?\.alert\?\.\(1\)\}\}[^<]*&lt;img/u)
      expect(javascript).not.toMatch(/(?:toDisplayString|_ctx\.)\([^)]*globalThis(?:\?\.|\.)alert/iu)
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('escapes catalog strings at every generated Markdown text sink', () => {
    const fixture = createFixture('ai-page-markdown-escape-')
    const catalog = cloneCatalog()
    catalog[0].name = 'Unsafe <img src=x onerror=alert(1)> [label](https://evil.example/)'
    catalog[0].tagline = 'Image ![pixel](https://evil.example/pixel) ```html\n---\n# injected'

    try {
      writeFileSync(
        resolve(fixture.dataDirectory, 'ai-tools.json'),
        JSON.stringify(catalog),
        'utf8'
      )

      generateFixture(fixture.root)

      const sources = [
        readFileSync(resolve(fixture.toolsDirectory, 'index.md'), 'utf8'),
        readFileSync(resolve(fixture.categoriesDirectory, 'chat.md'), 'utf8'),
        ...readdirSync(fixture.scenariosDirectory)
          .filter((name) => name.endsWith('.md'))
          .map((name) => readFileSync(resolve(fixture.scenariosDirectory, name), 'utf8'))
      ].join('\n')
      const markdownText = sources.replace(/^\s+\{.*\}$/gmu, '')
      expect(markdownText).not.toContain('<img')
      expect(markdownText).not.toContain('onerror=')
      expect(markdownText).not.toContain('[label](https://evil.example/)')
      expect(markdownText).not.toContain('![pixel](https://evil.example/pixel)')
      expect(markdownText).not.toContain('```html')
      expect(markdownText).not.toMatch(/\n---\n# injected/u)
      expect(markdownText).toContain('\\u003cimg')
      expect(markdownText).toContain('\\u005blabel\\u005d')
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })
})
