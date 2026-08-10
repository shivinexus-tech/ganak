#!/usr/bin/env node
'use strict';
const { loadApp } = require('./_load-app.cjs');
const { subtractWindows, adjudicate, dominantChoghadiya, nextCleanWindow } = loadApp('src/engine/hora-verdict.ts');
const { computeTodayPanchang } = loadApp('src/engine/today-panchang.ts');
const { dayHoras, horaWindowsForPlanet, nightHoras, HORA_ORDER, DAY_LORD, horaResultText } = loadApp('src/engine/hora.ts');
const { trikonaLords, personalHoraWindows } = loadApp('src/engine/personal-hora.ts');
let failures = 0;
const fail = (m) => { failures++; console.error('FAIL ' + m); };
const W = (s, e) => ({ start: s, end: e });

// no cuts -> the base survives whole
let r = subtractWindows(W(0, 100), []);
if (r.length !== 1 || r[0].start !== 0 || r[0].end !== 100) fail('no cuts should return the base');

// cut fully covering the base -> nothing survives
r = subtractWindows(W(10, 20), [W(0, 100)]);
if (r.length !== 0) fail('a covering cut should leave nothing');

// cut in the middle -> two remainders
r = subtractWindows(W(0, 100), [W(40, 60)]);
if (r.length !== 2 || r[0].end !== 40 || r[1].start !== 60) fail('a middle cut should split into two');

// overlapping cuts merge
r = subtractWindows(W(0, 100), [W(20, 50), W(40, 70)]);
if (r.length !== 2 || r[0].end !== 20 || r[1].start !== 70) fail('overlapping cuts should merge');

// cuts outside the base are ignored
r = subtractWindows(W(0, 100), [W(200, 300)]);
if (r.length !== 1 || r[0].end !== 100) fail('cuts outside the base should be ignored');

// remainders are ordered and never negative
r = subtractWindows(W(0, 100), [W(70, 80), W(10, 20)]);
for (let i = 0; i < r.length; i++) {
  if (r[i].end <= r[i].start) fail('remainder ' + i + ' has non-positive length');
  if (i && r[i].start < r[i - 1].end) fail('remainders are not ordered');
}

const CTX = (over) => Object.assign({
  rahu: null, gulika: null, yama: null, abhijit: null,
  chogha: [
    { key: 'amrit', nat: 'good',    start: 0,   end: 50 },
    { key: 'rog',   nat: 'bad',     start: 50,  end: 100 },
    { key: 'char',  nat: 'neutral', start: 100, end: 200 },
  ],
}, over || {});

// clean: nothing blocks it
let v = adjudicate(W(0, 40), CTX());
if (v.status !== 'clean') fail('unblocked window should be clean');
if (v.usable.length !== 1 || v.usable[0].end !== 40) fail('clean window should be fully usable');
if (v.gradeKey !== 'amrit' || v.grade !== 'good') fail('grade should come from the dominant choghadiya');

// blocked: fully inside rahu
v = adjudicate(W(10, 20), CTX({ rahu: W(0, 100) }));
if (v.status !== 'blocked') fail('window inside rahu should be blocked');
if (v.usable.length !== 0) fail('blocked window should have no usable time');
if (v.blockedBy.join() !== 'rahu') fail('blockedBy should name rahu');

// R2: these three replace an earlier gate whose windows ended exactly where
// rahu began (zero overlap), so the subtraction path was never exercised —
// a reviewer could (and did) delete the MIN_USABLE_MS filter with the gate
// still green. All three below genuinely overlap a belt or deliberately don't.

// discarded sliver: the cut leaves a 90s remainder, under the 3-minute floor
v = adjudicate(W(0, 600000), CTX({ rahu: W(90000, 600000) }));
if (v.status !== 'blocked') fail('a 90-second cut remainder should be discarded');
if (v.usable.length !== 0) fail('a discarded remainder should leave usable empty');
if (v.blockedBy.join() !== 'rahu') fail('blockedBy should name rahu even though the remainder was discarded');

