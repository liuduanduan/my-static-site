# 寻器工具收录、自动化与商业化基础设计

**日期：** 2026-08-27  
**状态：** 待用户书面确认  
**适用分支：** `feature/ai-tutorial-site`

## 1. 背景

寻器当前是部署在 Cloudflare Pages 的 VitePress 静态站。63 款工具保存在 `ai-tools.json`，由严格的 TypeScript 运行时校验、Node 生成器和生产产物验证器共同保护。这个结构有良好的 SEO、低运维成本和可审核的 Git 历史，但目前“提交工具”只是说明链接，新增工具仍需手工编辑 JSON。

本设计增加三个相互衔接、但边界清晰的能力：

1. 工具方可以在网站提交收录申请或商业合作意向。
2. 系统把申请转换为经过校验的目录草稿，并自动创建 GitHub PR，人工审核合并后发布。
3. 为加急审核、赞助展示和联盟链接建立透明的技术基础，但第一阶段不接入实际收款。

“自动增加工具”指自动生成可审核的 PR，不表示绕过人工审核直接上线。

## 2. 目标

- 提供真正可用、移动端友好的 `/submit` 工具提交页。
- 使用 Cloudflare Pages Function 接收提交，使用 D1 保存私密审核队列。
- 防止垃圾提交、重复工具、危险 URL、路径穿越和 SSRF。
- 定时把合格申请转换成符合现有 `AiTool` Schema 的草稿。
- 通过 GitHub PR 复用现有内容生成、测试、构建和代码审核流程。
- 申请人的邮箱、IP 派生信息和审核备注不进入 Git 仓库或公开页面。
- 为合作咨询、赞助披露和联盟链接建立独立数据边界，不能污染“编辑精选”。
- 在新页面发布后支持可选的 IndexNow 与百度链接提交。

## 3. 非目标

- 不自动合并 PR，不让未经审核的工具直接公开。
- 不实现用户账号、评论、评分、虚假排名或工具方自助修改已发布内容。
- 不在第一阶段接入微信支付、支付宝、Stripe 或自动开票。
- 不爬取其他导航站复制内容；只处理用户提交、管理员录入和允许使用的官方资料。
- 不把站点重构成动态 CMS，不取消 `ai-tools.json` 的公开事实源地位。
- 不出售“编辑精选”位置，不承诺付费即可收录。

## 4. 分阶段范围

### 阶段 A：公开提交与审核队列

- 新增 `/submit` 页面与 `ToolSubmissionForm.vue`。
- 新增 `POST /api/submissions` Cloudflare Pages Function。
- 新增 D1 migration 和 `tool_submissions` 表。
- 集成 Turnstile、蜜罐字段、请求体限制和速率限制。
- 提交成功后返回不暴露数据库主键的公开查询码。
- 新增 `/submit/status`，只通过查询码返回有限状态，不返回审核备注或邮箱。

### 阶段 B：自动生成 GitHub PR

- 新增定时 GitHub Action，每六小时领取少量 `pending` 申请。
- 新增 `scripts/curate-tool-submissions.mjs`：校验 URL、去重、提取官网公开元数据、生成结构化草稿并运行现有目录校验。
- AI 补全通过可替换的 `ContentEnricher` 接口完成。配置了模型密钥时生成完整草稿；未配置时进入 `needs_enrichment`，不得用模板文案伪装成人工精选。
- 合格草稿写入 `ai-tools.json`，运行 `content:ai`、测试和 `verify:build`，随后创建 PR。
- PR 标题、正文和标签说明来源、申请编号、自动提取字段、需要人工核验的事实和测试结果。

### 阶段 C：商业化基础

