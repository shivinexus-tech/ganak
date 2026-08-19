# Bug bash — public utility-calculator catalogue (2026-08-18)

**Agent:** independent adversarial pass (`claude/bugbash-utility-calculators`, worktree
`.scratch/worktrees/bugbash-calculators`, based on `origin/main` `421e82d`).
**Standard applied:** `TEST-STD-CALCULATORS` in `plans/backlog.md` — 4–5 *recorded adversarial
passes*, not a gate run. This agent is **read-only on all product code**; nothing under `src/`,
`validation/` or the backlog files was touched. Findings only, no fixes.

**Surface:** `src/screens/UtilityCalculatorScreen.tsx`, `src/engine/utility-calculators.ts`,
`src/data/utility-calculators.ts` and the 14 `/calculator/<slug>` routes plus `/calculators`.

Every reproduction below is a command you can paste from the repo root
(`export PATH="/opt/homebrew/bin:$PATH"` first). Probe scripts were written to `.scratch/bugbash/`
(gitignored) so the reproductions here are deliberately self-contained.

---

## Pass log

| # | Lens | What it actually probed | Scale / duration |
|---|------|-------------------------|------------------|
| 1 | **Input hostility** | `makeInput()` against blank/whitespace/Devanagari-numeral/over-long dates and times, 29 Feb on non-leap years, year 0 → 9999, `24:00`, seconds in the time value; every engine entry point under NaN inputs; lat/lon out of range; `utilityFromPath` against 16 hostile paths (case, `%20`, query in path, `..`, double slash, Devanagari slug, trailing junk). | ~90 engine calls + 16 route probes, ~15 min |
| 2 | **Place / time edges** | `zoneOffset` for all **84 gazetteer zones × 1900–2030 (11,004 lookups)** hunting silent-null → IST fallback; 18 hand-picked DST/war-time/permanent-shift transition days cross-checked against an independently computed true offset; then a **110,684-birth sweep** (7 DST cities × 1960–2026 × 12 months × 5 days × 4 night hours) measuring how often the wrong offset changes the *printed* answer; 45- and 30-minute zones; Kolkata LMT pre-1906; India war time 1942–45; polar latitudes (Tromsø, Reykjavík, Longyearbyen, McMurdo); IDL (Fiji, Samoa, Kiritimati, Chatham); 00:00 / 00:01 / 23:59 boundaries. | ~112k engine evaluations, ~35 min |
| 3 | **Stale state across routes** | Rendered the **real** `UtilityCalculatorScreen` from this worktree (React + `renderToStaticMarkup`, `ComfortProvider` bundled as `validation/_snapshot-render.cjs` does) with the `result` state seeded to a result belonging to a *different* calculator — i.e. the exact state React is in on the first render after a calculator→calculator navigation. All **14 × 13 = 182 cross pairs**, plus a 28-render control. | 210 real renders, ~25 min |
| 4 | **Bilingual correctness** | Same harness, every calculator rendered in **EN and HI** with a real result, for a neutral chart (1990-01-01 Delhi) and a dosha-positive chart (1972-03-14 Mumbai) so both the "found" and "not found" copy paths run; plus the catalogue and the not-found page in both languages. Scanned every rendered line for Devanagari in the English view and for Latin runs in the Hindi view; compared answer + detail lines side by side. | 60 renders, ~20 min |
| 5 | **Answer quality** | Cross-checked the app's **two ephemeris paths** (`computeKundli` rows vs `planetSidMs`) over 1930–2030; re-derived the annual Shraddha occurrence independently by scanning whole years instead of taking the first hit; verified the Sade Sati 12/1/2-from-Moon rule and its Saturn against a same-instant chart; ran 2,000 random births through papa/mangal/kala-sarpa/pancha-pakshi invariants; enumerated the pancha-pakshi bird map for all 27 nakshatras; probed `sadeSati` with a blank "Check date". | ~7,000 charts, ~30 min |
| — | **Live browser** | Drove the running app through 14 calculators via the Browser pane. **See the coverage caveat at the end — the MCP dev server serves the parent checkout (`df0e7e5`), not this worktree.** Used for F2/F11 behavioural evidence only. | ~15 min |

---

## Findings

