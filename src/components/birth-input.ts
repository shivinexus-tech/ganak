/* Shared birth-input guards — ONE vocabulary for every screen that asks for a
   birth date and time.

   WHY THIS FILE EXISTS
   The utility-calculator screen was fixed on 2026-08-18 (bug bash F9) after it
   was found accepting 29 February in a non-leap year, silently normalising it to
   1 March, and then answering with confidence on a birth date the reader never
   gave. The same three holes were still open on the three screens a practitioner
   actually works in — the birth chart, kundali matching and birth-time
   rectification — each with its own vaguer wording:

     · 29 February 1990 cast a full chart FOR 1 MARCH 1990, while the report
       header printed "1990-02-29". Two different birthdays on one page.
     · Year 999 or 9999 answered from an ephemeris whose ΔT polynomials only run
       1800–2150 (src/engine/ephemeris.ts) — outside it the code falls back to a
       crude parabola.
     · 24:00 was read as 00:00 of the next day, moving the ascendant a whole sign.
     · A half-typed date ("1990-06") crashed matching and rectification to the
       error boundary, and made the chart screen blame the TIMEZONE.

   AGENTS.md: errors must surface visibly in the UI, and the user must always be
   able to tell what the app is doing. So: name the field that is wrong, say why,
   and never correct a birth date on the reader's behalf.

   The messages here are the calculator screen's own words, lifted verbatim so the
   app speaks with one voice. Screens supply the FIELD NAME (`Bi`) — which is how
   a two-person screen says whose birth detail is at fault. */

import { zoneOffset } from "../engine/panchang";

export type Bi = { en: string; hi: string };

/* Not a round number chosen for looks: the span over which src/engine/ephemeris.ts
   has real ΔT polynomial fits. Widening it is a product call, not a code call. */
export const YEAR_MIN = 1800, YEAR_MAX = 2150;

const MONTH_HI = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितम्बर", "अक्टूबर", "नवम्बर", "दिसम्बर"];
const MONTH_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
export const daysInMonth = (y: number, m: number) => [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];

/* The field names every screen shares. A screen with two people, or a date that
   is not a birth date (a date of passing, a check date), declares its own. */
export const F_BIRTH_DATE: Bi = { en: "the date of birth", hi: "जन्म तिथि" };
export const F_BIRTH_TIME: Bi = { en: "the time of birth", hi: "जन्म समय" };

export function dateProblem(raw: string, f: Bi): Bi | null {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(raw ?? "").trim());
  if (!m) return { en: `Enter ${f.en} in full — year, month and day.`, hi: `${f.hi} पूरी भरें — वर्ष, मास और दिन।` };
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  if (mo < 1 || mo > 12) return { en: `${f.en} has month ${mo}, and there are only 12 months.`, hi: `${f.hi} में मास ${mo} है, जबकि मास केवल 12 होते हैं।` };
  if (y < YEAR_MIN || y > YEAR_MAX) return {
    en: `${f.en} is in ${y}. Ganak calculates planetary positions for ${YEAR_MIN}–${YEAR_MAX}; outside that range the answer would not be trustworthy, so nothing was calculated.`,
    hi: `${f.hi} ${y} की है। गणक ग्रह-स्थिति ${YEAR_MIN}–${YEAR_MAX} के लिए निकालता है; इससे बाहर उत्तर भरोसेमंद नहीं होगा, इसलिए गणना नहीं की गई।`,
  };
  if (d < 1 || d > daysInMonth(y, mo)) return {
    en: `${MONTH_EN[mo - 1]} ${y} has ${daysInMonth(y, mo)} days, so ${d} ${MONTH_EN[mo - 1]} ${y} is not a real date. Ganak will not move it to the next day for you — please correct ${f.en}.`,
    hi: `${MONTH_HI[mo - 1]} ${y} में ${daysInMonth(y, mo)} दिन होते हैं, इसलिए ${d} ${MONTH_HI[mo - 1]} ${y} कोई वास्तविक तिथि नहीं है। गणक इसे स्वयं अगले दिन नहीं बदलेगा — कृपया ${f.hi} ठीक करें।`,
  };
  return null;
}

