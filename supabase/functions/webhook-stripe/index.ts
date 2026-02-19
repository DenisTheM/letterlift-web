// supabase/functions/webhook-stripe/index.ts
// FIX: Idempotenz-Check verhindert doppelte E-Mails bei Stripe-Retries
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { sendEmail, orderConfirmationEmail } from "../_shared/email.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

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

    // ═══ IDEMPOTENZ-CHECK ═══
    // Prüfe ob diese Order bereits verarbeitet wurde (payment_status = "paid")
    // Verhindert doppelte E-Mails bei Stripe-Retries
    const { data: existingOrder } = await supabase
      .from("orders").select("payment_status").eq("id", orderId).single();

    if (existingOrder?.payment_status === "paid") {
      console.log(`[Webhook] Order ${orderId} already processed – skipping (idempotent)`);
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        status: 200, headers: { "Content-Type": "application/json" },
      });
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
