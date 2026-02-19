#!/bin/bash
# ═══════════════════════════════════════════════════════════
# LetterLift – Resend E-Mail Integration
# Führe dieses Script einmal aus, dann ist alles deployed.
# ═══════════════════════════════════════════════════════════
set -euo pipefail

cd ~/Projekte/letterlift-web

echo "📧 LetterLift Resend Integration"
echo "================================"
echo ""

# 1. Shared Email Helper
echo "1/5 → Shared Email Helper erstellen..."
mkdir -p supabase/functions/_shared
cat > supabase/functions/_shared/email.ts << 'EMAILTS'
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
EMAILTS
echo "   ✅ _shared/email.ts"

# 2. webhook-stripe aktualisieren
echo "2/5 → webhook-stripe aktualisieren..."
cat > supabase/functions/webhook-stripe/index.ts << 'WEBHOOKTS'
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
WEBHOOKTS
echo "   ✅ webhook-stripe/index.ts"

# 3. cron-auto-approve aktualisieren
echo "3/5 → cron-auto-approve aktualisieren..."
cat > supabase/functions/cron-auto-approve/index.ts << 'CRONTS'
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
CRONTS
echo "   ✅ cron-auto-approve/index.ts"

# 4. send-letter aktualisieren
echo "4/5 → send-letter aktualisieren..."
cat > supabase/functions/send-letter/index.ts << 'SENDTS'
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
SENDTS
echo "   ✅ send-letter/index.ts"

# 5. Deploy alle aktualisierten Functions
echo "5/5 → Deploying..."
echo ""

supabase functions deploy webhook-stripe --no-verify-jwt
supabase functions deploy cron-auto-approve --no-verify-jwt
supabase functions deploy send-letter --no-verify-jwt

echo ""
echo "═══════════════════════════════════════════"
echo "✅ Resend Integration komplett!"
echo ""
echo "E-Mails die jetzt gesendet werden:"
echo "  📧 Bestellbestätigung    → nach Stripe-Zahlung"
echo "  📧 Brief zur Freigabe    → war schon aktiv (notify-review)"
echo "  📧 Auto-Freigabe-Info    → wenn Brief nach 24h auto-approved"
echo "  📧 Versandbestätigung    → wenn Brief via Pingen verschickt"
echo ""
echo "Test: Führe eine Test-Bestellung im Stripe Test-Mode durch."
echo "═══════════════════════════════════════════"
