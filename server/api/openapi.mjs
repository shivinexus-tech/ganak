/* OpenAPI 3.1 description of the v1 API.

   Generated from one place so the spec cannot drift from the routes without somebody
   noticing: the smoke suite asserts that every path listed here actually answers, and
   that every route the router exposes appears here. */

import { API_VERSION } from "./contract.mjs";

const place = [
  { name: "lat", in: "query", required: true, schema: { type: "number", minimum: -90, maximum: 90 }, description: "Latitude in degrees." },
  { name: "lon", in: "query", required: true, schema: { type: "number", minimum: -180, maximum: 180 }, description: "Longitude in degrees, east positive." },
  { name: "tz", in: "query", required: false, schema: { type: "string", default: "UTC" }, description: "IANA time zone, e.g. Asia/Kolkata. Defaults to UTC." },
];
const date = (name = "date", required = true) => ({
  name, in: "query", required, schema: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
  description: "Calendar date, YYYY-MM-DD, between 1900 and 2100.",
});
const ayanamsa = {
  name: "ayanamsa", in: "query", required: false,
  schema: { type: "string", enum: ["lahiri", "kp"], default: "lahiri" },
  description: "Sidereal zero point. Lahiri is the Indian government standard and the Ganak default.",
};

const errorResponse = {
  description: "Error. Always this shape; never a stack trace or upstream detail.",
  content: {
    "application/json": {
      schema: {
        type: "object",
        required: ["error", "code"],
        properties: {
          error: { type: "string", description: "Plain-language message, safe to show a user." },
          code: { type: "string", description: "Stable machine-readable code. Match on this, not the message." },
        },
      },
    },
  },
};

const ok = (description) => ({ description, content: { "application/json": { schema: { type: "object" } } } });

const common = {
  400: errorResponse,
  401: errorResponse,
  429: errorResponse,
};

export function openApiSpec({ publicUrl } = {}) {
  return {
    openapi: "3.1.0",
    info: {
      title: "Ganak API",
      version: `1.0.0`,
      summary: "Hindu panchang and Jyotish calculations.",
      description:
        "Read-only calculation endpoints backed by the same engines as ganak.pages.dev. " +
        "No personal data is accepted or stored: a request carries a place and a date, and " +
        "receives a calculation. All instants are ISO 8601 UTC.\n\n" +
        "Conventions and limits are stated rather than implied — see `x-conventions`.",
      license: { name: "See repository" },
    },
    servers: [{ url: publicUrl || "http://localhost:3001", description: "Ganak API" }],
    "x-conventions": {
      ayanamsa: "Lahiri (Chitrapaksha) by default, matching Drik Panchang's default and the rest of Ganak. 'kp' selects the Krishnamurti value, 5'48\" smaller.",
      instants: "Every timestamp is an ISO 8601 string in UTC. Convert client-side for display.",
      regionalVariation: "Hindu observance dates legitimately differ by region and sampradaya. Dates here follow the stated conventions and are not a religious authority.",
      determinism: "Same inputs always give the same output. Responses are cacheable.",
    },
    security: [{ ApiKeyAuth: [] }],
    components: {
      securitySchemes: {
        ApiKeyAuth: { type: "apiKey", in: "header", name: "x-api-key" },
      },
    },
    paths: {
      "/v1/": {
        get: { summary: "Endpoint discovery.", responses: { 200: ok("Endpoint list."), ...common } },
      },
      "/v1/me": {
        get: {
          summary: "Confirm your key and see remaining quota.",
          description: "Does not consume a calculation call.",
          responses: { 200: ok("Key name, fingerprint and quota."), ...common },
        },
      },
      "/v1/panchang": {
        get: {
          summary: "Daily panchang for a place and date.",
          description: "Tithi, nakshatra, yoga, karana, paksha, lunar month, samvat, sun and moon timings, and the auspicious/inauspicious windows of the day.",
          parameters: [date(), ...place, ayanamsa],
          responses: { 200: ok("Panchang for the requested day."), ...common },
        },
      },
      "/v1/festivals": {
        get: {
          summary: "Fasts and festivals in a date range.",
          description: "Each entry carries `decidingKala`, the day-part that determines its date, so a difference from another panchang can be explained rather than guessed at.",
          parameters: [
            date("from"),
            { name: "days", in: "query", required: false, schema: { type: "integer", minimum: 1, maximum: 400, default: 30 }, description: "Number of days to scan, up to 400." },
            ...place,
          ],
          responses: { 200: ok("Observances, ascending by date."), ...common },
        },
      },
      "/v1/muhurat": {
        get: {
          summary: "Muhurat for one date, or ranked days across a range.",
          description: "Supply `date` for a single day. Supply `from`, `to` and `activity` to rank days in a range (maximum 400 days).",
          parameters: [
            date("date", false), date("from", false), date("to", false),
            { name: "activity", in: "query", required: false, schema: { type: "string" }, description: "Required for a range search. Call the endpoint with an invalid value to receive the list of supported activities." },
            ...place, ayanamsa,
          ],
          responses: { 200: ok("Day verdicts with reasons and windows."), ...common },
        },
      },
      "/v1/hora": {
        get: {
          summary: "Planetary hours (hora) for a date.",
          description: "The twelve daytime horas between sunrise and sunset, with their ruling planets.",
          parameters: [date(), ...place],
          responses: { 200: ok("Twelve hora windows."), ...common },
        },
      },
      "/v1/panchaka": {
        get: {
          summary: "Lagna schedule and Panchaka Rahita windows.",
          description: "Rising sign windows from sunrise to next sunrise, each labelled with its panchaka type and whether it is auspicious.",
          parameters: [date(), ...place, ayanamsa],
          responses: { 200: ok("Lagna schedule and panchaka windows."), ...common },
        },
      },
    },
    "x-version": API_VERSION,
  };
}
