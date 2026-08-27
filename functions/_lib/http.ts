export const MAX_JSON_BODY_BYTES = 32 * 1024

export class HttpBoundaryError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly publicMessage: string,
    readonly headers: HeadersInit = {}
  ) {
    super(code)
    this.name = 'HttpBoundaryError'
  }
}

function requestId(): string {
  return crypto.randomUUID()
}

export function jsonResponse(
  value: unknown,
  status = 200,
  headers: HeadersInit = {}
): Response {
  const responseHeaders = new Headers(headers)
  responseHeaders.set('Content-Type', 'application/json; charset=utf-8')
  responseHeaders.set('Cache-Control', 'no-store')
  responseHeaders.set('X-Content-Type-Options', 'nosniff')
  return new Response(JSON.stringify(value), { status, headers: responseHeaders })
}

export function errorResponse(error: HttpBoundaryError): Response {
  return jsonResponse(
    {
      code: error.code,
      message: error.publicMessage,
      requestId: requestId()
    },
    error.status,
    error.headers
  )
}

export function assertJsonPost(request: Request): void {
  if (request.method !== 'POST') {
    throw new HttpBoundaryError(405, 'method_not_allowed', '只支持 POST 请求。', {
      Allow: 'POST'
    })
  }
  const contentType = request.headers.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase()
  if (contentType !== 'application/json') {
    throw new HttpBoundaryError(415, 'unsupported_media_type', '请求必须使用 JSON 格式。')
  }
}

export function assertSameOrigin(request: Request): void {
  const expected = new URL(request.url).origin
  const actual = request.headers.get('Origin')
  if (!actual || actual !== expected) {
    throw new HttpBoundaryError(403, 'origin_rejected', '请求来源无效。')
  }
}

export async function readJsonBody(request: Request): Promise<unknown> {
  const declaredLength = request.headers.get('Content-Length')
  if (declaredLength !== null) {
    const parsed = Number(declaredLength)
    if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > MAX_JSON_BODY_BYTES) {
      throw new HttpBoundaryError(413, 'body_too_large', '提交内容超过 32 KiB 限制。')
    }
  }

  if (!request.body) {
    throw new HttpBoundaryError(400, 'invalid_body', '请求内容无效。')
  }

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > MAX_JSON_BODY_BYTES) {
        await reader.cancel()
        throw new HttpBoundaryError(413, 'body_too_large', '提交内容超过 32 KiB 限制。')
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  const bytes = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }

  try {
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
  } catch {
    throw new HttpBoundaryError(400, 'invalid_body', '请求内容不是有效 JSON。')
  }
}

export function utcHourStart(date: Date): string {
  const value = new Date(date)
  value.setUTCMinutes(0, 0, 0)
  return value.toISOString()
}

export function clientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP')?.trim() || 'unknown'
}
