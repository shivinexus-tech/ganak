/* Special lagnas, sensitive points & upagrahas (SPLIT-UI-JYOTISH-01e). */

import { rev, ascendantAt } from "./ephemeris";
import { SIGN_LORD, sunSidMs } from "./panchang";
import { nakLordOf } from "./dasha";

const INDU_KALA = { Sun: 30, Moon: 16, Mars: 6, Mercury: 8, Jupiter: 10, Venus: 12, Saturn: 1 };
/* special lagnas, sensitive points & upagrahas */
function computeSpecialPoints(ctx) {
  const { asc, sun, moon, rahu, ascSign, birthMs, tz, lat, lon, ayan, rise, set, JD } = ctx;
  const moonSign = Math.floor(moon / 30);
  const isDay = rise != null && birthMs >= rise && birthMs < set;
  const ghatis = rise != null ? (birthMs - rise) / (24 * 60000) : 0; // 1 ghati = 24 min
  const sunriseSunLon = rise != null ? sunSidMs(rise) : sun;

  const bhava = rev(sunriseSunLon + (ghatis / 5) * 30);
  const hora = rev(sunriseSunLon + (ghatis / 2.5) * 30);
  const ghati = rev(sunriseSunLon + ghatis * 30);
  const fracNak = (moon % (360 / 27)) / (360 / 27);
  const sree = rev(asc + fracNak * 360);

  const diff = rev(rahu - moon);
  const bhrigu = diff > 180 ? rev(moon - (360 - diff) / 2) : rev(moon + diff / 2);
  const yogiPt = rev(sun + moon + 93.3333);
  const avayogiPt = rev(yogiPt + 186.6667);
  const fortuna = rev(asc + moon - sun);

  const l9L = SIGN_LORD[(ascSign + 8) % 12], l9M = SIGN_LORD[(moonSign + 8) % 12];
  let isum = (INDU_KALA[l9L] + INDU_KALA[l9M]) % 12; if (isum === 0) isum = 12;
  const induSign = (moonSign + isum - 1) % 12;

  const dhuma = rev(sun + 133.3333), vyati = rev(360 - dhuma), pari = rev(vyati + 180),
        indra = rev(360 - pari), upaketu = rev(indra + 16.6667);

  // Gulika: ascendant at the start of Saturn's eighth of the day (or night)
  let gulika = null;
  if (rise != null) {
    const dayLen = set - rise, nightLen = 24 * 3600000 - dayLen;
    /* Bug bash F12. Gulika is a VARA construction — the weekday's eight parts, day
       and night — and a vara begins at SUNRISE, not at midnight. This line used the
       civil weekday alone, so every birth between midnight and sunrise ran Gulika on
       tomorrow's weekday while the SAME chart's Ruling Planets (kundli.ts) ran on the
       correct sunrise-reckoned vara, and the page printed both. Delhi 2026-08-18
       03:00 IST: Ruling Planets said Monday/Moon, Gulika said Tuesday/Mars, and
       Gulika landed at Aquarius 1°30′ instead of Aquarius 29°36′.
       The night branch below already picks the PREVIOUS evening's sunset for such a
       birth, i.e. it already treats the night as the previous vara's night — the
       weekday it counted the parts from was the only thing left uncorrected. Same
       one-line correction as src/engine/kundli.ts, so one vara serves one chart. */
    let dow = new Date(birthMs + tz * 3600000).getUTCDay(); // 0=Sun
    if (birthMs < rise) dow = (dow + 6) % 7;                // before sunrise the previous vara still runs
    let gMs;
    if (isDay) {
      const i = ((6 - dow) % 7 + 7) % 7;       // Saturn's part index 0..6 within the day
      gMs = rise + (i / 8) * dayLen;
    } else {
      const nightStartLord = (dow + 4) % 7;     // night begins with lord of 5th weekday
      const i = ((6 - nightStartLord) % 7 + 7) % 7;
      const nightStart = birthMs >= set ? set : set - 24 * 3600000;
      gMs = nightStart + (i / 8) * nightLen;
    }
    gulika = ascendantAt(gMs / 86400000 + 2440587.5, lat, lon, ayan);
  }

  return {
    lagnas: [
      { k: "Bhava Lagna", v: bhava, note: "body & vitality through the day" },
      { k: "Hora Lagna", v: hora, note: "wealth & resources" },
      { k: "Ghati Lagna", v: ghati, note: "power, status & authority" },
      { k: "Sree Lagna", v: sree, note: "prosperity & Lakshmi's grace" },
    ],
    points: [
      { k: "Bhrigu Bindu", v: bhrigu, note: "the destiny point — karmic focus" },
      { k: "Yogi Point", v: yogiPt, pl: nakLordOf(yogiPt), note: "the benefic Yogi & its planet" },
      { k: "Avayogi Point", v: avayogiPt, pl: nakLordOf(avayogiPt), note: "the testing Avayogi & its planet" },
      { k: "Fortuna", v: fortuna, note: "Pars Fortunae — fortune & flow" },
    ],
    induSign,
    upagrahas: [
      ...(gulika != null ? [{ k: "Gulika / Mandi", v: gulika, note: "Saturn's shadow — sensitive, malefic" }] : []),
      { k: "Dhuma", v: dhuma, note: "smoke — obstacles" },
      { k: "Vyatipata", v: vyati, note: "calamity point" },
      { k: "Parivesha", v: pari, note: "halo — intensity" },
      { k: "Indrachapa", v: indra, note: "rainbow — fortune" },
      { k: "Upaketu", v: upaketu, note: "comet — sudden change" },
    ],
  };
}


export { computeSpecialPoints, INDU_KALA };
