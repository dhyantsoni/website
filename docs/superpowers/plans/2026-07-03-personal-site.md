# Personal Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Dhyan Soni's personal website (resume + coding projects + blog) as an Astro static site that auto-deploys to GitHub Pages, with markdown content collections and a one-command scaffolder for new entries.

**Architecture:** Astro static site. Content is markdown in typed content collections (`projects`, `blog`). A shared base layout provides nav, footer, theme toggle, and design-system CSS tokens. Pages render collections into a home page, projects list/detail, blog list/detail, and an about page. A GitHub Actions workflow builds and deploys to GitHub Pages on push to `master`.

**Tech Stack:** Astro (latest), TypeScript, Zod (via Astro `content` schema), plain CSS with custom properties, JetBrains Mono + Inter fonts (self-hosted via `@fontsource`), Node ≥ 20.

## Global Constraints

- **No mention of Nixo** anywhere in code, content, comments, or commit messages.
- Deploy target custom domain `https://dhyantsoni.com`; base path `/`. Both live in `astro.config.mjs` and must be easy to change later.
- All motion gated behind `prefers-reduced-motion`.
- Dark-first theme with working light mode; toggle persists to `localStorage` and respects `prefers-color-scheme`.
- Links to surface: GitHub (`https://github.com/dhyantsoni`), Email (placeholder), LinkedIn (placeholder), Devpost (placeholder). Placeholders marked `<!-- EDIT -->` / obvious `PLACEHOLDER` values.
- Node ≥ 20. Use `npm` as the package manager.
- Internal links must be base-path aware (use Astro's `import.meta.env.BASE_URL`, never hardcode `/`).

---

### Task 1: Scaffold Astro project and configure for GitHub Pages

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `src/env.d.ts`
- Create: `src/pages/index.astro` (temporary placeholder, replaced in Task 5)

**Interfaces:**
- Produces: a buildable Astro project; `astro.config.mjs` exporting `site` and `base`; npm scripts `dev`, `build`, `preview`.

- [ ] **Step 1: Initialize a minimal Astro project in-place**

Run in the repo root (which already contains `.git`, `README.md`, `docs/`):

```bash
npm create astro@latest -- --template minimal --no-install --no-git --yes .
```

If the CLI refuses because the directory is non-empty, create in a temp subdir and move files:

```bash
npm create astro@latest tmp-astro -- --template minimal --no-install --no-git --yes \
  && cp -r tmp-astro/. . && rm -rf tmp-astro
```

- [ ] **Step 2: Set Node engine and add scripts in `package.json`**

Ensure `package.json` has:

```json
{
  "name": "website",
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "new:post": "node scripts/new-entry.mjs blog",
    "new:project": "node scripts/new-entry.mjs project"
  }
}
```

(The `new:*` scripts reference Task 9; they can exist before that file does.)

- [ ] **Step 3: Configure `astro.config.mjs` for GitHub Pages**

```js
import { defineConfig } from 'astro/config';

// GitHub Pages: project site served at /<repo>. For a custom domain later,
// set site to the domain and base to '/'.
export default defineConfig({
  site: 'https://dhyantsoni.com',
  base: '/website',
});
```

- [ ] **Step 4: Install dependencies**

```bash
npm install
```

- [ ] **Step 5: Add a temporary home page so the build has a route**

`src/pages/index.astro`:

```astro
---
---
<html lang="en">
  <head><meta charset="utf-8" /><title>Dhyan Soni</title></head>
  <body><h1>Placeholder</h1></body>
</html>
```

- [ ] **Step 6: Verify the build succeeds**

Run: `npm run build`
Expected: build completes with no errors; a `dist/` directory is produced containing `index.html`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project configured for GitHub Pages"
```

---

### Task 2: Define content collections and schemas

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/projects/.gitkeep`, `src/content/blog/.gitkeep`

**Interfaces:**
- Produces: collections `projects` and `blog` with the exact frontmatter schemas below. Consumed by Tasks 5, 6, 7, 9, 10.
- Project fields: `title:string, description:string, date:Date, tags:string[]=[], repo?:string(url), demo?:string(url), featured:boolean=false, cover?:string`.
- Blog fields: `title:string, description:string, date:Date, tags:string[]=[], draft:boolean=false`.

- [ ] **Step 1: Write `src/content.config.ts`**

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    featured: z.boolean().default(false),
    cover: z.string().optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, blog };
