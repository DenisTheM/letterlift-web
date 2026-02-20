// src/components/steps/StepDelivery.jsx
"use client";
import SectionHeader from "../shared/SectionHeader";
import { PACKAGES, FREQUENCIES, PAPER_OPTIONS } from "../../data/constants";
import { labelStyle, cardSelectStyle, fonts, colors } from "../../styles/theme";

export default function StepDelivery({ data, update, currSymbol }) {
  const cs = currSymbol;
  const pk = PACKAGES.find(q => q.id === data.package);
  const days = pk
    ? (data.frequency === "daily" ? pk.letters : data.frequency === "every3" ? pk.letters * 3 : pk.letters * 7)
    : 0;

  return (
    <div>
      <SectionHeader title="Versand & Ausstattung" subtitle="Wie oft und in welcher Qualität?" />

      {/* Frequenz */}
      <label style={{ ...labelStyle, marginBottom: "10px" }}>Frequenz</label>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
        {FREQUENCIES.map(f => (
          <div key={f.id} onClick={() => update("frequency", f.id)} style={cardSelectStyle(data.frequency === f.id)}>
            <div style={{ fontSize: "20px" }}>{f.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 600, fontFamily: fonts.sans }}>{f.label}</div>
              <div style={{ fontSize: "12px", color: colors.textLight, fontFamily: fonts.sans }}>{f.desc}</div>
            </div>
            {data.frequency === f.id && <div style={{ color: colors.primaryLight, fontWeight: 700 }}>✔</div>}
          </div>
        ))}
      </div>

      {/* Dauer-Info */}
      {pk && (
        <div style={{
          padding: "14px 16px", background: colors.surfaceMuted, borderRadius: "12px",
          marginBottom: "24px", fontSize: "13px", fontFamily: fonts.sans, color: colors.textMuted,
        }}>
          📊 <strong>{pk.letters} Briefe</strong> × <strong>{FREQUENCIES.find(f => f.id === data.frequency)?.label}</strong> = ca. <strong>{Math.ceil(days / 7)} Wochen</strong>
        </div>
      )}

      {/* Papier */}
      <label style={{ ...labelStyle, marginBottom: "10px" }}>Papier</label>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {PAPER_OPTIONS.map(po => (
          <div key={po.id} onClick={() => update("paperOption", po.id)} style={cardSelectStyle(data.paperOption === po.id)}>
            <div style={{ fontSize: "20px" }}>{po.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, fontFamily: fonts.sans }}>{po.label}</span>
                {po.price > 0 && (
                  <span style={{ fontSize: "13px", fontWeight: 600, color: colors.primaryLight, fontFamily: fonts.sans }}>
                    + {cs}{po.price.toFixed(2)}
                  </span>
                )}
              </div>
              <div style={{ fontSize: "12px", color: colors.textLight, fontFamily: fonts.sans }}>{po.desc}</div>
            </div>
            {data.paperOption === po.id && <div style={{ color: colors.primaryLight, fontWeight: 700 }}>✔</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
