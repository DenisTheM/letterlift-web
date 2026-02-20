// supabase/functions/send-letter/index.ts
// ═══════════════════════════════════════════════════════════════════
//  LetterLift – Send Letter via Gotenberg + Pingen API
//  Generates Pingen-compliant 2-page A4 HTML, converts to PDF via
//  Gotenberg (Railway), and triggers physical letter delivery.
//
//  Page 1: Address page (left-window envelope, Swiss Post compliant)
//  Page 2: Styled letter content (3 design variants)
//
//  Design v2 (Feb 2026): All designs on white background.
//  Print-optimized: no gradients, no color backgrounds, sharp lines only.
//
//  Gotenberg: HTML → PDF conversion (Railway hosted)
//  Pingen: PDF upload → physical letter delivery
// ═══════════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// ═══ Configuration ═══

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const PINGEN_CLIENT_ID = Deno.env.get("PINGEN_CLIENT_ID") || "";
const PINGEN_CLIENT_SECRET = Deno.env.get("PINGEN_CLIENT_SECRET") || "";
const PINGEN_ORG_ID = Deno.env.get("PINGEN_ORG_ID") || "";
const PINGEN_BASE = "https://api.pingen.com";
const PINGEN_TOKEN_URL = "https://identity.pingen.com/auth/access-tokens";

const GOTENBERG_URL = Deno.env.get("GOTENBERG_URL") || "";
const GOTENBERG_USER = Deno.env.get("GOTENBERG_USER") || "";
const GOTENBERG_PASS = Deno.env.get("GOTENBERG_PASS") || "";

const MANUAL_MODE = !PINGEN_CLIENT_ID || !PINGEN_CLIENT_SECRET;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════
//  DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════════════

type DesignVariant = "standard" | "handschrift" | "premium";

function getDesignVariant(order: any): DesignVariant {
  if (order.paper_option === "premium") return "premium";
  if (order.handschrift_edition) return "handschrift";
  return "standard";
}

function formatGermanDate(date: Date): string {
  const months = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
  ];
  return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/** Map country codes to full names for Pingen address recognition */
const COUNTRY_NAMES: Record<string, string> = {
  DE: "DEUTSCHLAND",
  AT: "ÖSTERREICH",
  FR: "FRANCE",
  IT: "ITALIA",
  US: "USA",
  GB: "UNITED KINGDOM",
  NL: "NIEDERLANDE",
  BE: "BELGIEN",
  LI: "LIECHTENSTEIN",
  LU: "LUXEMBURG",
  ES: "SPANIEN",
};

function buildAddressLines(recipient: any): string {
  const lines = [recipient.recipient_name];
  if (recipient.street) lines.push(recipient.street);
  if (recipient.zip && recipient.city) lines.push(`${recipient.zip} ${recipient.city}`);

  // International: full country name on last line (skip for CH)
  let country = recipient.country;
  if (country === "OTHER") country = (recipient.country_other || "").toUpperCase();
  if (country && country !== "CH") {
    lines.push(COUNTRY_NAMES[country] || country);
  }
  return lines.join("<br/>");
}

function bodyToHTML(text: string): string {
  return text
    .split(/\n\n+/)
    .filter((p) => p.trim())
    .map((p) => `<p>${p.trim().replace(/\n/g, "<br/>")}</p>`)
    .join("\n        ");
}

/** Pingen print options per variant.
 *  delivery_product: cheap|fast|bulk
 *  print_mode: simplex|duplex
 *  print_spectrum: grayscale|color */
function getPrintOptions(variant: DesignVariant) {
  return {
    delivery_product: "cheap",
    print_mode: "simplex",
    // Standard uses warm gold accents → color for best reproduction
    // All variants benefit from color for warm tones
    print_spectrum: "color",
  };
}

// ═══════════════════════════════════════════════════════════════════
//  PAGE 1: ADDRESS PAGE
//  Pingen left-window envelope specs:
//  - Address area: 22mm left, 60mm top, 85.5×25.5mm
//  - Postage zone: 20mm left, 40mm top, 89.5×47.5mm (must be empty)
//  - Restricted: 5mm edges, 15mm bottom-left (DMC area)
// ═══════════════════════════════════════════════════════════════════