```

- [ ] **Step 2: Create the collection directories**

```bash
mkdir -p src/content/projects src/content/blog
touch src/content/projects/.gitkeep src/content/blog/.gitkeep
```

- [ ] **Step 3: Verify the build still succeeds (empty collections are valid)**

Run: `npm run build`
Expected: build completes with no schema errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: define projects and blog content collections"
```

---

### Task 3: Design-system tokens, fonts, and theme toggle

**Files:**
- Create: `src/styles/global.css`
- Create: `src/components/ThemeToggle.astro`
- Modify: `package.json` (fonts dependency)

**Interfaces:**
- Produces: CSS custom properties on `:root` and `[data-theme]`; a `<ThemeToggle />` component; global font imports. Consumed by Task 4 layout.
- CSS tokens: `--bg, --bg-elev, --text, --text-dim, --accent, --border, --font-sans, --font-mono, --maxw`.

- [ ] **Step 1: Install fonts**

```bash
npm install @fontsource-variable/inter @fontsource-variable/jetbrains-mono
```

- [ ] **Step 2: Write `src/styles/global.css`**

```css
@import '@fontsource-variable/inter';
@import '@fontsource-variable/jetbrains-mono';

:root {
  --font-sans: 'Inter Variable', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono Variable', ui-monospace, monospace;
  --maxw: 68rem;

  /* dark (default) */
  --bg: #0b0d10;
  --bg-elev: #14171c;
  --text: #e8eaed;
  --text-dim: #9aa2ad;
  --accent: #4fd1c5;
  --border: #232830;
}

:root[data-theme='light'] {
  --bg: #fbfbf9;
  --bg-elev: #ffffff;
  --text: #17191c;
  --text-dim: #565d67;
  --accent: #0f9488;
  --border: #e4e4dd;
}

* { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

.container { max-width: var(--maxw); margin: 0 auto; padding: 0 1.25rem; }

.mono { font-family: var(--font-mono); }

:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.rise { opacity: 0; transform: translateY(12px); animation: rise 0.6s ease forwards; }
@keyframes rise { to { opacity: 1; transform: none; } }

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
  html { scroll-behavior: auto; }
  .rise { opacity: 1; transform: none; }
}
```

- [ ] **Step 3: Write `src/components/ThemeToggle.astro`**

```astro
---
---
<button id="theme-toggle" class="mono" aria-label="Toggle color theme" type="button">
  <span data-icon></span>
</button>

<style>
  #theme-toggle {
    background: var(--bg-elev);
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: 0.5rem;
    padding: 0.4rem 0.6rem;
    cursor: pointer;
    font-size: 0.85rem;
  }
  #theme-toggle:hover { border-color: var(--accent); }
</style>

<script is:inline>
  (function () {
    const root = document.documentElement;
    const stored = localStorage.getItem('theme');
    const initial = stored || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    root.dataset.theme = initial;
    function render() {
      const el = document.querySelector('#theme-toggle [data-icon]');
      if (el) el.textContent = root.dataset.theme === 'light' ? '☀ light' : '☾ dark';
    }
    render();
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#theme-toggle')) return;
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', root.dataset.theme);
      render();
    });
  })();
</script>
```

Note: the theme is set in an inline script in the `<head>` (Task 4) to avoid a
flash; this component's script only handles the toggle click + icon.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add design tokens, fonts, and theme toggle"
```

---

### Task 4: Base layout with nav and footer

**Files:**
- Create: `src/layouts/Base.astro`
- Create: `src/components/Nav.astro`
- Create: `src/components/Footer.astro`
- Create: `src/lib/links.ts`

**Interfaces:**
- Consumes: `src/styles/global.css`, `ThemeToggle.astro` (Task 3).
- Produces: `Base.astro` accepting props `{ title: string; description?: string }` and a default `<slot />`. Consumed by all page tasks (5–8).
- Produces: `src/lib/links.ts` exporting `const links = { github, email, linkedin, devpost }` and `withBase(path: string): string`.

- [ ] **Step 1: Write `src/lib/links.ts`**

```ts
export const links = {
  github: 'https://github.com/dhyantsoni',
  email: 'mailto:PLACEHOLDER@example.com', // <-- EDIT
  linkedin: 'https://www.linkedin.com/in/PLACEHOLDER', // <-- EDIT
  devpost: 'https://devpost.com/PLACEHOLDER', // <-- EDIT
};

