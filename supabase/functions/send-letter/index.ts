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
