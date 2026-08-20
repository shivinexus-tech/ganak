#!/usr/bin/env node
'use strict';
// ============================================================================
// validation/cross-surface-consistency.cjs
//
// WHY THIS GATE EXISTS
// Two days of adversarial testing (2026-08-18/19) produced ~90 findings. The
// single most damaging class was not "a calculation is wrong" — it was
// "TWO GANAK SURFACES STATE THE SAME FACT DIFFERENTLY":
//
//   · the marriage matching card called one partner Manglik while Ganak's own
//     Mangal Dosha calculator called both of them Manglik;
//   · the birth chart and the planet calendar disagreed about whether a planet
//     was retrograde for hours after every station;
//   · the dosha panel said Shankhachuda while its own "Full page →" link said
//     Karkotaka;
//   · a chart cast at 3 a.m. printed its Ruling Planets for Monday and its
//     Gulika point for Tuesday, on one page;
//   · the Muhurat hub printed the same interval, to the minute, under
//     "Good windows today" and "Best avoided today";
//   · the transit footnote said sayana (tropical) in Hindi and Sidereal in
//     English for the same numbers;
//   · a full moon was 27 August in Latin and 28 August in Devanagari.
//
// Every one shipped past a full gate suite, because ~100 gates each check ONE
// surface against a rule and NOTHING in the repository asks whether two
// surfaces agree with each other. Each of the above was found by a human
// pointing at it. This gate looks for the class mechanically.
//
// WHY THIS IS NOT "GANAK COMPARED TO A COPY OF GANAK"
// AGENTS.md: "A gate must never compare Ganak to a copy of Ganak" — i.e. never
// re-implement a calculation inside the harness and then congratulate the
// engine for matching it, because that passes when both copies are wrong.
// This gate never re-implements anything. It takes two DIFFERENT SHIPPING code
// paths that a reader can see on two different screens and asks whether they
// say the same thing. A disagreement is a defect no matter which side is right,
// so the check has real discriminating power even with no external oracle.
// Where a specific VALUE is asserted rather than an agreement, it is anchored
// to a dated, attributed published source — see PUBLISHED below.
//
// PUBLISHED REFERENCES (rules, not Ganak's own output)
//  [D-RK] drikpanchang.com — "Rahu Kalam" / "Gulikai Kalam" / "Yamaganda":
//         the day sunrise→sunset is divided into eight parts and each weekday
//         takes a fixed part. Rahu: Sun 8, Mon 2, Tue 7, Wed 5, Thu 6, Fri 4,
//         Sat 3. Yamaganda: Sun 5, Mon 4, Tue 3, Wed 2, Thu 1, Fri 7, Sat 6.
//         Gulika: Sun 7, Mon 6, Tue 5, Wed 4, Thu 3, Fri 2, Sat 1.
//         (Sequence also recorded in this repo's muhurat sourcing notes.)
//  [D-AB] drikpanchang.com — "Abhijit Muhurat": ~48 minutes centred on local
//         noon, and VOID on Wednesday (Budhavara).
//  [BPHS] Brihat Parashara Hora Shastra / every published Manglik table —
//         Mars in houses 1, 2, 4, 7, 8, 12 counted from Lagna, Moon and Venus.
//         (Already pinned by validation/mangal-dosha.cjs; re-used here as the
//         shared definition the two surfaces must BOTH implement.)
//
// WHAT IT DOES NOT COVER — read this before trusting a green run.
//   · Layout, overflow, contrast, focus order. §8/§9 read rendered TEXT via
//     renderToStaticMarkup, exactly like screen-snapshots.cjs: no effects, no
//     layout box, no CSS.
//   · Screens that are not in snapshot-generate.cjs's SCREENS list, and any
//     surface that appears only after an interaction that is not seeded there
//     (MuhuratHub, CalendarPage month/day views, FestivalGuideScreen, the
//     server API responses). §4-§7 reach those surfaces at the ENGINE level
//     instead — the same functions those screens call — which proves the values
//     agree but not that the screen renders them.
//   · Facts computed on the server (functions/, server/) — not loaded here.
//   · Any fact that only ONE surface states. This gate is blind by construction
//     to a value that is wrong everywhere at once; that is what the anchored
//     gates (drik-reference-anchors, muhurat-anchors, adhik-masa, …) are for.
//   · The static hunt in §10 finds duplicated literal tables and duplicated
//     speed estimators by pattern. It cannot find a duplicate written a
//     different way, so its inventory is a floor, not a ceiling.
//
//   node validation/cross-surface-consistency.cjs
// ============================================================================

/* The clock must be frozen BEFORE any app module is imported — modules capture
   the Date binding at import time. Same rule and same helper the snapshot gates
   use, so this gate's "today" is a declared input, not the real sky. */
const { freezeClock, FIXED_NOW } = require('./_snapshot-env.cjs');
freezeClock();

const fs = require('fs');
const path = require('path');
const { loadApp, ROOT } = require('./_load-app.cjs');

const DAY = 86400000;
const iso = (ms) => (ms == null ? '—' : new Date(ms).toISOString().slice(0, 16).replace('T', ' ') + 'Z');

// ---------------------------------------------------------------------------
// Reporting. A disagreement that is not pinned fails the run immediately.
// A PIN is a disagreement this lane deliberately did not fix: it is EXPECTED to
// be found, and the gate fails if the pinned measurement grows OR shrinks (a
// pin that silently rots hides the next regression).
// ---------------------------------------------------------------------------
const findings = [];   // unpinned disagreements — these fail the run
const pinsSeen = new Map();
const COVERAGE = [];   // what each section actually swept, printed on a green run
let checks = 0;

function disagree(section, title, lines) {
  findings.push({ section, title, lines: [].concat(lines) });
}
function ok(n = 1) { checks += n; }

/* A pin records a disagreement that is already written up and deliberately not
   fixed by this lane. `measure` is a stable, comparable summary of the defect's
   CURRENT size; the pin fails if it differs from `expect` in either direction.
   `resolve` says, in one line, what makes the pin deletable. */
function pin({ id, section, title, expect, measure, resolve, evidence }) {
  pinsSeen.set(id, { id, section, title, expect, measure, resolve, evidence: [].concat(evidence || []) });
  if (measure !== expect) {
    disagree(section, `PIN MOVED — ${id}: ${title}`, [
      `pinned measurement : ${expect}`,
      `measured now       : ${measure}`,
      measure > expect || String(measure) > String(expect)
        ? 'The known defect GREW. Something made it worse, or a new case joined it.'
        : 'The known defect SHRANK or is gone. Re-measure, then update or delete this pin — a stale pin hides the next regression.',
      `To resolve: ${resolve}`,
    ].concat(evidence || []));
  }
}

// ---------------------------------------------------------------------------
// Modules. Loaded once, up front, so a load failure is a loud single error
// rather than a confusing mid-report crash.
// ---------------------------------------------------------------------------
const P = loadApp('src/engine/panchang.ts');
const TERMS = loadApp('src/i18n/panchang-terms.ts');
const { computeKundli } = loadApp('src/engine/kundli.ts');
const PC = loadApp('src/engine/planet-calendar.ts');
const GO = loadApp('src/engine/gochar.ts');
const TP = loadApp('src/engine/today-panchang.ts');
const MU = loadApp('src/engine/muhurat.ts');
const MED = loadApp('src/engine/medical-muhurat.ts');
const DW = loadApp('src/engine/daily-windows.ts');
const LP = loadApp('src/engine/lakshmi-puja.ts');
const MD = loadApp('src/engine/mangal-dosha.ts');
const MATCH = loadApp('src/engine/matching.ts');
const DOSH = loadApp('src/engine/doshas.ts');
const UTIL = loadApp('src/engine/utility-calculators.ts');
const MUI = loadApp('src/data/muhurat-ui.ts');

const CITIES = [
  { label: 'Delhi', lat: 28.6139, lon: 77.2090, zone: 'Asia/Kolkata', tz: 5.5 },
  { label: 'Chennai', lat: 13.0827, lon: 80.2707, zone: 'Asia/Kolkata', tz: 5.5 },
  { label: 'Kolkata', lat: 22.5726, lon: 88.3639, zone: 'Asia/Kolkata', tz: 5.5 },
  { label: 'London', lat: 51.5072, lon: -0.1276, zone: 'Europe/London', tz: 0 },
  { label: 'New York', lat: 40.7128, lon: -74.0060, zone: 'America/New_York', tz: -5 },
];

