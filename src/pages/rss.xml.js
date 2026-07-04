import rss from '@astrojs/rss';
import { getPublishedPosts } from '../lib/content';
import { withBase } from '../lib/links';

export async function GET(context) {
  const posts = await getPublishedPosts();
  return rss({
    title: 'Dhyan Soni — Blog',
    description: 'Experiences, notes, and thinking out loud.',
    // context.site is the `site` from astro.config.mjs (origin, no base path);
    // withBase() adds the base path so each link resolves correctly.
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: withBase(`/blog/${post.id}/`),
      categories: post.data.tags,
    })),
  });
}
