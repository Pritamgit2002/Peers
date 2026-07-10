import type { MessageType } from "@/constants/message-type";

export type TMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  type: MessageType;
  content: string;
  attachmentKey: string;
  attachmentType: string;
  createdAt: string;
};
