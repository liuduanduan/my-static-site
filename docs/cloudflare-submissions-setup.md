# Cloudflare 提交系统部署与运维

本文用于把寻器的工具提交、私密审核队列、人工收录 PR、商业活动读取和到期数据清理部署到现有 Cloudflare Pages 项目。请先在测试环境完成一次全流程，再配置生产环境。

## 1. 部署前检查

在仓库根目录执行：

```powershell
npm ci
npm run typecheck:functions
npm test
npm run verify:build
```

Cloudflare Pages 保持以下构建配置：

- 构建命令：`npm run docs:build`
- 输出目录：`docs/.vitepress/dist`
- 生产分支：`main`
- Pages Functions 目录：仓库根目录下的 `functions/`

## 2. 创建 D1 并执行迁移

使用已登录正确 Cloudflare 账户的终端执行：

```powershell
npm exec wrangler d1 create xunqi-submissions
npm exec wrangler d1 migrations apply xunqi-submissions --remote
```

记录第一条命令返回的数据库 ID，但不要把真实 ID、访问令牌或任何密钥提交到 Git。进入现有 Pages 项目的 Settings → Bindings，新增 D1 database binding：

- Variable name：`SUBMISSIONS_DB`
- D1 database：`xunqi-submissions`

预览环境和生产环境应分别绑定预览库与生产库，避免测试申请进入生产队列。

## 3. Turnstile

在 Cloudflare Turnstile 创建站点，允许生产域名和需要使用的预览域名。然后配置：

- Pages secret：`TURNSTILE_SECRET_KEY`，值为 Cloudflare 签发的 Turnstile secret key。
- Pages 构建变量：`VITE_TURNSTILE_SITE_KEY`，值为公开 site key；它会进入浏览器构建产物，不应填写 secret key。

如果没有 `VITE_TURNSTILE_SITE_KEY`，提交页会安全地禁用提交，不会绕过验证。

## 4. 生成并配置内部 256 位密钥

在本地 PowerShell 中分别运行下面三条命令。每次都会生成独立的 32 字节随机值；不要复用、截图、写入仓库或粘贴到工单。

```powershell
# PUBLIC_CODE_PEPPER
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# SUBMISSIONS_ADMIN_TOKEN
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# CONTACT_EMAIL_ENCRYPTION_KEY（必须是 Base64 编码的 32 字节）
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

在 Pages 的生产和预览环境中分别建立以下加密变量：

- `PUBLIC_CODE_PEPPER`
- `SUBMISSIONS_ADMIN_TOKEN`
- `CONTACT_EMAIL_ENCRYPTION_KEY`
- `TURNSTILE_SECRET_KEY`

修改 `PUBLIC_CODE_PEPPER` 会让已有查询码失效；修改 `CONTACT_EMAIL_ENCRYPTION_KEY` 会让已有联系邮箱无法解密。因此轮换前必须完成备份、制定迁移窗口并保留旧密钥直至历史数据过期或完成重加密。任何变量缺失时，相关接口应返回安全的 `503`，不能设置开发默认值。

## 5. GitHub Actions 密钥

在仓库 Settings → Secrets and variables → Actions 中添加：

- `SUBMISSIONS_API_BASE`：生产 Pages 地址，例如 `https://no996noicu.com`，末尾斜杠可省略。
- `SUBMISSIONS_ADMIN_TOKEN`：必须与生产 Pages 的同名变量一致。

可选的内容补全必须成对配置：

- `CONTENT_ENRICHER_API_KEY`
- `CONTENT_ENRICHER_MODEL`

