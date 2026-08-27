import {
  accessModeLabels,
  categoryLabels,
  chineseSupportLabels,
  pricingModeLabels,
  type AccessMode,
  type ChineseSupport,
  type PricingMode,
  type ToolCategory
} from '../../docs/.vitepress/theme/domain/aiTools'
import type {
  CampaignPublic,
  SubmissionInput,
  SubmissionIntent,
  SubmitterRelationship
} from './contracts'

export type SubmissionValidationCode =
  | 'invalid_body'
  | 'unknown_field'
  | 'invalid_url'
  | 'invalid_email'
  | 'invalid_enum'
  | 'invalid_length'
  | 'terms_required'
  | 'spam_detected'

export class SubmissionValidationError extends Error {
  readonly code: SubmissionValidationCode

  constructor(code: SubmissionValidationCode) {
    super(code)
    this.name = 'SubmissionValidationError'
    this.code = code
  }
}

const submissionKeys = new Set([
  'name',
  'officialUrl',
  'tagline',
  'description',
  'category',
  'bestFor',
  'features',
  'pricingMode',
  'chineseSupport',
  'accessModes',
  'pros',
  'cons',
  'contactEmail',
  'submitterRelationship',
  'intent',
  'commercialNote',
  'logoUrl',
  'acceptedTerms',
  'turnstileToken',
  'website'
])
const campaignKeys = new Set(['toolSlug', 'type', 'label', 'destinationUrl'])
const categories = Object.keys(categoryLabels) as ToolCategory[]
const pricingModes = Object.keys(pricingModeLabels) as PricingMode[]
const chineseSupportModes = Object.keys(chineseSupportLabels) as ChineseSupport[]
const accessModes = Object.keys(accessModeLabels) as AccessMode[]
const relationships: SubmitterRelationship[] = ['founder', 'user', 'partner', 'other']
const intents: SubmissionIntent[] = ['standard', 'priority_interest', 'commercial_interest']
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const trackingParameters = new Set(['fbclid', 'gclid', 'msclkid', 'mc_cid', 'mc_eid'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function rejectUnknownKeys(record: Record<string, unknown>, allowed: ReadonlySet<string>): void {
  if (Object.keys(record).some((key) => !allowed.has(key))) {
    throw new SubmissionValidationError('unknown_field')
  }
}

function stringField(
  record: Record<string, unknown>,
  key: string,
  minimum: number,
  maximum: number,
  optional = false
): string | undefined {
  const value = record[key]
  if (optional && (value === undefined || value === '')) return undefined
  if (typeof value !== 'string') throw new SubmissionValidationError('invalid_length')
  const normalized = value.trim()
  if (normalized.length < minimum || normalized.length > maximum) {
    throw new SubmissionValidationError('invalid_length')
  }
  return normalized
}

function enumField<T extends string>(value: unknown, allowed: readonly T[]): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new SubmissionValidationError('invalid_enum')
  }
  return value as T
}

function stringTuple3(value: unknown): [string, string, string] {
  if (!Array.isArray(value) || value.length !== 3) {
    throw new SubmissionValidationError('invalid_length')
  }
  const normalized = value.map((item) => {
    if (typeof item !== 'string') throw new SubmissionValidationError('invalid_length')
    const text = item.trim()
    if (text.length < 2 || text.length > 80) {
      throw new SubmissionValidationError('invalid_length')
    }
    return text
  })
  return normalized as [string, string, string]
}

function optionalTuple2(value: unknown): [string, string] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value) || value.length !== 2) {
    throw new SubmissionValidationError('invalid_length')
  }
  const normalized = value.map((item) => {
    if (typeof item !== 'string') throw new SubmissionValidationError('invalid_length')
    const text = item.trim()
    if (text.length < 2 || text.length > 120) {
      throw new SubmissionValidationError('invalid_length')
    }
    return text
  })
  return normalized as [string, string]
}

function optionalAccessModes(value: unknown): AccessMode[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value) || value.length === 0 || value.length > accessModes.length) {
    throw new SubmissionValidationError('invalid_length')
  }
  const normalized = value.map((item) => enumField(item, accessModes))
  if (new Set(normalized).size !== normalized.length) {
    throw new SubmissionValidationError('invalid_length')
  }
  return normalized
}

