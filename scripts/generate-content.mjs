import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = dirname(fileURLToPath(import.meta.url)).replace(/\\scripts$/, '').replace(/\/scripts$/, '')
const docsRoot = join(repoRoot, 'docs')

function writeDoc(relativePath, content) {
  const filePath = join(docsRoot, relativePath)
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, `${content.trim()}\n`, 'utf8')
}

function yamlValue(value) {
  if (Array.isArray(value)) return `[${value.map((item) => JSON.stringify(item)).join(', ')}]`
  return JSON.stringify(value)
}

function frontmatter(data) {
  return `---\n${Object.entries(data).map(([key, value]) => `${key}: ${yamlValue(value)}`).join('\n')}\n---\n\n`
}

const categories = [
  { key: 'realms', slug: 'cultivation-realms', icon: '🧘', zh: '修炼境界', en: 'Cultivation Realms', count: '14', descZh: '修仙等级体系，从炼气到道祖。', descEn: 'Cultivation rank systems from Qi Refining to Dao Ancestor.', examples: ['炼气期', '筑基期', '元婴期', '道祖境'] },
  { key: 'techniques', slug: 'techniques-and-arts', icon: '⚔️', zh: '功法武学', en: 'Techniques & Arts', count: '8+', descZh: '修炼功法、神通、身法与战斗技艺。', descEn: 'Cultivation methods, divine abilities, movement arts, and combat skills.', examples: ['功法', '仙术', '御剑术', '炼体术'] },
  { key: 'elixirs', slug: 'elixirs-and-pills', icon: '🧪', zh: '灵药丹方', en: 'Elixirs & Pills', count: '6+', descZh: '丹药、灵草与辅助突破的炼丹体系。', descEn: 'Pills, herbs, and alchemical resources for cultivation.', examples: ['筑基丹', '九转金丹', '灵芝仙草'] },
  { key: 'weapons', slug: 'divine-weapons', icon: '🗡️', zh: '神兵利器', en: 'Divine Weapons', count: '6+', descZh: '飞剑、法宝、灵器与本命法器。', descEn: 'Flying swords, artifacts, spiritual tools, and bonded treasures.', examples: ['法宝', '飞剑', '乾坤鼎'] },
  { key: 'sects', slug: 'sects-and-clans', icon: '🏯', zh: '修仙门派', en: 'Sects & Clans', count: '8+', descZh: '宗门、家族、传承与修仙组织结构。', descEn: 'Sects, clans, inheritance systems, and cultivation organizations.', examples: ['宗门', '青云门', '修真家族'] },
  { key: 'treasures', slug: 'natural-treasures', icon: '💎', zh: '天材地宝', en: 'Natural Treasures', count: '5+', descZh: '灵石、矿脉、灵草和天地灵物。', descEn: 'Spirit stones, veins, herbs, and rare natural resources.', examples: ['灵石', '龙脉', '万年灵药'] },
  { key: 'formations', slug: 'formations-and-talismans', icon: '✨', zh: '阵法符箓', en: 'Formations & Talismans', count: '5+', descZh: '阵法、符箓、禁制与空间布置。', descEn: 'Formations, talismans, restrictions, and spatial layouts.', examples: ['五行阵', '聚灵阵', '神行符'] },
  { key: 'beasts', slug: 'beasts-and-demons', icon: '🐉', zh: '妖魔鬼怪', en: 'Beasts & Demons', count: '6+', descZh: '妖兽、魔物、灵兽与神话异类。', descEn: 'Demonic beasts, monsters, spirit beasts, and mythic beings.', examples: ['九尾狐', '蛟龙', '心魔'] },
  { key: 'regions', slug: 'realms-and-regions', icon: '🌍', zh: '修仙地域', en: 'Realms & Regions', count: '5+', descZh: '人界、灵界、仙界以及秘境空间。', descEn: 'Mortal worlds, spirit worlds, immortal realms, and hidden domains.', examples: ['人界', '灵界', '仙界', '秘境'] },
  { key: 'roles', slug: 'cultivation-roles', icon: '👤', zh: '修仙职业', en: 'Cultivation Roles', count: '6+', descZh: '散修、丹师、阵师、魔修等身份。', descEn: 'Rogue cultivators, alchemists, formation masters, and path identities.', examples: ['散修', '魔修', '丹师', '阵师'] },
  { key: 'core', slug: 'core-terms', icon: '📖', zh: '核心术语', en: 'Core Terms', count: '20+', descZh: '理解修仙文本所需的基础概念。', descEn: 'Foundational concepts required to understand cultivation fiction.', examples: ['修仙', '灵气', '金丹', '飞升'] }
]

const categoryByKey = new Map(categories.map((item) => [item.key, item]))

