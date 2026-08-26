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

function cloneCatalog(): Array<Record<string, unknown>> {
  return JSON.parse(readFileSync(catalogPath, 'utf8')) as Array<Record<string, unknown>>
}

function createFixture(prefix: string): {
  root: string
  dataDirectory: string
  toolsDirectory: string
  categoriesDirectory: string
  manifestPath: string
} {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), prefix))
  const dataDirectory = resolve(fixtureRoot, 'docs/.vitepress/theme/domain')
  const toolsDirectory = resolve(fixtureRoot, 'docs/tools')
  const categoriesDirectory = resolve(fixtureRoot, 'docs/ai-categories')
  const manifestPath = resolve(fixtureRoot, 'docs/.vitepress/ai-pages-manifest.json')

  mkdirSync(dataDirectory, { recursive: true })
  writeFileSync(
    resolve(dataDirectory, 'ai-tools.json'),
    JSON.stringify(cloneCatalog()),
    'utf8'
  )

  return {
    root: fixtureRoot,
    dataDirectory,
    toolsDirectory,
    categoriesDirectory,
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

function createDirectoryLink(target: string, linkPath: string): void {
  symlinkSync(target, linkPath, process.platform === 'win32' ? 'junction' : 'dir')
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
      'docs/tools/index.md',
      'docs/ai-categories/index.md'
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
      expect(manifest).toHaveLength(74)
      expect(manifest).toEqual(expectedManifest)
      expect(new Set(manifest).size).toBe(manifest.length)
      expect(manifest).toContain('docs/tools/chatgpt.md')
      expect(manifest).toContain('docs/tools/julius-ai.md')
      expect(manifest).toContain('docs/ai-categories/marketing.md')
      expect(manifest).toContain('docs/ai-categories/automation.md')
      expect(manifest).not.toContain('docs/ai-categories/productivity.md')
      expect(existsSync(oldCategory)).toBe(false)
      expect(readFileSync(siblingFile, 'utf8')).toBe('preserve sibling')
      expect(manifest.every((path) => existsSync(resolve(fixture.root, path)))).toBe(true)
      expect(
        manifest.every(
          (path) =>
            /^docs\/tools\/(?:[a-z0-9]+(?:-[a-z0-9]+)*|index)\.md$/.test(path) ||
            /^docs\/ai-categories\/(?:[a-z0-9]+(?:-[a-z0-9]+)*|index)\.md$/.test(path)
        )
      ).toBe(true)

      catalog.forEach((tool) => {
        const slug = String(tool.slug)
        const source = readFileSync(resolve(fixture.root, `docs/tools/${slug}.md`), 'utf8')
        expect(source.match(/<ToolDetail\b/g)).toHaveLength(1)
        expect(source).toContain(`<ToolDetail slug="${slug}" />`)
      })
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('keeps CLI execution isolated while reporting generated counts', () => {
    const fixture = createFixture('ai-page-cli-')
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
        'Generated 63 tool pages and 9 category pages.\n'
      )
      expect(manifest).toHaveLength(74)
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('keeps the committed generated artifacts in sync without rewriting them', () => {
    const catalog = cloneCatalog()
    const manifest = JSON.parse(
      readFileSync(resolve(root, 'docs/.vitepress/ai-pages-manifest.json'), 'utf8')
    ) as string[]
    const expectedManifest = [
      ...catalog.map((tool) => `docs/tools/${tool.slug}.md`),
      ...categories.map((category) => `docs/ai-categories/${category}.md`),
      'docs/tools/index.md',
      'docs/ai-categories/index.md'
    ]

    expect(manifest).toEqual(expectedManifest)
    expect(manifest.every((path) => existsSync(resolve(root, path)))).toBe(true)
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
      expect(source).toContain(`title: ${JSON.stringify(`${name} - AI 工具介绍`)}\n`)
      expect(source).toContain(`description: ${JSON.stringify(description)}\n`)
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })
})
