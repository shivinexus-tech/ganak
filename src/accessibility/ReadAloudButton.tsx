import React, { useEffect, useMemo, useRef, useState } from "react";
import { R as T } from "../components/ui-style-contract";
import { useComfort } from "./ComfortProvider";

type ReadState = "idle" | "speaking" | "error";
let nextSpeechId = 0;
let activeSpeechId: number | null = null;

function speechChunks(input: string) {
  const clean = input.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const sentences = clean.split(/(?<=[।.!?])\s+/);
  const chunks: string[] = [];
  for (const sentence of sentences) {
    if (sentence.length <= 240) { chunks.push(sentence); continue; }
    for (let i = 0; i < sentence.length; i += 220) chunks.push(sentence.slice(i, i + 220));
  }
  return chunks;
}

/**
 * Chrome and Edge return an empty voice list until the engine fires `voiceschanged`, so a
 * cold first tap used to fall back to the browser default and read Devanagari with an
 * English voice. Wait briefly for the real list before speaking.
 */
function loadVoices(timeoutMs = 1200): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const initial = window.speechSynthesis.getVoices();
    if (initial.length) { resolve(initial); return; }
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      window.speechSynthesis.removeEventListener("voiceschanged", finish);
      resolve(window.speechSynthesis.getVoices());
    };
    const timer = window.setTimeout(finish, timeoutMs);
    window.speechSynthesis.addEventListener("voiceschanged", finish);
  });
}

function preferredVoice(voices: SpeechSynthesisVoice[], lang: "hi" | "en") {
  const prefixes = lang === "hi" ? ["hi-IN", "hi"] : ["en-IN", "en-GB", "en-US", "en"];
  return prefixes
    .map((prefix) => voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix.toLowerCase())))
    .find(Boolean) || null;
}

