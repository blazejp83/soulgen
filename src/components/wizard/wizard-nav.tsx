"use client";

import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/stores/wizard-store";
import { useMounted } from "@/hooks/use-mounted";
import { WIZARD_STEPS } from "@/components/wizard/wizard-progress";

// ─── Props ───────────────────────────────────────────────────────

interface WizardNavProps {
  onNext?: () => void;
  onBack?: () => void;
}

// ─── Component ───────────────────────────────────────────────────

export function WizardNav({ onNext, onBack }: WizardNavProps) {
  const mounted = useMounted();
  const currentStep = useWizardStore((s) => s.currentStep);
  const setStep = useWizardStore((s) => s.setStep);

  if (!mounted) {
    return (
      <div className="flex justify-between pt-6">
        <div className="h-10 w-20" />
        <div className="h-10 w-20" />
      </div>
    );
  }

  const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep);
  const isFirst = currentIndex === 0;
  const isLast = currentStep === "summary";
  const isSecondToLast = currentStep === "domains";

  function handleBack() {
    if (onBack) {
      onBack();
    }
    if (currentIndex > 0) {
      setStep(WIZARD_STEPS[currentIndex - 1].id);
    }
  }

  function handleNext() {
    if (onNext) {
      onNext();
    }
    if (currentIndex < WIZARD_STEPS.length - 1) {
      setStep(WIZARD_STEPS[currentIndex + 1].id);
    }
  }

  return (
    <div className="flex justify-between pt-6">
      <Button
        variant="outline"
        onClick={handleBack}
        disabled={isFirst}
      >
        Back
      </Button>

      {!isLast && (
        <Button onClick={handleNext}>
          {isSecondToLast ? "Review & Generate" : "Next"}
        </Button>
      )}
    </div>
  );
}