### F1 — P0 · The birth timezone is looked up for the wrong *moment*, so every DST-transition-day birth is computed an hour off

**Cause.** `src/screens/UtilityCalculatorScreen.tsx:32`

```ts
function makeInput(v:any,place:any){ … const tz=zoneOffset(place.zone,y,m,day)??5.5; … }
```

and `src/engine/panchang.ts:286-297`

```js
function zoneOffset(zone, y, m, d) {
  const dt = new Date(Date.UTC(y, m - 1, d, 12));   // ← noon UTC on the birth DATE
```

The offset is resolved at **12:00 UTC on the birth date**, then applied to the birth *time*. On any
day that a zone changes offset, births before the change get the after-the-change offset (and vice
versa in autumn).

**Reproduction** (New York, 10 March 2024, 00:30 — DST started at 02:00 that morning, so 00:30 was
still EST/−5):

```bash
node -e '
const {loadApp}=require("./validation/_load-app.cjs");
const calc=loadApp("src/engine/utility-calculators.ts"), pan=loadApp("src/engine/panchang.ts");
const tzApp = pan.zoneOffset("America/New_York", 2024, 3, 10);   // what makeInput() uses
const a = calc.quickBirth({y:2024,m:3,day:10,hh:0,mi:30,tz:tzApp,lat:40.71,lon:-74.01});
const b = calc.quickBirth({y:2024,m:3,day:10,hh:0,mi:30,tz:-5,  lat:40.71,lon:-74.01});
console.log("app  tz="+tzApp, a.nakshatra, "pada", a.pada, "sound", a.syllable, a.syllableHi);
console.log("true tz=-5",     b.nakshatra, "pada", b.pada, "sound", b.syllable, b.syllableHi);'
```

**Observed**
```
app  tz=-4 Purva Bhadrapada pada 1 sound Se से
true tz=-5 Purva Bhadrapada pada 2 sound So सो
```
**Expected** — pada 2, naming sound `So / सो`.

A lagna-flipping case: New York **1961-10-29 00:30** → app uses −5 and prints **Simha (Leo)**; the
true offset was −4 and gives **Karka (Cancer)**. Same for 1967, 1972, 1978 on the same date, and
1962/1973-04-29 (Dhanu vs Makara).

**Scale (measured, not estimated).** 110,684 birth moments across New York, London, Toronto, Sydney,
Auckland, Chicago and Los Angeles, 1960–2026, at 00:30/01:30/02:30/03:30 local:

* 275 births get the wrong offset (0.25 % of the sweep — but ~100 % of night-time births on the two
  transition days each year, in every DST region);
* of those, **131 print a different ascendant**, 51 a different nakshatra pada, 12 a different
  nakshatra, 2 a different Moon sign.

Ten of the 18 hand-picked transition days mismatch: New York (1987, 2024 both directions), London
(2024 BST start and the 1971 BSTexperiment end), Sydney 2024-10-06, Auckland 2024-09-29,
Tehran 2015-03-22, Cairo 2023-04-28, Moscow 2011-03-27.

**Impact.** Every one of the 14 calculators consumes `makeInput`. The diaspora householder and the
practitioner are both named Ganak audiences and both live in DST regions; an hour of error moves the
ascendant ~15°, which is a different sign about half the time, and moves the naming syllable a whole
pada — the baby-name calculator's entire output.

**Suggested fix.** Resolve the offset for the birth's **local wall clock**, not for a fixed UTC
instant: guess `Date.UTC(y,m-1,d,hh,mi)`, read the zone offset at that instant, subtract it, read
again (one refinement pass converges for every real zone). The autumn repeated hour is genuinely
ambiguous — pick one convention, say which, and show it. `zoneOffset` is shared by ~10 engines, so
either add an hour/minute-aware overload or fix it in place and re-baseline the affected gates.

---

### F2 — P0 · A result computed for one calculator is rendered by another calculator's renderer: 104 of 182 cross pairs crash the whole app, 78 print a wrong answer

**Cause.** `src/screens/UtilityCalculatorScreen.tsx:80-81` clears the stale answer in an **effect**:

```ts
useEffect(()=>{ setResult(null); setError(""); setNotice(""); },
  [ …, item?.slug]);
```

