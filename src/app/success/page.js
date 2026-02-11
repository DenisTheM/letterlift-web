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
