import { defineConfig } from 'vitepress'

type SidebarItem = {
  text: string
  link?: string
  items?: SidebarItem[]
  collapsed?: boolean
}

const glossary = [
  { zh: '修仙', en: 'Cultivation', slug: 'cultivation' },
  { zh: '修真', en: 'Xiuzhen', slug: 'xiuzhen' },
  { zh: '灵气', en: 'Qi / Spiritual Energy', slug: 'qi' },
  { zh: '金丹', en: 'Golden Core', slug: 'golden-core' },
  { zh: '元婴', en: 'Nascent Soul', slug: 'nascent-soul' },
  { zh: '飞升', en: 'Ascension', slug: 'ascension' },
  { zh: '天劫', en: 'Tribulation', slug: 'heavenly-tribulation' },
  { zh: '散修', en: 'Rogue Cultivator', slug: 'rogue-cultivator' },
  { zh: '宗门', en: 'Sect', slug: 'sect' },
  { zh: '法宝', en: 'Artifact / Dharma Treasure', slug: 'artifact' },
  { zh: '灵石', en: 'Spirit Stone', slug: 'spirit-stone' },
  { zh: '功法', en: 'Cultivation Technique', slug: 'cultivation-technique' },
  { zh: '魔修', en: 'Demonic Cultivator', slug: 'demonic-cultivator' },
  { zh: '正道', en: 'Righteous Cultivator', slug: 'righteous-cultivator' },
  { zh: '仙人', en: 'Immortal', slug: 'immortal' },
  { zh: '轮回', en: 'Reincarnation', slug: 'reincarnation' },
  { zh: '走火入魔', en: 'Qi Deviation', slug: 'qi-deviation' },
  { zh: '仙术', en: 'Immortal Arts', slug: 'immortal-arts' },
  { zh: '内丹', en: 'Inner Alchemy', slug: 'inner-alchemy' },
  { zh: '渡劫', en: 'Tribulation Transcendence', slug: 'tribulation-transcendence' }
]

const categories = [
  { zh: '修炼境界', en: 'Cultivation Realms', slug: 'cultivation-realms' },
  { zh: '功法武学', en: 'Techniques & Arts', slug: 'techniques-and-arts' },
  { zh: '灵药丹方', en: 'Elixirs & Pills', slug: 'elixirs-and-pills' },
  { zh: '神兵利器', en: 'Divine Weapons', slug: 'divine-weapons' },
  { zh: '修仙门派', en: 'Sects & Clans', slug: 'sects-and-clans' },
  { zh: '天材地宝', en: 'Natural Treasures', slug: 'natural-treasures' },
  { zh: '阵法符箓', en: 'Formations & Talismans', slug: 'formations-and-talismans' },
  { zh: '妖魔鬼怪', en: 'Beasts & Demons', slug: 'beasts-and-demons' },
  { zh: '修仙地域', en: 'Realms & Regions', slug: 'realms-and-regions' },
  { zh: '修仙职业', en: 'Cultivation Roles', slug: 'cultivation-roles' },
  { zh: '核心术语', en: 'Core Terms', slug: 'core-terms' }
]

const realms = [
  { zh: '炼气期', en: 'Qi Refining', slug: 'qi-refining' },
  { zh: '筑基期', en: 'Foundation Establishment', slug: 'foundation-building' },
  { zh: '结丹期 / 金丹期', en: 'Core Formation / Golden Core', slug: 'core-formation' },
  { zh: '元婴期', en: 'Nascent Soul', slug: 'nascent-soul' },
  { zh: '化神期', en: 'Spirit Severing', slug: 'spirit-transformation' },
  { zh: '炼虚期', en: 'Void Refinement', slug: 'void-refining' },
  { zh: '合体期', en: 'Unity / Integration', slug: 'body-integration' },
  { zh: '大乘期', en: 'Mahayana / Great Vehicle', slug: 'great-ascension' },
  { zh: '渡劫期', en: 'Tribulation Transcendence', slug: 'tribulation-crossing' },
  { zh: '真仙境', en: 'True Immortal', slug: 'true-immortal' },
  { zh: '金仙境', en: 'Golden Immortal', slug: 'golden-immortal' },
  { zh: '太乙境', en: 'Taiyi / Jade Immortal', slug: 'taiyi' },
  { zh: '大罗境', en: 'Da Luo / Great Luo', slug: 'da-luo' },
  { zh: '道祖境', en: 'Dao Ancestor', slug: 'dao-ancestor' }
]

