import React from "react";
import { T } from "./tokens";
import {
  NAVRATRI_SEASONS, SAPTASHATI_PLAN, navadurgaEntriesForSeason,
} from "../data/navadurga-pages";

const TITHI_NAMES = Object.freeze([
  { en: "Pratipada", hi: "प्रतिपदा" }, { en: "Dwitiya", hi: "द्वितीया" },
  { en: "Tritiya", hi: "तृतीया" }, { en: "Chaturthi", hi: "चतुर्थी" },
  { en: "Panchami", hi: "पञ्चमी" }, { en: "Shashthi", hi: "षष्ठी" },
  { en: "Saptami", hi: "सप्तमी" }, { en: "Ashtami", hi: "अष्टमी" },
  { en: "Navami", hi: "नवमी" },
]);

function localDate(civil, lang) {
  if (!civil) return "";
  return new Date(Date.UTC(civil.y, civil.m - 1, civil.day)).toLocaleDateString(
    lang === "hi" ? "hi-IN" : "en-IN",
    { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" },
  );
}

function NavadurgaSeasonLinks({ parentKey, activeDay = null, lang, C }) {
  const L = lang === "hi" ? "hi" : "en";
  const entries = navadurgaEntriesForSeason(parentKey);
  if (!entries.length) return null;
  return (
    <nav aria-label={L === "hi" ? "नवदुर्गा के नौ दिन" : "Nine Navadurga days"} style={{ marginTop: 16 }}>
      <div style={{ ...T.label, color: C.gold, marginBottom: 8 }}>
        {L === "hi" ? "नवदुर्गा · सभी नौ दिवस" : "NAVADURGA · ALL NINE DAYS"}
      </div>
      <div className="hscroll" style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4 }}>
        {entries.map((entry) => (
          <a
            key={entry.path}
            href={`${entry.path}?lang=${L}`}
            aria-current={activeDay === entry.day ? "page" : undefined}
            style={{
              flex: "0 0 auto", minHeight: T.ctrlH, display: "inline-flex", alignItems: "center",
              padding: "0 12px", borderRadius: T.rMd, textDecoration: "none", fontSize: T.fSmall,
              border: `1px solid ${activeDay === entry.day ? C.gold : C.line}`,
              color: activeDay === entry.day ? C.gold : C.ivory,
              background: activeDay === entry.day ? "rgba(168,106,18,.10)" : C.panel,
            }}
          >
            {entry.day}. {entry.form.name[L].replace(/^Maa |^माँ /, "")}
          </a>
        ))}
      </div>
    </nav>
  );
}

function LocalNavadurgaDate({ dateInfo, form, lang, C }) {
  const L = lang === "hi" ? "hi" : "en";
  const tithi = TITHI_NAMES[form.day - 1][L];
  if (!dateInfo) return null;
  if (dateInfo.status === "skipped") {
    return (
      <div role="status" style={{ padding: "11px 12px", borderRadius: T.rMd, border: `1px solid ${C.gold}`, background: "rgba(168,106,18,.08)", color: C.ivory, fontSize: T.fSmall, lineHeight: 1.55 }}>
        <strong style={{ color: C.gold }}>{L === "hi" ? "इस वर्ष अलग सूर्योदय-दिवस नहीं" : "No separate sunrise day this year"}</strong><br />
        {L === "hi"
          ? `${tithi} इस स्थानीय नवरात्रि में किसी सूर्योदय पर अलग से प्रचलित नहीं है। इसलिए गणक ${form.name.hi} को किसी दूसरी तारीख़ पर चुपचाप नहीं खिसकाता। अपनी कुल या मंदिर-परम्परा में संयुक्त पूजन का नियम मानें।`
          : `${tithi} does not prevail at a separate sunrise in this local Navratri. Ganak therefore does not silently move ${form.name.en} to another date. Follow your family or temple's rule for combined worship.`}
      </div>
    );
  }
  const dates = dateInfo.dates.map((civil) => localDate(civil, L));
  return (
    <div role="status" style={{ padding: "11px 12px", borderRadius: T.rMd, border: "1px solid rgba(31,122,77,.25)", background: "rgba(31,122,77,.07)", color: C.ivory, fontSize: T.fSmall, lineHeight: 1.55 }}>
      <strong style={{ color: "#1F7A4D" }}>
        {dateInfo.status === "repeated"
          ? (L === "hi" ? "यह पूजा दो सूर्योदय-दिवसों पर है" : "This worship spans two sunrise days")
          : (L === "hi" ? "इस देवी का स्थानीय दिवस" : "Local day for this Goddess")}
      </strong><br />
      {dates.join(L === "hi" ? " और " : " and ")} · {tithi}
      {dateInfo.status === "repeated" && (
        <div style={{ color: C.muted, marginTop: 4 }}>
          {L === "hi"
            ? "तिथि दोनों सूर्योदयों पर रहती है; गणक दोनों तारीख़ें दिखाता है।"
            : "The tithi prevails at both sunrises, so Ganak shows both dates."}
        </div>
      )}
    </div>
  );
}

