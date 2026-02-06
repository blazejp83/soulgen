import type { GeneratedFiles } from "@/types";

// ─── File Delimiters ────────────────────────────────────────────

type FileKey = "soul" | "identity" | "user";

// Regex patterns for more robust matching
// Matches variations like:
// ---FILE: SOUL.md---
// --- FILE: SOUL.md ---
// ---FILE:SOUL.md---
// **---FILE: SOUL.md---**
const FILE_PATTERNS: { key: FileKey; pattern: RegExp }[] = [
  { key: "soul", pattern: /\*{0,2}-{2,}\s*FILE:\s*SOUL\.md\s*-{2,}\*{0,2}/i },
  { key: "identity", pattern: /\*{0,2}-{2,}\s*FILE:\s*IDENTITY\.md\s*-{2,}\*{0,2}/i },
  { key: "user", pattern: /\*{0,2}-{2,}\s*FILE:\s*USER\.md\s*-{2,}\*{0,2}/i },
];

// ─── Generation Parser ──────────────────────────────────────────

/**
 * A stateful streaming parser that splits delimited LLM output into
 * separate SOUL.md, IDENTITY.md, and USER.md content.
 *
 * Usage:
 *   const parser = new GenerationParser();
 *   for await (const chunk of stream) {
 *     const files = parser.push(chunk);
 *     // files has current state of all three files
 *   }
 *   const final = parser.getResult();
 */
export class GenerationParser {
  private buffer: string = "";
  private currentFile: FileKey | null = null;
  private files: GeneratedFiles = { soul: "", identity: "", user: "" };

  /**
   * Feed a new text chunk from the stream.
   * Returns the current state of all files (for real-time UI updates).
   */
  push(chunk: string): GeneratedFiles {
    this.buffer += chunk;
    this.processBuffer();
    return { ...this.files };
  }

  /**
   * Get the final parsed result with trimmed content.
   */
  getResult(): GeneratedFiles {
    // Process any remaining buffer
    this.processBuffer();

    return {
      soul: this.files.soul.trim(),
      identity: this.files.identity.trim(),
      user: this.files.user.trim(),
    };
  }

  /**
   * Get which file is currently being streamed.
   */
  getCurrentFile(): FileKey | null {
    return this.currentFile;
  }

  /**
   * Reset the parser state.
   */
  reset(): void {
    this.buffer = "";
    this.currentFile = null;
    this.files = { soul: "", identity: "", user: "" };
  }

  // ─── Private Methods ───────────────────────────────────────────

  private processBuffer(): void {
    // Keep processing as long as we can find delimiters or content
    let processed = true;
    while (processed) {
      processed = false;

      // Look for any delimiter in the buffer
      const nextDelimiter = this.findNextDelimiter();

      if (nextDelimiter) {
        const { key, index, length } = nextDelimiter;

        // Content before the delimiter belongs to current file
        if (index > 0 && this.currentFile) {
          this.files[this.currentFile] += this.buffer.slice(0, index);
        }

        // Switch to new file
        this.currentFile = key;

        // Remove processed content and delimiter from buffer
        this.buffer = this.buffer.slice(index + length);

        // Skip leading newlines after delimiter
        while (this.buffer.startsWith("\n")) {
          this.buffer = this.buffer.slice(1);
        }

        processed = true;
      } else if (this.currentFile) {
        // No delimiter found - check if we might have a partial delimiter at end
        const partialDelimiter = this.hasPartialDelimiter();

        if (partialDelimiter > 0) {
          // Keep the potential partial delimiter in buffer, process the rest
          const safeContent = this.buffer.slice(0, -partialDelimiter);
          if (safeContent.length > 0) {
            this.files[this.currentFile] += safeContent;
            this.buffer = this.buffer.slice(-partialDelimiter);
            processed = true;
          }
        } else {
          // No partial delimiter - all content belongs to current file
          if (this.buffer.length > 0) {
            this.files[this.currentFile] += this.buffer;
            this.buffer = "";
            processed = true;
          }
        }
      } else {
        // No current file yet - look for first delimiter
        // If no delimiter found, keep accumulating in buffer
        // This handles preamble text before first file delimiter
        break;
      }
    }
  }

  private findNextDelimiter(): { key: FileKey; index: number; length: number } | null {
    let result: { key: FileKey; index: number; length: number } | null = null;

    for (const { key, pattern } of FILE_PATTERNS) {
      const match = pattern.exec(this.buffer);
      if (match) {
        const index = match.index;
        const length = match[0].length;
        if (!result || index < result.index) {
          result = { key, index, length };
        }
      }
    }

    return result;
  }

  private hasPartialDelimiter(): number {
    // Check if buffer ends with a partial "---FILE:" or similar
    // We need to keep enough chars to potentially match any delimiter
    // Max delimiter length is around 25 chars, so check up to 30
    const maxCheck = Math.min(30, this.buffer.length);

    for (let i = 1; i <= maxCheck; i++) {
      const potentialPartial = this.buffer.slice(-i);
      // Check if this could be the start of any delimiter pattern
      if (
        potentialPartial.match(/^-+$/) ||
        potentialPartial.match(/^-+\s*$/) ||
        potentialPartial.match(/^-+\s*F/i) ||
        potentialPartial.match(/^-+\s*FILE/i) ||
        potentialPartial.match(/^-+\s*FILE:/i) ||
        potentialPartial.match(/^-+\s*FILE:\s*/i) ||
        potentialPartial.match(/^-+\s*FILE:\s*[A-Z]/i) ||
        potentialPartial.match(/^\*+-+/i) ||
        potentialPartial.match(/^\*+$/i)
      ) {
        return i;
      }
    }

    return 0;
  }
}
