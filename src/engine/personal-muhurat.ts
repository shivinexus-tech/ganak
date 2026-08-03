/* -------------------------------------------------------------------------
   Birth-chart-personalised Muhurat — v1 overlay engine (P0-MUHURAT-FULL-PARITY).

   A PURE OVERLAY on the general finder. It never edits or re-implements
   muhurat.ts; it takes the finder's own day rows and the user's natal anchors
   and returns a personal fit, then partitions/ranks the days.

   Method (all reused, already-shipped maths):
     - Tarabala   (taraBala,   daily-windows.ts) — HARD filter. Avoid taras 1/3/5/7
                    (Janma/Vipat/Pratyak/Vadha) from the birth star.
     - Chandrabala(chandraBala, daily-windows.ts) — HARD filter. Day Moon-sign strength
                    from the birth Moon-sign, waxing/waning aware.
     - Moon Bhinnashtakavarga (computeAshtakavarga via computeKundli) — SOFT. The day's
                    transit Moon-sign bindu count ranks days; it never removes one.
     - Adhanadi special nakshatras {1,10,16,18,22,25} from Janma — SOFT, labelled caution.
                    A day is KEPT and MARKED, never removed. The source hunt was negative
                    (documented for transit/gochara, not muhurta election), so it must not
                    act as a cut. See docs/superpowers/specs/2026-07-25-personal-muhurat-design.md §3.1.

   Only the two sourced hard filters (Tarabala AND Chandrabala) decide `coreOk`, i.e. whether
   a day survives. Lahiri ayanamsa throughout (project invariant), mirroring the finder.

   Written untyped to match the sibling engines (muhurat.ts, medical-muhurat.ts).
   ------------------------------------------------------------------------- */

import { rev } from "./ephemeris";
import { setAyanMode, zoneOffset, moonSidMs, sunSidMs } from "./panchang";
import { taraBala, chandraBala } from "./daily-windows";
import { computeKundli } from "./kundli";

const _NW = 360 / 27;

/* Adhanadi special-nakshatra ordinals (counted from Janma) → key. Vainasika pinned to the
   22nd (owner 2026-07-25, most-attested). Soft caution only. */
const SPECIAL_ORD: { [k: number]: string } = {
  1: "janma", 10: "karma", 16: "sanghatika", 18: "samudayika", 22: "vainasika", 25: "manasa",
};

/* Natal anchors from birth date/time/place. janmaNak/janmaSign come from the birth Moon
   (a whole-sign/whole-nakshatra property — the birth instant is what matters). moonBav is
   the Moon's Bhinnashtakavarga (12 signs, always sums to 49), read from the full chart. */
function natalAnchors(place: any, ayanamsa: any, birth: any) {
  setAyanMode(ayanamsa || "lahiri");
  const tz = zoneOffset(place.zone, birth.y, birth.m, birth.day) ?? 5.5;
  const ms = Date.UTC(birth.y, birth.m - 1, birth.day, birth.hh || 0, birth.mi || 0) - tz * 3600000;
  const moonLon = moonSidMs(ms);
  const janmaNak = Math.floor(moonLon / _NW);
  const janmaSign = Math.floor(moonLon / 30);
  let moonBav: number[] | null = null;
  try {
    const k = computeKundli({ y: birth.y, m: birth.m, day: birth.day, hh: birth.hh || 0, mi: birth.mi || 0, tz, lat: place.lat, lon: place.lon, ayanamsa: ayanamsa || "lahiri" });
    if (k && k.av && Array.isArray(k.av.bav?.Moon)) moonBav = k.av.bav.Moon;
  } catch (e) { moonBav = null; }
  return { janmaNak, janmaSign, moonBav };
}

/* Bucket a Moon-bindu count (0..8) into a 1..4 strength (the ●●●○ dots). */
function strengthOf(bindu: number | null) {
  if (bindu == null) return null;
  if (bindu <= 1) return 1;
  if (bindu <= 3) return 2;
  if (bindu <= 5) return 3;
  return 4;
}

/* Personal fit for one finder day. `day` supplies at least { rise } (finder rows also carry
   nak/tn); everything is recomputed from `rise` so it stays consistent with the finder,
   which is Lahiri. Returns the two hard-filter verdicts (feed coreOk), the soft strength,
   and the soft Adhanadi caution. */
function personalFit(anchors: any, day: any) {
  const rise = day.rise;
  const moonLon = moonSidMs(rise);
  const moonNak = Math.floor(moonLon / _NW);
  const moonSign = Math.floor(moonLon / 30);
  const waxing = (day.tn != null ? day.tn : Math.floor(rev(moonLon - sunSidMs(rise)) / 12)) < 15;

  const jn = anchors.janmaNak, js = anchors.janmaSign;

  const tRow = (jn >= 0 && jn <= 26) ? taraBala(moonNak)[jn] : null;
  const tara = tRow ? tRow.tara : null;
  const taraGood = tRow ? !!tRow.good : false;

  const cRow = (js >= 0 && js <= 11) ? chandraBala(moonSign, waxing)[js] : null;
  const chandraGood = cRow ? !!cRow.good : false;

  const special = (jn >= 0 && jn <= 26) ? ((moonNak - jn) % 27 + 27) % 27 + 1 : null;
  const specialName = (special != null && SPECIAL_ORD[special]) ? SPECIAL_ORD[special] : null;
  const specialCaution = specialName != null;

  const moonBindu = (Array.isArray(anchors.moonBav)) ? anchors.moonBav[moonSign] : null;
  const strength = strengthOf(moonBindu);

  const coreOk = taraGood && chandraGood; // the two SOURCED hard filters only

  return { moonNak, moonSign, tara, taraGood, chandraGood, special, specialName, specialCaution, moonBindu, strength, coreOk };
}

/* Partition + rank a list of finder days by natal fit.
   - "filter" mode: remove !coreOk days (Tarabala/Chandrabala only), rank survivors by
     Moon bindus (then the finder's own score). Strength and the Adhanadi caution NEVER
     remove a day.
   - "annotate" mode: if fewer than 3 days survive the hard cut, keep every candidate day
     (marked, none set aside) so the user is never stranded. */
function applyPersonalisation(days: any[], anchors: any) {
  const scored = days.map((d) => ({ ...d, fit: personalFit(anchors, d) }));
  const survivors = scored.filter((d) => d.fit.coreOk);
  if (survivors.length < 3) {
    return { mode: "annotate", kept: scored, setAside: [] };
  }
  const setAside = scored.filter((d) => !d.fit.coreOk);
  /* Ranking priority (owner decision 2026-08-02): the finder's own muhurat QUALITY leads;
     the personal Ashtakavarga strength only breaks ties between equally-good days.
     Sorting by bindus first promoted days the finder itself labels "Better avoided" above
     "Highly auspicious" ones — across 20 test charts, 30% got the wrong day in the
     "Best day" card. Personalisation orders good days; it must never make a worse day
     outrank a better one. */
  const kept = survivors.slice().sort(
    (a, b) => (b.score || 0) - (a.score || 0) || (b.fit.moonBindu || 0) - (a.fit.moonBindu || 0) || a.rise - b.rise
  );
  return { mode: "filter", kept, setAside };
}

export { natalAnchors, personalFit, applyPersonalisation, SPECIAL_ORD };
