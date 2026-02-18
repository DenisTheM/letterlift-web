// src/lib/gender.js
// ═══════════════════════════════════════════════════════
// Geschlechtsspezifische Texte – eine Quelle der Wahrheit
// ═══════════════════════════════════════════════════════

/**
 * Gibt geschlechtsspezifische Wörter zurück.
 * @param {string} g - "f", "m", "x" oder ""
 */
export function pronouns(g) {
  if (g === "f") return { er: "sie", ihn: "sie", ihm: "ihr", sein: "ihr", seine: "ihre", seinen: "ihren", liebe: "Liebe", dein: "Deine" };
  if (g === "m") return { er: "er",  ihn: "ihn", ihm: "ihm", sein: "sein", seine: "seine", seinen: "seinen", liebe: "Lieber", dein: "Dein" };
  // divers / unbekannt → neutral
  return { er: "die Person", ihn: "sie", ihm: "ihr", sein: "ihr", seine: "ihre", seinen: "ihren", liebe: "Liebe/r", dein: "Dein/e" };
}