function renderAddressPage(recipient: any): string {
  const address = buildAddressLines(recipient);
  return `
    <!-- PAGE 1: Address -->
    <div class="page address-page">
      <div class="zone-address">
        <div class="addr-text">${address}</div>
      </div>
      <div class="brand-area">
        <div class="brand-name">LetterLift</div>
        <div class="brand-tag">sent with ♥</div>
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════
//  PAGE 2: LETTER CONTENT (variant-specific)
// ═══════════════════════════════════════════════════════════════════

function getTextSizeClass(text: string): string {
  const words = text.trim().split(/\s+/).length;
  if (words < 120) return "size-short";
  if (words > 220) return "size-long";
  return "size-normal";
}

function renderLetterPage(variant: DesignVariant, letter: any, recipient: any): string {
  const date = formatGermanDate(new Date());
  const greeting = letter.greeting || `Liebe/r ${recipient.nickname || recipient.recipient_name},`;
  const body = bodyToHTML(letter.body);
  const signoff = letter.sign_off || "In Liebe,";
  const senderName = recipient.sender_name || "";
  const sizeClass = getTextSizeClass(letter.body);

  // Shared footer for Standard + Handschrift
  const sharedFooter = `
      <div class="end-mark">— ♥ —</div>
      <div class="footer-area">
        <span class="fl"></span><span class="ll">LetterLift</span><span class="fl"></span>
      </div>`;

  switch (variant) {
    case "standard":
      return `
    <!-- PAGE 2: Standard Letter -->
    <div class="page letter-standard ${sizeClass}">
      <div class="top-rule"></div>
      <div class="content">
        <div class="date">${date}</div>
        <div class="greeting">${greeting}</div>
        <div class="body">${body}</div>
        <div class="signoff">${signoff}<br/>${senderName}</div>
      </div>${sharedFooter}
    </div>`;

    case "handschrift":
      return `
    <!-- PAGE 2: Handschrift Letter -->
    <div class="page letter-handschrift ${sizeClass}">
      <div class="content">
        <div class="date">${date}</div>
        <div class="greeting">${greeting}</div>
        <div class="body">${body}</div>
        <div class="signoff">${signoff}<br/>${senderName}</div>
      </div>${sharedFooter}
    </div>`;

    case "premium":
      return `
    <!-- PAGE 2: Premium Letter -->
    <div class="page letter-premium ${sizeClass}">
      <div class="frame"></div>
      <div class="corner-tl"></div><div class="corner-tr"></div>
      <div class="corner-bl"></div><div class="corner-br"></div>
      <div class="divider">
        <span class="rule"></span><span class="diamond"></span><span class="rule"></span>
      </div>
      <div class="content">
        <div class="date">${date}</div>
        <div class="greeting">${greeting}</div>
        <div class="body">${body}</div>
        <div class="signoff">${signoff}<br/>${senderName}</div>
      </div>
      <div class="footer-area">
        <span class="fl"></span><span class="ll">LetterLift</span><span class="fl"></span>
      </div>
    </div>`;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  CSS STYLES (v2: print-optimized, white backgrounds, no gradients)
// ═══════════════════════════════════════════════════════════════════

function getStyles(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 0; }

    .page {
      width: 210mm; height: 297mm;
      position: relative; overflow: hidden;
      page-break-after: always;
      page-break-inside: avoid;
      background: #FFFFFF;
    }
    .page:last-child { page-break-after: avoid; }

    /* ── ADDRESS PAGE ── */
    .address-page { padding: 0; }
    .address-page .zone-address {
      position: absolute; left: 22mm; top: 60mm; width: 85.5mm; height: 25.5mm;
    }
    .address-page .zone-address .addr-text {
      font-family: 'DM Sans', Arial, Helvetica, sans-serif;
      font-size: 11pt; font-weight: 400; line-height: 1.5; color: #2C2C2C;
    }
    .address-page .brand-area {
      position: absolute; bottom: 35mm; left: 22mm; right: 22mm; text-align: center;
    }
    .address-page .brand-area .brand-name {
      font-family: 'DM Sans', Arial, sans-serif;
      font-size: 9pt; font-weight: 500;
      text-transform: uppercase; letter-spacing: 3px; color: #D0C8C0;
    }
    .address-page .brand-area .brand-tag {
      font-family: 'DM Sans', Arial, sans-serif;
      font-size: 7.5pt; font-style: italic; color: #C8C0B8; margin-top: 2mm;
    }

    /* ── STANDARD (EB Garamond) ── */
    /* Fine top rule – sharp, prints crisply */
    .letter-standard .top-rule {
      position: absolute; top: 12mm; left: 24mm; right: 24mm;
      height: 0.3pt; background: #C8B8A4;
    }
    .letter-standard .content { padding: 20mm 24mm 0; position: relative; }
    .letter-standard .date {
      font-family: 'EB Garamond', Georgia, serif; font-size: 10.5pt;
      color: #A09080; text-align: right; margin-bottom: 14mm; font-style: italic;
    }
    .letter-standard .greeting {
      font-family: 'EB Garamond', Georgia, serif; font-size: 13pt;
      color: #3E3530; margin-bottom: 8mm; line-height: 1.9; font-style: italic;
    }
    .letter-standard .body {
      font-family: 'EB Garamond', Georgia, serif; font-size: 11pt;
      line-height: 1.95; color: #3E3530;
    }
    .letter-standard .body p { margin-bottom: 6mm; }
    .letter-standard .body p:last-child { margin-bottom: 0; }
    .letter-standard .signoff {
      font-family: 'EB Garamond', Georgia, serif; font-size: 11pt;
      font-style: italic; color: #3E3530; margin-top: 8mm; line-height: 1.9;
    }

    /* ── HANDSCHRIFT (Indie Flower) ── */
    /* Clean white, no lines, no background */
    .letter-handschrift .content { padding: 22mm 22mm 0; position: relative; z-index: 1; }
    .letter-handschrift .date,
    .letter-handschrift .greeting,
    .letter-handschrift .body,
    .letter-handschrift .signoff {
      font-family: 'Indie Flower', cursive; font-size: 12.5pt; color: #2A3830;
      line-height: 8.5mm;
    }
    .letter-handschrift .date { color: #8A8078; text-align: right; margin-bottom: 8.5mm; }
    .letter-handschrift .greeting { margin-bottom: 8.5mm; }
    .letter-handschrift .body p { margin-bottom: 8.5mm; }
    .letter-handschrift .body p:last-child { margin-bottom: 0; }
    .letter-handschrift .signoff { margin-top: 8.5mm; }

    /* ── Shared end-mark + footer (Standard & Handschrift) ── */
    .letter-standard .end-mark,
    .letter-handschrift .end-mark {
      position: absolute; bottom: 30mm;
      left: 50%; transform: translateX(-50%);
      font-family: 'EB Garamond', Georgia, serif;
      font-size: 10pt; color: #C8B8A4; letter-spacing: 4px;
    }
    .letter-standard .footer-area,
    .letter-handschrift .footer-area {
      position: absolute; bottom: 18mm; left: 20mm; right: 20mm;
      display: flex; justify-content: center; align-items: center; gap: 3mm;
    }
    .letter-standard .footer-area .fl,
    .letter-handschrift .footer-area .fl {
      width: 10mm; height: 0.3pt; background: #D0C4B4;
    }
    .letter-standard .footer-area .ll,
    .letter-handschrift .footer-area .ll {
      font-family: 'DM Sans', Arial, sans-serif; font-size: 6pt; font-weight: 500;
      text-transform: uppercase; letter-spacing: 3px; color: #C8BEB0;
    }

    /* ── PREMIUM (Cormorant Garamond) ── */
    /* White background + fine frame + gold corner accents + diamond divider */
    .letter-premium .frame {
      position: absolute; top: 10mm; left: 10mm; right: 10mm; bottom: 18mm;
      border: 0.3pt solid #D4C9B8; pointer-events: none;
    }
    .letter-premium .corner-tl,
    .letter-premium .corner-tr,
    .letter-premium .corner-bl,
    .letter-premium .corner-br {
      position: absolute; width: 8mm; height: 8mm; pointer-events: none;
    }
    .letter-premium .corner-tl { top: 10mm; left: 10mm; border-top: 0.6pt solid #C4B494; border-left: 0.6pt solid #C4B494; }
    .letter-premium .corner-tr { top: 10mm; right: 10mm; border-top: 0.6pt solid #C4B494; border-right: 0.6pt solid #C4B494; }
    .letter-premium .corner-bl { bottom: 18mm; left: 10mm; border-bottom: 0.6pt solid #C4B494; border-left: 0.6pt solid #C4B494; }
    .letter-premium .corner-br { bottom: 18mm; right: 10mm; border-bottom: 0.6pt solid #C4B494; border-right: 0.6pt solid #C4B494; }

    .letter-premium .divider {
      position: absolute; top: 20mm; left: 50%; transform: translateX(-50%);
      display: flex; align-items: center; gap: 3mm;
    }
    .letter-premium .divider .diamond {
      width: 2mm; height: 2mm; background: #C4B494; transform: rotate(45deg);
    }
    .letter-premium .divider .rule {
      width: 18mm; height: 0.3pt; background: #C4B494;
    }

    .letter-premium .content { padding: 30mm 28mm 0; }
    .letter-premium .date {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 10.5pt; font-weight: 300; font-style: italic;
      color: #B0A590; text-align: right; margin-bottom: 12mm; letter-spacing: 0.5px;
    }
    .letter-premium .greeting {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 12pt; font-weight: 300; font-style: italic;
      color: #3A3428; margin-bottom: 8mm; line-height: 1.85;
    }
    .letter-premium .body {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 11.5pt; font-weight: 400; line-height: 1.9; color: #3A3428;
    }
    .letter-premium .body p { margin-bottom: 6mm; }
    .letter-premium .body p:last-child { margin-bottom: 0; }
    .letter-premium .signoff {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 11.5pt; font-weight: 300; font-style: italic;
      color: #3A3428; margin-top: 8mm; line-height: 1.85;
    }
    .letter-premium .footer-area {
      position: absolute; bottom: 22mm; left: 20mm; right: 20mm;
      display: flex; justify-content: center; align-items: center; gap: 4mm;
    }
    .letter-premium .footer-area .fl {
      width: 14mm; height: 0.3pt; background: #D4C9B8;
    }
    .letter-premium .footer-area .ll {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 7pt; font-weight: 500;
      text-transform: uppercase; letter-spacing: 4px; color: #C4B8A6;
    }

    /* ── SIZE MODIFIERS ── */
    .size-short.letter-standard .date          { font-size: 12pt; margin-bottom: 18mm; }
    .size-short.letter-standard .greeting      { font-size: 14pt; }
    .size-short.letter-standard .body          { font-size: 13pt; }
    .size-short.letter-standard .body p        { margin-bottom: 8mm; }
    .size-short.letter-standard .signoff       { font-size: 13pt; }

    .size-short.letter-handschrift .date       { font-size: 14.5pt; }
    .size-short.letter-handschrift .greeting   { font-size: 14.5pt; }
    .size-short.letter-handschrift .body       { font-size: 14.5pt; }
    .size-short.letter-handschrift .body p     { margin-bottom: 7mm; }
    .size-short.letter-handschrift .signoff    { font-size: 14.5pt; }

    .size-short.letter-premium .date           { font-size: 12.5pt; margin-bottom: 16mm; }
    .size-short.letter-premium .greeting       { font-size: 14pt; }
    .size-short.letter-premium .body           { font-size: 13.5pt; }
    .size-short.letter-premium .body p         { margin-bottom: 8mm; }
    .size-short.letter-premium .signoff        { font-size: 13.5pt; }

    .size-long.letter-standard .date           { font-size: 10pt; margin-bottom: 10mm; }
    .size-long.letter-standard .greeting       { font-size: 11pt; line-height: 1.8; }
    .size-long.letter-standard .body           { font-size: 10pt; line-height: 1.8; }
    .size-long.letter-standard .body p         { margin-bottom: 4mm; }
    .size-long.letter-standard .signoff        { font-size: 10pt; line-height: 1.8; }

    .size-long.letter-handschrift .date        { font-size: 11pt; }
    .size-long.letter-handschrift .greeting    { font-size: 11pt; line-height: 1.75; }
    .size-long.letter-handschrift .body        { font-size: 11pt; line-height: 1.75; }
    .size-long.letter-handschrift .body p      { margin-bottom: 3.5mm; }
    .size-long.letter-handschrift .signoff     { font-size: 11pt; line-height: 1.75; }

    .size-long.letter-premium .date            { font-size: 10pt; }
    .size-long.letter-premium .greeting        { font-size: 10.5pt; line-height: 1.75; }
    .size-long.letter-premium .body            { font-size: 10.5pt; line-height: 1.75; }
    .size-long.letter-premium .body p          { margin-bottom: 4mm; }
    .size-long.letter-premium .signoff         { font-size: 10.5pt; line-height: 1.75; }`;
}

