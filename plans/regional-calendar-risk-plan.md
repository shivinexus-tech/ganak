# Regional calendar modes — mandatory risk-control and rollout plan

**Backlog:** P0 calendar-base support; P2 full regional-language calendars  
**Owner decisions:** 2026-07-21; automated-evidence replacement approved 2026-07-22
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

1. **Published anchors:** at least 100 permanent anchors per convention, agreed
   by at least two independent published calendars, including at
   least 24 month boundaries, 25 major observances, New Year, leap/Adhika behavior
   where applicable, midnight Sankranti, two-civil-date tithi, one DST diaspora
   city, one non-Indian city and one supported high-latitude case.
2. **Full-year differential:** generate the complete year for the region's anchor
   city plus US, UK and Australian diaspora cities. Compare against at least two
   independent published calendars. Every mismatch must be classified as Ganak defect,
   convention difference, location/day-part difference, comparator defect or an
   explicitly unsupported rule. **Zero unexplained mismatches may ship.**
3. **State preservation:** open festival → switch convention; switch place; switch
   language; reload; browser Back/Forward; PDF/export/reminder. The same user context
   must survive through URL state.
4. **Isolation:** run every canonical Ganak gate in every supported mode. Existing
   Panchang, festival, Prashna and Jyotish outputs must remain green.
5. **Presentation:** complete Hindi/English mode naming and convention explanation,
   visible loading/error/recovery, phone/desktop browser matrix and no overflow.
6. **Terminology:** verify regional month/day/observance terminology against at
   least two published native-language references. Native-human review is strongly
   recommended but is not a release blocker under the owner's 2026-07-22 decision.

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

One convention must pass research, dual-source anchors, full-year differential,
terminology verification, browser/phone tests and production shadow monitoring
before the next begins. Tamil and Bengali remain pre-launch scope; this sequence
does not defer either until after launch.

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

- its convention/source note and typed policy are documented;
- no astronomy-engine file was changed without explicit integration-owner review;
- invariance gate passes;
- 100+ dual-source published anchors pass;
- full-year multi-city differential has zero unexplained mismatches;
- native-language terminology agrees with two published references; optional
  native/regional reviewer feedback is recorded when available but is not blocking;
- route, language, location, PDF, export and reminder state tests pass;
- all canonical Ganak gates and production build pass;
- phone/desktop production checks pass with no console errors or overflow;
- independent disable and canonical fallback are demonstrated;
- evidence is recorded in `plans/task-log.md`, committed and pushed.

## Residual risks accepted with automated-only review

The owner approved automated evidence as the current release standard on
2026-07-22. This removes a coordination blocker but does not make the following
risks disappear:

- Two online calendars may share the same upstream data or defect, so apparent
  agreement is not always truly independent.
- A translated term can be lexically correct but sound unfamiliar or insensitive
  to native users.
- Tamil Thirukanitha and Vakya, and Bengali Vishuddha Siddhanta and other Panjika
  traditions, may legitimately disagree. Ganak must name its convention and never
  present a convention difference as universal truth.
- Sparse real traffic can make a short production shadow run falsely reassuring.
- Comparator websites can change historical output without version notice.

Mitigations: freeze source snapshots/expected fixtures in the repository; record
source, retrieval date and convention for every anchor; require two-source agreement
plus zero unexplained differential mismatches; label the selected tradition in the
UI; keep independent instant-disable switches and canonical recovery; monitor
impossible dates, blank labels and mismatch counters; invite native-user feedback
after release without representing it as prior human certification.
