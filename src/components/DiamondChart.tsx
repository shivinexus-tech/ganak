import React from "react";

/* North Indian diamond chart SVG — pure extraction (SPLIT-UI-CHART-01a).
   Wire deferred until Chart lane; shell still hosts a copy until then. */

/* ---------------- North Indian chart SVG ---------------- */
/* num: rashi number at the house's innermost corner (authentic placement —
   houses 1/4/7/10 cluster around the bindu, the rest around the four crossings).
   pc: planet cluster centroid. tight: narrow side triangle → 2 glyphs per row. */
const HOUSES_NI = [
  { num: [200, 186], pc: [200, 94] },
  { num: [100, 86],  pc: [100, 42] },
  { num: [85, 104],  pc: [46, 98],  tight: true },
  { num: [182, 204], pc: [92, 200] },
  { num: [85, 306],  pc: [46, 300], tight: true },
  { num: [100, 322], pc: [100, 360] },
  { num: [200, 222], pc: [200, 312] },
  { num: [300, 322], pc: [300, 360] },
  { num: [315, 306], pc: [354, 300], tight: true },
  { num: [218, 204], pc: [308, 200] },
  { num: [315, 104], pc: [354, 98],  tight: true },
  { num: [300, 86],  pc: [300, 42] },
];

function DiamondChart({ title, ascSign, houseOfPlanet, showDeg, lagnaLabel = "LAGNA", gold, ivory, muted, sindoor }) {
  const byHouse = Array.from({ length: 12 }, () => []);
  houseOfPlanet.forEach((p) => byHouse[p.house - 1].push(p));
  return (
    <div style={{ textAlign: "center" }}>
      <svg viewBox="-14 -14 428 428" style={{ width: "100%", maxWidth: 400 }}>
        <defs>
          <radialGradient id="chartbg" cx="50%" cy="42%" r="75%">
            <stop offset="0%" stopColor="#FFF8E9" />
            <stop offset="100%" stopColor="#F7EDD7" />
          </radialGradient>
          <radialGradient id="lagnaGlow" cx="50%" cy="50%" r="62%">
            <stop offset="0%" stopColor={gold} stopOpacity="0.20" />
            <stop offset="100%" stopColor={gold} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* parchment of night: vignette + outer hairline frame */}
        <rect x="0" y="0" width="400" height="400" fill="url(#chartbg)" />
        <rect x="-9" y="-9" width="418" height="418" fill="none" stroke={gold} strokeOpacity="0.35" strokeWidth="0.8" />
        {[[-9, -9], [409, -9], [-9, 409], [409, 409]].map(([x, y], i) => (
          <rect key={i} x={x - 3.5} y={y - 3.5} width="7" height="7" fill={gold} transform={`rotate(45 ${x} ${y})`} />
        ))}

        <polygon points="200,0 300,100 200,200 100,100" fill="url(#lagnaGlow)" />

        {/* frame, diagonals, inner diamond */}
        <polyline points="0,0 400,0 400,400 0,400 0,0" fill="none" stroke={gold} strokeWidth="1.8" className="drawline" />
        <line x1="0" y1="0" x2="400" y2="400" stroke={gold} strokeWidth="1.1" strokeOpacity="0.9" className="drawline" />
        <line x1="400" y1="0" x2="0" y2="400" stroke={gold} strokeWidth="1.1" strokeOpacity="0.9" className="drawline" />
        <polyline points="200,0 400,200 200,400 0,200 200,0" fill="none" stroke={gold} strokeWidth="1.1" strokeOpacity="0.9" className="drawline" />
        <circle cx="200" cy="200" r="2.4" fill={gold} />

        {HOUSES_NI.map((g, h) => {
          const sign = ((ascSign + h) % 12) + 1;
          const planets = byHouse[h];
          const per = g.tight || showDeg ? 2 : 3;
          const rows = [];
          for (let i = 0; i < planets.length; i += per) rows.push(planets.slice(i, i + per));
          return (
            <g key={h}>
              <text x={g.num[0]} y={g.num[1]} textAnchor="middle" dominantBaseline="middle"
                fontSize="11.5" fill={gold} fillOpacity="0.85" fontFamily="Eczar, serif">{sign}</text>
              {rows.map((row, ri) => (
                <text key={ri} x={g.pc[0]} y={g.pc[1] + ri * 15 - (rows.length - 1) * 7.5}
                  textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="600"
                  fontFamily="Spectral, serif" style={{ letterSpacing: ".02em" }}>
                  {row.map((p, pi) => (
                    <tspan key={pi}>
                      {pi > 0 && <tspan> </tspan>}
                      <tspan fill={p.color || ivory}>{p.label}</tspan>
                      {p.retro && <tspan fill={sindoor} fontSize="9.5">℞</tspan>}
                      {showDeg && p.deg !== undefined && <tspan fill={muted} fontSize="8.5"> {Math.floor(p.deg)}°</tspan>}
                    </tspan>
                  ))}
                </text>
              ))}
              {h === 0 && (
                <text x="200" y="26" textAnchor="middle" fontSize="9" fill={gold} fillOpacity="0.8"
                  letterSpacing="3" fontFamily="Spectral, serif">{lagnaLabel}</text>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ fontSize: 11.5, letterSpacing: "0.18em", color: muted, marginTop: 8, textTransform: "uppercase", overflowWrap: "anywhere", padding: "0 8px" }}>{title}</div>
    </div>
  );
}



export default DiamondChart;
export { DiamondChart, HOUSES_NI };
