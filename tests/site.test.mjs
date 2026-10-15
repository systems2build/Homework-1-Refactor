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

function contrastRatio(a, b) {
  const luminance = (hex) => {
    const values = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16) / 255);
    const linear = values.map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  };
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

test('white hero text and focus outlines meet minimum contrast ratios', () => {
  const heroRule = css.match(/\.hero\s*\{[^}]+\}/s)?.[0];
  assert.ok(heroRule, 'missing hero rule');
  const stops = [...heroRule.matchAll(/#[0-9a-f]{6}/gi)].map(match => match[0]);
  assert.equal(stops.length, 3, 'expected three hero gradient color stops');
  for (const stop of stops) {
    assert.ok(contrastRatio(stop, '#ffffff') >= 4.5, 'insufficient white-text contrast at ' + stop);
  }
  const lightFocus = css.match(/:focus-visible\s*\{[^}]*outline:\s*3px solid (#[0-9a-f]{6})/i)?.[1];
  assert.ok(lightFocus && contrastRatio(lightFocus, '#ffffff') >= 3, 'focus outline needs >=3:1 on white');
  assert.match(css, /\.site-header :focus-visible,\s*\.hero :focus-visible\s*\{\s*outline-color:\s*#ffffff/);
  assert.ok(contrastRatio('#ffffff', '#092d45') >= 3, 'header focus outline needs >=3:1');
});
