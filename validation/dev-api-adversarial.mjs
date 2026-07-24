/* Adversarial bug-bash tests for Ganak public API v1.
   Run: node validation/dev-api-adversarial.mjs
   Spawns the server on a spare port; no Anthropic key required. */

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const serverDir = path.join(repoRoot, "server");
const PORT = process.env.API_ADV_PORT || "3212";
const BASE = `http://127.0.0.1:${PORT}`;
const KEY_A = "adv-key-alpha";
const KEY_B = "adv-key-beta";
const KEY_TINY = "adv-key-tiny";
const DELHI = "lat=28.61&lon=77.21&tz=Asia/Kolkata";

const results = [];
const check = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "  ok  " : "FAIL  "}${name}${detail ? ` — ${detail}` : ""}`);
};

const containsExactValue = (value, secret) => {
  if (value === secret) return true;
  if (Array.isArray(value)) return value.some((item) => containsExactValue(item, secret));
  if (value && typeof value === "object") {
    return Object.values(value).some((item) => containsExactValue(item, secret));
  }
  return false;
};

const get = (path_, opts = {}) => {
  const headers = { ...(opts.headers || {}) };
  if (opts.key !== false) headers["x-api-key"] = opts.key ?? KEY_A;
  return fetch(`${BASE}${path_}`, { method: opts.method || "GET", headers });
};

async function waitForServer() {
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch(`${BASE}/health`)).ok) return true;
    } catch { /* not up */ }
    await new Promise((r) => setTimeout(r, 150));
  }
  return false;
}

const child = spawn(process.execPath, [path.join(serverDir, "index.js")], {
  env: {
    ...process.env,
    PORT,
    HOST: "127.0.0.1",
    ANTHROPIC_API_KEY: "",
    API_SHARED_SECRET: "explain-secret",
    API_KEYS: JSON.stringify([
      { key: KEY_A, name: "alpha", quotaPerDay: 100 },
      { key: KEY_B, name: "beta", quotaPerDay: 100 },
      { key: KEY_TINY, name: "tiny", quotaPerDay: 3 },
    ]),
    API_RATE_PER_MIN: "1000",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
child.stdout.on("data", () => {});
child.stderr.on("data", () => {});

try {
  if (!(await waitForServer())) throw new Error("server did not start");

  /* ---- 1. Authentication and secret safety ---- */
  for (const badKey of ["", "   ", ",", "null", "undefined", "x".repeat(5000)]) {
    const headers = badKey === "" ? {} : { "x-api-key": badKey };
    const r = await fetch(`${BASE}/v1/panchang?date=2026-07-19&${DELHI}`, { headers });
    const body = await r.json().catch(() => ({}));
    check(`rejects malformed key (${JSON.stringify(String(badKey).slice(0, 20))})`, r.status === 401, `status ${r.status}`);
    if (badKey) check(`malformed key not echoed (${String(badKey).slice(0, 8)})`, !containsExactValue(body, badKey));
  }

  // x-ganak-key must NOT work on /v1/*
  const ganakOnV1 = await get(`/v1/panchang?date=2026-07-19&${DELHI}`, {
    key: false,
    headers: { "x-ganak-key": "explain-secret" },
  });
  check("x-ganak-key cannot authenticate /v1/*", ganakOnV1.status === 401);

  // x-api-key must NOT work on /api/explain
  const apiOnExplain = await fetch(`${BASE}/api/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": KEY_A },
    body: JSON.stringify({ prompt: "test" }),
  });
  check("x-api-key cannot authenticate /api/explain", apiOnExplain.status === 401);

  check("openapi.json public without key", (await fetch(`${BASE}/v1/openapi.json`)).status === 200);

  /* ---- 2. Input validation edge cases ---- */
  const validationCases = [
    [`/v1/panchang?date=2026-07-19&lat=NaN&lon=77`, "MISSING_PLACE"],
    [`/v1/panchang?date=2026-07-19&lat=28.61&lon=77.21&tz=Asia/Kolkata&ayanamsa=`, "INVALID_AYANAMSA"],
    [`/v1/panchang?date=2024-02-29&lat=28.61&lon=77.21&tz=Asia/Kolkata`, 200], // leap day
    [`/v1/panchang?date=2023-02-29&lat=28.61&lon=77.21&tz=Asia/Kolkata`, "INVALID_DATE"],
    [`/v1/panchang?date=2026-07-19&lat=28.61&lon=77.21&tz=America/New_York`, 200],
    [`/v1/panchang?date=%202026-07-19&lat=28.61&lon=77.21&tz=Asia/Kolkata`, "INVALID_DATE"],
    [`/v1/muhurat?from=2026-07-19&to=2026-07-19&activity=wedding&${DELHI}`, 200],
    [`/v1/muhurat?from=2026-07-19&to=2028-07-19&activity=wedding&${DELHI}`, "RANGE_TOO_LONG"],
    [`/v1/festivals?from=2026-07-19&days=0&${DELHI}`, "INVALID_DAYS"],
    [`/v1/festivals?from=2026-07-19&days=1.5&${DELHI}`, "INVALID_DAYS"],
  ];
  for (const [url, expect] of validationCases) {
    const r = await get(url);
    const body = await r.json().catch(() => ({}));
    if (typeof expect === "number") {
      check(`validation ${url.split("?")[0]} expect ${expect}`, r.status === expect, `got ${r.status}/${body.code}`);
    } else {
      check(`${expect} on ${url.split("?")[0]}`, r.status === 400 && body.code === expect, `got ${r.status}/${body.code}`);
      const leak = JSON.stringify(body);
      check(`${expect} no stack/path leak`, !leak.includes("/Users/") && !/\bat \w+ \(/.test(leak));
    }
  }

  /* ---- 3. /v1/me must not consume quota (documented contract) ---- */
  const meBefore = await (await get("/v1/me", { key: KEY_A })).json();
  for (let i = 0; i < 5; i++) await get("/v1/me", { key: KEY_A });
  const meAfter = await (await get("/v1/me", { key: KEY_A })).json();
  check("/v1/me does not consume quota", meBefore.quota.used === meAfter.quota.used,
    `before ${meBefore.quota.used} after ${meAfter.quota.used}`);

  /* ---- 4. Failed validation should not consume quota ---- */
  const beforeBad = await (await get("/v1/me", { key: KEY_TINY })).json();
  await get(`/v1/panchang?date=bad&${DELHI}`, { key: KEY_TINY });
  const afterBad = await (await get("/v1/me", { key: KEY_TINY })).json();
  check("validation failure does not consume quota", beforeBad.quota.used === afterBad.quota.used,
    `before ${beforeBad.quota.used} after ${afterBad.quota.used}`);

  /* ---- 5. Quota off-by-one ---- */
  const t1 = await get(`/v1/panchang?date=2026-07-19&${DELHI}`, { key: KEY_TINY });
  check("quota limit header = 3", t1.headers.get("x-quota-limit") === "3");
  check("after 1st call remaining = 2", t1.headers.get("x-quota-remaining") === "2");
  const t2 = await get(`/v1/panchang?date=2026-07-20&${DELHI}`, { key: KEY_TINY });
  check("after 2nd call remaining = 1", t2.headers.get("x-quota-remaining") === "1");
  const t3 = await get(`/v1/panchang?date=2026-07-21&${DELHI}`, { key: KEY_TINY });
  check("after 3rd call remaining = 0", t3.headers.get("x-quota-remaining") === "0");
  const t4 = await get(`/v1/panchang?date=2026-07-22&${DELHI}`, { key: KEY_TINY });
  check("4th call blocked with QUOTA_EXCEEDED", t4.status === 429 && (await t4.json()).code === "QUOTA_EXCEEDED");

  /* ---- 6. HTTP methods and routes ---- */
  const postV1 = await fetch(`${BASE}/v1/panchang?date=2026-07-19&${DELHI}`, {
    method: "POST",
    headers: { "x-api-key": KEY_A },
  });
  check("POST /v1/panchang rejected", postV1.status === 404 || postV1.status === 405, `status ${postV1.status}`);

  const root404 = await get("/v1/unknown-route");
  check("unknown /v1/* is JSON 404", root404.status === 404 && (await root404.json()).code === "NOT_FOUND");

  const top404 = await fetch(`${BASE}/not-real`);
  check("top-level unknown is JSON 404", top404.status === 404);

  /* ---- 7. Hora: 12 contiguous windows ---- */
  const hora = await (await get(`/v1/hora?date=2026-07-19&${DELHI}`)).json();
  check("hora count = 12", hora.count === 12);
  for (let i = 0; i < hora.horas.length; i++) {
    const h = hora.horas[i];
    check(`hora ${i + 1} from < to`, Date.parse(h.from) < Date.parse(h.to));
    if (i > 0) check(`hora ${i + 1} contiguous`, hora.horas[i - 1].to === h.from);
  }

  /* ---- 8. Panchaka windows non-overlapping ---- */
  const pk = await (await get(`/v1/panchaka?date=2026-07-19&${DELHI}`)).json();
  const wins = pk.panchakaWindows || [];
  for (let i = 1; i < wins.length; i++) {
    check(`panchaka window ${i} starts after prev`, Date.parse(wins[i].from) >= Date.parse(wins[i - 1].to));
  }
  for (const l of pk.lagnaSchedule || []) {
    check(`lagna ${l.sign} from < to`, Date.parse(l.from) < Date.parse(l.to));
  }

  /* ---- 9. Multi-city parity spot checks (engine agreement) ---- */
  const cities = [
    { name: "Delhi", q: DELHI },
    { name: "Chennai", q: "lat=13.08&lon=80.27&tz=Asia/Kolkata" },
    { name: "London", q: "lat=51.51&lon=-0.13&tz=Europe/London" },
    { name: "NewYork", q: "lat=40.71&lon=-74.01&tz=America/New_York" },
    { name: "Sydney", q: "lat=-33.87&lon=151.21&tz=Australia/Sydney" },
  ];
  for (const c of cities) {
    const r = await (await get(`/v1/panchang?date=2026-07-19&${c.q}`)).json();
    check(`${c.name} panchang 200 shape`, r.version === "v1" && r.panchang?.tithi?.length > 0);
    const rahu = r.panchang?.inauspicious?.rahuKalam;
    if (rahu) check(`${c.name} rahu from < to`, Date.parse(rahu.from) < Date.parse(rahu.to));
  }

  /* ---- 10. Determinism across cities ---- */
  const d1 = await (await get(`/v1/panchang?date=2026-07-19&${DELHI}`)).json();
  const d2 = await (await get(`/v1/panchang?date=2026-07-19&${DELHI}`)).json();
  check("Delhi byte-identical", JSON.stringify(d1) === JSON.stringify(d2));

  /* ---- 11. Security headers ---- */
  const hdr = await get(`/v1/panchang?date=2026-07-19&${DELHI}`);
  check("nosniff", hdr.headers.get("x-content-type-options") === "nosniff");
  check("no x-powered-by", hdr.headers.get("x-powered-by") === null);
  check("no-store", hdr.headers.get("cache-control") === "no-store");

  /* ---- 12. CORS: v1 GET from browser origin ---- */
  const preflight = await fetch(`${BASE}/v1/panchang?date=2026-07-19&${DELHI}`, {
    method: "OPTIONS",
    headers: {
      Origin: "http://localhost:5173",
      "Access-Control-Request-Method": "GET",
      "Access-Control-Request-Headers": "x-api-key",
    },
  });
  const allowMethods = preflight.headers.get("access-control-allow-methods") || "";
  const allowHeaders = preflight.headers.get("access-control-allow-headers") || "";
  check("v1 preflight allows GET", preflight.status === 204 && allowMethods.includes("GET"), `methods ${allowMethods}`);
  check("v1 preflight allows x-api-key", allowHeaders.toLowerCase().includes("x-api-key"), `headers ${allowHeaders}`);

  const cors = await fetch(`${BASE}/v1/panchang?date=2026-07-19&${DELHI}`, {
    headers: { "x-api-key": KEY_A, Origin: "http://localhost:5173" },
  });
  check("v1 GET with allowed origin succeeds", cors.status === 200);
  const acao = cors.headers.get("access-control-allow-origin");
  check("v1 CORS allow-origin present for browser", acao === "http://localhost:5173" || acao === "*",
    `got ${acao}`);

  /* ---- 13. OpenAPI path parity ---- */
  const spec = await (await fetch(`${BASE}/v1/openapi.json`)).json();
  const documented = Object.keys(spec.paths || {});
  const implemented = ["/v1/", "/v1/me", "/v1/panchang", "/v1/festivals", "/v1/muhurat", "/v1/hora", "/v1/panchaka"];
  for (const p of implemented) check(`OpenAPI documents ${p}`, documented.includes(p));
  check("OpenAPI 3.1", spec.openapi === "3.1.0");

} finally {
  child.kill("SIGTERM");
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log("\nFailed:");
  for (const f of failed) console.log(`  - ${f.name}${f.detail ? `: ${f.detail}` : ""}`);
}
process.exit(failed.length ? 1 : 0);
