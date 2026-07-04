import { defineConfig } from 'astro/config';

// GitHub Pages: a project site is served at /<repo>. For a custom domain later,
// set `site` to the domain and `base` to '/'.
export default defineConfig({
  site: 'https://dhyantsoni.github.io',
  base: '/website',
});