- 提交页提供“普通收录”“希望加急审核”“商业合作咨询”三种意向；第一阶段只收集意向，不在线收费。
- 新增 `/promote` 说明页，解释赞助位、联盟链接、加急审核规则和披露原则。
- 商业活动存放在独立的私密 D1 `campaigns` 表；编辑精选继续只由 `featuredOrder` 决定。
- 只有状态为 `active`、时间有效且关联到已收录工具的活动才能展示。
- 所有商业卡片或外链必须明确显示“赞助”或“联盟链接”，并保留原始官方链接。
- 加急审核只影响处理 SLA，不影响是否收录、内容评价和编辑精选。

### 阶段 D：索引通知与维护

- 发布后继续由现有生成器维护 sitemap。
- 在部署工作流中增加可选的 IndexNow 提交；没有密钥时安静跳过。
- 为百度资源平台生成待提交 URL 列表，并仅在配置了官方 token 时调用接口。
- 每周检查已收录工具的 HTTP 状态、重定向、标题和关键价格页面指纹；变化只产生审核任务，不自动篡改公开内容。

## 5. 总体架构

```text
提交者浏览器
    │  POST /api/submissions + Turnstile
    ▼
Cloudflare Pages Function
    │  校验、去重、限流、写入
    ▼
Cloudflare D1: tool_submissions
    │  管理接口仅接受服务密钥
    ▼
GitHub Action 定时领取
    │
    ├─ URL 与官网元数据检查
    ├─ 可选 AI ContentEnricher
    ├─ 现有 AiTool Schema 校验
    ├─ 生成 Markdown / sitemap
    └─ npm test + verify:build
             │
             ▼
        GitHub Pull Request
             │ 人工核验并合并
             ▼
       Cloudflare Pages 发布
```

## 6. 前端提交体验

### 6.1 表单字段

必填：

- 工具名称
- 官方 HTTPS URL
- 一句话介绍
- 主要分类
- 三个具体使用场景
- 三个核心能力
- 价格模式
- 中文支持情况
- 联系邮箱
- 提交者与工具的关系：创始团队、用户、代理/合作方、其他
- 同意隐私说明和“提交不保证收录”声明
- Turnstile token

选填：

- 更完整的产品介绍
- 支持的平台
- 两个优点、两个限制
- Logo 或品牌素材 URL
- 希望加急审核
- 商业合作说明

不允许上传本地文件。第一阶段只接受官方 HTTPS 素材 URL，避免文件存储、版权和恶意内容风险。

### 6.2 客户端行为

- 使用原生表单语义、可见 label、字段级错误和提交状态 live region。
- 客户端只做体验性校验，服务端重新验证全部字段。
- 成功后显示公开查询码和预计处理说明。
- 网络失败时保留用户已填写内容，不记录到 localStorage。
- 不能把邮箱、查询码或表单内容写入 URL、分析日志或第三方脚本。

## 7. API 设计

### 7.1 公开接口

`POST /api/submissions`

- `Content-Type: application/json`
- 请求体最大 32 KiB。
- 只接受已知字段，拒绝额外字段。
- 验证 Turnstile、邮箱、枚举、字符串长度、HTTPS URL 和数组长度。
- 规范化域名、去除跟踪参数、计算域名指纹和内容哈希。
- 同一域名存在待处理或已收录记录时返回可理解的重复提示。
- 成功返回 `202`、公开查询码和 `pending`；不返回内部 ID。

`POST /api/submissions/status`

- 查询码放在 JSON 请求体中，不进入 URL、访问日志或 Referer。
- 返回 `pending`、`processing`、`needs_info`、`pr_open`、`published`、`rejected` 或 `error`。
- 只返回通用公开说明、PR 公共 URL（如果存在）和发布日期。
- 不返回邮箱、IP 指纹、内部审核备注、模型输出或拒绝风控细节。

`GET /api/campaigns`

- 只返回当前有效活动的工具 slug、固定披露标签、活动类型和公开目标 URL。
- 不返回合同、价格、联系人或内部 campaign ID。
- 短时间缓存；接口异常时前端退回普通目录与官方链接。

### 7.2 管理接口

`POST /api/admin/submissions/claim`

