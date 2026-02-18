// src/components/shared/SpeechButton.jsx
"use client";
import { useState, useRef } from "react";

const MicIcon = ({ color = "#5B7B6A", size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
);

const StopIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
    <rect x="4" y="4" width="16" height="16" rx="2" />
  </svg>
);

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
        transition: "all 0.2s",
        boxShadow: isRec ? "0 0 0 3px rgba(229,62,62,0.3)" : "none",
      }}
    >
      {isRec ? <StopIcon /> : <MicIcon />}
    </button>
  );
}
