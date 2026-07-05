"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import type { TMessage } from "@/types/messages";
import { MessageBubble } from "./message-bubble";

type MessageListProps = {
  messages: TMessage[];
  currentUserId: number;
  isLoading?: boolean;
  error?: Error | null;
};

export function MessageList({
  messages,
  currentUserId,
  isLoading,
  error,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-muted/20 px-4 text-center text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-foreground" aria-hidden="true" />
        <div>
          <p className="font-medium text-foreground">Loading conversation</p>
          <p className="mt-1 text-xs">Fetching the latest messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center bg-muted/20 px-4">
        <div className="max-w-sm rounded-2xl border border-destructive/20 bg-background p-5 text-center shadow-sm">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="size-5" aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm font-semibold text-foreground">
            Failed to load messages
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Please check your connection and try again in a moment.
          </p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center bg-muted/20 px-6 text-center">
        <div className="max-w-md">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-border bg-background shadow-sm">
            <Inbox className="size-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight">
            Start the conversation
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Send a concise update, attach useful context, or ask a question to
            get the thread moving.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-muted/20 px-4 py-5 sm:px-6">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwnMessage={message.senderId === currentUserId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
