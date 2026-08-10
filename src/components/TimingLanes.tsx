// Four timing systems on one shared time axis. This is the piece that stops Hora
// reading as a second Muhurat finder: instead of a rival answer, it is the one
// place hora, choghadiya and the forbidden belts are seen against each other,
// with the user's own favourable hours as a fourth lane when an ascendant is set.
//
// Layout note: the strip is horizontally scrollable, not percentage-compressed.
// Twelve hora buttons each need the shared 2.75rem (--control-height) touch
// floor; on a narrow phone that is wider than the viewport, so the track gets
// a fixed rem width and the wrapper scrolls, rather than shrinking targets
// below the floor to fit 100% of the container.
import React from "react";
import { HORA_COLOR, HORA_GLYPH, HORA_NAME } from "../engine/hora";
// CORRECTION: the brief named this import as coming from "../engine/panchang",
// but CHOG_NAME does not live there — panchang.ts only has the unexported
// CHOG_TYPES array (key/nat/lord, no display names). The bilingual {en, hi}
// names Choghadiya segments actually use across the app (see MuhuratHub.tsx)
// live in "../data/festival-meta".
import { CHOG_NAME } from "../data/festival-meta";
import { SectionHeader } from "./ui-primitives";
import type { Window, BlockerKey } from "../engine/hora-verdict";

type Lang = "en" | "hi";
type ChoghaNature = "good" | "neutral" | "bad";

export type TimingLanesHora = { ruler: string; start: number; end: number };
export type TimingLanesChogha = { key: string; nat: ChoghaNature | string; start: number; end: number };
export type TimingLanesBlocker = { key: BlockerKey; window: Window };

export type TimingLanesProps = {
  domain: Window; // rise->set or set->nextRise
  period: "day" | "night";
  horas: TimingLanesHora[];
  chogha: TimingLanesChogha[];
  blockers: TimingLanesBlocker[];
  abhijit: Window | null;
  personal: string[] | null; // planet names, or null/empty to hide lane 4
  nowMs: number | null;
  lang: Lang;
  onSelect: (win: Window) => void;
};

// Verified against src/styles/design-tokens.css: --font-label, --muted, --ink,
// --surface-sunken, --radius-sm, --radius-pill, --on-accent, --good,
// --good-surface, --bad, --bad-surface, --gold, --accent, --line-soft,
// --control-height, --space-1..4 all exist.
const LANE_H = "1.25rem"; // display-only lanes (choghadiya, blocked) — matches spec §5
const PERSONAL_H = "0.75rem"; // display-only personal lane — matches spec §5
// --control-height's base value, as a plain number for the track-width math below
// (the button itself uses var(--control-height) directly so it still grows with
// the comfort-density setting; this constant only sizes the scrollable track).
const SEG_MIN_REM = 2.75;

const BLOCKER_LABEL: Record<BlockerKey, { en: string; hi: string }> = {
  rahu: { en: "Rahu Kaal", hi: "राहु काल" },
  gulika: { en: "Gulika Kaal", hi: "गुलिक काल" },
  yama: { en: "Yamaganda", hi: "यमगण्ड" },
};

const NAT_TONE: Record<string, string> = {
  good: "var(--good)",
  bad: "var(--bad)",
};
const NAT_GLYPH: Record<string, string> = { good: "✓", bad: "⚠", neutral: "•" };
const NAT_LABEL: Record<string, { en: string; hi: string }> = {
  good: { en: "favourable", hi: "अनुकूल" },
  bad: { en: "avoid", hi: "टालें" },
  neutral: { en: "neutral", hi: "सामान्य" },
};

// M1: true only when `w` actually overlaps `domain`. Exported (not just an
// inline closure) so validation/hora-adjudication.cjs can run it against real
// computeTodayPanchang output across many days and cities and prove the belts
// and Abhijit never render outside the active domain — see that gate's
// "M1 real-panchang loop" for why this needs to be the SAME function the
// component uses, not a re-implementation that could silently drift from it.
export function windowOverlapsDomain(domain: Window, w: Window): boolean {
  return w.end > domain.start && w.start < domain.end;
}

