# 寻器 AI 工具目录

寻器是一个面向中文用户的 AI 工具目录，按真实使用场景整理写作、图像、视频、编程、办公和音频工具。首页提供搜索和分类筛选，每个工具都有独立的静态详情页。

## 开发

```bash
npm install
npm run docs:dev
```

打开 `http://127.0.0.1:5173/` 查看本地站点。

## 更新工具内容

编辑 `docs/.vitepress/theme/domain/ai-tools.json`，完成后运行：

```bash
npm run content:ai
```

生成的 `docs/tools/` 和 `docs/ai-categories/` 页面会纳入 Git。发布前请人工检查工具名称、官网链接、价格和授权说明。

## 测试与构建

```bash
npm test
npm run docs:build
```

静态输出位于 `docs/.vitepress/dist`。

## Cloudflare Pages

- 构建命令：`npm run docs:build`
- 输出目录：`docs/.vitepress/dist`
- 生产分支：`main`

站点只提供信息整理；如果未来接入联盟链接，需要在对应页面明确披露。
