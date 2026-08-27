import type { AdminStatusUpdate } from '../../../../shared/submissions/contracts'
import { createSubmissionSecurity } from '../../../_lib/crypto'
import type { Env } from '../../../_lib/env'
import { requireEnvString } from '../../../_lib/env'
import { assertAdminAuthorization } from '../../../_lib/adminAuth'
import {
  HttpBoundaryError,
  errorResponse,
  jsonResponse,
  readJsonBody
} from '../../../_lib/http'
import {
  InvalidStatusTransitionError,
  SubmissionRepository
} from '../../../_lib/submissionRepository'

interface RequestContext {
  request: Request
  params: { id?: string | string[] }
}

export interface AdminUpdateHandlerDeps {
  repository: SubmissionRepository
  adminToken: string
}

type EnrichmentUpdate = Extract<AdminStatusUpdate, { status: 'needs_enrichment' }>
type ErrorUpdate = Extract<AdminStatusUpdate, { status: 'error' }>

const automationErrors = new Set([
  'official_fetch_rejected',
  'official_fetch_failed',
  'enricher_invalid_output',
  'catalog_validation_failed',
  'build_failed',
  'github_pr_failed'
])
const enrichmentErrors = new Set(['enricher_unconfigured', 'enricher_invalid_output'])
const githubPrPattern = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/pull\/[1-9]\d*$/
const isoDateTimePattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/
const identifierPattern = /^[A-Za-z0-9-]{1,128}$/

function invalidUpdate(): never {
  throw new HttpBoundaryError(400, 'invalid_admin_update', '状态更新内容无效。')
}

function assertJsonPatch(request: Request): void {
  if (request.method !== 'PATCH') {
    throw new HttpBoundaryError(405, 'method_not_allowed', '只支持 PATCH 请求。', {
      Allow: 'PATCH'
    })
  }
  const contentType = request.headers.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase()
  if (contentType !== 'application/json') {
    throw new HttpBoundaryError(415, 'unsupported_media_type', '请求必须使用 JSON 格式。')
  }
}

function hasOnlyKeys(record: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(record)
  return actual.length === keys.length && actual.every((key) => keys.includes(key))
}

function publicMessage(value: unknown): string {
  if (typeof value !== 'string') return invalidUpdate()
  const normalized = value.trim()
  if (normalized.length < 2 || normalized.length > 300) return invalidUpdate()
  return normalized
}

function prUrl(value: unknown): string {
  if (typeof value !== 'string' || !githubPrPattern.test(value)) return invalidUpdate()
  return value
}

function parseAdminStatusUpdate(value: unknown): AdminStatusUpdate {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return invalidUpdate()
  }
  const record = value as Record<string, unknown>
  switch (record.status) {
    case 'needs_enrichment':
      if (
        !hasOnlyKeys(record, ['status', 'errorCode']) ||
        typeof record.errorCode !== 'string' ||
        !enrichmentErrors.has(record.errorCode)
      ) return invalidUpdate()
      return {
        status: 'needs_enrichment',
        errorCode: record.errorCode as EnrichmentUpdate['errorCode']
      }
    case 'needs_info':
      if (!hasOnlyKeys(record, ['status', 'publicMessage'])) return invalidUpdate()
      return { status: 'needs_info', publicMessage: publicMessage(record.publicMessage) }
    case 'pr_open':
      if (!hasOnlyKeys(record, ['status', 'prUrl'])) return invalidUpdate()
      return { status: 'pr_open', prUrl: prUrl(record.prUrl) }
    case 'published': {
      if (!hasOnlyKeys(record, ['status', 'prUrl', 'publishedAt'])) return invalidUpdate()
      if (
        typeof record.publishedAt !== 'string' ||
        !isoDateTimePattern.test(record.publishedAt) ||
        Number.isNaN(Date.parse(record.publishedAt))
      ) return invalidUpdate()
      return {
        status: 'published',
        prUrl: prUrl(record.prUrl),
        publishedAt: new Date(record.publishedAt).toISOString()
      }
    }
    case 'rejected':
      if (!hasOnlyKeys(record, ['status', 'publicMessage'])) return invalidUpdate()
      return { status: 'rejected', publicMessage: publicMessage(record.publicMessage) }
    case 'error':
      if (
        !hasOnlyKeys(record, ['status', 'errorCode']) ||
        typeof record.errorCode !== 'string' ||
        !automationErrors.has(record.errorCode)
      ) return invalidUpdate()
      return { status: 'error', errorCode: record.errorCode as ErrorUpdate['errorCode'] }
    default:
      return invalidUpdate()
  }
}

function readIdentifier(params: RequestContext['params']): string {
  const value = params.id
  if (typeof value !== 'string' || !identifierPattern.test(value)) {
    throw new HttpBoundaryError(400, 'invalid_admin_request', '申请编号无效。')
  }
  return value
}

export function createAdminUpdateHandler(deps: AdminUpdateHandlerDeps) {
  return async (context: RequestContext): Promise<Response> => {
    try {
      await assertAdminAuthorization(context.request, deps.adminToken)
      assertJsonPatch(context.request)
      const id = readIdentifier(context.params)
      const update = parseAdminStatusUpdate(await readJsonBody(context.request))
      await deps.repository.updateStatus(id, update)
      return jsonResponse({ ok: true })
    } catch (error) {
      if (error instanceof HttpBoundaryError) return errorResponse(error)
      if (error instanceof InvalidStatusTransitionError) {
        return errorResponse(
          new HttpBoundaryError(409, 'invalid_status_transition', '申请状态已变化，无法执行此更新。')
        )
      }
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
    return createAdminUpdateHandler({
      repository: new SubmissionRepository(context.env.SUBMISSIONS_DB, security),
      adminToken: requireEnvString(context.env, 'SUBMISSIONS_ADMIN_TOKEN')
    })(context)
  } catch {
    return errorResponse(
      new HttpBoundaryError(503, 'admin_unavailable', '管理服务暂时不可用。')
    )
  }
}
