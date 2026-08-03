import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles/design-tokens.css";
import "./today-prototype.css";

type Dialog = "place" | "date" | "reminder" | null;

function App() {
  const [dialog, setDialog] = useState<Dialog>(null);
  const [notice, setNotice] = useState("");

  function closeDialog() { setDialog(null); }

  function saveDialog() {
    setNotice(dialog === "reminder" ? "Reminder saved for this prototype." : "Preview choice saved.");
    setDialog(null);
  }

  return (
    <main className="figma-faithful-prototype" aria-label="Ganak Today mobile web prototype">
      <section className="figma-faithful-phone" aria-label="Approved Ganak Today visual">
        <img
          className="figma-faithful-artwork"
          src="/prototypes/today-master-figma.webp"
          alt="Ganak Today: Devshayani Ekadashi with Lord Vishnu in cosmic sleep, timings, Panchang and five-tab navigation"
        />

        <button className="figma-hotspot figma-hotspot--place comfort-focus" type="button" aria-label="Change place: New Delhi" onClick={() => setDialog("place")} />
        <button className="figma-hotspot figma-hotspot--date comfort-focus" type="button" aria-label="Change date: Sat 25 Jul 2026" onClick={() => setDialog("date")} />
        <button className="figma-hotspot figma-hotspot--read-more comfort-focus" type="button" aria-label="Read more about Devshayani Ekadashi" onClick={() => setNotice("Festival detail opens in the full app.")} />
        <button className="figma-hotspot figma-hotspot--remind comfort-focus" type="button" aria-label="Remind me" onClick={() => setDialog("reminder")} />
        <nav className="figma-hotspot-nav" aria-label="Primary navigation">
          <button className="comfort-focus" type="button" aria-current="page" aria-label="Today" onClick={() => setNotice("")} />
          <button className="comfort-focus" type="button" aria-label="Festivals" onClick={() => setNotice("Festivals opens in the full app.")} />
          <button className="comfort-focus" type="button" aria-label="Muhurat" onClick={() => setNotice("Muhurat opens in the full app.")} />
          <button className="comfort-focus" type="button" aria-label="Prashna" onClick={() => setNotice("Prashna opens in the full app.")} />
          <button className="comfort-focus" type="button" aria-label="Jyotish" onClick={() => setNotice("Jyotish opens in the full app.")} />
        </nav>

        {notice && <p className="figma-prototype-notice" role="status">{notice}</p>}
      </section>

      {dialog && <div className="figma-dialog-backdrop" role="presentation" onMouseDown={closeDialog}>
        <section className="figma-dialog" role="dialog" aria-modal="true" aria-labelledby="figma-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
          <div className="figma-dialog-handle" aria-hidden="true" />
          <h2 id="figma-dialog-title">{dialog === "place" ? "Choose place" : dialog === "date" ? "Choose date" : "Set a reminder"}</h2>
          {dialog === "place" && <label>City<input autoFocus defaultValue="New Delhi" /></label>}
          {dialog === "date" && <label>Date<input autoFocus type="date" defaultValue="2026-07-25" /></label>}
          {dialog === "reminder" && <><label className="figma-dialog-choice"><input type="radio" name="prototype-reminder" defaultChecked /> At sunrise</label><label className="figma-dialog-choice"><input type="radio" name="prototype-reminder" /> 30 min before Abhijit</label><p>Prototype only — real notification delivery is part of the reminders feature.</p></>}
          <div className="figma-dialog-actions"><button className="comfort-focus" type="button" onClick={closeDialog}>Cancel</button><button className="comfort-focus figma-dialog-save" type="button" onClick={saveDialog}>Save</button></div>
        </section>
      </div>}
    </main>
  );
}

createRoot(document.getElementById("today-prototype-root")!).render(<React.StrictMode><App /></React.StrictMode>);
