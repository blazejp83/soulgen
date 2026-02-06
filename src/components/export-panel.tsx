"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Link, FileJson, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AgentDNA, GeneratedFiles } from "@/types";
import { downloadZip, encodeShareableUrl, exportDnaJson } from "@/lib/export";

// ─── Types ───────────────────────────────────────────────────────

interface ExportPanelProps {
  files: GeneratedFiles;
  dna: AgentDNA;
}

// ─── Main Component ──────────────────────────────────────────────

export function ExportPanel({ files, dna }: ExportPanelProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      await downloadZip(files);
      toast.success("Downloaded agent-personality.zip");
    } catch (error) {
      toast.error("Failed to download ZIP");
      console.error("ZIP download error:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyShareLink = async () => {
    try {
      const url = encodeShareableUrl(dna);
      if (!url) {
        toast.error("Failed to generate share link");
        return;
      }
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      toast.success("Share link copied to clipboard");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleExportJson = async () => {
    try {
      const json = exportDnaJson(dna);
      await navigator.clipboard.writeText(json);
      setJsonCopied(true);
      toast.success("DNA JSON copied to clipboard");
      setTimeout(() => setJsonCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Export</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadZip}
          disabled={isDownloading}
          className="gap-1.5"
        >
          {isDownloading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          Download ZIP
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyShareLink}
          className="gap-1.5"
        >
          {linkCopied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Link className="h-3.5 w-3.5" />
              Copy Share Link
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportJson}
          className="gap-1.5"
        >
          {jsonCopied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <FileJson className="h-3.5 w-3.5" />
              Export DNA JSON
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
