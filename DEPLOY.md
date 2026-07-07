# Cloudflare Pages Deployment

Production settings for `no996noicu.com`:

- Framework preset: None
- Build command: `npm run docs:build`
- Build output directory: `docs/.vitepress/dist`
- Production branch: `main`
- Node version: Cloudflare default Node 20+ is fine for VitePress

After pushing to `main`, Cloudflare Pages should build and deploy automatically. The site is fully static and served globally through Cloudflare CDN.