- 使用 `Authorization: Bearer <SUBMISSIONS_ADMIN_TOKEN>`。
- token 只保存在 Cloudflare/GitHub Secrets。
- 单次最多领取 5 条，并使用条件更新把状态从 `pending` 改为 `processing`，防止重复消费。

`PATCH /api/admin/submissions/:id`

- 允许自动化更新状态、错误摘要、PR URL 和公开说明。
- 状态迁移由服务端白名单控制，不能从终态回到 `pending`。

## 8. D1 数据模型

### 8.1 `tool_submissions`

核心字段：

- `id`：内部 UUID
- `public_code_hash`：查询码哈希，不保存明文
- `name`、`official_url`、`normalized_domain`
- `category`、`pricing_mode`、`chinese_support`
- `tagline`、`description`、`best_for_json`、`features_json`
- `pros_json`、`cons_json`、`access_modes_json`
- `contact_email_ciphertext`
- `submitter_relationship`
- `intent`：`standard`、`priority_interest`、`commercial_interest`
- `status`
- `source`：`public_form` 或 `admin`
- `content_hash`、`domain_hash`、`ip_hash`
- `attempt_count`、`last_error_code`
- `github_pr_url`
- `created_at`、`updated_at`、`retention_until`

### 8.2 `campaigns`

- `id`、`tool_slug`
- `campaign_type`：`sponsored_card` 或 `affiliate_link`
- `label`：固定披露文案
- `destination_url`
- `starts_at`、`ends_at`
- `status`
- `created_at`、`updated_at`

活动表与工具事实表分离。商业配置失效时，工具详情仍正常显示官方原始链接。

## 9. 自动整理与 PR 生成

### 9.1 安全抓取

- 只允许 `https:`。
- 拒绝用户名/密码、非标准端口、localhost、私网、链路本地地址和非 HTTP 重定向。
- 最多跟随 3 次重定向，每次重新验证目标。
- 连接与读取超时，响应体设置上限，只读取 HTML 文本。
- 不执行提交网站的 JavaScript，不下载文件，不遵循网页中的操作指令。

### 9.2 AI 内容边界

- AI 只接收公开官网文本和非敏感提交字段，不接收邮箱、IP、查询码或内部备注。
- 输出必须符合 JSON Schema；失败时重试一次，之后进入 `needs_enrichment`。
- 不能生成评分、用户量、流量排名、“完全免费”、未核实中文支持或商业授权承诺。
- 定价必须使用保守模式并以“以官网为准”收尾。
- 每条描述、场景、能力、优缺点必须通过现有去模板化和代表事实测试。

### 9.3 GitHub PR

- 每个提交单独创建分支 `submission/<public-code>-<slug>`。
- 只修改目录事实数据及生成产物，不修改应用逻辑。
- 运行目录校验、页面生成、完整测试、生产构建验证和 `git diff --check`。
- 任一验证失败则不创建 PR，申请状态改为 `error` 或 `needs_enrichment`。
- 人工审核必须核对官网、定价、中文支持、Logo 权利、分类、优缺点和替代工具。

## 10. 商业化规则

- 普通收录永久保留免费通道。
- 加急审核的收费只能对应更快 SLA，不对应收录承诺。
- “编辑精选”不可售卖，继续由公开、可解释的编辑标准产生。
- 赞助内容必须在卡片首屏标注“赞助”，联盟外链旁标注“联盟链接”。
- 商业活动不能改变自然搜索匹配分数、分类计数或替代工具关系。
- 点击统计只记录活动、工具、时间桶和匿名会话标识，不收集完整 IP 或用户画像。
- 第一阶段 `/promote` 只收集合作意向；实际报价、合同、收款和发票在线下完成。

建议最初验证的产品：免费普通收录、付费加急审核意向、首页/分类页赞助位意向、联盟合作意向。展示广告、会员和数据 API 不在本阶段。

## 11. SEO 与索引