const works = [
  { zh: '飘邈之旅', en: 'Stellar Travel', slug: 'piao-miao-journey' },
  { zh: '佛本是道', en: 'Buddha Is The Way', slug: 'buddha-is-the-tao' },
  { zh: '凡人修仙传', en: "A Record of a Mortal's Journey to Immortality", slug: 'mortal-journey' },
  { zh: '凡人修仙之仙界篇', en: 'RMJI: Immortal World Arc', slug: 'rmji-immortal-world' },
  { zh: '修真门派掌门路', en: 'The Path of a Sect Leader', slug: 'sect-leader' },
  { zh: '诛仙', en: 'Zhu Xian', slug: 'zhu-xian' },
  { zh: '仙逆', en: 'Xian Ni / Reverse Immortal', slug: 'renegade-immortal' },
  { zh: '遮天', en: 'Shrouding the Heavens', slug: 'shrouding-the-heavens' },
  { zh: '星辰变', en: 'Stellar Transformations', slug: 'stellar-transformations' },
  { zh: '百炼成仙', en: 'A Hundred Refinements to Immortality', slug: 'hundred-refinements' },
  { zh: '我欲封天', en: 'I Shall Seal the Heavens', slug: 'i-shall-seal-the-heavens' }
]

const culture = [
  { zh: '道教与修仙：从老子到金丹', en: 'Taoism and Cultivation', slug: 'taoism-and-xianxia' },
  { zh: '内丹术：修仙境界的哲学基础', en: 'Inner Alchemy', slug: 'inner-alchemy' },
  { zh: '五行八卦在修仙世界中的应用', en: 'Five Elements and Eight Trigrams', slug: 'five-elements' },
  { zh: '中国神话中的仙：从西王母到八仙', en: 'Immortals in Chinese Mythology', slug: 'chinese-xian' },
  { zh: '《周易参同契》与炼丹术', en: 'The Cantong Qi and Alchemy', slug: 'cantong-qi-and-alchemy' },
  { zh: '修真小说的文学流派演变', en: 'The Evolution of Xianxia Literature', slug: 'xianxia-literary-evolution' },
  { zh: '长生与不朽想象', en: 'Immortality', slug: 'immortality' }
]

const rmjiSections = [
  { zh: '专题总览', en: 'Overview', slug: '' },
  { zh: '功法神通', en: 'Techniques & Abilities', slug: 'techniques/' },
  { zh: '法宝灵兽', en: 'Artifacts & Companions', slug: 'artifacts/' },
  { zh: '丹药灵材', en: 'Elixirs & Materials', slug: 'elixirs/' },
  { zh: '宗门势力', en: 'Sects & Factions', slug: 'sects/' },
  { zh: '种族族群', en: 'Races & Peoples', slug: 'races/' },
  { zh: '界域地理', en: 'Realms & Regions', slug: 'regions/' },
  { zh: '法则大道', en: 'Laws & Dao', slug: 'laws/' },
  { zh: '人物角色', en: 'Characters', slug: 'characters/' },
  { zh: '剧情脉络', en: 'Timeline', slug: 'timeline/' },
  { zh: '章节核对台账', en: 'Chapter Check Ledger', slug: 'audit/' }
]

const rmjiFeatured = [
  { zh: '韩立', en: 'Han Li', slug: 'characters/han-li' },
  { zh: '南宫婉', en: 'Nangong Wan', slug: 'characters/nangong-wan' },
  { zh: '紫灵', en: 'Zi Ling', slug: 'characters/zi-ling' },
  { zh: '金童', en: 'Golden Child', slug: 'characters/golden-child' },
  { zh: '啼魂', en: 'Weeping Soul', slug: 'characters/weeping-soul-character' },
  { zh: '蟹道人', en: 'Crab Daoist', slug: 'characters/crab-daoist' },
  { zh: '蛟三', en: 'Jiao San', slug: 'characters/jiao-san' },
  { zh: '石穿空', en: 'Shi Chuankong', slug: 'characters/shi-chuankong' },
  { zh: '玄骨上人', en: 'Master Xuan Gu', slug: 'characters/xuan-gu' },
  { zh: '弥罗老祖', en: 'Mi Luo Ancestor', slug: 'characters/mi-luo-ancestor' },
  { zh: '奇摩子', en: 'Qi Mozi', slug: 'characters/qi-mozi' },
  { zh: '轮回殿主', en: 'Reincarnation Palace Master', slug: 'characters/reincarnation-palace-master' },
  { zh: '古或今', en: 'Gu Huojin', slug: 'characters/gu-huajin' },
  { zh: '墨大夫', en: 'Doctor Mo', slug: 'characters/doctor-mo' },
  { zh: '掌天瓶 / 小绿瓶', en: 'Heavenly Bottle / Green Bottle', slug: 'artifacts/zhangtian-bottle' },
  { zh: '青元剑诀', en: 'Azure Essence Sword Art', slug: 'techniques/qingyuan-sword-art' },
  { zh: '青竹蜂云剑', en: 'Bamboo Cloudswarm Swords', slug: 'artifacts/green-bamboo-cloudswarm-swords' },
  { zh: '筑基丹', en: 'Foundation Establishment Pill', slug: 'elixirs/foundation-establishment-pill' },
  { zh: '天庭', en: 'Heavenly Court', slug: 'sects/heavenly-court' },
  { zh: '轮回殿', en: 'Reincarnation Palace', slug: 'sects/reincarnation-palace' },
  { zh: '灰界', en: 'Gray Realm', slug: 'regions/gray-realm' },
  { zh: '时间法则', en: 'Law of Time', slug: 'laws/time-law' }
]

