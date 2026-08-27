import type {
  AccessMode,
  ChineseSupport,
  PricingMode,
  ToolCategory
} from '../../docs/.vitepress/theme/domain/aiTools'

export type SubmissionIntent = 'standard' | 'priority_interest' | 'commercial_interest'
export type SubmitterRelationship = 'founder' | 'user' | 'partner' | 'other'
export type SubmissionStatus =
  | 'pending'
  | 'processing'
  | 'needs_info'
  | 'needs_enrichment'
  | 'pr_open'
  | 'published'
  | 'rejected'
  | 'error'
export type PublicSubmissionState = Exclude<SubmissionStatus, 'needs_enrichment'>

export interface SubmissionInput {
  name: string
  officialUrl: string
  tagline: string
  description?: string
  category: ToolCategory
  bestFor: [string, string, string]
  features: [string, string, string]
  pricingMode: PricingMode
  chineseSupport: ChineseSupport
  accessModes?: AccessMode[]
  pros?: [string, string]
  cons?: [string, string]
  contactEmail: string
  submitterRelationship: SubmitterRelationship
  intent: SubmissionIntent
  commercialNote?: string
  logoUrl?: string
  acceptedTerms: true
  turnstileToken: string
  website: ''
}

export interface PublicSubmissionStatus {
  status: PublicSubmissionState
  message: string
  prUrl?: string
  publishedAt?: string
}

export type AllowedAutomationError =
  | 'official_fetch_rejected'
  | 'official_fetch_failed'
  | 'enricher_failed'
  | 'enricher_invalid_output'
  | 'catalog_validation_failed'
  | 'build_failed'
  | 'github_pr_failed'

export type AdminStatusUpdate =
  | {
      status: 'needs_enrichment'
      errorCode: 'enricher_unconfigured' | 'enricher_invalid_output'
    }
  | { status: 'needs_info'; publicMessage: string }
  | { status: 'pr_open'; prUrl: string }
  | { status: 'published'; prUrl: string; publishedAt: string }
  | { status: 'rejected'; publicMessage: string }
  | { status: 'error'; errorCode: AllowedAutomationError }

export interface ContentDraft {
  slug: string
  description: string
  bestFor: [string, string, string]
  features: [string, string, string]
  pricing: string
  requiresAccount: boolean
  tags: string[]
  searchTerms: string[]
  pros: string[]
  cons: string[]
}

export interface ClaimedSubmission {
  id: string
  publicRef: string
  name: string
  officialUrl: string
  normalizedDomain: string
  tagline: string
  description: string
  category: ToolCategory
  bestFor: readonly [string, string, string]
  features: readonly [string, string, string]
  pricingMode: PricingMode
  chineseSupport: ChineseSupport
  accessModes: readonly AccessMode[]
  status: 'processing'
  attemptCount: number
}

export interface CampaignPublic {
  toolSlug: string
  type: 'sponsored_card' | 'affiliate_link'
  label: '赞助' | '联盟链接'
  destinationUrl: string
}
