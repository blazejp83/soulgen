"use client";

import { useState } from "react";
import {
  Code2,
  Search,
  Cog,
  PenLine,
  CalendarCheck,
  Image,
  Star,
  Plus,
  X,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useWizardStore } from "@/stores/wizard-store";
import { useMounted } from "@/hooks/use-mounted";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Domain, PredefinedDomain } from "@/types";

// ─── Domain Definitions ─────────────────────────────────────────

interface DomainOption {
  id: PredefinedDomain;
  label: string;
  icon: LucideIcon;
}

const PREDEFINED_DOMAINS: DomainOption[] = [
  { id: "coding", label: "Coding", icon: Code2 },
  { id: "research", label: "Research", icon: Search },
  { id: "automation", label: "Automation", icon: Cog },
  { id: "writing", label: "Writing", icon: PenLine },
  { id: "planning", label: "Planning", icon: CalendarCheck },
  { id: "media", label: "Media", icon: Image },
];

const PREDEFINED_DOMAIN_IDS = PREDEFINED_DOMAINS.map((d) => d.id) as string[];

// ─── Component ──────────────────────────────────────────────────

export function DomainStep() {
  const mounted = useMounted();
  const [customDomainInput, setCustomDomainInput] = useState("");
  const domains = useWizardStore((s) => s.dna.domains);
  const primaryDomains = useWizardStore((s) => s.dna.primaryDomains);
  const toggleDomain = useWizardStore((s) => s.toggleDomain);
  const setPrimaryDomain = useWizardStore((s) => s.setPrimaryDomain);

  // Separate custom domains from predefined ones
  const customDomains = domains.filter((d) => !PREDEFINED_DOMAIN_IDS.includes(d));

  const handleAddCustomDomain = () => {
    const trimmed = customDomainInput.trim();
    if (trimmed && !domains.includes(trimmed)) {
      toggleDomain(trimmed as Domain);
      setCustomDomainInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustomDomain();
    }
  };

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
        {PREDEFINED_DOMAINS.map((domain) => {
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

      {/* Custom Domains Section */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Custom Domains</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Add your own specialized areas (e.g., &quot;Machine Learning&quot;, &quot;DevSecOps&quot;, &quot;Data Analytics&quot;)
        </p>

        {/* Add custom domain input */}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter custom domain..."
            value={customDomainInput}
            onChange={(e) => setCustomDomainInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="max-w-xs"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddCustomDomain}
            disabled={!customDomainInput.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Display custom domains */}
        {customDomains.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customDomains.map((domain) => {
              const isPrimary = primaryDomains.includes(domain);
              return (
                <div
                  key={domain}
                  className={`
                    group relative flex items-center gap-2 rounded-lg border px-3 py-2
                    ${
                      isPrimary
                        ? "border-primary bg-accent ring-2 ring-primary/20"
                        : "border-border bg-card"
                    }
                  `}
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{domain}</span>
                  {isPrimary && (
                    <span className="text-xs text-primary font-medium ml-1">
                      Primary
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setPrimaryDomain(domain as Domain)}
                    className={`
                      ml-1 p-0.5 rounded transition-colors hover:bg-accent
                      ${isPrimary ? "text-primary" : "text-muted-foreground"}
                    `}
                    title={isPrimary ? "Remove primary status" : "Mark as primary"}
                  >
                    <Star
                      className={`h-3.5 w-3.5 ${isPrimary ? "fill-primary" : ""}`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleDomain(domain as Domain)}
                    className="ml-1 p-0.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Remove domain"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
