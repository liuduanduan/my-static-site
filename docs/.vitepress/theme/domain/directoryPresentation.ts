import type { ToolCategory } from './aiTools'

export interface CategoryVisual {
  icon: string
  accent: string
  soft: string
  summary: string
}

export interface ToolVisual {
  mark: string
  accent: string
  soft: string
}

export const platformHero = {
  eyebrow: '24+ 款工具 · 6 大使用场景',
  title: '你需要的 AI 工具，都在这里。',
  subtitle: '精选真正值得使用的 AI 工具，帮你完成写作、设计、视频、编程与办公。',
  actions: [
    { label: '探索 AI 工具', href: '#tool-directory', tone: 'primary' },
    { label: '按场景查找', href: '#popular-categories', tone: 'secondary' }
  ]
} as const

export const categoryVisuals: Record<ToolCategory, CategoryVisual> = {
  writing: {
    icon: '✦',
    accent: '#7758f6',
    soft: '#f1edff',
    summary: '对话、写作与资料整理'
  },
  image: {
    icon: '◫',
    accent: '#f05b8d',
    soft: '#fff0f5',
    summary: '绘图、设计与视觉创意'
  },
  video: {
    icon: '▶',
    accent: '#ff7043',
    soft: '#fff1ec',
    summary: '视频生成、剪辑与动效'
  },
  coding: {
    icon: '</>',
    accent: '#2676e8',
    soft: '#eaf3ff',
    summary: '编程、原型与应用开发'
  },
  productivity: {
    icon: '✓',
    accent: '#13a47b',
    soft: '#e8faf5',
    summary: '搜索、演示与团队协作'
  },
  audio: {
    icon: '∿',
    accent: '#e5a11a',
    soft: '#fff7df',
    summary: '语音、音乐与会议记录'
  }
}

const toolVisuals: Record<string, ToolVisual> = {
  ChatGPT: { mark: 'AI', accent: '#11a683', soft: '#e7f8f3' },
  Claude: { mark: 'CL', accent: '#d97746', soft: '#fff0e7' },
  DeepSeek: { mark: 'DS', accent: '#4d6bfe', soft: '#edf0ff' },
  Kimi: { mark: 'K', accent: '#18181b', soft: '#f0f0f2' },
  Midjourney: { mark: 'MJ', accent: '#111827', soft: '#eef0f3' },
  Canva: { mark: 'CA', accent: '#7b2ff7', soft: '#f2ebff' },
  'Adobe Firefly': { mark: 'FF', accent: '#ff3c2f', soft: '#ffeded' },
  'Leonardo AI': { mark: 'LE', accent: '#7459e9', soft: '#efecff' },
  Runway: { mark: 'RW', accent: '#111827', soft: '#eef0f3' },
  CapCut: { mark: 'CC', accent: '#111827', soft: '#eef0f3' },
  '可灵 Kling': { mark: 'KL', accent: '#735cff', soft: '#efedff' },
  Pika: { mark: 'PI', accent: '#ec4b84', soft: '#ffedf4' },
  Cursor: { mark: 'CU', accent: '#111827', soft: '#eef0f3' },
  'GitHub Copilot': { mark: 'GH', accent: '#24292f', soft: '#eef0f3' },
  v0: { mark: 'v0', accent: '#111827', soft: '#eef0f3' },
  Lovable: { mark: 'LO', accent: '#ec4d87', soft: '#ffedf4' },
  Notion: { mark: 'N', accent: '#111827', soft: '#eef0f3' },
  Perplexity: { mark: 'PX', accent: '#1995a6', soft: '#e7f8fa' },
  Gamma: { mark: 'G', accent: '#7c3aed', soft: '#f1eaff' },
  'Napkin AI': { mark: 'NA', accent: '#ff6947', soft: '#fff0eb' },
  ElevenLabs: { mark: '11', accent: '#111827', soft: '#eef0f3' },
  Suno: { mark: 'SU', accent: '#8b3df2', soft: '#f3ebff' },
  Udio: { mark: 'U', accent: '#111827', soft: '#eef0f3' },
  'Otter.ai': { mark: 'OT', accent: '#315efb', soft: '#eaf0ff' }
}

function initials(name: string): string {
  const parts = name
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return 'AI'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

export function getToolVisual(name: string, category: ToolCategory): ToolVisual {
  return toolVisuals[name] ?? {
    mark: initials(name),
    accent: categoryVisuals[category].accent,
    soft: categoryVisuals[category].soft
  }
}
