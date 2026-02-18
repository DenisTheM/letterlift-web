// src/components/steps/StepPackage.jsx
"use client";
import SectionHeader from "../shared/SectionHeader";
import { PACKAGES } from "../../data/constants";
import { fonts, colors } from "../../styles/theme";

export default function StepPackage({ data, update, currSymbol }) {
  const cs = currSymbol;

  return (
    <div>
      <SectionHeader
        title="Wähle dein Paket"
        subtitle="Ein einzelner Brief oder eine durchkomponierte Serie."
      />

      {/* Trial-Brief */}
      <div
        onClick={() => update("package", "trial")}
        style={{
          padding: "18px 22px", borderRadius: "16px",
          border: data.package === "trial" ? `2.5px solid ${colors.primaryLight}` : `1.5px dashed ${colors.border}`,
          background: data.package === "trial" ? "#F0F5EE" : colors.surface,
          cursor: "pointer", marginBottom: "20px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: "15px", fontWeight: 600, fontFamily: fonts.sans, color: colors.primary }}>🔍 Trial-Brief</div>
          <div style={{ fontSize: "13px", color: colors.textMuted, fontFamily: fonts.sans, marginTop: "2px" }}>
            Ein einzelner Brief – damit du siehst, wie persönlich LetterLift klingt.
          </div>
        </div>
        <div style={{ fontSize: "22px", fontWeight: 700, fontFamily: fonts.sans, whiteSpace: "nowrap" }}>{cs}9.90</div>
      </div>

      <div style={{ fontSize: "13px", fontFamily: fonts.sans, color: colors.textLight, marginBottom: "12px", fontWeight: 500 }}>
        Oder als Serie:
      </div>

      {/* Serien-Pakete */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {PACKAGES.filter(pk => !pk.trial).map(pk => (
          <div
            key={pk.id}
            onClick={() => update("package", pk.id)}
            style={{
              padding: "22px", borderRadius: "16px",
              border: data.package === pk.id ? `2.5px solid ${colors.primaryLight}` : `1.5px solid ${colors.borderLight}`,
              background: colors.surface, cursor: "pointer", position: "relative",
            }}
          >
            {pk.pop && (
              <div style={{
                position: "absolute", top: "-9px", right: "18px",
                background: colors.primaryLight, color: "#fff",
                fontSize: "10px", fontFamily: fonts.sans, fontWeight: 700,
                padding: "3px 12px", borderRadius: "100px", textTransform: "uppercase",
              }}>
                Beliebt
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: fonts.sans, color: colors.primary }}>{pk.name}</div>
                <div style={{ fontSize: "13px", color: "#7A7470", fontFamily: fonts.sans }}>{pk.letters} Briefe</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "26px", fontWeight: 700, fontFamily: fonts.sans }}>{cs}{pk.price.toFixed(2)}</div>
                <div style={{ fontSize: "12px", color: colors.textLighter, fontFamily: fonts.sans }}>{cs}{pk.pl}/Brief</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
