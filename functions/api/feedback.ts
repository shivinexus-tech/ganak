// Cloudflare Pages Function: POST /api/feedback
// Anonymous feedback (incl. aarti corrections) -> Supabase `feedback` table via the service key.
// Guardrails: no PII, no birth data; service key is server-only (env), never in the client bundle.

const KINDS = new Set(['aarti_correction', 'general']);
const str = (v: unknown, max: number): string | null =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null;

export function buildFeedbackRow(body: any):
  | { ok: true; row: Record<string, unknown> }
  | { ok: false; error: string; spam?: boolean } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'bad body' };
  if (str((body as any).hp, 200)) return { ok: false, error: 'spam', spam: true }; // honeypot
  const suggestion = typeof (body as any).suggestion === 'string' ? (body as any).suggestion.trim() : '';
  if (suggestion.length < 5) return { ok: false, error: 'suggestion too short' };
  if (suggestion.length > 2000) return { ok: false, error: 'suggestion too long' };
  const kind = KINDS.has((body as any).kind) ? (body as any).kind : 'general';
  return {
    ok: true,
    row: {
      kind,
      slug: str((body as any).slug, 120),
      lang: str((body as any).lang, 8),
      flagged_text: str((body as any).flagged_text, 2000),
      suggestion,
      route: str((body as any).route, 200),
      app_version: str((body as any).app_version, 40),
    },
  };
}

interface Env { SUPABASE_URL: string; SUPABASE_SERVICE_KEY: string; }
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  let body: unknown;
  try { body = await request.json(); } catch { return new Response('{"ok":false}', { status: 400, headers: JSON_HEADERS }); }

  const built = buildFeedbackRow(body);
  if (!built.ok) {
    // Honeypot spam: pretend success so bots get no signal; store nothing.
    if ((built as any).spam) return new Response('{"ok":true}', { status: 200, headers: JSON_HEADERS });
    return new Response('{"ok":false}', { status: 400, headers: JSON_HEADERS });
  }
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
    // Safe no-op until the owner creates the project + sets secrets.
    return new Response('{"ok":false,"error":"not configured"}', { status: 503, headers: JSON_HEADERS });
  }
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/feedback`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(built.row),
  });
  if (!res.ok) return new Response('{"ok":false}', { status: 502, headers: JSON_HEADERS });
  return new Response('{"ok":true}', { status: 200, headers: JSON_HEADERS });
};
