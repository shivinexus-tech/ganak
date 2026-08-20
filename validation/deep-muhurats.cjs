#!/usr/bin/env node
'use strict';

const { loadApp } = require('./_load-app.cjs');
const { MUHURTA_RULES, muhuratScanRange } = loadApp('src/engine/muhurat.ts');
const { GANDA_MOOLA } = loadApp('src/engine/daily-windows.ts');
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
// Property registration, pinned against Drik Panchang's published 2026 New Delhi
// Property Purchase list (drikpanchang.com/shubh-dates/property-registration-
// auspicious-dates.html, read 2026-08-19): 69 offered days, every one a Thursday
// or a Friday, on exactly these twelve nakshatras -- Mrigashira, Punarvasu,
// Ashlesha, Magha, Purva Phalguni, Vishakha, Anuradha, Mula, Purva Ashadha,
// Purva Bhadrapada, Uttara Bhadrapada, Revati. The 2026-08-18 bug bash flagged
// this set as unsourced (F4) because three of its members are Gandamoola. They
// are in the published table; what was missing was the Ganda Moola caution on
// the Muhurat surface, asserted in the sweep below.
exact(MUHURTA_RULES.property.auspNak, [4, 6, 8, 9, 10, 15, 16, 18, 19, 24, 25, 26], 'Property nakshatra (Drik 2026 Delhi Property Purchase list)');
exact(MUHURTA_RULES.property.allowWeekday, [4, 5], 'Property weekdays (Drik: Thursday/Friday only)');

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
// Conventions asserted here (see the block comments above `subtractIntervals`
// and `hardAvoidIntervals` in src/engine/muhurat.ts for the sourcing and the
// recorded disagreement): Ganak never OFFERS a window that overlaps Rahu Kalam,
// Gulika Kalam, Yamaganda or Bhadra (Vishti karana), in any category; and a day
// that carries a Bhadra always says so in its factor list, whether or not the
// Bhadra was running at sunrise.
//
// Runtime is ~2 minutes: 19 categories x 365 days. That is the price of the
// only assertion that would have caught the defect.
// ===========================================================================
const SWEEP_CATS = [...new Set([...Object.keys(MUHURTA_RULES), 'puja', 'purchase', 'general'])];
const ovl = (a, b) => a && b && a.start < b.end && b.start < a.end;
let sweptDays = 0, sweptWindows = 0, bhadraDays = 0, bhadraNamed = 0, gandaDays = 0, gandaNamed = 0, shortestMin = Infinity;
const sweepBad = [];
for (const cat of SWEEP_CATS) {
  const rows = muhuratScanRange(DELHI, 'lahiri', { y: 2026, m: 1, d: 1 }, { y: 2026, m: 12, d: 31 }, cat);
  for (const row of rows) {
    if (!row.valid) continue;
    sweptDays++;
    for (const w of (row.activityWindows || [])) {
      sweptWindows++;
      if (!(w.end > w.start)) sweepBad.push(`${cat} ${ymd(row.m, row.day)} non-positive window`);
      // Usability floor: an offered window must be long enough to begin the rite
      // it is offered for. 2026-04-20 New Delhi wedding used to offer 4:08-4:15.
      const mins = (w.end - w.start) / 60000;
      if (mins < 15) sweepBad.push(`${cat} ${ymd(row.m, row.day)} offers a ${mins.toFixed(0)}-minute window`);
      if (mins < shortestMin) shortestMin = mins;
      for (const [name, belt] of [['Rahu', row.rahu], ['Gulika', row.gulika], ['Yamaganda', row.yama]]) {
        if (ovl(w, belt)) sweepBad.push(`${cat} ${ymd(row.m, row.day)} offered ${new Date(w.start).toISOString()}..${new Date(w.end).toISOString()} overlaps ${name}`);
      }
      for (const b of (row.bhadra || [])) {
        if (ovl(w, b)) sweepBad.push(`${cat} ${ymd(row.m, row.day)} offered ${new Date(w.start).toISOString()}..${new Date(w.end).toISOString()} overlaps Bhadra`);
      }
    }
    // A day that carries a Bhadra must name it, even when the Bhadra opened
    // after sunrise -- the finder used to sample the karana once, at sunrise,
    // and so stayed silent on 13 of the 20 Bhadra wedding days in 2026 Q1.
    if ((row.bhadra || []).length) {
      bhadraDays++;
      if (!(row.factors || []).some((f) => /Vishti/.test(f.en))) sweepBad.push(`${cat} ${ymd(row.m, row.day)} carries Bhadra but no factor names it`);
      else bhadraNamed++;
    }
    // A recommended day on a Gandamoola nakshatra must say so. Until 2026-08-19
    // the finder printed the flagged star as the REASON the day was good --
    // "Highly auspicious - Why this day: Mula nakshatra" on a date Ganak's own
    // Panchang card marked Ganda Moola -- and no Muhurat surface used the term.
    if (GANDA_MOOLA.has(row.nak)) {
      gandaDays++;
      if (!(row.factors || []).some((f) => /Ganda Moola/.test(f.en) && f.g === false)) sweepBad.push(`${cat} ${ymd(row.m, row.day)} is ${row.nakName} (Ganda Moola) with no caution factor`);
      else gandaNamed++;
    }
  }
}
if (sweepBad.length) {
  fail(`${sweepBad.length} sweep defects across 2026 (offered window inside an avoided interval, or an unnamed Bhadra)`);
  for (const line of sweepBad.slice(0, 8)) console.error('      ' + line);
}
if (gandaDays < 200) fail(`Ganda Moola sweep is vacuous: only ${gandaDays} Gandamoola valid category-days`);
if (bhadraDays < 200) fail(`Bhadra sweep is vacuous: only ${bhadraDays} Bhadra-carrying valid category-days`);

