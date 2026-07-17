# Janma Kundli — Living Backlog

Working priority order (supersedes kundli-feature-roadmap.docx ordering where they differ).
Updated: 2026-07-16 with owner's review.

| # | Item | Status / Notes |
|---|------|----------------|
| 0 | **Backend proxy** (API-key holder for AI calls) | **HIGHEST PRIORITY — added 2026-07-16 per owner.** Unblocks: AI free-text muhurat parse (any language), AI chart explanation, and later push-notification features. Decide hosting + scope before build. |
| 0.5 | **Messaging & guidance audit** — all four screens | **Added 2026-07-17 per owner; priority immediately after backend proxy.** Screen-by-screen audit of every empty state, error, loading state, first-visit hint, and jargon gloss, in both languages, against answer-before-data. Deliverable: copy list for owner sign-off BEFORE any code changes. Owner's standing principles: plain-language messages that help navigation; no state resets without user action; user always knows what the app is doing. Includes the Hindi-mode "why this day" factor strings noted under item 2. |
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