const terms = [
  { slug: 'cultivation', zh: '修仙', en: 'Cultivation', pinyin: 'Xiūxiān', category: 'core', tags: ['practice', 'immortality'], definitionZh: '通过修炼身心、吸纳天地灵气并追求长生成仙的过程。', definitionEn: 'The practice of refining body, mind, and spiritual power in pursuit of immortality.', roleZh: '修仙是整个题材的总框架，连接境界、功法、资源、宗门和飞升等概念。', roleEn: 'Cultivation is the umbrella idea that connects realms, techniques, resources, sects, and ascension.', related: ['qi', 'xiuzhen', 'ascension'] },
  { slug: 'xiuzhen', zh: '修真', en: 'Xiuzhen', pinyin: 'Xiūzhēn', category: 'core', tags: ['dao', 'truth'], definitionZh: '学道修行、求得真我、去伪存真的修持方式。', definitionEn: 'A Dao-oriented practice of cultivating truth and returning to the genuine self.', roleZh: '修真常比修仙更强调心性、悟道和内在真实，是修仙叙事的哲学底色。', roleEn: 'Xiuzhen often emphasizes temperament, Dao comprehension, and inner truth.', related: ['cultivation', 'inner-alchemy', 'qi'] },
  { slug: 'qi', zh: '灵气', en: 'Qi / Spiritual Energy', pinyin: 'Língqì', category: 'core', tags: ['energy', 'foundation'], definitionZh: '天地万物中的生命能量，是修士吸收、炼化和突破的基础。', definitionEn: 'The fundamental spiritual energy that cultivators absorb, refine, and use for breakthroughs.', roleZh: '灵气可以被功法引入丹田，逐步由气态、液态、固态转化为更高层次的力量。', roleEn: 'Qi is drawn into the dantian through techniques and refined into higher forms of power.', related: ['golden-core', 'nascent-soul', 'cultivation'] },
  { slug: 'golden-core', zh: '金丹', en: 'Golden Core', pinyin: 'Jīndān', category: 'core', tags: ['realm', 'core'], definitionZh: '结丹期凝结的固态能量核心，也是修仙道路的重要分水岭。', definitionEn: 'A solid inner core formed during Core Formation and a major cultivation milestone.', roleZh: '金丹象征精、气、神的初步凝聚，常意味着修士开始真正脱离凡俗。', roleEn: 'The Golden Core symbolizes a stable condensation of essence, Qi, and spirit.', related: ['qi', 'nascent-soul', 'inner-alchemy'] },
  { slug: 'nascent-soul', zh: '元婴', en: 'Nascent Soul', pinyin: 'Yuányīng', category: 'core', tags: ['realm', 'spirit'], definitionZh: '金丹所化的元神形态，常被描写为可离体遨游的灵性自我。', definitionEn: 'A spiritual infant or second self transformed from the Golden Core.', roleZh: '元婴让修士获得更强的神识和保命能力，也使夺舍、分身等设定成立。', roleEn: 'The Nascent Soul supports stronger divine sense, survival, possession, and avatar motifs.', related: ['golden-core', 'qi', 'ascension'] },
  { slug: 'ascension', zh: '飞升', en: 'Ascension', pinyin: 'Fēishēng', category: 'core', tags: ['immortal', 'transition'], definitionZh: '修炼大成后进入更高层世界或仙界的过程。', definitionEn: 'The passage from a lower world into a higher realm or immortal world.', roleZh: '飞升通常是凡俗修炼线的终点，也是新世界、更高冲突和仙界等级的开端。', roleEn: 'Ascension often closes the mortal arc and opens higher-world conflicts.', related: ['tribulation-transcendence', 'immortal', 'heavenly-tribulation'] },
  { slug: 'heavenly-tribulation', zh: '天劫', en: 'Tribulation', pinyin: 'Tiānjié', category: 'core', tags: ['trial', 'breakthrough'], definitionZh: '修炼者突破重大境界时必须面对的天道考验。', definitionEn: 'A heavenly trial faced during major cultivation breakthroughs.', roleZh: '天劫把修炼从资源积累转化为风险叙事，考验肉身、心境和因果。', roleEn: 'Tribulation turns advancement into a trial of body, mind, karma, and fate.', related: ['tribulation-transcendence', 'ascension', 'qi-deviation'] },
  { slug: 'rogue-cultivator', zh: '散修', en: 'Rogue Cultivator', pinyin: 'Sǎnxiū', category: 'roles', tags: ['role', 'independent'], definitionZh: '无门无派或缺乏强大背景、主要依靠个人机缘修行的修士。', definitionEn: 'An independent cultivator without strong sect backing.', roleZh: '散修线强调资源匮乏、生存谨慎和个人机缘，适合表现底层修士视角。', roleEn: 'Rogue-cultivator stories emphasize scarcity, caution, and hard-earned opportunity.', related: ['sect', 'cultivation', 'spirit-stone'] },
  { slug: 'sect', zh: '宗门', en: 'Sect', pinyin: 'Zōngmén', category: 'sects', tags: ['organization', 'inheritance'], definitionZh: '修仙者传承功法、分配资源、培养弟子的门派组织。', definitionEn: 'A cultivation organization that transmits techniques, allocates resources, and trains disciples.', roleZh: '宗门提供师承、任务、等级制度和冲突舞台，是修仙社会的重要单位。', roleEn: 'Sects provide mentorship, missions, hierarchy, and a social stage for conflict.', related: ['cultivation-technique', 'rogue-cultivator', 'spirit-stone'] },
  { slug: 'artifact', zh: '法宝', en: 'Artifact / Dharma Treasure', pinyin: 'Fǎbǎo', category: 'weapons', tags: ['weapon', 'treasure'], definitionZh: '修仙者炼制或驱使的法器、灵宝和战斗工具。', definitionEn: 'A refined magical treasure, weapon, or tool used by cultivators.', roleZh: '法宝既是战力来源，也是机缘、传承和身份象征。', roleEn: 'Artifacts express power, inheritance, opportunity, and personal style.', related: ['flying-sword', 'cultivation-technique', 'spirit-stone'] },
  { slug: 'spirit-stone', zh: '灵石', en: 'Spirit Stone', pinyin: 'Língshí', category: 'treasures', tags: ['resource', 'currency'], definitionZh: '蕴含灵气的矿石，常作为修仙界通用货币和能量来源。', definitionEn: 'A Qi-bearing stone used as both currency and energy resource.', roleZh: '灵石让修仙世界具有经济系统，连接交易、阵法、修炼和宗门供给。', roleEn: 'Spirit stones give cultivation worlds an economy for trade, formations, and practice.', related: ['qi', 'sect', 'artifact'] },
  { slug: 'cultivation-technique', zh: '功法', en: 'Cultivation Technique', pinyin: 'Gōngfǎ', category: 'techniques', tags: ['method', 'inheritance'], definitionZh: '引导修士吸纳、炼化、运转力量的具体修炼方法。', definitionEn: 'A method that guides how cultivators absorb, refine, and circulate power.', roleZh: '功法决定修炼速度、属性倾向、突破路径和战斗风格。', roleEn: 'Techniques shape speed, attributes, breakthroughs, and combat style.', related: ['qi', 'sect', 'immortal-arts'] },
  { slug: 'demonic-cultivator', zh: '魔修', en: 'Demonic Cultivator', pinyin: 'Móxiū', category: 'roles', tags: ['path', 'conflict'], definitionZh: '修魔道或采用禁忌功法、极端资源路径的修士。', definitionEn: 'A cultivator who follows demonic methods or taboo paths.', roleZh: '魔修常承担价值冲突、资源争夺和正邪边界的叙事功能。', roleEn: 'Demonic cultivators carry conflict around morality, resources, and forbidden power.', related: ['righteous-cultivator', 'qi-deviation', 'cultivation-technique'] },
  { slug: 'righteous-cultivator', zh: '正道', en: 'Righteous Cultivator', pinyin: 'Zhèngdào', category: 'roles', tags: ['path', 'orthodox'], definitionZh: '遵循正统秩序、宗门伦理或主流修炼体系的修士与阵营。', definitionEn: 'A cultivator or faction aligned with orthodox cultivation order.', roleZh: '正道并不总等于善，它经常与规则、名望、宗门利益和秩序维护相连。', roleEn: 'Righteous factions are not always purely good; they often represent order and reputation.', related: ['demonic-cultivator', 'sect', 'cultivation'] },
  { slug: 'immortal', zh: '仙人', en: 'Immortal', pinyin: 'Xiānrén', category: 'realms', tags: ['immortality', 'myth'], definitionZh: '修炼有成、脱离凡俗寿命限制并具备超凡能力的人。', definitionEn: 'A transcendent being who has escaped ordinary mortality and gained supernatural power.', roleZh: '仙人是修仙目标的具象化，也承接中国神话和道教想象。', roleEn: 'The immortal embodies the goal of cultivation and connects fiction with mythic imagination.', related: ['ascension', 'true-immortal', 'inner-alchemy'] },
  { slug: 'reincarnation', zh: '轮回', en: 'Reincarnation', pinyin: 'Lúnhuí', category: 'core', tags: ['cycle', 'rebirth'], definitionZh: '生死循环和转世重生的观念。', definitionEn: 'The cycle of death, rebirth, and returning lives.', roleZh: '轮回为前世因果、重生、转世身和宿命纠葛提供设定基础。', roleEn: 'Reincarnation supports past-life karma, rebirth, destined ties, and identity mysteries.', related: ['immortal', 'ascension', 'xiuzhen'] },
  { slug: 'qi-deviation', zh: '走火入魔', en: 'Qi Deviation', pinyin: 'Zǒuhuǒ Rùmó', category: 'core', tags: ['risk', 'failure'], definitionZh: '修炼出偏差、心神失守或真元暴走造成的危险状态。', definitionEn: 'A dangerous failure in cultivation control, often involving unstable Qi and mind.', roleZh: '走火入魔让修炼具有代价，提醒读者心境与方法同样重要。', roleEn: 'Qi deviation gives cultivation a cost and makes mental stability matter.', related: ['qi', 'heavenly-tribulation', 'inner-alchemy'] },
  { slug: 'immortal-arts', zh: '仙术', en: 'Immortal Arts', pinyin: 'Xiānshù', category: 'techniques', tags: ['ability', 'magic'], definitionZh: '高阶修士或仙人施展的神通术法。', definitionEn: 'High-level supernatural arts used by advanced cultivators or immortals.', roleZh: '仙术常表现为空间、变化、雷法、御物和法则操控等能力。', roleEn: 'Immortal arts often involve space, transformation, lightning, object control, and laws.', related: ['cultivation-technique', 'artifact', 'immortal'] },
  { slug: 'inner-alchemy', zh: '内丹', en: 'Inner Alchemy', pinyin: 'Nèidān', category: 'core', tags: ['taoism', 'alchemy'], definitionZh: '道教修炼中以内在身心为炉鼎、炼精化气的理论体系。', definitionEn: 'A Taoist framework that treats the body and mind as the furnace for inner refinement.', roleZh: '内丹术为金丹、元婴、炼气化神等修仙语汇提供文化根基。', roleEn: 'Inner alchemy supplies cultural roots for Golden Core, Nascent Soul, and refinement language.', related: ['golden-core', 'xiuzhen', 'qi'] },
  { slug: 'tribulation-transcendence', zh: '渡劫', en: 'Tribulation Transcendence', pinyin: 'Dùjié', category: 'realms', tags: ['breakthrough', 'trial'], definitionZh: '度过天劫、跨越重大境界或飞升门槛的过程。', definitionEn: 'The process of surviving heavenly tribulation and crossing a major threshold.', roleZh: '渡劫通常集中展示修士积累、心性、因果和外部护道力量。', roleEn: 'Tribulation transcendence tests accumulated power, temperament, karma, and protection.', related: ['heavenly-tribulation', 'ascension', 'qi'] },
  { slug: 'flying-sword', zh: '飞剑', en: 'Flying Sword', pinyin: 'Fēijiàn', category: 'weapons', tags: ['weapon', 'movement'], definitionZh: '可御使飞行、攻击或代步的剑类法器。', definitionEn: 'A sword artifact used for flight, attack, or travel.', roleZh: '飞剑是仙侠视觉符号之一，连接御剑飞行、剑修和本命法宝。', roleEn: 'Flying swords are iconic xianxia imagery, linking travel, sword cultivation, and artifacts.', related: ['artifact', 'immortal-arts', 'cultivation-technique'] },
  { slug: 'foundation-establishment-pill', zh: '筑基丹', en: 'Foundation Establishment Pill', pinyin: 'Zhùjī Dān', category: 'elixirs', tags: ['pill', 'breakthrough'], definitionZh: '辅助炼气修士突破筑基期的常见丹药设定。', definitionEn: 'A common pill used to help Qi Refining cultivators reach Foundation Establishment.', roleZh: '筑基丹把突破与资源竞争绑定，常引发宗门任务、拍卖和争夺。', roleEn: 'The pill ties breakthroughs to resource competition, auctions, and sect missions.', related: ['qi', 'cultivation-technique', 'spirit-stone'] }
]

