/* The public response shape.

   Deliberately NOT the engines' internal objects. Those are free to change whenever
   the app needs them to; a published API is a promise. Everything crossing the
   boundary is mapped here, so an internal rename can never silently break somebody's
   integration — it breaks a test in this file instead.

   Two conventions applied everywhere:
   - instants are ISO 8601 UTC strings, never raw epoch milliseconds
   - a window is { from, to }, never a bare pair */

export const API_VERSION = "v1";

const iso = (ms) => (Number.isFinite(ms) ? new Date(ms).toISOString() : null);

const window_ = (w) => (w && Number.isFinite(w.start) && Number.isFinite(w.end)
  ? { from: iso(w.start), to: iso(w.end) }
  : null);

const sequence = (arr) => (Array.isArray(arr) ? arr.map((x) => ({
  name: x.name,
  endsAt: iso(x.end),
})) : []);

/* GET /v1/panchang */
export function panchangResponse(p, query) {
  return {
    version: API_VERSION,
    query,
    panchang: {
      date: p.dateLabel ?? null,
      weekday: p.vara ?? null,
      paksha: p.paksha ?? null,
      tithi: sequence(p.tithis),
      nakshatra: sequence(p.naks),
      yoga: sequence(p.yogasP),
      karana: sequence(p.karanas),
      month: p.months ? {
        amanta: p.months.amanta ?? null,
        purnimanta: p.months.purnimanta ?? null,
        isAdhikMasa: Boolean(p.months.adhik),
      } : null,
      samvat: p.samvat ? {
        shaka: p.samvat.shaka ?? null,
        vikram: p.samvat.vikram ?? null,
        gujarati: p.samvat.guj ?? null,
      } : null,
      sun: { rise: iso(p.rise), set: iso(p.set), sign: p.sunSign ?? null },
      moon: { rise: iso(p.moonrise), set: iso(p.moonset), sign: p.moonSign ?? null },
      auspicious: { abhijitMuhurat: window_(p.abhijit) },
      inauspicious: {
        rahuKalam: window_(p.rahu),
        gulikaKalam: window_(p.gulika),
        yamaganda: window_(p.yama),
      },
      pitruPaksha: p.pitruPaksha ?? null,
    },
  };
}

/* GET /v1/festivals
   The engine returns { fasts: [...], festivals: [...] }, each entry being
   { key, ms, decidingKala }. Both lists are exposed, flattened into one array with an
   explicit `type`, because "is this a fast or a festival" is information a consumer
   needs and a nested shape only makes them merge it themselves.
   `decidingKala` is carried through deliberately: it is the day-part that determines
   the date, and omitting it would leave a consumer unable to explain why a date
   differs from another panchang. */
export function festivalsResponse(raw, query) {
  const entries = [
    ...(raw?.fasts || []).map((e) => ({ ...e, type: "fast" })),
    ...(raw?.festivals || []).map((e) => ({ ...e, type: "festival" })),
  ]
    .filter((e) => Number.isFinite(e.ms))
    .sort((a, b) => a.ms - b.ms);

  return {
    version: API_VERSION,
    query,
    count: entries.length,
    observances: entries.map((e) => ({
      key: e.key ?? null,
      type: e.type,
      date: iso(e.ms)?.slice(0, 10) ?? null,
      at: iso(e.ms),
      decidingKala: e.decidingKala ?? null,
    })),
  };
}

/* GET /v1/muhurat */
export function muhuratResponse(result, query) {
  const day = (d) => ({
    date: d.date ?? null,
    verdict: d.verdict ?? null,
    score: Number.isFinite(d.score) ? d.score : null,
    valid: Boolean(d.valid),
    reasons: Array.isArray(d.reasons) ? d.reasons : [],
    windows: Array.isArray(d.windows) ? d.windows.map(window_).filter(Boolean) : [],
  });
  return {
    version: API_VERSION,
    query,
    count: Array.isArray(result) ? result.length : (result?.days?.length ?? 0),
    days: Array.isArray(result) ? result.map(day) : (result?.days ?? []).map(day),
  };
}

/* GET /v1/hora — engine yields { ruler, start, end } */
export function horaResponse(slots, query) {
  return {
    version: API_VERSION,
    query,
    count: slots.length,
    horas: slots.map((s) => ({
      planet: s.ruler ?? null,
      from: iso(s.start),
      to: iso(s.end),
    })),
  };
}

/* GET /v1/panchaka
   `sign` arrives as a zodiac index; publishing a raw integer would make consumers
   hardcode our ordering, so it is resolved to a name here. */
export function panchakaResponse(data, query, signNames = []) {
  const signName = (i) => (Number.isInteger(i) && signNames[i] ? signNames[i] : null);
  return {
    version: API_VERSION,
    query,
    sunrise: iso(data?.rise),
    nextSunrise: iso(data?.nextRise),
    lagnaSchedule: (data?.lagnaSchedule || []).map((l) => ({
      sign: signName(l.sign),
      from: iso(l.start),
      to: iso(l.end),
      panchakaType: l.type ?? null,
      isAuspicious: Boolean(l.shubha),
    })),
    panchakaWindows: (data?.panchakaWindows || []).map((w) => ({
      type: w.type ?? null,
      from: iso(w.start),
      to: iso(w.end),
      isAuspicious: Boolean(w.shubha),
    })),
  };
}

export const isoOf = iso;
export const windowOf = window_;
