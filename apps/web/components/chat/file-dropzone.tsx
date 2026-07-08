"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { AlertCircle, FileText, Paperclip, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getFileId, type FileUploadState } from "@/lib/tus-upload";

type FileDropzoneProps = {
  files: File[];
  onFilesChange: (files: File[]) => void;
  uploadStates?: Record<string, FileUploadState>;
  disabled?: boolean;
};

export function FileDropzone({
  files,
  onFilesChange,
  uploadStates = {},
  disabled,
}: FileDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      onFilesChange([...files, ...acceptedFiles]);
    },
    [files, onFilesChange],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
    disabled,
  });

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, fileIndex) => fileIndex !== index));
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        "rounded-2xl border border-dashed border-border bg-muted/30 p-3 transition-colors",
        isDragActive && "border-primary bg-primary/5",
        disabled && "opacity-60",
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-sm">
            <UploadCloud className="size-4" aria-hidden="true" />
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">
              {isDragActive ? "Drop files to attach" : "Attach supporting files"}
            </p>
            <p className="text-xs text-muted-foreground">
              Drag files here or browse from your device.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={open}
          aria-label="Attach files"
          className="rounded-full"
        >
          <Paperclip aria-hidden="true" />
          Browse
        </Button>
      </div>

      {files.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2">
          {files.map((file, index) => {
            const fileId = getFileId(file);
            const uploadState = uploadStates[fileId];
            const isUploading = uploadState?.status === "uploading";
            const isError = uploadState?.status === "error";
            const isComplete = uploadState?.status === "complete";

            return (
              <li
                key={fileId}
                className={cn(
                  "rounded-xl border border-border bg-background px-3 py-2 text-xs shadow-sm",
                  isDragActive && "ring-2 ring-primary/20",
                  isError && "border-destructive/50 bg-destructive/5",
                )}
              >
                <div className="flex items-center gap-2">
                  {isError ? (
                    <AlertCircle
                      className="size-3.5 shrink-0 text-destructive"
                      aria-hidden="true"
                    />
                  ) : (
                    <FileText
                      className="size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}

                  <span className="min-w-0 flex-1 truncate font-medium">
                    {file.name}
                  </span>

                  <span className="shrink-0 text-muted-foreground">
                    {isUploading
                      ? `${uploadState.progress}%`
                      : isComplete
                        ? "Uploaded"
                        : isError
                          ? "Failed"
                          : "Queued"}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={disabled}
                    className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="size-3" />
                  </button>
                </div>

                {isUploading ? (
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-200"
                      style={{ width: `${uploadState.progress}%` }}
                    />
                  </div>
                ) : null}

                {isError && uploadState.error ? (
                  <p className="mt-1.5 text-[11px] text-destructive">
                    {uploadState.error}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
