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
        <p>Denis Scheller, Geschäftsführer</p>
        <h2 style={{ ...h, fontSize: "20px" }}>Haftungsausschluss</h2>
        <p>Die Inhalte dieser Website werden mit grösstmöglicher Sorgfalt erstellt. Die Virtue Compliance GmbH übernimmt jedoch keine Gewähr für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten Inhalte.</p>
        <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #E0DAD4" }}>
          <a href="/" style={{ color: "#5B7B6A", textDecoration: "none" }}>← Zurück zu LetterLift</a>
        </div>
      </div>
    </div>
  );
}
