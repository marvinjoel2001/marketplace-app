const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const ts = require('typescript');

// Exercise the same TypeScript function used by the directory, without loading
// Next.js or requiring a browser/test-framework dependency.
const source = readFileSync(resolve(__dirname, '../src/lib/liveFreshness.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const exportsObject = {};
runInNewContext(compiled, { exports: exportsObject });
const { liveFreshness } = exportsObject;
const now = Date.parse('2026-10-26T18:00:00Z');
const liveAtAge = (age) => ({ verified_at: new Date(now - age).toISOString() });

test('keeps a room fresh for 60 seconds, then labels it refreshing', () => {
  assert.equal(liveFreshness(liveAtAge(59999), now), 'fresh');
  assert.equal(liveFreshness(liveAtAge(60000), now), 'refreshing');
});

test('expires the original verification at five minutes, even after failed refreshes', () => {
  const live = liveAtAge(61000);
  const original = live.verified_at;
  assert.equal(liveFreshness(live, now), 'refreshing');
  assert.equal(liveFreshness(live, now + 238999), 'refreshing');
  assert.equal(liveFreshness(live, now + 239000), 'expired');
  assert.equal(live.verified_at, original);
});

test('rejects invalid or future verification timestamps', () => {
  assert.equal(liveFreshness({ verified_at: 'invalid' }, now), 'expired');
  assert.equal(liveFreshness(liveAtAge(-1), now), 'expired');
});

test('uses the backend freshness and retention limits', () => {
  assert.equal(liveFreshness(liveAtAge(15000), now, 10, 20), 'refreshing');
  assert.equal(liveFreshness(liveAtAge(20000), now, 10, 20), 'expired');
});
