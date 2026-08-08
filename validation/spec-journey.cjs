#!/usr/bin/env node
'use strict';

/* Gate: every NEW spec must name its user and walk their journey before designing.

   Why this gate exists
   --------------------
   Ganak has 60+ gates proving the maths and the copy, and none that asked the two questions a
   spec actually lives or dies on: WHO is this for, and WHAT are they trying to do?

   The cost, concretely: the calculator-placement spec optimised for an "elder-friendly"
   constraint that belongs to the Panchang householder (P1) and applied it to Kala Sarpa and
   Mangal Dosha tools, whose user is the astrology enthusiast (P2) — someone who clicks a tool
   because they were *told* they have that dosha. The design work was sound; it answered the
   wrong question. And because no step forced a journey walk, nobody noticed that step 4 of the
   owner's own journey ("sees tools like Kala Sarpa") was impossible: nothing in the app showed
   those tools existed.

   The fix is mechanical rather than a good intention, because every discipline-based fix in this
   repo has decayed (see plans/ganak-gate-decay-rootcause.md).

   What it checks
   --------------
   Each spec file must contain, by heading or explicit marker:
     1. a primary persona named from plans/ganak-personas.md  (P1..P4 or its title)
     2. a journey section — the user's steps, written before the design
     3. a walk of that journey against the code, marking steps broken/missing
     4. an inventory of what already exists that serves the journey
     5. a success measure expressed in user steps, not gate metrics

   Grandfathering
   --------------
   Specs written before this gate existed are listed explicitly in LEGACY below. They are NOT
   silently skipped by a date rule — each is named, so the debt is visible and can be paid down.
   A gate that ships red trains everyone to ignore red (that is precisely how this repo's
   design-system gate rotted), so the standard applies from here forward. */

const fs = require('fs');
const path = require('path');

const SPEC_DIR = 'docs/superpowers/specs';
const PERSONA_FILE = 'plans/ganak-personas.md';

/* Specs authored before this gate. Named individually on purpose — this is recorded debt, not
   an exemption rule. Removing a name here means that spec must meet the standard. */
const LEGACY = new Set([
  '2026-07-23-kundli-life-interpretation-design.md',
  '2026-07-25-festival-aarti-section-design.md',
  '2026-07-25-personal-muhurat-design.md',
  '2026-08-01-aarti-multilang-phase2-prd.md',
  '2026-08-03-navigation-and-tool-placement-design.md',
]);

let failures = 0;
const fail = (m) => { failures++; console.error('FAIL ' + m); };

