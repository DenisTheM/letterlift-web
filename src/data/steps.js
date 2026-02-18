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
