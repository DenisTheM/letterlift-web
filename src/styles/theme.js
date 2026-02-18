// src/styles/theme.js
// ═══════════════════════════════════════════════════════
// Design Tokens – zentrale Styling-Konstanten
// Ändere Farben, Fonts oder Radii hier → wirkt überall
// ═══════════════════════════════════════════════════════

export const colors = {
  // Primär (Grün-Palette)
  primary:       "#3D5A4C",
  primaryLight:  "#5B7B6A",
  primaryBg:     "#EEF4F0",
  primaryBorder: "#C6E0CC",
  primaryGrad:   "linear-gradient(135deg, #3D5A4C, #5B7B6A)",

  // Neutrals
  bg:            "#FBF8F5",
  bgGrad:        "linear-gradient(165deg, #FBF8F5 0%, #F3EDE7 100%)",
  card:          "rgba(255,255,255,0.88)",
  cardSolid:     "#fff",
  surface:       "#FDFCFA",
  surfaceMuted:  "#F6F3EF",
  surfaceWarm:   "#FFF8F0",

  // Text
  text:          "#2C2C2C",
  textDark:      "#2D2926",
  textMuted:     "#6B6360",
  textLight:     "#8A8480",
  textLighter:   "#B0A9A3",
  label:         "#8A7F76",

  // Borders
  border:        "#D6CFC8",
  borderLight:   "#E0DAD4",

  // Feedback
  error:         "#E53E3E",
  errorBg:       "#FFF5F5",
  errorBorder:   "#FED7D7",
  errorText:     "#C53030",
  warning:       "#DD6B20",
  warningText:   "#8B6914",
  warningBg:     "#FFF8F0",
  warningBorder: "#F0E4D4",
  info:          "#C0785A",
  success:       "#38A169",
  successDark:   "#276749",
};

export const fonts = {
  sans:   "'DM Sans', sans-serif",
  serif:  "'Lora', Georgia, serif",
  hand:   "'Caveat', cursive",
};

export const radii = {
  sm:  "8px",
  md:  "12px",
  lg:  "14px",
  xl:  "16px",
  xxl: "20px",
  pill: "100px",
};

// ─── Wiederverwendbare Style-Objekte ─────────────────

export const inputStyle = {
  width: "100%",
  padding: "14px 18px",
  border: `1.5px solid ${colors.border}`,
  borderRadius: radii.md,
  fontSize: "15px",
  fontFamily: fonts.serif,
  color: colors.text,
  background: colors.surface,
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

export const textareaStyle = {
  ...inputStyle,
  minHeight: "110px",
  resize: "vertical",
  lineHeight: 1.7,
};

export const labelStyle = {
  display: "block",
  fontSize: "11.5px",
  fontFamily: fonts.sans,
  fontWeight: 600,
  color: colors.label,
  letterSpacing: "0.08em",
  marginBottom: "7px",
  textTransform: "uppercase",
};

export const optionalHint = {
  color: colors.textLighter,
  fontWeight: 400,
};

/** Chip-Style (für Tags/Auswahl) – selected = true/false */
export const chipStyle = (selected) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: "9px 16px",
  borderRadius: radii.pill,
  border: selected ? `2px solid ${colors.primaryLight}` : `1.5px solid ${colors.border}`,
  background: selected ? colors.primaryBg : colors.surface,
  color: selected ? colors.primary : colors.textMuted,
  fontSize: "13.5px",
  fontFamily: fonts.sans,
  fontWeight: selected ? 600 : 400,
  cursor: "pointer",
  transition: "all 0.2s",
  margin: "3px",
});

/** Card-Style (für Listenauswahl) – selected = true/false */
export const cardSelectStyle = (selected) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: "14px",
  padding: "16px 18px",
  borderRadius: radii.md,
  border: selected ? `2px solid ${colors.primaryLight}` : `1.5px solid ${colors.borderLight}`,
  background: selected ? colors.primaryBg : colors.surface,
  cursor: "pointer",
  transition: "all 0.2s",
});

/** Button-Styles */
export const buttonPrimary = {
  background: colors.primaryGrad,
  color: "#fff",
  border: "none",
  borderRadius: radii.lg,
  padding: "14px 32px",
  fontSize: "15px",
  fontFamily: fonts.sans,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 4px 20px rgba(61,90,76,0.25)",
};

export const buttonSecondary = {
  background: "transparent",
  color: colors.primary,
  border: `2px solid ${colors.primaryLight}`,
  borderRadius: radii.lg,
  padding: "14px 30px",
  fontSize: "15px",
  fontFamily: fonts.sans,
  fontWeight: 600,
  cursor: "pointer",
};

// Focus/blur-Handlers für Inputs
export const onFocusInput = (e) => (e.target.style.borderColor = colors.primaryLight);
export const onBlurInput = (e) => (e.target.style.borderColor = colors.border);
