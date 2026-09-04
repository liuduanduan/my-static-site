import { describe, expect, it } from 'vitest'
import {
  inspectPendingDiscoveryPullRequests,
  reviewIssueDecision
} from '../scripts/discovery/workflowPolicy.mjs'

const repository = 'example/xunqi-directory'

function pullRequest(overrides: Record<string, unknown> = {}) {
  return {
    number: 42,
    url: `https://github.com/${repository}/pull/42`,
    headRefName: 'discovery/2026-09-04-12345',
    isCrossRepository: false,
    ...overrides
  }
}

describe('AI discovery workflow policy', () => {
  it('blocks publication for a validated same-repository discovery pull request', () => {
    const result = inspectPendingDiscoveryPullRequests([
      pullRequest(),
      pullRequest({
        number: 41,
        url: `https://github.com/${repository}/pull/41`,
        headRefName: 'feature/unrelated'
      })
    ], repository)

    expect(result).toEqual({
      hasPending: true,
      count: 1,
      pullRequest: {
        number: 42,
        url: `https://github.com/${repository}/pull/42`,
        headRefName: 'discovery/2026-09-04-12345'
      }
    })
    expect(Object.isFrozen(result)).toBe(true)
    expect(Object.isFrozen(result.pullRequest)).toBe(true)
  })

  it('ignores forks and unrelated heads without reading pull-request content', () => {
    expect(inspectPendingDiscoveryPullRequests([
      pullRequest({ isCrossRepository: true }),
      pullRequest({
        number: 43,
        url: `https://github.com/${repository}/pull/43`,
        headRefName: 'submission/public-ref-tool'
      })
    ], repository)).toEqual({ hasPending: false, count: 0, pullRequest: null })
  })

  it.each([
    [[pullRequest({ headRefName: 'discovery/bad\noutput=true' })], repository],
    [[pullRequest({ url: 'https://github.com/attacker/repo/pull/42' })], repository],
    [[pullRequest({ number: 0 })], repository],
    [[pullRequest({ isCrossRepository: 'false' })], repository],
    [[pullRequest()], 'bad repository']
  ])('fails closed for malformed pull-request metadata %#', (value, repo) => {
    expect(() => inspectPendingDiscoveryPullRequests(value, repo))
      .toThrow('invalid_pending_discovery_pull_requests')
  })

  it('allows only literal true to reach Issue handling and rejects invalid flags', () => {
    expect(reviewIssueDecision('true')).toEqual({ createIssue: true, output: 'true' })
    expect(reviewIssueDecision('false')).toEqual({ createIssue: false, output: 'false' })
    for (const value of ['', 'TRUE', '1', 'false\ncreate_issue=true']) {
      expect(() => reviewIssueDecision(value)).toThrow('invalid_discovery_review_flag')
    }
  })
})
