import {
  alternativesFor,
  appendCatalogTools,
  dateOnly,
  domainKey,
  loadCatalog
} from '../catalog/catalogMutation.mjs'
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

function catalogError() {
  return new CurationError('catalog_validation_failed', {
    status: 'error',
    errorCode: 'catalog_validation_failed'
  })
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

export async function curateToolSubmission(submission, deps) {
  let context
  try {
    context = loadCatalog({
      projectRoot: deps.projectRoot,
      catalogPath: deps.catalogPath
    })
  } catch {
    throw catalogError()
  }

  const submittedDomain = String(submission.normalizedDomain).toLowerCase().replace(/^www\./, '')
  if (!submittedDomain || context.tools.some((tool) => domainKey(tool.url) === submittedDomain)) {
    throw duplicateError()
  }

  const evidence = await deps.fetchOfficialPage(submission.officialUrl)
  const draft = await deps.enricher.enrich(submission, evidence)
  if (context.tools.some((tool) => tool.slug === draft.slug)) throw duplicateError()

  let tool
  try {
    const alternatives = alternativesFor(context.tools, submission.category, draft.slug)
    tool = buildCatalogTool(submission, draft, alternatives, dateOnly(deps.now()))
    appendCatalogTools({ context, tools: [tool] })
  } catch (error) {
    if (error instanceof CurationError) throw error
    throw catalogError()
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
