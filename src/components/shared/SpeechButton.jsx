// src/components/shared/SpeechButton.jsx
// Mikrofon-Button für Spracheingabe in Textfeldern
"use client";
import { useState, useRef } from "react";

export default function SpeechButton({ onResult, initialValue = "" }) {
  const [isRec, setIsRec] = useState(false);
  const recRef = useRef(null);
  const startRef = useRef("");
  const hasSpeech = typeof window !== "undefined" &&
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  if (!hasSpeech) return null;

  const toggle = () => {
    if (isRec) { recRef.current?.stop(); setIsRec(false); return; }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = "de-DE";
    r.continuous = true;
    r.interimResults = true;
    recRef.current = r;
    startRef.current = initialValue;
    let final = "";

    r.onresult = (ev) => {
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        if (ev.results[i].isFinal) final += ev.results[i][0].transcript + " ";
        else interim = ev.results[i][0].transcript;
      }
      const pre = startRef.current;
      onResult((pre ? pre + " " : "") + final.trimEnd() + (interim ? " " + interim : ""));
    };
    r.onend = () => setIsRec(false);
    r.start();
    setIsRec(true);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      style={{
        position: "absolute", right: "10px", bottom: "10px",
        background: isRec ? "#E53E3E" : "#EEF4F0",
        border: "none", borderRadius: "50%",
        width: "36px", height: "36px",
        cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: "18px", transition: "all 0.2s",
        boxShadow: isRec ? "0 0 0 3px rgba(229,62,62,0.3)" : "none",
      }}
    >
      {isRec ? "⏹" : "🎙️"}
    </button>
  );
}
