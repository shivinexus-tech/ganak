import React from "react";
import { T } from "./ui-style-contract";
import { SIGN_TRAITS } from "../data/life-interpretation";
/* The calculator link must carry the city the reader already chose. utilityHref is
   the one place that builds that query string correctly; a second hand-written
   `?lang=` here is exactly how the city got dropped at the entry door. */
import { utilityHref } from "../screens/UtilityCalculatorScreen";

const JYOTISH_GROUPS = [
  {
    key: "kundli",
    en: "Kundli",
    hi: "कुंडली",
    items: [
      ["#reading", "Reading", "फलादेश"],
      ["#summary", "Summary", "सार"],
      ["#chart", "Charts", "वर्ग कुंडली"],
      ["#planets", "Grahas", "ग्रह"],
      ["#yogas", "Yogas", "योग"],
      ["#karakas", "Karakas", "कारक"],
      ["#special", "Special points", "विशेष बिंदु"],
      ["#chalit", "Bhava strength", "भाव बल"],
      ["#av", "Ashtakavarga", "अष्टकवर्ग"],
      ["#arudha", "Arudha", "आरूढ़"],
      ["#doshas", "Doshas", "दोष"],
    ],
  },
  {
    key: "dashas",
    en: "Dashas",
    hi: "दशा",
    items: [
      ["#dasha", "Vimshottari", "विंशोत्तरी"],
      ["#marriage", "Marriage timing", "विवाह समय"],
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
      ["/calculators", "Quick calculators", "त्वरित कैलकुलेटर"],
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

// Anchors whose destination panel only exists above Guided depth. Guided must not offer a
// link that scrolls to nothing — a dead-end is worse than a missing entry.
const TECHNICAL_ANCHORS = new Set(["#shadbala", "#av"]);

/* onSelectGroup receives the group KEY ("kundli" | "dashas" | "matching" | "tools" |
   "vault"). The default used to take no argument at all, which typed the prop as a
   nullary callback and hid the fact that the caller is handed the key it must persist. */
function JyotishPanelNav({ lang, C, place = null, showTechnical = true, activeGroup = "kundli", onSelectGroup = (_key: string) => {} }) {
  const hi = lang === "hi";
  const showReading = SIGN_TRAITS.every((entry) => entry.status === "owner-verified");
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
        margin: `0 0 ${T.s4}`,
        background: "rgba(250,245,234,.96)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: `0.0625rem solid ${C.line}`,
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
              aria-current={activeGroup === group.key ? "page" : undefined}
              onClick={() => onSelectGroup(group.key)}
              style={{
                minHeight: T.ctrlH,
                display: "flex",
                alignItems: "center",
                padding: `0 ${T.s4}`,
                border: `0.0625rem solid ${C.line}`,
                borderRadius: T.rMd,
                background: activeGroup === group.key ? C.accentSoft : C.panel,
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
                minWidth: "13.125rem",
                padding: T.s2,
                marginTop: T.s1,
                border: `0.0625rem solid ${C.line}`,
                borderRadius: T.rMd,
                background: C.panel,
                boxShadow: T.e3,
              }}
            >
              {group.items.filter(([href]) => (showReading || href !== "#reading") && (showTechnical || !TECHNICAL_ANCHORS.has(href))).map(([href, en, itemHi]) => (
                <a
                  key={href}
                  href={href.startsWith("/") ? utilityHref(href, lang, place) : href}
                  style={{
                    minHeight: T.ctrlH,
                    display: "flex",
                    alignItems: "center",
                    padding: `0 ${T.s3}`,
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