const toZh = (items: Array<{ zh: string, en: string, slug: string }>, base: string): SidebarItem[] =>
  items.map((item) => ({ text: `${item.zh} / ${item.en}`, link: `${base}${item.slug}` }))

const toEn = (items: Array<{ zh: string, en: string, slug: string }>, base: string): SidebarItem[] =>
  items.map((item) => ({ text: `${item.en} / ${item.zh}`, link: `${base}${item.slug}` }))

const zhGlossary = toZh(glossary, '/glossary/')
const enGlossary = toEn(glossary, '/en/glossary/')
const zhCategories = categories.map((item) => ({ text: `${item.zh} / ${item.en}`, link: `/categories/${item.slug}` }))
const enCategories = categories.map((item) => ({ text: `${item.en} / ${item.zh}`, link: `/en/categories/${item.slug}` }))
const zhRealms = toZh(realms, '/cultivation-system/')
const enRealms = toEn(realms, '/en/cultivation-system/')
const zhWorks = toZh(works, '/classic-works/')
const enWorks = toEn(works, '/en/classic-works/')
const zhCulture = toZh(culture, '/culture/')
const enCulture = toEn(culture, '/en/culture/')
const zhRmjiSections = toZh(rmjiSections, '/rmji/')
const enRmjiSections = toEn(rmjiSections, '/en/rmji/')
const zhRmjiFeatured = toZh(rmjiFeatured, '/rmji/')
const enRmjiFeatured = toEn(rmjiFeatured, '/en/rmji/')

function zhSidebar() {
  return {
    '/glossary/': [
      { text: '术语词典', items: [{ text: '总览', link: '/glossary/' }, ...zhGlossary] },
      { text: '分类浏览', collapsed: true, items: zhCategories }
    ],
    '/categories/': [
      { text: '分类体系', items: [{ text: '全部分类', link: '/categories/' }, ...zhCategories] },
      { text: '核心术语', collapsed: true, items: zhGlossary }
    ],
    '/cultivation-system/': [
      { text: '修炼体系', items: [{ text: '总览', link: '/cultivation-system/' }, ...zhRealms] },
      { text: '相关术语', collapsed: true, items: zhGlossary.slice(2, 7) }
    ],
    '/classic-works/': [
      { text: '经典作品', items: [{ text: '总览', link: '/classic-works/' }, ...zhWorks] }
    ],
    '/rmji/': [
      { text: '凡人修仙传专场', items: zhRmjiSections },
      { text: '推荐先看', collapsed: true, items: zhRmjiFeatured }
    ],
    '/culture/': [
      { text: '文化背景', items: [{ text: '总览', link: '/culture/' }, ...zhCulture] }
    ],
    '/': [
      { text: '开始阅读', items: [
        { text: '首页', link: '/' },
        { text: '术语词典', link: '/glossary/' },
        { text: '分类体系', link: '/categories/' },
        { text: '修炼体系', link: '/cultivation-system/' },
        { text: '凡人专场', link: '/rmji/' }
      ] },
      { text: '核心术语', collapsed: true, items: zhGlossary.slice(0, 10) },
      { text: '站点', items: [
        { text: '关于', link: '/about' },
        { text: '贡献', link: '/contribute' },
        { text: '部署', link: '/deploy' }
      ] }
    ]
  }
}

