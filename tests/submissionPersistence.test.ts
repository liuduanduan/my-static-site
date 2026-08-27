import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Miniflare, convertV4MiniflareOptions } from 'miniflare'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { SubmissionInput } from '../shared/submissions/contracts'
import {
  createSubmissionSecurity,
  type SubmissionSecurity
} from '../functions/_lib/crypto'
import {
  CampaignRepository,
  DuplicateSubmissionError,
  InvalidStatusTransitionError,
  SubmissionRepository,
  normalizeSubmissionForStorage,
  type D1DatabaseLike
} from '../functions/_lib/submissionRepository'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const migration1 = readFileSync(resolve(root, 'migrations/0001_tool_submissions.sql'), 'utf8')
const migration2 = readFileSync(resolve(root, 'migrations/0002_campaigns.sql'), 'utf8')
const encryptionKey = Buffer.alloc(32, 7).toString('base64')
const securityEnv = {
  PUBLIC_CODE_PEPPER: 'test-pepper-with-enough-entropy',
  CONTACT_EMAIL_ENCRYPTION_KEY: encryptionKey
}
const baseInput: SubmissionInput = {
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
  turnstileToken: 'not-persisted',
  website: ''
}

async function applyMigrations(db: D1DatabaseLike): Promise<void> {
  // D1Database.exec treats each newline as a statement boundary; Wrangler applies
  // migration files as complete SQL, so preserve that behavior in the local runtime.
  await db.exec(migration1.replace(/\r?\n/g, ' '))
  await db.exec(migration2.replace(/\r?\n/g, ' '))
}

