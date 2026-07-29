#!/usr/bin/env node
'use strict';

/*
 * Route-derived festival/fast interaction + accessibility gate.
 *
 * Guards the P0 "dead interaction" bug class across every festival/fast entry
 * surface (full-year calendar, festival/tithi search, Fasts & Festivals list).
 * It fails when:
 *   1. a visual festival/fast row has neither a canonical link nor an explicit
 *      expand control;
 *   2. a canonical route exists but a displayed key cannot reach it;
 *   3. a button-like row lacks keyboard handling, focus or an accessible name;
 *   4. aria-expanded is not bound to the same open state as the rendered panel
 *      (or the controlled panel id is missing);
 *   5. an inline expansion carries no visible affordance / open-state chevron;
 *   6. a navigation href drops the language or city (lost state on Back);
 *   7. any live registry key (FEST_NAME / OBS_NAME) is unmapped in the route
 *      lookup used by the surfaces.
 *
 * The self-contained failure fixtures at the bottom prove the checker actually
 * bites for a static dead row, a click-only row, an invisible expansion, a
 * missing route, a lost-Hindi-query href and a stale Back-state (JS-only) row.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { loadApp } = require('./_load-app.cjs');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const pages = loadApp('src/data/festival-pages.ts');
const meta = loadApp('src/data/festival-meta.ts');
const engine = loadApp('src/engine/festivals.ts');
const { festivalPathForKey, FESTIVAL_PAGE_ROUTES } = pages;
const { FEST_NAME, OBS_NAME } = meta;
const { scanPanchangCalendar } = engine;

const CAL = read('src/screens/CalendarPage.tsx');
const HUB = read('src/screens/MuhuratHub.tsx');

let failures = 0;
const problems = [];
function check(cond, msg) {
  if (cond) return;
  failures++;
  problems.push(msg);
}

/* ---- reusable, fixture-tested predicates -------------------------------- */

