/* API key authentication and per-key daily quotas.

   Keys come from the environment, not a database, because the API has no datastore
   yet and inventing one here would be the wrong call to make quietly. That is a
   deliberate v1 limit, documented in server/README.md: rotating a key means changing
   an env var and restarting.

   Quotas are counted in memory, so they are per-process. Fine for one instance;
   a multi-instance deployment needs a shared store, and the README says so rather
   than letting an operator discover it from a bill. */

import { timingSafeEqual, createHash } from "node:crypto";

/* API_KEYS is JSON: [{"key":"...","name":"acme","quotaPerDay":1000}]
   A bare comma-separated list of keys is also accepted for quick local use and gets
   the default quota. */
export function parseKeys(raw, defaultQuota = 1000) {
  const text = (raw || "").trim();
  if (!text) return [];

  if (text.startsWith("[")) {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("API_KEYS is not valid JSON.");
    }
    if (!Array.isArray(parsed)) throw new Error("API_KEYS must be a JSON array.");
    return parsed.map((entry, i) => {
      if (!entry || typeof entry.key !== "string" || !entry.key.trim())
        throw new Error(`API_KEYS[${i}] has no key.`);
      return {
        key: entry.key.trim(),
        name: (entry.name || `key-${i + 1}`).trim(),
        quotaPerDay: Number.isInteger(entry.quotaPerDay) && entry.quotaPerDay > 0
          ? entry.quotaPerDay
          : defaultQuota,
      };
    });
  }

  return text.split(",").map((k) => k.trim()).filter(Boolean)
    .map((key, i) => ({ key, name: `key-${i + 1}`, quotaPerDay: defaultQuota }));
}

/* Never log or return a raw key. This lets us identify one in logs and in the
   /v1/me response without ever exposing it. */
export const keyFingerprint = (key) =>
  createHash("sha256").update(key).digest("hex").slice(0, 12);

function safeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // Compare against a fixed-length digest so length itself does not leak via timing.
  const digest = (buf) => createHash("sha256").update(buf).digest();
  return timingSafeEqual(digest(bufA), digest(bufB));
}

export function createKeyStore(keys) {
  const usage = new Map(); // fingerprint -> { day, count }
  const utcDay = (now) => Math.floor(now / 86_400_000);

  return {
    size: keys.length,

    /* Returns the matching key record, or null. Constant-time against every
       configured key, so a wrong key cannot be narrowed down by timing. */
    find(supplied) {
      if (!supplied) return null;
      let found = null;
      for (const record of keys) {
        if (safeEqual(record.key, supplied)) found = record;
      }
      return found;
    },

    /* Counts one call and reports the quota state. Rolls over at UTC midnight. */
    consume(record, now = Date.now()) {
      const fp = keyFingerprint(record.key);
      const today = utcDay(now);
      const current = usage.get(fp);
      const count = current && current.day === today ? current.count + 1 : 1;
      usage.set(fp, { day: today, count });

      const limit = record.quotaPerDay;
      const resetAt = (today + 1) * 86_400_000;
      return {
        allowed: count <= limit,
        limit,
        used: count,
        remaining: Math.max(0, limit - count),
        resetAt: new Date(resetAt).toISOString(),
      };
    },

    peek(record, now = Date.now()) {
      const fp = keyFingerprint(record.key);
      const current = usage.get(fp);
      const today = utcDay(now);
      const used = current && current.day === today ? current.count : 0;
      return {
        limit: record.quotaPerDay,
        used,
        remaining: Math.max(0, record.quotaPerDay - used),
        resetAt: new Date((today + 1) * 86_400_000).toISOString(),
      };
    },
  };
}
