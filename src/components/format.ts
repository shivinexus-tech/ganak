const fmtDeg = (x) => {
  const dDeg = Math.floor(x);
  const mIn = Math.floor((x - dDeg) * 60);
  return `${dDeg}°${String(mIn).padStart(2, "0")}′`;
};

/* ---------------------------------------------------------------------------
   Cross-midnight date contract (C3-CROSSMIDNIGHT-DATE).

   A panchang day runs from sunrise to the next sunrise, so tithi, nakshatra,
   yoga, karana, Nishita, Brahma Muhurta, night Choghadiya, the night half of
   the Gowri/Dur/Varjyam windows, moonset and parana all routinely END on the
   NEXT civil date. Rendered as a bare "till 7:34" such a value reads as the
   same day and is simply wrong.

   `withDayDate` is the ONE place that decides whether an instant needs its
   date. Every surface keeps rendering its clock exactly as it already did and
   passes the result through here, anchored to `refMs` — the day the value
   belongs to, normally the panchang day's sunrise. An instant inside that day
   is returned untouched, so this is a strict superset of the old output and no
   existing rendering changes.

   Reference behaviour: Drik Panchang prints "02:16 AM, Jul 26".

   `lang` selects the locale of the appended DATE only. The clock format is the
   caller's business: the Hindi 24-hour convention belongs to the festival
   pages' `formatLocalClock` and is deliberately not changed here.
--------------------------------------------------------------------------- */
const localDayIndex = (ms, tz) => Math.floor((ms + tz * 3600000) / 86400000);
const crossesDay = (ms, tz, refMs) =>
  ms !== null && ms !== undefined && refMs !== null && refMs !== undefined
  && localDayIndex(ms, tz) !== localDayIndex(refMs, tz);
const dayDate = (ms, tz, lang) =>
  new Date(ms + tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const withDayDate = (clock, ms, tz, refMs, lang) =>
  crossesDay(ms, tz, refMs) ? `${clock}, ${dayDate(ms, tz, lang)}` : clock;

const fmtTimeD = (ms, tz, refMs, lang) => {
  if (ms === null || ms === undefined) return "—";
  return withDayDate(fmtTime(ms, tz), ms, tz, refMs, lang);
};
const fmtTime = (ms, tz) => {
  if (ms === null) return "—";
  const t = new Date(ms + tz * 3600000);
  let h = t.getUTCHours(); const mi = t.getUTCMinutes();
  const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
  return `${h}:${String(mi).padStart(2, "0")} ${ap}`;
};

const fmtDateT = (ms, tz = 0, withTime = false) => {
  const d = new Date(ms + tz * 3600000);
  if (!withTime) return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
  const date = d.toLocaleDateString("en-IN", { month: "short", day: "numeric", timeZone: "UTC" });
  let h = d.getUTCHours(); const mi = d.getUTCMinutes();
  const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
  return `${date}, ${h}:${String(mi).padStart(2, "0")} ${ap}`;
};

/* Bind one clock to a panchang day. `render` defaults to the 12-hour clock used
   across Today/Muhurat; surfaces with their own locale-aware clock pass theirs
   so only the date suffix comes from here. */
const dayClock = (tz, refMs, lang, render = (ms) => fmtTime(ms, tz)) =>
  (ms) => (ms === null || ms === undefined ? "—" : withDayDate(render(ms), ms, tz, refMs, lang));

/* A window is one thing, so it carries its date once. Both ends on the same local
   date collapse to "12:43 AM–2:07 AM, Aug 15"; a window that straddles midnight
   dates only the end, "11:19 PM–12:43 AM, Aug 15". Both are Drik's own layout,
   and a window inside the panchang day is untouched. */
const dayRange = (tz, refMs, lang, render = (ms) => fmtTime(ms, tz)) =>
  (a, b, sep = "–") => {
    if (a === null || a === undefined || b === null || b === undefined) return "—";
    const left = localDayIndex(a, tz) === localDayIndex(b, tz)
      ? render(a)
      : withDayDate(render(a), a, tz, refMs, lang);
    return `${left}${sep}${withDayDate(render(b), b, tz, refMs, lang)}`;
  };

export { fmtDeg, fmtTimeD, fmtTime, fmtDateT, crossesDay, dayDate, withDayDate, dayClock, dayRange };

