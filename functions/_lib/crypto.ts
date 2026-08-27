import type { SubmissionSecurityEnv } from './env'

const textEncoder = new TextEncoder()
const base32Alphabet = 'abcdefghijklmnopqrstuvwxyz234567'

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replaceAll('-', '+').replaceAll('_', '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function copyToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer
}

function decodeBase64Key(value: string): Uint8Array {
  let binary: string
  try {
    binary = atob(value)
  } catch {
    throw new Error('CONTACT_EMAIL_ENCRYPTION_KEY must be valid base64')
  }
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  if (bytes.byteLength !== 32) {
    throw new Error('CONTACT_EMAIL_ENCRYPTION_KEY must contain exactly 32 bytes')
  }
  return bytes
}

function randomBase32(byteLength: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength))
  let bits = 0
  let bitCount = 0
  let output = ''
  for (const byte of bytes) {
    bits = (bits << 8) | byte
    bitCount += 8
    while (bitCount >= 5) {
      bitCount -= 5
      output += base32Alphabet[(bits >>> bitCount) & 31]
      bits &= (1 << bitCount) - 1
    }
  }
  if (bitCount > 0) output += base32Alphabet[(bits << (5 - bitCount)) & 31]
  return output
}

export interface SubmissionSecurity {
  generatePublicCode(): string
  generatePublicRef(): string
  hashPublicCode(code: string): Promise<string>
  hashForPurpose(purpose: string, value: string): Promise<string>
  encryptEmail(email: string): Promise<string>
  decryptEmail(ciphertext: string): Promise<string>
}

export function createSubmissionSecurity(env: SubmissionSecurityEnv): SubmissionSecurity {
  if (typeof env.PUBLIC_CODE_PEPPER !== 'string' || env.PUBLIC_CODE_PEPPER.length < 16) {
    throw new Error('PUBLIC_CODE_PEPPER must contain at least 16 characters')
  }
  const encryptionKeyBytes = decodeBase64Key(env.CONTACT_EMAIL_ENCRYPTION_KEY)
  let hmacKeyPromise: Promise<CryptoKey> | undefined
  let encryptionKeyPromise: Promise<CryptoKey> | undefined

  function hmacKey(): Promise<CryptoKey> {
    hmacKeyPromise ??= crypto.subtle.importKey(
      'raw',
      textEncoder.encode(env.PUBLIC_CODE_PEPPER),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    return hmacKeyPromise
  }

  function encryptionKey(): Promise<CryptoKey> {
    encryptionKeyPromise ??= crypto.subtle.importKey(
      'raw',
      copyToArrayBuffer(encryptionKeyBytes),
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    )
    return encryptionKeyPromise
  }

  async function hashForPurpose(purpose: string, value: string): Promise<string> {
    if (!/^[a-z][a-z0-9-]{0,31}$/.test(purpose)) throw new Error('Invalid hash purpose')
    const signature = await crypto.subtle.sign(
      'HMAC',
      await hmacKey(),
      textEncoder.encode(`${purpose}\0${value}`)
    )
    return bytesToBase64Url(new Uint8Array(signature))
  }

  return {
    generatePublicCode() {
      return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(16)))
    },
    generatePublicRef() {
      return randomBase32(8)
    },
    hashPublicCode(code) {
      return hashForPurpose('public-code', code)
    },
    hashForPurpose,
    async encryptEmail(email) {
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        await encryptionKey(),
        textEncoder.encode(email)
      )
      return `v1.${bytesToBase64Url(iv)}.${bytesToBase64Url(new Uint8Array(ciphertext))}`
    },
    async decryptEmail(value) {
      const [version, ivValue, ciphertextValue, extra] = value.split('.')
      if (version !== 'v1' || !ivValue || !ciphertextValue || extra !== undefined) {
        throw new Error('Unsupported email ciphertext')
      }
      const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: copyToArrayBuffer(base64UrlToBytes(ivValue)) },
        await encryptionKey(),
        copyToArrayBuffer(base64UrlToBytes(ciphertextValue))
      )
      return new TextDecoder().decode(plaintext)
    }
  }
}