/* ---- the persona registry must exist and define the personas specs may cite ---- */
if (!fs.existsSync(PERSONA_FILE)) {
  console.error(`FAIL missing ${PERSONA_FILE} — specs have no canonical persona list to cite`);
  process.exit(1);
}
const personaDoc = fs.readFileSync(PERSONA_FILE, 'utf8');
const personaIds = [...personaDoc.matchAll(/^##\s+(P\d)\s+·\s+(.+)$/gm)].map((m) => ({ id: m[1], title: m[2].trim() }));
if (personaIds.length < 2) fail(`${PERSONA_FILE} defines ${personaIds.length} personas — expected the full registry (P1..P4)`);

/* ---- required sections, matched loosely so wording can vary but intent cannot ---- */
const REQUIRED = [
  { key: 'persona', label: 'names a primary persona from the registry',
    test: (t) => personaIds.some((p) => new RegExp(`\\b${p.id}\\b`).test(t) || t.toLowerCase().includes(p.title.toLowerCase())) },
  /* Requires an ENUMERATED journey, not the word "journey". A keyword match passed a probe spec
     whose entire body was "A design with no user and no journey." — so the test also demands
     evidence of ordered steps: a numbered list, or a table with a step/# column. */
  { key: 'journey', label: 'an enumerated journey (ordered steps, not just the word "journey")',
    test: (t) => /journey|user flow|steps? the user/i.test(t)
      && (/^\s*\|?\s*\d+\s*[|.)]\s+\S/m.test(t) || /^\s*\d+\.\s+\S/m.test(t)) },
  { key: 'walk', label: 'the journey walked against the code (steps marked broken/missing)',
    test: (t) => /(broken|missing|cannot happen|works today|today\b.*\bfriction)/i.test(t) && /(evidence|verified|confirmed|`src\/|\.tsx|\.ts\b)/i.test(t) },
  { key: 'exists', label: 'an inventory of what already exists that serves the journey',
    test: (t) => /already exists|already available|what already|existing (component|infrastructure|engine)|reuse/i.test(t) },
  { key: 'success', label: 'success measured in user steps, not gate metrics',
    test: (t) => /(taps?|clicks?|forms?|steps?)\b[^\n]{0,80}(target|today|→|->)|fewer (clicks|taps|steps)|zero (typing|forms)/i.test(t) },
];

/* ---- non-vacuous self-tests: prove every validator bites, on EVERY run ----

   Why this block exists. The REQUIRED tests above only execute as a side effect of a
   non-legacy spec being present. Today all five specs are grandfathered, so `checked` is 0
   and not one validator runs — yet the gate still printed PASS and claimed it had verified
   all five properties. Proven by mutation: forcing every `test` to return true left the gate
   exiting 0 with its full success message. A broken regex, a bad refactor, or a stray
   `true ||` would ship green and CI would never notice.

   AGENTS.md: "Evidence before assertions." A PASS must carry evidence that the detectors
   work, independently of whether any spec happens to exercise them. Fixtures run
   unconditionally and in BOTH directions — the known-bad text must be rejected by every
   validator, the known-good text accepted by every one — because a validator that flags
   everything is as useless as one that flags nothing. Pattern follows the mustMatch/mustNot
   self-tests in validation/life-interpretation-copy.cjs.

   BAD_SPEC is the exact probe that once slipped past an earlier keyword-only `journey`
   check (see the note on that rule above). It is automated here so that bug cannot recur. */
const BAD_SPEC = 'A design with no user and no journey.';
const GOOD_SPEC = [
  '# Self-test fixture — not a real spec',
  'Primary persona: P1.',
  '## Journey',
  '1. The user opens the app.',
  '2. The user reads the answer.',
  '## Walking it against the code',
  'Step 2 is broken today — verified in `src/screens/DailyScreen.tsx`.',
  '## What already exists',
  'The Panchang engine already exists and is reused here.',
  '## Success',
  'Three taps today → one tap; fewer taps overall.',
].join('\n');

for (const r of REQUIRED) {
  if (r.test(BAD_SPEC)) {
    fail(`self-test: "${r.key}" ACCEPTED the known-bad fixture — this validator no longer bites`);
  }
  if (!r.test(GOOD_SPEC)) {
    fail(`self-test: "${r.key}" REJECTED the known-good fixture — this validator is over-strict and would block a compliant spec`);
  }
}

if (!fs.existsSync(SPEC_DIR)) {
  if (failures) { console.error(`\n✗ spec-journey FAILED (${failures}) — self-tests broken`); process.exit(1); }
  console.log('✓ spec-journey PASSED (no spec directory yet; self-tests green)');
  process.exit(0);
}

const files = fs.readdirSync(SPEC_DIR).filter((f) => f.endsWith('.md'));
let checked = 0;
const legacySeen = new Set();

for (const f of files) {
  if (LEGACY.has(f)) { legacySeen.add(f); continue; }
  checked++;
  const text = fs.readFileSync(path.join(SPEC_DIR, f), 'utf8');
  for (const r of REQUIRED) {
    if (!r.test(text)) fail(`${f}: missing ${r.label}`);
  }
}

/* A legacy name that no longer matches a file is stale — it would silently exempt nothing, or
   worse, mask a rename. Report it so the list stays honest. */
for (const name of LEGACY) {
  if (!legacySeen.has(name)) fail(`LEGACY lists "${name}" but no such spec exists — remove the stale entry`);
}

console.log(`personas defined: ${personaIds.map((p) => p.id).join(', ')}`);
console.log(`specs checked: ${checked} · grandfathered: ${legacySeen.size}`);

if (failures) {
  console.error(`\n✗ spec-journey FAILED (${failures})`);
  console.error('A spec must name its user (plans/ganak-personas.md) and walk their journey against the code BEFORE designing.');
  process.exit(1);
}
console.log('✓ spec-journey PASSED (every new spec names a persona, maps a journey, walks it against the code, inventories what exists, and measures success in user steps)');
