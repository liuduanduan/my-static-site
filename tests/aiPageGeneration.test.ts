import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { generatePages, isWithin, validateTools } from '../scripts/generate-ai-pages.mjs'

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

describe('AI page generation', () => {
  it('generates the complete static directory from the catalog', () => {
    const output = execFileSync(process.execPath, ['scripts/generate-ai-pages.mjs'], {
      cwd: root,
      encoding: 'utf8'
    })
    const manifest = JSON.parse(
      readFileSync(resolve(root, 'docs/.vitepress/ai-pages-manifest.json'), 'utf8')
    ) as string[]
    const catalog = cloneCatalog()
    const expectedManifest = [
      ...catalog.map((tool) => `docs/tools/${tool.slug}.md`),
      ...categories.map((category) => `docs/ai-categories/${category}.md`),
      'docs/tools/index.md',
      'docs/ai-categories/index.md'
    ]

    expect(output).toContain('Generated 63 tool pages and 9 category pages.')
    expect(manifest).toHaveLength(74)
    expect(manifest).toEqual(expectedManifest)
    expect(new Set(manifest).size).toBe(manifest.length)
    expect(manifest).toContain('docs/tools/chatgpt.md')
    expect(manifest).toContain('docs/tools/julius-ai.md')
    expect(manifest).toContain('docs/ai-categories/marketing.md')
    expect(manifest).toContain('docs/ai-categories/automation.md')
    expect(manifest).toContain('docs/tools/index.md')
    expect(manifest).toContain('docs/ai-categories/index.md')
    expect(manifest).not.toContain('docs/ai-categories/productivity.md')
    expect(existsSync(resolve(root, 'docs/ai-categories/productivity.md'))).toBe(false)
    expect(manifest.every((path) => existsSync(resolve(root, path)))).toBe(true)
    expect(
      manifest.every(
        (path) =>
          /^docs\/tools\/(?:[a-z0-9]+(?:-[a-z0-9]+)*|index)\.md$/.test(path) ||
          /^docs\/ai-categories\/(?:[a-z0-9]+(?:-[a-z0-9]+)*|index)\.md$/.test(path)
      )
    ).toBe(true)

    catalog.forEach((tool) => {
      const slug = String(tool.slug)
      const source = readFileSync(resolve(root, `docs/tools/${slug}.md`), 'utf8')
      expect(source.match(/<ToolDetail\b/g)).toHaveLength(1)
      expect(source).toContain(`<ToolDetail slug="${slug}" />`)
    })
  })

  it('uses resolved directory boundaries for generated-file cleanup', () => {
    const toolsDirectory = resolve(root, 'docs/tools')

    expect(isWithin(resolve(toolsDirectory, 'chatgpt.md'), toolsDirectory)).toBe(true)
    expect(isWithin(resolve(root, 'docs/tools-archive/chatgpt.md'), toolsDirectory)).toBe(false)
  })

  it('rejects every unsafe slug before generation can write files', () => {
    const catalog = cloneCatalog()
    catalog[0].slug = '../outside'

    expect(() => validateTools(catalog)).toThrow(/slug is unsafe/)
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

      expect(() => generatePages(fixtureRoot)).toThrow(/slug is unsafe/)
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

      generatePages(fixtureRoot)

      expect(existsSync(staleCategory)).toBe(false)
      expect(existsSync(staleTool)).toBe(false)
      expect(existsSync(preservedDirectory)).toBe(true)
      expect(readFileSync(siblingFile, 'utf8')).toBe('outside generated roots')
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true })
    }
  })
})
