// src/components/steps/StepRecipient.jsx
"use client";
import SectionHeader from "../shared/SectionHeader";
import { RELATIONSHIPS, LANGUAGES, GENDERS } from "../../data/constants";
import { inputStyle, labelStyle, optionalHint, chipStyle, onFocusInput, onBlurInput } from "../../styles/theme";

export default function StepRecipient({ data, update, isSelf, trackInteraction }) {
  return (
    <div>
      <SectionHeader
        title={isSelf ? "Über dich" : "Wem sollen die Briefe Kraft geben?"}
        subtitle={isSelf
          ? "Damit die Briefe sich anfühlen, als kämen sie von jemandem, der dich kennt."
          : "Je mehr wir erfahren, desto persönlicher."}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Vorname */}
        <div>
          <label style={labelStyle}>Vorname</label>
          <input
            style={inputStyle}
            placeholder={isSelf ? "Dein Vorname" : "z.B. Sarah"}
            value={data.recipientName}
            onChange={e => { update("recipientName", e.target.value); trackInteraction(); }}
            onFocus={onFocusInput} onBlur={onBlurInput}
          />
        </div>

        {/* Geschlecht */}
        <div>
          <label style={labelStyle}>
            Geschlecht <span style={{ fontSize: "11px", color: "#B0A9A3", fontWeight: 400 }}>(für korrekte Ansprache)</span>
          </label>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {GENDERS.map(([k, l]) => (
              <span key={k} style={chipStyle(data.gender === k)} onClick={() => update("gender", k)}>{l}</span>
            ))}
          </div>
        </div>

        {/* Spitzname */}
        <div>
          <label style={labelStyle}>Spitzname <span style={optionalHint}>optional</span></label>
          <input
            style={inputStyle}
            placeholder="z.B. Sari"
            value={data.nickname}
            onChange={e => update("nickname", e.target.value)}
            onFocus={onFocusInput} onBlur={onBlurInput}
          />
        </div>

        {/* Beziehung (nur bei Geschenk) */}
        {!isSelf && (
          <div>
            <label style={labelStyle}>Beziehung</label>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {RELATIONSHIPS.map(r => (
                <span key={r} style={chipStyle(data.relationship === r)} onClick={() => update("relationship", r)}>{r}</span>
              ))}
            </div>
          </div>
        )}

        {/* Sprache */}
        <div>
          <label style={labelStyle}>Sprache</label>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {LANGUAGES.map(([k, l]) => (
              <span key={k} style={chipStyle(data.language === k)} onClick={() => update("language", k)}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
