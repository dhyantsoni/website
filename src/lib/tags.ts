import type { CollectionEntry } from 'astro:content';
import { getPublishedPosts, getProjectsSorted } from './content';

/** URL-safe slug for a tag. Case- and punctuation-insensitive so "Web" and
 *  "web" collapse to the same tag page. */
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface TagGroup {
  slug: string;
  name: string; // display name (first occurrence wins)
  posts: CollectionEntry<'blog'>[];
  projects: CollectionEntry<'projects'>[];
}

/** Aggregate every tag across published posts and projects, grouped by slug,
 *  sorted by total usage (desc) then name. */
export async function getTagGroups(): Promise<TagGroup[]> {
  const posts = await getPublishedPosts();
  const projects = await getProjectsSorted();
  const map = new Map<string, TagGroup>();

  const ensure = (tag: string): TagGroup | null => {
    const slug = tagSlug(tag);
    if (!slug) return null;
    if (!map.has(slug)) map.set(slug, { slug, name: tag, posts: [], projects: [] });
    return map.get(slug)!;
  };

  for (const post of posts) for (const t of post.data.tags) ensure(t)?.posts.push(post);
  for (const project of projects) for (const t of project.data.tags) ensure(t)?.projects.push(project);

  return [...map.values()].sort(
    (a, b) =>
      b.posts.length + b.projects.length - (a.posts.length + a.projects.length) ||
      a.name.localeCompare(b.name),
  );
}

/** Total number of items (posts + projects) carrying a tag group. */
export function tagCount(g: TagGroup): number {
  return g.posts.length + g.projects.length;
}
