import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'
import { describe, expect, test } from 'vitest'
import * as verifier from '../scripts/verify-ai-build.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const socialCard = readFileSync(resolve(root, 'docs/public/social-card.png'))
const pngSignatureAndIhdr = socialCard.subarray(0, 33)

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
  }
  return value >>> 0
})

function crc32(buffer: Buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type: string, data = Buffer.alloc(0)) {
  const typeBytes = Buffer.from(type, 'ascii')
  const chunk = Buffer.alloc(12 + data.length)
  chunk.writeUInt32BE(data.length, 0)
  typeBytes.copy(chunk, 4)
  data.copy(chunk, 8)
  chunk.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])), 8 + data.length)
  return chunk
}

function pngWithIdat(data: Buffer) {
  return Buffer.concat([pngSignatureAndIhdr, pngChunk('IDAT', data), pngChunk('IEND')])
}

function exportedFunction(name: string) {
  const candidate = (verifier as Record<string, unknown>)[name]
  expect(candidate, `${name} must be exported`).toBeTypeOf('function')
  return candidate as (...args: any[]) => any
}

describe('PNG structural validation', () => {
  test('accepts the current complete social card', () => {
    const validatePng = exportedFunction('validatePng')
    expect(validatePng(socialCard)).toMatchObject({ width: 1200, height: 630 })
  })

  test('rejects a 24-byte signature and IHDR header fake', () => {
    const validatePng = exportedFunction('validatePng')
    expect(() => validatePng(socialCard.subarray(0, 24))).toThrow(/truncated|IHDR|chunk/i)
  })

  test('rejects a chunk whose CRC does not match its type and data', () => {
    const validatePng = exportedFunction('validatePng')
    const invalidCrc = Buffer.from(socialCard)
    invalidCrc[29] ^= 0xff
    expect(() => validatePng(invalidCrc)).toThrow(/CRC/i)
  })

  test('rejects a PNG that has no complete IEND chunk', () => {
    const validatePng = exportedFunction('validatePng')
    expect(() => validatePng(socialCard.subarray(0, -12))).toThrow(/IEND|truncated/i)
  })

  test('rejects CRC-valid chunks containing an empty IDAT payload', () => {
    const validatePng = exportedFunction('validatePng')
    expect(() => validatePng(pngWithIdat(Buffer.alloc(0)))).toThrow(/empty|IDAT|inflate|zlib/i)
  })

  test('rejects a truncated zlib stream inside CRC-valid IDAT chunks', () => {
    const validatePng = exportedFunction('validatePng')
    expect(() => validatePng(pngWithIdat(Buffer.from([0x78, 0x9c, 0x00])))).toThrow(
      /inflate|zlib|stream/i
    )
  })

  test('rejects a decodable image stream with an invalid scanline filter', () => {
    const validatePng = exportedFunction('validatePng')
    const width = socialCard.readUInt32BE(16)
    const height = socialCard.readUInt32BE(20)
    const bitDepth = socialCard[24]
    const colorType = socialCard[25]
    const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType]
    expect(channels, 'fixture requires a supported non-palette color type').toBeDefined()
    expect(bitDepth).toBe(8)
    const rowBytes = width * channels!
    const scanlines = Buffer.alloc(height * (rowBytes + 1))
    scanlines[0] = 5
    expect(() => validatePng(pngWithIdat(deflateSync(scanlines)))).toThrow(/filter/i)
  })
})

describe('meta attribute shape', () => {
  const validHead = `
    <meta content="Tool description &amp; details" name="description">
    <meta content="Tool title" property="og:title">
    <meta property="og:description" content="Tool description &amp; details">
    <meta content="Tool title" name="twitter:title">
  `

  test('reads named and property metadata independent of attribute order', () => {
    const namedMeta = exportedFunction('namedMeta')
    const propertyMeta = exportedFunction('propertyMeta')
    expect(namedMeta(validHead, 'description', 'fixture')).toBe('Tool description & details')
    expect(namedMeta(validHead, 'twitter:title', 'fixture')).toBe('Tool title')
    expect(propertyMeta(validHead, 'og:title', 'fixture')).toBe('Tool title')
    expect(propertyMeta(validHead, 'og:description', 'fixture')).toBe('Tool description & details')
  })

  test('rejects description and Twitter metadata emitted with property attributes', () => {
    const namedMeta = exportedFunction('namedMeta')
    expect(() => namedMeta('<meta property="description" content="wrong">', 'description', 'fixture'))
      .toThrow(/name/i)
    expect(() =>
      namedMeta('<meta property="twitter:title" content="wrong">', 'twitter:title', 'fixture')
    ).toThrow(/name/i)
  })

  test('rejects Open Graph metadata emitted with name attributes', () => {
    const propertyMeta = exportedFunction('propertyMeta')
    expect(() => propertyMeta('<meta name="og:title" content="wrong">', 'og:title', 'fixture'))
      .toThrow(/property/i)
  })

  test('rejects a correctly shaped tag accompanied by a swapped-shape duplicate', () => {
    const propertyMeta = exportedFunction('propertyMeta')
    const duplicate = `
      <meta property="og:title" content="right">
      <meta name="og:title" content="wrong">
    `
    expect(() => propertyMeta(duplicate, 'og:title', 'fixture')).toThrow(/exactly one/i)
  })
})

describe('exact route verification', () => {
  test('rejects equal-sized route sets when one expected route is replaced by an extra route', () => {
    const assertExactSet = exportedFunction('assertExactSet')
    expect(() =>
      assertExactSet(
        new Set(['/tools', '/tools/chatgpt', '/tools/not-real']),
        new Set(['/tools', '/tools/chatgpt', '/tools/claude']),
        'tool artifacts'
      )
    ).toThrow(/claude.*not-real|not-real.*claude/i)
  })

  test('parses exact sitemap URL pathnames without substring matches', () => {
    const sitemapPathSet = exportedFunction('sitemapPathSet')
    const paths = sitemapPathSet(`<?xml version="1.0"?>
      <urlset><url><loc>https://example.com/tools/chatgpt-copy</loc></url>
      <url><loc>https://example.com/ai-categories/automation</loc></url></urlset>`)
    expect(paths).toEqual(new Set(['/tools/chatgpt-copy', '/ai-categories/automation']))
    expect(paths.has('/tools/chatgpt')).toBe(false)
  })
})
