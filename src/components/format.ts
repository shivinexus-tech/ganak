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

   Reference behaviour: Drik Panchang prints "02:21 AM, Jul 26".

   `lang` selects the locale of the appended date. Panchang clocks use the
   shared 12-hour convention below in both languages.
--------------------------------------------------------------------------- */
const localParts = (ms, tz, zone) => {
  if (zone) {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: false, hourCycle: "h23",
      }).formatToParts(new Date(ms));
      const get = (type) => Number((parts.find((p) => p.type === type) || {}).value);
      return { y:get("year"), m:get("month"), d:get("day"), h:get("hour") % 24, mi:get("minute") };
    } catch {
      // An invalid/missing IANA zone falls back to the already-computed numeric
      // offset; callers still get a visible time instead of a thrown render.
    }
  }
  const d = new Date(ms + tz * 3600000);
  return { y:d.getUTCFullYear(), m:d.getUTCMonth()+1, d:d.getUTCDate(), h:d.getUTCHours(), mi:d.getUTCMinutes() };
};
const localDayKey = (ms, tz, zone) => {
  const p = localParts(ms, tz, zone);
  return `${p.y}-${String(p.m).padStart(2,"0")}-${String(p.d).padStart(2,"0")}`;
};
const crossesDay = (ms, tz, refMs, zone) =>
  ms !== null && ms !== undefined && refMs !== null && refMs !== undefined
  && localDayKey(ms, tz, zone) !== localDayKey(refMs, tz, zone);
const dayDate = (ms, tz, lang, zone) =>
  zone
    ? new Date(ms).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { month: "short", day: "numeric", timeZone: zone })
    : new Date(ms + tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const fmtDateZone = (ms, tz, lang, zone, withYear = false) => {
  const options = { month: "short", day: "numeric", ...(withYear ? { year: "numeric" } : {}) };
  return zone
    ? new Date(ms).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { ...options, timeZone: zone })
    : new Date(ms + tz * 3600000).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-US", { ...options, timeZone: "UTC" });
};
const withDayDate = (clock, ms, tz, refMs, lang, zone) =>
  crossesDay(ms, tz, refMs, zone) ? `${clock}, ${dayDate(ms, tz, lang, zone)}` : clock;

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
const fmtTimeZone = (ms, tz, zone) => {
  if (ms === null || ms === undefined) return "—";
  const p = localParts(ms, tz, zone);
  const ap = p.h >= 12 ? "PM" : "AM", h = p.h % 12 || 12;
  return `${h}:${String(p.mi).padStart(2, "0")} ${ap}`;
};
const panchangTime = (ms, tz, lang, zone, englishStyle = "canonical") => {
  if (ms === null || ms === undefined) return "—";
  // Owner-approved convention: Hindi Panchang clocks use the same unambiguous
  // 12-hour AM/PM notation as Today/Muhurat. English legacy typography stays
  // byte-identical on cards that used locale formatting before this migration.
  if (lang === "hi" || englishStyle === "canonical") return fmtTimeZone(ms, tz, zone);
  const value = zone ? new Date(ms) : new Date(ms + tz * 3600000);
  return value.toLocaleTimeString("en-IN", {
    hour: englishStyle === "two-digit" ? "2-digit" : "numeric",
    minute: "2-digit", hour12: true, timeZone: zone || "UTC",
  });
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
const dayClock = (tz, refMs, lang, render, zone) => {
  const clock = render || ((ms) => panchangTime(ms, tz, lang, zone));
  return (ms) => (ms === null || ms === undefined ? "—" : withDayDate(clock(ms), ms, tz, refMs, lang, zone));
};

/* A window is one thing, so it carries its date once. Both ends on the same local
   date collapse to "12:43 AM–2:07 AM, Aug 15"; a window that straddles midnight
   dates only the end, "11:19 PM–12:43 AM, Aug 15". Both are Drik's own layout,
   and a window inside the panchang day is untouched. */
const dayRange = (tz, refMs, lang, render, zone) => {
  const clock = render || ((ms) => panchangTime(ms, tz, lang, zone));
  return (a, b, sep = "–") => {
    if (a === null || a === undefined || b === null || b === undefined) return "—";
    // A range carries one date, at the end. This stays true even for an unusual
    // multi-day range whose endpoints are on two different non-anchor dates.
    return `${clock(a)}${sep}${withDayDate(clock(b), b, tz, refMs, lang, zone)}`;
  };
};

export { fmtDeg, fmtTimeD, fmtTime, fmtTimeZone, panchangTime, fmtDateT, fmtDateZone, crossesDay, dayDate, withDayDate, dayClock, dayRange };
