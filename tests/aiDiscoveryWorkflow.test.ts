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
    expect(workflow).toContain('NEEDS_REVIEW: ${{ steps.discover.outputs.needs_review }}')
    expect(workflow).toContain("printf 'needs_review=%s\\n' \"$NEEDS_REVIEW\" >> \"$GITHUB_OUTPUT\"")
    expect(workflow).toContain("if: steps.validate.outputs.needs_review == 'true'")
    expect(workflow).not.toContain("if: steps.validate.outputs.has_review == 'true'")
    expect(workflow).toContain('npm run search:notify')
    expect(workflow).toMatch(/actions\/checkout@[0-9a-f]{40}/)
    expect(workflow).toMatch(/actions\/setup-node@[0-9a-f]{40}/)
    expect(workflow).toMatch(/actions\/upload-artifact@[0-9a-f]{40}/)
    expect(workflow).not.toMatch(/push[^\n]*\bmain\b/)
    expect(workflow).not.toContain('pull_request_target')
    expect(workflow).not.toMatch(/curl[^\n]*\$\{\{.*candidate/i)
  })

  it('stages and validates the exact generated catalog tree before committing', () => {
    const workflow = readFileSync(workflowPath, 'utf8')
    const createBranch = workflow.indexOf('git checkout -b "$BATCH_BRANCH"')
    const stageCatalog = workflow.indexOf('git add -- docs/.vitepress/theme/domain/ai-tools.json')
    const validateStaged = workflow.indexOf('git diff --cached --name-only -z')

    expect(createBranch).toBeGreaterThan(-1)
    expect(stageCatalog).toBeGreaterThan(createBranch)
    expect(validateStaged).toBeGreaterThan(stageCatalog)
    expect(workflow).toContain('git diff --name-only HEAD -z')
    expect(workflow).toContain('git ls-files --others --exclude-standard -z')
    expect(workflow).toContain('read -r -d')
    expect(workflow).toContain('docs/tools/*.md')
    expect(workflow).not.toContain('git diff --name-only main...HEAD')
  })

  it('binds the tested commit to the remote branch, pull request, and squash merge', () => {
    const workflow = readFileSync(workflowPath, 'utf8')

    expect(workflow).toContain('LOCAL_TESTED_HEAD="$(git rev-parse HEAD)"')
    expect(workflow).toContain('git ls-remote --exit-code --heads origin "$BATCH_BRANCH"')
    expect(workflow).toContain('--json headRefOid')
    expect(workflow).toContain('[[ "$head_oid" == "$EXPECTED_HEAD" ]]')
    expect(workflow).toContain('gh pr merge "$pr_url" --squash --delete-branch --match-head-commit "$EXPECTED_HEAD"')
  })

  it('reuses a same-tree remote branch by binding PR validation to its validated head', () => {
    const workflow = readFileSync(workflowPath, 'utf8')
    const remoteTreeCheck = workflow.indexOf('git diff --quiet "$LOCAL_TESTED_HEAD" "$remote_head" --')
    const reuseRemoteHead = workflow.indexOf('EXPECTED_HEAD="$remote_head"')

    expect(workflow).toContain('LOCAL_TESTED_HEAD="$(git rev-parse HEAD)"')
    expect(workflow).toContain('[[ ! "$remote_head" =~ ^[0-9a-f]{40}$ ]]')
    expect(workflow).toContain('Remote discovery branch exists with different content; refusing to overwrite it.')
    expect(remoteTreeCheck).toBeGreaterThan(-1)
    expect(reuseRemoteHead).toBeGreaterThan(remoteTreeCheck)
    expect(workflow).toContain('EXPECTED_HEAD="$LOCAL_TESTED_HEAD"')
    expect(workflow).not.toContain('"$remote_head" != "$EXPECTED_HEAD"')
  })
})
