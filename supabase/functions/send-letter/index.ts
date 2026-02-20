// supabase/functions/send-letter/index.ts
// Pipeline: HTML → Gotenberg (PDF) → Pingen → Status-Polling → Versand-E-Mail
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { sendEmail, letterSentEmail } from "../_shared/email.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const GOTENBERG_URL = Deno.env.get("GOTENBERG_URL") || "";
const GOTENBERG_USER = Deno.env.get("GOTENBERG_USER") || "";
const PINGEN_API_KEY = Deno.env.get("PINGEN_API_KEY") || "";
const PINGEN_ORG_ID = Deno.env.get("PINGEN_ORG_ID") || "";
const PINGEN_BASE = "https://api.v2.pingen.com";
const MANUAL_MODE = !PINGEN_API_KEY || !GOTENBERG_URL;
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

// ─── Ländercodes → Pingen braucht ausgeschriebene Namen ───
const COUNTRY_MAP: Record<string, string> = {
  CH: "SCHWEIZ", DE: "DEUTSCHLAND", AT: "ÖSTERREICH",
  FR: "FRANKREICH", IT: "ITALIEN", NL: "NIEDERLANDE",
  UK: "VEREINIGTES KÖNIGREICH", GB: "VEREINIGTES KÖNIGREICH",
};

function resolveCountry(code: string, fallback?: string): string {
  const upper = (code || "CH").toUpperCase();
  return COUNTRY_MAP[upper] || fallback || upper;
}

// ─── Brief-HTML generieren (Design v2: weiss, keine Gradients, scharfe Linien) ───
function generateLetterHTML(letter: any, recipient: any, order: any, isHandschrift: boolean): string {
  const body = letter.body.replace(/\n/g, "<br/>");
  const fontFamily = isHandschrift
    ? "'Caveat', 'Dancing Script', cursive"
    : "Georgia, 'Lora', serif";
  const fontSize = isHandschrift ? "13pt" : "11pt";

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<style>
  @page { size: A4; margin: 25mm 22mm 30mm 22mm; }
  body {
    font-family: ${fontFamily};
    font-size: ${fontSize};
    line-height: 1.75;
    color: #2C2C2C;
    background: #fff;
    margin: 0;
    padding: 0;
  }
  .body-text { white-space: pre-wrap; }
  .footer {
    position: fixed;
    bottom: 12mm;
    left: 22mm;
    right: 22mm;
    border-top: 0.5pt solid #E0E0E0;
    padding-top: 6pt;
    font-size: 7.5pt;
    color: #B0A9A3;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    display: flex;
    justify-content: space-between;
  }
</style></head>
<body>
  <div class="body-text">${body}</div>
  <div class="footer">
    <span>LetterLift</span>
    <span>Brief ${letter.letter_index} von ${order.letter_count}</span>
  </div>
</body></html>`;
}

// ─── HTML → PDF via Gotenberg (Railway) ───
async function htmlToPdf(html: string): Promise<Uint8Array> {
  const form = new FormData();
  form.append("files", new Blob([html], { type: "text/html" }), "index.html");
  form.append("marginTop", "0");
  form.append("marginBottom", "0");
  form.append("marginLeft", "0");
  form.append("marginRight", "0");

  const headers: Record<string, string> = {};
  if (GOTENBERG_USER) {
    headers["Authorization"] = `Basic ${btoa(GOTENBERG_USER)}`;
  }

  const res = await fetch(`${GOTENBERG_URL}/forms/chromium/convert/html`, {
    method: "POST",
    headers,
    body: form,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "unknown");
    throw new Error(`Gotenberg PDF failed (${res.status}): ${err}`);
  }

  return new Uint8Array(await res.arrayBuffer());
}

// ─── PDF → Pingen hochladen ───
async function uploadToPingen(pdf: Uint8Array, filename: string): Promise<string> {
  const base64 = btoa(String.fromCharCode(...pdf));

  const res = await fetch(`${PINGEN_BASE}/organisations/${PINGEN_ORG_ID}/letters`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${PINGEN_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      data: { type: "letters", attributes: {
        filename,
        file_content: base64,
        address_position: "left",
        auto_send: false,
      }},
    }),
  });

  if (!res.ok) throw new Error(`Pingen upload failed: ${await res.text()}`);
  return (await res.json()).data.id;
}

// ─── Pingen Status-Polling: Warten auf "valid", abbrechen bei "action_required" ───
async function waitForValid(letterId: string, maxAttempts = 15): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 2000)); // 2s warten

    const res = await fetch(`${PINGEN_BASE}/organisations/${PINGEN_ORG_ID}/letters/${letterId}`, {
      headers: { "Authorization": `Bearer ${PINGEN_API_KEY}` },
    });
    if (!res.ok) continue;

    const data = await res.json();
    const status = data?.data?.attributes?.status;
    console.log(`[Pingen] Letter ${letterId} status: ${status} (attempt ${i + 1})`);

    if (status === "valid") return "valid";
    if (status === "action_required" || status === "invalid") {
      throw new Error(`Pingen validation failed: ${status} – Adress- oder Formatfehler`);
    }
  }
  throw new Error(`Pingen timeout: Status not "valid" after ${maxAttempts} attempts`);
}

// ─── Pingen: Brief absenden ───
async function sendPingenLetter(letterId: string, recipient: any): Promise<void> {
  const country = resolveCountry(
    recipient.country === "OTHER" ? (recipient.country_other || "CH") : recipient.country,
    recipient.country_other
  );

  const res = await fetch(`${PINGEN_BASE}/organisations/${PINGEN_ORG_ID}/letters/${letterId}/send`, {
    method: "PATCH",
    headers: { "Authorization": `Bearer ${PINGEN_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      data: { type: "letters", attributes: {
        speed: "economy",
        print_mode: "simplex",
        print_spectrum: "grayscale",
        delivery_product: "cheap",
        recipient_address: {
          name: recipient.recipient_name,
          street: recipient.street,
          zip: recipient.zip,
          city: recipient.city,
          country,
        },
      }},
    }),
  });

  if (!res.ok) throw new Error(`Pingen send failed: ${await res.text()}`);
}

