# Privacy & Terms — Phase-1 launch draft

**Status: DRAFT for the owner and a qualified lawyer. This is not legal advice.**
I am not a lawyer and cannot give you legal advice. This is drafting groundwork:
the factual sections are verified against the actual code (see §4), so counsel can
spend their time on the legal wording rather than on working out what the app does.

Date: 2026-07-19 · Applies to: Ganak (गणक) web app, Phase-1 (Panchang + Prashna).

> ⚠️ **Read §4 first.** Three statements the app makes today would be inaccurate if
> copied into a published policy. One of them is in the app's own footer.

---

## 1. What Ganak actually does with data — verified

I traced this in the code rather than assuming. Evidence in §4.

| Question | Answer |
|---|---|
| Is there a server holding user data? | **No.** No accounts, no database, no user records. |
| Where are calculations done? | **In the visitor's browser.** All panchang/chart maths runs client-side. |
| Are birth details transmitted? | **No.** Name, date, time and place of birth never leave the page. |
| Are there cookies? | **No.** No cookies, no localStorage, no IndexedDB in the web build. |
| Analytics or ad trackers? | **None.** No analytics script, no ad SDK, no tracking pixel. |
| What *does* leave the browser? | Two things today: **city-search queries** and **Google Fonts requests**. |

---

## 2. Privacy Policy — draft text

### The short version
Ganak does its calculations on your own device. We do not have accounts, we do not
have a database of users, and your birth details are never sent to us — because
there is no "us" to send them to. Two things do leave your device, and we explain
both below.

### 2.1 Information we collect
**We do not collect personal information.** Ganak has no accounts, no sign-up, no
user profiles and no server that stores what you enter. Details you type — your
name, date, time and place of birth, or a question you ask — are used by your own
browser to do the calculation and are discarded when you close or reload the page.

### 2.2 Information that leaves your device
Two, both explained plainly:

**a. City search.** When you search for a city, the text you type is sent to
Open-Meteo's geocoding service (open-meteo.com) to look up coordinates and time
zone. Only the place name is sent — never your birth details, and never anything
identifying you. Ganak also carries a built-in list of common cities; the online
lookup is used only when that list has no good match.

**b. Fonts.** The page loads its typefaces from Google Fonts. As with any file your
browser fetches from another website, Google receives your IP address and browser
type in the process. *(See §4 — we recommend removing this before launch.)*

Nothing else is transmitted. There is no telemetry, no crash reporting and no
analytics.

### 2.3 Preferences in the web address
Your language and current screen are kept in the page's web address (for example
`?lang=hi`). This is so a link you share or bookmark opens the way you left it. It
holds no personal information, but note that web addresses are saved in your browser
history like any other page.

### 2.4 Saved charts and share codes
- **Saving charts** is only available in environments that provide a storage
  facility to the page. In an ordinary web browser this is unavailable and the app
  says so — nothing is written to your device.
- **Export** downloads a file to your device and copies it to your clipboard.
- **Share code** copies an encoded chart to your clipboard. It is not uploaded
  anywhere. Where it then travels is entirely your choice — treat it like any other
  message containing personal details, because it contains the birth details it
  encodes.

### 2.5 Children
Ganak is a general-audience reference tool and is not directed at children. Because
we collect nothing, we hold no children's data. A parent entering a child's birth
details for a chart keeps those details on their own device.

### 2.6 Your rights
Since we hold no personal data, there is nothing for us to show, correct, export or
delete on request. Anything you entered is cleared by closing or reloading the page.

### 2.7 Changes
If Ganak later adds a feature that transmits data — the AI explanation service in
§4.3 is the likely first one — this policy will be updated **before** that feature
is switched on, and the change will be dated here.

### 2.8 Contact
`[OWNER TO SUPPLY — a contact email is required by most privacy regimes.]`

---

## 3. Terms of Use — draft text

### 3.1 What Ganak is
Ganak is a Hindu panchang and Jyotish reference tool. It calculates traditional
almanac information — tithi, nakshatra, yoga, karana, auspicious and inauspicious
periods, festival and fast dates — and presents traditional interpretations.

### 3.2 Nature of the content — please read
Panchang and Jyotish are religious and cultural traditions. Ganak presents them
faithfully; it does not assert them as scientific fact. Interpretations, verdicts and
"auspicious"/"avoid" labels are **traditional guidance, not predictions of what will
happen**, and are offered for cultural, religious and personal reflection.

### 3.3 Not professional advice
Nothing in Ganak is medical, legal, financial, psychological or other professional
advice, and it must not be used as a substitute for a qualified professional.

This matters most for **fasting**. Ganak describes vrat observances including strict
forms such as nirjala (without food or water). These descriptions are religious
information, not health guidance. Fasting can be genuinely unsafe for some people —
including children, older people, anyone pregnant or breastfeeding, and anyone with
diabetes, kidney disease, an eating disorder, or on regular medication. **Consult a
doctor before undertaking a fast, and never stop or re-time prescribed medicine to
observe one.** For significant life decisions — marriage, medical treatment, property,
finances, legal matters — consult qualified professionals and, where appropriate, a
learned acharya.