// ═══════════════════════════════════════════════════════════════════
//  HTML DOCUMENT (2 pages)
// ═══════════════════════════════════════════════════════════════════

function generateLetterHTML(letter: any, recipient: any, order: any): string {
  const variant = getDesignVariant(order);
  const fontMap: Record<DesignVariant, string> = {
    standard: "family=EB+Garamond:ital,wght@0,400;0,500;1,400",
    handschrift: "family=Indie+Flower",
    premium: "family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500",
  };

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&${fontMap[variant]}&display=swap" rel="stylesheet"/>
  <style>${getStyles()}</style>
</head>
<body>
  ${renderAddressPage(recipient)}
  ${renderLetterPage(variant, letter, recipient)}
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════
//  GOTENBERG: HTML → PDF
// ═══════════════════════════════════════════════════════════════════

async function convertHTMLtoPDF(html: string): Promise<Uint8Array> {
  const formData = new FormData();
  const htmlBlob = new Blob([html], { type: "text/html" });
  formData.append("files", htmlBlob, "index.html");
  formData.append("paperWidth", "8.27");
  formData.append("paperHeight", "11.7");
  formData.append("marginTop", "0");
  formData.append("marginBottom", "0");
  formData.append("marginLeft", "0");
  formData.append("marginRight", "0");
  formData.append("preferCssPageSize", "true");
  formData.append("waitDelay", "2s");

  const headers: Record<string, string> = {};
  if (GOTENBERG_USER && GOTENBERG_PASS) {
    headers["Authorization"] = `Basic ${btoa(`${GOTENBERG_USER}:${GOTENBERG_PASS}`)}`;
  }

  const res = await fetch(`${GOTENBERG_URL}/forms/chromium/convert/html`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gotenberg conversion failed (${res.status}): ${err}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

// ═══════════════════════════════════════════════════════════════════
//  PINGEN API (OAuth2 Client Credentials)
// ═══════════════════════════════════════════════════════════════════

async function getPingenAccessToken(): Promise<string> {
  const credentials = btoa(`${PINGEN_CLIENT_ID}:${PINGEN_CLIENT_SECRET}`);

  const res = await fetch(PINGEN_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "letter batch webhook organisation_read",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pingen OAuth failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function sendViaPingen(letter: any, recipient: any, order: any): Promise<string> {
  const variant = getDesignVariant(order);
  const html = generateLetterHTML(letter, recipient, order);
  const printOpts = getPrintOptions(variant);

  // Step 0: Convert HTML to PDF via Gotenberg
  console.log("[send-letter] Converting HTML to PDF via Gotenberg...");
  const pdfBytes = await convertHTMLtoPDF(html);
  console.log(`[send-letter] PDF generated: ${pdfBytes.length} bytes`);

  // Step 1: Get Pingen OAuth token
  const token = await getPingenAccessToken();

  // Step 2: Get upload URL
  const uploadRes = await fetch(`${PINGEN_BASE}/file-upload`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!uploadRes.ok) throw new Error(`Pingen file-upload failed: ${await uploadRes.text()}`);

  const uploadData = await uploadRes.json();
  const fileUrl = uploadData.data.attributes.url;
  const fileUrlSignature = uploadData.data.attributes.url_signature;

  // Step 3: Upload PDF
  const putRes = await fetch(fileUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/pdf" },
    body: pdfBytes,
  });
  if (!putRes.ok) throw new Error(`Pingen upload failed: ${putRes.status}`);

  // Step 4: Create letter (JSON:API)
  const createRes = await fetch(
    `${PINGEN_BASE}/organisations/${PINGEN_ORG_ID}/letters`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "letters",
          attributes: {
            file_original_name: `letterlift-${order.id}-brief-${letter.letter_index}.pdf`,
            file_url: fileUrl,
            file_url_signature: fileUrlSignature,
            address_position: "left",
            auto_send: false,
          },
        },
      }),
    },
  );
  if (!createRes.ok) throw new Error(`Pingen create failed: ${await createRes.text()}`);

  const createData = await createRes.json();
  const letterId = createData.data.id;

  // Step 5: Wait for validation
  console.log(`[send-letter] Letter created: ${letterId}, waiting for validation...`);
  let status = "processing";
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 3000));
    const checkRes = await fetch(
      `${PINGEN_BASE}/organisations/${PINGEN_ORG_ID}/letters/${letterId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (checkRes.ok) {
      const checkData = await checkRes.json();
      status = checkData.data.attributes.status;
      console.log(`[send-letter] Poll ${i + 1}: status=${status}`);
      if (status === "valid") break;
      if (status === "action_required") {
        throw new Error(`Pingen validation failed (action_required) for letter ${letterId}. Check address/format in Pingen dashboard.`);
      }
    }
  }

  if (status !== "valid") {
    throw new Error(`Pingen letter not validated after polling (status: ${status}). Letter ID: ${letterId}`);
  }

  // Step 6: Send letter (JSON:API requires data.id)
  const sendRes = await fetch(
    `${PINGEN_BASE}/organisations/${PINGEN_ORG_ID}/letters/${letterId}/send`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          id: letterId,
          type: "letters",
          attributes: { ...printOpts },
        },
      }),
    },
  );
  if (!sendRes.ok) throw new Error(`Pingen send failed: ${await sendRes.text()}`);

  return letterId;
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId, letterIndex } = await req.json();
    if (!orderId || !letterIndex) {
      throw new Error("Missing orderId or letterIndex");
    }

    // Load data from DB
    const { data: letter, error: letterErr } = await supabase
      .from("letters").select("*")
      .eq("order_id", orderId).eq("letter_index", letterIndex).single();
    if (letterErr || !letter) throw new Error(`Letter not found: ${letterErr?.message}`);

    const { data: recipient, error: recipErr } = await supabase
      .from("recipients").select("*")
      .eq("order_id", orderId).single();
    if (recipErr || !recipient) throw new Error(`Recipient not found: ${recipErr?.message}`);

    const { data: order, error: orderErr } = await supabase
      .from("orders").select("*")
      .eq("id", orderId).single();
    if (orderErr || !order) throw new Error(`Order not found: ${orderErr?.message}`);

    const variant = getDesignVariant(order);
    console.log(`[send-letter] Order ${orderId} | Brief ${letterIndex} | Design: ${variant}`);

    // Manual mode fallback (no Pingen credentials)
    if (MANUAL_MODE) {
      const html = generateLetterHTML(letter, recipient, order);
      await supabase.from("letters").update({
        status: "approved",
        approved_at: new Date().toISOString(),
      }).eq("id", letter.id);

      console.log(`[send-letter] MANUAL MODE – Brief ${letterIndex} ready for portal upload`);
      return new Response(
        JSON.stringify({ mode: "manual", letterId: letter.id, design: variant, htmlLength: html.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Automated: HTML → Gotenberg → PDF → Pingen → Physical letter
    const pingenId = await sendViaPingen(letter, recipient, order);

    await supabase.from("letters").update({
      status: "sending",
      pingen_letter_id: pingenId,
      pingen_status: "submitted",
      sent_at: new Date().toISOString(),
    }).eq("id", letter.id);

    await supabase.from("orders").update({
      current_letter_index: letterIndex,
    }).eq("id", orderId);

    console.log(`[send-letter] Brief ${letterIndex} sent via Pingen (ID: ${pingenId}) | Design: ${variant}`);

    return new Response(
      JSON.stringify({ mode: "automated", pingenId, design: variant }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[send-letter] Error:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
