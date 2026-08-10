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
  const { signLabel, panchangTerm, signShort } = loadApp('src/i18n/panchang-terms.ts');

  const r = computeKundli({
    y: FIXTURE.y, m: FIXTURE.m, day: FIXTURE.day, hh: FIXTURE.hh, mi: FIXTURE.mi,
    tz: FIXTURE.tz, lat: FIXTURE.lat, lon: FIXTURE.lon, ayanamsa: FIXTURE.ayanamsa,
  });

  const lines = [
    `Lagna: ${signLabel(lang, SIGNS[r.ascSign])}`,
    `Moon sign: ${signLabel(lang, SIGNS[r.moon.sign])}`,
    `Sun sign: ${signLabel(lang, SIGNS[r.sun.sign])}`,
    `Janma Nakshatra: ${panchangTerm(lang, 'nakshatra', NAKSHATRAS[r.moon.nak])} pada ${r.moon.pada}`,
    `Ashtakavarga columns: ${[...Array(12)].map((_, i) => signShort(lang, i)).join(' ')}`,
    '--- planets ---',
  ];
  for (const p of r.rows) {
    lines.push(`${panchangTerm(lang, 'planet', p.name)} — ${signLabel(lang, SIGNS[p.sign])} · ${panchangTerm(lang, 'nakshatra', NAKSHATRAS[p.nak])}`);
  }
  return lines.join('\n');
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
  }
  return out;
}

module.exports = { generateResults, chartText, transitText };
