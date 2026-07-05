export type TMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  attachmentKey: string;
  attachmentType: string;
  createdAt: string;
};
