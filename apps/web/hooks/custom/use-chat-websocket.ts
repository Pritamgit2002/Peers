"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildWebSocketUrl,
  type WsConnectionStatus,
  type WsServerEvent,
} from "@/lib/ws-events";
import type { TMessage } from "@/types/messages";

type UseChatWebSocketOptions = {
  conversationId: number;
  senderId: number;
  enabled?: boolean;
  onMessageCreated?: (message: TMessage) => void;
  onTyping?: (payload: { senderId: number; isTyping: boolean }) => void;
};

const MAX_RECONNECT_DELAY_MS = 10_000;

export const useChatWebSocket = ({
  conversationId,
  senderId,
  enabled = true,
  onMessageCreated,
  onTyping,
}: UseChatWebSocketOptions) => {
  const [status, setStatus] = useState<WsConnectionStatus>("disconnected");
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const onMessageCreatedRef = useRef(onMessageCreated);
  const onTypingRef = useRef(onTyping);

  useEffect(() => {
    onMessageCreatedRef.current = onMessageCreated;
    onTypingRef.current = onTyping;
  }, [onMessageCreated, onTyping]);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!enabled) return;

    clearReconnectTimer();

    const existingSocket = socketRef.current;
    if (
      existingSocket &&
      (existingSocket.readyState === WebSocket.OPEN ||
        existingSocket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    setStatus("connecting");

    const socket = new WebSocket(
      buildWebSocketUrl(conversationId, senderId),
    );
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      reconnectAttemptRef.current = 0;
      setStatus("connected");
    });

    socket.addEventListener("message", (event) => {
      let payload: WsServerEvent;

      try {
        payload = JSON.parse(String(event.data)) as WsServerEvent;
      } catch {
        return;
      }

      if (payload.type === "message:created") {
        onMessageCreatedRef.current?.(payload.message);
        return;
      }

      if (payload.type === "typing") {
        onTypingRef.current?.({
          senderId: payload.senderId,
          isTyping: payload.isTyping,
        });
      }
    });

    socket.addEventListener("close", () => {
      socketRef.current = null;
      setStatus("disconnected");

      if (!enabled) return;

      const delay = Math.min(
        1_000 * 2 ** reconnectAttemptRef.current,
        MAX_RECONNECT_DELAY_MS,
      );
      reconnectAttemptRef.current += 1;

      reconnectTimerRef.current = window.setTimeout(() => {
        connect();
      }, delay);
    });

    socket.addEventListener("error", () => {
      setStatus("error");
    });
  }, [clearReconnectTimer, conversationId, enabled, senderId]);

  useEffect(() => {
    if (!enabled) {
      clearReconnectTimer();
      socketRef.current?.close();
      socketRef.current = null;
      setStatus("disconnected");
      return;
    }

    connect();

    return () => {
      clearReconnectTimer();
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [clearReconnectTimer, connect, enabled]);

  const sendTyping = useCallback((isTyping: boolean) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify({ type: "typing", isTyping }));
  }, []);

  return { status, sendTyping };
};
