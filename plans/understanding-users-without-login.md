# Understanding users without login — research

**Owner's problem (2026-07-20):** *"I want to understand how users are navigating, what
is actually being used, and who the users are. If it had been cheap I would have gone
for login so astrologers could use it and we could observe their usage patterns…
without signup of astrologers we can't understand the usability of these features,
which is a blocker."*

Research only. No code, no tooling installed.

---

## The short version

**Login is not what's blocking you, and adding it would not solve this.**

You are asking three different questions that feel like one. They need three different
tools, and only one of them involves analytics at all:

| Your question | Right tool | Cost | Needs login? |
|---|---|---|---|
| "Can my intended users actually navigate this?" | **5 moderated usability tests** | ₹0 | **No** |
| "Who are my users — are astrologers using it?" | **Behavioural cohorting** (infer from what they do) | ₹0–$9/mo | **No** |
| "What is actually being used?" | **Anonymous event analytics** | ₹0–$9/mo | **No** |

Login would give you a *name attached to clicks*. It would not tell you *why* someone
gave up on the Muhurat finder. And it would put a signup wall in front of a free
panchang whose main advantage over Drik and ProKerala is that it asks nothing of you.

---

## 1. "Can users navigate this?" — this is not an analytics question

This is the one you're most worried about ("if it exists on the side but only on button
click and user is unaware he needs to click the button"). **Analytics cannot answer
it.** Analytics tells you *that* nobody tapped the button. It never tells you whether
they didn't see it, didn't understand the label, or saw it and didn't care. Those three
have completely different fixes.

The tool that answers it is **moderated usability testing**, and the finding you need
is Nielsen's: testing with **5 users surfaces about 85% of usability problems**. One
user alone finds roughly 30%. After 5, you mostly see the same problems again — the
returns collapse.

**What this looks like for Ganak, concretely:**

- Recruit **5 people from your actual intended audience** — and for your elder-friendly
  requirement, at least two should be older relatives or neighbours, not tech-comfortable
  friends. Family counts. This costs nothing.
- Give each a task, not a tour: *"Find out when Ekadashi is this month."* *"Find a good
  day for a housewarming in the next three months."* *"Ask a question about your job."*
- **Say nothing while they try.** Watch where their thumb hesitates. The silence is the
  data.
- 30 minutes each. One weekend. You will personally watch someone fail to find the
  Muhurat finder, and you will never again wonder whether the IA is broken.

This directly answers the concern that made you park EPIC-IA. It is the cheapest,
fastest, highest-signal thing available to you, and it needs neither login nor
analytics nor launch traffic. **You could do it this week with the app as it stands.**

The caveat worth knowing: 5 is a rule for *qualitative* testing — finding problems. It
is not enough to *measure* anything (conversion rates, A/B tests). For "is this
usable", 5 is right.

---

## 2. "Who are my users?" — behavioural cohorting, no identity required

You don't need someone to tell you they're an astrologer. **Astrologers behave
differently, and behaviour is observable anonymously.**

Ganak already has near-perfect expert/novice tells built in, because of how the
progressive disclosure is structured:

| Signal | What it implies |
|---|---|
| Taps **"Full Prashna chart"** | Wants the evidence, not just the verdict → expert-leaning |
| Opens **divisional charts (D9, D10…)** | Almost certainly a practitioner |
| Switches ayanamsa to **KP** | Definitely a practitioner |
| Uses **Prashna repeatedly in one session** | Either a practitioner testing it, or someone anxious |
| Only ever opens **Daily, reads tithi, leaves** | Everyday devotional user — your core |
| Taps a **festival, reads the vidhi** | Observance-driven user |

Instrument those as named events and you get your segments on day one, with no signup,
no PII, and no wall. You'd learn "8% of sessions open the full chart" — which tells you
both how many practitioners you have *and* whether the tier-1/tier-2 split from the
Prashna review was the right call.

**This is strictly better than login for your stated purpose.** Login tells you *who*
someone claims to be. Behaviour tells you what they actually do — and every serious
product team trusts the second over the first.

---

## 3. "What is actually being used?" — tooling options

