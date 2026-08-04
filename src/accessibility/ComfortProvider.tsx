import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { approvedStorage } from "../storage/approved-storage";

export type ComfortPreset = "simple-large" | "balanced" | "detailed" | "custom";
export type ColorMode = "auto" | "light" | "dark";
export type Warmth = "crisp" | "balanced" | "soft";
export type ContentDepth = "guided" | "balanced" | "expert";

export type HomePlace = {
  label: string;
  lat: number;
  lon: number;
  zone: string;
};

export type GanakPreferences = {
  version: 1;
  preset: ComfortPreset;
  scalePercent: number;
  densityRem: number;
  warmth: Warmth;
  colorMode: ColorMode;
  depth: ContentDepth;
  language: "auto" | "en" | "hi";
  homePlace: HomePlace | null;
  following: string[];
  speechRate: number;
  firstRunComplete: boolean;
  privacy: {
    analytics: boolean;
    research: boolean;
    sensitiveSync: boolean;
  };
};

type ComfortContextValue = {
  preferences: GanakPreferences;
  ready: boolean;
  storageError: string;
  updatePreferences: (patch: Partial<GanakPreferences>) => void;
  applyPreset: (preset: Exclude<ComfortPreset, "custom">) => void;
  toggleFollow: (key: string) => void;
  clearPreferences: () => void;
  dismissFirstRun: () => void;
};

const PRESETS = Object.freeze({
  "simple-large": { scalePercent: 118.75, densityRem: 0.1875, depth: "guided" as ContentDepth, warmth: "soft" as Warmth },
  balanced: { scalePercent: 112.5, densityRem: 0.0625, depth: "balanced" as ContentDepth, warmth: "balanced" as Warmth },
  detailed: { scalePercent: 106.25, densityRem: -0.0625, depth: "expert" as ContentDepth, warmth: "crisp" as Warmth },
});

export const DEFAULT_PREFERENCES: GanakPreferences = Object.freeze({
  version: 1,
  preset: "balanced",
  scalePercent: PRESETS.balanced.scalePercent,
  densityRem: PRESETS.balanced.densityRem,
  warmth: PRESETS.balanced.warmth,
  colorMode: "auto",
  depth: PRESETS.balanced.depth,
  language: "auto",
  homePlace: null,
  following: [],
  speechRate: 0.92,
  firstRunComplete: false,
  privacy: { analytics: false, research: false, sensitiveSync: false },
});

const ComfortContext = createContext<ComfortContextValue | null>(null);

function finiteInRange(value: unknown, min: number, max: number, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? value as T : fallback;
}

function safePlace(value: unknown): HomePlace | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const lat = Number(v.lat), lon = Number(v.lon);
  if (!v.label || !v.zone || !Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lon) || Math.abs(lon) > 180) return null;
  return { label: String(v.label), zone: String(v.zone), lat, lon };
}

export function sanitizePreferences(value: unknown): GanakPreferences {
  const v = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const privacy = v.privacy && typeof v.privacy === "object" ? v.privacy as Record<string, unknown> : {};
  const following = Array.isArray(v.following)
    ? [...new Set(v.following.filter((item) => typeof item === "string").map((item) => String(item).trim().slice(0, 128)).filter(Boolean))].slice(0, 64)
    : [];
  return {
    version: 1,
    preset: oneOf(v.preset, ["simple-large", "balanced", "detailed", "custom"] as const, DEFAULT_PREFERENCES.preset),
    scalePercent: finiteInRange(v.scalePercent, 93.75, 125, DEFAULT_PREFERENCES.scalePercent),
    densityRem: finiteInRange(v.densityRem, -0.125, 0.3125, DEFAULT_PREFERENCES.densityRem),
    warmth: oneOf(v.warmth, ["crisp", "balanced", "soft"] as const, DEFAULT_PREFERENCES.warmth),
    colorMode: oneOf(v.colorMode, ["auto", "light", "dark"] as const, DEFAULT_PREFERENCES.colorMode),
    depth: oneOf(v.depth, ["guided", "balanced", "expert"] as const, DEFAULT_PREFERENCES.depth),
    language: oneOf(v.language, ["auto", "en", "hi"] as const, DEFAULT_PREFERENCES.language),
    homePlace: safePlace(v.homePlace),
    following,
    speechRate: finiteInRange(v.speechRate, 0.75, 1.2, DEFAULT_PREFERENCES.speechRate),
    firstRunComplete: Boolean(v.firstRunComplete),
    privacy: {
      analytics: Boolean(privacy.analytics),
      research: Boolean(privacy.research),
      sensitiveSync: Boolean(privacy.sensitiveSync),
    },
  };
}

function applyRootPreferences(preferences: GanakPreferences) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.comfortPreset = preferences.preset;
  root.dataset.colorMode = preferences.colorMode;
  root.dataset.warmth = preferences.warmth;
  root.dataset.depth = preferences.depth;
  root.style.setProperty("--scale", `${preferences.scalePercent}%`);
  root.style.setProperty("--density", `${preferences.densityRem}rem`);
}

