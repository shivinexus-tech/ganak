// Regional katha format: "Region — narrative body" in each language.
// Used by VratVidhiCard for labelled devotional story blocks.

export const katha = (regionEn, regionHi, bodyEn, bodyHi) => ({
  en: `${regionEn} — ${bodyEn}`,
  hi: `${regionHi} — ${bodyHi}`,
});

const SEP = " — ";

export function parseKathaLine(text) {
  const i = text.indexOf(SEP);
  if (i < 0) return { region: null, body: text };
  return { region: text.slice(0, i).trim(), body: text.slice(i + SEP.length).trim() };
}
