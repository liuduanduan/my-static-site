import type {
  AdminStatusUpdate,
  CampaignPublic,
  ClaimedSubmission,
  PublicSubmissionStatus,
  SubmissionInput,
  SubmissionStatus
} from '../../shared/submissions/contracts'
import { parseCampaignPublic, toDomainKey } from '../../shared/submissions/validation'
import type { SubmissionSecurity } from './crypto'

export interface D1ResultLike<T = Record<string, unknown>> {
  success: boolean
  results?: T[]
  meta?: { changes?: number }
}

export interface D1PreparedStatementLike {
  bind(...values: unknown[]): D1PreparedStatementLike
  first<T = Record<string, unknown>>(): Promise<T | null>
  all<T = Record<string, unknown>>(): Promise<D1ResultLike<T>>
  run<T = Record<string, unknown>>(): Promise<D1ResultLike<T>>
}

export interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatementLike
  batch<T = Record<string, unknown>>(
    statements: D1PreparedStatementLike[]
  ): Promise<Array<D1ResultLike<T>>>
  exec(query: string): Promise<unknown>
}

export interface NormalizedSubmission {
  name: string
  officialUrl: string
  normalizedDomain: string
  tagline: string
  description: string
  category: SubmissionInput['category']
  bestFor: [string, string, string]
  features: [string, string, string]
  pricingMode: SubmissionInput['pricingMode']
  chineseSupport: SubmissionInput['chineseSupport']
  accessModes: NonNullable<SubmissionInput['accessModes']>
  pros: string[]
  cons: string[]
  contactEmail: string
  submitterRelationship: SubmissionInput['submitterRelationship']
  intent: SubmissionInput['intent']
  logoUrl: string | null
}

export interface SubmissionWriteContext {
  ipHash: string
  domainHash: string
  contentHash: string
  now: string
}

interface SubmissionRow {
  id: string
  public_ref: string
  name: string
  official_url: string
  normalized_domain: string
  tagline: string
  description: string
  category: SubmissionInput['category']
  best_for_json: string
  features_json: string
  pricing_mode: SubmissionInput['pricingMode']
  chinese_support: SubmissionInput['chineseSupport']
  access_modes_json: string
  status: SubmissionStatus
  attempt_count: number
}

export class DuplicateSubmissionError extends Error {
  constructor() {
    super('duplicate_submission')
    this.name = 'DuplicateSubmissionError'
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor() {
    super('invalid_status_transition')
    this.name = 'InvalidStatusTransitionError'
  }
}

function addMinutes(value: string | Date, minutes: number): string {
  const date = value instanceof Date ? new Date(value) : new Date(value)
  if (Number.isNaN(date.getTime())) throw new Error('Invalid ISO date-time')
  date.setUTCMinutes(date.getUTCMinutes() + minutes)
  return date.toISOString()
}

function addDays(value: string | Date, days: number): string {
  const date = value instanceof Date ? new Date(value) : new Date(value)
  if (Number.isNaN(date.getTime())) throw new Error('Invalid ISO date-time')
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString()
}

function parseTuple3(value: string): [string, string, string] {
  const parsed = JSON.parse(value) as unknown
  if (!Array.isArray(parsed) || parsed.length !== 3 || parsed.some((item) => typeof item !== 'string')) {
    throw new Error('Corrupt stored tuple')
  }
  return parsed as [string, string, string]
}

function parseStringArray(value: string): string[] {
  const parsed = JSON.parse(value) as unknown
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== 'string')) {
    throw new Error('Corrupt stored list')
  }
  return parsed
}

function toClaimedSubmission(row: SubmissionRow): ClaimedSubmission {
  return Object.freeze({
    id: row.id,
    publicRef: row.public_ref,
    name: row.name,
    officialUrl: row.official_url,
    normalizedDomain: row.normalized_domain,
    tagline: row.tagline,
    description: row.description,
    category: row.category,
    bestFor: Object.freeze(parseTuple3(row.best_for_json)),
    features: Object.freeze(parseTuple3(row.features_json)),
    pricingMode: row.pricing_mode,
    chineseSupport: row.chinese_support,
    accessModes: Object.freeze(parseStringArray(row.access_modes_json)) as ClaimedSubmission['accessModes'],
    status: 'processing' as const,
    attemptCount: row.attempt_count
  })
}

