# Handover — Festival hero images

**Task:** Replace the (deleted) crude SVG festival banners with real, high-quality
images — one per festival — using a consistent devotional house style.
**Status:** Pipeline built and live; 3 of 58 done. Repeat for the rest.
**Last updated:** 2026-07-25. Live at https://ganak.pages.dev (auto-deploys from `main`).

---

## 1. What's already done (committed to `main`)

- **Crude SVG hero system deleted** (commit `082f414`) — the old `FestivalHeroImage`
  component, all 58 placeholder SVGs in `public/festival-images/`, and the 3 SVG
  generator scripts. **Do not reintroduce these.** They looked like children's
  clip-art and were removed on purpose.
- **New display component** `src/components/FestivalRasterHero.tsx` — shows
  `public/festival-images/raster/<key>.webp` if it exists, and renders **nothing**
  if it doesn't (no placeholder, no SVG fallback).
- **Wiring** in `src/screens/FestivalGuideScreen.tsx`: Navadurga day pages use their
  own dedicated art; every other festival uses `FestivalRasterHero` keyed on
  `guide.vidhiKey`.
- **Real images live** (commit `d6526e1`):
  - `diwali.webp` (Lakshmi)
  - `ganeshChaturthi.webp` and `sankashti.webp` (same Ganesha image, one per key)
- **Navadurga 9-form art** in `public/navadurga/*.webp` already existed and is
  untouched — that's the good, hand-provided art on the sharad/chaitra day pages.

**Remaining: 55 festivals** still show no banner until an image is added. Full key
list + intended subject + bilingual alt text: `src/data/festival-hero-art.ts`
(58 keys — the source of truth). Ready-to-use prompts for every key:
`plans/festival-image-prompts.md` and `plans/Ganak-Festival-Image-Brief.docx`.

---

## 2. How to add an image for a festival (the repeatable loop)

1. Get a source image (any size, landscape). Naming = the **exact festival key**
   from `festival-hero-art.ts`, case-sensitive. Example: `mahaShivaratri.png`.
2. Put it in `festival-images-src/` (gitignored working folder), e.g.
   `festival-images-src/mahaShivaratri.png`. Accepted: png/jpg/jpeg/webp.
   One image can serve several keys — just copy it under each key's filename
   (that's how `ganeshChaturthi` + `sankashti` share one Ganesha).
3. Run the normalizer:
   ```bash
   npm run festival-images
   ```
   It cover-crops to **1280×480** and writes optimized WebP to
   `public/festival-images/raster/<key>.webp`. (Node/npm live at
   `/opt/homebrew/bin` on this machine.)
4. Verify locally (dev server launch config `kundli-dev`): open
   `/festival/<route>` and confirm the hero renders with no console errors.
5. Commit **only the raster file(s)** you added (see git rules below), then push.
   Cloudflare deploys within ~1–2 min.

Script: `scripts/process-festival-images.mjs` (imports `festival-hero-art.ts` to
reject filenames that aren't real keys). Rasterizer = `sharp` (devDependency).

---

## 3. Image spec / house style (keep the set consistent)

- **Aspect / size:** 8:3, delivered as 1280×480 WebP (the script handles cropping).
- **No text baked into the image** — the festival name is already an `<h2>` above
  the banner. No lettering, logos, or watermarks.
- **Style:** rich, reverent, painterly semi-realistic Indian devotional art; deep
  jewel tones (maroon/indigo/saffron/gold), warm oil-lamp light, glowing halo,
  subject centered or left with clear margin. Full prompt text is in
  `plans/festival-image-prompts.md`.
- **Tone:** these are revered deities — dignified temple-calendar quality, never
  caricature.

---

## 4. Open decision: where images come from

Not yet settled. Options discussed with the owner:
- **Manual (current):** owner supplies images (they provided the Ganesha one). This
  is what's working now — owner drops a file, agent runs the pipeline.
- **Cloudflare Workers AI (free):** owner already has a Cloudflare account; Flux is
  available. Needs an API token (owner sets `CLOUDFLARE_API_TOKEN` as an env var —
  **never commit a token; never paste it in chat**) and the API host added to the
  Bash sandbox allowlist. Pollinations was explicitly **rejected**.
- **OpenAI / Replicate / Google:** paid, ~$2–7 for all 58.

If automating: write a generator that reads the prompts in
`plans/festival-image-prompts.md`, saves outputs into `festival-images-src/<key>.png`,
then reuse the pipeline in §2. Reads the key from `process.env`, never from a file.

---

## 5. Multi-agent git rules (IMPORTANT — this bit us this session)

Several agents commit **directly to `main` in this same working copy**, and `main`
auto-deploys to production. So:

- **`git fetch` before trusting anything.** `main` moves under you.
- **Never `git add -A` / `git add .`.** The working tree contains other agents'
  uncommitted work. Stage only your specific files by path
  (use `git add -u <path>` to stage tracked deletions without grabbing untracked
  files like `public/festival-images/raster/README.md`).
- Rebasing can conflict on shared files (e.g. `plans/task-log.md`); resolve by
  **union**, preserving every agent's rows.
- Push is a fast-forward; if rejected, `git fetch` + `git rebase --autostash origin/main`.

---

## 6. Quick reference

| Thing | Path |
|---|---|
| Key registry (58) + alt text | `src/data/festival-hero-art.ts` |
| Prompts (all 58) | `plans/festival-image-prompts.md` · `plans/Ganak-Festival-Image-Brief.docx` |
| Normalizer script | `scripts/process-festival-images.mjs` (`npm run festival-images`) |
| Source drop folder | `festival-images-src/<key>.png` |
| Output (shipped) | `public/festival-images/raster/<key>.webp` |
| Display component | `src/components/FestivalRasterHero.tsx` |
| Page wiring | `src/screens/FestivalGuideScreen.tsx` |
| Done so far | `diwali`, `ganeshChaturthi`, `sankashti` |
| Relevant commits | `082f414` (removal), `d6526e1` (first real images) |
