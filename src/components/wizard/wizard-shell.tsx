"use client";

import { useEffect, useRef } from "react";
import { useWizardStore } from "@/stores/wizard-store";
import { useMounted } from "@/hooks/use-mounted";
import { WizardProgress } from "@/components/wizard/wizard-progress";
import { WizardNav } from "@/components/wizard/wizard-nav";
import { ArchetypeStep } from "@/components/wizard/steps/archetype-step";
import { TemperamentStep } from "@/components/wizard/steps/temperament-step";
import { CommunicationStep } from "@/components/wizard/steps/communication-step";
import { WorkStyleStep } from "@/components/wizard/steps/work-style-step";
import { UserRelationshipStep } from "@/components/wizard/steps/user-relationship-step";
import { DomainStep } from "@/components/wizard/steps/domain-step";
import { SummaryStep } from "@/components/wizard/steps/summary-step";
import { decodeShareableUrl } from "@/lib/export";
import { toast } from "sonner";
import type { WizardStep } from "@/types";

// ─── Step Content Router ─────────────────────────────────────────

function StepContent({ step }: { step: WizardStep }) {
  switch (step) {
    case "archetype":
      return <ArchetypeStep />;
    case "temperament":
      return <TemperamentStep />;
    case "communication":
      return <CommunicationStep />;
    case "work-style":
      return <WorkStyleStep />;
    case "user-relationship":
      return <UserRelationshipStep />;
    case "domains":
      return <DomainStep />;
    case "summary":
      return <SummaryStep />;
    default:
      return null;
  }
}

// ─── Wizard Shell ────────────────────────────────────────────────

export function WizardShell() {
  const mounted = useMounted();
  const currentStep = useWizardStore((s) => s.currentStep);
  const updateDNA = useWizardStore((s) => s.updateDNA);
  const setStep = useWizardStore((s) => s.setStep);
  const hasProcessedUrl = useRef(false);

  // Check for shared DNA in URL on mount
  useEffect(() => {
    // Only run once after mount, and only in browser
    if (!mounted || hasProcessedUrl.current) return;
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const dnaParam = params.get("dna");

    if (!dnaParam) return;

    hasProcessedUrl.current = true;

    // Attempt to decode the DNA
    const fullUrl = window.location.href;
    const loadedDna = decodeShareableUrl(fullUrl);

    if (loadedDna) {
      // Update store with loaded DNA
      updateDNA(loadedDna);
      // Navigate to summary step to show the loaded configuration
      setStep("summary");
      // Show success toast
      toast.success("Loaded shared agent configuration!");
    } else {
      // Show error toast for invalid share link
      toast.error("Invalid share link");
    }

    // Clean up URL by removing the dna parameter
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }, [mounted, updateDNA, setStep]);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-muted" />
                {i < 6 && <div className="mx-1 h-0.5 w-6 bg-muted sm:w-10 md:w-14" />}
              </div>
            ))}
          </div>
          <div className="h-64 rounded-lg bg-muted/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <WizardProgress />
      <div className="mt-4 min-h-[24rem]">
        <StepContent step={currentStep} />
      </div>
      <WizardNav />
    </div>
  );
}
