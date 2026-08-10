#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const { loadApp } = require('./_load-app.cjs');
const src=fs.readFileSync('src/telemetry/privacy-events.ts','utf8');
assert(src.includes('analyticsConsentGranted()'),'telemetry must require explicit stored analytics consent');
for(const event of ['page_view','muhurat_search','muhurat_share','muhurat_export','feedback_sent']) assert(src.includes(event),`event dictionary missing ${event}`);
for(const forbidden of ['email','city','lat','lon','query','birth','userId','localStorage','sessionStorage','document.cookie']) assert(!src.includes(forbidden),`telemetry contains forbidden field/storage token ${forbidden}`);
assert(src.includes('credentials: "omit"'),'telemetry must omit credentials');
assert(src.includes('VITE_ANALYTICS_ENDPOINT'),'analytics must remain explicitly configured');

// Hora telemetry assertions load the REAL exported dictionary (via esbuild, same
// idiom as the other gates) rather than grepping source text. This survives
// reformatting and cannot be fooled by an ALLOWED-set entry with no matching
// dictionary entry, and it pins the exact property allow-list per event so a
// stray property can't sneak past a "name appears somewhere in the file" check.
const { ANALYTICS_EVENT_DICTIONARY } = loadApp('src/telemetry/privacy-events.ts');
assert(ANALYTICS_EVENT_DICTIONARY && typeof ANALYTICS_EVENT_DICTIONARY === 'object', 'ANALYTICS_EVENT_DICTIONARY must be exported from src/telemetry/privacy-events.ts');

const HORA_EVENT_PROPS = {
  hora_ask: ['action', 'language'],
  hora_ask_outcome: ['outcome', 'language'],
  hora_verdict_shown: ['outcome', 'language'],
};
const ALLOWED_HORA_PROP_NAMES = new Set(['action', 'language', 'outcome']);

for (const [ev, expected] of Object.entries(HORA_EVENT_PROPS)) {
  const actual = ANALYTICS_EVENT_DICTIONARY[ev];
  assert(Array.isArray(actual), `hora telemetry: ${ev} missing from ANALYTICS_EVENT_DICTIONARY (not merely absent from the whole file — checked the dictionary specifically)`);
  const actualSorted = [...actual].sort();
  const expectedSorted = [...expected].sort();
  assert.deepEqual(actualSorted, expectedSorted, `hora telemetry: ${ev} property list must be exactly ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  for (const prop of actual) {
    assert(ALLOWED_HORA_PROP_NAMES.has(prop), `hora telemetry: ${ev} carries disallowed property "${prop}" (only action/language/outcome are permitted on hora events)`);
  }
}

const feedback=fs.readFileSync('src/components/FeedbackCard.tsx','utf8');
assert(feedback.includes('VITE_FEEDBACK_ENDPOINT'),'feedback endpoint must be configured');
assert(feedback.includes('service is not connected yet'),'missing visible disconnected state');
console.log('✓ privacy-events PASSED (fixed anonymous dictionary, no PII fields/storage/cookies, visible feedback failure)');
