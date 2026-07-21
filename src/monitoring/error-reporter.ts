/* Privacy-safe client error reporter.
 *
 * Why not a full Sentry package: those SDKs often use banned browser storage
 * APIs and session tooling we do not want. Ganak sends only crash payloads,
 * via fetch, with no cookies and no on-device preference store.
 *
 * Enable by setting VITE_SENTRY_DSN at build time (Cloudflare Pages env).
 * Without a DSN the reporter is a no-op (local/dev stay quiet).
 */

const RELEASE = "ganak@0.0.1";
const MIN_INTERVAL_MS = 8000;
const RAW_DSN = import.meta.env.VITE_SENTRY_DSN;
let lastSentAt = 0;
let installed = false;

function parseDsn(raw) {
  if (!raw || typeof raw !== "string") return null;
  try {
    const u = new URL(raw.trim());
    const publicKey = decodeURIComponent(u.username || "");
    const projectId = u.pathname.replace(/^\//, "").split("/")[0] || "";
    if (!publicKey || !u.host || !projectId) return null;
    return { publicKey, host: u.host, projectId };
  } catch (e) {
    return null;
  }
}

function dsnFromEnv() {
  // This direct reference is intentional: Vite can only inline build-time
  // variables it can see statically. Hiding import.meta.env inside Function()
  // leaves production monitoring permanently disabled.
  return parseDsn(RAW_DSN);
}

function eventId() {
  const hex = [];
  for (let i = 0; i < 16; i++) hex.push(((Math.random() * 256) | 0).toString(16).padStart(2, "0"));
  return hex.join("");
}

function safePath() {
  try {
    // Path only — never query string (prefs are fine, but share codes must not leak).
    return (typeof location !== "undefined" ? location.origin + location.pathname : "") || "";
  } catch (e) {
    return "";
  }
}

function normalizeError(err) {
  if (err && typeof err === "object" && "message" in err) {
    return {
      type: String(err.name || "Error"),
      value: String(err.message || err).slice(0, 500),
      stack: typeof err.stack === "string" ? err.stack.slice(0, 4000) : undefined,
    };
  }
  return { type: "Error", value: String(err).slice(0, 500) };
}

/** Send a crash report. Never throws. No-ops without DSN or when rate-limited. */
export function reportClientError(err, ctx) {
  const dsn = dsnFromEnv();
  if (!dsn) return;
  const now = Date.now();
  if (now - lastSentAt < MIN_INTERVAL_MS) return;
  lastSentAt = now;

  const n = normalizeError(err);
  const source = (ctx && ctx.source) || "client";
  const componentStack = ctx && ctx.componentStack;
  const payload = {
    event_id: eventId(),
    timestamp: new Date().toISOString(),
    platform: "javascript",
    level: "error",
    release: RELEASE,
    environment: "production",
    exception: {
      values: [
        {
          type: n.type,
          value: n.value,
          stacktrace: n.stack
            ? {
                frames: n.stack
                  .split("\n")
                  .slice(0, 40)
                  .map((line) => ({ filename: "app", function: line.trim().slice(0, 200) })),
              }
            : undefined,
        },
      ],
    },
    request: { url: safePath(), headers: {} },
    tags: { source: String(source).slice(0, 40) },
    extra: componentStack
      ? { componentStack: String(componentStack).slice(0, 2000) }
      : undefined,
  };

  const url =
    "https://" + dsn.host + "/api/" + dsn.projectId + "/store/" +
    "?sentry_version=7&sentry_key=" + encodeURIComponent(dsn.publicKey) +
    "&sentry_client=ganak-lite%2F0.1";

  try {
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      mode: "cors",
      credentials: "omit",
      keepalive: true,
    }).catch(function () {});
  } catch (e) {
    /* never throw from the reporter */
  }
}

/** Install once: window error + unhandledrejection → report. */
export function installGlobalErrorReporting() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", function (ev) {
    const err = ev.error || new Error(ev.message || "window.error");
    reportClientError(err, { source: "window.error" });
  });

  window.addEventListener("unhandledrejection", function (ev) {
    reportClientError(ev.reason, { source: "unhandledrejection" });
  });
}