/**
 * Apply the stored preferences to <html> BEFORE React's first paint.
 *
 * Doing this in an effect meant the first frame was always the 106.25% light default and
 * then flipped: a visible reflow for anyone on Simple & Large, and — because the whole app
 * styles itself with inline `var(--token)` references — a window in which the root custom
 * properties and the painted colours disagreed. Reading synchronously at boot removes both.
 */
export function applyStoredPreferencesToRoot() {
  if (typeof document === "undefined") return;
  const result = approvedStorage.preferences.read(DEFAULT_PREFERENCES as unknown as Record<string, unknown>);
  applyRootPreferences(sanitizePreferences(result.value));
}

export function ComfortProvider({ children }: { children: React.ReactNode }) {
  // Read the stored preferences synchronously, during the first render.
  //
  // This used to happen in a mount effect, which produced a three-step flicker: the page
  // painted with the defaults, the effect pass re-applied the defaults to <html>, and only
  // the following render applied what the user had actually chosen. Anything that mounted
  // inside that window — the first-run dialog above all — was laid out against the wrong
  // theme. Reading here means there is never a frame with the wrong size or colour mode.
  const [stored] = useState(() => approvedStorage.preferences.read(DEFAULT_PREFERENCES as unknown as Record<string, unknown>));
  const [preferences, setPreferences] = useState<GanakPreferences>(() => sanitizePreferences(stored.value));
  const [ready] = useState(true);
  const [storageError, setStorageError] = useState(stored.ok ? "" : stored.error);
  // Loading is not a change: do not write the freshly read value straight back.
  const skipNextWrite = useRef(true);

  useEffect(() => {
    applyRootPreferences(preferences);
    if (!ready) return;
    if (skipNextWrite.current) { skipNextWrite.current = false; return; }
    const result = approvedStorage.preferences.write(preferences as unknown as Record<string, unknown>);
    setStorageError(result.ok ? "" : result.error);
  }, [preferences, ready]);

  const updatePreferences = useCallback((patch: Partial<GanakPreferences>) => {
    setPreferences((current) => sanitizePreferences({
      ...current,
      ...patch,
      privacy: patch.privacy ? { ...current.privacy, ...patch.privacy } : current.privacy,
      preset: patch.preset || (patch.scalePercent != null || patch.densityRem != null || patch.depth || patch.warmth ? "custom" : current.preset),
    }));
  }, []);

  const applyPreset = useCallback((preset: Exclude<ComfortPreset, "custom">) => {
    setPreferences((current) => sanitizePreferences({ ...current, preset, ...PRESETS[preset] }));
  }, []);

  const toggleFollow = useCallback((key: string) => {
    setPreferences((current) => {
      const following = current.following.includes(key)
        ? current.following.filter((item) => item !== key)
        : [...current.following, key];
      return { ...current, following };
    });
  }, []);

  const clearPreferences = useCallback(() => {
    const result = approvedStorage.preferences.clear();
    setStorageError(result.ok ? "" : result.error);
    skipNextWrite.current = true;
    setPreferences({ ...DEFAULT_PREFERENCES, privacy: { ...DEFAULT_PREFERENCES.privacy }, following: [] });
  }, []);

  const dismissFirstRun = useCallback(() => {
    setPreferences((current) => ({ ...current, firstRunComplete: true }));
  }, []);

  const value = useMemo<ComfortContextValue>(() => ({
    preferences, ready, storageError, updatePreferences, applyPreset,
    toggleFollow, clearPreferences, dismissFirstRun,
  }), [preferences, ready, storageError, updatePreferences, applyPreset, toggleFollow, clearPreferences, dismissFirstRun]);

  return <ComfortContext.Provider value={value}>{children}</ComfortContext.Provider>;
}

export function useComfort() {
  const value = useContext(ComfortContext);
  if (!value) throw new Error("useComfort must be used inside ComfortProvider");
  return value;
}

/**
 * Guided ↔ Expert, as a three-step ladder every screen can consume.
 *
 *                                   guided   balanced   expert
 *   answer, warnings, dates, actions   ✓         ✓         ✓     (never gated, at any depth)
 *   showTechnical  existing detail     –         ✓         ✓
 *   showPlainHelp  extra plain words   ✓         –         –
 *   showExpert     deeper derivation   –         –         ✓
 *
 * Balanced is deliberately identical to what shipped before this setting did anything, so
 * turning the ladder on cannot silently remove content from the default preference. Guided
 * simplifies and explains; Expert adds. Critical warnings, dates, actions and safety
 * information are unconditional and must never be placed behind any of these flags.
 *
 * Reading the context directly (instead of useComfort) keeps screens renderable in the
 * validation harnesses, which mount them without the provider.
 */
export function useDepth() {
  const value = useContext(ComfortContext);
  const depth = value?.preferences.depth || DEFAULT_PREFERENCES.depth;
  return {
    depth,
    isGuided: depth === "guided",
    isBalanced: depth === "balanced",
    isExpert: depth === "expert",
    showTechnical: depth !== "guided",
    showPlainHelp: depth === "guided",
    showExpert: depth === "expert",
  };
}

export { PRESETS };
