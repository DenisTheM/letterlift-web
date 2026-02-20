#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# LetterLift – 3 Testbriefe versenden (Standard, Handschrift, Premium)
# Legt Orders + Recipients + Letters in DB an, ruft send-letter auf
# ═══════════════════════════════════════════════════════════════
#
# Voraussetzung: send-letter muss deployed sein:
#   supabase functions deploy send-letter --no-verify-jwt
#
# Usage: bash test-send-three-designs.sh
# ═══════════════════════════════════════════════════════════════

set -e

# ── Config ──
# Versuche zuerst Shell-Umgebungsvariablen, dann .env.local
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] && [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-$SUPABASE_URL}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SERVICE_KEY" ]; then
  echo "❌ SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY nicht gefunden."
  echo "   Lade sie mit: source .env.local"
  exit 1
fi

API="$SUPABASE_URL/rest/v1"
FN="$SUPABASE_URL/functions/v1"
AUTH_HEADERS=(-H "apikey: $SERVICE_KEY" -H "Authorization: Bearer $SERVICE_KEY" -H "Content-Type: application/json" -H "Prefer: return=representation")

echo "═══════════════════════════════════════"
echo "  LetterLift – 3 Design-Testbriefe"
echo "═══════════════════════════════════════"
echo ""

# ════════════════════════════════════════════
# 1) STANDARD → Frank (Estenfeld, DE)
# ════════════════════════════════════════════
echo "📝 1/3: Standard-Brief an Frank..."

ORDER1=$(curl -s "$API/orders" "${AUTH_HEADERS[@]}" -d '{
  "package_id": "trial",
  "package_name": "Design-Test Standard",
  "letter_count": 1,
  "price_chf": 0,
  "paper_option": "standard",
  "handschrift_edition": false,
  "frequency": "every3",
  "booking_type": "gift",
  "buyer_email": "sachenohne@gmail.com",
  "status": "paid",
  "review_token": "'$(uuidgen | tr '[:upper:]' '[:lower:]')'"
}')
ORDER1_ID=$(echo "$ORDER1" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])")
echo "   Order: $ORDER1_ID"

curl -s "$API/recipients" "${AUTH_HEADERS[@]}" -d '{
  "order_id": "'"$ORDER1_ID"'",
  "recipient_name": "Frank",
  "nickname": "Frank",
  "relationship": "bester Freund",
  "street": "Dürerstraße 55",
  "zip": "97230",
  "city": "Estenfeld",
  "country": "DE",
  "sender_name": "Denis"
}' > /dev/null

curl -s "$API/letters" "${AUTH_HEADERS[@]}" -d '{
  "order_id": "'"$ORDER1_ID"'",
  "letter_index": 1,
  "greeting": "Hey Frank,",
  "body": "ich sass neulich abends auf der Couch und musste an unsere Zeit bei Assa Abloy in Walluf denken. Damals hätte keiner von uns gedacht, wohin uns das alles noch führen würde. Und dann standen wir plötzlich zusammen in Mainz und haben FinanzABC aus dem Boden gestampft. Was für ein Ritt.\n\nAber weisst du, was mich dabei am meisten beeindruckt hat? Nicht die Business-Pläne oder die langen Nächte. Sondern du. Deine Art, für andere da zu sein. Dein grosses Herz. Wie du einfach anpackst, ohne gross zu reden, wenn jemand Hilfe braucht.\n\nEs gibt nicht viele Menschen, auf die man sich wirklich verlassen kann. Du bist einer davon. Und das sage ich nicht leichtfertig. Ich meine es so, wie man es eben meint, wenn man gemeinsam durch Dick und Dünn gegangen ist.\n\nDanke, dass du bist, wie du bist. Für deine Verlässlichkeit, deine Hilfsbereitschaft und dafür, dass du mir immer das Gefühl gibst, dass ich mich auf dich verlassen kann. Egal was kommt.\n\nLass uns bald wieder ein Bier trinken. Oder zwei. Du weisst ja, wie das bei uns läuft.",
  "sign_off": "Auf uns, Bruder.",
  "word_count": 175,
  "status": "approved",
  "approved_at": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"
}' > /dev/null

