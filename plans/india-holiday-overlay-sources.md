# India public/national holiday overlay — source and scope register

Reviewed 2026-07-22. Product scope is intentionally narrower than “all Indian
holidays”: that phrase would incorrectly merge central, state, bank and local
closures.

## Shipped 2026 dataset

- **National layer:** Republic Day, Independence Day and Mahatma Gandhi's
  Birthday. This layer is the default and remains visually separate from Ganak's
  calculated Hindu observances.
- **Optional Central gazetted layer:** the 17 holidays listed for Central
  Government offices in Delhi/New Delhi for 2026. It is explicitly labelled by
  jurisdiction and year.
- **Not claimed:** state/UT, bank, school, exchange or employer closures. Those need
  their own official annual notification and an owner-approved jurisdiction model.

## Authoritative references

1. National Portal of India, Holiday Calendar — identifies Central and state/UT
   calendars and states that `G` means gazetted and `R` restricted:
   https://www.india.gov.in/calendar
2. Directorate of Forest Education, Government of India — 2026 gazetted list,
   citing the DoPT memorandum dated 3 July 2025:
   https://dfe.gov.in/list-of-holidays
3. India Post, Department of Posts — official 2026 All India and circle-specific
   holiday selector, used as an independent cross-check:
   https://www.indiapost.gov.in/holidays-list

## Maintenance contract

- Add a year only after two official sources agree or the later controlling
  notification explains the difference.
- Moon-dependent Islamic dates retain a visible “later notification may apply”
  marker.
- A state, bank or local layer must carry its jurisdiction and source year. It may
  never silently inherit the Central Delhi list.
- Holiday overlays never modify tithi, festival computation or regional calendar
  bases.
