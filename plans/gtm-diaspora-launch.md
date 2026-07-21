# Ganak — GTM plan: diaspora-first launch

**Written:** 2026-07-20 · **Beachhead chosen by owner:** Diaspora Devotee (Persona B)
**Status:** proposal for owner sign-off. Supersedes nothing; complements
`plans/backlog.md` (strategy) and `plans/roadmap-breakdown.md` (personas).

Festival dates below are **Ganak's own output**, pulled by running
`scanPanchangCalendar` through `validation/_load-app.cjs` — not copied from a doc.

---

## 1. The bet in one paragraph

India is the bigger market; the diaspora is the better **beachhead**. In India,
"correct and fast" is table stakes and Drik/AstroSage already meet it — Ganak would
be arguing about a need already served. Abroad, the need is *structurally unmet*:
the festival date genuinely differs from India, nobody in the household is sure
which day is right, and the person responsible has to decide anyway. Ganak's three
real differentiators — timezone-correct dates, plain-language answer-before-data,
and vidhi content that says *what to actually do* — are worth little to a Delhi
householder and a lot to a Hindu household in New Jersey. Win them, earn the
proof and the revenue, then walk into India with a product that has been hardened
by the most demanding users.

---

## 2. The segment: "the Family Calendar-Keeper"

Not "Indians abroad." That is a demographic, not a segment. The keen adopter is
defined by a **role inside a household**:

> **The one person in a diaspora Hindu household who is expected to know when the
> festivals and fasts fall, and who gets asked.**

### Precise definition

| Attribute | The keen adopter |
|---|---|
| **Location** | US, UK, Canada, Australia, UAE/Gulf, Singapore |
| **Generation** | First-generation immigrant — moved as an adult, 28–58 |
| **Role** | Runs the household's observances. Disproportionately (not exclusively) women; frequently the eldest daughter-in-law or the mother of school-age children |
| **Behaviour** | Keeps **2+ observances a month** — an Ekadashi, a Pradosh, a Sankashti, plus the big festivals |
| **Authority gap** | Their parents in India used to be the calendar authority. Distance, time zones or bereavement moved that job to them, and they don't feel qualified |
| **Current workaround** | Drik Panchang's website (accurate, but dense and timezone-confusing), a paper calendar from the local temple, a WhatsApp message to their mother, or all three cross-checked |
| **Trigger moment** | *"Is Janmashtami the 4th or the 5th **here**?"* — the day it differs from India and they must decide for the family |

### Why this segment adopts, when most don't

1. **The pain is recurring and unresolved.** Not annual — monthly, sometimes weekly.
2. **They already do manual work.** Cross-checking two sources, or calling India.
   Replacing labour is a far easier sell than creating a new habit.
3. **Social capital is at stake.** Getting the date wrong is publicly embarrassing
   in a way that a wrong horoscope never is. Correctness has real emotional weight.
4. **Switching cost is zero.** It is a free web page. No install, no signup, no
   data migration.
5. **They are already in dense, findable groups** — temple mailing lists, regional
   WhatsApp groups, university Hindu student associations, `r/hinduism`.

### The growth insight — this segment is a multiplier, not a leaf

A Calendar-Keeper does not consume the answer alone. **They broadcast it.** They
are asked by 5–30 people (family group, temple group, WhatsApp), and they answer
by forwarding something. Every acquired Calendar-Keeper is a small distribution
node. This is why the segment is worth more per head than its size suggests, and
it dictates a product requirement:

> **Ganak must be trivially forwardable.** A shareable, self-explanatory link or
> image for a single day/festival is not a nice-to-have — it is the growth engine
> of this plan. (See §7, GTM-1.)

### Anti-segment — who we deliberately do NOT chase at launch

- **Practising astrologers.** Persona C. The chart section is hidden anyway. They
  will demand depth that drags the roadmap away from the beachhead.
- **India-domestic mass market.** Phase 2. Do not spend a rupee here yet.
- **Second-generation who don't observe.** No recurring need; no pain to solve.
- **Curious non-Indians.** Flattering traffic, no retention.

