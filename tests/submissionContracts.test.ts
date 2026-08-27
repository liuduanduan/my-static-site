import { describe, expect, it } from 'vitest'
import {
  SubmissionValidationError,
  normalizeOfficialUrl,
  parseCampaignPublic,
  parseSubmissionInput,
  toDomainKey
} from '../shared/submissions/validation'

const validSubmission = {
  name: 'Example AI',
  officialUrl: 'https://Example.com/product?utm_source=test#pricing',
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
  turnstileToken: 'token-value',
  website: ''
}

function expectCode(value: unknown, code: string): void {
  try {
    parseSubmissionInput(value)
    throw new Error('expected parseSubmissionInput to reject the value')
  } catch (error) {
    expect(error).toBeInstanceOf(SubmissionValidationError)
    expect((error as SubmissionValidationError).code).toBe(code)
  }
}

describe('submission contracts', () => {
  it('normalizes a valid submission and deeply freezes its arrays', () => {
    const parsed = parseSubmissionInput(validSubmission)

    expect(parsed.officialUrl).toBe('https://example.com/product')
    expect(parsed.contactEmail).toBe('owner@example.com')
    expect(Object.isFrozen(parsed)).toBe(true)
    expect(Object.isFrozen(parsed.bestFor)).toBe(true)
    expect(Object.isFrozen(parsed.features)).toBe(true)
  })

  it('accepts the optional product fields being omitted', () => {
    const {
      description: _description,
      accessModes: _accessModes,
      pros: _pros,
      cons: _cons,
      ...requiredOnly
    } = validSubmission

    expect(parseSubmissionInput(requiredOnly)).toMatchObject({
      name: 'Example AI',
      officialUrl: 'https://example.com/product'
    })
  })

  it('accepts a bounded private commercial cooperation note', () => {
    expect(
      parseSubmissionInput({
        ...validSubmission,
        intent: 'commercial_interest',
        commercialNote: '希望了解首页赞助位，但不要求保证收录。'
      })
    ).toMatchObject({
      intent: 'commercial_interest',
      commercialNote: '希望了解首页赞助位，但不要求保证收录。'
    })
    expectCode(
      { ...validSubmission, commercialNote: '合'.repeat(1_001) },
      'invalid_length'
    )
  })

  it.each([
    ['an unknown field', { ...validSubmission, ranking: 1 }, 'unknown_field'],
    ['an HTTP URL', { ...validSubmission, officialUrl: 'http://example.com' }, 'invalid_url'],
    ['URL credentials', { ...validSubmission, officialUrl: 'https://user@example.com' }, 'invalid_url'],
    ['a non-standard port', { ...validSubmission, officialUrl: 'https://example.com:8443' }, 'invalid_url'],
    ['an unknown category', { ...validSubmission, category: 'ranking' }, 'invalid_enum'],
    ['two use cases', { ...validSubmission, bestFor: ['一', '二'] }, 'invalid_length'],
    ['four features', { ...validSubmission, features: ['一', '二', '三', '四'] }, 'invalid_length'],
    ['unchecked terms', { ...validSubmission, acceptedTerms: false }, 'terms_required'],
    ['a filled honeypot', { ...validSubmission, website: 'https://spam.example' }, 'spam_detected']
  ])('rejects %s', (_label, value, code) => {
    expectCode(value, code)
  })

  it('rejects invalid calendar-independent input shapes', () => {
    expectCode(null, 'invalid_body')
    expectCode([], 'invalid_body')
    expectCode({ ...validSubmission, contactEmail: 'not-an-email' }, 'invalid_email')
  })

  it('normalizes tracking parameters and equivalent www domains', () => {
    expect(normalizeOfficialUrl('https://WWW.Example.com/path/?gclid=1&keep=yes')).toBe(
      'https://www.example.com/path?keep=yes'
    )
    expect(toDomainKey('https://www.example.com/path')).toBe('example.com')
    expect(toDomainKey('https://example.com/other')).toBe('example.com')
  })

  it('accepts only strict public campaign records', () => {
    expect(
      parseCampaignPublic({
        toolSlug: 'chatgpt',
        type: 'sponsored_card',
        label: '赞助',
        destinationUrl: 'https://example.com/campaign'
      })
    ).toEqual({
      toolSlug: 'chatgpt',
      type: 'sponsored_card',
      label: '赞助',
      destinationUrl: 'https://example.com/campaign'
    })

    expect(() =>
      parseCampaignPublic({
        toolSlug: 'chatgpt',
        type: 'sponsored_card',
        label: '编辑精选',
        destinationUrl: 'https://example.com/campaign'
      })
    ).toThrow(SubmissionValidationError)
    expect(() =>
      parseCampaignPublic({
        toolSlug: 'chatgpt',
        type: 'sponsored_card',
        label: '赞助',
        destinationUrl: 'https://example.com/campaign',
        price: 100
      })
    ).toThrow(SubmissionValidationError)
  })
})
