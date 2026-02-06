"use client";

import { useEffect, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, Check, Loader2, Settings, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AgentDNA, GeneratedFiles } from "@/types";
import type { ActiveFile } from "@/hooks/use-generation";
import { useFileHistory } from "@/hooks/use-file-history";
import { FilePreview } from "@/components/file-preview";
import { ExportPanel } from "@/components/export-panel";
import { ProfileManager } from "@/components/profile-manager";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────

interface GenerationViewProps {
  isGenerating: boolean;
  files: GeneratedFiles | null;
  activeFile: ActiveFile;
  error: string | null;
  dna: AgentDNA;
  onRegenerate: () => void;
  onLoadProfile: (dna: AgentDNA) => void;
}

// ─── File Indicator ──────────────────────────────────────────────

function FileIndicator({
  name,
  isActive,
  isComplete,
  isPending,
}: {
  name: string;
  isActive: boolean;
  isComplete: boolean;
  isPending: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
        isActive && "bg-primary/10 text-primary border border-primary/30 animate-pulse",
        isComplete && "bg-green-500/10 text-green-600 border border-green-500/30",
        isPending && "bg-muted text-muted-foreground border border-transparent",
      )}
    >
      {isActive && <Loader2 className="h-3 w-3 animate-spin" />}
      {isComplete && <Check className="h-3 w-3" />}
      {name}
    </div>
  );
}

// ─── Streaming Content Display ───────────────────────────────────

function StreamingContent({ content }: { content: string }) {
  const containerRef = useRef<HTMLPreElement>(null);

  // Auto-scroll to bottom as content streams in
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [content]);

  return (
    <pre
      ref={containerRef}
      className="max-h-80 overflow-auto rounded-lg border border-border bg-zinc-950 p-4 text-xs text-green-400 font-mono whitespace-pre-wrap"
    >
      {content || <span className="text-muted-foreground italic">Waiting for content...</span>}
      <span className="animate-pulse">▊</span>
    </pre>
  );
}

// ─── Error Display ───────────────────────────────────────────────

function ErrorDisplay({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  const isApiKeyError = error.toLowerCase().includes("api key") || error.toLowerCase().includes("settings");

  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-destructive">Generation Failed</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
              <RefreshCw className="h-3 w-3" />
              Try Again
            </Button>
            {isApiKeyError && (
              <Button variant="outline" size="sm" asChild className="gap-1.5">
                <Link href="/settings">
                  <Settings className="h-3 w-3" />
                  Go to Settings
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── File Tab with History ───────────────────────────────────────

interface FileTabProps {
  filename: string;
  originalContent: string;
}

function FileTabContent({ filename, originalContent }: FileTabProps) {
  const {
    content,
    setContent,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  } = useFileHistory(originalContent);

  // Reset history when original content changes (e.g., after regeneration)
  useEffect(() => {
    reset(originalContent);
  }, [originalContent, reset]);

  return (
    <FilePreview
      filename={filename}
      content={content}
      onChange={setContent}
      canUndo={canUndo}
      canRedo={canRedo}
      onUndo={undo}
      onRedo={redo}
    />
  );
}

// ─── Main Component ──────────────────────────────────────────────

export function GenerationView({
  isGenerating,
  files,
  activeFile,
  error,
  dna,
  onRegenerate,
  onLoadProfile,
}: GenerationViewProps) {
  const [selectedTab, setSelectedTab] = useState<string>("soul");

  // Determine file states
  const soulComplete = !!files?.soul;
  const identityComplete = !!files?.identity;
  const userComplete = !!files?.user;

  // During generation, show the streaming view
  if (isGenerating) {
    // Determine which content to show
    const currentContent = activeFile ? files?.[activeFile] || "" : "";

    return (
      <div className="mt-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium">Generating your agent personality...</span>
        </div>

        {/* File Progress Indicators */}
        <div className="flex flex-wrap gap-2">
          <FileIndicator
            name="SOUL.md"
            isActive={activeFile === "soul"}
            isComplete={soulComplete && activeFile !== "soul"}
            isPending={!soulComplete && activeFile !== "soul"}
          />
          <FileIndicator
            name="IDENTITY.md"
            isActive={activeFile === "identity"}
            isComplete={identityComplete && activeFile !== "identity"}
            isPending={!identityComplete && activeFile !== "identity"}
          />
          <FileIndicator
            name="USER.md"
            isActive={activeFile === "user"}
            isComplete={userComplete && activeFile !== "user"}
            isPending={!userComplete && activeFile !== "user"}
          />
        </div>

        {/* Streaming Content */}
        <StreamingContent content={currentContent} />
      </div>
    );
  }

  // Show error if present
  if (error) {
    return (
      <div className="mt-6">
        <ErrorDisplay error={error} onRetry={onRegenerate} />
      </div>
    );
  }

  // Show completed files in tabs
  if (files) {
    return (
      <div className="mt-6 space-y-4">
        {/* Success Header */}
        <div className="flex items-center gap-2 text-green-600">
          <Check className="h-5 w-5" />
          <span className="text-sm font-medium">Generation complete!</span>
        </div>

        {/* File Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="soul">SOUL.md</TabsTrigger>
            <TabsTrigger value="identity">IDENTITY.md</TabsTrigger>
            <TabsTrigger value="user">USER.md</TabsTrigger>
          </TabsList>
          <TabsContent value="soul" className="mt-3">
            <FileTabContent filename="SOUL.md" originalContent={files.soul} />
          </TabsContent>
          <TabsContent value="identity" className="mt-3">
            <FileTabContent filename="IDENTITY.md" originalContent={files.identity} />
          </TabsContent>
          <TabsContent value="user" className="mt-3">
            <FileTabContent filename="USER.md" originalContent={files.user} />
          </TabsContent>
        </Tabs>

        {/* Export Panel */}
        <ExportPanel files={files} dna={dna} />

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onRegenerate} className="gap-1.5">
            <RefreshCw className="h-3 w-3" />
            Regenerate
          </Button>
          <ProfileManager currentDna={dna} onLoadProfile={onLoadProfile} />
        </div>
      </div>
    );
  }

  // Nothing to show yet (initial state)
  return null;
}
