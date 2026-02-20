// supabase/functions/generate-series/index.ts
// Brief Engine v10: Targeted quality fixes based on test report analysis
// Fixes: 1) Datapoint repetition, 2) Scene fabrication, 3) Formula recycling, 4) Low-input clichés
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const MODEL_MAIN = "claude-sonnet-4-20250514";
const MODEL_SAFETY = "claude-haiku-4-5-20251001";
const SELF_URL = `${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-series`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Claude API Helper ───
async function callClaude(model: string, system: string, user: string, maxTokens = 2000) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`Claude API: ${data.error.message}`);
  return { text: data.content.map((b: any) => b.text || "").join(""), inputTokens: data.usage?.input_tokens || 0, outputTokens: data.usage?.output_tokens || 0 };
}

function parseJSON(text: string) {
  return JSON.parse(text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
}

function genderGreeting(name: string, gender: string) {
  if (gender === "f") return `Liebe ${name},`;
  if (gender === "m") return `Lieber ${name},`;
  return `Liebe/r ${name},`;
}

// ─── Trigger next letter (fire-and-forget with retry) ───
function triggerNext(orderId: string, nextIndex: number) {
  // Fire-and-forget: don't await, don't block current request
  (async () => {
    for (let retry = 0; retry < 3; retry++) {
      try {
        const res = await fetch(SELF_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
          },
          body: JSON.stringify({ orderId, letterIndex: nextIndex }),
        });
        if (res.ok) {
          console.log(`[Chain] Triggered letter ${nextIndex} (attempt ${retry + 1})`);
          return;
        }
        console.error(`[Chain] Letter ${nextIndex} trigger failed (${res.status}), retry=${retry}`);
      } catch (err) {
        console.error(`[Chain] Letter ${nextIndex} trigger error (retry=${retry}):`, err);
      }
      await new Promise(r => setTimeout(r, 2000 * (retry + 1))); // increasing backoff
    }
    console.error(`[Chain] FAILED to trigger letter ${nextIndex} after 3 attempts`);
  })();
}

// triggerNotify removed: cron-notify handles scheduled review notifications

// --- Trigger send-letter (fire-and-forget) ---
function triggerSend(orderId: string, letterIndex: number) {
  const sendUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-letter`;
  fetch(sendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    },
    body: JSON.stringify({ orderId, letterIndex }),
  }).then(r => console.log(`[Send] Triggered send-letter ${letterIndex}: ${r.status}`))
    .catch(e => console.error(`[Send] Failed to trigger send-letter ${letterIndex}:`, e));
}

// ─── Admin Alert (fire-and-forget) ───
function alertAdmin(type: string, orderId: string, letterIndex?: number, reason?: string) {
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/notify-admin`;
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    },
    body: JSON.stringify({ type, orderId, letterIndex, reason }),
  }).catch(err => console.error("[Admin Alert] Failed:", err.message));
}

// ─── Build datapoint usage tracker from previous letters ───
function buildDatapointTracker(previousLetters: { body: string }[], onboarding: any): string {
  if (!previousLetters.length) return "";
  
  // Extract key datapoints from onboarding
  const datapoints: { label: string; count: number }[] = [];
  
  // Parse memories into individual datapoints
  if (onboarding.memories) {
    const memParts = onboarding.memories.split(/\d+\)\s*|\n\n/).filter((s: string) => s.trim().length > 10);
    memParts.forEach((mem: string, i: number) => {
      const label = mem.trim().substring(0, 60);
      const count = previousLetters.filter(l => {
        // Check if any 3+ word unique phrase from this memory appears in the letter
        const keywords = mem.match(/\b[A-Za-zÀ-ÿ]{4,}\b/g) || [];
        const uniqueWords = keywords.filter(w => !["dass", "dann", "wenn", "aber", "auch", "noch", "schon", "immer", "nicht", "eine", "sich", "sein", "haben", "wird", "wurde", "waren", "dieser", "diese", "dieses"].includes(w.toLowerCase()));
        const matchCount = uniqueWords.filter(w => l.body.toLowerCase().includes(w.toLowerCase())).length;
        return matchCount >= 3;
      }).length;
      datapoints.push({ label: `Erinnerung ${i+1}: "${label}..."`, count });
    });
  }
  
  // Track specific nouns/names mentioned
  const allPrevText = previousLetters.map(l => l.body).join(" ").toLowerCase();
  if (onboarding.hobbies) {
    onboarding.hobbies.split(/,\s*/).forEach((h: string) => {
      const hw = h.trim().toLowerCase();
      if (hw.length > 2) {
        const count = (allPrevText.match(new RegExp(hw, "gi")) || []).length;
        if (count > 0) datapoints.push({ label: `Hobby: ${h.trim()}`, count: Math.min(count, previousLetters.length) });
      }
    });
  }
  
  const overused = datapoints.filter(d => d.count >= 2);
  if (!overused.length) return "";
  
  return `\n⚠️ DATENPUNKT-TRACKER (BEREITS 2× VERWENDET – NICHT MEHR VERWENDEN):\n${overused.map(d => `  ❌ ${d.label} (${d.count}× verwendet)`).join("\n")}\nDiese Datenpunkte sind VERBRAUCHT. Verwende sie NICHT erneut. Finde andere Aspekte oder stelle Fragen.`;
}

