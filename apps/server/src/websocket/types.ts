import type { messages } from "../db/schema.js";

export type SerializedMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  type: (typeof messages.$inferSelect)["type"];
  content: string;
  attachmentKey: string;
  attachmentType: string;
  createdAt: string;
};

export type WebSocketData = {
  conversationId: number;
  senderId: number;
};

export type WsServerEvent =
  | { type: "connected"; conversationId: number }
  | { type: "message:created"; message: SerializedMessage }
  | { type: "typing"; senderId: number; isTyping: boolean };

export type WsClientEvent = { type: "typing"; isTyping: boolean };
