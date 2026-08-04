# Ganak web-first utility pass — scope audit

Date: 2026-08-03

## Product boundary agreed by owner

Ganak has two intentionally different surfaces:

1. **Website** — a web-first public utility and discovery portal. It keeps the
   existing information-rich model and receives focused usability improvements;
   it is not required to mimic a native app or the ornate mobile-app visual system.
2. **Future Android/iPhone app** — a distinct, premium daily companion whose
   visual master is the approved Figma prototype. Its product architecture is
   being decided separately.

Both surfaces must share astronomy, festival rules, language data and any future
account/preferences model. They must not become competing calculation engines.

## What this pass can improve

- Make the existing website easier to understand, navigate and operate on desktop
  and phone without changing its public-route model or rebuilding it as a native
  app.
- Preserve place, date, language and selected tool state on every interaction.
- Remove genuine duplicate presentation only where it adds no new decision or
  timing information.
- Use existing accessibility tokens and UI primitives; do not introduce an
  app-only visual language into the public web portal.

## Explicitly outside this pass

- The Figma mobile-app design, native Android/iOS packaging, push delivery,
  account login and reminder infrastructure.
- Analytics/feedback wiring, privacy policy publication and route metadata:
  active task `CODEX-P0-ROWS-38-39-2026-07-28` owns those files and awaits
  external provider access.
- MuhuratHub changes: reserved for `CLAUDE-BUGBASH-MUHURAT-FULL-PARITY-02`.
- Any unreviewed information-architecture rewrite. Backlog #48 requires a
  measured usability basis, not a visual reskin.

## Worksheet reconciliation

| Row | State on 2026-08-03 | Next action |
|---:|---|---|
| 31 Property-purchase Muhurat | Built; 90% | Production verification only |
| 32 Vehicle-purchase Muhurat | Built; 90% | Production verification only |
| 37 Save/share/export Muhurat | Live; 95% | Owner real-device iPhone/Android calendar-import retest |
| 38 Analytics + feedback | 65%; external setup pending | Create/configure PostHog EU + Supabase; publish policy; then network/privacy bug bash |
| 39 Branded domain | Closed | Monitor only |
| 40 Route-aware metadata | Closed | Keep future routes in metadata registry/gates |
| 48 Everyday navigation + MuhuratHub | 20%; owner UX review dependency | Audit before assigning a narrow implementation slice |
| 59 Global site search | Not started | Separate product/IA decision after audit |

## Audit method before code

1. Measure five representative website journeys at desktop and phone widths:
   Today/date/place, festival guide, Muhurat finder, Prashna and Jyotish.
2. Record only observable usability problems: destination ambiguity, redundant
   content, unclear controls, reset risk, tap/keyboard/accessibility failure or
   misleading page identity.
3. Map each issue to a file owner and backlog row.
4. Propose one small implementation slice that does not overlap an ACTIVE or
   RESERVED lane. It must define exact routes, state-preservation expectations,
   EN/HI acceptance criteria and regression checks before code begins.

## Provisional success definition

The public website remains information-dense but feels purposeful: users can
identify where they are, set city/date, reach a major task, understand the next
action and return without losing state. The app gets its own focused devotional
experience later.

## First browser evidence pass — 2026-08-03

Browsers inspected: production `https://ganakapp.com/` at 390×844 and 1280×800,
plus representative Prashna, festival, direct-Muhurat and Jyotish journeys.
No console-error claim is made in this audit; this is a hierarchy and control
review, not a full regression test.

| Journey | What works | Observable usability problem | Severity |
|---|---|---|---|
| Daily / Panchang (390px) | City and date controls are visible controls with accessible labels; timing cards use explicit Good/Avoid text, not colour alone. | The first 844px is consumed by Personalize, language, brand hero, three-tab nav, city/date, Listen and two calendar configuration controls. The actual Today's answer starts below the first viewport. This reverses the product's answer-before-data principle. | P1 |
| Daily / Panchang (1280px) | Place/date operate as one visible utility row; the answer card has good desktop width. | The page still spends substantial vertical space on the brand hero and utility configuration before the day's answer. Calendar/holiday configuration is visually promoted above the daily verdict although it is occasional rather than daily intent. | P2 |
| Prashna | The two methods and all twelve question subjects are explicit and readable; no birth data is required. | The hero promises “selected place,” but the first interaction surface neither shows the currently used place nor gives a way to change it. A user cannot confidently tell which location will govern their question. | P1 |
| Festival guide | Route title, back link, image, purpose, Follow/Listen and local timing are all concrete and useful. | The generic global hero occupies significant phone space before the guide’s local date/timing. This is secondary to the more urgent Daily/navigation problems. | P3 |
| Muhurat | A direct `?muhurat=wedding` link does set a Muhurat hero and metadata. | Its first rendered controls are still the generic Daily controls, the top navigation has no Muhurat destination, and the wedding finder is not visible or focused in the first viewport. A shared result feels as though it opened the wrong page. | P0 |
| Jyotish | A clean blank first-use birth form appears after its enter animation; the selected Jyotish destination is visible. | The web's three-item primary navigation cannot expose Festivals, Muhurat, or calculators alongside Jyotish; users must discover them by long scrolling or deep links. | P1 |

## Root causes

1. The global three-button selector describes only implementation modes
   (`Daily`, `Prashna`, `Jyotish`), not the real public product destinations.
   Festivals, Muhurat and calculators exist but are discoverability-dependent
   sections or footer links.
2. The Daily page combines immediate use (today's answer), occasional setup
   (calendar and holiday system), and several major products (festivals, finder,
   hora, planetary calendar) into one unprioritised scroll.
3. Query-driven Muhurat identity and a generic Daily render do not form a
   coherent public journey.

## Recommended first implementation slice — pending ownership release

**Website utility header and Daily answer ordering**, restricted to the shell and
Daily presentation only:

1. Make five real public destinations visible: **Today/Panchang · Festivals ·
   Muhurat · Prashna · Jyotish**. This is web navigation, not the Figma app's
   bottom panel.
2. On Daily, retain place/date at the top, then show the day's answer and
   Good/Avoid windows before optional calendar/holiday configuration.
3. Give Muhurat a stable, dedicated entry point that lands the user at its finder,
   not at the Daily controls. Preserve all place/date/language/query state.
4. Make the currently selected Prashna place visible beside its method/context;
   do not create a second unsynchronised location field.

This is deliberately a small foundation slice. Global search (#59), a full
MuhuratHub split (#48) and any new app visual language remain separate projects.
It cannot start while active task `CODEX-P0-ROWS-38-39-2026-07-28` owns
`src/kundli-app.tsx`, and while the independent Muhurat bug-bash reservation
remains active. No source code has been changed by this audit.
