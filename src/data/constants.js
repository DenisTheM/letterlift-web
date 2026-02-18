// src/data/constants.js
// ═══════════════════════════════════════════════════════
// Alle Auswahl-Daten an einem Ort
// Neue Anlässe, Pakete, Stile etc. → hier hinzufügen
// ═══════════════════════════════════════════════════════

export const OCCASIONS = [
  { id: "tough_times", emoji: "🌧️", label: "Durch schwere Zeiten", desc: "Trennung, Trauer, Krankheit" },
  { id: "motivation",  emoji: "🎯", label: "Motivation & Ziele",   desc: "Sport, Prüfung, Karriere" },
  { id: "confidence",  emoji: "💪", label: "Selbstvertrauen",      desc: "Mut aufbauen, Neuanfang" },
  { id: "appreciation", emoji: "💛", label: "Wertschätzung",       desc: "Danke sagen, Liebe zeigen" },
  { id: "celebration", emoji: "🎉", label: "Feiern & Ermutigen",   desc: "Geburtstag, Meilenstein" },
  { id: "growth",      emoji: "🌱", label: "Persönliches Wachstum", desc: "Achtsamkeit, Balance" },
];

export const HUMOR_TYPES = [
  { id: "warm",        label: "Warmherzig",    desc: "Gelassen, heiter, macht Mut" },
  { id: "dry",         label: "Trocken",       desc: "Ruhig, nüchtern, fast unemotional" },
  { id: "wordplay",    label: "Wortspiele",    desc: "Doppeldeutig, bildhaft, spielerisch" },
  { id: "ironic",      label: "Ironisch",      desc: "Das Gegenteil des Gesagten meinen" },
  { id: "selfironic",  label: "Selbstironisch", desc: "Über eigene Fehler lachen" },
  { id: "none",        label: "Kein Humor",    desc: "Ernst und aufrichtig" },
];

export const STYLES = [
  { id: "warm",       emoji: "🤗", label: "Warm & herzlich",         desc: "Wie von der besten Freundin" },
  { id: "motivating", emoji: "⚡", label: "Motivierend & direkt",    desc: "Wie ein Coach" },
  { id: "poetic",     emoji: "✨", label: "Reflektierend & poetisch", desc: "Nachdenklich, bildreich" },
  { id: "humorous",   emoji: "😄", label: "Humorvoll & leicht",      desc: "Lustig mit Tiefe" },
  { id: "wise",       emoji: "🌿", label: "Weise & gelassen",        desc: "Wie ein Mentor" },
  { id: "custom",     emoji: "✏️", label: "Eigener Stil",             desc: "Beschreibe den Ton" },
];

export const PACKAGES = [
  { id: "trial",   name: "Trial",   letters: 1,  price: 9.9,  pl: "9.90", trial: true },
  { id: "impuls",  name: "Impuls",  letters: 5,  price: 34.9, pl: "6.98" },
  { id: "classic", name: "Classic", letters: 10, price: 59.9, pl: "5.99", pop: true },
  { id: "journey", name: "Journey", letters: 15, price: 79.9, pl: "5.33" },
];

export const FREQUENCIES = [
  { id: "daily",  label: "Täglich",       desc: "Intensive Journey",      icon: "📬" },
  { id: "every3", label: "Alle 3 Tage",   desc: "Raum zum Nachdenken",    icon: "📅" },
  { id: "weekly", label: "Wöchentlich",    desc: "Längere Begleitung",     icon: "🗓️" },
];

export const PAPER_OPTIONS = [
  { id: "standard",    label: "Standard",           desc: "120g-Papier, weisses Kuvert",             price: 0,    icon: "📄" },
  { id: "premium",     label: "Premium-Papier",     desc: "200g, crèmefarbenes Kuvert",              price: 9.9,  icon: "📜" },
  { id: "handwritten", label: "Handschrift-Edition", desc: "Premium-Papier + Handschrift-Font",      price: 19.9, icon: "✒️" },
];

export const RELATIONSHIPS = [
  "Beste/r Freund/in", "Partner/in", "Mutter", "Vater",
  "Schwester", "Bruder", "Tochter", "Sohn", "Kolleg/in", "Andere",
];

export const PERSONAS = [
  { id: "bestfriend",     emoji: "👋", label: "Dein bester Freund / beste Freundin", desc: "Jemand, der dich seit Jahren kennt",          ph: "z.B. Mein bester Freund Tom" },
  { id: "mentor",         emoji: "🧭", label: "Ein weiser Mentor",                   desc: "Coach, Lehrer oder Vorbild",                  ph: "z.B. Mein alter Trainer" },
  { id: "deceased",       emoji: "🕊️", label: "Eine verstorbene Person",             desc: "Jemand, dessen Stimme du vermisst",           ph: "z.B. Meine Grossmutter" },
  { id: "future_self",    emoji: "🔮", label: "Dein zukünftiges Ich",                desc: "Die Version von dir, die es geschafft hat",   ph: "z.B. Ich in 5 Jahren" },
  { id: "fictional",      emoji: "📖", label: "Eine fiktive Figur",                  desc: "Aus Büchern, Filmen, Serien",                 ph: "z.B. Gandalf, Ted Lasso" },
  { id: "custom_persona", emoji: "✨", label: "Eigene Persona",                      desc: "Beschreibe frei",                             ph: "z.B. Eine warmherzige Stimme" },
];

export const COUNTRIES = [
  { id: "CH",    label: "🇨🇭 Schweiz",        plzLen: 4, plzPh: "8001",  streetPh: "Bahnhofstrasse 42",  cityPh: "Zürich" },
  { id: "DE",    label: "🇩🇪 Deutschland",     plzLen: 5, plzPh: "10115", streetPh: "Friedrichstrasse 42", cityPh: "Berlin" },
  { id: "AT",    label: "🇦🇹 Österreich",      plzLen: 4, plzPh: "1010",  streetPh: "Stephansplatz 1",    cityPh: "Wien" },
  { id: "OTHER", label: "🌍 Anderes Land anfragen" },
];

export const LANGUAGES = [
  ["de", "🇨🇭 Deutsch"],
  ["en", "🇬🇧 English"],
  ["fr", "🇫🇷 Français"],
  ["it", "🇮🇹 Italiano"],
];

export const GENDERS = [
  ["f", "♀ Weiblich"],
  ["m", "♂ Männlich"],
  ["x", "✦ Divers"],
];
