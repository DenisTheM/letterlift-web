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
