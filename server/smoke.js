/* Smoke test for the Ganak proxy.
   Starts the server on a spare port and checks that each guard actually rejects what
   it claims to reject. Needs no Anthropic key: every case here is refused before the
   upstream call, so the suite costs nothing to run and is safe in CI.

   Run:  npm run smoke   (from server/) */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.SMOKE_PORT || "3199";
const BASE = `http://127.0.0.1:${PORT}`;
const SECRET = "smoke-secret";

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "  ok  " : "FAIL  "}${name}${detail ? ` — ${detail}` : ""}`);
};

const post = (body, headers = {}) =>
  fetch(`${BASE}/api/explain`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

async function waitForServer(attempts = 50) {
  for (let i = 0; i < attempts; i++) {
    try {
      const r = await fetch(`${BASE}/health`);
      if (r.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}

const child = spawn(process.execPath, [path.join(here, "index.js")], {
  env: {
    ...process.env,
    PORT,
    HOST: "127.0.0.1",
    ANTHROPIC_API_KEY: "",           // deliberately unset: nothing should reach Anthropic
    API_SHARED_SECRET: SECRET,
    ALLOWED_ORIGINS: "http://localhost:5173",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
child.stdout.on("data", () => {});
child.stderr.on("data", () => {});

try {
  if (!(await waitForServer())) {
    console.error("server did not start");
    process.exit(1);
  }

  // health
  const health = await fetch(`${BASE}/health`);
  const healthBody = await health.json();
  check("health responds 200", health.status === 200, `status ${health.status}`);
  check("health reports missing key, not the key", healthBody.explainConfigured === false && !JSON.stringify(healthBody).includes(SECRET));

  // shared secret
  const noKey = await post({ prompt: "hello" });
  check("rejects a missing shared secret", noKey.status === 401, `status ${noKey.status}`);
  const wrongKey = await post({ prompt: "hello" }, { "x-ganak-key": "wrong-secret!" });
  check("rejects a wrong shared secret", wrongKey.status === 401, `status ${wrongKey.status}`);

  const auth = { "x-ganak-key": SECRET };

  // input validation (all past the secret gate)
  const empty = await post({ prompt: "   " }, auth);
  check("rejects an empty prompt", empty.status === 400, `status ${empty.status}`);
  const longPrompt = await post({ prompt: "x".repeat(12_001) }, auth);
  check("rejects an over-long prompt", longPrompt.status === 400, `status ${longPrompt.status}`);
  const badLang = await post({ prompt: "hi", language: "fr" }, auth);
  check("rejects an unsupported language", badLang.status === 400, `status ${badLang.status}`);
  const notJson = await post("{ this is not json", auth);
  check("rejects malformed JSON", notJson.status === 400, `status ${notJson.status}`);
  const huge = await post({ prompt: "x", context: "y".repeat(70_000) }, auth);
  check("rejects an oversized body", huge.status === 413, `status ${huge.status}`);

  // no key configured -> refuses before calling upstream
  const noUpstream = await post({ prompt: "explain this" }, auth);
  const noUpstreamBody = await noUpstream.json();
  check("refuses cleanly when no API key is set", noUpstream.status === 503 && noUpstreamBody.code === "SERVICE_NOT_CONFIGURED", `status ${noUpstream.status}`);

  // errors never leak internals
  const leak = JSON.stringify(noUpstreamBody) + JSON.stringify(await (await post({ prompt: "" }, auth)).json());
  check("errors leak no key, stack trace or upstream detail",
    !leak.includes(SECRET) && !leak.includes("api.anthropic.com") && !/\bat \w+ \(/.test(leak));

  // cors
  const badOrigin = await post({ prompt: "hi" }, { ...auth, Origin: "https://evil.example" });
  check("blocks a disallowed browser origin", badOrigin.status === 403, `status ${badOrigin.status}`);

  // unknown route
  const missing = await fetch(`${BASE}/api/nope`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
  check("unknown route returns a JSON 404", missing.status === 404);

  // security headers
  const h = await fetch(`${BASE}/health`);
  check("sets nosniff + no-store", h.headers.get("x-content-type-options") === "nosniff" && h.headers.get("cache-control") === "no-store");
  check("hides the express fingerprint", h.headers.get("x-powered-by") === null);
} finally {
  child.kill("SIGTERM");
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
