// src/components/review/ReviewStatusScreen.jsx
// Fullscreen-Zustände: Loading, Error, Paused
import { fonts, colors } from "../../styles/theme";

export function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.serif }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>✉️</div>
        <div style={{ fontSize: "18px", color: colors.textMuted }}>Briefe werden geladen...</div>
      </div>
    </div>
  );
}

export function ErrorScreen({ error, hasData, onRetry }) {
  return (
    <div style={{ minHeight: "100vh", background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.serif }}>
      <div style={{ textAlign: "center", maxWidth: "400px", padding: "0 20px" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>😔</div>
        <div style={{ fontSize: "20px", color: colors.textDark, marginBottom: "8px" }}>{error}</div>
        <div style={{ fontSize: "14px", color: colors.textLight, fontFamily: fonts.sans, marginBottom: "20px" }}>
          {hasData
            ? "Bitte versuche es erneut."
            : "Dieser Link ist ungültig oder abgelaufen. Prüfe deine E-Mail für den korrekten Link."}
        </div>
        {hasData && (
          <button onClick={onRetry} style={{
            background: colors.primaryGrad, color: "#fff", border: "none",
            borderRadius: "12px", padding: "12px 28px", fontSize: "14px",
            fontFamily: fonts.sans, fontWeight: 600, cursor: "pointer",
          }}>
            Erneut versuchen
          </button>
        )}
      </div>
    </div>
  );
}

export function PausedScreen() {
  return (
    <div style={{ minHeight: "100vh", background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.serif }}>
      <div style={{ textAlign: "center", maxWidth: "400px", padding: "0 20px" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏸️</div>
        <div style={{ fontSize: "20px", color: colors.textDark, marginBottom: "8px" }}>Serie pausiert</div>
        <div style={{ fontSize: "14px", color: colors.textLight, fontFamily: fonts.sans }}>
          Keine weiteren Briefe werden versendet. Kontaktiere uns unter hello@letterlift.ch um die Serie fortzusetzen.
        </div>
      </div>
    </div>
  );
}