const termBySlug = new Map(terms.map((item) => [item.slug, item]))
const aliases = [{ slug: 'tribulation', target: 'heavenly-tribulation' }]

function termLink(slug, locale) {
  const term = termBySlug.get(slug)
  if (!term) return ''
  const prefix = locale === 'en' ? '/en' : ''
  return `- [${term.zh} ${term.en}](${prefix}/glossary/${term.slug})`
}

function termPage(term, locale) {
  const isEn = locale === 'en'
  const category = categoryByKey.get(term.category)
  const prefix = isEn ? '/en' : ''
  const title = isEn ? term.en : term.zh
  const related = term.related.map((slug) => termLink(slug, locale)).filter(Boolean).join('\n')
  const body = isEn
    ? `# ${term.en} (${term.zh}, ${term.pinyin})

<div class="entry-layout">
  <main class="entry-main">

## Summary

**English:** ${term.definitionEn}

**中文：** ${term.definitionZh}

## Definition

**English:** ${term.en} is a recurring xianxia and cultivation concept. ${term.definitionEn} The exact rules change from novel to novel, but the term usually helps explain progression, conflict, resources, or cultural imagination.

**中文：** ${term.zh}（${term.pinyin}）是修仙叙事中的常见概念。${term.definitionZh}不同作品会有各自设定，但它通常用于解释境界进阶、资源分配、修炼风险或文化想象。

## Role in Cultivation

**English:** ${term.roleEn}

**中文：** ${term.roleZh}

## In Classic Works

**English:** In works such as *A Record of a Mortal's Journey to Immortality*, *Stellar Travel*, and *Xian Ni*, this concept is usually embedded in a larger system of realms, techniques, sects, and resources.

**中文：** 在《凡人修仙传》《飘邈之旅》《仙逆》等作品中，这一概念通常与境界、功法、宗门和资源体系共同出现，帮助读者理解角色成长逻辑。

## Related Concepts

${related}

## References

- Baidu Baike entries for 修仙 and 修真
- Taoist inner-alchemy background materials
- Representative cultivation-fiction settings

</main>
<aside class="entry-aside">
    <div class="info-card">
      <h2>Basic Info</h2>
      <dl>
        <dt>Chinese Name</dt><dd>${term.zh}</dd>
        <dt>Pinyin</dt><dd>${term.pinyin}</dd>
        <dt>English Name</dt><dd>${term.en}</dd>
        <dt>Category</dt><dd>${category.en} / ${category.zh}</dd>
      </dl>
    </div>
    <div class="info-card">
      <h2>Share</h2>
      <p><a href="https://twitter.com/intent/tweet" target="_blank" rel="noopener">Twitter</a> · <a href="https://www.facebook.com/sharer/sharer.php" target="_blank" rel="noopener">Facebook</a> · <a href="https://www.reddit.com/submit" target="_blank" rel="noopener">Reddit</a> · <a href="https://service.weibo.com/share/share.php" target="_blank" rel="noopener">微博</a></p>
    </div>
</aside>
</div>`
    : `# ${term.zh} · ${term.en} (${term.pinyin})

<div class="entry-layout">
  <main class="entry-main">

## 摘要 · Summary

**中文：** ${term.definitionZh}

**English:** ${term.definitionEn}

## 定义与概述 · Definition

**中文：** ${term.zh}（${term.pinyin}）是修仙叙事中的常见概念。${term.definitionZh}不同作品会有各自设定，但它通常用于解释境界进阶、资源分配、修炼风险或文化想象。

**English:** ${term.en} is a recurring xianxia and cultivation concept. ${term.definitionEn} The exact rules change from novel to novel, but the term usually helps explain progression, conflict, resources, or cultural imagination.

## 在修炼中的作用 · Role in Cultivation

**中文：** ${term.roleZh}

**English:** ${term.roleEn}

## 在经典作品中的体现 · In Classic Works

**中文：** 在《凡人修仙传》《飘邈之旅》《仙逆》等作品中，这一概念通常与境界、功法、宗门和资源体系共同出现，帮助读者理解角色成长逻辑。

**English:** In works such as *A Record of a Mortal's Journey to Immortality*, *Stellar Travel*, and *Xian Ni*, this concept is usually embedded in a larger system of realms, techniques, sects, and resources.

## 相关概念 · Related Concepts

${related}

## 参考文献 · References

- 百度百科 · 修仙词条
- 百度百科 · 修真词条
- 道教内丹术相关资料
- 代表性修真小说设定

</main>
<aside class="entry-aside">
    <div class="info-card">
      <h2>基本信息 · Basic Info</h2>
      <dl>
        <dt>中文名称</dt><dd>${term.zh}</dd>
        <dt>拼音</dt><dd>${term.pinyin}</dd>
        <dt>英文名称</dt><dd>${term.en}</dd>
        <dt>分类</dt><dd>${category.zh} / ${category.en}</dd>
      </dl>
    </div>
    <div class="info-card">
      <h2>分享 · Share</h2>
      <p><a href="https://twitter.com/intent/tweet" target="_blank" rel="noopener">Twitter</a> · <a href="https://www.facebook.com/sharer/sharer.php" target="_blank" rel="noopener">Facebook</a> · <a href="https://www.reddit.com/submit" target="_blank" rel="noopener">Reddit</a> · <a href="https://service.weibo.com/share/share.php" target="_blank" rel="noopener">微博</a></p>
    </div>
</aside>
</div>`

  return frontmatter({
    title,
    zh_name: term.zh,
    en_name: term.en,
    pinyin: term.pinyin,
    category: term.category,
    tags: term.tags,
    description: term.definitionEn,
    description_zh: term.definitionZh
  }) + body
}

