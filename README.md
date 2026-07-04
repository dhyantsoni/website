# Personal Website

Dhyan Soni's personal site — projects, blog, and resume. Built with
[Astro](https://astro.build) and deployed to GitHub Pages.

Live: https://dhyantsoni.github.io/website

## Develop

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Add a blog post

```bash
npm run new:post
```

Answer the prompts, then edit the created file in `src/content/blog/`. Posts
start as `draft: true` — set `draft: false` to publish. Frontmatter:

```yaml
title: "My Post"
description: "One-line summary."
date: 2026-07-03
tags: ["tag1", "tag2"]
draft: false
```

## Add a project

```bash
npm run new:project
```

Edit the created file in `src/content/projects/`. Frontmatter:

```yaml
title: "My Project"
description: "One-line summary."
date: 2026-07-03
tags: ["Astro", "TypeScript"]
repo: "https://github.com/dhyantsoni/..."   # optional
demo: "https://..."                          # optional
featured: false                               # true = show on the home page
```

## Deploy

Push to `master`. The GitHub Actions workflow builds and deploys automatically.

**One-time GitHub setup:** repo **Settings → Pages → Build and deployment →
Source = GitHub Actions**.

## Personalize

Edit files marked with `<!-- EDIT -->` or `PLACEHOLDER`:

- `src/lib/links.ts` — email, LinkedIn, Devpost URLs
- `src/pages/about.astro` — bio, skills, experience
- `src/pages/index.astro` — hero copy
- `public/resume.pdf` — your real resume

## Custom domain (later)

1. Set `site` to your domain and `base` to `'/'` in `astro.config.mjs`.
2. Add `public/CNAME` containing the domain.
3. Configure the domain in repo **Settings → Pages**.

## Structure

```
src/
  content/        # markdown entries (projects/, blog/) + schemas
  components/     # Nav, Footer, ThemeToggle, cards
  layouts/        # Base layout (head, nav, footer, theme)
  pages/          # routes: home, projects, blog, about
  styles/         # global.css design tokens
  lib/            # links + helpers
scripts/          # new-entry.mjs scaffolder
```
