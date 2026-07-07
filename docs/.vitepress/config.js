import { defineConfig } from 'vitepress'

const glossaryItems = [
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

const categoryItems = [
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

const realmItems = [
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

export default defineConfig({
  lang: 'en-US',
  title: 'No996 Xianxia Codex',
  description: 'An English-first encyclopedia for xianxia, immortal cultivation, and Chinese fantasy terminology.',
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: 'https://no996noicu.com'
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'No996 Xianxia Codex' }],
    ['meta', { property: 'og:description', content: 'Decode realms, qi, sects, artifacts, pills, and immortal fantasy.' }],
    ['meta', { property: 'og:image', content: 'https://no996noicu.com/social-card.svg' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'keywords', content: 'Xianxia, Cultivation, Chinese Fantasy, Immortal, Martial Arts, Qi, Wuxia' }]
  ],
  themeConfig: {
    logo: '/favicon.svg',
    search: {
      provider: 'local'
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Glossary', link: '/glossary/' },
      { text: 'Cultivation System', link: '/cultivation-system/' },
      { text: 'Classic Works', link: '/classic-works/' },
      { text: 'Culture', link: '/culture/' },
      { text: 'Contribute', link: '/contribute' }
    ],
    sidebar: {
      '/glossary/': [
        { text: 'Glossary', items: [{ text: 'Overview', link: '/glossary/' }, ...glossaryItems] },
        { text: 'Categories', items: categoryItems }
      ],
      '/categories/': [
        { text: 'Categories', items: [{ text: 'All Categories', link: '/categories/' }, ...categoryItems] },
        { text: 'Starter Terms', items: glossaryItems }
      ],
      '/cultivation-system/': [
        { text: 'Cultivation System', items: [{ text: 'Overview', link: '/cultivation-system/' }, ...realmItems] },
        { text: 'Related Terms', items: [
          { text: 'Qi', link: '/glossary/qi' },
          { text: 'Golden Core', link: '/glossary/golden-core' },
          { text: 'Nascent Soul', link: '/glossary/nascent-soul' },
          { text: 'Tribulation', link: '/glossary/tribulation' }
        ] }
      ],
      '/classic-works/': [
        { text: 'Classic Works', items: [
          { text: 'Overview', link: '/classic-works/' },
          { text: "A Record of a Mortal's Journey to Immortality", link: '/classic-works/mortal-journey' },
          { text: 'The Journey of Piao Miao', link: '/classic-works/piao-miao-journey' },
          { text: 'Buddha Is the Tao', link: '/classic-works/buddha-is-the-tao' },
          { text: 'Renegade Immortal', link: '/classic-works/renegade-immortal' },
          { text: 'I Shall Seal the Heavens', link: '/classic-works/i-shall-seal-the-heavens' }
        ] },
        { text: 'Genre Branches', items: [
          { text: 'Mortal Flow', link: '/classic-works/mortal-journey' },
          { text: 'Primordial Myth Flow', link: '/classic-works/buddha-is-the-tao' },
          { text: 'Cultivation Civilization', link: '/classic-works/i-shall-seal-the-heavens' }
        ] }
      ],
      '/culture/': [
        { text: 'Cultural Background', items: [
          { text: 'Overview', link: '/culture/' },
          { text: 'Taoism and Xianxia', link: '/culture/taoism-and-xianxia' },
          { text: 'Inner Alchemy', link: '/culture/inner-alchemy' },
          { text: 'Five Elements', link: '/culture/five-elements' },
          { text: 'The Chinese Xian', link: '/culture/chinese-xian' },
          { text: 'Immortality and Longevity', link: '/culture/immortality' }
        ] }
      ],
      '/': [
        { text: 'Start Here', items: [
          { text: 'Home', link: '/' },
          { text: 'Glossary', link: '/glossary/' },
          { text: 'Categories', link: '/categories/' },
          { text: 'Cultivation System', link: '/cultivation-system/' }
        ] },
        { text: 'Core Terms', items: glossaryItems.slice(0, 8) },
        { text: 'Site', items: [
          { text: 'About', link: '/about' },
          { text: 'Contribute', link: '/contribute' },
          { text: 'Deploy', link: '/deploy' }
        ] }
      ]
    },
    outline: {
      level: [2, 3]
    },
    footer: {
      message: 'An English-first map of xianxia, cultivation, and immortal fantasy.',
      copyright: 'Copyright © 2026 No996 Xianxia Codex'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/liuduanduan/my-static-site' }
    ]
  }
})

