import { createHash } from 'node:crypto'

export const discoveryCategories = Object.freeze([
  'chat',
  'writing',
  'image',
  'video',
  'coding',
  'audio',
  'research',
  'marketing',
  'automation'
])
export const discoveryPricingModes = Object.freeze(['free', 'freemium', 'paid', 'contact'])
export const discoveryChineseSupportModes = Object.freeze(['native', 'partial', 'none'])
export const discoveryAccessModes = Object.freeze(['web', 'desktop', 'mobile', 'api', 'extension'])

const listSchema = (minimum, maximum, itemMaximum = 100, extra = {}) => ({
  type: 'array',
  minItems: minimum,
  maxItems: maximum,
  items: { type: 'string', minLength: 2, maxLength: itemMaximum },
  ...extra
})

const required = Object.freeze([
  'slug',
  'name',
  'category',
  'tagline',
  'description',
  'bestFor',
  'features',
  'pricing',
  'pricingMode',
  'chineseSupport',
  'accessModes',
  'requiresAccount',
  'tags',
  'searchTerms',
  'pros',
  'cons'
])

export const discoveryDraftJsonSchema = Object.freeze({
  type: 'object',
  additionalProperties: false,
  required,
  properties: {
    slug: { type: 'string', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', minLength: 1, maxLength: 80 },
    name: { type: 'string', minLength: 1, maxLength: 160 },
    category: { type: 'string', enum: discoveryCategories },
    tagline: { type: 'string', minLength: 8, maxLength: 120 },
    description: { type: 'string', minLength: 20, maxLength: 500 },
    bestFor: listSchema(3, 3, 80),
    features: listSchema(3, 3, 80),
    pricing: { type: 'string', minLength: 8, maxLength: 160 },
    pricingMode: { type: 'string', enum: discoveryPricingModes },
    chineseSupport: { type: 'string', enum: discoveryChineseSupportModes },
    accessModes: { type: 'array', minItems: 1, maxItems: 5, uniqueItems: true, items: { type: 'string', enum: discoveryAccessModes } },
    requiresAccount: { type: 'boolean' },
    tags: listSchema(2, 5, 30),
    searchTerms: listSchema(2, 8, 40),
    pros: listSchema(2, 4, 100),
    cons: listSchema(2, 4, 100)
  }
})

const categories = new Set(discoveryCategories)
const pricingModes = new Set(discoveryPricingModes)
const chineseSupportModes = new Set(discoveryChineseSupportModes)
const accessModes = new Set(discoveryAccessModes)
const requiredKeys = new Set(required)
const chineseCharacterPattern = /[\u3400-\u4DBF\u4E00-\u9FFF]/u
const citationFields = Object.freeze([
  'name',
  'tagline',
  'description',
  'bestFor',
  'features',
  'pricing',
  'tags',
  'searchTerms',
  'pros',
  'cons'
])
const citationFieldSet = new Set(citationFields)
const groundedDrafts = new WeakMap()
const structuralMarkupPatterns = Object.freeze([
  /<\/?[a-z][^<>]*>/iu,
  /<!--|-->/u,
  /\bon[a-z]+\s*=/iu,
  /!?\[[^\]\r\n]*\]\([^\)\r\n]+\)/u,
  /(?:^|[\r\n])\s*\[[^\]\r\n]+\]:\s*\S+/u,
  /```|~~~/u,
  /(?:^|[\r\n])\s*---\s*(?:[\r\n]|$)/u,
  /(?:^|[\r\n])\s{0,3}#{1,6}\s+/u,
  /`/u,
  /~~[^~\r\n]+~~/u,
  /(?:\*\*[^*\r\n]+\*\*|__[^_\r\n]+__|\*[^*\r\n]+\*|_[^_\r\n]+_)/u,
  /(?:^|[\r\n])\s{0,3}(?:[-+*]|\d+[.)])\s+/u,
  /(?:^|[\r\n])\s{0,3}>\s?/u,
  /(?:^|[\r\n])[ \t]{0,3}(?:(?:\*[ \t]*){3,}|(?:_[ \t]*){3,}|(?:=[ \t]*){3,})(?:[\r\n]|$)/u,
  /(?:^|[\r\n])[ \t]{0,3}\|?[ \t]*:?-{3,}:?[ \t]*(?:\|[ \t]*:?-{3,}:?[ \t]*)+\|?[ \t]*(?:[\r\n]|$)/u
])
const vueStructuralPatterns = Object.freeze([
  /\{\s*\{[\s\S]*?\}\s*\}/u,
  /(?:^|[\s"'(<\[,])v-[A-Za-z_][\w.-]*(?::[^\s=]+)?(?:\s*=|\s|$)/iu,
  /(?:^|[\s"'(<\[,])(?:@|:|#)(?:[A-Za-z_][\w.-]*|\[[^\]\r\n]+\])(?:\.[^\s=]+)*\s*=/u
])
const actionAndQualifierAnchors = Object.freeze({
  automatic: /\b(?:automatic|automatically|autonomous(?:ly)?|one[- ]click)\b|自动|自主|一键/iu,
  create: /\b(?:create(?:s|d|ing)?|generat(?:e[sd]?|ing|ion|ions|or|ors)|produce(?:s|d|ing)?|draft(?:s|ed|ing)?)\b|生成|创建|制作|产出|形成/iu,
  deletion: /\b(?:delete(?:s|d|ing)?|deletion|remove(?:s|d|ing)?|removal|erase(?:s|d|ing)?|purge(?:s|d|ing)?|discard(?:s|ed|ing)?)\b|删除|移除|清除|抹除/iu,
  detect: /\b(?:detect(?:s|ed|ing|ion|ions|or|ors)?|identif(?:y|ies|ied|ying|ication|ications)|recogni(?:ze|zes|zed|zing|tion|tions)|scan(?:s|ned|ning|ner|ners)?)\b|检测|识别|扫描/iu,
  export: /\b(?:export(?:s|ed|ing|er|ers)?|download(?:s|ed|ing)?)\b|导出|下载/iu,
  extract: /\b(?:extract(?:s|ed|ing|ion|ions|or|ors)?|pull(?:s|ed|ing)?|retrieve(?:s|d|ing)?|retrieval)\b|提取|抽取|检索/iu,
  organize: /\b(?:organi[sz](?:e|es|ed|ing|ation|ations)|structures?|structuring|arrange(?:s|d|ing|ment|ments))\b|整理|组织/iu,
  predict: /\b(?:predict(?:s|ed|ing|ion|ions|ive)?|forecast(?:s|ed|ing)?|estimate(?:s|d|ing)?)\b|预测|预估/iu,
  realtime: /\b(?:real[- ]?time|live\s+(?:data|updates?|results?|feeds?|transcription|captions?|monitoring|analytics|collaboration)|instant(?:ly)?)\b|实时|即时/iu,
  summarize: /\b(?:summar(?:y|ies)|summari[sz](?:e|es|ed|ing|ation|ations)|brief(?:s|ed|ing)?|condense(?:s|d|ing)?|notes?)\b|摘要|总结|简报|笔记/iu,
  support: /\b(?:support(?:s|ed|ing)?|provid(?:e|es|ed|ing)|offer(?:s|ed|ing)?|receiv(?:e|es|ed|ing))\b|支持|提供/iu,
  trace: /\b(?:trace(?:s|d|ing)?|track(?:s|ed|ing)?|provenance)\b|回溯|追踪|追溯|保留(?:(?:人工)?核验流程|来源|链接|证据)/iu
})
const factualAnchors = Object.freeze({
  ai: /\b(?:ai|artificial intelligence|llm|machine learning)\b|人工智能|大模型|机器学习/iu,
  account: /\b(?:accounts?|sign ?up|log ?in|registration)\b|账户|账号|注册|登录/iu,
  api: /\bapi\b|接口/iu,
  automation: /\b(?:automat\w*|workflow)\b|自动化|工作流/iu,
  audio: /\b(?:audio|voice|speech|music|podcast)\b|音频|语音|声音|音乐|播客/iu,
  code: /\b(?:code|coding|developer|programming)\b|代码|编程|开发/iu,
  collaboration: /\b(?:teams?|collaborat\w*)\b|团队|协作/iu,
  deletion: /\b(?:delete|remove|erase|purge|discard)\w*\b|删除|移除|清除|抹除/iu,
  evidence: /\b(?:evidence|verify|verification|fact|citation|trace)\w*\b|证据|依据|事实|核验|验证|回溯|来源线索|脉络/iu,
  export: /\b(?:export|download)\w*\b|导出|下载/iu,
  factCheck: /\b(?:fact[- ]?check\w*|verify(?:ing|ies|ied)?\s+(?:the\s+)?facts?|check(?:ing|s|ed)?\s+(?:the\s+)?facts?)\b|(?:自动|自主|一键|直接)(?:核验|验证|核查|检查)(?:事实|信息)|(?:事实|信息)(?:自动|自主|一键|直接)?(?:核查|检查|验证)/iu,
  image: /\b(?:image|photo|picture|design)\b|图像|图片|照片|设计/iu,
  cancer: /\bcancer\b|癌症|肿瘤/iu,
  credentials: /\b(?:credentials?|passwords?|passcodes?|secrets?|(?:api|access|account|auth(?:entication|orization)?|bearer|refresh|session|login|security)[- ]*(?:keys?|tokens?)|login details?)\b|凭据|密码|口令|秘密|密钥|秘钥|(?:API|访问|账户|账号|认证|授权|承载|刷新|会话|登录|安全)\s*令牌|登录信息|盗号/iu,
  deepfake: /\b(?:deepfake|face[- ]?swap|voice clon\w*)\b|深度伪造|深伪|AI\s*换脸|(?:声音|语音)克隆/iu,
  diagnosis: /\bdiagnos\w*\b|诊断|确诊/iu,
  funding: /\b(?:funding|funded|raised|valuation|venture capital)\b|融资|估值|风投/iu,
  health: /\b(?:medical|health|clinical|disease|symptoms?)\b|医疗|健康|临床|疾病|症状/iu,
  impersonation: /\bimpersonat\w*\b|冒充|仿冒/iu,
  malware: /\b(?:malware|ransomware|trojans?|spyware|keyloggers?|exploit payloads?)\b|恶意软件|勒索软件|木马|间谍软件|键盘记录器|漏洞利用(?:载荷)?/iu,
  marketing: /\b(?:marketing|campaign|social media|sales)\b|营销|社媒|销售/iu,
  offline: /\b(?:offline|local[- ]?first|on[- ]device|runs? locally|local(?:ly)? processing)\b|离线(?:处理|使用|运行|模式)?|本地(?:处理|推理|运行|部署)|端侧(?:处理|推理|运行)?/iu,
  organize: /\b(?:organiz\w*|structure\w*|workflow)\b|整理|结构化|流程/iu,
  personal: /\b(?:personal|personalized|individual|individualized)\b|个人|个体|个性化/iu,
  prediction: /\b(?:predict\w*|forecast\w*|risk assessment|risk scoring)\b|预测|预估|风险(?:评估|评分)/iu,
  pricing: /\b(?:free|paid|plans?|pricing|prices?|subscriptions?|tiers?|quotas?|costs?|quotes?|contact\s+sales)\b|免费|付费|方案|套餐|价格|定价|报价|订阅|额度|收费|联系销售/iu,
  privacy: /\b(?:private|privacy|zero[- ]retention|no[- ]logs?|data protection)\b|隐私|私密|零数据保留|不(?:保存|记录|上传)(?:数据|内容)/iu,
  promotion: /\b(?:discount|promotion|promotional|promo|free trial)\b|优惠|折扣|促销|免费试用|活动价/iu,
  research: /\b(?:research|study|analysis)\b|研究|调研|分析/iu,
  revenue: /\b(?:revenue|annual recurring revenue|arr|income|sales volume)\b|营收|收入|销售额/iu,
  source: /\b(?:source|document|material|link)\w*\b|来源|资料|文档|链接/iu,
  summary: /\b(?:summar\w*|brief|notes?)\b|摘要|简报|笔记|总结/iu,
  translation: /\b(?:chinese|language|multilingual|translat\w*)\b|中文|语言|翻译/iu,
  video: /\bvideo\b|视频/iu,
  writing: /\b(?:write|writing|content|text)\b|写作|内容|文本/iu
})
const capabilityActionNames = Object.freeze([
  'create',
  'deletion',
  'detect',
  'export',
  'extract',
  'organize',
  'predict',
  'summarize',
  'support',
  'trace'
])
const relationObjectAnchorGroups = Object.freeze({
  provenance: Object.freeze(['evidence', 'factCheck', 'source']),
  account: Object.freeze(['account']),
  credentials: Object.freeze(['credentials']),
  summary: Object.freeze(['summary']),
  media: Object.freeze(['audio', 'deepfake', 'image', 'impersonation', 'video']),
  health: Object.freeze(['cancer', 'diagnosis', 'health']),
  code: Object.freeze(['code']),
  language: Object.freeze(['translation']),
  finance: Object.freeze(['funding', 'revenue']),
  pricing: Object.freeze(['pricing', 'promotion'])
})
const relationQualifierAnchors = Object.freeze({
  automatic: actionAndQualifierAnchors.automatic,
  realtime: actionAndQualifierAnchors.realtime,
  offline: factualAnchors.offline,
  privacy: factualAnchors.privacy,
  promotion: factualAnchors.promotion,
  limitedTime: /\blimited[- ]time\b|限时/iu,
  newUser: /\b(?:new|first[- ]time)\s+(?:users?|customers?|subscribers?|members?)\b|(?:新|首次)(?:用户|客户|订阅者|会员|成员)/iu,
  existingUser: /\b(?:existing|current|returning)\s+(?:users?|customers?|subscribers?|members?)\b|(?:现有|当前|老|既有)(?:用户|客户|订阅者|会员|成员)/iu,
  firstMonth: /\bfirst[- ]month\b|\bfirst\s+month\b|首个?月|第一个月|头一个月/iu,
  monthly: /\b(?:per\s+month|monthly)\b|每月|月付/iu,
  yearly: /\b(?:per\s+year|yearly|annual(?:ly)?)\b|每年|年付/iu,
  trial: /\bfree\s+trial\b|免费试用/iu
})
const POLICY_DOCUMENT_PATTERN = /\b(?:privacy|cookie)(?:\s*(?:and|&|\/)\s*(?:privacy|cookie))?\s+polic(?:y|ies)\b|(?:隐私|Cookie)(?:与|和|及|&|\/)?(?:隐私|Cookie)?政策/iu
const RELATION_SEPARATOR_PATTERN = /(?:,\s*(?:(?:and|or|but|then|yet)\s+)?|，|、|[&＆]|\b(?:and|or|nor|but|yet|while|whereas)\b|并且|以及|同时|并|且|但|而|或|和|及|又)/giu
const SUMMARY_PREDICATE_PATTERN = /\b(?:summari[sz](?:e|es|ed|ing)|brief(?:s|ed|ing)|condense(?:s|d|ing)?)\b|总结/iu
const FUNDING_PREDICATE_PATTERN = /\b(?:fund(?:s|ed|ing)?|rais(?:e|es|ed|ing)|valu(?:e|es|ed|ing|ation))\b|(?:完成|获得|宣布|公司)?(?:新一轮)?融资|估值/iu
const REVENUE_PREDICATE_PATTERN = /\b(?:earn(?:s|ed|ing)?|generat(?:e|es|ed|ing))?\s*(?:revenue|income|sales)\b|营收|收入|销售额/iu
const PROMOTION_PREDICATE_PATTERN = /\b(?:discount|discounted|promotion|promotional|promo|percent\s+off|free\s+trial)\b|优惠|折扣|促销|免费试用|活动价/iu
const PRICING_PREDICATE_PATTERN = /\b(?:costs?|priced?|charges?|show(?:s|ed|ing)?|display(?:s|ed|ing)?|list(?:s|ed|ing)?|contact\s+sales|request(?:s|ed|ing)?\s+(?:a\s+)?quote|ask(?:s|ed|ing)?\s+customers?\s+to\s+contact\s+sales)\b|仅需|售价|收费|展示|列出|说明|联系销售|获取报价|索取报价/iu
const PRICING_AMOUNT_PATTERN = /(?:[$€£¥]\s*\d|\d(?:[\d.,]*)\s*(?:(?:元|人民币|美元|美金|欧元|英镑)(?![\p{L}\p{N}])|(?:usd|cny|rmb|eur|gbp)\b))/iu
const PROMOTION_BENEFICIARY_PATTERNS = Object.freeze({
  newUser: /\b(?:new|first[- ]time)\s+(?:users?|customers?|subscribers?|members?)\b|(?:新|首次)(?:用户|客户|订阅者|会员|成员)/iu,
  existingUser: /\b(?:existing|current|returning)\s+(?:users?|customers?|subscribers?|members?)\b|(?:现有|当前|老|既有)(?:用户|客户|订阅者|会员|成员)/iu
})
const FUNDING_FOUNDER_SUBJECT_PATTERN = /\b(?:founders?|cofounders?|co-founders?)\b|创始人|联合创始人/iu
const FUNDING_COMPANY_SUBJECT_PATTERN = /\b(?:company|business|startup|corporation|enterprise|platform|product)\b|公司|企业|平台|产品/iu
const CATALOG_FRAMING_PATTERNS = Object.freeze([
  /^(?:这|本)(?:是|为)一款(?:AI|人工智能)(?:研究)?(?:工具|助手|平台|产品|应用)$/iu,
  /^(?:适合|面向|用于)(?:研究)?(?:团队|用户|工作|流程)$/iu,
  /^(?:关键|重要)(?:事实|信息)(?:仍|还)?(?:需|需要)?(?:人工)?(?:核验|验证|检查)$/iu,
  /^(?:核对|检查)(?:资料来源|来源依据|来源|依据|证据|链接)$/iu,
  /^(?:方便|便于)(?:回到|返回|查看)(?:资料)?(?:来源|依据|链接)(?:人工)?(?:核验|检查)?$/iu,
  /^(?:来源|证据|脉络|流程)(?:脉络|流程)?(?:较)?(?:清楚|清晰|直接|方便|完整)$/iu,
  /^(?:构建|建立)(?:研究)?(?:笔记|简报)$/iu,
  /^(?:完整|高级|部分|全部)?(?:能力|功能|额度)(?:可能|仍|还)?(?:依赖|需要|收费)(?:账户)?(?:方案|套餐)?$/iu,
  /^(?:manual|human)\s+(?:review|verification)\s+(?:is\s+)?required(?:\s+for\s+important\s+facts)?$/iu,
  /^(?:for|built\s+for|designed\s+for)\s+(?:research\s+)?teams?$/iu
])
const PRICING_FRAMING_PATTERNS = Object.freeze([
  /^官网(?:展示|列出|说明)(?:可用)?(?:方案|套餐|价格|定价)$/iu,
  /^(?:具体)?(?:额度|价格|定价|套餐|方案)(?:与|和|及)?(?:具体)?(?:额度|价格|定价|套餐|方案)?以官网为准$/iu,
  /^(?:details?|pricing|prices?|plans?|quotas?)\s+(?:remain\s+)?(?:subject\s+to|as\s+shown\s+on)\s+(?:the\s+)?official\s+(?:site|website)$/iu
])
const CATALOG_METADATA_PATTERN = /^(?:(?:公开|研究)?(?:资料|来源|证据|依据|文档|链接)(?:整理|核验|验证|回溯|追溯|笔记)?|(?:研究|资料)(?:笔记|简报)|(?:来源|证据)(?:(?:核验|验证)?工具|核验|验证)|(?:AI|人工智能)(?:研究)?(?:工具|助手))$/iu
const NOMINAL_CAPABILITY_PATTERN = /^(?:(?:结构化)?(?:摘要|笔记|简报)|(?:来源|链接|证据)(?:回溯|追溯|核验))$/iu
const chineseDigits = Object.freeze({ 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 })
const chineseSmallUnits = Object.freeze({ 十: 10, 百: 100, 千: 1_000 })
const disallowedClaimPatterns = Object.freeze([
  /(?:全球|行业|市场|国内|世界)(?:第一|领先|最佳|最强|排名)/iu,
  /排名\s*(?:第?一|top\s*\d+)/iu,
  /(?:百万|千万|亿万|\d+(?:\.\d+)?\s*(?:万|亿))\s*(?:用户|客户|团队|公司)/iu,
  /(?:100%|百分之百)\s*(?:准确|可靠|安全|保证)/iu,
  /(?:保证|承诺)\s*(?:收录|效果|准确|收益)/iu,
  /(?:永久|完全|全部)免费/iu,
  /无限(?:额度|次数|使用)/iu,
  /官方(?:授权|合作伙伴|认证)/iu,
  /评分\s*[:：]?\s*\d/iu,
  /\b(?:best|number one|no\.?\s*1|top\s*\d+)\b/iu,
  /\b\d+(?:\.\d+)?\s*(?:million|billion)\s+(?:users|customers|teams|companies)\b/iu,
  /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand|million|billion|\d+(?:\.\d+)?)\s+(?:thousand|million|billion)?\s*(?:users|customers|teams|companies)\b/iu
])
const PROHIBITED_MEDICAL_DRAFT_PATTERN = /\b(?:diagnos\w*|prescri\w*|cure[sd]?|medical treatment|medical advice|health advice|clinical decision\w*|symptom assessment|treatment recommendations?)\b|诊断|处方|治愈|治疗方案|医疗建议|健康建议|临床决策|症状(?:评估|判断)|用药建议|治疗建议/iu
const PERSONAL_MEDICAL_MARKER_PATTERN = /(?:\b(?:persons?|people|patients?|individuals?|(?:user|patient|person|individual)['’]s|personali[sz]ed|individuali[sz]ed|personal|(?:user|patient|person|individual)[- ](?:specific|level)|specific\s+to\s+(?:a|an|the|each|every)?\s*(?:user|patient|person|individual)|(?:each|every|per[- ]?)\s*(?:user|patient|person|individual)|(?:for|to)\s+(?:each|every)\s+(?:user|patient|person|individual))\b|\b(?:users|patients|persons|individuals)['’](?=\s|[^\p{L}\p{N}_])|个人|个体|个性化|个体化|个人化|患者|病人|(?:用户|患者|病人|个人|个体)(?:的|专属)|用户特定|患者特定|针对(?:每(?:位|个)?(?:用户|患者|病人|个人)|个人|个体|患者|病人|用户)|每(?:位|个)?(?:用户|患者|病人|个人)|逐(?:位|个)?(?:用户|患者|病人|个人)|按(?:用户|患者|病人|个人|个体))/iu
const MEDICAL_RISK_SUBJECT_PATTERN = /\b(?:cancer|tumou?rs?|diseases?|illness(?:es)?|medical|health(?:care)?|clinical|symptoms?|oncolog\w*)\b|患癌|患病|癌症?|肿瘤|疾病|病症|医疗|健康|临床|症状/iu
const MEDICAL_RISK_OUTCOME_PATTERN = /\b(?:risks?|odds?|chances?|likelihoods?|probabilit(?:y|ies)|prognos(?:is|es)|predictions?|scores?|scoring|assessments?|outcomes?|diagnos\w*|advice|treatments?)\b|风险|概率|几率|机率|胜算|可能性|结局|结果|预后|预测|评分|评估|诊断|建议|治疗/iu
const SECURITY_HARM_PATTERN = /\b(?:malware|ransomware|phishing|(?:steal(?:s|ing)?|stole|stolen)\s+(?:(?:account|user)\s+)?(?:credentials?|passwords?|login details?)|credential theft|trojans?|computer viruses|spyware|keyloggers?|exploit payloads?)\b|恶意软件|勒索软件|网络钓鱼|(?:窃取|盗取).{0,8}(?:凭据|密码|登录信息)|盗号|木马|计算机病毒|间谍软件|键盘记录器|漏洞利用(?:载荷)?/iu
const DECEPTIVE_MEDIA_TERM_PATTERN = /\b(?:deepfake|impersonat\w*|voice\s+clon\w*|face[- ]?swap\w*)\b|深度伪造|深伪|(?:声音|语音)(?:冒充|克隆)|(?:冒充|仿冒).{0,8}(?:声音|语音|人脸)|AI\s*换脸/iu
const OFFENSIVE_ACTION_PATTERN = /\b(?:(?:generate|generator|create|build|deploy|spread|steal|harvest|bypass|clone|synthesize|impersonate|offensive)\w*|stole|stolen)\b|生成|制作|部署|传播|窃取|盗取|盗号|收割|绕过|克隆|合成|冒充|攻击性/iu
const DEFENSIVE_ACTION_PATTERN = /\b(?:anti[- ]?(?:malware|phishing)|detect(?:s|ion|or)?|prevent(?:s|ion)?|protect(?:s|ion)?|block(?:s|ing)?|scanner|security|defen[sc]e|verification|analysis|sandbox|simulation|training|removal)\b|反钓鱼|检测|识别|防御|拦截|阻止|安全|保护|核验|分析|沙箱|演练|培训|清除/iu
const CREDENTIAL_SECRET_PATTERN = /\b(?:credentials?|passwords?|passcodes?|secrets?|(?:api|access|account|auth(?:entication|orization)?|bearer|refresh|session|login|security)[- ]*(?:keys?|tokens?)|login\s+(?:details?|secrets?)|account\s+secrets?|password\s+hashes?)\b|凭据|密码|口令|秘密|密钥|秘钥|API\s*密钥|登录信息|账号密码|账户密码|访问令牌|账户令牌|账号令牌|认证令牌|授权令牌|承载令牌|刷新令牌|会话令牌|登录令牌|安全令牌/iu
const CREDENTIAL_ACQUISITION_PATTERN = /\b(?:extract(?:s|ed|ing|ion)?|dump(?:s|ed|ing|ped|ping)?|captur(?:e|es|ed|ing)|collect(?:s|ed|ing|ion)?|harvest(?:s|ed|ing)?|access(?:es|ed|ing)?|exfiltrat(?:e|es|ed|ing|ion)|obtain(?:s|ed|ing)?|acquir(?:e|es|ed|ing)|retriev(?:e|es|ed|ing))\b|提取|抽取|倾倒|导出|捕获|抓取|采集|收集|收割|访问|读取|获取|取得|窃取|盗取|外传|泄露/iu
const INHERENTLY_OFFENSIVE_CREDENTIAL_PATTERN = /\b(?:dump(?:s|ed|ing|ped|ping)?|harvest(?:s|ed|ing)?|exfiltrat(?:e|es|ed|ing|ion)|steal(?:s|ing)?|stole|stolen)\b|窃取|盗取|盗号|收割|外传|泄露/iu
const NONCONSENSUAL_CREDENTIAL_PATTERN = /\b(?:without|lacking)\s+(?:(?:the|a|any|their|his|her|its|user|customer|owner|(?:the\s+)?(?:users?|customers?|owners?)(?:['’]s?)?)\s+)?(?:permission|consent|authori[sz]ation)\b|\b(?:no|absent)\s+(?:(?:their|his|her|its|user|customer|owner)\s+)?(?:permission|consent|authori[sz]ation)\b|\b(?:not\s+authori[sz]ed|unauthori[sz]ed)\b|\b(?:bypass|circumvent|evade)(?:es|ed|ing)?\b|\b(?:other users?|other people|another\s+(?:user|person|customer)(?:['’]s)?|third[- ]part(?:y|ies)|victims?|someone else['’]s)\b|\bbelong(?:s|ing)?\s+to\s+(?:other users?|other people|third part(?:y|ies))\b|未经(?:(?:其|用户|客户|所有者|本人)(?:的)?)?(?:许可|授权|同意)|未获(?:(?:其|用户|客户|所有者|本人)(?:的)?)?(?:许可|授权|同意)|未(?:取得|得到)(?:(?:其|用户|客户|所有者|本人)(?:的)?)?(?:许可|授权|同意)|没有(?:(?:其|用户|客户|所有者|本人)(?:的)?)?(?:许可|授权|同意)|未授权|无授权|擅自|绕过|绕开|规避|非法|无权|他人|其他用户|受害者|第三方/iu
const NEGATED_CREDENTIAL_ACQUISITION_PATTERN = /\b(?:does?\s+not|never|without)\s+(?:extract|dump|capture|collect|harvest|access|obtain|acquire|retrieve|store)(?:s|ed|ing)?\b|不(?:提取|抽取|导出|捕获|抓取|采集|收集|收割|访问|读取|获取|存储)|不会(?:提取|抽取|导出|捕获|抓取|采集|收集|收割|访问|读取|获取|存储)/iu
const DEFENSIVE_CREDENTIAL_RELATION_PATTERN = /\b(?:password|credential)\s+(?:manager|management|vault|autofill|security|audit|strength|rotation|reset|recovery)\b|\bauthori[sz]ed\s+(?:security\s+)?(?:audit|assessment|test(?:ing)?)\b|\b(?:breach|leak|compromised credential|weak password)\s+(?:detection|monitoring|scanner|audit)\b|\b(?:your|their own)\s+(?:saved|stored|own)?\s*(?:credentials?|passwords?)\b|密码管理器|凭据管理|密码保险库|自动填充|授权(?:安全)?(?:审计|评估|测试)|密码(?:安全|审计|强度|轮换|重置|恢复)|凭据(?:安全|审计)|泄露(?:检测|监测)|弱密码(?:检测|审计)|用户自己(?:保存|存储)?的?密码/iu
const PASSWORD_MANAGER_PATTERN = /\b(?:password|credential)\s+(?:manager|management|vault|autofill)\b|密码管理器|凭据管理|密码保险库|自动填充/iu
const AUTHORIZED_CONTROL_PATTERN = /\bauthori[sz](?:e|es|ed|ing|ation)\b|\bapproved\b|(?:已)?授权|经(?:客户|用户|所有者)?授权/iu
const SECURITY_AUDIT_CONTEXT_PATTERN = /\b(?:security\s+(?:audit|assessment|test(?:ing)?)|audit|assessment|penetration\s+test(?:ing)?)\b|安全(?:审计|评估|测试)|审计|评估|渗透测试/iu
const CONTROLLED_CREDENTIAL_PATTERN = /\b(?:synthetic|test(?:ing)?|customer[- ](?:provided|supplied|owned)|client[- ](?:provided|supplied|owned))\b|\b(?:provided|supplied|owned)\s+(?:by|for)\s+(?:the\s+)?(?:customer|client|owner|user)\b|\b(?:customer|client|owner|user)(?:'s|s')?\s+own\b|测试|合成|模拟|客户提供|用户提供|客户自有|用户自有|用户自己/iu
const PRECEDING_NEGATION_PATTERN = /(?:\b(?:not|never|without|cannot|can't|doesn't|isn't|aren't|won't)\b|\b(?:do|does|did|is|are|was|were|will|can)\s+not\b|\bno\b(?![- ]code)|(?:从未|尚未|并非|不会|不能|不可|无法|没有|无需|未曾|不|未|无)(?!限))[^.!?。！？；;,，]{0,40}$/iu
const UNAVAILABLE_ASSERTION_PATTERN = /\b(?:unavailable|unsupported|disabled)\b|不可用|不支持|未提供|已禁用/iu

function invalid() {
  throw new Error('discovery_enricher_invalid_output')
}

function normalizedString(value, minimum, maximum) {
  if (typeof value !== 'string') return invalid()
  if (/[\p{Cf}\p{Default_Ignorable_Code_Point}]/u.test(value)) return invalid()
  const securityForms = [value, value.normalize('NFKC')]
  if (securityForms.some((text) => structuralMarkupPatterns.some((pattern) => pattern.test(text))
    || vueStructuralPatterns.some((pattern) => pattern.test(text)))) return invalid()
  const normalized = value.trim().replace(/\s+/gu, ' ')
  if (normalized.length < minimum || normalized.length > maximum || /[\u0000-\u001f\u007f]/u.test(normalized)) {
    return invalid()
  }
  return normalized
}

const citationStringSchema = Object.freeze({ type: 'string', minLength: 2, maxLength: 400 })
const citationsSchema = Object.freeze({
  type: 'object',
  additionalProperties: false,
  required: citationFields,
  properties: Object.freeze({
    name: citationStringSchema,
    tagline: citationStringSchema,
    description: citationStringSchema,
    bestFor: listSchema(3, 3, 400),
    features: listSchema(3, 3, 400),
    pricing: citationStringSchema,
    tags: listSchema(2, 5, 400),
    searchTerms: listSchema(2, 8, 400),
    pros: listSchema(2, 4, 400),
    cons: listSchema(2, 4, 400)
  })
})

export const discoveryEnrichmentJsonSchema = Object.freeze({
  type: 'object',
  additionalProperties: false,
  required: Object.freeze(['draft', 'citations']),
  properties: Object.freeze({
    draft: discoveryDraftJsonSchema,
    citations: citationsSchema
  })
})

function normalizedList(value, minimum, maximum, itemMaximum) {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) return invalid()
  const normalized = value.map((entry) => normalizedString(entry, 2, itemMaximum))
  if (new Set(normalized).size !== normalized.length) return invalid()
  return Object.freeze(normalized)
}

function draftProseItems(draft) {
  return [
    draft.name,
    draft.tagline,
    draft.description,
    draft.pricing,
    ...draft.bestFor,
    ...draft.features,
    ...draft.tags,
    ...draft.searchTerms,
    ...draft.pros,
    ...draft.cons
  ].map((value) => String(value).normalize('NFKC').replace(/\s+/gu, ' '))
}

export function hasProhibitedPersonalMedicalClaim(items) {
  const normalizedItems = items.map((item) => normalizedEvidence(item)).filter(Boolean)
  return normalizedItems.some((item) => PERSONAL_MEDICAL_MARKER_PATTERN.test(item))
    && normalizedItems.some((item) => MEDICAL_RISK_SUBJECT_PATTERN.test(item))
    && normalizedItems.some((item) => MEDICAL_RISK_OUTCOME_PATTERN.test(item))
}

function credentialRelationSegments(items) {
  return items.flatMap((item) => relationSegments(item))
}

function isNarrowDefensiveCredentialRelation(segment) {
  if (NONCONSENSUAL_CREDENTIAL_PATTERN.test(segment)) return false
  if (PASSWORD_MANAGER_PATTERN.test(segment)
    && /\b(?:your|their own|saved|stored)\b|用户自己(?:保存|存储)?的?/iu.test(segment)) return true
  if (AUTHORIZED_CONTROL_PATTERN.test(segment)
    && SECURITY_AUDIT_CONTEXT_PATTERN.test(segment)
    && CONTROLLED_CREDENTIAL_PATTERN.test(segment)) return true
  return DEFENSIVE_CREDENTIAL_RELATION_PATTERN.test(segment)
    && NEGATED_CREDENTIAL_ACQUISITION_PATTERN.test(segment)
}

export function hasProhibitedCredentialClaim(items, rejectUnknown = false) {
  return credentialRelationSegments(items).some((segment) => {
    if (!CREDENTIAL_SECRET_PATTERN.test(segment)) return false
    if (NONCONSENSUAL_CREDENTIAL_PATTERN.test(segment)
      || INHERENTLY_OFFENSIVE_CREDENTIAL_PATTERN.test(segment)) return true
    return false
  })
}

function assertNoUnsupportedClaims(draft) {
  const proseItems = draftProseItems(draft)
  const allText = proseItems.join('\n')
  const clauses = allText.split(/[\r\n.!?,:。！？；;，：]+/u)
  if (disallowedClaimPatterns.some((pattern) => pattern.test(allText))) return invalid()
  if (PROHIBITED_MEDICAL_DRAFT_PATTERN.test(allText) || hasProhibitedPersonalMedicalClaim(proseItems)) return invalid()
  if (hasProhibitedCredentialClaim(proseItems, true)) return invalid()
  if (clauses.some((clause) => {
    const securityOrDeception = SECURITY_HARM_PATTERN.test(clause) || DECEPTIVE_MEDIA_TERM_PATTERN.test(clause)
    return securityOrDeception
      && (OFFENSIVE_ACTION_PATTERN.test(clause) || !DEFENSIVE_ACTION_PATTERN.test(clause))
  })) return invalid()
  if (!/以官网为准[。！!]?$/u.test(draft.pricing)) return invalid()
}

export function parseDiscoveryDraft(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).length !== required.length
    || Object.keys(value).some((key) => !requiredKeys.has(key))) return invalid()

  const slug = normalizedString(value.slug, 1, 80)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)
    || !categories.has(value.category)
    || !pricingModes.has(value.pricingMode)
    || !chineseSupportModes.has(value.chineseSupport)
    || typeof value.requiresAccount !== 'boolean') return invalid()

  const access = normalizedList(value.accessModes, 1, 5, 20)
  if (access.some((mode) => !accessModes.has(mode))) return invalid()

  const draft = {
    slug,
    name: normalizedString(value.name, 1, 160),
    category: value.category,
    tagline: normalizedString(value.tagline, 8, 120),
    description: normalizedString(value.description, 20, 500),
    bestFor: normalizedList(value.bestFor, 3, 3, 80),
    features: normalizedList(value.features, 3, 3, 80),
    pricing: normalizedString(value.pricing, 8, 160),
    pricingMode: value.pricingMode,
    chineseSupport: value.chineseSupport,
    accessModes: access,
    requiresAccount: value.requiresAccount,
    tags: normalizedList(value.tags, 2, 5, 30),
    searchTerms: normalizedList(value.searchTerms, 2, 8, 40),
    pros: normalizedList(value.pros, 2, 4, 100),
    cons: normalizedList(value.cons, 2, 4, 100)
  }
  if (draft.searchTerms.some((term) => !chineseCharacterPattern.test(term))) return invalid()
  assertNoUnsupportedClaims(draft)
  return Object.freeze(draft)
}

function normalizedEvidence(value) {
  if (typeof value !== 'string') return ''
  return value.normalize('NFKC').trim().replace(/\s+/gu, ' ')
}

function evidenceText(evidence) {
  return [evidence?.title, evidence?.metaDescription, evidence?.visibleText]
    .map(normalizedEvidence)
    .filter(Boolean)
    .join('\n')
}

function anchorSet(value) {
  const text = normalizedEvidence(value)
  return new Set(Object.entries(factualAnchors)
    .filter(([, pattern]) => pattern.test(text))
    .map(([name]) => name))
}

function actionAndQualifierSet(value) {
  const text = normalizedEvidence(value)
  return new Set(Object.entries(actionAndQualifierAnchors)
    .filter(([, pattern]) => pattern.test(text))
    .map(([name]) => name))
}

function normalizedDecimal(value) {
  const number = Number(String(value).replace(',', '.'))
  return Number.isFinite(number) ? String(number) : ''
}

function parseChineseCardinal(value) {
  if (/^\d+(?:\.\d+)?$/u.test(value)) return Number(value)
  let total = 0
  let section = 0
  let digit = 0
  for (const character of value) {
    if (Object.hasOwn(chineseDigits, character)) {
      digit = chineseDigits[character]
      continue
    }
    if (character === '万') {
      total += (section + digit || 1) * 10_000
      section = 0
      digit = 0
      continue
    }
    const unit = chineseSmallUnits[character]
    if (!unit) return Number.NaN
    section += (digit || 1) * unit
    digit = 0
  }
  return total + section + digit
}

function currencyKey(value) {
  if (!value) return 'unspecified'
  if (/^(?:美元|美金|usd|\$)$/iu.test(value)) return 'usd'
  if (/^(?:人民币|元|cny|rmb|¥)$/iu.test(value)) return 'cny'
  if (/^(?:欧元|eur|€)$/iu.test(value)) return 'eur'
  if (/^(?:英镑|gbp|£)$/iu.test(value)) return 'gbp'
  return String(value).toLocaleLowerCase('en-US')
}

function exactFactSet(value) {
  let remainder = normalizedEvidence(value).toLocaleLowerCase('en-US')
  const facts = []
  const consume = (pattern, factFor) => {
    remainder = remainder.replace(pattern, (...match) => {
      const fact = factFor(...match)
      if (fact) facts.push(fact)
      return ' '.repeat(match[0].length)
    })
  }

  consume(/(\d+(?:\.\d+)?|[零〇一二两三四五六七八九十百千万]+)\s*(万|亿)\s*(美元|美金|人民币|元|欧元|英镑)?/gu,
    (_match, amount, unit, currency) => {
      const cardinal = parseChineseCardinal(amount)
      if (!Number.isFinite(cardinal)) return ''
      return `quantity:${cardinal * (unit === '亿' ? 100_000_000 : 10_000)}:${currencyKey(currency)}`
    })
  consume(/([$€£¥])\s*(\d+(?:[.,]\d+)?)/gu,
    (_match, currency, amount) => `money:${normalizedDecimal(amount)}:${currencyKey(currency)}`)
  consume(/(\d+(?:[.,]\d+)?)\s*((?:元|人民币|美元|美金|欧元|英镑)(?![\p{L}\p{N}])|(?:usd|cny|rmb|eur|gbp)\b)/giu,
    (_match, amount, currency) => `money:${normalizedDecimal(amount)}:${currencyKey(currency)}`)
  consume(/\b(\d+(?:[.,]\d+)?)\s*(million|billion|thousand)\b/gu,
    (_match, amount, unit) => `quantity:${normalizedDecimal(amount)}:${unit}`)
  consume(/(\d+(?:[.,]\d+)?)\s*%/gu,
    (_match, amount) => `percentage:${normalizedDecimal(amount)}`)
  consume(/([零〇一二两三四五六七八九十百]+|\d+(?:\.\d+)?)\s*折/gu,
    (_match, amount) => {
      const cardinal = parseChineseCardinal(amount)
      return Number.isFinite(cardinal) ? `discount:${cardinal}` : ''
    })
  facts.push(...[...remainder.matchAll(/\b\d+(?:\.\d+)?\b/gu)].map(([match]) => `number:${normalizedDecimal(match)}`))
  return new Set(facts)
}

function capabilityActionSet(value) {
  const anchors = actionAndQualifierSet(value)
  return new Set(capabilityActionNames.filter((name) => anchors.has(name)))
}

function relationActionSet(value) {
  const actions = capabilityActionSet(value)
  const objects = relationObjectSet(value)
  if (actions.has('summarize')
    && !actions.has('create')
    && !SUMMARY_PREDICATE_PATTERN.test(normalizedEvidence(value))) actions.delete('summarize')
  if (actions.has('support') && objects.has('pricing')) actions.delete('support')
  return actions
}

function relationObjectSet(value) {
  const anchors = anchorSet(value)
  return new Set(Object.entries(relationObjectAnchorGroups)
    .filter(([, names]) => names.some((name) => anchors.has(name)))
    .map(([family]) => family))
}

function relationQualifierSet(value) {
  const text = normalizedEvidence(value)
  return new Set(Object.entries(relationQualifierAnchors)
    .filter(([, pattern]) => pattern.test(text))
    .map(([name]) => name))
}

function relationBusinessPredicateSet(value) {
  const anchors = anchorSet(value)
  return new Set(['funding', 'revenue'].filter((name) => anchors.has(name)))
}

const POTENTIAL_ACTION_NON_VERBS = new Set([
  'accounts', 'credentials', 'customers', 'documents', 'evidence', 'findings', 'keys', 'members',
  'plans', 'results', 'sources', 'subscribers', 'teams', 'tokens', 'users'
])

function hasPotentialCoordinatedAction(value) {
  const text = normalizedEvidence(value)
  if (capabilityActionSet(text).size > 0) return true
  const firstObject = firstRelationObjectAfter(text, 0)
  if (/\p{Script=Latin}/u.test(text)) {
    const head = firstObject ? text.slice(0, firstObject.index) : text
    return [...head.matchAll(/\b([a-z][a-z-]{1,30}(?:s|ed|ing))\b/giu)]
      .some(([, word]) => !POTENTIAL_ACTION_NON_VERBS.has(word.toLocaleLowerCase('en-US')))
  }
  if (!/\p{Script=Han}/u.test(text)) return false
  const head = (firstObject ? text.slice(0, firstObject.index) : text)
    .replace(/^(?:它|其|该|这款|本款|工具|产品|平台)/u, '')
    .replace(/^(?:从未|不会|不能|不可|没有|未曾|不|未|无)/u, '')
    .replace(/[^\p{Script=Han}]/gu, '')
  return head.length > 0 && head.length <= 4
    && !/^(?:公开|研究|团队|用户|客户|产品|工具|资料|文档)$/u.test(head)
}

function coordinatedSharedComplement(value) {
  const text = normalizedEvidence(value)
  const actions = capabilityActionSet(text)
  const action = firstClaimedAction(text, actions)
  const object = firstRelationObjectAfter(text, action ? action.index + action.length : 0)
  if (!object) return ''
  const start = action ? action.index + action.length : object.index
  const complement = text.slice(start).replace(/^[\s,:：，]+/u, '').trim()
  return relationObjectSet(complement).size > 0
    ? complement
    : text.slice(object.index).trim()
}

function inheritCoordinatedComplement(value, complement) {
  if (!complement || relationObjectSet(value).size > 0 || !hasPotentialCoordinatedAction(value)) return value
  const separator = /\p{Script=Han}$/u.test(value) && /^\p{Script=Han}/u.test(complement) ? '' : ' '
  return `${value}${separator}${complement}`
}

function sharedNegationPrefix(value) {
  const text = normalizedEvidence(value)
  const english = /^(?:(?:it|this|that|the|a|an|they|we|he|she)\s+)?(does?\s+not|did\s+not|will\s+not|would\s+not|can(?:not|'t)|could\s+not|never|without)\b/iu.exec(text)
  if (english) return english[1]
  const chinese = /^(?:(?:它|其|该|这款|本款|工具|产品|平台))?(从未|不会|不能|不可|没有|未曾|不|未|无)/u.exec(text)
  return chinese?.[1] ?? ''
}

function coordinatorSharesNegation(value) {
  const connector = normalizedEvidence(value).toLocaleLowerCase('en-US')
  if (/\b(?:but|yet|while|whereas|then)\b|但|而|同时/u.test(connector)) return false
  return /,|，|、|[&＆]|\b(?:and|or|nor)\b|并且|以及|并|且|或|和|及|又/u.test(connector)
}

function inheritCoordinatedNegation(value, prefix) {
  if (!prefix || hasNegativeAssertion(value, relationActionSet(value))) return value
  const separator = /\p{Script=Han}$/u.test(prefix) && /^\p{Script=Han}/u.test(value) ? '' : ' '
  return `${prefix}${separator}${value}`
}

function shouldSplitRelation(left, right) {
  const leftActions = capabilityActionSet(left)
  const rightActions = capabilityActionSet(right)
  const leftBusiness = relationBusinessPredicateSet(left)
  const rightBusiness = relationBusinessPredicateSet(right)
  return (leftActions.size > 0 && rightActions.size > 0)
    || ((leftActions.size > 0 || leftBusiness.size > 0)
      && (rightActions.size > 0 || rightBusiness.size > 0))
    || (exactFactSet(left).size > 0 && exactFactSet(right).size > 0)
    || (!isLeadingRelationModifier(left)
      && hasAtomicAssertionSignal(left) && hasAtomicAssertionSignal(right))
    || (!isLeadingRelationModifier(left)
      && hasPotentialCoordinatedAction(left)
      && hasPotentialCoordinatedAction(right)
      && (relationObjectSet(left).size > 0 || relationObjectSet(right).size > 0))
}

function hasAtomicAssertionSignal(value) {
  return hasKnownFactualPredicate(value)
    || relationObjectSet(value).size > 0
    || relationQualifierSet(value).size > 0
    || exactFactSet(value).size > 0
    || isNarrowDefensiveCredentialRelation(value)
}

function isLeadingRelationModifier(value) {
  const text = normalizedEvidence(value)
  return capabilityActionSet(text).size === 0
    && relationObjectSet(text).size === 0
    && exactFactSet(text).size === 0
    && relationQualifierSet(text).size > 0
    && /^(?:for|during|within|under)\b|^(?:限时|面向|针对)/iu.test(text)
}

function splitStrongRelationBoundaries(value) {
  const matcher = /\b(?:although|though|however|whereas|while)\b|虽然|尽管|然而/giu
  const segments = []
  let start = 0
  for (const match of value.matchAll(matcher)) {
    const left = value.slice(start, match.index).trim()
    if (left) segments.push(left)
    start = match.index + match[0].length
  }
  const tail = value.slice(start).trim()
  if (tail) segments.push(tail)
  return segments.map((segment) => segment.replace(/^(?:,\s*)?(?:and|but)\s+/iu, '').trim())
}

function splitCoordinatedRelations(value) {
  const matcher = new RegExp(RELATION_SEPARATOR_PATTERN.source, RELATION_SEPARATOR_PATTERN.flags)
  for (const match of value.matchAll(matcher)) {
    const left = value.slice(0, match.index).trim()
    const right = value.slice(match.index + match[0].length).trim()
    if (!left || !right || !shouldSplitRelation(left, right)) continue
    const rightRelations = splitCoordinatedRelations(right.replace(/^(?:and|or|but|then|yet)\s+/iu, '').trim())
    const complement = rightRelations.map(coordinatedSharedComplement).find(Boolean) ?? ''
    const leftRelations = splitCoordinatedRelations(left)
      .map((relation) => inheritCoordinatedComplement(relation, complement))
    const negation = coordinatorSharesNegation(match[0]) ? sharedNegationPrefix(left) : ''
    return [...leftRelations, ...rightRelations.map((relation) => inheritCoordinatedNegation(relation, negation))]
  }
  return value ? [value] : []
}

function relationSegments(value) {
  return normalizedEvidence(value).split(/[\r\n.!?。！？；;]+/u)
    .flatMap((segment) => splitStrongRelationBoundaries(segment.trim()))
    .flatMap((segment) => splitCoordinatedRelations(segment.trim()))
    .filter(Boolean)
}

function relationSignature(value) {
  const actions = relationActionSet(value)
  return {
    text: value,
    actions,
    objects: relationObjectSet(value),
    qualifiers: relationQualifierSet(value),
    facts: exactFactSet(value),
    negative: hasNegativeAssertion(value, actions)
  }
}

function hasNegativeAssertion(value, actions) {
  const text = normalizedEvidence(value)
  const action = firstClaimedAction(text, actions)
  const object = firstRelationObjectAfter(text, 0)
  const pivot = action && object
    ? Math.min(action.index, object.index)
    : action?.index ?? object?.index ?? text.length
  if (PRECEDING_NEGATION_PATTERN.test(text.slice(Math.max(0, pivot - 64), pivot))) return true
  if (action) {
    const localTail = text.slice(action.index + action.length, action.index + action.length + 40)
    if (/^\s+(?:absolutely\s+)?no\b|^(?:任何)?不/iu.test(localTail)) return true
  }
  return UNAVAILABLE_ASSERTION_PATTERN.test(text)
}

function isSubset(left, right) {
  return [...left].every((value) => right.has(value))
}

function scriptKind(value) {
  const text = normalizedEvidence(value)
  const hasHan = /\p{Script=Han}/u.test(text)
  const hasLatin = /\p{Script=Latin}/u.test(text)
  if (hasHan && hasLatin) return 'mixed'
  if (hasHan) return 'han'
  if (hasLatin) return 'latin'
  return 'other'
}

function canonicalExtractiveText(value) {
  let text = normalizedEvidence(value).toLocaleLowerCase('en-US')
  text = text.replace(/(\d+(?:\.\d+)?|[零〇一二两三四五六七八九十百千万]+)\s*(万|亿)\s*(美元|美金|人民币|元|欧元|英镑)?/gu,
    (_match, amount, unit, currency) => {
      const cardinal = parseChineseCardinal(amount)
      return Number.isFinite(cardinal)
        ? ` quantity${cardinal * (unit === '亿' ? 100_000_000 : 10_000)}${currencyKey(currency)} `
        : _match
    })
  text = text.replace(/(\d+(?:[.,]\d+)?)\s*%/gu,
    (_match, amount) => ` percentage${normalizedDecimal(amount)} `)
  text = text.replace(/([$€£¥])\s*(\d+(?:[.,]\d+)?)/gu,
    (_match, currency, amount) => ` money${normalizedDecimal(amount)}${currencyKey(currency)} `)
  text = text.replace(/(\d+(?:[.,]\d+)?)\s*((?:元|人民币|美元|美金|欧元|英镑)(?![\p{L}\p{N}])|(?:usd|cny|rmb|eur|gbp)\b)/giu,
    (_match, amount, currency) => ` money${normalizedDecimal(amount)}${currencyKey(currency)} `)
  text = text.replace(/仅需/gu, '')
  return text
}

const EXTRACTIVE_STOP_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'by', 'for', 'from', 'in', 'into', 'is', 'it', 'of', 'on',
  'or', 'that', 'the', 'their', 'this', 'to', 'with'
])

function extractiveTokens(value) {
  const text = canonicalExtractiveText(value)
  if (scriptKind(value) === 'han') {
    return [...text.matchAll(/quantity\d+[a-z]+|percentage\d+(?:\.\d+)?|[\p{Script=Han}]|[a-z0-9]+/gu)]
      .map(([token]) => token)
      .filter((token) => !EXTRACTIVE_STOP_WORDS.has(token))
  }
  return [...text.matchAll(/[\p{L}\p{N}]+/gu)]
    .map(([token]) => token)
    .filter((token) => !EXTRACTIVE_STOP_WORDS.has(token))
}

function isOrderedNearExtractiveSpan(claimText, citationText) {
  const claimTokens = extractiveTokens(claimText)
  const citationTokens = extractiveTokens(citationText)
  if (claimTokens.length === 0 || citationTokens.length === 0) return false
  for (let start = 0; start < citationTokens.length; start += 1) {
    if (citationTokens[start] !== claimTokens[0]) continue
    let citationIndex = start
    let supported = true
    for (let claimIndex = 1; claimIndex < claimTokens.length; claimIndex += 1) {
      const maximum = citationIndex + 1
      let next = citationIndex + 1
      while (next <= maximum && citationTokens[next] !== claimTokens[claimIndex]) next += 1
      if (next > maximum) {
        supported = false
        break
      }
      citationIndex = next
    }
    if (supported) return true
  }
  return false
}

function isCatalogFramingPhrase(value, field) {
  const text = normalizedEvidence(value)
  if (field === 'pricing') {
    return PRICING_FRAMING_PATTERNS.some((pattern) => pattern.test(text))
  }
  if (field === 'tags' || field === 'searchTerms') {
    return CATALOG_METADATA_PATTERN.test(text)
  }
  return CATALOG_FRAMING_PATTERNS.some((pattern) => pattern.test(text))
    || NOMINAL_CAPABILITY_PATTERN.test(text)
}

function hasKnownFactualPredicate(value) {
  const text = normalizedEvidence(value)
  return relationActionSet(text).size > 0
    || FUNDING_PREDICATE_PATTERN.test(text)
    || REVENUE_PREDICATE_PATTERN.test(text)
    || PROMOTION_PREDICATE_PATTERN.test(text)
}

function isKnownPricingAssertion(value) {
  const text = normalizedEvidence(value)
  return hasKnownFactualPredicate(text)
    || PRICING_PREDICATE_PATTERN.test(text)
    || (relationObjectSet(text).has('pricing')
      && actionAndQualifierAnchors.support.test(text))
    || (exactFactSet(text).size > 0
      && (PRICING_AMOUNT_PATTERN.test(text) || relationQualifierSet(text).size > 0))
}

function relationSubjectAndEligibility(value) {
  const text = normalizedEvidence(value)
  const founder = FUNDING_FOUNDER_SUBJECT_PATTERN.test(text)
  return {
    companyFunding: FUNDING_PREDICATE_PATTERN.test(text)
      && (FUNDING_COMPANY_SUBJECT_PATTERN.test(text) || !founder),
    founder,
    newUser: PROMOTION_BENEFICIARY_PATTERNS.newUser.test(text),
    existingUser: PROMOTION_BENEFICIARY_PATTERNS.existingUser.test(text)
  }
}

function firstPatternOccurrence(text, pattern, minimumIndex = 0) {
  const matcher = new RegExp(pattern.source, pattern.flags.replace(/g/gu, ''))
  const match = matcher.exec(text)
  if (!match || match.index < minimumIndex) {
    const tail = matcher.exec(text.slice(minimumIndex))
    return tail ? { index: minimumIndex + tail.index, length: tail[0].length } : undefined
  }
  return { index: match.index, length: match[0].length }
}

function firstClaimedAction(value, claimedActions) {
  const text = normalizedEvidence(value)
  return [...claimedActions].reduce((first, name) => {
    const pattern = actionAndQualifierAnchors[name]
    const occurrence = pattern ? firstPatternOccurrence(text, pattern) : undefined
    if (!occurrence || (first && first.index <= occurrence.index)) return first
    return { name, ...occurrence }
  }, undefined)
}

function firstRelationObjectAfter(value, minimumIndex) {
  const text = normalizedEvidence(value)
  return Object.entries(relationObjectAnchorGroups).reduce((first, [family, names]) => {
    const occurrence = names.reduce((earliest, name) => {
      const pattern = factualAnchors[name]
      const candidate = pattern ? firstPatternOccurrence(text, pattern, minimumIndex) : undefined
      if (!candidate || (earliest && earliest.index <= candidate.index)) return earliest
      return candidate
    }, undefined)
    if (!occurrence || (first && first.index <= occurrence.index)) return first
    return { family, ...occurrence }
  }, undefined)
}

function directRelationObject(value, claimedActions) {
  const action = firstClaimedAction(value, claimedActions)
  if (!action) return ''
  return firstRelationObjectAfter(value, action.index)?.family ?? ''
}

function citationSupportsRelation(claim, citation) {
  if (claim.qualifiers.has('privacy') && POLICY_DOCUMENT_PATTERN.test(citation.text)) return false
  if (claim.negative !== citation.negative) return false
  const claimRoles = relationSubjectAndEligibility(claim.text)
  const citationRoles = relationSubjectAndEligibility(citation.text)
  if ((claimRoles.companyFunding && (!citationRoles.companyFunding || citationRoles.founder))
    || (claimRoles.newUser && (!citationRoles.newUser
      || (citationRoles.existingUser && !claimRoles.existingUser)))
    || (claimRoles.existingUser && (!citationRoles.existingUser
      || (citationRoles.newUser && !claimRoles.newUser)))) return false
  const claimDirectObject = directRelationObject(claim.text, claim.actions)
  if (claimDirectObject
    && directRelationObject(citation.text, claim.actions) !== claimDirectObject) return false
  return isSubset(claim.actions, citation.actions)
    && isSubset(claim.objects, citation.objects)
    && isSubset(claim.qualifiers, citation.qualifiers)
    && isSubset(claim.facts, citation.facts)
}

function hasRelationLevelSupport(publicText, citation, field) {
  const publicRelations = relationSegments(publicText)
  const citationRelations = relationSegments(citation).map(relationSignature)
  let factualRelations = 0
  const supported = publicRelations.every((text) => {
    if (isCatalogFramingPhrase(text, field)) return true
    const defensiveCredential = isNarrowDefensiveCredentialRelation(text)
    if (!hasKnownFactualPredicate(text)
      && !(field === 'pricing' && isKnownPricingAssertion(text))
      && !defensiveCredential) return false
    if (field === 'features' && capabilityActionSet(text).size === 0) return false
    factualRelations += 1
    const claim = relationSignature(text)
    if (claim.actions.size === 0 && claim.objects.size === 0
      && claim.qualifiers.size === 0 && claim.facts.size === 0) return false
    return citationRelations.some((proof) => citationSupportsRelation(claim, proof)
      && (scriptKind(claim.text) !== scriptKind(proof.text)
        || isOrderedNearExtractiveSpan(claim.text, proof.text)))
  })
  if (!supported) return false
  if (factualRelations > 0) return true
  const publicAnchors = anchorSet(publicText)
  const citationAnchors = anchorSet(citation)
  return publicAnchors.size > 0 && isSubset(publicAnchors, citationAnchors)
}

function normalizeCitation(value, proof) {
  if (typeof value !== 'string') return invalid()
  const citation = normalizedEvidence(value)
  if (citation.length < 2 || citation.length > 400 || !proof.includes(citation)) return invalid()
  return citation
}

export function hasGroundedDiscoveryClaimSupport(publicText, citation, field) {
  if (field === 'name') {
    const publicIdentity = normalizedEvidence(publicText).toLocaleLowerCase('en-US')
      .replace(/[^\p{L}\p{N}]+/gu, '')
    const citedIdentity = normalizedEvidence(citation).toLocaleLowerCase('en-US')
      .replace(/[^\p{L}\p{N}]+/gu, '')
    return publicIdentity.length >= 2 && citedIdentity.includes(publicIdentity)
  }
  return hasRelationLevelSupport(publicText, citation, field)
}

function assertRelevantCitation(publicText, citation, field) {
  if (!hasGroundedDiscoveryClaimSupport(publicText, citation, field)) return invalid()
}

function normalizedOfficialUrl(evidence) {
  const value = evidence?.selectedOfficialUrl ?? evidence?.canonicalUrl ?? evidence?.finalUrl
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return ''
    url.hostname = url.hostname.toLocaleLowerCase('en-US').replace(/\.+$/u, '')
    url.search = ''
    url.hash = ''
    return url.toString()
  } catch {
    return ''
  }
}

function evidenceFingerprint(evidence, citationMap) {
  const selectedOfficialUrl = normalizedOfficialUrl(evidence)
  if (!selectedOfficialUrl) return ''
  const payload = {
    selectedOfficialUrl,
    title: normalizedEvidence(evidence?.title),
    metaDescription: normalizedEvidence(evidence?.metaDescription),
    visibleText: normalizedEvidence(evidence?.visibleText),
    citations: citationFields.map((field) => [field, citationMap[field]])
  }
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex')
}

export function parseGroundedDiscoveryDraft(value, evidence) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || Object.keys(value).length !== 2
    || !Object.hasOwn(value, 'draft')
    || !Object.hasOwn(value, 'citations')
    || !value.citations
    || typeof value.citations !== 'object'
    || Array.isArray(value.citations)
    || Object.keys(value.citations).length !== citationFields.length
    || Object.keys(value.citations).some((key) => !citationFieldSet.has(key))) return invalid()

  const draft = parseDiscoveryDraft(value.draft)
  const proof = evidenceText(evidence)
  if (!proof) return invalid()
  const citationMap = Object.create(null)

  for (const field of citationFields) {
    const publicValue = draft[field]
    const citationValue = value.citations[field]
    if (Array.isArray(publicValue)) {
      if (!Array.isArray(citationValue) || citationValue.length !== publicValue.length) return invalid()
      citationMap[field] = Object.freeze(publicValue.map((text, index) => {
        const citation = normalizeCitation(citationValue[index], proof)
        assertRelevantCitation(text, citation, field)
        return citation
      }))
    } else {
      if (Array.isArray(citationValue)) return invalid()
      const citation = normalizeCitation(citationValue, proof)
      assertRelevantCitation(publicValue, citation, field)
      citationMap[field] = citation
    }
  }

  const privateCitationMap = Object.freeze(citationMap)
  const fingerprint = evidenceFingerprint(evidence, privateCitationMap)
  if (!fingerprint) return invalid()
  groundedDrafts.set(draft, Object.freeze({ privateCitationMap, fingerprint }))
  return draft
}

export function isGroundedDiscoveryDraft(value) {
  return Boolean(value && typeof value === 'object' && groundedDrafts.has(value))
}

export function hasGroundedDiscoveryCitationProvenance(value, evidence) {
  const provenance = value && typeof value === 'object' ? groundedDrafts.get(value) : undefined
  return Boolean(provenance
    && evidenceFingerprint(evidence, provenance.privateCitationMap) === provenance.fingerprint)
}
