/* Ganak public API, version 1.

   Every route is read-only, deterministic, and computed from the same engines the
   website uses. No user data is accepted or stored — a caller supplies a place and a
   date, and gets a calculation back. That is what keeps this API outside the privacy
   surface described in plans/legal-privacy-terms-draft.md. */

import { Router } from "express";
import { loadEngines, toPlace } from "./engines.mjs";
import {
  API_VERSION, panchangResponse, festivalsResponse, muhuratResponse,
  horaResponse, panchakaResponse,
} from "./contract.mjs";
import { keyFingerprint } from "./keys.mjs";

const err = (error, code) => ({ error, code });

/* ---- input validation -------------------------------------------------------
   Every failure returns the same { error, code } shape as the rest of the service,
   names the offending parameter, and never echoes unbounded caller input back. */

function parseDate(value, field = "date") {
  if (value === undefined || value === null || value === "")
    return { problem: err(`Provide ${field} as YYYY-MM-DD.`, "MISSING_DATE") };
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return { problem: err(`${field} must look like YYYY-MM-DD.`, "INVALID_DATE") };
  const [y, m, d] = value.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31)
    return { problem: err(`${field} is not a real date.`, "INVALID_DATE") };
  const ms = Date.UTC(y, m - 1, d);
  const back = new Date(ms);
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== d)
    return { problem: err(`${field} is not a real date.`, "INVALID_DATE") };
  if (y < 1900 || y > 2100)
    return { problem: err(`${field} must be between 1900 and 2100.`, "DATE_OUT_OF_RANGE") };
  return { value: { ms, y, m, d, text: value } };
}

function parsePlace(q) {
  const lat = Number(q.lat), lon = Number(q.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon))
    return { problem: err("Provide lat and lon as numbers.", "MISSING_PLACE") };
  if (lat < -90 || lat > 90)
    return { problem: err("lat must be between -90 and 90.", "INVALID_LAT") };
  if (lon < -180 || lon > 180)
    return { problem: err("lon must be between -180 and 180.", "INVALID_LON") };

  const tz = typeof q.tz === "string" && q.tz.trim() ? q.tz.trim() : "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
  } catch {
    return { problem: err("tz must be an IANA time zone, for example Asia/Kolkata.", "INVALID_TZ") };
  }
  return { value: { lat, lon, tz } };
}

function parseAyanamsa(value) {
  const a = (value ?? "lahiri").toString().trim().toLowerCase();
  if (a !== "lahiri" && a !== "kp")
    return { problem: err("ayanamsa must be 'lahiri' or 'kp'.", "INVALID_AYANAMSA") };
  return { value: a };
}

/* Bounded so one call cannot pin the CPU for minutes. */
function parseDays(value, { def, max }) {
  if (value === undefined || value === "") return { value: def };
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1)
    return { problem: err("days must be a positive whole number.", "INVALID_DAYS") };
  if (n > max)
    return { problem: err(`days must be ${max} or fewer.`, "DAYS_OUT_OF_RANGE") };
  return { value: n };
}

/* IANA zone -> hours offset on a given instant, which is what the engines take.
   Computed per-date so DST is handled rather than assumed. */
function tzOffsetHours(tz, ms) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, timeZoneName: "longOffset",
    year: "numeric", month: "2-digit", day: "2-digit",
  });
  const part = dtf.formatToParts(new Date(ms)).find((p) => p.type === "timeZoneName");
  const m = /GMT([+-]\d{1,2})(?::(\d{2}))?/.exec(part?.value || "");
  if (!m) return 0;
  const h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  return h + Math.sign(h || 1) * (min / 60);
}

