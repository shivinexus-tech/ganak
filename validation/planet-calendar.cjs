#!/usr/bin/env node
'use strict';
/* Planetary calendar gate — retrograde/direct stations and combustion (asta/udaya)
   for the five star planets. Pins 2026 anchors against known ephemeris behaviour. */
const assert = require('node:assert');
const { loadApp } = require('./_load-app.cjs');
const pc = loadApp('src/engine/planet-calendar.ts');

const from = Date.UTC(2026, 0, 1), to = Date.UTC(2027, 0, 1);
const STAR = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

// ---- retrograde/direct ----
const retro = pc.retrogradeEvents(from, to);
assert(retro.every((e) => STAR.includes(e.planet) && typeof e.retro === 'boolean' && e.t >= from && e.t <= to), 'retro event shape/range invalid');
assert(retro.every((e, i) => i === 0 || e.t >= retro[i - 1].t), 'retro events must be chronological');
assert.strictEqual(retro.length, 12, '2026 must have 12 station events for the five star planets');
const mercR = retro.filter((e) => e.planet === 'Mercury' && e.retro);
assert.strictEqual(mercR.length, 3, 'Mercury retrogrades three times in 2026');
// first Mercury retrograde ~2026-02-26 (±3 days)
const d = new Date(mercR[0].t).toISOString().slice(0, 10);
assert(Math.abs(mercR[0].t - Date.UTC(2026, 1, 26)) < 3 * 86400000, `Mercury first 2026 retro anchor drifted (got ${d})`);
// each planet's stations must alternate R,D,R,D…
for (const p of STAR) {
  const seq = retro.filter((e) => e.planet === p);
  assert(seq.every((e, i) => i === 0 || e.retro !== seq[i - 1].retro), `${p} stations must alternate retrograde/direct`);
}

// ---- combustion ----
const comb = pc.combustionEvents(from, to);
assert(comb.every((e) => STAR.includes(e.planet) && typeof e.set === 'boolean' && e.orb > 0), 'combustion event shape invalid');
assert(comb.every((e, i) => i === 0 || e.t >= comb[i - 1].t), 'combustion events must be chronological');
assert(comb.length >= 12, 'expected multiple combustion set/rise events across the year');
for (const p of STAR) {
  const seq = comb.filter((e) => e.planet === p);
  assert(seq.every((e, i) => i === 0 || e.set !== seq[i - 1].set), `${p} combustion must alternate set/rise`);
}

// ---- states at a moment ----
const now = pc.planetStatesAt(Date.UTC(2026, 6, 1));
assert.strictEqual(now.length, 5, 'planetStatesAt must cover the five star planets');
assert(now.every((s) => typeof s.retro === 'boolean' && typeof s.combust === 'boolean' && s.sep >= 0 && s.sep <= 180), 'state shape invalid');

console.log('planet-calendar.cjs OK — 12 station events (Mercury R×3, Feb-26 anchor), combustion alternation, states');
