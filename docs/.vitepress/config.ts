import { defineConfig } from 'vitepress'

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

    return [
      ['meta', { property: 'og:title', content: pageTitle }],
      ['meta', { property: 'og:description', content: pageDescription }],
      ['meta', { property: 'og:image', content: 'https://no996noicu.com/social-card.png' }],
      ['meta', { name: 'twitter:title', content: pageTitle }],
      ['meta', { name: 'twitter:description', content: pageDescription }],
      ['meta', { name: 'twitter:image', content: 'https://no996noicu.com/social-card.png' }]
    ]
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['meta', { name: 'theme-color', content: '#122033' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: '寻器 AI 工具目录' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'keywords', content: 'AI工具, AI工具导航, AI写作, AI绘画, AI视频, AI编程, AI办公' }]
  ],
  themeConfig: {
    logo: '/favicon.svg',
    siteTitle: '寻器',
    nav: [
      { text: '工具目录', link: '/' },
      { text: '按场景浏览', link: '/ai-categories/' },
      { text: '关于寻器', link: '/about' },
      { text: '提交工具', link: '/about#更新建议' }
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
