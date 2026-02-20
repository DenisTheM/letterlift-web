// supabase/functions/notify-admin/index.ts
// Sends admin alerts when letters are blocked, orders need review, or generation fails
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const RESEND_KEY = Deno.env.get("RESEND_API_KEY") || "";
const ADMIN_EMAIL = "sachenohne@gmail.com";
const SITE_URL = Deno.env.get("SITE_URL") || "https://letterlift.ch";
const SUPABASE_DASHBOARD = "https://supabase.com/dashboard";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Send email via Resend ───
async function sendAdminEmail(subject: string, html: string) {
  if (!RESEND_KEY) {
    console.log("[Admin] No RESEND_KEY, skipping. Subject:", subject);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_KEY}`,
    },
    body: JSON.stringify({
      from: "LetterLift Admin <hello@letterlift.ch>",
      to: ADMIN_EMAIL,
      subject,
      html,
    }),
  });

  const data = await res.json();
  console.log("[Admin] Email sent:", data.id || JSON.stringify(data));
}

// ─── Build email HTML ───
function buildEmail(title: string, details: string, actions: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#FBF8F5;font-family:'DM Sans',sans-serif;">
  <div style="max-width:520px;margin:40px auto;padding:0 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:18px;font-weight:700;color:#E53E3E;">⚠️ LetterLift Admin</span>
    </div>
    <div style="background:#fff;border-radius:16px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
      <h1 style="font-size:20px;font-weight:600;color:#2D2926;margin:0 0 16px;">${title}</h1>
      <div style="font-size:14px;color:#4A4A4A;line-height:1.7;">${details}</div>
      <div style="margin-top:24px;padding-top:20px;border-top:1px solid #E8E4DF;font-size:13px;color:#6B6360;">
        <strong>Nächste Schritte:</strong><br>${actions}
      </div>
    </div>
    <p style="font-size:11px;color:#B0A9A3;text-align:center;margin-top:16px;">
      LetterLift Admin Alert · ${new Date().toISOString().split("T")[0]}
    </p>
  </div>
</body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { type, orderId, letterIndex, reason } = await req.json();
    console.log(`[Admin] Alert: type=${type}, order=${orderId}, letter=${letterIndex || "-"}`);

    // Get order context
    const { data: order } = await supabase
      .from("orders")
      .select("id, status, buyer_email, package_id, letter_count, review_token, created_at")
      .eq("id", orderId)
      .single();

    const { data: recipient } = await supabase
      .from("recipients")
      .select("recipient_name, nickname")
      .eq("order_id", orderId)
      .single();

    const name = recipient?.nickname || recipient?.recipient_name || "Unbekannt";
    const email = order?.buyer_email || "Keine E-Mail";
    const reviewUrl = order?.review_token ? `${SITE_URL}/review/${order.review_token}` : "";

    // ─── BLOCKED LETTER ───
    if (type === "letter_blocked") {
      await sendAdminEmail(
        `🚫 Brief ${letterIndex} blockiert – Order ${orderId.slice(0, 8)}`,
        buildEmail(
          `Brief ${letterIndex} wurde blockiert`,
          `<p><strong>Empfänger:</strong> ${name}</p>
           <p><strong>Besteller:</strong> ${email}</p>
           <p><strong>Paket:</strong> ${order?.package_id || "?"} · ${order?.letter_count || "?"} Briefe</p>
           <p><strong>Grund:</strong> ${reason || "Safety-Check 3x fehlgeschlagen"}</p>
           <p><strong>Order ID:</strong> <code>${orderId}</code></p>`,
          `1. Prüfe den Brief im Supabase Dashboard (letters Tabelle)<br>
           2. Entscheide: manuell korrigieren oder neu generieren<br>
           3. Ggf. Besteller kontaktieren: ${email}`
        )
      );
    }

    // ─── ORDER NEEDS REVIEW ───
    else if (type === "order_needs_review") {
      await sendAdminEmail(
        `⚠️ Order braucht Review – ${name} (${orderId.slice(0, 8)})`,
        buildEmail(
          `Order braucht Admin-Review`,
          `<p><strong>Empfänger:</strong> ${name}</p>
           <p><strong>Besteller:</strong> ${email}</p>
           <p><strong>Paket:</strong> ${order?.package_id || "?"} · ${order?.letter_count || "?"} Briefe</p>
           <p><strong>Grund:</strong> ${reason || "Quality-Score zu niedrig"}</p>
           <p><strong>Order ID:</strong> <code>${orderId}</code></p>`,
          `1. Prüfe die Briefe im Supabase Dashboard<br>
           2. Briefe mit niedrigem Score manuell prüfen<br>
           ${reviewUrl ? `3. Review-Seite: <a href="${reviewUrl}">${reviewUrl}</a><br>` : ""}
           4. Status auf "ready" setzen wenn alles OK`
        )
      );
    }

    // ─── GENERATION FAILED ───
    else if (type === "generation_failed") {
      await sendAdminEmail(
        `❌ Generierung fehlgeschlagen – Brief ${letterIndex} (${orderId.slice(0, 8)})`,
        buildEmail(
          `Brief-Generierung abgebrochen`,
          `<p><strong>Empfänger:</strong> ${name}</p>
           <p><strong>Besteller:</strong> ${email}</p>
           <p><strong>Brief:</strong> ${letterIndex} von ${order?.letter_count || "?"}</p>
           <p><strong>Fehler:</strong> ${reason || "Unbekannt"}</p>
           <p><strong>Order ID:</strong> <code>${orderId}</code></p>`,
          `1. Supabase Edge Function Logs prüfen (generate-series)<br>
           2. Brief manuell neu triggern oder Fehler beheben<br>
           3. Besteller informieren falls nötig: ${email}`
        )
      );
    }

    // ─── MISSING LETTERS ───
    else if (type === "missing_letters") {
      await sendAdminEmail(
        `⚠️ Fehlende Briefe – ${name} (${orderId.slice(0, 8)})`,
        buildEmail(
          `Briefe fehlen in der Serie`,
          `<p><strong>Empfänger:</strong> ${name}</p>
           <p><strong>Besteller:</strong> ${email}</p>
           <p><strong>Erwartet:</strong> ${order?.letter_count || "?"} Briefe</p>
           <p><strong>Details:</strong> ${reason || "Generierung vermutlich abgebrochen"}</p>
           <p><strong>Order ID:</strong> <code>${orderId}</code></p>`,
          `1. Prüfe letters Tabelle für diese Order<br>
           2. Fehlende Briefe neu generieren<br>
           3. Ggf. generate-series manuell aufrufen`
        )
      );
    }

    else {
      console.log(`[Admin] Unknown alert type: ${type}`);
      return new Response(JSON.stringify({ error: "Unknown type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, type, orderId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[Admin Error]", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