Saying no to these is the plan working, not the plan failing.

---

## 3. The three cohorts

These get conflated constantly. They are different populations with different
jobs. Sequence: **beta users** (invited, pre-launch) → **early adopters**
(self-selected, post-launch) → **power users** (emergent, cultivated).

| | Beta users | Early adopters | Power users |
|---|---|---|---|
| **When** | Pre-launch, Aug–Sep 2026 | Launch wave, Oct–Dec 2026 | Emerge from month 2 onward |
| **Size** | 25–40 **named** people | First ~1,000–3,000 | Top ~5% of the base |
| **How they arrive** | You invite them personally | They self-select from a channel | They are already users |
| **Their job** | Prove dates are right; find breakage | Prove the value prop; create word of mouth | Retain, contribute, refer, eventually pay |
| **Tolerance for gaps** | Very high — they know it's a beta | Moderate — they forgive gaps, not errors | Low — they depend on it |
| **You owe them** | Access + attention + credit | A product that works on the big days | Depth, and a say in the roadmap |
| **Fails if** | They're all your friends | You launch off-calendar | You never identify them |

### 3.1 Beta users — 25–40 named people, Aug–Sep 2026

**Purpose: one question only — _are the dates right for people who live abroad?_**
The engine is gate-validated against Drik for New Delhi. That proves nothing about
whether a household in Houston observed Janmashtami on the day Ganak shows. This
is the single assumption that, if wrong, kills the plan — so it is what beta tests.

**Recruitment (target 30, expect ~50% to actually engage):**

| Source | Target | Notes |
|---|---|---|
| Owner's own network abroad | 10 | Family, friends, ex-colleagues. Start here — it's fast and honest |
| One temple/community WhatsApp group | 10 | Ask the group admin first; one warm intro beats 100 cold posts |
| `r/hinduism`, `r/ABCDesis`, one university HSC | 10 | Post asking for testers, not announcing a product |

**Screener — 4 questions. Take them only if they answer yes to 1, 2 and 4:**
1. Do you live outside India?
2. Do you observe at least one fast or festival in a typical month?
3. Who in your family decides which day a festival falls on? *(Looking for "me")*
4. Have you ever been unsure whether a festival was today or tomorrow where you live?

**The ask (make it small and specific):**
- Use Ganak for 4 weeks, covering **at least two real observances**.
- **The one duty:** whenever you observe something, check what Ganak said against
  what your household/temple actually did. Report every mismatch.
- One 20-minute call at the end.

**What they get:** named credit in the app, a direct line to you, and their
requested festival or vidhi added. That is a real and sufficient incentive for
this segment — they are motivated by the thing existing, not by swag.

**Go / no-go before public launch:**
- ✅ ≥ 90% of beta users report every date matched what their household observed
- ✅ **Zero** unresolved wrong-date reports
- ✅ ≥ 40% return in week 4 without being prompted
- ❌ If dates mismatch by region/tradition → that is a *content variant* problem
  (`B2` in the roadmap), and it blocks launch. Do not launch through it.

**Why Aug–Sep is the right beta window:** it is observance-dense, so testers hit
real observances fast instead of staring at an empty app — Hariyali Teej (Aug 15),
Nag Panchami (Aug 17), Raksha Bandhan (Aug 28), Janmashtami (Sep 4), Hartalika
Teej + Ganesh Chaturthi (Sep 14), Radha Ashtami (Sep 19).

### 3.2 Early adopters — the launch wave, Oct–Dec 2026

**Definition:** self-selected first users who arrive because the pitch resonated,
and who will forgive missing features but *not* wrong dates.

**They are attracted by a sharp claim, not by a feature list.** The pitch:

> **"The Hindu calendar, correct for where you actually live — in plain English."**

Not "panchang, kundli, muhurat, matching and dashas." Feature lists lose to
incumbents. One sharp claim, aimed at the trigger moment, wins.