// surviving remainder: the cut leaves a 240s remainder, over the 3-minute floor
// (this also supersedes the old "straddles the start of rahu" partial case,
// rescaled to real ms so it no longer accidentally trips MIN_USABLE_MS)
v = adjudicate(W(0, 600000), CTX({ rahu: W(240000, 600000) }));
if (v.status !== 'partial') fail('a 240-second cut remainder should survive as partial');
if (v.usable.length !== 1 || v.usable[0].start !== 0 || v.usable[0].end !== 240000) fail('surviving remainder should run from the window start to the cut');
if (v.blockedBy.join() !== 'rahu') fail('blockedBy should name rahu');

// no overlap, belt present elsewhere: a short window untouched by any belt
// passes through whole — R2 discards slivers left by cutting, not short
// windows in general (spec ambiguity, resolved).
v = adjudicate(W(0, 120000), CTX({ rahu: W(3000000, 3600000) }));
if (v.status !== 'clean') fail('an unblocked window should never be discarded for its own length');
if (v.usable.length !== 1 || v.usable[0].start !== 0 || v.usable[0].end !== 120000) fail('unblocked window should be usable whole');
if (v.blockedBy.length !== 0) fail('blockedBy should be empty when nothing overlaps');

// multiple belts are all named
v = adjudicate(W(0, 100), CTX({ rahu: W(0, 30), gulika: W(30, 60), yama: W(60, 100) }));
if (v.blockedBy.join() !== 'rahu,gulika,yama') fail('all overlapping belts should be named in order');

// R5: abhijit boosts but never unblocks
v = adjudicate(W(10, 20), CTX({ rahu: W(0, 100), abhijit: W(0, 100) }));
if (v.status !== 'blocked') fail('abhijit must not clear a block');
if (v.abhijitBoost !== true) fail('abhijit overlap should still set the boost flag');

// R6: ties resolve to the earlier segment
const tie = dominantChoghadiya(W(25, 75), CTX());
if (!tie || tie.key !== 'amrit') fail('an exact overlap tie should resolve to the earlier segment');

// R4 (corrected): grade must come from the usable spans, not the whole window.
// A belt cuts a hole in the middle of the window; the Choghadiya segment that
// covers the greatest share of the WHOLE window ('shubh', the middle span) lies
// entirely inside that blocked hole. Grading by usable spans instead: 'rog1'
// covers all of the first remainder (0-300000, overlap 300000) and 'rog2' covers
// all of the second (700000-1000000, overlap 300000) — a tie, which R6 resolves
// to the earlier segment in chogha array order, i.e. 'rog1'.
const HOLE_CTX = {
  rahu: W(300000, 700000), gulika: null, yama: null, abhijit: null,
  chogha: [
    { key: 'rog1', nat: 'bad', start: 0, end: 300000 },
    { key: 'shubh', nat: 'good', start: 300000, end: 700000 },
    { key: 'rog2', nat: 'bad', start: 700000, end: 1000000 },
  ],
};
v = adjudicate(W(0, 1000000), HOLE_CTX);
if (v.usable.length !== 2 || v.usable[0].end !== 300000 || v.usable[1].start !== 700000) fail('the belt should leave two usable remainders around the blocked hole');
if (v.grade !== 'bad') fail('grade must come from the usable spans, not the dominant segment of the whole window (expected bad, got ' + v.grade + ')');
if (v.gradeKey !== 'rog1') fail('gradeKey must be the segment winning summed overlap across usable spans, tie resolved to the earlier one (expected rog1, got ' + v.gradeKey + ')');

