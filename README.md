# NoICU Cultivator

《逍遥长生录》 is a bilingual VitePress encyclopedia for xianxia, cultivation realms, glossary terms, classic works, cultural background, and the RMJI / 凡人修仙传 universe topic.

## Development

```bash
npm install
npm run docs:dev
```

Generate the RMJI topic pages:

```bash
npm run content:rmji
```

## Build

```bash
npm run docs:build
```

The static output is generated in `docs/.vitepress/dist`.

## Cloudflare Pages

- Build command: `npm run docs:build`
- Build output directory: `docs/.vitepress/dist`
- Production branch: `main`

See [DEPLOY.md](./DEPLOY.md) and [docs/deploy.md](./docs/deploy.md).