// ─── Main ───
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { orderId, letterIndex } = await req.json();
    console.log(`[Send] Order ${orderId}, Letter ${letterIndex}`);

    // 1. Daten laden
    const { data: letter } = await supabase.from("letters").select("*").eq("order_id", orderId).eq("letter_index", letterIndex).single();
    if (!letter) throw new Error("Letter not found");
    const { data: recipient } = await supabase.from("recipients").select("*").eq("order_id", orderId).single();
    if (!recipient) throw new Error("Recipient not found");
    const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
    if (!order) throw new Error("Order not found");

    // 2. Manual-Mode Fallback
    if (MANUAL_MODE) {
      console.log(`[Send] MANUAL MODE – no Gotenberg/Pingen keys`);
      await supabase.from("letters").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", letter.id);
      return new Response(JSON.stringify({ mode: "manual", letterId: letter.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 3. HTML generieren
    const isHandschrift = !!order.handschrift_edition;
    const html = generateLetterHTML(letter, recipient, order, isHandschrift);
    console.log(`[Send] HTML generated (handschrift: ${isHandschrift})`);

    // 4. HTML → PDF via Gotenberg
    const pdf = await htmlToPdf(html);
    console.log(`[Send] PDF generated (${pdf.length} bytes)`);

    // 5. PDF → Pingen hochladen
    const filename = `letterlift-${order.id.substring(0, 8)}-brief${letterIndex}.pdf`;
    const pingenId = await uploadToPingen(pdf, filename);
    console.log(`[Send] Uploaded to Pingen (ID: ${pingenId})`);

    // 6. Warten auf Pingen-Validierung
    await waitForValid(pingenId);
    console.log(`[Send] Pingen validated`);

    // 7. Brief absenden
    await sendPingenLetter(pingenId, recipient);
    console.log(`[Send] Letter ${letterIndex} sent via Pingen`);

    // 8. DB aktualisieren
    await supabase.from("letters").update({
      status: "sent", pingen_letter_id: pingenId, pingen_status: "submitted", sent_at: new Date().toISOString(),
    }).eq("id", letter.id);
    await supabase.from("orders").update({ current_letter_index: letterIndex }).eq("id", orderId);

    // 9. Versandbestätigung per E-Mail (non-blocking)
    try {
      if (order.buyer_email) {
        const name = recipient.nickname || recipient.recipient_name || "den Empfänger";
        const { subject, html: emailHtml } = letterSentEmail(order, letterIndex, name);
        await sendEmail(order.buyer_email, subject, emailHtml);
      }
    } catch (emailErr) { console.error("[Send] Email failed (non-blocking):", emailErr); }

    return new Response(JSON.stringify({ success: true, mode: "automated", pingenId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[Send Error]", err.message);

    // Bei Fehler: Status auf "send_failed" setzen für Retry
    try {
      const { orderId, letterIndex } = await req.clone().json().catch(() => ({}));
      if (orderId && letterIndex) {
        await supabase.from("letters").update({
          pingen_status: "send_failed",
          quality_notes: `Send failed: ${err.message}`,
        }).eq("order_id", orderId).eq("letter_index", letterIndex);
      }
    } catch { /* ignore */ }

    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
