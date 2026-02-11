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

        <h2 style={{ ...h, fontSize: "20px" }}>6. Datenspeicherung und Löschung</h2>
        <p>Personalisierungsdaten werden nach Abschluss der Briefserie (letzter Brief versendet) für maximal 90 Tage aufbewahrt, um eventuelle Kundenanfragen bearbeiten zu können. Danach werden sie unwiderruflich gelöscht.</p>
        <p>Rechnungsdaten werden gemäss gesetzlicher Aufbewahrungspflicht (10 Jahre) gespeichert.</p>
        <p>Sie können jederzeit die sofortige Löschung Ihrer Daten verlangen (ausgenommen gesetzliche Aufbewahrungspflichten).</p>

        <h2 style={{ ...h, fontSize: "20px" }}>7. Ihre Rechte</h2>
        <p>Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Kontaktieren Sie uns unter info@virtue-compliance.ch.</p>
        <p>Schweizer Datenschutzrecht (DSG): Sie können sich an den Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) wenden.</p>
        <p>EU-Datenschutzrecht (DSGVO): Sofern die DSGVO anwendbar ist, haben Sie zusätzlich das Recht auf Beschwerde bei einer EU-Aufsichtsbehörde.</p>

        <h2 style={{ ...h, fontSize: "20px" }}>8. Cookies</h2>
        <p>LetterLift verwendet keine Marketing- oder Tracking-Cookies. Es werden ausschliesslich technisch notwendige Cookies für die Funktion der Website eingesetzt.</p>

        <h2 style={{ ...h, fontSize: "20px" }}>9. Änderungen</h2>
        <p>Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf anzupassen. Die aktuelle Version ist stets auf dieser Seite einsehbar.</p>

        <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #E0DAD4" }}>
          <a href="/" style={{ color: "#5B7B6A", textDecoration: "none" }}>← Zurück zu LetterLift</a>
        </div>
      </div>
    </div>
  );
}