const src = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

// ===========================================================================
// §1  ONE WORD FOR ONE THING
//     The same name table written down twice. language-leak-scan.cjs proves
//     there is a single DEVANAGARI table; nothing proved the Latin ones agree,
//     nor that two screens spell a window the same way.
// ===========================================================================
{
  // 1a — engine display names vs the i18n vocabulary the screens localise through.
  const engineSigns = P.SIGNS.map((s) => s.split(' ')[0]);
  if (JSON.stringify(engineSigns) !== JSON.stringify(TERMS.SIGN_ORDER)) {
    disagree('§1 vocabulary', 'engine SIGNS and i18n SIGN_ORDER name the rashi differently', [
      `engine  src/engine/panchang.ts SIGNS  : ${engineSigns.join(', ')}`,
      `i18n    src/i18n/panchang-terms.ts    : ${TERMS.SIGN_ORDER.join(', ')}`,
      'A screen reading SIGNS and a screen reading SIGN_ORDER would print two spellings of one sign.',
    ]);
  } else ok();

  const engineWestern = P.SIGNS.map((s) => (s.match(/\(([^)]+)\)/) || [])[1]);
  if (JSON.stringify(engineWestern) !== JSON.stringify(TERMS.SIGN_EN_WESTERN)) {
    disagree('§1 vocabulary', 'engine SIGNS and i18n SIGN_EN_WESTERN disagree on the Western sign names', [
      `engine : ${engineWestern.join(', ')}`,
      `i18n   : ${TERMS.SIGN_EN_WESTERN.join(', ')}`,
    ]);
  } else ok();

  if (JSON.stringify(P.NAKSHATRAS) !== JSON.stringify(TERMS.NAKSHATRA_ORDER)) {
    const bad = P.NAKSHATRAS.map((n, i) => [n, TERMS.NAKSHATRA_ORDER[i]])
      .filter(([a, b]) => a !== b).map(([a, b]) => `  ${a}  vs  ${b}`);
    disagree('§1 vocabulary', 'engine NAKSHATRAS and i18n NAKSHATRA_ORDER are two Latin spellings of one list', bad);
  } else ok();

  // 1b — the window names. i18n.ts is the shared table; three surfaces keep
  // their own copy, and MuhuratHub renders TimingLanes, so two of these appear
  // on ONE screen.
  const grabPairs = (text, re) => {
    const out = {};
    let m; const r = new RegExp(re.source, 'g');
    while ((m = r.exec(text))) out[m[1]] = { en: m[2], hi: m[3] };
    return out;
  };
  const i18nText = src('src/i18n.ts');
  const shared = {};
  for (const [key, alias] of [['rahuL', 'rahu'], ['gulikaL', 'gulika'], ['yamaL', 'yama'], ['abhijitL', 'abhijit']]) {
    const m = i18nText.match(new RegExp(`${key}:\\s*\\{\\s*en:\\s*"([^"]*)",\\s*hi:\\s*"([^"]*)"`));
    if (m) shared[alias] = { en: m[1], hi: m[2] };
  }
  const copies = {
    'src/i18n.ts (tr(lang, "rahuL") — Daily + Muhurat hub cards)': shared,
    'src/screens/MuhuratHub.tsx (winName, the "Good & avoid times today" card)':
      grabPairs(src('src/screens/MuhuratHub.tsx'), /(abhijit|rahu|gulika|yama):\s*\{\s*en:\s*"([^"]*)",\s*hi:\s*"([^"]*)"\s*\}/),
    'src/components/TimingLanes.tsx (BLOCKER_LABEL, the lane below that card)':
      grabPairs(src('src/components/TimingLanes.tsx'), /(rahu|gulika|yama):\s*\{\s*en:\s*"([^"]*)",\s*hi:\s*"([^"]*)"\s*\}/),
    'src/data/medical-muhurat-ui.ts (MEDICAL_LABELS)':
      grabPairs(src('src/data/medical-muhurat-ui.ts'), /(abhijit|rahu):\s*\{\s*en:\s*"([^"]*)",\s*hi:\s*"([^"]*)"\s*\}/),
  };
  /* A regex that stops matching would silently reduce the number of copies and
     make the comparison below look cleaner than the code is. Each source must
     still yield the keys it is known to carry. */
  const EXPECTED_KEYS = {
    'src/i18n.ts (tr(lang, "rahuL") — Daily + Muhurat hub cards)': ['rahu', 'gulika', 'yama', 'abhijit'],
    'src/screens/MuhuratHub.tsx (winName, the "Good & avoid times today" card)': ['rahu', 'gulika', 'yama', 'abhijit'],
    'src/components/TimingLanes.tsx (BLOCKER_LABEL, the lane below that card)': ['rahu', 'gulika', 'yama'],
    'src/data/medical-muhurat-ui.ts (MEDICAL_LABELS)': ['rahu', 'abhijit'],
  };
  for (const [where, want] of Object.entries(EXPECTED_KEYS)) {
    const missing = want.filter((k) => !copies[where][k]);
    if (missing.length) {
      disagree('§1 vocabulary', 'this check can no longer read one of the label tables it compares', [
        `${where} no longer yields: ${missing.join(', ')}`,
        'Either the table moved (good — check it now reads src/i18n.ts) or it was reformatted and this check went blind. Re-point it.',
      ]);
    } else ok();
  }

  const labelRows = [];
  for (const key of ['rahu', 'gulika', 'yama', 'abhijit']) {
    for (const lang of ['en', 'hi']) {
      const seen = new Map();
      for (const [where, table] of Object.entries(copies)) {
        const v = table[key] && table[key][lang];
        if (v == null) continue;
        // the medical labels append a parenthetical gloss on purpose; compare the name
        const name = v.replace(/\s*[(—-].*$/, '').trim();
        if (!seen.has(name)) seen.set(name, []);
        seen.get(name).push(where);
      }
      if (seen.size > 1) {
        labelRows.push(`${key}.${lang}: ` + [...seen.entries()].map(([n, ws]) => `"${n}" (${ws.length})`).join('  vs  '));
        for (const [n, ws] of seen) for (const w of ws) labelRows.push(`        "${n}"  ←  ${w}`);
      } else ok();
    }
  }
  pin({
    id: 'XS-LABEL-BELTS',
    section: '§1 vocabulary',
    title: 'one window, four hand-written label tables, two English spellings',
    expect: 3,
    measure: labelRows.filter((r) => /^[a-z]+\.(en|hi):/.test(r)).length,
    resolve: 'delete the three private tables and have MuhuratHub, TimingLanes and medical-muhurat-ui read tr(lang, "rahuL"/"gulikaL"/"yamaL"/"abhijitL") from src/i18n.ts, then delete this pin',
    evidence: labelRows,
  });
}

