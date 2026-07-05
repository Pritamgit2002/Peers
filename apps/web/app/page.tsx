import { ChatInterface } from "@/components/chat/chat-interface";

const DEFAULT_CONVERSATION_ID = 1;
const DEFAULT_SENDER_ID = 1;

export default function Home() {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--muted),transparent_34%),linear-gradient(135deg,var(--background),var(--secondary))] p-4 sm:p-6">
      <div className="absolute inset-x-6 top-8 h-40 rounded-full bg-primary/5 blur-3xl" />
      <ChatInterface
        conversationId={DEFAULT_CONVERSATION_ID}
        senderId={DEFAULT_SENDER_ID}
      />
    </main>
  );
}
