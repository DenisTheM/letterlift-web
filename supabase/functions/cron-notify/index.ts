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