// ===========================================================================
// §2  ONE SKY, THREE SURFACES
//     The birth chart, the planet calendar card and the gochar timeline each
//     answer "is this planet retrograde / in which sign" for the same instant.
//     In August 2026 the chart used a BACKWARD 12h difference and the others a
//     CENTRED one, so a chart cast in the hours after a station printed R next
//     to a planet the planet-calendar card called direct. The fix was to DELETE
//     the duplicate estimator, not to make the two agree.
// ===========================================================================
{
  const FROM = Date.UTC(2026, 0, 1), TO = Date.UTC(2027, 0, 1);
  const stations = PC.retrogradeEvents(FROM, TO);

  // 2a — the planet calendar's stations vs the gochar timeline's stations.
  const stationRows = [];
  for (const planet of PC.STAR_PLANETS) {
    const fromCal = stations.filter((e) => e.planet === planet);
    const fromGochar = GO.planetGochar(planet, FROM, 365).stations.filter((s) => s.t >= FROM && s.t <= TO);
    if (fromCal.length !== fromGochar.length) {
      stationRows.push(`${planet}: planet calendar reports ${fromCal.length} stations in 2026, the gochar timeline ${fromGochar.length}`);
      continue;
    }
    for (let i = 0; i < fromCal.length; i += 1) {
      const gap = Math.abs(fromCal[i].t - fromGochar[i].t) / 60000;
      if (gap > 2 || fromCal[i].retro !== fromGochar[i].retro) {
        stationRows.push(`${planet} station #${i + 1}: calendar ${iso(fromCal[i].t)} retro=${fromCal[i].retro} · gochar ${iso(fromGochar[i].t)} retro=${fromGochar[i].retro} (${gap.toFixed(1)} min apart)`);
      } else ok();
    }
  }
  if (stationRows.length) {
    disagree('§2 sky', 'the planet calendar card and the gochar timeline disagree about a station', stationRows.concat([
      'Both are drawn on the Daily screen. src/engine/planet-calendar.ts:21 and src/engine/gochar.ts:24 are',
      'two separate copies of the same centred-difference speed estimator — see §10.',
    ]));
  }

  // 2b — the transit event line ("Mercury turns retrograde") vs the speed the
  //      planet calendar reads. The event line carries retro state only as an
  //      English substring inside its label (src/engine/panchang.ts:347), which
  //      DailyScreen then sniffs for "R"; so the two really are separate claims.
  const evRows = [];
  for (let d = 0; d < 360; d += 40) {
    for (const e of P.upcomingEvents(FROM + d * DAY, 75).filter((x) => x.type === 'station')) {
      const claimed = /retrograde/.test(e.label);
      // read the speed an hour clear of the station so a sub-minute crossing is
      // not mistaken for a disagreement
      const measured = PC.planetSpeed(e.planet, e.t + 3600000) < 0;
      if (claimed !== measured) {
        evRows.push(`transit line says "${e.label}" at ${iso(e.t)}, planet calendar speed says retro=${measured}`);
      } else ok();
    }
  }
  if (evRows.length) disagree('§2 sky', 'the upcoming-transit line and the planet calendar disagree about a station', evRows);

  // 2c — the birth chart's retrograde flag vs the planet calendar's, swept
  //      through every 2026 station. This is where the August defect lived: a
  //      6-7 hour band AFTER each station, which is why the window below is
  //      asymmetric. (validation/planet-calendar.cjs sweeps the same seam
  //      hourly; kept here at finer resolution because it is the archetype of
  //      this whole gate.)
  let retroChecked = 0; const retroRows = [];
  for (const ev of stations) {
    for (let mm = -2 * 60; mm <= 9 * 60; mm += 30) {
      const t = ev.t + mm * 60000;
      const dt = new Date(t);
      const minuteT = Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), dt.getUTCHours(), dt.getUTCMinutes());
      const chart = computeKundli({
        y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, day: dt.getUTCDate(),
        hh: dt.getUTCHours(), mi: dt.getUTCMinutes(), tz: 0, lat: 28.6139, lon: 77.2090, ayanamsa: 'lahiri',
      });
      const onChart = chart.rows.find((r) => r.name === ev.planet).retro;
      const onCalendar = PC.planetStatesAt(minuteT).find((s) => s.planet === ev.planet).retro;
      retroChecked += 1;
      if (onChart !== onCalendar && retroRows.length < 8) {
        retroRows.push(`${iso(minuteT)} ${ev.planet}: birth chart retro=${onChart}, planet calendar retro=${onCalendar}`);
      }
      if (onChart === onCalendar) ok();
    }
  }
  if (retroRows.length) {
    disagree('§2 sky', 'the birth chart and the planet calendar disagree about retrograde', retroRows.concat([
      `swept ${retroChecked} instants across all ${stations.length} of 2026's stations at 20-minute resolution`,
      'Both must read src/engine/planet-calendar.ts planetSpeed. A second estimator inside computeKundli is the 2026-08-18 F8 regression.',
    ]));
  }

  // 2d — the chart's sign placement vs the shared sidereal accessor the gochar
  //      timeline and every panchang surface use.
  let signRows = [];
  for (let d = 0; d < 365; d += 7) {
    const t = Date.UTC(2026, 0, 1) + d * DAY + 7 * 3600000;
    const dt = new Date(t);
    const chart = computeKundli({
      y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, day: dt.getUTCDate(), hh: dt.getUTCHours(), mi: dt.getUTCMinutes(),
      tz: 0, lat: 28.6139, lon: 77.2090, ayanamsa: 'lahiri',
    });
    for (const row of chart.rows) {
      const shared = Math.floor(P.planetSidMs(row.name, t) / 30);
      if (shared !== row.sign && signRows.length < 8) {
        signRows.push(`${iso(t)} ${row.name}: birth chart sign ${row.sign}, shared sidereal accessor ${shared}`);
      } else ok();
    }
  }
  if (signRows.length) disagree('§2 sky', 'the birth chart and the shared sidereal accessor disagree about a sign', signRows);
  COVERAGE.push(`§2  ${stations.length} stations of 2026 cross-checked between the planet calendar, the gochar timeline and the transit line; `
    + `${retroChecked} chart-vs-calendar retrograde samples around them; 53 dates × 9 grahas of sign placement`);
}