/** Prefix a site-absolute path with the configured base path. */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base + (path.startsWith('/') ? path : '/' + path);
}
```

- [ ] **Step 2: Write `src/components/Nav.astro`**

```astro
---
import ThemeToggle from './ThemeToggle.astro';
import { withBase } from '../lib/links';
const items = [
  { href: withBase('/'), label: 'Home' },
  { href: withBase('/projects'), label: 'Projects' },
  { href: withBase('/blog'), label: 'Blog' },
  { href: withBase('/about'), label: 'About' },
];
---
<header class="nav">
  <div class="container nav-inner">
    <a class="brand mono" href={withBase('/')}>dhyan<span>.soni</span></a>
    <nav class="nav-links">
      {items.map((i) => <a href={i.href}>{i.label}</a>)}
      <ThemeToggle />
    </nav>
  </div>
</header>

<style>
  .nav { border-bottom: 1px solid var(--border); position: sticky; top: 0; background: color-mix(in srgb, var(--bg) 85%, transparent); backdrop-filter: blur(8px); z-index: 10; }
  .nav-inner { display: flex; align-items: center; justify-content: space-between; height: 3.75rem; }
  .brand { font-weight: 600; color: var(--text); }
  .brand span { color: var(--text-dim); }
  .nav-links { display: flex; align-items: center; gap: 1.1rem; }
  .nav-links a { color: var(--text-dim); font-size: 0.95rem; }
  .nav-links a:hover { color: var(--text); text-decoration: none; }
  @media (max-width: 540px) { .brand span { display: none; } .nav-links { gap: 0.75rem; } }
</style>
```

- [ ] **Step 3: Write `src/components/Footer.astro`**

```astro
---
import { links } from '../lib/links';
---
<footer class="footer">
  <div class="container footer-inner">
    <span class="mono">© Dhyan Soni</span>
    <nav class="socials mono">
      <a href={links.github}>GitHub</a>
      <a href={links.linkedin}>LinkedIn</a>
      <a href={links.devpost}>Devpost</a>
      <a href={links.email}>Email</a>
    </nav>
  </div>
</footer>

<style>
  .footer { border-top: 1px solid var(--border); margin-top: 5rem; padding: 2rem 0; }
  .footer-inner { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; color: var(--text-dim); font-size: 0.85rem; }
  .socials { display: flex; gap: 1rem; }
</style>
```

- [ ] **Step 4: Write `src/layouts/Base.astro`**

```astro
---
import '../styles/global.css';
import Nav from '../components/Nav.astro';
import Footer from '../components/Footer.astro';
const { title, description = 'Dhyan Soni — student & engineer.' } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="icon" href={import.meta.env.BASE_URL + '/favicon.svg'} />
    <script is:inline>
      // Set theme before paint to avoid flash.
      (function () {
        var s = localStorage.getItem('theme');
        var t = s || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        document.documentElement.dataset.theme = t;
      })();
    </script>
  </head>
  <body>
    <Nav />
    <main class="container"><slot /></main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 5: Add a favicon**

Create `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0b0d10"/><text x="16" y="22" font-family="monospace" font-size="18" fill="#4fd1c5" text-anchor="middle">d</text></svg>
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add base layout, nav, and footer"
```

---

### Task 5: Home page (hero + featured projects + latest posts)

**Files:**
- Modify/replace: `src/pages/index.astro`
- Create: `src/components/ProjectCard.astro`
- Create: `src/components/PostRow.astro`

**Interfaces:**
- Consumes: `Base.astro` (Task 4), `getCollection` from `astro:content` (Task 2), `withBase`.
- Produces: `ProjectCard.astro` (props: `project` = a projects collection entry) and `PostRow.astro` (props: `post` = a blog collection entry). Consumed by Tasks 6 and 7 too.

- [ ] **Step 1: Write `src/components/ProjectCard.astro`**

```astro
---
import { withBase } from '../lib/links';
const { project } = Astro.props;
const { title, description, tags } = project.data;
---
<a class="card rise" href={withBase(`/projects/${project.id}`)}>
  <h3>{title}</h3>
  <p>{description}</p>
  <ul class="tags mono">{tags.map((t) => <li>{t}</li>)}</ul>
</a>

<style>
  .card { display: block; background: var(--bg-elev); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem; color: var(--text); transition: transform 0.2s ease, border-color 0.2s ease; }
  .card:hover { transform: translateY(-3px); border-color: var(--accent); text-decoration: none; }
  .card h3 { margin: 0 0 0.4rem; }
  .card p { margin: 0 0 0.9rem; color: var(--text-dim); font-size: 0.95rem; }
  .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; list-style: none; margin: 0; padding: 0; }
  .tags li { font-size: 0.72rem; color: var(--accent); border: 1px solid var(--border); border-radius: 0.4rem; padding: 0.1rem 0.45rem; }
</style>
```

