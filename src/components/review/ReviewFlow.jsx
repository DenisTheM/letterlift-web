// src/components/review/ReviewFlow.jsx
// ═══════════════════════════════════════════════════════
// Review-Flow: Brief-Freigabe durch den Besteller
// Wird von src/app/review/[token]/page.js eingebunden
// ═══════════════════════════════════════════════════════
"use client";
import { useState, useEffect } from "react";
import { reviewAPI } from "../../lib/api";
import { fonts, colors } from "../../styles/theme";
import ReviewLetterCard from "./ReviewLetterCard";
import ReviewActiveCard from "./ReviewActiveCard";
import { LoadingScreen, ErrorScreen, PausedScreen } from "./ReviewStatusScreen";

export default function ReviewFlow({ token }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editBody, setEditBody] = useState("");
  const [acting, setActing] = useState(null);
  const [done, setDone] = useState({});
  const [paused, setPaused] = useState(false);

  const reload = () => {
    reviewAPI({ action: "get_order", token }).then(res => {
      if (res.error) setError(res.error);
      else setData(res);
      setLoading(false);
    }).catch(() => { setError("Verbindungsfehler"); setLoading(false); });
  };

  useEffect(() => { reload(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Actions ───
  const approve = async (letterId) => {
    setActing(letterId);
    try {
      const res = await reviewAPI({ action: "approve", token, letterId });
      if (res.success) { setDone(p => ({ ...p, [letterId]: "approved" })); setTimeout(reload, 1500); }
      else setError(res.error || "Freigabe fehlgeschlagen. Bitte versuche es erneut.");
    } catch { setError("Verbindungsfehler bei der Freigabe. Bitte versuche es erneut."); }
    setActing(null);
  };

  const saveEdit = async (letterId) => {
    setActing(letterId);
    try {
      const res = await reviewAPI({ action: "edit", token, letterId, editedBody: editBody });
      if (res.success) { setDone(p => ({ ...p, [letterId]: "edited" })); setEditId(null); setTimeout(reload, 1500); }
      else setError(res.error || "Speichern fehlgeschlagen. Bitte versuche es erneut.");
    } catch { setError("Verbindungsfehler beim Speichern. Bitte versuche es erneut."); }
    setActing(null);
  };

  const stopOrder = async () => {
    if (!confirm("Serie wirklich pausieren? Zukünftige Briefe werden nicht versendet.")) return;
    setActing("stop");
    try {
      const res = await reviewAPI({ action: "stop", token });
      if (res.success) setPaused(true);
      else setError(res.error || "Pausieren fehlgeschlagen. Bitte versuche es erneut.");
    } catch { setError("Verbindungsfehler. Bitte versuche es erneut."); }
    setActing(null);
  };

  // ─── Status-Screens ───
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} hasData={!!data} onRetry={() => setError(null)} />;
  if (paused) return <PausedScreen />;

  // ─── Daten aufbereiten ───
  const { order, recipient, letters, pendingCount } = data;
  const name = recipient.nickname || recipient.name;
  const approvedLetters = letters.filter(l => l.status === "approved" || l.status === "sent" || done[l.id]);
  const approvedCount = approvedLetters.length;
  const nextToReview = letters.find(l => l.status === "draft" && l.review_sent_at && !done[l.id]);
  const allDone = approvedCount >= order.letterCount && !nextToReview && pendingCount === 0;

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: fonts.serif }}>
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 20px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "18px", fontWeight: 700, color: colors.primary, fontFamily: fonts.sans, marginBottom: "20px" }}>
            ✉️ LetterLift
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 400, margin: "0 0 8px", lineHeight: 1.3 }}>
            Briefe an {name}
          </h1>
          <p style={{ fontSize: "14px", color: colors.textLight, fontFamily: fonts.sans, margin: 0 }}>
            {order.packageName} · {approvedCount} von {order.letterCount} freigegeben
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ height: "6px", background: "#E8E4DF", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${(approvedCount / order.letterCount) * 100}%`,
              background: "linear-gradient(90deg, #5B7B6A, #3D5A4C)",
              borderRadius: "3px", transition: "width 0.5s ease",
            }} />
          </div>
        </div>

        {/* Freigegebene Briefe (collapsed) */}
        {approvedLetters.map(letter => (
          <ReviewLetterCard key={letter.id} letter={letter} doneStatus={done[letter.id]} />
        ))}

        {/* Nächster Brief zur Freigabe (expanded) */}
        {nextToReview && (
          <ReviewActiveCard
            letter={nextToReview}
            isEditing={editId === nextToReview.id}
            editBody={editBody}
            setEditBody={setEditBody}
            onApprove={approve}
            onSaveEdit={saveEdit}
            onStartEdit={(id, body) => { setEditId(id); setEditBody(body); }}
            onCancelEdit={() => setEditId(null)}
            isActing={acting === nextToReview.id}
          />
        )}

        {/* Pending Info */}
        {pendingCount > 0 && !allDone && (
          <div style={{ textAlign: "center", padding: "20px", background: colors.surfaceMuted, borderRadius: "14px", marginBottom: "24px" }}>
            <div style={{ fontSize: "14px", fontFamily: fonts.sans, color: colors.textMuted }}>
              ✨ {pendingCount === 1 ? "1 weiterer Brief wird" : `${pendingCount} weitere Briefe werden`} nach der Freigabe freigeschaltet.
            </div>
          </div>
        )}

        {/* All Done */}
        {allDone && (
          <div style={{ textAlign: "center", padding: "32px 20px", background: colors.primaryBg, borderRadius: "16px", marginTop: "20px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
            <div style={{ fontSize: "20px", fontWeight: 400, color: colors.textDark, marginBottom: "8px" }}>Alle Briefe freigegeben!</div>
            <div style={{ fontSize: "14px", fontFamily: fonts.sans, color: colors.textMuted }}>
              {name} wird sich über {order.letterCount === 1 ? "diesen Brief" : `diese ${order.letterCount} Briefe`} freuen.
            </div>
          </div>
        )}

        {/* Stop Button */}
        {!paused && !allDone && (
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <button onClick={stopOrder} disabled={acting === "stop"}
              style={{ background: "none", border: "none", color: colors.textLighter, fontSize: "13px", fontFamily: fonts.sans, cursor: "pointer", textDecoration: "underline" }}>
              {acting === "stop" ? "Wird pausiert..." : "Serie pausieren"}
            </button>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "48px", padding: "20px 0", borderTop: `1px solid ${colors.borderLight}` }}>
          <div style={{ fontSize: "12px", color: colors.textLighter, fontFamily: fonts.sans }}>
            Fragen? <a href="mailto:hello@letterlift.ch" style={{ color: colors.primaryLight }}>hello@letterlift.ch</a>
          </div>
        </div>

      </div>
    </div>
  );
}
