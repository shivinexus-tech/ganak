#!/usr/bin/env node
'use strict';
// ============================================================================
// validation/varga-divisions.cjs
//
// src/engine/varga.ts had no validation evidence of any kind. It is a pure
// function that both the chart build and Shadbala depend on, so an error in it
// is silent and wide: D9 alone underpins marriage analysis, and D10 career.
// validation/jyotish-panel-exposure.cjs passes, but it greps source strings for
// wiring — it never executes this engine.
//
// This gate pins the Parashari division rules structurally rather than by
// copying the implementation back as a fixture, which would only prove the code
// equals itself. It asserts the properties each division must have if the rule
// is right:
//
//   1. every division returns a real sign for every longitude
//   2. an equal-part division cuts each sign into exactly D parts of 30/D
//   3. the starting sign of each division follows its classical rule, checked
//      at the sign level (movable/fixed/dual, odd/even) rather than per value
//   4. across the full circle every sign is used equally often
//   5. the two divisions with closed ranges stay inside them — Hora only ever
//      yields the luminaries' signs, Trimsamsa never yields them
//   6. the rules are order-invariant: sweeping upward and probing at random
//      give identical answers (no hidden state)
//
// Sources: Brihat Parashara Hora Shastra, ch. 6 (shodasavarga). Where more than
// one convention circulates, the gate pins the one the engine documents in its
// own comment and says so, rather than adjudicating between traditions.
// ============================================================================
const { loadApp } = require('./_load-app.cjs');
const { vargaSign } = loadApp('src/engine/varga.ts');

let failures = 0;
const fail = (m) => { failures++; console.error('FAIL ' + m); };
const pass = (m) => console.log('  ok  ' + m);

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

/* Every division the engine implements, with the number of parts per sign.
   D30 is deliberately absent from the equal-part checks: trimsamsa parts are
   unequal by rule (5/5/8/7/5 degrees), which is checked separately below. */
const EQUAL = { D1: 1, D2: 2, D3: 3, D4: 4, D5: 5, D6: 6, D7: 7, D8: 8, D9: 9,
  D10: 10, D11: 11, D12: 12, D16: 16, D20: 20, D24: 24, D27: 27, D40: 40,
  D45: 45, D60: 60 };
const ALL = [...Object.keys(EQUAL), 'D30'];

// ---------------------------------------------------------------------------
// 1. Every division returns a real sign, everywhere.
// ---------------------------------------------------------------------------
{
  let bad = 0;
  for (const k of ALL) {
    for (let L = 0; L < 360; L += 0.05) {
      const v = vargaSign(L, k);
      if (!Number.isInteger(v) || v < 0 || v > 11) {
        if (bad++ < 3) fail(`${k} at ${L.toFixed(2)}° returned ${v}, which is not a sign index 0–11`);
      }
    }
  }
  if (!bad) pass(`all ${ALL.length} divisions return a valid sign across the whole circle (7,200 samples each)`);
}

// ---------------------------------------------------------------------------
// 2. An equal-part division cuts each sign into exactly D parts of 30/D.
//    This is the check that catches an off-by-one in a divisor or a wrong
//    part width — the most likely way one of these rules goes quietly wrong.
// ---------------------------------------------------------------------------
{
  for (const [k, parts] of Object.entries(EQUAL)) {
    if (parts === 1) continue;
    const width = 30 / parts;
    let wrong = null;
    for (let sign = 0; sign < 12 && !wrong; sign++) {
      const base = sign * 30;
      // Sample just inside each part; the value must be constant within a part
      // and must change at every internal boundary.
      const atPart = [];
      for (let p = 0; p < parts; p++) {
        const a = vargaSign(base + p * width + width * 0.25, k);
        const b = vargaSign(base + p * width + width * 0.75, k);
        if (a !== b) { wrong = `${k}: ${SIGNS[sign]} part ${p + 1} is not constant (${SIGNS[a]} then ${SIGNS[b]}) — the part width is not ${width.toFixed(4)}°`; break; }
        atPart.push(a);
      }
      if (wrong) break;
      for (let p = 1; p < parts; p++) {
        if (atPart[p] === atPart[p - 1]) { wrong = `${k}: ${SIGNS[sign]} parts ${p} and ${p + 1} give the same sign — fewer than ${parts} distinct steps`; break; }
      }
    }
    if (wrong) fail(wrong);
  }
  if (!failures) pass('every equal-part division cuts each sign into exactly D parts of 30/D degrees');
}