| Tool | Cost | Custom events? | Notes |
|---|---|---|---|
| **Cloudflare Web Analytics** | **Free** | Weak | You're already on Cloudflare Pages, so it's near-zero setup. But **30-day retention** and **known data sampling** — you may see an estimate from a fraction of visitors. Fine for "how much traffic", poor for "which features". |
| **Umami** (self-hosted or cloud) | Free tier ~100k events/mo | **Yes** | Open source. Self-hosting keeps data entirely on infrastructure you control — the strongest privacy position available. Costs you a small VPS if self-hosted. |
| **Plausible** | ~$9/mo at 10k pageviews | **Yes** | Cookieless; uses a daily-rotating hashed identifier rather than persistent IDs. 3+ years retention. Comfortably inside your $10–50/mo budget. |
| **PostHog** | Generous free tier (~1M events) | Yes, plus funnels/recordings | **Not recommended here.** It leans on tracking cookies and builds identifiable user profiles — the opposite of Ganak's positioning. Self-hosting it is heavy (Kafka + ClickHouse). |

**Recommendation: Plausible or self-hosted Umami**, because your real need is *custom
events* (which features get used), and that's exactly where the free Cloudflare option
is weakest.

---

## ⚠️ 4. The privacy problem you must not walk into

Your footer, which I made factually true eight commits ago, currently says:

> ॐ · computed on your device · **no account, no tracking** · city search uses an online lookup

**Any analytics — even cookieless, even self-hosted — makes "no tracking" false.**

This is exactly the Google Fonts trap again: a true-sounding claim quietly becoming
untrue because a well-intentioned feature was added. For a devotional audience, and for
a product whose pitch is *"unlike Drik and ProKerala, we don't do this to you"*, getting
caught overstating would cost more than the analytics is worth.

**Before any analytics ships, all of these must move together in one change:**

1. Footer wording updated (e.g. *"no account · no ads · anonymous usage counts only"*).
2. `plans/legal-privacy-terms-draft.md` §2.2 updated — analytics becomes a third thing
   that leaves the device, alongside city search and (now removed) fonts.
3. A plain-language line where a curious user can find it: what is counted, what is not,
   and that it is never linked to a person.
4. DPDP/GDPR check — an IP address is personal data in the EU. Self-hosted or
   IP-hashing tools are materially better here.

**Your ad-free, tracker-free stance is a genuine competitive asset.** Anonymous,
aggregate, disclosed counting keeps almost all of it. Silent tracking would spend it.

---

## 5. On astrologers specifically — recruit, don't authenticate

You want astrologers using it so you can find bugs and judge whether the advanced
features are usable. **That is a recruitment problem, not an auth problem.**

Ten engaged astrologers who know you are watching will find more real bugs in a week
than ten thousand anonymous sessions. You don't need a login system to get them — you
need a list and a way to talk to them:

- A small **WhatsApp or Telegram group** of practitioners willing to try it and complain
  freely. This is how you get sentences like *"the 6th house line makes no sense for a
  job question"* — the exact class of bug analytics can never surface.
- A quiet **"help us improve" link** in the footer → a form or WhatsApp deeplink. No
  account, no friction.
- **Personal outreach.** You are in India, targeting Hindu practitioners, with a free,
  ad-free, accurate tool. That is an easy ask.

Login remains a Phase-4 decision, driven by *saved charts and reminders* — features
that genuinely need identity — not by analytics.

---

## 6. What this unblocks

You called this a blocker on the IA/elder-friendly work. It isn't, and that matters:

- **The 5-user test needs nothing you don't already have.** It can run this week.
- **Behavioural analytics needs one small instrumentation pass** plus the privacy
  disclosure change above.
- **Neither needs login, launch traffic, or budget.**

The sequencing that makes sense:

```
1. 5 usability tests (this week, ₹0)        → answers "can they navigate it?"
2. Instrument key events + fix the footer   → answers "what's used, by whom?"
3. Recruit ~10 astrologers into a group     → answers "do the advanced features work?"
4. Login                                     → Phase 4, when reminders/saved charts need it
```

Step 1 alone will probably reshape EPIC-IA more than the other three combined.

---

## Sources

- Nielsen, *Why You Only Need to Test with 5 Users* — nngroup.com; and *Why 5
  Participants Are Okay in a Qualitative Study, but Not in a Quantitative One*
- Plausible vs Cloudflare Web Analytics comparison (plausible.io); Nuxt Scripts
  privacy-first analytics comparison; Swetrix and PostHog GDPR-analytics comparisons
