# Festival deciding-daypart audit

Status: research handoff for Claude Code; no application code changed by Codex.

Scope: every Tier-1 row currently present in `FESTIVALS` in `src/kundli-app.tsx`.
Reference location for the 2026 anchors is **Delhi / New Delhi, India** unless a
row explicitly says otherwise. Dates are location-sensitive and must be recomputed
for the user's city.

## Executive finding

The scanner cannot reach Drik parity by sampling every festival at one fixed clock
hour. The governing rule is whether the festival tithi occupies its prescribed
**kala** (part of the local Hindu day), sometimes with exclusions and fallbacks.
Those kalas move with local sunrise and sunset. Moonrise is independently local.

The current `DAYPART_HOUR = { udaya: 6, madhyahna: 12, aparahna: 15,
pradosha: 18, nishita: 24 }` is therefore only a temporary approximation:

- Pratahkala, Madhyahna and Aparahna are divisions of the actual sunrise-to-sunset
  interval, not fixed wall-clock hours. Drik explicitly divides daytime into five
  equal parts for Ganesh Chaturthi.
- Pradosha is derived from actual sunset.
- Nishita is Hindu midnight, derived from the local night, not always `00:00`.
- Moonrise cannot be represented by a fixed hour.
- A single sample point is insufficient for rules with overlap, exclusion or
  fallback logic. Raksha Bandhan, Holika Dahan and Navratri are concrete examples.

The correct implementation should compute a tithi interval and test its overlap
with the full local kala interval. See “Implementation contract” below.

## Vocabulary used in this audit

| Term | Meaning for the app |
|---|---|
| **Udaya / उदय** | Tithi prevailing at local sunrise. This is the default only when no festival-specific kala supersedes it. |
| **Pratahkala / प्रातःकाल** | First of the five equal parts of local daytime; starts at sunrise. |
| **Purvahna / पूर्वाह्न** | Forenoon, before local Madhyahna. Included because Vasant Panchami and Akshaya Tritiya use it. |
| **Madhyahna / मध्याह्न** | Middle (third) fifth of local sunrise-to-sunset daytime. |
| **Aparahna / अपराह्न** | Fourth fifth of local daytime. |
| **Pradosha / प्रदोष** | Dusk period derived from local sunset. |
| **Nishita / निशीथ** | Hindu midnight period derived from local night. |
| **Moonrise / चन्द्रोदय** | Astronomical local moonrise; required for moon-sighting fasts. |

Confidence: **🟢** means Drik states the deciding kala/rule and the date is
corroborated by another source or a named textual authority. **🟡** means the 2026
date is corroborated but an explicit universal rule was not found, sources disagree,
or a regional/tradition decision remains.

## Tier-1 audit table