echo "   ✅ Order + Recipient + Letter angelegt"

# ════════════════════════════════════════════
# 2) HANDSCHRIFT → Alina (Uznach, CH)
# ════════════════════════════════════════════
echo "📝 2/3: Handschrift-Brief an Alina..."

ORDER2=$(curl -s "$API/orders" "${AUTH_HEADERS[@]}" -d '{
  "package_id": "trial",
  "package_name": "Design-Test Handschrift",
  "letter_count": 1,
  "price_chf": 0,
  "paper_option": "standard",
  "handschrift_edition": true,
  "frequency": "every3",
  "booking_type": "gift",
  "buyer_email": "sachenohne@gmail.com",
  "status": "paid",
  "review_token": "'$(uuidgen | tr '[:upper:]' '[:lower:]')'"
}')
ORDER2_ID=$(echo "$ORDER2" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])")
echo "   Order: $ORDER2_ID"

curl -s "$API/recipients" "${AUTH_HEADERS[@]}" -d '{
  "order_id": "'"$ORDER2_ID"'",
  "recipient_name": "Alina Scheller",
  "nickname": "Alina",
  "relationship": "Tochter",
  "street": "Mürtschenstrasse 7",
  "zip": "8730",
  "city": "Uznach",
  "country": "CH",
  "sender_name": "Papa"
}' > /dev/null

curl -s "$API/letters" "${AUTH_HEADERS[@]}" -d '{
  "order_id": "'"$ORDER2_ID"'",
  "letter_index": 1,
  "greeting": "Meine liebste Alina,",
  "body": "weisst du, was ich an dir am meisten bewundere? Dass du genau weisst, was du willst – und nicht aufhörst, bis du es geschafft hast. Das ist eine Superkraft, mein Schatz. Nicht jeder hat die.\n\nIch sehe das jedes Mal auf dem Reiterhof Knobel. Wenn du auf Boni sitzt, dann strahlst du etwas aus, das grösser ist als du. Klar, Boni ist ein Schulpferd und gehört nicht uns – aber so wie er auf dich reagiert, wie seine Ohren nach vorne gehen, wenn du mit ihm sprichst, da merkt man: Zwischen euch beiden stimmt die Verbindung.\n\nUnd dann zuhause: Monty, der sich abends an dich kuschelt, weil er genau spürt, was für ein Herz du hast. Tiere erkennen das. Die lassen sich nicht täuschen.\n\nMit 10 Jahren bist du schon so durchsetzungsstark und zielgerichtet – ich staune manchmal, woher du das hast. Okay, vielleicht habe ich eine Ahnung. Aber bei dir ist es nochmal eine ganz andere Liga.\n\nIch bin so unglaublich stolz auf dich. Nicht weil du alles perfekt machst – sondern weil du alles mit vollem Herzen machst. Mit dieser Entschlossenheit, die so typisch Alina ist.\n\nIch liebe dich über alles, mein Schatz. Mehr als alle Pferde und Katzen dieser Welt zusammen. Und das will was heissen.",
  "sign_off": "Dein Papa, der dich über alles liebt.",
  "word_count": 204,
  "status": "approved",
  "approved_at": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"
}' > /dev/null

echo "   ✅ Order + Recipient + Letter angelegt"

# ════════════════════════════════════════════
# 3) PREMIUM → Tizian (Uznach, CH)
# ════════════════════════════════════════════
echo "📝 3/3: Premium-Brief an Tizian..."

ORDER3=$(curl -s "$API/orders" "${AUTH_HEADERS[@]}" -d '{
  "package_id": "trial",
  "package_name": "Design-Test Premium",
  "letter_count": 1,
  "price_chf": 0,
  "paper_option": "premium",
  "handschrift_edition": false,
  "frequency": "every3",
  "booking_type": "gift",
  "buyer_email": "sachenohne@gmail.com",
  "status": "paid",
  "review_token": "'$(uuidgen | tr '[:upper:]' '[:lower:]')'"
}')
ORDER3_ID=$(echo "$ORDER3" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])")
echo "   Order: $ORDER3_ID"

