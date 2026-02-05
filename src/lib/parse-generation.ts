import type { GeneratedFiles } from "@/types";

// ─── File Delimiters ────────────────────────────────────────────

const FILE_DELIMITERS = {
  soul: "---FILE: SOUL.md---",
  identity: "---FILE: IDENTITY.md---",
  user: "---FILE: USER.md---",
} as const;

type FileKey = keyof typeof FILE_DELIMITERS;

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

        // Skip leading newline after delimiter if present
        if (this.buffer.startsWith("\n")) {
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
      }
    }
  }

  private findNextDelimiter(): { key: FileKey; index: number; length: number } | null {
    let result: { key: FileKey; index: number; length: number } | null = null;

    for (const [key, delimiter] of Object.entries(FILE_DELIMITERS)) {
      const index = this.buffer.indexOf(delimiter);
      if (index !== -1) {
        if (!result || index < result.index) {
          result = { key: key as FileKey, index, length: delimiter.length };
        }
      }
    }

    return result;
  }

  private hasPartialDelimiter(): number {
    // Check if buffer ends with a partial "---FILE:" or similar
    // We need to keep enough chars to potentially match any delimiter
    const marker = "---FILE:";

    for (let i = 1; i < marker.length; i++) {
      const potentialPartial = this.buffer.slice(-i);
      if (marker.startsWith(potentialPartial)) {
        return i;
      }
    }

    return 0;
  }
}
