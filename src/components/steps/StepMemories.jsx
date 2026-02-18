// src/components/steps/StepMemories.jsx
"use client";
import { useRef, useEffect } from "react";
import SectionHeader from "../shared/SectionHeader";
import SpeechButton from "../shared/SpeechButton";
import { getOccasionCopy, DEFAULT_COPY } from "../../data/occasionCopy";
import { labelStyle, fonts, colors, onFocusInput, onBlurInput } from "../../styles/theme";

/** Textarea das automatisch mitwächst */
function AutoGrow({ value, onChange, placeholder }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(100, el.scrollHeight) + "px";
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={3}
      style={{
        width: "100%",
        minHeight: "100px",
        padding: "12px 50px 12px 14px",
        border: "1.5px solid #D6CFC8",
        borderRadius: "12px",
        fontSize: "15px",
        fontFamily: "'DM Sans', 'Inter', sans-serif",
        color: "#2C2C2C",
        background: "#FDFCFA",
        outline: "none",
        resize: "none",
        overflow: "hidden",
        lineHeight: 1.6,
        boxSizing: "border-box",
        transition: "border-color 0.2s",
      }}
      value={value}
      onChange={onChange}
      onFocus={onFocusInput}
      onBlur={onBlurInput}
      placeholder={placeholder}
    />
  );
}

export default function StepMemories({ data, update, isSelf }) {
  const copy = getOccasionCopy(data.occasion);
  const memQs = copy.memQ || DEFAULT_COPY.memQ;
  const memPhs = copy.memPh || DEFAULT_COPY.memPh;

  const filledCount = [data.mem1, data.mem2, data.mem3, ...(data.memExtra || [])]
    .filter(s => s && s.trim().length >= 20).length;
  const totalMems = 3 + (data.memExtra || []).length;
  const recommendedMems = 3;

  const hasSpeech = typeof window !== "undefined" &&
    ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  const getMemValue = (i) => i === 0 ? data.mem1 : i === 1 ? data.mem2 : data.mem3;
  const getMemKey = (i) => i === 0 ? "mem1" : i === 1 ? "mem2" : "mem3";

  return (
    <div>
      <SectionHeader
        title={isSelf ? "Deine besonderen Momente" : "Eure gemeinsame Geschichte"}
        subtitle={isSelf ? "Das Herzstück deiner Briefe." : "Je mehr Erinnerungen, desto persönlicher die Briefe."}
      />

      {/* Tipp-Box */}
      <div style={{
        padding: "14px 16px", background: "#FFF8F0", borderRadius: "12px",
        border: "1px solid #F0E4D4", marginBottom: "18px",
        fontSize: "13px", fontFamily: fonts.sans, color: colors.warningText, lineHeight: 1.6,
      }}>
        <strong>⭐ Hier entstehen die besten Briefe.</strong> Mindestens 1 Erinnerung nötig – aber je mehr, desto persönlicher.
        Nimm dir 5 Minuten. Jede Erinnerung wird zu einem eigenen, einzigartigen Briefmoment.
        <span>
          {filledCount >= recommendedMems
            ? " 💚 Genug für richtig persönliche Briefe!"
            : filledCount >= 1
              ? ` 🟢 Gut! Noch ${recommendedMems - filledCount} Erinnerung${recommendedMems - filledCount > 1 ? "en" : ""} für optimale Ergebnisse.`
              : ` 🟡 Noch 1 Erinnerung nötig.`}
        </span>
      </div>

      {/* Mikrofon-Tipp */}
      {hasSpeech && (
        <div style={{
          padding: "10px 16px", background: colors.primaryBg, borderRadius: "12px",
          marginBottom: "18px", fontSize: "13px", fontFamily: fonts.sans,
          color: colors.primary, display: "flex", alignItems: "center", gap: "8px",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B7B6A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="19" x2="12" y2="22" /><line x1="8" y1="22" x2="16" y2="22" /></svg>
          <span><strong>Tipp:</strong> Drücke das Mikrofon und erzähl einfach drauflos – oft fällt einem mehr ein als beim Tippen.</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* 3 Standard-Erinnerungen */}
        {[0, 1, 2].map(i => (
          <div key={i}>
            <label style={labelStyle}>{memQs[i](isSelf)}</label>
            <div style={{ position: "relative" }}>
              <AutoGrow
                value={getMemValue(i)}
                onChange={e => update(getMemKey(i), e.target.value)}
                placeholder={memPhs[i](isSelf)}
              />
              <SpeechButton
                initialValue={getMemValue(i)}
                onResult={val => update(getMemKey(i), val)}
              />
            </div>
          </div>
        ))}

        {/* Extra-Erinnerungen */}
        {(data.memExtra || []).map((mx, i) => (
          <div key={`extra-${i}`}>
            <label style={{ ...labelStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Erinnerung {i + 4}</span>
              <span
                onClick={() => {
                  const ne = [...(data.memExtra || [])];
                  ne.splice(i, 1);
                  update("memExtra", ne);
                }}
                style={{ color: colors.info, cursor: "pointer", fontSize: "11px", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}
              >
                Entfernen
              </span>
            </label>
            <div style={{ position: "relative" }}>
              <AutoGrow
                value={mx}
                onChange={e => {
                  const ne = [...(data.memExtra || [])];
                  ne[i] = e.target.value;
                  update("memExtra", ne);
                }}
                placeholder="Noch ein besonderer Moment..."
              />
              <SpeechButton
                initialValue={mx}
                onResult={val => {
                  const ne = [...(data.memExtra || [])];
                  ne[i] = val;
                  update("memExtra", ne);
                }}
              />
            </div>
          </div>
        ))}

        {/* Weitere hinzufügen */}
        {totalMems < 6 && (
          <button
            onClick={() => update("memExtra", [...(data.memExtra || []), ""])}
            style={{
              background: "none", border: `1.5px dashed ${colors.border}`, borderRadius: "12px",
              padding: "14px", fontSize: "14px", fontFamily: fonts.sans,
              color: colors.primaryLight, cursor: "pointer", fontWeight: 500, transition: "all 0.2s",
            }}
          >
            + Weitere Erinnerung hinzufügen
          </button>
        )}
      </div>

      {/* Inspirations-Box */}
      <div style={{
        marginTop: "14px", padding: "14px 16px", background: colors.surfaceMuted,
        borderRadius: "12px", fontSize: "13px", fontFamily: fonts.sans, color: colors.textMuted,
      }}>
        <strong>💡</strong> Insider-Witze · Reisen · Mutmomente · Liebevolle Macken · Rituale · Peinliche Geschichten
      </div>
    </div>
  );
}
