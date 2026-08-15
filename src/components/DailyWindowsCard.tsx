import React, { useMemo, useState } from "react";
import { T } from "./ui-style-contract";
import { scanSpecialYogaCalendar } from "../engine/daily-windows";
import { dayRange, panchangTime } from "./format";

const NAK_TARA = ["Janma","Sampat","Vipat","Kshema","Pratyari","Sadhaka","Naidhana","Mitra","Parama Mitra"];
const YOGA_FILTERS = [
  ["sarvartha","Sarvartha Siddhi","सर्वार्थ सिद्धि"],["amritaSiddhi","Amrita Siddhi","अमृत सिद्धि"],
  ["raviYoga","Ravi Yoga","रवि योग"],["raviPushya","Ravi Pushya","रवि पुष्य"],["guruPushya","Guru Pushya","गुरु पुष्य"],
  ["dwipushkar","Dwipushkar","द्विपुष्कर"],["tripushkar","Tripushkar","त्रिपुष्कर"],["gandaMoola","Ganda Moola","गण्ड मूल"],
];
const YOGA_WHY = {
  sarvartha:["weekday and Moon nakshatra form an all-purpose success combination","वार और चन्द्र-नक्षत्र से सर्वकार्य-सिद्धि संयोग"],
  amritaSiddhi:["the weekday's single Amrita-Siddhi nakshatra is active","उस वार का अमृत-सिद्धि नक्षत्र सक्रिय"],
  raviYoga:["Moon's nakshatra has the prescribed separation from the Sun's nakshatra","चन्द्र-नक्षत्र की सूर्य-नक्षत्र से निर्धारित दूरी"],
  raviPushya:["Pushya nakshatra falls on Sunday","रविवार को पुष्य नक्षत्र"], guruPushya:["Pushya nakshatra falls on Thursday","गुरुवार को पुष्य नक्षत्र"],
  dwipushkar:["Sunday/Tuesday/Saturday overlaps a repeating tithi and a two-sign nakshatra","रवि/मंगल/शनि के साथ पुनरावृत्ति तिथि और द्विराशि नक्षत्र"],
  tripushkar:["Sunday/Tuesday/Saturday overlaps a repeating tithi and a three-pada nakshatra","रवि/मंगल/शनि के साथ पुनरावृत्ति तिथि और त्रिपाद नक्षत्र"],
  gandaMoola:["Moon is in one of the six junction nakshatras; this is a caution, not a fear verdict","चन्द्र छह सन्धि-नक्षत्रों में; यह सावधानी है, भय का निर्णय नहीं"],
};

