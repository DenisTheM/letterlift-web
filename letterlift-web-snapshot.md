# Codebase Snapshot: letterlift-web
> Erstellt am: 2026-02-18 11:59

## Verzeichnisstruktur
```
./_backup_20260218_112737/src/app/review/[token]/page.js
./_backup_20260218_112737/src/components/LetterLift.jsx
./_backup_20260218_112737/src/lib/rateLimit.js
./_backup_20260218_112737/src/lib/safety.js
./_backup_20260218_112737/src/lib/supabase.js
./.DS_Store
./.env.local
./.env.local.example
./.gitignore
./.vercel/project.json
./.vercel/README.txt
./middleware.js
./next.config.js
./package-lock.json
./package.json
./public/android-chrome-192x192.png
./public/android-chrome-512x512.png
./public/apple-touch-icon.png
./public/favicon-16x16.png
./public/favicon-32x32.png
./public/favicon.ico
./public/og-image.png
./public/site.webmanifest
./src/.DS_Store
./src/app/agb/page.js
./src/app/datenschutz/page.js
./src/app/impressum/page.js
./src/app/layout.js
./src/app/page.js
./src/app/review/[token]/page.js
./src/app/success/page.js
./src/components/landing/Landing.jsx
./src/components/LetterLift.jsx
./src/components/onboarding/OnboardingFlow.jsx
./src/components/review/ReviewActiveCard.jsx
./src/components/review/ReviewFlow.jsx
./src/components/review/ReviewLetterCard.jsx
./src/components/review/ReviewStatusScreen.jsx
./src/components/shared/SectionHeader.jsx
./src/components/shared/SpeechButton.jsx
./src/components/steps/StepAddress.jsx
./src/components/steps/StepContext.jsx
./src/components/steps/StepDelivery.jsx
./src/components/steps/StepMemories.jsx
./src/components/steps/StepOccasion.jsx
./src/components/steps/StepPackage.jsx
./src/components/steps/StepPersona.jsx
./src/components/steps/StepPersonality.jsx
./src/components/steps/StepPreview.jsx
./src/components/steps/StepRecipient.jsx
./src/components/steps/StepRouter.jsx
./src/components/steps/StepSender.jsx
./src/components/steps/StepStyle.jsx
./src/components/steps/StepSummary.jsx
./src/data/constants.js
./src/data/heroLetters.js
./src/data/occasionCopy.js
./src/data/steps.js
./src/hooks/useInView.js
./src/hooks/useRegion.js
./src/lib/api.js
./src/lib/formState.js
./src/lib/preview.js
./src/lib/quality.js
./src/lib/rateLimit.js
./src/lib/safety.js
./src/lib/supabase.js
./src/styles/theme.js
```

---

## `./_backup_20260218_112737/src/app/review/[token]/page.js`

```js
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
    try {
      const res = await api({ action: "approve", token, letterId });
      if (res.success) {
        setDone(p => ({ ...p, [letterId]: "approved" }));
        setTimeout(reload, 1500);
      } else {
        setError(res.error || "Freigabe fehlgeschlagen. Bitte versuche es erneut.");
      }
    } catch (e) {
      setError("Verbindungsfehler bei der Freigabe. Bitte versuche es erneut.");
    }
    setActing(null);
  };

  const saveEdit = async (letterId) => {
    setActing(letterId);
    try {
      const res = await api({ action: "edit", token, letterId, editedBody: editBody });
      if (res.success) {
        setDone(p => ({ ...p, [letterId]: "edited" }));
        setEditId(null);
        setTimeout(reload, 1500);
      } else {
        setError(res.error || "Speichern fehlgeschlagen. Bitte versuche es erneut.");
      }
    } catch (e) {
      setError("Verbindungsfehler beim Speichern. Bitte versuche es erneut.");
    }
    setActing(null);
  };

  const stopOrder = async () => {
    if (!confirm("Serie wirklich pausieren? Zukünftige Briefe werden nicht versendet.")) return;
    setActing("stop");
    try {
      const res = await api({ action: "stop", token });
      if (res.success) setPaused(true);
      else setError(res.error || "Pausieren fehlgeschlagen. Bitte versuche es erneut.");
    } catch (e) {
      setError("Verbindungsfehler. Bitte versuche es erneut.");
    }
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
        <div style={{ fontSize: "14px", color: "#8A8480", fontFamily: F, marginBottom: "20px" }}>
          {data ? "Bitte versuche es erneut." : "Dieser Link ist ungültig oder abgelaufen. Prüfe deine E-Mail für den korrekten Link."}
        </div>
        {data && <button onClick={() => { setError(null); }} style={{ background: "linear-gradient(135deg,#3D5A4C,#5B7B6A)", color: "#fff", border: "none", borderRadius: "12px", padding: "12px 28px", fontSize: "14px", fontFamily: F, fontWeight: 600, cursor: "pointer" }}>
          Erneut versuchen
        </button>}
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

```

## `./_backup_20260218_112737/src/components/LetterLift.jsx`

```jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { checkPreviewLimit, checkCheckoutLimit, checkAddressSearchLimit, createBotDetector } from "../lib/rateLimit";
import { preCheckoutSafetyCheck, screenInputs } from "../lib/safety";

const OCCASION_COPY = {
  tough_times: { contextQ:(n,s)=>s?"Was durchlebst du gerade?":`Was durchlebt ${n} gerade?`, contextPh:(n,s)=>s?"z.B. Ich stecke seit Monaten in einem Tief...":`z.B. ${n} hat sich getrennt und fühlt sich einsam...`, goalPh:(n,s)=>s?"z.B. Wieder wissen, dass es weitergeht.":`z.B. Dass ${n} merkt, dass sie nicht allein ist.`, freqRec:"every3",
    memQ:[
      s=>s?"Gab es einen Moment, in dem du gemerkt hast: Ich bin stärker als ich dachte?":"Was habt ihr gemeinsam durchgestanden?",
      s=>s?"Welcher Mensch hat dir in einer schweren Phase geholfen – und wie?":"Gab es einen Moment, der eure Beziehung vertieft hat?",
      s=>s?"Welches Erlebnis gibt dir heute noch Kraft?":"Was weiss nur ihr zwei – ein Geheimnis, ein Insider?"
    ],
    memPh:[
      s=>s?"z.B. Als ich die Kündigung bekam und trotzdem am nächsten Tag...":"z.B. Als ihr Vater krank war, bin ich einfach hingefahren und wir haben die ganze Nacht geredet...",
      s=>s?"z.B. Mein Bruder hat mich damals einfach abgeholt und nichts gesagt...":"z.B. Nach dem Streit letztes Jahr haben wir beide geweint und wussten: Das hier ist echt.",
      s=>s?"z.B. Die Wanderung am Bodensee, wo plötzlich alles klar wurde...":"z.B. Unser Codewort wenn einer von uns Hilfe braucht..."
    ]},
  motivation: { contextQ:(n,s)=>s?"Was ist dein Ziel?":`Was ist ${n}s Ziel?`, contextPh:(n,s)=>s?"z.B. Ich trainiere für meinen ersten Marathon...":`z.B. ${n} bereitet sich auf eine wichtige Prüfung vor...`, goalPh:(n,s)=>s?"z.B. Dass ich am Start stehe und weiss: Ich bin bereit.":`z.B. Dass ${n} mit Selbstvertrauen in die Prüfung geht.`, freqRec:"daily",
    memQ:[
      s=>s?"Wann hast du zuletzt etwas geschafft, woran du gezweifelt hast?":`Was hat ${s?"dich":"die Person"} schon bewiesen?`,
      s=>s?"Welcher Moment hat dich am meisten geprägt?":"Welche gemeinsame Erinnerung zeigt ihre Stärke?",
      s=>s?"Gibt es einen Satz oder ein Erlebnis, das dich immer wieder motiviert?":"Was würdest du ihr sagen, wenn sie aufgeben will?"
    ],
    memPh:[
      s=>s?"z.B. Letztes Jahr die Präsentation vor 200 Leuten – ich war so nervös, aber es lief...":"z.B. Sie hat 3 Monate für die Prüfung gelernt und mit Bestnote bestanden...",
      s=>s?"z.B. Der Moment als ich alleine nach Japan gereist bin...":"z.B. Wie sie beim Halbmarathon ab km 15 kämpfte aber durchhielt...",
      s=>s?"z.B. 'Du musst nicht perfekt sein, nur mutig.'":"z.B. 'Erinnerst du dich, wie du damals...'"
    ]},
  confidence: { contextQ:(n,s)=>s?"Wobei fehlt dir Selbstvertrauen?":`Wobei fehlt ${n} Selbstvertrauen?`, contextPh:(n,s)=>s?"z.B. Neuer Job, fühle mich den Aufgaben nicht gewachsen...":`z.B. ${n} hat sich beruflich verändert und zweifelt...`, goalPh:(n,s)=>s?"z.B. An mich glauben.":`z.B. Dass ${n} ihre Stärken wieder sieht.`, freqRec:"every3",
    memQ:[
      s=>s?"Wann hast du dich zuletzt richtig kompetent gefühlt?":"Wann hast du gesehen, wie sie über sich hinausgewachsen ist?",
      s=>s?"Wer glaubt an dich – und was hat diese Person gesagt?":"Gibt es einen Moment, in dem du dachtest: Wow, das ist sie wirklich?",
      s=>s?"Welche Eigenschaft unterschätzt du an dir am meisten?":"Was kann sie besser als sie selbst glaubt?"
    ],
    memPh:[
      s=>s?"z.B. Bei der Projektpräsentation, als alle danach klatschten...":"z.B. Ihre Rede an der Hochzeit – alle hatten Gänsehaut...",
      s=>s?"z.B. Meine Chefin hat gesagt: 'Du bist besser als du denkst.'":"z.B. Als sie ihren ersten Kunden coachte und er danach sagte...",
      s=>s?"z.B. Ich kann gut zuhören – das sagen alle, aber ich glaub es nie...":"z.B. Ihre Geduld mit Kindern – sie merkt gar nicht wie besonders das ist..."
    ]},
  appreciation: { contextQ:(n,s)=>s?"Wofür bist du dankbar?":`Was schätzt du an ${n}?`, contextPh:(n,s)=>s?"z.B. Ich möchte mir bewusster machen, was gut läuft...":`z.B. ${n} ist immer für alle da, bekommt aber selten Danke gesagt...`, goalPh:(n,s)=>s?"z.B. Dankbarkeit und Zufriedenheit.":`z.B. Dass ${n} sich gesehen und wertgeschätzt fühlt.`, freqRec:"weekly",
    memQ:[
      s=>s?"Welcher Moment hat dir gezeigt, was wirklich wichtig ist?":"Wann hat sie etwas getan, das du nie vergessen wirst?",
      s=>s?"Worüber lachst du heute noch?":"Was ist euer Running Gag oder Insider-Witz?",
      s=>s?"Welche kleine Geste eines anderen Menschen hat dich berührt?":"Was macht sie, ohne es zu merken, das anderen guttut?"
    ],
    memPh:[
      s=>s?"z.B. Als ich krank war und meine Nachbarin einfach Suppe gebracht hat...":"z.B. Als ich umgezogen bin, stand sie morgens um 6 vor der Tür – ohne dass ich gefragt hatte...",
      s=>s?"z.B. Der verbrannte Kuchen an meinem 30. Geburtstag...":"z.B. 'Das Ding mit dem Parkhaus in Italien' – wir müssen jedes Mal lachen...",
      s=>s?"z.B. Wie mein Vater jeden Sonntag frischen Zopf backt...":"z.B. Sie merkt immer, wenn es jemandem nicht gut geht – bevor die Person es selbst weiss..."
    ]},
  celebration: { contextQ:(n,s)=>s?"Was feierst du?":"Was gibt es zu feiern?", contextPh:(n,s)=>s?"z.B. Ich werde 40 und möchte das bewusst erleben.":`z.B. ${n} hat einen Meilenstein erreicht.`, goalPh:(n,s)=>s?"z.B. Mich selbst feiern.":`z.B. Dass ${n} merkt, wie weit sie gekommen ist.`, freqRec:"daily",
    memQ:[
      s=>s?"Was ist dein stolzester Moment der letzten Jahre?":"Was hat sie auf dem Weg dorthin erlebt?",
      s=>s?"Welcher Mensch hat diesen Erfolg mitermöglicht?":"Welche lustige Geschichte verbindet ihr?",
      s=>s?"Was hat dich der Weg dorthin gelehrt?":"Was würdest du ihr über den Weg sagen, den sie gegangen ist?"
    ],
    memPh:[
      s=>s?"z.B. Den Job zu kündigen und mein eigenes Ding zu starten...":"z.B. Die ersten Monate in der neuen Stadt, als alles unsicher war...",
      s=>s?"z.B. Ohne meinen Bruder hätte ich den Mut nie gehabt...":"z.B. Der Abend vor der Prüfung, als wir Pizza bestellt und gelacht haben...",
      s=>s?"z.B. Dass es okay ist, Angst zu haben und trotzdem zu springen...":"z.B. 'Du hast so oft gezweifelt – und schau wo du jetzt stehst.'"
    ]},
  growth: { contextQ:(n,s)=>s?"Woran arbeitest du gerade?":`Woran arbeitet ${n}?`, contextPh:(n,s)=>s?"z.B. Achtsamer leben, weniger Autopilot...":`z.B. ${n} ist in einer Umbruchphase...`, goalPh:(n,s)=>s?"z.B. Klarer wissen was ich will.":`z.B. Dass ${n} Klarheit gewinnt.`, freqRec:"every3",
    memQ:[
      s=>s?"Welcher Wendepunkt hat dich verändert?":"Was hat sie zuletzt verändert oder losgelassen?",
      s=>s?"Welche Gewohnheit oder Erkenntnis hat einen Unterschied gemacht?":"Wie hat sich eure Beziehung über die Zeit verändert?",
      s=>s?"Wo willst du in einem Jahr stehen?":"Was siehst du in ihr, das sie vielleicht noch nicht sieht?"
    ],
    memPh:[
      s=>s?"z.B. Der Moment, als ich gemerkt habe: Ich muss nicht allen gefallen...":"z.B. Als sie den toxischen Job gekündigt hat – obwohl alle dagegen waren...",
      s=>s?"z.B. Jeden Morgen 10 Minuten Stille – klingt banal, hat alles verändert...":"z.B. Früher war sie immer die Stille – heute steht sie für sich ein...",
      s=>s?"z.B. Weniger Perfektion, mehr Mut zum Unperfekten...":"z.B. Wie ruhig und klar sie geworden ist – das ist ihr gar nicht bewusst..."
    ]},
};
const DEFAULT_COPY = { contextQ:(n,s)=>s?"Was beschäftigt dich?":`Erzähl uns von ${n}`, contextPh:()=>"", goalPh:()=>"", freqRec:"every3",
  memQ:[
    s=>s?"Beschreibe einen besonderen Moment.":"Was habt ihr zusammen erlebt, worüber ihr heute noch redet?",
    s=>s?"Was hat dich geprägt?":"Gibt es eine Geschichte, die nur ihr zwei kennt?",
    s=>s?"Was gibt dir Kraft?":"Was ist typisch für sie – eine Macke, ein Ritual, ein Spruch?"
  ],
  memPh:[
    s=>s?"z.B. Der Tag, an dem alles anders wurde...":"z.B. Die Reise nach Lissabon, als wir...",
    s=>s?"z.B. Ein Gespräch, das mich verändert hat...":"z.B. Unser Ritual jeden Freitagabend...",
    s=>s?"z.B. Wenn ich an diesen Ort denke, spüre ich...":"z.B. Sie sagt immer '...' – das bringt mich jedes Mal zum Lachen..."
  ]};


const OCC = [
  { id: "tough_times", emoji: "🌧️", label: "Durch schwere Zeiten", desc: "Trennung, Trauer, Krankheit" },
  { id: "motivation", emoji: "🎯", label: "Motivation & Ziele", desc: "Sport, Prüfung, Karriere" },
  { id: "confidence", emoji: "💪", label: "Selbstvertrauen", desc: "Mut aufbauen, Neuanfang" },
  { id: "appreciation", emoji: "💛", label: "Wertschätzung", desc: "Danke sagen, Liebe zeigen" },
  { id: "celebration", emoji: "🎉", label: "Feiern & Ermutigen", desc: "Geburtstag, Meilenstein" },
  { id: "growth", emoji: "🌱", label: "Persönliches Wachstum", desc: "Achtsamkeit, Balance" },
];
const HUMOR = [{id:"dry",label:"Trocken"},{id:"wordplay",label:"Wortspiele"},{id:"warm",label:"Warmherzig"},{id:"sarcastic",label:"Sarkastisch"},{id:"none",label:"Kein Humor"}];
const STY = [
  {id:"warm",emoji:"🤗",label:"Warm & herzlich",desc:"Wie von der besten Freundin"},
  {id:"motivating",emoji:"⚡",label:"Motivierend & direkt",desc:"Wie ein Coach"},
  {id:"poetic",emoji:"✨",label:"Reflektierend & poetisch",desc:"Nachdenklich, bildreich"},
  {id:"humorous",emoji:"😄",label:"Humorvoll & leicht",desc:"Lustig mit Tiefe"},
  {id:"wise",emoji:"🌿",label:"Weise & gelassen",desc:"Wie ein Mentor"},
  {id:"custom",emoji:"✍️",label:"Eigener Stil",desc:"Beschreibe den Ton"},
];
const PKG=[{id:"trial",name:"Trial",letters:1,price:9.9,pl:"9.90",trial:true},{id:"impuls",name:"Impuls",letters:5,price:34.9,pl:"6.98"},{id:"classic",name:"Classic",letters:10,price:59.9,pl:"5.99",pop:true},{id:"journey",name:"Journey",letters:15,price:79.9,pl:"5.33"}];
const FREQ=[{id:"daily",label:"Täglich",desc:"Intensive Journey",icon:"📬"},{id:"every3",label:"Alle 3 Tage",desc:"Raum zum Nachdenken",icon:"📅"},{id:"weekly",label:"Wöchentlich",desc:"Längere Begleitung",icon:"🗓️"}];
const PAP=[{id:"standard",label:"Standard",desc:"120g-Papier, weisses Kuvert",price:0,icon:"📄"},{id:"premium",label:"Premium-Papier",desc:"200g, crèmefarbenes Kuvert",price:9.9,icon:"📜"},{id:"handwritten",label:"Handschrift-Edition",desc:"Premium-Papier + Handschrift-Font",price:19.9,icon:"✒️"}];
const REL=["Beste/r Freund/in","Partner/in","Mutter","Vater","Schwester","Bruder","Tochter","Sohn","Kolleg/in","Andere"];
const PERS=[
  {id:"bestfriend",emoji:"👋",label:"Dein bester Freund / beste Freundin",desc:"Jemand, der dich seit Jahren kennt",ph:"z.B. Mein bester Freund Tom"},
  {id:"mentor",emoji:"🧭",label:"Ein weiser Mentor",desc:"Coach, Lehrer oder Vorbild",ph:"z.B. Mein alter Trainer"},
  {id:"deceased",emoji:"🕊️",label:"Eine verstorbene Person",desc:"Jemand, dessen Stimme du vermisst",ph:"z.B. Meine Grossmutter"},
  {id:"future_self",emoji:"🔮",label:"Dein zukünftiges Ich",desc:"Die Version von dir, die es geschafft hat",ph:"z.B. Ich in 5 Jahren"},
  {id:"fictional",emoji:"📖",label:"Eine fiktive Figur",desc:"Aus Büchern, Filmen, Serien",ph:"z.B. Gandalf, Ted Lasso"},
  {id:"custom_persona",emoji:"✨",label:"Eigene Persona",desc:"Beschreibe frei",ph:"z.B. Eine warmherzige Stimme"},
];


function assessQuality(d) {
  let s=0,mx=0; const iss=[],sug=[];
  function chk(v,w,req,l,ml,mw) {
    mx+=w; if(!v||(typeof v==="string"&&v.trim().length===0)){if(!req)sug.push(l);return;}
    const t=typeof v==="string"?v.trim():String(v);
    const wds=t.split(/\s+/).filter(Boolean);const u=new Set(wds.map(x=>x.toLowerCase()));
    const avg=wds.length>0?wds.reduce((a,x)=>a+x.length,0)/wds.length:0;
    if(/(.){4,}/.test(t)||(u.size===1&&wds.length>2)||/^[^a-zA-Zäöü]+$/.test(t)){iss.push(l+": Inhalt nicht verwertbar");return;}
    if(wds.length>3&&u.size<wds.length*0.3){iss.push(l+": Viele Wiederholungen");s+=w*0.2;return;}
    if(avg>15||(avg<2&&wds.length>3)){iss.push(l+": Text ungewöhnlich");s+=w*0.3;return;}
    if(ml&&t.length<ml){s+=w*0.5;sug.push(l+" vertiefen");return;}
    if(mw&&wds.length<mw){s+=w*0.5;sug.push(l+" ausführlicher");return;}
    s+=w;
  }
  chk(d.recipientName,2,true,"Name",2);chk(d.occasion?"set":null,2,true,"Anlass");
  chk(d.contextText,4,true,"Situation",30,8);chk(d.goal,2,false,"Ziel");
  chk(d.hobbies,2,false,"Hobbies",5);chk(d.strengths,2,false,"Stärken",5);
  const memFields=[d.mem1,d.mem2,d.mem3,...(d.memExtra||[])].filter(Boolean);
  const memText=memFields.join(" ");
  chk(memText.length>0?memText:null,5,false,"Erinnerungen",30,8);
  const goodMems=memFields.filter(m=>m&&m.trim().length>=20).length;
  if(goodMems>=3){s+=2;mx+=2;}else if(goodMems>=2){s+=1;mx+=2;}else{mx+=2;}
  chk(d.importantPeople,1,false,"Bezugspersonen");
  chk(d.humor?.length>0?"set":null,1,false,"Humor-Typ");
  const r=mx>0?s/mx:0;let lv,co,em,msg;
  const pk=d.package;const briefCount=pk==="journey"?15:pk==="classic"?10:pk==="impuls"?5:1;
  if(r<0.3){lv="Unzureichend";co="#E53E3E";em="🔴";msg="Zu wenig Material.";}
  else if(r<0.5){lv="Basis";co="#DD6B20";em="🟠";msg=briefCount>5?`Für ${briefCount} Briefe fehlen noch Erinnerungen.`:"Grundlage da – mehr Details machen es unvergesslich.";}
  else if(r<0.7){lv="Gut";co="#D69E2E";em="🟡";msg=goodMems<2?"Gute Basis! Noch eine Erinnerung für richtig persönliche Briefe.":"Gute Basis! Noch etwas mehr Detail macht es perfekt.";}
  else if(r<0.85){lv="Sehr gut";co="#38A169";em="🟢";msg=`Stark! Genug Material für ${Math.min(goodMems*3,briefCount)} persönliche Briefe.`;}
  else{lv="Exzellent";co="#276749";em="💚";msg="Perfekt! Genug Material für Briefe, die wirklich berühren.";}
  return{score:Math.round(r*100),level:lv,color:co,emoji:em,message:msg,issues:iss,suggestions:sug};
}

function genPreview(d,isSelf) {
  const nk=d.nickname||d.recipientName||"du";
  const sa=Array.isArray(d.style)?d.style:[];
  const isH=sa.includes("humorous"),isP=sa.includes("poetic"),isW=sa.includes("warm")||sa.length===0;
  let g=isSelf?"Hey "+nk+",":"Liebe/r "+nk+",";
  if(isSelf&&d.persona==="deceased")g="Mein/e liebe/r "+nk+",";
  if(isSelf&&d.persona==="future_self")g="Hey "+nk+" –";
  const snd=isSelf?(d.personaName||"Jemand, der an dich glaubt"):(d.senderName||"Jemand, der dich kennt");
  const hobs=d.hobbies?d.hobbies.split(",").map(h=>h.trim()).filter(Boolean):[];
  const mem=(d.memories||"").trim();const str=d.strengths?d.strengths.split(",")[0]?.trim():null;
  let ln=[];
  if(mem.length>20){ln.push("Ich musste heute an etwas denken."+(isH?" Und ja, ich musste schmunzeln.":""));ln.push("Erinnerst du dich? "+(mem.length>100?mem.substring(0,100)+"...":mem));}
  else ln.push("Ich weiss, die letzten Wochen waren nicht einfach."+(isH?' Und nein, ich sage dir nicht, dass «alles gut wird».':""));
  if(hobs[0])ln.push((isP?"Es gibt Momente beim "+hobs[0]+", die alles leiser machen.":"Warst du beim "+hobs[0]+"?")+" Manchmal hilft es.");
  if(str)ln.push("Was ich "+(isSelf?"an mir":"an dir")+" bewundere: "+str+". Das vergisst man manchmal.");
  if(d.occasion==="tough_times")ln.push(isW?"Ich drücke dich ganz fest.":"Du bist stärker, als du denkst.");
  else if(d.occasion==="motivation")ln.push(isW?"Ich glaube an dich.":"Jeder Schritt zählt.");
  else ln.push(isW?"Ich denke an dich.":"Manche Menschen machen die Welt heller.");
  return g+"\n\n"+ln.join("\n\n")+"\n\n"+(isW?"Ganz fest gedrückt –":isP?"In Gedanken bei dir –":"Alles Gute –")+"\n"+snd;
}

function useInView(th=0.15){const ref=useRef(null);const[v,setV]=useState(false);useEffect(()=>{const el=ref.current;if(!el)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting)setV(true);},{threshold:th});o.observe(el);return()=>o.disconnect();},[]);return[ref,v];}

export default function App() {
  const [view,setView]=useState("landing");
  const [step,setStep]=useState(0);
  const [dir,setDir]=useState(1);
  // Region/currency detection from cookie
  const [region,setRegion]=useState("CH");
  useEffect(()=>{const h=window.location.hostname;if(h.endsWith('.de')||h.endsWith('.at')){setRegion('EU');return;}const m=document.cookie.match(/ll_region=(\w+)/);if(m)setRegion(m[1]);},[]);
  const cur=region==="CH"?"CHF":"EUR";
  const cs=region==="CH"?"CHF ":"€";
  const [anim,setAnim]=useState(false);
  const [vis,setVis]=useState(false);
  const [editing,setEditing]=useState(false);
  const [prevTxt,setPrevTxt]=useState("");
  const [prevLoading,setPrevLoading]=useState(false);
  const [rateLimitMsg,setRateLimitMsg]=useState("");
  // Bot detection
  const botDetector=useRef(null);
  if(!botDetector.current)botDetector.current=createBotDetector();
  const trackInteraction=()=>botDetector.current?.recordInteraction("input");
  const fetchAIPreview=async()=>{if(prevTxt||prevLoading)return;const limit=checkPreviewLimit();if(!limit.allowed){setRateLimitMsg(limit.message);setPrevTxt(genPreview(d,isSelf));return;}setRateLimitMsg("");setPrevLoading(true);try{const res=await fetch((process.env.NEXT_PUBLIC_SUPABASE_URL||"")+"/functions/v1/generate-preview",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"")},body:JSON.stringify({orderData:d})});const data=await res.json();if(data.preview)setPrevTxt(data.preview);else setPrevTxt(genPreview(d,isSelf));}catch(e){console.error("Preview error:",e);setPrevTxt(genPreview(d,isSelf));}finally{setPrevLoading(false);}};
  const [loading,setLoading]=useState(false);
  const [addrSugg,setAddrSugg]=useState([]);const[addrLoading,setAddrLoading]=useState(false);const addrTimer=useRef(null);
  const [d,setD]=useState({
    bookingType:null,recipientName:"",nickname:"",gender:"",relationship:"",language:"de",
    occasion:null,contextText:"",goal:"",hobbies:"",music:"",humor:[],
    strengths:"",importantPeople:"",noGo:"",memories:"",mem1:"",mem2:"",mem3:"",memExtra:[],style:[],
    customStyleDesc:"",senderName:"",senderMessage:"",
    persona:null,personaName:"",personaDesc:"",
    package:null,frequency:"weekly",paperOption:"standard",
    street:"",zip:"",city:"",country:"CH",email:"",_hp:"",
  });
  const u=(k,v)=>{setD(x=>{const nd={...x,[k]:v};
    // Auto-combine memory fields into memories string
    if(["mem1","mem2","mem3"].includes(k)||k==="memExtra"){
      const parts=[nd.mem1,nd.mem2,nd.mem3,...(nd.memExtra||[])].filter(s=>s&&s.trim().length>0);
      nd.memories=parts.map((p,i)=>`${i+1}) ${p.trim()}`).join("\n\n");
    }
    return nd;
  });};
  useEffect(()=>{setVis(false);setTimeout(()=>setVis(true),60);},[step,view]);
  const next=()=>{const target=nextValidStep(step,1);if(target>=STEPS.length)return;setDir(1);setAnim(true);setTimeout(()=>{setStep(target);setAnim(false);},180);};
  const back=()=>{const target=nextValidStep(step,-1);if(target<0)return;setDir(-1);setAnim(true);setTimeout(()=>{setStep(target);setAnim(false);},180);};
  const go=(type)=>{u("bookingType",type);setView("onboarding");setStep(0);setEditing(false);setPrevTxt("");};
  const isSelf=d.bookingType==="self";
  const rN=d.recipientName||(isSelf?"dich":"die Person");
  const isTrial=d.package==="trial";
  // STEPS is always the full list – delivery is skipped at navigation time for trial
  const STEPS=isSelf
    ?["recipient","occasion","context","personality","memories","persona","style","package","delivery","address","preview","summary"]
    :["recipient","occasion","context","personality","memories","sender","style","package","delivery","address","preview","summary"];
  const STEP_LABELS={recipient:"Empfänger",occasion:"Anlass",context:"Kontext",personality:"Persönlichkeit",memories:"Geschichte",persona:"Persona",sender:"Absender",style:"Stil",package:"Paket",delivery:"Frequenz",address:"Adresse",preview:"Vorschau",summary:"Zusammenfassung"};
  // Steps that should be skipped given current state
  const shouldSkip=(idx)=>{const id=STEPS[idx];if(id==="delivery"&&isTrial)return true;return false;};
  // Find next valid step index (skipping steps that don't apply)
  const nextValidStep=(from,direction)=>{let idx=from+direction;while(idx>=0&&idx<STEPS.length&&shouldSkip(idx))idx+=direction;return idx;};
  // Count visible steps for progress bar
  const visibleSteps=STEPS.filter((_,i)=>!shouldSkip(i));
  const visibleIndex=visibleSteps.indexOf(STEPS[step]);
  const tot=visibleSteps.length;const sid=STEPS[step];const prog=((visibleIndex+1)/tot)*100;
  const goToStep=(idx)=>{if(idx<step){setDir(-1);setAnim(true);setTimeout(()=>{setStep(idx);setAnim(false);},200);}};

  if(view==="landing")return <Landing go={go} cs={cs}/>;

  const I={width:"100%",padding:"14px 18px",border:"1.5px solid #D6CFC8",borderRadius:"12px",fontSize:"15px",fontFamily:"'Lora',Georgia,serif",color:"#2C2C2C",background:"#FDFCFA",outline:"none",transition:"border-color 0.2s",boxSizing:"border-box"};
  const T={...I,minHeight:"110px",resize:"vertical",lineHeight:1.7};
  const L={display:"block",fontSize:"11.5px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:"#8A7F76",letterSpacing:"0.08em",marginBottom:"7px",textTransform:"uppercase"};
  const O={color:"#BEB5AA",fontWeight:400};
  const ch=(s)=>({display:"inline-flex",alignItems:"center",padding:"9px 16px",borderRadius:"100px",border:s?"2px solid #5B7B6A":"1.5px solid #D6CFC8",background:s?"#EEF4F0":"#FDFCFA",color:s?"#3D5A4C":"#6B6360",fontSize:"13.5px",fontFamily:"'DM Sans',sans-serif",fontWeight:s?600:400,cursor:"pointer",transition:"all 0.2s",margin:"3px"});
  const cd=(s)=>({display:"flex",alignItems:"flex-start",gap:"14px",padding:"16px 18px",borderRadius:"12px",border:s?"2px solid #5B7B6A":"1.5px solid #E0DAD4",background:s?"#EEF4F0":"#FDFCFA",cursor:"pointer",transition:"all 0.2s"});
  const fc=e=>e.target.style.borderColor="#5B7B6A";
  const bl=e=>e.target.style.borderColor="#D6CFC8";

  const canGo=()=>{switch(sid){case"recipient":return d.recipientName.length>0;case"occasion":return!!d.occasion;case"context":return d.contextText.length>30;case"personality":return d.hobbies.length>2&&d.strengths.length>2&&d.humor.length>0;case"memories":{const filled=[d.mem1,d.mem2,d.mem3,...(d.memExtra||[])].filter(s=>s&&s.trim().length>=20).length;return filled>=1;};case"style":return Array.isArray(d.style)&&d.style.length>0;case"package":return!!d.package;case"delivery":return!!d.frequency;case"persona":return!!d.persona;case"sender":return(d.senderName||"").length>0;case"address":return d.country==="OTHER"||( d.street.length>3&&d.city.length>1&&d.country.length>0&&(()=>{const pl={CH:4,DE:5,AT:4};const req=pl[d.country]||4;return d.zip.replace(/\D/g,"").length===req;})());default:return true;}};
  const tp=()=>{const pk=PKG.find(p=>p.id===d.package);const pa=PAP.find(p=>p.id===d.paperOption);return(pk?.price||0)+(pa?.price||0);};

  const renderStep=()=>{
    switch(sid){
    case"recipient":return(<div><SH t={isSelf?"Über dich":"Wem sollen die Briefe Kraft geben?"} s={isSelf?"Damit die Briefe sich anfühlen, als kämen sie von jemandem, der dich kennt.":"Je mehr wir erfahren, desto persönlicher."}/>
      <div style={{display:"flex",flexDirection:"column",gap:"18px"}}>
        <div><label style={L}>Vorname</label><input style={I} placeholder={isSelf?"Dein Vorname":"z.B. Sarah"} value={d.recipientName} onChange={e=>{u("recipientName",e.target.value);trackInteraction();}} onFocus={fc} onBlur={bl}/></div>
        <div><label style={L}>Geschlecht <span style={{fontSize:"11px",color:"#B0A9A3",fontWeight:400}}>(für korrekte Ansprache)</span></label><div style={{display:"flex",flexWrap:"wrap"}}>{[["f","♀ Weiblich"],["m","♂ Männlich"],["x","✦ Divers"]].map(([k,l])=><span key={k} style={ch(d.gender===k)} onClick={()=>u("gender",k)}>{l}</span>)}</div></div>
        <div><label style={L}>Spitzname <span style={O}>optional</span></label><input style={I} placeholder="z.B. Sari" value={d.nickname} onChange={e=>u("nickname",e.target.value)} onFocus={fc} onBlur={bl}/></div>
        {!isSelf&&<div><label style={L}>Beziehung</label><div style={{display:"flex",flexWrap:"wrap"}}>{REL.map(r=><span key={r} style={ch(d.relationship===r)} onClick={()=>u("relationship",r)}>{r}</span>)}</div></div>}
        <div><label style={L}>Sprache</label><div style={{display:"flex",flexWrap:"wrap"}}>{[["de","🇨🇭 Deutsch"],["en","🇬🇧 English"],["fr","🇫🇷 Français"],["it","🇮🇹 Italiano"]].map(([k,l])=><span key={k} style={ch(d.language===k)} onClick={()=>u("language",k)}>{l}</span>)}</div></div>
      </div></div>);

    case"occasion":return(<div><SH t={isSelf?"Wobei sollen die Briefe helfen?":"Worum geht es?"} s="Wähle den Bereich."/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>{OCC.map(o=>(<div key={o.id} onClick={()=>u("occasion",o.id)} style={{padding:"18px",borderRadius:"14px",border:d.occasion===o.id?"2px solid #5B7B6A":"1.5px solid #E0DAD4",background:d.occasion===o.id?"#EEF4F0":"#FDFCFA",cursor:"pointer"}}><div style={{fontSize:"26px",marginBottom:"6px"}}>{o.emoji}</div><div style={{fontSize:"14px",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{o.label}</div><div style={{fontSize:"12px",color:"#8A8480",fontFamily:"'DM Sans',sans-serif",marginTop:"2px"}}>{o.desc}</div></div>))}</div></div>);

    case"context":{const _oc=OCCASION_COPY[d.occasion]||DEFAULT_COPY;
      const CtxSpeech=()=>{const[isRec,setIsRec]=useState(false);const recRef=useRef(null);const startRef=useRef('');const hasSpeech=typeof window!=='undefined'&&('webkitSpeechRecognition' in window||'SpeechRecognition' in window);const toggle=()=>{if(isRec){recRef.current?.stop();setIsRec(false);return;}if(!hasSpeech)return;const SR=window.SpeechRecognition||window.webkitSpeechRecognition;const r=new SR();r.lang='de-DE';r.continuous=true;r.interimResults=true;recRef.current=r;startRef.current=d.contextText;let final='';r.onresult=(ev)=>{let interim='';for(let i=ev.resultIndex;i<ev.results.length;i++){if(ev.results[i].isFinal)final+=ev.results[i][0].transcript+' ';else interim=ev.results[i][0].transcript;}const pre=startRef.current;u('contextText',(pre?(pre+' '):'')+final.trimEnd()+(interim?' '+interim:''));};r.onend=()=>setIsRec(false);r.start();setIsRec(true);};if(!hasSpeech)return null;return(<button type="button" onClick={toggle} style={{position:'absolute',right:'10px',bottom:'10px',background:isRec?'#E53E3E':'#EEF4F0',border:'none',borderRadius:'50%',width:'36px',height:'36px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',transition:'all 0.2s',boxShadow:isRec?'0 0 0 3px rgba(229,62,62,0.3)':'none'}}>{isRec?'⏹':'🎙️'}</button>);};
      return(<div><SH t={_oc.contextQ(rN,isSelf)} s="Je ehrlicher, desto wirkungsvoller."/>
      <div style={{display:"flex",flexDirection:"column",gap:"18px"}}>
        <div><label style={L}>{_oc.contextQ(rN,isSelf)}</label><div style={{position:"relative"}}><textarea style={{...T,paddingRight:"50px"}} value={d.contextText} onChange={e=>{u("contextText",e.target.value);trackInteraction();}} placeholder={_oc.contextPh(rN,isSelf)} onFocus={fc} onBlur={bl}/><CtxSpeech/></div></div>
        <div><label style={L}>Ziel <span style={O}>optional</span></label><textarea style={{...T,minHeight:"70px"}} value={d.goal} onChange={e=>u("goal",e.target.value)} placeholder={_oc.goalPh(rN,isSelf)} onFocus={fc} onBlur={bl}/></div>
      </div></div>);}

    case"personality":return(<div><SH t={"Persönlichkeit"+(isSelf?"":" von "+rN)} s="Details machen den Unterschied."/>
      <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
        <div><label style={L}>Hobbies</label><input style={I} value={d.hobbies} onChange={e=>u("hobbies",e.target.value)} placeholder="z.B. Yoga, Backen" onFocus={fc} onBlur={bl}/></div>
        <div><label style={L}>Humor-Typ</label><div style={{display:"flex",flexWrap:"wrap"}}>{HUMOR.map(h=><span key={h.id} style={ch(d.humor.includes(h.id))} onClick={()=>u("humor",d.humor.includes(h.id)?d.humor.filter(x=>x!==h.id):[...d.humor,h.id])}>{h.label}</span>)}</div></div>
        <div><label style={L}>Stärken</label><input style={I} value={d.strengths} onChange={e=>u("strengths",e.target.value)} placeholder="z.B. Loyal, mutig" onFocus={fc} onBlur={bl}/></div>
        <div><label style={L}>Bezugspersonen</label><input style={I} value={d.importantPeople} onChange={e=>u("importantPeople",e.target.value)} placeholder='z.B. Schwester Lena, bester Freund Marco, Oma Helga' onFocus={fc} onBlur={bl}/></div>
        <div><label style={L}>No-Go-Themen</label><input style={I} value={d.noGo} onChange={e=>u("noGo",e.target.value)} placeholder="z.B. Ex nicht erwähnen" onFocus={fc} onBlur={bl}/><div style={{fontSize:"11px",color:"#C0785A",fontFamily:"'DM Sans',sans-serif",marginTop:"5px"}}>⚠️ Themen, die nicht vorkommen sollen.</div></div>
      </div></div>);

    case"memories":{const _oc=OCCASION_COPY[d.occasion]||DEFAULT_COPY;const memQs=_oc.memQ||DEFAULT_COPY.memQ;const memPhs=_oc.memPh||DEFAULT_COPY.memPh;const filledCount=[d.mem1,d.mem2,d.mem3,...(d.memExtra||[])].filter(s=>s&&s.trim().length>=20).length;const totalMems=3+(d.memExtra||[]).length;const minMems=1;const recommendedMems=3;
      const SpeechBtn=({field})=>{const[isRec,setIsRec]=useState(false);const recRef=useRef(null);const startRef=useRef('');const hasSpeech=typeof window!=='undefined'&&('webkitSpeechRecognition' in window||'SpeechRecognition' in window);const toggle=()=>{if(isRec){recRef.current?.stop();setIsRec(false);return;}if(!hasSpeech)return;const SR=window.SpeechRecognition||window.webkitSpeechRecognition;const r=new SR();r.lang='de-DE';r.continuous=true;r.interimResults=true;recRef.current=r;const prev=typeof field==='number'?(field===0?d.mem1:field===1?d.mem2:d.mem3):(d.memExtra||[])[field-3]||'';startRef.current=prev;let final='';r.onresult=(ev)=>{let interim='';for(let i=ev.resultIndex;i<ev.results.length;i++){if(ev.results[i].isFinal)final+=ev.results[i][0].transcript+' ';else interim=ev.results[i][0].transcript;}const pre=startRef.current;const newVal=(pre?(pre+' '):'')+final.trimEnd()+(interim?' '+interim:'');if(typeof field==='number'&&field<3)u(field===0?'mem1':field===1?'mem2':'mem3',newVal);else{const ne=[...(d.memExtra||[])];ne[field-3]=newVal;u('memExtra',ne);}};r.onend=()=>setIsRec(false);r.start();setIsRec(true);};if(!hasSpeech)return null;return(<button type="button" onClick={toggle} style={{position:'absolute',right:'10px',bottom:'10px',background:isRec?'#E53E3E':'#EEF4F0',border:'none',borderRadius:'50%',width:'36px',height:'36px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',transition:'all 0.2s',boxShadow:isRec?'0 0 0 3px rgba(229,62,62,0.3)':'none'}}>{isRec?'⏹':'🎙️'}</button>);};
      return(<div><SH t={isSelf?"Deine besonderen Momente":"Eure gemeinsame Geschichte"} s={isSelf?"Das Herzstück deiner Briefe.":"Je mehr Erinnerungen, desto persönlicher die Briefe."}/>
      <div style={{padding:"14px 16px",background:"#FFF8F0",borderRadius:"12px",border:"1px solid #F0E4D4",marginBottom:"18px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#8B6914",lineHeight:1.6}}>
        <strong>⭐ Hier entstehen die besten Briefe.</strong> Mindestens 1 Erinnerung nötig – aber je mehr, desto persönlicher. Nimm dir 5 Minuten. Jede Erinnerung wird zu einem eigenen, einzigartigen Briefmoment.
        <span> {filledCount>=recommendedMems?" 💚 Genug für richtig persönliche Briefe!":filledCount>=minMems?` 🟢 Gut! Noch ${recommendedMems-filledCount} Erinnerung${recommendedMems-filledCount>1?"en":""} für optimale Ergebnisse.`:` 🟡 Noch ${minMems-filledCount} Erinnerung${minMems-filledCount>1?"en":""} nötig.`}</span>
      </div>
      <div style={{padding:"10px 16px",background:"#EEF4F0",borderRadius:"12px",marginBottom:"18px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C",display:typeof window!=='undefined'&&('webkitSpeechRecognition' in window||'SpeechRecognition' in window)?"flex":"none",alignItems:"center",gap:"8px"}}>🎙️ <strong>Tipp:</strong> Drücke das Mikrofon und erzähl einfach drauflos – oft fällt einem mehr ein als beim Tippen.</div>
      <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
        {[0,1,2].map(i=><div key={i}>
          <label style={L}>{memQs[i](isSelf)}</label>
          <div style={{position:"relative"}}><textarea style={{...T,minHeight:"100px",paddingRight:"50px"}} value={i===0?d.mem1:i===1?d.mem2:d.mem3} onChange={e=>u(i===0?"mem1":i===1?"mem2":"mem3",e.target.value)} placeholder={memPhs[i](isSelf)} onFocus={fc} onBlur={bl}/><SpeechBtn field={i}/></div>
        </div>)}
        {(d.memExtra||[]).map((mx,i)=><div key={`extra-${i}`}>
          <label style={{...L,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span>Erinnerung {i+4}</span>
            <span onClick={()=>{const ne=[...(d.memExtra||[])];ne.splice(i,1);u("memExtra",ne);}} style={{color:"#C0785A",cursor:"pointer",fontSize:"11px",fontWeight:400,textTransform:"none",letterSpacing:0}}>Entfernen</span>
          </label>
          <div style={{position:"relative"}}><textarea style={{...T,minHeight:"100px",paddingRight:"50px"}} value={mx} onChange={e=>{const ne=[...(d.memExtra||[])];ne[i]=e.target.value;u("memExtra",ne);}} placeholder="Noch ein besonderer Moment..." onFocus={fc} onBlur={bl}/><SpeechBtn field={i+3}/></div>
        </div>)}
        {totalMems<6&&<button onClick={()=>u("memExtra",[...(d.memExtra||[]),""])} style={{background:"none",border:"1.5px dashed #D6CFC8",borderRadius:"12px",padding:"14px",fontSize:"14px",fontFamily:"'DM Sans',sans-serif",color:"#5B7B6A",cursor:"pointer",fontWeight:500,transition:"all 0.2s"}}>+ Weitere Erinnerung hinzufügen</button>}
      </div>
      <div style={{marginTop:"14px",padding:"14px 16px",background:"#F6F3EF",borderRadius:"12px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#6B6360"}}><strong>💡</strong> Insider-Witze · Reisen · Mutmomente · Liebevolle Macken · Rituale · Peinliche Geschichten</div></div>);}

    case"persona":return(<div><SH t="Wer soll dir die Briefe schreiben?" s="Wähle eine Stimme. Die Briefe klingen, als kämen sie von dieser Person."/>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>{PERS.map(pt=>(<div key={pt.id} onClick={()=>u("persona",pt.id)} style={cd(d.persona===pt.id)}><div style={{fontSize:"24px",marginTop:"2px"}}>{pt.emoji}</div><div style={{flex:1}}><div style={{fontSize:"14px",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{pt.label}</div><div style={{fontSize:"12px",color:"#8A8480",fontFamily:"'DM Sans',sans-serif",marginTop:"2px"}}>{pt.desc}</div></div>{d.persona===pt.id&&<div style={{color:"#5B7B6A",fontSize:"17px",fontWeight:700}}>✓</div>}</div>))}</div>
      {d.persona&&<div style={{marginTop:"16px"}}><label style={L}>{d.persona==="deceased"?"Name der Person":d.persona==="future_self"?"Wie spricht dein zukünftiges Ich?":"Name / Beschreibung"}</label><input style={I} value={d.personaName} onChange={e=>u("personaName",e.target.value)} placeholder={PERS.find(p=>p.id===d.persona)?.ph} onFocus={fc} onBlur={bl}/>
        {d.persona==="deceased"&&<div style={{marginTop:"12px",padding:"14px 16px",background:"#F6F3EF",borderRadius:"12px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#6B6360",lineHeight:1.6}}><strong>🕊️</strong> Behutsam im Ton dieser Person. Erzähl typische Sätze, Kosenamen, Eigenheiten.</div>}
        {d.persona==="future_self"&&<div style={{marginTop:"12px",padding:"14px 16px",background:"#EEF4F0",borderRadius:"12px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C",lineHeight:1.6}}><strong>🔮</strong> Schreibt aus einer Position der Stärke – es hat geschafft, was du anstrebst.</div>}
        {(d.persona==="custom_persona"||d.persona==="fictional")&&<div style={{marginTop:"12px"}}><label style={L}>Stimme beschreiben <span style={O}>optional</span></label><textarea style={{...T,minHeight:"80px"}} value={d.personaDesc} onChange={e=>u("personaDesc",e.target.value)} placeholder="z.B. Spricht ruhig, nennt mich 'Kleines'..." onFocus={fc} onBlur={bl}/></div>}
      </div>}</div>);

    case"sender":return(<div><SH t="Über dich als Absender" s="Damit die Briefe authentisch klingen."/>
      <div style={{display:"flex",flexDirection:"column",gap:"18px"}}>
        <div><label style={L}>Dein Vorname</label><input style={I} value={d.senderName} onChange={e=>u("senderName",e.target.value)} placeholder="z.B. Lena" onFocus={fc} onBlur={bl}/></div>
        <div><label style={L}>Was möchtest du {rN} mitgeben? <span style={O}>optional</span></label><textarea style={{...T,minHeight:"80px"}} value={d.senderMessage} onChange={e=>u("senderMessage",e.target.value)} placeholder={rN+" soll wissen, dass ich da bin."} onFocus={fc} onBlur={bl}/></div>
        <div style={{padding:"14px 16px",background:"#EEF4F0",borderRadius:"12px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C",lineHeight:1.6}}><strong>✉️ Volle Kontrolle:</strong> Du erhältst jeden Brief vor dem Versand und kannst ihn bearbeiten.</div>
      </div></div>);

    case"style":return(<div><SH t="Wie sollen die Briefe klingen?" s="Mehrere Stile kombinierbar."/>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>{STY.map(s=>{const arr=Array.isArray(d.style)?d.style:[];const sel=arr.includes(s.id);return(<div key={s.id} onClick={()=>{if(s.id==="custom")u("style",[s.id]);else{const p=arr.filter(x=>x!=="custom");u("style",sel?p.filter(x=>x!==s.id):[...p,s.id]);}}} style={cd(sel)}><div style={{fontSize:"22px",width:"34px",textAlign:"center",flexShrink:0}}>{s.emoji}</div><div style={{flex:1}}><div style={{fontSize:"14px",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{s.label}</div><div style={{fontSize:"12px",color:"#8A8480",fontFamily:"'DM Sans',sans-serif"}}>{s.desc}</div></div>{sel&&<div style={{color:"#5B7B6A",fontSize:"17px",fontWeight:700}}>✓</div>}</div>);})}</div>
      {Array.isArray(d.style)&&d.style.includes("custom")&&<div style={{marginTop:"14px"}}><label style={L}>Beschreibe den Stil</label><textarea style={T} value={d.customStyleDesc} onChange={e=>u("customStyleDesc",e.target.value)} placeholder="z.B. Wie meine Oma – liebevoll, altmodisch..." onFocus={fc} onBlur={bl}/></div>}</div>);

    case"package":return(<div><SH t="Wähle dein Paket" s="Ein einzelner Brief oder eine durchkomponierte Serie."/>
      <div onClick={()=>u("package","trial")} style={{padding:"18px 22px",borderRadius:"16px",border:d.package==="trial"?"2.5px solid #5B7B6A":"1.5px dashed #D6CFC8",background:d.package==="trial"?"#F0F5EE":"#FDFCFA",cursor:"pointer",marginBottom:"20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:"15px",fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C"}}>🔍 Trial-Brief</div><div style={{fontSize:"13px",color:"#6B6360",fontFamily:"'DM Sans',sans-serif",marginTop:"2px"}}>Ein einzelner Brief – damit du siehst, wie persönlich LetterLift klingt.</div></div><div style={{fontSize:"22px",fontWeight:700,fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>{cs}9.90</div></div>
      <div style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#8A8480",marginBottom:"12px",fontWeight:500}}>Oder als Serie:</div>
      <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>{PKG.filter(pk=>!pk.trial).map(pk=>(<div key={pk.id} onClick={()=>u("package",pk.id)} style={{padding:"22px",borderRadius:"16px",border:d.package===pk.id?"2.5px solid #5B7B6A":"1.5px solid #E0DAD4",background:"#FDFCFA",cursor:"pointer",position:"relative"}}>{pk.pop&&<div style={{position:"absolute",top:"-9px",right:"18px",background:"#5B7B6A",color:"#fff",fontSize:"10px",fontFamily:"'DM Sans',sans-serif",fontWeight:700,padding:"3px 12px",borderRadius:"100px",textTransform:"uppercase"}}>Beliebt</div>}<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:"18px",fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C"}}>{pk.name}</div><div style={{fontSize:"13px",color:"#7A7470",fontFamily:"'DM Sans',sans-serif"}}>{pk.letters} Briefe</div></div><div style={{textAlign:"right"}}><div style={{fontSize:"26px",fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>{cs}{pk.price.toFixed(2)}</div><div style={{fontSize:"12px",color:"#B0A9A3",fontFamily:"'DM Sans',sans-serif"}}>{cs}{pk.pl}/Brief</div></div></div></div>))}</div></div>);

    case"delivery":{const pk=PKG.find(q=>q.id===d.package);const dy=pk?(d.frequency==="daily"?pk.letters:d.frequency==="every3"?pk.letters*3:pk.letters*7):0;return(<div><SH t="Versand & Ausstattung" s="Wie oft und in welcher Qualität?"/>
      <label style={{...L,marginBottom:"10px"}}>Frequenz</label>
      <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"24px"}}>{FREQ.map(f=>(<div key={f.id} onClick={()=>u("frequency",f.id)} style={cd(d.frequency===f.id)}><div style={{fontSize:"20px"}}>{f.icon}</div><div style={{flex:1}}><div style={{fontSize:"14px",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{f.label}</div><div style={{fontSize:"12px",color:"#8A8480",fontFamily:"'DM Sans',sans-serif"}}>{f.desc}</div></div>{d.frequency===f.id&&<div style={{color:"#5B7B6A",fontWeight:700}}>✓</div>}</div>))}</div>
      {pk&&<div style={{padding:"14px 16px",background:"#F6F3EF",borderRadius:"12px",marginBottom:"24px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#6B6360"}}>📊 <strong>{pk.letters} Briefe</strong> × <strong>{FREQ.find(f=>f.id===d.frequency)?.label}</strong> = ca. <strong>{Math.ceil(dy/7)} Wochen</strong></div>}
      <label style={{...L,marginBottom:"10px"}}>Papier</label>
      <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>{PAP.map(po=>(<div key={po.id} onClick={()=>u("paperOption",po.id)} style={cd(d.paperOption===po.id)}><div style={{fontSize:"20px"}}>{po.icon}</div><div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:"14px",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{po.label}</span>{po.price>0&&<span style={{fontSize:"13px",fontWeight:600,color:"#5B7B6A",fontFamily:"'DM Sans',sans-serif"}}>+ {cs}{po.price.toFixed(2)}</span>}</div><div style={{fontSize:"12px",color:"#8A8480",fontFamily:"'DM Sans',sans-serif"}}>{po.desc}</div></div>{d.paperOption===po.id&&<div style={{color:"#5B7B6A",fontWeight:700}}>✓</div>}</div>))}</div></div>);}

    case"address":{const COUNTRIES=[{id:"CH",label:"🇨🇭 Schweiz",plzLen:4,plzPh:"8001",streetPh:"Bahnhofstrasse 42",cityPh:"Zürich"},{id:"DE",label:"🇩🇪 Deutschland",plzLen:5,plzPh:"10115",streetPh:"Friedrichstraße 42",cityPh:"Berlin"},{id:"AT",label:"🇦🇹 Österreich",plzLen:4,plzPh:"1010",streetPh:"Stephansplatz 1",cityPh:"Wien"},{id:"OTHER",label:"🌍 Anderes Land anfragen"}];const cc=COUNTRIES.find(c=>c.id===d.country)||COUNTRIES[0];const plzValid=d.zip&&cc.plzLen?d.zip.replace(/\D/g,"").length===cc.plzLen:true;const plzError=d.zip.length>0&&!plzValid;
      const GEOAPIFY_KEY=process.env.NEXT_PUBLIC_GEOAPIFY_KEY||"";
      const searchAddr=(val)=>{u("street",val);trackInteraction();if(!GEOAPIFY_KEY||val.length<5||d.country==="OTHER")return setAddrSugg([]);if(!checkAddressSearchLimit().allowed)return;clearTimeout(addrTimer.current);addrTimer.current=setTimeout(async()=>{setAddrLoading(true);try{const countryFilter=d.country?`&filter=countrycode:${d.country.toLowerCase()}`:"";const res=await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(val)}&lang=de&limit=5&format=json${countryFilter}&apiKey=${GEOAPIFY_KEY}`);const data=await res.json();if(data.results)setAddrSugg(data.results.map(r=>({street:(r.street||"")+(r.housenumber?" "+r.housenumber:""),zip:r.postcode||"",city:r.city||r.town||r.village||"",country:r.country_code?.toUpperCase()||d.country,formatted:r.formatted||""})));}catch(e){console.error("Geoapify error:",e);}finally{setAddrLoading(false);}},500);};
      const selectAddr=(s)=>{u("street",s.street);u("zip",s.zip);u("city",s.city);if(s.country&&["CH","DE","AT"].includes(s.country))u("country",s.country);setAddrSugg([]);};
      return(<div><SH t={isSelf?"Wohin sollen die Briefe kommen?":"Wohin sollen die Briefe geschickt werden?"} s={isSelf?"Deine Adresse bleibt vertraulich.":"Die Adresse des Empfängers."}/>
      <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
        <div><label style={L}>Land</label><div style={{display:"flex",flexWrap:"wrap"}}>{COUNTRIES.map(c=><span key={c.id} style={ch(d.country===c.id)} onClick={()=>{u("country",c.id);if(c.id!==d.country){u("zip","");u("city","");u("street","");setAddrSugg([]);}}}>{c.label}</span>)}</div></div>
        {d.country==="OTHER"&&<div style={{padding:"16px",background:"#EEF4F0",borderRadius:"12px",border:"1px solid #D6E8DD",marginTop:"8px"}}><div style={{fontSize:"14px",fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C",lineHeight:1.6}}>📬 Wir liefern aktuell nach CH, DE und AT. Für andere Länder schreib uns an <strong>hello@letterlift.ch</strong> – wir prüfen die Möglichkeiten!</div></div>}
        {d.country!=="OTHER"&&<><div style={{position:"relative"}}><label style={L}>Strasse & Hausnummer</label><input style={I} value={d.street} onChange={e=>searchAddr(e.target.value)} placeholder={cc.streetPh||"Strasse 1"} onFocus={fc} onBlur={e=>{bl(e);setTimeout(()=>setAddrSugg([]),200);}} autoComplete="off"/>
          {addrSugg.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:50,background:"#fff",border:"1px solid #D6CFC8",borderRadius:"0 0 12px 12px",boxShadow:"0 8px 24px rgba(0,0,0,0.08)",maxHeight:"200px",overflowY:"auto"}}>{addrSugg.map((s,i)=><div key={i} onMouseDown={()=>selectAddr(s)} style={{padding:"10px 14px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#2C2C2C",cursor:"pointer",borderBottom:i<addrSugg.length-1?"1px solid #F0EDE8":"none",transition:"background 0.15s"}} onMouseEnter={e=>e.currentTarget.style.background="#F6F3EF"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}><div style={{fontWeight:500}}>{s.street}</div><div style={{fontSize:"12px",color:"#8A8480",marginTop:"2px"}}>{s.zip} {s.city}</div></div>)}</div>}
          {addrLoading&&<div style={{position:"absolute",right:"12px",top:"38px",fontSize:"12px",color:"#8A8480",fontFamily:"'DM Sans',sans-serif"}}>...</div>}
        </div>
        <div style={{display:"flex",gap:"12px"}}><div style={{flex:"0 0 120px"}}><label style={L}>PLZ</label><input style={{...I,borderColor:plzError?"#E53E3E":"#D6CFC8"}} value={d.zip} onChange={e=>{const v=e.target.value.replace(/\D/g,"").slice(0,cc.plzLen||5);u("zip",v);}} placeholder={cc.plzPh||"PLZ"} maxLength={cc.plzLen||5} onFocus={fc} onBlur={bl}/>{plzError&&<div style={{fontSize:"11px",color:"#E53E3E",fontFamily:"'DM Sans',sans-serif",marginTop:"4px"}}>{cc.plzLen} Stellen erforderlich</div>}</div><div style={{flex:1}}><label style={L}>Ort</label><input style={I} value={d.city} onChange={e=>u("city",e.target.value)} placeholder={cc.cityPh||"Ort"} onFocus={fc} onBlur={bl}/></div></div></>}
      </div>
      <div style={{marginTop:"18px",padding:"14px 16px",background:"#F0F5EE",borderRadius:"12px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C",lineHeight:1.6}}>🔒 Die Adresse wird ausschliesslich für den Briefversand verwendet und nicht an Dritte weitergegeben.</div>
    </div>);}

    case"preview":{const q=assessQuality(d);const gen=genPreview(d,isSelf);if(!prevTxt&&!prevLoading)fetchAIPreview();const safetyWarnings=(()=>{const r=preCheckoutSafetyCheck(d);return[...r.criticalFlags,...r.warnings];})();return(<div><SH t="Dein erster Brief – Vorschau" s={prevLoading?"Brief wird von unserer KI geschrieben...":"So klingt Brief Nr. 1 – geschrieben von unserer KI. Du kannst ihn bearbeiten."}/>
      <div style={{display:"flex",alignItems:"center",gap:"14px",padding:"16px 18px",background:"#fff",borderRadius:"14px",border:"1.5px solid "+q.color+"33",marginBottom:"16px"}}><div style={{fontSize:"32px"}}>{q.emoji}</div><div style={{flex:1}}><div style={{fontSize:"14px",fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:q.color}}>{q.level} – {q.score}%</div><div style={{fontSize:"12px",color:"#6B6360",fontFamily:"'DM Sans',sans-serif",marginTop:"2px"}}>{q.message}</div></div></div>
      {safetyWarnings.length>0&&<div style={{padding:"14px 16px",background:safetyWarnings.some(w=>w.severity==="critical")?"#FFF5F5":"#FFF8F0",borderRadius:"12px",border:"1px solid "+(safetyWarnings.some(w=>w.severity==="critical")?"#FED7D7":"#F0E4D4"),marginBottom:"12px"}}>{safetyWarnings.map((w,i)=><div key={i} style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:w.severity==="critical"?"#C53030":w.severity==="warning"?"#8B6914":"#3D5A4C",lineHeight:1.6,marginBottom:i<safetyWarnings.length-1?"8px":"0"}}>{w.severity==="critical"?"🚫":"💡"} {w.message}{w.action&&<span onClick={()=>{const idx=STEPS.indexOf(w.action==="noGo"?"personality":w.action);if(idx>=0)goToStep(idx);}} style={{marginLeft:"6px",textDecoration:"underline",cursor:"pointer",fontWeight:600}}>Jetzt ergänzen</span>}</div>)}</div>}
      {q.issues.length>0&&<div style={{padding:"12px 16px",background:"#FFF5F5",borderRadius:"10px",border:"1px solid #FED7D7",marginBottom:"12px"}}>{q.issues.map((x,i)=><div key={i} style={{fontSize:"12px",color:"#C53030",fontFamily:"'DM Sans',sans-serif"}}>⚠️ {x}</div>)}</div>}
      {q.suggestions.length>0&&<div style={{padding:"12px 16px",background:"#FFF8F0",borderRadius:"10px",border:"1px solid #F0E4D4",marginBottom:"12px"}}><div style={{fontSize:"12px",color:"#8B6914",fontFamily:"'DM Sans',sans-serif"}}>💡 Noch persönlicher: {q.suggestions.map((sg,si)=>{const stepMap={"Erinnerungen":"memories","Erinnerungen vertiefen":"memories","Erinnerungen ausführlicher":"memories","Hobbies":"personality","Stärken":"personality","Bezugspersonen":"personality","Ziel":"context","Humor-Typ":"style"};const target=Object.entries(stepMap).find(([k])=>sg.includes(k));const idx=target?STEPS.indexOf(target[1]):-1;return(<span key={si}>{si>0?", ":""}{idx>=0?<span onClick={()=>goToStep(idx)} style={{textDecoration:"underline",cursor:"pointer",fontWeight:600}}>{sg}</span>:sg}</span>);})}</div></div>}
      <div style={{background:d.paperOption==="standard"?"#fff":"#FFFDF7",borderRadius:"8px",boxShadow:"0 8px 32px rgba(0,0,0,0.06)",border:"1px solid #EBE7E2",minHeight:"200px"}}>
        {editing?<textarea value={prevTxt} onChange={e=>setPrevTxt(e.target.value)} style={{width:"100%",minHeight:"300px",border:"none",outline:"none",background:"transparent",fontFamily:d.paperOption==="handwritten"?"'Caveat',cursive":"'Lora',Georgia,serif",fontSize:d.paperOption==="handwritten"?"17px":"15px",lineHeight:1.85,color:"#3A3A3A",resize:"vertical",padding:"36px 32px",boxSizing:"border-box"}}/>
        :<div style={{padding:"36px 32px",fontFamily:d.paperOption==="handwritten"?"'Caveat',cursive":"'Lora',Georgia,serif",fontSize:d.paperOption==="handwritten"?"17px":"15px",lineHeight:1.85,color:"#3A3A3A",whiteSpace:"pre-wrap"}}>{prevLoading?<div style={{textAlign:"center",padding:"40px 0"}}><div style={{fontSize:"32px",marginBottom:"12px",animation:"pulse 1.5s infinite"}}>✉️</div><div style={{fontSize:"14px",fontFamily:"'DM Sans',sans-serif",color:"#8A8480"}}>Dein Brief wird geschrieben...</div><div style={{fontSize:"12px",fontFamily:"'DM Sans',sans-serif",color:"#B0A9A3",marginTop:"6px"}}>Unsere KI erstellt deinen persönlichen ersten Brief</div><style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style></div>:prevTxt||gen}</div>}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:"8px",marginTop:"10px"}}>
        <button onClick={()=>setEditing(!editing)} style={{padding:"8px 18px",borderRadius:"8px",border:"1.5px solid #5B7B6A",background:editing?"#5B7B6A":"transparent",color:editing?"#fff":"#5B7B6A",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer"}}>{editing?"✓ Übernehmen":"✏️ Brief bearbeiten"}</button>
        {editing&&<button onClick={()=>{setPrevTxt(gen);setEditing(false);}} style={{padding:"8px 18px",borderRadius:"8px",border:"1.5px solid #D6CFC8",background:"transparent",color:"#7A7470",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>↺ Zurücksetzen</button>}
      </div>
      <div style={{marginTop:"16px",padding:"14px 16px",background:"#EEF4F0",borderRadius:"12px",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C",lineHeight:1.6}}><strong>✅ Volle Kontrolle:</strong> Jeden Brief vor Versand per E-Mail einsehen, bearbeiten oder stoppen.</div></div>);}

    case"summary":{const pk=PKG.find(q=>q.id===d.package);const oc=OCC.find(o=>o.id===d.occasion);const st=Array.isArray(d.style)?d.style.map(s=>STY.find(x=>x.id===s)?.label).join(", "):"";const fr=FREQ.find(f=>f.id===d.frequency);const pa=PAP.find(q=>q.id===d.paperOption);const pe=isSelf?PERS.find(q=>q.id===d.persona):null;
      const rows=[["Typ",isSelf?"Für mich selbst":"Geschenk"],["Empfänger",d.recipientName+(d.nickname?" ("+d.nickname+")":"")],
        ...(!isSelf&&d.relationship?[["Beziehung",d.relationship]]:[]),
        ...(isSelf&&pe?[["Briefschreiber",pe.label+(d.personaName?" – "+d.personaName:"")]]:[]),
        ...(!isSelf?[["Absender",d.senderName||"–"]]:[]),
        ["Anlass",oc?.label||"–"],["Stil",st||"–"],["Paket",pk?(pk.id==="trial"?"Trial · 1 Brief":pk.name+" · "+pk.letters+" Briefe"):"–"],...(isTrial?[]:[["Frequenz",fr?.label||"–"]]),["Papier",pa?.label||"Standard"],["Adresse",d.street+", "+d.zip+" "+d.city]];
      return(<div><div style={{textAlign:"center",marginBottom:"22px"}}><div style={{fontSize:"40px",marginBottom:"6px"}}>✉️</div><h2 style={{fontSize:"24px",fontWeight:400,margin:"0 0 6px",fontFamily:"'Lora',Georgia,serif"}}>Fast geschafft!</h2></div>
        <div style={{display:"flex",flexDirection:"column",gap:"1px"}}>{rows.map(([l,v],i)=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"11px 14px",background:i%2===0?"#F6F3EF":"transparent",borderRadius:"8px"}}><span style={{fontSize:"11.5px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:"#8A7F76",textTransform:"uppercase",letterSpacing:"0.06em"}}>{l}</span><span style={{fontSize:"14px",fontFamily:"'DM Sans',sans-serif",color:"#2C2C2C",textAlign:"right",maxWidth:"60%"}}>{v}</span></div>)}</div>
        <div style={{marginTop:"20px",padding:"18px 20px",background:"#F6F3EF",borderRadius:"14px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}><span style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#6B6360"}}>{pk?.name}</span><span style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>{cs}{pk?.price.toFixed(2)}</span></div>
          {pa?.price>0&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}><span style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#6B6360"}}>{pa.label}</span><span style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>{cs}{pa.price.toFixed(2)}</span></div>}
          <div style={{borderTop:"1px solid #E0DAD4",paddingTop:"8px",marginTop:"4px",display:"flex",justifyContent:"space-between"}}><span style={{fontSize:"15px",fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>Total</span><span style={{fontSize:"20px",fontFamily:"'DM Sans',sans-serif",fontWeight:700,color:"#3D5A4C"}}>{cs}{tp().toFixed(2)}</span></div></div>
        <div style={{marginTop:"16px"}}><label style={{display:"block",fontSize:"11.5px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:"#8A7F76",letterSpacing:"0.08em",marginBottom:"7px",textTransform:"uppercase"}}>E-Mail (für Bestätigung & Brieffreigabe)</label><input style={{width:"100%",padding:"14px 18px",border:"1.5px solid #D6CFC8",borderRadius:"12px",fontSize:"15px",fontFamily:"'Lora',Georgia,serif",color:"#2C2C2C",background:"#FDFCFA",outline:"none",boxSizing:"border-box"}} type="email" value={d.email||""} onChange={e=>{u("email",e.target.value);trackInteraction();}} placeholder="deine@email.ch"/><div style={{fontSize:"12px",fontFamily:"'DM Sans',sans-serif",color:"#8A8480",marginTop:"6px",lineHeight:1.5}}>Hierhin senden wir dir jeden Brief zur Freigabe, bevor er verschickt wird.</div></div>
        {/* Honeypot field – invisible to users, bots fill it */}
        <input type="text" name="ll_website" autoComplete="off" tabIndex={-1} aria-hidden="true" style={{position:"absolute",left:"-9999px",opacity:0,height:0,width:0}} value={d._hp||""} onChange={e=>{u("_hp",e.target.value);botDetector.current?.setHoneypotTriggered();}}/>
        {rateLimitMsg&&<div style={{marginTop:"12px",padding:"12px 16px",background:"#FFF5F5",borderRadius:"10px",border:"1px solid #FED7D7",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#C53030"}}>{rateLimitMsg}</div>}
        <button onClick={async()=>{
          if(!d.email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)){setRateLimitMsg("Bitte gültige E-Mail-Adresse eingeben");return;}
          // Safety check – screen inputs for threats, insults, manipulation
          const safetyResult=preCheckoutSafetyCheck(d);
          if(!safetyResult.canProceed){setRateLimitMsg("⚠️ "+safetyResult.criticalFlags[0].message+" Bitte überprüfe deine Angaben im Feld «"+safetyResult.criticalFlags[0].field+"».");return;}
          // Bot detection
          const botResult=botDetector.current?.analyze();
          if(botResult?.isBot){console.warn("Bot detected:",botResult.reasons);setRateLimitMsg("Etwas ist schiefgelaufen. Bitte lade die Seite neu.");return;}
          // Rate limit check
          const limit=checkCheckoutLimit();
          if(!limit.allowed){setRateLimitMsg(limit.message);return;}
          setRateLimitMsg("");setLoading(true);
          try{const res=await fetch((process.env.NEXT_PUBLIC_SUPABASE_URL||"")+"/functions/v1/create-checkout",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"")},body:JSON.stringify({orderData:{...d,_hp:undefined,region,previewLetter:prevTxt||null}})});const data=await res.json();if(data.url)window.location.href=data.url;else{setRateLimitMsg("Fehler beim Erstellen der Bestellung. Bitte versuche es erneut.");setLoading(false);}}catch(err){setRateLimitMsg("Verbindungsfehler: "+err.message);setLoading(false);}
        }} disabled={loading} style={{width:"100%",marginTop:"20px",padding:"18px",background:loading?"#8A9E90":"linear-gradient(135deg,#3D5A4C,#5B7B6A)",color:"#fff",border:"none",borderRadius:"14px",fontSize:"16px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:loading?"not-allowed":"pointer",transition:"all 0.2s",opacity:loading?0.8:1}}>{loading?<span style={{display:"inline-flex",alignItems:"center",gap:"8px"}}><span style={{display:"inline-block",width:"16px",height:"16px",border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.6s linear infinite"}}/>Wird vorbereitet...</span>:"✉️ "+(isTrial?"Trial-Brief bestellen":isSelf?"Briefserie starten":"Verschenken")+" – "+cs+tp().toFixed(2)}</button>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{fontSize:"11px",color:"#B0A9A3",fontFamily:"'DM Sans',sans-serif",textAlign:"center",marginTop:"10px"}}>Stripe · Zufriedenheitsgarantie · Jederzeit pausierbar</p></div>);}
    default:return null;}
  };

  return(<div style={{minHeight:"100vh",background:"linear-gradient(165deg,#FBF8F5 0%,#F3EDE7 100%)",fontFamily:"'Lora',Georgia,serif",display:"flex",flexDirection:"column",alignItems:"center"}}>
    <div style={{width:"100%",maxWidth:"660px",padding:"20px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",boxSizing:"border-box"}}>
      <div onClick={()=>{setView("landing");setStep(0);setEditing(false);setPrevTxt("");}} style={{fontSize:"18px",fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C",cursor:"pointer"}}>✉️ LetterLift</div>
      <div style={{display:"flex",alignItems:"center",gap:"6px"}}>{STEPS.map((s,i)=>{if(shouldSkip(i))return null;return <div key={s} onClick={()=>goToStep(i)} style={{width:i===step?"auto":"7px",height:"7px",borderRadius:i===step?"10px":"50%",background:i<step?"#5B7B6A":i===step?"#3D5A4C":"#D6CFC8",cursor:i<step?"pointer":"default",padding:i===step?"2px 10px":"0",fontSize:"11px",fontFamily:"'DM Sans',sans-serif",color:"#fff",fontWeight:600,lineHeight:"7px",transition:"all 0.3s",display:"flex",alignItems:"center"}}>{i===step?STEP_LABELS[s]:""}</div>;})}</div></div>
    <div style={{width:"88%",maxWidth:"580px",height:"3px",background:"#E0DAD4",borderRadius:"100px",overflow:"hidden",marginBottom:"28px"}}><div style={{height:"100%",width:prog+"%",background:"linear-gradient(90deg,#5B7B6A,#7C9885)",borderRadius:"100px",transition:"width 0.5s cubic-bezier(0.16,1,0.3,1)"}}/></div>
    <div style={{background:"rgba(255,255,255,0.88)",backdropFilter:"blur(20px)",borderRadius:"22px",boxShadow:"0 8px 40px rgba(0,0,0,0.05)",padding:"38px 36px",maxWidth:"580px",width:"88%",opacity:vis&&!anim?1:0,transform:vis&&!anim?"translateY(0)":"translateY("+dir*14+"px)",transition:"all 0.4s cubic-bezier(0.16,1,0.3,1)"}}>{renderStep()}</div>
    {sid!=="summary"&&<div style={{display:"flex",justifyContent:"space-between",maxWidth:"580px",width:"88%",marginTop:"18px",marginBottom:"40px"}}>
      <button onClick={step>0?back:()=>setView("landing")} style={{background:"transparent",color:"#7A7470",border:"none",padding:"14px 20px",fontSize:"14px",fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>← {step>0?"Zurück":"Startseite"}</button>
      <button onClick={()=>{setEditing(false);trackInteraction();next();}} disabled={!canGo()} style={{background:"linear-gradient(135deg,#3D5A4C,#5B7B6A)",color:"#fff",border:"none",borderRadius:"12px",padding:"14px 32px",fontSize:"15px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:canGo()?"pointer":"default",opacity:canGo()?1:0.35}}>Weiter →</button></div>}
    {sid==="summary"&&<div style={{marginBottom:"40px"}}><button onClick={back} style={{background:"transparent",color:"#7A7470",border:"none",padding:"14px",fontSize:"14px",fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>← Bearbeiten</button></div>}
    <style>{``}</style>
  </div>);
}

function SH({t,s}){return(<div style={{marginBottom:"22px"}}><h2 style={{fontSize:"22px",fontWeight:400,margin:"0 0 6px",fontFamily:"'Lora',Georgia,serif",lineHeight:1.3}}>{t}</h2><p style={{fontSize:"13.5px",color:"#8A7F76",fontFamily:"'DM Sans',sans-serif",margin:0,lineHeight:1.6}}>{s}</p></div>);}

function Landing({go,cs}){
  const[hR,hV]=useInView(0.1);const[wR,wV]=useInView();const[tR,tV]=useInView();const[fR,fV]=useInView();const[oF,setOF]=useState(null);const[heroOcc,setHeroOcc]=useState(0);
  const sa=v=>({opacity:v?1:0,transform:v?"translateY(0)":"translateY(30px)",transition:"all 0.8s cubic-bezier(0.16,1,0.3,1)"});
  return(<div style={{minHeight:"100vh",background:"#FBF8F5",fontFamily:"'Lora',Georgia,serif",color:"#2C2C2C",overflowX:"hidden"}}>
    <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 6%",maxWidth:"1200px",margin:"0 auto"}}><div style={{display:"flex",alignItems:"center",gap:"12px"}}><span style={{fontSize:"20px",fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C"}}>✉️ LetterLift</span><span style={{fontSize:"11px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:"#5B7B6A",background:"#EEF4F0",padding:"4px 10px",borderRadius:"100px",letterSpacing:"0.05em"}}>BETA</span></div><button onClick={()=>go("gift")} style={{background:"#3D5A4C",color:"#fff",border:"none",borderRadius:"10px",padding:"10px 22px",fontSize:"14px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer"}}>Jetzt starten</button></nav>
    <section ref={hR} style={{...sa(hV),maxWidth:"1200px",margin:"0 auto",padding:"80px 6% 60px",display:"flex",alignItems:"center",gap:"60px",flexWrap:"wrap"}}>
      <div style={{flex:"1 1 460px",minWidth:"300px"}}><h1 style={{fontSize:"clamp(36px,5vw,56px)",fontWeight:400,lineHeight:1.15,margin:"0 0 20px"}}>Briefe, die<br/>wirklich <span style={{fontStyle:"italic",color:"#5B7B6A"}}>ankommen</span>.</h1><p style={{fontSize:"18px",lineHeight:1.7,color:"#6B6360",margin:"0 0 36px",maxWidth:"480px",fontFamily:"'DM Sans',sans-serif"}}>Manchmal fehlen uns die Worte – genau dann, wenn sie am meisten zählen. LetterLift schreibt sie für dich.</p>
        <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}><button onClick={()=>go("gift")} style={{background:"linear-gradient(135deg,#3D5A4C,#5B7B6A)",color:"#fff",border:"none",borderRadius:"14px",padding:"18px 34px",fontSize:"16px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 20px rgba(61,90,76,0.25)"}}>🎁 Als Geschenk</button><button onClick={()=>go("self")} style={{background:"transparent",color:"#3D5A4C",border:"2px solid #5B7B6A",borderRadius:"14px",padding:"16px 30px",fontSize:"16px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer"}}>Für mich selbst</button></div>
        <div style={{marginTop:"24px",display:"flex",gap:"8px",flexWrap:"wrap"}}>{[{e:"💔",l:"Schwere Zeiten"},{e:"🎯",l:"Motivation"},{e:"💪",l:"Selbstvertrauen"},{e:"🙏",l:"Wertschätzung"},{e:"🎉",l:"Meilensteine"},{e:"🌱",l:"Neuanfang"}].map((t,i)=><span key={i} onClick={()=>setHeroOcc(i)} style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:heroOcc===i?"#fff":"#5B7B6A",background:heroOcc===i?"#5B7B6A":"#EEF4F0",padding:"6px 14px",borderRadius:"100px",cursor:"pointer",transition:"all 0.2s"}}>{t.e} {t.l}</span>)}</div></div>
      <div style={{flex:"1 1 340px",minWidth:"280px",display:"flex",justifyContent:"center"}}><div style={{position:"relative",width:"100%",maxWidth:"340px",height:"420px"}}>{(()=>{const previews=[{g:"Liebe Lauri,",t:"ich denke an dich. Nicht weil ich muss – sondern weil du mir wichtig bist. Erinnerst du dich an Portugal? Als wir uns komplett verfahren haben und du einfach aus dem Auto gestiegen bist? Keine gemeinsame Sprache, aber du hast mit Händen und Füssen geredet, bis die ganze Familie uns zum Essen eingeladen hat. Das bist du – du findest immer einen Weg. Auch jetzt. Zürich, neue Arbeit, Mila und Noah – du wuppst das. Nicht weil es leicht ist. Sondern weil du du bist.",s:"Deine Natalie"},{g:"Hey Sandro,",t:"hier spricht dein zukünftiges Ich. Der, der den Marathon geschafft hat. Ich weiss, bei Kilometer 25 wird dein Kopf sagen: Hör auf. Erinnerst du dich an deinen ersten 10er vor zwei Jahren? Seitenstechen ab Kilometer 6. Du wolltest aufhören. Dann lief eine Fremde neben dir und sagte: Wir laufen zusammen ins Ziel. Du hast im Ziel geweint. Dein Körper kann es – das sagt Marco, das weisst du. Jetzt muss dein Kopf folgen.",s:"Sandro nach dem Marathon"},{g:"Liebe Simi,",t:"ich sehe, wie du zweifelst. Ob der Schritt richtig war, ob du gut genug bist. Aber weisst du was? Letztes Jahr hat dir ein ehemaliger Schüler geschrieben. Er ist jetzt 19 und hat gesagt: Ohne Sie hätte ich das Gymnasium nie geschafft. Du hast an mich geglaubt, als niemand sonst es tat. Du hast den ganzen Abend geweint. Das bist du, Simi. Du veränderst Leben. Und jetzt ist es Zeit, dein eigenes zu verändern.",s:"Dein Thomas"},{g:"Lieber Papi,",t:"ich sage es zu selten. Aber wenn ich an Sonntagmorgen denke, rieche ich frischen Zopf. Seit ich denken kann, bist du in der Küche gestanden. Und das Puppenhaus – mit den funktionierenden Fensterläden und der kleinen Veranda. Drei Monate hast du daran gearbeitet, abends in der Werkstatt. Ich habe es bis heute. Du machst nie grosses Aufheben. Aber ich möchte, dass du weisst: Wir haben es gesehen. Alles.",s:"Deine Sarah"},{g:"Liebste Lena,",t:"40! Erinnerst du dich an die Liste, die wir mit 20 geschrieben haben? Einmal ans Meer ziehen, ein Buch lesen pro Woche, irgendwann den Mut haben, Nein zu sagen. Du hast mehr geschafft als draufstand – und das meiste davon stand gar nicht auf der Liste. Die Dinge, die wirklich zählen, plant man nicht. Man lebt sie einfach.",s:"Deine Anna"},{g:"Liebe Ayla,",t:"neue Stadt, neues Leben. Ich kenne dieses Gefühl – halb Angst, halb Vorfreude. Erinnerst du dich an unseren letzten Abend auf dem Lindenhof? Wir haben auf Zürich geschaut und ich habe gesagt: In einem Jahr sitzen wir auf einem Dach in Lissabon und lachen darüber. Das machen wir. Und bis dahin: Wenn das Geld knapp wird und du dich einsam fühlst – erinnere dich daran, warum du gegangen bist. Das Licht am Morgen. Das Gefühl, frei zu sein.",s:"Deine Mira"}];const p=previews[heroOcc];return(<div style={{position:"absolute",top:"10px",left:"10px",right:"30px",background:"#fff",borderRadius:"4px",padding:"clamp(20px,4vw,32px) clamp(18px,3vw,28px)",boxShadow:"0 12px 40px rgba(0,0,0,0.08)",transform:"rotate(-1.5deg)",fontSize:"14px",lineHeight:1.8,color:"#3A3A3A",transition:"opacity 0.3s"}}><div style={{marginBottom:"12px",color:"#5B7B6A",fontStyle:"italic",fontSize:"15px"}}>{p.g}</div><div>{p.t}</div><div style={{marginTop:"16px",color:"#5B7B6A",fontSize:"14px"}}>{p.s}</div></div>);})()}
        <div style={{position:"absolute",bottom:"10px",right:"0px",width:"clamp(200px,65%,240px)",background:"#F6F3EF",borderRadius:"8px",padding:"16px 20px",boxShadow:"0 8px 24px rgba(0,0,0,0.06)",transform:"rotate(1.5deg)",display:"flex",alignItems:"center",gap:"12px"}}><div style={{fontSize:"20px"}}>✏️</div><div><div style={{fontWeight:600,color:"#3D5A4C",fontSize:"13px",fontFamily:"'DM Sans',sans-serif"}}>Brief bearbeiten</div><div style={{fontSize:"11px",color:"#7A7470",fontFamily:"'DM Sans',sans-serif",marginTop:"2px"}}>Vor dem Versand anpassen</div></div></div></div></div></section>
    <section style={{background:"#fff",padding:"80px 6%"}}><div style={{maxWidth:"640px",margin:"0 auto"}}><h2 style={{fontSize:"28px",fontWeight:400,margin:"0 0 12px",lineHeight:1.3,textAlign:"center"}}>Stell dir vor, du kommst nach Hause.</h2><p style={{fontSize:"15px",fontFamily:"'DM Sans',sans-serif",color:"#8A8480",textAlign:"center",margin:"0 0 48px"}}>Zwischen Rechnungen und Werbung liegt ein Umschlag. Dein Name darauf. Handgeschrieben.</p>
      <div style={{display:"flex",flexDirection:"column",gap:"0",position:"relative",paddingLeft:"36px"}}>
        <div style={{position:"absolute",left:"11px",top:"24px",bottom:"24px",width:"2px",background:"linear-gradient(to bottom, #D6CFC8, #5B7B6A, #3D5A4C)",zIndex:0}}/>
        {[
          {day:"Du öffnest den Umschlag",icon:"📬",desc:"Dein Herz klopft ein bisschen. Wer schreibt heute noch Briefe? Du liest – und merkst: Jemand hat wirklich über dich nachgedacht. Nicht ein Like, nicht ein Emoji. Echte Worte, die sitzen. Du liest ihn zweimal."},
          {day:"Ein paar Tage später – noch einer",icon:"💌",desc:"Diesmal geht es um etwas, das nur ihr zwei wisst. Eine Erinnerung, ein Insider, ein Moment, den du fast vergessen hattest. Du musst lachen – und dann kurz schlucken."},
          {day:"Du ertappst dich",icon:"✨",desc:"Beim Heimkommen checkst du zuerst den Briefkasten. Der Brief heute trifft dich anders. Jemand sieht dich. Nicht oberflächlich. Wirklich. So wie du bist – mit allem, was dazugehört."},
          {day:"Die Briefe bleiben",icon:"🤍",desc:"Sie liegen auf deinem Nachttisch. Du liest sie nochmal – an Tagen, wo du es brauchst. Nichts, das morgen schon vergessen ist. Kein Chat, der untergeht. Diese Worte sind für dich. Und sie bleiben."}
        ].map((s,i)=><div key={i} style={{position:"relative",zIndex:1,paddingBottom:i<3?"36px":"0",paddingLeft:"28px"}}>
          <div style={{position:"absolute",left:"-36px",top:"2px",width:"24px",height:"24px",borderRadius:"50%",background:i===3?"#3D5A4C":"#fff",border:i===3?"none":"2px solid #5B7B6A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",zIndex:2}}>{i===3&&<span style={{color:"#fff",fontSize:"12px"}}>♡</span>}</div>
          <div style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:"#5B7B6A",marginBottom:"6px"}}>{s.day}</div>
          <div style={{fontSize:"15px",fontFamily:"'DM Sans',sans-serif",color:i===3?"#2D2926":"#4A4540",lineHeight:1.8,fontWeight:i===3?500:400}}>{s.desc}</div>
        </div>)}</div>
      <div style={{textAlign:"center"}}><button onClick={()=>go("gift")} style={{marginTop:"48px",background:"linear-gradient(135deg,#3D5A4C,#5B7B6A)",color:"#fff",border:"none",borderRadius:"14px",padding:"16px 32px",fontSize:"15px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 20px rgba(61,90,76,0.2)"}}>Jemandem diese Erfahrung schenken →</button></div></div></section>
    <section ref={wR} style={{...sa(wV),maxWidth:"1000px",margin:"0 auto",padding:"80px 6%"}}><h2 style={{fontSize:"28px",fontWeight:400,textAlign:"center",margin:"0 0 40px"}}>So funktioniert's</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:"20px"}}>{[{i:"💬",t:"Du erzählst",d:"Erinnerungen, Insider-Witze, gemeinsame Momente. 5-10 Minuten – alles was diese Person besonders macht."},{i:"✍️",t:"Wir schreiben, du kontrollierst",d:"Unsere KI macht aus deinen Worten eine Briefserie mit Dramaturgie. Du liest jeden Brief vorab und gibst ihn frei."},{i:"✉️",t:"Echte Post, die bleibt",d:"Gedruckt auf echtem Papier, verschickt per Post. Kein Screen, kein Algorithmus. Ein Brief, den man in der Hand hält."}].map((s,i)=><div key={i} style={{background:"#fff",borderRadius:"16px",padding:"24px 18px",boxShadow:"0 2px 12px rgba(0,0,0,0.04)",textAlign:"center"}}><div style={{fontSize:"28px",marginBottom:"10px"}}>{s.i}</div><div style={{fontSize:"15px",fontWeight:600,fontFamily:"'DM Sans',sans-serif",marginBottom:"6px"}}>{s.t}</div><div style={{fontSize:"12.5px",fontFamily:"'DM Sans',sans-serif",color:"#7A7470",lineHeight:1.6}}>{s.d}</div></div>)}</div></section>
    <section style={{maxWidth:"1000px",margin:"0 auto",padding:"80px 6% 40px"}}><h2 style={{fontSize:"28px",fontWeight:400,textAlign:"center",margin:"0 0 12px"}}>Wähle dein Paket</h2><p style={{fontSize:"15px",fontFamily:"'DM Sans',sans-serif",color:"#8A8480",textAlign:"center",margin:"0 0 40px"}}>Jedes Paket ist eine durchkomponierte Briefserie – kein Brief wie der andere.</p>
      <div style={{background:"#fff",borderRadius:"16px",border:"1.5px dashed #D6CFC8",padding:"24px 28px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"16px",marginBottom:"24px"}}><div><div style={{fontSize:"17px",fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:"#2C2C2C"}}>🔍 Erstmal testen?</div><div style={{fontSize:"14px",fontFamily:"'DM Sans',sans-serif",color:"#6B6360",marginTop:"4px"}}>Ein einzelner Brief – damit du siehst, wie persönlich LetterLift klingt.</div></div><button onClick={()=>go("gift")} style={{background:"transparent",color:"#3D5A4C",border:"2px solid #5B7B6A",borderRadius:"12px",padding:"12px 28px",fontSize:"15px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>Trial-Brief · {cs}9.90</button></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"20px"}}>{[
        {name:"Impuls",briefe:5,preis:"34.90",pro:"6.98",desc:"Kurz und kraftvoll. Perfekt für einen klaren Anlass.",pop:false},
        {name:"Classic",briefe:10,preis:"59.90",pro:"5.99",desc:"Der ideale Bogen. 10 Briefe mit Dramaturgie – unser Bestseller.",pop:true},
        {name:"Journey",briefe:15,preis:"79.90",pro:"5.33",desc:"Für tiefe Begleitung. 15 Briefe über Wochen oder Monate.",pop:false}
      ].map((p,i)=><div key={i} style={{background:"#fff",borderRadius:"18px",padding:"32px 24px",border:p.pop?"2px solid #5B7B6A":"1.5px solid #E0DAD4",boxShadow:p.pop?"0 4px 24px rgba(91,123,106,0.12)":"0 2px 12px rgba(0,0,0,0.04)",position:"relative",textAlign:"center"}}>
        {p.pop&&<div style={{position:"absolute",top:"-12px",left:"50%",transform:"translateX(-50%)",background:"#5B7B6A",color:"#fff",fontSize:"11px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,padding:"4px 16px",borderRadius:"100px",letterSpacing:"0.05em"}}>BELIEBTESTE WAHL</div>}
        <div style={{fontSize:"22px",fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:"#2C2C2C",marginBottom:"4px"}}>{p.name}</div>
        <div style={{fontSize:"14px",fontFamily:"'DM Sans',sans-serif",color:"#8A8480",marginBottom:"16px"}}>{p.briefe} Briefe</div>
        <div style={{fontSize:"36px",fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:"#3D5A4C",marginBottom:"4px"}}>{cs}{p.preis}</div>
        <div style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#8A8480",marginBottom:"16px"}}>{cs}{p.pro} pro Brief</div>
        <p style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#6B6360",lineHeight:1.6,margin:"0 0 20px",minHeight:"40px"}}>{p.desc}</p>
        <button onClick={()=>go("gift")} style={{width:"100%",padding:"14px",background:p.pop?"linear-gradient(135deg,#3D5A4C,#5B7B6A)":"transparent",color:p.pop?"#fff":"#3D5A4C",border:p.pop?"none":"2px solid #5B7B6A",borderRadius:"12px",fontSize:"15px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer"}}>Jetzt starten</button>
      </div>)}</div>
      <div style={{marginTop:"32px"}}><p style={{fontSize:"14px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:"#2C2C2C",textAlign:"center",margin:"0 0 16px"}}>Mach es besonders – Premium-Upgrades</p>
        <div style={{display:"flex",gap:"16px",justifyContent:"center",flexWrap:"wrap"}}>{[
          {icon:"📜",name:"Premium-Papier",desc:"Schweres, hochwertiges Premiumpapier",price:"+"+cs+"9.90"},
          {icon:"✒️",name:"Handschrift-Edition",desc:"Premium-Papier + eleganter Handschrift-Font",price:"+"+cs+"19.90"},
          {icon:"📸",name:"Foto-Edition",desc:"Deine Fotos passend in die Briefe integriert",price:"+"+cs+"19.90",soon:true}
        ].map((u,i)=><div key={i} style={{background:"#fff",border:"1.5px solid #E0DAD4",borderRadius:"14px",padding:"18px 22px",display:"flex",alignItems:"center",gap:"14px",minWidth:"220px",flex:"1",maxWidth:"360px",position:"relative",opacity:u.soon?0.7:1}}><div style={{fontSize:"28px"}}>{u.icon}</div><div style={{flex:1}}>{u.soon&&<div style={{fontSize:"10px",fontWeight:600,fontFamily:"'DM Sans',sans-serif",color:"#fff",background:"#B0A9A3",borderRadius:"6px",padding:"2px 8px",display:"inline-block",marginBottom:"4px"}}>COMING SOON</div>}<div style={{fontSize:"14px",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{u.name}</div><div style={{fontSize:"12px",fontFamily:"'DM Sans',sans-serif",color:"#8A8480",marginTop:"2px"}}>{u.desc}</div></div><div style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:u.soon?"#B0A9A3":"#3D5A4C",whiteSpace:"nowrap"}}>{u.price}</div></div>)}</div></div>
      <p style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#B0A9A3",textAlign:"center",marginTop:"20px"}}>Einmalzahlung · Kein Abo · Upgrades im Bestellprozess wählbar</p>
    </section>
    <section ref={tR} style={{...sa(tV),maxWidth:"800px",margin:"0 auto",padding:"60px 6%"}}><h2 style={{fontSize:"28px",fontWeight:400,textAlign:"center",margin:"0 0 36px"}}>Unser Versprechen</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"16px"}}>{[
        {icon:"🔒",title:"Volle Kontrolle",desc:"Du siehst jeden Brief bevor er verschickt wird. Nichts geht raus ohne dein OK. Jederzeit anpassen oder stoppen."},
        {icon:"🇨🇭",title:"Schweizer Service",desc:"Entwickelt und betrieben in der Schweiz. Deine Daten bleiben geschützt."},
        {icon:"💳",title:"Kein Abo, kein Risiko",desc:"Einmalzahlung. Keine versteckten Kosten, keine automatische Verlängerung."},
        {icon:"✍️",title:"Deine Worte, unsere Feder",desc:"Du erzählst, was diese Person besonders macht. Wir verwandeln es in Briefe, die klingen, als hättest du sie selbst geschrieben."}
      ].map((p,i)=><div key={i} style={{background:"#fff",borderRadius:"14px",padding:"24px 20px",boxShadow:"0 2px 12px rgba(0,0,0,0.04)",textAlign:"center"}}><div style={{fontSize:"28px",marginBottom:"10px"}}>{p.icon}</div><div style={{fontSize:"15px",fontWeight:600,fontFamily:"'DM Sans',sans-serif",marginBottom:"6px"}}>{p.title}</div><div style={{fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#6B6360",lineHeight:1.7}}>{p.desc}</div></div>)}</div></section>
    <section ref={fR} style={{...sa(fV),maxWidth:"700px",margin:"0 auto",padding:"60px 6%"}}><h2 style={{fontSize:"28px",fontWeight:400,textAlign:"center",margin:"0 0 32px"}}>Häufige Fragen</h2>
      {[["Kann ich die Briefe vor dem Versand lesen?","Ja – immer. Du erhältst jeden Brief per E-Mail zur Freigabe. Du kannst ihn lesen, bearbeiten oder stoppen. Ohne deine Freigabe wird nichts versendet."],["Werden die Briefe wirklich auf Papier verschickt?","Ja. Echte Briefe, auf hochwertigem Papier gedruckt und per Post zugestellt – in der Schweiz, Deutschland und Österreich."],["Merkt der Empfänger, dass KI beteiligt ist?","Nein. Die Briefe basieren auf deinen persönlichen Angaben und klingen authentisch. Der Empfänger erhält einen handschriftlich wirkenden Brief ohne Hinweis auf KI."],["Kann ich Briefe an mich selbst bestellen?","Ja! Wähle 'Für mich selbst' und bestimme, wer dir schreibt – z.B. ein weiser Mentor, ein verstorbener Mensch oder dein zukünftiges Ich."],["Wie viel kostet es?","Ab CHF 9.90 für einen einzelnen Probebrief. Pakete mit 5 oder 10 Briefen starten ab CHF 34.90. In Deutschland und Österreich zahlst du in Euro."],["Was passiert mit meinen Daten?","Deine Angaben werden nur für die Briefgenerierung und den Versand verwendet. Keine Weitergabe an Dritte. Details findest du in unserer Datenschutzerklärung."],["Was für Anlässe eignen sich?","Schwere Zeiten, Motivation, Wertschätzung, Meilensteine wie Geburtstage, Selbstvertrauen stärken oder persönliches Wachstum – für jeden Moment, in dem Worte zählen."]].map(([q,a],i)=><div key={i} style={{borderBottom:"1px solid #E0DAD4"}}><div onClick={()=>setOF(oF===i?null:i)} style={{padding:"16px 0",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}><span style={{fontSize:"15px",fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>{q}</span><span style={{fontSize:"20px",color:"#B0A9A3",transition:"transform 0.2s",transform:oF===i?"rotate(45deg)":"none"}}>+</span></div><div style={{maxHeight:oF===i?"200px":"0",overflow:"hidden",transition:"max-height 0.3s ease"}}><p style={{fontSize:"14px",fontFamily:"'DM Sans',sans-serif",color:"#6B6360",lineHeight:1.7,margin:"0 0 16px"}}>{a}</p></div></div>)}</section>
    <section style={{background:"linear-gradient(135deg,#3D5A4C,#2C4038)",padding:"80px 6%",textAlign:"center"}}><h2 style={{fontSize:"32px",fontWeight:400,color:"#fff",margin:"0 0 12px"}}>Wer fällt dir gerade ein?</h2><p style={{fontSize:"16px",fontFamily:"'DM Sans',sans-serif",color:"rgba(255,255,255,0.7)",margin:"0 0 32px"}}>Diese eine Person, die gerade einen Brief verdient hätte. Du weisst, wer.</p>
      <div style={{display:"flex",gap:"14px",justifyContent:"center",flexWrap:"wrap"}}><button onClick={()=>go("gift")} style={{background:"#fff",color:"#3D5A4C",border:"none",borderRadius:"14px",padding:"18px 36px",fontSize:"16px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer"}}>🎁 Verschenken</button><button onClick={()=>go("self")} style={{background:"transparent",color:"#fff",border:"2px solid rgba(255,255,255,0.4)",borderRadius:"14px",padding:"16px 32px",fontSize:"16px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,cursor:"pointer"}}>Für mich selbst</button></div></section>
    <footer style={{padding:"28px 6%",textAlign:"center",fontSize:"13px",fontFamily:"'DM Sans',sans-serif",color:"#B0A9A3"}}><div>© 2026 LetterLift – ein Service der Virtue Compliance GmbH, Uznach</div><div style={{marginTop:"8px",display:"flex",gap:"16px",justifyContent:"center"}}><a href="/datenschutz" style={{color:"#B0A9A3",textDecoration:"none"}}>Datenschutz</a><a href="/agb" style={{color:"#B0A9A3",textDecoration:"none"}}>AGB</a><a href="/impressum" style={{color:"#B0A9A3",textDecoration:"none"}}>Impressum</a></div></footer>
    <style>{`*{box-sizing:border-box;}body{margin:0;}`}</style>
  </div>);
}

```

## `./_backup_20260218_112737/src/lib/rateLimit.js`

```js
// src/lib/rateLimit.js
// Client-side rate limiting and bot detection for LetterLift
// Protects against: bot armies generating previews, checkout abuse, API cost explosion

/**
 * Simple in-memory rate limiter (per browser session).
 * Tracks calls per action and enforces limits.
 */
const counters = {};

export function rateLimit(action, maxCalls, windowMs) {
  const now = Date.now();
  if (!counters[action]) {
    counters[action] = [];
  }
  // Remove expired entries
  counters[action] = counters[action].filter((t) => now - t < windowMs);

  if (counters[action].length >= maxCalls) {
    return false; // Rate limit exceeded
  }
  counters[action].push(now);
  return true; // Allowed
}

/**
 * Rate limit presets for LetterLift actions.
 * Returns { allowed: boolean, message: string }
 */
export function checkPreviewLimit() {
  // Max 3 preview generations per 10 minutes
  const allowed = rateLimit("preview", 3, 10 * 60 * 1000);
  return {
    allowed,
    message: allowed
      ? null
      : "Du hast die maximale Anzahl Vorschauen erreicht. Bitte warte ein paar Minuten.",
  };
}

export function checkCheckoutLimit() {
  // Max 3 checkout attempts per 5 minutes
  const allowed = rateLimit("checkout", 3, 5 * 60 * 1000);
  return {
    allowed,
    message: allowed
      ? null
      : "Zu viele Versuche. Bitte warte einen Moment und versuche es erneut.",
  };
}

export function checkAddressSearchLimit() {
  // Max 30 address lookups per 5 minutes
  const allowed = rateLimit("address", 30, 5 * 60 * 1000);
  return { allowed };
}

/**
 * Bot detection based on behavioral signals.
 * Returns { isBot: boolean, reasons: string[] }
 */
export function createBotDetector() {
  const startTime = Date.now();
  const interactions = [];
  let honeypotTriggered = false;

  return {
    // Track meaningful user interactions (typing, clicking)
    recordInteraction(type) {
      interactions.push({ type, time: Date.now() });
    },

    // Honeypot: if a hidden field gets filled, it's a bot
    setHoneypotTriggered() {
      honeypotTriggered = true;
    },

    // Check all signals before checkout
    analyze() {
      const reasons = [];
      const elapsed = Date.now() - startTime;

      // 1. Flow completed impossibly fast (< 30 seconds for entire onboarding)
      if (elapsed < 30 * 1000) {
        reasons.push("flow_too_fast");
      }

      // 2. Honeypot field was filled (invisible to humans, visible to bots)
      if (honeypotTriggered) {
        reasons.push("honeypot");
      }

      // 3. No meaningful interactions recorded (no typing, no clicking)
      if (interactions.length < 5) {
        reasons.push("no_interactions");
      }

      // 4. All interactions happened within 2 seconds (automated filling)
      if (interactions.length > 3) {
        const firstInteraction = interactions[0].time;
        const lastInteraction = interactions[interactions.length - 1].time;
        if (lastInteraction - firstInteraction < 2000) {
          reasons.push("burst_interactions");
        }
      }

      return {
        isBot: reasons.length >= 2, // Need 2+ signals to flag as bot
        isSuspicious: reasons.length >= 1,
        reasons,
      };
    },
  };
}

```

## `./_backup_20260218_112737/src/lib/safety.js`

```js
// src/lib/safety.js
// Input screening and red flag detection for LetterLift
// Implements pre-checkout safety checks based on the 12-criteria safety concept

/**
 * Wut- und Droh-Sprache Patterns (Deutsch)
 * Catches threats, insults, manipulation, stalking language
 */
const THREAT_PATTERNS = [
  // Direct threats
  /\b(du wirst es bereuen|ich weiss wo du|ich finde dich|pass auf|warte ab)\b/i,
  /\b(ich beobachte dich|ich sehe alles|du entkommst|das wirst du büssen)\b/i,
  /\b(ich mach dich|ich bring dich|du bist tot|ich zerstör)\b/i,
  // Manipulation / emotional blackmail
  /\b(wenn du mich wirklich lieben würdest|du bist schuld|ohne mich bist du nichts)\b/i,
  /\b(das hast du dir selbst zuzuschreiben|du verdienst es nicht besser)\b/i,
  /\b(niemand wird dich je|du wirst nie jemand|kein wunder dass)\b/i,
  // Stalking indicators
  /\b(ich habe gesehen dass du|ich weiss was du|ich habe dich beobachtet)\b/i,
  /\b(ich war bei dir|ich stand vor deiner|ich bin dir gefolgt)\b/i,
];

/**
 * Beleidigungen und herabsetzende Sprache
 */
const INSULT_PATTERNS = [
  /\b(du bist so dumm|du bist wertlos|du taugst nichts|du bist erbärmlich)\b/i,
  /\b(du bist hässlich|du bist fett|du bist peinlich|du ekelst mich)\b/i,
  /\b(schlampe|hurensohn|wichser|missgeburt|arschloch|fotze|bastard)\b/i,
  /\b(versager|loser|idiot|vollidiot|trottel|depp)\b/i,
];

/**
 * Pressure / ultimatum language
 */
const PRESSURE_PATTERNS = [
  /\b(du musst|du hast keine wahl|wenn du nicht bis|letzte chance)\b/i,
  /\b(es ist deine schuld|du bist mir schuldig|du schuldest mir)\b/i,
  /\b(jetzt oder nie|ich gebe dir zeit bis|dann ist es vorbei)\b/i,
];

/**
 * Scan a text against a list of patterns.
 * Returns array of matched pattern descriptions.
 */
function scanText(text, patterns) {
  if (!text || typeof text !== "string") return [];
  const normalized = text.toLowerCase().trim();
  const matches = [];
  for (const pattern of patterns) {
    if (pattern.test(normalized)) {
      matches.push(pattern.source);
    }
  }
  return matches;
}

/**
 * Scan all free-text fields in the order data for dangerous content.
 * Returns { safe: boolean, flags: Array<{ type, severity, message }> }
 */
export function screenInputs(data) {
  const flags = [];
  const textFields = [
    { key: "contextText", label: "Situation" },
    { key: "senderMessage", label: "Nachricht" },
    { key: "goal", label: "Ziel" },
    { key: "mem1", label: "Erinnerung 1" },
    { key: "mem2", label: "Erinnerung 2" },
    { key: "mem3", label: "Erinnerung 3" },
    { key: "personaDesc", label: "Persona" },
    { key: "customStyleDesc", label: "Stil" },
  ];

  // Also check memExtra entries
  if (Array.isArray(data.memExtra)) {
    data.memExtra.forEach((_, i) => {
      textFields.push({ key: `memExtra[${i}]`, label: `Erinnerung ${i + 4}` });
    });
  }

  for (const field of textFields) {
    const value =
      field.key.startsWith("memExtra[")
        ? data.memExtra?.[parseInt(field.key.match(/\d+/)[0])]
        : data[field.key];

    if (!value) continue;

    // Check threats
    const threats = scanText(value, THREAT_PATTERNS);
    if (threats.length > 0) {
      flags.push({
        type: "threat",
        severity: "critical",
        field: field.label,
        message:
          "Dieser Text enthält Formulierungen, die als Drohung oder Einschüchterung verstanden werden könnten.",
      });
    }

    // Check insults
    const insults = scanText(value, INSULT_PATTERNS);
    if (insults.length > 0) {
      flags.push({
        type: "insult",
        severity: "critical",
        field: field.label,
        message:
          "Dieser Text enthält beleidigende oder herabsetzende Sprache.",
      });
    }

    // Check pressure
    const pressure = scanText(value, PRESSURE_PATTERNS);
    if (pressure.length > 0) {
      flags.push({
        type: "pressure",
        severity: "warning",
        field: field.label,
        message:
          "Dieser Text enthält Druck-Formulierungen, die in einem Brief unangemessen wirken könnten.",
      });
    }
  }

  return {
    safe: flags.filter((f) => f.severity === "critical").length === 0,
    flags,
  };
}

/**
 * Check for suspicious booking constellations (red flags from the safety concept).
 * Returns array of warnings to show the user.
 */
export function checkRedFlags(data) {
  const warnings = [];

  // 1. Relationship "Andere" + occasion "appreciation" + no nickname
  //    Could be unwanted contact
  if (
    data.relationship === "Andere" &&
    data.occasion === "appreciation" &&
    !data.nickname?.trim()
  ) {
    warnings.push({
      type: "suspicious_constellation",
      severity: "info",
      message:
        "Tipp: Ein Spitzname macht die Briefe persönlicher und zeigt dem Empfänger, dass sie wirklich von dir kommen.",
    });
  }

  // 2. Separation/tough times context + empty noGo field
  //    Could be ex-partner situation – suggest defining boundaries
  if (
    (data.occasion === "tough_times" || data.occasion === "confidence") &&
    !data.noGo?.trim() &&
    data.contextText?.length > 20
  ) {
    const sepKeywords =
      /\b(trennung|ex-|getrennt|scheidung|verlassen|schluss gemacht)\b/i;
    if (sepKeywords.test(data.contextText)) {
      warnings.push({
        type: "separation_no_boundaries",
        severity: "warning",
        message:
          "Bei sensiblen Themen wie Trennungen empfehlen wir, No-Go-Themen zu definieren – damit die Briefe einfühlsam bleiben.",
        action: "noGo",
      });
    }
  }

  // 3. Self-booking with "deceased" persona – handle with extra care
  if (data.bookingType === "self" && data.persona === "deceased") {
    warnings.push({
      type: "deceased_persona",
      severity: "info",
      message:
        "Briefe von verstorbenen Personen werden besonders behutsam geschrieben. Je mehr du über ihre Art zu sprechen erzählst, desto authentischer wird es.",
    });
  }

  // 4. Very short context for large packages
  if (
    data.contextText?.trim().length < 50 &&
    (data.package === "classic" || data.package === "journey")
  ) {
    warnings.push({
      type: "thin_context",
      severity: "warning",
      message: `Für ${data.package === "journey" ? "15" : "10"} einzigartige Briefe empfehlen wir, die Situation ausführlicher zu beschreiben.`,
      action: "context",
    });
  }

  return warnings;
}

/**
 * Combined pre-checkout safety check.
 * Returns { canProceed: boolean, criticalFlags: [], warnings: [] }
 */
export function preCheckoutSafetyCheck(data) {
  const inputResult = screenInputs(data);
  const redFlags = checkRedFlags(data);

  const criticalFlags = inputResult.flags.filter(
    (f) => f.severity === "critical"
  );
  const warnings = [
    ...inputResult.flags.filter((f) => f.severity === "warning"),
    ...redFlags,
  ];

  return {
    canProceed: criticalFlags.length === 0,
    criticalFlags,
    warnings,
  };
}

```

## `./_backup_20260218_112737/src/lib/supabase.js`

```js
// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper: Call edge function
export async function callFunction(name, body) {
  const res = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Function ${name} failed`);
  }
  return res.json();
}

```

## `./.vercel/project.json`

```json
{"projectId":"prj_9TyzeirCyl6KCYnJ6kWh32d46bIj","orgId":"team_qfX4htof0c4zb29Mp2f3MGjH","projectName":"letterlift-web"}
```

## `./middleware.js`

```js
// middleware.js – Geo-detection for currency localization
// Uses domain as primary signal, Vercel IP header as fallback
import { NextResponse } from "next/server";

export function middleware(request) {
  const response = NextResponse.next();
  
  // Check if cookie already set (don't override user's manual choice)
  const existingRegion = request.cookies.get("ll_region")?.value;
  if (existingRegion) return response;
  
  // 1. Domain-based detection (strongest signal)
  const host = request.headers.get("host") || "";
  let region = null;
  if (host.endsWith(".de")) region = "EU";
  else if (host.endsWith(".at")) region = "EU";
  else if (host.endsWith(".ch")) region = "CH";
  
  // 2. Fallback: Vercel IP country header
  if (!region) {
    const country = request.headers.get("x-vercel-ip-country") || "";
    region = country === "CH" ? "CH" : "EU";
  }
  
  // Set cookie for 1 year
  response.cookies.set("ll_region", region, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  
  return response;
}

// Only run on page routes, not on API/static
export const config = {
  matcher: ["/", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

```

## `./next.config.js`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};
module.exports = nextConfig;

```

## `./package.json`

```json
{
  "name": "letterlift-web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@stripe/stripe-js": "^2.4.0",
    "@supabase/supabase-js": "^2.39.0",
    "@vercel/analytics": "^1.6.1",
    "next": "14.1.0",
    "react": "18.2.0",
    "react-dom": "18.2.0"
  }
}

```

## `./src/app/agb/page.js`

```js
// src/app/agb/page.js
export default function AGB() {
  const s = { maxWidth: "700px", margin: "0 auto", padding: "60px 6%", fontFamily: "'DM Sans', sans-serif", color: "#2C2C2C", lineHeight: 1.8, fontSize: "15px" };
  const h = { fontFamily: "'Lora', Georgia, serif", fontWeight: 400, marginTop: "32px" };
  return (
    <div style={{ background: "#FBF8F5", minHeight: "100vh" }}>
      <nav style={{ padding: "20px 6%", maxWidth: "1200px", margin: "0 auto" }}>
        <a href="/" style={{ fontSize: "20px", fontWeight: 700, fontFamily: "'DM Sans',sans-serif", color: "#3D5A4C", textDecoration: "none" }}>✉️ LetterLift</a>
      </nav>
      <div style={s}>
        <h1 style={{ ...h, fontSize: "32px", marginTop: 0 }}>Allgemeine Geschäftsbedingungen (AGB)</h1>
        <p><strong>Stand:</strong> Februar 2026</p>

        <h2 style={{ ...h, fontSize: "20px" }}>1. Geltungsbereich</h2>
        <p>Diese AGB gelten für alle Bestellungen über die Website letterlift.ch, betrieben von der Virtue Compliance GmbH, Mürtschenstrasse 7, 8730 Uznach, Schweiz (CHE-379.218.204).</p>

        <h2 style={{ ...h, fontSize: "20px" }}>2. Leistungsbeschreibung</h2>
        <p>LetterLift erstellt personalisierte Briefserien auf Basis von Angaben, die der Kunde im Onboarding-Prozess macht. Die Briefe werden mit Unterstützung von künstlicher Intelligenz formuliert, auf Papier gedruckt und per Post an die angegebene Adresse versendet.</p>
        <p>Die verfügbaren Pakete umfassen 5, 10 oder 15 Briefe. Der Kunde wählt Paket, Versandfrequenz und optionale Upgrades bei der Bestellung.</p>

        <h2 style={{ ...h, fontSize: "20px" }}>3. Brieffreigabe und Kontrolle</h2>
        <p>Der Kunde erhält jeden Brief vor dem Versand per E-Mail zur Freigabe. Der Kunde kann jeden Brief freigeben, bearbeiten oder den Versand stoppen. Ohne ausdrückliche Freigabe durch den Kunden wird kein Brief versendet.</p>

        <h2 style={{ ...h, fontSize: "20px" }}>4. Preise und Zahlung</h2>
        <p>Alle Preise auf der Website verstehen sich in Schweizer Franken (CHF), inklusive Mehrwertsteuer. Die Zahlung erfolgt einmalig bei Bestellung über den Zahlungsdienstleister Stripe. Es fallen keine wiederkehrenden Kosten an, sofern kein Abonnement abgeschlossen wird.</p>

        <h2 style={{ ...h, fontSize: "20px" }}>5. Widerrufsrecht</h2>
        <p>Da es sich um individuell angefertigte Waren handelt (personalisierte Briefe), besteht nach Schweizer Recht kein gesetzliches Widerrufsrecht. Wir bieten jedoch folgende Kulanzregelung:</p>
        <p><strong>Vor dem Versand des ersten Briefs:</strong> Vollständige Rückerstattung möglich. Kontaktieren Sie uns unter info@virtue-compliance.ch.</p>
        <p><strong>Nach Versand des ersten Briefs:</strong> Die verbleibenden, noch nicht versendeten Briefe können storniert werden. Eine anteilige Rückerstattung erfolgt für nicht versendete Briefe abzüglich einer Bearbeitungsgebühr von CHF 5.00.</p>
        <p><strong>Für Kunden in der EU:</strong> Sofern ein gesetzliches Widerrufsrecht nach EU-Recht besteht, wird dieses gewährt. Das Widerrufsrecht erlischt bei vollständig erbrachten Dienstleistungen (versendeten Briefen).</p>

        <h2 style={{ ...h, fontSize: "20px" }}>6. Missbrauchsschutz</h2>
        <p>LetterLift darf nicht für bedrohende, beleidigende, diskriminierende oder anderweitig rechtswidrige Inhalte verwendet werden. Wir behalten uns vor, Bestellungen ohne Angabe von Gründen abzulehnen oder zu stornieren, wenn ein Missbrauchsverdacht besteht. Die generierten Briefe durchlaufen ein automatisches Sicherheitssystem.</p>

        <h2 style={{ ...h, fontSize: "20px" }}>7. Haftung</h2>
        <p>Die Virtue Compliance GmbH haftet nicht für Verzögerungen im Postversand, die ausserhalb unseres Einflussbereichs liegen. Die Haftung ist auf den Bestellwert begrenzt. Für indirekte Schäden oder entgangenen Gewinn wird keine Haftung übernommen.</p>
        <p>LetterLift befindet sich aktuell in der Beta-Phase. Trotz sorgfältiger Qualitätskontrolle können vereinzelt technische Einschränkungen auftreten.</p>

        <h2 style={{ ...h, fontSize: "20px" }}>8. Geistiges Eigentum</h2>
        <p>Die generierten Brieftexte gehen mit Bezahlung in das Eigentum des Kunden über. Der Kunde darf die Briefe frei verwenden. LetterLift behält das Recht, anonymisierte Muster (keine konkreten Texte oder personenbezogenen Daten) zur Verbesserung des Service zu nutzen.</p>

        <h2 style={{ ...h, fontSize: "20px" }}>9. Beta-Hinweis</h2>
        <p>LetterLift befindet sich derzeit in einer öffentlichen Beta-Phase. Funktionen, Preise und Verfügbarkeit können sich ändern. Als Beta-Nutzer profitieren Sie von vergünstigten Einführungspreisen.</p>

        <h2 style={{ ...h, fontSize: "20px" }}>10. Anwendbares Recht und Gerichtsstand</h2>
        <p>Es gilt Schweizer Recht. Gerichtsstand ist Uznach, Schweiz. Für Konsumenten in der EU gelten die zwingenden Bestimmungen des Verbraucherschutzrechts ihres Wohnsitzstaates.</p>

        <h2 style={{ ...h, fontSize: "20px" }}>11. Änderungen</h2>
        <p>Wir behalten uns vor, diese AGB jederzeit anzupassen. Für bestehende Bestellungen gelten die zum Zeitpunkt der Bestellung gültigen AGB.</p>

        <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #E0DAD4" }}>
          <a href="/" style={{ color: "#5B7B6A", textDecoration: "none" }}>← Zurück zu LetterLift</a>
        </div>
      </div>
    </div>
  );
}

```

## `./src/app/datenschutz/page.js`

```js
// src/app/datenschutz/page.js
export default function Datenschutz() {
  const s = { maxWidth: "700px", margin: "0 auto", padding: "60px 6%", fontFamily: "'DM Sans', sans-serif", color: "#2C2C2C", lineHeight: 1.8, fontSize: "15px" };
  const h = { fontFamily: "'Lora', Georgia, serif", fontWeight: 400, marginTop: "32px" };
  return (
    <div style={{ background: "#FBF8F5", minHeight: "100vh" }}>
      <nav style={{ padding: "20px 6%", maxWidth: "1200px", margin: "0 auto" }}>
        <a href="/" style={{ fontSize: "20px", fontWeight: 700, fontFamily: "'DM Sans',sans-serif", color: "#3D5A4C", textDecoration: "none" }}>✉️ LetterLift</a>
      </nav>
      <div style={s}>
        <h1 style={{ ...h, fontSize: "32px", marginTop: 0 }}>Datenschutzerklärung</h1>
        <p><strong>Stand:</strong> Februar 2026</p>

        <h2 style={{ ...h, fontSize: "20px" }}>1. Verantwortliche Stelle</h2>
        <p>Virtue Compliance GmbH<br/>Mürtschenstrasse 7, 8730 Uznach, Schweiz<br/>E-Mail: info@virtue-compliance.ch<br/>CHE-379.218.204</p>

        <h2 style={{ ...h, fontSize: "20px" }}>2. Welche Daten wir erheben</h2>
        <p>Bei der Nutzung von LetterLift erheben wir folgende Daten:</p>
        <p><strong>Bestelldaten:</strong> Name des Empfängers, Lieferadresse, gewähltes Paket, Zahlungsinformationen (verarbeitet durch Stripe, wir speichern keine Kreditkartendaten).</p>
        <p><strong>Personalisierungsdaten:</strong> Angaben zu Anlass, Erinnerungen, Persönlichkeit, Stil und weiteren Informationen, die Sie im Onboarding-Prozess eingeben. Diese Daten werden ausschliesslich zur Erstellung der personalisierten Briefserie verwendet.</p>
        <p><strong>Kontaktdaten:</strong> E-Mail-Adresse für Bestellbestätigungen und Brieffreigaben.</p>
        <p><strong>Technische Daten:</strong> IP-Adresse, Browsertyp, Zugriffszeitpunkt (via Hosting-Provider Vercel).</p>

        <h2 style={{ ...h, fontSize: "20px" }}>3. Zweck der Datenverarbeitung</h2>
        <p>Wir verarbeiten Ihre Daten ausschliesslich für folgende Zwecke:</p>
        <p>• Erstellung und Versand personalisierter Briefserien<br/>
        • Abwicklung der Zahlung über Stripe<br/>
        • Druck und Versand der Briefe über Pingen (Schweizer Lettershop-Partner)<br/>
        • Kommunikation bezüglich Ihrer Bestellung (Bestätigung, Brieffreigabe)<br/>
        • Verbesserung unseres Services (nur mit Ihrer ausdrücklichen Einwilligung, anonymisiert)</p>

        <h2 style={{ ...h, fontSize: "20px" }}>4. KI-Verarbeitung</h2>
        <p>Zur Erstellung der Briefe nutzen wir die API von Anthropic (Claude). Ihre Personalisierungsdaten werden zur Textgenerierung an die Anthropic API übermittelt. Anthropic speichert keine Daten aus API-Anfragen zu Trainingszwecken. Die Übermittlung erfolgt verschlüsselt.</p>

        <h2 style={{ ...h, fontSize: "20px" }}>5. Auftragsverarbeiter</h2>
        <p><strong>Stripe Inc.</strong> (USA) – Zahlungsabwicklung. Stripe ist unter dem EU-US Data Privacy Framework zertifiziert.</p>
        <p><strong>Pingen AG</strong> (Schweiz) – Druck und Versand der Briefe. Daten werden in der Schweiz verarbeitet.</p>
        <p><strong>Supabase Inc.</strong> (USA/EU) – Datenbank-Hosting. Server-Standort: Frankfurt (EU).</p>
        <p><strong>Vercel Inc.</strong> (USA) – Website-Hosting.</p>
        <p><strong>Anthropic PBC</strong> (USA) – KI-Textgenerierung via API.</p>
        <p><strong>Google LLC</strong> (USA) – Webanalyse via Google Analytics. Wird nur mit Ihrer ausdrücklichen Einwilligung aktiviert (Cookie-Banner). Google ist unter dem EU-US Data Privacy Framework zertifiziert. Weitere Informationen: <a href="https://policies.google.com/privacy" style={{ color: "#5B7B6A" }}>Google Datenschutzerklärung</a>.</p>
        <p><strong>Resend Inc.</strong> (USA) – E-Mail-Versand für Bestellbestätigungen und Brieffreigaben.</p>
        <p><strong>Geoapify GmbH</strong> (Deutschland) – Adress-Autocomplete im Bestellprozess. Es werden eingegebene Adressdaten zur Vervollständigung übermittelt.</p>

        <h2 style={{ ...h, fontSize: "20px" }}>6. Datenspeicherung und Löschung</h2>
        <p>Personalisierungsdaten werden nach Abschluss der Briefserie (letzter Brief versendet) für maximal 90 Tage aufbewahrt, um eventuelle Kundenanfragen bearbeiten zu können. Danach werden sie unwiderruflich gelöscht.</p>
        <p>Rechnungsdaten werden gemäss gesetzlicher Aufbewahrungspflicht (10 Jahre) gespeichert.</p>
        <p>Sie können jederzeit die sofortige Löschung Ihrer Daten verlangen (ausgenommen gesetzliche Aufbewahrungspflichten).</p>

        <h2 style={{ ...h, fontSize: "20px" }}>7. Ihre Rechte</h2>
        <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Kontaktieren Sie uns unter info@virtue-compliance.ch.</p>
        <p>Schweizer Datenschutzrecht (DSG): Sie können sich an den Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) wenden.</p>
        <p>EU-Datenschutzrecht (DSGVO): Sofern die DSGVO anwendbar ist, haben Sie zusätzlich das Recht auf Beschwerde bei einer EU-Aufsichtsbehörde.</p>

        <h2 style={{ ...h, fontSize: "20px" }}>8. Cookies und Webanalyse</h2>
        <p><strong>Technisch notwendige Cookies:</strong> LetterLift verwendet ein Cookie (<code style={{ background: "#F0EDE8", padding: "2px 6px", borderRadius: "4px", fontSize: "13px" }}>ll_consent</code>), um Ihre Cookie-Einwilligung zu speichern. Dieses Cookie ist für den Betrieb der Website erforderlich und wird ohne Einwilligung gesetzt.</p>
        <p><strong>Google Analytics:</strong> Wir verwenden Google Analytics (Google LLC, USA) zur Analyse der Websitenutzung. Google Analytics wird <strong>erst nach Ihrer ausdrücklichen Einwilligung</strong> über den Cookie-Banner aktiviert. Dabei werden Daten wie Seitenaufrufe, Verweildauer und ungefährer Standort (auf Stadtebene) erhoben. Die IP-Adresse wird anonymisiert. Sie können Ihre Einwilligung jederzeit widerrufen, indem Sie Ihre Browser-Cookies löschen. Beim nächsten Besuch wird der Cookie-Banner erneut angezeigt.</p>
        <p>Weitere Informationen zur Datenverarbeitung durch Google: <a href="https://policies.google.com/privacy" style={{ color: "#5B7B6A" }}>Google Datenschutzerklärung</a>. Sie können die Erfassung durch Google Analytics auch mit dem <a href="https://tools.google.com/dlpage/gaoptout" style={{ color: "#5B7B6A" }}>Browser-Add-on von Google</a> verhindern.</p>

        <h2 style={{ ...h, fontSize: "20px" }}>9. Änderungen</h2>
        <p>Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. Die aktuelle Version ist stets auf dieser Seite einsehbar.</p>

        <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #E0DAD4" }}>
          <a href="/" style={{ color: "#5B7B6A", textDecoration: "none" }}>← Zurück zu LetterLift</a>
        </div>
      </div>
    </div>
  );
}

```

## `./src/app/impressum/page.js`

```js
// src/app/impressum/page.js
export default function Impressum() {
  const s = { maxWidth: "700px", margin: "0 auto", padding: "60px 6%", fontFamily: "'DM Sans', sans-serif", color: "#2C2C2C", lineHeight: 1.8, fontSize: "15px" };
  const h = { fontFamily: "'Lora', Georgia, serif", fontWeight: 400, marginTop: "32px" };
  return (
    <div style={{ background: "#FBF8F5", minHeight: "100vh" }}>
      <nav style={{ padding: "20px 6%", maxWidth: "1200px", margin: "0 auto" }}>
        <a href="/" style={{ fontSize: "20px", fontWeight: 700, fontFamily: "'DM Sans',sans-serif", color: "#3D5A4C", textDecoration: "none" }}>✉️ LetterLift</a>
      </nav>
      <div style={s}>
        <h1 style={{ ...h, fontSize: "32px", marginTop: 0 }}>Impressum</h1>
        <h2 style={{ ...h, fontSize: "20px" }}>Betreiberin</h2>
        <p>Virtue Compliance GmbH<br/>Mürtschenstrasse 7<br/>8730 Uznach<br/>Schweiz</p>
        <p>CHE-379.218.204</p>
        <h2 style={{ ...h, fontSize: "20px" }}>Kontakt</h2>
        <p>E-Mail: info@virtue-compliance.ch</p>
        <h2 style={{ ...h, fontSize: "20px" }}>Vertretungsberechtigte Person(en)</h2>
        <p>Elena Scheller, Geschäftsführer</p>
        <h2 style={{ ...h, fontSize: "20px" }}>Haftungsausschluss</h2>
        <p>Die Inhalte dieser Website werden mit grösstmöglicher Sorgfalt erstellt. Die Virtue Compliance GmbH übernimmt jedoch keine Gewähr für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten Inhalte.</p>
        <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #E0DAD4" }}>
          <a href="/" style={{ color: "#5B7B6A", textDecoration: "none" }}>← Zurück zu LetterLift</a>
        </div>
      </div>
    </div>
  );
}

```

## `./src/app/layout.js`

```js
// src/app/layout.js
export const metadata = {
  title: "LetterLift – Persönliche Briefserien, die berühren",
  description: "Persönliche Briefserien für die Menschen, die dir am Herzen liegen. KI-unterstützt, von dir inspiriert. Als Geschenk oder für dich selbst. Ab CHF 34.90.",
  keywords: ["Briefe verschenken", "persönliche Geschenkidee", "Briefserie", "emotionales Geschenk", "KI Briefe", "persönliche Briefe", "Geschenk Schweiz", "LetterLift"],
  authors: [{ name: "LetterLift" }],
  creator: "LetterLift",
  metadataBase: new URL("https://letterlift.ch"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "LetterLift – Persönliche Briefserien, die berühren",
    description: "Überrasche jemanden mit einer Serie persönlicher Briefe. Echtes Papier, echte Emotionen. Ab CHF 34.90.",
    url: "https://letterlift.ch",
    siteName: "LetterLift",
    locale: "de_CH",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "LetterLift – Persönliche Briefserien, die berühren" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LetterLift – Briefe, die wirklich ankommen",
    description: "Persönliche Briefserien als Geschenk oder für dich selbst. KI-unterstützt, von dir inspiriert.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "og:price:amount": "34.90",
    "og:price:currency": "CHF",
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "LetterLift Briefserie",
    description: "KI-personalisierte Briefserien, die berühren. Als Geschenk oder für dich selbst.",
    brand: { "@type": "Brand", name: "LetterLift" },
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "9.90",
      highPrice: "79.90",
      priceCurrency: "CHF",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Caveat:wght@400;600&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3D5A4C" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
          function loadGA(){if(window._gaLoaded)return;window._gaLoaded=true;var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=G-M7ZK9G336X';document.head.appendChild(s);gtag('js',new Date());gtag('config','G-M7ZK9G336X');}
          if(document.cookie.indexOf('ll_consent=1')!==-1)loadGA();
        ` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body style={{ margin: 0, fontFamily: "'Lora', Georgia, serif" }}>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            if(document.cookie.indexOf('ll_consent=')!==-1)return;
            var b=document.createElement('div');
            b.id='ll-cookie';
            b.style.cssText='position:fixed;bottom:0;left:0;right:0;background:#2D2926;color:#fff;padding:14px 20px;display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;z-index:9999;font-family:DM Sans,sans-serif;font-size:13px;';
            b.innerHTML='<span style="flex:1;min-width:200px;line-height:1.5;">Wir verwenden Cookies für die Analyse unserer Website. <a href="/datenschutz" style="color:#A8D5BA;text-decoration:underline;">Mehr erfahren</a></span><button onclick="llAccept()" style="background:#5B7B6A;color:#fff;border:none;border-radius:8px;padding:8px 20px;font-size:13px;font-weight:600;cursor:pointer;font-family:DM Sans,sans-serif;">Akzeptieren</button><button onclick="llDecline()" style="background:none;color:#999;border:1px solid #555;border-radius:8px;padding:8px 16px;font-size:13px;cursor:pointer;font-family:DM Sans,sans-serif;">Ablehnen</button>';
            document.body.appendChild(b);
            window.llAccept=function(){document.cookie='ll_consent=1;path=/;max-age=31536000;SameSite=Lax';loadGA();b.remove();};
            window.llDecline=function(){document.cookie='ll_consent=0;path=/;max-age=31536000;SameSite=Lax';b.remove();};
          })();
        ` }} />
      </body>
    </html>
  );
}

```

## `./src/app/page.js`

```js
// src/app/page.js
"use client";
import dynamic from "next/dynamic";

const LetterLift = dynamic(() => import("../components/LetterLift"), { ssr: false });

export default function Home() {
  return <LetterLift />;
}

```

## `./src/app/review/[token]/page.js`

```js
// src/app/review/[token]/page.js
"use client";
import { useParams } from "next/navigation";
import ReviewFlow from "../../../components/review/ReviewFlow";

export default function ReviewPage() {
  const { token } = useParams();
  return <ReviewFlow token={token} />;
}

```

## `./src/app/success/page.js`

```js
// src/app/success/page.js
"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("order");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FBF8F5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>
      <div style={{
        maxWidth: "520px",
        textAlign: "center",
        background: "#fff",
        borderRadius: "20px",
        padding: "48px 36px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>✉️</div>
        <h1 style={{
          fontSize: "28px",
          fontWeight: 400,
          fontFamily: "'Lora', Georgia, serif",
          margin: "0 0 12px",
          color: "#2C2C2C",
        }}>
          Danke für deine Bestellung!
        </h1>
        <p style={{
          fontSize: "16px",
          fontFamily: "'DM Sans', sans-serif",
          color: "#6B6360",
          lineHeight: 1.7,
          margin: "0 0 24px",
        }}>
          Die Briefe werden jetzt generiert – das dauert nur wenige Minuten. 
          Du erhältst eine E-Mail, sobald der erste Brief bereit ist.
        </p>
        <div style={{
          background: "#F0F5EE",
          borderRadius: "12px",
          padding: "16px 20px",
          fontSize: "14px",
          fontFamily: "'DM Sans', sans-serif",
          color: "#3D5A4C",
          marginBottom: "24px",
        }}>
          <strong>So geht es weiter:</strong><br/>
          1. Briefe werden generiert (1–3 Min.)<br/>
          2. Du erhältst jeden Brief vorab per E-Mail<br/>
          3. Freigeben, anpassen oder stoppen – du hast die Kontrolle<br/>
          4. Nach Freigabe: Druck & Versand via Schweizer Post
        </div>
        {orderId && (
          <p style={{
            fontSize: "12px",
            fontFamily: "'DM Sans', sans-serif",
            color: "#B0A9A3",
          }}>
            Bestellnummer: {orderId.substring(0, 8)}...
          </p>
        )}
        <a href="/" style={{
          display: "inline-block",
          marginTop: "16px",
          padding: "14px 32px",
          background: "linear-gradient(135deg, #3D5A4C, #5B7B6A)",
          color: "#fff",
          borderRadius: "12px",
          textDecoration: "none",
          fontSize: "15px",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
        }}>
          Zurück zur Startseite
        </a>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#FBF8F5"}}>Laden...</div>}>
      <SuccessContent />
    </Suspense>
  );
}

```

## `./src/components/landing/Landing.jsx`

```jsx
// src/components/landing/Landing.jsx
"use client";
import { useState } from "react";
import { useInView } from "../../hooks/useInView";
import { HERO_LETTERS } from "../../data/heroLetters";
import { fonts, colors } from "../../styles/theme";

export default function Landing({ onStart, currSymbol }) {
  const cs = currSymbol;
  const [hR, hV] = useInView(0.1);
  const [wR, wV] = useInView();
  const [tR, tV] = useInView();
  const [fR, fV] = useInView();
  const [openFaq, setOpenFaq] = useState(null);
  const [heroOcc, setHeroOcc] = useState(0);

  const fadeIn = (visible) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(30px)",
    transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
  });

  const go = (type) => onStart(type);

  return (
    <div style={{ minHeight: "100vh", background: colors.bg, fontFamily: fonts.serif, color: colors.text, overflowX: "hidden" }}>
      {/* ─── Nav ─── */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 6%", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "20px", fontWeight: 700, fontFamily: fonts.sans, color: colors.primary }}>✉️ LetterLift</span>
          <span style={{ fontSize: "11px", fontFamily: fonts.sans, fontWeight: 600, color: colors.primaryLight, background: colors.primaryBg, padding: "4px 10px", borderRadius: "100px", letterSpacing: "0.05em" }}>BETA</span>
        </div>
        <button onClick={() => go("gift")} style={{ background: colors.primary, color: "#fff", border: "none", borderRadius: "10px", padding: "10px 22px", fontSize: "14px", fontFamily: fonts.sans, fontWeight: 600, cursor: "pointer" }}>Jetzt starten</button>
      </nav>

      {/* ─── Hero ─── */}
      <section ref={hR} style={{ ...fadeIn(hV), maxWidth: "1200px", margin: "0 auto", padding: "80px 6% 60px", display: "flex", alignItems: "center", gap: "60px", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 460px", minWidth: "300px" }}>
          <h1 style={{ fontSize: "clamp(36px,5vw,56px)", fontWeight: 400, lineHeight: 1.15, margin: "0 0 20px" }}>
            Briefe, die<br />wirklich <span style={{ fontStyle: "italic", color: colors.primaryLight }}>ankommen</span>.
          </h1>
          <p style={{ fontSize: "18px", lineHeight: 1.7, color: colors.textMuted, margin: "0 0 36px", maxWidth: "480px", fontFamily: fonts.sans }}>
            Manchmal fehlen uns die Worte – genau dann, wenn sie am meisten zählen. LetterLift schreibt sie für dich.
          </p>
          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <button onClick={() => go("gift")} style={{ background: colors.primaryGrad, color: "#fff", border: "none", borderRadius: "14px", padding: "18px 34px", fontSize: "16px", fontFamily: fonts.sans, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 20px rgba(61,90,76,0.25)" }}>🎁 Als Geschenk</button>
            <button onClick={() => go("self")} style={{ background: "transparent", color: colors.primary, border: `2px solid ${colors.primaryLight}`, borderRadius: "14px", padding: "16px 30px", fontSize: "16px", fontFamily: fonts.sans, fontWeight: 600, cursor: "pointer" }}>Für mich selbst</button>
          </div>
          <div style={{ marginTop: "24px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[{ e: "💔", l: "Schwere Zeiten" }, { e: "🎯", l: "Motivation" }, { e: "💪", l: "Selbstvertrauen" }, { e: "🙏", l: "Wertschätzung" }, { e: "🎉", l: "Meilensteine" }, { e: "🌱", l: "Neuanfang" }].map((t, i) => (
              <span key={i} onClick={() => setHeroOcc(i)} style={{ fontSize: "13px", fontFamily: fonts.sans, color: heroOcc === i ? "#fff" : colors.primaryLight, background: heroOcc === i ? colors.primaryLight : colors.primaryBg, padding: "6px 14px", borderRadius: "100px", cursor: "pointer", transition: "all 0.2s" }}>{t.e} {t.l}</span>
            ))}
          </div>
        </div>

        {/* Brief-Preview */}
        <div style={{ flex: "1 1 340px", minWidth: "280px", display: "flex", justifyContent: "center" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "340px", height: "420px" }}>
            {(() => { const p = HERO_LETTERS[heroOcc]; return (
              <div style={{ position: "absolute", top: "10px", left: "10px", right: "30px", background: "#fff", borderRadius: "4px", padding: "clamp(20px,4vw,32px) clamp(18px,3vw,28px)", boxShadow: "0 12px 40px rgba(0,0,0,0.08)", transform: "rotate(-1.5deg)", fontSize: "14px", lineHeight: 1.8, color: "#3A3A3A", transition: "opacity 0.3s" }}>
                <div style={{ marginBottom: "12px", color: colors.primaryLight, fontStyle: "italic", fontSize: "15px" }}>{p.greeting}</div>
                <div>{p.body}</div>
                <div style={{ marginTop: "16px", color: colors.primaryLight, fontSize: "14px" }}>{p.sign}</div>
              </div>
            ); })()}
            <div style={{ position: "absolute", bottom: "10px", right: "0px", width: "clamp(200px,65%,240px)", background: colors.surfaceMuted, borderRadius: "8px", padding: "16px 20px", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", transform: "rotate(1.5deg)", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ fontSize: "20px" }}>✏️</div>
              <div>
                <div style={{ fontWeight: 600, color: colors.primary, fontSize: "13px", fontFamily: fonts.sans }}>Brief bearbeiten</div>
                <div style={{ fontSize: "11px", color: "#7A7470", fontFamily: fonts.sans, marginTop: "2px" }}>Vor dem Versand anpassen</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Story-Timeline ─── */}
      <section style={{ background: "#fff", padding: "80px 6%" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "28px", fontWeight: 400, margin: "0 0 12px", lineHeight: 1.3, textAlign: "center" }}>Stell dir vor, du kommst nach Hause.</h2>
          <p style={{ fontSize: "15px", fontFamily: fonts.sans, color: colors.textLight, textAlign: "center", margin: "0 0 48px" }}>Zwischen Rechnungen und Werbung liegt ein Umschlag. Dein Name darauf. Handgeschrieben.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0", position: "relative", paddingLeft: "36px" }}>
            <div style={{ position: "absolute", left: "11px", top: "24px", bottom: "24px", width: "2px", background: `linear-gradient(to bottom, ${colors.border}, ${colors.primaryLight}, ${colors.primary})`, zIndex: 0 }} />
            {[
              { day: "Du öffnest den Umschlag", desc: "Dein Herz klopft ein bisschen. Wer schreibt heute noch Briefe? Du liest – und merkst: Jemand hat wirklich über dich nachgedacht. Nicht ein Like, nicht ein Emoji. Echte Worte, die sitzen. Du liest ihn zweimal." },
              { day: "Ein paar Tage später – noch einer", desc: "Diesmal geht es um etwas, das nur ihr zwei wisst. Eine Erinnerung, ein Insider, ein Moment, den du fast vergessen hattest. Du musst lachen – und dann kurz schlucken." },
              { day: "Du ertappst dich", desc: "Beim Heimkommen checkst du zuerst den Briefkasten. Der Brief heute trifft dich anders. Jemand sieht dich. Nicht oberflächlich. Wirklich. So wie du bist – mit allem, was dazugehört." },
              { day: "Die Briefe bleiben", desc: "Sie liegen auf deinem Nachttisch. Du liest sie nochmal – an Tagen, wo du es brauchst. Nichts, das morgen schon vergessen ist. Kein Chat, der untergeht. Diese Worte sind für dich. Und sie bleiben." },
            ].map((s, i) => (
              <div key={i} style={{ position: "relative", zIndex: 1, paddingBottom: i < 3 ? "36px" : "0", paddingLeft: "28px" }}>
                <div style={{ position: "absolute", left: "-36px", top: "2px", width: "24px", height: "24px", borderRadius: "50%", background: i === 3 ? colors.primary : "#fff", border: i === 3 ? "none" : `2px solid ${colors.primaryLight}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", zIndex: 2 }}>
                  {i === 3 && <span style={{ color: "#fff", fontSize: "12px" }}>♡</span>}
                </div>
                <div style={{ fontSize: "13px", fontFamily: fonts.sans, fontWeight: 600, color: colors.primaryLight, marginBottom: "6px" }}>{s.day}</div>
                <div style={{ fontSize: "15px", fontFamily: fonts.sans, color: i === 3 ? colors.textDark : "#4A4540", lineHeight: 1.8, fontWeight: i === 3 ? 500 : 400 }}>{s.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <button onClick={() => go("gift")} style={{ marginTop: "48px", background: colors.primaryGrad, color: "#fff", border: "none", borderRadius: "14px", padding: "16px 32px", fontSize: "15px", fontFamily: fonts.sans, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 20px rgba(61,90,76,0.2)" }}>Jemandem diese Erfahrung schenken →</button>
          </div>
        </div>
      </section>

      {/* ─── So funktioniert's ─── */}
      <section ref={wR} style={{ ...fadeIn(wV), maxWidth: "1000px", margin: "0 auto", padding: "80px 6%" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 400, textAlign: "center", margin: "0 0 40px" }}>So funktioniert's</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: "20px" }}>
          {[
            { i: "💬", t: "Du erzählst", d: "Erinnerungen, Insider-Witze, gemeinsame Momente. 5-10 Minuten – alles was diese Person besonders macht." },
            { i: "✏️", t: "Wir schreiben, du kontrollierst", d: "Unsere KI macht aus deinen Worten eine Briefserie mit Dramaturgie. Du liest jeden Brief vorab und gibst ihn frei." },
            { i: "✉️", t: "Echte Post, die bleibt", d: "Gedruckt auf echtem Papier, verschickt per Post. Kein Screen, kein Algorithmus. Ein Brief, den man in der Hand hält." },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "16px", padding: "24px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", textAlign: "center" }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>{s.i}</div>
              <div style={{ fontSize: "15px", fontWeight: 600, fontFamily: fonts.sans, marginBottom: "6px" }}>{s.t}</div>
              <div style={{ fontSize: "12.5px", fontFamily: fonts.sans, color: "#7A7470", lineHeight: 1.6 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Pakete ─── */}
      <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "80px 6% 40px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 400, textAlign: "center", margin: "0 0 12px" }}>Wähle dein Paket</h2>
        <p style={{ fontSize: "15px", fontFamily: fonts.sans, color: colors.textLight, textAlign: "center", margin: "0 0 40px" }}>Jedes Paket ist eine durchkomponierte Briefserie – kein Brief wie der andere.</p>
        {/* Trial */}
        <div style={{ background: "#fff", borderRadius: "16px", border: `1.5px dashed ${colors.border}`, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
          <div>
            <div style={{ fontSize: "17px", fontWeight: 600, fontFamily: fonts.sans, color: colors.text }}>🔍 Erstmal testen?</div>
            <div style={{ fontSize: "14px", fontFamily: fonts.sans, color: colors.textMuted, marginTop: "4px" }}>Ein einzelner Brief – damit du siehst, wie persönlich LetterLift klingt.</div>
          </div>
          <button onClick={() => go("gift")} style={{ background: "transparent", color: colors.primary, border: `2px solid ${colors.primaryLight}`, borderRadius: "12px", padding: "12px 28px", fontSize: "15px", fontFamily: fonts.sans, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Trial-Brief · {cs}9.90</button>
        </div>
        {/* Serien */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "20px" }}>
          {[
            { name: "Impuls", briefe: 5, preis: "34.90", pro: "6.98", desc: "Kurz und kraftvoll. Perfekt für einen klaren Anlass.", pop: false },
            { name: "Classic", briefe: 10, preis: "59.90", pro: "5.99", desc: "Der ideale Bogen. 10 Briefe mit Dramaturgie – unser Bestseller.", pop: true },
            { name: "Journey", briefe: 15, preis: "79.90", pro: "5.33", desc: "Für tiefe Begleitung. 15 Briefe über Wochen oder Monate.", pop: false },
          ].map((p, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "18px", padding: "32px 24px", border: p.pop ? `2px solid ${colors.primaryLight}` : `1.5px solid ${colors.borderLight}`, boxShadow: p.pop ? "0 4px 24px rgba(91,123,106,0.12)" : "0 2px 12px rgba(0,0,0,0.04)", position: "relative", textAlign: "center" }}>
              {p.pop && <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: colors.primaryLight, color: "#fff", fontSize: "11px", fontFamily: fonts.sans, fontWeight: 600, padding: "4px 16px", borderRadius: "100px", letterSpacing: "0.05em" }}>BELIEBTESTE WAHL</div>}
              <div style={{ fontSize: "22px", fontWeight: 600, fontFamily: fonts.sans, color: colors.text, marginBottom: "4px" }}>{p.name}</div>
              <div style={{ fontSize: "14px", fontFamily: fonts.sans, color: colors.textLight, marginBottom: "16px" }}>{p.briefe} Briefe</div>
              <div style={{ fontSize: "36px", fontWeight: 700, fontFamily: fonts.sans, color: colors.primary, marginBottom: "4px" }}>{cs}{p.preis}</div>
              <div style={{ fontSize: "13px", fontFamily: fonts.sans, color: colors.textLight, marginBottom: "16px" }}>{cs}{p.pro} pro Brief</div>
              <p style={{ fontSize: "13px", fontFamily: fonts.sans, color: colors.textMuted, lineHeight: 1.6, margin: "0 0 20px", minHeight: "40px" }}>{p.desc}</p>
              <button onClick={() => go("gift")} style={{ width: "100%", padding: "14px", background: p.pop ? colors.primaryGrad : "transparent", color: p.pop ? "#fff" : colors.primary, border: p.pop ? "none" : `2px solid ${colors.primaryLight}`, borderRadius: "12px", fontSize: "15px", fontFamily: fonts.sans, fontWeight: 600, cursor: "pointer" }}>Jetzt starten</button>
            </div>
          ))}
        </div>
        {/* Upgrades */}
        <div style={{ marginTop: "32px" }}>
          <p style={{ fontSize: "14px", fontFamily: fonts.sans, fontWeight: 600, color: colors.text, textAlign: "center", margin: "0 0 16px" }}>Mach es besonders – Premium-Upgrades</p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { icon: "📜", name: "Premium-Papier", desc: "Schweres, hochwertiges Premiumpapier", price: "+" + cs + "9.90" },
              { icon: "✒️", name: "Handschrift-Edition", desc: "Premium-Papier + eleganter Handschrift-Font", price: "+" + cs + "19.90" },
              { icon: "📸", name: "Foto-Edition", desc: "Deine Fotos passend in die Briefe integriert", price: "+" + cs + "19.90", soon: true },
            ].map((u, i) => (
              <div key={i} style={{ background: "#fff", border: `1.5px solid ${colors.borderLight}`, borderRadius: "14px", padding: "18px 22px", display: "flex", alignItems: "center", gap: "14px", minWidth: "220px", flex: "1", maxWidth: "360px", opacity: u.soon ? 0.7 : 1 }}>
                <div style={{ fontSize: "28px" }}>{u.icon}</div>
                <div style={{ flex: 1 }}>
                  {u.soon && <div style={{ fontSize: "10px", fontWeight: 600, fontFamily: fonts.sans, color: "#fff", background: colors.textLighter, borderRadius: "6px", padding: "2px 8px", display: "inline-block", marginBottom: "4px" }}>COMING SOON</div>}
                  <div style={{ fontSize: "14px", fontWeight: 600, fontFamily: fonts.sans }}>{u.name}</div>
                  <div style={{ fontSize: "12px", fontFamily: fonts.sans, color: colors.textLight, marginTop: "2px" }}>{u.desc}</div>
                </div>
                <div style={{ fontSize: "13px", fontFamily: fonts.sans, fontWeight: 600, color: u.soon ? colors.textLighter : colors.primary, whiteSpace: "nowrap" }}>{u.price}</div>
              </div>
            ))}
          </div>
        </div>
        <p style={{ fontSize: "13px", fontFamily: fonts.sans, color: colors.textLighter, textAlign: "center", marginTop: "20px" }}>Einmalzahlung · Kein Abo · Upgrades im Bestellprozess wählbar</p>
      </section>

      {/* ─── Versprechen ─── */}
      <section ref={tR} style={{ ...fadeIn(tV), maxWidth: "800px", margin: "0 auto", padding: "60px 6%" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 400, textAlign: "center", margin: "0 0 36px" }}>Unser Versprechen</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "16px" }}>
          {[
            { icon: "🔒", title: "Volle Kontrolle", desc: "Du siehst jeden Brief bevor er verschickt wird. Nichts geht raus ohne dein OK. Jederzeit anpassen oder stoppen." },
            { icon: "🇨🇭", title: "Schweizer Service", desc: "Entwickelt und betrieben in der Schweiz. Deine Daten bleiben geschützt." },
            { icon: "💳", title: "Kein Abo, kein Risiko", desc: "Einmalzahlung. Keine versteckten Kosten, keine automatische Verlängerung." },
            { icon: "✏️", title: "Deine Worte, unsere Feder", desc: "Du erzählst, was diese Person besonders macht. Wir verwandeln es in Briefe, die klingen, als hättest du sie selbst geschrieben." },
          ].map((p, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "14px", padding: "24px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", textAlign: "center" }}>
              <div style={{ fontSize: "28px", marginBottom: "10px" }}>{p.icon}</div>
              <div style={{ fontSize: "15px", fontWeight: 600, fontFamily: fonts.sans, marginBottom: "6px" }}>{p.title}</div>
              <div style={{ fontSize: "13px", fontFamily: fonts.sans, color: colors.textMuted, lineHeight: 1.7 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section ref={fR} style={{ ...fadeIn(fV), maxWidth: "700px", margin: "0 auto", padding: "60px 6%" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 400, textAlign: "center", margin: "0 0 32px" }}>Häufige Fragen</h2>
        {[
          ["Kann ich die Briefe vor dem Versand lesen?", "Ja – immer. Du erhältst jeden Brief per E-Mail zur Freigabe. Du kannst ihn lesen, bearbeiten oder stoppen. Ohne deine Freigabe wird nichts versendet."],
          ["Werden die Briefe wirklich auf Papier verschickt?", "Ja. Echte Briefe, auf hochwertigem Papier gedruckt und per Post zugestellt – in der Schweiz, Deutschland und Österreich."],
          ["Merkt der Empfänger, dass KI beteiligt ist?", "Nein. Die Briefe basieren auf deinen persönlichen Angaben und klingen authentisch. Der Empfänger erhält einen handschriftlich wirkenden Brief ohne Hinweis auf KI."],
          ["Kann ich Briefe an mich selbst bestellen?", "Ja! Wähle 'Für mich selbst' und bestimme, wer dir schreibt – z.B. ein weiser Mentor, ein verstorbener Mensch oder dein zukünftiges Ich."],
          ["Wie viel kostet es?", "Ab CHF 9.90 für einen einzelnen Probebrief. Pakete mit 5 oder 10 Briefen starten ab CHF 34.90. In Deutschland und Österreich zahlst du in Euro."],
          ["Was passiert mit meinen Daten?", "Deine Angaben werden nur für die Briefgenerierung und den Versand verwendet. Keine Weitergabe an Dritte. Details findest du in unserer Datenschutzerklärung."],
          ["Was für Anlässe eignen sich?", "Schwere Zeiten, Motivation, Wertschätzung, Meilensteine wie Geburtstage, Selbstvertrauen stärken oder persönliches Wachstum – für jeden Moment, in dem Worte zählen."],
        ].map(([q, a], i) => (
          <div key={i} style={{ borderBottom: `1px solid ${colors.borderLight}` }}>
            <div onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ padding: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <span style={{ fontSize: "15px", fontFamily: fonts.sans, fontWeight: 500 }}>{q}</span>
              <span style={{ fontSize: "20px", color: colors.textLighter, transition: "transform 0.2s", transform: openFaq === i ? "rotate(45deg)" : "none" }}>+</span>
            </div>
            <div style={{ maxHeight: openFaq === i ? "200px" : "0", overflow: "hidden", transition: "max-height 0.3s ease" }}>
              <p style={{ fontSize: "14px", fontFamily: fonts.sans, color: colors.textMuted, lineHeight: 1.7, margin: "0 0 16px" }}>{a}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ─── CTA ─── */}
      <section style={{ background: "linear-gradient(135deg, #3D5A4C, #2C4038)", padding: "80px 6%", textAlign: "center" }}>
        <h2 style={{ fontSize: "32px", fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Wer fällt dir gerade ein?</h2>
        <p style={{ fontSize: "16px", fontFamily: fonts.sans, color: "rgba(255,255,255,0.7)", margin: "0 0 32px" }}>Diese eine Person, die gerade einen Brief verdient hätte. Du weisst, wer.</p>
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => go("gift")} style={{ background: "#fff", color: colors.primary, border: "none", borderRadius: "14px", padding: "18px 36px", fontSize: "16px", fontFamily: fonts.sans, fontWeight: 600, cursor: "pointer" }}>🎁 Verschenken</button>
          <button onClick={() => go("self")} style={{ background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,0.4)", borderRadius: "14px", padding: "16px 32px", fontSize: "16px", fontFamily: fonts.sans, fontWeight: 600, cursor: "pointer" }}>Für mich selbst</button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ padding: "28px 6%", textAlign: "center", fontSize: "13px", fontFamily: fonts.sans, color: colors.textLighter }}>
        <div>© 2026 LetterLift – ein Service der Virtue Compliance GmbH, Uznach</div>
        <div style={{ marginTop: "8px", display: "flex", gap: "16px", justifyContent: "center" }}>
          <a href="/datenschutz" style={{ color: colors.textLighter, textDecoration: "none" }}>Datenschutz</a>
          <a href="/agb" style={{ color: colors.textLighter, textDecoration: "none" }}>AGB</a>
          <a href="/impressum" style={{ color: colors.textLighter, textDecoration: "none" }}>Impressum</a>
        </div>
      </footer>
      <style>{`*{box-sizing:border-box;}body{margin:0;}`}</style>
    </div>
  );
}

```

## `./src/components/LetterLift.jsx`

```jsx
// src/components/LetterLift.jsx
// ═══════════════════════════════════════════════════════
// Hauptkomponente – orchestriert Landing ↔ Onboarding
// Ersetzt den gesamten alten Monolith
// ═══════════════════════════════════════════════════════
"use client";
import { useState } from "react";
import Landing from "./landing/Landing";
import OnboardingFlow from "./onboarding/OnboardingFlow";
import { useRegion } from "../hooks/useRegion";

export default function LetterLift() {
  const { currSymbol } = useRegion();
  const [view, setView] = useState("landing"); // "landing" | "onboarding"
  const [bookingType, setBookingType] = useState(null); // "gift" | "self"

  const handleStart = (type) => {
    setBookingType(type);
    setView("onboarding");
  };

  const handleBack = () => {
    setView("landing");
    setBookingType(null);
  };

  if (view === "landing") {
    return <Landing onStart={handleStart} currSymbol={currSymbol} />;
  }

  return <OnboardingFlow bookingType={bookingType} onBack={handleBack} />;
}

```

## `./src/components/onboarding/OnboardingFlow.jsx`

```jsx
// src/components/onboarding/OnboardingFlow.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import StepRouter from "../steps/StepRouter";
import { STEP_DEFINITIONS, STEP_LABELS, shouldSkipStep, findNextStep, canProceed } from "../../data/steps";
import { INITIAL_FORM_DATA, createUpdater } from "../../lib/formState";
import { createBotDetector } from "../../lib/rateLimit";
import { useRegion } from "../../hooks/useRegion";
import { fonts, colors } from "../../styles/theme";

export default function OnboardingFlow({ bookingType, onBack }) {
  const { region, currSymbol } = useRegion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [anim, setAnim] = useState(false);
  const [vis, setVis] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [data, setData] = useState({ ...INITIAL_FORM_DATA, bookingType });
  const update = createUpdater(setData);

  // Bot detection
  const botDetector = useRef(null);
  if (!botDetector.current) botDetector.current = createBotDetector();
  const trackInteraction = () => botDetector.current?.recordInteraction("input");

  const isSelf = bookingType === "self";
  const isTrial = data.package === "trial";
  const steps = STEP_DEFINITIONS[isSelf ? "self" : "gift"];
  const rN = data.recipientName || (isSelf ? "dich" : "die Person");

  // Sichtbare Steps (ohne übersprungene)
  const visibleSteps = steps.filter((_, i) => !shouldSkipStep(steps[i], data));
  const visibleIndex = visibleSteps.indexOf(steps[step]);
  const total = visibleSteps.length;
  const currentStepId = steps[step];
  const progress = ((visibleIndex + 1) / total) * 100;

  // Animations-Trigger bei Step-Wechsel
  useEffect(() => { setVis(false); setTimeout(() => setVis(true), 60); }, [step]);

  const next = () => {
    const target = findNextStep(steps, step, 1, data);
    if (target >= steps.length) return;
    setDir(1); setAnim(true);
    setTimeout(() => { setStep(target); setAnim(false); }, 180);
  };

  const back = () => {
    const target = findNextStep(steps, step, -1, data);
    if (target < 0) return;
    setDir(-1); setAnim(true);
    setTimeout(() => { setStep(target); setAnim(false); }, 180);
  };

  const goToStep = (idx) => {
    if (idx < step) {
      setDir(-1); setAnim(true);
      setTimeout(() => { setStep(idx); setAnim(false); }, 200);
    }
  };

  const handleReset = () => {
    setStep(0);
    setPreviewText("");
    onBack();
  };

  const canGoNext = canProceed(currentStepId, data);

  return (
    <div style={{
      minHeight: "100vh", background: colors.bgGrad,
      fontFamily: fonts.serif, display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {/* Header mit Step-Dots */}
      <div style={{
        width: "100%", maxWidth: "660px", padding: "20px 28px",
        display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box",
      }}>
        <div onClick={handleReset}
          style={{ fontSize: "18px", fontWeight: 700, fontFamily: fonts.sans, color: colors.primary, cursor: "pointer" }}>
          ✉️ LetterLift
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {steps.map((s, i) => {
            if (shouldSkipStep(s, data)) return null;
            return (
              <div key={s} onClick={() => goToStep(i)}
                style={{
                  width: i === step ? "auto" : "7px", height: "7px",
                  borderRadius: i === step ? "10px" : "50%",
                  background: i < step ? colors.primaryLight : i === step ? colors.primary : colors.border,
                  cursor: i < step ? "pointer" : "default",
                  padding: i === step ? "2px 10px" : "0",
                  fontSize: "11px", fontFamily: fonts.sans, color: "#fff", fontWeight: 600, lineHeight: "7px",
                  transition: "all 0.3s", display: "flex", alignItems: "center",
                }}>
                {i === step ? STEP_LABELS[s] : ""}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: "88%", maxWidth: "580px", height: "3px",
        background: colors.borderLight, borderRadius: "100px", overflow: "hidden", marginBottom: "28px",
      }}>
        <div style={{
          height: "100%", width: progress + "%",
          background: "linear-gradient(90deg, #5B7B6A, #7C9885)",
          borderRadius: "100px", transition: "width 0.5s cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>

      {/* Step Content Card */}
      <div style={{
        background: colors.card, backdropFilter: "blur(20px)",
        borderRadius: "22px", boxShadow: "0 8px 40px rgba(0,0,0,0.05)",
        padding: "38px 36px", maxWidth: "580px", width: "88%",
        opacity: vis && !anim ? 1 : 0,
        transform: vis && !anim ? "translateY(0)" : `translateY(${dir * 14}px)`,
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <StepRouter
          stepId={currentStepId}
          data={data} update={update}
          isSelf={isSelf} recipientName={rN}
          currSymbol={currSymbol} region={region}
          trackInteraction={trackInteraction}
          previewText={previewText} setPreviewText={setPreviewText}
          goToStep={goToStep} steps={steps}
          botDetector={botDetector.current}
        />
      </div>

      {/* Navigation Buttons */}
      {currentStepId !== "summary" && (
        <div style={{
          display: "flex", justifyContent: "space-between",
          maxWidth: "580px", width: "88%", marginTop: "18px", marginBottom: "40px",
        }}>
          <button onClick={step > 0 ? back : handleReset}
            style={{ background: "transparent", color: "#7A7470", border: "none", padding: "14px 20px", fontSize: "14px", fontFamily: fonts.sans, cursor: "pointer" }}>
            ← {step > 0 ? "Zurück" : "Startseite"}
          </button>
          <button onClick={() => { trackInteraction(); next(); }}
            disabled={!canGoNext}
            style={{
              background: colors.primaryGrad, color: "#fff", border: "none", borderRadius: "12px",
              padding: "14px 32px", fontSize: "15px", fontFamily: fonts.sans, fontWeight: 600,
              cursor: canGoNext ? "pointer" : "default", opacity: canGoNext ? 1 : 0.35,
            }}>
            Weiter →
          </button>
        </div>
      )}
      {currentStepId === "summary" && (
        <div style={{ marginBottom: "40px" }}>
          <button onClick={back}
            style={{ background: "transparent", color: "#7A7470", border: "none", padding: "14px", fontSize: "14px", fontFamily: fonts.sans, cursor: "pointer" }}>
            ← Bearbeiten
          </button>
        </div>
      )}
    </div>
  );
}

```

## `./src/components/review/ReviewActiveCard.jsx`

```jsx
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

```

## `./src/components/review/ReviewFlow.jsx`

```jsx
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

```

## `./src/components/review/ReviewLetterCard.jsx`

```jsx
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

```

## `./src/components/review/ReviewStatusScreen.jsx`

```jsx
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

```

## `./src/components/shared/SectionHeader.jsx`

```jsx
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

```

## `./src/components/shared/SpeechButton.jsx`

```jsx
// src/components/shared/SpeechButton.jsx
// Mikrofon-Button für Spracheingabe in Textfeldern
"use client";
import { useState, useRef } from "react";

export default function SpeechButton({ onResult, initialValue = "" }) {
  const [isRec, setIsRec] = useState(false);
  const recRef = useRef(null);
  const startRef = useRef("");
  const hasSpeech = typeof window !== "undefined" &&
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  if (!hasSpeech) return null;

  const toggle = () => {
    if (isRec) { recRef.current?.stop(); setIsRec(false); return; }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = "de-DE";
    r.continuous = true;
    r.interimResults = true;
    recRef.current = r;
    startRef.current = initialValue;
    let final = "";

    r.onresult = (ev) => {
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        if (ev.results[i].isFinal) final += ev.results[i][0].transcript + " ";
        else interim = ev.results[i][0].transcript;
      }
      const pre = startRef.current;
      onResult((pre ? pre + " " : "") + final.trimEnd() + (interim ? " " + interim : ""));
    };
    r.onend = () => setIsRec(false);
    r.start();
    setIsRec(true);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      style={{
        position: "absolute", right: "10px", bottom: "10px",
        background: isRec ? "#E53E3E" : "#EEF4F0",
        border: "none", borderRadius: "50%",
        width: "36px", height: "36px",
        cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontSize: "18px", transition: "all 0.2s",
        boxShadow: isRec ? "0 0 0 3px rgba(229,62,62,0.3)" : "none",
      }}
    >
      {isRec ? "⏹" : "🎙️"}
    </button>
  );
}

```

## `./src/components/steps/StepAddress.jsx`

```jsx
// src/components/steps/StepAddress.jsx
"use client";
import { useState, useRef } from "react";
import SectionHeader from "../shared/SectionHeader";
import { COUNTRIES } from "../../data/constants";
import { inputStyle, labelStyle, chipStyle, fonts, colors, onFocusInput, onBlurInput } from "../../styles/theme";
import { checkAddressSearchLimit } from "../../lib/rateLimit";

export default function StepAddress({ data, update, isSelf, trackInteraction }) {
  const [addrSugg, setAddrSugg] = useState([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const addrTimer = useRef(null);

  const cc = COUNTRIES.find(c => c.id === data.country) || COUNTRIES[0];
  const plzValid = data.zip && cc.plzLen ? data.zip.replace(/\D/g, "").length === cc.plzLen : true;
  const plzError = data.zip.length > 0 && !plzValid;
  const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY || "";

  const searchAddr = (val) => {
    update("street", val);
    trackInteraction();
    if (!GEOAPIFY_KEY || val.length < 5 || data.country === "OTHER") return setAddrSugg([]);
    if (!checkAddressSearchLimit().allowed) return;
    clearTimeout(addrTimer.current);
    addrTimer.current = setTimeout(async () => {
      setAddrLoading(true);
      try {
        const countryFilter = data.country ? `&filter=countrycode:${data.country.toLowerCase()}` : "";
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(val)}&lang=de&limit=5&format=json${countryFilter}&apiKey=${GEOAPIFY_KEY}`
        );
        const json = await res.json();
        if (json.results) {
          setAddrSugg(json.results.map(r => ({
            street: (r.street || "") + (r.housenumber ? " " + r.housenumber : ""),
            zip: r.postcode || "",
            city: r.city || r.town || r.village || "",
            country: r.country_code?.toUpperCase() || data.country,
            formatted: r.formatted || "",
          })));
        }
      } catch (e) { console.error("Geoapify error:", e); }
      finally { setAddrLoading(false); }
    }, 500);
  };

  const selectAddr = (s) => {
    update("street", s.street);
    update("zip", s.zip);
    update("city", s.city);
    if (s.country && ["CH", "DE", "AT"].includes(s.country)) update("country", s.country);
    setAddrSugg([]);
  };

  return (
    <div>
      <SectionHeader
        title={isSelf ? "Wohin sollen die Briefe kommen?" : "Wohin sollen die Briefe geschickt werden?"}
        subtitle={isSelf ? "Deine Adresse bleibt vertraulich." : "Die Adresse des Empfängers."}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Land */}
        <div>
          <label style={labelStyle}>Land</label>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {COUNTRIES.map(c => (
              <span key={c.id} style={chipStyle(data.country === c.id)}
                onClick={() => {
                  update("country", c.id);
                  if (c.id !== data.country) { update("zip", ""); update("city", ""); update("street", ""); setAddrSugg([]); }
                }}>
                {c.label}
              </span>
            ))}
          </div>
        </div>

        {/* Anderes Land */}
        {data.country === "OTHER" && (
          <div style={{ padding: "16px", background: colors.primaryBg, borderRadius: "12px", border: "1px solid #D6E8DD", marginTop: "8px" }}>
            <div style={{ fontSize: "14px", fontFamily: fonts.sans, color: colors.primary, lineHeight: 1.6 }}>
              📬 Wir liefern aktuell nach CH, DE und AT. Für andere Länder schreib uns an <strong>hello@letterlift.ch</strong> – wir prüfen die Möglichkeiten!
            </div>
          </div>
        )}

        {/* Adressfelder */}
        {data.country !== "OTHER" && (
          <>
            <div style={{ position: "relative" }}>
              <label style={labelStyle}>Strasse & Hausnummer</label>
              <input
                style={inputStyle} value={data.street}
                onChange={e => searchAddr(e.target.value)}
                placeholder={cc.streetPh || "Strasse 1"}
                onFocus={onFocusInput}
                onBlur={e => { onBlurInput(e); setTimeout(() => setAddrSugg([]), 200); }}
                autoComplete="off"
              />
              {/* Autocomplete-Dropdown */}
              {addrSugg.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                  background: "#fff", border: `1px solid ${colors.border}`,
                  borderRadius: "0 0 12px 12px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  maxHeight: "200px", overflowY: "auto",
                }}>
                  {addrSugg.map((s, i) => (
                    <div key={i} onMouseDown={() => selectAddr(s)}
                      style={{
                        padding: "10px 14px", fontSize: "13px", fontFamily: fonts.sans,
                        color: colors.text, cursor: "pointer",
                        borderBottom: i < addrSugg.length - 1 ? "1px solid #F0EDE8" : "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = colors.surfaceMuted}
                      onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                    >
                      <div style={{ fontWeight: 500 }}>{s.street}</div>
                      <div style={{ fontSize: "12px", color: colors.textLight, marginTop: "2px" }}>{s.zip} {s.city}</div>
                    </div>
                  ))}
                </div>
              )}
              {addrLoading && (
                <div style={{ position: "absolute", right: "12px", top: "38px", fontSize: "12px", color: colors.textLight, fontFamily: fonts.sans }}>...</div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: "0 0 120px" }}>
                <label style={labelStyle}>PLZ</label>
                <input
                  style={{ ...inputStyle, borderColor: plzError ? colors.error : colors.border }}
                  value={data.zip}
                  onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, cc.plzLen || 5); update("zip", v); }}
                  placeholder={cc.plzPh || "PLZ"} maxLength={cc.plzLen || 5}
                  onFocus={onFocusInput} onBlur={onBlurInput}
                />
                {plzError && (
                  <div style={{ fontSize: "11px", color: colors.error, fontFamily: fonts.sans, marginTop: "4px" }}>
                    {cc.plzLen} Stellen erforderlich
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Ort</label>
                <input style={inputStyle} value={data.city}
                  onChange={e => update("city", e.target.value)}
                  placeholder={cc.cityPh || "Ort"}
                  onFocus={onFocusInput} onBlur={onBlurInput} />
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{
        marginTop: "18px", padding: "14px 16px", background: "#F0F5EE",
        borderRadius: "12px", fontSize: "13px", fontFamily: fonts.sans,
        color: colors.primary, lineHeight: 1.6,
      }}>
        🔒 Die Adresse wird ausschliesslich für den Briefversand verwendet und nicht an Dritte weitergegeben.
      </div>
    </div>
  );
}

```

## `./src/components/steps/StepContext.jsx`

```jsx
// src/components/steps/StepContext.jsx
"use client";
import SectionHeader from "../shared/SectionHeader";
import SpeechButton from "../shared/SpeechButton";
import { getOccasionCopy } from "../../data/occasionCopy";
import { textareaStyle, labelStyle, optionalHint, onFocusInput, onBlurInput } from "../../styles/theme";

export default function StepContext({ data, update, isSelf, recipientName, trackInteraction }) {
  const copy = getOccasionCopy(data.occasion);
  const rN = recipientName;

  return (
    <div>
      <SectionHeader
        title={copy.contextQ(rN, isSelf)}
        subtitle="Je ehrlicher, desto wirkungsvoller."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Situationsbeschreibung */}
        <div>
          <label style={labelStyle}>{copy.contextQ(rN, isSelf)}</label>
          <div style={{ position: "relative" }}>
            <textarea
              style={{ ...textareaStyle, paddingRight: "50px" }}
              value={data.contextText}
              onChange={e => { update("contextText", e.target.value); trackInteraction(); }}
              placeholder={copy.contextPh(rN, isSelf)}
              onFocus={onFocusInput} onBlur={onBlurInput}
            />
            <SpeechButton
              initialValue={data.contextText}
              onResult={val => update("contextText", val)}
            />
          </div>
        </div>

        {/* Ziel */}
        <div>
          <label style={labelStyle}>Ziel <span style={optionalHint}>optional</span></label>
          <textarea
            style={{ ...textareaStyle, minHeight: "70px" }}
            value={data.goal}
            onChange={e => update("goal", e.target.value)}
            placeholder={copy.goalPh(rN, isSelf)}
            onFocus={onFocusInput} onBlur={onBlurInput}
          />
        </div>
      </div>
    </div>
  );
}

```

## `./src/components/steps/StepDelivery.jsx`

```jsx
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

```

## `./src/components/steps/StepMemories.jsx`

```jsx
// src/components/steps/StepMemories.jsx
"use client";
import SectionHeader from "../shared/SectionHeader";
import SpeechButton from "../shared/SpeechButton";
import { getOccasionCopy, DEFAULT_COPY } from "../../data/occasionCopy";
import { textareaStyle, labelStyle, fonts, colors, onFocusInput, onBlurInput } from "../../styles/theme";

export default function StepMemories({ data, update, isSelf }) {
  const copy = getOccasionCopy(data.occasion);
  const memQs = copy.memQ || DEFAULT_COPY.memQ;
  const memPhs = copy.memPh || DEFAULT_COPY.memPh;

  const filledCount = [data.mem1, data.mem2, data.mem3, ...(data.memExtra || [])]
    .filter(s => s && s.trim().length >= 20).length;
  const totalMems = 3 + (data.memExtra || []).length;
  const recommendedMems = 3;

  const hasSpeech = typeof window !== "undefined" &&
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  // Hilfsfunktion: Memory-Feld lesen
  const getMemValue = (i) => i === 0 ? data.mem1 : i === 1 ? data.mem2 : data.mem3;
  const getMemKey = (i) => i === 0 ? "mem1" : i === 1 ? "mem2" : "mem3";

  return (
    <div>
      <SectionHeader
        title={isSelf ? "Deine besonderen Momente" : "Eure gemeinsame Geschichte"}
        subtitle={isSelf ? "Das Herzstück deiner Briefe." : "Je mehr Erinnerungen, desto persönlicher die Briefe."}
      />

      {/* Tipp-Box */}
      <div style={{
        padding: "14px 16px", background: "#FFF8F0", borderRadius: "12px",
        border: "1px solid #F0E4D4", marginBottom: "18px",
        fontSize: "13px", fontFamily: fonts.sans, color: colors.warningText, lineHeight: 1.6,
      }}>
        <strong>⭐ Hier entstehen die besten Briefe.</strong> Mindestens 1 Erinnerung nötig – aber je mehr, desto persönlicher.
        Nimm dir 5 Minuten. Jede Erinnerung wird zu einem eigenen, einzigartigen Briefmoment.
        <span>
          {filledCount >= recommendedMems
            ? " 💚 Genug für richtig persönliche Briefe!"
            : filledCount >= 1
              ? ` 🟢 Gut! Noch ${recommendedMems - filledCount} Erinnerung${recommendedMems - filledCount > 1 ? "en" : ""} für optimale Ergebnisse.`
              : ` 🟡 Noch 1 Erinnerung nötig.`}
        </span>
      </div>

      {/* Mikrofon-Tipp */}
      {hasSpeech && (
        <div style={{
          padding: "10px 16px", background: colors.primaryBg, borderRadius: "12px",
          marginBottom: "18px", fontSize: "13px", fontFamily: fonts.sans,
          color: colors.primary, display: "flex", alignItems: "center", gap: "8px",
        }}>
          🎙️ <strong>Tipp:</strong> Drücke das Mikrofon und erzähl einfach drauflos – oft fällt einem mehr ein als beim Tippen.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* 3 Standard-Erinnerungen */}
        {[0, 1, 2].map(i => (
          <div key={i}>
            <label style={labelStyle}>{memQs[i](isSelf)}</label>
            <div style={{ position: "relative" }}>
              <textarea
                style={{ ...textareaStyle, minHeight: "100px", paddingRight: "50px" }}
                value={getMemValue(i)}
                onChange={e => update(getMemKey(i), e.target.value)}
                placeholder={memPhs[i](isSelf)}
                onFocus={onFocusInput} onBlur={onBlurInput}
              />
              <SpeechButton
                initialValue={getMemValue(i)}
                onResult={val => update(getMemKey(i), val)}
              />
            </div>
          </div>
        ))}

        {/* Extra-Erinnerungen */}
        {(data.memExtra || []).map((mx, i) => (
          <div key={`extra-${i}`}>
            <label style={{ ...labelStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Erinnerung {i + 4}</span>
              <span
                onClick={() => {
                  const ne = [...(data.memExtra || [])];
                  ne.splice(i, 1);
                  update("memExtra", ne);
                }}
                style={{ color: colors.info, cursor: "pointer", fontSize: "11px", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}
              >
                Entfernen
              </span>
            </label>
            <div style={{ position: "relative" }}>
              <textarea
                style={{ ...textareaStyle, minHeight: "100px", paddingRight: "50px" }}
                value={mx}
                onChange={e => {
                  const ne = [...(data.memExtra || [])];
                  ne[i] = e.target.value;
                  update("memExtra", ne);
                }}
                placeholder="Noch ein besonderer Moment..."
                onFocus={onFocusInput} onBlur={onBlurInput}
              />
              <SpeechButton
                initialValue={mx}
                onResult={val => {
                  const ne = [...(data.memExtra || [])];
                  ne[i] = val;
                  update("memExtra", ne);
                }}
              />
            </div>
          </div>
        ))}

        {/* Weitere hinzufügen */}
        {totalMems < 6 && (
          <button
            onClick={() => update("memExtra", [...(data.memExtra || []), ""])}
            style={{
              background: "none", border: `1.5px dashed ${colors.border}`, borderRadius: "12px",
              padding: "14px", fontSize: "14px", fontFamily: fonts.sans,
              color: colors.primaryLight, cursor: "pointer", fontWeight: 500, transition: "all 0.2s",
            }}
          >
            + Weitere Erinnerung hinzufügen
          </button>
        )}
      </div>

      {/* Inspirations-Box */}
      <div style={{
        marginTop: "14px", padding: "14px 16px", background: colors.surfaceMuted,
        borderRadius: "12px", fontSize: "13px", fontFamily: fonts.sans, color: colors.textMuted,
      }}>
        <strong>💡</strong> Insider-Witze · Reisen · Mutmomente · Liebevolle Macken · Rituale · Peinliche Geschichten
      </div>
    </div>
  );
}

```

## `./src/components/steps/StepOccasion.jsx`

```jsx
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

```

## `./src/components/steps/StepPackage.jsx`

```jsx
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

```

## `./src/components/steps/StepPersona.jsx`

```jsx
// src/components/steps/StepPersona.jsx
"use client";
import SectionHeader from "../shared/SectionHeader";
import { PERSONAS } from "../../data/constants";
import { inputStyle, textareaStyle, labelStyle, optionalHint, cardSelectStyle, fonts, colors, onFocusInput, onBlurInput } from "../../styles/theme";

export default function StepPersona({ data, update }) {
  return (
    <div>
      <SectionHeader
        title="Wer soll dir die Briefe schreiben?"
        subtitle="Wähle eine Stimme. Die Briefe klingen, als kämen sie von dieser Person."
      />

      {/* Persona-Auswahl */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {PERSONAS.map(pt => (
          <div key={pt.id} onClick={() => update("persona", pt.id)} style={cardSelectStyle(data.persona === pt.id)}>
            <div style={{ fontSize: "24px", marginTop: "2px" }}>{pt.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 600, fontFamily: fonts.sans }}>{pt.label}</div>
              <div style={{ fontSize: "12px", color: colors.textLight, fontFamily: fonts.sans, marginTop: "2px" }}>{pt.desc}</div>
            </div>
            {data.persona === pt.id && <div style={{ color: colors.primaryLight, fontSize: "17px", fontWeight: 700 }}>✔</div>}
          </div>
        ))}
      </div>

      {/* Detail-Felder (je nach Persona) */}
      {data.persona && (
        <div style={{ marginTop: "16px" }}>
          <label style={labelStyle}>
            {data.persona === "deceased" ? "Name der Person"
              : data.persona === "future_self" ? "Wie spricht dein zukünftiges Ich?"
              : "Name / Beschreibung"}
          </label>
          <input
            style={inputStyle}
            value={data.personaName}
            onChange={e => update("personaName", e.target.value)}
            placeholder={PERSONAS.find(p => p.id === data.persona)?.ph}
            onFocus={onFocusInput} onBlur={onBlurInput}
          />

          {data.persona === "deceased" && (
            <div style={{ marginTop: "12px", padding: "14px 16px", background: colors.surfaceMuted, borderRadius: "12px", fontSize: "13px", fontFamily: fonts.sans, color: colors.textMuted, lineHeight: 1.6 }}>
              <strong>🕊️</strong> Behutsam im Ton dieser Person. Erzähl typische Sätze, Kosenamen, Eigenheiten.
            </div>
          )}

          {data.persona === "future_self" && (
            <div style={{ marginTop: "12px", padding: "14px 16px", background: colors.primaryBg, borderRadius: "12px", fontSize: "13px", fontFamily: fonts.sans, color: colors.primary, lineHeight: 1.6 }}>
              <strong>🔮</strong> Schreibt aus einer Position der Stärke – es hat geschafft, was du anstrebst.
            </div>
          )}

          {(data.persona === "custom_persona" || data.persona === "fictional") && (
            <div style={{ marginTop: "12px" }}>
              <label style={labelStyle}>Stimme beschreiben <span style={optionalHint}>optional</span></label>
              <textarea
                style={{ ...textareaStyle, minHeight: "80px" }}
                value={data.personaDesc}
                onChange={e => update("personaDesc", e.target.value)}
                placeholder="z.B. Spricht ruhig, nennt mich 'Kleines'..."
                onFocus={onFocusInput} onBlur={onBlurInput}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

```

## `./src/components/steps/StepPersonality.jsx`

```jsx
// src/components/steps/StepPersonality.jsx
"use client";
import SectionHeader from "../shared/SectionHeader";
import { HUMOR_TYPES } from "../../data/constants";
import { inputStyle, labelStyle, chipStyle, fonts, colors, onFocusInput, onBlurInput } from "../../styles/theme";

export default function StepPersonality({ data, update, isSelf, recipientName }) {
  const rN = recipientName;

  return (
    <div>
      <SectionHeader
        title={"Persönlichkeit" + (isSelf ? "" : " von " + rN)}
        subtitle="Details machen den Unterschied."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Hobbies */}
        <div>
          <label style={labelStyle}>Hobbies</label>
          <input style={inputStyle} value={data.hobbies}
            onChange={e => update("hobbies", e.target.value)}
            placeholder="z.B. Yoga, Backen"
            onFocus={onFocusInput} onBlur={onBlurInput} />
        </div>

        {/* Humor-Typ */}
        <div>
          <label style={labelStyle}>Humor-Typ</label>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {HUMOR_TYPES.map(h => (
              <span key={h.id}
                style={chipStyle(data.humor.includes(h.id))}
                onClick={() => update("humor",
                  data.humor.includes(h.id)
                    ? data.humor.filter(x => x !== h.id)
                    : [...data.humor, h.id]
                )}>
                {h.label}
              </span>
            ))}
          </div>
        </div>

        {/* Stärken */}
        <div>
          <label style={labelStyle}>Stärken</label>
          <input style={inputStyle} value={data.strengths}
            onChange={e => update("strengths", e.target.value)}
            placeholder="z.B. Loyal, mutig"
            onFocus={onFocusInput} onBlur={onBlurInput} />
        </div>

        {/* Bezugspersonen */}
        <div>
          <label style={labelStyle}>Bezugspersonen</label>
          <input style={inputStyle} value={data.importantPeople}
            onChange={e => update("importantPeople", e.target.value)}
            placeholder="z.B. Schwester Lena, bester Freund Marco, Oma Helga"
            onFocus={onFocusInput} onBlur={onBlurInput} />
        </div>

        {/* No-Go-Themen */}
        <div>
          <label style={labelStyle}>No-Go-Themen</label>
          <input style={inputStyle} value={data.noGo}
            onChange={e => update("noGo", e.target.value)}
            placeholder="z.B. Ex nicht erwähnen"
            onFocus={onFocusInput} onBlur={onBlurInput} />
          <div style={{ fontSize: "11px", color: colors.info, fontFamily: fonts.sans, marginTop: "5px" }}>
            ⚠️ Themen, die nicht vorkommen sollen.
          </div>
        </div>
      </div>
    </div>
  );
}

```

## `./src/components/steps/StepPreview.jsx`

```jsx
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

```

## `./src/components/steps/StepRecipient.jsx`

```jsx
// src/components/steps/StepRecipient.jsx
"use client";
import SectionHeader from "../shared/SectionHeader";
import { RELATIONSHIPS, LANGUAGES, GENDERS } from "../../data/constants";
import { inputStyle, labelStyle, optionalHint, chipStyle, onFocusInput, onBlurInput } from "../../styles/theme";

export default function StepRecipient({ data, update, isSelf, trackInteraction }) {
  return (
    <div>
      <SectionHeader
        title={isSelf ? "Über dich" : "Wem sollen die Briefe Kraft geben?"}
        subtitle={isSelf
          ? "Damit die Briefe sich anfühlen, als kämen sie von jemandem, der dich kennt."
          : "Je mehr wir erfahren, desto persönlicher."}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Vorname */}
        <div>
          <label style={labelStyle}>Vorname</label>
          <input
            style={inputStyle}
            placeholder={isSelf ? "Dein Vorname" : "z.B. Sarah"}
            value={data.recipientName}
            onChange={e => { update("recipientName", e.target.value); trackInteraction(); }}
            onFocus={onFocusInput} onBlur={onBlurInput}
          />
        </div>

        {/* Geschlecht */}
        <div>
          <label style={labelStyle}>
            Geschlecht <span style={{ fontSize: "11px", color: "#B0A9A3", fontWeight: 400 }}>(für korrekte Ansprache)</span>
          </label>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {GENDERS.map(([k, l]) => (
              <span key={k} style={chipStyle(data.gender === k)} onClick={() => update("gender", k)}>{l}</span>
            ))}
          </div>
        </div>

        {/* Spitzname */}
        <div>
          <label style={labelStyle}>Spitzname <span style={optionalHint}>optional</span></label>
          <input
            style={inputStyle}
            placeholder="z.B. Sari"
            value={data.nickname}
            onChange={e => update("nickname", e.target.value)}
            onFocus={onFocusInput} onBlur={onBlurInput}
          />
        </div>

        {/* Beziehung (nur bei Geschenk) */}
        {!isSelf && (
          <div>
            <label style={labelStyle}>Beziehung</label>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {RELATIONSHIPS.map(r => (
                <span key={r} style={chipStyle(data.relationship === r)} onClick={() => update("relationship", r)}>{r}</span>
              ))}
            </div>
          </div>
        )}

        {/* Sprache */}
        <div>
          <label style={labelStyle}>Sprache</label>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {LANGUAGES.map(([k, l]) => (
              <span key={k} style={chipStyle(data.language === k)} onClick={() => update("language", k)}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

```

## `./src/components/steps/StepRouter.jsx`

```jsx
// src/components/steps/StepRouter.jsx
// Rendert die richtige Step-Komponente basierend auf der aktuellen Step-ID
import StepRecipient from "./StepRecipient";
import StepOccasion from "./StepOccasion";
import StepContext from "./StepContext";
import StepPersonality from "./StepPersonality";
import StepMemories from "./StepMemories";
import StepPersona from "./StepPersona";
import StepSender from "./StepSender";
import StepStyle from "./StepStyle";
import StepPackage from "./StepPackage";
import StepDelivery from "./StepDelivery";
import StepAddress from "./StepAddress";
import StepPreview from "./StepPreview";
import StepSummary from "./StepSummary";

export default function StepRouter({ stepId, ...props }) {
  switch (stepId) {
    case "recipient":   return <StepRecipient {...props} />;
    case "occasion":    return <StepOccasion {...props} />;
    case "context":     return <StepContext {...props} />;
    case "personality": return <StepPersonality {...props} />;
    case "memories":    return <StepMemories {...props} />;
    case "persona":     return <StepPersona {...props} />;
    case "sender":      return <StepSender {...props} />;
    case "style":       return <StepStyle {...props} />;
    case "package":     return <StepPackage {...props} />;
    case "delivery":    return <StepDelivery {...props} />;
    case "address":     return <StepAddress {...props} />;
    case "preview":     return <StepPreview {...props} />;
    case "summary":     return <StepSummary {...props} />;
    default:            return null;
  }
}

```

## `./src/components/steps/StepSender.jsx`

```jsx
// src/components/steps/StepSender.jsx
"use client";
import SectionHeader from "../shared/SectionHeader";
import { inputStyle, textareaStyle, labelStyle, optionalHint, fonts, colors, onFocusInput, onBlurInput } from "../../styles/theme";

export default function StepSender({ data, update, recipientName }) {
  return (
    <div>
      <SectionHeader
        title="Über dich als Absender"
        subtitle="Damit die Briefe authentisch klingen."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div>
          <label style={labelStyle}>Dein Vorname</label>
          <input style={inputStyle} value={data.senderName}
            onChange={e => update("senderName", e.target.value)}
            placeholder="z.B. Lena"
            onFocus={onFocusInput} onBlur={onBlurInput} />
        </div>
        <div>
          <label style={labelStyle}>
            Was möchtest du {recipientName} mitgeben? <span style={optionalHint}>optional</span>
          </label>
          <textarea
            style={{ ...textareaStyle, minHeight: "80px" }}
            value={data.senderMessage}
            onChange={e => update("senderMessage", e.target.value)}
            placeholder={recipientName + " soll wissen, dass ich da bin."}
            onFocus={onFocusInput} onBlur={onBlurInput}
          />
        </div>
        <div style={{
          padding: "14px 16px", background: colors.primaryBg, borderRadius: "12px",
          fontSize: "13px", fontFamily: fonts.sans, color: colors.primary, lineHeight: 1.6,
        }}>
          <strong>✉️ Volle Kontrolle:</strong> Du erhältst jeden Brief vor dem Versand und kannst ihn bearbeiten.
        </div>
      </div>
    </div>
  );
}

```

## `./src/components/steps/StepStyle.jsx`

```jsx
// src/components/steps/StepStyle.jsx
"use client";
import SectionHeader from "../shared/SectionHeader";
import { STYLES } from "../../data/constants";
import { textareaStyle, labelStyle, cardSelectStyle, fonts, colors, onFocusInput, onBlurInput } from "../../styles/theme";

export default function StepStyle({ data, update }) {
  const arr = Array.isArray(data.style) ? data.style : [];

  const toggleStyle = (id) => {
    if (id === "custom") {
      update("style", [id]);
    } else {
      const prev = arr.filter(x => x !== "custom");
      update("style", prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Wie sollen die Briefe klingen?"
        subtitle="Mehrere Stile kombinierbar."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {STYLES.map(s => {
          const selected = arr.includes(s.id);
          return (
            <div key={s.id} onClick={() => toggleStyle(s.id)} style={cardSelectStyle(selected)}>
              <div style={{ fontSize: "22px", width: "34px", textAlign: "center", flexShrink: 0 }}>{s.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 600, fontFamily: fonts.sans }}>{s.label}</div>
                <div style={{ fontSize: "12px", color: colors.textLight, fontFamily: fonts.sans }}>{s.desc}</div>
              </div>
              {selected && <div style={{ color: colors.primaryLight, fontSize: "17px", fontWeight: 700 }}>✔</div>}
            </div>
          );
        })}
      </div>

      {arr.includes("custom") && (
        <div style={{ marginTop: "14px" }}>
          <label style={labelStyle}>Beschreibe den Stil</label>
          <textarea
            style={textareaStyle}
            value={data.customStyleDesc}
            onChange={e => update("customStyleDesc", e.target.value)}
            placeholder="z.B. Wie meine Oma – liebevoll, altmodisch..."
            onFocus={onFocusInput} onBlur={onBlurInput}
          />
        </div>
      )}
    </div>
  );
}

```

## `./src/components/steps/StepSummary.jsx`

```jsx
// src/components/steps/StepSummary.jsx
"use client";
import { useState } from "react";
import { PACKAGES, PAPER_OPTIONS, FREQUENCIES, OCCASIONS, STYLES, PERSONAS } from "../../data/constants";
import { preCheckoutSafetyCheck } from "../../lib/safety";
import { checkCheckoutLimit, createBotDetector } from "../../lib/rateLimit";
import { createCheckoutAPI } from "../../lib/api";
import { calculateTotal } from "../../lib/formState";
import { inputStyle, labelStyle, fonts, colors } from "../../styles/theme";

export default function StepSummary({ data, update, isSelf, currSymbol, region, previewText, trackInteraction, botDetector }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const cs = currSymbol;
  const isTrial = data.package === "trial";

  const pk = PACKAGES.find(q => q.id === data.package);
  const oc = OCCASIONS.find(o => o.id === data.occasion);
  const st = Array.isArray(data.style) ? data.style.map(s => STYLES.find(x => x.id === s)?.label).join(", ") : "";
  const fr = FREQUENCIES.find(f => f.id === data.frequency);
  const pa = PAPER_OPTIONS.find(q => q.id === data.paperOption);
  const pe = isSelf ? PERSONAS.find(q => q.id === data.persona) : null;
  const total = calculateTotal(data, PACKAGES, PAPER_OPTIONS);

  const rows = [
    ["Typ", isSelf ? "Für mich selbst" : "Geschenk"],
    ["Empfänger", data.recipientName + (data.nickname ? " (" + data.nickname + ")" : "")],
    ...(!isSelf && data.relationship ? [["Beziehung", data.relationship]] : []),
    ...(isSelf && pe ? [["Briefschreiber", pe.label + (data.personaName ? " – " + data.personaName : "")]] : []),
    ...(!isSelf ? [["Absender", data.senderName || "–"]] : []),
    ["Anlass", oc?.label || "–"],
    ["Stil", st || "–"],
    ["Paket", pk ? (pk.id === "trial" ? "Trial · 1 Brief" : pk.name + " · " + pk.letters + " Briefe") : "–"],
    ...(isTrial ? [] : [["Frequenz", fr?.label || "–"]]),
    ["Papier", pa?.label || "Standard"],
    ["Adresse", data.street + ", " + data.zip + " " + data.city],
  ];

  const handleCheckout = async () => {
    // Email-Validierung
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setErrorMsg("Bitte gültige E-Mail-Adresse eingeben"); return;
    }
    // Safety check
    const safetyResult = preCheckoutSafetyCheck(data);
    if (!safetyResult.canProceed) {
      setErrorMsg("⚠️ " + safetyResult.criticalFlags[0].message + " Bitte überprüfe deine Angaben im Feld «" + safetyResult.criticalFlags[0].field + "»."); return;
    }
    // Bot detection
    const botResult = botDetector?.analyze();
    if (botResult?.isBot) {
      console.warn("Bot detected:", botResult.reasons);
      setErrorMsg("Etwas ist schiefgelaufen. Bitte lade die Seite neu."); return;
    }
    // Rate limit
    const limit = checkCheckoutLimit();
    if (!limit.allowed) { setErrorMsg(limit.message); return; }

    setErrorMsg(""); setLoading(true);
    try {
      const res = await createCheckoutAPI({ ...data, _hp: undefined, region, previewLetter: previewText || null });
      if (res.url) window.location.href = res.url;
      else { setErrorMsg("Fehler beim Erstellen der Bestellung. Bitte versuche es erneut."); setLoading(false); }
    } catch (err) {
      setErrorMsg("Verbindungsfehler: " + err.message); setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "22px" }}>
        <div style={{ fontSize: "40px", marginBottom: "6px" }}>✉️</div>
        <h2 style={{ fontSize: "24px", fontWeight: 400, margin: "0 0 6px", fontFamily: fonts.serif }}>Fast geschafft!</h2>
      </div>

      {/* Zusammenfassungs-Tabelle */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        {rows.map(([l, v], i) => (
          <div key={l} style={{
            display: "flex", justifyContent: "space-between", padding: "11px 14px",
            background: i % 2 === 0 ? colors.surfaceMuted : "transparent", borderRadius: "8px",
          }}>
            <span style={{ fontSize: "11.5px", fontFamily: fonts.sans, fontWeight: 600, color: colors.label, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</span>
            <span style={{ fontSize: "14px", fontFamily: fonts.sans, color: colors.text, textAlign: "right", maxWidth: "60%" }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Preis */}
      <div style={{ marginTop: "20px", padding: "18px 20px", background: colors.surfaceMuted, borderRadius: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontSize: "13px", fontFamily: fonts.sans, color: colors.textMuted }}>{pk?.name}</span>
          <span style={{ fontSize: "13px", fontFamily: fonts.sans }}>{cs}{pk?.price.toFixed(2)}</span>
        </div>
        {pa?.price > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "13px", fontFamily: fonts.sans, color: colors.textMuted }}>{pa.label}</span>
            <span style={{ fontSize: "13px", fontFamily: fonts.sans }}>{cs}{pa.price.toFixed(2)}</span>
          </div>
        )}
        <div style={{ borderTop: `1px solid ${colors.borderLight}`, paddingTop: "8px", marginTop: "4px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "15px", fontFamily: fonts.sans, fontWeight: 700 }}>Total</span>
          <span style={{ fontSize: "20px", fontFamily: fonts.sans, fontWeight: 700, color: colors.primary }}>{cs}{total.toFixed(2)}</span>
        </div>
      </div>

      {/* E-Mail */}
      <div style={{ marginTop: "16px" }}>
        <label style={labelStyle}>E-Mail (für Bestätigung & Brieffreigabe)</label>
        <input
          style={{ ...inputStyle }} type="email"
          value={data.email || ""}
          onChange={e => { update("email", e.target.value); trackInteraction(); }}
          placeholder="deine@email.ch"
        />
        <div style={{ fontSize: "12px", fontFamily: fonts.sans, color: colors.textLight, marginTop: "6px", lineHeight: 1.5 }}>
          Hierhin senden wir dir jeden Brief zur Freigabe, bevor er verschickt wird.
        </div>
      </div>

      {/* Honeypot */}
      <input type="text" name="ll_website" autoComplete="off" tabIndex={-1} aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
        value={data._hp || ""}
        onChange={e => { update("_hp", e.target.value); botDetector?.setHoneypotTriggered(); }}
      />

      {/* Error */}
      {errorMsg && (
        <div style={{ marginTop: "12px", padding: "12px 16px", background: colors.errorBg, borderRadius: "10px", border: `1px solid ${colors.errorBorder}`, fontSize: "13px", fontFamily: fonts.sans, color: colors.errorText }}>
          {errorMsg}
        </div>
      )}

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={loading}
        style={{
          width: "100%", marginTop: "20px", padding: "18px",
          background: loading ? "#8A9E90" : colors.primaryGrad,
          color: "#fff", border: "none", borderRadius: "14px",
          fontSize: "16px", fontFamily: fonts.sans, fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.2s", opacity: loading ? 0.8 : 1,
        }}
      >
        {loading ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
            Wird vorbereitet...
          </span>
        ) : (
          "✉️ " + (isTrial ? "Trial-Brief bestellen" : isSelf ? "Briefserie starten" : "Verschenken") + " – " + cs + total.toFixed(2)
        )}
      </button>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{ fontSize: "11px", color: colors.textLighter, fontFamily: fonts.sans, textAlign: "center", marginTop: "10px" }}>
        Stripe · Zufriedenheitsgarantie · Jederzeit pausierbar
      </p>
    </div>
  );
}

```

## `./src/data/constants.js`

```js
// src/data/constants.js
// ═══════════════════════════════════════════════════════
// Alle Auswahl-Daten an einem Ort
// Neue Anlässe, Pakete, Stile etc. → hier hinzufügen
// ═══════════════════════════════════════════════════════

export const OCCASIONS = [
  { id: "tough_times", emoji: "🌧️", label: "Durch schwere Zeiten", desc: "Trennung, Trauer, Krankheit" },
  { id: "motivation",  emoji: "🎯", label: "Motivation & Ziele",   desc: "Sport, Prüfung, Karriere" },
  { id: "confidence",  emoji: "💪", label: "Selbstvertrauen",      desc: "Mut aufbauen, Neuanfang" },
  { id: "appreciation", emoji: "💛", label: "Wertschätzung",       desc: "Danke sagen, Liebe zeigen" },
  { id: "celebration", emoji: "🎉", label: "Feiern & Ermutigen",   desc: "Geburtstag, Meilenstein" },
  { id: "growth",      emoji: "🌱", label: "Persönliches Wachstum", desc: "Achtsamkeit, Balance" },
];

export const HUMOR_TYPES = [
  { id: "dry",       label: "Trocken" },
  { id: "wordplay",  label: "Wortspiele" },
  { id: "warm",      label: "Warmherzig" },
  { id: "sarcastic", label: "Sarkastisch" },
  { id: "none",      label: "Kein Humor" },
];

export const STYLES = [
  { id: "warm",       emoji: "🤗", label: "Warm & herzlich",         desc: "Wie von der besten Freundin" },
  { id: "motivating", emoji: "⚡", label: "Motivierend & direkt",    desc: "Wie ein Coach" },
  { id: "poetic",     emoji: "✨", label: "Reflektierend & poetisch", desc: "Nachdenklich, bildreich" },
  { id: "humorous",   emoji: "😄", label: "Humorvoll & leicht",      desc: "Lustig mit Tiefe" },
  { id: "wise",       emoji: "🌿", label: "Weise & gelassen",        desc: "Wie ein Mentor" },
  { id: "custom",     emoji: "✏️", label: "Eigener Stil",             desc: "Beschreibe den Ton" },
];

export const PACKAGES = [
  { id: "trial",   name: "Trial",   letters: 1,  price: 9.9,  pl: "9.90", trial: true },
  { id: "impuls",  name: "Impuls",  letters: 5,  price: 34.9, pl: "6.98" },
  { id: "classic", name: "Classic", letters: 10, price: 59.9, pl: "5.99", pop: true },
  { id: "journey", name: "Journey", letters: 15, price: 79.9, pl: "5.33" },
];

export const FREQUENCIES = [
  { id: "daily",  label: "Täglich",       desc: "Intensive Journey",      icon: "📬" },
  { id: "every3", label: "Alle 3 Tage",   desc: "Raum zum Nachdenken",    icon: "📅" },
  { id: "weekly", label: "Wöchentlich",    desc: "Längere Begleitung",     icon: "🗓️" },
];

export const PAPER_OPTIONS = [
  { id: "standard",    label: "Standard",           desc: "120g-Papier, weisses Kuvert",             price: 0,    icon: "📄" },
  { id: "premium",     label: "Premium-Papier",     desc: "200g, crèmefarbenes Kuvert",              price: 9.9,  icon: "📜" },
  { id: "handwritten", label: "Handschrift-Edition", desc: "Premium-Papier + Handschrift-Font",      price: 19.9, icon: "✒️" },
];

export const RELATIONSHIPS = [
  "Beste/r Freund/in", "Partner/in", "Mutter", "Vater",
  "Schwester", "Bruder", "Tochter", "Sohn", "Kolleg/in", "Andere",
];

export const PERSONAS = [
  { id: "bestfriend",     emoji: "👋", label: "Dein bester Freund / beste Freundin", desc: "Jemand, der dich seit Jahren kennt",          ph: "z.B. Mein bester Freund Tom" },
  { id: "mentor",         emoji: "🧭", label: "Ein weiser Mentor",                   desc: "Coach, Lehrer oder Vorbild",                  ph: "z.B. Mein alter Trainer" },
  { id: "deceased",       emoji: "🕊️", label: "Eine verstorbene Person",             desc: "Jemand, dessen Stimme du vermisst",           ph: "z.B. Meine Grossmutter" },
  { id: "future_self",    emoji: "🔮", label: "Dein zukünftiges Ich",                desc: "Die Version von dir, die es geschafft hat",   ph: "z.B. Ich in 5 Jahren" },
  { id: "fictional",      emoji: "📖", label: "Eine fiktive Figur",                  desc: "Aus Büchern, Filmen, Serien",                 ph: "z.B. Gandalf, Ted Lasso" },
  { id: "custom_persona", emoji: "✨", label: "Eigene Persona",                      desc: "Beschreibe frei",                             ph: "z.B. Eine warmherzige Stimme" },
];

export const COUNTRIES = [
  { id: "CH",    label: "🇨🇭 Schweiz",        plzLen: 4, plzPh: "8001",  streetPh: "Bahnhofstrasse 42",  cityPh: "Zürich" },
  { id: "DE",    label: "🇩🇪 Deutschland",     plzLen: 5, plzPh: "10115", streetPh: "Friedrichstrasse 42", cityPh: "Berlin" },
  { id: "AT",    label: "🇦🇹 Österreich",      plzLen: 4, plzPh: "1010",  streetPh: "Stephansplatz 1",    cityPh: "Wien" },
  { id: "OTHER", label: "🌍 Anderes Land anfragen" },
];

export const LANGUAGES = [
  ["de", "🇨🇭 Deutsch"],
  ["en", "🇬🇧 English"],
  ["fr", "🇫🇷 Français"],
  ["it", "🇮🇹 Italiano"],
];

export const GENDERS = [
  ["f", "♀ Weiblich"],
  ["m", "♂ Männlich"],
  ["x", "✦ Divers"],
];

```

## `./src/data/heroLetters.js`

```js
// src/data/heroLetters.js
// ═══════════════════════════════════════════════════════
// Vorschau-Briefe für die Landing Page (Hero-Bereich)
// Pro Anlass ein Beispielbrief – Reihenfolge = OCCASIONS
// ═══════════════════════════════════════════════════════

export const HERO_LETTERS = [
  {
    greeting: "Liebe Lauri,",
    body: "ich denke an dich. Nicht weil ich muss – sondern weil du mir wichtig bist. Erinnerst du dich an Portugal? Als wir uns komplett verfahren haben und du einfach aus dem Auto gestiegen bist? Keine gemeinsame Sprache, aber du hast mit Händen und Füssen geredet, bis die ganze Familie uns zum Essen eingeladen hat. Das bist du – du findest immer einen Weg. Auch jetzt. Zürich, neue Arbeit, Mila und Noah – du wuppst das. Nicht weil es leicht ist. Sondern weil du du bist.",
    sign: "Deine Natalie",
  },
  {
    greeting: "Hey Sandro,",
    body: "hier spricht dein zukünftiges Ich. Der, der den Marathon geschafft hat. Ich weiss, bei Kilometer 25 wird dein Kopf sagen: Hör auf. Erinnerst du dich an deinen ersten 10er vor zwei Jahren? Seitenstechen ab Kilometer 6. Du wolltest aufhören. Dann lief eine Fremde neben dir und sagte: Wir laufen zusammen ins Ziel. Du hast im Ziel geweint. Dein Körper kann es – das sagt Marco, das weisst du. Jetzt muss dein Kopf folgen.",
    sign: "Sandro nach dem Marathon",
  },
  {
    greeting: "Liebe Simi,",
    body: "ich sehe, wie du zweifelst. Ob der Schritt richtig war, ob du gut genug bist. Aber weisst du was? Letztes Jahr hat dir ein ehemaliger Schüler geschrieben. Er ist jetzt 19 und hat gesagt: Ohne Sie hätte ich das Gymnasium nie geschafft. Du hast an mich geglaubt, als niemand sonst es tat. Du hast den ganzen Abend geweint. Das bist du, Simi. Du veränderst Leben. Und jetzt ist es Zeit, dein eigenes zu verändern.",
    sign: "Dein Thomas",
  },
  {
    greeting: "Lieber Papi,",
    body: "ich sage es zu selten. Aber wenn ich an Sonntagmorgen denke, rieche ich frischen Zopf. Seit ich denken kann, bist du in der Küche gestanden. Und das Puppenhaus – mit den funktionierenden Fensterläden und der kleinen Veranda. Drei Monate hast du daran gearbeitet, abends in der Werkstatt. Ich habe es bis heute. Du machst nie grosses Aufheben. Aber ich möchte, dass du weisst: Wir haben es gesehen. Alles.",
    sign: "Deine Sarah",
  },
  {
    greeting: "Liebste Lena,",
    body: "40! Erinnerst du dich an die Liste, die wir mit 20 geschrieben haben? Einmal ans Meer ziehen, ein Buch lesen pro Woche, irgendwann den Mut haben, Nein zu sagen. Du hast mehr geschafft als draufstand – und das meiste davon stand gar nicht auf der Liste. Die Dinge, die wirklich zählen, plant man nicht. Man lebt sie einfach.",
    sign: "Deine Anna",
  },
  {
    greeting: "Liebe Ayla,",
    body: "neue Stadt, neues Leben. Ich kenne dieses Gefühl – halb Angst, halb Vorfreude. Erinnerst du dich an unseren letzten Abend auf dem Lindenhof? Wir haben auf Zürich geschaut und ich habe gesagt: In einem Jahr sitzen wir auf einem Dach in Lissabon und lachen darüber. Das machen wir. Und bis dahin: Wenn das Geld knapp wird und du dich einsam fühlst – erinnere dich daran, warum du gegangen bist. Das Licht am Morgen. Das Gefühl, frei zu sein.",
    sign: "Deine Mira",
  },
];

```

## `./src/data/occasionCopy.js`

```js
// src/data/occasionCopy.js
// ═══════════════════════════════════════════════════════
// Texte & Fragen pro Anlass
// Neuer Anlass? → Hier Block hinzufügen + in constants.js
// ═══════════════════════════════════════════════════════

const makeCopy = ({ contextQ, contextPh, goalPh, freqRec, memQ, memPh }) => ({
  contextQ, contextPh, goalPh, freqRec, memQ, memPh,
});

export const OCCASION_COPY = {
  tough_times: makeCopy({
    contextQ:  (n, s) => s ? "Was durchlebst du gerade?" : `Was durchlebt ${n} gerade?`,
    contextPh: (n, s) => s ? "z.B. Ich stecke seit Monaten in einem Tief..." : `z.B. ${n} hat sich getrennt und fühlt sich einsam...`,
    goalPh:    (n, s) => s ? "z.B. Wieder wissen, dass es weitergeht." : `z.B. Dass ${n} merkt, dass sie nicht allein ist.`,
    freqRec: "every3",
    memQ: [
      s => s ? "Gab es einen Moment, in dem du gemerkt hast: Ich bin stärker als ich dachte?" : "Was habt ihr gemeinsam durchgestanden?",
      s => s ? "Welcher Mensch hat dir in einer schweren Phase geholfen – und wie?" : "Gab es einen Moment, der eure Beziehung vertieft hat?",
      s => s ? "Welches Erlebnis gibt dir heute noch Kraft?" : "Was weiss nur ihr zwei – ein Geheimnis, ein Insider?",
    ],
    memPh: [
      s => s ? "z.B. Als ich die Kündigung bekam und trotzdem am nächsten Tag..." : "z.B. Als ihr Vater krank war, bin ich einfach hingefahren und wir haben die ganze Nacht geredet...",
      s => s ? "z.B. Mein Bruder hat mich damals einfach abgeholt und nichts gesagt..." : "z.B. Nach dem Streit letztes Jahr haben wir beide geweint und wussten: Das hier ist echt.",
      s => s ? "z.B. Die Wanderung am Bodensee, wo plötzlich alles klar wurde..." : "z.B. Unser Codewort wenn einer von uns Hilfe braucht...",
    ],
  }),

  motivation: makeCopy({
    contextQ:  (n, s) => s ? "Was ist dein Ziel?" : `Was ist ${n}s Ziel?`,
    contextPh: (n, s) => s ? "z.B. Ich trainiere für meinen ersten Marathon..." : `z.B. ${n} bereitet sich auf eine wichtige Prüfung vor...`,
    goalPh:    (n, s) => s ? "z.B. Dass ich am Start stehe und weiss: Ich bin bereit." : `z.B. Dass ${n} mit Selbstvertrauen in die Prüfung geht.`,
    freqRec: "daily",
    memQ: [
      s => s ? "Wann hast du zuletzt etwas geschafft, woran du gezweifelt hast?" : `Was hat ${s ? "dich" : "die Person"} schon bewiesen?`,
      s => s ? "Welcher Moment hat dich am meisten geprägt?" : "Welche gemeinsame Erinnerung zeigt ihre Stärke?",
      s => s ? "Gibt es einen Satz oder ein Erlebnis, das dich immer wieder motiviert?" : "Was würdest du ihr sagen, wenn sie aufgeben will?",
    ],
    memPh: [
      s => s ? "z.B. Letztes Jahr die Präsentation vor 200 Leuten – ich war so nervös, aber es lief..." : "z.B. Sie hat 3 Monate für die Prüfung gelernt und mit Bestnote bestanden...",
      s => s ? "z.B. Der Moment als ich alleine nach Japan gereist bin..." : "z.B. Wie sie beim Halbmarathon ab km 15 kämpfte aber durchhielt...",
      s => s ? "z.B. 'Du musst nicht perfekt sein, nur mutig.'" : "z.B. 'Erinnerst du dich, wie du damals...'",
    ],
  }),

  confidence: makeCopy({
    contextQ:  (n, s) => s ? "Wobei fehlt dir Selbstvertrauen?" : `Wobei fehlt ${n} Selbstvertrauen?`,
    contextPh: (n, s) => s ? "z.B. Neuer Job, fühle mich den Aufgaben nicht gewachsen..." : `z.B. ${n} hat sich beruflich verändert und zweifelt...`,
    goalPh:    (n, s) => s ? "z.B. An mich glauben." : `z.B. Dass ${n} ihre Stärken wieder sieht.`,
    freqRec: "every3",
    memQ: [
      s => s ? "Wann hast du dich zuletzt richtig kompetent gefühlt?" : "Wann hast du gesehen, wie sie über sich hinausgewachsen ist?",
      s => s ? "Wer glaubt an dich – und was hat diese Person gesagt?" : "Gibt es einen Moment, in dem du dachtest: Wow, das ist sie wirklich?",
      s => s ? "Welche Eigenschaft unterschätzt du an dir am meisten?" : "Was kann sie besser als sie selbst glaubt?",
    ],
    memPh: [
      s => s ? "z.B. Bei der Projektpräsentation, als alle danach klatschten..." : "z.B. Ihre Rede an der Hochzeit – alle hatten Gänsehaut...",
      s => s ? "z.B. Meine Chefin hat gesagt: 'Du bist besser als du denkst.'" : "z.B. Als sie ihren ersten Kunden coachte und er danach sagte...",
      s => s ? "z.B. Ich kann gut zuhören – das sagen alle, aber ich glaub es nie..." : "z.B. Ihre Geduld mit Kindern – sie merkt gar nicht wie besonders das ist...",
    ],
  }),

  appreciation: makeCopy({
    contextQ:  (n, s) => s ? "Wofür bist du dankbar?" : `Was schätzt du an ${n}?`,
    contextPh: (n, s) => s ? "z.B. Ich möchte mir bewusster machen, was gut läuft..." : `z.B. ${n} ist immer für alle da, bekommt aber selten Danke gesagt...`,
    goalPh:    (n, s) => s ? "z.B. Dankbarkeit und Zufriedenheit." : `z.B. Dass ${n} sich gesehen und wertgeschätzt fühlt.`,
    freqRec: "weekly",
    memQ: [
      s => s ? "Welcher Moment hat dir gezeigt, was wirklich wichtig ist?" : "Wann hat sie etwas getan, das du nie vergessen wirst?",
      s => s ? "Worüber lachst du heute noch?" : "Was ist euer Running Gag oder Insider-Witz?",
      s => s ? "Welche kleine Geste eines anderen Menschen hat dich berührt?" : "Was macht sie, ohne es zu merken, das anderen guttut?",
    ],
    memPh: [
      s => s ? "z.B. Als ich krank war und meine Nachbarin einfach Suppe gebracht hat..." : "z.B. Als ich umgezogen bin, stand sie morgens um 6 vor der Tür – ohne dass ich gefragt hatte...",
      s => s ? "z.B. Der verbrannte Kuchen an meinem 30. Geburtstag..." : "z.B. 'Das Ding mit dem Parkhaus in Italien' – wir müssen jedes Mal lachen...",
      s => s ? "z.B. Wie mein Vater jeden Sonntag frischen Zopf backt..." : "z.B. Sie merkt immer, wenn es jemandem nicht gut geht – bevor die Person es selbst weiss...",
    ],
  }),

  celebration: makeCopy({
    contextQ:  (n, s) => s ? "Was feierst du?" : "Was gibt es zu feiern?",
    contextPh: (n, s) => s ? "z.B. Ich werde 40 und möchte das bewusst erleben." : `z.B. ${n} hat einen Meilenstein erreicht.`,
    goalPh:    (n, s) => s ? "z.B. Mich selbst feiern." : `z.B. Dass ${n} merkt, wie weit sie gekommen ist.`,
    freqRec: "daily",
    memQ: [
      s => s ? "Was ist dein stolzester Moment der letzten Jahre?" : "Was hat sie auf dem Weg dorthin erlebt?",
      s => s ? "Welcher Mensch hat diesen Erfolg mitermöglicht?" : "Welche lustige Geschichte verbindet ihr?",
      s => s ? "Was hat dich der Weg dorthin gelehrt?" : "Was würdest du ihr über den Weg sagen, den sie gegangen ist?",
    ],
    memPh: [
      s => s ? "z.B. Den Job zu kündigen und mein eigenes Ding zu starten..." : "z.B. Die ersten Monate in der neuen Stadt, als alles unsicher war...",
      s => s ? "z.B. Ohne meinen Bruder hätte ich den Mut nie gehabt..." : "z.B. Der Abend vor der Prüfung, als wir Pizza bestellt und gelacht haben...",
      s => s ? "z.B. Dass es okay ist, Angst zu haben und trotzdem zu springen..." : "z.B. 'Du hast so oft gezweifelt – und schau wo du jetzt stehst.'",
    ],
  }),

  growth: makeCopy({
    contextQ:  (n, s) => s ? "Woran arbeitest du gerade?" : `Woran arbeitet ${n}?`,
    contextPh: (n, s) => s ? "z.B. Achtsamer leben, weniger Autopilot..." : `z.B. ${n} ist in einer Umbruchphase...`,
    goalPh:    (n, s) => s ? "z.B. Klarer wissen was ich will." : `z.B. Dass ${n} Klarheit gewinnt.`,
    freqRec: "every3",
    memQ: [
      s => s ? "Welcher Wendepunkt hat dich verändert?" : "Was hat sie zuletzt verändert oder losgelassen?",
      s => s ? "Welche Gewohnheit oder Erkenntnis hat einen Unterschied gemacht?" : "Wie hat sich eure Beziehung über die Zeit verändert?",
      s => s ? "Wo willst du in einem Jahr stehen?" : "Was siehst du in ihr, das sie vielleicht noch nicht sieht?",
    ],
    memPh: [
      s => s ? "z.B. Der Moment, als ich gemerkt habe: Ich muss nicht allen gefallen..." : "z.B. Als sie den toxischen Job gekündigt hat – obwohl alle dagegen waren...",
      s => s ? "z.B. Jeden Morgen 10 Minuten Stille – klingt banal, hat alles verändert..." : "z.B. Früher war sie immer die Stille – heute steht sie für sich ein...",
      s => s ? "z.B. Weniger Perfektion, mehr Mut zum Unperfekten..." : "z.B. Wie ruhig und klar sie geworden ist – das ist ihr gar nicht bewusst...",
    ],
  }),
};

export const DEFAULT_COPY = {
  contextQ:  (n, s) => s ? "Was beschäftigt dich?" : `Erzähl uns von ${n}`,
  contextPh: () => "",
  goalPh:    () => "",
  freqRec: "every3",
  memQ: [
    s => s ? "Beschreibe einen besonderen Moment." : "Was habt ihr zusammen erlebt, worüber ihr heute noch redet?",
    s => s ? "Was hat dich geprägt?" : "Gibt es eine Geschichte, die nur ihr zwei kennt?",
    s => s ? "Was gibt dir Kraft?" : "Was ist typisch für sie – eine Macke, ein Ritual, ein Spruch?",
  ],
  memPh: [
    s => s ? "z.B. Der Tag, an dem alles anders wurde..." : "z.B. Die Reise nach Lissabon, als wir...",
    s => s ? "z.B. Ein Gespräch, das mich verändert hat..." : "z.B. Unser Ritual jeden Freitagabend...",
    s => s ? "z.B. Wenn ich an diesen Ort denke, spüre ich..." : "z.B. Sie sagt immer '...' – das bringt mich jedes Mal zum Lachen...",
  ],
};

/** Hilfsfunktion: Copy für Anlass holen (mit Fallback) */
export const getOccasionCopy = (occasionId) =>
  OCCASION_COPY[occasionId] || DEFAULT_COPY;

```

## `./src/data/steps.js`

```js
// src/data/steps.js
// ═══════════════════════════════════════════════════════
// Step-Konfiguration für den Onboarding-Flow
// Neuen Step hinzufügen → hier eintragen + Komponente bauen
// ═══════════════════════════════════════════════════════

export const STEP_DEFINITIONS = {
  self: [
    "recipient", "occasion", "context", "personality", "memories",
    "persona", "style", "package", "delivery", "address", "preview", "summary",
  ],
  gift: [
    "recipient", "occasion", "context", "personality", "memories",
    "sender", "style", "package", "delivery", "address", "preview", "summary",
  ],
};

export const STEP_LABELS = {
  recipient:   "Empfänger",
  occasion:    "Anlass",
  context:     "Kontext",
  personality: "Persönlichkeit",
  memories:    "Geschichte",
  persona:     "Persona",
  sender:      "Absender",
  style:       "Stil",
  package:     "Paket",
  delivery:    "Frequenz",
  address:     "Adresse",
  preview:     "Vorschau",
  summary:     "Zusammenfassung",
};

/** Soll ein Step übersprungen werden? */
export function shouldSkipStep(stepId, data) {
  if (stepId === "delivery" && data.package === "trial") return true;
  return false;
}

/** Nächsten gültigen Step finden (überspringt irrelevante) */
export function findNextStep(steps, currentIndex, direction, data) {
  let idx = currentIndex + direction;
  while (idx >= 0 && idx < steps.length && shouldSkipStep(steps[idx], data)) {
    idx += direction;
  }
  return idx;
}

/** Kann der User zum nächsten Step? (Validierung) */
export function canProceed(stepId, data) {
  switch (stepId) {
    case "recipient":
      return data.recipientName.length > 0;
    case "occasion":
      return !!data.occasion;
    case "context":
      return data.contextText.length > 30;
    case "personality":
      return data.hobbies.length > 2 && data.strengths.length > 2 && data.humor.length > 0;
    case "memories": {
      const filled = [data.mem1, data.mem2, data.mem3, ...(data.memExtra || [])]
        .filter(s => s && s.trim().length >= 20).length;
      return filled >= 1;
    }
    case "style":
      return Array.isArray(data.style) && data.style.length > 0;
    case "package":
      return !!data.package;
    case "delivery":
      return !!data.frequency;
    case "persona":
      return !!data.persona;
    case "sender":
      return (data.senderName || "").length > 0;
    case "address": {
      if (data.country === "OTHER") return false;
      const plzReq = { CH: 4, DE: 5, AT: 4 }[data.country] || 4;
      return data.street.length > 3 && data.city.length > 1 &&
        data.country.length > 0 && data.zip.replace(/\D/g, "").length === plzReq;
    }
    default:
      return true;
  }
}

```

## `./src/hooks/useInView.js`

```js
// src/hooks/useInView.js
// Intersection Observer Hook für Scroll-Animationen
import { useState, useEffect, useRef } from "react";

export function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

```

## `./src/hooks/useRegion.js`

```js
// src/hooks/useRegion.js
// Region & Währungs-Erkennung (Cookie / Domain)
import { useState, useEffect } from "react";

export function useRegion() {
  const [region, setRegion] = useState("CH");

  useEffect(() => {
    const h = window.location.hostname;
    if (h.endsWith(".de") || h.endsWith(".at")) { setRegion("EU"); return; }
    const m = document.cookie.match(/ll_region=(\w+)/);
    if (m) setRegion(m[1]);
  }, []);

  const currency   = region === "CH" ? "CHF" : "EUR";
  const currSymbol = region === "CH" ? "CHF " : "€";

  return { region, currency, currSymbol };
}

```

## `./src/lib/api.js`

```js
// src/lib/api.js
// ═══════════════════════════════════════════════════════
// API-Helfer für Supabase Edge Functions
// ═══════════════════════════════════════════════════════

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

async function callEdgeFunction(name, body) {
  const res = await fetch(`${BASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

/** KI-Vorschau generieren */
export const fetchAIPreviewAPI = (orderData) =>
  callEdgeFunction("generate-preview", { orderData });

/** Checkout-Session erstellen */
export const createCheckoutAPI = (orderData) =>
  callEdgeFunction("create-checkout", { orderData });

/** Review-API (get_order, approve, edit, stop) */
export const reviewAPI = (body) =>
  callEdgeFunction("review-letter", body);

```

## `./src/lib/formState.js`

```js
// src/lib/formState.js
// ═══════════════════════════════════════════════════════
// Initialer State und Update-Logik für das Bestellformular
// ═══════════════════════════════════════════════════════

export const INITIAL_FORM_DATA = {
  bookingType: null,
  recipientName: "",
  nickname: "",
  gender: "",
  relationship: "",
  language: "de",
  occasion: null,
  contextText: "",
  goal: "",
  hobbies: "",
  music: "",
  humor: [],
  strengths: "",
  importantPeople: "",
  noGo: "",
  memories: "",
  mem1: "",
  mem2: "",
  mem3: "",
  memExtra: [],
  style: [],
  customStyleDesc: "",
  senderName: "",
  senderMessage: "",
  persona: null,
  personaName: "",
  personaDesc: "",
  package: null,
  frequency: "weekly",
  paperOption: "standard",
  street: "",
  zip: "",
  city: "",
  country: "CH",
  email: "",
  _hp: "",
};

/**
 * Erzeugt eine Update-Funktion, die automatisch
 * Erinnerungen zusammenfasst wenn mem-Felder sich ändern.
 */
export function createUpdater(setData) {
  return (key, value) => {
    setData((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-combine memory fields
      if (["mem1", "mem2", "mem3", "memExtra"].includes(key)) {
        const parts = [next.mem1, next.mem2, next.mem3, ...(next.memExtra || [])]
          .filter(s => s && s.trim().length > 0);
        next.memories = parts.map((p, i) => `${i + 1}) ${p.trim()}`).join("\n\n");
      }
      return next;
    });
  };
}

/** Gesamtpreis berechnen */
export function calculateTotal(data, packages, paperOptions) {
  const pkg = packages.find(p => p.id === data.package);
  const paper = paperOptions.find(p => p.id === data.paperOption);
  return (pkg?.price || 0) + (paper?.price || 0);
}

```

## `./src/lib/preview.js`

```js
// src/lib/preview.js
// ═══════════════════════════════════════════════════════
// Client-seitige Vorschau-Generierung (Fallback für KI)
// ═══════════════════════════════════════════════════════

export function generatePreview(d, isSelf) {
  const nk = d.nickname || d.recipientName || "du";
  const styles = Array.isArray(d.style) ? d.style : [];
  const isH = styles.includes("humorous");
  const isP = styles.includes("poetic");
  const isW = styles.includes("warm") || styles.length === 0;

  let greeting = isSelf ? "Hey " + nk + "," : "Liebe/r " + nk + ",";
  if (isSelf && d.persona === "deceased") greeting = "Mein/e liebe/r " + nk + ",";
  if (isSelf && d.persona === "future_self") greeting = "Hey " + nk + " –";

  const sender = isSelf
    ? (d.personaName || "Jemand, der an dich glaubt")
    : (d.senderName || "Jemand, der dich kennt");

  const hobbies = d.hobbies ? d.hobbies.split(",").map(h => h.trim()).filter(Boolean) : [];
  const mem = (d.memories || "").trim();
  const strength = d.strengths ? d.strengths.split(",")[0]?.trim() : null;

  let lines = [];

  if (mem.length > 20) {
    lines.push("Ich musste heute an etwas denken." + (isH ? " Und ja, ich musste schmunzeln." : ""));
    lines.push("Erinnerst du dich? " + (mem.length > 100 ? mem.substring(0, 100) + "..." : mem));
  } else {
    lines.push("Ich weiss, die letzten Wochen waren nicht einfach." +
      (isH ? ' Und nein, ich sage dir nicht, dass «alles gut wird».' : ""));
  }

  if (hobbies[0]) {
    lines.push(
      (isP ? "Es gibt Momente beim " + hobbies[0] + ", die alles leiser machen." : "Warst du beim " + hobbies[0] + "?") +
      " Manchmal hilft es."
    );
  }

  if (strength) {
    lines.push("Was ich " + (isSelf ? "an mir" : "an dir") + " bewundere: " + strength + ". Das vergisst man manchmal.");
  }

  if (d.occasion === "tough_times") lines.push(isW ? "Ich drücke dich ganz fest." : "Du bist stärker, als du denkst.");
  else if (d.occasion === "motivation") lines.push(isW ? "Ich glaube an dich." : "Jeder Schritt zählt.");
  else lines.push(isW ? "Ich denke an dich." : "Manche Menschen machen die Welt heller.");

  const closing = isW ? "Ganz fest gedrückt –" : isP ? "In Gedanken bei dir –" : "Alles Gute –";

  return greeting + "\n\n" + lines.join("\n\n") + "\n\n" + closing + "\n" + sender;
}

```

## `./src/lib/quality.js`

```js
// src/lib/quality.js
// ═══════════════════════════════════════════════════════
// Qualitäts-Score Berechnung für Profil-Daten
// Wird in der Vorschau angezeigt
// ═══════════════════════════════════════════════════════

export function assessQuality(d) {
  let score = 0, max = 0;
  const issues = [], suggestions = [];

  function check(value, weight, required, label, minLen, minWords) {
    max += weight;
    if (!value || (typeof value === "string" && value.trim().length === 0)) {
      if (!required) suggestions.push(label);
      return;
    }
    const t = typeof value === "string" ? value.trim() : String(value);
    const words = t.split(/\s+/).filter(Boolean);
    const unique = new Set(words.map(x => x.toLowerCase()));
    const avgLen = words.length > 0 ? words.reduce((a, x) => a + x.length, 0) / words.length : 0;

    // Gibberish detection
    if (/(.){4,}/.test(t) || (unique.size === 1 && words.length > 2) || /^[^a-zA-ZäöüÄÖÜ]+$/.test(t)) {
      issues.push(label + ": Inhalt nicht verwertbar"); return;
    }
    if (words.length > 3 && unique.size < words.length * 0.3) {
      issues.push(label + ": Viele Wiederholungen"); score += weight * 0.2; return;
    }
    if (avgLen > 15 || (avgLen < 2 && words.length > 3)) {
      issues.push(label + ": Text ungewöhnlich"); score += weight * 0.3; return;
    }
    if (minLen && t.length < minLen) { score += weight * 0.5; suggestions.push(label + " vertiefen"); return; }
    if (minWords && words.length < minWords) { score += weight * 0.5; suggestions.push(label + " ausführlicher"); return; }
    score += weight;
  }

  check(d.recipientName, 2, true, "Name", 2);
  check(d.occasion ? "set" : null, 2, true, "Anlass");
  check(d.contextText, 4, true, "Situation", 30, 8);
  check(d.goal, 2, false, "Ziel");
  check(d.hobbies, 2, false, "Hobbies", 5);
  check(d.strengths, 2, false, "Stärken", 5);

  const memFields = [d.mem1, d.mem2, d.mem3, ...(d.memExtra || [])].filter(Boolean);
  const memText = memFields.join(" ");
  check(memText.length > 0 ? memText : null, 5, false, "Erinnerungen", 30, 8);

  const goodMems = memFields.filter(m => m && m.trim().length >= 20).length;
  if (goodMems >= 3) { score += 2; max += 2; }
  else if (goodMems >= 2) { score += 1; max += 2; }
  else { max += 2; }

  check(d.importantPeople, 1, false, "Bezugspersonen");
  check(d.humor?.length > 0 ? "set" : null, 1, false, "Humor-Typ");

  const ratio = max > 0 ? score / max : 0;
  const briefCount = d.package === "journey" ? 15 : d.package === "classic" ? 10 : d.package === "impuls" ? 5 : 1;

  let level, color, emoji, message;
  if (ratio < 0.3) {
    level = "Unzureichend"; color = "#E53E3E"; emoji = "🔴";
    message = "Zu wenig Material.";
  } else if (ratio < 0.5) {
    level = "Basis"; color = "#DD6B20"; emoji = "🟠";
    message = briefCount > 5 ? `Für ${briefCount} Briefe fehlen noch Erinnerungen.` : "Grundlage da – mehr Details machen es unvergesslich.";
  } else if (ratio < 0.7) {
    level = "Gut"; color = "#D69E2E"; emoji = "🟡";
    message = goodMems < 2 ? "Gute Basis! Noch eine Erinnerung für richtig persönliche Briefe." : "Gute Basis! Noch etwas mehr Detail macht es perfekt.";
  } else if (ratio < 0.85) {
    level = "Sehr gut"; color = "#38A169"; emoji = "🟢";
    message = `Stark! Genug Material für ${Math.min(goodMems * 3, briefCount)} persönliche Briefe.`;
  } else {
    level = "Exzellent"; color = "#276749"; emoji = "💚";
    message = "Perfekt! Genug Material für Briefe, die wirklich berühren.";
  }

  return { score: Math.round(ratio * 100), level, color, emoji, message, issues, suggestions };
}

```

## `./src/lib/rateLimit.js`

```js
// src/lib/rateLimit.js
// Client-side rate limiting and bot detection for LetterLift

const counters = {};

export function rateLimit(action, maxCalls, windowMs) {
  const now = Date.now();
  if (!counters[action]) counters[action] = [];
  counters[action] = counters[action].filter((t) => now - t < windowMs);
  if (counters[action].length >= maxCalls) return false;
  counters[action].push(now);
  return true;
}

export function checkPreviewLimit() {
  const allowed = rateLimit("preview", 3, 10 * 60 * 1000);
  return { allowed, message: allowed ? null : "Du hast die maximale Anzahl Vorschauen erreicht. Bitte warte ein paar Minuten." };
}

export function checkCheckoutLimit() {
  const allowed = rateLimit("checkout", 3, 5 * 60 * 1000);
  return { allowed, message: allowed ? null : "Zu viele Versuche. Bitte warte einen Moment und versuche es erneut." };
}

export function checkAddressSearchLimit() {
  const allowed = rateLimit("address", 30, 5 * 60 * 1000);
  return { allowed };
}

export function createBotDetector() {
  const startTime = Date.now();
  const interactions = [];
  let honeypotTriggered = false;

  return {
    recordInteraction(type) { interactions.push({ type, time: Date.now() }); },
    setHoneypotTriggered() { honeypotTriggered = true; },
    analyze() {
      const reasons = [];
      if (Date.now() - startTime < 30 * 1000) reasons.push("flow_too_fast");
      if (honeypotTriggered) reasons.push("honeypot");
      if (interactions.length < 5) reasons.push("no_interactions");
      if (interactions.length > 3) {
        const span = interactions[interactions.length - 1].time - interactions[0].time;
        if (span < 2000) reasons.push("burst_interactions");
      }
      return { isBot: reasons.length >= 2, isSuspicious: reasons.length >= 1, reasons };
    },
  };
}

```

## `./src/lib/safety.js`

```js
// src/lib/safety.js
// Input screening and red flag detection for LetterLift
// Implements pre-checkout safety checks (12-criteria concept)

const THREAT_PATTERNS = [
  /\b(du wirst es bereuen|ich weiss wo du|ich finde dich|pass auf|warte ab)\b/i,
  /\b(ich beobachte dich|ich sehe alles|du entkommst|das wirst du büssen)\b/i,
  /\b(ich mach dich|ich bring dich|du bist tot|ich zerstör)\b/i,
  /\b(wenn du mich wirklich lieben würdest|du bist schuld|ohne mich bist du nichts)\b/i,
  /\b(das hast du dir selbst zuzuschreiben|du verdienst es nicht besser)\b/i,
  /\b(niemand wird dich je|du wirst nie jemand|kein wunder dass)\b/i,
  /\b(ich habe gesehen dass du|ich weiss was du|ich habe dich beobachtet)\b/i,
  /\b(ich war bei dir|ich stand vor deiner|ich bin dir gefolgt)\b/i,
];

const INSULT_PATTERNS = [
  /\b(du bist so dumm|du bist wertlos|du taugst nichts|du bist erbärmlich)\b/i,
  /\b(du bist hässlich|du bist fett|du bist peinlich|du ekelst mich)\b/i,
  /\b(schlampe|hurensohn|wichser|missgeburt|arschloch|fotze|bastard)\b/i,
  /\b(versager|loser|idiot|vollidiot|trottel|depp)\b/i,
];

const PRESSURE_PATTERNS = [
  /\b(du musst|du hast keine wahl|wenn du nicht bis|letzte chance)\b/i,
  /\b(es ist deine schuld|du bist mir schuldig|du schuldest mir)\b/i,
  /\b(jetzt oder nie|ich gebe dir zeit bis|dann ist es vorbei)\b/i,
];

function scanText(text, patterns) {
  if (!text || typeof text !== "string") return [];
  const normalized = text.toLowerCase().trim();
  const matches = [];
  for (const pattern of patterns) {
    if (pattern.test(normalized)) matches.push(pattern.source);
  }
  return matches;
}

export function screenInputs(data) {
  const flags = [];
  const textFields = [
    { key: "contextText", label: "Situation" },
    { key: "senderMessage", label: "Nachricht" },
    { key: "goal", label: "Ziel" },
    { key: "mem1", label: "Erinnerung 1" },
    { key: "mem2", label: "Erinnerung 2" },
    { key: "mem3", label: "Erinnerung 3" },
    { key: "personaDesc", label: "Persona" },
    { key: "customStyleDesc", label: "Stil" },
  ];

  if (Array.isArray(data.memExtra)) {
    data.memExtra.forEach((_, i) => {
      textFields.push({ key: `memExtra[${i}]`, label: `Erinnerung ${i + 4}` });
    });
  }

  for (const field of textFields) {
    const value = field.key.startsWith("memExtra[")
      ? data.memExtra?.[parseInt(field.key.match(/\d+/)[0])]
      : data[field.key];
    if (!value) continue;

    const threats = scanText(value, THREAT_PATTERNS);
    if (threats.length > 0) {
      flags.push({ type: "threat", severity: "critical", field: field.label,
        message: "Dieser Text enthält Formulierungen, die als Drohung oder Einschüchterung verstanden werden könnten." });
    }

    const insults = scanText(value, INSULT_PATTERNS);
    if (insults.length > 0) {
      flags.push({ type: "insult", severity: "critical", field: field.label,
        message: "Dieser Text enthält beleidigende oder herabsetzende Sprache." });
    }

    const pressure = scanText(value, PRESSURE_PATTERNS);
    if (pressure.length > 0) {
      flags.push({ type: "pressure", severity: "warning", field: field.label,
        message: "Dieser Text enthält Druck-Formulierungen, die in einem Brief unangemessen wirken könnten." });
    }
  }

  return { safe: flags.filter(f => f.severity === "critical").length === 0, flags };
}

export function checkRedFlags(data) {
  const warnings = [];

  if (data.relationship === "Andere" && data.occasion === "appreciation" && !data.nickname?.trim()) {
    warnings.push({ type: "suspicious_constellation", severity: "info",
      message: "Tipp: Ein Spitzname macht die Briefe persönlicher und zeigt dem Empfänger, dass sie wirklich von dir kommen." });
  }

  if ((data.occasion === "tough_times" || data.occasion === "confidence") && !data.noGo?.trim() && data.contextText?.length > 20) {
    if (/\b(trennung|ex-|getrennt|scheidung|verlassen|schluss gemacht)\b/i.test(data.contextText)) {
      warnings.push({ type: "separation_no_boundaries", severity: "warning",
        message: "Bei sensiblen Themen wie Trennungen empfehlen wir, No-Go-Themen zu definieren – damit die Briefe einfühlsam bleiben.",
        action: "noGo" });
    }
  }

  if (data.bookingType === "self" && data.persona === "deceased") {
    warnings.push({ type: "deceased_persona", severity: "info",
      message: "Briefe von verstorbenen Personen werden besonders behutsam geschrieben. Je mehr du über ihre Art zu sprechen erzählst, desto authentischer wird es." });
  }

  if (data.contextText?.trim().length < 50 && (data.package === "classic" || data.package === "journey")) {
    warnings.push({ type: "thin_context", severity: "warning",
      message: `Für ${data.package === "journey" ? "15" : "10"} einzigartige Briefe empfehlen wir, die Situation ausführlicher zu beschreiben.`,
      action: "context" });
  }

  return warnings;
}

export function preCheckoutSafetyCheck(data) {
  const inputResult = screenInputs(data);
  const redFlags = checkRedFlags(data);
  const criticalFlags = inputResult.flags.filter(f => f.severity === "critical");
  const warnings = [
    ...inputResult.flags.filter(f => f.severity === "warning"),
    ...redFlags,
  ];
  return { canProceed: criticalFlags.length === 0, criticalFlags, warnings };
}

```

## `./src/lib/supabase.js`

```js
// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function callFunction(name, body) {
  const res = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `Function ${name} failed`);
  }
  return res.json();
}

```

## `./src/styles/theme.js`

```js
// src/styles/theme.js
// ═══════════════════════════════════════════════════════
// Design Tokens – zentrale Styling-Konstanten
// Ändere Farben, Fonts oder Radii hier → wirkt überall
// ═══════════════════════════════════════════════════════

export const colors = {
  // Primär (Grün-Palette)
  primary:       "#3D5A4C",
  primaryLight:  "#5B7B6A",
  primaryBg:     "#EEF4F0",
  primaryBorder: "#C6E0CC",
  primaryGrad:   "linear-gradient(135deg, #3D5A4C, #5B7B6A)",

  // Neutrals
  bg:            "#FBF8F5",
  bgGrad:        "linear-gradient(165deg, #FBF8F5 0%, #F3EDE7 100%)",
  card:          "rgba(255,255,255,0.88)",
  cardSolid:     "#fff",
  surface:       "#FDFCFA",
  surfaceMuted:  "#F6F3EF",
  surfaceWarm:   "#FFF8F0",

  // Text
  text:          "#2C2C2C",
  textDark:      "#2D2926",
  textMuted:     "#6B6360",
  textLight:     "#8A8480",
  textLighter:   "#B0A9A3",
  label:         "#8A7F76",

  // Borders
  border:        "#D6CFC8",
  borderLight:   "#E0DAD4",

  // Feedback
  error:         "#E53E3E",
  errorBg:       "#FFF5F5",
  errorBorder:   "#FED7D7",
  errorText:     "#C53030",
  warning:       "#DD6B20",
  warningText:   "#8B6914",
  warningBg:     "#FFF8F0",
  warningBorder: "#F0E4D4",
  info:          "#C0785A",
  success:       "#38A169",
  successDark:   "#276749",
};

export const fonts = {
  sans:   "'DM Sans', sans-serif",
  serif:  "'Lora', Georgia, serif",
  hand:   "'Caveat', cursive",
};

export const radii = {
  sm:  "8px",
  md:  "12px",
  lg:  "14px",
  xl:  "16px",
  xxl: "20px",
  pill: "100px",
};

// ─── Wiederverwendbare Style-Objekte ─────────────────

export const inputStyle = {
  width: "100%",
  padding: "14px 18px",
  border: `1.5px solid ${colors.border}`,
  borderRadius: radii.md,
  fontSize: "15px",
  fontFamily: fonts.serif,
  color: colors.text,
  background: colors.surface,
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

export const textareaStyle = {
  ...inputStyle,
  minHeight: "110px",
  resize: "vertical",
  lineHeight: 1.7,
};

export const labelStyle = {
  display: "block",
  fontSize: "11.5px",
  fontFamily: fonts.sans,
  fontWeight: 600,
  color: colors.label,
  letterSpacing: "0.08em",
  marginBottom: "7px",
  textTransform: "uppercase",
};

export const optionalHint = {
  color: colors.textLighter,
  fontWeight: 400,
};

/** Chip-Style (für Tags/Auswahl) – selected = true/false */
export const chipStyle = (selected) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "9px 16px",
  borderRadius: radii.pill,
  border: selected ? `2px solid ${colors.primaryLight}` : `1.5px solid ${colors.border}`,
  background: selected ? colors.primaryBg : colors.surface,
  color: selected ? colors.primary : colors.textMuted,
  fontSize: "13.5px",
  fontFamily: fonts.sans,
  fontWeight: selected ? 600 : 400,
  cursor: "pointer",
  transition: "all 0.2s",
  margin: "3px",
});

/** Card-Style (für Listenauswahl) – selected = true/false */
export const cardSelectStyle = (selected) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: "14px",
  padding: "16px 18px",
  borderRadius: radii.md,
  border: selected ? `2px solid ${colors.primaryLight}` : `1.5px solid ${colors.borderLight}`,
  background: selected ? colors.primaryBg : colors.surface,
  cursor: "pointer",
  transition: "all 0.2s",
});

/** Button-Styles */
export const buttonPrimary = {
  background: colors.primaryGrad,
  color: "#fff",
  border: "none",
  borderRadius: radii.lg,
  padding: "14px 32px",
  fontSize: "15px",
  fontFamily: fonts.sans,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 4px 20px rgba(61,90,76,0.25)",
};

export const buttonSecondary = {
  background: "transparent",
  color: colors.primary,
  border: `2px solid ${colors.primaryLight}`,
  borderRadius: radii.lg,
  padding: "14px 30px",
  fontSize: "15px",
  fontFamily: fonts.sans,
  fontWeight: 600,
  cursor: "pointer",
};

// Focus/blur-Handlers für Inputs
export const onFocusInput = (e) => (e.target.style.borderColor = colors.primaryLight);
export const onBlurInput = (e) => (e.target.style.borderColor = colors.border);

```

