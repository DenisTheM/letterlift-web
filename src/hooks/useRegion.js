// src/hooks/useRegion.js
// Region & Währungs-Erkennung (Cookie / Domain)
import { useState, useEffect } from "react";

export function useRegion() {
  const [region, setRegion] = useState("CH");

  useEffect(() => {
    const h = window.location.hostname;
    if (h.endsWith(".de") || h.endsWith(".at")) { setRegion("EU"); return; }
    const m = document.cookie.match(/ll_region=(\w+)/);
    if (m) setRegion(m[1]);
  }, []);

  const currency   = region === "CH" ? "CHF" : "EUR";
  const currSymbol = region === "CH" ? "CHF " : "€";

  return { region, currency, currSymbol };
}