- [ ] **Step 2: Write `src/components/PostRow.astro`**

```astro
---
import { withBase } from '../lib/links';
const { post } = Astro.props;
const { title, description, date } = post.data;
const dateStr = date.toISOString().slice(0, 10);
---
<a class="row" href={withBase(`/blog/${post.id}`)}>
  <time class="mono" datetime={dateStr}>{dateStr}</time>
  <span class="row-body">
    <strong>{title}</strong>
    <em>{description}</em>
  </span>
</a>

<style>
  .row { display: flex; gap: 1.25rem; padding: 1rem 0; border-bottom: 1px solid var(--border); color: var(--text); align-items: baseline; }
  .row:hover { text-decoration: none; }
  .row:hover strong { color: var(--accent); }
  .row time { color: var(--text-dim); font-size: 0.8rem; white-space: nowrap; }
  .row-body { display: flex; flex-direction: column; gap: 0.15rem; }
  .row-body em { color: var(--text-dim); font-style: normal; font-size: 0.9rem; }
  @media (max-width: 540px) { .row { flex-direction: column; gap: 0.25rem; } }
</style>
```

- [ ] **Step 3: Write `src/pages/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import ProjectCard from '../components/ProjectCard.astro';
import PostRow from '../components/PostRow.astro';
import { withBase, links } from '../lib/links';

const projects = (await getCollection('projects')).sort((a, b) => +b.data.date - +a.data.date);
const featured = projects.filter((p) => p.data.featured).slice(0, 3);
const featuredList = featured.length ? featured : projects.slice(0, 3);

const posts = (await getCollection('blog'))
  .filter((p) => !p.data.draft)
  .sort((a, b) => +b.data.date - +a.data.date)
  .slice(0, 4);
---
<Base title="Dhyan Soni">
  <section class="hero rise">
    <p class="mono kicker">student &amp; engineer</p>
    <h1>I build things and write about how they work.</h1>
    <p class="lede">
      I'm Dhyan Soni — a student and software &amp; robotics engineer. I like
      turning hard problems into things people can actually use. Here are my
      projects and a blog about what I'm learning along the way. <!-- EDIT -->
    </p>
    <div class="cta mono">
      <a href={withBase('/projects')}>→ projects</a>
      <a href={withBase('/blog')}>→ blog</a>
      <a href={links.github}>→ github</a>
    </div>
  </section>

  <section>
    <h2 class="mono section-title">// featured projects</h2>
    <div class="grid">
      {featuredList.map((project) => <ProjectCard project={project} />)}
    </div>
  </section>

  <section>
    <h2 class="mono section-title">// latest writing</h2>
    {posts.map((post) => <PostRow post={post} />)}
  </section>
</Base>

<style>
  .hero { padding: 4rem 0 3rem; }
  .kicker { color: var(--accent); margin: 0 0 0.75rem; letter-spacing: 0.05em; }
  .hero h1 { font-size: clamp(2rem, 5vw, 3.25rem); line-height: 1.1; margin: 0 0 1.25rem; max-width: 20ch; }
  .lede { color: var(--text-dim); max-width: 55ch; font-size: 1.05rem; }
  .cta { display: flex; gap: 1.5rem; margin-top: 1.75rem; flex-wrap: wrap; }
  .section-title { color: var(--text-dim); font-weight: 500; margin: 3rem 0 1.25rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: 1rem; }
</style>
```

- [ ] **Step 4: Verify build and render**

Run: `npm run build && npm run preview`
Expected: build succeeds; open the previewed URL (note it is served under `/website/`) and confirm the hero, empty-but-valid featured grid, and latest-writing section render. Toggle theme and confirm it switches and persists on reload.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: build home page with hero, featured projects, latest posts"
```

---

### Task 6: Projects list and detail pages

**Files:**
- Create: `src/pages/projects/index.astro`
- Create: `src/pages/projects/[...slug].astro`

**Interfaces:**
- Consumes: `getCollection`, `getEntry`/`render` from `astro:content`, `ProjectCard` (Task 5), `Base`, `withBase`.
- Produces: routes `/projects` and `/projects/<id>`.

- [ ] **Step 1: Write `src/pages/projects/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import ProjectCard from '../../components/ProjectCard.astro';