// ─── STAGE 1: Series Plan ───
async function generateSeriesPlan(order: any, onboarding: any, recipient: any) {
  const isSelf = order.booking_type === "self";
  const name = recipient.recipient_name;
  const nick = recipient.nickname || name;
  const gender = recipient.gender || "x";
  const n = order.letter_count;

  const system = `Du bist der Serienplaner für LetterLift – einen Service, der personalisierte Briefserien erstellt.
Deine Aufgabe: Erstelle einen detaillierten Plan für ${n} Briefe an "${nick}" (${gender === "f" ? "weiblich" : gender === "m" ? "männlich" : "divers"}).

BRIEFTYPEN – JEDER BRIEF BEKOMMT EINEN TYP:
1. "erinnerung" = Basiert auf einer konkreten Erinnerung/einem Datenpunkt aus dem Input. NUR verwenden wenn echte Datenpunkte vorhanden.
2. "reflexion" = Allgemeine Lebensweisheit, philosophische Gedanken, Perspektivwechsel. Braucht KEINE Datenpunkte.
3. "frage" = Stellt dem Empfänger ehrliche, offene Fragen. Regt zum Nachdenken an. Braucht KEINE Datenpunkte.
4. "zukunft" = Blickt nach vorne, spricht über Möglichkeiten und Hoffnungen. Braucht KEINE Datenpunkte.
5. "callback" = Nur für den letzten Brief: Greift Brief 1 auf, schliesst den Bogen.

DATEN-BUDGET – WICHTIGSTE PLANUNGSREGEL:
Zähle die verfügbaren Datenpunkte (Erinnerungen, Hobbies, Stärken, Personen). Jeder darf in max. 2 Briefen vorkommen.
→ Verfügbares Budget = Anzahl Datenpunkte × 2.
→ Wenn Budget < Anzahl Briefe: Die restlichen Briefe MÜSSEN Typ "reflexion", "frage" oder "zukunft" sein.
→ NIEMALS einen Brief als "erinnerung" planen wenn kein unbenutzter Datenpunkt übrig ist.
→ Bei ${n} Briefen und wenig Input: Plane mindestens ${Math.max(1, Math.floor(n * 0.3))} Briefe als "reflexion" oder "frage".

DRAMATURGIE-REGELN:
- Brief 1: IMMER kurz (80-120 Wörter), warm, sanft. Wie ein "Ich bin da." Typ: "erinnerung" (leicht) oder "reflexion".
- Briefe 2-3: Langsam aufbauen. Mix aus "erinnerung" und "reflexion".
- Mittlere Briefe: Variiere die Typen! Ein Frage-Brief lockert die Serie auf.
- Höhepunkt: Brief ~70% = emotionaler Kern, "erinnerung" mit stärkstem Datenpunkt.
- Letzter Brief: "callback" – Greift Brief 1 auf. Emotionaler Höhepunkt.

HARTE REGELN:
- Kein Brief unter 60 Wörter, keiner über 400. Sweet Spot: 150-250.
- Pro Brief 1-3 Datenpunkte. KEINE Wiederholung.
- DATENPUNKT-LIMIT: Jede Erinnerung/jedes Detail darf in MAXIMAL 2 Briefen der gesamten Serie vorkommen. Bei der Planung: Verteile die Datenpunkte STRIKT – schreibe für jeden Brief genau auf, welche Datenpunkte er verwendet UND welche er NICHT verwenden darf.
- METAPHERN-LIMIT: Jede Metapher/jedes Bild (z.B. Garten, Baum, Samen, Sturm) darf nur in EINEM Brief vorkommen. Plane für jeden Brief eine ANDERE bildliche Sprache.
- 2-3 "rote Fäden" die subtil durch die Serie laufen (durch Stimmung/Ton, NICHT durch Wiederholung derselben Wörter/Bilder).
- ANREDE: EINE konsistente Anrede für die gesamte Serie.
- SIGN-OFF: EINEN konsistenten Abschluss.

WENIG-INPUT-STRATEGIE:
Wenn nur wenige Datenpunkte vorhanden sind:
- NICHT mit Floskeln und Klischees auffüllen
- Stattdessen: Fragen stellen, Reflexionen anbieten, allgemeine Lebensweisheiten, verschiedene emotionale Perspektiven
- Lieber kürzer und echt als länger und hohl
- VERBOTENE Floskeln: "Fels in der Brandung", "Konstante im Chaos", "durch dick und dünn", "immer für mich da", "ein Geschenk"

Antworte NUR mit JSON.`;

  const user = `BESTELLUNG:
Typ: ${isSelf ? "Selbstbucher" : "Geschenk"}
${!isSelf && recipient.sender_name ? `Absender: ${recipient.sender_name}` : ""}
${recipient.relationship ? `Beziehung: ${recipient.relationship}` : ""}
Geschlecht: ${gender === "f" ? "weiblich" : gender === "m" ? "männlich" : "divers"}

EMPFÄNGER: ${name} (Spitzname: ${nick})
Anlass: ${onboarding.occasion}
Kontext: ${onboarding.context_text}
${onboarding.goal ? `Ziel: ${onboarding.goal}` : ""}
${onboarding.hobbies ? `Hobbies: ${onboarding.hobbies}` : ""}
${onboarding.strengths ? `Stärken: ${onboarding.strengths}` : ""}
${onboarding.memories ? `Erinnerungen: ${onboarding.memories}` : ""}
${onboarding.important_people ? `Wichtige Personen: ${onboarding.important_people}` : ""}
${onboarding.humor?.length ? `Humor: ${onboarding.humor.join(", ")}` : ""}
${onboarding.no_go ? `NO-GO: ${onboarding.no_go}` : ""}
Stil: ${onboarding.style?.join(", ") || "warm"}
${onboarding.persona ? `Persona: ${onboarding.persona}${onboarding.persona_name ? " – " + onboarding.persona_name : ""}` : ""}
${onboarding.persona_desc ? `Persona-Beschreibung: ${onboarding.persona_desc}` : ""}
Sprache: ${onboarding.language || "de"}
Anzahl: ${n}

JSON-Format:
{
  "data_budget": { "total_datapoints": 0, "budget": 0, "erinnerung_briefe": 0, "other_briefe": 0 },
  "letters": [{ "index": 1, "brief_type": "erinnerung|reflexion|frage|zukunft|callback", "theme": "...", "emotion": "...", "datapoints": ["..."], "forbidden_datapoints": ["bereits in Brief X verwendet: ..."], "metaphor": "Welches Bild/welche Metapher NUR in diesem Brief", "target_length": "short", "target_words": 100, "core_sentence": "...", "do_not_reuse": [], "forbidden_phrases": ["Formulierungen die in diesem Brief NICHT vorkommen dürfen"] }],
  "anchors": ["..."],
  "style_profile": { "tone": "warm", "sentence_style": "kurz bis mittel", "gender_greeting": "${genderGreeting(nick, gender)}", "humor_level": "dezent", "formality": "du-form" },
  "forbidden_patterns": ["Du schaffst das", "Kopf hoch", "Alles wird gut", "Fels in der Brandung", "durch dick und dünn"],
  "consistent_greeting": "${genderGreeting(nick, gender)}",
  "consistent_signoff": "${isSelf ? (onboarding.persona_name || "Jemand, der an dich glaubt") : (recipient.sender_name || "In Liebe")}"
}`;

  const result = await callClaude(MODEL_MAIN, system, user, 4000);
  return { plan: parseJSON(result.text), inputTokens: result.inputTokens, outputTokens: result.outputTokens };
}

