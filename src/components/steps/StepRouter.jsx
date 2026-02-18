// src/components/steps/StepRouter.jsx
// Rendert die richtige Step-Komponente basierend auf der aktuellen Step-ID
import StepRecipient from "./StepRecipient";
import StepOccasion from "./StepOccasion";
import StepContext from "./StepContext";
import StepPersonality from "./StepPersonality";
import StepMemories from "./StepMemories";
import StepPersona from "./StepPersona";
import StepSender from "./StepSender";
import StepStyle from "./StepStyle";
import StepPackage from "./StepPackage";
import StepDelivery from "./StepDelivery";
import StepAddress from "./StepAddress";
import StepPreview from "./StepPreview";
import StepSummary from "./StepSummary";

export default function StepRouter({ stepId, ...props }) {
  switch (stepId) {
    case "recipient":   return <StepRecipient {...props} />;
    case "occasion":    return <StepOccasion {...props} />;
    case "context":     return <StepContext {...props} />;
    case "personality": return <StepPersonality {...props} />;
    case "memories":    return <StepMemories {...props} />;
    case "persona":     return <StepPersona {...props} />;
    case "sender":      return <StepSender {...props} />;
    case "style":       return <StepStyle {...props} />;
    case "package":     return <StepPackage {...props} />;
    case "delivery":    return <StepDelivery {...props} />;
    case "address":     return <StepAddress {...props} />;
    case "preview":     return <StepPreview {...props} />;
    case "summary":     return <StepSummary {...props} />;
    default:            return null;
  }
}