export default function ReadAloudButton({
  text,
  lang,
  compact = false,
  label,
}: {
  text: string | string[];
  lang: "hi" | "en";
  compact?: boolean;
  label?: string;
}) {
  const { preferences } = useComfort();
  const [state, setState] = useState<ReadState>("idle");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [speechId] = useState(() => ++nextSpeechId);
  const runRef = useRef(0);
  const watchdogRef = useRef(0);
  const content = useMemo(() => (Array.isArray(text) ? text : [text]).filter(Boolean).join("। "), [text]);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

  const clearWatchdog = () => {
    if (watchdogRef.current) {
      window.clearTimeout(watchdogRef.current);
      watchdogRef.current = 0;
    }
  };

  useEffect(() => {
    if (!supported) return;
    const onOtherSpeech = () => {
      if (activeSpeechId === speechId) return;
      runRef.current += 1;
      clearWatchdog();
      setState("idle");
      setMessage("");
      setNotice("");
    };
    const onStopAllSpeech = () => {
      runRef.current += 1;
      clearWatchdog();
      if (activeSpeechId === speechId) {
        activeSpeechId = null;
        window.speechSynthesis.cancel();
      }
      setState("idle");
      setMessage("");
      setNotice("");
    };
    window.addEventListener("ganak:tts-start", onOtherSpeech);
    window.addEventListener("ganak:tts-stop-all", onStopAllSpeech);
    return () => {
      window.removeEventListener("ganak:tts-start", onOtherSpeech);
      window.removeEventListener("ganak:tts-stop-all", onStopAllSpeech);
      runRef.current += 1;
      clearWatchdog();
      if (activeSpeechId === speechId) {
        activeSpeechId = null;
        window.speechSynthesis.cancel();
      }
    };
  }, [speechId, supported]);

  // A language switch must never leave the previous language still being read aloud.
  useEffect(() => {
    runRef.current += 1;
    clearWatchdog();
    if (supported && activeSpeechId === speechId) {
      activeSpeechId = null;
      window.speechSynthesis.cancel();
    }
    setState("idle");
    setMessage("");
    setNotice("");
  }, [lang, content]);

  const stop = () => {
    runRef.current += 1;
    clearWatchdog();
    if (supported && activeSpeechId === speechId) {
      activeSpeechId = null;
      window.speechSynthesis.cancel();
    }
    setState("idle");
    setMessage("");
    setNotice("");
  };

  const fail = (text: string) => {
    clearWatchdog();
    if (activeSpeechId === speechId) activeSpeechId = null;
    setState("error");
    setMessage(text);
  };

  const start = async () => {
    if (!supported) {
      setState("error");
      setMessage(lang === "hi" ? "इस ब्राउज़र में सुनाने की सुविधा उपलब्ध नहीं है।" : "Read-aloud is unavailable in this browser.");
      return;
    }
    const chunks = speechChunks(content);
    if (!chunks.length) {
      setState("error");
      setMessage(lang === "hi" ? "यहाँ सुनाने के लिए कुछ नहीं है।" : "There is nothing to read aloud here.");
      return;
    }
    window.speechSynthesis.cancel();
    activeSpeechId = speechId;
    window.dispatchEvent(new window.Event("ganak:tts-start"));
    const run = ++runRef.current;
    setState("speaking");
    setMessage("");
    setNotice("");

    const voices = await loadVoices();
    if (run !== runRef.current) return;
    const voice = preferredVoice(voices, lang);
    if (!voice && lang === "hi") {
      setNotice("इस डिवाइस में हिन्दी आवाज़ नहीं मिली — सामान्य आवाज़ से सुनाया जा रहा है।");
    }

    const speak = (index: number) => {
      if (run !== runRef.current) return;
      if (index >= chunks.length) {
        clearWatchdog();
        if (activeSpeechId === speechId) activeSpeechId = null;
        setState("idle");
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
      utterance.rate = preferences.speechRate;
      if (voice) utterance.voice = voice;
      utterance.onstart = () => { if (run === runRef.current) clearWatchdog(); };
      utterance.onend = () => speak(index + 1);
      utterance.onerror = (event) => {
        if (event.error === "canceled" || event.error === "interrupted") return;
        if (run !== runRef.current) return;
        fail(lang === "hi" ? "अभी सुनाया नहीं जा सका। फिर से कोशिश करें।" : "Ganak could not read this aloud. Try again.");
      };
      window.speechSynthesis.speak(utterance);
    };

    // Some platforms accept the utterance and then never fire start/end/error. Without a
    // watchdog the control sits on "Stop" for ever with no audio and no visible reason.
    clearWatchdog();
    watchdogRef.current = window.setTimeout(() => {
      if (run !== runRef.current) return;
      window.speechSynthesis.cancel();
      fail(lang === "hi" ? "आवाज़ शुरू नहीं हो सकी। फिर से कोशिश करें।" : "The voice could not start. Try again.");
    }, 4000);

    speak(0);
  };

  const buttonLabel = state === "speaking"
    ? (lang === "hi" ? "■ रोकें" : "■ Stop")
    : (label || (lang === "hi" ? "🔊 सुनें" : "🔊 Listen"));

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: T.s1 }}>
      <button
        type="button"
        className="comfort-control comfort-focus"
        onClick={state === "speaking" ? stop : start}
        aria-pressed={state === "speaking"}
        style={{
          minHeight: T.ctrlH,
          padding: compact ? `${T.s2} ${T.s3}` : `0 ${T.s3}`,
          border: "0.0625rem solid var(--line)",
          borderRadius: T.rMd,
          background: "var(--surface-active)",
          color: "var(--accent)",
          fontFamily: T.body,
          fontSize: compact ? T.fSmall : T.fBody,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        {buttonLabel}
      </button>
      {message && <span role="status" style={{ maxWidth: "22rem", color: "var(--bad)", fontSize: T.fSmall }}>{message}</span>}
      {!message && notice && <span role="status" style={{ maxWidth: "22rem", color: "var(--muted)", fontSize: T.fSmall }}>{notice}</span>}
    </span>
  );
}
