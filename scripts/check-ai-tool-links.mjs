import { readFileSync, writeFileSync } from 'node:fs'
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

export async function checkAiToolLinks({
  catalogPath,
  reportPath,
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
        results[index] = {
          slug: tool.slug,
          url: tool.url,
          status: 'healthy',
          finalUrl: evidence.finalUrl
        }
      } catch (error) {
        results[index] = {
          slug: tool.slug,
          url: tool.url,
          status: 'failed',
          errorCode: publicErrorCode(error)
        }
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, tools.length) }, () => worker()))
  const healthy = results.filter((result) => result.status === 'healthy').length
  const failed = results.length - healthy
  const report = {
    generatedAt: now().toISOString(),
    checked: results.length,
    healthy,
    failed,
    results
  }
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  logger.info(`Checked ${results.length} official link(s): ${healthy} healthy, ${failed} failed.`)
  return { checked: results.length, healthy, failed }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const catalogPath = resolve(projectRoot, 'docs/.vitepress/theme/domain/ai-tools.json')
  const reportPath = resolve(projectRoot, 'ai-tool-link-report.json')
  try {
    await checkAiToolLinks({ catalogPath, reportPath })
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Official link health check failed.')
    process.exitCode = 1
  }
}
