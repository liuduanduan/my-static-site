import { HttpBoundaryError } from './http'

const encoder = new TextEncoder()

async function sha256(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)))
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  let difference = left.byteLength ^ right.byteLength
  const length = Math.max(left.byteLength, right.byteLength)
  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0)
  }
  return difference === 0
}

export async function assertAdminAuthorization(
  request: Request,
  expectedToken: string
): Promise<void> {
  const authorization = request.headers.get('Authorization')
  const match = authorization?.match(/^Bearer ([^\s,]+)$/)
  const providedToken = match?.[1] ?? ''
  const [providedHash, expectedHash] = await Promise.all([
    sha256(providedToken),
    sha256(expectedToken)
  ])

  if (!match || !constantTimeEqual(providedHash, expectedHash)) {
    throw new HttpBoundaryError(401, 'unauthorized', '身份验证失败。', {
      'WWW-Authenticate': 'Bearer'
    })
  }
}
