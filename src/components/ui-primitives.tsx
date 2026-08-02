/*
 * Ganak universal UI primitives.
 *
 * Four shared building blocks — Card, SectionHeader, DataRow, Badge — so screens stop
 * re-inventing the same panel, header, label/value row and status pill. Every value here
 * resolves to a semantic custom property from the single token file
 * (src/styles/design-tokens.css); this file defines no colour, type or spacing values of
 * its own, and it must never become a second token source.
 *
 * Contract:
 *  - `density="comfortable" | "compact"` on every primitive; comfortable is the default and
 *    both ride the root --density offset, so the comfort presets keep working.
 *  - Semantic tones only (default/raised/sunken/accent/good/bad/warn).
 *  - Auspicious/avoid is NEVER colour-only: Badge always renders a glyph plus its text.
 *  - Bilingual-safe: nothing is width-clamped, labels wrap, values stay on their own line
 *    when Devanagari runs long.
 *  - Interactive variants meet the 42px (--control-height) touch target and show the shared
 *    token focus ring via .comfort-focus.
 */
import React from "react";

export type Density = "comfortable" | "compact";
export type Tone = "default" | "raised" | "sunken" | "accent" | "good" | "bad" | "warn";

const PAD: Record<Density, { block: string; inline: string; gap: string }> = {
  comfortable: { block: "var(--space-4)", inline: "var(--space-4)", gap: "var(--space-3)" },
  compact: { block: "var(--space-2)", inline: "var(--space-3)", gap: "var(--space-2)" },
};

const ROW_PAD: Record<Density, string> = {
  comfortable: "var(--space-3) var(--space-1)",
  compact: "var(--space-2) var(--space-1)",
};

function toneSurface(tone: Tone): React.CSSProperties {
  switch (tone) {
    case "raised": return { background: "var(--surface-raised)", borderColor: "var(--line)" };
    case "sunken": return { background: "var(--surface-sunken)", borderColor: "var(--line)" };
    case "accent": return { background: "var(--accent-soft)", borderColor: "var(--accent-line)" };
    case "good": return { background: "var(--good-surface)", borderColor: "var(--good-line)" };
    case "bad": return { background: "var(--bad-surface)", borderColor: "var(--bad-line)" };
    case "warn": return { background: "var(--accent-soft)", borderColor: "var(--accent-line)" };
    default: return { background: "var(--surface-active)", borderColor: "var(--line)" };
  }
}

export function toneInk(tone: Tone) {
  if (tone === "good") return "var(--good)";
  if (tone === "bad") return "var(--bad)";
  if (tone === "accent" || tone === "warn") return "var(--accent)";
  return "var(--ink)";
}

/* ------------------------------------------------------------------ Card */

