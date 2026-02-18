// src/components/steps/StepAddress.jsx
"use client";
import { useState, useRef } from "react";
import SectionHeader from "../shared/SectionHeader";
import { COUNTRIES } from "../../data/constants";
import { inputStyle, labelStyle, chipStyle, fonts, colors, onFocusInput, onBlurInput } from "../../styles/theme";
import { checkAddressSearchLimit } from "../../lib/rateLimit";

export default function StepAddress({ data, update, isSelf, trackInteraction }) {
  const [addrSugg, setAddrSugg] = useState([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const addrTimer = useRef(null);

  const cc = COUNTRIES.find(c => c.id === data.country) || COUNTRIES[0];
  const plzValid = data.zip && cc.plzLen ? data.zip.replace(/\D/g, "").length === cc.plzLen : true;
  const plzError = data.zip.length > 0 && !plzValid;
  const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY || "";

  const searchAddr = (val) => {
    update("street", val);
    trackInteraction();
    if (!GEOAPIFY_KEY || val.length < 5 || data.country === "OTHER") return setAddrSugg([]);
    if (!checkAddressSearchLimit().allowed) return;
    clearTimeout(addrTimer.current);
    addrTimer.current = setTimeout(async () => {
      setAddrLoading(true);
      try {
        const countryFilter = data.country ? `&filter=countrycode:${data.country.toLowerCase()}` : "";
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(val)}&lang=de&limit=5&format=json${countryFilter}&apiKey=${GEOAPIFY_KEY}`
        );
        const json = await res.json();
        if (json.results) {
          setAddrSugg(json.results.map(r => ({
            street: (r.street || "") + (r.housenumber ? " " + r.housenumber : ""),
            zip: r.postcode || "",
            city: r.city || r.town || r.village || "",
            country: r.country_code?.toUpperCase() || data.country,
            formatted: r.formatted || "",
          })));
        }
      } catch (e) { console.error("Geoapify error:", e); }
      finally { setAddrLoading(false); }
    }, 500);
  };

  const selectAddr = (s) => {
    update("street", s.street);
    update("zip", s.zip);
    update("city", s.city);
    if (s.country && ["CH", "DE", "AT"].includes(s.country)) update("country", s.country);
    setAddrSugg([]);
  };

  return (
    <div>
      <SectionHeader
        title={isSelf ? "Wohin sollen die Briefe kommen?" : "Wohin sollen die Briefe geschickt werden?"}
        subtitle={isSelf ? "Deine Adresse bleibt vertraulich." : "Die Adresse des Empfängers."}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* Land */}
        <div>
          <label style={labelStyle}>Land</label>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {COUNTRIES.map(c => (
              <span key={c.id} style={chipStyle(data.country === c.id)}
                onClick={() => {
                  update("country", c.id);
                  if (c.id !== data.country) { update("zip", ""); update("city", ""); update("street", ""); setAddrSugg([]); }
                }}>
                {c.label}
              </span>
            ))}
          </div>
        </div>

        {/* Anderes Land */}
        {data.country === "OTHER" && (
          <div style={{ padding: "16px", background: colors.primaryBg, borderRadius: "12px", border: "1px solid #D6E8DD", marginTop: "8px" }}>
            <div style={{ fontSize: "14px", fontFamily: fonts.sans, color: colors.primary, lineHeight: 1.6 }}>
              📬 Wir liefern aktuell nach CH, DE und AT. Für andere Länder schreib uns an <strong>hello@letterlift.ch</strong> – wir prüfen die Möglichkeiten!
            </div>
          </div>
        )}

        {/* Adressfelder */}
        {data.country !== "OTHER" && (
          <>
            <div style={{ position: "relative" }}>
              <label style={labelStyle}>Strasse & Hausnummer</label>
              <input
                style={inputStyle} value={data.street}
                onChange={e => searchAddr(e.target.value)}
                placeholder={cc.streetPh || "Strasse 1"}
                onFocus={onFocusInput}
                onBlur={e => { onBlurInput(e); setTimeout(() => setAddrSugg([]), 200); }}
                autoComplete="off"
              />
              {/* Autocomplete-Dropdown */}
              {addrSugg.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                  background: "#fff", border: `1px solid ${colors.border}`,
                  borderRadius: "0 0 12px 12px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  maxHeight: "200px", overflowY: "auto",
                }}>
                  {addrSugg.map((s, i) => (
                    <div key={i} onMouseDown={() => selectAddr(s)}
                      style={{
                        padding: "10px 14px", fontSize: "13px", fontFamily: fonts.sans,
                        color: colors.text, cursor: "pointer",
                        borderBottom: i < addrSugg.length - 1 ? "1px solid #F0EDE8" : "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = colors.surfaceMuted}
                      onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                    >
                      <div style={{ fontWeight: 500 }}>{s.street}</div>
                      <div style={{ fontSize: "12px", color: colors.textLight, marginTop: "2px" }}>{s.zip} {s.city}</div>
                    </div>
                  ))}
                </div>
              )}
              {addrLoading && (
                <div style={{ position: "absolute", right: "12px", top: "38px", fontSize: "12px", color: colors.textLight, fontFamily: fonts.sans }}>...</div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: "0 0 120px" }}>
                <label style={labelStyle}>PLZ</label>
                <input
                  style={{ ...inputStyle, borderColor: plzError ? colors.error : colors.border }}
                  value={data.zip}
                  onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, cc.plzLen || 5); update("zip", v); }}
                  placeholder={cc.plzPh || "PLZ"} maxLength={cc.plzLen || 5}
                  onFocus={onFocusInput} onBlur={onBlurInput}
                />
                {plzError && (
                  <div style={{ fontSize: "11px", color: colors.error, fontFamily: fonts.sans, marginTop: "4px" }}>
                    {cc.plzLen} Stellen erforderlich
                  </div>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Ort</label>
                <input style={inputStyle} value={data.city}
                  onChange={e => update("city", e.target.value)}
                  placeholder={cc.cityPh || "Ort"}
                  onFocus={onFocusInput} onBlur={onBlurInput} />
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{
        marginTop: "18px", padding: "14px 16px", background: "#F0F5EE",
        borderRadius: "12px", fontSize: "13px", fontFamily: fonts.sans,
        color: colors.primary, lineHeight: 1.6,
      }}>
        🔒 Die Adresse wird ausschliesslich für den Briefversand verwendet und nicht an Dritte weitergegeben.
      </div>
    </div>
  );
}
