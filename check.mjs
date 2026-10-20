import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const readme = await readFile(resolve(root, 'README.md'), 'utf8');
assert(!/PUBLIC_(GAME|GUIDE)_URL|LOCAL DRAFT/.test(readme), 'Replace the example game and guide URLs.');
assert(!/<script\b|javascript:/i.test(readme), 'README must use ordinary Markdown links.');
let checked = 0;
for (const match of readme.matchAll(/!?\[[^\]]*\]\(([^\s)]+)\)/g)) {
  const href = match[1];
  if (/^https:\/\//.test(href)) {
    new URL(href);
    continue;
  }
  assert(!/^[a-z]+:/i.test(href), `Unsupported URL: ${href}`);
  const target = resolve(root, decodeURIComponent(href.split('#')[0]));
  assert(target.startsWith(root + sep), `Link leaves profile folder: ${href}`);
  assert((await stat(target)).isFile(), `Missing file: ${href}`);
  checked++;
}
assert(checked >= 2, 'Expected header and game preview.');
console.log(`Profile: ${checked} local targets verified. Public URL availability is checked after deployment.`);
