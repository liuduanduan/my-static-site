import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(
  new URL('../docs/.vitepress/theme/custom.css', import.meta.url),
  'utf8'
)

interface CssBlock {
  header: string
  body: string
  hasNestedBlocks: boolean
}

function blocks(source: string): CssBlock[] {
  const result: CssBlock[] = []
  const stack: Array<{ header: string; bodyStart: number; hasNestedBlocks: boolean }> = []
  let headerStart = 0

  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '{') {
      if (stack.length) stack[stack.length - 1].hasNestedBlocks = true
      stack.push({
        header: source.slice(headerStart, index).trim(),
        bodyStart: index + 1,
        hasNestedBlocks: false
      })
      headerStart = index + 1
    } else if (source[index] === '}') {
      const block = stack.pop()
      if (!block) continue
      result.push({
        header: block.header,
        body: source.slice(block.bodyStart, index),
        hasNestedBlocks: block.hasNestedBlocks
      })
      headerStart = index + 1
    }
  }

  return result
}

function rule(selector: string, source = css): string {
  const candidates = blocks(source).filter(({ header, hasNestedBlocks }) =>
    !hasNestedBlocks && header.split(',').map((part) => part.trim()).includes(selector)
  )
  if (!candidates.length) throw new Error(`Missing CSS rule: ${selector}`)
  return candidates.map((block) => `${block.header} {${block.body}}`).join('\n')
}

function lastRule(selector: string, source = css): string {
  const candidates = blocks(source).filter(({ header, hasNestedBlocks }) =>
    !hasNestedBlocks && header.split(',').map((part) => part.trim()).includes(selector)
  )
  const block = candidates.at(-1)
  if (!block) throw new Error(`Missing CSS rule: ${selector}`)
  return `${block.header} {${block.body}}`
}

function media(query: string): string {
  const block = blocks(css).find(({ header }) => header === `@media ${query}`)
  if (!block) throw new Error(`Missing media query: ${query}`)
  return block.body
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
    expect(rule('.tool-detail-disclosure')).toContain('color: var(--platform-muted-strong)')
    expect(rule('.directory-filter label')).toContain('color: var(--platform-muted-strong)')
    expect(rule('.directory-filter select')).toContain('color: var(--platform-ink)')
    expect(rule('.tool-fact-badge')).toContain('color: var(--platform-muted-strong)')
    expect(rule('.tool-facts strong')).toContain('color: var(--platform-ink)')
    expect(strongMuted).toBeDefined()
    expect(contrast('#65728a', '#fafbfe')).toBeGreaterThanOrEqual(4.5)
    expect(contrast(strongMuted!, '#eef2fc')).toBeGreaterThanOrEqual(4.5)
  })
})

