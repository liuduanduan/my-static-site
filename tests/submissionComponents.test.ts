import { existsSync, readFileSync } from 'node:fs'
import { compileScript, compileTemplate, parse } from '@vue/compiler-sfc'
import { describe, expect, it, vi } from 'vitest'
import siteConfig from '../docs/.vitepress/config'
import {
  createSubmissionFormState,
  submitToolSubmission,
  validateSubmissionForm
} from '../docs/.vitepress/theme/components/submissionFormState'
import { querySubmissionStatus } from '../docs/.vitepress/theme/components/submissionStatusClient'

const componentRoot = new URL('../docs/.vitepress/theme/components/', import.meta.url)
const docsRoot = new URL('../docs/', import.meta.url)

function source(relativePath: string, root = componentRoot): string {
  const url = new URL(relativePath, root)
  expect(existsSync(url), `${relativePath} should exist`).toBe(true)
  return existsSync(url) ? readFileSync(url, 'utf8') : ''
}

function compileSfc(filename: string): string[] {
  const component = source(filename)
  const parsed = parse(component, { filename })
  const errors = parsed.errors.map(String)
  try {
    if (parsed.descriptor.script || parsed.descriptor.scriptSetup) {
      compileScript(parsed.descriptor, { id: filename })
    }
  } catch (error) {
    errors.push(String(error))
  }
  if (parsed.descriptor.template) {
    errors.push(
      ...compileTemplate({
        id: filename,
        filename,
        source: parsed.descriptor.template.content
      }).errors.map(String)
    )
  }
  return errors
}

function fillRequiredForm() {
  const form = createSubmissionFormState()
  Object.assign(form, {
    name: 'Example AI',
    officialUrl: 'https://example.com/product',
    tagline: '把公开资料整理成可核验答案',
    category: 'research',
    bestForText: '资料整理\n事实核验\n研究简报',
    featuresText: '来源提取\n结构化摘要\n链接回溯',
    pricingMode: 'freemium',
    chineseSupport: 'partial',
    contactEmail: 'owner@example.com',
    submitterRelationship: 'founder',
    intent: 'standard',
    acceptedTerms: true,
    turnstileToken: 'turnstile-token'
  })
  return form
}

describe('submission component compilation and semantics', () => {
  it.each(['ToolSubmissionForm.vue', 'SubmissionStatus.vue'])('compiles %s', (name) => {
    expect(compileSfc(name)).toEqual([])
  })

  it('uses visible labels, field errors, a live status, and an inert honeypot', () => {
    const form = source('ToolSubmissionForm.vue')

    expect(form).toMatch(/<label[^>]+for="submission-name"/)
    expect(form).toContain('aria-describedby="submission-name-help submission-name-error"')
    expect(form).toContain('aria-live="polite"')
    expect(form).toContain('name="website"')
    expect(form).toContain('tabindex="-1"')
    expect(form).toContain('type="checkbox"')
    expect(form).toContain('href="/privacy"')
    expect(form).not.toMatch(/localStorage|sessionStorage/)
  })

  it('keeps status codes out of URLs and disables browser autocomplete', () => {
    const status = source('SubmissionStatus.vue')

    expect(status).toContain('type="password"')
    expect(status).toContain('autocomplete="off"')
    expect(status).toContain('aria-live="polite"')
  })
})