### 3.4 Accuracy
We work hard on accuracy and validate against established sources, but:
- Times are computed astronomically and may differ slightly from a printed panchang.
- **Regional and sampradaya differences are real.** Amanta and purnimanta reckoning,
  and different community traditions, genuinely place some observances on different
  days. Where traditions differ we follow a stated convention and try to note the
  variant; this is not an error.
- For an observance that matters to you, confirm with your family tradition or your
  local temple or acharya. Ganak is a reference, not a religious authority.

### 3.5 Acceptable use
Use Ganak for personal and non-commercial purposes. Do not attempt to disrupt the
service, scrape it at volume, or present its output as your own commercial product.

### 3.6 Intellectual property
The software, design and original written content are owned by the operator.
Traditional religious knowledge, classical texts and festival lore are the shared
heritage of the tradition and are not claimed as anyone's property.

### 3.7 No warranty; limitation of liability
Ganak is provided "as is", free of charge, without warranties of any kind. To the
fullest extent the law allows, the operator is not liable for any loss arising from
use of, or reliance on, the app. `[COUNSEL: confirm the enforceable wording and any
consumer-law carve-outs for the chosen jurisdiction.]`

### 3.8 Governing law
`[OWNER + COUNSEL TO SUPPLY — presumably India; confirm.]`

---

## 4. ⚠️ Accuracy problems to fix before publishing

**This is the section that matters most.** A privacy policy that overstates is worse
than none — it is a false statement to users, and in some regimes a regulatory
problem. Three items:

### 4.1 The app's own footer currently overstates
`src/kundli-app.tsx:1267` renders:

> ॐ · computed locally in your browser · nothing is stored or sent anywhere

The first half is true. **"nothing is … sent anywhere" is not**, because:
- city searches go to `geocoding-api.open-meteo.com` (`src/data/places.ts:32`), and
- every page load fetches Google Fonts (`src/kundli-app.tsx:293`).

Suggested replacement, same reassuring tone, but true:

> **EN** — ॐ · computed on your device · no account, no tracking · city search uses an online lookup
> **HI** — ॐ · गणना आपके डिवाइस पर · न खाता, न ट्रैकिंग · शहर खोज हेतु ऑनलाइन सेवा

*I did not make this change:* the shell is reserved for Cursor's ChartScreen
extraction. It is a one-line edit for whoever holds the shell next.

### 4.2 Google Fonts — recommend removing
`src/kundli-app.tsx:293` does
`@import url('https://fonts.googleapis.com/css2?family=Eczar…&family=Spectral…')`.

Every visitor's IP and user-agent therefore go to Google before anything renders.
This is the app's only unnecessary third-party disclosure, and it is the single
thing standing between Ganak and an honest "this app talks to nobody but you".
Self-hosting the two font families removes the disclosure entirely, removes a
render-blocking external request, and shortens the privacy policy. **Recommended
before launch.** (Check each family's licence permits self-hosting — both are open
licence, but confirm.)

### 4.3 The AI explanation proxy is not live — keep it that way until the policy says so
`server/index.js` implements `POST /api/explain`, which forwards a prompt plus
app-calculated context to Anthropic's API. **The client does not call it** — I
grepped `src/` for `api/explain` and there are no hits, and a production build
contains no reference to Anthropic.

So today it transmits nothing. But the moment it is wired up, §2.2 becomes wrong:
user-typed questions and chart context would be sent to a third-party AI provider.
Before enabling it: update this policy, add a clear in-app notice at the point of
use, and decide whether it needs explicit consent.

### 4.4 Jurisdiction — for counsel
Ganak's audience is primarily Indian, with diaspora users. Worth confirming with
counsel:
- **India's DPDP Act, 2023** — obligations are light where no personal data is
  processed, but "no processing" should be confirmed rather than assumed.
- **GDPR/UK GDPR** if EU/UK visitors are expected — note that an IP address is
  personal data there, which is another argument for §4.2.
- Whether a contact address and a named operator entity are required.

---

## 5. Owner checklist before publishing

- [x] Fix the footer claim (§4.1) — **done 2026-07-19** (`CLAUDE-LAUNCH-PRIVACY`): bilingual true text live in both languages
- [x] Self-host fonts (§4.2) — **done 2026-07-19**: Eczar + Spectral via @fontsource, bundled same-origin (35 woff2 incl. Devanagari); `dist/` has zero `fonts.googleapis`/`fonts.gstatic` references. §2.2(b) no longer applies — the only remaining egress is city search.
- [ ] Supply a contact email (§2.8)
- [ ] Supply operator entity + governing law (§3.8)
- [ ] Have a lawyer review §2 and §3 — particularly §3.3 (fasting/health) and §3.7
- [ ] Re-check this document whenever a feature starts sending data anywhere
