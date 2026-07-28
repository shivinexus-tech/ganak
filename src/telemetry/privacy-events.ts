const ENDPOINT = String(import.meta.env?.VITE_ANALYTICS_ENDPOINT || "").trim();
const ALLOWED = new Set(["page_view", "muhurat_search", "muhurat_share", "muhurat_export", "feedback_sent"]);

export function privacyEvent(name, props = {}) {
  if (!ENDPOINT || !ALLOWED.has(name) || typeof fetch !== "function") return;
  const safe = {};
  for (const [key, value] of Object.entries(props)) {
    if (!["area", "action", "language", "outcome"].includes(key)) continue;
    safe[key] = String(value).slice(0, 40);
  }
  try {
    void fetch(ENDPOINT, {
      method: "POST",
      credentials: "omit",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, props: safe }),
    }).catch(() => {});
  } catch (e) {}
}

export const ANALYTICS_EVENT_DICTIONARY = Object.freeze({
  page_view: ["area", "language"],
  muhurat_search: ["action", "language", "outcome"],
  muhurat_share: ["action", "language"],
  muhurat_export: ["action", "language"],
  feedback_sent: ["area", "language", "outcome"],
});
