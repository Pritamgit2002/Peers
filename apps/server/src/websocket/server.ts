import { setWebSocketServer } from "./broadcaster.js";
import { websocketHandlers } from "./handlers.js";
import type { WebSocketData } from "./types.js";

const WS_PATH = "/ws";

export const startWebSocketServer = () => {
  const port = Number(process.env.WS_PORT) || 3002;
  const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:3000";

  const server = Bun.serve<WebSocketData>({
    port,
    fetch(req, bunServer) {
      const url = new URL(req.url);

      if (url.pathname !== WS_PATH) {
        return new Response("WebSocket endpoint only", { status: 404 });
      }

      const origin = req.headers.get("origin");
      if (origin && origin !== clientOrigin) {
        return new Response("Forbidden", { status: 403 });
      }

      const conversationId = Number(url.searchParams.get("conversation_id"));
      const senderId = Number(url.searchParams.get("sender_id"));

      if (!conversationId || !senderId) {
        return new Response("Missing conversation_id or sender_id", {
          status: 400,
        });
      }

      const upgraded = bunServer.upgrade(req, {
        data: { conversationId, senderId },
      });

      return upgraded
        ? undefined
        : new Response("WebSocket upgrade failed", { status: 400 });
    },
    websocket: websocketHandlers,
  });

  setWebSocketServer(server);

  return server;
};
