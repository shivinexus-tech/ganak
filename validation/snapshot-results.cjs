'use strict';
/* Surfaces that only exist AFTER the reader acts — cast a chart, press Calculate.
   renderToStaticMarkup runs no effects and no handlers, so a screen snapshot sees
   only the empty form. Here we compose the REAL engine with the REAL display
   helpers at pinned inputs: the technique that actually caught the Shatabhisha
   leak by hand on 2026-08-09, now mechanical. */

const { freezeClock, FIXTURE } = require('./_snapshot-env.cjs');
freezeClock();

const { loadApp } = require('./_load-app.cjs');

function chartText(lang) {
  const { computeKundli } = loadApp('src/engine/kundli.ts');
  const { SIGNS, NAKSHATRAS } = loadApp('src/engine/panchang.ts');
  const { signLabel, panchangTerm, signShort, padaText, planetName, planetShort } = loadApp('src/i18n/panchang-terms.ts');

  const r = computeKundli({
    y: FIXTURE.y, m: FIXTURE.m, day: FIXTURE.day, hh: FIXTURE.hh, mi: FIXTURE.mi,
    tz: FIXTURE.tz, lat: FIXTURE.lat, lon: FIXTURE.lon, ayanamsa: FIXTURE.ayanamsa,
  });

  const lines = [
    `Lagna: ${signLabel(lang, SIGNS[r.ascSign])}`,
    `Moon sign: ${signLabel(lang, SIGNS[r.moon.sign])}`,
    `Sun sign: ${signLabel(lang, SIGNS[r.sun.sign])}`,
    `Janma Nakshatra: ${panchangTerm(lang, 'nakshatra', NAKSHATRAS[r.moon.nak])} ${padaText(lang, r.moon.pada)}`,
    `Ashtakavarga columns: ${[...Array(12)].map((_, i) => signShort(lang, i)).join(' ')}`,
    '--- planets ---',
  ];
  for (const p of r.rows) {
    lines.push(`${panchangTerm(lang, 'planet', p.name)} — ${signLabel(lang, SIGNS[p.sign])} · ${panchangTerm(lang, 'nakshatra', NAKSHATRAS[p.nak])}`);
  }

  /* B10, 2026-08-18. The KP lord columns and the dasha lords were missing from this
     mirror, and the KP tables only exist after a cast — so no baseline anywhere had
     ever seen them, and they printed "Venus" into a Hindi screen for as long as they
     had existed. Mirrored here so a regression shows up as a committed diff. */
  lines.push('--- KP lords (star · sub · sub-sub) ---');
  for (const p of r.rows) {
    lines.push(`${planetName(lang, p.name)} — ${planetName(lang, p.kp.starLord)} · ${planetName(lang, p.kp.subLord)} · ${planetName(lang, p.kp.subSub)}`);
  }
  lines.push('--- cuspal sub-lords ---');
  for (let h = 1; h <= 12; h += 1) {
    const sl = r.kpData.cuspSubLords[h];
    if (sl) lines.push(`${h}: ${planetName(lang, sl.starLord)} · ${planetName(lang, sl.subLord)} · ${planetName(lang, sl.subSub)}`);
  }
  const RP = r.rulingPlanets;
  lines.push(`Ruling planets: ${[RP.ascSignLord, RP.ascStarLord, RP.ascSubLord, RP.moonSignLord, RP.moonStarLord, RP.moonSubLord, RP.dayLord].map((pl) => planetName(lang, pl)).join(' · ')}`);
  lines.push(`Dasha lords: ${r.dashas.map((d) => planetName(lang, d.lord)).join(' · ')}`);

  /* YOGAS-HINDI-PARITY, 2026-08-18. The yogas panel had NO baseline anywhere — it
     exists only after a cast — so for months a Hindi reader got one generic sentence
     under every detected yoga while an English reader got a distinct interpretation
     each time, and nothing could see it. Mirrored here exactly as ChartScreen prints
     it, which is what puts the panel inside the positional en/hi content-parity check
     in screen-snapshots.cjs § 4: six distinct English meanings against one repeated
     Hindi sentence is now a failure, not an invisible product gap.

     The yoga NAME and the yoga TEXT go on separate lines on purpose. § 4 compares the
     two baselines line for line, so a name glued to the front of the meaning would make
     every line unique and the collapsed-meaning check would silently pass on a panel
     that was entirely generic underneath. Measured: with "name — text" on one line the
     reinstated generic sentence slipped past § 4; split, it is caught. */
  lines.push('--- classical yogas ---');
  for (const y of r.yogas) {
    lines.push(`yoga: ${lang === 'hi' ? y.nameHi : y.name} (${y.kind})`);
    lines.push(lang === 'hi' ? y.textHi : y.text);
  }
  lines.push(`Compact lord labels: ${r.dashas.map((d) => planetShort(lang, d.lord)).join(' ')}`);
  return lines.join('\n');
}

