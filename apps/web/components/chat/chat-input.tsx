"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Loader2, Paperclip, SendHorizontal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createTusUpload,
  getFileId,
  type FileUploadState,
  type UploadedFile,
} from "@/lib/tus-upload";
import { FileDropzone } from "./file-dropzone";
import type * as tus from "tus-js-client";

type ChatInputProps = {
  conversationId: number;
  senderId: number;
  onSend: (content: string, attachments: UploadedFile[]) => void;
  onFileUploaded?: () => void;
  onTyping?: (isTyping: boolean) => void;
  isSending?: boolean;
  disabled?: boolean;
};

export function ChatInput({
  conversationId,
  senderId,
  onSend,
  onFileUploaded,
  onTyping,
  isSending,
  disabled,
}: ChatInputProps) {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStates, setUploadStates] = useState<
    Record<string, FileUploadState>
  >({});

  const uploadsRef = useRef<Map<string, tus.Upload>>(new Map());
  const completedUploadsRef = useRef<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);

  const hasPendingUploads = files.some((file) => {
    const state = uploadStates[getFileId(file)];
    return !state || state.status === "uploading";
  });

  const hasUploadErrors = files.some(
    (file) => uploadStates[getFileId(file)]?.status === "error",
  );

  const canSend =
    !disabled &&
    !isSending &&
    !hasPendingUploads &&
    !hasUploadErrors &&
    (content.trim().length > 0 || files.length > 0);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 176)}px`;
  }, [content]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current !== null) {
        window.clearTimeout(typingTimeoutRef.current);
      }

      if (isTypingRef.current) {
        onTyping?.(false);
      }
    };
  }, [onTyping]);

  const handleContentChange = (value: string) => {
    setContent(value);

    if (!onTyping) return;

    if (value.trim().length > 0) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        onTyping(true);
      }

      if (typingTimeoutRef.current !== null) {
        window.clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = window.setTimeout(() => {
        isTypingRef.current = false;
        onTyping(false);
      }, 1_200);
      return;
    }

    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTyping(false);
    }
  };

  const startUpload = useCallback(
    (file: File) => {
      const fileId = getFileId(file);

      if (uploadsRef.current.has(fileId)) {
        return;
      }

      setUploadStates((previous) => ({
        ...previous,
        [fileId]: { status: "uploading", progress: 0 },
      }));

      const upload = createTusUpload(file, conversationId, senderId, {
        onProgress(progress) {
          setUploadStates((previous) => ({
            ...previous,
            [fileId]: { status: "uploading", progress },
          }));
        },
        onSuccess(result) {
          uploadsRef.current.delete(fileId);
          completedUploadsRef.current.add(fileId);
          setUploadStates((previous) => ({
            ...previous,
            [fileId]: { status: "complete", progress: 100, result },
          }));
          onFileUploaded?.();
        },
        onError(error) {
          uploadsRef.current.delete(fileId);
          setUploadStates((previous) => ({
            ...previous,
            [fileId]: {
              status: "error",
              progress: 0,
              error: error.message || "Upload failed",
            },
          }));
        },
      });

      uploadsRef.current.set(fileId, upload);
    },
    [conversationId, senderId, onFileUploaded],
  );

  useEffect(() => {
    const activeFileIds = new Set(files.map(getFileId));

    for (const [fileId, upload] of uploadsRef.current.entries()) {
      if (!activeFileIds.has(fileId)) {
        upload.abort(true);
        uploadsRef.current.delete(fileId);
        completedUploadsRef.current.delete(fileId);
        setUploadStates((previous) => {
          const next = { ...previous };
          delete next[fileId];
          return next;
        });
      }
    }

    for (const file of files) {
      const fileId = getFileId(file);

      if (
        !uploadsRef.current.has(fileId) &&
        !completedUploadsRef.current.has(fileId)
      ) {
        startUpload(file);
      }
    }
  }, [files, startUpload]);

  useEffect(() => {
    return () => {
      for (const upload of uploadsRef.current.values()) {
        upload.abort(true);
      }
      uploadsRef.current.clear();
    };
  }, []);

  const resetForm = () => {
    for (const upload of uploadsRef.current.values()) {
      upload.abort(true);
    }
    uploadsRef.current.clear();
    completedUploadsRef.current.clear();
    setContent("");
    setFiles([]);
    setUploadStates({});
  };

  const getAttachments = () =>
    files
      .map((file) => uploadStates[getFileId(file)]?.result)
      .filter((attachment): attachment is UploadedFile => Boolean(attachment));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) return;

    onSend(content.trim(), getAttachments());
    resetForm();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) {
        onSend(content.trim(), getAttachments());
        resetForm();
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
        uploadStates={uploadStates}
        disabled={disabled || isSending}
      />

      <div className="mt-3 rounded-3xl border border-input bg-background/95 p-2 shadow-lg shadow-primary/5 transition-all duration-200 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/25">
        <label htmlFor="chat-message" className="sr-only">
          Message
        </label>
        <div className="flex items-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled || isSending}
            className="mb-1 shrink-0 rounded-full text-muted-foreground"
            aria-label="Attach files"
            onClick={() => {
              document
                .querySelector<HTMLInputElement>("[data-chat-file-input]")
                ?.click();
            }}
          >
            <Paperclip aria-hidden="true" />
          </Button>

          <textarea
            ref={textareaRef}
            id="chat-message"
            value={content}
            onChange={(event) => handleContentChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a professional reply..."
            rows={1}
            disabled={disabled || isSending}
            maxLength={1200}
            className="max-h-44 min-h-11 flex-1 resize-none bg-transparent px-1 py-3 text-sm leading-6 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />

          <Button
            type="submit"
            size="icon-lg"
            disabled={!canSend}
            aria-label="Send message"
            className="mb-0.5 rounded-full shadow-md shadow-primary/15 transition-transform duration-150 active:scale-95"
          >
            {isSending || hasPendingUploads ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <SendHorizontal aria-hidden="true" />
            )}
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/70 px-3 py-2">
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {hasPendingUploads
              ? "Uploading attachments..."
              : hasUploadErrors
                ? "Fix failed uploads before sending."
                : "Enter to send, Shift + Enter for a new line."}
          </p>

          <p className="text-xs tabular-nums text-muted-foreground">
            {content.length}/1200
          </p>
        </div>
      </div>
    </form>
  );
}