export function normalizeSubmissionForStorage(
  input: Readonly<SubmissionInput>
): NormalizedSubmission {
  return {
    name: input.name,
    officialUrl: input.officialUrl,
    normalizedDomain: toDomainKey(input.officialUrl),
    tagline: input.tagline,
    description: input.description ?? '',
    category: input.category,
    bestFor: [...input.bestFor],
    features: [...input.features],
    pricingMode: input.pricingMode,
    chineseSupport: input.chineseSupport,
    accessModes: [...(input.accessModes ?? [])],
    pros: [...(input.pros ?? [])],
    cons: [...(input.cons ?? [])],
    contactEmail: input.contactEmail,
    submitterRelationship: input.submitterRelationship,
    intent: input.intent,
    logoUrl: input.logoUrl ?? null
  }
}

const publicMessages: Record<SubmissionStatus, string> = {
  pending: '申请已收到，等待处理。',
  processing: '申请正在处理，请稍后查询。',
  needs_info: '申请需要补充公开资料。',
  needs_enrichment: '申请正在处理，请稍后查询。',
  pr_open: '申请已进入公开人工审核。',
  published: '工具已经通过审核并发布。',
  rejected: '经人工审核暂未收录。',
  error: '自动处理暂时失败，已进入人工处理。'
}

const retryMinutes = [5, 30, 180] as const

export class SubmissionRepository {
  constructor(
    private readonly db: D1DatabaseLike,
    private readonly security: SubmissionSecurity,
    private readonly now: () => Date = () => new Date()
  ) {}

  async create(
    input: NormalizedSubmission,
    context: SubmissionWriteContext
  ): Promise<{ id: string; publicRef: string; publicCode: string }> {
    const duplicate = await this.findActiveByDomain(input.normalizedDomain)
    if (duplicate) throw new DuplicateSubmissionError()

    const id = crypto.randomUUID()
    const publicCode = this.security.generatePublicCode()
    const publicRef = this.security.generatePublicRef()
    const publicCodeHash = await this.security.hashPublicCode(publicCode)
    const encryptedEmail = await this.security.encryptEmail(input.contactEmail)
    const retentionUntil = addDays(context.now, 180)

    try {
      await this.db
        .prepare(`
          INSERT INTO tool_submissions (
            id, public_ref, public_code_hash, name, official_url, normalized_domain,
            category, pricing_mode, chinese_support, tagline, description,
            best_for_json, features_json, pros_json, cons_json, access_modes_json,
            logo_url, contact_email_ciphertext, submitter_relationship, intent,
            status, source, content_hash, domain_hash, ip_hash, attempt_count,
            public_message, retention_until, created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            'pending', 'public_form', ?, ?, ?, 0, ?, ?, ?, ?
          )
        `)
        .bind(
          id,
          publicRef,
          publicCodeHash,
          input.name,
          input.officialUrl,
          input.normalizedDomain,
          input.category,
          input.pricingMode,
          input.chineseSupport,
          input.tagline,
          input.description,
          JSON.stringify(input.bestFor),
          JSON.stringify(input.features),
          JSON.stringify(input.pros),
          JSON.stringify(input.cons),
          JSON.stringify(input.accessModes),
          input.logoUrl,
          encryptedEmail,
          input.submitterRelationship,
          input.intent,
          context.contentHash,
          context.domainHash,
          context.ipHash,
          publicMessages.pending,
          retentionUntil,
          context.now,
          context.now
        )
        .run()
    } catch (error) {
      if (error instanceof Error && /UNIQUE constraint failed.*normalized_domain/i.test(error.message)) {
        throw new DuplicateSubmissionError()
      }
      throw error
    }

    return { id, publicRef, publicCode }
  }

