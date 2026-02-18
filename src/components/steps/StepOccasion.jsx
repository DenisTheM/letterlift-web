// src/components/steps/StepOccasion.jsx
"use client";
import SectionHeader from "../shared/SectionHeader";
import { OCCASIONS } from "../../data/constants";
import { colors, fonts } from "../../styles/theme";

export default function StepOccasion({ data, update, isSelf }) {
  return (
    <div>
      <SectionHeader
        title={isSelf ? "Wobei sollen die Briefe helfen?" : "Worum geht es?"}
        subtitle="Wähle den Bereich."
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {OCCASIONS.map(o => (
          <div
            key={o.id}
            onClick={() => update("occasion", o.id)}
            style={{
              padding: "18px",
              borderRadius: "14px",
              border: data.occasion === o.id ? `2px solid ${colors.primaryLight}` : `1.5px solid ${colors.borderLight}`,
              background: data.occasion === o.id ? colors.primaryBg : colors.surface,
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "26px", marginBottom: "6px" }}>{o.emoji}</div>
            <div style={{ fontSize: "14px", fontWeight: 600, fontFamily: fonts.sans }}>{o.label}</div>
            <div style={{ fontSize: "12px", color: colors.textLight, fontFamily: fonts.sans, marginTop: "2px" }}>{o.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