function enSidebar() {
  return {
    '/en/glossary/': [
      { text: 'Glossary', items: [{ text: 'Overview', link: '/en/glossary/' }, ...enGlossary] },
      { text: 'Categories', collapsed: true, items: enCategories }
    ],
    '/en/categories/': [
      { text: 'Categories', items: [{ text: 'All Categories', link: '/en/categories/' }, ...enCategories] },
      { text: 'Core Terms', collapsed: true, items: enGlossary }
    ],
    '/en/cultivation-system/': [
      { text: 'Cultivation System', items: [{ text: 'Overview', link: '/en/cultivation-system/' }, ...enRealms] },
      { text: 'Related Terms', collapsed: true, items: enGlossary.slice(2, 7) }
    ],
    '/en/classic-works/': [
      { text: 'Classic Works', items: [{ text: 'Overview', link: '/en/classic-works/' }, ...enWorks] }
    ],
    '/en/rmji/': [
      { text: 'RMJI Universe', items: enRmjiSections },
      { text: 'Start Here', collapsed: true, items: enRmjiFeatured }
    ],
    '/en/culture/': [
      { text: 'Cultural Background', items: [{ text: 'Overview', link: '/en/culture/' }, ...enCulture] }
    ],
    '/en/': [
      { text: 'Start Here', items: [
        { text: 'Home', link: '/en/' },
        { text: 'Glossary', link: '/en/glossary/' },
        { text: 'Categories', link: '/en/categories/' },
        { text: 'Cultivation System', link: '/en/cultivation-system/' },
        { text: 'RMJI Universe', link: '/en/rmji/' }
      ] },
      { text: 'Core Terms', collapsed: true, items: enGlossary.slice(0, 10) },
      { text: 'Site', items: [
        { text: 'About', link: '/en/about' },
        { text: 'Contribute', link: '/en/contribute' },
        { text: 'Deploy', link: '/en/deploy' }
      ] }
    ]
  }
}

export default defineConfig({
  lang: 'zh-CN',
  title: 'NoICU Cultivator',
  description: '《逍遥长生录》：面向全球读者的中英双语修仙文化百科。',
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: 'https://no996noicu.com'
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['meta', { name: 'theme-color', content: '#2d8c6f' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'NoICU Cultivator' }],
    ['meta', { property: 'og:title', content: 'NoICU Cultivator' }],
    ['meta', { property: 'og:description', content: 'The Xianxia Encyclopedia for the Unfettered Soul.' }],
    ['meta', { property: 'og:image', content: 'https://no996noicu.com/social-card.svg' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'keywords', content: 'NoICU Cultivator, 逍遥长生录, Xianxia, Cultivation, Chinese Fantasy, Immortal, Martial Arts, Qi, Wuxia, 修仙, 修真' }]
  ],
  themeConfig: {
    logo: '/favicon.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: '术语词典', link: '/glossary/' },
      { text: '修炼体系', link: '/cultivation-system/' },
      { text: '经典作品', link: '/classic-works/' },
      { text: '凡人专场', link: '/rmji/' },
      { text: '文化背景', link: '/culture/' },
      { text: '关于', link: '/about' },
      { text: '贡献', link: '/contribute' },
      { text: 'English', link: '/en/' }
    ],
    sidebar: zhSidebar(),
    search: {
      provider: 'local',
      options: {
        detailedView: true,
        translations: {
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
      }
    },
    outline: {
      label: '本页目录',
      level: [2, 3]
    },
    lastUpdated: {
      text: '最后更新'
    },
    langMenuLabel: '切换语言',
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '外观',
    footer: {
      message: 'No 996, No ICU, Just Cultivation. 「不加班，不 ICU，只修仙」',
      copyright: '© 1970 NoICU Cultivator. 与任何修仙宗门无关。'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/liuduanduan/my-static-site' }
    ]
  },
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'NoICU Cultivator',
      description: '《逍遥长生录》：面向全球读者的中英双语修仙文化百科。'
    },
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'NoICU Cultivator',
      description: 'The Xianxia Encyclopedia for the Unfettered Soul.',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Glossary', link: '/en/glossary/' },
          { text: 'Cultivation System', link: '/en/cultivation-system/' },
          { text: 'Classic Works', link: '/en/classic-works/' },
          { text: 'RMJI', link: '/en/rmji/' },
          { text: 'Culture', link: '/en/culture/' },
          { text: 'About', link: '/en/about' },
          { text: 'Contribute', link: '/en/contribute' },
          { text: '中文', link: '/' }
        ],
        sidebar: enSidebar(),
        outline: {
          label: 'On This Page',
          level: [2, 3]
        },
        lastUpdated: {
          text: 'Last updated'
        },
        langMenuLabel: 'Change language',
        returnToTopLabel: 'Return to top',
        sidebarMenuLabel: 'Menu',
        darkModeSwitchLabel: 'Appearance',
        footer: {
          message: 'No 996, No ICU, Just Cultivation.',
          copyright: '© 1970 NoICU Cultivator. Not affiliated with any cultivation sect.'
        }
      }
    }
  }
})