**The launch calendar — this is the spine of the plan.** Ganak's own 2026 output:

| Date | Observance | GTM role |
|---|---|---|
| **Oct 11** | **Navratri begins** | **PUBLIC LAUNCH.** 9 days of daily re-opening — the best retention test in the year |
| Oct 19–20 | Maha Ashtami / Navami, Dussehra | Sustain |
| Oct 25 | Sharad Purnima | Sustain |
| **Oct 29** | **Karva Chauth** | Highest-intent day for the core segment; moonrise time is the killer feature — **make sure it's local-timezone perfect** |
| Nov 1 | Ahoi Ashtami | Sustain |
| **Nov 5–15** | **Diwali cluster + Chhath** | **PEAK. The single biggest acquisition window of the year** |
| Nov 17 / Nov 24 | Ayyappa Mandala, Karthigai Deepam | South Indian diaspora — a distinct wedge |
| Jan 14 2027 | Makar Sankranti | Re-engagement |

**Launch just *before* Navratri (Oct 11), not after.** A festival-driven product
launched in a quiet week has no way to prove itself.

**Target:** 1,000–3,000 uniques by 31 Dec 2026, with ≥ 25% returning in a later week.
Raw traffic is a vanity number here; **return-on-the-next-observance** is the real one.

### 3.3 Power users — emergent, from month 2

**Definition — behavioural, not demographic. Any user who does 2 of these:**
- Opens Ganak on ≥ 8 distinct days a month
- Returns for **non-festival** days (Ekadashi/Pradosh/Sankashti) — the strongest signal
- Uses the muhurat finder (high-intent: a real decision is being made)
- Shares/forwards from the app
- Sends feedback unprompted

**Why they matter disproportionately:**
1. They are the Calendar-Keepers of §2 — each one is a distribution node.
2. They are the **content engine.** They will tell you which regional variant is
   wrong, which vidhi is incomplete. That is exactly the Tier-3 long tail the
   backlog wants fed by user feedback post-launch.
3. **They are the monetization base.** When saved charts and AI explanations
   arrive, this cohort — not the general base — is who converts.

**How to cultivate them (in priority order):**
1. **Identify them at all.** You cannot cultivate an invisible cohort. Analytics
   (already `EPIC-LAUNCH`) must report *return frequency*, not just pageviews.
   No browser storage is allowed, so identity is coarse — measure cohort-level
   return rates, not individuals.
2. **Give them a way in.** A persistent, low-friction feedback affordance
   (`src/components/Feedback`, already scoped) is the whole intake pipe.
3. **Close the loop publicly.** A visible "what's new / what you asked for"
   note converts a feedback-giver into an advocate more reliably than any reward.
4. **Recruit the top ~20 into a standing council** for Phase 2 — they become the
   beta cohort for the chart section and the first monetization test.

**Health metric:** ≥ 5% of monthly actives meet the power-user bar by Feb 2027.
Below that, the product is a festival-day lookup, not a habit — and the diaspora
bet needs it to be a habit.

---

## 4. The one thing that will break this plan

**The Diwali cluster is missing from the content, and Diwali is the peak
acquisition window.** Confirmed by running the engine, not assumed: Ganak fires
`diwali` on Nov 8 and then nothing until Nov 17. Absent —

| Missing | 2026 date | Why it is fatal *here* |
|---|---|---|
| **Dhanteras** | Nov 6 | The cluster's opening day; heavily observed abroad |
| Govatsa Dwadashi | Nov 5 | Cluster start |
| Kali Chaudas | Nov 7 | Shakta households |
| Narak Chaturdashi | Nov 8 | Major |
| **Govardhan Puja / Annakut** | Nov 10 | Major; big temple event in the diaspora |
| **Bhaiya Dooj** | Nov 11 | Major |
| **Chhath Puja** | Nov 15 | Tens of millions; **vidhi content is already written — only the calendar entry is missing. Cheapest possible win.** |

