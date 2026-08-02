import React, { useEffect, useMemo, useRef, useState } from "react";
import { R as T } from "../components/tokens";
import PlaceInput from "../components/PlaceInput";
import ReadAloudButton from "../accessibility/ReadAloudButton";
import { useComfort } from "../accessibility/ComfortProvider";
import { useModalFocus } from "../accessibility/useModalFocus";
import { FESTIVAL_PAGE_ENTRIES } from "../data/festival-pages";

const FOLLOW_CHOICES = [
  { key: "major-festivals", icon: "🪔", en: "Major festivals", hi: "मुख्य पर्व" },
  { key: "ekadashi", icon: "🌿", en: "Ekadashi", hi: "एकादशी" },
  { key: "pradosham", icon: "🌙", en: "Pradosham", hi: "प्रदोष" },
  { key: "purnima", icon: "🌕", en: "Purnima", hi: "पूर्णिमा" },
  { key: "vishnu", icon: "🪷", en: "Vishnu", hi: "विष्णु" },
  { key: "shiva", icon: "🔱", en: "Shiva", hi: "शिव" },
  { key: "devi", icon: "🌺", en: "Devi", hi: "देवी" },
  { key: "ganesha", icon: "ॐ", en: "Ganesha", hi: "गणेश" },
  { key: "hanuman", icon: "🚩", en: "Hanuman", hi: "हनुमान" },
];

const COMFORT_LEVELS = [
  { scalePercent: 100, densityRem: -0.0625 },
  { scalePercent: 103.125, densityRem: 0 },
  { scalePercent: 106.25, densityRem: 0.0625 },
  { scalePercent: 112.5, densityRem: 0.1875 },
  { scalePercent: 118.75, densityRem: 0.25 },
];

const sectionStyle: React.CSSProperties = {
  border: "0.0625rem solid var(--line)",
  borderRadius: "var(--radius-lg)",
  background: "var(--surface-active)",
  boxShadow: "var(--elevation-1)",
  overflow: "hidden",
};

const summaryStyle: React.CSSProperties = {
  minHeight: "var(--control-height)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--space-2)",
  padding: "var(--space-3) var(--space-4)",
  cursor: "pointer",
  color: "var(--ink)",
  fontFamily: "var(--font-display-family)",
  fontSize: "var(--font-title)",
  fontWeight: 700,
};