for (const term of terms) {
  writeDoc(`glossary/${term.slug}.md`, termPage(term, 'zh'))
  writeDoc(`en/glossary/${term.slug}.md`, termPage(term, 'en'))
}

for (const alias of aliases) {
  const target = termBySlug.get(alias.target)
  writeDoc(`glossary/${alias.slug}.md`, termPage({ ...target, slug: alias.slug }, 'zh'))
  writeDoc(`en/glossary/${alias.slug}.md`, termPage({ ...target, slug: alias.slug }, 'en'))
}

const coreTerms = terms.filter((term) => !['flying-sword', 'foundation-establishment-pill'].includes(term.slug)).slice(0, 20)

function glossaryIndex(locale) {
  const isEn = locale === 'en'
  const prefix = isEn ? 'en/' : ''
  const body = isEn
    ? `# Glossary · 20 Starter Terms

Browse core xianxia and cultivation terms by search, alphabet, and category. Each entry includes Chinese name, pinyin, English translation, bilingual definition, related concepts, and source notes.

<GlossaryExplorer locale="en" />`
    : `# 术语词典 · Glossary

共收录 20 个核心词条，并附带若干扩展示例。每个词条都包含中文名称、英文名称、拼音、分类、中英双语摘要、正文、相关词条和参考来源。

<GlossaryExplorer locale="zh" />`
  writeDoc(`${prefix}glossary/index.md`, frontmatter({
    title: isEn ? 'Glossary' : '术语词典',
    description: isEn ? 'Browse 20 starter xianxia and cultivation terms with Chinese, pinyin, categories, and bilingual definitions.' : '浏览20个修仙核心词条，包含中文、英文、拼音、分类和双语定义。'
  }) + body)
}

glossaryIndex('zh')
glossaryIndex('en')

const realms = [
  { slug: 'qi-refining', zh: '炼气期', en: 'Qi Refining', pinyin: 'Liànqì Qī', levelZh: '下境界', levelEn: 'Lower Realm', lifespan: '100-120岁', lifespanEn: '100-120 years', featureZh: '灵气为气态，共有多个小境界，重点在感应与引气入体。', featureEn: 'Qi remains gaseous; the focus is sensing Qi and drawing it into the body.', breakthroughZh: '积累稳定灵气，打通经脉，建立可持续运转的基础周天。', breakthroughEn: 'Accumulate stable Qi, open meridians, and build a sustainable circulation.' },
  { slug: 'foundation-building', zh: '筑基期', en: 'Foundation Establishment', pinyin: 'Zhùjī Qī', levelZh: '下境界', levelEn: 'Lower Realm', lifespan: '约200岁', lifespanEn: 'about 200 years', featureZh: '灵气由气态转为液态，修士真正踏入修仙大门。', featureEn: 'Qi condenses from gas into liquid and the cultivator builds a stable foundation.', breakthroughZh: '炼气圆满，心境稳定，并常需筑基丹等资源辅助。', breakthroughEn: 'Reach peak Qi Refining, stabilize the mind, and often use breakthrough resources.' },
  { slug: 'core-formation', zh: '结丹期 / 金丹期', en: 'Core Formation / Golden Core', pinyin: 'Jiédān Qī / Jīndān Qī', levelZh: '下境界', levelEn: 'Lower Realm', lifespan: '500-800岁', lifespanEn: '500-800 years', featureZh: '液态灵力凝为固态金丹，是修仙道路的重要分水岭。', featureEn: 'Liquid spiritual power crystallizes into a solid Golden Core, a major milestone.', breakthroughZh: '丹田灵力压缩到极致，辅以功法、丹药、心性和机缘。', breakthroughEn: 'Compress dantian power to the limit with technique, pills, temperament, and opportunity.' },
  { slug: 'nascent-soul', zh: '元婴期', en: 'Nascent Soul', pinyin: 'Yuányīng Qī', levelZh: '下境界', levelEn: 'Lower Realm', lifespan: '1000-2000岁', lifespanEn: '1000-2000 years', featureZh: '金丹化为元婴，神识大增，可形成更强的保命能力。', featureEn: 'The Golden Core transforms into a Nascent Soul, greatly strengthening divine sense.', breakthroughZh: '碎丹成婴，需承受神魂蜕变和心魔考验。', breakthroughEn: 'Break the core into a soul-form while enduring spiritual transformation and inner demons.' },
  { slug: 'spirit-transformation', zh: '化神期', en: 'Spirit Severing / Transformation', pinyin: 'Huàshén Qī', levelZh: '下境界', levelEn: 'Lower Realm', lifespan: '数千岁', lifespanEn: 'several thousand years', featureZh: '元婴化神，开始触及更高天地法则。', featureEn: 'The Nascent Soul transforms into spirit and begins touching higher laws.', breakthroughZh: '完成神魂升华，理解自身大道方向。', breakthroughEn: 'Refine the soul and clarify the direction of one own Dao.' },
  { slug: 'void-refining', zh: '炼虚期', en: 'Void Refinement', pinyin: 'Liànxū Qī', levelZh: '中境界', levelEn: 'Middle Realm', lifespan: '上万年', lifespanEn: 'over ten thousand years', featureZh: '神魂与虚空、天地之力产生更深层联系。', featureEn: 'Spirit and body develop a deeper relationship with void and world power.', breakthroughZh: '将化神积累融入天地感悟，稳定承载虚空之力。', breakthroughEn: 'Integrate spirit-transformation gains with world comprehension and void power.' },
  { slug: 'body-integration', zh: '合体期', en: 'Unity / Integration', pinyin: 'Hétǐ Qī', levelZh: '中境界', levelEn: 'Middle Realm', lifespan: '数万年', lifespanEn: 'tens of thousands of years', featureZh: '元神、法力与肉身高度融合，战力和生存力显著提升。', featureEn: 'Spirit, power, and body integrate, improving combat and survival dramatically.', breakthroughZh: '调和神魂与肉身，避免力量互相排斥。', breakthroughEn: 'Harmonize soul and body so that higher power does not reject the vessel.' },
  { slug: 'great-ascension', zh: '大乘期', en: 'Mahayana / Great Vehicle', pinyin: 'Dàchéng Qī', levelZh: '中境界', levelEn: 'Middle Realm', lifespan: '十万年以上', lifespanEn: 'over one hundred thousand years', featureZh: '肉身与法力重铸，接近凡界修炼顶端。', featureEn: 'Body and power are remade, approaching the peak of mortal-world cultivation.', breakthroughZh: '完成大道雏形，准备面对飞升前的终极考验。', breakthroughEn: 'Complete a proto-Dao and prepare for the final trial before ascension.' },
  { slug: 'tribulation-crossing', zh: '渡劫期', en: 'Tribulation Transcendence', pinyin: 'Dùjié Qī', levelZh: '中境界', levelEn: 'Middle Realm', lifespan: '十万年以上', lifespanEn: 'over one hundred thousand years', featureZh: '度过天劫即可飞升仙界，是凡界通往仙界的门槛。', featureEn: 'Surviving heavenly tribulation opens the path toward the immortal realm.', breakthroughZh: '积累圆满、因果清明，并在天劫中守住道心。', breakthroughEn: 'Reach completion, settle karma, and preserve Dao heart under tribulation.' },
  { slug: 'true-immortal', zh: '真仙境', en: 'True Immortal', pinyin: 'Zhēnxiān Jìng', levelZh: '上境界', levelEn: 'Upper Realm', lifespan: '长生', lifespanEn: 'immortal longevity', featureZh: '飞升后的初始仙境，褪去凡胎，掌握仙灵之力。', featureEn: 'The initial immortal stage after ascension, marked by immortal power.', breakthroughZh: '完成飞升洗礼，适应仙界法则与仙灵气。', breakthroughEn: 'Complete ascension baptism and adapt to immortal laws and energy.' },
  { slug: 'golden-immortal', zh: '金仙境', en: 'Golden Immortal', pinyin: 'Jīnxiān Jìng', levelZh: '上境界', levelEn: 'Upper Realm', lifespan: '长生', lifespanEn: 'immortal longevity', featureZh: '金仙不朽，力量和法则理解进一步稳固。', featureEn: 'Golden Immortals embody deeper stability in power and law comprehension.', breakthroughZh: '凝练仙躯与法则根基，使自身道果更加稳固。', breakthroughEn: 'Refine immortal body and law foundation into a stable Dao fruit.' },
  { slug: 'taiyi', zh: '太乙境 / 玉仙境', en: 'Taiyi / Jade Immortal', pinyin: 'Tàiyǐ Jìng / Yùxiān Jìng', levelZh: '上境界', levelEn: 'Upper Realm', lifespan: '长生', lifespanEn: 'immortal longevity', featureZh: '仙界高阶境界，开始触及更完整的法则体系。', featureEn: 'A higher immortal stage that approaches broader systems of law.', breakthroughZh: '把个人法则扩展为更完整的道域雏形。', breakthroughEn: 'Expand personal law into an embryonic Dao domain.' },
  { slug: 'da-luo', zh: '大罗境', en: 'Da Luo / Great Luo', pinyin: 'Dàluó Jìng', levelZh: '上境界', levelEn: 'Upper Realm', lifespan: '长生', lifespanEn: 'immortal longevity', featureZh: '大罗金仙象征不受普通时空束缚的高位仙境。', featureEn: 'Da Luo represents a lofty immortal state less bound by ordinary space-time.', breakthroughZh: '跨越普通仙道限制，形成稳定而宏大的道果。', breakthroughEn: 'Move beyond ordinary immortal limits and form a vast, stable Dao fruit.' },
  { slug: 'dao-ancestor', zh: '道祖境', en: 'Dao Ancestor', pinyin: 'Dàozǔ Jìng', levelZh: '上境界', levelEn: 'Upper Realm', lifespan: '永恒', lifespanEn: 'eternal', featureZh: '仙界最高境，万道之祖，常被设定为大道源流级存在。', featureEn: 'The highest immortal stage, an origin-level existence for countless Daos.', breakthroughZh: '证得自身大道极致，并与世界法则产生源流级联系。', breakthroughEn: 'Realize the ultimate personal Dao and connect with world law at an origin level.' }
]