A Calendar-Keeper who opens Ganak on Dhanteras, sees nothing, and gets asked by
their family will not come back on Govardhan Puja. **You get one shot at the peak
week.** Treat "Diwali cluster complete" as a hard launch gate — it is a GTM
dependency with a date on it, not a content backlog item.

**Deadline: the cluster must be live and verified by 22 Oct 2026** (two weeks
before Dhanteras, so it is testable through Navratri traffic first).

---

## 5. Channels, ranked by cost-to-first-user

Assumption: near-zero budget, solo owner. Ranked accordingly.

| # | Channel | Effort | Why it fits |
|---|---|---|---|
| 1 | **Temple & community WhatsApp groups** | Low, manual | Where Calendar-Keepers already ask the question. Get one admin to vouch; never spam cold |
| 2 | **Owner's own network** | Lowest | Honest, fast, non-scalable — correct for beta |
| 3 | **`r/hinduism`, `r/ABCDesis`, regional subs** | Low | Ask for testers; be a person, not a launch post |
| 4 | **University Hindu Students' Councils** | Medium | Young Calendar-Keepers-in-training; strong for the Nov cluster |
| 5 | **SEO: "when is X in [city] 2026"** | Medium, slow | Compounding. The exact trigger-moment query. Needs per-festival pages — the *only* SEO worth building |
| 6 | Paid ads | — | **Not yet.** Do not buy traffic before §3.1's go/no-go passes |

**Hard constraint carried from `plans/backlog.md`: never ads on the Panchang
section.** Nothing in this plan changes that.

---

## 6. Metrics — and the kill criteria

| Stage | Success | Kill / rethink |
|---|---|---|
| Beta | ≥90% date-match; 0 unresolved errors | Any systematic regional date mismatch |
| Launch (Navratri) | ≥25% return in a later week | <10% return → it's a lookup, not a habit |
| Diwali peak | Cluster complete; traffic peak ≥3× baseline | Cluster incomplete → **delay the push** |
| Feb 2027 | ≥5% of MAU are power users | <2% → the habit thesis is wrong; revisit |

---

## 7. What I'd do in the next two weeks

- **GTM-1 — make Ganak forwardable.** A share affordance producing a
  self-explanatory link/image for one day or festival. This is the growth engine
  (§2) and it is currently missing. *Highest-leverage product work in this plan.*
- **GTM-2 — close the Diwali cluster + Chhath.** Hard gate, deadline 22 Oct.
  Chhath is nearly free (vidhi written, calendar entry missing).
- **GTM-3 — recruit 30 beta users** against the §3.1 screener. Start with the
  owner's own network this week.
- **GTM-4 — verify Karva Chauth moonrise in a non-India timezone** before Oct 29.
  It is the highest-intent moment for the core segment.
- **GTM-5 — analytics that report return frequency**, not pageviews — otherwise
  the power-user cohort (§3.3) is invisible and uncultivatable.

---

## 8. The riskiest assumption

> **That Drik-parity for New Delhi implies correctness for a Hindu household in
> New Jersey.**

Every gate in this repo validates against Drik's *New Delhi* page. The entire
diaspora bet rests on dates being right in *other* time zones, where the day
boundary genuinely lands differently and where regional/tradition variants
diverge. This is unproven.

**§3.1's beta exists to test exactly this, and nothing else.** If it fails, that
is not a GTM problem — it is the roadmap's `B2` (tradition/regional variants)
becoming the top priority, and the launch date moves.

---

## Open questions for the owner

1. **Which country first?** US and UK have different temple-network access and
   different festival-variant expectations. Picking one sharpens every channel.
2. **Are you willing to do the non-scalable work** — personally recruiting and
   talking to ~30 beta users? The plan assumes yes. If not, beta shrinks to your
   own network and the date-correctness risk stays live into launch.
3. **Is 11 Oct 2026 (Navratri) a realistic launch date** given the content gates
   in `plans/backlog.md`? If not, the fallback is to launch *into* the Diwali
   cluster on ~1 Nov — riskier, because there's no Navratri dress rehearsal.
