#!/usr/bin/env node
import { mkdir, writeFile, access } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { stdin, stdout, argv, exit } from 'node:process';

const kind = argv[2]; // 'blog' | 'project'
if (kind !== 'blog' && kind !== 'project') {
  console.error('Usage: node scripts/new-entry.mjs <blog|project>');
  exit(1);
}

const rl = createInterface({ input: stdin, output: stdout });

// Wrap readline.question so a pending prompt resolves to '' when the input
// stream closes (EOF) — this keeps piped/non-interactive input from hanging.
function ask(question) {
  return new Promise((resolve) => {
    const onClose = () => resolve('');
    rl.once('close', onClose);
    rl.question(question, (answer) => {
      rl.removeListener('close', onClose);
      resolve(answer);
    });
  });
}

const title = (await ask('Title: ')).trim();
const description = (await ask('Short description: ')).trim();
rl.close();

if (!title) {
  console.error('A title is required.');
  exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');
const today = new Date().toISOString().slice(0, 10);
const dir = kind === 'blog' ? 'src/content/blog' : 'src/content/projects';
const file = `${dir}/${slug}.md`;

try {
  await access(file);
  console.error(`Already exists: ${file}`);
  exit(1);
} catch {
  // file does not exist — good, continue.
}

const esc = (s) => s.replace(/"/g, '\\"');

const frontmatter =
  kind === 'blog'
    ? `---
title: "${esc(title)}"
description: "${esc(description)}"
date: ${today}
tags: []
draft: true
---

Write your post here.
`
    : `---
title: "${esc(title)}"
description: "${esc(description)}"
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
console.log(
  kind === 'blog'
    ? 'Set draft: false when ready to publish.'
    : 'Remove the empty repo/demo lines if unused, or fill them in.',
);
