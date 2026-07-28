import { SIGNS } from "./panchang";
import { computeKundli } from "./kundli";

export const MANGAL_DOSHA_HOUSES = [1, 2, 4, 7, 8, 12];

const REF_LABELS = {
  lagna: { en: "Lagna", hi: "लग्न" },
  moon: { en: "Moon", hi: "चन्द्र" },
  venus: { en: "Venus", hi: "शुक्र" },
} as const;

const TRADITION_SPECIFIC_EXCEPTIONS = {
  2: [2, 5],
  4: [0, 7],
  7: [3, 9],
  8: [8, 11],
  12: [1, 6],
};

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
    if (counted && (jupiter.sign === mars.sign || jupiterDistance === 7)) mitigations.push("jupiterSupport");
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
  };
}