export function timeProblem(raw: string, f: Bi): Bi | null {
  const m = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(String(raw ?? "").trim());
  if (!m) return { en: `Enter ${f.en} as hours and minutes on a 24-hour clock.`, hi: `${f.hi} 24-घंटे की घड़ी में घंटा और मिनट के रूप में भरें।` };
  const hh = Number(m[1]), mi = Number(m[2]);
  if (hh > 23) return { en: `${f.en} reads ${String(hh).padStart(2, "0")}:${m[2]}. A day ends at 23:59 — midnight is 00:00 of the next day.`, hi: `${f.hi} ${String(hh).padStart(2, "0")}:${m[2]} है। दिन 23:59 पर समाप्त होता है — मध्यरात्रि अगले दिन की 00:00 है।` };
  if (mi > 59) return { en: `${f.en} reads ${m[1]}:${m[2]}. An hour has 60 minutes.`, hi: `${f.hi} ${m[1]}:${m[2]} है। एक घंटे में 60 मिनट होते हैं।` };
  return null;
}

/* The one string a screen shows. English field names start lowercase so they read
   correctly mid-sentence ("please correct the date of birth"); at the head of the
   message the sentence is capitalised here rather than in each screen. */
export function fieldMessage(p: Bi, hi: boolean): string {
  const m = hi ? p.hi : p.en;
  return hi ? m : m.charAt(0).toUpperCase() + m.slice(1);
}

/* Convenience for a screen that checks a date and a time together and wants the
   FIRST field at fault — date before time, so the reader fixes them in reading
   order instead of being sent back and forth. */
export function birthProblem(date: string, time: string, fDate: Bi, fTime: Bi): Bi | null {
  return dateProblem(date, fDate) || timeProblem(time, fTime);
}

/* ---------------------------------------------------------------- birth TIMEZONE
   The fourth birth input, and the only one that had no guard at all on the
   matching screen: `zoneOffset(place.zone, ...) ?? 5.5` (bug bash 2026-08-18, F6).
   Two ways a real reader reaches that fallback:

     · the online geocoder returns a place with no timezone — src/data/places.ts
       maps it to `zone: null` — so a Kundali match for a New York birth was
       computed on Indian Standard Time, silently, and the PDF said nothing;
     · a place object with no `zone` key at all. This one is worse than IST:
       `Intl.DateTimeFormat` reads `timeZone: undefined` as "not supplied" and
       answers with the READER'S OWN device zone, so the same two birth records
       would score differently on a phone in Delhi and a laptop in California.

   AGENTS.md: silent failure is unacceptable, and a wrong offset is a wrong chart —
   it moves the Moon's pada, and the pada is what every nakshatra koota is scored
   from. So resolution is either a number or a refusal, never a default.

   The BIRTH CLOCK, not just the birth date, picks the side of a daylight-saving
   transition; `zoneOffset` is hour-aware, so it is handed the clock the reader
   typed. src/screens/UtilityCalculatorScreen.tsx still carries its own private
   copy of this (`resolveZone`); adopting this one is a one-line follow-up recorded
   in plans/audits/2026-08-18-matching-remainder-fix.md. */
export function resolveBirthZone(place: any, date: string, time: string): number | null {
  const [y, m, d] = String(date ?? "").split("-").map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  const [hh, mi] = String(time ?? "").split(":").map(Number);
  const zone = typeof place?.zone === "string" ? place.zone.trim() : "";
  if (!zone) return null;
  const off = Number.isFinite(hh) && Number.isFinite(mi)
    ? zoneOffset(zone, y, m, d, hh, mi)
    : zoneOffset(zone, y, m, d);
  return typeof off === "number" && Number.isFinite(off) ? off : null;
}

/* The message shown when resolution refuses. `whose` lets a two-person screen say
   which of the two places is at fault, the way its date and time messages already do. */
export function zoneMessage(place: any, hi: boolean, whose?: Bi): string {
  const named = place?.label ? String(place.label) : (hi ? "इस स्थान" : "this place");
  const zone = place?.zone ? String(place.zone) : "\u2014";
  const owner = whose ? (hi ? `${whose.hi} — ` : `${whose.en} — `) : "";
  return hi
    ? `${owner}${named} का समय-क्षेत्र (${zone}) गणक पहचान नहीं सका, इसलिए कुछ भी गणना नहीं की गई — गलत समय-क्षेत्र से कुंडली गलत बनती है। कृपया यह स्थान सुझावों में से फिर चुनें।`
    : `${owner}Ganak could not recognise the timezone of ${named} (${zone}), so nothing was calculated — a wrong timezone gives a wrong chart. Please pick that place again from the suggestions.`;
}

/* The offset actually used, so the reader can see which clock the answer was built
   on. Same shape the calculator screen prints. */
export function offsetLabel(tz: number): string {
  const sign = tz < 0 ? "\u2212" : "+";
  const a = Math.abs(tz), h = Math.floor(a), mi = Math.round((a - h) * 60);
  return `UTC${sign}${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
}
