import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/eczar/500.css";
import "@fontsource/eczar/600.css";
import "@fontsource/eczar/700.css";
import "@fontsource/spectral/400.css";
import "@fontsource/spectral/600.css";
import "../styles/design-tokens.css";
import "./today-prototype.css";

type Locale = "en" | "hi";
type Editor = "place" | "date" | "reminder" | null;
type NavDestination = "today" | "festivals" | "muhurat" | "prashna" | "jyotish";

const COPY = {
  en: {
    today: "Today",
    heading: "Ganak Today",
    city: "New Delhi",
    date: "Sat 25 Jul 2026",
    festival: "Devshayani Ekadashi",
    festivalHi: "देवशयनी एकादशी",
    summary: "Vishnu begins his cosmic sleep; Chaturmas begins.",
    expanded: "A fasting day for quiet devotion, reflection and the beginning of Chaturmas.",
    readMore: "Read more",
    showLess: "Show less",
    timings: "Today’s timings",
    auspicious: "Auspicious · Abhijit",
    avoid: "Avoid · Rahu Kalam",
    panchang: "Panchang",
    remind: "Remind me",
    reminderSet: "Reminder set",
    tithi: "Tithi",
    tithiValue: "Shukla Ekadashi",
    nakshatra: "Nakshatra",
    nakshatraValue: "Jyeshtha till 7:34 AM",
    yoga: "Yoga",
    yogaValue: "Siddhi",
    karana: "Karana",
    karanaValue: "Balava",
    paksha: "Paksha",
    pakshaValue: "Shukla Paksha",
    festivals: "Festivals",
    muhurat: "Muhurat",
    prashna: "Prashna",
    jyotish: "Jyotish",
    locationTitle: "Choose place",
    dateTitle: "Choose date",
    save: "Save",
    cancel: "Cancel",
    reminderTitle: "Set a reminder",
    sunrise: "At sunrise",
    beforeAbhijit: "30 min before Abhijit",
    prototypeNote: "Prototype only — notification delivery comes with the Muhurat reminders feature.",
    selected: "Selected",
  },
  hi: {
    today: "आज",
    heading: "गणक आज",
    city: "नई दिल्ली",
    date: "शनि, 25 जुल॰ 2026",
    festival: "देवशयनी एकादशी",
    festivalHi: "Devshayani Ekadashi",
    summary: "भगवान विष्णु योगनिद्रा में प्रवेश करते हैं; चातुर्मास आरम्भ होता है।",
    expanded: "यह उपवास, शांत भक्ति और आत्मचिंतन का दिन है।",
    readMore: "और जानें",
    showLess: "कम दिखाएँ",
    timings: "आज के समय",
    auspicious: "शुभ · अभिजीत",
    avoid: "वर्जित · राहु काल",
    panchang: "पंचांग",
    remind: "स्मरण दिलाएँ",
    reminderSet: "स्मरण सेट है",
    tithi: "तिथि",
    tithiValue: "शुक्ल एकादशी",
    nakshatra: "नक्षत्र",
    nakshatraValue: "ज्येष्ठा · प्रातः 7:34 तक",
    yoga: "योग",
    yogaValue: "सिद्धि",
    karana: "करण",
    karanaValue: "बालव",
    paksha: "पक्ष",
    pakshaValue: "शुक्ल पक्ष",
    festivals: "पर्व",
    muhurat: "मुहूर्त",
    prashna: "प्रश्न",
    jyotish: "ज्योतिष",
    locationTitle: "स्थान चुनें",
    dateTitle: "तारीख चुनें",
    save: "सहेजें",
    cancel: "रद्द करें",
    reminderTitle: "स्मरण सेट करें",
    sunrise: "सूर्योदय पर",
    beforeAbhijit: "अभिजीत से 30 मिनट पहले",
    prototypeNote: "यह केवल प्रोटोटाइप है — वास्तविक सूचना सेवा मुहूर्त रिमाइंडर के साथ आएगी।",
    selected: "चुना हुआ",
  },
} as const;

