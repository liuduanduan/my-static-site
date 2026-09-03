import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const workflowPath = resolve('.github/workflows/discover-ai-tools.yml')
const submissionWorkflowPath = resolve('.github/workflows/curate-tool-submission.yml')

describe('trusted AI discovery workflow', () => {
  it('serializes every catalog writer without cancelling in-flight curation', () => {
    const submissionWorkflow = readFileSync(submissionWorkflowPath, 'utf8')

    expect(submissionWorkflow).toContain('group: ai-catalog-writes')
    expect(submissionWorkflow).toContain('cancel-in-progress: false')
  })

  it('runs the bounded daily discovery batch through verified PR-only publication', () => {
    const workflow = readFileSync(workflowPath, 'utf8')

    expect(workflow).toContain("cron: '47 1 * * *'")
    expect(workflow).toContain('group: ai-catalog-writes')
    expect(workflow).toContain('cancel-in-progress: false')
    expect(workflow).toContain('npm run tools:discover')
    expect(workflow).toContain('npm test')
    expect(workflow).toContain('npm run verify:build')
    expect(workflow).toContain('git diff --check')
    expect(workflow).toContain('gh pr create')
    expect(workflow).toContain('gh pr merge "$pr_url" --squash --delete-branch')
    expect(workflow).toContain('retention-days: 90')
    expect(workflow).toContain('AI 工具自动发现审核')
    expect(workflow).toContain('npm run search:notify')
    expect(workflow).toMatch(/actions\/checkout@[0-9a-f]{40}/)
    expect(workflow).toMatch(/actions\/setup-node@[0-9a-f]{40}/)
    expect(workflow).toMatch(/actions\/upload-artifact@[0-9a-f]{40}/)
    expect(workflow).not.toMatch(/push[^\n]*\bmain\b/)
    expect(workflow).not.toContain('pull_request_target')
    expect(workflow).not.toMatch(/curl[^\n]*\$\{\{.*candidate/i)
  })
})