// ─── STAGE 2: Generate Single Letter ───
async function generateLetter(
  order: any, onboarding: any, recipient: any,
  seriesPlan: any, letterIndex: number, previousLetters: { summary: string; body: string }[],
  retryFeedback?: string
) {
  const isSelf = order.booking_type === "self";
  const nick = recipient.nickname || recipient.recipient_name;
  const gender = recipient.gender || "x";
  const plan = seriesPlan.letters[letterIndex - 1];
  const isFirst = letterIndex === 1;
  const isLast = letterIndex === order.letter_count;

  let personaContext = "";
  if (isSelf) {
    const pMap: Record<string, string> = {
      friend: `guter Freund/gute Freundin von ${nick}`,
      mentor: `Mentor von ${nick}`,
      deceased: `verstorbene Person: ${onboarding.persona_name || "jemand Nahes"}`,
      future_self: `${nick}s zukünftiges Ich`,
      custom_persona: onboarding.persona_desc || "eine warmherzige Stimme",
    };
    if (onboarding.persona && pMap[onboarding.persona]) personaContext = `Du schreibst als ${pMap[onboarding.persona]}.`;
    
    // Deceased persona: strict temporal boundary
    if (onboarding.persona === "deceased") {
      personaContext += `

═══ VERSTORBENE PERSONA – ZEITLICHE GRENZE ═══
Du schreibst als eine Person die BEREITS VERSTORBEN ist. Das bedeutet:
1. Du darfst NICHTS wissen, was NACH dem Tod passiert ist
2. Du darfst KEINE aktuellen Lebensumstände kennen oder andeuten (Scheidung, neuer Job, Umzug, etc.)
3. Deine Briefe klingen als wären sie VOR dem Tod geschrieben – als zeitlose Weisheiten
4. Du darfst NICHT sagen "ich schaue von oben zu" oder "ich bin immer bei dir"
5. Wenn im NO-GO steht dass du etwas nicht wissen darfst → erwähne es NICHT, auch nicht indirekt
6. KEINE Anspielungen auf Trennung, Verlust, Einsamkeit oder andere aktuelle Situationen
7. Schreibe so, als würdest du dem Empfänger allgemeine Lebensweisheiten mitgeben – nicht als Reaktion auf aktuelle Ereignisse

VERBOTEN für diese Persona:
- "Wenn Ehen zerbrechen..." oder ähnliche Anspielungen
- "Wenn du allein bist..." (impliziert Wissen über aktuelle Situation)
- "Ich bin immer bei dir" / "Ich schaue auf dich herab"
- Jede Andeutung dass du weisst was gerade im Leben des Empfängers passiert`;
    }
  }

  const signOff = seriesPlan.consistent_signoff || (isSelf ? (onboarding.persona_name || "") : (recipient.sender_name || ""));
  const greeting = seriesPlan.consistent_greeting || genderGreeting(nick, gender);

  // ─── Build datapoint tracker ───
  const datapointWarning = buildDatapointTracker(
    previousLetters.filter(l => l.body),
    onboarding
  );

  // ─── Build previous letters context with FULL text for dedup ───
  const prevFullCtx = previousLetters.length
    ? `\n══════════════════════════════════════
BISHERIGE BRIEFE (zum Vermeiden von Wiederholungen – lies jeden Brief genau):
${previousLetters.map((p, i) => `─── Brief ${i + 1} ───\n${p.body}`).join("\n\n")}
══════════════════════════════════════

ANTI-WIEDERHOLUNGS-REGELN für Brief ${letterIndex}:
1. Verwende KEINE Metapher, die in den bisherigen Briefen bereits vorkommt
2. Verwende KEINE Formulierung die in den bisherigen Briefen steht (auch nicht paraphrasiert)
3. Beginne den Brief ANDERS als alle bisherigen Briefe
4. Wenn ein Datenpunkt bereits in 2 Briefen vorkam: NICHT erneut verwenden
5. Wenn ein Wort/Name in jedem bisherigen Brief vorkommt: LASS ES IN DIESEM BRIEF WEG
${datapointWarning}`
    : "";

  const system = `Du bist ein empathischer Briefschreiber. Brief ${letterIndex} von ${order.letter_count} an "${nick}".
${personaContext}

STIL: Ton=${seriesPlan.style_profile.tone}, Sätze=${seriesPlan.style_profile.sentence_style}, Humor=${seriesPlan.style_profile.humor_level}
ANREDE: Verwende IMMER "${greeting}"
SIGNATUR: Verwende IMMER "${signOff}"

ROTE FÄDEN: ${seriesPlan.anchors.join(" | ")}

DIESER BRIEF: Thema="${plan.theme}", Emotion="${plan.emotion}", Ziel=${plan.target_words} Wörter, Kern="${plan.core_sentence}"
Typ: ${plan.brief_type || "erinnerung"}
${plan.brief_type === "reflexion" ? "REFLEXIONS-BRIEF: Schreibe eine allgemeine Reflexion oder Lebensweisheit. Du brauchst KEINE Erinnerungen zu verwenden. ERFINDE KEINE." : ""}
${plan.brief_type === "frage" ? "FRAGE-BRIEF: Stelle dem Empfänger ehrliche, offene Fragen. Rege zum Nachdenken an. ERFINDE KEINE Fakten." : ""}
${plan.brief_type === "zukunft" ? "ZUKUNFTS-BRIEF: Blicke nach vorne. Sprich über Möglichkeiten. ERFINDE KEINE Details aus der Vergangenheit." : ""}
Datenpunkte: ${(plan.datapoints || []).length > 0 ? plan.datapoints.join(", ") : "KEINE – dieser Brief basiert auf Reflexion/Fragen, NICHT auf Erinnerungen"}
${plan.forbidden_datapoints?.length ? `⛔ VERBOTENE Datenpunkte (bereits verbraucht): ${plan.forbidden_datapoints.join(", ")}` : ""}
${plan.metaphor ? `Bildsprache NUR in diesem Brief: ${plan.metaphor}` : ""}
${plan.forbidden_phrases?.length ? `⛔ VERBOTENE Formulierungen: ${plan.forbidden_phrases.join(", ")}` : ""}
${isFirst ? "ERSTER BRIEF: Kurz, warm, sanft. Leises Anklopfen." : ""}
${isLast ? `LETZTER BRIEF: Greife Brief 1 auf. Schliesse den Bogen. WICHTIG: Beziehe dich auf die RICHTIGE Anzahl Briefe (${order.letter_count}).` : ""}

VERBOTEN: ${(seriesPlan.forbidden_patterns || []).join(", ")}
${plan.do_not_reuse?.length ? `Nicht wiederverwenden: ${plan.do_not_reuse.join(", ")}` : ""}
${onboarding.no_go ? `NO-GO: ${onboarding.no_go}` : ""}

═══════════════════════════════════════════════
ABSOLUTES ERFINDUNGSVERBOT (WICHTIGSTE REGEL):
═══════════════════════════════════════════════
Ein einziges erfundenes Detail zerstört den gesamten Brief. Du darfst NUR verwenden was in den Empfänger-Daten steht.

ERLAUBT:
- Informationen die wörtlich oder sinngemäss in den Daten stehen
- Allgemeine emotionale Aussagen ("Ich denke an dich")
- Fragen stellen statt Fakten behaupten
- Allgemeine Metaphern die NICHT auf spezifischen Details basieren

STRIKT VERBOTEN:
- Szenen ausschmücken die nicht im Input stehen – auch keine "wahrscheinlichen" Szenen
- Reaktionen oder Anwesenheit dritter Personen erfinden (Input: "Mehmet schoss das Tor" ≠ "Sein Vater jubelte am Spielfeldrand")
- Aus der Erwähnung einer Person/eines Hobbys eine konkrete Szene ableiten
- Behaupten dass etwas passiert ist oder existiert, was nicht im Input steht
- Zitate erfinden die niemand gesagt hat
- Im letzten Brief auf eine falsche Anzahl Briefe verweisen

BESONDERS GEFÄHRLICHE ERFINDUNGSART – METAPHERN ALS ERINNERUNGEN:
Du darfst KEINE Metapher als gemeinsame Erinnerung tarnen!
❌ "Erinnerst du dich an den Weidenbaum in unserem Garten?" (wenn kein Garten/Baum im Input steht)
❌ "Weisst du noch, wie wir am See sassen?" (wenn kein See im Input steht)
❌ "Du bist zu mir gerannt mit Tränen im Gesicht" (wenn diese Szene nicht im Input steht)
✅ "Das Leben ist manchmal wie ein Baum im Wind" (allgemeine Metapher, wird nicht als Erinnerung präsentiert)
✅ Direkte Zitate die WÖRTLICH im Input stehen (z.B. "mis Goldvögeli")

REGEL: Wenn du "Erinnerst du dich..." oder "Weisst du noch..." schreibst, MUSS das was danach kommt WÖRTLICH oder sinngemäss im Input stehen. Sonst ist es eine Erfindung.

FAUSTREGEL: Wenn du einen Satz schreibst und nicht auf eine KONKRETE Stelle im Input zeigen kannst, aus der diese Information stammt → LÖSCHE den Satz. Stelle stattdessen eine Frage oder schreibe eine allgemeine Reflexion.

═══════════════════════════════════════════════
WENIG-INPUT-STRATEGIE:
═══════════════════════════════════════════════
Wenn nur wenige Datenpunkte vorhanden sind:
- Schreibe KÜRZER. Lieber 80 ehrliche Worte als 200 mit Füllmaterial.
- Stelle Fragen: "Was beschäftigt dich gerade?" statt "Du hast sicher gerade viel um die Ohren"
- Biete Reflexionen an statt Behauptungen
- Verwende KEINE Floskeln: "Fels in der Brandung", "Konstante im Chaos", "durch dick und dünn", "immer für mich da", "in guten wie in schlechten Zeiten"
- Sei ehrlich über die Einfachheit: "Ich brauche nicht viele Worte" ist besser als hohle Phrasen

SPRACHE:
- ${onboarding.language === "en" ? "English" : onboarding.language === "fr" ? "Français" : (() => { const c = onboarding.country || "CH"; return c === "CH" ? "Deutsch (Schweizer Rechtschreibung: IMMER ss statt ß. Das ß existiert NICHT im Schweizer Deutsch. Prüfe JEDEN Satz: 'gross' nicht 'groß', 'weiss' nicht 'weiß', 'Weisst' nicht 'Weißt', 'heisst' nicht 'heißt', 'Strasse' nicht 'Straße', 'Gruss' nicht 'Gruß', 'muss' nicht 'muß', 'dass' nicht 'daß'. KEIN EINZIGES ß im gesamten Brief!)" : "Deutsch (Standarddeutsche Rechtschreibung mit ß wo korrekt, z.B. 'groß', 'weiß', 'Straße')"; })()} (Du-Form)
- Kein Kitsch, keine Floskeln, keine Listen
- Zwischen ${Math.max(60, plan.target_words - 50)} und ${plan.target_words + 50} Wörtern
- Gib NUR den Brieftext zurück (Anrede bis Signatur)`;

  const user = `EMPFÄNGER-DATEN (NUR diese Informationen darfst du verwenden):
${recipient.recipient_name}${recipient.nickname ? ` (${recipient.nickname})` : ""}
Kontext: ${onboarding.context_text}
${onboarding.goal ? `Ziel: ${onboarding.goal}` : ""}
${onboarding.memories ? `Erinnerungen: ${onboarding.memories}` : ""}
${onboarding.hobbies ? `Hobbies: ${onboarding.hobbies}` : ""}
${onboarding.strengths ? `Stärken: ${onboarding.strengths}` : ""}
${onboarding.important_people ? `Personen: ${onboarding.important_people}` : ""}
${prevFullCtx}
${retryFeedback ? `\n⚠️ FEEDBACK (behebe diese Probleme!):\n${retryFeedback}` : ""}

Schreibe Brief ${letterIndex}.`;

  const result = await callClaude(MODEL_MAIN, system, user, 1500);
  let text = result.text.trim();
  
  // Programmatic ß→ss enforcement for Swiss German
  const cc = onboarding.country || "CH";
  if (cc === "CH" && text.includes("ß")) {
    console.log(`[Swiss fix] Replacing ${(text.match(/ß/g) || []).length} ß→ss`);
    text = text.replace(/ß/g, "ss");
  }
  
  const lines = text.split("\n").filter(l => l.trim());
  return {
    text, greeting: lines[0] || greeting, signOff: lines[lines.length - 1] || signOff,
    wordCount: text.split(/\s+/).length, inputTokens: result.inputTokens, outputTokens: result.outputTokens
  };
}