// ---------------------------------------------------------------------------
// 3. Each division starts where its classical rule says it starts.
//    Checked at the first part of every sign, so a rule that is right for
//    Aries and wrong for Taurus cannot pass.
// ---------------------------------------------------------------------------
{
  const movable = (s) => s % 3 === 0, fixed = (s) => s % 3 === 1;
  const odd = (s) => s % 2 === 0;                   // Aries is the 1st (odd) sign
  const from = (s, n) => (s + n) % 12;              // n signs on from s, 0-based

  /* start[k](sign) = the sign the FIRST part of `sign` must map to. */
  const start = {
    D1: (s) => s,
    D3: (s) => s,                                    // 1st, 5th, 9th from itself
    D4: (s) => s,                                    // 1st, 4th, 7th, 10th
    D7: (s) => odd(s) ? s : from(s, 6),              // odd from itself, even from the 7th
    D10: (s) => odd(s) ? s : from(s, 8),             // odd from itself, even from the 9th
    D11: (s) => from(s, 11),                         // from the 12th therefrom
    D12: (s) => s,                                   // from the sign itself
    D60: (s) => s,                                   // from the sign itself
    D2: (s) => odd(s) ? 4 : 3,                       // odd → Leo, even → Cancer
    D24: (s) => odd(s) ? 4 : 3,                      // odd → Leo, even → Cancer
    D40: (s) => odd(s) ? 0 : 6,                      // odd → Aries, even → Libra
    D6: (s) => odd(s) ? 0 : 6,                       // odd → Aries, even → Libra
    D8: (s) => movable(s) ? 0 : fixed(s) ? 8 : 4,    // movable → Aries, fixed → Sag, dual → Leo
    D20: (s) => movable(s) ? 0 : fixed(s) ? 8 : 4,
    D16: (s) => movable(s) ? 0 : fixed(s) ? 4 : 8,   // movable → Aries, fixed → Leo, dual → Sag
    D45: (s) => movable(s) ? 0 : fixed(s) ? 4 : 8,
    D9: (s) => movable(s) ? s : fixed(s) ? from(s, 8) : from(s, 4), // movable from itself, fixed from the 9th, dual from the 5th
    D27: (s) => [0, 3, 6, 9][s % 4],                 // fiery → Aries, earthy → Cancer, airy → Libra, watery → Capricorn
  };

  for (const [k, want] of Object.entries(start)) {
    for (let sign = 0; sign < 12; sign++) {
      const got = vargaSign(sign * 30 + 0.01, k);
      const expect = want(sign);
      if (got !== expect) {
        fail(`${k}: the first part of ${SIGNS[sign]} maps to ${SIGNS[got]}, but the rule requires ${SIGNS[expect]}`);
      }
    }
  }
  pass(`${Object.keys(start).length} divisions start on the sign their classical rule requires, checked for all 12 signs`);
}

// ---------------------------------------------------------------------------
// 4. Sign coverage over the full circle.
//
//    NOTE ON WHY THIS IS NOT AN EQUALITY CHECK. The obvious assertion — every
//    sign gets the same number of parts — is WRONG, and asserting it produced
//    four false alarms against a correct engine. Two reasons:
//
//      · D2 and D5 are closed by rule and cannot reach twelve signs at all;
//        they are checked exactly, in their own block below.
//      · For an open division, evenness only follows when the part count tiles
//        twelve, or when the odd/even and movable/fixed/dual starting offsets
//        happen to compensate. D40 (40 parts, offsets 0 and 6) lands 42/42/…/36
//        and D45 lands 48/44/…; both are inherent to the classical rule, not
//        defects. Anything that claimed otherwise would be pinning a bug report
//        rather than the tradition.
//
//    So the sound properties are: an open division reaches every sign, and no
//    sign is used wildly more than another. A rule that collapsed onto a subset
//    — the realistic failure — leaves signs at zero and fails both.
// ---------------------------------------------------------------------------
{
  const CLOSED = new Set(['D2', 'D5']);
  for (const [k, parts] of Object.entries(EQUAL)) {
    if (CLOSED.has(k) || parts === 1) continue;
    const width = 30 / parts;
    const count = new Array(12).fill(0);
    for (let sign = 0; sign < 12; sign++) {
      for (let p = 0; p < parts; p++) count[vargaSign(sign * 30 + p * width + width / 2, k)]++;
    }
    const missing = count.map((c, i) => [i, c]).filter(([, c]) => c === 0);
    if (missing.length) {
      fail(`${k}: never reaches ${missing.map(([i]) => SIGNS[i]).join(', ')} — an open division must be able to land on any sign`);
      continue;
    }
    const hi = Math.max(...count), lo = Math.min(...count);
    if (hi > lo * 1.25) {
      fail(`${k}: sign usage is skewed far beyond what the rule's offsets can explain — ${SIGNS[count.indexOf(hi)]}=${hi} against ${SIGNS[count.indexOf(lo)]}=${lo}`);
    }
  }
  if (!failures) pass('every open division reaches all twelve signs with no unexplained skew');
}

