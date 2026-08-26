import rawTools from './ai-tools.json'

export type ToolCategory =
  | 'writing'
  | 'image'
  | 'video'
  | 'coding'
  | 'productivity'
  | 'audio'

export interface AiTool {
  slug: string
  name: string
  category: ToolCategory
  tagline: string
  description: string
  bestFor: string[]
  features: string[]
  pricing: string
  pros: string[]
  cons: string[]
  url: string
  updatedAt: string
  alternatives: string[]
}

export type CategoryFilter = ToolCategory | 'all'

export const categoryLabels: Record<ToolCategory, string> = {
  writing: '写作与对话',
  image: '图像设计',
  video: '视频创作',
  coding: '编程开发',
  productivity: '办公效率',
  audio: '音频音乐'
}

const tools = rawTools as AiTool[]

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase()
}

export function getAllTools(): AiTool[] {
  return tools
}

export function getToolBySlug(slug: string): AiTool | undefined {
  return tools.find((tool) => tool.slug === slug)
}

export function getCategoryLabel(category: ToolCategory): string {
  return categoryLabels[category]
}

export function getCategories(): Array<{ value: ToolCategory; label: string; count: number }> {
  return (Object.keys(categoryLabels) as ToolCategory[]).map((value) => ({
    value,
    label: categoryLabels[value],
    count: tools.filter((tool) => tool.category === value).length
  }))
}

export function searchTools(query = '', category: CategoryFilter = 'all'): AiTool[] {
  const normalizedQuery = normalize(query)

  return tools.filter((tool) => {
    if (category !== 'all' && tool.category !== category) return false
    if (!normalizedQuery) return true

    const haystack = [
      tool.name,
      tool.tagline,
      tool.description,
      ...tool.bestFor,
      ...tool.features
    ]
      .join(' ')
      .toLocaleLowerCase()

    return haystack.includes(normalizedQuery)
  })
}

export function getFeaturedTools(limit = 6): AiTool[] {
  return tools.slice(0, limit)
}
