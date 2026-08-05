/*
 * Public website presentation foundation.
 *
 * This deliberately has no router, storage, data fetching or astronomical knowledge. The
 * shell supplies the current route, calculated values and the existing callbacks. Keeping
 * this boundary small means a visual replacement cannot accidentally reset place/date state
 * or turn a decorative reference control into a fake feature.
 */

import React from "react";

export type WebsiteNavItem = {
  /** A real, canonical destination that is already handled by the app shell. */
  href: string;
  label: string;
  current?: boolean;
};

type RealAction = {
  label: string;
  value: string;
  onPress: () => void;
  ariaLabel?: string;
};

export type WebsiteChromeProps = {
  brandLabel: string;
  brandDescriptor: string;
  navLabel: string;
  navItems: WebsiteNavItem[];
  language?: { label: string; onPress: () => void; ariaLabel: string };
  utilityAction?: { label: string; onPress: () => void; ariaLabel: string };
};

type WebsiteContextRibbonProps = {
  place: RealAction;
  date: RealAction;
  today: { label: string; onPress: () => void };
  sunrise?: { label: string; value: string };
  sunset?: { label: string; value: string };
};

const textButton: React.CSSProperties = {
  border: "0.0625rem solid var(--line)",
  borderRadius: "var(--radius-md)",
  background: "var(--surface-active)",
  color: "var(--ink)",
  minHeight: "var(--control-height)",
  padding: "0 var(--space-3)",
  fontFamily: "var(--font-body-family)",
  fontSize: "var(--font-body)",
  cursor: "pointer",
};

function TinyRose({ small = false }: { small?: boolean }) {
  const size = small ? "1.75rem" : "2.375rem";
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" width={size} height={size} style={{ flex: "0 0 auto" }}>
      <path d="M15.7 20.1c-.9 3-2.9 6.3-6.6 8.7" fill="none" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12.9 23.6c-3.7-1.3-5.8-.3-6.7 2.3 3.4 1.4 5.5.5 6.7-2.3Z" fill="var(--good)" opacity=".9" />
      <path d="M17.2 22.6c3.6-1.6 5.9-.8 7.1 1.7-3.2 1.7-5.6 1.1-7.1-1.7Z" fill="var(--good)" opacity=".78" />
      <path d="M16 4.8c5.1 0 9.2 3.8 9.2 8.6 0 5-4.4 9.2-9.2 9.2-5 0-9.2-4.2-9.2-9.2 0-4.8 4.1-8.6 9.2-8.6Z" fill="var(--bad)" />
      <path d="M16 7.2c2.4 0 4.4 1.9 4.4 4.3 0 2.5-2.1 4.5-4.4 4.5-2.5 0-4.5-2-4.5-4.5 0-2.4 2-4.3 4.5-4.3Z" fill="var(--surface-active)" opacity=".96" />
      <path d="M16 9c1.3 0 2.4 1 2.4 2.3 0 1.4-1.1 2.5-2.4 2.5-1.4 0-2.5-1.1-2.5-2.5C13.5 10 14.6 9 16 9Z" fill="var(--bad)" opacity=".9" />
      <path d="M9.6 15.4c1.8-2 3.8-3.1 6.4-3.1 2.5 0 4.7 1.2 6.4 3.1" fill="none" stroke="var(--gold)" strokeWidth=".85" opacity=".82" />
    </svg>
  );
}

function PinIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="1.25rem" height="1.25rem" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
}

function CalendarIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="1.25rem" height="1.25rem" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4.5" width="18" height="16.5" rx="2" /><path d="M7.5 2.5v4M16.5 2.5v4M3 9.5h18" /></svg>;
}

function SunIcon({ setting = false }: { setting?: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="2rem" height="2rem" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round"><path d="M3 18.5h18M5.5 15.5h13M12 3v2.4M4.4 6.4l1.7 1.7M19.6 6.4l-1.7 1.7M3 11h2.4M18.6 11H21" /><path d={setting ? "M7.2 15.5a5 5 0 0 1 9.6 0" : "M7.2 15.5a5 5 0 0 1 9.6 0"} /></svg>;
}

function ChevronDown() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="1rem" height="1rem" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>;
}

/**
 * The desktop-only visual identity: real anchors are supplied by the caller, so navigation
 * works before it is styled and no reference-only control is ever rendered as a button.
 */