Effects run **after** the render that produced them. The render at lines 115 (`answer()`),
116 (`detail()`), 125 (`specialReport()`), 120-122 (`doshaDerivation()`) and 137/154 has already
executed with the *previous* calculator's `result` and the *new* calculator's `item.slug`. The
component stays mounted across `/calculator/*` routes (`src/kundli-app.tsx:262`), so the state
survives the route change.

**Reproduction** (renders the real screen from this worktree; the harness only seeds React's 4th
`useState`, which is `result`):

```bash
node .scratch/bugbash/p3-stale-result.cjs      # script listed at the end of this file
```

**Observed** — control (each calculator with its own result, EN + HI): **0 failures / 28**. Cross
pairs:

| Target route | Behaviour with another calculator's result |
|---|---|
| `mangal-dosha` | **CRASH** 13/13 — `Cannot read properties of undefined (reading 'map')` (`detail()`, `q.refs.map`) |
| `kala-sarpa` | **CRASH** 13/13 — `…(reading 'length')` |
| `pitra-dosha` | **CRASH** 13/13 — `…(reading 'filter')` |
| `papa-dosha` | **CRASH** 13/13 — `…(reading 'map')` |
| `sade-sati` | **CRASH** 13/13 — `…(reading 'en')` (`SADE_SATI_PHASE_COPY[undefined]`) |
| `shraddha-tithi` | **CRASH** 13/13 — `…(reading 'replace')` (`q.amanta.replace`) |
| `western-natal` | **CRASH** 13/13 — `…(reading 'sun')` |
| `western-relationship` | **CRASH** 13/13 — `…(reading 'slice')` |
| `pancha-pakshi` | renders **"Your birth bird: undefined."** |
| `rashi` | renders **"Your Moon sign is ."** (empty sign, no error) |
| `sun-sign`/`lagna`/`nakshatra`/`baby-name` | render the *previous* chart's answer under the new heading |

**Total: 104 / 182 cross pairs throw during render; the other 78 render an answer that was computed
for a different calculator.** A crash escapes `calculate()`'s try/catch (line 113) entirely and hits
`AppErrorBoundary`, replacing the whole application with "Something went wrong".

I also observed this live: driving 14 calculators in sequence with `history.pushState` +
`PopStateEvent` (exactly what `followUtilityLink`, lines 49-57, does) crashed the app on the
`baby-name → mangal-dosha` step with
`TypeError: Cannot read properties of undefined (reading 'map')` at `UtilityCalculatorScreen`, and
it never recovered (see F11).

**Reachability — honest caveat.** On `421e82d` every in-app link out of a calculator goes to
`/calculators/` or `/`, and the catalogue branch early-returns at line 92 before touching `result`,
which gives the clearing effect a chance to run. So I could **not** demonstrate a pure-click
calculator→calculator hop; the live crash above used a direct `pushState`. What is reachable today
is any history entry pair that lands directly on a second calculator, and the two *silent* variants
above are the same defect already shipping. The point is that the guard is a post-render effect and
therefore not a guard at all — one new cross-link (e.g. a "related calculators" row, or making
`src/screens/ChartScreen.tsx:1096` an SPA link) turns this into a routine crash.

**Suggested fix.** Make the result carry its own identity instead of relying on an effect:
`setResult({slug:item.slug, data:r})` and render the answer block only when
`result.slug === item.slug`. That is a render-time invariant and cannot lose the race. Keep the
effect for the input-change clearing it was added for (`CLAUDE-P0-DOSHAS-01`).

---

### F3 — P1 · A malformed `zone` in a shared or hand-edited URL silently computes the chart in IST

**Cause.** `src/kundli-app.tsx:123` accepts any *truthy* zone string:

```js
return label && zone && Number.isFinite(lat) && Math.abs(lat)<=90 && … ? {label,lat,lon,zone} : null;
```

`zoneOffset` returns `null` for an unknown zone (`src/engine/panchang.ts:296`), and
`UtilityCalculatorScreen.tsx:32` then falls back to `?? 5.5` — Indian Standard Time — with no
message anywhere. The screen never displays which offset it used.

**Reproduction** — open
`/calculator/lagna?lang=en&city=New%20York&lat=40.71&lon=-74.01&zone=Mars/X`, birth 1990-06-21 09:15:

```bash
node -e '
const {loadApp}=require("./validation/_load-app.cjs");
const calc=loadApp("src/engine/utility-calculators.ts"), pan=loadApp("src/engine/panchang.ts");
const mk=(zone)=>({y:1990,m:6,day:21,hh:9,mi:15,tz:pan.zoneOffset(zone,1990,6,21)??5.5,lat:40.71,lon:-74.01});
for (const z of ["America/New_York","Mars/X"]) { const q=calc.quickBirth(mk(z));
  console.log(z.padEnd(18),"tz="+mk(z).tz, q.lagna, q.nakshatra+"/"+q.pada, q.syllable); }'
```

**Observed**
```
America/New_York   tz=-4  Karka (Cancer)     Rohini/3  Vee
Mars/X             tz=5.5 Kumbha (Aquarius)  Rohini/1  O
```
**Expected** — either the correct zone, or a visible bilingual error. Not a confidently wrong
ascendant two signs away.

The same shape hits Tromsø: `zone=Bogus/Zone` moves the lagna from Simha to Karka.

`plans/audits/city-selection-persistence-bugbash-2026-08-10.md` already established for the device-location
path that "a confidently wrong zone is worse than no answer" (`src/data/places.ts:55-70`); the URL
path never got the same treatment.

**Suggested fix.** Validate the zone (`Intl.supportedValuesOf('timeZone').includes(zone)`, or simply
treat a `null` from `zoneOffset` as a hard failure), show the standard bilingual "choose a place"
error instead of defaulting, and print the resolved UTC offset next to the place so the user can
tell what the app is doing.

---

### F4 — P1 (latent) · `zoneOffset(undefined, …)` returns the *viewer's* timezone, so the IST fallback never fires

`Intl.DateTimeFormat` treats `timeZone: undefined` as "not supplied" and uses the host zone, while
`null`, `""` and an unknown string all throw and return `null`.

```bash
node -e '
const {loadApp}=require("./validation/_load-app.cjs");
const pan=loadApp("src/engine/panchang.ts");
for (const z of [undefined,null,"","Mars/X"]) console.log(JSON.stringify(z), "->", pan.zoneOffset(z,1990,1,1));
console.log("host zone:", Intl.DateTimeFormat().resolvedOptions().timeZone);'
```

**Observed** on this machine: `undefined -> -8`, `null -> null`, `"" -> null`, `"Mars/X" -> null`,
host `America/Los_Angeles`. A `place` with no `zone` key would be computed in **whatever timezone the
reader's device is in**, so the same birth silently gives different answers to different readers.

**Honest reachability.** I could not reach it through the UI: the gazetteer always sets a zone
(`src/data/places.ts:25`), `placeFromUrl` requires one, `DEFAULT_PLACE` has one, and the online
geocoder maps a missing timezone to `null`, not `undefined` (`src/data/places.ts:40`). This is a
latent trap in a helper shared by ~10 engines, not a live user-facing bug — but the `?? 5.5` in
`makeInput` is written as if it catches this case, and it does not.

**Suggested fix.** Make `zoneOffset` reject a non-string zone explicitly before calling `Intl`.

---

### F5 — P1 · Sade Sati prints its cycle status in English inside the Hindi journey

**Cause.** `src/screens/UtilityCalculatorScreen.tsx:127`

```tsx
{hi?"स्थिति":"status"}: <span style={{color:C.gold}}>{q.cycle.status}</span>
```

`cycle.status` is the raw engine literal `"current" | "upcoming" | "past"`
(`src/engine/sade-sati-report.ts:100`) and is never translated.

**Reproduction** — `/calculator/sade-sati/?lang=hi`, 1990-01-01 12:00, New Delhi, check date today.
**Observed:** `· स्थिति: current`. **Expected:** `चल रहा है / आने वाला / बीत चुका`.

This was the **only** script leak across 14 calculators × 2 languages × 2 charts (see the CLEAN
section) — but it sits inside the Sade Sati report, the most-read dosha page.

---

### F6 — P1 · The annual Shraddha date is printed as a bare, unlocalised `d/m/yyyy`

**Cause.** `src/screens/UtilityCalculatorScreen.tsx:115`

