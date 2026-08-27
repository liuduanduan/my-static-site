import { describe, expect, it, vi } from 'vitest'
import type {
  AdminStatusUpdate,
  ClaimedSubmission,
  PublicSubmissionStatus,
  SubmissionInput,
  SubmissionStatus
} from '../shared/submissions/contracts'
import type { SubmissionSecurity } from '../functions/_lib/crypto'
import {
  DuplicateSubmissionError,
  InvalidStatusTransitionError,
  type NormalizedSubmission,
  type SubmissionRepository,
  type SubmissionWriteContext
} from '../functions/_lib/submissionRepository'
import { createAdminClaimHandler } from '../functions/api/admin/submissions/claim'
import { createAdminUpdateHandler } from '../functions/api/admin/submissions/[id]'
import { createAdminPurgeHandler } from '../functions/api/admin/submissions/purge'
import { createSubmissionHandler } from '../functions/api/submissions/index'
import { createStatusHandler } from '../functions/api/submissions/status'
import { verifyTurnstile } from '../functions/_lib/turnstile'

const origin = 'https://no996noicu.com'
const adminToken = 'test-admin-token-with-enough-entropy'
const validCode = 'abcdefghijklmnopqrstuv'
const validSubmission: SubmissionInput = {
  name: 'Example AI',
  officialUrl: 'https://example.com/product',
  tagline: '把公开资料整理成可核验答案',
  description: '面向需要整理官方资料的团队。',
  category: 'research',
  bestFor: ['资料整理', '事实核验', '研究简报'],
  features: ['来源提取', '结构化摘要', '链接回溯'],
  pricingMode: 'freemium',
  chineseSupport: 'partial',
  accessModes: ['web'],
  pros: ['来源清晰', '流程直接'],
  cons: ['仍需人工核验', '高级额度可能收费'],
  contactEmail: 'owner@example.com',
  submitterRelationship: 'founder',
  intent: 'standard',
  acceptedTerms: true,
  turnstileToken: 'turnstile-token',
  website: ''
}

interface RepositoryDouble {
  create: ReturnType<typeof vi.fn>
  getPublicStatus: ReturnType<typeof vi.fn>
  incrementRateLimit: ReturnType<typeof vi.fn>
  isRateLimited: ReturnType<typeof vi.fn>
  findActiveByDomain: ReturnType<typeof vi.fn>
}

function createRepository(): RepositoryDouble {
  return {
    create: vi.fn(async (_input: NormalizedSubmission, _context: SubmissionWriteContext) => ({
      id: 'internal-id',
      publicRef: 'abcdefghijklm',
      publicCode: validCode
    })),
    getPublicStatus: vi.fn(async (): Promise<PublicSubmissionStatus | null> => null),
    incrementRateLimit: vi.fn(async () => 1),
    isRateLimited: vi.fn((count: number) => count > 5),
    findActiveByDomain: vi.fn(async () => null)
  }
}

function createSecurity(): SubmissionSecurity {
  return {
    generatePublicCode: vi.fn(() => validCode),
    generatePublicRef: vi.fn(() => 'abcdefghijklm'),
    hashPublicCode: vi.fn(async (code: string) => `code:${code}`),
    hashForPurpose: vi.fn(async (purpose: string, value: string) => `${purpose}:${value}`),
    encryptEmail: vi.fn(async (email: string) => `encrypted:${email}`),
    decryptEmail: vi.fn(async () => 'owner@example.com')
  }
}

function jsonRequest(
  path: string,
  body: unknown,
  options: { method?: string; origin?: string; contentType?: string; ip?: string } = {}
): Request {
  return new Request(`${origin}${path}`, {
    method: options.method ?? 'POST',
    headers: {
      Origin: options.origin ?? origin,
      'Content-Type': options.contentType ?? 'application/json',
      'CF-Connecting-IP': options.ip ?? '203.0.113.7'
    },
    body: options.method === 'GET' ? undefined : JSON.stringify(body)
  })
}

function context(request: Request): { request: Request } {
  return { request }
}

function submissionHandler(repository = createRepository(), verify = vi.fn(async () => true)) {
  return {
    repository,
    verify,
    handler: createSubmissionHandler({
      repository: repository as unknown as SubmissionRepository,
      security: createSecurity(),
      verifyTurnstile: verify,
      now: () => new Date('2026-01-01T12:34:56.000Z')
    })
  }
}

function statusHandler(repository = createRepository()) {
  return {
    repository,
    handler: createStatusHandler({
      repository: repository as unknown as SubmissionRepository,
      security: createSecurity(),
      now: () => new Date('2026-01-01T12:34:56.000Z')
    })
  }
}

