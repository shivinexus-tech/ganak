# Verification brief — Ganak register row 62 (SEO Phase 0, Stage A)

**Give this whole file to the verifier.** It is written to stand alone: no prior
conversation, no repo access, and no knowledge of Ganak is required.

**Site:** https://ganakapp.com
**Claim to test:** every public page now serves its own title, description and canonical
URL in the raw HTML, and the site publishes a real `sitemap.xml` and `robots.txt`.
**Time needed:** about 15 minutes.

---

## Who should run this

Either a person or an AI agent can run the checks. **Only a person can close the row.**

Ganak's rule is that no work counts as finished until a human has looked at the live site,
because the agent that built something is the worst judge of whether it works. If an AI runs
this, its result is a **pre-check** — useful, but it does not move row 62 past 70%.

If you are an AI agent running this: report findings only. Do not edit the repository, do
not fix anything you find, and do not mark the row complete.

---

## Background — what changed and why

Ganak is a single-page app. Until 9 August 2026, **all 198 of its public pages served
byte-identical HTML**: the same `<title>`, and — the real damage — the same line saying

```html
<link rel="canonical" href="https://ganakapp.com/" />
```

A canonical tag tells a search engine "this is my real address." Every festival page,
every calculator, was telling Google *"my real address is the homepage."* The correct
per-page values were only written in later by JavaScript, which social-media scrapers
never run and search crawlers only sometimes get to.

The fix generates one real HTML file per page at build time, each carrying its own head.
Nothing about the visible design or behaviour should have changed. **A change in how the
site looks or behaves is a bug, not a success.**

---

## Check 1 — robots.txt is a real file

Open <https://ganakapp.com/robots.txt>

- **PASS:** plain text beginning `User-agent: *`, and containing a line
  `Sitemap: https://ganakapp.com/sitemap.xml`
- **FAIL:** the Ganak website appears, or you see HTML starting with `<!doctype html>`

> Why this specific failure matters: the old behaviour returned the *homepage* here with a
> "200 OK" success code, not an error. Nothing looked broken. Do not accept "the page
> loaded" as a pass — check that the content is genuinely text, not the site.

## Check 2 — sitemap.xml is a real sitemap

Open <https://ganakapp.com/sitemap.xml>

- **PASS:** XML. Either a formatted list of links or raw text starting with `<?xml`.
- Count the entries — browser find (Ctrl-F / Cmd-F) for `<loc>` or use View Source.
  **Expect 198.**
- **FAIL:** the Ganak website appears instead.

Record the number you actually count, even if it is not 198.

## Check 3 — pages carry their own titles *without JavaScript*

This is the core of the fix, and it must be checked in **View Source**, not the normal page.
View Source shows what a crawler receives. The normal view shows what JavaScript produced —
which was always correct and is not what was broken.

- **Chrome / Edge / Firefox:** `Ctrl+U` (Windows) or `Cmd+Option+U` (Mac)
- **Safari:** enable Develop menu first, then `Cmd+Option+U`
- **Phone:** prefix the address with `view-source:`

For **each** of these three pages, open View Source and find the `<title>` and
`<link rel="canonical">` lines:

| Page | Expected `<title>` | Expected canonical |
|---|---|---|
| ganakapp.com/festival/diwali | `Diwali — Date, Timing and Worship Guide \| Ganak` | `https://ganakapp.com/festival/diwali` |
| ganakapp.com/calculator/rashi | `Moon sign (Rashi) \| Ganak` | `https://ganakapp.com/calculator/rashi` |
| ganakapp.com/muhurat/medical | `Medical Muhurat Safety Guidance \| Ganak` | `https://ganakapp.com/muhurat/medical` |

- **PASS:** all three differ from each other, and each canonical matches the address bar.
- **FAIL — the important one:** any canonical reads `https://ganakapp.com/` (bare homepage)
  while you are on a deeper page. That is the original bug still present.
- **FAIL:** all three pages show the same title.

## Check 4 — old festival links still work

Open <https://ganakapp.com/festival/nrisimha-jayanti>

- **PASS:** the address bar changes to `.../festival/narasimha-jayanti` and a normal
  festival page loads. (Ten festivals had two spellings; they now redirect to one.)
- **FAIL:** an error, a blank page, or the address does not change.

## Check 5 — nothing visibly broke

Visit each and confirm it looks and behaves normally:

1. <https://ganakapp.com> — homepage
2. <https://ganakapp.com/festival/diwali>
3. <https://ganakapp.com/calculators>
4. <https://ganakapp.com/calculator/rashi>

For each: does the page render fully? Is the layout intact? Does switching to Hindi still
work? On a phone, is there any sideways scrolling?

**Please check at least one page on an actual phone.** Most Ganak visitors are on phones,
and this has not been verified on real hardware.

---

## What to report back

Copy this and fill it in:

```
VERIFIED BY:            (name — or state "AI agent, pre-check only")
DATE / TIME:
BROWSER + DEVICE:       (e.g. Chrome on Windows; Safari on iPhone 13)

Check 1  robots.txt          PASS / FAIL   notes:
Check 2  sitemap.xml         PASS / FAIL   entries counted: ___
Check 3  per-page titles     PASS / FAIL   notes:
         - /festival/diwali      title correct? Y/N   canonical correct? Y/N
         - /calculator/rashi     title correct? Y/N   canonical correct? Y/N
         - /muhurat/medical      title correct? Y/N   canonical correct? Y/N
Check 4  old festival link    PASS / FAIL   notes:
Check 5  nothing broke        PASS / FAIL   notes:
         phone tested?        Y/N   which device:

ANYTHING ELSE THAT LOOKED WRONG:
```

**Report what you actually saw, including partial or confusing results.** A half-working
result is far more useful than a tidy "looks fine" — and if something fails, that is a
successful verification, not a failed one. Finding a problem now is the entire point.

---

## Notes for the verifier

- **This does not test whether Ganak appears in Google.** That needs Google Search Console
  (a separate task) and, per Google's own guidance, at least a week after submission. If you
  search Google and find nothing, that is expected right now and is not a failure of these
  checks.
- **If a page seems cached or stale**, force-reload: `Ctrl+Shift+R` / `Cmd+Shift+R`.
- **Do not fix anything.** Report only.
