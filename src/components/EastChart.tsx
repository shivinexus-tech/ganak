import React from "react";

/* East-Indian (Bengali) chart — sign-fixed like the South chart, but Aries sits at
   the TOP-CENTRE and the signs run ANTI-CLOCKWISE, drawn in the Bengali
   diamond-in-square geometry (outer square + both diagonals + inner diamond).
   Confirmed convention: Rashi-centric, Mesha top-centre, counting anti-clockwise. */

/* Per-sign compartment polygons (0=Aries … 11=Pisces) in a 400×400 box, and the
   centroid where that sign's number + planets are drawn. Order below already walks
   anti-clockwise from the top-centre, so index === sign. */
const V = {
  TL: [0, 0], TR: [400, 0], BR: [400, 400], BL: [0, 400],
  T: [200, 0], R: [400, 200], B: [200, 400], L: [0, 200], O: [200, 200],
  mLT: [100, 100], mTR: [300, 100], mRB: [300, 300], mBL: [100, 300],
};
export const EAST_SIGNS = [
  { poly: [V.T, V.mTR, V.O, V.mLT], c: [200, 105] },   // 0 Aries — top-centre
  { poly: [V.TL, V.T, V.mLT], c: [110, 40] },          // 1 Taurus
  { poly: [V.TL, V.mLT, V.L], c: [40, 110] },          // 2 Gemini
  { poly: [V.mLT, V.O, V.mBL, V.L], c: [95, 200] },    // 3 Cancer — left-centre
  { poly: [V.BL, V.mBL, V.L], c: [40, 290] },          // 4 Leo
  { poly: [V.BL, V.B, V.mBL], c: [110, 360] },         // 5 Virgo
  { poly: [V.O, V.mRB, V.B, V.mBL], c: [200, 300] },   // 6 Libra — bottom-centre
  { poly: [V.BR, V.mRB, V.B], c: [290, 360] },         // 7 Scorpio
  { poly: [V.BR, V.R, V.mRB], c: [360, 290] },         // 8 Sagittarius
  { poly: [V.mTR, V.R, V.mRB, V.O], c: [305, 200] },   // 9 Capricorn — right-centre
  { poly: [V.TR, V.mTR, V.R], c: [360, 110] },         // 10 Aquarius
  { poly: [V.TR, V.T, V.mTR], c: [290, 40] },          // 11 Pisces
];

function EastChart({ title, ascSign, planets = [], showDeg, lagnaLabel = "LAGNA", gold, ivory, muted, sindoor }) {
  const fmtDeg = (d) => { let deg = Math.floor(d); let m = Math.round((d - deg) * 60); if (m === 60) { m = 0; deg += 1; } return `${deg}°${String(m).padStart(2, "0")}′`; };
  const pts = (poly) => poly.map((p) => p.join(",")).join(" ");

  return (
    <div style={{ textAlign: "center" }}>
      <svg viewBox="0 0 400 400" style={{ width: "100%", maxWidth: 400 }}>
        <rect x="0" y="0" width="400" height="400" fill="#FFFDF7" stroke={gold} strokeWidth="2" />
        {/* lagna compartment tint (drawn first, under the frame lines) */}
        {ascSign != null && <polygon points={pts(EAST_SIGNS[ascSign].poly)} fill={gold} opacity="0.12" />}
        {/* frame: diamond + both diagonals */}
        <polygon points={`${V.T} ${V.R} ${V.B} ${V.L}`} fill="none" stroke={muted} strokeWidth="0.75" opacity="0.6" />
        <line x1="0" y1="0" x2="400" y2="400" stroke={muted} strokeWidth="0.75" opacity="0.6" />
        <line x1="400" y1="0" x2="0" y2="400" stroke={muted} strokeWidth="0.75" opacity="0.6" />

        {EAST_SIGNS.map((cell, sign) => {
          const [cx, cy] = cell.c;
          const here = planets.filter((p) => p.sign === sign);
          const isLagna = sign === ascSign;
          const n = here.length;
          return (
            <g key={sign}>
              {/* rashi number just above the cluster */}
              <text x={cx} y={cy - n * 6 - 2} textAnchor="middle" fontSize="9" fill={isLagna ? gold : muted} fontFamily="Spectral, serif">{sign + 1}</text>
              {here.map((p, i) => (
                <text key={p.label + i} x={cx} y={cy + 6 + (i - (n - 1) / 2) * 12} textAnchor="middle" fontSize="10.5"
                  fill={p.retro ? sindoor : ivory} fontFamily="Eczar, serif">
                  {p.label}{p.retro ? "℞" : ""}{showDeg && p.deg != null ? ` ${fmtDeg(p.deg)}` : ""}
                </text>
              ))}
            </g>
          );
        })}
        {/* centre reference label sits in the tiny gap around O; keep it subtle */}
        <text x="200" y="200" textAnchor="middle" fontSize="8.5" fill={gold} fontFamily="Eczar, serif" letterSpacing="0.08em" opacity="0.9">{lagnaLabel}</text>
      </svg>
      <div style={{ fontSize: 11.5, letterSpacing: "0.18em", color: muted, marginTop: 8, textTransform: "uppercase", overflowWrap: "anywhere", padding: "0 8px" }}>{title}</div>
    </div>
  );
}

export default EastChart;
export { EastChart };
