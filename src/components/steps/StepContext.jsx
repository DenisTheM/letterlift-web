// src/components/steps/StepContext.jsx
"use client";
import SectionHeader from "../shared/SectionHeader";
import SpeechButton from "../shared/SpeechButton";
import { getOccasionCopy } from "../../data/occasionCopy";
import { textareaStyle, labelStyle, optionalHint, onFocusInput, onBlurInput } from "../../styles/theme";

export default function StepContext({ data, update, isSelf, recipientName, trackInteraction }) {
  const copy = getOccasionCopy(data.occasion);
  const rN = recipientName;
  const g = data.gender || "";

  return (
    <div>
      <SectionHeader
        title={copy.contextQ(rN, isSelf, g)}
        subtitle="Je ehrlicher, desto wirkungsvoller."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div>
          <label style={labelStyle}>{copy.contextQ(rN, isSelf, g)}</label>
          <div style={{ position: "relative" }}>
            <textarea
              style={{ ...textareaStyle, paddingRight: "50px" }}
              value={data.contextText}
              onChange={e => { update("contextText", e.target.value); trackInteraction(); }}
              placeholder={copy.contextPh(rN, isSelf, g)}
              onFocus={onFocusInput} onBlur={onBlurInput}
            />
            <SpeechButton
              initialValue={data.contextText}
              onResult={val => update("contextText", val)}
            />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Ziel <span style={optionalHint}>optional</span></label>
          <textarea
            style={{ ...textareaStyle, minHeight: "70px" }}
            value={data.goal}
            onChange={e => update("goal", e.target.value)}
            placeholder={copy.goalPh(rN, isSelf, g)}
            onFocus={onFocusInput} onBlur={onBlurInput}
          />
        </div>
      </div>
    </div>
  );
}
