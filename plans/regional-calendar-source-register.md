# Tamil and Bengali calendar-base source register

Frozen: 2026-07-22. Scope: Tamil **Thirukanitha** and West Bengal
**Vishuddha Siddhanta** interpretation modes. These sources validate labels and
civil-day rules; they never replace Ganak's Lahiri astronomy.

## Independent published calendars

| Evidence | Source A | Source B | What is frozen |
|---|---|---|---|
| Tamil daily dates | [Drik Panchang Tamil calendar](https://www.drikpanchang.com/tamil/tamil-calendar.html?geoname-id=1264527) | [Prokerala Tamil calendar](https://www.prokerala.com/calendar/tamilcalendar.html) | All 365 civil-date labels, twelve starts, 2026 festival/date cross-checks |
| Tamil rule/terms | *The Indian Calendar* (Sewell & Dikshit), Tamil sunset rule | Tamil Virtual Academy / published Tamil calendar month terminology | Thirukanitha identity, twelve native month names, sunset assignment |
| Bengali daily dates | [Prokerala Bisuddha Siddhanta calendar](https://www.prokerala.com/calendar/bengalicalendar.html) | Published West Bengal calendar/Panjika cross-check collected in the dated fixture | All 365 civil-date labels and twelve starts; Vishuddha, not Bangladesh's fixed civil calendar |
| Bengali rule/terms | *The Indian Calendar* (Sewell & Dikshit), Bengal rule | Prokerala native-script Bisuddha Siddhanta month calendar | Twelve native month names, Bangabda, sunrise assignment |
| Exact solar ingress | [Drik Panchang 2026 Sankranti calendar](https://www.drikpanchang.com/sankranti/sankranti.html?lang=en&year=2026) | Ganak's independent astronomy plus published regional month-boundary calendars | Twelve exact Lahiri nirayana ingress moments and resulting civil boundaries |

## Convention decisions

- Tamil day 1 is the ingress civil date when ingress is before local sunset;
  after sunset it is the next civil date.
- Vishuddha Siddhanta day 1 is the sunrise after the ingress Panchang day; an
  after-sunset ingress belongs to the following Panchang day and therefore
  starts the month one further civil sunrise later.
- Bangladesh's Bangla Academy fixed calendar, Tamil Vakya Panchangam and Drik's
  separately labelled V Suryasiddhanta Bengali view are legitimate alternatives,
  but they are not silently merged into these two named modes.
- Published disagreements are recorded as convention differences. They are not
  “averaged” and do not count as unexplained mismatches.

## Permanent fixture contract

`src/data/regional-calendar-evidence.ts` freezes twelve exact ingresses, 24 month
boundaries, 730 anchor-city daily labels, 25 observance dates and all 24 native
month terms. `validation/regional-calendar-modes.cjs` expands this into the full
2026 year for Chennai, Kolkata, Delhi, London, New York, Sydney and Tromsø. A
release fails on a blank/impossible date, source-boundary drift, astronomy
mutation, lost URL state or any unclassified differential mismatch.

Residual risk remains as documented in `plans/regional-calendar-risk-plan.md`:
published calendars can share upstream data, native terminology can be formally
correct yet locally unfamiliar, and a short shadow period cannot reveal every
rare boundary. Runtime per-mode kill switches and visible canonical recovery
contain those risks without pretending they are zero.
