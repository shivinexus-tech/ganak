#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('src/telemetry/privacy-events.ts','utf8');
assert(src.includes('analyticsConsentGranted()'),'telemetry must require explicit stored analytics consent');
for(const event of ['page_view','muhurat_search','muhurat_share','muhurat_export','feedback_sent']) assert(src.includes(event),`event dictionary missing ${event}`);
for(const forbidden of ['email','city','lat','lon','query','birth','userId','localStorage','sessionStorage','document.cookie']) assert(!src.includes(forbidden),`telemetry contains forbidden field/storage token ${forbidden}`);
assert(src.includes('credentials: "omit"'),'telemetry must omit credentials');
assert(src.includes('VITE_ANALYTICS_ENDPOINT'),'analytics must remain explicitly configured');
for (const ev of ['hora_ask', 'hora_ask_outcome', 'hora_verdict_shown']) {
  assert(src.includes(`"${ev}"`), `hora telemetry: ${ev} missing from the fixed dictionary`);
}
assert(!/hora_(ask|verdict)[^\n]*question/.test(src), 'hora telemetry: question text must never be a property');
const feedback=fs.readFileSync('src/components/FeedbackCard.tsx','utf8');
assert(feedback.includes('VITE_FEEDBACK_ENDPOINT'),'feedback endpoint must be configured');
assert(feedback.includes('service is not connected yet'),'missing visible disconnected state');
console.log('✓ privacy-events PASSED (fixed anonymous dictionary, no PII fields/storage/cookies, visible feedback failure)');
