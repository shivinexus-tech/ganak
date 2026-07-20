# Skanda Shashti / Kanda Sashti — Research Draft

**Status:** DRAFT — OWNER REVIEW REQUIRED  
**Research date:** 2026-07-20  
**Scope:** Research and proposed bilingual copy only. No app code or calendar rule has been changed.

## 1. What this guide must distinguish

Ganak must not blend these observances into one generic card:

1. **Monthly Skanda Shashti:** a Murugan/Subrahmanya vrata associated with Shukla Paksha Shashti in Ganak's current calendar model.
2. **Annual Kanda Sashti:** the major six-day Tamil observance in Aippasi/Kartika, beginning after Amavasya and culminating in Soorasamharam.
3. **Soorasamharam:** the sixth-day commemoration of Murugan's victory over Surapadman; it is the culmination of the annual sequence, not a synonym for every monthly Shashti.
4. **Thirukalyanam:** the following day's divine-wedding celebration. Temple traditions differ over the locally emphasized consort or presentation, so Ganak should follow the selected temple/tradition rather than state one version as universal.

Murugan, Skanda, Kartikeya, Subrahmanya and Shanmukha are names used for the deity in different regions and traditions. [Drik Panchang](https://www.drikpanchang.com/vrats/skanda-sashti-dates.html?lang=en)

## 2. Calendar rule and applicable traditions

### Monthly observance

Drik Panchang describes the monthly vrata as Shukla Paksha Shashti and applies a Panchami–Shashti day-selection rule: when Panchami ends or Shashti begins between sunrise and sunset, that civil day can be selected. This can make the displayed vrata appear one day earlier than a simple "Shashti at sunrise" lookup. Drik attributes this approach to Dharmasindhu/Nirnayasindhu and says Tiruchendur follows it. [Drik Panchang](https://www.drikpanchang.com/vrats/skanda-sashti-dates.html?lang=en)

The Government of India's Utsav page, with event information attributed to Tamil Nadu's Hindu Religious and Charitable Endowments administration, describes Sashti worship at Tiruchendur as occurring twice monthly. This is broader than Ganak's current recurring `skandaShashti` key. Ganak should therefore label its current result **"Monthly Shukla Shashti vrata"** and should not imply that Krishna Paksha temple worship is invalid or nonexistent. [Utsav — Ministry of Tourism](https://utsav.gov.in/public/view-event/kandhar-sasti-festival-2024-arulmigu-subramaniya-swamy-temple-tiruchendur-1)

### Annual observance

The annual six-day Kanda Sashti begins on Pratipada after the Aippasi/Kartika Amavasya and culminates on day six with Soorasamharam. Drik and Tamil temple-oriented sources agree on this broad sequence. [Drik Panchang](https://www.drikpanchang.com/festivals/soorasamharam/soorasamharam-date-time.html), [Tiruchendur festival overview](https://tiruchendur.org/festivals.htm), [Himalayan Academy](https://www.himalayanacademy.com/media/books/holy-festivals_ei/Hindu-Festival_Skanda-Shashti_magazine-color.pdf)

The annual observance is especially important in Tamil Shaiva/Murugan traditions and is also maintained by diaspora temples. A North American temple schedule, for example, shows six days of Murugan worship, Soorasamharam on day six, and Kalyanotsavam the next day. [Hindu Community and Cultural Center, Livermore](https://livermoretemple.org/cms/wp-content/uploads/2025/09/skanda-shashti-celebrations.pdf)

## 3. Verified practice elements

- Traditional fasting forms vary. Sources describe complete fasting as well as fruit, milk, simple unsalted food, or one daily meal. Ganak should present these as established variants—not replace the stricter form and not present one form as compulsory for every family. [Himalayan Academy](https://www.himalayanacademy.com/media/books/holy-festivals_ei/Hindu-Festival_Skanda-Shashti_magazine-color.pdf), [Tiruchendur vrata overview](https://tiruchendur.org/vratam.htm)
- A documented Tamil household tradition keeps daytime fasting with food at night for the first five days, observes a complete fast on day six (with milk/fruit for those following that permitted variant), and completes the annual fast with food on the morning of day seven. Ganak may present this as a **Tamil tradition**, not as the only rule followed by every Murugan temple or family. [Sampradhayam](https://www.sriramanavami.com/books/2023-Sampradhayam-Vol-1-English.pdf)
- Home worship may center on Murugan and the Vel, with a lamp, flowers or fruit, prayer and the recitation or listening of familiar Murugan hymns. Kanda Sashti Kavacham is specifically attested in the religious and temple-oriented sources. [Himalayan Academy](https://www.himalayanacademy.com/media/books/holy-festivals_ei/Hindu-Festival_Skanda-Shashti_magazine-color.pdf), [Tiruchendur Sashti overview](https://tiruchendur.org/sashti.htm)
- Temple observance can include abhishekam, homam, archana, hymns, processions, kavadi or palkudam and the Soorasamharam enactment. These are temple offerings/events, not a required household checklist. [Utsav — Ministry of Tourism](https://utsav.gov.in/public/view-event/kandhar-sasti-festival-2024-arulmigu-subramaniya-swamy-temple-tiruchendur-1), [Hindu Community and Cultural Center, Livermore](https://livermoretemple.org/cms/wp-content/uploads/2025/09/skanda-shashti-celebrations.pdf)
- Thirukalyanam/Kalyanotsavam belongs to the following day's festival sequence. Ganak must not silently treat it as the exact paran moment for the sixth-day fast. [Drik Panchang](https://www.drikpanchang.com/vrats/skanda-sashti-dates.html?lang=en), [Tiruchendur festival overview](https://tiruchendur.org/festivals.htm)

## 4. Variants Ganak must label

| Variation | How Ganak should handle it |
|---|---|
| Monthly Shukla vrata versus twice-monthly temple worship | State exactly which calendar occurrence the page represents. Do not erase the broader Tamil temple practice. |
| One-day monthly fast versus six-day annual vow | Give separate verdicts and steps. Never make a monthly observer read a six-day instruction as mandatory. |
| Complete fast, fruit/milk, unsalted simple food, or one meal | Present as traditional practice variants. Let the user follow family, health and guru/temple guidance. |
| Household prayer versus temple ceremonies | Clearly label temple-only or temple-led activities; do not instruct users to reproduce homam or festival enactments at home. |
| Day-seven wedding tradition | Name it as a separate next-day celebration and defer to the selected temple/tradition for local details. |

## 5. Unresolved points — do not guess in the app

1. **Universal monthly paran clock:** the reviewed reliable sources do not establish one universal clock-time or astronomical condition for breaking every monthly Skanda Shashti fast.
2. **Annual completion across traditions:** one detailed Tamil source completes with food on the morning of day seven, while the temple/festival sources reviewed do not state that this timing is universal. Ganak should show it as a selectable Tamil rule rather than apply it silently to everyone.
3. **Krishna Paksha entry:** official cultural material attests twice-monthly Sashti temple worship, while Ganak currently computes the Shukla vrata. Product scope for a second recurring entry needs a separate calendar decision.
4. **Udyapan:** no reviewed source establishes a single universal household udyapan rite for this vrata. A counted or specially undertaken vow should follow family, guru or temple guidance.

Until stronger sources resolve points 1–2, Ganak should show **"Complete the vrata after the principal Murugan worship according to your family or temple tradition"** and must not manufacture a precise paran window.

## 6. Source record

| Source | Organization/type | What it supports | Accessed | Confidence |
|---|---|---|---|---|
| [Skanda Sashti dates](https://www.drikpanchang.com/vrats/skanda-sashti-dates.html?lang=en) | Drik Panchang | Monthly Shukla Sashti, Panchami–Shashti selection, annual significance | 2026-07-20 | High for published panchang rule; verify against primary shastra before calling it universal |
| [Soorasamharam](https://www.drikpanchang.com/festivals/soorasamharam/soorasamharam-date-time.html) | Drik Panchang | Six-day annual sequence and culmination | 2026-07-20 | High for benchmark/calendar comparison |
| [Kandhar Sasti Festival, Tiruchendur](https://utsav.gov.in/public/view-event/kandhar-sasti-festival-2024-arulmigu-subramaniya-swamy-temple-tiruchendur-1) | Ministry of Tourism; event organizer listed as Tamil Nadu HR&CE/temple administration | Tiruchendur setting, temple ceremonies, monthly practice | 2026-07-20 | High for the named temple event; not universal household law |
| [Skanda Shashti festival booklet](https://www.himalayanacademy.com/media/books/holy-festivals_ei/Hindu-Festival_Skanda-Shashti_magazine-color.pdf) | Himalayan Academy / religious institution | Six-day observance, fasting variants, home prayer, Kavacham | 2026-07-20 | Medium-high; identifies a living Shaiva tradition |
| [Tiruchendur vrata overview](https://tiruchendur.org/vratam.htm) | Temple-oriented informational site | Fasting variants and devotional reading | 2026-07-20 | Medium; corroboration required for universal claims |
| [Tiruchendur festival overview](https://tiruchendur.org/festivals.htm) | Temple-oriented informational site | Soorasamharam and next-day Thirukalyanam sequence | 2026-07-20 | Medium |
| [Skanda Shashti celebrations](https://livermoretemple.org/cms/wp-content/uploads/2025/09/skanda-shashti-celebrations.pdf) | Hindu Community and Cultural Center, Livermore | Diaspora temple's six-day worship and next-day wedding festival | 2026-07-20 | High for that temple's schedule only |
| [Sampradhayam](https://www.sriramanavami.com/books/2023-Sampradhayam-Vol-1-English.pdf) | Tamil religious-practice compilation | Six-day food discipline, day-six fast, day-seven-morning completion and Murugan readings | 2026-07-20 | Medium-high for its documented Tamil tradition; do not universalize |
| [Fasting and diabetes](https://www.diabetes.org.uk/living-with-diabetes/eating/fasting) | Diabetes UK | Separate medical-safety note for people using diabetes treatment | 2026-07-20 | High for health caution; not a religious-practice source |

## 7. Proposed English user-facing card

### Skanda Shashti / Kanda Sashti

**What to do today**

For a monthly Skanda Shashti, worship Murugan on the selected Shukla Shashti and keep the form of fast followed by your family or temple. For the annual Kanda Sashti, the vow lasts six days and culminates with Soorasamharam; the next day's Thirukalyanam is a separate celebration.

**Which observance is this?**

- **Monthly Skanda Shashti:** a one-day Murugan vrata.
- **Annual Kanda Sashti:** a six-day Aippasi/Kartika vrata ending with Soorasamharam.
- **Thirukalyanam:** the divine-wedding celebration on the following day.

**Traditional fasting forms**

Traditional practice includes complete fasting. Other established forms include fruit or milk, simple unsalted food, or one meal a day. Decide the form at the beginning and follow your family, guru or temple tradition consistently.

**Simple household worship**

1. Bathe and clean the worship place.
2. Light a lamp before Murugan or the Vel and offer flowers or fruit.
3. State your intention for the monthly vrata or the six-day annual vow.
4. Pray, visit a Murugan temple if possible, and recite or listen to a familiar Murugan text such as Kanda Sashti Kavacham.
5. During the annual vrata, continue the chosen discipline through all six days. Observe Soorasamharam on day six; treat the next day's Thirukalyanam as a separate festival.

**Plain-language sankalpa**

“For this Skanda Shashti, I worship Shri Murugan and undertake the form of vrata followed in my family or temple, seeking courage, discipline and divine grace.”

This is a plain-language intention, not a prescribed Sanskrit mantra.

**Completing the fast**

For the monthly vrata, complete the fast after the principal Murugan worship according to your family or temple tradition; a universal monthly paran clock was not verified. For the annual six-day vow, one documented Tamil tradition takes food on the morning of day seven. Follow that rule when it matches your tradition; otherwise follow the completion taught by your temple or family. Ganak should label the selected rule rather than display a blended or made-up time.

**Udyapan or a counted vow**

No single universal household udyapan was verified. If you have undertaken a counted, six-day or specially vowed observance, complete it under your family, guru or temple guidance.

**Health note — separate from the religious rule**

Traditional forms include complete fasting; this note does not change that practice. If strict fasting may be medically unsafe—especially with pregnancy, diabetes, kidney illness, an eating disorder, frailty or medicines—seek medical advice before taking the vow. Do not stop or retime prescribed medicine without professional guidance.

## 8. Proposed Hindi user-facing card

### स्कन्द षष्ठी / कन्द षष्ठी

**आज क्या करें**

मासिक स्कन्द षष्ठी पर चुनी गई शुक्ल षष्ठी को भगवान मुरुगन की पूजा करें और अपने परिवार या मंदिर में प्रचलित व्रत-विधि अपनाएँ। वार्षिक कन्द षष्ठी छह दिनों का व्रत है, जिसका समापन सूरसम्हारम् से होता है; अगले दिन का तिरुकल्याणम् अलग उत्सव है।

**यह कौन-सा अनुष्ठान है?**

- **मासिक स्कन्द षष्ठी:** भगवान मुरुगन का एक-दिवसीय व्रत।
- **वार्षिक कन्द षष्ठी:** ऐप्पसि/कार्तिक का छह-दिवसीय व्रत, जिसका मुख्य दिन सूरसम्हारम् है।
- **तिरुकल्याणम्:** अगले दिन मनाया जाने वाला दिव्य-विवाह उत्सव।

**पारंपरिक उपवास के रूप**

परंपरा में पूर्ण उपवास भी किया जाता है। फल या दूध, सादा नमक-रहित भोजन, अथवा दिन में एक बार भोजन जैसे अन्य प्रचलित रूप भी मिलते हैं। आरम्भ में जिस नियम का संकल्प लें, उसे अपने परिवार, गुरु या मंदिर की परंपरा के अनुसार निभाएँ।

**घर पर सरल पूजा**

1. स्नान करके पूजा-स्थान स्वच्छ करें।
2. भगवान मुरुगन या वेल के सामने दीप जलाकर फूल या फल अर्पित करें।
3. मासिक व्रत या छह-दिवसीय वार्षिक व्रत का अपना संकल्प स्पष्ट करें।
4. प्रार्थना करें, सम्भव हो तो मुरुगन मंदिर जाएँ, और कन्द षष्ठी कवचम् जैसे परिचित मुरुगन स्तोत्र का पाठ या श्रवण करें।
5. वार्षिक व्रत में चुना हुआ नियम सभी छह दिनों तक रखें। छठे दिन सूरसम्हारम् मनाएँ; अगले दिन के तिरुकल्याणम् को अलग उत्सव मानें।

**सरल संकल्प**

“इस स्कन्द षष्ठी पर मैं श्री मुरुगन की पूजा करता/करती हूँ और अपने परिवार या मंदिर में प्रचलित व्रत-नियम अपनाकर साहस, अनुशासन और ईश-कृपा की प्रार्थना करता/करती हूँ।”

यह सरल भाव-संकल्प है, निर्धारित संस्कृत मंत्र नहीं।

**व्रत कब पूरा करें**

मासिक व्रत को मुख्य मुरुगन पूजा के बाद अपने परिवार या मंदिर की परंपरा के अनुसार पूरा करें; मासिक व्रत के लिए एक सार्वभौमिक पारण-समय प्रमाणित नहीं हुआ। वार्षिक छह-दिवसीय व्रत की एक प्रमाणित तमिल परंपरा में सातवें दिन प्रातः भोजन करके व्रत पूरा किया जाता है। यदि आपके परिवार में यही नियम है तो इसे अपनाएँ; अन्यथा मंदिर या परिवार से मिला समापन-नियम रखें। गणक चुने हुए नियम का नाम स्पष्ट करेगा, अलग नियमों को मिलाकर अनुमानित समय नहीं दिखाएगा।

**उद्यापन या गिने हुए व्रत**

घर पर किए जाने वाले एक सार्वभौमिक उद्यापन की प्रमाणित विधि नहीं मिली। यदि आपने निश्चित संख्या, छह दिनों या किसी विशेष कामना का व्रत लिया है, तो परिवार, गुरु या मंदिर के मार्गदर्शन में उसका समापन करें।

**स्वास्थ्य-सूचना — धार्मिक नियम से अलग**

परंपरा में पूर्ण उपवास भी शामिल है; यह सूचना उस धार्मिक नियम को बदलती नहीं है। गर्भावस्था, मधुमेह, गुर्दे की बीमारी, भोजन-संबंधी विकार, अधिक कमजोरी या नियमित दवा की स्थिति में व्रत का संकल्प लेने से पहले चिकित्सकीय सलाह लें। चिकित्सकीय मार्गदर्शन के बिना निर्धारित दवा बंद न करें और उसका समय न बदलें।

## 9. Owner decisions required before integration

Mark each item **Approve**, **Change wording**, or **Hold**:

1. Separate monthly Skanda Shashti and annual six-day Kanda Sashti inside the same guide, with the current occurrence highlighted.
2. Describe complete fasting first, followed by the sourced fruit/milk, unsalted-food and one-meal variants.
3. Use Kanda Sashti Kavacham as the named example while allowing a family's familiar Murugan prayer or text.
4. Show the documented Tamil annual completion on day-seven morning only when that tradition is selected; keep monthly timing unresolved until a stronger source is obtained.
5. Add a future calendar-research item for Krishna Paksha Sashti temple observance rather than silently broadening the current Shukla key.
6. Keep Soorasamharam and next-day Thirukalyanam as separately explained milestones.

## 10. Integration recommendation — after approval only

- Existing monthly key: `skandaShashti`.
- Annual sequence should use distinct identities for Kanda Sashti day 1, Soorasamharam day 6 and Thirukalyanam day 7; do not alias all three to the monthly key.
- The guide should receive an explicit occurrence type (`monthly` or `annual`) so the verdict and duration cannot be confused.
- Calendar computations and exact completion-time logic require their own verified engine work. This research draft authorizes no code change.