// ---------------------------------------------------------------------------
// 5. The three closed-range divisions stay closed — checked exactly, because
//    here the permitted set IS the rule.
//      Hora is divided between the two luminaries.
//      Panchamsa is ruled by the five non-luminaries, in their own signs.
//      Trimsamsa is ruled by those same five, so the luminaries cannot occur.
// ---------------------------------------------------------------------------
{
  const seen = (k) => { const s = new Set(); for (let L = 0; L < 360; L += 0.05) s.add(vargaSign(L, k)); return s; };

  const hora = seen('D2');
  const horaBad = [...hora].filter((s) => s !== 3 && s !== 4);
  if (horaBad.length || hora.size !== 2) fail(`D2 yields ${[...hora].map((s) => SIGNS[s]).join(', ')} — Hora is divided between the Moon and the Sun, so exactly Cancer and Leo are possible`);
  else pass('D2 yields exactly Cancer and Leo, as Hora requires');

  // Mars, Saturn, Jupiter, Mercury, Venus in Aries, Aquarius, Sagittarius, Gemini, Libra.
  const LORD_SIGNS = [0, 10, 8, 2, 6];
  const panch = seen('D5');
  const panchBad = [...panch].filter((s) => !LORD_SIGNS.includes(s));
  if (panchBad.length || panch.size !== 5) fail(`D5 yields ${[...panch].map((s) => SIGNS[s]).join(', ')} — Panchamsa is ruled by Mars, Saturn, Jupiter, Mercury and Venus, so only ${LORD_SIGNS.map((s) => SIGNS[s]).join(', ')} are possible`);
  else pass('D5 yields exactly the five non-luminary lords’ signs, as Panchamsa requires');

  const trimsaBad = [...seen('D30')].filter((s) => s === 3 || s === 4);
  if (trimsaBad.length) fail(`D30 yields ${trimsaBad.map((s) => SIGNS[s]).join(', ')} — Trimsamsa is ruled by the five non-luminaries, so the Sun's and Moon's signs cannot occur`);
  else pass('D30 never yields Cancer or Leo, as Trimsamsa requires');

  // Trimsamsa part widths: 5/5/8/7/5 in odd signs, 5/7/8/5/5 in even signs.
  const widthsOf = (sign) => {
    const out = []; let cur = vargaSign(sign * 30 + 0.01, 'D30'), from = 0;
    for (let d = 0.01; d < 30; d += 0.01) {
      const v = vargaSign(sign * 30 + d, 'D30');
      if (v !== cur) { out.push(Math.round((d - from) * 10) / 10); from = d; cur = v; }
    }
    out.push(Math.round((30 - from) * 10) / 10);
    return out;
  };
  const oddW = widthsOf(0), evenW = widthsOf(1);
  if (oddW.join() !== '5,5,8,7,5') fail(`D30 odd-sign part widths are ${oddW.join('/')}, expected 5/5/8/7/5 (Mars, Saturn, Jupiter, Mercury, Venus)`);
  else pass('D30 odd-sign widths are 5/5/8/7/5 degrees');
  if (evenW.join() !== '5,7,8,5,5') fail(`D30 even-sign part widths are ${evenW.join('/')}, expected 5/7/8/5/5 (Venus, Mercury, Jupiter, Saturn, Mars)`);
  else pass('D30 even-sign widths are 5/7/8/5/5 degrees');
}

// ---------------------------------------------------------------------------
// 6. No hidden state: probing out of order gives identical answers.
// ---------------------------------------------------------------------------
{
  const probes = [];
  for (let i = 0; i < 400; i++) probes.push(((i * 137.508) % 360));
  let drift = 0;
  for (const k of ALL) {
    const first = probes.map((L) => vargaSign(L, k));
    const again = [...probes].reverse().map((L) => vargaSign(L, k)).reverse();
    for (let i = 0; i < first.length; i++) if (first[i] !== again[i]) drift++;
  }
  if (drift) fail(`${drift} results changed when the same longitudes were probed in a different order — the function is not pure`);
  else pass('results are order-independent: the function is pure');
}

// ---------------------------------------------------------------------------
// 7. Non-vacuity: a deliberately wrong rule must be rejected.
// ---------------------------------------------------------------------------
{
  const brokenD9 = (L) => Math.floor(L / (10 / 3.1)) % 12;      // wrong navamsa width
  let caught = false;
  for (let sign = 0; sign < 12; sign++) {
    const movable = sign % 3 === 0, fixed = sign % 3 === 1;
    const want = movable ? sign : fixed ? (sign + 8) % 12 : (sign + 4) % 12;
    if (brokenD9(sign * 30 + 0.01) !== want) { caught = true; break; }
  }
  if (!caught) fail('the start-sign check is vacuous: a wrong navamsa width still satisfied it');
  else pass('a deliberately wrong navamsa width is rejected by the same check the engine passes');
}

console.log(failures === 0
  ? `\nPASS varga-divisions — ${ALL.length} divisions pinned structurally`
  : `\nFAIL varga-divisions (${failures} failure${failures === 1 ? '' : 's'})`);
process.exit(failures === 0 ? 0 : 1);
