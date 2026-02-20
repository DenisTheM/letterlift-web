// src/components/steps/StepPreview.jsx
"use client";
import { useState, useEffect } from "react";
import SectionHeader from "../shared/SectionHeader";
import { assessQuality } from "../../lib/quality";
import { generatePreview } from "../../lib/preview";
import { preCheckoutSafetyCheck } from "../../lib/safety";
import { checkPreviewLimit } from "../../lib/rateLimit";
import { fetchAIPreviewAPI } from "../../lib/api";
import { fonts, colors } from "../../styles/theme";

export default function StepPreview({ data, isSelf, previewText, setPreviewText, goToStep, steps }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState("");

  const q = assessQuality(data);
  const fallbackPreview = generatePreview(data, isSelf);

  // KI-Vorschau automatisch laden
  useEffect(() => {
    if (previewText || loading) return;
    const limit = checkPreviewLimit();
    if (!limit.allowed) {
      setRateLimitMsg(limit.message);
      setPreviewText(fallbackPreview);
      return;
    }
    setRateLimitMsg("");
    setLoading(true);
    if (typeof window !== "undefined" && window.gtag) window.gtag("event", "preview_generated", { booking_type: data.bookingType });
    fetchAIPreviewAPI(data)
      .then(res => setPreviewText(res.preview || fallbackPreview))
      .catch(() => setPreviewText(fallbackPreview))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const safetyWarnings = (() => {
    const r = preCheckoutSafetyCheck(data);
    return [...r.criticalFlags, ...r.warnings];
  })();

  // Step-Index für Navigation zu Feldern
  const stepIdx = (name) => {
    const map = { noGo: "personality", context: "context" };
    return steps.indexOf(map[name] || name);
  };

  return (
    <div>
      <SectionHeader
        title="Dein erster Brief – Vorschau"
        subtitle={loading ? "Brief wird von unserer KI geschrieben..." : "So klingt Brief Nr. 1 – geschrieben von unserer KI. Du kannst ihn bearbeiten."}
      />

      {/* Qualitäts-Score */}
      <div style={{
        display: "flex", alignItems: "center", gap: "14px",
        padding: "16px 18px", background: "#fff", borderRadius: "14px",
        border: `1.5px solid ${q.color}33`, marginBottom: "16px",
      }}>
        <div style={{ fontSize: "32px" }}>{q.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: 700, fontFamily: fonts.sans, color: q.color }}>{q.level} – {q.score}%</div>
          <div style={{ fontSize: "12px", color: colors.textMuted, fontFamily: fonts.sans, marginTop: "2px" }}>{q.message}</div>
        </div>
      </div>

      {/* Safety Warnings */}
      {safetyWarnings.length > 0 && (
        <div style={{
          padding: "14px 16px",
          background: safetyWarnings.some(w => w.severity === "critical") ? colors.errorBg : colors.warningBg,
          borderRadius: "12px",
          border: `1px solid ${safetyWarnings.some(w => w.severity === "critical") ? colors.errorBorder : colors.warningBorder}`,
          marginBottom: "12px",
        }}>
          {safetyWarnings.map((w, i) => (
            <div key={i} style={{
              fontSize: "13px", fontFamily: fonts.sans,
              color: w.severity === "critical" ? colors.errorText : w.severity === "warning" ? colors.warningText : colors.primary,
              lineHeight: 1.6, marginBottom: i < safetyWarnings.length - 1 ? "8px" : "0",
            }}>
              {w.severity === "critical" ? "🚫" : "💡"} {w.message}
              {w.action && (
                <span onClick={() => { const idx = stepIdx(w.action); if (idx >= 0) goToStep(idx); }}
                  style={{ marginLeft: "6px", textDecoration: "underline", cursor: "pointer", fontWeight: 600 }}>
                  Jetzt ergänzen
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Issues */}
      {q.issues.length > 0 && (
        <div style={{ padding: "12px 16px", background: colors.errorBg, borderRadius: "10px", border: `1px solid ${colors.errorBorder}`, marginBottom: "12px" }}>
          {q.issues.map((x, i) => (
            <div key={i} style={{ fontSize: "12px", color: colors.errorText, fontFamily: fonts.sans }}>⚠️ {x}</div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {q.suggestions.length > 0 && (
        <div style={{ padding: "12px 16px", background: colors.warningBg, borderRadius: "10px", border: `1px solid ${colors.warningBorder}`, marginBottom: "12px" }}>
          <div style={{ fontSize: "12px", color: colors.warningText, fontFamily: fonts.sans }}>
            💡 Noch persönlicher: {q.suggestions.map((sg, si) => {
              const stepMap = {
                "Erinnerungen": "memories", "Erinnerungen vertiefen": "memories", "Erinnerungen ausführlicher": "memories",
                "Hobbies": "personality", "Stärken": "personality", "Bezugspersonen": "personality",
                "Ziel": "context", "Humor-Typ": "style",
              };
              const target = Object.entries(stepMap).find(([k]) => sg.includes(k));
              const idx = target ? steps.indexOf(target[1]) : -1;
              return (
                <span key={si}>
                  {si > 0 ? ", " : ""}
                  {idx >= 0
                    ? <span onClick={() => goToStep(idx)} style={{ textDecoration: "underline", cursor: "pointer", fontWeight: 600 }}>{sg}</span>
                    : sg}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Brief-Vorschau */}
      <div style={{
        background: data.paperOption === "standard" ? "#fff" : "#FFFDF7",
        borderRadius: "8px", boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
        border: "1px solid #EBE7E2", minHeight: "200px",
      }}>
        {editing ? (
          <textarea
            value={previewText}
            onChange={e => setPreviewText(e.target.value)}
            style={{
              width: "100%", minHeight: "300px", border: "none", outline: "none", background: "transparent",
              fontFamily: data.paperOption === "handwritten" ? fonts.hand : fonts.serif,
              fontSize: data.paperOption === "handwritten" ? "17px" : "15px",
              lineHeight: 1.85, color: "#3A3A3A", resize: "vertical",
              padding: "36px 32px", boxSizing: "border-box",
            }}
          />
        ) : (
          <div style={{
            padding: "36px 32px",
            fontFamily: data.paperOption === "handwritten" ? fonts.hand : fonts.serif,
            fontSize: data.paperOption === "handwritten" ? "17px" : "15px",
            lineHeight: 1.85, color: "#3A3A3A", whiteSpace: "pre-wrap",
          }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px", animation: "pulse 1.5s infinite" }}>✉️</div>
                <div style={{ fontSize: "14px", fontFamily: fonts.sans, color: colors.textLight }}>Dein Brief wird geschrieben...</div>
                <div style={{ fontSize: "12px", fontFamily: fonts.sans, color: colors.textLighter, marginTop: "6px" }}>
                  Unsere KI erstellt deinen persönlichen ersten Brief
                </div>
                <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
              </div>
            ) : (
              previewText || fallbackPreview
            )}
          </div>
        )}
      </div>

      {/* Edit-Buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
        <button
          onClick={() => setEditing(!editing)}
          style={{
            padding: "8px 18px", borderRadius: "8px",
            border: `1.5px solid ${colors.primaryLight}`,
            background: editing ? colors.primaryLight : "transparent",
            color: editing ? "#fff" : colors.primaryLight,
            fontSize: "13px", fontFamily: fonts.sans, fontWeight: 600, cursor: "pointer",
          }}
        >
          {editing ? "✓ Übernehmen" : "✏️ Brief bearbeiten"}
        </button>
        {editing && (
          <button
            onClick={() => { setPreviewText(fallbackPreview); setEditing(false); }}
            style={{
              padding: "8px 18px", borderRadius: "8px",
              border: `1.5px solid ${colors.border}`, background: "transparent",
              color: "#7A7470", fontSize: "13px", fontFamily: fonts.sans, cursor: "pointer",
            }}
          >
            ↺ Zurücksetzen
          </button>
        )}
      </div>

      {/* Rate Limit Warnung */}
      {rateLimitMsg && (
        <div style={{ marginTop: "12px", padding: "12px 16px", background: colors.errorBg, borderRadius: "10px", border: `1px solid ${colors.errorBorder}`, fontSize: "13px", fontFamily: fonts.sans, color: colors.errorText }}>
          {rateLimitMsg}
        </div>
      )}

      {/* Kontroll-Hinweis */}
      <div style={{
        marginTop: "16px", padding: "14px 16px", background: colors.primaryBg,
        borderRadius: "12px", fontSize: "13px", fontFamily: fonts.sans,
        color: colors.primary, lineHeight: 1.6,
      }}>
        <strong>✅ Volle Kontrolle:</strong> Jeden Brief vor Versand per E-Mail einsehen, bearbeiten oder stoppen.
      </div>
    </div>
  );
}
