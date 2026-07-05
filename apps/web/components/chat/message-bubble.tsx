import { FileText } from "lucide-react";
import type { TMessage } from "@/types/messages";
import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  message: TMessage;
  isOwnMessage: boolean;
};

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const hasAttachment = Boolean(message.attachmentKey);
  const sentAt = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "group flex w-full items-end gap-2 px-1",
        isOwnMessage ? "justify-end" : "justify-start",
      )}
    >
      {!isOwnMessage ? (
        <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-sm border border-border bg-background text-xs font-semibold text-muted-foreground shadow-sm">
          {message.senderId}
        </div>
      ) : null}

      <div
        className={cn(
          "flex min-w-0 max-w-[85%] flex-col rounded-sm border px-4 py-2.5 text-sm shadow-sm transition-shadow group-hover:shadow-md sm:max-w-[65%]",
          isOwnMessage
            ? "rounded-sm border-primary bg-primary text-primary-foreground"
            : "rounded-sm border-border bg-background text-foreground",
        )}
      >
        {!isOwnMessage ? (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Sender {message.senderId}
          </p>
        ) : null}

        {message.content ? (
          <p className="min-w-0 whitespace-pre-wrap wrap-break-word leading-relaxed">
            {message.content}
          </p>
        ) : null}

        {hasAttachment ? (
          <div
            className={cn(
              "mt-2 flex min-w-0 items-center gap-2 rounded-sm border px-3 py-2 text-xs",
              isOwnMessage
                ? "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground/90"
                : "border-border bg-muted/60 text-muted-foreground",
            )}
          >
            <FileText className="size-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 truncate">
              {message.attachmentType || "Attached file"}
            </span>
          </div>
        ) : null}

        <time
          className={cn(
            "mt-1 block self-end text-[10px] font-medium",
            isOwnMessage
              ? "text-primary-foreground/70"
              : "text-muted-foreground",
          )}
          dateTime={message.createdAt}
        >
          {sentAt}
        </time>
      </div>
    </div>
  );
}