// Dated comparator anchors, NOT Ganak against Ganak: Drik Panchang's published
// 2026 New Delhi Vivah Muhurat list opens its window at the minute Bhadra
// closes. (drikpanchang.com/shubh-dates/shubh-marriage-dates-with-muhurat.html
// and /panchang/bhadra-dates-timings.html, both read 2026-08-19.)
const DELHI_BHADRA_ANCHORS = [
  // [y, m, d, Drik's published Vivah window start, local 24h]
  [2026, 2, 21, '13:00'],
  [2026, 5, 1, '10:00'],
  [2026, 6, 29, '16:16'],
];
for (const [y, m, d, drikStart] of DELHI_BHADRA_ANCHORS) {
  const row = muhuratScanRange(DELHI, 'lahiri', { y, m, d }, { y, m, d }, 'wedding')[0];
  const bh = (row && row.bhadra) || [];
  const IST = 19800000;
  const closes = bh.map((b) => new Date(b.end + IST).toISOString().slice(11, 16));
  const want = drikStart;
  const near = bh.some((b) => {
    const mins = (b.end + IST) / 60000;
    const target = Date.UTC(y, m - 1, d, +want.slice(0, 2), +want.slice(3, 5)) / 60000;
    return Math.abs(mins - target) <= 2;
  });
  if (!near) fail(`${y}-${m}-${d}: no Bhadra closing within 2 min of Drik's published Vivah window start ${want}; Ganak Bhadra ends at [${closes.join(', ')}]`);
}

if (sweptWindows < 3000) fail(`sweep is vacuous: only ${sweptWindows} windows over ${sweptDays} valid category-days`);

if (failures) {
  console.error(`deep-muhurats FAILED: ${failures}`);
  process.exit(1);
}
console.log(`✓ deep-muhurats PASSED (8 distinct public Muhurat engines, bilingual chips/guidance, dated anchors, clean-window checks; 2026 sweep: ${sweptWindows} offered windows over ${sweptDays} valid category-days, none overlapping Rahu/Gulika/Yamaganda/Bhadra; ${bhadraNamed}/${bhadraDays} Bhadra days named; ${gandaNamed}/${gandaDays} Ganda Moola days cautioned; shortest offered window ${shortestMin.toFixed(0)} min; 3 Drik Vivah Bhadra-boundary anchors)`);