function realmLink(realm, locale) {
  const prefix = locale === 'en' ? '/en' : ''
  return `<a class="realm-step" href="${prefix}/cultivation-system/${realm.slug}"><span class="mark">${realms.indexOf(realm) + 1}</span><span><h3>${locale === 'en' ? `${realm.en} / ${realm.zh}` : `${realm.zh} / ${realm.en}`}</h3><p>${locale === 'en' ? `${realm.levelEn} · ${realm.lifespanEn} · ${realm.featureEn}` : `${realm.levelZh} · ${realm.lifespan} · ${realm.featureZh}`}</p></span></a>`
}

function cultivationIndex(locale) {
  const isEn = locale === 'en'
  const prefix = isEn ? 'en/' : ''
  const timeline = realms.map((realm) => realmLink(realm, locale)).join('\n')
  const body = isEn
    ? `# Cultivation System

This overview organizes a fourteen-realm ladder from Qi Refining to Dao Ancestor. It is a practical reference for readers, translators, writers, and game designers.

## Realm Timeline

<div class="realm-timeline">
${timeline}
</div>

## Three Stages

<div class="stage-grid">
  <div class="wiki-card"><h3>Lower Realm</h3><p>Qi Refining, Foundation Establishment, Core Formation, Nascent Soul, Spirit Severing.</p></div>
  <div class="wiki-card"><h3>Middle Realm</h3><p>Void Refinement, Unity, Mahayana, Tribulation Transcendence.</p></div>
  <div class="wiki-card"><h3>Upper Realm</h3><p>True Immortal, Golden Immortal, Taiyi, Da Luo, Dao Ancestor.</p></div>
</div>`
    : `# 修炼体系 · Cultivation System

本页整理从炼气期到道祖境的十四级境界阶梯，方便读者、译者、创作者和游戏策划快速对照。

## 境界总览图 · Realm Timeline

<div class="realm-timeline">
${timeline}
</div>

## 三阶段分类 · Three Stages

<div class="stage-grid">
  <div class="wiki-card"><h3>下境界 · Lower Realm</h3><p>炼气、筑基、结丹、元婴、化神。</p></div>
  <div class="wiki-card"><h3>中境界 · Middle Realm</h3><p>炼虚、合体、大乘、渡劫。</p></div>
  <div class="wiki-card"><h3>上境界 · Upper Realm</h3><p>真仙、金仙、太乙、大罗、道祖。</p></div>
</div>`
  writeDoc(`${prefix}cultivation-system/index.md`, frontmatter({
    title: isEn ? 'Cultivation System' : '修炼体系',
    description: isEn ? 'A fourteen-realm cultivation ladder from Qi Refining to Dao Ancestor.' : '从炼气期到道祖境的十四级修炼体系。'
  }) + body)
}

function realmPage(realm, locale) {
  const isEn = locale === 'en'
  const body = isEn
    ? `# ${realm.en} (${realm.zh}, ${realm.pinyin})

<div class="entry-layout"><main class="entry-main">

## Summary

**English:** ${realm.en} belongs to the ${realm.levelEn}. Lifespan reference: ${realm.lifespanEn}. ${realm.featureEn}

**中文：** ${realm.zh}属于${realm.levelZh}，寿元参考为${realm.lifespan}。${realm.featureZh}

## Description

**English:** This realm is one step in the fourteen-realm ladder. It changes how cultivators store power, understand the Dao, survive conflict, and interact with the world.

**中文：** 这一境界是十四级修炼阶梯中的关键节点，会改变修士储存力量、理解大道、面对冲突和接触世界的方式。

## Key Characteristics

- **Realm Tier:** ${realm.levelEn} / ${realm.levelZh}
- **Lifespan:** ${realm.lifespanEn}
- **Power Shift:** ${realm.featureEn}
- **Narrative Role:** It marks a new threshold of ability, status, and risk.

## Breakthrough Conditions

**English:** ${realm.breakthroughEn}

**中文：** ${realm.breakthroughZh}

## Related Terms

- [Qi](/en/glossary/qi)
- [Golden Core](/en/glossary/golden-core)
- [Tribulation](/en/glossary/heavenly-tribulation)
- [Ascension](/en/glossary/ascension)

## References

- Baidu Baike entries for 修仙 and 修真
- Taoist inner-alchemy cultivation vocabulary
- Representative settings from cultivation novels

</main><aside class="entry-aside"><div class="info-card"><h2>Realm Info</h2><dl><dt>Chinese Name</dt><dd>${realm.zh}</dd><dt>Pinyin</dt><dd>${realm.pinyin}</dd><dt>English Name</dt><dd>${realm.en}</dd><dt>Tier</dt><dd>${realm.levelEn}</dd><dt>Lifespan</dt><dd>${realm.lifespanEn}</dd></dl></div></aside></div>`
    : `# ${realm.zh} · ${realm.en} (${realm.pinyin})

<div class="entry-layout"><main class="entry-main">

## 摘要 · Summary

**中文：** ${realm.zh}属于${realm.levelZh}，寿元参考为${realm.lifespan}。${realm.featureZh}

**English:** ${realm.en} belongs to the ${realm.levelEn}. Lifespan reference: ${realm.lifespanEn}. ${realm.featureEn}

## 描述 · Description

**中文：** 这一境界是十四级修炼阶梯中的关键节点，会改变修士储存力量、理解大道、面对冲突和接触世界的方式。

**English:** This realm is one step in the fourteen-realm ladder. It changes how cultivators store power, understand the Dao, survive conflict, and interact with the world.

## 核心特征 · Key Characteristics

- **境界层级 / Realm Tier:** ${realm.levelZh} / ${realm.levelEn}
- **寿元 / Lifespan:** ${realm.lifespan}
- **力量变化 / Power Shift:** ${realm.featureZh}
- **叙事作用 / Narrative Role:** 标志能力、身份和风险进入新的门槛。

## 突破条件 · Breakthrough Conditions

**中文：** ${realm.breakthroughZh}

**English:** ${realm.breakthroughEn}

## 相关词条 · Related Terms

- [灵气 Qi](/glossary/qi)
- [金丹 Golden Core](/glossary/golden-core)
- [天劫 Tribulation](/glossary/heavenly-tribulation)
- [飞升 Ascension](/glossary/ascension)

## 参考文献 · References

- 百度百科 · 修仙词条
- 百度百科 · 修真词条
- 道教内丹术修炼语汇
- 代表性修真小说设定

</main><aside class="entry-aside"><div class="info-card"><h2>境界信息 · Realm Info</h2><dl><dt>中文名称</dt><dd>${realm.zh}</dd><dt>拼音</dt><dd>${realm.pinyin}</dd><dt>英文名称</dt><dd>${realm.en}</dd><dt>层级</dt><dd>${realm.levelZh}</dd><dt>寿元</dt><dd>${realm.lifespan}</dd></dl></div></aside></div>`
  return frontmatter({
    title: isEn ? realm.en : realm.zh,
    zh_name: realm.zh,
    en_name: realm.en,
    pinyin: realm.pinyin,
    category: 'realms',
    realm_level: isEn ? realm.levelEn : realm.levelZh,
    lifespan: isEn ? realm.lifespanEn : realm.lifespan,
    description: realm.featureEn,
    description_zh: realm.featureZh
  }) + body
}

