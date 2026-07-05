export const links = {
  github: 'https://github.com/dhyantsoni',
  email: 'mailto:dhyantsoni@gmail.com',
};

/** Prefix a site-absolute path with the configured base path. */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return base + (path.startsWith('/') ? path : '/' + path);
}
