"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Paperclip, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type FileDropzoneProps = {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
};

export function FileDropzone({
  files,
  onFilesChange,
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
        <ul className="mt-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.lastModified}-${index}`}
              className={cn(
                "flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs shadow-sm",
                isDragActive && "ring-2 ring-primary/20",
              )}
            >
              <FileText className="size-3.5 text-muted-foreground" aria-hidden="true" />
              <span className="max-w-[180px] truncate font-medium">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={`Remove ${file.name}`}
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
