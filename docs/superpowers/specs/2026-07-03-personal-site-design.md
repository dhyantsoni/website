# Personal Website — Design Spec

**Date:** 2026-07-03
**Owner:** Dhyan Soni (`dhyantsoni`)
**Repo:** https://github.com/dhyantsoni/website
**Deploy target:** GitHub Pages (`dhyantsoni.github.io/website` initially; custom domain later)

## Goal

A personal website that shows technical depth and serves as both a public site
and a resume site. It hosts coding projects and a personal blog, and must make
adding new entries effortless. **No mention of Nixo anywhere.**

## Stack & Architecture

- **Astro** static site generator.
- Deployed to **GitHub Pages** via a GitHub Actions workflow: push to `master`
  triggers build & deploy. No manual steps.
- Content lives in **Astro content collections** with typed (Zod) schemas so a
  malformed entry fails the build rather than shipping broken.
  - `src/content/projects/*.md`
  - `src/content/blog/*.md`
- Zero client JS by default. Minimal JS only for: theme toggle, subtle
  scroll/hover motion (all gated behind `prefers-reduced-motion`).
- `astro.config.mjs` sets `site` and `base` so paths work under `/website` and
  can be switched to a root custom domain later by editing two values.

## Design System — "technical + editorial" hybrid

- **Dark-first** with a refined light mode and a toggle that respects
  `prefers-color-scheme` and persists choice to `localStorage`.
- **Typography:**
  - Prose/headings: an elegant sans (Inter or General Sans).
  - Metadata, tags, dates, code: **JetBrains Mono** (monospace) — the technical
    texture.
- **Color:** near-black ink base, warm off-white text, a single restrained
  accent (cool cyan-green or electric indigo — finalized during build using the
  ui-ux-pro-max color tooling). Precise grid, generous whitespace.
- **Motion:** subtle fade/rise on scroll, card hover states, an animated hero.
  All motion respects `prefers-reduced-motion`.
- Accessibility: semantic HTML, focus states, sufficient contrast in both
  themes, keyboard-navigable nav and theme toggle.

## Pages

- `/` — Hero (name, "Student & engineer…" tagline, primary links) + featured
  projects + latest blog posts.
- `/projects` — gallery grid of all projects.
- `/projects/<slug>` — project detail page: write-up, tech-stack tags,
  repo/demo links, optional cover image.
- `/blog` — post list with tags + reading time.
- `/blog/<slug>` — article page.
- `/about` — long-form bio, skills, experience timeline, downloadable PDF
  resume.
- Global nav + footer with links: **GitHub, Email, LinkedIn, Devpost**.

## Content Model

**Project frontmatter schema:**
- `title` (string, required)
- `description` (string, required)
- `date` (date, required)
- `tags` (string[], default `[]`)
- `repo` (string URL, optional)
- `demo` (string URL, optional)
- `featured` (boolean, default `false`) — surfaces on home page
- `cover` (image/string, optional)

**Blog post frontmatter schema:**
- `title` (string, required)
- `description` (string, required)
- `date` (date, required)
- `tags` (string[], default `[]`)
- `draft` (boolean, default `false`) — drafts excluded from production build

## Adding Entries (the "easy" requirement)

- `npm run new:post` and `npm run new:project` — interactive scaffolder scripts
  that prompt for title/date and generate a correctly-formatted markdown file
  from a template into the right collection folder.
- Workflow: run script → fill in markdown → `git push`. Site auto-rebuilds.
- Frontmatter format documented in `README.md`.

## Seed Content

- **Real:** identity copy (student & engineer), nav/footer links (GitHub,
  Email, LinkedIn, Devpost), one fully-written example project and one example
  blog post that double as living templates.
- **Placeholder (clearly marked `<!-- EDIT -->`):** resume specifics, skills
  list, experience timeline entries, social URLs where unknown, contact email.
- **Explicitly excluded:** any reference to Nixo.

## Configuration Values to Fill In Later

- Contact email (placeholder until provided).
- LinkedIn URL, Devpost URL (placeholders).
- Custom domain: change `site`/`base` in `astro.config.mjs` and add a `CNAME`
  file when the domain is ready.

## Out of Scope (YAGNI)

- No CMS / admin UI.
- No comments, analytics, or newsletter (can be added later).
- No server-side code — fully static.
- Custom domain setup deferred (structure supports it; not configured now).

## Success Criteria

- Site builds and deploys to GitHub Pages automatically on push.
- Home, projects (list + detail), blog (list + detail), and about pages all
  render in both light and dark themes.
- Adding a new project or post is a single scaffolder command + markdown edit.
- Lighthouse: high performance/accessibility scores (static, minimal JS).
- Zero references to Nixo.
