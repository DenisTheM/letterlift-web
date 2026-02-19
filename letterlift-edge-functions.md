# LetterLift – Edge Functions Snapshot
> Erstellt am: 2026-02-19 09:38

## `supabase/functions/auto-approve/index.ts`
```ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const AUTO_APPROVE_HOURS = 24;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - AUTO_APPROVE_HOURS);

    const { data: expired, error } = await supabase
      .from("letters").select("id, order_id, letter_index")
      .eq("status", "draft").not("review_sent_at", "is", null)
      .lt("review_sent_at", cutoff.toISOString());
    if (error) throw error;
    if (!expired?.length) {
      console.log("[Auto-Approve] Nothing to approve");
      return new Response(JSON.stringify({ success: true, approved: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    for (const l of expired) {
      await supabase.from("letters").update({
        status: "approved", approved_at: new Date().toISOString(), auto_approved: true,
        quality_notes: `Auto-approved after ${AUTO_APPROVE_HOURS}h`,
      }).eq("id", l.id);
      console.log(`[Auto-Approve] Letter ${l.letter_index} order ${l.order_id}`);
    }

    return new Response(JSON.stringify({ success: true, approved: expired.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[Auto-Approve Error]", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
```

## `supabase/functions/create-checkout/index.ts`
```ts
// supabase/functions/create-checkout/index.ts
// Creates a Stripe Checkout session from order data
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const PRICE_MAP: Record<string, string> = {
  // Replace with your actual Stripe Price IDs after creating products in Stripe
  trial: Deno.env.get("STRIPE_PRICE_TRIAL") || "price_REPLACE_ME",
  impuls: Deno.env.get("STRIPE_PRICE_IMPULS") || "price_REPLACE_ME",
  classic: Deno.env.get("STRIPE_PRICE_CLASSIC") || "price_REPLACE_ME",
  journey: Deno.env.get("STRIPE_PRICE_JOURNEY") || "price_REPLACE_ME",
  paper_premium: Deno.env.get("STRIPE_PRICE_PAPER") || "price_REPLACE_ME",
  foto_edition: Deno.env.get("STRIPE_PRICE_FOTO") || "price_REPLACE_ME",
  handschrift: Deno.env.get("STRIPE_PRICE_HANDSCHRIFT") || "price_REPLACE_ME",
};

const PKG_INFO: Record<string, { name: string; letters: number; price: number }> = {
  trial: { name: "Trial", letters: 1, price: 9.9 },
  impuls: { name: "Impuls", letters: 5, price: 34.9 },
  classic: { name: "Classic", letters: 10, price: 59.9 },
  journey: { name: "Journey", letters: 15, price: 79.9 },
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { orderData } = body;
    // orderData = full onboarding form data from frontend

    const pkg = PKG_INFO[orderData.package];
    if (!pkg) throw new Error("Invalid package: " + orderData.package);

    // 1. Create order in DB
    const { data: order, error: orderErr } = await supabase.from("orders").insert({
      package_id: orderData.package,
      package_name: pkg.name,
      letter_count: pkg.letters,
      price_chf: pkg.price,
      paper_option: orderData.paperOption || "standard",
      foto_edition: false,
      handschrift_edition: false,
      frequency: orderData.frequency || "every3",
      booking_type: orderData.bookingType,
      buyer_email: orderData.email || null,
      status: "created",
      review_token: crypto.randomUUID(),
    }).select().single();
    if (orderErr) throw orderErr;

    // 2. Create recipient
    const { error: recipErr } = await supabase.from("recipients").insert({
      order_id: order.id,
      recipient_name: orderData.recipientName,
      nickname: orderData.nickname || null,
      relationship: orderData.relationship || null,
      street: orderData.street,
      zip: orderData.zip,
      city: orderData.city,
      country: orderData.country,
      country_other: orderData.countryOther || null,
      sender_name: orderData.senderName || null,
      sender_message: orderData.senderMessage || null,
    });
    if (recipErr) throw recipErr;

    // 3. Create onboarding data
    const { error: onbErr } = await supabase.from("onboarding_data").insert({
      order_id: order.id,
      occasion: orderData.occasion,
      context_text: orderData.contextText,
      goal: orderData.goal || null,
      language: orderData.language || "de",
      hobbies: orderData.hobbies || null,
      music: orderData.music || null,
      humor: orderData.humor || [],
      strengths: orderData.strengths || null,
      important_people: orderData.importantPeople || null,
      no_go: orderData.noGo || null,
      memories: orderData.memories || null,
      style: orderData.style || [],
      custom_style_desc: orderData.customStyleDesc || null,
      persona: orderData.persona || null,
      persona_name: orderData.personaName || null,
      persona_desc: orderData.personaDesc || null,
      preview_letter: orderData.previewLetter || null,
      country: orderData.country || "CH",
    });
    if (onbErr) throw onbErr;

    // 4. Build Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: PRICE_MAP[orderData.package], quantity: 1 },
    ];
    if (orderData.paperOption === "premium" && PRICE_MAP.paper_premium !== "price_REPLACE_ME") {
      lineItems.push({ price: PRICE_MAP.paper_premium, quantity: 1 });
    }

    // 5. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/success?order=${order.id}`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata: { order_id: order.id },
      customer_email: orderData.email || undefined,
    });

    // 6. Save Stripe session ID
    await supabase.from("orders").update({
      stripe_session_id: session.id,
    }).eq("id", order.id);

    return new Response(JSON.stringify({ url: session.url, orderId: order.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Checkout error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

## `supabase/functions/cron-auto-approve/index.ts`
```ts
// supabase/functions/cron-auto-approve/index.ts
// Runs every hour: auto-approve letters not reviewed within 24h + send notification
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmail, autoApproveEmail } from "../_shared/email.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const AUTO_APPROVE_HOURS = 24;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - AUTO_APPROVE_HOURS);

    const { data: expired, error } = await supabase.from("letters")
      .select("id, order_id, letter_index").eq("status", "draft")
      .not("review_sent_at", "is", null).lt("review_sent_at", cutoff.toISOString()).limit(20);
    if (error) throw error;

    if (!expired?.length) {
      console.log("[Auto-Approve] Nothing to approve");
      return new Response(JSON.stringify({ success: true, approved: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let approved = 0;
    for (const l of expired) {
      const { error: updateError } = await supabase.from("letters").update({
        status: "approved", approved_at: new Date().toISOString(), auto_approved: true,
        quality_notes: `Auto-approved after ${AUTO_APPROVE_HOURS}h`,
      }).eq("id", l.id).eq("status", "draft");

      if (!updateError) {
        approved++;
        console.log(`[Auto-Approve] Letter ${l.letter_index} order ${l.order_id}`);
        // Send notification (non-blocking)
        try {
          const { data: order } = await supabase.from("orders").select("buyer_email, package_name, letter_count, review_token").eq("id", l.order_id).single();
          const { data: recipient } = await supabase.from("recipients").select("recipient_name, nickname").eq("order_id", l.order_id).single();
          if (order?.buyer_email && recipient) {
            const name = recipient.nickname || recipient.recipient_name || "den Empfänger";
            const { subject, html } = autoApproveEmail(order, l.letter_index, name);
            await sendEmail(order.buyer_email, subject, html);
          }
        } catch (emailErr) { console.error(`[Auto-Approve] Email failed (non-blocking):`, emailErr); }
      } else {
        console.error(`[Auto-Approve] Failed for ${l.id}: ${updateError.message}`);
      }
    }

    return new Response(JSON.stringify({ success: true, approved }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[Auto-Approve Error]", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
```

## `supabase/functions/cron-notify/index.ts`
```ts
// supabase/functions/cron-notify/index.ts
// Runs every hour via Supabase cron to send scheduled review notifications
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const SELF_URL = Deno.env.get("SUPABASE_URL") + "/functions/v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const now = new Date().toISOString();

    const { data: dueLetters, error } = await supabase
      .from("letters")
      .select("id, order_id, letter_index, notify_scheduled_at")
      .eq("status", "draft")
      .is("review_sent_at", null)
      .not("notify_scheduled_at", "is", null)
      .lte("notify_scheduled_at", now)
      .order("notify_scheduled_at")
      .limit(20);

    if (error) throw error;

    console.log(`[Cron] Found ${dueLetters?.length || 0} due notifications`);

    let sent = 0;
    for (const letter of (dueLetters || [])) {
      try {
        const res = await fetch(`${SELF_URL}/notify-review`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
          },
          body: JSON.stringify({ orderId: letter.order_id, letterIndex: letter.letter_index }),
        });

        if (res.ok) {
          sent++;
          console.log(`[Cron] Notified: order=${letter.order_id} letter=${letter.letter_index}`);
        } else {
          console.error(`[Cron] Failed: order=${letter.order_id} letter=${letter.letter_index} ${await res.text()}`);
        }
      } catch (err) {
        console.error(`[Cron] Error for letter ${letter.id}: ${err.message}`);
      }
    }

    return new Response(JSON.stringify({ success: true, checked: dueLetters?.length || 0, sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[Cron Error]", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

## `supabase/functions/generate-preview/index.ts`
```ts
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
```

## `supabase/functions/generate-series/index.ts`
```ts
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

    // ═══ Schedule review notification ═══
    // Brief 1: auto-approved via preview → no notification needed
    // Briefe 2+: set notify_scheduled_at = planned_send_date - 24h
    // The cron-notify function will pick these up and send the review email
    if (targetIndex > 1) {
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
    }

    return new Response(JSON.stringify({ success: true, letter: targetIndex, qc: qcResult?.score }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[Engine Error]", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
```

## `supabase/functions/notify-review/index.ts`
```ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const RESEND_KEY = Deno.env.get("RESEND_API_KEY") || "";
const SITE_URL = Deno.env.get("SITE_URL") || "https://letterlift.ch";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { orderId, letterIndex } = await req.json();
    console.log(`[Notify] Order ${orderId}, Letter ${letterIndex}`);

    // 1. Get order + buyer email + review token
    const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
    if (!order) throw new Error("Order not found");
    if (!order.buyer_email) throw new Error("No buyer email");

    // 2. Get the letter
    const { data: letter } = await supabase
      .from("letters")
      .select("*")
      .eq("order_id", orderId)
      .eq("letter_index", letterIndex)
      .single();
    if (!letter) throw new Error("Letter not found");

    // 3. Get recipient name
    const { data: recipient } = await supabase
      .from("recipients")
      .select("recipient_name, nickname")
      .eq("order_id", orderId)
      .single();
    const recipientName = recipient?.nickname || recipient?.recipient_name || "den Empfänger";

    // 4. Build review URL
    const reviewUrl = `${SITE_URL}/review/${order.review_token}`;

    // 5. Build email
    const isFirst = letterIndex === 1;
    const subject = isFirst
      ? `✉️ Dein erster Brief an ${recipientName} ist bereit`
      : `✉️ Brief ${letterIndex}/${order.letter_count} an ${recipientName} ist bereit`;

    const previewText = letter.body.substring(0, 120).replace(/\n/g, " ") + "...";

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#FBF8F5;font-family:Georgia,serif;">
  <div style="max-width:520px;margin:40px auto;padding:0 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:18px;font-weight:700;color:#3D5A4C;font-family:sans-serif;">✉️ LetterLift</span>
    </div>
    
    <div style="background:#fff;border-radius:16px;padding:36px 32px;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
      <h1 style="font-size:22px;font-weight:400;color:#2D2926;margin:0 0 8px;line-height:1.3;">
        Brief ${letterIndex} von ${order.letter_count} ist bereit.
      </h1>
      <p style="font-size:14px;color:#8A8480;margin:0 0 24px;font-family:sans-serif;">
        Für ${recipientName} · ${order.package_name}-Paket
      </p>
      
      <div style="background:#FDFBF9;border:1px solid #EBE7E2;border-radius:12px;padding:24px 20px;margin-bottom:24px;">
        <div style="font-size:15px;color:#3A3A3A;line-height:1.8;white-space:pre-line;">${previewText}</div>
      </div>
      
      <p style="font-size:14px;color:#6B6360;line-height:1.7;margin:0 0 24px;font-family:sans-serif;">
        Du kannst den Brief lesen, bearbeiten und freigeben. 
        <strong>Ohne Freigabe wird er in 24 Stunden automatisch versendet.</strong>
      </p>
      
      <a href="${reviewUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#3D5A4C,#5B7B6A);color:#fff;padding:16px;border-radius:12px;text-decoration:none;font-size:16px;font-weight:600;font-family:sans-serif;">
        Brief prüfen & freigeben
      </a>
      
      <p style="font-size:12px;color:#B0A9A3;text-align:center;margin:16px 0 0;font-family:sans-serif;">
        Oder öffne diesen Link: <a href="${reviewUrl}" style="color:#5B7B6A;">${reviewUrl}</a>
      </p>
    </div>
    
    <p style="font-size:12px;color:#B0A9A3;text-align:center;margin-top:24px;font-family:sans-serif;">
      © 2026 LetterLift – Virtue Compliance GmbH, Uznach
    </p>
  </div>
</body>
</html>`;

    // 6. Send email via Resend
    if (RESEND_KEY) {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_KEY}` },
        body: JSON.stringify({
          from: "LetterLift <briefe@letterlift.ch>",
          to: order.buyer_email,
          subject,
          html,
        }),
      });
      const emailData = await emailRes.json();
      console.log("[Notify] Email sent:", emailData.id || emailData);
    } else {
      console.log("[Notify] No RESEND_KEY, skipping email. Would send to:", order.buyer_email);
    }

    // 7. Mark letter as review-notified
    await supabase
      .from("letters")
      .update({ review_sent_at: new Date().toISOString() })
      .eq("id", letter.id);

    return new Response(
      JSON.stringify({ success: true, email: order.buyer_email, letter: letterIndex }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[Notify Error]", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

## `supabase/functions/review-letter/index.ts`
```ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Frequency to delay mapping (in hours)
const FREQUENCY_DELAY: Record<string, number> = {
  daily: 24,
  every3: 72,
  weekly: 168,
  biweekly: 336,
  monthly: 720,
};

// Schedule notify for the next letter after approval (with frequency delay)
async function scheduleNextLetter(orderId: string, currentIndex: number, totalLetters: number, frequency: string) {
  const nextIndex = currentIndex + 1;
  if (nextIndex > totalLetters) return; // no more letters

  // Check if next letter exists and is draft
  const { data: nextLetter } = await supabase
    .from("letters").select("id, status, review_sent_at")
    .eq("order_id", orderId).eq("letter_index", nextIndex).maybeSingle();

  if (nextLetter && nextLetter.status === "draft" && !nextLetter.review_sent_at) {
    const delayHours = FREQUENCY_DELAY[frequency] || 72; // default 3 days
    const sendAt = new Date(Date.now() + delayHours * 60 * 60 * 1000);
    
    // Store scheduled send time on the letter
    await supabase.from("letters").update({
      notify_scheduled_at: sendAt.toISOString(),
    }).eq("id", nextLetter.id);

    console.log(`[Review] Letter ${nextIndex} notify scheduled for ${sendAt.toISOString()} (${frequency}: +${delayHours}h)`);
    
    // For daily frequency, notify immediately (within 24h counts as "soon enough")
    if (delayHours <= 24) {
      const notifyUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/notify-review`;
      fetch(notifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        },
        body: JSON.stringify({ orderId, letterIndex: nextIndex }),
      }).catch(err => console.error("[Notify next] Error:", err));
      console.log(`[Review] Daily frequency → immediate notify for letter ${nextIndex}`);
    }
    // For other frequencies: a cron job / scheduled function will check notify_scheduled_at
    // and send the notification when the time has arrived
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { action, token, letterId, editedBody } = await req.json();

    // 1. Validate token
    const { data: order } = await supabase
      .from("orders").select("*").eq("review_token", token).single();
    if (!order) {
      return new Response(JSON.stringify({ error: "Ungültiger Link" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ═══ GET ORDER: Return only relevant letters for review ═══
    if (action === "get_order") {
      const { data: allLetters } = await supabase
        .from("letters")
        .select("id, letter_index, body, greeting, sign_off, word_count, quality_score, status, review_sent_at, auto_approved, approved_at, sent_at")
        .eq("order_id", order.id)
        .order("letter_index");

      const { data: recipient } = await supabase
        .from("recipients").select("recipient_name, nickname").eq("order_id", order.id).single();

      // Deduplicate: keep only one entry per letter_index (the latest one by id)
      const letterMap = new Map();
      for (const l of (allLetters || [])) {
        const existing = letterMap.get(l.letter_index);
        if (!existing || l.id > existing.id) {
          letterMap.set(l.letter_index, l);
        }
      }
      const letters = Array.from(letterMap.values()).sort((a, b) => a.letter_index - b.letter_index);

      // Find the next letter to review: first draft with review_sent_at set
      const nextToReview = letters.find(l => l.status === "draft" && l.review_sent_at);
      
      // Show: all approved/sent + the next one to review
      const visibleLetters = letters.filter(l => 
        l.status === "approved" || l.status === "sent" || l.id === nextToReview?.id
      );

      // Count pending (generated but not yet shown)
      const pendingCount = letters.filter(l => l.status === "draft" && l !== nextToReview).length;

      return new Response(JSON.stringify({
        success: true,
        order: { id: order.id, packageName: order.package_name, letterCount: order.letter_count, status: order.status, frequency: order.frequency },
        recipient: { name: recipient?.recipient_name, nickname: recipient?.nickname },
        letters: visibleLetters,
        pendingCount,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ═══ APPROVE ═══
    if (action === "approve") {
      // Get the letter to find its index
      const { data: letter } = await supabase
        .from("letters").select("letter_index").eq("id", letterId).eq("order_id", order.id).single();
      
      await supabase.from("letters").update({
        status: "approved", approved_at: new Date().toISOString(),
      }).eq("id", letterId).eq("order_id", order.id);
      
      console.log(`[Review] Letter ${letterId} approved (index ${letter?.letter_index})`);

      // Trigger notify for next letter
      if (letter) await scheduleNextLetter(order.id, letter.letter_index, order.letter_count, order.frequency || "every3");

      return new Response(JSON.stringify({ success: true, action: "approved" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ═══ EDIT + APPROVE ═══
    if (action === "edit") {
      if (!editedBody || editedBody.trim().length < 20) {
        return new Response(JSON.stringify({ error: "Brief ist zu kurz" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Get the letter to find its index
      const { data: letter } = await supabase
        .from("letters").select("letter_index").eq("id", letterId).eq("order_id", order.id).single();

      const lines = editedBody.trim().split("\n").filter((l: string) => l.trim());
      await supabase.from("letters").update({
        body: editedBody.trim(),
        greeting: lines[0] || "", sign_off: lines[lines.length - 1] || "",
        word_count: editedBody.trim().split(/\s+/).length,
        status: "approved", approved_at: new Date().toISOString(),
        quality_notes: "Edited by buyer",
      }).eq("id", letterId).eq("order_id", order.id);
      
      console.log(`[Review] Letter ${letterId} edited + approved (index ${letter?.letter_index})`);

      // Trigger notify for next letter
      if (letter) await scheduleNextLetter(order.id, letter.letter_index, order.letter_count, order.frequency || "every3");

      return new Response(JSON.stringify({ success: true, action: "edited" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ═══ STOP/PAUSE ═══
    if (action === "stop") {
      await supabase.from("orders").update({ status: "paused" }).eq("id", order.id);
      console.log(`[Review] Order ${order.id} paused`);
      return new Response(JSON.stringify({ success: true, action: "paused" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[Review Error]", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

## `supabase/functions/send-letter/index.ts`
```ts
// supabase/functions/send-letter/index.ts
// Sends letter via Pingen API + dispatch confirmation email
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { sendEmail, letterSentEmail } from "../_shared/email.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const PINGEN_API_KEY = Deno.env.get("PINGEN_API_KEY") || "";
const PINGEN_ORG_ID = Deno.env.get("PINGEN_ORG_ID") || "";
const PINGEN_BASE = "https://api.v2.pingen.com";
const MANUAL_MODE = !PINGEN_API_KEY;
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

function generateLetterHTML(letter: any, recipient: any, order: any): string {
  const body = letter.body.replace(/\n/g, "<br/>");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>@page{size:A5;margin:20mm 18mm 25mm 18mm}body{font-family:Georgia,'Lora',serif;font-size:11pt;line-height:1.7;color:#2C2C2C}.body-text{margin-top:0;white-space:pre-wrap}.footer{position:fixed;bottom:10mm;right:18mm;font-size:8pt;color:#B0A9A3;font-family:'DM Sans',sans-serif}</style></head>
<body><div class="body-text">${body}</div><div class="footer">LetterLift · Brief ${letter.letter_index} von ${order.letter_count}</div></body></html>`;
}

async function sendViaPingen(letter: any, recipient: any, order: any): Promise<string> {
  const html = generateLetterHTML(letter, recipient, order);
  const uploadRes = await fetch(`${PINGEN_BASE}/organisations/${PINGEN_ORG_ID}/letters`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${PINGEN_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ data: { type: "letters", attributes: {
      filename: `letterlift-${order.id}-${letter.letter_index}.html`,
      file_url: null, file_content: btoa(unescape(encodeURIComponent(html))),
      address_position: "left", auto_send: false,
    }}}),
  });
  if (!uploadRes.ok) throw new Error(`Pingen upload failed: ${await uploadRes.text()}`);
  const letterId = (await uploadRes.json()).data.id;

  const sendRes = await fetch(`${PINGEN_BASE}/organisations/${PINGEN_ORG_ID}/letters/${letterId}/send`, {
    method: "PATCH",
    headers: { "Authorization": `Bearer ${PINGEN_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ data: { type: "letters", attributes: {
      speed: "economy", print_mode: "simplex", print_spectrum: "grayscale", delivery_product: "cheap",
      recipient_address: {
        name: recipient.recipient_name, street: recipient.street,
        zip: recipient.zip, city: recipient.city,
        country: recipient.country === "OTHER" ? (recipient.country_other || "CH") : recipient.country,
      },
    }}}),
  });
  if (!sendRes.ok) throw new Error(`Pingen send failed: ${await sendRes.text()}`);
  return letterId;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { orderId, letterIndex } = await req.json();
    const { data: letter } = await supabase.from("letters").select("*").eq("order_id", orderId).eq("letter_index", letterIndex).single();
    if (!letter) throw new Error("Letter not found");
    const { data: recipient } = await supabase.from("recipients").select("*").eq("order_id", orderId).single();
    if (!recipient) throw new Error("Recipient not found");
    const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
    if (!order) throw new Error("Order not found");

    if (MANUAL_MODE) {
      await supabase.from("letters").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", letter.id);
      console.log(`Letter ${letterIndex} ready for MANUAL sending`);
      return new Response(JSON.stringify({ mode: "manual", letterId: letter.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const pingenId = await sendViaPingen(letter, recipient, order);
    await supabase.from("letters").update({
      status: "sending", pingen_letter_id: pingenId, pingen_status: "submitted", sent_at: new Date().toISOString(),
    }).eq("id", letter.id);
    await supabase.from("orders").update({ current_letter_index: letterIndex }).eq("id", orderId);
    console.log(`Letter ${letterIndex} sent via Pingen (ID: ${pingenId})`);

    // Dispatch confirmation email (non-blocking)
    try {
      if (order.buyer_email) {
        const name = recipient.nickname || recipient.recipient_name || "den Empfänger";
        const { subject, html } = letterSentEmail(order, letterIndex, name);
        await sendEmail(order.buyer_email, subject, html);
      }
    } catch (emailErr) { console.error("Dispatch email failed (non-blocking):", emailErr); }

    return new Response(JSON.stringify({ mode: "automated", pingenId }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Send error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
```

## `supabase/functions/webhook-stripe/index.ts`
```ts
// supabase/functions/webhook-stripe/index.ts
// Handles Stripe webhook → updates order → sends confirmation email → triggers generation
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { sendEmail, orderConfirmationEmail } from "../_shared/email.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

serve(async (req) => {
  const body = await req.text();
  let event;
  try { event = JSON.parse(body); } catch (err) {
    console.error("Failed to parse webhook body:", err);
    return new Response("Invalid JSON", { status: 400 });
  }

  console.log("Received event:", event.type, "id:", event.id);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.order_id;
    if (!orderId) {
      console.error("No order_id in session metadata");
      return new Response(JSON.stringify({ error: "No order_id" }), { status: 400 });
    }

    console.log("Payment successful for order", orderId);

    // 1. Update order status
    const { error: updateErr } = await supabase.from("orders").update({
      payment_status: "paid", stripe_payment_intent: session.payment_intent, status: "generating",
    }).eq("id", orderId);
    if (updateErr) {
      console.error("Error updating order:", updateErr);
      return new Response(JSON.stringify({ error: "DB error" }), { status: 500 });
    }

    // 2. Send confirmation email (non-blocking)
    try {
      const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
      const { data: recipient } = await supabase.from("recipients").select("recipient_name, nickname").eq("order_id", orderId).single();
      if (order?.buyer_email && recipient) {
        const name = recipient.nickname || recipient.recipient_name || "den Empfänger";
        const { subject, html } = orderConfirmationEmail(order, name);
        await sendEmail(order.buyer_email, subject, html);
      }
    } catch (emailErr) { console.error("Confirmation email failed (non-blocking):", emailErr); }

    // 3. Trigger generation
    try {
      const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/generate-series`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}` },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) console.error("Generation trigger failed:", await res.text());
      else console.log("Generation triggered for order", orderId);
    } catch (err) { console.error("Error triggering generation:", err); }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
});
```

## `supabase/functions/_shared/email.ts`
```ts
// supabase/functions/_shared/email.ts
// Shared Resend E-Mail Helper für alle LetterLift Edge Functions

const RESEND_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM = "LetterLift <briefe@letterlift.ch>";

function wrapHtml(content: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#FBF8F5;font-family:Georgia,serif;">
  <div style="max-width:520px;margin:40px auto;padding:0 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:18px;font-weight:700;color:#3D5A4C;font-family:sans-serif;">✉️ LetterLift</span>
    </div>
    <div style="background:#fff;border-radius:16px;padding:36px 32px;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
      ${content}
    </div>
    <p style="font-size:12px;color:#B0A9A3;text-align:center;margin-top:24px;font-family:sans-serif;">
      © 2026 LetterLift – Virtue Compliance GmbH, Uznach
    </p>
  </div>
</body></html>`;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!RESEND_KEY) {
    console.log(`[Email] No RESEND_API_KEY – skipping. Would send to: ${to}, subject: ${subject}`);
    return { success: false, error: "no_api_key" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(`[Email] Resend error:`, data);
      return { success: false, error: data.message || "Resend API error" };
    }
    console.log(`[Email] Sent to ${to}: ${data.id}`);
    return { success: true, id: data.id };
  } catch (err) {
    console.error(`[Email] Failed:`, err);
    return { success: false, error: err.message };
  }
}

// ─── 1. Bestellbestätigung ───
export function orderConfirmationEmail(order: any, recipientName: string): { subject: string; html: string } {
  const reviewUrl = `https://letterlift.ch/review/${order.review_token}`;
  return {
    subject: `✅ Deine LetterLift-Bestellung ist bestätigt`,
    html: wrapHtml(`
      <h1 style="font-size:22px;font-weight:400;color:#2D2926;margin:0 0 8px;line-height:1.3;">
        Danke für deine Bestellung!
      </h1>
      <p style="font-size:14px;color:#8A8480;margin:0 0 24px;font-family:sans-serif;">
        ${order.package_name}-Paket · ${order.letter_count} Briefe für ${recipientName}
      </p>
      <div style="background:#F0F7F2;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="font-size:14px;color:#3D5A4C;margin:0;font-family:sans-serif;line-height:1.7;">
          <strong>So geht's weiter:</strong><br/>
          1. Wir schreiben jetzt deine ${order.letter_count} Briefe ✍️<br/>
          2. Du bekommst jeden Brief per E-Mail zur Freigabe 📩<br/>
          3. Nach deiner Freigabe wird er gedruckt und verschickt 📬
        </p>
      </div>
      <p style="font-size:14px;color:#6B6360;line-height:1.7;margin:0 0 24px;font-family:sans-serif;">
        Den ersten Brief erhältst du in Kürze zur Freigabe. Du kannst ihn lesen, bearbeiten oder direkt freigeben.
      </p>
      <a href="${reviewUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#3D5A4C,#5B7B6A);color:#fff;padding:16px;border-radius:12px;text-decoration:none;font-size:16px;font-weight:600;font-family:sans-serif;">
        Zur Briefübersicht
      </a>
      <p style="font-size:12px;color:#B0A9A3;text-align:center;margin:16px 0 0;font-family:sans-serif;">
        Bestellnummer: ${order.id.substring(0, 8)}
      </p>`),
  };
}

// ─── 2. Auto-Freigabe-Info ───
export function autoApproveEmail(order: any, letterIndex: number, recipientName: string): { subject: string; html: string } {
  const reviewUrl = `https://letterlift.ch/review/${order.review_token}`;
  return {
    subject: `📬 Brief ${letterIndex} an ${recipientName} wurde automatisch freigegeben`,
    html: wrapHtml(`
      <h1 style="font-size:22px;font-weight:400;color:#2D2926;margin:0 0 8px;line-height:1.3;">
        Brief ${letterIndex} wurde automatisch freigegeben.
      </h1>
      <p style="font-size:14px;color:#8A8480;margin:0 0 24px;font-family:sans-serif;">
        Für ${recipientName} · ${order.package_name}-Paket
      </p>
      <p style="font-size:14px;color:#6B6360;line-height:1.7;margin:0 0 24px;font-family:sans-serif;">
        Da innerhalb von 24 Stunden keine Rückmeldung kam, wurde Brief ${letterIndex} automatisch freigegeben und wird nun zum Versand vorbereitet.
      </p>
      <a href="${reviewUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#3D5A4C,#5B7B6A);color:#fff;padding:16px;border-radius:12px;text-decoration:none;font-size:16px;font-weight:600;font-family:sans-serif;">
        Briefübersicht öffnen
      </a>`),
  };
}

// ─── 3. Versandbestätigung ───
export function letterSentEmail(order: any, letterIndex: number, recipientName: string): { subject: string; html: string } {
  const reviewUrl = `https://letterlift.ch/review/${order.review_token}`;
  const isLast = letterIndex === order.letter_count;
  return {
    subject: isLast
      ? `🎉 Der letzte Brief an ${recipientName} ist unterwegs!`
      : `📬 Brief ${letterIndex}/${order.letter_count} an ${recipientName} ist unterwegs`,
    html: wrapHtml(`
      <h1 style="font-size:22px;font-weight:400;color:#2D2926;margin:0 0 8px;line-height:1.3;">
        ${isLast ? "Dein letzter Brief ist unterwegs! 🎉" : "Brief " + letterIndex + " ist unterwegs."}
      </h1>
      <p style="font-size:14px;color:#8A8480;margin:0 0 24px;font-family:sans-serif;">
        Für ${recipientName} · Brief ${letterIndex} von ${order.letter_count}
      </p>
      <div style="background:#F0F7F2;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="font-size:14px;color:#3D5A4C;margin:0;font-family:sans-serif;">
          📮 Der Brief wurde gedruckt und ist auf dem Postweg. Zustellung in 2–3 Werktagen.
        </p>
      </div>
      ${isLast
        ? '<p style="font-size:14px;color:#6B6360;line-height:1.7;margin:0 0 24px;font-family:sans-serif;">Alle ' + order.letter_count + " Briefe deiner " + order.package_name + "-Serie sind jetzt verschickt. Danke, dass du jemandem mit Worten Kraft gegeben hast. 💛</p>"
        : '<p style="font-size:14px;color:#6B6360;line-height:1.7;margin:0 0 24px;font-family:sans-serif;">Noch ' + (order.letter_count - letterIndex) + " " + ((order.letter_count - letterIndex) === 1 ? "Brief" : "Briefe") + " in deiner Serie.</p>"}
      <a href="${reviewUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#3D5A4C,#5B7B6A);color:#fff;padding:16px;border-radius:12px;text-decoration:none;font-size:16px;font-weight:600;font-family:sans-serif;">
        Alle Briefe ansehen
      </a>`),
  };
}
```
