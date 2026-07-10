"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Radio, ShieldCheck } from "lucide-react";
import { useGetMessages, usePostMessage } from "@/hooks/api/messages";
import type { UploadedFile } from "@/lib/tus-upload";
import type { TMessage } from "@/types/messages";
import { MESSAGE_TYPE } from "@/constants/message-type";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { demoMessages } from "./mock-messages";

type ChatInterfaceProps = {
  conversationId: number;
  senderId: number;
  useDemoData?: boolean;
};

export function ChatInterface({
  conversationId,
  senderId,
  useDemoData = false,
}: ChatInterfaceProps) {
  const queryClient = useQueryClient();
  const [optimisticMessages, setOptimisticMessages] = useState<TMessage[]>([]);

  const { data, isLoading, error, isFetching } = useGetMessages(
    { conversation_id: conversationId },
    { enabled: !useDemoData, refetchInterval: 5000 },
  );

  const { mutate: sendMessage, isPending: isSending } = usePostMessage();

  const messages = useMemo(() => {
    const sourceMessages = useDemoData ? demoMessages : (data?.messages ?? []);
    const orderedMessages = useDemoData
      ? sourceMessages
      : [...sourceMessages].reverse();

    return [...orderedMessages, ...optimisticMessages];
  }, [data?.messages, optimisticMessages, useDemoData]);

  const invalidateMessages = () => {
    if (useDemoData) return;

    queryClient.invalidateQueries({
      queryKey: ["useGetMessages", conversationId],
    });
  };

  const handleSend = (content: string, _attachments: UploadedFile[]) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    const clientId = crypto.randomUUID();
    const optimisticMessage: TMessage = {
      id: -Date.now(),
      clientId,
      conversationId,
      senderId,
      senderName: "You",
      type: MESSAGE_TYPE.TEXT,
      content: trimmedContent,
      attachmentKey: "",
      attachmentType: "",
      createdAt: new Date().toISOString(),
      status: "sending",
    };

    setOptimisticMessages((currentMessages) => [
      ...currentMessages,
      optimisticMessage,
    ]);

    if (useDemoData) {
      window.setTimeout(() => {
        setOptimisticMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.clientId === clientId
              ? { ...message, status: "sent" }
              : message,
          ),
        );
      }, 700);
      return;
    }

    sendMessage(
      {
        conversation_id: conversationId,
        sender_id: senderId,
        content: trimmedContent,
      },
      {
        onSuccess: () => {
          setOptimisticMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.clientId === clientId
                ? { ...message, status: "sent" }
                : message,
            ),
          );
          invalidateMessages();
          window.setTimeout(() => {
            setOptimisticMessages((currentMessages) =>
              currentMessages.filter((message) => message.clientId !== clientId),
            );
          }, 900);
        },
        onError: () => {
          setOptimisticMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.clientId === clientId
                ? { ...message, status: "failed" }
                : message,
            ),
          );
        },
      },
    );
  };

  return (
    <TooltipProvider>
      <section className="relative z-10 flex h-[min(820px,calc(100svh-2rem))] w-full max-w-4xl flex-col overflow-hidden rounded-4xl border border-border/80 bg-card/95 shadow-2xl shadow-primary/10 ring-1 ring-foreground/5 backdrop-blur-xl">
        <header className="bg-card/90 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="size-12 border border-border shadow-sm">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    TC
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-card bg-primary" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-semibold tracking-tight">
                    Team Conversation
                  </h1>
                  <Badge variant="muted">#{conversationId}</Badge>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Online
                  </span>
                  <span aria-hidden="true">&middot;</span>
                  <span>Support thread with shared files</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Badge
                variant="outline"
                className="bg-background/80 px-3 py-1 text-muted-foreground"
              >
                <Radio className="animate-pulse text-primary" aria-hidden="true" />
                {isFetching && !isLoading ? "Syncing" : "Live updates"}
              </Badge>
              <Badge
                variant="muted"
                className="hidden px-3 py-1 text-muted-foreground sm:inline-flex"
              >
                <ShieldCheck className="text-foreground" aria-hidden="true" />
                Secure
              </Badge>
            </div>
          </div>

          <Separator className="mt-4" />
        </header>

        <MessageList
          messages={messages}
          currentUserId={senderId}
          isLoading={!useDemoData && isLoading}
          error={useDemoData ? null : error}
        />

        <ChatInput
          conversationId={conversationId}
          senderId={senderId}
          onSend={handleSend}
          onFileUploaded={invalidateMessages}
          isSending={isSending}
        />
      </section>
    </TooltipProvider>
  );
}
