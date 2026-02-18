// src/components/onboarding/OnboardingFlow.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import StepRouter from "../steps/StepRouter";
import { STEP_DEFINITIONS, STEP_LABELS, shouldSkipStep, findNextStep, canProceed } from "../../data/steps";
import { INITIAL_FORM_DATA, createUpdater } from "../../lib/formState";
import { createBotDetector } from "../../lib/rateLimit";
import { useRegion } from "../../hooks/useRegion";
import { fonts, colors } from "../../styles/theme";

export default function OnboardingFlow({ bookingType, onBack }) {
  const { region, currSymbol } = useRegion();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [anim, setAnim] = useState(false);
  const [vis, setVis] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [data, setData] = useState({ ...INITIAL_FORM_DATA, bookingType });
  const update = createUpdater(setData);

  // Bot detection
  const botDetector = useRef(null);
  if (!botDetector.current) botDetector.current = createBotDetector();
  const trackInteraction = () => botDetector.current?.recordInteraction("input");

  const isSelf = bookingType === "self";
  const isTrial = data.package === "trial";
  const steps = STEP_DEFINITIONS[isSelf ? "self" : "gift"];
  const rN = data.recipientName || (isSelf ? "dich" : "die Person");

  // Sichtbare Steps (ohne übersprungene)
  const visibleSteps = steps.filter((_, i) => !shouldSkipStep(steps[i], data));
  const visibleIndex = visibleSteps.indexOf(steps[step]);
  const total = visibleSteps.length;
  const currentStepId = steps[step];
  const progress = ((visibleIndex + 1) / total) * 100;

  // Animations-Trigger bei Step-Wechsel
  useEffect(() => { setVis(false); setTimeout(() => setVis(true), 60); }, [step]);

  const next = () => {
    const target = findNextStep(steps, step, 1, data);
    if (target >= steps.length) return;
    setDir(1); setAnim(true);
    setTimeout(() => { setStep(target); setAnim(false); }, 180);
  };

  const back = () => {
    const target = findNextStep(steps, step, -1, data);
    if (target < 0) return;
    setDir(-1); setAnim(true);
    setTimeout(() => { setStep(target); setAnim(false); }, 180);
  };

  const goToStep = (idx) => {
    if (idx < step) {
      setDir(-1); setAnim(true);
      setTimeout(() => { setStep(idx); setAnim(false); }, 200);
    }
  };

  const handleReset = () => {
    setStep(0);
    setPreviewText("");
    onBack();
  };

  const canGoNext = canProceed(currentStepId, data);

  return (
    <div style={{
      minHeight: "100vh", background: colors.bgGrad,
      fontFamily: fonts.serif, display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {/* Header mit Step-Dots */}
      <div style={{
        width: "100%", maxWidth: "660px", padding: "20px 28px",
        display: "flex", justifyContent: "space-between", alignItems: "center", boxSizing: "border-box",
      }}>
        <div onClick={handleReset}
          style={{ fontSize: "18px", fontWeight: 700, fontFamily: fonts.sans, color: colors.primary, cursor: "pointer" }}>
          ✉️ LetterLift
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {steps.map((s, i) => {
            if (shouldSkipStep(s, data)) return null;
            return (
              <div key={s} onClick={() => goToStep(i)}
                style={{
                  width: i === step ? "auto" : "7px", height: "7px",
                  borderRadius: i === step ? "10px" : "50%",
                  background: i < step ? colors.primaryLight : i === step ? colors.primary : colors.border,
                  cursor: i < step ? "pointer" : "default",
                  padding: i === step ? "2px 10px" : "0",
                  fontSize: "11px", fontFamily: fonts.sans, color: "#fff", fontWeight: 600, lineHeight: "7px",
                  transition: "all 0.3s", display: "flex", alignItems: "center",
                }}>
                {i === step ? STEP_LABELS[s] : ""}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        width: "88%", maxWidth: "580px", height: "3px",
        background: colors.borderLight, borderRadius: "100px", overflow: "hidden", marginBottom: "28px",
      }}>
        <div style={{
          height: "100%", width: progress + "%",
          background: "linear-gradient(90deg, #5B7B6A, #7C9885)",
          borderRadius: "100px", transition: "width 0.5s cubic-bezier(0.16,1,0.3,1)",
        }} />
      </div>

      {/* Step Content Card */}
      <div style={{
        background: colors.card, backdropFilter: "blur(20px)",
        borderRadius: "22px", boxShadow: "0 8px 40px rgba(0,0,0,0.05)",
        padding: "38px 36px", maxWidth: "580px", width: "88%",
        opacity: vis && !anim ? 1 : 0,
        transform: vis && !anim ? "translateY(0)" : `translateY(${dir * 14}px)`,
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <StepRouter
          stepId={currentStepId}
          data={data} update={update}
          isSelf={isSelf} recipientName={rN}
          currSymbol={currSymbol} region={region}
          trackInteraction={trackInteraction}
          previewText={previewText} setPreviewText={setPreviewText}
          goToStep={goToStep} steps={steps}
          botDetector={botDetector.current}
        />
      </div>

      {/* Navigation Buttons */}
      {currentStepId !== "summary" && (
        <div style={{
          display: "flex", justifyContent: "space-between",
          maxWidth: "580px", width: "88%", marginTop: "18px", marginBottom: "40px",
        }}>
          <button onClick={step > 0 ? back : handleReset}
            style={{ background: "transparent", color: "#7A7470", border: "none", padding: "14px 20px", fontSize: "14px", fontFamily: fonts.sans, cursor: "pointer" }}>
            ← {step > 0 ? "Zurück" : "Startseite"}
          </button>
          <button onClick={() => { trackInteraction(); next(); }}
            disabled={!canGoNext}
            style={{
              background: colors.primaryGrad, color: "#fff", border: "none", borderRadius: "12px",
              padding: "14px 32px", fontSize: "15px", fontFamily: fonts.sans, fontWeight: 600,
              cursor: canGoNext ? "pointer" : "default", opacity: canGoNext ? 1 : 0.35,
            }}>
            Weiter →
          </button>
        </div>
      )}
      {currentStepId === "summary" && (
        <div style={{ marginBottom: "40px" }}>
          <button onClick={back}
            style={{ background: "transparent", color: "#7A7470", border: "none", padding: "14px", fontSize: "14px", fontFamily: fonts.sans, cursor: "pointer" }}>
            ← Bearbeiten
          </button>
        </div>
      )}
    </div>
  );
}
