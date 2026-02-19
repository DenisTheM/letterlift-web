#!/bin/bash
# ═══════════════════════════════════════════════════════════
# LetterLift – Success-Page Fix: Daten via sessionStorage
# Statt API-Calls speichern wir die Daten vor dem
# Stripe-Redirect in sessionStorage.
# ═══════════════════════════════════════════════════════════
set -euo pipefail

cd ~/Projekte/letterlift-web

echo "💛 LetterLift – Success-Page via sessionStorage"
echo "================================================"
echo ""

# ─── 1. StepSummary: Daten vor Redirect speichern ───
echo "1/2 → StepSummary patchen (sessionStorage vor Redirect)..."

python3 << 'PYEOF'
with open("src/components/steps/StepSummary.jsx", "r") as f:
    content = f.read()

old = '      if (res.url) window.location.href = res.url;'

new = """      if (res.url) {
        try {
          sessionStorage.setItem("ll_success", JSON.stringify({
            name: data.nickname || data.recipientName,
            occasion: data.occasion,
            letterCount: (data.package === "trial" ? 1 : data.package === "impuls" ? 5 : data.package === "classic" ? 10 : 15),
            bookingType: data.bookingType,
          }));
        } catch (e) { /* sessionStorage not available */ }
        window.location.href = res.url;
      }"""

if old in content:
    content = content.replace(old, new, 1)
    with open("src/components/steps/StepSummary.jsx", "w") as f:
        f.write(content)
    print("   ✅ StepSummary – sessionStorage vor Redirect")
else:
    print("   ⚠️  Patch-Stelle nicht gefunden")
    # Debug
    import re
    matches = [m.start() for m in re.finditer(r"res\.url", content)]
    print(f"   'res.url' found at positions: {matches}")
PYEOF

# ─── 2. Success-Page: aus sessionStorage lesen ───
echo "2/2 → Success-Page (liest aus sessionStorage)..."

cat > src/app/success/page.js << 'SUCCESSJS'
// src/app/success/page.js
"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

