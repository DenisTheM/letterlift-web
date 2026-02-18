// src/lib/formState.js
// ═══════════════════════════════════════════════════════
// Initialer State und Update-Logik für das Bestellformular
// ═══════════════════════════════════════════════════════

export const INITIAL_FORM_DATA = {
  bookingType: null,
  recipientName: "",
  nickname: "",
  gender: "",
  relationship: "",
  language: "de",
  occasion: null,
  contextText: "",
  goal: "",
  hobbies: "",
  music: "",
  humor: [],
  strengths: "",
  importantPeople: "",
  noGo: "",
  memories: "",
  mem1: "",
  mem2: "",
  mem3: "",
  memExtra: [],
  style: [],
  customStyleDesc: "",
  senderName: "",
  senderMessage: "",
  persona: null,
  personaName: "",
  personaDesc: "",
  package: null,
  frequency: "weekly",
  paperOption: "standard",
  street: "",
  zip: "",
  city: "",
  country: "CH",
  email: "",
  _hp: "",
};

/**
 * Erzeugt eine Update-Funktion, die automatisch
 * Erinnerungen zusammenfasst wenn mem-Felder sich ändern.
 */
export function createUpdater(setData) {
  return (key, value) => {
    setData((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-combine memory fields
      if (["mem1", "mem2", "mem3", "memExtra"].includes(key)) {
        const parts = [next.mem1, next.mem2, next.mem3, ...(next.memExtra || [])]
          .filter(s => s && s.trim().length > 0);
        next.memories = parts.map((p, i) => `${i + 1}) ${p.trim()}`).join("\n\n");
      }
      return next;
    });
  };
}

/** Gesamtpreis berechnen */
export function calculateTotal(data, packages, paperOptions) {
  const pkg = packages.find(p => p.id === data.package);
  const paper = paperOptions.find(p => p.id === data.paperOption);
  return (pkg?.price || 0) + (paper?.price || 0);
}
