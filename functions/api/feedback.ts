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