async function responseJson(response: Response): Promise<Record<string, unknown>> {
  return (await response.json()) as Record<string, unknown>
}

interface AdminRepositoryDouble {
  claimAvailable: ReturnType<typeof vi.fn>
  updateStatus: ReturnType<typeof vi.fn>
  purgeExpired: ReturnType<typeof vi.fn>
}

const claimedSubmission: ClaimedSubmission = {
  id: '0191f271-d0d1-7f15-80bb-9f7abf778999',
  publicRef: 'abcdefghijklm',
  name: 'Example AI',
  officialUrl: 'https://example.com/product',
  normalizedDomain: 'example.com',
  tagline: '把公开资料整理成可核验答案',
  description: '面向需要整理官方资料的团队。',
  category: 'research',
  bestFor: ['资料整理', '事实核验', '研究简报'],
  features: ['来源提取', '结构化摘要', '链接回溯'],
  pricingMode: 'freemium',
  chineseSupport: 'partial',
  accessModes: ['web'],
  status: 'processing',
  attemptCount: 1
}

function createAdminRepository(): AdminRepositoryDouble {
  return {
    claimAvailable: vi.fn(async () => [claimedSubmission]),
    updateStatus: vi.fn(async (_id: string, _update: AdminStatusUpdate) => undefined),
    purgeExpired: vi.fn(async () => ({ deletedSubmissions: 2, deletedRateBuckets: 3 }))
  }
}

function adminRequest(
  path: string,
  body: unknown,
  options: { method?: string; authorization?: string; origin?: string } = {}
): Request {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  if (options.authorization !== undefined) headers.set('Authorization', options.authorization)
  if (options.origin !== undefined) headers.set('Origin', options.origin)
  return new Request(`${origin}${path}`, {
    method: options.method ?? 'POST',
    headers,
    body: JSON.stringify(body)
  })
}

function adminContext(request: Request, id?: string) {
  return { request, params: id === undefined ? {} : { id } }
}

