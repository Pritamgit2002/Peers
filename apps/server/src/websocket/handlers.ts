import type { WebSocketData, WsClientEvent } from "./types.js";
import { conversationTopic } from "./topics.js";

export const websocketHandlers = {
  data: {} as WebSocketData,

  open(ws: Bun.ServerWebSocket<WebSocketData>) {
    const topic = conversationTopic(ws.data.conversationId);
    ws.subscribe(topic);

    ws.send(
      JSON.stringify({
        type: "connected",
        conversationId: ws.data.conversationId,
      }),
    );
  },

  message(ws: Bun.ServerWebSocket<WebSocketData>, rawMessage: string | Buffer) {
    let event: WsClientEvent;

    try {
      event = JSON.parse(String(rawMessage)) as WsClientEvent;
    } catch {
      return;
    }

    if (event.type !== "typing") return;

    ws.publish(
      conversationTopic(ws.data.conversationId),
      JSON.stringify({
        type: "typing",
        senderId: ws.data.senderId,
        isTyping: event.isTyping,
      }),
    );
  },

  close(ws: Bun.ServerWebSocket<WebSocketData>) {
    ws.unsubscribe(conversationTopic(ws.data.conversationId));
  },
};
