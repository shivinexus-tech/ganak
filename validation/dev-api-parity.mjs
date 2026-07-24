/* Engine parity: compare API panchang output with direct engine bundle.
   Run: node validation/dev-api-parity.mjs */

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEngines, toPlace } from "../server/api/engines.mjs";
import { panchangResponse } from "../server/api/contract.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const serverDir = path.join(repoRoot, "server");
const PORT = process.env.API_PARITY_PORT || "3217";
const BASE = `http://127.0.0.1:${PORT}`;
const KEY = "parity-key";

function tzOffsetHours(tz, ms) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, timeZoneName: "longOffset",
    year: "numeric", month: "2-digit", day: "2-digit",
  });
  const part = dtf.formatToParts(new Date(ms)).find((p) => p.type === "timeZoneName");
  const m = /GMT([+-]\d{1,2})(?::(\d{2}))?/.exec(part?.value || "");
  if (!m) return 0;
  const h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  return h + Math.sign(h || 1) * (min / 60);
}

const cases = [
  { name: "Delhi", lat: 28.61, lon: 77.21, tz: "Asia/Kolkata", date: "2026-07-19" },
  { name: "Chennai", lat: 13.08, lon: 80.27, tz: "Asia/Kolkata", date: "2026-07-19" },
  { name: "London-DST", lat: 51.51, lon: -0.13, tz: "Europe/London", date: "2026-07-19" },
  { name: "NewYork-DST", lat: 40.71, lon: -74.01, tz: "America/New_York", date: "2026-07-19" },
  { name: "Kolkata-half", lat: 22.57, lon: 88.36, tz: "Asia/Kolkata", date: "2026-02-29" }, // 2024 leap via wrong - use 2024-02-29
  { name: "LeapDay", lat: 28.61, lon: 77.21, tz: "Asia/Kolkata", date: "2024-02-29" },
];

// fix Kolkata case date
cases[4].date = "2024-02-29";

const child = spawn(process.execPath, [path.join(serverDir, "index.js")], {
  env: {
    ...process.env, PORT, HOST: "127.0.0.1", ANTHROPIC_API_KEY: "",
    API_KEYS: JSON.stringify([{ key: KEY, name: "parity", quotaPerDay: 5000 }]),
    API_RATE_PER_MIN: "1000",
  },
  stdio: ["ignore", "pipe", "pipe"],
});

let failed = 0;
try {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`${BASE}/health`)).ok) break; } catch { /* wait */ }
    await new Promise((r) => setTimeout(r, 150));
  }

  const E = await loadEngines();
  for (const c of cases) {
    const [y, m, d] = c.date.split("-").map(Number);
    const ms = Date.UTC(y, m - 1, d);
    E.setAyanMode("lahiri");
    const at = ms - tzOffsetHours(c.tz, ms) * 3_600_000 + 12 * 3_600_000;
    const raw = E.computeTodayPanchang(toPlace(c), "lahiri", at);
    const direct = panchangResponse(raw, { lat: c.lat, lon: c.lon, tz: c.tz, date: c.date, ayanamsa: "lahiri" });

    const url = `${BASE}/v1/panchang?date=${c.date}&lat=${c.lat}&lon=${c.lon}&tz=${encodeURIComponent(c.tz)}`;
    const api = await (await fetch(url, { headers: { "x-api-key": KEY } })).json();

    const fields = [
      ["tithi", direct.panchang.tithi[0]?.name, api.panchang.tithi[0]?.name],
      ["nakshatra", direct.panchang.nakshatra[0]?.name, api.panchang.nakshatra[0]?.name],
      ["sun.rise", direct.panchang.sun.rise, api.panchang.sun.rise],
      ["sun.set", direct.panchang.sun.set, api.panchang.sun.set],
      ["rahu.from", direct.panchang.inauspicious.rahuKalam?.from, api.panchang.inauspicious.rahuKalam?.from],
    ];
    for (const [label, exp, got] of fields) {
      const ok = exp === got;
      if (!ok) { failed++; console.log(`FAIL ${c.name} ${label}: engine=${exp} api=${got}`); }
      else console.log(`  ok  ${c.name} ${label}`);
    }
  }
} finally {
  child.kill("SIGTERM");
}

console.log(failed ? `\n${failed} parity mismatches` : "\nAll parity checks passed");
process.exit(failed ? 1 : 0);
