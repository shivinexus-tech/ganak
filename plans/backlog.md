# Ganak — Product Backlog

Rebuilt 2026-07-18 from a stale feature-list into a full product backlog.
Organized as: **Done · Features · Infrastructure & Launch · Decisions · Debt**.

Status of each item was verified against `src/kundli-app.tsx`, not assumed.
Priority numbers exist only where the owner has actually ranked something;
newly-surfaced items are marked **[unranked]** pending the owner's reprioritization.

Supersedes `kundli-feature-roadmap.docx` (that doc was competitor research, not a
plan, and predates most of the app being built).

---

## A. Done — already in the app (verified in code)

Not claiming these are polished or validated to Drik parity — only that the
feature exists and renders. Listed so they stop showing up as "to build."

- **Daily / Panchang** — tithi, nakshatra, yoga, karana, sunrise/set, moonrise/set,
  Rahu/Gulika/Yama kalam, Abhijit, choghadiya, full panchang table, samvats.
- **Fasts & festivals** — Smarta + ISKCON/Vaishnava traditions, 400-day scan.
- **Muhurat date-range finder** — 7 activities, Drik-validated rules. ✅ 2026-07-17.
- **Prashna (horary) chart** — verdict-first, birth-data-free. ✅ 2026-07-16.
- **Hora / planetary hours** — with an advice input.
- **Gochar / transit display** — "upcoming planetary events" (sign changes, retro/direct).
  NOTE: this is *display only*; proactive/push alerts are still a feature (see B).
- **Full birth chart (17 sub-sections)** — Kundli, Yogas, Grahas, KP sub-lords,
  KP significators, **Kundali Matching / Guna Milan**, Karakas, Shadbala, Special
  lagnas, Bhava Chalit, Ashtakavarga, Arudha, Birth-time Rectification, BNN,
  Bhrigu, Vimshottari Dasha (with sub-periods), plain-language Reading.
- **Divisional charts** D1–D60 (Shodashvarga).
- **Dosha logic** present (Manglik/dosha references throughout matching).
- **Bilingual Hindi/English** across Daily, Prashna, Muhurat + core Chart path.
  ✅ Messaging audit (all 3 tiers) 2026-07-18.

*Implication: items the old backlog listed as TODO — Guna Milan, Manglik, Dasha
sub-periods, Divisional charts, Shadbala, Ashtakavarga — are already built.*

---

## B. Features — not yet built

None of these exist in code (verified: 0 references each). All are net-new.

| Item | Notes | Depends on | Ranked? |
|---|---|---|---|
| Gochar / Transit **alerts** (proactive) | Transit *display* exists; push alerts don't | Backend + push infra | prev. #5 |
| Sade Sati tracker | Push-notification alert, not static report | Backend + push infra | prev. #5 |
| Gemstone / Remedy suggestions | Low build cost, high perceived value; advisory tone | — | [unranked] |
| Prashnavali (Rama Shalaka etc.) | Number-pick → verse; very cheap | — | prev. #6 |
| Vastu Compass | Tactile/visual feature; Drik-exclusive | — | [unranked] |
| Custom Tithi + Reminders | Personal alerts | Backend + push infra | [unranked] |
| Numerology | Out of scope for core personas per research doc | — | [unranked, low] |
| Muhurat free-text search (AI) | Typing box returns, any language | Backend proxy | prev. #4 |
| AI conversational chart explanation | AskSoma's differentiator | Backend proxy | prev. #3 |

---

## C. Infrastructure & Launch — the epics no launch can skip

**None of this is tracked anywhere yet. This is the real gap.** The app has
never left localhost.

| Epic | Why unavoidable | Ranked? |
|---|---|---|
| **Backend proxy** (holds API key for AI calls) | Unblocks all AI features (B) | prev. #0 (highest) |
| **Web hosting / deployment** | "Web launch" IS this. App only runs on dev server today. | [unranked — likely #1] |
| **Real data persistence** | Saved charts don't persist on real web (`window.storage` is a sandbox API). Needed before accounts/cloud sync. | [unranked] |
| **Accounts / auth** | Gates cloud sync, cross-device saved charts | [unranked] |
| **Android packaging** | Owner's stated goal. Route decision needed: PWA vs Capacitor vs wrapper. Play Store account, signing, listing. | [unranked] |
| **Cloud Sync** | Depends on accounts + persistence | prev. #13 (low) |
| **Legal — privacy policy + terms** | *Required* before Play Store will list | [unranked] |
| **Error monitoring** | Phone-only, no console — prod crashes are currently invisible | [unranked] |
| **Analytics** | To know what users actually do | [unranked] |
| **Onboarding / first-run** | First-time orientation | [unranked] |
| **SEO / discoverability** | Web reach | [unranked] |
| **Performance** | ~1.8s startup calendar scan still the largest cost | [unranked] |

---

## D. Open decisions (gate other work — owner's call)

- **Umbrella branding** — Ganak Panchang vs Ganak Jyotish vs one toggled app.
  Recommendation on record: one app, section-labeled, don't fork. Unresolved.
- **Monetization model** — free / ads / paid tiers. Research doc floated
  free-panchang + paid-jyotish. Affects accounts, hosting cost, Android listing.
- **Android route** — PWA (cheapest, installable web) vs Capacitor (native shell)
  vs React Native rewrite (most work). Affects the whole Android epic's size.
- **Storage philosophy** — the no-browser-storage rule vs users wanting saved
  charts to persist. Resolving this unblocks persistence + accounts.

---

## E. Repo debt & small follow-ups

- **Chart deep-gloss Hindi translation** (0.6) — advanced sub-section explanation
  paragraphs (KP, Ashtakavarga, BNN, Bhrigu, Special Lagnas, Dasha levels) still
  English-only. Needs specialist-Hindi pass.
- **Muhurat window labels** (0.7) — "Rahu Kalam"/"Abhijit Muhurat" inside finder
  results still English in Hindi mode. Tiny fix.
- `parseMuhuratQuery` dead AI path — fetch to api.anthropic.com with no key;
  route via proxy or remove.
- Startup performance — `scanPanchangCalendar` 400-day scan ~1.8s.

---

## Next step

Everything in B, C, and E is **unranked** — that's for you to order. The only
items with a real priority today are the ones you set earlier (backend proxy
was your "highest"; messaging audit is done). Tell me the ranking — or the
principle to rank by (fastest-to-launch, cheapest-wins, Hindi-first, revenue-first)
— and I'll assign the numbers and reorder.
