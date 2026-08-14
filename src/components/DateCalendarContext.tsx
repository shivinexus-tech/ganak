import React, { useState } from "react";
import { T } from "./ui-style-contract";

type DateCalendarContextProps = {
  lang: "en" | "hi" | string;
  placeControl: React.ReactNode;
  dateControl: React.ReactNode;
  calendarControl: React.ReactNode;
  holidayControl: React.ReactNode;
  sunrise?: string | null;
  sunset?: string | null;
  contextSummary?: React.ReactNode;
  status?: React.ReactNode;
  elevated?: boolean;
};

function FloralCorner({ side }: { side: "left" | "right" }) {
  const transform = side === "right" ? "translate(96 0) scale(-1 1)" : undefined;
  return (
    <svg aria-hidden="true" viewBox="0 0 96 112" focusable="false" style={{ display: "block", width: "100%", height: "100%" }}>
      <g transform={transform}>
        <path d="M12 101C24 78 29 55 31 25" fill="none" stroke="var(--gold)" strokeWidth="1.2" opacity=".7" />
        <path d="M27 54C15 50 10 42 11 34C21 35 29 42 31 50" fill="var(--good-surface)" stroke="var(--good)" strokeWidth="1" />
        <path d="M30 72C43 65 53 66 60 72C53 80 42 82 32 77" fill="var(--good-surface)" stroke="var(--good)" strokeWidth="1" />
        <path d="M29 35C40 30 48 23 50 14C39 13 30 19 27 29" fill="var(--good-surface)" stroke="var(--good)" strokeWidth="1" />
        <g transform="translate(25 17)">
          <circle cx="0" cy="0" r="11" fill="var(--bad-surface)" stroke="var(--bad)" strokeWidth="1" />
          <path d="M-7 0C-6-6 0-9 5-5C10-1 7 6 1 7C-5 8-9 4-7 0Z" fill="none" stroke="var(--bad)" strokeWidth="1.4" />
          <path d="M-3-3C1-6 5-3 4 1C3 4-1 5-3 2" fill="none" stroke="var(--bad)" strokeWidth="1.2" />
        </g>
        <g transform="translate(19 83)">
          <circle cx="0" cy="0" r="7" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1" />
          <path d="M0-5V5M-5 0H5M-3-3L3 3M3-3L-3 3" stroke="var(--accent)" strokeWidth=".8" />
        </g>
      </g>
    </svg>
  );
}

