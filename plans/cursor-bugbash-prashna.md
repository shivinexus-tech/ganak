# Cursor — bug bash brief: Prashna screen

**Task ID:** `CURSOR-BUGBASH-PRASHNA` · **Owner-assigned 2026-07-22**
**Time:** 30 focused minutes minimum. **Target:** https://ganak.pages.dev/?screen=prashna
**Code:** `src/screens/PrashnaScreen.tsx` (read it, but test the live site)

---

## Your job is to break it, not to confirm it works

I wrote this code and I have already verified it — gates green, both languages,
parity EXACT. **That is exactly why my testing does not count as a bug bash.** I
tested that my changes did what I intended. You are here to find what I did not
think of.

If you finish and found nothing, the report must say **what you attacked**, or it is
not evidence. "Looks fine" is not a result.

---

## What changed recently (the new surface)

Four changes in the last day, all wording/layout, no engine change:

1. Lagna/Nakshatra/Sub-lord chips moved **inside** the "Full Prashna chart" collapse
2. House meanings became **question-specific** (`HOUSE_MEANING_BY_Q`) — e.g. the 6th
   house reads "service & employment" for a job question, "your side & victory over
   opponents" for a court case, but stays "obstacles, illness & debt" for health
3. Tier 1 rewritten into **plain language** (`buildPlain`, `HOUSE_PLAIN`) with no
   house numbers; the technical reasoning moved into the chart under "How this was
   judged"
4. A **planet gist** line was added (`PLANET_EFFECT`), and the timing line reworded

---

## High-value attack vectors

Ranked by where I think the bugs actually are.

### 1. High latitude — there is a fallback path here 🔴
The engine falls back from Placidus cusps to equal houses at extreme latitudes
(`result.chart.system`). Set the city in the **Daily** tab (Prashna shares that
place), then switch to Prashna and ask.
Try: **Reykjavik, Tromsø, Anchorage, Murmansk**, and something in the far south.
Does it compute? Does the explanatory line about house system change correctly? Does
anything go NaN, blank, or "undefined"?

### 2. All twelve question types 🔴
I only exercised career, marriage, travel, litigation and health. **Untested by
anyone: money, education, property, children, lost object, new venture, general.**
Each has its own favor/deny house lists, so each produces different sentences. Read
every one and ask whether a normal person would understand it.

### 3. Sentences that read as contradictions 🔴
This is the bug class the owner has caught twice, and I fixed two instances of it.
There are probably more. Watch for a **positive-sounding phrase in the "Working
against it" line**, or a negative-sounding one under "In your favour". Known and
still open: *"Working against it: fortune and support"*. Find the others.

### 4. The `· ` list join
`In your favour: A · B · C`. Check: one item, many items, and whether it wraps
sensibly at 320px and 375px. Items contain "and" internally, which is why the
separator is a middot — make sure it still reads clearly.

### 5. Rahu / Ketu as the deciding planet
The retrograde line deliberately excludes them. Keep asking until Rahu or Ketu is
the deciding influence and confirm no stray "is retrograde" line appears, and the
planet gist reads correctly.

### 6. Both languages, and switching mid-result
Toggle हिन्दी **after** a result is on screen. Everything should switch, including
the expanded chart. Check for English leaking into Hindi mode and vice versa.
Devanagari should render in Eczar, not a fallback font.

### 7. State and navigation
- Reload on `?screen=prashna&lang=hi` — does it come back correctly?
- Browser back button after expanding the chart
- Ask, expand chart, ask again — does the chart stay open with stale content?
- Rapid repeated taps on "Ask now"
- Switch to Daily and back — is the place still right?

### 8. Phone reality
375px and 320px. Long place names. Any horizontal overflow anywhere is a bug.

---

## What "found a bug" looks like

Record for each: what you did, what you expected, what happened, and a screenshot or
the exact text. Wording problems count — this screen's whole job is being understood.

## Report

Add a `CURSOR-BUGBASH-PRASHNA` row to `plans/task-log.md` with the time spent, the
vectors attacked, and every finding. Then tell the owner in plain language.

**Do not fix anything you find** unless it is trivial and you are certain — log it,
so the owner decides what blocks closure. If you do fix something, gates must pass
(`parse-check`, `prashna-parity` must stay **EXACT**, `prashna-calc` 24/24,
`muhurat-anchors`, `content-dates`, `npm run build`).

**Verify on port 5199** (`kundli-verify` in `.claude/launch.json`), not 5173 —
5173 has been serving another agent's stale worktree code.
