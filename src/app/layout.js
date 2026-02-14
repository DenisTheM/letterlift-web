// src/app/layout.js
export const metadata = {
  title: "LetterLift – Persönliche Briefserien, die berühren",
  description: "Persönliche Briefserien für die Menschen, die dir am Herzen liegen. KI-unterstützt, von dir inspiriert. Als Geschenk oder für dich selbst. Ab CHF 34.90.",
  keywords: ["Briefe verschenken", "persönliche Geschenkidee", "Briefserie", "emotionales Geschenk", "KI Briefe", "persönliche Briefe", "Geschenk Schweiz", "LetterLift"],
  authors: [{ name: "LetterLift" }],
  creator: "LetterLift",
  metadataBase: new URL("https://letterlift.ch"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "LetterLift – Persönliche Briefserien, die berühren",
    description: "Überrasche jemanden mit einer Serie persönlicher Briefe. Echtes Papier, echte Emotionen. Ab CHF 34.90.",
    url: "https://letterlift.ch",
    siteName: "LetterLift",
    locale: "de_CH",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "LetterLift – Persönliche Briefserien, die berühren" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LetterLift – Briefe, die wirklich ankommen",
    description: "Persönliche Briefserien als Geschenk oder für dich selbst. KI-unterstützt, von dir inspiriert.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "og:price:amount": "34.90",
    "og:price:currency": "CHF",
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "LetterLift Briefserie",
    description: "KI-personalisierte Briefserien, die berühren. Als Geschenk oder für dich selbst.",
    brand: { "@type": "Brand", name: "LetterLift" },
    offers: {
      "@type": "AggregateOffer",
      lowPrice: "34.90",
      highPrice: "79.90",
      priceCurrency: "CHF",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Caveat:wght@400;600&display=swap" rel="stylesheet" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3D5A4C" />
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
          function loadGA(){if(window._gaLoaded)return;window._gaLoaded=true;var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=G-M7ZK9G336X';document.head.appendChild(s);gtag('js',new Date());gtag('config','G-M7ZK9G336X');}
          if(document.cookie.indexOf('ll_consent=1')!==-1)loadGA();
        ` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body style={{ margin: 0, fontFamily: "'Lora', Georgia, serif" }}>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            if(document.cookie.indexOf('ll_consent=')!==-1)return;
            var b=document.createElement('div');
            b.id='ll-cookie';
            b.style.cssText='position:fixed;bottom:0;left:0;right:0;background:#2D2926;color:#fff;padding:14px 20px;display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;z-index:9999;font-family:DM Sans,sans-serif;font-size:13px;';
            b.innerHTML='<span style="flex:1;min-width:200px;line-height:1.5;">Wir verwenden Cookies für die Analyse unserer Website. <a href="/datenschutz" style="color:#A8D5BA;text-decoration:underline;">Mehr erfahren</a></span><button onclick="llAccept()" style="background:#5B7B6A;color:#fff;border:none;border-radius:8px;padding:8px 20px;font-size:13px;font-weight:600;cursor:pointer;font-family:DM Sans,sans-serif;">Akzeptieren</button><button onclick="llDecline()" style="background:none;color:#999;border:1px solid #555;border-radius:8px;padding:8px 16px;font-size:13px;cursor:pointer;font-family:DM Sans,sans-serif;">Ablehnen</button>';
            document.body.appendChild(b);
            window.llAccept=function(){document.cookie='ll_consent=1;path=/;max-age=31536000;SameSite=Lax';loadGA();b.remove();};
            window.llDecline=function(){document.cookie='ll_consent=0;path=/;max-age=31536000;SameSite=Lax';b.remove();};
          })();
        ` }} />
      </body>
    </html>
  );
}