没有这两个值时，申请进入 `needs_enrichment`，不会生成模板垃圾内容。当前 HTTP 适配器使用隔离的 Responses 请求、严格 JSON Schema 和可配置模型名。生产启用前，必须重新对照 [OpenAI Structured Outputs 官方文档](https://platform.openai.com/docs/guides/structured-outputs) 核对当时的请求与响应格式；不要在代码中硬编码模型名。

工作流职责如下：

- `curate-tool-submission.yml`：每次最多领取一条申请，只创建待人工审核 PR，不自动合并。
- `sync-tool-submission-pr.yml`：PR 关闭后同步公开状态，不检出或执行 PR 代码。
- `check-ai-tool-links.yml`：每周只读检查官网的 HTTP 状态、跳转、标题和关键价格页指纹；与上一份可信报告比较，有变化时只创建或追加 GitHub 人工审核任务，不自动修改目录，也不接收管理或 OpenAI 密钥。
- `maintain-tool-submissions.yml`：每天调用受保护的清理接口，不 checkout、不执行仓库代码。

## 6. 每日保留期清理与核验

每日工作流向下面的接口发送空 JSON：

```text
POST /api/admin/submissions/purge
Authorization: Bearer <SUBMISSIONS_ADMIN_TOKEN>
Content-Type: application/json
```

手动恢复或补跑清理时，可在本地使用环境变量调用同一接口：

```powershell
$purgeHeaders = @{ Authorization = "Bearer $env:SUBMISSIONS_ADMIN_TOKEN" }
$purgeUri = "$($env:SUBMISSIONS_API_BASE.TrimEnd('/'))/api/admin/submissions/purge"
Invoke-RestMethod -Method Post -Uri $purgeUri -Headers $purgeHeaders -ContentType 'application/json' -Body '{}'
```

清理后执行以下只读 SQL：第一条应返回 `0`；第二条用于核对匿名日汇总；第三条仅包含已经公开收录工具的规范化官网域名，不含邮箱、IP、查询码或原始申请内容，用于长期阻止重复申请：

```powershell
npm exec wrangler d1 execute xunqi-submissions --remote --command "SELECT COUNT(*) AS expired_rows FROM tool_submissions WHERE retention_until <= datetime('now');"
npm exec wrangler d1 execute xunqi-submissions --remote --command "SELECT day, source, intent, outcome, count FROM submission_daily_stats ORDER BY day DESC, source, intent, outcome LIMIT 100;"
npm exec wrangler d1 execute xunqi-submissions --remote --command "SELECT normalized_domain, published_at FROM published_tool_domains ORDER BY published_at DESC LIMIT 100;"
```

若每日工作流失败，不要删除或直接修改单条申请；先检查 Pages Functions 日志、绑定和管理令牌，再手动补跑。日志中不得输出 Authorization、查询码、邮箱密文、请求正文或完整 IP。

## 7. D1 备份与回滚

每次迁移和密钥轮换前先导出远程数据库，并把备份保存在受访问控制的加密位置：

```powershell
New-Item -ItemType Directory -Force -Path '.local-backups' | Out-Null
npm exec wrangler d1 export xunqi-submissions --remote --output '.local-backups/xunqi-submissions-before-change.sql'
```

`.local-backups` 不得加入 Git。回滚步骤：

1. 暂停策展、同步和每日清理工作流，避免回滚时继续写入。
2. 在 Cloudflare Pages 回滚到上一个已验证部署。
3. 优先用向前修复迁移恢复 schema；只有确认需要恢复数据时，才创建空的恢复库并导入备份：

```powershell
npm exec wrangler d1 create xunqi-submissions-restore
npm exec wrangler d1 execute xunqi-submissions-restore --remote --file '.local-backups/xunqi-submissions-before-change.sql'
```

4. 将 Pages 的 `SUBMISSIONS_DB` 临时切换到恢复库，运行第 1 节的全部验证和本节 SQL 核验。
5. 确认查询、提交、策展和清理均正常后再恢复工作流。旧库先保留一个约定的观察期，不要立即删除。

## 8. 可选搜索引擎通知

通知只能在生产部署成功后执行，并且必须显式提供本次新增或修改的规范 URL 白名单。先创建 UTF-8、每行一个 URL 的文件，例如 `changed-urls.txt`，再运行：

```powershell
npm run search:notify -- --sitemap docs/.vitepress/dist/sitemap.xml --urls changed-urls.txt
```

可选环境变量：

- `INDEXNOW_KEY`：同时按 IndexNow 要求在站点根路径发布对应 key 文件。
- `BAIDU_TOKEN`：百度搜索资源平台推送 token。

脚本只会推送同时存在于已构建 sitemap、同一 HTTPS 源且位于显式白名单中的公开 URL；状态、管理和隐私 URL 会被排除。没有任何密钥时脚本成功退出且不发网络请求；任一服务返回非 2xx 时脚本失败，但不会修改构建产物。不要把密钥写进 URL 白名单、命令历史、仓库或日志。

## 9. 自动发现 AI 工具

`discover-ai-tools.yml` 的代码当前仅位于本地分支；在包含该工作流的分支推送并合并到 GitHub、且完成下述仓库 Actions 设置、权限和 Secrets 配置之前，定时任务**尚未上线**，不能将它视为正在运行的生产自动化。

上线前在 GitHub 的 Actions secrets 中配置内容补全所必需的两个值：

- `CONTENT_ENRICHER_API_KEY`
- `CONTENT_ENRICHER_MODEL`

可选搜索索引通知沿用现有通知器和工作流的名称：`INDEXNOW_KEY` 与 `BAIDU_TOKEN`。未配置它们时，通知器不会发送请求。不要把任何 Secret 写入配置文件、终端输出、Issue、PR 或日志。

发现工作流每次最多发布 3 个通过全部确定性门槛的工具，目录总量达到 300 时停止发布。它不会取代公开提交的人工审核流程：`curate-tool-submission.yml` 仍然只创建待人工审核的 PR，不会自动合并。

### 本地安全演练

在仓库根目录运行下面的干跑命令。`--dry-run` 仍会读取已配置的公开来源和写入本地状态/审核输出，但绝不修改 `docs/.vitepress/theme/domain/ai-tools.json`：

```powershell
npm run tools:discover -- --config config/ai-discovery-sources.json --output ai-discovery-state.json --review ai-discovery-review.md --urls discovered-urls.txt --dry-run
```

首次真实来源演练应在子进程中明确清空 `CONTENT_ENRICHER_API_KEY` 和 `CONTENT_ENRICHER_MODEL`，使需要内容补全的候选写入审核结果而不是调用补全服务。检查 `ai-discovery-review.md`、`ai-discovery-state.json` 和 `discovered-urls.txt`；这些是本地运行时文件，不得提交。

### GitHub 运行与审核

完成推送、合并和 Secret 配置后，工作流既可按其已提交的日程运行，也可在 GitHub Actions 页面选择 **Discover verified AI tools** 后通过 `workflow_dispatch` 手动运行。每次运行会尝试恢复上一份可信状态，并将 `ai-discovery-state.json` 与 `ai-discovery-review.md` 上传为 `ai-discovery-state` artifact（保留 90 天）。

无法安全发布的候选会写入固定的 GitHub Issue **AI 工具自动发现审核**，供人工核对，不会绕过目录质量门槛。成功批次也必须先经受保护工作流的校验，再以单个 1–3 工具批次合并。

如需回滚已经自动合并的发现批次，使用 `git revert <discovery-squash-commit>` 创建反向提交并让常规校验完成；不要使用重写历史或强制推送。回滚后人工检查目录和状态 artifact，再决定是否重新启用工作流。

## 10. 上线验收

完成配置后至少验证：

1. `/submit` 正常显示 Turnstile，提交后只展示一次私密查询码。
2. `/submit/status` 使用 POST 查询，查询码不出现在地址栏。
3. 错误 Turnstile、错误管理令牌和重复域名均失败关闭。
4. 人工策展只创建 PR；未合并条目不会进入公开目录。
5. `/promote` 和工具详情页保持赞助/联盟披露，原始官网链接始终保留。
6. 每日清理返回删除数量，D1 过期行查询为零，匿名汇总仍可核验。
