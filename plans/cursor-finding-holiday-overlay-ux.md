# Finding for Cursor — holiday overlay reads as "broken" on non-holiday dates

**For:** `CURSOR-P0-HOLIDAY-OVERLAY-12` (ACTIVE — Cursor owns
`src/components/HolidayOverlayCard.tsx`, `src/screens/DailyScreen.tsx`,
`validation/holiday-overlays.cjs`)
**Raised by:** Claude Code, 2026-07-25, from an owner bug report
**Severity:** UX / Medium — the feature is *functionally correct*; it just appears
dead on the ~350 days a year that aren't holidays.
**I did NOT touch any code** — these are your active files (one-writer rule). This is
a hand-off, not a competing fix.

---

## What the owner reported

> "I checked GOVERNMENT HOLIDAYS on Ganak, tried switching between 3 menu items,
> nothing worked, looks like a bug to me."

## Reproduction (production, ganak.pages.dev)

1. Land on the Daily home on a non-holiday date — the owner was on **today, 29 July
   2026**.
2. In "GOVERNMENT HOLIDAYS", switch the overlay select through **Hide holidays →
   National holidays → Central gazetted holidays**.
3. **Nothing on the page changes.** Verified: the entire `document.body.innerText` is
   **byte-identical (4330 chars) across all three options**, and no holiday text
   appears anywhere.

## Root cause — it's working as designed, and that's the problem

The overlay only produces a visible banner **on dates that are actually holidays**
(matching the "banner only on holiday dates" design). The wiring is fine:

- the select updates state and the URL (`?hol=national` / `?hol=gazetted`) correctly;
- `DailyScreen.tsx` feeds `holidayDatesForYear(cy, holidayMode)` into `calMarks.holiday`
  (calendar markers) and a Daily banner keyed on the selected date.

**Proof it genuinely works** — I browsed to `?hol=national&date=2026-08-15`
(Independence Day) and the banner renders exactly right:

> **GOVERNMENT HOLIDAYS · SEPARATE OVERLAY**
> This never changes the Hindu Panchang calculation
> **Independence Day** — National holiday of India

So on 15 Aug it works; on 29 Jul it shows nothing **because 29 Jul is not a
government holiday.** Since most days aren't holidays, most users toggling this
control will see nothing happen and conclude it's broken — exactly what the owner
did.

## Recommended fix (small, inside your task's scope)

When the overlay is **on** (`national` or `gazetted`) **and the selected date has no
holiday for the chosen mode**, render a quiet confirmation line instead of nothing:

- EN: **"No government holiday on this date."**
- HI: **"इस तारीख़ पर कोई सरकारी अवकाश नहीं।"**

That single line makes the control always feel alive and honest — the user learns
"this date is clear" rather than "this button is dead." Keep it in the same muted,
"separate overlay · never changes the Panchang" framing you already use, so it can't
be mistaken for panchang data.

### Worth deciding while you're in here

- **Default is "Central gazetted holidays"** (that's what production shows selected by
  default). If the intent was opt-in / off-by-default, the current default may be
  wrong — confirm against the `#12` UI decision.
- The **full-year calendar markers** (`calMarks.holiday`) are the overlay's other
  surface. A user who never opens the calendar and never lands on a holiday date will
  never see any effect at all — the hint above is what closes that gap on the Daily
  view.

## Regression to add to your gate (`validation/holiday-overlays.cjs`)

- On a **known holiday date** (e.g. 2026-08-15, national), the Daily banner text is
  present for `national`/`gazetted` and absent for `off`.
- On a **non-holiday date** with the overlay **on**, the no-holiday hint is present
  (so the control is never a silent no-op again). Prove it non-vacuously.

Both languages.
