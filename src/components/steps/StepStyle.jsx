// src/components/steps/StepStyle.jsx
"use client";
import SectionHeader from "../shared/SectionHeader";
import { STYLES } from "../../data/constants";
import { textareaStyle, labelStyle, cardSelectStyle, fonts, colors, onFocusInput, onBlurInput } from "../../styles/theme";

export default function StepStyle({ data, update }) {
  const arr = Array.isArray(data.style) ? data.style : [];

  const toggleStyle = (id) => {
    if (id === "custom") {
      update("style", [id]);
    } else {
      const prev = arr.filter(x => x !== "custom");
      update("style", prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Wie sollen die Briefe klingen?"
        subtitle="Mehrere Stile kombinierbar."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {STYLES.map(s => {
          const selected = arr.includes(s.id);
          return (
            <div key={s.id} onClick={() => toggleStyle(s.id)} style={cardSelectStyle(selected)}>
              <div style={{ fontSize: "22px", width: "34px", textAlign: "center", flexShrink: 0 }}>{s.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 600, fontFamily: fonts.sans }}>{s.label}</div>
                <div style={{ fontSize: "12px", color: colors.textLight, fontFamily: fonts.sans }}>{s.desc}</div>
              </div>
              {selected && <div style={{ color: colors.primaryLight, fontSize: "17px", fontWeight: 700 }}>✔</div>}
            </div>
          );
        })}
      </div>

      {arr.includes("custom") && (
        <div style={{ marginTop: "14px" }}>
          <label style={labelStyle}>Beschreibe den Stil</label>
          <textarea
            style={textareaStyle}
            value={data.customStyleDesc}
            onChange={e => update("customStyleDesc", e.target.value)}
            placeholder="z.B. Wie meine Oma – liebevoll, altmodisch..."
            onFocus={onFocusInput} onBlur={onBlurInput}
          />
        </div>
      )}
    </div>
  );
}
