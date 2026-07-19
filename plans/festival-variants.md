# Festival tradition and regional variant policy

**Status:** research recommendation for owner review; no app code has been changed.  
**Scope:** Hindu observances only. Dates below are for 2026 and use New Delhi unless an observance has a more appropriate regional or ceremonial anchor.

## Confidence key

- 🟢 — the date and deciding policy are supported by Drik Panchang plus an independent institutional calendar, government notice, or named textual authority.
- 🟡 — the date is usable, but a universal rule could not be verified, or credible sources/temple calendars disagree. The product must expose the uncertainty rather than silently choose.

## Product-wide rule

These are not aliases for one generic festival calculation. Each tradition or region listed below needs its own event identity, deciding rule, date result, and user-facing label. A user's city may adjust local tithi and kala boundaries, but it must never change the selected tradition. Anchor-place ceremonies such as Puri Rath Yatra are the exception: their official ceremonial date is displayed worldwide.

| Festival family | Variant | 2026 date and anchor | Deciding policy | Confidence |
|---|---|---|---|---|
| Ram Navami | Smarta | 26 Mar · New Delhi | Chaitra Shukla Navami selected for Rama's Madhyahna birth worship under the Smarta rule | 🟢 |
| Ram Navami | Vaishnava / ISKCON | 27 Mar · New Delhi | Separate Vaishnava/ISKCON calendar; Madhyahna worship, with Vaishnava date selection allowed to fall one day after Smarta | 🟡 rule / 🟢 date |
| Krishna Janmashtami | Smarta | 4 Sep · New Delhi | Ashtami at Nishita; Rohini is an additional preference/tie-break condition | 🟢 |
| Krishna Janmashtami | Vaishnava / ISKCON | 4 Sep · New Delhi | Separate Vaishnava calendar using Nishita, Ashtami and Rohini with Vaishnava tie-breaks | 🟡 rule / 🟢 date |
| Maha Navami | General Vedic/Navratri | 19 Oct · New Delhi | Merge rule for Ashtami-Navami puja; Balidan separately requires Udaya-vyapini Navami and Aparahna | 🟢 |
| Maha Navami | Bengal Durga Puja | 20 Oct · Kolkata/West Bengal | Bengal Panjika/Durga Puja day sequence; never inherit the general date | 🟢 |
| Nag Panchami | North Indian | 17 Aug · New Delhi | Shravana Shukla Panchami, morning/Pratah worship | 🟢 |
| Nag Pancham | Gujarat | 1 Sep · Ahmedabad/Gujarat | Shravana Krishna (Vad) Panchami, a separate observance fifteen days later | 🟢 |
| Hanuman Jayanti | North Indian | 2 Apr · New Delhi | Chaitra Purnima; dawn/sunrise worship | 🟢 |
| Hanuman Jayanthi | Telugu | 12 May · Hyderabad/Tirupati | 41-day observance from Chaitra Purnima through Vaishakha Krishna Dashami | 🟢 |
| Hanumana Jayanti | Kannada | 22 Dec · Bengaluru/Karnataka | Margashirsha Shukla Trayodashi (Hanuman Vratam) | 🟢 |
| Hanumath Jayanthi | Tamil | No single resolved Gregorian-2026 date; see below | Margazhi/Margashirsha Amavasya with Moola consideration; local temple schedules conflict | 🟡 |
| Jagannath Rath Yatra | Puri ceremonial date | 16 Jul · Puri | Official Puri temple/ceremonial date, displayed worldwide | 🟢 |

---

## 1. Ram Navami variants

### A. Smarta Ram Navami — स्मार्त राम नवमी

**English gloss:** Lord Rama's birth observance calculated by the general Smarta dharma-shastra calendar.  
**हिन्दी अर्थ:** सामान्य स्मार्त धर्मशास्त्रीय पंचांग से निर्धारित भगवान राम का जन्मोत्सव।