function isPrivateIpv4(hostname: string): boolean {
  const octets = hostname.split('.').map(Number)
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return false
  }
  const [a, b] = octets
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  )
}

function assertSafeHostname(hostname: string): void {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (
    normalized === 'localhost' ||
    normalized.endsWith('.localhost') ||
    normalized.endsWith('.local') ||
    normalized.endsWith('.internal') ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb') ||
    isPrivateIpv4(normalized)
  ) {
    throw new SubmissionValidationError('invalid_url')
  }
}

export function normalizeOfficialUrl(value: unknown): string {
  if (typeof value !== 'string' || value.length > 2_048) {
    throw new SubmissionValidationError('invalid_url')
  }
  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    throw new SubmissionValidationError('invalid_url')
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) {
    throw new SubmissionValidationError('invalid_url')
  }
  assertSafeHostname(url.hostname)
  url.hash = ''
  for (const key of [...url.searchParams.keys()]) {
    const normalized = key.toLowerCase()
    if (normalized.startsWith('utm_') || trackingParameters.has(normalized)) {
      url.searchParams.delete(key)
    }
  }
  if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '') || '/'
  return url.toString().replace(/\/$/, '')
}

export function toDomainKey(value: string | URL): string {
  const url = value instanceof URL ? value : new URL(normalizeOfficialUrl(value))
  return url.hostname.toLowerCase().replace(/^www\./, '')
}

function deepFreezeSubmission(input: SubmissionInput): Readonly<SubmissionInput> {
  Object.values(input).forEach((value) => {
    if (Array.isArray(value)) Object.freeze(value)
  })
  return Object.freeze(input)
}

export function parseSubmissionInput(value: unknown): Readonly<SubmissionInput> {
  if (!isRecord(value)) throw new SubmissionValidationError('invalid_body')
  rejectUnknownKeys(value, submissionKeys)

  if (typeof value.website !== 'string' || value.website !== '') {
    throw new SubmissionValidationError('spam_detected')
  }
  if (value.acceptedTerms !== true) {
    throw new SubmissionValidationError('terms_required')
  }

  const contactEmail = stringField(value, 'contactEmail', 3, 254)!.toLowerCase()
  if (!emailPattern.test(contactEmail)) throw new SubmissionValidationError('invalid_email')

  const officialUrl = normalizeOfficialUrl(value.officialUrl)
  const logoUrlValue = stringField(value, 'logoUrl', 1, 2_048, true)
  const logoUrl = logoUrlValue ? normalizeOfficialUrl(logoUrlValue) : undefined

  return deepFreezeSubmission({
    name: stringField(value, 'name', 2, 80)!,
    officialUrl,
    tagline: stringField(value, 'tagline', 6, 120)!,
    description: stringField(value, 'description', 6, 1_500, true),
    category: enumField(value.category, categories),
    bestFor: stringTuple3(value.bestFor),
    features: stringTuple3(value.features),
    pricingMode: enumField(value.pricingMode, pricingModes),
    chineseSupport: enumField(value.chineseSupport, chineseSupportModes),
    accessModes: optionalAccessModes(value.accessModes),
    pros: optionalTuple2(value.pros),
    cons: optionalTuple2(value.cons),
    contactEmail,
    submitterRelationship: enumField(value.submitterRelationship, relationships),
    intent: enumField(value.intent, intents),
    commercialNote: stringField(value, 'commercialNote', 2, 1_000, true),
    logoUrl,
    acceptedTerms: true,
    turnstileToken: stringField(value, 'turnstileToken', 1, 4_096)!,
    website: ''
  })
}

export function parseCampaignPublic(value: unknown): Readonly<CampaignPublic> {
  if (!isRecord(value)) throw new SubmissionValidationError('invalid_body')
  rejectUnknownKeys(value, campaignKeys)
  const toolSlug = stringField(value, 'toolSlug', 1, 80)!
  if (!slugPattern.test(toolSlug)) throw new SubmissionValidationError('invalid_enum')
  const type = enumField(value.type, ['sponsored_card', 'affiliate_link'] as const)
  const expectedLabel = type === 'sponsored_card' ? '赞助' : '联盟链接'
  if (value.label !== expectedLabel) throw new SubmissionValidationError('invalid_enum')

  return Object.freeze({
    toolSlug,
    type,
    label: expectedLabel,
    destinationUrl: normalizeOfficialUrl(value.destinationUrl)
  })
}
