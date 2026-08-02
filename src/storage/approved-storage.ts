/*
 * Ganak's single auditable on-device persistence boundary.
 *
 * Feature code must use the named stores below. It must not create ad-hoc browser
 * keys or access browser storage directly. Religious follow choices are local-only;
 * this module has no network or analytics dependency by design.
 */

type StoreName = "preferences" | "savedCharts";

type StorageEnvelope = {
  version: 1;
  stores: Partial<Record<StoreName, unknown>>;
};

export type StorageResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; value: T };

const STORAGE_KEY = "ganak:approved-storage:v1";
const EMPTY_ENVELOPE: StorageEnvelope = { version: 1, stores: {} };

function cloneEmpty(): StorageEnvelope {
  return { version: EMPTY_ENVELOPE.version, stores: {} };
}

function storageAvailable() {
  if (typeof window === "undefined") return false;
  try { return Boolean(window.localStorage); }
  catch { return false; }
}

function readEnvelope(): StorageResult<StorageEnvelope> {
  if (!storageAvailable()) return { ok: false, error: "storage-unavailable", value: cloneEmpty() };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ok: true, value: cloneEmpty() };
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || !parsed.stores || typeof parsed.stores !== "object" || Array.isArray(parsed.stores)) {
      return { ok: false, error: "storage-invalid", value: cloneEmpty() };
    }
    const stores: StorageEnvelope["stores"] = {};
    if (Object.prototype.hasOwnProperty.call(parsed.stores, "preferences")) stores.preferences = parsed.stores.preferences;
    if (Object.prototype.hasOwnProperty.call(parsed.stores, "savedCharts")) stores.savedCharts = parsed.stores.savedCharts;
    return { ok: true, value: { version: 1, stores } };
  } catch {
    return { ok: false, error: "storage-read-failed", value: cloneEmpty() };
  }
}

function writeEnvelope(envelope: StorageEnvelope): StorageResult<null> {
  if (!storageAvailable()) return { ok: false, error: "storage-unavailable", value: null };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
    return { ok: true, value: null };
  } catch {
    return { ok: false, error: "storage-write-failed", value: null };
  }
}

function store<T>(name: StoreName) {
  return Object.freeze({
    read(fallback: T): StorageResult<T> {
      const envelope = readEnvelope();
      if (!envelope.ok) return { ...envelope, value: fallback };
      const value = envelope.value.stores[name];
      return { ok: true, value: value == null ? fallback : value as T };
    },
    write(value: T): StorageResult<null> {
      const envelope = readEnvelope();
      if (!envelope.ok && envelope.error !== "storage-invalid") {
        return { ok: false, error: envelope.error, value: null };
      }
      const next: StorageEnvelope = {
        version: 1,
        stores: { ...envelope.value.stores, [name]: value },
      };
      return writeEnvelope(next);
    },
    clear(): StorageResult<null> {
      const envelope = readEnvelope();
      if (!envelope.ok && envelope.error !== "storage-invalid") {
        return { ok: false, error: envelope.error, value: null };
      }
      const stores = { ...envelope.value.stores };
      delete stores[name];
      return writeEnvelope({ version: 1, stores });
    },
  });
}

export const approvedStorage = Object.freeze({
  preferences: store<Record<string, unknown>>("preferences"),
  savedCharts: store<unknown[]>("savedCharts"),
});

export function analyticsConsentGranted() {
  const result = approvedStorage.preferences.read({});
  if (!result.ok || !result.value || typeof result.value !== "object") return false;
  const privacy = (result.value as Record<string, unknown>).privacy;
  return Boolean(privacy && typeof privacy === "object" && (privacy as Record<string, unknown>).analytics === true);
}

export const APPROVED_STORAGE_NAMES = Object.freeze(["preferences", "savedCharts"] as const);
