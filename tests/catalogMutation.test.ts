import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  alternativesFor,
  appendCatalogTools,
  domainKey,
  loadCatalog
} from '../scripts/catalog/catalogMutation.mjs'

const sourceCatalog = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../docs/.vitepress/theme/domain/ai-tools.json'
)
const sourceScenarios = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../docs/.vitepress/theme/domain/ai-scenarios.json'
)

describe('shared catalog mutation', () => {
  let projectRoot: string
  let catalogPath: string

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), 'xunqi-catalog-mutation-'))
    catalogPath = join(projectRoot, 'docs/.vitepress/theme/domain/ai-tools.json')
    mkdirSync(dirname(catalogPath), { recursive: true })
    copyFileSync(sourceCatalog, catalogPath)
    copyFileSync(sourceScenarios, join(dirname(catalogPath), 'ai-scenarios.json'))
  })

  afterEach(() => rmSync(projectRoot, { recursive: true, force: true }))

  it('normalizes www domains and selects two deterministic same-category alternatives', () => {
    expect(domainKey('https://www.Example.com/product')).toBe('example.com')
    expect(alternativesFor([
      { slug: 'alpha', category: 'chat' },
      { slug: 'beta', category: 'chat' },
      { slug: 'gamma', category: 'writing' }
    ], 'chat', 'new-tool')).toEqual(['alpha', 'beta'])
  })

  it('appends a valid tool after temporary-project validation succeeds', () => {
    const sourceTools = JSON.parse(readFileSync(catalogPath, 'utf8')) as Array<Record<string, unknown>>
    const { featuredOrder: _featuredOrder, ...baseTool } = sourceTools[0]
    const validTool = {
      ...baseTool,
      slug: 'catalog-mutation-test',
      name: 'Catalog Mutation Test',
      url: 'https://catalog-mutation-test.example/'
    }
    const context = loadCatalog({ projectRoot, catalogPath })

    const result = appendCatalogTools({
      context,
      tools: [validTool]
    })

    expect(result).toHaveLength(context.tools.length + 1)
    expect(JSON.parse(readFileSync(catalogPath, 'utf8'))).toContainEqual(validTool)
  })

  it('restores the original catalog when live generation fails after the catalog swap', () => {
    const sourceTools = JSON.parse(readFileSync(catalogPath, 'utf8')) as Array<Record<string, unknown>>
    const { featuredOrder: _featuredOrder, ...baseTool } = sourceTools[0]
    const validTool = {
      ...baseTool,
      slug: 'catalog-rollback-test',
      name: 'Catalog Rollback Test',
      url: 'https://catalog-rollback-test.example/'
    }
    const context = loadCatalog({ projectRoot, catalogPath })
    const before = readFileSync(catalogPath, 'utf8')
    writeFileSync(join(projectRoot, 'docs', 'tools'), 'obstruct live page generation', 'utf8')

    expect(() => appendCatalogTools({ context, tools: [validTool] }))
      .toThrow('catalog_validation_failed')
    expect(readFileSync(catalogPath, 'utf8')).toBe(before)
  })
})