export function Card({
  children, density = "comfortable", tone = "default", elevated = true,
  as: Tag = "section", style, className, ...rest
}: {
  children: React.ReactNode;
  density?: Density;
  tone?: Tone;
  elevated?: boolean;
  as?: any;
  style?: React.CSSProperties;
  className?: string;
} & Record<string, any>) {
  const pad = PAD[density];
  return (
    <Tag
      className={className}
      style={{
        display: "block",
        border: "0.0625rem solid",
        borderRadius: "var(--radius-lg)",
        boxShadow: elevated ? "var(--elevation-2)" : "none",
        padding: `${pad.block} ${pad.inline}`,
        color: "var(--ink)",
        ...toneSurface(tone),
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* --------------------------------------------------------- SectionHeader */

/**
 * The house bilingual header: Devanagari sits beside a spaced uppercase English label, and
 * the pair always renders together so neither language is a second-class citizen.
 */
export function SectionHeader({
  hi, en, lang, icon, actions, density = "comfortable", id,
}: {
  hi: string;
  en: string;
  lang: "hi" | "en";
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  density?: Density;
  id?: string;
}) {
  return (
    <div
      style={{
        display: "flex", alignItems: "baseline", justifyContent: "space-between",
        flexWrap: "wrap", gap: PAD[density].gap,
        marginBottom: density === "compact" ? "var(--space-2)" : "var(--space-3)",
      }}
    >
      <h3
        id={id}
        style={{
          margin: 0, display: "flex", alignItems: "baseline", flexWrap: "wrap",
          gap: "var(--space-2)", minWidth: 0,
          fontFamily: "var(--font-display-family)",
          fontSize: density === "compact" ? "var(--font-title)" : "var(--font-heading)",
          fontWeight: 700, color: "var(--ink)", lineHeight: 1.25,
        }}
      >
        {icon && <span aria-hidden="true" style={{ color: "var(--accent)" }}>{icon}</span>}
        <span>{lang === "hi" ? hi : en}</span>
        <span
          style={{
            fontFamily: "var(--font-body-family)", fontSize: "var(--font-label)",
            letterSpacing: "var(--label-letter-spacing)", textTransform: "var(--label-transform)" as any,
            color: "var(--muted)", fontWeight: 400,
          }}
        >
          {lang === "hi" ? en : hi}
        </span>
      </h3>
      {actions && <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------- Badge */

const BADGE_GLYPH: Record<Tone, string> = {
  good: "✓", bad: "⚠", warn: "!", accent: "★", raised: "•", sunken: "•", default: "•",
};

/**
 * Status pill. The glyph is not decoration — it is how the meaning survives for the ~8% of
 * men with red-green colour blindness, so it is rendered unconditionally and is part of the
 * accessible name (never aria-hidden).
 */
export function Badge({
  tone = "default", children, glyph, density = "comfortable", title,
}: {
  tone?: Tone;
  children: React.ReactNode;
  glyph?: string;
  density?: Density;
  title?: string;
}) {
  const mark = glyph ?? BADGE_GLYPH[tone];
  return (
    <span
      title={title}
      style={{
        display: "inline-flex", alignItems: "center", gap: "var(--space-1)",
        padding: density === "compact" ? "0.125rem var(--space-2)" : "var(--space-1) var(--space-2)",
        borderRadius: "var(--radius-pill)",
        border: "0.0625rem solid",
        fontFamily: "var(--font-body-family)",
        fontSize: density === "compact" ? "var(--font-micro)" : "var(--font-small)",
        fontWeight: 700, lineHeight: 1.3, whiteSpace: "normal",
        color: toneInk(tone),
        ...toneSurface(tone),
      }}
    >
      <span>{mark}</span>
      <span>{children}</span>
    </span>
  );
}

/* -------------------------------------------------------------- DataRow */

/**
 * Label/value row. `href`/`onClick` turn it into a real control with a 42px target and the
 * shared focus ring; otherwise it stays plain text so screen readers do not announce a
 * button that does nothing.
 */
export function DataRow({
  label, value, hint, density = "comfortable", tone = "default",
  href, onClick, ariaLabel, divider = true, badge, id,
}: {
  label: React.ReactNode;
  value?: React.ReactNode;
  hint?: React.ReactNode;
  density?: Density;
  tone?: Tone;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
  divider?: boolean;
  badge?: React.ReactNode;
  id?: string;
}) {
  const interactive = Boolean(href || onClick);
  const body = (
    <>
      <span style={{ display: "grid", gap: "0.125rem", minWidth: 0, flex: "1 1 9rem" }}>
        <span style={{ color: "var(--muted)", fontSize: "var(--font-small)", overflowWrap: "anywhere" }}>{label}</span>
        {hint && <span style={{ color: "var(--muted)", fontSize: "var(--font-micro)", overflowWrap: "anywhere" }}>{hint}</span>}
      </span>
      {badge}
      {value != null && (
        <span
          style={{
            color: toneInk(tone), fontSize: "var(--font-body)", fontWeight: 600,
            fontVariantNumeric: "tabular-nums", textAlign: "right",
            flex: "0 1 auto", minWidth: 0, overflowWrap: "anywhere",
          }}
        >
          {value}
        </span>
      )}
      {interactive && <span aria-hidden="true" style={{ color: "var(--accent)", flex: "0 0 auto" }}>›</span>}
    </>
  );

  const shared: React.CSSProperties = {
    display: "flex", alignItems: "baseline", justifyContent: "space-between",
    flexWrap: "wrap", gap: PAD[density].gap,
    padding: ROW_PAD[density],
    borderBottom: divider ? "0.0625rem solid var(--line-soft)" : "none",
    fontSize: "var(--font-body)",
    ...(interactive
      ? { minHeight: "var(--control-height)", alignItems: "center", cursor: "pointer", color: "var(--ink)", textDecoration: "none", background: "transparent", border: "none", borderBottom: divider ? "0.0625rem solid var(--line-soft)" : "none", width: "100%", textAlign: "left" as const }
      : null),
  };

  if (href) {
    return <a id={id} className="comfort-focus" href={href} aria-label={ariaLabel} style={shared}>{body}</a>;
  }
  if (onClick) {
    return <button id={id} type="button" className="comfort-focus" onClick={onClick} aria-label={ariaLabel} style={shared}>{body}</button>;
  }
  return <div id={id} style={shared}>{body}</div>;
}

export default { Card, SectionHeader, Badge, DataRow };
