# Kundli life-interpretation — owner review checklist

**What this is:** the answer-first Chart reading (`src/data/life-interpretation.ts`)
ships behind the hidden Chart tab, so it is **not user-visible** until the Phase-2
chart reveal. Green gates were enough to merge; this checklist is the content
review to clear **before that reveal**.

**How the review is scoped (spec §C).** The low-risk fields — 27 nakshatra
`nature`/`strengths` and 12 sign `mind` — ride on sourcing + the safety gate
(`validation/life-interpretation-copy.cjs`). Only the **higher-risk sign fields**
need your eyes: `relating`, `work`, `outward` (how others see you), across the 12
signs. English is shown below for a fast read; the Hindi mirrors it in the source
file. When a sign reads right in both languages, tick it and flip that entry's
`status` from `"sourced"` to `"owner-verified"` in `src/data/life-interpretation.ts`.

**What to watch for:** anything that reads as a hard verdict rather than
attribution; anything culturally off; any drift into prediction (career outcome,
money, marriage, health, appearance-as-worth). The gate blocks the obvious cases;
you are the judge of tone and truth.

---

- [ ] **0 · Mesha / Aries**
  - relating: warmth and frankness — loyal and protective, quick to spark and quick to forgive.
  - work: pioneering, leading, physically energetic work — starting ventures more than maintaining them.
  - outward: a direct, energetic first impression — a confident, forthright presence.

- [ ] **1 · Vrishabha / Taurus**
  - relating: loyalty, warmth and constancy — slow to give trust, steadfast once it is given.
  - work: patient, tangible, value-building work — finance, land, food, art and craft.
  - outward: a calm, grounded first impression — a steady, reassuring presence.

- [ ] **2 · Mithuna / Gemini**
  - relating: playfulness and good conversation — warm through words and shared curiosity.
  - work: communication, writing, teaching and trade — work that turns on ideas and quick exchange.
  - outward: a witty, youthful first impression — a talkative, quicksilver presence full of curiosity.

- [ ] **3 · Karka / Cancer**
  - relating: nurturing and protectiveness — bonding deeply, valuing emotional safety.
  - work: caregiving, hospitality, food and history — work that shelters, feeds or preserves.
  - outward: a gentle, caring first impression — a warm, protective presence attuned to feeling.

- [ ] **4 · Simha / Leo**
  - relating: loyalty and grand-hearted warmth — loving generously, flourishing where affection is returned.
  - work: leadership, performance and creative authority — work with visibility, dignity, room to inspire.
  - outward: a dignified, radiant first impression — a confident, generous, commanding presence.

- [ ] **5 · Kanya / Virgo**
  - relating: care shown through service — expressing affection in practical, helpful acts.
  - work: analysis, healing, craft, editing and service — work rewarding precision and a careful eye.
  - outward: a modest, precise first impression — an observant, capable, unassuming presence.

- [ ] **6 · Tula / Libra**
  - relating: grace and partnership — diplomatic, thriving in companionship, drawn to fairness.
  - work: diplomacy, art, design, law and mediation — work that brings people to agreement.
  - outward: a gracious, pleasant first impression — a poised, agreeable, even-handed presence.

- [ ] **7 · Vrishchika / Scorpio**
  - relating: intensity and fierce loyalty — private and all-or-nothing, deep bonds where trust is earned.
  - work: research, investigation, healing and depth — work that uncovers the hidden and transforms it.
  - outward: a magnetic, reserved first impression — an intense presence that reveals itself slowly.

- [ ] **8 · Dhanu / Sagittarius**
  - relating: honesty and good cheer — respecting a partner's freedom, valuing shared ideals.
  - work: teaching, philosophy, law, travel and guidance — work that widens the horizon.
  - outward: an open, optimistic first impression — a frank, buoyant, adventurous presence.

- [ ] **9 · Makara / Capricorn**
  - relating: commitment and reliability — cautious to open up, yet steadfast and devoted.
  - work: administration, structure and long-term building — work rewarding patience and a steady ascent.
  - outward: a composed, serious first impression — a capable, self-contained, steady presence.

- [ ] **10 · Kumbha / Aquarius**
  - relating: friendship and equality — valuing companions as friends, needing room to breathe.
  - work: reform, science, community and innovation — work that serves the collective.
  - outward: an original, cool-headed first impression — a thoughtful, unconventional, friendly presence.

- [ ] **11 · Meena / Pisces**
  - relating: tenderness and selfless love — empathetic and forgiving, giving of itself readily.
  - work: art, healing, spirituality and service — work drawing on imagination and compassion.
  - outward: a gentle, dreamy first impression — a kind, receptive presence with soft, unguarded edges.

---

**After review:** flip each cleared sign's `status` to `"owner-verified"`. The 27
nakshatra entries are optional to skim (low-risk, gate-protected) — do them only if
you want. When every sign is verified, this feature is content-ready for the
Phase-2 chart reveal.
