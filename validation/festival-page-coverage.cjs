#!/usr/bin/env node
'use strict';

const assert = require('assert');
const { loadApp } = require('./_load-app.cjs');

const pages = loadApp('src/data/festival-pages.ts');
const screen = loadApp('src/screens/FestivalGuideScreen.tsx');
const meta = loadApp('src/data/festival-meta.ts');
const vidhis = loadApp('src/data/vrat-vidhis.ts');

const {
  FESTIVAL_PAGE_ENTRIES, FESTIVAL_PAGE_ROUTES, REQUIRED_PAGE_ENTRIES,
  DEFERRED_PAGE_ENTRIES, SHARED_PAGE_ENTRIES, EXCLUDED_PAGE_KEYS,
} = pages;

function coverageProblems(entries, routes) {
  const problems = [];
  const identities = new Set();
  for (const entry of entries) {
    const identity = `${entry.sourceKind}:${entry.key}`;
    if (identities.has(identity)) problems.push(`duplicate live identity ${identity}`);
    identities.add(identity);
    if (entry.status === 'required') {
      if (!entry.path) problems.push(`${identity} has no path`);
      else if (!routes[entry.path]) problems.push(`${identity} has no registered route`);
    }
  }
  for (const [routePath, entry] of Object.entries(routes)) {
    if (!entry || !identities.has(`${entry.sourceKind}:${entry.key}`)) {
      problems.push(`${routePath} points at a missing live key`);
    }
    if (entry && routePath !== `/festival/${entry.slug}`) {
      problems.push(`${routePath} does not match slug ${entry.slug}`);
    }
  }
  return problems;
}

const liveCount = Object.keys(meta.FEST_NAME).length + Object.keys(meta.OBS_NAME).length;
assert.strictEqual(FESTIVAL_PAGE_ENTRIES.length, liveCount, 'registry must contain every live openable label');
assert.strictEqual(liveCount, 166, 'update the reviewed inventory when the live label count changes');
assert.strictEqual(EXCLUDED_PAGE_KEYS.length, 10, 'the owner-approved excluded-family allowlist must remain explicit');
assert.strictEqual(REQUIRED_PAGE_ENTRIES.length, 156, '156 non-deferred labels must have dedicated routes');
assert.strictEqual(SHARED_PAGE_ENTRIES.length, 4, 'the four Chhath labels must share the existing Chhath page');
assert.strictEqual(DEFERRED_PAGE_ENTRIES.length, 6, 'only the six not-yet-structured Bengal Durga Puja labels may lack routes');

const existingStandalone = new Set(['hartalikaTeej', 'chaitraNavratri', 'sharadNavratri']);
const newPages = REQUIRED_PAGE_ENTRIES.filter((entry) => !existingStandalone.has(entry.key));
assert.strictEqual(newPages.length, 153, 'the registry must retain 148 generated pages plus 5 approved multi-day milestone pages');

const problems = coverageProblems(FESTIVAL_PAGE_ENTRIES, FESTIVAL_PAGE_ROUTES);
assert.deepStrictEqual(problems, [], `festival page coverage problems:\n${problems.join('\n')}`);

for (const entry of REQUIRED_PAGE_ENTRIES) {
  assert.strictEqual(FESTIVAL_PAGE_ROUTES[entry.path], entry, `${entry.key} route must point at its live registry entry`);
  const resolved = screen.festivalGuideFromPath(entry.path);
  assert(resolved, `${entry.path} must resolve through the screen`);
  assert.strictEqual(resolved.sourceKind, entry.sourceKind, `${entry.path} source kind must remain stable`);
  assert.strictEqual(resolved.key, entry.key, `${entry.path} live key must remain stable`);
  assert.strictEqual(resolved.slug, entry.slug, `${entry.path} slug must remain stable`);
  assert.strictEqual(resolved.vidhiKey, entry.vidhiKey, `${entry.path} vidhi mapping must remain stable`);
  const sourceMeta = entry.sourceKind === 'festival' ? meta.FEST_META[entry.metaKey] : meta.OBS_META[entry.metaKey];
  assert(sourceMeta, `${entry.sourceKind}:${entry.key} must have display metadata`);
  if (entry.vidhiKey) assert(vidhis.VRAT_VIDHI[entry.vidhiKey], `${entry.key} points at missing vidhi ${entry.vidhiKey}`);
}

for (const entry of SHARED_PAGE_ENTRIES) {
  assert.strictEqual(entry.path, '/festival/chhath', `${entry.key} must remain attached to the shared Chhath page`);
}
assert(screen.festivalGuideFromPath('/festival/chhath'), 'the shared Chhath page must remain live');

for (const entry of DEFERRED_PAGE_ENTRIES) {
  assert.strictEqual(entry.path, null, `${entry.key} must stay explicitly deferred until its page structure is researched`);
}

const injectedMissing = Object.freeze({
  sourceKind: 'festival', key: '__coverage_guard__', status: 'required',
  slug: 'coverage-guard', path: '/festival/coverage-guard',
});
assert(
  coverageProblems([...FESTIVAL_PAGE_ENTRIES, injectedMissing], FESTIVAL_PAGE_ROUTES)
    .some((problem) => problem.includes('__coverage_guard__') && problem.includes('no registered route')),
  'coverage guard must prove that a newly added label without a route fails',
);

console.log(`PASS  ${liveCount} live openable labels inventoried`);
console.log(`PASS  ${REQUIRED_PAGE_ENTRIES.length} required labels covered (${newPages.length} generated/milestone pages + 3 existing)`);
console.log(`PASS  ${SHARED_PAGE_ENTRIES.length} Chhath labels use the existing shared page`);
console.log(`PASS  ${DEFERRED_PAGE_ENTRIES.length} multi-day labels are explicitly deferred`);
console.log(`PASS  ${Object.keys(FESTIVAL_PAGE_ROUTES).length} unique direct routes are valid`);
console.log('PASS  guard simulation rejects a new label without a route');
console.log('\nFESTIVAL PAGE COVERAGE PASSED');
