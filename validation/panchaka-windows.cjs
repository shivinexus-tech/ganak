#!/usr/bin/env node
// ============================================================================
// validation/panchaka-windows.cjs — guards the shape of the panchaka / lagna
// windows produced by src/engine/panchaka.ts.
//
//   node validation/panchaka-windows.cjs
//
// Two invariants, both user-visible in the Daily panchaka list and the muhurat
// finder's top-day panchaka:
//
//   1. NO SUB-MINUTE WINDOW. The UI renders windows at minute precision, so a
//      window shorter than 60s prints with an identical start and end — e.g.
//      "अग्नि 9:31 PM–9:31 PM" (New Delhi, 30 Jul 2026, the original report).
//      That happens when two independent boundaries land within seconds of each
//      other: there, tithi rolled 16→17 at 21:31:08 and the lagna sign rolled
//      10→11 at 21:31:44, leaving a real but unusable 36-second agni sliver.
//   2. THE WINDOWS STILL TILE THE DAY. Suppressing a sliver must hand its span
//      to a neighbour, never drop it: windows must run edge-to-edge from sunrise
//      to next sunrise with no gap and no overlap.
//
// Scanned over a date range at several latitudes so the check keeps biting as
// the engine changes, not just on the one reported day.
// ============================================================================
'use strict';
const { loadApp } = require('./_load-app.cjs');
const eng = loadApp('src/engine/panchaka.ts');

const MIN_MS = 60000;
const PLACES = [
  { label: 'New Delhi', lat: 28.61, lon: 77.21, zone: 'Asia/Kolkata' },
  { label: 'Mumbai', lat: 19.08, lon: 72.88, zone: 'Asia/Kolkata' },
  { label: 'Chennai', lat: 13.08, lon: 80.27, zone: 'Asia/Kolkata' },
];
// Starts on the reported regression day so it is always covered.
const START = { y: 2026, m: 7, d: 30 };
const DAYS = 45;

const fmt = (ms, tz) => new Date(ms + tz * 3600000).toISOString().slice(0, 19).replace('T', ' ');
const hhmm = (ms, tz) => new Date(ms + tz * 3600000).toISOString().slice(11, 16);

let fails = [];
let checkedDays = 0, checkedWindows = 0;

for (const place of PLACES) {
  for (let i = 0; i < DAYS; i++) {
    const anchor = Date.UTC(START.y, START.m - 1, START.d, 6, 0, 0) + i * 86400000;
    let lp;
    try { lp = eng.computeLagnaPanchaka(place, 'lahiri', anchor); }
    catch (e) { fails.push(`${place.label} +${i}d: threw ${e && e.message}`); continue; }
    const tz = lp.tz != null ? lp.tz : 5.5;
    const day = new Date(anchor + tz * 3600000).toISOString().slice(0, 10);
    if (!lp.panchakaWindows || !lp.panchakaWindows.length) continue;
    checkedDays++;

    for (const [name, list] of [['panchaka', lp.panchakaWindows], ['lagna', lp.lagnaSchedule]]) {
      if (!list || !list.length) continue;
      for (const w of list) {
        checkedWindows++;
        const dur = w.end - w.start;
        // 1. sub-minute / zero-length
        if (dur < MIN_MS) {
          fails.push(`${place.label} ${day} ${name}: sub-minute window ` +
            `${w.type || ('sign ' + w.sign)} ${fmt(w.start, tz)} -> ${fmt(w.end, tz)} ` +
            `(${(dur / 1000).toFixed(1)}s, renders as ${hhmm(w.start, tz)}–${hhmm(w.end, tz)})`);
        }
        // the render-level restatement of the same rule
        if (hhmm(w.start, tz) === hhmm(w.end, tz)) {
          fails.push(`${place.label} ${day} ${name}: window renders start==end at ${hhmm(w.start, tz)}`);
        }
      }
      // 2. tiling: contiguous, and spanning sunrise -> next sunrise
      for (let k = 1; k < list.length; k++) {
        if (list[k].start !== list[k - 1].end) {
          fails.push(`${place.label} ${day} ${name}: ${list[k].start > list[k - 1].end ? 'gap' : 'overlap'} ` +
            `between ${fmt(list[k - 1].end, tz)} and ${fmt(list[k].start, tz)}`);
        }
      }
      if (lp.rise != null && list[0].start !== lp.rise) {
        fails.push(`${place.label} ${day} ${name}: starts at ${fmt(list[0].start, tz)}, not sunrise ${fmt(lp.rise, tz)}`);
      }
      if (lp.nextRise != null && list[list.length - 1].end !== lp.nextRise) {
        fails.push(`${place.label} ${day} ${name}: ends at ${fmt(list[list.length - 1].end, tz)}, not next sunrise ${fmt(lp.nextRise, tz)}`);
      }
    }
  }
}

console.log(`panchaka-windows: ${checkedDays} days x ${PLACES.length} places, ${checkedWindows} windows checked`);
if (fails.length) {
  console.log(`\n✗ ${fails.length} violation(s):`);
  for (const f of fails.slice(0, 25)) console.log(`   ${f}`);
  if (fails.length > 25) console.log(`   … and ${fails.length - 25} more`);
  console.log('\n✗ panchaka-windows FAILED');
  process.exit(1);
}
console.log('\n✓ panchaka-windows PASSED (no sub-minute windows; windows tile sunrise→sunrise)');
process.exit(0);
