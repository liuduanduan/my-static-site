import { createHash } from 'node:crypto'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { safeFetchOfficialPage } from './submissions/safeOfficialFetch.mjs'

const scriptPath = fileURLToPath(import.meta.url)
const projectRoot = resolve(dirname(scriptPath), '..')

function readCatalog(path) {
  const value = JSON.parse(readFileSync(path, 'utf8'))
  if (!Array.isArray(value)) throw new Error('AI tool catalog must be an array')
  return value.map((tool, index) => {
    if (
      !tool ||
      typeof tool !== 'object' ||
      typeof tool.slug !== 'string' ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tool.slug) ||
      typeof tool.url !== 'string' ||
      !tool.url.startsWith('https://')
    ) throw new Error(`Invalid AI tool link record at index ${index}`)
    return { slug: tool.slug, url: tool.url }
  })
}

function publicErrorCode(error) {
  return error?.code === 'official_fetch_rejected'
    ? 'official_fetch_rejected'
    : 'official_fetch_failed'
}

function safeStatusCode(value) {
  return Number.isInteger(value) && value >= 100 && value <= 599 ? value : undefined
}

function evidenceFingerprint(evidence) {
  return createHash('sha256')
    .update(JSON.stringify([
      evidence.finalUrl,
      evidence.statusCode,
      evidence.title,
      evidence.metaDescription,
      evidence.visibleText
    ]))
    .digest('hex')
}

async function inspectPricePage(url, fetchOfficialPage) {
  try {
    const evidence = await fetchOfficialPage(url)
    return {
      url,
      status: 'healthy',
      statusCode: evidence.statusCode,
      finalUrl: evidence.finalUrl,
      title: evidence.title,
      fingerprint: evidenceFingerprint(evidence)
    }
  } catch (error) {
    return {
      url,
      status: 'failed',
      ...(safeStatusCode(error?.statusCode) ? { statusCode: error.statusCode } : {}),
      errorCode: publicErrorCode(error)
    }
  }
}

function readBaseline(path) {
  if (!path || !existsSync(path)) return null
  try {
    const value = JSON.parse(readFileSync(path, 'utf8'))
    if (!value || !Array.isArray(value.results)) return null
    return new Map(
      value.results
        .filter((item) => item && typeof item.slug === 'string')
        .map((item) => [item.slug, item])
    )
  } catch {
    return null
  }
}

function priceSignature(value) {
  if (!Array.isArray(value)) return '[]'
  return JSON.stringify(
    [...value]
      .map((item) => ({
        url: item?.url ?? '',
        status: item?.status ?? '',
        statusCode: item?.statusCode ?? null,
        finalUrl: item?.finalUrl ?? '',
        title: item?.title ?? '',
        fingerprint: item?.fingerprint ?? '',
        errorCode: item?.errorCode ?? ''
      }))
      .sort((left, right) => left.url.localeCompare(right.url))
  )
}

function changesFromBaseline(results, baseline) {
  if (!baseline) return []
  const changes = []
  for (const current of results) {
    const previous = baseline.get(current.slug)
    if (!previous) continue
    const reasons = []
    if (
      previous.status !== current.status ||
      (previous.statusCode ?? null) !== (current.statusCode ?? null)
    ) reasons.push('http_status')
    if ((previous.finalUrl ?? '') !== (current.finalUrl ?? '')) reasons.push('redirect')
    if ((previous.title ?? '') !== (current.title ?? '')) reasons.push('title')
    if (priceSignature(previous.pricePages) !== priceSignature(current.pricePages)) {
      reasons.push('pricing_fingerprint')
    }
    if (reasons.length) changes.push({ slug: current.slug, reasons })
  }
  return changes
}

const reasonLabels = {
  http_status: 'HTTP 状态',
  redirect: '重定向目标',
  title: '页面标题',
  pricing_fingerprint: '价格页指纹'
}

function writeAuditTask(path, changes, generatedAt) {
  if (!path) return
  if (!changes.length) {
    rmSync(path, { force: true })
    return
  }
  const lines = [
    '## AI 工具官网变化审核',
    '',
    `检测时间：${generatedAt}`,
    '',
    '以下只读检查发现基线变化。请人工核验官网后再决定是否修改公开目录；本任务不会自动改写工具内容。',
    ''
  ]
  for (const change of changes) {
    lines.push(`- \`${change.slug}\`：${change.reasons.map((reason) => reasonLabels[reason]).join('、')}`)
  }
  lines.push(
    '',
    '- [ ] 核验官网所有权与当前跳转',
    '- [ ] 核验标题与产品定位',
    '- [ ] 核验定价页面及公开措辞',
    ''
  )
  writeFileSync(path, `${lines.join('\n')}\n`, 'utf8')
}

export async function checkAiToolLinks({
  catalogPath,
  reportPath,
  baselinePath,
  auditPath,
  fetchOfficialPage = safeFetchOfficialPage,
  now = () => new Date(),
  logger = console,
  concurrency = 3
}) {
  if (!catalogPath || !reportPath) throw new Error('catalogPath and reportPath are required')
  if (concurrency !== 3) throw new Error('Official link checks must use concurrency 3')
  const tools = readCatalog(catalogPath)
  const results = new Array(tools.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < tools.length) {
      const index = nextIndex
      nextIndex += 1
      const tool = tools[index]
      try {
        const evidence = await fetchOfficialPage(tool.url)
        const pricePages = []
        for (const priceUrl of evidence.pricingLinks ?? []) {
          pricePages.push(await inspectPricePage(priceUrl, fetchOfficialPage))
        }
        results[index] = {
          slug: tool.slug,
          url: tool.url,
          status: 'healthy',
          statusCode: evidence.statusCode,
          finalUrl: evidence.finalUrl,
          title: evidence.title,
          pricePages
        }
      } catch (error) {
        results[index] = {
          slug: tool.slug,
          url: tool.url,
          status: 'failed',
          ...(safeStatusCode(error?.statusCode) ? { statusCode: error.statusCode } : {}),
          errorCode: publicErrorCode(error)
        }
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, tools.length) }, () => worker()))
  const healthy = results.filter((result) => result.status === 'healthy').length
  const failed = results.length - healthy
  const generatedAt = now().toISOString()
  const changes = changesFromBaseline(results, readBaseline(baselinePath))
  const report = {
    generatedAt,
    checked: results.length,
    healthy,
    failed,
    changes,
    results
  }
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  writeAuditTask(auditPath, changes, generatedAt)
  logger.info(
    `Checked ${results.length} official link(s): ${healthy} healthy, ${failed} failed, ${changes.length} changed.`
  )
  return {
    checked: results.length,
    healthy,
    failed,
    changed: changes.length,
    auditRequired: changes.length > 0
  }
}

function argumentValue(name) {
  const index = process.argv.indexOf(name)
  return index >= 0 && process.argv[index + 1] ? resolve(process.argv[index + 1]) : undefined
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const catalogPath = resolve(projectRoot, 'docs/.vitepress/theme/domain/ai-tools.json')
  const reportPath = resolve(projectRoot, 'ai-tool-link-report.json')
  const baselinePath = argumentValue('--baseline')
  const auditPath = argumentValue('--audit')
  try {
    await checkAiToolLinks({ catalogPath, reportPath, baselinePath, auditPath })
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Official link health check failed.')
    process.exitCode = 1
  }
}