// R4 fallback: a fully blocked window (usable empty) still reports a grade,
// computed over the whole window since there is no usable time to measure against.
v = adjudicate(W(10, 20), CTX({ rahu: W(0, 100) }));
if (v.usable.length !== 0) fail('sanity: this window should be fully blocked for the fallback check');
if (v.grade !== 'good' || v.gradeKey !== 'amrit') fail('a fully blocked window should still grade over the whole window (expected good/amrit, got ' + v.grade + '/' + v.gradeKey + ')');

// R5 (corrected): abhijitBoost must come from the usable spans, not the whole
// window. Reuses HOLE_CTX's belt (rahu 300000-700000 cutting a hole out of a
// 0-1000000 window), with abhijit (400000-600000) placed entirely inside that
// blocked hole — the same hole R4's HOLE_CTX case exercises for grade.
const ABHIJIT_HOLE_CTX = Object.assign({}, HOLE_CTX, { abhijit: W(400000, 600000) });
v = adjudicate(W(0, 1000000), ABHIJIT_HOLE_CTX);
if (v.usable.length !== 2 || v.usable[0].start !== 0 || v.usable[0].end !== 300000 || v.usable[1].start !== 700000 || v.usable[1].end !== 1000000) {
  fail('abhijit-in-hole case: usable should still be [{0,300000},{700000,1000000}] (expected unchanged by abhijit)');
}
if (v.abhijitBoost !== false) fail('abhijit lying entirely inside the blocked hole must not set abhijitBoost (it overlaps no usable span)');

// R5 (corrected): abhijit overlapping a surviving usable span DOES set the boost.
const ABHIJIT_USABLE_CTX = Object.assign({}, HOLE_CTX, { abhijit: W(100000, 200000) });
v = adjudicate(W(0, 1000000), ABHIJIT_USABLE_CTX);
if (v.abhijitBoost !== true) fail('abhijit overlapping a surviving usable span should set abhijitBoost');

// R5 fallback: a fully blocked window (usable empty) whose abhijit overlaps
// the raw window still reports abhijitBoost true, and status stays blocked —
// re-pinning that abhijit never clears a block, even under the corrected rule.
v = adjudicate(W(10, 20), CTX({ rahu: W(0, 100), abhijit: W(0, 100) }));
if (v.usable.length !== 0) fail('sanity: this window should be fully blocked for the R5 fallback check');
if (v.abhijitBoost !== true) fail('a fully blocked window should still report abhijitBoost via the whole-window fallback');
if (v.status !== 'blocked') fail('abhijitBoost must not clear a block, even under the fallback (R5)');

// Use realistic window sizes (each 300s = 300000ms >> MIN_USABLE_MS = 180000ms)
const WINS = [W(0, 300000), W(300000, 600000), W(600000, 900000)];

// skips a blocked window and returns the next with usable time
let n = nextCleanWindow(WINS, CTX({ rahu: W(0, 300000) }), 0);
if (!n || n.window.start !== 300000) fail('nextCleanWindow should skip a fully blocked window');

// never returns a window that ended before afterMs; 350000 lands inside window 2
// (300000-600000) with 250000ms remaining, comfortably over the 180000ms threshold
n = nextCleanWindow(WINS, CTX(), 350000);
if (!n || n.window.start !== 300000 || n.window.end !== 600000) fail('nextCleanWindow should return the window containing afterMs');
if (!n.verdict.usable.length || n.verdict.usable[0].start !== 350000) fail('usable start should be clipped to afterMs');

// 500000 also lands inside window 2, but only 100000ms remains in it — under the
// 180000ms threshold — so that window is skipped in favour of window 3
n = nextCleanWindow(WINS, CTX(), 500000);
if (!n || n.window.start !== 600000) fail('nextCleanWindow should skip a window with insufficient remaining margin after afterMs, even though afterMs lands inside it');

n = nextCleanWindow(WINS, CTX(), 1000000);
if (n !== null) fail('nextCleanWindow should return null when nothing remains');

