/* KP horary number method (1–249) — pure number→lagna mapping.
   K.S. Krishnamurti's horary system: a sincere number 1–249 fixes the Prashna
   ascendant at the START degree of a fixed zodiac sub-segment; the existing
   time/place judgment machinery then takes over unchanged.

   Sourcing: primary text is KP Reader VI (Horary Astrology); the 1–249 sub
   scheme derives from the Vimshottari sub theory (Reader II). See
   plans/prashna-249-ksk-verify.md for the citation index and the standing
   web-corroboration disclaimer shown in the UI.

   This module is PURE: no time, no place, no ephemeris — just the number map.
   It reuses VIM_LORDS / VIM_YEARS from dasha.ts so the 249 subdivision can
   never drift from the KP sub-lord chain used everywhere else. */

import { VIM_LORDS, VIM_YEARS } from "./dasha";

export const KP_NUMBER_MIN = 1;
export const KP_NUMBER_MAX = 249;

/* Build the canonical 1–249 sub table in integer arcseconds, splitting a sub
   wherever it straddles a 30° rashi boundary. A full nakshatra (13°20′) spans
   48000″; a sub of `yrs` Vimshottari years spans yrs/120 × 48000″ = yrs × 400″.
   The six straddling subs become two rows each → exactly 249 rows. */
type KpRow = { from: number; to: number; star: string; sub: string; nak: number };

function buildKpSubTable(): KpRow[] {
  const rows: KpRow[] = [];
  let cursor = 0; // arcsec from 0° Aries
  for (let nak = 0; nak < 27; nak++) {
    const star = VIM_LORDS[nak % 9];
    const startIdx = VIM_LORDS.indexOf(star);
    for (let s = 0; s < 9; s++) {
      const sub = VIM_LORDS[(startIdx + s) % 9];
      let span = VIM_YEARS[sub] * 400; // arcsec
      while (span > 0) {
        const signEdge = (Math.floor(cursor / 108000) + 1) * 108000; // 30° = 108000″
        const take = Math.min(span, signEdge - cursor);
        rows.push({ from: cursor, to: cursor + take, star, sub, nak });
        cursor += take;
        span -= take;
      }
    }
  }
  return rows;
}

const KP_SUB_TABLE = buildKpSubTable();

const isValidNumber = (n: unknown): n is number =>
  typeof n === "number" && Number.isInteger(n) && n >= KP_NUMBER_MIN && n <= KP_NUMBER_MAX;

/* The sidereal longitude (degrees, 0–360) at which number `n` fixes the lagna.
   Returns null for anything that is not an integer 1–249. */
export function kpNumberToLagna(n: unknown): number | null {
  if (!isValidNumber(n)) return null;
  return KP_SUB_TABLE[n - 1].from / 3600;
}

export type KpNumberInfo = {
  number: number;
  lagnaDeg: number; // sidereal 0–360
  sign: number;     // 0 = Aries … 11 = Pisces
  signDeg: number;  // 0–30 within the sign
  starLord: string; // full planet name, e.g. "Sun"
  subLord: string;
  nakshatra: number; // 0–26
};

/* Full breakdown of what a number set, for the answer-card detail box. */
export function kpNumberInfo(n: unknown): KpNumberInfo | null {
  if (!isValidNumber(n)) return null;
  const row = KP_SUB_TABLE[n - 1];
  const lagnaDeg = row.from / 3600;
  return {
    number: n,
    lagnaDeg,
    sign: Math.floor(lagnaDeg / 30),
    signDeg: lagnaDeg % 30,
    starLord: row.star,
    subLord: row.sub,
    nakshatra: row.nak,
  };
}