/* ---------------------------------------------------------------- match result
   The matching screen's committed baseline (validation/snapshots/matching.*.txt) is
   eleven lines long and contains no koota, no dosha and no score, because
   renderToStaticMarkup runs no handlers and therefore only ever sees the empty form.
   Every defect the 2026-08-18 bug bash found on this screen — two contradictory
   headline verdicts, a green "Very good match" above a standing Nadi dosha, eight
   identical Hindi rows, an ISO date inside a Hindi report — was invisible to it.

   So the single `useState(null)` slot that holds the result is seeded with a REAL
   computeMatch output at the pinned fixture and the screen is rendered for real. The
   interception matches on the initial value rather than on call order: `res` is the
   only slot in MatchMaker initialised to null, so this stays correct if the component
   gains or reorders state. Nothing is faked — the couple, the charts, the scores and
   every string come from the shipping engine and the shipping JSX. */
const MATCH_BOY = { y: 1985, m: 6, day: 1, hh: 9, mi: 30, tz: 5.5, lat: 28.61, lon: 77.21 };
const MATCH_GIRL = { y: 1985, m: 6, day: 1, hh: 14, mi: 15, tz: 5.5, lat: 19.08, lon: 72.88 };

function matchText(lang) {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { toText } = require('./_snapshot-render.cjs');
  const { C, card } = require('./_snapshot-env.cjs');
  const fs = require('fs');
  const path = require('path');
  const { ROOT } = require('./_load-app.cjs');

  const { computeKundli } = loadApp('src/engine/kundli.ts');
  const { computeMatch } = loadApp('src/engine/matching.ts');
  const result = computeMatch(computeKundli, MATCH_BOY, MATCH_GIRL);

  /* Screen and ComfortProvider must come from ONE bundle — esbuild inlines a fresh
     React context per bundle, exactly as _snapshot-render.cjs explains. */
  const tmpRel = `src/.snapshot-match-${process.pid}.tsx`;
  const tmpAbs = path.join(ROOT, tmpRel);
  fs.writeFileSync(tmpAbs,
    'export { ComfortProvider } from "./accessibility/ComfortProvider";\n' +
    'export { default as Screen } from "./screens/MatchingScreen";\n', 'utf8');
  let mod;
  try { mod = loadApp(tmpRel); } finally { try { fs.unlinkSync(tmpAbs); } catch { /* gone */ } }

  /* The form's own date/time slots are seeded to the SAME couple, and the "what this
     was computed from" slot to the real offsets, so the printed header in the baseline
     belongs to the scores underneath it. Without that the baseline would show the
     component's default births above a different couple's kootas — a record of
     something no reader ever sees. */
  const iso = (b) => `${b.y}-${String(b.m).padStart(2, '0')}-${String(b.day).padStart(2, '0')}`;
  const clock = (b) => `${String(b.hh).padStart(2, '0')}:${String(b.mi).padStart(2, '0')}`;
  const SEED = new Map([
    ['1990-04-12', iso(MATCH_BOY)], ['09:30', clock(MATCH_BOY)],
    ['1992-11-20', iso(MATCH_GIRL)], ['14:15', clock(MATCH_GIRL)],
  ]);
  const USED = {
    b: { label: 'New Delhi, India', tz: MATCH_BOY.tz, date: iso(MATCH_BOY), time: clock(MATCH_BOY) },
    g: { label: 'Mumbai, India', tz: MATCH_GIRL.tz, date: iso(MATCH_GIRL), time: clock(MATCH_GIRL) },
  };
  const realUseState = React.useState;
  React.useState = function seeded(init) {
    if (init === null) return [result, () => {}];
    if (init && typeof init === 'object' && 'b' in init && 'g' in init && init.b === null) return [USED, () => {}];
    if (typeof init === 'string' && SEED.has(init)) return [SEED.get(init), () => {}];
    return realUseState(init);
  };
  try {
    return toText(renderToStaticMarkup(React.createElement(mod.ComfortProvider, null,
      React.createElement(mod.Screen, { C, card, lang, computeKundli }))));
  } finally {
    React.useState = realUseState;
  }
}

function transitText(lang) {
  const { upcomingEvents } = loadApp('src/engine/panchang.ts');
  const { transitLabel } = loadApp('src/engine/transit-copy.ts');
  const from = require('./_snapshot-env.cjs').FIXED_NOW;
  return upcomingEvents(from, 120).map((e) => transitLabel(lang, e.label)).join('\n');
}

function generateResults() {
  const out = new Map();
  for (const lang of ['en', 'hi']) {
    out.set(`chart.${lang}`, chartText(lang));
    out.set(`transits.${lang}`, transitText(lang));
    out.set(`match-result.${lang}`, matchText(lang));
  }
  return out;
}

module.exports = { generateResults, chartText, transitText, matchText };
