# F8 fix — the ayanamsa leak (a chart choice changing someone else's calendar)

**Lane:** `claude/fix-ayanamsa-leak` · worktree `.scratch/worktrees/fix-ayanamsa` · base `origin/main` `cc3113d`
**Fixes:** F8 (P1) in `plans/audits/2026-08-18-bugbash-matching-dosha.md`

## In plain words

Ganak offers astrologers a choice of *ayanamsa* — the small correction that decides
where the zodiac starts. Lahiri is the house default; Raman sits about 1.5 degrees
away from it. That choice was supposed to apply to the astrologer's own chart.

It did not stay there. The calculation engine kept a single sticky note saying
"the current ayanamsa", and casting a chart overwrote it for the whole session
without ever putting it back. So the moment one reader cast a chart on Raman,
**everything else in the app — including the free daily Panchang, which never
offered that choice at all — quietly started answering on Raman too**, until some
other screen happened to overwrite the note again. A degree and a half is enough
to move a tithi, a nakshatra or a muhurat window across a boundary. Two readers in
the same session could see two different calendars for the same day, and neither
would be told anything had changed.

## Reproduced first (before any change)

One shared module graph, exactly as the real Vite bundle loads it:

```
baseline (Lahiri)                          Moon sidereal now = 190.3297
after casting a chart on RAMAN             Moon sidereal now = 191.8087
after opening the Mangal-Dosha calculator  Moon sidereal now = 190.3297
```

(1.479° of drift, then silently forced back by an unrelated calculator. The instant
is pinned to 2026-08-18 06:30 UTC so the numbers are reproducible; the bug-bash run
used `Date.now()`, hence its slightly different figures for the same 1.479° shift.)

**Why the existing gate never saw it:** `validation/_load-app.cjs` bundles each
entry point separately, so `loadApp('src/engine/panchang.ts')` and
`loadApp('src/engine/kundli.ts')` each got their *own private copy* of the global.
The gate could not observe the leak even in principle. The new assertions bundle
one shared graph.

## Status

- [x] Reproduced
- [ ] Fixed
- [ ] Default proven byte-identical
- [ ] Gated