  async getPublicStatus(codeHash: string): Promise<PublicSubmissionStatus | null> {
    const row = await this.db
      .prepare(
        'SELECT status, public_message, github_pr_url, published_at FROM tool_submissions WHERE public_code_hash = ?'
      )
      .bind(codeHash)
      .first<{
        status: SubmissionStatus
        public_message: string
        github_pr_url: string | null
        published_at: string | null
      }>()
    if (!row) return null
    const status = row.status === 'needs_enrichment' ? 'processing' : row.status
    return {
      status,
      message: row.public_message || publicMessages[row.status],
      ...(row.github_pr_url ? { prUrl: row.github_pr_url } : {}),
      ...(row.published_at ? { publishedAt: row.published_at } : {})
    }
  }

  async findActiveByDomain(
    domain: string
  ): Promise<{ id: string; status: SubmissionStatus } | null> {
    return this.db
      .prepare(
        "SELECT id, status FROM tool_submissions WHERE normalized_domain = ? AND status <> 'rejected' LIMIT 1"
      )
      .bind(domain)
      .first<{ id: string; status: SubmissionStatus }>()
  }

  async incrementRateLimit(keyHash: string, windowStart: string): Promise<number> {
    const row = await this.db
      .prepare(`
        INSERT INTO submission_rate_limits (key_hash, window_start, count)
        VALUES (?, ?, 1)
        ON CONFLICT(key_hash, window_start) DO UPDATE SET count = count + 1
        RETURNING count
      `)
      .bind(keyHash, windowStart)
      .first<{ count: number }>()
    if (!row) throw new Error('Rate-limit write returned no count')
    return row.count
  }

  isRateLimited(count: number): boolean {
    return count > 5
  }

  async claimAvailable(limit: number, now: string): Promise<ClaimedSubmission[]> {
    const cappedLimit = Math.max(1, Math.min(5, Math.trunc(limit)))
    const candidates = await this.db
      .prepare(`
        SELECT id FROM tool_submissions
        WHERE attempt_count < 3 AND (
          status = 'pending' OR
          (status = 'processing' AND claim_expires_at <= ?) OR
          (status = 'error' AND next_attempt_at <= ?)
        )
        ORDER BY created_at, id
        LIMIT ?
      `)
      .bind(now, now, cappedLimit)
      .all<{ id: string }>()

    const claimed: ClaimedSubmission[] = []
    const claimExpiresAt = addMinutes(now, 30)
    for (const candidate of candidates.results ?? []) {
      const row = await this.db
        .prepare(`
          UPDATE tool_submissions
          SET status = 'processing', attempt_count = attempt_count + 1,
              claim_expires_at = ?, next_attempt_at = NULL,
              public_message = ?, updated_at = ?
          WHERE id = ? AND attempt_count < 3 AND (
            status = 'pending' OR
            (status = 'processing' AND claim_expires_at <= ?) OR
            (status = 'error' AND next_attempt_at <= ?)
          )
          RETURNING id, public_ref, name, official_url, normalized_domain, tagline,
                    description, category, best_for_json, features_json, pricing_mode,
                    chinese_support, access_modes_json, status, attempt_count
        `)
        .bind(
          claimExpiresAt,
          publicMessages.processing,
          now,
          candidate.id,
          now,
          now
        )
        .first<SubmissionRow>()
      if (row) claimed.push(toClaimedSubmission(row))
    }
    return claimed
  }

