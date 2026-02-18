// src/components/review/ReviewLetterCard.jsx
// Zeigt einen bereits freigegebenen/versendeten Brief (collapsed)
import { fonts, colors } from "../../styles/theme";

export default function ReviewLetterCard({ letter, doneStatus }) {
  const statusLabel = letter.sent_at
    ? "✅ Versendet"
    : letter.auto_approved
      ? "⏰ Auto-freigegeben"
      : doneStatus === "edited"
        ? "✏️ Bearbeitet"
        : "✅ Freigegeben";

  const statusBg = letter.auto_approved ? "#FFF5E6" : colors.primaryBg;
  const statusColor = letter.auto_approved ? "#B8860B" : colors.primary;

  return (
    <div style={{
      marginBottom: "12px", background: "#fff", borderRadius: "14px",
      border: `1.5px solid ${colors.primaryBorder}`, overflow: "hidden",
    }}>
      <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, fontFamily: fonts.sans, color: colors.textDark }}>
            Brief {letter.letter_index}
          </span>
          <span style={{
            fontSize: "11px", fontFamily: fonts.sans, fontWeight: 600,
            padding: "3px 10px", borderRadius: "100px",
            background: statusBg, color: statusColor,
          }}>
            {statusLabel}
          </span>
        </div>
        <span style={{ fontSize: "12px", color: colors.textLighter, fontFamily: fonts.sans }}>
          {letter.word_count} Wörter
        </span>
      </div>
    </div>
  );
}
