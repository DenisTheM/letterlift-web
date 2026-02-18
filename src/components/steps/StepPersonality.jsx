// src/components/steps/StepPersonality.jsx
"use client";
import { useRef, useEffect } from "react";
import SectionHeader from "../shared/SectionHeader";
import SpeechButton from "../shared/SpeechButton";
import { HUMOR_TYPES } from "../../data/constants";
import { inputStyle, labelStyle, chipStyle, fonts, colors, onFocusInput, onBlurInput } from "../../styles/theme";

/** Textarea das automatisch mitwächst – reagiert auf value-Änderungen (auch von SpeechButton) */
function AutoGrow({ value, onChange, placeholder, hasMic }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(48, el.scrollHeight) + "px";
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      style={{
        width: "100%",
        minHeight: "48px",
        padding: hasMic ? "12px 50px 12px 14px" : "12px 14px",
        border: "1.5px solid #D6CFC8",
        borderRadius: "12px",
        fontSize: "15px",
        fontFamily: "'DM Sans', 'Inter', sans-serif",
        color: "#2C2C2C",
        background: "#FDFCFA",
        outline: "none",
        resize: "none",
        overflow: "hidden",
        lineHeight: 1.6,
        boxSizing: "border-box",
        transition: "border-color 0.2s",
      }}
      value={value}
      onChange={onChange}
      onFocus={onFocusInput}
      onBlur={onBlurInput}
      placeholder={placeholder}
    />
  );
}

export default function StepPersonality({ data, update, isSelf, recipientName }) {
  const rN = recipientName;

  const toggleHumor = (id) => {
    if (id === "none") {
      update("humor", data.humor.includes("none") ? [] : ["none"]);
    } else {
      const next = data.humor.includes(id)
        ? data.humor.filter(x => x !== id)
        : [...data.humor.filter(x => x !== "none"), id];
      update("humor", next);
    }
  };

  return (
    <div>
      <SectionHeader
        title={"Persönlichkeit" + (isSelf ? "" : " von " + rN)}
        subtitle="Details machen den Unterschied."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Hobbies */}
        <div>
          <label style={labelStyle}>Hobbies</label>
          <div style={{ position: "relative" }}>
            <AutoGrow
              value={data.hobbies}
              onChange={e => update("hobbies", e.target.value)}
              placeholder="z.B. Yoga, Backen, Fussball beim FC Uznach"
              hasMic
            />
            <SpeechButton initialValue={data.hobbies} onResult={val => update("hobbies", val)} />
          </div>
        </div>

        {/* Humor-Typ */}
        <div>
          <label style={labelStyle}>Humor-Typ</label>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {HUMOR_TYPES.map(h => (
              <span key={h.id} style={chipStyle(data.humor.includes(h.id))}
                onClick={() => toggleHumor(h.id)} title={h.desc}>
                {h.label}
              </span>
            ))}
          </div>
        </div>

        {/* Stärken */}
        <div>
          <label style={labelStyle}>Stärken</label>
          <div style={{ position: "relative" }}>
            <AutoGrow
              value={data.strengths}
              onChange={e => update("strengths", e.target.value)}
              placeholder="z.B. Loyal, mutig, geduldig"
              hasMic
            />
            <SpeechButton initialValue={data.strengths} onResult={val => update("strengths", val)} />
          </div>
        </div>

        {/* Bezugspersonen */}
        <div>
          <label style={labelStyle}>Bezugspersonen</label>
          <input style={inputStyle} value={data.importantPeople}
            onChange={e => update("importantPeople", e.target.value)}
            placeholder="z.B. Schwester Lena, bester Freund Marco, Oma Helga"
            onFocus={onFocusInput} onBlur={onBlurInput} />
        </div>

        {/* No-Go-Themen */}
        <div>
          <label style={labelStyle}>No-Go-Themen</label>
          <input style={inputStyle} value={data.noGo}
            onChange={e => update("noGo", e.target.value)}
            placeholder="z.B. Ex nicht erwähnen"
            onFocus={onFocusInput} onBlur={onBlurInput} />
          <div style={{ fontSize: "11px", color: colors.info, fontFamily: fonts.sans, marginTop: "5px" }}>
            ⚠️ Themen, die nicht vorkommen sollen.
          </div>
        </div>
      </div>
    </div>
  );
}
