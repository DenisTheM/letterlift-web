// src/components/shared/SectionHeader.jsx
// Titel + Untertitel für jeden Onboarding-Step
import { fonts } from "../../styles/theme";

export default function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: "22px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 400, margin: "0 0 6px", fontFamily: fonts.serif, lineHeight: 1.3 }}>
        {title}
      </h2>
      <p style={{ fontSize: "13.5px", color: "#8A7F76", fontFamily: fonts.sans, margin: 0, lineHeight: 1.6 }}>
        {subtitle}
      </p>
    </div>
  );
}