function OutlineIcon({ name }: { name: "pin" | "calendar" | "chevron" | "bell" | "sun" | "avoid" | "today" | "festivals" | "muhurat" | "prashna" | "jyotish" }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const paths = {
    pin: <><path {...common} d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z" /><circle {...common} cx="12" cy="10" r="2" /></>,
    calendar: <><rect {...common} x="3.5" y="5" width="17" height="15" rx="2" /><path {...common} d="M7.5 3v4M16.5 3v4M3.5 9h17M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" /></>,
    chevron: <path {...common} d="m9 6 6 6-6 6" />,
    bell: <><path {...common} d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    sun: <><circle {...common} cx="12" cy="12" r="3.5" /><path {...common} d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    avoid: <><circle {...common} cx="12" cy="12" r="8" /><path {...common} d="M8.5 8.5 15.5 15.5" /></>,
    today: <><path {...common} d="M6 3.5h10.5a2 2 0 0 1 2 2V20.5H7.5a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z" /><path {...common} d="M9 7h6M9 11h6M9 15h3.5" /><path {...common} d="M4.5 7.5h1" /></>,
    festivals: <><path {...common} d="M3.5 20.5h17M5.5 18V10l6.5-6 6.5 6v8M9 18v-4.5h6V18M3.5 10h17" /><path {...common} d="M12 4V2.5" /></>,
    muhurat: <><circle {...common} cx="12" cy="12" r="8.5" /><path {...common} d="M12 7v5l3.5 2.5M12 1.5v2M12 20.5v2M1.5 12h2M20.5 12h2" /></>,
    prashna: <><path {...common} d="m5 19 2.5-6.5L16.8 3.2a2.1 2.1 0 1 1 3 3L10.5 15.5 5 19Z" /><path {...common} d="m14.8 5.2 4 4M5 19l4.5-1.5" /></>,
    jyotish: <><circle {...common} cx="12" cy="12" r="8.5" /><circle {...common} cx="12" cy="12" r="3" /><path {...common} d="M12 3.5v5.5M20.5 12H15M12 20.5V15M3.5 12H9M6 6l3.9 3.9M18 6l-3.9 3.9M18 18l-3.9-3.9M6 18l3.9-3.9" /></>,
  };
  return <svg className="prototype-icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function App() {
  const [locale, setLocale] = useState<Locale>("en");
  const [editor, setEditor] = useState<Editor>(null);
  const [city, setCity] = useState("New Delhi");
  const [date, setDate] = useState("2026-07-25");
  const [expanded, setExpanded] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);
  const [reminderChoice, setReminderChoice] = useState("sunrise");
  const [activeNav, setActiveNav] = useState<NavDestination>("today");
  const [notice, setNotice] = useState("");
  const c = COPY[locale];

  const panchang = [
    ["sun", c.tithi, c.tithiValue],
    ["jyotish", c.nakshatra, c.nakshatraValue],
    ["festivals", c.yoga, c.yogaValue],
    ["today", c.karana, c.karanaValue],
    ["avoid", c.paksha, c.pakshaValue],
  ] as const;
  const nav = [
    ["today", c.today],
    ["festivals", c.festivals],
    ["muhurat", c.muhurat],
    ["prashna", c.prashna],
    ["jyotish", c.jyotish],
  ] as const;
  const humanDate = date === "2026-07-25" ? c.date : new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`));

  function selectNav(destination: NavDestination) {
    setActiveNav(destination);
    if (destination !== "today") setNotice(`${c[destination]} ${locale === "hi" ? "स्क्रीन प्रोटोटाइप में अगली है" : "screen is next in the app prototype"}.`);
    else setNotice("");
  }

  function closeEditor() { setEditor(null); }
  function saveEditor() {
    if (editor === "reminder") setReminderSet(true);
    setEditor(null);
  }

  return (
    <main className="today-prototype" lang={locale}>
      <section className="prototype-phone" aria-label="Ganak Today mobile web prototype">
        <div className="prototype-floral-rail prototype-floral-rail--left" aria-hidden="true"><span>✿</span><span>❋</span><span>✦</span><span>❀</span><span>✿</span></div>
        <div className="prototype-floral-rail prototype-floral-rail--right" aria-hidden="true"><span>✿</span><span>❋</span><span>✦</span><span>❀</span><span>✿</span></div>
        <header className="prototype-header">
          <div className="prototype-topline">
            <p className="prototype-kicker">{c.today} · {locale === "hi" ? "पंचांग" : "Panchang"}</p>
            <button className="prototype-language comfort-focus" type="button" onClick={() => setLocale(locale === "en" ? "hi" : "en")} aria-label={locale === "en" ? "Switch to Hindi" : "Switch to English"}>{locale === "en" ? "हि" : "EN"}</button>
          </div>
          <h1>{c.heading}</h1>
          <div className="prototype-ornament" aria-hidden="true"><span></span><b>✦</b><span></span></div>
          <div className="prototype-place-date" aria-label="Place and date controls">
            <button className="prototype-field comfort-focus" type="button" onClick={() => setEditor("place")}>
              <OutlineIcon name="pin" /><span>{city === "New Delhi" ? c.city : city}</span><OutlineIcon name="chevron" />
            </button>
            <span className="prototype-separator" aria-hidden="true"></span>
            <button className="prototype-field comfort-focus" type="button" onClick={() => setEditor("date")}>
              <span>{humanDate}</span><OutlineIcon name="calendar" />
            </button>
          </div>
        </header>

        <div className="prototype-content">
          <section className="prototype-festival-copy" aria-labelledby="festival-title">
            <p className="prototype-lunar-name">{c.festivalHi}</p>
            <h2 id="festival-title">{c.festival}</h2>
            <p>{c.summary}</p>
            {expanded && <p className="prototype-expanded-copy">{c.expanded}</p>}
            <button type="button" className="prototype-text-action comfort-focus" onClick={() => setExpanded(!expanded)}>{expanded ? c.showLess : c.readMore} <span aria-hidden="true">→</span></button>
          </section>

          <section className="prototype-hero-arch" aria-label={locale === "hi" ? "शेषनाग पर योगनिद्रा में भगवान विष्णु" : "Lord Vishnu in cosmic sleep on Ananta Shesha"}>
            <div className="prototype-hero-scallop">
              <img src="/festival-images/raster/devshayani-prototype.webp" onError={(event) => { event.currentTarget.src = "/festival-images/raster/ekadashi.webp"; }} alt={locale === "hi" ? "शेषनाग पर योगनिद्रा में भगवान विष्णु" : "Lord Vishnu in cosmic sleep on Ananta Shesha"} />
              <div className="prototype-hero-glow" aria-hidden="true"></div>
            </div>
          </section>

          <section className="prototype-timing-panel" aria-labelledby="timings-heading">
            <h2 id="timings-heading">{c.timings}</h2>
            <div className="prototype-timing-grid">
              <div>
                <p><OutlineIcon name="sun" />{c.auspicious}</p>
                <strong>12:00–12:54</strong>
              </div>
              <div>
                <p><OutlineIcon name="avoid" />{c.avoid}</p>
                <strong>9:03–10:45</strong>
              </div>
            </div>
          </section>

          <section className="prototype-panchang" aria-labelledby="panchang-heading">
            <div className="prototype-section-head"><h2 id="panchang-heading">{c.panchang}</h2><span aria-hidden="true">✦</span></div>
            <dl>
              {panchang.map(([icon, label, value]) => <div key={label}>
                <dt><OutlineIcon name={icon} />{label}</dt>
                <dd>{value}<OutlineIcon name="chevron" /></dd>
              </div>)}
            </dl>
          </section>

          <button className={`prototype-remind comfort-focus ${reminderSet ? "is-set" : ""}`} type="button" onClick={() => setEditor("reminder")}>
            <OutlineIcon name="bell" /><span>{reminderSet ? c.reminderSet : c.remind}</span>
          </button>
          {notice && <p className="prototype-notice" role="status">{notice}</p>}
        </div>

        <nav className="prototype-nav" aria-label="Primary navigation">
          {nav.map(([destination, label]) => <button key={destination} type="button" className={`comfort-focus ${activeNav === destination ? "is-active" : ""}`} aria-current={activeNav === destination ? "page" : undefined} onClick={() => selectNav(destination)}>
            <OutlineIcon name={destination} /><span>{label}</span>
          </button>)}
        </nav>
      </section>

      {editor && <div className="prototype-dialog-backdrop" role="presentation" onMouseDown={closeEditor}>
        <section className="prototype-dialog" role="dialog" aria-modal="true" aria-labelledby="prototype-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
          <div className="prototype-dialog-handle" aria-hidden="true"></div>
          {editor === "place" && <><h2 id="prototype-dialog-title">{c.locationTitle}</h2><label>{locale === "hi" ? "शहर" : "City"}<input autoFocus value={city} onChange={(event) => setCity(event.target.value)} /></label></>}
          {editor === "date" && <><h2 id="prototype-dialog-title">{c.dateTitle}</h2><label>{locale === "hi" ? "तारीख" : "Date"}<input autoFocus type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label></>}
          {editor === "reminder" && <><h2 id="prototype-dialog-title">{c.reminderTitle}</h2><label className="prototype-radio"><input type="radio" value="sunrise" checked={reminderChoice === "sunrise"} onChange={(event) => setReminderChoice(event.target.value)} />{c.sunrise}</label><label className="prototype-radio"><input type="radio" value="abhijit" checked={reminderChoice === "abhijit"} onChange={(event) => setReminderChoice(event.target.value)} />{c.beforeAbhijit}</label><p>{c.prototypeNote}</p></>}
          <div className="prototype-dialog-actions"><button type="button" className="comfort-focus" onClick={closeEditor}>{c.cancel}</button><button type="button" className="comfort-focus prototype-dialog-save" onClick={saveEditor}>{c.save}</button></div>
        </section>
      </div>}
    </main>
  );
}

createRoot(document.getElementById("today-prototype-root")!).render(<React.StrictMode><App /></React.StrictMode>);
