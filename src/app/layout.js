// src/app/layout.js
export const metadata = {
  title: "LetterLift – Briefe, die wirklich ankommen",
  description: "KI-personalisierte Briefserien, die berühren. Als Geschenk oder für dich selbst.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Caveat:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, fontFamily: "'Lora', Georgia, serif" }}>
        {children}
      </body>
    </html>
  );
}
