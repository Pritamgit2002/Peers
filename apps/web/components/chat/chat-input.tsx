"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Loader2, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "./file-dropzone";

type ChatInputProps = {
  onSend: (content: string, files: File[]) => void;
  isSending?: boolean;
  disabled?: boolean;
};

export function ChatInput({ onSend, isSending, disabled }: ChatInputProps) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const canSend =
    !disabled && !isSending && (content.trim().length > 0 || files.length > 0);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) return;

    onSend(content.trim(), files);
    setContent("");
    setFiles([]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) {
        onSend(content.trim(), files);
        setContent("");
        setFiles([]);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-border/80 bg-card/95 px-4 py-4 sm:px-6"
    >
      <FileDropzone
        files={files}
        onFilesChange={setFiles}
        disabled={disabled || isSending}
      />

      <div className="mt-3 rounded-2xl border border-input bg-background shadow-sm transition-all focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
        <label htmlFor="chat-message" className="sr-only">
          Message
        </label>
        <textarea
          id="chat-message"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a professional reply..."
          rows={2}
          disabled={disabled || isSending}
          className="max-h-44 min-h-20 w-[96%] mx-auto bg-red-50 resize-none rounded-lg text-sm leading-6 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />

        <div className="flex items-center justify-between gap-3 border-t border-border/70 px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Press Enter to send, Shift + Enter for a new line.
          </p>

          <Button
            type="submit"
            size="sm"
            disabled={!canSend}
            aria-label="Send message"
            className="rounded-full px-3"
          >
            {isSending ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <SendHorizontal aria-hidden="true" />
            )}
            Send
          </Button>
        </div>
      </div>
    </form>
  );
}