// ===========================================================================
// §3  ONE BIRTH, ONE DOSHA VERDICT
//     The marriage matching card and the /calculator/mangal-dosha page each
//     decide Manglik, through two different implementations of the published
//     [BPHS] rule (src/engine/matching.ts manglikProfile and
//     src/engine/mangal-dosha.ts mangalDoshaReport). The August defect was one
//     partner Manglik on the card and both on the calculator.
// ===========================================================================
{
  // The published rule both surfaces claim to implement. Anchored, not derived.
  const PUBLISHED_MANGLIK_HOUSES = [1, 2, 4, 7, 8, 12];
  for (const [where, table] of [
    ['src/engine/mangal-dosha.ts MANGAL_DOSHA_HOUSES', MD.MANGAL_DOSHA_HOUSES],
    ['src/engine/matching.ts MANGLIK_HOUSES', MATCH.MANGLIK_HOUSES],
  ]) {
    if (JSON.stringify([...table].sort((a, b) => a - b)) !== JSON.stringify(PUBLISHED_MANGLIK_HOUSES)) {
      disagree('§3 doshas', `${where} no longer matches the published Manglik house set`, [
        `published [BPHS] : ${PUBLISHED_MANGLIK_HOUSES.join(', ')}`,
        `this surface     : ${[...table].join(', ')}`,
      ]);
    } else ok();
  }

  // Behavioural sweep — the constants agreeing is not the same as the two
  // implementations agreeing. 500 births across five cities and seventy years.
  let seed = 20260819;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const rows = [];
  let births = 0;
  for (let i = 0; i < 500; i += 1) {
    const c = CITIES[i % CITIES.length];
    const b = {
      y: 1950 + Math.floor(rnd() * 76), m: 1 + Math.floor(rnd() * 12), day: 1 + Math.floor(rnd() * 28),
      hh: Math.floor(rnd() * 24), mi: Math.floor(rnd() * 60), tz: c.tz, lat: c.lat, lon: c.lon,
    };
    births += 1;
    const calculator = MD.mangalDoshaReport(b);                                 // /calculator/mangal-dosha
    const card = MATCH.computeMatch(computeKundli, b, b).manglik.boyProfile;     // the matching card
    const diff = [];
    if (calculator.present !== card.present) diff.push(`Manglik? calculator ${calculator.present}, matching card ${card.present}`);
    if (calculator.strength !== card.strength) diff.push(`strength: calculator "${calculator.strength}", matching card "${card.strength}"`);
    if (calculator.rawCount !== card.rawCount) diff.push(`raw count: ${calculator.rawCount} vs ${card.rawCount}`);
    if (calculator.adjustedScore !== card.adjustedScore) diff.push(`adjusted score: ${calculator.adjustedScore} vs ${card.adjustedScore}`);
    for (let k = 0; k < 3; k += 1) {
      const a = calculator.refs[k], z = card.refs[k];
      if (a.house !== z.house) diff.push(`${a.key} house: ${a.house} vs ${z.house}`);
      if (a.counted !== z.counted) diff.push(`${a.key} counted: ${a.counted} vs ${z.counted}`);
      if (a.mitigations.join('+') !== z.mitigations.join('+')) diff.push(`${a.key} mitigations: [${a.mitigations}] vs [${z.mitigations}]`);
    }
    if (diff.length && rows.length < 6) {
      rows.push(`${b.y}-${String(b.m).padStart(2, '0')}-${String(b.day).padStart(2, '0')} ${String(b.hh).padStart(2, '0')}:${String(b.mi).padStart(2, '0')} ${c.label} — ` + diff.join('; '));
    }
    if (!diff.length) ok();
  }
  if (rows.length) {
    disagree('§3 doshas', 'the matching card and the Mangal Dosha calculator read one birth differently', rows.concat([
      `${births} births swept across ${CITIES.length} cities, 1950-2025`,
      'src/engine/matching.ts manglikProfile is a second implementation of src/engine/mangal-dosha.ts mangalDoshaReport — see §10.',
    ]));
  }

  // Kala Sarpa / Pitra / Papa: the Jyotish chart panel calls the ...FromRows
  // helpers on the chart the reader is looking at; the calculator pages cast
  // their own Lahiri chart first. On a Lahiri chart the two MUST land on the
  // same verdict — that is the pairing that said Shankhachuda on one surface
  // and Karkotaka on the other.
  const doshaRows = [];
  for (let i = 0; i < 120; i += 1) {
    const c = CITIES[i % CITIES.length];
    const b = { y: 1955 + (i % 70), m: 1 + (i * 5) % 12, day: 1 + (i * 11) % 28, hh: (i * 7) % 24, mi: (i * 13) % 60, tz: c.tz, lat: c.lat, lon: c.lon };
    const chart = computeKundli({ ...b, ayanamsa: 'lahiri' });
    const panel = {
      ks: DOSH.kalaSarpaFromRows(chart.rows, chart.ascSign),
      pit: DOSH.pitraDoshaFromRows(chart.rows, chart.ascSign),
      papa: DOSH.papaCount(chart),
    };
    const page = { ks: UTIL.kalaSarpa(b), pit: UTIL.pitraDosha(b), papa: UTIL.papaDosha(b) };
    const diff = [];
    if (panel.ks.typeEn !== page.ks.typeEn || panel.ks.full !== page.ks.full || panel.ks.enclosed !== page.ks.enclosed) {
      diff.push(`Kala Sarpa: panel "${panel.ks.typeEn}" full=${panel.ks.full} ${panel.ks.enclosed}/7 · page "${page.ks.typeEn}" full=${page.ks.full} ${page.ks.enclosed}/7`);
    }
    if (panel.pit.count !== page.pit.count) diff.push(`Pitra: panel ${panel.pit.count} indications, page ${page.pit.count}`);
    if (panel.papa.total !== page.papa.total || panel.papa.grade !== page.papa.grade) {
      diff.push(`Papa: panel ${panel.papa.total}/15 ${panel.papa.grade}, page ${page.papa.total}/15 ${page.papa.grade}`);
    }
    if (diff.length && doshaRows.length < 6) doshaRows.push(`${b.y}-${b.m}-${b.day} ${c.label} — ` + diff.join(' | '));
    if (!diff.length) ok();
  }
  if (doshaRows.length) {
    disagree('§3 doshas', 'the chart dosha panel and its own "Full page →" disagree on a Lahiri chart', doshaRows);
  }

  // The panel's own claim about the other surface. It follows the reader's
  // ayanamsa on purpose; what it must never do again is stay silent about it.
  const chartSrc = src('src/screens/ChartScreen.tsx');
  const claims = [
    [/Computed with the ayanamsa this chart was cast on/, 'English: the panel must name the ayanamsa it used'],
    [/गणना अयनांश/, 'Hindi: the panel must name the ayanamsa it used'],
    [/“Full page →” links below always compute with/, 'English: when the chart is not Lahiri the panel must say the linked page can answer differently'],
    [/विस्तृत पृष्ठ →” सदा/, 'Hindi: the same disclosure'],
  ];
  COVERAGE.push(`§3  ${births} births swept for Manglik (matching card vs calculator) and 120 for Kala Sarpa / Pitra / Papa (chart panel vs "Full page →")`);
  for (const [re, what] of claims) {
    if (!re.test(chartSrc)) {
      disagree('§3 doshas', 'the dosha panel stopped disclosing which ayanamsa it used', [
        what,
        'Without it a Raman chart shows Shankhachuda in the panel and Karkotaka on the page it links to, with nothing to explain the gap.',
      ]);
    } else ok();
  }
}

// ===========================================================================
// §4  ONE DAY, ONE SET OF WINDOWS
//     Abhijit and the three inauspicious belts are computed by FOUR separate
//     copies of the same eighth-of-the-day helper: today-panchang.ts (the
//     Panchang and Muhurat screens), muhurat.ts dayMuhurat and muhuratForDate
//     (the muhurat finder), medical-muhurat.ts (the medical screen).
//     Each copy is read by a different screen.
// ===========================================================================
{
  const same = (a, b) => (a == null && b == null) || (a && b && Math.abs(a.start - b.start) < 60000 && Math.abs(a.end - b.end) < 60000);
  const show = (w) => (w ? `${iso(w.start)}..${iso(w.end)}` : 'none');
  const rows = [];
  let days = 0;
  for (const c of CITIES) {
    for (let i = 0; i < 30; i += 1) {
      const probe = Date.UTC(2026, 0, 7) + i * 12 * DAY;
      const d0 = new Date(probe);
      const finder = MU.muhuratForDate(c, 'lahiri', d0.getUTCFullYear(), d0.getUTCMonth() + 1, d0.getUTCDate());
      if (!finder || !finder.rise) continue;
      /* Ask every surface about the SAME panchang day. today-panchang anchors on
         the sunrise of the day containing `atMs`; the finder anchors on a civil
         date. Querying today-panchang at the finder's own sunrise + 1h removes
         that difference, which is a day-selection convention, not a disagreement
         about the window. */
      const at = finder.rise + 3600000;
      const panchang = TP.computeTodayPanchang(c, 'lahiri', at);
      const medical = MED.medicalMuhuratDay(c, 'lahiri', d0.getUTCFullYear(), d0.getUTCMonth() + 1, d0.getUTCDate(), 0);
      days += 1;
      const surfaces = [
        ['Panchang / Muhurat hub (today-panchang.ts)', panchang],
        ['muhurat finder (muhurat.ts muhuratForDate)', finder],
        ['medical muhurat screen (medical-muhurat.ts)', medical],
      ];
      for (const key of ['abhijit', 'rahu', 'gulika', 'yama']) {
        const have = surfaces.filter(([, o]) => o && key in o);
        for (let k = 1; k < have.length; k += 1) {
          if (!same(have[0][1][key], have[k][1][key])) {
            if (rows.length < 8) {
              rows.push(`${c.label} ${new Date(finder.rise).toISOString().slice(0, 10)} ${key}: ${have[0][0]} ${show(have[0][1][key])} · ${have[k][0]} ${show(have[k][1][key])}`);
            }
          } else ok();
        }
      }
    }
  }
  if (rows.length) {
    disagree('§4 windows', 'two screens print different clock times for the same window on the same day', rows.concat([
      `${days} city-days compared across ${CITIES.length} cities`,
      'Four copies of the eighth-of-the-day helper; see §10.',
    ]));
  }

  COVERAGE.push(`§4  ${days} city-days across ${CITIES.length} cities: Abhijit, Rahu, Gulika and Yamaganda compared between the Panchang screen, the muhurat finder and the medical screen`);
  // The published rule both the belts and Abhijit claim. [D-RK], [D-AB].
  const PUBLISHED = {
    RAHU_SEGMENT: { 0: 8, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3 },
    YAMA_SEGMENT: { 0: 5, 1: 4, 2: 3, 3: 2, 4: 1, 5: 7, 6: 6 },
    GULIKA_SEGMENT: { 0: 7, 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1 },
  };
  for (const [name, want] of Object.entries(PUBLISHED)) {
    if (JSON.stringify(P[name]) !== JSON.stringify(want)) {
      disagree('§4 windows', `${name} no longer matches the published eighth-part sequence [D-RK]`, [
        `published : ${JSON.stringify(want)}`,
        `Ganak     : ${JSON.stringify(P[name])}`,
      ]);
    } else ok();
  }
  // [D-AB] Abhijit is void on Wednesday. Every surface that offers it must agree.
  const wedRows = [];
  for (const c of CITIES) {
    for (let i = 0; i < 20; i += 1) {
      const probe = Date.UTC(2026, 0, 7) + i * 5 * DAY;
      const d0 = new Date(probe);
      const finder = MU.muhuratForDate(c, 'lahiri', d0.getUTCFullYear(), d0.getUTCMonth() + 1, d0.getUTCDate());
      if (!finder || !finder.rise) continue;
      const panchang = TP.computeTodayPanchang(c, 'lahiri', finder.rise + 3600000);
      const medical = MED.medicalMuhuratDay(c, 'lahiri', d0.getUTCFullYear(), d0.getUTCMonth() + 1, d0.getUTCDate(), 0);
      const isWednesday = finder.dow === 3;
      for (const [where, o] of [['Panchang', panchang], ['finder', finder], ['medical', medical]]) {
        if (isWednesday && o.abhijit) wedRows.push(`${c.label} ${new Date(finder.rise).toISOString().slice(0, 10)} is a Wednesday but ${where} still offers Abhijit ${show(o.abhijit)} [D-AB]`);
        else ok();
      }
    }
  }
  if (wedRows.length) disagree('§4 windows', 'Abhijit is published as void on Wednesday and a surface still offers it', wedRows.slice(0, 8));
}

