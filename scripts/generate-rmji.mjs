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

const sources = [
  {
    key: 'qidian-rmji',
    zh: '起点中文网《凡人修仙传》',
    en: "Qidian: A Record of a Mortal's Journey to Immortality",
    url: 'https://www.qidian.com/book/107580/'
  },
  {
    key: 'qidian-immortal',
    zh: '起点中文网《凡人修仙之仙界篇》',
    en: "Qidian: A Record of a Mortal's Journey to Immortality - Immortal World Arc",
    url: 'https://www.qidian.com/book/1010734492/'
  },
  {
    key: 'weread-immortal',
    zh: '微信读书《凡人修仙之仙界篇》',
    en: 'WeRead: Immortal World Arc',
    url: 'https://weread.qq.com/web/bookDetail/1cd32a70713c621c1cdee58'
  },
  {
    key: 'wuxiaworld-rmji',
    zh: 'Wuxiaworld 英文授权阅读页',
    en: 'Wuxiaworld English RMJI reading page',
    url: 'https://www.wuxiaworld.com/novel/rmji'
  },
  {
    key: 'wuxiaworld-immortal',
    zh: 'Wuxiaworld《仙界篇》英文授权阅读页',
    en: 'Wuxiaworld English Immortal Realm reading page',
    url: 'https://www.wuxiaworld.com/novel/rmjiir'
  }
]

const sourceByKey = new Map(sources.map((source) => [source.key, source]))
const siteOrigin = 'https://no996noicu.com'

const sections = [
  { slug: 'techniques', zh: '功法神通', en: 'Techniques & Abilities', icon: '法', descZh: '修炼法门、神通、剑阵、炼体与仙界法则功法。', descEn: 'Cultivation methods, divine abilities, sword formations, body arts, and law-based arts.' },
  { slug: 'artifacts', zh: '法宝灵兽', en: 'Artifacts & Companions', icon: '宝', descZh: '法宝、灵材化宝、灵虫灵兽、傀儡和符宝体系。', descEn: 'Treasures, refined materials, spirit insects, companions, puppets, and talisman treasures.' },
  { slug: 'elixirs', zh: '丹药灵材', en: 'Elixirs & Materials', icon: '丹', descZh: '突破丹药、灵材、货币资源、妖丹魔晶和仙界材料。', descEn: 'Breakthrough pills, herbs, currency resources, demon cores, devil crystals, and immortal materials.' },
  { slug: 'sects', zh: '宗门势力', en: 'Sects & Factions', icon: '宗', descZh: '人界、灵界、仙界与灰界相关宗门、城池、组织和阵营。', descEn: 'Sects, cities, organizations, and factions across mortal, spirit, immortal, and gray-realm arcs.' },
  { slug: 'races', zh: '种族族群', en: 'Races & Peoples', icon: '族', descZh: '人族、妖族、魔族、灵族、灰仙、真灵等族群设定。', descEn: 'Humans, demon races, devil races, spirit races, gray immortals, true spirits, and other peoples.' },
  { slug: 'regions', zh: '界域地理', en: 'Realms & Regions', icon: '界', descZh: '人界、乱星海、灵界、魔界、仙界、灰界等地图框架。', descEn: 'Mortal Realm, Chaotic Star Sea, Spirit Realm, Devil Realm, Immortal Realm, Gray Realm, and more.' },
  { slug: 'laws', zh: '法则大道', en: 'Laws & Dao', icon: '道', descZh: '仙界篇核心的时间、轮回、空间、五行与三千大道。', descEn: 'Time, reincarnation, space, five elements, and the three thousand great daos of the sequel.' },
  { slug: 'characters', zh: '人物角色', en: 'Characters', icon: '人', descZh: '主角、道侣、师友、敌手、灵兽伙伴和仙界篇关键人物。', descEn: 'Main characters, companions, mentors, rivals, spirit companions, and Immortal World Arc figures.' },
  { slug: 'timeline', zh: '剧情脉络', en: 'Timeline', icon: '史', descZh: '按阶段整理韩立的年龄段、所在地点、所得资源与关键事件。', descEn: 'A staged route tracking Han Li age band, location, gains, and key events.' }
]

function item(slug, zh, en, pinyin, phaseZh, phaseEn, summaryZh, summaryEn, roleZh, roleEn, related = [], confidence = 'medium') {
  return { slug, zh, en, pinyin, phaseZh, phaseEn, summaryZh, summaryEn, roleZh, roleEn, related, confidence }
}

const catalog = {
  techniques: [
    item('changchun-gong', '长春功', 'Everlasting Spring Art', 'Changchun Gong', '人界早期', 'Mortal Realm early arc', '韩立早期接触修仙门槛的基础功法，强调缓慢、稳妥和资源稀缺的开局气质。', 'An early foundational method tied to Han Li entering cultivation, emphasizing slow accumulation, caution, and scarce resources.', '它是凡人流低起点叙事的起步点，后续可与七玄门、墨大夫和小绿瓶线索互相连接。', 'It anchors the underdog opening and connects naturally with Qixuanmen, Doctor Mo, and the green bottle thread.', ['qixuan-men', 'zhangtian-bottle'], 'high'),
    item('qingyuan-sword-art', '青元剑诀', 'Azure Essence Sword Art', 'Qingyuan Jianjue', '人界至灵界', 'Mortal to Spirit Realm', '韩立长期使用并逐步强化的剑修路线之一，和成套飞剑、剑阵打法关系紧密。', 'One of Han Li long-running sword paths, closely tied to paired flying swords and sword-formation combat.', '适合与青竹蜂云剑、剑阵之道、辟邪神雷合并阅读，形成韩立中后期战斗风格的核心索引。', 'Read it with the Bamboo Cloudswarm Swords, sword formations, and evil-warding thunder to understand Han Li combat style.', ['green-bamboo-cloudswarm-swords', 'sword-array-method', 'evil-warding-divine-thunder'], 'high'),
    item('three-turn-heavy-origin', '三转重元功', 'Three-Turn Heavy Origin Technique', 'San Zhuan Chongyuan Gong', '人界中期', 'Mortal Realm middle arc', '围绕重修、压实根基与推高法力质量的辅助型功法概念。', 'A support technique concept around re-cultivation, foundation compression, and improving mana quality.', '它体现《凡人》体系中不靠天赋硬冲，而靠代价、时间和耐心换取上限的风格。', 'It reflects the series logic of paying cost and time for higher ceilings rather than rushing breakthroughs.', ['qingyuan-sword-art', 'spirit-stone'], 'medium'),
    item('great-development-art', '大衍诀', 'Great Development Art', 'Dayan Jue', '人界中期', 'Mortal Realm middle arc', '偏向神识、傀儡和复杂操控的传承法门，是凡人体系里技术型修仙的重要代表。', 'A heritage art leaning toward divine sense, puppets, and complex control, representing technical cultivation in RMJI.', '可作为傀儡术、阵法、分神控制和神识成长的总入口。', 'It can serve as the hub for puppet arts, formations, split control, and divine-sense growth.', ['puppet', 'formation-flags'], 'high'),
    item('bright-king-art', '明王诀', 'Bright King Art', 'Mingwang Jue', '灵界前后', 'Around Spirit Realm arc', '偏炼体与护身的功法方向，突出肉身强度在高阶斗法中的价值。', 'A body-refining and protection-oriented method that highlights physical durability in higher-level battles.', '它补足韩立不只依靠飞剑和法宝，也会用肉身、血脉、变化等手段解决风险。', 'It shows that Han Li does not rely only on swords and treasures, but also uses body strength and transformations.', ['fansheng-true-demon-art', 'true-spirit-blood'], 'medium'),
    item('fansheng-true-demon-art', '梵圣真魔功', 'Brahma Saint True Demon Art', 'Fansheng Zhenmo Gong', '灵界至仙界', 'Spirit to Immortal Realm', '兼具炼体、魔功意象与强力战斗形态的高阶功法。', 'A high-level art combining body refinement, demonic imagery, and powerful combat forms.', '它连接魔族、古魔、真灵血脉和韩立多路线并行的成长方式。', 'It links devil-race imagery, ancient devils, true-spirit bloodlines, and Han Li multi-path growth.', ['devil-race', 'ancient-devils', 'true-spirits'], 'high'),
    item('refining-spirit-art', '炼神术', 'Spirit Refining Art', 'Lianshen Shu', '仙界篇', 'Immortal World Arc', '仙界篇中偏重神魂、神识和精神承载力的关键修炼方向。', 'A key sequel-era training direction focused on soul, divine sense, and mental carrying capacity.', '适合与时间法则、真言化轮经、轮回殿等仙界篇高阶线索放在一起看。', 'It works best alongside time law, the Mantra Wheel Scripture, and Reincarnation Palace threads.', ['time-law', 'mantra-wheel-scripture', 'reincarnation-palace'], 'high'),
    item('mantra-wheel-scripture', '真言化轮经', 'Mantra Wheel Scripture', 'Zhenyan Hualun Jing', '仙界篇', 'Immortal World Arc', '与时间法则高度相关的仙界篇核心功法线索之一。', 'One of the Immortal World Arc core arts closely related to the law of time.', '它把前传的资源型修炼推进到法则型修炼，适合作为仙界篇功法专题的重点页。', 'It moves the system from resource cultivation into law-based cultivation and should be a key sequel entry.', ['time-law', 'true-word-sect', 'mantra-sect-ruins'], 'high'),
    item('phantom-star-manual', '幻辰宝典', 'Phantom Star Manual', 'Huanchen Baodian', '仙界篇', 'Immortal World Arc', '仙界篇法则功法谱系中的重要典籍，可放在时间、幻象与星辰意象之间理解。', 'An important sequel-era manual that can be read through time, illusion, and star imagery.', '当前词条先收录体系位置，后续建议补充传承来源、关键使用者和与其他功法的关系。', 'This seed entry records its system position first; later passes should add inheritance, users, and cross-art relations.', ['time-law', 'mantra-wheel-scripture'], 'verify'),
    item('water-derivation-four-seasons', '水衍四时诀', 'Water Derivation Four Seasons Art', 'Shuiyan Sishi Jue', '仙界篇', 'Immortal World Arc', '带有水行、四时流转和时间变化意象的功法线索。', 'An art associated with water, seasonal circulation, and time-change imagery.', '可归入仙界篇法则功法库，用来扩展五行与时间之间的交叉。', 'It belongs in the sequel law-art library and expands the intersection between five elements and time.', ['five-elements-law', 'time-law'], 'verify'),
    item('east-wood-wither-bloom', '东乙枯荣经', 'Eastern Yi Wither-Bloom Scripture', 'Dongyi Kurong Jing', '仙界篇', 'Immortal World Arc', '围绕木行、生灭、枯荣循环的功法设定。', 'A wood-phase art framed around life, decline, and cyclical flourishing.', '后续可与五行法则、生命类法则和仙界门派传承继续串联。', 'Later expansion can connect it with five-element law, life-oriented law concepts, and immortal-world inheritance.', ['five-elements-law', 'immortal-realm'], 'verify'),
    item('severing-time-flowing-fire', '断时流火集', 'Severing-Time Flowing-Fire Scripture', 'Duanshi Liuhuo Ji', '仙界篇真言门线', 'Immortal World True Word Sect thread', '奇摩子所修火属性时间法则功法，属于真言门五行时间法则分支之一。', 'Qi Mozi fire-aspected time-law scripture, one branch of True Word Sect five-element time-law system.', '它把奇摩子从普通追杀敌人定位为真言门叛徒和时间法则传承者。', 'It frames Qi Mozi not as a generic pursuer but as a True Word traitor and time-law inheritor.', ['qi-mozi', 'mi-luo-ancestor', 'time-law'], 'high'),
    item('great-five-elements-illusory-world', '大五行幻世诀', 'Great Five Elements Illusory World Art', 'Da Wuxing Huanshi Jue', '仙界篇', 'Immortal World Arc', '仙界篇中可归入五行、幻世与法则构造的高阶功法概念。', 'A sequel-era high-level concept involving five elements, illusory worlds, and law construction.', '适合在第二批详细补充法则效果、关联人物和出场阶段。', 'A later pass should add law effects, associated figures, and exact arc placement.', ['five-elements-law', 'three-thousand-daos'], 'verify'),
    item('evil-warding-divine-thunder', '辟邪神雷', 'Evil-Warding Divine Thunder', 'Bixie Shenlei', '人界至灵界', 'Mortal to Spirit Realm', '与金雷竹和飞剑体系深度绑定的雷法能力，克制邪祟、魔气和阴邪手段。', 'A thunder ability deeply tied to Golden Thunder Bamboo and sword treasures, used against evil, devilish, and yin methods.', '这是韩立战斗识别度最高的能力之一，应在法宝、材料、神通三处互链。', 'It is one of Han Li most recognizable combat tools and should be cross-linked across treasure, material, and ability pages.', ['golden-thunder-bamboo', 'green-bamboo-cloudswarm-swords', 'devil-race'], 'high'),
    item('shocking-thunder-twelve-transformations', '惊蛰十二变', 'Twelve Transformations of Jingzhe', 'Jingzhe Shier Bian', '仙界篇', 'Immortal World Arc', '仙界篇中带有变化、雷霆与肉身运用色彩的能力线索。', 'A sequel-era ability thread involving transformation, thunder, and body application.', '先作为索引骨架收录，下一批可补具体变化类型、取得方式和斗法表现。', 'Included as a seed entry; a later pass should add forms, acquisition path, and battle usage.', ['thunder-law', 'bright-king-art'], 'verify'),
    item('magnetic-divine-light', '元磁神光', 'Magnetic Divine Light', 'Yuanci Shenguang', '人界中后期', 'Mortal Realm middle-late arc', '以元磁之力克制五行、牵制法宝的特殊神通方向。', 'A special ability based on magnetic force, often used to restrain five-element powers and treasures.', '它展示《凡人》斗法不是单纯拼境界，而是依靠属性、克制和环境创造胜负。', 'It shows RMJI combat is not just realm comparison, but also attribute counters, restraint, and battlefield conditions.', ['five-elements-law', 'artifact'], 'high'),
    item('sword-array-method', '剑阵之道', 'Sword Formation Methods', 'Jianzhen Zhidao', '人界至灵界', 'Mortal to Spirit Realm', '成套飞剑与阵法逻辑结合后形成的战斗体系。', 'A combat system formed by combining sets of flying swords with formation logic.', '建议后续拆出大庚剑阵等细分页面，第一批先建立总入口。', 'Later passes should split major named sword formations into separate pages; this first batch creates the hub.', ['qingyuan-sword-art', 'green-bamboo-cloudswarm-swords', 'formation-flags'], 'medium')
  ],
  artifacts: [
    item('zhangtian-bottle', '掌天瓶 / 小绿瓶', 'Heavenly Bottle / Green Bottle', 'Zhangtian Ping', '全书主线', 'Whole-series main thread', '韩立最核心的机缘物之一，常与灵药培育、时间变化和长期积累联系在一起。', 'One of Han Li core opportunities, linked to herb cultivation, time-like change, and long-term accumulation.', '它是凡人流资源逻辑的核心象征，不宜写成简单开挂，而应强调谨慎使用和积累节奏。', 'It is the key symbol of resource logic, best framed as cautious accumulation rather than a simple cheat.', ['changchun-gong', 'ten-thousand-year-spirit-milk', 'time-law'], 'high'),
    item('green-bamboo-cloudswarm-swords', '青竹蜂云剑', 'Bamboo Cloudswarm Swords', 'Qingzhu Fengyun Jian', '人界至灵界', 'Mortal to Spirit Realm', '韩立代表性成套飞剑法宝，与金雷竹、辟邪神雷和剑阵体系紧密关联。', 'Han Li representative set of flying swords, tied to Golden Thunder Bamboo, evil-warding thunder, and sword formations.', '这是武器专题的第一核心页，应关联功法、材料、雷法和阵法四类内容。', 'This should be the primary weapon page, linking techniques, materials, thunder ability, and formation content.', ['qingyuan-sword-art', 'golden-thunder-bamboo', 'sword-array-method'], 'high'),
    item('golden-thunder-bamboo', '金雷竹', 'Golden Thunder Bamboo', 'Jinlei Zhu', '人界中期以后', 'Mortal Realm onward', '极具标识度的雷属性灵材，是青竹蜂云剑和辟邪神雷体系的重要基础。', 'A highly recognizable thunder-attribute material, foundational to the Bamboo Cloudswarm Swords and evil-warding thunder.', '可同时列入法宝、灵材与雷法三处，是内部链接密度最高的条目之一。', 'It belongs simultaneously to artifacts, materials, and thunder arts, making it one of the densest cross-link nodes.', ['green-bamboo-cloudswarm-swords', 'evil-warding-divine-thunder', 'thunder-law'], 'high'),
    item('xutian-cauldron', '虚天鼎', 'Void Heaven Cauldron', 'Xutian Ding', '乱星海', 'Chaotic Star Sea arc', '乱星海相关的重要宝物线索，承载秘境、争夺和高阶修士博弈。', 'An important treasure thread around the Chaotic Star Sea, tied to secret realms, competition, and high-level schemes.', '适合与乱星海、星宫、逆星盟放在同一组，形成地区事件链。', 'Best grouped with Chaotic Star Sea, Star Palace, and the Anti-Star Alliance as a regional event chain.', ['chaotic-star-sea', 'star-palace', 'anti-star-alliance'], 'high'),
    item('wind-thunder-wings', '风雷翅', 'Wind-Thunder Wings', 'Fenglei Chi', '人界中后期', 'Mortal Realm middle-late arc', '移动、遁速和风雷属性结合的代表性法宝。', 'A representative mobility treasure combining escape speed with wind and thunder attributes.', '它补充了韩立的生存逻辑：能打很重要，能跑、能避险同样重要。', 'It supports Han Li survival logic: fighting matters, but escape speed and risk avoidance matter just as much.', ['thunder-law', 'artifact'], 'high'),
    item('yuanhe-five-pole-mountain', '元合五极山', 'Yuanhe Five-Pole Mountain', 'Yuanhe Wuji Shan', '灵界前后', 'Around Spirit Realm arc', '偏镇压、防御和重宝气质的高阶宝物线索。', 'A high-level treasure thread associated with suppression, defense, and heavy artifact power.', '后续可补充炼制材料、获得过程和具体斗法场景。', 'Later passes can add materials, acquisition path, and concrete battle scenes.', ['spirit-realm', 'artifact'], 'medium'),
    item('eight-spirit-ruler', '八灵尺', 'Eight-Spirit Ruler', 'Baling Chi', '人界中后期', 'Mortal Realm middle-late arc', '带有佛门、灵兽意象和镇压防护色彩的重要法宝。', 'An important treasure with Buddhist, spirit-beast, suppression, and protection imagery.', '可与佛门法宝、镇压型宝物、秘境争夺等主题连接。', 'It can connect Buddhist treasure motifs, suppression tools, and secret-realm competition.', ['xutian-cauldron', 'artifact'], 'medium'),
    item('gold-devouring-beetles', '噬金虫', 'Gold-Devouring Beetles', 'Shijin Chong', '人界至灵界', 'Mortal to Spirit Realm', '韩立标志性灵虫群，以吞噬、群体压制和成长性著称。', 'Han Li iconic spirit insect swarm, known for devouring ability, group pressure, and growth potential.', '它把灵兽体系写成长期养成资源，而不是一次性宠物设定。', 'It turns spirit companions into a long-term cultivation resource rather than a one-off pet concept.', ['gold-devouring-beetle-king', 'spirit-beast-bag'], 'high'),
    item('gold-devouring-beetle-king', '噬金虫王', 'Gold-Devouring Beetle King', 'Shijin Chong Wang', '灵界至仙界', 'Spirit to Immortal Realm', '噬金虫体系进阶后的高威胁形态，适合放在灵虫成长线中说明。', 'The advanced high-threat form of the gold-devouring beetle line.', '后续应补充成长条件、数量变化和与高阶敌人的克制关系。', 'Later expansion should add growth conditions, quantity changes, and matchups against high-level enemies.', ['gold-devouring-beetles', 'true-spirits'], 'high'),
    item('weeping-soul-beast', '啼魂兽', 'Weeping Soul Beast', 'Tihun Shou', '人界至灵界', 'Mortal to Spirit Realm', '与神魂、鬼物、阴冥类威胁关系密切的灵兽伙伴。', 'A spirit companion closely related to souls, ghosts, and yin-underworld threats.', '它补足韩立面对魂魄类敌人时的应对体系。', 'It complements Han Li options against soul-oriented and ghostly threats.', ['reincarnation-law', 'gray-realm'], 'high'),
    item('puppet', '傀儡', 'Puppets', 'Kuilei', '人界至灵界', 'Mortal to Spirit Realm', '《凡人》中反复出现的技术型战力，可用于探路、替身、群战和阵地防御。', 'A recurring technical combat resource used for scouting, decoys, group combat, and positional defense.', '适合与大衍诀、阵旗阵盘和神识控制做专题互链。', 'Best cross-linked with the Great Development Art, formation tools, and divine-sense control.', ['great-development-art', 'formation-flags'], 'high'),
    item('talisman-treasure', '符宝', 'Talisman Treasure', 'Fubao', '人界早中期', 'Mortal Realm early-middle arc', '介于符箓和法宝之间的消耗型强力手段，常见于低阶修士越级保命。', 'A consumable power tool between talisman and treasure, often used by lower-level cultivators to survive stronger foes.', '它非常适合解释前期战斗为什么重视底牌、信息差和一次性资源。', 'It explains why early combat values trump cards, information gaps, and one-time resources.', ['formation-flags', 'spirit-stone'], 'high'),
    item('formation-flags', '阵旗阵盘', 'Formation Flags and Plates', 'Zhenqi Zhenpan', '全书常见', 'Recurring across the series', '布阵、破阵、遮蔽、传送和洞府防护常用的工具系统。', 'The tool system behind formations, concealment, teleportation, and cave-residence protection.', '这是把阵法从抽象概念落成可携带装备的关键条目。', 'This entry turns formations from an abstract idea into portable equipment.', ['sword-array-method', 'puppet'], 'high'),
    item('spirit-beast-bag', '灵兽袋', 'Spirit Beast Bag', 'Lingshou Dai', '全书常见', 'Recurring across the series', '用于收纳、携带灵兽灵虫的功能性法器。', 'A functional tool used to carry spirit beasts and spirit insects.', '可作为噬金虫、啼魂兽、灵兽山和养成类资源之间的基础链接。', 'It provides a basic link among beetles, Weeping Soul Beast, Spirit Beast Mountain, and companion cultivation.', ['gold-devouring-beetles', 'weeping-soul-beast', 'spirit-beast-mountain'], 'medium')
  ],
  elixirs: [
    item('foundation-establishment-pill', '筑基丹', 'Foundation Establishment Pill', 'Zhuji Dan', '人界早期', 'Mortal Realm early arc', '低阶修士冲击筑基的重要丹药，直接连接宗门资源分配和底层竞争。', 'A key pill for Qi Refining cultivators attempting Foundation Establishment, tied to sect allocation and lower-level competition.', '它最能体现《凡人》资源稀缺、机会有限、突破有门槛的早期生态。', 'It captures the early ecology of scarcity, limited chances, and breakthrough thresholds.', ['huangfeng-valley', 'spirit-stone'], 'high'),
    item('face-retaining-pill', '定颜丹', 'Face-Retaining Pill', 'Dingyan Dan', '人界常见', 'Mortal Realm recurring', '偏驻颜和寿命想象的丹药设定，展示修仙世界日常欲望的一面。', 'A beauty-preserving pill that shows the everyday desires of the cultivation world.', '它不是主战资源，却有助于丰富修仙社会的消费、身份和审美。', 'It is not a main combat resource, but enriches the economy, identity, and aesthetics of cultivation society.', ['spirit-stone'], 'medium'),
    item('dustfall-pill', '降尘丹', 'Dustfall Pill', 'Jiangchen Dan', '人界中期', 'Mortal Realm middle arc', '面向结丹等关键门槛的辅助丹药之一。', 'One of the support pills associated with major thresholds such as Core Formation.', '后续需要按章节核对具体药效、材料和适用境界，第一批先建立索引。', 'A later pass should verify effect, materials, and exact target realm; this batch creates the index.', ['gold-forming-pill'], 'verify'),
    item('infant-formation-pill', '化婴丹', 'Nascent-Soul Formation Pill', 'Huaying Dan', '人界中后期', 'Mortal Realm middle-late arc', '辅助冲击元婴层级的高价值丹药线索。', 'A high-value pill thread associated with attempting the Nascent Soul level.', '它应与元婴、宗门交易、拍卖和高阶材料形成关联。', 'It should connect with Nascent Soul, sect trade, auctions, and high-level materials.', ['nine-bend-spirit-ginseng', 'spirit-stone'], 'medium'),
    item('gold-forming-pill', '结金丹', 'Core-Formation Pill', 'Jiejin Dan', '人界中期', 'Mortal Realm middle arc', '辅助筑基修士冲击结丹的重要丹药类型。', 'A major pill type for Foundation Establishment cultivators attempting Core Formation.', '它和筑基丹一起构成早中期最清晰的突破资源阶梯。', 'Together with the Foundation Establishment Pill, it forms the clearest early-middle breakthrough resource ladder.', ['foundation-establishment-pill', 'dustfall-pill'], 'medium'),
    item('spirit-stone', '灵石', 'Spirit Stone', 'Lingshi', '全书常见', 'Recurring across the series', '修仙界最基础的货币、能源和交易资源。', 'The most basic currency, energy source, and trade resource in the cultivation world.', '它应和拍卖、阵法、修炼、宗门补给、坊市等所有经济条目互链。', 'It should be linked to auctions, formations, cultivation, sect supply, markets, and all economy pages.', ['formation-flags', 'foundation-establishment-pill'], 'high'),
    item('demon-core', '妖丹', 'Demon Core', 'Yaodan', '人界至灵界', 'Mortal to Spirit Realm', '妖兽体内凝聚的高价值材料，可用于炼丹、炼器和修炼辅助。', 'A valuable material condensed within demonic beasts, used in alchemy, artifact refining, and cultivation support.', '它连接妖族、妖兽狩猎、材料经济和高阶丹方。', 'It links demon races, beast hunting, material economy, and high-level pill formulas.', ['demon-race', 'gold-forming-pill'], 'high'),
    item('devil-crystal', '魔晶 / 魔核', 'Devil Crystal / Devil Core', 'Mojing / Mohe', '魔界相关', 'Devil Realm related', '魔界或魔族体系中的能量材料，可对应魔气、魔功和跨界资源。', 'An energy material associated with the Devil Realm and devil-race systems.', '用于把魔界资源和人界、灵界的灵石妖丹体系区分开。', 'It helps distinguish Devil Realm resources from spirit stones and demon cores.', ['devil-race', 'demon-realm'], 'medium'),
    item('ten-thousand-year-spirit-milk', '万年灵乳', 'Ten-Thousand-Year Spirit Milk', 'Wannian Lingru', '人界中期', 'Mortal Realm middle arc', '稀有恢复类灵物，常用于关键斗法或长线修炼。', 'A rare restorative spiritual substance often tied to crucial battles or long cultivation.', '它适合与小绿瓶、秘境采集和高阶恢复资源相连。', 'It fits links to the green bottle, secret-realm gathering, and high-level recovery resources.', ['zhangtian-bottle', 'spirit-stone'], 'high'),
    item('nine-bend-spirit-ginseng', '九曲灵参', 'Nine-Bend Spirit Ginseng', 'Jiuqu Lingshen', '人界中后期', 'Mortal Realm middle-late arc', '高阶灵药代表，适合用于说明灵药年份、药性和争夺价值。', 'A representative high-level herb useful for explaining age, medicinal property, and competition value.', '后续可以补充具体丹方用途和与化婴丹等突破资源的关系。', 'Later expansion can add formulas and links with breakthrough resources such as the Nascent-Soul Formation Pill.', ['infant-formation-pill', 'zhangtian-bottle'], 'medium'),
    item('soul-nurturing-wood', '养魂木', 'Soul-Nurturing Wood', 'Yanghun Mu', '人界至灵界', 'Mortal to Spirit Realm', '与神魂保存、滋养和魂魄类风险相关的灵材。', 'A material tied to preserving and nourishing souls and managing soul-related risks.', '它可连接啼魂兽、轮回法则、夺舍和神魂修复等主题。', 'It links to Weeping Soul Beast, reincarnation law, possession, and soul recovery themes.', ['weeping-soul-beast', 'reincarnation-law'], 'high'),
    item('geng-metal', '庚精', 'Geng Metal Essence', 'Gengjing', '人界中期', 'Mortal Realm middle arc', '金属性高阶炼器材料，可用于强化飞剑、法宝和锋锐属性。', 'A high-level metal-attribute refining material used to strengthen swords, treasures, and sharpness.', '适合与青竹蜂云剑、五行法则和炼器经济互链。', 'It should cross-link with the Bamboo Cloudswarm Swords, five-element law, and refining economy.', ['green-bamboo-cloudswarm-swords', 'five-elements-law'], 'high'),
    item('dao-pill', '道丹', 'Dao Pill', 'Dao Dan', '仙界篇', 'Immortal World Arc', '仙界篇中可归入法则修炼、道意增长和高阶突破资源的丹药概念。', 'A sequel-era pill concept tied to law cultivation, dao comprehension, and high-level advancement.', '第一批先建立总入口，后续应拆分不同道丹品类和炼制体系。', 'This batch creates a hub; later passes should split specific Dao Pill types and their refining systems.', ['three-thousand-daos', 'dao-ancestor-system'], 'verify'),
    item('gray-realm-materials', '灰界材料', 'Gray-Realm Materials', 'Huijie Cailiao', '仙界篇灰界阶段', 'Immortal World Gray Realm arc', '灰界环境中出现的异质材料统称，用于区别仙界常规灵材与灰界生态。', 'A hub for materials from the Gray Realm environment, distinct from ordinary immortal-world resources.', '后续可按实际名称继续拆分，先服务灰界专题地图和资源体系。', 'Later passes can split actual named materials; this entry first supports Gray Realm geography and resource taxonomy.', ['gray-realm', 'gray-immortals', 'gray-realm-law'], 'verify')
  ],
  sects: [
    item('qixuan-men', '七玄门', 'Qixuanmen', 'Qixuan Men', '人界早期', 'Mortal Realm early arc', '韩立踏入江湖和修仙边缘的早期门派环境。', 'The early martial-world environment where Han Li first approaches the edge of cultivation.', '它是凡人流起点，不是高阶宗门，却决定了主角最早的谨慎性格和生存经验。', 'It is not a high cultivation sect, but it shapes Han Li early caution and survival instincts.', ['changchun-gong', 'qixuan-men-entry'], 'high'),
    item('huangfeng-valley', '黄枫谷', 'Yellow Maple Valley', 'Huangfeng Gu', '人界早期', 'Mortal Realm early arc', '越国七派之一，是韩立正式进入修仙宗门生态的重要阶段。', 'One of the Yue sects and the stage where Han Li formally enters sect-based cultivation society.', '适合解释筑基丹、门派任务、弟子等级和早期资源竞争。', 'It is ideal for explaining Foundation Establishment Pills, sect missions, disciple hierarchy, and early resource competition.', ['foundation-establishment-pill', 'yellow-maple-cultivation'], 'high'),
    item('masking-moon-sect', '掩月宗', 'Masking Moon Sect', 'Yanyue Zong', '人界早中期', 'Mortal Realm early-middle arc', '越国七派之一，也是早期正道宗门格局的重要拼图。', 'One of the Yue sects and an important piece of the early orthodox sect landscape.', '可与南宫婉相关人物线、越国七派和门派联盟结构关联。', 'It can connect with Nangong Wan-related character threads, the Yue sects, and alliance structures.', ['huangfeng-valley'], 'high'),
    item('spirit-beast-mountain', '灵兽山', 'Spirit Beast Mountain', 'Lingshou Shan', '人界早中期', 'Mortal Realm early-middle arc', '越国七派之一，突出灵兽、御兽和门派选择的差异化。', 'One of the Yue sects, highlighting spirit-beast control and sect specialization.', '适合与灵兽袋、噬金虫、御兽体系形成内容组。', 'Best grouped with spirit beast bags, gold-devouring beetles, and beast-taming systems.', ['spirit-beast-bag', 'gold-devouring-beetles'], 'high'),
    item('clear-void-sect', '清虚门', 'Clear Void Sect', 'Qingxu Men', '人界早中期', 'Mortal Realm early-middle arc', '越国七派之一，可用于补全越国宗门版图。', 'One of the Yue sects, useful for completing the early Yue sect map.', '第一批先记录基本位置，后续可补主要人物和事件。', 'This seed records its map position first; later passes can add figures and events.', ['huangfeng-valley'], 'medium'),
    item('giant-sword-sect', '巨剑门', 'Giant Sword Sect', 'Jujian Men', '人界早中期', 'Mortal Realm early-middle arc', '越国七派之一，名称上与剑修、重剑风格有天然联想。', 'One of the Yue sects, naturally associated with sword-cultivation imagery by name.', '后续可补具体门派特点、人物和越国七派互动。', 'Later expansion can add sect traits, figures, and interactions among the Yue sects.', ['qingyuan-sword-art'], 'medium'),
    item('heaven-watch-fort', '天阙堡', 'Heaven Watch Fort', 'Tianque Bao', '人界早中期', 'Mortal Realm early-middle arc', '越国七派之一，补足早期宗门联盟结构。', 'One of the Yue sects, completing the early sect-alliance structure.', '先作为地图和势力索引收录，等待后续逐章补人物。', 'Included first as a map and faction index, awaiting later character-level details.', ['huangfeng-valley'], 'medium'),
    item('cloudfall-sect', '落云宗', 'Cloudfall Sect', 'Luoyun Zong', '人界中后期', 'Mortal Realm middle-late arc', '韩立后续人界阶段的重要宗门节点之一。', 'An important later Mortal Realm sect node in Han Li route.', '适合与返回天南、大晋前后和韩立身份变化串联。', 'It should link with the return to Heavenly South, the Great Jin route, and Han Li changing status.', ['return-to-heavenly-south', 'great-jin-journey'], 'high'),
    item('star-palace', '星宫', 'Star Palace', 'Xinggong', '乱星海', 'Chaotic Star Sea arc', '乱星海核心势力之一，代表海域秩序与高阶修士治理。', 'A core Chaotic Star Sea faction representing maritime order and high-level governance.', '它应与逆星盟、虚天鼎、乱星海共同构成区域专题。', 'It should form a regional group with the Anti-Star Alliance, Void Heaven Cauldron, and Chaotic Star Sea.', ['anti-star-alliance', 'xutian-cauldron', 'chaotic-star-sea'], 'high'),
    item('anti-star-alliance', '逆星盟', 'Anti-Star Alliance', 'Nixing Meng', '乱星海', 'Chaotic Star Sea arc', '乱星海权力冲突中的主要对抗阵营之一。', 'One of the main opposing factions in the Chaotic Star Sea power struggle.', '适合说明《凡人》区域势力并不只有宗门，也有联盟、海域和利益集团。', 'It shows RMJI faction design includes alliances, sea regions, and interest blocs, not only sects.', ['star-palace', 'chaotic-star-sea'], 'high'),
    item('miao-yin-sect', '妙音门', 'Miao Yin Sect', 'Miaoyin Men', '乱星海', 'Chaotic Star Sea arc', '乱星海相关门派势力，可用于补充商业、海域和女性修士组织线索。', 'A Chaotic Star Sea faction useful for commercial, maritime, and female-cultivator organization threads.', '后续可继续补人物关系和具体事件。', 'Later passes can add character relations and specific events.', ['chaotic-star-sea'], 'medium'),
    item('heavenly-south-alliance', '天南修士联盟', 'Heavenly South Cultivator Alliance', 'Tiannan Xiushi Lianmeng', '人界中后期', 'Mortal Realm middle-late arc', '天南区域修士面对大规模压力时形成的联合结构。', 'A joint structure formed by Heavenly South cultivators under large-scale pressure.', '它将早期单宗门竞争升级为区域共同体与战争动员。', 'It upgrades early sect competition into regional community and wartime mobilization.', ['heavenly-south-region', 'return-to-heavenly-south'], 'medium'),
    item('great-jin-factions', '大晋修仙界', 'Great Jin Cultivation World', 'Dajin Xiuxianjie', '大晋篇', 'Great Jin arc', '人界后期更大尺度的修仙社会与势力舞台。', 'A larger late Mortal Realm stage of cultivation society and factions.', '适合承接天南之后的地图扩张、资源升级和高阶修士密度变化。', 'It carries map expansion after Heavenly South, resource upgrades, and denser high-level cultivator presence.', ['great-jin-region', 'great-jin-journey'], 'high'),
    item('heavenly-abyss-city', '天渊城', 'Heavenly Abyss City', 'Tianyuan Cheng', '灵界', 'Spirit Realm', '灵界人族重要城池和防线节点之一。', 'An important human city and defensive node in the Spirit Realm.', '它标志韩立进入灵界后，叙事从个人求存扩展到族群防线和跨族冲突。', 'It marks the narrative expansion from personal survival into racial defense and inter-race conflict.', ['spirit-realm', 'human-race'], 'high'),
    item('candle-dragon-dao', '烛龙道', 'Candle Dragon Dao', 'Zhulong Dao', '仙界篇', 'Immortal World Arc', '仙界篇中韩立进入仙界秩序后的重要宗门阶段。', 'An important sect stage after Han Li enters the order of the Immortal World Arc.', '它是仙界篇早期组织生态、身份安排和任务结构的核心页面。', 'It is a core page for early sequel organization ecology, identity placement, and mission structure.', ['immortal-realm-opening', 'north-cold-immortal-domain'], 'high'),
    item('north-cold-immortal-palace', '北寒仙宫', 'North Cold Immortal Palace', 'Beihan Xiangong', '仙界篇', 'Immortal World Arc', '北寒仙域的重要官方色彩势力，与仙界秩序、追捕和权力结构相关。', 'A major official-leaning force in the North Cold Immortal Domain, tied to order, pursuit, and power structures.', '适合与烛龙道、仙宫体系、天庭统辖和北寒仙域互链。', 'It should link with Candle Dragon Dao, immortal palace systems, Heavenly Court control, and the North Cold domain.', ['candle-dragon-dao', 'heavenly-court', 'north-cold-immortal-domain'], 'high'),
    item('heavenly-court', '天庭', 'Heavenly Court', 'Tianting', '仙界篇', 'Immortal World Arc', '仙界篇中代表更高层级秩序、统治和法则权力的核心势力。', 'A core sequel faction representing higher order, rule, and law-based authority.', '它应作为仙界政治结构的总入口，并与轮回殿、道祖体系强关联。', 'It should serve as a hub for immortal-world politics and link strongly with Reincarnation Palace and Dao Ancestor systems.', ['reincarnation-palace', 'dao-ancestor-system', 'heavenly-court-territory'], 'high'),
    item('reincarnation-palace', '轮回殿', 'Reincarnation Palace', 'Lunhui Dian', '仙界篇', 'Immortal World Arc', '仙界篇关键组织之一，与轮回、反秩序和高阶法则冲突密切相关。', 'One of the key sequel organizations, closely tied to reincarnation, anti-order positions, and high-level law conflicts.', '它是仙界篇的第二个政治核心，应与天庭形成对照。', 'It is the second political core of the sequel and should be framed against Heavenly Court.', ['heavenly-court', 'reincarnation-law', 'reincarnation-palace-strongholds'], 'high'),
    item('true-word-sect', '真言门', 'True Word Sect', 'Zhenyan Men', '仙界篇历史线', 'Immortal World historical thread', '与真言化轮经、时间法则和仙界篇历史传承相关的关键宗门。', 'A key sect tied to the Mantra Wheel Scripture, time law, and historical inheritance in the sequel.', '它是理解仙界篇时间法则线索的重要背景页。', 'It is essential background for the sequel time-law thread.', ['mantra-wheel-scripture', 'mantra-sect-ruins', 'time-law'], 'high'),
    item('nine-origin-temple', '九元观', 'Nine Origin Temple', 'Jiuyuan Guan', '仙界篇', 'Immortal World Arc', '仙界篇高阶势力之一，可放在仙界宗门和道祖相关势力组中。', 'A high-level sequel faction suited to the immortal sect and Dao Ancestor faction group.', '第一批先建立条目，后续补主要人物、法则路线和关键事件。', 'This batch creates the entry; later passes should add figures, law path, and key events.', ['dao-ancestor-system', 'three-thousand-daos'], 'medium')
  ],
  races: [
    item('human-race', '人族', 'Human Race', 'Renzu', '全书', 'Whole series', '韩立所属族群，也是人界、灵界和仙界叙事的主要视角之一。', 'Han Li race and one of the main viewpoints across the mortal, spirit, and immortal worlds.', '从人族出发可以串起宗门制度、天渊城防线和飞升后的身份变化。', 'The human-race page links sect institutions, Heavenly Abyss City defense, and post-ascension identity changes.', ['heavenly-abyss-city', 'mortal-realm'], 'high'),
    item('demon-race', '妖族', 'Demon Race', 'Yaozu', '人界至灵界', 'Mortal to Spirit Realm', '由妖兽、化形妖修和高阶妖族构成的重要族群体系。', 'A major race system composed of demonic beasts, transformed cultivators, and high-level demon peoples.', '它连接妖丹、灵兽、真灵血脉和人妖冲突。', 'It links demon cores, spirit beasts, true-spirit bloodlines, and human-demon conflict.', ['demon-core', 'true-spirits'], 'high'),
    item('devil-race', '魔族', 'Devil Race', 'Mozu', '魔界相关', 'Devil Realm related', '魔界、魔气、魔功和跨界战争相关的核心族群。', 'The core race tied to the Devil Realm, devilish Qi, devil arts, and cross-realm war.', '适合与古魔、梵圣真魔功、魔晶和魔劫大线互链。', 'It should cross-link with ancient devils, the Brahma Saint True Demon Art, devil crystals, and devil calamity arcs.', ['ancient-devils', 'fansheng-true-demon-art', 'devil-calamity'], 'high'),
    item('ancient-devils', '古魔', 'Ancient Devils', 'Gumo', '人界至魔界线', 'Mortal to Devil Realm thread', '比普通魔族更具远古威胁感的魔道存在。', 'A more ancient and threatening devilish presence than ordinary devil-race figures.', '它强化了《凡人》早中期对异界、封印和远古遗留的恐惧。', 'It strengthens the series early-middle fear of other realms, seals, and ancient remnants.', ['devil-race', 'demon-realm'], 'high'),
    item('spirit-race', '灵族', 'Spirit Race', 'Lingzu', '灵界', 'Spirit Realm', '灵界多族格局中的重要族群之一。', 'One of the important peoples in the multi-race structure of the Spirit Realm.', '用于说明灵界不再是单一人族地图，而是多族、边境和资源争夺并存。', 'It shows the Spirit Realm as a multi-race map with borders, resources, and conflicts.', ['spirit-realm', 'human-race'], 'medium'),
    item('flying-spirit-race', '飞灵族', 'Flying Spirit Race', 'Feiling Zu', '灵界', 'Spirit Realm', '灵界篇中具有鲜明族群特征的分支设定。', 'A Spirit Realm race branch with distinctive traits.', '后续可细分天鹏族等分支，补充试炼、血脉和族群制度。', 'Later passes can split branches such as the Tianpeng Race and add trials, bloodlines, and institutions.', ['tianpeng-race', 'spirit-realm'], 'medium'),
    item('tianpeng-race', '天鹏族', 'Tianpeng Race', 'Tianpeng Zu', '灵界', 'Spirit Realm', '飞灵族相关分支，可与真灵血脉、速度和羽族意象相连。', 'A branch related to the Flying Spirit Race, linked to true-spirit bloodlines, speed, and avian imagery.', '第一批先作索引，后续补相关人物和事件。', 'This seed creates the index; later passes should add figures and events.', ['flying-spirit-race', 'true-spirits'], 'medium'),
    item('true-spirits', '真灵', 'True Spirits', 'Zhenling', '灵界至仙界', 'Spirit to Immortal Realm', '接近神话级生灵的高阶血脉存在，对炼体、血脉和族群传说影响很大。', 'Mythic high-level beings whose bloodlines influence body refinement, lineage, and racial legends.', '它是解释惊蛰变化、血脉力量和高阶妖族威压的关键总入口。', 'It is the key hub for transformations, bloodline power, and high-level demon-race pressure.', ['bright-king-art', 'fansheng-true-demon-art'], 'high'),
    item('gray-immortals', '灰仙', 'Gray Immortals', 'Huixian', '仙界篇灰界阶段', 'Immortal World Gray Realm arc', '灰界相关族群或存在类型，呈现不同于仙界正统修士的生态。', 'A Gray Realm people or existence type, presenting an ecology distinct from orthodox immortal cultivators.', '它是灰界专题的核心族群页，后续应补制度、修炼方式和代表角色。', 'It is the core race page for the Gray Realm topic; later passes should add institutions, cultivation modes, and figures.', ['gray-realm', 'gray-realm-materials', 'gray-realm-law'], 'high'),
    item('mayfly-race', '蜉蝣族', 'Mayfly Race', 'Fuyou Zu', '灵界', 'Spirit Realm', '灵界多族格局中较有辨识度的族群之一。', 'One of the more recognizable peoples in the Spirit Realm multi-race setting.', '先作为灵界族群索引收录，后续补势力层级和相关事件。', 'Included as a Spirit Realm race index; later passes should add power hierarchy and events.', ['spirit-realm'], 'medium')
  ],
  regions: [
    item('mortal-realm', '人界', 'Mortal Realm', 'Renjie', '前传主体', 'Main original-series stage', '《凡人修仙传》前传主体舞台，包含山村、江湖门派、修仙宗门、秘境和国家区域。', 'The main stage of the original novel, spanning villages, martial sects, cultivation sects, secret realms, and regional states.', '这是所有低阶资源、宗门生态和凡人流成长的基础地图。', 'This is the base map for low-level resources, sect ecology, and mortal-flow growth.', ['qixuan-men', 'huangfeng-valley'], 'high'),
    item('heavenly-south-region', '天南', 'Heavenly South', 'Tiannan', '人界早中期', 'Mortal Realm early-middle arc', '韩立早期修仙活动的重要区域，承载越国七派和区域修士格局。', 'An important early cultivation region, carrying the Yue sects and regional cultivator landscape.', '适合与黄枫谷、掩月宗、返回天南等条目互链。', 'Best linked with Yellow Maple Valley, Masking Moon Sect, and the return-to-Heavenly-South thread.', ['huangfeng-valley', 'return-to-heavenly-south'], 'high'),
    item('chaotic-star-sea', '乱星海', 'Chaotic Star Sea', 'Luanxing Hai', '人界中期', 'Mortal Realm middle arc', '海域、岛屿、秘境和高阶势力混杂的重要区域。', 'A key maritime region of islands, secret realms, and competing high-level factions.', '它把地图从大陆宗门扩展到海域秩序、商业和联盟战争。', 'It expands the map from continental sects into maritime order, commerce, and alliance warfare.', ['star-palace', 'anti-star-alliance', 'xutian-cauldron'], 'high'),
    item('great-jin-region', '大晋', 'Great Jin', 'Dajin', '人界后期', 'Mortal Realm late arc', '人界后期更高密度、更大尺度的修仙区域。', 'A denser and larger late-stage Mortal Realm cultivation region.', '用于承接韩立从天南到更广阔人界格局的过渡。', 'It carries Han Li transition from Heavenly South into a wider Mortal Realm structure.', ['great-jin-factions', 'great-jin-journey'], 'high'),
    item('spirit-realm', '灵界', 'Spirit Realm', 'Lingjie', '飞升后', 'After ascension', '飞升后进入的更高层世界，具有多族并存、资源升级和边境冲突。', 'A higher world after ascension, featuring many races, upgraded resources, and border conflicts.', '它使《凡人》从人界求生转为跨族、跨域和更高阶力量体系。', 'It shifts RMJI from Mortal Realm survival into multi-race, cross-region, higher-power systems.', ['spirit-realm-ascension', 'heavenly-abyss-city', 'spirit-race'], 'high'),
    item('demon-realm', '魔界', 'Devil Realm', 'Mojie', '魔界线', 'Devil Realm thread', '魔族、魔气、魔晶和跨界冲突所属的大界域。', 'The realm of devil races, devilish Qi, devil crystals, and cross-realm conflict.', '它是理解魔劫、古魔和魔功资源的重要地图页。', 'It is essential for understanding devil calamities, ancient devils, and devil-art resources.', ['devil-race', 'devil-crystal', 'devil-calamity'], 'high'),
    item('small-spirit-heaven', '小灵天', 'Small Spirit Heaven', 'Xiao Lingtian', '灵界相关', 'Spirit Realm related', '介于特殊空间、秘境与高层世界之间的区域概念。', 'A region concept between special space, secret realm, and higher-world pocket domain.', '先建立空间索引，后续补具体进入方式、资源和相关人物。', 'This seed creates the spatial index; later passes should add access, resources, and figures.', ['spirit-realm'], 'medium'),
    item('immortal-realm', '仙界', 'Immortal Realm', 'Xianjie', '仙界篇', 'Immortal World Arc', '《凡人修仙之仙界篇》的主体高层世界，围绕仙人境界、法则和大势力展开。', 'The main higher world of the sequel, centered on immortal realms, laws, and great factions.', '它是仙界篇所有宗门、天庭、轮回殿、灰界和法则词条的总地图。', 'It is the main map for sequel sects, Heavenly Court, Reincarnation Palace, Gray Realm, and law entries.', ['immortal-realm-opening', 'heavenly-court', 'reincarnation-palace'], 'high'),
    item('north-cold-immortal-domain', '北寒仙域', 'North Cold Immortal Domain', 'Beihan Xianyu', '仙界篇早期', 'Early Immortal World Arc', '仙界篇早期关键区域，承接韩立进入仙界后的宗门、仙宫和逃亡线。', 'A key early sequel region carrying Han Li post-entry sect, palace, and pursuit threads.', '适合与烛龙道、北寒仙宫和黑风海域共同构成仙界篇早期地图。', 'Best grouped with Candle Dragon Dao, North Cold Immortal Palace, and Black Wind Sea.', ['candle-dragon-dao', 'north-cold-immortal-palace', 'black-wind-sea'], 'high'),
    item('black-wind-sea', '黑风海域', 'Black Wind Sea', 'Heifeng Haiyu', '仙界篇早期', 'Early Immortal World Arc', '仙界篇早期带有边地、海域和流亡色彩的区域。', 'An early sequel region with borderland, maritime, and fugitive-route flavor.', '后续可补岛屿、势力和具体事件，当前先作为早期地图节点。', 'Later passes can add islands, factions, and events; this batch records the early map node.', ['north-cold-immortal-domain', 'immortal-realm-opening'], 'medium'),
    item('gray-realm', '灰界', 'Gray Realm', 'Huijie', '仙界篇中后期', 'Immortal World middle-late arc', '仙界篇重要异质界域，拥有不同生态、族群和材料体系。', 'An important heterogeneous realm in the sequel with distinct ecology, peoples, and material systems.', '这是用户特别提到的重点页，后续应继续扩充灰仙、灰界势力、地理和法则差异。', 'This is a user-requested focus page; later passes should expand gray immortals, factions, geography, and law differences.', ['gray-immortals', 'gray-realm-materials', 'gray-realm-law'], 'high'),
    item('mantra-sect-ruins', '真言门遗迹', 'True Word Sect Ruins', 'Zhenyan Men Yiji', '仙界篇历史线', 'Immortal World historical thread', '承载真言门传承、时间法则线索和历史谜团的遗迹类地点。', 'A ruin location carrying True Word Sect inheritance, time-law clues, and historical mysteries.', '它连接功法、宗门和时间法则，是仙界篇考古式叙事的重要入口。', 'It links arts, sects, and time law, serving as a hub for the sequel archaeological mystery style.', ['true-word-sect', 'mantra-wheel-scripture', 'time-law'], 'high'),
    item('heavenly-court-territory', '天庭统辖区', 'Heavenly Court Territory', 'Tianting Tongxiaqu', '仙界篇', 'Immortal World Arc', '天庭秩序影响下的仙界政治空间总称。', 'A hub term for immortal-world political spaces under Heavenly Court influence.', '可用于组织天庭、仙宫、追捕制度和官方权力网络。', 'It organizes Heavenly Court, immortal palaces, pursuit systems, and official power networks.', ['heavenly-court', 'north-cold-immortal-palace'], 'medium'),
    item('reincarnation-palace-strongholds', '轮回殿据点', 'Reincarnation Palace Strongholds', 'Lunhui Dian Judian', '仙界篇', 'Immortal World Arc', '轮回殿相关活动空间的总入口。', 'A hub for activity spaces related to Reincarnation Palace.', '先建立地理索引，后续可补具体据点名称、人物和行动路线。', 'This creates the geography index; later passes can add named strongholds, figures, and routes.', ['reincarnation-palace', 'reincarnation-law'], 'medium')
  ],
  laws: [
    item('time-law', '时间法则', 'Law of Time', 'Shijian Faze', '仙界篇核心', 'Immortal World core', '仙界篇最核心的法则线之一，与真言化轮经、时间道祖和高阶斗争密切相关。', 'One of the sequel core law threads, tied to the Mantra Wheel Scripture, time-path authority, and high-level conflict.', '它应作为仙界篇专题的第一法则页，关联掌天瓶、真言门、炼神术等重点词条。', 'It should be the first law page for the sequel, linked to the green bottle, True Word Sect, and Spirit Refining Art.', ['zhangtian-bottle', 'mantra-wheel-scripture', 'true-word-sect'], 'high'),
    item('reincarnation-law', '轮回法则', 'Law of Reincarnation', 'Lunhui Faze', '仙界篇核心', 'Immortal World core', '与轮回殿、神魂、生死循环和身份谜团相关的高阶法则。', 'A high-level law tied to Reincarnation Palace, souls, life-death cycles, and identity mysteries.', '它与时间法则共同构成仙界篇最重要的哲学冲突。', 'Together with time law, it forms one of the sequel most important philosophical conflicts.', ['reincarnation-palace', 'weeping-soul-beast', 'soul-nurturing-wood'], 'high'),
    item('space-law', '空间法则', 'Law of Space', 'Kongjian Faze', '高阶通用', 'High-level recurring', '与传送、秘境、界面通道和高阶斗法位置控制相关。', 'A law tied to teleportation, secret realms, realm passages, and high-level positional control.', '它能把人界秘境、灵界飞升、仙界跨域移动统一起来解释。', 'It helps explain secret realms, ascension, and cross-domain movement under one framework.', ['spirit-realm-ascension', 'immortal-realm'], 'medium'),
    item('five-elements-law', '五行法则', 'Law of Five Elements', 'Wuxing Faze', '全体系', 'Whole system', '金木水火土的属性体系在法则层面的高阶表达。', 'The law-level expression of metal, wood, water, fire, and earth attributes.', '它能连接元磁神光、庚精、水衍四时诀和大五行幻世诀。', 'It links Magnetic Divine Light, Geng Metal, Water Derivation Four Seasons Art, and the Great Five Elements Illusory World Art.', ['magnetic-divine-light', 'geng-metal', 'great-five-elements-illusory-world'], 'medium'),
    item('sword-law', '剑道法则', 'Sword Dao Law', 'Jiandao Faze', '高阶通用', 'High-level recurring', '剑修路线在高阶体系中的法则化表达。', 'The law-level expression of sword cultivation at higher stages.', '它可作为青元剑诀、飞剑、剑阵向仙界高阶规则过渡的桥。', 'It bridges Azure Essence Sword Art, flying swords, and sword formations into higher immortal-world rules.', ['qingyuan-sword-art', 'sword-array-method'], 'medium'),
    item('thunder-law', '雷电法则', 'Thunder Law', 'Leidian Faze', '高阶通用', 'High-level recurring', '雷属性能力在仙界层面的规则化表达。', 'The law-level expression of thunder-attribute abilities in the immortal system.', '适合与金雷竹、辟邪神雷、风雷翅和惊蛰变化相关联。', 'Best linked with Golden Thunder Bamboo, evil-warding thunder, Wind-Thunder Wings, and Jingzhe transformations.', ['golden-thunder-bamboo', 'evil-warding-divine-thunder', 'wind-thunder-wings'], 'medium'),
    item('dao-ancestor-system', '道祖体系', 'Dao Ancestor System', 'Daozu Tixi', '仙界篇高阶', 'High-level sequel', '仙界篇顶层权力和法则归属的重要设定框架。', 'An important sequel framework for top-level authority and law ownership.', '它将个人修炼和宇宙秩序连接起来，是天庭、轮回殿和三千大道的上层结构。', 'It connects personal cultivation with cosmic order, sitting above Heavenly Court, Reincarnation Palace, and the great daos.', ['heavenly-court', 'reincarnation-palace', 'three-thousand-daos'], 'high'),
    item('three-thousand-daos', '三千大道', 'Three Thousand Great Daos', 'Sanqian Dadao', '仙界篇高阶', 'High-level sequel', '仙界篇对大量法则、道途和修炼终局的总称式表达。', 'A broad sequel expression for many laws, dao paths, and cultivation endpoints.', '它是组织法则类词条的总目录，可继续拆分时间、轮回、空间、五行等。', 'It is the master index for law entries and can split into time, reincarnation, space, five elements, and more.', ['time-law', 'reincarnation-law', 'space-law', 'five-elements-law'], 'high'),
    item('law-thread', '法则之丝', 'Law Threads', 'Faze Zhisi', '仙界篇', 'Immortal World Arc', '用于表现法则感悟、凝练和操控程度的细分概念。', 'A detailed concept for expressing law comprehension, condensation, and control.', '第一批作为仙界篇术语骨架，后续补具体境界和斗法表现。', 'Included as a sequel terminology seed; later passes should add realm mechanics and combat usage.', ['time-law', 'three-thousand-daos'], 'verify'),
    item('gray-realm-law', '灰界法则', 'Gray-Realm Laws', 'Huijie Faze', '仙界篇灰界阶段', 'Immortal World Gray Realm arc', '用于概括灰界环境与仙界常规法则差异的专题条目。', 'A topic entry summarizing differences between Gray Realm environment and ordinary immortal-world law systems.', '它服务灰界地图、灰仙族群和灰界材料三大页面。', 'It supports the Gray Realm map, gray immortal race, and gray materials pages.', ['gray-realm', 'gray-immortals', 'gray-realm-materials'], 'verify')
  ],
  characters: [
    item('han-li', '韩立', 'Han Li', 'Han Li', '全书主角', 'Whole-series protagonist', '《凡人修仙传》和仙界篇的主角，以谨慎、耐心、资源经营和底牌管理著称。', 'The protagonist of RMJI and the Immortal World Arc, known for caution, patience, resource management, and hidden trump cards.', '韩立是凡人流的核心样本：低起点、慢积累、重风险评估，不靠热血莽撞推进主线。', 'Han Li is the core mortal-flow model: low starting point, slow accumulation, risk assessment, and practical choices over reckless heroics.', ['zhangtian-bottle', 'qingyuan-sword-art', 'green-bamboo-cloudswarm-swords'], 'high'),
    item('nangong-wan', '南宫婉', 'Nangong Wan', 'Nangong Wan', '人界至后续主线', 'Mortal Realm and later main thread', '韩立生命中极重要的道侣人物，牵动人界情感线和长期因果。', 'A crucial dao-companion figure in Han Li life, shaping emotional threads and long-running karmic ties.', '她让《凡人》在冷静求生之外保留情感重量，也让韩立的选择不只围绕资源和境界。', 'She gives the series emotional weight beyond survival and resources, making Han Li choices more than realm advancement.', ['masking-moon-sect', 'han-li'], 'high'),
    item('doctor-mo', '墨大夫', 'Doctor Mo', 'Mo Dafu', '人界开篇', 'Opening Mortal Realm arc', '韩立早期命运的关键人物，将江湖、医术、阴谋和修仙门槛连接起来。', 'A key early figure who connects martial society, medicine, schemes, and the threshold of cultivation.', '墨大夫让开篇从普通江湖迅速转向残酷修仙逻辑，是韩立谨慎性格形成的重要压力源。', 'Doctor Mo shifts the opening from martial society into cruel cultivation logic and pressures Han Li into caution.', ['qixuan-men-entry', 'changchun-gong', 'qixuan-men'], 'high'),
    item('li-feiyu', '厉飞雨', 'Li Feiyu', 'Li Feiyu', '人界开篇', 'Opening Mortal Realm arc', '韩立早期好友之一，代表凡人江湖线与主角修仙道路的分岔。', 'One of Han Li early friends, representing the split between mortal martial life and cultivation.', '他帮助读者感受到韩立不是一开始就属于修仙界，而是逐渐离开凡俗关系网。', 'He reminds readers that Han Li does not begin as part of the cultivation world, but gradually leaves mortal ties behind.', ['qixuan-men-entry', 'han-li'], 'high'),
    item('zhang-tie', '张铁', 'Zhang Tie', 'Zhang Tie', '人界开篇', 'Opening Mortal Realm arc', '韩立早期同伴之一，承载七玄门阶段的残酷成长记忆。', 'An early companion of Han Li who carries the harsh memory of the Qixuanmen stage.', '他适合与墨大夫、七玄门和早期生存危机共同阅读。', 'Read him with Doctor Mo, Qixuanmen, and early survival pressure.', ['qixuan-men', 'doctor-mo', 'han-li'], 'medium'),
    item('chen-qiaoqian', '陈巧倩', 'Chen Qiaoqian', 'Chen Qiaoqian', '人界早期', 'Early Mortal Realm arc', '黄枫谷相关人物，体现早期宗门人情、任务和错过的情感线。', 'A Yellow Maple Valley-related figure reflecting early sect ties, missions, and missed emotional possibilities.', '她的条目适合补充黄枫谷时期的宗门日常和韩立的人际疏离感。', 'Her entry helps enrich Yellow Maple Valley daily life and Han Li emotional distance.', ['huangfeng-valley', 'yellow-maple-cultivation', 'han-li'], 'medium'),
    item('xin-ruyin', '辛如音', 'Xin Ruyin', 'Xin Ruyin', '人界早中期', 'Early-middle Mortal Realm arc', '与阵法、禁制和早期支线因果相关的重要人物。', 'An important figure tied to formations, restrictions, and early side-plot karma.', '她适合作为阵法体系的人物入口，连接齐云霄、阵旗阵盘和韩立后续因果。', 'She works as a character gateway into formation systems, linking Qi Yunxiao, formation tools, and later karma.', ['formation-flags', 'han-li'], 'high'),
    item('qi-yunxiao', '齐云霄', 'Qi Yunxiao', 'Qi Yunxiao', '人界早中期', 'Early-middle Mortal Realm arc', '与辛如音关系密切的人物，补足阵法支线的人情面。', 'A figure closely tied to Xin Ruyin, adding human texture to the formation side thread.', '他的页面可用来整理低阶修士在残酷修仙界中的情义、无力和遗憾。', 'His page can organize loyalty, helplessness, and regret among lower-level cultivators.', ['xin-ruyin', 'formation-flags'], 'medium'),
    item('yuan-yao', '元瑶', 'Yuan Yao', 'Yuan Yao', '乱星海至后续', 'Chaotic Star Sea and later', '乱星海阶段重要女性角色之一，与鬼道、阴冥线索和长期重逢感有关。', 'An important female character from the Chaotic Star Sea thread, tied to ghost-path and underworld-like motifs.', '她把乱星海支线延展为更长的因果链，不只是一次性地区人物。', 'She extends the Chaotic Star Sea side thread into long-term karmic continuity.', ['chaotic-star-sea', 'weeping-soul-beast', 'reincarnation-law'], 'high'),
    item('zi-ling', '紫灵', 'Zi Ling', 'Zi Ling', '乱星海至后续', 'Chaotic Star Sea and later', '与乱星海、妙音门和韩立长期交集相关的代表性人物，后续与韩立情感线收束为道侣关系。', 'A representative figure tied to the Chaotic Star Sea, Miao Yin Sect, and long-running intersections with Han Li, eventually becoming part of Han Li dao-companion thread.', '她适合连接乱星海商业势力、身份伪装、魔界/仙界重逢和最终道侣关系。', 'She links maritime commercial factions, hidden identities, later reunions, and the final dao-companion relationship.', ['miao-yin-sect', 'chaotic-star-sea', 'han-li'], 'high'),
    item('silvermoon', '银月', 'Silvermoon', 'Yinyue', '人界至灵界', 'Mortal to Spirit Realm', '与器灵、妖族和灵界身份线索相关的重要伙伴型角色。', 'An important companion-like figure tied to artifact-spirit motifs, demon-race identity, and Spirit Realm threads.', '银月让法宝、元神、妖族身份和跨界重逢形成同一条长线。', 'Silvermoon connects treasures, souls, demon-race identity, and cross-realm reunion into one long thread.', ['demon-race', 'spirit-realm', 'artifact'], 'high'),
    item('dayan-divine-lord', '大衍神君', 'Great Development Divine Lord', 'Dayan Shenjun', '人界中期', 'Middle Mortal Realm arc', '大衍诀、傀儡术和神识体系背后的关键传承人物。', 'The key inheritance figure behind the Great Development Art, puppet arts, and divine-sense systems.', '他是技术型修仙的代表，能把功法、傀儡和神识控制三类词条聚合起来。', 'He represents technical cultivation and gathers arts, puppets, and divine-sense control into one node.', ['great-development-art', 'puppet', 'formation-flags'], 'high'),
    item('xiang-zhili', '向之礼', 'Xiang Zhili', 'Xiang Zhili', '人界中后期', 'Middle-late Mortal Realm arc', '人界高阶修士代表之一，展示隐藏高手和飞升门槛的存在感。', 'A representative high-level Mortal Realm cultivator, showing hidden experts and ascension thresholds.', '他帮助读者理解人界并非只有主角成长线，还有老怪、飞升压力和高阶圈层。', 'He shows that the Mortal Realm also contains old monsters, ascension pressure, and high-level circles.', ['spirit-realm-ascension', 'great-jin-region'], 'medium'),
    item('linghu-ancestor', '令狐老祖', 'Linghu Ancestor', 'Linghu Laozu', '人界早中期', 'Early-middle Mortal Realm arc', '黄枫谷高阶人物之一，代表宗门背后的高层保护和权衡。', 'A high-level Yellow Maple Valley figure representing senior protection and institutional tradeoffs.', '适合补充韩立早期宗门不是扁平背景，而有老祖、长老和利益决策。', 'He helps show the early sect as an institution with ancestors, elders, and interest-based decisions.', ['huangfeng-valley', 'yellow-maple-cultivation'], 'medium'),
    item('li-huayuan', '李化元', 'Li Huayuan', 'Li Huayuan', '人界早期', 'Early Mortal Realm arc', '韩立在黄枫谷阶段相关的师门人物之一。', 'A sect-lineage figure connected to Han Li Yellow Maple Valley stage.', '他的页面用于补足师承、弟子身份和宗门内部层级。', 'His page helps fill mentorship, disciple status, and sect hierarchy.', ['huangfeng-valley', 'han-li'], 'medium'),
    item('hongfu', '红拂', 'Hong Fu', 'Hongfu', '人界早期', 'Early Mortal Realm arc', '黄枫谷相关高阶女修之一，可用于补充早期宗门人物版图。', 'A high-level female cultivator related to Yellow Maple Valley, useful for completing the early sect character map.', '第一批人物页先建立索引，后续可补具体事件和人物关系。', 'This first character pass creates the index; later passes can add events and relationships.', ['huangfeng-valley'], 'medium'),
    item('xuan-gu', '玄骨上人', 'Master Xuan Gu', 'Xuangu Shangren', '乱星海', 'Chaotic Star Sea arc', '乱星海阶段重要敌对或危险人物之一，带有老怪、夺舍和秘宝争夺色彩。', 'An important dangerous figure in the Chaotic Star Sea arc, tied to old-monster, possession, and treasure-conflict motifs.', '他适合与虚天鼎、乱星海和早期高阶斗智桥段互链。', 'He fits links with the Void Heaven Cauldron, Chaotic Star Sea, and early high-level scheming.', ['xutian-cauldron', 'chaotic-star-sea'], 'high'),
    item('jiyin-ancestor', '极阴祖师', 'Jiyin Ancestor', 'Jiyin Zushi', '乱星海', 'Chaotic Star Sea arc', '乱星海高阶魔道人物之一，代表海域阶段的强压迫感。', 'A high-level demonic-path figure in the Chaotic Star Sea arc, representing its oppressive danger.', '可与玄骨上人、虚天鼎和逆星盟区域冲突共同整理。', 'Can be organized with Master Xuan Gu, the Void Heaven Cauldron, and regional conflict.', ['xuan-gu', 'xutian-cauldron', 'anti-star-alliance'], 'medium'),
    item('wen-tianren', '温天仁', 'Wen Tianren', 'Wen Tianren', '乱星海', 'Chaotic Star Sea arc', '乱星海重要年轻强者之一，用于展示同辈压力和海域势力继承。', 'An important young expert in the Chaotic Star Sea arc, showing peer pressure and maritime faction inheritance.', '他的词条可增强乱星海人物层次，不只写老怪和宗门。', 'His entry adds character layering to the Chaotic Star Sea beyond old monsters and sects.', ['chaotic-star-sea', 'star-palace'], 'medium'),
    item('ling-yuling', '凌玉灵', 'Ling Yuling', 'Ling Yuling', '乱星海', 'Chaotic Star Sea arc', '星宫相关代表人物之一，承接乱星海秩序和继承线索。', 'A representative Star Palace-related figure carrying order and inheritance threads in the Chaotic Star Sea.', '适合与星宫、逆星盟、天星双圣等势力人物关系继续扩写。', 'Best expanded with Star Palace, Anti-Star Alliance, and the Star Palace senior-power structure.', ['star-palace', 'chaotic-star-sea'], 'medium'),
    item('ice-phoenix', '冰凤', 'Ice Phoenix', 'Bingfeng', '人界至灵界', 'Mortal to Spirit Realm', '与妖族、真灵血脉和跨界身份线索相关的重要角色。', 'An important figure tied to demon-race identity, true-spirit bloodlines, and cross-realm threads.', '她可与银月、妖族、真灵和灵界多族格局形成角色组。', 'She can form a character group with Silvermoon, demon races, true spirits, and Spirit Realm peoples.', ['silvermoon', 'demon-race', 'true-spirits'], 'medium'),
    item('baohua', '宝花', 'Baohua', 'Baohua', '灵界至魔界线', 'Spirit to Devil Realm thread', '魔族高阶人物之一，适合放在魔界、魔族和高阶女性强者专题中。', 'A high-level devil-race figure suited to Devil Realm, devil race, and powerful female cultivator topics.', '她能把魔族从单纯敌对群体写成立场复杂、层级分明的阵营。', 'She helps present devil races as layered factions with complex positions, not only enemies.', ['devil-race', 'demon-realm', 'devil-calamity'], 'medium'),
    item('yuan-cha', '元刹圣祖', 'Yuan Cha Sacred Ancestor', 'Yuancha Shengzu', '灵界至魔界线', 'Spirit to Devil Realm thread', '魔族圣祖级人物之一，代表跨界魔族压力和高阶魔功线索。', 'A sacred-ancestor-level devil figure representing cross-realm devil pressure and high-level devil arts.', '适合与古魔、魔界、魔晶和梵圣真魔功互链。', 'Best linked with ancient devils, Devil Realm, devil crystals, and the Brahma Saint True Demon Art.', ['devil-race', 'ancient-devils', 'fansheng-true-demon-art'], 'medium'),
    item('six-extremes', '六极圣祖', 'Six Extremes Sacred Ancestor', 'Liuji Shengzu', '灵界至魔界线', 'Spirit to Devil Realm thread', '魔族圣祖级人物，围绕分身、魔界势力和宝花/元刹等圣祖关系展开。', 'A Sacred-Ancestor-level devil figure tied to avatars, Devil Realm power politics, and Baohua / Yuan Cha relations.', '她代表魔界高层的分身布局和势力角力，不应只作为普通魔族强者处理。', 'She represents avatar-based schemes and Devil Realm politics, not a generic devil powerhouse.', ['devil-race', 'demon-realm', 'avatar-clone-art'], 'high'),
    item('crab-daoist', '蟹道人', 'Crab Daoist', 'Xie Daoren', '灵界至仙界篇', 'Spirit Realm to Immortal World Arc', '韩立在魔界远行后获得的顶级仙傀级战力，仙界篇进一步揭出石空解、积鳞空境和傀儡大道身世。', 'A top immortal-puppet-level ally Han Li gains after the Devil Realm journey; the sequel reveals Shi Kongjie, Accumulated Scale Realm, and puppet-Dao identity threads.', '蟹道人连接魔界洗灵池、仙傀、雷法、傀儡核心、石穿空家族和仙界篇高阶复生线。', 'Crab Daoist links the Devil Realm cleansing pool, immortal puppets, thunder methods, puppet cores, Shi Chuankong family ties, and sequel resurrection threads.', ['puppet', 'immortal-puppet', 'shi-chuankong', 'accumulated-scale-realm'], 'high'),
    item('golden-child', '金童', 'Golden Child', 'Jintong', '仙界篇', 'Immortal World Arc', '由韩立长期培育的噬金虫王延伸出的仙界篇核心伙伴，后续牵动噬金仙体系和吞噬法则高阶旧账。', 'A core sequel companion grown from Han Li long-nurtured Gold-Devouring Beetle King, later tied to the Gold-Devouring Immortal system and high-level devouring-law karma.', '她既是战力伙伴，也是灵虫养成线升级到大道因果的关键角色。', 'She is both a combat companion and the key upgrade from spirit-insect cultivation into great-Dao karma.', ['gold-devouring-beetles', 'gold-devouring-beetle-king', 'devouring-law'], 'high'),
    item('weeping-soul-character', '啼魂', 'Weeping Soul', 'Tihun', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '由元瑶赠予韩立的啼魂兽成长为长期伙伴，专克阴魂鬼物，仙界篇牵出刑兽与冥王转世线。', 'The Weeping Soul Beast given to Han Li by Yuan Yao grows into a long-term companion, counters souls and ghosts, and later reveals punishment-beast / Nether King reincarnation threads.', '她把乱星海、阴冥之地、灵界魂魄线和仙界轮回/冥界线串成一条长因果。', 'She ties Chaotic Star Sea, underworld spaces, Spirit Realm soul threads, and sequel reincarnation / netherworld karma into one long thread.', ['weeping-soul-beast', 'yuan-yao', 'reincarnation-law', 'ghost-path-arts'], 'high'),
    item('shi-chuankong', '石穿空', 'Shi Chuankong', 'Shi Chuankong', '仙界篇', 'Immortal World Arc', '仙界篇重要同行者，真实背景牵连魔域皇族、积鳞空境、灰界远行和蟹道人石空解身世。', 'An important sequel companion whose background connects the Devil Domain royal line, Accumulated Scale Realm, Gray Realm journey, and Crab Daoist / Shi Kongjie identity.', '他的页面用于串联仙界篇中“同行者”与魔域政治、灰界地图、空间法则家族线。', 'His page ties a companion role to Devil Domain politics, the Gray Realm map, and space-law family threads.', ['immortal-realm-opening', 'gray-realm', 'crab-daoist', 'accumulated-scale-realm'], 'high'),
    item('jiao-san', '蛟三', 'Jiao San', 'Jiao San', '仙界篇', 'Immortal World Arc', '轮回殿核心人物之一，身份牵连轮回殿主、南宫婉前世因果和任务网络，不应只写成普通联络人。', 'A core Reincarnation Palace figure whose identity is tied to the Palace Master, Nangong Wan past-life karma, and mission networks.', '她应与轮回殿主、南宫婉、轮回法则和仙界政治暗线一起阅读。', 'Read her with the Reincarnation Palace Master, Nangong Wan, reincarnation law, and hidden immortal-world politics.', ['reincarnation-palace', 'reincarnation-law', 'reincarnation-palace-master', 'nangong-wan'], 'high'),
    item('fox-three', '狐三', 'Fox Three', 'Hu San', '仙界篇', 'Immortal World Arc', '轮回殿/无常盟任务线中与韩立多次同行的人物，常与身份伪装、情报和仙界行动网络相连。', 'A Reincarnation Palace / Impermanence Alliance mission figure who travels with Han Li and is tied to disguise, intelligence, and sequel action networks.', '他补足仙界篇任务队伍的行动层，不只是泛称的同行角色。', 'He fills the operational layer of sequel mission teams rather than being a generic companion.', ['impermanence-alliance', 'reincarnation-palace', 'jiao-san'], 'high'),
    item('hot-flame-immortal', '热火仙尊', 'Hot Flame Immortal', 'Rehuo Xianzun', '仙界篇', 'Immortal World Arc', '仙界篇中与韩立早期仙界经历相关的仙人角色之一。', 'An immortal figure related to Han Li early sequel experiences.', '他的页面用于补仙界早期人脉、洞府和地域事件，后续再逐章核对细节。', 'His page helps fill early immortal-world connections, residences, and regional events; later passes can verify details.', ['north-cold-immortal-domain', 'immortal-realm-opening'], 'verify'),
    item('gan-jiuzhen', '甘九真', 'Gan Jiuzhen', 'Gan Jiuzhen', '仙界篇历史线', 'Immortal World historical thread', '仙界篇中牵动真言门、时间法则和旧史因果的人物，早期还与“蛟三”身份误认线有关。', 'A sequel figure tied to True Word Sect, time law, old-history karma, and an early mistaken-identity thread around Jiao San.', '她适合连接真言门遗迹、真言化轮经、时间法则与韩立早期仙界任务线。', 'She links True Word ruins, the Mantra Wheel Scripture, time law, and Han Li early sequel mission thread.', ['true-word-sect', 'mantra-wheel-scripture', 'time-law', 'jiao-san'], 'high'),
    item('liu-le-er', '柳乐儿', 'Liu Leer', 'Liu Leer', '仙界篇早期', 'Early Immortal World Arc', '仙界篇开局小南洲/灵寰界阶段收留失忆韩立的云狐族少女，称韩立为“石头哥哥”。', 'The young Cloud Fox girl in the sequel opening / Spirit Domain lower-interface stage who shelters amnesiac Han Li and calls him "Stone Brother".', '她承接韩立仙界篇低处重启、失忆三百年和重新找回修为的第一段人情线。', 'She anchors the sequel low-start restart, Han Li three-hundred-year memory gap, and first emotional tie while he recovers cultivation.', ['immortal-realm-opening', 'han-li', 'black-wind-sea-opening'], 'high'),
    item('time-dao-ancestor', '时间道祖', 'Time Dao Ancestor', 'Shijian Daozu', '仙界篇高阶', 'High-level sequel', '与时间法则、真言门历史和仙界顶层秩序相关的高阶存在。', 'A high-level existence tied to time law, True Word Sect history, and top-level immortal order.', '此页先做轻剧透概览，后续可在法则终局批次中详细拆分。', 'This page keeps a spoiler-light overview first; later final-law batches can split details.', ['time-law', 'dao-ancestor-system', 'true-word-sect'], 'verify'),
    item('reincarnation-palace-master', '轮回殿主', 'Reincarnation Palace Master', 'Lunhui Dianzhu', '仙界篇高阶', 'High-level sequel', '轮回殿最高层人物，牵动轮回法则、南宫婉前世、蛟三身世和对抗天庭的主线。', 'The top Reincarnation Palace figure tied to reincarnation law, Nangong Wan past-life karma, Jiao San identity, and resistance against Heavenly Court.', '此页属于强剧透核心人物，应按轮回法则、天庭冲突和终局因果详细标注。', 'This is a major spoiler-core figure and should be documented through reincarnation law, Heavenly Court conflict, and endgame karma.', ['reincarnation-palace', 'reincarnation-law', 'heavenly-court', 'jiao-san', 'nangong-wan'], 'high'),
    item('gray-realm-figures', '灰界人物群像', 'Gray Realm Figures', 'Huijie Renwu Qunxiang', '仙界篇灰界阶段', 'Immortal World Gray Realm arc', '灰界阶段相关人物的总入口，用于后续继续拆分灰仙、敌手和同行者。', 'A hub for Gray Realm-related figures, to be split later into gray immortals, opponents, and companions.', '用户点名灰界后，这个页面用于承接第二批以后更细的人物和势力补全。', 'Since the Gray Realm is a requested focus, this page prepares later fine-grained character and faction expansion.', ['gray-realm', 'gray-immortals', 'gray-realm-arc'], 'verify')
  ],
  timeline: [
    item('qixuan-men-entry', '七玄门入门', 'Entry into Qixuanmen', 'Qixuan Men Rumen', '开篇', 'Opening arc', '韩立从普通山村少年进入江湖门派，故事由此接近修仙门槛。', 'Han Li moves from ordinary village youth into a martial sect, bringing the story close to cultivation.', '这是凡人流的低起点模板，应与七玄门、长春功和墨大夫线索相连。', 'This is the low-start mortal-flow template and should link with Qixuanmen, Everlasting Spring Art, and Doctor Mo threads.', ['qixuan-men', 'changchun-gong'], 'high'),
    item('yellow-maple-cultivation', '黄枫谷修行', 'Cultivation in Yellow Maple Valley', 'Huangfeng Gu Xiuxing', '人界早期', 'Mortal Realm early arc', '韩立正式进入修仙宗门生态，面对弟子身份、任务、资源和筑基竞争。', 'Han Li formally enters sect cultivation society, facing disciple status, missions, resources, and Foundation Establishment competition.', '适合作为早期宗门制度和筑基丹经济的剧情入口。', 'It serves as the story entry for early sect systems and Foundation Establishment Pill economics.', ['huangfeng-valley', 'foundation-establishment-pill'], 'high'),
    item('chaotic-star-sea-journey', '乱星海历练', 'Chaotic Star Sea Journey', 'Luanxing Hai Lilian', '人界中期', 'Mortal Realm middle arc', '韩立离开早期宗门格局，进入海域、秘境和大势力冲突阶段。', 'Han Li leaves the early sect pattern and enters maritime, secret-realm, and great-faction conflict.', '这一阶段适合集中展示虚天鼎、星宫、逆星盟和海域生态。', 'This arc is ideal for the Void Heaven Cauldron, Star Palace, Anti-Star Alliance, and maritime ecology.', ['chaotic-star-sea', 'xutian-cauldron', 'star-palace'], 'high'),
    item('return-to-heavenly-south', '返回天南', 'Return to Heavenly South', 'Fan Hui Tiannan', '人界中后期', 'Mortal Realm middle-late arc', '韩立带着更高实力回到熟悉区域，地区格局与个人身份都发生变化。', 'Han Li returns to a familiar region with greater power, changing both local structure and personal status.', '它体现凡人流成长后的地位反转，但仍保留谨慎处理因果的风格。', 'It shows status reversal after growth while preserving cautious handling of ties and consequences.', ['heavenly-south-region', 'cloudfall-sect'], 'medium'),
    item('great-jin-journey', '大晋之行', 'Great Jin Journey', 'Dajin Zhixing', '人界后期', 'Mortal Realm late arc', '韩立进入更大的人界修仙舞台，接触更高密度的资源、势力和风险。', 'Han Li enters a larger Mortal Realm stage with denser resources, factions, and risks.', '适合承接人界后期地图升级和飞升前准备。', 'It carries the late Mortal Realm map upgrade and pre-ascension preparation.', ['great-jin-region', 'great-jin-factions'], 'high'),
    item('spirit-realm-ascension', '飞升灵界', 'Ascension to the Spirit Realm', 'Feisheng Lingjie', '飞升后', 'After ascension', '韩立跨入更高界面，原有境界、资源和敌我格局全面升级。', 'Han Li enters a higher realm, upgrading realms, resources, and conflict structures.', '这是原著从人界篇转入灵界篇的结构性门槛。', 'This is the structural threshold from the Mortal Realm portion into the Spirit Realm portion.', ['spirit-realm', 'heavenly-abyss-city'], 'high'),
    item('devil-calamity', '魔劫大线', 'Devil Calamity Thread', 'Mojie Daxian', '灵界至魔界线', 'Spirit to Devil Realm thread', '围绕魔族、魔界和跨界冲突展开的大规模压力线。', 'A large-scale pressure thread around devil races, the Devil Realm, and cross-realm conflict.', '它把个人求道推入族群战争、界面安危和大势博弈。', 'It pushes personal Dao-seeking into racial war, realm security, and great-power conflict.', ['devil-race', 'demon-realm', 'devil-crystal'], 'high'),
    item('immortal-realm-opening', '仙界篇开局', 'Opening of the Immortal World Arc', 'Xianjie Pian Kaiju', '仙界篇早期', 'Early Immortal World Arc', '韩立进入仙界篇叙事后，身份、记忆、追捕和仙界秩序构成新的开局压力。', 'After entering the sequel, identity, memory, pursuit, and immortal-world order create new opening pressures.', '这是从灵界资源体系转向仙界法则体系的第一转换点。', 'It is the first shift from Spirit Realm resource systems into Immortal World law systems.', ['immortal-realm', 'north-cold-immortal-domain'], 'high'),
    item('candle-dragon-dao-arc', '烛龙道阶段', 'Candle Dragon Dao Arc', 'Zhulong Dao Jieduan', '仙界篇早期', 'Early Immortal World Arc', '韩立在仙界组织生态中落脚、学习和卷入更大冲突的重要阶段。', 'An important stage where Han Li settles into immortal-world organization ecology, learns, and is drawn into larger conflict.', '适合与烛龙道、北寒仙域、真仙金仙境界和早期仙界任务互链。', 'Best linked with Candle Dragon Dao, North Cold domain, True/Golden Immortal levels, and early immortal missions.', ['candle-dragon-dao', 'north-cold-immortal-domain'], 'high'),
    item('gray-realm-arc', '灰界阶段', 'Gray Realm Arc', 'Huijie Jieduan', '仙界篇中后期', 'Immortal World middle-late arc', '韩立进入灰界相关叙事，接触不同生态、族群、材料和法则差异。', 'Han Li enters Gray Realm-related narrative and encounters different ecology, peoples, materials, and law differences.', '这是用户点名要重点补的阶段，后续会继续拆灰界地理、势力和人物。', 'This user-requested focus stage should later split Gray Realm geography, factions, and figures.', ['gray-realm', 'gray-immortals', 'gray-realm-materials'], 'high'),
    item('laws-final-conflict', '法则终局', 'Final Law Conflict', 'Faze Zhongju', '仙界篇后期', 'Late Immortal World Arc', '仙界篇后期围绕法则、道祖、天庭和轮回等最高层冲突展开。', 'The late sequel conflict around laws, Dao Ancestors, Heavenly Court, Reincarnation, and highest-level power.', '第一批保持概览，避免剧透过细；后续可按人物和法则路线拆分。', 'This batch keeps a spoiler-light overview; later passes can split by figures and law paths.', ['dao-ancestor-system', 'heavenly-court', 'reincarnation-palace'], 'medium')
  ]
}

const supplementalCatalog = {
  techniques: [
    item('dageng-sword-array', '大庚剑阵', 'Great Geng Sword Formation', 'Dageng Jianzhen', '人界至灵界', 'Mortal to Spirit Realm', '青竹蜂云剑和剑阵体系中的代表性高阶打法，强调成套飞剑、庚金锋锐和阵法围杀。', 'A representative high-level sword-formation method tied to the Bamboo Cloudswarm Swords, emphasizing paired blades, Geng-metal sharpness, and encirclement.', '它把韩立的飞剑从单件法宝推进为可布阵、可控场、可越阶应敌的战斗系统。', 'It turns Han Li flying swords from individual treasures into a battlefield system for control, pressure, and higher-level combat.', ['green-bamboo-cloudswarm-swords', 'qingyuan-sword-art', 'sword-law'], 'high'),
    item('puppet-refinement', '傀儡术', 'Puppet Refinement', 'Kuilei Shu', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '围绕傀儡炼制、操控、替身和阵地战展开的技术型修仙路线。', 'A technical cultivation route around crafting, controlling, and deploying puppets as scouts, decoys, and positional tools.', '它体现《凡人》里“技艺也是战力”的设定，和神识、大衍诀、材料积累密切相关。', 'It shows that craft skill is a form of combat power, closely tied to divine sense, the Great Development Art, and material stockpiling.', ['great-development-art', 'puppet', 'crab-daoist'], 'high'),
    item('formation-restrictions', '阵法禁制', 'Formations and Restrictions', 'Zhenfa Jinzhi', '全书通用', 'Whole-series recurring system', '洞府、秘境、宗门防线和遗迹探索中反复出现的规则型术法体系。', 'A recurring rule-based system used in dwellings, secret realms, sect defenses, and ancient ruins.', '阵法禁制让斗法不只看境界，也看准备、地形、破解能力和临场判断。', 'Formations make conflict depend not only on realm but also preparation, terrain, decoding skill, and judgment.', ['formation-flags', 'xin-ruyin', 'blood-forbidden-land'], 'high'),
    item('alchemy-art', '炼丹术', 'Alchemy Arts', 'Liandan Shu', '全书通用', 'Whole-series recurring system', '丹药炼制贯穿韩立的资源路线，从低阶突破丹到仙界道丹都与修炼效率相关。', 'Alchemy runs through Han Li resource path, from low-level breakthrough pills to immortal-world Dao pills.', '它是凡人流经济逻辑的核心：药材、丹方、炉鼎、火候和失败成本都会影响修炼速度。', 'It anchors mortal-flow economics: herbs, formulas, cauldrons, timing, and failure costs all affect progression.', ['pill-formulas', 'dao-pill', 'zhangtian-bottle'], 'high'),
    item('talisman-making', '制符术', 'Talisman Crafting', 'Zhifu Shu', '人界至灵界', 'Mortal to Spirit Realm', '符箓和符宝相关技艺，可在低阶阶段放大战力或提供逃遁、防护、控制手段。', 'A craft around talismans and talisman treasures that can amplify combat, escape, defense, or control at lower stages.', '它补足韩立谨慎作战的工具箱，也体现消耗品在修仙世界中的现实价值。', 'It broadens Han Li cautious toolkit and shows the practical value of consumables in a cultivation economy.', ['talisman-treasure', 'taiyi-pure-talisman'], 'medium'),
    item('beast-taming-art', '御兽术', 'Beast-Taming Arts', 'Yushou Shu', '人界至灵界', 'Mortal to Spirit Realm', '灵兽、灵虫、妖兽材料和契约控制相关的技艺路线。', 'A skill route involving spirit beasts, spirit insects, demon-beast materials, and control contracts.', '它连接噬金虫、啼魂兽、灵兽袋和妖丹资源，让“养成”成为长期战力。', 'It connects beetles, Weeping Soul, beast bags, and demon cores, making long-term nurturing a combat asset.', ['gold-devouring-beetles', 'weeping-soul-beast', 'spirit-beast-bag'], 'high'),
    item('insect-rearing-art', '灵虫培育', 'Spirit-Insect Rearing', 'Lingchong Peiyu', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '以噬金虫为代表的灵虫培养路线，强调数量、进阶、吞噬和资源投入。', 'A spirit-insect route represented by Gold-Devouring Beetles, emphasizing quantity, evolution, devouring power, and investment.', '这条线让韩立的战力具有“慢养成、后爆发”的特征。', 'It gives Han Li power curve a slow-nurture, late-blooming texture.', ['gold-devouring-beetles', 'gold-devouring-beetle-king', 'golden-child'], 'high'),
    item('spirit-eye-technique', '灵目神通', 'Spirit-Eye Abilities', 'Lingmu Shentong', '人界至灵界', 'Mortal to Spirit Realm', '用于观察禁制、识破幻术、察看灵气变化和追踪异常的辅助神通。', 'Supportive sight abilities used to inspect restrictions, see through illusions, read spiritual changes, and track anomalies.', '它让探索秘境和破解禁制更有技术含量，不只是硬闯。', 'It makes ruin exploration and restriction-breaking more technical than brute force.', ['formation-restrictions', 'illusion-law'], 'medium'),
    item('stealth-escape-arts', '敛息遁术', 'Concealment and Escape Arts', 'Lianxi Dunshu', '全书通用', 'Whole-series recurring system', '收敛气息、改换身份、遁速撤离等保命技艺，是韩立风格的重要组成。', 'Life-preserving arts around hiding aura, shifting identity, and escaping quickly.', '在《凡人》中，能活下来常常比一时胜负更重要，这类手段正体现韩立的求稳逻辑。', 'In RMJI, survival often matters more than momentary victory, and these methods embody Han Li risk-first logic.', ['wind-thunder-wings', 'black-wind-sea', 'han-li'], 'high'),
    item('soul-searching-art', '搜魂术', 'Soul-Searching Arts', 'Souhun Shu', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '围绕神魂读取、记忆线索和情报获取展开的危险术法。', 'Dangerous arts around reading souls, extracting memories, and gathering intelligence.', '它常服务情报链，但也提示修仙世界中神魂安全和因果风险的残酷。', 'It serves intelligence gathering while highlighting the cruelty of soul risk and karmic exposure.', ['refining-spirit-art', 'soul-nurturing-wood', 'weeping-soul-beast'], 'medium'),
    item('body-refining-system', '炼体体系', 'Body-Refining System', 'Lianti Tixi', '灵界至仙界篇', 'Spirit to Immortal Realm Arc', '从明王诀、梵圣真魔功到真灵血脉运用，肉身路线在高阶斗法中越来越重要。', 'From Bright King Art and Brahma Saint True Demon Art to true-spirit bloodlines, body power becomes increasingly important.', '它避免战斗只剩法力对轰，让抗压、近战、变化和恢复能力成为关键变量。', 'It prevents combat from becoming only mana contests by making durability, close combat, transformation, and recovery matter.', ['bright-king-art', 'fansheng-true-demon-art', 'true-spirit-blood'], 'high'),
    item('devil-arts-system', '魔功体系', 'Devil-Art System', 'Mogong Tixi', '人界至魔界线', 'Mortal Realm to Devil Realm thread', '古魔、魔族、魔修和真魔之气共同构成的功法谱系。', 'A spectrum of arts involving ancient devils, devil races, demonic cultivators, and true-devil Qi.', '魔功不只是反派标签，也是一套有资源、代价、肉身和侵蚀风险的修炼道路。', 'Devil arts are not only villain labels; they form a path with resources, costs, body power, and corruption risks.', ['devil-race', 'ancient-devils', 'true-demon-qi'], 'high'),
    item('lightning-escape', '雷遁', 'Lightning Escape', 'Leidun', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '借雷属性提升遁速和突围能力的身法方向，与风雷翅、雷法和雷属性材料关系紧密。', 'A movement route that uses thunder attributes for speed and breakout, linked to Wind-Thunder Wings and thunder materials.', '它延续韩立“能打也要能走”的保命策略。', 'It continues Han Li strategy that one must be able to leave as well as fight.', ['wind-thunder-wings', 'thunder-law', 'evil-warding-divine-thunder'], 'high'),
    item('flying-sword-control', '御剑术', 'Flying-Sword Control', 'Yujian Shu', '人界至灵界', 'Mortal to Spirit Realm', '操控飞剑攻击、护身、布阵和牵制的基础剑修技艺。', 'The basic sword-cultivation skill for attacking, defending, forming arrays, and restraining enemies with flying swords.', '它是青元剑诀、青竹蜂云剑和剑阵体系的底层操作逻辑。', 'It is the operating logic behind the Azure Essence Sword Art, Bamboo Cloudswarm Swords, and sword formations.', ['qingyuan-sword-art', 'green-bamboo-cloudswarm-swords', 'dageng-sword-array'], 'high'),
    item('golden-body-dharma-form', '金身法相', 'Golden-Body Dharma Form', 'Jinshen Faxiang', '灵界至仙界篇', 'Spirit Realm to Immortal World Arc', '与炼体、佛门意象和强力战斗形态相关的法相概念。', 'A dharma-form concept tied to body cultivation, Buddhist imagery, and powerful combat forms.', '它可与梵圣真魔功、明王诀和高阶肉身斗法共同阅读。', 'It should be read with Brahma Saint True Demon Art, Bright King Art, and higher-level body combat.', ['fansheng-true-demon-art', 'bright-king-art', 'body-refining-system'], 'medium'),
    item('law-domain-technique', '灵域运用', 'Spiritual Domain Use', 'Lingyu Yunyong', '仙界篇', 'Immortal World Arc', '仙界篇高阶战斗中，灵域常用于展开自身法则环境、压制对手和改写战场。', 'In the sequel, spiritual domains are used to project one law environment, suppress enemies, and reshape battlefields.', '它是从“术法”走向“法则场域”的关键标志。', 'It marks the move from spells into law-based fields.', ['law-domain', 'time-law', 'three-thousand-daos'], 'high'),
    item('gray-realm-survival-arts', '灰界生存术', 'Gray-Realm Survival Arts', 'Huijie Shengcun Shu', '仙界篇灰界阶段', 'Immortal World Gray Realm arc', '韩立等人在灰界面对环境差异、灰气侵蚀、异族生态和资源规则时形成的应对方式。', 'Adaptive methods used in the Gray Realm against environmental difference, gray-Qi erosion, alien ecology, and changed resources.', '它把灰界写成真正异质空间，而不是普通换地图。', 'It makes the Gray Realm feel like a genuinely alien environment rather than a simple map change.', ['gray-realm', 'gray-realm-law', 'gray-realm-materials'], 'high')
  ],
  artifacts: [
    item('xuantian-treasure', '玄天之宝', 'Xuantian Treasure', 'Xuantian Zhibao', '灵界高阶', 'High-level Spirit Realm arc', '灵界层级极高的宝物类别，常牵动族群、界面和大乘级势力争夺。', 'A very high-level treasure category in the Spirit Realm, often driving racial, realm-level, and Mahayana-stage competition.', '它把法宝价值从个人战力抬升到族群战略资源。', 'It raises treasure value from personal combat gear to strategic racial resources.', ['xuantian-spirit-slaying-sword', 'spirit-realm', 'true-spirits'], 'high'),
    item('xuantian-spirit-slaying-sword', '玄天斩灵剑', 'Xuantian Spirit-Slaying Sword', 'Xuantian Zhanling Jian', '灵界高阶', 'High-level Spirit Realm arc', '玄天之宝相关的代表性剑类重宝，象征灵界高层战力和大势力博弈。', 'A representative sword-type Xuantian treasure symbolizing top Spirit Realm power and great-faction competition.', '它适合与玄天之宝、剑法和灵界族群冲突共同阅读。', 'Read it with Xuantian treasures, sword methods, and Spirit Realm racial conflicts.', ['xuantian-treasure', 'sword-law', 'spirit-realm'], 'high'),
    item('bonded-artifact', '本命法宝', 'Bonded Artifact', 'Benming Fabao', '人界至灵界', 'Mortal to Spirit Realm', '与修士长期祭炼、心神相连、可随境界提升的核心法宝类型。', 'A core artifact type refined over time and linked to a cultivator mind and progression.', '青竹蜂云剑等长期成长型武器，正体现本命法宝的积累价值。', 'Long-growth weapons such as the Bamboo Cloudswarm Swords express the value of bonded artifacts.', ['green-bamboo-cloudswarm-swords', 'flying-sword-control'], 'high'),
    item('ancient-treasure', '古宝', 'Ancient Treasure', 'Gubao', '人界至灵界', 'Mortal to Spirit Realm', '古修士遗留的宝物类别，常出现在秘境、遗迹、拍卖和高阶修士争夺中。', 'Treasures left by ancient cultivators, often found in secret realms, ruins, auctions, and high-level contests.', '古宝让遗迹探索具有直接收益，也让旧时代传承持续影响现在。', 'Ancient treasures give ruins direct rewards and let older inheritances affect the present.', ['xutian-cauldron', 'kunwu-mountain', 'auction-resources'], 'medium'),
    item('spirit-treasure', '灵宝', 'Spirit Treasure', 'Lingbao', '灵界前后', 'Around Spirit Realm arc', '高于普通法宝的宝物层级，适合整理灵界以后战力升级。', 'A treasure level above ordinary artifacts, useful for organizing post-ascension power upgrades.', '它是从人界法宝逻辑过渡到灵界、仙界重宝体系的台阶。', 'It bridges Mortal Realm artifact logic into Spirit and Immortal Realm treasure systems.', ['heaven-reaching-spirit-treasure', 'xuantian-treasure'], 'medium'),
    item('heaven-reaching-spirit-treasure', '通天灵宝', 'Heaven-Reaching Spirit Treasure', 'Tongtian Lingbao', '人界后期至灵界', 'Late Mortal to Spirit Realm', '人界后期和灵界叙事中常被视为极高层级的灵宝类别。', 'A very high-level spirit-treasure category in late Mortal Realm and Spirit Realm storytelling.', '它帮助区分普通法宝、古宝、灵宝和玄天之宝之间的层级差异。', 'It helps distinguish ordinary artifacts, ancient treasures, spirit treasures, and Xuantian treasures.', ['spirit-treasure', 'xuantian-treasure'], 'high'),
    item('formation-plate', '阵盘阵旗', 'Formation Plates and Flags', 'Zhenpan Zhenqi', '全书通用', 'Whole-series recurring tools', '布置阵法、开启禁制、守护洞府和困敌的重要工具。', 'Tools for setting formations, opening restrictions, defending dwellings, and trapping enemies.', '它们把阵法从抽象术法变成可携带、可交易、可部署的资源。', 'They turn formations into portable, tradable, deployable resources.', ['formation-flags', 'formation-restrictions'], 'high'),
    item('restriction-token', '禁制令牌', 'Restriction Tokens', 'Jinzhi Lingpai', '秘境与宗门场景', 'Secret-realm and sect scenes', '用于通行洞府、遗迹、宗门禁地或秘境阵法的信物型道具。', 'Token-like items used to enter dwellings, ruins, sect restricted areas, or secret-realm formations.', '它们常是剧情入口，连接身份、权限和空间探索。', 'They often act as plot keys connecting identity, permission, and spatial exploration.', ['formation-restrictions', 'blood-forbidden-land', 'mantra-sect-ruins'], 'medium'),
    item('taiyi-pure-talisman', '太一化清符', 'Taiyi Pure Talisman', 'Taiyi Huaqing Fu', '人界中后期', 'Mortal Realm middle-late arc', '高阶符箓线索之一，可归入保命、隐匿或特殊应敌工具。', 'A high-level talisman thread suited to survival, concealment, or special countermeasures.', '符箓类道具显示韩立不只依赖常备法宝，也重视一次性底牌。', 'Talisman tools show Han Li values one-use trump cards as well as permanent treasures.', ['talisman-making', 'talisman-treasure'], 'medium'),
    item('myriad-soul-banner', '万魂幡', 'Myriad-Soul Banner', 'Wanhun Fan', '魔道与鬼道线', 'Demonic and ghost-path thread', '魂魄类魔道法宝的代表概念，用于整理鬼物、阴魂和神魂压制类斗法。', 'A representative soul-type demonic artifact concept for ghostly, yin-soul, and soul-suppression combat.', '它与啼魂、养魂木、搜魂术构成神魂风险的一组对照。', 'It forms a soul-risk cluster with Weeping Soul, soul-nurturing wood, and soul-searching arts.', ['weeping-soul-beast', 'soul-nurturing-wood', 'soul-searching-art'], 'medium'),
    item('devil-armor', '魔甲', 'Devil Armor', 'Mojia', '魔界与魔族线', 'Devil Realm and devil-race thread', '魔族或魔功体系中常见的护身、强化和异化装备概念。', 'A common devil-race or devil-art equipment concept for protection, enhancement, and alienated combat forms.', '它补充魔族不只是功法强，也有材料、装备和形态体系。', 'It shows devil races have material, equipment, and form systems, not only arts.', ['devil-race', 'devil-arts-system', 'devil-crystal'], 'medium'),
    item('puppet-core', '傀儡核心', 'Puppet Core', 'Kuilei Hexin', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '驱动高阶傀儡的核心部件概念，连接炼器、神识控制和材料品质。', 'The core component concept that powers high-level puppets, linking crafting, divine-sense control, and material quality.', '它让傀儡术不只是“造人偶”，而是完整工程体系。', 'It frames puppet arts as an engineering system rather than simply making dolls.', ['puppet-refinement', 'puppet', 'great-development-art'], 'medium'),
    item('immortal-puppet', '仙傀', 'Immortal Puppet', 'Xiankui', '仙界篇', 'Immortal World Arc', '仙界篇高阶傀儡概念，牵涉仙元、法则材料和复杂控制。', 'A high-level sequel puppet concept involving immortal energy, law materials, and complex control.', '它承接人界傀儡术，又把技术型战力抬到仙界层级。', 'It continues Mortal Realm puppet arts while raising technical combat to immortal scale.', ['puppet-refinement', 'crab-daoist', 'law-materials'], 'medium'),
    item('law-treasure', '法则之宝', 'Law Treasure', 'Faze Zhibao', '仙界篇', 'Immortal World Arc', '仙界篇中与法则属性、灵域和大道感悟绑定的宝物类别。', 'A sequel treasure type bound to law attributes, spiritual domains, and Dao comprehension.', '它区别于低阶法宝，重点不只在坚固和威力，更在法则适配。', 'It differs from lower artifacts by focusing not only on durability and force but also law compatibility.', ['law-domain', 'law-materials', 'three-thousand-daos'], 'high'),
    item('time-treasure', '时间类宝物', 'Time-Path Treasures', 'Shijian Lei Baowu', '仙界篇核心', 'Immortal World core', '围绕时间法则、真言门传承和掌天瓶秘密展开的宝物线索集合。', 'A treasure cluster around time law, True Word Sect inheritances, and the Heavenly Bottle secret.', '时间类宝物是仙界篇专场的核心标签之一。', 'Time-path treasures are one of the sequel section core tags.', ['time-law', 'zhangtian-bottle', 'mantra-wheel-scripture'], 'high'),
    item('gray-realm-vessels', '灰界器物', 'Gray-Realm Vessels', 'Huijie Qiwu', '仙界篇灰界阶段', 'Immortal World Gray Realm arc', '灰界环境中出现的特殊器物、容器和材料化工具总入口。', 'A hub for special vessels, containers, and material tools that appear in Gray Realm environments.', '它用于承接灰界材料、灰仙生活方式和异域资源规则。', 'It supports Gray Realm materials, gray-immortal lifeways, and alien resource rules.', ['gray-realm', 'gray-realm-materials', 'gray-immortals'], 'medium')
  ],
  elixirs: [
    item('yellow-dragon-pill', '黄龙丹', 'Yellow Dragon Pill', 'Huanglong Dan', '人界开篇', 'Opening Mortal Realm arc', '韩立早期接触的丹药线索之一，体现低阶修炼对药力的依赖。', 'An early pill thread that shows how low-level cultivation depends on medicinal force.', '它适合作为墨大夫、长春功和早期炼气资源的补充页。', 'It works as a support page for Doctor Mo, Everlasting Spring Art, and early Qi Refining resources.', ['doctor-mo', 'changchun-gong', 'qi-refining-pills'], 'high'),
    item('golden-marrow-pill', '金髓丸', 'Golden Marrow Pill', 'Jinsui Wan', '人界开篇', 'Opening Mortal Realm arc', '早期丹药资源之一，连接江湖医术、炼气启蒙和药物改造身体的线索。', 'An early pill resource connecting martial medicine, Qi Refining initiation, and body-altering medicinal force.', '它让开篇的“医药”逐步转向真正修仙资源。', 'It helps the opening shift from medicine into cultivation resources.', ['doctor-mo', 'yellow-dragon-pill'], 'high'),
    item('qi-refining-pills', '炼气期丹药', 'Qi-Refining Pills', 'Lianqiqi Danyao', '人界早期', 'Early Mortal Realm arc', '低阶修士提升法力、缩短修炼时间的常见丹药总类。', 'A general class of low-level pills used to improve mana and shorten cultivation time.', '它说明炼气阶段并不浪漫，更多是资质、药力和资源供应的现实竞争。', 'It shows Qi Refining is less romantic than practical competition over aptitude, pills, and supply.', ['yellow-dragon-pill', 'spirit-stone', 'foundation-establishment-pill'], 'high'),
    item('foundation-materials', '筑基灵材', 'Foundation Materials', 'Zhuji Lingcai', '人界早期', 'Early Mortal Realm arc', '围绕筑基丹与筑基准备所需的灵草、辅材和宗门资源。', 'Herbs, auxiliaries, and sect resources needed around Foundation Establishment preparation.', '它让筑基从单次突破变成一整套资源链。', 'It turns Foundation Establishment into a full resource chain rather than one breakthrough event.', ['foundation-establishment-pill', 'huangfeng-valley', 'blood-forbidden-land'], 'high'),
    item('spirit-herb-seeds', '灵草种子', 'Spirit-Herb Seeds', 'Lingcao Zhongzi', '全书资源线', 'Whole-series resource thread', '掌天瓶路线中极重要的基础资源，关系到灵药培育和长期丹药供给。', 'A core resource for the Heavenly Bottle path, tied to herb cultivation and long-term pill supply.', '种子、年份和成熟速度共同构成韩立早期机缘的实际收益。', 'Seeds, age, and maturity speed together form the practical value of Han Li early opportunity.', ['zhangtian-bottle', 'medicine-garden', 'mature-spirit-herbs'], 'high'),
    item('thousand-year-spirit-herbs', '千年灵草', 'Thousand-Year Spirit Herbs', 'Qiannian Lingcao', '人界至灵界', 'Mortal to Spirit Realm', '高年份灵草是炼丹、交易和高阶修士争夺的重要资源。', 'High-age herbs are important resources for alchemy, trade, and high-level competition.', '它和掌天瓶一起构成《凡人》最有辨识度的资源逻辑。', 'Together with the Heavenly Bottle, it forms one of RMJI most recognizable resource logics.', ['zhangtian-bottle', 'alchemy-art', 'mature-spirit-herbs'], 'high'),
    item('rainbow-skirt-grass', '霓裳草', 'Rainbow Skirt Grass', 'Nishang Cao', '乱星海', 'Chaotic Star Sea arc', '乱星海妖兽资源线中的代表性灵草，可用于引出猎妖、妖丹和海域经济。', 'A representative herb in the Chaotic Star Sea demon-beast resource thread, useful for discussing beast hunting and demon cores.', '它让乱星海不只是地图，更有独特资源玩法。', 'It gives the Chaotic Star Sea a distinctive resource loop, not just a new map.', ['chaotic-star-sea', 'demon-core', 'demon-beast-materials'], 'high'),
    item('demon-beast-materials', '妖兽材料', 'Demon-Beast Materials', 'Yaoshou Cailiao', '人界至灵界', 'Mortal to Spirit Realm', '妖兽尸身、兽皮、兽骨、妖丹等材料，是炼器、炼丹和交易的重要来源。', 'Materials from demon beasts, including hides, bones, and cores, used for crafting, alchemy, and trade.', '它把战斗收益转化为修炼经济。', 'It turns combat spoils into cultivation economy.', ['demon-core', 'rainbow-skirt-grass', 'beast-taming-art'], 'high'),
    item('top-grade-spirit-stones', '极品灵石', 'Top-Grade Spirit Stones', 'Jipin Lingshi', '人界至灵界', 'Mortal to Spirit Realm', '灵石体系中的高阶货币和能量资源，常用于高额交易、阵法和关键修炼。', 'A high-grade currency and energy resource used in large trades, formations, and important cultivation.', '它帮助网站把“灵石”拆成更贴近小说经济的等级结构。', 'It helps split spirit stones into a more novel-like economic hierarchy.', ['spirit-stone', 'auction-resources', 'formation-plate'], 'medium'),
    item('immortal-origin-stone', '仙元石', 'Immortal Origin Stone', 'Xianyuan Shi', '仙界篇', 'Immortal World Arc', '仙界篇常见的高阶资源与货币线索，用于修炼、交易和仙界生态说明。', 'A common sequel high-level resource and currency thread used for cultivation, trade, and immortal-world ecology.', '它是从灵石经济过渡到仙界经济的重要词条。', 'It is the key bridge from spirit-stone economy into immortal-world economy.', ['immortal-realm', 'immortal-pills', 'dao-pill'], 'high'),
    item('immortal-pills', '仙界丹药', 'Immortal-World Pills', 'Xianjie Danyao', '仙界篇', 'Immortal World Arc', '仙界篇丹药总类，用于承接真仙、金仙以后更高层级的修炼资源。', 'A general category for sequel-era pills that support cultivation beyond True Immortal and Golden Immortal levels.', '它让仙界篇仍保留“资源驱动修炼”的凡人流底色。', 'It keeps the sequel tied to RMJI resource-driven cultivation logic.', ['immortal-origin-stone', 'dao-pill', 'law-materials'], 'high'),
    item('law-materials', '法则材料', 'Law Materials', 'Faze Cailiao', '仙界篇', 'Immortal World Arc', '与法则感悟、法则宝物、灵域和道丹炼制相关的材料总类。', 'Materials tied to law comprehension, law treasures, spiritual domains, and Dao-pill refinement.', '它把仙界篇资源从“灵气年份”推进到“法则属性”。', 'It shifts sequel resources from age and Qi into law attributes.', ['law-treasure', 'dao-pill', 'law-domain'], 'high'),
    item('time-crystal-materials', '时间属性材料', 'Time-Attribute Materials', 'Shijian Cailiao', '仙界篇核心', 'Immortal World core', '围绕时间法则和真言门传承出现的特殊材料线索。', 'Special material threads around time law and True Word Sect inheritance.', '它们服务时间功法、时间宝物和掌天瓶秘密的交叉阅读。', 'They support cross-reading among time arts, time treasures, and the Heavenly Bottle secret.', ['time-law', 'time-treasure', 'mantra-wheel-scripture'], 'medium'),
    item('gray-crystals', '灰界晶石', 'Gray-Realm Crystals', 'Huijie Jingshi', '仙界篇灰界阶段', 'Immortal World Gray Realm arc', '灰界环境中可作为能量、材料或交易资源的晶石类线索。', 'Crystal resources in the Gray Realm that can function as energy, material, or trade goods.', '它补足灰界材料系统，让灰界拥有自身经济感。', 'It enriches Gray Realm material systems and gives the region its own economy.', ['gray-realm-materials', 'gray-realm', 'gray-realm-vessels'], 'medium'),
    item('devil-essence-diamond', '魔髓钻', 'Devil Essence Diamond', 'Mosui Zuan', '魔界与魔族线', 'Devil Realm and devil-race thread', '魔界或魔族资源体系中可用于炼器、炼体或魔功相关用途的高阶材料。', 'A high-grade devil-realm material useful for crafting, body refinement, or devil-art contexts.', '它让魔族线有自己的材料经济，不只停留在敌对势力。', 'It gives the devil-race thread its own material economy, not only antagonism.', ['devil-crystal', 'devil-race', 'devil-arts-system'], 'medium'),
    item('true-spirit-blood', '真灵之血', 'True-Spirit Blood', 'Zhenling Zhixue', '灵界至仙界篇', 'Spirit to Immortal Realm Arc', '真灵血脉相关资源，可用于炼体、变化、血脉强化和高阶族群设定。', 'A true-spirit bloodline resource used for body refinement, transformation, bloodline enhancement, and high-level race lore.', '它连接梵圣真魔功、妖族、真灵和肉身成长线。', 'It links Brahma Saint True Demon Art, demon races, true spirits, and body-growth threads.', ['true-spirits', 'body-refining-system', 'fansheng-true-demon-art'], 'high'),
    item('spirit-eye-tree', '灵眼之树', 'Spirit-Eye Tree', 'Lingyan Zhi Shu', '人界资源线', 'Mortal Realm resource thread', '与洞府灵气、灵眼资源和长期修炼环境相关的灵物概念。', 'A spiritual object tied to dwelling Qi, spirit-eye resources, and long-term cultivation environments.', '它让洞府建设不只是住所，而是修炼效率工程。', 'It turns dwelling setup into an efficiency project, not just housing.', ['medicine-garden', 'spirit-stone', 'spirit-herb-seeds'], 'medium'),
    item('mature-spirit-herbs', '成熟灵药', 'Mature Spirit Herbs', 'Chengshu Lingyao', '全书资源线', 'Whole-series resource thread', '灵药年份成熟后的可炼丹、可交易、可交换机缘形态。', 'The useful state of herbs after aging enough for alchemy, trade, and opportunity exchange.', '它是掌天瓶收益落地的实际形态。', 'It is the practical output of the Heavenly Bottle resource path.', ['zhangtian-bottle', 'thousand-year-spirit-herbs', 'alchemy-art'], 'high'),
    item('pill-formulas', '丹方', 'Pill Formulas', 'Danfang', '全书通用', 'Whole-series recurring system', '决定丹药能否被复制炼制的知识资源，常比单枚丹药更有长期价值。', 'Knowledge resources that determine whether pills can be reproduced, often more valuable long-term than one pill.', '丹方把修仙资源从材料扩展到信息和传承。', 'Pill formulas expand cultivation resources from materials into information and inheritance.', ['alchemy-art', 'immortal-pills', 'foundation-materials'], 'high'),
    item('auction-resources', '拍卖资源', 'Auction Resources', 'Paimai Ziyuan', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '拍卖会中出现的丹药、法宝、灵材和情报，是修仙社会流通资源的窗口。', 'Pills, treasures, materials, and information appearing in auctions, a window into resource circulation.', '它能把散修、宗门、高阶修士和黑市关系串起来。', 'It links rogue cultivators, sects, high-level experts, and black-market relationships.', ['spirit-stone', 'ancient-treasure', 'top-grade-spirit-stones'], 'high'),
    item('medicine-garden', '灵药园', 'Spirit Herb Garden', 'Lingyao Yuan', '全书资源线', 'Whole-series resource thread', '种植灵草、管理年份和隐藏资源来源的空间型资产。', 'A spatial asset for growing herbs, managing age, and hiding resource supply.', '它把掌天瓶和洞府经营连接起来，形成韩立长期资源盘。', 'It connects the Heavenly Bottle to dwelling management and Han Li long-term resource base.', ['zhangtian-bottle', 'spirit-herb-seeds', 'mature-spirit-herbs'], 'high')
  ],
  sects: [
    item('yue-seven-sects', '越国七派', 'Seven Sects of Yue', 'Yueguo Qipai', '人界早期', 'Early Mortal Realm arc', '黄枫谷、掩月宗等越国宗门组成的早期修仙政治格局。', 'The early Yue cultivation order formed by sects such as Yellow Maple Valley and Masking Moon Sect.', '它是韩立正式进入修仙宗门社会后的第一张势力地图。', 'It is Han Li first real map of sect society.', ['huangfeng-valley', 'masking-moon-sect', 'yellow-maple-cultivation'], 'high'),
    item('devil-dao-six-sects', '魔道六宗', 'Six Devil Dao Sects', 'Modao Liuzong', '人界早中期', 'Early-middle Mortal Realm arc', '越国周边魔道压力的总入口，承接正魔战争、资源争夺和宗门迁徙。', 'A hub for devil-path pressure around Yue, connecting orthodox-demonic war, resource competition, and sect displacement.', '它让早期剧情从宗门内部竞争升级到区域战争。', 'It escalates the early story from intra-sect competition to regional war.', ['yue-seven-sects', 'ghost-spirit-sect', 'harmonious-bond-sect'], 'high'),
    item('righteous-alliance', '正道盟', 'Righteous Alliance', 'Zhengdao Meng', '人界中期', 'Middle Mortal Realm arc', '人界正道势力协调、对抗魔道和维护区域秩序的组织概念。', 'An orthodox coordination structure for resisting devil-path forces and maintaining regional order.', '它帮助区分“正道”不是单一宗门，而是利益共同体。', 'It shows the righteous side is not one sect but an interest coalition.', ['righteous-cultivator', 'devil-dao-six-sects'], 'medium'),
    item('heavenly-dao-alliance', '天道盟', 'Heavenly Dao Alliance', 'Tiandao Meng', '人界中期', 'Middle Mortal Realm arc', '天南格局中的重要联盟型势力，用于整理多宗门协作和区域秩序。', 'An important alliance in the Heavenly South structure, useful for multi-sect cooperation and regional order.', '它和正魔对抗、散修空间、资源分配共同构成人界政治层次。', 'It forms the political layers of the Mortal Realm alongside righteous-demonic conflict, rogue space, and resource allocation.', ['heavenly-south-region', 'heavenly-south-alliance'], 'medium'),
    item('nine-nations-alliance', '九国盟', 'Nine Nations Alliance', 'Jiuguo Meng', '人界中期', 'Middle Mortal Realm arc', '天南相关的大型联盟势力之一，补足人界区域政治版图。', 'A large Heavenly South-related alliance that fills out the Mortal Realm regional map.', '它体现人界势力不是点状宗门，而是区域联盟和战争压力共同作用。', 'It shows Mortal Realm power as regional alliances under war pressure, not isolated sects.', ['heavenly-south-region', 'heavenly-dao-alliance'], 'medium'),
    item('ghost-spirit-sect', '鬼灵门', 'Ghost Spirit Sect', 'Guiling Men', '人界早中期', 'Early-middle Mortal Realm arc', '魔道势力代表之一，与正魔冲突、鬼道术法和宗门博弈相关。', 'A representative devil-path faction tied to orthodox-demonic conflict, ghost-path arts, and sect competition.', '它适合与魔道六宗、搜魂术和魂魄类法宝交叉阅读。', 'It pairs well with the Six Devil Dao Sects, soul-searching arts, and soul-type treasures.', ['devil-dao-six-sects', 'myriad-soul-banner', 'soul-searching-art'], 'high'),
    item('harmonious-bond-sect', '合欢宗', 'Harmonious Bond Sect', 'Hehuan Zong', '人界早中期', 'Early-middle Mortal Realm arc', '魔道阵营中辨识度较高的宗门之一，承接功法、人物和正魔战争线索。', 'A recognizable devil-path sect connecting cultivation methods, characters, and orthodox-demonic war threads.', '它可补足早期魔道并非单一面孔，而有不同宗门风格。', 'It helps show the devil path has distinct sect styles rather than one face.', ['devil-dao-six-sects', 'devil-arts-system'], 'medium'),
    item('imperial-ye-clan', '大晋叶家', 'Great Jin Ye Clan', 'Dajin Ye Jia', '人界后期', 'Late Mortal Realm arc', '大晋阶段的重要修仙家族势力，可用于整理昆吾山、皇族和高阶修士博弈。', 'An important Great Jin cultivation clan useful for organizing Kunwu Mountain, imperial power, and high-level schemes.', '它让大晋篇具有家族政治和旧传承争夺的味道。', 'It gives the Great Jin arc clan politics and ancient-inheritance competition.', ['great-jin-region', 'kunwu-mountain', 'great-jin-journey'], 'medium'),
    item('kunwu-mountain-factions', '昆吾山争夺势力', 'Kunwu Mountain Contenders', 'Kunwu Shan Zhengduo Shili', '人界后期', 'Late Mortal Realm arc', '围绕昆吾山遗迹展开的多方势力总入口。', 'A hub for the multiple forces contending around the Kunwu Mountain ruins.', '它适合把人界后期遗迹、古宝和高阶修士利益集中到同一页。', 'It gathers late Mortal Realm ruins, ancient treasures, and high-level interests into one page.', ['kunwu-mountain', 'ancient-treasure', 'imperial-ye-clan'], 'high'),
    item('xutian-hall-contenders', '虚天殿争夺势力', 'Void Heaven Hall Contenders', 'Xutian Dian Zhengduo Shili', '乱星海', 'Chaotic Star Sea arc', '围绕虚天殿与虚天鼎展开的乱星海势力博弈。', 'The Chaotic Star Sea power struggle around Void Heaven Hall and the Void Heaven Cauldron.', '它把星宫、逆星盟、老怪和秘宝争夺串成事件链。', 'It links Star Palace, Anti-Star Alliance, old monsters, and treasure competition into one event chain.', ['xutian-cauldron', 'xutian-hall', 'star-palace'], 'high'),
    item('green-origin-palace', '青元宫', 'Green Origin Palace', 'Qingyuan Gong', '灵界后续', 'Later Spirit Realm thread', '与韩立后期身份、传承和势力建立相关的宗门/宫观线索。', 'A later thread tied to Han Li status, inheritance, and institution building.', '它适合表现韩立从求生者逐渐拥有传承和势力空间。', 'It shows Han Li gradually moving from survivor to someone with inheritance and institutional space.', ['han-li', 'qingyuan-sword-art', 'spirit-realm'], 'medium'),
    item('black-wind-island', '黑风岛', 'Black Wind Island', 'Heifeng Dao', '仙界篇早期', 'Early Immortal World Arc', '仙界篇早期与黑风海域相关的落脚点和势力空间。', 'An early sequel foothold and factional space tied to the Black Wind Sea.', '它承接韩立初入仙界后的身份隐藏、资源恢复和地区冲突。', 'It carries Han Li early sequel identity concealment, recovery, and regional conflict.', ['black-wind-sea', 'immortal-realm-opening'], 'high'),
    item('black-wind-sea-factions', '黑风海域势力', 'Black Wind Sea Factions', 'Heifeng Haiyu Shili', '仙界篇早期', 'Early Immortal World Arc', '仙界篇早期海域势力总入口，适合整理岛屿、宫府和散修网络。', 'A hub for early sequel maritime powers, islands, palaces, and rogue-cultivator networks.', '它让仙界篇开局不是抽象仙界，而有具体地方社会。', 'It makes the sequel opening a concrete local society rather than abstract immortality.', ['black-wind-sea', 'black-wind-island'], 'high'),
    item('impermanence-alliance', '无常盟', 'Impermanence Alliance', 'Wuchang Meng', '仙界篇', 'Immortal World Arc', '仙界篇中偏任务、交易、情报和身份流动的组织线索。', 'A sequel organization thread around missions, trade, intelligence, and shifting identity.', '它适合与轮回殿、仙界散修和隐藏身份线索共同阅读。', 'It pairs well with Reincarnation Palace, immortal rogue cultivators, and hidden identity threads.', ['reincarnation-palace', 'jiao-san', 'fox-three'], 'medium'),
    item('hundred-creations-mountain', '百造山', 'Hundred Creations Mountain', 'Baizao Shan', '仙界篇', 'Immortal World Arc', '仙界篇炼器、傀儡和技术型资源相关势力线索。', 'A sequel faction thread tied to crafting, puppets, and technical resources.', '它让仙界篇不只有法则强者，也有专业技艺型势力。', 'It shows the sequel includes craft-specialist institutions, not only law experts.', ['immortal-puppet', 'puppet-refinement', 'law-treasure'], 'verify'),
    item('gray-realm-powers', '灰界势力', 'Gray-Realm Powers', 'Huijie Shili', '仙界篇灰界阶段', 'Immortal World Gray Realm arc', '灰界中灰仙、城池、强者和区域组织的总入口。', 'A hub for Gray Realm gray immortals, cities, strong figures, and regional organizations.', '它用于把灰界从一张地图扩展成有政治结构的异域社会。', 'It expands the Gray Realm from a map into an alien society with political structure.', ['gray-realm', 'gray-immortals', 'gray-realm-figures'], 'high')
  ],
  races: [
    item('spirit-insects', '灵虫', 'Spirit Insects', 'Lingchong', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '噬金虫等灵虫构成《凡人》中很有辨识度的养成型战力。', 'Spirit insects such as Gold-Devouring Beetles form a highly recognizable long-nurture combat resource.', '它们把生物养成、资源投入和群体压制结合起来。', 'They combine creature nurturing, resource investment, and swarm pressure.', ['gold-devouring-beetles', 'insect-rearing-art', 'golden-child'], 'high'),
    item('demon-beasts', '妖兽', 'Demon Beasts', 'Yaoshou', '人界至灵界', 'Mortal to Spirit Realm', '妖兽提供战斗威胁、材料来源、妖丹经济和灵兽对照。', 'Demon beasts provide combat threat, material supply, demon-core economy, and comparison with spirit companions.', '它们支撑乱星海、蛮荒和灵界生态的资源循环。', 'They support resource cycles in the Chaotic Star Sea, wilderness, and Spirit Realm ecology.', ['demon-core', 'demon-beast-materials', 'rainbow-skirt-grass'], 'high'),
    item('true-demon-qi', '真魔之气', 'True Devil Qi', 'Zhenmo Zhiqi', '魔族与魔功线', 'Devil race and devil-art thread', '魔族、古魔和魔功侵蚀相关的高危力量概念。', 'A high-risk power concept tied to devil races, ancient devils, and devil-art corruption.', '它让魔族线具有环境侵蚀、功法代价和身份异化的风险。', 'It gives the devil thread risks of environmental corruption, art costs, and identity distortion.', ['devil-race', 'ancient-devils', 'devil-arts-system'], 'high'),
    item('devil-ancestors', '魔族圣祖', 'Devil Sacred Ancestors', 'Mozu Shengzu', '灵界至魔界线', 'Spirit to Devil Realm thread', '魔族最高层强者群体概念，代表跨界战争和高阶魔功压力。', 'A top-level devil-race power group representing cross-realm war and high-level devil-art pressure.', '它们让魔族不是散乱敌人，而是有层级、有战略的高阶阵营。', 'They make the devil race a hierarchical strategic faction, not scattered enemies.', ['yuan-cha', 'six-extremes', 'baohua'], 'high'),
    item('devil-lords', '魔尊', 'Devil Lords', 'Mozun', '魔界线', 'Devil Realm thread', '魔界高阶称谓和强者层级之一，可用于整理魔族内部等级。', 'A high-level devil-world title useful for organizing internal devil-race hierarchy.', '它补足魔族从普通魔物到圣祖级存在之间的层级感。', 'It fills the hierarchy between ordinary devils and sacred ancestors.', ['devil-race', 'devil-ancestors'], 'medium'),
    item('gray-beasts', '灰兽', 'Gray Beasts', 'Huishou', '仙界篇灰界阶段', 'Immortal World Gray Realm arc', '灰界生态中的异质生物类群，可用于表现灰界环境差异和材料来源。', 'Alien creatures in the Gray Realm ecology, useful for showing environmental difference and material sources.', '它们让灰界拥有独立生态，而不只是灰仙活动舞台。', 'They give the Gray Realm its own ecology, not only gray-immortal society.', ['gray-realm', 'gray-realm-materials', 'gray-crystals'], 'medium'),
    item('gray-realm-natives', '灰界土著', 'Gray-Realm Natives', 'Huijie Tuzhu', '仙界篇灰界阶段', 'Immortal World Gray Realm arc', '灰界本土族群和社会身份的总入口。', 'A hub for native peoples and social identities in the Gray Realm.', '它帮助区分外来修士、灰仙、本土异族和灰界环境之间的关系。', 'It helps distinguish outsiders, gray immortals, native peoples, and Gray Realm environment.', ['gray-immortals', 'gray-realm-powers'], 'medium'),
    item('wood-race', '木族', 'Wood Race', 'Muzu', '灵界多族格局', 'Spirit Realm multi-race structure', '灵界多族版图中的族群之一，可用于补充灵界不再以人族为中心的格局。', 'One race within the Spirit Realm multi-race map, expanding the setting beyond human-centered cultivation.', '它和灵族、妖族、飞灵族等共同构成灵界生态。', 'It helps form Spirit Realm ecology alongside spirit races, demon races, and flying spirit races.', ['spirit-realm', 'spirit-race'], 'medium'),
    item('yaksha-race', '夜叉族', 'Yaksha Race', 'Yecha Zu', '灵界多族格局', 'Spirit Realm multi-race structure', '灵界异族之一，用于扩展灵界族群冲突和地缘压力。', 'A Spirit Realm nonhuman race that expands racial conflict and geopolitical pressure.', '它让灵界篇的压力来自多个族群，而非单一敌人。', 'It makes Spirit Realm pressure come from many peoples rather than one enemy.', ['spirit-realm', 'human-race'], 'medium'),
    item('shadow-race', '影族', 'Shadow Race', 'Yingzu', '灵界多族格局', 'Spirit Realm multi-race structure', '灵界异族线索之一，可与隐匿、刺杀、空间和异族生态联系。', 'A Spirit Realm people thread that can connect concealment, assassination, space, and alien ecology.', '作为种族索引，它帮助后续补充灵界各族特点。', 'As a race index, it prepares later additions on Spirit Realm peoples.', ['spirit-realm', 'stealth-escape-arts'], 'verify'),
    item('sea-race', '海族', 'Sea Race', 'Haizu', '乱星海与海域生态', 'Chaotic Star Sea and maritime ecology', '海域修仙生态中的族群概念，可补充乱星海与海兽、岛屿、商贸的关系。', 'A maritime people concept supporting Chaotic Star Sea ecology, sea beasts, islands, and trade.', '它让海域不只是修士活动空间，也有自身生态层。', 'It makes sea regions more than cultivator spaces by adding ecological layers.', ['chaotic-star-sea', 'demon-beasts'], 'medium'),
    item('locust-race', '螟虫族', 'Locust Race', 'Mingchong Zu', '灵界后期', 'Late Spirit Realm arc', '灵界后期强压迫感的虫族威胁线索。', 'A late Spirit Realm insect-race threat thread with strong pressure.', '它与虫母、族群危机和界面级灾难相关。', 'It connects to the mother of locusts, racial crisis, and realm-scale disaster.', ['mother-of-locusts', 'spirit-realm'], 'high'),
    item('mother-of-locusts', '螟虫之母', 'Mother of Locusts', 'Mingchong Zhimu', '灵界后期', 'Late Spirit Realm arc', '灵界后期重要灾厄级存在，承载虫族、界面危机和高阶合力对抗。', 'An important late Spirit Realm calamity-level existence tied to insect races, realm crisis, and high-level cooperation.', '它把韩立个人成长推向更大规模的界面危机。', 'It pushes Han Li personal growth into larger realm-level crisis.', ['locust-race', 'spirit-realm', 'gold-devouring-beetles'], 'high')
  ],
  regions: [
    item('yue-state', '越国', 'Yue State', 'Yueguo', '人界早期', 'Early Mortal Realm arc', '韩立早期修仙活动的核心区域之一，承载七派、血色禁地和正魔压力。', 'One of Han Li early core cultivation regions, carrying the seven sects, forbidden land, and righteous-demonic pressure.', '它是凡人专场早期地图的基础节点。', 'It is a foundation node for the early RMJI map.', ['yue-seven-sects', 'huangfeng-valley', 'blood-forbidden-land'], 'high'),
    item('blood-forbidden-land', '血色禁地', 'Blood Forbidden Land', 'Xuese Jindi', '人界早期', 'Early Mortal Realm arc', '越国七派低阶弟子争夺筑基灵药的重要秘境。', 'An important secret realm where low-level Yue sect disciples compete for Foundation materials.', '它集中展示低阶修士的资源竞争、宗门任务和生死风险。', 'It concentrates low-level resource competition, sect missions, and lethal risk.', ['foundation-materials', 'yue-seven-sects', 'blood-forbidden-land-arc'], 'high'),
    item('demonfall-valley', '坠魔谷', 'Demonfall Valley', 'Zhuimo Gu', '人界中后期', 'Mortal Realm middle-late arc', '人界重要险地和遗迹空间，连接古魔、宝物和高阶修士探索。', 'An important Mortal Realm danger zone and ruin space linked to ancient devils, treasures, and high-level exploration.', '它把秘境探索从低阶试炼升级为高阶风险。', 'It upgrades secret-realm exploration from low-level trial to high-level danger.', ['ancient-devils', 'demonfall-valley-arc', 'ancient-treasure'], 'high'),
    item('kunwu-mountain', '昆吾山', 'Kunwu Mountain', 'Kunwu Shan', '人界后期', 'Late Mortal Realm arc', '人界后期极重要遗迹，牵动大晋势力、古宝和多方高阶修士。', 'A very important late Mortal Realm ruin involving Great Jin powers, ancient treasures, and many high-level cultivators.', '它是人界后期“遗迹大事件”的核心节点。', 'It is a core late Mortal Realm ruin-event node.', ['kunwu-mountain-factions', 'imperial-ye-clan', 'ancient-treasure'], 'high'),
    item('xutian-hall', '虚天殿', 'Void Heaven Hall', 'Xutian Dian', '乱星海', 'Chaotic Star Sea arc', '乱星海秘境与宝物争夺核心空间，和虚天鼎线索密切相关。', 'A core secret-realm space in the Chaotic Star Sea, tightly linked to the Void Heaven Cauldron.', '它是乱星海从海域历练进入高阶博弈的重要场景。', 'It moves the Chaotic Star Sea from travel into high-level contest.', ['xutian-cauldron', 'xutian-hall-contenders', 'chaotic-star-sea'], 'high'),
    item('outer-star-sea', '外星海', 'Outer Star Sea', 'Waixing Hai', '乱星海', 'Chaotic Star Sea arc', '乱星海中偏猎妖、资源采集和危险探索的海域空间。', 'A Chaotic Star Sea zone associated with demon-beast hunting, resource gathering, and dangerous exploration.', '它承接霓裳草、妖丹和海域经济。', 'It supports Rainbow Skirt Grass, demon cores, and maritime economy.', ['rainbow-skirt-grass', 'demon-core', 'chaotic-star-sea'], 'high'),
    item('inner-star-sea', '内星海', 'Inner Star Sea', 'Neixing Hai', '乱星海', 'Chaotic Star Sea arc', '乱星海更接近大势力秩序、岛屿修士和商贸网络的区域。', 'A Chaotic Star Sea zone closer to faction order, island cultivators, and trade networks.', '它和外星海构成乱星海的双层生态。', 'Together with the Outer Star Sea, it forms the two-layer maritime ecology.', ['star-palace', 'miao-yin-sect', 'chaotic-star-sea'], 'medium'),
    item('heavenly-abyss-city-region', '天渊城区域', 'Heavenly Abyss City Region', 'Tianyuan Cheng Quyu', '灵界早期', 'Early Spirit Realm arc', '韩立飞升灵界后接触的重要人族防线和区域秩序。', 'An important human defensive region and order that Han Li encounters after ascending to the Spirit Realm.', '它把飞升后的新世界压力具体化为城池、防线和族群战争。', 'It makes post-ascension pressure concrete through city defense, front lines, and racial war.', ['heavenly-abyss-city', 'spirit-realm-ascension', 'human-race'], 'high'),
    item('broad-cold-realm', '广寒界', 'Broad Cold Realm', 'Guanghan Jie', '灵界', 'Spirit Realm arc', '灵界相关特殊空间，适合整理机缘、秘境规则和多族参与。', 'A Spirit Realm special space suited to opportunities, secret-realm rules, and multi-race participation.', '它延续《凡人》“高风险秘境换高价值资源”的模式。', 'It continues RMJI high-risk secret-realm for high-value resources pattern.', ['spirit-realm', 'true-spirit-blood'], 'medium'),
    item('wild-world', '蛮荒世界', 'Wilderness World', 'Manhuang Shijie', '灵界', 'Spirit Realm arc', '灵界中与异族、妖兽、真灵和野外资源相关的广阔空间。', 'A broad Spirit Realm space tied to alien peoples, demon beasts, true spirits, and wilderness resources.', '它让灵界不只是城池和宗门，也有强烈生态压力。', 'It gives the Spirit Realm ecological pressure beyond cities and sects.', ['spirit-realm', 'demon-beasts', 'true-spirits'], 'medium'),
    item('devil-source-sea', '魔源海', 'Devil Source Sea', 'Moyuan Hai', '魔界线', 'Devil Realm thread', '魔界相关高危区域概念，可用于承接魔气、魔族材料和跨界冲突。', 'A high-risk Devil Realm region concept supporting devil Qi, devil materials, and cross-realm conflict.', '它补足魔界地理，而不只写魔族人物。', 'It fills out Devil Realm geography, not only devil figures.', ['demon-realm', 'true-demon-qi', 'devil-essence-diamond'], 'medium'),
    item('black-wind-island-region', '黑风岛区域', 'Black Wind Island Region', 'Heifeng Dao Quyu', '仙界篇早期', 'Early Immortal World Arc', '仙界篇开局中承接黑风海域、岛屿势力和韩立落脚的区域。', 'An early sequel region linking Black Wind Sea, island powers, and Han Li foothold.', '它让仙界开局有低处着陆点，而不是直接进入顶层斗争。', 'It gives the sequel a grounded landing point before top-level conflicts.', ['black-wind-island', 'black-wind-sea', 'immortal-realm-opening'], 'high'),
    item('candle-dragon-dao-region', '烛龙道山门', 'Candle Dragon Dao Grounds', 'Zhulong Dao Shanmen', '仙界篇早期', 'Early Immortal World Arc', '烛龙道相关修炼、任务和宗门生活空间。', 'The cultivation, mission, and sect-life space connected to Candle Dragon Dao.', '它承接仙界篇早期组织生态和法则功法学习。', 'It supports early sequel organization ecology and law-art learning.', ['candle-dragon-dao', 'candle-dragon-dao-arc'], 'high'),
    item('accumulated-scale-realm', '积鳞空境', 'Accumulated Scale Realm', 'Jilin Kongjing', '仙界篇特殊空间', 'Immortal World special space', '仙界篇中带有强烈试炼、生存和异域规则色彩的特殊空间线索。', 'A sequel special-space thread with strong trial, survival, and alien-rule qualities.', '它适合与灰界、生存术和肉身压力共同阅读。', 'It pairs well with Gray Realm, survival methods, and body-pressure themes.', ['gray-realm-survival-arts', 'body-refining-system'], 'medium'),
    item('gray-realm-cities', '灰界城池', 'Gray-Realm Cities', 'Huijie Chengchi', '仙界篇灰界阶段', 'Immortal World Gray Realm arc', '灰界社会中的城市和聚居结构总入口。', 'A hub for cities and settlements within Gray Realm society.', '它让灰界拥有社会组织和空间层次。', 'It gives the Gray Realm social organization and spatial layers.', ['gray-realm', 'gray-realm-powers', 'gray-realm-natives'], 'medium'),
    item('heavenly-court-prisons', '天庭牢狱', 'Heavenly Court Prisons', 'Tianting Laoyu', '仙界篇', 'Immortal World Arc', '天庭秩序中用于惩戒、追捕和关押的空间线索。', 'A space thread within Heavenly Court order around punishment, pursuit, and imprisonment.', '它让天庭不只是名义统治者，也具备制度性压迫。', 'It makes Heavenly Court an institutional power, not only a nominal ruler.', ['heavenly-court', 'heavenly-court-territory'], 'medium'),
    item('true-word-ruins-core', '真言门核心遗迹', 'True Word Sect Core Ruins', 'Zhenyan Men Hexin Yiji', '仙界篇历史线', 'Immortal World historical thread', '真言门传承、时间法则和历史因果集中出现的遗迹线索。', 'A ruin thread where True Word Sect inheritance, time law, and historical karma concentrate.', '它是仙界篇时间线索的重要空间锚点。', 'It is a major spatial anchor for the sequel time-law thread.', ['true-word-sect', 'mantra-sect-ruins', 'time-law'], 'high')
  ],
  laws: [
    item('law-domain', '灵域', 'Spiritual Domain', 'Lingyu', '仙界篇', 'Immortal World Arc', '仙界篇高阶修士用来展开自身法则环境、压制对手和影响战场的核心概念。', 'A core sequel concept where higher cultivators project their law environment to suppress enemies and influence battlefields.', '它把力量表现从法宝术法推进到“场域规则”。', 'It pushes power expression from artifacts and spells into field-like rules.', ['law-domain-technique', 'three-thousand-daos', 'time-law'], 'high'),
    item('immortal-spiritual-power', '仙灵力', 'Immortal Spiritual Power', 'Xianling Li', '仙界篇', 'Immortal World Arc', '仙界修士运转力量的基础能量概念，区别于低阶界面的灵气与法力。', 'The base power concept for immortal-world cultivators, distinct from lower-realm Qi and mana.', '它是理解真仙以后战力升级的基础词条。', 'It is a foundation entry for understanding power after True Immortal levels.', ['immortal-realm', 'true-immortal', 'immortal-origin-stone'], 'high'),
    item('time-dao-patterns', '时间道纹', 'Time Dao Patterns', 'Shijian Daowen', '仙界篇核心', 'Immortal World core', '用于整理时间法则感悟具象化、功法运转和法则痕迹的概念。', 'A concept for embodied time-law comprehension, art operation, and law traces.', '它让时间法则不只是抽象大道，而有可感知的修炼层次。', 'It makes time law a layered practice rather than only an abstract Dao.', ['time-law', 'time-crystal-materials', 'mantra-wheel-scripture'], 'medium'),
    item('reincarnation-cycle', '轮回道意', 'Reincarnation Dao Intent', 'Lunhui Daoyi', '仙界篇核心', 'Immortal World core', '轮回法则相关的道意和概念化力量，用于承接轮回殿线索。', 'A conceptual power around reincarnation law, supporting Reincarnation Palace threads.', '它和时间法则共同构成仙界篇最高层冲突的两条重要大道线。', 'Together with time law, it forms a key great-Dao axis in the sequel top conflict.', ['reincarnation-law', 'reincarnation-palace', 'reincarnation-palace-master'], 'high'),
    item('karma-thread', '因果线', 'Karmic Threads', 'Yinguo Xian', '全书至仙界篇', 'Whole series to Immortal World Arc', '用于整理人物重逢、前缘、追杀、传承和轮回线索的因果概念。', 'A concept for reunions, past ties, pursuits, inheritances, and reincarnation threads.', '它帮助专场解释《凡人》看似冷静叙事中持续回流的人情和旧账。', 'It helps explain the returning ties and old debts within RMJI otherwise restrained style.', ['nangong-wan', 'yuan-yao', 'reincarnation-law'], 'medium'),
    item('illusion-law', '幻之法则', 'Law of Illusion', 'Huan Zhi Faze', '仙界篇', 'Immortal World Arc', '与幻术、幻世、精神干扰和法则构造相关的大道方向。', 'A law direction tied to illusion, mental interference, illusory worlds, and law construction.', '它可与幻辰宝典、大五行幻世诀和灵目神通对读。', 'It can be read with the Phantom Star Manual, Great Five Elements Illusory World Art, and spirit-eye abilities.', ['phantom-star-manual', 'great-five-elements-illusory-world', 'spirit-eye-technique'], 'medium'),
    item('life-death-law', '生死法则', 'Law of Life and Death', 'Shengsi Faze', '仙界篇', 'Immortal World Arc', '围绕生灭、枯荣、轮回和神魂归宿展开的法则方向。', 'A law direction around life, death, withering and blooming, reincarnation, and soul fate.', '它连接东乙枯荣经、轮回法则和魂魄类设定。', 'It links Eastern Yi Wither-Bloom Scripture, reincarnation law, and soul-related settings.', ['east-wood-wither-bloom', 'reincarnation-law', 'soul-nurturing-wood'], 'medium'),
    item('metal-law', '金之法则', 'Law of Metal', 'Jin Zhi Faze', '仙界篇 / 五行线', 'Immortal World / Five Elements thread', '五行法则中的金行方向，可与剑、庚金、锋锐和金雷材料关联。', 'The metal phase of five-element laws, connectable with swords, Geng metal, sharpness, and thunder-metal materials.', '它给剑修和金属性资源提供法则层解释。', 'It gives sword and metal-resource threads a law-level explanation.', ['five-elements-law', 'sword-law', 'geng-metal'], 'medium'),
    item('wood-law', '木之法则', 'Law of Wood', 'Mu Zhi Faze', '仙界篇 / 五行线', 'Immortal World / Five Elements thread', '五行法则中的木行方向，关联生机、枯荣、灵草和木属性功法。', 'The wood phase of five-element laws, tied to vitality, withering-flourishing cycles, herbs, and wood arts.', '它让灵草、枯荣功法和生命类法则形成互文。', 'It connects herbs, wither-bloom arts, and life-oriented laws.', ['five-elements-law', 'east-wood-wither-bloom', 'spirit-herb-seeds'], 'medium'),
    item('water-law', '水之法则', 'Law of Water', 'Shui Zhi Faze', '仙界篇 / 五行线', 'Immortal World / Five Elements thread', '五行法则中的水行方向，关联流转、四时、柔化和海域意象。', 'The water phase of five-element laws, tied to circulation, seasons, soft transformation, and maritime imagery.', '它适合与水衍四时诀、黑风海域和乱星海资源对读。', 'It pairs with Water Derivation Four Seasons Art, Black Wind Sea, and Chaotic Star Sea resources.', ['five-elements-law', 'water-derivation-four-seasons', 'black-wind-sea'], 'medium'),
    item('fire-law', '火之法则', 'Law of Fire', 'Huo Zhi Faze', '仙界篇 / 五行线', 'Immortal World / Five Elements thread', '五行法则中的火行方向，关联炼丹、炼器、毁伤和阳性力量。', 'The fire phase of five-element laws, tied to alchemy, crafting, destruction, and yang force.', '它可以连接炼丹术、火属性功法和仙界斗法。', 'It connects alchemy, fire arts, and immortal-world combat.', ['five-elements-law', 'alchemy-art', 'immortal-pills'], 'medium'),
    item('earth-law', '土之法则', 'Law of Earth', 'Tu Zhi Faze', '仙界篇 / 五行线', 'Immortal World / Five Elements thread', '五行法则中的土行方向，关联镇压、防御、山岳类重宝和空间稳定。', 'The earth phase of five-element laws, tied to suppression, defense, mountain-like treasures, and spatial stability.', '它可与元合五极山、元磁山和防御型法宝互链。', 'It can cross-link with the Yuanhe Five-Pole Mountain, magnetic mountains, and defensive treasures.', ['five-elements-law', 'yuanhe-five-pole-mountain'], 'medium'),
    item('wind-law', '风之法则', 'Law of Wind', 'Feng Zhi Faze', '仙界篇', 'Immortal World Arc', '与遁速、撕裂、风雷移动和空间流动有关的法则方向。', 'A law direction tied to escape speed, tearing force, wind-thunder movement, and spatial flow.', '它补充风雷翅和遁术线的高阶解释。', 'It provides a high-level explanation for Wind-Thunder Wings and escape arts.', ['wind-thunder-wings', 'stealth-escape-arts', 'space-law'], 'medium'),
    item('devouring-law', '吞噬法则', 'Law of Devouring', 'Tunshi Faze', '仙界篇 / 灵虫线', 'Immortal World / spirit-insect thread', '与吞噬、吸收、虫群成长和资源转化相关的法则方向。', 'A law direction around devouring, absorption, swarm growth, and resource conversion.', '它适合与噬金虫、金童和灵虫成长线共同阅读。', 'It pairs well with Gold-Devouring Beetles, Golden Child, and spirit-insect growth.', ['gold-devouring-beetles', 'golden-child', 'spirit-insects'], 'medium'),
    item('gray-realm-miasma', '灰界煞气', 'Gray-Realm Miasma', 'Huijie Shaqi', '仙界篇灰界阶段', 'Immortal World Gray Realm arc', '灰界环境中影响修士状态、资源使用和生存方式的异质力量。', 'An alien force in the Gray Realm environment affecting cultivator condition, resource use, and survival methods.', '它是灰界异质感的重要来源。', 'It is a major source of the Gray Realm alien feel.', ['gray-realm-law', 'gray-realm-survival-arts', 'gray-realm-materials'], 'high')
  ],
  characters: [
    item('qu-hun', '曲魂', 'Qu Hun', 'Qu Hun', '人界早期', 'Early Mortal Realm arc', '韩立早期傀儡/分身式战力线索之一，承接墨大夫事件后的技术利用。', 'An early puppet-like combat thread for Han Li, continuing technical use after Doctor Mo events.', '他体现韩立会把风险转化为可控工具，而不是只靠正面对抗。', 'He shows Han Li turns risk into controlled tools rather than relying only on direct combat.', ['doctor-mo', 'puppet-refinement', 'han-li'], 'high'),
    item('yan-ruyan', '燕如嫣', 'Yan Ruyan', 'Yan Ruyan', '人界早中期', 'Early-middle Mortal Realm arc', '越国与魔道冲突相关人物之一，牵动家族、宗门和身份选择。', 'A figure tied to Yue and devil-path conflict, involving clan, sect, and identity choices.', '她可补充早期人物关系不是单纯敌友，而常被势力结构裹挟。', 'She shows early relationships are often shaped by faction structures, not simple friend/enemy labels.', ['devil-dao-six-sects', 'yue-state'], 'medium'),
    item('dong-xuaner', '董萱儿', 'Dong Xuaner', 'Dong Xuaner', '人界早期', 'Early Mortal Realm arc', '黄枫谷及早期宗门人际线相关人物。', 'A figure tied to Yellow Maple Valley and early sect interpersonal threads.', '她适合补足早期宗门日常、任务关系和人物张力。', 'She helps fill early sect daily life, mission relations, and interpersonal tension.', ['huangfeng-valley', 'yellow-maple-cultivation'], 'medium'),
    item('han-yunzhi', '菡云芝', 'Han Yunzhi', 'Han Yunzhi', '人界早期', 'Early Mortal Realm arc', '早期交易、灵药和宗门外人情线相关人物。', 'An early figure tied to trade, herbs, and human ties outside strict sect hierarchy.', '她能把灵药资源和人物善缘连接起来。', 'She links herb resources with personal goodwill threads.', ['spirit-herb-seeds', 'blood-forbidden-land'], 'medium'),
    item('mu-peiling', '慕沛灵', 'Mu Peiling', 'Mu Peiling', '人界中后期', 'Mortal Realm middle-late arc', '韩立后期人界关系线之一，涉及门下、身份安排和情感错位。', 'A later Mortal Realm relationship thread involving discipleship, arranged status, and emotional mismatch.', '她适合补充韩立成长后与低阶修士关系的变化。', 'She helps show how Han Li relationships with lower-level cultivators change after his rise.', ['han-li', 'heavenly-south-region'], 'medium'),
    item('tianxing-sages', '天星双圣', 'Twin Sages of Star Palace', 'Tianxing Shuangsheng', '乱星海', 'Chaotic Star Sea arc', '星宫最高层代表人物群，承接乱星海秩序、传承和权力压力。', 'The top Star Palace figures, carrying Chaotic Star Sea order, inheritance, and power pressure.', '他们让乱星海势力格局具有顶层权威。', 'They give the Chaotic Star Sea faction map a top-level authority.', ['star-palace', 'ling-yuling', 'chaotic-star-sea'], 'high'),
    item('qing-yuanzi', '青元子', 'Qing Yuanzi', 'Qing Yuanzi', '灵界后期', 'Late Spirit Realm arc', '与青元剑诀、灵界后续和韩立高阶传承关系密切的人物。', 'A figure closely tied to Azure Essence Sword Art, later Spirit Realm threads, and Han Li high-level inheritance.', '他把早期剑诀线索延伸到更高层传承。', 'He extends the early sword-art thread into higher inheritance.', ['qingyuan-sword-art', 'green-origin-palace', 'han-li'], 'high'),
    item('mo-jianli', '莫简离', 'Mo Jianli', 'Mo Jianli', '灵界人族线', 'Spirit Realm human thread', '灵界人族高阶人物之一，代表族群责任和大乘层级压力。', 'A high-level Spirit Realm human figure representing racial responsibility and Mahayana-level pressure.', '他让灵界人族线具备前辈、守护和族群存亡维度。', 'He gives the Spirit Realm human thread senior guardianship and racial survival dimensions.', ['human-race', 'heavenly-abyss-city-region'], 'medium'),
    item('ao-xiao-ancestor', '敖啸老祖', 'Ao Xiao Ancestor', 'Aoxiao Laozu', '灵界妖族线', 'Spirit Realm demon-race thread', '灵界妖族高阶人物之一，可与银月、冰凤和真灵血脉线索相连。', 'A high-level Spirit Realm demon-race figure, connectable with Silvermoon, Ice Phoenix, and true-spirit bloodlines.', '他补充灵界妖族不是背景，而有自身高阶权力结构。', 'He shows Spirit Realm demon races have their own high-level power structure.', ['demon-race', 'silvermoon', 'ice-phoenix'], 'medium'),
    item('ma-liang', '马良', 'Ma Liang', 'Ma Liang', '灵界后期', 'Late Spirit Realm arc', '灵界后期极具压迫感的上界来客线索，牵动跨界力量差。', 'A highly oppressive late Spirit Realm upper-world visitor thread, highlighting cross-realm power gaps.', '他把灵界篇推向仙界规则提前介入的压力。', 'He pushes the Spirit Realm arc toward the pressure of immortal-world rules arriving early.', ['spirit-realm', 'immortal-realm-opening'], 'high'),
    item('hu-yan-daoist', '呼言道人', 'Hu Yan Daoist', 'Hu Yan Daoren', '仙界篇早期', 'Early Immortal World Arc', '仙界篇早期与韩立相交的重要修士之一，连接黑风海域和仙界人情线。', 'An important early sequel cultivator connected with Han Li, Black Wind Sea, and immortal-world personal ties.', '他让仙界篇开局除了追逃之外，还有同行、交易和旧怨新缘。', 'He adds companionship, trade, and personal ties to the sequel opening beyond pursuit.', ['black-wind-sea', 'black-wind-island', 'han-li'], 'high'),
    item('lu-yuqing', '陆雨晴', 'Lu Yuqing', 'Lu Yuqing', '仙界篇早期', 'Early Immortal World Arc', '仙界篇早期与黑风海域、人情和同行线相关的人物。', 'An early sequel figure tied to the Black Wind Sea, personal ties, and travel threads.', '她补充仙界篇早期地方社会和人物关系网。', 'She enriches early sequel local society and relationship networks.', ['black-wind-sea', 'hu-yan-daoist'], 'medium'),
    item('bai-suyuan', '白素媛', 'Bai Suyuan', 'Bai Suyuan', '仙界篇早期', 'Early Immortal World Arc', '仙界篇早期相关人物之一，适合归入黑风海域与人情因果线。', 'An early sequel figure suited to Black Wind Sea and personal-karma threads.', '她作为人物索引，方便后续继续补具体事件。', 'This index supports later event-level expansion.', ['black-wind-sea', 'immortal-realm-opening'], 'verify'),
    item('qi-mozi', '奇摩子', 'Qi Mozi', 'Qi Mozi', '仙界篇真言门线', 'Immortal World True Word Sect thread', '真言门二弟子，修火属性时间法则，叛变后投靠天庭，后为大罗中期级别的仙域域主/高阶追索者。', 'The second disciple of True Word Sect, a fire-aspected time-law cultivator who betrayed the sect, joined Heavenly Court, and later appears as a mid-Great-Luo domain-lord-level pursuer.', '他的页面必须承接弥罗老祖、真言门覆灭、天庭仙狱和韩立被追索线。', 'His page must connect Mi Luo Ancestor, the fall of True Word Sect, Heavenly Court prisons, and the pursuit of Han Li.', ['mi-luo-ancestor', 'severing-time-flowing-fire', 'heavenly-court', 'time-law', 'han-li'], 'high'),
    item('luo-qinghai', '洛青海', 'Luo Qinghai', 'Luo Qinghai', '仙界篇', 'Immortal World Arc', '仙界篇宗门与法则路线中的重要人物线索。', 'An important sequel figure within sect and law-path threads.', '他适合与烛龙道、仙界势力和高阶修炼关系继续补全。', 'He fits later expansion around Candle Dragon Dao, immortal factions, and higher cultivation.', ['candle-dragon-dao', 'immortal-realm'], 'verify'),
    item('gu-huajin', '古或今', 'Gu Huojin', 'Gu Huojin', '仙界篇高阶', 'High-level sequel', '仙界篇顶层权力与时间法则核心人物，时间道祖级存在，与真言门覆灭、弥罗老祖陨落和终局大道冲突相关。', 'A top sequel figure and time-Dao-Ancestor-level existence tied to the fall of True Word Sect, Mi Luo death, and the final great-Dao conflict.', '此页涉及强剧透，应明确写清时间法则、天庭秩序、弥罗老祖和韩立终局对抗。', 'This is highly spoilery and should clearly document time law, Heavenly Court order, Mi Luo Ancestor, and the endgame conflict with Han Li.', ['time-dao-ancestor', 'time-law', 'heavenly-court', 'mi-luo-ancestor'], 'high')
  ],
  timeline: [
    item('blood-forbidden-land-arc', '血色禁地试炼', 'Blood Forbidden Land Trial', 'Xuese Jindi Shilian', '人界早期', 'Early Mortal Realm arc', '越国七派弟子为筑基资源进入秘境争夺，是韩立早期修仙残酷性的集中展示。', 'Yue sect disciples enter a secret realm for Foundation resources, concentrating the cruelty of Han Li early cultivation.', '它是从宗门入门走向资源生死争夺的关键阶段。', 'It is the key shift from joining a sect into lethal resource competition.', ['blood-forbidden-land', 'foundation-materials', 'yue-seven-sects'], 'high'),
    item('demonfall-valley-arc', '坠魔谷事件', 'Demonfall Valley Arc', 'Zhuimo Gu Shijian', '人界中后期', 'Mortal Realm middle-late arc', '人界中后期重要险地事件，连接古魔、遗迹、宝物和高阶修士算计。', 'A major middle-late Mortal Realm danger-zone event linking ancient devils, ruins, treasures, and high-level schemes.', '它让秘境探索升级为多方高阶风险。', 'It upgrades secret-realm exploration into multi-party high-level danger.', ['demonfall-valley', 'ancient-devils', 'ancient-treasure'], 'high'),
    item('kunwu-mountain-arc', '昆吾山遗迹', 'Kunwu Mountain Ruins Arc', 'Kunwu Shan Yiji', '人界后期', 'Late Mortal Realm arc', '围绕昆吾山展开的人界后期大事件，牵动大晋势力和古修遗留。', 'A late Mortal Realm event around Kunwu Mountain, involving Great Jin powers and ancient inheritances.', '它是飞升前人界大舞台的重要组成。', 'It is an important part of the larger Mortal Realm stage before ascension.', ['kunwu-mountain', 'imperial-ye-clan', 'kunwu-mountain-factions'], 'high'),
    item('heavenly-abyss-city-arc', '天渊城阶段', 'Heavenly Abyss City Arc', 'Tianyuan Cheng Jieduan', '灵界早期', 'Early Spirit Realm arc', '韩立飞升灵界后接触人族防线、族群战争和更高修炼秩序的重要阶段。', 'After ascending to the Spirit Realm, Han Li encounters human defenses, racial war, and higher cultivation order.', '它承接飞升后的落地压力。', 'It carries the grounded pressure after ascension.', ['heavenly-abyss-city-region', 'spirit-realm-ascension', 'human-race'], 'high'),
    item('broad-cold-realm-arc', '广寒界机缘', 'Broad Cold Realm Opportunity', 'Guanghan Jie Jiyuan', '灵界', 'Spirit Realm arc', '灵界特殊空间相关阶段，集中呈现多族参与、机缘争夺和秘境规则。', 'A Spirit Realm special-space stage showing multi-race participation, opportunity competition, and secret-realm rules.', '它延续《凡人》秘境资源争夺传统。', 'It continues RMJI tradition of secret-realm resource competition.', ['broad-cold-realm', 'spirit-realm', 'true-spirit-blood'], 'medium'),
    item('true-word-sect-ruins-arc', '真言门遗迹线', 'True Word Sect Ruins Thread', 'Zhenyan Men Yiji Xian', '仙界篇', 'Immortal World Arc', '仙界篇围绕真言门、时间法则和历史因果展开的重要遗迹线。', 'A key sequel ruin thread around True Word Sect, time law, and historical karma.', '它是仙界篇时间线索的重要支柱。', 'It is a major pillar of the sequel time-law thread.', ['true-word-ruins-core', 'true-word-sect', 'time-law'], 'high'),
    item('reincarnation-palace-thread', '轮回殿暗线', 'Reincarnation Palace Thread', 'Lunhui Dian Anxian', '仙界篇', 'Immortal World Arc', '围绕轮回殿任务、身份、反天庭秩序和轮回法则展开的长期暗线。', 'A long-term sequel undercurrent around Reincarnation Palace missions, identity, anti-Heavenly-Court order, and reincarnation law.', '它和天庭构成仙界篇主要政治张力之一。', 'It forms one of the sequel main political tensions against Heavenly Court.', ['reincarnation-palace', 'reincarnation-law', 'jiao-san'], 'high'),
    item('heavenly-court-conflict-thread', '天庭冲突线', 'Heavenly Court Conflict Thread', 'Tianting Chongtu Xian', '仙界篇', 'Immortal World Arc', '围绕天庭追索、秩序统治、道祖体系和高阶法则斗争展开的主线压力。', 'A main sequel pressure thread around Heavenly Court pursuit, order, Dao Ancestors, and high-level law conflict.', '它让仙界篇的对抗从个人恩怨上升到制度与大道之争。', 'It raises sequel conflict from personal grievance to institutional and Dao-level struggle.', ['heavenly-court', 'dao-ancestor-system', 'qi-mozi'], 'high')
  ]
}

for (const [section, entries] of Object.entries(supplementalCatalog)) {
  catalog[section].push(...entries)
}

const completionCatalog = {
  techniques: [
    item('artifact-refining-art', '炼器术', 'Artifact Refining Arts', 'Lianqi Shu', '全书通用', 'Whole-series recurring system', '法宝、灵宝、傀儡、阵旗和特殊器物背后的炼制技艺总入口。', 'A hub for the crafting arts behind artifacts, spirit treasures, puppets, formation flags, and special vessels.', '它把材料、火候、阵纹和神识控制串成一条技术线。', 'It connects materials, fire control, inscription patterns, and divine-sense control into one technical path.', ['ancient-treasure', 'formation-plate', 'puppet-core'], 'high'),
    item('spiritual-flame-system', '灵焰体系', 'Spiritual Flame System', 'Lingyan Tixi', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '火焰类神通、炼丹火候、冰焰异火和高阶法则火力的总入口。', 'A hub for flame abilities, alchemy fire control, ice-flame variants, and higher law-based fire power.', '灵焰既能斗法，也能炼丹炼器，是资源与战斗之间的桥梁。', 'Spiritual flames bridge combat, alchemy, and artifact crafting.', ['alchemy-art', 'fire-law', 'purple-apex-flame'], 'high'),
    item('purple-apex-flame', '紫罗极火', 'Purple Apex Flame', 'Ziluo Jihuo', '人界中后期', 'Mortal Realm middle-late arc', '韩立火焰神通线索之一，可放在异火、炼器和高阶斗法之间理解。', 'One of Han Li flame-ability threads, readable through strange flames, crafting, and higher combat.', '它补充韩立法宝之外的属性型攻击手段。', 'It complements Han Li treasure-based combat with attribute-based offense.', ['spiritual-flame-system', 'fire-law'], 'medium'),
    item('ice-flame-arts', '冰焰神通', 'Ice-Flame Arts', 'Bingyan Shentong', '人界至灵界', 'Mortal to Spirit Realm', '冰寒、异火和特殊灵焰结合的神通方向。', 'A divine-ability direction combining cold power, strange flames, and special spiritual fire.', '它让五行属性和特殊环境在斗法中有更细的克制关系。', 'It gives elemental attributes and special environments finer combat-counter relationships.', ['spiritual-flame-system', 'water-law', 'ice-phoenix'], 'medium'),
    item('possession-secret-art', '夺舍秘术', 'Possession Secret Arts', 'Duoshe Mishu', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '元神夺舍、换体、借壳重生等高风险神魂术法的总入口。', 'A hub for high-risk soul methods such as possession, body replacement, and borrowed rebirth.', '它解释墨大夫、古修残魂和高阶修士保命手段背后的残酷逻辑。', 'It explains the harsh logic behind Doctor Mo, remnant souls, and high-level survival methods.', ['doctor-mo', 'soul-searching-art', 'soul-nurturing-wood'], 'high'),
    item('avatar-clone-art', '化身分身术', 'Avatar and Clone Arts', 'Huashen Fenshen Shu', '灵界至仙界篇', 'Spirit Realm to Immortal World Arc', '分身、化身、替身和远程行动相关的高阶术法总入口。', 'A hub for avatars, clones, substitutes, and remote action methods.', '它让高阶修士的布局不再受单一本体限制。', 'It lets high-level cultivators scheme beyond a single body.', ['six-extremes', 'reincarnation-palace-master', 'puppet-refinement'], 'medium'),
    item('nascent-soul-out-of-body', '元婴出窍', 'Nascent Soul Leaving the Body', 'Yuanying Chuqiao', '人界至灵界', 'Mortal to Spirit Realm', '元婴修士神魂离体、逃生、夺舍和特殊斗法相关概念。', 'A concept around Nascent Soul leaving the body for escape, possession, and special combat.', '它让元婴期以上的生死规则比低阶阶段更复杂。', 'It makes life-and-death rules more complex after Nascent Soul levels.', ['nascent-soul', 'possession-secret-art', 'soul-nurturing-wood'], 'high'),
    item('restriction-breaking-art', '破禁术', 'Restriction-Breaking Arts', 'Pojin Shu', '秘境与遗迹', 'Secret realms and ruins', '破解阵法、禁制、封印和洞府机关的技术型术法。', 'Technical arts for breaking formations, restrictions, seals, and dwelling mechanisms.', '它把探索遗迹写成技术题，而不是单纯打怪。', 'It makes ruin exploration a technical problem rather than only combat.', ['formation-restrictions', 'restriction-token', 'spirit-eye-technique'], 'high'),
    item('blood-path-arts', '血道秘术', 'Blood-Path Arts', 'Xuedao Mishu', '魔道与禁术线', 'Demonic and taboo thread', '血祭、血遁、血脉消耗和禁忌强化相关术法总入口。', 'A hub for blood sacrifice, blood escape, bloodline consumption, and taboo enhancement.', '它体现修仙世界中以寿元、血气和因果换力量的阴暗面。', 'It shows the darker side of trading vitality, blood, and karma for power.', ['devil-arts-system', 'true-spirit-blood', 'stealth-escape-arts'], 'medium'),
    item('ghost-path-arts', '鬼道功法', 'Ghost-Path Arts', 'Guidao Gongfa', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '阴魂、鬼物、冥地、搜魂和魂魄压制相关功法总入口。', 'A hub for ghost souls, underworld-like regions, soul searching, and soul suppression.', '它把元瑶、啼魂、养魂木等线索集中到神魂风险主题下。', 'It gathers Yuan Yao, Weeping Soul, and soul-nurturing wood under soul-risk themes.', ['yuan-yao', 'weeping-soul-beast', 'soul-nurturing-wood'], 'high'),
    item('sword-cultivator-path', '剑修路线', 'Sword Cultivator Path', 'Jianxiu Luxian', '人界至灵界', 'Mortal to Spirit Realm', '以飞剑、本命法宝、剑阵和剑道感悟构成的修炼路线。', 'A cultivation path built from flying swords, bonded artifacts, sword formations, and sword Dao comprehension.', '它是韩立战斗体系里最有连续性的路线之一。', 'It is one of the most continuous lines in Han Li combat system.', ['flying-sword-control', 'dageng-sword-array', 'sword-law'], 'high'),
    item('movement-escape-system', '遁法体系', 'Escape-Art System', 'Dunfa Tixi', '全书通用', 'Whole-series recurring system', '遁速、隐匿、传送、风雷移动和保命撤退的总入口。', 'A hub for speed, concealment, teleportation, wind-thunder movement, and survival retreat.', '它是凡人流“先活下来”的核心技术组。', 'It is a core technical group for mortal-flow survival-first logic.', ['stealth-escape-arts', 'lightning-escape', 'wind-thunder-wings'], 'high'),
    item('divine-sense-control', '神识操控', 'Divine-Sense Control', 'Shenshi Caokong', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '操控法宝、傀儡、剑阵、灵虫和多线战斗的基础能力。', 'The base ability for controlling treasures, puppets, sword formations, spirit insects, and multi-front combat.', '它是技术型修仙的底盘，越到高阶越重要。', 'It is the chassis of technical cultivation and grows more important at higher levels.', ['great-development-art', 'puppet-refinement', 'sword-array-method'], 'high'),
    item('spirit-root-aptitude', '灵根资质', 'Spirit Root Aptitude', 'Linggen Zizhi', '人界早期', 'Early Mortal Realm arc', '修士初始资质、修炼速度和宗门筛选逻辑的基础设定。', 'The foundational setting for aptitude, cultivation speed, and sect selection.', '它解释韩立为何需要靠资源、谨慎和时间弥补起点。', 'It explains why Han Li must compensate for his starting point through resources, caution, and time.', ['han-li', 'qi-refining-pills', 'foundation-establishment-pill'], 'high'),
    item('bottleneck-breakthrough', '瓶颈突破', 'Bottleneck Breakthrough', 'Pingjing Tupo', '全书通用', 'Whole-series recurring system', '修炼阶段之间的瓶颈、丹药辅助、心境和资源准备总入口。', 'A hub for bottlenecks between stages, pill assistance, mental state, and resource preparation.', '它把境界提升写成长期工程，而不是经验值升级。', 'It makes realm progression a long project rather than experience-point leveling.', ['foundation-establishment-pill', 'gold-forming-pill', 'dao-pill'], 'high')
  ],
  artifacts: [
    item('storage-pouch', '储物袋', 'Storage Pouch', 'Chuwu Dai', '全书通用', 'Whole-series recurring tool', '修士携带灵石、法器、丹药和杂物的基础空间道具。', 'A basic spatial tool for carrying spirit stones, artifacts, pills, and supplies.', '它让修仙生活具有物资管理感，也支撑韩立的底牌积累。', 'It gives cultivation life a sense of inventory management and supports Han Li stockpiling.', ['spirit-stone', 'auction-resources'], 'high'),
    item('spirit-boat', '飞舟', 'Spirit Boat', 'Feizhou', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '长距离飞遁、队伍移动和跨域旅行常用的交通类法器。', 'A vehicle-type artifact used for long-distance flight, group travel, and cross-region movement.', '它补充地图推进时的交通逻辑。', 'It supports the travel logic behind map expansion.', ['movement-escape-system', 'black-wind-sea'], 'medium'),
    item('teleportation-formation', '传送阵', 'Teleportation Formation', 'Chuansong Zhen', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '跨地域、跨秘境甚至跨界面移动的重要空间设施。', 'An important spatial facility for travel across regions, secret realms, and sometimes realms.', '它让大地图叙事可行，也常带来追杀和误入风险。', 'It enables large-map storytelling while creating pursuit and misplacement risks.', ['space-law', 'formation-restrictions', 'movement-escape-system'], 'high'),
    item('alchemy-cauldron', '丹炉', 'Alchemy Cauldron', 'Danlu', '全书资源线', 'Whole-series resource thread', '炼制丹药所需的核心器具，关系到火候、材料承载和成丹率。', 'The core tool for pill refinement, tied to fire control, material handling, and success rate.', '它把炼丹术从抽象技能落到具体工具。', 'It grounds alchemy as a concrete craft rather than an abstract skill.', ['alchemy-art', 'pill-formulas', 'spiritual-flame-system'], 'high'),
    item('crafting-furnace', '炼器炉', 'Crafting Furnace', 'Lianqi Lu', '全书技术线', 'Whole-series technical thread', '炼器、熔炼材料和锻造法宝时使用的工具概念。', 'A tool concept for artifact crafting, material smelting, and treasure forging.', '它和炼器术、法宝材料、火焰控制共同构成装备体系。', 'It forms the equipment system with crafting arts, treasure materials, and fire control.', ['artifact-refining-art', 'law-materials', 'fire-law'], 'medium'),
    item('flying-needle-artifacts', '飞针法宝', 'Flying-Needle Artifacts', 'Feizhen Fabao', '人界至灵界', 'Mortal to Spirit Realm', '细小、隐蔽、突袭型法宝总类，适合整理阴险斗法和破防手段。', 'A class of small, hidden, ambush-style treasures suited to surprise attacks and defense piercing.', '它补充飞剑之外的法宝形态。', 'It supplements treasure forms beyond flying swords.', ['stealth-escape-arts', 'artifact'], 'medium'),
    item('shield-artifacts', '护盾法宝', 'Shield Artifacts', 'Hudun Fabao', '全书通用', 'Whole-series recurring tools', '防御、拖延、抗雷劫和抵御突袭的护身法宝总类。', 'A defensive treasure class used for protection, delay, tribulation resistance, and ambush defense.', '它体现韩立斗法时重视防守层和撤退空间。', 'It shows Han Li values defensive layers and retreat room.', ['yuanhe-five-pole-mountain', 'earth-law'], 'medium'),
    item('seal-artifacts', '印玺类法宝', 'Seal-Type Artifacts', 'Yinxi Lei Fabao', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '以镇压、砸击、封禁和权威意象为主的重宝类型。', 'A heavy treasure type focused on suppression, crushing, sealing, and authority imagery.', '它适合与山岳重宝、防御和封印禁制并读。', 'It pairs with mountain-like treasures, defense, and sealing restrictions.', ['earth-law', 'formation-restrictions'], 'medium'),
    item('banner-artifacts', '幡旗类法宝', 'Banner and Flag Artifacts', 'Fanqi Lei Fabao', '魔道与阵法线', 'Demonic and formation thread', '阵旗、魂幡、魔幡等旗幡类法宝的总入口。', 'A hub for formation flags, soul banners, devil banners, and related treasure forms.', '它连接阵法布置、魂魄压制和魔道斗法。', 'It connects formation deployment, soul suppression, and demonic combat.', ['formation-plate', 'myriad-soul-banner', 'ghost-path-arts'], 'high'),
    item('spirit-beast-token', '灵兽牌', 'Spirit Beast Token', 'Lingshou Pai', '御兽与灵虫线', 'Beast-taming and spirit-insect thread', '用于安置、收纳或标记灵兽灵虫的道具概念。', 'A tool concept for storing, housing, or marking spirit beasts and insects.', '它补充灵兽袋之外的御兽工具层。', 'It adds a tool layer beyond spirit-beast bags.', ['spirit-beast-bag', 'beast-taming-art', 'spirit-insects'], 'medium'),
    item('message-talisman', '传音符', 'Message Talisman', 'Chuanyin Fu', '全书通用', 'Whole-series recurring tool', '修士之间远距离传讯、约见、求援和传递情报的常用符箓。', 'A common talisman for long-distance messages, meetings, calls for aid, and intelligence transfer.', '它让宗门任务、追踪和势力联络更具体。', 'It makes sect missions, pursuit, and faction coordination more concrete.', ['talisman-making', 'sects-and-factions-network'], 'medium'),
    item('identity-token', '身份令牌', 'Identity Token', 'Shenfen Lingpai', '宗门与仙界秩序', 'Sect and immortal-world order', '宗门弟子、组织成员、任务身份和通行权限的信物。', 'A token for sect discipleship, organization membership, mission identity, and access permissions.', '它适合解释韩立不断变换身份和进入组织体系的过程。', 'It helps explain Han Li shifting identities and entry into institutions.', ['candle-dragon-dao', 'impermanence-alliance', 'reincarnation-palace'], 'medium'),
    item('cave-dwelling-tools', '洞府器具', 'Cave-Dwelling Tools', 'Dongfu Qiju', '全书生活线', 'Whole-series life thread', '洞府开辟、禁制布置、灵药园管理和闭关修炼所需器具总入口。', 'A hub for dwelling setup, restrictions, herb gardens, and secluded cultivation tools.', '它让修仙日常有经营感，不只是一场接一场斗法。', 'It gives cultivation daily life a management layer beyond constant fighting.', ['medicine-garden', 'formation-restrictions', 'spirit-eye-tree'], 'high')
  ],
  elixirs: [
    item('mana-increasing-pills', '增进法力丹药', 'Mana-Increasing Pills', 'Zengjin Fali Danyao', '全书通用', 'Whole-series recurring resource', '用于提升法力、缩短闭关时间和辅助日常修炼的丹药总类。', 'A general class of pills for increasing mana, shortening seclusion, and supporting routine cultivation.', '它说明修炼速度长期受资源供应影响。', 'It shows cultivation speed is constantly shaped by resource supply.', ['qi-refining-pills', 'immortal-pills', 'alchemy-art'], 'high'),
    item('healing-pills', '疗伤丹药', 'Healing Pills', 'Liaoshang Danyao', '全书通用', 'Whole-series recurring resource', '斗法、秘境和逃亡后恢复伤势的基础丹药总类。', 'A basic pill category for recovering after battles, secret realms, and flight.', '它支撑韩立持续冒险后的恢复与再投入。', 'It supports Han Li cycle of risk, recovery, and renewed action.', ['alchemy-art', 'medicine-garden'], 'medium'),
    item('detox-pills', '解毒丹药', 'Detox Pills', 'Jiedu Danyao', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '应对毒虫、毒雾、魔气污染和异域环境的丹药总类。', 'A pill class for poisons, toxic mist, devil-Qi pollution, and alien environments.', '它适合与灰界、魔界和秘境环境危险相连。', 'It connects naturally with Gray Realm, Devil Realm, and secret-realm hazards.', ['gray-realm-miasma', 'devil-source-sea'], 'medium'),
    item('soul-restoring-pills', '养神丹药', 'Soul-Restoring Pills', 'Yangshen Danyao', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '用于恢复神识、滋养神魂或缓解搜魂反噬的丹药概念。', 'A pill concept for restoring divine sense, nourishing souls, or easing backlash from soul methods.', '它补充炼神术和养魂木的资源侧。', 'It adds the resource side of spirit refinement and soul-nurturing wood.', ['refining-spirit-art', 'soul-nurturing-wood', 'soul-searching-art'], 'medium'),
    item('lifespan-pills', '延寿丹药', 'Lifespan-Extending Pills', 'Yanshou Danyao', '全书通用', 'Whole-series recurring resource', '延长寿元、争取突破时间和引发高阶修士争夺的丹药总类。', 'A pill class for extending lifespan, buying breakthrough time, and driving high-level competition.', '它把长生理想落到残酷的时间成本上。', 'It grounds immortality in the harsh cost of time.', ['immortality', 'bottleneck-breakthrough'], 'medium'),
    item('breakthrough-pills', '破阶丹药', 'Breakthrough Pills', 'Pojie Danyao', '全书通用', 'Whole-series recurring resource', '辅助跨越小瓶颈或大境界门槛的丹药总类。', 'A general class of pills used to cross minor bottlenecks or major realm thresholds.', '它是凡人流资源竞争最核心的物件类别之一。', 'It is one of the core resource categories in mortal-flow competition.', ['foundation-establishment-pill', 'gold-forming-pill', 'infant-formation-pill'], 'high'),
    item('poison-materials', '毒道材料', 'Poison-Path Materials', 'Dudao Cailiao', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '毒虫、毒草、毒雾和特殊炼制所需材料的总入口。', 'A hub for poisonous insects, herbs, mists, and special refinement materials.', '它补足斗法中的阴性手段和环境危险。', 'It fills out sinister combat methods and environmental hazards.', ['detox-pills', 'demon-beast-materials'], 'medium'),
    item('yin-cold-materials', '阴寒材料', 'Yin-Cold Materials', 'Yinhan Cailiao', '鬼道与冰焰线', 'Ghost-path and ice-flame thread', '阴冥、寒冰、魂魄和冰焰类功法常用材料。', 'Materials used in underworld-like, cold, soul, and ice-flame arts.', '它连接鬼道功法、冰焰神通和养魂资源。', 'It connects ghost-path arts, ice-flame arts, and soul resources.', ['ghost-path-arts', 'ice-flame-arts', 'soul-nurturing-wood'], 'medium'),
    item('thunder-materials', '雷属性材料', 'Thunder-Attribute Materials', 'Leishuxing Cailiao', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '金雷竹、雷属性妖兽材料和雷法炼制资源的总入口。', 'A hub for Golden Thunder Bamboo, thunder-attribute beast materials, and thunder-art resources.', '它承接辟邪神雷、风雷翅和雷法体系。', 'It supports evil-warding thunder, Wind-Thunder Wings, and thunder systems.', ['golden-thunder-bamboo', 'evil-warding-divine-thunder', 'thunder-law'], 'high'),
    item('space-materials', '空间材料', 'Space Materials', 'Kongjian Cailiao', '灵界至仙界篇', 'Spirit Realm to Immortal World Arc', '传送阵、储物法器、空间裂缝和空间法则相关的材料总入口。', 'A material hub for teleportation formations, storage artifacts, spatial cracks, and space law.', '它把空间移动和空间法则落到材料层面。', 'It grounds spatial travel and space law in material resources.', ['teleportation-formation', 'space-law', 'storage-pouch'], 'medium'),
    item('spirit-wine', '灵酒', 'Spirit Wine', 'Lingjiu', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '可用于恢复、交易、宴饮或特殊修炼辅助的灵物饮品。', 'A spiritual drink used for recovery, trade, banquets, or special cultivation support.', '它补充修仙世界日常经济和人情往来。', 'It enriches everyday economy and social exchange in cultivation society.', ['auction-resources', 'cave-dwelling-tools'], 'medium'),
    item('spiritual-fruits', '灵果', 'Spiritual Fruits', 'Lingguo', '全书资源线', 'Whole-series resource thread', '灵树灵果类资源总入口，可用于炼丹、直接服食或交换机缘。', 'A hub for spiritual tree-fruit resources used in alchemy, direct consumption, or exchange.', '它与灵草一起构成韩立资源积累的重要来源。', 'Together with herbs, it forms an important source of Han Li resource accumulation.', ['spirit-herb-seeds', 'mature-spirit-herbs', 'medicine-garden'], 'high')
  ],
  sects: [
    item('sects-and-factions-network', '势力关系网', 'Faction Relationship Network', 'Shili Guanxi Wang', '全书通用', 'Whole-series recurring structure', '宗门、家族、联盟、散修组织和仙界机构之间关系的总入口。', 'A hub for relationships among sects, clans, alliances, rogue groups, and immortal institutions.', '它帮助专场从单页词条走向关系图谱。', 'It helps the topic move from isolated entries toward a relationship map.', ['yue-seven-sects', 'heavenly-court', 'reincarnation-palace'], 'high'),
    item('yellow-maple-valley-disciples', '黄枫谷弟子体系', 'Yellow Maple Valley Disciples', 'Huangfeng Gu Dizi Tixi', '人界早期', 'Early Mortal Realm arc', '黄枫谷外门、内门、师承、任务和资源竞争的组织线索。', 'The organizational thread of outer disciples, inner disciples, lineages, missions, and resource competition in Yellow Maple Valley.', '它细化韩立早期宗门生活。', 'It adds detail to Han Li early sect life.', ['huangfeng-valley', 'li-huayuan', 'chen-qiaoqian'], 'high'),
    item('loose-cultivator-markets', '散修坊市', 'Rogue Cultivator Markets', 'Sanxiu Fangshi', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '散修交易、情报流通、拍卖和灰色资源交换的场所总入口。', 'A hub for rogue-cultivator trade, intelligence, auctions, and gray-market exchange.', '它解释韩立如何在宗门之外取得资源。', 'It explains how Han Li obtains resources outside sect systems.', ['auction-resources', 'spirit-stone', 'rogue-cultivator'], 'high'),
    item('cultivation-clans', '修仙家族', 'Cultivation Clans', 'Xiuxian Jiazu', '全书通用', 'Whole-series recurring structure', '血缘、传承、资源地和政治婚盟构成的家族型势力。', 'Clan powers built from bloodlines, inheritance, resource lands, and political marriage ties.', '它补充宗门之外的社会组织形态。', 'It adds social organization beyond sects.', ['imperial-ye-clan', 'yue-state'], 'medium'),
    item('mulan-tribes', '慕兰法士', 'Mulan Spell Warriors', 'Mulan Fashi', '人界中期', 'Middle Mortal Realm arc', '天南周边重要压力势力之一，承接区域战争和不同修炼体系。', 'An important pressure force around Heavenly South, carrying regional war and a distinct practice system.', '它让人界政治不止正魔两分。', 'It makes Mortal Realm politics more than righteous versus demonic.', ['heavenly-south-region', 'nine-nations-alliance'], 'medium'),
    item('spirit-world-human-demon-alliance', '灵界人妖两族联盟', 'Human-Demon Alliance in Spirit Realm', 'Renyao Liangzu Lianmeng', '灵界', 'Spirit Realm arc', '灵界人族与妖族面对多族压力时形成的联盟结构。', 'An alliance structure between humans and demon races under multi-race pressure in the Spirit Realm.', '它承接灵界篇族群政治。', 'It supports Spirit Realm racial politics.', ['human-race', 'demon-race', 'heavenly-abyss-city-region'], 'high'),
    item('flying-spirit-branches', '飞灵族各支', 'Flying Spirit Branches', 'Feiling Zu Gezhi', '灵界', 'Spirit Realm arc', '飞灵族内部各支脉、圣子圣女和真灵血脉竞争的总入口。', 'A hub for Flying Spirit Race branches, holy candidates, and true-spirit bloodline competition.', '它细化灵界多族内部并非铁板一块。', 'It shows Spirit Realm peoples have internal divisions.', ['flying-spirit-race', 'tianpeng-race', 'true-spirit-blood'], 'high'),
    item('devil-army', '魔族大军', 'Devil Army', 'Mozu Dajun', '灵界至魔界线', 'Spirit to Devil Realm thread', '魔劫、跨界入侵和魔族圣祖调度下的战争组织。', 'The war organization behind devil calamity, cross-realm invasion, and sacred-ancestor command.', '它把魔族压力从个体强者扩展为战争机器。', 'It expands devil pressure from individual experts into a war machine.', ['devil-calamity', 'devil-ancestors', 'demon-realm'], 'high'),
    item('immortal-palace-system', '仙宫体系', 'Immortal Palace System', 'Xiangong Tixi', '仙界篇', 'Immortal World Arc', '仙界各级仙宫、巡察、辖地和秩序执行机构的总入口。', 'A hub for immortal palaces, inspectors, territories, and enforcement institutions.', '它帮助解释仙界篇的制度压力。', 'It explains the institutional pressure in the sequel.', ['north-cold-immortal-palace', 'heavenly-court', 'identity-token'], 'high'),
    item('dao-ancestor-factions', '道祖派系', 'Dao Ancestor Factions', 'Daozu Paixi', '仙界篇高阶', 'High-level sequel', '围绕不同道祖、法则道路和仙界顶层秩序形成的派系格局。', 'Faction structures around different Dao Ancestors, law paths, and top immortal order.', '它承接仙界篇后期高阶政治。', 'It supports late sequel high-level politics.', ['dao-ancestor-system', 'time-dao-ancestor', 'heavenly-court'], 'high'),
    item('gray-market-organizations', '灰色交易组织', 'Gray-Market Organizations', 'Huise Jiaoyi Zuzhi', '全书通用', 'Whole-series recurring structure', '黑市、隐秘拍卖、身份伪装和违规资源流通的组织总入口。', 'A hub for black markets, hidden auctions, identity disguise, and illicit resource flow.', '它解释韩立许多资源获取不在明面制度内完成。', 'It explains how many of Han Li resources come outside official systems.', ['auction-resources', 'loose-cultivator-markets', 'impermanence-alliance'], 'medium')
  ],
  races: [
    item('ghost-spirits', '鬼物阴魂', 'Ghosts and Yin Souls', 'Guiwu Yinhun', '鬼道线', 'Ghost-path thread', '阴魂、鬼物、残魂和冥地存在的总入口。', 'A hub for yin souls, ghosts, remnant spirits, and underworld-like beings.', '它和啼魂、元瑶、养魂木共同构成魂魄线。', 'It forms the soul thread with Weeping Soul, Yuan Yao, and soul-nurturing wood.', ['ghost-path-arts', 'weeping-soul-beast', 'yuan-yao'], 'high'),
    item('ancient-beasts', '古兽', 'Ancient Beasts', 'Gushou', '灵界与蛮荒', 'Spirit Realm and wilderness', '远古血脉、蛮荒生态和高阶材料来源相关的异兽总类。', 'A beast class tied to ancient bloodlines, wilderness ecology, and high-level materials.', '它补足灵界野外生态。', 'It enriches Spirit Realm wilderness ecology.', ['wild-world', 'demon-beast-materials'], 'medium'),
    item('true-dragon-lineage', '真龙血脉', 'True Dragon Lineage', 'Zhenlong Xuemei', '真灵线', 'True-spirit thread', '真龙相关血脉和真灵威压线索。', 'A thread for true-dragon bloodlines and true-spirit pressure.', '它补充真灵不是抽象分类，而有具体血脉想象。', 'It makes true spirits concrete through bloodline imagery.', ['true-spirits', 'true-spirit-blood'], 'medium'),
    item('heavenly-phoenix-lineage', '天凤血脉', 'Heavenly Phoenix Lineage', 'Tianfeng Xuemei', '真灵线', 'True-spirit thread', '天凤相关真灵血脉和妖族高阶传承线索。', 'A true-spirit lineage thread around heavenly phoenix ancestry and high-level demon-race inheritance.', '它可与冰凤、银月和真灵血脉交叉阅读。', 'It cross-links with Ice Phoenix, Silvermoon, and true-spirit blood.', ['ice-phoenix', 'silvermoon', 'true-spirit-blood'], 'medium'),
    item('kunpeng-lineage', '鲲鹏血脉', 'Kunpeng Lineage', 'Kunpeng Xuemei', '飞灵族与真灵线', 'Flying Spirit and true-spirit thread', '鲲鹏、天鹏等速度与羽族意象相关的真灵血脉线索。', 'A true-spirit bloodline thread around Kunpeng, Tianpeng, speed, and avian imagery.', '它连接飞灵族、天鹏族和遁速设定。', 'It connects Flying Spirit Race, Tianpeng Race, and movement-speed themes.', ['tianpeng-race', 'flying-spirit-race', 'movement-escape-system'], 'medium'),
    item('spirit-plants', '灵植', 'Spirit Plants', 'Lingzhi', '资源生态线', 'Resource ecology thread', '灵草、灵树、灵果和药园生态的植物类总入口。', 'A plant-life hub for herbs, spirit trees, fruits, and garden ecology.', '它把丹药资源从物品拓展到生态。', 'It expands pill resources from items into ecology.', ['spirit-herb-seeds', 'spiritual-fruits', 'medicine-garden'], 'high'),
    item('gray-spirit-creatures', '灰界灵物', 'Gray-Realm Spirit Creatures', 'Huijie Lingwu', '仙界篇灰界阶段', 'Immortal World Gray Realm arc', '灰界特殊灵物、异兽和材料生物的总入口。', 'A hub for special gray-realm spirit things, alien beasts, and material creatures.', '它让灰界生态和材料体系进一步细化。', 'It further details Gray Realm ecology and material systems.', ['gray-beasts', 'gray-realm-materials', 'gray-realm-vessels'], 'medium'),
    item('immortal-beasts', '仙兽', 'Immortal Beasts', 'Xianshou', '仙界篇', 'Immortal World Arc', '仙界层级的灵兽、异兽和高阶材料来源。', 'Immortal-world spirit beasts, alien beasts, and high-level material sources.', '它是妖兽体系进入仙界后的升级版本。', 'It is the immortal-world upgrade of demon-beast ecology.', ['demon-beasts', 'immortal-realm', 'law-materials'], 'medium')
  ],
  regions: [
    item('qixuan-mountain', '七玄门山地', 'Qixuanmen Mountain Region', 'Qixuan Men Shandi', '开篇', 'Opening arc', '韩立凡俗起点所在的山门区域，承接江湖、药园和墨大夫线。', 'The mountain region of Han Li mortal starting point, carrying martial society, herb plots, and Doctor Mo thread.', '它让专场从凡俗低处开始，而不是直接跳到修仙界。', 'It grounds the topic in the mortal low starting point.', ['qixuan-men', 'doctor-mo', 'qixuan-men-entry'], 'high'),
    item('green-ox-town', '青牛镇', 'Green Ox Town', 'Qingniu Zhen', '开篇背景', 'Opening background', '韩立出身和凡俗家庭背景的地理记忆入口。', 'A geographic memory entry for Han Li origin and mortal family background.', '它帮助保留“凡人”二字的底色。', 'It preserves the mortal texture behind the title.', ['han-li', 'qixuan-men-entry'], 'medium'),
    item('yellow-maple-valley-grounds', '黄枫谷山门', 'Yellow Maple Valley Grounds', 'Huangfeng Gu Shanmen', '人界早期', 'Early Mortal Realm arc', '韩立正式进入宗门修仙生态后的重要空间。', 'An important space after Han Li formally enters sect cultivation society.', '它承接弟子、任务、筑基资源和早期人际线。', 'It supports discipleship, missions, Foundation resources, and early relationships.', ['huangfeng-valley', 'yellow-maple-valley-disciples'], 'high'),
    item('masking-moon-sect-region', '掩月宗区域', 'Masking Moon Sect Region', 'Yanyue Zong Quyu', '人界早期', 'Early Mortal Realm arc', '南宫婉相关早期宗门空间，和越国七派格局相连。', 'The early sect space tied to Nangong Wan and the Seven Sects of Yue structure.', '它补足南宫婉线不只是人物，也有宗门背景。', 'It gives Nangong Wan a sect-space context, not only a character page.', ['masking-moon-sect', 'nangong-wan', 'yue-seven-sects'], 'medium'),
    item('mulan-grassland', '慕兰草原', 'Mulan Grassland', 'Mulan Caoyuan', '人界中期', 'Middle Mortal Realm arc', '天南周边区域战争和慕兰法士相关的重要地理空间。', 'An important geographic space around Heavenly South regional war and Mulan spell warriors.', '它让人界中期具有边境压力。', 'It gives middle Mortal Realm arcs frontier pressure.', ['mulan-tribes', 'heavenly-south-region'], 'medium'),
    item('sky-star-city', '天星城', 'Sky Star City', 'Tianxing Cheng', '乱星海', 'Chaotic Star Sea arc', '乱星海秩序、商贸、星宫影响和海域修士活动的核心城市。', 'A core Chaotic Star Sea city for order, trade, Star Palace influence, and maritime cultivator activity.', '它是乱星海社会层的中心节点。', 'It is a central social node of the Chaotic Star Sea.', ['star-palace', 'inner-star-sea', 'tianxing-sages'], 'high'),
    item('kuixing-island', '魁星岛', 'Kuixing Island', 'Kuixing Dao', '乱星海', 'Chaotic Star Sea arc', '韩立乱星海阶段接触岛屿修仙生态的重要地点之一。', 'An important island location where Han Li engages with Chaotic Star Sea cultivation ecology.', '它让海域篇具有岛屿社会和散修生活感。', 'It gives the maritime arc island society and rogue-cultivator texture.', ['chaotic-star-sea', 'loose-cultivator-markets'], 'medium'),
    item('miao-yin-sea-area', '妙音门海域', 'Miao Yin Sea Area', 'Miaoyin Men Haiyu', '乱星海', 'Chaotic Star Sea arc', '妙音门相关海域、人情、商贸和紫灵线索的空间入口。', 'A spatial entry for Miao Yin Sect, personal ties, trade, and Zi Ling threads.', '它连接乱星海女性修士组织和商业资源。', 'It connects female cultivator organization and commercial resources in the Chaotic Star Sea.', ['miao-yin-sect', 'zi-ling', 'chaotic-star-sea'], 'medium'),
    item('nether-river-land', '冥河之地', 'Nether River Land', 'Minghe Zhidi', '灵界相关', 'Spirit Realm related', '与阴冥、鬼道、魂魄和特殊材料相关的危险区域概念。', 'A dangerous region concept tied to yin-underworld motifs, ghost-path arts, souls, and special materials.', '它承接元瑶、啼魂和魂魄线索。', 'It supports Yuan Yao, Weeping Soul, and soul threads.', ['ghost-path-arts', 'yuan-yao', 'weeping-soul-beast'], 'medium'),
    item('flying-spirit-region', '飞灵族地域', 'Flying Spirit Region', 'Feiling Zu Diyu', '灵界', 'Spirit Realm arc', '飞灵族各支活动、真灵血脉竞争和韩立灵界身份线索相关区域。', 'A region tied to Flying Spirit branches, true-spirit bloodline competition, and Han Li Spirit Realm identity threads.', '它补足灵界多族地图。', 'It fills out the Spirit Realm multi-race map.', ['flying-spirit-branches', 'tianpeng-race'], 'high'),
    item('demon-gold-mountains', '魔金山脉', 'Demon Gold Mountains', 'Mojin Shanmai', '灵界至魔界线', 'Spirit to Devil Realm thread', '魔气、魔族资源和高危探索相关的山脉区域概念。', 'A mountain-region concept tied to devil Qi, devil resources, and high-risk exploration.', '它把魔族线落到资源地理。', 'It grounds the devil-race thread in resource geography.', ['devil-essence-diamond', 'true-demon-qi'], 'medium'),
    item('north-cold-immortal-domain-core', '北寒仙域核心区', 'North Cold Immortal Domain Core', 'Beihan Xianyu Hexin Qu', '仙界篇早期', 'Early Immortal World Arc', '仙界篇早期仙域秩序、仙宫压力和烛龙道活动的核心区域概念。', 'A core early sequel region for immortal-domain order, immortal-palace pressure, and Candle Dragon Dao activity.', '它把黑风海域之后的仙界秩序铺开。', 'It expands immortal order after the Black Wind Sea opening.', ['north-cold-immortal-domain', 'candle-dragon-dao-region', 'immortal-palace-system'], 'high'),
    item('reincarnation-palace-routes', '轮回殿行动路线', 'Reincarnation Palace Routes', 'Lunhui Dian Luxian', '仙界篇', 'Immortal World Arc', '轮回殿任务、据点、传送和身份切换相关的路线入口。', 'A route hub for Reincarnation Palace missions, strongholds, teleportation, and identity shifts.', '它帮助把轮回殿从组织页扩展到行动网络。', 'It expands Reincarnation Palace from an organization into an action network.', ['reincarnation-palace-strongholds', 'reincarnation-palace-thread'], 'medium'),
    item('gray-wilderness', '灰界荒域', 'Gray-Realm Wastes', 'Huijie Huangyu', '仙界篇灰界阶段', 'Immortal World Gray Realm arc', '灰界城池之外的荒域、异兽、资源点和生存风险总入口。', 'A hub for wastes outside Gray Realm cities, alien beasts, resource points, and survival risk.', '它补充灰界不是只有城市，还有荒野生态。', 'It shows the Gray Realm has wilderness ecology beyond cities.', ['gray-realm-cities', 'gray-beasts', 'gray-realm-survival-arts'], 'high')
  ],
  laws: [
    item('law-power', '法则之力', 'Law Power', 'Faze Zhili', '仙界篇', 'Immortal World Arc', '仙界篇中高阶修士调动大道规则的基础力量概念。', 'The base sequel concept for high-level cultivators mobilizing Dao rules.', '它是理解法则大道栏目所有词条的总入口。', 'It is the umbrella entry for the Laws & Dao section.', ['three-thousand-daos', 'law-domain', 'dao-ancestor-system'], 'high'),
    item('origin-law', '本源法则', 'Origin Law', 'Benyuan Faze', '仙界篇高阶', 'High-level sequel', '更接近大道根源、道祖位格和法则权柄的高阶概念。', 'A higher concept closer to Dao origin, Dao Ancestor status, and law authority.', '它解释为什么仙界篇后期争斗不只是境界高低。', 'It explains why late sequel conflict is not only about realm level.', ['dao-ancestor-system', 'law-power'], 'medium'),
    item('law-conflict', '法则冲突', 'Law Conflict', 'Faze Chongtu', '仙界篇', 'Immortal World Arc', '不同法则属性、灵域和道祖权柄之间互相压制或碰撞的现象。', 'The collision or suppression among different law attributes, domains, and Dao-authorities.', '它让高阶斗法具有规则博弈。', 'It gives high-level combat rule-based contest.', ['law-domain', 'time-law', 'reincarnation-law'], 'high'),
    item('dao-ancestor-position', '道祖位格', 'Dao Ancestor Status', 'Daozu Weige', '仙界篇高阶', 'High-level sequel', '道祖不只是强者称谓，也代表某条大道上的权柄和秩序位置。', 'Dao Ancestor is not only a power title but also authority and position on a specific Dao.', '它是理解天庭、时间道祖和终局冲突的关键。', 'It is key to understanding Heavenly Court, the Time Dao Ancestor, and final conflict.', ['dao-ancestor-system', 'time-dao-ancestor', 'origin-law'], 'high'),
    item('heavenly-dao-pressure', '天道压制', 'Heavenly Dao Pressure', 'Tiandao Yazhi', '跨界与高阶线', 'Cross-realm and high-level thread', '界面规则、天道限制和高阶存在降临时产生的压制概念。', 'A concept for realm rules, heavenly restrictions, and pressure when higher beings descend.', '它帮助解释跨界行动为何困难且代价高。', 'It explains why cross-realm action is difficult and costly.', ['ma-liang', 'spirit-realm', 'immortal-realm'], 'medium'),
    item('realm-interface-force', '界面之力', 'Realm Interface Force', 'Jiemian Zhili', '飞升与跨界线', 'Ascension and cross-realm thread', '不同界面之间的规则差、排斥、通道和飞升压力。', 'The rule differences, rejection, channels, and ascension pressure between realms.', '它把飞升写成世界规则转换，而不是简单换地图。', 'It makes ascension a rule transition rather than a simple map change.', ['ascension', 'spirit-realm-ascension', 'immortal-realm-opening'], 'high'),
    item('spatial-node', '空间节点', 'Spatial Node', 'Kongjian Jiedian', '跨域移动', 'Cross-region movement', '传送、裂缝、飞升通道和秘境入口相关的空间概念。', 'A spatial concept around teleportation, cracks, ascension channels, and secret-realm entrances.', '它连接地图扩张与空间风险。', 'It connects map expansion with spatial risk.', ['space-law', 'teleportation-formation', 'restriction-breaking-art'], 'medium'),
    item('domain-suppression', '灵域压制', 'Domain Suppression', 'Lingyu Yazhi', '仙界篇', 'Immortal World Arc', '高阶修士展开灵域后对对手法则、行动和感知造成压制的现象。', 'The suppression of enemy law, movement, and perception after a high-level cultivator unfolds a domain.', '它是仙界篇高阶斗法最直观的机制之一。', 'It is one of the most visible mechanics of high-level sequel combat.', ['law-domain', 'law-domain-technique', 'law-conflict'], 'high'),
    item('immortal-aperture', '仙窍', 'Immortal Apertures', 'Xianqiao', '仙界篇修炼', 'Immortal World cultivation', '仙界篇境界修炼中承载仙灵力、法则积累和突破进度的重要概念。', 'A sequel cultivation concept for carrying immortal power, law accumulation, and breakthrough progress.', '它让仙界修炼有可追踪的内部结构。', 'It gives immortal-world cultivation a trackable internal structure.', ['immortal-spiritual-power', 'true-immortal', 'golden-immortal'], 'high'),
    item('dao-mark', '道痕', 'Dao Marks', 'Daohen', '仙界篇', 'Immortal World Arc', '法则感悟、道伤、传承痕迹和高阶斗法影响留下的痕迹概念。', 'A concept for marks left by law comprehension, Dao wounds, inheritances, and high-level combat effects.', '它适合与时间道纹、法则之丝一起阅读。', 'It should be read with time Dao patterns and law threads.', ['time-dao-patterns', 'law-thread', 'law-power'], 'medium')
  ],
  characters: [
    item('yellow-maple-disciples-group', '黄枫谷弟子群像', 'Yellow Maple Valley Disciple Group', 'Huangfeng Gu Dizi Qunxiang', '人界早期', 'Early Mortal Realm arc', '黄枫谷普通弟子、师兄弟、任务同伴和资源竞争者的群像入口。', 'A group entry for ordinary disciples, fellow students, mission companions, and resource competitors in Yellow Maple Valley.', '它补足早期宗门不是只有韩立和少数关键人物。', 'It shows the early sect is more than Han Li and a few key figures.', ['yellow-maple-valley-disciples', 'huangfeng-valley'], 'medium'),
    item('yue-sect-cultivators-group', '越国七派修士群像', 'Yue Seven Sects Cultivators', 'Yueguo Qipai Xiushi', '人界早期', 'Early Mortal Realm arc', '越国七派中参加试炼、任务和正魔压力的修士群像。', 'A group entry for Yue sect cultivators involved in trials, missions, and righteous-demonic pressure.', '它服务血色禁地和越国宗门地图。', 'It supports the Blood Forbidden Land and Yue sect map.', ['yue-seven-sects', 'blood-forbidden-land-arc'], 'medium'),
    item('devil-path-cultivators-group', '魔道修士群像', 'Devil-Path Cultivators', 'Modao Xiushi', '人界至魔界线', 'Mortal Realm to Devil Realm thread', '魔道宗门、散修魔修、鬼道修士和血道术士的群像入口。', 'A group entry for devil-path sect members, rogue demonic cultivators, ghost-path cultivators, and blood-path users.', '它把魔道从单个反派扩展成修炼生态。', 'It expands the devil path from individual antagonists into an ecology.', ['devil-dao-six-sects', 'ghost-path-arts', 'blood-path-arts'], 'high'),
    item('chaotic-star-sea-rogues-group', '乱星海散修群像', 'Chaotic Star Sea Rogue Cultivators', 'Luanxing Hai Sanxiu', '乱星海', 'Chaotic Star Sea arc', '海域散修、猎妖修士、商旅修士和岛屿势力边缘人物群像。', 'A group entry for maritime rogue cultivators, beast hunters, traders, and island-edge figures.', '它补足乱星海的社会底层。', 'It fills out the social lower layer of the Chaotic Star Sea.', ['chaotic-star-sea', 'loose-cultivator-markets', 'outer-star-sea'], 'high'),
    item('spirit-world-human-cultivators-group', '灵界人族修士群像', 'Spirit Realm Human Cultivators', 'Lingjie Renzu Xiushi', '灵界', 'Spirit Realm arc', '灵界人族城池、防线、长老和普通修士的群像入口。', 'A group entry for Spirit Realm human cities, defenses, elders, and ordinary cultivators.', '它补充韩立飞升后面对的是完整族群社会。', 'It shows Han Li enters a full racial society after ascension.', ['human-race', 'heavenly-abyss-city-region'], 'high'),
    item('flying-spirit-figures-group', '飞灵族人物群像', 'Flying Spirit Figures', 'Feiling Zu Renwu', '灵界', 'Spirit Realm arc', '飞灵族支脉、圣子圣女、长老和血脉竞争相关人物总入口。', 'A group entry for Flying Spirit branches, holy candidates, elders, and bloodline competition.', '它支撑飞灵族各支和天鹏族页面。', 'It supports Flying Spirit branch and Tianpeng pages.', ['flying-spirit-branches', 'tianpeng-race'], 'medium'),
    item('devil-realm-figures-group', '魔界人物群像', 'Devil Realm Figures', 'Mojie Renwu', '魔界线', 'Devil Realm thread', '魔族圣祖、魔尊、魔军统领和魔界资源争夺者的群像入口。', 'A group entry for sacred ancestors, devil lords, army leaders, and resource contenders in the Devil Realm.', '它让魔界线从几个名字扩展成完整阵营。', 'It expands the Devil Realm thread into a full faction.', ['devil-ancestors', 'devil-army', 'demon-realm'], 'high'),
    item('heavenly-court-envoys', '天庭使者群像', 'Heavenly Court Envoys', 'Tianting Shizhe', '仙界篇', 'Immortal World Arc', '天庭巡察、追捕、传令和秩序执行者的群像入口。', 'A group entry for Heavenly Court inspectors, pursuers, messengers, and enforcers.', '它补充天庭作为制度机器的执行层。', 'It adds the enforcement layer of Heavenly Court as an institution.', ['heavenly-court', 'immortal-palace-system', 'qi-mozi'], 'high'),
    item('reincarnation-palace-members', '轮回殿成员群像', 'Reincarnation Palace Members', 'Lunhui Dian Chengyuan', '仙界篇', 'Immortal World Arc', '轮回殿任务成员、身份伪装者、联络者和暗线人物的群像入口。', 'A group entry for Reincarnation Palace mission members, disguised identities, contacts, and hidden-thread figures.', '它让轮回殿不只是殿主和据点，而有行动网络。', 'It makes Reincarnation Palace an action network beyond its master and strongholds.', ['reincarnation-palace', 'jiao-san', 'fox-three'], 'high'),
    item('gray-realm-powerhouses', '灰界强者群像', 'Gray-Realm Powerhouses', 'Huijie Qiangzhe', '仙界篇灰界阶段', 'Immortal World Gray Realm arc', '灰界城主、强者、异族头领和荒域威胁的群像入口。', 'A group entry for Gray Realm city lords, powerhouses, alien leaders, and wilderness threats.', '它细化灰界政治与荒域压力。', 'It details Gray Realm politics and wilderness pressure.', ['gray-realm-powers', 'gray-realm-cities', 'gray-wilderness'], 'high'),
    item('ancient-cultivator-remnants', '古修残魂群像', 'Ancient Cultivator Remnants', 'Guxiu Canhun', '遗迹与秘境', 'Ruins and secret realms', '遗迹中残留的古修神念、残魂、封印意识和传承影子的总入口。', 'A group entry for ancient cultivator wills, remnant souls, sealed consciousness, and inheritance shadows in ruins.', '它解释许多遗迹为何既有机缘也有夺舍风险。', 'It explains why ruins carry both opportunities and possession risks.', ['possession-secret-art', 'ancient-treasure', 'restriction-breaking-art'], 'high')
  ],
  timeline: [
    item('doctor-mo-crisis', '墨大夫危机', 'Doctor Mo Crisis', 'Mo Dafu Weiji', '开篇', 'Opening arc', '韩立从江湖少年被卷入修仙残酷逻辑的关键转折。', 'The key turn where Han Li moves from martial youth into cruel cultivation logic.', '它奠定韩立谨慎、不轻信和重视底牌的性格基础。', 'It lays the foundation for Han Li caution, distrust, and trump-card mindset.', ['doctor-mo', 'qixuan-men-entry', 'possession-secret-art'], 'high'),
    item('yue-demonic-war', '越国正魔战争', 'Yue Righteous-Demonic War', 'Yueguo Zhengmo Zhanzheng', '人界早中期', 'Early-middle Mortal Realm arc', '越国七派与魔道势力压力下的区域战争线。', 'A regional war thread under pressure between Yue sects and devil-path forces.', '它让韩立离开单一宗门日常，进入地区大势。', 'It moves Han Li beyond one sect daily life into regional currents.', ['yue-seven-sects', 'devil-dao-six-sects', 'yue-state'], 'high'),
    item('outer-star-sea-hunting', '外星海猎妖', 'Outer Star Sea Beast Hunt', 'Waixing Hai Lieyao', '乱星海', 'Chaotic Star Sea arc', '韩立在乱星海围绕妖兽、妖丹和海域资源展开的重要历练线。', 'An important Chaotic Star Sea training thread around demon beasts, demon cores, and maritime resources.', '它把战斗、资源和海域生态结合起来。', 'It combines combat, resources, and maritime ecology.', ['outer-star-sea', 'demon-core', 'rainbow-skirt-grass'], 'high'),
    item('xutian-hall-treasure-hunt', '虚天殿夺宝', 'Void Heaven Hall Treasure Hunt', 'Xutian Dian Duobao', '乱星海', 'Chaotic Star Sea arc', '围绕虚天殿、虚天鼎和多方高阶修士展开的争夺。', 'The contest around Void Heaven Hall, the Void Heaven Cauldron, and multiple high-level cultivators.', '它是乱星海篇的核心事件入口之一。', 'It is one of the core event entries for the Chaotic Star Sea arc.', ['xutian-hall', 'xutian-cauldron', 'xutian-hall-contenders'], 'high'),
    item('heavenly-south-return-and-war', '天南回归与大战', 'Heavenly South Return and War', 'Tiannan Huigui Yu Dazhan', '人界中后期', 'Mortal Realm middle-late arc', '韩立回到天南后面对旧地新局、区域战争和身份变化的阶段。', 'Han Li returns to Heavenly South and faces old places, new power structures, regional war, and changed status.', '它体现成长后的地位反转。', 'It shows status reversal after growth.', ['return-to-heavenly-south', 'heavenly-south-region', 'mulan-tribes'], 'medium'),
    item('nascent-soul-formation-thread', '结婴大关', 'Nascent Soul Formation Thread', 'Jieying Daguan', '人界中后期', 'Mortal Realm middle-late arc', '韩立冲击元婴、资源准备和高阶身份转变的阶段入口。', 'A stage entry for Han Li reaching Nascent Soul, resource preparation, and identity shift.', '它是人界篇从中阶到高阶的关键门槛。', 'It is the crucial threshold from middle to high level in the Mortal Realm.', ['nascent-soul', 'bottleneck-breakthrough', 'infant-formation-pill'], 'high'),
    item('spirit-world-racial-war', '灵界族群战争', 'Spirit Realm Racial War', 'Lingjie Zuqun Zhanzheng', '灵界', 'Spirit Realm arc', '灵界多族压力、人妖两族防线和大规模冲突的总入口。', 'A hub for Spirit Realm multi-race pressure, human-demon defenses, and large-scale conflict.', '它把个人修炼推入族群生存。', 'It pushes personal cultivation into racial survival.', ['spirit-world-human-demon-alliance', 'heavenly-abyss-city-region'], 'high'),
    item('devil-realm-expedition', '魔界远行', 'Devil Realm Expedition', 'Mojie Yuanxing', '灵界至魔界线', 'Spirit to Devil Realm thread', '韩立进入魔界相关叙事、接触魔族资源和高阶魔族人物的阶段。', 'A stage where Han Li enters Devil Realm-related narrative and encounters devil resources and high-level figures.', '它让魔族线从外部威胁变成亲历空间。', 'It turns the devil thread from external threat into lived space.', ['demon-realm', 'devil-essence-diamond', 'devil-realm-figures-group'], 'high'),
    item('black-wind-sea-opening', '黑风海开局', 'Black Wind Sea Opening', 'Heifeng Hai Kaiju', '仙界篇早期', 'Early Immortal World Arc', '仙界篇开局中韩立落入地方海域、恢复实力并重建身份的阶段。', 'An early sequel stage where Han Li lands in a maritime region, recovers, and rebuilds identity.', '它让仙界篇从低处重新起步。', 'It lets the sequel restart from a lower foothold.', ['black-wind-sea', 'black-wind-island-region', 'hu-yan-daoist'], 'high'),
    item('north-cold-immortal-domain-pursuit', '北寒仙域追逃', 'North Cold Immortal Domain Pursuit', 'Beihan Xianyu Zhuitao', '仙界篇早期', 'Early Immortal World Arc', '韩立在北寒仙域秩序、追索和身份压力下周旋的阶段入口。', 'A stage entry for Han Li maneuvering under North Cold domain order, pursuit, and identity pressure.', '它承接仙界篇追逃和仙宫秩序主题。', 'It supports the sequel pursuit and immortal-palace order themes.', ['north-cold-immortal-domain-core', 'immortal-palace-system', 'qi-mozi'], 'high'),
    item('gray-realm-survival-thread', '灰界求生线', 'Gray Realm Survival Thread', 'Huijie Qiusheng Xian', '仙界篇灰界阶段', 'Immortal World Gray Realm arc', '韩立在灰界面对异质环境、灰界势力和荒域危险的阶段总入口。', 'A stage hub for Han Li facing alien environment, Gray Realm powers, and wilderness dangers.', '它是灰界专题继续细化的主干。', 'It is the main trunk for further Gray Realm expansion.', ['gray-realm', 'gray-wilderness', 'gray-realm-survival-arts'], 'high')
  ]
}

for (const [section, entries] of Object.entries(completionCatalog)) {
  catalog[section].push(...entries)
}

const deepCompletionCatalog = {
  techniques: [
    item('fireball-technique', '火弹术', 'Fireball Technique', 'Huodan Shu', '人界早期', 'Early Mortal Realm arc', '长春功体系中最直观的低阶攻击法术之一，用来展示炼气期斗法的基础形态。', 'One of the most direct low-level attack spells in the Everlasting Spring Art system, showing basic Qi Refining combat.', '它让早期斗法落到可感知的术法细节，而不是只写境界差距。', 'It grounds early combat in concrete spellcraft instead of only realm differences.', ['changchun-gong', 'qi-refining-stage'], 'high'),
    item('heavenly-eye-technique', '天眼术', 'Heavenly Eye Technique', 'Tianyan Shu', '人界早期', 'Early Mortal Realm arc', '低阶修士观察修为、辨认灵气和判断对手层次的基础辅助术。', 'A basic support spell for observing cultivation, reading spiritual aura, and judging opponents.', '它补足侦察、试探和谨慎判断的早期工具链。', 'It fills out the early toolkit for scouting, probing, and cautious judgment.', ['spirit-eye-technique', 'changchun-gong'], 'high'),
    item('object-control-technique', '驱物术 / 控物术', 'Object-Control Technique', 'Quwu Shu / Kongwu Shu', '人界早期', 'Early Mortal Realm arc', '炼气期修士驱使器物、法器和简单道具的基础操作法术。', 'A foundational spell for Qi Refining cultivators to move tools, magic items, and simple objects.', '它是从凡俗武艺过渡到法器战斗的关键手感。', 'It marks the transition from mundane martial skill to artifact-based fighting.', ['magic-tools', 'flying-sword-control'], 'high'),
    item('concealment-technique', '匿身术', 'Concealment Technique', 'Nishen Shu', '人界早期', 'Early Mortal Realm arc', '利用灵力隐藏身形或弱化存在感的低阶隐匿术。', 'A low-level concealment art that hides the body or softens presence through spiritual power.', '它和韩立一贯的伏击、避险、低调行动气质一致。', 'It matches Han Li recurring preference for ambush, avoidance, and low-profile action.', ['stealth-escape-arts', 'movement-escape-system'], 'high'),
    item('sword-light-splitting', '剑影分光术', 'Sword-Light Splitting', 'Jianying Fenguang Shu', '青元剑诀中阶', 'Middle Azure Essence Sword Art', '青元剑诀中把剑光化为多重剑影的关键打法。', 'A key Azure Essence Sword Art method that turns sword light into multiple sword shadows.', '它把飞剑操控从单线攻击推进到迷惑、牵制和多点压迫。', 'It moves flying-sword control from one-line offense toward confusion, restraint, and multi-point pressure.', ['qingyuan-sword-art', 'flying-sword-control', 'dageng-sword-array'], 'high'),
    item('protective-sword-shield', '护体剑盾', 'Protective Sword Shield', 'Huti Jiandun', '青元剑诀中阶', 'Middle Azure Essence Sword Art', '青元剑诀中兼具防御和反击意味的护身剑道术式。', 'A defensive Azure Essence Sword Art mode with counterattack potential.', '它说明韩立的剑修路线不只是进攻，也服务保命和阵地周旋。', 'It shows Han Li sword path serves survival and positioning as well as offense.', ['qingyuan-sword-art', 'shield-artifacts'], 'medium'),
    item('seven-ghost-soul-devouring-art', '七鬼噬魂大法', 'Seven-Ghost Soul-Devouring Art', 'Qigui Shihun Dafa', '人界开篇', 'Opening Mortal Realm arc', '墨大夫相关的凶险神魂秘术线索，带出夺舍、魂魄和凡人开局的黑暗面。', 'A dangerous soul-art thread tied to Doctor Mo, introducing possession, souls, and the darker opening logic.', '它是早期“修仙不是童话”的第一批震动点。', 'It is one of the earliest shocks that cultivation is not a fairy tale.', ['doctor-mo', 'possession-secret-art', 'ghost-path-arts'], 'high'),
    item('puppet-mechanism-art', '傀儡机关术', 'Puppet Mechanism Arts', 'Kuilei Jiguan Shu', '人界中期', 'Middle Mortal Realm arc', '把机关、炼器、神识操控和替身战术连接起来的技术型法门。', 'A technical art linking mechanisms, refining, divine-sense control, and decoy tactics.', '它让傀儡体系从单个道具扩展为工艺和战术系统。', 'It expands puppets from individual tools into craft and tactics.', ['puppet-refinement', 'great-development-art', 'puppet-core'], 'high'),
    item('spirit-insect-armor-art', '虫甲术', 'Spirit-Insect Armor Art', 'Chongjia Shu', '御虫线', 'Spirit-insect thread', '以灵虫构成护罩或护甲的御虫术分支。', 'A spirit-insect art that forms shields or armor from controlled insects.', '它补充噬金虫之外，灵虫也能服务防御和控场。', 'It shows spirit insects can serve defense and field control, not only devouring offense.', ['insect-rearing-art', 'spirit-insects', 'gold-devouring-beetles'], 'medium'),
    item('corpse-refinement-art', '炼尸术', 'Corpse Refinement Arts', 'Lianshi Shu', '魔道与鬼道线', 'Demonic and ghost-path thread', '低阶到高阶都可出现的阴邪炼制术，常与尸气、鬼道、毒性和傀儡化战力相连。', 'A sinister refinement route that links corpse Qi, ghost-path arts, poison, and puppet-like fighting force.', '它把魔道、鬼道和材料化身体的残酷逻辑放到同一组。', 'It groups devil-path, ghost-path, and body-as-material cruelty together.', ['ghost-path-arts', 'myriad-soul-banner', 'ghost-spirits'], 'high'),
    item('spirit-binding-art', '附灵术', 'Spirit-Binding Art', 'Fuling Shu', '人界至灵界', 'Mortal to Spirit Realm', '把神魂、妖兽或灵物强行绑定并借用力量的高风险术法总入口。', 'A high-risk art around binding souls, beasts, or spiritual objects to borrow power.', '它适合连接御兽、魂魄、轮回代价和禁术伦理。', 'It connects beast control, souls, reincarnation costs, and taboo ethics.', ['beast-taming-art', 'reincarnation-law', 'true-spirit-blood'], 'medium'),
    item('heaven-reaching-treasure-formula', '通宝诀', 'Heaven-Reaching Treasure Formula', 'Tongbao Jue', '通天灵宝线', 'Heaven-reaching spirit treasure thread', '驱使通天灵宝所需的专门法诀类型，强调高阶宝物并非拿到即可使用。', 'A formula type required to wield heaven-reaching spirit treasures, emphasizing that great treasures need matching methods.', '它让重宝体系更讲规则、传承和权限。', 'It makes the treasure system depend on rules, inheritance, and access.', ['heaven-reaching-spirit-treasure', 'spirit-treasure'], 'high')
  ],
  artifacts: [
    item('magic-tools', '法器', 'Magic Tools', 'Faqi', '人界早期至全书', 'Early Mortal Realm onward', '低阶修士最常使用的器物层级，形态和用途都很杂。', 'The most common tool tier for low-level cultivators, varied in form and use.', '它是法宝、古宝、灵宝等高级器物之前的基础装备层。', 'It is the base equipment layer before artifacts, ancient treasures, and spirit treasures.', ['object-control-technique', 'artifact-refining-art'], 'high'),
    item('treasure-artifact', '法宝', 'Treasure Artifact', 'Fabao', '结丹期以后', 'Core Formation onward', '修士进入更高阶段后长期祭炼、依托神识操控的核心战斗器物。', 'A core combat treasure refined over time and controlled by divine sense after higher stages.', '它是本命法宝、飞剑、器灵和法宝克制关系的总入口。', 'It is the hub for bonded artifacts, flying swords, artifact spirits, and treasure-counter logic.', ['bonded-artifact', 'flying-sword-artifacts', 'artifact-spirit'], 'high'),
    item('true-treasure-talisman', '真宝', 'True Treasure Talisman', 'Zhenbao', '人界早中期', 'Early-middle Mortal Realm', '符宝体系中更接近原法宝威能的珍贵消耗型器物。', 'A rare consumable in the talisman-treasure family that approaches more of the original treasure power.', '它补足低阶修士短暂越级、靠底牌改写局面的道具体系。', 'It fills out the low-level trump-card system for brief higher-tier pressure.', ['talisman-treasure', 'talisman-making'], 'medium'),
    item('devil-tools', '魔器', 'Devil Tools', 'Moqi', '古魔与魔界线', 'Ancient devil and Devil Realm thread', '由魔气或古魔遗留体系驱动的危险器物，常带反噬和侵蚀风险。', 'Dangerous tools powered by devil Qi or ancient devil systems, often carrying backlash and corruption risk.', '它把武器专题和魔族专题直接接上。', 'It directly connects the weapon topic to the devil-race topic.', ['devil-race', 'true-demon-qi', 'devil-armor'], 'high'),
    item('artifact-spirit', '器灵', 'Artifact Spirit', 'Qiling', '人界至灵界', 'Mortal to Spirit Realm', '法宝中封入精魄或长期孕育出的灵性存在。', 'A spiritual presence sealed into or nurtured within an artifact.', '它让法宝从死物变成可带记忆、性格和特殊神通的伙伴或风险点。', 'It turns treasures from objects into partners or risks with memory, character, and abilities.', ['silvermoon', 'treasure-artifact', 'soul-nurturing-wood'], 'high'),
    item('chaos-myriad-spirit-list', '混沌万灵榜', 'Chaos Myriad Spirit List', 'Hundun Wanling Bang', '灵界高阶', 'High-level Spirit Realm', '灵界宝物排名与重宝认知相关的榜单型设定。', 'A ranking-list setting tied to Spirit Realm treasure recognition and competition.', '它让玄天之宝、通天灵宝等高阶器物有了可比较的秩序。', 'It gives high-level treasures a comparative order.', ['xuantian-treasure', 'heaven-reaching-spirit-treasure'], 'medium'),
    item('jade-slip', '玉简', 'Jade Slip', 'Yujian', '全书通用', 'Whole-series recurring tool', '记录功法、丹方、地图、交易信息和宗门任务的基础信息载体。', 'A basic information carrier for arts, formulas, maps, trade details, and sect missions.', '它是修仙世界的知识媒介，支撑传承和情报流动。', 'It is the knowledge medium of the cultivation world and supports inheritance and intelligence flow.', ['pill-formulas', 'sects-and-factions-network'], 'high'),
    item('talisman-paper', '符纸', 'Talisman Paper', 'Fuzhi', '制符线', 'Talisman crafting thread', '制作符箓所需的基础材料，连接灵草、工艺和低阶战斗消耗。', 'The base material for talismans, linking herbs, craft, and low-level combat consumables.', '它让制符术有材料链，不只是抽象技能。', 'It gives talisman crafting a material chain rather than leaving it abstract.', ['talisman-making', 'seven-star-grass'], 'medium'),
    item('spirit-eye-spring', '灵眼之泉', 'Spirit-Eye Spring', 'Lingyan Zhiquan', '洞府资源线', 'Dwelling resource thread', '灵眼资源的实体形态之一，常与洞府灵气、灵液和长期修炼环境相关。', 'A physical spirit-eye resource tied to cave-dwelling aura, spiritual liquid, and long-term cultivation environment.', '它补齐灵眼之树、万年灵乳和洞府经营之间的资源关系。', 'It completes the resource relation among the Spirit-Eye Tree, spirit milk, and cave management.', ['spirit-eye-tree', 'ten-thousand-year-spirit-milk', 'cave-dwelling-tools'], 'high'),
    item('spirit-eye-stone', '灵眼之石', 'Spirit-Eye Stone', 'Lingyan Zhishi', '洞府资源线', 'Dwelling resource thread', '可用于改善修炼环境、洞府灵气和资源布置的灵眼类实体。', 'A spirit-eye object useful for improving cultivation spaces, cave aura, and resource placement.', '它适合和药园、闭关、宗门洞府一起看。', 'It fits medicine gardens, seclusion, and sect dwellings.', ['spirit-eye-spring', 'medicine-garden'], 'medium'),
    item('black-wind-flag', '黑风旗', 'Black Wind Flag', 'Heifeng Qi', '人界后期', 'Late Mortal Realm', '带空间封困意象的旗幡类宝物线索。', 'A banner-type treasure thread with spatial sealing imagery.', '它补强旗幡类法宝不只属于鬼道，也能涉及空间和封禁。', 'It strengthens the idea that banner treasures can involve space and sealing, not only ghost arts.', ['banner-artifacts', 'space-law', 'formation-restrictions'], 'medium'),
    item('heavenly-corpse-bead', '天尸珠', 'Heavenly Corpse Bead', 'Tianshi Zhu', '鬼道炼体线', 'Ghost-path body thread', '尸道修炼和特殊法体相关的珠状宝物线索。', 'A bead-type treasure tied to corpse-path cultivation and special body refinement.', '它连接炼尸、鬼道材料和肉身强化的阴暗分支。', 'It connects corpse refinement, ghost-path materials, and a darker body-strengthening branch.', ['corpse-refinement-art', 'body-refining-system', 'ghost-spirits'], 'medium'),
    item('spirit-beast-contract-token', '认主契物', 'Spirit-Beast Contract Token', 'Renzhu Qiwu', '御兽与灵虫线', 'Beast and insect control thread', '用于承接认主、契约、血祭和长期驯养关系的道具概念。', 'A tool concept for ownership rites, contracts, blood-binding, and long-term beast nurturing.', '它把灵兽从物品栏放回关系和控制体系中。', 'It moves spirit beasts from inventory into relationships and control systems.', ['beast-taming-art', 'spirit-beast-bag', 'spirit-binding-art'], 'medium')
  ],
  elixirs: [
    item('spirit-eye-liquid', '醇液 / 灵眼灵液', 'Spirit-Eye Liquid', 'Chunye / Lingyan Lingye', '洞府资源线', 'Dwelling resource thread', '灵眼之树等灵眼资源中流出的灵液类材料，可用于恢复、修炼或交换。', 'Spiritual liquid from spirit-eye resources, useful for recovery, cultivation, or trade.', '它让灵眼资源从环境加成扩展到可收集资源。', 'It turns spirit-eye resources from environmental boosts into harvestable assets.', ['spirit-eye-tree', 'spirit-eye-spring'], 'medium'),
    item('true-origin-pill', '真元丹', 'True Origin Pill', 'Zhenyuan Dan', '人界筑基期', 'Foundation Establishment arc', '筑基期增进修为类丹药线索，适合放入日常修炼资源梯队。', 'A Foundation Establishment cultivation-increasing pill thread for the everyday resource ladder.', '它补齐突破丹之外的稳步增长型丹药。', 'It fills in steady-growth pills beyond breakthrough pills.', ['mana-increasing-pills', 'foundation-establishment-stage'], 'high'),
    item('spirit-gathering-pill', '聚灵丹', 'Spirit-Gathering Pill', 'Juling Dan', '人界筑基期', 'Foundation Establishment arc', '帮助筑基期修士积累法力的常见修炼丹药线索。', 'A common pill thread for helping Foundation Establishment cultivators accumulate power.', '它体现韩立长期闭关和丹药供给的资源压力。', 'It reflects the resource pressure behind Han Li long seclusions and pill supply.', ['mana-increasing-pills', 'medicine-garden'], 'high'),
    item('fasting-pill', '辟谷丹', 'Fasting Pill', 'Bigu Dan', '低阶通用', 'Low-level recurring', '让低阶修士短期免去饮食需求的生活型丹药。', 'A practical pill that lets low-level cultivators go without ordinary food for a time.', '它补足修仙日常，不只写战斗和突破。', 'It fills out cultivation daily life, not only battle and breakthrough.', ['cave-dwelling-tools', 'qi-refining-stage'], 'high'),
    item('spirit-feeding-pill', '饲灵丸', 'Spirit-Feeding Pill', 'Siling Wan', '御兽与灵虫线', 'Beast and insect nurturing thread', '用于喂养、培养灵兽灵虫的丹丸类资源。', 'A pill resource used to feed and nurture spirit beasts or insects.', '它把灵兽成长写成长期投喂和资源消耗。', 'It makes spirit-beast growth a matter of long-term feeding and resource cost.', ['beast-taming-art', 'spirit-insects', 'gold-devouring-beetles'], 'high'),
    item('stabilizing-spirit-pill', '定灵丹 / 安魂丹', 'Stabilizing Spirit Pill', 'Dingling Dan / Anhun Dan', '人界中后期', 'Middle-late Mortal Realm', '兼具定心、安魂和辅助高阶突破意味的丹药线索。', 'A pill thread around calming the mind, stabilizing the soul, and supporting higher breakthroughs.', '它适合连接心魔、结婴和神魂风险。', 'It connects inner demons, Nascent Soul formation, and soul risk.', ['nascent-soul-stage', 'soul-restoring-pills'], 'medium'),
    item('fortune-pill', '造化丹', 'Fortune Pill', 'Zaohua Dan', '人界中后期', 'Middle-late Mortal Realm', '带有体验境界、辅助悟关意味的特殊丹药线索。', 'A special pill thread associated with experiential insight and breakthrough assistance.', '它说明丹药不只增加法力，也可能影响心境和感悟。', 'It shows pills can affect mental state and insight, not only mana.', ['bottleneck-breakthrough', 'breakthrough-pills'], 'medium'),
    item('life-extension-fruit', '寿元果', 'Lifespan Fruit', 'Shouyuan Guo', '灵草灵果线', 'Herb and fruit resource thread', '延寿丹药与高阶修士时间压力相关的关键灵果。', 'A key spiritual fruit tied to lifespan pills and the time pressure of high-level cultivators.', '它把寿元、闭关、突破失败成本和资源争夺连在一起。', 'It connects lifespan, seclusion, breakthrough failure cost, and resource competition.', ['lifespan-pills', 'spiritual-fruits'], 'high'),
    item('heaven-patching-pill', '补天丹', 'Heaven-Patching Pill', 'Butian Dan', '人界中期', 'Middle Mortal Realm', '与改善先天资质、弥补灵根缺陷相关的珍稀丹药线索。', 'A rare pill thread tied to improving innate aptitude and compensating spirit-root flaws.', '它正好对应韩立低资质起步和后天资源补足的凡人流核心。', 'It maps directly onto Han Li low aptitude and the mortal-flow logic of compensating through resources.', ['spirit-root-aptitude', 'bottleneck-breakthrough'], 'medium'),
    item('clear-spirit-powder', '清灵散', 'Clear Spirit Powder', 'Qingling San', '凡俗至人界早期', 'Mundane to early Mortal Realm', '早期解毒、医药和凡俗江湖线相关药物。', 'An early medicine tied to detoxification, healing, and the mortal martial-world thread.', '它让七玄门开篇的医药色彩不被后期高阶丹药盖住。', 'It preserves the medical flavor of the Qixuanmen opening beneath later high-level pills.', ['doctor-mo', 'detox-pills'], 'medium'),
    item('bright-clear-spirit-water', '明清灵水', 'Bright-Clear Spirit Water', 'Mingqing Lingshui', '人界中期', 'Middle Mortal Realm', '与灵目神通、视觉强化和探索侦察相关的灵水线索。', 'A spirit-water thread tied to eye abilities, enhanced sight, and exploration scouting.', '它把材料页和灵目神通页互相打通。', 'It cross-links material pages with spirit-eye abilities.', ['spirit-eye-technique', 'spirit-eye-tree'], 'high'),
    item('return-yang-true-water', '回阳真水', 'Return-Yang True Water', 'Huiyang Zhenshui', '人界高阶', 'High-level Mortal Realm', '与肉身修复、延寿和极端伤势恢复相关的珍稀灵水。', 'A rare true-water resource tied to body repair, lifespan, and recovery from extreme injury.', '它把太阳精火、寒髓、疗伤和延寿资源整合到一条线上。', 'It links solar fire, cold essence, healing, and lifespan resources.', ['healing-pills', 'lifespan-pills', 'spiritual-flame-system'], 'medium'),
    item('seven-star-grass', '七星草', 'Seven-Star Grass', 'Qixing Cao', '制符材料线', 'Talisman material thread', '可归入符纸、制符术和低阶消耗品经济的灵草材料。', 'A herb material for talisman paper, talisman crafting, and low-level consumable economy.', '它补足“符箓从哪里来”的材料环节。', 'It fills the material step behind talisman production.', ['talisman-paper', 'talisman-making'], 'medium')
  ],
  sects: [
    item('qianzhu-sect', '千竹教', 'Thousand Bamboo Sect', 'Qianzhu Jiao', '人界中期', 'Middle Mortal Realm', '与大衍诀、傀儡机关和技术型传承相关的势力线索。', 'A faction thread tied to the Great Development Art, puppet mechanisms, and technical inheritance.', '它能把大衍神君、傀儡术和宗门传承放进同一张关系网。', 'It places Great Development Divine Lord, puppet arts, and sect inheritance into one network.', ['great-development-art', 'puppet-mechanism-art', 'dayan-divine-lord'], 'high'),
    item('xuanjian-sect', '玄剑门', 'Profound Sword Sect', 'Xuanjian Men', '青元剑诀传承线', 'Azure Essence inheritance thread', '青元剑诀相关传承背景的宗门线索。', 'A faction thread for the inheritance background of the Azure Essence Sword Art.', '它让青元剑诀不只是韩立技能，也有前代宗门来路。', 'It gives the Azure Essence Sword Art an inherited sect context beyond Han Li skill use.', ['qingyuan-sword-art', 'sword-cultivator-path'], 'medium'),
    item('yuling-sect', '御灵宗', 'Spirit Control Sect', 'Yuling Zong', '人界御虫御兽线', 'Mortal Realm beast-control thread', '与驱虫术、虫甲术、灵虫培养和御兽体系相关的宗门线索。', 'A sect thread tied to insect control, insect armor, spirit-insect nurturing, and beast arts.', '它补强灵虫不是韩立一人的孤立玩法，而是修仙体系中的专门门类。', 'It shows spirit insects are a dedicated cultivation discipline, not only Han Li private tactic.', ['insect-rearing-art', 'spirit-insect-armor-art', 'spirit-insects'], 'high'),
    item('yinluo-sect', '阴罗宗', 'Yin Luo Sect', 'Yinluo Zong', '大晋魔道线', 'Great Jin devil-path thread', '大晋阶段重要魔道宗门线索，可承接天刹真魔功、血罗罩等魔功术法。', 'An important Great Jin devil-path sect thread, linked to devil arts and blood-path techniques.', '它让大晋魔道不只是散点敌人，而有宗门体系。', 'It turns Great Jin devil-path pressure into an institutional system.', ['devil-arts-system', 'blood-path-arts', 'great-jin-region'], 'high'),
    item('haoran-pavilion', '浩然阁', 'Vast Righteous Pavilion', 'Haoran Ge', '人界儒门线', 'Mortal Realm Confucian thread', '儒门功法、浩然正气和正道势力气质相关的宗门线索。', 'A Confucian-cultivation faction thread tied to righteous Qi and orthodox style.', '它补齐佛、道、儒、魔、妖等修仙流派的势力面。', 'It fills out the faction side of Buddhist, Daoist, Confucian, devil, and demon paths.', ['righteous-alliance', 'sects-and-factions-network'], 'medium'),
    item('xiaochi-palace', '小极宫', 'Lesser Pole Palace', 'Xiaoji Gong', '人界后期寒焰线', 'Late Mortal ice-flame thread', '与寒焰、冰寒功法和高阶人界势力相关的宗门线索。', 'A faction thread tied to cold flames, ice arts, and late Mortal Realm high-level power.', '它和乾蓝冰焰、紫罗极火、玄冰材料可以组成寒焰专题组。', 'It forms an ice-flame cluster with Glacial Ice Flame, Purple Apex Flame, and ice materials.', ['ice-flame-arts', 'purple-apex-flame', 'yin-cold-materials'], 'high'),
    item('tianlan-temple', '天澜圣殿', 'Tianlan Sacred Temple', 'Tianlan Shengdian', '慕兰与突兀线', 'Mulan and Tuwu thread', '草原势力、圣兽印记和区域战争相关的重要组织。', 'An important grassland organization tied to sacred-beast marks and regional war.', '它补足天南之外的草原修炼体系和信仰结构。', 'It fills in the grassland cultivation and belief structure beyond Heavenly South.', ['mulan-tribes', 'mulan-grassland'], 'medium'),
    item('ghost-spirit-branch-network', '鬼道支脉网络', 'Ghost-Path Branch Network', 'Guidao Zhimai Wangluo', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '鬼灵门、阴魂修士、冥地势力和魂道散修构成的鬼道关系入口。', 'A relationship hub for ghost sects, yin-soul cultivators, underworld-like regions, and soul-path rogues.', '它能把鬼道从单个宗门扩成长期主题。', 'It expands ghost arts from one sect into a long-running topic.', ['ghost-spirit-sect', 'ghost-path-arts', 'nether-river-land'], 'high'),
    item('immortal-domain-local-clans', '仙域本土家族', 'Immortal-Domain Local Clans', 'Xianyu Bentu Jiazu', '仙界篇', 'Immortal World Arc', '仙界各地依附仙宫、宗门或资源地生存的家族势力总入口。', 'A hub for local immortal-world clans attached to palaces, sects, or resource sites.', '它让仙界生态不只剩天庭和大宗，也有地方势力。', 'It keeps immortal-world ecology from being only Heavenly Court and great sects.', ['immortal-palace-system', 'north-cold-immortal-domain-core'], 'medium'),
    item('gray-realm-city-lords', '灰界城主体系', 'Gray-Realm City-Lord System', 'Huijie Chengzhu Tixi', '仙界篇灰界阶段', 'Immortal World Gray Realm arc', '灰界城池、城主、地方强者和资源控制的势力结构入口。', 'A faction hub for Gray Realm cities, city lords, local powerhouses, and resource control.', '它把灰界补成有社会层级的异质世界，而不是单纯荒地。', 'It makes the Gray Realm a socially layered alien world, not only wasteland.', ['gray-realm-cities', 'gray-realm-powers', 'gray-realm-powerhouses'], 'high')
  ],
  races: [
    item('yan-race', '燕族', 'Yan People', 'Yan Zu', '天南世俗与修仙背景', 'Heavenly South background', '天南相关的人族支系和地域身份线索。', 'A human subgroup and regional identity thread tied to Heavenly South.', '它补足人界不是抽象人族，而有地域族群和世俗背景。', 'It shows the Mortal Realm has regional peoples and mundane backgrounds, not abstract humans only.', ['human-race', 'heavenly-south-region'], 'medium'),
    item('mulan-people', '慕兰族', 'Mulan People', 'Mulan Zu', '慕兰草原', 'Mulan Grassland', '草原修炼体系、法士和天南战争相关族群。', 'A grassland people tied to spell-warriors, regional war, and non-sect cultivation systems.', '它和慕兰法士、天南战争、草原地理共同补全人界区域压力。', 'It completes Mortal Realm regional pressure with spell warriors, war, and grassland geography.', ['mulan-tribes', 'mulan-grassland'], 'high'),
    item('tuwu-people', '突兀族', 'Tuwu People', 'Tuwu Zu', '草原与圣兽线', 'Grassland and sacred-beast thread', '与慕兰族对照、天澜信仰和草原冲突相关的族群线索。', 'A people contrasted with the Mulan, tied to Tianlan belief and grassland conflicts.', '它让草原线具有多方博弈，而不是单一外部压力。', 'It gives the grassland thread multi-sided conflict instead of one external pressure.', ['tianlan-temple', 'mulan-people'], 'medium'),
    item('flying-beast-lineages', '禽类妖修', 'Avian Demon Cultivators', 'Qinlei Yaoxiu', '妖族与飞灵线', 'Demon and flying-spirit thread', '以速度、风雷、羽族血脉和遁术见长的妖修分支概念。', 'A demon-cultivator branch associated with speed, wind-thunder power, avian bloodlines, and escape arts.', '它能连接血影遁、疾风九变、飞灵族和鲲鹏血脉。', 'It connects blood escape, wind transformations, Flying Spirit peoples, and Kunpeng lineage.', ['kunpeng-lineage', 'flying-spirit-race', 'wind-law'], 'medium'),
    item('corpse-beings', '尸修尸王', 'Corpse Cultivators and Corpse Kings', 'Shixiu Shiwang', '鬼道与尸道线', 'Ghost and corpse-path thread', '由尸气、炼尸和特殊法体构成的异类修炼存在。', 'Unusual cultivator-beings formed around corpse Qi, corpse refinement, and special bodies.', '它把炼尸术、天尸珠和鬼道种族生态连成一组。', 'It groups corpse arts, corpse beads, and ghost-path ecology.', ['corpse-refinement-art', 'heavenly-corpse-bead', 'ghost-spirits'], 'high'),
    item('wild-ancient-species', '蛮荒异种', 'Wild Ancient Species', 'Manhuang Yizhong', '灵界与蛮荒', 'Spirit Realm and wilderness', '远古血脉异兽、变异生态和高阶材料来源的族群总入口。', 'A hub for ancient-bloodline beasts, variant ecology, and high-level materials.', '它补强灵界蛮荒不是空地图，而是材料和威胁密集区。', 'It makes Spirit Realm wilderness a dense zone of materials and threats.', ['ancient-beasts', 'wild-world', 'demon-beast-materials'], 'high'),
    item('variant-spirit-beasts', '变异灵兽', 'Variant Spirit Beasts', 'Bianyi Lingshou', '御兽与妖兽线', 'Beast-taming and demon-beast thread', '进阶或环境影响中能力突变的灵兽类型。', 'Spirit beasts whose abilities mutate during advancement or environmental influence.', '它解释灵兽培养为什么有惊喜，也有风险。', 'It explains why beast nurturing can produce both surprises and risks.', ['beast-taming-art', 'spirit-feeding-pill', 'demon-beasts'], 'medium'),
    item('immortal-palace-officials', '仙宫官属', 'Immortal Palace Officials', 'Xiangong Guanshu', '仙界篇', 'Immortal World Arc', '仙宫巡察、执事、辖地管理者等半官方身份群体。', 'Semi-official groups such as palace inspectors, administrators, and territorial officers.', '它把仙界篇的秩序压迫落到具体人群和身份。', 'It grounds immortal-world order pressure in concrete roles and identities.', ['immortal-palace-system', 'heavenly-court-envoys'], 'high')
  ],
  regions: [
    item('mundane-world', '世俗界', 'Mundane World', 'Shisu Jie', '全书背景', 'Whole-series background', '凡人与修仙界并存但隔膜深重的基础社会空间。', 'The ordinary human social space that coexists with, yet remains separated from, the cultivation world.', '它让“凡人”二字有真实底座，不只是修士回忆。', 'It gives the word mortal a real social base, not only cultivator memory.', ['mortal-realm', 'green-ox-town'], 'high'),
    item('spirit-veins', '灵脉', 'Spirit Veins', 'Lingmai', '洞府与宗门资源线', 'Dwelling and sect resource thread', '宗门山门、洞府、药园和闭关环境最重要的地理资源之一。', 'One of the most important geographical resources for sect grounds, caves, herb gardens, and seclusion.', '它解释为什么山门、洞府和坊市会围绕资源点形成。', 'It explains why sect grounds, caves, and markets form around resource nodes.', ['cave-dwelling-tools', 'medicine-garden', 'loose-cultivator-markets'], 'high'),
    item('cultivator-market', '坊市', 'Cultivator Market', 'Fangshi', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '散修交易、低阶材料流通、情报交换和拍卖前置场景。', 'A market scene for rogue-cultivator trade, low-level materials, intelligence, and pre-auction exchange.', '它是资源经济最接地气的地点类型。', 'It is the most grounded location type for the resource economy.', ['loose-cultivator-markets', 'auction-resources', 'spirit-stone'], 'high'),
    item('auction-house', '拍卖会场', 'Auction House', 'Paimai Huichang', '人界至仙界篇', 'Mortal Realm to Immortal World Arc', '高价丹药、古宝、情报和稀有材料集中流通的场所。', 'A venue where costly pills, ancient treasures, intelligence, and rare materials circulate.', '它把资源稀缺、身份隐藏和高阶博弈压缩到同一场景。', 'It compresses scarcity, hidden identity, and high-level bargaining into one scene.', ['auction-resources', 'gray-market-organizations'], 'high'),
    item('spatial-rifts', '空间裂缝', 'Spatial Rifts', 'Kongjian Liefeng', '跨界与秘境', 'Cross-realm and secret-realm thread', '界面能量不稳形成的危险空间现象，常与飞升、秘境和高阶战斗相关。', 'A dangerous spatial phenomenon tied to ascension, secret realms, and high-level combat.', '它让跨界移动具有实质风险，而不是普通传送。', 'It gives cross-realm movement real risk rather than ordinary teleportation.', ['space-law', 'spatial-node', 'realm-interface-force'], 'high'),
    item('reverse-spirit-channel', '逆灵通道', 'Reverse Spirit Channel', 'Niling Tongdao', '人界至灵界', 'Mortal to Spirit Realm', '联通人界与灵界、承接上界支援或跨界行动的特殊通道概念。', 'A special channel concept connecting Mortal and Spirit Realms for upper-realm support or cross-realm action.', '它补足人界与灵界之间不仅有飞升，也有临时通道和干预。', 'It shows Mortal and Spirit Realms connect through temporary channels and interventions, not only ascension.', ['spatial-rifts', 'spirit-realm-ascension'], 'medium'),
    item('underworld-realm', '阴司之界', 'Underworld Realm', 'Yinsi Zhijie', '轮回与鬼道线', 'Reincarnation and ghost-path thread', '与阴魂、轮回、鬼道和死亡归宿相关的界面概念。', 'A realm concept tied to yin souls, reincarnation, ghost arts, and post-death destination.', '它补齐人界、灵界、魔界、仙界之外的死亡秩序想象。', 'It fills the death-order imagination beyond Mortal, Spirit, Devil, and Immortal Realms.', ['reincarnation-law', 'ghost-path-arts', 'ghost-spirits'], 'medium'),
    item('ancient-devil-realm', '上古魔界', 'Ancient Devil Realm', 'Shanggu Mojie', '魔族源流', 'Devil-race origin thread', '古魔、真魔气和魔化力量源流相关的界面概念。', 'A realm concept tied to ancient devils, true devil Qi, and the source of devil transformation.', '它帮助区分人界魔修、古魔遗留和真正魔界源头。', 'It helps separate Mortal Realm devil cultivators, ancient devil remnants, and the true devil source.', ['devil-race', 'ancient-devils', 'true-demon-qi'], 'high'),
    item('spirit-world-wilderness-frontier', '灵界蛮荒边境', 'Spirit Realm Wilderness Frontier', 'Lingjie Manhuang Bianjing', '灵界', 'Spirit Realm', '人妖两族城池之外，与异族、古兽和资源点接触频繁的边境空间。', 'The frontier beyond human-demon cities, where alien peoples, ancient beasts, and resource sites intersect.', '它补充天渊城之外更开阔、更危险的灵界地图。', 'It expands the Spirit Realm map beyond Heavenly Abyss City into wider danger.', ['wild-world', 'wild-ancient-species', 'heavenly-abyss-city-region'], 'high'),
    item('cold-flame-palace-region', '寒焰宫地', 'Cold-Flame Palace Region', 'Hanyan Gongdi', '人界后期寒焰线', 'Late Mortal ice-flame thread', '小极宫、寒焰、冰寒材料和高阶人界修士活动的区域入口。', 'A regional hub for Lesser Pole Palace, cold flames, ice materials, and late Mortal Realm high-level cultivators.', '它让寒焰线有可落脚的地图位置。', 'It gives the ice-flame thread a map anchor.', ['xiaochi-palace', 'ice-flame-arts', 'yin-cold-materials'], 'medium'),
    item('devil-battlefields', '魔劫战场', 'Devil Calamity Battlefields', 'Mojie Zhanchang', '灵界至魔界线', 'Spirit to Devil Realm thread', '魔族入侵、族群防线和大规模斗法发生的战场型区域。', 'Battlefield regions for devil invasion, racial defenses, and large-scale combat.', '它把魔劫从事件变成可索引的空间专题。', 'It turns the devil calamity from an event into a place-based topic.', ['devil-calamity', 'devil-army', 'spirit-world-human-demon-alliance'], 'high'),
    item('immortal-prison-routes', '仙狱押解路线', 'Immortal Prison Transfer Routes', 'Xianyu Yajie Luxian', '仙界篇', 'Immortal World Arc', '天庭或仙宫追捕、押送、逃脱相关的路线型空间。', 'Route spaces tied to pursuit, transfer, custody, and escape under Heavenly Court or palace order.', '它让仙界追逃线在地图上更有连续性。', 'It gives the sequel pursuit thread more continuity on the map.', ['heavenly-court-prisons', 'north-cold-immortal-domain-pursuit'], 'medium'),
    item('gray-realm-resource-fields', '灰界资源场', 'Gray-Realm Resource Fields', 'Huijie Ziyuan Chang', '仙界篇灰界阶段', 'Immortal World Gray Realm arc', '灰晶、异兽、灰界材料和地方势力争夺资源的场域总入口。', 'A hub for gray crystals, alien beasts, Gray Realm materials, and contested resource sites.', '它继续把灰界补成有经济和争夺逻辑的区域。', 'It further gives the Gray Realm economic and conflict logic.', ['gray-realm-materials', 'gray-crystals', 'gray-realm-city-lords'], 'high')
  ],
  laws: [
    item('qi-refining-stage', '炼气期', 'Qi Refining Stage', 'Lianqi Qi', '人界下境界', 'Lower Mortal Realm stage', '修仙体系的入门阶段，常与基础功法、低阶法术、符箓和法器相连。', 'The entry cultivation stage, tied to basic arts, low-level spells, talismans, and magic tools.', '它是凡人低起点叙事的境界地板。', 'It is the floor of the mortal-flow low-start narrative.', ['changchun-gong', 'magic-tools', 'qi-refining-pills'], 'high'),
    item('foundation-establishment-stage', '筑基期', 'Foundation Establishment Stage', 'Zhuji Qi', '人界下境界', 'Lower Mortal Realm stage', '低阶修士跨过第一道大门槛后的阶段，资源和宗门地位都会明显变化。', 'The stage after the first major threshold, bringing major resource and sect-status changes.', '它和筑基丹、洞府、宗门任务共同构成早期竞争核心。', 'It forms the core early competition with Foundation Establishment Pills, caves, and sect duties.', ['foundation-establishment-pill', 'spirit-veins'], 'high'),
    item('core-formation-stage', '结丹期', 'Core Formation Stage', 'Jiedan Qi', '人界下境界', 'Lower Mortal Realm stage', '修士凝结金丹、能祭炼法宝并进入更高层斗法规则的阶段。', 'The stage of forming a golden core and entering artifact-refining combat rules.', '它是从法器时代进入法宝时代的分水岭。', 'It is the divide between magic-tool and treasure-artifact eras.', ['treasure-artifact', 'gold-forming-pill'], 'high'),
    item('nascent-soul-stage', '元婴期', 'Nascent Soul Stage', 'Yuanying Qi', '人界下境界', 'Lower Mortal Realm stage', '元婴、神魂逃遁、夺舍风险和高阶秘术集中出现的阶段。', 'The stage where Nascent Soul, soul escape, possession risk, and higher secret arts become prominent.', '它让生死规则从肉身生灭变得复杂。', 'It makes life-and-death rules more complex than bodily survival.', ['nascent-soul-out-of-body', 'infant-formation-pill'], 'high'),
    item('deity-transformation-stage', '化神期', 'Deity Transformation Stage', 'Huashen Qi', '人界至飞升门槛', 'Mortal Realm ascension threshold', '人界顶层门槛之一，与天地灵力、空间节点和飞升灵界密切相关。', 'A top Mortal Realm threshold tied to world spiritual power, spatial nodes, and Spirit Realm ascension.', '它把个人修炼和界面限制第一次强烈绑定。', 'It strongly binds personal cultivation to realm-interface limits.', ['spatial-node', 'spirit-realm-ascension', 'realm-interface-force'], 'high'),
    item('spatial-tempering-stage', '炼虚期', 'Spatial Tempering Stage', 'Lianxu Qi', '灵界中境界', 'Middle Spirit Realm stage', '灵界中高阶修士体系中的重要阶段，承接飞升后境界升级。', 'An important Spirit Realm stage after ascension and higher-world progression.', '它让灵界修炼不只是地图升级，也有新的境界阶梯。', 'It makes Spirit Realm progression a new realm ladder, not just a new map.', ['spirit-realm', 'spirit-world-wilderness-frontier'], 'medium'),
    item('body-integration-stage', '合体期', 'Body Integration Stage', 'Heti Qi', '灵界中境界', 'Middle Spirit Realm stage', '灵界高阶战力的重要层级，常进入族群和区域大局。', 'A major high-level Spirit Realm tier often involved in racial and regional affairs.', '它把个体修士推向族群责任和大势力棋局。', 'It pushes individual cultivators into racial responsibility and great-faction games.', ['spirit-world-human-demon-alliance', 'heavenly-abyss-city'], 'medium'),
    item('great-ascension-stage', '大乘期', 'Great Ascension Stage', 'Dacheng Qi', '灵界顶层', 'Top Spirit Realm stage', '灵界近顶层强者境界，能影响族群安危和跨界事件。', 'A near-top Spirit Realm stage whose experts can affect racial security and cross-realm events.', '它是灵界篇大局博弈的战力标尺。', 'It is the power benchmark for Spirit Realm strategic conflicts.', ['mo-jianli', 'ao-xiao-ancestor', 'mother-of-locusts'], 'high'),
    item('tribulation-ascension-stage', '渡劫飞升', 'Tribulation and Ascension', 'Dujie Feisheng', '跨界门槛', 'Cross-realm threshold', '修士从下界进入更高界面的终极门槛，伴随天劫、界面之力和空间风险。', 'The ultimate threshold for entering a higher realm, involving tribulation, interface force, and spatial risk.', '它把境界、地图和天道规则合成一个终点问题。', 'It fuses realm, map, and heavenly-rule systems into one endpoint problem.', ['realm-interface-force', 'spatial-rifts', 'immortal-realm-opening'], 'high'),
    item('true-immortal-stage', '真仙境', 'True Immortal Stage', 'Zhenxian Jing', '仙界篇早期', 'Early Immortal World Arc', '仙界篇承接飞升后体系的基础仙人层级之一。', 'One of the base immortal levels in the sequel after ascension-era progression.', '它是从灵气法力进入仙灵力和仙窍体系的入口。', 'It is the entry into immortal spiritual power and aperture systems.', ['immortal-spiritual-power', 'immortal-aperture'], 'high'),
    item('golden-immortal-stage', '金仙境', 'Golden Immortal Stage', 'Jinxian Jing', '仙界篇', 'Immortal World Arc', '仙界篇中高阶仙人层级，开始更深地牵涉法则和灵域。', 'A higher immortal stage where laws and spiritual domains become more central.', '它适合和金仙任务、仙宫追捕、法则斗法一并索引。', 'It fits Golden Immortal missions, palace pursuit, and law-based battles.', ['law-domain', 'domain-suppression', 'immortal-palace-system'], 'high'),
    item('taiyi-stage', '太乙境', 'Taiyi Stage', 'Taiyi Jing', '仙界篇高阶', 'High-level Immortal World Arc', '仙界篇高阶仙人层级之一，法则积累和大道竞争更明显。', 'A high immortal stage where law accumulation and Dao competition become more visible.', '它是通向大罗、道祖等顶层结构的重要阶梯。', 'It is a major step toward Great Luo and Dao Ancestor structures.', ['dao-ancestor-system', 'law-power'], 'medium'),
    item('great-luo-stage', '大罗境', 'Great Luo Stage', 'Daluo Jing', '仙界篇高阶', 'High-level Immortal World Arc', '仙界篇顶级强者层级之一，常与大道权柄和顶层势力相连。', 'One of the sequel top power tiers, tied to Dao authority and highest factions.', '它帮助把仙界后期战力和道祖体系分层。', 'It helps stratify late sequel power and the Dao Ancestor system.', ['dao-ancestor-position', 'heavenly-court'], 'medium'),
    item('inner-demon-tribulation', '心魔反噬', 'Inner Demon Tribulation', 'Xinmo Fanshi', '突破风险', 'Breakthrough risk', '高阶突破时心神失衡、恐惧执念反扑的风险概念。', 'A breakthrough-risk concept where fear, obsession, and mental imbalance strike back.', '它说明修炼难点不只在资源，也在心境和代价。', 'It shows cultivation difficulty lies in mind and cost as well as resources.', ['bottleneck-breakthrough', 'stabilizing-spirit-pill'], 'high')
  ],
  characters: [
    item('han-family', '韩家亲族', 'Han Family', 'Han Jia Qinzu', '人界开篇', 'Opening Mortal Realm arc', '韩立凡俗出身、家庭牵挂和离乡修仙的背景人物群。', 'The family background behind Han Li mortal origin, attachments, and departure into cultivation.', '它让韩立的凡人底色不只停留在主角简介里。', 'It keeps Han Li mortal roots visible beyond the protagonist entry.', ['han-li', 'green-ox-town', 'mundane-world'], 'medium'),
    item('wu-yan', '吴岩', 'Wu Yan', 'Wu Yan', '七玄门阶段', 'Qixuanmen stage', '七玄门开篇人物线索之一，用于补足江湖门派内部竞争和少年成长环境。', 'An opening Qixuanmen character thread that fills in martial-sect competition and Han Li youth environment.', '它让开篇群像更完整，不只剩墨大夫和厉飞雨。', 'It makes the opening cast fuller than Doctor Mo and Li Feiyu alone.', ['qixuan-men', 'qixuan-mountain'], 'verify'),
    item('wild-wolf-gang-leaders', '野狼帮首领群像', 'Wild Wolf Gang Leaders', 'Yelang Bang Shouling Qunxiang', '七玄门阶段', 'Qixuanmen stage', '七玄门外部江湖压力和凡俗厮杀的敌对群像入口。', 'A hostile group entry for external martial pressure around Qixuanmen.', '它保留凡俗江湖冲突在修仙开端中的作用。', 'It preserves the role of mundane martial conflict in the cultivation opening.', ['qixuan-men-entry', 'mundane-world'], 'medium'),
    item('xiao-cui-er', '小翠儿', 'Xiao Cuier', 'Xiao Cuier', '人界早期', 'Early Mortal Realm arc', '早期人情、托付和宗门外支线相关人物。', 'An early character tied to human ties, entrusted care, and non-sect side threads.', '她能补充韩立谨慎之外仍会处理旧缘和人情债的一面。', 'She adds the side of Han Li dealing with old ties and human obligations.', ['han-li', 'yellow-maple-disciples-group'], 'medium'),
    item('mo-fengwu', '墨凤舞', 'Mo Fengwu', 'Mo Fengwu', '人界开篇', 'Opening Mortal Realm arc', '墨府与七玄门后续人情线中的人物。', 'A character from the Mo household and Qixuanmen aftermath thread.', '她让墨大夫事件之后的凡俗余波有更具体的承接。', 'She gives the aftermath of Doctor Mo events a concrete human continuation.', ['doctor-mo', 'qixuan-men'], 'medium'),
    item('li-huayuan-lineage', '李化元师门', 'Li Huayuan Lineage', 'Li Huayuan Shimeng', '黄枫谷阶段', 'Yellow Maple Valley stage', '韩立黄枫谷身份、师承和弟子关系的群像入口。', 'A group entry for Han Li Yellow Maple Valley lineage, master-disciple ties, and sect identity.', '它比单个人物页更适合承接宗门内部关系。', 'It better carries internal sect relations than one character page alone.', ['li-huayuan', 'huangfeng-valley', 'yellow-maple-valley-disciples'], 'high'),
    item('hongfu-lineage', '红拂一脉', 'Hong Fu Lineage', 'Hongfu Yimai', '黄枫谷阶段', 'Yellow Maple Valley stage', '黄枫谷女性高阶修士、弟子和早期宗门人情网络的支线入口。', 'A branch entry for Yellow Maple Valley female senior cultivators, disciples, and early sect ties.', '它补足早期宗门不只有韩立师门一条线。', 'It shows the early sect has more than Han Li own lineage.', ['hongfu', 'dong-xuaner', 'chen-qiaoqian'], 'medium'),
    item('grandmaster-linghu-circle', '令狐老祖圈层', 'Linghu Ancestor Circle', 'Linghu Laozu Quan Ceng', '黄枫谷至天南', 'Yellow Maple Valley to Heavenly South', '黄枫谷高层、天南局势和宗门存续决策相关人物群。', 'A group entry for Yellow Maple Valley senior circles, Heavenly South politics, and survival decisions.', '它把老祖从单个角色扩展成高层决策入口。', 'It expands the ancestor from one figure into a senior decision hub.', ['linghu-ancestor', 'heavenly-south-alliance'], 'medium'),
    item('mulan-diviners-group', '慕兰法士群像', 'Mulan Spell-Warrior Figures', 'Mulan Fashi Qunxiang', '慕兰草原', 'Mulan Grassland', '慕兰草原修炼体系、战争对手和区域压力相关人物群。', 'A character-group entry for Mulan spell-warriors, war opponents, and regional pressure.', '它把草原线的人物补进来，避免只有势力和地名。', 'It adds characters to the grassland thread, not only factions and places.', ['mulan-people', 'mulan-tribes', 'mulan-grassland'], 'high'),
    item('tianlan-sacred-beast', '天澜圣兽', 'Tianlan Sacred Beast', 'Tianlan Shengshou', '草原与灵界线', 'Grassland and Spirit Realm thread', '草原信仰、圣兽印记和上界投影相关的特殊存在。', 'A special being tied to grassland belief, sacred-beast marks, and upper-realm projection.', '它把人界草原冲突与上界力量连接起来。', 'It connects Mortal Realm grassland conflict with upper-realm power.', ['tianlan-temple', 'tuwu-people', 'reverse-spirit-channel'], 'medium'),
    item('qian-laomo', '乾老魔', 'Old Devil Qian', 'Qian Laomo', '人界后期', 'Late Mortal Realm', '大晋等后期人界阶段的魔道老怪线索。', 'A late Mortal Realm old-devil character thread around Great Jin-era danger.', '他补足人界后期“老怪生态”的敌手层。', 'He fills the opponent layer of late Mortal Realm old monsters.', ['great-jin-region', 'devil-arts-system'], 'medium'),
    item('long-han', '龙晗', 'Long Han', 'Long Han', '灵界人族线', 'Spirit Realm human thread', '灵界人族高层人物线索，可与天渊城和人妖两族联盟相连。', 'A Spirit Realm human senior figure thread linked to Heavenly Abyss City and the human-demon alliance.', '他让灵界人族高层不只由群像页承载。', 'He gives the Spirit Realm human senior layer a named node beyond group pages.', ['heavenly-abyss-city', 'spirit-world-human-demon-alliance'], 'medium'),
    item('xian-xian', '纤纤', 'Xian Xian', 'Xian Xian', '飞灵族阶段', 'Flying Spirit stage', '飞灵族支线人物，可承接圣子圣女、真灵血脉和身份伪装线。', 'A Flying Spirit Race side character tied to holy-child roles, true-spirit bloodlines, and identity disguise.', '她补足飞灵族人物层的具体入口。', 'She gives the Flying Spirit character layer a concrete entry.', ['flying-spirit-figures-group', 'flying-spirit-region', 'tianpeng-race'], 'medium'),
    item('white-robed-woman-group', '仙界早期女修群像', 'Early Immortal Female Cultivators', 'Xianjie Zaoqi Nuxiu Qunxiang', '仙界篇早期', 'Early Immortal World Arc', '黑风海域、烛龙道和北寒仙域早期女性角色的群像入口。', 'A group entry for early sequel female cultivators around Black Wind Sea, Candle Dragon Dao, and North Cold domain.', '它补充仙界篇早期人情和同行关系的密度。', 'It adds density to early sequel human ties and companion relations.', ['lu-yuqing', 'bai-suyuan', 'black-wind-sea-factions'], 'medium'),
    item('gray-realm-noble-figures', '灰界贵胄群像', 'Gray-Realm Noble Figures', 'Huijie Guizhou Qunxiang', '仙界篇灰界阶段', 'Immortal World Gray Realm arc', '灰界城池中的贵族、头领、继承者和地方精英人物入口。', 'A character hub for Gray Realm nobles, chiefs, heirs, and local elites.', '它让灰界社会更像完整文明，而不只是危险区域。', 'It makes Gray Realm society feel like a full civilization, not only a danger zone.', ['gray-realm-city-lords', 'gray-realm-powerhouses'], 'high'),
    item('time-dao-cultivator-group', '时间法则修士群像', 'Time-Law Cultivator Group', 'Shijian Faze Xiushi Qunxiang', '仙界篇', 'Immortal World Arc', '真言门、时间道祖、时间功法传承和相关敌友的群像入口。', 'A group hub for True Word Sect, the Time Dao Ancestor, time-art inheritance, and related allies or enemies.', '它能集中承接仙界篇最核心的一条大道人物线。', 'It concentrates the sequel core time-law character thread.', ['time-law', 'true-word-sect', 'time-dao-ancestor'], 'high'),
    item('mi-luo-ancestor', '弥罗老祖', 'Mi Luo Ancestor', 'Miluo Laozu', '仙界篇真言门历史线', 'Immortal World True Word Sect history thread', '真言门末代宗主，主修时间法则，修为约大罗后期，韩立隔世继承其大五行幻世诀传承。', 'The last master of True Word Sect, a time-law cultivator around late Great Luo, whose Great Five Elements Illusory World Art lineage is inherited by Han Li across time.', '他是理解真言门覆灭、奇摩子背叛、古或今压迫和韩立重建真言门的中心人物。', 'He is central for understanding the fall of True Word Sect, Qi Mozi betrayal, Gu Huojin pressure, and Han Li rebuilding the sect.', ['true-word-sect', 'great-five-elements-illusory-world', 'qi-mozi', 'gu-huajin', 'han-li'], 'high'),
    item('mu-yan', '木延', 'Mu Yan', 'Mu Yan', '仙界篇真言门历史线', 'Immortal World True Word Sect history thread', '弥罗老祖大弟子，修木属性时间法则和东乙枯荣经，真言门大战前后牵连奇摩子背叛线。', 'Mi Luo Ancestor first disciple, a wood-aspected time-law cultivator tied to the Eastern Yi Wither-Bloom Scripture and Qi Mozi betrayal thread.', '他补齐真言门五大亲传弟子的传承分工。', 'He fills in the inheritance structure of Mi Luo five direct disciples.', ['mi-luo-ancestor', 'east-wood-wither-bloom', 'qi-mozi'], 'high'),
    item('wu-yang', '武阳', 'Wu Yang', 'Wu Yang', '人界至仙界篇轮回线', 'Mortal Realm to Immortal World reincarnation thread', '从早期七玄门同辈线延伸到仙界轮回殿线的人物，后续身份牵动轮回殿高层结构。', 'A figure whose thread stretches from the early Qixuanmen generation into the sequel Reincarnation Palace hierarchy.', '他适合放在跨书人物因果里，解释前传人物如何在仙界篇回流。', 'He belongs in the cross-book karmic cast, showing how earlier figures return in the sequel.', ['qixuan-men', 'reincarnation-palace', 'mi-luo-ancestor'], 'high'),
    item('jin-yuanzi', '金元子', 'Jin Yuanzi', 'Jin Yuanzi', '仙界篇真言门历史线', 'Immortal World True Word Sect history thread', '弥罗老祖亲传弟子之一，修金属性时间法则和真言化轮经，后续传闻挑战时间道祖而消亡。', 'A direct disciple of Mi Luo Ancestor, a metal-aspected time-law cultivator tied to the Mantra Wheel Scripture and a later challenge to the Time Dao Ancestor.', '他把真言化轮经从功法页落到传承人物关系里。', 'He anchors the Mantra Wheel Scripture in the character inheritance web.', ['mi-luo-ancestor', 'mantra-wheel-scripture', 'time-dao-ancestor'], 'high'),
    item('he-ze', '禾泽', 'He Ze', 'He Ze', '仙界篇真言门遗迹线', 'Immortal World True Word Sect ruins thread', '弥罗老祖五弟子，修水属性时间法则和水衍四时诀，在水衍宫向韩立留下传承与遗愿。', 'Mi Luo Ancestor fifth disciple, a water-aspected time-law cultivator tied to the Water Derivation Four Seasons Art who leaves Han Li inheritance and a final request in Water Derivation Palace.', '他是韩立补全真言门传承、理解奇摩子旧账的重要节点。', 'He is a key node for Han Li completing True Word inheritance and understanding the old debt with Qi Mozi.', ['mi-luo-ancestor', 'water-derivation-four-seasons', 'qi-mozi', 'han-li'], 'high')
  ],
  timeline: [
    item('mortal-family-departure', '山村离家', 'Departure from the Village', 'Shancun Lijia', '开篇', 'Opening', '韩立从凡俗家庭进入七玄门的起点阶段。', 'The opening stage where Han Li leaves a mortal family and enters Qixuanmen.', '它是“凡人”身份转向修仙道路的第一步。', 'It is the first step from mortal identity toward cultivation.', ['han-family', 'green-ox-town', 'qixuan-men-entry'], 'high'),
    item('doctor-mo-conflict', '墨大夫夺舍危机', 'Doctor Mo Possession Crisis', 'Mo Dafu Duoshe Weiji', '七玄门阶段', 'Qixuanmen stage', '韩立第一次真正面对修仙世界残酷规则的关键事件。', 'The key event where Han Li first confronts the cruel rules of cultivation.', '它奠定韩立谨慎、留后手和不轻信他人的底色。', 'It establishes Han Li caution, backups, and distrust of easy promises.', ['doctor-mo', 'seven-ghost-soul-devouring-art', 'possession-secret-art'], 'high'),
    item('yellow-maple-entry', '入黄枫谷', 'Entering Yellow Maple Valley', 'Ru Huangfeng Gu', '人界早期', 'Early Mortal Realm', '韩立从江湖边缘进入正式修仙宗门制度的阶段。', 'The stage where Han Li moves from martial edges into formal sect cultivation.', '它把个人求生变成宗门任务、资源分配和同门竞争。', 'It turns personal survival into sect missions, resource allocation, and peer competition.', ['huangfeng-valley', 'foundation-establishment-stage'], 'high'),
    item('foundation-pill-contest', '筑基资源争夺', 'Foundation Resource Contest', 'Zhuji Ziyuan Zhengduo', '人界早期', 'Early Mortal Realm', '围绕筑基丹、灵药和低阶秘境展开的早期核心竞争。', 'The early core competition around Foundation Establishment Pills, herbs, and low-level secret realms.', '它是凡人流资源稀缺感最鲜明的一段。', 'It is one of the clearest early expressions of mortal-flow scarcity.', ['foundation-establishment-pill', 'blood-forbidden-land-arc'], 'high'),
    item('chaotic-star-sea-hunt', '乱星海猎妖经营', 'Chaotic Star Sea Beast-Hunting Economy', 'Luanxinghai Lieyao Jingying', '乱星海', 'Chaotic Star Sea', '韩立在海域阶段通过猎妖、材料、丹药和身份隐藏积累资源的阶段。', 'A Chaotic Star Sea stage of accumulating resources through beast hunting, materials, pills, and hidden identity.', '它把“打怪”写成经济循环和风险管理。', 'It turns monster hunting into economic cycle and risk management.', ['outer-star-sea', 'demon-core', 'rainbow-skirt-grass'], 'high'),
    item('nascent-soul-breakthrough-thread', '结婴突破线', 'Nascent Soul Breakthrough Thread', 'Jieying Tupo Xian', '人界中后期', 'Middle-late Mortal Realm', '围绕元婴门槛、丹药、心魔和高阶身份变化展开的阶段。', 'A stage around Nascent Soul threshold, pills, inner demons, and high-level identity change.', '它让主角从区域小心经营进入高阶修士圈层。', 'It moves the protagonist from regional resource management into high-level cultivator circles.', ['nascent-soul-stage', 'stabilizing-spirit-pill', 'inner-demon-tribulation'], 'high'),
    item('great-jin-old-monster-stage', '大晋老怪博弈', 'Great Jin Old-Monster Games', 'Dajin Laoguai Boyi', '人界后期', 'Late Mortal Realm', '韩立进入大晋后面对更复杂遗迹、老怪和宗门家族棋局的阶段。', 'The Great Jin stage where Han Li faces more complex ruins, old monsters, and clan-sect games.', '它把人界后期的尺度明显拉大。', 'It noticeably expands the scale of the late Mortal Realm.', ['great-jin-region', 'kunwu-mountain-arc', 'qian-laomo'], 'high'),
    item('spatial-node-ascension-thread', '空间节点飞升线', 'Spatial Node Ascension Thread', 'Kongjian Jiedian Feisheng Xian', '人界至灵界', 'Mortal to Spirit transition', '围绕空间节点、界面之力和飞升风险展开的跨界阶段。', 'A cross-realm stage around spatial nodes, interface force, and ascension risks.', '它是从人界故事进入灵界故事的桥。', 'It is the bridge from Mortal Realm story into Spirit Realm story.', ['spatial-node', 'spatial-rifts', 'spirit-realm-ascension'], 'high'),
    item('spirit-world-race-conflict-thread', '灵界多族冲突线', 'Spirit Realm Multi-Race Conflict Thread', 'Lingjie Duozu Chongtu Xian', '灵界', 'Spirit Realm', '韩立飞升后面对人妖两族、异族、真灵血脉和边境压力的阶段总入口。', 'A Spirit Realm hub for human-demon alliance, alien peoples, true-spirit bloodlines, and frontier pressure.', '它让灵界篇从个人修炼扩展为族群世界。', 'It expands Spirit Realm storytelling from personal cultivation into a world of peoples.', ['spirit-world-human-demon-alliance', 'flying-spirit-race', 'wild-world'], 'high'),
    item('devil-war-prelude', '魔劫前奏', 'Prelude to the Devil Calamity', 'Mojie Qianzou', '灵界至魔界线', 'Spirit to Devil Realm thread', '魔族压力由零散威胁逐步转为大规模战争阴影的阶段。', 'The stage where devil-race pressure grows from scattered threat into large-scale war shadow.', '它让魔族专题和剧情线更紧密相连。', 'It ties the devil-race topic more tightly to the timeline.', ['devil-race', 'devil-army', 'devil-battlefields'], 'high'),
    item('immortal-aperture-cultivation-thread', '仙窍修炼线', 'Immortal Aperture Cultivation Thread', 'Xianqiao Xiulian Xian', '仙界篇', 'Immortal World Arc', '仙界篇中围绕仙窍、仙灵力、境界推进和法则积累展开的长期修炼线。', 'A long sequel cultivation thread around immortal apertures, immortal spiritual power, realm progress, and law accumulation.', '它把仙界篇修炼机制独立标出来。', 'It marks the sequel cultivation mechanism as its own thread.', ['immortal-aperture', 'true-immortal-stage', 'golden-immortal-stage'], 'high'),
    item('dao-ancestor-endgame-thread', '道祖终局线', 'Dao Ancestor Endgame Thread', 'Daozu Zhongju Xian', '仙界篇后期', 'Late Immortal World Arc', '围绕道祖位格、天庭秩序、轮回与时间大道冲突展开的终局阶段。', 'The endgame stage around Dao Ancestor status, Heavenly Court order, reincarnation, and time-law conflict.', '它让法则终局不只是一页概览，而有单独剧情主干。', 'It gives the final law conflict its own timeline trunk.', ['dao-ancestor-position', 'laws-final-conflict', 'time-dao-cultivator-group'], 'high')
  ]
}

for (const [section, entries] of Object.entries(deepCompletionCatalog)) {
  catalog[section].push(...entries)
}

for (const [section, entries] of Object.entries(catalog)) {
  for (const entry of entries) entry.section = section
}

const allEntries = Object.values(catalog).flat()
const entryBySlug = new Map(allEntries.map((entry) => [entry.slug, entry]))
const sectionBySlug = new Map(sections.map((section) => [section.slug, section]))

const confidenceText = {
  high: { zh: '高', en: 'high' },
  medium: { zh: '中', en: 'medium' },
  verify: { zh: '待逐章核对', en: 'needs chapter check' }
}

function story(order, ageZh, ageEn, locationZh, locationEn, gainsZh, gainsEn, eventZh, eventEn, noteZh = '综合公开年表估算，保留约数口径。', noteEn = 'Estimated from public timeline references; kept as approximate.') {
  return { order, ageZh, ageEn, locationZh, locationEn, gainsZh, gainsEn, eventZh, eventEn, noteZh, noteEn }
}

const ageCalibration = [
  {
    zhRealm: '人界',
    enRealm: 'Mortal Realm',
    zhAge: '约10-1007岁',
    enAge: 'about age 10-1007',
    zhBasis: '10岁入七玄门；21岁血色禁地；31岁遁入乱星海；217岁结婴；885岁化神；1007岁偷渡灵界。',
    enBasis: 'Age 10 enters Qixuanmen; 21 Blood Forbidden Land; 31 flees to the Chaotic Star Sea; 217 Nascent Soul; 885 Spirit Transformation; 1007 enters the Spirit Realm.'
  },
  {
    zhRealm: '灵界',
    enRealm: 'Spirit Realm',
    zhAge: '约1007-11190岁',
    enAge: 'about age 1007-11190',
    zhBasis: '1007岁落入灵界；1160岁入天渊城体系；1420岁炼虚；1565岁合体；2468岁大乘；11190岁飞升仙界。',
    enBasis: 'Age 1007 arrives in the Spirit Realm; 1160 enters the Heavenly Abyss City system; 1420 Void Refinement; 1565 Body Integration; 2468 Great Ascension; 11190 ascends to the Immortal Realm.'
  },
  {
    zhRealm: '仙界',
    enRealm: 'Immortal World Arc',
    zhAge: '约11190岁以后',
    enAge: 'after about age 11190',
    zhBasis: '仙界篇年历从灵寰界线另算：约第10年到仙界，第20年入烛龙道，第660年前后北寒仙域冲突，第2153年前后真言门遗迹，第2156年前后灰界，第5000年后进入终局；粗略可按“11190岁 + 年历年数”理解。',
    enBasis: 'The sequel calendar counts from the Linghuan Realm thread: around year 10 reaches the Immortal Realm, year 20 enters Candle Dragon Dao, around year 660 North Cold conflict, around year 2153 True Word Sect ruins, around year 2156 Gray Realm, and after year 5000 the endgame; roughly read it as age 11190 plus sequel-calendar years.'
  }
]

const storylineDetails = new Map(Object.entries({
  'mortal-family-departure': story(1, '约10岁上下', 'about age ten', '青牛镇韩家与七玄门山门', 'Han family home near Green Ox Town and the Qixuanmen gate', '入门机会、离乡起点', 'an entry chance and the first departure from home', '韩立离开凡俗家庭，进入七玄门选拔与门派生活。', 'Han Li leaves his mortal family and enters Qixuanmen selection and sect life.'),
  'qixuan-men-entry': story(2, '约10岁', 'about age 10', '七玄门山门、药园线索', 'Qixuanmen grounds and medicine-garden thread', '门派身份、医药接触、长春功线索', 'sect identity, medical exposure, and the Everlasting Spring Art thread', '从普通弟子进入墨大夫视野，修仙门槛开始显现。', 'He moves from ordinary disciple into Doctor Mo orbit, and the cultivation threshold begins to appear.'),
  'doctor-mo-crisis': story(3, '约14-16岁', 'about age 14-16', '七玄门、墨大夫住处', 'Qixuanmen and Doctor Mo quarters', '警惕心、保命底牌、修仙残酷认知', 'caution, survival backups, and awareness of cultivation cruelty', '墨大夫的利用与压迫逐步揭开，韩立第一次被迫在生死局中周旋。', 'Doctor Mo exploitation becomes clear, forcing Han Li into his first life-and-death cultivation trap.'),
  'doctor-mo-conflict': story(4, '约16岁', 'about age 16', '七玄门、墨府余波', 'Qixuanmen and the Mo household aftermath', '反制经验、初步独立、江湖余波线索', 'counterplay experience, early independence, and martial-world aftermath threads', '围绕夺舍风险完成反击，七玄门阶段的天真被彻底打碎。', 'He counters the possession threat, and the innocence of the Qixuanmen stage is broken.'),
  'yellow-maple-entry': story(5, '约18岁', 'about age 18', '太南小会、黄枫谷', 'Tainan gathering and Yellow Maple Valley', '黄枫谷弟子身份、正式修仙社会入口', 'Yellow Maple Valley disciple status and formal cultivation-society access', '韩立通过机缘和令牌进入越国七派体系。', 'Through opportunity and a token, Han Li enters the Yue Seven Sects system.'),
  'yellow-maple-cultivation': story(6, '约18-26岁', 'about age 18-26', '黄枫谷、洞府、坊市', 'Yellow Maple Valley, cave dwelling, and markets', '宗门任务、炼丹资源、小绿瓶资源循环', 'sect missions, alchemy resources, and the green-bottle resource loop', '从散落机缘进入制度化修炼，资源竞争变成日常。', 'Scattered opportunities become institutional cultivation, and resource competition becomes daily life.'),
  'foundation-pill-contest': story(7, '约21-26岁', 'about age 21-26', '血色禁地与越国七派', 'Blood Forbidden Land and Yue sects', '筑基丹线索、灵草资源、秘境经验', 'Foundation Establishment Pill leads, spirit herbs, and secret-realm experience', '低阶弟子为筑基资源冒险，韩立初步形成秘境求生方法。', 'Low-level disciples risk their lives for foundation resources, and Han Li forms early survival methods.'),
  'blood-forbidden-land-arc': story(8, '约21岁', 'about age 21', '血色禁地', 'Blood Forbidden Land', '筑基相关灵药、低阶斗法经验', 'foundation herbs and low-level combat experience', '越国七派弟子进入禁地争夺灵药，低阶修士的残酷筛选集中爆发。', 'Yue sect disciples enter the forbidden land for herbs, exposing the brutal filter on low-level cultivators.'),
  'yue-demonic-war': story(9, '约29-31岁', 'about age 29-31', '越国、天南周边', 'Yue State and nearby Heavenly South', '战争经验、离宗避险动机', 'war experience and motivation to leave sect danger', '正魔压力改变越国修仙格局，韩立被推离早期宗门日常。', 'Righteous-demonic pressure reshapes Yue cultivation politics and pushes Han Li beyond sect routine.'),
  'chaotic-star-sea-journey': story(10, '约31-155岁', 'about age 31-155', '乱星海、魁星岛、内外星海', 'Chaotic Star Sea, Kuixing Island, Inner and Outer Star Sea', '海域身份、妖兽资源、散修经营空间', 'maritime identity, demon-beast resources, and rogue-cultivator operating space', '韩立转入海域社会，在陌生秩序中重新积累资源。', 'Han Li moves into maritime society and rebuilds resources under an unfamiliar order.'),
  'chaotic-star-sea-hunt': story(11, '约31-96岁', 'about age 31-96', '外星海', 'Outer Star Sea', '妖丹、妖兽材料、海域交易经验', 'demon cores, beast materials, and sea-market experience', '猎妖、炼丹和隐藏身份构成长期资源循环。', 'Beast hunting, alchemy, and concealed identity become a long-term resource loop.'),
  'outer-star-sea-hunting': story(12, '约31-96岁', 'about age 31-96', '外星海猎妖区域', 'Outer Star Sea hunting grounds', '妖丹、霓裳草等海域资源线索', 'demon cores and maritime resource threads such as Rainbow Skirt Grass', '通过高风险猎妖积累突破与交易资源。', 'High-risk beast hunting supplies breakthrough and trade resources.'),
  'xutian-hall-treasure-hunt': story(13, '约120-130岁', 'about age 120-130', '虚天殿、乱星海核心势力圈', 'Void Heaven Hall and the Chaotic Star Sea power center', '虚天鼎线索、秘境夺宝经验', 'Void Heaven Cauldron clues and secret-realm treasure-contest experience', '多方高阶修士围绕虚天殿展开争夺，韩立被卷入大势力博弈。', 'High-level parties contend around Void Heaven Hall, drawing Han Li into great-faction games.'),
  'return-to-heavenly-south': story(14, '约155岁', 'about age 155', '天南、旧宗门与区域战场', 'Heavenly South, old sect ties, and regional battlefields', '更高身份、旧地关系重组', 'higher status and a reshaped relationship with old places', '韩立回到熟悉区域，个人实力和地区位置发生反转。', 'Han Li returns to familiar regions with reversed status and stronger leverage.'),
  'heavenly-south-return-and-war': story(15, '约155-217岁', 'about age 155-217', '天南战局、慕兰草原相关区域', 'Heavenly South war situation and Mulan Grassland regions', '高阶修士名望、区域大战经验', 'high-level reputation and regional-war experience', '回归不只是旧地重游，而是参与更大区域战争。', 'The return becomes participation in larger regional war rather than a simple homecoming.'),
  'nascent-soul-formation-thread': story(16, '约217岁', 'about age 217', '天南与闭关洞府', 'Heavenly South and secluded cultivation sites', '元婴身份、突破经验、高阶圈层入口', 'Nascent Soul status, breakthrough experience, and entry into high-level circles', '围绕结婴丹药、心魔和准备完成关键跨阶。', 'Through pills, mental risk, and preparation, Han Li crosses a key threshold.'),
  'nascent-soul-breakthrough-thread': story(17, '约217岁', 'about age 217', '闭关洞府、天南修仙圈', 'secluded cultivation sites and Heavenly South circles', '元婴门槛、心魔应对、身份跃迁', 'Nascent Soul threshold, inner-demon handling, and status leap', '突破让韩立从区域经营者进入高阶修士层面。', 'The breakthrough moves Han Li from regional operator into the high-level cultivator layer.'),
  'demonfall-valley-arc': story(18, '约260-300岁', 'about age 260-300', '坠魔谷', 'Demonfall Valley', '古魔与遗迹线索、险地斗法经验', 'ancient-devil and ruin clues plus danger-zone combat experience', '险地探索把古魔、禁制和高阶修士算计集中到一起。', 'The danger-zone expedition concentrates ancient devils, restrictions, and high-level schemes.'),
  'great-jin-journey': story(19, '约300-600岁', 'about age 300-600', '大晋', 'Great Jin', '大晋地图、古修遗迹和家族势力线索', 'Great Jin map knowledge, ancient-cultivator ruins, and clan-faction threads', '韩立进入更大的人界舞台，资源密度和敌手层级同步提高。', 'Han Li enters a larger Mortal Realm stage with denser resources and stronger opponents.'),
  'kunwu-mountain-arc': story(20, '约400-500岁', 'about age 400-500', '昆吾山', 'Kunwu Mountain', '古宝、遗迹传承、老怪博弈经验', 'ancient treasures, ruin inheritances, and old-monster games', '围绕昆吾山遗迹，多方势力将人界后期争夺推到高点。', 'The Kunwu ruins pull multiple factions into a late-Mortal-Realm peak contest.'),
  'great-jin-old-monster-stage': story(21, '约300-700岁', 'about age 300-700', '大晋宗门、家族、遗迹', 'Great Jin sects, clans, and ruins', '与老怪周旋经验、后期人界情报', 'experience dealing with old monsters and late Mortal Realm intelligence', '韩立开始频繁面对老怪、宗门家族和遗迹棋局。', 'Han Li repeatedly faces old monsters, clan-sect politics, and ruin chessboards.'),
  'spatial-node-ascension-thread': story(22, '约885-1007岁', 'about age 885-1007', '空间节点、跨界通道', 'spatial nodes and cross-realm passages', '飞升路径、界面规则认知', 'ascension route knowledge and interface-rule awareness', '空间节点把人界故事推向飞升风险和界面之力。', 'Spatial nodes push the Mortal Realm story toward ascension risk and interface force.'),
  'spirit-realm-ascension': story(23, '约1007岁', 'about age 1007', '灵界、人族活动区域', 'Spirit Realm and human-race territories', '灵界身份、更高界面规则', 'Spirit Realm identity and higher-realm rules', '韩立跨入灵界，原有资源、境界和敌我格局全面升级。', 'Han Li enters the Spirit Realm, upgrading resources, realm scale, and conflict structure.'),
  'heavenly-abyss-city-arc': story(24, '约1007-1160岁', 'about age 1007-1160', '天渊城、人妖两族防线', 'Heavenly Abyss City and human-demon defensive lines', '灵界秩序、人族防线身份', 'Spirit Realm order and a place in human defensive systems', '韩立接触灵界人族防线，个人修炼进入族群生存背景。', 'Han Li meets Spirit Realm human defenses, moving personal cultivation into racial survival.'),
  'spirit-world-race-conflict-thread': story(25, '约1160-2468岁', 'about age 1160-2468', '灵界多族边境、飞灵族地域', 'Spirit Realm multi-race frontiers and Flying Spirit regions', '多族情报、真灵血脉、高阶材料线索', 'multi-race intelligence, true-spirit bloodlines, and high-grade material clues', '灵界篇从个人修炼扩展为多族世界和边境压力。', 'The Spirit Realm arc expands from personal cultivation into a world of peoples and frontiers.'),
  'spirit-world-racial-war': story(26, '约1420-2468岁', 'about age 1420-2468', '人妖两族防线、异族战场', 'human-demon defensive lines and alien battlefields', '族群战争经验、大局身份', 'racial-war experience and strategic status', '灵界多族压力升级，韩立被卷入界面和族群层面的冲突。', 'Multi-race pressure escalates, pulling Han Li into realm and racial conflict.'),
  'broad-cold-realm-arc': story(27, '约1500-1700岁', 'about age 1500-1700', '广寒界', 'Broad Cold Realm', '秘境机缘、多族争夺经验', 'secret-space opportunities and multi-race contest experience', '特殊空间中的机缘争夺让灵界资源竞争进一步升级。', 'Opportunity contests in a special space escalate Spirit Realm resource competition.'),
  'devil-war-prelude': story(28, '约2468岁以后', 'after about age 2468', '灵界边境、魔族压力区域', 'Spirit Realm frontiers and devil-pressure zones', '魔劫情报、跨界威胁认知', 'devil-calamity intelligence and cross-realm threat awareness', '魔族压力由零散危险变成大规模战争阴影。', 'Devil-race pressure shifts from scattered danger into the shadow of large-scale war.'),
  'devil-realm-expedition': story(29, '约2468-11190岁之间', 'roughly between age 2468 and 11190', '魔界与魔族资源地', 'Devil Realm and devil-resource regions', '魔界资源、高阶魔族情报', 'devil-realm resources and high-level devil intelligence', '韩立亲历魔界空间，魔族线从外部威胁变成实地经历。', 'Han Li experiences Devil Realm space directly, turning the devil thread into a lived journey.'),
  'devil-calamity': story(30, '约灵界后期至11190岁前', 'late Spirit Realm before age 11190', '灵界与魔界交界战场', 'battlefields between Spirit and Devil Realm pressure', '族群级战争经验、跨界危机处理', 'racial-war scale experience and cross-realm crisis handling', '魔劫把个人修炼推入界面安危与族群战争。', 'The devil calamity pushes personal cultivation into realm security and racial war.'),
  'immortal-realm-opening': story(31, '约11190-11200岁', 'about age 11190-11200', '仙界下层活动区域、北寒仙域前缘', 'lower immortal-world activity zones and the edge of North Cold Immortal Domain', '仙界身份重建、记忆与追捕线索', 'identity rebuilding, memory threads, and pursuit pressure', '韩立进入仙界篇后重新低处起步，面对秩序、身份和追索压力。', 'After entering the sequel, Han Li restarts from a low foothold under order, identity, and pursuit pressure.', '以原著11190岁飞升为锚点，仙界篇年历约第10年前后抵达仙界。', 'Anchored on age 11190 ascension; around sequel-calendar year 10 he reaches the Immortal Realm.'),
  'black-wind-sea-opening': story(32, '约11200-11210岁', 'about age 11200-11210', '黑风海域、黑风岛', 'Black Wind Sea and Black Wind Island', '落脚点、恢复资源、地方身份', 'foothold, recovery resources, and local identity', '韩立在海域落脚，逐步恢复并重建仙界行动空间。', 'Han Li lands in a maritime region, recovers, and rebuilds room to act in the immortal world.', '按仙界篇年历第10-20年前后粗算。', 'Estimated from around sequel-calendar years 10-20.'),
  'candle-dragon-dao-arc': story(33, '约11210-11850岁', 'about age 11210-11850', '烛龙道、北寒仙域', 'Candle Dragon Dao and North Cold Immortal Domain', '宗门落脚、仙界任务、法则功法线索', 'sect foothold, immortal-world missions, and law-art clues', '韩立进入仙界组织生态，学习、任务和更大冲突开始交织。', 'Han Li enters immortal-world organizational life as study, missions, and larger conflict interlace.', '约对应仙界篇年历第20-660年前后。', 'Roughly sequel-calendar years 20-660.'),
  'north-cold-immortal-domain-pursuit': story(34, '约11850-12520岁', 'about age 11850-12520', '北寒仙域核心区', 'core North Cold Immortal Domain', '仙宫追逃经验、身份伪装、路线情报', 'palace-pursuit experience, identity disguise, and route intelligence', '仙宫秩序压力加重，韩立在追逃中调整身份和路线。', 'Immortal-palace order increases pressure, forcing Han Li to adjust identity and routes while pursued.', '约对应仙界篇年历第660-1330年前后。', 'Roughly sequel-calendar years 660-1330.'),
  'immortal-aperture-cultivation-thread': story(35, '约11850-12500岁起长期推进', 'from about age 11850-12500 onward', '仙界洞府、宗门和任务区域', 'immortal dwellings, sect spaces, and mission regions', '仙窍推进、仙灵力积累、法则材料', 'immortal-aperture progress, immortal energy, and law materials', '仙界修炼从法力资源推进到仙窍、法则和道丹资源。', 'Sequel cultivation advances from mana resources into apertures, laws, and Dao-pill resources.', '仙窍修炼贯穿仙界篇，此处按早期闭关与道丹线粗估。', 'Immortal-aperture cultivation runs through the sequel; this estimate follows early secluded-cultivation and Dao-pill threads.'),
  'true-word-sect-ruins-arc': story(36, '约13280-13350岁', 'about age 13280-13350', '真言门遗迹、时间法则遗存', 'True Word Sect ruins and time-law remnants', '时间功法、真言门历史线索', 'time arts and True Word Sect historical clues', '遗迹线把掌天瓶、时间法则和仙界旧史连到一起。', 'The ruin thread connects the Heavenly Bottle, time law, and old immortal-world history.', '约对应仙界篇年历第2090-2160年前后。', 'Roughly sequel-calendar years 2090-2160.'),
  'reincarnation-palace-thread': story(37, '约12500岁以后长期暗线', 'long thread after about age 12500', '轮回殿据点、任务路线', 'Reincarnation Palace bases and mission routes', '轮回殿身份、反天庭暗线', 'Reincarnation Palace identity and anti-Heavenly-Court hidden thread', '轮回殿任务让韩立接触更深层的仙界秩序对抗。', 'Reincarnation Palace missions bring Han Li into deeper conflict against immortal-world order.', '从仙界篇中期起长期延续，按年历第1300年后粗估。', 'A long middle-to-late sequel thread, roughly after sequel-calendar year 1300.'),
  'heavenly-court-conflict-thread': story(38, '约11850-16190岁以后', 'about age 11850 to after 16190', '天庭势力范围、仙域追索路线', 'Heavenly Court territory and immortal-domain pursuit routes', '天庭秩序认知、道祖级压力线索', 'understanding of Heavenly Court order and Dao-Ancestor-level pressure', '天庭追索与秩序统治成为仙界篇长期主线压力。', 'Heavenly Court pursuit and rule become a long-running central pressure in the sequel.', '从北寒仙域冲突延续到终局，终局按年历第5000年后粗估。', 'Runs from North Cold conflict into the endgame; the endgame is roughly after sequel-calendar year 5000.'),
  'gray-realm-arc': story(39, '约13346-13390岁', 'about age 13346-13390', '灰界城池与荒域', 'Gray Realm cities and wilderness', '灰界材料、异质生态、势力情报', 'Gray Realm materials, alien ecology, and faction intelligence', '韩立进入灰界，环境规则、族群生态和资源逻辑明显改变。', 'Han Li enters the Gray Realm, where environmental rules, peoples, and resources change sharply.', '约对应仙界篇年历第2156-2200年前后。', 'Roughly sequel-calendar years 2156-2200.'),
  'gray-realm-survival-thread': story(40, '约13346-13390岁', 'about age 13346-13390', '灰界荒域、资源点、城池势力', 'Gray Realm wastes, resource points, and city factions', '灰界生存方法、灰晶和地方关系', 'survival methods, gray crystals, and local ties', '灰界求生线把地点转换写成真正的规则差异与生态压力。', 'The Gray Realm survival thread makes the map shift a real change of rules and ecology.', '约对应仙界篇年历第2156-2200年前后。', 'Roughly sequel-calendar years 2156-2200.'),
  'laws-final-conflict': story(41, '约16190岁以后', 'after about age 16190', '仙界高层战场、天庭与轮回相关空间', 'high-level immortal battlefields and Heavenly Court/Reincarnation spaces', '大道冲突认知、终局身份抉择', 'understanding of Dao conflict and endgame identity choices', '法则、道祖、天庭和轮回等最高层冲突进入终局。', 'Laws, Dao Ancestors, Heavenly Court, and Reincarnation enter the endgame.', '按仙界篇年历第5000年后粗估。', 'Estimated after sequel-calendar year 5000.'),
  'dao-ancestor-endgame-thread': story(42, '约16190岁以后至终章', 'after about age 16190 into the finale', '道祖级冲突核心', 'core Dao-Ancestor-level conflict zones', '时间与轮回终局线索、最高层因果答案', 'time and reincarnation endgame clues plus highest-level karmic answers', '围绕道祖位格、天庭秩序和时间大道的终局线收束。', 'The endgame resolves around Dao Ancestor status, Heavenly Court order, and the great Dao of time.', '按仙界篇年历第5000年后至终章粗估。', 'Estimated from after sequel-calendar year 5000 into the finale.')
}))

const verificationStatusText = {
  verifiedRange: { zh: '已核对章节段', en: 'verified chapter segment' },
  stageChecked: { zh: '阶段核对', en: 'arc checked' },
  estimated: { zh: '估算', en: 'estimated' },
  needsChapterCheck: { zh: '待逐章核对', en: 'needs chapter check' }
}

const auditGroupText = {
  mortal: { zh: '人界', en: 'Mortal Realm' },
  starSea: { zh: '乱星海', en: 'Chaotic Star Sea' },
  spirit: { zh: '灵界', en: 'Spirit Realm' },
  devil: { zh: '魔界线', en: 'Devil Realm Thread' },
  immortal: { zh: '仙界篇', en: 'Immortal World Arc' },
  gray: { zh: '灰界', en: 'Gray Realm' }
}

const auditSourceKeysByGroup = {
  mortal: ['qidian-rmji', 'wuxiaworld-rmji'],
  starSea: ['qidian-rmji', 'wuxiaworld-rmji'],
  spirit: ['qidian-rmji', 'wuxiaworld-rmji'],
  devil: ['qidian-rmji', 'wuxiaworld-rmji'],
  immortal: ['qidian-immortal', 'weread-immortal', 'wuxiaworld-immortal'],
  gray: ['qidian-immortal', 'weread-immortal', 'wuxiaworld-immortal']
}

function audit(slug, data) {
  return [slug, {
    slug,
    group: data.group,
    status: data.status ?? 'stageChecked',
    sourceKeys: data.sourceKeys ?? auditSourceKeysByGroup[data.group] ?? ['qidian-rmji'],
    workZh: data.workZh ?? (['immortal', 'gray'].includes(data.group) ? '《凡人修仙之仙界篇》' : '《凡人修仙传》'),
    workEn: data.workEn ?? (['immortal', 'gray'].includes(data.group) ? 'RMJI: Immortal World Arc' : "A Record of a Mortal's Journey to Immortality"),
    chapterZh: data.chapterZh ?? '按阶段核对，具体章节待逐章细化',
    chapterEn: data.chapterEn ?? 'Arc checked; exact chapters pending',
    firstZh: data.firstZh ?? data.eventZh ?? '按章节段核对，首次出场待逐章细化',
    firstEn: data.firstEn ?? data.eventEn ?? 'Checked by arc; first appearance pending chapter-level refinement',
    locationZh: data.locationZh ?? auditGroupText[data.group]?.zh ?? '相关区域',
    locationEn: data.locationEn ?? auditGroupText[data.group]?.en ?? 'related region',
    peopleZh: data.peopleZh ?? '韩立及相关人物',
    peopleEn: data.peopleEn ?? 'Han Li and related figures',
    eventZh: data.eventZh ?? '按阶段核对，事件摘要待细化',
    eventEn: data.eventEn ?? 'Arc checked; event summary pending refinement',
    materialsZh: data.materialsZh ?? '材料/功法关系待细化',
    materialsEn: data.materialsEn ?? 'Material / art links pending refinement',
    ageZh: data.ageZh ?? '按阶段估算',
    ageEn: data.ageEn ?? 'estimated by arc',
    noteZh: data.noteZh ?? '本轮记录章节段、事件事实和实体关系，不收录小说正文。',
    noteEn: data.noteEn ?? 'This pass records chapter segments, event facts, and entity links without reproducing novel prose.'
  }]
}

const verificationCatalog = new Map([
  audit('mortal-family-departure', { group: 'mortal', status: 'verifiedRange', chapterZh: '原著开篇：青牛镇、离家、七玄门选拔段', chapterEn: 'Original opening: Green Ox Town, departure, Qixuanmen selection segment', firstZh: '韩立离家参加七玄门招收弟子', firstEn: 'Han Li leaves home to join Qixuanmen selection', locationZh: '青牛镇韩家、七玄门山地', locationEn: 'Han family near Green Ox Town and Qixuanmen mountains', peopleZh: '韩立、韩家亲人、七玄门接引人物', peopleEn: 'Han Li, Han family, Qixuanmen recruiters', eventZh: '凡俗少年被送入江湖门派，凡人流低起点确立。', eventEn: 'A mortal village boy enters a martial sect, establishing the low-start mortal-flow premise.', materialsZh: '凡俗行囊、入门机会', materialsEn: 'Mortal belongings and entry opportunity', ageZh: '约10岁上下', ageEn: 'about age ten' }),
  audit('qixuan-men-entry', { group: 'mortal', status: 'verifiedRange', chapterZh: '原著开篇至七玄门药园段', chapterEn: 'Opening through Qixuanmen medicine-garden segment', firstZh: '韩立成为七玄门弟子并进入墨大夫视野', firstEn: 'Han Li becomes a Qixuanmen disciple and enters Doctor Mo orbit', locationZh: '七玄门山门、神手谷/药园相关空间', locationEn: 'Qixuanmen grounds and Doctor Mo medicine-garden spaces', peopleZh: '韩立、墨大夫、张铁、厉飞雨', peopleEn: 'Han Li, Doctor Mo, Zhang Tie, Li Feiyu', eventZh: '七玄门阶段让江湖武学、医药和修仙门槛首次接上。', eventEn: 'The Qixuanmen stage connects martial life, medicine, and the first cultivation threshold.', materialsZh: '长春功、药草、基础医术', materialsEn: 'Everlasting Spring Art, herbs, basic medicine', ageZh: '约10-16岁', ageEn: 'about age 10-16' }),
  audit('doctor-mo-crisis', { group: 'mortal', status: 'verifiedRange', chapterZh: '七玄门中后段：墨大夫培养与夺舍危机前后', chapterEn: 'Middle-late Qixuanmen: Doctor Mo training and possession-crisis build-up', firstZh: '墨大夫真实图谋逐步显露', firstEn: 'Doctor Mo hidden purpose gradually appears', locationZh: '七玄门、墨大夫住处、药园', locationEn: 'Qixuanmen, Doctor Mo residence, medicine garden', peopleZh: '韩立、墨大夫、余子童、张铁', peopleEn: 'Han Li, Doctor Mo, Yu Zitong, Zhang Tie', eventZh: '韩立第一次把修仙世界理解为生死算计，而不是奇遇赠礼。', eventEn: 'Han Li first understands cultivation as life-and-death calculation rather than a simple gift.', materialsZh: '长春功、保命手段、神魂/夺舍线索', materialsEn: 'Everlasting Spring Art, survival backups, soul-possession clues', ageZh: '约14-16岁', ageEn: 'about age 14-16' }),
  audit('doctor-mo-conflict', { group: 'mortal', status: 'verifiedRange', chapterZh: '七玄门收束段：夺舍反制与墨府余波', chapterEn: 'Qixuanmen closing segment: possession counterplay and Mo-household aftermath', firstZh: '韩立反制夺舍并摆脱墨大夫控制', firstEn: 'Han Li counters possession and breaks free from Doctor Mo control', locationZh: '七玄门、嘉元城/墨府余波', locationEn: 'Qixuanmen and Jia Yuan City / Mo household aftermath', peopleZh: '韩立、墨大夫、墨家相关人物', peopleEn: 'Han Li, Doctor Mo, Mo household figures', eventZh: '早期江湖线转入正式寻找修仙入口。', eventEn: 'The martial-world opening turns toward formal cultivation entry.', materialsZh: '夺舍秘术、医毒与底牌', materialsEn: 'Possession art, medicine-poison methods, hidden backups', ageZh: '约16岁', ageEn: 'about age 16' }),
  audit('yellow-maple-entry', { group: 'mortal', status: 'verifiedRange', chapterZh: '太南小会至黄枫谷入门段', chapterEn: 'Tainan gathering through Yellow Maple Valley entry segment', firstZh: '太南小会后进入越国七派体系', firstEn: 'After the Tainan gathering, Han Li enters the Yue Seven Sects system', locationZh: '太南小会、黄枫谷', locationEn: 'Tainan gathering and Yellow Maple Valley', peopleZh: '韩立、黄枫谷修士、越国低阶修士', peopleEn: 'Han Li, Yellow Maple Valley cultivators, Yue low-level cultivators', eventZh: '散修边缘身份转为宗门弟子身份。', eventEn: 'A fringe cultivator identity becomes formal sect-disciple status.', materialsZh: '令牌、基础丹药、低阶法器', materialsEn: 'Token, basic pills, low-level magic tools', ageZh: '约18岁', ageEn: 'about age 18' }),
  audit('blood-forbidden-land-arc', { group: 'mortal', status: 'verifiedRange', chapterZh: '越国七派血色禁地试炼段', chapterEn: 'Yue Seven Sects Blood Forbidden Land trial segment', firstZh: '七派低阶弟子进入禁地争夺筑基灵药', firstEn: 'Low-level disciples of the Seven Sects enter the forbidden land for foundation herbs', locationZh: '血色禁地、越国七派驻地', locationEn: 'Blood Forbidden Land and Yue Seven Sects camps', peopleZh: '韩立、南宫婉、越国七派弟子', peopleEn: 'Han Li, Nangong Wan, Yue Seven Sects disciples', eventZh: '筑基资源争夺集中展示低阶修士残酷筛选。', eventEn: 'The foundation-resource contest concentrates the brutal filtering of low-level cultivators.', materialsZh: '筑基丹灵草、禁地灵药、低阶法器', materialsEn: 'Foundation-pill herbs, forbidden-land herbs, low-level tools', ageZh: '约21岁', ageEn: 'about age 21' }),
  audit('foundation-establishment-pill', { group: 'mortal', status: 'verifiedRange', chapterZh: '黄枫谷入门至血色禁地、筑基闭关段', chapterEn: 'Yellow Maple entry through Blood Forbidden Land and foundation seclusion segment', firstZh: '围绕筑基名额和灵药收集反复出现', firstEn: 'Repeatedly appears around foundation opportunities and herb collection', locationZh: '黄枫谷、血色禁地、洞府', locationEn: 'Yellow Maple Valley, Blood Forbidden Land, cave dwelling', peopleZh: '韩立、黄枫谷修士、越国七派弟子', peopleEn: 'Han Li, Yellow Maple cultivators, Yue sect disciples', eventZh: '筑基丹是人界早期资源稀缺逻辑的代表。', eventEn: 'The pill represents the early Mortal Realm scarcity logic.', materialsZh: '筑基丹、成熟灵草、小绿瓶资源循环', materialsEn: 'Foundation Establishment Pill, mature herbs, green-bottle resource loop', ageZh: '约21-26岁', ageEn: 'about age 21-26' }),
  audit('yue-demonic-war', { group: 'mortal', status: 'verifiedRange', chapterZh: '越国正魔冲突与七派撤离压力段', chapterEn: 'Yue righteous-demonic conflict and Seven Sects retreat-pressure segment', firstZh: '魔道势力压迫越国修仙格局', firstEn: 'Demonic factions pressure Yue cultivation politics', locationZh: '越国、天南边缘、黄枫谷相关战场', locationEn: 'Yue State, Heavenly South edges, Yellow Maple-related battlefields', peopleZh: '韩立、黄枫谷修士、魔道六宗相关人物', peopleEn: 'Han Li, Yellow Maple cultivators, Six Devil Dao factions', eventZh: '区域战争迫使韩立离开早期宗门秩序。', eventEn: 'Regional war forces Han Li away from early sect order.', materialsZh: '战场法器、逃亡资源、身份伪装', materialsEn: 'Battlefield tools, escape resources, identity concealment', ageZh: '约29-31岁', ageEn: 'about age 29-31' }),
  audit('chaotic-star-sea-journey', { group: 'starSea', status: 'verifiedRange', chapterZh: '乱星海开局至海域立足段', chapterEn: 'Chaotic Star Sea opening through maritime foothold segment', firstZh: '韩立遁入乱星海并重建散修身份', firstEn: 'Han Li flees to the Chaotic Star Sea and rebuilds a rogue-cultivator identity', locationZh: '乱星海、魁星岛、内外星海', locationEn: 'Chaotic Star Sea, Kuixing Island, Inner and Outer Star Sea', peopleZh: '韩立、乱星海散修、岛屿修士', peopleEn: 'Han Li, Chaotic Star Sea rogue cultivators, island cultivators', eventZh: '地图从大陆宗门转入海域资源和岛屿秩序。', eventEn: 'The map shifts from continental sects to maritime resources and island order.', materialsZh: '妖丹、海域材料、身份资源', materialsEn: 'Demon cores, sea materials, identity resources', ageZh: '约31-155岁', ageEn: 'about age 31-155' }),
  audit('chaotic-star-sea-hunt', { group: 'starSea', status: 'verifiedRange', chapterZh: '外星海猎妖经营段', chapterEn: 'Outer Star Sea beast-hunting economy segment', firstZh: '通过猎妖、炼丹和交易积累中期资源', firstEn: 'Accumulates middle-stage resources through beast hunting, alchemy, and trade', locationZh: '外星海、猎妖海域、交易场所', locationEn: 'Outer Star Sea, hunting waters, trade spaces', peopleZh: '韩立、外星海修士、妖兽', peopleEn: 'Han Li, Outer Star Sea cultivators, demon beasts', eventZh: '猎妖被写成资源循环，不只是斗法情节。', eventEn: 'Beast hunting becomes a resource cycle rather than only combat plot.', materialsZh: '妖丹、霓裳草、妖兽材料、丹药', materialsEn: 'Demon cores, Rainbow Skirt Grass, beast materials, pills', ageZh: '约31-96岁', ageEn: 'about age 31-96' }),
  audit('xutian-hall-treasure-hunt', { group: 'starSea', status: 'verifiedRange', chapterZh: '虚天殿开启与夺宝段', chapterEn: 'Void Heaven Hall opening and treasure-contest segment', firstZh: '多方高阶修士围绕虚天殿与虚天鼎争夺', firstEn: 'High-level parties contend around Void Heaven Hall and the Void Heaven Cauldron', locationZh: '虚天殿、乱星海核心势力圈', locationEn: 'Void Heaven Hall and Chaotic Star Sea power center', peopleZh: '韩立、极阴祖师、星宫/逆星盟相关修士', peopleEn: 'Han Li, Zenith Yin Ancestor, Star Palace / Anti-Star Alliance cultivators', eventZh: '韩立首次深卷入乱星海高阶势力博弈。', eventEn: 'Han Li is drawn deeply into high-level Chaotic Star Sea faction games.', materialsZh: '虚天鼎、秘境宝物、古宝线索', materialsEn: 'Void Heaven Cauldron, secret-realm treasures, ancient treasure clues', ageZh: '约120-130岁', ageEn: 'about age 120-130' }),
  audit('return-to-heavenly-south', { group: 'mortal', status: 'verifiedRange', chapterZh: '乱星海归来与天南重逢段', chapterEn: 'Return from Chaotic Star Sea and Heavenly South reunion segment', firstZh: '韩立以更高修为回到天南', firstEn: 'Han Li returns to Heavenly South at a higher cultivation level', locationZh: '天南、旧宗门、区域战场', locationEn: 'Heavenly South, old sect ties, regional battlefields', peopleZh: '韩立、南宫婉、天南旧识', peopleEn: 'Han Li, Nangong Wan, old Heavenly South contacts', eventZh: '旧地关系由低阶求生变成高阶周旋。', eventEn: 'Old-place relationships shift from low-level survival to high-level maneuvering.', materialsZh: '结丹后资源、旧关系、战场资源', materialsEn: 'Post-Core Formation resources, old ties, battlefield resources', ageZh: '约155岁', ageEn: 'about age 155' }),
  audit('nascent-soul-breakthrough-thread', { group: 'mortal', status: 'verifiedRange', chapterZh: '天南闭关与结婴突破段', chapterEn: 'Heavenly South seclusion and Nascent Soul breakthrough segment', firstZh: '韩立冲击元婴并完成身份跃迁', firstEn: 'Han Li attempts Nascent Soul and completes a status leap', locationZh: '天南闭关洞府、修仙圈层', locationEn: 'Heavenly South seclusion sites and cultivator circles', peopleZh: '韩立、南宫婉、天南高阶修士', peopleEn: 'Han Li, Nangong Wan, high-level Heavenly South cultivators', eventZh: '元婴突破将韩立推入人界高阶修士层。', eventEn: 'The Nascent Soul breakthrough pushes Han Li into the high-level Mortal Realm layer.', materialsZh: '化婴丹线索、心魔应对、闭关资源', materialsEn: 'Nascent-Soul pill threads, inner-demon handling, seclusion resources', ageZh: '约217岁', ageEn: 'about age 217' }),
  audit('demonfall-valley-arc', { group: 'mortal', status: 'verifiedRange', chapterZh: '坠魔谷探索与古魔线段', chapterEn: 'Demonfall Valley expedition and ancient-devil thread segment', firstZh: '多方高阶修士进入坠魔谷争夺机缘', firstEn: 'Multiple high-level cultivators enter Demonfall Valley for opportunities', locationZh: '坠魔谷、古修遗迹空间', locationEn: 'Demonfall Valley and ancient-cultivator ruin spaces', peopleZh: '韩立、大衍神君相关线索、古魔相关人物', peopleEn: 'Han Li, Great Development Divine Lord thread, ancient-devil figures', eventZh: '险地、禁制、古魔和高阶算计集中爆发。', eventEn: 'Danger zones, restrictions, ancient devils, and high-level schemes converge.', materialsZh: '古宝、禁制、傀儡/神识线索', materialsEn: 'Ancient treasures, restrictions, puppet/divine-sense threads', ageZh: '约260-300岁', ageEn: 'about age 260-300' }),
  audit('great-jin-journey', { group: 'mortal', status: 'verifiedRange', chapterZh: '大晋游历与后期人界扩图段', chapterEn: 'Great Jin journey and late Mortal Realm map-expansion segment', firstZh: '韩立进入大晋修仙界', firstEn: 'Han Li enters the Great Jin cultivation world', locationZh: '大晋宗门、家族、坊市、遗迹', locationEn: 'Great Jin sects, clans, markets, ruins', peopleZh: '韩立、大晋宗门家族修士、老怪人物', peopleEn: 'Han Li, Great Jin sect/clan cultivators, old-monster figures', eventZh: '人界后期资源密度和势力复杂度全面提高。', eventEn: 'Late Mortal Realm resource density and faction complexity increase sharply.', materialsZh: '古修遗迹、拍卖资源、高阶材料', materialsEn: 'Ancient-cultivator ruins, auction resources, high-level materials', ageZh: '约300-600岁', ageEn: 'about age 300-600' }),
  audit('kunwu-mountain-arc', { group: 'mortal', status: 'verifiedRange', chapterZh: '昆吾山遗迹开启与多方争夺段', chapterEn: 'Kunwu Mountain ruins opening and multi-party contest segment', firstZh: '大晋多方势力围绕昆吾山遗迹展开争夺', firstEn: 'Great Jin factions contend around the Kunwu Mountain ruins', locationZh: '昆吾山、封印遗迹、外围战场', locationEn: 'Kunwu Mountain, sealed ruins, outer battlefields', peopleZh: '韩立、乾老魔、叶家/大晋势力、古魔线人物', peopleEn: 'Han Li, Qian Laomo, Ye clan / Great Jin forces, ancient-devil figures', eventZh: '昆吾山是人界后期遗迹争夺的高点。', eventEn: 'Kunwu Mountain is a late Mortal Realm high point for ruin contests.', materialsZh: '古宝、封印、通天灵宝线索', materialsEn: 'Ancient treasures, seals, heaven-reaching treasure clues', ageZh: '约400-500岁', ageEn: 'about age 400-500' }),
  audit('spatial-node-ascension-thread', { group: 'mortal', status: 'verifiedRange', chapterZh: '化神后空间节点与偷渡灵界段', chapterEn: 'After Spirit Transformation: spatial-node and Spirit Realm passage segment', firstZh: '韩立寻找可进入灵界的空间节点', firstEn: 'Han Li seeks a spatial node into the Spirit Realm', locationZh: '人界空间节点、跨界通道', locationEn: 'Mortal Realm spatial nodes and cross-realm passages', peopleZh: '韩立、向之礼、化神修士圈', peopleEn: 'Han Li, Xiang Zhili, Spirit Transformation cultivator circle', eventZh: '人界故事进入飞升风险和界面之力阶段。', eventEn: 'The Mortal Realm story enters ascension risk and interface-force logic.', materialsZh: '空间节点、跨界护身资源、界面规则', materialsEn: 'Spatial nodes, cross-realm protection resources, interface rules', ageZh: '约885-1007岁', ageEn: 'about age 885-1007' }),
  audit('spirit-realm-ascension', { group: 'spirit', status: 'verifiedRange', chapterZh: '灵界开局：飞升落点与身份重建段', chapterEn: 'Spirit Realm opening: ascension landing and identity rebuilding segment', firstZh: '韩立进入灵界并适应更高界面规则', firstEn: 'Han Li enters the Spirit Realm and adapts to higher-realm rules', locationZh: '灵界、人族活动区域', locationEn: 'Spirit Realm and human-race activity regions', peopleZh: '韩立、灵界人族相关人物', peopleEn: 'Han Li and Spirit Realm human figures', eventZh: '修炼环境、资源等级和敌我格局全面升级。', eventEn: 'Cultivation environment, resource level, and conflict structure all upgrade.', materialsZh: '灵界资源、身份凭证、更高境界规则', materialsEn: 'Spirit Realm resources, identity tokens, higher-realm rules', ageZh: '约1007岁', ageEn: 'about age 1007' }),
  audit('heavenly-abyss-city-arc', { group: 'spirit', status: 'verifiedRange', chapterZh: '灵界早期：天渊城与人妖两族防线段', chapterEn: 'Early Spirit Realm: Heavenly Abyss City and human-demon defenses segment', firstZh: '韩立进入天渊城体系', firstEn: 'Han Li enters the Heavenly Abyss City system', locationZh: '天渊城、人妖两族防线', locationEn: 'Heavenly Abyss City and human-demon defensive lines', peopleZh: '韩立、天渊城修士、人妖两族人物', peopleEn: 'Han Li, Heavenly Abyss City cultivators, human and demon figures', eventZh: '个人修炼被放进族群防线和多族压力背景。', eventEn: 'Personal cultivation enters the context of racial defenses and multi-race pressure.', materialsZh: '灵界身份、防线任务、高阶材料', materialsEn: 'Spirit Realm identity, defense missions, high-level materials', ageZh: '约1007-1160岁', ageEn: 'about age 1007-1160' }),
  audit('spirit-world-race-conflict-thread', { group: 'spirit', status: 'verifiedRange', chapterZh: '灵界多族、飞灵族与边境压力段', chapterEn: 'Spirit Realm multi-race, Flying Spirit, and frontier-pressure segment', firstZh: '韩立接触多族地域和真灵血脉线', firstEn: 'Han Li encounters multi-race territories and true-spirit bloodline threads', locationZh: '飞灵族地域、灵界边境、蛮荒区域', locationEn: 'Flying Spirit regions, Spirit Realm frontiers, wilderness areas', peopleZh: '韩立、飞灵族人物、异族修士', peopleEn: 'Han Li, Flying Spirit figures, alien cultivators', eventZh: '灵界篇扩展为多族生态和边境冲突。', eventEn: 'The Spirit Realm arc expands into multi-race ecology and frontier conflict.', materialsZh: '真灵之血、异族材料、灵界任务资源', materialsEn: 'True-spirit blood, alien materials, Spirit Realm mission resources', ageZh: '约1160-2468岁', ageEn: 'about age 1160-2468' }),
  audit('broad-cold-realm-arc', { group: 'spirit', status: 'verifiedRange', chapterZh: '广寒界开启与多族机缘段', chapterEn: 'Broad Cold Realm opening and multi-race opportunity segment', firstZh: '多族进入广寒界争夺机缘', firstEn: 'Multiple races enter Broad Cold Realm for opportunities', locationZh: '广寒界、灵界特殊空间', locationEn: 'Broad Cold Realm and Spirit Realm special spaces', peopleZh: '韩立、多族修士、飞灵族相关人物', peopleEn: 'Han Li, multi-race cultivators, Flying Spirit-related figures', eventZh: '秘境争夺把灵界资源竞争进一步升级。', eventEn: 'Secret-space contests further escalate Spirit Realm resource competition.', materialsZh: '高阶灵药、真灵血脉资源、秘境材料', materialsEn: 'High-grade herbs, true-spirit resources, secret-realm materials', ageZh: '约1500-1700岁', ageEn: 'about age 1500-1700' }),
  audit('devil-calamity', { group: 'devil', status: 'verifiedRange', chapterZh: '灵界后期：魔劫爆发与跨界战争段', chapterEn: 'Late Spirit Realm: Devil Calamity and cross-realm war segment', firstZh: '魔族压力升级为大规模界面战争', firstEn: 'Devil-race pressure escalates into large-scale realm war', locationZh: '灵界防线、魔界压力区域、跨界战场', locationEn: 'Spirit Realm defenses, devil-pressure zones, cross-realm battlefields', peopleZh: '韩立、宝花、元刹、魔族圣祖相关人物', peopleEn: 'Han Li, Baohua, Yuan Cha, devil-ancestor figures', eventZh: '魔界线从外部威胁变成亲历战争和资源接触。', eventEn: 'The devil thread shifts from external threat into lived war and resource contact.', materialsZh: '魔晶、真魔气、魔族材料、战场资源', materialsEn: 'Devil crystals, true devil Qi, devil materials, battlefield resources', ageZh: '约2468岁以后至飞升仙界前', ageEn: 'after about age 2468 before Immortal Realm ascension' }),
  audit('immortal-realm-opening', { group: 'immortal', status: 'verifiedRange', chapterZh: '仙界篇开局：灵寰界至仙界落脚段', chapterEn: 'Immortal World Arc opening: Linghuan thread to immortal foothold segment', firstZh: '韩立在仙界篇重建身份和记忆线', firstEn: 'Han Li rebuilds identity and memory threads in the sequel', locationZh: '灵寰界线、仙界下层活动区域、北寒仙域前缘', locationEn: 'Linghuan thread, lower immortal-world regions, edge of North Cold domain', peopleZh: '韩立、柳乐儿、蟹道人、仙界早期人物', peopleEn: 'Han Li, Liu Leer, Crab Daoist, early sequel figures', eventZh: '仙界篇从低处重启，秩序与追索压力重新压上来。', eventEn: 'The sequel restarts from a low foothold under order and pursuit pressure.', materialsZh: '仙灵力、记忆线索、仙界身份资源', materialsEn: 'Immortal spiritual power, memory clues, immortal-world identity resources', ageZh: '约11190-11200岁', ageEn: 'about age 11190-11200' }),
  audit('black-wind-sea-opening', { group: 'immortal', status: 'verifiedRange', chapterZh: '仙界篇早期：黑风海与黑风岛落脚段', chapterEn: 'Early sequel: Black Wind Sea and Black Wind Island foothold segment', firstZh: '韩立在黑风海域恢复并重建行动空间', firstEn: 'Han Li recovers and rebuilds room to act in the Black Wind Sea', locationZh: '黑风海域、黑风岛及周边岛屿', locationEn: 'Black Wind Sea, Black Wind Island, nearby islands', peopleZh: '韩立、陆雨晴、柳乐儿、地方修士', peopleEn: 'Han Li, Lu Yuqing, Liu Leer, local cultivators', eventZh: '仙界篇早期以海域边地和身份重建为主。', eventEn: 'The early sequel focuses on maritime frontier life and identity rebuilding.', materialsZh: '仙元石、恢复资源、地方令牌', materialsEn: 'Immortal origin stones, recovery resources, local tokens', ageZh: '约11200-11210岁', ageEn: 'about age 11200-11210' }),
  audit('candle-dragon-dao-arc', { group: 'immortal', status: 'verifiedRange', chapterZh: '仙界篇早期：烛龙道入门、任务与北寒仙域段', chapterEn: 'Early sequel: Candle Dragon Dao entry, missions, and North Cold domain segment', firstZh: '韩立进入烛龙道组织生态', firstEn: 'Han Li enters Candle Dragon Dao organizational ecology', locationZh: '烛龙道、北寒仙域、宗门任务区域', locationEn: 'Candle Dragon Dao, North Cold domain, sect mission regions', peopleZh: '韩立、呼言道人、热火仙尊、烛龙道人物', peopleEn: 'Han Li, Hu Yan Daoist, Hot Flame Immortal, Candle Dragon Dao figures', eventZh: '仙界宗门、任务体系和法则功法线索展开。', eventEn: 'Immortal sect life, mission systems, and law-art clues unfold.', materialsZh: '真言化轮经线索、仙窍资源、仙界任务资源', materialsEn: 'Mantra Wheel Scripture clues, immortal-aperture resources, mission resources', ageZh: '约11210-11850岁', ageEn: 'about age 11210-11850' }),
  audit('north-cold-immortal-domain-pursuit', { group: 'immortal', status: 'verifiedRange', chapterZh: '北寒仙域冲突与仙宫追逃段', chapterEn: 'North Cold domain conflict and immortal-palace pursuit segment', firstZh: '韩立受到仙宫秩序压力并调整身份路线', firstEn: 'Han Li faces immortal-palace order pressure and adjusts identity and routes', locationZh: '北寒仙域核心区、仙宫势力范围', locationEn: 'Core North Cold domain and immortal-palace territory', peopleZh: '韩立、北寒仙宫人物、烛龙道旧识', peopleEn: 'Han Li, North Cold Immortal Palace figures, Candle Dragon Dao contacts', eventZh: '追逃线把早期仙界地图从宗门扩大到仙域秩序。', eventEn: 'The pursuit thread expands the early immortal map from sect life to domain order.', materialsZh: '身份伪装、传送路线、仙域情报', materialsEn: 'Identity disguise, transfer routes, immortal-domain intelligence', ageZh: '约11850-12520岁', ageEn: 'about age 11850-12520' }),
  audit('true-word-sect-ruins-arc', { group: 'immortal', status: 'verifiedRange', chapterZh: '仙界篇中期：真言门遗迹与时间法则段', chapterEn: 'Middle sequel: True Word Sect ruins and time-law segment', firstZh: '真言门旧史、时间法则和掌天瓶线索汇合', firstEn: 'True Word Sect history, time law, and Heavenly Bottle clues converge', locationZh: '真言门遗迹、时间法则遗存空间', locationEn: 'True Word Sect ruins and time-law remnants', peopleZh: '韩立、甘九真、真言门相关人物', peopleEn: 'Han Li, Gan Jiuzhen, True Word Sect figures', eventZh: '遗迹线把仙界旧史和时间大道推进到主线位置。', eventEn: 'The ruin thread moves immortal-world history and time Dao into the main line.', materialsZh: '真言化轮经、时间晶粒/材料、掌天瓶秘密', materialsEn: 'Mantra Wheel Scripture, time crystals/materials, Heavenly Bottle secrets', ageZh: '约13280-13350岁', ageEn: 'about age 13280-13350' }),
  audit('reincarnation-palace-thread', { group: 'immortal', status: 'stageChecked', chapterZh: '仙界篇中后期：轮回殿任务、身份切换与反天庭暗线', chapterEn: 'Middle-late sequel: Reincarnation Palace missions, identity switches, anti-Heavenly-Court thread', firstZh: '韩立接触轮回殿任务体系和反秩序网络', firstEn: 'Han Li encounters Reincarnation Palace missions and anti-order networks', locationZh: '轮回殿据点、任务路线、仙域隐秘空间', locationEn: 'Reincarnation Palace bases, mission routes, hidden immortal-domain spaces', peopleZh: '韩立、蛟三、狐三、轮回殿成员', peopleEn: 'Han Li, Jiao San, Fox Three, Reincarnation Palace members', eventZh: '轮回殿线与天庭秩序形成长期对照。', eventEn: 'The Reincarnation Palace thread forms a long contrast with Heavenly Court order.', materialsZh: '身份令牌、任务资源、轮回法则线索', materialsEn: 'Identity tokens, mission resources, reincarnation-law clues', ageZh: '约12500岁以后长期推进', ageEn: 'long thread after about age 12500' }),
  audit('gray-realm-arc', { group: 'gray', status: 'verifiedRange', chapterZh: '仙界篇灰界阶段：进入灰界、城池与荒域求生段', chapterEn: 'Sequel Gray Realm stage: entry, cities, and wilderness survival segment', firstZh: '韩立进入灰界并适应异质生态规则', firstEn: 'Han Li enters the Gray Realm and adapts to alien ecological rules', locationZh: '灰界城池、灰界荒域、资源场', locationEn: 'Gray Realm cities, wastes, resource fields', peopleZh: '韩立、石穿空、灰界地方人物', peopleEn: 'Han Li, Shi Chuankong, local Gray Realm figures', eventZh: '环境规则、材料体系和族群生态明显不同于仙界常规区域。', eventEn: 'Environmental rules, material systems, and peoples differ sharply from ordinary immortal-world regions.', materialsZh: '灰晶、灰界材料、异兽资源、生存工具', materialsEn: 'Gray crystals, Gray Realm materials, alien-beast resources, survival tools', ageZh: '约13346-13390岁', ageEn: 'about age 13346-13390' }),
  audit('laws-final-conflict', { group: 'immortal', status: 'stageChecked', chapterZh: '仙界篇后期至终局：天庭、轮回与大道冲突段', chapterEn: 'Late sequel into finale: Heavenly Court, reincarnation, and great-Dao conflict segment', firstZh: '最高层法则、道祖位格和天庭秩序冲突收束', firstEn: 'Top-level laws, Dao Ancestor status, and Heavenly Court order converge', locationZh: '仙界高层战场、天庭与轮回相关空间', locationEn: 'High-level immortal battlefields and Heavenly Court/Reincarnation spaces', peopleZh: '韩立、古或今、轮回殿主、道祖级人物', peopleEn: 'Han Li, Gu Huajin, Reincarnation Palace Master, Dao-Ancestor-level figures', eventZh: '仙界篇主线由资源求生完全转入大道和秩序之争。', eventEn: 'The sequel main line moves from resource survival into conflict over Dao and order.', materialsZh: '时间法则、轮回法则、道祖位格、掌天瓶因果', materialsEn: 'Time law, reincarnation law, Dao Ancestor status, Heavenly Bottle karma', ageZh: '约16190岁以后', ageEn: 'after about age 16190' }),
  audit('dao-ancestor-endgame-thread', { group: 'immortal', status: 'stageChecked', chapterZh: '仙界篇终局段', chapterEn: 'Immortal World Arc finale segment', firstZh: '围绕道祖位格、时间大道与轮回因果收束', firstEn: 'Dao Ancestor status, time Dao, and reincarnation karma resolve', locationZh: '道祖级冲突核心空间', locationEn: 'Core Dao-Ancestor-level conflict spaces', peopleZh: '韩立、古或今、轮回殿主、时间道祖相关人物', peopleEn: 'Han Li, Gu Huajin, Reincarnation Palace Master, time-Dao figures', eventZh: '终局回答天庭秩序、轮回和时间大道的核心冲突。', eventEn: 'The finale answers the core conflict among Heavenly Court order, reincarnation, and time Dao.', materialsZh: '时间道纹、法则冲突、轮回因果', materialsEn: 'Time Dao patterns, law conflict, reincarnation karma', ageZh: '约16190岁以后至终章', ageEn: 'after about age 16190 into the finale' })
])

const auditAliasGroups = [
  {
    slugs: ['qixuan-men', 'qixuan-mountain', 'green-ox-town', 'mundane-world', 'changchun-gong', 'doctor-mo', 'li-feiyu', 'zhang-tie', 'wild-wolf-gang-leaders', 'mo-fengwu'],
    data: { group: 'mortal', status: 'stageChecked', chapterZh: '原著开篇至七玄门/嘉元城余波段', chapterEn: 'Opening through Qixuanmen / Jia Yuan City aftermath segment', locationZh: '青牛镇、七玄门、嘉元城相关空间', locationEn: 'Green Ox Town, Qixuanmen, Jia Yuan City-related spaces', peopleZh: '韩立、墨大夫、厉飞雨、张铁、墨家相关人物', peopleEn: 'Han Li, Doctor Mo, Li Feiyu, Zhang Tie, Mo household figures', eventZh: '补足凡俗开局、江湖门派、医药和夺舍危机的人物地点网。', eventEn: 'Completes the people-place web of the mortal opening, martial sect, medicine, and possession crisis.', materialsZh: '长春功、药园、医毒、早期保命手段', materialsEn: 'Everlasting Spring Art, medicine garden, medicine-poison methods, early survival tools', ageZh: '约10-18岁', ageEn: 'about age 10-18' }
  },
  {
    slugs: ['huangfeng-valley', 'yellow-maple-valley-grounds', 'yue-state', 'yue-seven-sects', 'masking-moon-sect', 'nangong-wan', 'chen-qiaoqian', 'han-yunzhi', 'hongfu', 'li-huayuan', 'foundation-pill-contest', 'blood-forbidden-land', 'foundation-materials', 'spirit-herb-seeds', 'zhangtian-bottle', 'storage-pouch', 'talisman-treasure', 'spirit-stone'],
    data: { group: 'mortal', status: 'stageChecked', chapterZh: '太南小会、黄枫谷、血色禁地与越国七派段', chapterEn: 'Tainan gathering, Yellow Maple Valley, Blood Forbidden Land, and Yue Seven Sects segment', locationZh: '太南小会、黄枫谷、越国七派、血色禁地', locationEn: 'Tainan gathering, Yellow Maple Valley, Yue Seven Sects, Blood Forbidden Land', peopleZh: '韩立、南宫婉、黄枫谷同门、越国七派弟子', peopleEn: 'Han Li, Nangong Wan, Yellow Maple peers, Yue Seven Sects disciples', eventZh: '补足早期宗门制度、筑基资源、情感因果和小绿瓶资源循环。', eventEn: 'Completes early sect systems, foundation resources, emotional karma, and the green-bottle resource loop.', materialsZh: '筑基丹、灵草、小绿瓶、低阶法器、灵石', materialsEn: 'Foundation pills, spirit herbs, green bottle, low-level tools, spirit stones', ageZh: '约18-31岁', ageEn: 'about age 18-31' }
  },
  {
    slugs: ['chaotic-star-sea', 'kuixing-island', 'sky-star-city', 'outer-star-sea', 'inner-star-sea', 'xutian-hall', 'xutian-cauldron', 'star-palace', 'anti-star-alliance', 'tianxing-sages', 'ling-yuling', 'miao-yin-sect', 'miao-yin-sea-area', 'zi-ling', 'yuan-yao', 'jiyin-ancestor', 'xuan-gu', 'qingyuan-sword-art', 'green-bamboo-cloudswarm-swords', 'golden-thunder-bamboo', 'gold-devouring-beetles', 'rainbow-skirt-grass', 'demon-core'],
    data: { group: 'starSea', status: 'stageChecked', chapterZh: '乱星海历练、外星海猎妖、虚天殿与星宫/逆星盟段', chapterEn: 'Chaotic Star Sea journey, Outer Star Sea hunting, Void Heaven Hall, Star Palace / Anti-Star Alliance segment', locationZh: '乱星海、魁星岛、天星城、外星海、虚天殿', locationEn: 'Chaotic Star Sea, Kuixing Island, Sky Star City, Outer Star Sea, Void Heaven Hall', peopleZh: '韩立、紫灵、元瑶、极阴祖师、天星双圣、凌玉灵', peopleEn: 'Han Li, Zi Ling, Yuan Yao, Zenith Yin Ancestor, Heavenly Star Sages, Ling Yuling', eventZh: '补足海域经济、猎妖资源、虚天殿夺宝和乱星海权力冲突。', eventEn: 'Completes maritime economy, beast-hunting resources, Void Heaven Hall treasure contest, and Chaotic Star Sea power conflict.', materialsZh: '妖丹、虚天鼎、青竹蜂云剑、金雷竹、噬金虫、霓裳草', materialsEn: 'Demon cores, Void Heaven Cauldron, Bamboo Cloudswarm Swords, Golden Thunder Bamboo, gold-devouring beetles, Rainbow Skirt Grass', ageZh: '约31-155岁', ageEn: 'about age 31-155' }
  },
  {
    slugs: ['heavenly-south-return-and-war', 'cloudfall-sect', 'heavenly-south-alliance', 'mulan-grassland', 'mulan-tribes', 'tianlan-temple', 'tianlan-sacred-beast', 'demonfall-valley', 'dayan-divine-lord', 'great-development-art', 'puppet', 'puppet-refinement', 'great-jin-region', 'great-jin-factions', 'kunwu-mountain', 'qian-laomo', 'xiang-zhili', 'silvermoon', 'wind-thunder-wings', 'yuanhe-five-pole-mountain'],
    data: { group: 'mortal', status: 'stageChecked', chapterZh: '返回天南、慕兰大战、坠魔谷、大晋与昆吾山段', chapterEn: 'Return to Heavenly South, Mulan war, Demonfall Valley, Great Jin, and Kunwu Mountain segment', locationZh: '天南、慕兰草原、坠魔谷、大晋、昆吾山', locationEn: 'Heavenly South, Mulan Grassland, Demonfall Valley, Great Jin, Kunwu Mountain', peopleZh: '韩立、南宫婉、大衍神君、银月、乾老魔、向之礼', peopleEn: 'Han Li, Nangong Wan, Dayan Divine Lord, Silvermoon, Qian Laomo, Xiang Zhili', eventZh: '补足人界中后期高阶修士圈、区域战争、遗迹探索和飞升前准备。', eventEn: 'Completes the middle-late Mortal Realm high-level cultivator circle, regional war, ruin exploration, and pre-ascension preparation.', materialsZh: '傀儡、大衍诀、风雷翅、古宝、空间节点线索', materialsEn: 'Puppets, Great Development Art, Wind-Thunder Wings, ancient treasures, spatial-node clues', ageZh: '约155-1007岁', ageEn: 'about age 155-1007' }
  },
  {
    slugs: ['spirit-realm', 'heavenly-abyss-city', 'heavenly-abyss-city-region', 'spirit-world-human-demon-alliance', 'human-race', 'demon-race', 'spirit-world-human-cultivators-group', 'mo-jianli', 'ao-xiao-ancestor', 'long-han', 'flying-spirit-region', 'flying-spirit-race', 'flying-spirit-branches', 'xian-xian', 'broad-cold-realm', 'wild-world', 'nether-river-land', 'qing-yuanzi', 'ice-phoenix', 'weeping-soul-beast', 'weeping-soul-character', 'bright-king-art', 'fansheng-true-demon-art', 'true-spirit-blood', 'great-ascension-stage'],
    data: { group: 'spirit', status: 'stageChecked', chapterZh: '灵界开局、天渊城、多族地域、广寒界与大乘推进段', chapterEn: 'Spirit Realm opening, Heavenly Abyss City, multi-race regions, Broad Cold Realm, and Great Ascension progression segment', locationZh: '灵界、人妖两族防线、飞灵族地域、广寒界、蛮荒区域', locationEn: 'Spirit Realm, human-demon defenses, Flying Spirit regions, Broad Cold Realm, wilderness regions', peopleZh: '韩立、银月、冰凤、青元子、莫简离、敖啸老祖、陇韩', peopleEn: 'Han Li, Silvermoon, Ice Phoenix, Qing Yuanzi, Mo Jianli, Ao Xiao Ancestor, Long Han', eventZh: '补足灵界多族生态、真灵血脉、边境压力和大乘飞升前准备。', eventEn: 'Completes Spirit Realm multi-race ecology, true-spirit bloodlines, frontier pressure, and pre-immortal ascension preparation.', materialsZh: '真灵之血、灵界材料、啼魂、梵圣真魔功、明王诀', materialsEn: 'True-spirit blood, Spirit Realm materials, Weeping Soul, Brahma Saint True Demon Art, Bright King Art', ageZh: '约1007-11190岁', ageEn: 'about age 1007-11190' }
  },
  {
    slugs: ['devil-war-prelude', 'devil-realm-expedition', 'demon-realm', 'devil-battlefields', 'devil-race', 'devil-army', 'baohua', 'yuan-cha', 'six-extremes', 'devil-crystal', 'devil-essence-diamond', 'ancient-devils', 'ancient-devil-realm'],
    data: { group: 'devil', status: 'stageChecked', chapterZh: '灵界后期魔劫、魔界远行与圣祖人物段', chapterEn: 'Late Spirit Realm Devil Calamity, Devil Realm journey, and Sacred Ancestor figures segment', locationZh: '灵界边境、魔界、魔族战场', locationEn: 'Spirit Realm frontiers, Devil Realm, devil battlefields', peopleZh: '韩立、宝花、元刹、六极圣祖、魔族人物', peopleEn: 'Han Li, Baohua, Yuan Cha, Six Extremes Sacred Ancestor, devil figures', eventZh: '补足魔族威胁从封印古魔到界面战争的升级链。', eventEn: 'Completes the escalation from sealed ancient-devil threats to realm-scale war.', materialsZh: '魔晶、真魔气、魔族材料、魔界资源', materialsEn: 'Devil crystals, true devil Qi, devil materials, Devil Realm resources', ageZh: '约2468-11190岁之间', ageEn: 'roughly age 2468-11190' }
  },
  {
    slugs: ['immortal-realm', 'black-wind-sea', 'black-wind-island-region', 'black-wind-island', 'lu-yuqing', 'liu-le-er', 'crab-daoist', 'golden-child', 'hot-flame-immortal', 'candle-dragon-dao', 'candle-dragon-dao-region', 'north-cold-immortal-domain', 'north-cold-immortal-domain-core', 'north-cold-immortal-palace', 'impermanence-alliance', 'jiao-san', 'fox-three', 'immortal-aperture-cultivation-thread', 'immortal-aperture', 'true-immortal-stage', 'golden-immortal-stage', 'taiyi-stage', 'great-luo-stage', 'immortal-origin-stone', 'immortal-pills', 'dao-pill', 'law-materials', 'time-crystal-materials', 'refining-spirit-art'],
    data: { group: 'immortal', status: 'stageChecked', chapterZh: '仙界篇早中期：黑风海、北寒仙域、烛龙道、无常盟与仙窍修炼段', chapterEn: 'Early-middle sequel: Black Wind Sea, North Cold domain, Candle Dragon Dao, Impermanence Alliance, and immortal-aperture cultivation segment', locationZh: '黑风海、北寒仙域、烛龙道、无常盟任务路线', locationEn: 'Black Wind Sea, North Cold domain, Candle Dragon Dao, Impermanence Alliance mission routes', peopleZh: '韩立、柳乐儿、陆雨晴、蟹道人、金童、呼言道人、热火仙尊、蛟三、狐三', peopleEn: 'Han Li, Liu Leer, Lu Yuqing, Crab Daoist, Golden Child, Hu Yan Daoist, Hot Flame Immortal, Jiao San, Fox Three', eventZh: '补足仙界篇低处重启、仙域秩序、组织任务和仙窍修炼机制。', eventEn: 'Completes the sequel low-foothold restart, immortal-domain order, organization missions, and immortal-aperture cultivation system.', materialsZh: '仙元石、道丹、仙窍资源、炼神术、仙界任务资源', materialsEn: 'Immortal origin stones, Dao pills, immortal-aperture resources, Spirit Refining Art, mission resources', ageZh: '约11190-13280岁', ageEn: 'about age 11190-13280' }
  },
  {
    slugs: ['mantra-sect-ruins', 'true-word-ruins-core', 'true-word-sect', 'mi-luo-ancestor', 'mu-yan', 'wu-yang', 'jin-yuanzi', 'he-ze', 'qi-mozi', 'gan-jiuzhen', 'mantra-wheel-scripture', 'great-five-elements-illusory-world', 'phantom-star-manual', 'water-derivation-four-seasons', 'east-wood-wither-bloom', 'severing-time-flowing-fire', 'time-law', 'reincarnation-law', 'reincarnation-palace', 'reincarnation-palace-members', 'reincarnation-palace-master', 'reincarnation-palace-routes', 'reincarnation-palace-strongholds', 'heavenly-court-conflict-thread', 'heavenly-court', 'heavenly-court-territory', 'heavenly-court-envoys', 'gu-huajin', 'nine-origin-temple', 'dao-ancestor-system', 'dao-ancestor-position', 'time-dao-ancestor', 'time-dao-cultivator-group'],
    data: { group: 'immortal', status: 'stageChecked', chapterZh: '仙界篇中后期：真言门、轮回殿、天庭、九元观与道祖体系段', chapterEn: 'Middle-late sequel: True Word Sect, Reincarnation Palace, Heavenly Court, Nine Origin Temple, and Dao Ancestor system segment', locationZh: '真言门遗迹、轮回殿据点、天庭势力范围、九元观相关空间', locationEn: 'True Word Sect ruins, Reincarnation Palace bases, Heavenly Court territory, Nine Origin Temple spaces', peopleZh: '韩立、甘九真、古或今、轮回殿主、天庭/九元观人物', peopleEn: 'Han Li, Gan Jiuzhen, Gu Huajin, Reincarnation Palace Master, Heavenly Court / Nine Origin Temple figures', eventZh: '补足时间法则、轮回法则、天庭秩序和道祖位格的主线结构。', eventEn: 'Completes the main structure of time law, reincarnation law, Heavenly Court order, and Dao Ancestor status.', materialsZh: '真言化轮经、时间材料、轮回法则、道祖体系、掌天瓶因果', materialsEn: 'Mantra Wheel Scripture, time materials, reincarnation law, Dao Ancestor system, Heavenly Bottle karma', ageZh: '约12500岁以后至终局', ageEn: 'after about age 12500 into the finale' }
  },
  {
    slugs: ['gray-realm-survival-thread', 'gray-realm', 'gray-wilderness', 'gray-realm-cities', 'gray-realm-resource-fields', 'gray-realm-materials', 'gray-crystals', 'gray-realm-law', 'gray-realm-miasma', 'gray-immortals', 'gray-realm-natives', 'gray-realm-figures', 'gray-realm-powerhouses', 'gray-realm-noble-figures', 'gray-beasts', 'gray-spirit-creatures', 'accumulated-scale-realm', 'shi-chuankong'],
    data: { group: 'gray', status: 'stageChecked', chapterZh: '仙界篇灰界与特殊空间阶段', chapterEn: 'Sequel Gray Realm and special-space stage', locationZh: '灰界城池、荒域、资源场、积鳞空境相关空间', locationEn: 'Gray Realm cities, wastes, resource fields, Accumulated Scale Realm-related spaces', peopleZh: '韩立、石穿空、灰界地方势力与强者', peopleEn: 'Han Li, Shi Chuankong, local Gray Realm powers and elites', eventZh: '补足灰界社会、荒域风险、异质资源和生存规则差异。', eventEn: 'Completes Gray Realm society, wilderness danger, alien resources, and survival-rule differences.', materialsZh: '灰晶、灰界材料、异兽资源、灰界法则/瘴气', materialsEn: 'Gray crystals, Gray Realm materials, alien-beast resources, Gray Realm law/miasma', ageZh: '约13346-13390岁', ageEn: 'about age 13346-13390' }
  }
]

for (const group of auditAliasGroups) {
  for (const slug of group.slugs) {
    if (!verificationCatalog.has(slug)) verificationCatalog.set(slug, audit(slug, group.data)[1])
  }
}

for (const [slug, data] of [
  audit('mi-luo-ancestor', {
    group: 'immortal',
    status: 'verifiedRange',
    chapterZh: '仙界篇真言门历史段：约247章讲道、550章辛秘、1152章拜师等事件段',
    chapterEn: 'Immortal World Arc True Word history: around chapters 247, 550, and 1152 event segments',
    firstZh: '韩立通过时空与遗迹线接触弥罗老祖讲道和真言门传承',
    firstEn: 'Han Li encounters Mi Luo teaching and True Word inheritance through time and ruin threads',
    locationZh: '真言门遗迹、时空回溯相关空间',
    locationEn: 'True Word Sect ruins and time-reversal spaces',
    peopleZh: '韩立、弥罗老祖、奇摩子、禾泽、古或今',
    peopleEn: 'Han Li, Mi Luo Ancestor, Qi Mozi, He Ze, Gu Huojin',
    eventZh: '弥罗老祖作为真言门末代宗主和韩立隔世师尊，承接大五行幻世诀与真言门覆灭主线。',
    eventEn: 'Mi Luo, last master of True Word Sect and Han Li cross-time master, anchors the Great Five Elements inheritance and sect-fall thread.',
    materialsZh: '大五行幻世诀、真言门五行时间法则、时间法则传承',
    materialsEn: 'Great Five Elements Illusory World Art, five-element time-law inheritances, time-law lineage',
    ageZh: '韩立约11190岁以后；按仙界篇年历事件段估算',
    ageEn: 'after Han Li about age 11190; estimated by sequel calendar segments'
  }),
  audit('qi-mozi', {
    group: 'immortal',
    status: 'verifiedRange',
    chapterZh: '仙界篇真言门辛秘、仙狱与后续追索段',
    chapterEn: 'Immortal World Arc True Word secret-history, immortal-prison, and later pursuit segments',
    firstZh: '真言门旧史中揭示其二弟子和背叛者身份，后续作为大罗中期追索者压迫韩立',
    firstEn: 'Revealed in True Word old history as the second disciple and betrayer, later pressuring Han Li as a middle-Great-Luo pursuer',
    locationZh: '真言门遗迹、天庭/仙狱、仙域管辖空间',
    locationEn: 'True Word ruins, Heavenly Court / immortal prison, and immortal-domain jurisdiction spaces',
    peopleZh: '韩立、奇摩子、弥罗老祖、禾泽、古或今',
    peopleEn: 'Han Li, Qi Mozi, Mi Luo Ancestor, He Ze, Gu Huojin',
    eventZh: '奇摩子背叛真言门并投靠天庭，是真言门覆灭和韩立后续被追索的重要因果点。',
    eventEn: 'Qi Mozi betrays True Word Sect and joins Heavenly Court, becoming a key cause in the sect fall and Han Li later pursuit.',
    materialsZh: '断时流火集、火属性时间法则、仙狱权柄',
    materialsEn: 'Severing-Time Flowing-Fire scripture, fire-aspected time law, immortal-prison authority',
    ageZh: '韩立仙界篇中期以后；奇摩子修为标注为大罗中期',
    ageEn: 'middle sequel onward for Han Li; Qi Mozi marked as middle Great Luo'
  }),
  audit('he-ze', {
    group: 'immortal',
    status: 'verifiedRange',
    chapterZh: '仙界篇约665章、678章前后：水衍宫与真言门遗留段',
    chapterEn: 'Around chapters 665 and 678: Water Derivation Palace and True Word remnant segment',
    firstZh: '韩立在水衍宫相关空间触发禾泽遗留传承',
    firstEn: 'Han Li triggers He Ze remaining inheritance in the Water Derivation Palace-related space',
    locationZh: '真言门水衍宫、光阴之水相关空间',
    locationEn: 'True Word Water Derivation Palace and time-water space',
    peopleZh: '韩立、禾泽、奇摩子、弥罗老祖',
    peopleEn: 'Han Li, He Ze, Qi Mozi, Mi Luo Ancestor',
    eventZh: '禾泽传下水衍四时诀并交代奇摩子旧怨，是韩立补全真言门传承的关键节点。',
    eventEn: 'He Ze passes the Water Derivation Four Seasons Art and the old debt with Qi Mozi, key to Han Li completing the lineage.',
    materialsZh: '水衍四时诀、光阴之水、水属性时间法则',
    materialsEn: 'Water Derivation Four Seasons Art, time water, water-aspected time law',
    ageZh: '韩立约11190岁以后按仙界篇年历估算',
    ageEn: 'after Han Li about age 11190 by sequel-calendar estimate'
  }),
  audit('jiao-san', {
    group: 'immortal',
    status: 'stageChecked',
    chapterZh: '仙界篇轮回殿任务线与中后期身世揭示段',
    chapterEn: 'Immortal World Arc Reincarnation Palace mission thread and later identity-reveal segment',
    firstZh: '以轮回殿任务人物身份与韩立交集，后续身世牵连轮回殿主与南宫婉前世',
    firstEn: 'Intersects Han Li as a Reincarnation Palace mission figure; later identity ties to the Palace Master and Nangong Wan past life',
    locationZh: '轮回殿据点、仙界任务路线',
    locationEn: 'Reincarnation Palace bases and immortal-world mission routes',
    peopleZh: '韩立、蛟三、轮回殿主、南宫婉、狐三',
    peopleEn: 'Han Li, Jiao San, Reincarnation Palace Master, Nangong Wan, Fox Three',
    eventZh: '蛟三不是普通成员，而是轮回殿主和南宫婉前世因果中的关键亲缘节点。',
    eventEn: 'Jiao San is not a generic member, but a key kinship node in the Palace Master and Nangong Wan past-life karma.',
    materialsZh: '轮回殿任务体系、身份伪装、轮回法则因果',
    materialsEn: 'Reincarnation Palace mission system, disguised identities, reincarnation-law karma',
    ageZh: '按仙界篇中后期事件段估算；本人具体年龄待逐章核对',
    ageEn: 'estimated by middle-late sequel segments; exact personal age pending'
  }),
  audit('zi-ling', {
    group: 'starSea',
    status: 'stageChecked',
    chapterZh: '乱星海妙音门初遇至后续重逢、终局道侣关系段',
    chapterEn: 'Chaotic Star Sea Miao Yin meeting through later reunions and final dao-companion thread',
    firstZh: '乱星海妙音门相关事件中与韩立相识',
    firstEn: 'Meets Han Li through Miao Yin Sect-related Chaotic Star Sea events',
    locationZh: '乱星海、妙音门相关海域、后续高界面重逢空间',
    locationEn: 'Chaotic Star Sea, Miao Yin-related waters, and later higher-realm reunion spaces',
    peopleZh: '韩立、紫灵、妙音门人物、元瑶',
    peopleEn: 'Han Li, Zi Ling, Miao Yin figures, Yuan Yao',
    eventZh: '紫灵从乱星海人物线延续为韩立长期情感线，最终成为韩立道侣之一。',
    eventEn: 'Zi Ling grows from a Chaotic Star Sea character into a long emotional thread and finally one of Han Li dao companions.',
    materialsZh: '妙音门身份、情感因果、后续跨界机缘',
    materialsEn: 'Miao Yin identity, emotional karma, later cross-realm opportunities',
    ageZh: '初遇对应韩立乱星海阶段，约31-155岁范围内；紫灵本人年龄待逐章核对',
    ageEn: 'first meeting within Han Li Chaotic Star Sea age band about 31-155; Zi Ling personal age pending'
  }),
  audit('nangong-wan', {
    group: 'mortal',
    status: 'verifiedRange',
    chapterZh: '血色禁地初遇、返回天南重逢、结婴后道侣线与仙界篇轮回因果段',
    chapterEn: 'Blood Forbidden Land first meeting, Heavenly South reunion, post-Nascent-Soul dao-companion thread, and sequel reincarnation karma',
    firstZh: '韩立在血色禁地试炼中与南宫婉结缘',
    firstEn: 'Han Li forms his bond with Nangong Wan during the Blood Forbidden Land trial',
    locationZh: '血色禁地、掩月宗、天南、后续轮回相关空间',
    locationEn: 'Blood Forbidden Land, Masking Moon Sect, Heavenly South, later reincarnation-related spaces',
    peopleZh: '韩立、南宫婉、轮回殿主、蛟三',
    peopleEn: 'Han Li, Nangong Wan, Reincarnation Palace Master, Jiao San',
    eventZh: '南宫婉从人界情感线延伸为仙界篇轮回因果核心，不只是早期道侣标签。',
    eventEn: 'Nangong Wan extends from Mortal Realm emotional thread into sequel reincarnation karma, not merely an early dao-companion tag.',
    materialsZh: '掩月宗传承、血色禁地因果、轮回法则前世线',
    materialsEn: 'Masking Moon inheritance, Blood Forbidden Land karma, reincarnation-law past-life thread',
    ageZh: '初遇约韩立21岁；后续按天南、灵界、仙界阶段估算',
    ageEn: 'first meeting around Han Li age 21; later estimated by Heavenly South, Spirit, and Immortal stages'
  }),
  audit('yuan-yao', {
    group: 'starSea',
    status: 'stageChecked',
    chapterZh: '乱星海、虚天殿、阴冥之地与后续鬼道重逢段',
    chapterEn: 'Chaotic Star Sea, Void Heaven Hall, underworld-like spaces, and later ghost-path reunion segments',
    firstZh: '乱星海阶段与韩立相识，并将啼魂兽赠予韩立',
    firstEn: 'Meets Han Li in the Chaotic Star Sea and gives him the Weeping Soul Beast',
    locationZh: '乱星海、虚天殿、阴冥之地、灵界魂魄相关空间',
    locationEn: 'Chaotic Star Sea, Void Heaven Hall, underworld-like spaces, Spirit Realm soul spaces',
    peopleZh: '韩立、元瑶、妍丽、啼魂',
    peopleEn: 'Han Li, Yuan Yao, Yan Li, Weeping Soul',
    eventZh: '元瑶把乱星海女性人物线、啼魂兽和鬼道/阴冥线连接起来。',
    eventEn: 'Yuan Yao connects the Chaotic Star Sea female-character thread, Weeping Soul, and ghost / underworld motifs.',
    materialsZh: '啼魂兽、鬼道功法、阴魂保命线索',
    materialsEn: 'Weeping Soul Beast, ghost-path arts, yin-soul survival clues',
    ageZh: '初遇约在韩立乱星海阶段31-155岁之间；本人年龄待逐章核对',
    ageEn: 'first meeting within Han Li Chaotic Star Sea age band about 31-155; personal age pending'
  }),
  audit('xuan-gu', {
    group: 'starSea',
    status: 'stageChecked',
    chapterZh: '乱星海虚天殿夺宝、玄骨残魂和极阴旧怨段',
    chapterEn: 'Chaotic Star Sea Void Heaven treasure hunt, Xuan Gu remnant soul, and old debt with Jiyin',
    firstZh: '虚天殿前后以残魂老怪身份介入夺宝与夺舍布局',
    firstEn: 'Around Void Heaven Hall, enters treasure and possession schemes as an old-monster remnant soul',
    locationZh: '乱星海、虚天殿',
    locationEn: 'Chaotic Star Sea and Void Heaven Hall',
    peopleZh: '韩立、玄骨上人、极阴祖师、虚天殿修士',
    peopleEn: 'Han Li, Master Xuan Gu, Jiyin Ancestor, Void Heaven cultivators',
    eventZh: '玄骨是韩立乱星海阶段重要敌手，集中体现残魂夺舍、老怪互算和秘宝争夺。',
    eventEn: 'Xuan Gu is a major Chaotic Star Sea opponent, concentrating remnant-soul possession, old-monster schemes, and secret-treasure conflict.',
    materialsZh: '虚天鼎、魔道残魂、夺舍秘术、玄阴类功法',
    materialsEn: 'Void Heaven Cauldron, demonic remnant soul, possession arts, Xuan-yin methods',
    ageZh: '对应韩立约120-130岁虚天殿事件段',
    ageEn: 'around Han Li age 120-130 in the Void Heaven segment'
  }),
  audit('weeping-soul-character', {
    group: 'starSea',
    status: 'stageChecked',
    chapterZh: '乱星海得兽、阴冥/鬼道线、灵界成长和仙界篇刑兽/冥王线',
    chapterEn: 'Chaotic Star Sea acquisition, underworld / ghost path, Spirit Realm growth, and sequel punishment-beast / Nether King thread',
    firstZh: '元瑶将啼魂兽赠予韩立，后成为长期伙伴',
    firstEn: 'Yuan Yao gives the Weeping Soul Beast to Han Li, making it a long-term companion',
    locationZh: '乱星海、阴冥之地、灵界魂魄空间、仙界篇冥界相关空间',
    locationEn: 'Chaotic Star Sea, underworld-like spaces, Spirit Realm soul spaces, sequel netherworld-related spaces',
    peopleZh: '韩立、啼魂、元瑶',
    peopleEn: 'Han Li, Weeping Soul, Yuan Yao',
    eventZh: '啼魂从灵兽成长为仙界篇身份揭示人物，贯穿魂魄克制与轮回/冥界线。',
    eventEn: 'Weeping Soul grows from spirit beast into a sequel identity-reveal figure across soul suppression and reincarnation / netherworld themes.',
    materialsZh: '啼魂兽、刑兽血脉、吞噬魂魄、鬼道资源',
    materialsEn: 'Weeping Soul Beast, punishment-beast bloodline, soul devouring, ghost-path resources',
    ageZh: '初得约韩立乱星海阶段；仙界篇身份线约11190岁以后',
    ageEn: 'first acquired in Han Li Chaotic Star Sea stage; sequel identity thread after about age 11190'
  }),
  audit('silvermoon', {
    group: 'mortal',
    status: 'stageChecked',
    chapterZh: '人界后期器灵线、灵界妖族身份恢复与重逢段',
    chapterEn: 'Late Mortal artifact-spirit line, Spirit Realm demon-identity recovery, and reunion segment',
    firstZh: '以器灵/元神相关形态进入韩立身边',
    firstEn: 'Enters Han Li side through artifact-spirit / soul-form threads',
    locationZh: '人界后期遗迹与灵界妖族区域',
    locationEn: 'Late Mortal ruins and Spirit Realm demon-race regions',
    peopleZh: '韩立、银月/玲珑、冰凤、敖啸老祖',
    peopleEn: 'Han Li, Silvermoon / Ling Long, Ice Phoenix, Ao Xiao Ancestor',
    eventZh: '银月把法宝器灵、元神寄附、妖族身份和灵界重逢并成一条长线。',
    eventEn: 'Silvermoon merges artifact spirit, soul attachment, demon identity, and Spirit Realm reunion into one long thread.',
    materialsZh: '器灵、妖族血脉、真灵线索',
    materialsEn: 'Artifact spirit, demon bloodline, true-spirit clues',
    ageZh: '主要对应韩立人界后期至灵界1007岁以后',
    ageEn: 'mainly Han Li late Mortal through Spirit Realm after age 1007'
  }),
  audit('crab-daoist', {
    group: 'devil',
    status: 'stageChecked',
    chapterZh: '灵界后期魔界远行初得蟹道人，仙界篇开局与积鳞空境/石空解身世延伸段',
    chapterEn: 'Late Spirit Devil Realm journey acquisition, then sequel opening and Accumulated Scale / Shi Kongjie identity extension',
    firstZh: '韩立在魔界远行相关事件中获得蟹道人仙傀助力',
    firstEn: 'Han Li gains Crab Daoist immortal-puppet assistance during the Devil Realm journey',
    locationZh: '魔界、洗灵池相关空间、仙界篇黑风海与积鳞空境',
    locationEn: 'Devil Realm, cleansing-pool-related space, sequel Black Wind Sea and Accumulated Scale Realm',
    peopleZh: '韩立、蟹道人、石穿空、石空解相关人物',
    peopleEn: 'Han Li, Crab Daoist, Shi Chuankong, Shi Kongjie-related figures',
    eventZh: '蟹道人从仙傀护身战力升级为仙界篇高阶身世与傀儡大道节点。',
    eventEn: 'Crab Daoist upgrades from immortal-puppet protector into a high-level sequel identity and puppet-Dao node.',
    materialsZh: '仙傀核心、仙元石、雷之法则、傀儡法则',
    materialsEn: 'Immortal-puppet core, immortal origin stones, thunder law, puppet law',
    ageZh: '初得约韩立灵界后期；仙界篇延伸约11190岁以后',
    ageEn: 'first gained in Han Li late Spirit stage; sequel extension after about age 11190'
  }),
  audit('golden-child', {
    group: 'immortal',
    status: 'stageChecked',
    chapterZh: '仙界篇早中期：噬金虫王重逢、化形金童、噬金仙成长段',
    chapterEn: 'Early-middle sequel: Gold-Devouring Beetle King reunion, Golden Child transformation, Gold-Devouring Immortal growth',
    firstZh: '韩立与失散噬金虫王重逢后，金童进入长期同行线',
    firstEn: 'After Han Li reunites with the lost beetle king, Golden Child enters the long companion line',
    locationZh: '仙界篇早中期多处任务与追逃空间',
    locationEn: 'Multiple early-middle sequel mission and pursuit spaces',
    peopleZh: '韩立、金童、噬金虫/噬金仙相关人物',
    peopleEn: 'Han Li, Golden Child, Gold-Devouring Beetle / Immortal figures',
    eventZh: '金童把韩立人界灵虫养成线推进到仙界吞噬法则和高阶旧账。',
    eventEn: 'Golden Child pushes Han Li Mortal spirit-insect cultivation into sequel devouring law and high-level old karma.',
    materialsZh: '噬金虫王、噬金仙、吞噬法则、仙界灵虫资源',
    materialsEn: 'Gold-Devouring Beetle King, Gold-Devouring Immortal, devouring law, sequel spirit-insect resources',
    ageZh: '韩立仙界篇早中期，约11190-13280岁范围内估算',
    ageEn: 'Han Li early-middle sequel, roughly age 11190-13280'
  }),
  audit('liu-le-er', {
    group: 'immortal',
    status: 'stageChecked',
    chapterZh: '仙界篇开局：小南洲/灵寰界、失忆韩立与云狐族线',
    chapterEn: 'Sequel opening: Xiaonanzhou / Spirit Domain, amnesiac Han Li, and Cloud Fox line',
    firstZh: '柳乐儿照顾失忆重伤的韩立，开启仙界篇低处重启人情线',
    firstEn: 'Liu Leer cares for injured amnesiac Han Li, opening the sequel low-start emotional thread',
    locationZh: '小南洲、灵寰界、黑风海前置空间',
    locationEn: 'Xiaonanzhou, Spirit Domain, pre-Black-Wind spaces',
    peopleZh: '韩立、柳乐儿、云狐族人物',
    peopleEn: 'Han Li, Liu Leer, Cloud Fox figures',
    eventZh: '她是仙界篇开局最重要的情感锚点之一。',
    eventEn: 'She is one of the most important emotional anchors of the sequel opening.',
    materialsZh: '云狐族血脉、天狐传承、失忆恢复线索',
    materialsEn: 'Cloud Fox bloodline, Heavenly Fox inheritance, memory-recovery clues',
    ageZh: '仙界篇开局；韩立约11190岁以后',
    ageEn: 'sequel opening; Han Li after about age 11190'
  }),
  audit('hu-yan-daoist', {
    group: 'immortal',
    status: 'stageChecked',
    chapterZh: '仙界篇早期：黑风海、烛龙道与后续仙界友人线',
    chapterEn: 'Early sequel: Black Wind Sea, Candle Dragon Dao, and later immortal-friend thread',
    firstZh: '黑风海/烛龙道相关阶段与韩立结交',
    firstEn: 'Befriends Han Li around Black Wind Sea / Candle Dragon Dao stages',
    locationZh: '黑风海、烛龙道、北寒仙域相关空间',
    locationEn: 'Black Wind Sea, Candle Dragon Dao, North Cold domain spaces',
    peopleZh: '韩立、呼言道人、热火仙尊、白素媛、云霓',
    peopleEn: 'Han Li, Hu Yan Daoist, Hot Flame Immortal, Bai Suyuan, Yun Ni',
    eventZh: '呼言道人补足仙界篇早期少见的朋友、交易和洞府人情线。',
    eventEn: 'Hu Yan Daoist supplies a rare early-sequel friendship, trade, and cave-residence personal thread.',
    materialsZh: '仙界散修资源、火系/洞府线索、友人因果',
    materialsEn: 'Rogue immortal resources, fire / cave-residence clues, friend karma',
    ageZh: '仙界篇早期，约11190岁以后',
    ageEn: 'early sequel, after about age 11190'
  }),
  audit('fox-three', {
    group: 'immortal',
    status: 'stageChecked',
    chapterZh: '仙界篇无常盟、轮回殿任务与身份伪装段',
    chapterEn: 'Sequel Impermanence Alliance, Reincarnation Palace missions, and disguise segments',
    firstZh: '通过任务网络与韩立多次同行',
    firstEn: 'Repeatedly travels with Han Li through mission networks',
    locationZh: '无常盟任务路线、轮回殿相关空间',
    locationEn: 'Impermanence Alliance mission routes and Reincarnation Palace-related spaces',
    peopleZh: '韩立、狐三、蛟三、无常盟/轮回殿成员',
    peopleEn: 'Han Li, Fox Three, Jiao San, Impermanence / Reincarnation members',
    eventZh: '狐三是仙界篇行动小队和身份伪装网络的重要节点。',
    eventEn: 'Fox Three is an important node in sequel action teams and disguise networks.',
    materialsZh: '身份伪装、任务情报、轮回殿行动体系',
    materialsEn: 'Disguise, mission intelligence, Reincarnation Palace action system',
    ageZh: '仙界篇早中期估算；本人年龄待逐章核对',
    ageEn: 'early-middle sequel estimate; personal age pending'
  }),
  audit('shi-chuankong', {
    group: 'gray',
    status: 'stageChecked',
    chapterZh: '仙界篇灰界、积鳞空境与魔域皇族身世段',
    chapterEn: 'Sequel Gray Realm, Accumulated Scale Realm, and Devil Domain royal identity segment',
    firstZh: '石穿空与韩立同行并进入灰界/积鳞空境关键路线',
    firstEn: 'Shi Chuankong travels with Han Li into key Gray Realm / Accumulated Scale routes',
    locationZh: '灰界、积鳞空境、魔域相关空间',
    locationEn: 'Gray Realm, Accumulated Scale Realm, Devil Domain-related spaces',
    peopleZh: '韩立、石穿空、蟹道人、魔域石氏人物',
    peopleEn: 'Han Li, Shi Chuankong, Crab Daoist, Devil Domain Shi-clan figures',
    eventZh: '石穿空把仙界篇同行者线和灰界地图、魔域皇族、蟹道人身世合在一起。',
    eventEn: 'Shi Chuankong combines companion thread, Gray Realm map, Devil Domain royal line, and Crab Daoist identity.',
    materialsZh: '空间法则、灰界资源、积鳞空境线索',
    materialsEn: 'Space law, Gray Realm resources, Accumulated Scale clues',
    ageZh: '约13346-13390岁灰界段为重点估算',
    ageEn: 'Gray Realm segment roughly age 13346-13390'
  })
]) {
  verificationCatalog.set(slug, data)
}

function prefix(locale) {
  return locale === 'en' ? '/en' : ''
}

function pathFor(entry, locale) {
  return `${prefix(locale)}/rmji/${entry.section}/${entry.slug}`
}

function titleFor(entry, locale) {
  return locale === 'en' ? `${entry.en} / ${entry.zh}` : `${entry.zh} / ${entry.en}`
}

function storylineFor(entry) {
  return storylineDetails.get(entry.slug)
}

function inferredAuditGroup(entry) {
  const phase = `${entry.phaseZh} ${entry.phaseEn}`
  if (phase.includes('乱星海') || phase.includes('Chaotic Star')) return 'starSea'
  if (phase.includes('灰界') || phase.includes('Gray')) return 'gray'
  if (phase.includes('魔界') || phase.includes('魔族') || phase.includes('Devil')) return 'devil'
  if (phase.includes('仙界') || phase.includes('Immortal') || phase.includes('道祖')) return 'immortal'
  if (phase.includes('灵界') || phase.includes('Spirit')) return 'spirit'
  return 'mortal'
}

function defaultVerificationStatus(entry) {
  if (entry.confidence === 'verify') return 'needsChapterCheck'
  if (entry.confidence === 'medium') return 'estimated'
  return 'stageChecked'
}

function defaultVerification(entry) {
  const group = inferredAuditGroup(entry)
  const detail = storylineFor(entry)
  return {
    slug: entry.slug,
    group,
    status: defaultVerificationStatus(entry),
    sourceKeys: auditSourceKeysByGroup[group],
    workZh: ['immortal', 'gray'].includes(group) ? '《凡人修仙之仙界篇》' : '《凡人修仙传》',
    workEn: ['immortal', 'gray'].includes(group) ? 'RMJI: Immortal World Arc' : "A Record of a Mortal's Journey to Immortality",
    chapterZh: detail ? `${entry.phaseZh}：${detail.locationZh}相关事件段` : `${entry.phaseZh}相关章节段`,
    chapterEn: detail ? `${entry.phaseEn}: event segment around ${detail.locationEn}` : `${entry.phaseEn} related chapter segment`,
    firstZh: detail ? detail.eventZh : `${entry.zh}相关首次出场待逐章细化`,
    firstEn: detail ? detail.eventEn : `First appearance of ${entry.en} remains to be refined by chapter`,
    locationZh: detail ? detail.locationZh : auditGroupText[group].zh,
    locationEn: detail ? detail.locationEn : auditGroupText[group].en,
    peopleZh: entry.section === 'characters' ? entry.zh : '韩立及相关人物',
    peopleEn: entry.section === 'characters' ? entry.en : 'Han Li and related figures',
    eventZh: entry.summaryZh,
    eventEn: entry.summaryEn,
    materialsZh: ['techniques', 'artifacts', 'elixirs', 'laws'].includes(entry.section) ? entry.zh : '按词条关系链继续补材料/功法细节',
    materialsEn: ['techniques', 'artifacts', 'elixirs', 'laws'].includes(entry.section) ? entry.en : 'Material / technique details to be expanded through related links',
    ageZh: detail ? detail.ageZh : '按阶段估算，待逐章精修',
    ageEn: detail ? detail.ageEn : 'estimated by arc; chapter-level refinement pending',
    noteZh: entry.confidence === 'verify'
      ? '当前只建立索引骨架，下一轮优先按合法阅读目录细化章节段。'
      : '当前已定位到阶段或事件段，后续继续补精确章节号和交叉引用。',
    noteEn: entry.confidence === 'verify'
      ? 'This is currently an index scaffold; a later pass should refine chapter segments from legal catalogues.'
      : 'This is located to an arc or event segment; later passes can add exact chapter numbers and cross-links.'
  }
}

function verificationFor(entry) {
  return { ...defaultVerification(entry), ...(verificationCatalog.get(entry.slug) ?? {}) }
}

function verificationStatusLabel(verification, locale) {
  return verificationStatusText[verification.status]?.[locale === 'en' ? 'en' : 'zh'] ?? verification.status
}

function auditGroupLabel(group, locale) {
  return auditGroupText[group]?.[locale === 'en' ? 'en' : 'zh'] ?? group
}

function verificationSourceLinks(verification, locale) {
  return (verification.sourceKeys ?? [])
    .map((key) => sourceByKey.get(key))
    .filter(Boolean)
    .map((source) => `[${locale === 'en' ? source.en : source.zh}](${source.url})`)
    .join(locale === 'en' ? ', ' : '、')
}

const chronologyNodes = [
  {
    key: 'mortalOpening',
    order: 10,
    realm: 'mortal',
    zh: '人界篇 01｜凡俗开局与七玄门',
    en: 'Mortal Realm 01 | Mortal opening and Qixuanmen',
    descZh: '青牛镇、七玄门、墨大夫、江湖门派和修仙门槛，主要承担“凡人低起点”的开局。',
    descEn: 'Green Ox Town, Qixuanmen, Doctor Mo, martial-sect life, and the first cultivation threshold.'
  },
  {
    key: 'mortalFoundation',
    order: 18,
    realm: 'mortal',
    zh: '人界篇 02｜基础系统，后续贯穿',
    en: 'Mortal Realm 02 | Foundational systems that continue later',
    descZh: '炼丹、炼器、阵法、灵石、丹方、玉简等从人界建立规则、后续跨界延续的基础设定。',
    descEn: 'Alchemy, artifact refining, formations, spirit stones, formulas, jade slips, and other systems introduced early and reused later.'
  },
  {
    key: 'mortalSect',
    order: 20,
    realm: 'mortal',
    zh: '人界篇 03｜越国七派与筑基阶段',
    en: 'Mortal Realm 03 | Yue Seven Sects and Foundation Establishment',
    descZh: '太南小会、黄枫谷、血色禁地、筑基丹、越国正魔压力和早期宗门关系。',
    descEn: 'Tainan gathering, Yellow Maple Valley, Blood Forbidden Land, Foundation pills, Yue conflict pressure, and early sect ties.'
  },
  {
    key: 'mortalStarSea',
    order: 30,
    realm: 'mortal',
    zh: '人界篇 04｜乱星海与虚天殿',
    en: 'Mortal Realm 04 | Chaotic Star Sea and Void Heaven Hall',
    descZh: '魁星岛、天星城、外星海猎妖、虚天殿、玄骨、极阴、紫灵、元瑶与海域资源循环。',
    descEn: 'Kuixing Island, Sky Star City, Outer Star Sea hunting, Void Heaven Hall, Xuan Gu, Jiyin, Zi Ling, Yuan Yao, and sea-resource loops.'
  },
  {
    key: 'mortalLate',
    order: 40,
    realm: 'mortal',
    zh: '人界篇 05｜返回天南、大晋与飞升前',
    en: 'Mortal Realm 05 | Return to Heavenly South, Great Jin, and pre-ascension',
    descZh: '结丹、结婴、坠魔谷、大晋、昆吾山、化神和空间节点，整理人界中后期老怪与遗迹线。',
    descEn: 'Core Formation, Nascent Soul, Demonfall Valley, Great Jin, Kunwu Mountain, Spirit Transformation, and spatial nodes.'
  },
  {
    key: 'spiritOpening',
    order: 50,
    realm: 'spirit',
    zh: '灵界篇 01｜飞升落点与天渊城',
    en: 'Spirit Realm 01 | Ascension landing and Heavenly Abyss City',
    descZh: '韩立进入灵界后的身份重建、人妖两族防线、天渊城秩序和更高界面资源。',
    descEn: 'Identity rebuilding after ascension, human-demon defenses, Heavenly Abyss City order, and higher-realm resources.'
  },
  {
    key: 'spiritMiddle',
    order: 60,
    realm: 'spirit',
    zh: '灵界篇 02｜多族地域、广寒界与大乘',
    en: 'Spirit Realm 02 | Multi-race regions, Broad Cold Realm, and Great Ascension',
    descZh: '飞灵族、真灵血脉、广寒界、冥河、蛮荒、多族压力和大乘推进。',
    descEn: 'Flying Spirit peoples, true-spirit bloodlines, Broad Cold Realm, Nether River, wilderness pressure, and Great Ascension progress.'
  },
  {
    key: 'spiritDevil',
    order: 70,
    realm: 'spirit',
    zh: '灵界篇 03｜魔劫与魔界远行',
    en: 'Spirit Realm 03 | Devil Calamity and Devil Realm journey',
    descZh: '魔族压力、魔界资源、宝花、元刹、六极等圣祖人物，以及灵界后期战争尺度。',
    descEn: 'Devil pressure, Devil Realm resources, Baohua, Yuan Cha, Six Extremes, and late Spirit Realm war scale.'
  },
  {
    key: 'immortalOpening',
    order: 80,
    realm: 'immortal',
    zh: '仙界篇 01｜黑风海、北寒仙域与烛龙道',
    en: 'Immortal World 01 | Black Wind Sea, North Cold domain, and Candle Dragon Dao',
    descZh: '仙界篇低处重启、黑风海、北寒仙域、仙宫追索、烛龙道、无常盟和早期同行人物。',
    descEn: 'The sequel restart, Black Wind Sea, North Cold domain, immortal-palace pursuit, Candle Dragon Dao, Impermanence Alliance, and early companions.'
  },
  {
    key: 'immortalMiddle',
    order: 90,
    realm: 'immortal',
    zh: '仙界篇 02｜真言门、轮回殿、天庭与九元观',
    en: 'Immortal World 02 | True Word Sect, Reincarnation Palace, Heavenly Court, and Nine Origin Temple',
    descZh: '真言化轮经、时间法则、轮回殿任务、天庭秩序、九元观和仙界中后期政治主线。',
    descEn: 'Mantra Wheel Scripture, time law, Reincarnation Palace missions, Heavenly Court order, Nine Origin Temple, and sequel politics.'
  },
  {
    key: 'immortalGray',
    order: 100,
    realm: 'immortal',
    zh: '仙界篇 03｜灰界与积鳞空境',
    en: 'Immortal World 03 | Gray Realm and Accumulated Scale Realm',
    descZh: '灰界城池、荒域、灰晶、异质生态、生存规则和石穿空相关路线。',
    descEn: 'Gray Realm cities, wilderness, gray crystals, alien ecology, survival rules, and Shi Chuankong-related routes.'
  },
  {
    key: 'immortalEndgame',
    order: 110,
    realm: 'immortal',
    zh: '仙界篇 04｜道祖终局',
    en: 'Immortal World 04 | Dao Ancestor endgame',
    descZh: '古或今、轮回殿主、时间道祖、天庭终局、轮回与时间大道冲突。',
    descEn: 'Gu Huojin, the Reincarnation Palace Master, Time Dao Ancestor, Heavenly Court finale, and the time-reincarnation conflict.'
  }
]

const chronologyNodeByKey = new Map(chronologyNodes.map((node) => [node.key, node]))

function textHasAny(text, needles) {
  return needles.some((needle) => text.includes(needle))
}

function chronologyKeyFor(entry) {
  const phase = `${entry.phaseZh} ${entry.phaseEn}`
  const slug = entry.slug
  const haystack = `${phase} ${slug}`
  const group = verificationFor(entry).group

  if (group === 'gray' || textHasAny(haystack, ['灰界', 'Gray Realm', 'gray-realm', 'accumulated-scale'])) return 'immortalGray'

  if (group === 'immortal') {
    if (textHasAny(haystack, ['终局', '道祖终局', 'endgame', 'dao-ancestor-endgame', 'gu-huajin', 'time-dao-ancestor'])) return 'immortalEndgame'
    if (['jiao-san', 'fox-three', 'gan-jiuzhen', 'mi-luo-ancestor', 'mu-yan', 'wu-yang', 'jin-yuanzi', 'he-ze', 'qi-mozi'].includes(slug)) return 'immortalMiddle'
    if (textHasAny(haystack, ['真言', '轮回', '天庭', '九元', '高阶', 'True Word', 'Reincarnation', 'Heavenly Court', 'Nine Origin', 'mantra', 'reincarnation-palace', 'heavenly-court', 'time-law'])) return 'immortalMiddle'
    return 'immortalOpening'
  }

  if (group === 'devil' || textHasAny(haystack, ['魔界', '魔劫', '魔族', 'Devil Realm', 'Devil Calamity', 'devil-realm', 'devil-war'])) return 'spiritDevil'

  if (group === 'spirit') {
    if (textHasAny(haystack, ['后期', '大乘', '飞灵', '广寒', '冥河', '蛮荒', '真灵', 'Late Spirit', 'Great Ascension', 'Flying Spirit', 'Broad Cold', 'Nether', 'Wild', 'true-spirit'])) return 'spiritMiddle'
    return 'spiritOpening'
  }

  if (group === 'starSea' || textHasAny(haystack, ['乱星海', '虚天', '外星海', '天星城', 'Chaotic Star', 'Void Heaven', 'Outer Star', 'star-sea', 'xutian'])) return 'mortalStarSea'

  if (['dayan-divine-lord', 'silvermoon', 'ice-phoenix'].includes(slug)) return 'mortalLate'
  if (textHasAny(haystack, ['全书', '通用', '常见', '资源线', 'Whole-series', 'Recurring', 'recurring', 'resource thread'])) return 'mortalFoundation'
  if (textHasAny(haystack, ['开篇', '七玄', '墨大夫', '青牛', '凡俗', 'Opening', 'Qixuan', 'Doctor Mo', 'green-ox'])) return 'mortalOpening'
  if (textHasAny(haystack, ['中后', '后期', '天南', '大晋', '昆吾', '坠魔', '结婴', '元婴', '化神', '空间节点', 'middle-late', 'Late Mortal', 'Heavenly South', 'Great Jin', 'Kunwu', 'Demonfall', 'Nascent Soul', 'Spirit Transformation', 'spatial-node'])) return 'mortalLate'
  return 'mortalSect'
}

function chronologyFor(entry) {
  return chronologyNodeByKey.get(chronologyKeyFor(entry)) ?? chronologyNodeByKey.get('mortalFoundation')
}

function chronologyOrder(entry) {
  const detail = storylineFor(entry)
  const node = chronologyFor(entry)
  return (node.order * 1000) + (detail?.order ?? 500)
}

function realmSequenceText(locale) {
  return locale === 'en'
    ? 'Mortal Realm -> Spirit Realm -> Immortal World'
    : '人界篇 -> 灵界篇 -> 仙界篇'
}

function chronologyLabel(entry, locale) {
  const node = chronologyFor(entry)
  return locale === 'en' ? node.en : node.zh
}

function chronologyRealmLabel(entry, locale) {
  const node = chronologyFor(entry)
  const labels = {
    mortal: { zh: '人界篇', en: 'Mortal Realm' },
    spirit: { zh: '灵界篇', en: 'Spirit Realm' },
    immortal: { zh: '仙界篇', en: 'Immortal World Arc' }
  }
  return labels[node.realm]?.[locale === 'en' ? 'en' : 'zh'] ?? node.realm
}

function chronologyNote(entry, locale) {
  const node = chronologyFor(entry)
  const span = bookPlacement(entry, locale)
  if (locale === 'en') {
    return `${node.en}. ${node.descEn} ${span}`
  }
  return `${node.zh}。${node.descZh} ${span}`
}

function renderChronologyBlock(entry, locale) {
  const isEn = locale === 'en'
  const verification = verificationFor(entry)
  const node = chronologyFor(entry)
  if (isEn) {
    return `## Timeline Placement

| Field | Detail |
| --- | --- |
| Reading order | ${realmSequenceText(locale)} |
| This entry belongs to | ${node.en} |
| Major realm | ${chronologyRealmLabel(entry, locale)} |
| Arc label | ${entry.phaseEn} |
| Chapter segment | ${verification.chapterEn} |
| Why it is here | ${node.descEn} |
`
  }
  return `## 时间节点定位

| 项目 | 详情 |
| --- | --- |
| 阅读顺序 | ${realmSequenceText(locale)} |
| 本词条节点 | ${node.zh} |
| 所属大篇章 | ${chronologyRealmLabel(entry, locale)} |
| 原有阶段标签 | ${entry.phaseZh} |
| 章节段 | ${verification.chapterZh} |
| 为什么放在这里 | ${node.descZh} |
`
}

function renderChronologicalEntryIndex(locale, entries) {
  const isEn = locale === 'en'
  return chronologyNodes.map((node) => {
    const groupEntries = entries
      .filter((entry) => chronologyFor(entry).key === node.key)
      .sort((a, b) => {
        const orderDelta = chronologyOrder(a) - chronologyOrder(b)
        if (orderDelta !== 0) return orderDelta
        return a.zh.localeCompare(b.zh, 'zh-Hans-CN')
      })
    if (groupEntries.length === 0) return ''
    const rows = groupEntries.map((entry) => {
      const title = `[${titleFor(entry, locale)}](${pathFor(entry, locale)})`
      const phase = isEn ? entry.phaseEn : entry.phaseZh
      const verification = verificationFor(entry)
      const checkStatus = verificationStatusLabel(verification, locale)
      const summary = isEn ? entry.summaryEn : entry.summaryZh
      return `| ${title} | ${phase} | ${checkStatus} | ${summary} |`
    }).join('\n')
    return isEn
      ? `### ${node.en}

${node.descEn}

| Entry | Arc | Chapter check | Summary |
| --- | --- | --- | --- |
${rows}`
      : `### ${node.zh}

${node.descZh}

| 词条 | 阶段 | 章节核对 | 摘要 |
| --- | --- | --- | --- |
${rows}`
  }).filter(Boolean).join('\n\n')
}

function renderVerificationBlock(entry, locale) {
  const isEn = locale === 'en'
  const verification = verificationFor(entry)
  const sourcesText = verificationSourceLinks(verification, locale)
  if (isEn) {
    return `## Chapter Check Ledger

| Field | Detail |
| --- | --- |
| Work | ${verification.workEn} |
| Chapter segment | ${verification.chapterEn} |
| First check point | ${verification.firstEn} |
| Main place | ${verification.locationEn} |
| People | ${verification.peopleEn} |
| Event | ${verification.eventEn} |
| Materials / arts | ${verification.materialsEn} |
| Han Li age estimate | ${verification.ageEn} |
| Check status | ${verificationStatusLabel(verification, locale)} |
| Legal sources | ${sourcesText} |
| Note | ${verification.noteEn} |
`
  }
  return `## 章节核对台账

| 项目 | 详情 |
| --- | --- |
| 作品 | ${verification.workZh} |
| 章节段 | ${verification.chapterZh} |
| 首次核对点 | ${verification.firstZh} |
| 主要地点 | ${verification.locationZh} |
| 相关人物 | ${verification.peopleZh} |
| 事件摘要 | ${verification.eventZh} |
| 材料 / 功法 / 物件 | ${verification.materialsZh} |
| 韩立年龄估算 | ${verification.ageZh} |
| 核对状态 | ${verificationStatusLabel(verification, locale)} |
| 合法来源 | ${sourcesText} |
| 备注 | ${verification.noteZh} |
`
}

function renderTimelineAuditProgress(locale) {
  const isEn = locale === 'en'
  const rows = Object.keys(auditGroupText).map((group) => {
    const entries = allEntries.filter((entry) => verificationFor(entry).group === group)
    const counts = entries.reduce((acc, entry) => {
      const status = verificationFor(entry).status
      acc[status] = (acc[status] ?? 0) + 1
      return acc
    }, {})
    const done = (counts.verifiedRange ?? 0) + (counts.stageChecked ?? 0)
    if (isEn) {
      return `| ${auditGroupLabel(group, locale)} | ${entries.length} | ${done} | ${counts.estimated ?? 0} | ${counts.needsChapterCheck ?? 0} |`
    }
    return `| ${auditGroupLabel(group, locale)} | ${entries.length} | ${done} | ${counts.estimated ?? 0} | ${counts.needsChapterCheck ?? 0} |`
  }).join('\n')

  if (isEn) {
    return `## Chapter Check Progress

| Realm / arc | Entries | Verified or arc-checked | Estimated | Needs chapter check |
| --- | ---: | ---: | ---: | ---: |
${rows}

[Open the full chapter-check ledger](/en/rmji/audit/).`
  }

  return `## 章节核对进度

| 界域 / 篇章 | 词条数 | 已核对或阶段核对 | 估算 | 待逐章核对 |
| --- | ---: | ---: | ---: | ---: |
${rows}

[打开完整章节核对台账](/rmji/audit/)。`
}

function entriesForSection(sectionSlug) {
  const entries = catalog[sectionSlug]
  return [...entries].sort((a, b) => {
    const chronologyDelta = chronologyOrder(a) - chronologyOrder(b)
    if (chronologyDelta !== 0) return chronologyDelta
    const orderA = storylineFor(a)?.order ?? 999
    const orderB = storylineFor(b)?.order ?? 999
    if (orderA !== orderB) return orderA - orderB
    return a.zh.localeCompare(b.zh, 'zh-Hans-CN')
  })
}

function renderStorylineOverview(locale, entries) {
  const isEn = locale === 'en'
  const rows = entries
    .map((entry) => ({ entry, detail: storylineFor(entry) }))
    .filter(({ detail }) => detail)
    .map(({ entry, detail }) => {
      const age = isEn ? detail.ageEn : detail.ageZh
      const location = isEn ? detail.locationEn : detail.locationZh
      const gains = isEn ? detail.gainsEn : detail.gainsZh
      const event = isEn ? detail.eventEn : detail.eventZh
      return `<a class="storyline-row" href="${pathFor(entry, locale)}">
  <span class="storyline-order">${String(detail.order).padStart(2, '0')}</span>
  <div class="storyline-body">
    <h3>${titleFor(entry, locale)}</h3>
    <dl class="storyline-facts">
      <div><dt>${isEn ? 'Age' : '年龄'}</dt><dd>${age}</dd></div>
      <div><dt>${isEn ? 'Location' : '地点'}</dt><dd>${location}</dd></div>
      <div><dt>${isEn ? 'Gains' : '所得'}</dt><dd>${gains}</dd></div>
    </dl>
    <p>${event}</p>
  </div>
</a>`
    }).join('\n')

  return isEn
    ? `## Protagonist Route

<p class="muted">Age values are now calibrated by the Mortal Realm, Spirit Realm, and Immortal World Arc reference bands above, while still using approximate ranges.</p>

<div class="storyline-list">
${rows}
</div>`
    : `## 主角路线速览

<p class="muted">年龄已按人界、灵界、仙界三段基准重新校准，页面仍保留约数口径。</p>

<div class="storyline-list">
${rows}
</div>`
}

function renderTimelineProfile(entry, locale) {
  const detail = storylineFor(entry)
  if (!detail) return ''
  const isEn = locale === 'en'
  if (isEn) {
    return `## Protagonist Timeline Profile

| Field | Detail |
| --- | --- |
| Han Li age band | ${detail.ageEn} |
| Main location | ${detail.locationEn} |
| Gains or changes | ${detail.gainsEn} |
| Key event | ${detail.eventEn} |
| Precision note | ${detail.noteEn} |
`
  }
  return `## 主角时间线档案

| 项目 | 详情 |
| --- | --- |
| 韩立年龄段 | ${detail.ageZh} |
| 主要地点 | ${detail.locationZh} |
| 获得或变化 | ${detail.gainsZh} |
| 关键事件 | ${detail.eventZh} |
| 精度说明 | ${detail.noteZh} |
`
}

function renderAgeCalibration(locale) {
  const isEn = locale === 'en'
  const rows = ageCalibration.map((item) => {
    const realm = isEn ? item.enRealm : item.zhRealm
    const age = isEn ? item.enAge : item.zhAge
    const basis = isEn ? item.enBasis : item.zhBasis
    return `| ${realm} | ${age} | ${basis} |`
  }).join('\n')

  if (isEn) {
    return `## Age Calibration

| Realm | Estimated Han Li Age | Calibration Points |
| --- | --- | --- |
${rows}

References used for this estimate: [Han Li age timeline](https://zhuanlan.zhihu.com/p/476520969), [Immortal World Arc calendar](https://www.cnblogs.com/doseoer/p/17834353.html).`
  }

  return `## 年龄核对基准

| 界域 | 韩立年龄估算 | 核对节点 |
| --- | --- | --- |
${rows}

本轮估算参考：[韩立年龄线公开整理](https://zhuanlan.zhihu.com/p/476520969)、[仙界篇年历公开整理](https://www.cnblogs.com/doseoer/p/17834353.html)。`
}

function renderSources(locale) {
  return sources.map((source) => `- [${locale === 'en' ? source.en : source.zh}](${source.url})`).join('\n')
}

function relatedLinks(entry, locale) {
  const links = entry.related
    .map((slug) => entryBySlug.get(slug))
    .filter(Boolean)
    .map((related) => `- [${titleFor(related, locale)}](${pathFor(related, locale)})`)
  if (links.length === 0) return locale === 'en' ? '- To be connected in a later content pass.' : '- 后续内容批次继续补充。'
  return links.join('\n')
}

const focusText = {
  techniques: {
    zh: '看它如何影响修炼效率、斗法方式、保命能力或法则理解。',
    en: 'Read it through cultivation efficiency, combat style, survival value, or law comprehension.'
  },
  artifacts: {
    zh: '看它的来源、祭炼方式、材料属性、成长空间和与韩立底牌体系的关系。',
    en: 'Read it through origin, refinement, material attribute, growth potential, and Han Li trump-card system.'
  },
  elixirs: {
    zh: '看它在资源链中的位置：药材来源、丹方价值、突破用途、交易价值和稀缺性。',
    en: 'Read it through the resource chain: herb source, formula value, breakthrough use, trade value, and scarcity.'
  },
  sects: {
    zh: '看它在地区秩序、资源分配、任务体系、追杀压力或政治联盟中的位置。',
    en: 'Read it through regional order, resource allocation, mission systems, pursuit pressure, or political alliances.'
  },
  races: {
    zh: '看它的生态位置、族群等级、资源习惯、跨界冲突和与人族修士的关系。',
    en: 'Read it through ecology, hierarchy, resource habits, cross-realm conflict, and relations with human cultivators.'
  },
  regions: {
    zh: '看它提供了哪些资源、危险、势力入口和剧情转折。',
    en: 'Read it through resources, dangers, faction gateways, and story turns.'
  },
  laws: {
    zh: '看它如何把境界、灵域、道祖体系和仙界篇高阶斗法连接起来。',
    en: 'Read it through its links to realms, spiritual domains, Dao Ancestors, and high-level sequel combat.'
  },
  characters: {
    zh: '看人物承担的是引路、情感因果、敌对压力、同行互助还是高阶秩序象征。',
    en: 'Read the character as mentor, emotional karma, hostile pressure, companion support, or symbol of higher order.'
  },
  timeline: {
    zh: '看这一阶段如何改变韩立的资源、身份、地图和敌我格局。',
    en: 'Read the stage by how it changes Han Li resources, identity, map, and conflict structure.'
  }
}

function bookPlacement(entry, locale) {
  const phase = `${entry.phaseZh} ${entry.phaseEn}`
  if ((phase.includes('人界') && phase.includes('灵界')) || phase.includes('Mortal to Spirit')) {
    return locale === 'en'
      ? 'This entry spans the Mortal-to-Spirit Realm transition, so it is useful for tracking how early tools grow into higher-realm systems.'
      : '这个词条横跨人界到灵界，适合观察早期手段如何成长为高界面体系。'
  }
  if ((phase.includes('灵界') && phase.includes('仙界')) || phase.includes('Spirit to Immortal')) {
    return locale === 'en'
      ? 'This entry spans the Spirit-to-Immortal Realm transition, where earlier resources and methods are upgraded into immortal-world scale.'
      : '这个词条横跨灵界到仙界，适合观察旧有资源和手段如何升级到仙界尺度。'
  }
  if ((phase.includes('人界') && phase.includes('仙界')) || phase.includes('Mortal Realm to Immortal')) {
    return locale === 'en'
      ? 'This entry spans a long series arc, making it useful for tracking continuity across both the original novel and the sequel.'
      : '这个词条跨度很长，适合观察原著和仙界篇之间的连续性。'
  }
  if (phase.includes('仙界') || phase.includes('Immortal')) {
    return locale === 'en'
      ? 'This entry mainly supports the Immortal World Arc, where resource cultivation expands into laws, immortal factions, and Dao-level pressure.'
      : '这个词条主要服务《仙界篇》：资源型修炼被推进到法则、仙域势力和道祖级压力。'
  }
  if (phase.includes('灵界') || phase.includes('Spirit')) {
    return locale === 'en'
      ? 'This entry belongs mostly to the Spirit Realm transition, where Han Li faces racial politics, higher materials, and broader realm-scale conflict.'
      : '这个词条主要落在灵界过渡阶段：韩立开始面对族群政治、更高阶材料和界面级冲突。'
  }
  if (phase.includes('人界') || phase.includes('Mortal')) {
    return locale === 'en'
      ? 'This entry belongs mostly to the Mortal Realm portion, where scarcity, sect systems, secret realms, and cautious accumulation define the story.'
      : '这个词条主要落在人界篇：资源稀缺、宗门制度、秘境争夺和谨慎积累构成叙事底色。'
  }
  return locale === 'en'
    ? 'This entry is a cross-series concept and should be read across both the original novel and the sequel.'
    : '这个词条属于贯穿两部书的设定，适合放在原著和仙界篇之间交叉阅读。'
}

function curationNotes(entry, locale) {
  const section = sectionBySlug.get(entry.section)
  const focus = focusText[entry.section] ?? focusText.timeline
  if (locale === 'en') {
    return `- Topic lane: ${section.en}.
- Chronology node: ${chronologyLabel(entry, locale)}.
- Reading focus: ${focus.en}
- Series placement: ${bookPlacement(entry, locale)}
- Spoiler level: encyclopedia summary only; no chapter text is reproduced.`
  }
  return `- 所属线索：${section.zh}。
- 时间节点：${chronologyLabel(entry, locale)}。
- 阅读重点：${focus.zh}
- 两部书中的位置：${bookPlacement(entry, locale)}
- 剧透尺度：只做百科式概括，不收录章节正文。`
}

function characterProfile(data) {
  return {
    encounterZh: data.encounterZh,
    encounterEn: data.encounterEn,
    realmZh: data.realmZh,
    realmEn: data.realmEn,
    identityZh: data.identityZh,
    identityEn: data.identityEn,
    artsZh: data.artsZh,
    artsEn: data.artsEn,
    relationZh: data.relationZh,
    relationEn: data.relationEn,
    outcomeZh: data.outcomeZh,
    outcomeEn: data.outcomeEn,
    ageZh: data.ageZh ?? '原文多以境界和阶段定位，具体年龄待逐章核对；本页先按相遇阶段估算。',
    ageEn: data.ageEn ?? 'The text usually locates this figure by realm and arc; exact age remains chapter-level work.',
    noteZh: data.noteZh ?? '本档案为原创百科整理，不复制小说正文；修为若存在阶段变化，以“相遇时/主要阶段”优先。',
    noteEn: data.noteEn ?? 'Original encyclopedia notes only; if cultivation changes, the meeting or main arc takes priority.'
  }
}

const characterProfileCatalog = new Map(Object.entries({
  'han-li': characterProfile({
    encounterZh: '全书主角；10岁左右入七玄门，21岁血色禁地，217岁结婴，1007岁入灵界，约11190岁飞升仙界。',
    encounterEn: 'The protagonist: about age 10 enters Qixuanmen, 21 Blood Forbidden Land, 217 Nascent Soul, 1007 Spirit Realm, about 11190 Immortal Realm.',
    realmZh: '从凡人、炼气一路至仙界顶层；具体境界随时间线推进。',
    realmEn: 'Progresses from mortal and Qi Refining into the top Immortal World layer across the timeline.',
    identityZh: '主角、散修/宗门弟子/跨界修士/仙界重要变量。',
    identityEn: 'Protagonist, rogue or sect cultivator, cross-realm cultivator, and a major immortal-world variable.',
    artsZh: '长春功、青元剑诀、大衍诀、梵圣真魔功、炼神术、真言化轮经/大五行幻世诀等。',
    artsEn: 'Everlasting Spring Art, Azure Essence Sword Art, Great Development Art, Brahma Saint True Demon Art, Spirit Refining Art, Mantra Wheel / Great Five Elements inheritance.',
    relationZh: '所有人物关系的中心。',
    relationEn: 'The center of the relationship web.',
    outcomeZh: '终局承接时间、轮回、真言门和道祖体系的主线。',
    outcomeEn: 'The finale gathers the time, reincarnation, True Word Sect, and Dao Ancestor threads through him.',
    ageZh: '年龄线采用阶段估算：人界约10-1007岁，灵界约1007-11190岁，仙界篇约11190岁以后。'
  }),
  'nangong-wan': characterProfile({
    encounterZh: '人界血色禁地试炼中与韩立结缘；返回天南后感情线正式加深，后续横跨人界、灵界和仙界因果线。',
    encounterEn: 'Forms her bond with Han Li during the Mortal Realm Blood Forbidden Land trial; the relationship deepens after the Heavenly South return and continues into Spirit / Immortal karma.',
    realmZh: '初遇时高于韩立，属掩月宗结丹层级人物；天南重逢、结婴后长期与韩立境界差距变化，仙界篇重点转入前世因果而非简单修为表。',
    realmEn: 'At first meeting she is above Han Li around the Masking Moon Core Formation layer; later gaps shift through Heavenly South and Nascent Soul arcs, while the sequel emphasizes past-life karma more than a simple realm table.',
    identityZh: '掩月宗重要女修，韩立正缘/道侣，仙界篇轮回因果核心人物之一。',
    identityEn: 'Important Masking Moon Sect cultivator, Han Li principal dao-companion thread, and a key reincarnation-karma figure in the sequel.',
    artsZh: '掩月宗女修传承、合欢/炉鼎风险背景下的自保与宗门线；仙界篇牵入轮回殿主、蛟三和前世轮回因果。',
    artsEn: 'Masking Moon female-cultivator inheritance and survival within sect politics; in the sequel she ties into the Palace Master, Jiao San, and past-life reincarnation karma.',
    relationZh: '韩立最重要的道侣之一；与轮回殿主、蛟三身世线存在前世亲缘因果牵连。',
    relationEn: 'One of Han Li most important dao companions; connected with the Reincarnation Palace Master and Jiao San through past-life kinship karma.',
    outcomeZh: '长期情感线并入终局关系网；她不是单纯“早期女主”，也是仙界篇轮回线的关键锚点。',
    outcomeEn: 'Her long emotional thread joins the endgame relationship web; she is not merely an early heroine but a key anchor of the sequel reincarnation thread.'
  }),
  'doctor-mo': characterProfile({
    encounterZh: '人界开篇七玄门阶段收韩立入药园并传授长春功，是韩立第一次接触修仙门槛的引路人兼危险源。',
    encounterEn: 'In the Qixuanmen opening, he brings Han Li into the medicine garden and teaches the Everlasting Spring Art, becoming both first guide and danger source.',
    realmZh: '本体为凡俗江湖医者与修仙残魂/夺舍线缠绕的人物；对少年韩立而言是压倒性威胁，具体修为以开篇夺舍段为准。',
    realmEn: 'A martial-world doctor entangled with remnant-soul / possession threads; to young Han Li he is an overwhelming threat, with exact cultivation tied to the opening possession segment.',
    identityZh: '七玄门神手谷医师，墨府因果源头，夺舍危机制造者。',
    identityEn: 'Qixuanmen medicine-garden doctor, root of the Mo-household aftermath, and creator of the possession crisis.',
    artsZh: '长春功、医毒手段、夺舍秘术、七鬼噬魂大法相关线索。',
    artsEn: 'Everlasting Spring Art, medicine-poison methods, possession arts, and Seven-Ghost Soul-Devouring Art clues.',
    relationZh: '既是韩立修仙启蒙者，也是第一个真正要夺命夺身的敌人；直接塑造韩立谨慎、不轻信、留后手的性格底色。',
    relationEn: 'Both Han Li first cultivation initiator and first enemy who truly seeks his body and life; he directly forms Han Li caution, distrust, and backup habit.',
    outcomeZh: '被韩立反制后，墨府余波仍牵动韩立早期人情线。',
    outcomeEn: 'After Han Li counters him, the Mo household aftermath still shapes early human ties.'
  }),
  'zi-ling': characterProfile({
    encounterZh: '乱星海妙音门相关阶段与韩立多次交集，后续跨越魔界/仙界相关重逢线。',
    encounterEn: 'Intersects Han Li through the Chaotic Star Sea and Miao Yin Sect thread, with later reunion threads.',
    realmZh: '初遇时属乱星海低中阶女修圈层；后续随机缘和跨界线提升，具体境界待逐章细标。',
    realmEn: 'At first meeting she belongs to the lower-to-middle Chaotic Star Sea cultivator layer; later rises through opportunities.',
    identityZh: '妙音门相关人物，韩立重要情感线人物。',
    identityEn: 'Miao Yin Sect-related figure and an important emotional thread for Han Li.',
    artsZh: '妙音门/女修传承、魅惑与身份经营类线索；后续涉及更高界面资源。',
    artsEn: 'Miao Yin Sect / female-cultivator inheritance, identity-management motifs, and later higher-realm resources.',
    relationZh: '与韩立从乱星海因缘延续到后期；最终成为韩立道侣之一。',
    relationEn: 'Her bond with Han Li begins in the Chaotic Star Sea and eventually becomes part of his dao-companion relationship.',
    outcomeZh: '不是普通支线女修，应在人物关系图中和南宫婉、元瑶并列标注。',
    outcomeEn: 'She is not a minor side figure and should be mapped alongside Nangong Wan and Yuan Yao.'
  }),
  'yuan-yao': characterProfile({
    encounterZh: '人界乱星海阶段与韩立相识，虚天殿、阴冥之地和鬼道线多次回流；啼魂兽也由她赠予韩立。',
    encounterEn: 'Meets Han Li in the Mortal Realm Chaotic Star Sea arc; Void Heaven Hall, underworld-like spaces, and ghost-path threads later loop back, and she gives Weeping Soul to Han Li.',
    realmZh: '初遇时为乱星海女修，低于当时高阶老怪；后续为保妍丽等旧缘转入鬼道/阴魂线，境界随长线提升，精确小境界待逐章核对。',
    realmEn: 'At first meeting she is a Chaotic Star Sea female cultivator below the old-monster tier; later moves into ghost-path / yin-soul threads for old ties such as Yan Li, with exact minor realms pending.',
    identityZh: '乱星海女修，妍丽好友，鬼道与阴冥线关键人物。',
    identityEn: 'Chaotic Star Sea cultivator, Yan Li close companion, and key figure in ghost-path / underworld motifs.',
    artsZh: '鬼道功法、阴魂保命/转修线索、啼魂兽因果、阴冥之地相关手段。',
    artsEn: 'Ghost-path arts, yin-soul survival / conversion threads, Weeping Soul karma, and underworld-space methods.',
    relationZh: '与韩立长期互有交集和援手；她让乱星海支线延伸到灵界魂魄与轮回主题。',
    relationEn: 'Has long-running intersections and mutual aid with Han Li; she extends the Chaotic Star Sea thread into Spirit Realm soul and reincarnation themes.',
    outcomeZh: '后续应与啼魂、阴冥之地、鬼道功法并列维护。',
    outcomeEn: 'Should be maintained alongside Weeping Soul, underworld spaces, and ghost-path arts.'
  }),
  'silvermoon': characterProfile({
    encounterZh: '人界后期以器灵/元神相关形态进入韩立身边，随后牵出玲珑、妖族和灵界重逢线。',
    encounterEn: 'Enters Han Li side in the late Mortal Realm through artifact-spirit / soul-form threads, later revealing Ling Long, demon-race identity, and Spirit Realm reunion lines.',
    realmZh: '初随韩立时主要以器灵/元神状态行动；真实身份和完整修为在妖族、灵界线中逐步恢复，具体阶段待逐章核对。',
    realmEn: 'Initially acts beside Han Li as an artifact-spirit / soul state; true identity and full cultivation recover through demon-race and Spirit Realm threads.',
    identityZh: '器灵线重要人物，后续关联银月狼族/玲珑身份和妖族高层因果。',
    identityEn: 'Important artifact-spirit figure, later tied to Silvermoon wolf / Ling Long identity and high-level demon-race karma.',
    artsZh: '器灵、元神寄附、妖族血脉、灵界妖族传承。',
    artsEn: 'Artifact-spirit state, soul attachment, demon bloodline, and Spirit Realm demon inheritance.',
    relationZh: '与韩立从法宝伙伴关系发展为跨界旧识；她把法宝、元神和妖族身份三条线合并。',
    relationEn: 'Develops from artifact companion to cross-realm old acquaintance; she merges treasure, soul, and demon-identity threads.',
    outcomeZh: '灵界阶段应与冰凤、敖啸老祖和妖族高层一起标注。',
    outcomeEn: 'In the Spirit Realm arc she should be marked with Ice Phoenix, Ao Xiao Ancestor, and demon-race senior circles.'
  }),
  'dayan-divine-lord': characterProfile({
    encounterZh: '人界中后期通过大衍诀、傀儡术和残存元神/传承线与韩立相连。',
    encounterEn: 'Connects to Han Li in the middle-late Mortal Realm through the Great Development Art, puppet arts, and remnant-soul / inheritance threads.',
    realmZh: '人界顶尖神识与傀儡传承人物；相遇时多通过残存意识和传承状态呈现，生前修为需逐章核对。',
    realmEn: 'A top Mortal Realm divine-sense and puppet-inheritance figure; at Han Li encounter he appears mainly through remnant awareness and lineage, with lifetime realm pending.',
    identityZh: '大衍诀传承核心，千竹教/傀儡体系背后的关键人物。',
    identityEn: 'Core inheritor-source of the Great Development Art and key figure behind the Thousand Bamboo / puppet system.',
    artsZh: '大衍诀、神识强化、分神操控、傀儡术。',
    artsEn: 'Great Development Art, divine-sense strengthening, split-control methods, and puppet arts.',
    relationZh: '对韩立的神识、傀儡和技术型战力影响很深，是“资源+技艺”路线的重要导师式人物。',
    relationEn: 'Deeply affects Han Li divine sense, puppets, and technical combat style, acting as a mentor-like node for the resource-plus-craft route.',
    outcomeZh: '人界中后期档案应与傀儡术、千竹教、坠魔谷和韩立神识成长互链。',
    outcomeEn: 'His late-Mortal file should cross-link puppet arts, Thousand Bamboo Sect, Demonfall Valley, and Han Li divine-sense growth.'
  }),
  'xiang-zhili': characterProfile({
    encounterZh: '人界中后期以隐藏高阶修士身份多次露面，逐步揭开化神修士和飞升门槛的存在。',
    encounterEn: 'Appears repeatedly in the middle-late Mortal Realm as a hidden high-level cultivator, gradually revealing Spirit Transformation cultivators and the ascension threshold.',
    realmZh: '人界化神层级代表人物；对当时韩立而言属于更高圈层，具体阶段按大晋/空间节点线核对。',
    realmEn: 'A representative Mortal Realm Spirit Transformation cultivator, above Han Li at the relevant stage; exact phase should be checked through Great Jin / spatial-node arcs.',
    identityZh: '人界隐藏老怪与飞升探索者。',
    identityEn: 'Hidden Mortal Realm old monster and ascension seeker.',
    artsZh: '化神修士手段、空间节点与飞升经验。',
    artsEn: 'Spirit Transformation methods, spatial-node and ascension experience.',
    relationZh: '不是韩立身边人，但多次提示人界上限和飞升风险，影响韩立对后续道路的判断。',
    relationEn: 'Not a close companion, but repeatedly signals the Mortal Realm ceiling and ascension risk, shaping Han Li path judgment.',
    outcomeZh: '应放在人界后期老怪生态，而非早期宗门人物。',
    outcomeEn: 'Belongs in the late-Mortal old-monster ecology rather than early sect cast.'
  }),
  'ice-phoenix': characterProfile({
    encounterZh: '人界后期与韩立发生交集，并在灵界阶段继续承接妖族、真灵血脉和跨界重逢线。',
    encounterEn: 'Intersects Han Li in the late Mortal Realm and continues into Spirit Realm demon-race, true-spirit bloodline, and cross-realm reunion threads.',
    realmZh: '初遇时为冰凤/妖族高阶存在，对当时韩立有明显境界压力；灵界阶段随妖族大乘和真灵线继续提升。',
    realmEn: 'At first meeting she is a high-level Ice Phoenix / demon figure who pressures Han Li; in the Spirit Realm she continues through demon Great-Ascension and true-spirit threads.',
    identityZh: '冰凤一族/妖族高阶人物，真灵血脉线代表之一。',
    identityEn: 'Ice Phoenix / demon-race high-level figure and a representative true-spirit-bloodline node.',
    artsZh: '冰寒神通、天凤/真灵血脉、妖族传承。',
    artsEn: 'Ice-cold abilities, heavenly phoenix / true-spirit bloodline, and demon-race inheritance.',
    relationZh: '与韩立既有敌我压力，也有跨界后的旧识关系；适合与银月、敖啸老祖并读。',
    relationEn: 'Has both adversarial pressure and later old-acquaintance ties with Han Li; read with Silvermoon and Ao Xiao Ancestor.',
    outcomeZh: '灵界篇应标在人妖两族与真灵血脉地图中。',
    outcomeEn: 'In the Spirit Realm arc, she belongs on the human-demon and true-spirit bloodline map.'
  }),
  'qing-yuanzi': characterProfile({
    encounterZh: '灵界后期通过青元剑诀传承、绿元宫和韩立剑修路线发生交集。',
    encounterEn: 'Intersects Han Li in the late Spirit Realm through the Azure Essence Sword Art lineage, Green Origin Palace, and Han Li sword-cultivation route.',
    realmZh: '灵界高阶大能层级，具体小境界按灵界后期逐章核对。',
    realmEn: 'A high-level Spirit Realm power; exact minor realm should be checked in late Spirit Realm chapters.',
    identityZh: '青元剑诀高阶传承人物，绿元宫相关大能。',
    identityEn: 'High-level Azure Essence Sword Art lineage figure and Green Origin Palace power.',
    artsZh: '青元剑诀高阶传承、剑道/飞剑体系、灵界高阶洞府与传承资源。',
    artsEn: 'High-level Azure Essence Sword Art lineage, sword / flying-sword system, and Spirit Realm inheritance resources.',
    relationZh: '与韩立的关系偏传承和交易协作，让早年剑诀线在灵界获得更高层解释。',
    relationEn: 'His relation with Han Li is inheritance and cooperation, giving the early sword-art line a higher Spirit Realm explanation.',
    outcomeZh: '应与青元剑诀、青竹蜂云剑、灵界后期大乘线互链。',
    outcomeEn: 'Should cross-link Azure Essence Sword Art, Bamboo Cloudswarm Swords, and late Spirit Great-Ascension threads.'
  }),
  'baohua': characterProfile({
    encounterZh: '灵界后期魔劫与魔界远行线中与韩立交集，身份和立场逐步区别于单纯入侵魔族。',
    encounterEn: 'Intersects Han Li in the late Spirit Realm Devil Calamity and Devil Realm journey, with a position distinct from simple invading devils.',
    realmZh: '魔族圣祖级人物，曾处魔界顶层；相遇时状态与伤势/恢复有关，具体阶段待逐章核对。',
    realmEn: 'A Devil Sacred Ancestor-level figure formerly at the top of Devil Realm; her meeting-stage state depends on injury / recovery and needs chapter checking.',
    identityZh: '魔族三大始祖/顶层圣祖线代表之一，魔界政治核心人物。',
    identityEn: 'Representative of the top Devil Sacred Ancestor line and a core Devil Realm political figure.',
    artsZh: '魔族高阶功法、灵域/玄天级资源关联、魔界权力布局。',
    artsEn: 'High-level devil arts, spiritual-domain / Xuantian-resource ties, and Devil Realm power schemes.',
    relationZh: '与韩立不是单线敌对，既有利用、交易和共同利益，也牵动元刹、六极等圣祖关系。',
    relationEn: 'Not a one-note enemy to Han Li; there are use, trade, shared interests, and Sacred Ancestor relations such as Yuan Cha and Six Extremes.',
    outcomeZh: '魔界篇人物页应把她作为复杂阵营核心，而非普通反派。',
    outcomeEn: 'Devil Realm pages should treat her as a complex faction core, not a generic antagonist.'
  }),
  'yuan-cha': characterProfile({
    encounterZh: '从人界古魔封印余波到灵界魔劫线持续存在，是韩立面对魔族跨界压力的重要圣祖级对手。',
    encounterEn: 'Persists from Mortal Realm ancient-devil seal aftermath into the Spirit Realm Devil Calamity, acting as a major Sacred-Ancestor-level pressure against Han Li.',
    realmZh: '魔族圣祖级；人界阶段多通过分念/分身/封印余波呈现，灵界魔劫线再进入更完整的圣祖压力。',
    realmEn: 'Sacred-Ancestor level; in the Mortal Realm she often appears through split will / avatar / seal aftermath, later becoming fuller Sacred-Ancestor pressure in the Devil Calamity.',
    identityZh: '元刹圣祖，魔族跨界布局代表。',
    identityEn: 'Yuan Cha Sacred Ancestor, representative of devil cross-realm schemes.',
    artsZh: '魔功、分念/分身、真魔气、古魔封印与魔界资源。',
    artsEn: 'Devil arts, split will / avatars, true devil Qi, ancient-devil seals, and Devil Realm resources.',
    relationZh: '是韩立早中期认识魔族威胁的重要敌对节点，后续和宝花、六极构成圣祖关系网。',
    relationEn: 'An important hostile node through which Han Li learns devil-race danger; later part of the Sacred Ancestor web with Baohua and Six Extremes.',
    outcomeZh: '应从昆吾山/古魔、人界封印、灵界魔劫和魔界远行四处串联。',
    outcomeEn: 'Should be connected through Kunwu / ancient devils, Mortal Realm seals, Spirit Devil Calamity, and Devil Realm journey.'
  }),
  'six-extremes': characterProfile({
    encounterZh: '灵界后期魔劫与魔界线中出现，常通过分身、替身和魔族高层布局制造压力。',
    encounterEn: 'Appears in the late Spirit Realm Devil Calamity and Devil Realm threads, often applying pressure through avatars, substitutes, and high-level devil schemes.',
    realmZh: '魔族圣祖级人物；具体相遇时因本体/分身差异需要逐章区分。',
    realmEn: 'Devil Sacred Ancestor level; meeting strength must be separated by main body versus avatar in chapter checks.',
    identityZh: '六极圣祖，魔界高层势力人物。',
    identityEn: 'Six Extremes Sacred Ancestor, high-level Devil Realm power.',
    artsZh: '分身化身术、魔族高阶功法、魔界势力调度。',
    artsEn: 'Avatar / clone methods, high-level devil arts, and Devil Realm faction command.',
    relationZh: '与韩立多为敌对或利益冲突，也通过宝花、元刹等关系补足魔界政治层。',
    relationEn: 'Mostly hostile or interest-conflicting with Han Li, while helping complete the Devil Realm political layer with Baohua and Yuan Cha.',
    outcomeZh: '人物页应标明本体与分身差异，避免把所有出场统一成一个修为值。',
    outcomeEn: 'The page should distinguish main body and avatars rather than flattening every appearance into one realm value.'
  }),
  'jiao-san': characterProfile({
    encounterZh: '仙界篇轮回殿任务网络中登场，与韩立多次因任务和身份伪装发生交集。',
    encounterEn: 'Appears through Reincarnation Palace mission networks in the sequel and intersects Han Li through missions and disguised identities.',
    realmZh: '仙人体系中轮回殿核心成员；相遇时具体小境界待逐章核对，本轮先标为仙界篇高阶任务人物。',
    realmEn: 'A core Reincarnation Palace member in the immortal system; exact minor stage at meeting remains chapter-level work.',
    identityZh: '轮回殿核心成员；重要身世为轮回殿主与南宫婉前世所生之女。',
    identityEn: 'Core Reincarnation Palace member; crucially, the daughter of the Palace Master and Nangong Wan past-life identity.',
    artsZh: '轮回殿任务体系、身份伪装、轮回因果线相关手段。',
    artsEn: 'Reincarnation Palace mission methods, disguised identities, and reincarnation-karma methods.',
    relationZh: '与韩立既有轮回殿合作/任务交集，也通过南宫婉前世和轮回殿主牵入核心亲缘因果。',
    relationEn: 'Connected to Han Li through missions and cooperation, and through Nangong Wan past-life and Palace Master kinship karma.',
    outcomeZh: '她是仙界篇人物关系图的关键节点，不能只写成普通“轮回殿成员”。',
    outcomeEn: 'She is a key relationship node in the sequel and should not be reduced to a generic member.'
  }),
  'reincarnation-palace-master': characterProfile({
    encounterZh: '仙界篇中后期逐步显露，轮回殿、天庭和终局大道冲突的核心人物。',
    encounterEn: 'Gradually emerges in the middle-late sequel as a core figure of Reincarnation Palace, Heavenly Court conflict, and the endgame Dao struggle.',
    realmZh: '道祖级/顶层大能线索，围绕轮回法则展开。',
    realmEn: 'Dao-Ancestor-level or top-layer figure tied to reincarnation law.',
    identityZh: '轮回殿最高层人物；与南宫婉前世、蛟三身世和韩立终局因果强相关。',
    identityEn: 'Top Reincarnation Palace figure, strongly tied to Nangong Wan past-life karma, Jiao San identity, and Han Li endgame.',
    artsZh: '轮回法则、轮回殿组织体系、对抗天庭的长期布局。',
    artsEn: 'Reincarnation law, Reincarnation Palace organization, and long resistance against Heavenly Court.',
    relationZh: '既是韩立仙界篇最大因果节点之一，也牵动南宫婉和蛟三关系线。',
    relationEn: 'One of Han Li largest sequel karmic nodes and the pivot for Nangong Wan and Jiao San relationship lines.',
    outcomeZh: '终局层面与古或今、韩立、天庭秩序形成核心对照。',
    outcomeEn: 'In the finale, he forms a core contrast with Gu Huojin, Han Li, and Heavenly Court order.'
  }),
  'gu-huajin': characterProfile({
    encounterZh: '仙界篇顶层冲突线逐步显露；与真言门覆灭和终局时间大道冲突直接相关。',
    encounterEn: 'Emerges through the top sequel conflict and is directly tied to True Word Sect fall and the final time-Dao struggle.',
    realmZh: '时间道祖级存在。',
    realmEn: 'Time Dao Ancestor-level existence.',
    identityZh: '天庭/仙界秩序顶层人物，时间法则最高压迫源之一。',
    identityEn: 'A top Heavenly Court / immortal-order figure and one of the highest pressure sources of time law.',
    artsZh: '时间法则、道祖位格、天庭秩序。',
    artsEn: 'Time law, Dao Ancestor status, and Heavenly Court order.',
    relationZh: '与韩立终局对抗；与弥罗老祖之死、真言门覆灭和奇摩子背叛链相连。',
    relationEn: 'Endgame opponent to Han Li; tied to Mi Luo death, True Word Sect fall, and Qi Mozi betrayal chain.',
    outcomeZh: '仙界篇最高层矛盾的关键人物。',
    outcomeEn: 'A key figure in the sequel highest-level contradiction.'
  }),
  'qi-mozi': characterProfile({
    encounterZh: '仙界篇北寒/真言门相关线中成为韩立重要追索压力，真言门历史在遗迹线被揭开。',
    encounterEn: 'Becomes a major pursuit pressure around North Cold / True Word threads, while his True Word history is revealed through ruins.',
    realmZh: '大罗中期；相遇时对韩立构成显著越阶压迫。',
    realmEn: 'Middle Great Luo; at meeting he greatly outranks Han Li.',
    identityZh: '弥罗老祖二弟子，真言门叛徒；后投靠天庭，曾为星官并执掌仙狱，后为仙域域主级人物。',
    identityEn: 'Mi Luo Ancestor second disciple and True Word Sect traitor; later joins Heavenly Court, serves as a star official / prison authority, and becomes a domain-lord-level figure.',
    artsZh: '火属性时间法则，断时流火集。',
    artsEn: 'Fire-aspected time law, Severing-Time Flowing-Fire scripture.',
    relationZh: '韩立继承真言门传承后，奇摩子成为旧账与现实追杀的交汇点。',
    relationEn: 'After Han Li inherits True Word lineage, Qi Mozi becomes the intersection of old debt and present pursuit.',
    outcomeZh: '真言门覆灭链条中的核心背叛者。',
    outcomeEn: 'The central betrayer in the fall of True Word Sect.'
  }),
  'mi-luo-ancestor': characterProfile({
    encounterZh: '韩立通过时空/遗迹线两次接触其讲道与传承，后被隔世收入门下。',
    encounterEn: 'Han Li encounters his teaching and inheritance through time/ruin threads and is accepted across time.',
    realmZh: '大罗后期；主修时间法则。',
    realmEn: 'Late Great Luo; cultivates time law.',
    identityZh: '真言门末代宗主，弥罗仙尊。',
    identityEn: 'Last master of True Word Sect, also known as Mi Luo Immortal Venerable.',
    artsZh: '大五行幻世诀，真言门时间法则总纲；门下五大亲传分修五行时间法则。',
    artsEn: 'Great Five Elements Illusory World Art and the True Word time-law system; five direct disciples split five-element time-law inheritances.',
    relationZh: '韩立隔世师尊；其衣钵由韩立继承并重建真言门。',
    relationEn: 'Han Li cross-time master; his lineage is inherited and rebuilt by Han Li.',
    outcomeZh: '被古或今击杀；真言门因天庭剿灭而覆灭。',
    outcomeEn: 'Killed by Gu Huojin; True Word Sect falls under Heavenly Court suppression.',
    noteZh: '章节参考点：仙界篇约247章讲道、550章辛秘、1152章拜师等事件段。'
  }),
  'mu-yan': characterProfile({
    encounterZh: '真言门历史回溯和弥罗弟子关系中出现。',
    encounterEn: 'Appears through True Word Sect historical recall and Mi Luo disciple relations.',
    realmZh: '真言门亲传弟子层级，具体小境界待逐章核对。',
    realmEn: 'Direct-disciple layer of True Word Sect; exact minor stage pending.',
    identityZh: '弥罗老祖大弟子。',
    identityEn: 'Mi Luo Ancestor first disciple.',
    artsZh: '木属性时间法则，东乙枯荣经。',
    artsEn: 'Wood-aspected time law, Eastern Yi Wither-Bloom Scripture.',
    relationZh: '与韩立通过真言门传承链间接相连。',
    relationEn: 'Indirectly connected to Han Li through True Word inheritance.',
    outcomeZh: '真言门大战前后因奇摩子背叛链而陨落。',
    outcomeEn: 'Dies around the True Word catastrophe due to the Qi Mozi betrayal chain.'
  }),
  'wu-yang': characterProfile({
    encounterZh: '前传七玄门同辈线留下人物因果，仙界篇通过轮回殿身份回流。',
    encounterEn: 'Begins as an early Qixuanmen-era karmic thread and returns through Reincarnation Palace identity in the sequel.',
    realmZh: '前传阶段从结丹到元婴线索；仙界篇为轮回殿高层身份，具体境界待逐章核对。',
    realmEn: 'Original-novel thread moves from Core Formation to Nascent Soul; in the sequel he has a high Reincarnation Palace identity.',
    identityZh: '前传七玄门/御灵宗相关人物；仙界篇轮回殿高层线索。',
    identityEn: 'Qixuanmen / Spirit Control Sect-related original-novel figure; sequel Reincarnation Palace senior thread.',
    artsZh: '御灵宗、灵兽/御灵相关路线；真言门历史中与幻尘宝典线有关。',
    artsEn: 'Spirit-control / beast-control route; tied in the sequel to Phantom Star Manual thread.',
    relationZh: '与韩立从早期同辈因果延伸到仙界篇阵营交集。',
    relationEn: 'Extends from early peer karma with Han Li into sequel faction intersections.',
    outcomeZh: '作为跨书回流人物，应在人物关系图单独标注。',
    outcomeEn: 'As a cross-book returning figure, he should be marked separately in the relationship map.'
  }),
  'jin-yuanzi': characterProfile({
    encounterZh: '真言门历史和传承分支中出现。',
    encounterEn: 'Appears in True Word Sect history and inheritance branches.',
    realmZh: '真言门亲传弟子层级；后续修道有成，具体境界待逐章核对。',
    realmEn: 'Direct-disciple layer; later attains a high level, exact stage pending.',
    identityZh: '弥罗老祖亲传，金属性时间法则一脉。',
    identityEn: 'Mi Luo direct disciple, metal-aspected time-law branch.',
    artsZh: '真言化轮经。',
    artsEn: 'Mantra Wheel Scripture.',
    relationZh: '与韩立通过真言化轮经传承线相连。',
    relationEn: 'Connected to Han Li through the Mantra Wheel Scripture lineage.',
    outcomeZh: '传闻挑战时间道祖失败后失去踪迹。',
    outcomeEn: 'Reportedly disappears after failing to challenge the Time Dao Ancestor.'
  }),
  'he-ze': characterProfile({
    encounterZh: '韩立进入水衍宫相关遗迹时触发其残存传承线。',
    encounterEn: 'Han Li triggers his remaining inheritance thread in the Water Derivation Palace ruins.',
    realmZh: '真言门亲传弟子层级，具体小境界待逐章核对。',
    realmEn: 'Direct-disciple layer of True Word Sect; exact minor stage pending.',
    identityZh: '弥罗老祖五弟子，水属性时间法则一脉。',
    identityEn: 'Mi Luo Ancestor fifth disciple, water-aspected time-law branch.',
    artsZh: '水衍四时诀；光阴之水相关传承。',
    artsEn: 'Water Derivation Four Seasons Art and time-water inheritance.',
    relationZh: '向韩立传下水衍四时诀并留下“杀奇摩子”的旧怨请求。',
    relationEn: 'Passes the Water Derivation Four Seasons Art to Han Li and leaves the old request concerning Qi Mozi.',
    outcomeZh: '随着遗留力量消散，是韩立补全真言门传承的重要节点。',
    outcomeEn: 'Fades with his remaining power and becomes a key node in Han Li completing True Word inheritance.',
    noteZh: '章节参考点：仙界篇约665章、678章相关事件段。'
  }),
  'crab-daoist': characterProfile({
    encounterZh: '灵界后期魔界远行中与韩立结下主仆/约定关系，仙界篇开局又以残损仙傀核心形式保护韩立并延续同行。',
    encounterEn: 'Bonds with Han Li during the late Spirit Realm Devil Realm journey through an agreement-like master-servant relation; in the sequel opening he protects Han Li through a damaged immortal-puppet core thread.',
    realmZh: '初为拥有自主灵智的完整仙傀，出手需大量仙元石支撑；仙界篇恢复后有金仙级傀儡、雷之法则和后续道祖级石空解身世线。',
    realmEn: 'Initially a self-aware complete immortal puppet whose attacks require large immortal-origin-stone support; later regains Golden-Immortal puppet strength, thunder-law methods, and the Dao-Ancestor-level Shi Kongjie identity thread.',
    identityZh: '黄金巨蟹仙傀，后续揭为魔域魔君石空解/积鳞空境相关核心人物。',
    identityEn: 'Golden-crab immortal puppet; later revealed as the Devil Domain lord Shi Kongjie and a core Accumulated Scale Realm figure.',
    artsZh: '仙傀之身、傀儡核心、雷之法则、傀儡法则、积鳞空境本源相关能力。',
    artsEn: 'Immortal-puppet body, puppet core, thunder law, puppet law, and Accumulated Scale Realm source power.',
    relationZh: '早期是韩立重要护身战力，后期从“傀儡助力”升级为并肩作战的高阶盟友。',
    relationEn: 'Starts as a major protective combat asset for Han Li and later becomes a high-level ally fighting beside him.',
    outcomeZh: '应从魔界远行、仙界失忆重启、灰界/积鳞空境、终局魔域关系四段连续追踪。',
    outcomeEn: 'Should be tracked through four stages: Devil Realm journey, sequel memory-loss restart, Gray / Accumulated Scale Realm, and endgame Devil Domain relations.'
  }),
  'weeping-soul-character': characterProfile({
    encounterZh: '人界乱星海阶段由元瑶赠予韩立，最初作为啼魂兽随身成长；阴冥之地、灵界和仙界篇多次在魂魄类危机中发挥作用。',
    encounterEn: 'Given to Han Li by Yuan Yao in the Mortal Realm Chaotic Star Sea arc, initially growing as the Weeping Soul Beast; later crucial in underworld-like, Spirit Realm, and sequel soul crises.',
    realmZh: '人界为灵兽/刑兽幼弱形态，专克鬼物阴魂；灵界继续成长，仙界篇可化形并牵出刑兽血脉、冥王转世和鬼道高阶身份。',
    realmEn: 'In the Mortal Realm she is a young spirit beast / punishment-beast form countering ghosts and yin souls; by the sequel she can transform and reveals punishment-beast bloodline, Nether King reincarnation, and high-level ghost-path identity.',
    identityZh: '韩立长期灵兽伙伴，刑兽血脉，仙界篇冥王转世线关键人物。',
    identityEn: 'Long-term spirit-beast companion of Han Li, punishment-beast bloodline, and key sequel Nether King reincarnation figure.',
    artsZh: '吞噬魂魄、克制鬼物、刑兽血脉、噬魂/鬼道法则线索。',
    artsEn: 'Soul devouring, ghost suppression, punishment-beast bloodline, and soul-devouring / ghost-path law clues.',
    relationZh: '韩立身边时间最久的伙伴之一，多次救场；和元瑶、阴冥之地、冥界线都必须互链。',
    relationEn: 'One of Han Li longest-running companions and frequent rescuer; must cross-link Yuan Yao, underworld spaces, and netherworld threads.',
    outcomeZh: '仙界篇后期身世揭示后，人物页需按“人界得兽 -> 灵界成长 -> 仙界冥王线”整理。',
    outcomeEn: 'After the sequel identity reveal, the page should read as "Mortal acquisition -> Spirit growth -> Immortal netherworld reveal".'
  }),
  'golden-child': characterProfile({
    encounterZh: '仙界篇中韩立与失散的噬金虫王重逢后，噬金仙化形为金童并成为重要同行者。',
    encounterEn: 'After Han Li reunites with the lost Gold-Devouring Beetle King in the sequel, the Gold-Devouring Immortal transforms as Golden Child and becomes a major companion.',
    realmZh: '由噬金虫群/虫王成长为噬金仙；吞噬同类后不断进阶，关键阶段可达太乙、大罗乃至道祖旧账层面，具体节点待逐章核对。',
    realmEn: 'Grows from the gold-devouring beetle swarm / king into a Gold-Devouring Immortal; through devouring peers she advances through Taiyi / Great Luo and Dao-Ancestor karma, with exact nodes pending.',
    identityZh: '韩立长期灵虫养成线的化形人物，噬金仙体系核心。',
    identityEn: 'The personified result of Han Li long spirit-insect cultivation line and a core Gold-Devouring Immortal figure.',
    artsZh: '吞噬五金与仙材、噬金虫王进阶、吞噬法则、噬金仙互噬宿命。',
    artsEn: 'Devouring metals and immortal materials, beetle-king evolution, devouring law, and the fate of Gold-Devouring Immortals devouring one another.',
    relationZh: '既像韩立养成出的伙伴，也能独立推动仙界篇噬金仙和九元观等高阶冲突。',
    relationEn: 'Both Han Li nurtured companion and an independent driver of sequel Gold-Devouring Immortal / Nine Origin conflicts.',
    outcomeZh: '应与噬金虫、噬金虫王、吞噬法则和金源/九元观线持续互链。',
    outcomeEn: 'Should remain cross-linked with Gold-Devouring Beetles, the Beetle King, devouring law, and Gold-Origin / Nine Origin threads.'
  }),
  'liu-le-er': characterProfile({
    encounterZh: '仙界篇开局在小南洲/灵寰界阶段照顾失忆重伤的韩立，称其为“石头哥哥”。',
    encounterEn: 'In the sequel opening around Xiaonanzhou / Spirit Domain lower-interface stages, she cares for the badly injured amnesiac Han Li and calls him "Stone Brother".',
    realmZh: '初遇时为云狐族少女，修为低于仙界主战层；后续随血脉与天狐一族线提升，具体境界待逐章核对。',
    realmEn: 'At first she is a young Cloud Fox girl below the main immortal combat layer; later rises through bloodline and Heavenly Fox threads, exact realm pending.',
    identityZh: '云狐族/天狐血脉相关人物，仙界篇开局人情线核心。',
    identityEn: 'Cloud Fox / Heavenly Fox bloodline figure and core emotional anchor of the sequel opening.',
    artsZh: '云狐族血脉、幻术/天狐传承、仙界低处求生线索。',
    artsEn: 'Cloud Fox bloodline, illusion / Heavenly Fox inheritance, and low-level sequel survival threads.',
    relationZh: '在韩立最虚弱、失忆的阶段救助并陪伴他；不是普通开局路人。',
    relationEn: 'Shelters and accompanies Han Li when he is weakest and amnesiac; not a generic opening bystander.',
    outcomeZh: '后续应和小南洲、灵寰界、天狐一族和韩立恢复记忆线并列标注。',
    outcomeEn: 'Should be indexed with Xiaonanzhou, Spirit Domain, Heavenly Fox, and Han Li memory-recovery threads.'
  }),
  'hu-yan-daoist': characterProfile({
    encounterZh: '仙界篇早期黑风海、烛龙道和后续仙界漂泊线中与韩立结交，是韩立少数较能交心的仙界友人之一。',
    encounterEn: 'Befriends Han Li through early sequel Black Wind Sea, Candle Dragon Dao, and later wandering threads, becoming one of Han Li few closer immortal friends.',
    realmZh: '早期为真仙/金仙层级相关修士，后续修为有起落，精确阶段待逐章核对。',
    realmEn: 'Early tied to True / Golden Immortal layers, with later rises and declines; exact stages pending.',
    identityZh: '黑风海/烛龙道相关散修式人物，云霓、白素媛等人情线的中心。',
    identityEn: 'Black Wind Sea / Candle Dragon Dao-associated rogue-like cultivator and center of Yun Ni / Bai Suyuan personal threads.',
    artsZh: '火系/仙界散修手段、洞府经营、保命与人情线资源。',
    artsEn: 'Fire-associated / rogue immortal methods, cave-residence management, survival and personal-tie resources.',
    relationZh: '与韩立多次合作、交心和重逢，提供仙界篇少见的朋友感。',
    relationEn: 'Cooperates, confides, and reunites with Han Li multiple times, giving the sequel a rare friendship texture.',
    outcomeZh: '应与热火仙尊、烛龙道、黑风海和白素媛线互链。',
    outcomeEn: 'Should cross-link Hot Flame Immortal, Candle Dragon Dao, Black Wind Sea, and Bai Suyuan threads.'
  }),
  'fox-three': characterProfile({
    encounterZh: '仙界篇无常盟/轮回殿相关任务中与韩立相识并多次同行，常在身份伪装和行动小队中出现。',
    encounterEn: 'Meets and repeatedly travels with Han Li in Impermanence Alliance / Reincarnation Palace-related missions, often through disguise and mission teams.',
    realmZh: '仙界篇任务人物，主要阶段修为高于普通真仙但低于顶层大能；具体小境界待逐章核对。',
    realmEn: 'A sequel mission figure above ordinary True Immortals but below top powers in the main stages; exact minor realm pending.',
    identityZh: '狐三/柳三省相关身份线，任务网络、情报和同行关系的重要角色。',
    identityEn: 'Fox Three / Liu Sansheng identity thread, important for mission networks, intelligence, and companion relations.',
    artsZh: '身份伪装、任务组织手段、狐族/仙界行动线索。',
    artsEn: 'Disguise, mission-organization methods, fox-clan / immortal action clues.',
    relationZh: '与韩立是任务搭档和多次同行者，和蛟三、无常盟、轮回殿应放在同一张行动网里。',
    relationEn: 'A mission partner and recurring companion of Han Li; should be mapped with Jiao San, Impermanence Alliance, and Reincarnation Palace.',
    outcomeZh: '不是泛泛“仙界同伴”，而是仙界篇任务推进器之一。',
    outcomeEn: 'Not a vague sequel companion, but one of the mission engines of the sequel.'
  }),
  'shi-chuankong': characterProfile({
    encounterZh: '仙界篇中与韩立同行并进入灰界、积鳞空境等关键阶段，背景逐步牵出魔域皇族和蟹道人身世。',
    encounterEn: 'Travels with Han Li through key sequel stages such as Gray Realm and Accumulated Scale Realm, gradually revealing Devil Domain royal and Crab Daoist identity threads.',
    realmZh: '相遇阶段为仙界高阶子弟/流亡者层级，具体小境界待逐章核对；其家族线高于普通同行者。',
    realmEn: 'At meeting he is a high-status sequel scion / exile-layer figure, exact minor realm pending; his family thread sits above ordinary companions.',
    identityZh: '魔域皇族石氏相关人物，石空鱼、石空解/蟹道人关系链的重要节点。',
    identityEn: 'Devil Domain Shi-clan figure and key node in Shi Kongyu / Shi Kongjie-Crab Daoist relations.',
    artsZh: '空间法则家族线、魔域功法、灰界与积鳞空境行动资源。',
    artsEn: 'Space-law family thread, Devil Domain arts, and Gray / Accumulated Scale Realm action resources.',
    relationZh: '与韩立是灰界和积鳞空境阶段的重要同行盟友，也把韩立卷入魔域高层旧账。',
    relationEn: 'A major ally during Gray and Accumulated Scale Realm stages, and pulls Han Li into Devil Domain high-level old debts.',
    outcomeZh: '应与灰界地图、蟹道人、魔域皇族和空间法则并列整理。',
    outcomeEn: 'Should be organized with the Gray Realm map, Crab Daoist, Devil Domain royal line, and space law.'
  }),
  'gan-jiuzhen': characterProfile({
    encounterZh: '仙界篇早期因无常盟/轮回殿任务和真言门旧事与韩立交集，曾牵动“蛟三”身份误认和时间法则线索。',
    encounterEn: 'Intersects Han Li through early Impermanence / Reincarnation missions and True Word old events, including mistaken-identity hints around "Jiao San" and time-law clues.',
    realmZh: '仙界篇中高阶任务人物，具体小境界待逐章核对；她的价值主要在身份、旧史和时间线索。',
    realmEn: 'A middle-to-high sequel mission figure; exact minor realm pending, with importance focused on identity, old history, and time clues.',
    identityZh: '真言门/时间线相关关键人物，也牵连无常盟、轮回殿任务网络。',
    identityEn: 'A key True Word / time-thread figure also tied to Impermanence Alliance and Reincarnation Palace mission networks.',
    artsZh: '时间法则线索、真言门传承情报、身份伪装/任务网络。',
    artsEn: 'Time-law clues, True Word inheritance information, disguised identity / mission networks.',
    relationZh: '与韩立通过真言门遗迹、时间因果和仙界早期任务相连。',
    relationEn: 'Connected to Han Li through True Word ruins, time karma, and early sequel missions.',
    outcomeZh: '她应与蛟三、真言门、无常盟和时间法则一起维护，避免写成普通路人。',
    outcomeEn: 'She should be maintained with Jiao San, True Word Sect, Impermanence Alliance, and time law, not as a passing bystander.'
  }),
  'xuan-gu': characterProfile({
    encounterZh: '乱星海虚天殿前后与韩立产生强烈敌对和夺宝交集，并牵出极阴祖师旧怨、残魂夺舍和虚天鼎争夺。',
    encounterEn: 'Intersects Han Li around the Chaotic Star Sea and Void Heaven Hall through hostile treasure schemes, old debts with Jiyin, remnant-soul possession, and the Void Heaven Cauldron contest.',
    realmZh: '乱星海元婴老怪级人物；相遇时韩立仍远低于其真实层级，只能靠信息差、禁制和多方制衡周旋。',
    realmEn: 'A Nascent-Soul old-monster-level Chaotic Star Sea figure; at meeting Han Li is far below his true layer and survives through information gaps, restrictions, and faction checks.',
    identityZh: '玄骨上人，极阴祖师旧师/旧敌式人物，乱星海高阶魔道残魂。',
    identityEn: 'Master Xuan Gu, old-master / old-enemy figure to Jiyin and a high-level demonic remnant-soul in Chaotic Star Sea.',
    artsZh: '魔道、玄阴类手段、神魂残存、夺舍/借体、秘宝与虚天殿机关利用。',
    artsEn: 'Demonic arts, Xuan-yin methods, remnant soul, possession / borrowed body, secret treasures, and Void Heaven Hall mechanisms.',
    relationZh: '韩立在乱星海阶段最具人气的危险敌手之一，展示主角如何在元婴老怪夹缝中借势求生。',
    relationEn: 'One of Han Li most memorable Chaotic Star Sea threats, showing how the protagonist survives among Nascent-Soul old monsters by borrowing momentum.',
    outcomeZh: '应列入乱星海人气敌手、虚天殿夺宝和极阴祖师关系链。',
    outcomeEn: 'Should be part of the Chaotic Star Sea popular-opponent, Void Heaven treasure, and Jiyin relationship web.'
  }),
  'jiyin-ancestor': characterProfile({
    encounterZh: '乱星海虚天殿和逆星盟相关阶段与韩立交集，是早期最强压迫感的元婴老怪之一。',
    encounterEn: 'Intersects Han Li around Void Heaven Hall and Anti-Star Alliance stages, one of the early old monsters with the strongest pressure.',
    realmZh: '乱星海元婴期魔道老怪；对当时韩立构成绝对高阶压制。',
    realmEn: 'A Nascent-Soul demonic old monster in Chaotic Star Sea, overwhelmingly above Han Li at that time.',
    identityZh: '极阴祖师，乱星海魔道高阶人物，与玄骨上人旧账深。',
    identityEn: 'Zenith Yin / Jiyin Ancestor, high-level Chaotic Star Sea demonic figure with deep old debts involving Xuan Gu.',
    artsZh: '玄阴魔功、鬼道/阴寒手段、夺宝和控制低阶修士的老怪套路。',
    artsEn: 'Xuan-yin demonic arts, ghost / yin-cold methods, treasure schemes, and old-monster control tactics.',
    relationZh: '韩立在乱星海被其胁迫和算计，多次靠谨慎与外部局势脱身。',
    relationEn: 'Han Li is pressured and schemed against by him, escaping through caution and outside power balances.',
    outcomeZh: '与玄骨、虚天殿、虚天鼎和逆星盟需共同维护。',
    outcomeEn: 'Should be maintained with Xuan Gu, Void Heaven Hall, Void Heaven Cauldron, and Anti-Star Alliance.'
  }),
  'wen-tianren': characterProfile({
    encounterZh: '乱星海中后段作为年轻强者和温氏/逆星盟相关势力人物与韩立形成同辈压力。',
    encounterEn: 'In the middle-late Chaotic Star Sea arc, appears as a young expert tied to Wen clan / Anti-Star Alliance forces and creates peer pressure for Han Li.',
    realmZh: '乱星海青年高阶修士，通常高于韩立相遇阶段或与其形成强竞争；精确小境界待逐章核对。',
    realmEn: 'A young high-level Chaotic Star Sea cultivator, usually above Han Li at meeting or a strong competitor; exact minor realm pending.',
    identityZh: '温天仁，乱星海大势力传承人物。',
    identityEn: 'Wen Tianren, inheritor-level figure of a major Chaotic Star Sea force.',
    artsZh: '海域大势力传承、魔道/双修势力背景、高阶法宝资源。',
    artsEn: 'Major maritime-faction inheritance, demonic / dual-cultivation faction background, and high-level treasure resources.',
    relationZh: '不是韩立身边人，而是显示同代天才和大势力继承者压力的对照角色。',
    relationEn: 'Not Han Li companion, but a contrast figure showing peer genius and great-faction inheritor pressure.',
    outcomeZh: '应在乱星海人物层补足青年强者，而不是只写老怪。',
    outcomeEn: 'Helps the Chaotic Star Sea cast include young experts, not only old monsters.'
  }),
  'ling-yuling': characterProfile({
    encounterZh: '乱星海星宫线中与韩立多次交集，承接星宫继承、天星双圣和乱星海秩序线。',
    encounterEn: 'Intersects Han Li repeatedly through the Star Palace line, carrying Star Palace inheritance, Heavenly Star Sages, and Chaotic Star Sea order.',
    realmZh: '星宫少主/继承者层级，具体境界随乱星海阶段推进，待逐章核对。',
    realmEn: 'Star Palace young-master / heir layer; exact realm changes across the Chaotic Star Sea arc remain pending.',
    identityZh: '凌玉灵，星宫核心继承人物，天星双圣后辈。',
    identityEn: 'Ling Yuling, core Star Palace heir and descendant line of the Heavenly Star Sages.',
    artsZh: '星宫传承、海域秩序、身份伪装与势力继承线。',
    artsEn: 'Star Palace inheritance, maritime order, disguised identity, and faction-succession threads.',
    relationZh: '与韩立多为合作、交易和局势互用关系，补足乱星海不是只有敌对压迫。',
    relationEn: 'Her relation with Han Li is cooperation, trade, and mutual use of circumstances, showing Chaotic Star Sea is not only hostile pressure.',
    outcomeZh: '应与星宫、天星双圣、逆星盟和乱星海地图共同维护。',
    outcomeEn: 'Should be maintained with Star Palace, Heavenly Star Sages, Anti-Star Alliance, and the Chaotic Star Sea map.'
  }),
  'qu-hun': characterProfile({
    encounterZh: '人界早期墨大夫事件后由张铁身体和炼尸/傀儡式利用线延伸而来，成为韩立早期可控战力之一。',
    encounterEn: 'After the early Doctor Mo incident, extends from Zhang Tie body and corpse / puppet-like use into one of Han Li early controllable combat assets.',
    realmZh: '早期为炼尸/曲魂式战力，不按正常修士境界简单衡量；强度随韩立祭炼和使用阶段变化。',
    realmEn: 'An early corpse / Qu Hun-style combat asset, not easily measured by normal cultivator realms; strength changes with Han Li refinement and use.',
    identityZh: '张铁余波、曲魂战力、韩立把危机转化为工具的代表。',
    identityEn: 'Zhang Tie aftermath, Qu Hun combat asset, and representative of Han Li turning crisis into usable tools.',
    artsZh: '炼尸术、傀儡式操控、早期护身战力。',
    artsEn: 'Corpse-refinement, puppet-like control, and early protective combat power.',
    relationZh: '不是独立同伴，而是韩立早期风险处理和技术利用能力的证明。',
    relationEn: 'Not an independent companion, but proof of Han Li early risk handling and technical reuse.',
    outcomeZh: '应与墨大夫、张铁、夺舍秘术和傀儡术互链。',
    outcomeEn: 'Should cross-link Doctor Mo, Zhang Tie, possession arts, and puppet refinement.'
  })
}))

function defaultCharacterProfile(entry, locale) {
  const verification = verificationFor(entry)
  return characterProfile({
    encounterZh: verification.firstZh,
    encounterEn: verification.firstEn,
    realmZh: `${entry.phaseZh}相关境界待逐章细化；当前先按章节段和身份定位。`,
    realmEn: `${entry.phaseEn} realm details remain chapter-level work; currently located by arc and role.`,
    identityZh: entry.summaryZh,
    identityEn: entry.summaryEn,
    artsZh: entry.related.map((slug) => entryBySlug.get(slug)?.zh).filter(Boolean).join('、') || '相关功法/法宝待补充',
    artsEn: entry.related.map((slug) => entryBySlug.get(slug)?.en).filter(Boolean).join(', ') || 'Related arts / treasures pending',
    relationZh: entry.roleZh,
    relationEn: entry.roleEn,
    outcomeZh: entry.confidence === 'verify' ? '已建索引，待逐章补充结局、击杀/被杀和关系变化。' : '已按阶段定位，后续继续补精确章节和关系变化。',
    outcomeEn: entry.confidence === 'verify' ? 'Indexed; outcome and relationship changes remain to be refined.' : 'Located by arc; exact chapters and relationship changes can be refined later.',
    ageZh: verification.ageZh,
    ageEn: verification.ageEn
  })
}

function characterProfileFor(entry) {
  return characterProfileCatalog.get(entry.slug) ?? defaultCharacterProfile(entry)
}

function renderCharacterProfileBlock(entry, locale) {
  if (entry.section !== 'characters') return ''
  const isEn = locale === 'en'
  const profile = characterProfileFor(entry)
  if (isEn) {
    return `## Character File

| Field | Detail |
| --- | --- |
| Timeline node | ${chronologyLabel(entry, locale)} |
| First / major meeting | ${profile.encounterEn} |
| Cultivation at meeting / main stage | ${profile.realmEn} |
| Identity and faction | ${profile.identityEn} |
| Arts, laws, or treasures | ${profile.artsEn} |
| Relation to Han Li | ${profile.relationEn} |
| Outcome / later thread | ${profile.outcomeEn} |
| Age precision | ${profile.ageEn} |
| Note | ${profile.noteEn} |
`
  }
  return `## 人物档案

| 项目 | 详情 |
| --- | --- |
| 时间节点 | ${chronologyLabel(entry, locale)} |
| 初遇 / 主要相遇阶段 | ${profile.encounterZh} |
| 相遇时或主要阶段修为 | ${profile.realmZh} |
| 身份与势力 | ${profile.identityZh} |
| 功法 / 法则 / 法宝 | ${profile.artsZh} |
| 与韩立关系 | ${profile.relationZh} |
| 结局 / 后续线 | ${profile.outcomeZh} |
| 年龄精度 | ${profile.ageZh} |
| 备注 | ${profile.noteZh} |
`
}

function craftProfile(data) {
  return {
    sourceZh: data.sourceZh,
    sourceEn: data.sourceEn,
    materialsZh: data.materialsZh,
    materialsEn: data.materialsEn,
    methodZh: data.methodZh,
    methodEn: data.methodEn,
    effectZh: data.effectZh,
    effectEn: data.effectEn,
    usersZh: data.usersZh,
    usersEn: data.usersEn,
    limitsZh: data.limitsZh ?? '材料、丹方或祭炼细节以后续逐章核对为准；本页不杜撰原文未明说的完整配方。',
    limitsEn: data.limitsEn ?? 'Materials, formula, or refinement details remain subject to chapter-level checking; this page does not invent complete recipes.',
    noteZh: data.noteZh ?? '只整理材料、炼制/修炼方法和功效，不复制原文。',
    noteEn: data.noteEn ?? 'Records materials, method, and effects only; no novel prose is reproduced.'
  }
}

const craftProfileCatalog = new Map(Object.entries({
  'foundation-establishment-pill': craftProfile({
    sourceZh: '人界早期黄枫谷、血色禁地、越国七派筑基资源线。',
    sourceEn: 'Early Mortal Realm Yellow Maple, Blood Forbidden Land, and Yue Seven Sects foundation-resource thread.',
    materialsZh: '原文重点写“筑基灵药/灵草”争夺，韩立通过血色禁地取得关键灵草和种子，并借小绿瓶催熟；完整丹方药名待逐章细核。',
    materialsEn: 'The text emphasizes contest over foundation herbs; Han Li obtains key herbs and seeds through Blood Forbidden Land and matures them with the green bottle. Full formula names need chapter-level checking.',
    methodZh: '需丹方、丹炉、火候和成熟灵草；韩立以稳定药源换取多次尝试空间。',
    methodEn: 'Requires a formula, cauldron, fire control, and mature herbs; Han Li turns stable herb supply into multiple attempts.',
    effectZh: '辅助炼气期修士突破筑基，是早期资源稀缺和宗门名额分配的核心。',
    effectEn: 'Assists Qi Refining cultivators in reaching Foundation Establishment; core to early scarcity and sect allocation.',
    usersZh: '韩立、越国七派低阶弟子。',
    usersEn: 'Han Li and low-level disciples of the Yue Seven Sects.'
  }),
  'yellow-dragon-pill': craftProfile({
    sourceZh: '七玄门/墨大夫早期丹药线。',
    sourceEn: 'Qixuanmen / Doctor Mo early pill thread.',
    materialsZh: '原文更强调药力和早期修炼辅助，完整材料名需回到章节逐条核对。',
    materialsEn: 'The text mainly emphasizes medicinal force and early cultivation aid; full ingredients need chapter checking.',
    methodZh: '按早期医药和炼丹启蒙理解：依托药材、丹方和医术/炼丹手法制成。',
    methodEn: 'Read as early medical-alchemy practice using herbs, formulas, and medicine/alchemy methods.',
    effectZh: '辅助低阶修炼，体现韩立早期对药力的依赖。',
    effectEn: 'Supports low-level cultivation and shows Han Li early dependence on medicinal force.',
    usersZh: '韩立早期修炼线。',
    usersEn: 'Han Li early cultivation thread.'
  }),
  'golden-marrow-pill': craftProfile({
    sourceZh: '七玄门/墨大夫早期药物改造与炼气启蒙线。',
    sourceEn: 'Qixuanmen / Doctor Mo early body-medicine and Qi Refining thread.',
    materialsZh: '具体药材待逐章核对。',
    materialsEn: 'Specific ingredients pending chapter check.',
    methodZh: '以医药方式承接到修仙丹药体系，强调服食、炼化和身体承受。',
    methodEn: 'Bridges mortal medicine into cultivation pills, emphasizing ingestion, refinement, and body tolerance.',
    effectZh: '辅助早期体质/法力增长。',
    effectEn: 'Assists early body and mana growth.',
    usersZh: '韩立早期。',
    usersEn: 'Early Han Li.'
  }),
  'gold-forming-pill': craftProfile({
    sourceZh: '人界中期结丹资源线。',
    sourceEn: 'Middle Mortal Realm Core Formation resource thread.',
    materialsZh: '需高阶灵药和丹方，具体药名待逐章细核。',
    materialsEn: 'Requires high-level herbs and formula; exact names pending chapter check.',
    methodZh: '围绕筑基修士冲击结丹的闭关准备炼制。',
    methodEn: 'Refined for Foundation Establishment cultivators preparing for Core Formation seclusion.',
    effectZh: '辅助凝结金丹，提高突破机会。',
    effectEn: 'Assists forming the golden core and improving breakthrough chance.',
    usersZh: '韩立及人界筑基后期修士。',
    usersEn: 'Han Li and late Foundation Establishment cultivators.'
  }),
  'infant-formation-pill': craftProfile({
    sourceZh: '人界中后期元婴突破资源线。',
    sourceEn: 'Middle-late Mortal Realm Nascent Soul breakthrough resource thread.',
    materialsZh: '九曲灵参等高阶灵药与相关丹方线索；完整配方待逐章核对。',
    materialsEn: 'High-level herbs such as Nine-Bend Spirit Ginseng and formula clues; complete recipe pending chapter check.',
    methodZh: '高阶丹炉、成熟灵药、长时间闭关准备，与心魔应对共同构成结婴工程。',
    methodEn: 'High-level cauldron, mature herbs, long seclusion preparation, and inner-demon handling form the Nascent Soul project.',
    effectZh: '辅助冲击元婴大关。',
    effectEn: 'Assists the Nascent Soul threshold.',
    usersZh: '韩立、人界中后期高阶修士。',
    usersEn: 'Han Li and middle-late Mortal Realm high-level cultivators.'
  }),
  'dao-pill': craftProfile({
    sourceZh: '仙界篇法则修炼和道丹体系。',
    sourceEn: 'Immortal World Arc law cultivation and Dao-pill system.',
    materialsZh: '法则材料、道意相关资源、仙界丹方；不同道丹材料不同，需按品类拆分。',
    materialsEn: 'Law materials, Dao-intent resources, and immortal-world formulas; different Dao pills need separate entries.',
    methodZh: '以仙界炼丹术处理法则属性材料，重在道意/法则承载而非单纯灵气年份。',
    methodEn: 'Immortal alchemy processes law-aspected materials, emphasizing Dao/law carrying capacity rather than only herb age.',
    effectZh: '辅助法则感悟、境界推进或特殊道意增长。',
    effectEn: 'Supports law comprehension, realm progress, or special Dao-intent growth.',
    usersZh: '仙界修士、韩立后期资源线。',
    usersEn: 'Immortal cultivators and Han Li later resource path.'
  }),
  'zhangtian-bottle': craftProfile({
    sourceZh: '韩立最核心机缘之一，非普通炼制物。',
    sourceEn: 'One of Han Li core opportunities, not an ordinary crafted item.',
    materialsZh: '原文未按普通炼器丹方公开其制作材料；重点是瓶中绿液与灵药催熟效果。',
    materialsEn: 'The text does not present a normal crafting recipe; the key is the green liquid and herb-maturing effect.',
    methodZh: '不能按普通法宝复刻；韩立通过谨慎保密、周期性收取绿液和药园经营发挥作用。',
    methodEn: 'Not reproducible as a normal artifact; Han Li uses secrecy, periodic green-liquid collection, and herb-garden management.',
    effectZh: '催熟灵草、支撑丹药资源循环，并在仙界篇与时间法则和更深秘密相连。',
    effectEn: 'Matures spirit herbs, supports pill-resource loops, and later connects to time law and deeper secrets.',
    usersZh: '韩立。',
    usersEn: 'Han Li.'
  }),
  'green-bamboo-cloudswarm-swords': craftProfile({
    sourceZh: '韩立人界中期以后代表性成套飞剑法宝。',
    sourceEn: 'Han Li representative sword set from middle Mortal Realm onward.',
    materialsZh: '核心材料为金雷竹，后续可配合庚精等金属性强化材料；具体每次强化材料需逐章核对。',
    materialsEn: 'Core material is Golden Thunder Bamboo, later possibly reinforced with metal-aspected materials such as Geng metal; each upgrade needs chapter checking.',
    methodZh: '以青元剑诀和炼器术祭炼成套飞剑，长期温养强化，再配合剑阵使用。',
    methodEn: 'Refined as a sword set through Azure Essence Sword Art and artifact refining, nurtured long-term, and used with sword formations.',
    effectZh: '飞剑群攻、布阵、辟邪神雷克制魔邪，构成韩立中后期核心战斗体系。',
    effectEn: 'Sword-swarm offense, formations, and evil-warding thunder against devilish forces form Han Li core combat system.',
    usersZh: '韩立。',
    usersEn: 'Han Li.'
  }),
  'golden-thunder-bamboo': craftProfile({
    sourceZh: '人界中期以后重要雷属性灵材。',
    sourceEn: 'Important thunder-aspected material from middle Mortal Realm onward.',
    materialsZh: '本身是灵竹材料，韩立依赖小绿瓶催熟提高年份和可用性。',
    materialsEn: 'It is itself a spirit-bamboo material; Han Li uses the green bottle to mature it and increase usability.',
    methodZh: '作为炼器材料炼入飞剑，形成辟邪神雷体系。',
    methodEn: 'Refined into flying swords to form the evil-warding thunder system.',
    effectZh: '克制邪祟、魔气和阴邪手段，是青竹蜂云剑识别度最高的材料基础。',
    effectEn: 'Counters evil, devil Qi, and yin methods; the signature material basis of the Bamboo Cloudswarm Swords.',
    usersZh: '韩立。',
    usersEn: 'Han Li.'
  }),
  'gold-devouring-beetles': craftProfile({
    sourceZh: '韩立长期灵虫养成线。',
    sourceEn: 'Han Li long spirit-insect rearing line.',
    materialsZh: '灵虫本体、喂养资源、进阶所需环境和筛选；不同阶段材料需逐章细分。',
    materialsEn: 'The insects themselves, feeding resources, advancement environments, and selection; stage-specific materials need chapter-level split.',
    methodZh: '长期饲养、繁育、筛选和进阶，依靠数量、吞噬能力和成熟体质形成战力。',
    methodEn: 'Long-term feeding, breeding, selection, and advancement convert numbers and devouring ability into power.',
    effectZh: '吞噬金铁、群体压制、克制部分法宝和防御。',
    effectEn: 'Devours metal, applies swarm pressure, and counters some treasures and defenses.',
    usersZh: '韩立，后续与金童/噬金虫王线相连。',
    usersEn: 'Han Li, later linked with Golden Child / beetle-king thread.'
  }),
  'xutian-cauldron': craftProfile({
    sourceZh: '乱星海虚天殿夺宝线。',
    sourceEn: 'Chaotic Star Sea Void Heaven Hall treasure-contest thread.',
    materialsZh: '古宝/重宝，原文不以普通炼器配方呈现。',
    materialsEn: 'Ancient or major treasure, not presented as an ordinary crafting recipe.',
    methodZh: '重点在秘境争夺、认主/操控条件和高阶势力博弈。',
    methodEn: 'The focus is secret-realm contest, control conditions, and high-level faction games.',
    effectZh: '承载乱星海秘宝争夺和高阶修士算计。',
    effectEn: 'Carries the Chaotic Star Sea treasure contest and high-level scheming.',
    usersZh: '韩立及乱星海高阶修士争夺链。',
    usersEn: 'Han Li and the Chaotic Star Sea high-level contender web.'
  }),
  'wind-thunder-wings': craftProfile({
    sourceZh: '人界中后期遁速/保命法宝线。',
    sourceEn: 'Middle-late Mortal Realm escape-speed / survival treasure thread.',
    materialsZh: '风雷属性翅类材料和炼器辅材；完整清单待逐章核对。',
    materialsEn: 'Wind-thunder wing materials and refining auxiliaries; full list pending chapter check.',
    methodZh: '以炼器术将风雷属性材料炼成遁速法宝，再由韩立长期用于逃遁和抢占位置。',
    methodEn: 'Artifact refining converts wind-thunder materials into an escape-speed treasure used for flight and positioning.',
    effectZh: '提升遁速、闪避和保命能力。',
    effectEn: 'Improves escape speed, evasion, and survival.',
    usersZh: '韩立。',
    usersEn: 'Han Li.'
  }),
  'mantra-wheel-scripture': craftProfile({
    sourceZh: '仙界篇真言门时间法则传承。',
    sourceEn: 'Immortal World True Word Sect time-law inheritance.',
    materialsZh: '功法非炼制物；修炼依赖时间法则感悟、仙窍/法则资源和真言门传承。',
    materialsEn: 'Not a crafted item; practice depends on time-law comprehension, immortal apertures / law resources, and True Word lineage.',
    methodZh: '依法诀修炼时间法则，配合真言门遗迹和时间材料逐步推进。',
    methodEn: 'Cultivates time law through the scripture, True Word ruins, and time materials.',
    effectZh: '推动韩立仙界篇时间法则路线。',
    effectEn: 'Drives Han Li sequel time-law path.',
    usersZh: '韩立、真言门金属性时间法则一脉相关人物。',
    usersEn: 'Han Li and the True Word metal-aspected time-law branch.'
  }),
  'great-five-elements-illusory-world': craftProfile({
    sourceZh: '真言门镇宗级传承，弥罗老祖讲道/传承线。',
    sourceEn: 'True Word Sect core inheritance through Mi Luo teaching and lineage.',
    materialsZh: '功法体系，非普通物件；依赖五行时间法则基础和高阶法则感悟。',
    materialsEn: 'An art system, not an object; depends on five-element time-law foundation and high-level law comprehension.',
    methodZh: '通过讲道、隔世传承和长期法则修炼承接。',
    methodEn: 'Inherited through teaching, cross-time lineage, and long law cultivation.',
    effectZh: '统摄五行与幻世构造，是韩立继承弥罗衣钵的关键。',
    effectEn: 'Integrates five elements and illusory-world construction, key to Han Li inheriting Mi Luo lineage.',
    usersZh: '弥罗老祖、韩立。',
    usersEn: 'Mi Luo Ancestor and Han Li.'
  }),
  'severing-time-flowing-fire': craftProfile({
    sourceZh: '真言门火属性时间法则分支，奇摩子所修。',
    sourceEn: 'True Word fire-aspected time-law branch practiced by Qi Mozi.',
    materialsZh: '功法非材料炼制；修炼依赖火属性时间法则感悟。',
    materialsEn: 'An art rather than a crafted material; practice depends on fire-aspected time-law comprehension.',
    methodZh: '以真言门时间法则体系为根基，走火行时间分支。',
    methodEn: 'Built on True Word time-law system through the fire branch.',
    effectZh: '体现奇摩子的高阶时间法则压迫和真言门叛徒身份。',
    effectEn: 'Embodies Qi Mozi high-level time-law pressure and traitor identity.',
    usersZh: '奇摩子。',
    usersEn: 'Qi Mozi.'
  }),
  'water-derivation-four-seasons': craftProfile({
    sourceZh: '真言门水属性时间法则分支，禾泽传承。',
    sourceEn: 'True Word water-aspected time-law branch inherited through He Ze.',
    materialsZh: '功法非炼制物；与光阴之水、水行时间感悟相关。',
    materialsEn: 'An art rather than an object; tied to time water and water-aspected time comprehension.',
    methodZh: '由禾泽遗留传授韩立，配合修炼心得理解。',
    methodEn: 'Passed to Han Li by He Ze remnant together with cultivation notes.',
    effectZh: '补全韩立对真言门五行时间法则的认识。',
    effectEn: 'Helps Han Li complete his understanding of True Word five-element time law.',
    usersZh: '禾泽、韩立。',
    usersEn: 'He Ze and Han Li.'
  })
}))

function defaultCraftProfile(entry) {
  const verification = verificationFor(entry)
  const isTechnique = entry.section === 'techniques'
  return craftProfile({
    sourceZh: verification.chapterZh,
    sourceEn: verification.chapterEn,
    materialsZh: isTechnique ? '功法类词条通常不写制作材料，重点核对传承来源、修炼条件和法则属性。' : '具体材料待逐章核对，当前只写已知类别和资源链。',
    materialsEn: isTechnique ? 'Technique entries usually have no crafting ingredients; focus on lineage, conditions, and law attributes.' : 'Specific materials pending chapter check; currently records known resource class and chain.',
    methodZh: isTechnique ? '按传承、修炼条件、使用者和实战效果整理。' : '按获得方式、炼制/祭炼条件和用途整理。',
    methodEn: isTechnique ? 'Organized by lineage, training conditions, users, and combat effect.' : 'Organized by acquisition, refinement conditions, and use.',
    effectZh: entry.roleZh,
    effectEn: entry.roleEn,
    usersZh: verification.peopleZh,
    usersEn: verification.peopleEn,
    limitsZh: entry.confidence === 'verify' ? '当前仍待逐章核对，不把原文未给出的材料硬写成完整配方。' : null,
    limitsEn: entry.confidence === 'verify' ? 'Still needs chapter-level checking; this page does not invent a complete recipe.' : null
  })
}

function craftProfileFor(entry) {
  return craftProfileCatalog.get(entry.slug) ?? defaultCraftProfile(entry)
}

function renderCraftProfileBlock(entry, locale) {
  if (!['techniques', 'artifacts', 'elixirs'].includes(entry.section)) return ''
  const isEn = locale === 'en'
  const profile = craftProfileFor(entry)
  const title = isEn
    ? (entry.section === 'techniques' ? 'Practice / Inheritance File' : 'Crafting and Effect File')
    : (entry.section === 'techniques' ? '修炼与传承档案' : '制作材料与功效档案')
  if (isEn) {
    return `## ${title}

| Field | Detail |
| --- | --- |
| Timeline node | ${chronologyLabel(entry, locale)} |
| Source / acquisition | ${profile.sourceEn} |
| Materials / conditions | ${profile.materialsEn} |
| Method | ${profile.methodEn} |
| Effect | ${profile.effectEn} |
| Users / related people | ${profile.usersEn} |
| Limits | ${profile.limitsEn} |
| Note | ${profile.noteEn} |
`
  }
  return `## ${title}

| 项目 | 详情 |
| --- | --- |
| 时间节点 | ${chronologyLabel(entry, locale)} |
| 来源 / 获得方式 | ${profile.sourceZh} |
| 材料 / 修炼条件 | ${profile.materialsZh} |
| 制作 / 祭炼 / 修炼方法 | ${profile.methodZh} |
| 功效 | ${profile.effectZh} |
| 使用者 / 相关人物 | ${profile.usersZh} |
| 限制 | ${profile.limitsZh} |
| 备注 | ${profile.noteZh} |
`
}

function sectionIndex(locale, section) {
  const isEn = locale === 'en'
  const entries = entriesForSection(section.slug)
  const cards = entries.slice(0, 6).map((entry) => `<a class="entry-card" href="${pathFor(entry, locale)}"><h3>${titleFor(entry, locale)}</h3><p class="muted">${isEn ? entry.phaseEn : entry.phaseZh}</p><p>${isEn ? entry.summaryEn : entry.summaryZh}</p></a>`).join('\n  ')
  const chronologicalIndex = renderChronologicalEntryIndex(locale, entries)
  const visualBlock = section.slug === 'timeline'
    ? renderStorylineOverview(locale, entries)
    : `<div class="entry-grid">
  ${cards}
</div>`
  const realmMapBlock = section.slug === 'regions'
    ? isEn
      ? `## Realm Maps

<RmjiRealmMaps locale="en" />
`
      : `## 界域地图

<RmjiRealmMaps locale="zh" />
`
    : ''
  const ageCalibrationBlock = section.slug === 'timeline' ? `${renderAgeCalibration(locale)}\n` : ''
  const auditProgressBlock = section.slug === 'timeline' ? `${renderTimelineAuditProgress(locale)}\n` : ''
  const body = isEn
    ? `# ${section.en} / ${section.zh}

${section.descEn}

${realmMapBlock}
${ageCalibrationBlock}
${auditProgressBlock}
${visualBlock}

## Chronological Index

The entries below are ordered by narrative time first, then by topic. Use this order to read characters, treasures, techniques, pills, places, and events without mixing the Mortal, Spirit, and Immortal arcs.

${chronologicalIndex}

## Editorial Note

This topic uses original encyclopedia summaries only. It does not reproduce novel chapters or long passages. Later batches can add exact chapter references, character pages, and named sub-items.`
    : `# ${section.zh} / ${section.en}

${section.descZh}

${realmMapBlock}
${ageCalibrationBlock}
${auditProgressBlock}
${visualBlock}

## 按时间节点索引

下面先按剧情时间排序，再按专题阅读。人物、法宝、功法、丹药、地点和事件都统一放进“人界篇 -> 灵界篇 -> 仙界篇”的顺序里，避免混在一起。

${chronologicalIndex}

## 编辑说明

本专题只写原创百科摘要，不收录小说正文或长段摘录。后续批次可以继续补充精确章节、人物页和更细分的子词条。`
  writeDoc(`${isEn ? 'en/' : ''}rmji/${section.slug}/index.md`, frontmatter({
    title: isEn ? section.en : section.zh,
    description: isEn ? section.descEn : section.descZh
  }) + body)
}

function entryPage(locale, entry) {
  const isEn = locale === 'en'
  const section = sectionBySlug.get(entry.section)
  const confidence = confidenceText[entry.confidence][isEn ? 'en' : 'zh']
  const verification = verificationFor(entry)
  const checkStatus = verificationStatusLabel(verification, locale)
  const body = isEn
    ? `# ${entry.en} / ${entry.zh}

<div class="term-meta">
  <div><strong>Chinese</strong><span>${entry.zh}</span></div>
  <div><strong>English</strong><span>${entry.en}</span></div>
  <div><strong>Pinyin</strong><span>${entry.pinyin}</span></div>
  <div><strong>Topic</strong><span>${section.en}</span></div>
</div>

## Summary

${entry.summaryEn}

## Role in RMJI

${entry.roleEn}

## Curation Notes

${curationNotes(entry, locale)}

${renderChronologyBlock(entry, locale)}

${renderCharacterProfileBlock(entry, locale)}

${renderCraftProfileBlock(entry, locale)}

${renderVerificationBlock(entry, locale)}

${renderTimelineProfile(entry, locale)}

## Placement

| Field | Detail |
| --- | --- |
| Chinese name | ${entry.zh} |
| English name | ${entry.en} |
| Pinyin | ${entry.pinyin} |
| Topic | [${section.en}](${prefix(locale)}/rmji/${section.slug}/) |
| Timeline node | ${chronologyLabel(entry, locale)} |
| Main arc | ${entry.phaseEn} |
| Chapter check | ${checkStatus} |
| Legacy confidence | ${confidence} |

## Related Entries

${relatedLinks(entry, locale)}

## Legal Reading

${renderSources(locale)}

## Content Policy

This page is an original reference summary for terminology, worldbuilding, and reading context. It does not copy novel chapters.`
    : `# ${entry.zh} / ${entry.en}

<div class="term-meta">
  <div><strong>中文</strong><span>${entry.zh}</span></div>
  <div><strong>英文</strong><span>${entry.en}</span></div>
  <div><strong>拼音</strong><span>${entry.pinyin}</span></div>
  <div><strong>专题</strong><span>${section.zh}</span></div>
</div>

## 百科摘要

${entry.summaryZh}

## 在《凡人》体系中的作用

${entry.roleZh}

## 专场整理角度

${curationNotes(entry, locale)}

${renderChronologyBlock(entry, locale)}

${renderCharacterProfileBlock(entry, locale)}

${renderCraftProfileBlock(entry, locale)}

${renderVerificationBlock(entry, locale)}

${renderTimelineProfile(entry, locale)}

## 快速档案

| 项目 | 详情 |
| --- | --- |
| 中文名 | ${entry.zh} |
| 英文名 | ${entry.en} |
| 拼音 | ${entry.pinyin} |
| 所属专题 | [${section.zh}](/rmji/${section.slug}/) |
| 时间节点 | ${chronologyLabel(entry, locale)} |
| 主要阶段 | ${entry.phaseZh} |
| 章节核对 | ${checkStatus} |
| 旧版置信度 | ${confidence} |

## 相关词条

${relatedLinks(entry, locale)}

## 合法阅读

${renderSources(locale)}

## 内容原则

本页为术语、设定和阅读背景的原创百科摘要，不复制小说章节正文。`
  return frontmatter({
    title: isEn ? entry.en : entry.zh,
    zh_name: entry.zh,
    en_name: entry.en,
    pinyin: entry.pinyin,
    category: isEn ? section.en : section.zh,
    arc: isEn ? entry.phaseEn : entry.phaseZh,
    timeline_node: chronologyLabel(entry, locale),
    check_status: checkStatus,
    legacy_check_status: confidence,
    description: isEn ? entry.summaryEn : entry.summaryZh
  }) + body
}

function auditPage(locale) {
  const isEn = locale === 'en'
  const statusOrder = ['verifiedRange', 'stageChecked', 'estimated', 'needsChapterCheck']
  const summaryRows = Object.keys(auditGroupText).map((group) => {
    const entries = allEntries.filter((entry) => verificationFor(entry).group === group)
    const counts = entries.reduce((acc, entry) => {
      const status = verificationFor(entry).status
      acc[status] = (acc[status] ?? 0) + 1
      return acc
    }, {})
    return isEn
      ? `| ${auditGroupLabel(group, locale)} | ${entries.length} | ${counts.verifiedRange ?? 0} | ${counts.stageChecked ?? 0} | ${counts.estimated ?? 0} | ${counts.needsChapterCheck ?? 0} |`
      : `| ${auditGroupLabel(group, locale)} | ${entries.length} | ${counts.verifiedRange ?? 0} | ${counts.stageChecked ?? 0} | ${counts.estimated ?? 0} | ${counts.needsChapterCheck ?? 0} |`
  }).join('\n')

  const groupBlocks = Object.keys(auditGroupText).map((group) => {
    const entries = allEntries
      .filter((entry) => verificationFor(entry).group === group)
      .sort((a, b) => {
        const va = verificationFor(a)
        const vb = verificationFor(b)
        const statusDelta = statusOrder.indexOf(va.status) - statusOrder.indexOf(vb.status)
        if (statusDelta !== 0) return statusDelta
        return titleFor(a, locale).localeCompare(titleFor(b, locale), isEn ? 'en-US' : 'zh-Hans-CN')
      })

    const rows = entries.map((entry) => {
      const verification = verificationFor(entry)
      const title = `[${titleFor(entry, locale)}](${pathFor(entry, locale)})`
      const section = sectionBySlug.get(entry.section)
      if (isEn) {
        return `| ${title} | ${section.en} | ${verificationStatusLabel(verification, locale)} | ${verification.chapterEn} | ${verification.locationEn} | ${verification.peopleEn} | ${verification.materialsEn} |`
      }
      return `| ${title} | ${section.zh} | ${verificationStatusLabel(verification, locale)} | ${verification.chapterZh} | ${verification.locationZh} | ${verification.peopleZh} | ${verification.materialsZh} |`
    }).join('\n')

    if (isEn) {
      return `## ${auditGroupLabel(group, locale)}

| Entry | Topic | Status | Chapter segment | Main place | People | Materials / arts |
| --- | --- | --- | --- | --- | --- | --- |
${rows}`
    }
    return `## ${auditGroupLabel(group, locale)}

| 词条 | 专题 | 状态 | 章节段 | 主要地点 | 相关人物 | 材料 / 功法 |
| --- | --- | --- | --- | --- | --- | --- |
${rows}`
  }).join('\n\n')

  const body = isEn
    ? `# Chapter Check Ledger / 章节核对台账

This ledger records event segments, places, people, age estimates, and material/art links for the RMJI topic. It does not reproduce novel prose, and it points readers to legal reading sources.

## Progress Summary

| Realm / arc | Entries | Verified segment | Arc checked | Estimated | Needs chapter check |
| --- | ---: | ---: | ---: | ---: | ---: |
${summaryRows}

## Content Focus

- Mortal Realm: Qixuanmen, Yellow Maple Valley, Blood Forbidden Land, Yue war, return to Heavenly South, Demonfall Valley, Great Jin, Kunwu Mountain, and spatial nodes.
- Chaotic Star Sea: Kuixing Island, Sky Star City, Outer Star Sea, Void Heaven Hall, Star Palace, Anti-Star Alliance, Zi Ling, Yuan Yao, and resource economy.
- Spirit / Devil / Immortal / Gray arcs: Heavenly Abyss City, Flying Spirit regions, Broad Cold Realm, Devil Calamity, Black Wind Sea, North Cold domain, Candle Dragon Dao, True Word Sect, Reincarnation Palace, Heavenly Court, Gray Realm, and the endgame.

${groupBlocks}

## Legal Reading

${renderSources(locale)}`
    : `# 章节核对台账 / Chapter Check Ledger

这个台账记录《凡人修仙传》专场的事件段、地点、人物、年龄估算和材料/功法关系。这里不收录小说正文，只做原创百科索引，并引导到合法阅读来源。

## 进度总览

| 界域 / 篇章 | 词条数 | 已核对章节段 | 阶段核对 | 估算 | 待逐章核对 |
| --- | ---: | ---: | ---: | ---: | ---: |
${summaryRows}

## 本轮内容重点

- 人界：七玄门、黄枫谷、血色禁地、越国正魔战争、返回天南、坠魔谷、大晋、昆吾山、空间节点。
- 乱星海：魁星岛、天星城、外星海、虚天殿、星宫、逆星盟、紫灵、元瑶和海域资源经济。
- 灵界 / 魔界 / 仙界 / 灰界：天渊城、飞灵族、广寒界、魔劫、黑风海、北寒仙域、烛龙道、真言门、轮回殿、天庭、灰界和终局道祖线。

${groupBlocks}

## 合法阅读

${renderSources(locale)}`

  writeDoc(`${isEn ? 'en/' : ''}rmji/audit/index.md`, frontmatter({
    title: isEn ? 'Chapter Check Ledger' : '章节核对台账',
    description: isEn
      ? 'Chapter-segment verification ledger for RMJI places, people, events, materials, techniques, and age estimates.'
      : '《凡人修仙传》专场地点、人物、事件、材料、功法和年龄估算的章节段核对台账。'
  }) + body)
}

function rmjiHome(locale) {
  const isEn = locale === 'en'
  const sectionCards = sections.map((section) => {
    const count = catalog[section.slug].length
    return `<a class="category-row" href="${prefix(locale)}/rmji/${section.slug}/"><span class="icon">${section.icon}</span><h3>${isEn ? section.en : section.zh}</h3><p>${isEn ? section.zh : section.en}</p><strong>${count} ${isEn ? 'entries' : '词条'}</strong></a>`
  }).join('\n  ')
  const featuredSlugs = ['han-li', 'nangong-wan', 'zi-ling', 'jiao-san', 'golden-child', 'weeping-soul-character', 'crab-daoist', 'shi-chuankong', 'xuan-gu', 'qi-mozi', 'mi-luo-ancestor', 'reincarnation-palace-master', 'gu-huajin', 'zhangtian-bottle', 'time-law']
  const featuredCards = featuredSlugs.map((slug) => {
    const entry = entryBySlug.get(slug)
    return `<a class="entry-card" href="${pathFor(entry, locale)}"><h3>${titleFor(entry, locale)}</h3><p class="muted">${isEn ? entry.phaseEn : entry.phaseZh}</p><p>${isEn ? entry.summaryEn : entry.summaryZh}</p></a>`
  }).join('\n  ')
  const auditHref = `${prefix(locale)}/rmji/audit/`
  const auditCard = isEn
    ? `<a class="entry-card" href="${auditHref}"><h3>Chapter Check Ledger / 章节核对台账</h3><p class="muted">Content completion</p><p>Track chapter segments, places, people, events, materials, techniques, and Han Li age estimates without reproducing novel text.</p></a>`
    : `<a class="entry-card" href="${auditHref}"><h3>章节核对台账 / Chapter Check Ledger</h3><p class="muted">内容补全</p><p>按章节段整理地点、人物、事件、材料、功法和韩立年龄估算，不收录小说正文。</p></a>`
  const total = allEntries.length
  const body = isEn
    ? `# RMJI Universe / 凡人修仙传专场

<div class="rmji-hero">
  <p class="eyebrow">A Record of a Mortal's Journey to Immortality</p>
  <h2>Worldbuilding index for techniques, treasures, pills, sects, races, regions, laws, characters, and timeline.</h2>
  <p>This topic covers the original novel and the Immortal World Arc with spoiler-light, original encyclopedia summaries. It does not reproduce chapters.</p>
</div>

## Topic Map

<div class="category-grid">
  ${sectionCards}
</div>

## Current Batch

<div class="stats-grid">
  <div class="stat-card"><strong>${total}</strong><span>topic entries</span></div>
  <div class="stat-card"><strong>${sections.length}</strong><span>topic indexes</span></div>
  <div class="stat-card"><strong>2</strong><span>covered works</span></div>
  <div class="stat-card"><strong>0</strong><span>chapter text copied</span></div>
</div>

## Content Check

<div class="entry-grid">
  ${auditCard}
</div>

## Featured Entries

<div class="entry-grid">
  ${featuredCards}
</div>

## Completion Roadmap

| Batch | Focus | Goal |
| --- | --- | --- |
| 1 | Topic structure and seed entries | Build the RMJI section and searchable bilingual pages. |
| 2 | Relationship detail | Expand character ties, faction chains, and major opponent context. |
| 3 | Chapter-level verification | Add precise arc notes and mark uncertain entries as verified. |
| 4 | Timeline and visual maps | Add protagonist age-location route tables, realm routes, faction charts, and law-system diagrams. |

## Legal Reading

${renderSources(locale)}`
    : `# 凡人修仙传专场 / RMJI Universe

<div class="rmji-hero">
  <p class="eyebrow">凡人修仙传 · 凡人修仙之仙界篇</p>
  <h2>功法、法宝、丹药、宗门、族群、界域、法则、人物和剧情线的专题索引。</h2>
  <p>本专场覆盖《凡人修仙传》和《凡人修仙之仙界篇》，采用轻剧透、原创百科摘要方式整理，不复制章节正文。</p>
</div>

## 专题地图

<div class="category-grid">
  ${sectionCards}
</div>

## 当前批次

<div class="stats-grid">
  <div class="stat-card"><strong>${total}</strong><span>专题词条</span></div>
  <div class="stat-card"><strong>${sections.length}</strong><span>专题索引</span></div>
  <div class="stat-card"><strong>2</strong><span>覆盖作品</span></div>
  <div class="stat-card"><strong>0</strong><span>不收录小说正文</span></div>
</div>

## 内容核对

<div class="entry-grid">
  ${auditCard}
</div>

## 推荐先看

<div class="entry-grid">
  ${featuredCards}
</div>

## 补全路线

| 批次 | 重点 | 目标 |
| --- | --- | --- |
| 第一批 | 专题结构和种子词条 | 建好 RMJI 专区、分类索引和可搜索双语页面。 |
| 第二批 | 关系细化 | 继续补人物关系、势力链条、主要对手和关键事件背景。 |
| 第三批 | 逐章核对 | 为待核对词条补准确阶段、出场线索和交叉引用。 |
| 第四批 | 主角时间线与可视化 | 增加主角年龄地点表、界域路线图、势力关系图和仙界法则体系图。 |

## 合法阅读

${renderSources(locale)}`
  writeDoc(`${isEn ? 'en/' : ''}rmji/index.md`, frontmatter({
    title: isEn ? 'RMJI Universe' : '凡人修仙传专场',
    description: isEn
      ? "A bilingual topic index for RMJI techniques, artifacts, factions, realms, laws, characters, and timeline."
      : '《凡人修仙传》《凡人修仙之仙界篇》功法、法宝、丹药、宗门、族群、界域、法则和人物专题。'
  }) + body)
}

rmjiHome('zh')
rmjiHome('en')
auditPage('zh')
auditPage('en')

for (const section of sections) {
  sectionIndex('zh', section)
  sectionIndex('en', section)
}

for (const entry of allEntries) {
  writeDoc(`rmji/${entry.section}/${entry.slug}.md`, entryPage('zh', entry))
  writeDoc(`en/rmji/${entry.section}/${entry.slug}.md`, entryPage('en', entry))
}

console.log(`Generated RMJI topic pages: ${allEntries.length} entries, ${sections.length} sections, bilingual.`)
