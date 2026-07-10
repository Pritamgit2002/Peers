"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Loader2, SendHorizontal } from "lucide-react";
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
  isSending?: boolean;
  disabled?: boolean;
};

export function ChatInput({
  conversationId,
  senderId,
  onSend,
  onFileUploaded,
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
            {hasPendingUploads
              ? "Uploading attachments..."
              : hasUploadErrors
                ? "Fix failed uploads before sending."
                : "Press Enter to send, Shift + Enter for a new line."}
          </p>

          <Button
            type="submit"
            size="sm"
            disabled={!canSend}
            aria-label="Send message"
            className="rounded-full px-3"
          >
            {isSending || hasPendingUploads ? (
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
