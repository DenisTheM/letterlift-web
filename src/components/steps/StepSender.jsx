// src/components/steps/StepSender.jsx
"use client";
import SectionHeader from "../shared/SectionHeader";
import { inputStyle, textareaStyle, labelStyle, optionalHint, fonts, colors, onFocusInput, onBlurInput } from "../../styles/theme";

export default function StepSender({ data, update, recipientName }) {
  return (
    <div>
      <SectionHeader
        title="Über dich als Absender"
        subtitle="Damit die Briefe authentisch klingen."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div>
          <label style={labelStyle}>Dein Vorname</label>
          <input style={inputStyle} value={data.senderName}
            onChange={e => update("senderName", e.target.value)}
            placeholder="z.B. Lena"
            onFocus={onFocusInput} onBlur={onBlurInput} />
        </div>
        <div>
          <label style={labelStyle}>
            Was möchtest du {recipientName} mitgeben? <span style={optionalHint}>optional</span>
          </label>
          <textarea
            style={{ ...textareaStyle, minHeight: "80px" }}
            value={data.senderMessage}
            onChange={e => update("senderMessage", e.target.value)}
            placeholder={recipientName + " soll wissen, dass ich da bin."}
            onFocus={onFocusInput} onBlur={onBlurInput}
          />
        </div>
        <div style={{
          padding: "14px 16px", background: colors.primaryBg, borderRadius: "12px",
          fontSize: "13px", fontFamily: fonts.sans, color: colors.primary, lineHeight: 1.6,
        }}>
          <strong>✉️ Volle Kontrolle:</strong> Du erhältst jeden Brief vor dem Versand und kannst ihn bearbeiten.
        </div>
      </div>
    </div>
  );
}