// ─── Kontextabhängige Texte ───
function getMessage(occasion, isSelf, name, count) {
  const copy = {
    tough_times: {
      gift: `Irgendwann wird ${name} zum Briefkasten gehen und dort etwas finden, womit niemand gerechnet hat. Kein Paket, keine Rechnung. Sondern jemand, der an ${name} denkt.`,
      self: `Bald liegt der erste Brief in deinem Briefkasten. An einem ganz normalen Tag – vielleicht genau dem, an dem du ihn brauchst.`,
    },
    motivation: {
      gift: `${count} Mal wird ${name} einen Umschlag öffnen und darin eine Stimme finden, die sagt: Ich sehe, was du tust. Und ich glaube an dich. Deine Stimme.`,
      self: `An den Tagen, an denen du dich fragst wozu – wird ein Brief da sein. Geschrieben für genau diesen Moment.`,
    },
    confidence: {
      gift: `${count} ${count === 1 ? "Brief" : "Briefe"}, die ${name} sagen, was man sich selbst so selten glaubt. Dass man genug ist. Dass man es kann. In deinen Worten.`,
      self: `Briefe, die sagen, was du dir selbst zu selten sagst. Nicht als Floskel. Weil es stimmt.`,
    },
    appreciation: {
      gift: `Es gibt Dinge, die sagt man zu selten. ${name} wird sie lesen. Schwarz auf weiss, in einem echten Brief. Von dir.`,
      self: `Sich selbst zu schätzen ist nicht eitel. Es ist nötig. Diese Briefe erinnern dich daran.`,
    },
    celebration: {
      gift: `Ein Moment verdient mehr als eine Nachricht auf dem Bildschirm. ${name} wird einen Brief in den Händen halten und wissen: Da hat jemand an mich gedacht.`,
      self: `Bevor der Alltag diesen Moment leise werden lässt – hält ein Brief ihn fest. Für dich.`,
    },
    growth: {
      gift: `${count} ${count === 1 ? "Brief" : "Briefe"}, verteilt über Wochen. Jeder einzelne ein leises Zeichen: Jemand sieht, wie du wächst. Jemand ist stolz.`,
      self: `In ein paar Wochen wirst du auf diese Briefe zurückblicken und merken: Du warst schon auf dem richtigen Weg. Du wusstest es nur noch nicht.`,
    },
  };

  const block = copy[occasion];
  if (block) return isSelf ? block.self : block.gift;

  return isSelf
    ? `Bald liegt der erste Brief in deinem Briefkasten. Geschrieben für dich.`
    : `${name} wird bald einen Brief in den Händen halten. Einen echten Brief. Von dir.`;
}

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("order");
  const [data, setData] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Lese Daten aus sessionStorage (gespeichert vor Stripe-Redirect)
    try {
      const raw = sessionStorage.getItem("ll_success");
      if (raw) {
        setData(JSON.parse(raw));
        sessionStorage.removeItem("ll_success"); // Einmal lesen, dann löschen
      }
    } catch (e) { /* nicht verfügbar */ }
    setTimeout(() => setVisible(true), 100);
  }, []);

  const isSelf = data?.bookingType === "self";
  const name = data?.name || "";
  const count = data?.letterCount || "";

  const headline = data
    ? isSelf
      ? `${count} ${count === 1 ? "Brief" : "Briefe"} an dich.`
      : `${count} ${count === 1 ? "Brief" : "Briefe"} an ${name}.`
    : "";

  const message = data
    ? getMessage(data.occasion, isSelf, name, count)
    : "";

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
        maxWidth: "480px",
        textAlign: "center",
        background: "#fff",
        borderRadius: "20px",
        padding: "52px 40px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.6s ease",
      }}>
        {/* Heart */}
        <div style={{
          fontSize: "44px",
          marginBottom: "28px",
          animation: "pulse 2.5s ease-in-out infinite",
        }}>💛</div>

        {/* Headline */}
        {headline && (
          <p style={{
            fontSize: "15px",
            fontFamily: "'DM Sans', sans-serif",
            color: "#5B7B6A",
            fontWeight: 600,
            letterSpacing: "0.02em",
            margin: "0 0 20px",
          }}>
            {headline}
          </p>
        )}

        {/* Kontextabhängiger Text */}
        {message && (
          <p style={{
            fontSize: "17px",
            fontFamily: "Georgia, 'Lora', serif",
            color: "#2D2926",
            lineHeight: 1.8,
            margin: "0 0 36px",
            fontWeight: 400,
          }}>
            {message}
          </p>
        )}

        {/* Divider */}
        <div style={{
          width: "36px",
          height: "2px",
          background: "linear-gradient(90deg, #5B7B6A, #A8D5BA)",
          margin: "0 auto 36px",
          borderRadius: "1px",
        }} />

        {/* Nächster Schritt */}
        <p style={{
          fontSize: "15px",
          fontFamily: "'DM Sans', sans-serif",
          color: "#8A8480",
          lineHeight: 1.6,
          margin: "0 0 28px",
        }}>
          Wir schreiben jetzt deine Briefe.
        </p>

        {/* Bestellnummer */}
        {orderId && (
          <p style={{
            fontSize: "12px",
            fontFamily: "'DM Sans', sans-serif",
            color: "#C5BFB9",
            margin: "0 0 24px",
          }}>
            {orderId.substring(0, 8)}
          </p>
        )}

        <a href="/" style={{
          display: "inline-block",
          padding: "12px 28px",
          color: "#8A8480",
          border: "1px solid #E0DAD4",
          borderRadius: "10px",
          textDecoration: "none",
          fontSize: "13px",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
        }}>
          Zur Startseite
        </a>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FBF8F5",
        fontFamily: "'DM Sans', sans-serif",
        color: "#C5BFB9",
        fontSize: "14px",
      }}>
        Einen Moment...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
SUCCESSJS

echo "   ✅ Success-Page – liest aus sessionStorage"
echo ""

# Deploy
echo "Deploying to Vercel..."
git add src/components/steps/StepSummary.jsx src/app/success/page.js
git commit -m "Success-Page: sessionStorage statt API, kontextabhängige Texte"
git push

echo ""
echo "═══════════════════════════════════════════"
echo "✅ Success-Page Fix deployed!"
echo ""
echo "  Ablauf:"
echo "  1. StepSummary speichert Name/Anlass/Paket in sessionStorage"
echo "  2. Stripe-Redirect → Zahlung → zurück zu /success"
echo "  3. Success-Page liest sessionStorage → zeigt emotionalen Text"
echo "  4. sessionStorage wird danach gelöscht (einmalig)"
echo ""
echo "  Kein API-Call, kein RLS-Problem, kein gender-Feld."
echo "  Teste mit einer neuen Bestellung!"
echo "═══════════════════════════════════════════"
