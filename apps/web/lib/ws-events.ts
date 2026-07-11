import type { TMessage } from "@/types/messages";

export type WsServerEvent =
  | { type: "connected"; conversationId: number }
  | { type: "message:created"; message: TMessage }
  | { type: "typing"; senderId: number; isTyping: boolean };

export type WsClientEvent = { type: "typing"; isTyping: boolean };

export type WsConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export const buildWebSocketUrl = (
  conversationId: number,
  senderId: number,
) => {
  const base = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3002";
  const url = new URL("/ws", base);
  url.searchParams.set("conversation_id", String(conversationId));
  url.searchParams.set("sender_id", String(senderId));
  return url.toString();
};
