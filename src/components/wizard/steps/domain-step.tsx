"use client";

import {
  Code2,
  Search,
  Cog,
  PenLine,
  CalendarCheck,
  Image,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useWizardStore } from "@/stores/wizard-store";
import { useMounted } from "@/hooks/use-mounted";
import type { Domain } from "@/types";

// ─── Domain Definitions ─────────────────────────────────────────

interface DomainOption {
  id: Domain;
  label: string;
  icon: LucideIcon;
}

const DOMAINS: DomainOption[] = [
  { id: "coding", label: "Coding", icon: Code2 },
  { id: "research", label: "Research", icon: Search },
  { id: "automation", label: "Automation", icon: Cog },
  { id: "writing", label: "Writing", icon: PenLine },
  { id: "planning", label: "Planning", icon: CalendarCheck },
  { id: "media", label: "Media", icon: Image },
];

// ─── Component ──────────────────────────────────────────────────

export function DomainStep() {
  const mounted = useMounted();
  const domains = useWizardStore((s) => s.dna.domains);
  const primaryDomains = useWizardStore((s) => s.dna.primaryDomains);
  const toggleDomain = useWizardStore((s) => s.toggleDomain);
  const setPrimaryDomain = useWizardStore((s) => s.setPrimaryDomain);

  if (!mounted) {
    return (
      <div className="py-6">
        <div className="h-8 w-56 rounded bg-muted animate-pulse" />
        <div className="mt-1 h-5 w-96 rounded bg-muted/60 animate-pulse" />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold tracking-tight">Select Domains</h2>
      <p className="mt-1 text-muted-foreground">
        Select domains your agent specializes in. Star up to 3 as primary focus
        areas.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {DOMAINS.map((domain) => {
          const isSelected = domains.includes(domain.id);
          const isPrimary = primaryDomains.includes(domain.id);
          const Icon = domain.icon;

          return (
            <div key={domain.id} className="relative">
              <button
                type="button"
                onClick={() => toggleDomain(domain.id)}
                className={`
                  group flex w-full flex-col items-center justify-center gap-2
                  rounded-lg border p-4 text-center transition-all
                  hover:border-primary/50 hover:bg-accent/50
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                  ${
                    isSelected
                      ? "border-primary bg-accent ring-2 ring-primary/20"
                      : "border-border bg-card"
                  }
                `}
              >
                <Icon
                  className={`h-7 w-7 ${
                    isSelected
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-primary/70"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isSelected ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {domain.label}
                </span>

                {isSelected && isPrimary && (
                  <span className="text-xs text-primary font-medium">
                    Primary
                  </span>
                )}
              </button>

              {/* Priority star toggle — only visible when domain is selected */}
              {isSelected && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPrimaryDomain(domain.id);
                  }}
                  className={`
                    absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center
                    rounded-full border bg-background shadow-sm transition-colors
                    hover:bg-accent focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-ring
                    ${
                      isPrimary
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground"
                    }
                  `}
                  title={
                    isPrimary
                      ? "Remove primary status"
                      : "Mark as primary domain"
                  }
                >
                  <Star
                    className={`h-4 w-4 ${isPrimary ? "fill-primary" : ""}`}
                  />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
