import rawTools from '../../docs/.vitepress/theme/domain/ai-tools.json'
import type { CampaignPublic } from '../../shared/submissions/contracts'
import { parseCampaignPublic } from '../../shared/submissions/validation'
import type { Env } from '../_lib/env'
import { HttpBoundaryError, errorResponse } from '../_lib/http'
import { CampaignRepository } from '../_lib/submissionRepository'

interface RequestContext {
  request: Request
}

export interface CampaignsHandlerDeps {
  repository: CampaignRepository
  publishedSlugs: ReadonlySet<string>
  now(): Date
}

function campaignsResponse(campaigns: readonly CampaignPublic[]): Response {
  return new Response(JSON.stringify({ campaigns }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=60',
      'X-Content-Type-Options': 'nosniff'
    }
  })
}

export function createCampaignsHandler(deps: CampaignsHandlerDeps) {
  return async (context: RequestContext): Promise<Response> => {
    if (context.request.method !== 'GET') {
      return errorResponse(
        new HttpBoundaryError(405, 'method_not_allowed', '只支持 GET 请求。', {
          Allow: 'GET'
        })
      )
    }
    try {
      const records = await deps.repository.listActive(
        deps.now().toISOString(),
        deps.publishedSlugs
      )
      const campaigns: CampaignPublic[] = []
      for (const record of records) {
        if (!deps.publishedSlugs.has(record.toolSlug)) continue
        try {
          campaigns.push(parseCampaignPublic({
            toolSlug: record.toolSlug,
            type: record.type,
            label: record.label,
            destinationUrl: record.destinationUrl
          }) as CampaignPublic)
        } catch {
          // Invalid private campaign configuration is omitted from public output.
        }
      }
      return campaignsResponse(campaigns)
    } catch {
      return errorResponse(
        new HttpBoundaryError(503, 'campaigns_unavailable', '商业活动暂时不可用。')
      )
    }
  }
}

const publishedSlugs = new Set(rawTools.map(({ slug }) => slug))

export const onRequest: PagesFunction<Env> = async (context) =>
  createCampaignsHandler({
    repository: new CampaignRepository(context.env.SUBMISSIONS_DB),
    publishedSlugs,
    now: () => new Date()
  })(context)
