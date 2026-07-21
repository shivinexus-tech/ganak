# Makar Sankranti — sourced content brief

Status: implemented under `CODEX-P0-MAKAR-GUIDE-01` on 2026-07-20.

## Product decision

Makar Sankranti is a major Hindu solar festival, not a metadata-only calendar
label. Its dedicated page needs a complete household guide even though there is
no single compulsory pan-Indian fast. The page must distinguish the shared core
(Surya, Sankranti, snan, arghya, til, food/charity and gratitude) from regional
festival sequences such as Pongal, Magh Bihu and Uttarayan.

## Verified core

- **Calendar event:** Surya enters Makara in the nirayana/sidereal zodiac. Drik
  identifies Makar Sankranti as the most significant of the twelve Sankrantis and
  names Surya as the deity.
- **Uttarayana wording:** Makar Sankranti and the actual winter-solstice turn are
  no longer the same date because of precession. The religious calendar continues
  to preserve the sidereal Sun–star position. Ganak should state the traditional
  Uttarayana association and then explain the present astronomical distinction.
- **Main acts:** Surya worship, arghya, sacred bathing where customary, naivedya,
  charity and dakshina belong to the observance. Sankranti Punya Kala is local and
  follows the ingress; a later engine task is needed before Ganak can display that
  calculated interval correctly.
- **Til and seasonal food:** sesame and jaggery are widely offered, eaten, shared
  and donated. North Indian practice also prominently includes khichdi; Bihar has
  dahi-chura and tilkut traditions. These are regional customs, not one compulsory
  nationwide menu.
- **Regional identity:** Uttarayan, Pongal, Magh/Bhogali Bihu, Maghi, Khichdi
  Sankranti and the Andhra/Telangana Sankranti sequence are related seasonal or
  solar celebrations but should not be collapsed into one ritual checklist.

## Stories and source labels

1. **Surya and Shani:** a popular festival tradition treats Surya's entry into
   Makara, Shani's sign, as Surya visiting his son. Ganak labels this a popular
   katha whose retellings vary, and draws only the broad reconciliation lesson.
2. **Bhishma and Uttarayana:** the Mahabharata remembrance concerns Bhishma waiting
   for the auspicious northern course before leaving his body. Ganak uses it to
   explain Uttarayana's sacred importance, not to claim that today's January
   Sankranti is the physical solstice.
3. **Bhagiratha and Gangasagar:** the Ganga descent and liberation of Sagara's sons
   is strongly remembered in the Gangasagar pilgrimage tradition. Ganak labels it
   as that regional pilgrimage association rather than a universal origin story.

## Household guide boundary

- Give a simple, safe Surya-puja path: bathe, prepare the place, offer clean water
  as arghya with a familiar Surya name or prayer, offer/share regional food, give
  according to means, and close with gratitude.
- Do not invent a Sanskrit sankalpa or force one regional menu.
- Do not state that everyone must fast. Where a family keeps a Sankranti fast, its
  food, water and completion rule comes from that family or temple.
- Warn separately against staring at the Sun, unsafe river entry and unsafe kite
  strings. This does not redefine the religious practice.

## Sources consulted

- Drik Panchang, “Makar Sankranti” — deity, Makara ingress and core activities:
  https://www.drikpanchang.com/hindu-festivals/makar-sankranti/makar-sankranti.html
- Drik Panchang, “Sankranti in Hindu Calendar” — precession, Uttarayana distinction
  and 40-ghati Punya Kala rule:
  https://www.drikpanchang.com/sankranti/info/sankranti.html
- Drik Panchang, “Makar Sankranti | Sankranti” — modern solstice distinction and
  Surya significance:
  https://www.drikpanchang.com/sankranti/info/makar-sankranti.html
- Drik Panchang, city-specific Makar Sankranti timing — local Punya/Maha Punya Kala
  and associated snan, naivedya, charity and paran activities:
  https://www.drikpanchang.com/sankranti/makar-sankranti-date-time.html
- Incredible India / Madhya Pradesh Tourism — river bathing, sesame, jaggery,
  seasonal produce and charity:
  https://www.incredibleindia.gov.in/en/festivals-and-events/madhya-pradesh/makar-sankranti-fair
- Press Information Bureau / Uttar Pradesh — Surya arghya and sacred bathing at
  Prayagraj:
  https://www.pib.gov.in/FeaturesDeatils.aspx?ModuleId=2&NoteId=153655&lang=2&reg=48
- Government of India Utsav portal — North Indian til foods, kites and festival
  context:
  https://utsav.gov.in/public/event-category/harvest-festival
- Guntur District, Government of Andhra Pradesh — solar-calendar character and
  regional names:
  https://guntur.ap.gov.in/festival/sankranthi/
- President of India — agricultural gratitude and regional diversity:
  https://presidentofindia.nic.in/press_releases/presidents-greetings-eve-lohri-makar-sankranti-pongal-and-magh-bihu-0
- Drik Panchang, Bhishma Dwadashi katha — Bhishma waiting for Uttarayana:
  https://www.drikpanchang.com/vrat-katha/dwadashi/bhishma/bhishma-dwadashi-vrat-katha.html
- Brahma Purana chapter 78 text gateway — Sagara, Kapila, Bhagiratha and Ganga:
  https://vedapath.app/en/brahma-purana/the-twofold-ganga-sagara-s-sons-kapila-s-wrath-and

## Follow-up not hidden by this guide

Ganak still needs a location-aware **Sankranti Punya Kala / Maha Punya Kala**
engine and UI. The content guide must not fabricate that interval or imply that a
generic sunrise time is the calculated Sankranti window.

### Timing rule verified for implementation (2026-07-21)

- Punya Kala is daylight-only: daytime ingress starts the window; an ingress
  outside daylight moves the practical worship window to the applicable local
  sunrise, and the window ends at local sunset.
- Maha Punya Kala uses the first five daylight ghatis (one-sixth of that local
  sunrise-to-sunset span), clipped at sunset.
- Published Delhi anchors: 2026 daytime ingress 15:13, Punya 15:13–17:45 and Maha
  Punya 15:13–16:58; 2027 after-sunset ingress carries to 15 January sunrise,
  with Punya 07:15–17:46 and Maha Punya 07:15–09:00.
- Drik's explanatory paragraph says “1 Ghati” for daytime Maha Punya, but its
  published city windows consistently equal five daylight ghatis. Ganak follows
  the published windows and records this discrepancy rather than hiding it.
- Ganak's general Lahiri solar helper produced Makar ingress about 14 minutes
  earlier than Drik in each checked year. Published Delhi moments are 02:54 on
  15 January 2024, 15:13 on 14 January 2026 and 21:14 on 14 January 2027. A
  Sankranti-only 36.36-arcsecond correction matches all three without changing
  Moon/tithi calculations, charts or Prashna. This is intentionally not a global
  ayanamsa change.