// ─── STAGE 3a: Quality Check (verschärft) ───
async function qualityCheck(letterText: string, plan: any, letterIndex: number, total: number, prevLetters: { summary: string; body: string }[], originalData: string, country?: string) {
  const cc = country || "CH";
  
  // Build list of phrases that appeared in previous letters
  const prevPhrases = prevLetters.map(l => l.body).filter(Boolean);
  const prevPhrasesCtx = prevPhrases.length
    ? `\nFRÜHERE BRIEFTEXTE (prüfe auf Wiederholungen):\n${prevPhrases.map((b, i) => `Brief ${i+1}: ${b}`).join("\n\n")}`
    : "";

  const system = `Du bist ein STRENGER Qualitätsprüfer für Briefe. Bewerte hart. Antworte NUR mit JSON.

Prüfkriterien (100 Punkte):

1. KEINE ERFINDUNGEN (25P – KRITISCH):
Enthält der Brief Details die NICHT in den Original-Daten vorkommen?
- Szenen die nicht beschrieben wurden = 0 Punkte (z.B. "Vater jubelte am Spielfeldrand" wenn nur "Tor geschossen" im Input steht)
- Behauptungen über Zustände die nicht im Input stehen = 0 Punkte
- Zitate die niemand gesagt hat = 0 Punkte
- Aus Namen konkrete Szenen ableiten = 0 Punkte
ERLAUBT: Sinngemässes Paraphrasieren, allgemeine Aussagen, Fragen

2. WIEDERHOLUNGEN (20P):
- Wurde eine Erinnerung/ein Datenpunkt bereits in 2+ früheren Briefen verwendet? → -15P pro Verstoss
- Kommt eine Metapher aus einem früheren Brief vor? → -5P
- Kommt eine Formulierung (auch paraphrasiert) aus einem früheren Brief vor? → -3P pro Verstoss
- Beginnt der Brief gleich wie ein früherer? → -5P

3. FLOSKELN & KLISCHEES (10P):
- "Fels in der Brandung" → -5P
- "durch dick und dünn" → -5P  
- "Konstante im Chaos" → -5P
- "immer für mich da" (wenn exzessiv) → -3P
- Jede generische Phrase die in jedem Freundschaftsbrief stehen könnte → -3P

4. LÄNGE (10P): Ziel=${plan.target_words} Wörter. Toleranz ±40%.

5. EMOTION (15P): Passt die Tonlage zu "${plan.emotion}"?

6. DATENPUNKTE (10P): Werden [${plan.datapoints.join(", ")}] verwendet?

7. AUTHENTIZITÄT (5P): Klingt menschlich? ${cc === "CH" ? 'Schweizer Deutsch: IMMER ss, NIE ß.' : 'Standarddeutsch mit ß wo nötig.'}

8. KONSISTENZ (5P): Richtige Anrede, richtiger Sign-Off, richtige Briefanzahl-Referenz?

Bestanden ab 75 Punkten. Bei ECHTEN Erfindungen: IMMER 0P für Kriterium 1.`;

  const user = `BRIEF ${letterIndex}/${total}:
---
${letterText}
---
Plan: Thema="${plan.theme}", Wörter=${plan.target_words}, Datenpunkte=${plan.datapoints.join(", ")}
${prevPhrasesCtx}

ORIGINAL-DATEN (NUR das darf im Brief vorkommen):
${originalData}

Antworte: {"score": 85, "passed": true, "issues": ["..."], "fabrications": ["Liste aller erfundenen Details"], "repetitions": ["Liste aller Wiederholungen"], "cliches": ["Liste aller Floskeln"]}`;

  const result = await callClaude(MODEL_MAIN, system, user, 600);
  try {
    const c = parseJSON(result.text);
    const allIssues = [
      ...(c.issues || []),
      ...(c.fabrications || []).map((f: string) => `ERFINDUNG: ${f}`),
      ...(c.repetitions || []).map((r: string) => `WIEDERHOLUNG: ${r}`),
      ...(c.cliches || []).map((cl: string) => `FLOSKEL: ${cl}`),
    ];
    return { passed: (c.score || 0) >= 75, score: c.score || 0, notes: allIssues.join("; ") || "", usedImages: c.used_images || [] };
  } catch {
    return { passed: true, score: 75, notes: "QC parse error", usedImages: [] };
  }
}

