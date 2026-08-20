#!/usr/bin/env node
'use strict';

const { loadApp } = require('./_load-app.cjs');
const { MUHURTA_RULES, muhuratScanRange } = loadApp('src/engine/muhurat.ts');
const { MUH_CATS, MUHURAT_GUIDANCE } = loadApp('src/data/muhurat-ui.ts');

const DELHI = { label: 'New Delhi', lat: 28.6139, lon: 77.2090, zone: 'Asia/Kolkata' };
const required = ['wedding', 'engagement', 'housewarming', 'bhoomi', 'construction', 'business', 'travel', 'document'];
let failures = 0;
const fail = (m) => { failures++; console.error('FAIL ' + m); };
const asList = (set) => [...(set || [])].sort((a, b) => a - b).join(',');
const exact = (set, values, label) => {
  const got = asList(set), want = [...values].sort((a, b) => a - b).join(',');
  if (got !== want) fail(`${label}: ${got} != ${want}`);
};
const one = (cat, m, d) => muhuratScanRange(DELHI, 'lahiri', { y: 2026, m, d }, { y: 2026, m, d }, cat)[0];
const ymd = (m, d) => `2026-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

for (const cat of required) {
  if (!MUHURTA_RULES[cat]) fail(`${cat}: missing MUHURTA_RULES entry`);
  if (!MUH_CATS.some((c) => c.key === cat)) fail(`${cat}: missing finder chip`);
  if (!MUHURAT_GUIDANCE[cat]?.en || !MUHURAT_GUIDANCE[cat]?.hi) fail(`${cat}: missing bilingual guidance`);
}

// Published rule-table sources used for these structural anchors:
// Drik Panchang shubh-dates categories for marriage/housewarming/property/vehicle,
// plus 2026 New Delhi public panchang lists for Sagai, Bhoomi Puja, business
// opening, travel and document signing captured during the 2026-07-24 closeout.
exact(MUHURTA_RULES.engagement.forbidWeekday, [0, 2], 'Engagement blocked weekdays');
exact(MUHURTA_RULES.bhoomi.allowWeekday, [1, 3, 4, 5], 'Bhoomi weekdays');
exact(MUHURTA_RULES.construction.goodTithi, [2, 3, 5, 7, 10, 11, 12, 13], 'Construction tithi');
exact(MUHURTA_RULES.business.auspNak, [0, 6, 7, 11, 12, 13, 14, 16, 20, 21, 22, 26], 'Business nakshatra');
exact(MUHURTA_RULES.travel.auspNak, [0, 4, 6, 7, 12, 16, 21, 22, 26], 'Travel nakshatra');
exact(MUHURTA_RULES.document.allowWeekday, [3, 4, 5], 'Document weekdays');

const distinct = new Set(required.map((cat) => JSON.stringify({
  nak: asList(MUHURTA_RULES[cat].auspNak),
  tithi: asList(MUHURTA_RULES[cat].goodTithi),
  allow: asList(MUHURTA_RULES[cat].allowWeekday),
  forbid: asList(MUHURTA_RULES[cat].forbidWeekday),
  months: asList(MUHURTA_RULES[cat].forbiddenMonths),
  kharmas: !!MUHURTA_RULES[cat].kharmas,
  devshayana: !!MUHURTA_RULES[cat].devshayana,
  asta: !!MUHURTA_RULES[cat].asta,
})));
if (distinct.size < required.length) fail('Required Muhurat categories are not distinct rule sets');

const positives = [
  ['wedding', 2, 26], ['engagement', 2, 26], ['housewarming', 2, 6],
  ['bhoomi', 1, 1], ['construction', 1, 1], ['business', 1, 5],
  ['travel', 1, 5], ['document', 1, 1],
];
for (const [cat, m, d] of positives) {
  const row = one(cat, m, d);
  if (!row?.valid) fail(`${cat} ${ymd(m, d)} expected valid; blockers=${(row?.blockers || []).map((b) => b.en).join('|')}`);
  if (!(row?.activityWindows || []).length) fail(`${cat} ${ymd(m, d)} has no activity-specific window`);
}

const negatives = [
  ['engagement', 1, 1, 'Kharmas'], ['construction', 1, 2, 'unsuitable tithi'],
  ['business', 1, 1, 'not used'], ['travel', 1, 6, 'Tuesday'],
  ['document', 1, 5, 'Monday'],
];
for (const [cat, m, d, why] of negatives) {
  const row = one(cat, m, d);
  const blockers = (row?.blockers || []).map((b) => b.en).join('|');
  if (row?.valid) fail(`${cat} ${ymd(m, d)} expected invalid`);
  if (!blockers.includes(why)) fail(`${cat} ${ymd(m, d)} blocker missing ${why}; got ${blockers}`);
}

const travel = one('travel', 1, 14);
if (!(travel.activityWindows || []).some((w) => w.kind === 'choghadiya' && w.key === 'char')) fail('Travel does not expose Char Choghadiya windows');
const business = one('business', 1, 5);
if ((business.activityWindows || []).some((w) => w.key === 'char')) fail('Business should not reuse travel Char windows');
const wedding = one('wedding', 2, 26);
if (!(wedding.activityWindows || []).some((w) => w.kind === 'panchaka-rahita')) fail('Wedding does not expose Panchaka-Rahita windows');

// ===========================================================================
// FULL-YEAR SWEEP — every offered window, every category, every day of 2026.
//
// Written because the 2026-08-18 Muhurat bug bash found 182 of 538 New Delhi
// wedding windows overlapping Rahu Kalam, Gulika or Yamaganda while all nine
// muhurat gates stayed green: every one of them was a spot check on a handful
// of dates. A defect that appears on a third of the year's windows must not be
// able to hide between two anchors again, so this walks the whole year for
// every category the engine can be asked about.
//
// Convention asserted here (see the block comment above `subtractIntervals` in
// src/engine/muhurat.ts for the sourcing and the recorded disagreement):
// Ganak never OFFERS a window that overlaps Rahu Kalam, Gulika Kalam or
// Yamaganda, in any category.
//
// Runtime is ~2 minutes: 19 categories x 365 days. That is the price of the
// only assertion that would have caught the defect.
// ===========================================================================
const SWEEP_CATS = [...new Set([...Object.keys(MUHURTA_RULES), 'puja', 'purchase', 'general'])];
const ovl = (a, b) => a && b && a.start < b.end && b.start < a.end;
let sweptDays = 0, sweptWindows = 0;
const sweepBad = [];
for (const cat of SWEEP_CATS) {
  const rows = muhuratScanRange(DELHI, 'lahiri', { y: 2026, m: 1, d: 1 }, { y: 2026, m: 12, d: 31 }, cat);
  for (const row of rows) {
    if (!row.valid) continue;
    sweptDays++;
    for (const w of (row.activityWindows || [])) {
      sweptWindows++;
      if (!(w.end > w.start)) sweepBad.push(`${cat} ${ymd(row.m, row.day)} non-positive window`);
      for (const [name, belt] of [['Rahu', row.rahu], ['Gulika', row.gulika], ['Yamaganda', row.yama]]) {
        if (ovl(w, belt)) sweepBad.push(`${cat} ${ymd(row.m, row.day)} offered ${new Date(w.start).toISOString()}..${new Date(w.end).toISOString()} overlaps ${name}`);
      }
    }
  }
}
if (sweepBad.length) {
  fail(`${sweepBad.length} offered windows overlap Rahu/Gulika/Yamaganda across the 2026 sweep`);
  for (const line of sweepBad.slice(0, 8)) console.error('      ' + line);
}
if (sweptWindows < 3000) fail(`sweep is vacuous: only ${sweptWindows} windows over ${sweptDays} valid category-days`);

if (failures) {
  console.error(`deep-muhurats FAILED: ${failures}`);
  process.exit(1);
}
console.log(`✓ deep-muhurats PASSED (8 distinct public Muhurat engines, bilingual chips/guidance, dated anchors, clean-window checks; 2026 sweep: ${sweptWindows} offered windows over ${sweptDays} valid category-days, none overlapping Rahu/Gulika/Yamaganda)`);