- **Deciding rule:** Chaitra Shukla Navami is judged around **Madhyahna** (the middle part of the day), the traditional birth kala for Rama. This is not a noon snapshot; the calendar must calculate the local Madhyahna interval and the Navami overlap.
- **2026 New Delhi date:** **Thursday, 26 March 2026**.
- **Sources:**
  - [Drik Panchang — Rama Navami overview and 26 March 2026 date](https://www.drikpanchang.com/hindu-festivals/rama-navami/rama-navami.html?time-format=24hour)
  - [Drik Panchang — 2026 Delhi Hindu calendar, showing Smarta 26 March and ISKCON 27 March](https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?geoname-id=1273294)
  - [Government of India 2026 calendar, listing Ram Navami on 26 March](https://iahe.morth.gov.in/sites/default/files/2026-01/Calendar_2026_0.pdf)
- **Confidence:** 🟢

### B. Vaishnava / ISKCON Ram Navami — वैष्णव / इस्कॉन राम नवमी

**English gloss:** Rama's appearance day as observed by Gaudiya Vaishnava/ISKCON calendars.  
**हिन्दी अर्थ:** गौड़ीय वैष्णव/इस्कॉन पंचांग के अनुसार भगवान राम का प्राकट्य दिवस।

- **Deciding rule:** Keep **Madhyahna** as the worship kala, but use a **separate Vaishnava/ISKCON date policy**. Drik explicitly warns that Vaishnava Rama Navami can be one day later than Smarta. The reviewed sources establish the 2026 result but do not publish enough of the complete Gaudiya tie-break hierarchy to reproduce it safely. Do not invent a universal sunrise or viddha formula; until that hierarchy is fully sourced, treat the trusted Vaishnava calendar result as its own policy.
- **2026 New Delhi date:** **Friday, 27 March 2026**.
- **Sources:**
  - [Drik Panchang — 2026 ISKCON festival calendar for Delhi](https://www.drikpanchang.com/iskcon/iskcon-event-calendar.html?geoname-id=1273294)
  - [Drik Panchang — ISKCON Rama Navami calculator](https://www.drikpanchang.com/iskcon/lord/rama-navami-date-time.html?geoname-id=1273294&year=2026)
  - [ISKCON Juhu — official 27 March 2026 celebration invitation](https://www.iskconmumbai.com/event/invitation-for-sri-ram-navami-celebration-2026-187/page/introduction-sri-ram-navami-celebrations-copy)
- **Confidence:** 🟢 for the 2026 date and Madhyahna worship; 🟡 for a locally reproducible, universal Vaishnava tie-break algorithm.

**Required product handling:** Show two distinct rows when the dates differ. Suggested labels are **“Ram Navami — Smarta / राम नवमी — स्मार्त”** and **“Ram Navami — Vaishnava (ISKCON) / राम नवमी — वैष्णव (इस्कॉन)”**. Never overwrite one with the other when the tradition toggle changes.

---

## 2. Krishna Janmashtami variants

### A. Smarta Krishna Janmashtami — स्मार्त कृष्ण जन्माष्टमी

**English gloss:** Krishna's birth fast selected by the general Smarta rules for Ashtami at midnight.  
**हिन्दी अर्थ:** निशीथ काल में अष्टमी के आधार पर स्मार्त नियमों से निर्धारित श्रीकृष्ण जन्म-व्रत।

- **Deciding rule:** Prefer the civil day on which Krishna Ashtami prevails during **Nishita** (local ritual midnight). **Rohini Nakshatra** adds preference when the rule must choose between adjacent days. Drik identifies *Dharma Sindhu* and *Nirnaya Sindhu* as the authorities for the non-Vaishnava/Smarta decision.
- **2026 New Delhi date:** **Friday, 4 September 2026**.
- **2026 local conditions:** Drik gives Nishita Puja approximately **23:57–00:43**, Ashtami approximately **02:25 on 4 September–00:13 on 5 September**, and Rohini approximately **00:29–23:04 on 4 September**. The date therefore has both the relevant Ashtami/Nishita condition and Rohini support.
- **Sources:**
  - [Drik Panchang — Smarta Krishna Janmashtami rule and calculator](https://www.drikpanchang.com/dashavatara/lord-krishna/krishna-janmashtami-date-time.html?geoname-id=1273294&year=2026)
  - Named textual authorities identified by Drik: ***Dharma Sindhu*** and ***Nirnaya Sindhu***.
- **Confidence:** 🟢

### B. Vaishnava / ISKCON Janmashtami — वैष्णव / इस्कॉन जन्माष्टमी

**English gloss:** Krishna's appearance fast selected by the Gaudiya Vaishnava/ISKCON calendar.  
**हिन्दी अर्थ:** गौड़ीय वैष्णव/इस्कॉन पंचांग से निर्धारित श्रीकृष्ण प्राकट्य-व्रत।

- **Deciding rule:** Use a separate Vaishnava calculation that considers **Ashtami at Nishita and Rohini**, then applies Vaishnava tie-breaks. Drik states that the Vaishnava fast can be one day later than the Smarta fast. The full hierarchy is tradition-specific and was not stated completely in the reviewed public sources, so it must not be reduced to “Ashtami at noon” or copied from the Smarta result.
- **2026 New Delhi date:** **Friday, 4 September 2026** — the two traditions **coincide** in Delhi this year.
- **When the dates differ:** Display both dates when the Smarta Nishita choice and the Vaishnava calendar's purity/tie-break rules select adjacent civil days. Coincidence in 2026 is not permission to merge their calculators.
- **Sources:**
  - [Drik Panchang — ISKCON Janmashtami, New Delhi, 2026](https://www.drikpanchang.com/iskcon/lord/krishna-janmashtami-date-time.html?geoname-id=1273294&year=2026)
  - [Drik Panchang — Smarta explanation noting Vaishnava dates may be one day later](https://www.drikpanchang.com/dashavatara/lord-krishna/krishna-janmashtami-date-time.html?geoname-id=1273294&year=2026)
  - [Gaudiya Vaishnava calendar for Vrindavan, listing 4 September 2026](https://www.purebhakti.com/resources/ebooks-magazines/bhagavat-patrika/calendars/562-2026-27-vaisnava-calendar-english-vrindavan/file)
- **Confidence:** 🟢 for the shared 2026 date; 🟡 for implementing the complete Vaishnava tie-break without a further Gaudiya calendar specification.

**Required product handling:** Keep **“Krishna Janmashtami — Smarta / कृष्ण जन्माष्टमी — स्मार्त”** and **“Krishna Janmashtami — Vaishnava (ISKCON) / कृष्ण जन्माष्टमी — वैष्णव (इस्कॉन)”** as separate event policies even in years when their displayed dates are identical.

---

## 3. Maha Navami / Durga Puja variants

### A. General Vedic/Navratri Maha Navami — सामान्य वैदिक/नवरात्रि महा नवमी

**English gloss:** The ninth Navratri worship day under the general North-Indian/Vedic sequence.  
**हिन्दी अर्थ:** सामान्य वैदिक/उत्तर भारतीय नवरात्रि क्रम के अनुसार नवमी पूजन का दिन।

- **Deciding rule:** This is not a simple sunrise-only rule. Drik states that if Ashtami and Navami merge before **Sayankala** on the Ashtami day, Ashtami Puja, Sandhi Puja and Navami Puja are performed on that same day. **Durga Balidan is a separate sub-event:** it requires **Udaya-vyapini Navami**, with **Aparahna** preferred according to *Nirnaya Sindhu*.
- **2026 New Delhi date:** **Monday, 19 October 2026** for Maha Navami Puja. Navami runs approximately **10:51 on 19 October–12:50 on 20 October**. Durga Balidan/Ayudha-related observances may therefore appear separately on 20 October.
- **Sources:**
  - [Drik Panchang — 2026 Maha Navami for New Delhi, including the merge rule](https://www.drikpanchang.com/navratri/durga-puja/maha-navami-date-time.html?geoname-id=1261481&year=2026)
  - Named textual authority for the Balidan kala: ***Nirnaya Sindhu***, as cited on the Drik page.
- **Confidence:** 🟢

### B. Bengal Durga Puja Maha Nabami — बंगाल दुर्गा पूजा महा नवमी

**English gloss:** Maha Nabami in the Bengal Durga Puja day sequence and Panjika tradition.  
**हिन्दी अर्थ:** बंगाल की दुर्गा पूजा और पांजिका परंपरा के क्रम से निर्धारित महा नवमी।

- **Deciding rule:** Use the **Bengal Durga Puja/Panjika policy** as its own event. In the 2026 tithi pattern, Bengal observes Maha Nabami on the following civil day rather than inheriting the general Maha Navami display date. The precise Bengal tie-break should remain attached to this policy, not expressed as a global “Navami at sunrise” shortcut.
- **2026 anchor date:** **Tuesday, 20 October 2026** · Kolkata/West Bengal.
- **Sources:**
  - [Drik Panchang — Bengal-rule Maha Navami calculator](https://www.drikpanchang.com/navratri/durga-puja/bengal/maha-navami-date-time.html?geoname-id=1275004&year=2026)
  - [Drik Panchang — 2026 Bengal Durga Puja calendar](https://www.drikpanchang.com/navratri/durga-puja/durga-puja-calendar.html?geoname-id=1264543&year=2026)
  - [Government of West Bengal holiday calendar, listing Maha Nabami on 20 October 2026](https://msme.wb.gov.in/cmsholiday)
- **Confidence:** 🟢

**Required product handling:** Show the Bengal variant when the user chooses Bengal/Shakta Durga Puja tradition, without changing the general Navratri event for everyone else. Do not combine Maha Navami Puja, Navami Homa, Durga Balidan, Ayudha Puja and Bengal Maha Nabami into one date field; they have related but distinct kala rules.

---

## 4. Nag Panchami variants

### A. North-Indian Nag Panchami — उत्तर भारतीय नाग पंचमी

**English gloss:** Serpent-deity worship on the bright-half Panchami of Shravana.  
**हिन्दी अर्थ:** श्रावण शुक्ल पंचमी को नाग देवताओं की पूजा।

- **Deciding rule:** **Shravana Shukla Panchami**, with the puja window in **Pratah/morning** according to local tithi overlap.
- **2026 New Delhi date:** **Monday, 17 August 2026**.
- **Sources:**
  - [Drik Panchang — 2026 Nag Panchami calculator](https://www.drikpanchang.com/festivals/nag-panchami/nag-panchami-date-time.html?geoname-id=1273294&year=2026)
  - [Drik Panchang — 2026 Delhi Hindu calendar](https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?geoname-id=1273294)
  - [Chhattisgarh General Administration Department/NIC — 2026 calendar, listing Nag Panchami on 17 August](https://gad.cg.gov.in/ias/Reports/Calender.aspx)
- **Confidence:** 🟢

### B. Gujarat Nag Pancham — गुजरात नाग पंचम

**English gloss:** Gujarat's serpent-worship observance on Shravana Vad/Krishna Panchami, fifteen days after the northern date.  
**हिन्दी अर्थ:** गुजरात में श्रावण वद/कृष्ण पंचमी को मनाया जाने वाला नाग-पूजन, जो उत्तर भारतीय तिथि से पंद्रह दिन बाद आता है।

- **Deciding rule:** **Shravana Krishna (Vad) Panchami**, judged for the Gujarat regional calendar. It is not the North-Indian Shukla Panchami moved by location.
- **2026 anchor date:** **Tuesday, 1 September 2026** · Ahmedabad/Gujarat.
- **Sources:**
  - [Drik Panchang — Nag Panchami page, explicitly giving the separate Gujarat date](https://www.drikpanchang.com/festivals/nag-panchami/nag-panchami-date-time.html?year=2026)
  - [Drik Panchang — Gujarati calendar showing Nag Pancham on Shravana Vad Pancham](https://www.drikpanchang.com/gujarati/calendar/gujarati-calendar.html?geoname-id=1279233&year=2026)
  - [Shirdi Sai Baba Temple 2026 calendar, listing “Naag Pancham (Gujarat)” on 1 September](https://shirdisairam.org/calendar/?force_download=2026%2FSaibaba+Temple+Calendar+2026_Layout.pdf)
- **Confidence:** 🟢

**Required product handling:** Create two event identities. Suggested names: **“Nag Panchami — North Indian / नाग पंचमी — उत्तर भारतीय”** and **“Nag Pancham — Gujarat / नाग पंचम — गुजरात”**. A region selector may decide which one is emphasized, but neither result may be generated by reusing the other's paksha rule.

---

## 5. Hanuman Jayanti regional observances

There is no single all-India Hanuman Jayanti calculator. The regional dates use different lunar months, tithis and even observance lengths.

### A. North-Indian Hanuman Jayanti — उत्तर भारतीय हनुमान जयंती

**English gloss:** Hanuman's birth celebration on Chaitra Purnima, especially common in North India.  
**हिन्दी अर्थ:** उत्तर भारत में प्रचलित चैत्र पूर्णिमा का हनुमान जन्मोत्सव।

- **Deciding rule:** **Chaitra Purnima**, with worship beginning at **dawn/sunrise**, the traditional birth time used by this observance.
- **2026 New Delhi date:** **Thursday, 2 April 2026**.
- **Sources:**
  - [Drik Panchang — regional Hanuman Jayanti rule overview](https://www.drikpanchang.com/festivals/hanuman-jayanti/info/hanuman-jayanti.html)
  - [Drik Panchang — 2026 North-Indian Hanuman Jayanti](https://www.drikpanchang.com/festivals/hanuman-jayanti/hanuman-jayanti-date-time.html?geoname-id=1273294&year=2026)
  - [India Today — 2026 regional-date summary, confirming 2 April in North India](https://www.indiatoday.in/information/story/hanuman-jayanti-2026-date-and-timing-telugu-jayanthi-details-2910377-2026-05-12)
- **Confidence:** 🟢

### B. Telugu Hanuman Jayanthi — तेलुगु हनुमान जयंती

**English gloss:** A 41-day Telugu observance ending on Vaishakha Krishna Dashami.  
**हिन्दी अर्थ:** चैत्र पूर्णिमा से शुरू होकर वैशाख कृष्ण दशमी को पूर्ण होने वाला 41-दिवसीय तेलुगु अनुष्ठान।

- **Deciding rule:** The **41-day span begins on Chaitra Purnima** and concludes on **Vaishakha Krishna Dashami**. The ending Jayanthi is therefore not calculated from the North-Indian one-day rule.
- **2026 anchor dates:** Begins **2 April 2026**; concludes **Tuesday, 12 May 2026** · Hyderabad/Tirupati.
- **Sources:**
  - [Drik Panchang — 2026 Telugu Hanuman Jayanthi and 41-day span](https://www.drikpanchang.com/telugu/festivals/hanuman-jayanthi/hanuman-jayanthi-date-time.html?year=2026)
  - Named textual authority used for the Telugu Dashami tradition: ***Parashara Samhita / Shri Hanumad Charitam***.
  - [Tirumala Tirupati Devasthanams — official temple celebrations on 12 May 2026](https://news.tirumala.org/hanuman-jayanthi-celebrations-in-ttd-local-temples-on-may-12-_-%E0%B0%AE%E0%B1%87-12%E0%B0%A8-%E0%B0%9F%E0%B1%80%E0%B0%9F%E0%B1%80%E0%B0%A1%E0%B1%80-%E0%B0%B8%E0%B1%8D%E0%B0%A5%E0%B0%BE%E0%B0%A8/)
- **Confidence:** 🟢

### C. Kannada Hanumana Jayanti / Hanuman Vratam — कन्नड़ हनुमान जयंती / हनुमान व्रत

**English gloss:** Karnataka's Hanuman Vratam on Margashirsha Shukla Trayodashi.  
**हिन्दी अर्थ:** कर्नाटक परंपरा में मार्गशीर्ष शुक्ल त्रयोदशी को किया जाने वाला हनुमान व्रत।

- **Deciding rule:** **Margashirsha Shukla Trayodashi** under the Kannada calendar; commonly called Hanuman Vratam/Hanumana Jayanti.
- **2026 anchor date:** **Tuesday, 22 December 2026** · Bengaluru/Karnataka.
- **Sources:**
  - [Drik Panchang — Kannada Hanuman Jayanti rule and regional comparison](https://www.drikpanchang.com/kannada/festivals/hanuman-jayanti/hanuman-jayanti-date-time.html?year=2026)
  - [Drik Panchang — 2026 Kannada calendar showing Margashirsha Shukla Trayodashi on 22 December](https://www.drikpanchang.com/kannada/calendar/kannada-calendar.html?geoname-id=1263814&year=2026)
  - [Bengaluru Hanuman Temple — Karnataka date and Trayodashi rule](https://hanumantemple.in/when-is-hanuman-jayanti/)
- **Confidence:** 🟢

### D. Tamil Hanumath Jayanthi — तमिल हनुमत् जयंती

**English gloss:** Tamil Hanuman birth worship associated with Margazhi Amavasya and Moola Nakshatra.  
**हिन्दी अर्थ:** तमिल परंपरा में मार्गळी/मार्गशीर्ष अमावस्या और मूल नक्षत्र से जुड़ा हनुमान जन्मोत्सव।

- **Deciding rule:** Drik describes **Margashirsha/Margazhi Amavasya** as controlling, with **Moola Nakshatra** preferred when it overlaps; Amavasya prevails if the two do not coincide.
- **2026 anchor result:** **Unresolved for a single Gregorian-2026 Tamil date.** Drik's year result states that there is no Tamil Hanumath Jayanthi in Gregorian 2026 and gives the next observance as **Thursday, 7 January 2027**. However, the Tamil Nadu HR&CE festival calendar lists temple-specific “Hanuman Jayanthi” events on **8–9 December 2026**. Those official temple listings do not establish a single pan-Tamil calendrical rule and conflict with the Drik result.
- **Sources:**
  - [Drik Panchang — regional Hanuman Jayanti rule overview](https://www.drikpanchang.com/festivals/hanuman-jayanti/info/hanuman-jayanti.html)
  - [Drik Panchang — Tamil Hanumath Jayanthi calculator](https://www.drikpanchang.com/festivals/hanuman-jayanti/tamil-hanumath-jayanthi-date.html?year=2026)
  - [Tamil Nadu Hindu Religious and Charitable Endowments Department — December 2026 temple festival listings](https://hrce.tn.gov.in/hrcehome/hrce-festival-calendar.php?month=12&year=2026)
- **Confidence:** 🟡
- **Unresolved product decision:** Do not publish a universal Tamil 2026 date yet. The safe first implementation is a separate Tamil calculator following the sourced Amavasya/Moola rule, with a note that individual temples can observe on their own schedule. Before launch, verify the result against at least one named Tamil *Panchangam* publisher for Chennai; do not treat temple event dates as proof of the pan-regional calculation.

**Required product handling:** Use four separate event identities and calculators. The North date, Telugu end date, Kannada Trayodashi and Tamil Amavasya/Moola policy must not share a `Hanuman Jayanti` date function. For Telugu, store and display both the 41-day beginning and concluding Jayanthi.

---

## 6. Puri Jagannath Rath Yatra policy

### Puri Jagannath Rath Yatra — पुरी जगन्नाथ रथ यात्रा

**English gloss:** The annual ceremonial chariot procession of Lord Jagannath, Balabhadra and Subhadra at Puri.  
**हिन्दी अर्थ:** पुरी में भगवान जगन्नाथ, बलभद्र और सुभद्रा की वार्षिक राजकीय/मंदिर रथ यात्रा।

- **Religious rule:** The festival is associated with **Ashadha Shukla Dwitiya**, but “Puri Rath Yatra” names a real ceremony controlled by the Puri temple calendar and local administration.
- **2026 anchor date:** **Thursday, 16 July 2026** · Puri, Odisha.
- **Sources:**
  - [Drik Panchang — Puri/India Jagannath Rath Yatra calendar](https://www.drikpanchang.com/festivals/ratha-yatra/jagannatha-rathayatra-date-time.html?geoname-id=1259184&year=2026)
  - [Odisha Government 2026 holiday notification, listing Rath Yatra on 16 July](https://revenue.odisha.gov.in/sites/default/files/2025-11/42428.pdf)
  - [Akashvani/News on AIR — Puri Rath Yatra scheduled for 16 July 2026](https://newsonair.gov.in/odisha-preparations-enter-final-stage-for-lord-jagannaths-rath-yatra/)
- **Confidence:** 🟢

### Product recommendation

Display **Puri's fixed official ceremonial date worldwide**. Do not recompute “Puri Rath Yatra” from the user's longitude, because an overseas local tithi boundary can produce 15 July even though the procession in Puri occurs on 16 July. Use Puri as the anchor place and explain this plainly:

- **English:** “Puri temple ceremony — shown in your local time, but the festival date follows Puri.”
- **हिन्दी:** “पुरी मंदिर का उत्सव — समय आपके स्थान के अनुसार दिख सकता है, पर त्योहार की तारीख़ पुरी के अनुसार रहेगी।”

If Ganak later supports a user's local temple or ISKCON chariot procession, create a separate event such as **“Local Rath Yatra / स्थानीय रथ यात्रा”** with its own organizer-supplied date. Never relabel that as the official Puri event.

---

## Implementation handoff rules

1. Give every row above a distinct event identifier; shared English words do not imply shared date logic.
2. Store `tradition` or `regionPolicy` separately from `place`. Changing city recalculates local kala only where the policy is location-based; it must not switch Smarta to Vaishnava, North to Gujarat, or North to Telugu.
3. Store an `anchorPlace` for Puri Rath Yatra and other real-location ceremonies. Their official date is not recalculated from the viewer's city.
4. When two traditions coincide, show one compact date card with both clearly named badges if desired, but preserve both underlying results and rules.
5. When sources conflict, show a visible “tradition varies” note. Never hide 🟡 uncertainty behind a single confident date.
6. The Tamil Hanumath Jayanthi result remains research-blocked for a universal 2026 date; all other 2026 dates in this document are ready to become regression anchors after owner approval.
