import type { PublicSubmissionStatus } from '../../../../shared/submissions/contracts'

const statuses = new Set([
  'pending',
  'processing',
  'needs_info',
  'pr_open',
  'published',
  'rejected',
  'error'
])

export async function querySubmissionStatus(
  code: string,
  fetcher: typeof fetch = fetch
): Promise<PublicSubmissionStatus> {
  const response = await fetcher('/api/submissions/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  })
  let value: Record<string, unknown> = {}
  try {
    value = (await response.json()) as Record<string, unknown>
  } catch {
    // A proxy or local server can return an empty/HTML error response.
    // Keep those transport details out of the public status experience.
  }
  if (
    !response.ok ||
    typeof value.status !== 'string' ||
    !statuses.has(value.status) ||
    typeof value.message !== 'string'
  ) {
    throw new Error(typeof value.message === 'string' ? value.message : '暂时无法查询，请稍后再试。')
  }
  return {
    status: value.status as PublicSubmissionStatus['status'],
    message: value.message,
    ...(typeof value.prUrl === 'string' ? { prUrl: value.prUrl } : {}),
    ...(typeof value.publishedAt === 'string' ? { publishedAt: value.publishedAt } : {})
  }
}
