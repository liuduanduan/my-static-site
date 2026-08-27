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
import {
  DuplicateSubmissionError,
  SubmissionRepository,
  normalizeSubmissionForStorage
} from '../../_lib/submissionRepository'
import {
  verifyTurnstile,
  type TurnstileVerificationInput
} from '../../_lib/turnstile'
import {
  SubmissionValidationError,
  parseSubmissionInput
} from '../../../shared/submissions/validation'

interface RequestContext {
  request: Request
}

export interface SubmissionHandlerDeps {
  repository: SubmissionRepository
  security: SubmissionSecurity
  verifyTurnstile(input: TurnstileVerificationInput): Promise<boolean>
  now(): Date
}

const validationMessages: Record<string, string> = {
  invalid_body: '提交内容无效。',
  unknown_field: '提交包含不支持的字段。',
  invalid_url: '官网或素材地址必须是安全的 HTTPS 地址。',
  invalid_email: '联系邮箱格式无效。',
  invalid_enum: '提交包含无效选项。',
  invalid_length: '请检查字段长度和列表数量。',
  terms_required: '需要同意隐私说明和收录规则。',
  spam_detected: '提交未通过垃圾信息检查。'
}

function duplicateResponse(): Response {
  return errorResponse(
    new HttpBoundaryError(
      409,
      'duplicate_submission',
      '这个官网已有待处理或已收录记录。'
    )
  )
}

export function createSubmissionHandler(deps: SubmissionHandlerDeps) {
  return async (context: RequestContext): Promise<Response> => {
    const { request } = context
    try {
      assertJsonPost(request)
      assertSameOrigin(request)
      const body = await readJsonBody(request)
      const parsed = parseSubmissionInput(body)
      const remoteIp = clientIp(request)

      if (!(await deps.verifyTurnstile({ token: parsed.turnstileToken, remoteIp }))) {
        throw new HttpBoundaryError(400, 'verification_failed', '人机验证失败，请重试。')
      }

      const normalized = normalizeSubmissionForStorage(parsed)
      const hour = utcHourStart(deps.now())
      const ipRateKey = await deps.security.hashForPurpose('rate-ip', remoteIp)
      const domainRateKey = await deps.security.hashForPurpose(
        'rate-domain',
        normalized.normalizedDomain
      )
      const ipCount = await deps.repository.incrementRateLimit(ipRateKey, hour)
      const domainCount = await deps.repository.incrementRateLimit(domainRateKey, hour)
      if (
        deps.repository.isRateLimited(ipCount) ||
        deps.repository.isRateLimited(domainCount)
      ) {
        throw new HttpBoundaryError(429, 'rate_limited', '提交过于频繁，请稍后再试。', {
          'Retry-After': '3600'
        })
      }

      if (await deps.repository.findActiveByDomain(normalized.normalizedDomain)) {
        return duplicateResponse()
      }

      const now = deps.now().toISOString()
      const created = await deps.repository.create(normalized, {
        ipHash: await deps.security.hashForPurpose('ip', remoteIp),
        domainHash: await deps.security.hashForPurpose(
          'domain',
          normalized.normalizedDomain
        ),
        contentHash: await deps.security.hashForPurpose(
          'content',
          JSON.stringify(normalized)
        ),
        now
      })

      return jsonResponse({ code: created.publicCode, status: 'pending' }, 202)
    } catch (error) {
      if (error instanceof HttpBoundaryError) return errorResponse(error)
      if (error instanceof SubmissionValidationError) {
        return errorResponse(
          new HttpBoundaryError(
            400,
            error.code,
            validationMessages[error.code] ?? '提交内容无效。'
          )
        )
      }
      if (error instanceof DuplicateSubmissionError) return duplicateResponse()
      return errorResponse(
        new HttpBoundaryError(503, 'submission_unavailable', '暂时无法提交，请稍后再试。')
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
    const repository = new SubmissionRepository(context.env.SUBMISSIONS_DB, security)
    const turnstileSecret = requireEnvString(context.env, 'TURNSTILE_SECRET_KEY')
    return createSubmissionHandler({
      repository,
      security,
      verifyTurnstile: (input) => verifyTurnstile(input, { secret: turnstileSecret }),
      now: () => new Date()
    })(context)
  } catch {
    return errorResponse(
      new HttpBoundaryError(503, 'submission_unavailable', '暂时无法提交，请稍后再试。')
    )
  }
}
