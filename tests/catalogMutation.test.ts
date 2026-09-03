import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync
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

  it('atomically appends a valid batch and restores the original catalog on generation failure', () => {
    const sourceTools = JSON.parse(readFileSync(catalogPath, 'utf8')) as Array<Record<string, unknown>>
    const validTool = {
      ...sourceTools[0],
      slug: 'catalog-mutation-test',
      name: 'Catalog Mutation Test',
      url: 'https://catalog-mutation-test.example/'
    }
    const context = loadCatalog({ projectRoot, catalogPath })
    const before = readFileSync(catalogPath, 'utf8')

    expect(() => appendCatalogTools({
      context,
      tools: [validTool, { ...validTool, slug: 'broken duplicate' }]
    })).toThrow('catalog_validation_failed')
    expect(readFileSync(catalogPath, 'utf8')).toBe(before)
  })
})
