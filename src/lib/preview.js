// src/lib/preview.js
// ═══════════════════════════════════════════════════════
// Client-seitige Vorschau-Generierung (Fallback für KI)
// ═══════════════════════════════════════════════════════

import { pronouns } from "./gender";

export function generatePreview(d, isSelf) {
  const nk = d.nickname || d.recipientName || "du";
  const g = d.gender || "";
  const p = pronouns(g);
  const styles = Array.isArray(d.style) ? d.style : [];
  const isH = styles.includes("humorous");
  const isP = styles.includes("poetic");
  const isW = styles.includes("warm") || styles.length === 0;

  let greeting = isSelf ? "Hey " + nk + "," : p.liebe + " " + nk + ",";
  if (isSelf && d.persona === "deceased") greeting = g === "m" ? "Mein lieber " + nk + "," : "Meine liebe " + nk + ",";
  if (isSelf && d.persona === "future_self") greeting = "Hey " + nk + " –";

  const sender = isSelf
    ? (d.personaName || "Jemand, der an dich glaubt")
    : (d.senderName || "Jemand, der dich kennt");

  const hobbies = d.hobbies ? d.hobbies.split(",").map(h => h.trim()).filter(Boolean) : [];
  const mem = (d.memories || "").trim();
  const strength = d.strengths ? d.strengths.split(",")[0]?.trim() : null;

  let lines = [];

  if (mem.length > 20) {
    lines.push("Ich musste heute an etwas denken." + (isH ? " Und ja, ich musste schmunzeln." : ""));
    lines.push("Erinnerst du dich? " + (mem.length > 100 ? mem.substring(0, 100) + "..." : mem));
  } else {
    lines.push("Ich weiss, die letzten Wochen waren nicht einfach." +
      (isH ? ' Und nein, ich sage dir nicht, dass «alles gut wird».' : ""));
  }

  if (hobbies[0]) {
    lines.push(
      (isP ? "Es gibt Momente beim " + hobbies[0] + ", die alles leiser machen." : "Warst du beim " + hobbies[0] + "?") +
      " Manchmal hilft es."
    );
  }

  if (strength) {
    lines.push("Was ich " + (isSelf ? "an mir" : "an dir") + " bewundere: " + strength + ". Das vergisst man manchmal.");
  }

  if (d.occasion === "tough_times") lines.push(isW ? "Ich drücke dich ganz fest." : "Du bist stärker, als du denkst.");
  else if (d.occasion === "motivation") lines.push(isW ? "Ich glaube an dich." : "Jeder Schritt zählt.");
  else lines.push(isW ? "Ich denke an dich." : "Manche Menschen machen die Welt heller.");

  const closing = isW ? "Ganz fest gedrückt –" : isP ? "In Gedanken bei dir –" : "Alles Gute –";

  return greeting + "\n\n" + lines.join("\n\n") + "\n\n" + closing + "\n" + sender;
}
