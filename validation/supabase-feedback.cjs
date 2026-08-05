#!/usr/bin/env node
'use strict';
const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');
const { buildFeedbackRow } = loadApp('functions/api/feedback.ts');

// valid
let r = buildFeedbackRow({ kind: 'aarti_correction', slug: 'jai-ambe-gauri', lang: 'bn', suggestion: 'सही शब्द यह है', route: '/aarti/jai-ambe-gauri' });
assert(r.ok, 'valid submission should pass');
assert.strictEqual(r.row.kind, 'aarti_correction');
assert.strictEqual(r.row.suggestion, 'सही शब्द यह है');
assert(!('hp' in r.row), 'honeypot field must not persist');

// honeypot filled => treated as spam (ok:false, spam:true), no row
r = buildFeedbackRow({ suggestion: 'buy cheap x here now', hp: 'http://spam' });
assert(!r.ok && r.spam, 'honeypot must flag spam');

// too short / too long
assert(!buildFeedbackRow({ suggestion: 'x' }).ok, 'too short rejected');
assert(!buildFeedbackRow({ suggestion: 'a'.repeat(2100) }).ok, 'too long rejected');

// unknown kind => coerced to general (not stored verbatim)
r = buildFeedbackRow({ suggestion: 'valid enough text', kind: 'weird' });
assert(r.ok && r.row.kind === 'general', 'unknown kind coerced to general');

// missing suggestion
assert(!buildFeedbackRow({ slug: 'x' }).ok, 'missing suggestion rejected');

// non-object body
assert(!buildFeedbackRow(null).ok, 'null body rejected');
assert(!buildFeedbackRow('nope').ok, 'string body rejected');

console.log('supabase-feedback: OK');
