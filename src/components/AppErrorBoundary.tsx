import React from "react";
import { reportClientError } from "../monitoring/error-reporter";

function uiLang() {
  try {
    const q = new URLSearchParams(typeof location !== "undefined" ? location.search : "");
    const v = (q.get("lang") || "").toLowerCase();
    if (v === "hi" || v === "en") return v;
  } catch (e) { /* ignore */ }
  try {
    const ls = (navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || "en"]
    ).map((x) => String(x || "").toLowerCase());
    return ls.some((l) => l.startsWith("hi")) ? "hi" : "en";
  } catch (e) {
    return "en";
  }
}

/** Full-screen recovery when a React tree crashes. Phone-first: never leave a blank page. */
export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.retry = this.retry.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    reportClientError(error, {
      source: "react.boundary",
      componentStack: info && info.componentStack ? info.componentStack : undefined,
    });
  }

  retry() {
    this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;

    const lang = uiLang();
    const title = lang === "hi" ? "कुछ गलत हो गया" : "Something went wrong";
    const body =
      lang === "hi"
        ? "गणना रुक गई। आपका जन्म विवरण यहाँ से कहीं नहीं भेजा गया। कृपया फिर से कोशिश करें।"
        : "The calculation stopped. Your birth details were not sent anywhere. Please try again.";
    const retryLbl = lang === "hi" ? "फिर से कोशिश करें" : "Try again";
    const reloadLbl = lang === "hi" ? "पृष्ठ फिर लोड करें" : "Reload page";

    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          boxSizing: "border-box",
          padding: "3rem 1.375rem 5rem",
          background: "var(--bg-active)",
          color: "var(--ink)",
          fontFamily: "var(--font-body-family)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: "var(--font-display-family)", color: "var(--accent)", fontSize: "var(--font-body)", letterSpacing: "0.28em", marginBottom: "0.75rem" }}>
          Ganak
        </div>
        <h1 style={{ fontFamily: "var(--font-display-family)", fontSize: "var(--font-display)", fontWeight: 700, margin: "0 0 0.75rem", color: "var(--bad)" }}>
          {title}
        </h1>
        <p style={{ maxWidth: "26.25rem", fontSize: "var(--font-title)", lineHeight: 1.55, color: "var(--muted)", margin: "0 0 1.75rem" }}>
          {body}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem", justifyContent: "center" }}>
          <button
            type="button"
            onClick={this.retry}
            style={{
              height: "2.625rem",
              padding: "0 1.375rem",
              borderRadius: "0.6875rem",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-display-family)",
              fontSize: "var(--font-body)",
              fontWeight: 600,
              background: "var(--accent)",
              color: "var(--bg-active)",
            }}
          >
            {retryLbl}
          </button>
          <button
            type="button"
            onClick={() => {
              try { location.reload(); } catch (e) { /* ignore */ }
            }}
            style={{
              height: "2.625rem",
              padding: "0 1.375rem",
              borderRadius: "0.6875rem",
              border: "0.0625rem solid var(--line)",
              cursor: "pointer",
              fontFamily: "var(--font-display-family)",
              fontSize: "var(--font-body)",
              background: "var(--on-accent)",
              color: "var(--ink)",
            }}
          >
            {reloadLbl}
          </button>
        </div>
      </div>
    );
  }
}
