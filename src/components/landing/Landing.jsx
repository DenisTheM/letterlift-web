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