// a partial window counts, and reports its usable remainder
n = nextCleanWindow([W(0, 10 * 60000)], CTX({ rahu: W(5 * 60000, 60 * 60000) }), 0);
if (!n || n.verdict.status !== 'partial') fail('a partial window should be offered');
if (!n.verdict.usable.length || n.verdict.usable[0].end !== 5 * 60000) fail('partial remainder should be reported');

// gate: a window whose usable time ends 60000 ms after afterMs must NOT be returned
// (less than MIN_USABLE_MS = 180000 remaining)
n = nextCleanWindow([W(0, 300000)], CTX({ rahu: W(0, 40000) }), 220000);
if (n !== null) fail('a window with less than 180000ms remaining after afterMs should be skipped');

// gate: a window whose usable time ends 240000 ms after afterMs must be returned
// (at least MIN_USABLE_MS = 180000 remaining)
n = nextCleanWindow([W(0, 300000)], CTX({ rahu: W(0, 40000) }), 80000);
if (!n || n.window.start !== 0) fail('a window with at least 180000ms remaining after afterMs should be returned');
if (!n.verdict.usable.length || n.verdict.usable[0].start !== 80000 || n.verdict.usable[0].end !== 300000) fail('usable start must be clipped to afterMs (80000), not the unclipped cut boundary (40000)');

// gate: grade/gradeKey must describe the OFFERED range, not the raw window.
// Window 0-900000 is dominated by an earlier 'good'/'amrit' span (0-500000)
// that adjudicate would grade the whole window by, but afterMs=550000 clips
// usable to a 'bad'/'rog' remainder (550000-900000) with no overlap into the
// 'good' span at all. The returned verdict must grade what's actually offered.
const GRADE_CTX = CTX({
  chogha: [
    { key: 'amrit', nat: 'good', start: 0, end: 500000 },
    { key: 'rog', nat: 'bad', start: 500000, end: 900000 },
  ],
});
n = nextCleanWindow([W(0, 900000)], GRADE_CTX, 550000);
if (!n || !n.verdict.usable.length || n.verdict.usable[0].start !== 550000) fail('grade gate: usable[0].start should be clipped to afterMs (550000)');
if (!n || n.verdict.grade !== 'bad' || n.verdict.gradeKey !== 'rog') fail('grade/gradeKey must reflect the offered range, not the full window (expected bad/rog, got ' + (n && n.verdict.grade) + '/' + (n && n.verdict.gradeKey) + ')');

// gate: status/blockedBy/abhijitBoost must also describe the OFFERED range, not
// the raw window. Both rahu (0-300000) and abhijit (0-200000) sit entirely in
// the already-elapsed part (before afterMs=400000); the offered range
// (400000-900000) touches neither. Every field must reflect that.
const OFFERED_CTX = CTX({ rahu: W(0, 300000), abhijit: W(0, 200000) });
n = nextCleanWindow([W(0, 900000)], OFFERED_CTX, 400000);
if (!n || n.verdict.status !== 'clean') fail('offered-range gate: status should be clean when the offered range is untouched by rahu (got ' + (n && n.verdict.status) + ')');
if (!n || n.verdict.blockedBy.length !== 0) fail('offered-range gate: blockedBy should be empty when rahu does not touch the offered range');
if (!n || n.verdict.abhijitBoost !== false) fail('offered-range gate: abhijitBoost should be false when abhijit does not touch the offered range');
if (!n || n.verdict.usable.length !== 1 || n.verdict.usable[0].start !== 400000 || n.verdict.usable[0].end !== 900000) fail('offered-range gate: usable should be exactly [400000,900000]');

// nextRise: night choghadiya must be measured against the real following
// sunrise, not rise+24h (which drifts by minutes, worst near the solstices).
const DELHI = { lat: 28.6139, lon: 77.2090, zone: 'Asia/Kolkata', label: 'Delhi' };
const tp = computeTodayPanchang(DELHI, 'lahiri', Date.UTC(2026, 11, 21, 6, 30)); // solstice: worst drift
if (tp.nextRise == null) fail('computeTodayPanchang should expose nextRise');
if (Math.abs(tp.nextRise - (tp.rise + 86400000)) < 1000)
  fail('nextRise looks like rise+24h — it must be the real following sunrise');
