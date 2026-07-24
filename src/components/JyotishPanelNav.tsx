import React from "react";
import { T } from "./tokens";

const JYOTISH_GROUPS = [
  {
    key: "kundli",
    en: "Kundli",
    hi: "कुंडली",
    items: [
      ["#summary", "Summary", "सार"],
      ["#chart", "Charts", "वर्ग कुंडली"],
      ["#planets", "Grahas", "ग्रह"],
      ["#yogas", "Yogas", "योग"],
      ["#karakas", "Karakas", "कारक"],
      ["#special", "Special points", "विशेष बिंदु"],
      ["#chalit", "Bhava strength", "भाव बल"],
      ["#av", "Ashtakavarga", "अष्टकवर्ग"],
      ["#arudha", "Arudha", "आरूढ़"],
      ["#reading", "Reading", "फलादेश"],
    ],
  },
  {
    key: "dashas",
    en: "Dashas",
    hi: "दशा",
    items: [
      ["#dasha", "Vimshottari", "विंशोत्तरी"],
      ["#bnn", "BNN", "बीएनएन"],
      ["#bhrigu", "Bhrigu", "भृगु"],
    ],
  },
  {
    key: "matching",
    en: "Matching",
    hi: "मिलान",
    items: [["#match", "Kundli matching", "कुंडली मिलान"]],
  },
  {
    key: "tools",
    en: "Tools",
    hi: "उपकरण",
    items: [
      ["#kp", "KP sub-lords", "केपी उप-स्वामी"],
      ["#ksig", "KP significators", "केपी कारक"],
      ["#shadbala", "Shadbala", "षड्बल"],
      ["#rectify", "Birth-time correction", "जन्म-समय शोधन"],
    ],
  },
  {
    key: "vault",
    en: "Vault",
    hi: "सहेजी कुंडली",
    items: [["#vault", "Saved charts", "सहेजी कुंडलियाँ"]],
  },
];

function JyotishPanelNav({ lang, C }) {
  const hi = lang === "hi";
  return (
    <nav
      aria-label={hi ? "ज्योतिष अनुभाग" : "Jyotish sections"}
      className="rise"
      style={{
        position: "sticky",
        top: T.s2,
        zIndex: 30,
        display: "grid",
        gap: T.s2,
        padding: T.s3,
        margin: `0 0 ${T.s4}px`,
        background: "rgba(250,245,234,.96)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: `1px solid ${C.line}`,
        borderRadius: T.rLg,
        boxShadow: T.e2,
      }}
    >
      <div style={{ color: C.muted, fontSize: T.fSmall, lineHeight: 1.45 }}>
        {hi
          ? "पहले विषय चुनें, फिर उस गणना पर जाएँ जिसकी आपको आवश्यकता है।"
          : "Choose a subject first, then jump to the calculation you need."}
      </div>
      <div className="hscroll" style={{ display: "flex", gap: T.s2, overflowX: "auto" }}>
        {JYOTISH_GROUPS.map((group) => (
          <details key={group.key} style={{ flex: "0 0 auto", position: "relative" }}>
            <summary
              style={{
                minHeight: T.ctrlH,
                display: "flex",
                alignItems: "center",
                padding: `0 ${T.s4}px`,
                border: `1px solid ${C.line}`,
                borderRadius: T.rMd,
                background: C.panel,
                color: C.gold,
                cursor: "pointer",
                fontFamily: T.serif,
                fontSize: T.fBody,
                listStyle: "none",
              }}
            >
              {hi ? group.hi : group.en}
            </summary>
            <div
              style={{
                display: "grid",
                gap: T.s1,
                minWidth: 210,
                padding: T.s2,
                marginTop: T.s1,
                border: `1px solid ${C.line}`,
                borderRadius: T.rMd,
                background: C.panel,
                boxShadow: T.e3,
              }}
            >
              {group.items.map(([href, en, itemHi]) => (
                <a
                  key={href}
                  href={href}
                  style={{
                    minHeight: T.ctrlH,
                    display: "flex",
                    alignItems: "center",
                    padding: `0 ${T.s3}px`,
                    borderRadius: T.rSm,
                    color: C.ivory,
                    textDecoration: "none",
                    fontSize: T.fSmall,
                  }}
                >
                  {hi ? itemHi : en}
                </a>
              ))}
            </div>
          </details>
        ))}
      </div>
    </nav>
  );
}

export { JYOTISH_GROUPS, JyotishPanelNav };
