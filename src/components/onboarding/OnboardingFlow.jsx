// src/components/onboarding/OnboardingFlow.jsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import StepRouter from "../steps/StepRouter";
import { STEP_DEFINITIONS, STEP_LABELS, shouldSkipStep, findNextStep, canProceed } from "../../data/steps";
import { INITIAL_FORM_DATA, createUpdater, loadDraft, clearDraft } from "../../lib/formState";
import { createBotDetector } from "../../lib/rateLimit";
import { useRegion } from "../../hooks/useRegion";
import { fonts, colors } from "../../styles/theme";

export default function OnboardingFlow({ bookingType, onBack }) {
  const { region, currSymbol } = useRegion();
  const [step, setStep] = useState(0);
  const [highestStep, setHighestStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [anim, setAnim] = useState(false);
  const [vis, setVis] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const skipHistoryRef = useRef(false);

  const [data, setData] = useState(() => {
    const draft = loadDraft();
    if (draft && draft.bookingType === bookingType && draft.recipientName) return draft;
    return { ...INITIAL_FORM_DATA, bookingType };
  });

  useEffect(() => {
    const draft = loadDraft();
    if (draft && draft.bookingType === bookingType && draft.recipientName) {
      setShowDraftBanner(true);
      setTimeout(() => setShowDraftBanner(false), 5000);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const update = createUpdater(setData);

  const botDetector = useRef(null);
  if (!botDetector.current) botDetector.current = createBotDetector();
  const trackInteraction = () => botDetector.current?.recordInteraction("input");

  const isSelf = bookingType === "self";
  const steps = STEP_DEFINITIONS[isSelf ? "self" : "gift"];
  const rN = data.recipientName || (isSelf ? "dich" : "die Person");

  const visibleSteps = steps.filter((_, i) => !shouldSkipStep(steps[i], data));
  const visibleIndex = visibleSteps.indexOf(steps[step]);
  const total = visibleSteps.length;
  const currentStepId = steps[step];
  const progress = ((visibleIndex + 1) / total) * 100;

  // ─── Browser History ───
  useEffect(() => { window.history.replaceState({ step: 0 }, "", ""); }, []);

  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && typeof e.state.step === "number") {
        skipHistoryRef.current = true;
        const target = e.state.step;
        if (target < 0) { onBack(); return; }
        setDir(target > step ? 1 : -1);
        setAnim(true);
        setTimeout(() => { setStep(target); setAnim(false); skipHistoryRef.current = false; }, 180);
      } else {
        onBack();
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [step, onBack]);

  const goTo = useCallback((targetStep, direction) => {
    setDir(direction);
    setAnim(true);
    if (!skipHistoryRef.current) window.history.pushState({ step: targetStep }, "", "");
    setTimeout(() => {
      setStep(targetStep);
      setHighestStep(prev => Math.max(prev, targetStep));
      setAnim(false);
    }, 180);
  }, []);

  useEffect(() => { setVis(false); setTimeout(() => setVis(true), 60); }, [step]);
  useEffect(() => { setHighestStep(prev => Math.max(prev, step)); }, [step]);

  const next = () => {
    const target = findNextStep(steps, step, 1, data);
    if (target >= steps.length) return;
    goTo(target, 1);
  };

  const back = () => {
    const target = findNextStep(steps, step, -1, data);
    if (target < 0) return;
    goTo(target, -1);
  };

  const goToStep = (idx) => {
    if (idx === step) return;
    goTo(idx, idx > step ? 1 : -1);
  };

  const handleReset = () => { clearDraft(); setStep(0); setPreviewText(""); onBack(); };

  const handleNewDraft = () => {
    clearDraft();
    setData({ ...INITIAL_FORM_DATA, bookingType });
    setStep(0); setHighestStep(0); setShowDraftBanner(false);
    window.history.replaceState({ step: 0 }, "", "");
  };

  const canGoNext = canProceed(currentStepId, data);

  return (
    <div style={{
      minHeight: "100vh", background: colors.bgGrad,
      fontFamily: fonts.serif, display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {/* Draft-Banner */}
      {showDraftBanner && (
        <div style={{
          position: "fixed", top: "16px", left: "50%", transform: "translateX(-50%)",
          background: "#fff", borderRadius: "14px", padding: "14px 22px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 100,
          display: "flex", alignItems: "center", gap: "14px",
          fontSize: "14px", fontFamily: fonts.sans, color: colors.text,
          animation: "slideDown 0.3s ease-out",
        }}>
          <span>📝 Entwurf für <strong>{data.recipientName}</strong> wiederhergestellt.</span>
          <button onClick={handleNewDraft} style={{
            background: "none", border: `1px solid ${colors.border}`, borderRadius: "8px",
            padding: "6px 14px", fontSize: "12px", fontFamily: fonts.sans,
            color: colors.textMuted, cursor: "pointer",
          }}>Neu starten</button>
          <button onClick={() => setShowDraftBanner(false)} style={{
            background: "none", border: "none", fontSize: "16px",
            color: colors.textLighter, cursor: "pointer",
          }}>×</button>
        </div>
      )}
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>

      {/* Header + Breadcrumbs */}
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
            const isCurrent = i === step;
            const isReachable = i <= highestStep;
            return (
              <div key={s}
                onClick={() => { if (isReachable && !isCurrent) goToStep(i); }}
                style={{
                  width: isCurrent ? "auto" : "7px", height: "7px",
                  borderRadius: isCurrent ? "10px" : "50%",
                  background: i < step ? colors.primaryLight
                    : isCurrent ? colors.primary
                    : isReachable ? colors.primaryLight + "80"
                    : colors.border,
                  cursor: isReachable && !isCurrent ? "pointer" : "default",
                  padding: isCurrent ? "2px 10px" : "0",
                  fontSize: "11px", fontFamily: fonts.sans, color: "#fff", fontWeight: 600, lineHeight: "7px",
                  transition: "all 0.3s", display: "flex", alignItems: "center",
                }}>
                {isCurrent ? STEP_LABELS[s] : ""}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress */}
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

      {/* Step Card */}
      <div style={{
        background: colors.card, backdropFilter: "blur(20px)",
        borderRadius: "22px", boxShadow: "0 8px 40px rgba(0,0,0,0.05)",
        padding: "38px 36px", maxWidth: "580px", width: "88%",
        opacity: vis && !anim ? 1 : 0,
        transform: vis && !anim ? "translateY(0)" : `translateY(${dir * 14}px)`,
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <StepRouter
          stepId={currentStepId} data={data} update={update}
          isSelf={isSelf} recipientName={rN}
          currSymbol={currSymbol} region={region}
          trackInteraction={trackInteraction}
          previewText={previewText} setPreviewText={setPreviewText}
          goToStep={goToStep} steps={steps}
          botDetector={botDetector.current}
        />
      </div>

      {/* Navigation */}
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