describe('Turnstile boundary', () => {
  it('sends only the documented form fields and accepts explicit success', async () => {
    const fetchStub = vi.fn(async (_url: string, init?: RequestInit) => {
      const form = init?.body as URLSearchParams
      expect(Object.fromEntries(form)).toMatchObject({
        secret: 'turnstile-secret',
        response: 'turnstile-token',
        remoteip: '203.0.113.7',
        idempotency_key: expect.any(String)
      })
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    })

    await expect(
      verifyTurnstile(
        { token: 'turnstile-token', remoteIp: '203.0.113.7' },
        { secret: 'turnstile-secret', fetch: fetchStub as typeof fetch }
      )
    ).resolves.toBe(true)
    expect(fetchStub).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it.each([
    ['non-2xx', async () => new Response('unavailable', { status: 503 })],
    ['malformed JSON', async () => new Response('{', { status: 200 })],
    ['network failure', async () => { throw new Error('network failed') }]
  ])('fails closed on %s', async (_label, fetchStub) => {
    await expect(
      verifyTurnstile(
        { token: 'turnstile-token', remoteIp: '203.0.113.7' },
        { secret: 'turnstile-secret', fetch: fetchStub as typeof fetch }
      )
    ).resolves.toBe(false)
  })
})

describe('POST /api/submissions', () => {
  it('rejects non-POST methods and non-JSON content types before dependencies run', async () => {
    const { handler, repository, verify } = submissionHandler()

    const methodResponse = await handler(
      context(jsonRequest('/api/submissions', null, { method: 'GET' })) as never
    )
    const contentResponse = await handler(
      context(
        jsonRequest('/api/submissions', validSubmission, { contentType: 'text/plain' })
      ) as never
    )

    expect(methodResponse.status).toBe(405)
    expect(methodResponse.headers.get('Allow')).toBe('POST')
    expect(contentResponse.status).toBe(415)
    expect(verify).not.toHaveBeenCalled()
    expect(repository.create).not.toHaveBeenCalled()
  })

  it('rejects Content-Length and streamed bodies over 32 KiB without verification', async () => {
    const { handler, verify } = submissionHandler()
    const declared = jsonRequest('/api/submissions', validSubmission)
    declared.headers.set('Content-Length', '32769')
    const streamed = jsonRequest('/api/submissions', {
      ...validSubmission,
      description: '大'.repeat(40_000)
    })

    expect((await handler(context(declared) as never)).status).toBe(413)
    expect((await handler(context(streamed) as never)).status).toBe(413)
    expect(verify).not.toHaveBeenCalled()
  })

  it('requires an exact browser origin', async () => {
    const { handler } = submissionHandler()
    const absent = jsonRequest('/api/submissions', validSubmission)
    absent.headers.delete('Origin')

    expect(
      (await handler(
        context(
          jsonRequest('/api/submissions', validSubmission, {
            origin: 'https://evil.example'
          })
        ) as never
      )).status
    ).toBe(403)
    expect((await handler(context(absent) as never)).status).toBe(403)
  })

  it('returns stable validation and Turnstile failures without writing', async () => {
    const invalid = submissionHandler()
    const unverified = submissionHandler(createRepository(), vi.fn(async () => false))

    const invalidResponse = await invalid.handler(
      context(jsonRequest('/api/submissions', { ...validSubmission, extra: true })) as never
    )
    const verificationResponse = await unverified.handler(
      context(jsonRequest('/api/submissions', validSubmission)) as never
    )

    expect(invalidResponse.status).toBe(400)
    expect(await responseJson(invalidResponse)).toMatchObject({ code: 'unknown_field' })
    expect(verificationResponse.status).toBe(400)
    expect(await responseJson(verificationResponse)).toMatchObject({
      code: 'verification_failed'
    })
    expect(invalid.repository.create).not.toHaveBeenCalled()
    expect(unverified.repository.create).not.toHaveBeenCalled()
  })

  it('enforces independent hourly IP and domain limits before duplicate lookup', async () => {
    const repository = createRepository()
    repository.incrementRateLimit
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(6)
    const { handler } = submissionHandler(repository)

    const response = await handler(
      context(jsonRequest('/api/submissions', validSubmission)) as never
    )

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('3600')
    expect(repository.incrementRateLimit).toHaveBeenCalledTimes(2)
    expect(repository.findActiveByDomain).not.toHaveBeenCalled()
    expect(repository.create).not.toHaveBeenCalled()
  })

  it('returns a safe duplicate-domain conflict', async () => {
    const repository = createRepository()
    repository.findActiveByDomain.mockResolvedValueOnce({
      id: 'private-id',
      status: 'pending' as SubmissionStatus
    })
    const { handler } = submissionHandler(repository)

    const response = await handler(
      context(jsonRequest('/api/submissions', validSubmission)) as never
    )

    expect(response.status).toBe(409)
    const body = await responseJson(response)
    expect(body).toEqual({
      code: 'duplicate_submission',
      message: '这个官网已有待处理或已收录记录。',
      requestId: expect.any(String)
    })
    expect(JSON.stringify(body)).not.toContain('private-id')
  })

  it('returns 503 rather than false success when persistence fails', async () => {
    const repository = createRepository()
    repository.create.mockRejectedValueOnce(new Error('D1 unavailable'))
    const { handler } = submissionHandler(repository)

    const response = await handler(
      context(jsonRequest('/api/submissions', validSubmission)) as never
    )

    expect(response.status).toBe(503)
    expect(await responseJson(response)).toMatchObject({ code: 'submission_unavailable' })
  })

  it('returns only the one-time public query code on success', async () => {
    const { handler, repository, verify } = submissionHandler()

    const response = await handler(
      context(jsonRequest('/api/submissions', validSubmission)) as never
    )
    const body = await responseJson(response)

    expect(response.status).toBe(202)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(body).toEqual({ code: validCode, status: 'pending' })
    expect(verify).toHaveBeenCalledWith({
      token: 'turnstile-token',
      remoteIp: '203.0.113.7'
    })
    expect(repository.create).toHaveBeenCalledTimes(1)
    const stored = repository.create.mock.calls[0][0] as NormalizedSubmission
    expect(stored).not.toHaveProperty('turnstileToken')
    expect(stored).not.toHaveProperty('website')
  })

  it('maps a concurrent unique-domain conflict to the same safe response', async () => {
    const repository = createRepository()
    repository.create.mockRejectedValueOnce(new DuplicateSubmissionError())
    const { handler } = submissionHandler(repository)

    const response = await handler(
      context(jsonRequest('/api/submissions', validSubmission)) as never
    )

    expect(response.status).toBe(409)
    expect(await responseJson(response)).toMatchObject({ code: 'duplicate_submission' })
  })
})

describe('POST /api/submissions/status', () => {
  it('accepts the code only in a strict JSON body and never from the URL', async () => {
    const { handler, repository } = statusHandler()

    const queryResponse = await handler(
      context(
        jsonRequest(`/api/submissions/status?code=${validCode}`, { code: validCode })
      ) as never
    )
    const extraResponse = await handler(
      context(jsonRequest('/api/submissions/status', { code: validCode, email: 'x@y.z' })) as never
    )

    expect(queryResponse.status).toBe(400)
    expect(extraResponse.status).toBe(400)
    expect(repository.getPublicStatus).not.toHaveBeenCalled()
  })

  it('rate-limits status enumeration before looking up the code', async () => {
    const repository = createRepository()
    repository.incrementRateLimit.mockResolvedValueOnce(6)
    const { handler } = statusHandler(repository)

    const response = await handler(
      context(jsonRequest('/api/submissions/status', { code: validCode })) as never
    )

    expect(response.status).toBe(429)
    expect(repository.getPublicStatus).not.toHaveBeenCalled()
  })

  it('uses one generic not-found result for unknown query codes', async () => {
    const { handler } = statusHandler()

    const response = await handler(
      context(jsonRequest('/api/submissions/status', { code: validCode })) as never
    )

    expect(response.status).toBe(404)
    expect(await responseJson(response)).toMatchObject({ code: 'submission_not_found' })
  })

  it('returns only the limited public status shape', async () => {
    const repository = createRepository()
    repository.getPublicStatus.mockResolvedValueOnce({
      status: 'pr_open',
      message: '申请已进入公开人工审核。',
      prUrl: 'https://github.com/example/directory/pull/42',
      contactEmail: 'must-not-leak@example.com',
      internalId: 'must-not-leak',
      ipHash: 'must-not-leak',
      lastErrorCode: 'must-not-leak'
    })
    const { handler } = statusHandler(repository)

    const response = await handler(
      context(jsonRequest('/api/submissions/status', { code: validCode })) as never
    )
    const body = await responseJson(response)

    expect(response.status).toBe(200)
    expect(body).toEqual({
      status: 'pr_open',
      message: '申请已进入公开人工审核。',
      prUrl: 'https://github.com/example/directory/pull/42'
    })
    expect(JSON.stringify(body)).not.toMatch(/email|internal|ipHash|lastError/i)
  })

  it('drops malformed public PR URLs and dates even if private data is corrupt', async () => {
    const repository = createRepository()
    repository.getPublicStatus.mockResolvedValueOnce({
      status: 'published',
      message: '工具已经通过审核并发布。',
      prUrl: 'https://evil.example/not-a-pr',
      publishedAt: '2026-01-01'
    })
    const { handler } = statusHandler(repository)

    const response = await handler(
      context(jsonRequest('/api/submissions/status', { code: validCode })) as never
    )

    expect(await responseJson(response)).toEqual({
      status: 'published',
      message: '工具已经通过审核并发布。'
    })
  })
})

describe('trusted submission administration APIs', () => {
  it('returns one uniform 401 for missing, malformed, and wrong bearer tokens', async () => {
    const repository = createAdminRepository()
    const handler = createAdminClaimHandler({
      repository: repository as unknown as SubmissionRepository,
      adminToken,
      now: () => new Date('2026-01-01T12:34:56.000Z')
    })
    const authorizations = [undefined, 'Basic dGVzdA==', 'Bearer wrong-token']
    const bodies: Record<string, unknown>[] = []

    for (const authorization of authorizations) {
      const response = await handler(
        adminContext(adminRequest('/api/admin/submissions/claim', { limit: 1 }, { authorization })) as never
      )
      expect(response.status).toBe(401)
      expect(response.headers.get('Cache-Control')).toBe('no-store')
      bodies.push(await responseJson(response))
    }

    expect(bodies.map(({ code, message }) => ({ code, message }))).toEqual([
      { code: 'unauthorized', message: '身份验证失败。' },
      { code: 'unauthorized', message: '身份验证失败。' },
      { code: 'unauthorized', message: '身份验证失败。' }
    ])
    expect(repository.claimAvailable).not.toHaveBeenCalled()
  })

  it('clamps claim limits to 1..5 without requiring a browser Origin', async () => {
    const repository = createAdminRepository()
    repository.claimAvailable.mockResolvedValue([])
    const handler = createAdminClaimHandler({
      repository: repository as unknown as SubmissionRepository,
      adminToken,
      now: () => new Date('2026-01-01T12:34:56.000Z')
    })

    for (const limit of [-20, 99]) {
      const response = await handler(
        adminContext(adminRequest('/api/admin/submissions/claim', { limit }, {
          authorization: `Bearer ${adminToken}`,
          origin: 'https://unrelated.example'
        })) as never
      )
      expect(response.status).toBe(200)
      expect(await responseJson(response)).toEqual({ submissions: [] })
    }

    expect(repository.claimAvailable.mock.calls).toEqual([
      [1, '2026-01-01T12:34:56.000Z'],
      [5, '2026-01-01T12:34:56.000Z']
    ])
  })

  it('returns only the explicit non-secret claimed submission contract', async () => {
    const repository = createAdminRepository()
    repository.claimAvailable.mockResolvedValueOnce([{
      ...claimedSubmission,
      publicCode: validCode,
      publicCodeHash: 'secret-hash',
      contactEmailCiphertext: 'ciphertext',
      ipHash: 'ip-hash',
      domainHash: 'domain-hash',
      contentHash: 'content-hash',
      commercialNote: 'private cooperation note'
    }])
    const handler = createAdminClaimHandler({
      repository: repository as unknown as SubmissionRepository,
      adminToken,
      now: () => new Date('2026-01-01T12:34:56.000Z')
    })

    const response = await handler(
      adminContext(adminRequest('/api/admin/submissions/claim', { limit: 1 }, {
        authorization: `Bearer ${adminToken}`
      })) as never
    )
    const body = await responseJson(response)

    expect(response.status).toBe(200)
    expect(body).toEqual({ submissions: [claimedSubmission] })
    expect(JSON.stringify(body)).not.toMatch(/publicCode|ciphertext|ipHash|domainHash|contentHash|commercialNote/)
  })

  it('accepts only the strict AdminStatusUpdate union and GitHub PR URLs', async () => {
    const repository = createAdminRepository()
    const handler = createAdminUpdateHandler({
      repository: repository as unknown as SubmissionRepository,
      adminToken
    })
    const validUpdate = {
      status: 'pr_open',
      prUrl: 'https://github.com/example/directory/pull/42'
    }
    const validResponse = await handler(
      adminContext(adminRequest('/api/admin/submissions/abcdefghijklm', validUpdate, {
        method: 'PATCH',
        authorization: `Bearer ${adminToken}`
      }), 'abcdefghijklm') as never
    )

    expect(validResponse.status).toBe(200)
    expect(repository.updateStatus).toHaveBeenCalledWith('abcdefghijklm', validUpdate)

    const invalidBodies = [
      { ...validUpdate, extra: true },
      { status: 'error', errorCode: 'raw-network-stack' },
      { status: 'pr_open', prUrl: 'https://evil.example/pull/42' },
      { status: 'pending' },
      { status: 'published', prUrl: validUpdate.prUrl, publishedAt: '2026-01-01' }
    ]
    for (const body of invalidBodies) {
      const response = await handler(
        adminContext(adminRequest('/api/admin/submissions/row-id', body, {
          method: 'PATCH',
          authorization: `Bearer ${adminToken}`
        }), 'row-id') as never
      )
      expect(response.status).toBe(400)
      expect(await responseJson(response)).toMatchObject({ code: 'invalid_admin_update' })
    }
    expect(repository.updateStatus).toHaveBeenCalledTimes(1)
  })

  it('maps repository transition races to a safe conflict', async () => {
    const repository = createAdminRepository()
    repository.updateStatus.mockRejectedValueOnce(new InvalidStatusTransitionError())
    const handler = createAdminUpdateHandler({
      repository: repository as unknown as SubmissionRepository,
      adminToken
    })
    const response = await handler(
      adminContext(adminRequest('/api/admin/submissions/row-id', {
        status: 'rejected',
        publicMessage: '经人工审核暂未收录'
      }, {
        method: 'PATCH',
        authorization: `Bearer ${adminToken}`
      }), 'row-id') as never
    )

    expect(response.status).toBe(409)
    expect(await responseJson(response)).toMatchObject({ code: 'invalid_status_transition' })
  })

  it('purges only at the server-selected time and returns counts only', async () => {
    const repository = createAdminRepository()
    const handler = createAdminPurgeHandler({
      repository: repository as unknown as SubmissionRepository,
      adminToken,
      now: () => new Date('2026-07-01T00:00:00.000Z')
    })
    const rejected = await handler(
      adminContext(adminRequest('/api/admin/submissions/purge', {
        cutoff: '1970-01-01T00:00:00.000Z'
      }, { authorization: `Bearer ${adminToken}` })) as never
    )
    expect(rejected.status).toBe(400)
    expect(repository.purgeExpired).not.toHaveBeenCalled()

    const response = await handler(
      adminContext(adminRequest('/api/admin/submissions/purge', {}, {
        authorization: `Bearer ${adminToken}`
      })) as never
    )
    expect(response.status).toBe(200)
    expect(await responseJson(response)).toEqual({
      deletedSubmissions: 2,
      deletedRateBuckets: 3
    })
    expect(repository.purgeExpired).toHaveBeenCalledWith('2026-07-01T00:00:00.000Z')
  })
})
