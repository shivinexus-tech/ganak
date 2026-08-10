#!/usr/bin/env node
'use strict';
const { loadApp } = require('./_load-app.cjs');
const { subtractWindows, adjudicate, dominantChoghadiya, nextCleanWindow } = loadApp('src/engine/hora-verdict.ts');
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

if (failures) { console.error(`hora-adjudication: ${failures} failure(s)`); process.exit(1); }
console.log('hora-adjudication: PASS');
