import type { PublicSubmissionState } from '../../../shared/submissions/contracts'
import { createSubmissionSecurity, type SubmissionSecurity } from '../../_lib/crypto'
import type { Env } from '../../_lib/env'
import { requireEnvString } from '../../_lib/env'
import {
  HttpBoundaryError,
  assertJsonPost,
  assertSameOrigin,
  clientIp,
  errorResponse,
  jsonResponse,
  readJsonBody,
  utcHourStart
} from '../../_lib/http'
import { SubmissionRepository } from '../../_lib/submissionRepository'

interface RequestContext {
  request: Request
}

export interface StatusHandlerDeps {
  repository: SubmissionRepository
  security: SubmissionSecurity
  now(): Date
}

const codePattern = /^[A-Za-z0-9_-]{22}$/
const publicStatuses = new Set<PublicSubmissionState>([
  'pending',
  'processing',
  'needs_info',
  'pr_open',
  'published',
  'rejected',
  'error'
])
const githubPrPattern = /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+$/
const isoDateTimePattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/

function parseStatusBody(value: unknown): string {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value) ||
    Object.keys(value).length !== 1 ||
    typeof (value as { code?: unknown }).code !== 'string' ||
    !codePattern.test((value as { code: string }).code)
  ) {
    throw new HttpBoundaryError(400, 'invalid_body', '查询码格式无效。')
  }
  return (value as { code: string }).code
}

export function createStatusHandler(deps: StatusHandlerDeps) {
  return async (context: RequestContext): Promise<Response> => {
    const { request } = context
    try {
      assertJsonPost(request)
      assertSameOrigin(request)
      if (new URL(request.url).search) {
        throw new HttpBoundaryError(400, 'invalid_body', '查询码只能放在 JSON 请求体中。')
      }
      const code = parseStatusBody(await readJsonBody(request))
      const remoteIp = clientIp(request)
      const rateKey = await deps.security.hashForPurpose('rate-status', remoteIp)
      const count = await deps.repository.incrementRateLimit(rateKey, utcHourStart(deps.now()))
      if (deps.repository.isRateLimited(count)) {
        throw new HttpBoundaryError(429, 'rate_limited', '查询过于频繁，请稍后再试。', {
          'Retry-After': '3600'
        })
      }

      const result = await deps.repository.getPublicStatus(
        await deps.security.hashPublicCode(code)
      )
      if (!result) {
        throw new HttpBoundaryError(404, 'submission_not_found', '未找到对应申请。')
      }
      if (!publicStatuses.has(result.status)) {
        throw new HttpBoundaryError(503, 'status_unavailable', '暂时无法查询，请稍后再试。')
      }

      const safe = {
        status: result.status,
        message: result.message,
        ...(result.prUrl && githubPrPattern.test(result.prUrl) ? { prUrl: result.prUrl } : {}),
        ...(result.publishedAt &&
        isoDateTimePattern.test(result.publishedAt) &&
        !Number.isNaN(Date.parse(result.publishedAt))
          ? { publishedAt: new Date(result.publishedAt).toISOString() }
          : {})
      }
      return jsonResponse(safe)
    } catch (error) {
      if (error instanceof HttpBoundaryError) return errorResponse(error)
      return errorResponse(
        new HttpBoundaryError(503, 'status_unavailable', '暂时无法查询，请稍后再试。')
      )
    }
  }
}

export const onRequest: PagesFunction<Env> = async (context) => {
  try {
    const security = createSubmissionSecurity({
      PUBLIC_CODE_PEPPER: requireEnvString(context.env, 'PUBLIC_CODE_PEPPER'),
      CONTACT_EMAIL_ENCRYPTION_KEY: requireEnvString(
        context.env,
        'CONTACT_EMAIL_ENCRYPTION_KEY'
      )
    })
    return createStatusHandler({
      repository: new SubmissionRepository(context.env.SUBMISSIONS_DB, security),
      security,
      now: () => new Date()
    })(context)
  } catch {
    return errorResponse(
      new HttpBoundaryError(503, 'status_unavailable', '暂时无法查询，请稍后再试。')
    )
  }
}
