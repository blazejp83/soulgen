"use client";

import { useWizardStore } from "@/stores/wizard-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useMounted } from "@/hooks/use-mounted";
import { ARCHETYPES, CUSTOM_ARCHETYPE } from "@/lib/archetypes";
import { Button } from "@/components/ui/button";
import { Star, Pencil, RotateCcw } from "lucide-react";
import type { WizardStep, Domain } from "@/types";

// ─── Helpers ────────────────────────────────────────────────────

function describeSlider(value: number, lowLabel: string, highLabel: string): string {
  if (value < 25) return lowLabel;
  if (value > 75) return highLabel;
  return "moderate";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function domainLabel(d: Domain): string {
  return capitalize(d);
}

// ─── Section Card ───────────────────────────────────────────────

function SectionCard({
  title,
  stepTarget,
  children,
}: {
  title: string;
  stepTarget: WizardStep;
  children: React.ReactNode;
}) {
  const setStep = useWizardStore((s) => s.setStep);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button
          type="button"
          onClick={() => setStep(stepTarget)}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}

// ─── Value Row ──────────────────────────────────────────────────

function ValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────────

export function SummaryStep() {
  const mounted = useMounted();
  const dna = useWizardStore((s) => s.dna);
  const resetDNA = useWizardStore((s) => s.resetDNA);
  const setStep = useWizardStore((s) => s.setStep);
  const mode = useSettingsStore((s) => s.mode);

  if (!mounted) {
    return (
      <div className="py-6">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="mt-1 h-5 w-72 rounded bg-muted/60 animate-pulse" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Resolve archetype name
  const archetypeName =
    dna.archetype === "custom"
      ? "Custom"
      : dna.archetype === null
        ? "None selected"
        : ARCHETYPES.find((a) => a.id === dna.archetype)?.name ?? "Unknown";

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold tracking-tight">Review & Generate</h2>
      <p className="mt-1 text-muted-foreground">
        Review your agent configuration before generating personality files.
      </p>

      {/* Section 1: Readable Summary */}
      <div className="mt-6 space-y-4">
        {/* Archetype */}
        <SectionCard title="Archetype" stepTarget="archetype">
          <ValueRow label="Selected" value={archetypeName} />
        </SectionCard>

        {/* Temperament */}
        <SectionCard title="Temperament" stepTarget="temperament">
          <ValueRow
            label="Valence"
            value={`${dna.temperament.valence}/100 (${describeSlider(dna.temperament.valence, "pessimistic", "optimistic")})`}
          />
          <ValueRow
            label="Energy"
            value={`${dna.temperament.energy}/100 (${describeSlider(dna.temperament.energy, "calm", "energized")})`}
          />
          <ValueRow
            label="Warmth"
            value={`${dna.temperament.warmth}/100 (${describeSlider(dna.temperament.warmth, "cold", "empathetic")})`}
          />
          <ValueRow
            label="Dominance"
            value={`${dna.temperament.dominance}/100 (${describeSlider(dna.temperament.dominance, "gentle", "assertive")})`}
          />
          <ValueRow
            label="Stability"
            value={`${dna.temperament.stability}/100 (${describeSlider(dna.temperament.stability, "reactive", "stable")})`}
          />
          <ValueRow
            label="Autonomy"
            value={`${dna.temperament.autonomy}/100 (${describeSlider(dna.temperament.autonomy, "dependent", "independent")})`}
          />
        </SectionCard>

        {/* Communication */}
        <SectionCard title="Communication" stepTarget="communication">
          <ValueRow
            label="Formality"
            value={`${dna.communication.formality}/100 (${describeSlider(dna.communication.formality, "casual", "formal")})`}
          />
          <ValueRow label="Humor" value={`${dna.communication.humor}/5`} />
          <ValueRow
            label="Directness"
            value={`${dna.communication.directness}/100 (${describeSlider(dna.communication.directness, "diplomatic", "blunt")})`}
          />
          <ValueRow
            label="Response Length"
            value={capitalize(dna.communication.responseLength)}
          />
          <ValueRow
            label="Structure"
            value={capitalize(dna.communication.structurePreference)}
          />
          <ValueRow
            label="Jargon Level"
            value={`${dna.communication.jargonLevel}/100 (${describeSlider(dna.communication.jargonLevel, "plain", "technical")})`}
          />
        </SectionCard>

        {/* Work Style */}
        <SectionCard title="Work Style" stepTarget="work-style">
          <ValueRow
            label="Default Depth"
            value={`${dna.workStyle.defaultDepth}/100 (${describeSlider(dna.workStyle.defaultDepth, "overview", "deep-dive")})`}
          />
          <ValueRow
            label="Explanation Style"
            value={capitalize(dna.workStyle.explanationStyle)}
          />
          <ValueRow
            label="Tool Usage"
            value={capitalize(dna.workStyle.toolUsage)}
          />
          <ValueRow
            label="Uncertainty Tolerance"
            value={capitalize(dna.workStyle.uncertaintyTolerance)}
          />
        </SectionCard>

        {/* User Relationship */}
        <SectionCard title="User Relationship" stepTarget="user-relationship">
          <ValueRow
            label="Address Form"
            value={capitalize(dna.userRelationship.addressForm)}
          />
          <ValueRow
            label="Feedback Style"
            value={capitalize(dna.userRelationship.feedbackStyle)}
          />
          <ValueRow
            label="Proactivity"
            value={`${dna.userRelationship.proactivity}/100 (${describeSlider(dna.userRelationship.proactivity, "reactive", "proactive")})`}
          />
          <ValueRow
            label="Language"
            value={dna.userRelationship.language.toUpperCase()}
          />
        </SectionCard>

        {/* Domains */}
        <SectionCard title="Domains" stepTarget="domains">
          {dna.domains.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No domains selected
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {dna.domains.map((d) => {
                const isPrimary = dna.primaryDomains.includes(d);
                return (
                  <span
                    key={d}
                    className={`
                      inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm
                      ${
                        isPrimary
                          ? "bg-primary/10 text-primary border border-primary/30"
                          : "bg-muted text-muted-foreground"
                      }
                    `}
                  >
                    {isPrimary && <Star className="h-3 w-3 fill-primary" />}
                    {domainLabel(d)}
                  </span>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Section 2: Advanced view (raw DNA JSON) */}
      {mode === "advanced" && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            DNA JSON
          </h3>
          <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-muted/50 p-4 text-xs text-foreground font-mono">
            {JSON.stringify(dna, null, 2)}
          </pre>
        </div>
      )}

      {/* Bottom area: Generate + Reset */}
      <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            resetDNA();
          }}
          className="gap-1.5"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>

        <div className="text-right">
          <Button size="lg" disabled className="gap-2">
            Generate
          </Button>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Ready to generate your agent personality files.
          </p>
        </div>
      </div>
    </div>
  );
}
