import { defineConfig } from 'vitepress'

const zhSearchTranslations = {
  button: {
    buttonText: '搜索',
    buttonAriaLabel: '搜索文档'
  },
  modal: {
    displayDetails: '显示详细列表',
    resetButtonTitle: '清除搜索',
    backButtonTitle: '关闭搜索',
    noResultsText: '没有找到结果',
    footer: {
      selectText: '选择',
      selectKeyAriaLabel: '回车',
      navigateText: '切换',
      navigateUpKeyAriaLabel: '上箭头',
      navigateDownKeyAriaLabel: '下箭头',
      closeText: '关闭',
      closeKeyAriaLabel: 'Esc'
    }
  }
}

const enPrefix = '/en'
const prefixed = (items, prefix = '') => items.map((item) => ({ ...item, link: `${prefix}${item.link}` }))

const zhGlossaryItems = [
  { text: '修仙 / Cultivation', link: '/glossary/cultivation' },
  { text: '灵气 / Qi', link: '/glossary/qi' },
  { text: '修真 / Xiuzhen', link: '/glossary/xiuzhen' },
  { text: '金丹 / Golden Core', link: '/glossary/golden-core' },
  { text: '元婴 / Nascent Soul', link: '/glossary/nascent-soul' },
  { text: '飞升 / Ascension', link: '/glossary/ascension' },
  { text: '渡劫 / Tribulation', link: '/glossary/tribulation' },
  { text: '散修 / Rogue Cultivator', link: '/glossary/rogue-cultivator' },
  { text: '宗门 / Sect', link: '/glossary/sect' },
  { text: '法宝 / Artifact', link: '/glossary/artifact' },
  { text: '筑基丹 / Foundation Establishment Pill', link: '/glossary/foundation-establishment-pill' },
  { text: '飞剑 / Flying Sword', link: '/glossary/flying-sword' }
]

const enGlossaryItems = [
  { text: 'Cultivation / 修仙', link: '/glossary/cultivation' },
  { text: 'Qi / 灵气', link: '/glossary/qi' },
  { text: 'Xiuzhen / 修真', link: '/glossary/xiuzhen' },
  { text: 'Golden Core / 金丹', link: '/glossary/golden-core' },
  { text: 'Nascent Soul / 元婴', link: '/glossary/nascent-soul' },
  { text: 'Ascension / 飞升', link: '/glossary/ascension' },
  { text: 'Tribulation / 渡劫', link: '/glossary/tribulation' },
  { text: 'Rogue Cultivator / 散修', link: '/glossary/rogue-cultivator' },
  { text: 'Sect / 宗门', link: '/glossary/sect' },
  { text: 'Artifact / 法宝', link: '/glossary/artifact' },
  { text: 'Foundation Establishment Pill / 筑基丹', link: '/glossary/foundation-establishment-pill' },
  { text: 'Flying Sword / 飞剑', link: '/glossary/flying-sword' }
]

const zhCategoryItems = [
  { text: '修炼境界', link: '/categories/cultivation-realms' },
  { text: '功法武学', link: '/categories/techniques-and-arts' },
  { text: '灵药丹方', link: '/categories/elixirs-and-pills' },
  { text: '神兵利器', link: '/categories/divine-weapons' },
  { text: '修仙门派', link: '/categories/sects-and-clans' },
  { text: '天材地宝', link: '/categories/natural-treasures' },
  { text: '阵法符箓', link: '/categories/formations-and-talismans' },
  { text: '妖魔鬼怪', link: '/categories/beasts-and-demons' },
  { text: '修仙地域', link: '/categories/realms-and-regions' },
  { text: '修仙职业', link: '/categories/cultivation-roles' },
  { text: '核心术语', link: '/categories/core-terms' }
]

const enCategoryItems = [
  { text: 'Cultivation Realms', link: '/categories/cultivation-realms' },
  { text: 'Techniques & Arts', link: '/categories/techniques-and-arts' },
  { text: 'Elixirs & Pills', link: '/categories/elixirs-and-pills' },
  { text: 'Divine Weapons', link: '/categories/divine-weapons' },
  { text: 'Sects & Clans', link: '/categories/sects-and-clans' },
  { text: 'Natural Treasures', link: '/categories/natural-treasures' },
  { text: 'Formations & Talismans', link: '/categories/formations-and-talismans' },
  { text: 'Beasts & Demons', link: '/categories/beasts-and-demons' },
  { text: 'Realms & Regions', link: '/categories/realms-and-regions' },
  { text: 'Cultivation Roles', link: '/categories/cultivation-roles' },
  { text: 'Core Terms', link: '/categories/core-terms' }
]