const projects = (await getCollection('projects')).sort((a, b) => +b.data.date - +a.data.date);
---
<Base title="Projects — Dhyan Soni">
  <h1 class="page-title">Projects</h1>
  <p class="page-sub">Things I've designed, built, and shipped.</p>
  {projects.length === 0 && <p class="mono empty">// no projects yet — run `npm run new:project`</p>}
  <div class="grid">
    {projects.map((project) => <ProjectCard project={project} />)}
  </div>
</Base>

<style>
  .page-title { margin: 3rem 0 0.5rem; font-size: clamp(1.8rem, 4vw, 2.5rem); }
  .page-sub { color: var(--text-dim); margin: 0 0 2rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: 1rem; }
  .empty { color: var(--text-dim); }
</style>
```

- [ ] **Step 2: Write `src/pages/projects/[...slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import Base from '../../layouts/Base.astro';

export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map((project) => ({ params: { slug: project.id }, props: { project } }));
}

const { project } = Astro.props;
const { Content } = await render(project);
const { title, description, date, tags, repo, demo } = project.data;
const dateStr = date.toISOString().slice(0, 10);
---
<Base title={`${title} — Dhyan Soni`} description={description}>
  <article class="prose">
    <p class="mono meta">{dateStr}</p>
    <h1>{title}</h1>
    <p class="lede">{description}</p>
    <ul class="tags mono">{tags.map((t) => <li>{t}</li>)}</ul>
    <div class="ext mono">
      {repo && <a href={repo}>↗ source</a>}
      {demo && <a href={demo}>↗ live demo</a>}
    </div>
    <hr />
    <Content />
  </article>
</Base>

<style>
  .prose { max-width: 44rem; margin: 3rem auto; }
  .prose .meta { color: var(--text-dim); margin: 0 0 0.5rem; }
  .prose h1 { margin: 0 0 0.5rem; font-size: clamp(1.8rem, 4vw, 2.6rem); }
  .prose .lede { color: var(--text-dim); font-size: 1.1rem; }
  .tags { display: flex; gap: 0.4rem; flex-wrap: wrap; list-style: none; padding: 0; margin: 1rem 0; }
  .tags li { font-size: 0.72rem; color: var(--accent); border: 1px solid var(--border); border-radius: 0.4rem; padding: 0.1rem 0.45rem; }
  .ext { display: flex; gap: 1.25rem; }
  hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
  .prose :global(h2) { margin-top: 2rem; }
  .prose :global(pre) { background: var(--bg-elev); border: 1px solid var(--border); padding: 1rem; border-radius: 0.6rem; overflow-x: auto; }
  .prose :global(code) { font-family: var(--font-mono); font-size: 0.9em; }
  .prose :global(img) { max-width: 100%; border-radius: 0.6rem; }
</style>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds (routes generate; detail pages produced once Task 10 adds content — for now the list renders the empty-state message).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add projects list and detail pages"
```

---

### Task 7: Blog list and detail pages

**Files:**
- Create: `src/pages/blog/index.astro`
- Create: `src/pages/blog/[...slug].astro`
- Create: `src/lib/reading-time.ts`

**Interfaces:**
- Consumes: `getCollection`, `render`, `PostRow` (Task 5), `Base`.
- Produces: routes `/blog`, `/blog/<id>`; `readingTime(text: string): string` returning e.g. `"4 min read"`.

- [ ] **Step 1: Write `src/lib/reading-time.ts`**

```ts
/** Estimate reading time from raw markdown body at ~200 wpm. */
export function readingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}
```

- [ ] **Step 2: Write `src/pages/blog/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
import PostRow from '../../components/PostRow.astro';

const isProd = import.meta.env.PROD;
const posts = (await getCollection('blog'))
  .filter((p) => !(isProd && p.data.draft))
  .sort((a, b) => +b.data.date - +a.data.date);