function NavadurgaDayGuide({ guide, dateInfo, lang, C }) {
  const L = lang === "hi" ? "hi" : "en";
  const form = guide.form;
  const season = NAVRATRI_SEASONS[guide.seasonKey];
  const reading = SAPTASHATI_PLAN[form.day - 1];
  const steps = L === "hi"
    ? [
        "स्नान कर स्वच्छ पूजा-स्थान तैयार करें। दीप को स्थिर और अग्नि-सुरक्षित स्थान पर रखें।",
        "गणेश, गुरु और कुलदेवता का स्मरण करें; पहले दिन लिया नवरात्रि संकल्प दोहराएँ।",
        `${form.name.hi} का ध्यान इस चित्र या घर में स्थापित देवी-स्वरूप के सामने करें।`,
        "जल, गन्ध/कुमकुम (कुलाचार अनुसार), पुष्प, धूप या दीप और सरल नैवेद्य अर्पित करें।",
        form.focus.hi,
        `सार्वजनिक नाम-मन्त्र “${form.mantra}” अपने संकल्प या कुलाचार के अनुसार जपें; 11, 27 या 108 प्रचलित गृहस्थ जप-संख्याएँ हैं।`,
        `विश्वसनीय पाठ या अनुवाद से दुर्गा सप्तशती अध्याय ${reading.chapters} पढ़ें या श्रद्धापूर्वक सुनें।`,
        "क्षमा-प्रार्थना, आरती और प्रणाम करें; फिर प्रसाद बाँटें। परिवार की स्थापित विधि हो तो वही प्राथमिक है।",
      ]
    : [
        "Bathe and prepare a clean worship place. Put the lamp on a stable, fire-safe surface.",
        "Remember Ganesha, your teacher and family deity; recall the Navratri sankalpa taken on day one.",
        `Contemplate ${form.name.en} before this image or your household's established form of Devi.`,
        "Offer water, fragrance/kumkum where customary, a flower, incense or lamp, and simple naivedya.",
        form.focus.en,
        `Repeat the public name-mantra “${form.mantra}” according to your sankalpa or family practice; 11, 27 and 108 are common household counts.`,
        `Read or reverently listen to Durga Saptashati chapter${reading.chapters.includes("–") ? "s" : ""} ${reading.chapters} from a trusted text or translation.`,
        "Close with an apology for mistakes, aarti and pranam, then share prasad. An established family method takes priority.",
      ];

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <NavadurgaSeasonLinks parentKey={guide.parentKey} activeDay={form.day} lang={lang} C={C} />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 14 }}>
        <img
          src={form.image}
          alt={form.alt[L]}
          width="900"
          height="900"
          loading="eager"
          style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: T.rLg, border: `1px solid ${C.line}`, background: C.panel }}
        />
        <div style={{ padding: "14px 15px", borderRadius: T.rLg, border: `1px solid ${C.line}`, background: "linear-gradient(145deg, rgba(194,69,30,.07), rgba(168,106,18,.08))" }}>
          <div style={{ ...T.label, color: C.sindoor, marginBottom: 7 }}>
            {L === "hi" ? `पहले उत्तर · दिवस ${form.day}` : `ANSWER FIRST · DAY ${form.day}`}
          </div>
          <p style={{ margin: 0, color: C.ivory, fontSize: T.fBody, lineHeight: 1.62 }}>{form.identity[L]}</p>
        </div>
      </div>

      <LocalNavadurgaDate dateInfo={dateInfo} form={form} lang={lang} C={C} />

      <section style={{ padding: "13px 14px", borderRadius: T.rMd, border: `1px solid ${C.line}`, background: C.panel }}>
        <div style={{ ...T.label, color: C.gold, marginBottom: 7 }}>{L === "hi" ? "स्वरूप की पहचान" : "HOW TO RECOGNISE THIS FORM"}</div>
        <p style={{ margin: 0, color: C.ivory, fontSize: T.fSmall, lineHeight: 1.6 }}>{form.iconography[L]}</p>
        <p style={{ margin: "8px 0 0", color: C.muted, fontSize: T.fMicro, lineHeight: 1.5 }}>
          {L === "hi" ? "चित्र गणक के लिए बनाया गया मौलिक भक्तिपूर्ण निरूपण है; यह किसी मंदिर-मूर्ति की प्रतिलिपि नहीं है।" : "This is an original devotional illustration commissioned for Ganak, not a copy of a temple murti."}
        </p>
      </section>

      <section>
        <div style={{ ...T.label, color: C.gold, marginBottom: 9 }}>{L === "hi" ? "सरल गृह-पूजा · क्रम से" : "SIMPLE HOUSEHOLD PUJA · STEP BY STEP"}</div>
        <ol style={{ margin: 0, paddingLeft: 22, display: "grid", gap: 9, color: C.ivory, fontSize: T.fSmall, lineHeight: 1.6 }}>
          {steps.map((step, index) => <li key={index}>{step}</li>)}
        </ol>
      </section>

      <section style={{ padding: "14px", borderRadius: T.rLg, border: `1px solid ${C.gold}`, background: "rgba(168,106,18,.07)" }}>
        <div style={{ ...T.label, color: C.gold, marginBottom: 7 }}>{L === "hi" ? "आज का दुर्गा सप्तशती पाठ" : "TODAY'S DURGA SAPTASHATI READING"}</div>
        <div style={{ color: C.ivory, fontSize: T.fBody, lineHeight: 1.55 }}>
          <strong>{L === "hi" ? `अध्याय ${reading.chapters}` : `Chapter${reading.chapters.includes("–") ? "s" : ""} ${reading.chapters}`}</strong>
          <span style={{ color: C.muted }}> · {reading.focus[L]}</span>
        </div>
        <p style={{ margin: "9px 0 0", color: C.muted, fontSize: T.fSmall, lineHeight: 1.55 }}>
          {L === "hi"
            ? "यह घर में विश्वसनीय संस्कृत पाठ, अर्थ सहित संस्करण या श्रवण के लिए एक प्रलेखित नौ-दिवसीय क्रम है। आपके प्रामाणिक संस्करण या गुरु का क्रम अलग हो तो उसे मानें।"
            : "This is one documented nine-day arrangement for reading a trusted Sanskrit text, a translation, or listening at home. If your trusted edition or teacher gives a different order, follow that order."}
        </p>
      </section>

      {form.day === 1 && (
        <section>
          <div style={{ ...T.label, color: C.gold, marginBottom: 8 }}>{L === "hi" ? "पूरे नौ दिनों की पाठ-योजना" : "COMPLETE NINE-DAY READING PLAN"}</div>
          <div style={{ overflowX: "auto", border: `1px solid ${C.line}`, borderRadius: T.rMd }}>
            <table>
              <thead><tr><th>{L === "hi" ? "दिवस" : "Day"}</th><th>{L === "hi" ? "अध्याय" : "Chapter(s)"}</th><th>{L === "hi" ? "विषय" : "Focus"}</th></tr></thead>
              <tbody>{SAPTASHATI_PLAN.map((item) => (
                <tr key={item.day}><td>{item.day}</td><td><strong>{item.chapters}</strong></td><td>{item.focus[L]}</td></tr>
              ))}</tbody>
            </table>
          </div>
          <p style={{ margin: "9px 0 0", color: C.muted, fontSize: T.fSmall, lineHeight: 1.55 }}>
            {L === "hi"
              ? "मन्त्र-रूप चण्डी-पारायण में बीज-मन्त्र, न्यास, पूर्वाङ्ग, होम और क्रम परम्परा अनुसार बदलते हैं। वह दीक्षित/गुरु-निर्देशित विधि है; ऊपर की योजना सरल पाठ या श्रवण के लिए है।"
              : "In mantra-form Chandi parayana, bija insertion, nyasa, preliminary texts, homa and sequence vary by lineage. That is initiated or teacher-led practice; the plan above is for straightforward reading or listening."}
          </p>
        </section>
      )}

      <section style={{ padding: "12px 13px", borderRadius: T.rMd, border: `1px solid ${C.line}`, background: "rgba(59,49,71,.04)" }}>
        <div style={{ ...T.label, color: C.gold, marginBottom: 6 }}>{season.name[L]}</div>
        <p style={{ margin: 0, color: C.muted, fontSize: T.fSmall, lineHeight: 1.55 }}>{season.context[L]}</p>
      </section>

      <details style={{ borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
        <summary style={{ cursor: "pointer", color: C.gold, fontSize: T.fSmall }}>{L === "hi" ? "स्रोत-आधार देखें" : "See source basis"}</summary>
        <ul style={{ margin: "9px 0 0", paddingLeft: 20, color: C.muted, fontSize: T.fMicro, lineHeight: 1.65 }}>
          <li><a href="https://sanskritdocuments.org/doc_devii/durgAkavach-kn.pdf" target="_blank" rel="noreferrer" style={{ color: C.gold }}>Devi Kavacha · Navadurga names</a></li>
          <li><a href={`https://www.drikpanchang.com/hindu-goddesses/parvati/durga/navdurga-${form.sourceSlug || form.slug}.html`} target="_blank" rel="noreferrer" style={{ color: C.gold }}>Drik Panchang · {form.name.en} iconography and prarthana</a></li>
          <li><a href="https://www.artofliving.org/in-en/navratri/durga-saptashati-a-glorious-song-to-the-divine-mother" target="_blank" rel="noreferrer" style={{ color: C.gold }}>Durga Saptashati · nine-day chapter arrangement</a></li>
        </ul>
      </details>
    </div>
  );
}

export default NavadurgaDayGuide;
export { NavadurgaSeasonLinks, LocalNavadurgaDate };