const zhRealmItems = [
  { text: '炼气 / Qi Refining', link: '/cultivation-system/qi-refining' },
  { text: '筑基 / Foundation Building', link: '/cultivation-system/foundation-building' },
  { text: '结丹 / Core Formation', link: '/cultivation-system/core-formation' },
  { text: '元婴 / Nascent Soul', link: '/cultivation-system/nascent-soul' },
  { text: '化神 / Spirit Transformation', link: '/cultivation-system/spirit-transformation' },
  { text: '炼虚 / Void Refining', link: '/cultivation-system/void-refining' },
  { text: '合体 / Body Integration', link: '/cultivation-system/body-integration' },
  { text: '大乘 / Great Ascension', link: '/cultivation-system/great-ascension' },
  { text: '渡劫 / Tribulation Crossing', link: '/cultivation-system/tribulation-crossing' },
  { text: '仙人 / Immortal', link: '/cultivation-system/immortal' }
]

const enRealmItems = [
  { text: 'Qi Refining / 炼气', link: '/cultivation-system/qi-refining' },
  { text: 'Foundation Building / 筑基', link: '/cultivation-system/foundation-building' },
  { text: 'Core Formation / 结丹', link: '/cultivation-system/core-formation' },
  { text: 'Nascent Soul / 元婴', link: '/cultivation-system/nascent-soul' },
  { text: 'Spirit Transformation / 化神', link: '/cultivation-system/spirit-transformation' },
  { text: 'Void Refining / 炼虚', link: '/cultivation-system/void-refining' },
  { text: 'Body Integration / 合体', link: '/cultivation-system/body-integration' },
  { text: 'Great Ascension / 大乘', link: '/cultivation-system/great-ascension' },
  { text: 'Tribulation Crossing / 渡劫', link: '/cultivation-system/tribulation-crossing' },
  { text: 'Immortal / 仙人', link: '/cultivation-system/immortal' }
]

const zhNav = [
  { text: '首页', link: '/' },
  { text: '术语词典', link: '/glossary/' },
  { text: '修炼体系', link: '/cultivation-system/' },
  { text: '经典作品', link: '/classic-works/' },
  { text: '文化背景', link: '/culture/' },
  { text: '贡献', link: '/contribute' },
  { text: 'English', link: '/en/' }
]

const enNav = [
  { text: 'Home', link: '/en/' },
  { text: 'Glossary', link: '/en/glossary/' },
  { text: 'Cultivation System', link: '/en/cultivation-system/' },
  { text: 'Classic Works', link: '/en/classic-works/' },
  { text: 'Culture', link: '/en/culture/' },
  { text: 'Contribute', link: '/en/contribute' },
  { text: '中文', link: '/' }
]

function zhSidebar() {
  return {
    '/glossary/': [
      { text: '术语词典', items: [{ text: '概览', link: '/glossary/' }, ...zhGlossaryItems] },
      { text: '分类浏览', items: zhCategoryItems }
    ],
    '/categories/': [
      { text: '分类体系', items: [{ text: '全部分类', link: '/categories/' }, ...zhCategoryItems] },
      { text: '首批词条', items: zhGlossaryItems }
    ],
    '/cultivation-system/': [
      { text: '修炼体系', items: [{ text: '总览', link: '/cultivation-system/' }, ...zhRealmItems] },
      {
        text: '相关术语',
        items: [
          { text: '灵气', link: '/glossary/qi' },
          { text: '金丹', link: '/glossary/golden-core' },
          { text: '元婴', link: '/glossary/nascent-soul' },
          { text: '渡劫', link: '/glossary/tribulation' }
        ]
      }
    ],
    '/classic-works/': [
      {
        text: '经典作品',
        items: [
          { text: '概览', link: '/classic-works/' },
          { text: '凡人修仙传', link: '/classic-works/mortal-journey' },
          { text: '飘渺之旅', link: '/classic-works/piao-miao-journey' },
          { text: '佛本是道', link: '/classic-works/buddha-is-the-tao' },
          { text: '仙逆', link: '/classic-works/renegade-immortal' },
          { text: '我欲封天', link: '/classic-works/i-shall-seal-the-heavens' }
        ]
      }
    ],
    '/culture/': [
      {
        text: '文化背景',
        items: [
          { text: '概览', link: '/culture/' },
          { text: '道教与修仙', link: '/culture/taoism-and-xianxia' },
          { text: '内丹术', link: '/culture/inner-alchemy' },
          { text: '五行', link: '/culture/five-elements' },
          { text: '中国神话中的仙', link: '/culture/chinese-xian' },
          { text: '长生与不朽', link: '/culture/immortality' }
        ]
      }
    ],
    '/': [
      {
        text: '开始阅读',
        items: [
          { text: '首页', link: '/' },
          { text: '术语词典', link: '/glossary/' },
          { text: '分类体系', link: '/categories/' },
          { text: '修炼体系', link: '/cultivation-system/' }
        ]
      },
      { text: '核心术语', items: zhGlossaryItems.slice(0, 8) },
      {
        text: '站点',
        items: [
          { text: '关于', link: '/about' },
          { text: '贡献', link: '/contribute' },
          { text: '部署', link: '/deploy' }
        ]
      }
    ]
  }
}

