# Cloudflare Pages 部署

当前站点是静态 VitePress 目录站，适合直接部署到 Cloudflare Pages。

- Framework preset：None
- Build command：`npm run docs:build`
- Build output directory：`docs/.vitepress/dist`
- Production branch：`main`
- Node：使用 Cloudflare 默认的 Node 20+ 即可

构建命令会先从 JSON 数据生成工具详情页和分类页，再执行 VitePress 构建。部署前应确认生成页面和官方链接已人工审核。