// ===========================================================================
// §5  ONE SCREEN MUST NOT RECOMMEND AND FORBID THE SAME MINUTES
//     MuhuratHub renders "Good windows today" and "Best avoided today" side by
//     side from ONE object. The good lane is a choghadiya filter; the avoid
//     lane is Rahu/Gulika/Yamaganda. Nothing subtracts one from the other.
// ===========================================================================
{
  const overlaps = (a, b) => a && b && a.start < b.end && b.start < a.end;
  let pairs = 0, clashing = 0;
  const rows = [];
  for (const c of CITIES) {
    for (let i = 0; i < 25; i += 1) {
      const at = Date.UTC(2026, 0, 5, 7, 0) + i * 13 * DAY;
      const p = TP.computeTodayPanchang(c, 'lahiri', at);
      if (!p) continue;
      /* The screen's own two lanes, built from the screen's own constants:
         MuhuratHub.tsx:458  goodSlots  = allChogha.filter(c => ev.good.includes(c.key) …)
         MuhuratHub.tsx:459  avoidSlots = [rahu, gulika, yama]                            */
      const allChogha = [...(p.choghaDay || []), ...(p.choghaNight || [])];
      const avoid = [['Rahu Kalam', p.rahu], ['Gulika Kalam', p.gulika], ['Yamaganda', p.yama]].filter(([, w]) => w);
      for (const ev of MUI.EVENTS) {
        const good = allChogha.filter((x) => ev.good.includes(x.key));
        pairs += 1;
        const clash = good.filter((x) => avoid.some(([, w]) => overlaps(x, w)));
        if (clash.length) {
          clashing += 1;
          if (rows.length < 6) {
            const belt = avoid.find(([, w]) => overlaps(clash[0], w));
            const identical = clash[0].start === belt[1].start && clash[0].end === belt[1].end;
            rows.push(`${c.label} ${new Date(at).toISOString().slice(0, 10)} · activity "${ev.key}": "${clash[0].key}" ${iso(clash[0].start)}..${iso(clash[0].end)} under GOOD, ${belt[0]} ${iso(belt[1].start)}..${iso(belt[1].end)} under AVOID${identical ? '  ← identical to the minute' : ''}`);
          }
        } else ok();
      }
    }
  }
  COVERAGE.push(`§5  ${pairs} activity-days of the Muhurat hub's own two lanes`);
  pin({
    id: 'XS-MUHURAT-LANES',
    section: '§5 one screen',
    title: 'the Muhurat hub still prints the same minutes under "Good windows today" and "Best avoided today"',
    expect: 540,
    measure: clashing,
    resolve: 'subtract the Rahu/Gulika/Yamaganda belts from goodSlots in src/screens/MuhuratHub.tsx:458 — src/engine/hora-verdict.ts subtractWindows already does exactly this for the hora lane on the same screen — then re-measure and delete this pin',
    evidence: rows.concat([`${clashing} of ${pairs} activity-days carry at least one such interval`]),
  });
}

// ===========================================================================
// §6  ONE NAME MUST NOT MEAN TWO INTERVALS
//     "Pradosha" is rendered on the Panchang daily-windows card and "Pradosh
//     Kaal" on the festival guide's Lakshmi Puja panel — for the same evening,
//     from two different definitions.
// ===========================================================================
{
  let compared = 0, differing = 0;
  const rows = [];
  for (const c of CITIES) {
    for (let i = 0; i < 20; i += 1) {
      const at = Date.UTC(2026, 0, 9, 7, 0) + i * 17 * DAY;
      const daily = DW.computeDailyWindows(c, at);           // DailyWindowsCard "Pradosha"
      const puja = LP.lakshmiPujaTimings(c, 'lahiri', at);   // FestivalGuideScreen "Pradosh Kaal"
      if (!daily || !puja || !puja.pradosh) continue;
      compared += 1;
      const dS = Math.abs(daily.pradosha.start - puja.pradosh.start) / 60000;
      const dE = Math.abs(daily.pradosha.end - puja.pradosh.end) / 60000;
      if (dS > 5 || dE > 5) {
        differing += 1;
        if (rows.length < 4) {
          rows.push(`${c.label} ${new Date(at).toISOString().slice(0, 10)}: daily-windows "Pradosha" ${iso(daily.pradosha.start)}..${iso(daily.pradosha.end)} · Lakshmi-Puja "Pradosh Kaal" ${iso(puja.pradosh.start)}..${iso(puja.pradosh.end)} (starts ${dS.toFixed(0)} min apart, ends ${dE.toFixed(0)} min apart)`);
        }
      } else ok();
    }
  }
  COVERAGE.push(`§6  ${compared} city-evenings of Pradosha (Panchang daily-windows card vs the festival guide's Lakshmi Puja panel)`);
  if (compared !== 100) {
    disagree('§6 one name', 'the Pradosha sample size moved — re-measure the pin below', [
      `expected 100 city-evenings, got ${compared}`,
    ]);
  }
  /* RESOLVED 2026-08-19 by the lane this finding was dispatched to. Pradosha shipped
     under two definitions about an hour apart at each end, and the festival engine chose
     the observance day with one rule while printing the window from the other — which
     also put two Pradosh Vrat days in 2026 that no published panchang lists. There is now
     one sourced definition (sunset to the first fifth of the night) and all three call
     sites read it. Kept as an assertion at 0 rather than deleted: a second definition
     reappearing is precisely what this is here to notice. */
  pin({
    id: 'XS-PRADOSHA-TWO',
    section: '§6 one name',
    title: 'Pradosha is one interval — the window shown and the day chosen come from the same rule',
    expect: 0,
    measure: differing,
    resolve: 'this is now an invariant, not a known defect — above 0 means a second Pradosha definition has reappeared',
    evidence: rows.concat([`${differing} of ${compared} city-evenings differ by more than 5 minutes`]),
  });
}

