/* Production smoke for the deployed Ganak public API.
   Usage:
     GANAK_API_BASE_URL=https://ganak-api.onrender.com \
     GANAK_API_KEY=your-key \
     node scripts/dev-api-production-smoke.mjs */

const BASE = (process.env.GANAK_API_BASE_URL || "").replace(/\/$/, "");
const KEY = process.env.GANAK_API_KEY || "";
const DELHI = "lat=28.61&lon=77.21&tz=Asia/Kolkata";

if (!BASE || !KEY) {
  console.error("Set GANAK_API_BASE_URL and GANAK_API_KEY");
  process.exit(1);
}

const results = [];
const check = (name, pass, detail = "") => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "  ok  " : "FAIL  "}${name}${detail ? ` — ${detail}` : ""}`);
};

const get = (path_, key = KEY) =>
  fetch(`${BASE}${path_}`, { headers: { "x-api-key": key } });

const health = await fetch(`${BASE}/health`);
const healthBody = await health.json().catch(() => ({}));
check("GET /health → 200", health.status === 200, `status ${health.status}`);
check("health has no secret fields", !("apiKey" in healthBody) && !("key" in healthBody));

const spec = await fetch(`${BASE}/v1/openapi.json`);
check("GET /v1/openapi.json public", spec.status === 200);

const unauth = await fetch(`${BASE}/v1/panchang?date=2026-07-19&${DELHI}`);
check("missing key → 401", unauth.status === 401);

const me = await (await get("/v1/me")).json();
check("/v1/me shape", me.version === "v1" && typeof me.quota?.remaining === "number");
const me2 = await (await get("/v1/me")).json();
check("/v1/me does not consume quota", me.quota.used === me2.quota.used,
  `before ${me.quota.used} after ${me2.quota.used}`);

const pan = await get(`/v1/panchang?date=2026-07-19&${DELHI}`);
const panBody = await pan.json();
check("panchang 200 + versioned", pan.status === 200 && panBody.version === "v1");
check("panchang tithi present", Array.isArray(panBody.panchang?.tithi) && panBody.panchang.tithi.length > 0);
check("quota headers present", pan.headers.get("x-quota-remaining") !== null);

const bad = await get(`/v1/panchang?date=bad&${DELHI}`);
const beforeBadMe = await (await get("/v1/me")).json();
await get(`/v1/panchang?date=not-a-date&${DELHI}`);
const afterBadMe = await (await get("/v1/me")).json();
check("validation failure does not consume quota", beforeBadMe.quota.used === afterBadMe.quota.used,
  `before ${beforeBadMe.quota.used} after ${afterBadMe.quota.used}; first bad status ${bad.status}`);

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} production checks passed`);
process.exit(failed.length ? 1 : 0);
