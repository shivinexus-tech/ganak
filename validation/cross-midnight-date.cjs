#!/usr/bin/env node
'use strict';
// ============================================================================
// validation/cross-midnight-date.cjs — C3-CROSSMIDNIGHT-DATE
//
// A panchang day runs sunrise to sunrise, so a tithi, nakshatra, yoga, karana,
// Nishita, Brahma Muhurta, night Choghadiya, night Gowri/Dur/Varjyam window,
// moonset or parana can end after midnight. Rendered as a bare "till 7:34" that
// reads as the same day and is simply WRONG — not a display preference.
//
// This is a data-contract gate, so it works in two layers:
//
//   1. CONTRACT. Sweep the engine over many days and places, take every field
//      that can cross, and require the shared renderer to attach its date. This
//      layer is exhaustive and does not depend on any screen.
//
//   2. AS RENDERED. Render the real screens to the text a reader sees, in EN
//      and HI, and require that no crossing instant appears as a bare clock.
//      Layer 1 cannot see a screen that formats a time by hand; this can.
//      (renderToStaticMarkup runs no effects, so it proves TEXT only — never
//      layout. Collapsed panels are not in the rendered text and are covered by
//      layer 1 instead; `REACHED` below records exactly what layer 2 saw.)
// ============================================================================
const { freezeClock, C, card, PLACE } = require('./_snapshot-env.cjs');
freezeClock(); // MUST precede any loadApp — modules capture Date at import time

const { renderScreenText } = require('./_snapshot-render.cjs');
const { loadApp } = require('./_load-app.cjs');
const { computeTodayPanchang } = loadApp('src/engine/today-panchang.ts');
const fmt = loadApp('src/components/format.ts');

let failures = 0, checks = 0;
const fail = (m) => { failures++; console.error('FAIL ' + m); };
const ok = () => { checks++; };

const DAY = 86400000;
const PLACES = [
  ['Delhi', { lat: 28.6139, lon: 77.2090, zone: 'Asia/Kolkata' }],
  ['Mumbai', { lat: 19.0760, lon: 72.8777, zone: 'Asia/Kolkata' }],
  ['Chennai', { lat: 13.0827, lon: 80.2707, zone: 'Asia/Kolkata' }],
  ['Kolkata', { lat: 22.5726, lon: 88.3639, zone: 'Asia/Kolkata' }],
];

/* ------------------------------------------------ layer 1: the contract itself */
// Every day-scoped instant a surface can render, with the anchor it belongs to.
function crossingFields(P) {
  const out = [];
  const push = (name, ms) => { if (Number.isFinite(ms)) out.push({ name, ms }); };
  P.tithis.forEach((t, i) => push(`tithi[${i}].end`, t.end));
  P.naks.forEach((t, i) => push(`nakshatra[${i}].end`, t.end));
  P.yogasP.forEach((t, i) => push(`yoga[${i}].end`, t.end));
  P.karanas.forEach((t, i) => push(`karana[${i}].end`, t.end));
  push('moonSignEnd', P.moonSignEnd);
  push('moonset', P.moonset);
  const w = P.dailyWindows;
  if (w) {
    for (const k of ['brahma', 'nishita', 'godhuli', 'pradosha']) {
      if (w[k]) { push(`${k}.start`, w[k].start); push(`${k}.end`, w[k].end); }
    }
    for (const k of ['bhadra', 'dur', 'varjyam', 'amrit', 'gowri']) {
      (w[k] || []).forEach((x, i) => { push(`${k}[${i}].start`, x.start); push(`${k}[${i}].end`, x.end); });
    }
  }
  (P.choghaNight || []).forEach((c, i) => { push(`choghaNight[${i}].start`, c.start); push(`choghaNight[${i}].end`, c.end); });
  return out;
}

let swept = 0, crossed = 0;
for (const lang of ['en', 'hi']) {
  for (const [city, place] of PLACES) {
    for (let i = 0; i < 40; i++) {
      const P = computeTodayPanchang(place, 'lahiri', Date.UTC(2026, 0, 3, 12) - 5.5 * 3600000 + i * 9 * DAY);
      const clock = fmt.dayClock(P.tz, P.anchor, lang);
      swept++;
      for (const f of crossingFields(P)) {
        const rendered = clock(f.ms);
        const crosses = fmt.crossesDay(f.ms, P.tz, P.anchor);
        if (!crosses) continue;
        crossed++;
        const want = fmt.dayDate(f.ms, P.tz, lang);
        if (!rendered.includes(want)) fail(`${lang} ${city}: ${f.name} renders "${rendered}" with no date (expected to carry "${want}")`);
        else ok();
      }
    }
  }
}
if (crossed < 1000) fail(`only ${crossed} crossing values found in ${swept} day-renders — the contract sweep is not exercising the defect`);
else ok();

