# Panchang windows, special yogas and Samskara source matrix

**Backlog packages:** P0-6 through P0-10

**Calculation default:** Lahiri ayanamsha, mean Rahu/Ketu

**Day boundary:** local sunrise to next local sunrise unless a row explicitly
states civil-day presentation.

This register separates published rule evidence from Ganak's implementation and
permanent gates. A comparator is not treated as scripture; a mismatch must be
classified before changing an engine.

| Family | Published reference / convention | Ganak implementation | Permanent evidence |
|---|---|---|---|
| Bhadra / Vishti | Karana boundary in the daily Panchang; Vishti alone is labelled Bhadra | `bhadraWindows` solves every 6° elongation boundary | 370 sunrise-days; finite, in-range, ordered and non-overlapping intervals |
| Dur Muhurta | Drik Panchang daily Panchang; weekday day/night slot table | 15 equal day/night Muhurta slots, including Tuesday night | Anand/Delhi 19 July 2026 minute anchor plus 370-day structural gate |
| Varjyam / Amrit Kalam | Drik Panchang and South-Indian Panchang Nakshatra Tyajya convention | measured nakshatra duration scaled to 60 ghatis; four-ghati interval | Anand 19 July 2026 start/end anchors plus 370-day structural gate |
| Brahma, Nishita, Godhuli, Pradosha | Sunrise/sunset-relative daily-kala conventions; Pradosha uses Ganak's existing three-Muhurta deciding-kala convention. **Godhuli convention, declared 2026-08-14 (C3-GODHULI-DRIK):** it BEGINS at sunset and runs for half a night muhurta — the night from sunset to the next sunrise divided into fifteen muhurtas. It is a dusk window that opens at sunset, not one centred on it. Matches [Drik Panchang](https://www.drikpanchang.com/panchang/day-panchang.html) to the minute on four anchors. | local sunrise, sunset and next sunrise only | polar-unavailable result is explicit; all normal intervals finite and positive. Godhuli additionally pinned by `validation/drik-reference-anchors.cjs`: New Delhi 2026-07-25 and 2026-11-15, Mumbai and Chennai 2026-07-25, with the rule (`start === sunset`, length === half a night muhurta) asserted exactly, not merely within tolerance |
| Moonrise / Moonset | Drik Panchang daily Panchang. **Pairing convention (C3-MOONSET-DRIK):** moonrise is the Moon's rise inside the local calendar day, and moonset is the set that CLOSES that rise — normally after midnight on the next civil date, printed with that date. When the Moon does not rise on the day, the set inside the day is shown instead. | altitude scan of the Moon's true ecliptic latitude with `h0 = +0.125°` (mean parallax folded into the horizon depression), refined by bisection. Once a rise is found the scan follows it for up to half a lunation, because at high latitude the closing set can be many days later; an earlier in-day set is never used as its fallback. | **Declared tolerance: ±6 minutes for lunar events**, ±2 minutes for solar. Current exact New Delhi 2026-07-25 Drik monthly anchor: moonrise 16:16, moonset 26:21+; Ganak 16:15/02:20. Four published ordinary-latitude anchors plus a 360-day, four-city sweep; high-latitude regression anchors at Tromsø, Reykjavík and Longyearbyen prove closing sets 4–9 days after rise never pair backwards. |
| Cross-midnight presentation | Drik Panchang dates every value that ends after midnight; current New Delhi reference example is "02:21 AM, Jul 26" | one shared contract in `src/components/format.ts` (`crossesDay` / `withDayDate` / `dayClock` / `dayRange`), anchored to the panchang day's sunrise; a window carries its date once, at the end. IANA-zone-aware rendering changes offset at the instant, so a panchang night crossing DST does not inherit the anchor's stale offset. | `validation/cross-midnight-date.cjs` — exhaustive engine+renderer sweep over four cities in EN and HI; Today screen rendered to reader-visible text; New York spring/fall DST anchors; year/half-hour/quarter-hour and multi-day one-date cases; static proof that the festival renderer delegates date crossing to the shared contract. Mutation-tested in both contract and as-rendered layers. |
| Panchang clock notation | [Drik Panchang](https://www.drikpanchang.com/panchang/day-panchang.html) defaults to 12-hour local clocks with AM/PM, applies DST, and dates post-midnight values; owner approved the same convention for Ganak Hindi on 2026-08-15 | `panchangTime` in `src/components/format.ts` is the single 12-hour clock renderer for Hindi Panchang, Muhurat, festival and eclipse timings; English retains its existing typography while using the same shared implementation | `validation/hindi-panchang-clock.cjs` pins Hindi and English 12-hour output, IANA/DST behavior, shared-renderer adoption and absence of per-surface `hour12`/`hourCycle` decisions; mutation-tested by restoring Festival's former Hindi 24-hour branch |
| Chandra/Tara Bala | Nine-Tara and Moon-house convention | all 12 birth signs and all 27 birth nakshatras returned daily | exhaustive coverage on 370 days |
| Disha Shool | weekday direction table | one bilingual direction per weekday | seven-weekday and 370-day coverage |
| Nalla Neram / Gowri | Drik Panchang's seven published weekday day/night Gowri tables | 8 daylight + 8 night divisions, visibly marked Tamil | Delhi, Chennai and Kolkata weekday/table invariance |
| Anandadi | 28-mansion Anandadi convention with Abhijit insertion | mansion + weekday mapping, visibly separate from Tamil timings | published 19 July 2026 Mitra anchor and annual coverage |
| Special yogas | Drik Panchang yearly Sarvartha/Amrita Siddhi, Ravi Yoga, Pushya, Dwipushkar, Tripushkar and Ganda Moola calendars | interval engine splits at nakshatra and tithi boundaries | all eight calendars non-empty in 2026; every interval positive, in-range and non-overlapping per yoga; dated Dwi/Trip/Amrita anchors |
| Mundan | [Drik Mundana rules and 18 July 2026 Kanpur no-Muhurat comparator](https://www.drikpanchang.com/shubh-dates/sanskara/mundana/mundana-dates-with-muhurat.html?geoname-id=1267995) | dedicated month, tithi, nakshatra, weekday, lagna and eighth-house screening | exact rule set, dated comparator, seasonal non-vacuity and bilingual input model |
| Namakaran | [Drik Namakarana rules and 18 July 2026 Pune no-Muhurat comparator](https://www.drikpanchang.com/shubh-dates/sanskara/namakarana/namakarana-dates-with-muhurat.html?geoname-id=1259229) | dedicated tithi/nakshatra/weekday, movable-lagna, eighth-house and malefic screen | exact rule set, dated comparator, seasonal non-vacuity and birth-nakshatra input |
| Annaprashana | [Drik rules and 25 July 2026 Delhi no-Muhurat comparator](https://www.drikpanchang.com/shubh-dates/sanskara/annaprashana/annaprashana-dates-with-muhurat.html?date=25%2F07%2F2026&lang=en) | dedicated tithi/nakshatra/weekday, lagna, tenth-house/Moon-house and before-midday screen | exact rule set, dated comparator, seasonal non-vacuity and customary-month input |
| Vidyarambha | [Drik rules and 11 December 2026 Delhi intervals](https://www.drikpanchang.com/shubh-dates/sanskara/education/vidyarambha/vidyarambha-dates-with-muhurat.html?date=11%2F12%2F2026&time-format=24plushour) | dedicated tithi/nakshatra/weekday, fixed-lagna exclusion and empty-eighth screen | exact rule set, positive and negative dated comparators, seasonal non-vacuity and tradition input |
| Upanayana | [Drik Upanayana 18 July 2026 Kharagpur no-Muhurat comparator](https://www.drikpanchang.com/shubh-dates/sanskara/upanayana/upanayana-dates-with-muhurat.html?geoname-id=1266976) | dedicated rule table and ceremony-specific lagna windows | dated comparator, seasonal non-vacuity and Vedic/family-tradition input |

## Regional-calendar release boundary

Canonical, Gregorian, Amanta and North-Purnimanta presentation are currently the
supported switch set. Tamil-solar and Bengali-solar interpretation code is kept
dark until every requirement in `plans/regional-calendar-risk-plan.md` is green:
50–75 published anchors per mode, full-year multi-city differential with zero
unexplained mismatches, native reviewer sign-off, state-preservation matrix,
independent fallback/disable and production shadow monitoring. Hidden code is not
counted as a shipped or completed mode.
