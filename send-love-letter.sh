#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  LetterLift – Testbrief an Elena senden 💌
# ═══════════════════════════════════════════════════════════

PROJECT_URL="https://hqcrvmepmglrzcsnekiv.supabase.co"

echo "🔑 Service Role Key eingeben (aus Supabase Dashboard > Settings > API):"
read -s SERVICE_KEY
echo ""

if [ -z "$SERVICE_KEY" ]; then
  echo "❌ Kein Key eingegeben"
  exit 1
fi

echo "📝 Erstelle Test-Order..."
ORDER_RESULT=$(curl -s -X POST "$PROJECT_URL/rest/v1/orders" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "status": "paid",
    "package_id": "trial",
    "package_name": "Test",
    "letter_count": 1,
    "price_chf": 0,
    "paper_option": "premium",
    "handschrift_edition": false,
    "foto_edition": false,
    "frequency": "daily",
    "booking_type": "gift",
    "buyer_email": "denis@letterlift.ch",
    "review_token": "test-elena-1771579765"
  }')

ORDER_ID=$(echo "$ORDER_RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null)

if [ -z "$ORDER_ID" ]; then
  echo "❌ Order erstellen fehlgeschlagen:"
  echo "$ORDER_RESULT" | python3 -m json.tool 2>/dev/null || echo "$ORDER_RESULT"
  exit 1
fi
echo "✅ Order: $ORDER_ID"

echo "📝 Erstelle Recipient..."
RECIP_RESULT=$(curl -s -X POST "$PROJECT_URL/rest/v1/recipients" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{
    \"order_id\": \"$ORDER_ID\",
    \"recipient_name\": \"Elena Scheller\",
    \"nickname\": \"Elena\",
    \"relationship\": \"Ehefrau\",
    \"street\": \"Mürtschenstrasse 7\",
    \"zip\": \"8730\",
    \"city\": \"Uznach\",
    \"country\": \"CH\",
    \"sender_name\": \"Denis\"
  }")
echo "✅ Recipient erstellt"

echo "📝 Erstelle Brief..."
LETTER_RESULT=$(curl -s -X POST "$PROJECT_URL/rest/v1/letters" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{
    \"order_id\": \"$ORDER_ID\",
    \"letter_index\": 1,
    \"status\": \"approved\",
    \"greeting\": \"Liebste Elena,\",
    \"body\": \"manchmal denke ich an den Moment zurück, als wir uns das erste Mal angeschaut haben – wirklich angeschaut. Nicht flüchtig, nicht beiläufig. Sondern so, als hätte die Welt für einen Augenblick den Atem angehalten.\n\nSeitdem sind so viele Tage vergangen. Manche laut und hektisch, manche still und leise. Aber in jedem einzelnen warst du da. Nicht immer sichtbar, aber immer spürbar – wie ein Herzschlag, den man nicht hört, aber der einen am Leben hält.\n\nWas ich dir sagen will: Du bist nicht nur die Frau, die ich liebe. Du bist der Mensch, neben dem ich aufwache und denke: Ja. Genau hier gehöre ich hin.\n\nDanke, dass du mich nimmst, wie ich bin – an den guten Tagen und an den anderen. Danke für jedes Lachen, jeden Blick, jede Berührung, die sagt, was Worte manchmal nicht können.\n\nIch liebe dich. Heute. Morgen. Und an jedem Tag, der noch kommt.\",
    \"sign_off\": \"Für immer dein,\",
    \"quality_score\": 95,
    \"approved_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
  }")
echo "✅ Brief erstellt"

echo ""
echo "💌 Sende Brief über Pingen an Elena..."
echo ""

SEND_RESULT=$(curl -s -X POST "$PROJECT_URL/functions/v1/send-letter" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -d "{\"orderId\": \"$ORDER_ID\", \"letterIndex\": 1}")

echo "$SEND_RESULT" | python3 -m json.tool 2>/dev/null || echo "$SEND_RESULT"

echo ""
echo "═══════════════════════════════════════"
echo "Order ID: $ORDER_ID"
echo "═══════════════════════════════════════"
echo ""
echo "Prüfe in deinem Pingen-Dashboard ob der Brief erscheint!"
echo "https://app.pingen.com"
