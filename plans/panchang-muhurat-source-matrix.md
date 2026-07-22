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
| Brahma, Nishita, Godhuli, Pradosha | Sunrise/sunset-relative daily-kala conventions; Pradosha uses Ganak's existing three-Muhurta deciding-kala convention | local sunrise, sunset and next sunrise only | polar-unavailable result is explicit; all normal intervals finite and positive |
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
