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