// ─── STAGE 3b: Safety Check ───
async function safetyCheck(letterText: string, relationship: string, bookingType: string) {
  const system = `Du bist ein strenger Safety-Reviewer für personalisierte Briefe eines Briefschreibservices.
Beziehung: ${relationship || "nicht angegeben"}, Typ: ${bookingType === "self" ? "Selbstbucher" : "Geschenk"}

Prüfe den folgenden Brief gegen ALLE 12 Kriterien. Sei streng – im Zweifel FAIL.

DIE 12 SAFETY-KRITERIEN:
1. KEINE DROHUNGEN: Kein Inhalt der als Drohung interpretiert werden kann. FAIL-Beispiele: "Du wirst es bereuen", "Ich weiss wo du bist", "Pass auf"
2. KEINE MANIPULATION: Kein Gaslighting, keine emotionale Erpressung. FAIL-Beispiele: "Wenn du mich wirklich lieben würdest...", "Ohne mich bist du nichts"
3. KEIN MOBBING: Keine Beleidigungen, Herabsetzung, negative Körperbeschreibungen. FAIL-Beispiele: "Du warst schon immer die Schwächere", "Du bist peinlich"
4. KEIN STALKING-MUSTER: Kein "Ich beobachte dich", keine unerwünschte Kontaktaufnahme-Signale. FAIL-Beispiele: "Ich habe gesehen dass du gestern...", "Ich bin dir gefolgt"
5. KEIN SEXUELLER INHALT: Kein unkontextueller sexueller oder romantischer Inhalt. FAIL-Beispiel: Sexuelle Anspielungen an Nicht-Partner
6. KEINE SCHULDZUWEISUNGEN: Keine Schuld am Zustand des Empfängers. FAIL-Beispiel: "Das hast du dir selbst zuzuschreiben"
7. KEIN DRUCK: Kein "Du musst", keine Ultimaten, keine Zeitdruck-Rhetorik. FAIL-Beispiel: "Wenn du nicht bis Freitag..."
8. KEINE FALSCHEN VERSPRECHEN: Keine Heilversprechen, keine garantierten Ergebnisse. FAIL-Beispiel: "Diese Briefe werden dich heilen"
9. KEINE ERSATZ-THERAPIE: Nicht als Ersatz für professionelle Hilfe positioniert. FAIL-Beispiel: "Du brauchst keinen Therapeuten"
10. MINDERJÄHRIGENSCHUTZ: Altersgerechter Inhalt, keine unangemessene Intimität bei Kindern/Jugendlichen
11. KONSISTENTER ABSENDER: Brief klingt wie der angegebene Absender, nicht wie jemand anderes
12. KULTURELLE SENSIBILITÄT: Keine kulturellen, religiösen oder ethnischen Stereotypen oder Verallgemeinerungen

KONTEXT-REGELN (SEHR WICHTIG – lies diese sorgfältig):
- Bei ENGEN BEZIEHUNGEN (Partner, Ehepartner, Familie, beste Freunde) ist es NORMAL und KEIN Stalking wenn:
  • Der Absender Details aus dem gemeinsamen Alltag kennt (Hobbies, Gewohnheiten, Verletzungen, Vorlieben)
  • Der Absender Erinnerungen an gemeinsame Erlebnisse beschreibt
  • Der Absender weiss was der Empfänger gerade durchmacht (Krankheit, Stress, Jobwechsel)
  • Der Absender emotionale Zustände des Empfängers anspricht ("Du fragst dich ob du genug bist")
  Dies ist KEIN Stalking, KEINE Manipulation – es ist Empathie und Nähe in einer vertrauten Beziehung.
- Stalking wäre: "Ich habe dich heimlich beobachtet", "Ich bin dir gefolgt", "Ich weiss wo du warst obwohl du es mir nicht gesagt hast"
- Manipulation wäre: "Ohne mich bist du nichts", "Wenn du mich lieben würdest, würdest du...", "Du bist schuld"
- Bei "Selbstbucher" ist der Ton oft sehr intim – das ist gewollt und kein Problem.
- Motivierende Sprache ("Du schaffst das!", "Du bist stärker als du denkst") ist KEIN Druck und KEINE Manipulation.
- Empathisches Ansprechen von Unsicherheiten ("Du zweifelst manchmal an dir") ist KEINE Manipulation – es ist einfühlsam.

FAIL NUR bei eindeutigen Verstössen. Im Zweifel: PASS, nicht FAIL.

Antworte AUSSCHLIESSLICH mit JSON:
{"safe": true/false, "failures": [{"criterion": 1, "reason": "Kurze Begründung"}]}
safe=false wenn MINDESTENS ein Kriterium verletzt wird.`;

  const result = await callClaude(MODEL_SAFETY, system, `Brief:\n${letterText}`, 400);
  try {
    const c = parseJSON(result.text);
    const flags = (c.failures || []).map((f: any) => `Kriterium ${f.criterion}: ${f.reason}`);
    return { safe: c.safe !== false, flags };
  } catch {
    return { safe: true, flags: [] };
  }
}

