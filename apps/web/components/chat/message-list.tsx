"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, Inbox, MessageSquareText } from "lucide-react";
import type { TMessage } from "@/types/messages";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageBubble } from "./message-bubble";

type MessageListProps = {
  messages: TMessage[];
  currentUserId: number;
  isLoading?: boolean;
  error?: Error | null;
  typingUserIds?: number[];
};

export function MessageList({
  messages,
  currentUserId,
  isLoading,
  error,
  typingUserIds = [],
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-5 bg-muted/20 px-4 py-6 sm:px-6">
        <div className="flex items-end gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-20 w-64 rounded-2xl" />
          </div>
        </div>
        <div className="ml-auto flex max-w-[75%] flex-col items-end gap-2">
          <Skeleton className="h-16 w-72 rounded-2xl" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex items-end gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-28 w-80 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center bg-muted/20 px-4">
        <Card className="max-w-sm border-destructive/20 bg-background p-5 text-center">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-5" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm font-semibold text-foreground">
            Failed to load messages
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Please check your connection and try again in a moment.
          </p>
        </Card>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center bg-muted/20 px-6 text-center">
        <Card className="max-w-md bg-background/80 p-6 shadow-lg shadow-primary/5">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-border bg-muted/50 shadow-sm">
            <Inbox
              className="size-7 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight">
            Start the conversation
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Send a concise update, attach useful context, or ask a question to
            get the thread moving.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 bg-muted/20 overflow-y-auto">
      <div className="flex min-h-full flex-col gap-1 px-4 py-5 sm:px-6">
        {messages.map((message, index) => {
          const previousMessage = messages[index - 1];
          const nextMessage = messages[index + 1];
          const isOwnMessage = message.senderId === currentUserId;
          const startsGroup =
            !previousMessage || previousMessage.senderId !== message.senderId;
          const endsGroup =
            !nextMessage || nextMessage.senderId !== message.senderId;

          return (
            <MessageBubble
              key={message.clientId ?? message.id}
              message={message}
              isOwnMessage={isOwnMessage}
              startsGroup={startsGroup}
              endsGroup={endsGroup}
            />
          );
        })}

        <div className="mt-4 flex items-center gap-3 px-1 text-muted-foreground">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background shadow-sm">
            <MessageSquareText className="size-4" aria-hidden="true" />
          </div>
          {typingUserIds.length > 0 ? <TypingIndicator /> : null}
        </div>

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

function TypingIndicator() {
  return (
    <div className="rounded-2xl rounded-bl-md border border-border bg-background px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1.5" aria-label="Someone is typing">
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
      </div>
    </div>
  );
}
