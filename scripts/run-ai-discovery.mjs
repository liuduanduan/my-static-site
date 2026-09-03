import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createDiscoveryEnricher } from './discovery/discoveryEnricher.mjs'
import { runDiscovery } from './discovery/runDiscovery.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const defaultProjectRoot = resolve(scriptDirectory, '..')
const allowedOutputNames = new Set([
  'ai-discovery-state.json',
  'ai-discovery-review.md',
  'discovered-urls.txt'
])

function isWithin(path, root) {
  const difference = relative(resolve(root), resolve(path))
  return difference === '' || (!difference.startsWith(`..${sep}`) && difference !== '..' && !isAbsolute(difference))
}

function repositoryPath(value, kind, { output = false, projectRoot = defaultProjectRoot } = {}) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`invalid_${kind}_path`)
  const path = resolve(projectRoot, value)
  if (!isWithin(path, projectRoot)) throw new Error(`invalid_${kind}_path`)
  if (output && !allowedOutputNames.has(relative(projectRoot, path))) throw new Error(`invalid_${kind}_path`)
  return path
}

function parseArguments(argv) {
  const values = {
    config: 'config/ai-discovery-sources.json',
    state: '.baseline/ai-discovery-state.json',
    output: 'ai-discovery-state.json',
    review: 'ai-discovery-review.md',
    urls: 'discovered-urls.txt',
    dryRun: false
  }
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index]
    if (argument === '--dry-run') {
      values.dryRun = true
      continue
    }
    if (!['--config', '--state', '--output', '--review', '--urls'].includes(argument)) {
      throw new Error('invalid_discovery_arguments')
    }
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) throw new Error('invalid_discovery_arguments')
    values[argument.slice(2)] = value
    index += 1
  }
  return values
}

function readJson(path, missingValue) {
  if (!existsSync(path)) return missingValue
  return JSON.parse(readFileSync(path, 'utf8'))
}

function reviewReport(result) {
  const sourceRows = result.sourceSummaries.map((item) => `- \`${item.errorCode ?? 'source_checked'}\` — ${item.sourceId} — candidates: ${item.candidateCount}`)
  const candidateRows = result.review.map((item) => `- \`${item.errorCode}\` — ${item.sourceId} — ${item.key}`)
  return [
    '# AI discovery review',
    '',
    '## Source health',
    '',
    ...sourceRows,
    '',
    '## Candidate review',
    '',
    ...candidateRows,
    ''
  ].join('\n')
}

function prBody(result) {
  const tools = result.published.map((item) => [
    `- 工具：${item.name}`,
    `  - 官方地址：${item.officialUrl}`,
    `  - 来源：${item.sourceId}`,
    `  - 确定性门槛评分：${item.gateScore}`
  ].join('\n'))
  return [
    '## 自动发现的 AI 工具',
    '',
    ...tools,
    '',
    '本变更来自受保护的定时任务，必须经过人工审核才可合并。',
    '',
    '## 人工核验清单',
    '',
    '- [ ] 官方域名和落地页',
    '- [ ] 定价措辞及“以官网为准”声明',
    '- [ ] 中文支持和账户要求',
    '- [ ] 分类、替代工具和品牌素材使用权',
    '- [ ] 目录校验、测试与生产构建均成功'
  ].join('\n')
}

function githubOutput(name, value, outputPath) {
  if (!outputPath) return
  const delimiter = `xunqi_${crypto.randomUUID().replaceAll('-', '')}`
  appendFileSync(outputPath, `${name}<<${delimiter}\n${String(value ?? '')}\n${delimiter}\n`, 'utf8')
}

function emitGithubOutputs(result, paths, outputPath, now = new Date()) {
  const branch = result.hasChanges ? `discovery/${now.toISOString().slice(0, 10)}` : ''
  const title = result.hasChanges ? `收录 ${result.published.length} 个 AI 工具` : ''
  const body = result.hasChanges ? prBody(result) : ''
  const values = {
    has_changes: result.hasChanges ? 'true' : 'false',
    slugs: result.published.map(({ slug }) => slug).join('\n'),
    branch,
    pr_title: title,
    pr_body: body,
    review_path: result.review.length || result.sourceSummaries.length ? paths.review : '',
    state_path: paths.output,
    changed_urls_path: paths.urls
  }
  Object.entries(values).forEach(([name, value]) => githubOutput(name, value, outputPath))
  return Object.freeze({ branch, prTitle: title, prBody: body })
}

export async function runDiscoveryFromEnvironment(env = process.env, options = {}) {
  const args = parseArguments(options.argv ?? process.argv.slice(2))
  const projectRoot = resolve(options.projectRoot ?? defaultProjectRoot)
  const paths = {
    config: repositoryPath(args.config, 'config', { projectRoot }),
    state: repositoryPath(args.state, 'state', { projectRoot }),
    output: repositoryPath(args.output, 'output', { output: true, projectRoot }),
    review: repositoryPath(args.review, 'review', { output: true, projectRoot }),
    urls: repositoryPath(args.urls, 'urls', { output: true, projectRoot })
  }
  const result = await runDiscovery({
    config: readJson(paths.config),
    state: readJson(paths.state, { version: 1, outcomes: [] }),
    catalogPath: resolve(projectRoot, 'docs/.vitepress/theme/domain/ai-tools.json'),
    projectRoot,
    dryRun: args.dryRun,
    enricher: options.enricher === undefined
      ? createDiscoveryEnricher({ apiKey: env.CONTENT_ENRICHER_API_KEY, model: env.CONTENT_ENRICHER_MODEL, fetch: options.fetch })
      : options.enricher,
    discoverFromSources: options.discoverFromSources,
    fetchOfficialPage: options.fetchOfficialPage,
    now: options.now,
    fetch: options.fetch
  })
  mkdirSync(dirname(paths.output), { recursive: true })
  writeFileSync(paths.output, `${JSON.stringify(result.nextState, null, 2)}\n`, 'utf8')
  mkdirSync(dirname(paths.urls), { recursive: true })
  writeFileSync(paths.urls, result.changedUrls.length ? `${result.changedUrls.join('\n')}\n` : '', 'utf8')
  if (result.review.length || result.sourceSummaries.length) {
    mkdirSync(dirname(paths.review), { recursive: true })
    writeFileSync(paths.review, reviewReport(result), 'utf8')
  }
  const outputs = emitGithubOutputs(result, paths, options.githubOutput ?? env.GITHUB_OUTPUT, options.now?.() ?? new Date())
  return Object.freeze({ ...result, ...outputs, paths: Object.freeze(paths) })
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runDiscoveryFromEnvironment().catch((error) => {
    process.stderr.write(`${typeof error?.message === 'string' ? error.message : 'discovery_failed'}\n`)
    process.exitCode = 1
  })
}
