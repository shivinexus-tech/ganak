#!/usr/bin/env node
'use strict';
const { loadApp } = require('./_load-app.cjs');
const { subtractWindows, adjudicate, dominantChoghadiya } = loadApp('src/engine/hora-verdict.ts');
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

// partial: straddles the start of rahu
v = adjudicate(W(0, 100), CTX({ rahu: W(60, 200) }));
if (v.status !== 'partial') fail('straddling window should be partial');
if (v.usable.length !== 1 || v.usable[0].end !== 60) fail('partial remainder should end at the rahu start');

// R2: remainders under 3 minutes are discarded
const MIN = 3 * 60000;
v = adjudicate(W(0, MIN - 60000), CTX({ rahu: W(MIN - 60000, 10 * MIN) }));
if (v.status !== 'blocked') fail('a sub-3-minute remainder should be discarded');
v = adjudicate(W(0, MIN + 60000), CTX({ rahu: W(MIN + 60000, 10 * MIN) }));
if (v.status !== 'clean') fail('a 4-minute window should survive');

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

if (failures) { console.error(`hora-adjudication: ${failures} failure(s)`); process.exit(1); }
console.log('hora-adjudication: PASS');