describe('submission persistence with a real local D1 runtime', () => {
  let miniflare: Miniflare
  let db: D1DatabaseLike
  let security: SubmissionSecurity
  let currentTime: Date
  let repository: SubmissionRepository

  beforeEach(async () => {
    miniflare = new Miniflare(
      convertV4MiniflareOptions({
        modules: [
          {
            type: 'ESModule',
            path: 'submission-persistence-test.mjs',
            contents: 'export default { fetch() { return new Response("ok") } }'
          }
        ],
        d1Databases: ['SUBMISSIONS_DB']
      })
    )
    db = (await miniflare.getD1Database('SUBMISSIONS_DB')) as D1DatabaseLike
    await applyMigrations(db)
    security = createSubmissionSecurity(securityEnv)
    currentTime = new Date('2026-01-01T00:00:00.000Z')
    repository = new SubmissionRepository(db, security, () => currentTime)
  })

  afterEach(async () => {
    await miniflare.dispose()
  })

  async function createSubmission(input: SubmissionInput = baseInput) {
    const normalized = normalizeSubmissionForStorage(input)
    return repository.create(normalized, {
      ipHash: await security.hashForPurpose('ip', '203.0.113.7'),
      domainHash: await security.hashForPurpose('domain', normalized.normalizedDomain),
      contentHash: await security.hashForPurpose('content', JSON.stringify(normalized)),
      now: currentTime.toISOString()
    })
  }

  it('stores only a query-code hash and decryptable email ciphertext', async () => {
    const created = await createSubmission()
    const row = await db
      .prepare(
        'SELECT public_ref, public_code_hash, contact_email_ciphertext, ip_hash FROM tool_submissions WHERE id = ?'
      )
      .bind(created.id)
      .first<Record<string, string>>()

    expect(created.publicCode).toMatch(/^[A-Za-z0-9_-]{22}$/)
    expect(created.publicRef).toMatch(/^[a-z2-7]{13}$/)
    expect(row?.public_ref).toBe(created.publicRef)
    expect(row?.public_code_hash).toBe(await security.hashPublicCode(created.publicCode))
    expect(JSON.stringify(row)).not.toContain(created.publicCode)
    expect(row?.contact_email_ciphertext).not.toContain('owner@example.com')
    expect(await security.decryptEmail(row!.contact_email_ciphertext)).toBe('owner@example.com')
  })

  it('keeps a commercial cooperation note in private D1 and out of claimed content', async () => {
    const created = await createSubmission({
      ...baseInput,
      intent: 'commercial_interest',
      commercialNote: '希望了解赞助合作，不要求保证收录。'
    } as SubmissionInput)
    const row = await db
      .prepare('SELECT commercial_note FROM tool_submissions WHERE id = ?')
      .bind(created.id)
      .first<{ commercial_note: string }>()
    const [claimed] = await repository.claimAvailable(1, currentTime.toISOString())

    expect(row?.commercial_note).toBe('希望了解赞助合作，不要求保证收录。')
    expect(claimed).not.toHaveProperty('commercialNote')
  })

  it('uses deterministic purpose-separated hashes', async () => {
    const first = await security.hashForPurpose('ip', '203.0.113.7')
    expect(await security.hashForPurpose('ip', '203.0.113.7')).toBe(first)
    expect(await security.hashForPurpose('domain', '203.0.113.7')).not.toBe(first)
  })

  it('blocks active duplicate domains and allows a later rejected domain', async () => {
    await createSubmission()
    await expect(createSubmission()).rejects.toBeInstanceOf(DuplicateSubmissionError)

    const [claimed] = await repository.claimAvailable(1, currentTime.toISOString())
    await repository.updateStatus(claimed.id, {
      status: 'rejected',
      publicMessage: '经人工审核暂未收录'
    })

    await expect(createSubmission()).resolves.toMatchObject({ publicCode: expect.any(String) })
  })

  it('increments hourly rate buckets atomically and rejects the sixth attempt', async () => {
    const key = await security.hashForPurpose('rate-ip', '203.0.113.7')
    const counts: number[] = []
    for (let attempt = 0; attempt < 6; attempt += 1) {
      counts.push(await repository.incrementRateLimit(key, '2026-01-01T00:00:00.000Z'))
    }

    expect(counts).toEqual([1, 2, 3, 4, 5, 6])
    expect(repository.isRateLimited(counts.at(-1)!)).toBe(true)
    expect(repository.isRateLimited(5)).toBe(false)
  })

  it('claims pending rows once and omits every sensitive storage field', async () => {
    await createSubmission()

    const first = await repository.claimAvailable(5, currentTime.toISOString())
    const second = await repository.claimAvailable(5, currentTime.toISOString())

    expect(first).toHaveLength(1)
    expect(second).toEqual([])
    expect(first[0]).toMatchObject({
      publicRef: expect.any(String),
      name: 'Example AI',
      status: 'processing',
      attemptCount: 1
    })
    expect(first[0]).not.toHaveProperty('publicCode')
    expect(first[0]).not.toHaveProperty('publicCodeHash')
    expect(first[0]).not.toHaveProperty('contactEmailCiphertext')
    expect(first[0]).not.toHaveProperty('ipHash')
    expect(first[0]).not.toHaveProperty('contentHash')
  })

  it('leases stale processing rows and applies finite exponential retries', async () => {
    await createSubmission()
    const [attempt1] = await repository.claimAvailable(1, currentTime.toISOString())
    await repository.updateStatus(attempt1.id, {
      status: 'error',
      errorCode: 'official_fetch_failed'
    })

    expect(await repository.claimAvailable(1, currentTime.toISOString())).toEqual([])
    currentTime = new Date('2026-01-01T00:05:00.000Z')
    const [attempt2] = await repository.claimAvailable(1, currentTime.toISOString())
    expect(attempt2.attemptCount).toBe(2)
    await repository.updateStatus(attempt2.id, {
      status: 'error',
      errorCode: 'official_fetch_failed'
    })

    currentTime = new Date('2026-01-01T00:35:00.000Z')
    const [attempt3] = await repository.claimAvailable(1, currentTime.toISOString())
    expect(attempt3.attemptCount).toBe(3)
    await repository.updateStatus(attempt3.id, {
      status: 'error',
      errorCode: 'official_fetch_failed'
    })

    currentTime = new Date('2026-01-02T00:00:00.000Z')
    expect(await repository.claimAvailable(1, currentTime.toISOString())).toEqual([])
  })

  it('rejects invalid terminal state transitions', async () => {
    await createSubmission()
    const [claimed] = await repository.claimAvailable(1, currentTime.toISOString())
    await repository.updateStatus(claimed.id, {
      status: 'rejected',
      publicMessage: '经人工审核暂未收录'
    })

    await expect(
      repository.updateStatus(claimed.id, { status: 'pending' } as never)
    ).rejects.toBeInstanceOf(InvalidStatusTransitionError)
  })

  it('aggregates and removes submissions after the 180-day retention deadline', async () => {
    await createSubmission()
    const [claimed] = await repository.claimAvailable(1, currentTime.toISOString())
    await repository.updateStatus(claimed.id, {
      status: 'rejected',
      publicMessage: '经人工审核暂未收录'
    })
    await repository.incrementRateLimit('old-rate-key', '2025-01-01T00:00:00.000Z')

    currentTime = new Date('2026-07-01T00:00:00.000Z')
    const result = await repository.purgeExpired(currentTime.toISOString())
    const row = await db
      .prepare('SELECT count FROM submission_daily_stats WHERE outcome = ?')
      .bind('rejected')
      .first<{ count: number }>()

    expect(result).toEqual({ deletedSubmissions: 1, deletedRateBuckets: 1 })
    expect(row?.count).toBe(1)
    expect(
      await db.prepare('SELECT COUNT(*) AS count FROM tool_submissions').first<{ count: number }>()
    ).toEqual({ count: 0 })
  })

  it('returns only valid active campaigns for published catalog slugs', async () => {
    const campaigns = new CampaignRepository(db)
    const insert = db.prepare(`
      INSERT INTO campaigns (
        id, tool_slug, campaign_type, label, destination_url,
        starts_at, ends_at, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    await db.batch([
      insert.bind(
        'valid', 'chatgpt', 'sponsored_card', '赞助', 'https://example.com/offer',
        '2025-12-01T00:00:00.000Z', '2026-02-01T00:00:00.000Z', 'active',
        currentTime.toISOString(), currentTime.toISOString()
      ),
      insert.bind(
        'expired', 'chatgpt', 'affiliate_link', '联盟链接', 'https://example.com/old',
        '2025-01-01T00:00:00.000Z', '2025-12-01T00:00:00.000Z', 'active',
        currentTime.toISOString(), currentTime.toISOString()
      ),
      insert.bind(
        'unknown-tool', 'not-published', 'sponsored_card', '赞助', 'https://example.com/other',
        '2025-12-01T00:00:00.000Z', '2026-02-01T00:00:00.000Z', 'active',
        currentTime.toISOString(), currentTime.toISOString()
      )
    ])

    await expect(
      campaigns.listActive(currentTime.toISOString(), new Set(['chatgpt']))
    ).resolves.toEqual([
      {
        toolSlug: 'chatgpt',
        type: 'sponsored_card',
        label: '赞助',
        destinationUrl: 'https://example.com/offer'
      }
    ])
  })
})
