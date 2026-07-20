# Claude Code — next assignment (after Tasks 1–3)

**ID:** `CLAUDE-LAUNCH-PRIVACY`  
**Agent:** Claude Code  
**Status:** RESERVED  
**Owner assigned:** 2026-07-19 (after legal/server/places MERGED; shell free again)

You finished legal draft, server harden, and gazetteer. Thank you — especially the
three accuracy findings and the zone-bug catch. Next work closes the privacy gaps
you already diagnosed, now that Cursor no longer owns the shell.

---

## Goal

Make the Phase-1 web app’s privacy claims **true**, and verify the server smoke suite
you could not run in the sandbox.

## Exclusive files (only these)

| Path | What to do |
|---|---|
| `src/kundli-app.tsx` | Replace false footer with the bilingual true text from `plans/legal-privacy-terms-draft.md` §4.1. Remove the Google Fonts `@import`. |
| `public/fonts/` (new) **or** Vite-static equivalent | Self-host **Eczar** + **Spectral** (weights already used: Eczar 500/600/700, Spectral 300/400/600 + italic 400). Prefer woff2. |
| CSS/`@font-face` in shell (or a tiny `src/fonts.css` imported by shell) | Point at the local files. **No** `fonts.googleapis.com` / `fonts.gstatic.com` in production build. |
| `plans/legal-privacy-terms-draft.md` | Check off footer + fonts items; note self-host landed. |
| `plans/task-log.md` | Reserve → evidence → MERGED. |

**Stay off:** `MuhuratHub.tsx` (Cursor owns `CURSOR-MUHURAT-PERF`), Chart panels, content invention, lunar-month Hindi table (still needs a sourced table — separate chip later).

**Codex still owns** `P1-HIDE-DEPLOY` — do not fight over hosting config.

---

## Footer text (already drafted — use this)

**EN:** `ॐ · computed on your device · no account, no tracking · city search uses an online lookup`  
**HI:** `ॐ · गणना आपके डिवाइस पर · न खाता, न ट्रैकिंग · शहर खोज हेतु ऑनलाइन सेवा`

Follow the language toggle (`lang === "hi"`).

After fonts are self-hosted, if city search is the *only* remaining egress, you may
tighten the EN/HI line further (optional) — but do not claim “nothing is sent”
while open-meteo still runs.

---

## Fonts acceptance

1. Production build: `grep -ri 'fonts.googleapis\|fonts.gstatic' dist/` → **0 hits**.
2. Browser Network: first paint loads fonts from **same origin** (or `data:`), not Google.
3. Visual: Eczar headings + Spectral body still look correct in both languages.
4. Gates + `npm run build` green.

## Server smoke (must run — you flagged it UNRUN)

```bash
export PATH="/opt/homebrew/bin:$PATH"
cd server && npm run smoke
```

Paste the 14-check output into the task-log. If anything fails, fix in `server/**`
only (still exclusive to you for this task if needed — note in the log).

---

## Gates (after shell/font change)

```bash
export PATH="/opt/homebrew/bin:$PATH"
node validation/parse-check.js src/kundli-app.tsx
node validation/prashna-parity.js src/screens/PrashnaScreen.tsx
node validation/prashna-calc.js
node validation/muhurat-anchors.cjs
node validation/content-dates.cjs
npm run build
```

Browser smoke: Daily + Prashna, both languages, 0 console errors; Network tab shows
no Google Fonts.

Commit + push green slices. Check `git status` for a foreign staged index before
commit (INCIDENT-02 lesson).

## Done when

- [ ] Footer is bilingual and factually true
- [ ] Google Fonts gone from source + `dist/`
- [ ] `npm run smoke` run and pasted
- [ ] Legal draft checklist updated
- [ ] Task-log MERGED with evidence
