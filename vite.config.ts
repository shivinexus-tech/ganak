import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/* Emit sitemap.xml, robots.txt, the canonical 301s and one HTML file per route
   after the bundle is written. This runs inside Vite's own build rather than as
   an `npm run build` step so it cannot be bypassed by the Cloudflare Pages build
   command, which is configured in the dashboard and not in this repo. */
function seoEmitter() {
  return {
    name: "ganak-seo-emitter",
    apply: "build" as const,
    closeBundle: async () => {
      const { emitAll } = await import("./scripts/build-seo.mjs");
      emitAll();
    },
  };
}

export default defineConfig({
  plugins: [react(), seoEmitter()],
  server: {
    port: 5173,
  },
});