```ts
`${hi?"वार्षिक श्राद्ध तिथि":"calculated annual date"}: ${a.day}/${a.month}/${a.year}`
```

The same component already has `fmtMs` (line 124) using `toLocaleDateString(hi?"hi-IN":"en-US", …)`
for the Sade Sati dates.

**Reproduction** — `/calculator/shraddha-tithi/`, date of passing **1972-03-14**, 12:00, New Delhi.
**Observed (both EN and HI):** `Phalguna Krishna Chaturdashi (14) · calculated annual date: 5/4/2027`
and `फाल्गुन कृष्ण चतुर्दशी (14) · वार्षिक श्राद्ध तिथि: 5/4/2027`.
**Expected:** the day the engine actually computed — **5 April 2027 / 5 अप्रैल 2027**. A US-locale
diaspora reader reads `5/4/2027` as 4 May and observes shraddha a month late.

(Deaths 1990-01-01 → `12/1/2027` and 2010-05-05 → `27/5/2027` have the same ambiguity.)

**Suggested fix.** Reuse `fmtMs(a.apMid)`.

---

### F7 — P2 · Shraddha strips the Adhik (intercalary) marker and never says which month convention it used

**Cause.** `src/screens/UtilityCalculatorScreen.tsx:115` — `const month=q.amanta.replace(" (Adhik)","")`.
`q.purnimanta` and `q.adhik` are computed at `src/engine/utility-calculators.ts:63` and never rendered.

**Reproduction** — date of passing **2010-05-05** 12:00, New Delhi:

```bash
node -e '
const {loadApp}=require("./validation/_load-app.cjs");
const calc=loadApp("src/engine/utility-calculators.ts");
const r=calc.shraddhaTithi({y:2010,m:5,day:5,hh:12,mi:0,tz:5.5,lat:28.61,lon:77.21}, Date.UTC(2026,7,18));
console.log({tithi:r.tithi,fortnight:r.fortnight,amanta:r.amanta,purnimanta:r.purnimanta,adhik:r.adhik});'
```

**Observed** engine: `amanta:"Vaishakha (Adhik)", purnimanta:"Vaishakha (Adhik)", adhik:true`.
**Observed** screen: `Vaishakha Krishna Saptami (7)` — no Adhik, no convention label.
**Expected:** say that the death fell in an Adhik masa, and label the month name as amanta (the
purnimanta name differs for other deaths — 1972-03-14 is amanta **Phalguna** but purnimanta
**Chaitra**, and north-Indian families reckon purnimanta).

The engine's *scan* for the annual occurrence deliberately matches the nija month, which is
defensible practice; the display omission is the defect.

---

### F8 — P2 · Calculation blocks the main thread for up to 6 seconds with no busy state, and returns silently incomplete at polar latitudes

Measured (`Date.now()` around a single call, this machine):

| call | ms |
|---|---|
| `quickBirth` Delhi | 10 |
| `westernRelationship` | 6 |
| `sadeSati` Delhi | 337 |
| `shraddhaTithi` Delhi | 470 |
| `shraddhaTithi` Tromsø | 1,903 – 6,214 |

The Calculate button (`UtilityCalculatorScreen.tsx:137`) has no pending/disabled state, so on a phone
this reads as a dead button.

At polar latitudes the `occurrence()` scan (`src/engine/utility-calculators.ts:55`) skips every day
where `sunEvents` has no rise or set, so the annual date can come back empty:

```
Tromso        annual = []
Longyearbyen  annual = []
McMurdo       annual = []
Reykjavik     annual = [2027-07-02, 2028-06-21]
```

`answer()` then just omits the `· calculated annual date:` clause — the user is never told the app
could not find one. AGENTS.md: *"Errors must surface visibly in the UI. Silent failure is
unacceptable."*

---

### F9 — P2 · Invalid and out-of-range inputs are either silently normalised or rejected with one message that names the wrong field

All observed via `makeInput` + engine:

* **29 Feb on a non-leap year silently becomes 1 March.** `quickBirth` for `1990-02-29` returns
  exactly the same chart as `1990-03-01` (Mesha / Ashwini) — `Date.UTC` normalises and nothing
  notices. Native pickers usually block this; a pasted or programmatic value does not.
