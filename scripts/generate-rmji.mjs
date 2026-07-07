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
    zh: '起点中文网《凡人修仙传》',
    en: "Qidian: A Record of a Mortal's Journey to Immortality",
    url: 'https://www.qidian.com/book/107580/'
  },
  {
    zh: '起点中文网《凡人修仙之仙界篇》',
    en: "Qidian: A Record of a Mortal's Journey to Immortality - Immortal World Arc",
    url: 'https://www.qidian.com/book/1010734492/'
  },
  {
    zh: '微信读书《凡人修仙之仙界篇》',
    en: 'WeRead: Immortal World Arc',
    url: 'https://weread.qq.com/web/bookDetail/4fe324e0811e754c1g014ab9'
  },
  {
    zh: 'Wuxiaworld 英文授权阅读页',
    en: 'Wuxiaworld English reading page',
    url: 'https://www.wuxiaworld.com/novel/rmji'
  }
]

const sections = [
  { slug: 'techniques', zh: '功法神通', en: 'Techniques & Abilities', icon: '法', descZh: '修炼法门、神通、剑阵、炼体与仙界法则功法。', descEn: 'Cultivation methods, divine abilities, sword formations, body arts, and law-based arts.' },
  { slug: 'artifacts', zh: '法宝灵兽', en: 'Artifacts & Companions', icon: '宝', descZh: '法宝、灵材化宝、灵虫灵兽、傀儡和符宝体系。', descEn: 'Treasures, refined materials, spirit insects, companions, puppets, and talisman treasures.' },
  { slug: 'elixirs', zh: '丹药灵材', en: 'Elixirs & Materials', icon: '丹', descZh: '突破丹药、灵材、货币资源、妖丹魔晶和仙界材料。', descEn: 'Breakthrough pills, herbs, currency resources, demon cores, devil crystals, and immortal materials.' },
  { slug: 'sects', zh: '宗门势力', en: 'Sects & Factions', icon: '宗', descZh: '人界、灵界、仙界与灰界相关宗门、城池、组织和阵营。', descEn: 'Sects, cities, organizations, and factions across mortal, spirit, immortal, and gray-realm arcs.' },
  { slug: 'races', zh: '种族族群', en: 'Races & Peoples', icon: '族', descZh: '人族、妖族、魔族、灵族、灰仙、真灵等族群设定。', descEn: 'Humans, demon races, devil races, spirit races, gray immortals, true spirits, and other peoples.' },
  { slug: 'regions', zh: '界域地理', en: 'Realms & Regions', icon: '界', descZh: '人界、乱星海、灵界、魔界、仙界、灰界等地图框架。', descEn: 'Mortal Realm, Chaotic Star Sea, Spirit Realm, Devil Realm, Immortal Realm, Gray Realm, and more.' },
  { slug: 'laws', zh: '法则大道', en: 'Laws & Dao', icon: '道', descZh: '仙界篇核心的时间、轮回、空间、五行与三千大道。', descEn: 'Time, reincarnation, space, five elements, and the three thousand great daos of the sequel.' },
  { slug: 'timeline', zh: '剧情脉络', en: 'Timeline', icon: '史', descZh: '按阶段整理韩立从山村少年到仙界高阶斗争的路线。', descEn: 'A staged route from Han Li as a village youth to higher immortal-world conflicts.' }
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

function prefix(locale) {
  return locale === 'en' ? '/en' : ''
}

function pathFor(entry, locale) {
  return `${prefix(locale)}/rmji/${entry.section}/${entry.slug}`
}

function titleFor(entry, locale) {
  return locale === 'en' ? `${entry.en} / ${entry.zh}` : `${entry.zh} / ${entry.en}`
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

function sectionIndex(locale, section) {
  const isEn = locale === 'en'
  const entries = catalog[section.slug]
  const rows = entries.map((entry) => {
    const title = `[${titleFor(entry, locale)}](${pathFor(entry, locale)})`
    const phase = isEn ? entry.phaseEn : entry.phaseZh
    const confidence = confidenceText[entry.confidence][isEn ? 'en' : 'zh']
    const summary = isEn ? entry.summaryEn : entry.summaryZh
    return `| ${title} | ${phase} | ${confidence} | ${summary} |`
  }).join('\n')
  const cards = entries.slice(0, 6).map((entry) => `<a class="entry-card" href="${pathFor(entry, locale)}"><h3>${titleFor(entry, locale)}</h3><p class="muted">${isEn ? entry.phaseEn : entry.phaseZh}</p><p>${isEn ? entry.summaryEn : entry.summaryZh}</p></a>`).join('\n  ')
  const body = isEn
    ? `# ${section.en} / ${section.zh}

${section.descEn}

<div class="entry-grid">
  ${cards}
</div>

## Entry Index

| Entry | Arc | Check | Summary |
| --- | --- | --- | --- |
${rows}

## Editorial Note

This topic uses original encyclopedia summaries only. It does not reproduce novel chapters or long passages. Later batches can add exact chapter references, character pages, and named sub-items.`
    : `# ${section.zh} / ${section.en}

${section.descZh}

<div class="entry-grid">
  ${cards}
</div>

## 词条索引

| 词条 | 阶段 | 核对 | 摘要 |
| --- | --- | --- | --- |
${rows}

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

## Placement

| Field | Detail |
| --- | --- |
| Chinese name | ${entry.zh} |
| English name | ${entry.en} |
| Pinyin | ${entry.pinyin} |
| Topic | [${section.en}](${prefix(locale)}/rmji/${section.slug}/) |
| Main arc | ${entry.phaseEn} |
| Check status | ${confidence} |

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

## 快速档案

| 项目 | 详情 |
| --- | --- |
| 中文名 | ${entry.zh} |
| 英文名 | ${entry.en} |
| 拼音 | ${entry.pinyin} |
| 所属专题 | [${section.zh}](/rmji/${section.slug}/) |
| 主要阶段 | ${entry.phaseZh} |
| 核对状态 | ${confidence} |

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
    check_status: confidence,
    description: isEn ? entry.summaryEn : entry.summaryZh
  }) + body
}

function rmjiHome(locale) {
  const isEn = locale === 'en'
  const sectionCards = sections.map((section) => {
    const count = catalog[section.slug].length
    return `<a class="category-row" href="${prefix(locale)}/rmji/${section.slug}/"><span class="icon">${section.icon}</span><h3>${isEn ? section.en : section.zh}</h3><p>${isEn ? section.zh : section.en}</p><strong>${count} ${isEn ? 'entries' : '词条'}</strong></a>`
  }).join('\n  ')
  const featuredSlugs = ['zhangtian-bottle', 'qingyuan-sword-art', 'green-bamboo-cloudswarm-swords', 'foundation-establishment-pill', 'heavenly-court', 'reincarnation-palace', 'gray-realm', 'time-law']
  const featuredCards = featuredSlugs.map((slug) => {
    const entry = entryBySlug.get(slug)
    return `<a class="entry-card" href="${pathFor(entry, locale)}"><h3>${titleFor(entry, locale)}</h3><p class="muted">${isEn ? entry.phaseEn : entry.phaseZh}</p><p>${isEn ? entry.summaryEn : entry.summaryZh}</p></a>`
  }).join('\n  ')
  const total = allEntries.length
  const body = isEn
    ? `# RMJI Universe / 凡人修仙传专题

<div class="rmji-hero">
  <p class="eyebrow">A Record of a Mortal's Journey to Immortality</p>
  <h2>Worldbuilding index for techniques, treasures, pills, sects, races, regions, laws, and timeline.</h2>
  <p>This topic covers the original novel and the Immortal World Arc with spoiler-light, original encyclopedia summaries. It does not reproduce chapters.</p>
</div>

## Topic Map

<div class="category-grid">
  ${sectionCards}
</div>

## Current Batch

<div class="stats-grid">
  <div class="stat-card"><strong>${total}</strong><span>seed entries</span></div>
  <div class="stat-card"><strong>${sections.length}</strong><span>topic indexes</span></div>
  <div class="stat-card"><strong>2</strong><span>covered works</span></div>
  <div class="stat-card"><strong>0</strong><span>chapter text copied</span></div>
</div>

## Featured Entries

<div class="entry-grid">
  ${featuredCards}
</div>

## Completion Roadmap

| Batch | Focus | Goal |
| --- | --- | --- |
| 1 | Topic structure and seed entries | Build the RMJI section and searchable bilingual pages. |
| 2 | Character and faction detail | Add Han Li, Nangong Wan, major opponents, and faction relationships. |
| 3 | Chapter-level verification | Add precise arc notes and mark uncertain entries as verified. |
| 4 | Visual maps | Add realm routes, faction relationship charts, and law-system diagrams. |

## Legal Reading

${renderSources(locale)}`
    : `# 凡人修仙传专题 / RMJI Universe

<div class="rmji-hero">
  <p class="eyebrow">凡人修仙传 · 凡人修仙之仙界篇</p>
  <h2>功法、法宝、丹药、宗门、族群、界域、法则、剧情线的专题索引。</h2>
  <p>本专题覆盖《凡人修仙传》和《凡人修仙之仙界篇》，采用轻剧透、原创百科摘要方式整理，不复制章节正文。</p>
</div>

## 专题地图

<div class="category-grid">
  ${sectionCards}
</div>

## 当前批次

<div class="stats-grid">
  <div class="stat-card"><strong>${total}</strong><span>第一批种子词条</span></div>
  <div class="stat-card"><strong>${sections.length}</strong><span>专题索引</span></div>
  <div class="stat-card"><strong>2</strong><span>覆盖作品</span></div>
  <div class="stat-card"><strong>0</strong><span>不收录小说正文</span></div>
</div>

## 推荐先看

<div class="entry-grid">
  ${featuredCards}
</div>

## 补全路线

| 批次 | 重点 | 目标 |
| --- | --- | --- |
| 第一批 | 专题结构和种子词条 | 建好 RMJI 专区、分类索引和可搜索双语页面。 |
| 第二批 | 人物与势力细节 | 补韩立、南宫婉、主要对手、宗门人物和势力关系。 |
| 第三批 | 逐章核对 | 为待核对词条补准确阶段、出场线索和交叉引用。 |
| 第四批 | 可视化 | 增加界域路线图、势力关系图和仙界法则体系图。 |

## 合法阅读

${renderSources(locale)}`
  writeDoc(`${isEn ? 'en/' : ''}rmji/index.md`, frontmatter({
    title: isEn ? 'RMJI Universe' : '凡人修仙传专题',
    description: isEn
      ? "A bilingual topic index for A Record of a Mortal's Journey to Immortality and its Immortal World Arc."
      : '《凡人修仙传》《凡人修仙之仙界篇》功法、法宝、丹药、宗门、族群、界域和法则专题。'
  }) + body)
}

rmjiHome('zh')
rmjiHome('en')

for (const section of sections) {
  sectionIndex('zh', section)
  sectionIndex('en', section)
}

for (const entry of allEntries) {
  writeDoc(`rmji/${entry.section}/${entry.slug}.md`, entryPage('zh', entry))
  writeDoc(`en/rmji/${entry.section}/${entry.slug}.md`, entryPage('en', entry))
}

console.log(`Generated RMJI topic pages: ${allEntries.length} entries, ${sections.length} sections, bilingual.`)
