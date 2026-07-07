---
title: Cloudflare Pages Deploy
description: Deployment settings for Cloudflare Pages.
---

# Cloudflare Pages Deploy

Use these settings for Cloudflare Pages:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run docs:build` |
| Build output directory | `docs/.vitepress/dist` |
| Node version | Current Cloudflare default or Node 20+ |

The site is static after build, so Cloudflare can serve it globally from its edge network. If the custom domain is connected correctly, users worldwide should be able to open it unless their local network blocks the domain.

## After Deploy

Check these routes:

- `/`
- `/glossary/qi`
- `/cultivation-system/`
- `/classic-works/`
- `/culture/`
- `/sitemap.xml`

