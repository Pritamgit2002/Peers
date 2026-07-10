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
  type LucideIcon,
} from "lucide-react";
import type { TMessage } from "@/types/messages";
import { MESSAGE_TYPE, type MessageType } from "@/constants/message-type";
import { getFileDownloadUrl } from "@/hooks/api/files";
import { cn } from "@/lib/utils";

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
        iconClassName: "text-rose-600",
        iconBgClassName: "bg-rose-500/15",
      };
    case "doc":
    case "docx":
    case "txt":
    case "rtf":
      return {
        icon: FileText,
        label: "Document",
        iconClassName: "text-blue-600",
        iconBgClassName: "bg-blue-500/15",
      };
    case "xls":
    case "xlsx":
    case "csv":
      return {
        icon: FileSpreadsheet,
        label: "Spreadsheet",
        iconClassName: "text-emerald-600",
        iconBgClassName: "bg-emerald-500/15",
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
        iconClassName: "text-violet-600",
        iconBgClassName: "bg-violet-500/15",
      };
    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
      return {
        icon: FileArchive,
        label: "Archive",
        iconClassName: "text-amber-600",
        iconBgClassName: "bg-amber-500/15",
      };
    default:
      return {
        icon: File,
        label: "File attachment",
        iconClassName: "text-slate-600",
        iconBgClassName: "bg-slate-500/15",
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
        iconClassName: "text-violet-600",
        iconBgClassName: "bg-violet-500/15",
      };
    case MESSAGE_TYPE.AUDIO:
      return {
        icon: Music2,
        label: "Audio",
        iconClassName: "text-fuchsia-600",
        iconBgClassName: "bg-fuchsia-500/15",
      };
    case MESSAGE_TYPE.VIDEO:
      return {
        icon: Film,
        label: "Video",
        iconClassName: "text-orange-600",
        iconBgClassName: "bg-orange-500/15",
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

  return (
    <div
      className={cn(
        "mt-2 flex min-w-0 items-center gap-3 rounded-xl border px-3 py-2.5",
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
          {extension ? `${extension} · ` : ""}
          {visual.label}
        </p>
        {downloadError ? (
          <p className="mt-1 text-[11px] text-destructive">{downloadError}</p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        aria-label={`Download ${filename}`}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-60",
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
      </button>
    </div>
  );
}

export function isAttachmentMessage(message: TMessage) {
  return Boolean(message.attachmentKey.trim());
}
