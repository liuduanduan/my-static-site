import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(
  new URL('../docs/.vitepress/theme/custom.css', import.meta.url),
  'utf8'
)

function rule(selector: string): string {
  const start = css.indexOf(`${selector} {`)
  if (start < 0) throw new Error(`Missing CSS rule: ${selector}`)
  const end = css.indexOf('}', start)
  return css.slice(start, end + 1)
}

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16)) as [number, number, number]
}

function luminance(hex: string): number {
  const [red, green, blue] = hexToRgb(hex).map((channel) => {
    const value = channel / 255
    return value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

function contrast(first: string, second: string): number {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

function composite(foreground: string, background: string, alpha: number): string {
  const front = hexToRgb(foreground)
  const back = hexToRgb(background)
  const channels = front.map((channel, index) =>
    Math.round(channel * alpha + back[index] * (1 - alpha))
  )

  return `#${channels.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

describe('platform text contrast', () => {
  it('keeps white hero copy on an AA-safe lightest gradient stop', () => {
    const lightestStop = css.match(/--platform-hero-lightest:\s*(#[0-9a-f]{6})/i)?.[1]

    expect(lightestStop).toBeDefined()
    expect(contrast('#ffffff', lightestStop!)).toBeGreaterThanOrEqual(4.5)
    const darkSurface = composite('#14213a', lightestStop!, 0.16)
    expect(contrast('#ffffff', darkSurface)).toBeGreaterThanOrEqual(4.5)
    expect(rule('.directory-lede')).toContain('color: #ffffff')
    expect(rule('.hero-eyebrow')).toContain('background: rgba(20, 33, 58, 0.16)')
    expect(rule('.hero-eyebrow')).toContain('color: #ffffff')
    expect(rule('.hero-action--secondary')).toContain('background: rgba(20, 33, 58, 0.16)')
    expect(rule('.hero-action--secondary:hover')).toContain('background: rgba(20, 33, 58, 0.24)')
    expect(rule('.hero-trust')).toContain('color: #ffffff')
    expect(rule('.detail-kicker')).toContain('color: #ffffff')
    expect(rule('.detail-curated')).toContain('color: #ffffff')
    expect(rule('.tool-detail-description')).toContain('color: #ffffff')
    expect(rule('.detail-updated')).toContain('color: #ffffff')
  })

  it('uses dark text tokens for small labels on light surfaces', () => {
    const strongMuted = css.match(/--platform-muted-strong:\s*(#[0-9a-f]{6})/i)?.[1]

    expect(rule('.category-count')).toContain('color: var(--platform-ink)')
    expect(rule('.use-case-chips span')).toContain('color: var(--platform-muted)')
    expect(rule('.directory-search-card input::placeholder')).toContain('color: var(--platform-muted)')
    expect(rule('.search-shortcut,\n.search-clear')).toContain('color: var(--platform-muted)')
    expect(rule('.tool-detail-disclosure')).toContain('color: var(--platform-muted-strong)')
    expect(strongMuted).toBeDefined()
    expect(contrast('#65728a', '#fafbfe')).toBeGreaterThanOrEqual(4.5)
    expect(contrast(strongMuted!, '#eef2fc')).toBeGreaterThanOrEqual(4.5)
  })
})
