#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  LetterLift – Brief-Test v6
#  Schwellen: <120 Wörter = short, >220 = long
# ═══════════════════════════════════════════════════════════

OUTPUT_DIR="./test-letters"
mkdir -p "$OUTPUT_DIR"

echo "🎨 LetterLift Brief-Test v6..."

cat > "$OUTPUT_DIR/_gen.ts" << 'DENO_SCRIPT'
type Variant = "standard" | "handschrift" | "premium";

const MONTHS = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];

function germanDate(): string {
  const d = new Date();
  return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function sizeClass(text: string): string {
  const w = text.trim().split(/\s+/).length;
  if (w < 120) return "size-short";
  if (w > 220) return "size-long";
  return "size-normal";
}

function bodyHTML(text: string): string {
  return text.split(/\n\n+/).filter(p => p.trim())
    .map(p => `<p>${p.trim().replace(/\n/g, "<br/>")}</p>`).join("\n");
}

const CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
@page { size: A4; margin: 0; }
body { margin: 0; padding: 0; }

.page {
  width: 210mm; height: 297mm;
  position: relative; overflow: hidden;
  page-break-after: always; page-break-inside: avoid;
  background: #FFFFFF;
}
.page:last-child { page-break-after: avoid; }

/* ═══ ADDRESS PAGE ═══ */
.address-page .sender-line {
  position: absolute; left: 22mm; top: 52mm;
  font-family: 'DM Sans', Arial, Helvetica, sans-serif;
  font-size: 7pt; color: #A09890;
  letter-spacing: 0.3px; border-bottom: 0.5px solid #D0C8C0; padding-bottom: 1.5mm;
}
.address-page .zone-address {
  position: absolute; left: 22mm; top: 60mm; width: 85.5mm; height: 25.5mm;
}
.address-page .addr-text {
  font-family: 'DM Sans', Arial, Helvetica, sans-serif;
  font-size: 11pt; font-weight: 400; line-height: 1.5; color: #2C2C2C;
}
.address-page .brand-area {
  position: absolute; bottom: 30mm; left: 22mm; right: 22mm; text-align: center;
}
.address-page .brand-name {
  font-family: 'DM Sans', Arial, sans-serif;
  font-size: 9pt; font-weight: 500; text-transform: uppercase; letter-spacing: 3px; color: #D0C8C0;
}
.address-page .brand-tag {
  font-family: 'DM Sans', Arial, sans-serif;
  font-size: 7.5pt; font-style: italic; color: #C8C0B8; margin-top: 2mm;
}

/* ═══ STANDARD ═══ */
.letter-standard .accent-line {
  position: absolute; top: 0; left: 0; right: 0; height: 1.5mm;
  background: linear-gradient(90deg, #D4C5B4, #C8B99A, #D4C5B4); opacity: 0.5;
}
.letter-standard .content { padding: 22mm 24mm 0; }
.letter-standard .date          { font-family: 'EB Garamond', Georgia, serif; font-size: 11pt; color: #A09890; text-align: right; margin-bottom: 14mm; }
.letter-standard .greeting      { font-family: 'EB Garamond', Georgia, serif; font-size: 11pt; color: #3E3830; margin-bottom: 8mm; line-height: 1.95; }
.letter-standard .body          { font-family: 'EB Garamond', Georgia, serif; font-size: 11pt; line-height: 1.95; color: #3E3830; }
.letter-standard .body p        { margin-bottom: 6mm; }
.letter-standard .body p:last-child { margin-bottom: 0; }
.letter-standard .signoff       { font-family: 'EB Garamond', Georgia, serif; font-size: 11pt; color: #3E3830; margin-top: 8mm; line-height: 1.95; }
.letter-standard .footer-area   { position: absolute; bottom: 10mm; left: 24mm; right: 24mm; text-align: center; }
.letter-standard .footer-area .ll { font-family: 'DM Sans', Arial, sans-serif; font-size: 6pt; font-weight: 500; text-transform: uppercase; letter-spacing: 3px; color: #D0C8C0; }

/* ═══ HANDSCHRIFT ═══ */
.letter-handschrift { background: #FFFEF6; }
.letter-handschrift .lines {
  position: absolute; top: 30mm; left: 22mm; right: 22mm; bottom: 22mm; pointer-events: none;
  background-image: repeating-linear-gradient(to bottom, transparent, transparent 9.5mm, rgba(170,155,135,0.10) 9.5mm, rgba(170,155,135,0.10) 10mm);
}
.letter-handschrift .content    { padding: 22mm 22mm 0; position: relative; z-index: 1; }
.letter-handschrift .date       { font-family: 'Indie Flower', cursive; font-size: 12.5pt; color: #8A8078; text-align: right; margin-bottom: 10mm; line-height: 1.9; }
.letter-handschrift .greeting   { font-family: 'Indie Flower', cursive; font-size: 12.5pt; color: #2A3830; margin-bottom: 6mm; line-height: 1.9; }
.letter-handschrift .body       { font-family: 'Indie Flower', cursive; font-size: 12.5pt; color: #2A3830; line-height: 1.95; }
.letter-handschrift .body p     { margin-bottom: 5mm; }
.letter-handschrift .body p:last-child { margin-bottom: 0; }
.letter-handschrift .signoff    { font-family: 'Indie Flower', cursive; font-size: 12.5pt; color: #2A3830; margin-top: 6mm; line-height: 1.9; }
.letter-handschrift .footer-area { position: absolute; bottom: 10mm; left: 22mm; right: 22mm; text-align: center; z-index: 1; }
.letter-handschrift .footer-area .ll { font-family: 'DM Sans', Arial, sans-serif; font-size: 6pt; font-weight: 500; text-transform: uppercase; letter-spacing: 3px; color: #D0C8BE; }

/* ═══ PREMIUM ═══ */
.letter-premium { background: #FDFAF3; }
.letter-premium .ornament {
  position: absolute; top: 12mm; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 3mm;
}
.letter-premium .ornament .dot  { width: 1.5mm; height: 1.5mm; border-radius: 50%; background: #C4B494; }
.letter-premium .ornament .line { width: 12mm; height: 0.4mm; background: #C4B494; }
.letter-premium .content        { padding: 22mm 24mm 0; }
.letter-premium .date           { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 11pt; font-style: italic; color: #B0A590; text-align: right; margin-bottom: 10mm; }
.letter-premium .greeting       { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 11pt; font-style: italic; color: #3A3428; margin-bottom: 7mm; line-height: 1.85; }
.letter-premium .body           { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 11pt; line-height: 1.85; color: #3A3428; }
.letter-premium .body p         { margin-bottom: 5.5mm; }
.letter-premium .body p:last-child { margin-bottom: 0; }
.letter-premium .signoff        { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 11pt; font-style: italic; color: #3A3428; margin-top: 7mm; line-height: 1.85; }
.letter-premium .footer-area    { position: absolute; bottom: 10mm; left: 24mm; right: 24mm; display: flex; justify-content: center; align-items: center; gap: 4mm; padding-top: 4mm; border-top: 0.3mm solid rgba(196,180,148,0.25); }
.letter-premium .footer-area .fl { width: 8mm; height: 0.3mm; background: rgba(196,180,148,0.35); }
.letter-premium .footer-area .ll { font-family: 'DM Sans', Arial, sans-serif; font-size: 6pt; font-weight: 500; text-transform: uppercase; letter-spacing: 3px; color: #C4B8A6; }

/* ═══ SIZE: SHORT < 120 Wörter ═══ */
.size-short.letter-standard .date          { font-size: 13pt; margin-bottom: 18mm; }
.size-short.letter-standard .greeting      { font-size: 13pt; }
.size-short.letter-standard .body          { font-size: 13pt; }
.size-short.letter-standard .body p        { margin-bottom: 8mm; }
.size-short.letter-standard .signoff       { font-size: 13pt; }

.size-short.letter-handschrift .date       { font-size: 14.5pt; }
.size-short.letter-handschrift .greeting   { font-size: 14.5pt; }
.size-short.letter-handschrift .body       { font-size: 14.5pt; }
.size-short.letter-handschrift .body p     { margin-bottom: 7mm; }
.size-short.letter-handschrift .signoff    { font-size: 14.5pt; }

.size-short.letter-premium .date           { font-size: 13pt; margin-bottom: 14mm; }
.size-short.letter-premium .greeting       { font-size: 13pt; }
.size-short.letter-premium .body           { font-size: 13pt; }
.size-short.letter-premium .body p         { margin-bottom: 8mm; }
.size-short.letter-premium .signoff        { font-size: 13pt; }

/* ═══ SIZE: LONG > 220 Wörter ═══ */
.size-long.letter-standard .date           { font-size: 10pt; margin-bottom: 10mm; }
.size-long.letter-standard .greeting       { font-size: 10pt; line-height: 1.8; }
.size-long.letter-standard .body           { font-size: 10pt; line-height: 1.8; }
.size-long.letter-standard .body p         { margin-bottom: 4mm; }
.size-long.letter-standard .signoff        { font-size: 10pt; line-height: 1.8; }

.size-long.letter-handschrift .date        { font-size: 11pt; }
.size-long.letter-handschrift .greeting    { font-size: 11pt; line-height: 1.75; }
.size-long.letter-handschrift .body        { font-size: 11pt; line-height: 1.75; }
.size-long.letter-handschrift .body p      { margin-bottom: 3.5mm; }
.size-long.letter-handschrift .signoff     { font-size: 11pt; line-height: 1.75; }

.size-long.letter-premium .date            { font-size: 10pt; }
.size-long.letter-premium .greeting        { font-size: 10pt; line-height: 1.7; }
.size-long.letter-premium .body            { font-size: 10pt; line-height: 1.7; }
.size-long.letter-premium .body p          { margin-bottom: 4mm; }
.size-long.letter-premium .signoff         { font-size: 10pt; line-height: 1.7; }
`;

const R = {
  recipient_name: "Sarah Müller", street: "Bahnhofstrasse 42",
  zip: "8001", city: "Zürich", country: "CH", sender_name: "Mama",
};

const L = {
  greeting: "Liebe Sarah,",
  sign_off: "In Liebe,",
  body: `weisst du noch, wie wir damals in Lissabon durch die Gassen gelaufen sind? Plötzlich fing dieser Strassenmusiker an, genau das Lied zu spielen, das du den ganzen Urlaub gesummt hast.

Du bist stehengeblieben, hast gelacht und gesagt: «Das Universum hört zu.»

Ich glaube, du hattest recht. Nicht weil das Universum Musik spielt – sondern weil du jemand bist, der solche Momente bemerkt. Die meisten Menschen wären einfach weitergelaufen.

Du nicht. Und genau das macht dich zu dem Menschen, der du bist.`,
};

const FONTS: Record<Variant, string> = {
  standard: "family=EB+Garamond:ital,wght@0,400;0,500;1,400",
  handschrift: "family=Indie+Flower",
  premium: "family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400;1,500",
};

const addr = `${R.recipient_name}<br/>${R.street}<br/>${R.zip} ${R.city}`;
const body = bodyHTML(L.body);
const sc = sizeClass(L.body);
const date = germanDate();
const words = L.body.trim().split(/\s+/).length;

console.log(`📝 ${words} Wörter → ${sc}`);

const PAGE1 = `<div class="page address-page">
  <div class="sender-line">LetterLift – sent with ♥</div>
  <div class="zone-address"><div class="addr-text">${addr}</div></div>
  <div class="brand-area">
    <div class="brand-name">LetterLift</div>
    <div class="brand-tag">Worte, die ankommen.</div>
  </div>
</div>`;

const PAGES: Record<Variant, string> = {
  standard: `<div class="page letter-standard ${sc}">
  <div class="accent-line"></div>
  <div class="content">
    <div class="date">${date}</div>
    <div class="greeting">${L.greeting}</div>
    <div class="body">${body}</div>
    <div class="signoff">${L.sign_off}<br/>${R.sender_name}</div>
  </div>
  <div class="footer-area"><span class="ll">LetterLift</span></div>
</div>`,

  handschrift: `<div class="page letter-handschrift ${sc}">
  <div class="lines"></div>
  <div class="content">
    <div class="date">${date}</div>
    <div class="greeting">${L.greeting}</div>
    <div class="body">${body}</div>
    <div class="signoff">${L.sign_off}<br/>${R.sender_name}</div>
  </div>
  <div class="footer-area"><span class="ll">LetterLift</span></div>
</div>`,

  premium: `<div class="page letter-premium ${sc}">
  <div class="ornament">
    <span class="dot"></span><span class="line"></span>
    <span class="dot"></span><span class="line"></span>
    <span class="dot"></span>
  </div>
  <div class="content">
    <div class="date">${date}</div>
    <div class="greeting">${L.greeting}</div>
    <div class="body">${body}</div>
    <div class="signoff">${L.sign_off}<br/>${R.sender_name}</div>
  </div>
  <div class="footer-area">
    <span class="fl"></span><span class="ll">LetterLift</span><span class="fl"></span>
  </div>
</div>`,
};

const dir = Deno.args[0] || "./test-letters";

for (const v of ["standard", "handschrift", "premium"] as Variant[]) {
  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&${FONTS[v]}&display=swap" rel="stylesheet"/>
<style>${CSS}</style>
</head>
<body>
${PAGE1}
${PAGES[v]}
</body>
</html>`;

  Deno.writeTextFileSync(`${dir}/brief-${v}.html`, html);
  console.log("✅ brief-" + v + ".html");
}
console.log("\n🎉 Cmd+P → Als PDF → 2 Seiten");
DENO_SCRIPT

if command -v deno &> /dev/null; then
  deno run --allow-write --allow-read "$OUTPUT_DIR/_gen.ts" "$OUTPUT_DIR"
else
  echo "⚠️  brew install deno"; exit 1
fi
rm -f "$OUTPUT_DIR/_gen.ts"

if [[ "$OSTYPE" == "darwin"* ]]; then
  open "$OUTPUT_DIR/brief-standard.html"
  open "$OUTPUT_DIR/brief-handschrift.html"
  open "$OUTPUT_DIR/brief-premium.html"
fi

echo "💡 Cmd+P → 'Als PDF sichern' → 2 Seiten"
