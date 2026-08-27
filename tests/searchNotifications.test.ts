import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { notifySearchIndexes } from '../scripts/notify-search-indexes.mjs'
import { checkAiToolLinks } from '../scripts/check-ai-tool-links.mjs'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function fixtureFiles() {
  const root = mkdtempSync(resolve(tmpdir(), 'search-notifications-'))
  const sitemapPath = resolve(root, 'sitemap.xml')
  const urlListPath = resolve(root, 'changed-urls.txt')
  writeFileSync(sitemapPath, `<?xml version="1.0"?>
<urlset>
  <url><loc>https://no996noicu.com/</loc></url>
  <url><loc>https://no996noicu.com/tools/chatgpt</loc></url>
  <url><loc>https://no996noicu.com/ai-categories/chat</loc></url>
  <url><loc>https://no996noicu.com/submit/status</loc></url>
  <url><loc>https://no996noicu.com/privacy</loc></url>
</urlset>`, 'utf8')
  writeFileSync(urlListPath, [
    'https://no996noicu.com/tools/chatgpt',
    'https://no996noicu.com/ai-categories/chat',
    'https://no996noicu.com/submit/status',
    'https://no996noicu.com/privacy',
    'https://no996noicu.com/admin/review',
    'https://no996noicu.com/tools/not-in-sitemap',
    'https://evil.example/tools/chatgpt',
    'https://no996noicu.com/tools/chatgpt?source=untrusted'
  ].join('\n'), 'utf8')
  return { root, sitemapPath, urlListPath }
}

