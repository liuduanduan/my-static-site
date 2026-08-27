import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { randomUUID } from 'node:crypto'
import { generateAiPages, validateTools } from '../generate-ai-pages.mjs'
import { buildCatalogTool } from '../../shared/submissions/contentDraft.mjs'

const allowedRetryableErrors = new Set([
  'official_fetch_rejected',
  'official_fetch_failed',
  'enricher_failed'
])

export class CurationError extends Error {
  constructor(code, statusUpdate) {
    super(code)
    this.name = 'CurationError'
    this.code = code
    this.statusUpdate = statusUpdate
  }
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
    throw new CurationError('catalog_validation_failed', {
      status: 'error',
      errorCode: 'catalog_validation_failed'
    })
  }
  return { root, domainRoot, catalog: actualCatalog }
}

function domainKey(value) {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return ''
  }
}

function dateOnly(value) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new CurationError('catalog_validation_failed', {
      status: 'error',
      errorCode: 'catalog_validation_failed'
    })
  }
  return date.toISOString().slice(0, 10)
}

function alternativesFor(tools, category, slug) {
  const values = tools
    .filter((tool) => tool.category === category && tool.slug !== slug)
    .map((tool) => tool.slug)
    .slice(0, 2)
  if (values.length !== 2) {
    throw new CurationError('catalog_validation_failed', {
      status: 'error',
      errorCode: 'catalog_validation_failed'
    })
  }
  return values
}

function duplicateError() {
  return new CurationError('duplicate_catalog_entry', {
    status: 'needs_info',
    publicMessage: '官网或工具标识与现有目录重复，请补充说明。'
  })
}

function prBody(submission, tool) {
  return [
    '## 收录申请',
    '',
    `- 申请编号：\`${submission.publicRef}\``,
    `- 工具：${tool.name}`,
    `- 官方地址：${tool.url}`,
    `- 分类：${tool.category}`,
    '',
    '本变更由受保护的定时任务根据公开官网证据生成，必须经过人工审核才可合并。',
    '',
    '## 人工核验清单',
    '',
    '- [ ] 官方域名',
    '- [ ] 定价措辞及“以官网为准”声明',
    '- [ ] 中文支持情况',
    '- [ ] Logo / 品牌素材使用权',
    '- [ ] 分类',
    '- [ ] 三个使用场景',
    '- [ ] 三个核心能力',
    '- [ ] 优点 / 限制',
    '- [ ] 两个替代工具',
    '- [ ] 商业标注隔离，未修改编辑精选',
    '- [ ] 目录校验、测试与生产构建均成功',
    '',
    '> 该申请不保证收录；赞助、联盟或加急意向不影响编辑判断。'
  ].join('\n')
}

function validateCandidateInTemporaryProject(candidate) {
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
    generateAiPages({
      root: temporaryRoot,
      dataPath: temporaryCatalog,
      logger: () => undefined
    })
  } catch {
    throw new CurationError('catalog_validation_failed', {
      status: 'error',
      errorCode: 'catalog_validation_failed'
    })
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
  } catch (error) {
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
    throw new CurationError('catalog_validation_failed', {
      status: 'error',
      errorCode: 'catalog_validation_failed'
    })
  }
}

export async function curateToolSubmission(submission, deps) {
  const paths = catalogPaths(deps.projectRoot, deps.catalogPath)
  let tools
  try {
    tools = validateTools(JSON.parse(readFileSync(paths.catalog, 'utf8')))
  } catch {
    throw new CurationError('catalog_validation_failed', {
      status: 'error',
      errorCode: 'catalog_validation_failed'
    })
  }

  const submittedDomain = String(submission.normalizedDomain).toLowerCase().replace(/^www\./, '')
  if (!submittedDomain || tools.some((tool) => domainKey(tool.url) === submittedDomain)) {
    throw duplicateError()
  }

  const evidence = await deps.fetchOfficialPage(submission.officialUrl)
  const draft = await deps.enricher.enrich(submission, evidence)
  if (tools.some((tool) => tool.slug === draft.slug)) throw duplicateError()

  const alternatives = alternativesFor(tools, submission.category, draft.slug)
  const tool = buildCatalogTool(submission, draft, alternatives, dateOnly(deps.now()))
  const candidate = [...tools, tool]
  try {
    validateTools(candidate)
    validateCandidateInTemporaryProject(candidate)
    replaceCatalogAndGenerate(candidate, paths)
  } catch (error) {
    if (error instanceof CurationError) throw error
    throw new CurationError('catalog_validation_failed', {
      status: 'error',
      errorCode: 'catalog_validation_failed'
    })
  }

  return Object.freeze({
    hasChanges: true,
    submissionId: submission.id,
    submissionRef: submission.publicRef,
    slug: tool.slug,
    branch: `submission/${submission.publicRef}-${tool.slug}`,
    prTitle: `收录 ${tool.name}`,
    prBody: prBody(submission, tool)
  })
}

export async function runCurationOnce(deps) {
  const submission = await deps.client.claimOne()
  if (!submission) return { hasChanges: false }
  const identity = {
    hasChanges: false,
    submissionId: submission.id,
    submissionRef: submission.publicRef
  }
  if (!deps.enricher) {
    await deps.client.updateSubmission(submission.id, {
      status: 'needs_enrichment',
      errorCode: 'enricher_unconfigured'
    })
    return identity
  }

  try {
    return await curateToolSubmission(submission, deps)
  } catch (error) {
    if (error instanceof CurationError) {
      await deps.client.updateSubmission(submission.id, error.statusUpdate)
      if (error.statusUpdate.status === 'needs_info') return identity
      throw error
    }
    if (error?.code === 'enricher_invalid_output') {
      await deps.client.updateSubmission(submission.id, {
        status: 'needs_enrichment',
        errorCode: 'enricher_invalid_output'
      })
      return identity
    }
    if (allowedRetryableErrors.has(error?.code)) {
      await deps.client.updateSubmission(submission.id, {
        status: 'error',
        errorCode: error.code
      })
    }
    throw error
  }
}