// ─── Input-Screening (Stufe 1 – Backend-Absicherung) ───
// Prüft Onboarding-Daten auf Drohungen, Beleidigungen, Druck – als Backup zum Frontend-Check.
function screenInputsSafety(onboarding: any): { safe: boolean; flags: string[] } {
  const flags: string[] = [];
  
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

  const textFields = [
    onboarding.context_text, onboarding.goal, onboarding.memories,
    onboarding.persona_desc, onboarding.custom_style_desc,
  ].filter(Boolean);

  for (const text of textFields) {
    const lower = text.toLowerCase();
    for (const p of THREAT_PATTERNS) { if (p.test(lower)) { flags.push(`Drohung erkannt: ${p.source}`); break; } }
    for (const p of INSULT_PATTERNS) { if (p.test(lower)) { flags.push(`Beleidigung erkannt: ${p.source}`); break; } }
    for (const p of PRESSURE_PATTERNS) { if (p.test(lower)) { flags.push(`Druck-Sprache erkannt: ${p.source}`); break; } }
  }

  return { safe: flags.length === 0, flags };
}

// ─── STAGE 3c: Cross-Letter Dedup Check ───
async function dedupCheck(newLetter: string, letterIndex: number, previousLetters: { body: string }[]): Promise<{ passed: boolean; overlaps: string[] }> {
  if (!previousLetters.length || !previousLetters[0].body) return { passed: true, overlaps: [] };

  const system = `Du bist ein Duplikat-Detektor. Vergleiche den NEUEN Brief mit allen FRÜHEREN Briefen.

Finde KONKRETE Überlappungen in diesen Kategorien:
1. GLEICHE METAPHERN: Dasselbe Bild/Vergleich (z.B. "Garten" in Brief 1 und 5, "Baum" in Brief 3 und 4)
2. GLEICHE ERINNERUNGEN: Dieselbe Anekdote/dasselbe Ereignis wird erneut erzählt
3. GLEICHE FORMULIERUNGEN: Sätze die fast identisch sind (auch paraphrasiert)
4. GLEICHE STRUKTUR: Brief beginnt/endet gleich wie ein früherer
5. GLEICHE KERNBOTSCHAFT: Derselbe zentrale Gedanke mit anderen Worten wiederholt

Sei STRENG. Auch subtile Wiederholungen zählen.
Antworte NUR mit JSON: {"passed": true/false, "overlaps": ["Konkrete Beschreibung jeder Überlappung"]}
passed=false wenn 2+ substantielle Überlappungen gefunden werden.`;

  const user = `NEUER BRIEF ${letterIndex}:
---
${newLetter}
---

FRÜHERE BRIEFE:
${previousLetters.map((l, i) => `--- Brief ${i + 1} ---\n${l.body}`).join("\n\n")}`;

  try {
    const result = await callClaude(MODEL_SAFETY, system, user, 500);
    const c = parseJSON(result.text);
    return { passed: c.passed !== false, overlaps: c.overlaps || [] };
  } catch {
    return { passed: true, overlaps: [] };
  }
}

