"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_SUPABASE_URL + "/functions/v1/review-letter";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function api(body) {
  return fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify(body),
  }).then(r => r.json());
}

export default function ReviewPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editBody, setEditBody] = useState("");
  const [acting, setActing] = useState(null);
  const [done, setDone] = useState({});
  const [paused, setPaused] = useState(false);

  const reload = () => {
    api({ action: "get_order", token }).then(res => {
      if (res.error) setError(res.error);
      else setData(res);
      setLoading(false);
    }).catch(() => { setError("Verbindungsfehler"); setLoading(false); });
  };

  useEffect(() => { reload(); }, [token]);

  const approve = async (letterId) => {
    setActing(letterId);
    const res = await api({ action: "approve", token, letterId });
    if (res.success) {
      setDone(p => ({ ...p, [letterId]: "approved" }));
      // Reload after short delay to show next letter
      setTimeout(reload, 1500);
    }
    setActing(null);
  };

  const saveEdit = async (letterId) => {
    setActing(letterId);
    const res = await api({ action: "edit", token, letterId, editedBody: editBody });
    if (res.success) {
      setDone(p => ({ ...p, [letterId]: "edited" }));
      setEditId(null);
      setTimeout(reload, 1500);
    }
    setActing(null);
  };

  const stopOrder = async () => {
    if (!confirm("Serie wirklich pausieren? Zukünftige Briefe werden nicht versendet.")) return;
    setActing("stop");
    const res = await api({ action: "stop", token });
    if (res.success) setPaused(true);
    setActing(null);
  };

  const F = "'DM Sans',sans-serif";
  const S = "'Lora',Georgia,serif";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#FBF8F5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: S }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>✉️</div>
        <div style={{ fontSize: "18px", color: "#6B6360" }}>Briefe werden geladen...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#FBF8F5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: S }}>
      <div style={{ textAlign: "center", maxWidth: "400px", padding: "0 20px" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>😔</div>
        <div style={{ fontSize: "20px", color: "#2D2926", marginBottom: "8px" }}>{error}</div>
        <div style={{ fontSize: "14px", color: "#8A8480", fontFamily: F }}>Dieser Link ist ungültig oder abgelaufen. Prüfe deine E-Mail für den korrekten Link.</div>
      </div>
    </div>
  );

  const { order, recipient, letters, pendingCount } = data;
  const name = recipient.nickname || recipient.name;
  const approvedCount = letters.filter(l => l.status === "approved" || l.status === "sent" || done[l.id]).length;
  const nextToReview = letters.find(l => l.status === "draft" && l.review_sent_at && !done[l.id]);

  if (paused) return (
    <div style={{ minHeight: "100vh", background: "#FBF8F5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: S }}>
      <div style={{ textAlign: "center", maxWidth: "400px", padding: "0 20px" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏸️</div>
        <div style={{ fontSize: "20px", color: "#2D2926", marginBottom: "8px" }}>Serie pausiert</div>
        <div style={{ fontSize: "14px", color: "#8A8480", fontFamily: F }}>Keine weiteren Briefe werden versendet. Kontaktiere uns unter hello@letterlift.ch um die Serie fortzusetzen.</div>
      </div>
    </div>
  );

  // All done state
  const allDone = approvedCount >= order.letterCount && !nextToReview && pendingCount === 0;

  return (
    <div style={{ minHeight: "100vh", background: "#FBF8F5", fontFamily: S }}>
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 20px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#3D5A4C", fontFamily: F, marginBottom: "20px" }}>✉️ LetterLift</div>
          <h1 style={{ fontSize: "26px", fontWeight: 400, margin: "0 0 8px", lineHeight: 1.3 }}>
            Briefe an {name}
          </h1>
          <p style={{ fontSize: "14px", color: "#8A8480", fontFamily: F, margin: 0 }}>
            {order.packageName} · {approvedCount} von {order.letterCount} freigegeben
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ height: "6px", background: "#E8E4DF", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(approvedCount / order.letterCount) * 100}%`, background: "linear-gradient(90deg, #5B7B6A, #3D5A4C)", borderRadius: "3px", transition: "width 0.5s ease" }} />
          </div>
        </div>

        {/* Already approved letters (collapsed) */}
        {letters.filter(l => l.status === "approved" || l.status === "sent" || done[l.id]).map(letter => (
          <div key={letter.id} style={{ marginBottom: "12px", background: "#fff", borderRadius: "14px", border: "1.5px solid #C6E0CC", overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, fontFamily: F, color: "#2D2926" }}>Brief {letter.letter_index}</span>
                <span style={{ fontSize: "11px", fontFamily: F, fontWeight: 600, padding: "3px 10px", borderRadius: "100px", background: letter.auto_approved ? "#FFF5E6" : "#EEF4F0", color: letter.auto_approved ? "#B8860B" : "#3D5A4C" }}>
                  {letter.sent_at ? "✅ Versendet" : letter.auto_approved ? "⏰ Auto-freigegeben" : done[letter.id] === "edited" ? "✏️ Bearbeitet" : "✅ Freigegeben"}
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "#B0A9A3", fontFamily: F }}>{letter.word_count} Wörter</span>
            </div>
          </div>
        ))}

        {/* Next letter to review (expanded) */}
        {nextToReview && (() => {
          const letter = nextToReview;
          const isEditing = editId === letter.id;
          const isActing = acting === letter.id;
          const deadline = new Date(new Date(letter.review_sent_at).getTime() + 24 * 60 * 60 * 1000);
          const hoursLeft = Math.max(0, Math.round((deadline - new Date()) / (1000 * 60 * 60)));

          return (
            <div style={{ marginBottom: "24px", marginTop: "20px", background: "#fff", borderRadius: "16px", border: "2px solid #5B7B6A", overflow: "hidden", boxShadow: "0 4px 16px rgba(61,90,76,0.08)" }}>
              {/* Header */}
              <div style={{ padding: "16px 20px", background: "#F0F5EE", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "15px", fontWeight: 700, fontFamily: F, color: "#3D5A4C" }}>Brief {letter.letter_index}</span>
                  <span style={{ fontSize: "11px", fontFamily: F, fontWeight: 600, padding: "3px 10px", borderRadius: "100px", background: "#FFF", color: "#5B7B6A" }}>Zur Freigabe</span>
                </div>
                <span style={{ fontSize: "11px", fontFamily: F, color: hoursLeft <= 6 ? "#E53E3E" : "#8A8480" }}>
                  {hoursLeft > 0 ? `${hoursLeft}h verbleibend` : "Wird automatisch freigegeben"}
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: "24px 20px" }}>
                {isEditing ? (
                  <textarea
                    value={editBody}
                    onChange={e => setEditBody(e.target.value)}
                    style={{ width: "100%", minHeight: "250px", padding: "16px", border: "1.5px solid #5B7B6A", borderRadius: "12px", fontSize: "15px", fontFamily: S, color: "#2D2926", lineHeight: 1.8, resize: "vertical", outline: "none", boxSizing: "border-box", background: "#FDFBF9" }}
                  />
                ) : (
                  <div style={{ fontSize: "15px", color: "#2D2926", lineHeight: 1.8, whiteSpace: "pre-line" }}>
                    {letter.body}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ padding: "0 20px 20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {isEditing ? (
                  <>
                    <button onClick={() => saveEdit(letter.id)} disabled={isActing} style={{ flex: 1, padding: "14px", background: "linear-gradient(135deg,#3D5A4C,#5B7B6A)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontFamily: F, fontWeight: 600, cursor: isActing ? "wait" : "pointer" }}>
                      {isActing ? "⏳ Speichern..." : "✅ Speichern & freigeben"}
                    </button>
                    <button onClick={() => setEditId(null)} style={{ padding: "14px 20px", background: "#F6F3EF", color: "#6B6360", border: "none", borderRadius: "12px", fontSize: "14px", fontFamily: F, cursor: "pointer" }}>
                      Abbrechen
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => approve(letter.id)} disabled={isActing} style={{ flex: 1, padding: "14px", background: "linear-gradient(135deg,#3D5A4C,#5B7B6A)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "15px", fontFamily: F, fontWeight: 600, cursor: isActing ? "wait" : "pointer" }}>
                      {isActing ? "⏳ Wird freigegeben..." : "✅ Brief freigeben"}
                    </button>
                    <button onClick={() => { setEditId(letter.id); setEditBody(letter.body); }} style={{ padding: "14px 20px", background: "#F6F3EF", color: "#3D5A4C", border: "none", borderRadius: "12px", fontSize: "14px", fontFamily: F, fontWeight: 600, cursor: "pointer" }}>
                      ✏️ Bearbeiten
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })()}

        {/* Pending info */}
        {pendingCount > 0 && !allDone && (
          <div style={{ textAlign: "center", padding: "20px", background: "#F6F3EF", borderRadius: "14px", marginBottom: "24px" }}>
            <div style={{ fontSize: "14px", fontFamily: F, color: "#6B6360" }}>
              ✨ {pendingCount === 1 ? "1 weiterer Brief wird" : `${pendingCount} weitere Briefe werden`} nach der Freigabe freigeschaltet.
            </div>
          </div>
        )}

        {/* All done state */}
        {allDone && (
          <div style={{ textAlign: "center", padding: "32px 20px", background: "#EEF4F0", borderRadius: "16px", marginTop: "20px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
            <div style={{ fontSize: "20px", fontWeight: 400, color: "#2D2926", marginBottom: "8px" }}>Alle Briefe freigegeben!</div>
            <div style={{ fontSize: "14px", fontFamily: F, color: "#6B6360" }}>
              {name} wird sich über {order.letterCount === 1 ? "diesen Brief" : `diese ${order.letterCount} Briefe`} freuen.
            </div>
          </div>
        )}

        {/* Stop button */}
        {!paused && !allDone && (
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <button onClick={stopOrder} disabled={acting === "stop"} style={{ background: "none", border: "none", color: "#B0A9A3", fontSize: "13px", fontFamily: F, cursor: "pointer", textDecoration: "underline" }}>
              {acting === "stop" ? "Wird pausiert..." : "Serie pausieren"}
            </button>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "48px", padding: "20px 0", borderTop: "1px solid #E0DAD4" }}>
          <div style={{ fontSize: "12px", color: "#B0A9A3", fontFamily: F }}>
            Fragen? <a href="mailto:hello@letterlift.ch" style={{ color: "#5B7B6A" }}>hello@letterlift.ch</a>
          </div>
        </div>
      </div>
    </div>
  );
}