* **No year range guard at all.** `y=1`, `y=1582`, `y=9999` all return confident-looking answers
  from a Schlyter-epoch low-precision ephemeris that is not valid over that span.
* **`lat=200` / `lon=999` are accepted** and produce answers (only reachable through a place object —
  `placeFromUrl` does bound-check lat/lon, so this is defence-in-depth, not a live hole).
* **One generic error for four different problems.** Blank date, blank time, Devanagari-numeral date
  and a blank Sade Sati "Check date" all end at `UtilityCalculatorScreen.tsx:113`:
  *"Could not calculate. Check the date, time and place."* — which does not mention the Check-date
  field at all, and never says which of the three is wrong.
* `time="24:00"` is passed straight through as `hh=24`; `time="12:00:59"` silently drops the seconds.

---

### F10 — P2 · `/Calculator/rashi` and `//calculator/rashi` fall through to `null` and render the Daily screen under a calculator URL

**Cause.** `src/data/utility-calculators.ts:60`

```ts
if (/^\/calculators?(\/|$)/.test(pathname)) return { kind: "notfound" as const, requested: pathname };
return null;
```

The guard is case-sensitive and assumes a single leading slash.

```bash
node -e '
const {loadApp}=require("./validation/_load-app.cjs");
const d=loadApp("src/data/utility-calculators.ts");
for (const p of ["/calculator/RASHI","/Calculator/rashi","//calculator/rashi","/calculator/rashi/extra"])
  console.log(p.padEnd(24), JSON.stringify(d.utilityFromPath(p)?.kind ?? null));'
```

**Observed**
```
/calculator/RASHI        "notfound"
/Calculator/rashi        null        ← Daily renders under a calculator URL
//calculator/rashi       null        ← same
/calculator/rashi/extra  "notfound"
```
**Expected** — `notfound` for all four. This is the exact class the previous bug bash closed as F4
("never let Daily render silently under an invalid calculator URL", comment at line 55-59); the
comment claims wrong case is covered, and `/calculator/RASHI` is, but a wrong-case *namespace* is not.

**Suggested fix.** Normalise the pathname (lowercase, collapse repeated slashes) before matching, and
extend the existing gate assertion at `validation/utility-calculators.cjs:64` with these two.

---

### F11 — P2 · The error boundary never resets on route change, and the page metadata freezes with it

`src/components/AppErrorBoundary.tsx:29-45` clears `error` only from the **Try again** button; there
is no `popstate` listener and no `componentDidUpdate` reset.

**Observed live** after the F2 crash: nine subsequent in-app navigations all rendered
"Something went wrong", and `document.title`, `<link rel=canonical>` and `<meta name=description>`
stayed frozen on the last route that rendered successfully:

```
location.href : /calculator/western-relationship/?lang=en&city=…
document.title: "Baby-name initials | Ganak"
canonical     : https://ganakapp.com/calculator/baby-name/
description   : "Traditional starting sounds from birth nakshatra and pada."
```

The boundary screen offers no link back into the app, so a reader who hits Back is still looking at
the crash screen. **Suggested fix:** clear `error` on `popstate` (and on a `key`ed route prop).

---

### F12 — P2 · Hindi micro-copy in the answer lines

From the Pass 4 renders (real screen, `lang="hi"`):

* `आपका जन्म नक्षत्र धनिष्ठा, चरण 4.` — Latin full stop instead of `।`, and no verb (`है`).
  Same at `आपका जन्म-पक्षी: मोर.` and the synastry line, while every other Hindi answer ends `है।`.
* Kala Sarpa ordinals render as `राहु 1वें भाव में` / `केतु 7वें` (`UtilityCalculatorScreen.tsx:115,116,120`).
  `1वें` and `2वें` are not Hindi ordinals — `पहले`/`प्रथम`, `दूसरे` are.

---

### F13 — P2 · "n/7 planets are enclosed" can never go below 4/7, so a low number reads as partial progress

`kalaSarpaFromRows` (`src/engine/doshas.ts:55-56`) sets `enclosed = max(fwd.length, bwd.length)`, so
the *minimum possible* value is 4. The answer line
*"No complete Kala Sarpa pattern; 4/7 planets are enclosed"* actually describes the maximum possible
spread — the reader will hear "more than half the way there". Suggest phrasing the counter as
"largest group on one side of the axis: n of 7", or reporting the outside count instead.