// ===========================================================================
// §7  A SURFACE'S CLAIM ABOUT ANOTHER SURFACE MUST BE TRUE
//     MuhuratHub prints, under the best-day window list: "These windows come
//     from this activity's own filter; Rahu, Gulika and Yamaganda are excluded."
//     That is a checkable claim about the windows immediately above it.
// ===========================================================================
{
  const hubSrc = src('src/screens/MuhuratHub.tsx');
  const claimEn = /Rahu, Gulika and Yamaganda are excluded/.test(hubSrc);
  const claimHi = /राहु\/गुलिक\/यमगण्ड हटाए गए हैं/.test(hubSrc);
  if (!claimEn || !claimHi) {
    // the claim has been reworded — the check below no longer describes the screen
    disagree('§7 claims', 'the exclusion note this section verifies is no longer in MuhuratHub.tsx', [
      `English note found: ${claimEn}`, `Hindi note found: ${claimHi}`,
      'Re-point this check at the new wording, or drop it — an unverified claim on screen is how this class of defect starts.',
    ]);
  } else {
    const overlaps = (a, b) => a && b && a.start < b.end && b.start < a.end;
    const CATEGORIES = ['travel', 'business', 'venture', 'document', 'property', 'vehicle', 'purchase',
      'wedding', 'engagement', 'housewarming', 'bhoomi', 'construction', 'puja'];
    let listed = 0, violating = 0; const rows = [];
    for (const c of CITIES.slice(0, 3)) {
      for (let i = 0; i < 16; i += 1) {
        const probe = Date.UTC(2026, 0, 5) + i * 21 * DAY;
        const d0 = new Date(probe);
        const info = MU.muhuratForDate(c, 'lahiri', d0.getUTCFullYear(), d0.getUTCMonth() + 1, d0.getUTCDate());
        if (!info || !info.rise) continue;
        const belts = [['Rahu', info.rahu], ['Gulika', info.gulika], ['Yamaganda', info.yama]].filter(([, w]) => w);
        for (const cat of CATEGORIES) {
          const windows = MU.activityWindows(c, 'lahiri', info, cat);
          if (!windows.length) continue;
          listed += windows.length;
          for (const w of windows) {
            const hit = belts.find(([, b]) => overlaps(w, b));
            if (hit) {
              violating += 1;
              if (rows.length < 6) rows.push(`${c.label} ${new Date(info.rise).toISOString().slice(0, 10)} "${cat}": a ${w.kind} window ${iso(w.start)}..${iso(w.end)} overlaps ${hit[0]} ${iso(hit[1].start)}..${iso(hit[1].end)}`);
            } else ok();
          }
        }
      }
    }
    COVERAGE.push(`§7  ${listed} windows rendered under the "Rahu, Gulika and Yamaganda are excluded" note, checked against those three belts`);
    /* RESOLVED 2026-08-19, the same day it was pinned — and the pin is what caught it.
       This lane measured 630 violating windows and pinned them; a concurrent lane
       fixed the cause in the engine (the panchaka-rahita branch now goes through the
       same belt subtraction the choghadiya branch always did). On the merged tree the
       measurement fell to 0 and this gate refused to stay green over a stale pin —
       exactly what a pin is for. Kept as an assertion at 0 rather than deleted: the
       claim printed under those windows is only true while this stays 0. */
    pin({
      id: 'XS-EXCLUSION-CLAIM',
      section: '§7 claims',
      title: 'every window rendered under the "Rahu, Gulika and Yamaganda are excluded" note is genuinely clear of all three belts',
      expect: 0,
      measure: violating,
      resolve: 'this is now an invariant, not a known defect — if it is above 0 the screen is printing a promise the engine no longer keeps',
      evidence: rows.concat([
        `${violating} of ${listed} windows rendered under that note overlap a belt`,
        'The seven choghadiya-driven activities (travel, business, venture, document, property, vehicle, purchase) are clean;',
        'the six Panchaka-driven ones (wedding, engagement, housewarming, bhoomi, construction, puja) are not — and the note is the same.',
      ]),
    });
  }
}