cultivationIndex('zh')
cultivationIndex('en')
for (const realm of realms) {
  writeDoc(`cultivation-system/${realm.slug}.md`, realmPage(realm, 'zh'))
  writeDoc(`en/cultivation-system/${realm.slug}.md`, realmPage(realm, 'en'))
}
const immortalRealm = { slug: 'immortal', zh: '仙人', en: 'Immortal', pinyin: 'Xiānrén', levelZh: '上境界', levelEn: 'Upper Realm', lifespan: '长生', lifespanEn: 'immortal longevity', featureZh: '修炼有成、脱离凡俗寿命限制的超凡存在。', featureEn: 'A transcendent being who has moved beyond ordinary mortality.', breakthroughZh: '完成凡俗修炼、飞升或获得类似仙道位格。', breakthroughEn: 'Complete mortal cultivation, ascend, or obtain an immortal status.' }
writeDoc('cultivation-system/immortal.md', realmPage(immortalRealm, 'zh'))
writeDoc('en/cultivation-system/immortal.md', realmPage(immortalRealm, 'en'))

const works = [
  { slug: 'piao-miao-journey', zh: '飘邈之旅', en: 'Stellar Travel', author: '萧潜', authorEn: 'Xiao Qian', genre: '星际仙侠流', genreEn: 'Interstellar Xianxia', statusZh: '已完结', statusEn: 'Completed', descZh: '星际仙侠流的早期代表作，把修真进阶与星际旅行结合起来。', descEn: 'An early interstellar xianxia reference that combines cultivation progression with cosmic travel.', characters: [['李强', 'Li Qiang', '主角，从凡俗经历踏入更广阔的修真世界。'], ['傅山', 'Fu Shan', '重要引路人。'], ['赵豪', 'Zhao Hao', '重要伙伴。']] },
  { slug: 'buddha-is-the-tao', zh: '佛本是道', en: 'Buddha Is The Way', author: '梦入神机', authorEn: 'Meng Ru Shen Ji', genre: '洪荒流', genreEn: 'Primordial Myth', statusZh: '已完结', statusEn: 'Completed', descZh: '洪荒流网络小说的重要开创作品，融合封神、西游与道佛神话。', descEn: 'A formative primordial-myth novel that blends Investiture, Journey to the West, Daoist, and Buddhist motifs.', characters: [['周青', 'Zhou Qing', '主角，卷入宏大的洪荒神话格局。'], ['道门人物', 'Daoist figures', '推动神话体系展开。'], ['佛门人物', 'Buddhist figures', '构成道佛冲突与融合。']] },
  { slug: 'mortal-journey', zh: '凡人修仙传', en: "A Record of a Mortal's Journey to Immortality", author: '忘语', authorEn: 'Wang Yu', genre: '凡人流', genreEn: 'Mortal Flow', statusZh: '已完结', statusEn: 'Completed', descZh: '资质平庸的少年韩立，凭借谨慎、毅力和机缘在修仙界中一步步崛起。', descEn: 'Han Li, an ordinary youth, rises through a dangerous cultivation world through caution, grit, and opportunity.', characters: [['韩立', 'Han Li', '主角，谨慎务实的凡人流代表。'], ['南宫婉', 'Nangong Wan', '重要角色。'], ['墨大夫', 'Doctor Mo', '韩立早期命运的关键人物。']] },
  { slug: 'sect-leader', zh: '修真门派掌门路', en: 'The Path of a Sect Leader', author: '齐可休', authorEn: 'Qi Kexiu', genre: '宗门流', genreEn: 'Sect Management', statusZh: '连载中', statusEn: 'Ongoing', descZh: '以宗门经营、资源分配和修真生态为核心的代表作品。', descEn: 'A representative sect-management cultivation work centered on institutions, resources, and survival.', characters: [['齐休', 'Qi Xiu', '主角，承担宗门兴衰的压力。'], ['楚秦门众', 'Chu Qin Sect members', '宗门共同体。'], ['周边势力', 'Neighboring factions', '构成经营压力。']] },
  { slug: 'zhu-xian', zh: '诛仙', en: 'Zhu Xian', author: '萧鼎', authorEn: 'Xiao Ding', genre: '古典仙侠', genreEn: 'Classical Xianxia', statusZh: '已完结', statusEn: 'Completed', descZh: '古典仙侠代表作，围绕正魔冲突、个人选择和情感悲剧展开。', descEn: 'A classic xianxia novel about orthodox-demonic conflict, personal choice, and tragic emotion.', characters: [['张小凡', 'Zhang Xiaofan', '主角，命运在正魔之间摇摆。'], ['陆雪琪', 'Lu Xueqi', '重要角色。'], ['碧瑶', 'Biyao', '重要角色。']] },
  { slug: 'renegade-immortal', zh: '仙逆', en: 'Xian Ni / Reverse Immortal', author: '耳根', authorEn: 'Er Gen', genre: '仙侠', genreEn: 'Xianxia', statusZh: '已完结', statusEn: 'Completed', descZh: '以王林求道、执念和逆天而行为主线的经典仙侠作品。', descEn: 'A major xianxia work following Wang Lin, obsession, Dao-seeking, and defying fate.', characters: [['王林', 'Wang Lin', '主角，求道意志强烈。'], ['李慕婉', 'Li Muwan', '重要角色。'], ['司徒南', 'Situ Nan', '关键引导者。']] },
  { slug: 'shrouding-the-heavens', zh: '遮天', en: 'Shrouding the Heavens', author: '辰东', authorEn: 'Chen Dong', genre: '玄幻仙侠', genreEn: 'Fantasy Xianxia', statusZh: '已完结', statusEn: 'Completed', descZh: '宏大世界观与强烈玄幻仙侠风格的代表作品。', descEn: 'A large-scale fantasy-xianxia work with expansive worldbuilding.', characters: [['叶凡', 'Ye Fan', '主角，卷入星空与古老传承。'], ['姬紫月', 'Ji Ziyue', '重要角色。'], ['庞博', 'Pang Bo', '重要伙伴。']] },
  { slug: 'stellar-transformations', zh: '星辰变', en: 'Stellar Transformations', author: '我吃西红柿', authorEn: 'I Eat Tomatoes', genre: '修真', genreEn: 'Cultivation', statusZh: '已完结', statusEn: 'Completed', descZh: '围绕星辰之力、肉身修炼和飞升展开的经典修真小说。', descEn: 'A classic cultivation novel centered on stellar power, body training, and ascension.', characters: [['秦羽', 'Qin Yu', '主角，以特殊道路踏上修炼。'], ['姜立', 'Jiang Li', '重要角色。'], ['侯费', 'Hou Fei', '重要伙伴。']] },
  { slug: 'hundred-refinements', zh: '百炼成仙', en: 'A Hundred Refinements to Immortality', author: '幻雨', authorEn: 'Huanyu', genre: '废品修仙流', genreEn: 'Underdog Cultivation', statusZh: '已完结', statusEn: 'Completed', descZh: '长篇废品修仙流代表，强调低起点与漫长积累。', descEn: 'A long underdog-cultivation work focused on humble beginnings and accumulation.', characters: [['林轩', 'Lin Xuan', '主角，从低起点踏入修仙。'], ['师门人物', 'Sect figures', '推动资源与门派冲突。'], ['对手', 'Rivals', '构成成长压力。']] },
  { slug: 'i-shall-seal-the-heavens', zh: '我欲封天', en: 'I Shall Seal the Heavens', author: '耳根', authorEn: 'Er Gen', genre: '仙侠', genreEn: 'Xianxia', statusZh: '已完结', statusEn: 'Completed', descZh: '耳根代表作之一，兼具热血冒险、宿命感和宏大修行体系。', descEn: 'A major Er Gen cultivation adventure with fate, humor, and broad progression.', characters: [['孟浩', 'Meng Hao', '主角，机缘与选择共同推动成长。'], ['许清', 'Xu Qing', '重要角色。'], ['靠山宗人物', 'Reliance Sect figures', '早期修行环境。']] }
]

