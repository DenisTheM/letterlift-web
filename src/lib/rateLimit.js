// src/lib/rateLimit.js
// Client-side rate limiting and bot detection for LetterLift

const counters = {};

export function rateLimit(action, maxCalls, windowMs) {
  const now = Date.now();
  if (!counters[action]) counters[action] = [];
  counters[action] = counters[action].filter((t) => now - t < windowMs);
  if (counters[action].length >= maxCalls) return false;
  counters[action].push(now);
  return true;
}

export function checkPreviewLimit() {
  const allowed = rateLimit("preview", 3, 10 * 60 * 1000);
  return { allowed, message: allowed ? null : "Du hast die maximale Anzahl Vorschauen erreicht. Bitte warte ein paar Minuten." };
}

export function checkCheckoutLimit() {
  const allowed = rateLimit("checkout", 3, 5 * 60 * 1000);
  return { allowed, message: allowed ? null : "Zu viele Versuche. Bitte warte einen Moment und versuche es erneut." };
}

export function checkAddressSearchLimit() {
  const allowed = rateLimit("address", 30, 5 * 60 * 1000);
  return { allowed };
}

export function createBotDetector() {
  const startTime = Date.now();
  const interactions = [];
  let honeypotTriggered = false;

  return {
    recordInteraction(type) { interactions.push({ type, time: Date.now() }); },
    setHoneypotTriggered() { honeypotTriggered = true; },
    analyze() {
      const reasons = [];
      if (Date.now() - startTime < 30 * 1000) reasons.push("flow_too_fast");
      if (honeypotTriggered) reasons.push("honeypot");
      if (interactions.length < 5) reasons.push("no_interactions");
      if (interactions.length > 3) {
        const span = interactions[interactions.length - 1].time - interactions[0].time;
        if (span < 2000) reasons.push("burst_interactions");
      }
      return { isBot: reasons.length >= 2, isSuspicious: reasons.length >= 1, reasons };
    },
  };
}