| # | Festival — bilingual user-facing gloss | Deciding daypart and rule | 2026 Delhi / New Delhi anchor | Sources | Confidence |
|---:|---|---|---|---|:---:|
| 1 | **Lakshmi Panchami / लक्ष्मी पंचमी**<br>Shri Vrat—Lakshmi worship on Chaitra Shukla Panchami / श्री व्रत—चैत्र शुक्ल पंचमी पर लक्ष्मी पूजा | **Udaya.** Select Panchami prevailing at sunrise. | **23 Mar** | [Drik day anchor](https://www.drikpanchang.com/panchang/day-panchang.html?date=23%2F03%2F2026&geoname-id=1261481); [India Today states Udaya rule](https://www.indiatoday.in/information/story/lakshmi-panchami-2026-date-timings-significance-2885446-2026-03-23/) | 🟢 |
| 2 | **Ram Navami / राम नवमी**<br>Birth of Shri Rama at midday / मध्याह्न में श्रीराम जन्मोत्सव | **Madhyahna.** Select the day on which Chaitra Shukla Navami occupies Madhyahna. | **26 Mar (Smarta)**; **27 Mar (Vaishnava/ISKCON)** | [Drik Rama Navami rule and timings](https://www.drikpanchang.com/dashavatara/rama-navami/rama-navami-date-time.html?geoname-id=1273294&year=2026); Drik describes Rama's birth and puja in Madhyahna; the tradition split is also present in its 2026 calendar | 🟢 |
| 3 | **Hanuman Jayanti / हनुमान जयंती**<br>North-Indian Chaitra Purnima birth observance / उत्तर भारतीय चैत्र पूर्णिमा जन्मोत्सव | **Udaya / just after sunrise.** Use Chaitra Purnima at sunrise for this North-Indian row. Do not reuse it for Tamil, Telugu or Kannada Hanuman Jayanti variants. | **2 Apr** | [Drik Hanuman Jayanti rule and regional variants](https://www.drikpanchang.com/festivals/hanuman-jayanti/info/hanuman-jayanti.html); [Drik 2026 date](https://www.drikpanchang.com/hindu-festivals/hanuman-jayanti/hanuman-jayanti.html) | 🟢 |
| 4 | **Akshaya Tritiya / अक्षय तृतीया**<br>Vaishakha Shukla Tritiya for Lakshmi-Narayana worship and charity / लक्ष्मी-नारायण पूजा व दान की वैशाख शुक्ल तृतीया | **Purvahna coverage, with a tie-break—not Udaya.** Drik chooses 19 Apr even though Tritiya begins at 10:49 and remains through the next sunrise. A fixed sunrise rule would incorrectly choose 20 Apr. Apply the scriptural three-muhurta/Purvahna coverage rule; Drik remains the benchmark where authorities disagree. | **19 Apr** | [Drik 2026 date and 10:49–12:20 puja window](https://www.drikpanchang.com/festivals/akshaya-tritiya/akshaya-tritiya-date-time.html?geoname-id=1261481&year=2026); [Purvahna/tie-break discussion](https://navbharattimes.indiatimes.com/astro/religion-rituals/festivals-and-fasts/akshaya-tritiya-2026-date-19-or-20-april-akha-teej-kab-hai-akshaya-tritiya-muhurat/articleshow/130138881.cms/) | 🟡 |
| 5 | **Buddha Purnima / बुद्ध पूर्णिमा**<br>Vaishakha Purnima remembrance of Gautama Buddha / वैशाख पूर्णिमा पर गौतम बुद्ध का स्मरण | **Udaya** for the calendar date. This is the owner-approved exception to the Hindu-only content scope. | **1 May** | [Drik 2026 date and Purnima interval](https://www.drikpanchang.com/festivals/buddha-purnima/buddha-purnima-date-time.html?year=2026); [Drik Hindu-calendar anchor](https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?geoname-id=1261481&year=2026) | 🟡 |
| 6 | **Ashadha Gupt Navratri / आषाढ़ गुप्त नवरात्रि**<br>Nine nights of private Shakti/Mahavidya worship / शक्ति-महाविद्या की गुप्त साधना के नौ दिन | **Pratahkala Ghatasthapana on Pratipada.** Use the valid morning Pratipada window; Abhijit is a fallback where the primary morning window is unavailable. Avoid reducing this to a generic 06:00 sample. | **15 Jul** | [Drik Ashadha Gupt Navratri calendar](https://www.drikpanchang.com/navratri/ashadha-gupta-navratri-dates.html?geoname-id=1261481&year=2026); [Drik Navratri/Katyayani Kalpa basis](https://www.drikpanchang.com/navratri/info/navratri.html) | 🟢 |
| 7 | **Rath Yatra / रथ यात्रा**<br>Jagannath's Puri chariot procession / पुरी में जगन्नाथ की रथ यात्रा | **Udaya for Ashadha Shukla Dwitiya**, but first settle the product anchor: “Puri Rath Yatra” should probably follow **Puri's** date rather than recalculate a different ceremonial date for every user city. | **16 Jul in Puri and Delhi**; some overseas Drik location pages show **15 Jul** | [Drik location-sensitive Ratha Yatra page](https://www.drikpanchang.com/festivals/ratha-yatra/jagannatha-rathayatra-date-time.html?year=2026); [2026 Puri observance report](https://updateodisha.com/2026/07/16/ratha-yatra-2026-conducted-smoothly-despite-inclement-weather-95266/) | 🟡 |
| 8 | **Guru Purnima / गुरु पूर्णिमा**<br>Honour one's guru and Vyasa on Ashadha Purnima / आषाढ़ पूर्णिमा पर गुरु और व्यास पूजन | **Udaya** unless a tradition-specific puja rule is later sourced. | **29 Jul** | [Drik 2026 date](https://www.drikpanchang.com/festivals/guru-purnima/guru-purnima-date-time.html?year=2026); [AstroSage New Delhi tithi anchor](https://panchang.astrosage.com/festival/guru-purnima/guru-purnima?date=2026&language=en&view=amp) | 🟡 |
| 9 | **Hariyali Teej / हरियाली तीज**<br>Shravana Teej for Parvati-Shiva reunion and marital wellbeing / पार्वती-शिव मिलन व दाम्पत्य मंगल की श्रावण तीज | **Udaya-vyapini Tritiya.** Drik explicitly states Parvati festivals of this family use Tritiya at sunrise. | **15 Aug** | [Drik's explicit Udaya rule](https://news.drikpanchang.com/2013/08/hariyali-teej-on-august-9-or-10.html); [2026 date and tithi window](https://panchang.astrosage.com/festival/hariyali-teej?date=2026&language=en&view=amp) | 🟢 |
| 10 | **Nag Panchami / नाग पंचमी**<br>North-Indian Shravana Shukla Panchami serpent-deity worship / उत्तर भारतीय श्रावण शुक्ल पंचमी नाग-देवता पूजा | **Udaya / Pratahkala.** The puja begins at sunrise and occupies the early-morning window. This row is **not** Gujarat's Krishna-paksha Nag Pancham; that needs a separate regional rule. | **17 Aug**; Gujarat Nag Pancham **1 Sep** | [Drik date, early-morning muhurat and Gujarat variant](https://www.drikpanchang.com/festivals/nag-panchami/nag-panchami-date-time.html?year=2026); [Drik 2026 calendar corroboration](https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?geoname-id=1261481&year=2026) | 🟢 |
| 11 | **Krishna Janmashtami / कृष्ण जन्माष्टमी**<br>Midnight birth of Shri Krishna / निशीथ में श्रीकृष्ण जन्मोत्सव | **Nishita.** Select the civil night on which Ashtami occupies Nishita; Smartas also evaluate Rohini, and Vaishnava/ISKCON rules must remain a separate tradition policy. | **4 Sep** (Smarta and ISKCON coincide in Delhi in 2026) | [Drik Janmashtami timing, Rohini and Dharma-Shastra parana](https://www.drikpanchang.com/dashavatara/lord-krishna/krishna-janmashtami-date-time.html?geoname-id=1273294&year=2026); [secondary New Delhi rule summary](https://dekhopanchang.com/mai/festivals/janmashtami/2026/delhi) | 🟢 |
| 12 | **Raksha Bandhan / रक्षाबंधन**<br>Rakhi ceremony on Shravana Purnima, outside Bhadra / भद्रा से बाहर श्रावण पूर्णिमा पर राखी | **Aparahna preferred; Pradosha fallback; never Bhadra.** In 2026 Purnima ends at 09:48, so neither preferred kala exists: Drik permits sunrise–09:48 because Bhadra ended before sunrise. This must be a fallback policy, not one 15:00 sample. | **28 Aug**, usable window **05:57–09:48** | [Drik Delhi rule and 2026 exception](https://www.drikpanchang.com/festivals/raksha-bandhan/raksha-bandhan-date-time.html?geoname-id=1273294&year=2026); **Vratraj** is the authority named by Drik for avoiding Bhadra | 🟢 |
| 13 | **Hartalika Teej / हरतालिका तीज**<br>Parvati's fast and worship for marital wellbeing / दाम्पत्य मंगल हेतु पार्वती व्रत-पूजा | **Pratahkala.** In 2026 Tritiya ends at 07:06; the valid Delhi window is only 06:05–07:06. Noon selects the wrong day. | **14 Sep** | [Drik Delhi date and Pratahkala window](https://www.drikpanchang.com/festivals/teej/hartalika-teej-date-time.html?geoname-id=1273294&year=2026); [Drik Hariyali/Parvati Udaya principle](https://news.drikpanchang.com/2013/08/hariyali-teej-on-august-9-or-10.html) | 🟢 |
| 14 | **Ganesh Chaturthi / गणेश चतुर्थी**<br>Midday birth and installation worship of Ganesha / मध्याह्न में गणेश जन्म व स्थापना पूजा | **Madhyahna.** Select Chaturthi occupying the third fifth of local daytime. | **14 Sep** | [Drik date, definition and New Delhi muhurat](https://www.drikpanchang.com/festivals/ganesh-chaturthi/ganesh-chaturthi-date-time.html?year=2026); [Government Calendar Reform Committee report](https://dspace.gipe.ac.in/xmlui/bitstream/handle/10973/39692/GIPE-043972.pdf) supports prescribed-kala date determination | 🟢 |
| 15 | **Radha Ashtami / राधा अष्टमी**<br>Midday birth observance of Radharani / मध्याह्न में राधारानी जन्मोत्सव | **Madhyahna.** Select Ashtami occupying Madhyahna. | **19 Sep** | [Drik explicit Madhyahna rule and 2026 date](https://www.drikpanchang.com/festivals/radha-ashtami/radha-ashtami-date-time.html?year=2026); **Brihannaradiya Purana** is the vrat authority named on that page | 🟢 |
| 16 | **Shardiya Navratri begins / शारदीय नवरात्रि आरंभ**<br>Ghatasthapana begins nine nights of Durga worship / घटस्थापना से दुर्गा पूजा के नौ दिन आरंभ | **Pratahkala Ghatasthapana on Pratipada**, with rule-based Abhijit fallback and Chitra/Vaidhriti handling. | **11 Oct**; Delhi Ghatasthapana **06:19–10:12**, Abhijit **11:44–12:31** | [Drik New Delhi Ghatasthapana](https://www.drikpanchang.com/navratri/shardiya-navratri-ghatasthapana.html?geoname-id=1261481&year=2026); [Drik cites Katyayani Kalpa](https://www.drikpanchang.com/navratri/info/navratri.html) for Pratipada installation | 🟢 |
| 17 | **Maha Ashtami / महाअष्टमी**<br>Principal Durga Puja day; Sandhi Puja at the Ashtami-Navami junction / दुर्गा पूजा का प्रमुख दिन; अष्टमी-नवमी संधि पर संधि पूजा | **Udaya-vyapini Ashtami for the festival date; exact junction for Sandhi Puja.** Do not use a generic 08:00 or noon sample. | **19 Oct**; Ashtami ends **10:51** | [Drik 2026 Mahashtami and Sandhi definition](https://www.drikpanchang.com/navratri/durga-puja/mahashtami-date-time.html?geoname-id=1261481&year=2026); [Drik Maha Navami merger rule](https://www.drikpanchang.com/navratri/durga-puja/maha-navami-date-time.html?geoname-id=1261481&year=2026) | 🟢 |
| 18 | **Maha Navami / महानवमी**<br>Durga as Mahishasuramardini; Navami puja and homa / महिषासुरमर्दिनी दुर्गा; नवमी पूजा व हवन | **Composite rule.** Udaya-vyapini Navami governs Balidan; when Ashtami and Navami merge before Sanyakal, Ashtami, Sandhi and Navami pujas can occur on the same day. Keep a regional policy: Bengal's displayed Maha Navami may differ. | **19 Oct (general Vedic rule)**; **20 Oct (Bengal rule)** | [Drik general rule and date](https://www.drikpanchang.com/navratri/durga-puja/maha-navami-date-time.html?geoname-id=1261481&year=2026); **Nirnaya Sindhu** is named there for Udaya Navami and Aparahna Balidan; [Bengal variant](https://www.drikpanchang.com/navratri/durga-puja/bengal/maha-navami-date-time.html?geoname-id=1261481&year=2026) | 🟢 |
| 19 | **Dussehra / दशहरा**<br>Vijayadashami—victory of dharma; Aparahna worship / विजयादशमी—धर्म की विजय; अपराह्न पूजा | **Aparahna.** Select Dashami prevailing in Aparahna; show Vijaya Muhurta inside it. | **20 Oct** | [Drik Vijayadashami page](https://www.drikpanchang.com/festivals/vijayadashami/vijayadashami-date-time.html?geoname-id=1261481&year=2026); [AstroSage states Aparahna selection](https://panchang.astrosage.com/festival/dussehra/dussehra?date=2026&language=en) | 🟢 |
| 20 | **Sharad Purnima / शरद पूर्णिमा**<br>Kojagara night vigil and moonlit kheer on Ashwin Purnima / आश्विन पूर्णिमा की कोजागरा रात्रि व चाँदनी में खीर | **Nishita-vyapini Purnima.** The day whose Purnima covers Nishita is preferred for Kojagara/Sharad Purnima. | **25 Oct**; Nishita **23:40–00:31** | [Drik Delhi Nishita rule and timing](https://www.drikpanchang.com/festivals/kojagara/kojagara-puja-date-time.html?geoname-id=1273294&year=2026); **Skanda Purana** is the named authority on the page | 🟢 |
| 21 | **Ahoi Ashtami / अहोई अष्टमी**<br>Fast for children's wellbeing; puja and star sighting at dusk / संतान के मंगल हेतु व्रत; साँझ पूजा व तारा दर्शन | **Sanjh/Pradosha; stars for parana.** Select Ashtami covering evening twilight. Some families wait for moonrise, but the primary custom and app message should use star sighting. | **1 Nov**; puja **17:36–18:54**, stars about **18:00**, moonrise **23:40** | [Drik Delhi date, twilight and parana variants](https://www.drikpanchang.com/festivals/ahoi-ashtami/ahoi-ashtami-date-time.html?geoname-id=1273294&year=2026); [Drik calendar corroboration](https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?geoname-id=1261481&year=2026) | 🟢 |
| 22 | **Karva Chauth / करवा चौथ**<br>Day-long fast, evening puja, broken after moon sighting / दिनभर व्रत, संध्या पूजा, चन्द्र दर्शन के बाद पारण | **Moonrise decides the fasting day and parana; Pradosha/Sanjh is the puja window.** Chaturthi must remain valid at the relevant moonrise. | **29 Oct**; Delhi puja **17:38–18:56**, moonrise **20:17** | [Drik Delhi timing and Chaturthi interval](https://www.drikpanchang.com/festivals/karwa-chauth/karwa-chauth-date-time.html?geoname-id=1273294&year=2026); [Drik's Sankashti-family context](https://www.drikpanchang.com/vrats/sankashti-chaturthi-dates.html?geoname-id=1273294&year=2026) | 🟢 |
| 23 | **Diwali Lakshmi Puja / दिवाली लक्ष्मी पूजा**<br>Amavasya evening worship of Lakshmi, Ganesha and Saraswati / अमावस्या की संध्या में लक्ष्मी-गणेश-सरस्वती पूजा | **Pradosha-vyapini Amavasya**, preferably overlapping stable Vrishabha Lagna; keep Mahanishita Kali Puja as a separate Shakta timing, not as this row's deciding kala. | **8 Nov**; New Delhi Lakshmi Puja about **17:54–19:50** | [Drik 2026 Pradosha rule and city timing](https://www.drikpanchang.com/festivals/lakshmipuja/festivals-lakshmipuja-timings.html?geoname-id=1261481&year=2026); [Government Calendar Reform Committee report](https://dspace.gipe.ac.in/xmlui/bitstream/handle/10973/39692/GIPE-043972.pdf) for prescribed-kala date determination | 🟢 |
| 24 | **Magha Gupt Navratri / माघ गुप्त नवरात्रि**<br>Nine nights of Mahavidya-focused private Shakti worship / महाविद्या-केंद्रित गुप्त शक्ति साधना के नौ दिन | **Pratahkala Ghatasthapana on Pratipada**, using the same installation policy as other Navratris. | **19 Jan** | [Drik Gupt Navratri family](https://www.drikpanchang.com/navratri/magha-gupta-navratri-dates.html?geoname-id=1261481&year=2026); [AstroSage New Delhi 2026 calendar](https://panchang.astrosage.com/festival/navratri/magha-navratri?date=2026&language=en&view=amp); **Katyayani Kalpa** supplies the general Pratipada basis via Drik | 🟢 |
| 25 | **Vasant Panchami / वसंत पंचमी**<br>Saraswati/Shri Panchami worship in the forenoon / पूर्वाह्न में सरस्वती/श्री पंचमी पूजा | **Purvahna.** Select Panchami covering the forenoon; show the actual local Purvahna window. | **23 Jan** | [Drik explicit Purvahna rule](https://www.drikpanchang.com/festivals/vasant-panchami/info/vasant-panchami.html); [Drik timing method](https://www.drikpanchang.com/festivals/vasant-panchami/vasant-panchami-puja-date-time.html?geoname-id=1261481&year=2026) | 🟢 |
| 26 | **Maha Shivaratri / महाशिवरात्रि**<br>Night-long Shiva worship, especially at Nishita / रात्रि भर शिव पूजा, विशेषतः निशीथ में | **Nishita-vyapini Krishna Chaturdashi.** Also compute all four night prahar and next-day parana; midnight alone is not the whole user experience. | **15 Feb**; Nishita shortly after midnight on **16 Feb** | [Drik 2026 Nishita, four prahar and parana](https://www.drikpanchang.com/festivals/maha-shivaratri/maha-shivaratri-date-time.html?geoname-id=1273294&year=2026); [Drik festival anchor](https://www.drikpanchang.com/hindu-festivals/maha-shivaratri/maha-shivaratri.html) | 🟢 |
| 27 | **Sheetla Ashtami (Basoda) / शीतला अष्टमी (बसोड़ा)**<br>Sheetla Mata worship with food cooked the previous day / पिछले दिन बने भोजन से शीतला माता पूजा | **Udaya / daytime Ashtami.** The 2026 Ashtami starts before and ends after sunrise, so the date is unambiguous; an explicit universal sub-day selection rule still needs a named textual source. | **11 Mar** | [Drik 2026 date and full daytime puja window](https://www.drikpanchang.com/festivals/sheetala-ashtami/sheetala-ashtami-puja-date.html?geoname-id=1273294&year=2026); [Drik 2026 Hindu calendar](https://www.drikpanchang.com/calendars/hindu/hinducalendar.html?geoname-id=1261481&year=2026) | 🟡 |
| 28 | **Holika Dahan / होलिका दहन**<br>Chhoti Holi bonfire at dusk; colour-play Holi is the next day / प्रदोष में छोटी होली का दहन; रंगवाली होली अगले दिन | **Pradosha with Purnima, after Bhadra; then ordered fallbacks.** In 2026 Delhi Purnima ends before sunset, so Drik applies its exceptional Udaya-vyapini-Purnima rule and still places Dahan after sunset on 3 Mar. Never model this as a single 18:00 tithi sample. | **Holika Dahan 3 Mar**; **Rangwali Holi 4 Mar** | [Drik full decision tree](https://www.drikpanchang.com/festivals/holi/festivals-holika-dahan-timings.html?geoname-id=1273294&year=2026); **Dharma Sindhu** and **Nirnaya Sindhu** are named on the page; [Drik date anchor](https://www.drikpanchang.com/hindu-festivals/holi/holika-dahan.html) | 🟢 |

## Required product corrections exposed by the audit

1. **Rename the existing `holika` row in user-facing copy.** Its rule is Phalguna
   Purnima and its 2026 date is 3 March, so it represents **Holika Dahan / Chhoti
   Holi**, not colour-play **Holi**, which is 4 March. If both are wanted, create two
   distinct events; do not attach the same calculation to both names.
2. **Do not silently collapse tradition variants.** Rama Navami needs Smarta versus
   Vaishnava/ISKCON handling; Janmashtami needs Smarta versus Vaishnava policy even
   though they coincide in Delhi in 2026; Maha Navami needs general versus Bengal
   handling.
3. **Do not silently collapse regional variants.** The current Nag Panchami row is
   Shravana Shukla Panchami used in North India. Gujarat's Krishna-paksha Nag Pancham
   must be a separate regional event. Hanuman Jayanti also has major regional dates.
4. **Decide whether anchor-place festivals travel with the user.** Puri Rath Yatra
   is a ceremony in Puri. The product should likely display Puri's fixed ceremonial
   date worldwide while optionally showing a local temple's event separately.
5. **Akshaya Tritiya needs a dedicated rule and regression anchor.** Changing the
   global default to Udaya would move 2026 to 20 April and fail Drik's 19 April date.
6. **Raksha Bandhan and Holika Dahan need ordered fallback policies.** A `dp` string
   cannot represent their rules.

## Implementation contract for Claude Code

Represent a festival rule as policy, not only a representative hour. Suggested
shape (illustrative, not a required source-code design):

```text
{
  primaryKala: "aparahna",
  fallbackKala: ["pradosha", "udaya"],
  exclusions: ["bhadra"],
  tradition: "smarta|vaishnava|bengal|regional",
  anchorPlace: null | "Puri"
}
```

For each candidate civil day:

1. Compute true local sunrise, sunset, next sunrise and moonrise from the selected
   place's latitude, longitude and timezone.
2. Derive the complete local kala intervals. Divide sunrise-to-sunset into five
   equal parts for Pratahkala through Sayankala. Derive Nishita from the local night.
3. Compute exact tithi start/end instants; do not infer the decision from one sample.
4. Test overlap with the festival's primary kala, exclusions and ordered fallbacks.
5. Apply viddha/vriddhi/kshaya and tradition-specific tie-breaks.
6. Store both the selected date and the reason, so the UI can say, for example,
   “Shown on 14 Sep because Tritiya remains until 07:06 in Pratahkala.”

If the app cannot yet pass latitude/longitude into the scanner, that is a named
architecture gap. A timezone-only fixed-hour approximation should be labelled as
temporary and must not be described as exact Drik parity.

## Minimum 2026 regression anchors

These are the boundary cases most likely to catch a superficially plausible but
incorrect implementation:

```text
New Delhi 2026
Akshaya Tritiya       2026-04-19  (Purvahna; sunrise default would fail)
Rath Yatra            2026-07-16  (confirm Puri-anchor product policy)
Raksha Bandhan        2026-08-28  (Aparahna unavailable; morning fallback)
Hartalika Teej        2026-09-14  (Tritiya ends 07:06; noon would fail)
Maha Ashtami          2026-10-19  (Udaya plus Sandhi junction)
Maha Navami           2026-10-19  (general) / 2026-10-20 (Bengal)
Sharad Purnima        2026-10-25  (Nishita)
Ahoi Ashtami          2026-11-01  (Sanjh; noon would fail)
Holika Dahan          2026-03-03  (exception/fallback; Purnima ends before sunset)
Rangwali Holi         2026-03-04  (separate event/name)
```

## Source-quality note

Drik Panchang is the product benchmark and wins when public authorities disagree,
as requested by the owner. The Government of India's Calendar Reform Committee
report supports the general prescribed-kala method. The 🟡 rows are intentionally
not presented as fully closed research: they should not receive an invented
“classical” citation merely to make the table look complete.