function worksIndex(locale) {
  const isEn = locale === 'en'
  const prefix = isEn ? 'en/' : ''
  const body = isEn
    ? `# Classic Works

This section provides spoiler-light references for influential xianxia and cultivation novels. It focuses on genre, terminology, worldbuilding, and reading context.

<WorksExplorer locale="en" />`
    : `# 经典作品 · Classic Works

本区收录有代表性的修仙、修真、仙侠与玄幻仙侠作品。页面只做百科式介绍、设定说明和术语参考，不收录小说正文。

<WorksExplorer locale="zh" />`
  writeDoc(`${prefix}classic-works/index.md`, frontmatter({
    title: isEn ? 'Classic Works' : '经典作品',
    description: isEn ? 'Influential xianxia and cultivation novels with bilingual context.' : '修仙、修真与仙侠经典作品索引。'
  }) + body)
}

function workPage(work, locale) {
  const isEn = locale === 'en'
  const prefix = isEn ? '/en' : ''
  const rows = work.characters.map(([zh, en, note]) => `| ${zh} | ${en} | ${note} |`).join('\n')
  const body = isEn
    ? `# ${work.en} · 《${work.zh}》

## Basic Info

| Field | Detail |
| --- | --- |
| Chinese Title | ${work.zh} |
| English Title | ${work.en} |
| Author | ${work.author} (${work.authorEn}) |
| Status | ${work.statusEn} |
| Genre | ${work.genreEn} / ${work.genre} |

## Synopsis

**English:** ${work.descEn} This page is a reference guide and does not reproduce novel chapters.

**中文：** ${work.descZh}本站只做介绍和设定说明，不收录小说正文。

## Main Characters

| 中文名 | English | Notes |
| --- | --- | --- |
${rows}

## Cultivation System

**English:** Use the [Cultivation System overview](${prefix}/cultivation-system/) to compare the realms, sects, resources, and breakthrough logic used by this work.

**中文：** 可结合[修炼体系总览](${prefix}/cultivation-system/)理解作品中的境界、宗门、资源与突破逻辑。

## Official Reading

- Please read through official or licensed platforms such as Qidian, Webnovel, or the publisher-authorized channel available in your region.
- This site is a terminology and cultural reference only.

## Related Terms

- [Cultivation](${prefix}/glossary/cultivation)
- [Sect](${prefix}/glossary/sect)
- [Golden Core](${prefix}/glossary/golden-core)`
    : `# 《${work.zh}》· ${work.en}

## 基本信息 · Basic Info

| 项目 | 详情 |
| --- | --- |
| 中文名 | ${work.zh} |
| 英文名 | ${work.en} |
| 作者 | ${work.author} (${work.authorEn}) |
| 状态 | ${work.statusZh} |
| 流派 | ${work.genre} / ${work.genreEn} |

## 简介 · Synopsis

**中文：** ${work.descZh}本站只做介绍和设定说明，不收录小说正文。

**English:** ${work.descEn} This page is a reference guide and does not reproduce novel chapters.

## 主要角色 · Main Characters

| 中文名 | English | 简介 |
| --- | --- | --- |
${rows}

## 修炼体系 · Cultivation System

**中文：** 可结合[修炼体系总览](/cultivation-system/)理解作品中的境界、宗门、资源与突破逻辑。

**English:** Use the [Cultivation System overview](/cultivation-system/) to compare the realms, sects, resources, and breakthrough logic used by this work.

## 官方阅读 · Official Reading

- 请前往起点中文网、纵横中文网、Webnovel 或作者/出版方授权平台搜索书名。
- 本站仅做术语和文化背景参考，不收录章节正文。

## 相关词条 · Related Terms

- [修仙 Cultivation](/glossary/cultivation)
- [宗门 Sect](/glossary/sect)
- [金丹 Golden Core](/glossary/golden-core)`
  return frontmatter({
    title: isEn ? work.en : work.zh,
    zh_name: work.zh,
    en_name: work.en,
    author: work.author,
    author_en: work.authorEn,
    status: isEn ? work.statusEn : work.statusZh,
    genre: isEn ? work.genreEn : work.genre,
    description: work.descEn,
    description_zh: work.descZh
  }) + body
}

worksIndex('zh')
worksIndex('en')
for (const work of works) {
  writeDoc(`classic-works/${work.slug}.md`, workPage(work, 'zh'))
  writeDoc(`en/classic-works/${work.slug}.md`, workPage(work, 'en'))
}