describe('expanded directory layout', () => {
  it('uses three balanced columns for category, discovery, and tool cards', () => {
    expect(rule('.category-grid')).toContain('grid-template-columns: repeat(3, minmax(0, 1fr))')
    expect(rule('.discovery-grid')).toContain('grid-template-columns: repeat(3, minmax(0, 1fr))')
    expect(rule('.tool-grid')).toContain('grid-template-columns: repeat(3, minmax(0, 1fr))')
  })

  it('shows four resilient fact cells on wide detail pages', () => {
    expect(rule('.tool-facts')).toContain('grid-template-columns: repeat(4, minmax(0, 1fr))')
    expect(rule('.tool-facts > div')).toContain('min-width: 0')
    expect(rule('.tool-facts strong')).toContain('overflow-wrap: anywhere')
  })

  it('keeps filters grouped and all primary controls touch friendly', () => {
    expect(rule('.directory-filters')).toContain('grid-template-columns: repeat(3, minmax(0, 1fr)) auto')
    expect(rule('.directory-filters')).toContain('border: 1px solid var(--platform-line)')
    expect(rule('.directory-filter select')).toContain('min-height: 44px')
    expect(rule('.directory-filters > button')).toContain('min-height: 44px')
    expect(rule('.discovery-tab')).toContain('min-height: 44px')
    expect(rule('.directory-load-more')).toContain('justify-content: center')
  })

  it('keeps the search clear control centered with a 44px touch target', () => {
    const clearRule = rule('.search-clear')

    expect(clearRule).toContain('display: inline-flex')
    expect(clearRule).toContain('align-items: center')
    expect(clearRule).toContain('justify-content: center')
    expect(clearRule).toContain('min-width: 44px')
    expect(clearRule).toContain('min-height: 44px')
  })

  it('reserves search input space for desktop and phone controls without collapsing the field', () => {
    const phone = media('(max-width: 700px)')

    expect(rule('.directory-search-card input')).toContain('min-width: 0')
    expect(rule('.directory-search-card input')).toContain('padding: 0 92px 0 0')
    expect(rule('.directory-search-card input', phone)).toContain('padding-right: 80px')
  })

  it.each([
    '.section-link',
    '.empty-reset',
    '.back-link',
    '.tool-detail-link'
  ])('keeps the final %s rule aligned and at least 44px tall', (selector) => {
    const finalRule = lastRule(selector)

    expect(finalRule).toContain('display: inline-flex')
    expect(finalRule).toContain('align-items: center')
    expect(finalRule).toContain('min-height: 44px')
  })
})

describe('keyboard and motion accessibility', () => {
  it.each([
    '.category-card:focus-visible',
    '.discovery-tab:focus-visible',
    '.directory-filter select:focus-visible',
    '.directory-filters > button:focus-visible',
    '.directory-load-more .section-link:focus-visible',
    '.tool-detail-link:focus-visible',
    '.back-link:focus-visible',
    '.official-link:focus-visible',
    '.alternative-list a:focus-visible',
    '.empty-reset:focus-visible'
  ])('gives %s a high-contrast focus ring', (selector) => {
    expect(rule(selector)).toContain('outline: 3px solid var(--platform-blue-deep)')
    expect(rule(selector)).toContain('outline-offset: 3px')
    expect(rule(selector)).toContain('box-shadow: 0 0 0 6px #ffd35c')
  })

  it('collapses filters, cards, and facts at phone widths', () => {
    const phone = media('(max-width: 700px)')

    expect(rule('.directory-filters', phone)).toContain('grid-template-columns: 1fr')
    expect(rule('.category-grid', phone)).toContain('grid-template-columns: 1fr')
    expect(rule('.discovery-grid', phone)).toContain('grid-template-columns: 1fr')
    expect(rule('.tool-grid', phone)).toContain('grid-template-columns: 1fr')
    expect(rule('.tool-facts', phone)).toContain('grid-template-columns: 1fr')
  })

  it('uses compact 390px padding without shrinking interactive targets', () => {
    const compact = media('(max-width: 390px)')

    expect(rule('.directory-filters', compact)).toContain('padding: 14px')
    expect(rule('.tool-card', compact)).toContain('padding: 16px')
    expect(rule('.directory-filter select', compact)).toContain('min-height: 44px')
    expect(rule('.directory-filters > button', compact)).toContain('min-height: 44px')
    expect(rule('.discovery-tab', compact)).toContain('min-height: 44px')
  })

  it('keeps submission choice and consent targets at least 44px tall', () => {
    expect(rule('.submission-field--checks label')).toContain('min-height: 44px')
    expect(rule('.submission-intents label')).toContain('min-height: 44px')
    expect(rule('.submission-terms')).toContain('min-height: 44px')
  })

  it('removes motion for users who request it', () => {
    const reducedMotion = media('(prefers-reduced-motion: reduce)')

    expect(rule('*', reducedMotion)).toContain('transition-duration: 0.01ms !important')
    expect(rule('*', reducedMotion)).toContain('animation-duration: 0.01ms !important')
    expect(rule('*', reducedMotion)).toContain('animation-iteration-count: 1 !important')
  })
})
