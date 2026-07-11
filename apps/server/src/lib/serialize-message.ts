import type { messages } from "../db/schema.js";
import type { SerializedMessage } from "../websocket/types.js";

export const serializeMessage = (
  message: typeof messages.$inferSelect,
): SerializedMessage => ({
  id: message.id,
  conversationId: message.conversationId,
  senderId: message.senderId,
  type: message.type,
  content: message.content,
  attachmentKey: message.attachmentKey,
  attachmentType: message.attachmentType,
  createdAt:
    message.createdAt instanceof Date
      ? message.createdAt.toISOString()
      : String(message.createdAt),
});
