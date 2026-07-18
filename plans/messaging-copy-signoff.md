# Messaging fixes — copy for sign-off

All 19 items from `plans/messaging-audit.md`, approved for all three tiers.
This is the exact text going into the app. Nothing gets edited until you've
approved this file. Mark any line you want changed and I'll revise before
touching code.

---

## Tier 1

### 1. Daily screen blank-screen fallback
New card shown whenever `todayP` fails to compute, in place of a blank tab:
- EN: **"We couldn't work out today's panchang for this place or date."**
  Sub-line: *"Try picking a different date, or search for another city below."*
- HI: **"इस स्थान या तारीख़ के लिए आज का पंचांग नहीं बन सका।"**
  उप-पंक्ति: *"कृपया दूसरी तारीख़ चुनें, या नीचे कोई और शहर खोजें।"*
- The city search box stays visible below the message either way.

### 2. Muhurat finder stale-results banner
Shown between the date pickers and the Find button whenever `mfFrom`/`mfTo`
no longer match the range the current results were computed for:
- EN: **"Dates changed — press \"Find good days\" to update these results."**
- HI: **"तारीख़ें बदल गई हैं — नए परिणामों हेतु \"शुभ दिन खोजें\" दबाएँ।"**
- Style: same amber/warning tone as other inline notes, not a full error.

### 3. Chart screen bilingual pass
No new copy to draft — this is a mechanical fix: every hardcoded English
string on the Chart screen gets a Hindi counterpart and gets routed through
`lang`, following the exact pattern the Daily screen already uses. Sample of
the highest-traffic strings, so you can see the tone:
- "Name of the native" → EN unchanged; HI: **"जातक का नाम"**
- "Date of birth" / "Time of birth" / "Place of birth" → HI: **"जन्म तिथि"** /
  **"जन्म समय"** / **"जन्म स्थान"**
- "Enter a complete date and time of birth." → HI: **"जन्म की पूरी तारीख़ और समय भरें।"**
- "Couldn't resolve the timezone for this place — enter the UTC offset
  manually below." → HI: **"इस स्थान का समय-क्षेत्र नहीं मिला — कृपया नीचे UTC
  ऑफ़सेट स्वयं भरें।"**
- "No major classical yogas detected by the current rule set." →
  EN revised (drop dev jargon): **"No major classical yogas were found in
  this chart."** HI: **"इस कुंडली में कोई प्रमुख शास्त्रीय योग नहीं मिला।"**
- (Every other Chart-screen string follows the same treatment — full list is
  mechanical translation once this pattern is approved, not itemized here to
  keep this doc readable. I'll paste the complete before/after diff for your
  review once written, before merging.)

### 4. Muhurat "why this day" — bilingual factors
`dayScore`'s factor strings become `{en, hi}` pairs:

| English (unchanged) | Hindi |
|---|---|
| Purnima | पूर्णिमा |
| Amavasya | अमावस्या |
| Rikta tithi | रिक्ता तिथि |
| Pushya (not used for weddings) | पुष्य (विवाह हेतु वर्जित) |
| Pushya nakshatra | पुष्य नक्षत्र |
| *(nakshatra name)* nakshatra | *(नक्षत्र नाम)* नक्षत्र |
| *(nakshatra name)* (avoid) | *(नक्षत्र नाम)* (टालें) |
| *(weekday)* | *(वार का नाम)* — reuse existing `WN_SHORT`/Hindi weekday table |
| *(weekday)* (weak) | *(वार)* (कमज़ोर) |
| Guru-Pushya yoga | गुरु-पुष्य योग |
| Ravi-Pushya yoga | रवि-पुष्य योग |
| Bhadra (Vishti) karana | भद्रा (विष्टि करण) |
| *N* good day choghadiya | *N* शुभ दिन चौघड़िया |

Nakshatra name on the "best day" card and mini-calendar also switches to
Hindi via the existing `NAK_HI` table (already used by Prashna — just needs
reusing here, no new copy).

### 5. Muhurat "why other days were skipped"
New collapsible section under the results list, shown only when there are
excluded days in the scanned range:
- EN header: **"Why other days weren't included"**
- HI header: **"अन्य दिन क्यों शामिल नहीं"**
- Body: a short tally of the top blocker reasons across the range, reusing
  the existing bilingual `blockers` text already computed, e.g.:
  EN: *"Most days in this range fall in Chaturmas (4), or on a Tuesday (6)."*
  HI: *"इस अवधि के अधिकांश दिन चातुर्मास (4) या मंगलवार (6) में पड़ते हैं।"*
- If the empty-state (zero results) message fires, this same tally replaces
  the current generic "try the whole year" line so the reason is concrete.

### 6. Delete saved chart — confirm step
Replace the instant delete with a two-tap confirm (tap ✕ once → row shows
confirm state → tap again to actually delete, or tap elsewhere to cancel):
- EN: button relabels to **"Delete?"** in sindoor red for ~4 seconds, then
  reverts to ✕ if not confirmed.
- HI: **"हटाएँ?"**
- No modal/dialog needed — keeps it lightweight, matches the app's existing
  inline-confirmation style rather than introducing a new popup pattern.

---

## Tier 2

### 7. Plain error text, raw exception dropped
Muhurat finder and Prashna both get the same replacement:
- EN: **"Couldn't complete the calculation — please try again."**
  (Muhurat gets an extra clause: *"…or try a shorter date range."*)
- HI: **"गणना नहीं हो सकी — कृपया पुनः प्रयास करें।"**
  (मुहूर्त खोजक हेतु अतिरिक्त: *"…या छोटी अवधि आज़माएँ।"*)
