"use client";

import { useWizardStore } from "@/stores/wizard-store";
import { useMounted } from "@/hooks/use-mounted";
import type { WizardStep } from "@/types";

// ─── Step Definitions ────────────────────────────────────────────

export const WIZARD_STEPS: { id: WizardStep; label: string }[] = [
  { id: "archetype", label: "Archetype" },
  { id: "temperament", label: "Temperament" },
  { id: "communication", label: "Communication" },
  { id: "work-style", label: "Work Style" },
  { id: "user-relationship", label: "Relationship" },
  { id: "domains", label: "Domains" },
  { id: "summary", label: "Summary" },
];

// ─── Component ───────────────────────────────────────────────────

export function WizardProgress() {
  const mounted = useMounted();
  const currentStep = useWizardStore((s) => s.currentStep);
  const setStep = useWizardStore((s) => s.setStep);

  if (!mounted) {
    return (
      <div className="flex items-center justify-between px-2 py-4">
        {WIZARD_STEPS.map((_, i) => (
          <div key={i} className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium">
              {i + 1}
            </div>
            {i < WIZARD_STEPS.length - 1 && (
              <div className="mx-1 h-0.5 w-6 bg-muted sm:w-10 md:w-14" />
            )}
          </div>
        ))}
      </div>
    );
  }

  const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="Wizard progress" className="flex items-center justify-between px-2 py-4">
      {WIZARD_STEPS.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        const isFuture = i > currentIndex;
        const isClickable = isCompleted || isCurrent;

        return (
          <div key={step.id} className="flex items-center">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && setStep(step.id)}
              className={`
                group flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium
                transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                ${
                  isCurrent
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                    : isCompleted
                      ? "bg-primary/80 text-primary-foreground hover:bg-primary cursor-pointer"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                }
              `}
              title={step.label}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={`Step ${i + 1}: ${step.label}${isCompleted ? " (completed)" : isCurrent ? " (current)" : ""}`}
            >
              {i + 1}
            </button>

            {/* Connector line */}
            {i < WIZARD_STEPS.length - 1 && (
              <div
                className={`mx-1 h-0.5 w-6 sm:w-10 md:w-14 transition-colors ${
                  i < currentIndex ? "bg-primary/80" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
