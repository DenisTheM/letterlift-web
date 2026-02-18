// src/components/review/ReviewActiveCard.jsx
// Zeigt den nächsten Brief zur Freigabe (expanded, mit Edit & Approve)
import { fonts, colors } from "../../styles/theme";

export default function ReviewActiveCard({
  letter, isEditing, editBody, setEditBody,
  onApprove, onSaveEdit, onStartEdit, onCancelEdit, isActing,
}) {
  const deadline = new Date(new Date(letter.review_sent_at).getTime() + 24 * 60 * 60 * 1000);
  const hoursLeft = Math.max(0, Math.round((deadline - new Date()) / (1000 * 60 * 60)));

  return (
    <div style={{
      marginBottom: "24px", marginTop: "20px", background: "#fff", borderRadius: "16px",
      border: `2px solid ${colors.primaryLight}`, overflow: "hidden",
      boxShadow: "0 4px 16px rgba(61,90,76,0.08)",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px", background: "#F0F5EE",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "15px", fontWeight: 700, fontFamily: fonts.sans, color: colors.primary }}>
            Brief {letter.letter_index}
          </span>
          <span style={{
            fontSize: "11px", fontFamily: fonts.sans, fontWeight: 600,
            padding: "3px 10px", borderRadius: "100px", background: "#FFF", color: colors.primaryLight,
          }}>
            Zur Freigabe
          </span>
        </div>
        <span style={{ fontSize: "11px", fontFamily: fonts.sans, color: hoursLeft <= 6 ? colors.error : colors.textLight }}>
          {hoursLeft > 0 ? `${hoursLeft}h verbleibend` : "Wird automatisch freigegeben"}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: "24px 20px" }}>
        {isEditing ? (
          <textarea
            value={editBody}
            onChange={e => setEditBody(e.target.value)}
            style={{
              width: "100%", minHeight: "250px", padding: "16px",
              border: `1.5px solid ${colors.primaryLight}`, borderRadius: "12px",
              fontSize: "15px", fontFamily: fonts.serif, color: colors.textDark,
              lineHeight: 1.8, resize: "vertical", outline: "none",
              boxSizing: "border-box", background: "#FDFBF9",
            }}
          />
        ) : (
          <div style={{ fontSize: "15px", color: colors.textDark, lineHeight: 1.8, whiteSpace: "pre-line" }}>
            {letter.body}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ padding: "0 20px 20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {isEditing ? (
          <>
            <button onClick={() => onSaveEdit(letter.id)} disabled={isActing}
              style={{
                flex: 1, padding: "14px", background: colors.primaryGrad, color: "#fff",
                border: "none", borderRadius: "12px", fontSize: "15px",
                fontFamily: fonts.sans, fontWeight: 600, cursor: isActing ? "wait" : "pointer",
              }}>
              {isActing ? "⏳ Speichern..." : "✅ Speichern & freigeben"}
            </button>
            <button onClick={onCancelEdit}
              style={{
                padding: "14px 20px", background: colors.surfaceMuted, color: colors.textMuted,
                border: "none", borderRadius: "12px", fontSize: "14px",
                fontFamily: fonts.sans, cursor: "pointer",
              }}>
              Abbrechen
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onApprove(letter.id)} disabled={isActing}
              style={{
                flex: 1, padding: "14px", background: colors.primaryGrad, color: "#fff",
                border: "none", borderRadius: "12px", fontSize: "15px",
                fontFamily: fonts.sans, fontWeight: 600, cursor: isActing ? "wait" : "pointer",
              }}>
              {isActing ? "⏳ Wird freigegeben..." : "✅ Brief freigeben"}
            </button>
            <button onClick={() => onStartEdit(letter.id, letter.body)}
              style={{
                padding: "14px 20px", background: colors.surfaceMuted, color: colors.primary,
                border: "none", borderRadius: "12px", fontSize: "14px",
                fontFamily: fonts.sans, fontWeight: 600, cursor: "pointer",
              }}>
              ✏️ Bearbeiten
            </button>
          </>
        )}
      </div>
    </div>
  );
}
