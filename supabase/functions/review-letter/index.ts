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

// ——— Trigger send-letter (fire-and-forget) ———
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

      // Trigger physical send
      if (letter) triggerSend(order.id, letter.letter_index);

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

      // Trigger physical send
      if (letter) triggerSend(order.id, letter.letter_index);

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
