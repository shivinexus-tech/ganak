import { SIGNS } from "./panchang";
import { computeKundli } from "./kundli";

export const MANGAL_DOSHA_HOUSES = [1, 2, 4, 7, 8, 12];

const REF_LABELS = {
  lagna: { en: "Lagna", hi: "लग्न" },
  moon: { en: "Moon", hi: "चन्द्र" },
  venus: { en: "Venus", hi: "शुक्र" },
} as const;

/* House → the signs in which Mars sitting there is treated as an exception by some
   traditions. The 1st-house row was missing: every published version of this list
   opens with Mars in its own sign in the Lagna, and Ganak's table jumped straight
   to the 2nd (bug bash 2026-08-18, F19). The outcome does not move — those signs
   are already caught by the own/exalted branch below — but a method table that is
   published on the page must match the method it claims. */
export const TRADITION_SPECIFIC_EXCEPTIONS = {
  1: [0, 7],
  2: [2, 5],
  4: [0, 7],
  7: [3, 9],
  8: [8, 11],
  12: [1, 6],
};

/* Jupiter's drishti. Jupiter casts a FULL aspect on the 5th, 7th and 9th from
   itself — Ganak's own bhava.ts scores exactly that (frac 60 at hp 5, 7 and 9) —
   but this file credited the 7th alone, so two of Jupiter's three full aspects
   were invisible and the dosha's `strength` was reported higher than the stated
   method warrants, on a page about someone's marriage (bug bash F19). Kept as a
   named constant so the next reader can see it is the classical set, not a guess. */
export const JUPITER_FULL_ASPECTS = [5, 7, 9];

function houseFrom(sign: number, refSign: number) {
  return ((sign - refSign + 12) % 12) + 1;
}

export function mangalDoshaReport(input) {
  const chart = computeKundli({ ...input, ayanamsa: "lahiri" });
  const mars = chart.rows.find((p: any) => p.name === "Mars")!;
  const jupiter = chart.rows.find((p: any) => p.name === "Jupiter")!;
  const refs = [
    { key: "lagna", sign: chart.ascSign },
    { key: "moon", sign: chart.moon.sign },
    { key: "venus", sign: chart.rows.find((p: any) => p.name === "Venus")!.sign },
  ].map((ref) => {
    const house = houseFrom(mars.sign, ref.sign);
    const counted = (MANGAL_DOSHA_HOUSES as readonly number[]).includes(house);
    const mitigations: string[] = [];
    if (counted && [0, 7, 9].includes(mars.sign)) mitigations.push("ownOrExalted");
    const jupiterDistance = houseFrom(jupiter.sign, mars.sign);
    if (counted && (jupiter.sign === mars.sign || JUPITER_FULL_ASPECTS.includes(jupiterDistance))) mitigations.push("jupiterSupport");
    if (counted && TRADITION_SPECIFIC_EXCEPTIONS[house]?.includes(mars.sign)) mitigations.push("traditionSpecific");
    return {
      ...ref,
      labelEn: REF_LABELS[ref.key as keyof typeof REF_LABELS].en,
      labelHi: REF_LABELS[ref.key as keyof typeof REF_LABELS].hi,
      house,
      counted,
      mitigations,
      meaningKey: counted ? house : null,
    };
  });
  const rawCount = refs.filter((r) => r.counted).length;
  const mitigationCount = refs.reduce((n, r) => n + (r.mitigations.length ? 1 : 0), 0);
  const adjustedScore = Math.max(0, rawCount - Math.min(rawCount, mitigationCount) * 0.5);
  const strength = rawCount === 0 ? "none" : adjustedScore >= 2.5 ? "strong" : adjustedScore >= 1.5 ? "moderate" : "limited";
  const present = rawCount > 0;
  return {
    present,
    strength,
    refs,
    rawCount,
    mitigationCount,
    adjustedScore,
    marsSign: SIGNS[mars.sign],
    marsSignIndex: mars.sign,
    jupiterSign: SIGNS[jupiter.sign],
    dignity: [0, 7, 9].includes(mars.sign)
      ? "Mars is in its own or exaltation sign; some traditions treat this as mitigation, not automatic cancellation."
      : null,
    methodKey: "mars-1-2-4-7-8-12-from-lagna-moon-venus",
    jupiterAspects: JUPITER_FULL_ASPECTS,
  };
}