---

## What I probed and found CLEAN

These are negative results — I ran them and they held.

**Route resolution.** `utilityFromPath` handled 14 of 16 hostile paths correctly (all but F10):
`/calculator/rashi`, `/calculator/rashi/`, `/calculator/RASHI`, `/calculator/rashi%20`,
`/calculator/rashi?x=1`, `/calculator/`, `/calculator`, `/calculators`, `/calculators/`,
`/calculator/../../etc`, `/calculator/rashi/extra`, `/calculator/rashi-`, `/calculator/चन्द्र`,
`/calculator/sun-sign//`. Non-calculator paths stayed `null`.

**Timezone lookup for every shipped city.** All **84 gazetteer zones × 1900–2030 = 11,004 lookups**
returned a value — **zero** silent IST fallbacks for any real city in the app. Fractional and
historical offsets are all correct: Kathmandu +5:45, Chatham +13:45, Adelaide +10:30, Yangon +6:30,
Kabul +4:30, India war time +6:30 (1942-09) and its 1945-10 end, Kolkata LMT +5:21 pre-1906. Zones
that changed side of the date line resolve to the historically right value for the tested date
(Samoa −11 and Kiritimati −10 in 1990, Fiji +12, Chatham +13:45).

**The two ephemeris paths agree exactly.** `computeKundli(...).rows[].lon` vs
`planetSidMs(name, ms)` for Sun/Moon/Mars/Mercury/Jupiter/Venus/Saturn/Rahu: **max separation
0.0000°** over 1930–2040, and **0 sign mismatches in 4,848 comparisons** over 1930–2030. The Sade
Sati report's own Saturn agrees with a same-instant chart for every birth tested. So the calculators
and the panchang are not two different skies.

**Structural invariants, 2,000 random births (1930–2025): 0 violations.** Papa total always 0–15 and
always equal to the sum of its three reference scores; Mangal always exactly 3 references and the
1/2/4/7/8/12 house rule always matches `counted`; Kala Sarpa `enclosed` always 4–7, `full` always
implies 7, Rahu/Ketu always exactly 6 houses apart, `rahuHouse` always 1–12; Pancha Pakshi always
returns both `bird` and `birdHi`.

**Sade Sati rule.** 12th / same / 2nd sign from the natal Moon, verified against the sign indices for
four births; phase naming (`rising`/`middle`/`setting`/`none`) matches relations 11/0/1 and
`SADE_SATI_PHASE_COPY` has a `none` entry, so the not-active path does not crash.

**Annual Shraddha date is correct.** I re-derived it independently by scanning whole calendar years
rather than returning the first hit. For all three deaths tested (1972-03-14, 1990-01-01, 2010-05-05)
across 2026/2027/2028 the engine's first match was the **only** match in the year, the roll-forward
past "now" behaved as documented, and the future-death guard rejects a future date with a bilingual
notice rather than a number. The *value* is right; F6/F7 are about how it is printed.

**Bilingual script purity.** Across 14 calculators × EN + HI × two charts (dosha-negative and
dosha-positive), plus the catalogue and the not-found page in both languages: **no Devanagari leaked
into any English view**, and the **only** Latin leak in the Hindi views was F5. The answer-first
block renders before the technical detail in both languages on all 14, and every jargon term I
checked has a Hindi rendering (`विषधर`, `अनुदित`, `पापग्रह-भार`, `नवमेश`, `सिनैस्ट्री`, `षडाष्टक`,
`केन्द्र-दृष्टि`, `प्रतियुति`, planet and sign names all in Devanagari via `panchangTerm`/`signLabel`).

**No reset without a user action.** Changing the language keeps the calculated result and re-renders
it in the new language (the clearing effect at line 81 deliberately excludes `lang`). The clearing
effect is keyed on primitive place *values*, so the shell re-minting `DEFAULT_PLACE` on every render
(`src/kundli-app.tsx:122,129`) does **not** wipe a valid answer — I verified the keys are
`place?.lat/lon/label`, not object identity.

