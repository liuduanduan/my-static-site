# 寻器 AI 工具目录

寻器是面向中文用户的精选 AI 工具目录。站点按 9 类真实使用场景组织工具，提供搜索、筛选、独立详情页和人工审核的工具提交入口；商业合作区域与自然目录明确分离。

## 本地开发

```powershell
npm install
npm run docs:dev
```

打开 `http://127.0.0.1:5173/`。未配置 `VITE_TURNSTILE_SITE_KEY` 时，目录仍可正常浏览，提交按钮会安全禁用。

## 更新目录

公开目录的唯一事实源是 `docs/.vitepress/theme/domain/ai-tools.json`。人工编辑后须人工核验；自动发现批次须通过受保护工作流的官网证据门槛。完成修改后运行：

```powershell
npm run content:ai
npm test
npm run verify:build
```

生成的 `docs/tools/`、`docs/ai-categories/`、`docs/ai-scenarios/` 和清单文件需要一并提交。公开提交申请只生成待人工审核 PR，不会自动合并；自动发现批次在官网证据、确定性规则、测试与生产构建全部通过后由受保护工作流自动合并。

## 常用检查

```powershell
npm run typecheck:functions
npm test
npm run verify:build
npm run tools:check-links
```

官网健康检查只读取目录并生成 `ai-tool-link-report.json`，不会修改目录或创建 PR。

## Cloudflare Pages

- 构建命令：`npm run docs:build`
- 输出目录：`docs/.vitepress/dist`
- 生产分支：`main`

D1、Pages bindings、Turnstile、GitHub Actions、256 位内部密钥、每日隐私数据清理、搜索引擎通知、备份与回滚的完整步骤见 [Cloudflare 提交系统部署与运维](docs/cloudflare-submissions-setup.md)。

本站只提供信息整理。赞助卡片和联盟链接必须明确披露，不能修改编辑精选、自然搜索排序、分类计数或替换原始官网链接。
