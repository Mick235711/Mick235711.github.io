# Mick235711's Personal Website

This website is built with [Astro](https://astro.build/) and the
[Fuwari](https://github.com/saicaca/fuwari) theme. It is deployed to GitHub
Pages by the workflow in `.github/workflows/deploy.yml`.

## Local development

```sh
pnpm install
pnpm dev
```

Run `pnpm build` before publishing to check the production site and its search
index. Posts live in `src/content/posts/`; their original dated URLs are kept.
