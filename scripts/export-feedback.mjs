#!/usr/bin/env node
// Owner review: dump the Supabase `feedback` table to a JSONL file.
// Env: SUPABASE_URL, SUPABASE_SERVICE_KEY (from .dev.vars or shell). Never commit keys.
import { mkdirSync, writeFileSync } from 'node:fs';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY (see supabase/README.md).');
  process.exit(1);
}
const res = await fetch(`${url}/rest/v1/feedback?select=*&order=created_at.desc`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});
if (!res.ok) {
  console.error('fetch failed', res.status, await res.text());
  process.exit(1);
}
const rows = await res.json();
mkdirSync('feedback', { recursive: true });
writeFileSync('feedback/aarti-corrections.jsonl', rows.map((r) => JSON.stringify(r)).join('\n') + (rows.length ? '\n' : ''));
console.log(`exported ${rows.length} feedback rows -> feedback/aarti-corrections.jsonl`);
