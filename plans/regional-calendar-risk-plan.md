# Regional calendar modes — mandatory risk-control and rollout plan

**Backlog:** P0 calendar-base support; P2 full regional-language calendars  
**Owner decision:** 2026-07-21  
**Purpose:** prevent a regional calendar mode from silently changing Ganak's
validated astronomy, established festival dates or unrelated Jyotish journeys.

No engineering process can promise literal zero defects. This plan targets the
dangerous failure modes structurally and makes unexplained mismatches a release
blocker.

## Non-negotiable architecture

**One astronomy engine; multiple calendar interpretations.** Calculate planetary
positions, sunrise, tithi, nakshatra, yoga and karana once. A regional convention may
interpret those immutable facts into a month, year, day label and regional
observance identity. It must never recalculate or mutate astronomy.

```text
Validated astronomy
        ↓
Place + timezone + sunrise
        ↓
Typed regional CalendarConvention
        ↓
Month/year/day/observance interpretation
        ↓
UI, routes, PDF, exports and reminders
```

Use a typed contract equivalent to:

```ts
type CalendarConvention = {
  id: "north-purnimanta" | "amanta" | "tamil-solar" | "bengali-solar";
  monthAt(moment: number, place: Place): RegionalMonth;
  yearAt(moment: number, place: Place): RegionalYear;
  dayLabel(moment: number, place: Place): RegionalDay;
  observanceRules: RegionalObservanceRule[];
};
```

Do not scatter regional `if/else` branches through Panchang, festival, route, PDF
or notification code. Keep one canonical internal instant/date; display labels must
never become calculation inputs. Store the selected convention in the URL only,
consistent with Ganak's browser-storage ban.

## Frozen invariants

Switching convention must not alter:

- Lahiri ayanamsha or mean Rahu/Ketu defaults;
- Sun/Moon/planetary longitudes;
- sunrise, sunset, moonrise or moonset;
- tithi, nakshatra, yoga or karana boundaries;
- Prashna, Kundli, Muhurat, Hora or Panchaka results;
- the identity of an already-open permanent route;
- selected place, civil date or language without an explicit user action.

Add a permanent cross-mode invariance gate comparing these values bit-for-bit or at
the engine's documented tolerance.

## Validation required for every convention

1. **Published anchors:** 50–75 permanent anchors per convention, including at
   least 24 month boundaries, 25 major observances, New Year, leap/Adhika behavior
   where applicable, midnight Sankranti, two-civil-date tithi, one DST diaspora
   city, one non-Indian city and one supported high-latitude case.
2. **Full-year differential:** generate the complete year for the region's anchor
   city plus US, UK and Australian diaspora cities. Compare against an established
   published calendar. Every mismatch must be classified as Ganak defect,
   convention difference, location/day-part difference, comparator defect or an
   explicitly unsupported rule. **Zero unexplained mismatches may ship.**
3. **State preservation:** open festival → switch convention; switch place; switch
   language; reload; browser Back/Forward; PDF/export/reminder. The same user context
   must survive through URL state.
4. **Isolation:** run every canonical Ganak gate in every supported mode. Existing
   Panchang, festival, Prashna and Jyotish outputs must remain green.
5. **Presentation:** complete Hindi/English mode naming and convention explanation,
   visible loading/error/recovery, phone/desktop browser matrix and no overflow.

Suggested anchor cities: New Delhi (North/Purnimanta), Chennai (Tamil), Hyderabad
(Telugu), Kolkata (Bengali), Kochi (Malayalam), Ahmedabad (Gujarati), Mumbai/Pune
(Marathi), plus one city each in the US, UK and Australia.

## Staged rollout

Implement and release sequentially:

1. Amanta/Purnimanta switch.
2. Tamil solar calendar.
3. Telugu calendar.
4. Bengali solar calendar.
5. Malayalam calendar.
6. Gujarati calendar.
7. Marathi calendar.
8. Kannada, Odia and Assamese according to verified demand.

One convention must pass research, anchors, full-year differential, native review,
browser/phone tests and production shadow monitoring before the next begins.

## Feature flags, shadow mode and fallback

- Every convention has an independent feature flag and can be disabled without
  redeploying or affecting the canonical Ganak mode.
- Run a new convention in production shadow calculation before exposing its switch;
  record mismatches without changing user output.
- Default/fallback remains canonical Ganak Panchang. A failed or unsupported mode
  displays a bilingual recovery message and returns to canonical interpretation
  without losing place/date/language/route.
- Monitor impossible dates, blank months, duplicate observances, route failures and
  mismatch counts by convention. No silent fallback.

## Definition of done for one regional mode

A mode closes only when:

- its convention/source note and typed policy are reviewed;
- no astronomy-engine file was changed without explicit integration-owner review;
- invariance gate passes;
- 50–75 published anchors pass;
- full-year multi-city differential has zero unexplained mismatches;
- native/regional reviewer signs off names and observance identity;
- route, language, location, PDF, export and reminder state tests pass;
- all canonical Ganak gates and production build pass;
- phone/desktop production checks pass with no console errors or overflow;
- independent disable and canonical fallback are demonstrated;
- evidence is recorded in `plans/task-log.md`, committed and pushed.
