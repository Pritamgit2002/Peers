import type { messages } from "../db/schema.js";
import { serializeMessage } from "../lib/serialize-message.js";
import type { WebSocketData, WsServerEvent } from "./types.js";
import { conversationTopic } from "./topics.js";

let server: Bun.Server<WebSocketData> | null = null;

export const setWebSocketServer = (wsServer: Bun.Server<WebSocketData>) => {
  server = wsServer;
};

export const publishToConversation = (
  conversationId: number,
  event: WsServerEvent,
) => {
  if (!server) return;

  server.publish(conversationTopic(conversationId), JSON.stringify(event));
};

export const broadcastMessageCreated = (
  message: typeof messages.$inferSelect,
) => {
  publishToConversation(message.conversationId, {
    type: "message:created",
    message: serializeMessage(message),
  });
};
