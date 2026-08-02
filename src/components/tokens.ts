/* ---- design tokens: one source for type scale, spacing, sizing, radii, elevation ---- */
const T = {
  fDisplay: "var(--font-display)", fHeading: "var(--font-heading)", fTitle: "var(--font-title)",
  fBody: "var(--font-body)", fSmall: "var(--font-small)", fLabel: "var(--font-label)", fMicro: "var(--font-micro)",
  // Legacy spacing remains numeric until the active Muhurat language lane releases
  // its string-concatenated call sites. New comfort work uses R below.
  s1: 4, s2: 8, s3: 12, s4: 16, s5: 20, s6: 24, s7: 28, s8: 32,
  ctrlH: "var(--control-height)", rSm: "var(--radius-sm)", rMd: "var(--radius-md)",
  rLg: "var(--radius-lg)", rPill: "var(--radius-pill)",
  iSm: "var(--icon-sm)", iMd: "var(--icon-md)", iLg: "var(--icon-lg)",
  e1: "var(--elevation-1)", e2: "var(--elevation-2)", e3: "var(--elevation-3)",
  serif: "var(--font-display-family)", body: "var(--font-body-family)",
  label: { fontSize: "var(--font-label)", letterSpacing: ".16em", textTransform: "uppercase", fontFamily: "var(--font-body-family)" },
};

const R = {
  ...T,
  s1: "var(--space-1)", s2: "var(--space-2)", s3: "var(--space-3)", s4: "var(--space-4)",
  s5: "var(--space-5)", s6: "var(--space-6)", s7: "var(--space-7)", s8: "var(--space-8)",
};

export { T, R };
