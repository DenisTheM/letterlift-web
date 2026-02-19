// src/app/success/page.js
"use client";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("order");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

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
        padding: "52px 40px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.6s ease",
      }}>
        {/* Animated heart */}
        <div style={{
          fontSize: "48px",
          marginBottom: "24px",
          animation: "pulse 2s ease-in-out infinite",
        }}>💛</div>

        <h1 style={{
          fontSize: "26px",
          fontWeight: 400,
          fontFamily: "'Lora', Georgia, serif",
          margin: "0 0 16px",
          color: "#2C2C2C",
          lineHeight: 1.4,
        }}>
          Das ist etwas Besonderes.
        </h1>

        <p style={{
          fontSize: "16px",
          fontFamily: "Georgia, serif",
          color: "#4A4543",
          lineHeight: 1.8,
          margin: "0 0 12px",
        }}>
          Du hast gerade entschieden, jemandem mit Worten Kraft zu geben.
        </p>

        <p style={{
          fontSize: "15px",
          fontFamily: "Georgia, serif",
          color: "#6B6360",
          lineHeight: 1.8,
          margin: "0 0 32px",
        }}>
          Wir schreiben jetzt deine Briefe – jeden einzelnen mit Herz. 
          Du bekommst eine E-Mail, sobald es losgeht.
        </p>

        {/* Subtle divider */}
        <div style={{
          width: "40px",
          height: "2px",
          background: "linear-gradient(90deg, #5B7B6A, #A8D5BA)",
          margin: "0 auto 32px",
          borderRadius: "1px",
        }} />

        <div style={{
          background: "#F8F6F3",
          borderRadius: "14px",
          padding: "24px",
          marginBottom: "28px",
          textAlign: "left",
        }}>
          <p style={{
            fontSize: "14px",
            fontFamily: "'DM Sans', sans-serif",
            color: "#3D5A4C",
            lineHeight: 1.8,
            margin: 0,
          }}>
            <strong>Was jetzt passiert:</strong><br/>
            Deine Briefe werden geschrieben. Sobald der erste bereit ist, 
            bekommst du eine E-Mail – dann kannst du ihn lesen, anpassen 
            und freigeben. Erst nach deinem OK geht er raus.
          </p>
        </div>

        <p style={{
          fontSize: "14px",
          fontFamily: "'DM Sans', sans-serif",
          color: "#8A8480",
          lineHeight: 1.6,
          margin: "0 0 24px",
        }}>
          Du behältst die volle Kontrolle.<br/>
          Kein Brief wird ohne dein Wissen verschickt.
        </p>

        {orderId && (
          <p style={{
            fontSize: "12px",
            fontFamily: "'DM Sans', sans-serif",
            color: "#C5BFB9",
            margin: "0 0 20px",
          }}>
            Bestellnummer: {orderId.substring(0, 8)}
          </p>
        )}

        <a href="/" style={{
          display: "inline-block",
          padding: "14px 32px",
          background: "transparent",
          color: "#5B7B6A",
          border: "1.5px solid #D6CFC8",
          borderRadius: "12px",
          textDecoration: "none",
          fontSize: "14px",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          transition: "all 0.2s",
        }}>
          Zurück zur Startseite
        </a>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
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
        color: "#B0A9A3",
      }}>
        Einen Moment...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
