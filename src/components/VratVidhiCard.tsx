/* Vrat vidhi card — pure extraction (SPLIT-UI-CONTENT-01). Wire deferred. */

import React, { useState, useEffect } from "react";
import { T, R as RT } from "./ui-style-contract";
import { VRAT_VIDHI_LABELS } from "../data/vrat-vidhis";
import { kathaParagraphs, parseKathaLine } from "../data/guide-katha-format";
import ReadAloudButton from "../accessibility/ReadAloudButton";
import { privacyEvent } from "../telemetry/privacy-events";

// ————————————————————————————— Multi-language aarti —————————————————————————————
// One aarti carries several language renderings under `langs` (hi/mr/bn/gu/roman).
// The chip row is independent of the app's EN/HI setting: it lets the reader pick the
// script for THIS aarti, defaults to `primaryLang`, and remembers the choice across
// aartis via localStorage. Non-Hindi (regional) renderings show the R3.5 humility
// disclaimer + a "suggest a correction" box that POSTs to the live /api/feedback.

const AARTI_LANG_LABEL = { hi: "हिन्दी", mr: "मराठी", bn: "বাংলা", gu: "ગુજરાતી", roman: "Roman" };
const AARTI_LANG_ORDER = ["hi", "mr", "bn", "gu", "roman"];
const REGIONAL_LANGS = new Set(["mr", "bn", "gu"]);
const AARTI_LANG_STORE_KEY = "ganak:aartiLang";

// R3.5 humility disclaimer — EN line + native-language line, per regional script.
const AARTI_DISCLAIMER_EN =
  "While we are trying our best, there may still be errors in rendering. Please forgive us, and help us by correcting the wrong word.";
const AARTI_DISCLAIMER_NATIVE = {
  mr: "आम्ही सर्वतोपरी प्रयत्न करत आहोत, तरीही मांडणीत काही चुका राहू शकतात. कृपया आम्हांला क्षमा करा आणि चुकीचा शब्द सुधारून आम्हांला मदत करा.",
  bn: "আমরা যথাসাধ্য চেষ্টা করছি, তবুও উপস্থাপনায় ভুল থেকে যেতে পারে। অনুগ্রহ করে আমাদের ক্ষমা করবেন এবং ভুল শব্দ সংশোধন করে আমাদের সাহায্য করুন।",
  gu: "અમે અમારાથી બનતો શ્રેષ્ઠ પ્રયાસ કરી રહ્યા છીએ, છતાં રજૂઆતમાં ભૂલ રહી શકે છે. કૃપા કરી અમને માફ કરો અને ખોટો શબ્દ સુધારીને અમારી મદદ કરો.",
};

const AARTI_FEEDBACK_ENDPOINT = String(import.meta.env?.VITE_FEEDBACK_ENDPOINT || "/api/feedback").trim();

function safeReadAartiLang() {
  try { return window.localStorage.getItem(AARTI_LANG_STORE_KEY) || ""; } catch (e) { return ""; }
}
function safeWriteAartiLang(v) {
  try { window.localStorage.setItem(AARTI_LANG_STORE_KEY, v); } catch (e) { /* private mode / blocked */ }
}

// One aarti block: language chips + refrain/cue/stanzas + (regional) disclaimer & box.
function AartiBlock({ aarti, L, C }) {
  const avail = AARTI_LANG_ORDER.filter((k) => aarti.langs && aarti.langs[k]);
  const primary = aarti.langs[aarti.primaryLang] ? aarti.primaryLang : avail[0];
  const [sel, setSel] = useState(primary);

  // Honour the remembered choice only if this aarti actually has that language.
  useEffect(() => {
    const stored = safeReadAartiLang();
    setSel(stored && aarti.langs[stored] ? stored : primary);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aarti.slug]);

  const pick = (k) => { setSel(k); safeWriteAartiLang(k); };
  const script = aarti.langs[sel] || aarti.langs[primary];
  const isRegional = REGIONAL_LANGS.has(sel);

  return (
    <>
      {avail.length > 1 && (
        <div role="group" aria-label="Aarti language" style={{ display: "flex", flexWrap: "wrap", gap: "0.3125rem", margin: "0.375rem 0 0.125rem" }}>
          {avail.map((k) => {
            const active = k === sel;
            return (
              <button
                key={k}
                type="button"
                aria-pressed={active}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); pick(k); }}
                style={{
                  padding: "0.1875rem 0.5rem", borderRadius: T.rSm, cursor: "pointer",
                  fontSize: T.fMicro, lineHeight: 1.4,
                  border: `0.0625rem solid ${active ? C.gold : C.line}`,
                  background: active ? C.gold : "transparent",
                  color: active ? "var(--on-accent)" : C.gold,
                  fontWeight: active ? 700 : 500,
                }}
              >
                {AARTI_LANG_LABEL[k] || k}
              </button>
            );
          })}
        </div>
      )}
      <div style={{ fontSize: T.fSmall, lineHeight: 1.8, marginTop: "0.375rem" }}>
        <div style={{ whiteSpace: "pre-line", color: C.gold, fontWeight: 600 }}>{script.refrain}</div>
        {script.stanzas.map((s, j) => (
          <React.Fragment key={j}>
            <div style={{ whiteSpace: "pre-line", color: C.ivory, marginTop: "1em" }}>{s}</div>
            <div style={{ color: C.gold, fontWeight: 600, marginTop: "0.1em" }}>{script.cue}</div>
          </React.Fragment>
        ))}
      </div>
      {isRegional && (
        <AartiRegionalNote slug={aarti.slug} lang={sel} L={L} C={C} />
      )}
    </>
  );
}