  async updateStatus(idOrPublicRef: string, update: AdminStatusUpdate): Promise<void> {
    const current = await this.db
      .prepare('SELECT id, status, attempt_count FROM tool_submissions WHERE id = ? OR public_ref = ?')
      .bind(idOrPublicRef, idOrPublicRef)
      .first<{ id: string; status: SubmissionStatus; attempt_count: number }>()
    if (!current || !this.canTransition(current.status, update.status)) {
      throw new InvalidStatusTransitionError()
    }

    const now = this.now().toISOString()
    let errorCode: string | null = null
    let nextAttemptAt: string | null = null
    let publicMessage = publicMessages[update.status]
    let prUrl: string | null = null
    let publishedAt: string | null = null

    if ('errorCode' in update) {
      errorCode = update.errorCode
      if (update.status === 'error') {
        nextAttemptAt = addMinutes(now, retryMinutes[current.attempt_count - 1] ?? 180)
      }
    }
    if ('publicMessage' in update) publicMessage = update.publicMessage.trim()
    if ('prUrl' in update) prUrl = update.prUrl
    if ('publishedAt' in update) publishedAt = update.publishedAt
    const retentionUntil =
      update.status === 'published' || update.status === 'rejected'
        ? addDays(now, 180)
        : null

    const result = await this.db
      .prepare(`
        UPDATE tool_submissions
        SET status = ?, last_error_code = ?, next_attempt_at = ?, claim_expires_at = NULL,
            github_pr_url = COALESCE(?, github_pr_url), public_message = ?,
            published_at = COALESCE(?, published_at),
            retention_until = COALESCE(?, retention_until), updated_at = ?
        WHERE id = ? AND status = ?
      `)
      .bind(
        update.status,
        errorCode,
        nextAttemptAt,
        prUrl,
        publicMessage,
        publishedAt,
        retentionUntil,
        now,
        current.id,
        current.status
      )
      .run()
    if ((result.meta?.changes ?? 0) !== 1) throw new InvalidStatusTransitionError()
  }

  private canTransition(current: SubmissionStatus, next: SubmissionStatus): boolean {
    if (current === 'processing') {
      return ['needs_enrichment', 'needs_info', 'pr_open', 'rejected', 'error'].includes(next)
    }
    if (current === 'pr_open') return ['published', 'rejected', 'error'].includes(next)
    if (current === 'needs_info') return ['rejected'].includes(next)
    return false
  }

  async purgeExpired(
    now: string
  ): Promise<{ deletedSubmissions: number; deletedRateBuckets: number }> {
    const submissionCount =
      (
        await this.db
          .prepare('SELECT COUNT(*) AS count FROM tool_submissions WHERE retention_until <= ?')
          .bind(now)
          .first<{ count: number }>()
      )?.count ?? 0
    const oldRateBoundary = addMinutes(now, -120)
    const rateCount =
      (
        await this.db
          .prepare('SELECT COUNT(*) AS count FROM submission_rate_limits WHERE window_start < ?')
          .bind(oldRateBoundary)
          .first<{ count: number }>()
      )?.count ?? 0

    await this.db.batch([
      this.db.prepare(`
        INSERT INTO submission_daily_stats (day, source, intent, outcome, count)
        SELECT substr(updated_at, 1, 10), source, intent, status, COUNT(*)
        FROM tool_submissions
        WHERE retention_until <= ?
        GROUP BY substr(updated_at, 1, 10), source, intent, status
        ON CONFLICT(day, source, intent, outcome)
        DO UPDATE SET count = count + excluded.count
      `).bind(now),
      this.db.prepare('DELETE FROM tool_submissions WHERE retention_until <= ?').bind(now),
      this.db
        .prepare('DELETE FROM submission_rate_limits WHERE window_start < ?')
        .bind(oldRateBoundary)
    ])

    return { deletedSubmissions: submissionCount, deletedRateBuckets: rateCount }
  }
}

export class CampaignRepository {
  constructor(private readonly db: D1DatabaseLike) {}

  async listActive(now: string, publishedSlugs: ReadonlySet<string>): Promise<CampaignPublic[]> {
    const rows = await this.db
      .prepare(`
        SELECT tool_slug, campaign_type, label, destination_url
        FROM campaigns
        WHERE status = 'active' AND starts_at <= ? AND ends_at > ?
        ORDER BY starts_at, id
      `)
      .bind(now, now)
      .all<{
        tool_slug: string
        campaign_type: string
        label: string
        destination_url: string
      }>()

    const campaigns: CampaignPublic[] = []
    for (const row of rows.results ?? []) {
      if (!publishedSlugs.has(row.tool_slug)) continue
      try {
        campaigns.push(
          parseCampaignPublic({
            toolSlug: row.tool_slug,
            type: row.campaign_type,
            label: row.label,
            destinationUrl: row.destination_url
          }) as CampaignPublic
        )
      } catch {
        // Invalid private configuration is never exposed publicly.
      }
    }
    return campaigns
  }
}
