import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const PULL_REQUEST_KEYS = Object.freeze([
  'number',
  'url',
  'headRefName',
  'isCrossRepository'
])
const SAFE_REPOSITORY = /^[A-Za-z0-9](?:[A-Za-z0-9_.-]{0,99})\/[A-Za-z0-9](?:[A-Za-z0-9_.-]{0,99})$/u
const SAFE_DISCOVERY_HEAD = /^discovery\/[A-Za-z0-9](?:[A-Za-z0-9._/-]{0,196}[A-Za-z0-9])?$/u

function invalidPendingPullRequests() {
  throw new Error('invalid_pending_discovery_pull_requests')
}

function validatedPullRequest(value, repository) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).length !== PULL_REQUEST_KEYS.length
    || PULL_REQUEST_KEYS.some((key) => !Object.hasOwn(value, key))
    || Object.keys(value).some((key) => !PULL_REQUEST_KEYS.includes(key))
    || !Number.isInteger(value.number) || value.number < 1
    || typeof value.url !== 'string' || value.url.length > 500
    || typeof value.headRefName !== 'string' || value.headRefName.length > 206
    || typeof value.isCrossRepository !== 'boolean') invalidPendingPullRequests()

  let url
  try {
    url = new URL(value.url)
  } catch {
    return invalidPendingPullRequests()
  }
  const expectedPath = `/${repository}/pull/${value.number}`.toLowerCase()
  if (url.protocol !== 'https:'
    || url.hostname !== 'github.com'
    || url.username || url.password || url.port || url.search || url.hash
    || url.pathname.toLowerCase() !== expectedPath) invalidPendingPullRequests()

  return Object.freeze({
    number: value.number,
    url: url.toString(),
    headRefName: value.headRefName,
    isCrossRepository: value.isCrossRepository
  })
}

export function inspectPendingDiscoveryPullRequests(value, repository) {
  if (typeof repository !== 'string' || !SAFE_REPOSITORY.test(repository)
    || !Array.isArray(value) || value.length > 100) invalidPendingPullRequests()

  const pullRequests = value.map((item) => validatedPullRequest(item, repository))
  const pending = pullRequests.filter(({ headRefName, isCrossRepository }) => {
    if (isCrossRepository || !headRefName.startsWith('discovery/')) return false
    if (!SAFE_DISCOVERY_HEAD.test(headRefName)
      || headRefName.includes('..')
      || headRefName.includes('//')
      || headRefName.endsWith('.lock')) invalidPendingPullRequests()
    return true
  }).sort((left, right) => left.number - right.number)

  const pullRequest = pending[0]
    ? Object.freeze({
      number: pending[0].number,
      url: pending[0].url,
      headRefName: pending[0].headRefName
    })
    : null
  return Object.freeze({ hasPending: pending.length > 0, count: pending.length, pullRequest })
}

export function reviewIssueDecision(value) {
  if (value !== 'true' && value !== 'false') throw new Error('invalid_discovery_review_flag')
  return Object.freeze({ createIssue: value === 'true', output: value })
}

function runCli(argv) {
  const [mode, argument] = argv
  if (mode === 'pending' && argument && argv.length === 2) {
    let value
    try {
      value = JSON.parse(readFileSync(0, 'utf8'))
    } catch {
      return invalidPendingPullRequests()
    }
    const result = inspectPendingDiscoveryPullRequests(value, argument)
    process.stdout.write(`has_pending=${result.hasPending ? 'true' : 'false'}\n`)
    process.stdout.write(`pending_count=${result.count}\n`)
    if (result.pullRequest) {
      process.stdout.write(`pending_number=${result.pullRequest.number}\n`)
      process.stdout.write(`pending_url=${result.pullRequest.url}\n`)
      process.stdout.write(`pending_branch=${result.pullRequest.headRefName}\n`)
    }
    return
  }
  if (mode === 'review' && argument !== undefined && argv.length === 2) {
    const decision = reviewIssueDecision(argument)
    process.stdout.write(`create_issue=${decision.output}\n`)
    return
  }
  throw new Error('invalid_discovery_workflow_policy_arguments')
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    runCli(process.argv.slice(2))
  } catch (error) {
    const code = [
      'invalid_pending_discovery_pull_requests',
      'invalid_discovery_review_flag',
      'invalid_discovery_workflow_policy_arguments'
    ].includes(error?.message) ? error.message : 'invalid_discovery_workflow_policy'
    process.stderr.write(`${code}\n`)
    process.exitCode = 1
  }
}
