---
title: Cloudflare Pages 部署
description: Cloudflare Pages 部署配置。
---

# Cloudflare Pages 部署

Cloudflare Pages 设置如下：

| 设置 | 值 |
| --- | --- |
| 生产分支 | `main` |
| 构建命令 | `npm run docs:build` |
| 输出目录 | `docs/.vitepress/dist` |
| Node 版本 | Cloudflare 默认版本或 Node 20+ |

站点构建后是纯静态文件，Cloudflare 会通过全球边缘网络分发。自定义域名配置正确后，正常情况下全球都能访问。

## 部署后检查

- `/`
- `/`
- `/glossary/qi`
- `/cultivation-system/`
- `/sitemap.xml`

