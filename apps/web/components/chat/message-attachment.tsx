"use client";

import { useState } from "react";
import {
  Download,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Film,
  ImageIcon,
  Loader2,
  Music2,
  Play,
  type LucideIcon,
} from "lucide-react";
import type { TMessage } from "@/types/messages";
import { MESSAGE_TYPE, type MessageType } from "@/constants/message-type";
import { getFileDownloadUrl } from "@/hooks/api/files";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type MessageAttachmentProps = {
  message: TMessage;
  isOwnMessage: boolean;
};

type AttachmentVisual = {
  icon: LucideIcon;
  label: string;
  iconClassName: string;
  iconBgClassName: string;
};

function getFilename(message: TMessage) {
  if (message.content.trim()) {
    return message.content.trim();
  }

  const key = message.attachmentKey.trim();
  if (key) {
    return key.split("/").pop() ?? "Attachment";
  }

  return "Attachment";
}

function getExtension(filename: string) {
  const lastDot = filename.lastIndexOf(".");

  if (lastDot <= 0 || lastDot === filename.length - 1) {
    return "";
  }

  return filename.slice(lastDot + 1).toLowerCase();
}

function resolveMessageType(message: TMessage): MessageType {
  if (message.type) {
    return message.type;
  }

  const attachmentType = message.attachmentType.toLowerCase();

  if (
    attachmentType === MESSAGE_TYPE.IMAGE ||
    attachmentType === MESSAGE_TYPE.AUDIO ||
    attachmentType === MESSAGE_TYPE.VIDEO ||
    attachmentType === MESSAGE_TYPE.FILE
  ) {
    return attachmentType;
  }

  return message.attachmentKey ? MESSAGE_TYPE.FILE : MESSAGE_TYPE.TEXT;
}

function getFileVisual(extension: string): AttachmentVisual {
  switch (extension) {
    case "pdf":
      return {
        icon: FileText,
        label: "PDF document",
        iconClassName: "text-destructive",
        iconBgClassName: "bg-destructive/10",
      };
    case "doc":
    case "docx":
    case "txt":
    case "rtf":
      return {
        icon: FileText,
        label: "Document",
        iconClassName: "text-foreground",
        iconBgClassName: "bg-muted",
      };
    case "xls":
    case "xlsx":
    case "csv":
      return {
        icon: FileSpreadsheet,
        label: "Spreadsheet",
        iconClassName: "text-primary",
        iconBgClassName: "bg-primary/10",
      };
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
    case "svg":
      return {
        icon: FileImage,
        label: "Image file",
        iconClassName: "text-primary",
        iconBgClassName: "bg-primary/10",
      };
    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
      return {
        icon: FileArchive,
        label: "Archive",
        iconClassName: "text-muted-foreground",
        iconBgClassName: "bg-muted",
      };
    default:
      return {
        icon: File,
        label: "File attachment",
        iconClassName: "text-muted-foreground",
        iconBgClassName: "bg-muted",
      };
  }
}

function getAttachmentVisual(message: TMessage): AttachmentVisual {
  const messageType = resolveMessageType(message);
  const filename = getFilename(message);
  const extension = getExtension(filename);

  switch (messageType) {
    case MESSAGE_TYPE.IMAGE:
      return {
        icon: ImageIcon,
        label: "Image",
        iconClassName: "text-primary",
        iconBgClassName: "bg-primary/10",
      };
    case MESSAGE_TYPE.AUDIO:
      return {
        icon: Music2,
        label: "Audio",
        iconClassName: "text-primary",
        iconBgClassName: "bg-primary/10",
      };
    case MESSAGE_TYPE.VIDEO:
      return {
        icon: Film,
        label: "Video",
        iconClassName: "text-primary",
        iconBgClassName: "bg-primary/10",
      };
    case MESSAGE_TYPE.FILE:
    default:
      return getFileVisual(extension);
  }
}

export function MessageAttachment({
  message,
  isOwnMessage,
}: MessageAttachmentProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const filename = getFilename(message);
  const extension = getExtension(filename);
  const visual = getAttachmentVisual(message);
  const messageType = resolveMessageType(message);
  const Icon = visual.icon;

  const handleDownload = async () => {
    if (isDownloading) {
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);

    try {
      const { url } = await getFileDownloadUrl({
        message_id: message.id,
        conversation_id: message.conversationId,
      });

      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setDownloadError("Download failed. Try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (messageType === MESSAGE_TYPE.AUDIO) {
    return (
      <div
        className={cn(
          "mt-2 min-w-64 rounded-xl border p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
          isOwnMessage
            ? "border-primary-foreground/20 bg-primary-foreground/10"
            : "border-border bg-muted/40",
        )}
      >
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="icon-sm"
            variant={isOwnMessage ? "secondary" : "default"}
            className="rounded-full"
            aria-label={`Play ${filename}`}
          >
            <Play className="size-3.5 fill-current" aria-hidden="true" />
          </Button>
          <div className="flex h-10 flex-1 items-center gap-1" aria-hidden="true">
            {[28, 44, 34, 58, 40, 66, 36, 52, 30, 46, 62, 38].map(
              (height, index) => (
                <span
                  key={`${height}-${index}`}
                  className={cn(
                    "w-1 rounded-full",
                    isOwnMessage ? "bg-primary-foreground/70" : "bg-primary/70",
                  )}
                  style={{ height: `${height}%` }}
                />
              ),
            )}
          </div>
          <span
            className={cn(
              "text-xs font-medium",
              isOwnMessage
                ? "text-primary-foreground/75"
                : "text-muted-foreground",
            )}
          >
            0:24
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mt-2 flex min-w-0 items-center gap-3 rounded-xl border px-3 py-2.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        isOwnMessage
          ? "border-primary-foreground/20 bg-primary-foreground/10"
          : "border-border bg-muted/50",
      )}
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          isOwnMessage ? "bg-primary-foreground/15" : visual.iconBgClassName,
        )}
      >
        <Icon
          className={cn(
            "size-5",
            isOwnMessage ? "text-primary-foreground" : visual.iconClassName,
          )}
          aria-hidden="true"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-medium leading-tight",
            isOwnMessage ? "text-primary-foreground" : "text-foreground",
          )}
          title={filename}
        >
          {filename}
        </p>
        <p
          className={cn(
            "mt-0.5 text-[11px] font-medium uppercase tracking-wide",
            isOwnMessage
              ? "text-primary-foreground/70"
              : "text-muted-foreground",
          )}
        >
          {extension ? `${extension} / ` : ""}
          {visual.label}
          {message.attachmentSize
            ? ` / ${formatFileSize(message.attachmentSize)}`
            : ""}
        </p>
        {downloadError ? (
          <p className="mt-1 text-[11px] text-destructive">{downloadError}</p>
        ) : null}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleDownload}
        disabled={isDownloading}
        aria-label={`Download ${filename}`}
        className={cn(
          "shrink-0 rounded-lg border opacity-0 transition-all duration-200 group-hover:opacity-100 focus-visible:opacity-100 disabled:cursor-not-allowed disabled:opacity-60",
          isOwnMessage
            ? "border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/15"
            : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        {isDownloading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Download className="size-4" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}

export function isAttachmentMessage(message: TMessage) {
  return Boolean(message.attachmentKey.trim());
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