function enSidebar() {
  const glossary = prefixed(enGlossaryItems, enPrefix)
  const categories = prefixed(enCategoryItems, enPrefix)
  const realms = prefixed(enRealmItems, enPrefix)

  return {
    '/en/glossary/': [
      { text: 'Glossary', items: [{ text: 'Overview', link: '/en/glossary/' }, ...glossary] },
      { text: 'Categories', items: categories }
    ],
    '/en/categories/': [
      { text: 'Categories', items: [{ text: 'All Categories', link: '/en/categories/' }, ...categories] },
      { text: 'Starter Terms', items: glossary }
    ],
    '/en/cultivation-system/': [
      { text: 'Cultivation System', items: [{ text: 'Overview', link: '/en/cultivation-system/' }, ...realms] },
      {
        text: 'Related Terms',
        items: [
          { text: 'Qi', link: '/en/glossary/qi' },
          { text: 'Golden Core', link: '/en/glossary/golden-core' },
          { text: 'Nascent Soul', link: '/en/glossary/nascent-soul' },
          { text: 'Tribulation', link: '/en/glossary/tribulation' }
        ]
      }
    ],
    '/en/classic-works/': [
      {
        text: 'Classic Works',
        items: [
          { text: 'Overview', link: '/en/classic-works/' },
          { text: "A Record of a Mortal's Journey to Immortality", link: '/en/classic-works/mortal-journey' },
          { text: 'The Journey of Piao Miao', link: '/en/classic-works/piao-miao-journey' },
          { text: 'Buddha Is the Tao', link: '/en/classic-works/buddha-is-the-tao' },
          { text: 'Renegade Immortal', link: '/en/classic-works/renegade-immortal' },
          { text: 'I Shall Seal the Heavens', link: '/en/classic-works/i-shall-seal-the-heavens' }
        ]
      }
    ],
    '/en/culture/': [
      {
        text: 'Cultural Background',
        items: [
          { text: 'Overview', link: '/en/culture/' },
          { text: 'Taoism and Xianxia', link: '/en/culture/taoism-and-xianxia' },
          { text: 'Inner Alchemy', link: '/en/culture/inner-alchemy' },
          { text: 'Five Elements', link: '/en/culture/five-elements' },
          { text: 'The Chinese Xian', link: '/en/culture/chinese-xian' },
          { text: 'Immortality and Longevity', link: '/en/culture/immortality' }
        ]
      }
    ],
    '/en/': [
      {
        text: 'Start Here',
        items: [
          { text: 'Home', link: '/en/' },
          { text: 'Glossary', link: '/en/glossary/' },
          { text: 'Categories', link: '/en/categories/' },
          { text: 'Cultivation System', link: '/en/cultivation-system/' }
        ]
      },
      { text: 'Core Terms', items: glossary.slice(0, 8) },
      {
        text: 'Site',
        items: [
          { text: 'About', link: '/en/about' },
          { text: 'Contribute', link: '/en/contribute' },
          { text: 'Deploy', link: '/en/deploy' }
        ]
      }
    ]
  }
}

export default defineConfig({
  lang: 'zh-CN',
  title: 'No996 修仙百科',
  description: '面向中英文读者的修仙、修真与中国幻想术语百科。',
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: 'https://no996noicu.com'
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'No996 修仙百科' }],
    ['meta', { property: 'og:description', content: '中英文修仙、修真与中国幻想术语百科。' }],
    ['meta', { property: 'og:image', content: 'https://no996noicu.com/social-card.svg' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'keywords', content: 'Xianxia, Cultivation, Chinese Fantasy, Immortal, Martial Arts, Qi, Wuxia, 修仙, 修真' }]
  ],
  themeConfig: {
    logo: '/favicon.svg',
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: zhSearchTranslations
          }
        }
      }
    },
    nav: zhNav,
    sidebar: zhSidebar(),
    outline: {
      level: [2, 3]
    },
    langMenuLabel: '切换语言',
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '外观',
    footer: {
      message: '修仙、修真与中国幻想术语的中英文知识地图。',
      copyright: 'Copyright © 2026 No996 修仙百科'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/liuduanduan/my-static-site' }
    ]
  },
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'No996 修仙百科',
      description: '面向中英文读者的修仙、修真与中国幻想术语百科。'
    },
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'No996 Xianxia Codex',
      description: 'An English encyclopedia for xianxia, immortal cultivation, and Chinese fantasy terminology.',
      themeConfig: {
        nav: enNav,
        sidebar: enSidebar(),
        langMenuLabel: 'Change language',
        returnToTopLabel: 'Return to top',
        sidebarMenuLabel: 'Menu',
        darkModeSwitchLabel: 'Appearance',
        footer: {
          message: 'An English map of xianxia, cultivation, and immortal fantasy.',
          copyright: 'Copyright © 2026 No996 Xianxia Codex'
        }
      }
    }
  }
})
