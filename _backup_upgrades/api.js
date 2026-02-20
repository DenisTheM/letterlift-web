// src/lib/api.js
// ═══════════════════════════════════════════════════════
// API-Helfer für Supabase Edge Functions
// ═══════════════════════════════════════════════════════

import { sanitizeAll } from "./formState";

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
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`API ${name}: ${res.status} – ${text}`);
  }
  return res.json();
}

/** Nur erlaubte Felder an die API senden */
function preparePayload(data) {
  const ALLOWED_KEYS = [
    "bookingType", "recipientName", "nickname", "gender", "relationship",
    "relationshipCustom", "language", "occasion", "contextText", "goal",
    "hobbies", "humor", "strengths", "importantPeople", "noGo",
    "memories", "mem1", "mem2", "mem3", "memExtra",
    "style", "customStyleDesc",
    "senderName", "senderGender", "senderMessage",
    "persona", "personaName", "personaDesc",
    "package", "frequency", "paperOption",
    "street", "zip", "city", "country", "email",
  ];
  const filtered = {};
  for (const key of ALLOWED_KEYS) {
    if (data[key] !== undefined) filtered[key] = data[key];
  }
  return sanitizeAll(filtered);
}

/** KI-Vorschau generieren */
export const fetchAIPreviewAPI = (orderData) =>
  callEdgeFunction("generate-preview", { orderData: preparePayload(orderData) });

/** Checkout-Session erstellen */
export const createCheckoutAPI = (orderData) =>
  callEdgeFunction("create-checkout", { orderData: preparePayload(orderData) });

/** Review-API (get_order, approve, edit, stop) */
export const reviewAPI = (body) =>
  callEdgeFunction("review-letter", body);
