import React from "react";

/* South-Indian chart — signs are FIXED in a 4×4 grid; planets sit in their sign's
   cell; the ascendant cell is marked with a corner wedge. Houses are implicit
   (counted from the lagna). Sign-fixed counterpart to the North diamond. */

/* sign (0=Aries … 11=Pisces) → grid cell (0..15, row-major in a 4×4). The four
   centre cells (5,6,9,10) are the empty title panel. This is the canonical
   South-Indian arrangement (Pisces top-left, going clockwise). */
export const SOUTH_SIGN_CELL = [1, 2, 3, 7, 11, 15, 14, 13, 12, 8, 4, 0];

function SouthChart({ title, ascSign, planets = [], showDeg, lagnaLabel = "LAGNA", gold, ivory, muted, sindoor }) {
  const S = 100; // cell size in a 400×400 box
  const cellXY = (cell) => ({ x: (cell % 4) * S, y: Math.floor(cell / 4) * S });
  const fmtDeg = (d) => { let deg = Math.floor(d); let m = Math.round((d - deg) * 60); if (m === 60) { m = 0; deg += 1; } return `${deg}°${String(m).padStart(2, "0")}′`; };

  return (
    <div style={{ textAlign: "center" }}>
      <svg viewBox="0 0 400 400" style={{ width: "100%", maxWidth: 400 }}>
        {/* outer + grid */}
        <rect x="0" y="0" width="400" height="400" fill="#FFFDF7" stroke={gold} strokeWidth="2" />
        {[1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <line x1={i * S} y1="0" x2={i * S} y2="400" stroke={muted} strokeWidth="0.75" opacity="0.5" />
            <line x1="0" y1={i * S} x2="400" y2={i * S} stroke={muted} strokeWidth="0.75" opacity="0.5" />
          </React.Fragment>
        ))}
        {/* centre title panel (cells 5,6,9,10) */}
        <rect x={S} y={S} width={2 * S} height={2 * S} fill="none" stroke={gold} strokeWidth="0.75" opacity="0.4" />

        {Array.from({ length: 12 }, (_, sign) => {
          const cell = SOUTH_SIGN_CELL[sign];
          const { x, y } = cellXY(cell);
          const here = planets.filter((p) => p.sign === sign);
          const isLagna = sign === ascSign;
          return (
            <g key={sign}>
              {isLagna && (
                // corner wedge marking the ascendant's sign
                <path d={`M ${x} ${y} L ${x + 26} ${y} L ${x} ${y + 26} Z`} fill={gold} opacity="0.9" />
              )}
              {/* rashi number, top-left */}
              <text x={x + 5} y={y + 14} fontSize="10" fill={isLagna ? "#FFFFFF" : muted} fontFamily="Spectral, serif">{sign + 1}</text>
              {/* planets */}
              {here.map((p, i) => (
                <text key={p.label + i} x={x + S / 2} y={y + 30 + i * 15} textAnchor="middle" fontSize="12.5"
                  fill={p.retro ? sindoor : ivory} fontFamily="Eczar, serif">
                  {p.label}{p.retro ? "℞" : ""}{showDeg && p.deg != null ? ` ${fmtDeg(p.deg)}` : ""}
                </text>
              ))}
            </g>
          );
        })}
        {/* centre label (reference point; matches the North chart's lagnaLabel) */}
        <text x="200" y="205" textAnchor="middle" fontSize="13" fill={gold} fontFamily="Eczar, serif" letterSpacing="0.12em">{lagnaLabel}</text>
      </svg>
      <div style={{ fontSize: 11.5, letterSpacing: "0.18em", color: muted, marginTop: 8, textTransform: "uppercase", overflowWrap: "anywhere", padding: "0 8px" }}>{title}</div>
    </div>
  );
}

export default SouthChart;
export { SouthChart };
