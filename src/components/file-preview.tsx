"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Undo2, Redo2, Eye, Code, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PreviewMode } from "@/types";

// ─── Types ───────────────────────────────────────────────────────

interface FilePreviewProps {
  filename: string;
  content: string;
  onChange: (content: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

// ─── Simple Markdown Parser ──────────────────────────────────────

function parseMarkdown(markdown: string): string {
  let html = markdown;

  // Escape HTML entities first (security)
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks (``` ... ```)
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    '<pre class="rounded-lg bg-zinc-900 p-3 my-2 overflow-x-auto"><code class="text-xs text-green-400 font-mono">$2</code></pre>'
  );

  // Inline code (`code`)
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-amber-400 font-mono">$1</code>'
  );

  // Headers (# to ######)
  html = html.replace(/^###### (.+)$/gm, '<h6 class="text-sm font-semibold mt-4 mb-1 text-foreground">$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5 class="text-sm font-semibold mt-4 mb-1 text-foreground">$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4 class="text-base font-semibold mt-4 mb-2 text-foreground">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-5 mb-2 text-foreground">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-2 text-foreground">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3 text-foreground">$1</h1>');

  // Bold (**text** or __text__)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong class="font-semibold">$1</strong>');

  // Italic (*text* or _text_) - careful not to match within words
  html = html.replace(/(?<![*])\*([^*]+)\*(?![*])/g, '<em class="italic">$1</em>');
  html = html.replace(/(?<![_])_([^_]+)_(?![_])/g, '<em class="italic">$1</em>');

  // Unordered lists (- item or * item)
  html = html.replace(
    /^[-*] (.+)$/gm,
    '<li class="ml-4 list-disc text-foreground/90">$1</li>'
  );

  // Ordered lists (1. item)
  html = html.replace(
    /^\d+\. (.+)$/gm,
    '<li class="ml-4 list-decimal text-foreground/90">$1</li>'
  );

  // Wrap consecutive list items in ul/ol (simplified)
  html = html.replace(
    /(<li class="ml-4 list-disc[^>]*>.*?<\/li>\n?)+/g,
    '<ul class="my-2 space-y-1">$&</ul>'
  );
  html = html.replace(
    /(<li class="ml-4 list-decimal[^>]*>.*?<\/li>\n?)+/g,
    '<ol class="my-2 space-y-1">$&</ol>'
  );

  // Horizontal rules (--- or ***)
  html = html.replace(/^[-*]{3,}$/gm, '<hr class="my-4 border-border" />');

  // Blockquotes (> text)
  html = html.replace(
    /^> (.+)$/gm,
    '<blockquote class="border-l-4 border-primary/30 pl-4 my-2 text-foreground/80 italic">$1</blockquote>'
  );

  // Paragraphs - wrap non-tag lines
  const lines = html.split("\n");
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    // Skip empty lines, lines starting with HTML tags, or wrapped content
    if (
      !trimmed ||
      trimmed.startsWith("<") ||
      trimmed.startsWith("</")
    ) {
      return line;
    }
    return `<p class="my-1.5 text-foreground/90">${line}</p>`;
  });

  html = processedLines.join("\n");

  // Clean up empty paragraphs
  html = html.replace(/<p class="my-1.5 text-foreground\/90"><\/p>/g, "");

  return html;
}

// ─── Mode Button ─────────────────────────────────────────────────

function ModeButton({
  mode,
  currentMode,
  onClick,
  icon: Icon,
  label,
}: {
  mode: PreviewMode;
  currentMode: PreviewMode;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Button
      variant={currentMode === mode ? "secondary" : "ghost"}
      size="sm"
      onClick={onClick}
      className={cn(
        "h-7 gap-1.5 px-2.5 text-xs",
        currentMode === mode && "bg-secondary"
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </Button>
  );
}

// ─── Main Component ──────────────────────────────────────────────

export function FilePreview({
  filename,
  content,
  onChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: FilePreviewProps) {
  const [previewMode, setPreviewMode] = useState<PreviewMode>("rendered");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success(`${filename} copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-3 py-2">
        {/* Mode toggles */}
        <div className="flex items-center gap-1">
          <ModeButton
            mode="rendered"
            currentMode={previewMode}
            onClick={() => setPreviewMode("rendered")}
            icon={Eye}
            label="Rendered"
          />
          <ModeButton
            mode="raw"
            currentMode={previewMode}
            onClick={() => setPreviewMode("raw")}
            icon={Code}
            label="Raw"
          />
          <ModeButton
            mode="edit"
            currentMode={previewMode}
            onClick={() => setPreviewMode("edit")}
            icon={Pencil}
            label="Edit"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="h-7 w-7 p-0"
            title="Undo"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="h-7 w-7 p-0"
            title="Redo"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
          <div className="mx-1 h-4 w-px bg-border" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 gap-1.5 px-2"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                <span className="text-xs text-green-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span className="text-xs">Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div className="bg-background">
        {previewMode === "rendered" && (
          <div
            className="prose prose-sm dark:prose-invert max-w-none p-4 max-h-96 overflow-auto"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
          />
        )}

        {previewMode === "raw" && (
          <pre className="max-h-96 overflow-auto p-4 text-xs text-foreground font-mono whitespace-pre-wrap">
            {content || (
              <span className="text-muted-foreground italic">No content</span>
            )}
          </pre>
        )}

        {previewMode === "edit" && (
          <Textarea
            value={content}
            onChange={handleContentChange}
            className="min-h-96 rounded-none border-0 bg-transparent font-mono text-xs resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
            placeholder="Edit content..."
          />
        )}
      </div>
    </div>
  );
}
