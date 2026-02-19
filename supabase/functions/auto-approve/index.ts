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
