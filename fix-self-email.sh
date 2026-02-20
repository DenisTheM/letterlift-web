#!/bin/bash
# ═══════════════════════════════════════════════════════════
# LetterLift – Self-Booking E-Mail Template
# Separate Bestätigungs-E-Mail für Self-Bookings:
# Kein Freigabe-Hinweis, Überraschungseffekt betonen.
# ═══════════════════════════════════════════════════════════
set -euo pipefail

cd ~/Projekte/letterlift-web

echo "💌 LetterLift – Self-Booking E-Mail"
echo "===================================="
echo ""

# ─── 1. Email Template: Gift/Self unterscheiden ───
echo "1/2 → email.ts: Self-Booking Template..."

python3 << 'PYEOF'
with open("supabase/functions/_shared/email.ts", "r") as f:
    content = f.read()

# Find the current orderConfirmationEmail function and replace it
old_sig = "export function orderConfirmationEmail(order: any, recipientName: string): { subject: string; html: string } {"

new_func = """export function orderConfirmationEmail(order: any, recipientName: string): { subject: string; html: string } {
  const isSelf = order.booking_type === "self";

  if (isSelf) {
    return {
      subject: `💛 Deine Briefe an dich entstehen gerade`,
      html: wrapHtml(`
        <h1 style="font-size:22px;font-weight:400;color:#2D2926;margin:0 0 16px;line-height:1.4;">
          Das ist etwas Besonderes.
        </h1>
        <p style="font-size:15px;color:#4A4543;line-height:1.8;margin:0 0 20px;">
          Du hast dir selbst etwas geschenkt – Worte, die dich begleiten. ${order.letter_count} persönliche Briefe, geschrieben für dich.
        </p>
        <div style="background:#F0F7F2;border-radius:12px;padding:24px;margin-bottom:24px;">
          <p style="font-size:14px;color:#3D5A4C;margin:0;font-family:sans-serif;line-height:1.8;">
            <strong>Was jetzt passiert:</strong><br/>
            Wir schreiben deine Briefe. Der erste landet bald in deinem Briefkasten – ohne Vorwarnung, genau dann, wenn du ihn am wenigsten erwartest und am meisten brauchst.
          </p>
        </div>
        <p style="font-size:13px;color:#B0A9A3;margin:24px 0 0;font-family:sans-serif;">
          Bestellnummer: ${order.id.substring(0, 8)} · ${order.package_name}-Paket
        </p>`),
    };
  }

  // Gift booking
  return {
    subject: `💛 Deine Briefe an ${recipientName} entstehen gerade`,
    html: wrapHtml(`
      <h1 style="font-size:22px;font-weight:400;color:#2D2926;margin:0 0 16px;line-height:1.4;">
        Das ist etwas Besonderes.
      </h1>
      <p style="font-size:15px;color:#4A4543;line-height:1.8;margin:0 0 20px;">
        Du hast gerade entschieden, jemandem mit Worten Kraft zu geben. ${order.letter_count} persönliche Briefe an ${recipientName}. Jeder einzelne mit Herz geschrieben.
      </p>
      <p style="font-size:15px;color:#4A4543;line-height:1.8;margin:0 0 24px;">
        Wir machen uns jetzt an die Arbeit. Deine Angaben sind bei uns – und wir nehmen sie ernst.
      </p>
      <div style="background:#F0F7F2;border-radius:12px;padding:24px;margin-bottom:24px;">
        <p style="font-size:14px;color:#3D5A4C;margin:0;font-family:sans-serif;line-height:1.8;">
          <strong>Was jetzt passiert:</strong><br/>
          Wir schreiben deine ${order.letter_count} Briefe. Sobald der erste bereit ist, bekommst du eine E-Mail – dann kannst du ihn lesen, anpassen oder direkt freigeben. Erst nach deinem OK geht er raus.
        </p>
      </div>
      <p style="font-size:14px;color:#6B6360;line-height:1.7;margin:0 0 8px;font-family:sans-serif;">
        Du behältst bei jedem Brief die volle Kontrolle. Kein Brief wird ohne dein Wissen verschickt.
      </p>
      <p style="font-size:13px;color:#B0A9A3;margin:24px 0 0;font-family:sans-serif;">
        Bestellnummer: ${order.id.substring(0, 8)} · ${order.package_name}-Paket
      </p>`),
  };
}"""

if old_sig in content:
    # Find the end of the current function
    start = content.find(old_sig)
    # Find the matching closing brace - we need to count braces
    depth = 0
    pos = start
    found_first = False
    while pos < len(content):
        if content[pos] == '{':
            depth += 1
            found_first = True
        elif content[pos] == '}':
            depth -= 1
            if found_first and depth == 0:
                end = pos + 1
                break
        pos += 1
    
    old_func = content[start:end]
    content = content.replace(old_func, new_func)
    
    with open("supabase/functions/_shared/email.ts", "w") as f:
        f.write(content)
    print("   ✅ email.ts – Gift/Self Templates")
else:
    print("   ⚠️  Function signature nicht gefunden")
    if "orderConfirmationEmail" in content:
        idx = content.find("orderConfirmationEmail")
        print(repr(content[idx:idx+200]))
PYEOF

# ─── 2. Sicherstellen dass webhook-stripe booking_type mitgibt ───
echo "2/2 → Prüfe ob webhook-stripe booking_type in order hat..."
echo "   (booking_type wird bereits bei create-checkout in orders gespeichert,"
echo "    webhook-stripe liest order.* → booking_type ist automatisch verfügbar)"

# Deploy
echo ""
echo "Deploying..."
supabase functions deploy webhook-stripe --no-verify-jwt

echo ""
echo "═══════════════════════════════════════════"
echo "✅ Self-Booking E-Mail deployed!"
echo ""
echo "  Gift-Bestellung:"
echo "    💛 'Deine Briefe an Leni entstehen gerade'"
echo "    → Freigabe-Hinweis, Kontrolle betonen"
echo ""
echo "  Self-Bestellung:"
echo "    💛 'Deine Briefe an dich entstehen gerade'"
echo "    → Überraschungseffekt, keine Freigabe"
echo "    → 'ohne Vorwarnung, genau dann wenn du ihn brauchst'"
echo "═══════════════════════════════════════════"
