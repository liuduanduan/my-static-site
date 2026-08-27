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

interface RequestContext {
  request: Request
}

export interface AdminPurgeHandlerDeps {
  repository: SubmissionRepository
  adminToken: string
  now(): Date
}

function assertEmptyBody(value: unknown): void {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value) ||
    Object.keys(value).length !== 0
  ) {
    throw new HttpBoundaryError(400, 'invalid_admin_request', '清理请求不接受自定义条件。')
  }
}

export function createAdminPurgeHandler(deps: AdminPurgeHandlerDeps) {
  return async (context: RequestContext): Promise<Response> => {
    try {
      await assertAdminAuthorization(context.request, deps.adminToken)
      assertJsonPost(context.request)
      assertEmptyBody(await readJsonBody(context.request))
      const result = await deps.repository.purgeExpired(deps.now().toISOString())
      return jsonResponse({
        deletedSubmissions: result.deletedSubmissions,
        deletedRateBuckets: result.deletedRateBuckets
      })
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
    return createAdminPurgeHandler({
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