// A same-day value must NOT be dated: the contract is a superset of the old
// output, not a change to it. Without this the gate would pass on a renderer
// that stamped a date onto everything.
{
  const P = computeTodayPanchang(PLACES[0][1], 'lahiri', Date.UTC(2026, 6, 25, 12) - 5.5 * 3600000);
  const clock = fmt.dayClock(P.tz, P.anchor, 'en');
  if (clock(P.set) !== fmt.fmtTime(P.set, P.tz)) fail(`sunset inside the panchang day was dated: "${clock(P.set)}"`);
  else ok();
  if (fmt.crossesDay(P.rise, P.tz, P.anchor)) fail('sunrise reported as crossing its own panchang day');
  else ok();
}

// A window wholly on the next civil date prints its date ONCE, at the end —
// Drik's layout. Pinning this stops the range renderer regressing to a doubled
// date, and stops it dropping the date altogether.
{
  const P = computeTodayPanchang(PLACES[0][1], 'lahiri', Date.UTC(2026, 6, 25, 12) - 5.5 * 3600000);
  const span = fmt.dayRange(P.tz, P.anchor, 'en');
  const nishita = P.dailyWindows.nishita;
  const text = span(nishita.start, nishita.end);
  const date = fmt.dayDate(nishita.end, P.tz, 'en');
  const times = text.split(date).length - 1;
  if (times !== 1) fail(`Nishita window "${text}" names its date ${times} times, expected exactly once`);
  else ok();
  if (!text.endsWith(date)) fail(`Nishita window "${text}" does not close with its date`);
  else ok();
}

// A pathological multi-day window still follows the one-date contract: its
// date appears once, at the end, never once per endpoint.
{
  const ref = Date.UTC(2026,0,1,6), a = Date.UTC(2026,0,2,23), b = Date.UTC(2026,0,3,1);
  const text = fmt.dayRange(0, ref, 'en')(a,b);
  const dates = (text.match(/Jan /g) || []).length;
  if (text !== '11:00 PM–1:00 AM, Jan 3') fail(`multi-day range broke the one-date contract: "${text}"`);
  else if (dates !== 1) fail(`multi-day range names ${dates} dates, expected one at the end: "${text}"`);
  else ok();
}

// A numeric offset cannot represent a DST change inside one panchang day. The
// shared renderer accepts the IANA zone so the clock and date are instant-aware.
{
  const NY = { lat:40.7128, lon:-74.0060, zone:'America/New_York' };
  for (const [label, at, want] of [
    ['spring forward', Date.parse('2026-03-07T17:00:00Z'), '7:18 AM, Mar 8'],
    ['fall back', Date.parse('2026-10-31T16:00:00Z'), '6:26 AM, Nov 1'],
  ]) {
    const P = computeTodayPanchang(NY, 'lahiri', at);
    const got = fmt.dayClock(P.tz, P.anchor, 'en', undefined, NY.zone)(P.nextRise);
    if (got !== want) fail(`${label}: next sunrise renders "${got}", expected "${want}" with the IANA-zone offset transition`);
    else ok();
  }
}

// Future transit events can be months away from today's numeric offset. Their
// clocks and dates must use the place's IANA zone so seasonal DST is respected.
{
  const zone = 'America/New_York', winter = Date.parse('2026-01-15T12:00:00Z'), summer = Date.parse('2026-07-15T12:00:00Z');
  if (fmt.fmtTimeZone(winter, -5, zone) !== '7:00 AM') fail('future-event winter clock is not IANA-zone aware');
  else ok();
  if (fmt.fmtTimeZone(summer, -5, zone) !== '8:00 AM') fail('future-event summer clock reused the winter numeric offset');
  else ok();
  if (fmt.fmtDateZone(summer, -5, 'en', zone, true) !== 'Jul 15, 2026') fail('future-event date is not rendered in the selected IANA zone');
  else ok();

  const fs = require('fs');
  const daily = fs.readFileSync('src/screens/DailyScreen.tsx','utf8');
  if (!/fmtTimeZone\(e2\.t, todayP\.tz, place\?\.zone\)/.test(daily)) fail('DailyScreen future event clock bypasses the IANA-zone formatter');
  else ok();
  if (!/fmtDateZone\(x\.enter, todayP\.tz, lang, place\?\.zone, true\)/.test(daily)) fail('DailyScreen transit timeline date bypasses the IANA-zone formatter');
  else ok();
  if (/new Date\((?:e2\.t|x\.enter|st\.t) \+ todayP\.tz \* 3600000\)/.test(daily)) fail('DailyScreen still shifts a future event by today\'s fixed offset');
  else ok();
}

