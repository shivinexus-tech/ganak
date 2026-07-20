import React from "react";
import ReactDOM from "react-dom/client";

// Self-hosted typefaces (CLAUDE-LAUNCH-PRIVACY): exactly the weights the UI uses.
// Vite bundles the woff2 files same-origin, so no visitor IP ever goes to Google.
// Eczar's Devanagari subset is required — the hero and headings render हिन्दी in it.
// These live in the entry, not kundli-app.tsx: the validation harness bundles the
// shell with a bare esbuild config that has no font loaders, and it must stay able to.
import "@fontsource/eczar/500.css";
import "@fontsource/eczar/600.css";
import "@fontsource/eczar/700.css";
import "@fontsource/spectral/300.css";
import "@fontsource/spectral/400.css";
import "@fontsource/spectral/400-italic.css";
import "@fontsource/spectral/600.css";

import KundliApp from "./kundli-app.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <KundliApp />
  </React.StrictMode>
);
