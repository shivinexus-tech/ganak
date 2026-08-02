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

function preferredVoice(lang: "hi" | "en") {
  const voices = window.speechSynthesis.getVoices();
  const prefixes = lang === "hi" ? ["hi-IN", "hi"] : ["en-IN", "en-GB", "en-US", "en"];
  return prefixes.map((prefix) => voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix.toLowerCase()))).find(Boolean) || null;
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
  const [speechId] = useState(() => ++nextSpeechId);
  const runRef = useRef(0);
  const content = useMemo(() => (Array.isArray(text) ? text : [text]).filter(Boolean).join("। "), [text]);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

  useEffect(() => {
    if (!supported) return;
    const onOtherSpeech = () => {
      if (activeSpeechId === speechId) return;
      runRef.current += 1;
      setState("idle");
      setMessage("");
    };
    const onStopAllSpeech = () => {
      runRef.current += 1;
      if (activeSpeechId === speechId) {
        activeSpeechId = null;
        window.speechSynthesis.cancel();
      }
      setState("idle");
      setMessage("");
    };
    window.addEventListener("ganak:tts-start", onOtherSpeech);
    window.addEventListener("ganak:tts-stop-all", onStopAllSpeech);
    return () => {
      window.removeEventListener("ganak:tts-start", onOtherSpeech);
      window.removeEventListener("ganak:tts-stop-all", onStopAllSpeech);
      runRef.current += 1;
      if (activeSpeechId === speechId) {
        activeSpeechId = null;
        window.speechSynthesis.cancel();
      }
    };
  }, [speechId, supported]);

  const stop = () => {
    runRef.current += 1;
    if (supported && activeSpeechId === speechId) {
      activeSpeechId = null;
      window.speechSynthesis.cancel();
    }
    setState("idle");
    setMessage("");
  };

  const start = () => {
    if (!supported) {
      setState("error");
      setMessage(lang === "hi" ? "इस ब्राउज़र में सुनाने की सुविधा उपलब्ध नहीं है।" : "Read-aloud is unavailable in this browser.");
      return;
    }
    const chunks = speechChunks(content);
    if (!chunks.length) return;
    window.speechSynthesis.cancel();
    activeSpeechId = speechId;
    window.dispatchEvent(new window.Event("ganak:tts-start"));
    const run = ++runRef.current;
    setState("speaking");
    setMessage("");
    const speak = (index: number) => {
      if (run !== runRef.current) return;
      if (index >= chunks.length) {
        if (activeSpeechId === speechId) activeSpeechId = null;
        setState("idle");
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = lang === "hi" ? "hi-IN" : "en-IN";
      utterance.rate = preferences.speechRate;
      const voice = preferredVoice(lang);
      if (voice) utterance.voice = voice;
      utterance.onend = () => speak(index + 1);
      utterance.onerror = (event) => {
        if (event.error === "canceled" || event.error === "interrupted") return;
        if (activeSpeechId === speechId) activeSpeechId = null;
        setState("error");
        setMessage(lang === "hi" ? "अभी सुनाया नहीं जा सका। फिर से कोशिश करें।" : "Ganak could not read this aloud. Try again.");
      };
      window.speechSynthesis.speak(utterance);
    };
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
          padding: compact ? "0.375rem 0.625rem" : `0 ${T.s3}`,
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
    </span>
  );
}
