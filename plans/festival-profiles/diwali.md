# Diwali (Lakshmi Puja night) — content profile

**Key:** `diwali` · **Route:** `/festival/diwali` · **Status:** P0 — muhurat UI **missing** (2026-07-24 owner review)

## One-line purpose

Tell the user **when** to perform Lakshmi-Ganesha puja at their city tonight, then how to do a simple household puja.

## Must-show on page (UI contract)

- [x] Local civil date (Amavasya during Pradosh)
- [ ] **Pradosh Kaal** — start/end clock for selected city
- [ ] **Lakshmi Puja muhurat** — primary window (Drik: sthir Vrishabha lagna ∩ Pradosh on Amavasya)
- [ ] Optional secondary: Vrishabha Kaal span, Mahanishita (label as optional / lineage-specific)
- [ ] Amavasya tithi begin/end (collapsed detail — expander OK)
- [x] Full household vidhi (VratVidhiCard)

**Current bug:** `FEST_META.diwali.timing` is `null`. Dhanteras uses `timing: "sunset"` and shows “संध्या पूजा सूर्यास्त से”. Diwali shows only date + deciding-kala footnote.

**Engine target:** new timing kind `lakshmi-puja` (or reuse computed windows from Drik anchors in `validation/muhurat-anchors.cjs`).

## Timing kind

`lakshmi-puja`

Display labels (bilingual):

- EN: “Lakshmi Puja muhurat” / HI: “लक्ष्मी पूजा का शुभ मुहूर्त”
- EN: “Pradosh Kaal” / HI: “प्रदोष काल”

## Ritual essentials (from sources — not user-facing paste)

1. Clean home; light diyas safely.
2. Puja in **Pradosh** on **Kartik Amavasya**; best window = **sthir lagna** (commonly Vrishabha) within Pradosh.
3. Ganesha first (common North), then Lakshmi; naivedya, aarti, prasad.
4. Optional: Kubera, account book, new murti — household-specific, not required for simple path.
5. Paran only if household fasted — after evening puja.
6. Bengal: same night may be **Kali Puja** — separate guide (`kaliPuja` route).
7. Maharashtra: full sequence is multi-day (Vasu Baras → Bhai Dooj) — link cluster days, don’t merge into one ritual.

## Regional forks

| Route | Deity / rite |
|-------|----------------|
| `/festival/diwali` | Lakshmi-Ganesha household (North default) |
| `/festival/kali-puja` | Shakta Nishita puja (Bengal) |
| `/festival/narak-chaturdashi` | Morning abhyanga (Chhoti Diwali) |

## Copy voice

- Lead: when + what (muhurat), not essay on “honest prosperity”.
- No “Ganak labels…” in user text.
- See `plans/festival-vrat-voice-research.md`.

## Sources

- Drik Lakshmi Puja timings: https://www.drikpanchang.com/festivals/lakshmipuja/festivals-lakshmipuja-timings.html
- Drik Diwali puja vidhi: https://www.drikpanchang.com/diwali/info/diwali-puja-vidhi.html
- Dainik Bhaskar / Hindustan / ABP — city muhurat articles (2025–2026) for **what readers expect on page**
- Internal: `plans/diwali-guide-research.md`, `validation/muhurat-anchors.cjs`

## Owner sign-off

- [ ] Muhurat matches Drik for Delhi + one other city
- [ ] Hindi copy sense-check
