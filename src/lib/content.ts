import { getCollection } from 'astro:content';

/** Blog posts, newest first, with drafts excluded in production builds. */
export async function getPublishedPosts() {
  const isProd = import.meta.env.PROD;
  return (await getCollection('blog'))
    .filter((p) => !(isProd && p.data.draft))
    .sort((a, b) => +b.data.date - +a.data.date);
}

/** All projects, newest first. */
export async function getProjectsSorted() {
  return (await getCollection('projects')).sort((a, b) => +b.data.date - +a.data.date);
}
