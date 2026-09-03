import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  candidateKey,
  normalizeCandidate,
  parseDiscoveryConfig
} from '../scripts/discovery/contracts.mjs'
import {
  parseDiscoveryState,
  recordOutcome,
  shouldCoolDown
} from '../scripts/discovery/state.mjs'

const validConfig = {
  version: 1,
  limits: {
    sourceRecords: 50,
    newDomains: 15,
    publishPerRun: 3,
    catalogMaximum: 300
  },
  sources: [
    {
      id: 'github-ai-products',
      kind: 'github-search',
      enabled: true,
      query: 'topic:ai-tool stars:>=200 archived:false',
      minimumStars: 200,
      score: 50
    },
    {
      id: 'show-hn-ai',
      kind: 'hacker-news',
      enabled: true,
      query: 'Show HN AI',
      minimumPoints: 20,
      lookbackDays: 30,
      score: 40
    },
    {
      id: 'feed-one',
      kind: 'feed',
      enabled: true,
      url: 'https://feeds.example.com/ai.xml',
      score: 40
    }
  ]
}

const threeFailures = [
  {
    key: 'example.com',
    status: 'failed',
    errorCode: 'unreachable',
    processedAt: '2026-09-02T00:00:00.000Z',
    fingerprint: 'same-page'
  },
  {
    key: 'example.com',
    status: 'failed',
    errorCode: 'unreachable',
    processedAt: '2026-09-03T00:00:00.000Z',
    fingerprint: 'same-page'
  },
  {
    key: 'example.com',
    status: 'failed',
    errorCode: 'unreachable',
    processedAt: '2026-09-04T00:00:00.000Z',
    fingerprint: 'same-page'
  }
]

describe('AI discovery contracts', () => {
  it('accepts the three configured source kinds and rejects unknown keys', () => {
    expect(parseDiscoveryConfig(validConfig).sources.map(({ kind }) => kind)).toEqual([
      'github-search',
      'hacker-news',
      'feed'
    ])
    expect(() => parseDiscoveryConfig({
      ...validConfig,
      sources: [{ ...validConfig.sources[0], executable: 'curl bad.example' }]
    })).toThrow('invalid_discovery_config')
  })

  it('loads the checked-in bounded default source configuration', () => {
    const value = JSON.parse(readFileSync(resolve('config/ai-discovery-sources.json'), 'utf8'))

    expect(parseDiscoveryConfig(value)).toMatchObject({
      version: 1,
      limits: {
        sourceRecords: 50,
        newDomains: 15,
        publishPerRun: 3,
        catalogMaximum: 300
      },
      sources: [
        { id: 'github-ai-products', kind: 'github-search', enabled: true, score: 50 },
        { id: 'show-hn-ai', kind: 'hacker-news', enabled: true, score: 40 }
      ]
    })
  })

  it('normalizes tracking parameters and produces a stable candidate key', () => {
    const candidate = normalizeCandidate({
      name: ' Example AI ',
      url: 'https://www.Example.com/?utm_source=feed#top'
    }, { id: 'feed-one', kind: 'feed', score: 40 }, new Date('2026-09-03T00:00:00Z'))

    expect(candidate.url).toBe('https://www.example.com/')
    expect(candidate.discoveredAt).toBe('2026-09-03T00:00:00.000Z')
    expect(candidateKey(candidate)).toBe('example.com')
    expect(Object.isFrozen(candidate)).toBe(true)
  })

  it('rejects unsafe source records and unsafe candidate URLs', () => {
    expect(() => parseDiscoveryConfig({
      ...validConfig,
      sources: [{ ...validConfig.sources[2], url: 'http://feeds.example.com/ai.xml' }]
    })).toThrow('invalid_discovery_config')
    expect(() => normalizeCandidate({ name: 'Example', url: 'https://user:pass@example.com/' }, validConfig.sources[2], new Date()))
      .toThrow('invalid_discovery_candidate')
    expect(() => normalizeCandidate({ name: 'Example', url: 'https://example.com:8443/' }, validConfig.sources[2], new Date()))
      .toThrow('invalid_discovery_candidate')
    expect(() => normalizeCandidate({ name: '<script>', url: 'https://example.com/' }, validConfig.sources[2], new Date()))
      .toThrow('invalid_discovery_candidate')
  })

  it('cools down three identical failures for exactly 30 days', () => {
    const state = parseDiscoveryState({ version: 1, outcomes: threeFailures })

    expect(shouldCoolDown(state, 'example.com', new Date('2026-09-20'))).toBe(true)
    expect(shouldCoolDown(state, 'example.com', new Date('2026-10-04'))).toBe(false)
  })

  it('does not cool down failures when the candidate fingerprint changed', () => {
    const state = parseDiscoveryState({
      version: 1,
      outcomes: [
        ...threeFailures.slice(0, 2),
        { ...threeFailures[2], fingerprint: 'changed-page' }
      ]
    })

    expect(shouldCoolDown(state, 'example.com', new Date('2026-09-20'))).toBe(false)
  })

  it('normalizes valid ISO state timestamps to canonical UTC form', () => {
    const state = parseDiscoveryState({
      version: 1,
      outcomes: [{ ...threeFailures[0], processedAt: '2026-09-02T00:00:00Z' }]
    })

    expect(state.outcomes[0].processedAt).toBe('2026-09-02T00:00:00.000Z')
  })

  it('retains bounded state and replaces terminal outcomes for the same key', () => {
    const outcomes = Array.from({ length: 501 }, (_, index) => ({
      key: `tool-${index}.example`,
      status: 'review',
      errorCode: null,
      processedAt: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
      fingerprint: `fingerprint-${index}`
    }))
    const state = recordOutcome(parseDiscoveryState({ version: 1, outcomes }), {
      key: 'tool-500.example',
      status: 'published',
      errorCode: null,
      processedAt: '2026-02-01T00:00:00.000Z',
      fingerprint: 'published-page'
    })

    expect(state.outcomes).toHaveLength(500)
    expect(state.outcomes.filter(({ key }) => key === 'tool-500.example')).toEqual([
      expect.objectContaining({ status: 'published', fingerprint: 'published-page' })
    ])
  })
})
