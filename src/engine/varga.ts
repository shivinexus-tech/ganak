/* Parashara varga (divisional chart) sign rules — shared by Shadbala and chart build. */

/* Parashara's division rules. L = sidereal longitude 0–360, returns sign index 0–11. */
function vargaSign(L, k) {
  const sign = Math.floor(L / 30);
  const deg = L - sign * 30;
  const odd = sign % 2 === 0;        // Aries, Gemini… are odd signs
  const mode = sign % 3;             // 0 movable, 1 fixed, 2 dual
  switch (k) {
    case "D1": return sign;
    case "D2": { const first = deg < 15; return (odd ? first : !first) ? 4 : 3; } // Sun's hora (Leo) / Moon's hora (Cancer)
    case "D3": return (sign + Math.floor(deg / 10) * 4) % 12;                      // 1st, 5th, 9th from the sign
    case "D4": return (sign + Math.floor(deg / 7.5) * 3) % 12;                     // 1st, 4th, 7th, 10th
    case "D5": { const seq = odd ? [0, 10, 8, 2, 6] : [6, 2, 8, 10, 0]; return seq[Math.floor(deg / 6)]; } // Mars, Saturn, Jupiter, Mercury, Venus lords
    case "D6": return Math.floor(L / 5) % 12;                                      // continuous from Aries
    case "D7": return (sign + (odd ? 0 : 6) + Math.floor(deg / (30 / 7))) % 12;    // odd from itself, even from 7th
    case "D8": return ([0, 8, 4][mode] + Math.floor(deg / 3.75)) % 12;             // movable→Aries, fixed→Sag, dual→Leo
    case "D9": return Math.floor(L / (10 / 3)) % 12;                               // continuous from Aries
    case "D10": return (sign + (odd ? 0 : 8) + Math.floor(deg / 3)) % 12;          // odd from itself, even from 9th
    case "D11": return (sign + 11 + Math.floor(deg / (30 / 11))) % 12;             // counted from the 12th sign therefrom
    case "D12": return (sign + Math.floor(deg / 2.5)) % 12;                        // from the sign itself
    case "D16": return ([0, 4, 8][mode] + Math.floor(deg / 1.875)) % 12;           // movable→Aries, fixed→Leo, dual→Sag
    case "D20": return ([0, 8, 4][mode] + Math.floor(deg / 1.5)) % 12;             // movable→Aries, fixed→Sag, dual→Leo
    case "D24": return ((odd ? 4 : 3) + Math.floor(deg / 1.25)) % 12;              // odd→Leo, even→Cancer
    case "D27": return Math.floor(L / (30 / 27)) % 12;                             // fiery→Aries, earthy→Cancer… (continuous)
    case "D30":                                                                    // unequal trimsamsa
      if (odd) return deg < 5 ? 0 : deg < 10 ? 10 : deg < 18 ? 8 : deg < 25 ? 2 : 6;
      return deg < 5 ? 1 : deg < 12 ? 5 : deg < 20 ? 11 : deg < 25 ? 9 : 7;
    case "D40": return ((odd ? 0 : 6) + Math.floor(deg / 0.75)) % 12;              // odd→Aries, even→Libra
    case "D45": return ([0, 4, 8][mode] + Math.floor(deg / (2 / 3))) % 12;         // movable→Aries, fixed→Leo, dual→Sag
    case "D60": return (sign + Math.floor(deg * 2)) % 12;                          // from the sign itself
    default: return sign;
  }
}

export { vargaSign };
