# Owner review — Kundli life interpretation (backlog #4)

**Status:** Code is merged on `main`. The Reading card and nav link stay **hidden** until every sign is marked `owner-verified` in `src/data/life-interpretation.ts`.

## What is waiting on you (not on agents)

1. **Read the copy** for all **12 rashis** × **4 areas** in **English and Hindi**:
   - Mind (Moon sign)
   - Relating (Moon sign)
   - Work (Moon sign)
   - Outward first impression (Lagna / ascendant sign)

   File: `src/data/life-interpretation.ts` → `SIGN_TRAITS` array (Mesha → Meena).

2. **Say yes or no** to each area:
   - Does it sound devotional and respectful, not fearful or deterministic?
   - Is the Hindi natural (not a clumsy translation)?
   - Would you show this to a curious family member without embarrassment?

3. **Optional edits:** Send plain-language corrections (which sign, which section, what to change). An agent will apply them and set `status: "owner-verified"` per sign you approve.

4. **After you approve all 12:** Agents run EN/HI phone/desktop smoke on Chart → cast a sample kundli → confirm the six-area card appears first and the **Reading** nav item unlocks.

## What is NOT waiting on you

- Engineering hookup (done).
- Copy/safety regression gate (done).
- Building the interpretation engine (done).

## Quick test path (after release)

1. Open **Jyotish / Kundli**.
2. Enter birth details → **Calculate**.
3. The **life reading card** should appear **above** the technical chart (only after all signs are owner-verified).
