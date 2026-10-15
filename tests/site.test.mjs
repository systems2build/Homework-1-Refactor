import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const css = readFileSync(join(root, 'assets/css/style.css'), 'utf8');

test('document structure and page metadata are present', () => {
  assert.match(html, /<!doctype html>/i);
  assert.match(html, /<html lang="en">/);
  assert.match(html, /<title>[^<]+<\/title>/);
  assert.match(html, /<meta name="viewport"/);
  for (const tag of ['header', 'nav', 'main', 'aside', 'footer']) {
    assert.match(html, new RegExp('<' + tag + '\\b'));
    assert.match(html, new RegExp('</' + tag + '>'));
  }
  assert.equal((html.match(/<h1\b/g) || []).length, 1, 'one H1 is required');
  assert.equal((html.match(/<section\b/g) || []).length, (html.match(/<\/section>/g) || []).length);
});

test('all images have alt attributes and referenced assets exist', () => {
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map(match => match[0]);
  assert.ok(imgs.length >= 6);
  for (const img of imgs) {
    assert.match(img, /\balt="[^"]*"/, 'missing image alt: ' + img);
    const src = img.match(/\bsrc="([^"]+)"/)?.[1];
    assert.ok(src && existsSync(join(root, src)), 'missing image source: ' + src);
  }
});

test('fragment navigation targets exist', () => {
  for (const [, target] of html.matchAll(/\bhref="#([^"]+)"/g)) {
    assert.ok(html.includes('id="' + target + '"'), 'missing anchor target: ' + target);
  }
  assert.match(html, /class="skip-link" href="#main-content"/);
});

test('focus, responsive layout, and motion settings are defined', () => {
  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(max-width: 640px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});

test('oversized original JPEGs do not remain in the working tree', () => {
  const remaining = readdirSync(join(root, 'assets/images')).filter(name => /\.jpe?g$/i.test(name));
  assert.deepEqual(remaining, []);
});
