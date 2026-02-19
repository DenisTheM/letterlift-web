// supabase/functions/generate-preview/index.ts
// Generates a preview of Brief 1 using the real engine logic (lightweight, no QC/Safety)
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const MODEL = "claude-sonnet-4-20250514";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function genderGreeting(name: string, gender: string) {
  if (gender === "f") return `Liebe ${name},`;
  if (gender === "m") return `Lieber ${name},`;
  return `Liebe/r ${name},`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { orderData } = await req.json();
    const d = orderData;

    // ═══ Input Safety Screening ═══
    const THREAT_PATTERNS = [
      /\b(du wirst es bereuen|ich weiss wo du|ich finde dich|pass auf|warte ab)\b/i,
      /\b(ich beobachte dich|ich sehe alles|du entkommst|das wirst du büssen)\b/i,
      /\b(ich mach dich|ich bring dich|du bist tot|ich zerstör)\b/i,
      /\b(wenn du mich wirklich lieben würdest|du bist schuld|ohne mich bist du nichts)\b/i,
      /\b(das hast du dir selbst zuzuschreiben|du verdienst es nicht besser)\b/i,
      /\b(niemand wird dich je|du wirst nie jemand|kein wunder dass)\b/i,
      /\b(ich habe gesehen dass du|ich weiss was du|ich habe dich beobachtet)\b/i,
      /\b(ich war bei dir|ich stand vor deiner|ich bin dir gefolgt)\b/i,
    ];
    const INSULT_PATTERNS = [
      /\b(du bist so dumm|du bist wertlos|du taugst nichts|du bist erbärmlich)\b/i,
      /\b(du bist hässlich|du bist fett|du bist peinlich|du ekelst mich)\b/i,
      /\b(schlampe|hurensohn|wichser|missgeburt|arschloch|fotze|bastard)\b/i,
      /\b(versager|loser|idiot|vollidiot|trottel|depp)\b/i,
    ];
    const PRESSURE_PATTERNS = [
      /\b(du musst|du hast keine wahl|wenn du nicht bis|letzte chance)\b/i,
      /\b(es ist deine schuld|du bist mir schuldig|du schuldest mir)\b/i,
      /\b(jetzt oder nie|ich gebe dir zeit bis|dann ist es vorbei)\b/i,
    ];

    const textFields = [d.contextText, d.goal, d.memories, d.personaDesc, d.customStyleDesc].filter(Boolean);
    const safetyFlags: string[] = [];

    for (const text of textFields) {
      for (const p of THREAT_PATTERNS) { if (p.test(text)) { safetyFlags.push("threat"); break; } }
      for (const p of INSULT_PATTERNS) { if (p.test(text)) { safetyFlags.push("insult"); break; } }
      for (const p of PRESSURE_PATTERNS) { if (p.test(text)) { safetyFlags.push("pressure"); break; } }
    }

    if (safetyFlags.length > 0) {
      console.warn(`[SAFETY BLOCK] Preview blocked: ${safetyFlags.join(", ")}`);
      return new Response(JSON.stringify({ 
        error: "safety_blocked",
        message: "Der Text enthält unangemessene Inhalte. Bitte überprüfe deine Eingaben.",
        flags: safetyFlags,
      }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const isSelf = d.bookingType === "self";
    const name = d.recipientName || "du";
    const nick = d.nickname || name;
    const gender = d.gender || "x";

    // Build persona context
    let personaContext = "";
    if (isSelf) {
      if (d.persona === "friend") personaContext = `Du schreibst als guter Freund/gute Freundin von ${nick}.`;
      else if (d.persona === "mentor") personaContext = `Du schreibst als Mentor von ${nick}.`;
      else if (d.persona === "deceased") personaContext = `Du schreibst als verstorbene Person: ${d.personaName || "jemand Nahes"}. Schreibe liebevoll.`;
      else if (d.persona === "future_self") personaContext = `Du schreibst als ${nick}s zukünftiges Ich – klug, erfahren, liebevoll.`;
      else if (d.persona === "custom_persona") personaContext = `Du schreibst als: ${d.personaDesc || "eine warmherzige Stimme"}.`;
    }

    const signOffName = isSelf
      ? (d.personaName || "Jemand, der an dich glaubt")
      : (d.senderName || "In Liebe");

    const greeting = genderGreeting(nick, gender);

    const system = `Du bist ein empathischer Briefschreiber. Du schreibst den ERSTEN Brief einer persönlichen Briefserie an "${nick}".
${personaContext}

BRIEF 1 – REGELN:
- Kurz (80-120 Wörter). Wie ein leises Anklopfen.
- Warm, sanft, validierend. Kein langer Kontext.
- Beginne mit "${greeting}"
- Ende mit "${signOffName}"
- Schreibe auf ${d.language === "en" ? "Englisch" : d.language === "fr" ? "Französisch" : d.language === "it" ? "Italienisch" : "Deutsch (Schweizer Rechtschreibung: IMMER ss statt ß, z.B. 'gross' nicht 'groß', 'weiss' nicht 'weiß')"} (Du-Form)

ABSOLUTES VERBOT – NICHTS ERFINDEN:
- Verwende NUR Informationen die in den Empfänger-Daten stehen.
- Erfinde KEINE Zitate, Szenen, Orte, Daten oder Gespräche.
- Schmücke Erinnerungen NICHT mit erfundenen Details aus.
- Im Zweifel: Lieber vage und ehrlich als detailliert und erfunden.

STIL:
- Kein Kitsch, keine Floskeln wie "Kopf hoch", "Du schaffst das", "Alles wird gut"
- Schreibe wie ein echter Mensch
- Keine Listen, keine Aufzählungen

Gib NUR den Brieftext zurück (Anrede bis Signatur). Keine Erklärungen.`;

    const user = `EMPFÄNGER-DATEN:
Name: ${name}, Spitzname: ${nick}
Geschlecht: ${gender === "f" ? "weiblich" : gender === "m" ? "männlich" : "divers"}
${d.relationship ? `Beziehung: ${d.relationship}` : ""}
Anlass: ${d.occasion || "nicht angegeben"}
Kontext: ${d.contextText || "nicht angegeben"}
${d.goal ? `Ziel: ${d.goal}` : ""}
${d.memories ? `Erinnerungen: ${d.memories}` : ""}
${d.hobbies ? `Hobbies: ${d.hobbies}` : ""}
${d.strengths ? `Stärken: ${d.strengths}` : ""}
${d.importantPeople ? `Wichtige Personen: ${d.importantPeople}` : ""}
Stil: ${d.style?.join(", ") || "warm"}

Schreibe jetzt Brief 1.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model: MODEL, max_tokens: 600, system, messages: [{ role: "user", content: user }] }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);

    const text = data.content.map((b: any) => b.text || "").join("").trim();

    return new Response(JSON.stringify({ preview: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Preview error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
