import {
  copyFileSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { generateAiPages, validateTools } from '../generate-ai-pages.mjs'

function catalogError() {
  return Object.assign(new Error('catalog_validation_failed'), {
    code: 'catalog_validation_failed'
  })
}

function isWithin(path, parent) {
  const difference = relative(resolve(parent), resolve(path))
  return difference === '' || (!difference.startsWith(`..${sep}`) && difference !== '..' && !isAbsolute(difference))
}

function catalogPaths(projectRoot, catalogPath) {
  const root = resolve(projectRoot)
  const domainRoot = join(root, 'docs', '.vitepress', 'theme', 'domain')
  const expectedCatalog = join(domainRoot, 'ai-tools.json')
  const actualCatalog = resolve(catalogPath)
  if (actualCatalog !== expectedCatalog || !isWithin(actualCatalog, domainRoot)) {
    throw catalogError()
  }
  return { root, domainRoot, catalog: actualCatalog }
}

export function domainKey(value) {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function dateOnly(value) {
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) throw catalogError()
  return parsed.toISOString().slice(0, 10)
}

export function alternativesFor(tools, category, slug) {
  const matches = tools
    .filter((tool) => tool.category === category && tool.slug !== slug)
    .map((tool) => tool.slug)
    .slice(0, 2)
  if (matches.length !== 2) throw catalogError()
  return matches
}

export function loadCatalog({ projectRoot, catalogPath }) {
  const paths = catalogPaths(projectRoot, catalogPath)
  try {
    const tools = validateTools(JSON.parse(readFileSync(paths.catalog, 'utf8')))
    return Object.freeze({
      ...paths,
      scenarioPath: join(paths.domainRoot, 'ai-scenarios.json'),
      tools: Object.freeze([...tools])
    })
  } catch (error) {
    if (error?.code === 'catalog_validation_failed') throw error
    throw catalogError()
  }
}

function validateCandidateInTemporaryProject(candidate, scenarioPath) {
  const temporaryRoot = mkdtempSync(join(tmpdir(), 'xunqi-candidate-'))
  try {
    const temporaryCatalog = join(
      temporaryRoot,
      'docs',
      '.vitepress',
      'theme',
      'domain',
      'ai-tools.json'
    )
    mkdirSync(dirname(temporaryCatalog), { recursive: true })
    writeFileSync(temporaryCatalog, `${JSON.stringify(candidate, null, 2)}\n`, 'utf8')
    copyFileSync(scenarioPath, join(dirname(temporaryCatalog), 'ai-scenarios.json'))
    generateAiPages({
      root: temporaryRoot,
      dataPath: temporaryCatalog,
      logger: () => undefined
    })
  } catch {
    throw catalogError()
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true })
  }
}

function replaceCatalogAndGenerate(candidate, paths) {
  const token = randomUUID()
  const nextPath = join(paths.domainRoot, `.ai-tools.${token}.tmp`)
  const backupPath = join(paths.domainRoot, `.ai-tools.${token}.backup`)
  const serialized = `${JSON.stringify(candidate, null, 2)}\n`
  writeFileSync(nextPath, serialized, { encoding: 'utf8', flag: 'wx' })
  validateTools(JSON.parse(readFileSync(nextPath, 'utf8')))

  let movedOriginal = false
  try {
    renameSync(paths.catalog, backupPath)
    movedOriginal = true
    renameSync(nextPath, paths.catalog)
    generateAiPages({ root: paths.root, dataPath: paths.catalog, logger: () => undefined })
    rmSync(backupPath, { force: true })
  } catch {
    rmSync(nextPath, { force: true })
    if (movedOriginal) {
      rmSync(paths.catalog, { force: true })
      renameSync(backupPath, paths.catalog)
      try {
        generateAiPages({ root: paths.root, dataPath: paths.catalog, logger: () => undefined })
      } catch {
        // The original catalog is restored even if generated-page recovery is unavailable.
      }
    }
    throw catalogError()
  }
}

export function appendCatalogTools({ context, tools }) {
  if (!Array.isArray(tools) || tools.length === 0) throw catalogError()
  const candidate = [...context.tools, ...tools]
  try {
    validateTools(candidate)
    validateCandidateInTemporaryProject(candidate, context.scenarioPath)
    replaceCatalogAndGenerate(candidate, context)
  } catch (error) {
    if (error?.code === 'catalog_validation_failed') throw error
    throw catalogError()
  }
  return Object.freeze(candidate)
}