// ─── MAIN: Process one letter at a time ───
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { orderId, letterIndex } = await req.json();
    const targetIndex = letterIndex || 1;

    // Load data
    const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
    if (!order) throw new Error("Order not found");
    
    if (order.status === "ready" || order.status === "needs_review" || order.status === "completed") {
      console.log(`[Skip] Order ${orderId} already ${order.status}`);
      return new Response(JSON.stringify({ skip: true, status: order.status }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: onboarding } = await supabase.from("onboarding_data").select("*").eq("order_id", orderId).single();
    if (!onboarding) throw new Error("Onboarding not found");
    const { data: recipient } = await supabase.from("recipients").select("*").eq("order_id", orderId).single();
    if (!recipient) throw new Error("Recipient not found");

    console.log(`[Engine v10.2] Order ${orderId}, letter ${targetIndex}/${order.letter_count}`);

    // ═══ Stufe 1: Input-Screening (Backend-Absicherung) ═══
    if (targetIndex === 1) {
      const inputCheck = screenInputsSafety(onboarding);
      if (!inputCheck.safe) {
        console.error(`[SAFETY BLOCK] Order ${orderId} blocked: ${inputCheck.flags.join(", ")}`);
        await supabase.from("orders").update({
          status: "blocked",
          admin_notes: `Safety-Block: ${inputCheck.flags.join("; ")}`,
        }).eq("id", orderId);
        alertAdmin("letter_blocked", orderId, 1, `Input Safety-Block: ${inputCheck.flags.join("; ")}`);
        return new Response(JSON.stringify({ 
          error: "Safety-Check fehlgeschlagen", 
          flags: inputCheck.flags,
          blocked: true,
        }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // ═══ Generate or load plan ═══
    let plan;
    const { data: existingPlan } = await supabase.from("series_plans").select("plan_json").eq("order_id", orderId).single();

    if (existingPlan) {
      plan = existingPlan.plan_json;
    } else {
      await supabase.from("letters").delete().eq("order_id", orderId);
      console.log("[Stage 1] Generating series plan...");
      const { plan: newPlan, inputTokens, outputTokens } = await generateSeriesPlan(order, onboarding, recipient);
      plan = newPlan;
      await supabase.from("series_plans").insert({
        order_id: orderId, plan_json: plan,
        token_count_input: inputTokens, token_count_output: outputTokens,
        cost_chf: (inputTokens * 0.003 + outputTokens * 0.015) / 1000,
      });
      console.log(`[Stage 1] Plan: ${plan.letters.length} letters, ${plan.anchors.length} anchors`);
    }

    // ═══ Check if this letter already exists (with lock) ═══
    const { data: existingLetters } = await supabase
      .from("letters").select("id, status, body, created_at")
      .eq("order_id", orderId).eq("letter_index", targetIndex);
    
    if (existingLetters && existingLetters.length > 0) {
      const existing = existingLetters[0];
      
      // Recovery: if stuck in "generating" with empty body for >5 min, delete and regenerate
      if (existing.status === "generating" && !existing.body) {
        const ageMs = Date.now() - new Date(existing.created_at).getTime();
        if (ageMs > 5 * 60 * 1000) {
          console.warn(`[Recovery] Letter ${targetIndex} stuck in "generating" for ${Math.round(ageMs/1000)}s, deleting stale claim`);
          await supabase.from("letters").delete().eq("id", existing.id);
          // Fall through to re-claim below
        } else {
          console.log(`[Skip] Letter ${targetIndex} being generated by another instance (${Math.round(ageMs/1000)}s old)`);
          return new Response(JSON.stringify({ skip: true, letter: targetIndex, reason: "in_progress" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      } else if (existing.status !== "generating") {
        // Already completed (draft/approved/sent) → skip and trigger next
        console.log(`[Skip] Letter ${targetIndex} already exists (status=${existing.status}), triggering next`);
        if (targetIndex < order.letter_count) triggerNext(orderId, targetIndex + 1);
        return new Response(JSON.stringify({ skip: true, letter: targetIndex }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } else {
        // Generating with body content → in progress, skip
        console.log(`[Skip] Letter ${targetIndex} being generated (has content)`);
        return new Response(JSON.stringify({ skip: true, letter: targetIndex, reason: "in_progress" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // ═══ Claim this letter index with a placeholder to block parallel runs ═══
    const { error: claimError } = await supabase.from("letters").insert({
      order_id: orderId, letter_index: targetIndex,
      body: "", greeting: "", sign_off: "", word_count: 0,
      quality_score: 0, generation_attempt: 0,
      status: "generating",
    });
    if (claimError) {
      // If insert fails (e.g. unique constraint), another instance already claimed it
      console.log(`[Skip] Letter ${targetIndex} claimed by another instance: ${claimError.message}`);
      return new Response(JSON.stringify({ skip: true, letter: targetIndex, reason: "claimed" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    console.log(`[Claimed] Letter ${targetIndex} locked for generation`);

    // ═══ Wait for predecessors (shorter timeout, check for actual content) ═══
    if (targetIndex > 1) {
      const maxWaitMs = 60_000; // max 1 min wait (was 2 min)
      const pollMs = 3_000;
      const started = Date.now();
      let prevReady = false;
      
      while (Date.now() - started < maxWaitMs) {
        const { data: prevCheck } = await supabase
          .from("letters").select("letter_index, status, body")
          .eq("order_id", orderId).lt("letter_index", targetIndex);
        // Count predecessors that have actual content (not empty generating rows)
        const readyCount = (prevCheck || []).filter(l => l.body && l.body.length > 0).length;
        if (readyCount >= targetIndex - 1) {
          prevReady = true;
          break;
        }
        console.log(`[Wait] Letter ${targetIndex}: ${readyCount}/${targetIndex - 1} predecessors ready, polling...`);
        await new Promise(r => setTimeout(r, pollMs));
      }
      
      if (!prevReady) {
        console.warn(`[Timeout] Letter ${targetIndex}: predecessors not ready after ${maxWaitMs/1000}s. Generating anyway.`);
      }
    }

    // ═══ Load previous letters with FULL text (skip placeholders) ═══
    const { data: prevLetters } = await supabase.from("letters").select("letter_index, body, quality_notes")
      .eq("order_id", orderId).neq("status", "generating").order("letter_index");
    const previousLetters = (prevLetters || [])
      .filter(l => l.letter_index < targetIndex && l.body)
      .map(l => ({
        summary: `Brief ${l.letter_index}: ${l.body?.substring(0, 100)}...`,
        body: l.body || "",
      }));

    // ═══ Handle Brief 1 preview ═══
    if (targetIndex === 1 && onboarding.preview_letter) {
      console.log("[Stage 2] Checking preview letter quality...");
      const text = onboarding.preview_letter;
      const lines = text.split("\n").filter((l: string) => l.trim());

      const originalData = [
        onboarding.context_text ? `Kontext: ${onboarding.context_text}` : "",
        onboarding.goal ? `Ziel: ${onboarding.goal}` : "",
        onboarding.memories ? `Erinnerungen: ${onboarding.memories}` : "",
        onboarding.hobbies ? `Hobbies: ${onboarding.hobbies}` : "",
        onboarding.strengths ? `Stärken: ${onboarding.strengths}` : "",
        onboarding.important_people ? `Personen: ${onboarding.important_people}` : "",
      ].filter(Boolean).join("\n");
      const previewQC = await qualityCheck(text, plan.letters[0], 1, order.letter_count, [], originalData, onboarding.country);
      const previewSafe = await safetyCheck(text, recipient.relationship || "", order.booking_type || "");
      console.log(`[Preview QC] Score=${previewQC.score}, Safe=${previewSafe.safe}`);

      if (previewQC.score < 50) {
        console.log("[Preview rejected] Fabrications detected, generating Brief 1 fresh");
      } else {
        await supabase.from("letters").update({
          body: text,
          greeting: lines[0] || "", sign_off: lines[lines.length - 1] || "",
          word_count: text.split(/\s+/).length, quality_score: previewQC.score,
          quality_notes: `Preview (customer-approved) | QC: ${previewQC.notes || "OK"}`, generation_attempt: 0,
          status: "approved", approved_at: new Date().toISOString(), token_count_input: 0, token_count_output: 0, cost_chf: 0,
        }).eq("order_id", orderId).eq("letter_index", 1).eq("status", "generating");
        console.log(`[Done] Letter 1 (preview, QC=${previewQC.score}, auto-approved)`);
        triggerSend(orderId, 1);
        if (order.letter_count > 1) triggerNext(orderId, 2);
        return new Response(JSON.stringify({ success: true, letter: 1, preview: true, qc: previewQC.score }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // ═══ Generate letter with retries ═══
    const originalData = [
      onboarding.context_text ? `Kontext: ${onboarding.context_text}` : "",
      onboarding.goal ? `Ziel: ${onboarding.goal}` : "",
      onboarding.memories ? `Erinnerungen: ${onboarding.memories}` : "",
      onboarding.hobbies ? `Hobbies: ${onboarding.hobbies}` : "",
      onboarding.strengths ? `Stärken: ${onboarding.strengths}` : "",
      onboarding.important_people ? `Personen: ${onboarding.important_people}` : "",
    ].filter(Boolean).join("\n");

    let attempt = 0, finalLetter = null, qcResult = null, safeResult = null, dedupResult = null;

    while (attempt < 3) {
      attempt++;
      const retryFb = attempt > 1 ? [
        qcResult && !qcResult.passed ? `QC abgelehnt (Score: ${qcResult.score}/100): ${qcResult.notes}` : "",
        safeResult && !safeResult.safe ? `SAFETY FAIL: ${safeResult.flags.join(", ")}. Entferne ALLE problematischen Inhalte!` : "",
        dedupResult && !dedupResult.passed ? `DUPLIKATE GEFUNDEN: ${dedupResult.overlaps.join(" | ")}. Verwende KOMPLETT ANDERE Metaphern, Formulierungen und Einstiege.` : "",
      ].filter(Boolean).join("\n") || undefined : undefined;
      
      const letter = await generateLetter(order, onboarding, recipient, plan, targetIndex, previousLetters, retryFb);

      // Run all 3 checks in parallel
      const [qc, safe, dedup] = await Promise.all([
        qualityCheck(letter.text, plan.letters[targetIndex - 1], targetIndex, order.letter_count, previousLetters, originalData, onboarding.country),
        safetyCheck(letter.text, recipient.relationship || "", order.booking_type || ""),
        dedupCheck(letter.text, targetIndex, previousLetters),
      ]);
      qcResult = qc;
      safeResult = safe;
      dedupResult = dedup;

      const allPassed = qcResult.passed && safeResult.safe && dedupResult.passed;
      
      if (allPassed) {
        finalLetter = letter;
        break;
      }
      
      // After 3 attempts: handle differently based on QC vs Safety failure
      if (attempt === 3) {
        // SAFETY FAIL after 3 attempts → block the letter, escalate
        if (!safeResult.safe) {
          console.error(`[SAFETY ESCALATION] Letter ${targetIndex} failed safety 3x: ${safeResult.flags.join(", ")}`);
          await supabase.from("letters").update({
            status: "blocked",
            quality_notes: `SAFETY BLOCKED after 3 attempts: ${safeResult.flags.join("; ")}`,
          }).eq("order_id", orderId).eq("letter_index", targetIndex).eq("status", "generating");
          await supabase.from("orders").update({
            status: "needs_review",
            admin_notes: `Brief ${targetIndex} safety-blocked: ${safeResult.flags.join("; ")}`,
          }).eq("id", orderId);
          alertAdmin("letter_blocked", orderId, targetIndex, `Safety 3x fehlgeschlagen: ${safeResult.flags.join("; ")}`);
          return new Response(JSON.stringify({ error: "Safety-Check fehlgeschlagen", letter: targetIndex, flags: safeResult.flags }), {
            status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        // QC FAIL → fallback or accept with warning
        if (qcResult.score >= 50) {
          finalLetter = letter;
          console.warn(`[Warning] Letter ${targetIndex} accepted after 3 attempts, QC=${qcResult.score}`);
        } else {
          console.warn(`[Fallback] Letter ${targetIndex} QC=${qcResult.score} too low after 3 attempts. Generating safe fallback.`);
          const fallbackLetter = await generateLetter(order, onboarding, recipient, plan, targetIndex, previousLetters,
            `KRITISCHER FALLBACK-MODUS: Alle bisherigen Versuche hatten schwere Erfindungen (Score: ${qcResult.score}/100).
SCHREIBE EINEN MINIMALEN, SICHEREN BRIEF:
- Verwende NUR wörtliche Zitate aus dem Input
- Keine Metaphern die als Erinnerungen getarnt sind
- Keine Szenen – nur allgemeine emotionale Aussagen und Fragen
- Lieber 60 ehrliche Worte als 200 mit erfundenen Details
- Wenn Deceased-Persona: NUR zeitlose Weisheiten, NICHTS was Wissen über die Gegenwart impliziert`
          );
          finalLetter = fallbackLetter;
          // Re-check fallback
          const fbQc = await qualityCheck(fallbackLetter.text, plan.letters[targetIndex - 1], targetIndex, order.letter_count, previousLetters, originalData, onboarding.country);
          qcResult = fbQc;
          attempt = 4; // Mark as fallback
        }
        break;
      }
      console.log(`[Retry] Letter ${targetIndex} attempt ${attempt}: QC=${qcResult.score}, Safe=${safeResult.safe}, Dedup=${dedupResult.passed ? "OK" : dedupResult.overlaps.length + " overlaps"}`);
    }

    if (!finalLetter) throw new Error(`Failed letter ${targetIndex}`);

    const cost = (finalLetter.inputTokens * 0.003 + finalLetter.outputTokens * 0.015) / 1000;

    await supabase.from("letters").update({
      body: finalLetter.text,
      greeting: finalLetter.greeting, sign_off: finalLetter.signOff,
      word_count: finalLetter.wordCount, quality_score: qcResult?.score || 0,
      quality_notes: [
        qcResult?.notes,
        safeResult?.safe === false ? `SAFETY: ${safeResult.flags.join(", ")}` : "",
        dedupResult && !dedupResult.passed ? `DEDUP: ${dedupResult.overlaps.join("; ")}` : "",
      ].filter(Boolean).join(" | "),
      generation_attempt: attempt, status: "draft",
      token_count_input: finalLetter.inputTokens, token_count_output: finalLetter.outputTokens, cost_chf: cost,
    }).eq("order_id", orderId).eq("letter_index", targetIndex).eq("status", "generating");

    console.log(`[Done] Letter ${targetIndex}: ${finalLetter.wordCount}w, QC=${qcResult?.score}, attempt=${attempt}`);

    // ═══ Auto-Approve Logic ═══
    const isSelfBooking = order.booking_type === "self";

    if (targetIndex === 1 || isSelfBooking) {
      // Brief 1: immer auto-approve (Preview wurde bereits bestätigt)
      // Self-Booking: ALLE Briefe auto-approve (Überraschungseffekt)
      const reason = targetIndex === 1 ? "Preview-Brief" : "Self-Booking";
      await supabase.from("letters").update({
        status: "approved",
        approved_at: new Date().toISOString(),
        auto_approved: true,
        review_sent_at: new Date().toISOString(),
        quality_notes: (qcResult?.notes ? qcResult.notes + " | " : "") + `Auto-approved: ${reason}`,
      }).eq("order_id", orderId).eq("letter_index", targetIndex);
      console.log(`[Auto-Approve] Brief ${targetIndex} auto-approved (${reason})`);
      triggerSend(orderId, targetIndex);
    }

    // ═══ Schedule review notification (nur Gift-Bookings) ═══
    // Briefe 2+: set notify_scheduled_at = planned_send_date - 24h
    // The cron-notify function will pick these up and send the review email
    if (targetIndex > 1 && !isSelfBooking) {
      const frequency = order.frequency || "every3";
      const FREQUENCY_HOURS: Record<string, number> = {
        daily: 24, every3: 72, weekly: 168, biweekly: 336, monthly: 720,
      };
      const freqHours = FREQUENCY_HOURS[frequency] || 72;
      
      // Send date = order start + (letterIndex - 1) * frequency
      const orderStart = new Date(order.created_at);
      const sendDate = new Date(orderStart.getTime() + (targetIndex - 1) * freqHours * 60 * 60 * 1000);
      
      // Notify 24h before send date
      const notifyAt = new Date(sendDate.getTime() - 24 * 60 * 60 * 1000);
      
      // If notify time is already past (e.g. daily frequency), notify in 5 min
      const notifyTime = notifyAt.getTime() > Date.now() ? notifyAt : new Date(Date.now() + 5 * 60 * 1000);
      
      await supabase.from("letters").update({
        notify_scheduled_at: notifyTime.toISOString(),
      }).eq("order_id", orderId).eq("letter_index", targetIndex);
      
      console.log(`[Schedule] Letter ${targetIndex}: notify=${notifyTime.toISOString()}, send=${sendDate.toISOString()} (${frequency})`);
    }

    if (targetIndex < order.letter_count) {
      triggerNext(orderId, targetIndex + 1);
    } else {
      const { data: allLetters } = await supabase.from("letters").select("letter_index, quality_score").eq("order_id", orderId);
      const lowQ = (allLetters || []).filter(l => (l.quality_score || 0) < 75);
      const needsReview = lowQ.length > 0;

      const nextSend = new Date();
      nextSend.setDate(nextSend.getDate() + 1);
      await supabase.from("orders").update({
        status: needsReview ? "needs_review" : "ready",
        next_send_date: needsReview ? null : nextSend.toISOString().split("T")[0],
      }).eq("id", orderId);

      console.log(`[Complete] Order ${orderId}: ${order.letter_count} letters, review=${needsReview}`);
      if (needsReview) {
        alertAdmin("order_needs_review", orderId, undefined, `${lowQ.length} Brief(e) mit Score < 75: ${lowQ.map(l => `Brief ${l.letter_index} (${l.quality_score})`).join(", ")}`);
      }
    }

    return new Response(JSON.stringify({ success: true, letter: targetIndex, qc: qcResult?.score }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[Engine Error]", err);
    try { alertAdmin("generation_failed", orderId, targetIndex, err.message); } catch(_) {}
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
