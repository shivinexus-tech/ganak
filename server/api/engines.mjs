/* Bridge from the API to Ganak's real calculation engines.

   The engines live in ../../src/engine as browser-targeted TypeScript. Rather than
   reimplement or copy any astronomy here — which would guarantee the API and the app
   drift apart — we bundle the actual modules once at startup with esbuild. This is
   the same trick validation/_load-app.cjs uses to let the gates test real app code.

   Consequence worth knowing: the API can never silently disagree with the website,
   because there is only one implementation. */

import { build } from "esbuild";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");

let engines = null;

/* Bundle the engine entry points into one CommonJS blob and evaluate it. Done once,
   lazily, so an engine syntax error surfaces as a clean startup failure rather than a
   500 on the first request. */
export async function loadEngines() {
  if (engines) return engines;

  const entry = path.join(repoRoot, "src", "engine");
  const result = await build({
    stdin: {
      contents: `
        export { computeTodayPanchang } from "${entry}/today-panchang.ts";
        export { scanPanchangCalendar, observancesFor, sankrantiPunyaKala, obsKind } from "${entry}/festivals.ts";
        export { muhuratForDate, muhuratScanRange, muhuratShuddhi, MUHURTA_RULES } from "${entry}/muhurat.ts";
        export { computeLagnaPanchaka } from "${entry}/panchaka.ts";
        export { dayHoras, horaWindowsForPlanet, HORA_NAME, HORA_NATURE } from "${entry}/hora.ts";
        export { setAyanMode, zoneOffset, AYANAMSA, SIGNS } from "${entry}/panchang.ts";
      `,
      resolveDir: entry,
      loader: "ts",
    },
    bundle: true,
    write: false,
    format: "cjs",
    platform: "node",
    target: "node18",
    logLevel: "silent",
  });

  const code = result.outputFiles[0].text;
  const module = { exports: {} };
  const require = createRequire(import.meta.url);
  // eslint-disable-next-line no-new-func
  new Function("module", "exports", "require", code)(module, module.exports, require);

  engines = module.exports;
  return engines;
}

/* Ganak's engines take a `place` object; keep the shape in one spot so every route
   builds it identically. */
export function toPlace({ lat, lon, tz, label }) {
  return { lat, lon, zone: tz, label: label || `${lat},${lon}` };
}