export function WebsiteHeader({ brandLabel, brandDescriptor, navLabel, navItems, language, utilityAction }: WebsiteChromeProps) {
  return (
    <header style={{ borderTop: "0.125rem solid var(--gold)", borderBottom: "0.0625rem solid var(--line)", background: "var(--surface-active)" }}>
      <div style={{ maxWidth: "82rem", margin: "0 auto", padding: "var(--space-3) var(--space-5)", display: "grid", gridTemplateColumns: "minmax(11rem, 1fr) auto minmax(11rem, 1fr)", gap: "var(--space-5)", alignItems: "center" }}>
        <a href="/?screen=daily" aria-label={`${brandLabel} ${brandDescriptor}`} style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", color: "var(--ink)", textDecoration: "none", justifySelf: "start" }}>
          <TinyRose />
          <span style={{ display: "grid", gap: "0.05rem" }}>
            <span style={{ fontFamily: "var(--font-display-family)", color: "var(--gold)", fontSize: "1.95rem", lineHeight: 1, letterSpacing: "-0.025em" }}>{brandLabel}</span>
            <span style={{ fontSize: "var(--font-micro)", color: "var(--muted)", letterSpacing: "var(--label-letter-spacing)", textTransform: "uppercase" }}>{brandDescriptor}</span>
          </span>
        </a>

        <nav aria-label={navLabel} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(var(--space-3), 3vw, var(--space-7))", minWidth: 0 }}>
          {navItems.map((item) => (
            <a key={item.href} href={item.href} aria-current={item.current ? "page" : undefined} style={{ color: item.current ? "var(--ink)" : "var(--muted)", fontFamily: "var(--font-body-family)", fontSize: "var(--font-body)", fontWeight: item.current ? 700 : 500, textDecoration: "none", padding: "var(--space-2) 0", borderBottom: item.current ? "0.125rem solid var(--accent)" : "0.125rem solid transparent", whiteSpace: "nowrap" }}>{item.label}</a>
          ))}
        </nav>

        <div style={{ display: "flex", justifySelf: "end", justifyContent: "flex-end", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
          {language && <button type="button" onClick={language.onPress} aria-label={language.ariaLabel} style={{ ...textButton, borderColor: "transparent", minHeight: "2.25rem", display: "inline-flex", alignItems: "center", gap: "var(--space-1)", paddingInline: "var(--space-2)" }}><span aria-hidden="true">◎</span>{language.label}<ChevronDown /></button>}
          {utilityAction && <button type="button" onClick={utilityAction.onPress} aria-label={utilityAction.ariaLabel} style={{ ...textButton, minHeight: "2.25rem", display: "inline-flex", alignItems: "center", gap: "var(--space-1)", paddingInline: "var(--space-3)" }}>{utilityAction.label}<ChevronDown /></button>}
        </div>
      </div>
    </header>
  );
}

/** The only editable fields in the ribbon are the real shared place and date actions. */
export function WebsiteContextRibbon({ place, date, today, sunrise, sunset }: WebsiteContextRibbonProps) {
  return (
    <section aria-label="Current place and date" style={{ position: "relative", isolation: "isolate", borderBlock: "0.0625rem solid var(--line)", background: "linear-gradient(90deg, color-mix(in srgb, var(--accent), var(--surface-active) 91%), var(--surface-active) 42%, color-mix(in srgb, var(--accent), var(--surface-active) 92%))" }}>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, zIndex: -1, opacity: 0.48, backgroundImage: "radial-gradient(circle at 0.1875rem 0.1875rem, var(--gold) 0.0625rem, transparent 0.09375rem)", backgroundSize: "0.75rem 0.75rem" }} />
      <div style={{ maxWidth: "82rem", margin: "0 auto", padding: "var(--space-3) var(--space-5)", display: "grid", gridTemplateColumns: "minmax(13rem, 1.05fr) minmax(15rem, 1.15fr) auto minmax(8rem, .62fr) minmax(8rem, .62fr)", gap: "var(--space-3)", alignItems: "end" }}>
        <RibbonAction caption={place.label} value={place.value} icon={<PinIcon />} onPress={place.onPress} ariaLabel={place.ariaLabel} />
        <RibbonAction caption={date.label} value={date.value} icon={<CalendarIcon />} onPress={date.onPress} ariaLabel={date.ariaLabel} />
        <button type="button" onClick={today.onPress} style={{ ...textButton, color: "var(--accent)", borderColor: "var(--accent)", alignSelf: "end" }}>{today.label}</button>
        {sunrise && <SunMoment {...sunrise} />}
        {sunset && <SunMoment {...sunset} setting />}
      </div>
    </section>
  );
}

function RibbonAction({ caption, value, icon, onPress, ariaLabel }: RealAction & { icon: React.ReactNode }) {
  return <label style={{ display: "grid", gap: "var(--space-1)", minWidth: 0 }}><span style={{ color: "var(--accent)", fontSize: "var(--font-micro)", fontWeight: 700, letterSpacing: "var(--label-letter-spacing)", textTransform: "uppercase" }}>{caption}</span><button type="button" onClick={onPress} aria-label={ariaLabel || `${caption}: ${value}`} style={{ ...textButton, justifyContent: "space-between", display: "inline-flex", alignItems: "center", gap: "var(--space-2)", width: "100%" }}><span style={{ color: "var(--accent)", display: "inline-flex" }}>{icon}</span><span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left" }}>{value}</span><ChevronDown /></button></label>;
}

function SunMoment({ label, value, setting = false }: { label: string; value: string; setting?: boolean }) {
  return <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", minHeight: "var(--control-height)", color: "var(--accent)", borderLeft: "0.0625rem solid var(--line)", paddingLeft: "var(--space-3)" }}><SunIcon setting={setting} /><span style={{ display: "grid", gap: "0.05rem", minWidth: 0 }}><span style={{ color: "var(--muted)", fontSize: "var(--font-micro)" }}>{label}</span><strong style={{ color: "var(--ink)", fontSize: "var(--font-body)", fontVariantNumeric: "tabular-nums" }}>{value}</strong></span></div>;
}

/** Decorative footer only; it creates no destination or implied capability. */
export function WebsiteFloralFooter() {
  return <footer aria-hidden="true" style={{ marginTop: "var(--space-8)", borderTop: "0.0625rem solid var(--gold)", borderBottom: "0.125rem solid var(--gold)", overflow: "hidden", background: "color-mix(in srgb, var(--accent), var(--surface-active) 89%)" }}><div style={{ height: "0.25rem", background: "var(--gold)" }} /><div style={{ minHeight: "5.75rem", maxWidth: "82rem", margin: "0 auto", padding: "var(--space-2) var(--space-5)", display: "flex", justifyContent: "space-between", alignItems: "end", gap: "var(--space-3)" }}>{Array.from({ length: 15 }, (_, index) => <TinyRose key={index} small />)}</div><div style={{ height: "0.25rem", background: "var(--gold)" }} /></footer>;
}
