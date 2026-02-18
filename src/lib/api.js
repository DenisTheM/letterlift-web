// src/lib/api.js
// ═══════════════════════════════════════════════════════
// API-Helfer für Supabase Edge Functions
// ═══════════════════════════════════════════════════════

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

async function callEdgeFunction(name, body) {
  const res = await fetch(`${BASE_URL}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

/** KI-Vorschau generieren */
export const fetchAIPreviewAPI = (orderData) =>
  callEdgeFunction("generate-preview", { orderData });

/** Checkout-Session erstellen */
export const createCheckoutAPI = (orderData) =>
  callEdgeFunction("create-checkout", { orderData });

/** Review-API (get_order, approve, edit, stop) */
export const reviewAPI = (body) =>
  callEdgeFunction("review-letter", body);
