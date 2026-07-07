---
title: Cloudflare Pages Deploy
description: Deployment settings for NoICU Cultivator on Cloudflare Pages.
---

# Cloudflare Pages Deploy

NoICU Cultivator is a static VitePress site and is deployed through Cloudflare Pages with global CDN delivery.

## Build Settings

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run docs:build` |
| Build output directory | `docs/.vitepress/dist` |
| Node.js | Cloudflare default Node 20+ |

## Acceptance Checks

- Home, glossary, cultivation system, classic works, culture, and about pages are reachable
- `/` is Simplified Chinese and `/en/` is English
- Language switching works globally
- Local search returns Chinese and English terms
- `sitemap.xml` is generated
- `favicon.svg`, `site.webmanifest`, and `social-card.svg` are available