// A row that presents itself as openable must be a real anchor (browser gives
// keyboard + focus + Back for free) OR a proper button with keyboard handling.
function rowNavigatesByAnchor(snip) {
  return /<a\b[^>]*\bhref=/.test(snip);
}
function rowIsKeyboardReachable(snip) {
  if (rowNavigatesByAnchor(snip)) return true; // native <a>
  const hasClick = /onClick=/.test(snip);
  const hasKeydown = /onKeyDown=/.test(snip);
  const focusable = /tabIndex=/.test(snip) || /<button\b/.test(snip);
  return hasClick && hasKeydown && focusable;
}
// Navigation that must survive Back cannot be a JS-only state push.
function usesRealAnchorNavigation(snip) {
  const jsOnlyNav = /onClick=\{\(\)\s*=>\s*(set[A-Z]|navigate|go\()/.test(snip) && !rowNavigatesByAnchor(snip);
  return rowNavigatesByAnchor(snip) && !jsOnlyNav;
}
// An expand control must announce and control its panel.
function expandControlHasAria(snip) {
  return /aria-expanded=/.test(snip) && /aria-controls=/.test(snip);
}
// A visible open-state affordance (chevron) exists.
function hasVisibleAffordance(snip) {
  return /rotate\(90deg\)/.test(snip) || /aria-hidden="true"[^>]*>[›▸▾▼]/.test(snip) || /[›▸▾▼]/.test(snip);
}
// A navigation href preserves language (and, when a city is known, the city).
function hrefPreservesLang(snip) {
  return /lang/.test(snip);
}

/* Element-scoped predicates (fixture-tested below). These operate on a single
 * extracted element/block, so an assertion cannot be satisfied by unrelated text
 * elsewhere in the file — the weakness a stray chevron or a duplicate label would
 * otherwise hide. */
function anchorBlockOk(block) {
  return /^<a\b/.test(block) && /href=\{festHref\(/.test(block) && /aria-label=/.test(block);
}
function toggleBlockOk(block) {
  // must be a keyboard-native <button> (not a mouse-only div), announce + control
  // its panel, carry an accessible name and a visible open-state chevron rotation
  return /^<button\b/.test(block)
    && /aria-expanded=\{open\}/.test(block)
    && /aria-controls=\{panelId\}/.test(block)
    && /aria-label=/.test(block)
    && /rotate\(90deg\)/.test(block);
}
function inPanelGuideBilingual(block) {
  return /Open full guide/.test(block) && /पूरी मार्गदर्शिका खोलें/.test(block);
}
function festHrefPreservesState(fnSrc) {
  return /p\.set\("lang"/.test(fnSrc) && /p\.set\("city"/.test(fnSrc);
}

/* ---- 1. CalendarPage (full-year + search rows) -------------------------- */

check(/festivalPathForKey/.test(CAL), 'CalendarPage: does not import/use festivalPathForKey');
check(/it\.kind === "tithi"/.test(CAL), 'CalendarPage: tithi-only rows not held out of festival routing');
check(usesRealAnchorNavigation(CAL), 'CalendarPage: navigation is JS-only, not Back-restorable');
check(/fest-row:focus-visible/.test(CAL), 'CalendarPage: no visible keyboard focus style on rows');
// unmapped festival/fast must be a visible error, never a silent dead div
check(/isn't available yet|उपलब्ध नहीं/.test(CAL), 'CalendarPage: no visible bilingual fallback for an unmapped entry');
// scope the row anchor: must be an <a> using festHref, with an accessible name and a chevron
const calRow = CAL.match(/<a\b[^>]*className="fest-row"[\s\S]*?<\/a>/);
check(!!calRow, 'CalendarPage: festival/fast rows are not real <a> anchors (dead rows)');
if (calRow) {
  check(anchorBlockOk(calRow[0]), 'CalendarPage: row anchor missing festHref/aria-label');
  check(/[›▸▾▼]/.test(calRow[0]), 'CalendarPage: row anchor has no visible navigation chevron');
}
const calFestHref = CAL.match(/const festHref = \([\s\S]*?\n  \};/);
check(calFestHref && festHrefPreservesState(calFestHref[0]), 'CalendarPage: festHref drops lang/city (lost state)');

/* ---- 2. MuhuratHub Fasts & Festivals list ------------------------------- */

check(/festivalPathForKey/.test(HUB), 'MuhuratHub: does not import/use festivalPathForKey');
// open must be a real boolean, else a collapsed toggle omits aria-expanded (null)
check(/const open = Boolean\(/.test(HUB) || /const open = !!/.test(HUB), 'MuhuratHub: open state is not coerced to boolean (collapsed toggle would omit aria-expanded)');
check(/scrollIntoView/.test(HUB), 'MuhuratHub: expanded panel is not revealed within the viewport');
check(/<div id=\{panelId\} ref=\{openPanelRef\}/.test(HUB), 'MuhuratHub: controlled panel missing id={panelId}/ref (state/panel disagree)');
// the old invisible whole-row toggle must be gone
check(!/role="button"[\s\S]{0,120}onClick=\{\(\) => setFexp/.test(HUB), 'MuhuratHub: invisible whole-row toggle (role=button) still present');
// every ff-row anchor (F&F list primary row + "Coming up" summary rows) must be a
// real <a> that navigates via festHref with an accessible name
const hubAnchors = HUB.match(/<a\b[^>]*className="ff-row"[\s\S]*?<\/a>/g) || [];
check(hubAnchors.length >= 2, 'MuhuratHub: expected ff-row anchors for both the F&F list and the "Coming up" summary');
for (const a of hubAnchors) {
  check(anchorBlockOk(a), 'MuhuratHub: an ff-row anchor is missing festHref/aria-label');
}
// the F&F list primary row specifically opens the canonical page for its entry
check(/href=\{festHref\(path\)\}/.test(HUB), 'MuhuratHub: F&F list primary row does not open the canonical festival page');
// scope the quick-details toggle
const hubToggle = HUB.match(/<button\b[^>]*className="ff-toggle"[\s\S]*?<\/button>/);
check(!!hubToggle, 'MuhuratHub: quick-details toggle <button> not found');
if (hubToggle) {
  check(toggleBlockOk(hubToggle[0]), 'MuhuratHub: toggle is not a keyboard-native button with aria-expanded/aria-controls/name/open-chevron');
}
// scope the in-panel "Open full guide" link (must be distinct from the row aria-label)
const hubGuide = HUB.match(/\{path && \(\s*<a href=\{festHref\(path\)\}[\s\S]*?<\/a>\s*\)\}/);
check(!!hubGuide, 'MuhuratHub: no in-panel "Open full guide" link block');
if (hubGuide) {
  check(inPanelGuideBilingual(hubGuide[0]), 'MuhuratHub: in-panel guide link not bilingual');
}
const hubFestHref = HUB.match(/const festHref = \([\s\S]*?\n  \};/);
check(hubFestHref && festHrefPreservesState(hubFestHref[0]), 'MuhuratHub: festHref drops lang/city (lost state)');
// the "Coming up" summary rows (nextFast/nextFest) must open the canonical page too
check(/comingRow\("fast",/.test(HUB) && /comingRow\("festival",/.test(HUB), 'MuhuratHub: "Coming up" nextFast/nextFest not wired through comingRow');
const comingRowFn = HUB.match(/const comingRow = \([\s\S]*?<\/a>[\s\S]*?\n {8}\};/);
check(comingRowFn && /festivalPathForKey\(kind, item\.key\)/.test(comingRowFn[0]) && /href=\{festHref\(p\)\}/.test(comingRowFn[0]), 'MuhuratHub: "Coming up" rows do not open the canonical festival page');

/* ---- 3. Live registry coverage — every displayed key reaches a route ---- */

function coverageProblem(kind, key) {
  const p = festivalPathForKey(kind, key);
  if (!p) return `${kind}:${key} has no canonical route`;
  if (!FESTIVAL_PAGE_ROUTES[p]) return `${kind}:${key} → ${p} is not a registered route`;
  return null;
}
for (const key of Object.keys(FEST_NAME)) {
  const prob = coverageProblem('festival', key);
  check(!prob, `CalendarPage/Hub festival ${prob}`);
}
for (const key of Object.keys(OBS_NAME)) {
  const prob = coverageProblem('fast', key);
  check(!prob, `CalendarPage/Hub fast ${prob}`);
}

/* ---- 3b. Live engine emission — no key can render outside the registry --- */
// The surfaces display whatever the engine emits. If the engine ever emits a
// festival key with no FEST_NAME entry, trN() would leak the raw camelCase key
// (fasts are safe via obsLabel, but they still need a route). Drive the real
// scan for the current year and assert every emitted key is a known, routable
// registry key — closing the "an internal key can render" contract clause.
try {
  const PLACE = { label: 'New Delhi, India', lat: 28.61, lon: 77.21, zone: 'Asia/Kolkata' };
  const YEAR = new Date().getUTCFullYear();
  const TZ = 5.5;
  const from = Date.UTC(YEAR, 0, 1, 6) - TZ * 3600000;
  const scan = scanPanchangCalendar(from, TZ, 366, 366, PLACE);
  const emittedFest = [...new Set((scan.festivals || []).map((f) => f.key))];
  const emittedFast = [...new Set((scan.fasts || []).map((f) => f.key))];
  check(emittedFest.length > 0 && emittedFast.length > 0, 'engine scan emitted no festival/fast keys (scan wiring broken)');
  for (const k of emittedFest) {
    check(FEST_NAME[k] !== undefined, `engine emits festival key '${k}' absent from FEST_NAME (would leak raw key via trN)`);
    check(!coverageProblem('festival', k), `engine festival key '${k}' has no canonical route`);
  }
  for (const k of emittedFast) {
    check(OBS_NAME[k] !== undefined, `engine emits fast key '${k}' absent from OBS_NAME`);
    check(!coverageProblem('fast', k), `engine fast key '${k}' has no canonical route`);
  }
} catch (e) {
  check(false, `engine emission coverage could not run: ${e && e.message}`);
}

/* ---- 4. Failure fixtures — prove the gate catches each anti-pattern ------ */

const fixtures = [
  { name: 'static dead row', pass: rowNavigatesByAnchor('<div>{label}<span>{date}</span></div>') === false },
  { name: 'click-only row (no keyboard)', pass: rowIsKeyboardReachable('<div onClick={() => open()}>{label}</div>') === false },
  { name: 'invisible expansion (no aria)', pass: expandControlHasAria('<button onClick={() => setFexp(x)}>{label}</button>') === false },
  { name: 'missing route', pass: coverageProblem('festival', '__no_such_festival_key__') !== null },
  { name: 'lost Hindi query href', pass: hrefPreservesLang('<a href={`/festival/${slug}`}>{label}</a>') === false },
  { name: 'stale Back-state (JS-only nav)', pass: usesRealAnchorNavigation('<div role="button" onClick={() => setCalView(null)}>{label}</div>') === false },
  // element-scoped predicate fixtures — these are what B flagged as previously ungated
  { name: 'toggle without aria/chevron', pass: toggleBlockOk('<button className="ff-toggle" onClick={x}>›</button>') === false },
  { name: 'mouse-only div masquerading as toggle', pass: toggleBlockOk('<div aria-expanded={open} aria-controls={panelId} aria-label="x" onClick={x}>rotate(90deg)</div>') === false },
  { name: 'chevron-less toggle', pass: toggleBlockOk('<button className="ff-toggle" aria-expanded={open} aria-controls={panelId} aria-label="x">flat</button>') === false },
  { name: 'in-panel guide English-only', pass: inPanelGuideBilingual('<a href={festHref(path)}>Open full guide</a>') === false },
  { name: 'row anchor without festHref', pass: anchorBlockOk('<a href={`/festival/${slug}`} aria-label="x">{label}</a>') === false },
];
for (const f of fixtures) {
  check(f.pass, `fixture not caught: ${f.name}`);
}
// And the positive counterparts must pass, so the predicates aren't trivially strict.
check(rowIsKeyboardReachable('<a href={festHref(path)}>{label}</a>'), 'fixture false-negative: real anchor rejected');
check(expandControlHasAria('<button aria-expanded={open} aria-controls={panelId}>›</button>'), 'fixture false-negative: proper aria rejected');
check(hrefPreservesLang('<a href={festHref(path)} data-lang>{label}</a>'), 'fixture false-negative: lang href rejected');
check(toggleBlockOk('<button className="ff-toggle" aria-expanded={open} aria-controls={panelId} aria-label="x"><span>rotate(90deg)</span></button>'), 'fixture false-negative: valid toggle rejected');
check(inPanelGuideBilingual('<a>Open full guide पूरी मार्गदर्शिका खोलें</a>'), 'fixture false-negative: bilingual guide rejected');
check(anchorBlockOk('<a href={festHref(path)} aria-label="x">{label}</a>'), 'fixture false-negative: valid anchor rejected');

/* ---- report ------------------------------------------------------------- */

if (failures) {
  console.error(`✗ festival-interaction: ${failures} problem(s)`);
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log(`✓ festival-interaction clean: ${Object.keys(FEST_NAME).length} festival + ${Object.keys(OBS_NAME).length} fast keys routed; CalendarPage + MuhuratHub interaction/a11y contract enforced; ${fixtures.length} failure fixtures caught`);