- The real JS error still goes to the browser console for debugging; it's
  just not shown to the user anymore.

### 8. Prashna clears stale verdict on question change
No new copy — behavior fix: switching the question chip after a verdict is
showing clears `result` immediately (verdict card and chart table disappear
until "Ask now" is pressed again), rather than leaving a mismatched answer
on screen. Matches how the rest of the app already treats question changes.

### 9. Chart: one-step place confirmation
When exactly one place match exists and the user presses "Cast the chart"
without explicitly selecting it, auto-confirm that match instead of
requiring a second press. Feedback shown right at the input:
- EN: **"Using [place name] — press Cast the chart to continue."** (shown
  inline under the field, not just in the error banner)
- HI: **"[स्थान का नाम] उपयोग किया जा रहा है — जारी रखने हेतु 'कुंडली बनाएँ' दबाएँ।"**

### 10. Shadbala / Special Lagnas — plain verdict line
One summary sentence added above the numeric tables:
- Shadbala EN: **"[Planet] is [strong/average/under strength] — meaning its
  significations may come with more ease/more effort than usual."**
  HI: **"[ग्रह] [बलवान/सामान्य/निर्बल] है — अर्थात् इसके कारकत्व सामान्य से
  [सहजता/अधिक प्रयास] से फलित हो सकते हैं।"**
- Exact wording depends on reading the actual Rupas thresholds already used
  elsewhere in the file (Ashtakavarga's 30+/25–29/≤24 pattern) — I'll match
  those bands rather than invent new ones.

### 11. "Rashi Gochar" section — gloss + bilingual dates
- Header gains Hindi: **"आगामी ग्रह गोचर"** alongside "Upcoming planetary events".
- One-line gloss under each transit: EN **"which zodiac sign this planet is
  currently moving through"** / HI **"यह ग्रह अभी किस राशि से गुज़र रहा है"**.
- Dates switch to `hi-IN` locale formatting when `lang === "hi"`, matching
  every other date on the Daily screen.

### 12. Full panchang table — inline glosses
Short parenthetical added next to each term (not a separate legend, to keep
answer-before-data — explanation sits right where the term appears):
- "Karana" → **"Karana (half of a tithi)"** / **"करण (तिथि का आधा भाग)"**
- "Pravishte / Gate" → **"Pravishte (days into the solar month)"** /
  **"प्रविष्टे (सौर मास में बीते दिन)"**
- "Shaka Samvat" → **"Shaka Samvat (the national calendar year)"** /
  **"शक संवत् (राष्ट्रीय पंचांग वर्ष)"**
- "Vikram Samvat" → **"Vikram Samvat (north Indian calendar year)"** /
  **"विक्रम संवत् (उत्तर भारतीय पंचांग वर्ष)"**
- "Gujarati Samvat" → **"Gujarati Samvat (Gujarati calendar year)"** /
  **"गुजराती संवत्"**

### 13. Prashna table headers + inline glosses
- Headers gain Hindi: "Graha"→ग्रह, "Rashi"→राशि, "Nakshatra"→नक्षत्र,
  "Star/Sub"→तारा/उप, "H"→भाव (renamed from bare "H" to "House"/"भाव" for
  clarity in both languages).
- "Rx" gets a persistent one-line legend under the table instead of only
  inside the collapsed detail: EN **"Rx = retrograde, appears to move
  backward in the sky"** / HI **"Rx = वक्री, आकाश में पीछे चलता प्रतीत होता है"**.

### 14. Shared PlaceInput — loading indicator
Add the same **"Searching more places…"** / **"और स्थान खोजे जा रहे हैं…"**
line the Chart form's own place field already shows, to the shared
component used by Kundli Matching.

---

## Tier 3

### 15. Fast-tradition toggle note
One line near the Smarta/ISKCON toggle:
- EN: **"ISKCON (Vaishnava) dates may fall a day later for some Ekadashi fasts."**
- HI: **"ISKCON (वैष्णव) तिथियों में कुछ एकादशी व्रत एक दिन बाद पड़ सकते हैं।"**

### 16. Bare "—" empty states become sentences
- No more good windows today: EN **"No more good windows for this today —
  check tomorrow."** HI **"आज इसके लिए और कोई शुभ समय नहीं — कल देखें।"**
- Empty KP significator cells: add caption **"— means none"** /
  **"— का अर्थ है कोई नहीं"** once near the table, not per-cell.

### 17. Placeholder rewording
- "Name of the native" → **"e.g. Priya Sharma"** / HI **"जैसे: प्रिया शर्मा"**
- "resolved from place" (UTC offset field) → shows the actual resolved value
  once a place is picked (already happens); before that, placeholder becomes
  **"e.g. +5.5"** / HI **"जैसे: +5.5"**

### 18. Divisional chart (D1–D60) tap-accessible glosses
Tooltips become tap-to-reveal on touch devices, not hover-only. One
persistent line above the chip strip:
- EN: **"Divisional charts zoom into one life area each — tap any chart for
  its focus."**
- HI: **"षोडशवर्ग हर एक जीवन-क्षेत्र को विस्तार से दिखाते हैं — विवरण हेतु किसी
  भी वर्ग को दबाएँ।"**

### 19. "Upcoming planetary events" Hindi header
- EN unchanged. HI added: **"आगामी ग्रह गोचर"** (shared with item 11's fix,
  same section).

---

**Sign-off:** reply with "approved" to build all of this as written, or list
the item numbers you want changed first. I'll implement in the same
dependency order as the tiers, running the full validation gate suite after
each tier, and give you a browser walkthrough of the changes before calling
it done.
