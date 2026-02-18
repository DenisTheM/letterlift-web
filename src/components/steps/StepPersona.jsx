// src/components/steps/StepPersona.jsx
"use client";
import SectionHeader from "../shared/SectionHeader";
import { PERSONAS } from "../../data/constants";
import { inputStyle, textareaStyle, labelStyle, optionalHint, cardSelectStyle, fonts, colors, onFocusInput, onBlurInput } from "../../styles/theme";

export default function StepPersona({ data, update }) {
  return (
    <div>
      <SectionHeader
        title="Wer soll dir die Briefe schreiben?"
        subtitle="Wähle eine Stimme. Die Briefe klingen, als kämen sie von dieser Person."
      />

      {/* Persona-Auswahl */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {PERSONAS.map(pt => (
          <div key={pt.id} onClick={() => update("persona", pt.id)} style={cardSelectStyle(data.persona === pt.id)}>
            <div style={{ fontSize: "24px", marginTop: "2px" }}>{pt.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 600, fontFamily: fonts.sans }}>{pt.label}</div>
              <div style={{ fontSize: "12px", color: colors.textLight, fontFamily: fonts.sans, marginTop: "2px" }}>{pt.desc}</div>
            </div>
            {data.persona === pt.id && <div style={{ color: colors.primaryLight, fontSize: "17px", fontWeight: 700 }}>✔</div>}
          </div>
        ))}
      </div>

      {/* Detail-Felder (je nach Persona) */}
      {data.persona && (
        <div style={{ marginTop: "16px" }}>
          <label style={labelStyle}>
            {data.persona === "deceased" ? "Name der Person"
              : data.persona === "future_self" ? "Wie spricht dein zukünftiges Ich?"
              : "Name / Beschreibung"}
          </label>
          <input
            style={inputStyle}
            value={data.personaName}
            onChange={e => update("personaName", e.target.value)}
            placeholder={PERSONAS.find(p => p.id === data.persona)?.ph}
            onFocus={onFocusInput} onBlur={onBlurInput}
          />

          {data.persona === "deceased" && (
            <div style={{ marginTop: "12px", padding: "14px 16px", background: colors.surfaceMuted, borderRadius: "12px", fontSize: "13px", fontFamily: fonts.sans, color: colors.textMuted, lineHeight: 1.6 }}>
              <strong>🕊️</strong> Behutsam im Ton dieser Person. Erzähl typische Sätze, Kosenamen, Eigenheiten.
            </div>
          )}

          {data.persona === "future_self" && (
            <div style={{ marginTop: "12px", padding: "14px 16px", background: colors.primaryBg, borderRadius: "12px", fontSize: "13px", fontFamily: fonts.sans, color: colors.primary, lineHeight: 1.6 }}>
              <strong>🔮</strong> Schreibt aus einer Position der Stärke – es hat geschafft, was du anstrebst.
            </div>
          )}

          {(data.persona === "custom_persona" || data.persona === "fictional") && (
            <div style={{ marginTop: "12px" }}>
              <label style={labelStyle}>Stimme beschreiben <span style={optionalHint}>optional</span></label>
              <textarea
                style={{ ...textareaStyle, minHeight: "80px" }}
                value={data.personaDesc}
                onChange={e => update("personaDesc", e.target.value)}
                placeholder="z.B. Spricht ruhig, nennt mich 'Kleines'..."
                onFocus={onFocusInput} onBlur={onBlurInput}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
