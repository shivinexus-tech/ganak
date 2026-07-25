# Cursor Bug Bash — Muhurat Full Parity Rows 16/17

Date: 2026-07-24
Tester: Cursor
Scope: Deep public Muhurat finder categories for marriage, engagement, housewarming, Bhoomi Puja, construction, business, travel and document signing/registration.

## Baseline

- Focused gates passed: `deep-muhurats.cjs`, `muhurat-anchors.cjs`, `samskara-muhurats.cjs`.
- Fresh local browser: `http://127.0.0.1:5303/?muhurat=document&lang=hi`.
- Phone viewport: 390 × 844.

## Vectors Covered

- Direct URL category restoration with `?muhurat=engagement`, `?muhurat=travel`, `?muhurat=document`.
- Chip inventory in English and Hindi: all eight requested public activities visible and localized.
- Engagement result: ranked dates, blockers, Panchaka-Rahita windows and no silent blanking while recalculating.
- Travel result: Char/Labh/Amrit/Shubh windows, no reuse of Panchaka-Rahita wording after fix.
- Documents result: Labh/Shubh clean windows, no Char travel window leakage.
- Hindi phone smoke: localized chips and result, `scrollWidth === clientWidth === 390`.
- URL/language preservation: `?muhurat=document&lang=hi` retained after reload/search.

## Finding

### F1 — P2 copy mismatch in non-Panchaka activities

Travel and Documents correctly showed activity-specific clean windows, but the generic footer still said "the time windows use Panchaka Rahita (lagna-based)." This was misleading for Travel and Documents.

**Fix:** footer now says non-Samskara categories use "this activity's own clean-window rules"; Samskara categories keep a separate lagna/chart-screening note.

**Verification:** fresh post-fix port `5303`, Hindi phone Documents result:

- `hasResult: true`
- `hasWindow: true`
- `staleFooter: false`
- captured runtime errors: `[]`
- `scrollWidth: 390`, `clientWidth: 390`

## Result

No open P0/P1 from this pass. One P2 copy defect was fixed before closeout.

## Required Next Pass

Assign Claude Code as the second independent bug-bash agent before rows #16/#17 can move to 100%.
