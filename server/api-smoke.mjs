/* Contract, security and quota tests for the public API.

   Runs the real server over real HTTP. No Anthropic key needed — v1 is pure local
   computation, so this suite is free to run and safe in CI.

   Run:  npm run smoke:api   (from server/) */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.API_SMOKE_PORT || "3211";
const BASE = `http://127.0.0.1:${PORT}`;
const KEY = "smoke-key-alpha";
const SMALL = "smoke-key-tiny";     // quota of 2, to prove quotas actually bite
const DELHI = "lat=28.61&lon=77.21&tz=Asia/Kolkata";

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass });
  console.log(`${pass ? "  ok  " : "FAIL  "}${name}${detail ? ` — ${detail}` : ""}`);
};

const get = (path_, key = KEY) =>
  fetch(`${BASE}${path_}`, { headers: key ? { "x-api-key": key } : {} });

async function waitForServer(attempts = 60) {
  for (let i = 0; i < attempts; i++) {
    try { if ((await fetch(`${BASE}/health`)).ok) return true; } catch { /* not up */ }
    await new Promise((r) => setTimeout(r, 150));
  }
  return false;
}

const child = spawn(process.execPath, [path.join(here, "index.js")], {
  env: {
    ...process.env,
    PORT, HOST: "127.0.0.1",
    ANTHROPIC_API_KEY: "",
    API_KEYS: JSON.stringify([
      { key: KEY, name: "smoke", quotaPerDay: 500 },
      { key: SMALL, name: "tiny", quotaPerDay: 2 },
    ]),
    API_RATE_PER_MIN: "500",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
child.stdout.on("data", () => {});
child.stderr.on("data", () => {});

try {
  if (!(await waitForServer())) { console.error("server did not start"); process.exit(1); }

  /* ---- auth ---- */
  check("rejects a missing API key", (await get("/v1/panchang?date=2026-07-19&" + DELHI, null)).status === 401);
  check("rejects a wrong API key", (await get("/v1/panchang?date=2026-07-19&" + DELHI, "not-a-key")).status === 401);
  const unauth = await (await get("/v1/panchang?date=2026-07-19&" + DELHI, "not-a-key")).json();
  check("auth failure uses the standard error shape", unauth.code === "UNAUTHORISED" && typeof unauth.error === "string");
  check("auth failure never echoes the supplied key", !JSON.stringify(unauth).includes("not-a-key"));

  /* ---- spec is public, data is not ---- */
  const spec = await fetch(`${BASE}/v1/openapi.json`);
  const specBody = await spec.json();
  check("openapi.json is reachable without a key", spec.status === 200);
  check("openapi declares the apiKey scheme", specBody?.components?.securitySchemes?.ApiKeyAuth?.name === "x-api-key");

  /* ---- every documented path answers ---- */
  const documented = Object.keys(specBody.paths || {});
  const sample = {
    "/v1/": "/v1/",
    "/v1/me": "/v1/me",
    "/v1/panchang": `/v1/panchang?date=2026-07-19&${DELHI}`,
    "/v1/festivals": `/v1/festivals?from=2026-07-19&days=15&${DELHI}`,
    "/v1/muhurat": `/v1/muhurat?date=2026-07-19&${DELHI}`,
    "/v1/hora": `/v1/hora?date=2026-07-19&${DELHI}`,
    "/v1/panchaka": `/v1/panchaka?date=2026-07-19&${DELHI}`,
  };
  for (const p of documented) {
    if (!sample[p]) { check(`documented path ${p} has a smoke sample`, false, "no sample defined"); continue; }
    const r = await get(sample[p]);
    check(`${p} answers 200`, r.status === 200, `status ${r.status}`);
  }

  /* ---- contract: the published shape ---- */
  const pan = await (await get(`/v1/panchang?date=2026-07-19&${DELHI}`)).json();
  check("panchang is versioned", pan.version === "v1");
  check("panchang echoes the query", pan.query?.date === "2026-07-19" && pan.query?.tz === "Asia/Kolkata");
  check("panchang has tithi/nakshatra/yoga/karana", ["tithi", "nakshatra", "yoga", "karana"].every((k) => Array.isArray(pan.panchang?.[k]) && pan.panchang[k].length));
  check("panchang instants are ISO 8601, not epoch ms",
    typeof pan.panchang?.sun?.rise === "string" && /^\d{4}-\d{2}-\d{2}T.*Z$/.test(pan.panchang.sun.rise));
  check("panchang windows use {from,to}",
    pan.panchang?.inauspicious?.rahuKalam && "from" in pan.panchang.inauspicious.rahuKalam && "to" in pan.panchang.inauspicious.rahuKalam);
  check("panchang leaks no engine internals",
    !("tithis" in (pan.panchang || {})) && !("yogasP" in (pan.panchang || {})) && !("choghaDay" in (pan.panchang || {})));

  const fest = await (await get(`/v1/festivals?from=2026-07-19&days=30&${DELHI}`)).json();
  check("festivals returns observances with type + decidingKala",
    Array.isArray(fest.observances) && fest.observances.length > 0
    && fest.observances.every((o) => (o.type === "fast" || o.type === "festival") && "decidingKala" in o));
  check("festivals are sorted ascending",
    fest.observances.every((o, i, a) => i === 0 || a[i - 1].at <= o.at));

  const hora = await (await get(`/v1/hora?date=2026-07-19&${DELHI}`)).json();
  check("hora returns 12 windows with a planet", hora.count === 12 && hora.horas.every((h) => h.planet && h.from && h.to));

  const pk = await (await get(`/v1/panchaka?date=2026-07-19&${DELHI}`)).json();
  check("panchaka resolves sign names, not indexes",
    Array.isArray(pk.lagnaSchedule) && pk.lagnaSchedule.length > 0
    && pk.lagnaSchedule.every((l) => typeof l.sign === "string" && l.sign.length > 1));

  /* determinism — a published API that wobbles is not cacheable */
  const a = await (await get(`/v1/panchang?date=2026-07-19&${DELHI}`)).json();
  const b = await (await get(`/v1/panchang?date=2026-07-19&${DELHI}`)).json();
  check("identical inputs give identical output", JSON.stringify(a) === JSON.stringify(b));

  /* ---- validation ---- */
  const cases = [
    [`/v1/panchang?${DELHI}`, "MISSING_DATE"],
    [`/v1/panchang?date=19-07-2026&${DELHI}`, "INVALID_DATE"],
    [`/v1/panchang?date=2026-02-30&${DELHI}`, "INVALID_DATE"],
    [`/v1/panchang?date=1700-01-01&${DELHI}`, "DATE_OUT_OF_RANGE"],
    ["/v1/panchang?date=2026-07-19", "MISSING_PLACE"],
    ["/v1/panchang?date=2026-07-19&lat=99&lon=77", "INVALID_LAT"],
    ["/v1/panchang?date=2026-07-19&lat=28&lon=999", "INVALID_LON"],
    ["/v1/panchang?date=2026-07-19&lat=28&lon=77&tz=Not/AZone", "INVALID_TZ"],
    [`/v1/panchang?date=2026-07-19&${DELHI}&ayanamsa=raman`, "INVALID_AYANAMSA"],
    [`/v1/festivals?from=2026-07-19&days=9999&${DELHI}`, "DAYS_OUT_OF_RANGE"],
    [`/v1/muhurat?from=2026-07-19&to=2026-07-01&activity=wedding&${DELHI}`, "INVALID_RANGE"],
  ];
  for (const [url, code] of cases) {
    const r = await get(url);
    const body = await r.json();
    check(`${code} rejected with 400`, r.status === 400 && body.code === code, `got ${r.status}/${body.code}`);
  }

  /* ---- errors never leak ---- */
  const bad = await (await get(`/v1/panchang?date=2026-02-30&${DELHI}`)).json();
  check("errors carry no stack frames or paths",
    !/\bat \w+ \(/.test(JSON.stringify(bad)) && !JSON.stringify(bad).includes("/Users/"));

  const missing = await get("/v1/does-not-exist");
  check("unknown v1 path is a JSON 404", missing.status === 404 && (await missing.json()).code === "NOT_FOUND");

  /* ---- quota actually bites ---- */
  const q1 = await get(`/v1/panchang?date=2026-07-19&${DELHI}`, SMALL);
  check("quota headers are present", q1.headers.get("x-quota-limit") === "2" && q1.headers.get("x-quota-remaining") !== null);
  await get(`/v1/panchang?date=2026-07-19&${DELHI}`, SMALL);          // 2nd of 2
  const q3 = await get(`/v1/panchang?date=2026-07-19&${DELHI}`, SMALL); // over
  const q3body = await q3.json();
  check("quota exhaustion returns 429 QUOTA_EXCEEDED", q3.status === 429 && q3body.code === "QUOTA_EXCEEDED", `status ${q3.status}`);
  check("quota exhaustion sets Retry-After", q3.headers.get("retry-after") !== null);
  check("a different key is unaffected by another key's quota",
    (await get(`/v1/panchang?date=2026-07-19&${DELHI}`, KEY)).status === 200);

  /* ---- /v1/me ---- */
  const me = await (await get("/v1/me")).json();
  check("/v1/me reports quota without exposing the key",
    me.key?.name === "smoke" && typeof me.key?.fingerprint === "string"
    && !JSON.stringify(me).includes(KEY) && typeof me.quota?.remaining === "number");

  const meQuotaBefore = me.quota?.used ?? 0;
  for (let i = 0; i < 3; i++) await get("/v1/me");
  const meQuotaAfter = (await (await get("/v1/me")).json()).quota?.used ?? 0;
  check("/v1/me does not consume quota", meQuotaBefore === meQuotaAfter, `before ${meQuotaBefore} after ${meQuotaAfter}`);

  const badQuotaBefore = (await (await get("/v1/me", SMALL)).json()).quota?.used ?? 0;
  await get(`/v1/panchang?date=not-a-date&${DELHI}`, SMALL);
  const badQuotaAfter = (await (await get("/v1/me", SMALL)).json()).quota?.used ?? 0;
  check("validation failure does not consume quota", badQuotaBefore === badQuotaAfter,
    `before ${badQuotaBefore} after ${badQuotaAfter}`);

  /* ---- CORS for browser integrators ---- */
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

  /* ---- headers ---- */
  const h = await get(`/v1/panchang?date=2026-07-19&${DELHI}`);
  check("v1 sets nosniff and no-store", h.headers.get("x-content-type-options") === "nosniff" && h.headers.get("cache-control") === "no-store");
  check("v1 hides the express fingerprint", h.headers.get("x-powered-by") === null);
} finally {
  child.kill("SIGTERM");
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) console.log("failed: " + failed.map((f) => f.name).join(" | "));
process.exit(failed.length ? 1 : 0);
