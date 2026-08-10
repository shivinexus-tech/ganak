'use strict';
/* Deterministic inputs for screen snapshots (VERIFY-SNAPSHOTS, backlog #65).
   Spec: docs/superpowers/specs/2026-08-10-screen-snapshot-verification-design.md

   This project forbids golden files pinned to the real sky — see the header of
   validation/prashna-practitioner.cjs: a gate must "stay true as the sky moves".
   Freezing the CLOCK respects that rule rather than breaking it: the instant
   becomes a declared INPUT, so the sky it produces is reproducible instead of
   captured. Re-running next month yields the same bytes.

   freezeClock() must run BEFORE any app module is loaded — modules capture the
   Date binding at import time. */

const FIXED_NOW = 1786680000000; // 2026-08-10T06:00:00Z

const FIXTURE = {
  lat: 19.076, lon: 72.8777, tz: 5.5, zone: 'Asia/Kolkata',
  y: 1990, m: 6, day: 15, hh: 8, mi: 30, ayanamsa: 'lahiri',
};

const PLACE = {
  name: 'Mumbai, India',
  label: 'Mumbai, India',
  lat: FIXTURE.lat,
  lon: FIXTURE.lon,
  zone: FIXTURE.zone,
  tz: FIXTURE.tz,
};

/* Screens read colours off `C` by many different key names. Enumerating them per
   screen would be brittle and would silently drift; a proxy answers whatever each
   screen asks for. Colours are style values, never rendered text, so this cannot
   affect a text snapshot — and it is constant, so it cannot affect determinism. */
const C = new Proxy({}, { get: (_, key) => (typeof key === 'string' ? '#000000' : undefined) });
const card = {};

let frozen = false;
function freezeClock() {
  if (frozen) return;
  frozen = true;
  process.env.TZ = 'UTC';
  const RealDate = Date;
  class FrozenDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) super(FIXED_NOW);
      else super(...args);
    }
    static now() { return FIXED_NOW; }
  }
  global.Date = FrozenDate;
}

module.exports = { FIXED_NOW, FIXTURE, PLACE, C, card, freezeClock };
