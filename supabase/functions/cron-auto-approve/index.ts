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
