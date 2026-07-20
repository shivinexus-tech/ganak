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
          padding: "48px 22px 80px",
          background: "#FAF5EA",
          color: "#3B3147",
          fontFamily: "Spectral, Georgia, serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: "Eczar, serif", color: "#A86A12", fontSize: 14, letterSpacing: "0.28em", marginBottom: 12 }}>
          Ganak
        </div>
        <h1 style={{ fontFamily: "Eczar, serif", fontSize: 28, fontWeight: 700, margin: "0 0 12px", color: "#C2451E" }}>
          {title}
        </h1>
        <p style={{ maxWidth: 420, fontSize: 16, lineHeight: 1.55, color: "#8C8173", margin: "0 0 28px" }}>
          {body}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          <button
            type="button"
            onClick={this.retry}
            style={{
              height: 42,
              padding: "0 22px",
              borderRadius: 11,
              border: "none",
              cursor: "pointer",
              fontFamily: "Eczar, serif",
              fontSize: 15,
              fontWeight: 600,
              background: "#A86A12",
              color: "#FAF5EA",
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
              height: 42,
              padding: "0 22px",
              borderRadius: 11,
              border: "1px solid #E7DDC6",
              cursor: "pointer",
              fontFamily: "Eczar, serif",
              fontSize: 15,
              background: "#fff",
              color: "#3B3147",
            }}
          >
            {reloadLbl}
          </button>
        </div>
      </div>
    );
  }
}