// R3.5: humility disclaimer + correction box, shown only for regional (non-Hindi) scripts.
function AartiRegionalNote({ slug, lang, L, C }) {
  const [open, setOpen] = useState(false);
  const [flagged, setFlagged] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [statusKind, setStatusKind] = useState(""); // "ok" | "err" | ""
  const [status, setStatus] = useState("");
  const [hp, setHp] = useState(""); // honeypot — humans never fill this; bots do
  const say = (kind, text) => { setStatusKind(kind); setStatus(text); };

  const send = async () => {
    const text = suggestion.trim();
    if (text.length < 3) return say("err", L === "hi" ? "कृपया सही शब्द या पंक्ति लिखें।" : "Please type the correct word or line.");
    if (!AARTI_FEEDBACK_ENDPOINT) return say("err", L === "hi" ? "प्रतिक्रिया सेवा अभी जुड़ी नहीं है।" : "The feedback service is not connected yet.");
    try {
      const res = await fetch(AARTI_FEEDBACK_ENDPOINT, {
        method: "POST", credentials: "omit", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "aarti_correction", slug, lang, flagged_text: flagged.trim().slice(0, 500), suggestion: text.slice(0, 2000), route: location.pathname, hp }),
      });
      if (!res.ok) throw new Error("feedback failed");
      setFlagged(""); setSuggestion("");
      say("ok", L === "hi" ? "धन्यवाद! आपका सुधार भेज दिया गया है।" : "Thank you! Your correction has been sent.");
      privacyEvent("feedback_sent", { area: "aarti_correction", language: lang, outcome: "sent" });
    } catch (e) {
      say("err", L === "hi" ? "सुधार नहीं भेजा जा सका—बाद में फिर प्रयास करें।" : "Couldn’t send the correction—please try again later.");
    }
  };

  const native = AARTI_DISCLAIMER_NATIVE[lang];
  return (
    <div className="no-print" style={{ marginTop: "0.5rem", padding: "0.4375rem 0.5625rem", borderRadius: T.rSm, background: "var(--surface-hover)", border: `0.0625rem solid ${C.line}` }}>
      <div style={{ fontSize: T.fMicro, color: C.muted, lineHeight: 1.5 }}>{AARTI_DISCLAIMER_EN}</div>
      {native && <div style={{ fontSize: T.fMicro, color: C.muted, lineHeight: 1.5, marginTop: "0.25rem" }}>{native}</div>}
      <button
        type="button"
        aria-expanded={open}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        style={{ marginTop: "0.375rem", border: 0, background: "transparent", color: C.gold, cursor: "pointer", fontSize: T.fMicro, fontWeight: 600, padding: 0 }}
      >
        {L === "hi" ? "सुधार सुझाएँ" : "Suggest a correction"}
      </button>
      {open && (
        <div style={{ marginTop: "0.375rem" }}>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={hp} onChange={(e) => setHp(e.target.value)} style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
          <input
            type="text" value={flagged} onChange={(e) => setFlagged(e.target.value)} maxLength={500}
            placeholder={L === "hi" ? "गलत शब्द / पंक्ति (वैकल्पिक)" : "Wrong word / line (optional)"}
            style={{ width: "100%", boxSizing: "border-box", border: `0.0625rem solid ${C.line}`, borderRadius: T.rSm, padding: "0.375rem 0.5rem", font: "inherit", fontSize: T.fSmall }}
          />
          <textarea
            value={suggestion} onChange={(e) => setSuggestion(e.target.value)} maxLength={2000} rows={3}
            placeholder={L === "hi" ? "सही शब्द / पंक्ति" : "The correct word / line"}
            style={{ width: "100%", boxSizing: "border-box", marginTop: "0.375rem", border: `0.0625rem solid ${C.line}`, borderRadius: T.rSm, padding: "0.375rem 0.5rem", font: "inherit", fontSize: T.fSmall }}
          />
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); send(); }}
            style={{ marginTop: "0.375rem", minHeight: T.ctrlH, borderRadius: T.rSm, border: 0, padding: "0.375rem 0.875rem", background: C.gold, color: "var(--on-accent)", cursor: "pointer", fontSize: T.fSmall }}
          >
            {L === "hi" ? "भेजें" : "Send"}
          </button>
          {status && (
            <div role="status" aria-live="polite" style={{ marginTop: "0.375rem", fontSize: T.fSmall, fontWeight: 600, color: statusKind === "ok" ? "#1F7A4D" : statusKind === "err" ? C.sindoor : C.muted }}>
              {statusKind === "ok" ? "✓ " : ""}{status}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function VratVidhiCard({ data, lang, C, initiallyOpen = false }) {
  const [open, setOpen] = useState(initiallyOpen);
  if (!data) return null;
  const L = lang === "hi" ? "hi" : "en";
  const lbl = (k) => VRAT_VIDHI_LABELS[k][L];
  const txt = (obj) => (obj && (obj[L] || obj.en)) || "";
  const section = (title, body) => (
    <div style={{ marginTop: "0.5rem" }}>
      <div style={{ ...T.label, color: C.gold, marginBottom: "0.1875rem" }}>{title}</div>
      <div style={{ fontSize: T.fSmall, color: C.ivory, lineHeight: 1.55 }}>{body}</div>
    </div>
  );
  const stepList = (steps) => (
    <ol style={{ margin: "0.3125rem 0 0", paddingLeft: "1.25rem" }}>
      {(steps || []).map((step, i) => (
        <li key={i} style={{ marginBottom: "0.375rem" }}>{txt(step)}</li>
      ))}
    </ol>
  );
  const pujaBody = data.pujaMaterials || data.pujaPanchopachara || data.pujaShodashopachara || data.pujaCompletion ? (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
      <div>{txt(data.puja)}</div>
      {data.pujaMaterials && (
        <div style={{ padding: "0.5rem 0.5625rem", borderRadius: T.rSm, background: "var(--surface-hover)", border: `0.0625rem solid ${C.line}` }}>
          <div style={{ ...T.label, color: C.gold, marginBottom: "0.1875rem" }}>{lbl("materials")}</div>
          <div>{txt(data.pujaMaterials)}</div>
        </div>
      )}
      {data.pujaPanchopachara && (
        <div>
          <div style={{ fontWeight: 700, color: C.ink }}>{lbl("panchopachara")}</div>
          {stepList(data.pujaPanchopachara)}
        </div>
      )}
      {data.pujaShodashopachara && (
        <details style={{ borderTop: `0.0625rem solid ${C.line}`, paddingTop: "0.5rem" }}>
          <summary style={{ color: C.gold, fontWeight: 700, cursor: "pointer" }}>{lbl("shodashopachara")}</summary>
          {stepList(data.pujaShodashopachara)}
        </details>
      )}
      {data.pujaCompletion && (
        <div>
          <div style={{ fontWeight: 700, color: C.ink, marginBottom: "0.1875rem" }}>{lbl("afterPuja")}</div>
          <div>{txt(data.pujaCompletion)}</div>
        </div>
      )}
    </div>
  ) : txt(data.puja);
  const listenText = [
    txt(data.verdict), txt(data.meaning),
    ...(data.vidhi || []).map(txt),
    txt(data.puja), txt(data.paran),
  ].filter(Boolean);
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ marginTop: "0.5rem", width: "100%", boxSizing: "border-box", border: `0.0625rem solid ${C.line}`, borderRadius: T.rMd, background: "var(--surface-sunken)", overflow: "hidden" }}
    >
      <div style={{ padding: "0.5625rem 0.6875rem", fontSize: T.fSmall, color: C.ivory, lineHeight: 1.5, fontWeight: 600 }}>
        {txt(data.verdict)}
      </div>
      <button
        type="button"
        aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        style={{ width: "100%", minHeight: T.ctrlH, boxSizing: "border-box", padding: "0 0.6875rem", border: "none", borderTop: `0.0625rem solid ${C.line}`, background: open ? "var(--surface-hover)" : "transparent", color: C.gold, cursor: "pointer", fontFamily: T.serif, fontSize: T.fSmall, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", textAlign: "left" }}
      >
        <span>{open ? lbl("hideHowTo") : lbl("showHowTo")}</span>
        <span aria-hidden="true" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s", flexShrink: 0 }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: "0.625rem 0.6875rem 0.75rem", borderTop: `0.0625rem solid ${C.line}`, display: "flex", flexDirection: "column", gap: "0.125rem" }}>
          {listenText.length > 0 && <div style={{ marginTop: RT.s2 }}><ReadAloudButton text={listenText} lang={L} compact label={L === "hi" ? "🔊 विधि सुनें" : "🔊 Listen to the steps"} /></div>}
          {data.meaning && section(lbl("meaning"), txt(data.meaning))}
          {section(lbl("vidhi"), (
            <ol style={{ margin: 0, paddingLeft: "1.125rem" }}>
              {(data.vidhi || []).map((step, i) => (
                <li key={i} style={{ marginBottom: "0.25rem" }}>{txt(step)}</li>
              ))}
            </ol>
          ))}
          {section(lbl("diet"), (
            data.dietAvoid || data.dietLighter ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3125rem" }}>
                {data.dietAvoid && <div><span style={{ color: C.sindoor, fontWeight: 600 }}>{lbl("avoid")}: </span>{txt(data.dietAvoid)}</div>}
                {data.dietLighter && <div><span style={{ color: "var(--good)", fontWeight: 600 }}>{lbl("lighter")}: </span>{txt(data.dietLighter)}</div>}
              </div>
            ) : txt(data.diet)
          ))}
          {section(lbl("sankalpa"), <span style={{ fontStyle: "italic" }}>{txt(data.sankalpa)}</span>)}
          {section(lbl("puja"), pujaBody)}
          {data.aartis && data.aartis.length > 0 && (
            <div style={{ marginTop: "0.5rem" }}>
              <div style={{ ...T.label, color: C.gold, marginBottom: "0.1875rem" }}>{lbl("aarti")}</div>
              {data.aartis.map((a, i) => (
                <details key={i} style={{ borderTop: `0.0625rem solid ${C.line}`, paddingTop: "0.5rem", marginTop: i ? 6 : 0 }}>
                  <summary style={{ color: C.gold, fontWeight: 700, cursor: "pointer" }}>
                    {txt(a.title)}
                  </summary>
                  {a.intro && txt(a.intro) && (
                    <div style={{ fontSize: T.fMicro, color: C.muted, lineHeight: 1.5, margin: "0.375rem 0" }}>
                      {txt(a.intro)}
                    </div>
                  )}
                  <AartiBlock aarti={a} L={L} C={C} />
                </details>
              ))}
              <div style={{ fontSize: T.fMicro, color: C.muted, lineHeight: 1.5, marginTop: "0.5rem" }}>
                {lbl("aartiDisclaimer")}
              </div>
            </div>
          )}
          {data.stories && section(lbl("stories"), (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {data.stories.map((story, i) => {
                const raw = txt(story);
                const { region, body } = parseKathaLine(raw);
                return (
                  <div
                    key={i}
                    style={{
                      padding: "0.5625rem 0.625rem",
                      borderRadius: T.rSm,
                      background: "var(--surface-hover)",
                      border: `0.0625rem solid ${C.line}`,
                    }}
                  >
                    {region && (
                      <div style={{ ...T.label, color: C.gold, marginBottom: "0.3125rem", lineHeight: 1.4 }}>{region}</div>
                    )}
                    <div style={{ fontSize: T.fSmall, color: C.ivory, lineHeight: 1.65 }}>
                      {kathaParagraphs(body).map((para, j) => (
                        <p key={j} style={{ margin: j ? "0.7em 0 0" : 0 }}>{para}</p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {data.regional && section(lbl("regional"), (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {data.regional.map((tradition, i) => {
                const raw = txt(tradition);
                const paras = kathaParagraphs(raw);
                const [head, ...body] = paras.length > 1 ? paras : [raw];
                return (
                  <div
                    key={i}
                    style={{
                      padding: "0.5625rem 0.625rem",
                      borderRadius: T.rSm,
                      background: "var(--surface-hover)",
                      border: `0.0625rem solid ${C.line}`,
                    }}
                  >
                    <div style={{ fontWeight: 700, color: C.ink, marginBottom: body.length ? 6 : 0, lineHeight: 1.45 }}>
                      {head}
                    </div>
                    {body.map((para, j) => (
                      <p key={j} style={{ margin: j ? "0.65em 0 0" : 0, fontSize: T.fSmall, color: C.ivory, lineHeight: 1.65 }}>
                        {para}
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
          {section(lbl("paran"), txt(data.paran))}
          {section(lbl("udyapan"), txt(data.udyapan))}
          {data.safety && (
            <div style={{ marginTop: "0.5625rem", padding: "0.4375rem 0.5625rem", borderRadius: T.rSm, background: "var(--surface-hover)", border: `0.0625rem solid ${C.line}` }}>
              <div style={{ ...T.label, color: C.gold, marginBottom: "0.1875rem" }}>{lbl("safety")}</div>
              <div style={{ fontSize: T.fMicro, color: C.muted, lineHeight: 1.5 }}>{txt(data.safety)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VratVidhiCard;
export { VratVidhiCard };
