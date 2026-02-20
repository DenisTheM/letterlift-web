// src/lib/analytics.js
// ═══════════════════════════════════════════════════════
// LetterLift – GA4 Custom Event Tracking
// Nur aktiv wenn Consent gegeben (gtag existiert)
// ═══════════════════════════════════════════════════════

function track(event, params = {}) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event, params);
  }
}

export const trackStart = (type) =>
  track("onboarding_start", { booking_type: type });

export const trackStep = (step, bookingType) =>
  track("onboarding_step", { step_name: step, booking_type: bookingType });

export const trackPreview = () =>
  track("preview_generated");

export const trackCheckout = (pkg, total) =>
  track("begin_checkout", { package_name: pkg, value: total, currency: "CHF" });

export const trackPurchase = (orderId, pkg, total) =>
  track("purchase", { transaction_id: orderId, value: total, currency: "CHF", package_name: pkg });

export const trackPackage = (pkg) =>
  track("select_package", { package_name: pkg });

export const trackUpgrade = (upgrade) =>
  track("select_upgrade", { upgrade_type: upgrade });