export default function DailyWindowsCard({ data, place, lang, C, card }) {
  const [details, setDetails] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [birthSign, setBirthSign] = useState("");
  const [birthNak, setBirthNak] = useState("");
  const [yogaFilter, setYogaFilter] = useState("sarvartha");
  const calendar = useMemo(() => calendarOpen && place && data ? scanSpecialYogaCalendar(place, data.anchor, 60) : [], [calendarOpen, place, data]);
  if (!data) return <section style={{ ...card, padding: "1rem 1.125rem", marginBottom: "0.875rem", border:`0.0625rem solid ${C.line}` }}>
    <div style={{ ...T.label,color:C.gold,marginBottom: "0.25rem" }}>{lang === "hi" ? "दैनिक निर्णय-काल उपलब्ध नहीं" : "Daily decision windows unavailable"}</div>
    <div style={{ fontSize: "var(--font-small)",color:C.muted,lineHeight:1.55 }}>{lang === "hi" ? "इस स्थान/तारीख़ पर सूर्योदय या सूर्यास्त उपलब्ध नहीं है, इसलिए भद्रा, दुर्मुहूर्त और सूर्योदय-आधारित काल सुरक्षित रूप से नहीं निकाले जा सकते। दूसरी तारीख़ या निकटतम शहर चुनें।" : "Sunrise or sunset is unavailable for this place/date, so Bhadra, Dur Muhurta and sunrise-based windows cannot be calculated safely. Choose another date or the nearest city."}</div>
  </section>;
  // Bhadra, Dur, Varjyam, Brahma, Nishita and the night Gowri halves all run past
  // midnight, so every clock here is bound to the sunrise anchor of the day it
  // belongs to and carries its date when it crosses (C3-CROSSMIDNIGHT-DATE).
  const clockOf = (ms, tz) => panchangTime(ms, tz, lang, place?.zone, "locale");
  const span = dayRange(data.tz, data.anchor, lang, (ms) => clockOf(ms, data.tz), place?.zone);
  const row = (label, windows, tone = C.ivory) => (
    <div style={{ display:"flex", justifyContent:"space-between", gap: "0.75rem", padding: "0.375rem 0", borderBottom:`0.0625rem solid ${C.line}`, fontSize: "var(--font-small)" }}>
      <span style={{ color:tone }}>{label}</span>
      <span style={{ color:C.muted, textAlign:"right", fontVariantNumeric:"tabular-nums" }}>{windows.length ? windows.map(w => `${span(w.start, w.end)}`).join(" · ") : (lang === "hi" ? "आज नहीं" : "None today")}</span>
    </div>
  );
  const goodSigns = data.chandraBala.filter(x => x.good).map(x => lang === "hi" ? x.hi : x.en).join(", ");
  const yogas = data.specialYogas || [];
  return <section style={{ ...card, padding: "1rem 1.125rem", marginBottom: "0.875rem" }}>
    <div style={{ ...T.label, color:C.gold, marginBottom: "0.25rem" }}>{lang === "hi" ? "आज के निर्णय-काल" : "Today's decision windows"}</div>
    <div style={{ fontFamily:T.serif, fontSize: "var(--font-title)", color:C.ivory, lineHeight:1.35 }}>
      {data.bhadra.length ? (lang === "hi" ? "भद्रा के समय नया शुभ कार्य टालें।" : "Avoid starting auspicious work during Bhadra.") : (lang === "hi" ? "आज सूर्योदय-दिन में भद्रा बाधा नहीं।" : "No Bhadra obstruction in this sunrise-day.")}
    </div>
    <div style={{ fontSize: "var(--font-small)", color:C.muted, marginTop: "0.3125rem", lineHeight:1.5 }}>
      {lang === "hi" ? `यात्रा-दिशा सावधानी: ${data.dishaShool.hi}। नीचे स्थानीय समय हैं।` : `Travel caution: Disha Shool points ${data.dishaShool.en}. Times below are local.`}
    </div>
    {yogas.length > 0 && <div style={{ display:"flex", flexWrap:"wrap", gap: "0.375rem", marginTop: "0.625rem" }}>{yogas.map(y => <span key={y.key} style={{ borderRadius:T.rPill, padding: "0.1875rem 0.5625rem", fontSize: "var(--font-label)", color:y.auspicious ? "var(--good)" : C.sindoor, background:y.auspicious ? "var(--good-surface)" : "var(--bad-surface)" }}>{lang === "hi" ? y.hi : y.en}</span>)}</div>}
    <div style={{ marginTop: "0.5rem", fontSize: "var(--font-label)", color:data.anandadi.auspicious ? "var(--good)" : C.sindoor }}>{lang === "hi" ? "आनन्दादि योग" : "Anandadi Yoga"}: {lang === "hi" ? data.anandadi.hi : data.anandadi.en}</div>
    <button onClick={() => setDetails(v => !v)} style={{ marginTop: "0.75rem", width:"100%", height:T.ctrlH, borderRadius:T.rMd, border:`0.0625rem solid ${C.line}`, background:"transparent", color:C.gold, cursor:"pointer", fontFamily:T.body }}>
      {details ? (lang === "hi" ? "विवरण छिपाएँ" : "Hide details") : (lang === "hi" ? "सभी काल, बल और योग देखें" : "See all windows, bala and yogas")}
    </button>
    <button onClick={() => setCalendarOpen(v => !v)} style={{ marginTop: "0.5rem", width:"100%", height:T.ctrlH, borderRadius:T.rMd, border:`0.0625rem solid ${C.line}`, background:"transparent", color:C.gold, cursor:"pointer", fontFamily:T.body }}>{calendarOpen ? (lang === "hi" ? "योग कैलेंडर छिपाएँ" : "Hide yoga calendar") : (lang === "hi" ? "अगले 60 दिन का विशेष-योग कैलेंडर" : "Next 60 days: special-yoga calendar")}</button>
    {calendarOpen && <><div style={{ display:"flex",flexWrap:"wrap",gap: "0.3125rem",marginTop: "0.5rem" }}>{YOGA_FILTERS.map(y=><button key={y[0]} onClick={()=>setYogaFilter(y[0])} style={{padding: "0.25rem 0.5rem",borderRadius:T.rPill,border:`0.0625rem solid ${yogaFilter===y[0]?C.gold:C.line}`,background:yogaFilter===y[0]?"var(--accent-soft)":"transparent",color:yogaFilter===y[0]?C.gold:C.muted,fontSize: "var(--font-micro)",cursor:"pointer"}}>{lang === "hi" ? y[2] : y[1]}</button>)}</div><div style={{fontSize: "var(--font-label)",color:C.muted,lineHeight:1.45,marginTop: "0.375rem"}}>{YOGA_WHY[yogaFilter][lang === "hi" ? 1 : 0]}</div><div style={{ marginTop: "0.375rem", maxHeight: "20rem", overflowY:"auto" }}>{calendar.filter(d=>d.yogas.some(y=>y.key===yogaFilter)).map((d,i) => {
      const tfSpan=dayRange(d.tz, d.ms, lang, (ms)=>clockOf(ms, d.tz), place?.zone);
      return <div key={i} style={{ display:"grid", gridTemplateColumns:"minmax(78px,.55fr) minmax(0,1.45fr)", gap: "0.625rem", padding: "0.5rem 0.125rem", borderBottom:`0.0625rem solid ${C.line}`, fontSize: "var(--font-label)" }}><span style={{ color:C.ivory }}>{new Date(d.ms+d.tz*3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day:"numeric", month:"short", weekday:"short", timeZone:"UTC" })}</span><span style={{ color:C.muted, textAlign:"right" }}>{d.windows.filter(w=>w.key===yogaFilter).map((w,j)=><span key={j} style={{ display:"block" }}>{lang === "hi" ? w.hi : w.en} · {tfSpan(w.start, w.end)}</span>)}</span></div>;
    })}{calendar.filter(d=>d.yogas.some(y=>y.key===yogaFilter)).length===0 && <div style={{padding: "0.75rem 0.125rem",fontSize: "var(--font-label)",color:C.muted,fontStyle:"italic"}}>{lang === "hi" ? "अगले 60 दिनों में यह योग नहीं है।" : "This yoga does not occur in the next 60 days."}</div>}</div></>}
    {details && <div style={{ marginTop: "0.5rem" }}>
      {row(lang === "hi" ? "भद्रा / विष्टि · टालें" : "Bhadra / Vishti · avoid", data.bhadra, C.sindoor)}
      {row(lang === "hi" ? "दुर्मुहूर्त · टालें" : "Dur Muhurta · avoid", data.dur, C.sindoor)}
      {row(lang === "hi" ? "वर्ज्यम् · टालें" : "Varjyam · avoid", data.varjyam, C.sindoor)}
      {row(lang === "hi" ? "अमृत काल" : "Amrit Kalam", data.amrit, "var(--good)")}
      {row(lang === "hi" ? "ब्रह्म मुहूर्त" : "Brahma Muhurta", [data.brahma], "var(--good)")}
      {row(lang === "hi" ? "निशीथ" : "Nishita", [data.nishita])}
      {row(lang === "hi" ? "गोधूलि" : "Godhuli", [data.godhuli])}
      {row(lang === "hi" ? "प्रदोष" : "Pradosha", [data.pradosha])}
      {row(lang === "hi" ? "नल्ल नेरम · तमिल" : "Nalla Neram · Tamil", data.nallaNeram, "var(--good)")}
      <div style={{ padding: "0.4375rem 0",borderBottom:`0.0625rem solid ${C.line}`,fontSize: "var(--font-small)" }}><div style={{color:"var(--good)",marginBottom: "0.1875rem"}}>{lang === "hi" ? "गौरी नल्ल नेरम · तमिल" : "Gowri Nalla Neram · Tamil"}</div>{data.gowri.filter(x=>x.good).map((x,i)=><div key={`${x.part}-${i}`} style={{display:"flex",justifyContent:"space-between",gap: "0.625rem",color:C.muted}}><span>{x.part==="night" ? (lang === "hi" ? "रात्रि · " : "Night · ") : (lang === "hi" ? "दिन · " : "Day · ")}{lang === "hi" ? x.hi : x.en}</span><span style={{fontVariantNumeric:"tabular-nums"}}>{span(x.start, x.end)}</span></div>)}</div>
      <div style={{ marginTop: "0.75rem", fontSize: "var(--font-small)", lineHeight:1.55 }}><span style={{ color:C.gold }}>{lang === "hi" ? "चन्द्र बल अनुकूल जन्म-राशियाँ: " : "Chandra Bala supports birth signs: "}</span><span style={{ color:C.ivory }}>{goodSigns}</span></div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap: "0.5rem", marginTop: "0.625rem" }}>
        <label style={{ fontSize: "var(--font-label)",color:C.muted }}>{lang === "hi" ? "आपकी जन्म राशि" : "Your birth sign"}<select value={birthSign} onChange={e=>setBirthSign(e.target.value)} style={{ display:"block",width:"100%",height:T.ctrlH,marginTop: "0.25rem",borderRadius:T.rMd,border:`0.0625rem solid ${C.line}`,background:"var(--surface-sunken)",color:C.ivory,padding: "0 0.5rem" }}><option value="">—</option>{data.chandraBala.map(x=><option key={x.birthSign} value={x.birthSign}>{lang === "hi" ? x.hi : x.en}</option>)}</select></label>
        <label style={{ fontSize: "var(--font-label)",color:C.muted }}>{lang === "hi" ? "आपका जन्म नक्षत्र" : "Your birth nakshatra"}<select value={birthNak} onChange={e=>setBirthNak(e.target.value)} style={{ display:"block",width:"100%",height:T.ctrlH,marginTop: "0.25rem",borderRadius:T.rMd,border:`0.0625rem solid ${C.line}`,background:"var(--surface-sunken)",color:C.ivory,padding: "0 0.5rem" }}><option value="">—</option>{data.taraBala.map(x=><option key={x.birthNak} value={x.birthNak}>{lang === "hi" ? x.hi : x.en}</option>)}</select></label>
      </div>
      {(birthSign!==""||birthNak!=="") && <div style={{ marginTop: "0.5rem",padding: "0.5625rem 0.625rem",borderRadius:T.rSm,background:"var(--surface-raised)",fontSize: "var(--font-small)",lineHeight:1.5 }}>
        {birthSign!=="" && (()=>{const x=data.chandraBala[Number(birthSign)];return <div style={{color:x.good?"var(--good)":C.sindoor}}>{lang === "hi" ? "चन्द्र बल" : "Chandra Bala"}: {x.good ? (lang === "hi" ? "अनुकूल" : "supportive") : (lang === "hi" ? "कमज़ोर — बड़े आरम्भ में व्यक्तिगत जाँच करें" : "weak — get a personal check for a major beginning")}</div>;})()}
        {birthNak!=="" && (()=>{const x=data.taraBala[Number(birthNak)];return <div style={{color:x.good?"var(--good)":C.sindoor}}>{lang === "hi" ? "तारा बल" : "Tara Bala"}: {NAK_TARA[x.tara-1]} · {x.good ? (lang === "hi" ? "अनुकूल" : "supportive") : (lang === "hi" ? "टालना बेहतर" : "better avoided")}</div>;})()}
      </div>}
      <div style={{ marginTop: "0.375rem", fontSize: "var(--font-label)", color:C.muted, lineHeight:1.5 }}>{lang === "hi" ? "तारा बल जन्म नक्षत्र से आज के नक्षत्र तक गिनता है। विपत्, प्रत्यरी और नैधन से बचें; जन्म तारा भी बड़े आरम्भ के लिए सामान्यतः नहीं चुना जाता।" : `Tara Bala counts from your birth nakshatra to today's. Avoid ${NAK_TARA[2]}, ${NAK_TARA[4]} and ${NAK_TARA[6]}; Janma Tara is also normally not chosen for a major beginning.`}</div>
      <div style={{ marginTop: "0.5rem", fontSize: "var(--font-label)", color:C.muted, fontStyle:"italic", lineHeight:1.5 }}>{lang === "hi" ? "ये सामान्य पंचांग-सहायक हैं, व्यक्तिगत कुंडली का विकल्प नहीं। तमिल नल्ल नेरम/गौरी और 28-नक्षत्र आनन्दादि को उत्तर भारतीय दैनिक कालों से अलग परम्परा के रूप में रखा गया है। गोधूलि सूर्यास्त से आरम्भ होकर आधे रात्रि-मुहूर्त तक चलती है (सूर्यास्त से अगले सूर्योदय तक की रात्रि के पन्द्रह मुहूर्त)। आधी रात के बाद समाप्त होने वाले समय के साथ उसकी तारीख़ भी दी जाती है।" : "These are general Panchang aids, not a personal chart verdict. Tamil Nalla Neram/Gowri and the 28-mansion Anandadi system remain visibly separate from North-Indian daily windows. Godhuli begins at sunset and runs for half a night muhurta (the night from sunset to the next sunrise, divided into fifteen muhurtas). Any time that falls after midnight is shown with its date."}</div>
    </div>}
  </section>;
}