**URL round-trip.** `utilityHref` writes `lang`, `city`, `lat`, `lon`, `zone`; `placeFromUrl`
(`src/kundli-app.tsx:123`) reads exactly those keys back with lat/lon bound checks, and `lang` is
seeded from the URL at mount. City changes use `replaceState` so Back does not walk through past
cities.

**Errors are in the DOM, not the console.** The blocking-place guard, the future-death notice and the
catch-all use `role="alert"` / `role="status"` (`UtilityCalculatorScreen.tsx:137`). The one path that
escapes the UI entirely is the render-time crash in F2.

**Midnight boundaries.** 00:00, 00:01, 12:00 and 23:59 on 1990-01-01 Delhi all produce distinct,
monotonic, sensible charts; no off-by-one day at either end.

---

## Coverage I could NOT get — read this before treating anything as passed

1. **No browser run of *this* worktree.** The sandbox refuses to bind a port from a shell
   (`listen EPERM` on both `::1` and `127.0.0.1`), and the MCP preview server resolves
   `.claude/launch.json` from the *parent* checkout — it served
   `/Users/shivie/ClaudeProjects/Kundli` on branch `claude/hora-usefulness` at `df0e7e5`, whose
   `UtilityCalculatorScreen.tsx` differs from `421e82d` by 62 lines (that revision has no
   `utilityHref`/`followUtilityLink` at all). **The live-browser evidence in F2 and F11 comes from
   that checkout.** Everything else in this report is headless against this worktree's source. The
   worktree needs a real browser pass before any of this is called closed.
2. **No phone-width, overflow, contrast or touch-target pass.** `renderToStaticMarkup` proves text,
   never layout — the same caveat AGENTS.md puts on `screen-snapshots.cjs`.
3. **No live production check.** `TEST-STD-CALCULATORS` explicitly requires "live production
   behaviour (not just localhost)"; I did not touch ganak.pages.dev.
4. **No keyboard or screen-reader pass**, and no real typing into the date/time controls — I set
   values programmatically, so native picker rejection of e.g. 29 Feb 1990 is untested in a browser.
5. **The online geocoder path was never exercised** — no network calls were made, so
   `searchOnline`'s `zone: p.timezone || null` (`src/data/places.ts:40`) is untested against real
   Open-Meteo responses. If that field is ever absent, F3's silent-IST path opens through the UI.
6. **The Pancha Pakshi bird mapping is not verified against a cited source.** The engine states its
   own convention ("five equal nakshatra groups, the final group has seven; the waning fortnight
   reverses the order") and is internally consistent for all 27 nakshatras and both pakshas, but I
   found no classical or published reference in the repo to check it against. Treat it as
   *unverified*, not *correct*.
7. **The Vedic anchors (Moon sign, Sun sign, nakshatra, pada, naming sound for 1990-01-01 Delhi) were
   not independently re-fetched from Drik.** I confirmed the app is self-consistent and matches the
   values already frozen in `validation/utility-calculators.cjs:18-23`; if those anchors are wrong,
   my pass would not have caught it.
8. **The 110,684-birth DST sweep covers seven cities.** Zones with more exotic history (Lord Howe's
   30-minute DST, Morocco's Ramadan shifts, Chile's regional splits) were spot-checked at most.
9. **`screen-snapshots.cjs` does not cover this screen at all** — I grepped; there is no calculator
   entry in the snapshot set. So no existing gate would have caught F5, F6, F12 or F13.

---

## Reproduction scripts

The five probe harnesses live in `.scratch/bugbash/` in this worktree (gitignored, so they are not
part of this commit):

| file | pass |
|---|---|
| `p1-input-hostility.cjs` | 1 |
| `p2-place-time.cjs`, `p2b-dst-impact.cjs` | 2 |
| `p3-stale-result.cjs` | 3 |
| `p4-bilingual.cjs` | 4 |
| `p5-answer-quality.cjs`, `p5b-shraddha-date.cjs` | 5 |

They only `require('./validation/_load-app.cjs')` and React, write nothing, and can be re-created
from the inline commands above. `p3`/`p4` seed React's 4th `useState` call (the `result` state) so
the real component can be rendered in a post-navigation state; that is the only white-box trick used.
