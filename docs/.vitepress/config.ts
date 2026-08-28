import { defineConfig } from 'vitepress'

const siteOrigin = 'https://no996noicu.com'

function pageRoute(relativePath: string): string {
  const withoutExtension = relativePath.replace(/\.md$/i, '')
  if (withoutExtension === 'index') return '/'
  if (withoutExtension.endsWith('/index')) return `/${withoutExtension.slice(0, -'/index'.length)}/`
  return `/${withoutExtension}`
}

function jsonLd(value: unknown): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c')
}

function breadcrumbGraph(relativePath: string, title: string) {
  if (/^tools\/[^/]+\.md$/i.test(relativePath)) return undefined

  const route = pageRoute(relativePath)
  const items = [
    { name: '首页', item: `${siteOrigin}/` }
  ]

  if (relativePath.startsWith('ai-categories/')) {
    items.push({ name: '按场景浏览', item: `${siteOrigin}/ai-categories/` })
  } else if (relativePath === 'submit/status.md') {
    items.push({ name: '提交工具', item: `${siteOrigin}/submit` })
  }

  if (route !== '/' && items.at(-1)?.item !== `${siteOrigin}${route}`) {
    items.push({ name: title || '寻器', item: `${siteOrigin}${route}` })
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item
    }))
  }
}

export default defineConfig({
  lang: 'zh-CN',
  title: '寻器 AI 工具目录',
  titleTemplate: ':title · 寻器',
  description: '为中文用户精选真正值得使用的 AI 工具，按场景找到合适的工具。',
  appearance: false,
  cleanUrls: true,
  lastUpdated: false,
  srcExclude: [
    'categories/**',
    'classic-works/**',
    'cultivation-system/**',
    'culture/**',
    'en/**',
    'glossary/**',
    'rmji/**',
    'superpowers/**',
    'contribute.md',
    'deploy.md'
  ],
  sitemap: {
    hostname: 'https://no996noicu.com'
  },
  transformHead({ pageData }) {
    const pageTitle = pageData.title
      ? `${pageData.title} · 寻器`
      : '寻器 AI 工具目录'
    const pageDescription = pageData.description || '按真实使用场景，找到适合你的 AI 工具。'

    const head = [
      ['meta', { property: 'og:title', content: pageTitle }],
      ['meta', { property: 'og:description', content: pageDescription }],
      ['meta', { property: 'og:image', content: 'https://no996noicu.com/social-card.png' }],
      ['meta', { name: 'twitter:title', content: pageTitle }],
      ['meta', { name: 'twitter:description', content: pageDescription }],
      ['meta', { name: 'twitter:image', content: 'https://no996noicu.com/social-card.png' }]
    ]
    const breadcrumbs = breadcrumbGraph(pageData.relativePath, pageData.title)
    if (breadcrumbs) {
      head.push(['script', { type: 'application/ld+json' }, jsonLd(breadcrumbs)])
    }
    return head
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['meta', { name: 'theme-color', content: '#122033' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: '寻器 AI 工具目录' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'baidu-site-verification', content: 'codeva-NviX9WP2zz' }],
    ['meta', { name: 'keywords', content: 'AI工具, AI工具导航, AI写作, AI绘画, AI视频, AI编程, AI办公' }]
  ],
  themeConfig: {
    logo: '/favicon.svg',
    siteTitle: '寻器',
    nav: [
      { text: '工具目录', link: '/' },
      { text: '按场景浏览', link: '/ai-categories/' },
      { text: '关于寻器', link: '/about' },
      { text: '提交工具', link: '/submit' }
    ],
    search: {
      provider: 'local'
    },
    outline: false,
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '外观',
    footer: {
      message: '少一点选择，多一点创造。',
      copyright: '寻器只提供信息整理，价格、功能和授权以工具官网为准。'
    }
  }
})