const cultureArticles = [
  { slug: 'taoism-and-xianxia', zh: '道教与修仙：从老子到金丹', en: 'Taoism and Cultivation: From Laozi to Golden Core', summaryZh: '修仙叙事大量借用道教语汇，将养生、炼气、内丹和成仙理想转化为类型文学设定。', summaryEn: 'Xianxia fiction borrows Daoist vocabulary and transforms cultivation, Qi, inner alchemy, and immortality into genre systems.' },
  { slug: 'inner-alchemy', zh: '内丹术：修仙境界的哲学基础', en: 'Inner Alchemy: The Philosophical Foundation', summaryZh: '内丹术把人体视为炉鼎，以炼精化气、炼气化神等语言解释身心修炼。', summaryEn: 'Inner alchemy treats body and mind as the furnace for refinement, shaping terms such as Golden Core and spirit transformation.' },
  { slug: 'five-elements', zh: '五行八卦在修仙世界中的应用', en: 'Five Elements and Eight Trigrams in Xianxia', summaryZh: '五行八卦为灵根、阵法、丹药属性和克制关系提供了一套可读的规则语言。', summaryEn: 'Five Elements and Eight Trigrams provide a rule language for roots, formations, pill properties, and counters.' },
  { slug: 'chinese-xian', zh: '中国神话中的仙：从西王母到八仙', en: 'Immortals in Chinese Mythology', summaryZh: '中国神话中的仙既有神格、方术和山海想象，也影响了网络仙侠中的飞升与仙界。', summaryEn: 'Chinese immortals combine myth, arts, mountains, and transcendence, influencing ascension and immortal-world fiction.' },
  { slug: 'cantong-qi-and-alchemy', zh: '《周易参同契》与炼丹术', en: 'The Cantong Qi and Alchemy', summaryZh: '《周易参同契》等丹道文本让阴阳、五行、炉鼎、金丹等词汇进入修仙想象。', summaryEn: 'Alchemy texts such as the Cantong Qi helped carry Yin-Yang, Five Elements, furnace, and Golden Core language into cultivation imagination.' },
  { slug: 'xianxia-literary-evolution', zh: '修真小说的文学流派演变', en: 'The Evolution of Xianxia Literature', summaryZh: '修真小说从古典仙侠发展出凡人流、洪荒流、宗门流、玄幻仙侠等分支。', summaryEn: 'Cultivation fiction grew from classical xianxia into mortal flow, primordial myth, sect-management, and fantasy-xianxia branches.' },
  { slug: 'immortality', zh: '长生与不朽想象', en: 'Immortality in Xianxia', summaryZh: '长生既是修仙目标，也是关于时间、代价、孤独和责任的叙事问题。', summaryEn: 'Immortality is both the goal of cultivation and a narrative question about time, cost, loneliness, and responsibility.' }
]

function cultureIndex(locale) {
  const isEn = locale === 'en'
  const prefix = isEn ? '/en' : ''
  const cards = cultureArticles.map((item) => `<a class="entry-card" href="${prefix}/culture/${item.slug}"><h3>${isEn ? item.en : item.zh}</h3><p class="muted">${isEn ? item.zh : item.en}</p><p>${isEn ? item.summaryEn : item.summaryZh}</p></a>`).join('\n  ')
  const body = isEn
    ? `# Cultural Background

These articles explain the historical and conceptual background behind cultivation vocabulary.

<div class="entry-grid">
  ${cards}
</div>`
    : `# 文化背景 · Cultural Background

这些文章解释修仙语汇背后的道教、内丹、五行、神话和文学流派背景。

<div class="entry-grid">
  ${cards}
</div>`
  writeDoc(`${isEn ? 'en/' : ''}culture/index.md`, frontmatter({
    title: isEn ? 'Cultural Background' : '文化背景',
    description: isEn ? 'Taoism, inner alchemy, five elements, mythology, and xianxia genre history.' : '道教、内丹术、五行八卦、中国神话与修真文学演变。'
  }) + body)
}

function culturePage(article, locale) {
  const isEn = locale === 'en'
  const body = isEn
    ? `# ${article.en}

## Overview

**English:** ${article.summaryEn}

**中文：** ${article.summaryZh}

## Why It Matters

**English:** Cultural background keeps xianxia from becoming a list of power levels. It explains why Qi, Golden Core, tribulation, sects, and immortality carry symbolic weight beyond game-like progression.

**中文：** 文化背景让修仙不只是等级表。灵气、金丹、天劫、宗门和长生背后都有身体观、宇宙观和伦理想象。

## Reading Notes

- Compare the glossary terms with the cultivation system pages.
- Treat novel settings as creative adaptations, not literal history.
- When citing cultural sources, prefer concise summaries and clear source names.

## References

- Taoist inner-alchemy background materials
- Classical Chinese myth and religious studies references
- Baidu Baike and public encyclopedia entries for related concepts`
    : `# ${article.zh} · ${article.en}

## 概述 · Overview

**中文：** ${article.summaryZh}

**English:** ${article.summaryEn}

## 为什么重要 · Why It Matters

**中文：** 文化背景让修仙不只是等级表。灵气、金丹、天劫、宗门和长生背后都有身体观、宇宙观和伦理想象。

**English:** Cultural background keeps xianxia from becoming a list of power levels. It explains why Qi, Golden Core, tribulation, sects, and immortality carry symbolic weight beyond game-like progression.

## 阅读提示 · Reading Notes

- 可与[术语词典](/glossary/)和[修炼体系](/cultivation-system/)交叉阅读。
- 小说设定是对传统文化的类型化改写，不应直接等同于历史事实。
- 引用文化资料时建议概括说明并标注来源名称，避免大段复制。

## 参考文献 · References

- 道教内丹术相关资料
- 中国神话与宗教文化研究资料
- 百度百科及公开百科相关词条`
  return frontmatter({
    title: isEn ? article.en : article.zh,
    description: article.summaryEn,
    description_zh: article.summaryZh
  }) + body
}

cultureIndex('zh')
cultureIndex('en')
for (const article of cultureArticles) {
  writeDoc(`culture/${article.slug}.md`, culturePage(article, 'zh'))
  writeDoc(`en/culture/${article.slug}.md`, culturePage(article, 'en'))
}

function categoryIndex(locale) {
  const isEn = locale === 'en'
  const prefix = isEn ? '/en' : ''
  const cards = categories.map((item) => `<a class="category-row" href="${prefix}/categories/${item.slug}"><span class="icon">${item.icon}</span><h3>${isEn ? item.en : item.zh}</h3><p>${isEn ? item.zh : item.en}</p><strong>${item.count} ${isEn ? 'entries' : '词条'}</strong></a>`).join('\n  ')
  const body = isEn
    ? `# Categories

The glossary is organized into eleven broad categories so readers can browse by function, not only by spelling.

<div class="category-grid">
  ${cards}
</div>`
    : `# 分类体系

术语按功能和语义分为 11 类，便于从境界、资源、组织、身份和文化概念等角度浏览。

<div class="category-grid">
  ${cards}
</div>`
  writeDoc(`${isEn ? 'en/' : ''}categories/index.md`, frontmatter({
    title: isEn ? 'Categories' : '分类体系',
    description: isEn ? 'Eleven-part taxonomy for the NoICU Cultivator glossary.' : 'NoICU Cultivator 的 11 个修仙百科分类。'
  }) + body)
}

function categoryPage(category, locale) {
  const isEn = locale === 'en'
  const prefix = isEn ? '/en' : ''
  const matchingTerms = terms.filter((term) => term.category === category.key)
  const termList = matchingTerms.length
    ? matchingTerms.map((term) => `- [${isEn ? `${term.en} / ${term.zh}` : `${term.zh} / ${term.en}`}](${prefix}/glossary/${term.slug})`).join('\n')
    : category.examples.map((item) => `- ${item}`).join('\n')
  const body = isEn
    ? `# ${category.en} · ${category.zh}

${category.descEn}

## Included Entries

${termList}

## Scope

This category is part of the eleven-part taxonomy used by NoICU Cultivator. It helps readers connect terms by narrative function and worldbuilding role.`
    : `# ${category.zh} · ${category.en}

${category.descZh}

## 已收录词条 · Included Entries

${termList}

## 分类说明 · Scope

本分类属于 NoICU Cultivator 的 11 大内容体系，用于按叙事功能和世界观角色组织词条。`
  writeDoc(`${isEn ? 'en/' : ''}categories/${category.slug}.md`, frontmatter({
    title: isEn ? category.en : category.zh,
    description: isEn ? category.descEn : category.descZh
  }) + body)
}

categoryIndex('zh')
categoryIndex('en')
for (const category of categories) {
  categoryPage(category, 'zh')
  categoryPage(category, 'en')
}

console.log('Generated bilingual NoICU Cultivator content.')