if (!(tp.nextRise > tp.set)) fail('nextRise must fall after sunset');
// night choghadiya must end at the real sunrise, not the approximation
const lastNight = tp.choghaNight[tp.choghaNight.length - 1];
if (Math.abs(lastNight.end - tp.nextRise) > 1) fail('night choghadiya must end at the real next sunrise');

// horaWindowsForPlanet: day + night horas must tile sunrise -> next sunrise
// with no gap and no overlap, when the real nextRise is supplied.
const RISE = Date.UTC(2026, 7, 9, 0, 30), SET = RISE + 13 * 3600000, NEXT = RISE + 24.4 * 3600000;
const all = [];
for (const p of ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'])
  all.push(...horaWindowsForPlanet(p, 0, RISE, SET, NEXT));
all.sort((a, b) => a.start - b.start);
if (all.length !== 24) fail('a full day should produce exactly 24 horas, got ' + all.length);
if (Math.abs(all[0].start - RISE) > 1) fail('the first hora should start at sunrise');
if (Math.abs(all[all.length - 1].end - NEXT) > 1) fail('the last hora should end at the NEXT sunrise, not rise+24h');
for (let i = 1; i < all.length; i++)
  if (Math.abs(all[i].start - all[i - 1].end) > 1) fail('hora ' + i + ' does not abut its predecessor');

// horaWindowsForPlanet: the fifth (nextRise) parameter must be optional —
// callers that omit it keep the old rise+24h approximation, not NaN/crash.
// (Checked across all seven planets, combined: a single planet's own last
// window need not land on the 12th night hora, since 12 nights / 7 planets
// wraps unevenly — only the union of all planets' windows always reaches it.)
const allDefaulted = [];
for (const p of ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'])
  allDefaulted.push(...horaWindowsForPlanet(p, 0, RISE, SET));
allDefaulted.sort((a, b) => a.start - b.start);
if (allDefaulted.length !== 24) fail('horaWindowsForPlanet without nextRise should still return 24 windows total, got ' + allDefaulted.length);
if (Math.abs(allDefaulted[allDefaulted.length - 1].end - (RISE + 86400000)) > 1)
  fail('horaWindowsForPlanet without nextRise should fall back to rise+86400000');

// nightHoras: twelve windows, sunset -> next sunrise, in Chaldean order, abutting.
const nh = nightHoras(0, SET, NEXT);
if (nh.length !== 12) fail('nightHoras should return exactly 12 windows, got ' + nh.length);
if (Math.abs(nh[0].start - SET) > 1) fail('nightHoras: first window should start at sunset');
if (Math.abs(nh[nh.length - 1].end - NEXT) > 1) fail('nightHoras: last window should end at the real next sunrise');
for (let i = 1; i < nh.length; i++)
  if (Math.abs(nh[i].start - nh[i - 1].end) > 1) fail('nightHoras: window ' + i + ' does not abut its predecessor');
// sunday (weekday 0): day lord Sun -> hora order index 0, so night starts at
// HORA_ORDER[0+12] = HORA_ORDER[5] = Jupiter (Chaldean order wraps every 7).
if (nh[0].ruler !== 'Jupiter') fail('nightHoras: first night ruler for Sunday should be Jupiter, got ' + nh[0].ruler);

// nightHoras: nextRise has NO default (unlike horaWindowsForPlanet's
// rise+86400000 — see the comment on nightHoras for why). Calling it without
// nextRise must NOT silently produce a usable 24h-after-sunset approximation;
// it must produce garbage that is visibly unusable, proving the argument is
// genuinely required rather than quietly defaulted back in.
const nhMissing = nightHoras(0, SET);
if (!Number.isNaN(nhMissing[nhMissing.length - 1].end))
  fail('nightHoras without nextRise should produce a NaN end (undefined arithmetic), not a usable window — got ' + nhMissing[nhMissing.length - 1].end);

// horaWindowsForPlanet: night-hora RULER sequence must be pinned, not just
// timestamps. The existing tiling gates above (line ~224) check only
// start/end, which are invariant under any relabelling of which planet owns
// which slot — a mutation swapping the night loop's (startIdx + 12 + i) for
// (startIdx + i) mislabels every night ruler while leaving every timestamp
// untouched, and those gates would stay green. Derivation: startIdx =
// HORA_ORDER.indexOf(DAY_LORD[weekday]); the ruler of hora i (i = 0..11 day,
// 12..23 night, in time order) is HORA_ORDER[(startIdx + i) % 7] — the night
// sequence continues the day sequence, it does not restart at night's start.
// Covers three different weekdays, not Sunday alone (the existing nightHoras
// ruler check above tests only Sunday).
function rulerSeqFor(weekday) {
  const tagged = [];
  for (const p of HORA_ORDER)
    for (const w of horaWindowsForPlanet(p, weekday, RISE, SET, NEXT))
      tagged.push(Object.assign({ ruler: p }, w));
  tagged.sort((a, b) => a.start - b.start);
  return tagged;
}
for (const weekday of [0, 1, 3, 5]) { // Sunday, Monday, Wednesday, Friday
  const startIdx = HORA_ORDER.indexOf(DAY_LORD[weekday % 7]);
  const seq = rulerSeqFor(weekday);
  if (seq.length !== 24) fail('weekday ' + weekday + ': ruler sequence should have 24 windows, got ' + seq.length);
  for (let i = 0; i < seq.length; i++) {
    const expected = HORA_ORDER[(startIdx + i) % 7];
    if (seq[i].ruler !== expected)
      fail('weekday ' + weekday + ': hora ' + i + ' ruler should be ' + expected + ' (rotation continues without break), got ' + seq[i].ruler);
  }
  const firstNightRuler = HORA_ORDER[(startIdx + 12) % 7];
  if (seq[12].ruler !== firstNightRuler)
    fail('weekday ' + weekday + ': first night hora ruler should be ' + firstNightRuler + ' (the planet following day hora 12 in the rotation), got ' + seq[12].ruler);
}

// trikonaLords: lords of houses 1, 5, 9 from the ascendant (trikona houses).
// Derived from SIGN_LORD in panchang.ts:
//   SIGN_LORD = [Mars,Venus,Mercury,Moon,Sun,Mercury,Venus,Mars,Jupiter,Saturn,Saturn,Jupiter]
// Aries ascendant (idx 0): offsets 0,4,8 -> signs 0,4,8 = Mars, Sun, Jupiter
const aries = trikonaLords(0);
if (aries.join() !== 'Mars,Sun,Jupiter') fail('Aries trikona lords wrong: ' + aries.join());

// Sagittarius ascendant (idx 8): offsets 0,4,8 -> signs 8,0,4 = Jupiter, Mars, Sun
if (trikonaLords(8).slice().sort().join() !== 'Jupiter,Mars,Sun') fail('Sagittarius trikona lords wrong: ' + trikonaLords(8).join());

// duplicates are collapsed (some ascendants have one lord ruling two of the three houses)
for (let i = 0; i < 12; i++) {
  const l = trikonaLords(i);
  if (new Set(l).size !== l.length) fail('trikona lords should be unique for asc ' + i);
  if (!l.length || l.length > 3) fail('trikona lords should number 1-3 for asc ' + i);
}

// personal windows are a subset of that planet's windows and carry the planet name
const pw = personalHoraWindows(0, 0, RISE, SET, NEXT);
if (!pw.length) fail('personal hora windows should not be empty');
for (const w of pw) {
  if (!aries.includes(w.planet)) fail('personal window names a non-trikona planet: ' + w.planet);
  if (w.end <= w.start) fail('personal window has non-positive length');
  if (w.period !== 'day' && w.period !== 'night') fail('personal window missing period');
}

// personalHoraWindows must forward the real nextRise, not silently default to
// rise+86400000 — NEXT (RISE + 24.4h) differs from RISE + 24h by 0.4h = 1440000ms,
// well over any float-noise threshold, so a dropped nextRise is detectable.
const pwReal = personalHoraWindows(0, 0, RISE, SET, NEXT);
const lastReal = pwReal[pwReal.length - 1];
const pwDefaultish = (() => {
  // compute what the windows would look like if nextRise were silently
  // defaulted to RISE + 86400000 instead of the real NEXT we passed
  const wrongNext = RISE + 86400000;
  const out = [];
  for (const planet of aries)
    for (const w of horaWindowsForPlanet(planet, 0, RISE, SET, wrongNext))
      out.push({ planet, start: w.start, end: w.end, period: w.period });
  out.sort((a, b) => a.start - b.start);
  return out;
})();
const lastWrong = pwDefaultish[pwDefaultish.length - 1];
if (Math.abs(lastReal.end - lastWrong.end) < 1000)
  fail('personalHoraWindows last window end does not reflect the real nextRise — looks like it silently defaulted to rise+86400000');

// personal windows carry correct planet identity, not just correct timestamps:
// cross-check every window's ruler against horaWindowsForPlanet for that same
// planet at the same timestamps (guards a mislabel mutation slipping through
// on timestamp-only checks).
for (const w of pwReal) {
  const own = horaWindowsForPlanet(w.planet, 0, RISE, SET, NEXT);
  const match = own.some((o) => Math.abs(o.start - w.start) < 1 && Math.abs(o.end - w.end) < 1 && o.period === w.period);
  if (!match) fail('personal window planet/time/period does not match horaWindowsForPlanet for ' + w.planet);
}

// horaPersonalAusp (kept as a re-export alias in hora.ts) must still behave
// identically to trikonaLords.
const { horaPersonalAusp } = loadApp('src/engine/hora.ts');
if (horaPersonalAusp(0).join() !== trikonaLords(0).join()) fail('horaPersonalAusp alias should match trikonaLords(0)');
if (horaPersonalAusp(8).join() !== trikonaLords(8).join()) fail('horaPersonalAusp alias should match trikonaLords(8)');

// Task 8 review fix: horaResultText's "avoid" sentence used to say the
// favourable-for-the-activity planets were "not ideal", which inverts what
// res.planets means (they FAVOUR the activity — see analyzeHora). Pin the
// corrected wording: the English sentence must not claim the planets are
// unsuitable/not-ideal/bad for the activity, and both languages must produce
// non-empty text.
{
  const avoidRes = { status: 'answer', intent: 'avoid', planets: ['Moon'], act: { en: 'travel', hi: 'यात्रा' } };
  const avoidHr = horaResultText(avoidRes, null);
  if (!avoidHr || !avoidHr.text) fail('horaResultText should return text for an avoid-intent answer');
  else {
    const enLower = (avoidHr.text.en || '').toLowerCase();
    if (!enLower) fail('horaResultText avoid-intent English sentence should be non-empty');
    if (!avoidHr.text.hi) fail('horaResultText avoid-intent Hindi sentence should be non-empty');
    if (enLower.includes('not ideal') || enLower.includes('unsuitable') || enLower.includes('not suitable') || enLower.includes(' bad'))
      fail('horaResultText avoid-intent English sentence still claims the planets are unsuitable — this inverts what res.planets means: ' + avoidHr.text.en);
  }
}

if (failures) { console.error(`hora-adjudication: ${failures} failure(s)`); process.exit(1); }
console.log('hora-adjudication: PASS');
