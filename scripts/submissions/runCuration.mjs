import { appendFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createOpenAiContentEnricher } from './openAiContentEnricher.mjs'
import { safeFetchOfficialPage } from './safeOfficialFetch.mjs'
import { createSubmissionClient } from './submissionClient.mjs'
import { runCurationOnce } from './curateToolSubmission.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(scriptDirectory, '../..')

function output(name, value, file = process.env.GITHUB_OUTPUT) {
  const text = value === undefined || value === null ? '' : String(value)
  if (!file) return
  const delimiter = `xunqi_${crypto.randomUUID().replaceAll('-', '')}`
  appendFileSync(file, `${name}<<${delimiter}\n${text}\n${delimiter}\n`, 'utf8')
}

function emitResult(result, file) {
  output('has_changes', result.hasChanges ? 'true' : 'false', file)
  for (const key of [
    'submissionId',
    'submissionRef',
    'slug',
    'branch',
    'prTitle',
    'prBody'
  ]) {
    const outputName = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    output(outputName, result[key] ?? '', file)
  }
}

export async function runCurationFromEnvironment(env = process.env, options = {}) {
  const client = options.client ?? createSubmissionClient({
    baseUrl: env.SUBMISSIONS_API_BASE,
    adminToken: env.SUBMISSIONS_ADMIN_TOKEN,
    fetch: options.fetch
  })
  const enricher = options.enricher === undefined
    ? createOpenAiContentEnricher({
      apiKey: env.CONTENT_ENRICHER_API_KEY,
      model: env.CONTENT_ENRICHER_MODEL,
      fetch: options.fetch
    })
    : options.enricher
  const result = await runCurationOnce({
    client,
    enricher,
    fetchOfficialPage: options.fetchOfficialPage ?? safeFetchOfficialPage,
    catalogPath: resolve(projectRoot, 'docs/.vitepress/theme/domain/ai-tools.json'),
    projectRoot,
    now: options.now ?? (() => new Date())
  })
  emitResult(result, options.githubOutput ?? env.GITHUB_OUTPUT)
  return result
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCurationFromEnvironment().catch((error) => {
    const code = typeof error?.code === 'string' ? error.code : 'curation_failed'
    process.stderr.write(`${code}\n`)
    process.exitCode = 1
  })
}
