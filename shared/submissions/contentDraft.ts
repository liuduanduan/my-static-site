import type { AiTool } from '../../docs/.vitepress/theme/domain/aiTools'
import type { ClaimedSubmission, ContentDraft } from './contracts'

export function buildCatalogTool(
  submission: ClaimedSubmission,
  draft: ContentDraft,
  alternatives: readonly [string, string],
  date: string
): AiTool {
  return {
    slug: draft.slug,
    name: submission.name,
    category: submission.category,
    tagline: submission.tagline,
    description: draft.description,
    bestFor: [...draft.bestFor],
    features: [...draft.features],
    pricing: draft.pricing,
    pricingMode: submission.pricingMode,
    chineseSupport: submission.chineseSupport,
    accessModes: submission.accessModes.length ? [...submission.accessModes] : ['web'],
    requiresAccount: draft.requiresAccount,
    tags: [...draft.tags],
    searchTerms: [...draft.searchTerms],
    pros: [...draft.pros],
    cons: [...draft.cons],
    url: submission.officialUrl,
    addedAt: date,
    updatedAt: date,
    alternatives: [...alternatives]
  }
}
