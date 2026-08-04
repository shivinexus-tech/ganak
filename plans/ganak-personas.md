# Ganak personas — the canonical registry

**Status:** canonical. Every spec must name its primary user from this file.
**Owner-defined**, 2026-08-03. Agents may not invent a persona or infer one from a
neighbouring feature.

## Why this file exists

A spec was written for the calculator tools that optimised for an **elder-friendly** constraint
— few destinations, large targets, minimal choice. That constraint is real, but it belongs to
the Panchang audience. The tools in question were Kala Sarpa and Mangal Dosha calculators, which
an elder householder may never open at all. The spec measured the right thing and answered the
wrong question, because nothing in the process required naming the user first.

Personas existed only scattered across `plans/`, so the wrong one was easy to reach for. This
file makes the choice explicit and auditable. `validation/spec-journey.cjs` enforces that every
new spec names one.

---

## P1 · Panchang householder / diaspora

**Wants:** today's tithi, festival dates, Rahu Kaal, fasting days. Checks quickly, often daily.
**Knows:** the observance, not the astrology. Does not think of this as "doing Jyotish".
**Language:** Hindi or English; often Hindi-first.
**Design constraints that apply:** ✅ **elder-friendly** — few clear destinations, one job per
screen, large type and targets, answer-first. ✅ Low-literacy-tolerant copy.
**Does not want:** birth-chart forms, technical panels, jargon.
**Ganak's aim:** reach. Free forever, never ads (owner rule).

## P2 · Astrology enthusiast

**Wants:** an answer about *themselves* to something they were already told — "I was told I have
Mangal Dosha", "am I in Sade Sati?". Curiosity-driven, episodic.
**Knows:** the *names* of things, not the method. **Recognition is the trigger** — they click
"Kala Sarpa" because the phrase means something to them personally.
**Journey shape:** arrive for something else → recognise a tool by name → try it free → trust the
product → go deeper.
**Design constraints that apply:** tool names must be **visible**, not merely reachable; a
generic "Tools" label does not fire recognition. Minimal friction between tools — they will try
several in one sitting.
**Does not need:** elder-friendly simplification. They will read a dense result if it is honest.
**Ganak's aim:** traction. This is the growth persona.

## P3 · Priest / purohit

**Wants:** muhurat and samskara timing **for other people** — weddings, griha pravesh, naming,
upanayana. Needs local timings and stated conventions.
**Knows:** the tradition deeply; will notice a wrong convention immediately.
**Design constraints that apply:** conventions must be stated and sourced; regional/lineage
differences labelled, never presented as universal. Print/share matters — output is used with
families.
**Ganak's aim:** credibility. This persona's rejection is fatal to trust.

## P4 · Working astrologer

**Wants:** repeat chart work for clients — cast, check several doshas, compare, move to the next
person. Depth over simplicity: divisional charts, dashas, Ashtakavarga, KP.
**Knows:** more than Ganak does about interpretation. Values *speed and correctness*, not
hand-holding.
**Design constraints that apply:** repetition is the cost centre — retyping birth details per
tool per client is the dominant friction. Saved charts matter. **Owner decision 2026-08-03: up
to 5 saved charts**, saved only when the user chooses to (never silently).
**Ganak's aim:** the bankable segment long-term; today, the segment whose usage teaches the most.

---

## Rules for specs

1. **Name exactly one primary persona** (a secondary is allowed, clearly marked).
2. **Do not borrow constraints across personas.** Elder-friendly is P1's. Applying it to P2/P4
   tooling is the error this file exists to prevent. If a constraint feels inherited, say which
   persona it came from and why it transfers.
3. **If the persona isn't in this file, stop and ask the owner.** Do not invent one.
4. **A spec serving "all users" is a spec with no user.** Pick one.

## Current product intent (owner, 2026-08-03)

Everything free, no payment this phase. The goal is **traction and learning**: offer, free, what
competitors charge for; find out what people actually use; pivot on that evidence. Consequently a
spec's success measure is *usage and completed journeys*, not revenue — and any "go deeper" step
must not imply a purchase.