function Segmented<T extends string>({ value, options, onChange, label }: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} style={{ display: "grid", gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`, gap: "0.25rem", padding: "0.25rem", borderRadius: T.rMd, border: "0.0625rem solid var(--line)", background: "var(--bg-active)" }}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="comfort-control comfort-focus"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          style={{
            border: "none", padding: "0.35rem", cursor: "pointer",
            background: value === option.value ? "var(--surface-active)" : "transparent",
            color: value === option.value ? "var(--accent)" : "var(--muted)",
            boxShadow: value === option.value ? "var(--elevation-1)" : "none",
            fontWeight: value === option.value ? 700 : 500,
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function RangeRow({ label, minLabel, maxLabel, value, min, max, step = 1, onChange, output }: {
  label: string;
  minLabel: string;
  maxLabel: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  output: string;
}) {
  return (
    <label style={{ display: "grid", gap: "0.4rem" }}>
      <span style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", color: "var(--ink)", fontWeight: 650 }}>
        <span>{label}</span><output style={{ color: "var(--accent)", fontWeight: 700 }}>{output}</output>
      </span>
      <input aria-label={label} aria-valuetext={output} className="comfort-range comfort-focus" type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} style={{ width: "100%", accentColor: "var(--accent)" }} />
      <span aria-hidden="true" style={{ display: "flex", justifyContent: "space-between", color: "var(--muted)", fontSize: T.fSmall }}><span>{minLabel}</span><span>{maxLabel}</span></span>
    </label>
  );
}

function PresetCard({ id, active, lang, onChoose }: { id: "simple-large" | "balanced" | "detailed"; active: boolean; lang: "hi" | "en"; onChoose: () => void }) {
  const copy = {
    "simple-large": { icon: "Aa", en: "Simple & Large", hi: "सरल और बड़ा", hintEn: "Bigger type · guided", hintHi: "बड़े अक्षर · सरल मार्गदर्शन" },
    balanced: { icon: "Aa", en: "Balanced", hi: "संतुलित", hintEn: "Comfortable default", hintHi: "आरामदायक सामान्य रूप" },
    detailed: { icon: "Aa+", en: "Detailed", hi: "विस्तृत", hintEn: "More detail · expert", hintHi: "अधिक जानकारी · विशेषज्ञ" },
  }[id];
  return (
    <button type="button" className="comfort-focus" aria-pressed={active} onClick={onChoose} style={{ minHeight: "7.5rem", display: "grid", alignContent: "space-between", gap: "0.5rem", textAlign: "left", padding: "0.75rem", borderRadius: T.rMd, border: `0.125rem solid ${active ? "var(--accent)" : "var(--line)"}`, background: "var(--surface-active)", color: "var(--ink)", cursor: "pointer" }}>
      <span aria-hidden="true" style={{ fontFamily: T.serif, fontSize: id === "simple-large" ? "1.75rem" : id === "detailed" ? "1.05rem" : "1.35rem", color: "var(--sacred, var(--accent))" }}>{copy.icon}</span>
      <span><strong style={{ display: "block" }}>{lang === "hi" ? copy.hi : copy.en}</strong><small style={{ color: "var(--muted)" }}>{lang === "hi" ? copy.hintHi : copy.hintEn}</small></span>
    </button>
  );
}

function ParentSetup({ lang, onClose, onLanguage }: { lang: "hi" | "en"; onClose: () => void; onLanguage: (lang: "hi" | "en") => void }) {
  const { applyPreset } = useComfort();
  const [step, setStep] = useState(0);
  const hi = lang === "hi";
  const dialogRef = useModalFocus(true, onClose);
  const stepFocusRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => { stepFocusRef.current?.focus(); }, [step]);
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="parent-setup-title" style={{ position: "fixed", inset: 0, zIndex: 220, display: "grid", placeItems: "end center", padding: "1rem", background: "rgba(20,16,24,.4)" }}>
      <section ref={dialogRef} style={{ width: "min(100%, 34rem)", maxHeight: "calc(100dvh - 2rem)", overflow: "auto", borderRadius: "1rem", padding: "1.25rem", background: "var(--surface-active)", boxShadow: T.e3 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
          <div><div style={{ color: "var(--accent)", fontWeight: 700 }}>{step + 1} / 3</div><h2 id="parent-setup-title" style={{ margin: "0.25rem 0", fontFamily: T.serif }}>{hi ? "माता-पिता के लिए सेट करें" : "Set it up for a parent"}</h2></div>
          <button type="button" className="comfort-focus" onClick={onClose} aria-label={hi ? "बन्द करें" : "Close"} style={{ alignSelf: "start", minWidth: "2.75rem", minHeight: "2.75rem", border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", fontSize: "1.25rem" }}>×</button>
        </div>
        {step === 0 && <div style={{ display: "grid", gap: "1rem" }}><p ref={stepFocusRef} tabIndex={-1}>{hi ? "बड़ा नमूना चुनें—बाद में बदला जा सकता है।" : "Choose the larger sample—this can be changed later."}</p><button type="button" className="comfort-focus" onClick={() => { applyPreset("simple-large"); setStep(1); }} style={{ padding: "1.25rem", textAlign: "left", borderRadius: T.rMd, border: "0.125rem solid var(--accent)", background: "var(--surface-active)", color: "var(--ink)", cursor: "pointer" }}><span aria-hidden="true" style={{ display: "block", fontFamily: T.serif, fontSize: "2rem" }}>{hi ? "आज का पंचांग" : "Today's Panchang"}</span><strong style={{ color: "var(--accent)" }}>✓ {hi ? "सरल और बड़ा" : "Simple & Large"}</strong></button></div>}
        {step === 1 && <div style={{ display: "grid", gap: "1rem" }}><p ref={stepFocusRef} tabIndex={-1}>{hi ? "वे किस भाषा में पढ़ना या सुनना पसंद करेंगे?" : "Which language would they prefer to read and hear?"}</p><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}><button type="button" className="comfort-control comfort-focus" onClick={() => { onLanguage("hi"); setStep(2); }} style={{ border: "0.0625rem solid var(--line)", background: "var(--surface-active)", color: "var(--ink)", fontSize: "1.2rem", cursor: "pointer" }}>हिन्दी</button><button type="button" className="comfort-control comfort-focus" onClick={() => { onLanguage("en"); setStep(2); }} style={{ border: "0.0625rem solid var(--line)", background: "var(--surface-active)", color: "var(--ink)", fontSize: "1.1rem", cursor: "pointer" }}>English</button></div></div>}
        {step === 2 && <div style={{ display: "grid", gap: "1rem" }}><div aria-hidden="true" style={{ fontSize: "3rem" }}>🔊</div><p ref={stepFocusRef} tabIndex={-1}>{hi ? "सुनें बटन हर प्रमुख पंचांग, पर्व और पूजा सामग्री पर दिखाई देगा।" : "The Listen button will appear on important Panchang, festival and worship content."}</p><ReadAloudButton lang={lang} text={hi ? "नमस्ते। गणक आज का पंचांग स्पष्ट रूप से सुनाएगा।" : "Namaste. Ganak can read today's Panchang clearly."} /><button type="button" className="comfort-control comfort-focus" onClick={onClose} style={{ border: "none", background: "var(--accent)", color: "var(--surface)", cursor: "pointer", fontWeight: 700 }}>{hi ? "पूरा हुआ" : "Done"}</button></div>}
      </section>
    </div>
  );
}

export default function PersonalizeScreen({ lang, C, place, onPlace, onLanguage, onClearPreferences, onBack }: { lang: "hi" | "en"; C: Record<string, string>; place: any; onPlace: (place: any) => void; onLanguage: (lang: "hi" | "en") => void; onClearPreferences: () => void; onBack: () => void }) {
  const { preferences, storageError, updatePreferences, applyPreset, toggleFollow } = useComfort();
  const [confirmClear, setConfirmClear] = useState(false);
  const [parentSetup, setParentSetup] = useState(false);
  const hi = lang === "hi";
  const screenTitleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { screenTitleRef.current?.focus(); }, []);
  const comfortLevel = useMemo(() => {
    let best = 0, distance = Infinity;
    COMFORT_LEVELS.forEach((level, index) => {
      const d = Math.abs(level.scalePercent - preferences.scalePercent) + Math.abs(level.densityRem - preferences.densityRem) * 20;
      if (d < distance) { best = index; distance = d; }
    });
    return best;
  }, [preferences.scalePercent, preferences.densityRem]);
  const warmthIndex = ["crisp", "balanced", "soft"].indexOf(preferences.warmth);
  const depthIndex = ["guided", "balanced", "expert"].indexOf(preferences.depth);
  const exactFestivalFollows = useMemo(() => preferences.following
    .filter((key) => key.startsWith("festival:"))
    .map((storedKey) => {
      const key = storedKey.slice("festival:".length);
      const entry = FESTIVAL_PAGE_ENTRIES.find((candidate) => candidate.key === key);
      return { storedKey, label: entry?.title?.[lang] || entry?.title?.en || key.replace(/[-_]/g, " ") };
    }), [preferences.following, lang]);

  return (
    <main aria-labelledby="personalize-title" style={{ display: "grid", gap: T.s3 }}>
      {parentSetup && <ParentSetup lang={lang} onClose={() => setParentSetup(false)} onLanguage={onLanguage} />}
      <div style={{ display: "flex", alignItems: "center", gap: T.s2 }}>
        <button type="button" className="comfort-control comfort-focus" onClick={onBack} style={{ border: "0.0625rem solid var(--line)", background: "var(--surface-active)", color: "var(--ink)", padding: `0 ${T.s3}`, cursor: "pointer" }}>← {hi ? "वापस" : "Back"}</button>
        <div><h2 ref={screenTitleRef} tabIndex={-1} id="personalize-title" style={{ margin: 0, fontFamily: T.serif, fontSize: T.fDisplay }}>{hi ? "आपका गणक" : "Personalize Ganak"}</h2><p style={{ margin: "0.2rem 0 0", color: "var(--muted)", fontSize: T.fSmall }}>{hi ? "जो आपके लिए उपयोगी है, वही आगे रहे।" : "Keep what matters to you close at hand."}</p></div>
      </div>

      <details open style={sectionStyle}>
        <summary className="comfort-focus" style={summaryStyle}><span>👓 {hi ? "रूप और आराम" : "Appearance & comfort"}</span><span aria-hidden="true">⌄</span></summary>
        <div style={{ display: "grid", gap: T.s4, padding: `0 ${T.s4} ${T.s4}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: T.s2 }}>
            {(["simple-large", "balanced", "detailed"] as const).map((id) => <PresetCard key={id} id={id} active={preferences.preset === id} lang={lang} onChoose={() => applyPreset(id)} />)}
          </div>
          <RangeRow label={hi ? "आकार और खुलापन" : "Size & room"} minLabel={hi ? "सघन" : "Compact"} maxLabel={hi ? "आरामदायक" : "Comfort"} value={comfortLevel} min={0} max={4} onChange={(index) => updatePreferences({ ...COMFORT_LEVELS[index], preset: "custom" })} output={`${Math.round(preferences.scalePercent)}%`} />
          <RangeRow label={hi ? "स्क्रीन की गर्माहट" : "Screen warmth"} minLabel={hi ? "साफ़" : "Crisp"} maxLabel={hi ? "कोमल" : "Soft"} value={warmthIndex} min={0} max={2} onChange={(index) => updatePreferences({ warmth: ["crisp", "balanced", "soft"][index] as any, preset: "custom" })} output={hi ? ["साफ़", "संतुलित", "कोमल"][warmthIndex] : ["Crisp", "Balanced", "Soft"][warmthIndex]} />
          <div style={{ display: "grid", gap: "0.4rem" }}><strong>{hi ? "रोशनी" : "Light & dark"}</strong><Segmented value={preferences.colorMode} onChange={(colorMode) => updatePreferences({ colorMode })} label={hi ? "रोशनी चुनें" : "Choose light mode"} options={[{ value: "auto", label: hi ? "अपने-आप" : "Auto" }, { value: "light", label: hi ? "उजला" : "Light" }, { value: "dark", label: hi ? "गहरा" : "Dark" }]} /></div>
          <RangeRow label={hi ? "मार्गदर्शन की गहराई" : "Guidance depth"} minLabel={hi ? "मार्गदर्शित" : "Guided"} maxLabel={hi ? "विशेषज्ञ" : "Expert"} value={depthIndex} min={0} max={2} onChange={(index) => updatePreferences({ depth: ["guided", "balanced", "expert"][index] as any, preset: "custom" })} output={hi ? ["सरल", "संतुलित", "विशेषज्ञ"][depthIndex] : ["Guided", "Balanced", "Expert"][depthIndex]} />
          <div style={{ padding: T.s3, borderRadius: T.rMd, background: "var(--bg-active)", border: "0.0625rem solid var(--line)" }}><strong>{hi ? "रंग से अधिक स्पष्टता" : "Meaning beyond colour"}</strong><div style={{ display: "flex", flexWrap: "wrap", gap: T.s3, marginTop: T.s2 }}><span style={{ color: "var(--good)", fontWeight: 700 }}>✓ {hi ? "शुभ" : "Auspicious"}</span><span style={{ color: "var(--bad)", fontWeight: 700 }}>⚠ {hi ? "टालें" : "Avoid"}</span></div></div>
        </div>
      </details>

      <details style={sectionStyle}>
        <summary className="comfort-focus" style={summaryStyle}><span>★ {hi ? "आप क्या मानते हैं" : "What you follow"}</span><span aria-hidden="true">⌄</span></summary>
        <div style={{ display: "grid", gap: T.s3, padding: `0 ${T.s4} ${T.s4}` }}>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: T.fSmall }}>{hi ? "चुने हुए पर्व और स्मरण इस डिवाइस पर याद रहते हैं—बाकी कभी छिपते नहीं।" : "Followed observances are remembered on this device; nothing else is hidden."}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: T.s2 }}>
            {FOLLOW_CHOICES.map((choice) => { const active = preferences.following.includes(choice.key); return <button key={choice.key} type="button" className="comfort-control comfort-focus" aria-pressed={active} onClick={() => toggleFollow(choice.key)} style={{ display: "flex", alignItems: "center", gap: T.s2, padding: `0 ${T.s3}`, border: `0.0625rem solid ${active ? "var(--accent)" : "var(--line)"}`, background: active ? "color-mix(in srgb, var(--accent), var(--surface) 91%)" : "var(--surface-active)", color: "var(--ink)", cursor: "pointer", textAlign: "left" }}><span aria-hidden="true">{choice.icon}</span><span style={{ flex: 1 }}>{hi ? choice.hi : choice.en}</span><span aria-hidden="true" style={{ color: active ? "var(--accent)" : "var(--muted)" }}>{active ? "★" : "☆"}</span></button>; })}
          </div>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: T.fMicro }}>{hi ? "यह धार्मिक पसंद संवेदनशील है। यह इसी डिवाइस पर रहती है और अलग स्पष्ट अनुमति के बिना साझा या विश्लेषित नहीं होती।" : "Religious preferences are sensitive. They remain on this device and are never synced or analyzed without separate explicit consent."}</p>
        </div>
      </details>

      <details style={sectionStyle}>
        <summary className="comfort-focus" style={summaryStyle}><span>📍 {hi ? "स्थान और भाषा" : "Place & language"}</span><span aria-hidden="true">⌄</span></summary>
        <div style={{ display: "grid", gap: T.s3, padding: `0 ${T.s4} ${T.s4}` }}>
          <label style={{ display: "grid", gap: "0.35rem" }}><strong>{hi ? "घर का स्थान" : "Home place"}</strong><PlaceInput inputId="personalize-place" value={place} onPick={onPlace} C={C} lang={lang} /></label>
          <div style={{ display: "grid", gap: "0.35rem" }}><strong>{hi ? "भाषा" : "Language"}</strong><Segmented value={lang} onChange={onLanguage} label={hi ? "भाषा चुनें" : "Choose language"} options={[{ value: "hi", label: "हिन्दी" }, { value: "en", label: "English" }]} /></div>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: T.fSmall }}>{hi ? "कैलेंडर पद्धति Today स्क्रीन पर तारीख़ के पास रहती है। साझा लिंक का स्थान और भाषा केवल उस लिंक के लिए पहले माने जाते हैं।" : "Calendar convention stays beside the date on Today. An explicit place or language in a shared link wins for that link only."}</p>
        </div>
      </details>

      <details style={sectionStyle}>
        <summary className="comfort-focus" style={summaryStyle}><span>🔊 {hi ? "ध्वनि" : "Sound"}</span><span aria-hidden="true">⌄</span></summary>
        <div style={{ display: "grid", gap: T.s3, padding: `0 ${T.s4} ${T.s4}` }}>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: T.fSmall }}>{hi ? "सुनें बटन आज के पंचांग, पर्व कथा और पूजा-विधि पर दिखाई देता है। उपलब्ध होने पर गणक हिन्दी आवाज़ चुनता है।" : "Listen appears on today's Panchang, festival stories and worship guidance. Ganak selects an Indian-language voice when available."}</p>
          <RangeRow label={hi ? "बोलने की गति" : "Speaking speed"} minLabel={hi ? "धीमी" : "Slower"} maxLabel={hi ? "तेज़" : "Faster"} value={preferences.speechRate} min={0.75} max={1.2} step={0.05} onChange={(speechRate) => updatePreferences({ speechRate })} output={`${preferences.speechRate.toFixed(2)}×`} />
          <ReadAloudButton lang={lang} text={hi ? "नमस्ते। आज का पंचांग सुनने के लिए यह नमूना है।" : "Namaste. This is a sample of Ganak's read-aloud voice."} label={hi ? "🔊 आवाज़ सुनें" : "🔊 Test voice"} />
        </div>
      </details>

      <details style={sectionStyle}>
        <summary className="comfort-focus" style={summaryStyle}><span>🔒 {hi ? "गोपनीयता और डेटा" : "Privacy & data"}</span><span aria-hidden="true">⌄</span></summary>
        <div style={{ display: "grid", gap: T.s3, padding: `0 ${T.s4} ${T.s4}` }}>
          {storageError && <div role="alert" style={{ padding: T.s3, borderRadius: T.rMd, border: "0.0625rem solid var(--bad)", color: "var(--bad)" }}>{hi ? "इस डिवाइस पर आपकी पसंद सुरक्षित नहीं हो सकी। बदलाव अभी चलेंगे, पर अगली बार याद न रहें।" : "Preferences could not be saved on this device. Changes work now but may not be remembered next time."}</div>}
          <label className="comfort-choice" style={{ display: "flex", alignItems: "flex-start", gap: T.s2 }}><input type="checkbox" checked={preferences.privacy.analytics} onChange={(e) => updatePreferences({ privacy: { ...preferences.privacy, analytics: e.target.checked } })} /><span><strong>{hi ? "गोपनीय उपयोग आँकड़े" : "Privacy-controlled usage analytics"}</strong><small style={{ display: "block", color: "var(--muted)" }}>{hi ? "कच्चा प्रश्न, जन्म विवरण या धार्मिक पसंद शामिल नहीं।" : "Never includes raw questions, birth details or religious preferences."}</small></span></label>
          <label className="comfort-choice" style={{ display: "flex", alignItems: "flex-start", gap: T.s2 }}><input type="checkbox" checked={preferences.privacy.research} onChange={(e) => updatePreferences({ privacy: { ...preferences.privacy, research: e.target.checked } })} /><span><strong>{hi ? "अनाम शोध में स्वैच्छिक योगदान" : "Voluntary anonymous research contribution"}</strong><small style={{ display: "block", color: "var(--muted)" }}>{hi ? "हर संवेदनशील प्रश्न साझा करने से पहले अलग सहमति फिर भी आवश्यक है।" : "Each sensitive question still requires separate consent before sharing."}</small></span></label>
          <label className="comfort-choice" style={{ display: "flex", alignItems: "flex-start", gap: T.s2 }}><input type="checkbox" checked={preferences.privacy.sensitiveSync} onChange={(e) => updatePreferences({ privacy: { ...preferences.privacy, sensitiveSync: e.target.checked } })} /><span><strong>{hi ? "धार्मिक पसंद सिंक करने की स्पष्ट अनुमति" : "Explicitly allow religious-preference sync"}</strong><small style={{ display: "block", color: "var(--muted)" }}>{hi ? "अभी कोई सिंक सेवा जुड़ी नहीं है; यह केवल आपकी स्पष्ट अनुमति दर्ज करता है।" : "No sync service is connected yet; this records consent only."}</small></span></label>
          <details style={{ padding: T.s3, border: "0.0625rem solid var(--line)", borderRadius: T.rMd }}><summary className="comfort-focus" style={{ cursor: "pointer", fontWeight: 700 }}>{hi ? "इस डिवाइस पर याद डेटा देखें" : "Review remembered data"}</summary><dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.35rem 0.75rem", marginBottom: 0, fontSize: T.fSmall }}><dt>{hi ? "आराम" : "Comfort"}</dt><dd>{preferences.preset}</dd><dt>{hi ? "घर का स्थान" : "Home place"}</dt><dd>{preferences.homePlace?.label || (hi ? "याद नहीं" : "Not remembered")}</dd><dt>{hi ? "अनुसरण" : "Following"}</dt><dd>{preferences.following.length}</dd><dt>{hi ? "भाषा" : "Language"}</dt><dd>{preferences.language === "auto" ? (hi ? "डिवाइस के अनुसार" : "Device default") : preferences.language}</dd></dl>{exactFestivalFollows.length > 0 && <div style={{ display: "grid", gap: T.s2, marginTop: T.s3 }}><strong>{hi ? "अनुसरण किए पर्व" : "Followed festivals"}</strong>{exactFestivalFollows.map((item) => <button key={item.storedKey} type="button" className="comfort-control comfort-focus" onClick={() => toggleFollow(item.storedKey)} aria-label={`${hi ? "अनुसरण हटाएँ" : "Unfollow"}: ${item.label}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: T.s2, border: "0.0625rem solid var(--line)", background: "var(--surface-active)", color: "var(--ink)", padding: `0 ${T.s3}`, cursor: "pointer" }}><span>★ {item.label}</span><span aria-hidden="true">×</span></button>)}</div>}</details>
          {!confirmClear ? <button type="button" className="comfort-control comfort-focus" onClick={() => setConfirmClear(true)} style={{ justifySelf: "start", border: "0.0625rem solid var(--bad)", background: "transparent", color: "var(--bad)", padding: `0 ${T.s3}`, cursor: "pointer" }}>{hi ? "सभी पसंद साफ़ करें" : "Clear all preferences"}</button> : <div role="alert" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: T.s2, padding: T.s3, border: "0.0625rem solid var(--bad)", borderRadius: T.rMd }}><span style={{ flex: "1 1 12rem" }}>{hi ? "रूप, स्थान, भाषा और अनुसरण की पसंद साफ़ करें?" : "Clear comfort, place, language and follow preferences?"}</span><button type="button" className="comfort-control comfort-focus" onClick={() => { onClearPreferences(); setConfirmClear(false); }} style={{ border: "none", background: "var(--bad)", color: "var(--surface)", padding: `0 ${T.s3}`, cursor: "pointer" }}>{hi ? "हाँ, साफ़ करें" : "Yes, clear"}</button><button type="button" className="comfort-control comfort-focus" onClick={() => setConfirmClear(false)} style={{ border: "none", background: "transparent", color: "var(--ink)", cursor: "pointer" }}>{hi ? "रहने दें" : "Cancel"}</button></div>}
        </div>
      </details>

      <button type="button" className="comfort-control comfort-focus" onClick={() => setParentSetup(true)} style={{ border: "0.0625rem solid var(--accent)", background: "var(--surface-active)", color: "var(--accent)", padding: `0 ${T.s4}`, cursor: "pointer", fontWeight: 700 }}>👪 {hi ? "माता-पिता के लिए सेट करें" : "Set it up for a parent"}</button>
    </main>
  );
}
