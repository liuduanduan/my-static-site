import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { notifySearchIndexes } from '../scripts/notify-search-indexes.mjs'
import { checkAiToolLinks } from '../scripts/check-ai-tool-links.mjs'

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
      return { finalUrl: `${url}/`, title: 'Tool', metaDescription: '', visibleText: 'ok' }
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
})
