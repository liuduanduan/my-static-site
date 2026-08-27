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

export type SubmissionFormErrorKey =
  | 'name'
  | 'officialUrl'
  | 'tagline'
  | 'description'
  | 'category'
  | 'bestForText'
  | 'featuresText'
  | 'pricingMode'
  | 'chineseSupport'
  | 'prosText'
  | 'consText'
  | 'logoUrl'
  | 'contactEmail'
  | 'submitterRelationship'
  | 'intent'
  | 'commercialNote'
  | 'acceptedTerms'
  | 'turnstileToken'

export type SubmissionFormErrors = Partial<Record<SubmissionFormErrorKey, string>>

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

function isSafeHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' && !url.username && !url.password && !url.port
  } catch {
    return false
  }
}

export function validateSubmissionForm(form: SubmissionFormState): SubmissionFormErrors {
  const errors: SubmissionFormErrors = {}
  const name = form.name.trim()
  const tagline = form.tagline.trim()
  const description = form.description.trim()
  const pros = lines(form.prosText)
  const cons = lines(form.consText)
  const commercialNote = form.commercialNote.trim()

  if (name.length < 2 || name.length > 80) errors.name = '请输入 2–80 个字符的工具名称。'
  if (!isSafeHttpsUrl(form.officialUrl)) errors.officialUrl = '请输入不含账号、密码或端口的官方 HTTPS 地址。'
  if (tagline.length < 6 || tagline.length > 120) errors.tagline = '请输入 6–120 个字符的一句话介绍。'
  if (description && description.length < 6) errors.description = '产品介绍至少需要 6 个字符。'
  if (!form.category) errors.category = '请选择一个主要分类。'
  if (lines(form.bestForText).length !== 3) errors.bestForText = '请填写恰好 3 个使用场景，每行一个。'
  if (lines(form.featuresText).length !== 3) errors.featuresText = '请填写恰好 3 个核心能力，每行一个。'
  if (!form.pricingMode) errors.pricingMode = '请选择价格模式。'
  if (!form.chineseSupport) errors.chineseSupport = '请选择中文支持情况。'
  if (pros.length !== 0 && pros.length !== 2) errors.prosText = '填写优点时请恰好填写 2 项，每行一个。'
  if (cons.length !== 0 && cons.length !== 2) errors.consText = '填写限制时请恰好填写 2 项，每行一个。'
  if (form.logoUrl.trim() && !isSafeHttpsUrl(form.logoUrl)) errors.logoUrl = '品牌素材必须使用安全的 HTTPS 地址。'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())) errors.contactEmail = '请输入有效的联系邮箱。'
  if (!form.submitterRelationship) errors.submitterRelationship = '请选择你与工具的关系。'
  if (!['standard', 'priority_interest', 'commercial_interest'].includes(form.intent)) errors.intent = '请选择提交意向。'
  if (commercialNote && commercialNote.length < 2) errors.commercialNote = '合作说明至少需要 2 个字符。'
  if (!form.acceptedTerms) errors.acceptedTerms = '请先同意隐私说明与“提交不保证收录”。'
  if (!form.turnstileToken) errors.turnstileToken = '请完成人机验证。'
  return errors
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
