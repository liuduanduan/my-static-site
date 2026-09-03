import { candidateKey } from './contracts.mjs'

const CATEGORIES = Object.freeze([
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
const CATEGORY_SET = new Set(CATEGORIES)
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MINIMUM_VISIBLE_CHARACTERS = 200
const MAXIMUM_TITLE_CHARACTERS = 300
const MAXIMUM_META_CHARACTERS = 1_000
const MAXIMUM_VISIBLE_CHARACTERS = 40_000
const SENSITIVE_TEXT = /(?:\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|\bbearer\s+\S+|\b(?:bearer\s+)?[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}\b|\b(?:token|secret|password|auth|authorization|api[_ -]?key|signature|code)\s*(?:=|:)\s*\S+)/iu

const PRODUCT_CUES = Object.freeze([
  'ai',
  'artificial intelligence',
  'machine learning',
  'generative',
  'llm',
  'large language model',
  'assistant',
  'agent',
  'tool',
  'platform',
  'software',
  'application',
  'api',
  'workflow',
  '人工智能',
  '机器学习',
  '生成式',
  '大模型',
  '智能体',
  '助手',
  '工具',
  '平台',
  '软件',
  '应用',
  '工作流'
])

const NON_PRODUCT_PATTERNS = Object.freeze([
  /\bdomain (?:is )?for sale\b/iu,
  /\bbuy this domain\b/iu,
  /\bparked domain\b/iu,
  /\bcoming soon\b/iu,
  /\bunder construction\b/iu,
  /\b(?:error|http|service\s+error)\s*[:#\-/—–]?\s*(?:403|404|410|5\d\d)\b/iu,
  /\b(?:403|404|410|5\d\d)\s*[:#\-/—–]?\s*(?:error|not\s+found|forbidden|gone|internal\s+server\s+error|bad\s+gateway|service\s+unavailable)\b/iu,
  /\bpage not found\b/iu,
  /\bservice unavailable\b/iu,
  /域名(?:出售|停放)/u,
  /即将上线|敬请期待|网站建设中|页面不存在|服务不可用/u
])

const ALWAYS_PROHIBITED_PATTERNS = Object.freeze([
  /\b(?:casino|betting|gambling|sportsbook|porn(?:ography)?|adult content|token speculation)\b/iu,
  /博彩|赌博|赌场|色情|成人视频|代币投机/u
])
const SECURITY_HARM_PATTERN = /\b(?:malware|ransomware|phishing|credential theft)\b|恶意软件|勒索软件|网络钓鱼|窃取凭据/iu
const DEFENSIVE_SECURITY_PATTERN = /\b(?:anti[- ]?(?:malware|phishing)|detect(?:s|ion|or)?|prevent(?:s|ion)?|protect(?:s|ion)?|block(?:s|ing)?|scanner|security|defen[sc]e|threat monitoring|analysis|sandbox|simulation|training|awareness|removal)\b|反钓鱼|检测|防御|拦截|阻止|安全|保护|威胁监控|分析|沙箱|演练|培训|意识|清除/iu
const OFFENSIVE_SECURITY_PATTERN = /\b(?:generate|generator|create|build|deploy|spread|steal|harvest|bypass|offensive)\w*\b|生成|制作|部署|传播|窃取|收割|绕过|攻击性/iu
const DECEPTIVE_MEDIA_DEFENSE_PATTERN = /\b(?:detect(?:s|ion|or)?|prevent(?:s|ion)?|protect(?:s|ion)?|block(?:s|ing)?|scanner|security|defen[sc]e|verification)\b|检测|识别|防御|拦截|阻止|安全|保护|核验/iu
const DECEPTIVE_MEDIA_TERM_PATTERN = /\b(?:deepfake|impersonat\w*|voice\s+clon\w*|face[- ]?swap\w*)\b|深度伪造|深伪|(?:声音|语音)(?:冒充|克隆)|(?:冒充|仿冒).{0,8}(?:声音|语音|人脸)|仿冒(?:声音|语音|人脸)|AI\s*换脸/iu
const DECEPTIVE_MEDIA_OFFENSIVE_INTENT_PATTERN = /\b(?:bypass|evad(?:e|es|ed|ing)|circumvent(?:s|ed|ing)?|defeat(?:s|ed|ing)?)\b|\b(?:platform|system|tool|service|app|software)\b.{0,30}\b(?:to\s+)?impersonat(?:e|es|ed|ing)\b|\bfor\s+(?:committing\s+)?(?:fraud|scams?)\b|\bto\s+(?:commit\s+)?(?:fraud|scam|deceive)\w*\b|绕过|规避|突破.{0,8}(?:验证|核验)|用于.{0,24}(?:冒充|诈骗|欺诈)|(?:实施|进行).{0,8}(?:诈骗|欺诈)/iu
const DECEPTIVE_MEDIA_GENERATION_PRODUCT_PATTERN = /(?:\b(?:deepfake|impersonat\w*|face[- ]?swap|voice\s+clon\w*)\b(?:\s+[a-z-]+){0,2}\s+\bgenerator\b|\b(?:deepfake|impersonat\w*|face[- ]?swap|voice\s+clon\w*)\b(?:\s+[a-z-]+){0,2}\s+\b(?:generation|synthesis|cloning)\b(?:\s+[a-z-]+){0,2}\s+\b(?:platform|system|tool|software|service|app|application|model|api|product)\b|\b(?:voice\s+clon\w*|face[- ]?swap\w*)\b\s+\b(?:platform|system|tool|software|service|app|application|model|api|product)\b|\b(?:platform|system|tool|software|service|app|application|model|api|product)\b\s+(?:for|to)\s+(?:(?:\w+\s+){0,3}(?:generat\w*|creat\w*|synthesi[sz]\w*|clon\w*)\s+(?:\w+\s+){0,2}\b(?:deepfake|face[- ]?swap|voice)\b|(?:\w+\s+){0,2}\b(?:deepfake|impersonat\w*|face[- ]?swap|voice\s+clon\w*)\b\s+(?:generation|synthesis|cloning))|(?:深度伪造|深伪|AI\s*换脸|(?:声音|语音)(?:冒充|克隆)).{0,10}(?:生成|合成|制作|克隆).{0,6}(?:平台|系统|工具|软件|服务|应用|模型|生成器)|(?:生成|合成|制作|克隆).{0,10}(?:深度伪造|深伪|换脸|人脸|声音|语音).{0,8}(?:平台|系统|工具|软件|服务|应用|模型|生成器))/iu

function gateError(code) {
  const error = new Error(code)
  error.code = code
  throw error
}

function normalizeText(value, maximum = Infinity) {
  if (typeof value !== 'string') return ''
  const normalized = value
    .replace(/[\p{Cf}\p{Default_Ignorable_Code_Point}]/gu, '')
    .replace(/\p{Cc}/gu, ' ')
    .trim()
    .replace(/\s+/gu, ' ')
  return Array.from(normalized).slice(0, maximum).join('')
}

function normalizedName(value) {
  return normalizeText(value).normalize('NFKC').toLocaleLowerCase('en-US')
}

function normalizedSlugFromName(value) {
  return normalizeText(value).normalize('NFKC')
    .toLocaleLowerCase('en-US')
    .replace(/['’]/gu, '')
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
}

function normalizedUrl(value, stripQuery = false) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return ''
    const hostname = url.hostname.toLowerCase().replace(/\.+$/u, '')
    if (!hostname) return ''
    url.hostname = hostname
    if (stripQuery) url.search = ''
    url.hash = ''
    return url.toString()
  } catch {
    return ''
  }
}

function normalizedDomain(value) {
  try {
    return new URL(value).hostname.toLowerCase().replace(/\.+$/u, '').replace(/^www\./u, '')
  } catch {
    return ''
  }
}

function safeAlternative(tool) {
  if (!tool || typeof tool !== 'object') return null
  const slug = typeof tool.slug === 'string' ? tool.slug.trim() : ''
  const name = normalizeText(tool.name, 160)
  const category = tool.category
  if (!SLUG.test(slug) || !name || !CATEGORY_SET.has(category)) return null
  return Object.freeze({ slug, name, category })
}

export function catalogDiscoveryIndex(tools) {
  if (!Array.isArray(tools)) gateError('duplicate_catalog_entry')

  const urls = []
  const domains = []
  const names = []
  const slugs = []
  const alternatives = []
  const categoryCounts = Object.fromEntries(CATEGORIES.map((category) => [category, 0]))

  for (const tool of tools) {
    if (!tool || typeof tool !== 'object') gateError('duplicate_catalog_entry')
    const url = normalizedUrl(tool.url)
    const domain = normalizedDomain(tool.url)
    const name = normalizedName(tool.name)
    const slug = typeof tool.slug === 'string' ? tool.slug.trim() : ''
    const alternative = safeAlternative(tool)
    if (!url || !domain || !name || !SLUG.test(slug) || !alternative) {
      gateError('duplicate_catalog_entry')
    }
    urls.push(url)
    domains.push(domain)
    names.push(name)
    slugs.push(slug)
    alternatives.push(alternative)
    categoryCounts[alternative.category] += 1
  }

  return Object.freeze({
    urls: Object.freeze(urls),
    domains: Object.freeze(domains),
    names: Object.freeze(names),
    slugs: Object.freeze(slugs),
    categoryCounts: Object.freeze(categoryCounts),
    alternatives: Object.freeze(alternatives)
  })
}

function assertIndex(index) {
  if (!index || typeof index !== 'object'
    || !Array.isArray(index.urls)
    || !Array.isArray(index.domains)
    || !Array.isArray(index.names)
    || !Array.isArray(index.slugs)
    || !Array.isArray(index.alternatives)
    || !index.categoryCounts) gateError('duplicate_catalog_entry')
}

function selectedDestination(evidence) {
  const finalUrl = normalizedUrl(evidence?.selectedOfficialUrl ?? evidence?.finalUrl, true)
  if (!finalUrl) gateError('insufficient_official_evidence')
  const canonicalUrl = normalizedUrl(evidence?.canonicalUrl, true)
  const acceptableCanonical = canonicalUrl && normalizedDomain(canonicalUrl) === normalizedDomain(finalUrl)
    ? canonicalUrl
    : ''
  return { finalUrl, canonicalUrl: acceptableCanonical, selectedOfficialUrl: acceptableCanonical || finalUrl }
}

function evidenceSummary(evidence) {
  const title = normalizeText(evidence?.title, MAXIMUM_TITLE_CHARACTERS)
  const metaDescription = normalizeText(evidence?.metaDescription, MAXIMUM_META_CHARACTERS)
  const visibleText = normalizeText(evidence?.visibleText, MAXIMUM_VISIBLE_CHARACTERS)
  const destination = selectedDestination(evidence)
  const pricingLinks = Array.isArray(evidence?.pricingLinks)
    ? evidence.pricingLinks.filter((value) => normalizedUrl(value))
    : []
  return {
    selectedOfficialUrl: destination.selectedOfficialUrl,
    title,
    metaDescription,
    visibleText,
    visibleCharacterCount: Array.from(visibleText).length,
    hasCanonicalUrl: evidence?.hasCanonicalUrl === true || Boolean(destination.canonicalUrl),
    hasPricingLink: evidence?.hasPricingLink === true || pricingLinks.length > 0
  }
}

function includesCue(text) {
  const normalized = text.toLocaleLowerCase('en-US')
  return PRODUCT_CUES.some((cue) => {
    if (/^[a-z0-9 ]+$/u.test(cue)) {
      const escaped = cue
        .split(/\s+/u)
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('\\s+')
      return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'u').test(normalized)
    }
    return normalized.includes(cue)
  })
}

function hasPattern(patterns, text) {
  return patterns.some((pattern) => pattern.test(text))
}

function textClauses(value) {
  return String(value).split(/[\r\n.!?,:。！？；;，：]+/u)
    .map((clause) => clause.trim())
    .filter(Boolean)
}

function hasProhibitedDeceptiveMedia(text) {
  return textClauses(text).some((clause) => {
    if (!DECEPTIVE_MEDIA_TERM_PATTERN.test(clause)) return false
    if (DECEPTIVE_MEDIA_OFFENSIVE_INTENT_PATTERN.test(clause)) return true
    if (DECEPTIVE_MEDIA_GENERATION_PRODUCT_PATTERN.test(clause)) return true
    return !DECEPTIVE_MEDIA_DEFENSE_PATTERN.test(clause)
  })
}

function assertSafeCandidateName(candidate) {
  const name = normalizeText(candidate?.name, 160)
  if (!name || SENSITIVE_TEXT.test(name)) gateError('insufficient_official_evidence')
}

export function validateCandidateForDiscovery(candidate) {
  assertSafeCandidateName(candidate)
  if (!normalizedUrl(candidate?.url)) gateError('insufficient_official_evidence')
  return candidate
}

function assertNotDuplicate(candidate, index, draft, evidence) {
  const destinations = [normalizedUrl(candidate?.url)]
  if (evidence) {
    const selected = selectedDestination(evidence)
    destinations.push(selected.finalUrl)
    if (selected.canonicalUrl) destinations.push(selected.canonicalUrl)
  }
  const urls = destinations.filter(Boolean)
  const domains = urls.map(normalizedDomain)
  const names = [normalizedName(candidate?.name)]
  const slugs = [normalizedSlugFromName(candidate?.name)]
  if (draft) {
    names.push(normalizedName(draft.name))
    slugs.push(typeof draft.slug === 'string' ? draft.slug.trim() : '')
  }
  if (!urls[0] || !domains[0] || !names[0]
    || urls.some((url) => index.urls.includes(url))
    || domains.some((domain) => index.domains.includes(domain))
    || names.some((name) => name && index.names.includes(name))
    || slugs.some((slug) => slug && index.slugs.includes(slug))) {
    gateError('duplicate_catalog_entry')
  }
}

export function evaluateCandidate(candidate, evidence, index) {
  assertIndex(index)
  validateCandidateForDiscovery(candidate)
  assertNotDuplicate(candidate, index, undefined, evidence)
  const summary = evidenceSummary(evidence)
  if (!summary.title || summary.visibleCharacterCount < MINIMUM_VISIBLE_CHARACTERS) {
    gateError('insufficient_official_evidence')
  }

  const allText = `${summary.title}\n${summary.metaDescription}\n${summary.visibleText}`
  if (hasPattern(ALWAYS_PROHIBITED_PATTERNS, allText)
    || hasProhibitedDeceptiveMedia(allText)
    || (SECURITY_HARM_PATTERN.test(allText)
      && (OFFENSIVE_SECURITY_PATTERN.test(allText) || !DEFENSIVE_SECURITY_PATTERN.test(allText)))) {
    gateError('prohibited_candidate')
  }
  if (hasPattern(NON_PRODUCT_PATTERNS, allText) || !includesCue(allText)) {
    gateError('non_product_page')
  }

  return Object.freeze(summary)
}

const ACCOUNT_REQUIRED_PATTERN = /\b(?:requires?\s+(?:an?\s+)?account|(?<!no\s)account\s+required|sign\s*up\s+(?:is\s+)?required|sign\s*up\s+to|create\s+(?:an?\s+)?account|log\s*in\s+to)\b|(?<!不)需要(?:账户|账号|注册|登录)|注册(?:账户|账号)?后|登录后/iu
const ACCOUNT_NOT_REQUIRED_PATTERN = /\b(?:no\s+account\s+required|without\s+sign(?:ing)?\s*up|without\s+(?:an?\s+)?account|no\s+signup)\b|无需(?:注册|登录)|免登录|不需要(?:账户|账号)/iu

const GROUNDING_PATTERNS = Object.freeze({
  pricingMode: Object.freeze({
    free: /\b(?:completely|entirely|100%)\s+free\b|\bfree\s+(?:with\s+)?no\s+paid\s+plans?\b|完全免费|全部免费|无付费方案/iu,
    freemium: /\bfree\s+(?:plan|tier|version)\b.{0,80}\bpaid\b|\bfree\s+and\s+paid\s+plans?\b|免费(?:方案|套餐|版).{0,40}付费|免费增值/iu,
    paid: /\bpaid\s+(?:plans?|subscriptions?|tiers?)\b|\bsubscriptions?\s+(?:start|from|cost)\b|\bpricing\s+starts?\b|[$€£¥]\s*\d|付费(?:方案|订阅|套餐)|订阅.{0,20}(?:元|价格)/iu,
    contact: /\bcontact\s+(?:sales|us)\s+(?:for\s+)?pricing\b|\brequest\s+(?:a\s+)?quote\b|联系销售|联系(?:我们|客服).{0,12}(?:价格|报价)|询价/iu
  }),
  chineseSupport: Object.freeze({
    native: /\bnative\s+chinese\b|\bbuilt\s+for\s+chinese\b|原生中文|中文原生|面向中文用户|简体中文界面/iu,
    partial: /(?<!not\s)(?<!no\s)\b(?:supports?|including)\s+chinese\b|\bchinese\s+translation\b|\bmultilingual\b.{0,50}\bchinese\b|(?<!不)支持中文|中文翻译|多语言.{0,30}中文/iu,
    none: /\benglish\s+only\b|\bno\s+chinese\s+support\b|\bdoes\s+not\s+support\s+chinese\b|\bchinese\s+(?:is\s+)?not\s+supported\b|仅支持英文|不支持中文|无中文(?:支持|界面)|暂无中文/iu
  }),
  accessModes: Object.freeze({
    web: /\bweb\s+(?:app|application|version)\b|\bin\s+(?:your\s+)?browser\b|\bonline\s+tool\b|网页(?:应用|版|端)|浏览器中使用|在线工具/iu,
    desktop: /\bdesktop\s+app\b|\bwindows\s+app\b|\bmac(?:os)?\s+app\b|桌面(?:应用|客户端|版)|Windows\s*客户端|macOS\s*客户端/iu,
    mobile: /\bmobile\s+apps?\b|\b(?:ios|android)(?:\s+mobile)?\s+apps?\b|移动(?:应用|客户端|端)|iOS\s*应用|Android\s*应用/iu,
    api: /\b(?:developer\s+)?api\b|应用程序接口/iu,
    extension: /\bbrowser\s+extension\b|\b(?:chrome|edge|firefox)\s+extension\b|浏览器扩展|Chrome\s*扩展/iu
  }),
  requiresAccount: Object.freeze({
    true: ACCOUNT_REQUIRED_PATTERN,
    false: ACCOUNT_NOT_REQUIRED_PATTERN
  }),
  requiresAccountContradictions: Object.freeze({
    true: ACCOUNT_NOT_REQUIRED_PATTERN,
    false: ACCOUNT_REQUIRED_PATTERN
  }),
  accessModeContradictions: Object.freeze({
    web: /\b(?:no|without)\s+(?:a\s+)?web\s+(?:app|access|version)\b|\b(?:it\s+is\s+)?not\s+(?:a\s+)?web\s+(?:app|application)\b|\bweb\s+(?:app|application|version|access)\s+(?:is\s+)?(?:unavailable|not\s+(?:available|offered|supported))\b|\bnot\s+available\s+(?:on|via)\s+the\s+web\b|(?:无|没有|未提供|不支持)网页(?:应用|版|端|访问)|网页(?:应用|版|端|访问)(?:不可用|未提供|不支持)|不是网页应用/iu,
    desktop: /\b(?:no|without)\s+(?:a\s+)?desktop\s+app\b|\bdesktop\s+app\s+(?:is\s+)?(?:unavailable|not\s+(?:available|offered|supported))\b|\bnot\s+available\s+on\s+(?:windows|mac(?:os)?)\b|(?:无|没有|未提供|不支持)桌面(?:应用|客户端|版)|桌面(?:应用|客户端|版)(?:不可用|未提供|不支持)/iu,
    mobile: /\b(?:no|without)\s+(?:a\s+)?mobile\s+app\b|\bmobile\s+apps?\s+(?:are\s+)?(?:unavailable|not\s+(?:available|offered|supported))\b|\bnot\s+available\s+on\s+(?:ios|android|mobile)\b|(?:无|没有|未提供|不支持)移动(?:应用|客户端|端)|移动(?:应用|客户端|端)(?:不可用|未提供|不支持)/iu,
    api: /\b(?:no|without)\s+(?:an?\s+)?api(?:\s+access)?\b|\bapi(?:\s+access)?\s+(?:is\s+)?(?:unavailable|not\s+(?:available|offered|supported))\b|\bdoes\s+not\s+(?:offer|provide|support)\s+(?:an?\s+)?api\b|(?:无|没有|未提供|不支持)\s*API|API(?:访问)?(?:不可用|未提供|不支持)/iu,
    extension: /\b(?:no|without)\s+(?:a\s+)?browser\s+extension\b|\bbrowser\s+extension\s+(?:is\s+)?(?:unavailable|not\s+(?:available|offered|supported))\b|\bdoes\s+not\s+(?:offer|provide|support)\s+(?:an?\s+)?extension\b|(?:无|没有|未提供|不支持)浏览器扩展|浏览器扩展(?:不可用|未提供|不支持)/iu
  }),
  pricingModeContradictions: Object.freeze({
    free: /\b(?:no|without)\s+(?:a\s+)?free\s+(?:plan|tier|version)\b|\bfree\s+(?:plan|tier|version)\s+(?:is\s+)?(?:unavailable|not\s+(?:available|offered|supported))\b|\bpaid[- ]only\b|(?:无|没有|未提供|不支持)免费(?:方案|套餐|版本)|免费(?:方案|套餐|版本)(?:不可用|未提供|不支持)|仅(?:提供)?付费/iu,
    freemium: /\b(?:no|without)\s+(?:a\s+)?free\s+(?:plan|tier|version)\b|\b(?:free\s+(?:plan|tier|version)|paid\s+plans?)\s+(?:is|are\s+)?(?:unavailable|not\s+(?:available|offered|supported))\b|\b(?:no|without)\s+paid\s+plans?\b|\bpaid[- ]only\b|(?:无|没有|未提供|不支持)(?:免费|付费)(?:方案|套餐|版本)|(?:免费|付费)(?:方案|套餐|版本)(?:不可用|未提供|不支持)|仅(?:提供)?付费/iu,
    paid: /\b(?:no|without)\s+paid\s+plans?\b|\bpaid\s+plans?\s+(?:are\s+)?(?:unavailable|not\s+(?:available|offered|supported))\b|\b(?:completely|entirely|100%)\s+free\b|(?:无|没有|未提供|不支持)付费(?:方案|套餐|版本)|付费(?:方案|套餐|版本)(?:不可用|未提供|不支持)|完全免费|全部免费/iu,
    contact: /\b(?:public|listed|self[- ]service)\s+pricing\b.{0,30}\bno\s+(?:sales\s+)?contact\b|公开价格.{0,20}无需联系销售/iu
  }),
  chineseSupportContradictions: Object.freeze({
    native: /\b(?:no|without)\s+chinese\s+support\b|\bnot\s+(?:a\s+)?native\s+chinese\s+interface\b|\bnative\s+chinese\s+interface\s+(?:is\s+)?(?:unavailable|not\s+(?:available|offered|supported))\b|\bdoes\s+not\s+support\s+chinese\b|\bchinese\s+(?:is\s+)?not\s+supported\b|不支持中文|(?:无|没有|未提供)原生中文(?:支持|界面)?|无中文(?:支持|界面)|暂无中文/iu,
    partial: /\b(?:no|without)\s+chinese\s+support\b|\bchinese\s+(?:support|translation)\s+(?:is\s+)?(?:unavailable|not\s+(?:available|offered|supported))\b|\bdoes\s+not\s+support\s+chinese\b|\bchinese\s+(?:is\s+)?not\s+supported\b|(?:不支持|未提供)中文|中文(?:支持|翻译)(?:不可用|未提供|不支持)|无中文(?:支持|界面)|暂无中文/iu,
    none: /\bnative\s+chinese\b|(?<!not\s)(?<!no\s)\b(?:supports?|including)\s+chinese\b|\bchinese\s+translation\b|原生中文|(?<!不)支持中文|中文翻译/iu
  })
})

const RISKY_DRAFT_CLAIMS = Object.freeze([
  /\boffline\b|\blocal(?:ly)?\s+(?:processing|inference|execution)\b|\bruns?\s+locally\b|\blocal[- ]first\b|\bon[- ]device\b|离线(?:处理|使用|运行|模式)?|本地(?:处理|推理|运行|部署)|端侧(?:处理|推理|运行)?/iu,
  /\bself[- ]host(?:ed|ing)?\b|自托管|私有化部署/iu,
  /\bend[- ]to[- ]end\s+encrypt(?:ed|ion)\b|\bdata\s+(?:never\s+)?leaves?\s+(?:the\s+)?device\b|端到端加密|数据不离(?:开)?(?:设备|本机)/iu
])

function evidenceText(evidence) {
  return normalizeText(`${evidence?.title ?? ''}\n${evidence?.metaDescription ?? ''}\n${evidence?.visibleText ?? ''}`, MAXIMUM_VISIBLE_CHARACTERS + MAXIMUM_META_CHARACTERS + MAXIMUM_TITLE_CHARACTERS)
}

function draftText(draft) {
  return Object.values(draft).flatMap((value) => Array.isArray(value) ? value : [value])
    .filter((value) => typeof value === 'string')
    .join('\n')
}

function groundedMatches(positivePatterns, contradictionPatterns, clauses) {
  return Object.entries(positivePatterns)
    .filter(([mode, positive]) => clauses.some((clause) => positive.test(clause)
      && !contradictionPatterns[mode]?.test(clause)))
    .map(([mode]) => mode)
}

function hasGroundingContradiction(contradictionPatterns, mode, clauses) {
  const pattern = contradictionPatterns[mode]
  return Boolean(pattern && clauses.some((clause) => pattern.test(clause)))
}

function pricingFacts(value) {
  const text = normalizeText(value).normalize('NFKC').toLocaleLowerCase('en-US')
  const amounts = [
    ...text.matchAll(/[$€£¥]\s*\d+(?:[.,]\d+)?/gu),
    ...text.matchAll(/\d+(?:[.,]\d+)?\s*(?:(?:元|人民币|美元|美金|欧元|英镑)(?![\p{L}\p{N}])|(?:usd|cny|rmb|eur|gbp)\b)/giu)
  ].map(([match]) => match.replace(/\s+/gu, ''))
  const percentages = [...text.matchAll(/\d+(?:[.,]\d+)?\s*%/gu)]
    .map(([match]) => match.replace(/\s+/gu, ''))
  const chineseDiscounts = [...text.matchAll(/(?:[零一二三四五六七八九十百]+|\d+(?:\.\d+)?)\s*折/gu)]
    .map(([match]) => match.replace(/\s+/gu, ''))
  const trialDurations = [
    ...[...text.matchAll(/\b(\d+)\s*[- ]?(day|week|month|year)s?\s+(?:free\s+)?trial\b/gu)]
      .map(([, amount, unit]) => `${amount}-${unit}`),
    ...[...text.matchAll(/\bfree\s+trial\s+(?:for\s+)?(\d+)\s+(day|week|month|year)s?\b/gu)]
      .map(([, amount, unit]) => `${amount}-${unit}`),
    ...[...text.matchAll(/(\d+)\s*(天|日|周|个月|月|年)(?:的)?免费试用/gu)]
      .map(([, amount, unit]) => `${amount}-${unit === '天' || unit === '日' ? 'day' : unit === '周' ? 'week' : unit === '年' ? 'year' : 'month'}`)
  ]
  const periods = [
    /\b(?:per\s+month|monthly)\b|每月|月付/iu.test(text) ? 'monthly' : '',
    /\b(?:per\s+year|yearly|annual(?:ly)?)\b|每年|年付/iu.test(text) ? 'yearly' : '',
    /\bfree\s+trial\b|免费试用/iu.test(text) ? 'trial' : ''
  ].filter(Boolean)
  const offerTerms = [
    /\b(?:discount|discounted|percent\s+off)\b|优惠|折扣|(?:[零一二三四五六七八九十百]+|\d+(?:\.\d+)?)\s*折/iu.test(text) ? 'discount' : '',
    /\b(?:promotion|promotional|promo)\b|促销|优惠活动|活动价/iu.test(text) ? 'promotion' : ''
  ].filter(Boolean)
  const promotionConditions = [
    /\blimited[- ]time\b|限时/iu.test(text) ? 'limited-time' : '',
    /\bnew\s+(?:users?|customers?)\b|新用户/iu.test(text) ? 'new-user' : '',
    /\bfirst\s+month\b|首月/iu.test(text) ? 'first-month' : ''
  ].filter(Boolean)
  return {
    amounts: [...new Set(amounts)],
    percentages: [...new Set(percentages)],
    chineseDiscounts: [...new Set(chineseDiscounts)],
    trialDurations: [...new Set(trialDurations)],
    periods,
    offerTerms,
    promotionConditions
  }
}

function assertPricingTextGrounded(pricing, proof) {
  const claimed = pricingFacts(pricing)
  const evidenced = pricingFacts(proof)
  const factGroups = [
    'amounts',
    'percentages',
    'chineseDiscounts',
    'trialDurations',
    'periods',
    'offerTerms',
    'promotionConditions'
  ]
  if (factGroups.some((group) => claimed[group].some((fact) => !evidenced[group].includes(fact)))) {
    gateError('insufficient_official_evidence')
  }
}

export function validateDraftAgainstEvidence(draft, acceptedEvidence) {
  const proof = evidenceText(acceptedEvidence)
  if (!draft || typeof draft !== 'object' || !proof) gateError('insufficient_official_evidence')
  const clauses = textClauses(proof)
  const pricingMatches = groundedMatches(
    GROUNDING_PATTERNS.pricingMode,
    GROUNDING_PATTERNS.pricingModeContradictions,
    clauses
  )
  if (pricingMatches.includes('free') && /\bno\s+paid\s+plans?\b|无付费方案/iu.test(proof)) {
    const paidIndex = pricingMatches.indexOf('paid')
    if (paidIndex >= 0) pricingMatches.splice(paidIndex, 1)
  }
  const pricingIsGrounded = pricingMatches.includes('freemium')
    ? draft.pricingMode === 'freemium' && !pricingMatches.includes('contact')
    : pricingMatches.length === 1 && pricingMatches[0] === draft.pricingMode
  const languageMatches = groundedMatches(
    GROUNDING_PATTERNS.chineseSupport,
    GROUNDING_PATTERNS.chineseSupportContradictions,
    clauses
  )
  const accountMatches = groundedMatches(
    GROUNDING_PATTERNS.requiresAccount,
    GROUNDING_PATTERNS.requiresAccountContradictions,
    clauses
  )
  if (!pricingIsGrounded
    || hasGroundingContradiction(GROUNDING_PATTERNS.pricingModeContradictions, draft.pricingMode, clauses)
    || languageMatches.length !== 1
    || languageMatches[0] !== draft.chineseSupport
    || hasGroundingContradiction(GROUNDING_PATTERNS.chineseSupportContradictions, draft.chineseSupport, clauses)
    || accountMatches.length !== 1
    || accountMatches[0] !== String(draft.requiresAccount)
    || hasGroundingContradiction(GROUNDING_PATTERNS.requiresAccountContradictions, String(draft.requiresAccount), clauses)
    || !Array.isArray(draft.accessModes)
    || draft.accessModes.some((mode) => !clauses.some((clause) => GROUNDING_PATTERNS.accessModes[mode]?.test(clause)
      && !GROUNDING_PATTERNS.accessModeContradictions[mode]?.test(clause))
      || hasGroundingContradiction(GROUNDING_PATTERNS.accessModeContradictions, mode, clauses))) {
    gateError('insufficient_official_evidence')
  }

  assertPricingTextGrounded(draft.pricing, proof)
  const claims = draftText(draft)
  for (const riskyClaim of RISKY_DRAFT_CLAIMS) {
    if (riskyClaim.test(claims) && !riskyClaim.test(proof)) gateError('insufficient_official_evidence')
  }
  return acceptedEvidence
}

export function scoreCandidate(candidate, evidence, index, draft) {
  const summary = evaluateCandidate(candidate, evidence, index)
  assertNotDuplicate(candidate, index, draft, summary)
  if (!draft || !CATEGORY_SET.has(draft.category)) gateError('discovery_enricher_invalid_output')
  const categoryCount = index.categoryCounts[draft.category]
  if (!Number.isInteger(categoryCount) || categoryCount < 2) gateError('discovery_enricher_invalid_output')
  validateDraftAgainstEvidence(draft, summary)

  const sourceScore = Number.isInteger(candidate?.sourceScore) ? candidate.sourceScore : 0
  const completeness = 10
    + (summary.metaDescription ? 5 : 0)
    + (summary.hasCanonicalUrl ? 3 : 0)
    + (summary.hasPricingLink ? 2 : 0)
    + Math.min(10, Math.floor(summary.visibleCharacterCount / 1_000))
  const largestCategory = Math.max(...Object.values(index.categoryCounts))
  const categoryGap = Math.max(0, largestCategory - categoryCount)
  return Math.trunc(sourceScore + completeness + categoryGap)
}

export function compareCandidatesForEnrichment(left, right) {
  const sourceDifference = (Number.isInteger(right?.sourceScore) ? right.sourceScore : 0)
    - (Number.isInteger(left?.sourceScore) ? left.sourceScore : 0)
  if (sourceDifference) return sourceDifference
  const dateDifference = String(left?.discoveredAt ?? '').localeCompare(String(right?.discoveredAt ?? ''))
  if (dateDifference) return dateDifference
  return candidateKey(left).localeCompare(candidateKey(right))
}

export function selectDiscoveryAlternatives(index, category, slug) {
  assertIndex(index)
  if (!CATEGORY_SET.has(category) || typeof slug !== 'string' || !SLUG.test(slug)) {
    gateError('discovery_enricher_invalid_output')
  }
  const alternatives = index.alternatives
    .filter((tool) => tool.category === category && tool.slug !== slug)
    .slice(0, 2)
    .map((tool) => tool.slug)
  if (alternatives.length !== 2) gateError('discovery_enricher_invalid_output')
  return Object.freeze(alternatives)
}

export const discoveryQualityGateLimits = Object.freeze({
  minimumVisibleCharacters: MINIMUM_VISIBLE_CHARACTERS,
  maximumTitleCharacters: MAXIMUM_TITLE_CHARACTERS,
  maximumMetaCharacters: MAXIMUM_META_CHARACTERS,
  maximumVisibleCharacters: MAXIMUM_VISIBLE_CHARACTERS
})
