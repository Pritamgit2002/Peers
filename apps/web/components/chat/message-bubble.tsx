import type { TMessage } from "@/types/messages";
import { MESSAGE_TYPE } from "@/constants/message-type";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  isAttachmentMessage,
  MessageAttachment,
} from "./message-attachment";
import { Check, Clock3, Loader2, Thermometer, Timer, Users } from "lucide-react";

type MessageBubbleProps = {
  message: TMessage;
  isOwnMessage: boolean;
  startsGroup: boolean;
  endsGroup: boolean;
};

function shouldShowTextContent(message: TMessage) {
  const content = message.content.trim();

  if (!content) {
    return false;
  }

  if (!message.attachmentKey.trim()) {
    return true;
  }

  const messageType = message.type || MESSAGE_TYPE.TEXT;
  return messageType === MESSAGE_TYPE.TEXT;
}

function formatRelativeTime(date: Date) {
  const diffInSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absoluteDiff = Math.abs(diffInSeconds);

  if (absoluteDiff < 60) return "Just now";
  if (absoluteDiff < 3600) return `${Math.round(absoluteDiff / 60)}m ago`;
  if (absoluteDiff < 86400) return `${Math.round(absoluteDiff / 3600)}h ago`;

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getInitials(message: TMessage) {
  const name = message.senderName ?? `Sender ${message.senderId}`;
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function MessageBubble({
  message,
  isOwnMessage,
  startsGroup,
  endsGroup,
}: MessageBubbleProps) {
  const showAttachment = isAttachmentMessage(message);
  const showText = shouldShowTextContent(message);
  const createdAt = new Date(message.createdAt);
  const sentAt = createdAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const fullSentAt = createdAt.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const senderName = message.senderName ?? `Sender ${message.senderId}`;

  return (
    <div
      className={cn(
        "group flex w-full items-end gap-3 px-1 animate-in fade-in slide-in-from-bottom-1 duration-200",
        isOwnMessage ? "justify-end" : "justify-start",
        startsGroup ? "mt-4" : "mt-1",
      )}
    >
      {!isOwnMessage ? (
        startsGroup ? (
          <Avatar className="size-9 border border-border shadow-sm">
            <AvatarFallback className="bg-background text-xs text-foreground">
              {getInitials(message)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="size-9 shrink-0" />
        )
      ) : null}

      <div
        className={cn(
          "flex min-w-0 max-w-[88%] flex-col sm:max-w-[68%]",
          isOwnMessage ? "items-end" : "items-start",
        )}
      >
        {!isOwnMessage && startsGroup ? (
          <div className="mb-1.5 flex items-center gap-2 px-1">
            <p className="text-xs font-semibold text-foreground">{senderName}</p>
            <span className="size-1 rounded-full bg-primary" />
            <p className="text-xs text-muted-foreground">
              {message.senderRole ?? "Online"}
            </p>
          </div>
        ) : null}

        <div
          className={cn(
            "min-w-0 rounded-2xl border px-4 py-3 text-sm shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md",
            isOwnMessage
              ? "rounded-br-md border-primary bg-primary text-primary-foreground"
              : "rounded-bl-md border-border bg-background text-foreground",
            !startsGroup && !isOwnMessage && "rounded-tl-md",
            !startsGroup && isOwnMessage && "rounded-tr-md",
            message.status === "sending" && "opacity-70",
            message.status === "failed" && "border-destructive/40",
          )}
        >
          {showText ? (
            <p className="min-w-0 whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </p>
          ) : null}

          {showAttachment ? (
            <MessageAttachment message={message} isOwnMessage={isOwnMessage} />
          ) : null}
        </div>

        {!isOwnMessage && startsGroup && message.senderRole ? (
          <RichThreadCard />
        ) : null}

        {endsGroup ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "mt-1.5 flex items-center gap-1 px-1 text-[11px] font-medium text-muted-foreground",
                  isOwnMessage && "text-primary/70 dark:text-primary-foreground/70",
                )}
              >
                <time dateTime={message.createdAt}>
                  {formatRelativeTime(createdAt)}
                </time>
                <span aria-hidden="true">&middot;</span>
                <span>{sentAt}</span>
                {isOwnMessage ? <MessageStatus status={message.status} /> : null}
              </div>
            </TooltipTrigger>
            <TooltipContent>{fullSentAt}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
}

function MessageStatus({ status = "sent" }: { status?: TMessage["status"] }) {
  if (status === "sending") {
    return <Loader2 className="size-3 animate-spin" aria-hidden="true" />;
  }

  if (status === "failed") {
    return <Clock3 className="size-3 text-destructive" aria-hidden="true" />;
  }

  return <Check className="size-3" aria-hidden="true" />;
}

function RichThreadCard() {
  const stats = [
    { label: "Files shared", value: "12", icon: Users },
    { label: "Avg response", value: "8m", icon: Timer },
    { label: "Priority", value: "Warm", icon: Thermometer },
  ];

  return (
    <Card className="mt-2 w-full max-w-sm overflow-hidden bg-background/90 p-3 shadow-md shadow-primary/5">
      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-muted/40 p-2"
            >
              <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
              <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2">
        {["Brief", "Plan", "Notes", "+4 more"].map((label, index) => (
          <div
            key={label}
            className="relative flex aspect-square items-end overflow-hidden rounded-xl border border-border bg-muted p-2"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--background),transparent_58%)]" />
            {index === 3 ? (
              <div className="absolute inset-0 flex items-center justify-center bg-primary/80 text-xs font-semibold text-primary-foreground">
                {label}
              </div>
            ) : (
              <span className="relative text-[10px] font-medium text-muted-foreground">
                {label}
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
