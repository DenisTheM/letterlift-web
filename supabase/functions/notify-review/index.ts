// supabase/functions/notify-review/index.ts
// Review notification – emotional, personal, context-aware.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const RESEND_KEY = Deno.env.get("RESEND_API_KEY") || "";
const SITE_URL = Deno.env.get("SITE_URL") || "https://letterlift.ch";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Emotionale Intros basierend auf Briefnummer ───
function getIntro(idx: number, total: number, name: string): { headline: string; intro: string } {
  const isLast = idx === total;
  const isPenultimate = idx === total - 1;

  if (idx === 2) return {
    headline: `Der nächste Brief an ${name} ist geschrieben.`,
    intro: `Er knüpft an, wo der erste aufgehört hat. Lies ihn in Ruhe – und wenn er sich richtig anfühlt, gib ihn frei.`,
  };
  if (isLast) return {
    headline: `Das ist der letzte Brief.`,
    intro: `Nimm dir einen Moment, bevor du ihn freigibst. Er schliesst ab, was du mit dem ersten Brief begonnen hast. Danke, dass du jemandem mit Worten Kraft gegeben hast.`,
  };
  if (isPenultimate) return {
    headline: `Noch zwei Briefe, dann schliesst sich der Kreis.`,
    intro: `Dieser Brief bereitet den Abschluss vor. Der letzte wird den Bogen spannen.`,
  };
  // Default: Briefe 3 bis vorvorletzter
  return {
    headline: `Brief ${idx} für ${name} ist da.`,
    intro: `Jeder Brief erzählt ein Stück weiter. Dieser hier wartet auf dein OK.`,
  };
}

// ─── Betreff basierend auf Briefnummer ───
function getSubject(idx: number, total: number, name: string): string {
  if (idx === 2) return `✉️ Ein neuer Brief an ${name} wartet auf dich`;
  if (idx === total) return `💛 Der letzte Brief an ${name}`;
  if (idx === total - 1) return `✉️ Brief ${idx} an ${name} – der vorletzte`;
  return `✉️ Brief ${idx} an ${name} – bereit zur Freigabe`;
}

// ─── E-Mail HTML ───
function buildEmail(
  idx: number, total: number, pkgName: string,
  name: string, preview: string, url: string
): string {
  const { headline, intro } = getIntro(idx, total, name);
  const remaining = total - idx;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#FBF8F5;font-family:Georgia,serif;">
  <div style="max-width:520px;margin:40px auto;padding:0 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:18px;font-weight:700;color:#3D5A4C;font-family:sans-serif;">✉️ LetterLift</span>
    </div>

    <div style="background:#fff;border-radius:16px;padding:36px 32px;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
      <h1 style="font-size:22px;font-weight:400;color:#2D2926;margin:0 0 12px;line-height:1.4;">
        ${headline}
      </h1>
      <p style="font-size:14px;color:#8A8480;margin:0 0 20px;font-family:sans-serif;">
        Brief ${idx} von ${total} · ${pkgName}-Paket
      </p>

      <p style="font-size:15px;color:#4A4543;line-height:1.8;margin:0 0 24px;">
        ${intro}
      </p>

      <div style="background:#FDFBF9;border-left:3px solid #5B7B6A;border-radius:0 12px 12px 0;padding:20px 24px;margin-bottom:24px;">
        <p style="font-size:12px;color:#8A8480;margin:0 0 8px;font-family:sans-serif;text-transform:uppercase;letter-spacing:0.05em;">Vorschau</p>
        <div style="font-size:15px;color:#3A3A3A;line-height:1.8;font-style:italic;">${preview}</div>
      </div>

      <p style="font-size:14px;color:#6B6360;line-height:1.7;margin:0 0 24px;font-family:sans-serif;">
        Du kannst den Brief lesen, bearbeiten oder direkt freigeben.
        Wenn du nichts tust, wird er in <strong>24 Stunden automatisch verschickt</strong> – damit die Serie im Rhythmus bleibt.
      </p>

      <a href="${url}" style="display:block;text-align:center;background:linear-gradient(135deg,#3D5A4C,#5B7B6A);color:#fff;padding:16px;border-radius:12px;text-decoration:none;font-size:16px;font-weight:600;font-family:sans-serif;">
        Brief lesen & freigeben
      </a>

      ${remaining > 0
        ? `<p style="font-size:13px;color:#B0A9A3;text-align:center;margin:20px 0 0;font-family:sans-serif;">Noch ${remaining} ${remaining === 1 ? "Brief" : "Briefe"} in deiner Serie.</p>`
        : `<p style="font-size:13px;color:#B0A9A3;text-align:center;margin:20px 0 0;font-family:sans-serif;">Danke für dein Vertrauen. 💛</p>`}
    </div>

    <p style="font-size:12px;color:#B0A9A3;text-align:center;margin-top:24px;font-family:sans-serif;">
      © 2026 LetterLift – Virtue Compliance GmbH, Uznach
    </p>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { orderId, letterIndex } = await req.json();
    console.log(`[Notify] Order ${orderId}, Letter ${letterIndex}`);

    const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
    if (!order) throw new Error("Order not found");
    if (!order.buyer_email) throw new Error("No buyer email");

    // Self-bookings don't get review emails – they auto-approve
    if (order.booking_type === "self") {
      console.log(`[Notify] Self-booking – skipping review email for letter ${letterIndex}`);
      return new Response(JSON.stringify({ success: true, skipped: "self-booking" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: letter } = await supabase.from("letters").select("*")
      .eq("order_id", orderId).eq("letter_index", letterIndex).single();
    if (!letter) throw new Error("Letter not found");

    const { data: recipient } = await supabase.from("recipients")
      .select("recipient_name, nickname").eq("order_id", orderId).single();
    const recipientName = recipient?.nickname || recipient?.recipient_name || "den Empfänger";

    const reviewUrl = `${SITE_URL}/review/${order.review_token}`;
    const previewText = letter.body.substring(0, 150).replace(/\n/g, " ") + "...";
    const subject = getSubject(letterIndex, order.letter_count, recipientName);
    const html = buildEmail(letterIndex, order.letter_count, order.package_name, recipientName, previewText, reviewUrl);

    if (RESEND_KEY) {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_KEY}` },
        body: JSON.stringify({ from: "LetterLift <briefe@letterlift.ch>", to: order.buyer_email, subject, html }),
      });
      const emailData = await emailRes.json();
      console.log("[Notify] Email sent:", emailData.id || emailData);
    } else {
      console.log("[Notify] No RESEND_KEY, skipping. Would send to:", order.buyer_email);
    }

    await supabase.from("letters").update({ review_sent_at: new Date().toISOString() }).eq("id", letter.id);

    return new Response(
      JSON.stringify({ success: true, email: order.buyer_email, letter: letterIndex }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[Notify Error]", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
