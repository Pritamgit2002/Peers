import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const MESSAGE_TYPE = {
  TEXT: "text",
  IMAGE: "image",
  AUDIO: "audio",
  VIDEO: "video",
  FILE: "file",
} as const;

const messageTypeValues = Object.values(MESSAGE_TYPE) as [string, ...string[]];

export const messageTypeEnum = pgEnum("message_type", messageTypeValues);

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  senderId: integer("sender_id").notNull(),
  type: messageTypeEnum("type").notNull().default(MESSAGE_TYPE.TEXT),
  content: text("content").notNull().default(""),
  attachmentKey: text("attachment_key").notNull().default(""), // e.g. "chats/123/456/uuid.jpg"
  attachmentType: text("attachment_type").notNull().default(""), // "image", "file", "audio"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
