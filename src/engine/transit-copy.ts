/* Transit duration + event gloss helpers (SPLIT-UI-CHART-05). Wire deferred. */

function fmtDur(ms) {
  const days = Math.round(ms / 86400000);
  if (days < 31) return days + (days === 1 ? " day" : " days");
  const months = Math.floor(days / 30.44);
  const remD = Math.round(days - months * 30.44);
  const years = Math.floor(months / 12);
  const remM = months % 12;
  const parts = [];
  if (years) parts.push(years + "y");
  if (remM) parts.push(remM + "m");
  if (!years && remD) parts.push(remD + "d");
  return parts.join(" ") || days + " days";
}

/* event detail enrichment */
const EVENT_DESC = {
  "Surya enters": "Sankranti marks the Sun's entry into a new sign, shifting seasonal energies and the rhythm of nature.",
  "Purnima": "Full moon — a peak of lunar power, heightened intuition and emotional intensity.",
  "Amavasya": "New moon — a reset point, ideal for new beginnings and introspection.",
  "enters": "A planet changing signs shifts its character and influence across domains of life.",
  "retrograde": "A planet appears to move backward, triggering introspection, review, and the ripening of past karma.",
  "direct": "A planet resumes forward motion, completing its review cycle and moving intention into action.",
};

function eventDetail(ev, now) {
  const until = ev.t - now;
  const days = Math.floor(until / 86400000);
  const hours = Math.floor((until % 86400000) / 3600000);
  let desc = "";
  for (const key of Object.keys(EVENT_DESC)) {
    if (ev.label.includes(key)) { desc = EVENT_DESC[key]; break; }
  }
  const timeStr = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h` : "Today";
  return { desc, timeStr, days, hours };
}

export { fmtDur, EVENT_DESC, eventDetail };