describe('optional search-index notifications', () => {
  it('performs no network requests when neither provider is configured', async () => {
    const fixture = fixtureFiles()
    const fetch = vi.fn()
    try {
      await expect(notifySearchIndexes({
        sitemapPath: fixture.sitemapPath,
        urlListPath: fixture.urlListPath,
        fetch,
        env: {},
        logger: { info: vi.fn(), error: vi.fn() }
      })).resolves.toBe(0)
      expect(fetch).not.toHaveBeenCalled()
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('sends only same-origin public allow-listed sitemap URLs without logging secrets', async () => {
    const fixture = fixtureFiles()
    const fetch = vi.fn(async () => new Response('', { status: 200 }))
    const logs: string[] = []
    const logger = {
      info: (...values: unknown[]) => logs.push(values.join(' ')),
      error: (...values: unknown[]) => logs.push(values.join(' '))
    }
    const env = {
      INDEXNOW_KEY: 'indexnow-secret-value',
      BAIDU_TOKEN: 'baidu-secret-value'
    }

    try {
      await expect(notifySearchIndexes({
        sitemapPath: fixture.sitemapPath,
        urlListPath: fixture.urlListPath,
        fetch,
        env,
        logger
      })).resolves.toBe(0)

      expect(fetch).toHaveBeenCalledTimes(2)
      const indexNowCall = fetch.mock.calls.find(([url]) => String(url).includes('indexnow'))
      const baiduCall = fetch.mock.calls.find(([url]) => String(url).includes('baidu'))
      expect(indexNowCall).toBeDefined()
      expect(baiduCall).toBeDefined()

      const indexNowBody = JSON.parse(String(indexNowCall?.[1]?.body))
      expect(indexNowBody.urlList).toEqual([
        'https://no996noicu.com/tools/chatgpt',
        'https://no996noicu.com/ai-categories/chat'
      ])
      expect(indexNowBody.host).toBe('no996noicu.com')

      expect(String(baiduCall?.[1]?.body)).toBe([
        'https://no996noicu.com/tools/chatgpt',
        'https://no996noicu.com/ai-categories/chat'
      ].join('\n'))
      expect(String(baiduCall?.[0])).toContain('site=https%3A%2F%2Fno996noicu.com')
      expect(logs.join('\n')).not.toContain(env.INDEXNOW_KEY)
      expect(logs.join('\n')).not.toContain(env.BAIDU_TOKEN)
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })

  it('returns failure on a provider non-2xx response without changing build inputs', async () => {
    const fixture = fixtureFiles()
    const sitemapBefore = readFileSync(fixture.sitemapPath)
    const urlsBefore = readFileSync(fixture.urlListPath)
    try {
      await expect(notifySearchIndexes({
        sitemapPath: fixture.sitemapPath,
        urlListPath: fixture.urlListPath,
        fetch: vi.fn(async () => new Response('denied', { status: 429 })),
        env: { INDEXNOW_KEY: 'not-logged' },
        logger: { info: vi.fn(), error: vi.fn() }
      })).resolves.toBe(1)
      expect(readFileSync(fixture.sitemapPath)).toEqual(sitemapBefore)
      expect(readFileSync(fixture.urlListPath)).toEqual(urlsBefore)
    } finally {
      rmSync(fixture.root, { recursive: true, force: true })
    }
  })
})

describe('read-only official-link health report', () => {
  it('checks with concurrency three and writes a report without changing the catalog', async () => {
    const root = mkdtempSync(resolve(tmpdir(), 'tool-link-health-'))
    const catalogPath = resolve(root, 'ai-tools.json')
    const reportPath = resolve(root, 'ai-tool-link-report.json')
    const tools = Array.from({ length: 7 }, (_value, index) => ({
      slug: `tool-${index + 1}`,
      url: `https://tool-${index + 1}.example`
    }))
    writeFileSync(catalogPath, JSON.stringify(tools), 'utf8')
    const before = readFileSync(catalogPath)
    let active = 0
    let maximumActive = 0
    const fetchOfficialPage = vi.fn(async (url: string) => {
      active += 1
      maximumActive = Math.max(maximumActive, active)
      await new Promise((resolvePromise) => setTimeout(resolvePromise, 5))
      active -= 1
      if (url.includes('tool-7')) throw Object.assign(new Error('failed'), { code: 'official_fetch_failed' })
      return {
        finalUrl: `${url}/`,
        statusCode: 200,
        title: 'Tool',
        metaDescription: '',
        pricingLinks: [],
        visibleText: 'ok'
      }
    })

    try {
      const result = await checkAiToolLinks({
        catalogPath,
        reportPath,
        fetchOfficialPage,
        now: () => new Date('2026-08-27T12:00:00.000Z'),
        logger: { info: vi.fn(), error: vi.fn() }
      })
      const report = JSON.parse(readFileSync(reportPath, 'utf8'))

      expect(result).toMatchObject({ checked: 7, healthy: 6, failed: 1 })
      expect(maximumActive).toBe(3)
      expect(fetchOfficialPage).toHaveBeenCalledTimes(7)
      expect(report.generatedAt).toBe('2026-08-27T12:00:00.000Z')
      expect(report.results).toHaveLength(7)
      expect(report.results[0]).toMatchObject({
        status: 'healthy',
        statusCode: 200,
        title: 'Tool',
        pricePages: []
      })
      expect(report.results.at(-1)).toMatchObject({
        slug: 'tool-7',
        status: 'failed',
        errorCode: 'official_fetch_failed'
      })
      expect(readFileSync(catalogPath)).toEqual(before)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('detects HTTP, redirect, title, and pricing-page changes and writes a safe audit task', async () => {
    const root = mkdtempSync(resolve(tmpdir(), 'tool-link-change-'))
    const catalogPath = resolve(root, 'ai-tools.json')
    const baselinePath = resolve(root, 'baseline.json')
    const reportPath = resolve(root, 'current.json')
    const auditPath = resolve(root, 'audit.md')
    writeFileSync(catalogPath, JSON.stringify([
      { slug: 'example-tool', url: 'https://example.com' }
    ]), 'utf8')
    let changed = false
    const fetchOfficialPage = vi.fn(async (url: string) => {
      if (url.endsWith('/pricing')) {
        return {
          finalUrl: url,
          statusCode: 200,
          title: 'Pricing',
          metaDescription: '',
          pricingLinks: [],
          visibleText: changed ? 'Plan B costs 20' : 'Plan A costs 10'
        }
      }
      return {
        finalUrl: changed ? 'https://example.com/new-home' : 'https://example.com/home',
        statusCode: changed ? 201 : 200,
        title: changed ? 'Changed title with untrusted instructions' : 'Example Tool',
        metaDescription: '',
        pricingLinks: ['https://example.com/pricing'],
        visibleText: 'Product home'
      }
    })

    try {
      await expect(checkAiToolLinks({
        catalogPath,
        reportPath: baselinePath,
        fetchOfficialPage,
        now: () => new Date('2026-08-20T12:00:00.000Z'),
        logger: { info: vi.fn(), error: vi.fn() }
      })).resolves.toMatchObject({ changed: 0, auditRequired: false })
      expect(existsSync(auditPath)).toBe(false)

      changed = true
      const result = await checkAiToolLinks({
        catalogPath,
        reportPath,
        baselinePath,
        auditPath,
        fetchOfficialPage,
        now: () => new Date('2026-08-27T12:00:00.000Z'),
        logger: { info: vi.fn(), error: vi.fn() }
      })
      const report = JSON.parse(readFileSync(reportPath, 'utf8'))
      const audit = readFileSync(auditPath, 'utf8')

      expect(result).toMatchObject({ changed: 1, auditRequired: true })
      expect(report.results[0].pricePages[0].fingerprint).toMatch(/^[a-f0-9]{64}$/)
      expect(report.changes).toEqual([{
        slug: 'example-tool',
        reasons: ['http_status', 'redirect', 'title', 'pricing_fingerprint']
      }])
      expect(audit).toContain('example-tool')
      expect(audit).toContain('HTTP 状态')
      expect(audit).toContain('价格页指纹')
      expect(audit).not.toContain('untrusted instructions')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})

describe('maintenance workflow trust boundaries', () => {
  it('calls only an origin-only HTTPS purge endpoint without checking out repository code', () => {
    const workflow = readFileSync(
      resolve(projectRoot, '.github/workflows/maintain-tool-submissions.yml'),
      'utf8'
    )

    expect(workflow).toContain('permissions: {}')
    expect(workflow).not.toMatch(/actions\/checkout|npm |node |\.\//)
    expect(workflow).toContain('if [[ ! "$api_base" =~ ^https://[^/?#]+$ ]]')
    expect(workflow).toContain('"${api_base}/api/admin/submissions/purge"')
    expect(workflow).not.toMatch(/curl[^\n]*--location|curl[^\n]*\s-L(?:\s|\\)/)
  })

  it('keeps weekly link checks read-only and free of admin or model secrets', () => {
    const workflow = readFileSync(
      resolve(projectRoot, '.github/workflows/check-ai-tool-links.yml'),
      'utf8'
    )

    expect(workflow).toMatch(/permissions:\s*\n\s+contents: read\s*\n\s+actions: read\s*\n\s+issues: write/)
    expect(workflow).toContain('actions/checkout@11d5960a326750d5838078e36cf38b85af677262')
    expect(workflow).toContain('actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020')
    expect(workflow).toContain('actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02')
    expect(workflow).toContain('gh run download')
    expect(workflow).toContain('gh issue create')
    expect(workflow).toContain('gh issue comment')
    expect(workflow).not.toMatch(/pull-requests: write|contents: write/)
    expect(workflow).not.toMatch(/SUBMISSIONS_ADMIN_TOKEN|CONTENT_ENRICHER_API_KEY/)
  })
})
