// src/lib/formState.js
// ═══════════════════════════════════════════════════
// Initialer State, Update-Logik, localStorage-Persistenz
// ═══════════════════════════════════════════════════

const STORAGE_KEY = "letterlift_draft";
const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 Stunden

export const INITIAL_FORM_DATA = {
  bookingType: null,
  recipientName: "",
  recipientLastName: "",
  nickname: "",
  gender: "",
  relationship: "",
  relationshipCustom: "",
  language: "de",
  occasion: null,
  contextText: "",
  goal: "",
  hobbies: "",
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
  senderGender: "",
  senderMessage: "",
  persona: null,
  personaName: "",
  personaDesc: "",
  package: null,
  frequency: "weekly",
  paperOption: "standard",
  handschriftEdition: false,
  street: "",
  zip: "",
  city: "",
  country: "CH",
  email: "",
  _hp: "",
};

// ——— Sanitize: XSS-Schutz für Strings ———

const MAX_FIELD_LENGTH = 2000;

/** Entfernt HTML-Tags und begrenzt Länge */
export function sanitize(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/<[^>]*>/g, "")          // HTML-Tags entfernen
    .replace(/javascript:/gi, "")      // JS-Injection
    .replace(/on\w+\s*=/gi, "")        // Event-Handler
    .slice(0, MAX_FIELD_LENGTH);
}

/** Sanitize aller String-Felder im gesamten Data-Objekt */
export function sanitizeAll(data) {
  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      clean[key] = sanitize(value);
    } else if (Array.isArray(value)) {
      clean[key] = value.map(v => typeof v === "string" ? sanitize(v) : v);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

// ——— localStorage Persistenz ———

/** Gespeicherten Draft laden (falls vorhanden + nicht abgelaufen) */
export function loadDraft() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    // Draft-Alter prüfen (24h max)
    if (saved._savedAt && Date.now() - saved._savedAt > DRAFT_MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    const { _savedAt, ...fields } = saved;
    return { ...INITIAL_FORM_DATA, ...fields };
  } catch {
    return null;
  }
}

/** Aktuellen State speichern (ohne sensible Daten) */
export function saveDraft(data) {
  if (typeof window === "undefined") return;
  try {
    const { email, _hp, ...safe } = data;
    safe._savedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  } catch {
    // localStorage voll oder blockiert
  }
}

/** Draft löschen (nach erfolgreichem Checkout) */
export function clearDraft() {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

/**
 * Erzeugt eine Update-Funktion, die automatisch
 * Erinnerungen zusammenfasst, sanitized und in localStorage speichert.
 */
export function createUpdater(setData) {
  return (key, value) => {
    setData((prev) => {
      const cleanValue = typeof value === "string" ? sanitize(value) : value;
      const next = { ...prev, [key]: cleanValue };
      // Auto-combine memory fields
      if (["mem1", "mem2", "mem3", "memExtra"].includes(key)) {
        const parts = [next.mem1, next.mem2, next.mem3, ...(next.memExtra || [])]
          .filter(s => s && s.trim().length > 0);
        next.memories = parts.map((p, i) => `${i + 1}) ${p.trim()}`).join("\n\n");
      }
      saveDraft(next);
      return next;
    });
  };
}

/** Gesamtpreis berechnen */
export function calculateTotal(data, packages) {
  const pkg = packages.find(p => p.id === data.package);
  let total = pkg?.price || 0;
  // Premium-Design: +9.90
  if (data.paperOption === "premium_design") total += 9.9;
  // Handschrift-Edition: +9.90
  if (data.handschriftEdition) total += 9.9;
  return total;
}
