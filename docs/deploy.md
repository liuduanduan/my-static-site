---
title: Cloudflare Pages 部署
description: NoICU Cultivator 部署到 Cloudflare Pages 的配置说明。
---

# Cloudflare Pages 部署

本站是纯静态 VitePress 项目，适合部署在 Cloudflare Pages，并通过 Cloudflare CDN 全球访问。

## 构建配置

| 项目 | 值 |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run docs:build` |
| Build output directory | `docs/.vitepress/dist` |
| Node.js | Cloudflare 默认 Node 20+ |

## 上线验收

- 首页、术语词典、修炼体系、经典作品、文化背景、关于页面均可访问
- `/` 为中文主站，`/en/` 为英文站
- 右上角语言切换正常
- 站内搜索可搜索中文和英文术语
- `sitemap.xml` 自动生成
- `favicon.svg`、`site.webmanifest`、`social-card.svg` 可访问
