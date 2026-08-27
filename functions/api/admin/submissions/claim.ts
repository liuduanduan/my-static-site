import { createSubmissionSecurity } from '../../../_lib/crypto'
import type { Env } from '../../../_lib/env'
import { requireEnvString } from '../../../_lib/env'
import { assertAdminAuthorization } from '../../../_lib/adminAuth'
import {
  HttpBoundaryError,
  assertJsonPost,
  errorResponse,
  jsonResponse,
  readJsonBody
} from '../../../_lib/http'
import { SubmissionRepository } from '../../../_lib/submissionRepository'
import type { ClaimedSubmission } from '../../../../shared/submissions/contracts'

interface RequestContext {
  request: Request
}

export interface AdminClaimHandlerDeps {
  repository: SubmissionRepository
  adminToken: string
  now(): Date
}

function parseLimit(value: unknown): number {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new HttpBoundaryError(400, 'invalid_admin_request', '管理请求无效。')
  }
  const record = value as Record<string, unknown>
  if (Object.keys(record).some((key) => key !== 'limit')) {
    throw new HttpBoundaryError(400, 'invalid_admin_request', '管理请求无效。')
  }
  if (record.limit === undefined) return 1
  if (typeof record.limit !== 'number' || !Number.isFinite(record.limit)) {
    throw new HttpBoundaryError(400, 'invalid_admin_request', '管理请求无效。')
  }
  return Math.max(1, Math.min(5, Math.trunc(record.limit)))
}

function toPublicClaim(value: ClaimedSubmission): ClaimedSubmission {
  return {
    id: value.id,
    publicRef: value.publicRef,
    name: value.name,
    officialUrl: value.officialUrl,
    normalizedDomain: value.normalizedDomain,
    tagline: value.tagline,
    description: value.description,
    category: value.category,
    bestFor: [...value.bestFor],
    features: [...value.features],
    pricingMode: value.pricingMode,
    chineseSupport: value.chineseSupport,
    accessModes: [...value.accessModes],
    status: 'processing',
    attemptCount: value.attemptCount
  }
}

export function createAdminClaimHandler(deps: AdminClaimHandlerDeps) {
  return async (context: RequestContext): Promise<Response> => {
    try {
      await assertAdminAuthorization(context.request, deps.adminToken)
      assertJsonPost(context.request)
      const limit = parseLimit(await readJsonBody(context.request))
      const submissions = await deps.repository.claimAvailable(limit, deps.now().toISOString())
      return jsonResponse({ submissions: submissions.map(toPublicClaim) })
    } catch (error) {
      if (error instanceof HttpBoundaryError) return errorResponse(error)
      return errorResponse(
        new HttpBoundaryError(503, 'admin_unavailable', '管理服务暂时不可用。')
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
    return createAdminClaimHandler({
      repository: new SubmissionRepository(context.env.SUBMISSIONS_DB, security),
      adminToken: requireEnvString(context.env, 'SUBMISSIONS_ADMIN_TOKEN'),
      now: () => new Date()
    })(context)
  } catch {
    return errorResponse(
      new HttpBoundaryError(503, 'admin_unavailable', '管理服务暂时不可用。')
    )
  }
}