- 新工具合并后由现有生成器创建独立详情页并加入 sitemap。
- 工具详情输出 `SoftwareApplication` JSON-LD；分类页输出 `ItemList`；全站输出 `BreadcrumbList`。
- 只有通过审核的工具页面可索引；提交状态页、管理接口和待审核数据必须 `noindex` 或不可公开访问。
- IndexNow 和百度链接提交均为可选部署步骤，密钥缺失不能让构建失败。
- 不批量生成缺少独立价值的对比、替代或榜单页面。

## 12. 隐私、滥用与保留

- 联系邮箱加密保存；加密密钥不进入仓库。
- IP 只与部署秘密组合后生成不可逆限流哈希。
- 默认在终态后保留申请 180 天，到期删除个人数据，只保留匿名统计。
- 提供隐私说明、数据用途、保留期限和删除联系渠道。
- 邮件不用于营销，除非提交者另行主动勾选。
- 日志禁止记录请求体、邮箱、查询码明文、Authorization 或模型密钥。

## 13. 错误处理

- 公开接口返回稳定错误码与中文提示，不泄露内部堆栈。
- D1 写入失败不得返回成功。
- 自动化使用幂等键，重复运行不会创建第二个 PR 或第二条工具记录。
- 抓取、AI、GitHub API 和构建失败分别记录有限错误码，采用指数退避，最多三次。
- 三次失败转为人工处理，不无限重试。
- PR 被关闭或合并后通过定时任务同步公开状态。

## 14. 测试与验收

### 单元与集成测试

- 表单字段、错误、键盘操作、成功与失败状态。
- API 的长度、枚举、额外字段、Turnstile、限流、重复提交和状态查询。
- 管理 token、状态迁移、并发领取和幂等。
- URL 规范化、重定向、私网/本地地址、超时和响应体上限。
- AI JSON Schema、敏感字段隔离和禁止声明。
- PR 草稿在损坏输入、重复 slug、错误替代工具和构建失败时停止。
- 商业活动的时间边界、披露标签和编辑精选隔离。

### 端到端验收

1. 在 320px 与桌面宽度完成一次有效提交。
2. 同域名重复提交被阻止。
3. D1 出现一条 `pending`，公开查询码只能读取有限状态。
4. 自动化领取并创建通过全部构建验证的 PR。
5. 人工合并后新详情页、分类计数、sitemap 与结构化数据正确。
6. 未配置 AI、IndexNow、百度或商业活动密钥时，站点仍能构建和浏览。
7. 赞助活动失效后自动回到普通官方链接，不影响工具页面。

## 15. 部署与秘密配置

需要在 Cloudflare 配置：

- D1 binding：`SUBMISSIONS_DB`
- `TURNSTILE_SECRET_KEY`
- `PUBLIC_CODE_PEPPER`
- `SUBMISSIONS_ADMIN_TOKEN`
- `CONTACT_EMAIL_ENCRYPTION_KEY`

需要在 GitHub Actions 配置：

- `SUBMISSIONS_API_BASE`
- `SUBMISSIONS_ADMIN_TOKEN`
- 可选 `CONTENT_ENRICHER_API_KEY`
- 可选 `INDEXNOW_KEY`
- 可选百度资源平台 token

缺少必要 Cloudflare 秘密时，生产提交接口必须安全失败并提示“暂时无法提交”；不能把默认密钥或占位密钥部署到生产。

## 16. 实施顺序

1. 建立共享提交 Schema、D1 migration、Pages Function 和 API 测试。
2. 建立提交页、状态页、隐私说明和浏览器端测试。
3. 建立管理领取接口、自动整理脚本、可替换内容补全接口和 PR 工作流。
4. 建立 `/promote`、商业意向字段、活动数据边界与披露组件。
5. 增加结构化数据、可选索引通知、维护检查和完整端到端验证。

每一步都保持现有 63 工具目录可独立构建；没有配置外部服务时，浏览和搜索功能不能退化。
