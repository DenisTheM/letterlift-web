// src/lib/rateLimit.js
// Client-side rate limiting and bot detection for LetterLift
// Protects against: bot armies generating previews, checkout abuse, API cost explosion

/**
 * Simple in-memory rate limiter (per browser session).
 * Tracks calls per action and enforces limits.
 */
const counters = {};

export function rateLimit(action, maxCalls, windowMs) {
  const now = Date.now();
  if (!counters[action]) {
    counters[action] = [];
  }
  // Remove expired entries
  counters[action] = counters[action].filter((t) => now - t < windowMs);

  if (counters[action].length >= maxCalls) {
    return false; // Rate limit exceeded
  }
  counters[action].push(now);
  return true; // Allowed
}

/**
 * Rate limit presets for LetterLift actions.
 * Returns { allowed: boolean, message: string }
 */
export function checkPreviewLimit() {
  // Max 3 preview generations per 10 minutes
  const allowed = rateLimit("preview", 3, 10 * 60 * 1000);
  return {
    allowed,
    message: allowed
      ? null
      : "Du hast die maximale Anzahl Vorschauen erreicht. Bitte warte ein paar Minuten.",
  };
}

export function checkCheckoutLimit() {
  // Max 3 checkout attempts per 5 minutes
  const allowed = rateLimit("checkout", 3, 5 * 60 * 1000);
  return {
    allowed,
    message: allowed
      ? null
      : "Zu viele Versuche. Bitte warte einen Moment und versuche es erneut.",
  };
}

export function checkAddressSearchLimit() {
  // Max 30 address lookups per 5 minutes
  const allowed = rateLimit("address", 30, 5 * 60 * 1000);
  return { allowed };
}

/**
 * Bot detection based on behavioral signals.
 * Returns { isBot: boolean, reasons: string[] }
 */
export function createBotDetector() {
  const startTime = Date.now();
  const interactions = [];
  let honeypotTriggered = false;

  return {
    // Track meaningful user interactions (typing, clicking)
    recordInteraction(type) {
      interactions.push({ type, time: Date.now() });
    },

    // Honeypot: if a hidden field gets filled, it's a bot
    setHoneypotTriggered() {
      honeypotTriggered = true;
    },

    // Check all signals before checkout
    analyze() {
      const reasons = [];
      const elapsed = Date.now() - startTime;

      // 1. Flow completed impossibly fast (< 30 seconds for entire onboarding)
      if (elapsed < 30 * 1000) {
        reasons.push("flow_too_fast");
      }

      // 2. Honeypot field was filled (invisible to humans, visible to bots)
      if (honeypotTriggered) {
        reasons.push("honeypot");
      }

      // 3. No meaningful interactions recorded (no typing, no clicking)
      if (interactions.length < 5) {
        reasons.push("no_interactions");
      }

      // 4. All interactions happened within 2 seconds (automated filling)
      if (interactions.length > 3) {
        const firstInteraction = interactions[0].time;
        const lastInteraction = interactions[interactions.length - 1].time;
        if (lastInteraction - firstInteraction < 2000) {
          reasons.push("burst_interactions");
        }
      }

      return {
        isBot: reasons.length >= 2, // Need 2+ signals to flag as bot
        isSuspicious: reasons.length >= 1,
        reasons,
      };
    },
  };
}
