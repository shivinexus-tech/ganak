# Ganak — Living Backlog

Working priority order (supersedes kundli-feature-roadmap.docx ordering where they differ).
Updated: 2026-07-16 with owner's review.

| # | Item | Status / Notes |
|---|------|----------------|
| 0 | **Backend proxy** (API-key holder for AI calls) | **HIGHEST PRIORITY — added 2026-07-16 per owner.** Unblocks: AI free-text muhurat parse (any language), AI chart explanation, and later push-notification features. Decide hosting + scope before build. |
| 0.5 | ~~Messaging & guidance audit — all four screens~~ | ✅ Shipped 2026-07-18. All 19 items across 3 tiers (report: plans/messaging-audit.md, sign-off copy: plans/messaging-copy-signoff.md). Verified in hi+en, all gates green. Follow-ups spun out to items 0.6 and 0.7 below. |
| 0.6 | **Chart screen — deep specialist gloss translation** | Follow-up from 0.5 (added 2026-07-18 per owner). The Chart screen's full interactive path (form, errors, empty states, buttons, ChartVault, Shadbala verdict) is now bilingual, but the detailed explanatory gloss paragraphs in the advanced sub-sections (KP sub-lords/significators, Ashtakavarga, BNN, Bhrigu, Special Lagnas, Dasha level names) remain English-only. Needs a careful specialist-Hindi pass — accurate jyotish terminology, not machine translation. Lower traffic than the core path. Priority: after backend proxy + its dependent AI features, or sooner if a Hindi-first launch is prioritized. |
| 0.7 | **Muhurat time-window labels — bilingual** | Follow-up from 0.5 (added 2026-07-18). "Rahu Kalam" and "Abhijit Muhurat" labels inside the Muhurat finder's Panchaka-window results (`tr(lang,"rahuL")` / `"abhijitL")` still render English in Hindi mode. Small, self-contained fix. |
| 1 | ~~Prashna Chart~~ | ✅ Shipped 2026-07-16 |
| 2 | ~~Muhurat date-range finder (v1, fully offline)~~ | ✅ Shipped 2026-07-17. Chips (7 activities) + From/To calendar + presets (90 days / this year, per owner: no 60-day). Rules validated vs Drik 2026 Delhi anchors (validation/muhurat-anchors.cjs): recall 100% all categories, property precision 100%. Wedding blocks Kharmas/Devshayana/Shukra-Guru asta. Known-remaining: dayScore factor strings ("why this day") are English-only even in Hindi mode — pre-existing engine text, small follow-up. |
| 3 | AI conversational chart explanation | After backend proxy |
| 4 | Muhurat typing box (free-text search) returns as AI-powered v2 — any language, relative dates ("अगली दिवाली से पहले") | After backend proxy. Removed from v1 on 2026-07-16 (owner decision: chips-only; regex fallback misleads Hindi users). Dead AI-parse code path to be routed via proxy. |
| 5 | Sade Sati tracker + Gochar alerts | After backend + push infra |
| 6 | Prashnavali (Rama Shalaka etc.) | Cheap filler between larger builds |
| 7 | Guna Milan / Manglik checker | Table stakes, per roadmap |
| — | Rest | As per kundli-feature-roadmap.docx §1 |

Known repo debt (not features):
- `window.storage` (tradition preference) is a Claude-sandbox API — silently non-persistent on web. Needs a decision (respect no-browser-storage rule? backend account? leave session-only).
- `parseMuhuratQuery` AI path = dead fetch to api.anthropic.com without key; hide or route via proxy when it exists.