export default function TimingLanes({
  domain, period, horas, chogha, blockers, abhijit, personal, nowMs, lang, onSelect,
}: TimingLanesProps) {
  const span = domain.end - domain.start;
  if (!(span > 0)) return null;

  const tr = (en: string, hi: string) => (lang === "hi" ? hi : en);

  // Fixed track width: wide enough that every hora segment (there are always
  // 12) clears the touch-target floor. chogha/blocked/personal share the same
  // width so all four lanes stay pixel-aligned on one axis.
  const trackRem = Math.max(20, (horas.length || 12) * SEG_MIN_REM);
  const pct = (ms: number) => Math.min(100, Math.max(0, ((ms - domain.start) / span) * 100));
  const leftRem = (ms: number) => (pct(ms) / 100) * trackRem;
  const widthRem = (w: Window, minRem = 0) => Math.max(minRem, leftRem(w.end) - leftRem(w.start));

  // M1: the belts (Rahu/Gulika/Yamaganda are day-only; Abhijit is a midday
  // window) do not necessarily fall inside the domain that is actually on
  // screen — the night dial shares this component with the day dial, and a
  // day-only window handed to the night render has no legitimate position on
  // that axis. `pct`/`leftRem` clamp to [0,100] and widthRem enforces a
  // minimum, so an out-of-domain window used to collapse to a forced-visible
  // sliver at left:0 instead of disappearing — a screen reader would announce
  // a block on time nothing forbids. The component owns its axis, so it must
  // refuse to place anything outside it rather than relying on callers to
  // pre-filter. (Hora, Choghadiya and the personal lane are bounded to
  // `domain` by construction upstream — dayHoras/nightHoras partition exactly
  // [domain.start, domain.end], choghaDay/choghaNight partition rise→set and
  // set→nextRise respectively, and the personal lane is a filter over
  // `horas` — so they need no such guard here.)
  const inDomain = (w: Window) => windowOverlapsDomain(domain, w);

  const laneRow = (label: string, height: string, children: React.ReactNode) => (
    <div style={{ marginBottom: "var(--space-2)" }}>
      <div
        style={{
          fontSize: "var(--font-label)",
          color: "var(--muted)",
          marginBottom: "var(--space-1)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          position: "relative",
          height,
          width: `${trackRem}rem`,
          borderRadius: "var(--radius-sm)",
          background: "var(--surface-sunken)",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );

  return (
    <div role="group" aria-label={tr("Timing systems for this period", "इस अवधि की समय प्रणालियाँ")}>
      <SectionHeader
        hi="समय प्रणालियाँ"
        en="Timing systems"
        lang={lang}
        density="compact"
      />

      <div style={{ overflowX: "auto" }}>
        <div style={{ position: "relative", width: `${trackRem}rem` }}>
          {/* Lane 1 · Hora — the only interactive lane, so each segment is a
              real button sized to the full 2.75rem touch floor, not just the
              1.25rem visual band the other lanes use. */}
          {laneRow(
            tr("Hora", "होरा"),
            "var(--control-height)",
            horas.map((h, i) => {
              const left = leftRem(h.start);
              const width = widthRem(h);
              const isNow = nowMs != null && nowMs >= h.start && nowMs < h.end;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelect({ start: h.start, end: h.end })}
                  aria-label={`${HORA_NAME[h.ruler]?.[lang] ?? h.ruler} ${tr("hora", "होरा")}`}
                  style={{
                    position: "absolute",
                    left: `${left}rem`,
                    width: `${width}rem`,
                    top: 0,
                    bottom: 0,
                    border: isNow ? "0.0625rem solid var(--accent)" : "none",
                    padding: 0,
                    cursor: "pointer",
                    background: HORA_COLOR[h.ruler],
                    opacity: 0.55,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span aria-hidden="true" style={{ fontSize: "var(--font-label)", color: "var(--on-accent)" }}>
                    {HORA_GLYPH[h.ruler]}
                  </span>
                </button>
              );
            }),
          )}

          {/* Lane 2 · Choghadiya — colour is never the only signal: each
              segment carries a glyph (✓/⚠/•) plus an accessible name built
              from CHOG_NAME and the nature label. */}
          {laneRow(
            tr("Choghadiya", "चौघड़िया"),
            LANE_H,
            chogha.map((c, i) => {
              const left = leftRem(c.start);
              const width = widthRem(c);
              const name = CHOG_NAME[c.key]?.[lang] ?? c.key;
              const natLabel = NAT_LABEL[c.nat]?.[lang] ?? c.nat;
              return (
                <div
                  key={i}
                  role="img"
                  aria-label={`${name} — ${natLabel}`}
                  title={`${name} — ${natLabel}`}
                  style={{
                    position: "absolute",
                    left: `${left}rem`,
                    width: `${width}rem`,
                    top: 0,
                    bottom: 0,
                    background: NAT_TONE[c.nat] || "var(--muted)",
                    opacity: 0.32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span aria-hidden="true" style={{ fontSize: "var(--font-micro)", color: "var(--ink)" }}>
                    {NAT_GLYPH[c.nat] || NAT_GLYPH.neutral}
                  </span>
                </div>
              );
            }),
          )}

          {/* Lane 3 · Blocked — Rahu/Gulika/Yamaganda use a diagonal hatch
              (pattern, not colour alone) plus the blocker's name as the
              accessible label; Abhijit is a gold notch with a star glyph and
              its own label, matching the accent glyph used by Badge. */}
          {laneRow(
            tr("Blocked", "बाधित"),
            LANE_H,
            <>
              {blockers.filter((b) => inDomain(b.window)).map((b, i) => {
                const left = leftRem(b.window.start);
                const width = widthRem(b.window, 0.0625);
                const name = BLOCKER_LABEL[b.key]?.[lang] ?? b.key;
                return (
                  <div
                    key={i}
                    role="img"
                    aria-label={`${tr("Blocked", "बाधित")}: ${name}`}
                    title={name}
                    style={{
                      position: "absolute",
                      left: `${left}rem`,
                      width: `${width}rem`,
                      top: 0,
                      bottom: 0,
                      background:
                        "repeating-linear-gradient(45deg, var(--bad) 0, var(--bad) 0.1875rem, transparent 0.1875rem, transparent 0.375rem)",
                    }}
                  />
                );
              })}
              {abhijit && inDomain(abhijit) && (
                <div
                  role="img"
                  aria-label={tr("Abhijit muhurta", "अभिजित मुहूर्त")}
                  title={tr("Abhijit muhurta", "अभिजित मुहूर्त")}
                  style={{
                    position: "absolute",
                    left: `${leftRem(abhijit.start)}rem`,
                    width: `${widthRem(abhijit, 0.125)}rem`,
                    top: 0,
                    bottom: 0,
                    background: "var(--gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span aria-hidden="true" style={{ fontSize: "var(--font-micro)", color: "var(--on-accent)" }}>
                    ★
                  </span>
                </div>
              )}
            </>,
          )}

          {/* Lane 4 · Yours — trikona-lord horas, shown only when the user has
              set an ascendant. Gold tint plus a star glyph and an accessible
              label naming the planet, so favour is never colour-only. */}
          {personal && personal.length > 0 &&
            laneRow(
              tr("Yours", "आपके"),
              PERSONAL_H,
              horas
                .filter((h) => personal.includes(h.ruler))
                .map((h, i) => (
                  <div
                    key={i}
                    role="img"
                    aria-label={`${HORA_NAME[h.ruler]?.[lang] ?? h.ruler} — ${tr("personally favourable", "व्यक्तिगत रूप से शुभ")}`}
                    title={HORA_NAME[h.ruler]?.[lang] ?? h.ruler}
                    style={{
                      position: "absolute",
                      left: `${leftRem(h.start)}rem`,
                      width: `${widthRem(h)}rem`,
                      top: 0,
                      bottom: 0,
                      background: "var(--gold)",
                      opacity: 0.5,
                    }}
                  />
                )),
            )}

          {nowMs != null && nowMs >= domain.start && nowMs <= domain.end && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: `${leftRem(nowMs)}rem`,
                top: 0,
                bottom: 0,
                width: "0.125rem",
                background: "var(--accent)",
              }}
            />
          )}
        </div>
      </div>

      <div style={{ fontSize: "var(--font-label)", color: "var(--muted)", marginTop: "var(--space-1)" }}>
        {period === "day" ? tr("Sunrise to sunset", "सूर्योदय से सूर्यास्त") : tr("Sunset to sunrise", "सूर्यास्त से सूर्योदय")}
      </div>
    </div>
  );
}
