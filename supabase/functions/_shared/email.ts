// supabase/functions/_shared/email.ts
// Shared Resend E-Mail Helper für alle LetterLift Edge Functions

const RESEND_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM = "LetterLift <briefe@letterlift.ch>";

function wrapHtml(content: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#FBF8F5;font-family:Georgia,serif;">
  <div style="max-width:520px;margin:40px auto;padding:0 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:18px;font-weight:700;color:#3D5A4C;font-family:sans-serif;">✉️ LetterLift</span>
    </div>
    <div style="background:#fff;border-radius:16px;padding:36px 32px;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
      ${content}
    </div>
    <p style="font-size:12px;color:#B0A9A3;text-align:center;margin-top:24px;font-family:sans-serif;">
      © 2026 LetterLift – Virtue Compliance GmbH, Uznach
    </p>
  </div>
</body></html>`;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!RESEND_KEY) {
    console.log(`[Email] No RESEND_API_KEY – skipping. Would send to: ${to}, subject: ${subject}`);
    return { success: false, error: "no_api_key" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_KEY}` },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error(`[Email] Resend error:`, data);
      return { success: false, error: data.message || "Resend API error" };
    }
    console.log(`[Email] Sent to ${to}: ${data.id}`);
    return { success: true, id: data.id };
  } catch (err) {
    console.error(`[Email] Failed:`, err);
    return { success: false, error: err.message };
  }
}

// ─── 1. Bestellbestätigung ───
export function orderConfirmationEmail(order: any, recipientName: string): { subject: string; html: string } {
  return {
    subject: `💛 Deine Briefe an ${recipientName} entstehen gerade`,
    html: wrapHtml(`
      <h1 style="font-size:22px;font-weight:400;color:#2D2926;margin:0 0 16px;line-height:1.4;">
        Das ist etwas Besonderes.
      </h1>
      <p style="font-size:15px;color:#4A4543;line-height:1.8;margin:0 0 20px;">
        Du hast gerade entschieden, jemandem mit Worten Kraft zu geben – und das ist mehr, als die meisten Menschen tun. ${order.letter_count} persönliche Briefe an ${recipientName}. Jeder einzelne mit Herz geschrieben.
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
}

// ─── 2. Auto-Freigabe-Info ───
export function autoApproveEmail(order: any, letterIndex: number, recipientName: string): { subject: string; html: string } {
  const reviewUrl = `https://letterlift.ch/review/${order.review_token}`;
  return {
    subject: `📬 Brief ${letterIndex} an ${recipientName} wurde automatisch freigegeben`,
    html: wrapHtml(`
      <h1 style="font-size:22px;font-weight:400;color:#2D2926;margin:0 0 8px;line-height:1.3;">
        Brief ${letterIndex} wurde automatisch freigegeben.
      </h1>
      <p style="font-size:14px;color:#8A8480;margin:0 0 24px;font-family:sans-serif;">
        Für ${recipientName} · ${order.package_name}-Paket
      </p>
      <p style="font-size:14px;color:#6B6360;line-height:1.7;margin:0 0 24px;font-family:sans-serif;">
        Da innerhalb von 24 Stunden keine Rückmeldung kam, wurde Brief ${letterIndex} automatisch freigegeben und wird nun zum Versand vorbereitet.
      </p>
      <a href="${reviewUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#3D5A4C,#5B7B6A);color:#fff;padding:16px;border-radius:12px;text-decoration:none;font-size:16px;font-weight:600;font-family:sans-serif;">
        Briefübersicht öffnen
      </a>`),
  };
}

// ─── 3. Versandbestätigung ───
export function letterSentEmail(order: any, letterIndex: number, recipientName: string): { subject: string; html: string } {
  const reviewUrl = `https://letterlift.ch/review/${order.review_token}`;
  const isLast = letterIndex === order.letter_count;
  return {
    subject: isLast
      ? `🎉 Der letzte Brief an ${recipientName} ist unterwegs!`
      : `📬 Brief ${letterIndex}/${order.letter_count} an ${recipientName} ist unterwegs`,
    html: wrapHtml(`
      <h1 style="font-size:22px;font-weight:400;color:#2D2926;margin:0 0 8px;line-height:1.3;">
        ${isLast ? "Dein letzter Brief ist unterwegs! 🎉" : "Brief " + letterIndex + " ist unterwegs."}
      </h1>
      <p style="font-size:14px;color:#8A8480;margin:0 0 24px;font-family:sans-serif;">
        Für ${recipientName} · Brief ${letterIndex} von ${order.letter_count}
      </p>
      <div style="background:#F0F7F2;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="font-size:14px;color:#3D5A4C;margin:0;font-family:sans-serif;">
          📮 Der Brief wurde gedruckt und ist auf dem Postweg. Zustellung in 2–3 Werktagen.
        </p>
      </div>
      ${isLast
        ? '<p style="font-size:14px;color:#6B6360;line-height:1.7;margin:0 0 24px;font-family:sans-serif;">Alle ' + order.letter_count + " Briefe deiner " + order.package_name + "-Serie sind jetzt verschickt. Danke, dass du jemandem mit Worten Kraft gegeben hast. 💛</p>"
        : '<p style="font-size:14px;color:#6B6360;line-height:1.7;margin:0 0 24px;font-family:sans-serif;">Noch ' + (order.letter_count - letterIndex) + " " + ((order.letter_count - letterIndex) === 1 ? "Brief" : "Briefe") + " in deiner Serie.</p>"}
      <a href="${reviewUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#3D5A4C,#5B7B6A);color:#fff;padding:16px;border-radius:12px;text-decoration:none;font-size:16px;font-weight:600;font-family:sans-serif;">
        Alle Briefe ansehen
      </a>`),
  };
}
