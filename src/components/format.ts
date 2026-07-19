const fmtDeg = (x) => {
  const dDeg = Math.floor(x);
  const mIn = Math.floor((x - dDeg) * 60);
  return `${dDeg}°${String(mIn).padStart(2, "0")}′`;
};

const fmtTimeD = (ms, tz, refMs) => {
  if (ms === null || ms === undefined) return "—";
  const t = new Date(ms + tz * 3600000), r = new Date(refMs + tz * 3600000);
  const sameDay = t.getUTCDate() === r.getUTCDate() && t.getUTCMonth() === r.getUTCMonth();
  let h = t.getUTCHours(); const mi = t.getUTCMinutes();
  const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
  const base = `${h}:${String(mi).padStart(2, "0")} ${ap}`;
  return sameDay ? base : base + ", " + t.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
};
const fmtTime = (ms, tz) => {
  if (ms === null) return "—";
  const t = new Date(ms + tz * 3600000);
  let h = t.getUTCHours(); const mi = t.getUTCMinutes();
  const ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
  return `${h}:${String(mi).padStart(2, "0")} ${ap}`;
};

export { fmtDeg, fmtTimeD, fmtTime };
