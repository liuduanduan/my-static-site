import type {
  ChineseSupport,
  PricingMode,
  ToolCategory
} from '../domain/aiTools'
import type {
  SubmissionIntent,
  SubmitterRelationship
} from '../../../../shared/submissions/contracts'

export interface SubmissionFormState {
  name: string
  officialUrl: string
  tagline: string
  description: string
  category: ToolCategory | ''
  bestForText: string
  featuresText: string
  pricingMode: PricingMode | ''
  chineseSupport: ChineseSupport | ''
  accessModes: string[]
  prosText: string
  consText: string
  logoUrl: string
  contactEmail: string
  submitterRelationship: SubmitterRelationship | ''
  intent: SubmissionIntent
  commercialNote: string
  acceptedTerms: boolean
  turnstileToken: string
  website: string
}

export interface SubmissionSuccess {
  ok: true
  code: string
  status: 'pending'
}

export interface SubmissionFailure {
  ok: false
  message: string
}

export function createSubmissionFormState(): SubmissionFormState {
  return {
    name: '',
    officialUrl: '',
    tagline: '',
    description: '',
    category: '',
    bestForText: '',
    featuresText: '',
    pricingMode: '',
    chineseSupport: '',
    accessModes: [],
    prosText: '',
    consText: '',
    logoUrl: '',
    contactEmail: '',
    submitterRelationship: '',
    intent: 'standard',
    commercialNote: '',
    acceptedTerms: false,
    turnstileToken: '',
    website: ''
  }
}

function lines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function optionalLines(value: string): string[] | undefined {
  const result = lines(value)
  return result.length ? result : undefined
}

export function createSubmissionPayload(form: SubmissionFormState): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: form.name.trim(),
    officialUrl: form.officialUrl.trim(),
    tagline: form.tagline.trim(),
    category: form.category,
    bestFor: lines(form.bestForText),
    features: lines(form.featuresText),
    pricingMode: form.pricingMode,
    chineseSupport: form.chineseSupport,
    contactEmail: form.contactEmail.trim(),
    submitterRelationship: form.submitterRelationship,
    intent: form.intent,
    acceptedTerms: form.acceptedTerms,
    turnstileToken: form.turnstileToken,
    website: form.website
  }

  const optionalValues = {
    description: form.description.trim() || undefined,
    accessModes: form.accessModes.length ? [...form.accessModes] : undefined,
    pros: optionalLines(form.prosText),
    cons: optionalLines(form.consText),
    logoUrl: form.logoUrl.trim() || undefined,
    commercialNote: form.commercialNote.trim() || undefined
  }
  Object.entries(optionalValues).forEach(([key, value]) => {
    if (value !== undefined) payload[key] = value
  })
  return payload
}

export async function submitToolSubmission(
  form: SubmissionFormState,
  fetcher: typeof fetch = fetch
): Promise<SubmissionSuccess | SubmissionFailure> {
  try {
    const response = await fetcher('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createSubmissionPayload(form))
    })
    const value = (await response.json()) as Record<string, unknown>
    if (
      response.status === 202 &&
      typeof value.code === 'string' &&
      value.status === 'pending'
    ) {
      form.contactEmail = ''
      form.turnstileToken = ''
      return { ok: true, code: value.code, status: 'pending' }
    }
    return {
      ok: false,
      message: typeof value.message === 'string' ? value.message : '提交失败，请稍后再试。'
    }
  } catch {
    return { ok: false, message: '网络连接失败，已填写内容仍保留在本页。' }
  }
}
