"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { MessageCircle, ShieldCheck } from "lucide-react";
import { useGetMessages, usePostMessage } from "@/hooks/api/messages";
import { handleFilesUpload } from "@/lib/handle-files";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";

type ChatInterfaceProps = {
  conversationId: number;
  senderId: number;
};

export function ChatInterface({
  conversationId,
  senderId,
}: ChatInterfaceProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, isFetching } = useGetMessages(
    { conversation_id: conversationId },
    { refetchInterval: 5000 },
  );

  const { mutate: sendMessage, isPending: isSending } = usePostMessage({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["useGetMessages", conversationId],
      });
    },
  });

  const messages = useMemo(() => {
    const list = data?.messages ?? [];
    return [...list].reverse();
  }, [data?.messages]);

  const handleSend = (content: string, files: File[]) => {
    if (files.length > 0) {
      handleFilesUpload(files);
    }

    sendMessage({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content || undefined,
    });
  };

  return (
    <section className="relative z-10 flex h-[min(760px,calc(100svh-2rem))] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border/80 bg-card/95 shadow-2xl shadow-primary/10 ring-1 ring-foreground/5 backdrop-blur">
      <header className="flex flex-col gap-4 border-b border-border/80 bg-card/90 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <MessageCircle className="size-5" aria-hidden="true" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight">
                Team Conversation
              </h1>
              <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                #{conversationId}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Share updates, questions, and attachments in one focused thread.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:self-auto">
          <ShieldCheck className="size-3.5 text-foreground" aria-hidden="true" />
          <span>{isFetching && !isLoading ? "Syncing..." : "Live updates"}</span>
        </div>
      </header>

      <MessageList
        messages={messages}
        currentUserId={senderId}
        isLoading={isLoading}
        error={error}
      />

      <ChatInput onSend={handleSend} isSending={isSending} />
    </section>
  );
}