describe('submission client behavior', () => {
  it('returns field-level errors for every missing required value before submission', () => {
    expect(validateSubmissionForm).toBeTypeOf('function')
    if (typeof validateSubmissionForm !== 'function') return
    const errors = validateSubmissionForm(createSubmissionFormState())

    expect(Object.keys(errors)).toEqual([
      'name',
      'officialUrl',
      'tagline',
      'category',
      'bestForText',
      'featuresText',
      'pricingMode',
      'chineseSupport',
      'contactEmail',
      'submitterRelationship',
      'acceptedTerms',
      'turnstileToken'
    ])
    expect(Object.values(errors).every((message) => message.length > 0)).toBe(true)
  })

  it('accepts a complete form and identifies invalid field formats locally', () => {
    expect(validateSubmissionForm).toBeTypeOf('function')
    if (typeof validateSubmissionForm !== 'function') return
    const valid = fillRequiredForm()
    expect(validateSubmissionForm(valid)).toEqual({})

    Object.assign(valid, {
      officialUrl: 'http://user:pass@example.com:8080',
      contactEmail: 'not-an-email',
      prosText: '只有一项',
      consText: '第一项\n第二项\n第三项',
      logoUrl: 'http://example.com/logo.svg'
    })
    expect(validateSubmissionForm(valid)).toMatchObject({
      officialUrl: expect.any(String),
      contactEmail: expect.any(String),
      prosText: expect.any(String),
      consText: expect.any(String),
      logoUrl: expect.any(String)
    })
  })

  it('sends only the API contract and preserves every value after failure', async () => {
    const form = fillRequiredForm()
    const before = structuredClone(form)
    const fetchStub = vi.fn(async () =>
      new Response(JSON.stringify({ code: 'submission_unavailable', message: '暂时无法提交' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    )

    const result = await submitToolSubmission(form, fetchStub as typeof fetch)

    expect(result).toEqual({ ok: false, message: '暂时无法提交' })
    expect(form).toEqual(before)
    expect(fetchStub).toHaveBeenCalledTimes(1)
    const [url, init] = fetchStub.mock.calls[0]
    expect(url).toBe('/api/submissions')
    expect(init).toMatchObject({ method: 'POST', headers: { 'Content-Type': 'application/json' } })
    const payload = JSON.parse(String(init?.body))
    expect(payload).toEqual({
      name: 'Example AI',
      officialUrl: 'https://example.com/product',
      tagline: '把公开资料整理成可核验答案',
      category: 'research',
      bestFor: ['资料整理', '事实核验', '研究简报'],
      features: ['来源提取', '结构化摘要', '链接回溯'],
      pricingMode: 'freemium',
      chineseSupport: 'partial',
      contactEmail: 'owner@example.com',
      submitterRelationship: 'founder',
      intent: 'standard',
      acceptedTerms: true,
      turnstileToken: 'turnstile-token',
      website: ''
    })
  })

  it('clears contact and verification values only after a successful response', async () => {
    const form = fillRequiredForm()
    const fetchStub = vi.fn(async () =>
      new Response(JSON.stringify({ code: 'abcdefghijklmnopqrstuv', status: 'pending' }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      })
    )

    await expect(
      submitToolSubmission(form, fetchStub as typeof fetch)
    ).resolves.toEqual({
      ok: true,
      code: 'abcdefghijklmnopqrstuv',
      status: 'pending'
    })
    expect(form.contactEmail).toBe('')
    expect(form.turnstileToken).toBe('')
    expect(form.name).toBe('Example AI')
  })

  it('posts a status query without placing the code in the request URL', async () => {
    const fetchStub = vi.fn(async () =>
      new Response(JSON.stringify({ status: 'pending', message: '申请已收到，等待处理。' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    )

    const result = await querySubmissionStatus(
      'abcdefghijklmnopqrstuv',
      fetchStub as typeof fetch
    )

    expect(result).toEqual({ status: 'pending', message: '申请已收到，等待处理。' })
    expect(fetchStub).toHaveBeenCalledWith('/api/submissions/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'abcdefghijklmnopqrstuv' })
    })
  })

  it('uses a neutral message when the status endpoint returns a non-JSON failure', async () => {
    const fetchStub = vi.fn(async () => new Response('', { status: 503 }))

    await expect(
      querySubmissionStatus('abcdefghijklmnopqrstuv', fetchStub as typeof fetch)
    ).rejects.toThrow('暂时无法查询，请稍后再试。')
  })
})

describe('submission routes and disclosures', () => {
  it('publishes the four routes and keeps the status page out of search indexes', () => {
    expect(source('submit.md', docsRoot)).toContain('<ToolSubmissionForm />')
    expect(source('submit/status.md', docsRoot)).toContain('<SubmissionStatus />')
    expect(source('submit/status.md', docsRoot)).toContain('noindex,nofollow')
    expect(source('privacy.md', docsRoot)).toContain('180 天')
    expect(source('promote.md', docsRoot)).toContain('付费不保证收录')
    expect(source('promote.md', docsRoot)).toContain('赞助内容明确标注')
    expect(source('promote.md', docsRoot)).toContain('编辑精选不可购买')
  })

  it('links the site navigation directly to the real submission page', () => {
    const nav = siteConfig.themeConfig?.nav as Array<{ text: string; link: string }>
    expect(nav.find(({ text }) => text === '提交工具')).toEqual({
      text: '提交工具',
      link: '/submit'
    })
  })
})
