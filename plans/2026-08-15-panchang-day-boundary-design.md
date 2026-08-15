# Panchang day boundary — implementation design

**Owner go-ahead:** 2026-08-15. **Primary persona:** P1, the householder checking
the night currently in progress before dawn.

## Journey

1. The user opens Today between local midnight and sunrise.
2. Ganak identifies the selected place's local civil date and that date's real sunrise.
3. If the instant is before sunrise, Today selects the preceding civil date—the
   Panchang sunrise-day whose night is still in progress.
4. At sunrise, Today advances to the new Panchang day. “Back to today,” the date
   control, holiday overlay and Today-context labels agree on that selected day.
5. A date explicitly chosen through the URL, calendar or arrows remains exactly
   that civil date and is never silently rolled back.

## Walking it against the code

- Broken today: `DailyScreen.tsx` derives `todayISO` at local midnight, so step 3
  cannot happen and all consumers receive tomorrow night's date before dawn.
- Broken today: `computeTodayPanchang()` independently derives the same civil date,
  so fixing only the button/date label would leave the astronomy on another day.
- Already correct: explicit date calculation is anchored at local noon, so it must
  remain outside the automatic-before-sunrise rule.

## Scope and safety invariants

- One pure exported selector in `today-panchang.ts` owns the boundary decision.
- A real sunrise is required to roll back. Polar/no-sunrise dates keep the civil
  date; Ganak does not invent a boundary.
- The selected date is previous only before sunrise, current at the exact sunrise,
  and current after sunrise.
- No festival engine, festival data, deciding-kala rule or holiday dataset changes.
- Existing sourced festival/Navratri/Sankranti/deeplink gates must pass unchanged.
- A dedicated gate pins Delhi and New York before/at/after sunrise, a DST date,
  explicit-date behavior, and static wiring; mutation to midnight selection must fail.

## Success

Before: a 3 AM visit selects the next civil day's night. After: the same zero-tap
visit immediately shows the night the user is standing in; explicit date journeys
remain the same one selection, with no new prompt or setting.
