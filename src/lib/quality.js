// src/lib/quality.js
// ═══════════════════════════════════════════════════════
// Qualitäts-Score Berechnung für Profil-Daten
// Wird in der Vorschau angezeigt
// ═══════════════════════════════════════════════════════

export function assessQuality(d) {
  let score = 0, max = 0;
  const issues = [], suggestions = [];

  function check(value, weight, required, label, minLen, minWords) {
    max += weight;
    if (!value || (typeof value === "string" && value.trim().length === 0)) {
      if (!required) suggestions.push(label);
      return;
    }
    const t = typeof value === "string" ? value.trim() : String(value);
    const words = t.split(/\s+/).filter(Boolean);
    const unique = new Set(words.map(x => x.toLowerCase()));
    const avgLen = words.length > 0 ? words.reduce((a, x) => a + x.length, 0) / words.length : 0;

    // Gibberish detection: gleicher Buchstabe 4x+ hintereinander (z.B. "aaaa", "!!!!!")
    if (/(.)\1{3,}/.test(t) || (unique.size === 1 && words.length > 2) || /^[^a-zA-ZäöüÄÖÜßéèêàáâ]+$/.test(t)) {
      issues.push(label + ": Inhalt nicht verwertbar"); return;
    }
    if (words.length > 3 && unique.size < words.length * 0.3) {
      issues.push(label + ": Viele Wiederholungen"); score += weight * 0.2; return;
    }
    if (avgLen > 15 || (avgLen < 2 && words.length > 3)) {
      issues.push(label + ": Text ungewöhnlich"); score += weight * 0.3; return;
    }
    if (minLen && t.length < minLen) { score += weight * 0.5; suggestions.push(label + " vertiefen"); return; }
    if (minWords && words.length < minWords) { score += weight * 0.5; suggestions.push(label + " ausführlicher"); return; }
    score += weight;
  }

  check(d.recipientName, 2, true, "Name", 2);
  check(d.occasion ? "set" : null, 2, true, "Anlass");
  check(d.contextText, 4, true, "Situation", 30, 8);
  check(d.goal, 2, false, "Ziel");
  check(d.hobbies, 2, false, "Hobbies", 5);
  check(d.strengths, 2, false, "Stärken", 5);

  const memFields = [d.mem1, d.mem2, d.mem3, ...(d.memExtra || [])].filter(Boolean);
  const memText = memFields.join(" ");
  check(memText.length > 0 ? memText : null, 5, false, "Erinnerungen", 30, 8);

  const goodMems = memFields.filter(m => m && m.trim().length >= 20).length;
  if (goodMems >= 3) { score += 2; max += 2; }
  else if (goodMems >= 2) { score += 1; max += 2; }
  else { max += 2; }

  check(d.importantPeople, 1, false, "Bezugspersonen");
  check(d.humor?.length > 0 ? "set" : null, 1, false, "Humor-Typ");

  const ratio = max > 0 ? score / max : 0;
  const briefCount = d.package === "journey" ? 15 : d.package === "classic" ? 10 : d.package === "impuls" ? 5 : 1;

  let level, color, emoji, message;
  if (ratio < 0.3) {
    level = "Unzureichend"; color = "#E53E3E"; emoji = "🔴";
    message = "Zu wenig Material.";
  } else if (ratio < 0.5) {
    level = "Basis"; color = "#DD6B20"; emoji = "🟠";
    message = briefCount > 5 ? `Für ${briefCount} Briefe fehlen noch Erinnerungen.` : "Grundlage da – mehr Details machen es unvergesslich.";
  } else if (ratio < 0.7) {
    level = "Gut"; color = "#D69E2E"; emoji = "🟡";
    message = goodMems < 2 ? "Gute Basis! Noch eine Erinnerung für richtig persönliche Briefe." : "Gute Basis! Noch etwas mehr Detail macht es perfekt.";
  } else if (ratio < 0.85) {
    level = "Sehr gut"; color = "#38A169"; emoji = "🟢";
    message = `Stark! Genug Material für ${Math.min(goodMems * 3, briefCount)} persönliche Briefe.`;
  } else {
    level = "Exzellent"; color = "#276749"; emoji = "💚";
    message = "Perfekt! Genug Material für Briefe, die wirklich berühren.";
  }

  return { score: Math.round(ratio * 100), level, color, emoji, message, issues, suggestions };
}
