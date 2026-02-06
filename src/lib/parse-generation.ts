import type { GeneratedFiles } from "@/types";

// ─── File Delimiters ────────────────────────────────────────────

type FileKey = "soul" | "identity" | "user";

// Regex patterns for matching file delimiters
// Matches: ---FILE: SOUL.md--- (with variations in spacing/dashes)
const FILE_PATTERNS: { key: FileKey; pattern: RegExp }[] = [
  { key: "soul", pattern: /\n?-{2,}\s*FILE:\s*SOUL\.md\s*-{2,}/i },
  { key: "identity", pattern: /\n?-{2,}\s*FILE:\s*IDENTITY\.md\s*-{2,}/i },
  { key: "user", pattern: /\n?-{2,}\s*FILE:\s*USER\.md\s*-{2,}/i },
];

// ─── Generation Parser ──────────────────────────────────────────

/**
 * A stateful streaming parser that splits delimited LLM output into
 * separate SOUL.md, IDENTITY.md, and USER.md content.
 */
export class GenerationParser {
  private buffer: string = "";
  private currentFile: FileKey = "soul";
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
    // Flush any remaining buffer content
    if (this.buffer.length > 0) {
      this.files[this.currentFile] += this.buffer;
      this.buffer = "";
    }

    return {
      soul: this.files.soul.trim(),
      identity: this.files.identity.trim(),
      user: this.files.user.trim(),
    };
  }

  /**
   * Get which file is currently being streamed.
   */
  getCurrentFile(): FileKey {
    return this.currentFile;
  }

  /**
   * Reset the parser state.
   */
  reset(): void {
    this.buffer = "";
    this.currentFile = "soul";
    this.files = { soul: "", identity: "", user: "" };
  }

  // ─── Private Methods ───────────────────────────────────────────

  private processBuffer(): void {
    let processed = true;

    while (processed) {
      processed = false;

      // Look for any delimiter in the buffer
      const nextDelimiter = this.findNextDelimiter();

      if (nextDelimiter) {
        const { key, index, length } = nextDelimiter;

        // Content before the delimiter belongs to current file
        if (index > 0) {
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
      } else {
        // No complete delimiter found
        // Keep everything after the last newline in buffer (delimiter might be split)
        // Flush everything before the last newline to the current file
        const lastNewline = this.buffer.lastIndexOf("\n");

        if (lastNewline > 0) {
          // There's content before the last newline - safe to flush
          const safeContent = this.buffer.slice(0, lastNewline + 1);
          this.files[this.currentFile] += safeContent;
          this.buffer = this.buffer.slice(lastNewline + 1);
          processed = true;
        }
        // If no newline or only at start, keep accumulating in buffer
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
}
