// src/components/steps/StepPersonality.jsx
"use client";
import SectionHeader from "../shared/SectionHeader";
import { HUMOR_TYPES } from "../../data/constants";
import { inputStyle, labelStyle, chipStyle, fonts, colors, onFocusInput, onBlurInput } from "../../styles/theme";

export default function StepPersonality({ data, update, isSelf, recipientName }) {
  const rN = recipientName;

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
          <input style={inputStyle} value={data.hobbies}
            onChange={e => update("hobbies", e.target.value)}
            placeholder="z.B. Yoga, Backen"
            onFocus={onFocusInput} onBlur={onBlurInput} />
        </div>

        {/* Humor-Typ */}
        <div>
          <label style={labelStyle}>Humor-Typ</label>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {HUMOR_TYPES.map(h => (
              <span key={h.id}
                style={chipStyle(data.humor.includes(h.id))}
                onClick={() => update("humor",
                  data.humor.includes(h.id)
                    ? data.humor.filter(x => x !== h.id)
                    : [...data.humor, h.id]
                )}>
                {h.label}
              </span>
            ))}
          </div>
        </div>

        {/* Stärken */}
        <div>
          <label style={labelStyle}>Stärken</label>
          <input style={inputStyle} value={data.strengths}
            onChange={e => update("strengths", e.target.value)}
            placeholder="z.B. Loyal, mutig"
            onFocus={onFocusInput} onBlur={onBlurInput} />
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