export function createV1Router({ keyStore, requireKey }) {
  const router = Router();

  /* Engines are loaded once and reused. Loading here rather than at import time keeps
     a bundling failure inside the request lifecycle where it can be reported cleanly. */
  let enginesPromise = null;
  const engines = () => (enginesPromise ||= loadEngines());

  router.use(requireKey);

  /* --- discovery ------------------------------------------------------------ */

  router.get("/", (_req, res) => {
    res.json({
      version: API_VERSION,
      service: "ganak-api",
      endpoints: ["/v1/panchang", "/v1/festivals", "/v1/muhurat", "/v1/hora", "/v1/panchaka", "/v1/me", "/v1/openapi.json"],
      documentation: "https://github.com/shivinexus-tech/ganak/blob/main/server/README.md",
    });
  });

  /* Lets an integrator confirm their key works and see their quota without spending
     a calculation call. */
  router.get("/me", (req, res) => {
    const quota = keyStore.peek(req.apiKey);
    res.json({
      version: API_VERSION,
      key: { name: req.apiKey.name, fingerprint: keyFingerprint(req.apiKey.key) },
      quota,
    });
  });

  /* --- calculations --------------------------------------------------------- */

  router.get("/panchang", async (req, res, next) => {
    try {
      const date = parseDate(req.query.date);
      if (date.problem) return res.status(400).json(date.problem);
      const place = parsePlace(req.query);
      if (place.problem) return res.status(400).json(place.problem);
      const ayan = parseAyanamsa(req.query.ayanamsa);
      if (ayan.problem) return res.status(400).json(ayan.problem);

      const E = await engines();
      E.setAyanMode(ayan.value);
      // noon local, so the day's panchang is taken from within the day itself
      const at = date.value.ms - tzOffsetHours(place.value.tz, date.value.ms) * 3_600_000 + 12 * 3_600_000;
      const p = E.computeTodayPanchang(toPlace(place.value), ayan.value, at);

      res.json(panchangResponse(p, { ...place.value, date: date.value.text, ayanamsa: ayan.value }));
    } catch (e) { next(e); }
  });

  router.get("/festivals", async (req, res, next) => {
    try {
      const from = parseDate(req.query.from, "from");
      if (from.problem) return res.status(400).json(from.problem);
      const place = parsePlace(req.query);
      if (place.problem) return res.status(400).json(place.problem);
      const days = parseDays(req.query.days, { def: 30, max: 400 });
      if (days.problem) return res.status(400).json(days.problem);

      const E = await engines();
      E.setAyanMode("lahiri");
      const tzH = tzOffsetHours(place.value.tz, from.value.ms);
      const raw = E.scanPanchangCalendar(from.value.ms, tzH, days.value, days.value, toPlace(place.value));

      res.json(festivalsResponse(raw, { ...place.value, from: from.value.text, days: days.value }));
    } catch (e) { next(e); }
  });

  router.get("/muhurat", async (req, res, next) => {
    try {
      const place = parsePlace(req.query);
      if (place.problem) return res.status(400).json(place.problem);
      const ayan = parseAyanamsa(req.query.ayanamsa);
      if (ayan.problem) return res.status(400).json(ayan.problem);

      const E = await engines();
      E.setAyanMode(ayan.value);
      const activity = (req.query.activity || "").toString().trim();

      if (req.query.from || req.query.to) {
        const from = parseDate(req.query.from, "from");
        if (from.problem) return res.status(400).json(from.problem);
        const to = parseDate(req.query.to, "to");
        if (to.problem) return res.status(400).json(to.problem);
        if (to.value.ms < from.value.ms)
          return res.status(400).json(err("to must not be before from.", "INVALID_RANGE"));
        if (to.value.ms - from.value.ms > 400 * 86_400_000)
          return res.status(400).json(err("Range must be 400 days or fewer.", "RANGE_TOO_LONG"));
        if (!activity)
          return res.status(400).json(err("Provide activity for a range search.", "MISSING_ACTIVITY"));

        const valid = Object.keys(E.MUHURTA_RULES || {});
        if (valid.length && !valid.includes(activity))
          return res.status(400).json(err(`activity must be one of: ${valid.join(", ")}.`, "INVALID_ACTIVITY"));

        const out = E.muhuratScanRange(toPlace(place.value), ayan.value, from.value.text, to.value.text, activity);
        return res.json(muhuratResponse(out, { ...place.value, from: from.value.text, to: to.value.text, activity, ayanamsa: ayan.value }));
      }

      const date = parseDate(req.query.date);
      if (date.problem) return res.status(400).json(date.problem);
      const out = E.muhuratForDate(toPlace(place.value), ayan.value, date.value.y, date.value.m, date.value.d);
      res.json(muhuratResponse([out], { ...place.value, date: date.value.text, ayanamsa: ayan.value }));
    } catch (e) { next(e); }
  });

  router.get("/hora", async (req, res, next) => {
    try {
      const date = parseDate(req.query.date);
      if (date.problem) return res.status(400).json(date.problem);
      const place = parsePlace(req.query);
      if (place.problem) return res.status(400).json(place.problem);

      const E = await engines();
      E.setAyanMode("lahiri");
      const at = date.value.ms - tzOffsetHours(place.value.tz, date.value.ms) * 3_600_000 + 12 * 3_600_000;
      const p = E.computeTodayPanchang(toPlace(place.value), "lahiri", at);
      const slots = E.dayHoras(p.dow, p.rise, p.set);

      res.json(horaResponse(slots, { ...place.value, date: date.value.text }));
    } catch (e) { next(e); }
  });

  router.get("/panchaka", async (req, res, next) => {
    try {
      const date = parseDate(req.query.date);
      if (date.problem) return res.status(400).json(date.problem);
      const place = parsePlace(req.query);
      if (place.problem) return res.status(400).json(place.problem);
      const ayan = parseAyanamsa(req.query.ayanamsa);
      if (ayan.problem) return res.status(400).json(ayan.problem);

      const E = await engines();
      const at = date.value.ms - tzOffsetHours(place.value.tz, date.value.ms) * 3_600_000 + 6 * 3_600_000;
      const data = E.computeLagnaPanchaka(toPlace(place.value), ayan.value, at);

      res.json(panchakaResponse(data, { ...place.value, date: date.value.text, ayanamsa: ayan.value }, E.SIGNS));
    } catch (e) { next(e); }
  });

  /* Unknown /v1/* path: a JSON 404 in the same shape, not an HTML page. */
  router.use((_req, res) => {
    res.status(404).json(err("This endpoint does not exist in v1.", "NOT_FOUND"));
  });

  return router;
}
