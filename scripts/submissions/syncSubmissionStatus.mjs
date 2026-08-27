import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createSubmissionClient } from './submissionClient.mjs'

const githubPrPattern = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/pull\/[1-9]\d*$/
const identifierPattern = /^[A-Za-z0-9-]{1,128}$/
const allowedErrors = new Set([
  'official_fetch_rejected',
  'official_fetch_failed',
  'enricher_invalid_output',
  'catalog_validation_failed',
  'build_failed',
  'github_pr_failed'
])

function invalidArguments() {
  throw new Error('invalid_status_sync_arguments')
}

export async function syncSubmissionStatus(command, values, client) {
  const [identifier, first, second] = values
  if (!identifierPattern.test(identifier ?? '')) return invalidArguments()

  if (command === 'pr-open') {
    if (!githubPrPattern.test(first ?? '') || second !== undefined) return invalidArguments()
    return client.updateSubmission(identifier, { status: 'pr_open', prUrl: first })
  }
  if (command === 'error') {
    if (!allowedErrors.has(first) || second !== undefined) return invalidArguments()
    return client.updateSubmission(identifier, { status: 'error', errorCode: first })
  }
  if (command === 'published') {
    if (
      !githubPrPattern.test(first ?? '') ||
      typeof second !== 'string' ||
      Number.isNaN(Date.parse(second))
    ) return invalidArguments()
    return client.updateSubmission(identifier, {
      status: 'published',
      prUrl: first,
      publishedAt: new Date(second).toISOString()
    })
  }
  if (command === 'rejected') {
    if (first !== undefined || second !== undefined) return invalidArguments()
    return client.updateSubmission(identifier, {
      status: 'rejected',
      publicMessage: '经人工审核暂未收录'
    })
  }
  return invalidArguments()
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, ...values] = process.argv.slice(2)
  let client
  try {
    client = createSubmissionClient({
      baseUrl: process.env.SUBMISSIONS_API_BASE,
      adminToken: process.env.SUBMISSIONS_ADMIN_TOKEN
    })
  } catch {
    process.stderr.write('status_sync_unconfigured\n')
    process.exitCode = 1
  }
  if (client) {
    syncSubmissionStatus(command, values, client).catch((error) => {
      process.stderr.write(`${error?.message === 'invalid_status_sync_arguments' ? error.message : 'status_sync_failed'}\n`)
      process.exitCode = 1
    })
  }
}
