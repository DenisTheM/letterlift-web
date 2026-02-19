// supabase/functions/create-checkout/index.ts
// Creates a Stripe Checkout session from order data
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const PRICE_MAP: Record<string, string> = {
  // Replace with your actual Stripe Price IDs after creating products in Stripe
  trial: Deno.env.get("STRIPE_PRICE_TRIAL") || "price_REPLACE_ME",
  impuls: Deno.env.get("STRIPE_PRICE_IMPULS") || "price_REPLACE_ME",
  classic: Deno.env.get("STRIPE_PRICE_CLASSIC") || "price_REPLACE_ME",
  journey: Deno.env.get("STRIPE_PRICE_JOURNEY") || "price_REPLACE_ME",
  paper_premium: Deno.env.get("STRIPE_PRICE_PAPER") || "price_REPLACE_ME",
  foto_edition: Deno.env.get("STRIPE_PRICE_FOTO") || "price_REPLACE_ME",
  handschrift: Deno.env.get("STRIPE_PRICE_HANDSCHRIFT") || "price_REPLACE_ME",
};

const PKG_INFO: Record<string, { name: string; letters: number; price: number }> = {
  trial: { name: "Trial", letters: 1, price: 9.9 },
  impuls: { name: "Impuls", letters: 5, price: 34.9 },
  classic: { name: "Classic", letters: 10, price: 59.9 },
  journey: { name: "Journey", letters: 15, price: 79.9 },
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { orderData } = body;
    // orderData = full onboarding form data from frontend

    const pkg = PKG_INFO[orderData.package];
    if (!pkg) throw new Error("Invalid package: " + orderData.package);

    // 1. Create order in DB
    const { data: order, error: orderErr } = await supabase.from("orders").insert({
      package_id: orderData.package,
      package_name: pkg.name,
      letter_count: pkg.letters,
      price_chf: pkg.price,
      paper_option: orderData.paperOption || "standard",
      foto_edition: false,
      handschrift_edition: false,
      frequency: orderData.frequency || "every3",
      booking_type: orderData.bookingType,
      buyer_email: orderData.email || null,
      status: "created",
      review_token: crypto.randomUUID(),
    }).select().single();
    if (orderErr) throw orderErr;

    // 2. Create recipient
    const { error: recipErr } = await supabase.from("recipients").insert({
      order_id: order.id,
      recipient_name: orderData.recipientName,
      nickname: orderData.nickname || null,
      relationship: orderData.relationship || null,
      street: orderData.street,
      zip: orderData.zip,
      city: orderData.city,
      country: orderData.country,
      country_other: orderData.countryOther || null,
      sender_name: orderData.senderName || null,
      sender_message: orderData.senderMessage || null,
    });
    if (recipErr) throw recipErr;

    // 3. Create onboarding data
    const { error: onbErr } = await supabase.from("onboarding_data").insert({
      order_id: order.id,
      occasion: orderData.occasion,
      context_text: orderData.contextText,
      goal: orderData.goal || null,
      language: orderData.language || "de",
      hobbies: orderData.hobbies || null,
      music: orderData.music || null,
      humor: orderData.humor || [],
      strengths: orderData.strengths || null,
      important_people: orderData.importantPeople || null,
      no_go: orderData.noGo || null,
      memories: orderData.memories || null,
      style: orderData.style || [],
      custom_style_desc: orderData.customStyleDesc || null,
      persona: orderData.persona || null,
      persona_name: orderData.personaName || null,
      persona_desc: orderData.personaDesc || null,
      preview_letter: orderData.previewLetter || null,
      country: orderData.country || "CH",
    });
    if (onbErr) throw onbErr;

    // 4. Build Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: PRICE_MAP[orderData.package], quantity: 1 },
    ];
    if (orderData.paperOption === "premium" && PRICE_MAP.paper_premium !== "price_REPLACE_ME") {
      lineItems.push({ price: PRICE_MAP.paper_premium, quantity: 1 });
    }

    // 5. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/success?order=${order.id}`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata: { order_id: order.id },
      customer_email: orderData.email || undefined,
    });

    // 6. Save Stripe session ID
    await supabase.from("orders").update({
      stripe_session_id: session.id,
    }).eq("id", order.id);

    return new Response(JSON.stringify({ url: session.url, orderId: order.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Checkout error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
