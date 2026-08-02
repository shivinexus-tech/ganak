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
  "simple-large": { scalePercent: 112.5, densityRem: 0.1875, depth: "guided" as ContentDepth, warmth: "soft" as Warmth },
  balanced: { scalePercent: 106.25, densityRem: 0.0625, depth: "balanced" as ContentDepth, warmth: "balanced" as Warmth },
  detailed: { scalePercent: 100, densityRem: -0.0625, depth: "expert" as ContentDepth, warmth: "crisp" as Warmth },
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

export function ComfortProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<GanakPreferences>(DEFAULT_PREFERENCES);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const skipNextWrite = useRef(false);

  useEffect(() => {
    const result = approvedStorage.preferences.read(DEFAULT_PREFERENCES as unknown as Record<string, unknown>);
    setPreferences(sanitizePreferences(result.value));
    setStorageError(result.ok ? "" : result.error);
    setReady(true);
  }, []);

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

export { PRESETS };
