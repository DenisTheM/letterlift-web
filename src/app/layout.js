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
        <meta name="theme-color" content="#3D5A4C" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-M7ZK9G336X" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-M7ZK9G336X');` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body style={{ margin: 0, fontFamily: "'Lora', Georgia, serif" }}>
        {children}
      </body>
    </html>
  );
}
