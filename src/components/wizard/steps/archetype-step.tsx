"use client";

import {
  Code2,
  Search,
  Container,
  KanbanSquare,
  Heart,
  Pen,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useWizardStore } from "@/stores/wizard-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useMounted } from "@/hooks/use-mounted";
import {
  ARCHETYPES,
  CUSTOM_ARCHETYPE,
  type ArchetypeDefinition,
} from "@/lib/archetypes";
import type { ArchetypeId } from "@/types";

// ─── Icon Map ────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Code2,
  Search,
  Container,
  KanbanSquare,
  Heart,
  Pen,
  Sparkles,
  Wrench,
};

// ─── Simple-mode subset ──────────────────────────────────────────

const SIMPLE_IDS: ArchetypeId[] = ["developer", "researcher", "coach", "general"];

// ─── Component ───────────────────────────────────────────────────

export function ArchetypeStep() {
  const mounted = useMounted();
  const selectedArchetype = useWizardStore((s) => s.dna.archetype);
  const setArchetype = useWizardStore((s) => s.setArchetype);
  const updateTemperament = useWizardStore((s) => s.updateTemperament);
  const updateCommunication = useWizardStore((s) => s.updateCommunication);
  const updateWorkStyle = useWizardStore((s) => s.updateWorkStyle);
  const updateUserRelationship = useWizardStore((s) => s.updateUserRelationship);
  const mode = useSettingsStore((s) => s.mode);

  if (!mounted) {
    return (
      <div className="py-6">
        <div className="h-8 w-56 rounded bg-muted animate-pulse" />
        <div className="mt-1 h-5 w-80 rounded bg-muted/60 animate-pulse" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const visibleArchetypes =
    mode === "simple"
      ? ARCHETYPES.filter((a) => SIMPLE_IDS.includes(a.id))
      : ARCHETYPES;

  function handleSelect(archetype: ArchetypeDefinition) {
    setArchetype(archetype.id);

    if (archetype.defaults) {
      const { temperament, communication, workStyle, userRelationship } =
        archetype.defaults;
      if (temperament) updateTemperament(temperament);
      if (communication) updateCommunication(communication);
      if (workStyle) updateWorkStyle(workStyle);
      if (userRelationship) updateUserRelationship(userRelationship);
    }
  }

  function handleCustomSelect() {
    // Set archetype to custom without resetting other values
    setArchetype("custom");
  }

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold tracking-tight">Choose Your Archetype</h2>
      <p className="mt-1 text-muted-foreground">
        Pick a starting point that best matches your use case. You can fine-tune
        everything in later steps.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleArchetypes.map((archetype) => {
          const Icon = ICON_MAP[archetype.icon];
          const isSelected = selectedArchetype === archetype.id;

          return (
            <button
              key={archetype.id}
              type="button"
              onClick={() => handleSelect(archetype)}
              className={`
                group relative flex flex-col items-start gap-3 rounded-lg border p-4
                text-left transition-all
                hover:border-primary/50 hover:bg-accent/50
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                ${
                  isSelected
                    ? "border-primary bg-accent ring-2 ring-primary/20"
                    : "border-border bg-card"
                }
              `}
            >
              {Icon && (
                <Icon
                  className={`h-6 w-6 ${
                    isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary/70"
                  }`}
                />
              )}
              <div>
                <h3 className="font-semibold leading-tight">{archetype.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-snug">
                  {archetype.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {archetype.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          );
        })}

        {/* Start from Scratch / Custom */}
        <button
          type="button"
          onClick={handleCustomSelect}
          className={`
            group relative flex flex-col items-start gap-3 rounded-lg border p-4
            text-left transition-all border-dashed
            hover:border-primary/50 hover:bg-accent/50
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            ${
              selectedArchetype === "custom"
                ? "border-primary bg-accent ring-2 ring-primary/20"
                : "border-border bg-card"
            }
          `}
        >
          <Wrench
            className={`h-6 w-6 ${
              selectedArchetype === "custom"
                ? "text-primary"
                : "text-muted-foreground group-hover:text-primary/70"
            }`}
          />
          <div>
            <h3 className="font-semibold leading-tight">
              {CUSTOM_ARCHETYPE.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground leading-snug">
              {CUSTOM_ARCHETYPE.description}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