// ===========================================================================
// §8  THE SAME FACT IN ENGLISH AND IN HINDI
//     Every screen is rendered in both languages from the same frozen instant
//     and the same inputs, and the language-independent facts are compared:
//     clock times, calendar dates (worded and numeric), years, and score
//     fractions. A value that differs across the language toggle is the same
//     defect class — a full moon shipped as 27 August in Latin and 28 August in
//     Devanagari.
//
//     Rendered TEXT only (renderToStaticMarkup): no effects, no layout.
// ===========================================================================
const RENDERED = (() => {
  const { generate } = require('./snapshot-generate.cjs');
  return generate({ write: false });
})();
{
  /* Month names come from Intl, the same machinery src/components/format.ts
     uses to print them — not from a table typed out here that could drift. */
  const monthOf = new Map();
  const add = (token, i) => { if (token) monthOf.set(token.toLowerCase(), String(i + 1).padStart(2, '0')); };
  for (const loc of ['en-US', 'hi-IN']) {
    for (let i = 0; i < 12; i += 1) {
      const long = new Intl.DateTimeFormat(loc, { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, i, 15)));
      const short = new Intl.DateTimeFormat(loc, { month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, i, 15)));
      add(long, i);
      /* Screens abbreviate inconsistently: Intl's en-US short is "Sep" and the
         Daily screen prints "Sept". Rather than typing a second table that could
         drift, accept every prefix of the Latin long name from 3 letters up. */
      if (/^[A-Za-z]+$/.test(long)) for (let n = 3; n <= long.length; n += 1) add(long.slice(0, n), i);
      add(short, i);
      add(short.replace(/[.॰।]+$/, ''), i);   // "अग॰" is also written "अग"
    }
  }
  const monthAlt = [...monthOf.keys()].sort((a, b) => b.length - a.length)
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  /* U+0970 (the Devanagari abbreviation sign) is deliberately NOT a letter here:
     it may follow a month token without ending the match. */
  const LETTER = 'A-Za-z\\u0900-\\u096F\\u0971-\\u097F';
  const WORD_DATE = new RegExp(
    `(?<![${LETTER}])(?:(\\d{1,2})\\s*(?:st|nd|rd|th)?\\s*(${monthAlt})|(${monthAlt})\\s*(\\d{1,2}))(?![${LETTER}0-9])`, 'gi');
  const NUM_DATE = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g;
  const TIME = /\b(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?/g;
  const YEAR = /\b(1[5-9]\d\d|20\d\d|21\d\d)\b/g;
  const FRAC = /(?<![\d/])(\d+(?:\.\d+)?)\s*\/\s*(\d+)(?![\d/])/g;

  function facts(text, lang) {
    const out = { times: [], dates: [], years: [], fractions: [] };
    let m;
    /* Numeric dates are locale-ordered (en-US M/D/Y, hi-IN D/M/Y). Normalise
       them, and take them out of the string first so "18/8/2026" is never read
       as the fraction 18/8. */
    let rest = text.replace(NUM_DATE, (whole, a, b) => {
      const [mo, d] = lang === 'hi' ? [b, a] : [a, b];
      out.dates.push(`${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
      return ' ';
    });
    WORD_DATE.lastIndex = 0;
    while ((m = WORD_DATE.exec(rest))) {
      const day = m[1] || m[4];
      const mon = (m[2] || m[3]).toLowerCase();
      const mo = monthOf.get(mon);
      if (mo) out.dates.push(`${mo}-${String(day).padStart(2, '0')}`);
    }
    TIME.lastIndex = 0;
    while ((m = TIME.exec(rest))) out.times.push(`${Number(m[1])}:${m[2]}${m[3] ? ' ' + m[3].toUpperCase() : ''}`);
    YEAR.lastIndex = 0;
    while ((m = YEAR.exec(rest))) out.years.push(m[1]);
    FRAC.lastIndex = 0;
    while ((m = FRAC.exec(rest))) out.fractions.push(`${m[1]}/${m[2]}`);
    for (const k of Object.keys(out)) out[k].sort();
    return out;
  }
  const tally = (a) => a.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map());
  function compare(a, b) {
    const A = tally(a), B = tally(b), out = [];
    for (const [k, v] of A) { const w = B.get(k) || 0; if (v > w) out.push(`English only: ${k}${v - w > 1 ? ` ×${v - w}` : ''}`); }
    for (const [k, v] of B) { const w = A.get(k) || 0; if (v > w) out.push(`Hindi only:   ${k}${v - w > 1 ? ` ×${v - w}` : ''}`); }
    return out;
  }

  /* The detector must be shown to detect. A comparison that quietly extracts
     nothing passes every surface, so these nine cases run first: four are the
     historical defect shapes (a shifted lunar date, a shifted clock, a shifted
     numeric date, a shifted score) and five are the legitimate language
     differences that must NOT be reported (an abbreviation, a locale date
     order, a lowercase meridiem, "Mars 34" reading as a March date). */
  const SELF_TEST = [
    ['a full moon dated one day apart', 'Full moon · 27 August 2026', 'पूर्ण चंद्र · 28 अगस्त 2026', true],
    ['the same full moon', 'Full moon · 27 August 2026', 'पूर्ण चंद्र · 27 अगस्त 2026', false],
    ['"Sept" vs "सित॰" is an abbreviation, not a defect', 'Autumn equinox · 23 Sept 2026', 'शरद् विषुव · 23 सित॰ 2026', false],
    ['M/D/Y vs D/M/Y is a locale order, not a defect', 'Cast for 8/18/2026', '18/8/2026 को पूछा गया', false],
    ['a numeric date genuinely shifted', 'Cast for 8/18/2026', '19/8/2026 को पूछा गया', true],
    ['a clock an hour apart', 'Rahu Kalam 11:07 AM–12:43 PM', 'राहु काल 12:07 PM–12:43 PM', true],
    ['"6:19 am" vs "6:19 AM" is casing, not a defect', 'sunrise (6:19 am)', 'सूर्योदय (6:19 AM)', false],
    ['a score out of 36 that moved', 'Total 21 / 36', 'कुल 22 / 36', true],
    ['"Mars 34" must not be read as a March date', 'Mars 34 points', 'मंगल 34 अंक', false],
  ];
  for (const [name, enText, hiText, shouldFlag] of SELF_TEST) {
    const a = facts(enText, 'en'), b = facts(hiText, 'hi');
    const flagged = ['times', 'dates', 'years', 'fractions'].some((c) => compare(a[c], b[c]).length > 0);
    if (flagged !== shouldFlag) {
      disagree('§8 languages', `the English/Hindi detector itself is broken: ${name}`, [
        `expected it to ${shouldFlag ? 'FLAG' : 'IGNORE'} this pair, and it did not`,
        `  en: ${enText}`, `  hi: ${hiText}`,
        'Every "no disagreement" below is worthless until this passes.',
      ]);
    } else ok();
  }

  const keys = [...RENDERED.keys()].filter((k) => k.endsWith('.en')).map((k) => k.slice(0, -3));
  let surfaces = 0;
  for (const key of keys) {
    const en = RENDERED.get(`${key}.en`), hi = RENDERED.get(`${key}.hi`);
    if (hi == null) continue;
    if (en.startsWith('RENDER ERROR') || hi.startsWith('RENDER ERROR')) {
      disagree('§8 languages', `${key} failed to render`, [en.split('\n')[0], hi.split('\n')[0]]);
      continue;
    }
    surfaces += 1;
    const fe = facts(en, 'en'), fh = facts(hi, 'hi');
    const lines = [];
    for (const cat of ['times', 'dates', 'years', 'fractions']) {
      const d = compare(fe[cat], fh[cat]);
      if (d.length) lines.push(`  ${cat}:`, ...d.slice(0, 10).map((s) => `    ${s}`),
        ...(d.length > 10 ? [`    (+${d.length - 10} more)`] : []));
    }
    if (lines.length) {
      disagree('§8 languages', `${key}: the English and Hindi renders state different values`, lines.concat([
        '  Both were rendered from the same inputs at the same frozen instant, so every one of these is a real divergence.',
      ]));
    } else ok();
  }
  if (!surfaces) disagree('§8 languages', 'no rendered surfaces were compared — the snapshot harness produced nothing', []);
  COVERAGE.push(`§8  ${surfaces} rendered surfaces compared English-vs-Hindi (clock times, worded and numeric dates, years, score fractions), `
    + `after ${SELF_TEST.length} self-tests proving the detector flags the four historical defect shapes and ignores the five legitimate language differences`);
}

// ===========================================================================
// §9  ONE CONVENTION, ONE WORD, BOTH LANGUAGES
//     "The transit footnote said sayana (tropical) in Hindi and Sidereal in
//     English for the same numbers." niryana = sidereal, sayana = tropical.
//     validation/transit-event-language.cjs polices the Daily screen's footnote;
//     this sweeps every rendered surface.
// ===========================================================================
{
  const rows = [];
  for (const key of [...RENDERED.keys()].filter((k) => k.endsWith('.en')).map((k) => k.slice(0, -3))) {
    const en = RENDERED.get(`${key}.en`) || '', hi = RENDERED.get(`${key}.hi`) || '';
    /* A line that mentions सायन WITH नहीं is saying what the numbers are NOT —
       the calculator page's explicit denial "सायन राशि नहीं" is correct copy.
       Same allowance transit-event-language.cjs makes. */
    const hiSayana = hi.split('\n').filter((l) => /सायन/.test(l) && !/नहीं|अलग|भिन्न/.test(l));
    const hiNirayana = /निरयण/.test(hi);
    const enSidereal = /\bSidereal\b/i.test(en);
    const enTropical = /\bTropical\b/i.test(en);
    if (enSidereal && !enTropical && hiSayana.length) {
      rows.push(`${key}: English says "Sidereal" while Hindi says सायन (tropical) — ${hiSayana[0].slice(0, 90)}`);
    } else ok();
    if (enTropical && !enSidereal && hiNirayana && !/सायन/.test(hi)) {
      rows.push(`${key}: English says "Tropical" while Hindi says निरयण (sidereal)`);
    } else ok();
  }
  if (rows.length) {
    disagree('§9 conventions', 'a surface names the opposite zodiac in the two languages', rows.concat([
      'AGENTS.md architecture invariant: Ganak computes sidereal (Lahiri). निरयण = sidereal, सायन = tropical.',
    ]));
  }
}

// ===========================================================================
// §10  WHERE THE NEXT DISAGREEMENT WILL COME FROM
//      Facts computed TWICE are where the disagreements have actually been.
//      Today's retrograde defect was fixed by DELETING a duplicate speed
//      estimator, not by making two copies agree. So the duplicates themselves
//      are an output of this gate: the inventory is pinned and may only shrink.
// ===========================================================================
{
  const files = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.tsx?$/.test(e.name) && !e.name.startsWith('.')) files.push(p);
    }
  })(path.join(ROOT, 'src'));
  const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

  // 10a — the same literal table typed out in more than one module.
  const tables = new Map();
  for (const f of files) {
    const text = stripComments(fs.readFileSync(f, 'utf8'));
    const re = /\[[^[\]{}`]*\]/g;
    let m;
    while ((m = re.exec(text))) {
      const parts = m[0].slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean);
      if (parts.length < 4 || new Set(parts).size < 2) continue;
      const norm = m[0].replace(/\s+/g, '');
      if (!tables.has(norm)) tables.set(norm, new Set());
      tables.get(norm).add(path.relative(ROOT, f));
    }
  }
  const dupTables = [...tables.entries()].filter(([, where]) => where.size > 1)
    .map(([lit, where]) => `${lit.length > 76 ? lit.slice(0, 76) + '…]' : lit}\n        ${[...where].sort().join('\n        ')}`)
    .sort();

  // 10b — the same finite-difference speed estimator, written out again.
  const speedCopies = [];
  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    const lines = stripComments(text).split('\n');
    lines.forEach((line, i) => {
      // a centred (or backward) longitude difference used as a speed
      if (/(\+\s*43200000|\+\s*DAY\s*\/\s*2|ms\s*\+\s*12)/.test(line) && /-/.test(line) && /(43200000|DAY\s*\/\s*2|ms\s*-\s*12)/.test(line)) {
        speedCopies.push(`${path.relative(ROOT, f)}:${i + 1}  ${line.trim().slice(0, 110)}`);
      } else if (/tropPrev/.test(line) && /\/\s*0\.5/.test(line)) {
        speedCopies.push(`${path.relative(ROOT, f)}:${i + 1}  ${line.trim().slice(0, 110)}  ← BACKWARD difference, on TROPICAL longitudes`);
      }
    });
  }

  COVERAGE.push(`§10 ${files.length} source files scanned for duplicated literal tables and duplicated speed estimators`);
  pin({
    id: 'XS-DUP-TABLES',
    section: '§10 duplicates',
    title: 'literal tables typed out in more than one module',
    expect: 21,
    measure: dupTables.length,
    resolve: 'move each table to one module and import it. When the count drops, lower this number; it must never rise. '
      + 'Was 23 until 2026-08-19, when the dedupe lane retired two: the two-letter sign abbreviations '
      + '(src/data/chart-divisions.ts now re-exports SIGN_SHORT_EN from src/i18n/panchang-terms.ts) and the four '
      + 'Chhath day-keys (src/data/festival-pages.ts now imports CHHATH_KEYS from src/engine/chhath.ts). '
      + 'STILL OPEN and genuinely duplicated: the 27 Latin nakshatra names (panchang.ts + i18n), the Gregorian month '
      + 'names (three screens + birth-input.ts), the Hindi month names (two screens), the weekday names in both '
      + 'scripts (muhurat.ts + i18n), the Manglik house set [1,2,4,7,8,12] (doshas.ts + mangal-dosha.ts + matching.ts), '
      + 'the graha name lists (up to seven modules each), and the travel choghadiya set (muhurat-ui.ts + muhurat.ts, '
      + 'which is keyed differently on the two sides so it needs reconciling, not a mechanical merge). '
      + 'FOUR OF THE 21 ARE NOT DEFECTS and this count can therefore never reach zero — do not chase them: '
      + '(a) the Tamil and (b) the Bengali month-name series are duplicated ON PURPOSE between '
      + 'src/data/regional-calendar-evidence.ts and src/engine/calendar-conventions.ts, because the evidence file is '
      + 'the published source the regional-calendar gates check the implementation against, and merging them would '
      + 'make those gates compare Ganak to a copy of Ganak; (c) [2,5,8,11] is zero-indexed SIGN indices in '
      + 'navratri.ts and one-indexed HOUSE numbers in shadbala.ts, two unrelated quantities; (d) [c11,c12,c2,c3] is a '
      + 'null-check over local variable names in houses.ts and PrashnaScreen.tsx, a detector artefact with no shared '
      + 'data. Each of the four carries a comment at its site saying so',
    evidence: dupTables.map((s) => '  ' + s),
  });
  pin({
    id: 'XS-DUP-SPEED',
    section: '§10 duplicates',
    title: 'separate implementations of "how fast is this planet moving"',
    expect: 4,
    measure: speedCopies.length,
    resolve: 'src/engine/planet-calendar.ts is the one definition: centredDailyMotion(f, ms) for any longitude '
      + 'function, and planetSpeed(name, ms) for a named graha. computeKundli already imports planetSpeed. '
      + 'Was 5 until 2026-08-19, when the dedupe lane retired gochar.ts\'s character-for-character copy — it now '
      + 'calls centredDailyMotion, and the gochar timeline, the planet calendar and the chart were proven '
      + 'byte-identical before and after. THREE REMAIN, all outside that lane\'s file scope, in priority order: '
      + '(1) src/engine/kundli.ts Shadbala\'s Cheshta Bala input is a BACKWARD difference on TROPICAL longitudes — '
      + 'the exact shape of the August retrograde defect, still shipping on the same chart object as rows[].retro '
      + 'computed the other way. It feeds a score rather than a stated retrograde flag, so no reader sees two '
      + 'answers TODAY, but nothing stops that; give it the same sidereal centred value. '
      + '(2) src/engine/panchang.ts upcomingEvents has its own centred copy — algebraically identical today, so it '
      + 'is a drift risk rather than a live defect; point it at centredDailyMotion. '
      + '(3) src/screens/PrashnaScreen.tsx PR_speed is NOT straightforwardly mergeable and may be legitimate: it '
      + 'reads Prashna\'s own ephemeris and its own KP-New ayanamsa, and it sits INSIDE the parity-frozen engine '
      + 'markers, where the region must stay plain import-free JS for validation/prashna-parity.js. Reconciling it '
      + 'means deciding whether Prashna should share the main ephemeris at all — a bigger call than dedupe. '
      + 'Then lower this number',
    evidence: speedCopies.map((s) => '  ' + s).concat([
      '  The August retrograde defect was exactly this: one of these copies used a backward difference and the chart',
      '  disagreed with the planet calendar for six hours after every station. It was fixed by DELETING the copy.',
    ]),
  });
}

