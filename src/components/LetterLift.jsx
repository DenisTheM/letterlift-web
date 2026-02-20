// src/components/LetterLift.jsx
// ═══════════════════════════════════════════════════════
// Hauptkomponente – orchestriert Landing ↔ Onboarding
// Ersetzt den gesamten alten Monolith
// ═══════════════════════════════════════════════════════
"use client";
import { useState } from "react";
import Landing from "./landing/Landing";
import OnboardingFlow from "./onboarding/OnboardingFlow";
import { useRegion } from "../hooks/useRegion";

export default function LetterLift() {
  const { currSymbol } = useRegion();
  const [view, setView] = useState("landing"); // "landing" | "onboarding"
  const [bookingType, setBookingType] = useState(null); // "gift" | "self"

  const handleStart = (type) => {
    setBookingType(type);
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "onboarding_start", { booking_type: type });
    }
    setView("onboarding");
  };

  const handleBack = () => {
    setView("landing");
    setBookingType(null);
  };

  if (view === "landing") {
    return <Landing onStart={handleStart} currSymbol={currSymbol} />;
  }

  return <OnboardingFlow bookingType={bookingType} onBack={handleBack} />;
}
