import { describe, expect, it, vi } from 'vitest'
import {
  OfficialFetchError,
  safeFetchOfficialPage
} from '../scripts/submissions/safeOfficialFetch.mjs'

const encoder = new TextEncoder()
const publicAddress = { address: '93.184.216.34', family: 4 as const }

async function* chunks(...values: Array<string | Uint8Array>) {
  for (const value of values) yield typeof value === 'string' ? encoder.encode(value) : value
}

function httpsResponse(options: {
  status?: number
  headers?: Record<string, string | undefined>
  body?: AsyncIterable<Uint8Array>
} = {}) {
  return {
    status: options.status ?? 200,
    headers: options.headers ?? { 'content-type': 'text/html; charset=utf-8' },
    body: options.body ?? chunks('<html><title>Example</title><body>Useful product</body></html>')
  }
}

function safeDeps(overrides: Record<string, unknown> = {}) {
  return {
    resolveHost: vi.fn(async () => [publicAddress]),
    requestHttps: vi.fn(async () => httpsResponse()),
    now: vi.fn(() => 1_000),
    ...overrides
  }
}

describe('safe official-site fetching', () => {
  it.each([
    'http://example.com',
    'https://user:pass@example.com',
    'https://example.com:8443',
    'https://localhost',
    'https://127.0.0.1',
    'https://[::1]'
  ])('rejects an unsafe direct URL before DNS or transport: %s', async (url) => {
    const deps = safeDeps()

    await expect(safeFetchOfficialPage(url, deps)).rejects.toMatchObject({
      code: 'official_fetch_rejected'
    })
    expect(deps.resolveHost).not.toHaveBeenCalled()
    expect(deps.requestHttps).not.toHaveBeenCalled()
  })

  it.each([
    [{ address: '10.0.0.8', family: 4 }],
    [{ address: '169.254.169.254', family: 4 }],
    [{ address: '127.0.0.1', family: 4 }],
    [{ address: 'fd00::1', family: 6 }],
    [{ address: 'fe80::1', family: 6 }],
    [publicAddress, { address: '192.168.1.3', family: 4 }]
  ])('rejects private, link-local, unique-local, or mixed DNS answers', async (answers) => {
    const deps = safeDeps({ resolveHost: vi.fn(async () => answers) })

    await expect(safeFetchOfficialPage('https://example.com', deps)).rejects.toMatchObject({
      code: 'official_fetch_rejected'
    })
    expect(deps.requestHttps).not.toHaveBeenCalled()
  })

  it('pins the HTTPS transport to a validated address while preserving the original host', async () => {
    const requestHttps = vi.fn(async () => httpsResponse())
    const deps = safeDeps({ requestHttps })

    await safeFetchOfficialPage('https://example.com/product', deps)

    expect(requestHttps).toHaveBeenCalledTimes(1)
    expect(requestHttps.mock.calls[0][0]).toMatchObject({
      address: '93.184.216.34',
      family: 4,
      headers: {
        Host: 'example.com',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Encoding': 'identity'
      },
      timeoutMs: 8_000
    })
    expect(requestHttps.mock.calls[0][0].url).toBeInstanceOf(URL)
    expect(requestHttps.mock.calls[0][0].url.hostname).toBe('example.com')
  })

  it('revalidates every redirect and rejects a redirect to a private address', async () => {
    const resolveHost = vi.fn(async (hostname: string) =>
      hostname === 'private.example'
        ? [{ address: '192.168.0.5', family: 4 as const }]
        : [publicAddress]
    )
    const requestHttps = vi.fn(async () => httpsResponse({
      status: 302,
      headers: { location: 'https://private.example/admin' }
    }))
    const deps = safeDeps({ resolveHost, requestHttps })

    await expect(safeFetchOfficialPage('https://example.com', deps)).rejects.toMatchObject({
      code: 'official_fetch_rejected'
    })
    expect(requestHttps).toHaveBeenCalledTimes(1)
    expect(resolveHost).toHaveBeenCalledWith('private.example')
  })

  it('allows at most three redirects', async () => {
    const requestHttps = vi.fn(async ({ url }: { url: URL }) => {
      const step = Number(url.pathname.slice(1) || '0')
      return httpsResponse({
        status: 302,
        headers: { location: `https://example.com/${step + 1}` }
      })
    })
    const deps = safeDeps({ requestHttps })

    await expect(safeFetchOfficialPage('https://example.com/0', deps)).rejects.toMatchObject({
      code: 'official_fetch_rejected'
    })
    expect(requestHttps).toHaveBeenCalledTimes(4)
  })

  it('maps transport timeouts and failures to the finite fetch-failed code', async () => {
    const deps = safeDeps({
      requestHttps: vi.fn(async () => {
        throw new Error('socket timeout with internal detail')
      })
    })

    await expect(safeFetchOfficialPage('https://example.com', deps)).rejects.toEqual(
      expect.objectContaining({
        name: 'OfficialFetchError',
        code: 'official_fetch_failed'
      })
    )
    await expect(safeFetchOfficialPage('https://example.com', deps)).rejects.not.toThrow(
      'socket timeout with internal detail'
    )
  })

  it.each([
    ['non-HTML', httpsResponse({ headers: { 'content-type': 'application/json' } })],
    ['encoded', httpsResponse({ headers: { 'content-type': 'text/html', 'content-encoding': 'gzip' } })],
    ['oversized', httpsResponse({ body: chunks(new Uint8Array(1024 * 1024 + 1)) })]
  ])('rejects %s response content', async (_label, response) => {
    const deps = safeDeps({ requestHttps: vi.fn(async () => response) })

    const error = await safeFetchOfficialPage('https://example.com', deps).catch(
      (caught) => caught
    )
    expect(error).toBeInstanceOf(OfficialFetchError)
    expect(error).toMatchObject({ code: 'official_fetch_rejected' })
  })

  it('extracts only bounded public page evidence', async () => {
    const visible = '可见产品能力 '.repeat(8_000)
    const html = `<!doctype html><html><head>
      <title>  Example &amp; AI  </title>
      <meta content="A focused &amp; verifiable product" name="description">
      <link href="/product" rel="canonical">
      <script>window.secret = 'script must not appear'</script>
      <style>.secret { display:none }</style>
      </head><body>
      <h1>Useful product</h1>
      <form><input type="hidden" value="hidden-token">form secret</form>
      <div hidden>hidden instructions</div>
      <p>${visible}</p><!-- private comment -->
      </body></html>`
    const deps = safeDeps({
      requestHttps: vi.fn(async () => httpsResponse({ body: chunks(html) }))
    })

    const evidence = await safeFetchOfficialPage('https://example.com/start', deps)

    expect(evidence).toEqual({
      finalUrl: 'https://example.com/start',
      title: 'Example & AI',
      metaDescription: 'A focused & verifiable product',
      canonicalUrl: 'https://example.com/product',
      visibleText: expect.any(String)
    })
    expect(evidence.visibleText).toContain('Useful product')
    expect(evidence.visibleText.length).toBe(40_000)
    expect(JSON.stringify(evidence)).not.toMatch(
      /script must not appear|hidden-token|form secret|hidden instructions|private comment|set-cookie|headers/i
    )
    expect(Object.keys(evidence)).toEqual([
      'finalUrl',
      'title',
      'metaDescription',
      'canonicalUrl',
      'visibleText'
    ])
  })
})
