import { describe, expect, it, vi } from 'vitest'
import type { ClaimedSubmission, ContentDraft } from '../shared/submissions/contracts'
import { toolDraftJsonSchema } from '../scripts/submissions/contentSchema.mjs'
import {
  ContentEnricherError,
  createOpenAiContentEnricher
} from '../scripts/submissions/openAiContentEnricher.mjs'

const submission: ClaimedSubmission = {
  id: 'internal-id-never-sent',
  publicRef: 'publicrefneverai',
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

const evidence = {
  finalUrl: 'https://example.com/product',
  title: 'Example AI',
  metaDescription: 'Organize public research evidence.',
  canonicalUrl: 'https://example.com/product',
  visibleText: 'Example AI helps teams organize public sources and trace each answer.'
}

const validDraft: ContentDraft = {
  slug: 'example-ai',
  description: '适合需要整理公开资料并回溯来源的团队，关键事实仍需人工核验。',
  bestFor: ['整理公开资料', '核对来源依据', '制作研究简报'],
  features: ['提取公开来源', '生成结构化摘要', '保留链接回溯'],
  pricing: '提供免费增值方案，具体额度与价格以官网为准',
  requiresAccount: true,
  tags: ['资料整理', '来源核验'],
  searchTerms: ['公开资料整理', '来源核验工具'],
  pros: ['来源脉络较清楚', '整理流程较直接'],
  cons: ['关键事实仍需人工核验', '高级额度可能收费']
}

function apiResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

function outputResponse(draft: unknown = validDraft): Response {
  return apiResponse({
    output: [
      {
        type: 'message',
        content: [{ type: 'output_text', text: JSON.stringify(draft) }]
      }
    ]
  })
}

describe('optional OpenAI Responses content enricher', () => {
  it.each([
    { apiKey: '', model: 'configured-model' },
    { apiKey: 'configured-key', model: '' },
    { apiKey: '   ', model: 'configured-model' },
    { apiKey: 'configured-key', model: '   ' }
  ])('stays disabled unless both key and model are configured', (config) => {
    const fetchStub = vi.fn()

    expect(createOpenAiContentEnricher({ ...config, fetch: fetchStub })).toBeNull()
    expect(fetchStub).not.toHaveBeenCalled()
  })

  it('uses the strict Responses API schema and sends only non-sensitive evidence', async () => {
    const fetchStub = vi.fn(async () => outputResponse())
    const enricher = createOpenAiContentEnricher({
      apiKey: 'secret-api-key',
      model: 'configured-model',
      fetch: fetchStub as typeof fetch
    })!
    const inputWithPrivateExtras = {
      ...submission,
      contactEmail: 'owner@example.com',
      publicCode: 'private-query-code',
      ipHash: 'private-ip-hash',
      internalNote: 'private-review-note'
    }

    const result = await enricher.enrich(inputWithPrivateExtras as never, evidence)

    expect(result).toEqual(validDraft)
    expect(Object.isFrozen(result)).toBe(true)
    expect(fetchStub).toHaveBeenCalledTimes(1)
    const [url, init] = fetchStub.mock.calls[0]
    expect(url).toBe('https://api.openai.com/v1/responses')
    expect(init).toMatchObject({
      method: 'POST',
      headers: {
        Authorization: 'Bearer secret-api-key',
        'Content-Type': 'application/json'
      }
    })
    expect(init?.signal).toBeInstanceOf(AbortSignal)
    const body = JSON.parse(String(init?.body))
    expect(body).toMatchObject({
      model: 'configured-model',
      store: false,
      text: {
        format: {
          type: 'json_schema',
          name: 'tool_draft',
          strict: true,
          schema: toolDraftJsonSchema
        }
      }
    })
    expect(body.text.format.schema.required).toEqual([
      'slug',
      'description',
      'bestFor',
      'features',
      'pricing',
      'requiresAccount',
      'tags',
      'searchTerms',
      'pros',
      'cons'
    ])
    expect(body.text.format.schema.additionalProperties).toBe(false)
    const serialized = JSON.stringify(body)
    expect(serialized).toContain('Example AI')
    expect(serialized).toContain(evidence.visibleText)
    expect(serialized).not.toMatch(
      /internal-id-never-sent|publicrefneverai|owner@example\.com|private-query-code|private-ip-hash|private-review-note/
    )
  })

  it.each([
    ['refusal', { output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'no' }] }] }],
    ['missing output text', { output: [] }],
    ['malformed JSON', { output: [{ type: 'message', content: [{ type: 'output_text', text: '{' }] }] }],
    ['schema mismatch', {
      output: [{
        type: 'message',
        content: [{ type: 'output_text', text: JSON.stringify({ ...validDraft, rating: 5 }) }]
      }]
    }],
    ['disallowed factual claim', {
      output: [{
        type: 'message',
        content: [{
          type: 'output_text',
          text: JSON.stringify({ ...validDraft, description: '这是全球排名第一且拥有百万用户的研究产品。' })
        }]
      }]
    }],
    ['non-conservative pricing', {
      output: [{
        type: 'message',
        content: [{
          type: 'output_text',
          text: JSON.stringify({ ...validDraft, pricing: '完全免费，无任何限制' })
        }]
      }]
    }]
  ])('rejects %s without exposing raw model output', async (_label, payload) => {
    const fetchStub = vi.fn(async () => apiResponse(payload))
    const enricher = createOpenAiContentEnricher({
      apiKey: 'secret-api-key',
      model: 'configured-model',
      fetch: fetchStub as typeof fetch
    })!

    await expect(enricher.enrich(submission, evidence)).rejects.toEqual(
      expect.objectContaining({
        name: 'ContentEnricherError',
        code: 'enricher_invalid_output',
        message: 'enricher_invalid_output'
      })
    )
    expect(fetchStub).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['network failure', () => { throw new Error('network detail') }],
    ['server failure', () => apiResponse({ error: 'temporary' }, 503)]
  ])('retries %s once and then accepts a valid response', async (_label, firstResult) => {
    const fetchStub = vi.fn()
      .mockImplementationOnce(firstResult)
      .mockResolvedValueOnce(outputResponse())
    const enricher = createOpenAiContentEnricher({
      apiKey: 'secret-api-key',
      model: 'configured-model',
      fetch: fetchStub as typeof fetch
    })!

    await expect(enricher.enrich(submission, evidence)).resolves.toEqual(validDraft)
    expect(fetchStub).toHaveBeenCalledTimes(2)
  })

  it('does not retry client errors or invalid model output', async () => {
    const clientFailure = vi.fn(async () => apiResponse({ error: 'bad request' }, 400))
    const invalidOutput = vi.fn(async () => apiResponse({ output: [] }))
    const first = createOpenAiContentEnricher({
      apiKey: 'secret-api-key',
      model: 'configured-model',
      fetch: clientFailure as typeof fetch
    })!
    const second = createOpenAiContentEnricher({
      apiKey: 'secret-api-key',
      model: 'configured-model',
      fetch: invalidOutput as typeof fetch
    })!

    await expect(first.enrich(submission, evidence)).rejects.toBeInstanceOf(ContentEnricherError)
    await expect(second.enrich(submission, evidence)).rejects.toBeInstanceOf(ContentEnricherError)
    expect(clientFailure).toHaveBeenCalledTimes(1)
    expect(invalidOutput).toHaveBeenCalledTimes(1)
  })
})
