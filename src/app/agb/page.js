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
