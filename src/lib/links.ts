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
