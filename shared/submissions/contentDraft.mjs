export function buildCatalogTool(submission, draft, alternatives, date) {
  const accessModes = submission.accessModes.length
    ? [...submission.accessModes]
    : ['web']
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
    accessModes,
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
