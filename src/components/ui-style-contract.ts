/*
 * Component-facing aliases only. All design-token names and values live in the
 * single authoritative file: src/styles/design-tokens.css.
 *
 * This compatibility projection must not define colour, type, spacing, radius or
 * elevation values. It only lets existing inline-style components consume CSS
 * custom properties while the component migration continues.
 */
const T = {
  fDisplay: "var(--font-display)", fHeading: "var(--font-heading)", fTitle: "var(--font-title)",
  fBody: "var(--font-body)", fSmall: "var(--font-small)", fLabel: "var(--font-label)", fMicro: "var(--font-micro)",
  s1: "var(--space-1)", s2: "var(--space-2)", s3: "var(--space-3)", s4: "var(--space-4)",
  s5: "var(--space-5)", s6: "var(--space-6)", s7: "var(--space-7)", s8: "var(--space-8)",
  ctrlH: "var(--control-height)", rSm: "var(--radius-sm)", rMd: "var(--radius-md)",
  rLg: "var(--radius-lg)", rPill: "var(--radius-pill)",
  iSm: "var(--icon-sm)", iMd: "var(--icon-md)", iLg: "var(--icon-lg)",
  e1: "var(--elevation-1)", e2: "var(--elevation-2)", e3: "var(--elevation-3)",
  serif: "var(--font-display-family)", body: "var(--font-body-family)",
  label: {
    fontSize: "var(--font-label)",
    letterSpacing: "var(--label-letter-spacing)",
    textTransform: "var(--label-transform)",
    fontFamily: "var(--font-body-family)",
  },
};

// R remains an import-compatible alias; it does not carry a second value set.
const R = T;

export { T, R };