curl -s "$API/recipients" "${AUTH_HEADERS[@]}" -d '{
  "order_id": "'"$ORDER3_ID"'",
  "recipient_name": "Tizian Scheller",
  "nickname": "Tizian",
  "relationship": "Sohn",
  "street": "Mürtschenstrasse 7",
  "zip": "8730",
  "city": "Uznach",
  "country": "CH",
  "sender_name": "Papa"
}' > /dev/null

curl -s "$API/letters" "${AUTH_HEADERS[@]}" -d '{
  "order_id": "'"$ORDER3_ID"'",
  "letter_index": 1,
  "greeting": "Lieber Tizian,",
  "body": "ich wollte dir schon lange mal sagen, wie stolz ich auf dich bin. Einfach so. Nicht weil du etwas Bestimmtes getan hast – sondern weil du du bist.\n\nUnd jetzt hast du auch noch dein neues Mountainbike! Als ich dein Gesicht gesehen habe, als du es zum ersten Mal entdeckt hast – dieses Grinsen, diese leuchtenden Augen – das werde ich nie vergessen.\n\nIch kann es kaum erwarten zu sehen, wie du damit durch die Gegend düst. Der Wind in deinen Haaren, dieses \"Wooohooo!\" wenn es bergab geht. Du wirst Trails entdecken, Pfützen durchfahren und wahrscheinlich auch mal hinfallen. Aber weisst du was? Das gehört dazu.\n\nDas Beste am Fahrradfahren ist: Es ist wie das Leben. Manchmal geht es bergauf, und das ist anstrengend. Aber dann kommt wieder ein Stück bergab, und du fliegst. Und das Gefühl, es den Berg hochgeschafft zu haben – das ist unbezahlbar.\n\nMit 8 Jahren stehen dir alle Wege offen. Jeder Trail, jeder Pfad, jedes Abenteuer. Und ich verspreche dir: Egal wohin du fährst, ich bin da. Zum Anfeuern, zum Pflaster-Kleben und zum Mitfeiern.\n\nAlso: Helm auf, Pedale rein, und los geht's, Champion!",
  "sign_off": "Dein stolzer Papa.",
  "word_count": 192,
  "status": "approved",
  "approved_at": "'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"
}' > /dev/null

echo "   ✅ Order + Recipient + Letter angelegt"

# ════════════════════════════════════════════
# VERSAND: send-letter für alle 3 aufrufen
# ════════════════════════════════════════════
echo ""
echo "📬 Starte Versand..."
echo ""

echo "🚀 1/3: Standard (Order: $ORDER1_ID)..."
RESULT=$(curl -s "$FN/send-letter" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "apikey: $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"orderId": "'"$ORDER1_ID"'", "letterIndex": 1}')
echo "   → $RESULT"
echo ""

echo "🚀 2/3: Handschrift (Order: $ORDER2_ID)..."
RESULT=$(curl -s "$FN/send-letter" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "apikey: $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"orderId": "'"$ORDER2_ID"'", "letterIndex": 1}')
echo "   → $RESULT"
echo ""

echo "🚀 3/3: Premium (Order: $ORDER3_ID)..."
RESULT=$(curl -s "$FN/send-letter" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "apikey: $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"orderId": "'"$ORDER3_ID"'", "letterIndex": 1}')
echo "   → $RESULT"
echo ""

echo "═══════════════════════════════════════"
echo "  ✅ Fertig! 3 Briefe werden verarbeitet."
echo ""
echo "  📋 Order IDs:"
echo "  Standard:    $ORDER1_ID"
echo "  Handschrift: $ORDER2_ID"  
echo "  Premium:     $ORDER3_ID"
echo ""
echo "  🔍 Prüfe Status in Pingen Dashboard:"
echo "  https://app.pingen.com"
echo "═══════════════════════════════════════"
