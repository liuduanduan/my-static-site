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
  create: /\b(?:create(?:s|d|ing)?|generat(?:e[sd]?|ing|ion|ions|or|ors)|produce(?:s|d|ing)?|draft(?:s|ed|ing)?)\b|生成|创建|制作|产出/iu,
  deletion: /\b(?:delete(?:s|d|ing)?|deletion|remove(?:s|d|ing)?|removal|erase(?:s|d|ing)?|purge(?:s|d|ing)?|discard(?:s|ed|ing)?)\b|删除|移除|清除|抹除/iu,
  detect: /\b(?:detect(?:s|ed|ing|ion|ions|or|ors)?|identif(?:y|ies|ied|ying|ication|ications)|recogni(?:ze|zes|zed|zing|tion|tions)|scan(?:s|ned|ning|ner|ners)?)\b|检测|识别|扫描/iu,
  export: /\b(?:export(?:s|ed|ing|er|ers)?|download(?:s|ed|ing)?)\b|导出|下载/iu,
  extract: /\b(?:extract(?:s|ed|ing|ion|ions|or|ors)?|pull(?:s|ed|ing)?|retrieve(?:s|d|ing)?|retrieval)\b|提取|抽取|检索/iu,
  organize: /\b(?:organi[sz](?:e|es|ed|ing|ation|ations)|structure(?:s|d|ing)?|arrange(?:s|d|ing|ment|ments))\b|整理|组织|结构化/iu,
  predict: /\b(?:predict(?:s|ed|ing|ion|ions|ive)?|forecast(?:s|ed|ing)?|estimate(?:s|d|ing)?)\b|预测|预估/iu,
  realtime: /\b(?:real[- ]?time|live\s+(?:data|updates?|results?|feeds?|transcription|captions?|monitoring|analytics|collaboration)|instant(?:ly)?)\b|实时|即时/iu,
  summarize: /\b(?:summar(?:y|ies)|summari[sz](?:e|es|ed|ing|ation|ations)|brief(?:s|ed|ing)?|condense(?:s|d|ing)?)\b|摘要|总结|简报/iu,
  trace: /\b(?:trace(?:s|d|ing)?|track(?:s|ed|ing)?|provenance)\b|回溯|追踪|追溯/iu
})
const factualAnchors = Object.freeze({
  ai: /\b(?:ai|artificial intelligence|llm|machine learning)\b|人工智能|大模型|机器学习/iu,
  account: /\b(?:account|sign ?up|log ?in|registration)\b|账户|账号|注册|登录/iu,
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
  credentials: /\b(?:credentials?|passwords?|login details?)\b|凭据|密码|登录信息|盗号/iu,
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
  pricing: /\b(?:free|paid|plan|pricing|price|subscription|tier|quota|cost)\b|免费|付费|方案|套餐|价格|定价|订阅|额度|收费/iu,
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
const PERSONAL_MEDICAL_MARKER_PATTERN = /\b(?:personal|personalized|individual|individualized|individuals?|patients?)\b|个人|个体|个性化|患者/iu
const MEDICAL_RISK_SUBJECT_PATTERN = /\b(?:cancer|tumou?r|disease|medical|health|clinical|symptoms?)\b|癌症|肿瘤|疾病|医疗|健康|临床|症状/iu
const MEDICAL_RISK_PREDICTION_PATTERN = /\b(?:predict\w*|forecast\w*|assess\w*|estimat\w*|risk|probability|score|scoring)\b|预测|预估|评估|风险|概率|评分/iu
const SECURITY_HARM_PATTERN = /\b(?:malware|ransomware|phishing|(?:steal(?:s|ing)?|stole|stolen)\s+(?:(?:account|user)\s+)?(?:credentials?|passwords?|login details?)|credential theft|trojans?|computer viruses|spyware|keyloggers?|exploit payloads?)\b|恶意软件|勒索软件|网络钓鱼|(?:窃取|盗取).{0,8}(?:凭据|密码|登录信息)|盗号|木马|计算机病毒|间谍软件|键盘记录器|漏洞利用(?:载荷)?/iu
const DECEPTIVE_MEDIA_TERM_PATTERN = /\b(?:deepfake|impersonat\w*|voice\s+clon\w*|face[- ]?swap\w*)\b|深度伪造|深伪|(?:声音|语音)(?:冒充|克隆)|(?:冒充|仿冒).{0,8}(?:声音|语音|人脸)|AI\s*换脸/iu
const OFFENSIVE_ACTION_PATTERN = /\b(?:(?:generate|generator|create|build|deploy|spread|steal|harvest|bypass|clone|synthesize|impersonate|offensive)\w*|stole|stolen)\b|生成|制作|部署|传播|窃取|盗取|盗号|收割|绕过|克隆|合成|冒充|攻击性/iu
const DEFENSIVE_ACTION_PATTERN = /\b(?:anti[- ]?(?:malware|phishing)|detect(?:s|ion|or)?|prevent(?:s|ion)?|protect(?:s|ion)?|block(?:s|ing)?|scanner|security|defen[sc]e|verification|analysis|sandbox|simulation|training|removal)\b|反钓鱼|检测|识别|防御|拦截|阻止|安全|保护|核验|分析|沙箱|演练|培训|清除/iu

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

function assertNoUnsupportedClaims(draft) {
  const allText = [
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
  ].join('\n').normalize('NFKC')
  const clauses = allText.split(/[\r\n.!?,:。！？；;，：]+/u)
  if (disallowedClaimPatterns.some((pattern) => pattern.test(allText))) return invalid()
  if (PROHIBITED_MEDICAL_DRAFT_PATTERN.test(allText) || clauses.some((clause) =>
    PERSONAL_MEDICAL_MARKER_PATTERN.test(clause)
      && MEDICAL_RISK_SUBJECT_PATTERN.test(clause)
      && MEDICAL_RISK_PREDICTION_PATTERN.test(clause))) return invalid()
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

function exactFactSet(value) {
  const text = normalizedEvidence(value).toLocaleLowerCase('en-US')
  return new Set([
    ...[...text.matchAll(/[$€£¥]\s*\d+(?:[.,]\d+)?/gu)].map(([match]) => match.replace(/\s+/gu, '')),
    ...[...text.matchAll(/\d+(?:[.,]\d+)?\s*(?:(?:元|人民币|美元|美金|欧元|英镑)(?![\p{L}\p{N}])|(?:usd|cny|rmb|eur|gbp)\b)/giu)].map(([match]) => match.replace(/\s+/gu, '')),
    ...[...text.matchAll(/\b\d+(?:[.,]\d+)?\s*(?:million|billion|thousand)\b/gu)].map(([match]) => match.replace(/\s+/gu, '')),
    ...[...text.matchAll(/\d+(?:[.,]\d+)?\s*%/gu)].map(([match]) => match.replace(/\s+/gu, '')),
    ...[...text.matchAll(/(?:[零一二三四五六七八九十百]+|\d+(?:\.\d+)?)\s*折/gu)].map(([match]) => match.replace(/\s+/gu, '')),
    ...[...text.matchAll(/\b\d+(?:\.\d+)?\b/gu)].map(([match]) => match)
  ])
}

function normalizeCitation(value, proof) {
  if (typeof value !== 'string') return invalid()
  const citation = normalizedEvidence(value)
  if (citation.length < 2 || citation.length > 400 || !proof.includes(citation)) return invalid()
  return citation
}

function assertRelevantCitation(publicText, citation, field) {
  const publicAnchors = anchorSet(publicText)
  const citationAnchors = anchorSet(citation)
  const publicActions = actionAndQualifierSet(publicText)
  const citationActions = actionAndQualifierSet(citation)
  if (field === 'name') {
    const publicIdentity = normalizedEvidence(publicText).toLocaleLowerCase('en-US')
      .replace(/[^\p{L}\p{N}]+/gu, '')
    const citedIdentity = normalizedEvidence(citation).toLocaleLowerCase('en-US')
      .replace(/[^\p{L}\p{N}]+/gu, '')
    if (publicIdentity.length < 2 || !citedIdentity.includes(publicIdentity)) return invalid()
    return
  }
  const publicFacts = exactFactSet(publicText)
  const citationFacts = exactFactSet(citation)
  if (publicAnchors.size === 0
    || [...publicAnchors].some((anchor) => !citationAnchors.has(anchor))
    || [...publicActions].some((anchor) => !citationActions.has(anchor))
    || [...publicFacts].some((fact) => !citationFacts.has(fact))) return invalid()
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
  const provenance = []

  for (const field of citationFields) {
    const publicValue = draft[field]
    const citationValue = value.citations[field]
    if (Array.isArray(publicValue)) {
      if (!Array.isArray(citationValue) || citationValue.length !== publicValue.length) return invalid()
      publicValue.forEach((text, index) => {
        const citation = normalizeCitation(citationValue[index], proof)
        assertRelevantCitation(text, citation, field)
        provenance.push(citation)
      })
    } else {
      if (Array.isArray(citationValue)) return invalid()
      const citation = normalizeCitation(citationValue, proof)
      assertRelevantCitation(publicValue, citation, field)
      provenance.push(citation)
    }
  }

  groundedDrafts.set(draft, Object.freeze([...new Set(provenance)]))
  return draft
}

export function isGroundedDiscoveryDraft(value) {
  return Boolean(value && typeof value === 'object' && groundedDrafts.has(value))
}

export function hasGroundedDiscoveryCitationProvenance(value, evidence) {
  const citations = value && typeof value === 'object' ? groundedDrafts.get(value) : undefined
  const proof = evidenceText(evidence)
  return Boolean(citations && proof && citations.every((citation) => proof.includes(citation)))
}