export default function DateCalendarContext({
  lang,
  placeControl,
  dateControl,
  calendarControl,
  holidayControl,
  sunrise,
  sunset,
  contextSummary,
  status,
  elevated = true,
}: DateCalendarContextProps) {
  const hi = lang === "hi";
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  return (
    <section
      id="date-calendar-context"
      className="date-calendar-context rise"
      aria-label={hi ? "स्थान, तारीख़ और कैलेंडर" : "Place, date and calendar context"}
      style={{
        position: "relative",
        zIndex: 1,
        marginBottom: T.s5,
        border: "0.0625rem solid var(--line)",
        borderRadius: T.rLg,
        backgroundColor: "var(--surface-active)",
        backgroundImage: "radial-gradient(circle at 0.0625rem 0.0625rem, color-mix(in srgb, var(--accent), transparent 84%) 0.0625rem, transparent 0.075rem)",
        backgroundSize: "0.75rem 0.75rem",
        boxShadow: elevated ? T.e2 : "none",
        overflow: "visible",
      }}
    >
      <style>{`
        .date-calendar-context__ornament{position:absolute;inset-block:0;width:5rem;pointer-events:none;opacity:.92;overflow:hidden}
        .date-calendar-context__ornament--left{left:0}
        .date-calendar-context__ornament--right{right:0}
        .date-calendar-context__grid{position:relative;z-index:2;display:grid;grid-template-columns:minmax(12rem,1fr) minmax(15rem,1.25fr);gap:var(--space-3);align-items:end;padding:var(--space-4) 4.5rem}
        .date-calendar-context__field{display:grid;gap:var(--space-1)}
        .date-calendar-context__field-label{font-size:var(--font-micro);font-weight:700;letter-spacing:.11em;color:var(--muted);text-transform:uppercase}
        .date-calendar-context__calendar-toggle{display:none}
        .date-calendar-context__calendar{display:flex;gap:var(--space-2);align-items:flex-end;flex-wrap:wrap}
        .date-calendar-context__solar{display:grid;grid-template-columns:repeat(2,minmax(6.25rem,auto));gap:var(--space-3);align-self:center}
        .date-calendar-context__solar-item{display:grid;grid-template-columns:auto auto;column-gap:.5rem;align-items:center;color:var(--ink);font-variant-numeric:tabular-nums;white-space:nowrap}
        .date-calendar-context__solar-icon{grid-row:1 / span 2;color:var(--gold);font-size:var(--font-heading);line-height:1}
        .date-calendar-context__solar-label{font-size:var(--font-micro);color:var(--muted)}
        .date-calendar-context__solar-value{font-size:var(--font-small);font-weight:700}
        .date-calendar-context__summary{position:relative;z-index:1;padding:0 4.5rem var(--space-3);font-size:var(--font-micro);line-height:1.5;color:var(--muted)}
        .date-calendar-context__status{position:relative;z-index:1;padding:0 4.5rem var(--space-3)}
        @media(max-width:42rem){.date-calendar-context__ornament{width:3.25rem;opacity:.58}.date-calendar-context__grid{grid-template-columns:1fr;padding:var(--space-4) 2.75rem;gap:var(--space-3)}.date-calendar-context__calendar-toggle{display:flex;align-items:center;justify-content:space-between;min-height:var(--control-height);padding:0 var(--space-3);border:.0625rem solid var(--line);border-radius:var(--radius-md);background:var(--surface-sunken);color:var(--ink);font:600 var(--font-small)/1.3 var(--font-body-family);cursor:pointer}.date-calendar-context__calendar{display:none;grid-template-columns:1fr}.date-calendar-context__calendar[data-open='true']{display:grid}.date-calendar-context__calendar>*,.date-calendar-context__calendar label,.date-calendar-context__calendar select{width:100%;min-width:0}.date-calendar-context__solar{grid-template-columns:repeat(2,minmax(0,1fr));padding-top:var(--space-2);border-top:.0625rem solid var(--line-soft)}.date-calendar-context__summary,.date-calendar-context__status{padding-inline:2.75rem}}
        @media(max-width:24rem){.date-calendar-context__solar{grid-template-columns:1fr}.date-calendar-context__ornament{display:none}.date-calendar-context__grid{padding-inline:var(--space-3)}.date-calendar-context__summary,.date-calendar-context__status{padding-inline:var(--space-3)}}
      `}</style>
      <div className="date-calendar-context__ornament date-calendar-context__ornament--left"><FloralCorner side="left" /></div>
      <div className="date-calendar-context__ornament date-calendar-context__ornament--right"><FloralCorner side="right" /></div>
      <div className="date-calendar-context__grid">
        <div className="date-calendar-context__field">
          <span className="date-calendar-context__field-label">{hi ? "स्थान" : "Place"}</span>
          {placeControl}
        </div>
        <div className="date-calendar-context__field">
          <span className="date-calendar-context__field-label">{hi ? "तारीख़" : "Date"}</span>
          {dateControl}
        </div>
        <button
          type="button"
          className="date-calendar-context__calendar-toggle comfort-focus"
          aria-expanded={mobileControlsOpen}
          aria-controls="date-calendar-context-controls"
          onClick={() => setMobileControlsOpen((open) => !open)}
        >
          <span>{hi ? "कैलेंडर और अवकाश" : "Calendar & holidays"}</span>
          <span aria-hidden="true">{mobileControlsOpen ? "−" : "+"}</span>
        </button>
        <div id="date-calendar-context-controls" className="date-calendar-context__calendar" data-open={mobileControlsOpen ? "true" : "false"}>
          {calendarControl}
          {holidayControl}
        </div>
        {(sunrise || sunset) && (
          <div className="date-calendar-context__solar" aria-label={hi ? "स्थानीय सूर्योदय और सूर्यास्त" : "Local sunrise and sunset"}>
            {sunrise && <div className="date-calendar-context__solar-item"><span className="date-calendar-context__solar-icon" aria-hidden="true">☼</span><span className="date-calendar-context__solar-label">{hi ? "सूर्योदय" : "Sunrise"}</span><span className="date-calendar-context__solar-value">{sunrise}</span></div>}
            {sunset && <div className="date-calendar-context__solar-item"><span className="date-calendar-context__solar-icon" aria-hidden="true">☾</span><span className="date-calendar-context__solar-label">{hi ? "सूर्यास्त" : "Sunset"}</span><span className="date-calendar-context__solar-value">{sunset}</span></div>}
          </div>
        )}
      </div>
      {contextSummary && <div className="date-calendar-context__summary">{contextSummary}</div>}
      {status && <div className="date-calendar-context__status">{status}</div>}
    </section>
  );
}