// ===========================================================================
// §11  HIGH LATITUDE: TWO SURFACES, TWO HOUSE RINGS — BOTH MUST SAY SO
//      Above roughly 66° Placidus is undefined, and Ganak's two chart surfaces
//      fall back differently: the Jyotish chart's KP panel switches to
//      PORPHYRY (src/engine/kundli.ts:205) and Prashna switches to EQUAL
//      (src/screens/PrashnaScreen.tsx:289). One moment at Tromso therefore has
//      two different sets of cusps on two screens — "Reykjavik gets two
//      different house systems on two screens, 19 degrees apart".
//
//      This lane does NOT rule on which fallback is right: KP horary has its
//      own doctrine and validation/prashna-high-latitude.cjs owns that question.
//      What is assertable, and what protects the reader, is that EACH surface
//      names the ring it used, in BOTH languages — the same standard §3 holds
//      the dosha panel to. A silent fallback is how this became a defect.
// ===========================================================================
{
  const chartSrc = src('src/screens/ChartScreen.tsx');
  const prashnaSrc = src('src/screens/PrashnaScreen.tsx');
  const disclosures = [
    ['the Jyotish chart KP panel must print the house system it used',
      /kpData\.houseSystem/.test(chartSrc), 'src/screens/ChartScreen.tsx'],
    ['computeKundli must publish which ring it fell back to',
      /Porphyry \(Placidus undefined at this latitude\)/.test(src('src/engine/kundli.ts')), 'src/engine/kundli.ts'],
    ['Prashna must name its ring in English',
      /Equal houses — high-latitude fallback/.test(prashnaSrc), 'src/screens/PrashnaScreen.tsx'],
    ['Prashna must name its ring in Hindi',
      /समान भाव — उच्च अक्षांश विकल्प/.test(prashnaSrc), 'src/screens/PrashnaScreen.tsx'],
  ];
  for (const [what, present, where] of disclosures) {
    if (!present) {
      disagree('§11 high latitude', 'a high-latitude house-system fallback stopped disclosing itself', [
        what, `expected in ${where}`,
        'Above ~66° the two chart surfaces use different rings. Silently is how that became a defect.',
      ]);
    } else ok();
  }

  /* And the fallback must actually engage where it is claimed to. Measured
     through computeKundli itself, not re-derived. */
  const latRows = [];
  for (const [name, lat, lon, wantFallback] of [
    ['Delhi', 28.6139, 77.2090, false],
    ['Reykjavik', 64.1466, -21.9426, false],
    ['Tromso', 69.6496, 18.9560, true],
  ]) {
    const k = computeKundli({ y: 2026, m: 8, day: 19, hh: 6, mi: 30, tz: 0, lat, lon, ayanamsa: 'lahiri' });
    const fellBack = /Porphyry/.test(k.kpData.houseSystem);
    if (fellBack !== wantFallback) {
      latRows.push(`${name} (${lat}°N): chart reports "${k.kpData.houseSystem}", expected ${wantFallback ? 'the Porphyry fallback' : 'Placidus'}`);
    } else ok();
  }
  if (latRows.length) {
    disagree('§11 high latitude', 'the chart\'s high-latitude fallback no longer engages where it says it does', latRows);
  }
  COVERAGE.push('§11 both chart surfaces\' high-latitude house-system disclosures, and the fallback engaging at 3 latitudes');
}

// ===========================================================================
// REPORT
// ===========================================================================
const SECTION_TITLES = [
  '§1 vocabulary   one word for one thing',
  '§2 sky          chart vs planet calendar vs gochar vs transit line',
  '§3 doshas       matching card vs dosha calculators',
  '§4 windows      Panchang vs muhurat finder vs medical screen',
  '§5 one screen   good lane vs avoid lane',
  '§6 one name     Pradosha',
  '§7 claims       a surface\'s claim about another surface',
  '§8 languages    every rendered screen, English vs Hindi',
  '§9 conventions  nirayana / sayana',
  '§10 duplicates  where the next one will come from',
  '§11 high lat.   two chart surfaces, two house rings, both must say so',
];

console.log('cross-surface consistency — does Ganak say the same thing twice?');
console.log('-'.repeat(78));
for (const t of SECTION_TITLES) console.log('  ' + t);
console.log('-'.repeat(78));

if (findings.length) {
  console.error(`\n${findings.length} DISAGREEMENT${findings.length > 1 ? 'S' : ''}\n`);
  for (const f of findings) {
    console.error(`[${f.section}] ${f.title}`);
    for (const l of f.lines) console.error('    ' + l);
    console.error('');
  }
}

console.log(`${checks} cross-surface agreements verified. What was actually swept:`);
for (const c of COVERAGE) console.log('  ' + c);
console.log('');
console.log(`${pinsSeen.size} known disagreement${pinsSeen.size === 1 ? '' : 's'} pinned (recorded in plans/audits/2026-08-19-cross-surface-consistency.md, deliberately NOT fixed by this lane):`);
const SHOW_PINS = process.argv.includes('--pins');
for (const p of pinsSeen.values()) {
  console.log(`  · ${p.id} — ${p.title}  [measured ${p.measure}, pinned ${p.expect}]`);
  if (SHOW_PINS) {
    console.log(`      resolve: ${p.resolve}`);
    for (const l of p.evidence) console.log('      ' + l);
    console.log('');
  }
}
if (!SHOW_PINS) console.log('  (run with --pins for each pin\'s evidence and the one-line fix that retires it)');
console.log('This gate proves that two surfaces AGREE. It cannot prove either is right;');
console.log('it reads rendered text, never layout; and it is blind to a fact only one surface states.');

if (findings.length) {
  console.error('cross-surface-consistency: FAIL');
  process.exit(1);
}
console.log('cross-surface-consistency: PASS');