---
<Base title="Blog — Dhyan Soni">
  <h1 class="page-title">Blog</h1>
  <p class="page-sub">Experiences, notes, and thinking out loud.</p>
  {posts.length === 0 && <p class="mono empty">// no posts yet — run `npm run new:post`</p>}
  {posts.map((post) => <PostRow post={post} />)}
</Base>

<style>
  .page-title { margin: 3rem 0 0.5rem; font-size: clamp(1.8rem, 4vw, 2.5rem); }
  .page-sub { color: var(--text-dim); margin: 0 0 2rem; }
  .empty { color: var(--text-dim); }
</style>
```

- [ ] **Step 3: Write `src/pages/blog/[...slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import Base from '../../layouts/Base.astro';
import { readingTime } from '../../lib/reading-time';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

const { post } = Astro.props;
const { Content } = await render(post);
const { title, description, date, tags, body } = { ...post.data, body: post.body };
const dateStr = date.toISOString().slice(0, 10);
const rt = readingTime(body ?? '');
---
<Base title={`${title} — Dhyan Soni`} description={description}>
  <article class="prose">
    <p class="mono meta">{dateStr} · {rt}</p>
    <h1>{title}</h1>
    <ul class="tags mono">{tags.map((t) => <li>{t}</li>)}</ul>
    <hr />
    <Content />
  </article>
</Base>

<style>
  .prose { max-width: 42rem; margin: 3rem auto; }
  .prose .meta { color: var(--text-dim); margin: 0 0 0.5rem; }
  .prose h1 { margin: 0 0 0.75rem; font-size: clamp(1.8rem, 4vw, 2.6rem); line-height: 1.15; }
  .tags { display: flex; gap: 0.4rem; flex-wrap: wrap; list-style: none; padding: 0; margin: 0 0 1rem; }
  .tags li { font-size: 0.72rem; color: var(--accent); border: 1px solid var(--border); border-radius: 0.4rem; padding: 0.1rem 0.45rem; }
  hr { border: none; border-top: 1px solid var(--border); margin: 1.5rem 0 2rem; }
  .prose :global(p) { font-size: 1.05rem; }
  .prose :global(h2) { margin-top: 2.2rem; }
  .prose :global(pre) { background: var(--bg-elev); border: 1px solid var(--border); padding: 1rem; border-radius: 0.6rem; overflow-x: auto; }
  .prose :global(code) { font-family: var(--font-mono); font-size: 0.9em; }
  .prose :global(blockquote) { border-left: 3px solid var(--accent); margin: 1.5rem 0; padding-left: 1rem; color: var(--text-dim); }
  .prose :global(img) { max-width: 100%; border-radius: 0.6rem; }
</style>
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add blog list and detail pages with reading time"
```

---

### Task 8: About / Resume page

**Files:**
- Create: `src/pages/about.astro`
- Create: `public/resume.pdf` (placeholder file)

**Interfaces:**
- Consumes: `Base`, `links`, `withBase`.
- Produces: route `/about`.

- [ ] **Step 1: Add a placeholder resume file**

```bash
printf '%%PDF-1.4\n%% Placeholder resume — replace public/resume.pdf with your real PDF.\n' > public/resume.pdf
```

- [ ] **Step 2: Write `src/pages/about.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import { links, withBase } from '../lib/links';

// <!-- EDIT everything in these arrays with your real details. -->
const skills = ['TypeScript', 'Python', 'Java', 'React', 'Astro', 'Robotics / WPILib'];
const experience = [
  { when: '2025 — present', what: 'Placeholder role or project', where: 'Placeholder org' },
  { when: '2024', what: 'Placeholder experience', where: 'Placeholder org' },
];
---
<Base title="About — Dhyan Soni">
  <section class="about">
    <h1>About</h1>
    <p class="lede">
      I'm Dhyan Soni, a student and software &amp; robotics engineer. I care about
      building things that are fast, thoughtful, and actually useful. <!-- EDIT -->
    </p>

    <h2 class="mono section-title">// skills</h2>
    <ul class="skills mono">{skills.map((s) => <li>{s}</li>)}</ul>

    <h2 class="mono section-title">// experience</h2>
    <ul class="timeline">
      {experience.map((e) => (
        <li>
          <span class="mono when">{e.when}</span>
          <span class="what"><strong>{e.what}</strong><em>{e.where}</em></span>
        </li>
      ))}
    </ul>

    <h2 class="mono section-title">// elsewhere</h2>
    <div class="ext mono">
      <a href={links.github}>GitHub</a>
      <a href={links.linkedin}>LinkedIn</a>
      <a href={links.devpost}>Devpost</a>
      <a href={links.email}>Email</a>
      <a href={withBase('/resume.pdf')}>↓ Resume (PDF)</a>
    </div>
  </section>
</Base>

<style>
  .about { max-width: 44rem; margin: 3rem auto; }
  .about h1 { font-size: clamp(1.8rem, 4vw, 2.6rem); margin: 0 0 1rem; }
  .lede { color: var(--text-dim); font-size: 1.1rem; }
  .section-title { color: var(--text-dim); font-weight: 500; margin: 2.5rem 0 1rem; }
  .skills { display: flex; flex-wrap: wrap; gap: 0.5rem; list-style: none; padding: 0; margin: 0; }
  .skills li { border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.3rem 0.7rem; font-size: 0.85rem; color: var(--accent); }
  .timeline { list-style: none; padding: 0; margin: 0; }
  .timeline li { display: flex; gap: 1.25rem; padding: 0.9rem 0; border-bottom: 1px solid var(--border); }
  .timeline .when { color: var(--text-dim); font-size: 0.8rem; white-space: nowrap; min-width: 8rem; }
  .timeline .what { display: flex; flex-direction: column; }
  .timeline .what em { color: var(--text-dim); font-style: normal; font-size: 0.9rem; }
  .ext { display: flex; gap: 1.25rem; flex-wrap: wrap; }
  @media (max-width: 540px) { .timeline li { flex-direction: column; gap: 0.2rem; } .timeline .when { min-width: 0; } }
</style>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: build succeeds; `/about` and `/resume.pdf` are present in `dist/`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add about/resume page"
```

---

### Task 9: Entry scaffolder script

**Files:**
- Create: `scripts/new-entry.mjs`

**Interfaces:**
- Consumes: nothing (standalone Node script). Referenced by `package.json` scripts `new:post`/`new:project` (Task 1).
- Produces: a markdown file with correct frontmatter in the right collection folder.

- [ ] **Step 1: Write `scripts/new-entry.mjs`**

```js
#!/usr/bin/env node
import { mkdir, writeFile, access } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout, argv, exit } from 'node:process';

const kind = argv[2]; // 'blog' | 'project'
if (kind !== 'blog' && kind !== 'project') {
  console.error('Usage: node scripts/new-entry.mjs <blog|project>');
  exit(1);
}

const rl = createInterface({ input: stdin, output: stdout });
const title = (await rl.question('Title: ')).trim();
const description = (await rl.question('Short description: ')).trim();
rl.close();

if (!title) { console.error('A title is required.'); exit(1); }

const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const today = new Date().toISOString().slice(0, 10);
const dir = kind === 'blog' ? 'src/content/blog' : 'src/content/projects';
const file = `${dir}/${slug}.md`;

try { await access(file); console.error(`Already exists: ${file}`); exit(1); } catch {}

const frontmatter = kind === 'blog'
  ? `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
date: ${today}
tags: []
draft: true
---

Write your post here.
`
  : `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
date: ${today}
tags: []
repo: ""
demo: ""
featured: false
---

## Overview

Describe the project here.
`;

await mkdir(dir, { recursive: true });
await writeFile(file, frontmatter, 'utf8');
console.log(`Created ${file}`);
console.log(kind === 'blog'
  ? 'Set draft: false when ready to publish.'
  : 'Remove empty repo/demo fields if unused, or fill them in.');
```

- [ ] **Step 2: Test the blog scaffolder end-to-end**

Run:

```bash
printf 'Scaffolder Smoke Test\nA temporary post\n' | npm run new:post
```

Expected: prints `Created src/content/blog/scaffolder-smoke-test.md`. Confirm the file exists with valid frontmatter and `draft: true`.

- [ ] **Step 3: Test the project scaffolder**

Run:

```bash
printf 'Scaffolder Smoke Project\nA temporary project\n' | npm run new:project
```

Expected: prints `Created src/content/projects/scaffolder-smoke-project.md`.

- [ ] **Step 4: Verify build still succeeds with the generated files, then remove the smoke-test files**

```bash
npm run build
rm src/content/blog/scaffolder-smoke-test.md src/content/projects/scaffolder-smoke-project.md
```

Expected: build succeeds (note: the blog smoke file is `draft: true`, so in a production build it is excluded — that is correct).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add new-entry scaffolder script"
```

---

### Task 10: Seed example content

**Files:**
- Create: `src/content/projects/example-project.md`
- Create: `src/content/blog/hello-world.md`

**Interfaces:**
- Consumes: schemas from Task 2. Produces real entries that render detail pages and populate the home page.

- [ ] **Step 1: Write `src/content/projects/example-project.md`**

```markdown
---
title: "Example Project"
description: "A real, editable example so you can see how a project entry looks — replace or delete it."
date: 2026-07-03
tags: ["Astro", "TypeScript", "Web"]
repo: "https://github.com/dhyantsoni/website"
demo: "https://dhyantsoni.com"
featured: true
---

## Overview

This is an example project entry. It exists to show the layout and give you a
working template. Duplicate it (or run `npm run new:project`) to add your own.

## What it does

- Explain the problem it solves.
- Describe the interesting technical parts.
- Link to the source and a live demo above.

## Notes

Write freely here in Markdown — headings, code blocks, images, and lists all work.

\`\`\`ts
export function hello(name: string) {
  return `Hi, ${name}`;
}
\`\`\`
```

- [ ] **Step 2: Write `src/content/blog/hello-world.md`**

```markdown
---
title: "Hello, world"
description: "The first post — what this blog is and what I'll write about here."
date: 2026-07-03
tags: ["meta"]
draft: false
---

Welcome to my blog. This is an example post you can edit or delete.

I'll use this space to write about projects I'm building, things I'm learning,
and experiences worth sharing. Posts are just Markdown files — I run
`npm run new:post`, write, and push.

> Replace this post with your own first entry whenever you're ready.
```

- [ ] **Step 3: Verify build and render**

Run: `npm run build && npm run preview`
Expected: build succeeds; home page now shows the example project in "featured" and "Hello, world" under latest writing; `/projects/example-project` and `/blog/hello-world` render correctly in both themes.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "content: add example project and first blog post"
```

---

### Task 11: GitHub Actions deploy to GitHub Pages + README

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes: the buildable project. Produces: automated deploy on push to `master`.

- [ ] **Step 1: Write `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Rewrite `README.md`**

````markdown
# Personal Website

Dhyan Soni's personal site — projects, blog, and resume. Built with
[Astro](https://astro.build) and deployed to GitHub Pages.

Live: https://dhyantsoni.com

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
featured: false                               # true = show on home page
```

## Deploy

Push to `master`. The GitHub Actions workflow builds and deploys automatically.

One-time GitHub setup: repo **Settings → Pages → Build and deployment → Source
= GitHub Actions**.

## Personalize

Edit files marked with `<!-- EDIT -->` or `PLACEHOLDER`:
- `src/lib/links.ts` — email, LinkedIn, Devpost URLs
- `src/pages/about.astro` — bio, skills, experience
- `src/pages/index.astro` — hero copy
- `public/resume.pdf` — your real resume

## Custom domain (later)

1. Set `site` to your domain and `base` to `'/'` in `astro.config.mjs`.
2. Add `public/CNAME` containing the domain.
3. Configure the domain in repo Settings → Pages.
````

- [ ] **Step 3: Verify build once more**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit and push**

```bash
git add -A
git commit -m "ci: add GitHub Pages deploy workflow and docs"
git push origin master
```

- [ ] **Step 5: Enable Pages in the repo (manual, one-time)**

In GitHub: **Settings → Pages → Source → GitHub Actions**. Then confirm the
Actions run succeeds and the site is live at
`https://dhyantsoni.com`.

---

### Task 12: Final verification pass

**Files:** none (verification only).

- [ ] **Step 1: Clean build from scratch**

```bash
rm -rf dist node_modules
npm ci
npm run build
```

Expected: clean install and build succeed with no errors.

- [ ] **Step 2: Verify all routes exist in `dist/`**

```bash
ls dist dist/projects dist/blog dist/projects/example-project dist/blog/hello-world
test -f dist/resume.pdf && test -f dist/index.html && echo OK
```

Expected: all listed paths exist; prints `OK`.

- [ ] **Step 3: Grep for accidental Nixo references**

```bash
! grep -ri "nixo" src public README.md astro.config.mjs && echo "clean"
```

Expected: prints `clean` (no matches).

- [ ] **Step 4: Manual theme + responsive check**

Run `npm run preview`, open the site, and confirm: nav works on all pages,
dark/light toggle persists across reloads, layout holds at mobile width, and
reduced-motion is respected (no animation when the OS setting is on).

- [ ] **Step 5: Final commit if any fixes were made**

```bash
git add -A
git commit -m "chore: final verification fixes" || echo "nothing to commit"
```

---

## Self-Review Notes

- **Spec coverage:** Astro+Pages (T1, T11), collections/schemas (T2), design system/dark-first/fonts/motion (T3), layout/nav/footer/links GitHub·Email·LinkedIn·Devpost (T4), home (T5), projects list+detail (T6), blog list+detail+reading time (T7), about+resume PDF (T8), scaffolder new:post/new:project (T9), seed example content (T10), base-path aware links for custom-domain path (T1/T4/T11), no-Nixo enforced (T12 grep). All spec sections mapped.
- **Placeholders:** Content placeholders are intentional and clearly marked (`<!-- EDIT -->`, `PLACEHOLDER`); no plan-step placeholders.
- **Type consistency:** `withBase` (lib/links.ts) used consistently; `links` object keys github/email/linkedin/devpost consistent across Nav, Footer, index, about; collection ids used via `project.id`/`post.id` consistently in cards and `getStaticPaths`.