// Festival clocks may choose their own 12/24-hour style, but date crossing must
// be delegated to the shared contract rather than reimplemented.
{
  const fs = require('fs');
  const festival = fs.readFileSync('src/screens/FestivalGuideScreen.tsx','utf8');
  if (!/return dayClock\(tz, refMs, lang, render, zone\)\(ms\)/.test(festival)) fail('FestivalGuideScreen does not delegate its localized clock to dayClock');
  else ok();
  if (/sameDay\s*=|getUTCFullYear\(\)\s*===\s*ref/.test(festival)) fail('FestivalGuideScreen still duplicates the civil-date comparison');
  else ok();
}

/* --------------------------------------------- layer 2: as a reader sees it */
// Screens whose rendered text is reachable without user interaction. Panels that
// open on a tap (the decision-window detail list, the 60-day yoga calendar, the
// full-panchang table) produce no text under renderToStaticMarkup, so they are
// NOT claimed here — layer 1 covers their values.
const REACHED = [{ key: 'daily', entry: 'src/screens/DailyScreen.tsx' }];
const noop = () => {};
const base = (lang) => ({ C, card, lang, place: PLACE, onPlace: noop });

// The Mumbai fixture at the frozen instant — the same panchang the screens build.
const FIXTURE_P = computeTodayPanchang({ lat: PLACE.lat, lon: PLACE.lon, zone: PLACE.zone }, 'lahiri', undefined);

// Only the values Today actually prints, named one by one. A generic bare-clock
// scan cannot be used: two different instants often share a clock string (the
// night Gowri window ends at the same 6:19 AM the sun dial prints for sunrise),
// and a correctly rendered range deliberately leaves its START bare because the
// date is printed once at the end.
const shown = [];
if (FIXTURE_P.naks[0]) shown.push({ name: "nakshatra 'till'", ms: FIXTURE_P.naks[0].end });
if (FIXTURE_P.moonset != null) shown.push({ name: 'moonset', ms: FIXTURE_P.moonset });
// Today prints only the night Choghadiya windows still ahead of the reader, so
// which ones appear is a runtime decision. Each is claimed only if the screen
// actually opened that window — then its full range must carry the date.
const shownRanges = (FIXTURE_P.choghaNight || []).map((c, i) => ({ name: `night Choghadiya[${i}]`, start: c.start, end: c.end }));

let reachedChecks = 0, crossingShown = 0;
for (const lang of ['en', 'hi']) {
  let text;
  try { text = renderScreenText(REACHED[0].entry, base(lang), REACHED[0].exportName); }
  catch (e) { fail(`daily.${lang}: render error ${String(e && e.message).split('\n')[0]}`); continue; }

  for (const f of shown) {
    if (!fmt.crossesDay(f.ms, FIXTURE_P.tz, FIXTURE_P.anchor)) continue;
    crossingShown++;
    const dated = `${fmt.fmtTime(f.ms, FIXTURE_P.tz)}, ${fmt.dayDate(f.ms, FIXTURE_P.tz, lang)}`;
    if (!text.includes(dated)) fail(`daily.${lang}: ${f.name} ends on the next day but "${dated}" is nowhere in the rendered text`);
    else { ok(); reachedChecks++; }
  }

  const span = fmt.dayRange(FIXTURE_P.tz, FIXTURE_P.anchor, lang);
  for (const w of shownRanges) {
    if (!fmt.crossesDay(w.end, FIXTURE_P.tz, FIXTURE_P.anchor)) continue;
    if (!text.includes(`${fmt.fmtTime(w.start, FIXTURE_P.tz)}–`)) continue; // not one of the windows on screen
    crossingShown++;
    const want = span(w.start, w.end);
    if (!text.includes(want)) fail(`daily.${lang}: ${w.name} is on screen and runs past midnight, but "${want}" is nowhere in the rendered text`);
    else { ok(); reachedChecks++; }
  }

  // The exact defect that opened this row: "till <time>" with no date. Anchored on
  // the word, so it cannot be confused with another value sharing the clock.
  for (const lead of ['till ', 'upto ', 'until ']) {
    const re = new RegExp(`${lead}(\\d{1,2}:\\d{2} (?:AM|PM))(?!,)`, 'g');
    for (const m of text.matchAll(re)) {
      const hit = shown.find((f) => fmt.crossesDay(f.ms, FIXTURE_P.tz, FIXTURE_P.anchor) && fmt.fmtTime(f.ms, FIXTURE_P.tz) === m[1]);
      if (hit) fail(`daily.${lang}: "${m[0].trim()}" — ${hit.name} is on the next day and must carry its date`);
    }
  }
  ok();
}
if (crossingShown === 0) fail('layer 2 proved nothing — no value rendered on Today crosses midnight at the fixture instant');
else ok();

console.log(failures
  ? `cross-midnight-date: ${failures} FAILURES (${checks} passed)`
  : `cross-midnight-date: PASS — ${checks} checks · contract: ${crossed} crossing values over ${swept} day-renders (4 cities × EN/HI) · as-rendered: ${reachedChecks} crossing values on Today in EN and HI`);
process.exit(failures ? 1 : 0);
